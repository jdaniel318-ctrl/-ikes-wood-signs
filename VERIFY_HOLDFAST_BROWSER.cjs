const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.argv[2]||__dirname);
const out=process.argv[3]||path.join(root,'../holdfast-evidence/browser');fs.mkdirSync(out,{recursive:true});
const results=[];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});try{
const c=await b.newContext({viewport:{width:1366,height:1024},hasTouch:true,serviceWorkers:'block'}),p=await c.newPage();
await c.route('**/*',r=>{const u=new URL(r.request().url()),name=u.pathname.slice(1)||'index.html',file=path.resolve(root,name);if(u.origin!=='https://lifeboat.invalid'||!file.startsWith(root+'/')||!fs.existsSync(file))return r.abort();let body=fs.readFileSync(file);if(name==='app.js')body=Buffer.from(body.toString().replace('    await migrateLegacyPlatformStorage();',`    throw new DOMException('Synthetic quota failure before late event binding','QuotaExceededError');`));if(name==='DEPLOYMENT_MANIFEST.json'){let m=JSON.parse(body);let a=fs.readFileSync(path.join(root,'app.js'),'utf8').replace('    await migrateLegacyPlatformStorage();',`    throw new DOMException('Synthetic quota failure before late event binding','QuotaExceededError');`);m.runtime_integrity.files['app.js']=require('crypto').createHash('sha256').update(a).digest('hex');body=Buffer.from(JSON.stringify(m));}return r.fulfill({body,contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':name.endsWith('.json')?'application/json':name.endsWith('.css')?'text/css':'application/octet-stream'});});
await c.addInitScript(()=>{delete Navigator.prototype.serviceWorker;});
await p.goto('https://lifeboat.invalid/index.html');await p.waitForFunction(()=>window.__darkSkyReleaseGateState==='clear');await p.waitForFunction(()=>window.DarkSkyBootState?.ready===false);await p.locator('#blackFlagEntryPin').pressSequentially('5615');await p.locator('#blackFlagEntryUnlock').click();await p.locator('#engineConfigureBtn').click();await p.locator('summary').filter({hasText:/^Storage & Recovery$/}).click();
const BK='ikesWoodSignsOrdersBackupV15',D1='ikesOrderDraftV2',D2='ikesOrderDraftV2:ikes-wood-signs',CURRENT='blackFlagProjectDraftV1:ikes-wood-signs';
const row={id:'IKE-HOLDFAST-1',projectId:'ikes-wood-signs',wording:'Andie',photoData:'data:image/png;base64,full-photo',approvedPreviewData:'full-approved-proof',layout:{x:4,y:6}};
async function seed(){await p.evaluate(async({BK,D1,D2,CURRENT,row})=>{
 const db=await new Promise((res,rej)=>{const q=indexedDB.open('blackFlagPlatformV1');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
 await new Promise((res,rej)=>{const t=db.transaction('orders','readwrite'),s=t.objectStore('orders');s.clear();s.put({...row,updatedAt:'later'});s.put({id:'PLUMB-1',projectId:'legacy-plumbing',photoData:'other-ship'});t.oncomplete=res;t.onerror=()=>rej(t.error);});db.close();
 for(const [k,v] of Object.entries({[BK]:JSON.stringify([row]),[D1]:' {"wording":"Andie"} ',[D2]:'{"wording":"Unique draft"}',[CURRENT]:'{"wording":"Andie"}',blackFlagOrdersBackupV1:'[]',darkSkyV4LegacyQuarantineV1:'[]',darkSkyV4OrphanOrderTombstonesV1:'[]'}))localStorage.setItem(k,v);
 window.testGetAll=IDBObjectStore.prototype.getAll;window.testSetItem=Storage.prototype.setItem;window.testRemovals=[];
 window.testRemoveItem=Storage.prototype.removeItem;Storage.prototype.removeItem=function(k){const stack=new Error().stack;if(!/__dsStorageProbe8620/.test(stack))window.testRemovals.push(k);return window.testRemoveItem.call(this,k)};
}, {BK,D1,D2,CURRENT,row});}
async function prepare(){await p.locator('#engineLegacyPrepareBtn').tap();await p.waitForFunction(()=>/Recovery file ready|Preparation interrupted|No older Ike/.test(document.querySelector('#engineLegacyStatus').textContent));}
async function archiveBody(){return p.evaluate(async()=>await(await fetch(document.querySelector('#engineLegacyDownload').href)).text());}
async function verify(body){await p.locator('#engineLegacyVerifyFile').setInputFiles({name:'older-records.json',mimeType:'application/json',buffer:Buffer.from(body)});await p.waitForFunction(()=>/Saved file verified|File not verified/.test(document.querySelector('#engineLegacyVerification').textContent));}
await seed();
await p.locator('#engineRefreshDiagnosticsBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineStorageDetail').textContent.includes('Older Ike backup: 1'));
assert.match(await p.locator('#engineStorageDetail').textContent(),/Drafts: 1 current \/ 2 older/);results.push('Hull identifies older backup and both older drafts');
await p.evaluate(()=>{window.testWrites=0;window.testWriteKeys=[];Storage.prototype.setItem=function(k,v){if(this===localStorage){window.testWrites++;window.testWriteKeys.push({key:k,stack:new Error().stack});throw new DOMException('Synthetic quota','QuotaExceededError')}return window.testSetItem.call(this,k,v)}});
await prepare();assert.match(await p.locator('#engineLegacyStatus').textContent(),/All 3/);assert.equal(await p.locator('#engineLegacyRemoveBtn').isDisabled(),true);
let body=await archiveBody();const payload=JSON.parse(body);assert.equal(payload.entries.length,3);assert.equal(JSON.parse(payload.entries.find(x=>x.key===BK).raw)[0].approvedPreviewData,row.approvedPreviewData);
const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#engineLegacyDownload').tap()]);await download.saveAs(path.join(out,'synthetic-recovery.json'));assert.equal(await download.failure(),null);assert.equal(fs.readFileSync(path.join(out,'synthetic-recovery.json'),'utf8'),body);
assert.deepEqual(await p.evaluate(()=>window.testWriteKeys.filter(x=>/prepareOlderIkeRecovery|inspectOlderIkeRecords|verifyOlderIkeFile|removeOlderIkeCopies|refreshEngineDiagnostics/.test(x.stack)||/^(ikesWoodSignsOrdersBackupV15|ikesOrderDraftV2|blackFlagProjectDraftV1|blackFlagOrdersBackupV1)/.test(x.key))),[]);assert.deepEqual(await p.evaluate(()=>window.testRemovals),[]);results.push('Quota-full preservation: exact raw data downloaded, no storage writes');
const wrong=JSON.parse(body);wrong.entries.pop();await verify(JSON.stringify(wrong));assert.equal(await p.locator('#engineLegacyRemoveBtn').isDisabled(),true);results.push('Wrong saved file cannot enable cleanup');
await verify(body);assert.equal(await p.locator('#engineLegacyRemoveBtn').isDisabled(),false);assert.match(await p.locator('#engineLegacyRemoveBtn').textContent(),/2 verified/);
// Existing background diagnostics are blocked by the quota stub and excluded from recovery-write assertions.
// Saved-file verification alone cannot authorize changed source content.
await p.evaluate(({D1})=>window.testSetItem.call(localStorage,D1,'{"wording":"Changed while waiting"}'),{D1});
await p.locator('#engineLegacyRemoveBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineLegacyStatus').textContent.includes('Cleanup stopped'));
assert.deepEqual(await p.evaluate(()=>window.testRemovals),[]);assert.equal(await p.locator('#engineLegacyRemoveBtn').isDisabled(),true);results.push('Source changed after verification: no removals');
await p.evaluate(({D1})=>window.testSetItem.call(localStorage,D1,' {"wording":"Andie"} '),{D1});await prepare();body=await archiveBody();await verify(body);
// Canonical media changed after review: retain the older copy.
await p.evaluate(async(row)=>{const db=await new Promise(r=>{const q=indexedDB.open('blackFlagPlatformV1');q.onsuccess=()=>r(q.result)});await new Promise(r=>{const t=db.transaction('orders','readwrite');t.objectStore('orders').put({...row,photoData:'changed'});t.oncomplete=r;});db.close();},row);
await p.locator('#engineLegacyRemoveBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineLegacyStatus').textContent.includes('Cleanup stopped'));
assert.deepEqual(await p.evaluate(()=>window.testRemovals),[]);results.push('Current media changed: old source retained');
await p.evaluate(async(row)=>{const db=await new Promise(r=>{const q=indexedDB.open('blackFlagPlatformV1');q.onsuccess=()=>r(q.result)});await new Promise(r=>{const t=db.transaction('orders','readwrite');t.objectStore('orders').put(row);t.oncomplete=r;});db.close();},row);
await prepare();body=await archiveBody();await verify(body);
// Ending and re-entering the Engine invalidates pending cleanup.
await p.evaluate(()=>{window.testStalled=null;IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders')return window.testStalled={};return window.testGetAll.apply(this,a)}});
await p.locator('#engineLegacyRemoveBtn').tap();await p.waitForFunction(()=>!!window.testStalled?.onsuccess);
await p.evaluate(row=>{BlackFlagAuth.lock();BlackFlagAuth.unlock();document.body.classList.add('engine-mode');document.querySelector('#enginePanel').classList.remove('hidden');IDBObjectStore.prototype.getAll=window.testGetAll;window.testStalled.result=[row];window.testStalled.onsuccess();},row);
await p.waitForFunction(()=>document.querySelector('#engineLegacyStatus').textContent.includes('session changed'));assert.deepEqual(await p.evaluate(()=>window.testRemovals),[]);results.push('Lock and re-enter during cleanup cancels pending removal');
await prepare();body=await archiveBody();await verify(body);
// Responsive recovery cards and nested disclosure indicators.
for(const [name,width,height] of [['ipad-landscape',1366,1024],['ipad-portrait',1024,1366],['iphone',390,844]]){
 await p.setViewportSize({width,height});await p.locator('#olderIkeHeading').scrollIntoViewIfNeeded();
 const layout=await p.evaluate(()=>{const card=document.querySelector('#olderIkeHeading').closest('section');const b=card.getBoundingClientRect();return {width:innerWidth,left:b.left,right:b.right,overflow:card.scrollWidth>card.clientWidth+1};});
 assert.equal(await p.locator('#engineLegacyVerifyFile').evaluate(e=>getComputedStyle(e).opacity),'0');
 assert.ok(layout.left>=0&&layout.right<=width+1&&!layout.overflow,JSON.stringify(layout));await p.screenshot({path:path.join(out,name+'.png')});await p.locator('#engineLegacyVerifyFile').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,name+'-actions.png')});results.push(name+' recovery panel fits');
}
await p.setViewportSize({width:1366,height:1024});
await p.evaluate(()=>{const d=document.createElement('details');d.className='storage-report-details';d.id='testNested';d.innerHTML='<summary>Test nested details</summary><p>Body</p>';document.querySelector('#engineRecoveryGroup .protected-control-body').append(d);});
let state=await p.locator('#testNested summary').evaluate(e=>({open:e.parentElement.open,indicator:getComputedStyle(e,'::after').content}));assert.equal(state.open,false);assert.ok(state.indicator.includes('+'));await p.locator('#testNested summary').tap();state=await p.locator('#testNested summary').evaluate(e=>({open:e.parentElement.open,indicator:getComputedStyle(e,'::after').content}));assert.equal(state.open,true);assert.ok(state.indicator.includes('−'));results.push('Nested accordions correctly indicate their own state');
await p.locator('#engineLegacyRemoveBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineLegacyStatus').textContent.includes('Verified cleanup complete'));
const remaining=await p.evaluate(({BK,D1,D2,CURRENT})=>({backup:localStorage.getItem(BK),draft:localStorage.getItem(D1),unique:localStorage.getItem(D2),current:localStorage.getItem(CURRENT),removed:window.testRemovals,writes:window.testWrites}),{BK,D1,D2,CURRENT});
assert.equal(remaining.backup,null);assert.equal(remaining.draft,null);assert.equal(remaining.unique,'{"wording":"Unique draft"}');assert.equal(remaining.current,'{"wording":"Andie"}');assert.deepEqual(remaining.removed,[BK,D1]);assert.deepEqual(await p.evaluate(()=>window.testWriteKeys.filter(x=>/prepareOlderIkeRecovery|inspectOlderIkeRecords|verifyOlderIkeFile|removeOlderIkeCopies|refreshEngineDiagnostics/.test(x.stack)||/^(ikesWoodSignsOrdersBackupV15|ikesOrderDraftV2|blackFlagProjectDraftV1|blackFlagOrdersBackupV1)/.test(x.key))),[]);results.push('Verified cleanup removes only matching legacy keys and keeps unique/current work');
// Malformed legacy bytes remain downloadable and never eligible.
await p.evaluate(({BK})=>window.testSetItem.call(localStorage,BK,'broken { raw'),{BK});await prepare();body=await archiveBody();assert.equal(JSON.parse(body).entries.find(x=>x.key===BK).raw,'broken { raw');await verify(body);assert.equal(await p.locator('#engineLegacyRemoveBtn').isDisabled(),true);results.push('Malformed original preserved and kept');
// Failed primary read cannot create a comparison download.
await p.evaluate(()=>{IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders')throw Error('Synthetic read failure');return window.testGetAll.apply(this,a)}});
await prepare();assert.match(await p.locator('#engineLegacyStatus').textContent(),/interrupted/);assert.equal(await p.locator('#engineLegacyReady').isVisible(),false);assert.equal(await p.locator('#engineLegacyPrepareBtn').isDisabled(),false);results.push('Primary read failure: visible failure, no new recovery download');
// Stall and late completion cannot publish an artifact.
await p.evaluate(()=>{IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders')return window.testStalled={};return window.testGetAll.apply(this,a)}});
await p.locator('#engineLegacyPrepareBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineLegacyStatus').textContent.includes('20 seconds'),{},{timeout:25000});
assert.equal(await p.locator('#engineLegacyPrepareBtn').isDisabled(),false);
await p.evaluate(async()=>{window.testStalled.result=[];window.testStalled.onsuccess();await new Promise(r=>setTimeout(r,200));});assert.equal(await p.locator('#engineLegacyReady').isVisible(),false);results.push('Timeout leaves sources intact and ignores late completion');
await p.evaluate(()=>{IDBObjectStore.prototype.getAll=window.testGetAll;window.BlackFlagAuth.lock();document.querySelector('#engineLegacyPrepareBtn').click();document.querySelector('#engineLegacyRemoveBtn').click();});
assert.match(await p.locator('#engineLegacyStatus').textContent(),/Sign in/);assert.deepEqual(await p.evaluate(()=>window.testRemovals),[BK,D1]);results.push('Locked Engine cannot preserve or remove private records');
const result={passed:results.length,checks:results,scope:'Synthetic Chromium data and exact served source with startup quota injection. Native iPad acceptance pending.'};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
