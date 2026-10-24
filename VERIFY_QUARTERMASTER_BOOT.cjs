// Actual index atomic loader: isolated offline Chromium, local response bytes, no user profile.
// Usage: node VERIFY_QUARTERMASTER_BOOT.cjs [RELEASE_DIR] [OUTPUT_DIR]
'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const crypto=require('node:crypto');
const {createRequire}=require('node:module');
const runtimeRequire=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright','package.json'));
const {chromium}=runtimeRequire('playwright');
async function launch(){return chromium.launch({executablePath:process.env.QUARTERMASTER_CHROMIUM||'/tmp/quartermaster-chromium/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});}
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||path.join(__dirname,'../qa/browser-boot'));
fs.mkdirSync(out,{recursive:true});
const files=Object.fromEntries(fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>[n,fs.readFileSync(path.join(root,n))]));
const manifest=JSON.parse(files['DEPLOYMENT_MANIFEST.json']);const build=manifest.build,seal=manifest.release_seal;const results=[];
let browser;
(async()=>{browser=await launch();
const scripts=[...files['index.html'].toString().match(/for\(const path of (\[[^\n]+\])\)\{\s*await new Promise/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
async function run(name,overrides={},hold=''){
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),page=await context.newPage(),served=new Set(),blocked=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));page.setDefaultTimeout(20000);
 const bodies={...files,...overrides};await context.route('**/*',route=>{const u=new URL(route.request().url()),n=decodeURIComponent(u.pathname).replace(/^\//,'')||'index.html';if(u.origin==='https://quartermaster-boot.invalid'&&route.request().method()==='GET'&&!n.includes('/')&&bodies[n]){served.add(n);return route.fulfill({status:200,body:bodies[n],contentType:n.endsWith('.js')?'text/javascript':n.endsWith('.html')?'text/html':n.endsWith('.css')?'text/css':n.endsWith('.json')?'application/json':'application/octet-stream'});}blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();});
 await context.addInitScript(()=>{delete Navigator.prototype.serviceWorker;window.__qaSeal=[];addEventListener('darksky:release-seal-clear',e=>__qaSeal.push({build:e.detail.build,seal:e.detail.seal}));});
 const row={name,pass:false};try{
 await page.goto('https://quartermaster-boot.invalid/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>['clear','hold'].includes(window.__darkSkyReleaseGateState));
 const state=await page.evaluate(()=>__darkSkyReleaseGateState),executed=await page.evaluate(()=>[...document.querySelectorAll('script[data-release-seal]')].map(x=>x.dataset.releaseSeal));
 if(hold){assert.equal(state,'hold');assert((await page.locator('.ds-release-hold').innerText()).includes(hold));assert.deepEqual(executed,[]);assert.deepEqual(await page.evaluate(()=>__qaSeal),[]);}else{assert.equal(state,'clear',await page.locator('body').innerText());assert.deepEqual(executed,Array(scripts.length).fill(seal));assert.deepEqual(await page.evaluate(()=>__qaSeal),[{build,seal}]);for(const n of scripts)assert(served.has(n),'runtime not served '+n);const integrity=await page.evaluate(()=>__darkSkyKeelGuardRuntimeIntegrity);assert.equal(integrity.build,build);assert.equal(integrity.seal,seal);assert.equal(await page.evaluate(()=>window.BlackFlagQuartermasterUI?.build),build,'Quartermaster UI build exported by actual loader');assert.equal(await page.evaluate(()=>window.BlackFlagQuartermasterUI?.isWorkspaceOpen()),false,'Unauthenticated actual boot must keep private workspace closed');row.runtimeScripts=executed.length;row.runtimeIntegrityFiles=integrity.files;row.quartermasterInitialState='available and closed';}
 assert.deepEqual(errors,[]);row.pass=true;
 }catch(e){row.error=e.stack;row.pageErrors=errors;await page.screenshot({path:path.join(out,name.replace(/[^a-z0-9]+/gi,'-')+'.png'),fullPage:true}).catch(()=>{});}finally{row.served=[...served].sort();row.blockedRequests=blocked;results.push(row);await context.close();console.log(JSON.stringify({name,pass:row.pass,...(row.error?{error:row.error.split('\n')[0]}:{})}));}
}
await run('actual index coherent release boots');
await run('actual index rejects changed required runtime bytes',{'input_hygiene.js':Buffer.concat([files['input_hygiene.js'],Buffer.from('\n/* isolated QA integrity mutation */\n')])},'Runtime checksum mismatch: input_hygiene.js');
const altered=JSON.parse(files['DEPLOYMENT_MANIFEST.json']);altered.runtime_integrity.files['input_hygiene.js']='0'.repeat(64);await run('actual index rejects changed runtime checksum declaration',{'DEPLOYMENT_MANIFEST.json':Buffer.from(JSON.stringify(altered))},'Runtime checksum mismatch: input_hygiene.js');
const report={scope:'Actual release index loader with all response bytes routed locally; fresh Chromium contexts; no service worker capability, live network, user identity, hosted authentication or Safari proof',browser:browser.version(),build,seal,sources:Object.fromEntries(Object.entries(files).map(([n,b])=>[n,crypto.createHash('sha256').update(b).digest('hex')])),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
