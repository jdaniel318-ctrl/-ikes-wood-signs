'use strict';
// Exercise the real sealed application with a fresh local Engine session. No external service is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright'),root=path.resolve(process.argv[2]||__dirname),engine=process.argv[3]||'chromium';
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const f=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
 if(!f.startsWith(root+path.sep)||!fs.statSync(f,{throwIfNoEntry:false})?.isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
});
async function run(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await ({webkit,chromium}[engine]).launch({executablePath:process.env[engine==='webkit'?'WEBKIT_PATH':'CHROMIUM_PATH']||undefined});
 const build=JSON.parse(fs.readFileSync(path.join(root,'DEPLOYMENT_MANIFEST.json'))).build;
 const pin=fs.readFileSync(path.join(root,'VERIFY_WAYPOINT_BROWSER.cjs'),'utf8').match(/blackFlagEntryPin'\).pressSequentially\('(\d+)'\)/)[1];
 try{
  for(const [width,height] of [[1024,768],[768,1024]]){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   try{
    await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
    await ctx.addInitScript(b=>{delete Navigator.prototype.serviceWorker;sessionStorage.setItem('darkSkyAutoProving:'+b,'done');},build);
    const page=await ctx.newPage();page.setDefaultTimeout(12000);
    await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__darkSkyReleaseGateState==='clear');
    for(const digit of pin)await page.locator('#blackFlagEntryGate [data-code-key="'+digit+'"]').tap();
    await page.locator('#blackFlagEntryUnlock').tap();await page.locator('#engineOperateVessels:visible').waitFor();
    await page.locator('#engineOperateVessels').tap();await page.locator('.fleet-dock-card').first().waitFor();
    for(const [id,legacy] of [['bf-p-f92f87e8ec44',true],['bor-north-richmond',false]]){
     await page.evaluate(id=>window.blackFlagOpenExperienceTestDeck(id),id);
     await page.locator('[data-experience-mode="preview"]').tap();
     const shell=page.locator('#universalCustomerShell');
     await shell.locator(legacy?'#universalHelpNow':'#borStartRequest').tap();
     if(!legacy)await shell.locator('[data-bor-loss="water-damage"]').tap();
     const address=shell.locator(legacy?'#plumbingServiceAddress':'#borAddress');
     await address.fill('123 Example Lane, Richmond, VA 23220');await address.blur();
     const next=shell.locator(legacy?'#plumbingNextStep':'#borDetailsNext');
     await next.waitFor();
     const preview=await page.evaluate(()=>{
      const els=['experienceModeBanner','customerSessionIndicator','returnToEngineBtn'].map(id=>document.getElementById(id));
      return {session:document.body.dataset.customerSession,positions:els.map(el=>getComputedStyle(el).position),
       visible:els.every(el=>el.getBoundingClientRect().height>0),singleLineHeight:Math.max(...els.map(el=>el.getBoundingClientRect().bottom))-Math.min(...els.map(el=>el.getBoundingClientRect().top))};
     });
     assert.equal(preview.session,'private_preview');assert.ok(preview.visible);
     assert.ok(!preview.positions.some(p=>p==='fixed'||p==='sticky'||p==='absolute'),id+' preview controls cover the viewport: '+preview.positions);
     assert.ok(preview.singleLineHeight<=76,id+' preview strip is too tall: '+preview.singleLineHeight);
     assert.ok(await page.locator('#returnExperienceTestDeck').evaluate(el=>el.getBoundingClientRect().height>=44));
     const clear=await next.evaluate(el=>{
      el.scrollIntoView({block:'end',behavior:'instant'});const r=el.getBoundingClientRect();
      const overlays=['experienceModeBanner','customerSessionIndicator','returnToEngineBtn'].map(id=>document.getElementById(id).getBoundingClientRect());
      return overlays.every(o=>o.right<=r.left||o.left>=r.right||o.bottom<=r.top||o.top>=r.bottom) &&
       [.08,.5,.92].every(x=>el.contains(document.elementFromPoint(r.x+x*r.width,r.y+r.height/2)));
     });
     assert.ok(clear,id+' Next/Continue must be clear across its tap area');
     await next.tap();await shell.locator(legacy?'#universalPreferredTiming':'#borName').waitFor({state:'visible'});
     const exit=width>height?'#returnExperienceTestDeck':'#returnToEngineBtn';
     await page.locator(exit).tap();await page.locator('#experienceTestDeck:not(.hidden)').waitFor();
     assert.equal(await page.locator('#customerSessionIndicator').count(),0);
     assert.equal(await page.locator('#experienceModeBanner').isVisible(),false);
     assert.equal(await page.locator('#returnToEngineBtn').evaluate(el=>el.parentNode===document.body),true);
     console.log('PASS',engine,width+'x'+height,id,'Next/Continue and return to the Test Center');
     await page.locator('#closeExperienceTestDeck').tap();
    }
    await page.evaluate(()=>window.blackFlagOpenExperienceTestDeck('beccas-bloom-shop'));
    await page.locator('[data-experience-mode="preview"]').tap();await page.locator('body.flowers-project #flowersCustomerShell:visible').waitFor();
    assert.equal(await page.locator('#servicePreviewBar').count(),0);
    assert.equal(await page.locator('#returnToEngineBtn').evaluate(el=>getComputedStyle(el).position),'fixed');
    await page.locator('#returnExperienceTestDeck').tap();await page.locator('#experienceTestDeck:not(.hidden)').waitFor();
    console.log('PASS',engine,width+'x'+height,'unrelated flower preview retains its own layout');
   } finally {await ctx.close();}
  }
 } finally {await browser.close();}
}
run().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(()=>server.close());
