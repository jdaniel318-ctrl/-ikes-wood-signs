#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');
const ROOT=path.resolve(process.argv[2]||__dirname),OUT=path.resolve(process.argv[3]||path.join(ROOT,'../lettercraft-ui-evidence'));
fs.mkdirSync(OUT,{recursive:true});
const ORIGIN='https://lettercraft-fixture.invalid';
const scripts=['carve_fonts.js','fleet_design_assets.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','carvewright_studio.js'];
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="carvewright.css"></head><body><button id="origin">Open</button>'+scripts.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const executable=process.env.CHROMIUM_PATH||'/tmp/carvewright-signcraft-browser/chrome-linux64/chrome';
const results=[];
async function ready(p){await p.waitForFunction(()=>document.querySelector('#carvewrightStudio')?.getAttribute('aria-busy')==='false');}
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const embedded of [false,true]){
   const name=embedded?'Ike embedded editor returns new mixed-case style':'iPad font picker, save and reopen preserve both new styles';
   const result={name,pass:false},errors=[],blocked=[];
   const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
   await context.route('**/*',r=>{const u=new URL(r.request().url()),n=u.pathname.slice(1);if(u.origin!==ORIGIN||!['index.html','carvewright.css',...scripts].includes(n)){blocked.push(u.href);return r.abort();}return r.fulfill({status:200,contentType:(n.endsWith('.js')?'text/javascript':n.endsWith('.css')?'text/css':'text/html')+';charset=utf-8',body:n==='index.html'?html:fs.readFileSync(path.join(ROOT,n))});});
   const p=await context.newPage();p.setDefaultTimeout(7000);p.on('pageerror',e=>errors.push(String(e)));p.on('dialog',d=>d.accept());
   try{
    await p.goto(ORIGIN+'/index.html');
    await p.evaluate(embedded=>{window.__saved=null;window.__scope={accountId:'lettercraft-test',backend:'offline',environment:'test',site:location.origin,businessId:'carvewright'};window.__open=d=>embedded?CarvewrightStudio.openEmbedded({draft:d,guard:()=>true,parent:document.body,onUse:v=>window.__saved=v}):CarvewrightStudio.open({scope:__scope,guard:()=>true,parent:document.body,referenceOnly:true,draft:d,onSaved:v=>window.__saved=v});const d=CarvewrightCore.createDraft();d.text.value='Night Tide';d.text.sizePercent=65;__open(d);},embedded);
    await ready(p);await p.locator('#cweFontPicker').click();
    assert.equal(await p.locator('[data-font]').count(),10,'Ten outlined font families must be selectable');
    assert.match(await p.locator('#cweFontChoices .cwe-picker-heading strong').innerText(),/^10 vector lettering styles$/,'Heading must match real catalog');
    assert.equal(await p.locator('[data-font] svg text').count(),0,'Font previews must use real outlines');
    await p.screenshot({path:path.join(OUT,embedded?'ike-ten-fonts.png':'ipad-ten-fonts.png'),fullPage:true});
    await p.locator('[data-font="monoton"]').click();
    assert.equal(await p.locator('#cweWording').inputValue(),'Night Tide','Font selection must preserve typed case');
    assert.equal(await p.locator('#cweCurrentFontName').innerText(),'Retroline');
    await p.locator('#cweWording').fill('NIGHT TIDE');
    if(!embedded){
     await p.locator('#cweSave').click();await ready(p);
     assert.equal(await p.evaluate(()=>__saved.text.fontId),'monoton');
     await p.evaluate(()=>{CarvewrightStudio.close(true);__open(__saved);});await ready(p);
     assert.equal(await p.locator('#cweWording').inputValue(),'NIGHT TIDE');
     assert.equal(await p.locator('#cweCurrentFontName').innerText(),'Retroline');
    }
    await p.locator('#cweFontPicker').click();await p.locator('[data-font="berkshire-swash"]').click();
    await p.locator('#cweWording').fill('Cedar & Ember');
    assert.equal(await p.locator('#cweCurrentFontName').innerText(),'Orchard Swash');
    await p.locator('#cweSave').click();if(!embedded)await ready(p);else await p.waitForFunction(()=>!!window.__saved);
    const saved=await p.evaluate(()=>__saved);assert.equal(saved.text.fontId,'berkshire-swash');assert.equal(saved.text.value,'Cedar & Ember');
    if(!embedded){await p.evaluate(()=>{CarvewrightStudio.close(true);__open(__saved);});await ready(p);assert.equal(await p.locator('#cweWording').inputValue(),'Cedar & Ember');await p.screenshot({path:path.join(OUT,'ipad-new-swash-design.png'),fullPage:true});}
    assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);result.pass=true;result.newFonts=['monoton','berkshire-swash'];result.wording=saved.text.value;
   }catch(e){result.error=e.stack;await p.screenshot({path:path.join(OUT,(embedded?'embedded':'ipad')+'-failure.png'),fullPage:true}).catch(()=>{});}finally{await context.close();results.push(result);console.log(JSON.stringify(result));}
  }
 }finally{await browser.close();}
 const report={schema:'lettercraft-ui-verification-v1',scope:'Real isolated Chromium, iPad viewport, IndexedDB and embedded Ike editor; no live session or external requests',pass:results.every(r=>r.pass),checks:results};
 fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');if(!report.pass)process.exitCode=1;
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
