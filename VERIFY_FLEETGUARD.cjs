const assert=require('node:assert/strict'),{assess,verifyIsolation}=require('./fleetguard_core.js');
const vessel='ikes-wood-signs';
const ok=(extras={})=>({vessel_id:vessel,verified:true,receipt_id:'server-record-1',verified_at:'2026-10-25T23:00:00Z',...extras});
const complete={vessel_id:vessel,publication_status:'live',identity:ok(),isolation:ok({cross_vessel_denied:true}),captain_appointment:ok({role:'project_owner',subject_id:'owner-1',accepted:true}),captain_revocation:ok(),backup:ok({retrievable:true}),restore:ok({restored:true,cross_vessel_access:false}),customer_preview:ok(),sea_trial:ok(),deployment:ok({active:true})};
let count=0;function test(fn){fn();count++}
test(()=>assert.equal(assess(complete).ready,true));
test(()=>assert.equal(assess({...complete,publication_status:'live',deployment:null}).ready,false));
for(const key of ['identity','isolation','captain_appointment','captain_revocation','backup','restore','customer_preview','sea_trial','deployment'])test(()=>assert.equal(assess({...complete,[key]:null}).ready,false));
test(()=>assert.equal(assess({...complete,identity:{...ok(),vessel_id:'legacy-plumbing'}}).ready,false));
test(()=>assert.equal(assess({...complete,backup:ok({retrievable:false})}).ready,false));
test(()=>assert.equal(assess({...complete,restore:ok({restored:true,cross_vessel_access:true})}).ready,false));
test(()=>assert.equal(assess({...complete,captain_appointment:ok({role:'captain',accepted:true,subject_id:'owner-1'})}).ready,false));
test(()=>assert.equal(assess({...complete,captain_appointment:ok({role:'project_owner',accepted:false,subject_id:'owner-1'})}).ready,false));
test(()=>assert.equal(verifyIsolation([{vessel_id:vessel}],vessel).pass,true));
test(()=>assert.equal(verifyIsolation([{vessel_id:vessel},{vessel_id:'legacy-plumbing'}],vessel).pass,false));
test(()=>assert.equal(verifyIsolation([{person:'a'}],vessel).pass,false));
test(()=>assert.throws(()=>assess({}),/vessel_id/));
console.log(`PASS ${count} fail-closed Fleetguard checks`);
