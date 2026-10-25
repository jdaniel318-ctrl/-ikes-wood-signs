/* Carvewright 8.8.20.61 — independent, app-local Admiral service passage. */
(function(g){
 'use strict';
 if(!g.document||g.CarvewrightFleet)return;
 const BUILD='8.8.20.61',SESSION='darkSkySupabaseAdmiralSessionV1';
 const $=id=>document.getElementById(id);
 let deck=null,gate=null,deckObserver=null,gateObserver=null,generation=0,pending=null,active=null,requested=false,timer=null;
 function message(text){const n=$('carvewrightEntryStatus');if(n)n.textContent=text;}
 function config(){const c=g.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();if(!c?.url||!c?.publishableKey||!g.DarkSkySupabase?.create)throw Error('Fleet identity configuration is unavailable.');return c;}
 function client(){const c=config();return g.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION,build:BUILD});}
 function context(){try{const c=config(),s=g.DarkSkyAdmiralSession?.status?.(),u=client().readSession()?.user;if(!s?.reusable||!s.startedAt||!u?.id)return null;return {accountId:String(u.id),backend:new URL(c.url).href.replace(/\/$/,''),environment:String(c.environment||'staging'),site:new URL('./',location.href).href,startedAt:s.startedAt};}catch(_){return null;}}
 const mark=c=>c?JSON.stringify(c):'';
 const visible=n=>!!n?.isConnected&&!n.hidden&&!n.classList.contains('hidden')&&n.getAttribute('aria-hidden')!=='true';
 const deckVisible=()=>deck===$('admiralDeck')&&visible(deck);
 function matches(held){return held.generation===generation&&held.deck===deck&&deckVisible()&&held.mark===mark(context());}
 function stopTimer(){if(timer!==null)g.clearInterval(timer);timer=null;}
 function monitor(){if(timer===null)timer=g.setInterval(()=>{const held=active||pending;if(held&&!matches(held))close(true,'Your Admiral session or workspace changed. Reopen Carvewright after signing in.');},1000);}
 function invalidate(){generation++;active=null;pending=null;requested=false;stopTimer();}
 function close(force=false,text=''){
  if(!force&&active&&g.CarvewrightApp?.close?.(false)===false)return false;
  const shouldClose=!!active||!!pending;
  invalidate();
  if(force&&shouldClose)g.CarvewrightApp?.close?.(true);
  if(text)message(text);
  return true;
 }
 function guard(held){if(!matches(held)||active!==held){if(held.generation===generation)close(true,'The secure workspace changed. Reopen Carvewright.');throw Object.assign(Error('The Admiral session or Carvewright context changed.'),{code:'AUTH'});}return true;}
 async function open(){
  mount();
  if(pending)return false;
  if(active&&matches(active)&&g.CarvewrightApp?.isOpen?.())return true;
  if(active)close(true);
  const ctx=context();
  if(!ctx||!deckVisible()){message('Sign in through the Admiral gate to open Carvewright.');return false;}
  if(!g.CarvewrightApp?.open){message('Carvewright is still loading. Upload the complete release and try again.');return false;}
  requested=false;
  const held={generation:++generation,deck,mark:mark(ctx),activity:Object.freeze({userId:ctx.accountId,startedAt:ctx.startedAt})};pending=held;monitor();
  try{
   if(!matches(held))return false;
   const authorized=await client().verifyAdmiralAuthority();
   if(!authorized||!matches(held)){if(held.generation===generation)close(true,'Admiral authority could not be verified. Sign in again.');return false;}
   active=held;
   // businessId is an app-local namespace, never a server vessel or membership claim.
   const scope=Object.freeze({accountId:ctx.accountId,backend:ctx.backend,environment:ctx.environment,site:ctx.site,businessId:'carvewright'});
   const opened=await g.CarvewrightApp.open({scope,guard:()=>guard(held),parent:held.deck,referenceOnly:false,onClose:()=>{if(active===held)invalidate();}});
   if(opened===false||!matches(held)||active!==held){if(held.generation===generation)close(true,'The secure workspace changed before Carvewright opened.');return false;}
   message('Carvewright opened. Local design workspace · registration pending.');return true;
  }catch(error){if(held.generation===generation)close(true,'Carvewright could not open: '+(error?.message||'Access unavailable.'));return false;}
  finally{if(pending===held)pending=null;if(!active&&!pending)stopTimer();}
 }
 function requestedPassage(){
  if(!requested||visible(gate))return;
  requested=false;
  if(deckVisible())void open();
 }
 function requestOpen(){
  if(pending||requested)return false;
  if(active&&matches(active)&&g.CarvewrightApp?.isOpen?.())return true;
  if(typeof g.DarkSkyOpenAdmiralGate!=='function'){message('The Admiral gate is still loading. Try again shortly.');return false;}
  // Leave My Fleet through its existing UI route before its higher overlay can cover the gate.
  const fleet=$('bootstrapFleet');
  if(visible(fleet)){
   ($('watchClose')||$('bootstrapFleetClose'))?.click();
   if(visible(fleet)){message('Close My Fleet before opening Carvewright.');return false;}
  }
  // Only this in-memory user intent requests a passage. URL and event detail carry no scope.
  requested=true;
  try{g.DarkSkyOpenAdmiralGate('engine','carvewright');mount();requestedPassage();return true;}
  catch(_){requested=false;message('The Admiral gate could not open. Try again.');return false;}
 }
 function mount(){
  const next=$('admiralDeck');
  if(next!==deck){deckObserver?.disconnect();if(active||pending)close(true);deck=next;if(deck){deckObserver=new MutationObserver(()=>{if((active||pending)&&!deckVisible())close(true,'The Admiral workspace closed. Reopen Carvewright through Admiral.');requestedPassage();});deckObserver.observe(deck,{attributes:true,attributeFilter:['class','hidden','aria-hidden']});}}
  const nextGate=$('admiralGateOverlay');
  if(nextGate!==gate){if(gate&&requested)requested=false;gateObserver?.disconnect();gate=nextGate;if(gate){gateObserver=new MutationObserver(requestedPassage);gateObserver.observe(gate,{attributes:true,attributeFilter:['class','hidden','aria-hidden']});}}
  const actions=deck?.querySelector('.admiral-deck-head-actions');
  if(actions&&!$('carvewrightAdmiralOpen')){const b=document.createElement('button');b.id='carvewrightAdmiralOpen';b.type='button';b.textContent='CARVEWRIGHT';b.addEventListener('click',()=>void open());actions.prepend(b);}
  const fleet=$('watchWorkspace')||$('bootstrapFleet')?.querySelector('.bootstrap-fleet-shell');
  if(fleet&&!$('carvewrightFleetService')){const card=document.createElement('section');card.id='carvewrightFleetService';card.className='carvewright-fleet-service';card.setAttribute('aria-label','Carvewright local design service');const title=document.createElement('h3');title.textContent='Carvewright';const copy=document.createElement('p');copy.textContent='Local design service · Registration pending. Saved vector layouts, SVG artwork, lettering pockets and CNC files.';const b=document.createElement('button');b.id='carvewrightFleetOpen';b.type='button';b.textContent='OPEN CARVEWRIGHT';b.addEventListener('click',requestOpen);card.append(title,copy,b);fleet.appendChild(card);}
  const engine=$('carvewrightEngineOpen');if(engine&&!engine.dataset.carvewrightBound){engine.dataset.carvewrightBound='1';engine.addEventListener('click',requestOpen);}
 }
 function activity(event){
  const held=active;
  if(!event.isTrusted||!held||active!==held||!matches(held)||!g.CarvewrightApp?.isOpen?.())return;
  const target=event.target instanceof Element?event.target:null;
  const root=target?.closest('#carvewrightApp, #carvewrightStudio, #carvewrightMachining');
  if(!root?.isConnected||!root.open||root!==$(root.id))return;
  if(root.id==='carvewrightStudio'&&!g.CarvewrightStudio?.isOpen?.())return;
  if(root.id==='carvewrightMachining'&&!g.CarvewrightMachining?.isOpen?.())return;
  g.DarkSkyAdmiralSession?.noteProgramActivity?.(held.activity);
 }
 for(const event of ['pointerdown','keydown','wheel','touchstart'])document.addEventListener(event,activity,{capture:true,passive:true});
 g.CarvewrightFleet=Object.freeze({build:BUILD,open,requestOpen,close});
 for(const e of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(e,()=>close(true,'Your Admiral session ended. Sign in again to open Carvewright.'));
 g.addEventListener('darksky:admiral-session-changed',()=>{mount();const held=active||pending;if(held&&!matches(held))close(true,'The signed-in account or secure workspace changed.');});
 g.addEventListener('darksky:admiral-deck-ready',mount);
 g.addEventListener('focus',()=>{mount();const held=active||pending;if(held&&!matches(held))close(true,'The secure workspace changed. Reopen Carvewright.');});
 mount();
 // Dynamic command surfaces are body children. Do not observe app edits or modal subtrees.
 if(document.body){const surfaces=new MutationObserver(mount);surfaces.observe(document.body,{childList:true});}
})(typeof window!=='undefined'?window:globalThis);
