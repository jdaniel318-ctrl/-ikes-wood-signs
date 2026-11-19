'use strict';
// Exercise the installed My Fleet entry and visibility code with the identity promise held open.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/captain.js','utf8');
function section(start,end){
  const at=source.indexOf(start),until=source.indexOf(end,at+start.length);
  assert.ok(at>=0&&until>at);return source.slice(at,until);
}
const transitions=section("  function setSecurityLayer(verified","  function close(){\n    const pending = watchAccount.pending;");
const nodes=new Map();
function element(id){
  if(nodes.has(id))return nodes.get(id);
  const classes=new Set(),attrs={};
  const el={id,dataset:{},classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k),
    toggle:(k,on)=>on?classes.add(k):classes.delete(k)},setAttribute:(k,v)=>attrs[k]=v,focus(){}};
  nodes.set(id,el);return el;
}
let epoch=0,resolveIdentity,reads=0;
const noop=()=>{},w={DarkSkyAdmiralIdentityStatus:()=>new Promise(done=>{resolveIdentity=done;}),
  DarkSkyReadFleetSpine:async()=>({vessels:[]}),DarkSkyReadAdmiralWatch:async()=>{reads++;return{records:[]}}};
const env={window:w,$:element,routeGeneration:()=>1,document:{body:element('body')},
  watchAccount:{reset:noop,begin:noop},clearReports:noop,clearHelp:noop,mountHelp:noop,
  sameWatch:n=>n===epoch,leaveWatch(){env.watchEpoch=++epoch;},selectView:v=>{env.view=v;},
  paintPrograms:noop,render:noop,failWatch:noop};
vm.runInNewContext(transitions+';this.enter=open;',env);
const hidden=id=>element(id).classList.contains('hidden');
async function check(){
  for(const allowed of [true,false]){
    env.enter({source:'admiral-gate'});
    assert.equal(element('watchReturning').hidden,false);assert.equal(element('watchReturningTitle').textContent,'Opening My Fleet…');
    assert.ok(hidden('watchSecurityLayer') && hidden('watchWorkspace'));assert.equal(env.view,'attention');
    resolveIdentity(allowed);await new Promise(setImmediate);
    assert.ok(element('watchReturning').hidden);
    assert.equal(hidden('watchSecurityLayer'),allowed);
    assert.equal(hidden('watchWorkspace'),!allowed);
    if(!allowed)assert.equal(element('watchSecurityForm').hidden,false);
  }
  assert.equal(reads,1);
  env.enter({source:'admiral-gate',focusProgram:'carvewright'});
  assert.equal(element('watchReturningTitle').textContent,'Returning to My Fleet…');assert.equal(env.view,'programs');
  env.leaveWatch();resolveIdentity(true);await new Promise(setImmediate);
  assert.ok(hidden('watchWorkspace'));assert.equal(reads,1);
  console.log('PASS pending, verified, denied and superseded My Fleet entrances.');
}
check().catch(e=>{console.error(e);process.exitCode=1;});
