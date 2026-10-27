#!/usr/bin/env node
'use strict';
// Full shipped loader control flow + real hashes; transport/DOM/script onload are fixtures.
// Runtime business scripts are NOT executed. No hosted/Auth/Safari certification.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=path.resolve(process.argv[2]||__dirname),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'DEPLOYMENT_MANIFEST.json')));
const source=id=>html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'))[1];
async function run(options={}){
 let scripts=0,requests=0,clock=0;
 const core={};vm.createContext(core);vm.runInContext(source('blackFlagStartupMetrics'),core);
 const collector=core.createBlackFlagStartupMetrics(manifest.build,()=>++clock);
 const cls={add(){},remove(){},contains(){return false;}};
 const el=()=>({style:{},dataset:{},classList:cls,innerHTML:'',textContent:'',setAttribute(){},removeAttribute(){},querySelector(){return null;},appendChild(){}});
 const shield=el(),body=el();
 body.classList={...cls,contains:()=>false};body.className='';
 body.appendChild=e=>{if(e.tagName==='SCRIPT'){scripts++;queueMicrotask(()=>e.onload?.());}return e;};
 const document={readyState:'interactive',getElementById:id=>id==='darkSkyFirstPaintShield'?shield:null,
   head:{appendChild(){}},body,documentElement:el(),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},
   createElement:tag=>({...el(),tagName:tag.toUpperCase()})};
 const win={__darkSkyExpectedRelease:{build:manifest.build,seal:manifest.release_seal},
   __darkSkyRouteIntent:options.recovery?'admiral-recovery':'engine',__blackFlagStartupMetrics:options.broken?{begin(){throw Error('collector broken')}}:collector,
   __blackFlagStartupPaint:()=>{if(options.broken)throw Error('paint broken')},dispatchEvent(){}};
 const memory={getItem:()=>null,setItem(){},removeItem(){}};
 const context={window:win,document,navigator:{},location:{href:'https://fixture.invalid/index.html',replace(){},reload(){}},
   fetch:async url=>{requests++;const name=new URL(url).pathname.slice(1);if(options.missing===name)return{ok:false,status:404};
     const body=fs.readFileSync(path.join(root,name),'utf8')+(options.tamper===name?'tamper':'');return{ok:true,status:200,text:async()=>body};},
   crypto:webcrypto,TextEncoder,TextDecoder,URL,Blob,Uint8Array,Array,JSON,Date,Promise,console,
   sessionStorage:memory,localStorage:memory,setTimeout:()=>1,clearTimeout(){},getComputedStyle:()=>({display:'none',visibility:'hidden'}),
   MutationObserver:class{observe(){}},CustomEvent:class{constructor(type){this.type=type;}}};
 vm.createContext(context);
 await vm.runInContext(source('darkSkyAtomicReleaseLoader'),context,{timeout:10000});
 return {gate:win.__darkSkyReleaseGateState,report:collector.report(),scripts,requests,shield};
}
let passed=0,failed=0;
async function test(name,f){try{await f();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.stack);}}
(async()=>{
 await test('actual loader success records measurement',async()=>{const r=await run();assert.equal(r.gate,'clear');assert.equal(r.report.status,'complete');assert(r.scripts>35);assert(r.report.phases.some(x=>x.name==='verification'));assert(r.report.phases.some(x=>x.name==='execution'));});
 await test('tampered required body holds before script execution',async()=>{const r=await run({tamper:'app.js'});assert.equal(r.gate,'hold');assert.equal(r.report.status,'hold');assert.equal(r.scripts,0);});
 await test('missing dependency holds and cannot claim success',async()=>{const r=await run({missing:'fleet_supabase.js'});assert.equal(r.gate,'hold');assert.equal(r.report.status,'hold');assert.equal(r.scripts,0);});
 await test('broken optional measurement cannot prevent verified boot',async()=>{const r=await run({broken:true});assert.equal(r.gate,'clear');assert(r.scripts>35);});
 await test('recovery route remains isolated',async()=>{const r=await run({recovery:true});assert.equal(r.gate,'recovery-route-isolated');assert.equal(r.report.status,'recovery_route');assert.equal(r.requests,0);assert.equal(r.scripts,0);});
 console.log(`FAIRLEAD LOADER: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
})();
