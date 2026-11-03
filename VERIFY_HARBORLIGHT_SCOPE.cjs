'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/countercraft_config.js','utf8');
function fixture(){const local=new Map(),session=new Map(),storage=m=>({getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)});const g={URL,URLSearchParams,Date,JSON,crypto,localStorage:storage(local),sessionStorage:storage(session),location:{href:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/countercraft.html?preview=1',hash:''},history:{replaceState(){}}};g.globalThis=g;vm.runInNewContext(source,g);return {g,local,session,c:g.CountercraftConfig};}
const {c,session}=fixture();assert.equal(typeof c.consumePreview,'function','Public query flags must be checked against a single-use Engine launch');
assert.equal(c.consumePreview('forged'),null);
const nonce='a'.repeat(32),record={kind:'preview',scope:c.scope,expiresAt:Date.now()+60000,build:c.build};session.set('blackflag-engine-launch:'+nonce,JSON.stringify(record));assert.equal(c.consumePreview(nonce).kind,'preview');assert.equal(c.consumePreview(nonce),null,'A copied link cannot start a second preview');
session.set('blackflag-engine-launch:'+nonce,JSON.stringify({...record,build:'previous-release'}));assert.equal(c.consumePreview(nonce),null,'Previous releases cannot grant preview access');
session.set('blackflag-engine-launch:'+nonce,JSON.stringify({...record,expiresAt:Date.now()-1}));assert.equal(c.consumePreview(nonce),null);
assert.equal(c.activeLocation(),null,'Unconfigured browser must not fall back to a staged pilot');
const live={...c.scope,deploymentId:'mobile-site-two',mode:'live'};c.selectLocation(live);assert.equal(c.activeLocation().deploymentId,'mobile-site-two');assert.equal(c.activeLocation().mode,'live');
assert.throws(()=>c.selectLocation({...live,backend:'https://attacker.invalid'}));assert.equal(c.activeLocation().deploymentId,'mobile-site-two');
console.log('PASS Engine-only one-use previews, expiry, configured location scope and backend allowlist');
