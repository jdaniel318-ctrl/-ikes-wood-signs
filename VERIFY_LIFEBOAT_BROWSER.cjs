const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.argv[2]||__dirname);
const out=process.argv[3];
const results=[];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});try{
const c=await b.newContext({viewport:{width:1366,height:1024},hasTouch:true,serviceWorkers:'block'}),p=await c.newPage();
await c.route('**/*',r=>{const u=new URL(r.request().url()),name=u.pathname.slice(1)||'index.html',file=path.resolve(root,name);if(u.origin!=='https://lifeboat.invalid'||!file.startsWith(root+'/')||!fs.existsSync(file))return r.abort();let body=fs.readFileSync(file);if(name==='app.js')body=Buffer.from(body.toString().replace('    await migrateLegacyPlatformStorage();',`    throw new DOMException('Synthetic quota failure before late event binding','QuotaExceededError');`));if(name==='DEPLOYMENT_MANIFEST.json'){let m=JSON.parse(body);let a=fs.readFileSync(path.join(root,'app.js'),'utf8').replace('    await migrateLegacyPlatformStorage();',`    throw new DOMException('Synthetic quota failure before late event binding','QuotaExceededError');`);m.runtime_integrity.files['app.js']=require('crypto').createHash('sha256').update(a).digest('hex');body=Buffer.from(JSON.stringify(m));}return r.fulfill({body,contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':name.endsWith('.json')?'application/json':name.endsWith('.css')?'text/css':'application/octet-stream'});});
await c.addInitScript(()=>{delete Navigator.prototype.serviceWorker;});
await p.goto('https://lifeboat.invalid/index.html');await p.waitForFunction(()=>window.__darkSkyReleaseGateState==='clear');await p.waitForFunction(()=>window.DarkSkyBootState?.ready===false);await p.locator('#blackFlagEntryPin').fill('5615');await p.locator('#blackFlagEntryUnlock').click();await p.locator('#engineConfigureBtn').click();await p.locator('summary').filter({hasText:/^Storage & Recovery$/}).click();await p.locator('#engineExportBtn').tap();
await p.waitForFunction(()=>document.querySelector('#engineBackupStatus')?.textContent.includes('BACKUP READY'));
assert.equal(await p.locator('#engineExportBtn').isDisabled(),false);
results.push('Export responds after startup quota failure');
// Seed real IndexedDB records; simulate full localStorage only after startup.
await p.evaluate(async()=>{
 const db=await new Promise((res,rej)=>{const q=indexedDB.open('blackFlagPlatformV1');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
 await new Promise((res,rej)=>{const tx=db.transaction(['orders','settings'],'readwrite');tx.objectStore('orders').put({id:'IKE-LIFEBOAT-1',projectId:'ikes-wood-signs',wording:'Preserve me',photoData:'data:image/png;base64,cHJlc2VydmU='});tx.objectStore('settings').put({key:'lifeboat-test',value:'Keep this setting'});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();
 localStorage.setItem('darkSkyV4LegacyQuarantineV1','[]');
 const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===localStorage)throw new DOMException('Synthetic full localStorage','QuotaExceededError');return original.call(this,k,v)};
});
await p.locator('#engineExportBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineBackupStatus')?.textContent.includes('BACKUP READY'));
const link=p.locator('#engineBackupStatus a[download]');
const body=await p.evaluate(async()=>await (await fetch(document.querySelector('#engineBackupStatus a').href)).json());
assert.equal(body.orders.find(x=>x.id==='IKE-LIFEBOAT-1').photoData,'data:image/png;base64,cHJlc2VydmU=');
assert.equal(body.settings.find(x=>x.key==='lifeboat-test').value,'Keep this setting');
const [download]=await Promise.all([p.waitForEvent('download'),link.tap()]);assert.equal(await download.failure(),null);
assert.match(download.suggestedFilename(),/captains-backup/);results.push('Full localStorage: actual download retains order media and settings');
// A stale database connection must reopen without writing diagnostics into full storage.
await p.evaluate(()=>{const getAll=IDBObjectStore.prototype.getAll;let first=true;IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders'&&first){first=false;throw new DOMException('Synthetic closed connection','InvalidStateError')}return getAll.apply(this,a)};});
await p.locator('#engineExportBtn').tap();await p.waitForFunction(()=>/BACKUP READY|INTERRUPTED/.test(document.querySelector('#engineBackupStatus')?.textContent||''));
assert.match(await p.locator('#engineBackupStatus').textContent(),/BACKUP READY/);results.push('Full localStorage: stale database connection recovers without diagnostic writes');
// A primary read failure must not be advertised as a successful local-only backup.
await p.evaluate(()=>{window.testOriginalGetAll=IDBObjectStore.prototype.getAll;IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders')throw new Error('Synthetic order read failed');return window.testOriginalGetAll.apply(this,a)}});
await p.locator('#engineExportBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineBackupStatus')?.textContent.includes('INTERRUPTED'));
assert.equal(await p.locator('#engineBackupStatus a').count(),0);assert.equal(await p.locator('#engineExportBtn').isDisabled(),false);results.push('Unreadable primary orders: visible error, no partial download');
// Stall requests without mutating any records; timeout must release the button.
await p.evaluate(()=>{IDBObjectStore.prototype.getAll=function(...a){if(this.name==='orders')return window.testStalledRequest={};return window.testOriginalGetAll.apply(this,a)}});
await p.locator('#engineExportBtn').tap();await p.waitForFunction(()=>document.querySelector('#engineBackupStatus')?.textContent.includes('20 seconds'),{},{timeout:25000});
assert.equal(await p.locator('#engineBackupStatus a').count(),0);assert.equal(await p.locator('#engineExportBtn').isDisabled(),false);
await p.evaluate(async()=>{window.testStalledRequest.result=[];window.testStalledRequest.onsuccess();await new Promise(r=>setTimeout(r,250));});
assert.equal(await p.locator('#engineBackupStatus a').count(),0);results.push('Stalled read: bounded error, late completion cannot create a download');
await p.evaluate(()=>{IDBObjectStore.prototype.getAll=window.testOriginalGetAll;window.BlackFlagAuth.lock();document.querySelector('#engineExportBtn').click()});
assert.match(await p.locator('#engineBackupStatus').textContent(),/Sign in/);assert.equal(await p.locator('#engineBackupStatus a').count(),0);results.push('Locked Engine cannot export');
const result={passed:results.length,checks:results,scope:'Offline Chromium with synthetic startup failure, full localStorage and real IndexedDB; native Safari pending'};
console.log(JSON.stringify(result));if(out)fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');

}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
