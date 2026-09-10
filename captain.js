(() => {
  'use strict';

  const CAPTAIN_PIN = '19613';
  const ADMIRAL_PIN = '19613'; // Temporary shared credential; separate contract so it can split later without rewiring authority.
  window.DarkSkyCaptainAuthContract = Object.freeze({pin:CAPTAIN_PIN,recoveryPin:CAPTAIN_PIN,scope:'captains-quarters-only'});
  window.DarkSkyAdmiralAuthContract = Object.freeze({pin:ADMIRAL_PIN,recoveryPin:ADMIRAL_PIN,scope:'admirals-deck-only',sharedWithCaptain:true,temporary:true});
  const UPPER_COMMAND_BUILD='8.8.11';
  let authorized = false;

  const byId = (id) => document.getElementById(id);
  const show = (id) => byId(id)?.classList.remove('hidden');
  const hide = (id) => byId(id)?.classList.add('hidden');


  // Upper-command visual slots. Browser-local for now; production storage moves to
  // managed object storage under the Cloud Readiness contract.
  const UPPER_VISUAL_DB = 'dark-sky-upper-command-visuals-v1';
  const UPPER_VISUAL_STORE = 'visuals';
  const upperVisualUrls = new Map();
  function openUpperVisualDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(UPPER_VISUAL_DB,1);
      req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(UPPER_VISUAL_STORE)) req.result.createObjectStore(UPPER_VISUAL_STORE,{keyPath:'slot'}); };
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
  }
  async function saveUpperCommandVisual(slot,file){
    if(!file || !String(file.type||'').startsWith('image/')) throw new Error('Choose an image file first.');
    const db=await openUpperVisualDb();
    await new Promise((resolve,reject)=>{const tx=db.transaction(UPPER_VISUAL_STORE,'readwrite');tx.objectStore(UPPER_VISUAL_STORE).put({slot,blob:file,name:file.name,type:file.type,updatedAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
    db.close();
    applyUpperCommandVisual(slot,file);
    return {slot,name:file.name};
  }
  async function loadUpperCommandVisual(slot){
    try{
      const db=await openUpperVisualDb();
      const row=await new Promise((resolve,reject)=>{const tx=db.transaction(UPPER_VISUAL_STORE,'readonly');const req=tx.objectStore(UPPER_VISUAL_STORE).get(slot);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
      db.close(); if(row?.blob) applyUpperCommandVisual(slot,row.blob); return row||null;
    }catch(_){ return null; }
  }
  function applyUpperCommandVisual(slot,blob){
    const old=upperVisualUrls.get(slot); if(old) try{URL.revokeObjectURL(old);}catch(_){ }
    const url=URL.createObjectURL(blob); upperVisualUrls.set(slot,url);
    if(slot==='admiral'){
      const deck=byId('admiralDeck');
      const gate=byId('admiralGateOverlay');
      if(deck){deck.style.setProperty('--admiral-command-visual',`url("${url}")`);deck.classList.add('admiral-custom-visual');}
      if(gate){gate.style.setProperty('--admiral-command-visual',`url("${url}")`);gate.classList.add('admiral-custom-visual');const status=gate.querySelector('#admiralVisualStatus');if(status)status.textContent='CEREMONIAL VISUAL • INSTALLED FROM FORGE';}
    }else if(slot==='captain'){
      // Captain visual uploads are retained as forge references until the command
      // surface is Sea-Trialed; never silently replace the proven room geometry.
      const room=byId('captainQuarters'); if(room){room.dataset.forgeVisualReady='1';room.style.setProperty('--captain-forge-reference',`url("${url}")`);}
    }
  }
  function hydrateUpperCommandVisuals(){ loadUpperCommandVisual('captain'); loadUpperCommandVisual('admiral'); }

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
    if(quarters?.dataset.commandMode==='professional'){
      quarters.classList.add('captain-entry-complete');
      entry?.classList.remove('captain-entry-play','captain-entry-repeat');
      return;
    }
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
      window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 1120);
      return;
    }

    quarters?.classList.remove('captain-entry-complete');
    entry?.classList.remove('captain-entry-play');
    if (entry) void entry.offsetWidth;
    entry?.classList.add('captain-entry-play');
    try { sessionStorage.setItem('darkSkyCaptainEntrySeen', '1'); } catch (_) {}
    // Match the visible entrance instead of leaving the controls gated for
    // ~2 seconds after the primary animation has already finished.
    window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 4500);
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
    const cq=byId('captainQuarters'); if(cq){cq.dataset.commandMode='professional';}
    const cqToggle=byId('captainCommandModeToggle'); if(cqToggle){cqToggle.textContent='CINEMATIC VIEW';cqToggle.setAttribute('aria-pressed','false');}
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
  window.DarkSkySecureUpperCommand=secure;

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

  function refreshAdmiralCeremonialSurface(){
    const rows=fleetSnapshot();
    const sailing=rows.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='deployed').length,0);
    const trials=rows.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    if(byId('admiralCeremonialVessels'))byId('admiralCeremonialVessels').textContent=String(rows.length);
    if(byId('admiralCeremonialSailing'))byId('admiralCeremonialSailing').textContent=String(sailing);
    if(byId('admiralCeremonialTrials'))byId('admiralCeremonialTrials').textContent=String(trials);
    const attention=rows.reduce((n,v)=>n+(Number(v.attentionOutposts)||0),0);const changed=byId('admiralWhatChanged');if(changed)changed.textContent=attention?`${attention} fleet signal${attention===1?'':'s'} require governance awareness.`:(trials?`${trials} sea trial${trials===1?'':'s'} active; no open fleet signals.`:'No open fleet signals.');
  }

  const READINESS_TRUTH_KEY='bf.command.readiness.truth.v2';
  const CAPTAIN_OUTCOME_KEY='bf.command.captain.outcomes.v1';
  function readJsonLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch(_){return fallback;}}
  function writeJsonLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){ }}
  function verificationProvenance(check){
    if(check.id==='ike-true-case-roundtrip')return check.state==='pass'?'CURRENT BUILD • SOURCE CONTRACT + LIVE DOM WHEN PRESENT':'CURRENT BUILD • TRUECASE CONTRACT';
    if(check.id==='ike-style-foundry'||check.id==='ike-glyphforge')return 'CURRENT BUILD • OWNER/ENGINE SOURCE CONTRACT';
    if(check.id==='storage-growth')return 'CURRENT BUILD • BROWSER STORAGE ESTIMATE';
    if(check.id==='known-calibration-replay')return 'CURRENT BUILD • PROTECTED CALIBRATION REPLAY';
    return 'CURRENT BUILD • FLEET READINESS';
  }
  function reconcileReadinessTruth(report){
    const prior=readJsonLocal(READINESS_TRUTH_KEY,{findings:{},history:[]}),now=new Date().toISOString(),findings={...prior.findings},cleared=[];
    (report.checks||[]).forEach(c=>{
      const prev=findings[c.id]||null,isOpen=c.state!=='pass';
      const item={id:c.id,label:c.label,state:c.state,detail:c.detail,level:c.level||'core',firstDetected:prev?.firstDetected||(isOpen?now:null),latestChecked:now,lastBuild:UPPER_COMMAND_BUILD,provenance:verificationProvenance(c),lifecycle:isOpen?'open':(prev&&prev.state&&prev.state!=='pass'?'verified-fix':'clear')};
      if(!isOpen&&prev&&prev.state!=='pass'){item.clearedAt=now;item.clearedFrom=prev.state;cleared.push(item);prior.history.unshift({...item,event:'cleared'});}
      if(isOpen&&!prev)prior.history.unshift({...item,event:'detected'});
      if(isOpen&&prev&&prev.state!==c.state)prior.history.unshift({...item,event:'state-change',from:prev.state,to:c.state});
      findings[c.id]=item;
    });
    const truth={schema:'dark-sky-readiness-truth-v2',build:UPPER_COMMAND_BUILD,updatedAt:now,findings,history:(prior.history||[]).slice(0,160)};writeJsonLocal(READINESS_TRUTH_KEY,truth);report.readinessTruth=truth;report.recentlyCleared=cleared;return truth;
  }
  function findingAction(id){
    if(['ike-style-b-truth','ike-style-foundry','ike-glyphforge','known-calibration-replay'].includes(id))return ['foundry','OPEN FOUNDRY'];
    if(['storage-growth','storage-telemetry'].includes(id))return ['storage','INSPECT STORAGE'];
    if(['fleet-doctrine-registry','command-layer-placement','professional-first-command'].includes(id))return ['standards','VIEW DOCTRINE'];
    return ['evidence','VIEW EVIDENCE'];
  }
  function recordCaptainOutcome(kind,label,detail=''){
    const rows=readJsonLocal(CAPTAIN_OUTCOME_KEY,[]);rows.unshift({at:new Date().toISOString(),kind,label,detail,build:UPPER_COMMAND_BUILD});writeJsonLocal(CAPTAIN_OUTCOME_KEY,rows.slice(0,25));
  }
  function renderAdmiralFindings(report,mode='current'){
    const truth=report?.readinessTruth||readJsonLocal(READINESS_TRUTH_KEY,{findings:{},history:[]});
    const findings=byId('admiralReadinessFindings');if(!findings)return;
    if(mode==='history'){
      const history=(truth.history||[]).filter(x=>x.event==='cleared').slice(0,18);
      findings.innerHTML=history.length?history.map(c=>`<article class="admiral-finding cleared"><b>CLEARED · ${c.label}</b><span>${c.detail||'Previously failed; latest applicable verification passed.'}</span><small>VERIFIED FIX ${c.clearedAt?new Date(c.clearedAt).toLocaleString():'RETAINED'} • ${c.provenance||'VERIFIED EVIDENCE'}</small><em>HISTORY • NOT CURRENT POSTURE</em></article>`).join(''):'<span class="clear">No cleared finding history retained yet.</span>';
      return;
    }
    const current=(report?.checks||[]).filter(c=>c.state!=='pass');
    findings.innerHTML=current.length?current.map(c=>{const meta=truth.findings[c.id]||{},a=findingAction(c.id);return `<article class="admiral-finding ${c.state}" data-finding-id="${c.id}"><b>${c.state==='warn'?'WATCH':'CURRENT FAILURE'} · ${c.label}</b><span>${c.detail}</span><small>FIRST DETECTED ${meta.firstDetected?new Date(meta.firstDetected).toLocaleString():'THIS CHECK'}<br>LATEST CHECK ${UPPER_COMMAND_BUILD} • ${meta.provenance||verificationProvenance(c)}</small><em>${c.level==='core'?'FLEET CONTRACT':'CHECK'} • ${c.state==='warn'?'WATCH':'OPEN'}</em><button type="button" data-readiness-action="${a[0]}" data-readiness-finding="${c.id}">${a[1]}</button></article>`;}).join(''):'<span class="clear">No current holds. Fleet readiness is clear.</span>';
  }

  function readinessSummaryOnly8658(report){
    if(!report)return false;
    const current=(report.checks||[]).filter(c=>c.state!=='pass');
    const holds=current.filter(c=>c.state==='fail').length,watches=current.filter(c=>c.state==='warn').length;
    const label=holds?'HOLD':watches?'WATCH':'CLEAR';
    const copy=holds?`${holds} verified hold${holds===1?'':'s'} detected in background. Run Fleet Readiness to inspect.`:watches?`${watches} background watch item${watches===1?'':'s'} detected; no critical holds.`:'Background verification is clear.';
    for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el){el.textContent=label;el.dataset.state=label.toLowerCase();}}
    for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent=copy;}
    return true;
  }
  function primeAdmiralFirstPaint8658(){
    const deck=byId('admiralDeck');if(!deck)return;
    // Admiral entry always begins at the professional command deck, Govern lane, top.
    deck.dataset.mode='professional';
    deck.dataset.admiralLane='govern';
    deck.querySelectorAll('[data-admiral-lane]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.admiralLane==='govern')));
    deck.querySelectorAll('[data-admiral-panel]').forEach(panel=>panel.hidden=panel.dataset.admiralPanel!=='govern');
    const findings=byId('admiralReadinessFindings');if(findings)findings.innerHTML='<span>Run Fleet Readiness to populate verified findings.</span>';
    const tabs=byId('admiralFindingTabs');if(tabs){tabs.dataset.mode='current';tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.findingView==='current')));}
    const bg=window.__lastAdmiralBackgroundReadinessReport||null;
    if(!readinessSummaryOnly8658(bg)){
      for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el){el.textContent='VERIFYING';el.dataset.state='verifying';}}
      for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent='Proof verification is running in the background. Run Fleet Readiness for a manual diagnosis.';}
    }
    const notice=byId('admiralDeckNotice');if(notice)notice.textContent='Admiral command ready. Background proof verification cannot replace manual findings.';
    requestAnimationFrame(()=>{
      for(const el of [deck,deck.querySelector('.admiral-deck-grid'),deck.querySelector('.admiral-command-surface')]){try{if(el)el.scrollTop=0;}catch(_){}}
      try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch(_){window.scrollTo(0,0);}
    });
  }
  window.addEventListener('darksky-admiral-background-readiness',e=>{
    const d=e?.detail||{};
    if(d.state==='verified'&&d.report){window.__lastAdmiralBackgroundReadinessReport=d.report;readinessSummaryOnly8658(d.report);return;}
    if(d.state==='pending'){
      for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el&&el.textContent!=='HOLD'&&el.textContent!=='WATCH'&&el.textContent!=='CLEAR')el.textContent='VERIFYING';}
      for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el&&d.message)el.textContent=d.message;}
    }
  });

  function syncAdmiralReadiness(report){
    if(!report)return;
    const truth=reconcileReadinessTruth(report);
    const current=(report.checks||[]).filter(c=>c.state!=='pass');
    const holds=current.filter(c=>c.state==='fail').length,watches=current.filter(c=>c.state==='warn').length;
    const label=holds?'HOLD':watches?'WATCH':'CLEAR';
    const copy=holds?`${holds} current critical hold${holds===1?'':'s'} remain.`:watches?`${watches} current watch item${watches===1?'':'s'} remain; no critical holds.`:'Current fleet posture is clear.';
    for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el){el.textContent=label;el.dataset.state=label.toLowerCase();}}
    for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent=copy;}
    const domains=byId('admiralCeremonialDomains');if(domains)domains.innerHTML=(report.checks||[]).slice(0,8).map(c=>`<span data-state="${c.state}"><i>${c.state==='pass'?'✓':c.state==='warn'?'!':'×'}</i><b>${c.label}</b><em>${c.state==='pass'?'CLEAR':c.state==='warn'?'WATCH':'HOLD'}</em></span>`).join('')||'<span>No readiness domains returned.</span>';
    renderAdmiralFindings(report,'current');
    const tabs=byId('admiralFindingTabs');if(tabs){tabs.dataset.mode='current';tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.findingView==='current')));}
    const notice=byId('admiralDeckNotice');if(notice)notice.textContent=holds?`Verified Command: ${holds} current hold${holds===1?'':'s'} remain. Cleared history is retained separately.`:watches?`Verified Command: no critical holds; ${watches} current watch item${watches===1?'':'s'} remain.`:'Verified Command: current fleet posture clear. Historical findings remain retained.';
    window.__lastAdmiralReadinessReport=report;
  }

  async function runAdmiralDeckReadiness(){
    for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el)el.textContent='CHECKING';}
    try{
      const report=await window.DarkSkyAdmiralReadiness?.run?.();
      if(!report)throw new Error('Fleet Readiness service unavailable');
      report.presentationSource='manual-admiral-readiness';
      syncAdmiralReadiness(report);
      return report;
    }catch(err){
      for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el)el.textContent='UNAVAILABLE';}
      for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent=String(err?.message||err);}
      throw err;
    }
  }

  function exportAdmiralReadinessReport(){
    const report=window.__lastAdmiralReadinessReport;
    if(!report){
      const notice=byId('admiralDeckNotice')||byId('admiralCeremonialNotice');
      if(notice)notice.textContent='Run Fleet Readiness first.';
      return;
    }
    const blob=new Blob([JSON.stringify({schema:'dark-sky-fleet-readiness-v1',...report},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dark-sky-fleet-readiness-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  async function openAdmiralDoctrineDetail(){
    const entitlementPanel=byId('admiralEntitlementStation');
    const entitlementOpen=byId('admiralServiceEntitlements');
    entitlementPanel?.classList.add('hidden');
    entitlementOpen?.setAttribute('aria-expanded','false');
    if(entitlementOpen)entitlementOpen.textContent='OPEN FEATURE ENTITLEMENTS';
    const deck=byId('admiralDeck');
    if(deck){
      deck.dataset.admiralLane='standardize';
      deck.querySelectorAll('[data-admiral-lane]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.admiralLane==='standardize')));
      deck.querySelectorAll('[data-admiral-panel]').forEach(panel=>panel.hidden=panel.dataset.admiralPanel!=='standardize');
    }
    const panel=byId('admiralDoctrineDetail'); if(!panel)return;
    panel.classList.remove('hidden');
    const status=byId('admiralDoctrineStatus'); if(status)status.innerHTML='<span>REGISTRY</span><b>VERIFYING</b>';
    try{
      const r=await fetch(`FLEET_DOCTRINE_REGISTRY.json?doctrine=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)throw new Error(`Doctrine registry ${r.status}`);
      const d=await r.json(),course=d?.governance?.currentCourse||{},authority=d?.governance?.courseAuthority||{};
      const current=String(d?.build||'')===UPPER_COMMAND_BUILD && d?.status==='active' && authority?.holder==='admiral' && authority?.admiralMayChangeCourse===true && authority?.historyIsAppendOnly===true && authority?.rollbackSupported===true;
      if(byId('admiralDoctrineHeading'))byId('admiralDoctrineHeading').textContent=course.heading||'Fleet Doctrine Registry';
      if(byId('admiralDoctrineSummary'))byId('admiralDoctrineSummary').textContent=current?'Current Fleet course is active and matches this running build.':'Doctrine exists, but the running build or authority contract does not match the current registry.';
      if(byId('admiralDoctrineCourse'))byId('admiralDoctrineCourse').textContent=`${course.id||'UNSET'} · v${course.version||'?'}`;
      if(byId('admiralDoctrineBuild'))byId('admiralDoctrineBuild').textContent=`Effective ${course.effectiveBuild||'—'} · Registry ${d.build||'—'}`;
      if(status){status.dataset.state=current?'clear':'hold';status.innerHTML=`<span>REGISTRY</span><b>${current?'CURRENT':'HOLD'}</b>`;}
      const host=byId('admiralDoctrinePrinciples');
      if(host)host.innerHTML=(d.principles||[]).map(x=>`<article><small>${String(x.scope||'fleet').toUpperCase()}</small><strong>${x.id}</strong><span>${x.rule}</span></article>`).join('')||'<p>No doctrine principles were returned.</p>';
    }catch(err){
      if(status){status.dataset.state='hold';status.innerHTML='<span>REGISTRY</span><b>UNAVAILABLE</b>';}
      if(byId('admiralDoctrineSummary'))byId('admiralDoctrineSummary').textContent=String(err?.message||err);
    }
    panel.scrollIntoView({behavior:'auto',block:'start'});
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
          <div class="admiral-visual-status" id="admiralVisualStatus">CEREMONIAL VISUAL • FORGE READY</div>
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
        <div class="admiral-ascent-curtain" aria-hidden="true">
          <div class="admiral-ascent-backdrop"></div>
          <div class="admiral-ascent-beam"></div>
          <div class="admiral-ascent-seal">⚓</div>
          <div class="admiral-ascent-copy"><small>ABOVE CAPTAIN COMMAND</small><strong>ADMIRAL'S DECK</strong><span>Fleet Governance • Provisional Command</span></div>
        </div>
        <header class="admiral-deck-head">
          <div><small>PROFESSIONAL COMMAND • FLEET GOVERNANCE • ${UPPER_COMMAND_BUILD}</small><h2 id="admiralDeckTitle">Admiral Command Deck</h2><p>See the fleet clearly, set the course once, and preserve each vessel's independence.</p></div>
          <div class="admiral-deck-head-actions"><span>PROVISIONAL</span><button id="admiralDeckModeBtn" type="button" aria-pressed="false">PROFESSIONAL MODE</button><a id="admiralDeckReturnBtn" class="admiral-command-return" href="./index.html?surface=engine" role="button">← ENGINE ROOM</a></div>
        </header>
        <main class="admiral-command-surface" aria-label="Admiral cinematic command view">
          <nav class="admiral-command-rail" aria-label="Admiral governance controls">
            <div class="admiral-command-rail-title"><small>ADMIRAL COMMAND</small><strong>Govern the platform</strong><span>PROVISIONAL • TRIAL</span></div>
            <button id="admiralCeremonialForge" type="button"><b>Visual Forge</b><small>Shape upper command</small><em>READY</em></button>
            <button type="button" data-admiral-future="Delegation"><b>Delegation</b><small>Grant governed authority</small><em>FUTURE</em></button>
            <button type="button" data-admiral-future="Fleet Standards"><b>Fleet Standards</b><small>Set fleet-wide rules</small><em>FUTURE</em></button>
            <button id="admiralCeremonialFoundry" type="button"><b>The Foundry</b><small>Forge fleet capabilities</small><em>FOUNDATION</em></button>
          </nav>
          <section class="admiral-command-center" aria-label="Admiral command state">
            <div class="admiral-command-center-badge"><small>ADMIRAL'S DECK</small><strong>Fleet Governance</strong><span>Rank not yet commissioned</span></div>
          </section>
          <aside class="admiral-command-readiness" aria-label="Live fleet readiness">
            <small>LIVE FLEET READINESS</small>
            <strong id="admiralCeremonialReadinessState">NOT RUN</strong>
            <p id="admiralCeremonialReadinessCopy">Run the fleet checks before treating this deck as proven.</p>
            <div class="admiral-command-counts">
              <span><b id="admiralCeremonialVessels">0</b><small>VESSELS</small></span>
              <span><b id="admiralCeremonialSailing">0</b><small>SAILING</small></span>
              <span><b id="admiralCeremonialTrials">0</b><small>SEA TRIAL</small></span>
            </div>
            <div id="admiralCeremonialDomains" class="admiral-command-domains"><span>Awaiting readiness check.</span></div>
            <button id="admiralCeremonialRunReadiness" type="button">RUN FLEET READINESS</button>
          </aside>
          <div class="admiral-command-dock" aria-label="Admiral continuity tools">
            <button id="admiralCeremonialRecovery" type="button"><b>Recovery Snapshot</b><small>Protect the fleet</small><em>READY</em></button>
            <button id="admiralCeremonialReport" type="button"><b>Readiness Report</b><small>Download evidence</small><em>READY</em></button>
            <button type="button" data-admiral-future="Admiral Log"><b>Admiral Log</b><small>Governance history</small><em>FUTURE</em></button>
            <button type="button" data-admiral-future="Fleet Directives"><b>Fleet Directives</b><small>Issue governed orders</small><em>FUTURE</em></button>
          </div>
          <section class="admiral-command-notice" id="admiralCeremonialNotice" role="status" aria-live="polite">Ceremonial command surface active. Live controls remain separate from the artwork.</section>
        </main>
        <main class="admiral-deck-grid" aria-label="Admiral professional command view">
          <section class="admiral-pro-topline"><article><small>COMMAND BRIEF</small><strong id="admiralWhatChanged">Fleet posture ready for review.</strong><p>Start with what changed. Open a lane only when you need to act.</p></article><article class="admiral-readiness-card"><small>FLEET READINESS</small><strong id="admiralDeckReadinessState">NOT RUN</strong><p id="admiralDeckReadinessCopy">Run the fleet checks before treating this deck as proven.</p><button id="admiralDeckRunReadiness" type="button">RUN FLEET READINESS</button></article></section>
          <section class="admiral-command-map" aria-label="Admiral command map"><article><small>SEE</small><strong>Fleet posture</strong><span>Verified signals and retained history</span></article><article><small>DECIDE</small><strong>One vessel at a time</strong><span>Off, Free or Paid by feature</span></article><article><small>RECORD</small><strong>Durable command</strong><span>Authority and changes remain traceable</span></article></section>
          <nav class="admiral-lane-nav" id="admiralLaneNav" aria-label="Admiral command lanes" role="tablist">
            <button type="button" role="tab" data-admiral-lane="govern" aria-selected="true"><small>01</small><b>GOVERN</b><span>Posture & readiness</span></button>
            <button type="button" role="tab" data-admiral-lane="standardize" aria-selected="false"><small>02</small><b>STANDARDIZE</b><span>Doctrine & standards</span></button>
            <button type="button" role="tab" data-admiral-lane="delegate" aria-selected="false"><small>03</small><b>DELEGATE</b><span>Bounded authority</span></button>
            <button type="button" role="tab" data-admiral-lane="promote" aria-selected="false"><small>04</small><b>PROMOTE</b><span>Fleet learning</span></button>
          </nav>
          <section class="admiral-lane-workspace" aria-live="polite">
            <article id="admiralGovernLane" data-admiral-panel="govern"><small>01 · GOVERN</small><h4>Fleet posture & readiness</h4><p>Current verified posture first. Cleared incidents remain retained history.</p><div id="admiralFindingTabs" class="admiral-finding-tabs" data-mode="current"><button type="button" data-finding-view="current" aria-pressed="true">CURRENT FINDINGS</button><button type="button" data-finding-view="history" aria-pressed="false">CLEARED HISTORY</button></div><div id="admiralReadinessFindings" class="admiral-readiness-findings"><span>Run Fleet Readiness to populate verified findings.</span></div></article>
            <article data-admiral-panel="standardize" hidden><small>02 · STANDARDIZE</small><h4>Doctrine & standards</h4><p>Fleet doctrine, service standards, commercial policy and governed exceptions.</p><div class="admiral-lane-summary"><b>Fleet Doctrine Registry</b><span>Active fleet rules remain versioned, traceable and separated from current incident posture.</span></div><button id="admiralDeckStandards" type="button">OPEN FLEET STANDARDS <em>FOUNDATION</em></button><section id="admiralDoctrineDetail" class="admiral-doctrine-detail hidden" aria-label="Fleet Doctrine Registry detail">
  <header><div><small>CURRENT ADMIRAL COURSE</small><h5 id="admiralDoctrineHeading">Fleet Doctrine Registry</h5><p id="admiralDoctrineSummary">Loading current doctrine…</p></div><button id="admiralDoctrineClose" type="button">CLOSE</button></header>
  <div class="admiral-doctrine-status" id="admiralDoctrineStatus"><span>REGISTRY</span><b>VERIFYING</b></div>
  <div class="admiral-doctrine-grid">
    <article><small>COURSE</small><strong id="admiralDoctrineCourse">—</strong><span id="admiralDoctrineBuild">—</span></article>
    <article><small>AUTHORITY</small><strong>ADMIRAL</strong><span>Deliberate promotion required</span></article>
    <article><small>HISTORY</small><strong>APPEND-ONLY</strong><span>Prior course retained</span></article>
    <article><small>ROLLBACK</small><strong>SUPPORTED</strong><span>Prior doctrine remains recoverable</span></article>
  </div>
  <div id="admiralDoctrinePrinciples" class="admiral-doctrine-principles"></div>
  <p class="admiral-doctrine-note">This is the current governed course, not a transient readiness notice. Readiness verifies this registry against the running build.</p>
</section><div class="admiral-lane-summary admiral-service-governance"><b>Admiral Course Orders</b><span>Set one feature, a service group, or an entire vessel to Off, Free, or Paid. Every change requires an explicit Admiral preview and order.</span></div><button id="admiralServiceEntitlements" class="admiral-pro-button" type="button">OPEN COURSE ORDERS</button><section id="admiralEntitlementStation" class="admiral-entitlement-station admiral-course-station hidden" aria-label="Admiral Course Orders"><header><div><small>SERVER-GOVERNED ADMIRAL CONTROL</small><h5>Course Orders</h5><p>Choose the scope, preview the impact, then issue one deliberate and reversible command.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralEntitlementClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer">The Admiral Gate opens this deck. Account sign-in separately authorizes server-governed changes. Readiness, testing, refresh and launch never choose Off, Free or Paid.</p><div class="admiral-identity-row"><label>Admiral email<input id="admiralIdentityEmail" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input id="admiralIdentityPassword" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralIdentitySignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralIdentityRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralIdentitySignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-course-grid"><section class="admiral-course-brief"><small>FLEET BRIEF</small><strong id="admiralCourseBrief">Sign in to inspect the selected vessel.</strong><span>Reading fleet state does not change it.</span></section><section class="admiral-course-compose"><div class="admiral-course-step"><small>1 · VESSEL</small><label>Command destination<select id="admiralEntitlementVessel"><option value="ikes-wood-signs">Ike's Wood Signs</option><option value="beccas-bloom-shop">Becca's Bloom Shop</option><option value="bf-p-f92f87e8ec44">Legacy Plumbing</option><option value="bor-north-richmond">Signal Restoration</option><option value="grizzly-bear">Grizzly Bear</option><option value="mugshot-after-dark">Mugs After Dark</option></select></label></div><div class="admiral-course-step"><small>2 · SCOPE</small><div class="admiral-scope-actions" role="group" aria-label="Course order scope"><button class="admiral-pro-button is-selected" type="button" data-course-scope="vessel" aria-pressed="true">ENTIRE VESSEL</button><button class="admiral-pro-button" type="button" data-course-scope="group" aria-pressed="false">SERVICE GROUP</button><button class="admiral-pro-button" type="button" data-course-scope="feature" aria-pressed="false">ONE FEATURE</button></div><label id="admiralCourseGroupLabel" class="hidden">Service group<select id="admiralCourseGroup"><option value="operations">Operations & Commerce</option><option value="production">Production & Capacity</option><option value="intelligence">Intelligence</option></select></label><label id="admiralCourseFeatureLabel" class="hidden">Feature<select id="admiralEntitlementCapability"><option value="fleet.customer-payments">Customer Payments</option><option value="fleet.artwork-inlays">Artwork & Inlay Production</option><option value="fleet.customer-insight">Customer & Order Insight</option><option value="fleet.enhanced-ledger">Enhanced Business Ledger</option><option value="fleet.ai-recommendations">Fleet AI Recommendations</option><option value="fleet.vendor-routing">Vendor & Capacity Routing</option></select></label></div><div class="admiral-course-step"><small>3 · COMMAND</small><div class="admiral-entitlement-actions" role="group" aria-label="Commercial state"><button id="admiralTurnOff" class="admiral-pro-button" type="button" disabled>OFF<span>Unavailable</span></button><button id="admiralMakeFree" class="admiral-pro-button is-selected" type="button" disabled>FREE<span>Active at $0</span></button><button id="admiralGrantPaid" class="admiral-pro-button" type="button" disabled>PAID<span>Paid terms</span></button></div><label>Command intent<input id="admiralCourseIntent" type="text" maxlength="500" placeholder="Optional reason for the record"></label><button id="admiralPreviewCourse" class="admiral-pro-button" type="button" disabled>PREVIEW ORDER</button></div></section><section id="admiralCoursePreview" class="admiral-course-preview" aria-live="polite"><header><div><small>IMPACT PREVIEW</small><strong id="admiralEntitlementCurrent">AWAITING PREVIEW</strong><span id="admiralEntitlementCurrentDetail">No fleet state will change until the order is issued.</span></div></header><div class="admiral-impact-counts"><span><b id="admiralCourseTargetCount">0</b><small>TARGETS</small></span><span><b id="admiralCourseChangeCount">0</b><small>CHANGES</small></span><span><b id="admiralCourseUnchangedCount">0</b><small>UNCHANGED</small></span></div><div id="admiralCoursePreviewItems" class="admiral-course-preview-items"><p>Authenticate the Admiral identity, then preview an order.</p></div><button id="admiralIssueCourse" class="admiral-pro-button is-primary" type="button" disabled>ISSUE ADMIRAL ORDER</button></section></div><div id="admiralEntitlementResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to inspect and command entitlements.</div><section class="admiral-course-log"><header><div><small>DURABLE COMMAND RECORD</small><strong>Recent Admiral orders</strong></div><button id="admiralOpenFullLog" class="admiral-pro-button" type="button" disabled>OPEN FULL LOG</button></header><div id="admiralCourseLogRows" class="admiral-course-log-rows"><p>Authenticate to read the command record.</p></div></section><div class="admiral-package-note"><b>Authority boundary</b><span>Each order is scoped to one vessel. Preview fingerprints prevent stale changes; rollback refuses to overwrite a newer command.</span></div></section></article>
            <article data-admiral-panel="delegate" hidden><small>03 · DELEGATE</small><h4>Bounded authority</h4><p>Scope, duration, stewardship and delegation history.</p><div class="admiral-lane-summary"><b>Delegation</b><span>Authority must remain explicit, bounded and auditable.</span></div><button type="button" data-admiral-future="Delegation">DELEGATION <em>FUTURE</em></button></article>
            <article data-admiral-panel="promote" hidden><small>04 · PROMOTE</small><h4>Promote fleet learning</h4><p>Foundry candidates, proven capability, shared service or new vessel.</p><div class="admiral-lane-summary"><b>Intelligence Dock + one learning pipeline</b><span>Cross-vessel patterns surface here before Observation → Lesson → Candidate → Foundry → Sea Trial → Proven.</span></div><button id="admiralDeckFoundry" type="button">OPEN THE FOUNDRY <em>FOUNDATION</em></button><div class="admiral-lane-summary admiral-service-governance"><b>Admiral Commissioning Orders</b><span>Create one durable Fleet Core vessel identity. The working name stays editable; the vessel ID, project key, and namespace do not.</span></div><button id="admiralCommissioningOpen" class="admiral-pro-button" type="button">OPEN COMMISSIONING ORDERS</button><section id="admiralCommissioningStation" class="admiral-entitlement-station admiral-course-station admiral-commissioning-station hidden" aria-label="Admiral Commissioning Orders"><header><div><small>SERVER-GOVERNED ADMIRAL SHIPYARD</small><h5>Commissioning Orders</h5><p>Name the working vessel, define its permanent keel, preview the boundary, then issue one deliberate order.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralCommissioningIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralCommissioningClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer"><b>Bootstrap Build is a working name.</b> It can be renamed later without changing the vessel UUID, project key, namespace, records, or lineage.</p><div id="admiralCommissioningAuth" class="admiral-identity-row"><label>Admiral email<input id="admiralCommissioningEmail" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input id="admiralCommissioningPassword" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralCommissioningSignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralCommissioningRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralCommissioningSignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-course-grid admiral-commissioning-grid"><section class="admiral-course-brief"><small>COMMISSIONING BRIEF</small><strong id="admiralCommissioningBrief">Authenticate to preview a new vessel.</strong><span>No vessel exists until the order is issued.</span></section><section class="admiral-course-compose"><div class="admiral-course-step"><small>1 · WORKING IDENTITY</small><label>Working name <span class="field-rule">EDITABLE AFTER COMMISSION</span><input id="admiralCommissioningName" type="text" maxlength="80" value="Bootstrap Build" placeholder="Working vessel name"></label><label>Mission summary<input id="admiralCommissioningSummary" type="text" maxlength="500" value="Construction scheduling and field coordination" placeholder="What this vessel is being built to do"></label></div><div class="admiral-course-step"><small>2 · PERMANENT KEEL</small><label>Project key <span class="field-rule">PERMANENT</span><input id="admiralCommissioningProject" type="text" maxlength="63" value="construction-scheduling-01" autocapitalize="none" spellcheck="false"></label><label>Namespace <span class="field-rule">PERMANENT</span><input id="admiralCommissioningNamespace" type="text" maxlength="63" value="construction-scheduling-01" autocapitalize="none" spellcheck="false"></label><label>Mission class<select id="admiralCommissioningClass"><option value="admiral_program">Admiral-level program</option><option value="fleet_service">Shared fleet service</option><option value="independent_business">Independent business</option></select></label></div><div class="admiral-course-step"><small>3 · BOUNDARY</small><div class="admiral-commissioning-boundary"><span><b>COMMISSIONING</b><small>NOT LIVE</small></span><span><b>UNASSIGNED</b><small>NO OWNER CREATED</small></span><span><b>NO FEATURES</b><small>COURSE ORDER LATER</small></span></div><label>Order intent<input id="admiralCommissioningIntent" type="text" maxlength="500" placeholder="Optional reason for the record"></label><button id="admiralCommissioningPreview" class="admiral-pro-button" type="button" disabled>PREVIEW COMMISSIONING ORDER</button></div></section><section class="admiral-course-preview" aria-live="polite"><header><div><small>IMPACT PREVIEW</small><strong id="admiralCommissioningPreviewState">AWAITING PREVIEW</strong><span id="admiralCommissioningPreviewDetail">No Fleet Core row will be written until the order is issued.</span></div></header><div id="admiralCommissioningPreviewItems" class="admiral-course-preview-items"><p>Authenticate the Admiral identity, then preview the permanent and editable fields.</p></div><button id="admiralCommissioningIssue" class="admiral-pro-button is-primary" type="button" disabled>ISSUE COMMISSIONING ORDER</button></section></div><div id="admiralCommissioningResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to begin.</div><section class="admiral-course-log"><header><div><small>DURABLE COMMISSIONING RECORD</small><strong>Recent vessel orders</strong></div><button id="admiralCommissioningLog" class="admiral-pro-button" type="button" disabled>OPEN FULL LOG</button></header><div id="admiralCommissioningLogRows" class="admiral-course-log-rows"><p>Authenticate to read the commissioning record.</p></div></section><div class="admiral-package-note"><b>Authority boundary</b><span>The commissioner does not become the owner. Commissioning creates no membership, no entitlement, and no live publication.</span></div></section></article>
          </section>
          <section class="admiral-continuity-card"><div><h4>CONTINUITY</h4><p>Protect fleet memory and recovery without mixing it into the command lanes.</p></div><div class="admiral-continuity-actions"><button id="admiralDeckRecovery" type="button"><b>Recovery Snapshot</b><small>Protect the fleet</small></button><button id="admiralDeckReport" type="button"><b>Readiness Report</b><small>Download evidence</small></button><button id="admiralDeckLog" type="button"><b>Admiral Log</b><small>Governance history</small></button><button id="admiralDeckForge" type="button"><b>Visual Forge</b><small>Presentation layer</small></button></div></section>
          <section class="admiral-deck-note" id="admiralDeckNotice" role="status" aria-live="polite">Professional Mode active. Rank is not implied by access.</section>
        </main>
      </div>`;
    document.body.appendChild(deck);
    loadUpperCommandVisual('admiral');

    const commitEngineSurface=()=>{
      // Make the crossing visible in this controller before asking the shared
      // navigator to refresh Engine data. This is intentionally synchronous:
      // iPad Safari must never be left displaying Admiral after acknowledging
      // the tap, even if a later diagnostic refresh rejects.
      secure();
      document.body.classList.remove('boot-locked','project-mode','project-admin-mode','project-orders-mode','project-ledger-mode','engine-workspace-open');
      document.body.classList.add('engine-mode');
      byId('blackFlagEntryGate')?.classList.add('hidden');
      byId('enginePanel')?.classList.remove('hidden');
      requestAnimationFrame(()=>{try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch(_){window.scrollTo(0,0);}});
      return byId('admiralDeck')?.classList.contains('hidden')&&byId('enginePanel')&&!byId('enginePanel').classList.contains('hidden');
    };
    const returnToEngine=(fallbackHref='./index.html?surface=engine')=>{
      if(typeof window.DarkSkyUpperCommandEscape==='function'){
        if(window.DarkSkyUpperCommandEscape('admiral-controller'))return;
      }
      const committed=commitEngineSurface();
      const navigate=window.DarkSkyFleetNavigator?.navigate;
      if(typeof navigate==='function'){
        Promise.resolve(navigate.call(window.DarkSkyFleetNavigator,'engine',{source:'admiral'})).catch(err=>{
          console.warn('Admiral return route warning',err);
          if(!committed)window.location.assign(fallbackHref);
        });
        return;
      }
      if(typeof window.DarkSkyReturnToEngine==='function'){
        Promise.resolve(window.DarkSkyReturnToEngine()).catch(()=>{if(!committed)window.location.assign(fallbackHref);});
        return;
      }
      if(!committed)window.location.assign(fallbackHref);
    };
    const closeGate=()=>{const direct=byId('admiralGateOverlay')?.dataset.entrySource==='engine';hide('admiralGateOverlay'); byId('admiralPinInput').value=''; byId('admiralPinError').textContent='';if(direct){returnToEngine();return;}if(window.DarkSkyFleetNavigator?.navigate){window.DarkSkyFleetNavigator.navigate('captain',{source:'admiral-gate'});return;}show('captainQuarters');show('captainGlobalExit');};
    const returnToCaptain=()=>{if(deck.dataset.entrySource==='engine'){returnToEngine();return;}hide('admiralDeck');if(window.DarkSkyFleetNavigator?.navigate){window.DarkSkyFleetNavigator.navigate('captain',{source:'admiral'});return;}show('captainQuarters');show('captainGlobalExit');document.body.classList.add('captain-modal-open','captain-authorized');};
    byId('admiralGateReturnBtn').onclick=closeGate;
    const admiralReturnButton=byId('admiralDeckReturnBtn');
    if(admiralReturnButton)admiralReturnButton.addEventListener('click',event=>{
      const target=admiralReturnButton.dataset.routeTarget||'engine';
      if(target==='engine'){
        // Native Passage: do not prevent, stop, or replace this click. Safari owns
        // the document navigation and the destination consumes a one-use Engine
        // handoff before any upper-command controller can paint.
        window.__darkSkyRuntimeEntryWitness8620?.('native-engine-return-departing',{build:UPPER_COMMAND_BUILD});
        return;
      }
      event.preventDefault();
      returnToCaptain();
    });
    byId('admiralDeckModeBtn').onclick=()=>{
      const professional=deck.dataset.mode==='professional';
      deck.dataset.mode=professional?'ceremonial':'professional';
      const btn=byId('admiralDeckModeBtn');
      if(btn){btn.setAttribute('aria-pressed',String(!professional));btn.textContent=professional?'PROFESSIONAL MODE':'CEREMONIAL MODE';}
      try{const view=professional?'professional':'ceremonial';deck.dataset[view+'Scroll']=String(deck.querySelector(view==='professional'?'.admiral-deck-grid':'.admiral-command-surface')?.scrollTop||0);}catch(_){ }
      if(deck.dataset.mode==='ceremonial'){deck.classList.remove('admiral-deck-enter-repeat','admiral-deck-ascent-repeat');void deck.offsetWidth;deck.classList.add('admiral-deck-enter-repeat','admiral-deck-ascent-repeat');window.setTimeout(()=>deck.classList.remove('admiral-deck-ascent-repeat'),2620);}
      requestAnimationFrame(()=>{const view=deck.dataset.mode;const target=deck.querySelector(view==='professional'?'.admiral-deck-grid':'.admiral-command-surface');if(target)target.scrollTop=Number(deck.dataset[view+'Scroll']||0);});
      refreshAdmiralCeremonialSurface();
    };
    byId('admiralUnlockBtn').onclick=async()=>{
      const input=byId('admiralPinInput'),error=byId('admiralPinError');
      if(String(input?.value||'').trim()!==ADMIRAL_PIN){if(error)error.textContent='Admiral access denied.';if(input){input.value='';input.focus();}return;}
      if(error)error.textContent='';hide('admiralGateOverlay');hide('captainQuarters');hide('captainGlobalExit');show('admiralDeck');
      deck.dataset.mode='professional';
      const modeBtn=byId('admiralDeckModeBtn');if(modeBtn){const pro=deck.dataset.mode==='professional';modeBtn.setAttribute('aria-pressed',String(pro));modeBtn.textContent=pro?'CEREMONIAL MODE':'PROFESSIONAL MODE';}
      deck.classList.remove('admiral-deck-enter','admiral-deck-enter-repeat','admiral-deck-ascent-first','admiral-deck-ascent-repeat');
      if(deck.dataset.mode==='ceremonial'){
        void deck.offsetWidth;let seenDeck=false;try{seenDeck=sessionStorage.getItem('darkSkyAdmiralTrialSeen')==='1';}catch(_){ }
        deck.classList.add(seenDeck?'admiral-deck-enter-repeat':'admiral-deck-enter');
        deck.classList.add(seenDeck?'admiral-deck-ascent-repeat':'admiral-deck-ascent-first');
        const ascentMs=seenDeck?2500:3900;window.setTimeout(()=>deck.classList.remove('admiral-deck-ascent-first','admiral-deck-ascent-repeat'),ascentMs+120);
      }
      refreshAdmiralCeremonialSurface();
      primeAdmiralFirstPaint8658();
      try{sessionStorage.setItem('darkSkyAdmiralTrialSeen','1');}catch(_){ }
    };
    byId('admiralPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')byId('admiralUnlockBtn').click();});
    const setAdmiralLane=(lane,focus=false)=>{
      const allowed=['govern','standardize','delegate','promote'];lane=allowed.includes(lane)?lane:'govern';
      deck.dataset.admiralLane=lane;
      deck.querySelectorAll('[data-admiral-lane]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.admiralLane===lane)));
      deck.querySelectorAll('[data-admiral-panel]').forEach(panel=>panel.hidden=panel.dataset.admiralPanel!==lane);
      try{sessionStorage.setItem('darkSkyAdmiralLane',lane);}catch(_){}
      // Keep the professional deck on one stable scroll plane. Moving a nested
      // target during an iPad tap can leave Safari's visual and hit-test geometry
      // out of sync until the next frame.
      if(focus)deck.querySelector(`[data-admiral-panel="${lane}"]`)?.focus?.({preventScroll:true});
    };
    byId('admiralLaneNav')?.addEventListener('click',e=>{const btn=e.target.closest('[data-admiral-lane]');if(btn)setAdmiralLane(btn.dataset.admiralLane,true);});
    try{setAdmiralLane(sessionStorage.getItem('darkSkyAdmiralLane')||'govern');}catch(_){setAdmiralLane('govern');}
    byId('admiralDeckRunReadiness').onclick=()=>runAdmiralDeckReadiness();
    byId('admiralCeremonialRunReadiness').onclick=()=>runAdmiralDeckReadiness();
    byId('admiralDeckRecovery').onclick=()=>window.DarkSkyAdmiralReadiness?.exportRecovery?.();
    byId('admiralCeremonialRecovery').onclick=()=>window.DarkSkyAdmiralReadiness?.exportRecovery?.();
    byId('admiralDeckForge').onclick=()=>openVisualForge('admiral');
    byId('admiralCeremonialForge').onclick=()=>openVisualForge('admiral');
    byId('admiralDeckReport').onclick=exportAdmiralReadinessReport;
    byId('admiralCeremonialReport').onclick=exportAdmiralReadinessReport;
    byId('admiralDeckFoundry').onclick=()=>openFoundryWorkspace();
    const commissioningButton=byId('admiralCommissioningOpen');
    if(commissioningButton){
      commissioningButton.setAttribute('aria-expanded','false');
      commissioningButton.onclick=event=>{
        event.preventDefault();event.stopPropagation();
        const station=byId('admiralCommissioningStation');if(!station)return;
        station.classList.remove('hidden');
        commissioningButton.setAttribute('aria-expanded','true');
        commissioningButton.textContent='COMMISSIONING ORDERS OPEN';
        window.DarkSkySyncCommissioningIdentity?.();
      };
    }
    const commissioningClose=byId('admiralCommissioningClose');
    if(commissioningClose)commissioningClose.onclick=event=>{
      event.preventDefault();event.stopPropagation();
      byId('admiralCommissioningStation')?.classList.add('hidden');
      if(commissioningButton){commissioningButton.setAttribute('aria-expanded','false');commissioningButton.textContent='OPEN COMMISSIONING ORDERS';commissioningButton.focus({preventScroll:true});}
    };
    const standardsButton=byId('admiralDeckStandards');
    if(standardsButton){
      standardsButton.setAttribute('aria-expanded','false');
      standardsButton.onclick=event=>{event.preventDefault();event.stopPropagation();standardsButton.setAttribute('aria-expanded','true');openAdmiralDoctrineDetail();};
    }
    const doctrineClose=byId('admiralDoctrineClose');
    if(doctrineClose)doctrineClose.onclick=event=>{event.preventDefault();event.stopPropagation();byId('admiralDoctrineDetail')?.classList.add('hidden');standardsButton?.setAttribute('aria-expanded','false');standardsButton?.focus({preventScroll:true});};
    const entitlementButton=byId('admiralServiceEntitlements');
    if(entitlementButton){
      entitlementButton.setAttribute('aria-expanded','false');
      entitlementButton.onclick=async event=>{
        event.preventDefault();event.stopPropagation();
        const station=byId('admiralEntitlementStation');if(!station)return;
        byId('admiralDoctrineDetail')?.classList.add('hidden');
        standardsButton?.setAttribute('aria-expanded','false');
        station.classList.remove('hidden');
        entitlementButton.setAttribute('aria-expanded','true');
        entitlementButton.textContent='COURSE ORDERS OPEN';
        await window.DarkSkySyncAdmiralIdentity?.();
      };
    }
    const entitlementClose=byId('admiralEntitlementClose');
    if(entitlementClose)entitlementClose.onclick=event=>{event.preventDefault();event.stopPropagation();byId('admiralEntitlementStation')?.classList.add('hidden');entitlementButton?.setAttribute('aria-expanded','false');if(entitlementButton){entitlementButton.textContent='OPEN COURSE ORDERS';entitlementButton.focus({preventScroll:true});}};
    byId('admiralCeremonialFoundry').onclick=()=>openFoundryWorkspace();
    byId('admiralReadinessFindings')?.addEventListener('click',e=>{
      const btn=e.target.closest('[data-readiness-action]');if(!btn)return;
      const action=btn.dataset.readinessAction,id=btn.dataset.readinessFinding;
      if(action==='foundry'){openFoundryWorkspace();return;}
      if(action==='standards'){openAdmiralDoctrineDetail();return;}
      if(action==='storage'){returnToCaptain();window.setTimeout(()=>{byId('captainGlobalExit')?.click();window.setTimeout(()=>window.BlackFlagOpenStorageTelemetry?.({inspect:true}),220);},80);return;}
      const n=byId('admiralDeckNotice');if(n)n.textContent=`${id||'Finding'} evidence is retained in the current readiness report. Use Readiness Report to export the full evidence bundle.`;
    });
    byId('admiralFindingTabs')?.addEventListener('click',e=>{
      const btn=e.target.closest('[data-finding-view]');if(!btn)return;
      const mode=btn.dataset.findingView==='history'?'history':'current',tabs=byId('admiralFindingTabs');
      if(tabs){tabs.dataset.mode=mode;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));}
      renderAdmiralFindings(window.__lastAdmiralReadinessReport||null,mode);
    });
    deck.querySelectorAll('[data-admiral-future]').forEach(btn=>btn.onclick=()=>{byId('admiralDeckNotice').textContent=`${btn.dataset.admiralFuture} is charted for a future Admiral voyage.`;});
    return gate;
  }

  function ensureFoundryWorkspace(){
    let overlay=byId('foundryWorkspace');
    if(overlay)return overlay;
    const core=window.BlackFlagV3Core||{};
    const domains=core.fleetServiceDomains||{};
    const registry=Array.isArray(core.fleetCapabilityRegistry)?core.fleetCapabilityRegistry:[];
    const tiers=core.fleetOperatingTiers||{};
    const domainCards=Object.entries(domains).map(([id,d])=>`<article class="foundry-domain-card"><small>${String(d.level||'fleet').toUpperCase()}</small><h3>${d.label||id}</h3><p>${d.mission||''}</p><strong>${registry.filter(c=>c.domain===id).length} CAPABILITY${registry.filter(c=>c.domain===id).length===1?'':'IES'}</strong></article>`).join('');
    const capabilityRows=registry.map(c=>`<article class="foundry-capability-row"><div><small>${String(c.lifecycle||'foundation').replaceAll('_',' ').toUpperCase()} • ${String(c.scope||'').replaceAll('-',' ').toUpperCase()}</small><strong>${c.name}</strong><span>${c.id}</span></div><div><b>${(domains[c.domain]?.label||c.domain||'Fleet')}</b><em>${String(c.commercial||'future').replaceAll('-',' ')}</em></div></article>`).join('');
    const tierRows=Object.values(tiers).map(t=>`<div class="foundry-tier"><strong>${t.label}</strong><span>${t.summary}</span></div>`).join('');
    overlay=document.createElement('div');
    overlay.id='foundryWorkspace';
    overlay.className='foundry-workspace hidden';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','foundryTitle');
    overlay.innerHTML=`<div class="foundry-shell">
      <header class="foundry-head"><div><small>ADMIRAL • FLEET SERVICES FOUNDATION</small><h2 id="foundryTitle">The Foundry</h2><p>Forge reusable services without absorbing the vessels that use them.</p></div><button id="foundryClose" type="button">RETURN TO ADMIRAL'S DECK</button></header>
      <section class="foundry-law"><strong>VESSELS STAY INDEPENDENT.</strong><span>Shared capabilities cross boundaries only through explicit, versioned service contracts. A shared schema never grants shared authority.</span></section>
      <main class="foundry-body">
        <section class="foundry-section"><header><small>OPERATING MODEL</small><h3>Four fleet tiers</h3></header><div class="foundry-tiers">${tierRows}</div></section>
        <section class="foundry-section"><header><small>CAPABILITY WORKS</small><h3>Foundry domains</h3></header><div class="foundry-domain-grid">${domainCards}</div></section>
        <section class="foundry-section"><header><small>FOUNDATION AUDIT</small><h3>Existing pieces promoted into the registry</h3><p>These are foundations or candidates, not promises of live production behavior.</p></header><div class="foundry-capability-list">${capabilityRows}</div></section>
        <section class="foundry-section foundry-boundary"><header><small>BOUNDARY CONTRACT</small><h3>Capability ≠ Vessel ≠ Service Instance</h3></header><p><b>Capability:</b> reusable function. <b>Vessel:</b> independent business or major fleet operation. <b>Service instance:</b> the explicit agreement that lets one vessel consume one capability.</p><p>Ike's remains the sign manufacturer. The Foundry may first prepare vendor-ready inlay files, later manufacture inlays, and only later provide optional overflow capacity when economics justify it.</p></section>
      </main>
      <footer class="foundry-foot"><span>FOUNDATION ONLY • NO CROSS-PROJECT DATA GRANT</span><button id="foundryAudit" type="button">SHOW FOUNDATION STATUS</button></footer>
      <div id="foundryNotice" class="foundry-notice" role="status" aria-live="polite">Existing future features have been classified before new fleet services are built.</div>
    </div>`;
    document.body.appendChild(overlay);
    byId('foundryClose').onclick=()=>{hide('foundryWorkspace');show('admiralDeck');};
    byId('foundryAudit').onclick=()=>{const n=byId('foundryNotice');if(n)n.textContent=`${registry.length} capability foundations classified across ${Object.keys(domains).length} Foundry domains. No owner/operator authority was broadened.`;};
    return overlay;
  }
  function openFoundryWorkspace(){
    ensureFoundryWorkspace();hide('admiralDeck');show('foundryWorkspace');
  }

  function openAdmiralGate(source='captain'){
    ensureAdmiralDeck();
    hide('captainGlobalExit');
    const gate=byId('admiralGateOverlay');
    const deck=byId('admiralDeck');
    const input=byId('admiralPinInput');
    const fromEngine=source==='engine';
    if(gate)gate.dataset.entrySource=fromEngine?'engine':'captain';
    if(deck)deck.dataset.entrySource=fromEngine?'engine':'captain';
    const gateReturn=byId('admiralGateReturnBtn');
    const deckReturn=byId('admiralDeckReturnBtn');
    if(gateReturn)gateReturn.textContent=fromEngine?'← RETURN TO ENGINE':'← RETURN TO CAPTAIN\'S QUARTERS';
    if(deckReturn){
      deckReturn.textContent=fromEngine?'← ENGINE ROOM':'← CAPTAIN\'S QUARTERS';
      deckReturn.dataset.routeTarget=fromEngine?'engine':'captain';
      if(fromEngine){
        let href='./index.html?surface=engine';
        try{
          const engineAuthorized=window.BlackFlagAuth?.isUnlocked?.()===true||window.DarkSkyTestAccess?.isActive?.()===true;
          if(engineAuthorized){
            const words=new Uint32Array(4);crypto.getRandomValues(words);
            const token=Array.from(words,n=>n.toString(36)).join('');
            const handoff={schema:'dark-sky-engine-return-handoff-v1',build:UPPER_COMMAND_BUILD,source:'admiral',token,createdAt:Date.now(),expiresAt:Date.now()+30*60*1000};
            sessionStorage.setItem('darkSkyEngineReturnHandoffV1',JSON.stringify(handoff));
            href=`./index.html?surface=engine-return&handoff=${encodeURIComponent(token)}&_darkSkyRelease=${encodeURIComponent(UPPER_COMMAND_BUILD)}`;
          }
        }catch(_){ }
        deckReturn.href=href;
      }else deckReturn.href='#captainQuartersGate';
    }
    gate?.classList.remove('hidden');
    gate?.classList.remove('admiral-gate-enter','admiral-gate-repeat');void gate?.offsetWidth;
    let seen=false;try{seen=sessionStorage.getItem('darkSkyAdmiralGateSeen')==='1';}catch(_){ }
    gate?.classList.add(seen?'admiral-gate-repeat':'admiral-gate-enter');
    try{sessionStorage.setItem('darkSkyAdmiralGateSeen','1');}catch(_){ }
    if(input){input.value='';window.setTimeout(()=>input.focus(),seen?2050:3150);}
  }
  window.DarkSkyOpenAdmiralGate=openAdmiralGate;

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
            <label>Target<select id="visualForgeTarget"><option>Captain's Quarters</option><option>Admiral's Gate + Deck</option><option>Admiral's Deck</option><option>New Vessel</option><option>Existing Project</option><option>Dark Sky / Black Flag</option></select></label>
            <label>Working title<input id="visualForgeName" type="text" placeholder="Name this concept" /></label>
            <label>What should this become?<textarea id="visualForgeObjective" rows="5" placeholder="Describe what you want the visual to become, what must work, what must stay isolated, and what the user should be able to do."></textarea></label>
            <label class="visual-forge-upload">Reference visuals<input id="visualForgeFiles" type="file" accept="image/*" multiple /><span>Choose one or more images</span></label>
            <div id="visualForgeRefs" class="visual-forge-refs"><p>No references loaded yet.</p></div>
            <button id="visualForgeBuild" class="visual-forge-primary" type="button">FORGE BLUEPRINT</button>
          </section>
          <section class="visual-forge-output">
            <div class="visual-forge-status"><small>FORGE STATE</small><strong id="visualForgeState">STANDING BY</strong><span id="visualForgeStateCopy">Add a visual and objective, then forge a build brief.</span></div>
            <div id="visualForgeBlueprint" class="visual-forge-blueprint"><h3>Blueprint preview</h3><p>The Forge will translate the visual into structure, interactions, protected zones, isolation rules and next build steps.</p></div>
            <div class="visual-forge-actions"><button id="visualForgeInstall" type="button" disabled>INSTALL VISUAL TO TARGET</button><button id="visualForgeExport" type="button" disabled>EXPORT BLUEPRINT</button><button id="visualForgeReset" type="button">RESET</button></div>
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
      [...(e.target.files||[])].slice(0,6).forEach(file=>refs.push({name:file.name,type:file.type,size:file.size,file,url:URL.createObjectURL(file)}));
      byId('visualForgeInstall').disabled=!refs.length;
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
      byId('visualForgeBlueprint').innerHTML=`<small>FORGED BY ${scope.toUpperCase()} → TARGET: ${target.toUpperCase()}</small><h3>${name}</h3><p>${objective||'No objective supplied yet.'}</p><h4>Build principles</h4><ol>${current.principles.map(x=>`<li>${x}</li>`).join('')}</ol><h4>Next move</h4><p>${scope==='admiral'?'Review whether this pattern should become a governed fleet standard before promotion.':'Prototype the blueprint in Workshop, then Sea Trial it before any fleet promotion.'}</p>`;
      byId('visualForgeExport').disabled=false;
      byId('visualForgeInstall').disabled=!refs.length || !["Captain's Quarters","Admiral's Deck","Admiral's Gate + Deck"].includes(target);
    };
    byId('visualForgeInstall').onclick=async()=>{
      const file=refs[0]?.file; const target=byId('visualForgeTarget')?.value;
      if(!file){showCaptainDeskNotice('Choose a reference visual first.','unavailable');return;}
      if(target!=="Captain's Quarters" && target!=="Admiral's Deck" && target!=="Admiral's Gate + Deck"){showCaptainDeskNotice('Upper-command visual install is available for Captain or Admiral targets.','future');return;}
      const slot=target.startsWith("Admiral's")?'admiral':'captain';
      try{
        await saveUpperCommandVisual(slot,file);
        byId('visualForgeState').textContent=slot==='admiral'?'ADMIRAL VISUAL INSTALLED':'CAPTAIN REFERENCE STAGED';
        byId('visualForgeStateCopy').textContent=slot==='admiral'?'Admiral’s Gate and Ceremonial Deck will use this visual; Professional Mode remains clean.':'Captain reference saved for Forge/Sea Trial. The proven command-room geometry is not silently replaced.';
      }catch(err){byId('visualForgeState').textContent='INSTALL HOLD';byId('visualForgeStateCopy').textContent=String(err?.message||err);}
    };
    byId('visualForgeExport').onclick=()=>{if(!current)return;const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${current.id}-${current.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'visual-forge'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
    byId('visualForgeReset').onclick=()=>{current=null;byId('visualForgeName').value='';byId('visualForgeObjective').value='';byId('visualForgeFiles').value='';refs.forEach(r=>{try{URL.revokeObjectURL(r.url);}catch(_){}});refs=[];renderRefs();byId('visualForgeState').textContent='STANDING BY';byId('visualForgeStateCopy').textContent='Add a visual and objective, then forge a build brief.';byId('visualForgeBlueprint').innerHTML='<h3>Blueprint preview</h3><p>The Forge will translate the visual into structure, interactions, protected zones, isolation rules and next build steps.</p>';byId('visualForgeExport').disabled=true;byId('visualForgeInstall').disabled=true;};
    byId('visualForgeClose').onclick=()=>hide('visualForgeOverlay');
    overlay.addEventListener('click',e=>{if(e.target===overlay)hide('visualForgeOverlay');});
    return overlay;
  }

  function openVisualForge(scope='captain'){
    const forge=ensureVisualForge();
    forge.dataset.scope=scope;
    const label=byId('visualForgeScope'); if(label)label.textContent=scope==='admiral'?'ADMIRAL VISUAL FORGE • FLEET GOVERNANCE':'CAPTAIN VISUAL FORGE • CREATE & PROTOTYPE';
    const target=byId('visualForgeTarget'); if(target)target.value=scope==='admiral'?"Admiral's Gate + Deck":"Captain's Quarters";
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
    const fleet=fleetSnapshot();
    const active=fleet.reduce((n,v)=>n+(Number(v.activeOutposts)||0),0);
    const attention=fleet.reduce((n,v)=>n+(Number(v.attentionOutposts)||0),0);
    const trials=fleet.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    const set=(id,value)=>{ const el=byId(id); if(el)el.textContent=String(value); };
    set('cqLiveVessels',fleet.length);set('cqLiveSailing',active);set('cqLiveTrials',trials);set('cqLiveSignals',attention);
    set('captainProVessels',fleet.length);set('captainProSailing',active);set('captainProTrials',trials);set('captainProSignals',attention);set('captainGlanceVessels',fleet.length);set('captainGlanceSailing',active);set('captainGlanceTrials',trials);set('captainGlanceSignals',attention);
    const changed=byId('captainProChanged');
    if(changed)changed.textContent=attention?`${attention} signal${attention===1?'':'s'} need Captain review.`:(trials?`${trials} sea trial${trials===1?'':'s'} active; no attention signals.`:'No new attention signals.');
    const state=byId('cqLiveState');if(state)state.textContent=attention?`${attention} signal${attention===1?'':'s'} require your eye`:(fleet.length?'Waters are steady':'Fleet data standing by');
    if(layer)layer.classList.toggle('attention',attention>0);

    const signalRows=[];
    fleet.forEach(v=>{
      const reasons=[];
      (v.outposts||[]).forEach(o=>(o.attentionReasons||[]).forEach(r=>{if(r && !reasons.includes(r))reasons.push(r);}));
      if(Number(v.attentionOutposts)>0 || reasons.length) signalRows.push({v,reasons});
    });
    const watch=byId('captainProWatchItems');
    if(watch) watch.innerHTML=signalRows.length?signalRows.slice(0,4).map(({v,reasons})=>`<button type="button" class="captain-pro-signal" data-captain-pro-vessel="${v.projectId}"><span><b>${v.name}</b><small>${reasons[0]||`${v.attentionOutposts} deployment signal${v.attentionOutposts===1?'':'s'} need review.`}</small></span><em>REVIEW →</em></button>`).join(''):`<div class="captain-pro-empty">No active attention signals.</div>`;
    const decide=byId('captainProDecideItems');
    if(decide) decide.innerHTML=signalRows.length?signalRows.slice(0,3).map(({v,reasons})=>`<article><b>${v.name}</b><p>${reasons.length?reasons.join(' • '):'A deployment signal requires Captain review.'}</p><small>FIRST MATE: inspect the signal before routing.</small></article>`).join(''):`<div class="captain-pro-empty">No decision analysis is waiting.</div>`;
    const act=byId('captainProActItems');
    if(act) act.innerHTML=signalRows.length?signalRows.slice(0,3).map(({v})=>`<article><b>${v.name}</b><p>Route to the live signal report, then open the affected vessel in Engine if action is required.</p><button type="button" data-captain-pro-vessel="${v.projectId}">OPEN SIGNAL REPORT</button></article>`).join(''):`<article><b>Fleet steady</b><p>No attention route is required right now.</p><button type="button" data-captain-pro-route="fleet">OPEN FLEET MAP</button></article>`;
    const record=byId('captainProRecordItems');
    if(record){const outcomes=readJsonLocal(CAPTAIN_OUTCOME_KEY,[]).slice(0,3);record.innerHTML=`<article><b>Captain's Log</b><p>Keep orders, decisions, outcomes and lessons in the durable command record.</p><button type="button" data-captain-pro-route="log">OPEN CAPTAIN'S LOG</button></article>${outcomes.map(o=>`<article class="captain-outcome"><b>${o.label}</b><p>${o.detail||'Durable command action recorded.'}</p><small>${new Date(o.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} • ${o.build}</small></article>`).join('')}<article><b>Current command picture</b><p>${attention?`${attention} attention signal${attention===1?'':'s'} remain open.`:'No open attention signals.'} ${trials?`${trials} sea trial${trials===1?'':'s'} active.`:''}</p></article>`;}
    const readiness=byId('captainProReadiness');if(readiness)readiness.textContent=window.__lastAdmiralReadinessReport?(window.__lastAdmiralReadinessReport.pass?(window.__lastAdmiralReadinessReport.warnings?'WATCH':'CLEAR'):'HOLD'):'NOT RUN';
  }

  function ensureCaptainCommandMode(){
    const room=byId('captainQuarters');
    if(!room)return;
    let bar=byId('captainCommandModeBar');
    if(!bar){
      bar=document.createElement('div');bar.id='captainCommandModeBar';bar.className='captain-command-mode-bar';
      bar.innerHTML=`<div><small>ENGINE ROOM / CAPTAIN'S QUARTERS • ${UPPER_COMMAND_BUILD}</small><strong>Watch → Decide → Act → Record</strong></div><div class="captain-command-mode-actions"><button id="captainCommandReturnBtn" type="button">← ENGINE ROOM</button><button id="captainCommandModeToggle" type="button">CINEMATIC VIEW</button></div>`;
      room.appendChild(bar);
    }
    let surface=byId('captainProfessionalSurface');
    if(!surface){
      surface=document.createElement('main');surface.id='captainProfessionalSurface';surface.className='captain-professional-surface';surface.setAttribute('aria-label','Captain professional command view');
      surface.innerHTML=`
        <header class="captain-pro-head"><div><small>PROFESSIONAL COMMAND</small><h2>Captain's Quarters</h2><p>Signal first. Decision second. Action third. Durable history last.</p></div><span>CAPTAIN AUTHORIZED</span></header>
        <section class="captain-pro-topline">
          <article class="captain-pro-changes"><small>WHAT CHANGED SINCE YOUR LAST VISIT</small><strong id="captainProChanged">Command picture refreshed.</strong><button type="button" data-captain-pro-route="watch">VIEW SIGNALS</button></article>
          <article class="captain-pro-live"><small>LIVE FLEET INTELLIGENCE</small><div><span><b id="captainProVessels">0</b><em>VESSELS</em></span><span><b id="captainProSailing">0</b><em>SAILING</em></span><span><b id="captainProTrials">0</b><em>SEA TRIAL</em></span><span><b id="captainProSignals">0</b><em>SIGNALS</em></span></div></article>
        </section>
        <section class="captain-command-decks" aria-label="Captain command loop">
          <article class="captain-command-lane"><header><small>01 · WATCH</small><h3>What needs my attention?</h3><p>Fleet signals and First Mate intelligence.</p></header><div id="captainProWatchItems" class="captain-lane-body"></div><button type="button" class="captain-lane-footer" data-captain-pro-route="watch">VIEW ALL SIGNALS →</button></article>
          <article class="captain-command-lane"><header><small>02 · DECIDE</small><h3>Why does it matter?</h3><p>Understand the signal before choosing a course.</p></header><div id="captainProDecideItems" class="captain-lane-body"></div><button type="button" class="captain-lane-footer" data-captain-pro-route="spyglass">OPEN FIRST MATE ANALYSIS →</button></article>
          <article class="captain-command-lane"><header><small>03 · ACT</small><h3>Take the right route.</h3><p>Route deliberately without breaking project boundaries.</p></header><div id="captainProActItems" class="captain-lane-body"></div><button type="button" class="captain-lane-footer" data-captain-pro-route="fleet">VIEW FLEET MAP →</button></article>
          <article class="captain-command-lane"><header><small>04 · RECORD</small><h3>Keep the decision.</h3><p>Orders, notes, history, outcomes and retained lessons.</p></header><div id="captainProRecordItems" class="captain-lane-body"></div><button type="button" class="captain-lane-footer" data-captain-pro-route="log">VIEW HISTORY →</button></article>
        </section>
        <section class="captain-fleet-glance" aria-label="Fleet status at a glance"><h3>FLEET STATUS AT A GLANCE</h3><div><article><small>VESSELS</small><strong id="captainGlanceVessels">6</strong><span>Known to Dark Sky</span></article><article><small>SAILING</small><strong id="captainGlanceSailing">0</strong><span>Active outposts</span></article><article><small>SEA TRIAL</small><strong id="captainGlanceTrials">0</strong><span>Testing now</span></article><article><small>FLEET READINESS</small><strong id="captainProReadiness">NOT RUN</strong><span>Current command gate</span></article><article><small>SIGNALS</small><strong id="captainGlanceSignals">0</strong><span>Need your eye</span></article></div></section>
        <section class="captain-tools-deck"><h3>CAPTAIN'S TOOLS</h3><div><button type="button" data-captain-pro-route="readiness"><b>Fleet Readiness</b><small>Check fleet health</small></button><button type="button" data-captain-pro-route="workshop"><b>Workshop</b><small>Build & configure</small></button><button type="button" data-captain-pro-route="forge"><b>Visual Forge</b><small>Brand & experience</small></button><button type="button" data-captain-pro-route="blueprint"><b>Blueprint</b><small>Layouts & architecture</small></button><button type="button" data-captain-pro-route="admiral"><b>Admiral's Gate</b><small>Trial higher command</small></button></div></section>
        <div id="captainProfessionalStatus" class="captain-professional-status">Professional command is the operational truth. Cinematic View uses the same command model.</div>`;
      room.appendChild(surface);
      surface.addEventListener('click',e=>{
        const vesselBtn=e.target.closest('[data-captain-pro-vessel]');if(vesselBtn){recordCaptainOutcome('route','Signal route opened',vesselBtn.dataset.captainProVessel);const desk=ensureCaptainDeskIndex();const fleetBtn=desk?.querySelector('[data-cq-desk-route="fleet"]');if(fleetBtn)fleetBtn.click();requestAnimationFrame(()=>openSignalReport(vesselBtn.dataset.captainProVessel));return;}
        const btn=e.target.closest('[data-captain-pro-route]');if(!btn)return;recordCaptainOutcome('command',`Captain command: ${btn.dataset.captainProRoute}`,btn.textContent.trim().slice(0,80));
        const desk=ensureCaptainDeskIndex();
        const target=desk?.querySelector(`[data-cq-desk-route="${btn.dataset.captainProRoute}"]`);
        if(target)target.click();else{const status=byId('captainProfessionalStatus');if(status)status.textContent='That command station is not available on this hull.';}
      });
    }
    room.dataset.commandMode='professional';
    const toggle=byId('captainCommandModeToggle');
    const commandReturn=byId('captainCommandReturnBtn');
    if(commandReturn&&!commandReturn.dataset.bound){commandReturn.dataset.bound='1';commandReturn.onclick=()=>window.DarkSkyFleetNavigator?.navigate('engine',{source:'captain'})||secure();}
    const sync=()=>{const pro=room.dataset.commandMode==='professional'; if(toggle){toggle.textContent=pro?'CINEMATIC VIEW':'PROFESSIONAL VIEW';toggle.setAttribute('aria-pressed',String(!pro));} if(pro)room.classList.add('captain-entry-complete');};
    if(toggle&&!toggle.dataset.bound){toggle.dataset.bound='1';toggle.onclick=()=>{const from=room.dataset.commandMode||'professional';const scroller=from==='professional'?byId('captainProfessionalSurface'):room;try{room.dataset[from+'Scroll']=String(scroller?.scrollTop||0);}catch(_){ }room.dataset.commandMode=from==='professional'?'cinematic':'professional';sync();requestAnimationFrame(()=>{const to=room.dataset.commandMode;const target=to==='professional'?byId('captainProfessionalSurface'):room;const pos=Number(room.dataset[to+'Scroll']||0);if(target)target.scrollTop=pos;});if(room.dataset.commandMode==='cinematic')playEntrance();};}
    sync();
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
      ensureCaptainCommandMode();
      refreshChartroomLive();
    };
    image.onerror=()=>{
      // Deliberate fallback: keep the known-good v2.9.51 cabin fully usable.
      room.classList.remove('cinematic-cabin-ready');
      room.classList.add('cinematic-cabin-failed');
      ensureCaptainDeskIndex();
      ensureCaptainCommandMode();
    };
    image.src='captains_quarters_command_center_v578.png';
  }

  function bind() {
    document.documentElement.classList.add('captain-controller-ready');
    prepareCinematicCabin();
    hydrateUpperCommandVisuals();
    document.querySelectorAll('[data-command-jump]').forEach(btn=>btn.addEventListener('click',()=>{const el=byId(btn.dataset.commandJump);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}));
    window.DarkSkyFleetNavigator?.register('captain',()=>{if(authorized){hide('admiralDeck');hide('admiralGateOverlay');show('captainQuarters');show('captainGlobalExit');document.body.classList.add('captain-modal-open','captain-authorized');}else openGate();});
    window.DarkSkyFleetNavigator?.register('admiral',()=>openAdmiralGate('engine'));
    document.querySelectorAll('[data-command-open="captain"]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();window.DarkSkyFleetNavigator?.navigate('captain',{source:'engine'})||openGate();}));
    document.querySelectorAll('[data-command-open="admiral"]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();window.DarkSkyFleetNavigator?.navigate('admiral',{source:'engine'})||openAdmiralGate('engine');}));

    // Direct listeners are safe here because this file loads at the very end of BODY.
    byId('captainModeAccessBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      window.DarkSkyFleetNavigator?.navigate('captain',{source:'engine'})||openGate();
    });
    byId('captainGateCloseBtn')?.addEventListener('click', (event) => {event.preventDefault();window.DarkSkyFleetNavigator?.navigate('engine',{source:'captain-gate'})||closeGate();});
    byId('captainUnlockBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      unlock();
    });
    byId('captainQuartersCloseBtn')?.addEventListener('click',()=>window.DarkSkyFleetNavigator?.navigate('engine',{source:'captain'})||secure());
    byId('captainExitBtn')?.addEventListener('click',()=>window.DarkSkyFleetNavigator?.navigate('engine',{source:'captain'})||secure());
    byId('captainGlobalExit')?.addEventListener('click',()=>window.DarkSkyFleetNavigator?.navigate('engine',{source:'captain'})||secure());
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

/* 8.8.11 Fleet Door Repair — canonical vessel identity, Admiral-controlled. */
;(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1',MAX_BYTES=2*1024*1024;
  let vessels=[],draftFile=null,draftUrl='',busy=false;
  const el=id=>document.getElementById(id);
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const readSession=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(_){return null}};
  const saveSession=data=>{if(!data?.access_token)return null;const session={access_token:data.access_token,refresh_token:data.refresh_token||'',expires_at:Date.now()+Math.max(60,Number(data.expires_in||3600))*1000,user:data.user||null};sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));return session;};
  const clearSession=()=>sessionStorage.removeItem(SESSION_KEY);
  const apiHeaders=(token='',json=true)=>{const c=cfg(),value={apikey:c?.publishableKey||''};if(token)value.Authorization='Bearer '+token;if(json)value['Content-Type']='application/json';return value;};
  async function refreshSession(session){const c=cfg();if(!c||!session?.refresh_token)return null;const response=await fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:apiHeaders(),body:JSON.stringify({refresh_token:session.refresh_token})});return response.ok?saveSession(await response.json()):null;}
  async function currentSession(){let session=readSession();if(session&&session.expires_at>Date.now()+30000)return session;if(session?.refresh_token)session=await refreshSession(session);return session;}
  async function rpc(name,body={}){const c=cfg(),session=await currentSession();if(!c?.url||!session?.access_token)throw new Error('Authenticate the Admiral identity first.');const response=await fetch(c.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{...apiHeaders(session.access_token),Accept:'application/json'},body:JSON.stringify(body)});if(!response.ok){let message='The logo command was refused. No vessel identity changed.';try{const problem=await response.json();message=problem?.message||problem?.hint||message;}catch(_){}if(/could not find the function|schema cache/i.test(message))throw new Error('Fleet Core upgrade 8.8.11 is required before Vessel Logo Helm can operate. No data changed.');throw new Error(message.replaceAll('_',' '));}return response.json();}
  async function verifyAdmiral(){const c=cfg(),session=await currentSession();if(!c||!session?.access_token)return false;const response=await fetch(c.url+'/rest/v1/fleet_global_authorities?select=user_id&authority_role=eq.admiral&active=eq.true',{headers:{...apiHeaders(session.access_token),Accept:'application/json'}});if(!response.ok)return false;const rows=await response.json();return Array.isArray(rows)&&rows.length===1;}
  function install(){if(el('admiralBrandOpen'))return;const panel=document.querySelector('[data-admiral-panel="promote"]');if(!panel)return;panel.insertAdjacentHTML('beforeend',`<div class="admiral-lane-summary admiral-brand-summary"><b>Vessel Logo Helm</b><span>Replace a vessel's public mark without changing its permanent keel, records, or authority.</span></div><button id="admiralBrandOpen" class="admiral-pro-button" type="button">OPEN VESSEL LOGO HELM</button><section id="admiralBrandStation" class="admiral-entitlement-station admiral-course-station admiral-brand-station hidden" aria-label="Vessel Logo Helm"><header><div><small>SERVER-GOVERNED ADMIRAL BRANDING</small><h5>Vessel Logo Helm</h5><p>Choose one vessel, inspect its canonical mark, then replace it or restore the approved default.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralBrandIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralBrandClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer"><b>The logo is editable; the keel is not.</b> A logo change never renames the vessel, changes its project key, grants authority, or changes feature entitlements.</p><div id="admiralBrandAuth" class="admiral-identity-row"><label>Admiral email<input id="admiralBrandEmail" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input id="admiralBrandPassword" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralBrandSignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralBrandRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralBrandSignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-brand-grid"><section class="admiral-brand-controls"><small>1 · COMMAND DESTINATION</small><label>Vessel<select id="admiralBrandVessel" disabled><option>Authenticate to read Fleet Core</option></select></label><small>2 · REPLACEMENT MARK</small><label class="admiral-brand-file">Choose PNG, JPEG, or WebP<input id="admiralBrandFile" type="file" accept="image/png,image/jpeg,image/webp" disabled></label><label>Order intent<input id="admiralBrandIntent" type="text" maxlength="500" placeholder="Optional reason for the record" disabled></label><div class="admiral-brand-actions"><button id="admiralBrandSave" class="admiral-pro-button is-primary" type="button" disabled>SAVE AS CANONICAL LOGO</button><button id="admiralBrandRestore" class="admiral-pro-button" type="button" disabled>RESTORE APPROVED DEFAULT</button></div></section><section class="admiral-brand-preview" aria-live="polite"><div><small>CANONICAL VESSEL MARK</small><strong id="admiralBrandName">Awaiting identity</strong><span id="admiralBrandState">No public mark changes until an Admiral command is verified.</span></div><figure><img id="admiralBrandImage" src="bootstrap_build_logo.png" alt="Vessel logo preview"></figure><p id="admiralBrandSource">Approved Bootstrap Build mark</p></section></div><div id="admiralBrandResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to manage vessel logos.</div><div class="admiral-package-note"><b>Authority boundary</b><span>Only an active Admiral may save the canonical path. Public customers can read the published mark; they cannot replace it.</span></div></section>`);}
  function installFleetDoor(){if(el('bootstrapFleetOpenPromote'))return;const commissioning=el('admiralCommissioningOpen');if(!commissioning)return;commissioning.insertAdjacentHTML('afterend','<div class="admiral-lane-summary bootstrap-fleet-door-summary"><b>Black Flag Fleet Registry</b><span>See every independent Fleet Core member, mission level, permanent key, operating model, and current mark in one read-only view.</span></div><button id="bootstrapFleetOpenPromote" class="admiral-pro-button bootstrap-fleet-primary-door" type="button">OPEN FLEET REGISTRY</button>');}
  function installCommissionBrand(){if(el('admiralCommissioningBrandKit'))return;const anchor=el('admiralCommissioningSummary')?.closest('label');if(!anchor)return;const kit=document.createElement('section');kit.id='admiralCommissioningBrandKit';kit.className='admiral-commissioning-brand-kit';kit.innerHTML='<div><small>SEPARATE ADMIRAL-LEVEL PROGRAM</small><strong>Bootstrap Build founding mark</strong><span>One independent program · never a parent of other vessels</span></div><figure><img src="bootstrap_build_logo.png" alt="Bootstrap Build primary vessel badge"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build horizontal lockup"><img src="bootstrap_build_icon.png" alt="Bootstrap Build compact fleet icon"></figure>';anchor.after(kit);}
  function setResult(message,verified=false){const node=el('admiralBrandResult');if(!node)return;node.textContent=message;node.classList.toggle('is-verified',verified);}
  function setBusy(next){busy=next;const verified=el('admiralBrandStation')?.classList.contains('identity-verified');if(el('admiralBrandVessel'))el('admiralBrandVessel').disabled=next||!verified;if(el('admiralBrandFile'))el('admiralBrandFile').disabled=next||!verified;if(el('admiralBrandIntent'))el('admiralBrandIntent').disabled=next||!verified;if(el('admiralBrandSave'))el('admiralBrandSave').disabled=next||!verified||!draftFile;if(el('admiralBrandRestore'))el('admiralBrandRestore').disabled=next||!verified||!selected()?.logo_storage_path;}
  function selected(){return vessels.find(item=>item.project_id===el('admiralBrandVessel')?.value)||vessels[0]||null;}
  const defaultLogo=projectId=>projectId==='construction-scheduling-01'?'bootstrap_build_logo.png':'black_flag_primary_lockup.png';
  function publicLogo(path){if(!path)return '';const c=cfg();return c?.url+'/storage/v1/object/public/fleet-branding/'+path.split('/').map(encodeURIComponent).join('/');}
  function paint(){const vessel=selected(),image=el('admiralBrandImage');if(!vessel){if(el('admiralBrandName'))el('admiralBrandName').textContent='No Fleet Core vessel available';return;}const src=draftUrl||publicLogo(vessel.logo_storage_path)||defaultLogo(vessel.project_id);if(image){image.src=src;image.alt=vessel.display_name+' canonical logo preview';}if(el('admiralBrandName'))el('admiralBrandName').textContent=vessel.display_name;if(el('admiralBrandState'))el('admiralBrandState').textContent=(vessel.lifecycle_state||'fleet').toUpperCase()+' · '+vessel.project_id;if(el('admiralBrandSource'))el('admiralBrandSource').textContent=draftUrl?'Local preview · not saved':vessel.logo_storage_path?'Custom canonical logo · Fleet Core verified':vessel.project_id==='construction-scheduling-01'?'Approved Bootstrap Build default':'Approved fleet default';setBusy(busy);}
  async function signIn(){const c=cfg(),email=el('admiralBrandEmail')?.value?.trim().toLowerCase(),password=el('admiralBrandPassword')?.value||'';if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');if(!email||!password)throw new Error('Enter the Admiral email and password.');const response=await fetch(c.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:apiHeaders(),body:JSON.stringify({email,password})});if(!response.ok)throw new Error('Admiral sign-in failed.');saveSession(await response.json());if(!(await verifyAdmiral())){clearSession();throw new Error('This account does not hold active Admiral authority.');}if(el('admiralBrandPassword'))el('admiralBrandPassword').value='';}
  async function loadVessels(){const data=await rpc('admiral_list_vessels_for_branding');vessels=Array.isArray(data.records)?data.records:[];const select=el('admiralBrandVessel');if(select)select.innerHTML=vessels.length?vessels.map(v=>'<option value="'+escapeHtml(v.project_id)+'">'+escapeHtml(v.display_name)+' · '+escapeHtml(v.project_id)+'</option>').join(''):'<option value="">No Fleet Core vessels found</option>';paint();window.dispatchEvent(new CustomEvent('darksky:admiral-fleet-updated',{detail:{records:window.DarkSkyReadAdmiralFleet?.()||[]}}));}
  async function sync(){ensureBootstrapIdentity();const verified=await verifyAdmiral();const station=el('admiralBrandStation');station?.classList.toggle('identity-verified',verified);if(el('admiralBrandIdentityState'))el('admiralBrandIdentityState').textContent=verified?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';['admiralBrandSignIn','admiralBrandRecover'].forEach(id=>el(id)?.classList.toggle('hidden',verified));['admiralBrandEmail','admiralBrandPassword'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',verified));el('admiralBrandSignOut')?.classList.toggle('hidden',!verified);if(verified){try{await loadVessels();setResult('Identity verified. Choose a vessel and replacement mark.');}catch(error){vessels=[];setResult(error.message);}}else{vessels=[];setResult('Authenticate the Admiral identity to manage vessel logos.');paint();}setBusy(false);return verified;}
  async function saveLogo(){const vessel=selected(),c=cfg(),session=await currentSession();if(!vessel||!draftFile||!c||!session)throw new Error('Choose a vessel and replacement logo first.');setBusy(true);setResult('Uploading the replacement mark. Fleet identity has not changed yet…');try{const ext={"image/png":'png',"image/jpeg":'jpg',"image/webp":'webp'}[draftFile.type],path=vessel.project_id+'/canonical.'+ext,url=c.url+'/storage/v1/object/fleet-branding/'+path.split('/').map(encodeURIComponent).join('/');const response=await fetch(url,{method:'POST',headers:{...apiHeaders(session.access_token,false),'Content-Type':draftFile.type,'x-upsert':'true'},body:draftFile});if(!response.ok){let message='Logo upload was refused. No canonical mark changed.';try{const problem=await response.json();message=problem?.message||problem?.error||message;}catch(_){}throw new Error(message);}const data=await rpc('admiral_set_vessel_logo',{p_project_id:vessel.project_id,p_storage_path:path,p_intent:el('admiralBrandIntent')?.value?.trim()||''});vessel.logo_storage_path=data.logo_storage_path;vessel.logo_updated_at=data.logo_updated_at;draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';if(el('admiralBrandFile'))el('admiralBrandFile').value='';if(el('admiralBrandIntent'))el('admiralBrandIntent').value='';paint();setResult('LOGO VERIFIED · '+vessel.display_name+' now uses the replacement canonical mark.',true);}finally{setBusy(false);}}
  async function restoreLogo(){const vessel=selected();if(!vessel?.logo_storage_path)return;if(!window.confirm('Restore the approved default logo for '+vessel.display_name+'?\n\nThe vessel keel and records will not change.'))return;setBusy(true);try{await rpc('admiral_set_vessel_logo',{p_project_id:vessel.project_id,p_storage_path:'',p_intent:el('admiralBrandIntent')?.value?.trim()||'Restore approved vessel logo'});vessel.logo_storage_path=null;draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';paint();setResult('DEFAULT RESTORED · '+vessel.display_name+' now uses its approved fleet mark.',true);}finally{setBusy(false);}}
  let bootstrapIdentityObserver;
  function ensureBootstrapIdentity(){install();installFleetDoor();installCommissionBrand();if(el('bootstrapFleetOpenPromote')&&el('admiralBrandOpen')&&el('admiralCommissioningBrandKit'))bootstrapIdentityObserver?.disconnect();}
  bootstrapIdentityObserver=new MutationObserver(ensureBootstrapIdentity);bootstrapIdentityObserver.observe(document.documentElement,{childList:true,subtree:true});ensureBootstrapIdentity();window.DarkSkySyncVesselBrandIdentity=sync;window.DarkSkyReadAdmiralFleet=()=>vessels.map(vessel=>({...vessel,logo_url:publicLogo(vessel.logo_storage_path)||defaultLogo(vessel.project_id)}));
  document.addEventListener('click',async event=>{const target=event.target;if(target.closest('#admiralBrandOpen')){el('admiralBrandStation')?.classList.remove('hidden');try{await sync();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralBrandClose')){el('admiralBrandStation')?.classList.add('hidden');return;}if(target.closest('#admiralBrandSignIn')){const button=el('admiralBrandSignIn');if(button?.disabled)return;try{button.disabled=true;button.textContent='AUTHENTICATING…';await signIn();await sync();window.DarkSkySyncAdmiralIdentity?.();}catch(error){setResult(error.message);}finally{button.disabled=false;button.textContent='AUTHENTICATE ADMIRAL';}return;}if(target.closest('#admiralBrandRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}if(target.closest('#admiralBrandSignOut')){clearSession();await sync();window.DarkSkySyncAdmiralIdentity?.();return;}if(target.closest('#admiralBrandSave')){try{await saveLogo();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralBrandRestore')){try{await restoreLogo();}catch(error){setResult(error.message);}return;}});
  document.addEventListener('change',event=>{if(event.target.matches('#admiralBrandVessel')){draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';paint();return;}if(event.target.matches('#admiralBrandFile')){const file=event.target.files?.[0]||null;if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){event.target.value='';setResult('Choose a PNG, JPEG, or WebP logo.');return;}if(file.size>MAX_BYTES){event.target.value='';setResult('The logo must be 2 MB or smaller.');return;}draftFile=file;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl=URL.createObjectURL(file);paint();setResult('Local preview ready. Nothing changes until SAVE AS CANONICAL LOGO is verified.');}});
})();

/* 8.8.11 Bootstrap Build — local-first construction schedule proving ground. */
;(()=>{
  const STORE='bootstrapBuildSchedulePrototypeV1';
  const hierarchy={region:'ABC',division:'CBA',community:'AB',lot:'1234',unit:'A'};
  const seed=()=>[
    {id:'site-layout',title:'Site layout & utility locate',trade:'Sitework',day:0},
    {id:'excavation',title:'Excavation & footing forms',trade:'Foundation',day:0},
    {id:'footing-inspection',title:'Footing inspection',trade:'Inspection',day:1},
    {id:'foundation-pour',title:'Foundation pour',trade:'Concrete',day:1},
    {id:'waterproof',title:'Waterproofing & backfill',trade:'Foundation',day:2},
    {id:'framing',title:'Floor system & framing',trade:'Framing',day:2},
    {id:'dry-in',title:'Roof dry-in',trade:'Framing',day:3},
    {id:'mep',title:'MEP rough-ins',trade:'Mechanical',day:4},
    {id:'drywall',title:'Insulation & drywall',trade:'Interiors',day:5},
    {id:'walkthrough',title:'Final walkthrough',trade:'Closeout',day:6}
  ];
  let state=read(),selectedId='',vendorView='',touchDrag=null,overDay=null,suppressClickUntil=0;
  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function read(){try{const value=JSON.parse(localStorage.getItem(STORE)||'null');if(value&&Array.isArray(value.tasks))return value;}catch(_){}return {hierarchy,tasks:seed(),weekOffset:0};}
  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  function monday(){const date=new Date(),day=(date.getDay()+6)%7;date.setHours(12,0,0,0);date.setDate(date.getDate()-day+(state.weekOffset||0)*7);return date;}
  function dayDate(index){const date=monday();date.setDate(date.getDate()+index);return date;}
  function install(){const kit=el('admiralCommissioningBrandKit');const missionOption=el('admiralCommissioningClass')?.querySelector('option[value="admiral_program"]');if(missionOption)missionOption.textContent='Admiral-level program';if(kit&&!el('bootstrapScheduleOpen'))kit.insertAdjacentHTML('beforeend','<button id="bootstrapScheduleOpen" class="admiral-pro-button" type="button">OPEN TEST CONSTRUCTION SCHEDULE</button>');if(!el('bootstrapFleet'))document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapFleet" class="bootstrap-fleet hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Black Flag Admiral Fleet Registry"><div class="bootstrap-fleet-shell"><header><img src="black_flag_primary_lockup.png" alt="Black Flag Business Command Platform"><div><small>BLACK FLAG · ADMIRAL FLEET REGISTRY</small><h2>Independent Fleet</h2><p>One registry. Independent vessels. Governed capabilities can travel; authority and data do not.</p></div><div><button id="bootstrapFleetRefresh" type="button">REFRESH REGISTRY</button><button id="bootstrapFleetClose" type="button">CLOSE</button></div></header><p id="bootstrapFleetStatus" class="bootstrap-fleet-status" role="status">Reading the Fleet Registry…</p><div id="bootstrapFleetRows" class="bootstrap-fleet-rows"></div><aside class="bootstrap-fleet-passage"><b>Shared Capability Passage</b><span>Any fleet member may adopt an approved capability at its own level. Adoption never transfers ownership, authority, branding, or project data.</span></aside><footer><b>Read-only registry boundary</b><span>This view cannot rename, commission, publish, entitle, or otherwise change a vessel.</span></footer></div></section>`);if(el('bootstrapSchedule'))return;document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapSchedule" class="bootstrap-schedule hidden" aria-label="Bootstrap Build construction schedule prototype"><div class="bootstrap-schedule-shell"><header class="bootstrap-schedule-head"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build"><div><small>ADMIRAL-LEVEL PROGRAM · TEST WORKSPACE</small><h2>Construction Schedule</h2><p>Drag familiar work between days for the test unit.</p></div><div class="bootstrap-schedule-head-actions"><button id="bootstrapFleetOpenFromSchedule" type="button">FLEET REGISTRY</button><button id="bootstrapScheduleClose" type="button">CLOSE</button></div></header><nav class="bootstrap-schedule-crumbs" aria-label="Test project hierarchy"><span><small>REGION</small><b>ABC</b></span><i>›</i><span><small>DIVISION</small><b>CBA</b></span><i>›</i><span><small>COMMUNITY</small><b>AB</b></span><i>›</i><span><small>LOT</small><b>1234</b></span><i>›</i><span><small>UNIT</small><b>A</b></span></nav><div class="bootstrap-schedule-toolbar"><div><button id="bootstrapSchedulePrev" type="button">← PRIOR WEEK</button><strong id="bootstrapScheduleWeek"></strong><button id="bootstrapScheduleNext" type="button">NEXT WEEK →</button></div><div><button id="bootstrapScheduleAdd" type="button">+ ADD TASK</button><button id="bootstrapScheduleReset" type="button">RESET TEST DATA</button></div></div><form id="bootstrapScheduleForm" class="bootstrap-schedule-form hidden"><label>Task<input id="bootstrapScheduleTitle" maxlength="80" required placeholder="Construction task"></label><label>Trade<input id="bootstrapScheduleTrade" maxlength="40" required placeholder="Trade or crew"></label><label>Day<select id="bootstrapScheduleDay"></select></label><button type="submit">ADD TO SCHEDULE</button><button id="bootstrapScheduleCancel" type="button">CANCEL</button></form><p id="bootstrapScheduleStatus" class="bootstrap-schedule-status" role="status">Test schedule ready. Drag a task card to another day.</p><div id="bootstrapScheduleBoard" class="bootstrap-schedule-board"></div><footer><b>Test boundary</b><span>This calendar is browser-local test data for Region ABC. It does not create a Fleet Core vessel, customer commitment, owner assignment, or live construction record.</span></footer></div></section>`);}
  function render(){const start=monday(),end=dayDate(6);if(el('bootstrapScheduleWeek'))el('bootstrapScheduleWeek').textContent=start.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' – '+end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});const daySelect=el('bootstrapScheduleDay');if(daySelect)daySelect.innerHTML=Array.from({length:7},(_,day)=>'<option value="'+day+'">'+dayDate(day).toLocaleDateString(undefined,{weekday:'long'})+'</option>').join('');const board=el('bootstrapScheduleBoard');if(!board)return;board.innerHTML=Array.from({length:7},(_,day)=>{const date=dayDate(day),tasks=state.tasks.filter(task=>task.day===day);return '<section class="bootstrap-schedule-day'+(overDay===day?' is-over':'')+'" data-schedule-day="'+day+'"><header><div><small>'+esc(date.toLocaleDateString(undefined,{weekday:'short'}))+'</small><b>'+esc(date.toLocaleDateString(undefined,{month:'short',day:'numeric'}))+'</b></div><button type="button" data-schedule-move="'+day+'"'+(selectedId?'':' disabled')+'>MOVE HERE</button></header><div class="bootstrap-schedule-list">'+(tasks.length?tasks.map(task=>'<article class="bootstrap-schedule-card'+(selectedId===task.id?' is-selected':'')+'" draggable="true" tabindex="0" data-task-id="'+esc(task.id)+'"><small>'+esc(task.trade)+'</small><b>'+esc(task.title)+'</b><span>Lot 1234 · Unit A</span><em>DRAG TO RESCHEDULE</em></article>').join(''):'<p>Drop work here</p>')+'</div></section>';}).join('');}
  function renderFleet(records=[]){const rows=el('bootstrapFleetRows'),statusNode=el('bootstrapFleetStatus');if(!rows)return;if(!records.length){rows.innerHTML='<article class="bootstrap-fleet-empty"><img src="black_flag_platform_icon.png" alt="Black Flag fleet registry"><div><b>Fleet Registry is awaiting an authenticated read</b><span>Authenticate the Admiral identity, then tap REFRESH REGISTRY. No vessel or fleet state will change.</span></div></article>';if(statusNode)statusNode.textContent='No Fleet Core vessels are visible in this authenticated read yet.';return;}rows.innerHTML=records.map(vessel=>{const mission=String(vessel.mission_class||'independent_business').replaceAll('_',' ').toUpperCase(),ownership=String(vessel.ownership_model||'fleet_unassigned').replaceAll('_',' ').toUpperCase(),operating=String(vessel.operating_model||'fleet_operated').replaceAll('_',' ').toUpperCase(),isAdmiral=vessel.mission_class==='admiral_program';return '<article class="bootstrap-fleet-card'+(isAdmiral?' is-admiral-program':'')+'"><img src="'+esc(vessel.logo_url||'black_flag_primary_lockup.png')+'" alt="'+esc(vessel.display_name)+' vessel mark"><div><small>'+esc(mission)+'</small><b>'+esc(vessel.display_name)+'</b><span>'+esc(vessel.project_id)+'</span><span class="bootstrap-fleet-command">'+esc(operating)+' · '+esc(ownership)+'</span></div><em>'+esc(String(vessel.lifecycle_state||'fleet').replaceAll('_',' ').toUpperCase())+'</em></article>';}).join('');if(statusNode)statusNode.textContent=records.length+' independent Fleet Core member'+(records.length===1?'':'s')+' visible · read only.';}
  async function loadFleet(){const statusNode=el('bootstrapFleetStatus');if(statusNode)statusNode.textContent='Reading the authenticated Admiral Fleet…';try{await window.DarkSkySyncVesselBrandIdentity?.();renderFleet(window.DarkSkyReadAdmiralFleet?.()||[]);}catch(error){renderFleet([]);if(statusNode)statusNode.textContent=error?.message||'The Admiral Fleet could not be read. No data changed.';}}
  function status(message){if(el('bootstrapScheduleStatus'))el('bootstrapScheduleStatus').textContent=message;}
  function move(id,day){const task=state.tasks.find(item=>item.id===id);if(!task)return;task.day=Math.max(0,Math.min(6,Number(day)));selectedId='';overDay=null;save();render();status(task.title+' moved to '+dayDate(task.day).toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})+'. Test data saved locally.');}
  function open(){install();el('bootstrapSchedule')?.classList.remove('hidden');render();}
  function openFleet(){install();const fleet=el('bootstrapFleet');if(!fleet)return;fleet.classList.remove('hidden');fleet.setAttribute('aria-hidden','false');document.body.classList.add('bootstrap-fleet-open');fleet.scrollTop=0;if(el('bootstrapFleetStatus'))el('bootstrapFleetStatus').textContent='Admiral Fleet opened. Reading Fleet Core…';requestAnimationFrame(()=>el('bootstrapFleetClose')?.focus({preventScroll:true}));loadFleet();}
  install();window.DarkSkyOpenBootstrapSchedule=open;window.DarkSkyOpenAdmiralFleet=openFleet;window.addEventListener('darksky:admiral-fleet-updated',event=>renderFleet(event.detail?.records||[]));
  document.addEventListener('click',event=>{const trigger=event.target.closest?.('#bootstrapFleetOpen,#bootstrapFleetOpenPromote,#bootstrapFleetOpenFromSchedule');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();openFleet();},{capture:true});
  document.addEventListener('click',event=>{const target=event.target;if(target.closest('#bootstrapFleetClose')){const fleet=el('bootstrapFleet');fleet?.classList.add('hidden');fleet?.setAttribute('aria-hidden','true');document.body.classList.remove('bootstrap-fleet-open');return;}if(target.closest('#bootstrapFleetRefresh')){loadFleet();return;}if(target.closest('#bootstrapScheduleOpen')){open();return;}if(target.closest('#bootstrapScheduleClose')){el('bootstrapSchedule')?.classList.add('hidden');return;}if(target.closest('#bootstrapSchedulePrev')){state.weekOffset=(state.weekOffset||0)-1;save();render();return;}if(target.closest('#bootstrapScheduleNext')){state.weekOffset=(state.weekOffset||0)+1;save();render();return;}if(target.closest('#bootstrapScheduleAdd')){el('bootstrapScheduleForm')?.classList.remove('hidden');el('bootstrapScheduleTitle')?.focus();return;}if(target.closest('#bootstrapScheduleCancel')){el('bootstrapScheduleForm')?.classList.add('hidden');return;}if(target.closest('#bootstrapScheduleReset')){if(window.confirm('Reset the Region ABC test schedule to its original tasks?')){state={hierarchy,tasks:seed(),weekOffset:0};selectedId='';save();render();status('Region ABC test schedule reset.');}return;}const card=target.closest('[data-task-id]');if(card){if(Date.now()<suppressClickUntil)return;selectedId=selectedId===card.dataset.taskId?'':card.dataset.taskId;render();status(selectedId?'Task selected. Drag it or tap MOVE HERE on a day.':'Task selection cleared.');return;}const moveButton=target.closest('[data-schedule-move]');if(moveButton&&selectedId){move(selectedId,moveButton.dataset.scheduleMove);return;}});
  document.addEventListener('submit',event=>{if(event.target.id!=='bootstrapScheduleForm')return;event.preventDefault();const title=el('bootstrapScheduleTitle')?.value?.trim(),trade=el('bootstrapScheduleTrade')?.value?.trim(),day=Number(el('bootstrapScheduleDay')?.value||0);if(!title||!trade)return;state.tasks.push({id:'task-'+Date.now(),title,trade,day});save();event.target.reset();event.target.classList.add('hidden');render();status(title+' added to the local test schedule.');});
  document.addEventListener('dragstart',event=>{const card=event.target.closest?.('[data-task-id]');if(!card)return;selectedId=card.dataset.taskId;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',selectedId);card.classList.add('is-dragging');});
  document.addEventListener('dragover',event=>{const day=event.target.closest?.('[data-schedule-day]');if(!day)return;event.preventDefault();overDay=Number(day.dataset.scheduleDay);document.querySelectorAll('.bootstrap-schedule-day').forEach(node=>node.classList.toggle('is-over',node===day));});
  document.addEventListener('drop',event=>{const day=event.target.closest?.('[data-schedule-day]');if(!day)return;event.preventDefault();move(event.dataTransfer.getData('text/plain')||selectedId,day.dataset.scheduleDay);});
  document.addEventListener('dragend',()=>{overDay=null;document.querySelectorAll('.bootstrap-schedule-day,.bootstrap-schedule-card').forEach(node=>node.classList.remove('is-over','is-dragging'));});
  document.addEventListener('pointerdown',event=>{const card=event.target.closest?.('[data-task-id]');if(!card||event.pointerType==='mouse')return;selectedId=card.dataset.taskId;touchDrag={id:selectedId,pointerId:event.pointerId};card.setPointerCapture?.(event.pointerId);card.classList.add('is-dragging');});
  document.addEventListener('pointermove',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;event.preventDefault();const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('[data-schedule-day]');overDay=target?Number(target.dataset.scheduleDay):null;document.querySelectorAll('.bootstrap-schedule-day').forEach(node=>node.classList.toggle('is-over',Number(node.dataset.scheduleDay)===overDay));},{passive:false});
  document.addEventListener('pointerup',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;const id=touchDrag.id,day=overDay;touchDrag=null;suppressClickUntil=Date.now()+500;if(day!==null)move(id,day);else{render();status('Task selected. Tap MOVE HERE on a day or drag it to reschedule.');}});
  document.addEventListener('pointercancel',()=>{touchDrag=null;overDay=null;render();});
  document.addEventListener('keydown',event=>{const card=event.target.closest?.('[data-task-id]');if(!card||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const task=state.tasks.find(item=>item.id===card.dataset.taskId);if(task)move(task.id,task.day+(event.key==='ArrowRight'?1:-1));});
})();

/* 8.8.11 Bootstrap Build Schedule — twelve-week, workday construction schedule proving ground. */
;(()=>{
  const STORE='bootstrapBuildGroundRunV2',WEEKS=12,DAYS=WEEKS*5;
  const hierarchy={region:'ABC',division:'CBA',community:'AB',lot:'1234',unit:'A'};
  const tasks=()=>[
    ['clearing','Clearing & erosion control','Sitework',0,2,'site'],['layout','House layout & utility locate','Survey',1,1,'inspection'],['excavation','Excavation','Sitework',3,2,'site'],['footers','Footers formed & poured','Concrete',5,2,'work'],['footing-insp','Footing inspection','Inspection',7,1,'inspection'],['foundation','Foundation block','Masonry',8,3,'work'],['foundation-insp','Foundation inspection','Inspection',11,1,'inspection'],['waterproof','Waterproofing & drain tile','Foundation',11,2,'site'],['backfill','Backfill & rough grade','Sitework',13,2,'site'],['slab-prep','Slab prep','Concrete',14,2,'work'],['slab-insp','Slab inspection','Inspection',16,1,'inspection'],['slab','Garage slab','Concrete',17,1,'work'],
    ['lumber','Lumber delivery','Delivery',18,1,'delivery'],['framing','Floor system & framing','Framing',19,7,'work'],['frame-check','Frame quality check','Inspection',25,1,'inspection'],['roof','Roof dry-in','Roofing',25,3,'site'],['windows','Windows & exterior doors','Carpentry',27,2,'site'],['rough-hvac','HVAC rough-in','Mechanical',28,3,'work'],['rough-plumb','Plumbing rough-in','Plumbing',29,3,'work'],['rough-electric','Electrical rough-in','Electrical',31,3,'work'],['rough-inspections','Rough trade inspections','Inspection',34,2,'inspection'],['insulation','Air seal & insulation','Insulation',36,3,'work'],['predrywall','Pre-drywall meeting','Milestone',38,1,'milestone'],['drywall-delivery','Drywall delivery','Delivery',39,1,'delivery'],['drywall','Drywall hang & finish','Drywall',40,6,'work'],
    ['exterior','Siding & exterior trim','Exterior',41,5,'site'],['prime','Prime & first paint','Painting',46,3,'work'],['cabinets','Cabinets & interior trim','Carpentry',47,4,'work'],['hard-surface','Hard-surface install','Flooring',49,3,'work'],['mep-final','MEP final fixtures','Mechanical',50,4,'work'],['appliances','Appliance delivery & install','Delivery',53,2,'delivery'],['carpet','Carpet','Flooring',54,2,'work'],['driveway','Driveway & exterior concrete','Concrete',54,3,'site'],['final-grade','Final grade & landscaping','Sitework',56,3,'site'],['final-insp','Final inspections','Inspection',57,2,'inspection'],['punch','Punchout','Closeout',57,3,'work'],['final-clean','Final clean','Closeout',59,1,'work'],['settlement','Settlement','Milestone',59,1,'milestone']
  ].map(([id,title,trade,start,duration,type])=>({id,title,trade,start,duration,type,vendor:vendorFor(trade)}));
  let state=read(),selectedId='',touchDrag=null,overDay=null,suppressClickUntil=0;
  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function vendorFor(trade){return ({Sitework:'Piedmont Siteworks',Survey:'Cardinal Survey',Inspection:'City & County Inspections',Concrete:'Blue Ridge Concrete',Masonry:'Commonwealth Masonry',Foundation:'DryLine Foundation',Delivery:'Builder Supply Logistics',Framing:'Timberline Framing',Roofing:'Summit Roofing',Carpentry:'Heritage Carpentry',Mechanical:'AirFlow Mechanical',Plumbing:'Legacy Plumbing',Electrical:'BrightWire Electric',Insulation:'Thermal Shield',Milestone:'Bootstrap Build Team',Drywall:'Finish Line Drywall',Exterior:'Carolina Exteriors',Painting:'TrueCoat Painting',Flooring:'Piedmont Floors',Closeout:'Bootstrap Build Team'})[trade]||trade+' Partner';}
  function read(){try{const value=JSON.parse(localStorage.getItem(STORE)||'null');if(value?.version>=2&&Array.isArray(value.tasks)){value.version=3;value.activity=Array.isArray(value.activity)?value.activity:[];value.tasks.forEach(task=>task.vendor=task.vendor||vendorFor(task.trade));return value;}}catch(_){}return {version:3,hierarchy,tasks:tasks(),activity:[]};}
  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  function anchor(){const date=new Date(),day=(date.getDay()+6)%7;date.setHours(12,0,0,0);date.setDate(date.getDate()-day);return date;}
  function workDate(index){const date=anchor(),weeks=Math.floor(index/5),weekday=index%5;date.setDate(date.getDate()+weeks*7+weekday);return date;}
  function labelDate(index,weekday=false){return workDate(index).toLocaleDateString(undefined,weekday?{weekday:'short',month:'short',day:'numeric'}:{month:'short',day:'numeric'});}
  function status(message){if(el('bootstrapScheduleStatus'))el('bootstrapScheduleStatus').textContent=message;}
  function install(){el('bootstrapSchedule')?.remove();document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapSchedule" class="bootstrap-schedule bootstrap-build-schedule hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Bootstrap Build construction schedule"><div class="bootstrap-schedule-shell"><header class="bootstrap-schedule-head"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build"><div><small>ADMIRAL-LEVEL PROGRAM · LOCAL TEST RUN</small><h2>Construction Schedule</h2><p>Move work from clearing through settlement across this sample project.</p></div><div class="bootstrap-schedule-head-actions"><button id="bootstrapFleetOpenFromSchedule" type="button">FLEET REGISTRY</button><button id="bootstrapScheduleClose" type="button">CLOSE</button></div></header><nav class="bootstrap-schedule-crumbs" aria-label="Test project hierarchy"><span><small>REGION</small><b>ABC</b></span><i>›</i><span><small>DIVISION</small><b>CBA</b></span><i>›</i><span><small>COMMUNITY</small><b>AB</b></span><i>›</i><span><small>LOT</small><b>1234</b></span><i>›</i><span><small>UNIT</small><b>A</b></span></nav><div class="bootstrap-schedule-toolbar"><div><strong id="bootstrapScheduleRange">SAMPLE PROJECT · 60 WORKDAYS</strong></div><div class="bootstrap-schedule-legend" aria-label="Task colors"><span data-kind="work">WORK</span><span data-kind="site">SITE</span><span data-kind="inspection">INSPECTION</span><span data-kind="delivery">DELIVERY</span><span data-kind="milestone">MILESTONE</span></div><div><button id="bootstrapScheduleAdd" type="button">+ ADD TASK</button><button id="bootstrapScheduleReset" type="button">RESET TEST DATA</button></div></div><form id="bootstrapScheduleForm" class="bootstrap-schedule-form bootstrap-ground-form hidden"><label>Task<input id="bootstrapScheduleTitle" maxlength="80" required placeholder="Construction task"></label><label>Trade<input id="bootstrapScheduleTrade" maxlength="40" required placeholder="Trade or crew"></label><label>Type<select id="bootstrapScheduleType"><option value="work">Work</option><option value="site">Site</option><option value="inspection">Inspection</option><option value="delivery">Delivery</option><option value="milestone">Milestone</option></select></label><label>Start<select id="bootstrapScheduleDay"></select></label><label>Days<input id="bootstrapScheduleDuration" type="number" min="1" max="15" value="1"></label><button type="submit">ADD TASK</button><button id="bootstrapScheduleCancel" type="button">CANCEL</button></form><p id="bootstrapScheduleStatus" class="bootstrap-schedule-status" role="status">Schedule ready. Drag a task to a new workday; its duration stays intact.</p><div id="bootstrapScheduleBoard" class="bootstrap-ground-board"></div><footer><b>Test boundary</b><span>This sample calendar is browser-local test data for Region ABC. It creates no vessel, customer commitment, owner assignment, or live construction record.</span></footer></div></section>`);}
  function vendors(){return [...new Set(state.tasks.map(task=>task.vendor||vendorFor(task.trade)))].sort((a,b)=>a.localeCompare(b));}
  function installVendorControls(){
    const toolbar=el('bootstrapSchedule')?.querySelector('.bootstrap-schedule-toolbar');
    if(toolbar&&!el('bootstrapVendorTools'))toolbar.insertAdjacentHTML('afterend','<section id="bootstrapVendorTools" class="bootstrap-vendor-tools"><div><label>Schedule view<select id="bootstrapVendorView"><option value="">All work</option></select></label><span id="bootstrapVendorViewNote">All project work is visible.</span></div><div><label>Selected task vendor<select id="bootstrapVendorAssign"></select></label><button id="bootstrapVendorAssignButton" type="button" disabled>ASSIGN VENDOR</button></div></section>');
    const board=el('bootstrapScheduleBoard');
    if(board&&!el('bootstrapVendorActivity'))board.insertAdjacentHTML('afterend','<section id="bootstrapVendorActivityPanel" class="bootstrap-vendor-activity"><header><div><small>VENDOR COMMUNICATION LOG</small><b>Schedule changes vendors can see</b></div><span>LOCAL TEST · NO MESSAGE SENT</span></header><div id="bootstrapVendorActivity"></div></section>');
  }
  function renderVendorLayer(){
    installVendorControls();
    let repaired=false;state.tasks.forEach(task=>{if(!task.vendor){task.vendor=vendorFor(task.trade);repaired=true;}});if(repaired)save();
    const options=vendors(),view=el('bootstrapVendorView'),assign=el('bootstrapVendorAssign');
    if(view){view.innerHTML='<option value="">All work</option>'+options.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');view.value=vendorView;}
    if(assign){assign.innerHTML=options.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');const chosen=state.tasks.find(task=>task.id===selectedId);if(chosen)assign.value=chosen.vendor;}
    const assignButton=el('bootstrapVendorAssignButton');if(assignButton)assignButton.disabled=!selectedId;
    const note=el('bootstrapVendorViewNote');if(note)note.textContent=vendorView?vendorView+' sees only its assigned work and schedule changes.':'All project work is visible.';
    document.querySelectorAll('#bootstrapSchedule [data-task-id]').forEach(card=>{const task=state.tasks.find(item=>item.id===card.dataset.taskId);if(!task)return;card.classList.toggle('vendor-hidden',!!vendorView&&task.vendor!==vendorView);if(!card.querySelector('.bootstrap-task-vendor'))card.insertAdjacentHTML('beforeend','<em class="bootstrap-task-vendor">'+esc(task.vendor)+'</em>');});
    const activity=el('bootstrapVendorActivity');if(activity)activity.innerHTML=state.activity.length?state.activity.slice(0,12).map(item=>'<article><b>'+esc(item.vendor)+'</b><span>'+esc(item.task)+(item.assignment?' reassigned from '+esc(item.from)+' to '+esc(item.to):' moved from '+esc(item.from)+' to '+esc(item.to))+'.</span><small>'+esc(new Date(item.at).toLocaleString())+'</small></article>').join(''):'<p>Move a task and its vendor schedule change will appear here.</p>';
  }
  function syncCommissioningCopy(){
    const doorway=el('bootstrapScheduleOpen');
    if(doorway&&doorway.textContent!=='OPEN BOOTSTRAP BUILD SCHEDULE')doorway.textContent='OPEN BOOTSTRAP BUILD SCHEDULE';
    const identity=el('admiralCommissioningIdentityState');
    const items=el('admiralCommissioningPreviewItems');
    if(identity?.textContent?.includes('VERIFIED')&&items?.textContent?.includes('Authenticate the Admiral identity'))items.innerHTML='<p>Review the permanent and editable fields, then preview the order.</p>';
  }
  function segmentsForWeek(week){const first=week*5,last=first+5,segments=[];state.tasks.forEach(task=>{const start=Math.max(task.start,first),end=Math.min(task.start+Math.max(1,task.duration||1),last);if(start<end)segments.push({task,start,end});});segments.sort((a,b)=>a.start-b.start||b.end-a.end||a.task.title.localeCompare(b.task.title));const lanes=[];segments.forEach(segment=>{let lane=lanes.findIndex(end=>end<=segment.start);if(lane<0){lane=lanes.length;lanes.push(segment.end);}else lanes[lane]=segment.end;segment.lane=lane;});return {segments,lanes:Math.max(2,lanes.length)};}
  function render(){const range=el('bootstrapScheduleRange');if(range)range.textContent=labelDate(0)+' – '+workDate(DAYS-1).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})+' · 12 WEEKS';const select=el('bootstrapScheduleDay');if(select)select.innerHTML=Array.from({length:DAYS},(_,day)=>'<option value="'+day+'">'+esc(labelDate(day,true))+'</option>').join('');const board=el('bootstrapScheduleBoard');if(!board)return;board.innerHTML=Array.from({length:WEEKS},(_,week)=>{const first=week*5,{segments,lanes}=segmentsForWeek(week);const heads=Array.from({length:5},(_,col)=>'<button type="button" class="bootstrap-ground-day-head'+(overDay===first+col?' is-over':'')+'" data-schedule-move="'+(first+col)+'" title="Move selected task here"><small>'+esc(workDate(first+col).toLocaleDateString(undefined,{weekday:'short'}))+'</small><b>'+esc(labelDate(first+col))+'</b></button>').join('');const cells=Array.from({length:5},(_,col)=>'<div class="bootstrap-ground-day-cell'+(overDay===first+col?' is-over':'')+'" data-schedule-day="'+(first+col)+'" style="grid-column:'+(col+1)+';grid-row:2 / span '+lanes+'"></div>').join('');const bars=segments.map(({task,start,end,lane})=>{const continuation=start>task.start,continues=end<task.start+task.duration;return '<article class="bootstrap-ground-task kind-'+esc(task.type||'work')+(selectedId===task.id?' is-selected':'')+'" draggable="true" tabindex="0" data-task-id="'+esc(task.id)+'" style="grid-column:'+(start-first+1)+' / span '+(end-start)+';grid-row:'+(lane+2)+'"><small>'+esc(task.trade)+'</small><b>'+(continuation?'← ':'')+esc(task.title)+(continues?' →':'')+'</b><span>'+esc(task.duration)+' workday'+(task.duration===1?'':'s')+'</span></article>';}).join('');return '<section class="bootstrap-ground-week"><header><small>WEEK '+(week+1)+'</small><b>'+esc(labelDate(first))+' – '+esc(labelDate(first+4))+'</b></header><div class="bootstrap-ground-week-grid" data-week="'+week+'" style="--task-lanes:'+lanes+'">'+heads+cells+bars+'</div></section>';}).join('');}
  const renderSchedule=render;render=()=>{renderSchedule();renderVendorLayer();};
  function move(id,day){const task=state.tasks.find(item=>item.id===id);if(!task)return;const from=task.start,next=Math.max(0,Math.min(DAYS-Math.max(1,task.duration||1),Number(day)));task.start=next;if(from!==next)state.activity.unshift({id:'move-'+Date.now(),at:new Date().toISOString(),task:task.title,vendor:task.vendor,from:labelDate(from,true),to:labelDate(next,true)});state.activity=state.activity.slice(0,100);selectedId='';overDay=null;save();render();status(task.title+' moved to '+labelDate(task.start,true)+'. '+task.duration+'-workday duration preserved; '+task.vendor+' can see the change.');}
  function dayAtPoint(x,y){for(const grid of document.querySelectorAll('.bootstrap-ground-week-grid')){const r=grid.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){const col=Math.max(0,Math.min(4,Math.floor((x-r.left)/(r.width/5))));return Number(grid.dataset.week)*5+col;}}return null;}
  function showOver(day){overDay=day;document.querySelectorAll('[data-schedule-day],[data-schedule-move]').forEach(node=>node.classList.toggle('is-over',Number(node.dataset.scheduleDay||node.dataset.scheduleMove)===day));}
  function open(){const panel=el('bootstrapSchedule');if(!panel)return;panel.classList.remove('hidden');panel.setAttribute('aria-hidden','false');panel.scrollTop=0;render();requestAnimationFrame(()=>el('bootstrapScheduleClose')?.focus({preventScroll:true}));}
  install();syncCommissioningCopy();new MutationObserver(syncCommissioningCopy).observe(document.body,{subtree:true,childList:true,characterData:true});window.DarkSkyOpenBootstrapSchedule=open;
  document.addEventListener('click',event=>{const target=event.target;if(target.closest('#bootstrapScheduleOpen')){event.preventDefault();event.stopImmediatePropagation();open();return;}if(!target.closest('#bootstrapSchedule'))return;if(target.closest('#bootstrapFleetOpenFromSchedule'))return;if(target.closest('#bootstrapScheduleClose')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapSchedule')?.classList.add('hidden');el('bootstrapSchedule')?.setAttribute('aria-hidden','true');return;}if(target.closest('#bootstrapScheduleAdd')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapScheduleForm')?.classList.remove('hidden');el('bootstrapScheduleTitle')?.focus();return;}if(target.closest('#bootstrapScheduleCancel')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapScheduleForm')?.classList.add('hidden');return;}if(target.closest('#bootstrapScheduleReset')){event.preventDefault();event.stopImmediatePropagation();if(window.confirm('Reset the Region ABC sample schedule?')){state={version:3,hierarchy,tasks:tasks(),activity:[]};selectedId='';save();render();status('Sample construction schedule restored from clearing through settlement.');}return;}const moveButton=target.closest('[data-schedule-move]');if(moveButton&&selectedId){event.preventDefault();event.stopImmediatePropagation();move(selectedId,Number(moveButton.dataset.scheduleMove));return;}const card=target.closest('[data-task-id]');if(card){event.preventDefault();event.stopImmediatePropagation();if(Date.now()<suppressClickUntil)return;selectedId=selectedId===card.dataset.taskId?'':card.dataset.taskId;render();status(selectedId?'Task selected. Tap a day heading or drag it to reschedule.':'Task selection cleared.');}},{capture:true});
  document.addEventListener('submit',event=>{if(event.target.id!=='bootstrapScheduleForm')return;event.preventDefault();event.stopImmediatePropagation();const title=el('bootstrapScheduleTitle')?.value?.trim(),trade=el('bootstrapScheduleTrade')?.value?.trim(),start=Number(el('bootstrapScheduleDay')?.value||0),duration=Math.max(1,Math.min(15,Number(el('bootstrapScheduleDuration')?.value||1))),type=el('bootstrapScheduleType')?.value||'work';if(!title||!trade)return;state.tasks.push({id:'task-'+Date.now(),title,trade,start:Math.min(start,DAYS-duration),duration,type});save();event.target.reset();el('bootstrapScheduleDuration').value='1';event.target.classList.add('hidden');render();status(title+' added to the local test schedule.');},{capture:true});
  document.addEventListener('dragstart',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card)return;event.stopImmediatePropagation();selectedId=card.dataset.taskId;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',selectedId);card.classList.add('is-dragging');},{capture:true});
  document.addEventListener('dragover',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();showOver(day);},{capture:true});
  document.addEventListener('drop',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();move(event.dataTransfer.getData('text/plain')||selectedId,day);},{capture:true});
  document.addEventListener('dragend',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;event.stopImmediatePropagation();overDay=null;document.querySelectorAll('.bootstrap-ground-task,.bootstrap-ground-day-cell,.bootstrap-ground-day-head').forEach(node=>node.classList.remove('is-over','is-dragging'));},{capture:true});
  document.addEventListener('pointerdown',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||event.pointerType==='mouse')return;event.preventDefault();event.stopImmediatePropagation();selectedId=card.dataset.taskId;touchDrag={id:selectedId,pointerId:event.pointerId};card.setPointerCapture?.(event.pointerId);card.classList.add('is-dragging');},{capture:true});
  document.addEventListener('pointermove',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;event.preventDefault();event.stopImmediatePropagation();showOver(dayAtPoint(event.clientX,event.clientY));},{capture:true,passive:false});
  document.addEventListener('pointerup',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;event.preventDefault();event.stopImmediatePropagation();const id=touchDrag.id,day=dayAtPoint(event.clientX,event.clientY);touchDrag=null;suppressClickUntil=Date.now()+500;if(day!==null)move(id,day);else{render();status('Task selected. Tap a workday heading to move it.');}},{capture:true});
  document.addEventListener('pointercancel',event=>{if(!touchDrag)return;event.stopImmediatePropagation();touchDrag=null;overDay=null;render();},{capture:true});
  document.addEventListener('keydown',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();const task=state.tasks.find(item=>item.id===card.dataset.taskId);if(task)move(task.id,task.start+(event.key==='ArrowRight'?1:-1));},{capture:true});
  document.addEventListener('change',event=>{if(event.target.id!=='bootstrapVendorView')return;vendorView=event.target.value;render();status(vendorView?'Vendor view opened for '+vendorView+'. Move notices remain visible below the schedule.':'All project work is visible.');},{capture:true});
  document.addEventListener('click',event=>{if(!event.target.closest?.('#bootstrapVendorAssignButton'))return;event.preventDefault();event.stopImmediatePropagation();const task=state.tasks.find(item=>item.id===selectedId),vendor=el('bootstrapVendorAssign')?.value;if(!task||!vendor)return;const prior=task.vendor;task.vendor=vendor;state.activity.unshift({id:'assign-'+Date.now(),at:new Date().toISOString(),task:task.title,vendor,from:prior,to:vendor,assignment:true});state.activity=state.activity.slice(0,100);selectedId='';save();render();status(task.title+' assigned to '+vendor+'. Its vendor schedule now includes this task.');},{capture:true});
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
    const key='blackFlagShipyardScheduleJoe'; // Legacy storage key retained so the Captain's prior shipyard notes survive the rename.
    const defaults={
      mission:'Create a builder-first residential construction scheduling system that reflects how homes are actually built in the field, not merely how calendar software expects work to be entered.',
      coreObject:'WORKING HYPOTHESIS — Bootstrap Build needs one durable build record for each home under construction. Before naming the final object, confirm how the Captain thinks about a house, lot, job, plan, community, and customer relationship in the field.',
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
      decisions:"Bootstrap Build remains a Captain's Quarters concept vessel until a separately authorized Admiral commissioning order establishes its Fleet Core identity. Engine lessons, primitives, and infrastructure may be reused only after they are evaluated against Bootstrap Build's own mission, users, workflow, data, permissions, and product needs. Nothing is inherited automatically."
    };
    const state={...defaults,...read(key,{})};
    const saveState=()=>write(key,state);
    body.innerHTML=`<section class="captain-command-intro shipyard-intro"><small>CAPTAIN'S SHIPYARD • HULL DESIGN</small><h3>Bootstrap Build</h3><p>Architecture before features. Reality before automation. Stability before polish.</p></section>
      <div class="shipyard-vessel-banner">
        <div><span>VESSEL SJ-01</span><strong>SCHEDULEJOE</strong><small>Residential Construction Scheduling</small></div>
        <div class="shipyard-vessel-state"><b>ARCHITECTURE PHASE</b><small>CAPTAIN + FIRST MATE</small></div>
      </div>
      <section class="schedulejoe-hull-status" aria-label="Bootstrap Build hull design status">
        <div><small>KEEL NOW LOCKING</small><strong>3 FOUNDATION SYSTEMS</strong><span>Organization, authority, and template lineage are being defined before scheduling logic.</span></div>
        <ol class="schedulejoe-keel-three">
          <li><b>01</b><span>Organization</span></li><li><b>02</b><span>Authority</span></li><li><b>03</b><span>Templates</span></li>
        </ol>
      </section>
      <nav class="shipyard-area-tabs schedulejoe-architecture-tabs" aria-label="Bootstrap Build architecture areas">
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
        areaHost.innerHTML=`${field('MISSION • WHAT THIS VESSEL MUST SOLVE',state.mission,'sjMission','Keep this builder-first. We are defining the problem, not selling ourselves features.')} ${mateTable('MISSION CHECK','If Bootstrap Build disappeared tomorrow, what specific scheduling pain would the Captain immediately miss it solving?','Do not let “construction software” become the mission.')}<section class="shipyard-guardrail"><strong>SHIPYARD GUARDRAIL</strong><span>Captain's Quarters incubates. The Engine operates commissioned vessels. Engine lessons may be reused here only when Bootstrap Build proves they fit.</span></section>`;
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
        areaHost.innerHTML=`${field('03 • MOVEMENT RULES • WHAT MAY CHANGE THE SCHEDULE?',state.movement,'sjMovement','Capture dependencies, readiness, inspections, materials, weather, trade availability, exceptions, and Captain judgment before automation.')} ${mateTable('AUTOMATION GUARDRAIL','Which changes should Bootstrap Build merely flag, which may it recommend, and which—if any—could it ever move automatically?','Early versions should recommend consequential moves rather than silently rewriting the build.')}`;
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
        audit('Bootstrap Build shipyard note saved',area);
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
      <div class="high-watch-head"><div><small>DARK SKY 4.3.7 • SHOWROOM RESTORE</small><h3>Intelligence Dock</h3><p>One prioritized operating picture across the admitted fleet. Read-only in Captain's Quarters.</p></div><strong class="${fleetClass}">${safe(fleetState)}</strong></div>
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

;(()=>{
  // Replaced by the 8.8.5 atomic Course Orders controller below.
  return;
  const SUPA_SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const headers=(token='')=>{const c=cfg();const h={apikey:c?.publishableKey||'','Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;return h;};
  const readSession=()=>{try{return JSON.parse(sessionStorage.getItem(SUPA_SESSION_KEY)||'null')}catch(_){return null}};
  const saveSession=data=>{if(!data?.access_token)return null;const v={access_token:data.access_token,refresh_token:data.refresh_token||'',expires_at:Date.now()+Math.max(60,Number(data.expires_in||3600))*1000,user:data.user||null};sessionStorage.setItem(SUPA_SESSION_KEY,JSON.stringify(v));return v;};
  const clearSession=()=>sessionStorage.removeItem(SUPA_SESSION_KEY);
  const state=()=>document.getElementById('admiralIdentityState'), result=()=>document.getElementById('admiralEntitlementResult');
  const actionButtons=()=>[document.getElementById('admiralTurnOff'),document.getElementById('admiralMakeFree'),document.getElementById('admiralGrantPaid')].filter(Boolean);
  const station=()=>document.getElementById('admiralEntitlementStation');
  const identityInputSelector='#admiralIdentityEmail,#admiralIdentityPassword';
  let identityScrollAnchor=null,identityAnchorClearTimer=0,identityRestoreTimers=[],identityScrollRepairing=false,lastIdentityDeckGesture=0;
  const professionalDeck=()=>{const deck=document.getElementById('admiralDeck');return deck?.dataset.mode==='professional'&&!deck.classList.contains('hidden')?deck:null;};
  function captureIdentityScrollAnchor(){
    const deck=professionalDeck(),panel=station();if(!deck||!panel||panel.classList.contains('hidden'))return;
    window.clearTimeout(identityAnchorClearTimer);
    identityScrollAnchor={top:deck.scrollTop,left:deck.scrollLeft,windowTop:window.scrollY,minViewportHeight:window.visualViewport?.height||window.innerHeight,protectUntil:Number.POSITIVE_INFINITY};
  }
  function restoreIdentityScrollAnchor(){
    const anchor=identityScrollAnchor,deck=professionalDeck(),panel=station();
    if(!anchor||!deck||!panel||panel.classList.contains('hidden'))return;
    const maxTop=Math.max(0,deck.scrollHeight-deck.clientHeight);
    identityScrollRepairing=true;
    deck.scrollTo({top:Math.min(anchor.top,maxTop),left:anchor.left,behavior:'auto'});
    if(Math.abs(window.scrollY-anchor.windowTop)>1)window.scrollTo({top:anchor.windowTop,left:window.scrollX,behavior:'auto'});
    requestAnimationFrame(()=>{identityScrollRepairing=false;});
  }
  function settleIdentityScroll(){
    identityRestoreTimers.forEach(id=>window.clearTimeout(id));identityRestoreTimers=[];
    requestAnimationFrame(()=>requestAnimationFrame(restoreIdentityScrollAnchor));
    [80,260,620,1100].forEach(delay=>identityRestoreTimers.push(window.setTimeout(restoreIdentityScrollAnchor,delay)));
  }
  // iPad Safari can reset a fixed overlay's scrollTop while its keyboard viewport
  // expands (including after a screenshot). Keep the open entitlement station on
  // the same professional-deck course through that resize.
  function noteIdentityDeckGesture(event){
    if(event.target.matches(identityInputSelector)){captureIdentityScrollAnchor();return;}
    if(event.target.closest?.('#admiralDeck'))lastIdentityDeckGesture=Date.now();
  }
  document.addEventListener('pointerdown',noteIdentityDeckGesture,{passive:true});
  document.addEventListener('touchstart',noteIdentityDeckGesture,{passive:true});
  document.addEventListener('focusin',event=>{if(event.target.matches(identityInputSelector)&&!identityScrollAnchor)captureIdentityScrollAnchor();});
  document.addEventListener('focusout',event=>{
    if(!event.target.matches(identityInputSelector))return;
    if(identityScrollAnchor)identityScrollAnchor.protectUntil=Date.now()+1600;
    settleIdentityScroll();
    identityAnchorClearTimer=window.setTimeout(()=>{identityScrollAnchor=null;},1800);
  });
  // Safari's screenshot transition can reset scrollTop without changing the
  // visual viewport. A captured scroll event is the reliable signal in that
  // path. Only correct a large upward reset while identity focus is protected;
  // a real touch/pointer gesture always wins.
  document.addEventListener('scroll',event=>{
    const anchor=identityScrollAnchor,deck=professionalDeck();if(!anchor||!deck||identityScrollRepairing)return;
    const identityFocused=document.activeElement?.matches?.(identityInputSelector);
    if(!identityFocused&&Date.now()>anchor.protectUntil)return;
    if(Date.now()-lastIdentityDeckGesture<900)return;
    const deckReset=event.target===deck&&deck.scrollTop<anchor.top-96;
    const windowReset=(event.target===document||event.target===document.documentElement||event.target===document.body)&&Math.abs(window.scrollY-anchor.windowTop)>1;
    if(deckReset||windowReset)settleIdentityScroll();
  },true);
  window.visualViewport?.addEventListener('resize',()=>{
    if(!identityScrollAnchor)return;
    const height=window.visualViewport.height;
    identityScrollAnchor.minViewportHeight=Math.min(identityScrollAnchor.minViewportHeight,height);
    if(height>identityScrollAnchor.minViewportHeight+60)settleIdentityScroll();
  });
  const selected=(id)=>{const el=document.getElementById(id);return {value:el?.value||'',label:el?.selectedOptions?.[0]?.textContent?.trim()||''}};
  const currentSetting=()=>document.getElementById('admiralEntitlementCurrent');
  const currentDetail=()=>document.getElementById('admiralEntitlementCurrentDetail');
  const setBusy=busy=>{actionButtons().forEach(b=>b.disabled=busy||!station()?.classList.contains('identity-verified'));};
  function clearPaintedState(){actionButtons().forEach(b=>{b.classList.remove('is-current');b.setAttribute('aria-pressed','false');});}
  function paintState(mode){const normalized=['off','free','paid'].includes(mode)?mode:'off';if(currentSetting())currentSetting().textContent=normalized.toUpperCase();if(currentDetail())currentDetail().textContent=normalized==='off'?'This feature is unavailable for this vessel.':normalized==='free'?'This feature is active at no charge.':'This feature uses paid terms. Choosing Paid here does not start a charge.';actionButtons().forEach(b=>{const active=b.id===({off:'admiralTurnOff',free:'admiralMakeFree',paid:'admiralGrantPaid'}[normalized]);b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active));});}
  async function refreshSession(s){const c=cfg();if(!c||!s?.refresh_token)return null;const r=await fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:s.refresh_token})});return r.ok?saveSession(await r.json()):null;}
  async function currentSession(){let s=readSession();if(s&&s.expires_at>Date.now()+30000)return s;if(s?.refresh_token)s=await refreshSession(s);return s;}
  async function verifyAdmiral(){const c=cfg(),s=await currentSession();if(!c||!s?.access_token)return false;const r=await fetch(c.url+'/rest/v1/fleet_global_authorities?select=user_id,authority_role,active&authority_role=eq.admiral&active=eq.true',{headers:{...headers(s.access_token),Accept:'application/json'}});if(!r.ok)return false;const rows=await r.json();return Array.isArray(rows)&&rows.length===1;}
  async function syncIdentityUi(){const ok=await verifyAdmiral();if(state())state().textContent=ok?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';station()?.classList.toggle('identity-verified',ok);setBusy(!ok);for(const id of ['admiralIdentitySignIn','admiralIdentityRecover'])document.getElementById(id)?.classList.toggle('hidden',ok);for(const id of ['admiralIdentityEmail','admiralIdentityPassword'])document.getElementById(id)?.closest('label')?.classList.toggle('hidden',ok);document.getElementById('admiralIdentitySignOut')?.classList.toggle('hidden',!ok);if(ok){await loadEntitlement();}else{clearPaintedState();if(currentSetting())currentSetting().textContent='SIGN IN TO VIEW';if(currentDetail())currentDetail().textContent='The current setting appears here before you make a change.';}return ok;}
  window.DarkSkySyncAdmiralIdentity=syncIdentityUi;
  async function signIn(){const c=cfg(),email=document.getElementById('admiralIdentityEmail')?.value?.trim().toLowerCase(),password=document.getElementById('admiralIdentityPassword')?.value||'';if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');if(!email||!password)throw new Error('Enter the Admiral email and password.');const r=await fetch(c.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:headers(),body:JSON.stringify({email,password})});if(!r.ok)throw new Error('Admiral sign-in failed.');saveSession(await r.json());if(!(await verifyAdmiral())){clearSession();throw new Error('This account is authenticated but does not hold active Admiral authority.');}const passwordInput=document.getElementById('admiralIdentityPassword');if(passwordInput)passwordInput.value='';await syncIdentityUi();}
  async function loadEntitlement(){const c=cfg(),s=await currentSession();if(!c||!s?.access_token)return null;const vessel=selected('admiralEntitlementVessel'),feature=selected('admiralEntitlementCapability');setBusy(true);if(currentSetting())currentSetting().textContent='CHECKING…';const r=await fetch(c.url+'/rest/v1/rpc/admiral_get_service_entitlement',{method:'POST',headers:{...headers(s.access_token),Accept:'application/json'},body:JSON.stringify({p_project_id:vessel.value,p_capability_key:feature.value})});if(!r.ok){setBusy(false);throw new Error('The current setting could not be loaded. No change was made.');}const data=await r.json();paintState(data?.current_state||'off');setBusy(false);if(result())result().textContent=feature.label+' is currently '+(data?.current_state||'off').toUpperCase()+' for '+vessel.label+'.';return data;}
  async function setEntitlement(mode){const c=cfg(),s=await currentSession();if(!c||!s?.access_token)throw new Error('Authenticate the Admiral identity first.');const vessel=selected('admiralEntitlementVessel'),feature=selected('admiralEntitlementCapability');setBusy(true);const r=await fetch(c.url+'/rest/v1/rpc/admiral_set_service_entitlement',{method:'POST',headers:{...headers(s.access_token),Accept:'application/json'},body:JSON.stringify({p_project_id:vessel.value,p_capability_key:feature.value,p_commercial_mode:mode,p_status:'entitled'})});if(!r.ok){setBusy(false);let text='Admiral entitlement change was refused.';try{const e=await r.json();text=e?.message||e?.hint||text}catch(_){}throw new Error(text);}const data=await r.json();paintState(mode);setBusy(false);const sentence=mode==='off'?feature.label+' is now Off for '+vessel.label+'.':mode==='free'?feature.label+' is now Free for '+vessel.label+'. No charge.':feature.label+' is now Paid for '+vessel.label+'. Billing is not started by this setting.';if(result())result().textContent=sentence;const n=document.getElementById('admiralDeckNotice');if(n)n.textContent='Feature entitlement updated for the selected vessel only.';return data;}
  document.addEventListener('click',async e=>{
    if(e.target.closest('#admiralIdentitySignIn')){const btn=document.getElementById('admiralIdentitySignIn');if(btn?.disabled)return;try{if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true');btn.textContent='AUTHENTICATING…';}if(result())result().textContent='Authenticating Admiral identity…';await signIn();}catch(err){if(result())result().textContent=String(err?.message||err);}finally{if(btn){btn.disabled=false;btn.removeAttribute('aria-busy');btn.textContent='AUTHENTICATE ADMIRAL';}}return;}
    if(e.target.closest('#admiralIdentityRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}
    if(e.target.closest('#admiralIdentitySignOut')){clearSession();await syncIdentityUi();if(result())result().textContent='Admiral identity signed out. No setting was changed.';return;}
    if(e.target.closest('#admiralTurnOff')){try{if(result())result().textContent='Turning feature off…';await setEntitlement('off');}catch(err){if(result())result().textContent=String(err?.message||err);}return;}
    if(e.target.closest('#admiralMakeFree')){try{if(result())result().textContent='Making feature free…';await setEntitlement('free');}catch(err){if(result())result().textContent=String(err?.message||err);}return;}
    if(e.target.closest('#admiralGrantPaid')){try{if(result())result().textContent='Granting paid upgrade…';await setEntitlement('paid');}catch(err){if(result())result().textContent=String(err?.message||err);}return;}
  });
  document.addEventListener('change',async e=>{if(!e.target.matches('#admiralEntitlementVessel,#admiralEntitlementCapability'))return;const control=e.target;control.blur();if(!station()?.classList.contains('identity-verified'))return;try{await loadEntitlement();}catch(err){if(result())result().textContent=String(err?.message||err);}});
  const releaseEntitlementPicker=()=>{const active=document.activeElement;if(active?.matches?.('#admiralEntitlementVessel,#admiralEntitlementCapability'))active.blur();};
  window.addEventListener('pageshow',releaseEntitlementPicker);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')releaseEntitlementPicker();});
})();

/* 8.8.5 Command Acknowledgment — durable results over the field-proven Course Orders controller. */
;(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  const GROUPS={
    operations:['fleet.customer-payments','fleet.customer-insight','fleet.enhanced-ledger'],
    production:['fleet.artwork-inlays','fleet.vendor-routing'],
    intelligence:['fleet.ai-recommendations']
  };
  let scope='vessel',command='free',preview=null,previewConfirmed=false,fullLog=false,busy=false;
  const el=id=>document.getElementById(id);
  const station=()=>el('admiralEntitlementStation');
  const result=()=>el('admiralEntitlementResult');
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const readSession=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(_){return null}};
  const saveSession=data=>{if(!data?.access_token)return null;const session={access_token:data.access_token,refresh_token:data.refresh_token||'',expires_at:Date.now()+Math.max(60,Number(data.expires_in||3600))*1000,user:data.user||null};sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));return session;};
  const clearSession=()=>sessionStorage.removeItem(SESSION_KEY);
  const headers=(token='')=>{const c=cfg();const value={apikey:c?.publishableKey||'','Content-Type':'application/json'};if(token)value.Authorization='Bearer '+token;return value;};
  const selected=id=>{const control=el(id);return {value:control?.value||'',label:control?.selectedOptions?.[0]?.textContent?.trim()||''};};
  const setResult=(message,kind='status')=>{const node=result();if(!node)return;node.textContent=message;node.classList.toggle('is-verified',kind==='verified');};
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatTime=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return String(value||'');}};
  async function refreshSession(session){
    const c=cfg();if(!c||!session?.refresh_token)return null;
    const response=await fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})});
    return response.ok?saveSession(await response.json()):null;
  }
  async function currentSession(){let session=readSession();if(session&&session.expires_at>Date.now()+30000)return session;if(session?.refresh_token)session=await refreshSession(session);return session;}
  async function rpc(name,body){
    const c=cfg(),session=await currentSession();
    if(!c?.url||!session?.access_token)throw new Error('Authenticate the Admiral identity first.');
    const response=await fetch(c.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{...headers(session.access_token),Accept:'application/json'},body:JSON.stringify(body)});
    if(!response.ok){let message='The Admiral command was refused. No change was made.';try{const problem=await response.json();message=problem?.message||problem?.hint||message;}catch(_){}throw new Error(message.replaceAll('_',' '));}
    return response.json();
  }
  async function verifyAdmiral(){
    const c=cfg(),session=await currentSession();if(!c||!session?.access_token)return false;
    const response=await fetch(c.url+'/rest/v1/fleet_global_authorities?select=user_id&authority_role=eq.admiral&active=eq.true',{headers:{...headers(session.access_token),Accept:'application/json'}});
    if(!response.ok)return false;const rows=await response.json();return Array.isArray(rows)&&rows.length===1;
  }
  function capabilityKeys(){
    if(scope==='vessel')return null;
    if(scope==='group')return GROUPS[selected('admiralCourseGroup').value]||[];
    return [selected('admiralEntitlementCapability').value].filter(Boolean);
  }
  function setBusy(next){
    busy=next;
    const verified=station()?.classList.contains('identity-verified');
    ['admiralTurnOff','admiralMakeFree','admiralGrantPaid','admiralPreviewCourse'].forEach(id=>{if(el(id))el(id).disabled=next||!verified;});
    if(el('admiralIssueCourse'))el('admiralIssueCourse').disabled=next||!verified||!preview||!previewConfirmed||preview.changes_count<1;
    if(el('admiralOpenFullLog'))el('admiralOpenFullLog').disabled=next||!verified;
  }
  function invalidatePreview(message='Preview the order to see its exact impact.'){
    preview=null;previewConfirmed=false;
    result()?.classList.remove('is-verified');
    if(el('admiralEntitlementCurrent'))el('admiralEntitlementCurrent').textContent='AWAITING PREVIEW';
    if(el('admiralEntitlementCurrentDetail'))el('admiralEntitlementCurrentDetail').textContent=message;
    ['admiralCourseTargetCount','admiralCourseChangeCount','admiralCourseUnchangedCount'].forEach(id=>{if(el(id))el(id).textContent='0';});
    if(el('admiralCoursePreviewItems'))el('admiralCoursePreviewItems').innerHTML='<p>No fleet state will change until the order is issued.</p>';
    if(el('admiralIssueCourse'))el('admiralIssueCourse').disabled=true;
  }
  function paintScope(){
    document.querySelectorAll('[data-course-scope]').forEach(button=>{const active=button.dataset.courseScope===scope;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
    el('admiralCourseGroupLabel')?.classList.toggle('hidden',scope!=='group');
    el('admiralCourseFeatureLabel')?.classList.toggle('hidden',scope!=='feature');
  }
  function paintCommand(){
    const ids={off:'admiralTurnOff',free:'admiralMakeFree',paid:'admiralGrantPaid'};
    Object.entries(ids).forEach(([mode,id])=>{const button=el(id),active=mode===command;if(button){button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));}});
  }
  async function signIn(){
    const c=cfg(),email=el('admiralIdentityEmail')?.value?.trim().toLowerCase(),password=el('admiralIdentityPassword')?.value||'';
    if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');
    if(!email||!password)throw new Error('Enter the Admiral email and password.');
    const response=await fetch(c.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
    if(!response.ok)throw new Error('Admiral sign-in failed.');
    saveSession(await response.json());
    if(!(await verifyAdmiral())){clearSession();throw new Error('This account does not hold active Admiral authority.');}
    if(el('admiralIdentityPassword'))el('admiralIdentityPassword').value='';
  }
  async function syncIdentity(){
    const verified=await verifyAdmiral();
    if(el('admiralIdentityState'))el('admiralIdentityState').textContent=verified?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';
    station()?.classList.toggle('identity-verified',verified);
    ['admiralIdentitySignIn','admiralIdentityRecover'].forEach(id=>el(id)?.classList.toggle('hidden',verified));
    ['admiralIdentityEmail','admiralIdentityPassword'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',verified));
    el('admiralIdentitySignOut')?.classList.toggle('hidden',!verified);
    if(verified){
      if(el('admiralCourseBrief'))el('admiralCourseBrief').textContent=selected('admiralEntitlementVessel').label+' is ready for a read-only preview.';
      setBusy(false);await Promise.all([previewCourse(),loadLog()]);
    }else{
      invalidatePreview('Authenticate to inspect current settings.');
      if(el('admiralCourseBrief'))el('admiralCourseBrief').textContent='Sign in to inspect the selected vessel.';
      if(el('admiralCourseLogRows'))el('admiralCourseLogRows').innerHTML='<p>Authenticate to read the command record.</p>';
      setBusy(false);
    }
    return verified;
  }
  window.DarkSkySyncAdmiralIdentity=syncIdentity;
  async function previewCourse(confirmIssue=false,{announce=true}={}){
    setBusy(true);if(announce)setResult('Reading current fleet state. No change is being made…');
    try{
      const vessel=selected('admiralEntitlementVessel');
      const data=await rpc('admiral_preview_service_course',{p_project_id:vessel.value,p_scope:scope,p_capability_keys:capabilityKeys(),p_commercial_mode:command});
      preview=data;previewConfirmed=confirmIssue;
      if(el('admiralEntitlementCurrent'))el('admiralEntitlementCurrent').textContent=command.toUpperCase()+' COURSE';
      if(el('admiralEntitlementCurrentDetail'))el('admiralEntitlementCurrentDetail').textContent=data.changes_count?data.changes_count+' of '+data.feature_count+' selected features will change.':'All selected features already match this course.';
      if(el('admiralCourseTargetCount'))el('admiralCourseTargetCount').textContent=String(data.feature_count);
      if(el('admiralCourseChangeCount'))el('admiralCourseChangeCount').textContent=String(data.changes_count);
      if(el('admiralCourseUnchangedCount'))el('admiralCourseUnchangedCount').textContent=String(data.unchanged_count);
      if(el('admiralCoursePreviewItems'))el('admiralCoursePreviewItems').innerHTML=(data.items||[]).map(item=>'<article class="'+(item.changes?'will-change':'unchanged')+'"><b>'+escapeHtml(item.feature_name)+'</b><span>'+escapeHtml(String(item.before_state).toUpperCase())+' → '+escapeHtml(String(item.after_state).toUpperCase())+'</span></article>').join('');
      if(announce)setResult(data.changes_count?(confirmIssue?'Preview confirmed. Review every target, then issue the order.':'Current impact shown. Tap Preview Order to authorize the issue step.'):'Preview complete. No order is needed because the selected state already matches.');
      return data;
    }finally{setBusy(false);}
  }
  async function issueCourse(){
    if(!preview||!previewConfirmed)throw new Error('Tap Preview Order and review the impact before issuing it.');
    const vessel=selected('admiralEntitlementVessel'),intent=el('admiralCourseIntent')?.value?.trim()||'';
    setBusy(true);setResult('Issuing one atomic Admiral order…');
    try{
      const data=await rpc('admiral_issue_service_course',{p_project_id:vessel.value,p_scope:scope,p_capability_keys:capabilityKeys(),p_commercial_mode:command,p_expected_fingerprint:preview.fingerprint,p_intent:intent});
      const acknowledgment='ORDER #'+data.command_id+' VERIFIED · '+data.changes_count+' feature'+(data.changes_count===1?'':'s')+' now '+command.toUpperCase()+' for '+vessel.label+'.';
      const notice=el('admiralDeckNotice');if(notice)notice.textContent='Admiral order #'+data.command_id+' was written, read back and verified.';
      if(el('admiralCourseIntent'))el('admiralCourseIntent').value='';
      preview=null;previewConfirmed=false;await Promise.all([previewCourse(false,{announce:false}),loadLog()]);
      if(el('admiralEntitlementCurrent'))el('admiralEntitlementCurrent').textContent=command.toUpperCase()+' COURSE · APPLIED';
      if(el('admiralEntitlementCurrentDetail'))el('admiralEntitlementCurrentDetail').textContent='Verified readback: every selected feature now matches this course.';
      setResult(acknowledgment,'verified');
      return data;
    }finally{setBusy(false);}
  }
  function describeRecord(record){
    const detail=record.detail||{};
    if(record.action==='service_course_order_issued')return (detail.command||'course').toUpperCase()+' · '+(detail.changes_count||0)+' change'+(detail.changes_count===1?'':'s')+' · '+(detail.scope||'vessel');
    if(record.action==='service_course_order_rolled_back')return 'ROLLBACK · order #'+(detail.source_command_id||'—');
    return String(detail.capability_key||'Single feature order')+' · '+String(detail.commercial_mode||detail.current_state||'changed').toUpperCase();
  }
  async function loadLog(){
    const vessel=selected('admiralEntitlementVessel');
    const data=await rpc('admiral_list_service_course_log',{p_project_id:vessel.value,p_limit:fullLog?100:5});
    const records=data.records||[],container=el('admiralCourseLogRows');if(!container)return records;
    container.innerHTML=records.length?records.map(record=>'<article class="admiral-course-log-row"><div><small>ORDER #'+escapeHtml(record.id)+' · '+escapeHtml(formatTime(record.created_at))+'</small><b>'+escapeHtml(record.vessel_name||vessel.label)+'</b><span>'+escapeHtml(describeRecord(record))+'</span><em>By '+escapeHtml(record.actor||'Admiral')+'</em></div>'+(record.rollback_available?'<button class="admiral-pro-button" type="button" data-course-rollback="'+escapeHtml(record.id)+'" data-course-description="'+escapeHtml(describeRecord(record))+'">ROLL BACK</button>':'')+'</article>').join(''):'<p>No entitlement commands are recorded for this vessel.</p>';
    if(el('admiralOpenFullLog'))el('admiralOpenFullLog').textContent=fullLog?'SHOW RECENT':'OPEN FULL LOG';
    return records;
  }
  async function rollbackCourse(button){
    const id=Number(button.dataset.courseRollback),description=button.dataset.courseDescription||'this order';
    if(!Number.isFinite(id))return;
    if(!window.confirm('Roll back Admiral order #'+id+'?\n\n'+description+'\n\nRollback will stop if any newer command conflicts.'))return;
    setBusy(true);setResult('Checking for newer commands before rollback…');
    try{
      const data=await rpc('admiral_rollback_service_course',{p_command_id:id});
      const acknowledgment='ROLLBACK #'+data.rollback_id+' VERIFIED · order #'+id+' restored '+data.restored_count+' feature'+(data.restored_count===1?'':'s')+'. The course shown above is now a new proposal only.';
      if(el('admiralCourseIntent'))el('admiralCourseIntent').value='';
      preview=null;previewConfirmed=false;await Promise.all([previewCourse(false,{announce:false}),loadLog()]);
      if(el('admiralEntitlementCurrent'))el('admiralEntitlementCurrent').textContent='NEW '+command.toUpperCase()+' PROPOSAL';
      if(el('admiralEntitlementCurrentDetail'))el('admiralEntitlementCurrentDetail').textContent='Rollback restored the prior settings. This preview is a new proposal and has not been issued.';
      const notice=el('admiralDeckNotice');if(notice)notice.textContent='Rollback #'+data.rollback_id+' restored Admiral order #'+id+' and was verified.';
      setResult(acknowledgment,'verified');
    }finally{setBusy(false);}
  }
  function preserveScroll(){
    const deck=el('admiralDeck');if(!deck||deck.dataset.mode!=='professional'||deck.classList.contains('hidden'))return;
    try{sessionStorage.setItem('darkSkyAdmiralProfessionalScroll885',String(deck.scrollTop));}catch(_){}
  }
  function releasePicker(){
    const active=document.activeElement;
    if(active?.matches?.('#admiralEntitlementVessel,#admiralCourseGroup,#admiralEntitlementCapability'))active.blur();
  }
  function restoreScroll(){
    const deck=el('admiralDeck');if(!deck||deck.dataset.mode!=='professional'||deck.classList.contains('hidden'))return;
    let top=0;try{top=Number(sessionStorage.getItem('darkSkyAdmiralProfessionalScroll885')||0);}catch(_){}
    requestAnimationFrame(()=>requestAnimationFrame(()=>deck.scrollTo({top:Math.min(top,Math.max(0,deck.scrollHeight-deck.clientHeight)),left:0,behavior:'auto'})));
  }
  document.addEventListener('scroll',event=>{if(event.target===el('admiralDeck')&&document.visibilityState==='visible')preserveScroll();},true);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')preserveScroll();else{releasePicker();restoreScroll();}});
  window.addEventListener('pageshow',()=>{releasePicker();restoreScroll();});
  document.addEventListener('click',async event=>{
    const target=event.target;
    if(target.closest('[data-course-scope]')){scope=target.closest('[data-course-scope]').dataset.courseScope;paintScope();invalidatePreview();if(station()?.classList.contains('identity-verified'))try{await previewCourse();}catch(error){setResult(error.message);}return;}
    const modeButton=target.closest('#admiralTurnOff,#admiralMakeFree,#admiralGrantPaid');
    if(modeButton){command={admiralTurnOff:'off',admiralMakeFree:'free',admiralGrantPaid:'paid'}[modeButton.id];paintCommand();invalidatePreview();return;}
    if(target.closest('#admiralPreviewCourse')){try{await previewCourse(true);}catch(error){setResult(error.message);}return;}
    if(target.closest('#admiralIssueCourse')){try{await issueCourse();}catch(error){setResult(error.message);}return;}
    if(target.closest('#admiralIdentitySignIn')){const button=el('admiralIdentitySignIn');if(button?.disabled)return;try{button.disabled=true;button.textContent='AUTHENTICATING…';setResult('Authenticating Admiral identity…');await signIn();await syncIdentity();}catch(error){setResult(error.message);}finally{button.disabled=false;button.textContent='AUTHENTICATE ADMIRAL';}return;}
    if(target.closest('#admiralIdentityRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}
    if(target.closest('#admiralIdentitySignOut')){clearSession();await syncIdentity();setResult('Admiral identity signed out. No setting was changed.');return;}
    if(target.closest('#admiralOpenFullLog')){fullLog=!fullLog;try{await loadLog();}catch(error){setResult(error.message);}return;}
    if(target.closest('#admiralDeckLog')){document.querySelector('[data-admiral-lane="standardize"]')?.click();el('admiralServiceEntitlements')?.click();fullLog=true;try{await loadLog();el('admiralCourseLogRows')?.scrollIntoView({block:'start',behavior:'smooth'});}catch(error){setResult(error.message);}return;}
    const rollback=target.closest('[data-course-rollback]');if(rollback){try{await rollbackCourse(rollback);}catch(error){setResult(error.message);}return;}
  });
  document.addEventListener('change',async event=>{
    if(!event.target.matches('#admiralEntitlementVessel,#admiralCourseGroup,#admiralEntitlementCapability'))return;
    event.target.blur();invalidatePreview();
    if(el('admiralCourseBrief'))el('admiralCourseBrief').textContent=selected('admiralEntitlementVessel').label+' is ready for a read-only preview.';
    if(station()?.classList.contains('identity-verified'))try{await Promise.all([previewCourse(),loadLog()]);}catch(error){setResult(error.message);}
  });
  document.addEventListener('input',event=>{if(event.target.matches('#admiralCourseIntent')&&preview)invalidatePreview('Intent changed. Preview again before issuing.');});
  paintScope();paintCommand();
})();

/* 8.8.11 Fleet Door Repair — permanent keel, editable working name. */
;(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  let preview=null,confirmed=false,busy=false,fullLog=false,commissionedProject='',backendReady=false;
  const el=id=>document.getElementById(id);
  const station=()=>el('admiralCommissioningStation');
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatTime=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return String(value||'');}};
  const readSession=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(_){return null}};
  const saveSession=data=>{if(!data?.access_token)return null;const session={access_token:data.access_token,refresh_token:data.refresh_token||'',expires_at:Date.now()+Math.max(60,Number(data.expires_in||3600))*1000,user:data.user||null};sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));return session;};
  const clearSession=()=>sessionStorage.removeItem(SESSION_KEY);
  const headers=(token='')=>{const c=cfg();const value={apikey:c?.publishableKey||'','Content-Type':'application/json'};if(token)value.Authorization='Bearer '+token;return value;};
  async function refreshSession(session){const c=cfg();if(!c||!session?.refresh_token)return null;const response=await fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})});return response.ok?saveSession(await response.json()):null;}
  async function currentSession(){let session=readSession();if(session&&session.expires_at>Date.now()+30000)return session;if(session?.refresh_token)session=await refreshSession(session);return session;}
  async function rpc(name,body){const c=cfg(),session=await currentSession();if(!c?.url||!session?.access_token)throw new Error('Authenticate the Admiral identity first.');const response=await fetch(c.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{...headers(session.access_token),Accept:'application/json'},body:JSON.stringify(body)});if(!response.ok){let message='The commissioning command was refused. No vessel was created.';try{const problem=await response.json();message=problem?.message||problem?.hint||message;}catch(_){}if(/could not find the function|schema cache/i.test(message))throw new Error('Fleet Core upgrade 8.8.6 is required before commissioning. No data changed.');throw new Error(message.replaceAll('_',' '));}return response.json();}
  async function verifyAdmiral(){const c=cfg(),session=await currentSession();if(!c||!session?.access_token)return false;const response=await fetch(c.url+'/rest/v1/fleet_global_authorities?select=user_id&authority_role=eq.admiral&active=eq.true',{headers:{...headers(session.access_token),Accept:'application/json'}});if(!response.ok)return false;const rows=await response.json();return Array.isArray(rows)&&rows.length===1;}
  function values(){return {p_project_id:el('admiralCommissioningProject')?.value?.trim().toLowerCase()||'',p_namespace:el('admiralCommissioningNamespace')?.value?.trim().toLowerCase()||'',p_display_name:el('admiralCommissioningName')?.value?.trim()||'',p_mission_class:el('admiralCommissioningClass')?.value||'admiral_program',p_ownership_model:'fleet_unassigned',p_operating_model:'fleet_operated',p_mission_summary:el('admiralCommissioningSummary')?.value?.trim()||''};}
  function setResult(message,verified=false){const node=el('admiralCommissioningResult');if(!node)return;node.textContent=message;node.classList.toggle('is-verified',verified);}
  function setBusy(next){busy=next;const verified=station()?.classList.contains('identity-verified');if(el('admiralCommissioningPreview'))el('admiralCommissioningPreview').disabled=next||!verified||!backendReady;if(el('admiralCommissioningIssue'))el('admiralCommissioningIssue').disabled=next||!verified||!backendReady||!preview||!confirmed;if(el('admiralCommissioningLog'))el('admiralCommissioningLog').disabled=next||!verified||!backendReady;if(el('admiralCommissioningRename'))el('admiralCommissioningRename').disabled=next||!verified||!backendReady;}
  function invalidate(message='Review the working identity and permanent keel, then preview again.'){preview=null;confirmed=false;if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='AWAITING PREVIEW';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent=message;if(el('admiralCommissioningPreviewItems'))el('admiralCommissioningPreviewItems').innerHTML='<p>No Fleet Core row will be written until the order is issued.</p>';if(el('admiralCommissioningIssue'))el('admiralCommissioningIssue').disabled=true;el('admiralCommissioningResult')?.classList.remove('is-verified');}
  function ensureRenamePanel(){if(el('admiralCommissioningRenamePanel'))return;const log=station()?.querySelector('.admiral-course-log');if(!log)return;const panel=document.createElement('section');panel.id='admiralCommissioningRenamePanel';panel.className='admiral-commissioning-rename hidden';panel.innerHTML='<div><small>EDITABLE WORKING NAME</small><strong>Rename without rebuilding the keel</strong><span id="admiralCommissioningStableIdentity">The vessel UUID, project key, and namespace remain unchanged.</span></div><label>New working name<input id="admiralCommissioningRenameName" type="text" maxlength="80" placeholder="New working name"></label><button id="admiralCommissioningRename" class="admiral-pro-button" type="button">RENAME WORKING VESSEL</button>';log.before(panel);}
  async function signIn(){const c=cfg(),email=el('admiralCommissioningEmail')?.value?.trim().toLowerCase(),password=el('admiralCommissioningPassword')?.value||'';if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');if(!email||!password)throw new Error('Enter the Admiral email and password.');const response=await fetch(c.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:headers(),body:JSON.stringify({email,password})});if(!response.ok)throw new Error('Admiral sign-in failed.');saveSession(await response.json());if(!(await verifyAdmiral())){clearSession();throw new Error('This account does not hold active Admiral authority.');}if(el('admiralCommissioningPassword'))el('admiralCommissioningPassword').value='';}
  async function syncIdentity(){ensureRenamePanel();const verified=await verifyAdmiral();station()?.classList.toggle('identity-verified',verified);if(el('admiralCommissioningIdentityState'))el('admiralCommissioningIdentityState').textContent=verified?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';['admiralCommissioningSignIn','admiralCommissioningRecover'].forEach(id=>el(id)?.classList.toggle('hidden',verified));['admiralCommissioningEmail','admiralCommissioningPassword'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',verified));el('admiralCommissioningSignOut')?.classList.toggle('hidden',!verified);try{if(verified){if(el('admiralCommissioningBrief'))el('admiralCommissioningBrief').textContent='Bootstrap Build is ready for a read-only commissioning preview.';backendReady=true;await loadLog();setResult('Identity verified. Preview creates no vessel and changes no fleet state.');}else{backendReady=false;invalidate('Authenticate to inspect the commissioning boundary.');if(el('admiralCommissioningBrief'))el('admiralCommissioningBrief').textContent='Authenticate to preview a new vessel.';if(el('admiralCommissioningLogRows'))el('admiralCommissioningLogRows').innerHTML='<p>Authenticate to read the commissioning record.</p>';setResult('Authenticate the Admiral identity to begin.');}}catch(error){backendReady=false;invalidate('Fleet Core must be upgraded before this station can preview or issue an order.');setResult(error.message);if(el('admiralCommissioningLogRows'))el('admiralCommissioningLogRows').innerHTML='<p>Commissioning records become available after the Fleet Core upgrade.</p>';}finally{setBusy(false);}return verified;}
  window.DarkSkySyncCommissioningIdentity=syncIdentity;
  async function previewOrder(){setBusy(true);setResult('Checking the permanent keel. No vessel is being created…');try{const data=await rpc('admiral_preview_vessel_commission',values());preview=data;confirmed=true;if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='COMMISSIONING COURSE';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent='One new vessel identity will be created in commissioning state.';if(el('admiralCommissioningPreviewItems'))el('admiralCommissioningPreviewItems').innerHTML='<article class="will-change"><b>Working name · editable</b><span>'+escapeHtml(data.display_name)+'</span></article><article class="will-change"><b>Project key · permanent</b><span>'+escapeHtml(data.project_id)+'</span></article><article class="will-change"><b>Namespace · permanent</b><span>'+escapeHtml(data.namespace)+'</span></article><article><b>Initial boundary</b><span>COMMISSIONING · UNASSIGNED</span></article><article><b>Automatic grants</b><span>NO OWNER · NO FEATURES</span></article>';setResult('Preview confirmed. Review every permanent field, then issue the commissioning order.');return data;}finally{setBusy(false);}}
  async function issueOrder(){if(!preview||!confirmed)throw new Error('Preview the commissioning order before issuing it.');setBusy(true);setResult('Issuing one Admiral commissioning order…');try{const body={...values(),p_expected_fingerprint:preview.fingerprint,p_intent:el('admiralCommissioningIntent')?.value?.trim()||''};const data=await rpc('admiral_issue_vessel_commission',body);commissionedProject=data.project_id;confirmed=false;preview=null;if(el('admiralCommissioningIntent'))el('admiralCommissioningIntent').value='';if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='VESSEL COMMISSIONED';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent='Verified readback: the Fleet Core identity exists and is not live.';if(el('admiralCommissioningStableIdentity'))el('admiralCommissioningStableIdentity').textContent='Stable identity: '+data.vessel_id+' · '+data.project_id+' · '+data.namespace;el('admiralCommissioningRenamePanel')?.classList.remove('hidden');if(el('admiralCommissioningRenameName'))el('admiralCommissioningRenameName').value=data.display_name;setResult('COMMISSIONING VERIFIED · '+data.display_name+' now has a durable Fleet Core identity. No owner or features were granted.',true);await loadLog();await window.DarkSkySyncVesselBrandIdentity?.();return data;}finally{setBusy(false);}}
  function describe(record){const d=record.detail||{};return record.action==='vessel_working_name_changed'?'RENAMED · '+(d.old_display_name||'—')+' → '+(d.new_display_name||'—'):'COMMISSIONED · '+(d.display_name||d.project_id||'New vessel')+' · NOT LIVE';}
  async function loadLog(){const data=await rpc('admiral_list_vessel_commission_log',{p_limit:fullLog?100:5}),records=data.records||[],container=el('admiralCommissioningLogRows');if(container)container.innerHTML=records.length?records.map(record=>'<article class="admiral-course-log-row"><div><small>ORDER #'+escapeHtml(record.id)+' · '+escapeHtml(formatTime(record.created_at))+'</small><b>'+escapeHtml(record.detail?.display_name||record.detail?.new_display_name||record.detail?.project_id||'Vessel order')+'</b><span>'+escapeHtml(describe(record))+'</span><em>By '+escapeHtml(record.actor||'Admiral')+'</em></div></article>').join(''):'<p>No commissioning orders are recorded.</p>';if(el('admiralCommissioningLog'))el('admiralCommissioningLog').textContent=fullLog?'SHOW RECENT':'OPEN FULL LOG';return records;}
  async function renameVessel(){const name=el('admiralCommissioningRenameName')?.value?.trim()||'';if(!commissionedProject)throw new Error('Commission a vessel in this session before renaming it here.');if(!window.confirm('Rename this working vessel to “'+name+'”?\n\nIts permanent identity and records will not change.'))return;setBusy(true);try{const data=await rpc('admiral_rename_vessel',{p_project_id:commissionedProject,p_display_name:name,p_intent:'Working-name correction from Commissioning Orders'});if(el('admiralCommissioningName'))el('admiralCommissioningName').value=data.display_name;setResult('RENAME VERIFIED · '+data.old_display_name+' is now '+data.display_name+'. The vessel UUID, project key, and namespace are unchanged.',true);await loadLog();}finally{setBusy(false);}}
  document.addEventListener('click',async event=>{const target=event.target;if(target.closest('#admiralCommissioningSignIn')){const button=el('admiralCommissioningSignIn');if(button?.disabled)return;try{button.disabled=true;button.textContent='AUTHENTICATING…';await signIn();await syncIdentity();window.DarkSkySyncAdmiralIdentity?.();}catch(error){setResult(error.message);}finally{button.disabled=false;button.textContent='AUTHENTICATE ADMIRAL';}return;}if(target.closest('#admiralCommissioningRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}if(target.closest('#admiralCommissioningSignOut')){clearSession();await syncIdentity();window.DarkSkySyncAdmiralIdentity?.();return;}if(target.closest('#admiralCommissioningPreview')){try{await previewOrder();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningIssue')){try{await issueOrder();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningLog')){fullLog=!fullLog;try{await loadLog();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningRename')){try{await renameVessel();}catch(error){setResult(error.message);}return;}});
  document.addEventListener('input',event=>{if(event.target.matches('#admiralCommissioningName,#admiralCommissioningSummary,#admiralCommissioningProject,#admiralCommissioningNamespace,#admiralCommissioningIntent'))invalidate('Commissioning details changed. Preview again before issuing.');});
  document.addEventListener('change',event=>{if(event.target.matches('#admiralCommissioningClass'))invalidate('Mission class changed. Preview again before issuing.');});
})();
