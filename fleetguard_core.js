/* Black Flag Fleetguard - fail-closed, local audit helpers. No authentication or database writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BlackFlagFleetguard=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const VERSION='1.0.0';
 const RECORD_KEYS=['vessel_id','vesselId','project_id','projectId'];
 function token(v){return typeof v==='string'?v.trim():'';}
 function evidence(v){return v===true || (v&&typeof v==='object'&&v.verified===true&&!!token(v.receipt_id)&&!!token(v.verified_at));}
 function scope(e,ship){if(!e||typeof e!=='object'||!ship)return false;const ids=RECORD_KEYS.filter(k=>Object.prototype.hasOwnProperty.call(e,k)).map(k=>token(e[k]));return ids.length>0&&ids.every(v=>v===ship);}
 function proof(e,ship){return scope(e,ship)&&e.verified===true&&!!token(e.receipt_id)&&!!token(e.verified_at);}
 function assess(input){
  if(!input||typeof input!=='object')throw new Error('A vessel evidence object is required');
  const vessel=token(input.vessel_id);if(!vessel)throw new Error('A specific vessel_id is required');
  const state=token(input.publication_status)||'unknown';
  const items=[
   ['identity','Identity verified',proof(input.identity,vessel)],
   ['boundary','Isolation negative tests',proof(input.isolation,vessel)&&input.isolation.cross_vessel_denied===true],
   ['captain_appointment','Captain appointment accepted by intended user',proof(input.captain_appointment,vessel)&&token(input.captain_appointment.role)==='project_owner'&&!!token(input.captain_appointment.subject_id)&&input.captain_appointment.accepted===true],
   ['captain_revocation','Captain revocation path tested',proof(input.captain_revocation,vessel)],
   ['backup','Durable backup independently verified',proof(input.backup,vessel)&&input.backup.retrievable===true],
   ['restore','Restore into same vessel tested',proof(input.restore,vessel)&&input.restore.restored===true&&input.restore.cross_vessel_access===false],
   ['customer_preview','Customer experience approved',proof(input.customer_preview,vessel)],
   ['sea_trial','Production-like Sea Trial accepted',proof(input.sea_trial,vessel)],
   ['deployment','Actual deployment proven',proof(input.deployment,vessel)&&input.deployment.active===true],
  ];
  const gates=items.map(([id,label,pass])=>({id,label,status:pass?'PASS':'NOT VERIFIED'}));
  return {schema:'blackflag-fleetguard-read-only-v1',tool_version:VERSION,vessel_id:vessel,publication_setting:state,verified:gates.filter(x=>x.status==='PASS').length,total:gates.length,ready:gates.every(x=>x.status==='PASS'),gates,limitations:['This report does not grant authority or commission a vessel.','Client-provided evidence must be checked against the authoritative server.','A published flag alone is not proof of a live deployment.','Local browser backups are not proof of durable remote restore.']};
 }
 function verifyIsolation(sample,ship){
  if(!Array.isArray(sample)||!token(ship))return {pass:false,reason:'Array and vessel ID required'};
  const foreign=sample.some(x=>x&&Object.keys(x).some(k=>RECORD_KEYS.includes(k)&&token(x[k])!==ship));
  const unscoped=sample.some(x=>!scope(x,ship));
  return {pass:!foreign&&!unscoped,record_count:sample.length,reason:foreign?'Foreign-vessel record present':unscoped?'Missing or inconsistent vessel scope':'No foreign records in sample; server RLS not proven'};
 }
 return Object.freeze({VERSION,assess,verifyIsolation,scope});
});
