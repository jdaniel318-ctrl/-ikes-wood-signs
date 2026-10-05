/* Run: node VERIFY_IRONBOUND.cjs [release-folder]. No live requests or credentials. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||__dirname);
const transport=fs.readFileSync(path.join(root,'fleet_supabase.js'),'utf8');
const begin='// IRONBOUND_COORDINATOR_BEGIN',end='// IRONBOUND_COORDINATOR_END';
function coordinator(rpc,onState){
 assert.ok(transport.includes(begin),'server-first coordinator must exist in the actual transport');
 const source=transport.split(begin)[1].split(end)[0];
 const c={window:{},structuredClone,console};vm.createContext(c);vm.runInContext(source,c);
 return c.window.BlackFlagCommissioning.create({rpc},onState);
}
const voyage='11111111-1111-4111-8111-111111111111',operation='22222222-2222-4222-8222-222222222222';
function evidence(state='prepared',overrides={}) {
 const created=state==='verified_created';
 return {voyage_id:voyage,operation_id:operation,command_state:state,intended_project_id:'bf-p-unit-test',preview_fingerprint:'fingerprint',receipt:{operation_id:operation,voyage_id:voyage,intended_project_id:'bf-p-unit-test',preview_fingerprint:'fingerprint',command_state:state,detail:{protocol:'server-first-v1',operation_closed:state==='verified_not_created'}},canonical_vessel_exists:created,canonical_matches_operation:created,blueprint_verified:created,vessel:created?{id:'vessel-uuid',project_id:'bf-p-unit-test',namespace:'bf-p-unit-test',lifecycle_state:'commissioning'}:null,project:created?{id:'bf-p-unit-test',namespace:'bf-p-unit-test',published:false}:null,...overrides};
}
function server(opts={}){
 let state='prepared';const calls=[];
 const rpc=async(name,body)=>{
  calls.push({name,body});
  if(name==='prepare_commissioning_operation') {if(opts.prepareError)throw Error('lost prepare response');return evidence();}
  if(name==='commit_commissioning_operation') {state='verified_created';if(opts.commitWait)await opts.commitWait;if(opts.commitError)throw Error('lost response');return evidence(state);}
  if(name==='reconcile_commissioning_receipt') {state=opts.commitError?'verified_created':'verified_not_created';return evidence(state);}
  if(name==='read_commissioning_operation') {if(opts.readError&&state==='verified_created')throw Error('offline read');return evidence(state,opts.readOverride||{});}
  throw Error('unexpected RPC '+name);
 };
 return {rpc,calls};
}
test('actual commission handler routes through server-first coordinator, not browser registry',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const body=app.split('async function commissionProject(){')[1].split('async function openProjectEngineControl')[0];
 assert.ok(body.includes('commissionCoordinator().commit()'),'commissionProject must invoke the server-first writer');
 assert.ok(!body.includes('saveCompanies('),'browser registry must never be the commissioning writer');
 assert.ok(!body.includes('readCanonicalProjectRegistryStrict('),'browser store must never decide server outcome');
 assert.ok(!body.includes('recordCommissionReceiptServer('),'client must never manufacture terminal receipts');
});
test('prepare -> independent read -> one commit -> independent canonical proof',async()=>{
 const s=server(),c=coordinator(s.rpc);await c.prepare(voyage,'draft-fp');assert.equal(c.snapshot().phase,'prepared');
 const r=await c.commit();assert.equal(r.command_state,'verified_created');assert.equal(c.snapshot().phase,'verified');
 assert.deepEqual(s.calls.map(x=>x.name),['prepare_commissioning_operation','read_commissioning_operation','commit_commissioning_operation','read_commissioning_operation']);
});
test('double-tap cannot send a second mutation while first is unresolved',async()=>{
 let release;const wait=new Promise(r=>release=r),s=server({commitWait:wait}),c=coordinator(s.rpc);await c.prepare(voyage,'draft-fp');
 const first=c.commit();await assert.rejects(c.commit());release();await first;
 assert.equal(s.calls.filter(x=>x.name==='commit_commissioning_operation').length,1);
});
test('lost commit response stays uncertain and never retries, even on a second tap',async()=>{
 const s=server({commitError:true}),c=coordinator(s.rpc);await c.prepare(voyage,'draft-fp');await assert.rejects(c.commit());
 assert.equal(c.snapshot().phase,'uncertain');await assert.rejects(c.commit());
 assert.equal(s.calls.filter(x=>x.name==='commit_commissioning_operation').length,1);
 await c.reconcile(voyage,operation);assert.equal(c.snapshot().phase,'verified');
 assert.equal(s.calls.filter(x=>x.name==='commit_commissioning_operation').length,1);
});
test('write response alone never proves creation when canonical read is unavailable',async()=>{
 const s=server({readError:true}),c=coordinator(s.rpc);await c.prepare(voyage,'draft-fp');await assert.rejects(c.commit());assert.equal(c.snapshot().phase,'uncertain');
});
test('local presentation/quota callback failure cannot erase verified server truth',async()=>{
 const s=server(),c=coordinator(s.rpc,()=>{throw Error('QuotaExceededError');});await c.prepare(voyage,'draft-fp');await c.commit();assert.equal(c.snapshot().phase,'verified');
});
test('wrong-voyage readback fails closed',async()=>{
 const s=server({readOverride:{voyage_id:'wrong-voyage'}}),c=coordinator(s.rpc);await assert.rejects(c.prepare(voyage,'draft-fp'));assert.equal(c.snapshot().phase,'uncertain');await assert.rejects(c.commit());
});
test('wrong-project receipt cannot authorize a commit',async()=>{
 const s=server({readOverride:{intended_project_id:'wrong-project'}}),c=coordinator(s.rpc);await assert.rejects(c.prepare(voyage,'draft-fp'));await assert.rejects(c.commit());
});
test('canonical vessel without bound blueprint is not verified success',async()=>{
 const s=server(),base=s.rpc,c=coordinator(async(n,b)=>{const r=await base(n,b);if(n==='read_commissioning_operation'&&r.command_state==='verified_created')r.blueprint_verified=false;return r;});
 await c.prepare(voyage,'draft-fp');await assert.rejects(c.commit());assert.equal(c.snapshot().phase,'uncertain');
});
test('recovered prepared operation cannot be committed by a fresh page',async()=>{
 const s=server(),c=coordinator(s.rpc);await c.read(voyage,operation);await assert.rejects(c.commit());assert.equal(s.calls.filter(x=>x.name==='commit_commissioning_operation').length,0);
});
test('manual reconciliation closes a never-created operation without a create call',async()=>{
 const s=server(),c=coordinator(s.rpc);await c.reconcile(voyage,operation);assert.equal(c.snapshot().phase,'closed');assert.equal(s.calls.some(x=>x.name==='commit_commissioning_operation'),false);
});
test('lost prepare response does not permit a blind second prepare',async()=>{
 const s=server({prepareError:true}),c=coordinator(s.rpc);await assert.rejects(c.prepare(voyage,'draft-fp'));await assert.rejects(c.prepare(voyage,'draft-fp'));assert.equal(s.calls.filter(x=>x.name==='prepare_commissioning_operation').length,1);
});

function photoHelpers(){
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const names=['commissionDraftClone','commissionPhotoBriefConflict','commissionDraftWithPhotoCorrection'];
 const parts=names.map(name=>{const m=new RegExp('^  (?:async )?function '+name+'\\(','m').exec(app);assert.ok(m,'Actual '+name+' helper must exist');const e=app.indexOf('\n  }\n',m.index);assert.ok(e>m.index);return app.slice(m.index,e+5);});
 const c={structuredClone,Date};vm.createContext(c);vm.runInContext(parts.join('\n'),c);return c;
}
test('saved no-photo brief conflicts with required-photo draft and plan',()=>{
 const c=photoHelpers();assert.equal(c.commissionPhotoBriefConflict({businessBrief:'No photo required. Scheduling as needed.',photoRequired:true,forgePlan:{photoRequired:true}}),true);
 assert.equal(c.commissionPhotoBriefConflict({businessBrief:'Photos are not required.',photoRequired:false,forgePlan:{photoRequired:true}}),true);
 assert.equal(c.commissionPhotoBriefConflict({businessBrief:'Reference photos are required.',photoRequired:true,forgePlan:{photoRequired:true}}),false);
});
test('explicit no-photo correction preserves immutable identities and original plan evidence',()=>{
 const c=photoHelpers(),d={draftId:'unchanged',_serverVoyageId:voyage,_operationId:operation,_projectIdHint:'bf-p-retired',businessBrief:'No photo required.',name:'VoyageKeeper',photoRequired:true,forgePlan:{photoRequired:true,offer:'Service Visit',evidence:['Photos / visual reference','Measurements'],workflow:['Customer request','Collect reference photos']}};
 const out=c.commissionDraftWithPhotoCorrection(d);assert.equal(d.photoRequired,true);assert.equal(out.photoRequired,false);assert.equal(out.forgePlan.photoRequired,false);
 for(const k of ['draftId','_serverVoyageId','_operationId','_projectIdHint','businessBrief','name'])assert.equal(out[k],d[k]);
 assert.equal(out.forgePlan.offer,'Service Visit');assert.equal(out._photoCorrectionEvidence.previousPlan.photoRequired,true);
 assert.equal(out.forgePlan.evidence.join('|'),'Measurements');assert.equal(out.forgePlan.workflow.join('|'),'Customer request');
});
test('photo correction refuses a brief that did not negate required photos',()=>{
 const c=photoHelpers();assert.throws(()=>c.commissionDraftWithPhotoCorrection({businessBrief:'Collect reference photos.',photoRequired:true,forgePlan:{photoRequired:true}}),/no.photo|explicit|conflict/i);
});
test('photo correction is explicit, checks server readback, and cannot commission',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const m=/^  async function applyCommissionPhotoBrief\(/m.exec(app);assert.ok(m,'Explicit saved-brief action must exist');
 const body=app.slice(m.index,app.indexOf('\n  }\n',m.index)+5);assert.match(body,/commissionOperationFrozen\(\)/);assert.match(body,/saveCommissionVoyageServer\(/);
 assert.match(body,/readback\.draft\.photoRequired/);assert.match(body,/_serverRecoveryPending=true/);assert.doesNotMatch(body,/prepare_commissioning_operation|commit_commissioning_operation|\.commit\(/);
});
