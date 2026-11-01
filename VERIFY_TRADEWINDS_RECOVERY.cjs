'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../recovery-evidence'));
const {harness,SITE}=require('./TRADEWINDS_TEST_HELPERS.cjs');
const idle=p=>p.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');
const open=async p=>{await p.evaluate(()=>BlackFlagQuartermasterUI.open());await idle(p);};
const click=async(p,s)=>{await p.locator(s).first().click();await idle(p);};
async function records(p){return p.evaluate(async()=>{const r=indexedDB.open('blackflag-quartermaster-tradewinds-v1');const db=await new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error);});const out=await new Promise((a,b)=>{const q=db.transaction('records').objectStore('records').getAll();q.onsuccess=()=>a(q.result.filter(x=>x?.value?.document));q.onerror=()=>b(q.error);});db.close();return out;});}
async function settled(p,name){for(let i=0;i<100;i++){if((await records(p)).some(x=>x.value.document.job.name===name))return;await p.waitForTimeout(20);}throw Error('Recovery did not settle: '+name);}
(async()=>{const results=[];for(const scenario of ['resume','reconcile','discard']){const h=await harness(ROOT);try{
 const {page:a,ctx}=await h.device();await open(a);await click(a,'#qmExampleQuote');await click(a,'#qmCloudInspect');await click(a,'#qmCloudEnable');await click(a,'[data-qm-open-doc]:visible');
 await a.locator('#qmJobName').fill('Tab A original unsaved recovery');await settled(a,'Tab A original unsaved recovery');
 const b=await ctx.newPage();b.on('dialog',d=>d.accept());await b.goto(SITE+'index.html');await open(b);
 if(scenario==='resume'){
  const original=(await records(a))[0];await click(b,'[data-qm-recover]');await b.locator('#qmJobName').fill('Tab B separate resumed draft');await settled(b,'Tab B separate resumed draft');
  assert.equal((await records(a)).find(x=>x.id===original.id)?.value.document.job.name,'Tab A original unsaved recovery');
  assert.equal((await records(a)).length,2);await click(b,'#qmSaveDocument');assert.equal(await a.locator('#qmJobName').inputValue(),'Tab A original unsaved recovery');assert.equal((await records(a)).find(x=>x.id===original.id)?.value.document.job.name,'Tab A original unsaved recovery');
 }else{
  await click(b,'[data-qm-open-doc]:visible');await a.locator('#qmJobName').fill('Tab A committed lost reply');await b.locator('#qmJobName').fill('Tab B independent unsaved draft');await settled(b,'Tab B independent unsaved draft');
  await a.evaluate(s=>{if(s==='discard')fixture.failBefore=true;else fixture.loseReply=true;},scenario);await click(a,'#qmSaveDocument');await click(b,'#qmSaveDocument');const n=h.commits();await click(b,'#qmCloudCheck');if(scenario==='discard')await click(b,'#qmPendingDiscard');
  assert.equal(h.commits(),n);assert.equal(await b.locator('#qmJobName').inputValue(),'Tab B independent unsaved draft');assert((await records(b)).some(x=>x.value.document.job.name==='Tab B independent unsaved draft'));assert.match(await b.locator('#qmDockSaveState').textContent(),/unsaved|kept/i);
 }
 results.push({name:scenario,pass:true});console.log('PASS '+scenario);
 }catch(e){results.push({name:scenario,pass:false,error:e.stack});console.log('FAIL '+scenario+': '+e.message);}finally{await h.close();}}
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({scope:'Same-origin tabs sharing native IndexedDB, real SQL, synthetic identity',results},null,2));if(results.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
