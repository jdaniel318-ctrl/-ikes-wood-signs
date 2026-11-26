'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const captain = read('captain.js'), app = read('app.js'), home = read('index.html');
function segment(source, from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start, from);
  return source.slice(start, end);
}
const nodes = new Map();
function node(id) {
  if (!nodes.has(id)) nodes.set(id, {
    id, dataset: {}, querySelectorAll: () => [], removeAttribute(k) { delete this[k]; },
    addEventListener(k, fn) { this[k] = fn; }
  });
  return nodes.get(id);
}
let output;
const context = vm.createContext({
  URLSearchParams, $: node, allowed: () => true, busy: false, dirty: false,
  record: {target: {project_id: 'pilot-tools', display_name: "Tom & Sons", prospective: true}},
  status: (msg) => { context.message = msg; },
  download: (file,content) => { output = {file,content}; }
});
vm.runInContext(segment(captain,' const launchDemos=',' function field('), context);
const run = s => vm.runInContext(s,context);
run('fillPilot()');
assert.equal(node('cgLaunchPilot').open, true);
assert.match(run('pilotPanel()'),/Set offer fees/);
assert.equal(run('record.launchPilot'), undefined);
const change = (field,value,type='text') => {
  context.control = {dataset:{launchField:field},type,value,checked:value};
  run('editPilot(control)');
};
change('setupMinutes','85');change('supportMinutes','10');change('phone',true,'checkbox');
change('lesson','Ask when a requested visit becomes confirmed.');
change('setupMinutes','-1');assert.equal(context.control.value,'85');
change('demo','signal');change('response','terms');
assert.match(node('cgPilotProgress').textContent,/1 of 3.*85 setup min.*10 support min/);
const record = JSON.parse(JSON.stringify(context.record));
assert.equal(record.launchPilot.demo,'signal');assert.equal(record.launchPilot.response,'terms');
assert.equal(context.dirty,true);
run('exportPilotLesson()');
assert.match(output.content,/requested visit/);assert.doesNotMatch(output.content,/Tom|pilot-tools|terms|signal/);
for(const v of [{response:'paid'},{setupMinutes:'2.3'},{lesson:'x'.repeat(601)},{captain:'yes'},{demo:[]}]) {
  context.bad=v;
  assert.throws(()=>run('readLaunchPilot(bad)'));
}
assert.equal(run('eligiblePilot({project_id:"bf-p-fc2816b8254a4845"})'),true);
context.record={target:{project_id:'bor-north-richmond',prospective:false}};
run('fillPilot()');assert.equal(node('cgPilotOffer').href, undefined);assert.equal(node('cgLaunchPilot').hidden,true);
change('setupMinutes','9');assert.equal(context.record.launchPilot, undefined);
context.record=null;run('fillPilot()');assert.equal(node('cgPilotProgress').textContent,'');
assert.match(captain,/scoped=all\.filter\(row=>row.record\?\.target\?\.prospective===record.target.prospective\)/);
assert.match(captain,/launchPilot:readLaunchPilot\(r.launchPilot\)/);

const offer=read('fleet-launch-offer.html');
const script=segment(offer,'<script>','</script>').slice(8);
const encoded=offer.match(/<script type="application\/octet-stream" id="offer-pdf">([A-Za-z0-9+/=]+)<\/script>/)[1];
node('offer-pdf').textContent=encoded;
let offeredFile;
vm.runInNewContext(script,{atob,Uint8Array,File:require('node:buffer').File,document:{getElementById:node},URL:{
 createObjectURL(file){offeredFile=file;return 'blob:printable-example';}
}});
assert.match(offer,/Suggested pricing example/);assert.doesNotMatch(offer,/URLSearchParams|location.hash/);
assert.equal(node('print').href,'blob:printable-example');assert.equal(offeredFile.type,'application/pdf');
const fileContents=Buffer.from(encoded,'base64').toString('latin1');
assert.match(fileContents,/^%PDF-1\.7/);assert.match(fileContents,/\/Type \/Pages \/Count 1 /);
assert.match(fileContents,/\/MediaBox \[0 0 612 792\]/);assert.doesNotMatch(script,/window.print/);
assert.match(offer,/\$500/);assert.match(offer,/\$99/);assert.match(offer,/\$250\.00 deposit is credited/);
assert.doesNotMatch(script,/fetch\(|localStorage|sessionStorage|innerHTML/);
const launch=segment(home,'<details id="fleetLaunchPilot"','</details>');
assert.deepEqual([...launch.matchAll(/data-project-test-experience="([^"]+)"/g)].map(m=>m[1]),['bf-p-42be92cbac12','bf-p-f92f87e8ec44','bor-north-richmond']);
assert.match(launch,/fleet-launch-offer\.html/);
assert.match(app,/await openExperienceTestDeck\(projectId\);/);

const shell=node('universalCustomerShell');
const cx=vm.createContext({
  $:node, $$:()=>[], document:{body:{classList:{toggle(){}}}},
  universalCustomerState:{stage:'landing',projectId:'bf-p-42be92cbac12'},
  universalOffersFor:()=>[{id:'alpha',name:'Service visit'},{id:'beta',name:'Service visit'}],
  universalSelectedOffer:()=>({id:'alpha',name:'Service visit'}),
  universalCustomerContextFor:()=>cx.ctx, operatingModelForProject:()=>({}), customerRelationshipForProject:()=>({}),
  readUniversalReceipt:()=>null, universalSafeDescription:()=>'Sample',universalLandingLogoMarkup:()=>'',
  universalCustomerStageLabel:()=>'Sample',escapeHtml:s=>String(s),experienceTestReturnState:null,
  p:{id:'bf-p-42be92cbac12',name:'VoyageKeeper Recovery Test'}
});
const body=segment(app,'  function voyageKeeperRehearsal(p){',"    if(plumbingProject){\n      const landing=");
vm.runInContext(body+'\n}',cx);
for(const state of ['preview','deployed','sea_trial','private_test']) {
  cx.ctx={state,deploymentId:'exercise'};
  vm.runInContext('renderUniversalCustomerShell(p)',cx);
  assert.match(shell.innerHTML,/voyagekeeper-headland\.webp/);
  assert.match(shell.innerHTML,state==='deployed'?/Start a request/:/Start a test request/);
  assert.match(shell.innerHTML,/data-universal-landing-offer="beta"/);
  assert.equal(shell.innerHTML.includes('id="universalReturnShipwright"'),state==='sea_trial');
}
vm.runInContext('renderUniversalCustomerShell=()=>{}',cx);
node('universalHelpNow').click();assert.equal(cx.universalCustomerState.stage,'intake');
console.log('PASS pilot draft, offer privacy, scope reset, handoff notes, rates, sample routes, artwork, all customer modes, original intake and print action.');

// Exercise the shipping save / readback / load path using scoped device records.
(async()=>{
 const saved=[], copy=x=>JSON.parse(JSON.stringify(x));
 const simulatedDB={
   transaction(){
     const tx={};
     tx.objectStore=()=>({
       add(row){saved.push(copy(row));queueMicrotask(()=>tx.oncomplete());},
       get(id){const q={};queueMicrotask(()=>{q.result=saved.find(r=>r.id===id);q.onsuccess();});return q;},
       index(){return {getAll(scope){const q={};queueMicrotask(()=>{q.result=copy(saved.filter(r=>r.scope===scope));q.onsuccess();});return q;}};}
     });
     return tx;
   }
 };
 let current=true;
 const c=vm.createContext({record:copy(record),actor:'pilot-reviewer',dbOpen:async()=>simulatedDB,
   crypto:require('node:crypto').webcrypto,valid:()=>current,stable:JSON.stringify,dirty:true,
   status(){},fill(){},discardQuestion:()=>true,sanitize:r=>r,scopeTarget:t=>t});
 c.record.terms={};c.record.agreementId='fedcba98-1234-4123-8123-123456789012';
 Object.assign(c.record,{schema:'blackflag-agreement-working-v1',revision:1,history:[],evidence:[]});
 vm.runInContext(segment(captain,' const launchDemos=',' function pilotPanel(')+
   segment(captain,' async function storeDraft(t)',' async function snapshot(t)'),c);
 await vm.runInContext('storeDraft({})',c);
 assert.equal(saved[0].scope,'pilot-reviewer|pilot-tools');
 c.record.launchPilot.setupMinutes='';
 await vm.runInContext('loadDraft({})',c);assert.equal(c.record.launchPilot.setupMinutes,'85');
 c.record.target.prospective=false;await assert.rejects(vm.runInContext('loadDraft({})',c),/No device draft/);
 c.record.target.prospective=true;c.actor='other-admiral';await assert.rejects(vm.runInContext('loadDraft({})',c),/No device draft/);
 current=false;await vm.runInContext('storeDraft({})',c);assert.equal(saved.length,1);
 console.log('PASS device save, readback, scoped restore and cancelled session.');
})().catch(error=>{console.error(error);process.exitCode=1;});
