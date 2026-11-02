#!/usr/bin/env node
'use strict';
// Real customer UI, vector editor, photo normalization, package bytes and IndexedDB.
// Only provider HTTP is replaced, at the browser route; no real contact is possible.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const {chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||__dirname,'playwright/package.json'))('playwright');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../boardcraft-customer-evidence'));
fs.mkdirSync(OUT,{recursive:true});
const ORIGIN='https://shopcraft-fixture.invalid',results=[];
const scripts=['carve_fonts.js','fleet_design_assets.js','carve_core.js','carvewright_core.js','boardcraft_photo.js','carvewright_clipper.js','carvewright_cam.js','carvewright_portable.js','ike_shop_core.js','ike_shop_store.js','ike_shop_delivery.js','carvewright_studio.js','ike_shop.js'].filter(n=>fs.existsSync(path.join(ROOT,n)));
const styles=['carvewright.css','ike_shop.css'].filter(n=>fs.existsSync(path.join(ROOT,n)));
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles.map(n=>'<link rel="stylesheet" href="'+n+'">').join('')+'</head><body><main id="host"><button id="open">Design a sign for Ike</button></main>'+scripts.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const executable=process.env.CHROMIUM_PATH||['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(p=>fs.existsSync(p));
let browser;
async function fixture(width=1024,height=768){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<600,acceptDownloads:true}),f={context,blocked:[],errors:[],provider:[],providerMode:'accepted'};
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname.slice(1));
  if(u.origin==='https://api.web3forms.com'){
   const body=route.request().postDataBuffer();
   const form=await new Response(body,{headers:{'content-type':route.request().headers()['content-type']}}).formData();
   const attachment=Buffer.from(await form.get('attachment').arrayBuffer());
   const stored=await f.p.evaluate(async()=>{const id=document.querySelector('#ikeShop')?.dataset.requestId,store=IkeShopStore.create({scope:__scope,guard:()=>true});try{return await store.load(id);}finally{store.close();}});
   f.provider.push({bytes:body?.length||0,hasZip:attachment.subarray(0,4).toString('hex')==='504b0304',attachmentBytes:attachment.length,attachmentSha256:crypto.createHash('sha256').update(attachment).digest('hex'),statusBeforeFetch:stored?.delivery?.status,attemptIdMatches:form.get('attempt_id')===stored?.delivery?.attemptId,requestId:stored?.id,revision:stored?.revision});
   if(f.providerMode==='abort')return route.abort('failed');
   if(f.providerMode==='rejected')return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({success:false,message:'fixture rejects attachments'})});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,message:'Fixture provider accepted this request.'})});
  }
  if(u.origin!==ORIGIN||(!scripts.includes(name)&&!styles.includes(name)&&name!=='index.html'&&name!=='ike_character.png')){f.blocked.push(route.request().url());return route.abort();}
  return route.fulfill({status:200,contentType:(name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'text/html')+';charset=utf-8',body:name==='index.html'?html:fs.readFileSync(path.join(ROOT,name))});
 });
 const p=f.p=await context.newPage();p.setDefaultTimeout(6000);p.on('pageerror',e=>f.errors.push(String(e)));p.on('dialog',d=>d.accept());await p.goto(ORIGIN+'/index.html');
 await p.evaluate(()=>{
  window.__authorized=true;window.__used=null;window.__shares=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>Array.isArray(data.files)&&data.files.length===1});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{const file=data.files[0],bytes=new Uint8Array(await file.arrayBuffer());__shares.push({name:file.name,type:file.type,sha256:await IkeShopCore.sha256(bytes),recipient:data.text});}});window.__scope={projectId:'ikes-wood-signs',backend:'offline',environment:'test',site:location.origin,deploymentId:'shopcraft-ui-fixture'};
  window.__openShop=(mode='deployed')=>IkeShop.open({scope:__scope,parent:document.querySelector('#host'),guard:()=>__authorized,canSend:()=>__authorized,mode,deliveryConfig:{accessKey:'fixture-key-never-live',recipient:'ikeswoodsigns.orders@yahoo.com',maxBytes:5*1024*1024}});
  window.__openEditor=()=>{const d=CarvewrightCore.createDraft();d.title='Ike review fixture';d.text.value='Home';d.text.sizePercent=40;return CarvewrightStudio.openEmbedded({parent:document.querySelector('#host'),guard:()=>__authorized,draft:d,onUse:x=>{window.__used=x;}});};
 });return f;
}
async function ready(p,id='ikeShop'){await p.waitForFunction(id=>document.getElementById(id)?.getAttribute('aria-busy')==='false',id);}
async function open(p,mode='deployed'){assert.equal(await p.evaluate(()=>typeof window.IkeShop?.open),'function','The customer shop must offer the guarded request workflow');await p.evaluate(mode=>__openShop(mode),mode);await ready(p);}
async function design(p,text='Home'){
 await p.locator('#ishEditDesign').click();await ready(p,'carvewrightStudio');if(await p.locator('#cweFrameApply').isVisible()){await p.locator('#cweFrameApply').click();}await p.locator('#cweLetteringTab').click();await p.locator('#cweWording').fill(text);await p.locator('#cweSave').click();await p.waitForFunction(()=>!document.querySelector('#carvewrightStudio'));await ready(p);
}
async function photo(p,label='plank-reference.png'){
 const b64=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=300;const x=c.getContext('2d');x.fillStyle='#bc8a50';x.fillRect(0,0,800,300);x.fillStyle='#76552f';x.fillRect(20,70,740,3);x.fillRect(35,230,720,4);return c.toDataURL('image/png').split(',')[1];});
 await p.locator('#ishPhotoInput').setInputFiles({name:label,mimeType:'image/png',buffer:Buffer.from(b64,'base64')});await ready(p);
}
async function complete(p){await photo(p);await design(p);await p.locator('#ishName').fill('Taylor Fixture');await p.locator('#ishEmail').fill('taylor@example.invalid');await p.locator('#ishPhone').fill('555-0100');await p.locator('#ishQuantity').fill('2');await p.locator('#ishNotes').fill('Please confirm the wood and cutting setup.');await p.locator('#ishApproval').check();await p.locator('#ishPrepare').click();await ready(p);assert(await p.locator('#ishPackage').isVisible(),'A complete reviewed package is prepared');}
async function snap(p,name){await p.evaluate(()=>document.activeElement?.blur());await p.screenshot({path:path.join(OUT,name+'.png'),fullPage:true});}
async function check(name,fn,width=1024,height=768){if(process.env.BOARDCRAFT_CASE&&!name.includes(process.env.BOARDCRAFT_CASE))return;const f=await fixture(width,height),r={name,pass:false};try{await fn(f,r);assert.deepEqual(f.errors,[],'No uncaught browser errors');assert.deepEqual(f.blocked,[],'No unapproved external requests');r.pass=true;}catch(e){r.error=e.stack;await snap(f.p,name.replace(/[^a-z0-9]+/gi,'-')+'-failure').catch(()=>{});}finally{results.push(r);await f.context.close();console.log(JSON.stringify({name,pass:r.pass,error:r.error?.split('\n')[0]}));}}
async function main(){
 browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
 await check('next steps preserve answers and expose Mail action above footer',async({p})=>{
  await open(p);await p.locator('#ishName').fill('Known answer');await p.locator('#ishNext').click();assert(await p.locator('#ishEditDesign').evaluate(n=>{const a=n.getBoundingClientRect(),b=document.querySelector('.ish-footer').getBoundingClientRect();return a.top>=0&&a.bottom<=b.top;}));assert.equal(await p.locator('#ishName').inputValue(),'Known answer');
  await complete(p);assert(await p.locator('#ishShare').evaluate(n=>{const a=n.getBoundingClientRect(),b=document.querySelector('.ish-footer').getBoundingClientRect();return a.top>=document.querySelector('.ish-header').getBoundingClientRect().bottom&&a.bottom<=b.top;}));await snap(p,'mail-controls-visible');
 },390,660);
 await check('private device opt-in restores photo design and answers only after Resume',async({p})=>{
  await open(p);await photo(p);await design(p,'Keep my sign');await p.locator('#ishName').fill('Draft Customer');await p.locator('#ishEmail').fill('draft@example.invalid');await p.locator('#ishRemember').check();
  await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');await p.locator('#ishNotes').fill('Most recent notes');await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');
  await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);await p.locator('#ishResume').waitFor({state:'visible'});assert.equal(await p.locator('#ishName').inputValue(),'');await p.locator('#ishResume').click();await ready(p);
  assert.equal(await p.locator('#ishName').inputValue(),'Draft Customer');assert.equal(await p.locator('#ishNotes').inputValue(),'Most recent notes');assert.equal(await p.locator('#ishPhotoList img').count(),1);assert.equal(await p.locator('#ishApproval').isChecked(),false);assert(await p.locator('#ishPackage').isHidden());
  await p.locator('#ishNewRequest').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'');assert.equal(await p.locator('#ishPhotoList img').count(),0);await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);assert(await p.locator('#ishResume').isHidden());
 });
 await check('default fresh requests do not persist; preview cannot opt in',async({p})=>{
  await open(p);assert.equal(await p.locator('#ishRemember').isChecked(),false);await p.locator('#ishName').fill('Private default');await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);assert.equal(await p.locator('#ishName').inputValue(),'');assert(await p.locator('#ishResume').isHidden());await p.locator('#ishClose').click();await open(p,'preview');assert(await p.locator('#ishRemember').isDisabled());
 });
 await check('draft slots isolate scope and reject stale overwrite and revoked reads',async({p})=>{
  const result=await p.evaluate(async()=>{
   const a=IkeShopStore.create({scope:__scope,guard:()=>__authorized,draftStore:true}),b=IkeShopStore.create({scope:{...__scope,deploymentId:'another'},guard:()=>true,draftStore:true});
   const r=IkeShopCore.createRequest();r.customer.name='Scoped';const one=await a.writeDraft(r,null);const other=await b.readDraft();let conflict=false,auth=false;try{await a.writeDraft(r,null);}catch(e){conflict=e.code==='CONFLICT';}__authorized=false;try{await a.readDraft();}catch(e){auth=e.code==='AUTH';}a.close();b.close();__authorized=true;return{other,conflict,auth,token:!!one};
  });assert.deepEqual(result,{other:null,conflict:true,auth:true,token:true});
 });

 await check('reload offers saved progress without exposing it until resume',async({p})=>{
  await open(p);await p.locator('#ishName').fill('Reload Person');await p.locator('#ishRemember').check();await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');
  await p.reload();await p.evaluate(()=>{window.__authorized=true;window.__scope={projectId:'ikes-wood-signs',backend:'offline',environment:'test',site:location.origin,deploymentId:'shopcraft-ui-fixture'};window.__openShop=()=>IkeShop.open({scope:__scope,parent:document.querySelector('#host'),guard:()=>__authorized,canSend:()=>false,mode:'deployed'});});
  await open(p);await p.locator('#ishResume').waitFor({state:'visible'});assert.equal(await p.locator('#ishName').inputValue(),'');await p.locator('#ishResume').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'Reload Person');
 });
 await check('shared session has no recovery controls or personal draft database',async({p})=>{
  await p.evaluate(()=>IkeShop.open({scope:__scope,parent:document.querySelector('#host'),guard:()=>true,canSend:()=>false,mode:'deployed',sharedDevice:true}));await ready(p);assert(await p.locator('#ishRemember').isDisabled());assert(await p.locator('#ishResume').isHidden());assert.equal(await p.evaluate(async()=>(await indexedDB.databases()).some(x=>x.name==='blackflag-ike-private-drafts-v1')),false);
 });
 await check('storage failure reports unsaved progress and permits deliberate close',async({p})=>{
  await open(p);await p.waitForFunction(()=>!document.querySelector('#ishRemember').disabled);
  await p.evaluate(()=>{window.__originalTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){if(this.name==='blackflag-ike-private-drafts-v1'&&args[1]==='readwrite')throw new DOMException('Fixture quota failure','QuotaExceededError');return __originalTransaction.apply(this,args);};});
  await p.locator('#ishName').fill('Not saved');await p.locator('#ishRemember').check();await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='error');await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'),null,{timeout:1500});
 });
 await check('cancel share retains package and never claims delivery',async({p,provider})=>{
  await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}}));await open(p);await complete(p);const name=await p.locator('#ishPackageMeta').textContent();await p.locator('#ishShare').click();await ready(p);assert(await p.locator('#ishShare').isEnabled());assert.equal(await p.locator('#ishPackageMeta').textContent(),name);assert.equal(provider.length,0);assert.doesNotMatch(await p.locator('#ishStatus').textContent(),/delivered|successfully sent/i);
 });

 await check('review regression partial answers remain recoverable and correction keeps saving',async({p})=>{
  await open(p);await p.locator('#ishName').fill('Partial Person');await p.locator('#ishRemember').check();await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');
  for(const [id,value] of [['ishEmail','test@'],['ishPhone','+'],['ishFinish',''],['ishQuantity','']]){await p.locator('#'+id).fill(value);await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved',null,{timeout:1500});}
  await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);await p.locator('#ishResume').click();await ready(p);assert.equal(await p.locator('#ishEmail').inputValue(),'test@');assert.equal(await p.locator('#ishQuantity').inputValue(),'');assert(await p.locator('#ishApproval').isDisabled());
  await p.locator('#ishEmail').fill('test@example.invalid');await p.locator('#ishNotes').fill('Correction survived');await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);await p.locator('#ishResume').click();await ready(p);assert.equal(await p.locator('#ishNotes').inputValue(),'Correction survived');
 });
 await check('review regression departure after prepare preserves recoverable progress',async({p})=>{
  await open(p);await photo(p);await design(p);await p.locator('#ishName').fill('Prepare Person');await p.locator('#ishEmail').fill('prepare@example.invalid');await p.locator('#ishRemember').check();await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');await p.locator('#ishApproval').check();
  await p.evaluate(()=>{const watch=setInterval(()=>{if(document.querySelector('#ishPackage')&&!document.querySelector('#ishPackage').hidden){IkeShop.close(true);clearInterval(watch);}},0);});await p.locator('#ishPrepare').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);await p.locator('#ishResume').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'Prepare Person');assert.equal(await p.locator('#ishApproval').isChecked(),false);
 });
 await check('review regression storage unavailable permits explicit screen-only reset',async({p})=>{
  await p.evaluate(()=>{const old=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...a){if(this.name==='blackflag-ike-private-drafts-v1')throw new DOMException('Fixture unavailable','UnknownError');return old.apply(this,a);};});await open(p);await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='error');await p.locator('#ishName').fill('Reset me');assert(await p.locator('#ishNewRequest').isEnabled());await p.locator('#ishNewRequest').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'');assert.match(await p.locator('#ishStatus').textContent(),/saved progress.*remain/i);
 });
 await check('review regression changed design leaves Mail step and requires review',async({p})=>{
  await open(p);await complete(p);await p.locator('#ishNotes').fill('Change after ready');assert(await p.locator('#ishPackage').isHidden());assert.equal(await p.locator('#ishStepLabel').textContent(),'Review');assert.doesNotMatch(await p.locator('#ishNext').textContent(),/Ready for Mail/);assert.equal(await p.locator('#ishApproval').isChecked(),false);
 });
 await check('two tabs cannot resurrect a draft discarded with a pending edit',async({p,context})=>{
  await open(p);await p.locator('#ishName').fill('Old draft');await p.locator('#ishRemember').check();await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');
  const other=await context.newPage();await other.goto(ORIGIN+'/index.html');await other.evaluate(async scope=>{window.otherStore=IkeShopStore.create({scope,guard:()=>true,draftStore:true});window.otherDraft=await otherStore.readDraft();},await p.evaluate(()=>__scope));
  await p.locator('#ishNotes').fill('Pending edit');await p.locator('#ishNewRequest').click();await ready(p);
  const refused=await other.evaluate(async()=>{try{await otherStore.writeDraft(otherDraft.request,otherDraft.token);return false;}catch(e){return e.code==='CONFLICT';}finally{otherStore.close();}});assert(refused);await other.close();await p.locator('#ishClose').click();await p.waitForFunction(()=>!document.querySelector('#ikeShop'));await open(p);assert(await p.locator('#ishResume').isHidden());
 });

 await check('prepare acknowledges recovery revision before showing Mail readiness',async({p})=>{
  await open(p);await p.locator('#ishRemember').check();await complete(p);
  const revisions=await p.evaluate(async()=>{const drafts=IkeShopStore.create({scope:__scope,guard:()=>true,draftStore:true}),requests=IkeShopStore.create({scope:__scope,guard:()=>true});try{const draft=await drafts.readDraft(),saved=await requests.load(document.querySelector('#ikeShop').dataset.requestId);return[draft.request.revision,saved.revision];}finally{drafts.close();requests.close();}});assert.equal(revisions[0],revisions[1]);
 });
 await check('recovery refuses a different committed revision without changing answers',async({p})=>{
  await open(p);await p.locator('#ishRemember').check();await complete(p);await p.waitForFunction(()=>document.querySelector('#ishDraftStatus').dataset.state==='saved');
  await p.evaluate(async()=>{const store=IkeShopStore.create({scope:__scope,guard:()=>true});try{const r=await store.load(document.querySelector('#ikeShop').dataset.requestId);r.details.notes='Concurrent different revision';await store.save(r,r.revision);}finally{store.close();}IkeShop.close(true);});await open(p);await p.locator('#ishResume').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'');assert.match(await p.locator('#ishStatus').textContent(),/changed in another operation/);
 });
 await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length},null,2));process.exitCode=results.some(r=>!r.pass)?1:0;
}main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
