#!/usr/bin/env node
'use strict';
// Exact release/component binding tests. No network or business state.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=path.resolve(process.argv[2]||__dirname),read=n=>fs.readFileSync(path.join(root,n),'utf8'),m=JSON.parse(read('DEPLOYMENT_MANIFEST.json')),html=read('index.html');
let passed=0,failed=0;async function test(name,f){try{await f();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
function paths(name){return JSON.parse(html.match(new RegExp('const '+name+'=([^;]+)'))[1].replaceAll("'",'"'));}
function loader(options={}){
 const a=html.indexOf('    async function verifySnapshot('),b=html.indexOf('    async function executeVerifiedSnapshot(',a);assert(a>=0&&b>a);
 const ctx={Promise,JSON,Array,TextEncoder,crypto:webcrypto,window:{},console,EXPECTED:m.build,SEAL:m.release_seal,snapshotPaths:paths('snapshotPaths'),presencePaths:paths('presencePaths'),assetPaths:[],promoteStaleDocumentOnce:()=>false,
 fetchJson:async name=>{const d=JSON.parse(read(name));if(name==='DEPLOYMENT_MANIFEST.json'){
  if(options.noContract)delete d.component_contract;
  if(options.wrongRevision&&d.component_contract)d.component_contract.app_revision='0.0.0';
  if(options.wrongHelper&&d.component_contract)d.component_contract.owner_helper_revision='0.0.0';
  if(options.stale)d.build='0.0.0';
 }return d;},fetchText:async n=>{if(options.missing===n)throw Error('Missing file');return read(n)+(options.tamper===n?'tamper':'');},fetchResponse:async()=>({ok:true})};
 vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);return ctx;
}
(async()=>{
 await test('release config exists and matches manifest',()=>{assert(fs.existsSync(path.join(root,'RELEASE_CONFIG.json')),'single release config is missing');const c=JSON.parse(read('RELEASE_CONFIG.json'));assert.equal(c.build,m.build);assert.equal(c.seal,m.release_seal);});
 await test('app uses verified release, separate component revision',()=>{const s=read('app.js');assert(s.includes('const APP_COMPONENT_REVISION='),'app component revision is missing');assert(s.includes('window.__darkSkyVerifiedRelease'),'app still embeds installed build');assert(!/const\s+BUILD_VERSION\s*=\s*['"]/.test(s));});
 await test('captain installed release is not independently stamped',()=>{assert(read('captain.js').includes('window.__darkSkyVerifiedRelease.build'));assert(!read('captain.js').includes(m.build));});
 await test('maintenance does not impersonate historical application release',()=>{assert(!html.includes('8.8.17 • FLEET STEWARD'));assert(html.includes('FLEET STEWARD · STORAGE & RECOVERY'));});
 await test('exact snapshot with retained helpers is accepted',async()=>{assert(m.component_contract,'component compatibility declaration missing');const c=loader();const v=await c.verifySnapshot();assert.equal(v.runtimeBuild,m.build);assert.equal(v.appComponentRevision,m.component_contract.app_revision);assert.equal(c.window.__darkSkyVerifiedRelease.build,m.build);assert(Object.isFrozen(c.window.__darkSkyVerifiedRelease));});
 await test('missing component contract is rejected',async()=>assert.rejects(loader({noContract:true}).verifySnapshot(),/component/i));
 await test('wrong helper compatibility declaration is rejected',async()=>assert.rejects(loader({wrongHelper:true}).verifySnapshot(),/helper component/i));
 await test('wrong app revision is rejected',async()=>assert.rejects(loader({wrongRevision:true}).verifySnapshot(),/component/i));
 for(const name of ['app.js','captain.js','input_hygiene.js','carve_fonts.js','owner.html'])await test('tampered '+name+' is rejected',async()=>assert.rejects(loader({tamper:name}).verifySnapshot(),/checksum mismatch/i));
 await test('mixed release is rejected',async()=>assert.rejects(loader({stale:true}).verifySnapshot(),/does not match/));
 await test('missing helper rejected',async()=>assert.rejects(loader({missing:'input_hygiene.js'}).verifySnapshot(),/Missing/));
 await test('owner helper revision separated from installed build',()=>{const s=read('owner.html');assert(s.includes("HELPER_COMPONENT_BUILD='8.8.20.68'"));assert(s.includes('input.build!==HELPER_COMPONENT_BUILD'));assert(s.includes('id="blackFlagPageRelease"'));});
 function appHeader(release,expected){
  const s=read('app.js'),end=s.indexOf('  // 8.6.23 Generation Relay');assert(end>0);
  const ctx={window:{__darkSkyVerifiedRelease:release,__darkSkyExpectedRelease:expected},document:{},console};ctx.globalThis=ctx;
  vm.runInNewContext(s.slice(0,end)+'globalThis.result={build:BUILD_VERSION,revision:APP_COMPONENT_REVISION};})();',ctx);return ctx.result;
 }
 await test('actual app header binds installed release not component revision',()=>{const r=appHeader({build:m.build,seal:m.release_seal},{build:m.build,seal:m.release_seal});assert.equal(r.build,m.build);assert.equal(r.revision,m.component_contract.app_revision);});
 await test('same app body works under another verified release identity',()=>{const r=appHeader({build:'8.8.20.70',seal:'fixtureonly-882070'},{build:'8.8.20.70',seal:'fixtureonly-882070'});assert.equal(r.build,'8.8.20.70');assert.equal(r.revision,m.component_contract.app_revision);});
 await test('app refuses absent verified release context',()=>assert.throws(()=>appHeader(null,{build:m.build,seal:m.release_seal}),/Verified release context/));
 await test('app refuses wrong verified release build',()=>assert.throws(()=>appHeader({build:'0.0.0',seal:m.release_seal},{build:m.build,seal:m.release_seal}),/Verified release context/));
 await test('app refuses wrong verified release seal',()=>assert.throws(()=>appHeader({build:m.build,seal:'wrong'},{build:m.build,seal:m.release_seal}),/Verified release context/));
 console.log(`RELEASE IDENTITY: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
})();
