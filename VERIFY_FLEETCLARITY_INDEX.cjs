#!/usr/bin/env node
'use strict';
// Actual sealed application and Engine controls. Local synthetic history only;
// all network intercepted. Native Safari and live authority are not claimed.
// Usage: node VERIFY_FLEETCLARITY_INDEX.cjs [RELEASE_DIR] [OUTPUT_DIR]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),{createRequire}=require('node:module');
const {chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||path.join(root,'../fleetclarity-index-evidence'));
const files=Object.fromEntries(fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>[n,fs.readFileSync(path.join(root,n))]));
const manifest=JSON.parse(files['DEPLOYMENT_MANIFEST.json']),origin='https://fleetclarity-index.invalid';
const results=[],errors=[],blocked=[],requests=[];let browser,page,context,sourceOverrides={};
const customerKey='email:shared-fixture@example.invalid';
const history={
  'ikes-wood-signs':{[customerKey]:{projectId:'ikes-wood-signs',customerKey,name:'Ike Synthetic Customer',email:'shared-fixture@example.invalid',phone:'555-0100',orderCount:2,lastOrderDate:'2026-10-25T12:00:00Z',purchases:[{description:'Ike synthetic sign',date:'2026-10-25T12:00:00Z'}]}},
  'beccas-bloom-shop':{[customerKey]:{projectId:'beccas-bloom-shop',customerKey,name:'Flower Synthetic Customer',email:'shared-fixture@example.invalid',phone:'555-0101',orderCount:99,lastOrderDate:'2026-10-25T12:00:00Z',purchases:[{description:'Flower synthetic bouquet',date:'2026-10-25T12:00:00Z'}]}}
};
fs.mkdirSync(out,{recursive:true});
async function check(name,fn){const row={name,pass:false};try{await fn(row);row.pass=true;}catch(e){row.error=e.stack||String(e);if(page)await page.screenshot({path:path.join(out,'failure-'+results.length+'.png'),fullPage:true}).catch(()=>{});}results.push(row);console.log(JSON.stringify({name,pass:row.pass,...(row.error?{error:row.error.split('\n')[0]}:{})}));}
async function dock(){
  if(await page.locator('#projectEngineControl').isVisible())await page.locator('#closeProjectEngineControl').click();
  if(await page.locator('#engineConfigurationDock').isVisible())await page.locator('#engineConfigurationCloseBtn').click();
  await page.locator('[data-clear-deck-command="projects"]').click();
  await page.locator('#fleetDockFilters [data-fleet-dock-filter="all"]').click();
  await page.locator('#fleetDockSearch').fill('');
  await page.waitForFunction(()=>document.querySelector('#fleetCommissioningFleet')?.getAttribute('aria-busy')!=='true'&&document.querySelectorAll('.fleet-dock-card').length>=6&&document.querySelector('#fleetDockSearch')?.value==='');
}
async function project(id){await dock();await page.locator('.fleet-dock-card [data-open-project-control="'+id+'"]').click();await page.waitForFunction(()=>document.body.classList.contains('engine-workspace-open')&&!document.querySelector('#projectEngineControl').classList.contains('hidden'));await page.locator('#projectTabContent [data-project-jump="customers"]').waitFor({state:'visible'});}
async function historyBytes(){return page.evaluate(()=>localStorage.getItem('blackFlagProjectCustomersV1'));}
function staticChecks(report){const ids=['fleet-doctrine-registry','golden-voyage-contract','fleet-truth-signal','command-layer-placement','admiral-passage','owner-recovery-helm','release-identity','ike-style-foundry','ike-glyphforge'];return Object.fromEntries(report.checks.filter(c=>ids.includes(c.id)).map(c=>[c.id,c.state]));}

async function statusFixture(id,{publication='live',owner='not_claimed'}={}){
  await dock();
  const original=await page.evaluate(({id,publication,owner})=>{
    const p=window.blackFlagV4ProjectById(id);if(!p)throw Error('Missing synthetic fixture vessel '+id);
    const before=structuredClone(p);
    p.publish={...(p.publish||{}),status:publication};
    p.ownerAccess={...(p.ownerAccess||{}),enabled:true,status:owner,invitation:owner==='invited'?{projectId:id,expiresAt:'2099-01-01T00:00:00Z'}:null};
    p.deployments=[];p.deployment={};
    p.experienceTest={...(p.experienceTest||{}),approvedAt:null,approvedSignature:null,seaTrialSignature:null,lastSeaTrialDeploymentId:null};
    return before;
  },{id,publication,owner});
  const query=id==='ikes-wood-signs'?'Ike':'Becca';
  await page.locator('#fleetDockSearch').fill(query);
  await page.waitForFunction(id=>document.querySelector('#fleetCommissioningFleet')?.getAttribute('aria-busy')!=='true'&&document.querySelectorAll('.fleet-dock-card').length===1&&document.querySelector('.fleet-dock-card')?.dataset.projectId===id,id);
  return async()=>{
    await page.evaluate(original=>{const p=window.blackFlagV4ProjectById(original.id);if(!p)return;for(const key of Object.keys(p))delete p[key];Object.assign(p,original);},original);
  };
}
async function fixtureMeaning(id){
  return page.evaluate(id=>{const p=window.blackFlagV4ProjectById(id);return {publication:p.publish?.status,ownerStatus:p.ownerAccess?.status,ownerCredential:p.ownerAccess?.credential,deployments:p.deployments,approvedAt:p.experienceTest?.approvedAt,approvedSignature:p.experienceTest?.approvedSignature,captain:window.__darkSkyFleetCommissioning8622?.[id]||null};},id);
}
async function openDisplayedProject(id){
  await page.locator('.fleet-dock-card [data-open-project-control="'+id+'"]').click();
  await page.locator('#projectOverviewLive .pc-state-matrix').waitFor({state:'visible'});
}

(async()=>{try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/carvewright-signcraft-browser/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  context=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname).slice(1)||'index.html';if(u.origin===origin&&route.request().method()==='GET'&&files[name]){requests.push({name,query:u.search});return route.fulfill({body:sourceOverrides[name]??files[name],contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':name.endsWith('.json')?'application/json':'application/octet-stream'});}blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();});
  await context.addInitScript(build=>{delete Navigator.prototype.serviceWorker;sessionStorage.setItem('darkSkyAutoProving:'+build,'done');},manifest.build);
  await check('sealed index opens the existing Engine PIN route without external contact',async()=>{
    for(const [name,sha]of Object.entries(manifest.runtime_integrity.files))assert.equal(crypto.createHash('sha256').update(files[name]).digest('hex'),sha,name);
    await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__darkSkyReleaseGateState==='clear');
    await page.locator('#blackFlagEntryPin').fill('5615');await page.locator('#blackFlagEntryUnlock').click();
    await page.waitForFunction(()=>document.body.classList.contains('engine-mode')&&!document.querySelector('#enginePanel').classList.contains('hidden'));
    // Engine first paint deliberately precedes its own readiness run. Observe its
    // completion before measuring a separate manual run's request count.
    await page.waitForFunction(()=>window.__lastAdmiralReadinessReport?.source==='view'&&window.__darkSkyProofSignerTrace8616?.history?.some(row=>row.label==='after-engine-home-background-settlement'));
    assert.equal(await page.locator('#blackFlagEntryError').textContent(),'');assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
    await page.evaluate(value=>localStorage.setItem('blackFlagProjectCustomersV1',JSON.stringify(value)),history);
  });

  await check('published legacy showroom shows incomplete commissioning and one missing-deployment issue',async row=>{
    const restore=await statusFixture('ikes-wood-signs');
    try{
      const before=await fixtureMeaning('ikes-wood-signs'),card=page.locator('.fleet-dock-card[data-project-id="ikes-wood-signs"]');
      const compass=await card.innerText();
      row.compassText=compass;
      assert.match(await card.locator('.wayfinder-local-state').innerText(),/publication.*PUBLISHED/i);
      assert.match(await card.locator('[data-fleet-dock-action="owner"]').innerText(),/Owner Sign-In/i);
      assert.match(await card.locator('[data-fleet-dock-action="owner"]').innerText(),/not.*claimed|claim.*not.*recorded|setup.*pending/i);
      await card.screenshot({path:path.join(out,'fleetclarity-ike-compass.png')});
      await openDisplayedProject('ikes-wood-signs');
      const publication=page.locator('#projectOverviewLive .pc-state-matrix article').filter({has:page.locator('small',{hasText:/^PUBLICATION$/})});
      assert.equal((await publication.locator('strong').innerText()).trim(),'PUBLISHED');
      const evidence=page.locator('.pc-commissioning-evidence');
      assert.match(await evidence.innerText(),/incomplete/i);
      assert.equal(await evidence.locator('[data-commissioning-gate]').count(),7);
      for(const id of ['experience','sea','live','captain']){
        const gate=evidence.locator('[data-commissioning-gate="'+id+'"]');
        assert.equal(await gate.count(),1);assert.doesNotMatch(await gate.getAttribute('class')||'',/\bpass\b/);
        assert.match(await gate.innerText(),/OPEN|PENDING|NEEDED/i);
      }
      assert.equal(await page.locator('#projectOverviewLive .pc-attention-row[data-project-jump="deployment"]').count(),1,'One absent deployment must produce one corresponding attention item');
      const after=await fixtureMeaning('ikes-wood-signs');assert.deepEqual(after,before,'Presentation cannot claim an owner, approve experience, create outposts or commission the vessel');
      await page.locator('#projectOverviewLive').screenshot({path:path.join(out,'fleetclarity-ike-overview.png')});
      row.recordsUnchanged=true;
    }finally{await restore();}
  });
  await check('commissioning review opens its evidence dock without performing a launch or approval',async row=>{
    const restore=await statusFixture('ikes-wood-signs');
    try{
      await openDisplayedProject('ikes-wood-signs');
      const before=await fixtureMeaning('ikes-wood-signs'),historyBefore=await historyBytes();
      await page.locator('.pc-commissioning-evidence [data-open-fleet-commissioning="ikes-wood-signs"]').click();
      await page.locator('#fleetCommissioningModal').waitFor({state:'visible'});
      assert.equal((await page.locator('#fleetCommissioningTitle').innerText()).trim(),"Ike's Wood Signs");
      assert.equal(await page.locator('#captainCommissionBtn').isDisabled(),true);
      assert.equal(await page.evaluate(()=>document.body.classList.contains('engine-mode')),true);
      assert.deepEqual(await fixtureMeaning('ikes-wood-signs'),before);
      assert.equal(await historyBytes(),historyBefore);
      await page.locator('#fleetCommissioningModal .fleet-commissioning-shell').screenshot({path:path.join(out,'fleetclarity-review-dock.png')});
      await page.locator('#closeFleetCommissioning').click();
      await page.locator('#fleetCommissioningModal').waitFor({state:'hidden'});
      row.recordsUnchanged=true;
    }finally{if(await page.locator('#fleetCommissioningModal').isVisible())await page.locator('#closeFleetCommissioning').click();await restore();}
  });
  await check('status presentation follows the selected vessel and fits a narrow screen',async row=>{
    const restore=await statusFixture('beccas-bloom-shop',{publication:'development',owner:'invited'});
    try{
      const card=page.locator('.fleet-dock-card[data-project-id="beccas-bloom-shop"]');
      assert.match(await card.locator('.wayfinder-local-state').innerText(),/publication.*DEVELOPMENT/i);
      assert.match(await card.locator('[data-fleet-dock-action="owner"]').innerText(),/invitation|invited/i);
      await openDisplayedProject('beccas-bloom-shop');
      assert.match(await page.locator('#pecTitle').innerText(),/Becca/);
      const publication=page.locator('#projectOverviewLive .pc-state-matrix article').filter({has:page.locator('small',{hasText:/^PUBLICATION$/})});
      assert.equal((await publication.locator('strong').innerText()).trim(),'DEVELOPMENT');
      assert.equal(await page.locator('.pc-commissioning-evidence [data-open-fleet-commissioning="beccas-bloom-shop"]').count(),1);
      assert.equal(await page.locator('.pc-commissioning-evidence [data-open-fleet-commissioning="ikes-wood-signs"]').count(),0);
      await page.setViewportSize({width:390,height:844});
      const overflow=await page.locator('.pc-commissioning-evidence,.pc-commissioning-evidence [data-commissioning-gate]').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({text:e.textContent,width:e.clientWidth,needed:e.scrollWidth})));
      assert.deepEqual(overflow,[],'New commissioning evidence must fit a narrow viewport');
      await page.locator('.pc-commissioning-evidence').screenshot({path:path.join(out,'fleetclarity-narrow-evidence.png')});
      row.narrowViewport={width:390,height:844};
    }finally{await page.setViewportSize({width:1024,height:768});await restore();}
  });

  await check('Customers button renders only the selected vessel history without rewriting it',async()=>{
    const before=await historyBytes();await project('ikes-wood-signs');await page.locator('#projectTabs [data-project-tab="customers"]').click();
    await page.locator('#rebuildCustomerHistoryBtn').waitFor({state:'visible'});
    const text=await page.locator('#projectTabContent').innerText();assert.match(text,/Ike Synthetic Customer/);assert.match(text,/Ike synthetic sign/);assert.doesNotMatch(text,/Flower Synthetic|engine-wide orders|101/);
    assert.equal(await page.locator('.customer-directory-card').count(),1);assert.equal(await historyBytes(),before);
    const customerHeading=await page.locator('.customer-directory-head h4').evaluate(el=>{
      const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(v=>{const c=Number(v)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
      const foreground=getComputedStyle(el).color,background=getComputedStyle(el.closest('.customer-directory-card')).backgroundColor;
      const a=luminance(foreground),b=luminance(background);return {foreground,background,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    });
    assert(customerHeading.contrast>=4.5,'Customer name must remain readable on its white card: '+JSON.stringify(customerHeading));
    await page.screenshot({path:path.join(out,'customers-ike.png'),fullPage:true});
  });
  await check('Overview Customers shortcut and switching vessels keep populated and empty history separate',async()=>{
    const before=await historyBytes();await project('beccas-bloom-shop');await page.locator('#projectTabContent [data-project-jump="customers"]').click();
    await page.locator('#rebuildCustomerHistoryBtn').waitFor({state:'visible'});
    const text=await page.locator('#projectTabContent').innerText();assert.match(text,/Flower Synthetic Customer/);assert.doesNotMatch(text,/Ike Synthetic|Ike synthetic sign|engine-wide orders/);
    await project('grizzly-bear');await page.locator('#projectTabs [data-project-tab="customers"]').click();await page.locator('#rebuildCustomerHistoryBtn').waitFor({state:'visible'});
    assert.equal(await page.locator('.customer-directory-card').count(),0);assert.doesNotMatch(await page.locator('#projectTabContent').innerText(),/Ike Synthetic|Flower Synthetic/);assert.equal(await historyBytes(),before);
  });
  await check('return from Project Control restores Fleet Compass search filter scroll and focus',async row=>{
    await dock();await page.locator('#fleetDockFilters [data-fleet-dock-filter="live"]').click();await page.locator('#fleetDockSearch').fill('Ike');
    await page.waitForFunction(()=>document.querySelector('#fleetCommissioningFleet')?.getAttribute('aria-busy')!=='true'&&document.querySelectorAll('.fleet-dock-card').length===1&&document.querySelector('.fleet-dock-card')?.dataset.projectId==='ikes-wood-signs'&&document.querySelector('#fleetDockResultCount')?.textContent.includes('Search: Ike'));
    const button=page.locator('.fleet-dock-card [data-open-project-control="ikes-wood-signs"]');await button.scrollIntoViewIfNeeded();await button.focus();
    const before=await page.evaluate(()=>({y:scrollY,focus:document.activeElement?.dataset?.openProjectControl}));assert.ok(before.y>0);
    await button.click();await page.waitForFunction(()=>document.body.classList.contains('engine-workspace-open'));
    await page.locator('#closeProjectEngineControl').click();await page.waitForFunction(()=>!document.body.classList.contains('engine-workspace-open'));
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(()=>document.body.classList.contains('engine-dock-open')),true);
    assert.equal(await page.locator('#fleetDockSearch').inputValue(),'Ike');assert.equal(await page.locator('[data-fleet-dock-filter="live"]').getAttribute('aria-pressed'),'true');
    const after=await page.evaluate(()=>({y:scrollY,focus:document.activeElement?.dataset?.openProjectControl}));assert.ok(Math.abs(after.y-before.y)<=2,JSON.stringify({before,after}));assert.equal(after.focus,before.focus);row.scroll={before:before.y,after:after.y};
    await page.screenshot({path:path.join(out,'fleet-return.png'),fullPage:true});
  });
  await check('fleet presentation distinguishes recovery tooling from verified protection',async()=>{
    const text=await page.locator('#fleetMissionSummary').textContent();assert.doesNotMatch(text,/STATE PROTECTED|Recovery evidence on record/);assert.match(text,/RECOVERY TOOLS|Recovery tools/i);
    const rows=await page.locator('#fleetMissionRows').textContent();assert.doesNotMatch(rows,/STATE PROTECTED/);assert.match(rows,/local|setup/i);
    assert.doesNotMatch(await page.locator('.fleet-mission-head').textContent(),/State Protected/);
    const overflow=await page.locator('.fleet-mission-pill').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({text:e.textContent,width:e.clientWidth,needed:e.scrollWidth})));
    assert.deepEqual(overflow,[],'Status labels must fit their iPad-width cells');
    await page.locator('#fleetMissionControl').screenshot({path:path.join(out,'fleet-status.png')});
  });
  await check('one completed readiness run observes owner and manifest once with unchanged source checks',async row=>{
    const start=requests.length;
    const report=await page.evaluate(()=>DarkSkyAdmiralReadiness.run('offline-fleetclarity-source-check'));
    const reads=requests.slice(start),counts=Object.fromEntries(['owner.html','DEPLOYMENT_MANIFEST.json'].map(n=>[n,reads.filter(r=>r.name===n).length]));
    row.sourceRequests=reads.filter(r=>['owner.html','DEPLOYMENT_MANIFEST.json'].includes(r.name));
    row.background=await page.evaluate(build=>({state:sessionStorage.getItem('darkSkyAutoProving:'+build),report:window.__lastAdmiralBackgroundReadinessReport?.source,manual:window.__lastAdmiralReadinessReport?.source}),manifest.build);
    assert.deepEqual(counts,{'owner.html':1,'DEPLOYMENT_MANIFEST.json':1});
    const checks=staticChecks(report);assert.equal(Object.keys(checks).length,9);for(const [id,value]of Object.entries(checks))assert.equal(value,'pass',id);
    row.sourceReads=counts;row.staticChecks=checks;row.otherReadinessStates={holds:report.criticalFailures,warnings:report.warnings};
  });
  await check('next readiness run fetches again and rejects current unavailable owner and manifest',async row=>{
    sourceOverrides={'owner.html':Buffer.from('<!doctype html><title>Isolated missing contract fixture</title>'),'DEPLOYMENT_MANIFEST.json':Buffer.from('{invalid')};
    const start=requests.length,report=await page.evaluate(()=>DarkSkyAdmiralReadiness.run('offline-fleetclarity-rejection-check'));
    const reads=requests.slice(start),counts=Object.fromEntries(['owner.html','DEPLOYMENT_MANIFEST.json'].map(n=>[n,reads.filter(r=>r.name===n).length]));assert.deepEqual(counts,{'owner.html':1,'DEPLOYMENT_MANIFEST.json':1});
    const checks=staticChecks(report);for(const id of ['fleet-doctrine-registry','golden-voyage-contract','command-layer-placement','admiral-passage','owner-recovery-helm','ike-style-foundry','ike-glyphforge'])assert.equal(checks[id],'fail',id);
    assert.equal(checks['release-identity'],'warn');row.sourceReads=counts;row.staticChecks=checks;sourceOverrides={};
  });
  await check('existing session lock hides private Engine after cleanup routes',async()=>{
    await page.evaluate(()=>BlackFlagAuth.lock());
    assert.equal(await page.evaluate(()=>BlackFlagAuth.isUnlocked()),false);
    assert.equal(await page.evaluate(()=>document.body.classList.contains('engine-mode')),false);
    assert.equal(await page.locator('#enginePanel').isVisible(),false);assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
  });
}finally{if(browser)await browser.close();}
const report={scope:'Actual sealed Engine UI at iPad and narrow viewports with local PIN, synthetic exact-vessel history and local publication/owner/deployment fixtures; status evidence, review routing, offline source sharing and deliberate failure fixtures. Background proving marked already scheduled to isolate manual runs. No live authority, native Safari, email or CNC acceptance.',build:manifest.build,seal:manifest.release_seal,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,pageErrors:errors,blockedExternalAttempts:blocked,results};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
