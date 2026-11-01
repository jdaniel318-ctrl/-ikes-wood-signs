#!/usr/bin/env node
'use strict';
// Real sealed application, synthetic local Engine session; all network stays offline.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||'../waypoint-browser');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'DEPLOYMENT_MANIFEST.json'))),results=[];
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/steadyhelm-browser/chrome-linux/headless_shell',headless:true,args:['--no-sandbox']});
 try{
  for(const [name,width,height] of [['ipad',1366,1024],['portrait',1024,1366],['phone',390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[],blocked=[];
   page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
   await context.route('**/*',route=>{const u=new URL(route.request().url()),rel=decodeURIComponent(u.pathname).slice(1)||'index.html',file=path.resolve(root,rel);if(u.origin==='https://waypoint.invalid'&&file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({body:fs.readFileSync(file),contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.html')?'text/html':rel.endsWith('.css')?'text/css':rel.endsWith('.json')?'application/json':rel.endsWith('.png')?'image/png':'application/octet-stream'});blocked.push({path:u.pathname,method:route.request().method()});return route.abort();});
   await context.addInitScript(build=>{delete Navigator.prototype.serviceWorker;sessionStorage.setItem('darkSkyAutoProving:'+build,'done');},manifest.build);
   await page.goto('https://waypoint.invalid/index.html');await page.waitForFunction(()=>window.__darkSkyReleaseGateState==='clear');
   await page.locator('#blackFlagEntryPin').fill('5615');await page.locator('#blackFlagEntryUnlock').click();
   await page.waitForFunction(()=>document.body.classList.contains('engine-mode')&&!document.querySelector('#enginePanel').classList.contains('hidden'));
   await page.screenshot({path:path.join(out,name+'-home.png')});
   assert.equal(await page.locator('#engineSystemsDirectory').count(),1,'Engineering needs a direct destination directory');
   assert.equal(await page.locator('.command-spine-map').count(),0,'Office hierarchy should have one actionable presentation');
   assert.equal(await page.locator('#clearDeckLaunchpad .clear-deck-action').count(),4);
   for(const id of ['quartermasterEngineOpen','carvewrightEngineOpen','launchWonderwakeFromEngine'])assert(await page.locator('#'+id).isVisible(),id);
   assert.equal(await page.locator('#launchWonderwakeFromEngine').getAttribute('href'),'https://jdaniel318-ctrl.github.io/wonderwake/');
   assert.match(await page.locator('#launchWonderwakeFromEngine').getAttribute('rel'),/noopener/);
   assert.equal(await page.locator('#engineOfficeDetails').getAttribute('open'),null);
   assert.equal(await page.locator('#engineSystemsDirectory').isVisible(),false);
   await page.locator('#clearDeckSystemsToggle').tap();
   await page.waitForFunction(()=>document.activeElement?.id==='engineSystemsDirectory');
   assert.equal(await page.locator('#clearDeckSystemsToggle').getAttribute('aria-expanded'),'true');
   await page.locator('#engineSystemsDirectory').screenshot({path:path.join(out,name+'-engineering.png')});
   for(const target of ['enginePerformanceDeck','fleetMaintenanceStation','firstMateWatch','admiralReadiness','fleetIntelligenceDeck','fleetLearningRegistry']){
    await page.locator('[data-engine-destination="'+target+'"]').click();
    await page.waitForFunction(id=>document.activeElement?.id===id,target);
    assert(await page.locator('#'+target).isVisible(),target);
    assert.equal(await page.locator('#'+target+' > .waypoint-station-return').count(),1,'Station needs a nearby return: '+target);
    await page.locator('#'+target+' > .waypoint-station-return').tap();
    await page.waitForFunction(()=>document.activeElement?.id==='clearDeckSystemsToggle');
    assert.equal(await page.locator('#'+target).isVisible(),false);
    await page.locator('#clearDeckSystemsToggle').tap();
   }
   await page.locator('#engineSystemsDirectory [data-clear-deck-command="systems-close"]').click();
   await page.waitForFunction(()=>document.activeElement?.id==='clearDeckSystemsToggle');
   assert.equal(await page.locator('#engineSystemsDirectory').isVisible(),false);
   assert.equal(await page.locator('#clearDeckSystemsToggle').getAttribute('aria-expanded'),'false');
   await page.locator('#engineOperateVessels').tap();
   await page.locator('.fleet-dock-card').first().waitFor();
   await page.locator('#fleetDockSearch').fill('Ike');
   await page.waitForFunction(()=>document.querySelectorAll('.fleet-dock-card').length===1);
   await page.locator('.fleet-dock-card [data-open-project-control="ikes-wood-signs"]').click();
   await page.locator('#projectEngineControl').waitFor({state:'visible'});
   await page.locator('#closeProjectEngineControl').click();
   await page.waitForFunction(()=>!document.body.classList.contains('engine-workspace-open'));
   assert.equal(await page.locator('#fleetDockSearch').inputValue(),'Ike');
   await page.locator('[data-clear-deck-command="projects-close"]').tap();
   await page.waitForFunction(()=>document.activeElement?.id==='engineOperateVessels');
   assert.equal(await page.locator('#fleetCommissioningDock').isVisible(),false);
   await page.locator('#engineOperateVessels').tap();
   assert.equal(await page.locator('#fleetDockSearch').inputValue(),'Ike');
   await page.locator('[data-clear-deck-command="projects-close"]').click();
   const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));assert(overflow.doc<=overflow.viewport+1,JSON.stringify(overflow));
   const targets=await page.locator('#clearDeckLaunchpad button,#clearDeckLaunchpad a,#clearDeckLaunchpad summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.innerText,h:e.getBoundingClientRect().height})).filter(e=>e.h<44));assert.deepEqual(targets,[],'44px touch controls');
   for(const id of ['quartermasterEngineOpen','carvewrightEngineOpen']){
    await page.locator('#'+id).tap();await page.locator('#admiralGateOverlay').waitFor({state:'visible'});
    assert.equal(await page.locator('#admiralDeck').isVisible(),false);
    await page.locator('#admiralGateReturnBtn').tap();await page.locator('#admiralGateOverlay').waitFor({state:'hidden'});
   }
   await page.locator('[data-command-open="fleet-registry"]').first().click();
   await page.locator('#admiralGateOverlay').waitFor({state:'visible'});
   assert.equal(await page.locator('#bootstrapFleet').isVisible(),false,'My Fleet stays behind authentication');
   await page.evaluate(()=>BlackFlagAuth.lock());
   assert.equal(await page.locator('#enginePanel').isVisible(),false);assert.equal(await page.locator('#engineSystemsDirectory').isVisible(),false);
   assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
   results.push({viewport:name,passed:true});console.log(name+' PASS');await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'Offline Chromium, local synthetic Engine session; native Safari and live Admiral session not tested',results},null,2));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
