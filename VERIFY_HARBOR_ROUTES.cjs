#!/usr/bin/env node
'use strict';
// Shipped UI and delegated listener; synthetic DOM/API, no storage/network/live accounts.
// VERIFY_HARBOR_BROWSER.py separately covers the same listener with native Chromium DOM clicks.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||__dirname),src=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ui=src.slice(src.indexOf('  let harborRescueDocument='),src.indexOf('  async function refreshV3CommandSystems('));
const start=src.indexOf('  function bindWatchCommandBus('),stop=src.indexOf('\n  function ',start+10),bus=src.slice(start,stop);
assert(start>=0&&stop>start&&ui.includes('handleHarborRescueAction'),'Missing shipped route/UI extraction markers');
const ids=['harborPrepareRescue','harborDownloadRescue','harborDownloadDiagnostic','harborVerifyRescue'];
function harness(){
 const calls={confirm:0,capture:0,wrap:0,diagnostic:0,verify:0,log:0,prevent:0,downloads:[],filePicker:0},elements=new Map(),listeners=[];
 function element(id){if(elements.has(id))return elements.get(id);const e={id,disabled:['harborDownloadRescue','harborDownloadDiagnostic'].includes(id),dataset:{},textContent:'Nothing has been captured.',files:[],value:'',matches(sel){return sel.split(',').some(s=>s.trim()==='#'+id)},closest(sel){return this.matches(sel)?this:null},click(){calls.filePicker++},remove(){}};elements.set(id,e);return e}
 [...ids,'harborVerifyRescueInput','harborRescueStatus','showAuditTrailBtn','unrelated'].forEach(element);
 const c={console,Blob,Promise,Date,JSON,setTimeout:()=>0,engineSessionUnlocked:true,BUILD_VERSION:'8.8.20.71',$:element,
  URL:{createObjectURL:()=> 'blob:synthetic-rescue',revokeObjectURL:()=>{}},confirm:()=>{calls.confirm++;return c.confirmAllowed},confirmAllowed:true,
  document:{getElementById:element,addEventListener:(type,fn)=>{assert.equal(type,'click');listeners.push(fn)},body:{appendChild:()=>{}},createElement:()=>({href:'',download:'',click(){calls.downloads.push(this.download)},remove(){}})},
  renderV3AuditTrail:()=>{calls.log++},
  BlackFlagStorageSafety:{capture:async opts=>{calls.capture++;opts.onProgress('Reading synthetic records');return {coverage:{status:'partial'},errors:[]}},wrap:async payload=>{calls.wrap++;return {sha256:'fixture-digest',payload}},diagnostic:()=>{calls.diagnostic++;return {counts:{records:1}}},verify:async()=>{calls.verify++;return {sha256:'fixture-digest',coverage:'partial',error_count:0}}}};
 c.window=c;vm.createContext(c);vm.runInContext(ui+bus+'bindWatchCommandBus();',c);
 const click=async(id,nested=false)=>{const button=element(id);const target=nested?{closest:sel=>button.closest(sel)}:button;for(const listener of listeners)await listener({target,preventDefault(){calls.prevent++},stopPropagation(){}})};
 const run=s=>vm.runInContext(s,c);return {c,calls,element,click,run,listeners};
}
let passed=0,failed=0;async function test(name,fn){try{await fn();passed++;console.log('PASS',name)}catch(e){failed++;console.error('FAIL',name,e.message)}}
(async()=>{
 await test('all four shipped rescue buttons are unique in production HTML',()=>{for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1)});
 await test('production delegated selector admits all four rescue IDs',()=>{const selector=bus.match(/closest\?\.\(('[^']+')\)/);assert(selector);for(const id of ids)assert(selector[1].includes('#'+id),'unreachable '+id)});
 await test('accepted prepare click passes through shipped listener once',async()=>{const h=harness();await h.click(ids[0]);assert.equal(h.calls.confirm,1);assert.equal(h.calls.capture,1);assert.equal(h.calls.wrap,1);assert.equal(h.element(ids[1]).disabled,false);assert(h.element('harborRescueStatus').textContent.startsWith('PARTIAL CAPTURE'))});
 await test('cancelled prepare confirmation reads no records',async()=>{const h=harness();h.c.confirmAllowed=false;await h.click(ids[0]);assert.equal(h.calls.confirm,1);assert.equal(h.calls.capture,0);assert.equal(h.element(ids[1]).disabled,true)});
 await test('locked Engine rejects rescue before confirmation or reads',async()=>{const h=harness();h.c.engineSessionUnlocked=false;await h.click(ids[0]);assert.equal(h.calls.confirm,0);assert.equal(h.calls.capture,0);assert.match(h.element('harborRescueStatus').textContent,/Engine access is locked/)});
 await test('missing rescue module produces explicit error',async()=>{const h=harness();h.c.BlackFlagStorageSafety=null;await h.click(ids[0]);assert.match(h.element('harborRescueStatus').textContent,/tools are unavailable/);assert.equal(h.calls.capture,0)});
 await test('repeated binding does not duplicate listeners',async()=>{const h=harness();h.run('bindWatchCommandBus();bindWatchCommandBus();');assert.equal(h.listeners.length,1);await h.click(ids[0]);assert.equal(h.calls.confirm,1)});
 await test('nested button contents route through their actual button',async()=>{const h=harness();await h.click(ids[0],true);assert.equal(h.calls.capture,1)});
 await test('overlapping prepare attempts start only one capture',async()=>{const h=harness();let release;h.c.BlackFlagStorageSafety.capture=()=>{h.calls.capture++;return new Promise(r=>release=r)};const first=h.click(ids[0]);await Promise.resolve();await h.click(ids[0]);assert.equal(h.calls.confirm,1);assert.equal(h.calls.capture,1);release({coverage:{status:'partial'},errors:[]});await first;assert.equal(h.element(ids[0]).disabled,false)});
 await test('capture error leaves downloads disabled and restores button',async()=>{const h=harness();h.c.BlackFlagStorageSafety.capture=async()=>{throw Error('Synthetic read failure')};await h.click(ids[0]);assert.match(h.element('harborRescueStatus').textContent,/RESCUE NOT CONFIRMED/);assert.equal(h.element(ids[1]).disabled,true);assert.equal(h.element(ids[0]).disabled,false)});
 await test('private download reaches handler and uses private filename',async()=>{const h=harness();await h.click(ids[0]);await h.click(ids[1]);assert.deepEqual(h.calls.downloads,['blackflag-882071-PRIVATE-rescue.json']);assert.match(h.element('harborRescueStatus').textContent,/not yet verified saved/)});
 await test('diagnostic download follows separate summary path',async()=>{const h=harness();await h.click(ids[0]);await h.click(ids[2]);assert.equal(h.calls.diagnostic,1);assert.deepEqual(h.calls.downloads,['blackflag-882071-storage-diagnostic.json'])});
 await test('verify button opens file picker and validates selected file',async()=>{const h=harness();await h.click(ids[0]);await h.click(ids[3]);assert.equal(h.calls.filePicker,1);const input=h.element('harborVerifyRescueInput');input.files=[{size:20,text:async()=>'{"synthetic":true}'}];await input.onchange();assert.equal(h.calls.verify,1);assert.match(h.element('harborRescueStatus').textContent,/SAVED FILE READBACK MATCHED/)});
 await test('forced download before capture cannot create a file',async()=>{const h=harness();await h.click(ids[1]);assert.match(h.element('harborRescueStatus').textContent,/Prepare a rescue capture first/);assert.equal(h.calls.downloads.length,0)});
 await test('locking after capture prevents download without altering authority',async()=>{const h=harness();await h.click(ids[0]);h.c.engineSessionUnlocked=false;await h.click(ids[1]);assert.equal(h.calls.downloads.length,0);assert.match(h.element('harborRescueStatus').textContent,/Engine access is locked/)});
 await test('existing Ship Log control still routes once',async()=>{const h=harness();await h.click('showAuditTrailBtn');assert.equal(h.calls.log,1);assert.equal(h.calls.capture,0)});
 await test('unrelated button remains outside this command listener',async()=>{const h=harness();await h.click('unrelated');assert.equal(h.calls.prevent,0);assert.equal(h.calls.capture,0)});
 console.log(JSON.stringify({passed,failed,scope:'production UI/listener; synthetic DOM/API only; no live state'}));process.exitCode=failed?1:0;
})();
