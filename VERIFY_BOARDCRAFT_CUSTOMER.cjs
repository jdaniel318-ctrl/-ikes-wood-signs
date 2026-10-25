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
 await check('camera-first Ike branding uses this customer photo and one sign',async({p})=>{
  await open(p);assert.equal(await p.locator('#ishCameraInput').getAttribute('capture'),'environment');assert.equal(await p.locator('#ishCameraInput').getAttribute('multiple'),null);assert.match(await p.locator('#ishTakePhoto').innerText(),/take.*photo/i);assert.equal(await p.locator('#ishQuantity').inputValue(),'1');assert(await p.locator('.ish-ike-character').isVisible());assert.doesNotMatch(await p.locator('#ikeShop').innerText(),/Shopcraft|Fleetcraft|8\.8\.20/);const order=await p.evaluate(()=>document.querySelector('#ishPhotoSection').compareDocumentPosition(document.querySelector('#ishDesignSection'))&Node.DOCUMENT_POSITION_FOLLOWING);assert(order);await photo(p);assert.equal(await p.locator('#ishDesignPreview image').count(),1);assert.match(await p.locator('#ishPhotoList').innerText(),/your board/i);await p.locator('#ishEditDesign').click();await ready(p,'carvewrightStudio');assert.equal(await p.locator('#cweCanvas image').count(),1);assert.doesNotMatch(await p.locator('#carvewrightStudio').innerText(),/SHOPCRAFT/);await snap(p,'ipad-ike-photo-studio');
 });
 await check('complete same-ZIP native share and addressed Mail handoff remain explicit',async({p,provider})=>{
  await open(p);await complete(p);assert(await p.locator('#ishShare').isEnabled());assert(await p.locator('#ishMail').isEnabled());assert.match(await p.locator('#ishMailHelp').innerText(),/attach|attachment/i);const hash=(await p.locator('#ishPackageHash').innerText()).replace('Archive SHA-256: ','');await p.locator('#ishShare').click();await p.waitForFunction(()=>__shares.length===1);const shared=await p.evaluate(()=>__shares[0]);assert.equal(shared.sha256,hash);assert.equal(shared.type,'application/zip');assert.equal(provider.length,0);assert.match(await p.locator('#ishStatus').innerText(),/share|handed|chosen|recipient|send/i);assert.doesNotMatch(await p.locator('#ishStatus').innerText(),/email sent|delivered to Ike/i);
 });
 await check('provider rejection retains complete package and prepares usable Mail alternative',async f=>{
  f.providerMode='rejected';await open(f.p);await complete(f.p);await f.p.locator('#ishSend').click();await ready(f.p);assert.equal(f.provider.length,1);assert.match(await f.p.locator('#ishDelivery').innerText(),/PRO|attachment/i);assert(await f.p.locator('#ishShare').isEnabled());const hash=(await f.p.locator('#ishPackageHash').innerText()).replace('Archive SHA-256: ','');await f.p.locator('#ishShare').click();await f.p.waitForFunction(()=>__shares.length===1);assert.equal(await f.p.evaluate(()=>__shares[0].sha256),hash);assert.equal(f.provider.length,1);
 });
 await check('new request removes photo, proof, contact and manual handoff',async({p})=>{
  await open(p);await complete(p);await p.locator('#ishNewRequest').click();await ready(p);assert.equal(await p.locator('#ishName').inputValue(),'');assert.equal(await p.locator('#ishEmail').inputValue(),'');assert.equal(await p.locator('#ishPhotoList img').count(),0);assert(await p.locator('#ishPackage').isHidden());assert(await p.locator('#ishShare').isDisabled());assert.equal(await p.locator('#ishQuantity').inputValue(),'1');
 });
 await check('embedded editor returns validated artwork without private store or Admiral session',async({p})=>{
  assert.equal(await p.evaluate(()=>typeof CarvewrightStudio.openEmbedded),'function','Studio needs an explicit customer editing port');await p.evaluate(()=>__openEditor());await ready(p,'carvewrightStudio');assert.equal(await p.locator('#cweSave').innerText(),'Use this design');
  assert(await p.locator('#cweMachining').isHidden(),'Customer editing exposes no machine setup');await p.evaluate(()=>dispatchEvent(new Event('darksky:admiral-session-ended')));assert(await p.locator('#carvewrightStudio').isVisible(),'Customer editing does not depend on an Admiral session');
  await p.locator('#cweWording').fill('River');await p.locator('#cweSave').click();await p.waitForFunction(()=>!CarvewrightStudio.isOpen());const used=await p.evaluate(()=>__used);assert.equal(used.text.value,'River');assert.equal(used.revision,0);assert.equal(await p.evaluate(()=>CarvewrightCore.validate(__used,IkeCarveFonts).ok),true);assert.deepEqual(await p.evaluate(()=>indexedDB.databases()),[],'Embedding creates no private or customer database');
 });
 await check('embedded numeric errors block return and guard loss closes the editor',async({p})=>{
  assert.equal(await p.evaluate(()=>typeof CarvewrightStudio.openEmbedded),'function');await p.evaluate(()=>__openEditor());await ready(p,'carvewrightStudio');await p.locator('[data-panel="stock"]').click();await p.locator('#cweWidth').fill('');assert(await p.locator('#cweSave').isDisabled());await p.locator('#cweWidth').fill('24');assert(await p.locator('#cweSave').isEnabled());await p.evaluate(()=>__authorized=false);await p.waitForFunction(()=>!CarvewrightStudio.isOpen());assert.equal(await p.evaluate(()=>__used),null);
 });
 await check('complete request freezes photos and downloads one complete native ZIP',async({p,provider},r)=>{
  await open(p);await complete(p);assert.match(await p.locator('#ishRecipient').innerText(),/ikeswoodsigns\.orders@yahoo\.com/);assert(await p.locator('#ishFiles li').count()>=8);assert(await p.locator('#ishDesignPreview img').count());
  const pending=p.waitForEvent('download');await p.locator('#ishDownload').click();const download=await pending,output=path.join(OUT,'downloaded-request.zip');await download.saveAs(output);const bytes=fs.readFileSync(output);assert.equal(bytes.subarray(0,4).toString('hex'),'504b0304');assert(bytes.length>1000);assert.equal(provider.length,0);r.downloadBytes=bytes.length;await snap(p,'ipad-complete-request');
 });
 await check('content and numeric changes revoke approval and prepared bytes',async({p,provider})=>{
  await open(p);await complete(p);await p.locator('#ishQuantity').fill('');assert(await p.locator('#ishPackage').isHidden());assert.equal(await p.locator('#ishApproval').isChecked(),false);assert(await p.locator('#ishPrepare').isDisabled());await p.locator('#ishQuantity').fill('3');await p.locator('#ishApproval').check();await p.locator('#ishPrepare').click();await ready(p);assert(await p.locator('#ishPackage').isVisible());await p.locator('[data-photo-remove]').click();assert(await p.locator('#ishPackage').isHidden());assert.equal(await p.locator('#ishApproval').isChecked(),false);assert.equal(provider.length,0);
 });
 await check('accepted delivery persists attempted state before fetch and never duplicates',async(f,r)=>{
  await open(f.p);await complete(f.p);await f.p.locator('#ishSend').click();await ready(f.p);assert.equal(f.provider.length,1);assert.equal(f.provider[0].statusBeforeFetch,'attempted');assert.equal(f.provider[0].hasZip,true);assert.equal(f.provider[0].attemptIdMatches,true);assert.match(await f.p.locator('#ishDelivery').innerText(),/provider|accepted/i);assert(await f.p.locator('#ishSend').isDisabled());assert(await f.p.locator('#ishShare').isDisabled());assert(await f.p.locator('#ishMail').isDisabled());await f.p.locator('#ishSend').evaluate(n=>n.click());assert.equal(f.provider.length,1);const pending=f.p.waitForEvent('download');await f.p.locator('#ishDownload').click();const downloaded=await pending,output=path.join(OUT,'post-accepted-request.zip');await downloaded.saveAs(output);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),f.provider[0].attachmentSha256,'Download after recorded acceptance retains the exact transmitted ZIP');r.provider=f.provider;r.postAcceptedDownloadMatchesSent=true;await snap(f.p,'ipad-provider-accepted');
 });
 await check('ambiguous network result locks further sends and retains download',async f=>{
  f.providerMode='abort';await open(f.p);await complete(f.p);await f.p.locator('#ishSend').click();await ready(f.p);assert.equal(f.provider.length,1);assert.match(await f.p.locator('#ishDelivery').innerText(),/unconfirmed|confirm/i);assert(await f.p.locator('#ishSend').isDisabled());assert(await f.p.locator('#ishDownload').isEnabled());await f.p.locator('#ishSend').evaluate(n=>n.click());assert.equal(f.provider.length,1);const pending=f.p.waitForEvent('download');await f.p.locator('#ishDownload').click();const downloaded=await pending,output=path.join(OUT,'unconfirmed-request.zip');await downloaded.saveAs(output);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),f.provider[0].attachmentSha256,'An ambiguous attempt retains its exact ZIP');
 });
 await check('stale stored revision blocks the exact package before download or send',async f=>{
  await open(f.p);await complete(f.p);await f.p.evaluate(async()=>{const store=IkeShopStore.create({scope:__scope,guard:()=>true}),id=document.querySelector('#ikeShop').dataset.requestId;try{const d=await store.load(id);d.details.notes+=' Another saved revision.';await store.save(d,d.revision);}finally{store.close();}});await f.p.locator('#ishSend').click();await ready(f.p);assert.equal(f.provider.length,0);assert.match(await f.p.locator('#ishStatus').innerText(),/newer|changed|revision/i);assert(await f.p.locator('#ishPackage').isHidden());
 });
 await check('context loss blocks send and a fresh customer sees no previous details',async f=>{
  await open(f.p);await complete(f.p);await f.p.evaluate(()=>{__authorized=false;document.querySelector('#ishSend').click();});await f.p.waitForFunction(()=>!IkeShop.isOpen());assert.equal(f.provider.length,0);await f.p.evaluate(()=>{__authorized=true;__openShop();});await ready(f.p);assert.equal(await f.p.locator('#ishName').inputValue(),'');assert.equal(await f.p.locator('#ishEmail').inputValue(),'');assert.equal(await f.p.locator('#ishPhotoList img').count(),0);assert(await f.p.locator('#ishPackage').isHidden());
 });
 for(const mode of ['preview','sea_trial'])await check(mode+' keeps requests in memory and sends nothing',async f=>{await open(f.p,mode);await complete(f.p);assert(await f.p.locator('#ishSend').isDisabled());assert(await f.p.locator('#ishShare').isDisabled());assert(await f.p.locator('#ishMail').isDisabled());await f.p.locator('#ishSend').evaluate(n=>n.click());assert.equal(f.provider.length,0);assert.deepEqual(await f.p.evaluate(()=>indexedDB.databases()),[]);});
 for(const [w,h,label]of[[390,844,'phone'],[1024,768,'ipad'],[1440,900,'desktop']])await check(label+' usable request controls and embedded editor',async({p},r)=>{
  await open(p);r.geometry=await p.evaluate(()=>{const a=document.querySelector('#ikeShop').getBoundingClientRect();return{documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,left:a.left,right:a.right,small:[...document.querySelectorAll('#ikeShop button')].filter(n=>n.getClientRects().length).map(n=>({id:n.id,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})).filter(n=>n.w<43.5||n.h<43.5)};});assert(r.geometry.documentWidth<=w+1);assert(r.geometry.right<=w+1);assert.equal(r.geometry.small.length,0);await snap(p,label+'-request');await design(p,'Cabin');await p.locator('#ishEditDesign').click();await ready(p,'carvewrightStudio');assert.equal(await p.locator('#cweWording').inputValue(),'Cabin');await snap(p,label+'-embedded-editor');
 },w,h);
 await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({scope:'Isolated Chromium; real board-photo customer/editor/core/store/package and exact native share bytes. Only provider network is routed locally. Safari/inbox receipt/physical CNC not claimed.',results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length},null,2));process.exitCode=results.some(r=>!r.pass)?1:0;
}
main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
