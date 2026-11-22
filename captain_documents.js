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
 let receipt=null,working=false,closed=false,requestId=0;
 const active=()=>!closed&&box.isConnected&&station.active()&&station.client.readSession()?.user?.id===station.userId;
 const valid=r=>r?.projectId===station.projectId&&r.vesselId===station.vesselId&&typeof r.enabled==='boolean'&&typeof r.eligible==='boolean'&&Number.isSafeInteger(r.version)&&r.version>=0;
 box.innerHTML=`<h2>Quotes &amp; invoices</h2>
   <div class="captain-handoff-actions" data-actions hidden>
     <button type="button" class="btn primary" data-intent="quote">New quote</button>
     <button type="button" class="btn secondary" data-intent="invoice">New invoice</button>
     <button type="button" class="btn ghost" data-intent="documents">Recent documents</button>
   </div>
   <p class="captain-quiet" role="status"></p>
   <button type="button" class="btn ghost" data-check hidden>Retry availability check</button>`;
 const actions=box.querySelector('[data-actions]'),check=box.querySelector('[data-check]'),status=box.querySelector('[role=status]');
 const buttons=Array.from(actions.querySelectorAll('button'));
 function paint(message=''){
  if(!active())return;
  actions.hidden=!(receipt?.eligible&&receipt.enabled);
  check.hidden=!!receipt||working;
  check.disabled=working;
  buttons.forEach(button=>button.disabled=working);
  status.textContent=message||(receipt?(actions.hidden?'Quotes and invoices haven’t been assigned to this ship.':''):'Document availability could not be confirmed.');
  status.hidden=!status.textContent;
 }
 async function verify(){
  if(!active())throw Error('Reopen your Captain Station.');
  const id=++requestId;
  try{
   const next=await station.client.rpc('vessel_captain_document_tool',{p_project_id:station.projectId},'Ship document settings are unavailable.');
   if(id!==requestId||!active()||!valid(next))throw Error('The ship or appointment changed.');
   receipt=next;
   station.updateBrand?.(next);
   paint();
   return next.enabled&&next.eligible;
  }catch(error){
   if(id===requestId&&active()){receipt=null;paint();}
   throw error;
  }
 }
 async function refresh(){
  if(working||!active())return;
  working=true;paint('Checking document availability…');
  try{await verify();}catch{/* Offer a read-only retry. */}
  finally{working=false;paint();}
 }
 async function launch(intent){
  if(working||!active()||!receipt?.enabled||!receipt.eligible)return;
  let message='';
  working=true;paint('Opening documents…');
  try{
   if(!await verify())return;
   await loadEditor(station.build);
   if(active()&&!await window.BlackFlagQuartermasterUI.openForCaptain({...station,container:box,active,verify,intent})){
    message='Documents could not open. Try again.';
   }
  }catch{message=receipt?'Documents could not open. Try again.':'';}
  finally{working=false;paint(message);}
 }
 buttons.forEach(button=>button.onclick=()=>launch(button.dataset.intent));
 check.onclick=refresh;
 void refresh();
 return ()=>{closed=true;++requestId;window.BlackFlagQuartermasterUI?.closeCaptain?.(box);};
}
