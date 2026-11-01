#!/usr/bin/env node
'use strict';
// Exercise the real route owner with delayed adapters/Engine refreshes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(process.argv[2]||__dirname,'app.js'),'utf8');
const start=source.indexOf('  const commandRouteAdapters=new Map();');
const end=source.indexOf('\n  async function loadFeatureSettings()',start);
assert(start>0&&end>start,'Route owner source boundary');
function harness(){
 let finishRefresh;const events=[],nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){}},focus(){}});return nodes.get(id);};
 const c={BUILD_VERSION:'synthetic',console,URL,Promise,Map,Date,sessionStorage:{setItem(){}},history:{replaceState(){}},location:{href:'https://synthetic.invalid/index.html'},requestAnimationFrame(){},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},document:{body:{dataset:{},classList:{add(){},remove(){}}}},$:node,openEnginePanel:()=>new Promise(resolve=>{finishRefresh=resolve;})};
 c.window={dispatchEvent:e=>events.push(e),scrollTo(){}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 return {nav:c.window.DarkSkyFleetNavigator,body:c.document.body,events,finish:()=>finishRefresh()};
}
(async()=>{
 const h=harness();let entered;
 h.nav.register('admiral',details=>{entered=details;});
 const refresh=h.nav.navigate('engine',{source:'admiral'});
 await h.nav.navigate('admiral',{source:'engine',directTarget:'carvewright'});
 assert.equal(entered.directTarget,'carvewright');assert.equal(entered.source,'engine');
 assert.equal(h.body.dataset.commandSurface,'admiral');
 h.finish();await refresh;
 assert.equal(h.body.dataset.commandSurface,'admiral','A late Engine refresh must not hide a newer entrance');
 assert.equal(h.nav.state().target,'admiral');
 const r=harness();let finishCaptain;
 r.nav.register('captain',()=>new Promise(resolve=>{finishCaptain=resolve;}));
 const late=r.nav.navigate('captain',{source:'engine'});
 const back=r.nav.navigate('engine',{source:'captain'});r.finish();await back;
 finishCaptain();await late;
 assert.equal(r.body.dataset.commandSurface,'engine','A late adapter must not replace the current route');
 assert.equal(r.events.at(-1).detail.target,'engine');
 console.log('PASS: workspace target, repeated entrance and stale route completion ownership');
})().catch(e=>{console.error(e);process.exitCode=1;});
