(() => {
  'use strict';

  const CAPTAIN_PIN = '19613';
  const ADMIRAL_PIN = '19613'; // Temporary shared credential; separate contract so it can split later without rewiring authority.
  window.DarkSkyCaptainAuthContract = Object.freeze({pin:CAPTAIN_PIN,recoveryPin:CAPTAIN_PIN,scope:'captains-quarters-only'});
  window.DarkSkyAdmiralAuthContract = Object.freeze({pin:ADMIRAL_PIN,recoveryPin:ADMIRAL_PIN,scope:'admirals-deck-only',sharedWithCaptain:true,temporary:true});
  let authorized = false;

  const byId = (id) => document.getElementById(id);
  const show = (id) => byId(id)?.classList.remove('hidden');
  const hide = (id) => byId(id)?.classList.add('hidden');

  function enterCaptainSubview(id) {
    hide('captainGlobalExit');
    show(id);
  }

  function leaveCaptainSubview(id) {
    hide(id);
    const quarters = byId('captainQuarters');
    if (authorized && quarters && !quarters.classList.contains('hidden')) show('captainGlobalExit');
  }

  function closeTopCaptainSubview() {
    const admiralDeck = byId('admiralDeck');
    if (admiralDeck && !admiralDeck.classList.contains('hidden')) {
      hide('admiralDeck');
      show('captainQuarters');
      show('captainGlobalExit');
      return true;
    }
    const admiralGate = byId('admiralGateOverlay');
    if (admiralGate && !admiralGate.classList.contains('hidden')) {
      hide('admiralGateOverlay');
      show('captainGlobalExit');
      return true;
    }
    if (document.body.classList.contains('captain-command-open') && window.BlackFlagCaptainCommand?.close) {
      window.BlackFlagCaptainCommand.close();
      return true;
    }
    for (const id of ['captainTestAccessGate','captainSpyglassPanel','captainObjectPanel','captainFleetChart','captainBlueprint']) {
      const el = byId(id);
      if (el && !el.classList.contains('hidden')) {
        leaveCaptainSubview(id);
        return true;
      }
    }
    return false;
  }

  function clearHash() {
    try {
      if (location.hash === '#captainQuartersGate') {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch (_) {}
  }

  function openGate() {
    if(window.DarkSkyTestAccess?.isActive?.()){
      authorized=true;
      hide('captainQuartersGate');
      show('captainQuarters');
      show('captainGlobalExit');
      refreshCaptainWatch();
      clearHash();
      document.body.classList.add('captain-modal-open','captain-authorized');
      playEntrance();
      return;
    }
    authorized = false;
    hide('captainQuarters');
    const gate = byId('captainQuartersGate');
    const input = byId('captainPinInput');
    const error = byId('captainPinError');

    if (error) error.textContent = '';
    if (input) input.value = '';
    gate?.classList.remove('hidden');
    document.body.classList.add('captain-modal-open');
    requestAnimationFrame(() => input?.focus());
  }

  function closeGate() {
    const input = byId('captainPinInput');
    const error = byId('captainPinError');
    if (input) input.value = '';
    if (error) error.textContent = '';
    hide('captainQuartersGate');
    document.body.classList.remove('captain-modal-open');
    clearHash();
  }

  function playEntrance() {
    const quarters = byId('captainQuarters');
    const entry = byId('captainEntrySequence');
    let seen = false;
    try { seen = sessionStorage.getItem('darkSkyCaptainEntrySeen') === '1'; } catch (_) {}

    // Performance contract: the cinematic entrance is a first-entry flourish, not
    // a tax on every Captain navigation round-trip. Subsequent entries in the
    // same browser session become interactive immediately.
    if (seen) {
      quarters?.classList.remove('captain-entry-complete');
      entry?.classList.remove('captain-entry-play','captain-entry-repeat');
      if (entry) void entry.offsetWidth;
      entry?.classList.add('captain-entry-repeat');
      window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 620);
      return;
    }

    quarters?.classList.remove('captain-entry-complete');
    entry?.classList.remove('captain-entry-play');
    if (entry) void entry.offsetWidth;
    entry?.classList.add('captain-entry-play');
    try { sessionStorage.setItem('darkSkyCaptainEntrySeen', '1'); } catch (_) {}
    // Match the visible entrance instead of leaving the controls gated for
    // ~2 seconds after the primary animation has already finished.
    window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 2500);
  }

  function unlock() {
    const input = byId('captainPinInput');
    const error = byId('captainPinError');
    const entered = String(input?.value || '').trim();

    if (entered !== CAPTAIN_PIN) {
      authorized = false;
      if (error) error.textContent = 'Captain authentication failed.';
      if (input) {
        input.value = '';
        input.focus();
      }
      return;
    }

    authorized = true;
    byId('captainPinInput')?.blur();
    hide('captainQuartersGate');
    show('captainQuarters');
    show('captainGlobalExit');
    refreshCaptainWatch();
    clearHash();
    document.body.classList.add('captain-modal-open', 'captain-authorized');
    playEntrance();
  }

  function secure() {
    authorized = false;
    // Captain-only escape invariant: close every Captain subview before revealing Engine.
    ['admiralDeck','admiralGateOverlay','captainBlueprint','captainFleetChart','captainSpyglassPanel','captainObjectPanel','captainTestAccessGate','captainCommandWorkspace','captainQuarters','captainQuartersGate','captainGlobalExit'].forEach(hide);
    byId('captainQuarters')?.classList.remove('captain-entry-complete');
    byId('captainEntrySequence')?.classList.remove('captain-entry-play');
    if (byId('captainPinInput')) byId('captainPinInput').value = '';
    document.body.classList.remove('captain-modal-open', 'captain-authorized', 'captain-command-open');
    clearHash();
    requestAnimationFrame(() => { try { window.scrollTo({top:0,left:0,behavior:'auto'}); } catch (_) { window.scrollTo(0,0); } });
  }

  function fleetSnapshot(){
    return typeof window.blackFlagDeploymentFleetSnapshot==='function'
      ? window.blackFlagDeploymentFleetSnapshot()
      : [];
  }

  function stateLabel(state){
    return state==='deployed'?'SAILING':state==='paused'?'IN HARBOR':state==='sea_trial'?'SEA TRIAL':state==='draft'?'DRAFT':'RETIRED';
  }

  function openSignalReport(projectId){
    const report=byId('captainFleetSignalReport');
    const vessel=fleetSnapshot().find(v=>v.projectId===projectId);
    if(!report||!vessel)return;
    const outposts=(vessel.outposts||[]).filter(o=>o.state!=='retired');
    report.innerHTML=`<div class="cq-signal-report-head">
      <div><small>CAPTAIN'S SIGNAL REPORT</small><h3>${vessel.name}</h3></div>
      <button id="captainSignalClose" type="button" aria-label="Close signal report">×</button>
    </div>
    <div class="cq-signal-vessel-summary">
      <span>${vessel.activeOutposts} SAILING</span>
      <span>${vessel.attentionOutposts} NEEDING ATTENTION</span>
      <span>${vessel.totalOutposts} TOTAL OUTPOSTS</span>
    </div>
    <div class="cq-signal-outposts">
      ${outposts.length?outposts.map(o=>{
        const reasons=(o.attentionReasons||[]).filter(r=>!(r.includes('Device-level')&&o.state!=='deployed'));
        return `<article class="cq-signal-outpost ${o.state}">
          <i></i>
          <div><strong>${o.name}</strong><small>${stateLabel(o.state)} • Manifest v${o.manifestVersion}</small>${reasons.length?`<p>${reasons.join(' • ')}</p>`:''}</div>
          <button type="button" data-captain-route-project="${vessel.projectId}" data-captain-route-outpost="${o.id}">TAKE ME THERE <small>Open in Engine</small></button>
        </article>`;
      }).join(''):`<div class="cq-no-signals">No active outposts. This vessel is safely in harbor.</div>`}
    </div>
    <p class="cq-signal-footnote">Captain's Quarters observes and routes. Deployment machinery remains in the Engine behind its own authorization.</p>`;
    report.classList.remove('hidden');
    byId('captainSignalClose')?.addEventListener('click',()=>report.classList.add('hidden'),{once:true});
  }

  function refreshCaptainFleetChart(){
    const box=byId('captainFleetVessels');
    const summary=byId('captainFleetSignalSummary');
    const report=byId('captainFleetSignalReport');
    if(!box)return;
    if(report)report.classList.add('hidden');
    const fleet=fleetSnapshot();
    if(!fleet.length)return;
    const positions=[[17,58],[50,35],[79,61],[67,74],[32,76]];
    box.innerHTML=fleet.map((v,index)=>{
      const signal=v.attentionOutposts>0?'attention':v.activeOutposts>0?'sailing':'harbor';
      const status=v.attentionOutposts>0
        ? `${v.activeOutposts} sailing • ${v.attentionOutposts} needs attention`
        : v.activeOutposts>0
          ? `${v.activeOutposts} outpost${v.activeOutposts===1?'':'s'} sailing`
          : v.totalOutposts>0
            ? `${v.totalOutposts} outpost${v.totalOutposts===1?'':'s'} in harbor`
            : 'No outposts';
      const pos=positions[index%positions.length];
      const outposts=(v.outposts||[]).filter(o=>o.state!=='retired');
      const ports=outposts.map((o,i)=>`<i class="cq-outpost-beacon ${o.state}" style="--port-x:${18+(i*19)%65}%;--port-y:${18+(i*23)%58}%" title="${o.name}: ${stateLabel(o.state)}"></i>`).join('');
      return `<button class="captain-fleet-vessel ${signal}" data-captain-vessel="${v.projectId}" style="--ship-x:${pos[0]}%;--ship-y:${pos[1]}%" type="button" aria-label="${v.name}: ${status}">
        <span class="cq-vessel-code">${String(v.code||'PRJ').slice(0,3)}</span>
        <b class="cq-vessel-icon">⛵</b>
        <strong>${v.name}</strong>
        <small>${status}</small>
        ${ports}
      </button>`;
    }).join('');
    box.querySelectorAll('[data-captain-vessel]').forEach(btn=>btn.addEventListener('click',()=>openSignalReport(btn.dataset.captainVessel)));
    const active=fleet.reduce((n,v)=>n+v.activeOutposts,0);
    const attention=fleet.reduce((n,v)=>n+v.attentionOutposts,0);
    if(summary) summary.innerHTML=`<strong>SIGNAL WATCH</strong><span>${fleet.length} vessels</span><span>${active} outpost${active===1?'':'s'} sailing</span>${attention?`<span class="attention">${attention} needing attention</span>`:'<span>waters steady</span>'}`;    refreshCaptainWatch();
  }

  function refreshSpyglass(){
    const box=byId('captainSpyglassReport'); if(!box)return;
    const fleet=fleetSnapshot();
    const active=fleet.reduce((n,v)=>n+v.activeOutposts,0);
    const attention=fleet.reduce((n,v)=>n+v.attentionOutposts,0);
    const trials=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    const harbor=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='paused').length,0);
    const messages=[];
    fleet.forEach(v=>(v.outposts||[]).forEach(o=>{
      if(o.state==='paused')messages.push(`${v.name}: ${o.name} is in harbor.`);
      if(o.state==='sea_trial')messages.push(`${v.name}: ${o.name} is undergoing Sea Trial.`);
      if(o.state==='deployed'&&!o.deviceLockVerified&&o.profile==='kiosk_self_service')messages.push(`${v.name}: ${o.name} is sailing; device-level kiosk lock is not verified.`);
    }));
    box.innerHTML=`<div class="cq-spyglass-horizon">
      <div><strong>${fleet.length}</strong><span>VESSELS</span></div>
      <div><strong>${active}</strong><span>OUTPOSTS SAILING</span></div>
      <div><strong>${trials}</strong><span>SEA TRIALS</span></div>
      <div><strong>${harbor}</strong><span>IN HARBOR</span></div>
    </div>
    <section class="cq-first-mate-opening">
      <small>FIRST MATE'S OPENING REPORT</small>
      <h3>${attention?'Signals require your eye.':'Waters are steady.'}</h3>
      ${messages.length?messages.map(m=>`<p>${m}</p>`).join(''):'<p>No deployment exceptions are currently reported by the Engine.</p>'}
    </section>
    <p class="cq-spyglass-boundary">The Spyglass interprets current Engine state. It does not alter project machinery.</p>`;
  }


  function refreshCaptainWatch(){
    const headline=byId('captainWatchHeadline');
    const detail=byId('captainWatchDetail');
    if(!headline||!detail)return;
    const fleet=fleetSnapshot();
    const active=fleet.reduce((n,v)=>n+v.activeOutposts,0);
    const attention=fleet.reduce((n,v)=>n+v.attentionOutposts,0);
    const trials=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    const harbor=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='paused').length,0);
    headline.textContent=attention?`${attention} signal${attention===1?'':'s'} require your eye`:'Waters are steady';
    detail.textContent=`${fleet.length} vessels • ${active} sailing${trials?` • ${trials} sea trial${trials===1?'':'s'}`:''}${harbor?` • ${harbor} in harbor`:''}`;
    const strip=byId('captainWatchStrip');
    strip?.classList.toggle('attention',attention>0);
    refreshChartroomLive();
  }



  function ensureChartroomLiveLayer(){
    const room=byId('captainQuarters');
    if(!room)return null;
    let layer=byId('captainChartroomLive');
    if(layer)return layer;
    layer=document.createElement('div');
    layer.id='captainChartroomLive';
    layer.className='cq-chartroom-live';
    layer.innerHTML=`
      <div class="cq-chartroom-doctrine" aria-hidden="true">
        <small>CAPTAIN'S QUARTERS</small>
        <strong>Charting the Future Fleet</strong>
        <span>Chart. Decide. Build.</span>
      </div>
      <section class="cq-chartroom-intel" aria-label="Live Captain intelligence">
        <div class="cq-live-head"><small>LIVE CAPTAIN INTELLIGENCE</small><b id="cqLiveState">Reading the horizon…</b></div>
        <div class="cq-live-grid">
          <article><span>VESSELS</span><strong id="cqLiveVessels">—</strong><small>Known to Dark Sky</small></article>
          <article><span>SAILING</span><strong id="cqLiveSailing">—</strong><small>Active outposts</small></article>
          <article><span>SEA TRIAL</span><strong id="cqLiveTrials">—</strong><small>Testing now</small></article>
          <article><span>SIGNALS</span><strong id="cqLiveSignals">—</strong><small>Need your eye</small></article>
        </div>
      </section>
      <div class="cq-chartroom-boundary">CAPTAIN VIEW • READ / ROUTE • PROJECT MACHINERY REMAINS ISOLATED</div>`;
    room.appendChild(layer);
    return layer;
  }



  function showCaptainDeskNotice(message,tone='future'){
    const room=byId('captainQuarters');
    if(!room)return;
    let notice=byId('captainDeskNotice');
    if(!notice){
      notice=document.createElement('div');
      notice.id='captainDeskNotice';
      notice.className='cq-desk-notice';
      notice.setAttribute('role','status');
      notice.setAttribute('aria-live','polite');
      room.appendChild(notice);
    }
    notice.dataset.tone=tone;
    notice.textContent=message;
    notice.classList.add('show');
    clearTimeout(showCaptainDeskNotice.timer);
    showCaptainDeskNotice.timer=setTimeout(()=>notice.classList.remove('show'),2300);
  }

  function ensureAdmiralDeck(){
    let gate=byId('admiralGateOverlay');
    if(gate)return gate;
    gate=document.createElement('div');
    gate.id='admiralGateOverlay';
    gate.className='admiral-gate-overlay hidden';
    gate.setAttribute('role','dialog');
    gate.setAttribute('aria-modal','true');
    gate.setAttribute('aria-labelledby','admiralGateTitle');
    gate.innerHTML=`
      <div class="admiral-gate-shell">
        <div class="admiral-gate-scene" aria-hidden="true"><div class="admiral-door left"></div><div class="admiral-door right"></div><div class="admiral-seal">⚓</div></div>
        <section class="admiral-gate-card">
          <small>ABOVE CAPTAIN COMMAND • PROVING ACCESS</small>
          <h2 id="admiralGateTitle">Admiral's Gate</h2>
          <p>The Admiral's Deck governs Dark Sky, Black Flag and the fleet. This trial entrance exists so the Captain can prove the machinery before the rank is earned.</p>
          <div class="admiral-trial-badge">ADMIRAL STATUS • NOT YET COMMISSIONED</div>
          <label for="admiralPinInput">ADMIRAL ACCESS PIN</label>
          <input id="admiralPinInput" type="password" inputmode="numeric" maxlength="8" autocomplete="off" />
          <p id="admiralPinError" class="captain-error" aria-live="polite"></p>
          <button id="admiralUnlockBtn" type="button" class="admiral-primary">ENTER ADMIRAL'S DECK →</button>
          <button id="admiralGateReturnBtn" type="button" class="admiral-secondary">← RETURN TO CAPTAIN'S QUARTERS</button>
        </section>
      </div>`;
    document.body.appendChild(gate);

    const deck=document.createElement('div');
    deck.id='admiralDeck';
    deck.className='admiral-deck-overlay hidden';
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-modal','true');
    deck.setAttribute('aria-labelledby','admiralDeckTitle');
    deck.innerHTML=`
      <div class="admiral-deck-shell">
        <div class="admiral-deck-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
        <header class="admiral-deck-head">
          <div><small>TRIAL COMMAND • FLEET GOVERNANCE</small><h2 id="admiralDeckTitle">Admiral's Deck</h2><p>Above Captain command. Governs Dark Sky, Black Flag and fleet standards.</p></div>
          <div class="admiral-deck-head-actions"><span>PROVISIONAL</span><button id="admiralDeckModeBtn" type="button" aria-pressed="false">PROFESSIONAL MODE</button><button id="admiralDeckReturnBtn" type="button">← RETURN TO CAPTAIN'S QUARTERS</button></div>
        </header>
        <main class="admiral-deck-grid">
          <section class="admiral-deck-hero"><small>THE HIGHER WATCH</small><h3>Govern the platform. Protect the fleet.</h3><p>The Captain commands the mission. The Admiral sets the standards that Dark Sky, Black Flag and every vessel must obey.</p><div class="admiral-scope"><span>DARK SKY</span><span>BLACK FLAG</span><span>FLEET</span></div></section>
          <aside class="admiral-readiness-card"><small>FLEET READINESS</small><strong id="admiralDeckReadinessState">NOT RUN</strong><p id="admiralDeckReadinessCopy">Run the fleet checks before treating this deck as proven.</p><button id="admiralDeckRunReadiness" type="button">RUN FLEET READINESS</button></aside>
          <section class="admiral-governance-card"><h4>Governance</h4><div><button id="admiralDeckForge" type="button">Visual Forge <em>READY</em></button><button type="button" data-admiral-future="Delegation">Delegation <em>FUTURE</em></button><button type="button" data-admiral-future="Fleet Standards">Fleet Standards <em>FUTURE</em></button><button type="button" data-admiral-future="Expansion">Expansion <em>FUTURE</em></button></div></section>
          <section class="admiral-governance-card"><h4>Continuity</h4><div><button id="admiralDeckRecovery" type="button">Recovery Snapshot <em>READY</em></button><button id="admiralDeckReport" type="button">Readiness Report <em>READY</em></button><button type="button" data-admiral-future="Admiral Log">Admiral Log <em>FUTURE</em></button></div></section>
          <section class="admiral-deck-note" id="admiralDeckNotice" role="status" aria-live="polite">Trial Deck active. Rank is not implied by access.</section>
        </main>
      </div>`;
    document.body.appendChild(deck);

    const closeGate=()=>{hide('admiralGateOverlay'); byId('admiralPinInput').value=''; byId('admiralPinError').textContent='';};
    const returnToCaptain=()=>{hide('admiralDeck');closeGate();show('captainQuarters');show('captainGlobalExit');document.body.classList.add('captain-modal-open','captain-authorized');};
    byId('admiralGateReturnBtn').onclick=closeGate;
    byId('admiralDeckReturnBtn').onclick=returnToCaptain;
    byId('admiralDeckModeBtn').onclick=()=>{
      const professional=deck.dataset.mode==='professional';
      deck.dataset.mode=professional?'ceremonial':'professional';
      const btn=byId('admiralDeckModeBtn');
      if(btn){btn.setAttribute('aria-pressed',String(!professional));btn.textContent=professional?'PROFESSIONAL MODE':'CEREMONIAL MODE';}
      try{localStorage.setItem('darkSkyAdmiralDeckMode',deck.dataset.mode);}catch(_){ }
    };
    byId('admiralUnlockBtn').onclick=async()=>{
      const input=byId('admiralPinInput'),error=byId('admiralPinError');
      if(String(input?.value||'').trim()!==ADMIRAL_PIN){if(error)error.textContent='Admiral access denied.';if(input){input.value='';input.focus();}return;}
      if(error)error.textContent='';hide('admiralGateOverlay');hide('captainQuarters');hide('captainGlobalExit');show('admiralDeck');
      let savedMode='ceremonial';try{savedMode=localStorage.getItem('darkSkyAdmiralDeckMode')||'ceremonial';}catch(_){ }
      deck.dataset.mode=savedMode==='professional'?'professional':'ceremonial';
      const modeBtn=byId('admiralDeckModeBtn');if(modeBtn){const pro=deck.dataset.mode==='professional';modeBtn.setAttribute('aria-pressed',String(pro));modeBtn.textContent=pro?'CEREMONIAL MODE':'PROFESSIONAL MODE';}
      deck.classList.remove('admiral-deck-enter','admiral-deck-enter-repeat');void deck.offsetWidth;
      let seenDeck=false;try{seenDeck=sessionStorage.getItem('darkSkyAdmiralTrialSeen')==='1';}catch(_){ }
      deck.classList.add(seenDeck?'admiral-deck-enter-repeat':'admiral-deck-enter');
      try{sessionStorage.setItem('darkSkyAdmiralTrialSeen','1');}catch(_){ }
    };
    byId('admiralPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')byId('admiralUnlockBtn').click();});
    byId('admiralDeckRunReadiness').onclick=async()=>{
      const state=byId('admiralDeckReadinessState'),copy=byId('admiralDeckReadinessCopy');
      if(state)state.textContent='CHECKING';
      try{
        const report=await window.DarkSkyAdmiralReadiness?.run?.();
        if(!report)throw new Error('Fleet Readiness service unavailable');
        const label=report.pass?(report.warnings?'WATCH':'CLEAR'):'HOLD';
        if(state){state.textContent=label;state.dataset.state=label.toLowerCase();}
        if(copy)copy.textContent=report.pass?`${report.checks.length-report.warnings} checks clear${report.warnings?` • ${report.warnings} watch`:''}.`:`${report.criticalFailures} critical hold${report.criticalFailures===1?'':'s'} remain.`;
        window.__lastAdmiralReadinessReport=report;
      }catch(err){if(state)state.textContent='UNAVAILABLE';if(copy)copy.textContent=String(err?.message||err);}
    };
    byId('admiralDeckRecovery').onclick=()=>window.DarkSkyAdmiralReadiness?.exportRecovery?.();
    byId('admiralDeckForge').onclick=()=>openVisualForge('admiral');
    byId('admiralDeckReport').onclick=()=>{
      const report=window.__lastAdmiralReadinessReport;
      if(!report){byId('admiralDeckNotice').textContent='Run Fleet Readiness first.';return;}
      const blob=new Blob([JSON.stringify({schema:'dark-sky-fleet-readiness-v1',...report},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dark-sky-fleet-readiness-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
    };
    deck.querySelectorAll('[data-admiral-future]').forEach(btn=>btn.onclick=()=>{byId('admiralDeckNotice').textContent=`${btn.dataset.admiralFuture} is charted for a future Admiral voyage.`;});
    return gate;
  }

  function openAdmiralGate(){
    ensureAdmiralDeck();
    hide('captainGlobalExit');
    const gate=byId('admiralGateOverlay');
    const input=byId('admiralPinInput');
    gate?.classList.remove('hidden');
    gate?.classList.remove('admiral-gate-enter','admiral-gate-repeat');void gate?.offsetWidth;
    let seen=false;try{seen=sessionStorage.getItem('darkSkyAdmiralGateSeen')==='1';}catch(_){ }
    gate?.classList.add(seen?'admiral-gate-repeat':'admiral-gate-enter');
    try{sessionStorage.setItem('darkSkyAdmiralGateSeen','1');}catch(_){ }
    if(input){input.value='';window.setTimeout(()=>input.focus(),seen?220:950);}
  }

  function ensureVisualForge(){
    let overlay=byId('visualForgeOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('div');
    overlay.id='visualForgeOverlay';
    overlay.className='visual-forge-overlay hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','visualForgeTitle');
    overlay.innerHTML=`
      <div class="visual-forge-shell">
        <header class="visual-forge-head">
          <div><small id="visualForgeScope">CAPTAIN VISUAL FORGE</small><h2 id="visualForgeTitle">Visual Command Forge</h2><p>Turn a reference visual into a buildable Dark Sky command brief without mixing project data or silently publishing anything.</p></div>
          <button id="visualForgeClose" type="button" aria-label="Close Visual Forge">×</button>
        </header>
        <main class="visual-forge-grid">
          <section class="visual-forge-input">
            <label>Forge mode<select id="visualForgeMode"><option value="scene-command">Scene → Command Surface</option><option value="visual-interface">Visual → Interface</option><option value="brand-experience">Brand → Customer Experience</option><option value="new-vessel">Visual → New Vessel</option><option value="asset-system">Visual → Asset System</option></select></label>
            <label>Target<select id="visualForgeTarget"><option>Captain's Quarters</option><option>Admiral's Deck</option><option>New Vessel</option><option>Existing Project</option><option>Dark Sky / Black Flag</option></select></label>
            <label>Working title<input id="visualForgeName" type="text" placeholder="Name this concept" /></label>
            <label>What should this become?<textarea id="visualForgeObjective" rows="5" placeholder="Describe what you want the visual to become, what must work, what must stay isolated, and what the user should be able to do."></textarea></label>
            <label class="visual-forge-upload">Reference visuals<input id="visualForgeFiles" type="file" accept="image/*" multiple /><span>Choose one or more images</span></label>
            <div id="visualForgeRefs" class="visual-forge-refs"><p>No references loaded yet.</p></div>
            <button id="visualForgeBuild" class="visual-forge-primary" type="button">FORGE BLUEPRINT</button>
          </section>
          <section class="visual-forge-output">
            <div class="visual-forge-status"><small>FORGE STATE</small><strong id="visualForgeState">STANDING BY</strong><span id="visualForgeStateCopy">Add a visual and objective, then forge a build brief.</span></div>
            <div id="visualForgeBlueprint" class="visual-forge-blueprint"><h3>Blueprint preview</h3><p>The Forge will translate the visual into structure, interactions, protected zones, isolation rules and next build steps.</p></div>
            <div class="visual-forge-actions"><button id="visualForgeExport" type="button" disabled>EXPORT BLUEPRINT</button><button id="visualForgeReset" type="button">RESET</button></div>
            <div class="visual-forge-boundary"><b>BOUNDARY:</b> Blueprint generation is local and project-neutral. Real generative execution remains a separate capability until a managed backend is commissioned.</div>
          </section>
        </main>
      </div>`;
    document.body.appendChild(overlay);
    let refs=[];
    let current=null;
    const refsHost=byId('visualForgeRefs');
    const renderRefs=()=>{
      if(!refs.length){refsHost.innerHTML='<p>No references loaded yet.</p>';return;}
      refsHost.innerHTML=refs.map((r,i)=>`<figure><img src="${r.url}" alt="Reference ${i+1}" /><figcaption>${r.name}</figcaption></figure>`).join('');
    };
    byId('visualForgeFiles').addEventListener('change',e=>{
      refs.forEach(r=>{try{URL.revokeObjectURL(r.url);}catch(_){}}); refs=[];
      [...(e.target.files||[])].slice(0,6).forEach(file=>refs.push({name:file.name,type:file.type,size:file.size,url:URL.createObjectURL(file)}));
      renderRefs();
    });
    const principles={
      'scene-command':['Separate environment art from the interactive layer','Map natural visual zones to real tools','Protect navigation and safe-area controls','Use live state instead of baked-in fake metrics','Keep reduced-motion and fast repeat entry'],
      'visual-interface':['Preserve the strongest visual hierarchy','Translate decorative controls into real components','Keep tap targets and accessibility independent of artwork','Make responsive behavior explicit','Avoid duplicate UI over baked-in text'],
      'brand-experience':['Extract brand identity without copying another project','Lead with confidence and one primary customer action','Use category-appropriate journeys and graphics','Keep transactional contact data required and isolated','Keep Test/Preview real-world actions blocked'],
      'new-vessel':['Define mission, business model and customer first action','Create a project-scoped visual identity','Select only relevant fleet capabilities','Prepare Preview before Sea Trial','Never inherit another vessel’s state or assets'],
      'asset-system':['Define canonical logo, hero, category and background roles','Keep project-owned assets scoped to one Project ID','Use upload/generate fallbacks without cross-project borrowing','Protect responsive crops and control safe zones','Version assets independently of runtime code']
    };
    const scopeLabel=()=>overlay.dataset.scope==='admiral'?'ADMIRAL VISUAL FORGE':'CAPTAIN VISUAL FORGE';
    byId('visualForgeBuild').onclick=()=>{
      const mode=byId('visualForgeMode').value,target=byId('visualForgeTarget').value,name=(byId('visualForgeName').value||'Untitled Forge').trim(),objective=(byId('visualForgeObjective').value||'').trim();
      const scope=overlay.dataset.scope||'captain';
      current={schema:'dark-sky-visual-forge-v1',id:`forge-${Date.now().toString(36)}`,createdAt:new Date().toISOString(),scope,mode,target,name,objective,references:refs.map(({name,type,size})=>({name,type,size})),principles:principles[mode]||[],status:'blueprint-ready',execution:'managed-backend-not-yet-connected'};
      try{const key='darkSkyVisualForgeEntries';const rows=JSON.parse(localStorage.getItem(key)||'[]');rows.unshift(current);localStorage.setItem(key,JSON.stringify(rows.slice(0,20)));}catch(_){ }
      byId('visualForgeState').textContent='BLUEPRINT READY';byId('visualForgeStateCopy').textContent=`${scopeLabel()} translated the reference into a build contract.`;
      byId('visualForgeBlueprint').innerHTML=`<small>${scope.toUpperCase()} • ${target}</small><h3>${name}</h3><p>${objective||'No objective supplied yet.'}</p><h4>Build principles</h4><ol>${current.principles.map(x=>`<li>${x}</li>`).join('')}</ol><h4>Next move</h4><p>${scope==='admiral'?'Review whether this pattern should become a governed fleet standard before promotion.':'Prototype the blueprint in Workshop, then Sea Trial it before any fleet promotion.'}</p>`;
      byId('visualForgeExport').disabled=false;
    };
    byId('visualForgeExport').onclick=()=>{if(!current)return;const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${current.id}-${current.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'visual-forge'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
    byId('visualForgeReset').onclick=()=>{current=null;byId('visualForgeName').value='';byId('visualForgeObjective').value='';byId('visualForgeFiles').value='';refs.forEach(r=>{try{URL.revokeObjectURL(r.url);}catch(_){}});refs=[];renderRefs();byId('visualForgeState').textContent='STANDING BY';byId('visualForgeStateCopy').textContent='Add a visual and objective, then forge a build brief.';byId('visualForgeBlueprint').innerHTML='<h3>Blueprint preview</h3><p>The Forge will translate the visual into structure, interactions, protected zones, isolation rules and next build steps.</p>';byId('visualForgeExport').disabled=true;};
    byId('visualForgeClose').onclick=()=>hide('visualForgeOverlay');
    overlay.addEventListener('click',e=>{if(e.target===overlay)hide('visualForgeOverlay');});
    return overlay;
  }

  function openVisualForge(scope='captain'){
    const forge=ensureVisualForge();
    forge.dataset.scope=scope;
    const label=byId('visualForgeScope'); if(label)label.textContent=scope==='admiral'?'ADMIRAL VISUAL FORGE • FLEET GOVERNANCE':'CAPTAIN VISUAL FORGE • CREATE & PROTOTYPE';
    const target=byId('visualForgeTarget'); if(target)target.value=scope==='admiral'?"Admiral's Deck":"Captain's Quarters";
    show('visualForgeOverlay');
  }

  function ensureCaptainDeskIndex(){
    const room=byId('captainQuarters');
    if(!room)return null;
    let desk=byId('captainDeskIndex');
    if(desk)return desk;
    desk=document.createElement('nav');
    desk.id='captainDeskIndex';
    desk.className='cq-desk-index cq-command-rail';
    desk.setAttribute('aria-label',"Captain's Helm and command tools");
    desk.innerHTML=`
      <div class="cq-desk-index-title cq-helm-title"><small>CAPTAIN'S HELM</small><strong>Command & proving ground</strong><span id="captainHelmReadiness"><i></i> FLEET READINESS • NOT RUN</span></div>
      <section class="cq-desk-group" aria-label="Command tools"><h4>COMMAND</h4>
        <button type="button" data-cq-desk-route="fleet" data-cq-desk-state="active"><span>✥</span><b>Fleet Map</b><small>Chart the fleet</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="watch" data-cq-desk-state="active"><span>◉</span><b>First Mate</b><small>Signals & counsel</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="log" data-cq-desk-state="active"><span>✒</span><b>Captain's Log</b><small>Orders & history</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="readiness" data-cq-desk-state="active" class="cq-readiness-station"><span>✦</span><b>Fleet Readiness</b><small>Prove the hull</small><em>READY</em></button>
      </section>
      <section class="cq-desk-group" aria-label="Build tools"><h4>BUILD</h4>
        <button type="button" data-cq-desk-route="workshop" data-cq-desk-state="active"><span>⚒</span><b>Workshop</b><small>Ideas & experiments</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="forge" data-cq-desk-state="active" class="cq-visual-forge-station"><span>✦</span><b>Visual Forge</b><small>Visual → build brief</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="shipyard" data-cq-desk-state="active"><span>⚓</span><b>Shipyard</b><small>Future vessels</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="blueprint" data-cq-desk-state="active"><span>⌘</span><b>Blueprint</b><small>Architecture map</small><em>READY</em></button>
      </section>
      <section class="cq-desk-group" aria-label="Explore tools"><h4>EXPLORE</h4>
        <button type="button" data-cq-desk-route="spyglass" data-cq-desk-state="active"><span>⌖</span><b>Spyglass</b><small>Fleet intelligence</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="test" data-cq-desk-state="active"><span>◇</span><b>Test Access</b><small>Session controls</small><em>READY</em></button>
        <button type="button" data-cq-desk-route="trade" data-cq-desk-state="future" aria-disabled="true"><span>☸</span><b>Trade Routes</b><small>Route planning</small><em>FUTURE</em></button>
      </section>
      <section class="cq-desk-group cq-desk-ascend" aria-label="Higher command"><h4>ASCEND</h4>
        <button type="button" data-cq-desk-route="admiral" data-cq-desk-state="active" class="cq-admiral-gate-station"><span>⚓</span><b>Admiral's Gate</b><small>Trial higher command</small><em>TRIAL</em></button>
      </section>`;

    const targets={
      fleet:'captainDarkSkyChartBtn',
      watch:'captainWatchStrip',
      workshop:'captainCargoDoor',
      shipyard:'captainShipyardLaunch',
      blueprint:'captainBlueprintDeskBtn',
      log:'captainLogDoor',
      spyglass:'captainSpyglassBtn',
      test:'captainTestAccessDeckBtn',
      admiral:'__admiralGate__',
      forge:'__visualForgeCaptain__',
      readiness:'__fleetReadiness__'
    };
    desk.querySelectorAll('[data-cq-desk-state="active"]').forEach(btn=>{
      const target=targets[btn.dataset.cqDeskRoute];
      if(target==='__admiralGate__' || target==='__visualForgeCaptain__' || target==='__fleetReadiness__') return;
      if(!target || !byId(target)){
        btn.dataset.cqDeskState='unavailable';
        btn.setAttribute('aria-disabled','true');
        const tag=btn.querySelector('em'); if(tag)tag.textContent='UNAVAILABLE';
      }
    });
    desk.addEventListener('click',(event)=>{
      const btn=event.target.closest('[data-cq-desk-route]');
      if(!btn)return;
      const state=btn.dataset.cqDeskState||'active';
      if(state==='future'){
        showCaptainDeskNotice(`${btn.querySelector('b')?.textContent||'This station'} is charted for a future voyage.`,'future');
        return;
      }
      if(state==='unavailable'){
        showCaptainDeskNotice(`${btn.querySelector('b')?.textContent||'This station'} is temporarily unavailable.`,'unavailable');
        return;
      }
      const target=targets[btn.dataset.cqDeskRoute];
      if(btn.dataset.cqDeskRoute==='readiness'){
        const chip=byId('captainHelmReadiness');
        if(chip) chip.innerHTML='<i></i> FLEET READINESS • CHECKING';
        Promise.resolve(window.DarkSkyAdmiralReadiness?.run?.()).then(report=>{
          if(!report) throw new Error('Fleet Readiness unavailable');
          const label=report.pass?(report.warnings?'WATCH':'CLEAR'):'HOLD';
          if(chip){chip.dataset.state=label.toLowerCase();chip.innerHTML=`<i></i> FLEET READINESS • ${label}`;}
          window.__lastAdmiralReadinessReport=report;
          showCaptainDeskNotice(report.pass?(report.warnings?`Fleet readiness clear with ${report.warnings} watch item(s).`:'Fleet readiness clear. Hull proven for this check.'):`Hold in harbor: ${report.criticalFailures} critical readiness check(s).`,report.pass?(report.warnings?'future':'ready'):'unavailable');
        }).catch(err=>{if(chip){chip.dataset.state='hold';chip.innerHTML='<i></i> FLEET READINESS • UNAVAILABLE';}showCaptainDeskNotice(String(err?.message||err),'unavailable');});
        return;
      }
      if(target==='__admiralGate__'){openAdmiralGate();return;}
      if(target==='__visualForgeCaptain__'){openVisualForge('captain');return;}
      const targetEl=byId(target);
      if(!targetEl){
        btn.dataset.cqDeskState='unavailable';
        btn.setAttribute('aria-disabled','true');
        const tag=btn.querySelector('em'); if(tag)tag.textContent='UNAVAILABLE';
        showCaptainDeskNotice('This station is temporarily unavailable.','unavailable');
        return;
      }
      targetEl.click();
    });
    room.appendChild(desk);
    return desk;
  }

  function refreshChartroomLive(){
    const layer=ensureChartroomLiveLayer();
    if(!layer)return;
    const fleet=fleetSnapshot();
    const active=fleet.reduce((n,v)=>n+(Number(v.activeOutposts)||0),0);
    const attention=fleet.reduce((n,v)=>n+(Number(v.attentionOutposts)||0),0);
    const trials=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    const set=(id,value)=>{ const el=byId(id); if(el)el.textContent=String(value); };
    set('cqLiveVessels',fleet.length);
    set('cqLiveSailing',active);
    set('cqLiveTrials',trials);
    set('cqLiveSignals',attention);
    const state=byId('cqLiveState');
    if(state)state.textContent=attention?`${attention} signal${attention===1?'':'s'} require your eye`:(fleet.length?'Waters are steady':'Fleet data standing by');
    layer.classList.toggle('attention',attention>0);
  }

  function prepareCinematicCabin(){
    const room=document.getElementById('captainQuarters');
    if(!room)return;
    const image=new Image();
    image.onload=()=>{
      room.classList.add('cinematic-cabin-ready');
      room.classList.remove('cinematic-cabin-failed');
      ensureChartroomLiveLayer();
      ensureCaptainDeskIndex();
      refreshChartroomLive();
    };
    image.onerror=()=>{
      // Deliberate fallback: keep the known-good v2.9.51 cabin fully usable.
      room.classList.remove('cinematic-cabin-ready');
      room.classList.add('cinematic-cabin-failed');
    };
    image.src='assets/captains_quarters_command_center_v578.png';
  }

  function bind() {
    document.documentElement.classList.add('captain-controller-ready');
    prepareCinematicCabin();

    // Direct listeners are safe here because this file loads at the very end of BODY.
    byId('captainModeAccessBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      openGate();
    });
    byId('captainGateCloseBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      closeGate();
    });
    byId('captainUnlockBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      unlock();
    });
    byId('captainQuartersCloseBtn')?.addEventListener('click', secure);
    byId('captainExitBtn')?.addEventListener('click', secure);
    byId('captainGlobalExit')?.addEventListener('click', secure);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !authorized) return;
      event.preventDefault();
      if (closeTopCaptainSubview()) return;
      secure();
    });
    byId('captainBlueprintBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      enterCaptainSubview('captainBlueprint');
    });
    byId('captainBlueprintDeskBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      enterCaptainSubview('captainBlueprint');
    });
    byId('captainBlueprintClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      leaveCaptainSubview('captainBlueprint');
    });
    byId('captainDarkSkyChartBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      refreshCaptainFleetChart();
      enterCaptainSubview('captainFleetChart');
    });
    byId('captainFleetChartClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      leaveCaptainSubview('captainFleetChart');
    });
    byId('captainFleetChart')?.addEventListener('click',event=>{
      const route=event.target.closest?.('[data-captain-route-project]');
      if(!route)return;
      window.dispatchEvent(new CustomEvent('blackflag:open-deployment',{detail:{
        projectId:route.dataset.captainRouteProject,
        outpostId:route.dataset.captainRouteOutpost
      }}));
    });
    byId('captainSpyglassBtn')?.addEventListener('click',event=>{
      event.preventDefault();
      refreshSpyglass();
      enterCaptainSubview('captainSpyglassPanel');
    });
    byId('captainWatchStrip')?.addEventListener('click',event=>{
      event.preventDefault();
      refreshSpyglass();
      enterCaptainSubview('captainSpyglassPanel');
    });
    byId('captainSpyglassClose')?.addEventListener('click',event=>{
      event.preventDefault();
      leaveCaptainSubview('captainSpyglassPanel');
    });
    byId('captainTestAccessToggle')?.addEventListener('click',async(event)=>{
      event.preventDefault();
      if(window.DarkSkyTestAccess?.isActive?.()){
        window.DarkSkyTestAccess.disable();
        leaveCaptainSubview('captainTestAccessGate');
        return;
      }
      if(byId('testAccessEnginePin')) byId('testAccessEnginePin').value='';
      if(byId('testAccessCaptainPin')) byId('testAccessCaptainPin').value='';
      if(byId('captainTestAccessError')) byId('captainTestAccessError').textContent='';
      enterCaptainSubview('captainTestAccessGate');
      requestAnimationFrame(()=>byId('testAccessEnginePin')?.focus());
    });
    byId('captainTestAccessDeckBtn')?.addEventListener('click',(event)=>{
      event.preventDefault();
      byId('captainTestAccessToggle')?.click();
    });
    byId('captainTestAccessCancel')?.addEventListener('click',()=>hide('captainTestAccessGate'));
    byId('captainTestAccessConfirm')?.addEventListener('click',async()=>{
      const enginePin=String(byId('testAccessEnginePin')?.value||'').trim();
      const captainPin=String(byId('testAccessCaptainPin')?.value||'').trim();
      const error=byId('captainTestAccessError');
      if(captainPin!==CAPTAIN_PIN){ if(error)error.textContent='Captain PIN is incorrect.'; return; }
      const result=await window.BlackFlagAuth?.verify?.(enginePin);
      if(!result?.ok){ if(error)error.textContent=window.BlackFlagAuth?.message?.(result)||'Engine PIN is incorrect.'; return; }
      window.DarkSkyTestAccess?.enable?.();
      if(byId('testAccessEnginePin')) byId('testAccessEnginePin').value='';
      if(byId('testAccessCaptainPin')) byId('testAccessCaptainPin').value='';
      leaveCaptainSubview('captainTestAccessGate');
    });
    window.addEventListener('darksky:testaccesschange',()=>window.DarkSkyTestAccess?.refresh?.());

    byId('captainPinInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        unlock();
      }
    });

    // Defensive delegated fallback in case the Engine later recreates the access dock.
    document.addEventListener('click', (event) => {
      const access = event.target.closest?.('#captainModeAccessBtn');
      if (access && access !== byId('captainModeAccessBtn')) {
        event.preventDefault();
        openGate();
      }
    }, true);

    // Native hash fallback may already have exposed the gate before JS booted.
    if (location.hash === '#captainQuartersGate') openGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  // v3.9.4 static command-surface review: legacy Captain object panel close
  // must remain actionable even though the five-door workspace superseded it.
  document.addEventListener('click',event=>{
    const target=event.target?.closest?.('#captainObjectClose');
    if(!target)return;
    event.preventDefault();
    const panel=document.getElementById('captainObjectPanel');
    if(panel){panel.classList.add('hidden');panel.setAttribute('aria-hidden','true');}
  },true);

  // Captain authority is never persisted.
  window.addEventListener('pagehide', () => { authorized = false; });
})();

// v2.9.61 — Captain's five command doors, robust boot.
(function(){
function bootCaptainCommand(){
  if(window.__blackFlagCaptainCommandBound) return;
  window.__blackFlagCaptainCommandBound=true;
  const workspace=document.getElementById('captainCommandWorkspace');
  const title=document.getElementById('captainCommandTitle');
  const subtitle=document.getElementById('captainCommandSubtitle');
  const body=document.getElementById('captainCommandBody');
  const close=document.getElementById('captainCommandClose');

  // Capture-phase fallback: the painted Captain buttons must work even if
  // another cabin layer later overlaps or recreates a visual element.
  document.addEventListener('click',event=>{
    const door=event.target.closest?.('[data-captain-command-door]');
    if(!door)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(door.dataset.captainCommandDoor);
  },true);

  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));

  function audit(action,detail=''){
    const rows=read('blackFlagCaptainAudit',[]);
    rows.unshift({at:new Date().toISOString(),action,detail});
    write('blackFlagCaptainAudit',rows.slice(0,500));
  }

  async function snapshot(){
    try{
      if(typeof window.blackFlagCaptainManagementSnapshot==='function'){
        return await window.blackFlagCaptainManagementSnapshot();
      }
    }catch(err){console.warn('Captain snapshot unavailable',err)}
    return {projects:[],totalOrders:0,generatedAt:new Date().toISOString()};
  }

  function standingOrders(){
    return read('blackFlagStandingOrders',[
      'Projects remain isolated by namespace and customer data.',
      'Experimental capabilities require Captain approval before promotion.',
      'Waived fees remain in a separate Captain-only ledger.',
      'Destructive authority requires explicit Captain confirmation.'
    ]);
  }

  function open(section){
    if(!workspace||!body)return;
    document.getElementById('captainFleetChart')?.classList.add('hidden');
    document.getElementById('captainGlobalExit')?.classList.add('hidden');
    workspace.classList.remove('hidden');
    workspace.setAttribute('aria-hidden','false');
    document.body.classList.add('captain-command-open');
    document.querySelectorAll('[data-captain-command]').forEach(b=>b.classList.toggle('active',b.dataset.captainCommand===section));
    render(section);
  }

  function closeWorkspace(){
    workspace?.classList.add('hidden');
    workspace?.setAttribute('aria-hidden','true');
    document.body.classList.remove('captain-command-open');
    const quarters=document.getElementById('captainQuarters');
    if(quarters && !quarters.classList.contains('hidden')) document.getElementById('captainGlobalExit')?.classList.remove('hidden');
  }

  async function render(section){
    const names={
      cargo:["Cargo Hold","AI Workshop & Innovation"],
      shipyard:["Shipyard","New Vessel Development"],
      powder:["Powder Keg","Dangerous Authority"],
      blackflag:["Black Flag","Fleet Command Center"],
      log:["Captain's Log","Orders, Notes & History"],
      blueprint:["Ship's Blueprint","Living System Architecture"]
    };
    const [t,s]=names[section]||["Captain Command","Governance"];
    workspace.dataset.section=section;
    title.textContent=t; subtitle.textContent=s;
    if(section==='cargo') return renderCargo();
    if(section==='shipyard') return renderShipyard();
    if(section==='powder') return renderPowder();
    if(section==='blackflag') return renderBlackFlag();
    if(section==='log') return renderLog();
    if(section==='blueprint') return renderBlueprint();
  }


  function renderShipyard(){
    const key='blackFlagShipyardScheduleJoe';
    const defaults={
      mission:'Create a builder-first residential construction scheduling system that reflects how homes are actually built in the field, not merely how calendar software expects work to be entered.',
      coreObject:'WORKING HYPOTHESIS — ScheduleJoe needs one durable build record for each home under construction. Before naming the final object, confirm how the Captain thinks about a house, lot, job, plan, community, and customer relationship in the field.',
      states:'WORKING HYPOTHESIS — A home moves through meaningful construction states, not merely calendar dates. Define the states from dirt to keys and the evidence required before each transition is considered real.',
      movement:'Define what is allowed to move the build: completed work, inspections, material readiness, trade readiness, weather, builder judgment, exceptions, and approved overrides. Dates should reflect these facts rather than replace them.',
      permanentRecord:'Preserve the original baseline, every meaningful revision, actual start/finish dates, delay causes, inspections, overrides, and the Captain’s decisions. Schedule changes must not erase history.',
      roles:'CURRENT DIRECTION — Region is read-only. Division and the Project Manager responsible for the build carry the strongest day-to-day operational authority. Access may span divisions or regions only through an explicit approval process. Visibility scope and authority scope remain separate.',
      organization:'Company → Region → Division → Community → Build / Lot → optional Unit. Company may contain multiple Regions; each Region may contain multiple Divisions; each Division may contain multiple Communities and builds.',
      buildCode:'VISIBLE BUSINESS CODE — RRR-DDD-CC-LLLL[-U]: 3-digit Region + 3-digit Division + 2-digit Community + 4-digit Lot, with an optional 1-digit Unit identifier for multifamily. Example: 101-205-07-0142-3. Every build also receives a separate immutable internal system ID that never changes if business codes or organizational placement change.',
      authorityModel:'REGION — read-only for now. DIVISION — broad operational and administrative authority within its scope. PROJECT MANAGER — strongest day-to-day authority for assigned builds. Cross-Division or cross-Region access is possible only through an explicit approval process. Visibility does not automatically grant change authority.',
      templateModel:'DIVISION may create its own construction schedule templates. COMMUNITY may create or customize templates further because building practices differ by local conditions. Template inheritance must preserve lineage: source, inherited version, local overrides, and effective template for each build. Organizational ownership does not automatically imply permission to alter a template.',
      sequence:[
        'Pre-construction / permits','Site work','Foundation','Framing','Dry-in','Rough trades','Inspections','Insulation','Drywall','Interior trim','Cabinets','Paint','Flooring','Fixtures & finishes','Final inspections','Punch','Closing'
      ],
      prototype:'HELD AT DOCK — Do not build the scheduler until the Build Model, States, Movement Rules, Permanent Record, and Roles / Permissions have been challenged and accepted. Prototype ideas may be captured here without becoming architecture.',
      decisions:"ScheduleJoe remains a Captain's Quarters concept vessel until the Captain commissions it. Engine lessons, primitives, and infrastructure may be reused only after they are evaluated against ScheduleJoe's own mission, users, workflow, data, permissions, and product needs. Nothing is inherited automatically."
    };
    const state={...defaults,...read(key,{})};
    const saveState=()=>write(key,state);
    body.innerHTML=`<section class="captain-command-intro shipyard-intro"><small>CAPTAIN'S SHIPYARD • HULL DESIGN</small><h3>ScheduleJoe</h3><p>Architecture before features. Reality before automation. Stability before polish.</p></section>
      <div class="shipyard-vessel-banner">
        <div><span>VESSEL SJ-01</span><strong>SCHEDULEJOE</strong><small>Residential Construction Scheduling</small></div>
        <div class="shipyard-vessel-state"><b>ARCHITECTURE PHASE</b><small>CAPTAIN + FIRST MATE</small></div>
      </div>
      <section class="schedulejoe-hull-status" aria-label="ScheduleJoe hull design status">
        <div><small>KEEL NOW LOCKING</small><strong>3 FOUNDATION SYSTEMS</strong><span>Organization, authority, and template lineage are being defined before scheduling logic.</span></div>
        <ol class="schedulejoe-keel-three">
          <li><b>01</b><span>Organization</span></li><li><b>02</b><span>Authority</span></li><li><b>03</b><span>Templates</span></li>
        </ol>
      </section>
      <nav class="shipyard-area-tabs schedulejoe-architecture-tabs" aria-label="ScheduleJoe architecture areas">
        <button type="button" data-shipyard-area="mission" class="active">MISSION</button>
        <button type="button" data-shipyard-area="organization">ORGANIZATION</button>
        <button type="button" data-shipyard-area="authority">AUTHORITY</button>
        <button type="button" data-shipyard-area="templates">TEMPLATES</button>
        <button type="button" data-shipyard-area="model">BUILD MODEL</button>
        <button type="button" data-shipyard-area="states">STATES</button>
        <button type="button" data-shipyard-area="movement">MOVEMENT</button>
        <button type="button" data-shipyard-area="record">PERMANENT RECORD</button>
        <button type="button" data-shipyard-area="roles">ROLES</button>
        <button type="button" data-shipyard-area="prototype">PROTOTYPE DECK</button>
        <button type="button" data-shipyard-area="decisions">VESSEL DECISIONS</button>
      </nav>
      <div id="scheduleJoeArea"></div>`;

    const areaHost=document.getElementById('scheduleJoeArea');
    const tabs=[...document.querySelectorAll('[data-shipyard-area]')];
    const field=(label,value,id,help,button='SAVE TO SCHEDULEJOE')=>`<section class="captain-command-card schedulejoe-work-card"><small>${label}</small><textarea id="${id}">${safe(value||'')}</textarea>${help?`<p>${help}</p>`:''}<button type="button" data-sj-save="${id}">${button}</button></section>`;
    const mateTable=(heading,question,warning)=>`<aside class="schedulejoe-first-mate-table"><small>FIRST MATE'S TABLE</small><strong>${heading}</strong><p>${question}</p>${warning?`<span>${warning}</span>`:''}</aside>`;
    const renderArea=(area)=>{
      tabs.forEach(b=>b.classList.toggle('active',b.dataset.shipyardArea===area));
      if(area==='mission'){
        areaHost.innerHTML=`${field('MISSION • WHAT THIS VESSEL MUST SOLVE',state.mission,'sjMission','Keep this builder-first. We are defining the problem, not selling ourselves features.')} ${mateTable('MISSION CHECK','If ScheduleJoe disappeared tomorrow, what specific scheduling pain would the Captain immediately miss it solving?','Do not let “construction software” become the mission.')}<section class="shipyard-guardrail"><strong>SHIPYARD GUARDRAIL</strong><span>Captain's Quarters incubates. The Engine operates commissioned vessels. Engine lessons may be reused here only when ScheduleJoe proves they fit.</span></section>`;
      }else if(area==='organization'){
        areaHost.innerHTML=`<section class="schedulejoe-foundation-grid"><article><small>ORGANIZATION TREE</small><strong>COMPANY → REGION → DIVISION → COMMUNITY → BUILD</strong><p>${safe(state.organization)}</p></article><article><small>VISIBLE BUILD CODE</small><strong>RRR-DDD-CC-LLLL[-U]</strong><p>${safe(state.buildCode)}</p></article></section>${mateTable('FIRST MATE CHECK','Keep the visible business code useful to humans, but never let it become the database identity of the build.','Lot numbers repeat. Communities can be renumbered. Organizations can change. The immutable internal Build ID survives all of that.')} ${field('ORGANIZATION NOTES • REFINEMENTS',state.organization,'sjOrganization','This is the business hierarchy. It should not silently determine permissions or template rights.','SAVE ORGANIZATION MODEL')}`;
      }else if(area==='authority'){
        areaHost.innerHTML=`<section class="schedulejoe-authority-matrix"><header><small>AUTHORITY MATRIX • CURRENT FOUNDATION</small><strong>VISIBILITY ≠ AUTHORITY</strong></header><div class="sj-matrix-row sj-matrix-head"><span>LEVEL / ROLE</span><span>VIEW</span><span>OPERATE</span><span>ADMINISTER</span></div><div class="sj-matrix-row"><b>Company</b><span>Company-wide</span><span>Policy-level later</span><span>Full company scope</span></div><div class="sj-matrix-row"><b>Region</b><span>Region-wide</span><span>READ ONLY</span><span>READ ONLY</span></div><div class="sj-matrix-row"><b>Division</b><span>Division scope</span><span>Broad</span><span>Division scope</span></div><div class="sj-matrix-row"><b>Project Manager</b><span>Assigned builds</span><span>Primary day-to-day</span><span>Build operations</span></div><div class="sj-matrix-row"><b>Cross-scope access</b><span>Approved scope</span><span>As approved</span><span>Approval required</span></div></section>${mateTable('PERMISSION LAW','A person may be granted visibility across Divisions or Regions without inheriting the authority of those organizational levels.','Cross-scope access must leave an approval record: who requested it, who approved it, what scope was granted, and when it expires or is revoked.')} ${field('AUTHORITY NOTES • REFINEMENTS',state.authorityModel,'sjAuthority','Region stays read-only in this architecture phase. Division and the assigned Project Manager remain the operational center.','SAVE AUTHORITY MODEL')}`;
      }else if(area==='templates'){
        areaHost.innerHTML=`<section class="schedulejoe-template-lineage"><small>TEMPLATE LINEAGE</small><strong>LOCAL FLEXIBILITY WITHOUT LOSING ORIGIN</strong><div class="sj-lineage-flow"><span>DIVISION TEMPLATE</span><i>→</i><span>COMMUNITY INHERITS</span><i>→</i><span>COMMUNITY OVERRIDES</span><i>→</i><span>BUILD USES EFFECTIVE VERSION</span></div><p>Every effective schedule should know where its template came from, which version it inherited, what the Community changed, and what version the build actually used.</p></section>${mateTable('TEMPLATE GUARDRAIL','Do not make template inheritance the same thing as organizational authority. A Community may need a local schedule without gaining broader Division administration rights.','Never overwrite the parent template when a Community customizes it. Preserve lineage and explicit overrides so we can compare local practice later.')} ${field('TEMPLATE NOTES • INHERITANCE & OVERRIDES',state.templateModel,'sjTemplates','Division and Community templates are both first-class. Later we can decide whether Company provides optional starter standards without forcing one corporate schedule.','SAVE TEMPLATE MODEL')}`;
      }else if(area==='model'){
        areaHost.innerHTML=`${field('BUILD MODEL • WHAT IS THE CORE BUILD RECORD?',state.coreObject,'sjCoreObject','Now test the build record against the organizational keel rather than inventing it in isolation.')} ${mateTable('MODEL TEST','A Build belongs within the organizational tree, but should its identity survive if a Community is renamed, moved, merged, or its visible lot code changes?','Yes. That is why the immutable Build ID and visible business code must remain separate.')}<section class="schedulejoe-evidence-card"><small>FIELD EVIDENCE • STARTING SPINE, NOT ARCHITECTURE</small><strong>DIRT → KEYS</strong><p>${safe((state.sequence||[]).join(' → '))}</p><em>The sequence is evidence we will use to test the Build Model. It is not yet a locked template.</em></section>`;
      }else if(area==='states'){
        areaHost.innerHTML=`${field('02 • STATES • HOW DOES THE BUILD BECOME DIFFERENT?',state.states,'sjStates','Define meaningful states and what proves a transition occurred. Avoid making every trade task a top-level state.')} ${mateTable('STATE TEST','What must be true in the field before you would confidently tell someone the house has moved into its next phase?','A date alone is not proof that construction advanced.')}`;
      }else if(area==='movement'){
        areaHost.innerHTML=`${field('03 • MOVEMENT RULES • WHAT MAY CHANGE THE SCHEDULE?',state.movement,'sjMovement','Capture dependencies, readiness, inspections, materials, weather, trade availability, exceptions, and Captain judgment before automation.')} ${mateTable('AUTOMATION GUARDRAIL','Which changes should ScheduleJoe merely flag, which may it recommend, and which—if any—could it ever move automatically?','Early versions should recommend consequential moves rather than silently rewriting the build.')}`;
      }else if(area==='record'){
        areaHost.innerHTML=`${field('04 • PERMANENT RECORD • WHAT MUST NEVER DISAPPEAR?',state.permanentRecord,'sjPermanentRecord','The schedule must preserve the promise, the reality, and why they diverged.')} ${mateTable('TRUTH TEST','Six months after closing, what would we need to reconstruct exactly what was planned, what happened, and why?','Never “fix” a late schedule by erasing the original baseline.')}`;
      }else if(area==='roles'){
        areaHost.innerHTML=`${field('05 • ROLES / PERMISSIONS • WHO MAY DO WHAT?',state.roles,'sjRoles','Define authority before building user screens. Start with real people and responsibilities, not software role names.')} ${mateTable('AUTHORITY TEST','Who may observe, recommend, change, approve, or override the build schedule—and whose decision is final when the field disagrees with the software?','Permissions added after the fact become leaks and workarounds.')}`;
      }else if(area==='prototype'){
        areaHost.innerHTML=`<section class="schedulejoe-dock-hold"><small>PROTOTYPE DECK • HELD AT DOCK</small><strong>NO SAILING BEFORE THE HULL IS SOUND</strong><p>We can capture prototype ideas here, but none become approved product architecture until the five core hull decisions have been challenged and accepted.</p></section>${field('PROTOTYPE NOTES • IDEAS, NOT COMMITMENTS',state.prototype,'sjPrototype','Useful ideas belong here so we do not lose them. They are deliberately separated from architecture decisions.','SAVE PROTOTYPE NOTES')}`;
      }else{
        areaHost.innerHTML=`${field('VESSEL DECISIONS • ARCHITECTURE & BOUNDARIES',state.decisions,'sjDecisions','Record accepted laws of the vessel, deliberate Dark Sky reuse, and boundaries that must remain separate.')}<section class="shipyard-commissioning-note"><small>COMMISSIONING STATUS</small><strong>NOT YET AN ENGINE VESSEL</strong><p>No project registry entry, customer workflow, deployment manifest, or production data namespace has been created.</p></section>`;
      }
      areaHost.querySelectorAll('[data-sj-save]').forEach(btn=>btn.onclick=()=>{
        const id=btn.dataset.sjSave;
        const el=document.getElementById(id);
        if(!el)return;
        if(id==='sjMission')state.mission=el.value.trim();
        if(id==='sjOrganization')state.organization=el.value.trim();
        if(id==='sjAuthority')state.authorityModel=el.value.trim();
        if(id==='sjTemplates')state.templateModel=el.value.trim();
        if(id==='sjCoreObject')state.coreObject=el.value.trim();
        if(id==='sjStates')state.states=el.value.trim();
        if(id==='sjMovement')state.movement=el.value.trim();
        if(id==='sjPermanentRecord')state.permanentRecord=el.value.trim();
        if(id==='sjRoles')state.roles=el.value.trim();
        if(id==='sjPrototype')state.prototype=el.value.trim();
        if(id==='sjDecisions')state.decisions=el.value.trim();
        saveState();
        audit('ScheduleJoe shipyard note saved',area);
        const prior=btn.textContent;btn.textContent='SAVED';window.setTimeout(()=>btn.textContent=prior,900);
      });
    };
    tabs.forEach(btn=>btn.onclick=()=>renderArea(btn.dataset.shipyardArea));
    renderArea('mission');
  }

  function renderCargo(){
    const stages=[
      ["IDEA","Capture a capability worth exploring."],
      ["PROTOTYPE","Build without exposing it to customers."],
      ["SEA TRIAL","Validate behavior and project isolation."],
      ["APPROVED","Captain accepts it for operational use."],
      ["ENGINE CAPABILITY","First Mate may deploy it through the Engine."]
    ];
    body.innerHTML=`<section class="captain-command-intro"><small>INNOVATION PIPELINE</small><h3>From experiment to Engine capability</h3><p>Nothing experimental silently becomes operational.</p></section>
      <div class="captain-stage-grid">${stages.map((x,i)=>`<article><span>STAGE ${i+1}</span><strong>${x[0]}</strong><p>${x[1]}</p></article>`).join('')}</div>
      <section class="captain-command-card"><h3>Workshop Log</h3><p>AI recognition, design intelligence, layout tools, reusable workflow components, and future experiments berth here before promotion.</p>
      <label>New workshop note<textarea id="captainCargoNote" placeholder="Describe an idea, experiment or reusable capability…"></textarea></label>
      <button id="captainCargoSave" type="button">ADD TO WORKSHOP LOG</button>
      <div id="captainCargoNotes" class="captain-note-list"></div></section>`;
    const draw=()=>{
      const notes=read('blackFlagCargoNotes',[]);
      document.getElementById('captainCargoNotes').innerHTML=notes.length?notes.map(n=>`<div><strong>${safe(new Date(n.at).toLocaleDateString())}</strong><span>${safe(n.text)}</span></div>`).join(''):'<p class="captain-empty">No workshop notes yet.</p>';
    };
    document.getElementById('captainCargoSave').onclick=()=>{
      const input=document.getElementById('captainCargoNote');
      const text=input.value.trim(); if(!text)return;
      const notes=read('blackFlagCargoNotes',[]);notes.unshift({at:new Date().toISOString(),text});write('blackFlagCargoNotes',notes.slice(0,100));
      audit('Cargo Hold note added',text);input.value='';draw();
    };
    draw();
  }

  function renderPowder(){
    const groups=[
      {
        key:'platform',
        label:'PLATFORM AUTHORITY',
        description:'High-level business relationship and platform access decisions.',
        actions:[
          {title:'Business Relationship Authority',description:'Approve, suspend, end, or restore a business relationship while preserving business-owned records.',type:'business_relationship'}
        ]
      },
      {
        key:'recovery',
        label:'RECOVERY AUTHORITY',
        description:'Controlled recovery actions. These do not imply deletion.',
        actions:[
          {title:'Emergency Project Disable',description:'Prepare a controlled operational stop without deleting project records.',type:'review_only'},
          {title:'Protected Credential Reset',description:'Reset protected access after recovery checks.',type:'review_only'},
          {title:'Restore / Overwrite Data',description:'Replace stored state from a known recovery point.',type:'review_only'},
          {title:'Financial Correction',description:'Create a Captain-authorized correction trail without rewriting ordinary ledger history.',type:'review_only'}
        ]
      },
      {
        key:'destructive',
        label:'DESTRUCTIVE AUTHORITY',
        description:'Irreversible or boundary-changing operations. Deliberately separated from normal governance.',
        actions:[
          {title:'Isolation Override',description:'Change a protected namespace boundary for deliberate recovery work.',type:'review_only'},
          {title:'Permanent Project Purge',description:'Irreversibly remove a project and its owned records. Ending a business relationship never performs this action.',type:'review_only',danger:true}
        ]
      }
    ];

    body.innerHTML=`<div class="captain-danger-banner">
        <strong>CAPTAIN AUTHORITY ONLY</strong>
        <p>Business relationship decisions are separated from data destruction. Ending service preserves project, order, ledger, customer, marketing, and audit records.</p>
      </div>
      <div class="powder-authority-groups">
        ${groups.map((g,gi)=>`<section class="powder-authority-group ${g.key}">
          <header><div><small>${g.label}</small><h3>${g.label.replace(' AUTHORITY','')}</h3></div><p>${g.description}</p></header>
          <div class="powder-authority-cards">
            ${g.actions.map((a,ai)=>`<article class="${a.danger?'powder-destructive-card':''}">
              <h3>${a.title}</h3><p>${a.description}</p>
              <button type="button" data-powder-group="${gi}" data-powder-action="${ai}">${a.type==='business_relationship'?'OPEN CONSOLE':'REVIEW AUTHORITY'}</button>
            </article>`).join('')}
          </div>
        </section>`).join('')}
      </div>
      <section id="captainPowderReview" class="captain-command-card powder-workspace">
        <div class="powder-empty-state"><small>POWDER KEG WORKSPACE</small><h3>Select an authority above.</h3><p>Only Business Relationship Authority is operational in this release. Other high-consequence controls remain review-only until a tested recovery path exists.</p></div>
      </section>`;

    async function renderBusinessConsole(selectedId=''){
      const panel=document.getElementById('captainPowderReview');
      const snap=await snapshot();
      const projects=snap.projects||[];
      const approved=projects.filter(p=>(p.platformStatus||'approved')==='approved').length;
      const suspended=projects.filter(p=>p.platformStatus==='suspended').length;
      const ended=projects.filter(p=>p.platformStatus==='relationship_ended'||p.platformStatus==='refused').length;

      panel.innerHTML=`<div class="business-admission-console">
        <header class="business-console-head">
          <div><small>PLATFORM AUTHORITY</small><h3>Business Relationship Console</h3><p>Captain decides who Black Flag does business with. Relationship decisions preserve business-owned information.</p></div>
          <div class="business-console-metrics">
            <span><strong>${projects.length}</strong> Businesses</span>
            <span><strong>${approved}</strong> Approved</span>
            <span><strong>${suspended}</strong> Suspended</span>
            <span><strong>${ended}</strong> Ended</span>
          </div>
        </header>
        <div class="business-console-layout">
          <div class="business-registry">
            <div class="business-registry-head"><strong>Business Registry</strong><span>${projects.length} total</span></div>
            ${projects.map(p=>{
              const status=p.platformStatus==='refused'?'relationship_ended':(p.platformStatus||'approved');
              const deployments=p.deployments||[];
              const active=deployments.filter(d=>d.state==='deployed').length;
              return `<button type="button" class="business-registry-row ${selectedId===p.id?'selected':''}" data-business-select="${safe(p.id)}">
                <div><small>${safe(p.code)}</small><strong>${safe(p.name)}</strong><span>${safe(p.ownerName||'Owner not claimed')}</span></div>
                <div><span class="captain-platform-state ${safe(status)}">${safe(status==='relationship_ended'?'RELATIONSHIP ENDED':status.toUpperCase())}</span><small>${active} active deployment${active===1?'':'s'}</small></div>
              </button>`;
            }).join('')}
          </div>
          <div id="businessDecisionPanel" class="business-decision-panel">
            <div class="powder-empty-state"><small>BUSINESS REVIEW</small><h3>Select a business.</h3><p>Review owner, project, deployment, platform status, and relationship history before making a Captain decision.</p></div>
          </div>
        </div>
      </div>`;

      panel.querySelectorAll('[data-business-select]').forEach(btn=>btn.onclick=()=>renderBusinessConsole(btn.dataset.businessSelect));

      if(selectedId){
        const p=projects.find(x=>x.id===selectedId);
        const decision=document.getElementById('businessDecisionPanel');
        if(!p||!decision)return;
        const status=p.platformStatus==='refused'?'relationship_ended':(p.platformStatus||'approved');
        const deployments=p.deployments||[];
        const history=Array.isArray(p.governanceHistory)?p.governanceHistory:[];
        decision.innerHTML=`<div class="business-review-head">
            <div><small>${safe(p.code)}</small><h3>${safe(p.name)}</h3><p>${safe(p.ownerName||'Owner not claimed')}${p.ownerEmail?` • ${safe(p.ownerEmail)}`:''}</p></div>
            <span class="captain-platform-state ${safe(status)}">${safe(status==='relationship_ended'?'RELATIONSHIP ENDED':status.toUpperCase())}</span>
          </div>
          <div class="business-review-facts">
            <div><span>PROJECT STATUS</span><strong>${safe(String(p.status||'active').toUpperCase())}</strong></div>
            <div><span>PUBLICATION</span><strong>${safe(String(p.publishStatus||'development').toUpperCase())}</strong></div>
            <div><span>OWNER ACCESS</span><strong>${safe(String(p.ownerStatus||'not_claimed').replace(/_/g,' ').toUpperCase())}</strong></div>
            <div><span>DEPLOYMENTS</span><strong>${deployments.length}</strong></div>
          </div>
          <label class="business-reason-label">Captain reason
            <textarea id="captainGovernanceReason" placeholder="Required for Suspend or End Relationship…"></textarea>
          </label>
          <div class="captain-governance-actions">
            <button type="button" data-platform-decision="approved">APPROVE / RESTORE</button>
            <button type="button" data-platform-decision="suspended">SUSPEND</button>
            <button type="button" data-platform-decision="relationship_ended">END RELATIONSHIP / REFUSE SERVICE</button>
          </div>
          <p class="captain-governance-warning"><strong>Record preservation:</strong> Suspend or End Relationship removes public operation and returns active deployments to harbor. It does not delete or rewrite the business's project, orders, ledger, customers, marketing, or audit history.</p>
          <section class="business-history">
            <div class="business-history-head"><strong>Captain Decision History</strong><span>${history.length} event${history.length===1?'':'s'}</span></div>
            ${history.length?history.map(h=>`<article><div><strong>${safe((h.nextStatus==='relationship_ended'?'RELATIONSHIP ENDED':String(h.nextStatus||'').toUpperCase()))}</strong><small>${safe(new Date(h.at).toLocaleString())}</small></div><p>${safe(h.reason||'No reason recorded')}</p></article>`).join(''):'<p class="captain-empty">No Captain relationship decisions recorded yet.</p>'}
          </section>`;

        decision.querySelectorAll('[data-platform-decision]').forEach(button=>button.onclick=async()=>{
          const next=button.dataset.platformDecision;
          const reason=String(document.getElementById('captainGovernanceReason')?.value||'').trim();
          if(next!=='approved'&&!reason){
            alert('Captain reason is required for Suspend or End Relationship.');
            return;
          }
          const verb=next==='approved'?'APPROVE / RESTORE':next==='suspended'?'SUSPEND':'END RELATIONSHIP / REFUSE SERVICE';
          const consequence=next==='approved'
            ? 'This restores platform relationship status. Deployment activation remains an Engine responsibility.'
            : 'Public operation will stop and active deployments will return to harbor. Business-owned records will be preserved.';
          if(!confirm(`${verb} — ${p.name}?\\n\\n${consequence}`))return;

          const result=await window.blackFlagCaptainSetPlatformStatus?.(p.id,next,reason);
          if(!result?.ok){
            alert(result?.error||'Captain decision could not be completed.');
            return;
          }
          audit('Captain business relationship decision',`${p.name}: ${result.previous} → ${next}${reason?' • '+reason:''}`);
          await renderBusinessConsole(p.id);
        });
      }
    }

    document.querySelectorAll('[data-powder-group][data-powder-action]').forEach(btn=>btn.onclick=async()=>{
      const group=groups[Number(btn.dataset.powderGroup)];
      const action=group?.actions?.[Number(btn.dataset.powderAction)];
      const panel=document.getElementById('captainPowderReview');
      if(!action||!panel)return;

      if(action.type==='business_relationship'){
        await renderBusinessConsole();
        return;
      }

      panel.innerHTML=`<div class="powder-review-only ${action.danger?'destructive':''}">
        <small>${safe(group.label)}</small><h3>${safe(action.title)}</h3><p>${safe(action.description)}</p>
        <div class="powder-safety-state"><strong>REVIEW ONLY</strong><span>No execution path is wired in this release.</span></div>
        <button id="captainPowderAcknowledge" type="button">ACKNOWLEDGE REVIEW</button>
      </div>`;
      document.getElementById('captainPowderAcknowledge').onclick=()=>{
        audit('Powder Keg authority reviewed',action.title);
        panel.insertAdjacentHTML('beforeend','<p class="captain-ok">Review recorded in Captain audit history.</p>');
      };
    });
  }

  function renderHighWatch(intel=[]){
    const top=intel[0]||null;
    const counts={
      critical:intel.filter(x=>x.level==='critical').length,
      high:intel.filter(x=>x.level==='high').length,
      action:intel.filter(x=>x.level==='action').length,
      watch:intel.filter(x=>x.level==='watch').length,
      clear:intel.filter(x=>x.level==='clear').length
    };
    const fleetState=counts.critical?'CRITICAL':counts.high?'HIGH PRIORITY':counts.action?'ACTION REQUIRED':counts.watch?'WATCH':'CLEAR';
    const fleetClass=counts.critical?'critical':counts.high?'high':counts.action?'action':counts.watch?'watch':'clear';
    const levelLabel=(level)=>({critical:'CRITICAL',high:'HIGH PRIORITY',action:'ACTION REQUIRED',watch:'WATCH',clear:'CLEAR'}[level]||String(level||'clear').toUpperCase());
    return `<section class="captain-command-card high-watch-board easy-bearing-board">
      <div class="high-watch-head"><div><small>DARK SKY 4.3.7 • SHOWROOM RESTORE</small><h3>Fleet Intelligence</h3><p>One prioritized operating picture across the admitted fleet. Read-only in Captain's Quarters.</p></div><strong class="${fleetClass}">${safe(fleetState)}</strong></div>
      <div class="high-watch-kpis easy-bearing-kpis"><span><b>${counts.critical}</b> critical</span><span><b>${counts.high}</b> high priority</span><span><b>${counts.action}</b> action required</span><span><b>${counts.watch}</b> watch</span><span><b>${counts.clear}</b> clear</span></div>
      ${top?`<article class="high-watch-lead ${safe(top.level)}"><small>HIGHEST PRIORITY • SCORE ${Number(top.score||0)}</small><strong>${safe(top.projectName)}</strong><span>${safe(top.next)}</span><p>${safe((top.reasons||[]).join(' • ')||'No active concern.')}</p></article>`:''}
      <div class="high-watch-fleet">${intel.map(x=>`<details class="high-watch-vessel ${safe(x.level)}"><summary><span><small>${safe(x.code||'VESSEL')} • ${safe(x.launchLabel||'')}</small><strong>${safe(x.projectName)}</strong></span><span><b>${Number(x.score||0)}</b><small>${safe(levelLabel(x.level))}</small></span></summary><div><p>${safe((x.reasons||[]).join(' • ')||'No active concern.')}</p><ul><li>${Number(x.open||0)} open orders</li><li>${Number(x.customers||0)} retained customers</li><li>${Number(x.offers||0)} customer-ready offers</li><li>${Number(x.activeDeployments||0)} active deployments</li></ul><strong>Next move: ${safe(x.next||'Maintain course')}</strong></div></details>`).join('')}</div>
      <section class="cq-spyglass-search high-watch-search easy-bearing-search">
        <div><small>DARK SKY 4.3.7 • COMMAND FIND</small><h4>Find anything in the fleet</h4><p>Start typing a project, order number, customer, phone, email, or a phrase like “open Ike orders.” Results update automatically and never change production data.</p></div>
        <div class="easy-bearing-filter" role="group" aria-label="Search type">
          <button type="button" data-command-search-type="all" class="active">All</button>
          <button type="button" data-command-search-type="project">Projects</button>
          <button type="button" data-command-search-type="order">Orders</button>
          <button type="button" data-command-search-type="customer">Customers</button>
        </div>
        <div class="easy-bearing-input-wrap"><input id="captainCommandSearchInput" placeholder="Search project, order #, customer, phone, or email" autocomplete="off" enterkeyhint="search"><button id="captainCommandSearchClear" type="button" aria-label="Clear search">CLEAR</button></div>
        <div class="easy-bearing-suggestions"><button type="button" data-command-suggestion="open orders">Open orders</button><button type="button" data-command-suggestion="Ike">Ike's</button><button type="button" data-command-suggestion="Becca">Becca</button><button type="button" data-command-suggestion="Grizzly">Grizzly</button></div>
        <div id="captainCommandSearchResults" class="cq-spyglass-results easy-bearing-results"><span>Type two characters and Showroom Restore will find the best matches.</span></div>
      </section>
    </section>`;
  }

  async function renderBlackFlag(){
    const snap=await snapshot();
    const projects=snap.projects||[];
    const intel=await window.blackFlagFleetIntelligenceData?.()||[];
    const operating=projects.filter(p=>p.publishStatus==='live'||p.status==='active').length;
    const future=projects.filter(p=>p.status==='future').length;
    const priv=projects.filter(p=>p.publishStatus!=='live').length;
    const attention=projects.filter(p=>(p.deployments||[]).some(d=>d.state==='paused'||d.state==='sea_trial')).length;
    body.innerHTML=`<div class="captain-metric-row">
      <article><span>VESSELS</span><strong>${projects.length}</strong></article>
      <article><span>OPERATING</span><strong>${operating}</strong></article>
      <article><span>TEST / PRIVATE</span><strong>${priv}</strong></article>
      <article><span>ATTENTION</span><strong>${attention}</strong></article>
    </div>
    <section class="captain-command-card"><h3>Fleet Command</h3><p>Captain-level state of the fleet. Project configuration remains in the Engine Room.</p>
      <div class="captain-fleet-list">${projects.length?projects.map(p=>{
        const deployments=p.deployments||[];const sailing=deployments.filter(d=>d.state==='deployed').length;const harbor=deployments.filter(d=>d.state==='paused').length;const trials=deployments.filter(d=>d.state==='sea_trial').length;
        return `<article><div><span>${safe(p.code)}</span><strong>${safe(p.name)}</strong><small>${safe(p.publishStatus)} • ${safe(p.status)} • PLATFORM ${safe((p.platformStatus==='relationship_ended'||p.platformStatus==='refused')?'RELATIONSHIP ENDED':(p.platformStatus||'approved').toUpperCase())} • OWNER ${safe((p.ownerStatus||'not_claimed').replace(/_/g,' ').toUpperCase())}</small></div><div><b>${sailing} sailing</b>${harbor?`<small>${harbor} in harbor</small>`:''}${trials?`<small>${trials} sea trial</small>`:''}</div></article>`;
      }).join(''):'<p class="captain-empty">No project snapshot available.</p>'}</div>
    </section>
    ${renderHighWatch(intel)}
    <section class="captain-command-card"><h3>Command Boundary</h3><p>Black Flag tells the Captain what is happening. The Engine Room remains where the First Mate changes project machinery.</p></section>
    ${renderBroadsideCommand(projects)}`;
    bindBroadsideCommand(projects);
  }

  function renderBroadsideCommand(projects=[]){
    if(!window.DarkSkyV4)return '';
    const fleet=window.blackFlagV4Projects?.()||[];
    const st=window.DarkSkyV4.status(fleet),brief=window.DarkSkyV4.commandBrief?.(fleet)||{priorities:[]};
    const ring=st.release?.currentRing||'captain', labs=window.DarkSkyV4.labs().slice(0,6), vault=window.DarkSkyV4.recoveryVault().slice(0,4), blackbox=window.DarkSkyV4.diagnostics().slice(0,4), bb=window.DarkSkyV4.blackBoxHealth?.()||st.blackBoxHealth||{}, flags=window.DarkSkyV4.featureFlags();
    const priorityHtml=(brief.priorities||[]).map(x=>`<article class="cq-full-sail-priority ${safe(x.level)}"><span>${safe(String(x.level).toUpperCase())}</span><strong>${safe(x.title)}</strong><small>${safe(x.detail)}</small></article>`).join('');
    const queue=window.DarkSkyV4.implementationQueue?.()||[];
    const labHtml=labs.length?labs.map(x=>`<article class="cq-lab-row high-watch-lab"><div><strong>${safe(x.projectName)}</strong><small>${safe((x.category||'general').toUpperCase())} • RISK ${safe((x.risk||'low').toUpperCase())} • ${safe(x.state.toUpperCase())}</small><p>${safe(x.brief||'No brief')}</p>${x.objective?`<span><b>Objective:</b> ${safe(x.objective)}</span>`:''}${x.successCriteria?`<span><b>Success:</b> ${safe(x.successCriteria)}</span>`:''}</div><div>${x.state==='sandbox'?`<button data-v4-lab="${safe(x.id)}" data-state="candidate">MARK CANDIDATE</button>`:''}${x.state==='candidate'?`<button data-v4-lab="${safe(x.id)}" data-state="promoted">APPROVE PLAN</button>`:''}${x.state==='promoted'?`<button data-v4-queue="${safe(x.id)}">SEND TO ENGINE</button>`:''}${!['rejected','promoted'].includes(x.state)?`<button data-v4-lab="${safe(x.id)}" data-state="rejected">RETIRE</button>`:''}</div></article>`).join(''):'<p class="captain-empty">No active experiments yet.</p>';
    const flagKeys=['command_search','attention_center','workflow_engine'];
    return `<section class="captain-command-card v4-captain-broadside full-sail-captain">
      <div class="v4-captain-head"><div><small>DARK SKY 4.3.7 • SHOWROOM RESTORE</small><h3>Captain's Command Brief</h3><p>Fleet posture, controlled experimentation, release discipline, and platform memory in one command surface.</p></div><strong class="${st.preflight.ok?'clear':'attention'}">${st.preflight.ok?'EASY BEARING':'REVIEW'}</strong></div>
      <div class="v4-captain-metrics"><span><b>${fleet.length}</b> admitted vessels</span><span><b>${st.recoveryPoints}</b> recovery points</span><span><b>${bb.currentSessionFaults||0}</b> current-session Black Box faults</span><span><b>${st.decisions}</b> decisions</span></div>
      <div class="cq-full-sail-grid"><section><h4>Captain priorities</h4><div class="cq-full-sail-priorities">${priorityHtml}</div></section><section><h4>Release & recovery</h4><div class="v4-release-rings"><label>Release ring<select id="captainV4ReleaseRing">${['captain','private','selected_live','fleet'].map(x=>`<option value="${x}" ${x===ring?'selected':''}>${x.replaceAll('_',' ').toUpperCase()}</option>`).join('')}</select></label><button id="captainV4RecoveryPoint" type="button">SEAL RECOVERY POINT</button></div><div class="cq-vault-mini">${vault.length?vault.map(x=>`<span><b>${safe(x.id)}</b>${safe(new Date(x.at).toLocaleString())}</span>`).join(''):'<span>No recovery points yet.</span>'}</div></section></div>
      <div class="cq-full-sail-grid"><section><h4>Captain Lab Board</h4><div class="lab-template-row"><button type="button" data-lab-template="customer">CUSTOMER FLOW</button><button type="button" data-lab-template="pricing">PRICING</button><button type="button" data-lab-template="brand">BRAND</button><button type="button" data-lab-template="operations">OPERATIONS</button></div><div class="v4-captain-lab high-watch-lab-create"><label>Vessel<select id="captainV4LabProject"><option value="">Select vessel…</option>${projects.map(p=>`<option value="${safe(p.projectId||p.id||'')}">${safe(p.name)}</option>`).join('')}</select></label><label>Category<select id="captainV4LabCategory"><option value="general">General</option><option value="customer_flow">Customer flow</option><option value="pricing">Pricing</option><option value="brand">Brand</option><option value="operations">Operations</option></select></label><label>Risk<select id="captainV4LabRisk"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Experiment brief<input id="captainV4LabBrief" placeholder="What are we trying?"></label><label>Objective<input id="captainV4LabObjective" placeholder="What should improve?"></label><label>Success criteria<input id="captainV4LabSuccess" placeholder="What proves this worked?"></label><button id="captainV4CreateLab" type="button">CREATE SANDBOX</button></div><div class="cq-lab-board">${labHtml}</div><div class="implementation-queue"><small>ENGINE IMPLEMENTATION QUEUE</small><strong>${queue.filter(x=>x.status!=='closed').length} request${queue.filter(x=>x.status!=='closed').length===1?'':'s'}</strong>${queue.filter(x=>x.status!=='closed').slice(0,3).map(x=>`<span>${safe(x.projectName)} • ${safe(x.category||'general')} • ${safe(x.status.toUpperCase())}</span>`).join('')}</div></section><section><h4>Controlled capabilities</h4><div class="cq-feature-flags">${flagKeys.map(k=>`<label><span><strong>${safe(k.replaceAll('_',' ').toUpperCase())}</strong><small>${safe(flags[k]?.scope||'fleet')} • ${safe(flags[k]?.ring||'stable')}</small></span><input type="checkbox" data-v4-flag="${k}" ${flags[k]?.enabled?'checked':''}></label>`).join('')}</div><h4>Black Box <small>${safe((bb.status||'clear').toUpperCase())} • ${Number(bb.uniqueEvents||0)} unique / ${Number(bb.occurrences||0)} occurrences</small></h4><div class="cq-blackbox-mini">${blackbox.length?blackbox.map(x=>`<span><b>${safe(x.type)}${Number(x.occurrences||1)>1?` ×${Number(x.occurrences||1)}`:''}</b>${safe(x.detail||'event')}<small>${safe(new Date(x.lastSeen||x.at).toLocaleString())}</small></span>`).join(''):'<span>No diagnostic events retained.</span>'}</div></section></div>
      <p class="v4-boundary-note"><b>CAPTAIN BOUNDARY:</b> Labs and approvals never write production project machinery. Engine execution remains separately authorized and auditable.</p>
    </section>`;
  }

  function bindBroadsideCommand(projects=[]){
    const ring=document.getElementById('captainV4ReleaseRing');
    if(ring)ring.onchange=()=>{try{window.DarkSkyV4.setReleaseRing(ring.value,'Captain changed rollout ring');audit('V4 release ring changed',ring.value)}catch(err){alert(err.message)}};
    const rec=document.getElementById('captainV4RecoveryPoint');
    if(rec)rec.onclick=()=>{try{const rows=window.blackFlagV4Projects?.()||[];const r=window.DarkSkyV4.recoveryPoint(rows,'captain-manual-v4');audit('V4 recovery point sealed',r.id);renderBlackFlag();}catch(err){alert(err.message)}};
    const create=document.getElementById('captainV4CreateLab');
    if(create)create.onclick=()=>{try{const id=document.getElementById('captainV4LabProject')?.value||'';const p=window.blackFlagV4ProjectById?.(id);if(!p){alert('Select a vessel for the experiment.');return;}const brief=document.getElementById('captainV4LabBrief')?.value||'';const options={objective:document.getElementById('captainV4LabObjective')?.value||'',successCriteria:document.getElementById('captainV4LabSuccess')?.value||'',risk:document.getElementById('captainV4LabRisk')?.value||'low',category:document.getElementById('captainV4LabCategory')?.value||'general'};const lab=window.DarkSkyV4.labCreate(p,brief,options);audit('Captain Lab sandbox created',`${p.name} • ${lab.id}`);renderBlackFlag();}catch(err){alert(err.message)}};
    document.querySelectorAll('[data-lab-template]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.labTemplate;const templates={customer:{category:'customer_flow',brief:'Prototype a cleaner customer ordering journey',objective:'Reduce friction while preserving required project data',success:'Customer can complete the flow with fewer confusing steps and no loss of validation'},pricing:{category:'pricing',brief:'Prototype a clearer pricing model',objective:'Make pricing understandable before checkout',success:'Price is explainable, project-scoped, and matches the configured offer'},brand:{category:'brand',brief:'Prototype a stronger project-specific brand experience',objective:'Increase identity without cross-project branding leakage',success:'Branding is unmistakably project-specific and all isolation checks remain clear'},operations:{category:'operations',brief:'Prototype a faster admin operating workflow',objective:'Reduce touches required to move work from new to completed',success:'Fewer admin steps with status, audit, and customer data preserved'}};const t=templates[key];if(!t)return;const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};set('captainV4LabCategory',t.category);set('captainV4LabBrief',t.brief);set('captainV4LabObjective',t.objective);set('captainV4LabSuccess',t.success)});
    document.querySelectorAll('[data-v4-lab]').forEach(btn=>btn.onclick=()=>{try{window.DarkSkyV4.labMark(btn.dataset.v4Lab,btn.dataset.state,'Captain Showroom Restore review');audit('Captain Lab state changed',`${btn.dataset.v4Lab} → ${btn.dataset.state}`);renderBlackFlag();}catch(err){alert(err.message)}});
    document.querySelectorAll('[data-v4-queue]').forEach(btn=>btn.onclick=()=>{try{const row=window.DarkSkyV4.queueImplementation(btn.dataset.v4Queue);audit('Captain implementation request queued',`${row.projectName} • ${row.id}`);renderBlackFlag();}catch(err){alert(err.message)}});
    document.querySelectorAll('[data-v4-flag]').forEach(input=>input.onchange=()=>{try{window.DarkSkyV4.setFeatureFlag(input.dataset.v4Flag,{enabled:input.checked});audit('V4 feature flag changed',`${input.dataset.v4Flag} → ${input.checked?'on':'off'}`);renderBlackFlag();}catch(err){input.checked=!input.checked;alert(err.message)}});
    const searchInput=document.getElementById('captainCommandSearchInput');
    const searchHost=document.getElementById('captainCommandSearchResults');
    const searchClear=document.getElementById('captainCommandSearchClear');
    const filterButtons=[...document.querySelectorAll('[data-command-search-type]')];
    let searchType='all';
    try{searchType=sessionStorage.getItem('darkSkyCaptainSearchType')||'all'}catch(_){ }
    if(!['all','project','order','customer'].includes(searchType))searchType='all';
    const setFilter=(type)=>{
      searchType=type;
      filterButtons.forEach(b=>b.classList.toggle('active',b.dataset.commandSearchType===type));
      try{sessionStorage.setItem('darkSkyCaptainSearchType',type)}catch(_){ }
    };
    setFilter(searchType);
    const escapeRegExp=(v)=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const highlight=(value,terms=[])=>{
      let text=safe(String(value??''));
      [...new Set(terms.filter(t=>t.length>1))].sort((a,b)=>b.length-a.length).forEach(term=>{
        const re=new RegExp(`(${escapeRegExp(safe(term))})`,'ig');
        text=text.replace(re,'<mark>$1</mark>');
      });
      return text;
    };
    const parseIntent=(raw)=>{
      const lower=String(raw||'').trim().toLowerCase();
      let inferred=searchType;
      if(searchType==='all'){
        if(/\borders?\b/.test(lower))inferred='order';
        else if(/\bcustomers?|people|phone|email\b/.test(lower))inferred='customer';
        else if(/\bprojects?|vessels?\b/.test(lower))inferred='project';
      }
      const wantsOpen=/\b(open|new|active|working|ready)\b/.test(lower);
      const wantsCompleted=/\b(completed|complete|finished|closed)\b/.test(lower);
      const stop=new Set(['find','show','me','the','a','an','all','project','projects','vessel','vessels','order','orders','customer','customers','open','new','active','working','ready','completed','complete','finished','closed']);
      const terms=lower.split(/\s+/).map(x=>x.replace(/[^a-z0-9@.+_-]/g,'')).filter(x=>x&& !stop.has(x));
      return {raw:lower,type:inferred,terms,wantsOpen,wantsCompleted};
    };
    const scoreHit=(row,intent)=>{
      const blob=`${row.type} ${row.id} ${row.title} ${row.detail} ${row.projectId}`.toLowerCase();
      if(intent.terms.some(t=>!blob.includes(t)))return -1;
      if(intent.type!=='all'&&row.type!==intent.type)return -1;
      if(intent.wantsCompleted&&row.type==='order'&&!/completed|complete|finished|closed/.test(String(row.detail).toLowerCase()))return -1;
      if(intent.wantsOpen&&row.type==='order'&&/completed|complete|finished|closed/.test(String(row.detail).toLowerCase()))return -1;
      let score=0;
      for(const t of intent.terms){
        const title=String(row.title||'').toLowerCase(),id=String(row.id||'').toLowerCase(),pid=String(row.projectId||'').toLowerCase();
        if(title===t||id===t)score+=100;
        else if(title.startsWith(t)||id.startsWith(t))score+=55;
        else if(title.includes(t)||id.includes(t))score+=35;
        if(pid.includes(t))score+=20;
      }
      if(row.type==='project')score+=8;
      return score;
    };
    const visibleLimits={project:4,order:6,customer:5};
    const expandedGroups=new Set();
    const actionLabel=(type)=>type==='order'?'VIEW ORDER':type==='customer'?'OPEN PROJECT':'OPEN PROJECT';
    const renderHits=(hits,intent)=>{
      if(!searchHost)return;
      if(!hits.length){searchHost.innerHTML='<div class="easy-bearing-empty"><strong>No fleet matches.</strong><span>Try a project name, customer, order number, phone, or email.</span></div>';return;}
      const groups=[['project','Projects'],['order','Orders'],['customer','Customers']];
      const body=groups.map(([type,label])=>{
        const rows=hits.filter(x=>x.type===type);if(!rows.length)return '';
        const expanded=expandedGroups.has(type);
        const shown=expanded?rows:rows.slice(0,visibleLimits[type]||6);
        const more=rows.length-shown.length;
        return `<section class="easy-bearing-group" data-result-group="${type}"><header><strong>${label}</strong><span>${rows.length}</span></header><div>${shown.map(r=>`<article class="easy-bearing-result ${safe(r.type)}" data-command-open="${safe(r.type)}" data-command-project="${safe(r.projectId||r.id||'')}" data-command-id="${safe(r.id||'')}" tabindex="0" role="button" aria-label="${safe(actionLabel(r.type))}: ${safe(r.title||r.id||'result')}"><div class="easy-bearing-result-copy"><small>${safe(String(r.type||'result').toUpperCase())} • ${safe(r.projectId||'fleet')}</small><strong>${highlight(r.title||r.id,intent.terms)}</strong><span>${highlight(r.detail||'',intent.terms)}</span></div><button type="button" class="easy-bearing-result-action" data-command-open-action="1">${actionLabel(r.type)}</button></article>`).join('')}</div>${more>0?`<button type="button" class="easy-bearing-show-more" data-command-expand="${type}">SHOW ALL ${rows.length} ${label.toUpperCase()}</button>`:expanded&&rows.length>(visibleLimits[type]||6)?`<button type="button" class="easy-bearing-show-more" data-command-collapse="${type}">SHOW LESS</button>`:''}</section>`;
      }).join('');
      searchHost.innerHTML=`<div class="easy-bearing-summary"><strong>${hits.length} result${hits.length===1?'':'s'}</strong><span>${intent.type==='all'?'across the admitted fleet':`in ${intent.type}s`}</span></div>${body}`;
      searchHost.querySelectorAll('[data-command-open]').forEach(card=>{
        const open=async()=>{
          const route={type:card.dataset.commandOpen,projectId:card.dataset.commandProject,id:card.dataset.commandId};
          card.classList.add('command-route-launching');
          const action=card.querySelector('.easy-bearing-result-action');
          const prior=action?.textContent||'';
          if(action)action.textContent='OPENING…';
          try{
            if(typeof window.BlackFlagOpenCommandResult==='function') await window.BlackFlagOpenCommandResult(route);
            else window.dispatchEvent(new CustomEvent('blackflag:open-command-result',{detail:route}));
          }catch(err){
            card.classList.remove('command-route-launching');
            if(action)action.textContent=prior||actionLabel(route.type);
            searchHost.insertAdjacentHTML('afterbegin',`<div class="easy-bearing-route-error"><strong>Could not open that result.</strong><span>${safe(String(err?.message||err))}</span></div>`);
          }
        };
        card.onclick=e=>{if(e.target.closest('[data-command-expand],[data-command-collapse]'))return;open()};
        card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
      });
      searchHost.querySelectorAll('[data-command-expand]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();expandedGroups.add(btn.dataset.commandExpand);renderHits(hits,intent)});
      searchHost.querySelectorAll('[data-command-collapse]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();expandedGroups.delete(btn.dataset.commandCollapse);renderHits(hits,intent)});
    };
    let searchTimer=0,searchNonce=0;
    const runSearch=async()=>{
      const raw=String(searchInput?.value||'').trim();
      if(!searchHost)return;
      if(raw.length<2){searchHost.innerHTML='<span>Type two characters and Showroom Restore will find the best matches.</span>';return;}
      const nonce=++searchNonce;
      const intent=parseIntent(raw);
      searchHost.innerHTML='<span>Finding the best admitted-fleet matches…</span>';
      try{
        const rows=await window.blackFlagCommandSearchData?.()||[];
        if(nonce!==searchNonce)return;
        const admitted=new Set((window.blackFlagV4Projects?.()||[]).map(p=>String(p.id)));
        const ranked=rows.filter(r=>admitted.has(String(r.projectId||r.id||''))).map(r=>({...r,_score:scoreHit(r,intent)})).filter(r=>r._score>=0).sort((a,b)=>b._score-a._score||String(a.title||a.id).localeCompare(String(b.title||b.id))).slice(0,30);
        renderHits(ranked,intent);
      }catch(err){searchHost.innerHTML=`<span>Search interrupted: ${safe(String(err?.message||err))}</span>`;}
    };
    const scheduleSearch=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(runSearch,180)};
    if(searchInput){
      searchInput.oninput=scheduleSearch;
      searchInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(searchTimer);runSearch()}else if(e.key==='Escape'){searchInput.value='';runSearch()}};
    }
    filterButtons.forEach(btn=>btn.onclick=()=>{setFilter(btn.dataset.commandSearchType||'all');if(searchInput?.value.trim().length>=2)runSearch()});
    document.querySelectorAll('[data-command-suggestion]').forEach(btn=>btn.onclick=()=>{if(!searchInput)return;searchInput.value=btn.dataset.commandSuggestion||'';searchInput.focus();runSearch()});
    if(searchClear)searchClear.onclick=()=>{if(searchInput){searchInput.value='';searchInput.focus()}runSearch()};

  }

  async function renderLog(){
    const snap=await snapshot();
    const auditRows=read('blackFlagCaptainAudit',[]);
    const waived=read('blackFlagWaivedFees',[]);
    const standing=standingOrders();
    const revenue=(snap.projects||[]).reduce((s,p)=>s+Number(p.ledgerRevenue||0),0);
    body.innerHTML=`<div class="captain-metric-row">
      <article><span>ORDER RECORDS</span><strong>${snap.totalOrders||0}</strong></article>
      <article><span>RECORDED REVENUE</span><strong>$${revenue.toFixed(0)}</strong></article>
      <article><span>CAPTAIN EVENTS</span><strong>${auditRows.length}</strong></article>
      <article><span>STANDING ORDERS</span><strong>${standing.length}</strong></article>
    </div>
    <div class="captain-two-col">
      <section class="captain-command-card"><h3>Standing Orders</h3><p>Persistent governance rules for how Black Flag is allowed to evolve.</p><div id="captainStandingOrders" class="standing-orders"></div><div class="standing-order-add"><input id="captainStandingOrderInput" placeholder="Add a standing order…" /><button id="captainStandingOrderAdd" type="button">ADD ORDER</button></div></section>
      <section class="captain-command-card"><h3>Waived Fees Ledger</h3><p>Captain-only and separate from project billing.</p><div class="captain-note-list">${waived.length?waived.slice(0,20).map(w=>`<div><strong>${safe(w.project||w.projectName||'Project')}</strong><span>${safe(w.amountWaived??w.amount??'')} ${safe(w.service||w.feature||'')}</span></div>`).join(''):'<p class="captain-empty">No waived-fee records yet.</p>'}</div></section>
    </div>
    <section class="captain-command-card"><h3>Fleet Performance</h3><div class="captain-fleet-list">${(snap.projects||[]).map(p=>`<article><div><span>${safe(p.code)}</span><strong>${safe(p.name)}</strong></div><div><b>${Number(p.orders||0)} orders</b><small>$${Number(p.ledgerRevenue||0).toFixed(0)} recorded</small></div></article>`).join('')||'<p class="captain-empty">No project performance data yet.</p>'}</div></section>
    ${renderV4DecisionLedger()}
    <section class="captain-command-card"><h3>Captain Audit History</h3><div class="captain-note-list">${auditRows.length?auditRows.slice(0,40).map(a=>`<div><strong>${safe(new Date(a.at).toLocaleString())}</strong><span>${safe(a.action)}${a.detail?` — ${safe(a.detail)}`:''}</span></div>`).join(''):'<p class="captain-empty">No Captain events recorded yet.</p>'}</div></section>`;
    const drawStanding=()=>{
      const rows=standingOrders();
      const host=document.getElementById('captainStandingOrders');
      host.innerHTML=rows.map((x,i)=>`<div class="standing-order-row"><span>${i+1}</span><p>${safe(x)}</p><button type="button" data-standing-remove="${i}" aria-label="Remove standing order">×</button></div>`).join('');
      host.querySelectorAll('[data-standing-remove]').forEach(b=>b.onclick=()=>{const rs=standingOrders();const removed=rs.splice(Number(b.dataset.standingRemove),1)[0];write('blackFlagStandingOrders',rs);audit('Standing order removed',removed);drawStanding()});
    };
    document.getElementById('captainStandingOrderAdd').onclick=()=>{const input=document.getElementById('captainStandingOrderInput');const text=input.value.trim();if(!text)return;const rows=standingOrders();rows.push(text);write('blackFlagStandingOrders',rows);audit('Standing order added',text);input.value='';drawStanding()};
    drawStanding();
    bindV4DecisionLedger();
  }

  function renderV4DecisionLedger(){
    if(!window.DarkSkyV4)return '';
    const rows=window.DarkSkyV4.decisions().slice(0,12);
    return `<section class="captain-command-card v4-decision-ledger"><small>DARK SKY 4.0</small><h3>Decision Ledger</h3><p>Major platform decisions, architectural warnings, experiments and Captain overrides live here so future releases preserve why the ship was built this way.</p><div class="v4-decision-add"><input id="captainV4Decision" placeholder="Record a platform decision…"><input id="captainV4Rationale" placeholder="Rationale / warning…"><button id="captainV4DecisionAdd" type="button">RECORD DECISION</button></div><div class="captain-note-list">${rows.length?rows.map(x=>`<div><strong>${safe(new Date(x.at).toLocaleString())}</strong><span>${safe(x.decision)}${x.rationale?` — ${safe(x.rationale)}`:''}</span></div>`).join(''):'<p class="captain-empty">No V4 platform decisions recorded yet.</p>'}</div></section>`;
  }
  function bindV4DecisionLedger(){
    const btn=document.getElementById('captainV4DecisionAdd');if(!btn||!window.DarkSkyV4)return;
    btn.onclick=()=>{const d=document.getElementById('captainV4Decision')?.value.trim()||'';const r=document.getElementById('captainV4Rationale')?.value.trim()||'';if(!d)return;window.DarkSkyV4.decision({decision:d,rationale:r,scope:'platform'});audit('V4 decision recorded',d);renderLog();};
  }

  function renderBlueprint(){
    body.innerHTML=`<section class="captain-command-intro"><small>LIVING ARCHITECTURE</small><h3>How the flagship is built</h3><p>Architecture is separate from live fleet status.</p></section>
      <div class="captain-blueprint-flow">
        <article><span>01</span><strong>CAPTAIN</strong><p>Command • governance • intelligence • history</p></article>
        <b>→</b><article><span>02</span><strong>ENGINE ROOM</strong><p>Execution • configuration • testing • deployment</p></article>
        <b>→</b><article><span>03</span><strong>PROJECT VESSELS</strong><p>Isolated branding • data • controls</p></article>
        <b>→</b><article><span>04</span><strong>OUTPOSTS</strong><p>Deployment manifests • sessions • customers</p></article>
      </div>
      <section class="captain-command-card"><h3>Full Ship's Blueprint</h3><p>The existing detailed blueprint remains the authoritative visual map and is updated with architecture releases.</p><button id="captainOpenFullBlueprint" type="button">UNROLL FULL BLUEPRINT</button></section>`;
    document.getElementById('captainOpenFullBlueprint').onclick=()=>{closeWorkspace();document.getElementById('captainBlueprintDeskBtn')?.click()};
  }

  close?.addEventListener('click',closeWorkspace);
  document.querySelectorAll('[data-captain-command]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.captainCommand)));
  document.getElementById('captainShipyardLaunch')?.addEventListener('click',()=>open('shipyard'));

  // The five painted lower controls remain the room's original command doors; Shipyard is a dedicated Captain workspace launch.
  // Legacy desk-object duplicates were removed from the cabin DOM.

  // Existing blueprint hotspot remains functional; command tab offers same destination.
  document.getElementById('captainBlueprintDeskBtn')?.addEventListener('contextmenu',e=>e.preventDefault());

  window.BlackFlagCaptainCommand={open,close:closeWorkspace};
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootCaptainCommand,{once:true});
}else{
  bootCaptainCommand();
}
})();
