'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {harness}=require('./TRADEWINDS_TEST_HELPERS.cjs');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../ui-evidence'));
const idle=p=>p.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');
async function open(p){await p.evaluate(()=>BlackFlagQuartermasterUI.open());await idle(p);}
async function local(p){return p.evaluate(async()=>{const r=indexedDB.open('blackflag-quartermaster-v1',1);const db=await new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error);});const rows=await new Promise((a,b)=>{const q=db.transaction('workspaces').objectStore('workspaces').getAll();q.onsuccess=()=>a(q.result);q.onerror=()=>b(q.error);});db.close();return rows.find(w=>w.scope.businessId==='planned:househull-exterior');});}
(async()=>{const h=await harness(ROOT),a=await h.device(),b=await h.device({width:390,height:844}),results=[];fs.mkdirSync(OUT,{recursive:true});
 async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.stack});console.log('FAIL '+name+': '+e.message);await a.page.screenshot({path:path.join(OUT,'failure-'+results.length+'.png')});}}
 let before;
 await test('local business presents a deliberate across-devices action',async()=>{await open(a.page);assert.equal(await a.page.locator('#qmCloudInspect').count(),1);await a.page.locator('#qmExampleQuote').click();await idle(a.page);before=await local(a.page);assert.equal(before.documents[0].totals.totalCents,627100);});
 if(await a.page.locator('#qmCloudInspect').count()){
 await test('preview and enable preserve all original device records',async()=>{await a.page.locator('#qmCloudInspect').click();await idle(a.page);await a.page.locator('#qmCloudEnable').click();await idle(a.page);assert.match(await a.page.locator('#qmStorageLabel').textContent(),/across devices/i);assert.deepEqual(await local(a.page),before);});
 await test('second device opens the exact cloud revision and quote',async()=>{await open(b.page);await b.page.locator('#qmCloudInspect').click();await idle(b.page);await b.page.locator('#qmCloudOpen').click();await idle(b.page);await b.page.locator('[data-qm-open-doc]:visible').first().click();await idle(b.page);assert.equal(await b.page.locator('#qmJobName').inputValue(),'Example exterior siding package');assert.equal(await b.page.locator('#qmRunningTotal').textContent(),'$6,271.00');await b.page.screenshot({path:path.join(OUT,'phone-cloud-quote.png')});});
 await test('a phone edit is saved and refresh reaches the tablet unchanged',async()=>{await b.page.locator('#qmJobName').fill('Trade Winds two-device proof');await b.page.locator('#qmSaveDocument').click();await idle(b.page);await a.page.locator('#qmCloudRefresh').click();await idle(a.page);await a.page.locator('[data-qm-open-doc]:visible').first().click();await idle(a.page);assert.equal(await a.page.locator('#qmJobName').inputValue(),'Trade Winds two-device proof');assert.deepEqual(await local(a.page),before);});
 await test('auth interruption retains an unsaved draft through sign-in',async()=>{await a.page.locator('#qmJobName').fill('Recovered after verification failure');await a.page.evaluate(()=>fixture.authority=false);await a.page.locator('#qmSaveDocument').click();await a.page.waitForFunction(()=>!document.querySelector('#quartermasterWorkspace'));await a.page.evaluate(()=>{fixture.authority=true;fixture.reusable=true;fixture.stamp++;});await open(a.page);await a.page.locator('[data-qm-recover]').first().click();await idle(a.page);assert.equal(await a.page.locator('#qmJobName').inputValue(),'Recovered after verification failure');assert.match(await a.page.locator('#qmDockSaveState').textContent(),/unsaved/i);await a.page.locator('#qmSaveDocument').click();await idle(a.page);assert.match(await a.page.locator('#qmStorageLabel').textContent(),/across devices/i);});
 await test('lost reply exposes check-result and does not duplicate the save',async()=>{await a.page.locator('#qmJobName').fill('Server saved; reply lost');await a.page.evaluate(()=>fixture.loseReply=true);const n=h.commits();await a.page.locator('#qmSaveDocument').click();await idle(a.page);assert.equal(h.commits(),n+1);await a.page.evaluate(()=>fixture.loseReply=false);await a.page.locator('#qmCloudCheck').click();await idle(a.page);assert.equal(h.commits(),n+1);assert.match(await a.page.locator('#qmStorageLabel').textContent(),/across devices/i);await a.page.screenshot({path:path.join(OUT,'tablet-cloud-receipt.png')});});
 await test('both devices produce identical PDF content and saved revision',async()=>{
  await b.page.locator('#qmCloudRefresh').click();await idle(b.page);await b.page.locator('[data-qm-open-doc]:visible').first().click();await idle(b.page);
  const texts=[];
  for(const [i,p]of [a.page,b.page].entries()){
   await p.locator('[data-qm-step="review"]').first().click();await p.locator('#qmPdf').click();await idle(p);
   const bytes=await p.evaluate(async()=>Array.from(new Uint8Array(await (await fetch(document.querySelector('#qmDownloadReady a').href)).arrayBuffer())));
   const file=path.join(OUT,'device-'+i+'.pdf');fs.writeFileSync(file,Buffer.from(bytes));texts.push(cp.execFileSync('pdftotext',['-layout',file,'-'],{encoding:'utf8'}));
  }
  assert.equal(texts[0],texts[1]);for(const text of ['Server saved; reply lost','$6,271.00','Revision 5'])assert(texts[0].includes(text),text);
 });
 await test('competing edits retain the losing change without replacing the saved quote',async()=>{
  for(const p of [a.page,b.page])await p.locator('[data-qm-step="details"]').first().click();
  await a.page.locator('#qmJobName').fill('Tablet wins conflict');await b.page.locator('#qmJobName').fill('Phone retained conflict');
  await a.page.locator('#qmSaveDocument').click();await idle(a.page);await b.page.locator('#qmSaveDocument').click();await idle(b.page);
  assert.equal(await b.page.locator('#qmJobName').inputValue(),'Phone retained conflict');assert.equal(await b.page.locator('#qmCloudCheck').count(),1);
  const n=h.commits();await b.page.locator('#qmCloudCheck').click();await idle(b.page);assert.equal(h.commits(),n);assert.equal(await b.page.locator('#qmPendingRetry').count(),0);assert.match(await b.page.locator('#qmSyncPanel').textContent(),/has changed/);
  await b.page.locator('#qmPendingDownload').click();await idle(b.page);assert.equal(await b.page.locator('#qmDownloadReady a').count(),1);
  await b.page.locator('#qmPendingDiscard').click();await idle(b.page);await b.page.locator('[data-qm-open-doc]:visible').first().click();await idle(b.page);assert.equal(await b.page.locator('#qmJobName').inputValue(),'Tablet wins conflict');
 });
 await test('unavailable cloud never silently opens the older device archive',async()=>{
  await b.page.reload();await b.page.evaluate(()=>fixture.failBefore=true);await open(b.page);assert.equal(await b.page.locator('[data-qm-open-doc]:visible').count(),0);assert.match(await b.page.locator('#qmStorageLabel').textContent(),/No saved workspace/);assert.equal(await b.page.locator('#qmCloudRefresh').count(),1);
  await b.page.evaluate(()=>fixture.failBefore=false);await b.page.locator('#qmCloudRefresh').click();await idle(b.page);assert.match(await b.page.locator('#qmStorageLabel').textContent(),/across devices/);
 });
 await test('cloud mode persists across reload without touching local archive',async()=>{await a.page.reload();await open(a.page);assert.match(await a.page.locator('#qmStorageLabel').textContent(),/across devices/i);assert.deepEqual(await local(a.page),before);});
 }
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.deepEqual(a.blocked,[]);assert.deepEqual(b.blocked,[]);await h.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({scope:'Real UI/native IndexedDB + PostgreSQL; synthetic identity and fault injection, not physical Safari',results},null,2));if(results.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
