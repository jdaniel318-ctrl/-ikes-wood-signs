'use strict';
// Focused, offline handoff verification. Production source is served unchanged.
// Authority is synthetic; PDF generation, DOM actions and IndexedDB remain real.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {createRequire}=require('node:module');
const runtimeRequire=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright','package.json'));
const {chromium}=runtimeRequire('playwright');
const ROOT=path.resolve(process.argv[2]||path.join(__dirname,'../release'));
const OUT=path.resolve(process.argv[3]||path.join(__dirname,'browser-pdf-handoff'));
const PHASE=process.argv[4]||'after';
const BASELINE=path.resolve(process.env.QUARTERMASTER_BASELINE||ROOT);
const ORIGIN='https://quartermaster-pdf-handoff.invalid';
// The native Chromium PDF viewer is browser-local, not a network dependency.
// Permit only its exact built-in extension host and Chrome's resource host.
const browserLocal=u=>(u.protocol==='chrome-extension:'&&u.hostname==='mhjfbmdgcfjbbpaeojofohoefgiehjai')||(u.protocol==='chrome:'&&u.hostname==='resources');
fs.mkdirSync(OUT,{recursive:true});
const fixtureSource=fs.readFileSync(path.join(BASELINE,'VERIFY_QUARTERMASTER_UI.cjs'),'utf8');
const presentationSource=fs.readFileSync(path.join(BASELINE,'VERIFY_QUARTERMASTER_PRESENTATION.cjs'),'utf8');
function extract(source,start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a,'Baseline utility boundaries found');return source.slice(a,b);}
const initFixture=vm.runInNewContext(extract(fixtureSource,'function initFixture(','async function launch(')+'\ninitFixture;');
const helpers=vm.runInNewContext(extract(fixtureSource,'async function waitReady(','async function prepare(')+'\n({waitReady,openWorkspace,workspace,navigate,idle,saved});',{assert});
const HOST=vm.runInNewContext(extract(presentationSource,'const styles=','const ORIGIN=')+'\nworkspaceHTML;');
const {waitReady,openWorkspace,workspace,navigate,idle,saved}=helpers;
const results=[],builds=new Set();
let browser;
async function fixture(size=[1024,768]){
 const context=await browser.newContext({viewport:{width:size[0],height:size[1]},acceptDownloads:true,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(initFixture());
 const served=new Set(),blocked=[],errors=[],browserResources=[];
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname).replace(/^\//,'');
  if(route.request().method()==='GET'&&browserLocal(u)){browserResources.push(u.href);return route.continue();}
  if(u.origin!==ORIGIN||name.includes('/')||route.request().method()!=='GET'){blocked.push({url:u.href,protocol:u.protocol,origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();}
  const file=path.join(ROOT,name);
  const body=name==='index.html'?Buffer.from(HOST):fs.existsSync(file)&&fs.statSync(file).isFile()?fs.readFileSync(file):null;
  if(!body){blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();}
  served.add(name);
  const contentType=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.html')?'text/html':name.endsWith('.png')?'image/png':name.endsWith('.jpg')?'image/jpeg':'application/octet-stream';
  return route.fulfill({status:200,body,contentType});
 });
 const page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(ORIGIN+'/index.html');await waitReady(page);builds.add(await page.evaluate(()=>BlackFlagQuartermasterUI.build));
 return {context,page,served,blocked,errors,browserResources};
}
async function example(p){
 await openWorkspace(p);await p.locator('#qmExampleQuote').click();await saved(p,'Example quote saved');
 return (await workspace(p)).documents[0];
}
async function prepare(p){await p.locator('#qmPdf').click();await p.locator('#qmDownloadReady a').first().waitFor();await idle(p);}
const OPEN='#qmDownloadReady a.qm-open-pdf',DOWNLOAD='#qmDownloadReady a.qm-download';
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function settleScroll(p,selector){
 await p.locator(selector).scrollIntoViewIfNeeded();
 await p.evaluate(()=>new Promise(resolve=>{let previous='',stable=0;const poll=()=>{const now=[scrollX,scrollY,document.querySelector('#qmContent')?.scrollTop].join(',');stable=now===previous?stable+1:0;previous=now;if(stable>=5)resolve();else requestAnimationFrame(poll);};poll();}));
}
async function blobMeta(p,url){return p.evaluate(async url=>{const r=await fetch(url),bytes=new Uint8Array(await r.arrayBuffer());const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');return {type:r.headers.get('content-type'),bytes:bytes.length,header:String.fromCharCode(...bytes.subarray(0,8)),sha256:hash};},url);}
async function assertRevoked(p,url){const rejected=await p.evaluate(async url=>{try{await fetch(url);return false;}catch(_){return true;}},url);assert(rejected,'Old prepared object URL must no longer resolve');}
async function handoffState(p){
 const dom=await p.evaluate(()=>({url:location.href,documentUri:document.documentURI,open:BlackFlagQuartermasterUI.isWorkspaceOpen(),dialogOpen:document.querySelector('#quartermasterWorkspace')?.open,dialogHTML:document.querySelector('#quartermasterWorkspace')?.innerHTML,business:document.querySelector('#qmBusiness')?.value,documentNumber:document.querySelector('.qm-doc-head .qm-code')?.textContent,scroll:{x:scrollX,y:scrollY,content:document.querySelector('#qmContent')?.scrollTop},session:{account:fixture.account,stamp:fixture.stamp,reusable:fixture.reusable,checks:fixture.checks,completedChecks:fixture.completedChecks},writes:fixture.idbWrites.length,localStorage:Object.fromEntries(Object.entries(localStorage)),sessionStorage:Object.fromEntries(Object.entries(sessionStorage))}));
 return {...dom,workspace:await workspace(p)};
}
async function checkpoint(p,selector){await settleScroll(p,selector);return {state:await handoffState(p),document:await p.evaluateHandle(()=>document),dialog:await p.locator('#quartermasterWorkspace').elementHandle()};}
async function unchanged(p,before){
 assert.equal(await before.document.evaluate(d=>d===document),true,'Original document object remains live');
 assert.equal(await before.dialog.evaluate(d=>d.isConnected&&d===document.querySelector('#quartermasterWorkspace')),true,'Original dialog remains live');
 const after=await handoffState(p);assert.deepEqual(after,before.state,'Workspace URL, DOM, scroll, document, local records and session remain unchanged');
 return {url:after.url,documentNumber:after.documentNumber,business:after.business,scroll:after.scroll,session:after.session,workspaceRevision:after.workspace.revision,catalogItems:after.workspace.catalog.length,documents:after.workspace.documents.length,workspaceSha256:digest(JSON.stringify(after.workspace)),writes:after.writes,sameDocument:true,sameDialog:true};
}
async function actions(p,doc){
 assert.equal(await p.locator(OPEN).count(),1,'Prepared PDF must offer Open PDF in new tab');
 assert.equal(await p.locator(DOWNLOAD).count(),1,'Prepared PDF offers one Download PDF action');
 const links=await p.locator('#qmDownloadReady a').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent,href:n.href,target:n.getAttribute('target'),download:n.getAttribute('download'),rel:n.getAttribute('rel'),actionRow:n.parentElement.classList.contains('qm-actions')})));
 const open=links.find(n=>n.label==='Open PDF in new tab'),download=links.find(n=>n.label==='Download PDF');assert(open&&download,'Both explicit PDF choices are visible');
 assert.equal(open.download,null,'Open action must not force a download');assert.equal(download.download,doc.number+'.pdf','Download retains the saved document filename');
 for(const link of [open,download]){assert.equal(link.target,'_blank','PDF handoff must target a separate tab');assert.deepEqual(link.rel.split(/\s+/).sort(),['noopener','noreferrer']);assert(link.actionRow,'PDF actions share the wrapping action row');}
 assert.equal(open.href,download.href,'Both choices use the same prepared snapshot');
 return links;
}
async function openNativePdf(fx,selector,before){
 const url=await fx.page.locator(selector).getAttribute('href'),pending=fx.context.waitForEvent('page');await fx.page.locator(selector).click();const pdf=await pending;
 await pdf.waitForURL(url);await pdf.waitForLoadState('domcontentloaded');await pdf.waitForLoadState('networkidle',{timeout:15000});
 const view=await pdf.evaluate(()=>({url:location.href,contentType:document.contentType,embeddedPdf:!!document.querySelector('embed[type="application/pdf"]'),openerIsNull:window.opener===null}));
 assert(view.contentType==='application/pdf'||view.embeddedPdf,'New tab renders the actual PDF response');assert.equal(view.openerIsNull,true,'PDF tab has no browser opener access');
 await pdf.screenshot({path:path.join(OUT,selector===OPEN?'native-pdf-tab.png':'fallback-pdf-tab.png'),fullPage:true});
 const continuity=await unchanged(fx.page,before);await pdf.close();await fx.page.bringToFront();await unchanged(fx.page,before);
 return {view,continuity};
}
async function downloadNative(p,selector,label){const pending=p.waitForEvent('download');await p.locator(selector).click();const d=await pending;assert.equal(await d.failure(),null,'Native browser download completes');const dest=path.join(OUT,label+'-'+d.suggestedFilename());await d.saveAs(dest);return {filename:d.suggestedFilename(),path:dest,bytes:fs.readFileSync(dest)};}
async function run(name,size,fn){
 if(process.env.QUARTERMASTER_ONLY&&!name.includes(process.env.QUARTERMASTER_ONLY))return;
 const fx=await fixture(size),row={name,pass:false};
 try{await fn(fx,row);assert.deepEqual(fx.errors,[],'No uncaught browser errors');assert.deepEqual(fx.blocked,[],'No external or missing resource requests');row.pass=true;}
 catch(e){row.error=e.stack;try{await fx.page.screenshot({path:path.join(OUT,name.replace(/[^a-z0-9]+/gi,'-')+'.png'),fullPage:true});row.visibleText=(await fx.page.locator('body').innerText()).slice(-6000);}catch(_){}console.error(name+': '+e.message);}
 finally{row.served=[...fx.served].sort();row.browserInternalResources=[...new Set(fx.browserResources)].sort();row.blockedRequests=fx.blocked;results.push(row);await fx.context.close();console.log(JSON.stringify({name,pass:row.pass,...(row.error?{error:row.error.split('\n')[0]}:{})}));}
}
function sourceHashes(){return Object.fromEntries(['quartermaster.js','quartermaster.css','styles.css','business_deck.css','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','VERIFY_QUARTERMASTER_UI.cjs','VERIFY_QUARTERMASTER_PRESENTATION.cjs'].map(n=>[n,digest(fs.readFileSync(path.join(ROOT,n)))]));}
async function geometry(p){return p.evaluate(()=>{const d=document.querySelector('#quartermasterWorkspace'),r=d.getBoundingClientRect();return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,dialog:{left:r.left,right:r.right},links:[...document.querySelectorAll('#qmDownloadReady a')].map(n=>{const r=n.getBoundingClientRect();return {label:n.textContent,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})};});}
async function reach(p,selector){await settleScroll(p,selector);await p.locator(selector).focus();return p.evaluate(selector=>{const n=document.querySelector(selector),r=n.getBoundingClientRect(),box=document.querySelector('#qmContent').getBoundingClientRect();const left=Math.max(0,r.left,box.left),right=Math.min(innerWidth,r.right,box.right),top=Math.max(0,r.top,box.top),bottom=Math.min(innerHeight,r.bottom,box.bottom),hit=document.elementFromPoint((left+right)/2,(top+bottom)/2);return {label:n.textContent,focused:document.activeElement===n,width:r.width,height:r.height,visibleWidth:right-left,visibleHeight:bottom-top,hit:n===hit||n.contains(hit)};},selector);}
async function main(){
 browser=await chromium.launch({executablePath:process.env.QUARTERMASTER_CHROMIUM||'/tmp/quartermaster-chromium/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 if(PHASE==='before')await run('prepared PDF has a separate native open action',[1024,768],async({page:p},row)=>{
  const doc=await example(p);await prepare(p);
  row.documentNumber=doc.number;row.actions=await p.locator('#qmDownloadReady a').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent,target:n.getAttribute('target'),download:n.getAttribute('download'),rel:n.getAttribute('rel')})));
  assert.equal(await p.locator('#qmDownloadReady a.qm-open-pdf').count(),1,'Prepared PDF must offer Open PDF in new tab');
 });
 else {
  await run('open PDF in a native new tab preserves the active workspace',[1024,768],async(fx,row)=>{
   const p=fx.page,doc=await example(p);await prepare(p);row.actions=await actions(p,doc);const url=await p.locator(OPEN).getAttribute('href');row.pdf=await blobMeta(p,url);assert.equal(row.pdf.type,'application/pdf');assert.equal(row.pdf.header,'%PDF-1.7');
   const before=await checkpoint(p,OPEN);Object.assign(row,await openNativePdf(fx,OPEN,before));
  });
  await run('native PDF download preserves filename bytes and workspace',[1024,768],async(fx,row)=>{
   const p=fx.page,doc=await example(p);await prepare(p);await actions(p,doc);const meta=await blobMeta(p,await p.locator(DOWNLOAD).getAttribute('href')),before=await checkpoint(p,DOWNLOAD),d=await downloadNative(p,DOWNLOAD,'native');
   assert.equal(d.filename,doc.number+'.pdf');assert.equal(d.bytes.subarray(0,8).toString(),'%PDF-1.7');assert.equal(digest(d.bytes),meta.sha256,'Downloaded bytes equal the prepared snapshot');
   const pdfText=cp.execFileSync('pdftotext',['-layout',d.path,'-'],{encoding:'utf8'});for(const value of ['Sample Customer','Quote total','$6,271.00'])assert(pdfText.includes(value),'Downloaded PDF contains '+value);
   row.download={filename:d.filename,bytes:d.bytes.length,sha256:digest(d.bytes),savedSnapshotTextVerified:true};row.continuity=await unchanged(p,before);
  });
  await run('download preview fallback opens separately when download is ignored',[1024,768],async(fx,row)=>{
   const p=fx.page;await example(p);await prepare(p);await p.locator(DOWNLOAD).evaluate(n=>n.removeAttribute('download'));const before=await checkpoint(p,DOWNLOAD);Object.assign(row,await openNativePdf(fx,DOWNLOAD,before));row.simulation='Harness removes only the download attribute from the real anchor to exercise its native target fallback; this is not native Safari evidence.';
  });
  for(const [label,selector]of [['open',OPEN],['download',DOWNLOAD]])await run('stale session blocks PDF '+label+' at click time',[1024,768],async(fx,row)=>{
   const p=fx.page;await example(p);await prepare(p);const url=await p.locator(selector).getAttribute('href'),originalUrl=p.url(),stored=await workspace(p),pages=[],downloads=[];
   fx.context.on('page',q=>pages.push(q));p.on('download',d=>downloads.push(d.suggestedFilename()));
   await p.locator(selector).evaluate(n=>{n.addEventListener('click',()=>{fixture.stamp++;},{capture:true,once:true});});
   await p.locator(selector).click();await p.waitForFunction(()=>!document.querySelector('#quartermasterWorkspace'));await p.waitForTimeout(150);
   assert.equal(p.url(),originalUrl);assert.equal(pages.length,0,'Denied link creates no new tab');assert.deepEqual(downloads,[],'Denied link starts no download');assert.equal(await p.evaluate(()=>BlackFlagQuartermasterUI.isWorkspaceOpen()),false);assert.deepEqual(await workspace(p),stored,'Saved local records survive session closure');await assertRevoked(p,url);
   row.noTabs=true;row.noDownloads=true;row.closed=true;row.revoked=true;row.staleTiming='Synthetic session stamp changes in the real anchor capture phase immediately before its production click guard, before the periodic timer can intervene.';
  });
  await run('dirty document input clears and revokes prepared PDF',[1024,768],async({page:p},row)=>{
   await example(p);await prepare(p);const url=await p.locator(OPEN).getAttribute('href'),stored=await workspace(p);
   await p.locator('#qmCustomerName').evaluate(n=>{n.value='Unsaved synthetic edit';n.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.equal(await p.locator('#qmDownloadReady a').count(),0);assert.equal(await p.locator('#qmPdf').isDisabled(),true);assert((await p.locator('#qmStatus').textContent()).includes('Unsaved changes'));await assertRevoked(p,url);assert.deepEqual(await workspace(p),stored);
   row.revoked=true;row.savedRecordsUnchanged=true;row.inputScope='Real document field and production input handler; the harness dispatches input because the field is hidden while Review and PDF is active.';
  });
  await run('changing documents removes and revokes the previous PDF',[1024,768],async({page:p},row)=>{
   const first=await example(p);await navigate(p,'overview');await p.locator('#qmExampleQuote').click();await saved(p,'Example quote saved');const records=await workspace(p);assert.equal(records.documents.length,2);await prepare(p);const url=await p.locator(OPEN).getAttribute('href');
   await p.locator('#qmBackDocuments').click();await p.locator('[data-qm-open-doc="'+first.id+'"]').click();await idle(p);assert.equal(await p.locator('.qm-doc-head .qm-code').textContent(),first.number);assert.equal(await p.locator('#qmDownloadReady a').count(),0);await assertRevoked(p,url);assert.deepEqual(await workspace(p),records);row.revoked=true;row.openDocument=first.number;
  });
  await run('changing business removes and revokes the previous PDF',[1024,768],async({page:p},row)=>{
   await example(p);await prepare(p);const url=await p.locator(OPEN).getAttribute('href'),records=await workspace(p);await p.locator('#qmBusiness').selectOption('other-business');await saved(p,'Business workspace opened');assert.equal(await p.locator('#qmDownloadReady a').count(),0);await assertRevoked(p,url);assert.deepEqual(await workspace(p),records);assert.equal(await p.locator('#qmBusiness').inputValue(),'other-business');row.revoked=true;row.originalBusinessRecordsUnchanged=true;
  });
  await run('closing workspace removes and revokes prepared PDF',[1024,768],async({page:p},row)=>{
   await example(p);await prepare(p);const url=await p.locator(OPEN).getAttribute('href'),records=await workspace(p);await p.locator('#qmClose').click();assert.equal(await p.locator('#quartermasterWorkspace').count(),0);await assertRevoked(p,url);assert.deepEqual(await workspace(p),records);row.revoked=true;row.savedRecordsUnchanged=true;
  });
  await run('JSON backup remains a single unchanged native download',[1024,768],async({page:p},row)=>{
   await example(p);await navigate(p,'settings');await p.locator('#qmBackup').click();await p.locator(DOWNLOAD).waitFor();await idle(p);assert.equal(await p.locator('#qmDownloadReady a').count(),1);assert.equal(await p.locator(OPEN).count(),0);assert.equal(await p.locator(DOWNLOAD).textContent(),'Download backup');assert.equal(await p.locator(DOWNLOAD).getAttribute('target'),null);assert.equal(await p.locator(DOWNLOAD).getAttribute('rel'),null);
   const meta=await blobMeta(p,await p.locator(DOWNLOAD).getAttribute('href'));assert.equal(meta.type,'application/json');const before=await checkpoint(p,DOWNLOAD),d=await downloadNative(p,DOWNLOAD,'backup'),envelope=JSON.parse(d.bytes);assert.match(d.filename,/^Quartermaster-HH-\d{4}-\d{2}-\d{2}\.json$/);assert.equal(envelope.schema,'blackflag.quartermaster.backup.v1');assert.deepEqual(envelope.workspace,before.state.workspace);assert.equal(digest(d.bytes),meta.sha256);row.download={filename:d.filename,bytes:d.bytes.length,sha256:digest(d.bytes)};row.continuity=await unchanged(p,before);
  });
  for(const [label,size]of [['tablet-landscape',[1024,768]],['tablet-portrait',[768,1024]],['phone',[390,844]]])await run('PDF actions are reachable at '+label+' viewport',size,async({page:p},row)=>{
   const doc=await example(p);await prepare(p);await actions(p,doc);row.reachability=[];for(const selector of [OPEN,DOWNLOAD]){const r=await reach(p,selector);assert(r.width>=44&&r.height>=44,'Action touch target is at least 44px');assert(r.visibleWidth>=44&&r.visibleHeight>=43.5&&r.focused&&r.hit,'Action is fully reachable and can receive pointer and keyboard focus');row.reachability.push(r);}
   const g=await geometry(p);assert(g.documentWidth<=g.width+1,'No horizontal document overflow');assert(g.dialog.left>=-1&&g.dialog.right<=g.width+1,'Dialog stays within viewport');for(const link of g.links)assert(link.left>=-1&&link.right<=g.width+1,'Action stays within viewport');row.geometry=g;await p.screenshot({path:path.join(OUT,'pdf-actions-'+label+'.png'),fullPage:true});
  });
 }
 const report={phase:PHASE,root:ROOT,utilityRoot:BASELINE,browser:browser.version(),build:[...builds].join(','),scope:'Real Quartermaster modules, native IndexedDB, saved-snapshot PDF generation and native browser tab/download actions; complete styles.css, business_deck.css and quartermaster.css; exact professional Admiral host template and authority fixtures reused from retained .51 verifier utilities. Synthetic authority only; all external requests blocked. Exact built-in PDF extension host and chrome://resources/ are allowed as browser-local dependencies and their exact URLs recorded separately. Original URL, live document/dialog identity, scroll, full local workspace and session counters compared around handoff. Chromium viewport emulation, not native iPad Safari. The fallback case removes the real download attribute in the harness; the dirty case dispatches input to the real hidden document field. No production test hooks.',sources:sourceHashes(),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};
 fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({phase:PHASE,passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
