/* Carvewright 8.8.20.68 — independent, app-local Admiral service passage. */
(function(g){
 'use strict';
 if(!g.document||g.CarvewrightFleet)return;
 const BUILD='8.8.20.68',SESSION='darkSkySupabaseAdmiralSessionV1';
 const $=id=>document.getElementById(id);
 let deck=null,deckObserver=null,generation=0,pending=null,active=null,passage=null,timer=null;
 function message(text){
  const n=$('carvewrightEntryStatus');if(n)n.textContent=text;
  if(deckVisible()){const notice=$('admiralDeckNotice');if(notice)notice.textContent=text;}
 }
 function config(){const c=g.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();if(!c?.url||!c?.publishableKey||!g.DarkSkySupabase?.create)throw Error('Fleet identity configuration is unavailable.');return c;}
 function client(){const c=config();return g.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION,build:BUILD});}
 function context(){try{const c=config(),s=g.DarkSkyAdmiralSession?.status?.(),u=client().readSession()?.user;if(!s?.reusable||!s.startedAt||!u?.id)return null;return {accountId:String(u.id),backend:new URL(c.url).href.replace(/\/$/,''),environment:String(c.environment||'staging'),site:new URL('./',location.href).href,startedAt:s.startedAt};}catch(_){return null;}}
 const mark=c=>c?JSON.stringify(c):'';
 const visible=n=>!!n?.isConnected&&!n.hidden&&!n.classList.contains('hidden')&&n.getAttribute('aria-hidden')!=='true';
 const deckVisible=()=>deck===$('admiralDeck')&&visible(deck);
 function matches(held){return held.generation===generation&&held.deck===deck&&deckVisible()&&held.mark===mark(context());}
 function stopTimer(){if(timer!==null)g.clearInterval(timer);timer=null;}
 function monitor(){if(timer===null)timer=g.setInterval(()=>{const held=active||pending;if(held&&!matches(held))close(true,'Your Admiral session or workspace changed. Reopen Carvewright after signing in.');},1000);}
 function invalidate(){generation++;active=null;pending=null;stopTimer();}
 function close(force=false,text=''){
  if(!force&&active&&g.CarvewrightApp?.close?.(false)===false)return false;
  const shouldClose=!!active||!!pending;
  invalidate();
  if(force&&shouldClose)g.CarvewrightApp?.close?.(true);
  if(text)message(text);
  return true;
 }
 function guard(held){if(!matches(held)||active!==held){if(held.generation===generation)close(true,'The secure workspace changed. Reopen Carvewright.');throw Object.assign(Error('The Admiral session or Carvewright context changed.'),{code:'AUTH'});}return true;}
 async function open(origin='admiral'){
  mount();
  if(pending)return false;
  if(active&&matches(active)&&g.CarvewrightApp?.isOpen?.())return true;
  if(active)close(true);
  const ctx=context();
  if(!ctx||!deckVisible()){message('Sign in through the Admiral gate to open Carvewright.');return false;}
  if(!g.CarvewrightApp?.open){message('Carvewright is still loading. Upload the complete release and try again.');return false;}
  const held={generation:++generation,deck,mark:mark(ctx),activity:Object.freeze({userId:ctx.accountId,startedAt:ctx.startedAt})};pending=held;monitor();
  try{
   if(!matches(held))return false;
   const authorized=await client().verifyAdmiralAuthority();
   if(!authorized||!matches(held)){if(held.generation===generation)close(true,'Admiral authority could not be verified. Sign in again.');return false;}
   active=held;
   // businessId is an app-local namespace, never a server vessel or membership claim.
   const scope=Object.freeze({accountId:ctx.accountId,backend:ctx.backend,environment:ctx.environment,site:ctx.site,businessId:'carvewright'});
   const opened=await g.CarvewrightApp.open({scope,guard:()=>guard(held),parent:held.deck,referenceOnly:false,returnTo:origin,onClose:forced=>{
    if(active!==held)return;
    const canReturn=!forced&&matches(held);
    invalidate();
    if(canReturn)returnToOrigin(origin,held.mark);
   }});
   if(opened===false||!matches(held)||active!==held){if(held.generation===generation)close(true,'The secure workspace changed before Carvewright opened.');return false;}
   message('Carvewright opened. Local design workspace · registration pending.');return true;
  }catch(error){if(held.generation===generation)close(true,'Carvewright could not open: '+(error?.message||'Access unavailable.'));return false;}
  finally{if(pending===held)pending=null;if(!active&&!pending)stopTimer();}
 }
 function returnToOrigin(origin,originalMark){
  if(origin==='fleet'){
   if(!originalMark||originalMark!==mark(context())){
    g.DarkSkyOpenAdmiralGate('engine','fleet-programs');
    return;
   }
   deck?.classList.add('hidden');
   g.DarkSkyOpenFleetWatchtower({source:'admiral-gate',focusProgram:'carvewright'});
  }else if(origin==='engine')g.DarkSkyReturnToEngine?.();
 }
 function cancelPassage(){
  const entry=passage;
  passage=null;
  if(entry?.origin!=='fleet'||entry.route!==g.DarkSkyFleetNavigator?.state?.().generation)return false;
  returnToOrigin('fleet',entry.mark);
  return true;
 }
 function finishPassage(target){
  const entry=passage;
  passage=null;
  if(!entry||entry.target!==target||entry.route!==g.DarkSkyFleetNavigator?.state?.().generation)return false;
  return open(entry.origin);
 }
 function requestOpen(){
  if(pending||passage)return false;
  if(active&&matches(active)&&g.CarvewrightApp?.isOpen?.())return true;
  if(typeof g.DarkSkyOpenAdmiralGate!=='function'){message('The Admiral gate is still loading. Try again shortly.');return false;}
  const fleet=visible($('bootstrapFleet'));
  if(fleet&&!g.DarkSkyLeaveFleetForCarvewright?.())return false;
  const entry={origin:fleet?'fleet':'engine',target:fleet?'carvewright-fleet':'carvewright',mark:mark(context())};
  passage=entry;
  function failed(){
   if(passage!==entry)return;
   passage=null;
   returnToOrigin(entry.origin,entry.mark);
   message('Carvewright could not open. Try again.');
  }
  try{
   const routing=g.DarkSkyOpenAdmiralGate('engine',entry.target);
   entry.route=g.DarkSkyFleetNavigator?.state?.().generation;
   Promise.resolve(routing).catch(failed);
   return true;
  }catch(_){failed();return false;}
 }
 function mount(){
  const next=$('admiralDeck');
  if(next!==deck){deckObserver?.disconnect();if(active||pending)close(true);deck=next;if(deck){deckObserver=new MutationObserver(()=>{if((active||pending)&&!deckVisible())close(true,'The Admiral workspace closed. Reopen Carvewright through Admiral.');});deckObserver.observe(deck,{attributes:true,attributeFilter:['class','hidden','aria-hidden']});}}
  const actions=deck?.querySelector('.admiral-deck-head-actions');
  if(actions&&!$('carvewrightAdmiralOpen')){const b=document.createElement('button');b.id='carvewrightAdmiralOpen';b.type='button';b.textContent='CARVEWRIGHT';b.addEventListener('click',()=>void open());actions.prepend(b);}
  const fleet=$('watchLocalTools')||$('watchWorkspace')||$('bootstrapFleet')?.querySelector('.bootstrap-fleet-shell');
  if(fleet&&!$('carvewrightFleetService')){
   const card=document.createElement('section');
   card.id='carvewrightFleetService';
   card.className='carvewright-fleet-service';
   card.setAttribute('aria-label','Carvewright local design service');
   const mark=document.createElement('span');
   mark.className='bridge-service-mark';mark.setAttribute('aria-hidden','true');mark.textContent='CW';
   const body=document.createElement('div'),title=document.createElement('h4'),copy=document.createElement('p');
   title.textContent='Carvewright';copy.textContent='Sign design and CNC files · Local service, registration pending.';
   const button=document.createElement('button');
   button.id='carvewrightFleetOpen';button.type='button';button.textContent='Open Carvewright';
   button.addEventListener('click',requestOpen);
   body.append(title,copy);card.append(mark,body,button);fleet.appendChild(card);
  }
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
 g.CarvewrightFleet=Object.freeze({build:BUILD,open,requestOpen,finishPassage,cancelPassage,close});
 for(const e of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(e,()=>{
  // A fresh account sign-in can end the prior session while the gate is visible.
  // The destination carries no authority. Always discard active or pending work.
  if(active||pending)close(true,'Your Admiral session ended. Sign in again to open Carvewright.');
 });
 g.addEventListener('darksky:admiral-session-changed',()=>{mount();const held=active||pending;if(held&&!matches(held))close(true,'The signed-in account or secure workspace changed.');});
 g.addEventListener('darksky:command-route',()=>{
  if(passage?.route!=null && passage.route!==g.DarkSkyFleetNavigator?.state?.().generation)passage=null;
 });
 g.addEventListener('pagehide',()=>{passage=null;close(true);});
 g.addEventListener('darksky:admiral-deck-ready',mount);
 g.addEventListener('focus',()=>{mount();const held=active||pending;if(held&&!matches(held))close(true,'The secure workspace changed. Reopen Carvewright.');});
 mount();
 // Dynamic command surfaces are body children. Do not observe app edits or modal subtrees.
 if(document.body){const surfaces=new MutationObserver(mount);surfaces.observe(document.body,{childList:true});}
})(typeof window!=='undefined'?window:globalThis);
