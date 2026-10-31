'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||path.join(root,'../fleetbound-browser-evidence'));
if(out===root||out.startsWith(root+path.sep))throw Error('Evidence belongs outside source');fs.mkdirSync(out,{recursive:true});
const s=fs.readFileSync(path.join(root,'index.html'),'utf8'),style=s.match(/<style id="homeportShipStyle">([\s\S]*?)<\/style>/)[1],extract=tag=>s.match(new RegExp('<!-- '+tag+'_START -->([\\s\\S]*?)<!-- '+tag+'_END -->'))[1];
const launch=extract('FLEETBOUND_LAUNCH'),card=extract('HOMEPORT_VESSEL'),lessons=extract('FLEETBOUND_LESSONS');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.FLEETBOUND_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox']}),page=await browser.newPage(),checks=[],requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 const check=(name,v)=>{checks.push({name,pass:!!v});assert.ok(v,name);console.log('PASS',name);};
 await page.setContent(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'').replace(/<img\b[^>]*>/gi,''));
 check('both entries remain within the gated Engine',await page.locator('#wonderwakeFleetLaunch,#wonderwakePreviewVessel').evaluateAll(es=>es.every(e=>e.closest('#enginePanel')?.classList.contains('hidden'))));
 check('learning candidates stay outside the dynamic lesson body',await page.locator('#wonderwakeFleetLessons').evaluate(e=>!!e.closest('#fleetLearningRegistry')&&!e.closest('#fleetLearningBody')));
 requests.length=0;errors.length=0;
 for(const [width,height] of [[1366,900],[1024,650],[390,844]]){
  await page.setViewportSize({width,height});
  await page.setContent('<style>body{margin:0;background:#061a22;color:#e4eeee;font:16px system-ui}*{box-sizing:border-box}main{max-width:1240px;margin:20px auto;padding:16px}h1{font-size:28px}</style><style>'+style+'</style><main><h1>Black Flag · Fleetbound</h1>'+launch+lessons+'</main>');
  check(width+'px: no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const link=page.locator('#launchWonderwakeFromEngine'),box=await link.boundingBox();
  check(width+'px: visible launch target >=44px',box.height>=44&&box.width>=44);
  check(width+'px: fixed destination and no authority payload',await link.getAttribute('href')==='https://jdaniel318-ctrl.github.io/wonderwake/'&&await link.getAttribute('target')==='_blank'&&await link.getAttribute('rel')==='noopener noreferrer'&&await link.getAttribute('referrerpolicy')==='no-referrer');
  await page.screenshot({path:path.join(out,'fleetbound-launch-'+width+'.png'),fullPage:true});
  await page.locator('#wonderwakeFleetLessons summary').click();
  check(width+'px: six readable mission candidates',await page.locator('#wonderwakeFleetLessons li').count()===6);
  check(width+'px: expanded lessons do not overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.setViewportSize({width:1366,height:900});
 await page.setContent('<style>body{background:#061a22;color:#e4eeee;font:16px system-ui}*{box-sizing:border-box}main{max-width:1240px;margin:auto;padding:16px}</style><style>'+style+'</style><main>'+card+'</main>');
 await page.locator('summary').click();
 check('commissioning date, route and limits remain explicit',await page.locator('.homeport-boundary').evaluate(e=>e.textContent.includes('not a live health check')&&e.textContent.includes('Browser Admiral sign-in was not used')&&e.textContent.includes('authority audit 33')));
 check('receipt is present and parseable',JSON.parse(fs.readFileSync(path.join(root,'WONDERWAKE_COMMISSION_RECEIPT.json'),'utf8')).status==='commissioned');
 await page.screenshot({path:path.join(out,'fleetbound-receipt.png'),fullPage:true});
 check('no component scripts, remote requests or errors',requests.length===0&&errors.length===0);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'Offline shipped HTML/CSS only, not production authentication or physical Safari acceptance',checks,requests,errors},null,2)+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
