/* Dark Sky 8.8.20.4 HarborMaster — shared browser-safe Supabase transport.
   This module accepts publishable keys only. It never accepts or stores a
   service-role key, password, or cross-vessel authority assertion. */
;(() => {
  'use strict';

  // DraftWatch fleet-wide single-line paste hygiene. Pasted outer whitespace is
  // trimmed after the browser performs the paste; internal spacing is preserved.
  // Passwords, dates, numeric controls and multiline text are intentionally excluded.
  if (!window.__blackFlagSingleLinePasteHygiene88180) {
    window.__blackFlagSingleLinePasteHygiene88180 = true;
    document.addEventListener('paste', event => {
      const n = event.target instanceof HTMLInputElement ? event.target : null;
      if (!n || n.hasAttribute('data-preserve-edge-space')) return;
      const type = String(n.type || 'text').toLowerCase();
      if (!['text','email','search','url','tel'].includes(type)) return;
      window.setTimeout(() => {
        if (!n.isConnected) return;
        const cleaned = String(n.value || '').replace(/^[\s\u00a0]+|[\s\u00a0]+$/g, '');
        if (cleaned === n.value) return;
        n.value = cleaned;
        n.dispatchEvent(new Event('input', {bubbles:true}));
      }, 0);
    }, true);
  }

  const DEFAULT_EXPIRY_SECONDS = 3600;
  const EXPIRY_SKEW_MS = 30_000;

  const cleanEmail = value => String(value || '').trim().toLowerCase();
  const parseJson = async response => {
    try { return await response.json(); } catch (_) { return null; }
  };
  const apiError = (problem, fallback) => {
    const message = problem?.message || problem?.msg || problem?.error_description || problem?.hint || fallback;
    return new Error(String(message || fallback).replaceAll('_', ' '));
  };
  const safeSessionRead = key => {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) { return null; }
  };
  const safeSessionWrite = (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  };
  const safeSessionRemove = key => {
    try { sessionStorage.removeItem(key); } catch (_) {}
  };

  // HarborMaster bounds this document's Admiral workspace. This is a client
  // defense, NOT a server session-expiry policy, token revocation or a role grant.
  const ADMIRAL_KEY = 'darkSkySupabaseAdmiralSessionV1';
  const IDLE_MS = 15 * 60_000, MAX_MS = 60 * 60_000;
  let admiralWindow = null, authGeneration = 0, refreshFlight = null;
  let endReason = 'new-document', lastReceipt = '', windowTimer = 0;
  let lastWall = Date.now(), monoBase = typeof performance !== 'undefined' ? performance.now() : 0, wallBase = lastWall;
  const pendingControllers = new Set();
  function windowNow() {
    const wall = Date.now(), mono = typeof performance !== 'undefined' ? performance.now() : monoBase;
    if (wall < lastWall - 2000 && admiralWindow) endWindow('clock-changed');
    lastWall = wall;
    return Math.max(wall, wallBase + Math.max(0, mono - monoBase));
  }
  function emitWindow(type = 'changed') {
    try { window.dispatchEvent(new CustomEvent('darksky:admiral-session-' + type)); } catch (_) {}
  }
  function endWindow(reason = 'signed-out') {
    authGeneration++;
    admiralWindow = null; endReason = reason;
    clearTimeout(windowTimer); windowTimer = 0;
    for (const controller of pendingControllers) controller.abort();
    pendingControllers.clear(); refreshFlight = null;
    safeSessionRemove(ADMIRAL_KEY);
    lastReceipt = reason === 'signed-out' ? 'Admiral access ended in this page.' : '';
    emitWindow('ended');
  }
  function windowState() {
    const now = windowNow();
    if (admiralWindow) {
      if (now >= admiralWindow.startedAt + MAX_MS) endWindow('maximum-age');
      else if (now >= admiralWindow.lastActivityAt + IDLE_MS) endWindow('idle');
    }
    const w = admiralWindow;
    return Object.freeze({
      available: !!w, reusable: !!w && !!w.verifiedAt,
      startedAt: w?.startedAt || null, lastActivityAt: w?.lastActivityAt || null,
      checkedAt: w?.verifiedAt || null,
      idleRemainingMs: w ? Math.max(0, w.lastActivityAt + IDLE_MS - now) : 0,
      maximumRemainingMs: w ? Math.max(0, w.startedAt + MAX_MS - now) : 0,
      reason: endReason, receipt: lastReceipt,
      idleLimitMinutes: 15, maximumLimitMinutes: 60,
      enforcement: 'browser-workspace-only', serverTimeoutVerified: false
    });
  }
  function scheduleWindow() {
    clearTimeout(windowTimer);
    if (!admiralWindow) return;
    const s = windowState();
    if (!s.available) return;
    windowTimer = setTimeout(() => { windowState(); emitWindow(); scheduleWindow(); }, Math.min(5000, s.idleRemainingMs, s.maximumRemainingMs));
  }
  function startWindow(session, generation) {
    if (generation !== authGeneration) throw new Error('Sign-in was cancelled. No workspace was opened.');
    if (!session?.user?.id) throw new Error('The account response did not identify a user.');
    const now = windowNow();
    admiralWindow = { userId: session.user.id, startedAt: now, lastActivityAt: now, verifiedAt: 0 };
    endReason = ''; lastReceipt = '';
    scheduleWindow(); emitWindow();
  }
  function allowSession(session) {
    if (!windowState().available || !session?.access_token || session?.user?.id !== admiralWindow?.userId) return false;
    return true;
  }
  function noteAuthority(userId) {
    if (!windowState().available || admiralWindow?.userId !== userId) return false;
    const first = !admiralWindow.verifiedAt;
    admiralWindow.verifiedAt = windowNow();
    if (first) lastReceipt = 'Commissioned Admiral authority verified. Secure workspace open.';
    emitWindow(); return true;
  }
  function noteResumed() {
    if (!windowState().reusable) return false;
    admiralWindow.lastActivityAt = windowNow();
    lastReceipt = 'Commissioned Admiral office reverified. No additional password entry was needed.';
    scheduleWindow(); emitWindow(); return true;
  }
  function cancelSignIn() {
    // Invalidate late login/verification responses without extending a live window.
    authGeneration++;
    for (const controller of pendingControllers) controller.abort();
    pendingControllers.clear(); refreshFlight = null;
    if (admiralWindow && !admiralWindow.verifiedAt) endWindow('cancelled');
  }
  function trustedActivity(event) {
    // Check the deadline before activity; a late click cannot revive a window.
    if (!windowState().reusable || !event.isTrusted || document.visibilityState !== 'visible') return;
    const target = event.target instanceof Element ? event.target : null;
    const host = target?.closest('#admiralDeck, #bootstrapFleet, #foundryWorkspace, #authorityLedger, #cgWorkspace');
    if (!host || host.hidden || host.inert || host.classList.contains('hidden') || host.getAttribute('aria-hidden') === 'true') return;
    // Contract editing uses the same idle policy, not a longer authority window.
    if (host.id === 'cgWorkspace' && window.DarkSkyCharterGuard?.isWorkspaceOpen?.() !== true) return;
    if (host.id === 'authorityLedger' && document.getElementById('authorityLedgerOfficeLabel')?.textContent?.trim() !== 'ADMIRAL') return;
    if (host.id === 'bootstrapFleet' && !document.getElementById('watchSecurityLayer')?.classList.contains('hidden')) return;
    admiralWindow.lastActivityAt = windowNow();
    scheduleWindow();
  }
  for (const type of ['pointerdown','keydown','wheel','touchstart']) document.addEventListener(type, trustedActivity, {capture:true,passive:true});
  document.addEventListener('visibilitychange', () => { windowState(); emitWindow(); });
  window.addEventListener('focus', () => { windowState(); emitWindow(); });
  window.addEventListener('pagehide', () => endWindow('document-left'));
  window.addEventListener('pageshow', e => { if (e.persisted) endWindow('document-restored'); });
  window.DarkSkyAdmiralSession = Object.freeze({
    status: windowState, end: endWindow, cancelSignIn, noteResumed,
    receipt: message => { lastReceipt = String(message || ''); emitWindow(); }
  });

  function create(options = {}) {
    const url = String(options.url || '').replace(/\/$/, '');
    const publishableKey = String(options.publishableKey || options.key || '');
    const sessionKey = String(options.sessionKey || 'darkSkySupabaseSessionV1');
    const build = String(options.build || '8.8.20.4');
    const admiral = sessionKey === ADMIRAL_KEY;
    // Opt-in cancellation for the separate Vessel Captain route. Owner and
    // Admiral policies are untouched. Generation prevents late session writes.
    const guarded = options.guardSession === true && !admiral;
    let localGeneration=0;const localRequests=new Set();
    if (!url || !publishableKey) throw new Error('Supabase publishable client configuration is incomplete.');
    const headers = (token = '', json = true) => {
      const value = { apikey: publishableKey };
      if (token) value.Authorization = `Bearer ${token}`;
      if (json) value['Content-Type'] = 'application/json';
      return value;
    };
    const readSession = () => {
      const s = safeSessionRead(sessionKey);
      return !admiral || allowSession(s) ? s : null;
    };
    const saveSession = data => {
      if (!data?.access_token) return null;
      const previous = safeSessionRead(sessionKey);
      const session = {
        access_token: data.access_token, refresh_token: data.refresh_token || '',
        expires_at: Date.now() + Math.max(60, Number(data.expires_in || DEFAULT_EXPIRY_SECONDS)) * 1000,
        user: data.user || (admiral ? previous?.user : null) || null, flow_type: data.flow_type || '', build
      };
      if (!safeSessionWrite(sessionKey, session)) throw new Error('The secure browser session could not be retained.');
      return session;
    };
    const clearSession = () => { if (admiral) endWindow('signed-out'); else {if(guarded){localGeneration++;for(const c of localRequests)c.abort();localRequests.clear();}safeSessionRemove(sessionKey);} };
    async function request(path, init = {}, fallback = 'Supabase refused the request.') {
      // Only Admiral transport is changed by HarborMaster. Owner transport keeps its policy.
      if (guarded) {
        const generation=localGeneration,controller=new AbortController();localRequests.add(controller);let timer;
        try{return await Promise.race([(async()=>{
          const response=await fetch(`${url}${path}`,{cache:'no-store',...init,signal:controller.signal});const body=await parseJson(response);
          if(generation!==localGeneration)throw new Error('Captain request cancelled.');
          if(!response.ok){const error=apiError(body,fallback);error.status=response.status;throw error;}return body;
        })(),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Captain request timed out. No automatic retry was made.'));},12000);})]);}
        finally{clearTimeout(timer);localRequests.delete(controller);}
      }
      if (!admiral) {
        const response = await fetch(`${url}${path}`, {cache:'no-store', ...init});
        const body = await parseJson(response);
        if (!response.ok) throw apiError(body, fallback);
        return body;
      }
      const controller = new AbortController(), generation = authGeneration;
      pendingControllers.add(controller);
      let timer;
      try {
        return await Promise.race([
          (async () => {
            const response = await fetch(`${url}${path}`, {cache:'no-store', ...init, signal:controller.signal});
            const body = await parseJson(response);
            if (generation !== authGeneration) throw new Error('Admiral request cancelled. Reopen the intended workspace.');
            if (!response.ok) {const error=apiError(body,fallback);error.status=response.status;throw error;}
            return body;
          })(),
          new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('The server request timed out. No automatic retry was made. Check the saved result before repeating a command.'));},12000);})
        ]);
      } finally {clearTimeout(timer);pendingControllers.delete(controller);}
    }
    async function refreshSession(session = readSession()) {
      if (!session?.refresh_token || (admiral && !allowSession(session))) return null;
      if (admiral && refreshFlight) return refreshFlight;
      const work = async () => {
        const generation=authGeneration,local=localGeneration;
        try {
          const data = await request('/auth/v1/token?grant_type=refresh_token', {
            method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})
          }, 'The secure session expired. Sign in again.');
          if (admiral && !allowSession(session)) return null;
          if (admiral && data?.user?.id && data.user.id !== session.user?.id) {endWindow('account-changed');return null;}
          if(guarded && local!==localGeneration)return null;
          if(guarded && data?.user?.id && session.user?.id && data.user.id!==session.user.id){clearSession();return null;}
          // Refresh updates token material, never the workspace's sign-in/activity clocks.
          return saveSession(data);
        } catch (_) {if(guarded){if(local===localGeneration)clearSession();}else if(!admiral||generation===authGeneration)clearSession();return null;}
      };
      if (!admiral) return work();
      const flight=work();refreshFlight=flight;try{return await flight;}finally{if(refreshFlight===flight)refreshFlight=null;}
    }
    async function currentSession() {
      let session=readSession();
      if(session?.access_token && Number(session.expires_at)>Date.now()+EXPIRY_SKEW_MS)return session;
      if(session?.refresh_token)session=await refreshSession(session);
      return session?.access_token && (!admiral || allowSession(session))?session:null;
    }
    async function signInWithPassword(email,password) {
      const normalized=cleanEmail(email);
      if(!normalized||!password)throw new Error('Enter the account email and password.');
      if(admiral)endWindow('signing-in');if(guarded)clearSession();
      const generation=authGeneration,local=localGeneration;
      try {
        const data=await request('/auth/v1/token?grant_type=password',{
          method:'POST',headers:headers(),body:JSON.stringify({email:normalized,password:String(password)})
        },'Email or password did not match.');
        if((admiral&&generation!==authGeneration)||(guarded&&local!==localGeneration))throw new Error('Sign-in was cancelled.');
        if((admiral||guarded) && !data?.user?.id)throw new Error('The server did not return a verified account identity.');
        const session=saveSession(data);
        if(admiral)startWindow(session,generation);
        return session;
      } catch(error) {if(admiral && generation===authGeneration)endWindow('sign-in-failed');throw error;}
    }
    async function user(session=null) {
      session=session||await currentSession();if(!session?.access_token)return null;const local=localGeneration;
      try {
        const value=await request('/auth/v1/user',{headers:{...headers(session.access_token),Accept:'application/json'}},'The signed-in identity could not be verified.');
        if(admiral && (!allowSession(session)||value?.id!==session.user?.id)){endWindow('account-changed');return null;}
        if(guarded&&(local!==localGeneration||!value?.id||(session.user?.id&&value.id!==session.user.id))){if(local===localGeneration)clearSession();return null;}
        session.user=value;safeSessionWrite(sessionKey,session);return value;
      } catch(error) {if(guarded){if(local===localGeneration)clearSession();}else if(!admiral||[401,403].includes(error.status))clearSession();return null;}
    }
    async function verifyAdmiralAuthority() {
      if(!admiral)throw new Error('Admiral verification requires its separate session.');
      const session=await currentSession();if(!session?.access_token)return false;
      const generation=authGeneration;
      try {
        const person=await request('/auth/v1/user',{headers:{...headers(session.access_token),Accept:'application/json'}},'The account session could not be verified.');
        if(!person?.id||person.id!==session.user?.id){endWindow('account-changed');return false;}
        const rows=await request('/rest/v1/fleet_global_authorities?select=user_id,authority_role,active,revoked_at&user_id=eq.'+encodeURIComponent(person.id)+'&authority_role=eq.admiral&active=eq.true&revoked_at=is.null',{
          headers:{...headers(session.access_token),Accept:'application/json'}
        },'Active Admiral authority could not be verified.');
        if(generation!==authGeneration||!allowSession(session))return false;
        const ok=Array.isArray(rows)&&rows.length===1&&rows[0].user_id===person.id&&rows[0].authority_role==='admiral'&&rows[0].active===true&&rows[0].revoked_at===null;
        if(!ok){endWindow('authority-denied');return false;}
        return noteAuthority(person.id);
      } catch(error) {
        if([401,403].includes(error.status)){endWindow('authority-denied');return false;}
        if(generation===authGeneration && admiralWindow){admiralWindow.verifiedAt=0;endReason='verification-unavailable';emitWindow('unavailable');}
        throw new Error(error?.name==='AbortError'?'Admiral verification was cancelled. The workspace stays locked.':error?.message||'Server unavailable. The workspace stays locked.');
      }
    }
    async function signOut() {
      const session=safeSessionRead(sessionKey);
      if(guarded){clearSession();let timer;const controller=new AbortController();try{if(session?.access_token){timer=setTimeout(()=>controller.abort(),12000);const r=await fetch(`${url}/auth/v1/logout?scope=local`,{method:'POST',headers:headers(session.access_token,false),cache:'no-store',signal:controller.signal});return {localEnded:true,serverAcknowledged:r.ok};}}catch(_){}finally{clearTimeout(timer);}return {localEnded:true,serverAcknowledged:false};}
      if(!admiral){try{if(session?.access_token)await fetch(`${url}/auth/v1/logout`,{method:'POST',headers:headers(session.access_token,false),cache:'no-store'});}finally{safeSessionRemove(sessionKey);}return;}

      clearSession(); // End local reuse synchronously, including in-flight response acceptance.
      let serverAcknowledged=false;
      if(session?.access_token)try {
        if(admiral)await request('/auth/v1/logout?scope=local',{method:'POST',headers:headers(session.access_token,false)},'Server sign-out was not confirmed.');
        else await fetch(`${url}/auth/v1/logout`,{method:'POST',headers:headers(session.access_token,false),cache:'no-store'});
        serverAcknowledged=true;
      } catch (_) {}
      if(admiral&&!admiralWindow){lastReceipt=serverAcknowledged?'Admiral access ended here; the server acknowledged the sign-out request.':'Admiral access ended here. Server sign-out was not confirmed.';emitWindow();}
      return {localEnded:true,serverAcknowledged,immediateTokenRevocationVerified:false};
    }
    async function rpc(name,body={},fallback='Fleet Core refused the request.') {
      if(admiral && !(await verifyAdmiralAuthority()))throw new Error('Active Admiral authority and an unexpired workspace window are required.');
      const session=await currentSession();if(!session?.access_token)throw new Error('Authenticate the required Supabase account first.');
      return request(`/rest/v1/rpc/${encodeURIComponent(name)}`,{method:'POST',headers:{...headers(session.access_token),Accept:'application/json'},body:JSON.stringify(body)},fallback);
    }
    return Object.freeze({url,publishableKey,sessionKey,build,headers,readSession,saveSession,clearSession,refreshSession,currentSession,signInWithPassword,user,signOut,request,rpc,verifyAdmiralAuthority});
  }

  window.DarkSkySupabase = Object.freeze({ create, cleanEmail });
})();
