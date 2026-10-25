#!/usr/bin/env node
'use strict';
// Isolated photo mapping and Studio checks. No live stores, accounts or requests.
// Usage: node VERIFY_BOARDCRAFT_STUDIO.cjs [RELEASE] [EVIDENCE_DIRECTORY]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../boardcraft-studio-evidence'));
assert(fs.existsSync(path.join(ROOT,'boardcraft_photo.js')),'Boardcraft needs one shared photo scene renderer');
const Photo=require(path.join(ROOT,'boardcraft_photo.js')),Core=require(path.join(ROOT,'carvewright_core.js')),Fonts=require(path.join(ROOT,'carve_fonts.js'));
const clone=x=>JSON.parse(JSON.stringify(x));
const draft=Core.createDraft();draft.text.value='Home';draft.text.sizePercent=35;
const photo={id:'photo-fixture',mime:'image/jpeg',dataUrl:'data:image/jpeg;base64,/9j/2Q==',sha256:'a'.repeat(64),width:1200,height:800};
const approx=(a,b,message)=>assert(Math.abs(a-b)<1e-7,message||`${a} equals ${b}`);
for(const quarterTurns of [0,1,2,3]){
  const board=Photo.createBoard(draft,photo,quarterTurns),before=JSON.stringify({draft,photo,board}),scene=Photo.scene(draft,photo,board,Fonts);
  assert.equal(scene.width,quarterTurns%2?800:1200);assert.equal(scene.height,quarterTurns%2?1200:800);
  const [a,b,c,d,tx,ty]=scene.matrix;approx(a,d,'Both axes use the same exact vector scale');assert.equal(b,0);assert.equal(c,0);
  approx(scene.framePixels.w,a*draft.stock.widthMm);approx(scene.framePixels.h,a*draft.stock.heightMm);
  const p=Photo.toStockPoint(scene.matrix,{x:tx+a*91.25,y:ty+a*42.5});approx(p.x,91.25);approx(p.y,42.5);
  assert(scene.artworkSvg.includes(Core.renderPaths(Core.layout(draft,Fonts))),'The scene contains original vector paths');
  assert(scene.svg.includes(photo.dataUrl));assert(!/<text\b/.test(scene.svg),'Proof lettering never substitutes browser text');
  assert.equal(JSON.stringify({draft,photo,board}),before,'Rendering never mutates source photo or design');
}
const base=Photo.createBoard(draft,photo);
for(const patch of [{photoId:'wrong'},{quarterTurns:4},{frame:{x:0,y:0,w:NaN,h:.5}},{frame:{x:.9,y:0,w:1,h:.5}},{frame:{x:0,y:0,w:1,h:1}},{dimensionsStatus:'measured'}]){
  const bad={...clone(base),...patch};assert.equal(Photo.validate(draft,photo,bad,Fonts).ok,false);assert.throws(()=>Photo.scene(draft,photo,bad,Fonts));
}
assert.equal(Photo.validate(draft,photo,base,Fonts,{requireConfirmed:true}).ok,false);
assert.equal(Photo.validate(draft,photo,{...base,frameConfirmed:true},Fonts,{requireConfirmed:true}).ok,true);
assert.equal(Photo.validate(draft,{...photo,dataUrl:'data:image/svg+xml,<svg onload="alert(1)"/>'},base,Fonts).ok,false);
assert.throws(()=>Photo.toStockPoint([1,0,0,2,0,0],{x:1,y:1}));
console.log('PASS shared photo scene: uniform placement, all orientations, immutable sources and rejected invalid frames');
if(process.env.BOARDCRAFT_CORE_ONLY==='1')process.exit(0);

const runtimeRequire=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||__dirname,'playwright/package.json'));
const {chromium}=runtimeRequire('playwright');
const executable=process.env.CHROMIUM_PATH||['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(p=>fs.existsSync(p));
const ORIGIN='https://boardcraft-fixture.invalid',scripts=['carve_fonts.js','fleet_design_assets.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','boardcraft_photo.js','carvewright_studio.js'];
const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="carvewright.css"><link rel="stylesheet" href="ike_shop.css"></head><body><button id="origin">Open</button>'+scripts.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const results=[];let browser;
async function fixture(withPhoto=true,embedded=true,width=1024,height=768){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<600}),errors=[],blocked=[];
  await context.route('**/*',route=>{const url=new URL(route.request().url()),name=decodeURIComponent(url.pathname.slice(1));if(url.origin!==ORIGIN||!scripts.concat(['index.html','carvewright.css','ike_shop.css','ike_character.png']).includes(name)){blocked.push(url.href);return route.abort();}const type=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'text/html';return route.fulfill({status:200,contentType:type,body:name==='index.html'?html:fs.readFileSync(path.join(ROOT,name))});});
  const p=await context.newPage();p.setDefaultTimeout(6000);p.on('pageerror',e=>errors.push(String(e)));p.on('dialog',d=>d.accept());await p.goto(ORIGIN+'/index.html');
  await p.evaluate(({withPhoto,embedded})=>{
    window.__authorized=true;window.__used=null;window.__saved=null;
    const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d');x.fillStyle='#d9b986';x.fillRect(0,0,1200,800);x.fillStyle='#8a5735';x.fillRect(60,240,1080,330);x.fillStyle='#1786bf';x.fillRect(60,240,80,80);
    window.__photo={id:'browser-photo',mime:'image/jpeg',dataUrl:c.toDataURL('image/jpeg',.85),sha256:'b'.repeat(64),width:1200,height:800};
    window.__draft=CarvewrightCore.createDraft();__draft.text.value='Home';__draft.text.sizePercent=35;
    window.__board=BoardcraftPhoto.createBoard(__draft,__photo);window.__originalPhoto=__photo.dataUrl;
    const opts={draft:__draft,parent:document.body,guard:()=>__authorized,boardPhoto:withPhoto?{photo:__photo,board:__board}:undefined,onUse:(d,b)=>{__used={draft:d,board:b};},scope:{accountId:'boardcraft-fixture',backend:'offline',environment:'test',site:location.origin,businessId:'carvewright'},referenceOnly:true,onSaved:(d,b)=>{__saved={draft:d,board:b};}};
    window.__embedded=embedded;(embedded?CarvewrightStudio.openEmbedded:CarvewrightStudio.open)(opts);
  },{withPhoto,embedded});
  await ready(p);return {p,context,errors,blocked};
}
async function ready(p){await p.waitForFunction(()=>document.querySelector('#carvewrightStudio')?.getAttribute('aria-busy')==='false');}
async function panel(p,name){await p.locator('[data-panel="'+name+'"]').click();}
async function range(p,id,value){await p.locator('#'+id).evaluate((node,value)=>{node.value=String(value);node.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function check(name,fn,withPhoto=true,embedded=true,width=1024,height=768){
  const f=await fixture(withPhoto,embedded,width,height),result={name,pass:false};
  try{await fn(f);assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);result.pass=true;}catch(e){result.error=e.stack;fs.mkdirSync(OUT,{recursive:true});await f.p.screenshot({path:path.join(OUT,name.replace(/[^a-z0-9]+/gi,'-')+'.png'),fullPage:true}).catch(()=>{});}finally{results.push(result);await f.context.close();console.log(JSON.stringify({name,pass:result.pass,error:result.error?.split('\n')[0]}));}
}
async function main(){
  browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
  await check('iPad board framing, rotation and exact returned composition',async({p})=>{
    assert.equal(await p.locator('#cweCanvas image').count(),1);assert(!(await p.locator('#cweTitle').textContent()).includes('SHOPCRAFT'));assert.equal(await p.locator('.cwe-ike-character').count(),1);
    await panel(p,'stock');await range(p,'cweFrameScale',65);await range(p,'cweFrameX',75);await range(p,'cweFrameY',25);
    assert((await p.locator('#cweFrameState').textContent()).includes('Use this area'));
    await p.locator('#cweFrameApply').click();assert((await p.locator('#cweFrameState').textContent()).includes('Area chosen'));
    await p.locator('#cwePhotoRotateRight').click();assert((await p.locator('#cweFrameState').textContent()).includes('Use this area'));
    assert.equal(await p.locator('#cweCanvas').getAttribute('viewBox'),'0 0 800 1200');
    await range(p,'cweFrameScale',70);await range(p,'cweFrameX',80);await p.locator('#cweFrameApply').click();
    await panel(p,'lettering');await p.locator('#cweWording').fill('Harbor');
    const visual=await p.evaluate(()=>({paths:[...document.querySelectorAll('#cwePhotoArtwork path')].map(n=>({d:n.getAttribute('d'),transform:n.getAttribute('transform')})),matrix:document.querySelector('#cwePhotoArtwork').getAttribute('transform')}));
    await p.locator('#cweSave').click();await p.waitForFunction(()=>!!__used);
    const used=await p.evaluate(()=>{const scene=BoardcraftPhoto.scene(__used.draft,__photo,__used.board,IkeCarveFonts),dom=new DOMParser().parseFromString(scene.svg,'image/svg+xml');return {board:__used.board,paths:[...dom.querySelectorAll('path')].map(n=>({d:n.getAttribute('d'),transform:n.getAttribute('transform')})),matrix:'matrix('+scene.matrix.join(' ')+')',samePhoto:__photo.dataUrl===__originalPhoto,sourceBoard:__board,stock:__used.draft.stock};});
    assert.equal(used.board.quarterTurns,1);assert.equal(used.board.frameConfirmed,true);assert.equal(used.board.dimensionsStatus,'reference-unconfirmed');assert.equal(used.samePhoto,true);assert.equal(used.sourceBoard.quarterTurns,0,'Private edits do not mutate caller state');assert.equal(used.stock.widthMm,draft.stock.widthMm);assert.equal(used.stock.heightMm,draft.stock.heightMm);assert.equal(visual.matrix,used.matrix);assert.deepEqual(visual.paths,used.paths,'Editor and proof use identical paths and transforms');
  });
  await check('photo artwork pointer movement uses physical stock coordinates',async({p})=>{
    await panel(p,'stock');await range(p,'cweFrameScale',75);await range(p,'cweFrameX',60);await p.locator('#cweFrameApply').click();await panel(p,'objects');await p.locator('#cweAddGraphic').click();await p.locator('[data-graphic="star"]').click();
    await p.locator('#cweGraphicWidth').fill('1');await p.locator('#cweGraphicHeight').fill('1');await p.locator('#cweOffsetX').fill('5');await p.locator('#cweOffsetY').fill('3');
    const q=await p.evaluate(()=>{const m=document.querySelector('#cwePhotoArtwork').getScreenCTM(),a=new DOMPoint(127,76.2).matrixTransform(m),b=new DOMPoint(152.4,76.2).matrixTransform(m);return {x:a.x,y:a.y,dx:b.x-a.x};});
    await p.mouse.move(q.x,q.y);await p.mouse.down();await p.mouse.move(q.x+q.dx,q.y,{steps:5});await p.mouse.up();assert(Math.abs(Number(await p.locator('#cweOffsetX').inputValue())-6)<.02,'Photo-space pointer movement maps back to one physical inch');
    await p.locator('#cweUndo').click();assert.equal(Number(await p.locator('#cweOffsetX').inputValue()),5);await p.locator('#cweRedo').click();assert(Math.abs(Number(await p.locator('#cweOffsetX').inputValue())-6)<.02);
  });
  await check('frame drag cancel and stock changes preserve recoverable editing',async({p,context})=>{
    await panel(p,'stock');await range(p,'cweFrameScale',50);await p.locator('#cweFrameApply').click();
    const q=await p.locator('#cwePhotoFrame').boundingBox(),x=q.x+q.width/2,y=q.y+q.height/2,cdp=await context.newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+20,y:y+10,id:1}]});assert(await p.locator('#cweSave').isDisabled());await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    assert.equal(Number(await p.locator('#cweFrameX').inputValue()),50);assert.equal(Number(await p.locator('#cweFrameY').inputValue()),50);
    await p.locator('#cweWidth').fill('');assert(await p.locator('#cweSave').isDisabled());await p.locator('#cweWidth').fill('30');assert(await p.locator('#cweSave').isEnabled());assert((await p.locator('#cweFrameState').textContent()).includes('Use this area'));
    await p.locator('#cweSave').click();await p.waitForFunction(()=>!!__used);const check=await p.evaluate(()=>BoardcraftPhoto.validate(__used.draft,__photo,__used.board,IkeCarveFonts,{requireConfirmed:true}));assert.equal(check.ok,true);
  });
  await check('maker accepts the same photo scene without customer branding',async({p})=>{
    assert.equal(await p.locator('#cweCanvas image').count(),1);assert.equal(await p.locator('.cwe-ike-character').count(),0);await panel(p,'stock');await range(p,'cweFrameScale',80);await p.locator('#cweFrameApply').click();await p.locator('#cweSave').click();await ready(p);const saved=await p.evaluate(()=>__saved);assert(saved?.draft?.revision>0);assert.equal(saved.board.frameConfirmed,true);assert.equal(saved.board.photoId,'browser-photo');
  },true,false);
  await check('existing maker without a photo retains wood preview and editing',async({p})=>{
    assert.equal(await p.locator('#cweCanvas image').count(),0);assert.equal(await p.locator('#cweWoodGradient').count(),1);assert.equal(await p.locator('#cweBoardPhotoControls').count(),0);await p.locator('#cweWording').fill('Cabin');await p.locator('#cweSave').click();await ready(p);assert.equal((await p.evaluate(()=>__saved)).draft.text.value,'Cabin');
  },false,false);
  await browser.close();fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({scope:'Local synthetic photo and isolated Chromium; no physical calibration or Safari hardware claim.',results},null,2));process.exitCode=results.some(r=>!r.pass)?1:0;
}
main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
