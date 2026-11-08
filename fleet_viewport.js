/* Headway viewport adapter — presentation only. No storage, network or authority. */
(function(root){'use strict';if(!root.document)return;let epoch=0;const noMove=new Set(['input','resize','recheck','foreground','render']);
 // The title gives assistive technology a meaningful arrival point. Safari can
 // restore scroll again after dismissing the keyboard. Yield on the first gesture.
 let stopLanding = null;
 function landAtHeader(heading, container = null) {
   stopLanding?.();
   if (!heading || (container && !container.contains(heading))) return;
   ++epoch; // Retire an unfinished scroll from the previous route.
   const viewport = root.visualViewport;
   const listeners = new AbortController();
   const options = {capture:true, passive:true, signal:listeners.signal};
   let frame = 0;
   function finish() {
     listeners.abort();
     cancelAnimationFrame(frame);
     if (stopLanding === finish) stopLanding = null;
   }
   function align() {
     frame = 0;
     if (!heading.isConnected || !heading.getClientRects().length) { finish(); return; }
     if (viewport && viewport.scale !== 1) return;
     // A dialog owns only its inner scroll planes. Its opening must preserve
     // the position of the Engine behind it.
     for (let panel = heading.parentElement; panel && panel !== document.scrollingElement; panel = panel.parentElement) {
       if (panel.scrollTop) panel.scrollTop = 0;
       if (panel === container) break;
     }
     if (!container && (root.scrollY || viewport?.offsetTop)) root.scrollTo({top:0, behavior:'instant'});
   }
   function schedule() {
     if (!listeners.signal.aborted && !frame) frame = requestAnimationFrame(align);
   }
   stopLanding = finish;
   for (const type of ['touchstart','pointerdown','wheel','keydown','click','pagehide']) {
     root.addEventListener(type, finish, options);
   }
   document.addEventListener('focusin', event => {
     if (event.target !== heading && event.target !== document.body) finish();
   }, options);
   root.addEventListener('scroll', schedule, options);
   root.addEventListener('resize', schedule, options);
   viewport?.addEventListener('scroll', schedule, options);
   viewport?.addEventListener('resize', schedule, options);
   heading.tabIndex = -1;
   heading.dataset.fleetArrivalTitle = '';
   heading.focus({preventScroll:true});
   align();
   schedule();
   return finish;
 }
 function prepare(){document.body?.classList.add('hw-viewport');if(document.body?.classList.contains('ikes-project')){const header=document.querySelector('#app>.brand-header'),banner=document.getElementById('experienceModeBanner');if(header&&banner&&banner.previousElementSibling!==header)header.after(banner);}}
 function enter({key='',reason='new',container=null,position=0,anchor=null,current=null}={}){
  prepare();if(noMove.has(reason))return false;
  stopLanding?.();
  const ticket=++epoch,scrollTo=reason==='back'?Math.max(0,Number(position)||0):0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(ticket!==epoch||(current&&!current()))return;
   const target=container&&container!==document.body&&container!==document.documentElement?container:null;
   if((target&&!target.isConnected)||(anchor&&!anchor.isConnected))return;
   // An explicit route destination owns its scroll ancestors. A window-only reset
   // leaves a nested/restored scroll plane behind on Safari. Never run on input.
   if(anchor&&reason!=='back')anchor.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});
   else try{if(target)target.scrollTo({top:scrollTo,left:0,behavior:'instant'});else root.scrollTo({top:scrollTo,left:0,behavior:'instant'});}catch(_){if(target)target.scrollTop=scrollTo;else root.scrollTo(0,scrollTo);}
   document.body.dataset.hwSurface=String(key);
  }));return true;
 }
 const api=Object.freeze({enter,prepare,landAtHeader,cancel:()=>{epoch++;stopLanding?.();},position:container=>container?container.scrollTop:root.scrollY});root.BlackFlagViewport=api;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});else prepare();
 // Only an explicit committed command navigation, never keystrokes or resize.
 root.addEventListener('darksky:command-route',e=>{const name=e.detail?.target;if(!name)return;const modal=name==='admiral'?document.getElementById('admiralDeck'):name==='captain'?document.getElementById('captainQuarters'):null;enter({key:'command:'+name,reason:'new',container:modal});});
})(typeof window!=='undefined'?window:globalThis);
