#!/usr/bin/env node
'use strict';
// Execute the shipped verifySnapshot function with file-backed transport.
// This is real body/hash validation, not a hosted browser/SW/authentication test.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=path.resolve(process.argv[2]||__dirname),s=fs.readFileSync(path.join(root,'index.html'),'utf8'),m=JSON.parse(fs.readFileSync(path.join(root,'DEPLOYMENT_MANIFEST.json')));
const a=s.indexOf('    async function verifySnapshot('),b=s.indexOf('    async function executeVerifiedSnapshot(',a);assert(a>=0&&b>a);
function paths(name){return JSON.parse(s.match(new RegExp('const '+name+'=([^;]+)'))[1].replaceAll("'",'"'));}
function harness(options={}){
 const context={Promise,JSON,Array,TextEncoder,crypto:webcrypto,window:{},console,EXPECTED:m.build,SEAL:m.release_seal,snapshotPaths:paths('snapshotPaths'),presencePaths:paths('presencePaths'),assetPaths:[],promoteStaleDocumentOnce:()=>false,
 fetchJson:async name=>{const d=JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));if(options.stale&&name==='DEPLOYMENT_MANIFEST.json')d.build='0.0.0';if(options.seal&&name==='RELEASE_SEAL.json')d.seal='wrong';return d;},
 fetchText:async name=>{if(options.missing===name)throw new Error('Missing file '+name);let body=fs.readFileSync(path.join(root,name),'utf8');if(options.tamper===name)body+='\n/* tampered test */';return body;},fetchResponse:async()=>({ok:true})};
 vm.createContext(context);vm.runInContext(s.slice(a,b),context);return context;
}
let passed=0,failed=0;async function test(n,f){try{await f();passed++;console.log('PASS',n);}catch(e){failed++;console.error('FAIL',n,e.message);}}
(async()=>{
 await test('shipped snapshot verifies full actual release',async()=>{const c=harness();const r=await c.verifySnapshot();assert.equal(r.runtimeBuild,m.build);assert(c.window.__darkSkyKeelGuardRuntimeIntegrity.files>50);});
 for(const file of ['app.js','owner.html','input_hygiene.js','manifest.webmanifest'])await test('tampered '+file+' refused',async()=>assert.rejects(harness({tamper:file}).verifySnapshot(),/checksum mismatch/));
 await test('missing dependency refused',async()=>assert.rejects(harness({missing:'fleet_supabase.js'}).verifySnapshot(),/Missing file/));
 await test('mixed manifest refused',async()=>assert.rejects(harness({stale:true}).verifySnapshot(),/does not match/));
 await test('wrong seal refused',async()=>assert.rejects(harness({seal:true}).verifySnapshot(),/does not match/));
 console.log(`CLEARDECK PREFLIGHT: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
})();
