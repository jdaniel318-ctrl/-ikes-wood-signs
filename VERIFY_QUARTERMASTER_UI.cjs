'use strict';
const fs=require('node:fs');const path=require('node:path');
const {createRequire}=require('node:module');
const runtimeRequire=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright','package.json'));
const {chromium}=runtimeRequire('playwright');
const ORIGIN='https://quartermaster-fixture.invalid';
const MODULES=['quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','quartermaster.js'];
const HOST='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated Quartermaster developer fixture</title><link rel="stylesheet" href="quartermaster.css"></head><body><section id="admiralDeck"><h1>Synthetic verified Admiral fixture</h1><button id="quartermasterLaunch" type="button">Open Quartermaster</button></section>'+MODULES.map(x=>'<script src="'+x+'"></script>').join('')+'</body></html>';
function initFixture(options={}){
 const cfg={account:'synthetic-admiral-a',backend:'https://synthetic-backend.invalid',environment:'isolated-qa',authority:true,reusable:true,...options};
 return '('+function(cfg){
 window.fixture={...cfg,stamp:100,checks:0,completedChecks:0,rpcs:[],idbOpens:[],idbWrites:[],idbBlocked:false,idbWriteBlocked:false,authWait:false,authRelease:null};
 const records=[{project_id:'househull',display_name:'HouseHull',name:'HouseHull',vessel_name:'HouseHull'},{project_id:'other-business',display_name:'Other synthetic business',name:'Other synthetic business'}];
 window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp}),noteProgramActivity:()=>{}};
 window.DarkSkyReadAdmiralFleet=()=>records;
 window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:fixture.backend,environment:fixture.environment,env:fixture.environment,publishableKey:'synthetic-public-key'})}};
 window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.account},access_token:'SYNTHETIC-NEVER-SENT'}),verifyAdmiralAuthority:async()=>{fixture.checks++;if(fixture.authWait)await new Promise(resolve=>fixture.authRelease=resolve);fixture.completedChecks++;return fixture.authority;},rpc:async(name,body)=>{fixture.rpcs.push({name,body});if(name!=='admiral_list_vessels_for_branding')throw Error('Unexpected synthetic RPC '+name);return {records};}})};
 const open=IDBFactory.prototype.open;
 IDBFactory.prototype.open=function(name){fixture.idbOpens.push(String(name));if(fixture.idbBlocked)throw new DOMException('Synthetic storage blocked','SecurityError');return Reflect.apply(open,this,arguments);};
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){fixture.idbWrites.push({store:this.name,key:String(key)});if(fixture.idbWriteBlocked)throw new DOMException('Synthetic storage quota','QuotaExceededError');return Reflect.apply(put,this,arguments);};
 }+')('+JSON.stringify(cfg)+');';
}
async function launch(){return chromium.launch({executablePath:process.env.QUARTERMASTER_CHROMIUM||'/tmp/quartermaster-chromium/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});}
async function fixture(browser,root,options={}){
 const context=await browser.newContext({viewport:{width:options.width||1280,height:options.height||900},serviceWorkers:'block',acceptDownloads:true});
 const served=new Set(),blocked=[],errors=[];await context.addInitScript(initFixture(options));
 await context.route('**/*',async route=>{
 const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname.split('/').pop()||'index.html');
 if(u.origin===ORIGIN&&route.request().method()==='GET'&&(name==='index.html'||(!name.includes('/')&&fs.existsSync(path.join(root,name))&&fs.statSync(path.join(root,name)).isFile()))){
 served.add(name);const body=name==='index.html'?Buffer.from(HOST):fs.readFileSync(path.join(root,name));
 const contentType=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.html')?'text/html':name.endsWith('.ttf')?'font/ttf':'application/octet-stream';
 await route.fulfill({status:200,body,contentType});
 }else{blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});await route.abort();}
 });
 const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(String(e)));await page.goto(ORIGIN+'/fleet/index.html');
 return {context,page,served,blocked,errors,root};
}


// Main workflow assertions for the real Quartermaster module.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');const cp=require('node:child_process');
const RELEASE=path.resolve(process.argv[2]||__dirname);
const OUT=path.resolve(process.argv[3]||path.join(RELEASE,'../qa/browser'));
fs.mkdirSync(OUT,{recursive:true});
const results=[];let savedBackup=null,savedQuote=null;
async function waitReady(p){await p.waitForFunction(()=>!!window.BlackFlagQuartermasterUI);}
async function openWorkspace(p,business='househull'){
 await waitReady(p);await p.evaluate(b=>BlackFlagQuartermasterUI.open(b),business);
 await p.waitForFunction(()=>window.BlackFlagQuartermasterUI.isWorkspaceOpen());
 await p.locator('#qmBusiness').waitFor();await idle(p);
}
async function workspace(p,business='househull'){
 return p.evaluate(async business=>{
 const req=indexedDB.open('blackflag-quartermaster-v1',1);const db=await new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
 try{return await new Promise((resolve,reject)=>{const t=db.transaction('workspaces','readonly'),r=t.objectStore('workspaces').getAll();r.onsuccess=()=>resolve(r.result.find(w=>w.scope.businessId===business&&w.scope.accountId===fixture.account)||null);r.onerror=()=>reject(r.error);});}finally{db.close();}
 },business);
}
async function navigate(p,tab){await p.locator('[data-qm-tab="'+tab+'"]').click();}
async function checkNoOverflow(p,label){
 const m=await p.evaluate(()=>{const d=document.querySelector('#quartermasterWorkspace'),r=d.getBoundingClientRect();return {window:innerWidth,docWidth:document.documentElement.scrollWidth,dialog:{x:r.x,right:r.right,width:r.width},overflow:[...d.querySelectorAll('input,select,textarea,button')].filter(e=>e.getClientRects().length&&!e.closest('.qm-tabs,.qm-table-scroll')).map(e=>({id:e.id,rect:e.getBoundingClientRect()})).filter(e=>e.rect.right>innerWidth+1||e.rect.x< -1).map(e=>e.id)};});
 assert(m.docWidth<=m.window+1,label+': body horizontal overflow '+JSON.stringify(m));assert(m.dialog.x>=-1&&m.dialog.right<=m.window+1,label+': dialog outside viewport '+JSON.stringify(m));assert.deepEqual(m.overflow,[],label+': controls outside viewport');return m;
}
async function idle(p){await p.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');}
async function saved(p,text){await p.waitForFunction(t=>document.querySelector('#qmStatus')?.textContent.includes(t),text);await idle(p);}
async function prepare(p,button){await p.locator(button).click();await p.locator('#qmDownloadReady a').waitFor();await idle(p);return download(p,'#qmDownloadReady a');}
async function download(p,button){const pending=p.waitForEvent('download');await p.locator(button).click();const d=await pending;assert(!await d.failure());const dest=path.join(OUT,d.suggestedFilename());await d.saveAs(dest);return {filename:d.suggestedFilename(),path:dest,bytes:fs.readFileSync(dest)};}
async function run(name,options,fn){const fx=await fixture(browser,RELEASE,options);fx.page.on('dialog',d=>d.accept());const row={name,pass:false};try{await fn(fx,row);assert.deepEqual(fx.errors,[],'Uncaught browser errors');row.pass=true;}catch(e){row.error=e.stack;try{await fx.page.screenshot({path:path.join(OUT,name.replace(/[^a-z0-9]+/gi,'-')+'.png'),fullPage:true});row.visibleText=(await fx.page.locator('body').innerText()).slice(0,6000);}catch(_){}console.error(name+': '+e.message);}finally{row.served=[...fx.served].sort();row.blockedRequests=fx.blocked;results.push(row);await fx.context.close();console.log(JSON.stringify({name,pass:row.pass,...(row.error?{error:row.error.split('\n')[0]}:{})}));}}
let browser;
(async()=>{
 browser=await launch();
 await run('denied authority never opens durable workspace',{authority:false},async({page:p},row)=>{
 await waitReady(p);await p.evaluate(()=>BlackFlagQuartermasterUI.open());await p.waitForFunction(()=>fixture.completedChecks>0);await p.waitForTimeout(50);
 assert.equal(await p.evaluate(()=>BlackFlagQuartermasterUI.isWorkspaceOpen()),false);assert.deepEqual(await p.evaluate(()=>fixture.idbOpens),[]);row.nativeDatabaseOpens=0;
 });
 await run('closed Admiral session cannot enter',{reusable:false},async({page:p})=>{
 await waitReady(p);await p.evaluate(()=>BlackFlagQuartermasterUI.open());await p.waitForTimeout(50);assert.equal(await p.evaluate(()=>BlackFlagQuartermasterUI.isWorkspaceOpen()),false);assert.deepEqual(await p.evaluate(()=>fixture.idbOpens),[]);
 });
 await run('authority response discarded after account changes',{},async({page:p})=>{
 await waitReady(p);await p.evaluate(()=>{fixture.authWait=true;BlackFlagQuartermasterUI.open();});await p.waitForFunction(()=>fixture.authRelease!==null);await p.evaluate(()=>{fixture.account='synthetic-admiral-b';fixture.authWait=false;fixture.authRelease();});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>BlackFlagQuartermasterUI.isWorkspaceOpen()),false);assert.deepEqual(await p.evaluate(()=>fixture.idbOpens),[]);
 });

 await run('real UI catalog quote invoice PDF backup save and reload',{},async({page:p},row)=>{
 await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmBizName').fill('HouseHull');await p.locator('#qmBizPrefix').fill('HH');await p.locator('#qmBizAddress').fill('100 Synthetic Way');await p.locator('#qmBizEmail').fill('operator@example.invalid');await p.locator('#qmSaveBusiness').click();await saved(p,'Business details saved');
 await navigate(p,'catalog');await p.locator('#qmAddPart').click();
 const item={qmPartCode:'00042-HH',qmPartDescription:'Élodie siding <script>window.__injected=1</script>',qmPartSpec:'White 12 ft profile',qmPartUnit:'carton',qmPartPackage:'200 sq ft per carton',qmPartPrice:'189.00',qmPartCost:'111.11',qmPartManufacturer:'000012-A',qmPartSupplier:'Synthetic supplier',qmPartSku:'00000097/S'};
 for(const [id,value]of Object.entries(item))await p.locator('#'+id).fill(value);await p.locator('#qmSavePart').click();await saved(p,'Catalog item saved');
 let w=await workspace(p);assert.equal(w.catalog.length,1);const part=w.catalog[0];assert.equal(part.code,'00042-HH');assert.equal(part.manufacturerPart,'000012-A');assert.equal(part.supplierSku,'00000097/S');assert.equal(part.unitPrice,'189.00');assert.equal(part.unit,'carton');assert.equal(await p.evaluate(()=>window.__injected),undefined);
 await navigate(p,'overview');await p.locator('#qmNewQuote').click();await p.locator('#qmCustomerName').fill('Zoë O’Connor');await p.locator('#qmJobName').fill('Synthetic siding installation');await p.locator('[data-qm-step="items"]').first().click();await p.locator('#qmItemPicker').selectOption(part.id);await p.locator('#qmAddLine').click();await p.locator('[data-qm-line="0"][data-qm-prop="quantity"]').fill('1.125');await p.locator('#qmTaxRate').fill('7.125');await p.locator('#qmTaxConfirmed').check();await p.locator('#qmSaveDocument').click();await saved(p,'Draft saved');
 w=await workspace(p);assert.equal(w.documents.length,1);const q=w.documents[0];assert.equal(q.lines[0].quantity,'1.125');assert.equal(q.lines[0].manufacturerPart,'000012-A');assert.equal(q.lines[0].supplierSku,'00000097/S');assert.equal(q.totals.subtotalCents,21263);assert.equal(q.totals.taxCents,1515);assert.equal(q.totals.totalCents,22778);assert(!Object.hasOwn(q.lines[0],'cost'));assert.equal(q.customer.name,'Zoë O’Connor');
 await p.reload();await openWorkspace(p);await navigate(p,'documents');await p.locator('[data-qm-open-doc="'+q.id+'"]').click();await p.locator('[data-qm-step="review"]').first().click();await p.locator('#qmFinalize').click();await saved(p,'Document finalized locally');w=await workspace(p);savedQuote=w.documents.find(d=>d.id===q.id);assert.equal(savedQuote.status,'finalized');assert.equal(await p.locator('#qmSaveDocument').isDisabled(),true);
 const pdf=await prepare(p,'#qmPdf');assert.equal(pdf.bytes.subarray(0,8).toString(),'%PDF-1.7');assert.equal(pdf.filename,savedQuote.number+'.pdf');const quoteText=cp.execFileSync('pdftotext',['-layout',pdf.path,'-'],{encoding:'utf8'});for(const literal of ['Zoë O’Connor','00042-HH','000012-A','00000097/S','1.125','carton','$227.78','Quote total'])assert(quoteText.includes(literal),'downloaded quote PDF missing '+literal);for(const secret of ['111.11','DRAFT','SAMPLE'])assert(!quoteText.includes(secret),'downloaded quote PDF leaked '+secret);row.quotePdf={filename:pdf.filename,bytes:pdf.bytes.length,extractedTextVerified:true};
 await p.locator('#qmConvertInvoice').click();await p.locator('#qmCustomerName').waitFor();await p.locator('[data-qm-step="items"]').first().click();await p.locator('#qmTaxRate').fill('7.125');await p.locator('#qmTaxConfirmed').check();await p.locator('#qmSaveDocument').click();await saved(p,'Draft saved');await p.locator('[data-qm-step="review"]').first().click();await p.locator('#qmFinalize').click();await saved(p,'Document finalized locally');w=await workspace(p);const invoice=w.documents.find(d=>d.type==='invoice');assert.equal(invoice.status,'finalized');assert.deepEqual(invoice.quoteReference,{id:savedQuote.id,number:savedQuote.number,revision:savedQuote.revision});assert.notEqual(invoice.number,savedQuote.number);assert.equal(invoice.totals.totalCents,22778);assert.equal(invoice.lines[0].supplierSku,'00000097/S');
 const invPdf=await prepare(p,'#qmPdf');assert.equal(invPdf.bytes.subarray(0,8).toString(),'%PDF-1.7');const invoiceText=cp.execFileSync('pdftotext',['-layout',invPdf.path,'-'],{encoding:'utf8'});for(const literal of ['Total due','Source quote / revision','Zoë O’Connor','$227.78'])assert(invoiceText.includes(literal),'downloaded invoice PDF missing '+literal);assert(invoiceText.replace(/\s+/g,'').includes(savedQuote.number),'downloaded invoice exact quote reference');assert(!invoiceText.includes('111.11'));row.invoicePdf={filename:invPdf.filename,bytes:invPdf.bytes.length,extractedTextVerified:true};
 await navigate(p,'catalog');await p.locator('[data-qm-edit-item="'+part.id+'"]').click();await p.locator('#qmPartDescription').fill('Updated catalog description');await p.locator('#qmPartPrice').fill('199.00');await p.locator('#qmSavePart').click();await saved(p,'Catalog item saved');w=await workspace(p);assert.equal(w.catalog[0].revision,2);assert.equal(w.documents.find(d=>d.id===q.id).lines[0].description,savedQuote.lines[0].description);assert.equal(w.documents.find(d=>d.id===invoice.id).lines[0].unitPrice,'189.00');
 await navigate(p,'settings');const backup=await prepare(p,'#qmBackup');savedBackup=backup.bytes;const envelope=JSON.parse(savedBackup);assert.equal(envelope.schema,'blackflag.quartermaster.backup.v1');assert.equal(envelope.workspace.documents.length,2);assert.equal(envelope.workspace.catalog[0].cost,'111.11');row.backup={filename:backup.filename,bytes:backup.bytes.length};row.workspaceRevision=w.revision;row.quoteNumber=savedQuote.number;row.invoiceNumber=invoice.number;
 await p.locator('#qmBusiness').selectOption('other-business');await saved(p,'Business workspace opened');assert.equal((await workspace(p,'other-business')).catalog.length,0);assert(!await p.locator('#quartermasterWorkspace').innerText().then(t=>t.includes('Zoë O’Connor')));await p.locator('#qmBusiness').selectOption('househull');await saved(p,'Business workspace opened');assert.equal((await workspace(p)).documents.length,2);
 });
 await run('backup restores into empty exact scope and rejects foreign scope',{},async({page:p},row)=>{
 assert(savedBackup,'prior workflow backup required');await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmRestoreFile').setInputFiles({name:'matching-business.json',mimeType:'application/json',buffer:savedBackup});await saved(p,'Matching backup restored');const restored=await workspace(p);assert.equal(restored.documents.length,2);assert.equal(restored.catalog[0].supplierSku,'00000097/S');assert.equal(restored.documents.find(d=>d.id===savedQuote.id).number,savedQuote.number);row.restoredDocuments=restored.documents.length;
 await p.locator('#qmBusiness').selectOption('other-business');await saved(p,'Business workspace opened');await navigate(p,'settings');await p.locator('#qmRestoreFile').setInputFiles({name:'foreign-business.json',mimeType:'application/json',buffer:savedBackup});await saved(p,'different account');assert.equal((await workspace(p,'other-business')).documents.length,0);
 });
 await run('native storage quota does not claim catalog save',{},async({page:p})=>{
 await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmBizName').fill('HouseHull');await p.locator('#qmBizPrefix').fill('HH');await p.locator('#qmSaveBusiness').click();await saved(p,'Business details saved');await navigate(p,'catalog');await p.locator('#qmAddPart').click();await p.locator('#qmPartDescription').fill('Unsaved quota fixture');await p.locator('#qmPartPackage').fill('one piece');await p.evaluate(()=>fixture.idbWriteBlocked=true);await p.locator('#qmSavePart').click();await saved(p,'Synthetic storage quota');assert.equal((await workspace(p)).catalog.length,0);assert.equal(await p.locator('#qmStatus').getAttribute('data-tone'),'error');assert.equal(await p.locator('#qmPartDescription').inputValue(),'Unsaved quota fixture');
 });
 await run('session revocation removes private UI and prepared download',{},async({page:p})=>{
 await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmBackup').click();await p.locator('#qmDownloadReady a').waitFor();await p.evaluate(()=>{fixture.reusable=false;dispatchEvent(new Event('darksky:admiral-session-ended'));});await p.waitForFunction(()=>!document.querySelector('#quartermasterWorkspace'));assert.equal(await p.evaluate(()=>BlackFlagQuartermasterUI.isWorkspaceOpen()),false);assert.equal(await p.locator('#qmDownloadReady a').count(),0);
 });
 await run('delayed side effect revalidates account and leaves database unchanged',{},async({page:p})=>{
 await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmBizName').fill('Must not save');await p.locator('#qmBizPrefix').fill('HH');await p.evaluate(()=>fixture.authWait=true);await p.locator('#qmSaveBusiness').click();await p.waitForFunction(()=>fixture.authRelease!==null);await p.evaluate(()=>{fixture.account='synthetic-admiral-b';fixture.authWait=false;fixture.authRelease();});await p.waitForFunction(()=>!document.querySelector('#quartermasterWorkspace'));await p.evaluate(()=>fixture.account='synthetic-admiral-a');await openWorkspace(p);assert.equal((await workspace(p)).business.name,'');
 });
 for(const [width,height,label]of [[390,844,'phone'],[768,1024,'iPad']])await run(label+' layout keeps controls and dialog inside viewport',{width,height},async({page:p},row)=>{
 await openWorkspace(p);await navigate(p,'settings');row.settings=await checkNoOverflow(p,label+' settings');await p.locator('#qmBizName').fill('HouseHull');await p.locator('#qmBizPrefix').fill('HH');await p.locator('#qmSaveBusiness').click();await saved(p,'Business details saved');await navigate(p,'catalog');await p.locator('#qmAddPart').click();row.catalog=await checkNoOverflow(p,label+' catalog form');await p.screenshot({path:path.join(OUT,label+'-catalog.png'),fullPage:true});await p.locator('#qmCancelPart').click();await navigate(p,'overview');await p.locator('#qmExampleQuote').click();await saved(p,'Example quote saved');row.review=await checkNoOverflow(p,label+' review');assert.equal((await workspace(p)).documents[0].totals.totalCents,627100);await p.screenshot({path:path.join(OUT,label+'-quote-review.png'),fullPage:true});
 });
 await run('rapid repeated action and concurrent tabs keep unique numbers',{},async({page:p,context},row)=>{
 await openWorkspace(p);await navigate(p,'settings');await p.locator('#qmBizName').fill('HouseHull');await p.locator('#qmBizPrefix').fill('HH');await p.locator('#qmSaveBusiness').click();await saved(p,'Business details saved');await navigate(p,'overview');await p.evaluate(()=>{document.querySelector('#qmNewQuote').click();document.querySelector('#qmNewQuote').click();});await saved(p,'New numbered draft created');assert.equal((await workspace(p)).documents.length,1);await p.locator('#qmSaveDocument').click();await saved(p,'Draft saved');await navigate(p,'overview');
 const p2=await context.newPage();p2.on('dialog',d=>d.accept());await p2.goto(ORIGIN+'/fleet/index.html');await openWorkspace(p2);await navigate(p2,'overview');await Promise.all([p.locator('#qmNewQuote').click(),p2.locator('#qmNewQuote').click()]);await Promise.all([saved(p,'New numbered draft created'),saved(p2,'New numbered draft created')]);const w=await workspace(p);assert.equal(w.documents.length,3);assert.equal(new Set(w.documents.map(d=>d.number)).size,3);assert.equal(w.counters.quote,3);row.allocatedNumbers=w.documents.map(d=>d.number);await p2.close();
 });

 const report={scope:'Actual Quartermaster UI and native IndexedDB in isolated offline Chromium with synthetic authority; no live accounts/network or Safari proof',browser:browser.version(),release:RELEASE,sources:Object.fromEntries(['quartermaster_core.js','quartermaster_pdf.js','quartermaster.js','quartermaster.css'].map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(RELEASE,n))).digest('hex')])),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};
 fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
