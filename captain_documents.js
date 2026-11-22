// Loaded by the accepted-appointment station only. All saved access decisions are server-side.
let modules;
function loadEditor(build){
 if(!modules){
  const version='?v='+encodeURIComponent(build);
  modules=(async()=>{
   if(!document.getElementById('captainDocumentStyles')){
    const css=document.createElement('link');css.id='captainDocumentStyles';css.rel='stylesheet';css.href='quartermaster.css'+version;document.head.append(css);
   }
   for(const name of ['quartermaster_core','quartermaster_sync','quartermaster_fonts','quartermaster_pdf','quartermaster']){
    await import('./'+name+'.js'+version);
   }
  })().catch(error=>{modules=null;throw error;});
 }
 return modules;
}
export function mountCaptainDocuments(box,station){
 let receipt=null,working=false,closed=false,attempt=0;
 const active=()=>!closed&&box.isConnected&&station.active()&&station.client.readSession()?.user?.id===station.userId;
 const valid=r=>r?.projectId===station.projectId&&r.vesselId===station.vesselId&&typeof r.enabled==='boolean'&&typeof r.eligible==='boolean'&&Number.isSafeInteger(r.version)&&r.version>=0;
 async function request(choice){
  if(!active())throw Error('Reopen your Captain Station.');
  const body={p_project_id:station.projectId};
  if(choice!==undefined){body.p_enabled=choice;body.p_expected_version=receipt.version;}
  const r=await station.client.rpc('vessel_captain_document_tool',body,'Ship document settings are unavailable.');
  if(!active()||!valid(r))throw Error('The ship or appointment changed. Reopen the station.');
  return r;
 }
 async function verify(){
  try{
   const r=await request();
   receipt=r;paint();
   return r.enabled&&r.eligible;
  }catch(error){
   receipt=null;paint('Reopen the Captain Station to verify this ship’s access.');
   throw error;
  }
 }
 box.innerHTML='<h2>Ship tools</h2><details><summary>Quotes &amp; invoices</summary><p>Prepare quotes and invoices in this ship’s private workspace. Share a finished PDF when you choose.</p><div class="captain-handoff-actions"><button type="button" class="btn primary" data-open hidden>Open quotes &amp; invoices</button><button type="button" class="btn secondary" data-toggle hidden></button><button type="button" class="btn ghost" data-check hidden>Check availability</button></div><p role="status"></p></details>';
 const details=box.querySelector('details'),open=box.querySelector('[data-open]'),toggle=box.querySelector('[data-toggle]'),check=box.querySelector('[data-check]'),status=box.querySelector('[role=status]');
 function paint(message){
  open.hidden=!receipt?.enabled||!receipt?.eligible;toggle.hidden=!receipt||(!receipt.eligible&&!receipt.enabled);
  toggle.textContent=receipt?.enabled?'Turn off for this ship':'Turn on for this ship';
  check.hidden=!!receipt;open.disabled=toggle.disabled=check.disabled=working;
  status.textContent=message||(receipt?.eligible?(receipt.enabled?'Enabled for this ship.':'Off for this ship.'):'Fleet Services access is required for this ship.');
 }
 async function settings(choice){
  if(working||!active())return;
  working=true;const current=++attempt;paint('Checking this ship’s saved setting…');
  try{const next=await request(choice);if(current===attempt&&active())receipt=next;}
  catch(_){if(current===attempt)receipt=null;}
  finally{if(current===attempt&&active()){working=false;paint(receipt?'':'Could not confirm the saved setting. Check availability to read it again.');}}
 }
 details.ontoggle=()=>{if(details.open&&!receipt)void settings();};
 check.onclick=()=>settings();
 toggle.onclick=()=>{if(!receipt||working)return;if(receipt.enabled&&!confirm('Turn off Quotes & invoices for this ship? Its saved documents will be available when you turn it on again.'))return;void settings(!receipt.enabled);};
 open.onclick=async()=>{
  if(working||!active())return;
  working=true;paint('Opening this ship’s documents…');
  try{
   if(!await verify())throw Error('The tool is unavailable. Check the saved setting.');
   await loadEditor(station.build);
   if(active())await window.BlackFlagQuartermasterUI.openForCaptain({...station,container:box,active,verify});
  }catch(_){receipt=null;}
  finally{if(active()){working=false;paint(receipt?'':'Could not open this workspace. Check availability to try again.');}}
 };
 return ()=>{closed=true;++attempt;window.BlackFlagQuartermasterUI?.closeCaptain?.(box);};
}
