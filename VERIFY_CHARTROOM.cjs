'use strict';
// The production controllers run against two fictitious ships and an in-memory service.
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const text=name=>fs.readFileSync(__dirname+'/'+name,'utf8');
const captain=text('captain.js'), owner=text('owner.html');
const start=captain.indexOf('/* 8.8.5 Command Acknowledgment');
const course=captain.slice(start,captain.indexOf('/* 8.8.11.1 Fleet Door Repair',start));
assert(start>0&&course.includes('window.DarkSkyPrepareFeatureReview'));
const nodes=new Map(),handlers=new Map(),events=new Map(),calls=[];
function node(id){
  if(nodes.has(id))return nodes.get(id);
  const classes=new Set();
  const n={id,value:'',dataset:{},options:[],disabled:false,textContent:'',innerHTML:'',
    classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k),
      toggle(k,on){if(on)classes.add(k);else classes.delete(k);}},
    querySelectorAll(){return this.options.filter(o=>o.dataset.handoffVessel);},querySelector(){return null;},
    add(option){this.options.push(option);option.remove=()=>{this.options=this.options.filter(o=>o!==option);};},
    set selectedIndex(index){this.value=this.options[index]?.value||'';},
    get selectedOptions(){return this.options.filter(o=>o.value===this.value);},
    replaceChildren(){this.innerHTML=this.textContent='';},setAttribute(){},blur(){},
    closest(query){return query.split(',').includes('#'+this.id)?this:null;},
    matches(query){return !!this.closest(query);}};
  nodes.set(id,n);return n;
}
const select=node('admiralEntitlementVessel'), feature=node('admiralEntitlementCapability'), station=node('admiralEntitlementStation');
let previewHandler=async()=>({fingerprint:'example',changes_count:1,feature_count:1,unchanged_count:0,items:[]});
let logHandler=async()=>({records:[]});
const transport={rpc:async(name,body)=>{
  calls.push({name,body});
  if(name==='admiral_preview_service_course')return previewHandler(body);
  if(name==='admiral_list_service_course_log')return logHandler(body);
  if(name==='admiral_issue_service_course')return {command_id:12,changes_count:1};
  throw Error('Unexpected RPC '+name);
}};
const doc={getElementById:node,createElement:()=>({dataset:{}}),querySelectorAll:()=>[],
  addEventListener:(name,fn)=>handlers.set(name,fn)};
const win={BlackFlagV3Identity:{productionAuth:{readClientConfig:()=>({url:'fixture',publishableKey:'fixture'})}},
  __darkSkyVerifiedRelease:{build:'test'},DarkSkySupabase:{create:()=>transport},
  addEventListener:(name,fn)=>events.set(name,fn)};
const ctx=vm.createContext({document:doc,window:win,console});
vm.runInContext(course,ctx);
const click=id=>handlers.get('click')({target:node(id)});
const change=target=>handlers.get('change')({target});
const ship=(id,name)=>({project_id:id,display_name:name});
const a=ship('test-a','Sample A'), b=ship('test-b','Sample B');
const writes=()=>calls.filter(c=>c.name==='admiral_issue_service_course');
const prepare=v=>win.DarkSkyPrepareFeatureReview(v);
function deferred(){let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};}
async function run(){
  station.classList.add('identity-verified');
  assert(prepare(a));assert.equal(select.value,'test-a');assert.equal(calls.length,0);
  await click('admiralPreviewCourse');assert.equal(calls.length,0);
  feature.value='fleet.artwork-inlays';await change(feature);
  assert.equal(calls.at(-2).body.p_scope,'feature');
  assert.equal(calls.at(-2).body.p_commercial_mode,'off');
  assert.deepEqual(Array.from(calls.at(-2).body.p_capability_keys),[feature.value]);
  await click('admiralIssueCourse');assert.equal(writes().length,0);
  const pending=deferred();previewHandler=()=>pending.promise;
  const first=click('admiralPreviewCourse');
  assert(prepare(b));pending.resolve({fingerprint:'first',changes_count:1});await first;
  await click('admiralIssueCourse');assert.equal(writes().length,0);
  feature.value='fleet.artwork-inlays';await click('admiralGrantPaid');
  previewHandler=async()=>({fingerprint:'second',feature_count:1,changes_count:1});
  await click('admiralPreviewCourse');assert.equal(node('admiralIssueCourse').disabled,false);
  let readback=deferred();previewHandler=()=>readback.promise;
  logHandler=async()=>({records:[{id:12,vessel_name:'Sample B'}]});
  const issue=click('admiralIssueCourse');await click('admiralIssueCourse');
  readback.resolve({fingerprint:'after',feature_count:1,changes_count:0});await issue;
  assert.equal(writes().length,1);assert.equal(writes()[0].body.p_project_id,'test-b');
  assert.equal(writes()[0].body.p_expected_fingerprint,'second');
  assert.equal(writes()[0].body.p_commercial_mode,'paid');
  assert.match(node('admiralEntitlementResult').textContent,/VERIFIED/);
  previewHandler=async()=>({fingerprint:'third',feature_count:1,changes_count:1});
  await click('admiralPreviewCourse');feature.value='fleet.vendor-routing';
  await click('admiralIssueCourse');assert.equal(writes().length,1);
  await click('admiralPreviewCourse');logHandler=async()=>({records:[]});await click('admiralIssueCourse');
  assert.equal(writes().length,2);assert.doesNotMatch(node('admiralEntitlementResult').textContent,/VERIFIED/);
  const lateLog=deferred();logHandler=()=>lateLog.promise;
  const log=click('admiralOpenFullLog');events.get('darksky:admiral-session-ended')();
  lateLog.resolve({records:[{id:123,vessel_name:'Sample A'}]});await log;
  assert.equal(select.options.length,0);assert.equal(select.value,'');assert.equal(feature.value,'');
  assert.equal(node('admiralCourseLogRows').innerHTML,'');assert.equal(node('admiralIssueCourse').disabled,true);
  const ownerStart=owner.indexOf('async function requestFleetService(');
  const ownerCode=owner.slice(ownerStart,owner.indexOf('let savedOwnerLogo;',ownerStart));
  let requests=0;
  const o=vm.createContext({verifySupabaseMembership:async()=>({ok:true,session:{access_token:'sample'},vessel:{id:'test-b'}}),
    supaHeaders:()=>({}), SUPABASE_URL:'fixture', fetch:async()=>{requests++;return {ok:true};}});
  vm.runInContext(ownerCode,o);const row={commercial_mode:'paid',status:'available',vessel_id:'test-b'};
  for(const status of ['revoked','suspended','unknown']){
    for(const mode of ['paid','free','standard']){
      const offer=o.ownerServiceOffer({...row,status,commercial_mode:mode,request:{status:'approved'}});
      assert.equal(offer.label,'UNAVAILABLE');assert.equal(offer.canRequest,false);assert.equal(offer.terms,'');
    }
  }
  for(const mode of ['free','standard'])assert.equal(o.ownerServiceOffer({...row,commercial_mode:mode,status:'entitled'}).terms,'INCLUDED');
  assert.equal(o.ownerServiceOffer({...row,request:{status:'requested'}}).canRequest,false);
  assert.equal(o.ownerServiceOffer({...row,commercial_mode:'unknown'}).canRequest,false);
  await assert.rejects(o.requestFleetService({...row,vessel_id:'test-a'},()=>true));
  await assert.rejects(o.requestFleetService({...row,status:'revoked'},()=>true));
  assert.equal(requests,0);await o.requestFleetService(row,()=>true);assert.equal(requests,1);
  const handler=captain.slice(captain.indexOf("$('harborFeatureAccess').onclick="),captain.indexOf("$('harborVessel').onchange="));
  assert(handler.includes("loadedSession!==sessionMark()"));
  let ready=true,session='sample',chosen='test-b',opens=0;
  const q=vm.createContext({$:node,loadedSession:'sample',checked:()=>ready,sessionMark:()=>session,selected:()=>chosen,vessels:[b],
    deck:{querySelector:()=>({click(){}})},window:{DarkSkyPrepareFeatureReview:v=>{opens++;assert.equal(v,b);return true;}}});
  node('admiralServiceEntitlements').click=()=>{};feature.focus=()=>{};vm.runInContext(handler,q);
  ready=false;node('harborFeatureAccess').onclick();ready=true;session='expired';node('harborFeatureAccess').onclick();
  session='sample';chosen='test-a';node('harborFeatureAccess').onclick();assert.equal(opens,0);
  chosen='test-b';node('harborFeatureAccess').onclick();assert.equal(opens,1);
  console.log('PASS vessel handoff, new vessel, preview-only entry, exact-target issue, late reads, duplicate submit, order readback, session cleanup and owner service offers');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
