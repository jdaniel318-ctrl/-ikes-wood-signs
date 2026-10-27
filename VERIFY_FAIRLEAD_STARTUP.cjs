#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(process.argv[2]||__dirname),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const found=html.match(/<script id="blackFlagStartupMetrics">([\s\S]*?)<\/script>/);
let passed=0,failed=0;
function test(n,f){try{f();passed++;console.log('PASS',n);}catch(e){failed++;console.error('FAIL',n,e.message);}}
test('startup collector exists',()=>assert(found,'read-only startup collector missing'));
if(found){
 const c={};vm.createContext(c);vm.runInContext(found[1],c);
 const factory=c.createBlackFlagStartupMetrics;
 const make=()=>{let t=0;return {collector:factory('8.8.20.68',()=>t),tick:n=>t=n};};
 test('factory available',()=>assert.equal(typeof factory,'function'));
 test('default status is not measured',()=>assert.equal(make().collector.report().status,'not_started'));
 test('only known phase names accepted',()=>{const {collector:c}=make();c.begin('TOKEN_SECRET');assert.equal(JSON.stringify(c.report()).includes('TOKEN_SECRET'),false);});
 test('real duration computed',()=>{const {collector:c,tick}=make();tick(10);c.begin('verification');tick(33.25);c.end('verification');assert.equal(c.report().phases[0].duration_ms,23.25);});
 test('does not assume load success',()=>{const {collector:c,tick}=make();c.begin('verification');tick(9);c.end('verification');assert.notEqual(c.report().status,'complete');});
 test('completion recorded explicitly',()=>{const {collector:c,tick}=make();tick(10);c.begin('loader');tick(50);c.end('loader');c.finish('complete');assert.equal(c.report().status,'complete');assert.equal(c.report().loader_elapsed_ms,40);});
 test('hold is not complete',()=>{const {collector:c}=make();c.begin('loader');c.finish('hold');assert.equal(c.report().status,'hold');});
 test('missing clock never invents zero',()=>{const c=factory('x',()=>{throw Error('private');});c.begin('loader');c.finish('complete');assert.equal(c.report().loader_elapsed_ms,null);assert(!JSON.stringify(c.report()).includes('private'));});
 test('nonmonotonic clock invalidates duration',()=>{const {collector:c,tick}=make();tick(30);c.begin('loader');tick(20);c.end('loader');c.finish('complete');assert.equal(c.report().loader_elapsed_ms,null);});
 test('bounded samples',()=>{const {collector:c,tick}=make();for(let i=0;i<100;i++){tick(i);c.begin('verification');c.end('verification');}assert(c.report().phases.length<=32);});
 test('external mutation cannot rewrite evidence',()=>{const {collector:c}=make();c.begin('verification');c.end('verification');const r=c.report();r.phases[0].duration_ms=999;assert.notEqual(c.report().phases[0].duration_ms,999);});
 test('no raw error or route export API',()=>{const {collector:c}=make();c.finish('https://secret/?token=PASSWORD');assert(!JSON.stringify(c.report()).includes('PASSWORD'));});
 test('explicit scope and no certification claim',()=>{const r=make().collector.report();assert.equal(r.production_readiness,false);assert.match(r.scope,/current page/i);});
 test('collector does not access persistent storage or network',()=>assert(!/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*[.(]/.test(found[1])));
 test('no phase without start',()=>{const {collector:c}=make();c.end('verification');assert.equal(c.report().phases.length,0);});
 test('source retains snapshot verification',()=>assert(html.includes('let verified=await verifySnapshot(false)')));
 test('collection stays inside existing performance section',()=>{const a=html.indexOf('<section id="enginePerformanceDeck"');const b=html.indexOf('</section>',a);assert(html.slice(a,b).includes('fairleadStartupEvidence'));});
}
console.log(`FAIRLEAD STARTUP: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
