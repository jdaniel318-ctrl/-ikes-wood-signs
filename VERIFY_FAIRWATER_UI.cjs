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
 await check('typing keeps photo nodes and focus; editing invalidates approved package',async({p})=>{
  await open(p);await photo(p);await design(p);
  await p.evaluate(()=>{window.__previewNode=document.querySelector('#ishDesignPreview').firstChild;window.__photoNode=document.querySelector('#ishPhotoList').firstChild;});
  await p.locator('#ishNotes').pressSequentially('Typing without redraw');
  assert(await p.evaluate(()=>__previewNode===document.querySelector('#ishDesignPreview').firstChild));
  assert(await p.evaluate(()=>__photoNode===document.querySelector('#ishPhotoList').firstChild));
  assert(await p.locator('#ishNotes').evaluate(n=>n===document.activeElement));
  await p.locator('#ishName').fill('Test');await p.locator('#ishEmail').fill('test@example.invalid');await p.locator('#ishApproval').check();await p.locator('#ishPrepare').click();await ready(p);
  await p.locator('#ishNotes').fill('Changed after review');assert(await p.locator('#ishPackage').isHidden());assert.equal(await p.locator('#ishApproval').isChecked(),false);assert(await p.locator('#ishPrepare').isDisabled());
 });
 await check('larger and smaller buttons clamp, undo and preserve board size',async({p})=>{
  await open(p);await photo(p);await p.locator('#ishEditDesign').click();await ready(p,'carvewrightStudio');await p.locator('#cweLetteringTab').click();await p.locator('#cweWording').fill('Andie Rose');await p.locator('#cweSizeNumber').fill('97');
  await p.locator('[data-size-step="5"]').click();assert.equal(await p.locator('#cweSizeNumber').inputValue(),'100');await p.locator('#cweUndo').click();assert.equal(await p.locator('#cweSizeNumber').inputValue(),'97');await p.locator('[data-size-step="-5"]').click();assert.equal(await p.locator('#cweSizeNumber').inputValue(),'92');await p.locator('#cweSizeNumber').fill('10');await p.locator('[data-size-step="-5"]').click();assert.equal(await p.locator('#cweSizeNumber').inputValue(),'10');
  await p.locator('#cweStockTab').click();assert.equal(await p.locator('#cweWidth').inputValue(),'24');assert.equal(await p.locator('#cweHeight').inputValue(),'8');await p.locator('#cweLetteringTab').click();await snap(p,'lettering-size');
 });
 await check('Mail is primary, provider secondary, same ZIP shared without provider call',async({p,provider})=>{
  await open(p);await complete(p);assert(await p.locator('#ishShare').isVisible());assert.equal(await p.locator('#ishShare').getAttribute('class'),'ish-primary');assert(await p.locator('#ishSend').isHidden());
  const hash=(await p.locator('#ishPackageHash').textContent()).replace('Archive SHA-256: ','');await p.locator('#ishShare').click();await ready(p);assert.equal(provider.length,0);assert.equal(await p.evaluate(()=>__shares[0].sha256),hash);assert.match(await p.locator('#ishStatus').textContent(),/not confirmed/);await snap(p,'mail-ready');
 });
 await check('unsupported file sharing keeps usable download and addressed draft',async({p})=>{
  await p.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));await open(p);await complete(p);assert(await p.locator('#ishShare').isHidden());assert(await p.locator('#ishDownload').isEnabled());assert(await p.locator('#ishMail').isEnabled());await snap(p,'phone-mail-fallback');
 },390,844);
 await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length},null,2));process.exitCode=results.some(r=>!r.pass)?1:0;
}main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
