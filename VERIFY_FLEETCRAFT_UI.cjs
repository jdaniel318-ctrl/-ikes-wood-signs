#!/usr/bin/env node
'use strict';
// Real Studio, geometry, and IndexedDB in an isolated Chromium context.
// Synthetic local authorization only; no live user stores or external requests.
// Usage: node VERIFY_FLEETCRAFT_UI.cjs [RELEASE] [EVIDENCE_DIRECTORY]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const runtimeRequire=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||__dirname,'playwright/package.json'));
const {chromium}=runtimeRequire('playwright');
const ROOT=path.resolve(process.argv[2]||__dirname);
const OUT=path.resolve(process.argv[3]||path.join(ROOT,'../fleetcraft-ui-evidence'));
fs.mkdirSync(OUT,{recursive:true});
const ORIGIN='https://fleetcraft-fixture.invalid',results=[];
const scripts=['carve_fonts.js','fleet_design_assets.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','carvewright_studio.js'].filter(n=>fs.existsSync(path.join(ROOT,n)));
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="carvewright.css"></head><body><button id="origin">Open workspace</button>'+scripts.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const executable=process.env.CHROMIUM_PATH||['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(p=>fs.existsSync(p));
let browser;
async function fixture(width=1024,height=768){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<600});
  const blocked=[],errors=[];
  await context.route('**/*',route=>{const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname.slice(1));if(u.origin!==ORIGIN||(!scripts.includes(name)&&!['index.html','carvewright.css'].includes(name))){blocked.push(route.request().url());return route.abort();}return route.fulfill({status:200,contentType:(name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html')+';charset=utf-8',body:name==='index.html'?html:fs.readFileSync(path.join(ROOT,name))});});
  const p=await context.newPage();p.setDefaultTimeout(6000);p.on('pageerror',e=>errors.push(String(e)));p.on('dialog',d=>d.accept());await p.goto(ORIGIN+'/index.html');
  await p.evaluate(()=>{window.__authorized=true;window.__saved=null;window.__scope={accountId:'fleetcraft-ui-fixture',backend:'offline',environment:'test',site:location.origin,businessId:'carvewright'};window.__open=(draft)=>CarvewrightStudio.open({scope:__scope,guard:()=>__authorized,parent:document.body,referenceOnly:true,draft,onSaved:d=>window.__saved=d});const d=CarvewrightCore.createDraft();d.title='Fleetcraft touch regression';d.text.value='Home';d.text.sizePercent=40;__open(d);});
  await ready(p);return {p,context,blocked,errors};
}
async function ready(p){await p.waitForFunction(()=>document.querySelector('#carvewrightStudio')?.getAttribute('aria-busy')==='false');}
async function panel(p,name){await p.locator('[data-panel="'+name+'"]').click();}
async function save(p){await p.locator('#cweSave').click();await ready(p);return p.evaluate(()=>__saved);}
async function addGraphic(p,id='anchor'){await panel(p,'objects');await p.locator('#cweAddGraphic').click();await p.locator('[data-graphic="'+id+'"]').click();}
async function snap(p,name){await p.evaluate(()=>document.activeElement?.blur());await p.screenshot({path:path.join(OUT,name+'.png'),fullPage:true});}
async function check(name,fn,width=1024,height=768){if(process.env.FLEETCRAFT_CASE&&!name.includes(process.env.FLEETCRAFT_CASE))return;const f=await fixture(width,height),r={name,pass:false};try{await fn(f,r);assert.deepEqual(f.errors,[],'No uncaught browser errors');assert.deepEqual(f.blocked,[],'No unapproved external requests');r.pass=true;}catch(e){r.error=e.stack;await snap(f.p,name.replace(/[^a-z0-9]+/gi,'-')+'-failure').catch(()=>{});}finally{results.push(r);await f.context.close();console.log(JSON.stringify({name,pass:r.pass,error:r.error?.split('\n')[0]}));}}
async function main(){
 browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
 await check('independent text, vector fonts, graphic editing, history, save and reopen',async({p},r)=>{
  assert.equal(await p.locator('#cweAddText').count(),1,'Studio needs an Add text control for independent lettering');
  await panel(p,'objects');await p.locator('#cweAddText').click();
  await p.locator('#cweWording').fill('  River  ');assert.equal(await p.locator('#cweWording').inputValue(),'  River  ','Typing preserves focus and spaces');
  await p.locator('#cweSizeNumber').fill('31');await p.locator('#cweTransform summary').click();await p.locator('#cweOffsetY').fill('1.8');
  await p.locator('#cweFontPicker').click();
  assert.equal(await p.locator('[data-font]').count(),8,'Eight public path fonts are selectable');
  assert.equal(await p.locator('[data-font] svg path').count()>0,true,'Font previews have actual outlines');
  assert.equal(await p.locator('[data-font] svg text').count(),0,'Font previews never substitute browser lettering');
  await snap(p,'ipad-font-picker');
  await p.locator('[data-font="cinzel-bold"]').click();
  await p.locator('#cweFontPicker').click();await p.locator('#cweUndo').click();assert(await p.locator('#cweFontChoices').isHidden(),'Undo closes a picker tied to the previous selection');await p.locator('#cweRedo').click();
  await addGraphic(p);
  await p.locator('#cweGraphicWidth').fill('1');await p.locator('#cweGraphicHeight').fill('1');
  await p.locator('#cweOffsetX').fill('3');await p.locator('#cweOffsetY').fill('2');await p.locator('#cweRotation').fill('25');
  await p.locator('#cweDuplicate').click();await panel(p,'objects');assert.equal(await p.locator('[data-layer-select]').count(),4);
  await p.locator('#cweDelete').click();assert.equal(await p.locator('[data-layer-select]').count(),3);
  await p.locator('#cweUndo').click();assert.equal(await p.locator('[data-layer-select]').count(),4);
  await p.locator('#cweRedo').click();assert.equal(await p.locator('[data-layer-select]').count(),3);
  const saved=await save(p);assert(saved,'Save completed');assert.equal(saved.schema,'carvewright-design-v2');assert.equal(saved.text.value,'Home');assert.equal(saved.layers[0].text.value,'  River  ');assert.equal(saved.layers[0].text.fontId,'cinzel-bold');assert.equal(saved.layers[0].text.sizePercent,31,'Numeric size applies only to selected lettering');assert.equal(saved.layers[0].text.offsetYmm,45.72);assert.equal(saved.text.sizePercent,40);assert.equal(saved.text.offsetYmm,0);
  const graphic=saved.layers.find(l=>l.type==='graphic');assert.equal(graphic.assetId,'anchor');assert.equal(graphic.widthMm,25.4);assert.equal(graphic.heightMm,25.4);assert.equal(graphic.centerXmm,76.2);assert.equal(graphic.centerYmm,50.8);assert.equal(graphic.rotationDeg,25);
  await p.evaluate(()=>{CarvewrightStudio.close(true);__open(__saved);});await ready(p);await panel(p,'objects');
  assert.equal(await p.locator('[data-layer-select]').count(),3);await p.locator('[data-layer-select="'+saved.layers[0].id+'"]').click();await panel(p,'lettering');assert.equal(await p.locator('#cweWording').inputValue(),'  River  ');
  r.revision=saved.revision;r.objectCount=3;await snap(p,'ipad-layered-editor');
 });
 await check('direct drag stays inside margins and supports undo',async({p},r)=>{
  await addGraphic(p,'star');await p.locator('#cweGraphicWidth').fill('1');await p.locator('#cweGraphicHeight').fill('1');await p.locator('#cweOffsetX').fill('5');await p.locator('#cweOffsetY').fill('3');
  const saved=await save(p),id=saved.layers[0].id;
  const point=await p.evaluate(id=>{const svg=document.querySelector('#cweCanvas'),d=__saved.layers.find(l=>l.id===id),m=svg.getScreenCTM(),a=new DOMPoint(d.centerXmm,d.centerYmm).matrixTransform(m),b=new DOMPoint(d.centerXmm+25.4,d.centerYmm).matrixTransform(m);return {x:a.x,y:a.y,dx:b.x-a.x};},id);
  await p.mouse.move(point.x,point.y);await p.mouse.down();await p.mouse.move(point.x+point.dx,point.y,{steps:8});await p.mouse.up();
  assert(Math.abs(Number(await p.locator('#cweOffsetX').inputValue())-6)<.02,'Dragged one inch in stock coordinates');
  await p.locator('#cweUndo').click();assert.equal(Number(await p.locator('#cweOffsetX').inputValue()),5);
  await p.locator('#cweRedo').click();assert(Math.abs(Number(await p.locator('#cweOffsetX').inputValue())-6)<.02);
  const before=await p.locator('#cweOffsetX').inputValue();await p.mouse.move(point.x+point.dx,point.y);await p.mouse.down();await p.mouse.move(point.x-600,point.y,{steps:1});await p.mouse.up();assert.equal(await p.locator('#cweOffsetX').inputValue(),before,'Out-of-margin direct move is rejected');
  await p.locator('#cweRotation').fill('30');await save(p);assert.equal((await p.evaluate(()=>__saved)).layers[0].rotationDeg,30);r.dragDeltaMm=25.4;
 });
 await check('invalid numeric geometry remains editable and blocks review/save/export',async({p})=>{
  await addGraphic(p);await p.locator('#cweOffsetX').fill('-10');assert(await p.locator('#cweSave').isDisabled());assert(await p.locator('#cweExportSvg').isDisabled());assert(await p.locator('#cweReview').isDisabled());assert(await p.locator('#cweCanvas [data-layer-id]').count()>0,'Finite invalid artwork stays visible');
  await p.locator('#cweOffsetX').fill('5');assert(await p.locator('#cweSave').isEnabled());
 });
 await check('temporarily empty primary rotation can be repaired without undo',async({p})=>{
  await p.locator('#cweTransform summary').click();await p.locator('#cweRotation').fill('');assert(await p.locator('#cweSave').isDisabled());
  await p.locator('#cweRotation').fill('15');assert(await p.locator('#cweSave').isEnabled(),'A corrected numeric field replaces its invalid intermediate value');const d=await save(p);assert.equal(d.primaryTransform.rotationDeg,15);assert.equal(d.schema,'carvewright-design-v2');assert.equal(d.text.value,'Home');
 });
 await check('phone native touch drag, cancellation and action interlock',async({p,context},r)=>{
  await addGraphic(p,'star');await p.locator('#cweGraphicWidth').fill('1');await p.locator('#cweGraphicHeight').fill('1');await p.locator('#cweOffsetX').fill('5');await p.locator('#cweOffsetY').fill('4');await save(p);
  const point=await p.evaluate(()=>{const m=document.querySelector('#cweCanvas').getScreenCTM(),a=new DOMPoint(127,101.6).matrixTransform(m),b=new DOMPoint(152.4,101.6).matrixTransform(m);return {x:a.x,y:a.y,dx:b.x-a.x};});
  const cdp=await context.newCDPSession(p),send=(type,x=point.x,y=point.y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1,radiusX:3,radiusY:3}]});
  await send('touchStart');assert(await p.locator('#cweSave').isDisabled(),'An active drag cannot race a save or export');assert(await p.locator('#cweExportSvg').isDisabled());
  await send('touchMove',point.x+1);await send('touchEnd');assert.equal(Number(await p.locator('#cweOffsetX').inputValue()),5,'A tap with one pixel of finger jitter only selects');
  await send('touchStart');
  await send('touchMove',point.x+point.dx);await send('touchEnd');assert(Math.abs(Number(await p.locator('#cweOffsetX').inputValue())-6)<.02,'Native touch moves in physical stock units');assert(await p.locator('#cweSave').isEnabled());
  await p.locator('#cweUndo').click();assert.equal(Number(await p.locator('#cweOffsetX').inputValue()),5);const canRedo=await p.locator('#cweRedo').isEnabled();
  await send('touchStart');await send('touchMove',point.x+point.dx);await send('touchCancel');assert.equal(Number(await p.locator('#cweOffsetX').inputValue()),5,'Canceled touch restores the pre-gesture artwork');assert.equal(await p.locator('#cweRedo').isEnabled(),canRedo,'Canceled touch preserves prior history');assert(await p.locator('#cweSave').isEnabled());
  await send('touchStart');await p.evaluate(()=>window.__authorized=false);await send('touchMove',point.x+point.dx);await send('touchEnd');await p.waitForFunction(()=>!document.querySelector('#carvewrightStudio'));r.nativeTouchProtocol=true;
 },390,844);
 await check('review invalidation, undo after save and revoked authorization',async({p})=>{
  await panel(p,'review');await p.locator('#cweReview').click();await ready(p);await save(p);const revision=await p.evaluate(()=>__saved.revision);
  await panel(p,'lettering');await p.locator('#cweWording').fill('Cabin');await save(p);await p.locator('#cweUndo').click();await save(p);const saved=await p.evaluate(()=>__saved);assert.equal(saved.text.value,'Home');assert.equal(saved.review,null);assert.equal(saved.revision,revision+2,'Undo keeps the latest persistence revision');
  await p.locator('#cweExportSvg').click();await ready(p);assert(await p.locator('#cweDownloads a').count());const rejected=await p.evaluate(()=>{window.__authorized=false;const e=new MouseEvent('auxclick',{button:1,bubbles:true,cancelable:true});return !document.querySelector('#cweDownloads a').dispatchEvent(e);});assert(rejected,'Revoked authorization cancels an auxiliary download click synchronously');await p.waitForFunction(()=>!CarvewrightStudio.isOpen());await p.waitForFunction(()=>!document.querySelector('#carvewrightStudio'));assert.equal(await p.locator('#cweDownloads a').count(),0);
 });
 for(const [w,h,label] of [[390,844,'phone'],[1024,768,'ipad'],[1440,900,'desktop']])await check(label+' controls reachable, touch targets and visible preview',async({p},r)=>{
  if(label==='phone'){await p.locator('#cweFontPicker').click();const first=await p.locator('[data-font="studio-sans"]').boundingBox(),pane=await p.locator('.cwe-panel-scroll').boundingBox();assert(first.y>=pane.y&&first.y+first.height<=pane.y+pane.height,'Opening the font picker immediately exposes a full usable font card');await snap(p,'phone-font-picker');await p.locator('#cweCloseFonts').click();}
  await panel(p,'objects');await p.locator('#cweAddGraphic').click();assert.equal(await p.locator('[data-graphic]').count(),16);await snap(p,label+'-graphic-picker');await p.locator('[data-graphic="pine"]').click();
  await panel(p,'lettering');r.geometry=await p.evaluate(()=>{const root=document.querySelector('#carvewrightStudio'),b=root.getBoundingClientRect(),preview=document.querySelector('#cweViewport').getBoundingClientRect();return {documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,modal:{x:b.x,right:b.right,y:b.y,bottom:b.bottom},preview:{y:preview.y,bottom:preview.bottom,height:preview.height},smallButtons:[...root.querySelectorAll('button')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id||e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.w<43.5||e.h<43.5)};});
  assert(r.geometry.documentWidth<=w+1,'No horizontal page overflow');assert(r.geometry.modal.right<=w+1);assert.equal(r.geometry.smallButtons.length,0,'Every visible editor button is at least 44 pixels');assert(r.geometry.preview.y>=0&&r.geometry.preview.bottom<h,'Preview remains in the visible viewport');
  await p.locator('#cweGraphicWidth').fill('2');await p.locator('#cweGraphicHeight').fill('3');await p.locator('#cweOffsetX').fill('4');await p.locator('#cweOffsetY').fill('4');await p.locator('#cweRotation').fill('15');await p.locator('#cweSave').click();await ready(p);assert((await p.evaluate(()=>__saved))?.layers[0].rotationDeg===15);await snap(p,label+'-touch-editor');
 },w,h);
 await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({scope:'Isolated Chromium; real Studio, core and IndexedDB. Native Safari and physical CNC are not claimed.',results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length},null,2));process.exitCode=results.some(r=>!r.pass)?1:0;
}
main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
