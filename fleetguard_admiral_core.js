/* Keelwatch 8.8.20.68 — bounded, read-only Admiral evidence presentation.
 * Consumes already-authorized vessel and appointment LIST readbacks.
 * No client-side evidence grants authority; a missing test is never a pass.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BlackFlagFleetguardAdmiralCore=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null,function(){
  'use strict';
  const token=x=>typeof x==='string'?x.trim():'';
  const gate=(key,label,status,detail)=>Object.freeze({key,label,status,detail,verified:false});
  function assess(input){
    if(!input||!Array.isArray(input.vessels)||!Array.isArray(input.appointments))throw Error('Verified Fleet Core lists are required.');
    const project=token(input.project_id),at=token(input.read_at);
    if(!project||!at||!Number.isFinite(Date.parse(at)))throw Error('Exact vessel and server-read timestamp are required.');
    const vessels=input.vessels.filter(x=>x&&x.project_id===project);
    if(vessels.length!==1)throw Error('Exact vessel must occur once in the authenticated directory.');
    const vessel=vessels[0];
    if(!token(vessel.display_name)||!token(vessel.lifecycle_state)||!token(vessel.operating_model))throw Error('Incomplete vessel identity.');
    // An appointment's own project_id must match the selected exact vessel.
    const related=input.appointments.filter(x=>x&&x.project_id===project);
    if(related.some(x=>!token(x.appointment_id)||!token(x.status)))throw Error('Incomplete appointment readback.');
    const accepted=related.filter(x=>x.status==='accepted'&&token(x.candidate_user_id)&&x.accepted_at&&!x.revoked_at);
    const pending=related.filter(x=>x.status==='pending');
    const revoked=related.filter(x=>x.status==='revoked');
    const appointmentObserved=accepted.length>0 && vessel.operating_model==='captain_operated';
    const gates=[
      gate('identity','Vessel identity','SERVER RECORD PRESENT','The authenticated Admiral directory returned this vessel. Not a commissioning receipt.'),
      gate('isolation','Cross-vessel denial','NOT VERIFIED','No other-vessel negative access test has been run by this readback.'),
      gate('captain_appointment','Captain handoff',appointmentObserved?'ACCEPTED RECORD OBSERVED':'NOT VERIFIED',appointmentObserved?'Acceptance appears in the server history. Exact-vessel operator permission must still be tested.':'No accepted Captain record and matching operating model were confirmed.'),
      gate('captain_revocation','Revocation denial','NOT VERIFIED',revoked.length?'A revocation record exists. A fresh access-denial test is still required.':'No accepted revocation-denial test was supplied.'),
      gate('backup','Independent backup','NOT VERIFIED','No off-device durable backup receipt was checked.'),
      gate('restore','Same-vessel recovery','NOT VERIFIED','No restored record or cross-vessel denial was checked.'),
      gate('customer_preview','Customer experience approval','NOT VERIFIED','The Admiral readback does not attest customer preview approval.'),
      gate('sea_trial','Production-like Sea Trial','NOT VERIFIED','The Admiral readback does not attest a passing Sea Trial.'),
      gate('deployment','Verified live deployment','NOT VERIFIED','A published setting or vessel lifecycle is not a live deployment receipt.')
    ];
    return Object.freeze({
      schema:'blackflag-keelwatch-server-snapshot-v1',build:'8.8.20.68',scope:'one-vessel',
      source:'Authenticated Admiral RPC lists: admiral_list_vessels_for_branding and admiral_list_captain_appointments',
      project_id:project,vessel_name:token(vessel.display_name),lifecycle_state:vessel.lifecycle_state,
      operating_model:vessel.operating_model,read_at:at,
      observed:{accepted_appointment_records:accepted.length,pending_appointment_records:pending.length,revoked_appointment_records:revoked.length},
      independently_verified:0,total_gates:gates.length,ready:false,
      gates:Object.freeze(gates),
      limitations:Object.freeze(['This is a read-only Admiral server-list snapshot, not signed end-to-end commissioning evidence.',
        'Appointment records do not establish live operator access, revocation denial or production readiness.',
        'No customer information, passwords, backend tokens, backup files or private photos are included.'])
    });
  }
  return Object.freeze({assess});
});
