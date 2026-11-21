'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('./quartermaster_core.js');
const pdf=require('./quartermaster_pdf.js');
const scope={accountId:'demo',backend:'offline',environment:'test',site:'demo',businessId:'tally-test-a'};
const operationId='10000000-0000-4000-8000-000000000001';
async function test(){
 let saved=core.blankWorkspace(scope);
 const persistence={async transact(fn,check){
  check();
  const next=structuredClone(saved),result=fn(next)||{};
  if(result.write!==false)saved=next;
  return structuredClone(result.value===undefined?next:result.value);
 }};
 const store=core.createStore({scope,persistence,guard:()=>true});
 await store.saveBusiness({...saved.business,name:'Test ship',prefix:'VKT'},saved.revision);
 await store.saveItem({kind:'service',description:'Test service',unit:'Job',unitPrice:'100.00'},saved.revision);
 const legacy=await store.createDocument({type:'invoice',operationId:'legacy'});
 const quote=await store.createDocument({type:'quote',operationId:'quote'});
 assert.match(legacy.number,/^VKT-INV-/);assert.match(quote.number,/^VKT-QTE-/);
 const args={type:'invoice',operationId,reservedNumber:'007-00001'};
 let doc=await store.createDocument(args);
 assert.equal(doc.id,operationId);assert.equal(doc.number,'007-00001');
 assert.deepEqual(await store.createDocument(args),doc);
 const bad=()=>crypto.randomUUID();
 await assert.rejects(store.createDocument({...args,operationId:bad()}),/conflicts/);
 for(const id of ['007-00000','X-00001','AAB-0021','ABC-000001']){
  await assert.rejects(store.createDocument({...args,operationId:bad(),reservedNumber:id}),/Invalid/);
 }
 const i=saved.catalog[0];
 doc.customer.name='Test Customer';doc.issueDate='2026-11-21';doc.taxRate='6';doc.taxConfirmed=true;
 doc.lines=[{id:'line',itemId:i.id,itemRevision:1,kind:i.kind,code:i.code,description:i.description,specification:'',packageDescription:'',manufacturerPart:'',supplierSku:'',quantity:'1',unit:i.unit,unitPrice:i.unitPrice}];
 await store.saveDocument(doc,saved.revision);
 const pre=await store.prepareFinalization(doc.id,saved.revision);
 await store.finalizeDocument(doc.id,'final',saved.revision,pre);
 doc=saved.documents.find(d=>d.id===operationId);
 assert.equal(doc.number,'007-00001');assert.equal(doc.totals.totalCents,10600);
 const bytes=await pdf.render(doc);
 assert.equal(pdf.filename(doc),'007-00001.pdf');
 await store.saveBusiness({...saved.business,prefix:'ALT'},saved.revision);
 const backup=await store.exportBackup(),restored=core.validateBackup(backup,scope);
 assert.deepEqual(restored,saved);
 assert.equal(restored.documents.find(d=>d.id===operationId).number,doc.number);
 assert.equal(restored.documents.find(d=>d.id===legacy.id).number,legacy.number);
 await assert.rejects(store.saveDocument({...doc,number:'007-00002'},saved.revision));
 const ui=fs.readFileSync(path.join(__dirname,'quartermaster.js'),'utf8');
 assert.match(ui,/reference:saved.number/);
 // Exercise the same async handler called by New invoice and conversion from a quote.
 const source=ui.slice(ui.indexOf(' async function numberedDraft'),ui.indexOf(' async function createDocument',ui.indexOf(' async function numberedDraft')));
 const sessions=new Map();
 const reservations=new Map();
 let actions=[],lose=true,valid=true,code=null,mode='ready',confirmLegacy=false,answer='007';
 const fixture={sessionStorage:{getItem:k=>sessions.get(k),setItem:(k,v)=>sessions.set(k,v),removeItem:k=>sessions.delete(k)},prompt:()=>answer,confirm:()=>confirmLegacy};
 const transport={async rpc(_,body){
  if(mode==='missing')throw Object.assign(Error('offline setup'),{code:'PGRST202'});
  if(mode==='conflict')throw Error('quartermaster invoice code taken');
  if(mode==='denied')throw Object.assign(Error('scope'),{code:'42501'});
  if(!code&&!body.p_code)return {needsCode:true};
  code=code||body.p_code;
  if(!reservations.has(body.p_document))reservations.set(body.p_document,code+'-'+String(reservations.size+1).padStart(5,'0'));
  if(lose){lose=false;throw Error('connection interrupted');}
  return {number:reservations.get(body.p_document),businessId:scope.businessId,documentId:body.p_document};
 }};
 const mockStore={createDocument:async args=>{actions.push(args);return args;}};
 const make=Function('store','state','g','storageMode','uuid','client',source+'; return numberedDraft;');
 const draft=make(mockStore,{scope,business:{name:'Test Ship',prefix:'007'},operations:[]},fixture,'local',()=>crypto.randomUUID(),()=>transport);
 const check=()=>{if(!valid)throw Error('context changed');};
 await assert.rejects(draft('invoice',check),/interrupted/);assert.equal(actions.length,0);
 const first=await draft('invoice',check);assert.equal(first.reservedNumber,'007-00001');assert.equal(reservations.size,1);assert.equal(sessions.size,0);
 const converted=await draft('invoice',check,'quote-id');assert.equal(converted.sourceQuoteId,'quote-id');assert.equal(converted.reservedNumber,'007-00002');
 mode='conflict';await assert.rejects(draft('invoice',check),/Another ship already uses/);
 mode='denied';await assert.rejects(draft('invoice',check),/scope/);
 mode='missing';assert.equal(await draft('invoice',check),null);confirmLegacy=true;
 assert.equal((await draft('invoice',check)).reservedNumber,undefined);
 mode='ready';code=null;answer=null;assert.equal(await draft('invoice',check),null);
 answer='BAD CODE';await assert.rejects(draft('invoice',check),/exactly three/);
 valid=false;await assert.rejects(draft('invoice',check),/context changed/);
 const out=process.env.TALLY_FIXTURE_DIR;
 if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'fixture.json'),JSON.stringify(saved));fs.writeFileSync(path.join(out,'sample.pdf'),bytes);}
 console.log('PASS mixed legacy and fleet invoices, retry, invalid and duplicate numbers, finalized snapshot, PDF, backup, and payment reference');
}
test().catch(error=>{console.error(error);process.exitCode=1;});
