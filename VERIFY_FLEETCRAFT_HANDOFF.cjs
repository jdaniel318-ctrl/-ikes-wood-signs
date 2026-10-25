'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||'../fleetcraft-handoff-evidence.json');
const origin='https://handoff-fixture.invalid';
const scripts=['carve_fonts.js','fleet_design_assets.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js'].filter(n=>fs.existsSync(path.join(root,n)));
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="carvewright.css"></head><body>'+scripts.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const results=[];
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/carvewright-signcraft-browser/chrome-linux64/chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 async function check(name,fn){
  const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{const u=new URL(r.request().url()),n=u.pathname.slice(1);if(u.origin!==origin||(!scripts.includes(n)&&!['index.html','carvewright.css'].includes(n)))return r.abort();return r.fulfill({contentType:n.endsWith('.js')?'application/javascript':n.endsWith('.css')?'text/css':'text/html',body:n==='index.html'?html:fs.readFileSync(path.join(root,n))});});
  const result={name,pass:false};
  try{
   await page.goto(origin+'/index.html');
   await page.evaluate(async()=>{window.__auth=true;window.__scope={accountId:'Captain-fixture',businessId:'carvewright',backend:'offline',environment:'test',site:location.origin};window.__store=CarvewrightStore.create({scope:__scope,guard:()=>__auth});let d=CarvewrightCore.createDraft();d.title='Ike’s brief test';d.text.value='Smoke Hole!';d.request.vesselName='Ike’s Wood Signs';d.request.vesselId='ikes-wood-signs';d.request.jobReference='REFERENCE-7';d.request.brief='Black lettering. Confirm the real blank before production.';d=await CarvewrightCore.review(d,IkeCarveFonts);window.__saved=await __store.save(d,0);CarvewrightApp.open({scope:__scope,guard:()=>__auth,parent:document.body,referenceOnly:true});});
   const ready=()=>page.waitForFunction(()=>document.querySelector('#carvewrightApp')?.getAttribute('aria-busy')==='false');await ready();
   await page.locator('nav [data-cw-panel="handoff"]').click();await page.locator('#cwHandoffSelect').selectOption(await page.evaluate(()=>__saved.id));await ready();
   await page.locator('#cwPrepareHandoff').click();await ready();
   await fn(page,ready,result);assert.deepEqual(errors,[]);result.pass=true;
  }catch(e){result.error=e.message;}finally{results.push(result);console.log(JSON.stringify(result));await context.close();}
 }
 await check('explicit Ike handoff includes editable artwork and printable order brief',async p=>{
  const links=await p.locator('#cwDownloads .cw-file-link').evaluateAll(as=>as.map(a=>({name:a.dataset.filename||a.download,label:a.textContent})));
  assert.equal(links.length,4,'Expected SVG, editable JSON, order-brief JSON and printable HTML');
  const briefLink=links.find(a=>a.name.endsWith('-order-brief.json'));assert(briefLink);
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#cwDownloads .cw-file-link').filter({hasText:briefLink.name}).click()]);
  const brief=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.equal(brief.target.vesselId,'ikes-wood-signs');assert.equal(brief.orderCreated,false);assert.equal(brief.source.revision,1);
  assert.equal(brief.artwork.design.text.value,'Smoke Hole!');
  const print=links.find(a=>a.name.endsWith('-order-brief.html'));const [printDownload]=await Promise.all([p.waitForEvent('download'),p.locator('#cwDownloads .cw-file-link').filter({hasText:print.name}).click()]);const doc=fs.readFileSync(await printDownload.path(),'utf8');assert.match(doc,/Ike[’']s Wood Signs/);assert.match(doc,/<path /);assert.match(doc,/24 × 8/);
 });
 await check('newer saved revision blocks an already prepared download',async(p,ready)=>{
  let downloads=0;p.on('download',()=>downloads++);
  await p.evaluate(async()=>{const n=JSON.parse(JSON.stringify(__saved));n.title='Newer revision';n.review=null;await __store.save(n,__saved.revision);});
  await p.locator('#cwDownloads .cw-file-link').first().click();
  await p.waitForFunction(()=>/newer|changed|current revision/.test(document.querySelector('#cwStatus')?.textContent||''));await ready();
  assert.equal(downloads,0,'Stale saved artwork must not download');assert.equal(await p.locator('#cwDownloads .cw-file-link').count(),0);
 });
 await check('middle-click and link navigation cannot bypass saved-revision checks',async p=>{
  const downloads=[];p.on('download',d=>downloads.push(d.suggestedFilename()));
  await p.evaluate(async()=>{const n=JSON.parse(JSON.stringify(__saved));n.title='Updated elsewhere';n.review=null;await __store.save(n,__saved.revision);});
  await p.locator('#cwDownloads .cw-file-link').first().click({button:'middle'});
  await p.waitForTimeout(300);
  assert.deepEqual(downloads,[],'A middle-click must not download the stale revision');
  assert.equal(await p.locator('#cwDownloads [href^="blob:"]').count(),0,'Prepared controls must not expose a context-menu navigation route around validation');
 });
 await check('account isolation and revoked authorization release no handoff',async p=>{
  const other=await p.evaluate(async()=>{const s=CarvewrightStore.create({scope:{...__scope,accountId:'different-account'},guard:()=>true});const rows=await s.list();s.close();return rows.length;});assert.equal(other,0);
  await p.evaluate(()=>window.__auth=false);await p.waitForFunction(()=>!document.querySelector('#carvewrightApp'));assert.equal(await p.locator('#cwDownloads .cw-file-link').count(),0);
 });
 await browser.close();const summary={scope:'Isolated Chromium with real IndexedDB; no live customer stores',passed:results.filter(r=>r.pass).length,total:results.length,results};fs.writeFileSync(out,JSON.stringify(summary,null,2));process.exitCode=summary.passed===summary.total?0:1;
}
main().catch(e=>{console.error(e);process.exit(1);});
