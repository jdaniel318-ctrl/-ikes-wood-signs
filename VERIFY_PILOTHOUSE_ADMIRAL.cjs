'use strict';
// The production controllers run against two fictitious ships and an in-memory service.
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const text=name=>fs.readFileSync(__dirname+'/'+name,'utf8');
const captain=text('captain.js');
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
    replaceChildren(){this.innerHTML=this.textContent='';},setAttribute(){},blur(){},focus(){},
    closest(query){return query.split(',').includes('#'+this.id)?this:null;},
    matches(query){return !!this.closest(query);}};
  nodes.set(id,n);return n;
}
const select=node('admiralEntitlementVessel'), feature=node('admiralEntitlementCapability'), station=node('admiralEntitlementStation');
let previewHandler=async()=>({fingerprint:'example',changes_count:1,feature_count:1,unchanged_count:0,items:[]});
let logHandler=async()=>({records:[]});
const transport={rpc:async(name,body)=>{
  calls.push({name,body});
  if(name==='admiral_ship_document_tool')return documentHandler(body);
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
let documentHandler;
const status=()=>node('admiralDocumentStatus').textContent;
const record=(p,on=false,v=0)=>({projectId:p,vesselId:'uuid-'+p,eligible:true,enabled:on,version:v});
(async()=>{
station.classList.add('identity-verified');
prepare(a);
const late=deferred();
documentHandler=()=>late.promise;
const readA=click('admiralDocumentRefresh');
prepare(b);documentHandler=async()=>record(b.project_id);
await click('admiralDocumentRefresh');late.resolve(record(a.project_id));await readA;
assert.match(status(),/test-b/);
await click('admiralDocumentPreview');assert.match(status(),/Assign document tools/);
assert.equal(calls.filter(x=>'p_enabled' in x.body).length,0);
let saved=false;
documentHandler=async(body)=>{
assert.equal(body.p_project_id,'test-b');
if('p_enabled' in body){assert.equal(body.p_expected_version,0);assert.equal(body.p_enabled,true);saved=true;}
return record('test-b',saved,Number(saved));
};
await Promise.all([click('admiralDocumentConfirm'),click('admiralDocumentConfirm')]);assert.match(status(),/Change verified/);
assert.equal(calls.filter(x=>'p_enabled' in x.body).length,1);
await click('admiralDocumentPreview');assert.match(status(),/Remove access/);
documentHandler=async(body)=>{if('p_enabled' in body)throw Error('conflict');return record('test-b',true,2);};
await click('admiralDocumentConfirm');assert.match(status(),/Order unconfirmed.*assigned/);
documentHandler=async()=>({...record('test-a'),eligible:false});await click('admiralDocumentRefresh');
assert.match(status(),/unavailable/);assert.equal(node('admiralDocumentPreview').disabled,true);
documentHandler=async()=>({...record('test-b'),eligible:false});await click('admiralDocumentRefresh');
assert.equal(node('admiralDocumentPreview').disabled,true);
const internal={...a,mission_class:'admiral_program'};prepare(internal);
const before=calls.length;await click('admiralDocumentRefresh');assert.equal(calls.length,before);
assert.match(status(),/internal Admiral program/);assert.equal(node('admiralDocumentPreview').disabled,true);
prepare({...b,id:'known-id'});documentHandler=async()=>record('test-b');await click('admiralDocumentRefresh');
assert.match(status(),/unavailable/);assert.equal(node('admiralDocumentPreview').disabled,true);
events.get('darksky:admiral-session-ended')();assert.match(status(),/Sign in/);
console.log('PASS document assignment scope, preview, guarded write, double-submit, reread, conflict recovery, stale selection, eligibility and session clear');
})().catch(e=>{console.error(e);process.exitCode=1;});
