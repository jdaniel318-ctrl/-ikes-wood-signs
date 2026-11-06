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
const html=fs.readFileSync(path.join(ROOT,'countercraft.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]),styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
const executable=process.env.CHROMIUM_PATH||['/tmp/carvewright-signcraft-browser/chrome-linux64/chrome','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(p=>fs.existsSync(p));
let browser;
async function fixture(width=1024,height=768){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true}),f={context,blocked:[],errors:[]};
 await context.route('**/*',async route=>{const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname.slice(1));if(u.origin!==ORIGIN||!fs.existsSync(path.join(ROOT,name))){f.blocked.push(u.href);return route.abort();}return route.fulfill({status:200,contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'text/html',body:fs.readFileSync(path.join(ROOT,name))});});
 const p=f.p=await context.newPage();p.setDefaultTimeout(3000);p.on('pageerror',e=>f.errors.push(String(e)));p.on('dialog',d=>d.accept());await p.goto(ORIGIN+'/countercraft.html?preview=1');return f;
}
async function enginePreview(p){await p.evaluate(()=>{const nonce='b'.repeat(32);sessionStorage.setItem('blackflag-engine-launch:'+nonce,JSON.stringify({kind:'preview',scope:CountercraftConfig.scope,expiresAt:Date.now()+60000,build:CountercraftConfig.build}));});await p.goto(ORIGIN+'/countercraft.html?preview=1&engine=1#launch='+ 'b'.repeat(32));await p.locator('#ccBegin').click();}
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
 await check('public preview query does not open testing',async({p})=>{assert.equal(await p.locator('#ccBegin').count(),0,'Customers must not enter preview from a public URL');assert.match(await p.locator('#ccApp').textContent(),/Ike|available/i);});
 await check('Engine preview follows real steps and expires customer state',async({p})=>{
  await enginePreview(p);await p.clock.install();
  const bytes=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=300;c.getContext('2d').fillRect(0,0,800,300);return c.toDataURL().split(',')[1];});
  await p.locator('#ccFile').setInputFiles({name:'plank.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});await p.locator('#ccNext').click();await p.locator('#ccWording').fill('Private Customer A');assert.equal(await p.locator('#ccName').count(),0);await p.locator('#ccBack').click();assert.equal(await p.locator('.cc-photo').count(),1);await p.locator('#ccNext').click();assert.equal(await p.locator('#ccWording').inputValue(),'Private Customer A');
  await p.clock.fastForward(180001);assert.equal(await p.locator('#ccWording').inputValue(),'Private Customer A','Preview retains work during the extra five minutes');await p.clock.fastForward(270000);assert.equal(await p.locator('#ccWording').count(),0,'Expired customer content must be removed');assert.equal(await p.locator('#ccCover').isVisible(),false);await p.locator('#ccBegin').click();assert.equal(await p.locator('.cc-photo').count(),0);await snap(p,'fresh-customer');
 });
 await check('used preview link cannot be reopened',async({p})=>{await enginePreview(p);await p.reload();assert.equal(await p.locator('#ccBegin').count(),0);});
 await check('customer can finish early and leave a clean station',async({p})=>{await enginePreview(p);assert(await p.locator('#ccExit').isVisible());await p.locator('#ccExit').click();assert(await p.locator('#ccBegin').isVisible());assert(await p.locator('#ccExit').isHidden());});
 await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({results},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
