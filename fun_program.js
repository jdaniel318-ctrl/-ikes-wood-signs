/* Harborhold .49: verified Admiral program with durable game-only device recovery.
 * Only validated fictional game fields enter the dedicated device save.
 * The opaque player has no storage access. Authority and business stores are unchanged. */
(()=>{'use strict';
const Legacy=window.BlackFlagFUN,SW=window.BlackFlagStormwake,G=SW||Legacy,STORMWAKE_SHA='a7b35dec4de61eed5f9a90e3dbd817c0724ae85827b5fcf5cc125326cb81dc9c';let cachedStormwake='';const playerHtml=String(window.__funVerifiedPlayerHtml||'');delete window.__funVerifiedPlayerHtml;
const $=id=>document.getElementById(id),memo=new Map(),fileCopies=new Map(),deviceCopies=new Map();
const DEVICE_PREFIX='blackflag.stormwake.voyage.v1:';let voyageKey='',voyageScope=null;let dialog=null,frame=null,actor='',startedAt=0,channel='',epoch=0,pending=false,op=false,priorFocus=null,timer=0,observer=null,legacyMode=false,importPending=null;
const text=(id,v)=>{if($(id))$(id).textContent=v;};
function client(){const c=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();if(!c?.url||!c?.publishableKey||!window.DarkSkySupabase?.create)throw Error('Admiral identity service is unavailable. Return to the existing Admiral sign-in.');return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:'darkSkySupabaseAdmiralSessionV1',build:'8.8.20.63'});}
function deckVisible(){const d=$('admiralDeck');return !!d&&!d.hidden&&!d.classList.contains('hidden')&&d.getAttribute('aria-hidden')!=='true';}
function scopeFor(id){
 const cfg=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();
 if(!id||!cfg?.url)throw Error('The verified voyage context is unavailable.');
 const backend=new URL(cfg.url);
 if(!['https:','http:'].includes(backend.protocol)||backend.username||backend.password||backend.search||backend.hash)throw Error('The voyage context is invalid.');
 const scope={account:String(id),backend:backend.href.replace(/\/+$/,''),environment:String(cfg.environment||'staging'),site:new URL('.',location.href).href};
 return {scope,key:DEVICE_PREFIX+encodeURIComponent(JSON.stringify(scope))};
}
function localValid(){try{const s=window.DarkSkyAdmiralSession?.status(),u=client().readSession();return !!s?.reusable&&s.startedAt===startedAt&&u?.user?.id===actor&&!!u.access_token&&deckVisible()&&scopeFor(actor).key===voyageKey;}catch(_){return false;}}
function controls(ready){for(const id of ['funSaveFile','funLoadFile'])if($(id))$(id).disabled=!ready||op;}
const DEVICE_DB='blackflag-stormwake-voyages-v1',DEVICE_STORE='voyages',deviceOps=new Set();
let writeGeneration=0,importGuard=null,deviceNotice=null;
function contextNow(){return {turn:epoch,generation:writeGeneration,id:actor,stamp:startedAt,key:voyageKey,scope:JSON.parse(JSON.stringify(voyageScope))};}
function contextValid(c){return c.turn===epoch&&c.generation===writeGeneration&&c.id===actor&&c.stamp===startedAt&&c.key===voyageKey&&localValid();}
function deviceError(name,stage){const e=new Error('Device save '+stage);e.name=name;e.stage=stage;return e;}
function stopDeviceWork(){for(const cancel of [...deviceOps])cancel();}
function saveFailure(copy,error){copy.blocked='unavailable';copy.reason=({QuotaExceededError:'quota',SecurityError:'blocked',NotAllowedError:'blocked',BlockedError:'busy',TimeoutError:'timeout',AbortError:'interrupted'})[error?.name]||'failed';}
function readDeviceRecord(raw,scope=voyageScope){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>12288)throw Error('Invalid device voyage size.');
 const record=JSON.parse(raw),names=['schema','scope','savedAt','revision','state'];
 if(!record||typeof record!=='object'||Array.isArray(record)||Object.keys(record).length!==names.length||!Object.keys(record).every(k=>names.includes(k))||record.schema!=='stormwake-device-v1'||JSON.stringify(record.scope)!==JSON.stringify(scope)||typeof record.savedAt!=='string'||!Number.isFinite(Date.parse(record.savedAt))||typeof record.revision!=='string'||!record.revision||record.revision.length>100)throw Error('This device voyage does not match the current account and harbor.');
 return {...record,state:G.restore(JSON.stringify(record.state))};
}
function deviceIO(c,write=null){
 return new Promise((resolve,reject)=>{
  let db=null,tx=null,done=false,value=null,deadline=0;
  const finish=(error,result)=>{if(done)return;done=true;clearTimeout(deadline);deviceOps.delete(cancel);if(error&&tx)try{tx.abort();}catch(_){}if(db)db.close();error?reject(error):resolve(result);};
  const cancel=()=>finish(deviceError('AbortError','cancelled'));
  const check=()=>{if(done)return false;if(!contextValid(c)){finish(deviceError('AbortError','context changed'));return false;}return true;};
  if(!check())return;
  deviceOps.add(cancel);deadline=setTimeout(()=>finish(deviceError('TimeoutError','timed out')),8000);
  let request;
  try{request=window.indexedDB.open(DEVICE_DB,1);}catch(e){finish(e);return;}
  request.onblocked=()=>finish(deviceError('BlockedError','held by another tab'));
  request.onerror=()=>finish(request.error||deviceError('UnknownError','open failed'));
  request.onupgradeneeded=()=>{if(!check()){try{request.transaction.abort();}catch(_){}return;}if(!request.result.objectStoreNames.contains(DEVICE_STORE))request.result.createObjectStore(DEVICE_STORE);};
  request.onsuccess=()=>{
   if(done){request.result.close();return;}db=request.result;
   if(!check())return;
   db.onversionchange=()=>finish(deviceError('AbortError','database changed'));
   try{
    tx=db.transaction(DEVICE_STORE,write?'readwrite':'readonly');
    const store=tx.objectStore(DEVICE_STORE),read=store.get(c.key);
    tx.onabort=()=>finish(tx.error||deviceError('AbortError','transaction interrupted'));
    tx.onerror=()=>finish(tx.error||deviceError('UnknownError','transaction failed'));
    tx.oncomplete=()=>{if(check())finish(null,value);};
    read.onerror=()=>finish(read.error||deviceError('UnknownError','read failed'));
    read.onsuccess=()=>{
     if(!check())return;
     const current=read.result===undefined?null:read.result;value=current;
     if(!write)return;
     try{
      if(!write.replace&&current!==write.expected){
       let same=false;try{same=current!==null&&G.serialize(readDeviceRecord(current,c.scope).state)===write.data;}catch(_){}if(same)return;
       throw deviceError('ConflictError','changed in another tab');
      }
      if(write.legacy!==undefined&&window.localStorage.getItem(c.key)!==write.legacy)throw deviceError('ConflictError','legacy save changed');
      if(!write.replace&&current!==null&&current===write.expected){try{if(G.serialize(readDeviceRecord(current,c.scope).state)===write.data)return;}catch(_){throw deviceError('ConflictError','saved record needs attention');}}
      readDeviceRecord(write.raw,c.scope);
      const put=store.put(write.raw,c.key);
      put.onerror=()=>finish(put.error||deviceError('UnknownError','write failed'));
      put.onsuccess=()=>{
       if(!check())return;
       const back=store.get(c.key);
       back.onerror=()=>finish(back.error||deviceError('UnknownError','readback failed'));
       back.onsuccess=()=>{if(!check())return;if(back.result!==write.raw){finish(deviceError('UnknownError','readback mismatch'));return;}value=back.result;};
      };
     }catch(e){finish(e);}
    };
   }catch(e){finish(e);}
  };
 });
}
function adoptDevice(c,copy,raw,recovered){const record=readDeviceRecord(raw,c.scope);copy.raw=raw;copy.data=G.serialize(record.state);copy.savedAt=record.savedAt;copy.recovered=recovered;copy.blocked='';copy.reason='';copy.readKnown=true;return record.state;}
async function restoreDevice(c){
 if(memo.has(c.key)){await checkDeviceChange(true);if(!contextValid(c))throw deviceError('AbortError','entry changed');return;}
 const copy={raw:null,data:null,savedAt:null,recovered:false,blocked:'',reason:'',readKnown:false,legacyUnknown:false,pending:0,queue:Promise.resolve()};deviceCopies.set(c.key,copy);
 try{
  const raw=await deviceIO(c);if(!contextValid(c))throw deviceError('AbortError','entry changed');copy.raw=raw;copy.readKnown=true;
  if(raw!==null){try{memo.set(c.key,adoptDevice(c,copy,raw,true));}catch(_){copy.blocked='invalid';}}
  else{
   let legacy=null;
   try{legacy=window.localStorage.getItem(c.key);}catch(e){copy.legacyUnknown=true;saveFailure(copy,e);}
   if(legacy!==null){
    let record;
    try{record=readDeviceRecord(legacy,c.scope);}catch(_){copy.blocked='invalid';}
    if(record){
     memo.set(c.key,record.state);
     try{const migrated=await deviceIO(c,{expected:null,raw:legacy,data:G.serialize(record.state),replace:false,legacy});if(contextValid(c)){adoptDevice(c,copy,migrated,true);notifyDeviceChange();}}
     catch(e){if(e.name==='ConflictError')copy.blocked='conflict';else saveFailure(copy,e);}
    }
   }
  }
 }catch(e){if(contextValid(c))saveFailure(copy,e);}
 if(!contextValid(c))throw deviceError('AbortError','entry changed');
 if(!memo.has(c.key))memo.set(c.key,G.fresh());
}
function saveDevice(replace=false){
 if(!localValid()||!memo.has(voyageKey))return Promise.resolve(false);
 const c=contextNow(),copy=deviceCopies.get(c.key);if(!copy)return Promise.resolve(false);
 if(!replace&&(!copy.readKnown||copy.legacyUnknown||['invalid','conflict'].includes(copy.blocked)))return Promise.resolve(false);
 const state=G.validate(memo.get(c.key)),data=G.serialize(state);copy.pending++;
 const perform=async()=>{
  if(!contextValid(c))return false;
  if(!replace&&['invalid','conflict'].includes(copy.blocked))return false;
  try{
   const raw=JSON.stringify({schema:'stormwake-device-v1',scope:c.scope,savedAt:new Date().toISOString(),revision:crypto.randomUUID(),state});
   const committed=await deviceIO(c,{expected:copy.raw,raw,data,replace});
   if(!contextValid(c))return false;
   const unchanged=copy.raw===committed,wasRecovered=copy.recovered;
   adoptDevice(c,copy,committed,unchanged&&wasRecovered);copy.legacyUnknown=false;
   if(!unchanged)notifyDeviceChange();return true;
  }catch(e){if(contextValid(c)){if(e.name==='ConflictError')copy.blocked='conflict';else saveFailure(copy,e);}return false;}
 };
 const job=copy.queue.then(perform,perform).finally(()=>{copy.pending=Math.max(0,copy.pending-1);if(contextValid(c)&&frame)showSaveState(true);});
 copy.queue=job;showSaveState(true);return job;
}
function notifyDeviceChange(){try{deviceNotice?.postMessage({type:'voyage-changed'});}catch(_){}}
async function checkDeviceChange(reopening=false){
 const entering=reopening===true;
 if((!entering&&!frame)||!localValid())return;const c=contextNow(),copy=deviceCopies.get(c.key);if(!copy||(!entering&&copy.pending)||!copy.readKnown||copy.legacyUnknown)return;
 try{const raw=await deviceIO(c);if(!contextValid(c)||(!entering&&copy.pending)||raw===copy.raw)return;
  if(raw!==null){try{const state=readDeviceRecord(raw,c.scope).state,current=G.serialize(memo.get(c.key));if(G.serialize(state)===current||(entering&&!copy.blocked&&copy.data===current)){memo.set(c.key,adoptDevice(c,copy,raw,entering));showSaveState(true);return;}}catch(_){}}
  copy.blocked='conflict';showSaveState(true);
 }catch(e){if(contextValid(c)){saveFailure(copy,e);showSaveState(true);}}
}
try{deviceNotice=new BroadcastChannel('blackflag-stormwake-save-events-v1');deviceNotice.onmessage=event=>{if(event.data?.type==='voyage-changed')checkDeviceChange();};}catch(_){}
function attachPlayer(html,turn){
 frame?.remove();channel=crypto.randomUUID();frame=document.createElement('iframe');frame.id='funFrame';frame.title=legacyMode?'FUN original adventure':'Black Flag Stormwake — The Broken Passage';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('allow',"camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'");frame.referrerPolicy='no-referrer';
 const thisFrame=frame;frame.addEventListener('load',()=>{if(turn!==epoch||frame!==thisFrame||!localValid())return;thisFrame.contentWindow.postMessage({channel,type:'start',state:legacyMode&&SW?G.validate(memo.get(voyageKey)).legacy:G.validate(memo.get(voyageKey))},'*');});frame.srcdoc=html;dialog.insertBefore(frame,$('funImport'));
}
async function applyVoyage(next){
 writeGeneration++;stopDeviceWork();const c=contextNow();importGuard=c;
 try{
  memo.set(c.key,G.validate(next));fileCopies.set(c.key,{data:G.serialize(memo.get(c.key)),kind:'loaded'});
  await saveDevice(true);
  if(!contextValid(c))throw deviceError('AbortError','import session changed');
  attachPlayer(legacyMode?playerHtml:cachedStormwake,c.turn);showSaveState(true);
 }finally{if(importGuard===c)importGuard=null;}
}
function recoveryText(){
 const copy=deviceCopies.get(voyageKey);
 if(copy?.blocked==='invalid')return 'The saved voyage on this device could not be read and has been left untouched. Load your JSON backup to replace it; this run is held in this tab only.';
 if(copy?.blocked==='conflict')return 'The device save changed or was cleared in another tab. This tab cannot overwrite it automatically. Save a game file to keep this run; reload and sign in again to recover the device copy.';
 if(copy?.blocked==='unavailable'){const reason=({quota:'The browser storage limit prevented this save.',blocked:'This browser did not allow the device save.',busy:'Another tab is holding the device save.',timeout:'The device save did not finish in time.',interrupted:'The device save was interrupted.'})[copy.reason]||'The device save could not be completed.';return reason+' Save a game file before leaving; the latest progress is held in this tab only.';}
 if(copy?.data&&copy.data===G.serialize(memo.get(voyageKey))){const dock=SW?SW.voyageSummary(memo.get(voyageKey)).safeDock:'your last completed stage';return (copy.recovered?'Voyage recovered. ':'Automatically saved on this device. ')+'After a timeout or reload, sign in with the same account to return to '+dock+'. Keep a game file as your portable backup. No cloud save.';}
 return 'Preparing the device save. Check the save status before leaving; Save Game File keeps a portable backup.';
}
function showSaveState(changed=false){
 const badge=$('funSaveState');if(!badge||!memo.has(voyageKey))return;
 const copy=deviceCopies.get(voyageKey),saved=!!copy?.data&&copy.data===G.serialize(memo.get(voyageKey));
 const status=copy?.blocked||(saved?(copy.recovered?'recovered':'saved'):(copy?.pending?'saving':'unsaved'));badge.dataset.reason=copy?.reason||'';
 badge.dataset.state=status;badge.textContent=({saved:'SAVED ON THIS DEVICE',recovered:'VOYAGE RECOVERED',unavailable:'DEVICE SAVE UNAVAILABLE',invalid:'DEVICE SAVE NEEDS ATTENTION',conflict:'AUTOSAVE PAUSED',saving:'SAVING ON THIS DEVICE',unsaved:'NOT YET SAVED'})[status];
 const file=fileCopies.get(voyageKey);badge.title=file?.data===G.serialize(memo.get(voyageKey))?(file.kind==='loaded'?'JSON backup loaded.':'JSON download prepared; confirm it reached Downloads.'):'Use Save Game File for a portable backup.';
 if(changed)text('funProgramStatus',recoveryText());
}
function mount(){if(dialog?.isConnected)return;dialog=null;dialog=document.createElement('section');dialog.id='funProgram';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Black Flag Stormwake — separate Admiral program');dialog.innerHTML='<header><div class="funHeading"><strong>BLACK FLAG · STORMWAKE</strong><span id="funSaveState" data-state="held">VERIFYING ACCESS</span></div><div><button type="button" id="funSaveFile" disabled>SAVE GAME FILE</button><button type="button" id="funLoadFile" disabled>LOAD GAME FILE</button><button type="button" id="funExit">← ADMIRAL PROGRAMS</button></div></header><p id="funProgramStatus" role="status" aria-live="polite"></p><div id="funProgramHold"><h2 id="funProgramHoldTitle">Preparing the voyage</h2><p id="funProgramHoldText"></p></div><input id="funImport" type="file" accept=".json,application/json" aria-label="Choose a FUN game-save file">';$('admiralDeck')?.appendChild(dialog);$('funExit').onclick=close;$('funSaveFile').onclick=exportFile;$('funLoadFile').onclick=()=>{if(!localValid()){lock('Admiral access needs rechecking. Sign back in with the same account to continue.');return;}$('funImport').click();};$('funImport').onchange=e=>importFile(e.target.files?.[0]);}
function removeImport(){importPending=null;$('funImportConfirm')?.remove();}
async function loadStormwake(turn){if(cachedStormwake)return cachedStormwake;const abort=new AbortController(),stop=setTimeout(()=>abort.abort(),45000);try{const response=await fetch('stormwake_player.html?harborhold=882049',{cache:'no-store',signal:abort.signal,credentials:'omit'});if(!response.ok)throw Error('Stormwake player is not deployed yet.');const bytes=await response.arrayBuffer();if(bytes.byteLength>8388608)throw Error('Unexpected game package size.');const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(turn!==epoch)throw Error('Game entry cancelled.');if(digest!==STORMWAKE_SHA)throw Error('Stormwake package does not match this release. Re-upload the complete update; do not clear business data.');cachedStormwake=new TextDecoder().decode(bytes);return cachedStormwake;}finally{clearTimeout(stop);}}
function lock(reason){removeImport();epoch++;stopDeviceWork();pending=false;op=false;frame?.remove();frame=null;channel='';clearInterval(timer);timer=0;observer?.disconnect();observer=null;controls(false);if(dialog&&!dialog.hidden){$('funProgramHold').hidden=false;const copy=deviceCopies.get(voyageKey),saved=!!copy?.data&&!copy.blocked&&memo.has(voyageKey)&&copy.data===G.serialize(memo.get(voyageKey));text('funProgramHoldTitle',saved?'Your voyage is waiting':'The voyage is paused');text('funProgramHoldText',reason+(saved?' Your mission is saved on this device. Sign back in with the same account, then open Stormwake to resume at your safe dock.':' Your current run is held in this page. '+(memo.has(voyageKey)?recoveryText():'')));if($('funSaveState')){$('funSaveState').dataset.state='held';text('funSaveState',saved?'SAVED · SIGN IN TO RESUME':'ACCESS HELD');}text('funProgramStatus',saved?'Your voyage is saved. Return through Admiral access to continue.':'Re-enter through Admiral access to continue.');}}
function close(){removeImport();epoch++;stopDeviceWork();pending=false;op=false;frame?.remove();frame=null;channel='';clearInterval(timer);timer=0;observer?.disconnect();observer=null,legacyMode=false,importPending=null;if(dialog)dialog.hidden=true;controls(false);try{priorFocus?.focus({preventScroll:true});}catch(_){}}
async function verified(turn){if(!deckVisible()||!window.DarkSkyAdmiralSession?.status()?.reusable)throw Error('Enter the Admiral workspace with its existing PIN and account verification first. FUN does not grant access.');const c=client(),before=c.readSession();if(!before?.user?.id)throw Error('The Admiral account is not available.');const stamp=window.DarkSkyAdmiralSession.status().startedAt,context=scopeFor(before.user.id);const ok=await c.verifyAdmiralAuthority();const after=c.readSession();if(turn!==epoch)throw Error('Program entry cancelled.');if(!ok||!deckVisible()||!window.DarkSkyAdmiralSession.status().reusable||after?.user?.id!==before.user.id||window.DarkSkyAdmiralSession.status().startedAt!==stamp||scopeFor(after?.user?.id).key!==context.key)throw Error('The Admiral account or authority could not be verified. No game was opened.');return {id:after.user.id,stamp,context};}
async function open(originalOnly=false){if(pending||(frame&&dialog&&!dialog.hidden))return;mount();if(!dialog?.isConnected)return;priorFocus=document.activeElement;dialog.hidden=false;$('funProgramHold').hidden=false;text('funProgramHoldTitle','Preparing the voyage');text('funProgramHoldText','Checking your existing Admiral account. No new account, vessel or permissions are created.');text('funProgramStatus','Verifying Admiral access…');if($('funSaveState')){$('funSaveState').dataset.state='held';text('funSaveState','VERIFYING ACCESS');}pending=true;const turn=++epoch;actor='';startedAt=0;voyageKey='';voyageScope=null;try{const who=await verified(turn);if(turn!==epoch)return;if(!G||!playerHtml)throw Error('Game assets are missing. Upload the complete Stormwake update; no saved business data needs clearing.');actor=who.id;startedAt=who.stamp;voyageKey=who.context.key;voyageScope=who.context.scope;await restoreDevice(contextNow());if(turn!==epoch||!localValid())throw Error('Admiral session changed during device recovery.');legacyMode=originalOnly||!SW;const html=legacyMode?playerHtml:await loadStormwake(turn);if(turn!==epoch||!localValid())throw Error('Admiral session changed while the game was loading.');attachPlayer(html,turn);$('funProgramHold').hidden=true;controls(true);showSaveState(true);timer=setInterval(()=>{if(frame&&!localValid())lock('The Admiral session expired or changed.');},1000);observer=new MutationObserver(()=>{if(frame&&!deckVisible())lock('The Admiral workspace closed. Re-enter through Admiral Programs.');});observer.observe($('admiralDeck'),{attributes:true,attributeFilter:['class','hidden','aria-hidden']});$('funExit').focus({preventScroll:true});}catch(e){if(turn===epoch){lock(String(e.message||e));if(SW){const b=document.createElement('button');b.type='button';b.textContent='PLAY ORIGINAL FIRST LIGHT';b.onclick=()=>{close();open(true);};$('funProgramHold')?.appendChild(b);}}}finally{if(turn===epoch)pending=false;}}
async function exportFile(){if(op||!frame)return;op=true;controls(false);const turn=epoch,id=actor;try{const who=await verified(turn);if(who.id!==id||!localValid())throw Error('Account changed. No file was downloaded.');const data=G.serialize(memo.get(voyageKey)),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=(SW?'BlackFlag-Stormwake-':'FUN-FirstDraft-')+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove();fileCopies.set(voyageKey,{data,kind:'prepared'});showSaveState();setTimeout(()=>URL.revokeObjectURL(url),60000);text('funProgramStatus','Game file prepared. Confirm the JSON reached Downloads. '+recoveryText());}catch(e){if(turn===epoch){text('funProgramStatus','Game file not saved: '+String(e.message||e));if(!localValid())lock('Admiral access needs rechecking before saving.');}}finally{if(turn===epoch){op=false;controls(!!frame&&localValid());}}}
async function importFile(file){if(!file||op||!frame)return;op=true;controls(false);const turn=epoch,id=actor;try{if(file.size>8192)throw Error('Choose a small FUN save, not the private business backup. Nothing was imported.');const next=G.restore(await file.text());const who=await verified(turn);if(who.id!==id||!frame||!localValid())throw Error('Account changed. No game was replaced.');if(!SW){await applyVoyage(next);text('funProgramStatus','Game file loaded. '+recoveryText());return;}const voyage=SW.voyageSummary(next);removeImport();importPending={next,turn,id};frame.contentWindow.postMessage({channel,type:'pause'},'*');const box=document.createElement('section');box.id='funImportConfirm';box.setAttribute('role','alertdialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Replace the current game with this save?');box.innerHTML='<div><h2>Load this saved voyage?</h2><p>This replaces the current voyage and its automatic save on this device. The original JSON file is unchanged. Stormwake returns to the named safe dock.</p><p id="funImportSummary"></p><button id="funCancelImport" type="button">KEEP CURRENT GAME</button><button id="funConfirmImport" type="button">LOAD SAVED VOYAGE</button></div>';dialog.appendChild(box);text('funImportSummary','The Broken Passage · '+voyage.stage+'/'+voyage.stageCount+'\n'+voyage.objective+'\nSafe return: '+voyage.safeDock+'\n'+(next.legacy.completed?'First Light complete · '+next.legacy.pennant+' pennant.':'First Light: not complete.'));$('funCancelImport').onclick=()=>{if(op)return;removeImport();text('funProgramStatus','Import cancelled. Current voyage kept. '+recoveryText());};$('funConfirmImport').onclick=confirmImport;$('funCancelImport').focus({preventScroll:true});}catch(e){if(turn===epoch)text('funProgramStatus','Game file not loaded: '+String(e.message||e));}finally{if(turn===epoch){if($('funImport'))$('funImport').value='';op=false;controls(!!frame&&localValid());}}}
async function confirmImport(){const pending=importPending;if(!pending||op)return;op=true;controls(false);$('funConfirmImport').disabled=true;$('funCancelImport').disabled=true;try{const who=await verified(pending.turn);if(importPending!==pending||actor!==pending.id||who.id!==pending.id||!frame||!localValid())throw Error('Game import cancelled because the session changed.');await applyVoyage(pending.next);removeImport();text('funProgramStatus','Saved voyage loaded. '+recoveryText());}catch(e){if(pending.turn===epoch){removeImport();text('funProgramStatus','Game not replaced: '+String(e.message||e));if(!localValid())lock('Re-enter through Admiral access before loading.');}}finally{if(pending.turn===epoch){op=false;controls(!!frame&&localValid());}}}
window.addEventListener('message',event=>{if(!frame||event.source!==frame.contentWindow||event.origin!=='null'||!event.data||event.data.channel!==channel)return;if(!localValid()){lock('The Admiral session changed. Re-enter this program.');return;}if(event.data.type==='activity'){if(document.visibilityState!=='visible'||!dialog?.isConnected||dialog.hidden||dialog.inert||dialog.getAttribute('aria-hidden')==='true'||!dialog.getClientRects().length)return;window.DarkSkyAdmiralSession?.noteProgramActivity?.({userId:actor,startedAt});return;}if(event.data.type==='progress'){if(importPending||importGuard)return;try{memo.set(voyageKey,legacyMode&&SW?G.validate({...memo.get(voyageKey),legacy:Legacy.validate(event.data.state)}):G.validate(event.data.state));saveDevice();showSaveState(true);}catch(_){text('funProgramStatus','Unexpected game update rejected; last valid progress retained.');}}else if(event.data.type==='ready'){showSaveState(true);}});
window.addEventListener('darksky:admiral-session-ended',()=>{if(frame)lock('The secure Admiral session ended.');});
document.addEventListener('visibilitychange',()=>{if(!frame||!dialog||dialog.hidden)return;if(document.hidden)frame.contentWindow.postMessage({channel,type:'pause',reason:'background'},'*');if(!document.hidden&&!localValid())lock('The Admiral session expired while the page was away. Re-enter to continue.');});
window.addEventListener('focus',checkDeviceChange);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDeviceChange();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog&&!dialog.hidden){e.preventDefault();e.stopImmediatePropagation();close();}},true);
window.BlackFlagFUNProgram=Object.freeze({open,openLegacy:()=>open(true),close,isOpen:()=>!!frame&&!!dialog&&!dialog.hidden,build:'8.8.20.63',mode:'admiral-solo-prototype'});
document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#funProgramLaunch')){e.preventDefault();open();}});
})();
