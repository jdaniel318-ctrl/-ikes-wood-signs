(() => {
  'use strict';

  const CAPTAIN_PIN = '19613';
  let authorized = false;

  const byId = (id) => document.getElementById(id);
  const show = (id) => byId(id)?.classList.remove('hidden');
  const hide = (id) => byId(id)?.classList.add('hidden');

  function clearHash() {
    try {
      if (location.hash === '#captainQuartersGate') {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch (_) {}
  }

  function openGate() {
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
    quarters?.classList.remove('captain-entry-complete');
    entry?.classList.remove('captain-entry-play');
    if (entry) void entry.offsetWidth;
    entry?.classList.add('captain-entry-play');
    window.setTimeout(() => quarters?.classList.add('captain-entry-complete'), 4300);
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
    refreshCaptainWatch();
    clearHash();
    document.body.classList.add('captain-modal-open', 'captain-authorized');
    playEntrance();
  }

  function secure() {
    authorized = false;
    hide('captainBlueprint');
    hide('captainFleetChart');
    hide('captainQuarters');
    hide('captainQuartersGate');
    byId('captainQuarters')?.classList.remove('captain-entry-complete');
    byId('captainEntrySequence')?.classList.remove('captain-entry-play');
    if (byId('captainPinInput')) byId('captainPinInput').value = '';
    document.body.classList.remove('captain-modal-open', 'captain-authorized');
    clearHash();
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
  }

  function prepareCinematicCabin(){
    const room=document.getElementById('captainQuarters');
    if(!room)return;
    const image=new Image();
    image.onload=()=>{
      room.classList.add('cinematic-cabin-ready');
      room.classList.remove('cinematic-cabin-failed');
    };
    image.onerror=()=>{
      // Deliberate fallback: keep the known-good v2.9.51 cabin fully usable.
      room.classList.remove('cinematic-cabin-ready');
      room.classList.add('cinematic-cabin-failed');
    };
    image.src='assets/captains_quarters_cinematic_v2953.jpg';
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
    byId('captainBlueprintBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      show('captainBlueprint');
    });
    byId('captainBlueprintDeskBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      show('captainBlueprint');
    });
    byId('captainBlueprintClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      hide('captainBlueprint');
    });
    byId('captainDarkSkyChartBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      refreshCaptainFleetChart();
      show('captainFleetChart');
    });
    byId('captainFleetChartClose')?.addEventListener('click', (event) => {
      event.preventDefault();
      hide('captainFleetChart');
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
      show('captainSpyglassPanel');
    });
    byId('captainWatchStrip')?.addEventListener('click',event=>{
      event.preventDefault();
      refreshSpyglass();
      show('captainSpyglassPanel');
    });
    byId('captainSpyglassClose')?.addEventListener('click',event=>{
      event.preventDefault();
      hide('captainSpyglassPanel');
    });
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
  }

  async function render(section){
    const names={
      cargo:["Cargo Hold","AI Workshop & Innovation"],
      powder:["Powder Keg","Dangerous Authority"],
      blackflag:["Black Flag","Fleet Command Center"],
      log:["Captain's Log","Orders, Notes & History"],
      blueprint:["Ship's Blueprint","Living System Architecture"]
    };
    const [t,s]=names[section]||["Captain Command","Governance"];
    workspace.dataset.section=section;
    title.textContent=t; subtitle.textContent=s;
    if(section==='cargo') return renderCargo();
    if(section==='powder') return renderPowder();
    if(section==='blackflag') return renderBlackFlag();
    if(section==='log') return renderLog();
    if(section==='blueprint') return renderBlueprint();
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
      <div class="high-watch-head"><div><small>DARK SKY 4.3.5 • MUSTER ROLL</small><h3>Fleet Intelligence</h3><p>One prioritized operating picture across the admitted fleet. Read-only in Captain's Quarters.</p></div><strong class="${fleetClass}">${safe(fleetState)}</strong></div>
      <div class="high-watch-kpis easy-bearing-kpis"><span><b>${counts.critical}</b> critical</span><span><b>${counts.high}</b> high priority</span><span><b>${counts.action}</b> action required</span><span><b>${counts.watch}</b> watch</span><span><b>${counts.clear}</b> clear</span></div>
      ${top?`<article class="high-watch-lead ${safe(top.level)}"><small>HIGHEST PRIORITY • SCORE ${Number(top.score||0)}</small><strong>${safe(top.projectName)}</strong><span>${safe(top.next)}</span><p>${safe((top.reasons||[]).join(' • ')||'No active concern.')}</p></article>`:''}
      <div class="high-watch-fleet">${intel.map(x=>`<details class="high-watch-vessel ${safe(x.level)}"><summary><span><small>${safe(x.code||'VESSEL')} • ${safe(x.launchLabel||'')}</small><strong>${safe(x.projectName)}</strong></span><span><b>${Number(x.score||0)}</b><small>${safe(levelLabel(x.level))}</small></span></summary><div><p>${safe((x.reasons||[]).join(' • ')||'No active concern.')}</p><ul><li>${Number(x.open||0)} open orders</li><li>${Number(x.customers||0)} retained customers</li><li>${Number(x.offers||0)} customer-ready offers</li><li>${Number(x.activeDeployments||0)} active deployments</li></ul><strong>Next move: ${safe(x.next||'Maintain course')}</strong></div></details>`).join('')}</div>
      <section class="cq-spyglass-search high-watch-search easy-bearing-search">
        <div><small>DARK SKY 4.3.5 • COMMAND FIND</small><h4>Find anything in the fleet</h4><p>Start typing a project, order number, customer, phone, email, or a phrase like “open Ike orders.” Results update automatically and never change production data.</p></div>
        <div class="easy-bearing-filter" role="group" aria-label="Search type">
          <button type="button" data-command-search-type="all" class="active">All</button>
          <button type="button" data-command-search-type="project">Projects</button>
          <button type="button" data-command-search-type="order">Orders</button>
          <button type="button" data-command-search-type="customer">Customers</button>
        </div>
        <div class="easy-bearing-input-wrap"><input id="captainCommandSearchInput" placeholder="Search project, order #, customer, phone, or email" autocomplete="off" enterkeyhint="search"><button id="captainCommandSearchClear" type="button" aria-label="Clear search">CLEAR</button></div>
        <div class="easy-bearing-suggestions"><button type="button" data-command-suggestion="open orders">Open orders</button><button type="button" data-command-suggestion="Ike">Ike's</button><button type="button" data-command-suggestion="Becca">Becca</button><button type="button" data-command-suggestion="Grizzly">Grizzly</button></div>
        <div id="captainCommandSearchResults" class="cq-spyglass-results easy-bearing-results"><span>Type two characters and Exact Bearing will find the best matches.</span></div>
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
      <div class="v4-captain-head"><div><small>DARK SKY 4.3.5 • MUSTER ROLL</small><h3>Captain's Command Brief</h3><p>Fleet posture, controlled experimentation, release discipline, and platform memory in one command surface.</p></div><strong class="${st.preflight.ok?'clear':'attention'}">${st.preflight.ok?'EASY BEARING':'REVIEW'}</strong></div>
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
    document.querySelectorAll('[data-v4-lab]').forEach(btn=>btn.onclick=()=>{try{window.DarkSkyV4.labMark(btn.dataset.v4Lab,btn.dataset.state,'Captain Exact Bearing review');audit('Captain Lab state changed',`${btn.dataset.v4Lab} → ${btn.dataset.state}`);renderBlackFlag();}catch(err){alert(err.message)}});
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
      if(raw.length<2){searchHost.innerHTML='<span>Type two characters and Exact Bearing will find the best matches.</span>';return;}
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

  // The five painted lower controls are now the sole command doors.
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
