/* 8.8.17 Admiral Commission — a full document load must never inherit
   upper-command identity from the prior page. The session remains shared
   between Admiral stations only for this document's lifetime. */
;(() => {
  'use strict';
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  const DOCUMENT_GUARD='__darkSkyAdmiralFreshGate88112';
  if(window[DOCUMENT_GUARD])return;
  window[DOCUMENT_GUARD]=true;
  const clearAdmiralIdentity=()=>{window.DarkSkyAdmiralSession?.end('new-document');try{sessionStorage.removeItem(SESSION_KEY);}catch(_){}};
  clearAdmiralIdentity();
  window.addEventListener('pagehide',clearAdmiralIdentity);
  window.addEventListener('pageshow',event=>{if(event.persisted){clearAdmiralIdentity();location.reload();}});
  window.DarkSkyAdmiralFreshGate=Object.freeze({build:'8.8.17',requiredPerDocument:true,engineAuthoritySeparate:true});
})();
/* Dark Sky 8.8.17 Admiral Commission — server-attested, read-only Admiral observability. */
// Create credential controls only when their sign-in step is shown.
const AdmiralAccountForm = (() => {
  const preferenceKey = 'blackflag.admiral.email:' + location.pathname.replace(/[^/]*$/, '');

  function validAddress(value) {
    const address = value.trim().toLowerCase();
    if (!address || /\s/.test(address)) return '';
    const check = document.createElement('input');
    check.type = 'email';
    check.value = address;
    return check.validity.valid ? address : '';
  }

  function savedEmail() {
    try { return validAddress(localStorage.getItem(preferenceKey) || ''); }
    catch (_) { return ''; }
  }

  function fields(prefix) {
    return `<button type="button" id="${prefix}Choose" class="admiral-primary" data-enter-email>Enter Admiral email</button>`;
  }

  function mount(form, status, authenticate) {
    const prefix = form.querySelector('[data-enter-email]').id.replace(/Choose$/, '');
    let selected = '', epoch = 0, pending = false;

    function clear() {
      ++epoch;
      pending = false;
      selected = '';
      const secret = form.querySelector('[type=password]');
      if (secret) secret.value = '';
      form.replaceChildren();
    }

    function button(label, primary, action) {
      const element = document.createElement('button');
      element.type = action ? 'button' : 'submit';
      element.className = primary ? 'admiral-primary' : 'admiral-secondary';
      element.textContent = label;
      if (action) element.onclick = action;
      if (primary && !action) element.id = prefix + 'SignIn';
      form.append(element);
      return element;
    }

    function reset() {
      clear();
      button('Enter Admiral email', true, () => editEmail('')).id = prefix + 'Choose';
    }

    function begin() {
      const saved = savedEmail();
      if (!form.querySelector('#' + prefix + 'Choose')) return;
      if (saved) confirmEmail(saved, true);
      else editEmail('');
    }

    function forgetEmail() {
      try { localStorage.removeItem(preferenceKey); } catch (_) {}
      if (savedEmail()) {
        status.textContent = 'This device could not remove the saved email.';
        return;
      }
      reset();
      form.querySelector('button').focus();
      status.textContent = 'Saved Admiral email removed.';
    }

    function editEmail(value, message = '') {
      clear();
      form.innerHTML = `<label>Admiral email
        <textarea id="${prefix}Email" rows="1" inputmode="email" autocomplete="off" enterkeyhint="next"
          data-bf-trim="boundary" autocapitalize="none" spellcheck="false" required></textarea></label>`;
      const draft = form.querySelector('textarea');
      draft.value = value;
      draft.onkeydown = event => {
        if (event.key === 'Enter' && !event.isComposing) {
          event.preventDefault();
          form.requestSubmit();
        }
      };
      button('Continue with Admiral email →', true);
      status.textContent = message;
      draft.focus();
      draft.select();
    }

    function confirmEmail(address, remembered = false) {
      clear();
      selected = address;
      const username = remembered
        ? `<input id="${prefix}Email" name="username" type="hidden" autocomplete="section-admiral username">`
        : `<label>Admiral email<input id="${prefix}Email" name="username" type="text" readonly autocomplete="section-admiral username"></label>`;
      form.innerHTML = username + `<label><span tabindex="-1" data-password-label>${remembered ? 'Enter your Admiral password' : 'Admiral password'}</span>
        <input id="${prefix}Password" name="password" type="password" required
          data-bf-trim="preserve" autocomplete="section-admiral current-password"></label>`;
      form.elements.username.value = address;
      if (!remembered) {
        form.insertAdjacentHTML('beforeend', `<label class="admiral-remember-email"><input type="checkbox" data-remember-email>
          Remember my Admiral email on this device</label>`);
        form.querySelector('[data-remember-email]').checked = savedEmail() === address;
      }
      button('Authenticate Admiral →', true);
      if (remembered) button('Forget my email on this device', false, forgetEmail);
      else button('Edit my sign-in email', false, () => editEmail(address));
      status.textContent = '';
      form.querySelector('[type=password]').focus();
    }

    form.onsubmit = async event => {
      event.preventDefault();
      if (pending) return;
      const draft = form.querySelector('textarea');
      if (draft) {
        const address = validAddress(draft.value);
        if (address) confirmEmail(address);
        else {
          status.textContent = 'Enter a single Admiral email address.';
          draft.focus();
        }
        return;
      }
      if (!selected) return;
      if (validAddress(form.elements.username.value) !== selected) {
        editEmail(selected, 'The email changed. Confirm your Admiral email again.');
        return;
      }
      const password = form.elements.password;
      if (!password.value) {
        status.textContent = 'Enter the password for your Admiral account.';
        password.focus();
        return;
      }
      const turn = ++epoch;
      const current = () => turn === epoch;
      const chosen = selected;
      const rememberBox = form.querySelector('[data-remember-email]');
      // Called by each route only after its live identity and authority checks pass.
      const verified = () => {
        if (!current() || !rememberBox) return;
        try {
          if (rememberBox.checked) localStorage.setItem(preferenceKey, chosen);
          else if (savedEmail() === chosen) localStorage.removeItem(preferenceKey);
        } catch (_) { /* A device preference is optional for sign-in. */ }
      };
      const controls = form.querySelectorAll('button, [data-remember-email]');
      const submit = form.querySelector('[type=submit]');
      pending = true;
      controls.forEach(control => { control.disabled = true; });
      submit.textContent = 'Verifying Admiral…';
      status.textContent = 'Checking Admiral authority…';
      try {
        await authenticate(chosen, password.value, current, verified);
        if (current()) reset();
      } catch (error) {
        if (current()) {
          password.value = '';
          status.textContent = (error?.message || 'Sign-in failed.') + ' The workspace remains locked.';
        }
      } finally {
        if (current()) {
          pending = false;
          controls.forEach(control => { control.disabled = false; });
          submit.textContent = 'Authenticate Admiral →';
        }
      }
    };
    reset();
    return {begin, reset, get pending() { return pending; }};
  }
  return {fields, mount};
})();
/* End Admiral account form */

const admiralVesselLogos = new Map([
  ['beccas-bloom-shop', 'fleet-becca.webp'],
  ['grizzly-bear', 'fleet-grizzly.webp'],
  ['mugshot-after-dark', 'fleet-mugs.webp'],
  ['bf-p-42be92cbac12', 'fleet-voyagekeeper.webp'],
  ['bf-p-fc2816b8254a4845', 'fleet-voyagekeeper.webp'],
  ['ikes-wood-signs', 'ike_character.png'],
  ['bor-north-richmond', 'signal_restoration_logo.png'],
  ['bf-p-f92f87e8ec44', 'https://legacyplumbingrva.com/wp-content/uploads/2026/04/LOGO.png'],
  ['construction-scheduling-01', 'bootstrap_build_logo.png']
]);


;(()=>{
  const $=id=>document.getElementById(id),safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),PROGRAM={reference_only:true,project_id:'bootstrap-build',display_name:'Bootstrap Build',mission_class:'admiral_program',operating_model:'fleet_operated',ownership_model:'admiral_owned',lifecycle_state:'commissioning',logo_url:'bootstrap_build_icon.png'};
  let records=[],programs=[],query='',filter='all',lastSync='',spine={counts:{},vessels:[]};
  const words=v=>String(v||'not_reported').replaceAll('_',' ');
  function mark(v){
    const src = v.logo_url && !/black_flag_(primary_lockup|platform_icon)/.test(v.logo_url)
      ? v.logo_url : admiralVesselLogos.get(v.project_id);
    if (src) return `<img src="${safe(src)}" alt="${safe(v.display_name)} canonical vessel mark">`;
    const code = String(v.display_name || 'V').split(/\s+/).map(word => word[0]).join('').slice(0,3).toUpperCase();
    return `<div class="fleet-watch-code-mark" aria-label="${safe(v.display_name)} project mark"><b>${safe(code)}</b><span>${safe(v.display_name)}</span></div>`;
  }
  function facts(v){const life=String(v.lifecycle_state||'unknown').toLowerCase(),activity=v.reported_at||'',age=activity?Date.now()-Date.parse(activity):Infinity,reported=!!activity&&Number.isFinite(age),stale=reported&&age>604800000,attention=!reported||stale||Number(v.unresolved_issues)>0||['hold','blocked','suspended'].includes(life),ready=!reported?'NEVER REPORTED':stale?'STALE REPORT':life==='active'||life==='live'?'ACTIVE · SERVER':life==='suspended'?'SUSPENDED · ATTENTION':life==='retired'?'RETIRED':life==='staging'?'STAGING · VERIFIED':life==='commissioning'?'COMMISSIONING · VERIFIED':'VERIFIED',hasIssues=v.unresolved_issues!==null&&v.unresolved_issues!==undefined&&Number.isFinite(Number(v.unresolved_issues));return {life,activity,reported,stale,attention,ready,work:v.current_work||'Not reported',issues:hasIssues?Number(v.unresolved_issues):null,summary:v.issue_summary||'',source:reported?(v.truth_source||'vessel_report'):'not_reported'};}
  const filterLabels = {
    all:'All vessels', attention:'Needs attention', issues:'With open issues', held:'Held or blocked',
    stale:'Stale reports', unreported:'Never reported', commissioning:'Commissioning', staging:'Staging',
    active:'Active', owner:'Owner-operated', fleet:'Fleet-operated'
  };
  let view='attention';
  function install(){$('bootstrapFleet')?.remove();document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapFleet" class="bootstrap-fleet fleet-watchtower hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Black Flag Admiral security and Fleet Watchtower"><section id="watchSecurityLayer" class="admiral-security-layer" aria-labelledby="watchSecurityTitle"><div class="admiral-security-card"><header><img src="black_flag_primary_lockup.png" alt="Black Flag"><button id="watchGateClose" type="button">CLOSE</button></header><div class="admiral-security-heading"><small>${window.__darkSkyVerifiedRelease.build} · QUARTERMASTER</small><h2 id="watchSecurityTitle">Admiral Security Layer</h2><p>The passage PIN opened the Admiral doorway. A dedicated Supabase Admiral account must now be authenticated before fleet data can open.</p></div><ol class="admiral-security-steps" aria-label="Admiral authentication progress"><li class="is-complete"><span>01</span><div><small>PASSAGE PIN</small><b>VERIFIED</b></div></li><li class="is-current"><span>02</span><div><small>ADMIRAL ACCOUNT</small><b>REQUIRED</b></div></li><li><span>03</span><div><small>FLEET WORKSPACE</small><b>LOCKED</b></div></li></ol><form id="watchSecurityForm" class="admiral-security-form" autocomplete="off" novalidate>${AdmiralAccountForm.fields('watch')}</form><p id="watchGateStatus" class="admiral-security-status" role="status">Second security check required. The Fleet workspace remains locked.</p><aside><b>Two credentials. Two purposes.</b><span>The passage PIN opens the doorway. Supabase verifies identity and global Admiral read authority. An owner account cannot open this workspace.</span></aside></div></section><div id="watchWorkspace" class="bootstrap-fleet-shell hidden" aria-hidden="true" data-view="attention">
  <header class="bridge-head">
    <div class="bridge-mast"><img src="black_flag_platform_icon.png" alt="">
    <div class="bridge-title"><small>BLACK FLAG · ADMIRAL</small><h2 id="watchFleetTitle">My Fleet</h2></div></div>
    <button class="bridge-schedule" type="button" data-schedulejoe-open>Open ScheduleJoe →</button>
  </header>
  <div class="bridge-bar">
  <nav class="bridge-nav" aria-label="My Fleet views">
    <button type="button" data-watch-view="attention" aria-pressed="true">Attention</button>
    <button type="button" data-watch-view="vessels" aria-pressed="false">Vessels</button>
    <button type="button" data-watch-view="programs" aria-pressed="false">Programs &amp; tools</button>
  </nav>
    <div class="bridge-controls"><button type="button" id="watchRefresh">Refresh</button><button type="button" id="watchSignOut">Sign out</button><button type="button" id="watchClose">Back to Engine</button></div>
  </div>
  <p id="watchStatus" class="bridge-status" role="status">Reading fleet reports…</p>
  <section id="watchKeel" aria-label="Fleet report counts" hidden></section>
  <section id="watchDirectory" aria-labelledby="watchVesselTitle">
    <header class="bridge-section-head"><h3 id="watchVesselTitle" tabindex="-1">Fleet briefing</h3><span id="watchCount"></span></header>
    <div id="watchTools" hidden>
      <label>Find a vessel<input type="search" id="watchSearch" data-bf-trim="boundary" placeholder="Name, vessel ID or operating model"></label>
      <label>Show<select id="watchFilter">${Object.entries(filterLabels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
    </div>
    <div id="watchRows" class="bootstrap-fleet-rows bridge-list"></div>
    <details id="watchRegistry" hidden><summary>Registry details</summary><dl></dl></details>
  </section>
  <section id="watchProgramPanel" aria-labelledby="watchProgramTitle" hidden>
    <header class="bridge-section-head"><h3 id="watchProgramTitle" tabindex="-1">Programs &amp; tools</h3></header>
    <div class="bridge-gallery">
    <div id="watchPrograms" class="bootstrap-fleet-rows bridge-list"></div>
    <div id="watchLocalTools" class="bridge-list">
      <article class="bridge-tool arcade-tool" style="--gallery-art:url(fleet-arcade-cover.webp)"><div><h4>Fleet Arcade</h4><p>Harbor Sluggers · Bottom of the Ninth and the fleet game collection.</p></div><button type="button" data-watch-arcade data-fleet-collection>Open Fleet Arcade →</button></article>
    </div></div>
  </section>
  <div id="watchFleetHelp"></div>
</div><section id="watchOverview" class="fleet-vessel-overview hidden" role="dialog" aria-modal="true" aria-hidden="true"><div class="fleet-vessel-overview-shell"><nav class="fleet-report-nav" aria-label="Report navigation">
    <button type="button" id="watchOverviewClose">← Back to My Fleet</button>
    <div id="watchReportSteps" hidden>
      <button type="button" id="watchPrevReport" data-watch-step="-1">← Previous</button>
      <button type="button" id="watchNextReport" data-watch-step="1">Next →</button>
    </div>
  </nav><div id="watchOverviewBody"></div></div></section></section>`);}
  function controlLabel(v){return ({owner_ready:'OWNER READY',owner_attention:'OWNER ATTENTION',fleet_seeded:'OWNER UNASSIGNED',registry_only:'REGISTRY ONLY'})[v.supabase_control_state]||'POSTURE UNKNOWN';}
  const isActiveLife = life => life === 'active' || life === 'live';
  const held = life => ['hold','blocked','suspended'].includes(life);
  function inFilter(v,key) {
    const f=facts(v);
    switch(key){
      case 'all': return true;
      case 'attention': return f.attention;
      case 'issues': return f.issues>0;
      case 'held': return held(f.life);
      case 'stale': return f.stale;
      case 'unreported': return !f.reported;
      case 'owner': return String(v.operating_model).includes('owner');
      case 'fleet': return String(v.operating_model).includes('fleet');
      case 'active': return isActiveLife(f.life);
      default: return f.life===key;
    }
  }
  function matches(v){
    const fields=[v.display_name,v.project_id,words(v.operating_model),v.operating_model,v.ownership_model,v.lifecycle_state];
    return inFilter(v,filter) && fields.join(' ').toLowerCase().includes(query.toLowerCase());
  }
  function priority(v){
    const f=facts(v);
    if(held(f.life))return 0;
    if(f.issues>0)return 1;
    if(!f.reported)return 2;
    return 3;
  }
  function signals(f){
    const tags=[];
    if(held(f.life))tags.push([words(f.life),'urgent']);
    if(f.issues>0)tags.push([f.issues+' open issue'+(f.issues===1?'':'s'),'urgent']);
    if(!f.reported)tags.push(['Never reported','waiting']);
    else if(f.stale)tags.push(['Stale report','waiting']);
    else if(!tags.length)tags.push(['Current report','current']);
    return tags.map(([label,tone])=>`<span class="bridge-tag ${tone}">${safe(label)}</span>`).join('');
  }
  function vesselRow(v, featured=false){
    const f=facts(v);
    const action=f.reported?'Read report':'View vessel';
    const work=featured && f.summary ? f.summary : v.current_work;
    const stamp=f.reported?new Date(f.activity).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'';
    return `<article class="bridge-row${featured?' bridge-lead':''}">
      <div class="bridge-identity">${mark(v)}<div><h4>${safe(v.display_name)}</h4><small>${safe(words(v.operating_model))} · ${safe(controlLabel(v).toLowerCase())}</small></div></div>
      <div class="bridge-work">${work?'<b>'+safe(work)+'</b>':''}${stamp?'<small>Reported '+safe(stamp)+'</small>':''}</div>
      <div class="bridge-signals">${signals(f)}</div>
      <button type="button" data-watch-vessel="${safe(v.project_id)}" aria-label="${action}: ${safe(v.display_name)}">${action} →</button>
    </article>`;
  }
  function briefingMarkup(list){
    const urgent=list.filter(v=>priority(v)<2);
    const remaining=list.filter(v=>priority(v)>=2);
    const sections=[];
    if(urgent.length){
      const onlyIssues=urgent.every(v=>!held(facts(v).life));
      const reason=onlyIssues?'with open issues':'requiring review';
      const title=urgent.length+' vessel'+(urgent.length===1?'':'s')+' '+reason;
      sections.push(`<section class="bridge-priority" aria-labelledby="watchPriorityTitle"><h4 id="watchPriorityTitle">${title}</h4>
        <div class="bridge-leads">${urgent.map(v=>vesselRow(v,true)).join('')}</div></section>`);
    }
    if(remaining.length){
      sections.push(`<section class="bridge-follow" aria-labelledby="watchFollowTitle"><h4 id="watchFollowTitle">Reporting follow-up</h4>
        <div class="bridge-follow-list">${remaining.map(v=>vesselRow(v)).join('')}</div></section>`);
    }
    return sections.join('');
  }
  function programRow(v){
    const schedule=v.project_id===PROGRAM.project_id;
    const label=schedule?'ScheduleJoe':v.display_name;
    const source=v.reference_only?'Local program':'Registered program';
    const description=schedule?'Bootstrap Build · Construction scheduling':
      v.current_work||(v.project_id==='wonderwake'?'Math, spelling and creative activities':'Awaiting first program report');
    const art=schedule?'schedule-tool':v.project_id==='wonderwake'?'wonder-tool':'';
    return `<article class="bridge-tool ${art}">
      ${art?'':mark(v)}
      <div><h4>${safe(label)}</h4><p>${safe(description)}</p><small>${source}</small></div>
      <div class="bridge-program-actions">${schedule?'<button type="button" data-schedulejoe-open>Open schedules →</button>':''}
      <button type="button" data-watch-vessel="${safe(v.project_id)}" aria-label="Read report for ${safe(v.display_name)}">Program report</button></div>
    </article>`;
  }
  function paintPrograms(){
    const schedule=programs.find(v=>v.project_id===PROGRAM.project_id)||PROGRAM;
    const host=$('watchPrograms');
    const markup=[schedule,...programs.filter(v=>v!==schedule)].map(programRow).join('');
    if(host.programMarkup!==markup){host.innerHTML=markup;host.programMarkup=markup;}
  }
  function paintRegistry(){
    const counts=spine.counts||{};
    const values=[
      ['Registered vessels and programs',counts.vessels],
      ['Settings ready',counts.supabase_settings_rows],
      ['Owner ready',counts.owner_ready_vessels],
      ['Vessels with fresh reports',records.filter(v=>{const f=facts(v);return f.reported&&!f.stale;}).length]
    ];
    $('watchRegistry').querySelector('dl').innerHTML=values.map(([label,value])=>
      `<div><dt>${label}</dt><dd>${value!=null&&Number.isFinite(Number(value))?Number(value):'Not reported'}</dd></div>`
    ).join('');
  }
  function paintKeel(){
    const groups=[['issues','With open issues'],['held','Held or blocked'],['unreported','Never reported'],['stale','Stale reports']];
    $('watchKeel').innerHTML=groups.map(([key,label])=>{
      const count=records.filter(v=>inFilter(v,key)).length;
      return `<button type="button" data-bridge-filter="${key}" aria-label="${label}: ${count} vessels"><b>${count}</b><span>${label}</span></button>`;
    }).join('');
  }
  function paintDirectory(){
    if(!lastSync)return;
    const list=view==='attention'
      ? records.filter(v=>facts(v).attention).sort((a,b)=>priority(a)-priority(b)||(facts(b).issues||0)-(facts(a).issues||0)||String(a.display_name).localeCompare(String(b.display_name)))
      : records.filter(matches);
    for(const option of $('watchFilter').options){
      const key=option.value;
      option.textContent=filterLabels[key]+' ('+records.filter(v=>inFilter(v,key)).length+')';
    }
    $('watchCount').textContent=list.length<records.length ? list.length+' of '+records.length+' vessels' : '';
    const empty=!records.length?'No vessels in the registry.':view==='attention'?'No vessels need attention.':'No vessels match this search and filter.';
    $('watchRows').innerHTML=list.length?(view==='attention'?briefingMarkup(list):list.map(v=>vesselRow(v)).join('')):`<p class="bridge-empty">${empty}</p>`;
  }
  function selectView(next){
    view=next;
    const workspace=$('watchWorkspace');
    workspace.dataset.view=view;
    for(const button of workspace.querySelectorAll('[data-watch-view]'))button.setAttribute('aria-pressed',String(button.dataset.watchView===view));
    $('watchDirectory').hidden=view==='programs';
    $('watchProgramPanel').hidden=view!=='programs';
    $('watchTools').hidden=view!=='vessels';
    $('watchRegistry').hidden=view!=='vessels'||!lastSync;
    $('watchKeel').hidden=view!=='attention'||!lastSync;
    $('watchFleetHelp').hidden=view!=='attention';
    $('watchVesselTitle').textContent=view==='attention'?'Fleet briefing':'Vessel directory';
    paintDirectory();
  }
  let reportPlace = null;

  function findWatchRow(id) {
    return Array.from($('watchWorkspace').querySelectorAll('[data-watch-vessel]'))
      .find(button => button.dataset.watchVessel === id);
  }

  function placeOf(button) {
    return {id: button.dataset.watchVessel, top: button.getBoundingClientRect().top};
  }

  function focusWatchRow(place) {
    const row = findWatchRow(place.id);
    if (!row) {
      const search = view==='vessels' ? $('watchSearch') : $(view==='attention'?'watchVesselTitle':'watchProgramTitle');
      search.scrollIntoView({block: 'center'});
      search.focus({preventScroll: true});
      return;
    }
    const fleet = $('bootstrapFleet');
    const header = $('watchWorkspace').querySelector('.bridge-bar');
    const top = getComputedStyle(header).position === 'sticky'
      ? Math.max(fleet.getBoundingClientRect().top, header.getBoundingClientRect().bottom)
      : fleet.getBoundingClientRect().top;
    const bounds = row.getBoundingClientRect();
    const bottom = fleet.getBoundingClientRect().bottom - bounds.height;
    const desired = Math.max(top + 8, Math.min(place.top, bottom - 8));
    fleet.scrollTop += bounds.top - desired;
    row.focus({preventScroll: true});
  }

  function reportSequence(row) {
    return Array.from(row.closest('.bootstrap-fleet-rows').querySelectorAll('[data-watch-vessel]'));
  }

  function updateReportSteps(row) {
    const list = reportSequence(row);
    const index = list.indexOf(row);
    $('watchReportSteps').hidden = list.length < 2;
    $('watchPrevReport').disabled = index === 0;
    $('watchNextReport').disabled = index === list.length - 1;
  }

  function stepReport(direction) {
    if (!reportPlace || !shown($('watchOverview')) || !shown($('bootstrapFleet'))) return;
    const row = findWatchRow(reportPlace.id);
    if (!row) return;
    const list = reportSequence(row);
    const adjacent = list[list.indexOf(row) + direction];
    if (adjacent) overview(adjacent.dataset.watchVessel);
  }

  function backToWatch() {
    const place = reportPlace;
    reportPlace = null;
    $('watchOverview').classList.add('hidden');
    $('watchOverview').setAttribute('aria-hidden', 'true');
    $('watchWorkspace').inert = false;
    if (place) focusWatchRow(place);
    load();
  }

  function render(next=[...records,...programs]){
    const activeRow=document.activeElement?.closest('[data-watch-vessel]');
    const place=activeRow && $('watchWorkspace').contains(activeRow)?placeOf(activeRow):null;
    programs=next.filter(v=>v.mission_class==='admiral_program');
    records=next.filter(v=>v.mission_class!=='admiral_program');
    paintPrograms();paintKeel();paintRegistry();selectView(view);
    const stamp=new Date(lastSync).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    $('watchStatus').textContent='Last fleet read '+stamp+' · '+records.length+' vessels · '+programs.length+' registered program'+(programs.length===1?'':'s');
    if(place)focusWatchRow(place);
  }
  function clearReports(){
    records=[];programs=[];lastSync='';spine={counts:{},vessels:[]};
    $('watchKeel').hidden=true;$('watchKeel').replaceChildren();
    $('watchCount').textContent='';$('watchRows').replaceChildren();$('watchPrograms').replaceChildren();
    $('watchPrograms').programMarkup=null;
    $('watchRegistry').hidden=true;$('watchRegistry').open=false;$('watchRegistry').querySelector('dl').replaceChildren();
    for(const option of $('watchFilter').options)option.textContent=filterLabels[option.value];
  }
  function failWatch(message){
    clearReports();paintPrograms();
    $('watchRows').innerHTML='<p class="bridge-empty">Fleet reports are unavailable. Use Refresh to try again.</p>';
    $('watchStatus').textContent=message;
  }
  // A verified workspace owns one read-only help mount. Leaving or refreshing it
  // invalidates even an already-dispatched read; outcomes are never stored here.
  let watchEpoch=0,watchRoute=null,helpMount=null,helpClient=null;
  const routeGeneration=()=>window.DarkSkyFleetNavigator?.state?.().generation;
  const shown=node=>!!node?.isConnected&&!node.hidden&&!node.inert&&!node.classList.contains('hidden')&&node.getAttribute('aria-hidden')!=='true';
  const sameWatch=turn=>turn===watchEpoch&&watchRoute===routeGeneration()&&shown($('bootstrapFleet'));
  function clearHelp(){
    const old=helpMount;helpMount=null;
    if(typeof old?.cleanup==='function')old.cleanup();else old?.cleanup?.destroy?.();
    const host=$('watchFleetHelp');if(host)host.textContent='';
    if($('watchActingHelp')){
      $('watchOverviewBody').textContent='';
      $('watchOverview').classList.add('hidden');
      $('watchOverview').setAttribute('aria-hidden','true');
      $('watchWorkspace').inert=false;
    }
  }
  let stopWatchLanding = null;
  function leaveWatch(){stopWatchLanding?.();stopWatchLanding=null;++watchEpoch;clearHelp();}
  function mountHelp(turn,vessel=null){
    const hostId=vessel?'watchActingHelp':'watchFleetHelp';
    const host=$(hostId);
    if(!host||!sameWatch(turn))return;
    try{
      const config=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();
      if(!config?.url||!config.publishableKey||!window.DarkSkySupabase?.create||!window.DarkSkyFleetHelp?.mount)throw Error();
      if(!helpClient||helpClient.url!==config.url.replace(/\/$/,'')||helpClient.publishableKey!==config.publishableKey)
        helpClient=window.DarkSkySupabase.create({url:config.url,publishableKey:config.publishableKey,sessionKey:'darkSkySupabaseAdmiralSessionV1',build:window.__darkSkyVerifiedRelease.build});
      const client=helpClient,session=window.DarkSkyAdmiralSession?.status(),actor=client.readSession()?.user?.id;
      if(!session?.reusable||!session.startedAt||!actor)throw Error();
      const current=()=>{const s=window.DarkSkyAdmiralSession?.status();
        const visible=vessel?shown($('watchOverview')):shown($('watchWorkspace'))&&!shown($('watchOverview'));
        return sameWatch(turn)&&host===$(hostId)&&host.isConnected&&visible&&
          s?.reusable===true&&s.startedAt===session.startedAt&&client.readSession()?.user?.id===actor;};
      if(!current())return;
      const rpc=async(name,args={})=>{
        if(!current()||!args||typeof args!=='object'||Array.isArray(args))throw Error('Reopen Fleet help.');
        if(vessel){
          if(args.p_project_id!==vessel.id||!['acting_captain_list_fleet_help','acting_captain_update_fleet_help','acting_captain_read_fleet_help_attachment'].includes(name))
            throw Error('This action requires the selected vessel.');
        }else if(name!=='admiral_list_fleet_help'||Object.keys(args).length){
          throw Error('This Fleet help view is read-only.');
        }
        const result=await client.rpc(name,args,'Fleet help could not confirm this request.');
        if(!current())throw Error('The verified Fleet help view has closed.');
        return result;
      };
      helpMount={current,cleanup:null};
      helpMount.cleanup=window.DarkSkyFleetHelp.mount(host,{
        role:vessel?'acting_captain':'admiral',projectId:vessel?.id||'',projectName:vessel?.name||'',
        screen:'My Fleet Watchtower',build:window.__darkSkyVerifiedRelease.build,rpc,isCurrent:current,
        openActingCaptain:vessel?undefined:(id,name)=>{
          if(!current()||!id)return;
          leaveWatch();
          reportPlace = null;
          $('watchReportSteps').hidden = true;
          $('watchOverview').scrollTop = 0;
          $('watchOverviewBody').innerHTML=`<section><small>Fleet Help · Acting Captain</small><h2>${safe(name)}</h2><p>You are working as Admiral until a Captain accepts this vessel.</p><div id="watchActingHelp"></div></section>`;
          $('watchWorkspace').inert=true;
          $('watchOverview').classList.remove('hidden');
          $('watchOverview').setAttribute('aria-hidden','false');
          $('watchOverviewClose').focus({preventScroll:true});
          mountHelp(watchEpoch,{id,name});
        }
      });
    }catch(_){clearHelp();if(sameWatch(turn))host.textContent='Fleet help is unavailable. Refresh Watch to try again.';}
  }
  function setSecurityLayer(verified,message=''){const gate=$('watchSecurityLayer'),workspace=$('watchWorkspace'),overview=$('watchOverview');const opening=verified&&workspace.classList.contains('hidden');gate.classList.toggle('hidden',!!verified);gate.setAttribute('aria-hidden',String(!!verified));workspace.classList.toggle('hidden',!verified);workspace.setAttribute('aria-hidden',String(!verified));
    if(opening)stopWatchLanding=window.BlackFlagViewport?.landAtHeader($('watchFleetTitle'),$('bootstrapFleet'));
    if(!verified){clearHelp();reportPlace=null;workspace.inert=false;overview.classList.add('hidden');overview.setAttribute('aria-hidden','true');clearReports();if(message)$('watchGateStatus').textContent=message;}}
  function showWatchSignIn(message) {
    setSecurityLayer(false);
    $('watchSecurityForm').hidden = false;
    watchAccount.begin();
    $('watchGateStatus').textContent = message;
  }
  async function identityVerified(){try{return !!(await window.DarkSkyAdmiralIdentityStatus?.());}catch(_){return false;}}
  async function load(){leaveWatch();const turn=watchEpoch,status=$('watchStatus');try{const verified=await identityVerified();if(!sameWatch(turn))return;if(!verified){showWatchSignIn('Second security check required. Sign in with your Admiral account.');return;}setSecurityLayer(true);mountHelp(turn);status.textContent='Reading fleet reports…';await window.DarkSkySyncVesselBrandIdentity?.();if(!sameWatch(turn))return;if(typeof window.DarkSkyReadAdmiralWatch!=='function'||typeof window.DarkSkyReadFleetSpine!=='function')throw new Error('Supabase Fleet readers are unavailable in this release.');const [watch,keel]=await Promise.all([window.DarkSkyReadAdmiralWatch(),window.DarkSkyReadFleetSpine()]);if(!sameWatch(turn))return;if(!Array.isArray(watch?.records)||!Array.isArray(keel?.vessels))throw Error('Fleet reports could not be confirmed.');const logos=new Map((window.DarkSkyReadAdmiralFleet?.()||[]).map(v=>[v.project_id,v.logo_url])),posture=new Map((keel?.vessels||[]).map(v=>[v.project_id,v]));spine=keel||{counts:{},vessels:[]};lastSync=watch?.read_at||keel?.read_at||new Date().toISOString();render((watch?.records||[]).map(v=>({...v,...(posture.get(v.project_id)||{}),logo_url:logos.get(v.project_id)||''})));}catch(error){const message=error?.message||'Fleet Watch could not be read.';if(!sameWatch(turn))return;const verified=await identityVerified();if(!sameWatch(turn))return;if(!verified){showWatchSignIn(message+' The Fleet workspace remains locked.');return;}failWatch(message);}}
  function open(options={}){
    const returnToEngine=options.source==='admiral-gate';
    $('watchClose').textContent=returnToEngine?'Back to Engine':'Close';
    $('watchGateClose').textContent=returnToEngine?'Back to Engine':'Close';
    watchAccount.reset();$('watchSecurityForm').hidden=true;const fleet=$('bootstrapFleet');
    fleet.dataset.returnToEngine=String(returnToEngine);watchRoute=routeGeneration();setSecurityLayer(false);
    filter='all';query='';$('watchSearch').value='';$('watchFilter').value='all';selectView('attention');
    fleet.classList.remove('hidden');fleet.setAttribute('aria-hidden','false');document.body.classList.add('bootstrap-fleet-open');fleet.scrollTop=0;$('watchGateStatus').textContent='Checking the dedicated Admiral account…';load();}
  function close(){
    const pending = watchAccount.pending;
    watchAccount.reset();
    leaveWatch();
    reportPlace = null;
    $('bootstrapFleet').classList.add('hidden');
    $('bootstrapFleet').setAttribute('aria-hidden','true');
    document.body.classList.remove('bootstrap-fleet-open');
    if (pending) window.DarkSkyAdmiralSession?.cancelSignIn();
  }
  function overview(id) {
    const v = programs.find(item => item.project_id === id) ||
      (id === PROGRAM.project_id ? PROGRAM : records.find(item => item.project_id === id));
    const row = findWatchRow(id);
    if (!v || !row) return;
    const paging = !!reportPlace;
    reportPlace = paging ? {id, top: reportPlace.top} : placeOf(row);
    leaveWatch();
    updateReportSteps(row);
    const f=facts(v),program=v.mission_class==='admiral_program';$('watchOverviewBody').innerHTML=`<header>${mark(v)}<div><small>ADMIRAL OBSERVATION · EXACT PROJECT CONTEXT</small><h2 tabindex="-1">${safe(v.display_name)}</h2><p>${safe(v.project_id)}</p></div><em>READ ONLY</em></header><section class="fleet-vessel-context"><article><small>VESSEL LIFECYCLE</small><b>${safe(words(f.life).toUpperCase())}</b></article><article><small>OWNERSHIP STATUS</small><b>${safe(program?'SEPARATE PROGRAM':controlLabel(v))}</b></article><article><small>OWNER ACCOUNTS (NOT CAPTAINS)</small><b>${program?'Not applicable':Number(v.owner_auth_identity_count||0)}</b></article><article><small>SERVER SETTINGS</small><b>${program?'Not applicable':v.settings_present?'PRESENT':'MISSING'}</b></article><article><small>REPORT FRESHNESS</small><b>${safe(!f.reported?"NEVER REPORTED":f.stale?"STALE REPORT":"RECENT REPORT")}</b></article><article><small>OPERATING MODEL</small><b>${safe(words(v.operating_model).toUpperCase())}</b></article><article><small>LAST FLEET READ (NOT A NEW REPORT)</small><b>${safe(lastSync?new Date(lastSync).toLocaleString():"Not read")}</b></article><article><small>CURRENT WORK</small><b>${safe(f.work)}</b></article><article><small>CAPTAIN REPORT SAVED AT</small><b>${safe(f.activity?new Date(f.activity).toLocaleString():'Not reported')}</b></article></section>${f.summary?`<aside><b>Issue summary</b><span>${safe(f.summary)}</span></aside>`:''}<aside><b>Scoped observation established</b><span>Only ${safe(v.display_name)} (${safe(v.project_id)}) is in context. Source: ${safe(words(f.source))}. Captain appointment and ownership are separate. An unassigned owner does not cancel an accepted Captain appointment; owner authority still requires an exact-vessel owner membership. No modifying control is exposed.</span></aside>${program?'':`<section class="tb-command-access"><h3>Fleet Captain operating access</h3><p>Observation is available without a Captain appointment. Operating is a separate authority check, not an ownership transfer.</p><p class="tb-command-pending"><b>FLEET COMMAND OPERATIONS NOT ENABLED</b><br>For a help request on an unassigned vessel, open Fleet help in My Fleet and choose Open as acting Captain. This is not a backend-health warning or a publication status. An accepted, exact-vessel Captain uses their separate Captain Station; observation grants no operating permission.</p><button type="button" disabled>OPERATE AS FLEET CAPTAIN — NOT ENABLED</button><p>No appointment or membership will be created to bypass this boundary.</p></section>`}`;
    $('watchWorkspace').inert = true;
    const modal = $('watchOverview');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modal.scrollTop = 0;
    const focusTarget = paging ? $('watchOverviewBody').querySelector('h2') : $('watchOverviewClose');
    focusTarget.focus({preventScroll: true});
  }
  install();
  const watchAccount = AdmiralAccountForm.mount($('watchSecurityForm'), $('watchGateStatus'), async (email, password, current, verified) => {
    await window.DarkSkyAuthenticateAdmiral(email, password);
    if (!current()) return;
    if (!(await identityVerified())) throw Error('Active Admiral authority was not verified.');
    if (!current()) return;
    verified();
    await load();
  });
  window.DarkSkyOpenFleetWatchtower=open;window.DarkSkyOpenAdmiralFleet=open;
  window.addEventListener('pagehide', () => watchAccount.reset());
  for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable','pagehide'])
    window.addEventListener(event,leaveWatch);
  window.addEventListener('darksky:admiral-session-changed',()=>{if(helpMount&&!helpMount.current())leaveWatch();});
  window.addEventListener('darksky:command-route',()=>{if(shown($('bootstrapFleet'))&&watchRoute!==routeGeneration())close();});
  window.addEventListener('darksky:admiral-fleet-updated',e=>{if($('bootstrapFleet').classList.contains('hidden')||(!records.length&&!programs.length))return;const logos=new Map((e.detail?.records||[]).map(v=>[v.project_id,v.logo_url]));render([...records,...programs].map(v=>({...v,logo_url:logos.get(v.project_id)||v.logo_url||''})));});
  document.addEventListener('click',async e=>{const t=e.target;if(t.closest?.('#watchClose,#watchGateClose')){
    const returnToEngine=$('bootstrapFleet').dataset.returnToEngine==='true';
    close();
    if(returnToEngine){
      if(window.BlackFlagAuth?.isUnlocked?.()||window.DarkSkyTestAccess?.isActive?.())window.DarkSkyReturnToEngine?.();
      else window.requireEngineEntry?.();
    }
    return;
  }if(t.closest?.('#watchRefresh'))return load();if(t.closest?.('#watchSignOut')){watchAccount.reset();leaveWatch();await window.DarkSkySignOutAdmiral?.();if(shown($('bootstrapFleet')))showWatchSignIn('Admiral account signed out. Sign in to reopen My Fleet.');return;}const vessel=t.closest?.('[data-watch-vessel]');if(vessel)return overview(vessel.dataset.watchVessel);if(t.closest?.('#watchOverviewClose'))return backToWatch();
    const nav=t.closest?.('[data-watch-view]'),metric=t.closest?.('[data-bridge-filter]');
    if((nav||metric) && shown($('watchWorkspace'))){
      if(metric){
        filter=metric.dataset.bridgeFilter;query='';$('watchSearch').value='';$('watchFilter').value=filter;
      }
      selectView(metric?'vessels':nav.dataset.watchView);
      $('bootstrapFleet').scrollTop=0;
      if(metric)$('watchVesselTitle').focus({preventScroll:true});
      return;
    }
    const step=t.closest?.('button[data-watch-step]');
    if(step&&!step.disabled)return stepReport(Number(step.dataset.watchStep));
  },true);
  document.addEventListener('input',e=>{if(e.target.id==='watchSearch'){query=e.target.value.trim();paintDirectory();}});
  $('watchFilter').addEventListener('change',e=>{filter=e.target.value;paintDirectory();});
})();

(() => {
  'use strict';

  const CAPTAIN_PIN = '19613';
  const ADMIRAL_PIN = '19613'; // Temporary shared credential; separate contract so it can split later without rewiring authority.
  window.DarkSkyCaptainAuthContract = Object.freeze({pin:CAPTAIN_PIN,recoveryPin:CAPTAIN_PIN,scope:'captains-quarters-only'});
  window.DarkSkyAdmiralAuthContract = Object.freeze({pin:ADMIRAL_PIN,recoveryPin:ADMIRAL_PIN,scope:'admirals-deck-only',sharedWithCaptain:true,temporary:true});
  const UPPER_COMMAND_BUILD=window.__darkSkyVerifiedRelease.build;
  let authorized = false;
  // Read-only session witness; this never grants Captain or server authority.
  window.DarkSkyCaptainSessionStatus = () => authorized;

  const byId = (id) => document.getElementById(id);
  // Module-wide encoder for every Professional and Signal Report renderer.
  // The Cinematic renderer also keeps its own local helper; neither surface now
  // depends on a sibling function scope being active.
  const captainSafe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
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
      if(gate){gate.style.removeProperty('--admiral-command-visual');gate.classList.remove('admiral-custom-visual');const status=gate.querySelector('#admiralVisualStatus');if(status)status.textContent='Your fleet stays private until access is verified.';}
    }else if(slot==='captain'){
      // Captain visual uploads are retained as forge references until the command
      // surface is Sea-Trialed; never silently replace the proven room geometry.
      const room=byId('captainQuarters'); if(room){room.dataset.forgeVisualReady='1';room.style.setProperty('--captain-forge-reference',`url("${url}")`);}
    }
  }
  function hydrateUpperCommandVisuals(){ loadUpperCommandVisual('captain'); loadUpperCommandVisual('admiral'); }

  let captainSubviewReturnFocus=null;
  let captainSignalReturnFocus=null;

  function enterCaptainSubview(id) {
    captainSubviewReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    hide('captainGlobalExit');
    show(id);
    requestAnimationFrame(()=>{
      const view=byId(id);
      const focusTarget=view?.querySelector?.('.captain-round-close,button,[href],[tabindex]:not([tabindex="-1"])');
      try{focusTarget?.focus({preventScroll:true});}catch(_){focusTarget?.focus?.();}
    });
  }

  function leaveCaptainSubview(id) {
    hide(id);
    const quarters = byId('captainQuarters');
    if (authorized && quarters && !quarters.classList.contains('hidden')) show('captainGlobalExit');
    const target=captainSubviewReturnFocus;
    captainSubviewReturnFocus=null;
    requestAnimationFrame(()=>{try{target?.focus?.({preventScroll:true});}catch(_){target?.focus?.();}});
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
    const cq=byId('captainQuarters'); if(cq){cq.dataset.defaultCommandMode='professional';cq.dataset.commandMode='professional';}
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
    const presentation=vessel.statusPresentation;
    const evidenceRows=Array.isArray(presentation?.commissioning?.rows)?presentation.commissioning.rows:[];
    const commissioning=evidenceRows.length?presentation.commissioning:null;
    captainSignalReturnFocus=byId('captainFleetVessels')?.querySelector(`[data-captain-vessel="${projectId}"]`)||
      (document.activeElement instanceof HTMLElement?document.activeElement:null);
    report.setAttribute('role','region');
    report.setAttribute('aria-label',`${vessel.name} signal report`);
    report.setAttribute('tabindex','-1');
    report.innerHTML=`<div class="cq-signal-opened" role="status"><i></i><span><b>SIGNAL REPORT OPEN</b><small>Exact vessel scope confirmed</small></span></div><div class="cq-signal-report-head">
      <div><small>CAPTAIN'S SIGNAL REPORT</small><h3>${vessel.name}</h3></div>
      <button id="captainSignalClose" type="button" aria-label="Close signal report">×</button>
    </div>
    <div class="cq-signal-vessel-summary">
      <span>PUBLICATION · ${captainSafe(presentation?.publication?.label||'UNVERIFIED')}</span>
      <span>${vessel.activeOutposts} SAILING</span>
      <span>${vessel.attentionOutposts} NEEDING ATTENTION</span>
      <span>${vessel.totalOutposts} TOTAL OUTPOSTS</span>
      <span>OWNER SETUP · ${captainSafe(presentation?.owner?.label||'UNVERIFIED')}</span>
    </div>
    <div class="cq-fleet-ready-course"><small>LOCAL COMMISSIONING</small><strong>${captainSafe(commissioning?.label||'EVIDENCE UNVERIFIED')}${evidenceRows.length?` · ${Number(commissioning.passed)||0} / ${Number(commissioning.total)||0} GATES CLEAR`:''}</strong><p>${captainSafe(commissioning?.detail||'Local gate evidence was not supplied. Commissioning is unverified.')}</p></div>
    <p class="cq-publication-detail">${captainSafe(presentation?.publication?.detail||'Saved publication setting and customer availability are unverified.')}</p>
    ${evidenceRows.length?`<ul class="cq-commissioning-rows" aria-label="Local commissioning evidence">${evidenceRows.map(row=>`<li data-commissioning-gate="${captainSafe(row.id)}" class="${row.pass===true?'pass':'open'}"><span><strong>${captainSafe(row.label)}</strong><small>${captainSafe(row.detail)}</small></span><b>${row.pass===true?'CLEAR':'OPEN'}</b></li>`).join('')}</ul>`:''}
    <div class="cq-signal-outposts">
      ${outposts.length?outposts.map(o=>{
        const reasons=o.attentionReasons||[];
        return `<article class="cq-signal-outpost ${o.state}">
          <i></i>
          <div><strong>${captainSafe(o.name)}</strong><small>${stateLabel(o.state)} • Manifest v${Number(o.manifestVersion)||1}</small><span class="cq-outpost-evidence"><em class="${o.customerTestRecorded?'pass':'open'}">${o.customerTestRecorded?'TEST RECORDED':'TEST PENDING'}</em><em class="${o.customerExperienceApproved?'pass':'open'}">${o.customerExperienceApproved?'EXPERIENCE APPROVED':'EXPERIENCE REVIEW'}</em><em class="${o.deviceLockVerified?'pass':'before'}">${o.deviceLockVerified?'DEVICE VERIFIED':'BEFORE LIVE'}</em></span>${reasons.length?`<p>${reasons.map(captainSafe).join(' • ')}</p>`:''}<p class="cq-outpost-next"><b>NEXT:</b> ${captainSafe(o.nextStep||'Review this outpost in Project Control.')}</p></div>
          <button type="button" data-captain-route-project="${captainSafe(vessel.projectId)}" data-captain-route-outpost="${captainSafe(o.id)}">${captainSafe(o.routeLabel||'OPEN OUTPOST')} <small>Exact route in Engine</small></button>
        </article>`;
      }).join(''):`<div class="cq-no-signals">No current outpost records. Saved publication and customer availability must be checked separately.</div>`}
    </div>
    <p class="cq-signal-footnote">Captain's Quarters observes and routes. Deployment machinery remains in the Engine behind its own authorization.</p>`;
    report.classList.remove('hidden');
    const closeReport=()=>{
      report.classList.add('hidden');
      const fallback=byId('captainFleetVessels')?.querySelector(`[data-captain-vessel="${projectId}"]`);
      const target=captainSignalReturnFocus?.isConnected?captainSignalReturnFocus:fallback;
      captainSignalReturnFocus=null;
      requestAnimationFrame(()=>{try{target?.focus?.({preventScroll:true});}catch(_){target?.focus?.();}});
    };
    byId('captainSignalClose')?.addEventListener('click',closeReport,{once:true});
    requestAnimationFrame(()=>{try{report.focus({preventScroll:true});}catch(_){report.focus?.();}});
    const status=byId('captainProfessionalStatus');
    if(status)status.textContent=`${vessel.name} signal report opened in exact-vessel scope.`;
  }

  function refreshCaptainFleetChart(){
    const box=byId('captainFleetVessels');
    const summary=byId('captainFleetSignalSummary');
    const report=byId('captainFleetSignalReport');
    if(!box)return;
    if(report)report.classList.add('hidden');
    const fleet=fleetSnapshot();
    if(!fleet.length)return;
    const positions=[[15,27],[49,18],[83,29],[18,70],[51,68],[82,72]];
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

  function ensureCinematicHelm(){
    const room=byId('captainQuarters');
    if(!room)return null;
    let helm=byId('captainCinematicHelm');
    if(helm)return helm;
    helm=document.createElement('main');
    helm.id='captainCinematicHelm';
    helm.className='cq-cinematic-helm';
    helm.setAttribute('aria-label','Living cinematic fleet command chart');
    helm.innerHTML=`
      <header class="cq-helm-header">
        <div><small>CAPTAIN'S CHART TABLE · LIVE FLEET POSITION</small><h2>The Living Dark Sky</h2><p>Choose one vessel. Read one signal. Set one deliberate course.</p></div>
        <div class="cq-helm-weather" aria-label="Current fleet watch"><i></i><span><small>WATCH STATUS</small><b id="captainCineWatchState">READING</b></span></div>
      </header>
      <section class="cq-helm-stage">
        <div class="cq-living-chart" aria-label="Six-vessel fleet map">
          <div class="cq-chart-aurora" aria-hidden="true"></div>
          <div class="cq-chart-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="cq-chart-depth" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <svg class="cq-chart-routes" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            <path d="M170 150 C300 240 380 240 490 95"/><path d="M490 95 C650 185 690 130 800 168"/><path d="M170 150 C110 315 120 360 200 430"/><path d="M200 430 C340 365 385 410 510 402"/><path d="M510 402 C650 335 715 430 820 430"/><path d="M800 168 C875 255 875 330 820 430"/>
          </svg>
          <div class="cq-chart-north" aria-hidden="true"><span>N</span><b>✦</b></div>
          <div class="cq-chart-bearing bearing-west" aria-hidden="true">270° · WESTERN REACH</div>
          <div class="cq-chart-bearing bearing-east" aria-hidden="true">090° · EASTERN REACH</div>
          <div id="captainCineVessels" class="cq-cine-vessels"></div>
          <div class="cq-chart-legend"><span><i class="steady"></i>IN FLEET</span><span><i class="trial"></i>SEA TRIAL</span><span><i class="signal"></i>NEEDS ATTENTION</span></div>
        </div>
        <aside id="captainCineIntel" class="cq-cine-intel" aria-live="polite"></aside>
      </section>
      <nav class="cq-cine-command-loop" aria-label="Captain command loop">
        <button type="button" data-cine-stage="watch" aria-pressed="true"><small>01</small><span><b>WATCH</b><em>What changed?</em></span></button>
        <button type="button" data-cine-stage="decide" aria-pressed="false"><small>02</small><span><b>DECIDE</b><em>Why does it matter?</em></span></button>
        <button type="button" data-cine-stage="act" aria-pressed="false"><small>03</small><span><b>ACT</b><em>Take the exact route</em></span></button>
        <button type="button" data-cine-stage="record" aria-pressed="false"><small>04</small><span><b>RECORD</b><em>Keep the outcome</em></span></button>
        <button type="button" data-cine-stage="systems" aria-pressed="false"><small>+</small><span><b>MORE SYSTEMS</b><em>Open support stations</em></span></button>
      </nav>
      <section id="captainCineSystems" class="cq-cine-systems hidden" aria-label="Captain support stations">
        <button type="button" data-cine-route="readiness"><b>Fleet Readiness</b><small>Prove the hull</small></button>
        <button type="button" data-cine-route="workshop"><b>Workshop</b><small>Ideas and experiments</small></button>
        <button type="button" data-cine-route="forge"><b>Visual Forge</b><small>Presentation and brand</small></button>
        <button type="button" data-cine-route="shipyard"><b>Shipyard</b><small>Future vessels</small></button>
        <button type="button" data-cine-route="blueprint"><b>Blueprint</b><small>Architecture map</small></button>
        <button type="button" data-cine-route="test"><b>Test Access</b><small>Engine testing</small></button>
        <button type="button" data-cine-route="admiral"><b>Admiral's Gate</b><small>Provisional higher command</small></button>
      </section>`;
    helm.dataset.stage='watch';
    helm.addEventListener('click',event=>{
      const vessel=event.target.closest('[data-cine-vessel]');
      if(vessel){helm.dataset.selectedVessel=vessel.dataset.cineVessel;helm.dataset.userSelected='1';helm.dataset.stage='watch';helm.classList.remove('signal-acquired');void helm.offsetWidth;helm.classList.add('signal-acquired');refreshCinematicHelm();return;}
      const action=event.target.closest('[data-cine-action]');
      if(action){
        if(action.dataset.cineAction==='readiness'){runCinematicFleetReadiness(helm);return;}
        if(action.dataset.cineAction==='findings'){openAdmiralGate('captain','findings');return;}
        const projectId=helm.dataset.selectedVessel;
        if(action.dataset.cineAction==='report'&&projectId){byId('captainDarkSkyChartBtn')?.click();requestAnimationFrame(()=>openSignalReport(projectId));return;}
        if(action.dataset.cineAction==='firstmate'){byId('captainSpyglassBtn')?.click();return;}
        if(action.dataset.cineAction==='record'){byId('captainLogDoor')?.click();return;}
      }
      const stage=event.target.closest('[data-cine-stage]');
      if(stage){
        const name=stage.dataset.cineStage;
        if(name==='systems'){const systems=byId('captainCineSystems');systems?.classList.toggle('hidden');stage.setAttribute('aria-pressed',String(Boolean(systems&&!systems.classList.contains('hidden'))));}
        else{helm.dataset.stage=name;byId('captainCineSystems')?.classList.add('hidden');refreshCinematicHelm();}
        return;
      }
      const route=event.target.closest('[data-cine-route]');
      if(route){
        if(route.dataset.cineRoute==='readiness'){runCinematicFleetReadiness(helm);return;}
        const target=ensureCaptainDeskIndex()?.querySelector(`[data-cq-desk-route="${route.dataset.cineRoute}"]`);
        if(target)target.click();
        else showCaptainDeskNotice('That support station is not available on this hull.','unavailable');
      }
    });
    room.appendChild(helm);
    return helm;
  }

  function refreshCinematicHelm(){
    const helm=ensureCinematicHelm();
    const host=byId('captainCineVessels');
    const intel=byId('captainCineIntel');
    if(!helm||!host||!intel)return;
    const fleet=fleetSnapshot();
    const attentionFleet=fleet.filter(v=>Number(v.attentionOutposts)>0);
    const positions=[[17,25],[49,15],[80,28],[20,72],[51,67],[82,72]];
    if(!fleet.length){host.innerHTML='<p class="cq-cine-empty">Fleet position is awaiting Engine truth.</p>';intel.innerHTML='<small>FIRST MATE</small><h3>Standing by</h3><p>No vessel manifest is available yet.</p>';return;}
    if(!fleet.some(v=>v.projectId===helm.dataset.selectedVessel)||(!helm.dataset.userSelected&&attentionFleet.length))helm.dataset.selectedVessel=(attentionFleet[0]||fleet[0]).projectId;
    const chosen=fleet.find(v=>v.projectId===helm.dataset.selectedVessel)||fleet[0];
    const htmlSafe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    host.innerHTML=fleet.map((v,index)=>{
      const trials=(v.outposts||[]).filter(o=>o.state==='sea_trial').length;
      const tone=Number(v.attentionOutposts)>0?'signal':trials?'trial':Number(v.activeOutposts)>0?'sailing':'steady';
      const status=Number(v.attentionOutposts)>0?`${v.attentionOutposts} SIGNAL`:trials?`${trials} SEA TRIAL`:Number(v.activeOutposts)>0?`${v.activeOutposts} SAILING`:'IN FLEET';
      const pos=positions[index%positions.length];
      const bearing=['NW · 315°','N · 000°','NE · 045°','SW · 225°','S · 180°','SE · 135°'][index%6];
      return `<button type="button" class="cq-cine-vessel ${tone}${v.projectId===chosen.projectId?' selected':''}" data-cine-vessel="${htmlSafe(v.projectId)}" style="--cine-x:${pos[0]}%;--cine-y:${pos[1]}%" aria-pressed="${v.projectId===chosen.projectId}" aria-label="${htmlSafe(v.name)}, ${status}"><i></i><span>${htmlSafe(String(v.code||'PRJ').slice(0,3))}<em>${bearing}</em></span><b>${htmlSafe(v.name)}</b><small>${status}</small></button>`;
    }).join('');
    const trials=(chosen.outposts||[]).filter(o=>o.state==='sea_trial');
    const reasons=[];(chosen.outposts||[]).forEach(o=>(o.attentionReasons||[]).forEach(r=>{if(r&&!reasons.includes(r))reasons.push(r);}));
    const stage=helm.dataset.stage||'watch';
    const readinessReport=window.__lastAdmiralReadinessReport;
    const readinessChecking=helm.dataset.readinessState==='checking';
    const readinessUnavailable=helm.dataset.readinessState==='unavailable';
    const readinessLabel=readinessUnavailable?'UNAVAILABLE':readinessReport?(readinessReport.pass?(readinessReport.warnings?'WATCH':'CLEAR'):'HOLD'):'NOT RUN';
    const stageCopy={
      watch:{label:'WHAT CHANGED',title:reasons[0]||`${chosen.name} has no active attention signal.`,copy:trials.length?`${trials[0].name} is presently in Sea Trial.`:'The latest deployment manifest is reflected on this chart.'},
      decide:{label:'WHY IT MATTERS',title:Number(chosen.attentionOutposts)>0?'Verification remains incomplete.':'No Captain decision is waiting.',copy:reasons.length?reasons.join(' · '):'The vessel remains observable without crossing its project boundary.'},
      act:{label:'RECOMMENDED ROUTE',title:Number(chosen.attentionOutposts)>0?'Inspect the scoped evidence first.':'Hold the present course.',copy:Number(chosen.attentionOutposts)>0?'Open the signal report. Enter the exact vessel only if deliberate action is required.':'No modifying command is recommended.'},
      record:{label:'DURABLE OUTCOME',title:'Keep consequential command.',copy:'Decisions, outcomes, and lessons belong in the Captain’s Log. Routine navigation is not promoted as history.'},
      readiness:{label:'FLEET READINESS',title:readinessChecking?'Proving the fleet now…':readinessUnavailable?'Fleet Readiness is temporarily unavailable.':readinessReport?(readinessReport.pass?(readinessReport.warnings?'Runtime checks completed with unresolved watch items.':'Runtime checks are clear; working-ship handoff is not verified.'):`Hold in harbor. ${Number(readinessReport.criticalFailures)||0} critical check${Number(readinessReport.criticalFailures)===1?'':'s'} failed.`):'Fleet proof has not been run.',copy:readinessChecking?'Checking isolation, authority, release identity, and operational contracts. This result will remain visible when complete.':readinessUnavailable?'The check did not return a valid report. No readiness claim has been recorded.':readinessReport?`${Number(readinessReport.checks?.length)||0} checks completed · ${Number(readinessReport.warnings)||0} watch item${Number(readinessReport.warnings)===1?'':'s'} · ${Number(readinessReport.criticalFailures)||0} critical hold${Number(readinessReport.criticalFailures)===1?'':'s'}.`:'Run Fleet Readiness to verify the present build against its protected contracts.'}
    }[stage];
    const readinessTone=readinessChecking?'checking':readinessLabel.toLowerCase();
    intel.innerHTML=`<div class="cq-intel-heading"><small>FIRST MATE · ${htmlSafe(stageCopy.label)}</small><span class="${stage==='readiness'?readinessTone:(Number(chosen.attentionOutposts)>0?'attention':'clear')}">${stage==='readiness'?(readinessChecking?'CHECKING':readinessLabel):(Number(chosen.attentionOutposts)>0?'SIGNAL OPEN':'COURSE STEADY')}</span></div><h3>${stage==='readiness'?'Fleet Proof':htmlSafe(chosen.name)}</h3><p class="cq-intel-title">${htmlSafe(stageCopy.title)}</p><p>${htmlSafe(stageCopy.copy)}</p><div class="cq-intel-facts">${stage==='readiness'?`<span><b>${Number(readinessReport?.checks?.length)||0}</b> CHECKS</span><span><b>${Number(readinessReport?.warnings)||0}</b> WATCH</span><span><b>${Number(readinessReport?.criticalFailures)||0}</b> HOLDS</span>`:`<span><b>${Number(chosen.activeOutposts)||0}</b> SAILING</span><span><b>${trials.length}</b> SEA TRIAL</span><span><b>${Number(chosen.attentionOutposts)||0}</b> SIGNALS</span>`}</div><div class="cq-intel-actions">${stage==='readiness'?`<button type="button" data-cine-action="readiness" ${readinessChecking?'disabled':''}>${readinessChecking?'CHECKING FLEET…':readinessReport?'RUN READINESS AGAIN':'RUN FLEET READINESS'}</button>${readinessReport&&!readinessChecking?'<button type="button" data-cine-action="findings">VIEW CURRENT FINDINGS</button>':''}`:stage==='record'?'<button type="button" data-cine-action="record">OPEN CAPTAIN\'S LOG</button>':`<button type="button" data-cine-action="report">${Number(chosen.attentionOutposts)>0?'OPEN SCOPED REPORT':'VIEW VESSEL POSITION'}</button>`}${stage==='readiness'?'':'<button type="button" data-cine-action="firstmate">FULL FIRST MATE ANALYSIS</button>'}</div><small class="cq-intel-boundary">READ / ROUTE ONLY · VESSEL MACHINERY REMAINS ISOLATED</small>`;
    helm.querySelectorAll('[data-cine-stage]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.cineStage===stage)));
    const state=byId('captainCineWatchState');if(state)state.textContent=stage==='readiness'?(readinessChecking?'CHECKING':readinessLabel):(attentionFleet.length?`${attentionFleet.length} SIGNAL${attentionFleet.length===1?'':'S'}`:'STEADY');
    helm.classList.toggle('attention',attentionFleet.length>0);
  }

  function runCinematicFleetReadiness(helm=ensureCinematicHelm()){
    if(!helm)return;
    byId('captainCineSystems')?.classList.add('hidden');
    const systemsButton=helm.querySelector('[data-cine-stage="systems"]');
    if(systemsButton)systemsButton.setAttribute('aria-pressed','false');
    helm.dataset.stage='readiness';
    helm.dataset.readinessState='checking';
    refreshCinematicHelm();
    Promise.resolve(window.DarkSkyAdmiralReadiness?.run?.()).then(report=>{
      if(!report)throw new Error('Fleet Readiness service unavailable');
      window.__lastAdmiralReadinessReport=report;
      helm.dataset.readinessState=report.pass?(report.warnings?'watch':'clear'):'hold';
      refreshCinematicHelm();
      showCaptainDeskNotice(report.pass?(report.warnings?`Fleet readiness completed with ${report.warnings} watch item(s).`:'Fleet readiness complete. Runtime checks completed; handoff remains separately unverified.'):`Fleet readiness found ${report.criticalFailures} critical hold(s).`,report.pass?(report.warnings?'future':'ready'):'unavailable');
    }).catch(error=>{
      helm.dataset.readinessState='unavailable';
      refreshCinematicHelm();
      showCaptainDeskNotice(String(error?.message||error),'unavailable');
    });
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
    showCaptainDeskNotice.timer=setTimeout(()=>notice.classList.remove('show'),6500);
  }

  function refreshAdmiralCeremonialSurface(){
    const rows=fleetSnapshot();
    const sailing=rows.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='deployed').length,0);
    const trials=rows.reduce((n,v)=>n+(v.outposts||[]).filter(o=>o.state==='sea_trial').length,0);
    if(byId('admiralCeremonialVessels'))byId('admiralCeremonialVessels').textContent=String(rows.length);
    if(byId('admiralCeremonialSailing'))byId('admiralCeremonialSailing').textContent=String(sailing);
    if(byId('admiralCeremonialTrials'))byId('admiralCeremonialTrials').textContent=String(trials);
    const report=window.__lastAdmiralReadinessReport||null;
    const changed=byId('admiralWhatChanged');
    if(changed)changed.textContent=report?(report.criticalFailures?`${report.criticalFailures} governance hold${report.criticalFailures===1?'':'s'} require Admiral awareness.`:report.warnings?`${report.warnings} verified governance watch item${report.warnings===1?'':'s'} remain.`:'Runtime governance checks are clear; working-ship handoff remains unverified.'):'Governance posture awaits verified Fleet Readiness.';
  }

  const READINESS_TRUTH_KEY='bf.command.readiness.truth.v2';
  const CAPTAIN_OUTCOME_KEY='bf.command.captain.outcomes.v1';
  function readJsonLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch(_){return fallback;}}
  function writeJsonLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){ }}
  function verificationProvenance(check){
    if(check.evidenceKind==='packaged-contract-not-live-operating-proof')return 'PACKAGED CONTRACT • NOT A LIVE HANDOFF TEST';
    if(check.evidenceKind==='current-page-diagnostic-channel-observation')return 'BROWSER CHANNEL • NOT CLOUD BACKUP';
    if(check.evidenceKind==='live-negative-test-outstanding')return 'LIVE ACCESS-DENIAL PROOF OUTSTANDING';
    if(check.id==='ike-true-case-roundtrip')return check.state==='pass'?'CURRENT BUILD • SOURCE CONTRACT + LIVE DOM WHEN PRESENT':'CURRENT BUILD • TRUECASE CONTRACT';
    if(check.id==='ike-style-foundry'||check.id==='ike-glyphforge')return 'CURRENT BUILD • OWNER/ENGINE SOURCE CONTRACT';
    if(check.id==='storage-growth'||check.id==='storage-attribution-gap')return 'CURRENT BUILD • BROWSER STORAGE ESTIMATE';
    if(check.id==='known-calibration-replay')return 'CURRENT BUILD • PROTECTED CALIBRATION REPLAY';
    return 'CURRENT BUILD • FLEET READINESS';
  }
  function readReadinessTruthKeelGuard(){
    const candidates=[window.__darkSkyReadinessTruthKeelGuard];
    for(const kind of ['sessionStorage','localStorage'])try{const raw=window[kind].getItem(READINESS_TRUTH_KEY);if(raw)candidates.push(JSON.parse(raw));}catch(_){ }
    return candidates.filter(x=>x?.schema==='dark-sky-readiness-truth-v2'&&x.findings&&Array.isArray(x.history)).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0]||{findings:{},history:[]};
  }
  function writeReadinessTruthKeelGuard(truth){
    window.__darkSkyReadinessTruthKeelGuard=truth;
    const status={memory:true,session:false,local:false,errors:[],durableStoreVerified:false};
    const text=JSON.stringify(truth);
    for(const kind of ['sessionStorage','localStorage'])try{window[kind].setItem(READINESS_TRUTH_KEY,text);status[kind==='sessionStorage'?'session':'local']=window[kind].getItem(READINESS_TRUTH_KEY)===text;}catch(e){status.errors.push(`${kind}: ${String(e?.name||'Error')}: ${String(e?.message||e)}`);}
    return status;
  }
  function reconcileReadinessTruth(report){
    if(report.readinessTruth?.runId===report.runId&&report.readinessTruth?.updatedAt===report.at)return report.readinessTruth;
    const prior=JSON.parse(JSON.stringify(readReadinessTruthKeelGuard())),now=report.at||new Date().toISOString(),findings={...prior.findings},cleared=[];
    (report.checks||[]).forEach(c=>{
      const prev=findings[c.id]||null,isOpen=c.state!=='pass';
      const item={id:c.id,label:c.label,state:c.state,detail:c.detail,level:c.level||'core',firstDetected:prev?.firstDetected||(isOpen?now:null),latestChecked:now,lastBuild:UPPER_COMMAND_BUILD,provenance:verificationProvenance(c),lifecycle:isOpen?'open':(prev&&prev.state&&prev.state!=='pass'?'verified-fix':'clear')};
      if(!isOpen&&prev&&prev.state!=='pass'){item.clearedAt=now;item.clearedFrom=prev.state;cleared.push(item);prior.history.unshift({...item,event:'cleared'});}
      if(isOpen&&!prev)prior.history.unshift({...item,event:'detected'});
      if(isOpen&&prev&&prev.state!==c.state)prior.history.unshift({...item,event:'state-change',from:prev.state,to:c.state});
      findings[c.id]=item;
    });
    const truth={schema:'dark-sky-readiness-truth-v2',build:report.build,runId:report.runId,updatedAt:now,findings,history:prior.history||[]};report.readinessTruth=truth;report.recentlyCleared=cleared;report.findingHistoryStorage=writeReadinessTruthKeelGuard(truth);return truth;
  }
  function findingAction(id){
    if(['ike-style-b-truth','ike-style-foundry','ike-glyphforge','known-calibration-replay'].includes(id))return ['foundry','OPEN FOUNDRY'];
    if(['storage-growth','storage-attribution-gap','storage-telemetry','witness-truth-local','storage-safe-proof-bus'].includes(id))return ['storage','INSPECT STORAGE'];
    if(['fleet-doctrine-registry','command-layer-placement','professional-first-command'].includes(id))return ['standards','VIEW DOCTRINE'];
    return ['evidence','VIEW EVIDENCE'];
  }
  function recordCaptainOutcome(kind,label,detail=''){
    const rows=readJsonLocal(CAPTAIN_OUTCOME_KEY,[]);rows.unshift({at:new Date().toISOString(),kind,label,detail,build:UPPER_COMMAND_BUILD});writeJsonLocal(CAPTAIN_OUTCOME_KEY,rows.slice(0,25));
  }
  // WatchBeacon: renderer state is diagnostic only; never a new readiness run,
  // stored authority, cleared finding, or business-record mutation.
  let admiralFindingsDisplay=null;
  function showAdmiralFindingsError(report,error,mode='current'){
    const host=byId('admiralReadinessFindings');
    admiralFindingsDisplay={state:'error',mode,runId:report?.runId||null,runAt:report?.at||null,
      renderedIds:[],errorName:String(error?.name||'Error'),message:String(error?.message||error).slice(0,400)};
    if(!host)return false;
    // This fallback deliberately does not depend on an HTML-formatting helper.
    host.replaceChildren();host.dataset.displayState='error';host.setAttribute('aria-busy','false');
    const panel=document.createElement('section');panel.className='watchbeacon-render-error';panel.setAttribute('role','alert');
    const title=document.createElement('b');title.textContent='FINDINGS DISPLAY UNAVAILABLE';panel.appendChild(title);
    const copy=document.createElement('p');copy.textContent='The findings could not be displayed. This does not clear a hold or warning. The last report is retained when available; no new check has been run and no records have been deleted.';panel.appendChild(copy);
    const detail=document.createElement('p');detail.textContent=admiralFindingsDisplay.errorName+': '+admiralFindingsDisplay.message;panel.appendChild(detail);
    for(const [action,label] of [['retry-display','RETRY DISPLAY'],['export-report','DOWNLOAD LAST REPORT']]){
      const button=document.createElement('button');button.type='button';button.dataset.readinessAction=action;button.textContent=label;panel.appendChild(button);
    }
    host.appendChild(panel);
    return false;
  }
  function renderAdmiralFindings(report,mode='current'){
    const findings=byId('admiralReadinessFindings');if(!findings)return false;
    mode=mode==='history'?'history':'current';
    findings.setAttribute('aria-busy','true');
    try{
      const esc=captainSafe; // Shared module scope, not refreshCinematicHelm's local helper.
      const truth=report?.readinessTruth||readReadinessTruthKeelGuard();
      if(mode==='history'){
        if(!Array.isArray(truth.history))throw new Error('Retained finding history has an invalid shape.');
        const history=truth.history.filter(x=>x.event==='cleared');
        findings.innerHTML=history.length?history.map(c=>`<article class="admiral-finding cleared"><b>CLEARED · ${esc(c.label)}</b><span>${esc(c.detail||'Previously failed; latest applicable verification passed.')}</span><small>VERIFIED FIX ${esc(c.clearedAt?new Date(c.clearedAt).toLocaleString():'RETAINED')} • ${esc(c.provenance||'VERIFIED EVIDENCE')}</small><em>HISTORY • NOT CURRENT POSTURE</em></article>`).join(''):'<span class="clear">No cleared finding history retained yet. Current warnings are not cleared by opening this tab.</span>';
        admiralFindingsDisplay={state:'rendered',mode,runId:report?.runId||null,runAt:report?.at||null,renderedIds:history.map(c=>c.id)};
      }else if(!report){
        findings.textContent='No current readiness report is available. Run Fleet Readiness when you need a new assessment.';
        admiralFindingsDisplay={state:'not-run',mode,runId:null,runAt:null,renderedIds:[]};
      }else{
        const checks=report.checks;
        if(!Array.isArray(checks)||!checks.length||!report.runId||!report.at||!report.build)throw new Error('A complete identified readiness run is required.');
        if(checks.some(c=>!c||typeof c.id!=='string'||!c.id||!['pass','warn','fail'].includes(c.state))||new Set(checks.map(c=>c.id)).size!==checks.length)throw new Error('Readiness check identities or states are invalid.');
        const current=checks.filter(c=>c.state!=='pass').sort((a,b)=>(a.state==='fail'?0:1)-(b.state==='fail'?0:1));
        const holdCount=checks.filter(c=>c.state==='fail').length,watchCount=checks.filter(c=>c.state==='warn').length;
        if(holdCount!==report.criticalFailures||watchCount!==report.warnings||report.pass!==(holdCount===0))throw new Error('Readiness summary and check counts disagree.');
        if(truth.runId!==report.runId||truth.updatedAt!==report.at||truth.build!==report.build||!truth.findings)throw new Error('Finding details and summary belong to different runs.');
        for(const c of checks){const meta=truth.findings[c.id];if(!meta||meta.id!==c.id||meta.state!==c.state||meta.label!==c.label||meta.detail!==c.detail)throw new Error('Finding detail does not match its report: '+c.id);}
        const storage=report.storageEvidence;
        const boundary=`<section class="keelguard-readiness-boundary" role="status"><small>VOYAGEKEEPER · RUN ${esc(report.runId)}</small><b>${holdCount?'REPAIR HOLDS FIRST':watchCount?'CHECKS COMPLETE · WATCH ITEMS REMAIN':'CHECKS COMPLETE'}</b><p>${checks.length} checks · ${holdCount} holds · ${watchCount} watch items. Assessed ${esc(new Date(report.at).toLocaleString())} · Build ${esc(report.build)}.</p><p>Runtime checks and declared contracts; not verified working-ship commissioning or Captain handoff.</p><p><strong>Working-ship handoff: NOT VERIFIED by this report.</strong> Commissioning, appointed-Captain access, restore and cross-device proof remain separate.</p>${storage?.local==='degraded'?'<p class="keelguard-storage-warning"><strong>Legacy browser storage is degraded.</strong> Diagnostic fallback is not a durable ledger or cloud backup. No records were deleted; do not clear website data.</p>':''}</section>`;
        findings.innerHTML=boundary+(current.length?current.map(c=>{const meta=truth.findings[c.id],a=findingAction(c.id);return `<article class="admiral-finding ${c.state==='fail'?'fail':'warn'}" data-finding-id="${esc(c.id)}"><b>${c.state==='warn'?'WATCH':'CURRENT FAILURE'} · ${esc(c.label)}</b><span>${esc(c.detail)}</span><small>FIRST DETECTED ${esc(meta.firstDetected?new Date(meta.firstDetected).toLocaleString():'THIS CHECK')}<br>LATEST CHECK ${esc(report.build)} • ${esc(meta.provenance||verificationProvenance(c))}</small><em>${c.level==='core'?'FLEET CONTRACT':'CHECK'} • ${c.state==='warn'?'WATCH':'OPEN'}</em><button type="button" data-readiness-action="${a[0]}" data-readiness-finding="${esc(c.id)}">${a[1]}</button></article>`;}).join(''):'<span class="clear">No current holds or watch items in this run. Production handoff is separately unverified.</span>');
        const ids=Array.from(findings.querySelectorAll('[data-finding-id]'),node=>node.dataset.findingId);
        if(ids.length!==current.length||ids.some((id,i)=>id!==current[i].id))throw new Error('Rendered finding cards do not match the current report.');
        admiralFindingsDisplay={state:'rendered',mode,runId:report.runId,runAt:report.at,holdCount,watchCount,renderedIds:ids};
      }
      findings.dataset.displayState=admiralFindingsDisplay.state;findings.dataset.runId=admiralFindingsDisplay.runId||'';findings.setAttribute('aria-busy','false');
      return true;
    }catch(error){return showAdmiralFindingsError(report,error,mode);}
  }

  function readinessSummaryOnly8658(report){
    if(!report||window.__lastAdmiralReadinessReport)return false;
    if(!byId('admiralDeck')?.classList.contains('hidden')&&byId('admiralDeck'))return syncAdmiralReadiness(report);
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
    const findings=byId('admiralReadinessFindings');
    const tabs=byId('admiralFindingTabs');if(tabs){tabs.dataset.mode='current';tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.findingView==='current')));}
    // Carry a completed Captain proof across the authenticated Admiral gate.
    // A view transition must not discard verified findings or imply that a new
    // check is running. Background proof remains an acceptable fallback only
    // when no deliberate readiness report exists in this document.
    const report=window.__lastAdmiralReadinessReport||window.__lastAdmiralBackgroundReadinessReport||null;
    if(report){
      syncAdmiralReadiness(report);
    }else{
      if(findings)findings.innerHTML='<span>No current readiness report. Run Fleet Readiness to populate verified findings.</span>';
      for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el){el.textContent='NOT RUN';el.dataset.state='not-run';}}
      for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent='No Fleet Readiness verification is currently running. Run the check when a fresh diagnosis is required.';}
      const notice=byId('admiralDeckNotice');if(notice)notice.textContent='Admiral command ready. Run Fleet Readiness when a verified current report is required.';
    }
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
    window.__lastAdmiralReadinessReport=report;
    let preparationError=null;
    try{reconcileReadinessTruth(report);}catch(error){preparationError=error;}
    const checks=Array.isArray(report.checks)?report.checks:[];
    if(!checks.length||checks.some(c=>!c||typeof c!=='object'))preparationError=preparationError||new Error('Readiness data is incomplete or malformed.');
    const validChecks=checks.filter(c=>c&&typeof c==='object');
    const current=validChecks.filter(c=>c.state!=='pass');
    const holds=current.filter(c=>c.state==='fail').length,watches=current.filter(c=>c.state==='warn').length;
    const label=preparationError?'UNAVAILABLE':holds?'HOLD':watches?'WATCH':'CLEAR';
    const copy=preparationError?'The report cannot be displayed reliably; see the findings error below.':holds?`${holds} current critical hold${holds===1?'':'s'} remain.`:watches?`${watches} current watch item${watches===1?'':'s'} remain; no critical holds.`:'Current fleet posture is clear.';
    for(const id of ['admiralDeckReadinessState','admiralCeremonialReadinessState']){const el=byId(id);if(el){el.textContent=label;el.dataset.state=label.toLowerCase();}}
    for(const id of ['admiralDeckReadinessCopy','admiralCeremonialReadinessCopy']){const el=byId(id);if(el)el.textContent=copy;}
    const domains=byId('admiralCeremonialDomains');if(domains)domains.innerHTML=validChecks.slice(0,8).map(c=>`<span data-state="${captainSafe(c.state)}"><i>${c.state==='pass'?'✓':c.state==='warn'?'!':'×'}</i><b>${captainSafe(c.label)}</b><em>${c.state==='pass'?'CLEAR':c.state==='warn'?'WATCH':'HOLD'}</em></span>`).join('')||'<span>No readiness domains returned.</span>';
    const displayOk=preparationError?showAdmiralFindingsError(report,preparationError):renderAdmiralFindings(report,'current');
    const tabs=byId('admiralFindingTabs');if(tabs){tabs.dataset.mode='current';tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.findingView==='current')));}
    const notice=byId('admiralDeckNotice');if(notice)notice.textContent=holds?`Verified Command: ${holds} current hold${holds===1?'':'s'} remain. Cleared history is retained separately.`:watches?`Verified Command: no critical holds; ${watches} current watch item${watches===1?'':'s'} remain.`:'Verified Command: current fleet posture clear. Historical findings remain retained.';
    if(!displayOk&&notice)notice.textContent='Findings display unavailable. The readiness result is retained; use Retry Display or download the last report. No findings have been cleared.';
    return displayOk;
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
    const notice=byId('admiralDeckNotice')||byId('admiralCeremonialNotice');
    if(!report){if(notice)notice.textContent='Run Fleet Readiness first.';return;}
    let url=null;
    try{
      if(!window.DarkSkyKeelGuard)throw new Error('KeelGuard export verifier unavailable; reload the complete release.');
      const snapshot=window.DarkSkyKeelGuard.exportSnapshot(report);
      snapshot.findingsDisplay=admiralFindingsDisplay?{...admiralFindingsDisplay,renderedIds:[...admiralFindingsDisplay.renderedIds],sameRun:admiralFindingsDisplay.runId===report.runId}:null;
      const filename=window.DarkSkyKeelGuard.reportFilename();
      const blob=new Blob([JSON.stringify({schema:'dark-sky-fleet-readiness-v1',...snapshot},null,2)],{type:'application/json'});
      url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
      if(notice)notice.textContent=`Readiness report prepared: ${filename}. Use Safari Download/Files to save it. This exports one run; it does not clear holds, change authority, or verify cloud backup.`;
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(err){if(url)URL.revokeObjectURL(url);if(notice)notice.textContent=`Report not exported: ${String(err?.message||err)}`;}
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

  // HarborMaster: account reuse is a visible, reverified state, never a PIN grant.
  let admiralGateAttempt = 0, admiralPassageVerified = false, airlockAccount;
  function setAdmiralEntranceStep(gate,step){
    if(!gate)return;
    if (step === 'pin') airlockAccount?.reset();
    const account=step==='account',s=window.DarkSkyAdmiralSession?.status(),resume=!account&&s?.reusable;
    gate.dataset.authStep=account?'account':'pin';
    gate.dataset.sessionIntent=resume?'resume':'new';
    const text=(id,value)=>{const n=byId(id);if(n&&n.textContent!==value)n.textContent=value;};
    const reasons={idle:'The workspace locked after inactivity.', 'maximum-age':'The one-hour workspace limit was reached. Admiral rank is retained; start a new secure session.', 'clock-changed':'The device clock changed; reverify the secure Admiral workspace.', 'authority-denied':'The server no longer verified active Admiral authority.', 'account-changed':'The account identity changed; reverify the Admiral office.', 'verification-unavailable':'Server verification could not be completed. Admiral rank was not inferred from browser state.', 'signed-out':'The secure Admiral workspace ended in this page. Rank is retained unless server authority is explicitly revoked.', cancelled:'The previous secure-session sign-in was cancelled.'};
    text('admiralEntranceStep',account?'STEP 2 OF 2 · ACCOUNT VERIFICATION':resume?'WELCOME BACK · VERIFY YOUR ACCESS':'STEP 1 OF 2 · PASSAGE PIN');
    text('admiralGateTitle',account?'One more step.':resume?'Welcome back.':'Welcome aboard.');
    text('admiralGateDescription',account?'Your PIN is verified. Sign in with your Admiral account to open the workspace.':resume?'Your Admiral role is retained. Verify your PIN to recheck your account access; another password may not be needed.':'Your Admiral Office brings the fleet together. Verify your PIN and account to begin.');
    text('admiralEntranceFormTitle',account?'Sign in as Admiral':resume?'Verify your PIN to return':'Enter your passage PIN');
    text('admiralEntranceFormHint',account?'':resume?'We will recheck your account before reopening the workspace.':'First your PIN. Then your Admiral account.');
    text('admiralEntrancePinState',account?'Verified':'Required');
    text('admiralEntranceAccountState',account?'Required':resume?'Recheck pending':'Next');
    text('admiralUnlockBtn',resume?'Verify PIN & return →':'Continue with PIN →');
    text('admiralSessionReuseNote',(reasons[s?.reason]?reasons[s.reason]+' ':'')+'ScheduleJoe locks after 30 minutes without activity. Other Admiral workspaces lock after 15 minutes. Sign in again after one hour.');
    text('admiralVisualStatus',resume?'Account verification required to resume.':'Your fleet stays private until access is verified.');
    const pin=byId('admiralEntrancePinStep'),identity=byId('admiralEntranceAccountStep');
    pin?.classList.toggle('is-complete',account);
    if(account){pin?.removeAttribute('aria-current');identity?.setAttribute('aria-current','step');}
    else{pin?.setAttribute('aria-current','step');identity?.removeAttribute('aria-current');}
    gate.scrollTop=0;
    if (!account && !gate.classList.contains('hidden') && !gate.contains(document.activeElement)) {
      byId('admiralPinInput')?.focus({preventScroll:true});
    }
  }

  function refreshAdmiralSessionStrip(){
    const s=window.DarkSkyAdmiralSession?.status();
    const fmt=ms=>`${Math.max(0,Math.ceil(ms/60000))} min`;
    const time=ms=>ms?new Date(ms).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}):'not verified';
    const set=(id,value)=>{const n=byId(id);if(n&&n.textContent!==value)n.textContent=value;};
    set('admiralSessionReceipt',s?.receipt||'Commissioned Admiral office · secure session required.');
    set('admiralSessionTiming',s?.reusable?`Full sign-in ${time(s.startedAt)} · Authority checked ${time(s.checkedAt)} · Idle lock in ${fmt(s.idleRemainingMs)} · Maximum window ${fmt(s.maximumRemainingMs)} remaining`:'No reusable Admiral workspace session.');
    const strip=byId('admiralSessionStrip');if(strip)strip.dataset.state=s?.reusable?'active':'locked';
    const gate=byId('admiralGateOverlay');
    // Never steal focus or recreate the form when the status timer ticks.
    if(gate&&!gate.classList.contains('hidden')&&gate.dataset.authStep==='pin'){
      if(!s?.available&&s?.receipt&&byId('admiralPinError'))byId('admiralPinError').textContent=s.receipt;
      const mode=s?.reusable?'resume':'new';
      if(mode!==gate.dataset.sessionIntent)setAdmiralEntranceStep(gate,'pin');
    }
  }
  function lockAdmiralWorkspace(reason='locked'){
    const visible=id=>{const n=byId(id);return n&&!n.classList.contains('hidden')&&n.getAttribute('aria-hidden')!=='true';};
    const admiralLedger=visible('authorityLedger')&&byId('authorityLedgerOfficeLabel')?.textContent?.trim()==='ADMIRAL';
    const active=visible('admiralDeck')||visible('bootstrapFleet')||visible('foundryWorkspace')||admiralLedger;
    const fleet=visible('bootstrapFleet');
    if(!active)return;
    for(const id of ['admiralDeck','bootstrapFleet','watchOverview','foundryWorkspace']){hide(id);byId(id)?.setAttribute('aria-hidden','true');}
    if(admiralLedger){hide('authorityLedger');byId('authorityLedger')?.setAttribute('aria-hidden','true');document.body.classList.remove('authority-ledger-open');}
    document.body.classList.remove('bootstrap-fleet-open');
    document.querySelectorAll('.admiral-authority-verified,.identity-verified').forEach(n=>{if(n.closest('#admiralDeck'))n.classList.remove('admiral-authority-verified','identity-verified');});
    for(const id of ['admiralAirlockPassword','admiralPinInput','watchPassword','admiralIdentityPassword','admiralCommissioningPassword','admiralBrandPassword'])if(byId(id))byId(id).value='';
    openAdmiralGate('captain',fleet?'fleet':'findings');
    const message=reason==='locked'?'Secure Admiral workspace locked. Rank retained. A recent account session may be reused only after PIN and server recheck.':reason==='verification-unavailable'?'Server verification could not complete. Rank is not inferred locally; re-authenticate before continuing.':'Secure Admiral session ended here. Rank retained; sign in again before continuing.';
    if(byId('admiralPinError'))byId('admiralPinError').textContent=message;
  }
  window.addEventListener('darksky:admiral-session-changed',refreshAdmiralSessionStrip);
  window.addEventListener('darksky:admiral-session-ended',()=>{
    const reason=window.DarkSkyAdmiralSession?.status().reason;
    if(reason!=='signing-in')lockAdmiralWorkspace(reason);
    refreshAdmiralSessionStrip();
  });
  window.addEventListener('darksky:admiral-session-unavailable',()=>{lockAdmiralWorkspace('verification-unavailable');refreshAdmiralSessionStrip();});

  function installAdmiralEntranceViewport(gate){
    if(!gate||gate.dataset.viewportBound==='1')return;
    gate.dataset.viewportBound='1';
    let queued=0;
    const update=()=>{
      queued=0;
      if(gate.classList.contains('hidden')){
        gate.style.removeProperty('--admiral-visible-height');
        gate.style.removeProperty('--admiral-visible-top');
        gate.removeAttribute('data-input-active');
        // Credentials are not a resumable draft or a diagnostic record.
        const pin=byId('admiralPinInput'),password=byId('admiralAirlockPassword');
        if(pin)pin.value='';if(password)password.value='';
        return;
      }
      const viewport=window.visualViewport;
      // Let browser pinch zoom pan normally instead of resizing the form to a
      // magnified viewport. Never disable zoom or scale the credential controls.
      if(viewport&&Math.abs(Number(viewport.scale||1)-1)<0.03&&Number(viewport.height)>0){
        gate.style.setProperty('--admiral-visible-height',Math.round(viewport.height)+'px');
        gate.style.setProperty('--admiral-visible-top',Math.max(0,Math.round(viewport.offsetTop||0))+'px');
      }else{
        gate.style.removeProperty('--admiral-visible-height');
        gate.style.removeProperty('--admiral-visible-top');
      }
      const active=document.activeElement;
      gate.dataset.inputActive=String(!!active&&gate.contains(active)&&active.matches('input,textarea'));
    };
    const schedule=()=>{if(!queued)queued=requestAnimationFrame(update);};
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    gate.addEventListener('focusin',schedule);
    gate.addEventListener('focusout',schedule);
    new MutationObserver(()=>{if(gate.classList.contains('hidden'))update();else schedule();}).observe(gate,{attributes:true,attributeFilter:['class']});
    schedule();
  }

  function mountRegatta(deck, launch) {
    const status = deck.querySelector('#regattaStatus');
    const dialog = document.createElement('dialog');
    dialog.id = 'regattaPlayer';
    dialog.setAttribute('aria-label', 'Black Flag Regatta');
    dialog.innerHTML = '<header><button type="button" autofocus>← Admiral deck</button><span>Sunset Harbor</span></header>';
    deck.appendChild(dialog);
    let visit = null;
    let frame = null;

    function current(entry) {
      if (!entry || entry !== visit || deck.classList.contains('hidden') || deck.inert ||
          deck.getAttribute('aria-hidden') === 'true' || !deck.isConnected) return false;
      const session = window.DarkSkyAdmiralSession?.status();
      return session?.reusable && session.startedAt === entry.startedAt &&
        entry.client.readSession()?.user?.id === entry.userId;
    }

    function leave() {
      const old = visit;
      visit = null;
      old?.request.abort();
      frame?.remove();
      frame = null;
      if (dialog.open) dialog.close();
      if (old && !launch.disabled && launch.getClientRects().length) launch.focus({preventScroll:true});
    }

    function lock() {
      launch.disabled = true;
      leave();
      status.textContent = 'Re-enter the Admiral deck to open the race.';
    }

    // The player can store only boat preferences, three best times and twelve race results.
    function raceState(input) {
      const boatId = n => Number.isInteger(n) && n >= 0 && n < 3;
      const time = n => Number.isFinite(n) && n > 0 && n <= 86400;
      const count = n => Number.isInteger(n) && n >= 0 && n <= 1000 ? n : 0;
      const best = {};
      for (let id = 0; id < 3; id++) {
        if (time(input?.best?.[id])) best[id] = input.best[id];
      }
      const history = [];
      if (Array.isArray(input?.history)) {
        for (const row of input.history.slice(0,12)) {
          if (boatId(row?.id) && time(row.time) && [1,2,3].includes(row.rank)) {
            history.push({id:row.id, time:row.time, rank:row.rank, currents:count(row.currents), hits:count(row.hits)});
          }
        }
      }
      return {boat:boatId(input?.boat) ? input.boat : 0, sound:input?.sound === true, best, history};
    }

    window.addEventListener('message', event => {
      if (!frame || event.source !== frame.contentWindow || event.origin !== 'null' || !dialog.open) return;
      const entry = visit;
      if (!current(entry)) { lock(); return; }
      const key = 'blackFlagRegatta:v1:' + entry.userId;
      switch (event.data?.type) {
        case 'regatta:ready': {
          let data;
          try { data = JSON.parse(localStorage.getItem(key)); } catch (_) {}
          frame.contentWindow.postMessage({type:'regatta:enter', state:raceState(data)}, '*');
          break;
        }
        case 'regatta:save':
          try { localStorage.setItem(key, JSON.stringify(raceState(event.data.state))); } catch (_) {
            status.textContent = 'This browser could not save your race log.';
          }
          break;
        case 'regatta:activity':
          if (document.visibilityState === 'visible') window.DarkSkyAdmiralSession.noteProgramActivity(entry);
          break;
      }
    });

    launch.addEventListener('click', async () => {
      if (visit || launch.disabled) return;
      let entry;
      try {
        const config = window.BlackFlagV3Identity.productionAuth.readClientConfig();
        const client = window.DarkSkySupabase.create({...config, sessionKey:'darkSkySupabaseAdmiralSessionV1',
          build:window.__darkSkyVerifiedRelease.build});
        const session = window.DarkSkyAdmiralSession.status();
        const userId = client.readSession()?.user?.id;
        if (!session.reusable || !userId) { lock(); openAdmiralGate(deck.dataset.entrySource, 'regatta'); return; }
        entry = {client, userId, startedAt:session.startedAt, request:new AbortController()};
        visit = entry;
        status.textContent = 'Opening Sunset Harbor…';
        if (!await window.DarkSkyAdmiralIdentityStatus() || !current(entry)) throw Error();
        const timer = setTimeout(() => entry.request.abort(), 30000);
        let bytes;
        try {
          const response = await fetch('./regatta-player.json', {signal:entry.request.signal, cache:'no-cache',
            credentials:'omit', referrerPolicy:'no-referrer', redirect:'error'});
          if (!response.ok) throw Error();
          bytes = await response.arrayBuffer();
        } finally { clearTimeout(timer); }
        const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
          byte => byte.toString(16).padStart(2,'0')).join('');
        if (digest !== '6df6b5b1694d4aa9a0eaecf0b778f0de942e178ca8b2db648e5a9fcf6c71bc05') throw Error();
        const player = JSON.parse(new TextDecoder().decode(bytes));
        if (!current(entry) || !launch.getClientRects().length) throw Error();
        frame = document.createElement('iframe');
        frame.title = 'Sunset Harbor race';
        frame.setAttribute('sandbox','allow-scripts');
        frame.referrerPolicy = 'no-referrer';
        frame.srcdoc = player.document;
        dialog.appendChild(frame);
        dialog.showModal();
        status.textContent = '';
      } catch (_) {
        if (!entry || visit === entry) {
          leave();
          status.textContent = 'Sunset Harbor could not open. Check your connection and try again.';
        }
      }
    });
    dialog.querySelector('button').addEventListener('click', leave);
    dialog.addEventListener('cancel', event => { event.preventDefault(); leave(); });
    window.addEventListener('pagehide', lock);
    for (const name of ['ended','unavailable']) window.addEventListener('darksky:admiral-session-' + name, lock);
    window.addEventListener('darksky:admiral-session-changed', () => { if (visit && !current(visit)) lock(); });
    new MutationObserver(() => { if (visit && !current(visit)) lock(); })
      .observe(deck, {attributes:true, attributeFilter:['class','hidden','inert','aria-hidden']});
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
    gate.dataset.entrance='clearpassage';
    gate.dataset.authStep='pin';
    gate.setAttribute('aria-describedby','admiralGateDescription');
    gate.innerHTML=`
      <div class="admiral-gate-shell">
        <div class="admiral-gate-scene" aria-hidden="true"><div class="admiral-door left"></div><div class="admiral-door right"></div><div class="admiral-seal">⚓</div></div>
        <section class="admiral-gate-card">
          <header class="admiral-entrance-intro">
            <div class="admiral-entrance-brand"><img src="black_flag_platform_icon.png" alt="" width="64" height="64"><div><small>BLACK FLAG</small><span>Admiral Office</span></div></div>
            <small id="admiralEntranceStep">STEP 1 OF 2 · PASSAGE PIN</small>
            <h2 id="admiralGateTitle" tabindex="-1">Admiral passage</h2>
            <p id="admiralGateDescription">Verify your passage PIN, then authenticate your Admiral account. Both checks protect this workspace.</p>
            <ol class="admiral-entrance-progress" aria-label="Admiral access progress">
              <li id="admiralEntrancePinStep" aria-current="step"><span aria-hidden="true">01</span><div><b>Passage PIN</b><small id="admiralEntrancePinState">Required</small></div></li>
              <li id="admiralEntranceAccountStep"><span aria-hidden="true">02</span><div><b>Admiral account</b><small id="admiralEntranceAccountState">Next</small></div></li>
            </ol>
            <p class="admiral-entrance-boundary" id="admiralVisualStatus">Workspace locked until account authority is verified.</p><details class="admiral-session-help"><summary>Workspace time limits</summary><p id="admiralSessionReuseNote" class="admiral-reuse-note"></p></details>
          </header>
          <div class="admiral-entrance-form">
            <div class="admiral-entrance-form-head"><b id="admiralEntranceFormTitle">Verify your passage PIN</b><span id="admiralEntranceFormHint">This opens the account sign-in, not fleet authority.</span></div>
            <label for="admiralPinInput">Passage PIN</label>
            <input data-bf-trim="preserve" id="admiralPinInput" type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-describedby="admiralPinError" />
            <p id="admiralPinError" class="captain-error" aria-live="polite"></p>
            <button id="admiralUnlockBtn" type="button" class="admiral-primary">VERIFY PASSAGE PIN →</button>
            <section id="admiralAccountAirlock" class="admiral-account-airlock hidden" aria-label="Admiral account security layer">
              <form id="admiralSignInForm" autocomplete="off" novalidate>${AdmiralAccountForm.fields('admiralAirlock')}</form>
              <p id="admiralAirlockStatus" class="captain-error" role="status" aria-live="polite">Fleet and governance controls remain locked.</p>
            </section>
            <button id="admiralGateReturnBtn" type="button" class="admiral-secondary">← RETURN TO CAPTAIN'S QUARTERS</button>
          </div>
        </section>
      </div>`;
    document.body.appendChild(gate);
    installAdmiralEntranceViewport(gate);

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
          <div class="admiral-ascent-copy"><small>CAPTAIN + ADMIRAL</small><strong>ADMIRAL'S DECK</strong><span>Fleet Governance • Explicit Office</span></div>
        </div>
        <header class="admiral-deck-head">
          <div><small>PROFESSIONAL COMMAND • FLEET GOVERNANCE • ${UPPER_COMMAND_BUILD}</small><h2 id="admiralDeckTitle">Admiral Command Deck</h2><p>See the fleet clearly, set the course once, and preserve each vessel's independence.</p></div>
          <div class="admiral-deck-head-actions"><span>COMMISSIONED ADMIRAL</span><button id="admiralDeckModeBtn" type="button" aria-pressed="false">PROFESSIONAL MODE</button><a id="admiralDeckReturnBtn" class="admiral-command-return" href="./index.html?surface=engine" role="button">← ENGINE ROOM</a></div>
        </header>
        <section id="admiralSessionStrip" class="admiral-session-strip" aria-label="Admiral session window">
          <div><b id="admiralSessionReceipt" role="status">Commissioned Admiral office · secure session required.</b><span id="admiralSessionTiming"></span><small>Secure session limits · rank retained · server-wide expiry not verified.</small></div>
          <div class="admiral-session-actions"><button id="admiralSessionLock" type="button">LOCK ADMIRAL</button><button id="admiralSessionEnd" type="button">END SESSION</button></div>
        </section>
        <main class="admiral-command-surface" aria-label="Admiral cinematic command view">
          <nav class="admiral-command-rail" aria-label="Admiral governance controls">
            <div class="admiral-command-rail-title"><small>ADMIRAL COMMAND</small><strong>Govern the platform</strong><span>DUAL OFFICE • SERVER-GATED</span></div>
            <button id="admiralCeremonialForge" type="button"><b>Visual Forge</b><small>Shape upper command</small><em>READY</em></button>
            <button type="button" id="admiralCeremonialDelegation"><b>Delegation</b><small>Open exact-vessel appointments</small><em>OPEN</em></button>
            <button type="button" data-admiral-future="Fleet Standards"><b>Fleet Standards</b><small>Set fleet-wide rules</small><em>FUTURE</em></button>
            <button id="admiralCeremonialFoundry" type="button"><b>The Foundry</b><small>Forge fleet capabilities</small><em>FOUNDATION</em></button>
          </nav>
          <section class="admiral-command-center" aria-label="Admiral command state">
            <div class="admiral-command-center-badge"><small>COMMISSIONED ADMIRAL OFFICE</small><strong>Admiral + Captain</strong><span>Rank retained · secure session verified separately</span></div>
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
          <section class="admiral-command-map" aria-label="Admiral command boundary"><article><small>OBSERVE</small><strong>Read across the fleet</strong><span>Authenticated and read-only by default</span></article><article><small>COMMAND</small><strong>One exact vessel</strong><span>Previewed, reasoned and authorized</span></article><article><small>RETAIN</small><strong>Durable evidence</strong><span>Audit, rollback and fleet learning</span></article></section>
          <nav class="admiral-lane-nav" id="admiralLaneNav" aria-label="Admiral command lanes" role="tablist">
            <button type="button" role="tab" data-admiral-lane="govern" aria-selected="true"><small>01</small><b>GOVERN</b><span>Posture & readiness</span></button>
            <button type="button" role="tab" data-admiral-lane="standardize" aria-selected="false"><small>02</small><b>STANDARDIZE</b><span>Doctrine & standards</span></button>
            <button type="button" role="tab" data-admiral-lane="delegate" aria-selected="false"><small>03</small><b>DELEGATE</b><span>Bounded authority</span></button>
            <button type="button" role="tab" data-admiral-lane="promote" aria-selected="false"><small>04</small><b>PROMOTE</b><span>Fleet learning</span></button>
          </nav>
          <section class="admiral-lane-workspace" aria-live="polite">
            <article id="admiralGovernLane" data-admiral-panel="govern"><small>01 · GOVERN</small><h4>Fleet posture & readiness</h4><p>Current verified posture first. Cleared incidents remain retained history.</p><div class="admiral-lane-summary"><b>Dual-Office Authority Ledger</b><span>Navigate retained Captain evidence and server-attested Admiral orders without blending the two offices.</span></div><button id="admiralAuthorityLedgerOpen" class="admiral-pro-button" type="button">OPEN AUTHORITY LEDGER</button><div id="admiralFindingTabs" class="admiral-finding-tabs" data-mode="current"><button type="button" data-finding-view="current" aria-pressed="true">CURRENT FINDINGS</button><button type="button" data-finding-view="history" aria-pressed="false">CLEARED HISTORY</button></div><div id="admiralReadinessFindings" class="admiral-readiness-findings"><span>Run Fleet Readiness to populate verified findings.</span></div></article>
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
</section><div class="admiral-lane-summary admiral-service-governance"><b>Admiral Course Orders</b><span>Set one feature, a service group, or an entire vessel to Off, Free, or Paid. Every change requires an explicit Admiral preview and order.</span></div><button id="admiralServiceEntitlements" class="admiral-pro-button" type="button">OPEN COURSE ORDERS</button><section id="admiralEntitlementStation" class="admiral-entitlement-station admiral-course-station hidden" aria-label="Admiral Course Orders"><header><div><small>SERVER-GOVERNED ADMIRAL CONTROL</small><h5>Course Orders</h5><p>Choose the scope, preview the impact, then issue one deliberate and reversible command.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralEntitlementClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer">The Admiral Gate opens this deck. Account sign-in separately authorizes server-governed changes. Readiness, testing, refresh and launch never choose Off, Free or Paid.</p><div class="admiral-identity-row"><label>Admiral email<input data-bf-trim="boundary" id="admiralIdentityEmail" name="username" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input data-bf-trim="preserve" id="admiralIdentityPassword" name="password" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralIdentitySignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralIdentityRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralIdentitySignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-course-grid"><section class="admiral-course-brief"><small>FLEET BRIEF</small><strong id="admiralCourseBrief">Sign in to inspect the selected vessel.</strong><span>Reading fleet state does not change it.</span></section><section class="admiral-course-compose"><div class="admiral-course-step"><small>1 · VESSEL</small><label>Command destination<select id="admiralEntitlementVessel"><option value="ikes-wood-signs">Ike's Wood Signs</option><option value="beccas-bloom-shop">Becca's Bloom Shop</option><option value="bf-p-f92f87e8ec44">Legacy Plumbing</option><option value="bor-north-richmond">Signal Restoration</option><option value="grizzly-bear">Grizzly Bear</option><option value="mugshot-after-dark">Mugs After Dark</option></select></label></div><div class="admiral-course-step"><small>2 · SCOPE</small><div class="admiral-scope-actions" role="group" aria-label="Course order scope"><button class="admiral-pro-button is-selected" type="button" data-course-scope="vessel" aria-pressed="true">ENTIRE VESSEL</button><button class="admiral-pro-button" type="button" data-course-scope="group" aria-pressed="false">SERVICE GROUP</button><button class="admiral-pro-button" type="button" data-course-scope="feature" aria-pressed="false">ONE FEATURE</button></div><label id="admiralCourseGroupLabel" class="hidden">Service group<select id="admiralCourseGroup"><option value="operations">Operations & Commerce</option><option value="production">Production & Capacity</option><option value="intelligence">Intelligence</option></select></label><label id="admiralCourseFeatureLabel" class="hidden">Feature<select id="admiralEntitlementCapability"><option value="fleet.customer-payments">Customer Payments</option><option value="fleet.artwork-inlays">Artwork & Inlay Production</option><option value="fleet.customer-insight">Customer & Order Insight</option><option value="fleet.enhanced-ledger">Enhanced Business Ledger</option><option value="fleet.ai-recommendations">Fleet AI Recommendations</option><option value="fleet.vendor-routing">Vendor & Capacity Routing</option></select></label></div><div class="admiral-course-step"><small>3 · COMMAND</small><div class="admiral-entitlement-actions" role="group" aria-label="Commercial state"><button id="admiralTurnOff" class="admiral-pro-button" type="button" disabled>OFF<span>Unavailable</span></button><button id="admiralMakeFree" class="admiral-pro-button is-selected" type="button" disabled>FREE<span>Active at $0</span></button><button id="admiralGrantPaid" class="admiral-pro-button" type="button" disabled>PAID<span>Paid terms</span></button></div><label>Command intent<input data-bf-trim="boundary" id="admiralCourseIntent" type="text" maxlength="500" placeholder="Optional reason for the record"></label><button id="admiralPreviewCourse" class="admiral-pro-button" type="button" disabled>PREVIEW ORDER</button></div></section><section id="admiralCoursePreview" class="admiral-course-preview" aria-live="polite"><header><div><small>IMPACT PREVIEW</small><strong id="admiralEntitlementCurrent">AWAITING PREVIEW</strong><span id="admiralEntitlementCurrentDetail">No fleet state will change until the order is issued.</span></div></header><div class="admiral-impact-counts"><span><b id="admiralCourseTargetCount">0</b><small>TARGETS</small></span><span><b id="admiralCourseChangeCount">0</b><small>CHANGES</small></span><span><b id="admiralCourseUnchangedCount">0</b><small>UNCHANGED</small></span></div><div id="admiralCoursePreviewItems" class="admiral-course-preview-items"><p>Authenticate the Admiral identity, then preview an order.</p></div><button id="admiralIssueCourse" class="admiral-pro-button is-primary" type="button" disabled>ISSUE ADMIRAL ORDER</button></section></div><div id="admiralEntitlementResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to inspect and command entitlements.</div><section class="admiral-course-log"><header><div><small>DURABLE COMMAND RECORD</small><strong>Recent Admiral orders</strong></div><button id="admiralOpenFullLog" class="admiral-pro-button" type="button" disabled>OPEN FULL LOG</button></header><div id="admiralCourseLogRows" class="admiral-course-log-rows"><p>Authenticate to read the command record.</p></div></section><div class="admiral-package-note"><b>Authority boundary</b><span>Each order is scoped to one vessel. Preview fingerprints prevent stale changes; rollback refuses to overwrite a newer command.</span></div></section></article>
            <article data-admiral-panel="delegate" hidden><small>03 · DELEGATE</small><h4>Captain appointments</h4><p role="status">Delegation controls are initializing. No command has been issued.</p><button id="quarterdeckMountRetry" type="button">RETRY DELEGATION DISPLAY</button></article>
            <article data-admiral-panel="promote" hidden><small>04 · PROMOTE</small><h4>Promote fleet learning</h4><p>Foundry candidates, proven capability, shared service or new vessel.</p><div class="admiral-lane-summary"><b>Intelligence Dock + one learning pipeline</b><span>Cross-vessel patterns surface here before Observation → Lesson → Candidate → Foundry → Sea Trial → Proven.</span></div><button id="admiralDeckFoundry" type="button">OPEN THE FOUNDRY <em>FOUNDATION</em></button><div class="admiral-lane-summary admiral-service-governance"><b>Admiral Commissioning Orders</b><span>Create one durable Fleet Core vessel identity. The working name stays editable; the vessel ID, project key, and namespace do not.</span></div><button id="admiralCommissioningOpen" class="admiral-pro-button" type="button">OPEN COMMISSIONING ORDERS</button><section id="admiralCommissioningStation" class="admiral-entitlement-station admiral-course-station admiral-commissioning-station hidden" aria-label="Admiral Commissioning Orders"><header><div><small>SERVER-GOVERNED ADMIRAL SHIPYARD</small><h5>Commissioning Orders</h5><p>Name the working vessel, define its permanent keel, preview the boundary, then issue one deliberate order.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralCommissioningIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralCommissioningClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer"><b>Bootstrap Build is a working name.</b> It can be renamed later without changing the vessel UUID, project key, namespace, records, or lineage.</p><div id="admiralCommissioningAuth" class="admiral-identity-row"><label>Admiral email<input data-bf-trim="boundary" id="admiralCommissioningEmail" name="username" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input data-bf-trim="preserve" id="admiralCommissioningPassword" name="password" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralCommissioningSignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralCommissioningRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralCommissioningSignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-course-grid admiral-commissioning-grid"><section class="admiral-course-brief"><small>COMMISSIONING BRIEF</small><strong id="admiralCommissioningBrief">Authenticate to preview a new vessel.</strong><span>No vessel exists until the order is issued.</span></section><section class="admiral-course-compose"><div class="admiral-course-step"><small>1 · WORKING IDENTITY</small><label>Working name <span class="field-rule">EDITABLE AFTER COMMISSION</span><input data-bf-trim="boundary" id="admiralCommissioningName" type="text" maxlength="80" value="Bootstrap Build" placeholder="Working vessel name"></label><label>Mission summary<input data-bf-trim="boundary" id="admiralCommissioningSummary" type="text" maxlength="500" value="Construction scheduling and field coordination" placeholder="What this vessel is being built to do"></label></div><div class="admiral-course-step"><small>2 · PERMANENT KEEL</small><label>Project key <span class="field-rule">PERMANENT</span><input data-bf-trim="boundary" id="admiralCommissioningProject" type="text" maxlength="63" value="construction-scheduling-01" autocapitalize="none" spellcheck="false"></label><label>Namespace <span class="field-rule">PERMANENT</span><input data-bf-trim="boundary" id="admiralCommissioningNamespace" type="text" maxlength="63" value="construction-scheduling-01" autocapitalize="none" spellcheck="false"></label><label>Mission class<select id="admiralCommissioningClass"><option value="admiral_program">Admiral-level program</option><option value="fleet_service">Shared fleet service</option><option value="independent_business">Independent business</option></select></label></div><div class="admiral-course-step"><small>3 · BOUNDARY</small><div class="admiral-commissioning-boundary"><span><b>COMMISSIONING</b><small>NOT LIVE</small></span><span><b>UNASSIGNED</b><small>NO OWNER CREATED</small></span><span><b>NO FEATURES</b><small>COURSE ORDER LATER</small></span></div><label>Order intent<input data-bf-trim="boundary" id="admiralCommissioningIntent" type="text" maxlength="500" placeholder="Optional reason for the record"></label><button id="admiralCommissioningPreview" class="admiral-pro-button" type="button" disabled>PREVIEW COMMISSIONING ORDER</button></div></section><section class="admiral-course-preview" aria-live="polite"><header><div><small>IMPACT PREVIEW</small><strong id="admiralCommissioningPreviewState">AWAITING PREVIEW</strong><span id="admiralCommissioningPreviewDetail">No Fleet Core row will be written until the order is issued.</span></div></header><div id="admiralCommissioningPreviewItems" class="admiral-course-preview-items"><p>Authenticate the Admiral identity, then preview the permanent and editable fields.</p></div><button id="admiralCommissioningIssue" class="admiral-pro-button is-primary" type="button" disabled>ISSUE COMMISSIONING ORDER</button></section></div><div id="admiralCommissioningResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to begin.</div><section class="admiral-course-log"><header><div><small>DURABLE COMMISSIONING RECORD</small><strong>Recent vessel orders</strong></div><button id="admiralCommissioningLog" class="admiral-pro-button" type="button" disabled>OPEN FULL LOG</button></header><div id="admiralCommissioningLogRows" class="admiral-course-log-rows"><p>Authenticate to read the commissioning record.</p></div></section><div class="admiral-package-note"><b>Authority boundary</b><span>The commissioner does not become the owner. Commissioning creates no membership, no entitlement, and no live publication.</span></div></section></article>
          </section>
          <section class="admiral-continuity-card"><div><h4>CONTINUITY &amp; EVIDENCE</h4><p>Recovery, reports, governance history and presentation remain available without competing with active command.</p></div><div class="admiral-continuity-actions"><button id="admiralDeckRecovery" type="button"><b>Recovery Snapshot</b><small>Protect the fleet</small></button><button id="admiralDeckReport" type="button"><b>Readiness Report</b><small>Download evidence</small></button><button id="admiralDeckLog" type="button"><b>Admiral Log</b><small>Governance history</small></button><button id="admiralDeckForge" type="button"><b>Presentation Forge</b><small>Optional visual layer</small></button></div></section>
          <section class="admiral-deck-note" id="admiralDeckNotice" role="status" aria-live="polite">Commissioned Admiral office active. Read-only by default; modifying commands remain exact-vessel, authenticated, reasoned, and audited.</section>
        </main>
      </div>`;
    document.body.appendChild(deck);
    // FUN is a separate Admiral program, never a Fleet Core vessel or game authority grant.
    deck.querySelector('.admiral-session-strip')?.insertAdjacentHTML('afterend',`<section class="fleet-schedule-entry"><img src="bootstrap_build_icon.png" alt=""><div><b>ScheduleJoe</b><span>Bootstrap Build · Construction schedules</span></div><button type="button" data-schedulejoe-open>Open ScheduleJoe</button></section><section id="funProgramLaunchCard" aria-label="Admiral Programs"><div><small>ADMIRAL PROGRAMS · FUN · OUTSIDE FLEET CORE</small><b>Black Flag: Stormwake</b><p>Explore a 3D harbor, raise the bridge, and bring the chartmaker home. First Light and its lessons stay in the journal.</p></div><button id="funProgramLaunch" type="button">OPEN STORMWAKE →</button></section><section id="lanternRunCard" aria-label="Lantern Run arcade"><div><h3>Lantern Run</h3><p>Sail six mazes with Riptail, from Moonbeam Bay to the Homeward Light.</p></div><button id="lanternRunLaunch" type="button">PLAY LANTERN RUN →</button></section>`);
    const promoteLane=deck.querySelector('[data-admiral-panel="promote"]');
    promoteLane?.insertAdjacentHTML('afterbegin',`<section class="admiral-passage-card" aria-label="Commissioned Admiral Office"><small>ADMIRAL KEEL</small><h5>Commissioned rank. Separate secure sessions.</h5><ol><li><b>1</b><span>The Admiral office is now an accepted Fleet role, distinct from Captain.</span></li><li><b>2</b><span>Session timeout, logout, or readiness WATCH never demotes the rank.</span></li><li><b>3</b><span>Every entry still requires passage PIN plus server-verified Admiral identity.</span></li><li><b>4</b><span>Only an explicit server authority revocation can remove the commissioned role.</span></li></ol><p>Readiness warnings remain obligations to harden the fleet. They do not turn the Admiral back into a Captain.</p></section>`);
    promoteLane?.insertAdjacentHTML('afterbegin', `
      <section class="regatta-poster regatta-brief" aria-labelledby="regattaBriefTitle">
              <img class="regatta-art" src="./regatta-harbor.webp" alt="" loading="lazy" decoding="async">
              <div class="regatta-copy"><small>ADMIRAL TOOL · FLEET LEARNING</small>
                <h4 id="regattaBriefTitle">Black Flag Regatta</h4>
                <p>Try two runs with the same boat. Use your gust in a different stretch of water, then compare your times in the race log.</p>
                <button type="button" id="regattaHarborLink" disabled>Enter Sunset Harbor <span aria-hidden="true">→</span></button><p id="regattaStatus" role="status"></p>
              </div>
            </section>`);
    const regattaLink = byId('regattaHarborLink');
    mountRegatta(deck, regattaLink);
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
    const closeGate=()=>{admiralGateAttempt++;admiralPassageVerified=false;window.DarkSkyAdmiralSession?.cancelSignIn();const direct=byId('admiralGateOverlay')?.dataset.entrySource==='engine';hide('admiralGateOverlay'); byId('admiralPinInput').value=''; airlockAccount.reset(); byId('admiralPinError').textContent='';if(direct){returnToEngine();return;}if(window.DarkSkyFleetNavigator?.navigate){window.DarkSkyFleetNavigator.navigate('captain',{source:'admiral-gate'});return;}show('captainQuarters');show('captainGlobalExit');};
    const returnToCaptain=()=>{if(deck.dataset.entrySource==='engine'){returnToEngine();return;}hide('admiralDeck');if(window.DarkSkyFleetNavigator?.navigate){window.DarkSkyFleetNavigator.navigate('captain',{source:'admiral'});return;}show('captainQuarters');show('captainGlobalExit');document.body.classList.add('captain-modal-open','captain-authorized');};
    byId('admiralGateReturnBtn').onclick=closeGate;
    byId('admiralSessionLock').onclick=()=>lockAdmiralWorkspace('locked');
    byId('admiralSessionEnd').onclick=async()=>{await window.DarkSkySignOutAdmiral?.();};
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
    const openVerifiedAdmiralDeck=directTarget=>{
      hide('admiralGateOverlay');hide('captainQuarters');hide('captainGlobalExit');
      show('admiralDeck');deck.setAttribute('aria-hidden','false');refreshAdmiralSessionStrip();
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
      regattaLink.disabled = false;
      byId('regattaStatus').textContent = '';
      if (directTarget === 'schedulejoe') {
        const opener = deck.querySelector('[data-schedulejoe-open]');
        if (opener) window.DarkSkyOpenBootstrapSchedule?.(opener);
      }
      if (directTarget === 'lantern-run') byId('lanternRunLaunch')?.click();
      if (directTarget === 'regatta') {
        setAdmiralLane('promote');
        requestAnimationFrame(() => {
          if (deck.classList.contains('hidden') || regattaLink.disabled) return;
          regattaLink.focus({preventScroll: true});
          regattaLink.scrollIntoView({block: 'center', behavior: 'instant'});
        });
      }
      if(directTarget==='quartermaster'){
        setAdmiralLane('govern');
        window.setTimeout(()=>{window.BlackFlagQuartermasterUI?.open?.();},0);
      }
      if(directTarget==='findings'){
        setAdmiralLane('govern');
        window.setTimeout(()=>{
          const findings=byId('admiralReadinessFindings');
          const scroller=deck.querySelector('.admiral-deck-grid');
          if(findings&&scroller){scroller.scrollTop=Math.max(0,findings.offsetTop-170);findings.setAttribute('tabindex','-1');findings.focus({preventScroll:true});}
        },120);
      }
      try{sessionStorage.setItem('darkSkyAdmiralTrialSeen','1');}catch(_){ }
    };
    const showAccountAirlock=()=>{
      const input=byId('admiralPinInput'),unlock=byId('admiralUnlockBtn'),error=byId('admiralPinError'),layer=byId('admiralAccountAirlock');
      input?.classList.add('hidden');input?.previousElementSibling?.classList.add('hidden');unlock?.classList.add('hidden');error?.classList.add('hidden');layer?.classList.remove('hidden');
      setAdmiralEntranceStep(gate,'account');
      airlockAccount.begin();
    };
    byId('admiralUnlockBtn').onclick=async()=>{
      const button=byId('admiralUnlockBtn'),input=byId('admiralPinInput'),error=byId('admiralPinError');
      if(button.disabled)return;
      if(String(input?.value||'').trim()!==ADMIRAL_PIN){if(error)error.textContent='Admiral access denied.';if(input){input.value='';input.focus();}return;}
      admiralPassageVerified=true;
      const attempt=++admiralGateAttempt,directTarget=gate.dataset.directTarget||'',wasReusable=window.DarkSkyAdmiralSession?.status().reusable;
      if(input)input.value='';
      button.disabled=true;button.textContent='CHECKING ACCOUNT AUTHORITY…';
      if(error)error.textContent=wasReusable?'Rechecking your recent account session with the server. Verification pending.':'';
      try{
        if(wasReusable && await window.DarkSkyAdmiralIdentityStatus?.()){
          if(attempt!==admiralGateAttempt||gate.classList.contains('hidden'))return;
          if(!window.DarkSkyAdmiralSession?.noteResumed())throw new Error('The workspace session expired during verification.');
          gate.dataset.directTarget='';
          if(directTarget==='fleet'){hide('admiralGateOverlay');hide('captainQuarters');hide('captainGlobalExit');hide('admiralDeck');window.DarkSkyOpenAdmiralFleet?.({source:'admiral-gate'});}
          else if(directTarget==='commissioning-voyage')finishCommissionVoyageGate(gate);
          else openVerifiedAdmiralDeck(directTarget);
          refreshAdmiralSessionStrip();return;
        }
        if(attempt!==admiralGateAttempt||gate.classList.contains('hidden'))return;
        showAccountAirlock();
        if(wasReusable)byId('admiralAirlockStatus').textContent='The recent account session could not verify active authority. Fresh sign-in is required.';
      }catch(problem){
        if(attempt!==admiralGateAttempt||gate.classList.contains('hidden'))return;
        showAccountAirlock();byId('admiralAirlockStatus').textContent=(problem?.message||'Server verification unavailable.')+' The workspace remains locked.';
      }finally{button.disabled=false;if(gate.dataset.authStep==='pin')setAdmiralEntranceStep(gate,'pin');}
    };
    airlockAccount = AdmiralAccountForm.mount(byId('admiralSignInForm'), byId('admiralAirlockStatus'), async (email, password, current, verified) => {
      if (!admiralPassageVerified) throw Error('Verify the passage PIN before account sign-in.');
      const attempt = ++admiralGateAttempt;
      const directTarget = gate.dataset.directTarget || '';
      const active = () => current() && attempt === admiralGateAttempt && !gate.classList.contains('hidden');
      await window.DarkSkyAuthenticateAdmiral(email, password);
      if (!active()) return;
      if (!(await window.DarkSkyAdmiralIdentityStatus?.())) throw Error('Active Admiral authority was not verified.');
      if (!active()) return;
      verified();
      gate.dataset.directTarget = '';
      if (directTarget === 'fleet') {
        hide('admiralGateOverlay');hide('captainQuarters');hide('captainGlobalExit');hide('admiralDeck');
        window.DarkSkyOpenAdmiralFleet?.({source:'admiral-gate'});
      } else if (directTarget === 'commissioning-voyage') {
        finishCommissionVoyageGate(gate);
      } else {
        openVerifiedAdmiralDeck(directTarget);
      }
      refreshAdmiralSessionStrip();
    });
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
      window.dispatchEvent(new CustomEvent('darksky:admiral-lane-changed'));
    };
    byId('admiralLaneNav')?.addEventListener('click',e=>{const btn=e.target.closest('[data-admiral-lane]');if(btn)setAdmiralLane(btn.dataset.admiralLane,true);});
    byId('admiralCeremonialDelegation').onclick=()=>{deck.dataset.mode='professional';const button=byId('admiralDeckModeBtn');button.textContent='CEREMONIAL MODE';button.setAttribute('aria-pressed','true');setAdmiralLane('delegate',true);};
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
      if(action==='export-report'){exportAdmiralReadinessReport();return;}
      if(action==='retry-display'){const report=window.__lastAdmiralReadinessReport||null,mode=byId('admiralFindingTabs')?.dataset.mode||'current';const ok=mode==='history'?renderAdmiralFindings(report,mode):report?syncAdmiralReadiness(report):renderAdmiralFindings(null);const n=byId('admiralDeckNotice');if(ok&&n)n.textContent='Last report displayed again. No readiness check was rerun and no stored records changed.';return;}
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
    byId('quarterdeckMountRetry')?.addEventListener('click',()=>{if(!window.DarkSkyQuarterdeck?.mount?.()){const note=deck.querySelector('[data-admiral-panel="delegate"] p');if(note)note.textContent='Delegation display unavailable. No authority has changed. Check the complete release before continuing.';}});
    window.dispatchEvent(new CustomEvent('darksky:admiral-deck-ready'));
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

  function finishCommissionVoyageGate(gate){
    gate.dataset.directTarget='';
    hide('admiralGateOverlay');
    hide('admiralDeck');
    show('projectCommissioningWorkspace');
    document.body.classList.add('engine-workspace-open');
    window.dispatchEvent(new CustomEvent('darksky:commission-voyage-authorized',{detail:{scope:'commissioning-voyage',build:UPPER_COMMAND_BUILD}}));
  }

  function openAdmiralGate(source='captain',directTarget=''){
    // Direct workspace entrances use the same surface owner as the office cards.
    // Otherwise a previous Engine return leaves the visible gate untappable.
    if(window.DarkSkyFleetNavigator?.navigate)return window.DarkSkyFleetNavigator.navigate('admiral',{source,directTarget});
    return renderAdmiralGate(source,directTarget);
  }
  function renderAdmiralGate(source='captain',directTarget=''){
    admiralGateAttempt++;admiralPassageVerified=false;window.DarkSkyAdmiralSession?.cancelSignIn();
    ensureAdmiralDeck();
    hide('captainGlobalExit');
    const gate=byId('admiralGateOverlay');
    const deck=byId('admiralDeck');
    const input=byId('admiralPinInput');
    const fromEngine=source==='engine';
    const regattaLaunch = byId('regattaHarborLink');
    if (regattaLaunch) regattaLaunch.disabled = true;
    if(gate){gate.dataset.entrySource=fromEngine?'engine':'captain';gate.dataset.directTarget=directTarget;}
    if(deck)deck.dataset.entrySource=fromEngine?'engine':'captain';
    const gateReturn=byId('admiralGateReturnBtn');
    const deckReturn=byId('admiralDeckReturnBtn');
    input?.classList.remove('hidden');input?.previousElementSibling?.classList.remove('hidden');
    byId('admiralUnlockBtn')?.classList.remove('hidden');
    byId('admiralPinError')?.classList.remove('hidden');
    byId('admiralAccountAirlock')?.classList.add('hidden');
    if(byId('admiralAirlockStatus'))byId('admiralAirlockStatus').textContent='Fleet and governance controls remain locked.';
    if(gateReturn)gateReturn.textContent=fromEngine?'← RETURN TO ENGINE':'← RETURN TO CAPTAIN\'S QUARTERS';
    const title=byId('admiralGateTitle');
    const voyagePass=directTarget==='commissioning-voyage';
    if(voyagePass){
      if(title)title.textContent='Authorize This Voyage';
      const sub=gate?.querySelector('.admiral-gate-copy p');if(sub)sub.textContent='Verify Admiral authority for this commissioning save. No fleet command, publication, owner grant, or Captain grant is performed here.';
      if(gateReturn)gateReturn.textContent='← RETURN TO COMMISSIONING';
    }
    if(byId('admiralUnlockBtn'))byId('admiralUnlockBtn').textContent='VERIFY PASSAGE PIN →';
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
    if(input)input.value='';
    setAdmiralEntranceStep(gate,'pin');
  }
  window.DarkSkyOpenAdmiralGate=openAdmiralGate;
  window.DarkSkyOpenMyFleet=()=>openAdmiralGate('engine','fleet');

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
            <label>Working title<input data-bf-trim="boundary" id="visualForgeName" type="text" placeholder="Name this concept" /></label>
            <label>What should this become?<textarea data-bf-trim="boundary" id="visualForgeObjective" rows="5" placeholder="Describe what you want the visual to become, what must work, what must stay isolated, and what the user should be able to do."></textarea></label>
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
        byId('visualForgeStateCopy').textContent=slot==='admiral'?'The authenticated Admiral Deck will use this visual; the pre-auth gate remains neutral and Professional Mode remains clean.':'Captain reference saved for Forge/Sea Trial. The proven command-room geometry is not silently replaced.';
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
        <button type="button" data-cq-desk-route="test" data-cq-desk-state="active"><span>◇</span><b>Test Access</b><small>Engine testing</small><em>READY</em></button>
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
          showCaptainDeskNotice(report.pass?(report.warnings?`Fleet readiness clear with ${report.warnings} watch item(s).`:'Fleet readiness clear. Runtime checks completed; handoff remains separately unverified.'):`Hold in harbor: ${report.criticalFailures} critical readiness check(s).`,report.pass?(report.warnings?'future':'ready'):'unavailable');
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
    if(watch) watch.innerHTML=signalRows.length?signalRows.slice(0,1).map(({v,reasons})=>`<button type="button" class="captain-pro-signal" data-captain-pro-vessel="${v.projectId}"><span><b>${v.name}</b><small>${reasons[0]||`${v.attentionOutposts} deployment signal${v.attentionOutposts===1?'':'s'} need review.`}</small></span><em>OPEN SIGNAL →</em></button>`).join(''):`<div class="captain-pro-empty">No active attention signals.</div>`;
    const decide=byId('captainProDecideItems');
    if(decide) decide.innerHTML=signalRows.length?signalRows.slice(0,1).map(({v,reasons})=>`<article><b>${v.name}</b><p>${reasons.length?reasons.join(' • '):'A deployment signal requires Captain review.'}</p><small>FIRST MATE: inspect the evidence before choosing a route.</small></article>`).join(''):`<div class="captain-pro-empty">No decision analysis is waiting.</div>`;
    const act=byId('captainProActItems');
    if(act) act.innerHTML=signalRows.length?signalRows.slice(0,1).map(({v})=>{const priority=(v.outposts||[]).find(o=>o.state==='sea_trial'||o.state==='paused'||(o.attentionReasons||[]).length)||(v.outposts||[])[0];return `<article><b>${captainSafe(v.name)}</b><p>${captainSafe(priority?.nextStep||v.launchDetail||'Open the scoped signal report and review the exact route.')}</p><button type="button" data-captain-pro-vessel="${captainSafe(v.projectId)}">OPEN EXACT COURSE</button></article>`;}).join(''):`<article><b>Fleet steady</b><p>No attention route is required right now.</p><button type="button" data-captain-pro-route="fleet">OPEN FLEET MAP</button></article>`;
    const record=byId('captainProRecordItems');
    if(record){const outcomes=readJsonLocal(CAPTAIN_OUTCOME_KEY,[]).filter(o=>!String(o?.label||'').startsWith('Captain command:')).slice(0,3);record.innerHTML=`<article><b>Recent consequential work</b><p>Orders, decisions, outcomes and lessons remain in the durable command record. Routine navigation is not promoted as fleet history.</p><button type="button" data-captain-pro-route="log">OPEN CAPTAIN'S LOG</button></article>${outcomes.map(o=>`<article class="captain-outcome"><b>${o.label}</b><p>${o.detail||'Durable command action recorded.'}</p><small>${new Date(o.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} • ${o.build}</small></article>`).join('')}<article><b>Current command picture</b><p>${attention?`${attention} attention signal${attention===1?'':'s'} remain open.`:'No open attention signals.'} ${trials?`${trials} sea trial${trials===1?'':'s'} active.`:''}</p></article>`;}
    const professionalReport=window.__lastAdmiralReadinessReport||null;
    const professionalLabel=professionalReport?(professionalReport.pass?(professionalReport.warnings?'WATCH':'CLEAR'):'HOLD'):'NOT RUN';
    const readiness=byId('captainProReadiness');if(readiness)readiness.textContent=professionalLabel;
    const readinessState=byId('captainProReadinessState');if(readinessState){readinessState.textContent=professionalLabel;readinessState.dataset.state=professionalLabel.toLowerCase().replace(/\s+/g,'-');}
    const readinessCopy=byId('captainProReadinessCopy');if(readinessCopy)readinessCopy.textContent=professionalReport?`${Number(professionalReport.checks?.length)||0} checks completed · ${Number(professionalReport.warnings)||0} watch · ${Number(professionalReport.criticalFailures)||0} holds.`:'Run the same protected Fleet Readiness check available in Cinematic View.';
    const readinessRun=byId('captainProRunReadiness');if(readinessRun){readinessRun.disabled=false;readinessRun.textContent=professionalReport?'RUN READINESS AGAIN':'RUN FLEET READINESS';}
    const readinessFindings=byId('captainProViewFindings');if(readinessFindings)readinessFindings.hidden=!professionalReport;
    refreshCinematicHelm();
  }

  function runProfessionalFleetReadiness(){
    const run=byId('captainProRunReadiness'),state=byId('captainProReadinessState'),status=byId('captainProfessionalStatus');
    if(run){run.disabled=true;run.textContent='CHECKING FLEET…';}
    if(state){state.textContent='CHECKING';state.dataset.state='checking';}
    if(status)status.textContent='Fleet Readiness is checking isolation, authority, release identity, and operational contracts.';
    Promise.resolve(window.DarkSkyAdmiralReadiness?.run?.('captain-professional')).then(report=>{
      if(!report)throw new Error('Fleet Readiness service unavailable');
      window.__lastAdmiralReadinessReport=report;
      refreshChartroomLive();
      if(status)status.textContent=report.pass?(report.warnings?`Fleet Readiness completed with ${report.warnings} watch item(s) and no critical holds.`:'Fleet Readiness completed. Runtime checks completed; handoff remains separately unverified.'):`Fleet Readiness found ${report.criticalFailures} critical hold(s).`;
      showCaptainDeskNotice(status?.textContent||'Fleet Readiness complete.',report.pass?(report.warnings?'future':'ready'):'unavailable');
    }).catch(error=>{
      if(run){run.disabled=false;run.textContent='RUN FLEET READINESS';}
      if(state){state.textContent='UNAVAILABLE';state.dataset.state='unavailable';}
      if(status)status.textContent=String(error?.message||error);
      showCaptainDeskNotice(String(error?.message||error),'unavailable');
    });
  }

  function ensureCaptainCommandMode(){
    const room=byId('captainQuarters');
    if(!room)return;
    let bar=byId('captainCommandModeBar');
    if(!bar){
      bar=document.createElement('div');bar.id='captainCommandModeBar';bar.className='captain-command-mode-bar';
      bar.innerHTML=`<div><small>ENGINE ROOM / CAPTAIN WATCH • ${UPPER_COMMAND_BUILD}</small><strong>One signal → one decision → one exact route → one durable outcome</strong></div><div class="captain-command-mode-actions"><button id="captainCommandReturnBtn" type="button">← RETURN TO ENGINE</button><button id="captainCommandModeToggle" type="button">CINEMATIC VIEW</button></div>`;
      room.appendChild(bar);
    }
    let surface=byId('captainProfessionalSurface');
    if(!surface){
      surface=document.createElement('main');surface.id='captainProfessionalSurface';surface.className='captain-professional-surface';surface.setAttribute('aria-label','Captain professional command view');
      surface.innerHTML=`
        <header class="captain-pro-head"><div><small>PROFESSIONAL COMMAND</small><h2>Captain's Quarters</h2><p>Signal first. Decision second. Action third. Durable history last.</p></div><span>CAPTAIN AUTHORIZED</span></header>
        <nav class="waypoint-assigned" aria-label="Appointed Captain Fleet help"><a href="owner.html?surface=vessel-captain" class="tb-assigned-entry">My assigned vessels →</a><span>Open Fleet help with your appointed Captain account. Choose a vessel to see its requests.</span></nav>
        <section class="captain-pro-topline">
          <article class="captain-pro-live"><small>LIVE FLEET INTELLIGENCE</small><div><span><b id="captainProVessels">0</b><em>VESSELS</em></span><span><b id="captainProSailing">0</b><em>SAILING</em></span><span><b id="captainProTrials">0</b><em>SEA TRIAL</em></span><span><b id="captainProSignals">0</b><em>SIGNALS</em></span><span><b id="captainProReadiness">NOT RUN</b><em>READINESS</em></span></div></article>
          <article class="captain-pro-readiness-card"><div><small>FLEET READINESS</small><strong id="captainProReadinessState">NOT RUN</strong><p id="captainProReadinessCopy">Run the same protected Fleet Readiness check available in Cinematic View.</p></div><div><button id="captainProRunReadiness" type="button">RUN FLEET READINESS</button><button id="captainProViewFindings" type="button" hidden>VIEW CURRENT FINDINGS</button></div></article>
        </section>
        <section class="captain-command-decks" aria-label="Captain command loop">
          <div class="captain-command-path" aria-label="Active command path">
            <article class="captain-command-lane"><header><small>01 · WATCH</small><h3>What needs attention?</h3><p>See the signal.</p></header><div id="captainProWatchItems" class="captain-lane-body"></div></article>
            <article class="captain-command-lane"><header><small>02 · DECIDE</small><h3>Why does it matter?</h3><p>Set the course.</p></header><div id="captainProDecideItems" class="captain-lane-body"></div></article>
            <article class="captain-command-lane"><header><small>03 · ACT</small><h3>Take the exact route.</h3><p>Move deliberately.</p></header><div id="captainProActItems" class="captain-lane-body"></div></article>
          </div>
          <article class="captain-command-lane captain-record-station"><header><small>04 · RECORD</small><h3>Keep the outcome.</h3><p>Books, orders and durable history.</p></header><button id="captainAuthorityLedgerOpen" class="captain-primary-action" type="button">OPEN FLEET LEDGER</button><div id="captainProRecordItems" class="captain-lane-body"></div></article>
        </section>
        <details class="captain-support-drawer"><summary><span><b>ENGINEERING SYSTEMS</b><small>Signals, intelligence, readiness, construction and retained history</small></span><em>SYSTEMS AVAILABLE</em></summary><div><button type="button" data-captain-pro-route="watch"><b>All Signals</b><small>Full watch</small></button><button type="button" data-captain-pro-route="spyglass"><b>First Mate Analysis</b><small>Fleet intelligence</small></button><button type="button" data-captain-pro-route="fleet"><b>Fleet Map</b><small>Vessel posture</small></button><button type="button" data-captain-pro-route="log"><b>Captain's Log</b><small>Durable history</small></button><button type="button" data-captain-pro-route="readiness"><b>Fleet Readiness</b><small>Check fleet health</small></button><button type="button" data-captain-pro-route="workshop"><b>Workshop</b><small>Build and configure</small></button><button type="button" data-captain-pro-route="forge"><b>Visual Forge</b><small>Brand and experience</small></button><button type="button" data-captain-pro-route="blueprint"><b>Blueprint</b><small>Layouts and architecture</small></button><button type="button" data-captain-pro-route="admiral"><b>Admiral's Gate</b><small>Trial higher command</small></button></div></details>
        <div id="captainProfessionalStatus" class="captain-professional-status">Professional command is the operational truth. Cinematic View uses the same command model.</div>`;
      room.appendChild(surface);
      surface.addEventListener('click',e=>{
        if(e.target.closest('#captainProRunReadiness')){runProfessionalFleetReadiness();return;}
        if(e.target.closest('#captainProViewFindings')){openAdmiralGate('captain','findings');return;}
        const vesselBtn=e.target.closest('[data-captain-pro-vessel]');if(vesselBtn){recordCaptainOutcome('route','Signal route opened',vesselBtn.dataset.captainProVessel);const desk=ensureCaptainDeskIndex();const fleetBtn=desk?.querySelector('[data-cq-desk-route="fleet"]');if(fleetBtn)fleetBtn.click();requestAnimationFrame(()=>openSignalReport(vesselBtn.dataset.captainProVessel));return;}
        const btn=e.target.closest('[data-captain-pro-route]');if(!btn)return;
        if(btn.dataset.captainProRoute==='readiness'){runProfessionalFleetReadiness();return;}
        const desk=ensureCaptainDeskIndex();
        const target=desk?.querySelector(`[data-cq-desk-route="${btn.dataset.captainProRoute}"]`);
        if(target)target.click();else{const status=byId('captainProfessionalStatus');if(status)status.textContent='That command station is not available on this hull.';}
      });
    }
    room.dataset.defaultCommandMode='professional';
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
      ensureCinematicHelm();
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
    window.DarkSkyFleetNavigator?.register('admiral',({source,directTarget})=>renderAdmiralGate(source==='captain'?'captain':'engine',directTarget));
    document.querySelectorAll('[data-command-open="captain"]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();window.DarkSkyFleetNavigator?.navigate('captain',{source:'engine'})||openGate();}));
    document.querySelectorAll('[data-command-open="admiral"]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();window.DarkSkyFleetNavigator?.navigate('admiral',{source:'engine'})||openAdmiralGate('engine');}));
    const link=new URL(location.href);
    const program=link.searchParams.get('work')==='schedulejoe' ? 'schedulejoe' :
      link.searchParams.get('play')==='riptail' ? 'lantern-run' : '';
    if(link.searchParams.get('surface')==='engine' && program && !link.hash){
      // The link selects a destination only. Enter through the existing Engine and Admiral gates.
      const engine=byId('enginePanel');
      const enterProgram=()=>{
        if(!document.body.classList.contains('engine-mode') || document.body.classList.contains('boot-locked') ||
           document.body.classList.contains('bf-entry-open') || engine.classList.contains('hidden') ||
           !(window.BlackFlagAuth?.isUnlocked?.() || window.DarkSkyTestAccess?.isActive?.()))return;
        observer.disconnect();
        const url=new URL(location.href);
        url.searchParams.delete(program==='schedulejoe'?'work':'play');
        history.replaceState(history.state,'',url);
        openAdmiralGate('engine',program);
      };
      const observer=new MutationObserver(enterProgram);
      if(engine){
        observer.observe(document.body,{attributes:true,attributeFilter:['class']});
        observer.observe(engine,{attributes:true,attributeFilter:['class']});
        enterProgram();
      }
    }
    document.querySelector('[data-command-open="regatta"]')?.addEventListener('click', () => openAdmiralGate('engine', 'regatta'));
    document.querySelectorAll('[data-command-open="fleet-registry"]').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openAdmiralGate('engine','fleet');}));

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
      route.disabled=true;
      route.setAttribute('aria-busy','true');
      route.innerHTML='ROUTING… <small>Exact outpost in Engine</small>';
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
    byId('captainTestAccessToggle')?.addEventListener('click',event=>{
      event.preventDefault();window.DarkSkyTestAccess?.disable?.();window.requireEngineEntry?.();
    });
    byId('captainTestAccessDeckBtn')?.addEventListener('click',event=>{event.preventDefault();byId('captainTestAccessToggle')?.click();});

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

/* 8.8.11.1 Fleet Door Repair — canonical vessel identity, Admiral-controlled. */
;(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1',MAX_BYTES=2*1024*1024;
  let vessels=[],draftFile=null,draftUrl='',busy=false;
  const el=id=>document.getElementById(id);
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const stationClient=()=>{const c=cfg();if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION_KEY});};
  const readSession=()=>stationClient().readSession();
  const saveSession=data=>stationClient().saveSession(data);
  const clearSession=()=>stationClient().clearSession();
  const apiHeaders=(token='',json=true)=>{const c=cfg(),value={apikey:c?.publishableKey||''};if(token)value.Authorization='Bearer '+token;if(json)value['Content-Type']='application/json';return value;};
  async function refreshSession(session){return stationClient().refreshSession(session);}
  async function currentSession(){return stationClient().currentSession();}
  async function rpc(name,body={}){return stationClient().rpc(name,body,'The Admiral command was refused. Recheck its saved result before retrying.');}
  async function verifyAdmiral(){if(!cfg())return false;return stationClient().verifyAdmiralAuthority();}
  function install(){if(el('admiralBrandOpen'))return;const panel=document.querySelector('[data-admiral-panel="promote"]');if(!panel)return;panel.insertAdjacentHTML('beforeend',`<div class="admiral-lane-summary admiral-brand-summary"><b>Vessel Logo Helm</b><span>Replace a vessel's public mark without changing its permanent keel, records, or authority.</span></div><button id="admiralBrandOpen" class="admiral-pro-button" type="button">OPEN VESSEL LOGO HELM</button><section id="admiralBrandStation" class="admiral-entitlement-station admiral-course-station admiral-brand-station hidden" aria-label="Vessel Logo Helm"><header><div><small>SERVER-GOVERNED ADMIRAL BRANDING</small><h5>Vessel Logo Helm</h5><p>Choose one vessel, inspect its canonical mark, then replace it or restore the approved default.</p></div><div class="admiral-entitlement-head-actions"><strong id="admiralBrandIdentityState">ADMIRAL IDENTITY REQUIRED</strong><button id="admiralBrandClose" class="admiral-pro-button" type="button">CLOSE</button></div></header><p class="admiral-identity-explainer"><b>The logo is editable; the keel is not.</b> A logo change never renames the vessel, changes its project key, grants authority, or changes feature entitlements.</p><div id="admiralBrandAuth" class="admiral-identity-row"><label>Admiral email<input data-bf-trim="boundary" id="admiralBrandEmail" name="username" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="Admiral email"></label><label>Password<input data-bf-trim="preserve" id="admiralBrandPassword" name="password" type="password" autocomplete="current-password" placeholder="Password"></label><button id="admiralBrandSignIn" class="admiral-pro-button is-primary" type="button">AUTHENTICATE ADMIRAL</button><button id="admiralBrandRecover" class="admiral-pro-button" type="button">RECOVER PASSWORD</button><button id="admiralBrandSignOut" class="admiral-pro-button hidden" type="button">SIGN OUT IDENTITY</button></div><div class="admiral-brand-grid"><section class="admiral-brand-controls"><small>1 · COMMAND DESTINATION</small><label>Vessel<select id="admiralBrandVessel" disabled><option>Authenticate to read Fleet Core</option></select></label><small>2 · REPLACEMENT MARK</small><label class="admiral-brand-file">Choose PNG, JPEG, or WebP<input id="admiralBrandFile" type="file" accept="image/png,image/jpeg,image/webp" disabled></label><label>Order intent<input data-bf-trim="boundary" id="admiralBrandIntent" type="text" maxlength="500" placeholder="Optional reason for the record" disabled></label><div class="admiral-brand-actions"><button id="admiralBrandSave" class="admiral-pro-button is-primary" type="button" disabled>SAVE AS CANONICAL LOGO</button><button id="admiralBrandRestore" class="admiral-pro-button" type="button" disabled>RESTORE APPROVED DEFAULT</button></div></section><section class="admiral-brand-preview" aria-live="polite"><div><small>CANONICAL VESSEL MARK</small><strong id="admiralBrandName">Awaiting identity</strong><span id="admiralBrandState">No public mark changes until an Admiral command is verified.</span></div><figure><img id="admiralBrandImage" src="bootstrap_build_logo.png" alt="Vessel logo preview"></figure><p id="admiralBrandSource">Approved Bootstrap Build mark</p></section></div><div id="admiralBrandResult" class="admiral-entitlement-result" role="status" aria-live="polite">Authenticate the Admiral identity to manage vessel logos.</div><div class="admiral-package-note"><b>Authority boundary</b><span>Only an active Admiral may save the canonical path. Public customers can read the published mark; they cannot replace it.</span></div></section>`);}
  function installFleetDoor(){if(el('bootstrapFleetOpenPromote'))return;const commissioning=el('admiralCommissioningOpen');if(!commissioning)return;commissioning.insertAdjacentHTML('afterend','<div class="admiral-lane-summary bootstrap-fleet-door-summary"><b>Black Flag Fleet Registry</b><span>See every independent Fleet Core member, mission level, permanent key, operating model, and current mark in one read-only view.</span></div><button id="bootstrapFleetOpenPromote" class="admiral-pro-button bootstrap-fleet-primary-door" type="button">OPEN FLEET REGISTRY</button>');}
  function installCommissionBrand(){if(el('admiralCommissioningBrandKit'))return;const anchor=el('admiralCommissioningSummary')?.closest('label');if(!anchor)return;const kit=document.createElement('section');kit.id='admiralCommissioningBrandKit';kit.className='admiral-commissioning-brand-kit';kit.innerHTML='<div><small>SEPARATE ADMIRAL-LEVEL PROGRAM</small><strong>Bootstrap Build founding mark</strong><span>One independent program · never a parent of other vessels</span></div><figure><img src="bootstrap_build_logo.png" alt="Bootstrap Build primary vessel badge"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build horizontal lockup"><img src="bootstrap_build_icon.png" alt="Bootstrap Build compact fleet icon"></figure>';anchor.after(kit);}
  function setResult(message,verified=false){const node=el('admiralBrandResult');if(!node)return;node.textContent=message;node.classList.toggle('is-verified',verified);}
  function setBusy(next){busy=next;const verified=el('admiralBrandStation')?.classList.contains('identity-verified');if(el('admiralBrandVessel'))el('admiralBrandVessel').disabled=next||!verified;if(el('admiralBrandFile'))el('admiralBrandFile').disabled=next||!verified;if(el('admiralBrandIntent'))el('admiralBrandIntent').disabled=next||!verified;if(el('admiralBrandSave'))el('admiralBrandSave').disabled=next||!verified||!draftFile;if(el('admiralBrandRestore'))el('admiralBrandRestore').disabled=next||!verified||!selected()?.logo_storage_path;}
  function selected(){return vessels.find(item=>item.project_id===el('admiralBrandVessel')?.value)||vessels[0]||null;}
  const defaultLogo=projectId=>admiralVesselLogos.get(projectId)||'';
  function publicLogo(path){if(!path)return '';const c=cfg();return c?.url+'/storage/v1/object/public/fleet-branding/'+path.split('/').map(encodeURIComponent).join('/');}
  function paint(){const vessel=selected(),image=el('admiralBrandImage');if(!vessel){if(el('admiralBrandName'))el('admiralBrandName').textContent='No Fleet Core vessel available';return;}const src=draftUrl||publicLogo(vessel.logo_storage_path)||defaultLogo(vessel.project_id);if(image){image.src=src;image.alt=vessel.display_name+' canonical logo preview';}if(el('admiralBrandName'))el('admiralBrandName').textContent=vessel.display_name;if(el('admiralBrandState'))el('admiralBrandState').textContent=(vessel.lifecycle_state||'fleet').toUpperCase()+' · '+vessel.project_id;if(el('admiralBrandSource'))el('admiralBrandSource').textContent=draftUrl?'Local preview · not saved':vessel.logo_storage_path?'Custom canonical logo · Fleet Core verified':vessel.project_id==='construction-scheduling-01'?'Approved Bootstrap Build default':'Approved fleet default';setBusy(busy);}
  async function signIn(){const email=el('admiralBrandEmail')?.value||'',password=el('admiralBrandPassword')?.value||'';await stationClient().signInWithPassword(email,password);try{if(!(await verifyAdmiral()))throw new Error('This account does not hold active Admiral authority.');}catch(error){clearSession();throw error;}finally{if(el('admiralBrandPassword'))el('admiralBrandPassword').value='';}}
  async function loadVessels(){const data=await rpc('admiral_list_vessels_for_branding');vessels=Array.isArray(data.records)?data.records:[];const select=el('admiralBrandVessel');if(select)select.innerHTML=vessels.length?vessels.map(v=>'<option value="'+escapeHtml(v.project_id)+'">'+escapeHtml(v.display_name)+' · '+escapeHtml(v.project_id)+'</option>').join(''):'<option value="">No Fleet Core vessels found</option>';paint();window.dispatchEvent(new CustomEvent('darksky:admiral-fleet-updated',{detail:{records:window.DarkSkyReadAdmiralFleet?.()||[]}}));}
  async function sync(){ensureBootstrapIdentity();const verified=await verifyAdmiral();const station=el('admiralBrandStation');station?.classList.toggle('identity-verified',verified);if(el('admiralBrandIdentityState'))el('admiralBrandIdentityState').textContent=verified?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';['admiralBrandSignIn','admiralBrandRecover'].forEach(id=>el(id)?.classList.toggle('hidden',verified));['admiralBrandEmail','admiralBrandPassword'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',verified));el('admiralBrandSignOut')?.classList.toggle('hidden',!verified);if(verified){try{await loadVessels();setResult('Identity verified. Choose a vessel and replacement mark.');}catch(error){vessels=[];setResult(error.message);}}else{vessels=[];setResult('Authenticate the Admiral identity to manage vessel logos.');paint();}setBusy(false);return verified;}
  async function saveLogo(){const vessel=selected(),c=cfg(),session=await currentSession();if(!vessel||!draftFile||!c||!session)throw new Error('Choose a vessel and replacement logo first.');setBusy(true);setResult('Uploading the replacement mark. Fleet identity has not changed yet…');try{const ext={"image/png":'png',"image/jpeg":'jpg',"image/webp":'webp'}[draftFile.type],path=vessel.project_id+'/canonical.'+ext,url=c.url+'/storage/v1/object/fleet-branding/'+path.split('/').map(encodeURIComponent).join('/');const response=await fetch(url,{method:'POST',headers:{...apiHeaders(session.access_token,false),'Content-Type':draftFile.type,'x-upsert':'true'},body:draftFile});if(!response.ok){let message='Logo upload was refused. No canonical mark changed.';try{const problem=await response.json();message=problem?.message||problem?.error||message;}catch(_){}throw new Error(message);}const data=await rpc('admiral_set_vessel_logo',{p_project_id:vessel.project_id,p_storage_path:path,p_intent:el('admiralBrandIntent')?.value?.trim()||''});vessel.logo_storage_path=data.logo_storage_path;vessel.logo_updated_at=data.logo_updated_at;draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';if(el('admiralBrandFile'))el('admiralBrandFile').value='';if(el('admiralBrandIntent'))el('admiralBrandIntent').value='';paint();setResult('LOGO VERIFIED · '+vessel.display_name+' now uses the replacement canonical mark.',true);}finally{setBusy(false);}}
  async function restoreLogo(){const vessel=selected();if(!vessel?.logo_storage_path)return;if(!window.confirm('Restore the approved default logo for '+vessel.display_name+'?\n\nThe vessel keel and records will not change.'))return;setBusy(true);try{await rpc('admiral_set_vessel_logo',{p_project_id:vessel.project_id,p_storage_path:'',p_intent:el('admiralBrandIntent')?.value?.trim()||'Restore approved vessel logo'});vessel.logo_storage_path=null;draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';paint();setResult('DEFAULT RESTORED · '+vessel.display_name+' now uses its approved fleet mark.',true);}finally{setBusy(false);}}
  let bootstrapIdentityObserver;
  function ensureBootstrapIdentity(){install();installFleetDoor();installCommissionBrand();if(el('bootstrapFleetOpenPromote')&&el('admiralBrandOpen')&&el('admiralCommissioningBrandKit'))bootstrapIdentityObserver?.disconnect();}
  bootstrapIdentityObserver=new MutationObserver(ensureBootstrapIdentity);bootstrapIdentityObserver.observe(document.documentElement,{childList:true,subtree:true});ensureBootstrapIdentity();window.DarkSkySyncVesselBrandIdentity=sync;window.DarkSkyReadAdmiralFleet=()=>vessels.map(vessel=>({...vessel,logo_url:publicLogo(vessel.logo_storage_path)||defaultLogo(vessel.project_id)}));window.DarkSkyReadAdmiralWatch=async()=>{const data=await rpc('admiral_read_fleet_watch');if(!data||!Array.isArray(data.records))throw new Error('Fleet Core returned an invalid Watchtower response.');return {records:data.records,read_at:data.read_at||new Date().toISOString()};};window.DarkSkyReadFleetSpine=async()=>{const data=await rpc('admiral_read_fleet_spine',{p_event_limit:20});if(!data||!Array.isArray(data.vessels)||!data.counts)throw new Error('Fleet Core returned an invalid Admiral Commission response.');return data;};
  document.addEventListener('click',async event=>{const target=event.target;if(target.closest('#admiralBrandOpen')){el('admiralBrandStation')?.classList.remove('hidden');try{await sync();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralBrandClose')){el('admiralBrandStation')?.classList.add('hidden');return;}if(target.closest('#admiralBrandSignIn')){const button=el('admiralBrandSignIn');if(button?.disabled)return;try{button.disabled=true;button.textContent='AUTHENTICATING…';await signIn();await sync();window.DarkSkySyncAdmiralIdentity?.();}catch(error){setResult(error.message);}finally{button.disabled=false;button.textContent='AUTHENTICATE ADMIRAL';}return;}if(target.closest('#admiralBrandRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}if(target.closest('#admiralBrandSignOut')){clearSession();await sync();window.DarkSkySyncAdmiralIdentity?.();return;}if(target.closest('#admiralBrandSave')){try{await saveLogo();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralBrandRestore')){try{await restoreLogo();}catch(error){setResult(error.message);}return;}});
  document.addEventListener('change',event=>{if(event.target.matches('#admiralBrandVessel')){draftFile=null;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl='';paint();return;}if(event.target.matches('#admiralBrandFile')){const file=event.target.files?.[0]||null;if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){event.target.value='';setResult('Choose a PNG, JPEG, or WebP logo.');return;}if(file.size>MAX_BYTES){event.target.value='';setResult('The logo must be 2 MB or smaller.');return;}draftFile=file;if(draftUrl)URL.revokeObjectURL(draftUrl);draftUrl=URL.createObjectURL(file);paint();setResult('Local preview ready. Nothing changes until SAVE AS CANONICAL LOGO is verified.');}});
})();

/* 8.8.11.1 Bootstrap Build — local-first construction schedule proving ground. */
;(()=>{
  // Retired in 8.8.11.3. The twelve-week controller below is the sole schedule
  // helm; running both controllers against #bootstrapSchedule caused iPad
  // pointer release and rendering contention.
  return;
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
  function install(){const kit=el('admiralCommissioningBrandKit');const missionOption=el('admiralCommissioningClass')?.querySelector('option[value="admiral_program"]');if(missionOption)missionOption.textContent='Admiral-level program';if(kit&&!el('bootstrapScheduleOpen'))kit.insertAdjacentHTML('beforeend','<button id="bootstrapScheduleOpen" class="admiral-pro-button" type="button">OPEN TEST CONSTRUCTION SCHEDULE</button>');if(!el('bootstrapFleet'))document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapFleet" class="bootstrap-fleet hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Black Flag Admiral Fleet Registry"><div class="bootstrap-fleet-shell"><header><img src="black_flag_primary_lockup.png" alt="Black Flag Business Command Platform"><div><small>BLACK FLAG · ADMIRAL FLEET REGISTRY</small><h2>Independent Fleet</h2><p>One registry. Independent vessels. Governed capabilities can travel; authority and data do not.</p></div><div><button id="bootstrapFleetRefresh" type="button">REFRESH REGISTRY</button><button id="bootstrapFleetClose" type="button">CLOSE</button></div></header><p id="bootstrapFleetStatus" class="bootstrap-fleet-status" role="status">Reading the Fleet Registry…</p><div id="bootstrapFleetRows" class="bootstrap-fleet-rows"></div><aside class="bootstrap-fleet-passage"><b>Shared Capability Passage</b><span>Any fleet member may adopt an approved capability at its own level. Adoption never transfers ownership, authority, branding, or project data.</span></aside><footer><b>Read-only registry boundary</b><span>This view cannot rename, commission, publish, entitle, or otherwise change a vessel.</span></footer></div></section>`);if(el('bootstrapSchedule'))return;document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapSchedule" class="bootstrap-schedule hidden" aria-label="Bootstrap Build construction schedule prototype"><div class="bootstrap-schedule-shell"><header class="bootstrap-schedule-head"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build"><div><small>ADMIRAL-LEVEL PROGRAM · TEST WORKSPACE</small><h2>Construction Schedule</h2><p>Drag familiar work between days for the test unit.</p></div><div class="bootstrap-schedule-head-actions"><button id="bootstrapFleetOpenFromSchedule" type="button">FLEET REGISTRY</button><button id="bootstrapScheduleClose" type="button">CLOSE</button></div></header><nav class="bootstrap-schedule-crumbs" aria-label="Test project hierarchy"><span><small>REGION</small><b>ABC</b></span><i>›</i><span><small>DIVISION</small><b>CBA</b></span><i>›</i><span><small>COMMUNITY</small><b>AB</b></span><i>›</i><span><small>LOT</small><b>1234</b></span><i>›</i><span><small>UNIT</small><b>A</b></span></nav><div class="bootstrap-schedule-toolbar"><div><button id="bootstrapSchedulePrev" type="button">← PRIOR WEEK</button><strong id="bootstrapScheduleWeek"></strong><button id="bootstrapScheduleNext" type="button">NEXT WEEK →</button></div><div><button id="bootstrapScheduleAdd" type="button">+ ADD TASK</button><button id="bootstrapScheduleReset" type="button">RESET TEST DATA</button></div></div><form id="bootstrapScheduleForm" class="bootstrap-schedule-form hidden"><label>Task<input data-bf-trim="boundary" id="bootstrapScheduleTitle" maxlength="80" required placeholder="Construction task"></label><label>Trade<input data-bf-trim="boundary" id="bootstrapScheduleTrade" maxlength="40" required placeholder="Trade or crew"></label><label>Day<select id="bootstrapScheduleDay"></select></label><button type="submit">ADD TO SCHEDULE</button><button id="bootstrapScheduleCancel" type="button">CANCEL</button></form><p id="bootstrapScheduleStatus" class="bootstrap-schedule-status" role="status">Test schedule ready. Drag a task card to another day.</p><div id="bootstrapScheduleBoard" class="bootstrap-schedule-board"></div><footer><b>Test boundary</b><span>This calendar is browser-local test data for Region ABC. It does not create a Fleet Core vessel, customer commitment, owner assignment, or live construction record.</span></footer></div></section>`);}
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

/* 8.8.13 Quick Passage — fleet registry isolated from retired schedules. */
;(()=>{
  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function install(){
    if(el('bootstrapFleet'))return;
    document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapFleet" class="bootstrap-fleet hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Black Flag Admiral Fleet Registry"><div class="bootstrap-fleet-shell"><header><img src="black_flag_primary_lockup.png" alt="Black Flag Business Command Platform"><div><small>BLACK FLAG · SECURE FLEET PASSAGE</small><h2>My Fleet</h2><p>One protected registry. Independent vessels. No detour through the full Admiral command deck.</p></div><div><button id="bootstrapFleetRefresh" type="button">REFRESH</button><button id="bootstrapFleetClose" type="button">CLOSE</button></div></header><section id="bootstrapVoyageKeeper" class="bootstrap-fleet-identity"><div><small>ADMIRAL ACCOUNT</small><b>Complete the second security check</b><span>The PIN opened this passage. Your active Admiral account authorizes the fleet read.</span></div><label>Email<input data-bf-trim="boundary" id="bootstrapFleetEmail" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Admiral email"></label><label>Password<input data-bf-trim="preserve" id="bootstrapFleetPassword" type="password" autocomplete="current-password" placeholder="Password"></label><button id="bootstrapFleetSignIn" type="button">AUTHENTICATE & OPEN</button><button id="bootstrapFleetSignOut" class="hidden" type="button">SIGN OUT</button></section><p id="bootstrapFleetStatus" class="bootstrap-fleet-status" role="status">Reading the Fleet Registry…</p><div id="bootstrapFleetRows" class="bootstrap-fleet-rows"></div><aside class="bootstrap-fleet-passage"><b>Shared Capability Passage</b><span>Any fleet member may adopt an approved capability at its own level. Adoption never transfers ownership, authority, branding, or project data.</span></aside><footer><b>Read-only registry boundary</b><span>This view cannot rename, commission, publish, entitle, or otherwise change a vessel.</span></footer></div></section>`);
  }
  function render(records=[]){
    const rows=el('bootstrapFleetRows'),statusNode=el('bootstrapFleetStatus');
    if(!rows)return;
    if(!records.length){
      rows.innerHTML='<article class="bootstrap-fleet-empty"><img src="black_flag_platform_icon.png" alt="Black Flag fleet registry"><div><b>Fleet Registry is awaiting an authenticated read</b><span>Authenticate the Admiral identity, then tap REFRESH REGISTRY. No vessel or fleet state will change.</span></div></article>';
      if(statusNode)statusNode.textContent='No Fleet Core vessels are visible in this authenticated read yet.';
      return;
    }
    rows.innerHTML=records.map(vessel=>{const mission=String(vessel.mission_class||'independent_business').replaceAll('_',' ').toUpperCase(),ownership=String(vessel.ownership_model||'fleet_unassigned').replaceAll('_',' ').toUpperCase(),operating=String(vessel.operating_model||'fleet_operated').replaceAll('_',' ').toUpperCase(),isAdmiral=vessel.mission_class==='admiral_program';return '<article class="bootstrap-fleet-card'+(isAdmiral?' is-admiral-program':'')+'"><img src="'+esc(vessel.logo_url||'black_flag_primary_lockup.png')+'" alt="'+esc(vessel.display_name)+' vessel mark"><div><small>'+esc(mission)+'</small><b>'+esc(vessel.display_name)+'</b><span>'+esc(vessel.project_id)+'</span><span class="bootstrap-fleet-command">'+esc(operating)+' · '+esc(ownership)+'</span></div><em>'+esc(String(vessel.lifecycle_state||'fleet').replaceAll('_',' ').toUpperCase())+'</em></article>';}).join('');
    if(statusNode)statusNode.textContent=records.length+' independent Fleet Core member'+(records.length===1?'':'s')+' visible · read only.';
  }
  async function load(){
    const statusNode=el('bootstrapFleetStatus');
    if(statusNode)statusNode.textContent='Verifying Admiral identity for a read-only fleet view…';
    try{
      const verified=await window.DarkSkyAdmiralIdentityStatus?.();
      el('bootstrapVoyageKeeper')?.classList.toggle('is-verified',!!verified);
      ['bootstrapFleetEmail','bootstrapFleetPassword','bootstrapFleetSignIn'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',!!verified));
      el('bootstrapFleetSignIn')?.classList.toggle('hidden',!!verified);
      el('bootstrapFleetSignOut')?.classList.toggle('hidden',!verified);
      if(!verified){render([]);if(statusNode)statusNode.textContent='Admiral account authentication is required. The registry remains closed.';return;}
      await window.DarkSkySyncVesselBrandIdentity?.();render(window.DarkSkyReadAdmiralFleet?.()||[]);
    }
    catch(error){render([]);if(statusNode)statusNode.textContent=error?.message||'The Admiral Fleet could not be read. No data changed.';}
  }
  function open(){
    install();
    const fleet=el('bootstrapFleet');
    fleet.classList.remove('hidden');
    fleet.setAttribute('aria-hidden','false');
    document.body.classList.add('bootstrap-fleet-open');
    fleet.scrollTop=0;
    el('bootstrapFleetStatus').textContent='Admiral Fleet opened. Reading Fleet Core…';
    requestAnimationFrame(()=>el('bootstrapFleetClose')?.focus({preventScroll:true}));
    load();
  }
  function close(){
    const fleet=el('bootstrapFleet');
    fleet?.classList.add('hidden');
    fleet?.setAttribute('aria-hidden','true');
    document.body.classList.remove('bootstrap-fleet-open');
  }
  install();
  window.DarkSkyOpenAdmiralFleet=open;
  window.addEventListener('darksky:admiral-fleet-updated',event=>render(event.detail?.records||[]));
  document.addEventListener('click',async event=>{
    const target=event.target;
    if(target.closest?.('#bootstrapFleetOpen,#bootstrapFleetOpenPromote,#bootstrapFleetOpenFromSchedule')){event.preventDefault();event.stopImmediatePropagation();open();return;}
    if(target.closest?.('#bootstrapFleetClose')){event.preventDefault();event.stopImmediatePropagation();close();return;}
    if(target.closest?.('#bootstrapFleetRefresh')){event.preventDefault();event.stopImmediatePropagation();load();}
    if(target.closest?.('#bootstrapFleetSignIn')){event.preventDefault();event.stopImmediatePropagation();const button=el('bootstrapFleetSignIn');try{button.disabled=true;button.textContent='AUTHENTICATING…';await window.DarkSkyAuthenticateAdmiral?.(el('bootstrapFleetEmail')?.value,el('bootstrapFleetPassword')?.value);if(el('bootstrapFleetPassword'))el('bootstrapFleetPassword').value='';await load();}catch(error){if(el('bootstrapFleetStatus'))el('bootstrapFleetStatus').textContent=error?.message||'Admiral sign-in failed.';}finally{button.disabled=false;button.textContent='AUTHENTICATE & OPEN';}return;}
    if(target.closest?.('#bootstrapFleetSignOut')){event.preventDefault();event.stopImmediatePropagation();window.DarkSkySignOutAdmiral?.();await load();}
  },{capture:true});
})();

/* 8.8.11.1 Bootstrap Build Schedule — twelve-week, workday construction schedule proving ground. */
;(()=>{
  const STORE='bootstrapBuildGroundRunV2',WEEKS=12,DAYS=WEEKS*5;
  return;
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
  function install(){el('bootstrapSchedule')?.remove();document.body.insertAdjacentHTML('beforeend',`<section id="bootstrapSchedule" class="bootstrap-schedule bootstrap-build-schedule hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Bootstrap Build construction schedule"><div class="bootstrap-schedule-shell"><header class="bootstrap-schedule-head"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build"><div><small>ADMIRAL-LEVEL PROGRAM · LOCAL TEST RUN</small><h2>Construction Schedule</h2><p>Move work from clearing through settlement across this sample project.</p></div><div class="bootstrap-schedule-head-actions"><button id="bootstrapFleetOpenFromSchedule" type="button">FLEET REGISTRY</button><button id="bootstrapScheduleClose" type="button">CLOSE</button></div></header><nav class="bootstrap-schedule-crumbs" aria-label="Test project hierarchy"><span><small>REGION</small><b>ABC</b></span><i>›</i><span><small>DIVISION</small><b>CBA</b></span><i>›</i><span><small>COMMUNITY</small><b>AB</b></span><i>›</i><span><small>LOT</small><b>1234</b></span><i>›</i><span><small>UNIT</small><b>A</b></span></nav><div class="bootstrap-schedule-toolbar"><div><strong id="bootstrapScheduleRange">SAMPLE PROJECT · 60 WORKDAYS</strong></div><div class="bootstrap-schedule-legend" aria-label="Task colors"><span data-kind="work">WORK</span><span data-kind="site">SITE</span><span data-kind="inspection">INSPECTION</span><span data-kind="delivery">DELIVERY</span><span data-kind="milestone">MILESTONE</span></div><div><button id="bootstrapScheduleAdd" type="button">+ ADD TASK</button><button id="bootstrapScheduleReset" type="button">RESET TEST DATA</button></div></div><form id="bootstrapScheduleForm" class="bootstrap-schedule-form bootstrap-ground-form hidden"><label>Task<input data-bf-trim="boundary" id="bootstrapScheduleTitle" maxlength="80" required placeholder="Construction task"></label><label>Trade<input data-bf-trim="boundary" id="bootstrapScheduleTrade" maxlength="40" required placeholder="Trade or crew"></label><label>Type<select id="bootstrapScheduleType"><option value="work">Work</option><option value="site">Site</option><option value="inspection">Inspection</option><option value="delivery">Delivery</option><option value="milestone">Milestone</option></select></label><label>Start<select id="bootstrapScheduleDay"></select></label><label>Days<input id="bootstrapScheduleDuration" type="number" min="1" max="15" value="1"></label><button type="submit">ADD TASK</button><button id="bootstrapScheduleCancel" type="button">CANCEL</button></form><p id="bootstrapScheduleStatus" class="bootstrap-schedule-status" role="status">Schedule ready. Drag a task to a new workday; its duration stays intact.</p><div id="bootstrapScheduleBoard" class="bootstrap-ground-board"></div><footer><b>Test boundary</b><span>This sample calendar is browser-local test data for Region ABC. It creates no vessel, customer commitment, owner assignment, or live construction record.</span></footer></div></section>`);}
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
    const kit=el('admiralCommissioningBrandKit');
    if(kit&&!el('bootstrapScheduleOpen'))kit.insertAdjacentHTML('beforeend','<button id="bootstrapScheduleOpen" class="admiral-pro-button" type="button">OPEN BOOTSTRAP BUILD SCHEDULE</button>');
    const doorway=el('bootstrapScheduleOpen');
    if(doorway&&doorway.textContent!=='OPEN BOOTSTRAP BUILD SCHEDULE')doorway.textContent='OPEN BOOTSTRAP BUILD SCHEDULE';
    const identity=el('admiralCommissioningIdentityState');
    const items=el('admiralCommissioningPreviewItems');
    if(identity?.textContent?.includes('VERIFIED')&&items?.textContent?.includes('Authenticate the Admiral identity'))items.innerHTML='<p>Review the permanent and editable fields, then preview the order.</p>';
  }
  function segmentsForWeek(week){const first=week*5,last=first+5,segments=[];state.tasks.forEach(task=>{const start=Math.max(task.start,first),end=Math.min(task.start+Math.max(1,task.duration||1),last);if(start<end)segments.push({task,start,end});});segments.sort((a,b)=>a.start-b.start||b.end-a.end||a.task.title.localeCompare(b.task.title));const lanes=[];segments.forEach(segment=>{let lane=lanes.findIndex(end=>end<=segment.start);if(lane<0){lane=lanes.length;lanes.push(segment.end);}else lanes[lane]=segment.end;segment.lane=lane;});return {segments,lanes:Math.max(2,lanes.length)};}
  function render(){const range=el('bootstrapScheduleRange');if(range)range.textContent=labelDate(0)+' – '+workDate(DAYS-1).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})+' · 12 WEEKS';const select=el('bootstrapScheduleDay');if(select)select.innerHTML=Array.from({length:DAYS},(_,day)=>'<option value="'+day+'">'+esc(labelDate(day,true))+'</option>').join('');const board=el('bootstrapScheduleBoard');if(!board)return;board.innerHTML=Array.from({length:WEEKS},(_,week)=>{const first=week*5,{segments,lanes}=segmentsForWeek(week);const heads=Array.from({length:5},(_,col)=>'<button type="button" class="bootstrap-ground-day-head'+(overDay===first+col?' is-over':'')+'" data-schedule-move="'+(first+col)+'" title="Move selected task here"><small>'+esc(workDate(first+col).toLocaleDateString(undefined,{weekday:'short'}))+'</small><b>'+esc(labelDate(first+col))+'</b></button>').join('');const cells=Array.from({length:5},(_,col)=>'<div class="bootstrap-ground-day-cell'+(overDay===first+col?' is-over':'')+'" data-schedule-day="'+(first+col)+'" style="grid-column:'+(col+1)+';grid-row:2 / span '+lanes+'"></div>').join('');const bars=segments.map(({task,start,end,lane})=>{const continuation=start>task.start,continues=end<task.start+task.duration;return '<article class="bootstrap-ground-task kind-'+esc(task.type||'work')+(selectedId===task.id?' is-selected':'')+'" draggable="true" tabindex="0" data-task-id="'+esc(task.id)+'" style="grid-column:'+(start-first+1)+' / span '+(end-start)+';grid-row:'+(lane+2)+'"><small>'+esc(task.trade)+'</small><b>'+(continuation?'← ':'')+esc(task.title)+(continues?' →':'')+'</b><span>'+esc(task.duration)+' workday'+(task.duration===1?'':'s')+'</span></article>';}).join('');return '<section class="bootstrap-ground-week"><header><small>WEEK '+(week+1)+'</small><b>'+esc(labelDate(first))+' – '+esc(labelDate(first+4))+'</b></header><div class="bootstrap-ground-week-grid" data-week="'+week+'" style="--task-lanes:'+lanes+'">'+heads+cells+bars+'</div></section>';}).join('');}
  const renderSchedule=render;render=()=>{renderSchedule();renderVendorLayer();};
  function move(id,day){const task=state.tasks.find(item=>item.id===id);if(!task)return;const from=task.start,next=Math.max(0,Math.min(DAYS-Math.max(1,task.duration||1),Number(day)));task.start=next;if(from!==next)state.activity.unshift({id:'move-'+Date.now(),at:new Date().toISOString(),task:task.title,vendor:task.vendor,from:labelDate(from,true),to:labelDate(next,true)});state.activity=state.activity.slice(0,100);selectedId='';showOver(null);renderSchedule();document.querySelectorAll('#bootstrapSchedule [data-task-id="'+CSS.escape(task.id)+'"]').forEach(node=>node.classList.add('is-settling'));status(task.title+' moved to '+labelDate(task.start,true)+'. Saving vendor update…');window.setTimeout(()=>{save();renderVendorLayer();status(task.title+' moved to '+labelDate(task.start,true)+'. '+task.duration+'-workday duration preserved; '+task.vendor+' can see the change.');},32);}
  function gridRects(){return [...document.querySelectorAll('.bootstrap-ground-week-grid')].map(grid=>({week:Number(grid.dataset.week),rect:grid.getBoundingClientRect()}));}
  function dayAtPoint(x,y,rects=gridRects()){for(const item of rects){const r=item.rect;if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){const col=Math.max(0,Math.min(4,Math.floor((x-r.left)/(r.width/5))));return item.week*5+col;}}return null;}
  function showOver(day){if(day===overDay)return;const prior=overDay;overDay=day;if(prior!==null)document.querySelectorAll('[data-schedule-day="'+prior+'"],[data-schedule-move="'+prior+'"]').forEach(node=>node.classList.remove('is-over'));if(day!==null)document.querySelectorAll('[data-schedule-day="'+day+'"],[data-schedule-move="'+day+'"]').forEach(node=>node.classList.add('is-over'));}
  function makeDragGhost(card,event){const rect=card.getBoundingClientRect(),ghost=card.cloneNode(true);ghost.removeAttribute('draggable');ghost.removeAttribute('tabindex');ghost.classList.remove('is-selected');ghost.classList.add('bootstrap-drag-ghost');ghost.style.width=rect.width+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';document.body.appendChild(ghost);return {node:ghost,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};}
  function moveDragGhost(drag,event){if(!drag?.ghost)return;drag.ghost.node.style.transform='translate3d('+(event.clientX-drag.ghost.offsetX-parseFloat(drag.ghost.node.style.left))+'px,'+(event.clientY-drag.ghost.offsetY-parseFloat(drag.ghost.node.style.top))+'px,0)';}
  function clearTouchDrag(){touchDrag?.ghost?.node?.remove();touchDrag=null;}
  function open(){const panel=el('bootstrapSchedule');if(!panel)return;panel.classList.remove('hidden');panel.setAttribute('aria-hidden','false');panel.scrollTop=0;render();requestAnimationFrame(()=>el('bootstrapScheduleClose')?.focus({preventScroll:true}));}
  install();syncCommissioningCopy();new MutationObserver(syncCommissioningCopy).observe(document.body,{subtree:true,childList:true,characterData:true});window.DarkSkyOpenBootstrapSchedule=open;
  document.addEventListener('click',event=>{const target=event.target;if(target.closest('#bootstrapScheduleOpen')){event.preventDefault();event.stopImmediatePropagation();open();return;}if(!target.closest('#bootstrapSchedule'))return;if(target.closest('#bootstrapFleetOpenFromSchedule'))return;if(target.closest('#bootstrapScheduleClose')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapSchedule')?.classList.add('hidden');el('bootstrapSchedule')?.setAttribute('aria-hidden','true');return;}if(target.closest('#bootstrapScheduleAdd')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapScheduleForm')?.classList.remove('hidden');el('bootstrapScheduleTitle')?.focus();return;}if(target.closest('#bootstrapScheduleCancel')){event.preventDefault();event.stopImmediatePropagation();el('bootstrapScheduleForm')?.classList.add('hidden');return;}if(target.closest('#bootstrapScheduleReset')){event.preventDefault();event.stopImmediatePropagation();if(window.confirm('Reset the Region ABC sample schedule?')){state={version:3,hierarchy,tasks:tasks(),activity:[]};selectedId='';save();render();status('Sample construction schedule restored from clearing through settlement.');}return;}const moveButton=target.closest('[data-schedule-move]');if(moveButton&&selectedId){event.preventDefault();event.stopImmediatePropagation();move(selectedId,Number(moveButton.dataset.scheduleMove));return;}const card=target.closest('[data-task-id]');if(card){event.preventDefault();event.stopImmediatePropagation();if(Date.now()<suppressClickUntil)return;selectedId=selectedId===card.dataset.taskId?'':card.dataset.taskId;render();status(selectedId?'Task selected. Tap a day heading or drag it to reschedule.':'Task selection cleared.');}},{capture:true});
  document.addEventListener('submit',event=>{if(event.target.id!=='bootstrapScheduleForm')return;event.preventDefault();event.stopImmediatePropagation();const title=el('bootstrapScheduleTitle')?.value?.trim(),trade=el('bootstrapScheduleTrade')?.value?.trim(),start=Number(el('bootstrapScheduleDay')?.value||0),duration=Math.max(1,Math.min(15,Number(el('bootstrapScheduleDuration')?.value||1))),type=el('bootstrapScheduleType')?.value||'work';if(!title||!trade)return;state.tasks.push({id:'task-'+Date.now(),title,trade,start:Math.min(start,DAYS-duration),duration,type});save();event.target.reset();el('bootstrapScheduleDuration').value='1';event.target.classList.add('hidden');render();status(title+' added to the local test schedule.');},{capture:true});
  document.addEventListener('dragstart',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card)return;event.stopImmediatePropagation();selectedId=card.dataset.taskId;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',selectedId);card.classList.add('is-dragging');},{capture:true});
  document.addEventListener('dragover',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();showOver(day);},{capture:true});
  document.addEventListener('drop',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();move(event.dataTransfer.getData('text/plain')||selectedId,day);},{capture:true});
  document.addEventListener('dragend',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;event.stopImmediatePropagation();overDay=null;document.querySelectorAll('.bootstrap-ground-task,.bootstrap-ground-day-cell,.bootstrap-ground-day-head').forEach(node=>node.classList.remove('is-over','is-dragging'));},{capture:true});
  document.addEventListener('pointerdown',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||event.pointerType==='mouse')return;event.preventDefault();event.stopImmediatePropagation();selectedId=card.dataset.taskId;touchDrag={id:selectedId,pointerId:event.pointerId,rects:gridRects(),ghost:makeDragGhost(card,event)};card.setPointerCapture?.(event.pointerId);card.classList.add('is-dragging');moveDragGhost(touchDrag,event);},{capture:true});
  document.addEventListener('pointermove',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;event.preventDefault();event.stopImmediatePropagation();moveDragGhost(touchDrag,event);showOver(dayAtPoint(event.clientX,event.clientY,touchDrag.rects));},{capture:true,passive:false});
  document.addEventListener('pointerup',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointerId)return;event.preventDefault();event.stopImmediatePropagation();const drag=touchDrag,id=drag.id,day=dayAtPoint(event.clientX,event.clientY,drag.rects);clearTouchDrag();suppressClickUntil=Date.now()+350;if(day!==null)move(id,day);else{showOver(null);render();status('Task selected. Tap a workday heading to move it.');}},{capture:true});
  document.addEventListener('pointercancel',event=>{if(!touchDrag)return;event.stopImmediatePropagation();clearTouchDrag();showOver(null);render();},{capture:true});
  document.addEventListener('keydown',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();const task=state.tasks.find(item=>item.id===card.dataset.taskId);if(task)move(task.id,task.start+(event.key==='ArrowRight'?1:-1));},{capture:true});
  document.addEventListener('change',event=>{if(event.target.id!=='bootstrapVendorView')return;vendorView=event.target.value;render();status(vendorView?'Vendor view opened for '+vendorView+'. Move notices remain visible below the schedule.':'All project work is visible.');},{capture:true});
  document.addEventListener('click',event=>{if(!event.target.closest?.('#bootstrapVendorAssignButton'))return;event.preventDefault();event.stopImmediatePropagation();const task=state.tasks.find(item=>item.id===selectedId),vendor=el('bootstrapVendorAssign')?.value;if(!task||!vendor)return;const prior=task.vendor;task.vendor=vendor;state.activity.unshift({id:'assign-'+Date.now(),at:new Date().toISOString(),task:task.title,vendor,from:prior,to:vendor,assignment:true});state.activity=state.activity.slice(0,100);selectedId='';save();render();status(task.title+' assigned to '+vendor+'. Its vendor schedule now includes this task.');},{capture:true});
})();

/* 8.8.13 Project Roster — three isolated schedules with durable local records. */
;(()=>{
  const MAX_WEEKS=52,DB_NAME='bootstrapBuildScheduleDB',DB_STORE='projects';
  const LEGACY_STORE='bootstrapBuildGroundRunV2',STORE_PREFIX='bootstrapBuildProjectScheduleV1:';
  const projects=[
    {id:'1234-A',region:'ABC',division:'CBA',community:'AB',lot:'1234',unit:'A',initialMonday:'2026-11-02'},
    {id:'1234-B',region:'ABC',division:'CBA',community:'AB',lot:'1234',unit:'B',initialMonday:'2026-11-09'},
    {id:'1235-A',region:'ABC',division:'CBA',community:'AB',lot:'1235',unit:'A',initialMonday:'2026-11-16'}
  ];
  // Each added lot is its own indexed record. Its key identifies the complete job address.
  const newProjectKey=/^job:([A-Z0-9]{3}):([A-Z0-9]{3}):([A-Z0-9]{2}):(\d{4}):([A-Z0-9]?)$/;
  function projectKey(meta){return ['job',meta.region,meta.division,meta.community,meta.lot,meta.unit].join(':');}
  function projectLabel(meta){return 'Lot '+meta.lot+(meta.unit?' · Unit '+meta.unit:'');}
  function qualifiedLabel(meta){return projectLabel(meta)+' · '+[meta.region,meta.division,meta.community].join(' / ');}
  async function discoverProjects(){
    const keys=new Set();
    try{
      const db=await openDb();
      const ids=await new Promise((resolve,reject)=>{
        const request=db.transaction(DB_STORE).objectStore(DB_STORE).getAllKeys();
        request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
      });
      for(const id of ids)keys.add(id);
    }catch(_){}
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key?.startsWith(STORE_PREFIX+'job:'))keys.add(key.slice(STORE_PREFIX.length));
      }
    }catch(_){}
    for(const id of [...keys].sort()){
      const parts=newProjectKey.exec(id);
      if(!parts||projects.some(p=>p.id===id))continue;
      const [,region,division,community,lot,unit]=parts;
      projects.push({id,region,division,community,lot,unit});
    }
  }
  function openProjectForm(){
    if(!current(visit)||activeId)return;
    const form=el('newLotForm'),base=projects[0];
    form.reset();
    for(const key of ['region','division','community'])form.elements[key].value=base[key];
    form.elements.startDate.value=isoDate(new Date());
    el('newLotStatus').textContent='';el('newLotSave').disabled=false;
    el('newLotDialog').showModal();
  }
  async function createProject(event){
    event.preventDefault();
    const entry=visit,form=event.currentTarget,save=el('newLotSave'),message=el('newLotStatus');
    if(!current(entry)||activeId||save.disabled)return;
    const hierarchy=Object.fromEntries(['region','division','community','lot','unit'].map(k=>[k,form.elements[k].value.trim().toUpperCase()]));
    const id=projectKey(hierarchy),date=form.elements.startDate.value;
    if(!newProjectKey.test(id)||!date)return;
    const meta={...hierarchy,id};
    const monday=new Date(date+'T12:00:00');
    monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
    const record={...fresh(meta),planStart:isoDate(monday),rosterDetails:{startDate:date},revision:1,updatedAt:new Date().toISOString()};
    const duplicate='This lot and unit already have a schedule in this community.';
    const create=async()=>{
      if(!current(entry))throw Error('Your session has ended.');
      if(projects.some(p=>projectKey(p)===id)||localRead(STORE_PREFIX+id))throw Error(duplicate);
      // add() rejects a competing creation instead of overwriting an existing calendar.
      const db=await openDb();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(DB_STORE,'readwrite');
        tx.objectStore(DB_STORE).add(record);
        tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);
      });
      try{localWrite(record);}catch(_){}
    };
    save.disabled=true;el('newLotCancel').disabled=true;message.textContent='';
    try{
      if(navigator.locks?.request)await navigator.locks.request('schedulejoe-'+id,create);
      else await create();
      if(!current(entry))return;
      if(!projects.some(p=>p.id===id))projects.push(meta);
      cache.set(id,record);el('newLotDialog').close();el('crewQuery').value='';renderLanding();
      el('rosterNotice').textContent=projectLabel(meta)+' added. Open the lot to schedule its first task.';
      el('bootstrapProjectRows').querySelector('[data-open-project="'+id+'"]')?.focus({preventScroll:true});
    }catch(error){
      if(current(entry))message.textContent=error?.name==='ConstraintError'||error?.message===duplicate?duplicate:'Could not create this project on this device. Your entries are here to try again.';
    }finally{save.disabled=false;el('newLotCancel').disabled=false;}
  }
  let activeId='',state=null,cache=new Map(),selectedId='',vendorView='',touchDrag=null,overDay=null,suppressClickUntil=0,dbPromise=null;
  let selectedWeek=0,visit=null,saveQueue=Promise.resolve(),desktopGrab=null;
  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const project=id=>projects.find(item=>item.id===id)||projects[0];
  const areaNames={exterior:'Exterior',interior:'Interior',general:'General / unassigned'};
  const exteriorIds=new Set('clearing layout excavation footers footing-insp foundation foundation-insp waterproof backfill slab-prep slab-insp slab roof windows exterior driveway final-grade'.split(' '));
  const interiorIds=new Set('rough-hvac rough-plumb rough-electric insulation predrywall drywall-delivery drywall prime cabinets hard-surface mep-final appliances carpet final-clean'.split(' '));
  function areaOf(task) {
    if(Object.hasOwn(areaNames,task.area))return task.area;
    if(exteriorIds.has(task.id))return 'exterior';
    if(interiorIds.has(task.id))return 'interior';
    return 'general';
  }
  function weekCount(value=state) {
    const weeks=Number(value?.planningWeeks);
    return Number.isInteger(weeks)&&weeks>=12&&weeks<=MAX_WEEKS?weeks:12;
  }
  const areaOptions=Object.entries(areaNames).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');
  let pendingMove=null;
  function closeMove() {
    pendingMove=null;
    if(el('joeMove')?.open)el('joeMove').close();
  }
  function openMove(task,day,values=null) {
    const delta=day-task.start;
    if(!delta)return;
    pendingMove={record:state,id:task.id,delta,values};
    el('joeMoveLot').textContent=lotLabel()+' · '+task.title;
    el('joeForwardText').textContent='Limit other tasks to '+labelDate(task.start,true)+' or later';
    el('joeForward').checked=true;
    el('joeMoveSummary').textContent='';
    el('joeMove').showModal();
  }
  async function applyMove(scope) {
    if(!current(visit)||!pendingMove||pendingMove.record!==state){closeMove();return;}
    const {id,delta,values}=pendingMove;
    const anchor=state.tasks.find(t=>t.id===id);
    if(!anchor||anchor.locked===true||anchor.complete===true){closeMove();return;}
    const fromAnchor=el('joeForward').checked;
    const tasks=state.tasks.filter(t=>{
      if(t===anchor)return true;
      if(t.locked===true||t.complete===true||scope==='one')return false;
      return (!fromAnchor||t.start>=anchor.start)&&(scope==='all'||areaOf(t)===scope);
    });
    const weeks=tasks.reduce((n,t)=>Math.max(n,Math.ceil((t.start+delta+(t===anchor&&values?values.duration:t.duration))/5)),weekCount());
    let issue='';
    if(tasks.some(t=>t.start+delta<0))issue='This move would start before the first project workday.';
    else if(weeks>MAX_WEEKS)issue='This move would exceed the 52-week planning window.';
    if(issue){el('joeMoveSummary').textContent=issue;return;}
    closeMove();
    for(const t of tasks){
      const previous={...t};
      if(t===anchor&&values)Object.assign(t,values);else t.start+=delta;
      recordTaskChange(previous,t);
    }
    state.planningWeeks=weeks;selectedId='';showOver(null);
    finishEdit(anchor);
    await persist(tasks.length+' task'+(tasks.length===1?'':'s')+' moved.');
  }
  // The example has its own dates and never enters the project cache or save queue.
  const example={
    planStart:'2026-10-12',planningWeeks:18,
    closures:new Map([[54,'Site closed'],[59,'Site closed']]),
    tasks:[
      ['Plan review',0,6,'work'],['Utility coordination',3,4,'site'],['Permits ready',8,1,'milestone'],
      ['Survey and staking',9,3,'site'],['Construction start',15,1,'milestone'],['Earthwork',15,4,'site'],
      ['Form and pour footings',19,4,'work'],['Foundation inspection',23,1,'inspection'],
      ['Foundation walls',24,4,'work'],['Backfill and compact',28,3,'site'],['Framing delivery',31,1,'delivery'],
      ['Framing starts',32,1,'milestone'],['Framing crew',32,8,'work'],['Sheathing and roof',38,5,'site'],
      ['Rough plumbing',42,4,'work'],['Rough electrical',43,5,'work'],['Rough inspection',48,1,'inspection'],
      ['Insulate and seal',49,3,'work'],['Pre-drywall walk',52,1,'milestone'],['Hang and finish drywall',53,9,'work'],
      ['Exterior finishes',60,6,'site'],['Cabinets and trim',63,6,'work'],['Finish flooring',70,4,'work'],
      ['Fixture installation',74,4,'work'],['Landscape and grade',75,4,'site'],['Quality walk',80,1,'milestone'],
      ['Finish corrections',81,3,'work'],['Final verification',85,1,'inspection'],['Final clean',86,2,'work'],
      ['Settlement',89,1,'milestone']
    ].map(([title,start,duration,type])=>({title,start,duration,type}))
  };
  let lookRecord=null,lookWeek=0;
  const kindNames={work:'Work',site:'Site',inspection:'Inspection',delivery:'Delivery',milestone:'Milestone'};
  function lookDay(index,format) {
    const date=new Date(lookRecord.planStart+'T12:00:00');
    date.setDate(date.getDate()+7*Math.floor(index/5)+index%5);
    return date.toLocaleDateString(undefined,format||{month:'short',day:'numeric'});
  }
  function openLook(record,week=0) {
    el('bootstrapSchedule').classList.remove('desk-open');
    lookRecord=record;lookWeek=Math.max(0,Math.min(week,weekCount(record)-1));
    el('bootstrapProjectWorkspace').classList.add('hidden');el('bootstrapProjectLanding').classList.add('hidden');
    el('bootstrapProjectsHome').classList.remove('hidden');el('joeLongview').hidden=false;
    el('bootstrapScheduleTitleHeading').textContent=record===example?'Example home build':lotLabel();
    el('bootstrapScheduleSubtitle').textContent=record===example?'Fictional 18-week schedule from permits to settlement.':'Four-week lookahead';
    renderLook();el('bootstrapSchedule').scrollTop=0;el('joeLookTitle').focus({preventScroll:true});
  }
  function renderLook() {
    const record=lookRecord,limit=weekCount(record),end=Math.min(limit,lookWeek+4),sample=record===example;
    el('joeLookTitle').textContent=lookDay(lookWeek*5)+' – '+lookDay(end*5-1,{month:'short',day:'numeric',year:'numeric'});
    el('joePrev').disabled=lookWeek===0;el('joeNext').disabled=end===limit;
    el('joeWeekJump').innerHTML=Array.from({length:limit},(_,w)=>`<option value="${w}">Week ${w+1} · ${esc(lookDay(w*5))}</option>`).join('');
    el('joeWeekJump').value=String(lookWeek);
    const tasks=record.tasks.filter(t=>sample||!vendorView||t.vendor===vendorView);
    el('joeJump').innerHTML='<option value="">Jump to milestone</option>'+tasks.filter(t=>t.type==='milestone').sort((a,b)=>a.start-b.start).map(t=>`<option value="${Math.floor(t.start/5)}">${esc(t.title)}</option>`).join('');
    el('joeJump').disabled=el('joeJump').options.length===1;
    const html=[];
    for(let week=lookWeek;week<end;week++){
      const first=week*5,day=index=>lookDay(index,{weekday:'short',day:'numeric'}),lanes=[];
      const headers=Array.from({length:5},(_,c)=>{
        const d=first+c,closed=sample&&example.closures.has(d);
        return `<div class="joe-day${closed?' joe-closed':''}" style="grid-column:${c+1}">${esc(lookDay(d,{weekday:'short'}))} <b>${esc(lookDay(d,{day:'numeric'}))}</b>${closed?'<small>Closed</small>':''}</div>`;
      }).join('');
      const entries=[];
      for(const t of tasks) {
        const last=t.start+t.duration;
        for(let d=Math.max(t.start,first);d<Math.min(last,first+5);) {
          if(sample&&example.closures.has(d)){d++;continue;}
          const start=d++;
          while(d<Math.min(last,first+5)&&(!sample||!example.closures.has(d)))d++;
          entries.push({t,start,end:d});
        }
      }
      entries.sort((a,b)=>a.start-b.start||b.end-a.end||a.t.title.localeCompare(b.t.title));
      const bars=entries.map(({t,start,end})=>{
        let lane=lanes.findIndex(finish=>finish<=start);
        if(lane<0)lane=lanes.length;lanes[lane]=end;
        const kind=Object.hasOwn(kindNames,t.type)?t.type:'work';
        return `<div class="joe-bar joe-${kind}" style="grid-column:${start-first+1} / span ${end-start};grid-row:${lane+2}"><small>${kindNames[kind]} · ${esc(day(start))}${end-start>1?' – '+esc(day(end-1)):''}</small><b>${start>t.start?'‹ ':''}${esc(t.title)}${end<t.start+t.duration?' ›':''}</b></div>`;
      }).join('');
      const closures=sample?[...example.closures].filter(([d])=>Math.floor(d/5)===week).map(([d,txt])=>`${day(d)} · ${txt}`):[];
      const weekends=(record.acceleratedDays||[]).filter(e=>e.week===week).map(e=>weekendLabel(e)+' · '+e.shift+' · '+e.commitment);
      html.push(`<article class="joe-week"><header><h3>Week ${week+1} <span>${esc(lookDay(first))} – ${esc(lookDay(first+4))}</span></h3>${sample?'':`<button type="button" data-edit-week="${week}">Edit week →</button>`}</header><div class="joe-grid">${headers}${bars}</div>${entries.length?'':'<p>No scheduled weekday work.</p>'}${[...closures,...weekends].map(s=>'<p>'+esc(s)+'</p>').join('')}</article>`);
    }
    el('joeWeeks').innerHTML=html.join('');
  }
  function vendorFor(trade){return ({Sitework:'Piedmont Siteworks',Survey:'Cardinal Survey',Inspection:'City & County Inspections',Concrete:'Blue Ridge Concrete',Masonry:'Commonwealth Masonry',Foundation:'DryLine Foundation',Delivery:'Builder Supply Logistics',Framing:'Timberline Framing',Roofing:'Summit Roofing',Carpentry:'Heritage Carpentry',Mechanical:'AirFlow Mechanical',Plumbing:'Legacy Plumbing',Electrical:'BrightWire Electric',Insulation:'Thermal Shield',Milestone:'Bootstrap Build Team',Drywall:'Finish Line Drywall',Exterior:'Carolina Exteriors',Painting:'TrueCoat Painting',Flooring:'Piedmont Floors',Closeout:'Bootstrap Build Team'})[trade]||trade+' Partner';}
  function seedTasks(){return [
    ['clearing','Clearing & erosion control','Sitework',0,2,'site'],['layout','House layout & utility locate','Survey',1,1,'inspection'],['excavation','Excavation','Sitework',3,2,'site'],['footers','Footers formed & poured','Concrete',5,2,'work'],['footing-insp','Footing inspection','Inspection',7,1,'inspection'],['foundation','Foundation block','Masonry',8,3,'work'],['foundation-insp','Foundation inspection','Inspection',11,1,'inspection'],['waterproof','Waterproofing & drain tile','Foundation',11,2,'site'],['backfill','Backfill & rough grade','Sitework',13,2,'site'],['slab-prep','Slab prep','Concrete',14,2,'work'],['slab-insp','Slab inspection','Inspection',16,1,'inspection'],['slab','Garage slab','Concrete',17,1,'work'],['lumber','Lumber delivery','Delivery',18,1,'delivery'],['framing','Floor system & framing','Framing',19,7,'work'],['frame-check','Frame quality check','Inspection',25,1,'inspection'],['roof','Roof dry-in','Roofing',25,3,'site'],['windows','Windows & exterior doors','Carpentry',27,2,'site'],['rough-hvac','HVAC rough-in','Mechanical',28,3,'work'],['rough-plumb','Plumbing rough-in','Plumbing',29,3,'work'],['rough-electric','Electrical rough-in','Electrical',31,3,'work'],['rough-inspections','Rough trade inspections','Inspection',34,2,'inspection'],['insulation','Air seal & insulation','Insulation',36,3,'work'],['predrywall','Pre-drywall meeting','Milestone',38,1,'milestone'],['drywall-delivery','Drywall delivery','Delivery',39,1,'delivery'],['drywall','Drywall hang & finish','Drywall',40,6,'work'],['exterior','Siding & exterior trim','Exterior',41,5,'site'],['prime','Prime & first paint','Painting',46,3,'work'],['cabinets','Cabinets & interior trim','Carpentry',47,4,'work'],['hard-surface','Hard-surface install','Flooring',49,3,'work'],['mep-final','MEP final fixtures','Mechanical',50,4,'work'],['appliances','Appliance delivery & install','Delivery',53,2,'delivery'],['carpet','Carpet','Flooring',54,2,'work'],['driveway','Driveway & exterior concrete','Concrete',54,3,'site'],['final-grade','Final grade & landscaping','Sitework',56,3,'site'],['final-insp','Final inspections','Inspection',57,2,'inspection'],['punch','Punchout','Closeout',57,3,'work'],['final-clean','Final clean','Closeout',59,1,'work'],['settlement','Settlement','Milestone',59,1,'milestone']
  ].map(([id,title,trade,start,duration,type])=>({id,title,trade,start,duration,type,vendor:vendorFor(trade)}));}
  function fresh(meta){const tasks=newProjectKey.test(meta.id)?[]:seedTasks();tasks.forEach(task=>{task.plannedDuration=task.duration;task.baselineStart=task.start;});return {version:5,planningWeeks:12,projectId:meta.id,hierarchy:{region:meta.region,division:meta.division,community:meta.community,lot:meta.lot,unit:meta.unit},tasks,acceleratedDays:[],activity:[],updatedAt:null,revision:0};}
  function normalize(value,meta){if(!value||!Array.isArray(value.tasks))return null;value.version=5;value.projectId=meta.id;value.hierarchy={region:meta.region,division:meta.division,community:meta.community,lot:meta.lot,unit:meta.unit};value.activity=Array.isArray(value.activity)?value.activity:[];value.acceleratedDays=Array.isArray(value.acceleratedDays)?value.acceleratedDays:[];value.revision=Number(value.revision||0);value.tasks.forEach(task=>{task.vendor=task.vendor||vendorFor(task.trade);task.plannedDuration=Math.max(1,Number(task.plannedDuration||task.duration||1));task.acceleratedAssignments=Array.isArray(task.acceleratedAssignments)?task.acceleratedAssignments:[];});return value;}
  function openDb(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('IndexedDB unavailable'));return;}const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE,{keyPath:'projectId'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Schedule database unavailable'));});return dbPromise;}
  async function dbRead(id){const db=await openDb();return new Promise((resolve,reject)=>{const request=db.transaction(DB_STORE,'readonly').objectStore(DB_STORE).get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});}
  async function dbWrite(value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  function localRead(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
  function localWrite(value){localStorage.setItem(STORE_PREFIX+value.projectId,JSON.stringify(value));}
  function newer(a,b) {
    return a && (!b || a.revision>b.revision ||
      (a.revision===b.revision && String(a.updatedAt||'')>String(b.updatedAt||'')));
  }
  async function loadProject(meta) {
    let database=null;
    try { database=normalize(await dbRead(meta.id),meta); } catch (_) {}
    const mirror=normalize(localRead(STORE_PREFIX+meta.id),meta);
    const useMirror=newer(mirror,database);
    let value=useMirror?mirror:database;
    let source=useMirror?'local mirror':'database';
    if (!value && meta.id==='1234-A') {
      value=normalize(localRead(LEGACY_STORE),meta);
      source='recovered prior schedule';
    }
    if (!value) { value=fresh(meta); source='new'; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value.planStart||'')) {
      const day=defaultAnchor(meta);
      value.planStart=[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-');
    }
    value._source=source;
    return value;
  }
  async function hydrate(entry) {
    await saveQueue;
    await discoverProjects();
    const values=await Promise.all(projects.map(loadProject));
    if(visit===entry) for(const value of values) cache.set(value.projectId,value);
  }
  const lastSave=new WeakMap();
  function persist(message,edited=state) {
    if(!edited) return Promise.resolve(false);
    const meta=project(edited.projectId);
    const copy=JSON.parse(JSON.stringify(edited));
    delete copy._source;
    lastSave.set(edited,copy);
    const save=async()=>{
      if(cache.get(meta.id)!==edited) return false;
      const stored=await loadProject(meta);
      if(stored.revision!==edited.revision || stored.updatedAt!==edited.updatedAt) {
        cache.set(meta.id,stored);
        if(state===edited) {
          closeMove();dismissEditor();if(el('deskUpdates').open)el('deskUpdates').close();state=stored;selectedId='';renderSchedule();
          el('scheduleJoeRetry').hidden=true;
          status('Another view saved this schedule. Its latest revision is open. Review it before applying your change again.');
        }
        return false;
      }
      copy.revision=edited.revision+1;
      copy.updatedAt=new Date().toISOString();
      let localOk=false,dbOk=false;
      try { localWrite(copy);localOk=true; } catch (_) {}
      try { await dbWrite(copy);dbOk=true; } catch (_) {}
      if(!localOk&&!dbOk) throw Error('Device storage unavailable');
      edited.revision=copy.revision;edited.updatedAt=copy.updatedAt;
      if(state===edited && lastSave.get(edited)===copy) {
        el('scheduleJoeRetry').hidden=true;
        status((message?message+' ':'')+'Saved on this device.');
      }
      return true;
    };
    const run=()=>navigator.locks?.request?navigator.locks.request('schedulejoe-'+meta.id,save):save();
    saveQueue=saveQueue.then(run).catch(()=>{
      if(state===edited && lastSave.get(edited)===copy) {
        el('scheduleJoeRetry').hidden=false;
        status('This change is still in this view. Retry saving before you leave.');
      }
      return false;
    });
    return saveQueue;
  }

  function defaultAnchor(meta){
    if(meta.initialMonday)return new Date(meta.initialMonday+'T12:00:00');
    const date=new Date();
    date.setHours(12,0,0,0);
    date.setDate(date.getDate()-(date.getDay()+6)%7);
    return date;
  }
  function anchor(meta) {
    const saved=cache.get(meta.id)?.planStart;
    return saved?new Date(saved+'T12:00:00'):defaultAnchor(meta);
  }
  function workDate(index,meta=project(activeId)){const date=anchor(meta),weeks=Math.floor(index/5),weekday=index%5;date.setDate(date.getDate()+weeks*7+weekday);return date;}
  function labelDate(index,weekday=false,meta=project(activeId)){return workDate(index,meta).toLocaleDateString(undefined,weekday?{weekday:'short',month:'short',day:'numeric'}:{month:'short',day:'numeric'});}
  function status(message){if(el('bootstrapScheduleStatus'))el('bootstrapScheduleStatus').textContent=message;}
  function calendarText(value) {
    return String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,'')
      .replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  }
  function foldCalendarLine(line,utf8=new TextEncoder()) {
    if(utf8.encode(line).length<=75)return line;
    let folded='',size=0;
    for(const character of line){
      const width=utf8.encode(character).length;
      if(size+width>75){folded+='\r\n ';size=1;}
      folded+=character;size+=width;
    }
    return folded;
  }
  async function makeLotCalendar(meta,record){
    const definitions=seedTasks(),titles=new Set(definitions.map(t=>t.title)),trades=new Set(definitions.map(t=>t.trade));
    const shifts=new Map((record.acceleratedDays||[]).map(shift=>[shift.id,shift]));
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const label='Lot '+meta.lot+(meta.unit?' · Unit '+meta.unit:'');
    const revision=Number.isSafeInteger(record.revision)&&record.revision>=0?record.revision:0;
    const header=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ScheduleJoe//Lot calendar//EN','CALSCALE:GREGORIAN','X-WR-CALNAME:'+calendarText('ScheduleJoe · '+label)];
    // Build every date and public-facing label from this snapshot before awaiting any digests.
    const tasks=record.tasks.map((task,i)=>{
      const start=Number(task.start),length=Number(task.duration??1);
      if(!Number.isInteger(start)||!Number.isInteger(length)||start<0||length<1||start+length>MAX_WEEKS*5)
        throw Error('A task has dates outside the schedule. Review its start and duration.');
      // Free-form titles, notes and trades can contain a person's name, company or address.
      const category=trades.has(task.trade)?task.trade:Object.hasOwn(kindNames,task.type)?kindNames[task.type]:'Work';
      const title=titles.has(task.title)?task.title:category+' task '+(i+1);
      const events=[];
      function add(key,summary,first,last,commitment){
        const end=new Date(last);end.setDate(end.getDate()+1);
        const beginDate=isoDate(first),endDate=isoDate(end);
        if(!/^\d{4}-\d{2}-\d{2}$/.test(beginDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate))throw Error('Review the lot’s schedule start date.');
        events.push({key,summary,start:beginDate.replace(/-/g,''),end:endDate.replace(/-/g,''),commitment});
      }
      for(let day=start,segment=0;day<start+length;segment++){
        const next=Math.min(start+length,day+5-day%5);
        add('w'+segment,title,workDate(day,meta),workDate(next-1,meta),'');
        day=next;
      }
      for(const id of new Set(task.acceleratedAssignments||[])){
        const shift=shifts.get(id);
        if(!shift||!Number.isInteger(shift.week)||shift.week<0||shift.week>=MAX_WEEKS||!['sat','sun'].includes(shift.day))continue;
        const date=workDate(shift.week*5,meta);
        date.setDate(date.getDate()+(shift.day==='sun'?6:5));
        const shiftLabel=shift.shift==='am'?'AM':shift.shift==='pm'?'PM':'Full day';
        const confirmed=shift.commitment==='confirmed';
        add('s'+shift.week+shift.day,title+' · '+shiftLabel+' · '+(confirmed?'Confirmed':'Proposed'),date,date,confirmed?'CONFIRMED':'TENTATIVE');
      }
      return {identity:JSON.stringify([meta.id,task.id??i]),events};
    });
    const encoded=new TextEncoder();
    const sections=await Promise.all(tasks.map(async task=>{
      const digest=await crypto.subtle.digest('SHA-256',encoded.encode(task.identity));
      const uid=Array.from(new Uint8Array(digest).subarray(0,16),v=>v.toString(16).padStart(2,'0')).join('');
      const lines=[];
      for(const e of task.events){
        lines.push('BEGIN:VEVENT','UID:'+uid+'-'+e.key+'@schedulejoe.invalid','DTSTAMP:'+stamp,'SEQUENCE:'+revision,
          'DTSTART;VALUE=DATE:'+e.start,'DTEND;VALUE=DATE:'+e.end,'SUMMARY:'+calendarText(e.summary),'CLASS:PRIVATE','TRANSP:TRANSPARENT');
        if(e.commitment)lines.push('STATUS:'+e.commitment);
        lines.push('END:VEVENT');
      }
      return lines;
    }));
    return header.concat(...sections,'END:VCALENDAR').map(line=>foldCalendarLine(line,encoded)).join('\r\n')+'\r\n';
  }
  async function downloadLotCalendar(){
    const entry=visit,id=activeId,record=state,meta=project(id),button=el('deskCalendarExport');
    const inLot=()=>current(entry)&&id===activeId&&record===state&&id===meta.id&&record.projectId===id&&el('bootstrapSchedule').open;
    if(!id||!record||!inLot()||button.disabled)return;
    if(!record.tasks.length){status('There are no tasks in this lot to export.');return;}
    if(!/^\d{4}$/.test(meta.lot)||!/^([A-Z0-9])?$/.test(meta.unit||'')){status('Review the lot and unit before exporting.');return;}
    button.disabled=true;
    try{
      const content=await makeLotCalendar(meta,record);
      if(!inLot())return;
      const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
      const link=document.createElement('a');
      link.href=url;link.download='ScheduleJoe-Lot-'+meta.lot+(meta.unit?'-Unit-'+meta.unit:'')+'.ics';
      document.body.appendChild(link);
      try{link.click();status('Calendar prepared for this lot’s '+record.tasks.length+' scheduled task'+(record.tasks.length===1?'':'s')+'.');}
      finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
    }catch(error){if(inLot())status(error.message?.startsWith('A task has')||error.message?.startsWith('Review')?error.message:'The calendar could not be prepared. Reopen this schedule and try again.');}
    finally{button.disabled=false;}
  }
  function install(){el('bootstrapSchedule')?.remove();document.body.insertAdjacentHTML('beforeend',`<dialog id="bootstrapSchedule" class="bootstrap-schedule bootstrap-build-schedule hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-label="ScheduleJoe construction schedules"><div class="bootstrap-schedule-shell"><header class="bootstrap-schedule-head"><img src="bootstrap_build_horizontal.png" alt="Bootstrap Build"><div><small>BOOTSTRAP BUILD · ADMIRAL PROGRAM</small><h2 id="bootstrapScheduleTitleHeading">ScheduleJoe</h2><p id="bootstrapScheduleSubtitle">Choose a lot and unit to open its independent schedule.</p></div><div class="bootstrap-schedule-head-actions"><button id="bootstrapProjectsHome" class="hidden" type="button">ALL PROJECTS</button><button id="scheduleJoeFleet" type="button">FLEET REGISTRY</button><button id="bootstrapScheduleClose" type="button">CLOSE</button></div></header><section id="bootstrapProjectLanding" class="bootstrap-project-landing">
  <div class="bootstrap-roster-summary"><strong id="rosterTotal">Projects on this device</strong>
    <div class="roster-views" role="group" aria-label="Project list view"><button type="button" id="fieldView" aria-pressed="true">Field view</button><button type="button" id="summaryView" aria-pressed="false">Summary view</button></div>
    <button type="button" id="addRosterProject" class="desk-primary">+ Add project</button>
    <details id="rosterColumns"><summary>Columns <b id="rosterCount"></b></summary>
      <div class="roster-picker">
        <label class="roster-search">Find a column<input id="rosterFind" type="search" placeholder="Name, date, vendor…" autocomplete="off"></label>
        <div id="rosterChoices"></div><p id="rosterNoMatch" hidden>No matching columns.</p>
        <div class="roster-picker-footer"><button id="rosterAll" type="button">Show all</button><button id="rosterDefaults" type="button">Reset view</button><button id="rosterDone" type="button">Done</button></div>
        <small>Personal view on this device</small>
      </div>
    </details>
  </div>
  <div class="crew-search"><label for="crewQuery">Find work</label><input type="search" id="crewQuery" placeholder="Lot, task or vendor" autocomplete="off"><button type="button" id="crewClear" hidden>Clear</button></div>
  <section id="crewResults" hidden aria-label="Search results"><p id="crewCount" role="status"></p><div id="crewMatches"></div></section>
  <p id="rosterNotice" role="status"></p>
  <div class="bootstrap-project-roster-wrap" tabindex="0" role="region" aria-label="Project summary columns"><table class="bootstrap-project-roster" aria-label="Project schedules"><thead><tr id="rosterHeaders"></tr></thead><tbody id="bootstrapProjectRows"></tbody></table></div>
<div class="joe-example-link"><span>Example home build · 18 weeks</span><button id="joeExample" type="button">Explore example →</button></div></section><section id="joeLongview" hidden aria-label="Four-week lookahead">
  <div class="joe-look-head"><div><small>FOUR-WEEK LOOKAHEAD</small><h2 id="joeLookTitle" tabindex="-1"></h2></div>
    <nav aria-label="Lookahead navigation"><button id="joePrev" type="button">← Earlier</button><button id="joeNext" type="button">Later →</button></nav></div>
  <div class="joe-choices"><label>Starting week<select id="joeWeekJump"></select></label><label>Milestone<select id="joeJump"></select></label></div>
  <div id="joeWeeks"></div>
</section>
<dialog id="joeMove" aria-labelledby="joeMoveTitle">
  <small id="joeMoveLot"></small><h2 id="joeMoveTitle" tabindex="-1" autofocus>Move other tasks too?</h2>
  <label id="joeForwardLabel"><input type="checkbox" id="joeForward"><span id="joeForwardText"></span></label>
  <div id="joeScope" role="group" aria-labelledby="joeMoveTitle">
    <button type="button" data-move-scope="one">This task only</button>
    <button type="button" data-move-scope="interior">Interior</button>
    <button type="button" data-move-scope="exterior">Exterior</button>
    <button type="button" data-move-scope="all">All</button>
  </div>
  <p id="joeMoveSummary" role="status"></p>
  <div class="joe-move-actions"><button id="joeCancel" type="button">Cancel</button></div>
</dialog>
<dialog id="newLotDialog" aria-labelledby="newLotTitle">
  <form id="newLotForm">
    <header><h2 id="newLotTitle" tabindex="-1" autofocus>Add project</h2></header>
    <p>Start an empty schedule for a lot on this device.</p>
    <div class="new-lot-grid">
      <label>Region<input name="region" readonly></label>
      <label>Division<input name="division" required pattern="[A-Za-z0-9]{3}" minlength="3" maxlength="3" title="3 letters or digits" autocapitalize="characters"></label>
      <label>Community<input name="community" required pattern="[A-Za-z0-9]{2}" minlength="2" maxlength="2" title="2 letters or digits" autocapitalize="characters"></label>
      <label>Lot number<input name="lot" required inputmode="numeric" pattern="[0-9]{4}" maxlength="4" title="4 digits" placeholder="1236"></label>
      <label>Unit (optional)<input name="unit" pattern="[A-Za-z0-9]" maxlength="1" title="1 letter or digit" autocapitalize="characters"></label>
      <label>Project start<input name="startDate" type="date" required></label>
    </div>
    <p id="newLotStatus" role="status"></p>
    <footer><button id="newLotCancel" type="button">Cancel</button><button id="newLotSave" type="submit" class="desk-primary">Create project</button></footer>
  </form>
</dialog>
<dialog id="rosterDetails" aria-labelledby="rosterDetailsTitle">
  <form id="rosterDetailsForm">
    <header><div><small>Project details</small><h2 id="rosterDetailsTitle" tabindex="-1" autofocus></h2></div><button id="rosterDetailsClose" type="button">Close</button></header>
    <p>Enter the reported values for this lot. A dash in the project list means a value is unavailable.</p>
    <div id="rosterFields"></div>
    <footer><span id="rosterDetailStatus" role="status"></span><button id="rosterSave" type="submit" class="desk-primary">Save details</button></footer>
  </form>
</dialog>
<dialog id="joeEditor" aria-labelledby="deskEditorTitle">
  <form id="bootstrapScheduleForm">
    <header><div><small id="deskLot"></small><h2 id="deskEditorTitle" tabindex="-1" autofocus></h2></div><button type="button" id="bootstrapScheduleCancel" aria-label="Close task editor">Close</button></header>
    <label>Task name<input id="bootstrapScheduleTaskTitle" maxlength="100" required autocomplete="off" placeholder="e.g. Footing inspection"></label>
    <div class="desk-fields"><label>Start date<input id="bootstrapScheduleDay" type="date" required></label><label>Duration in workdays<input id="bootstrapScheduleDuration" type="number" min="1" max="260" step="1" required></label></div>
    <p id="deskFinish" role="status"></p>
    <label>Vendor or crew<input id="deskVendor" list="deskCrews" maxlength="100" placeholder="Choose or enter a crew" autocomplete="off"><datalist id="deskCrews"></datalist></label>
    <div class="desk-fields"><label>Work area<select id="joeAreaNew">${areaOptions}</select></label><label>Task type<select id="bootstrapScheduleType">${Object.entries(kindNames).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label></div>
    <details><summary>Task details</summary><label>Trade<input id="bootstrapScheduleTrade" maxlength="60" placeholder="e.g. Concrete"></label><p id="deskBaseline"></p><button type="button" id="deskWeekend">Assign a weekend shift…</button></details>
    <footer><span id="deskTaskWarning"></span><button id="deskSave" class="desk-primary" type="submit">Save task</button></footer>
  </form>
</dialog>
<dialog id="deskUpdates" aria-labelledby="deskUpdatesTitle">
  <header><div><small>ScheduleJoe · All project schedules on this device</small><h2 id="deskUpdatesTitle">Daily vendor digests</h2></div><button id="deskUpdatesClose" type="button">Close</button></header>
  <p class="desk-digest-rule">One digest per vendor at the 4:00 p.m. Eastern cutoff. Each task shows its latest dates. Later changes roll into the next day.</p><label>Vendor<select id="deskRecipient"></select></label>
  <div id="deskAddressRow"><label>Email for this vendor<input id="deskAddress" type="email" autocomplete="off" maxlength="254" placeholder="crew@example.com"></label><button id="deskSaveAddress" type="button">Save address</button></div>
  <div id="deskPacket"></div>
  <div id="deskSendControls"><button type="button" id="deskMail" class="desk-primary">Prepare daily email</button></div>
  <p id="deskSendStatus" role="status"></p>
</dialog>
<section id="bootstrapProjectWorkspace" class="hidden">
  <nav class="desk-nav" aria-label="Schedule weeks">
    <div><select aria-label="Jump to workweek" id="scheduleJoeWeek"></select><button type="button" data-week-step="-1" aria-label="Previous workweek">‹</button><button type="button" data-week-step="1" aria-label="Next workweek">›</button></div>
    <div><label class="desk-prompt"><input id="joePrompt" type="checkbox" role="switch">Prompt on move</label><button id="deskUpdatesOpen" type="button">Vendor updates</button><button id="bootstrapScheduleAdd" class="desk-primary" type="button">+ Add task</button></div>
  </nav>
  <div id="bootstrapScheduleBoard" class="bootstrap-ground-board" role="region" aria-label="Scrollable workweeks" tabindex="0"></div>
  <div class="desk-feedback"><p id="bootstrapScheduleStatus" role="status"></p><button id="scheduleJoeRetry" type="button" hidden>Retry save</button></div>
  <details id="deskSettings"><summary>Schedule options</summary>
    <div class="bootstrap-schedule-toolbar"><div><strong id="bootstrapScheduleRange"></strong></div><label>Filter by vendor<select id="bootstrapVendorView"></select></label>
      <div><button id="joeLook" type="button">Four-week lookahead</button><button id="joeExtend" type="button">Add 4 weeks</button><button id="bootstrapScheduleReset" type="button">Reset this project</button></div></div>
    <div class="bootstrap-schedule-toolbar"><div><strong>Lot calendar</strong><p id="deskCalendarHelp">All workweeks and assigned weekend shifts, across vendors. Custom tasks use trade or task-type labels. Contacts, addresses and notes stay out of the file.</p></div><button type="button" id="deskCalendarExport" aria-describedby="deskCalendarHelp">Download lot calendar (.ics)</button></div>
  </details>
  <details id="deskHistory"><summary>Change history</summary><div id="bootstrapVendorActivityPanel" class="bootstrap-vendor-activity"><div id="bootstrapVendorActivity"></div></div></details>
</section>
</div></dialog>`);}
  let draft=null;
  const isoDate=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const fullDate=day=>workDate(day).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  function workIndex(value) {
    const distance=(Date.parse(value+'T00:00:00Z')-Date.parse(isoDate(workDate(0))+'T00:00:00Z'))/86400000;
    if(!Number.isInteger(distance)||distance<0||distance%7>4)return -1;
    return Math.floor(distance/7)*5+distance%7;
  }
  function dismissEditor() {
    draft=null;
    if(el('joeEditor').open)el('joeEditor').close();
  }
  function openEditor(task,day) {
    if(!state||!current(visit)||el('joeEditor').open)return;
    draft={record:state,task};
    selectedId=task?.id||'';
    const form=el('bootstrapScheduleForm');
    form.reset();form.querySelector('details').open=false;
    el('deskEditorTitle').textContent=task?'Edit task':'Add task';
    el('deskLot').textContent=lotLabel();
    el('deskWeekend').hidden=!task||task.locked===true||task.complete===true;
    el('bootstrapScheduleTaskTitle').value=task?.title||'';
    el('bootstrapScheduleTrade').value=task?.trade||'';
    el('deskCrews').innerHTML=vendors().map(name=>`<option value="${esc(name)}"></option>`).join('');
    el('deskVendor').value=task?.vendor||vendorView||'';
    el('bootstrapScheduleType').value=task?.type||'work';el('joeAreaNew').value=task?areaOf(task):'general';
    const input=el('bootstrapScheduleDay');
    input.min=isoDate(workDate(0));input.max=isoDate(workDate(MAX_WEEKS*5-1));
    input.value=isoDate(workDate(task?.start??day));el('bootstrapScheduleDuration').value=task?.duration||1;
    el('deskBaseline').textContent=task?'Original plan · '+(Number.isInteger(task.baselineStart)?fullDate(task.baselineStart):'Date unrecorded')+' · '+task.plannedDuration+' workday(s)':'';
    el('joeEditor').showModal();refreshEditor();
  }
  function editorValues() {
    return {title:el('bootstrapScheduleTaskTitle').value.trim(),start:workIndex(el('bootstrapScheduleDay').value),
      duration:el('bootstrapScheduleDuration').valueAsNumber,vendor:el('deskVendor').value.trim()||'Unassigned',
      trade:el('bootstrapScheduleTrade').value.trim(),area:el('joeAreaNew').value,type:el('bootstrapScheduleType').value};
  }
  function refreshEditor() {
    if(!draft)return;
    const v=editorValues(),fixed=draft.task?.locked===true||draft.task?.complete===true;
    let error='';
    if(v.start<0)error='Choose a weekday on or after '+fullDate(0)+'.';
    else if(!Number.isInteger(v.duration)||v.duration<1)error='Enter a whole number of workdays.';
    else if(v.start+v.duration>MAX_WEEKS*5)error='The task must finish within the 52-week planning window.';
    el('deskFinish').textContent=error||'Finishes '+fullDate(v.start+v.duration-1)+(v.start+v.duration>weekCount()*5?' · Extends the planning window':'');
    const overlap=v.vendor!=='Unassigned'&&state.tasks.find(t=>t!==draft.task&&t.vendor===v.vendor&&t.start<v.start+v.duration&&v.start<t.start+t.duration);
    el('deskTaskWarning').textContent=fixed?'This task is locked or complete.':!error&&overlap?'Crew also scheduled on '+overlap.title+'.':'';
    el('deskSave').disabled=!!error||fixed||!v.title;
    el('deskSave').textContent=draft.task?'Save changes':'Add task';
  }
  function saveEditor(event) {
    event.preventDefault();
    if(!draft||draft.record!==state||!current(visit))return;
    refreshEditor();if(el('deskSave').disabled)return;
    const values=editorValues(),old=draft.task;
    if(old&&values.start!==old.start&&el('joePrompt').checked){openMove(old,values.start,values);return;}
    if(old&&Object.keys(values).every(key=>values[key]===(key==='area'?areaOf(old):old[key]))){dismissEditor();return;}
    const task=old||{id:'task-'+crypto.randomUUID(),baselineStart:values.start,plannedDuration:values.duration,acceleratedAssignments:[]};
    const before=old?{...old}:null;
    Object.assign(task,values);
    if(!old)state.tasks.push(task);
    state.planningWeeks=Math.max(weekCount(),Math.ceil((task.start+task.duration)/5));
    recordTaskChange(before,task);finishEdit(task);
    void persist(task.title+' '+(old?'updated.':'added.'));
  }
  function finishEdit(task) {
    for(const t of state.tasks)t.riskWarnings=riskWarnings(t);
    dismissEditor();
    if(vendorView&&task.vendor!==vendorView)vendorView='';
    const week=Math.floor(task.start/5);
    if(segmentsForWeek(week).segments.some(s=>s.task===task&&s.lane>=2))expandedWeeks.add(week);
    renderSchedule();jumpWeek(week);
  }
  const lotLabel=()=>projectLabel(project(activeId));
  const dateRange=t=>fullDate(t.start)+(t.duration>1?' – '+fullDate(t.start+t.duration-1):'');
  function recordTaskChange(before,task) {
    const was=before?dateRange(before):'',now=dateRange(task);
    const switchover=before&&before.vendor!==task.vendor;
    const description=before?(was===now?'Scheduled '+now:was+' → '+now):'New task · '+now;
    const extra=[];
    if(before&&before.title!==task.title)extra.push('Previously '+before.title);
    if(switchover)extra.push('Crew changed from '+before.vendor+' to '+task.vendor);
    const note={id:crypto.randomUUID(),at:new Date().toISOString(),type:'task-update',task:task.title,vendor:task.vendor,summary:[description,...extra].join('. ')};
    state.activity.unshift(note);
    const notices=state.vendorNotices??=[];
    function queue(vendor,summary,startPlan,endPlan) {
      if(vendor&&vendor!=='Unassigned')notices.push({...note,id:crypto.randomUUID(),taskId:task.id,vendor,summary,before:startPlan,after:endPlan});
    }
    if(switchover)queue(before.vendor,'Assignment removed · previously '+was,was,null);
    queue(task.vendor,switchover?'Assigned to your crew · '+now+(was!==now?' (previously '+was+')':''):description+(extra.length?'. '+extra.join('. '):''),switchover||!before?null:was,now);
  }
  function queueVendorNotice(task,summary,shiftKey) {
    if(task.vendor&&task.vendor!=='Unassigned')(state.vendorNotices??=[]).push({id:crypto.randomUUID(),at:new Date().toISOString(),task:task.title,taskId:task.id,shiftKey,vendor:task.vendor,summary});
  }
  // Keep one handoff ledger per device, independent of lot edits and project resets.
  const eastern=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function businessTime(value) {
    const p=Object.fromEntries(eastern.formatToParts(value).map(v=>[v.type,v.value]));
    return {day:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute+':'+p.second};
  }
  const vendorKey=s=>s.trim().toLowerCase();
  let ledgerDb,records=[],contacts=[],receipts=[],deliveryBusy=false,packetVersion=0,timer;
  function digestDb() {
    if(!ledgerDb)ledgerDb=new Promise((resolve,reject)=>{
      const r=indexedDB.open('scheduleJoeVendorDigests',1);
      r.onupgradeneeded=()=>{r.result.createObjectStore('contacts',{keyPath:'key'});r.result.createObjectStore('handoffs',{keyPath:'key'});};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    }).catch(err=>{ledgerDb=null;throw err;});
    return ledgerDb;
  }
  async function readAll(table) {
    const db=await digestDb();
    return new Promise((resolve,reject)=>{
      const r=db.transaction(table).objectStore(table).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });
  }
  function updateVendorCount() {el('deskUpdatesOpen').textContent='Vendor digests';}
  function contact(name) {return contacts.find(c=>c.key===vendorKey(name))?.email||'';}
  async function saveContact() {
    const input=el('deskAddress'),email=input.value.trim().toLowerCase(),name=el('deskRecipient').value;
    if(!name||!input.reportValidity()||!current(visit)||deliveryBusy)return;
    try{
      const db=await digestDb();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('contacts','readwrite'),store=tx.objectStore('contacts');
        if(email)store.put({key:vendorKey(name),email});else store.delete(vendorKey(name));
        tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error);
      });
      await refreshPacket();el('deskSendStatus').textContent='Vendor contact saved on this device.';
    }catch(_){el('deskSendStatus').textContent='Could not save the vendor address. Try again.';}
  }
  function digestGroups(rows) {
    const byTask=new Map();
    for(const n of rows){
      const key=n.projectId+'|'+(n.taskId||n.id)+'|'+(n.shiftKey||'schedule');
      const first=byTask.get(key);
      if(first){first.after=n.after;first.task=n.task;first.summary=n.summary;}
      else byTask.set(key,{...n});
    }
    const lines=[];
    for(const n of byTask.values()){
      let line=n.summary;
      if('before' in n){
        if(n.before===n.after)continue;
        if(n.before&&n.after)line=n.before+' → '+n.after;
        else line=n.after?'Scheduled · '+n.after:'Removed · previously '+n.before;
      }
      lines.push({projectId:n.projectId,task:n.task,line});
    }
    return lines.sort((a,b)=>a.projectId.localeCompare(b.projectId)||a.task.localeCompare(b.task));
  }
  function makeDigest(now=new Date()) {
    const clock=businessTime(now),name=el('deskRecipient').value,email=contact(name);
    const members=new Set([vendorKey(name),...contacts.filter(c=>email&&c.email===email).map(c=>c.key)]);
    const valid=n=>members.has(vendorKey(n.vendor));
    const previous=receipts.filter(r=>(email&&r.email===email)||r.vendors.some(k=>members.has(k)));
    const used=new Set(receipts.flatMap(r=>r.ids));
    const waiting=records.filter(n=>valid(n)&&!used.has(n.id)).sort((a,b)=>a.at.localeCompare(b.at));
    const ready=waiting.filter(n=>{
      const changed=businessTime(new Date(n.at));
      return changed.day<clock.day||(changed.day===clock.day&&changed.time<'16:00:00');
    });
    const rows=digestGroups(ready),today=previous.find(r=>r.day===clock.day);
    return {name,email,clock,ready,waiting,rows,today,previous,members};
  }
  const digestList=rows=>rows.map(r=>{
    const meta=project(r.projectId);
    return `<li><small>${esc(qualifiedLabel(meta))}</small><b>${esc(r.task)}</b><span>${esc(r.line)}</span></li>`;
  }).join('');
  function renderPacket() {
    const d=makeDigest();
    el('deskAddressRow').hidden=!d.name;el('deskAddress').value=d.email;
    const preview=d.today?.rows||d.rows;
    let label=d.today?'Prepared today':d.clock.time<'16:00:00'?'Building today’s digest':'Ready for today’s digest';
    const queued=d.today?digestGroups(d.waiting).length:digestGroups(d.waiting.filter(n=>!d.ready.includes(n))).length;
    el('deskPacket').innerHTML=(preview.length?`<h3>${label}</h3><ol>${digestList(preview)}</ol>`:'<p>No schedule changes due for this crew.</p>')+
      (queued?`<p>${queued} task update${queued===1?'':'s'} queued for the next cutoff.</p>`:'')+
      (d.previous.some(r=>r!==d.today)?'<details><summary>Earlier digests</summary>'+d.previous.filter(r=>r!==d.today).reverse().map(r=>'<h3>'+esc(r.day)+'</h3><ol>'+digestList(r.rows)+'</ol>').join('')+'</details>':'');
    const allowed=!!(d.name&&d.email&&d.rows.length&&!d.today&&d.clock.time>='16:00:00');
    el('deskMail').disabled=!allowed||deliveryBusy;
    el('deskSendStatus').textContent=d.today?'Today’s email draft has been prepared on this device.':
      !d.name?'Assigned tasks appear here when their schedule changes.':!d.email?'Save this vendor’s email address to prepare their digest.':
      d.clock.time<'16:00:00'?'Available at 4:00 p.m. Eastern.':'An email draft opens for you to review and send.';
  }
  async function refreshPacket() {
    const entry=visit,version=++packetVersion;
    await saveQueue;
    await discoverProjects();
    const [lots,addresses,history]=await Promise.all([Promise.all(projects.map(loadProject)),readAll('contacts'),readAll('handoffs')]);
    if(version!==packetVersion||!current(entry)||!el('deskUpdates').open)return;
    records=lots.flatMap(l=>(l.vendorNotices||[]).map(n=>({...n,projectId:l.projectId})));
    contacts=addresses;receipts=history;
    const picker=el('deskRecipient'),prior=picker.value,names=[...new Set(records.map(n=>n.vendor))].sort((a,b)=>a.localeCompare(b));
    picker.innerHTML=names.map(n=>'<option>'+esc(n)+'</option>').join('');picker.disabled=!names.length||deliveryBusy;
    if(names.includes(prior))picker.value=prior;
    renderPacket();
  }
  function unavailable() {
    el('deskMail').disabled=true;
    el('deskSendStatus').textContent='The saved digest history is unavailable. Reopen Vendor digests to try again.';
  }
  async function prepareDigest() {
    if(deliveryBusy||!current(visit))return;
    if(el('deskAddress').value.trim().toLowerCase()!==contact(el('deskRecipient').value)){
      el('deskSendStatus').textContent='Save the changed address first.';return;
    }
    const requested=el('deskRecipient').value,requestedEmail=contact(requested);
    deliveryBusy=true;el('deskMail').disabled=true;el('deskRecipient').disabled=true;
    const entry=visit;
    try {
      await refreshPacket();
      if(!current(entry)||!el('deskUpdates').open)return;
      const d=makeDigest();
      if(d.name!==requested||d.email!==requestedEmail||d.today||!d.email||!d.rows.length||d.clock.time<'16:00:00')return;
      const db=await digestDb(),saved={key:d.clock.day+'|'+d.email,day:d.clock.day,email:d.email,vendors:[...d.members],
        ids:d.ready.map(n=>n.id),at:new Date().toISOString(),rows:d.rows};
      // The check and reservation are one IndexedDB transaction across all tabs.
      const recorded=await new Promise((resolve,reject)=>{
        const tx=db.transaction('handoffs','readwrite'),table=tx.objectStore('handoffs'),r=table.getAll();let inserted=false;
        r.onsuccess=()=>{
          const conflict=r.result.some(h=>h.day===saved.day&&(h.email===saved.email||h.vendors.some(k=>d.members.has(k))));
          if(conflict||!current(entry)||!el('deskUpdates').open)return;
          table.add(saved);inserted=true;
        };
        tx.oncomplete=()=>resolve(inserted);tx.onerror=tx.onabort=()=>reject(tx.error);
      });
      if(recorded&&current(entry)&&el('deskUpdates').open){
        const subject='ScheduleJoe · '+d.name+' · '+saved.day;
        const body=d.rows.map(r=>{const p=project(r.projectId);return qualifiedLabel(p)+' · '+r.task+'\n'+r.line;}).join('\n\n');
        const uri='mailto:'+encodeURIComponent(d.email).replace('%40','@')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
        if(uri.length<=1800)window.location.href=uri;
        else {
          const encoded=s=>btoa(Array.from(new TextEncoder().encode(s),n=>String.fromCharCode(n)).join(''));
          const mime='X-Unsent: 1\r\nTo: '+d.email+'\r\nSubject: =?UTF-8?B?'+encoded(subject)+'?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+encoded(body).match(/.{1,76}/g).join('\r\n');
          const a=document.createElement('a'),url=URL.createObjectURL(new Blob([mime],{type:'message/rfc822'}));
          a.href=url;a.download='ScheduleJoe-'+saved.day+'.eml';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
        }
      }
      await refreshPacket();
    }catch(_){unavailable();return;}
    finally{
      deliveryBusy=false;
      el('deskRecipient').disabled=!el('deskRecipient').options.length;
    }
    if(current(entry)&&el('deskUpdates').open)renderPacket();
  }
  function bindUpdates() {
    el('deskUpdatesOpen').onclick=()=>{
      if(!current(visit))return;
      el('deskRecipient').replaceChildren();el('deskPacket').replaceChildren();
      el('deskAddressRow').hidden=true;el('deskMail').disabled=true;el('deskSendStatus').textContent='Loading vendor updates…';
      el('deskUpdates').showModal();void refreshPacket().catch(unavailable);
      let slot='';
      timer=setInterval(()=>{
        const b=businessTime(new Date()),next=b.day+String(b.time>='16:00:00');
        if(slot&&slot!==next)void refreshPacket().catch(unavailable);slot=next;
      },1000);
    };
    el('deskUpdatesClose').onclick=()=>el('deskUpdates').close();
    el('deskUpdates').onclose=()=>{clearInterval(timer);++packetVersion;records=[];};
    el('deskRecipient').onchange=renderPacket;el('deskSaveAddress').onclick=saveContact;el('deskMail').onclick=prepareDigest;
  }
  function wireLongview() {
    const listen=(id,event,fn)=>el(id).addEventListener(event,fn);
    listen('joeExample','click',()=>{if(current(visit))openLook(example);});
    listen('joeLook','click',()=>{if(state)openLook(state,selectedWeek==='all'?0:selectedWeek);});
    listen('joeWeekJump','change',e=>{lookWeek=Number(e.target.value);renderLook();});
    listen('joeJump','change',e=>{if(e.target.value!==''){lookWeek=Number(e.target.value);renderLook();}});
    for(const [id,step] of [['joePrev',-4],['joeNext',4]])listen(id,'click',()=>{
      lookWeek=Math.max(0,Math.min(weekCount(lookRecord)-1,lookWeek+step));renderLook();
    });
    listen('joeWeeks','click',e=>{
      const button=e.target.closest('[data-edit-week]');if(!button||!state||lookRecord!==state)return;
      el('joeLongview').hidden=true;lookRecord=null;el('bootstrapProjectWorkspace').classList.remove('hidden');
      el('bootstrapSchedule').classList.add('desk-open');const week=Number(button.dataset.editWeek);
      renderSchedule();jumpWeek(week);el('bootstrapSchedule').scrollTop=0;el('scheduleJoeWeek').focus({preventScroll:true});
    });
    listen('joeExtend','click',()=>{
      if(!state||weekCount()>=MAX_WEEKS)return;
      const previous=weekCount();state.planningWeeks=Math.min(MAX_WEEKS,previous+4);
      renderSchedule();jumpWeek(previous);void persist('Planning window extended to '+state.planningWeeks+' weeks.');
    });
    listen('joePrompt','change',()=>{
      if(!state)return;
      status(el('joePrompt').checked?'Prompt on. Choose which other tasks move with this one.':'Prompt off. A move changes the selected task only.');
    });
    el('bootstrapScheduleForm').addEventListener('input',refreshEditor);
    el('bootstrapScheduleForm').addEventListener('submit',saveEditor);
    el('joeEditor').addEventListener('cancel',e=>{e.preventDefault();dismissEditor();});
    el('bootstrapScheduleBoard').addEventListener('scroll',syncWeek,{passive:true});
    const layout=new ResizeObserver(fitCalendar);
    layout.observe(el('bootstrapSchedule').querySelector('.bootstrap-schedule-head'));
    layout.observe(el('bootstrapProjectWorkspace').querySelector('.desk-nav'));
    window.addEventListener('resize',fitCalendar);
    el('deskWeekend').onclick=()=>{
      if(!draft?.task)return;
      const id=draft.task.id,values=editorValues();
      if(Object.keys(values).some(key=>values[key]!== (key==='area'?areaOf(draft.task):draft.task[key]))){
        el('deskTaskWarning').textContent='Save your task changes before assigning a weekend shift.';return;
      }
      dismissEditor();selectedId=id;el('deskSettings').open=true;
      if(el('bootstrapAcceleratedPanel').classList.contains('hidden'))el('bootstrapAcceleratedToggle').click();
      renderAccelerated();el('bootstrapAcceleratedWeek').focus();
    };
    bindUpdates();
    listen('joeScope','click',event=>{
      const choice=event.target.closest('[data-move-scope]');
      if(choice)void applyMove(choice.dataset.moveScope);
    });
    listen('joeForward','change',()=>{el('joeMoveSummary').textContent='';});
    listen('joeCancel','click',closeMove);listen('joeMove','cancel',e=>{e.preventDefault();closeMove();});
  }
  function installQuickPassageControls(){
    const actions=el('bootstrapSchedule')?.querySelector('.bootstrap-schedule-toolbar>div:last-child');
    if(actions&&!el('bootstrapAcceleratedToggle'))actions.insertAdjacentHTML('afterbegin','<button id="bootstrapAcceleratedToggle" type="button" aria-expanded="false">ACCELERATED DAYS</button>');
    const toolbar=el('bootstrapSchedule')?.querySelector('.bootstrap-schedule-toolbar');
    if(toolbar&&!el('bootstrapAcceleratedPanel'))toolbar.insertAdjacentHTML('afterend','<section id="bootstrapAcceleratedPanel" class="bootstrap-accelerated-panel hidden"><header><div><small>MANAGER-CONTROLLED EXCEPTION</small><b>Activate a specific weekend shift</b><span>Monday–Friday stays standard. Weekend work remains visible, optional, and auditable.</span></div><button id="bootstrapAcceleratedClose" type="button">CLOSE</button></header><div class="bootstrap-accelerated-controls"><label>Week<select id="bootstrapAcceleratedWeek"></select></label><label>Day<select id="bootstrapAcceleratedDay"><option value="sat">Saturday</option><option value="sun">Sunday</option></select></label><label>Shift<select id="bootstrapAcceleratedShift"><option value="am">AM</option><option value="pm">PM</option><option value="full">Full day</option></select></label><label>Commitment<select id="bootstrapAcceleratedCommitment"><option value="proposed">Proposed</option><option value="confirmed">Vendor confirmed</option></select></label><button id="bootstrapAcceleratedAdd" type="button">ACTIVATE DATE</button></div><p class="bootstrap-accelerated-warning">⚠ Accelerated work may compress recovery time or create trade overlap. The manager may proceed; the exception and vendor commitment are recorded.</p><div id="bootstrapAcceleratedRows" class="bootstrap-accelerated-rows"></div></section>');

  }
  // A roster preference belongs to the signed-in user. Project details belong to the lot.
  const rosterGroups=[
    ['Project',[
      ['lotUnit','Lot / Unit'],['nextWorkday','Next workday'],['nextTask','Next task'],['nextVendor','Vendor / crew'],['nextDue','Due'],['division','Division'],['community','Comm desc'],['communityName','Community name','text'],
      ['region','Region'],['building','Building','text'],['product','Product','text'],['model','Model','text'],
      ['setVersion','Set / Version','text'],['houseType','House type','text'],['template','Template','text'],
      ['foundation','Template foundation','text'],['manager','Project manager','text'],
      ['status','Status','select',['Backlog','Under construction','Archive']],['docsUrl','Schedule docs','url']
    ]],
    ['Site',[
      ['address','Address','text'],['city','City','text'],['state','State','text'],['zip','ZIP','text'],
      ['permit','Permit','text'],['elevation','Elevation','text'],['handing','Handing','text']
    ]],
    ['Schedule',[
      ['startDate','Start','date'],['projectedPSD','Projected PSD','date'],['allowedDUC','Allowed DUC','count'],
      ['varianceDUC','DUC over / under','signed'],['endDUC','End of DUC','date'],['settlement','Settlement date','date'],
      ['currentInterior','Current interior task'],['currentExterior','Current exterior task'],
      ['planningWindow','Planning window'],['firstTask','First planned task'],['firstVendor','First task vendor'],
      ['taskCount','Scheduled tasks'],['updated','Updated']
    ]],
    ['Field tracking',[
      ['openIssues','Open issues','count'],['pjmChecklist','PJM checklist','count'],
      ['vendorChecklist','Vendor checklist','count'],['openWO','Open work orders','count'],['pendingWO','Pending work orders','count'],
      ['qaiStatus','QAI verification status','select',['Pending','Pass','Fail','Recheck']],
      ['qaiDate','QAI date','date']
    ]]
  ].map(([name,fields])=>({name,fields:fields.map(([id,label,kind,options])=>({id,label,kind,options}))}));
  const rosterFields=rosterGroups.flatMap(group=>group.fields);
  const defaultRosterColumns=['division','community','lotUnit','product','template','startDate','projectedPSD','allowedDUC',
    'currentInterior','openIssues','pjmChecklist','varianceDUC','updated','endDUC','qaiStatus'];
  const dateOnRoster=new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'});
  const fieldDay=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const fieldColumns=['lotUnit','nextWorkday','nextTask','nextVendor','nextDue'];
  let rosterRenderedDay='',rosterMode='field',rosterSelection=new Set(fieldColumns),detailDraft=null;
  const rosterModeDefaults=()=>rosterMode==='field'?fieldColumns:defaultRosterColumns;
  const modeKey=()=>rosterPrefKey()+':view';
  const columnKey=()=>rosterMode==='summary'?rosterPrefKey():rosterPrefKey()+':field';
  function rosterPrefKey(){return 'scheduleJoeRosterColumns.v1:'+visit.actor;}
  function loadRosterView(mode){
    const stored=localRead(modeKey());
    rosterMode=mode||(stored==='summary'?'summary':'field');
    const saved=localRead(columnKey());
    const known=Array.isArray(saved)?rosterFields.filter(f=>saved.includes(f.id)).map(f=>f.id):[];
    rosterSelection=new Set(Array.isArray(saved)&&(!saved.length||known.length)?known:rosterModeDefaults());
    el('rosterColumns').open=false;el('rosterFind').value='';filterRosterOptions();
    el('rosterNotice').textContent='';
  }
  function setRosterColumns(ids){
    if(!current(visit))return;
    rosterSelection=new Set(ids);
    try{localStorage.setItem(columnKey(),JSON.stringify([...rosterSelection]));}
    catch(_){el('rosterNotice').textContent='Your view is active for this visit. This browser could not save the column choices.';}
    renderLanding();
  }
  function filterRosterOptions(){
    const term=el('rosterFind').value.trim().toLowerCase();
    const groups=el('rosterChoices').querySelectorAll('fieldset');
    for(const group of groups){
      const labels=[...group.querySelectorAll('label')];
      for(const label of labels)label.hidden=!label.textContent.toLowerCase().includes(term);
      group.hidden=labels.every(label=>label.hidden);
    }
    el('rosterNoMatch').hidden=[...groups].some(group=>!group.hidden);
  }
  function rosterDocumentUrl(raw){
    try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch(_){return '';}
  }
  function rosterMilestones(meta,tasks){
    const dateFor=(id,names)=>{
      const task=tasks.find(t=>t.id===id)||tasks.find(t=>names.includes(String(t.title).trim().toLowerCase()));
      return task?isoDate(workDate(task.start,meta)):'';
    };
    return {startDate:dateFor('construction-start',['construction start','start date']),
      projectedPSD:dateFor('psd',['psd','psd (customer meeting)']),endDUC:dateFor('end-duc',['end of duc']),
      settlement:dateFor('settlement',['settlement']),qaiDate:dateFor('qai',['qai'])};
  }
  function nextWork(meta,record,today){
    const nextWeekday=new Date(today+'T12:00:00');
    const dow=nextWeekday.getDay();
    if(dow===0||dow===6)nextWeekday.setDate(nextWeekday.getDate()+(dow===0?1:2));
    const weekday=isoDate(nextWeekday);
    const shifts=new Map(record.acceleratedDays.map(s=>{
      const d=workDate(5*s.week,meta);d.setDate(d.getDate()+(s.day==='sun'?6:5));
      return [s.id,{day:isoDate(d),confirmed:s.commitment==='confirmed'}];
    }));
    let first='',work=[];
    for(const task of record.tasks){
      if(task.complete===true)continue;
      const start=isoDate(workDate(task.start,meta)),finish=isoDate(workDate(task.start+task.duration-1,meta));
      let date=finish>=weekday?(start>weekday?start:weekday):'';
      let proposed=false,due=finish;
      for(const id of task.acceleratedAssignments||[]){
        const shift=shifts.get(id);
        if(!shift)continue;
        if(shift.day>due)due=shift.day;
        if(shift.day<today)continue;
        if(!date||shift.day<date){date=shift.day;proposed=!shift.confirmed;}
        else if(shift.day===date&&shift.confirmed)proposed=false;
      }
      if(!date||(first&&date>first))continue;
      if(date!==first){first=date;work=[];}
      work.push({task,finish:due,proposed});
    }
    return {nextIds:work.map(w=>w.task.id),nextWorkday:first,nextTask:work.length?work.map(w=>w.task.title+(w.proposed?' (proposed shift)':'')):(record.tasks.length?'No upcoming work':'No tasks scheduled'),
      nextVendor:work.map(w=>w.task.vendor||'Unassigned'),nextDue:work.map(w=>fieldDay.format(new Date(w.finish+'T12:00:00')))};
  }
  function rosterFacts(meta,record,today){
    const tasks=record.tasks,details=record.rosterDetails||{};
    const first=tasks.reduce((best,t)=>!best||t.start<best.start?t:best,null);
    const dates=rosterMilestones(meta,tasks);
    for(const key of Object.keys(dates))dates[key]=dates[key]||details[key];
    dates.startDate=dates.startDate||record.planStart;
    const weekday=new Date(today+'T12:00:00').getDay();
    const weekendShifts=new Set(record.acceleratedDays.filter(shift=>{
      const day=workDate(5*shift.week,meta);day.setDate(day.getDate()+(shift.day==='sun'?6:5));return isoDate(day)===today;
    }).map(shift=>shift.id));
    const currentTasks=tasks.filter(t=>t.complete!==true&&(weekday>0&&weekday<6
      ?isoDate(workDate(t.start,meta))<=today&&isoDate(workDate(t.start+t.duration-1,meta))>=today
      :t.acceleratedAssignments?.some(id=>weekendShifts.has(id))));
    const currentArea=area=>currentTasks.filter(t=>areaOf(t)===area).map(t=>t.title).join(' · ');
    return {...details,...nextWork(meta,record,today),lotUnit:projectLabel(meta),region:meta.region,division:meta.division,community:meta.community,
      planningWindow:labelDate(0,false,meta)+' – '+labelDate(weekCount(record)*5-1,false,meta),firstTask:first?.title,firstVendor:first?.vendor,
      currentInterior:currentArea('interior'),currentExterior:currentArea('exterior'),taskCount:tasks.length,
      ...dates,
      updated:record.updatedAt?new Date(record.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Original plan'};
  }
  function rosterCell(field,value){
    if(value===null||value===undefined||value==='')return '<span class="roster-empty" aria-label="No value">—</span>';
    if(field.kind==='url'){
      const link=rosterDocumentUrl(value);
      return link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Open docs ↗</a>':'—';
    }
    if(field.kind==='date'||field.id==='nextWorkday'){
      const d=new Date(value+'T12:00:00');
      if(Number.isFinite(d.getTime()))value=(field.id==='nextWorkday'?fieldDay:dateOnRoster).format(d);
    }
    if(field.kind==='signed'&&Number(value)>0)value='+'+value;
    return esc(value);
  }
  function renderLanding(){
    rosterRenderedDay=isoDate(new Date());
    const selected=rosterFields.filter(f=>rosterSelection.has(f.id));
    const hasLot=rosterSelection.has('lotUnit');
    el('rosterTotal').textContent=projects.length+' projects on this device';
    el('fieldView').setAttribute('aria-pressed',String(rosterMode==='field'));
    el('summaryView').setAttribute('aria-pressed',String(rosterMode==='summary'));
    el('rosterCount').textContent=selected.length;
    for(const box of el('rosterChoices').querySelectorAll('input'))box.checked=rosterSelection.has(box.value);
    el('rosterHeaders').innerHTML=(hasLot?'':'<th scope="col">Schedule</th>')+selected.map(f=>'<th scope="col" data-column="'+f.id+'">'+esc(f.label)+'</th>').join('');
    el('bootstrapProjectRows').innerHTML=projects.map(meta=>{
      const record=cache.get(meta.id);
      if(!record)return '';
      const facts=rosterFacts(meta,record,rosterRenderedDay),lot=esc(projectLabel(meta)),id=esc(meta.id);
      const hasTwin=projects.some(p=>p.id!==meta.id&&p.lot===meta.lot&&p.unit===meta.unit);
      const job='<button class="roster-lot-link" type="button" data-open-project="'+id+'" aria-label="Open schedule for '+esc(qualifiedLabel(meta))+'">'+lot+'</button>'+
        (hasTwin?'<small>'+esc([meta.region,meta.division,meta.community].join(' / '))+'</small>':'')+
        '<button class="roster-details-link" type="button" data-roster-details="'+id+'" aria-label="Project details for '+esc(qualifiedLabel(meta))+'">Details</button>';
      const bookingColumns=['nextTask','nextVendor','nextDue'];
      const count=selected.some(f=>bookingColumns.includes(f.id))?Math.max(1,facts.nextVendor.length):1;
      const span=count>1?' rowspan="'+count+'"':'';
      return Array.from({length:count},(_,index)=>{
        const cells=selected.map(f=>{
          const booking=bookingColumns.includes(f.id),value=facts[f.id];
          if(index&&!booking)return '';
          let content=f.id==='lotUnit'?job:rosterCell(f,booking&&Array.isArray(value)?value[index]:value);
          if(f.id==='nextTask'&&facts.nextIds[index]){
            content=taskShortcut(meta.id,facts.nextIds[index],content);
          }
          return '<td data-column="'+f.id+'" data-label="'+esc(f.label)+'"'+(booking?'':span)+'>'+content+'</td>';
        }).join('');
        const attr=index?'data-roster-booking="'+id+'"':'data-roster-project="'+id+'"';
        return '<tr '+attr+'>'+(!hasLot&&!index?'<td class="roster-identity"'+span+'>'+job+'</td>':'')+cells+'</tr>';
      }).join('');

    }).join('');
    renderWorkSearch();
  }
  function taskShortcut(projectId,taskId,escapedLabel){
    return '<button type="button" class="crew-task" data-job="'+esc(projectId)+'" data-crew-task="'+esc(taskId)+'">'+escapedLabel+'</button>';
  }
  function renderWorkSearch(){
    const query=el('crewQuery').value.trim().toLowerCase(),results=el('crewResults');
    results.hidden=!query;el('crewClear').hidden=!query;
    el('bootstrapProjectLanding').querySelector('.bootstrap-project-roster-wrap').hidden=Boolean(query);
    if(!query){el('crewMatches').replaceChildren();el('crewCount').textContent='';return;}
    const unit=query.match(/\bunit\s+([a-z0-9])\b/);
    const address=query.match(/\b(\d{4})[-/]([a-z0-9])\b/);
    const words=query.replace(/\b(\d{4})[-/]([a-z0-9])\b/g,'$1 unit $2').split(/\s+/),matches=[];
    for(const meta of projects){
      const record=cache.get(meta.id);
      if(!record)continue;
      if(unit&&meta.unit.toLowerCase()!==unit[1])continue;
      if(address&&(meta.lot!==address[1]||meta.unit.toLowerCase()!==address[2]))continue;
      const identity=qualifiedLabel(meta),jobText=identity.toLowerCase();
      if(words.every(word=>jobText.includes(word))){
        matches.push({projectId:meta.id,identity});
        continue;
      }
      for(const task of record.tasks){
        const haystack=[jobText,task.title,task.vendor,task.trade].join(' ').toLowerCase();
        if(words.every(word=>haystack.includes(word))){
          matches.push({projectId:meta.id,identity,task,start:isoDate(workDate(task.start,meta)),end:isoDate(workDate(task.start+task.duration-1,meta))});
        }
      }
    }
    matches.sort((a,b)=>(a.start||'').localeCompare(b.start||'')||a.identity.localeCompare(b.identity));
    el('crewCount').textContent=matches.length?matches.length+(matches.length===1?' match':' matches'):'No matching work. Try a lot number, task name or vendor.';
    el('crewMatches').innerHTML=matches.map(({projectId,identity,task,start,end})=>{
      if(!task)return '<div><button type="button" class="crew-task" data-open-project="'+esc(projectId)+'">'+esc(identity)+'</button></div>';
      const day=value=>fieldDay.format(new Date(value+'T12:00:00'));
      const dates=day(start)+(end!==start?' – '+day(end):'');
      return '<div>'+taskShortcut(projectId,task.id,esc(task.title))+'<span>'+esc(identity)+'</span><span>'+esc(task.vendor||'Unassigned')+'</span><span>'+esc(dates)+(task.complete?' · Complete':'')+'</span></div>';
    }).join('');
  }
  function projectInput(f,details,dates){
    if(dates[f.id])return '<input type="date" name="'+f.id+'" value="'+esc(dates[f.id])+'" readonly><small>From the lot calendar</small>';
    const value=details[f.id]??'';
    if(f.kind==='select')return '<select name="'+f.id+'"><option value="">Not recorded</option>'+
      f.options.map(v=>'<option'+(v===value?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select>';
    let attrs='maxlength="140"';
    if(f.kind==='count'||f.kind==='signed')attrs='type="number" step="1"'+(f.kind==='count'?' min="0"':'');
    else if(f.kind==='date')attrs='type="date"';
    else if(f.kind==='url')attrs='type="url" maxlength="2048" placeholder="https://…"';
    return '<input name="'+f.id+'" '+attrs+' value="'+esc(value)+'">';
  }
  function openRosterDetails(id){
    if(!current(visit)||activeId||!cache.has(id))return;
    const record=cache.get(id),meta=project(id),details=record.rosterDetails||{};
    const dates=rosterMilestones(meta,record.tasks);
    detailDraft={record,visit};
    el('rosterDetailsTitle').textContent=projectLabel(meta);
    el('rosterFields').innerHTML=rosterGroups.map(g=>'<fieldset><legend>'+esc(g.name)+'</legend><div>'+
      g.fields.filter(f=>f.kind).map(f=>'<label>'+esc(f.label)+projectInput(f,details,dates)+'</label>').join('')+'</div></fieldset>').join('');
    el('rosterDetailStatus').textContent='';el('rosterSave').disabled=false;
    el('rosterDetails').showModal();el('rosterFields').scrollTop=0;
  }
  function dismissRosterDetails(){
    detailDraft=null;
    if(el('rosterDetails').open)el('rosterDetails').close();
  }
  async function saveRosterDetails(event){
    event.preventDefault();
    const draft=detailDraft;
    if(!draft||!current(draft.visit)||el('rosterSave').disabled)return;
    const record=draft.record,previous=record.rosterDetails||{},next={...previous};
    const form=event.currentTarget;
    const docs=form.elements.docsUrl;
    if(docs.value&&!rosterDocumentUrl(docs.value)){
      docs.setCustomValidity('Enter an HTTPS link to this project’s documents.');docs.reportValidity();return;
    }
    for(const f of rosterFields.filter(f=>f.kind)){
      if(form.elements[f.id].readOnly)continue;
      const raw=form.elements[f.id].value.trim();
      if(!raw)delete next[f.id];
      else next[f.id]=f.kind==='count'||f.kind==='signed'?Number(raw):raw;
    }
    if(JSON.stringify(previous)===JSON.stringify(next)){dismissRosterDetails();return;}
    record.rosterDetails=next;el('rosterSave').disabled=true;
    const saved=await persist('',record);
    if(!saved&&record.rosterDetails===next)record.rosterDetails=previous;
    if(detailDraft!==draft||!current(draft.visit))return;
    el('rosterSave').disabled=false;
    if(!saved&&cache.get(record.projectId)===record){
      el('rosterDetailStatus').textContent='This device could not save the details. Your entries are here to retry.';return;
    }
    dismissRosterDetails();renderLanding();
    el('rosterNotice').textContent=saved?'Project details saved for '+projectLabel(record.hierarchy)+'.':'A newer project record is open. Reopen Project details to edit it.';
    el('bootstrapProjectRows').querySelector('[data-roster-details="'+record.projectId+'"]')?.focus({preventScroll:true});
  }
  function bindRoster(){
    const chooser=el('rosterColumns'),choices=el('rosterChoices');
    choices.innerHTML=rosterGroups.map(g=>'<fieldset><legend>'+esc(g.name)+'</legend>'+g.fields.map(f=>
      '<label><input type="checkbox" value="'+f.id+'">'+esc(f.label)+'</label>').join('')+'</fieldset>').join('');
    choices.onchange=()=>setRosterColumns([...choices.querySelectorAll('input:checked')].map(box=>box.value));
    el('rosterFind').oninput=filterRosterOptions;
    el('crewQuery').oninput=renderWorkSearch;
    el('crewClear').onclick=()=>{el('crewQuery').value='';renderWorkSearch();el('crewQuery').focus();};
    el('rosterAll').onclick=()=>setRosterColumns(rosterFields.map(f=>f.id));
    el('rosterDefaults').onclick=()=>setRosterColumns(rosterModeDefaults());
    for(const mode of ['field','summary'])el(mode+'View').onclick=()=>{
      if(!current(visit)||mode===rosterMode)return;
      loadRosterView(mode);renderLanding();
      el('bootstrapProjectLanding').querySelector('.bootstrap-project-roster-wrap').scrollLeft=0;
      try{localStorage.setItem(modeKey(),JSON.stringify(mode));}catch(_){el('rosterNotice').textContent='View selected for this visit.';}
    };
    el('addRosterProject').onclick=openProjectForm;
    el('newLotCancel').onclick=()=>el('newLotDialog').close();
    el('newLotDialog').oncancel=e=>{if(el('newLotSave').disabled)e.preventDefault();};
    el('newLotForm').onsubmit=createProject;
    const closeChooser=()=>{chooser.open=false;chooser.querySelector('summary').focus({preventScroll:true});};
    el('rosterDone').onclick=closeChooser;
    el('bootstrapSchedule').addEventListener('keydown',e=>{
      if(e.key==='Escape'&&chooser.open){e.preventDefault();e.stopPropagation();closeChooser();}
    });
    document.addEventListener('pointerdown',e=>{if(chooser.open&&!chooser.contains(e.target))chooser.open=false;});
    el('bootstrapProjectRows').addEventListener('click',e=>{
      const button=e.target.closest('[data-roster-details]');if(button)openRosterDetails(button.dataset.rosterDetails);
    });
    el('rosterDetailsClose').onclick=dismissRosterDetails;
    el('rosterDetails').oncancel=e=>{e.preventDefault();dismissRosterDetails();};
    el('rosterDetailsForm').oninput=e=>{if(e.target.name==='docsUrl')e.target.setCustomValidity('');};
    el('rosterDetailsForm').onsubmit=saveRosterDetails;
  }
  function showLanding(){el('bootstrapSchedule').classList.remove('desk-open');el('joeLongview').hidden=true;lookRecord=null;activeId='';state=null;selectedId='';vendorView='';el('bootstrapProjectLanding')?.classList.remove('hidden');el('bootstrapProjectWorkspace')?.classList.add('hidden');el('bootstrapProjectsHome')?.classList.add('hidden');if(el('bootstrapScheduleTitleHeading'))el('bootstrapScheduleTitleHeading').textContent='ScheduleJoe';if(el('bootstrapScheduleSubtitle'))el('bootstrapScheduleSubtitle').textContent='Choose a lot and unit to open its independent schedule.';renderLanding();}
  function vendors(){return [...new Set(state.tasks.map(task=>task.vendor||vendorFor(task.trade)))].sort((a,b)=>a.localeCompare(b));}
  function segmentsForWeek(week){const first=week*5,last=first+5,segments=[];state.tasks.forEach(task=>{if(vendorView&&task.vendor!==vendorView)return;const start=Math.max(task.start,first),end=Math.min(task.start+Math.max(1,task.duration||1),last);if(start<end)segments.push({task,start,end});});segments.sort((a,b)=>a.start-b.start||b.end-a.end||a.task.title.localeCompare(b.task.title));const lanes=[];segments.forEach(segment=>{let lane=lanes.findIndex(end=>end<=segment.start);if(lane<0){lane=lanes.length;lanes.push(segment.end);}else lanes[lane]=segment.end;segment.lane=lane;});return {segments,lanes:Math.max(2,lanes.length)};}
  function weekendDate(entry){const date=anchor(project(activeId));date.setDate(date.getDate()+entry.week*7+(entry.day==='sun'?6:5));return date;}
  function weekendLabel(entry){return weekendDate(entry).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});}
  function renderAccelerated(){
    if(!state)return;
    const rows=el('bootstrapAcceleratedRows'),days=[...state.acceleratedDays].sort((a,b)=>a.week-b.week||a.day.localeCompare(b.day));
    if(rows)rows.innerHTML=days.length?days.map(entry=>{const assigned=state.tasks.filter(task=>task.acceleratedAssignments?.includes(entry.id));return '<article><div><small>'+esc(entry.commitment==='confirmed'?'VENDOR CONFIRMED':'PROPOSED')+'</small><b>'+esc(weekendLabel(entry))+' · '+esc(entry.shift.toUpperCase())+'</b><span>'+(assigned.length?assigned.map(task=>esc(task.title+' — '+task.vendor)).join('<br>'):'No task assigned yet. Select a task, then add it from this date.')+'</span></div><div>'+(selectedId?'<button type="button" data-weekend-assign="'+esc(entry.id)+'">ADD SELECTED TASK</button>':'')+'<button type="button" data-weekend-remove="'+esc(entry.id)+'">REMOVE</button></div></article>';}).join(''):'<p>No accelerated days are active. Saturday and Sunday remain off the schedule.</p>';
  }
  function riskWarnings(task){
    const warnings=[];
    if(task.duration<Math.max(1,task.plannedDuration||task.duration))warnings.push('Duration is shorter than the original plan');
    const conflict=task.vendor!=='Unassigned'&&state.tasks.find(other=>other.id!==task.id&&other.vendor===task.vendor&&task.start<other.start+other.duration&&other.start<task.start+task.duration);
    if(conflict)warnings.push(task.vendor+' overlaps '+conflict.title);
    return warnings;
  }
  function taskMarkup(task,start,end,lane,first){
    const begins=start===task.start,finishes=end===task.start+task.duration,warnings=Array.isArray(task.riskWarnings)?task.riskWarnings:[],weekendCount=task.acceleratedAssignments?.length||0;
    return '<article class="bootstrap-ground-task kind-'+esc(task.type||'work')+(selectedId===task.id?' is-selected':'')+(warnings.length?' has-risk':'')+'" draggable="true" tabindex="0" data-task-id="'+esc(task.id)+'" style="grid-column:'+(start-first+1)+' / span '+(end-start)+';grid-row:'+(lane+2)+'">'+(begins?'<button class="bootstrap-task-resize is-start" type="button" draggable="false" data-resize-edge="start" aria-label="Change start and duration of '+esc(task.title)+'">‹</button>':'')+'<small>'+esc(task.trade)+'</small><b>'+(begins?'':'← ')+esc(task.title)+(finishes?'':' →')+'</b><span>'+esc(task.duration)+' workday'+(task.duration===1?'':'s')+(weekendCount?' · '+weekendCount+' accelerated':'')+'</span><em class="bootstrap-task-vendor">'+esc(task.vendor)+'</em>'+(warnings.length?'<i class="bootstrap-task-risk" title="'+esc(warnings.join('. '))+'">!</i>':'')+(finishes?'<button class="bootstrap-task-resize is-end" type="button" draggable="false" data-resize-edge="end" aria-label="Change duration of '+esc(task.title)+'">›</button>':'')+'</article>';
  }
  function fitCalendar() {
    const board=el('bootstrapScheduleBoard'),panel=el('bootstrapSchedule');
    if(!board?.getClientRects().length||!panel.open)return;
    const top=board.getBoundingClientRect().top-panel.getBoundingClientRect().top+panel.scrollTop;
    const height=Math.floor((panel.clientHeight-top-46)/3);
    board.style.setProperty('--desk-week',Math.max(135,Math.min(height,250))+'px');
  }
  const expandedWeeks=new Set();
  function weekTop(node) {
    const board=el('bootstrapScheduleBoard');
    return board.scrollTop+node.getBoundingClientRect().top-board.getBoundingClientRect().top-board.clientTop;
  }
  function weekPositionKey() {
    return 'scheduleJoeWeek.v1:'+JSON.stringify([visit.actor,activeId]);
  }
  function rememberedWeek() {
    try {
      const week=Number(sessionStorage.getItem(weekPositionKey()));
      return Number.isInteger(week) && week>=0 && week<weekCount() ? week : 0;
    } catch (_) { return 0; }
  }
  function syncWeek() {
    if(!state)return;
    const board=el('bootstrapScheduleBoard');
    if(!board.clientHeight)return;
    const nodes=board.querySelectorAll('.bootstrap-ground-week');
    if(!nodes.length)return;
    // Advance once less than a week heading's height of the prior week remains.
    const headingHeight=nodes[0].querySelector('header').getBoundingClientRect().height;
    const readingLine=board.getBoundingClientRect().top+board.clientTop+headingHeight;
    let week=0;
    for(const node of nodes){
      if(node.getBoundingClientRect().top>readingLine)break;
      week=Number(node.dataset.weekNumber);
    }
    if(visit && selectedWeek!==week){
      try { sessionStorage.setItem(weekPositionKey(),String(week)); } catch (_) {}
    }
    selectedWeek=week;el('scheduleJoeWeek').value=String(week);
    for(const b of el('bootstrapProjectWorkspace').querySelectorAll('[data-week-step]')){
      b.disabled=Number(b.dataset.weekStep)<0?week===0:week===weekCount()-1;
    }
  }
  function jumpWeek(week) {
    const board=el('bootstrapScheduleBoard');
    const node=board.querySelector('[data-week-number="'+week+'"]');
    if(node){board.scrollTop=Math.max(0,weekTop(node));syncWeek();}
  }
  function fieldWeek(week) {
    const first=week*5,{segments,lanes}=segmentsForWeek(week),expanded=expandedWeeks.has(week);
    const extra=segments.filter(s=>s.lane>=2).length;
    const heads=[],cells=[],agenda=[];
    for(let col=0;col<5;col++){
      const day=first+col,weekday=workDate(day).toLocaleDateString(undefined,{weekday:'short'}),date=labelDate(day);
      const label='Add task on '+fullDate(day);
      heads.push(`<button type="button" class="bootstrap-ground-day-head" data-schedule-move="${day}" aria-label="${esc(label)}"><small>${weekday}</small><b>${esc(date)}</b></button>`);
      cells.push(`<div class="bootstrap-ground-day-cell" data-schedule-day="${day}" style="grid-column:${col+1};grid-row:2 / span ${expanded?lanes:2}"></div>`);
      const items=segments.filter(s=>s.start<=day&&s.end>day);
      agenda.push(`<section><button class="desk-date" type="button" data-desk-day="${day}" aria-label="${esc(label)}">${weekday} · ${esc(date)} ＋</button><div>${items.map(({task})=>
        `<button type="button" class="desk-agenda-task" data-edit-task="${esc(task.id)}"><b>${esc(task.title)}</b><span>${esc(task.vendor)}</span></button>`).join('')}</div></section>`);
    }
    const bars=segments.filter(s=>expanded||s.lane<2).map(s=>taskMarkup(s.task,s.start,s.end,s.lane,first)).join('');
    const shifts=state.acceleratedDays.filter(s=>s.week===week).map(s=>`<button type="button" data-open-accelerated="1">${esc(weekendLabel(s))} · ${esc(s.shift.toUpperCase())}</button>`).join('');
    const more=extra?`<button type="button" class="desk-more" data-expand-week="${week}" aria-expanded="${expanded}">${expanded?'Show fewer tasks':'Show '+extra+' more task'+(extra===1?'':'s')}</button>`:'';
    return `<section class="bootstrap-ground-week" data-week-number="${week}">
      <header><small>Week ${week+1}</small><b>${esc(labelDate(first))} – ${esc(labelDate(first+4))}</b>${more}</header>
      <div class="bootstrap-ground-week-grid" data-week="${week}" style="--task-lanes:${expanded?lanes:2}">${heads.join('')}${cells.join('')}${bars}</div>
      <div class="desk-agenda">${agenda.join('')}</div>${shifts?'<aside class="desk-shifts">'+shifts+'</aside>':''}</section>`;
  }
  function renderSchedule(){
    if(!state)return;
    const board=el('bootstrapScheduleBoard'),top=board.scrollTop,weeks=weekCount(),meta=project(activeId);
    el('bootstrapScheduleSubtitle').textContent='ScheduleJoe · '+[meta.region,meta.division,meta.community].join(' / ');
    el('joeExtend').disabled=weeks>=MAX_WEEKS;
    el('bootstrapScheduleRange').textContent=labelDate(0)+' – '+fullDate(weeks*5-1)+' · '+weeks+' weeks';
    const options=Array.from({length:weeks},(_,w)=>`<option value="${w}">Week ${w+1} · ${labelDate(w*5)} – ${labelDate(w*5+4)}</option>`).join('');
    const weekdayPicker=el('scheduleJoeWeek'),shiftWeek=el('bootstrapAcceleratedWeek');
    if(weekdayPicker.options.length!==weeks||weekdayPicker.dataset.project!==activeId){weekdayPicker.innerHTML=options;weekdayPicker.dataset.project=activeId;}
    if(shiftWeek.options.length!==weeks||shiftWeek.dataset.project!==activeId){
      const v=shiftWeek.dataset.project===activeId?shiftWeek.value:'0';
      shiftWeek.innerHTML=options;shiftWeek.dataset.project=activeId;shiftWeek.value=v||'0';
    }
    board.innerHTML=Array.from({length:weeks},(_,w)=>fieldWeek(w)).join('');
    fitCalendar();board.scrollTop=top;syncWeek();renderVendorLayer();renderAccelerated();updateVendorCount();
  }
  function activityCopy(item){if(item.summary)return item.task+' · '+item.summary;if(item.assignment)return item.task+' reassigned from '+item.from+' to '+item.to+'.';if(item.type==='resize')return item.task+' duration changed from '+item.from+' to '+item.to+'.';if(item.type==='weekend')return item.task+' added to '+item.to+' as an accelerated exception.';if(item.type==='weekend-open')return item.to+' activated for accelerated work.';return item.task+' moved from '+item.from+' to '+item.to+'.';}
  function renderVendorLayer(){
    if(!state)return;
    const options=vendors(),view=el('bootstrapVendorView');
    view.innerHTML='<option value="">All crews</option>'+options.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
    view.value=vendorView;
    const activity=el('bootstrapVendorActivity');if(activity)activity.innerHTML=state.activity.length?state.activity.filter(item=>!vendorView||item.vendor===vendorView).map(item=>'<article><b>'+esc(item.vendor||'Construction Manager')+'</b><span>'+esc(activityCopy(item))+'</span><small>'+esc(new Date(item.at).toLocaleString())+'</small></article>').join(''):'<p>No schedule changes are recorded for this project.</p>';
  }
  async function openProject(id){if(!visit||!cache.has(id))return;
    el('joeLongview').hidden=true;lookRecord=null;
    el('joePrompt').checked=false;
    el('scheduleJoeRetry').hidden=true;
    activeId=id;state=cache.get(id);const firstWeek=rememberedWeek();selectedWeek=0;selectedId='';vendorView='';
    el('bootstrapSchedule').classList.add('desk-open');expandedWeeks.clear();el('deskSettings').open=false;el('deskHistory').open=false;
    el('bootstrapAcceleratedPanel').classList.add('hidden');
    el('bootstrapAcceleratedToggle').setAttribute('aria-expanded','false');el('bootstrapProjectLanding')?.classList.add('hidden');el('bootstrapProjectWorkspace')?.classList.remove('hidden');el('bootstrapProjectsHome')?.classList.remove('hidden');const meta=project(id);el('bootstrapScheduleTitleHeading').textContent=projectLabel(meta);el('bootstrapScheduleSubtitle').textContent='Tap a task to select it. Drag to move it, or pull an edge to change its duration.';renderSchedule();jumpWeek(firstWeek);status(state._source==='recovered prior schedule'?'Prior Lot 1234 · Unit A schedule recovered. Changes now save in its independent record.':state.updatedAt?'Loaded saved revision '+state.revision+' from '+new Date(state.updatedAt).toLocaleString()+'.':'Tap a date to add work or a task to edit it.');el('bootstrapSchedule').scrollTop=0;}
  async function move(id,day){
    const task=state?.tasks.find(item=>item.id===id);if(!task)return;
    if(task.locked===true||task.complete===true){status('This task is locked or complete.');return;}
    if(el('joePrompt').checked){openMove(task,Number(day));return;}
    const next=Number(day);
    if(next===task.start)return;
    if(!Number.isInteger(next)||next<0||next+task.duration>MAX_WEEKS*5){status('Choose a workday inside the planning window.');return;}
    const before={...task};task.start=next;
    state.planningWeeks=Math.max(weekCount(),Math.ceil((next+task.duration)/5));recordTaskChange(before,task);
    finishEdit(task);await persist(task.title+' moved to '+fullDate(next)+'.');
  }
  async function resizeTask(id,edge,day){
    const task=state?.tasks.find(item=>item.id===id);if(!task||task.locked===true||task.complete===true)return;const before={...task},oldStart=task.start,oldDuration=Math.max(1,task.duration||1),oldEnd=oldStart+oldDuration;
    if(edge==='start'){const nextStart=Math.max(0,Math.min(oldEnd-1,Number(day)));task.start=nextStart;task.duration=oldEnd-nextStart;}else{const nextEnd=Math.max(task.start+1,Math.min(weekCount()*5,Number(day)+1));task.duration=nextEnd-task.start;}
    if(task.start===oldStart&&task.duration===oldDuration){showOver(null);renderSchedule();status('Duration unchanged. Drag the edge into another workday.');return;}
    recordTaskChange(before,task);for(const t of state.tasks)t.riskWarnings=riskWarnings(t);
    selectedId=task.id;showOver(null);renderSchedule();
    const warning=task.riskWarnings.length?' Calculated-risk warning: '+task.riskWarnings.join('; ')+'. The manager may proceed.':'';status(task.title+' now runs '+task.duration+' workday'+(task.duration===1?'':'s')+'.'+warning);await persist('Duration saved.'+warning);
  }
  function gridRects(){return [...document.querySelectorAll('.bootstrap-ground-week-grid')].map(grid=>({week:Number(grid.dataset.week),rect:grid.getBoundingClientRect()}));}
  function dayAtPoint(x,y,rects=gridRects()){for(const item of rects){const r=item.rect;if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return item.week*5+Math.max(0,Math.min(4,Math.floor((x-r.left)/(r.width/5))));}return null;}
  function showOver(day){if(day===overDay)return;const prior=overDay;overDay=day;if(prior!==null)document.querySelectorAll('[data-schedule-day="'+prior+'"],[data-schedule-move="'+prior+'"]').forEach(node=>node.classList.remove('is-over'));if(day!==null)document.querySelectorAll('[data-schedule-day="'+day+'"],[data-schedule-move="'+day+'"]').forEach(node=>node.classList.add('is-over'));}
  function makeDragGhost(card,event){const rect=card.getBoundingClientRect(),ghost=card.cloneNode(true);ghost.removeAttribute('draggable');ghost.removeAttribute('tabindex');ghost.classList.remove('is-selected');ghost.classList.add('bootstrap-drag-ghost');ghost.style.width=rect.width+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';el('bootstrapSchedule').appendChild(ghost);return {node:ghost,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};}
  function moveDragGhost(drag,event){if(!drag?.ghost)return;drag.ghost.node.style.transform='translate3d('+(event.clientX-drag.ghost.offsetX-parseFloat(drag.ghost.node.style.left))+'px,'+(event.clientY-drag.ghost.offsetY-parseFloat(drag.ghost.node.style.top))+'px,0)';}
  function clearTouchDrag(){
    touchDrag?.ghost?.node?.remove();
    touchDrag?.card?.classList.remove('is-dragging','is-resizing');
    touchDrag=null;
  }
  function current(entry) {
    if(!entry || entry!==visit || !entry.button.isConnected ||
       entry.button.closest('[hidden],.hidden,[inert],[aria-hidden="true"]')) return false;
    const session=window.DarkSkyAdmiralSession?.status();
    return session?.reusable && session.startedAt===entry.stamp &&
      entry.client.readSession()?.user?.id===entry.actor;
  }
  function closeSchedule(restore=true) {
    const entry=visit,panel=el('bootstrapSchedule');
    closeMove();dismissEditor();dismissRosterDetails();if(el('newLotDialog').open)el('newLotDialog').close();el('rosterColumns').open=false;if(el('deskUpdates').open)el('deskUpdates').close();lookRecord=null;visit=null;
    if(entry) clearInterval(entry.timer);
    entry?.leaveScheduleWindow?.();
    clearTouchDrag();desktopGrab=null;showOver(null);
    activeId='';state=null;selectedId='';vendorView='';
    el('joeLockNotice')?.remove();
    if(panel.open) panel.close();
    panel.classList.add('hidden');panel.setAttribute('aria-hidden','true');
    if(restore && entry?.button.getClientRects().length)entry.button.focus({preventScroll:true});
  }
  function updateLockNotice(panel) {
    const session=window.DarkSkyAdmiralSession?.status();
    const warning=session?.maximumRemainingMs<=120000
      ? 'Your sign-in expires within two minutes. Save your work before signing in again.'
      : session?.idleRemainingMs<=120000
        ? 'ScheduleJoe locks within two minutes of inactivity.'
        : '';
    let notice=el('joeLockNotice');
    if(!warning){notice?.remove();return;}
    const idle=session.maximumRemainingMs>120000;
    const dialogs=Array.from(panel.querySelectorAll('dialog[open]'));
    const host=dialogs.at(-1)||panel;
    if(!notice){notice=document.createElement('p');notice.id='joeLockNotice';notice.setAttribute('role','status');}
    if(notice.parentElement!==host)host.prepend(notice);
    if(notice.dataset.message!==warning){
      notice.dataset.message=warning;
      notice.textContent=warning+' ';
      if(idle){
        const keep=document.createElement('button');keep.type='button';keep.textContent='Keep working';
        notice.append(keep);
      }
    }
  }
  async function open(button) {
    if(!button?.matches?.('#bootstrapScheduleOpen,[data-schedulejoe-open]')) {
      button=[...document.querySelectorAll('#bootstrapScheduleOpen,[data-schedulejoe-open]')].find(node=>node.getClientRects().length);
    }
    if(visit || !button?.getClientRects().length)return;
    const panel=el('bootstrapSchedule'),fleet=button.closest('#watchWorkspace');
    const host=fleet||button.closest('#admiralDeck,[role="dialog"]')||button.parentElement;
    const feedback=(fleet?el('watchStatus'):el('admiralDeckNotice'));
    let entry;
    try {
      const config=window.BlackFlagV3Identity.productionAuth.readClientConfig();
      const client=window.DarkSkySupabase.create({...config,sessionKey:'darkSkySupabaseAdmiralSessionV1',build:window.__darkSkyVerifiedRelease.build});
      entry={button,client,actor:client.readSession()?.user?.id,stamp:window.DarkSkyAdmiralSession?.status()?.startedAt};
      visit=entry;
      if(!entry.actor||!current(entry)||!await window.DarkSkyAdmiralIdentityStatus()||!current(entry))throw Error();
      host.appendChild(panel);
      panel.classList.remove('hidden');panel.setAttribute('aria-hidden','false');
      el('bootstrapScheduleClose').textContent=fleet?'← Back to My Fleet':'← Back';
      el('scheduleJoeFleet').hidden=!!fleet;
      el('crewQuery').value='';loadRosterView();showLanding();el('bootstrapProjectRows').innerHTML='<tr><td colspan="'+(rosterSelection.size+1)+'">Opening project records…</td></tr>';
      panel.showModal();panel.scrollTop=0;
      entry.leaveScheduleWindow=window.DarkSkyAdmiralSession?.enterSchedule?.(panel,entry.actor,entry.stamp);
      el('bootstrapScheduleClose').focus({preventScroll:true});
      entry.timer=setInterval(()=>{
        if(!current(entry)){closeSchedule(false);return;}
        updateLockNotice(panel);
        if(!activeId&&!lookRecord&&rosterRenderedDay!==isoDate(new Date()))renderLanding();
      },550);
      await hydrate(entry);
      if(current(entry))renderLanding();
    } catch (_) {
      if(visit!==entry)return;
      closeSchedule();
      if(feedback)feedback.textContent='Reopen the Admiral workspace to verify access to ScheduleJoe.';
    }
  }
  for(const name of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable','darksky:command-route','pagehide'])
    window.addEventListener(name,()=>{if(visit)closeSchedule(false);});
  window.addEventListener('darksky:admiral-session-changed',()=>{if(visit&&!current(visit))closeSchedule(false);});
  document.addEventListener('cancel',event=>{if(event.target.id==='bootstrapSchedule'){event.preventDefault();closeSchedule();}},true);

  function syncDoor(){const kit=el('admiralCommissioningBrandKit');if(kit&&!el('bootstrapScheduleOpen'))kit.insertAdjacentHTML('beforeend','<button id="bootstrapScheduleOpen" class="admiral-pro-button" type="button">OPEN BOOTSTRAP BUILD SCHEDULE</button>');const doorway=el('bootstrapScheduleOpen');if(doorway&&doorway.textContent!=='OPEN BOOTSTRAP BUILD SCHEDULE')doorway.textContent='OPEN BOOTSTRAP BUILD SCHEDULE';}
  install();installQuickPassageControls();wireLongview();bindRoster();syncDoor();new MutationObserver(syncDoor).observe(document.body,{subtree:true,childList:true});window.DarkSkyOpenBootstrapSchedule=open;
  document.addEventListener('click',async event=>{const target=event.target;const opener=target.closest('#bootstrapScheduleOpen,[data-schedulejoe-open]');
    if(opener){event.preventDefault();event.stopImmediatePropagation();void open(opener);return;}if(!target.closest('#bootstrapSchedule'))return;if(target.closest('#scheduleJoeFleet')){closeSchedule(false);window.DarkSkyOpenFleetWatchtower?.();return;}if(target.closest('#bootstrapScheduleClose')){event.preventDefault();event.stopImmediatePropagation();closeSchedule();return;}if(target.closest('#bootstrapProjectsHome')){event.preventDefault();event.stopImmediatePropagation();showLanding();el('bootstrapSchedule').scrollTop=0;return;}const shortcut=target.closest('[data-crew-task]');
    if(shortcut){
      event.preventDefault();event.stopImmediatePropagation();
      const id=shortcut.dataset.job,task=cache.get(id)?.tasks.find(t=>String(t.id)===shortcut.dataset.crewTask);
      if(!current(visit)||!task)return;
      await openProject(id);
      if(current(visit)&&activeId===id){jumpWeek(Math.floor(task.start/5));openEditor(task);}
      return;
    }
    const rowButton=target.closest('[data-open-project]');if(rowButton){event.preventDefault();event.stopImmediatePropagation();await openProject(rowButton.dataset.openProject);return;}if(!state)return;
    if(target.closest('#deskCalendarExport')){event.preventDefault();void downloadLotCalendar();return;}
    if(target.closest('#scheduleJoeRetry')){void persist('');return;}
    const step=target.closest('[data-week-step]');
    if(step){jumpWeek(Math.max(0,Math.min(weekCount()-1,selectedWeek+Number(step.dataset.weekStep))));return;}
    if(target.closest('#bootstrapScheduleAdd')){
      let day=selectedWeek*5;
      const start=state.rosterDetails?.startDate;
      if(selectedWeek===0&&!state.tasks.length&&start){
        const first=new Date(start+'T12:00:00'),weekday=first.getDay();
        if(weekday===0||weekday===6)first.setDate(first.getDate()+(weekday===0?1:2));
        const index=workIndex(isoDate(first));
        if(index>=0&&index<weekCount()*5)day=index;
      }
      openEditor(null,day);return;
    }
    if(target.closest('#bootstrapScheduleCancel')){dismissEditor();return;}
    const more=target.closest('[data-expand-week]');
    if(more){const week=Number(more.dataset.expandWeek);if(expandedWeeks.has(week))expandedWeeks.delete(week);else expandedWeeks.add(week);renderSchedule();return;}
    const cell=target.closest('[data-schedule-move],[data-schedule-day],[data-desk-day]');
    if(cell){if(Date.now()<suppressClickUntil)return;openEditor(null,Number(cell.dataset.scheduleMove??cell.dataset.scheduleDay??cell.dataset.deskDay));return;}
    if(target.closest('#bootstrapScheduleReset')){event.preventDefault();event.stopImmediatePropagation();const meta=project(activeId);const prior=state;if(window.confirm('Reset '+projectLabel(meta)+' to its original plan?')){const reset=fresh(meta),originals=new Map(reset.tasks.map(t=>[t.id,t]));
      for(const task of state.tasks){
        const restored=originals.get(task.id);
        if(restored){
          if(task.start!==restored.start||task.duration!==restored.duration||task.vendor!==restored.vendor||task.title!==restored.title)recordTaskChange(task,restored);
        }else queueVendorNotice(task,'Task removed in project reset · previously '+dateRange(task),'reset');
        for(const id of task.acceleratedAssignments||[]){
          const shift=state.acceleratedDays.find(item=>item.id===id);
          if(shift)queueVendorNotice(task,'Weekend shift removed in project reset · '+weekendLabel(shift),shift.id);
        }
      }
      Object.assign(state,reset,{revision:prior.revision,updatedAt:prior.updatedAt,planStart:prior.planStart,activity:prior.activity});
      selectedId='';vendorView='';renderSchedule();jumpWeek(0);await persist('This project was reset.');}return;}const card=target.closest('[data-task-id],[data-edit-task]');
    if(card&&Date.now()>=suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();openEditor(state.tasks.find(t=>t.id===(card.dataset.taskId||card.dataset.editTask)));}},{capture:true});
  document.addEventListener('click',async event=>{
    const target=event.target;if(!target.closest?.('#bootstrapSchedule')||!state)return;
    const toggle=target.closest('#bootstrapAcceleratedToggle,[data-open-accelerated]');if(toggle){event.preventDefault();const panel=el('bootstrapAcceleratedPanel'),opening=panel?.classList.contains('hidden');panel?.classList.toggle('hidden',!opening);el('bootstrapAcceleratedToggle')?.setAttribute('aria-expanded',opening?'true':'false');if(opening){el('deskSettings').open=true;if(selectedWeek!=='all')el('bootstrapAcceleratedWeek').value=String(selectedWeek);renderAccelerated();panel?.scrollIntoView({behavior:'smooth',block:'nearest'});}return;}
    if(target.closest('#bootstrapAcceleratedClose')){event.preventDefault();el('bootstrapAcceleratedPanel')?.classList.add('hidden');el('bootstrapAcceleratedToggle')?.setAttribute('aria-expanded','false');return;}
    if(target.closest('#bootstrapAcceleratedAdd')){event.preventDefault();const week=Number(el('bootstrapAcceleratedWeek')?.value||0),day=el('bootstrapAcceleratedDay')?.value==='sun'?'sun':'sat',shift=el('bootstrapAcceleratedShift')?.value||'am',commitment=el('bootstrapAcceleratedCommitment')?.value||'proposed',id='weekend-'+week+'-'+day;let entry=state.acceleratedDays.find(item=>item.id===id);if(entry){if(entry.shift!==shift||entry.commitment!==commitment)state.tasks.filter(t=>t.acceleratedAssignments?.includes(id)).forEach(t=>queueVendorNotice(t,weekendLabel(entry)+' shift updated · '+entry.shift.toUpperCase()+' / '+entry.commitment+' → '+shift.toUpperCase()+' / '+commitment,id));entry.shift=shift;entry.commitment=commitment;}else{entry={id,week,day,shift,commitment,createdAt:new Date().toISOString()};state.acceleratedDays.push(entry);}state.activity.unshift({id:'weekend-open-'+Date.now(),type:'weekend-open',at:new Date().toISOString(),vendor:'Construction Manager',task:'Accelerated shift',from:'Weekend off',to:weekendLabel(entry)+' · '+shift.toUpperCase()+' · '+commitment.replace('_',' ')});renderSchedule();await persist(weekendLabel(entry)+' activated as an accelerated '+shift.toUpperCase()+' exception.');return;}
    const assign=target.closest('[data-weekend-assign]');if(assign){event.preventDefault();const task=state.tasks.find(item=>item.id===selectedId),entry=state.acceleratedDays.find(item=>item.id===assign.dataset.weekendAssign);if(!task||!entry)return;task.acceleratedAssignments=Array.isArray(task.acceleratedAssignments)?task.acceleratedAssignments:[];if(task.acceleratedAssignments.includes(entry.id))return;task.acceleratedAssignments.push(entry.id);queueVendorNotice(task,'Additional shift · '+weekendLabel(entry)+' · '+entry.shift.toUpperCase(),entry.id);state.activity.unshift({id:'weekend-'+Date.now(),type:'weekend',at:new Date().toISOString(),task:task.title,vendor:task.vendor,from:'Standard plan',to:weekendLabel(entry)+' · '+entry.shift.toUpperCase()});renderSchedule();await persist(task.title+' added to '+weekendLabel(entry)+'. Warning retained; standard weekdays remain unchanged.');return;}
    const remove=target.closest('[data-weekend-remove]');if(remove){event.preventDefault();const entry=state.acceleratedDays.find(item=>item.id===remove.dataset.weekendRemove);if(entry)state.tasks.filter(t=>t.acceleratedAssignments?.includes(entry.id)).forEach(t=>queueVendorNotice(t,'Weekend shift removed · '+weekendLabel(entry)+' · '+entry.shift.toUpperCase(),entry.id));state.acceleratedDays=state.acceleratedDays.filter(item=>item.id!==remove.dataset.weekendRemove);state.tasks.forEach(task=>task.acceleratedAssignments=(task.acceleratedAssignments||[]).filter(id=>id!==remove.dataset.weekendRemove));renderSchedule();await persist((entry?weekendLabel(entry):'Weekend shift')+' removed; Saturday and Sunday return to off.');}
  },{capture:true});
  document.addEventListener('dragstart',event=>{if(event.target.closest?.('[data-resize-edge]')){event.preventDefault();return;}const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||!state||touchDrag){if(touchDrag)event.preventDefault();return;}event.stopImmediatePropagation();selectedId=card.dataset.taskId;
    const task=state.tasks.find(t=>t.id===selectedId);
    const grab=dayAtPoint(event.clientX,event.clientY);
    desktopGrab={id:selectedId,offset:grab===null?0:Math.max(0,Math.min(task.duration-1,grab-task.start))};
    event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',selectedId);card.classList.add('is-dragging');},{capture:true});
  document.addEventListener('dragover',event=>{if(!event.target.closest?.('#bootstrapSchedule')||!state)return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();const task=desktopGrab&&state.tasks.find(t=>t.id===desktopGrab.id);showOver(task?Math.max(0,Math.min(weekCount()*5-task.duration,day-desktopGrab.offset)):day);},{capture:true});
  document.addEventListener('drop',event=>{if(!event.target.closest?.('#bootstrapSchedule')||!state)return;const day=dayAtPoint(event.clientX,event.clientY);if(day===null)return;event.preventDefault();event.stopImmediatePropagation();if(desktopGrab&&desktopGrab.id===event.dataTransfer.getData('text/plain'))move(desktopGrab.id,day-desktopGrab.offset);desktopGrab=null;},{capture:true});
  document.addEventListener('dragend',event=>{if(!event.target.closest?.('#bootstrapSchedule'))return;event.stopImmediatePropagation();desktopGrab=null;showOver(null);document.querySelectorAll('.bootstrap-ground-task').forEach(node=>node.classList.remove('is-dragging'));},{capture:true});
  function dragDay(drag,event) {
    const day=dayAtPoint(event.clientX,event.clientY);
    return day===null?null:Math.max(0,Math.min(weekCount()*5-(el('joePrompt').checked?1:drag.duration),day-drag.offset));
  }
  document.addEventListener('pointerdown',event=>{
    const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');
    if(!card||!state||touchDrag||event.button!==0)return;
    const handle=event.target.closest('[data-resize-edge]');
    if(event.pointerType==='mouse'&&!handle)return;
    const task=state.tasks.find(item=>item.id===card.dataset.taskId);
    const day=dayAtPoint(event.clientX,event.clientY);
    if(!task||day===null)return;
    event.preventDefault();event.stopImmediatePropagation();
    touchDrag={card,id:task.id,pointerId:event.pointerId,edge:handle?.dataset.resizeEdge,
      x:event.clientX,y:event.clientY,offset:Math.max(0,Math.min(task.duration-1,day-task.start)),
      duration:task.duration,moved:false,ghost:null,started:event.timeStamp,scrolling:false,
      scrollTop:el('bootstrapScheduleBoard').scrollTop};
    if(event.isTrusted)card.setPointerCapture(event.pointerId);
  },{capture:true});
  function updateDrag(event) {
    const drag=touchDrag,dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&!drag.edge&&event.pointerType==='touch'&&event.timeStamp-drag.started<220&&Math.abs(dy)>8&&Math.abs(dy)>1.3*Math.abs(dx))drag.scrolling=true;
    if(drag.scrolling){el('bootstrapScheduleBoard').scrollTop=drag.scrollTop-dy;return;}
    if(!drag.moved && Math.hypot(dx,dy)>=8) {
      drag.moved=true;selectedId=drag.id;
      drag.card.classList.add(drag.edge?'is-resizing':'is-dragging');
      if(!drag.edge)drag.ghost=makeDragGhost(drag.card,{clientX:drag.x,clientY:drag.y});
    }
    if(!drag.moved)return;
    moveDragGhost(drag,event);
    showOver(drag.edge?dayAtPoint(event.clientX,event.clientY):dragDay(drag,event));
  }
  document.addEventListener('pointermove',event=>{
    if(touchDrag?.pointerId!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();updateDrag(event);
  },{capture:true,passive:false});
  document.addEventListener('pointerup',event=>{
    if(touchDrag?.pointerId!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();
    updateDrag(event);
    const drag=touchDrag,day=drag.edge?dayAtPoint(event.clientX,event.clientY):dragDay(drag,event);
    clearTouchDrag();showOver(null);suppressClickUntil=Date.now()+350;
    if(drag.scrolling)return;
    if(drag.moved&&day!==null) {
      if(drag.edge)resizeTask(drag.id,drag.edge,day);else move(drag.id,day);
      return;
    }
    if(!drag.moved)openEditor(state.tasks.find(t=>t.id===drag.id));
  },{capture:true});
  for(const name of ['pointercancel','lostpointercapture'])document.addEventListener(name,event=>{
    if(touchDrag?.pointerId!==event.pointerId)return;
    clearTouchDrag();showOver(null);renderSchedule();
  },{capture:true});

  document.addEventListener('keydown',event=>{const card=event.target.closest?.('#bootstrapSchedule [data-task-id]');if(!card||!state)return;if(['Enter',' '].includes(event.key)){event.preventDefault();openEditor(state.tasks.find(t=>t.id===card.dataset.taskId));return;}if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();const task=state.tasks.find(item=>item.id===card.dataset.taskId),handle=event.target.closest?.('[data-resize-edge]');if(!task)return;if(handle){const edge=handle.dataset.resizeEdge,day=edge==='start'?task.start+(event.key==='ArrowRight'?1:-1):task.start+task.duration-1+(event.key==='ArrowRight'?1:-1);resizeTask(task.id,edge,day);}else move(task.id,task.start+(event.key==='ArrowRight'?1:-1));},{capture:true});
  document.addEventListener('change',event=>{
    if(event.target.id==='scheduleJoeWeek'&&state){
      jumpWeek(Number(event.target.value));return;
    }
    if(event.target.id!=='bootstrapVendorView'||!state)return;vendorView=event.target.value;renderSchedule();status(vendorView?'Vendor view opened for '+vendorView+'.':'All project work is visible.');},{capture:true});
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
      <label>New workshop note<textarea data-bf-trim="boundary" id="captainCargoNote" placeholder="Describe an idea, experiment or reusable capability…"></textarea></label>
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
            <textarea data-bf-trim="boundary" id="captainGovernanceReason" placeholder="Required for Suspend or End Relationship…"></textarea>
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
        <div class="easy-bearing-input-wrap"><input data-bf-trim="boundary" id="captainCommandSearchInput" placeholder="Search project, order #, customer, phone, or email" autocomplete="off" enterkeyhint="search"><button id="captainCommandSearchClear" type="button" aria-label="Clear search">CLEAR</button></div>
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
      <div class="cq-full-sail-grid"><section><h4>Captain Lab Board</h4><div class="lab-template-row"><button type="button" data-lab-template="customer">CUSTOMER FLOW</button><button type="button" data-lab-template="pricing">PRICING</button><button type="button" data-lab-template="brand">BRAND</button><button type="button" data-lab-template="operations">OPERATIONS</button></div><div class="v4-captain-lab high-watch-lab-create"><label>Vessel<select id="captainV4LabProject"><option value="">Select vessel…</option>${projects.map(p=>`<option value="${safe(p.projectId||p.id||'')}">${safe(p.name)}</option>`).join('')}</select></label><label>Category<select id="captainV4LabCategory"><option value="general">General</option><option value="customer_flow">Customer flow</option><option value="pricing">Pricing</option><option value="brand">Brand</option><option value="operations">Operations</option></select></label><label>Risk<select id="captainV4LabRisk"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Experiment brief<input data-bf-trim="boundary" id="captainV4LabBrief" placeholder="What are we trying?"></label><label>Objective<input data-bf-trim="boundary" id="captainV4LabObjective" placeholder="What should improve?"></label><label>Success criteria<input data-bf-trim="boundary" id="captainV4LabSuccess" placeholder="What proves this worked?"></label><button id="captainV4CreateLab" type="button">CREATE SANDBOX</button></div><div class="cq-lab-board">${labHtml}</div><div class="implementation-queue"><small>ENGINE IMPLEMENTATION QUEUE</small><strong>${queue.filter(x=>x.status!=='closed').length} request${queue.filter(x=>x.status!=='closed').length===1?'':'s'}</strong>${queue.filter(x=>x.status!=='closed').slice(0,3).map(x=>`<span>${safe(x.projectName)} • ${safe(x.category||'general')} • ${safe(x.status.toUpperCase())}</span>`).join('')}</div></section><section><h4>Controlled capabilities</h4><div class="cq-feature-flags">${flagKeys.map(k=>`<label><span><strong>${safe(k.replaceAll('_',' ').toUpperCase())}</strong><small>${safe(flags[k]?.scope||'fleet')} • ${safe(flags[k]?.ring||'stable')}</small></span><input type="checkbox" data-v4-flag="${k}" ${flags[k]?.enabled?'checked':''}></label>`).join('')}</div><h4>Black Box <small>${safe((bb.status||'clear').toUpperCase())} • ${Number(bb.uniqueEvents||0)} unique / ${Number(bb.occurrences||0)} occurrences</small></h4><div class="cq-blackbox-mini">${blackbox.length?blackbox.map(x=>`<span><b>${safe(x.type)}${Number(x.occurrences||1)>1?` ×${Number(x.occurrences||1)}`:''}</b>${safe(x.detail||'event')}<small>${safe(new Date(x.lastSeen||x.at).toLocaleString())}</small></span>`).join(''):'<span>No diagnostic events retained.</span>'}</div></section></div>
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
      <section class="captain-command-card"><h3>Standing Orders</h3><p>Persistent governance rules for how Black Flag is allowed to evolve.</p><div id="captainStandingOrders" class="standing-orders"></div><div class="standing-order-add"><input data-bf-trim="boundary" id="captainStandingOrderInput" placeholder="Add a standing order…" /><button id="captainStandingOrderAdd" type="button">ADD ORDER</button></div></section>
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
    return `<section class="captain-command-card v4-decision-ledger"><small>DARK SKY 4.0</small><h3>Decision Ledger</h3><p>Major platform decisions, architectural warnings, experiments and Captain overrides live here so future releases preserve why the ship was built this way.</p><div class="v4-decision-add"><input data-bf-trim="boundary" id="captainV4Decision" placeholder="Record a platform decision…"><input data-bf-trim="boundary" id="captainV4Rationale" placeholder="Rationale / warning…"><button id="captainV4DecisionAdd" type="button">RECORD DECISION</button></div><div class="captain-note-list">${rows.length?rows.map(x=>`<div><strong>${safe(new Date(x.at).toLocaleString())}</strong><span>${safe(x.decision)}${x.rationale?` — ${safe(x.rationale)}`:''}</span></div>`).join(''):'<p class="captain-empty">No V4 platform decisions recorded yet.</p>'}</div></section>`;
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
  async function verifyAdmiral(){const c=cfg(),s=await currentSession();if(!c||!s?.access_token)return false;const r=await fetch(c.url+'/rest/v1/fleet_global_authorities?select=user_id,authority_role,active&authority_role=eq.admiral&active=eq.true&revoked_at=is.null',{headers:{...headers(s.access_token),Accept:'application/json'}});if(!r.ok)return false;const rows=await r.json();return Array.isArray(rows)&&rows.length===1;}
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
  const client=()=>{const c=cfg();if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION_KEY,build:window.__darkSkyVerifiedRelease.build});};
  const readSession=()=>client().readSession();
  const saveSession=data=>client().saveSession(data);
  const clearSession=()=>client().clearSession();
  const headers=(token='')=>client().headers(token);
  const selected=id=>{const control=el(id);return {value:control?.value||'',label:control?.selectedOptions?.[0]?.textContent?.trim()||''};};
  const setResult=(message,kind='status')=>{const node=result();if(!node)return;node.textContent=message;node.classList.toggle('is-verified',kind==='verified');};
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatTime=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return String(value||'');}};
  async function refreshSession(session){return client().refreshSession(session);}
  async function currentSession(){return client().currentSession();}
  async function rpc(name,body){return client().rpc(name,body,'The Admiral command was refused. No change was made.');}
  async function verifyAdmiral(){if(!cfg())return false;return client().verifyAdmiralAuthority();}
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
  async function signIn(emailValue='',passwordValue=''){
    const email=(emailValue||el('admiralIdentityEmail')?.value||'').trim().toLowerCase(),password=passwordValue||el('admiralIdentityPassword')?.value||'';
    if(!email||!password)throw new Error('Enter the Admiral email and password.');
    await client().signInWithPassword(email,password);
    if(!(await verifyAdmiral())){clearSession();throw new Error('This account does not hold active Admiral authority.');}
    if(el('admiralIdentityPassword'))el('admiralIdentityPassword').value='';
  }
  async function syncIdentity(){
    const verified=await verifyAdmiral();
    const deck=el('admiralDeck');
    deck?.classList.toggle('admiral-authority-verified',verified);
    if(deck)deck.dataset.admiralAuthority=verified?'verified':'provisional';
    const rankLabels=[
      deck?.querySelector('.admiral-deck-head-actions>span'),
      deck?.querySelector('.admiral-command-rail-title>span'),
      deck?.querySelector('.admiral-command-center-badge>span')
    ].filter(Boolean);
    rankLabels.forEach(node=>node.textContent=verified?'ADMIRAL ACCOUNT · VERIFIED':'ADMIRAL ACCOUNT · SIGN IN REQUIRED');
    const gateBadge=el('admiralGateOverlay')?.querySelector('.admiral-trial-badge');
    if(gateBadge)gateBadge.textContent=verified?'DUAL-OFFICE COMMISSION • ADMIRAL VERIFIED':'DUAL-OFFICE COMMISSION • SERVER VERIFICATION REQUIRED';
    const passageCard=deck?.querySelector('.admiral-passage-card');
    passageCard?.classList.toggle('is-earned',verified);
    const passageStatus=passageCard?.querySelector('p');
    if(passageStatus)passageStatus.textContent=verified?'ACCOUNT AUTHORITY VERIFIED • This confirms the signed-in account, not a working-ship commission, Captain appointment or fleet launch readiness.':'The Captain may hold both offices. Admiral actions remain locked until Fleet Core verifies the dedicated Admiral identity.';
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
  window.DarkSkyAdmiralIdentityStatus=verifyAdmiral;
  window.DarkSkyAuthenticateAdmiral=async(email,password)=>{await signIn(email,password);return syncIdentity();};
  window.DarkSkySignOutAdmiral=async()=>{const result=await client().signOut();await syncIdentity();return result;};
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

/* 8.8.11.1 Fleet Door Repair — permanent keel, editable working name. */
;(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  let preview=null,confirmed=false,busy=false,fullLog=false,commissionedProject='',backendReady=false;
  const el=id=>document.getElementById(id);
  const station=()=>el('admiralCommissioningStation');
  const cfg=()=>window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.()||null;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatTime=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return String(value||'');}};
  const stationClient=()=>{const c=cfg();if(!c?.url||!c?.publishableKey)throw new Error('Supabase identity is not configured.');return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION_KEY});};
  const readSession=()=>stationClient().readSession();
  const saveSession=data=>stationClient().saveSession(data);
  const clearSession=()=>stationClient().clearSession();
  const headers=(token='')=>{const c=cfg();const value={apikey:c?.publishableKey||'','Content-Type':'application/json'};if(token)value.Authorization='Bearer '+token;return value;};
  async function refreshSession(session){return stationClient().refreshSession(session);}
  async function currentSession(){return stationClient().currentSession();}
  async function rpc(name,body={}){return stationClient().rpc(name,body,'The Admiral command was refused. Recheck its saved result before retrying.');}
  async function verifyAdmiral(){if(!cfg())return false;return stationClient().verifyAdmiralAuthority();}
  function values(){return {p_project_id:el('admiralCommissioningProject')?.value?.trim().toLowerCase()||'',p_namespace:el('admiralCommissioningNamespace')?.value?.trim().toLowerCase()||'',p_display_name:el('admiralCommissioningName')?.value?.trim()||'',p_mission_class:el('admiralCommissioningClass')?.value||'admiral_program',p_ownership_model:el('admiralCommissioningOwnership')?.value||'admiral_owned',p_operating_model:el('admiralCommissioningOperating')?.value||'fleet_operated',p_mission_summary:el('admiralCommissioningSummary')?.value?.trim()||''};}
  function setResult(message,verified=false){const node=el('admiralCommissioningResult');if(!node)return;node.textContent=message;node.classList.toggle('is-verified',verified);}
  function setBusy(next){busy=next;const verified=station()?.classList.contains('identity-verified');if(el('admiralCommissioningPreview'))el('admiralCommissioningPreview').disabled=next||!verified||!backendReady;if(el('admiralCommissioningIssue'))el('admiralCommissioningIssue').disabled=next||!verified||!backendReady||!preview||!confirmed||values().p_mission_class!=='admiral_program';if(el('admiralCommissioningLog'))el('admiralCommissioningLog').disabled=next||!verified||!backendReady;if(el('admiralCommissioningRename'))el('admiralCommissioningRename').disabled=next||!verified||!backendReady;}
  function invalidate(message='Review the working identity and permanent keel, then preview again.'){preview=null;confirmed=false;if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='AWAITING PREVIEW';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent=message;if(el('admiralCommissioningPreviewItems'))el('admiralCommissioningPreviewItems').innerHTML='<p>No Fleet Core row will be written until the order is issued.</p>';if(el('admiralCommissioningIssue'))el('admiralCommissioningIssue').disabled=true;el('admiralCommissioningResult')?.classList.remove('is-verified');}
  function ensureRenamePanel(){if(el('admiralCommissioningRenamePanel'))return;const log=station()?.querySelector('.admiral-course-log');if(!log)return;const panel=document.createElement('section');panel.id='admiralCommissioningRenamePanel';panel.className='admiral-commissioning-rename hidden';panel.innerHTML='<div><small>EDITABLE WORKING NAME</small><strong>Rename without rebuilding the keel</strong><span id="admiralCommissioningStableIdentity">The vessel UUID, project key, and namespace remain unchanged.</span></div><label>New working name<input data-bf-trim="boundary" id="admiralCommissioningRenameName" type="text" maxlength="80" placeholder="New working name"></label><button id="admiralCommissioningRename" class="admiral-pro-button" type="button">RENAME WORKING VESSEL</button>';log.before(panel);}
  async function signIn(){const email=el('admiralCommissioningEmail')?.value||'',password=el('admiralCommissioningPassword')?.value||'';await stationClient().signInWithPassword(email,password);try{if(!(await verifyAdmiral()))throw new Error('This account does not hold active Admiral authority.');}catch(error){clearSession();throw error;}finally{if(el('admiralCommissioningPassword'))el('admiralCommissioningPassword').value='';}}
  async function syncIdentity(){ensureRenamePanel();const verified=await verifyAdmiral();station()?.classList.toggle('identity-verified',verified);if(el('admiralCommissioningIdentityState'))el('admiralCommissioningIdentityState').textContent=verified?'ADMIRAL IDENTITY VERIFIED':'ADMIRAL IDENTITY REQUIRED';['admiralCommissioningSignIn','admiralCommissioningRecover'].forEach(id=>el(id)?.classList.toggle('hidden',verified));['admiralCommissioningEmail','admiralCommissioningPassword'].forEach(id=>el(id)?.closest('label')?.classList.toggle('hidden',verified));el('admiralCommissioningSignOut')?.classList.toggle('hidden',!verified);try{if(verified){if(el('admiralCommissioningBrief'))el('admiralCommissioningBrief').textContent='Bootstrap Build is ready for a read-only commissioning preview.';backendReady=true;await loadLog();setResult('Identity verified. Preview creates no vessel and changes no fleet state.');}else{backendReady=false;invalidate('Authenticate to inspect the commissioning boundary.');if(el('admiralCommissioningBrief'))el('admiralCommissioningBrief').textContent='Authenticate to preview a new vessel.';if(el('admiralCommissioningLogRows'))el('admiralCommissioningLogRows').innerHTML='<p>Authenticate to read the commissioning record.</p>';setResult('Authenticate the Admiral identity to begin.');}}catch(error){backendReady=false;invalidate('Fleet Core must be upgraded before this station can preview or issue an order.');setResult(error.message);if(el('admiralCommissioningLogRows'))el('admiralCommissioningLogRows').innerHTML='<p>Commissioning records become available after the Fleet Core upgrade.</p>';}finally{setBusy(false);}return verified;}
  window.DarkSkySyncCommissioningIdentity=syncIdentity;
  async function previewOrder(){setBusy(true);setResult('Checking the permanent keel. No vessel is being created…');try{const data=await rpc('admiral_preview_vessel_commission',values());preview=data;confirmed=true;if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='COMMISSIONING COURSE';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent='One new vessel identity will be created in commissioning state.';if(el('admiralCommissioningPreviewItems'))el('admiralCommissioningPreviewItems').innerHTML='<article class="will-change"><b>Working name · editable</b><span>'+escapeHtml(data.display_name)+'</span></article><article class="will-change"><b>Project key · permanent</b><span>'+escapeHtml(data.project_id)+'</span></article><article class="will-change"><b>Namespace · permanent</b><span>'+escapeHtml(data.namespace)+'</span></article><article><b>Active office</b><span>ADMIRAL · SERVER AUTHORITY</span></article><article><b>Ownership / operation</b><span>'+escapeHtml(String(data.ownership_model||'').replaceAll('_',' ').toUpperCase())+' · '+escapeHtml(String(data.operating_model||'').replaceAll('_',' ').toUpperCase())+'</span></article><article><b>Initial boundary</b><span>COMMISSIONING · NOT LIVE</span></article><article><b>Automatic grants</b><span>NO PROJECT OWNER MEMBERSHIP · NO FEATURES</span></article>';setResult(values().p_mission_class==='admiral_program'?'Internal program preview received; review its separate commissioning boundary.':'Keel preview received. New business commissioning is held until the executed agreement is server-verified. Use Contracts & Services.');return data;}finally{setBusy(false);}}
  async function issueOrder(){if(values().p_mission_class!=='admiral_program')throw new Error('CharterGuard: signed-agreement server verification is required before commissioning a new business or fleet service. Prepare the contract in Contracts & Services. No commission was sent.');if(!preview||!confirmed)throw new Error('Preview the commissioning order before issuing it.');setBusy(true);setResult('Issuing one Admiral commissioning order…');try{const body={...values(),p_expected_fingerprint:preview.fingerprint,p_intent:el('admiralCommissioningIntent')?.value?.trim()||''};const data=await rpc('admiral_issue_vessel_commission',body);commissionedProject=data.project_id;confirmed=false;preview=null;if(el('admiralCommissioningIntent'))el('admiralCommissioningIntent').value='';if(el('admiralCommissioningPreviewState'))el('admiralCommissioningPreviewState').textContent='VESSEL COMMISSIONED';if(el('admiralCommissioningPreviewDetail'))el('admiralCommissioningPreviewDetail').textContent='Verified readback: the Fleet Core identity exists and is not live.';if(el('admiralCommissioningStableIdentity'))el('admiralCommissioningStableIdentity').textContent='Stable identity: '+data.vessel_id+' · '+data.project_id+' · '+data.namespace;el('admiralCommissioningRenamePanel')?.classList.remove('hidden');if(el('admiralCommissioningRenameName'))el('admiralCommissioningRenameName').value=data.display_name;setResult('COMMISSIONING VERIFIED · '+data.display_name+' is '+String(data.ownership_model||body.p_ownership_model).replaceAll('_',' ').toUpperCase()+'. No individual owner membership, feature, or live publication was granted.',true);await loadLog();await window.DarkSkySyncVesselBrandIdentity?.();return data;}finally{setBusy(false);}}
  function describe(record){const d=record.detail||{};return record.action==='vessel_working_name_changed'?'RENAMED · '+(d.old_display_name||'—')+' → '+(d.new_display_name||'—'):'COMMISSIONED · '+(d.display_name||d.project_id||'New vessel')+' · NOT LIVE';}
  async function loadLog(){const data=await rpc('admiral_list_vessel_commission_log',{p_limit:fullLog?100:5}),records=data.records||[],container=el('admiralCommissioningLogRows');if(container)container.innerHTML=records.length?records.map(record=>'<article class="admiral-course-log-row"><div><small>ORDER #'+escapeHtml(record.id)+' · '+escapeHtml(formatTime(record.created_at))+'</small><b>'+escapeHtml(record.detail?.display_name||record.detail?.new_display_name||record.detail?.project_id||'Vessel order')+'</b><span>'+escapeHtml(describe(record))+'</span><em>By '+escapeHtml(record.actor||'Admiral')+'</em></div></article>').join(''):'<p>No commissioning orders are recorded.</p>';if(el('admiralCommissioningLog'))el('admiralCommissioningLog').textContent=fullLog?'SHOW RECENT':'OPEN FULL LOG';return records;}
  async function renameVessel(){const name=el('admiralCommissioningRenameName')?.value?.trim()||'';if(!commissionedProject)throw new Error('Commission a vessel in this session before renaming it here.');if(!window.confirm('Rename this working vessel to “'+name+'”?\n\nIts permanent identity and records will not change.'))return;setBusy(true);try{const data=await rpc('admiral_rename_vessel',{p_project_id:commissionedProject,p_display_name:name,p_intent:'Working-name correction from Commissioning Orders'});if(el('admiralCommissioningName'))el('admiralCommissioningName').value=data.display_name;setResult('RENAME VERIFIED · '+data.old_display_name+' is now '+data.display_name+'. The vessel UUID, project key, and namespace are unchanged.',true);await loadLog();}finally{setBusy(false);}}
  document.addEventListener('click',async event=>{const target=event.target;if(target.closest('#admiralCommissioningSignIn')){const button=el('admiralCommissioningSignIn');if(button?.disabled)return;try{button.disabled=true;button.textContent='AUTHENTICATING…';await signIn();await syncIdentity();window.DarkSkySyncAdmiralIdentity?.();}catch(error){setResult(error.message);}finally{button.disabled=false;button.textContent='AUTHENTICATE ADMIRAL';}return;}if(target.closest('#admiralCommissioningRecover')){location.href='./index.html?surface=admiral-recovery-request';return;}if(target.closest('#admiralCommissioningSignOut')){clearSession();await syncIdentity();window.DarkSkySyncAdmiralIdentity?.();return;}if(target.closest('#admiralCommissioningPreview')){try{await previewOrder();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningIssue')){try{await issueOrder();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningLog')){fullLog=!fullLog;try{await loadLog();}catch(error){setResult(error.message);}return;}if(target.closest('#admiralCommissioningRename')){try{await renameVessel();}catch(error){setResult(error.message);}return;}});
  document.addEventListener('input',event=>{if(event.target.matches('#admiralCommissioningName,#admiralCommissioningSummary,#admiralCommissioningProject,#admiralCommissioningNamespace,#admiralCommissioningIntent'))invalidate('Commissioning details changed. Preview again before issuing.');});
  document.addEventListener('change',event=>{if(event.target.matches('#admiralCommissioningClass,#admiralCommissioningOwnership,#admiralCommissioningOperating'))invalidate('Commissioning authority or operating boundary changed. Preview again before issuing.');});
})();

/* 8.8.17.1 legacy Authority Ledger retained for rollback; superseded by Ledger Integrity. */
;false&&(()=>{
  const SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  const el=id=>document.getElementById(id);
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pretty=value=>String(value||'recorded activity').replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());
  const time=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return String(value||'');}};
  let activeOffice='captain',query='',serverRows=[],serverMessage='Admiral office not requested.';
  function install(){
    if(el('authorityLedger'))return;
    document.body.insertAdjacentHTML('beforeend',`<section id="authorityLedger" class="authority-ledger hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="authorityLedgerTitle"><div class="authority-ledger-shell"><header><div><small>8.8.17 · ADMIRAL COMMISSION</small><h2 id="authorityLedgerTitle">Authority Ledger</h2><p>One person may hold both offices. Every retained act still declares which office acted, what authority it used, and what exact target it touched.</p></div><button id="authorityLedgerClose" type="button">CLOSE</button></header><section class="authority-ledger-commission"><article><small>COMMISSIONED PERSON</small><b>CAPTAIN + ADMIRAL</b><span>Same human; two explicit offices.</span></article><article><small>ACTIVE OFFICE</small><b id="authorityLedgerOfficeLabel">CAPTAIN</b><span id="authorityLedgerAuthorityLabel">Local Captain command evidence</span></article><article><small>BOUNDARY</small><b>NO SILENT ELEVATION</b><span>Admiral rows require server authority.</span></article></section><nav class="authority-ledger-office" aria-label="Authority office filter"><button type="button" data-ledger-office="captain" aria-pressed="true">CAPTAIN</button><button type="button" data-ledger-office="admiral" aria-pressed="false">ADMIRAL</button><button type="button" data-ledger-office="all" aria-pressed="false">BOTH OFFICES</button></nav><section class="authority-ledger-tools"><label>Find target, action, or detail<input data-bf-trim="boundary" id="authorityLedgerSearch" type="search" placeholder="Vessel, program, action, intent…"></label><button id="authorityLedgerRefresh" type="button">REFRESH LEDGER</button></section><p id="authorityLedgerStatus" class="authority-ledger-status" role="status" aria-live="polite">Ledger ready.</p><div id="authorityLedgerRows" class="authority-ledger-rows"></div><footer><b>Ledger rule</b><span>Browser evidence is identified as local evidence. Admiral orders are labeled server-attested only when read through authenticated Fleet Core authority.</span></footer></div></section>`);
  }
  function installCommissioningChoices(){
    const mission=el('admiralCommissioningClass');
    if(!mission||el('admiralCommissioningOwnership'))return;
    mission.closest('label')?.insertAdjacentHTML('afterend','<label>Ownership model<select id="admiralCommissioningOwnership"><option value="admiral_owned">Admiral-owned program</option><option value="fleet_unassigned">Fleet unassigned</option><option value="outside_owner_pending">Outside owner pending</option></select></label><label>Operating model<select id="admiralCommissioningOperating"><option value="fleet_operated">Fleet operated</option><option value="captain_operated">Captain operated</option><option value="delegated_operator">Delegated operator</option><option value="owner_operated">Owner operated</option></select></label>');
    const boundary=el('admiralCommissioningStation')?.querySelectorAll('.admiral-commissioning-boundary span')?.[1];
    if(boundary)boundary.innerHTML='<b id="admiralCommissioningOwnershipState">ADMIRAL OWNED</b><small>NO PROJECT OWNER MEMBERSHIP</small>';
    const note=el('admiralCommissioningStation')?.querySelector('.admiral-package-note span');
    if(note)note.textContent='An Admiral-owned order records the fleet ownership model; it does not create an individual project-owner membership. Every commission creates no entitlement and no live publication.';
    el('admiralCommissioningOwnership')?.addEventListener('change',paintCommissioningBoundary);
    paintCommissioningBoundary();
  }
  function paintCommissioningBoundary(){
    const ownership=el('admiralCommissioningOwnership')?.value||'admiral_owned',node=el('admiralCommissioningOwnershipState');
    if(node)node.textContent=ownership.replaceAll('_',' ').toUpperCase();
  }
  function localRows(){
    const rows=window.BlackFlagV3Core?.readAudit?.()||[];
    return rows.map(row=>{const role=String(row.actorRole||'system').toLowerCase(),office=['captain','admiral','engine','system'].includes(role)?role:'system';return {id:row.id,created_at:row.at,office,source:'BROWSER EVIDENCE',action:row.action,target:row.projectId||'Fleet / platform',detail:row.detail||row.category||'',result:'RECORDED',authority_used:role};});
  }
  function normalizeServer(record){
    const detail=record.detail||{};
    return {id:record.id,created_at:record.created_at,office:String(record.acting_office||record.authority_used||'admiral').toLowerCase(),source:'SERVER ATTESTED',action:record.action,target:record.display_name||detail.display_name||detail.new_display_name||record.project_id||detail.project_id||'Fleet / platform',detail:detail.intent||detail.mission_summary||detail.new_display_name||JSON.stringify(detail),result:'VERIFIED',authority_used:record.authority_used||'admiral'};
  }
  async function readServer(){
    if(!(await window.DarkSkyAdmiralIdentityStatus?.())){serverRows=[];serverMessage='Admiral office locked. Authenticate a dedicated Admiral account with active server authority to read server-attested entries.';return;}
    const config=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();
    if(!config?.url||!config?.publishableKey)throw new Error('Supabase identity is not configured.');
    const client=window.DarkSkySupabase.create({url:config.url,publishableKey:config.publishableKey,sessionKey:SESSION_KEY,build:window.__darkSkyVerifiedRelease.build});
    try{
      const data=await client.rpc('admiral_read_authority_ledger',{p_limit:200,p_authority:null,p_project_id:null},'The Admiral ledger could not be read.');
      serverRows=(data?.records||[]).map(normalizeServer);
      serverMessage='Server-attested Admiral ledger read successfully.';
    }catch(error){
      if(/could not find the function|schema cache|authority ledger/i.test(String(error?.message||error)))serverMessage='Fleet Core upgrade 8.8.17 is required before the server-attested Admiral ledger can open. Captain evidence remains available.';
      else serverMessage=String(error?.message||error);
      serverRows=[];
    }
  }
  function render(){
    let rows=activeOffice==='captain'?localRows().filter(row=>row.office!=='admiral'):activeOffice==='admiral'?serverRows:[...serverRows,...localRows()];
    const needle=query.trim().toLowerCase();
    if(needle)rows=rows.filter(row=>[row.office,row.source,row.action,row.target,row.detail,row.authority_used].join(' ').toLowerCase().includes(needle));
    rows.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
    const host=el('authorityLedgerRows');
    if(host)host.innerHTML=rows.length?rows.slice(0,200).map(row=>`<article class="authority-ledger-row"><div><small>${safe(time(row.created_at))} · ${safe(row.source)}</small><b>${safe(pretty(row.action))}</b><span>${safe(row.detail||'No additional detail retained.')}</span></div><dl><div><dt>OFFICE</dt><dd>${safe(String(row.office).toUpperCase())}</dd></div><div><dt>TARGET</dt><dd>${safe(row.target)}</dd></div><div><dt>AUTHORITY</dt><dd>${safe(String(row.authority_used||row.office).toUpperCase())}</dd></div><div><dt>RESULT</dt><dd>${safe(row.result)}</dd></div></dl></article>`).join(''):`<article class="authority-ledger-empty"><b>No matching entries</b><span>${safe(activeOffice==='admiral'?serverMessage:'No retained Captain evidence matches this filter.')}</span></article>`;
    if(el('authorityLedgerStatus'))el('authorityLedgerStatus').textContent=(activeOffice==='captain'?'Captain office · browser evidence. ':activeOffice==='admiral'?'Admiral office · '+serverMessage:'Both offices · '+serverMessage)+' Showing '+rows.length+' entr'+(rows.length===1?'y.':'ies.');
    if(el('authorityLedgerOfficeLabel'))el('authorityLedgerOfficeLabel').textContent=activeOffice==='all'?'BOTH OFFICES':activeOffice.toUpperCase();
    if(el('authorityLedgerAuthorityLabel'))el('authorityLedgerAuthorityLabel').textContent=activeOffice==='captain'?'Local Captain command evidence':activeOffice==='admiral'?'Authenticated Fleet Core authority':'Separate evidence streams; never merged silently';
  }
  async function refresh(){
    const button=el('authorityLedgerRefresh');if(button){button.disabled=true;button.textContent='READING…';}
    try{if(activeOffice!=='captain')await readServer();render();}finally{if(button){button.disabled=false;button.textContent='REFRESH LEDGER';}}
  }
  async function open(office){
    install();activeOffice=office;query='';if(el('authorityLedgerSearch'))el('authorityLedgerSearch').value='';
    const ledger=el('authorityLedger');ledger?.classList.remove('hidden');ledger?.setAttribute('aria-hidden','false');document.body.classList.add('authority-ledger-open');
    document.querySelectorAll('[data-ledger-office]').forEach(button=>{const selected=button.dataset.ledgerOffice===activeOffice;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-selected',selected);});
    await refresh();
  }
  function close(){const ledger=el('authorityLedger');ledger?.classList.add('hidden');ledger?.setAttribute('aria-hidden','true');document.body.classList.remove('authority-ledger-open');}
  document.addEventListener('click',event=>{
    if(event.target.closest('#captainAuthorityLedgerOpen')){open('captain');return;}
    if(event.target.closest('#admiralAuthorityLedgerOpen')){open('admiral');return;}
    if(event.target.closest('#authorityLedgerClose')){close();return;}
    const office=event.target.closest('[data-ledger-office]');if(office){activeOffice=office.dataset.ledgerOffice;document.querySelectorAll('[data-ledger-office]').forEach(button=>{const selected=button===office;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-selected',selected);});refresh();return;}
    if(event.target.closest('#authorityLedgerRefresh'))refresh();
  });
  document.addEventListener('input',event=>{if(event.target.matches('#authorityLedgerSearch')){query=event.target.value;render();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('authorityLedger')?.classList.contains('hidden'))close();});
  const observer=new MutationObserver(()=>installCommissioningChoices());observer.observe(document.documentElement,{childList:true,subtree:true});
  install();installCommissioningChoices();
  window.DarkSkyOpenAuthorityLedger=open;
})();

/* Fleet Watchtower owns the final daily My Fleet route after legacy modules load. */
if(window.DarkSkyOpenFleetWatchtower)window.DarkSkyOpenAdmiralFleet=window.DarkSkyOpenFleetWatchtower;


/* Dark Sky 8.8.20.14 Quarterdeck — lifecycle-mounted exact-vessel delegation.
   Presentation/controller repair only. Existing authenticated RPC contracts remain authoritative.
   No polling installer, no data deletion, no automatic issue/revoke/departure. */
;(() => {
  'use strict';
  const BUILD=window.__darkSkyVerifiedRelease.build, SESSION_KEY='darkSkySupabaseAdmiralSessionV1';
  const $=id=>document.getElementById(id);
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let deck=null,panel=null,observer=null,readinessObserver=null;
  let vessels=[],appointments=[],appointmentPreview=null,departurePreview=null;
  let ready=false,busy=false,operation=0,loadedSession='',attemptedSession='',evidenceReadAt='',wasVisible=false,currentTab='appoint',previousLane='';
  const controls=['harborVessel','harborCaptainEmail','harborCaptainIntent','harborEvidenceRef','harborDepartureAcknowledgment'];
  function client(){
    const c=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();
    if(!c?.url||!c?.publishableKey||!window.DarkSkySupabase?.create)throw new Error('Fleet Core connection is not configured.');
    return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION_KEY,build:BUILD});
  }
  function sessionMark(){
    const s=window.DarkSkyAdmiralSession?.status();
    // Local eligibility is not authority. Every network call still uses the original server-checked transport.
    if(!s?.reusable||!s.startedAt)return '';
    try{return `${s.startedAt}:${client().readSession()?.user?.id||''}`;}catch(_){return '';}
  }
  function visible(){return !!deck?.isConnected&&!deck.classList.contains('hidden')&&deck.getAttribute('aria-hidden')!=='true';}
  function active(){return visible()&&deck.dataset.admiralLane==='delegate'&&!!sessionMark();}
  function selected(){return $('harborVessel')?.value||'';}
  function message(text,tone='info'){const n=$('harborMasterResult');if(n){n.textContent=text;n.dataset.tone=tone;}}
  function backend(text){const n=$('harborMasterBackend');if(n)n.textContent=text;}
  function checked(){return ready&&!busy&&active();}
  function appointmentMatches(){return !!appointmentPreview&&appointmentPreview.project_id===selected()&&appointmentPreview.candidate_email===($('harborCaptainEmail')?.value||'').trim().toLowerCase()&&!appointmentPreview.open_appointment;}
  function departureMatches(){return !!departurePreview&&departurePreview.project_id===selected()&&departurePreview.working_ship_evidence_reference===($('harborEvidenceRef')?.value||'').trim()&&departurePreview.operating_authority_ready===true;}
  function state(){
    const enabled=checked();
    for(const id of controls){const n=$(id);if(n)n.disabled=busy||!ready||!active();}
    for(const id of ['harborPreviewCaptain','harborPreviewActivation','harborCopyRoute'])if($(id))$(id).disabled=!enabled||!selected();
    if($('harborIssueCaptain'))$('harborIssueCaptain').disabled=!enabled||currentTab!=='appoint'||!appointmentMatches();
    if($('harborActivateVessel'))$('harborActivateVessel').disabled=true; // CharterGuard: no verified signed-agreement service is installed.
    if($('harborRefresh'))$('harborRefresh').disabled=busy||!active();
    if($('harborEvidenceExport'))$('harborEvidenceExport').disabled=!enabled||!selected();
    panel?.querySelectorAll('[data-harbor-revoke]').forEach(b=>b.disabled=!enabled);
    if($('harborMasterStation'))$('harborMasterStation').setAttribute('aria-busy',String(busy));
    for(const [id,label] of [['harborPreviewCaptain','PREVIEW APPOINTMENT'],['harborIssueCaptain','ISSUE APPOINTMENT'],['harborPreviewActivation','PREVIEW DEPARTURE'],['harborActivateVessel','DEPARTURE HELD — CONTRACT CHECK']])if($(id))$(id).textContent=label;
  }
  function validity(){if(!selected()){message('Choose one vessel first.','watch');$('harborVessel')?.focus();return false;}return true;}
  function paintAppointment(){
    const box=$('harborCaptainPreview');if(!box)return;
    if(!appointmentPreview){box.innerHTML='<small>PREVIEW FIRST</small><h5>Nothing has been issued.</h5><p>Choose a vessel and an account email. Preview shows the exact scope before you decide.</p><p class="qd-muted">Acceptance grants vessel operations only—not ownership or fleet-wide Captain authority.</p>';}
    else{const p=appointmentPreview;box.innerHTML=`<small>${p.open_appointment?'APPOINTMENT ALREADY OPEN':'REVIEW THE EXACT APPOINTMENT'}</small><h5>${safe(p.vessel_name)}</h5><p class="qd-email">${safe(p.candidate_email)}</p><p>${p.candidate_account_exists?'Account found':'Account not found yet'} · ${safe(p.lifecycle_state)} · ${safe(p.operating_model).replaceAll('_',' ')}</p><p>${p.open_appointment?`An appointment is ${safe(p.open_appointment.status)}. Review its history; a second issue is blocked.`:'Issue creates a pending appointment. The candidate must sign in and accept before vessel authority is granted.'}</p>`;}
    state();
  }
  function paintDeparture(){
    const box=$('harborActivationPreview');if(!box)return;
    if(!departurePreview){box.innerHTML='<small>CONTRACT VERIFICATION REQUIRED</small><h5>Production departure held.</h5><p>Use Contracts &amp; Services to prepare the signed-agreement packet. A local file or reference is not server-verified signing proof. Departure is disabled in this client.</p>';}
    else{const p=departurePreview;box.innerHTML=`<small>${p.operating_authority_ready?'OPERATING AUTHORITY PRESENT':'DEPARTURE BLOCKED'}</small><h5>${safe(p.vessel_name)}</h5><p>${safe(p.operating_authority_detail)}</p><p>Current: ${safe(p.lifecycle_state)} · ${safe(p.operating_model).replaceAll('_',' ')}</p><p>Proof reference: ${safe(p.working_ship_evidence_reference)}</p><p>Only the Fleet lifecycle would change to ACTIVE. Ownership and customer publication stay unchanged.</p>`;}
    state();
  }
  function paintRoute(){
    const project=selected(),out=$('harborCaptainRoute');
    if(!out)return;
    if(!project){out.textContent='Choose a vessel to view its handoff route.';return;}
    try{const u=new URL('./owner.html',location.href);u.searchParams.set('surface','vessel-captain');u.searchParams.set('project',project);out.textContent=u.toString();}
    catch(_){out.textContent='Handoff link requires the deployed website address.';}
  }
  function date(v){if(!v)return 'Not recorded';const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString():'Invalid server date';}
  function paintHistory(){
    const rows=$('harborAppointmentRows');if(!rows)return;
    const project=selected(),items=project?appointments.filter(a=>a.project_id===project):appointments;
    if($('harborHistoryScope'))$('harborHistoryScope').textContent=project?`${items.length} appointment record(s) for the selected vessel`:`${items.length} appointment record(s) across authorized vessels`;
    rows.innerHTML=!ready?'<p>Server records have not been loaded. Use Refresh after authentication.</p>':!items.length?'<p>No Captain appointments are recorded for this selection.</p>':items.map(a=>`<article class="qd-history-row"><div><small>${safe(a.status).toUpperCase()} · ${safe(a.project_id)}</small><h5>${safe(a.vessel_name)}</h5><p>${safe(a.candidate_email)}</p><span>Appointed ${safe(date(a.appointed_at))}${a.accepted_at?' · Accepted '+safe(date(a.accepted_at)):' · Expires '+safe(date(a.expires_at))}</span>${a.decision_note?'<p>'+safe(a.decision_note)+'</p>':''}</div>${['pending','accepted','suspended'].includes(a.status)?`<button type="button" data-harbor-revoke="${safe(a.appointment_id)}">REVIEW REVOCATION</button>`:''}</article>`).join('');
    state();
  }
  function evidenceSnapshot(){
    if(!ready||!active()||!selected()||!evidenceReadAt)throw new Error('Refresh authenticated records and select an exact vessel.');
    const core=window.BlackFlagFleetguardAdmiralCore;
    if(typeof core?.assess!=='function')throw new Error('Fleetguard evidence validator is missing from this release.');
    return core.assess({vessels,appointments,project_id:selected(),read_at:evidenceReadAt});
  }
  function paintEvidence(){
    const box=$('harborEvidenceReport');if(!box)return;
    box.replaceChildren();
    if(!ready||!active()||!selected()){
      box.textContent=ready?'Select one vessel to inspect its authenticated evidence.':'Sign in and refresh server records to inspect this vessel. No evidence has been asserted.';
      return;
    }
    try{
      const report=evidenceSnapshot();
      const heading=document.createElement('div');heading.className='qd-evidence-summary';
      const strong=document.createElement('strong');strong.textContent=report.vessel_name+' · '+report.project_id;
      const status=document.createElement('span');status.textContent='COMMISSIONING NOT VERIFIED · '+report.independently_verified+'/'+report.total_gates;
      heading.append(strong,status);box.append(heading);
      const meta=document.createElement('p');meta.className='qd-muted';
      meta.textContent='Authenticated server list read: '+date(report.read_at)+' · lifecycle '+report.lifecycle_state+' · operating model '+report.operating_model.replaceAll('_',' ')+'.';
      box.append(meta);
      const counts=document.createElement('p');counts.className='qd-muted';
      counts.textContent='Recorded appointments: '+report.observed.accepted_appointment_records+' accepted, '+report.observed.pending_appointment_records+' pending, '+report.observed.revoked_appointment_records+' revoked. This does not prove effective access.';
      box.append(counts);
      const list=document.createElement('ul');list.className='qd-evidence-gates';
      report.gates.forEach(g=>{const li=document.createElement('li'),label=document.createElement('strong'),state=document.createElement('span'),desc=document.createElement('small');
        label.textContent=g.label;state.textContent=g.status;desc.textContent=g.detail;li.append(label,state,desc);list.append(li);});
      box.append(list);
    }catch(error){box.textContent='Evidence unavailable: '+String(error.message||error);}
  }
  async function exportEvidence(){
    if(!checked()||currentTab!=='evidence'||!validity())return;
    const project=selected(),t=token();if(!t)return;
    message('Rechecking Admiral authority and refreshing read-only evidence.');
    try{
      await verified(t);
      if(!(await readRecords(t))||!current(t)||selected()!==project)throw Error('Vessel scope changed while records were read.');
      const report=evidenceSnapshot();
      if(report.project_id!==project||report.ready!==false)throw Error('Unsafe evidence response.');
      const bytes=JSON.stringify(report,null,2)+'\n';
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/json'}));
      try{const a=document.createElement('a');a.href=url;a.download='blackflag-'+project.replace(/[^a-z0-9_-]/gi,'_')+'-keelwatch-evidence.json';a.click();}
      finally{setTimeout(()=>URL.revokeObjectURL(url),10000);}
      if(current(t))message('Exact-vessel evidence downloaded. No appointment, role, record or commissioning status changed.','verified');
    }catch(error){if(current(t))message('Evidence export unavailable: '+String(error.message||error)+' No records changed.','watch');}
    finally{finish(t);}
  }
  function invalidate(){appointmentPreview=null;departurePreview=null;if($('harborDepartureAcknowledgment'))$('harborDepartureAcknowledgment').checked=false;paintAppointment();paintDeparture();}
  function changeTab(name,focus=false){
    currentTab=['appoint','history','departure','evidence'].includes(name)?name:'appoint';
    panel?.querySelectorAll('[data-qd-tab]').forEach(b=>{const yes=b.dataset.qdTab===currentTab;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;if(yes&&focus)b.focus({preventScroll:true});});
    panel?.querySelectorAll('[data-qd-panel]').forEach(n=>n.hidden=n.dataset.qdPanel!==currentTab);
    if(currentTab==='history')paintHistory();
    if(currentTab==='evidence')paintEvidence();
    state();
  }
  function conceal(){
    operation++;busy=false;ready=false;loadedSession='';attemptedSession='';evidenceReadAt='';vessels=[];appointments=[];
    for(const id of ['harborCaptainEmail','harborCaptainIntent','harborEvidenceRef'])if($(id))$(id).value='';
    if($('harborVessel'))$('harborVessel').innerHTML='<option value="">Choose a vessel</option>';
    invalidate();paintHistory();paintEvidence();paintRoute();backend('ACCOUNT CHECK REQUIRED');message('Sign in before loading delegation records. No saved business records were changed.');
  }
  function token(){if(busy||!active())return null;busy=true;state();return {id:++operation,session:sessionMark()};}
  function current(t){return !!t&&t.id===operation&&t.session===sessionMark()&&active();}
  function finish(t){if(t?.id===operation){busy=false;state();}}
  async function verified(t){const ok=await window.DarkSkyAdmiralIdentityStatus?.();if(!ok||!current(t))throw new Error('Admiral authority could not be verified. The operation was not continued.');}
  async function rpc(name,body={}){return client().rpc(name,body,'Fleet Core could not complete this request.');}
  function validateRecords(v,a){
    if(!Array.isArray(v?.records)||!Array.isArray(a?.records))throw new Error('Fleet Core returned incomplete delegation records.');
    const rows=v.records.filter(x=>x.mission_class!=='admiral_program');
    if(rows.some(x=>!x.project_id||typeof x.display_name!=='string')||new Set(rows.map(x=>x.project_id)).size!==rows.length)throw new Error('Vessel identity records could not be reconciled.');
    if(a.records.some(x=>!x.appointment_id||!x.project_id||typeof x.status!=='string'))throw new Error('Appointment records could not be reconciled.');
    return {vessels:rows,appointments:a.records};
  }
  async function readRecords(t){
    const [v,a]=await Promise.all([rpc('admiral_list_vessels_for_branding'),rpc('admiral_list_captain_appointments',{p_project_id:null})]);
    if(!current(t))return false;
    const data=validateRecords(v,a),old=selected();
    vessels=data.vessels;appointments=data.appointments;evidenceReadAt=new Date().toISOString();ready=true;loadedSession=t.session;
    const select=$('harborVessel');select.innerHTML='<option value="">Choose a vessel</option>'+vessels.map(x=>`<option value="${safe(x.project_id)}">${safe(x.display_name)} · ${safe(x.lifecycle_state)}</option>`).join('');
    if(vessels.some(v=>v.project_id===old))select.value=old;
    backend('SERVER RECORDS LOADED');paintHistory();paintEvidence();paintRoute();return true;
  }
  async function load(){
    const t=token();if(!t)return;
    attemptedSession=t.session;invalidate();backend('READING FLEET CORE');message('Reading vessel and appointment records. No authority changes.');
    try{await verified(t);if(await readRecords(t))message('Server records loaded. Preview first; no appointment or vessel state changed.','verified');}
    catch(e){if(current(t)){ready=false;backend('RECORDS UNAVAILABLE');paintHistory();message('Delegation records unavailable: '+e.message+' Use Refresh to retry; no command is replayed.','watch');}}
    finally{finish(t);}
  }
  async function previewCaptain(){
    if(!checked()||!validity())return;
    const input=$('harborCaptainEmail');if(!input.reportValidity())return;
    const project=selected(),email=input.value.trim().toLowerCase(),t=token();if(!t)return;
    appointmentPreview=null;paintAppointment();message('Checking the exact-vessel appointment preview…');
    try{await verified(t);const data=await rpc('admiral_preview_captain_appointment',{p_project_id:project,p_captain_email:email});if(!current(t))return;
      if(data?.project_id!==project||data?.candidate_email!==email||typeof data.fingerprint!=='string'||!data.fingerprint)throw new Error('The preview did not match the requested vessel and account.');
      appointmentPreview=Object.freeze({...data});paintAppointment();message(data.open_appointment?'An appointment is already open. Review Appointments & History before taking any action.':'Preview received. Nothing issued; candidate acceptance remains required.','verified');
    }catch(e){if(current(t)){appointmentPreview=null;paintAppointment();message('Preview unavailable: '+e.message,'watch');}}finally{finish(t);}
  }
  async function issueCaptain(){
    if(!checked()||currentTab!=='appoint'||!appointmentMatches())return;
    const p=appointmentPreview,intent=$('harborCaptainIntent').value.trim(),t=token();if(!t)return;
    appointmentPreview=null;paintAppointment();message('Issuing one pending appointment. Do not repeat this request.');
    let responseReceived=false;
    try{await verified(t);const data=await rpc('admiral_issue_captain_appointment',{p_project_id:p.project_id,p_captain_email:p.candidate_email,p_expected_fingerprint:p.fingerprint,p_intent:intent});responseReceived=true;if(!current(t))return;
      if(!data?.appointment_id||data.project_id!==p.project_id||data.candidate_email!==p.candidate_email||data.status!=='pending'||data.authority_granted!==false)throw new Error('Appointment response could not be reconciled.');
      if(!(await readRecords(t)))return;
      const row=appointments.find(x=>x.appointment_id===data.appointment_id&&x.project_id===p.project_id&&x.candidate_email===p.candidate_email&&x.status==='pending');
      if(!row)throw new Error('The issued appointment has not been confirmed by the independent list readback.');
      message(`PENDING APPOINTMENT VERIFIED · ${p.vessel_name} → ${p.candidate_email}. The candidate must accept with their own account; no vessel authority is granted yet.`,'verified');
      changeTab('history');
    }catch(e){if(current(t))message(`${responseReceived?'Request returned; readback is incomplete.':'Issue result is unconfirmed.'} ${e.message} Refresh history before a new preview; do not resubmit blindly.`,'watch');}finally{finish(t);}
  }
  async function revoke(id){
    if(!checked()||currentTab!=='history')return;
    const row=appointments.find(a=>a.appointment_id===id);if(!row||!['pending','accepted','suspended'].includes(row.status))return;
    if(!window.confirm(`Revoke the Captain appointment for ${row.vessel_name}?\n\nAccount: ${row.candidate_email}\n\nOnly membership created by this appointment is subject to revocation. Preexisting membership and ownership are not deleted.`))return;
    const t=token();if(!t)return;invalidate();message('Revoking the selected appointment. Do not repeat this request.');
    try{await verified(t);const data=await rpc('admiral_revoke_captain_appointment',{p_appointment_id:id,p_reason:'Revoked from Quarterdeck after explicit confirmation'});if(!current(t))return;
      if(data?.appointment_id!==id||data.status!=='revoked')throw new Error('Revocation response did not match the selected appointment.');
      if(!(await readRecords(t)))return;
      if(!appointments.some(a=>a.appointment_id===id&&a.status==='revoked'))throw new Error('Revocation was not confirmed by the history readback.');
      message(`REVOCATION RECORDED · ${row.vessel_name}. Appointment-created membership revoked: ${data.membership_revoked?'yes':'no / preexisting membership retained'}. A separate access-denial test is still required.`,'verified');
    }catch(e){if(current(t))message('Revocation result requires review: '+e.message+' Refresh history before attempting another command.','watch');}finally{finish(t);}
  }
  async function previewDeparture(){
    if(!checked()||!validity())return;
    const input=$('harborEvidenceRef');if(!input.reportValidity())return;
    const project=selected(),evidence=input.value.trim();if(evidence.length<8){message('Enter a proof reference of at least 8 characters.','watch');return;}
    const t=token();if(!t)return;departurePreview=null;$('harborDepartureAcknowledgment').checked=false;paintDeparture();message('Checking operating authority and the departure reference. No lifecycle change.');
    try{await verified(t);const data=await rpc('admiral_preview_vessel_activation',{p_project_id:project,p_evidence_reference:evidence});if(!current(t))return;
      if(data?.project_id!==project||data.working_ship_evidence_reference!==evidence||typeof data.fingerprint!=='string'||!data.fingerprint||typeof data.operating_authority_ready!=='boolean')throw new Error('Departure preview did not match this vessel and reference.');
      departurePreview=Object.freeze({...data});paintDeparture();message(data.operating_authority_ready?'Preview received. Inspect the actual field evidence; the reference alone is not proof. No vessel has departed.':'Departure blocked: '+data.operating_authority_detail,data.operating_authority_ready?'info':'watch');
    }catch(e){if(current(t)){departurePreview=null;paintDeparture();message('Departure preview unavailable: '+e.message,'watch');}}finally{finish(t);}
  }
  async function depart(){message('CharterGuard: departure is held until the executed agreement, signer authority and operating proof are verified by the server. No departure request was sent.','watch');}
  async function copyRoute(){
    if(!checked()||!validity())return;const value=$('harborCaptainRoute').textContent;
    if(!/^https?:\/\//.test(value))return;
    try{await navigator.clipboard.writeText(value);message('Handoff route copied. No email sent; the link alone grants no authority.','verified');}
    catch(_){message('Clipboard unavailable. Select and copy the displayed route. No email was sent.','watch');}
  }
  function installError(error){
    if(!panel)return;panel.dataset.quarterdeck='error';panel.replaceChildren();
    const h=document.createElement('h4');h.textContent='DELEGATION DISPLAY UNAVAILABLE';
    const p=document.createElement('p');p.textContent='The station did not initialize. No command was issued. Retry the display without reloading business data.';
    const b=document.createElement('button');b.type='button';b.textContent='RETRY DELEGATION DISPLAY';b.onclick=()=>{panel.dataset.quarterdeck='';mount();};
    panel.append(h,p,b);
  }
  function mount(){
    const next=$('admiralDeck'),host=next?.querySelector('[data-admiral-panel="delegate"]');
    if(!next||!host)return false;
    if(host.dataset.quarterdeck==='ready'&&next===deck)return true;
    if(host.dataset.quarterdeck==='error'&&next===deck)return false;
    if(deck!==next){observer?.disconnect();readinessObserver?.disconnect();operation++;busy=false;ready=false;loadedSession='';attemptedSession='';evidenceReadAt='';vessels=[];appointments=[];wasVisible=false;previousLane='';}
    deck=next;panel=host;
    try{
      panel.innerHTML=`<section class="qd-station" id="harborMasterStation" aria-label="Vessel Captain delegation" aria-busy="false">
        <header class="qd-title"><div><small>03 · DELEGATE</small><h4>One Captain. One vessel.</h4></div><span id="harborMasterBackend" class="qd-backend">ACCOUNT CHECK REQUIRED</span></header>
        <nav class="qd-tabs" role="tablist" aria-label="Delegation tasks">
          <button type="button" role="tab" id="qdTab-appoint" data-qd-tab="appoint" aria-controls="qdPanel-appoint" aria-selected="true">Appoint Captain</button>
          <button type="button" role="tab" id="qdTab-history" data-qd-tab="history" aria-controls="qdPanel-history" aria-selected="false" tabindex="-1">Appointments &amp; History</button>
          <button type="button" role="tab" id="qdTab-departure" data-qd-tab="departure" aria-controls="qdPanel-departure" aria-selected="false" tabindex="-1">Departure Review</button>
          <button type="button" role="tab" id="qdTab-evidence" data-qd-tab="evidence" aria-controls="qdPanel-evidence" aria-selected="false" tabindex="-1">Fleetguard Evidence</button>
        </nav>
        <div class="qd-vessel"><label for="harborVessel">Vessel <span>Exact scope for this task</span></label><select id="harborVessel" required disabled><option value="">Choose a vessel</option></select><button type="button" id="harborRefresh">REFRESH RECORDS</button></div>
        <section id="qdPanel-appoint" role="tabpanel" data-qd-panel="appoint" aria-labelledby="qdTab-appoint" class="qd-content">
          <div class="qd-form"><label for="harborCaptainEmail">Captain account email</label><input data-bf-trim="boundary" id="harborCaptainEmail" type="email" required maxlength="254" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Account you control for this test"><label for="harborCaptainIntent">Appointment intent <span>(optional)</span></label><textarea data-bf-trim="boundary" id="harborCaptainIntent" rows="1" maxlength="500" placeholder="Reason for this exact-vessel appointment"></textarea><button type="button" id="harborPreviewCaptain" class="qd-primary">PREVIEW APPOINTMENT</button></div>
          <div class="qd-review"><div id="harborCaptainPreview" class="qd-preview"></div><button id="harborIssueCaptain" type="button" disabled>ISSUE APPOINTMENT</button></div>
        </section>
        <section id="qdPanel-history" role="tabpanel" data-qd-panel="history" aria-labelledby="qdTab-history" hidden>
          <p id="harborHistoryScope" class="qd-muted">Server records not loaded.</p><div id="harborAppointmentRows"></div>
          <details class="qd-link"><summary>Captain sign-in link</summary><p>The candidate signs in and accepts. This route does not send an email or grant authority.</p><code id="harborCaptainRoute">Choose a vessel first.</code><button type="button" id="harborCopyRoute">COPY SIGN-IN LINK</button></details>
        </section>
        <section id="qdPanel-departure" role="tabpanel" data-qd-panel="departure" aria-labelledby="qdTab-departure" class="qd-content" hidden>
          <div class="qd-form"><label for="harborEvidenceRef">Working-ship proof reference</label><input data-bf-trim="boundary" id="harborEvidenceRef" required minlength="8" maxlength="160" placeholder="Reference to evidence you have inspected"><p class="qd-muted">Preview checks operating authority. It does not verify customer workflows, restore, or cross-device proof.</p><button type="button" id="harborPreviewActivation">PREVIEW DEPARTURE</button><label class="qd-ack"><input id="harborDepartureAcknowledgment" type="checkbox"><span>I inspected field evidence matching this vessel and release. The reference alone is not proof.</span></label></div>
          <div class="qd-review"><div id="harborActivationPreview" class="qd-preview"></div><button id="harborActivateVessel" type="button" disabled>DEPART HARBOR</button></div>
        </section>
        <section id="qdPanel-evidence" role="tabpanel" data-qd-panel="evidence" aria-labelledby="qdTab-evidence" class="qd-content" hidden>
          <h5>What the server can actually confirm</h5>
          <p class="qd-muted">Read-only Fleetguard. This summarizes the authorized vessel directory and Captain appointment history. Missing isolation, backup, restore, Sea Trial and deployment proof stays NOT VERIFIED. No authority is granted here.</p>
          <div id="harborEvidenceReport" class="qd-evidence-report" role="status">Select a vessel and refresh server records.</div>
          <button id="harborEvidenceExport" type="button" disabled>REFRESH &amp; DOWNLOAD EXACT-VESSEL EVIDENCE</button>
        </section>
        <p id="harborMasterResult" class="qd-result" role="status" aria-live="polite">Sign in to load the server records. No appointment or lifecycle change occurs automatically.</p>
      </section>`;
      const required=['harborMasterStation','harborVessel','harborCaptainEmail','harborCaptainIntent','harborCaptainPreview','harborPreviewCaptain','harborIssueCaptain','harborAppointmentRows','harborActivationPreview','harborEvidenceReport','harborMasterResult'];
      if(required.some(id=>!$(id)))throw new Error('Required delegation controls missing.');
      $('harborVessel').onchange=()=>{invalidate();paintRoute();paintHistory();paintEvidence();message('Scope changed. Request a new preview for this vessel.');};
      for(const id of ['harborCaptainEmail','harborCaptainIntent'])$(id).oninput=()=>{appointmentPreview=null;paintAppointment();};
      $('harborEvidenceRef').oninput=()=>{departurePreview=null;$('harborDepartureAcknowledgment').checked=false;paintDeparture();};
      $('harborDepartureAcknowledgment').onchange=state;
      for(const [id,fn] of [['harborRefresh',load],['harborPreviewCaptain',previewCaptain],['harborIssueCaptain',issueCaptain],['harborPreviewActivation',previewDeparture],['harborActivateVessel',depart],['harborCopyRoute',copyRoute],['harborEvidenceExport',exportEvidence]])$(id).onclick=fn;
      panel.onclick=e=>{const tab=e.target.closest('[data-qd-tab]'),revokeBtn=e.target.closest('[data-harbor-revoke]');if(tab)changeTab(tab.dataset.qdTab);if(revokeBtn)revoke(revokeBtn.dataset.harborRevoke);};
      panel.querySelector('.qd-tabs').addEventListener('keydown',e=>{const tabs=[...panel.querySelectorAll('[data-qd-tab]')],i=tabs.indexOf(e.target);if(i<0)return;let j=i;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();changeTab(tabs[j].dataset.qdTab,true);});
      panel.dataset.quarterdeck='ready';panel.dataset.harborMaster='1';deck.dataset.quarterdeck='ready';
      compactChrome();invalidate();paintHistory();paintEvidence();paintRoute();changeTab('appoint');
      observer?.disconnect();observer=new MutationObserver(sync);observer.observe(deck,{attributes:true,attributeFilter:['class','aria-hidden','data-admiral-lane','data-mode']});
      sync();return true;
    }catch(e){installError(e);return false;}
  }
  function compactChrome(){
    const actions=deck.querySelector('.admiral-deck-head-actions');
    if(!$('quarterdeckReadiness')&&actions){const b=document.createElement('button');b.type='button';b.id='quarterdeckReadiness';b.title='View readiness in Govern';b.onclick=()=>deck.querySelector('[data-admiral-lane="govern"]')?.click();actions.prepend(b);}
    const continuity=deck.querySelector('.admiral-continuity-card');
    if(continuity&&!continuity.closest('details')){const d=document.createElement('details');d.id='quarterdeckContinuity';d.className='qd-continuity';const s=document.createElement('summary');s.textContent='Reports, recovery & tools';d.append(s);continuity.before(d);d.append(continuity);}
    if(!$('quarterdeckSessionDetails')){
      const strip=$('admiralSessionStrip'),timing=$('admiralSessionTiming'),notice=strip?.querySelector('small');
      if(strip&&timing){const d=document.createElement('details');d.id='quarterdeckSessionDetails';d.className='qd-session-details';const s=document.createElement('summary'),receipt=$('admiralSessionReceipt');s.title='Show session times, limits and server-verification scope';d.append(s);timing.before(d);if(receipt)s.append(receipt);const label=document.createElement('span');label.className='qd-session-link';label.textContent='Session details';s.append(label);d.append(timing);if(notice)d.append(notice);}
    }
    const nav=deck.querySelector('#admiralLaneNav');if(nav&&!nav.dataset.qdKeyboard){nav.dataset.qdKeyboard='true';nav.addEventListener('keydown',e=>{const tabs=[...nav.querySelectorAll('[data-admiral-lane]')],i=tabs.indexOf(e.target);if(i<0)return;let j=i;if(e.key==='ArrowRight')j=(i+1)%4;else if(e.key==='ArrowLeft')j=(i+3)%4;else if(e.key==='Home')j=0;else if(e.key==='End')j=3;else return;e.preventDefault();tabs[j].click();tabs[j].focus({preventScroll:true});});}
    readinessObserver?.disconnect();readinessObserver=new MutationObserver(paintReadiness);
    for(const id of ['admiralDeckReadinessState','admiralDeckReadinessCopy'])if($(id))readinessObserver.observe($(id),{childList:true,subtree:true,characterData:true});
    paintReadiness();
  }
  function paintReadiness(){
    const stateText=$('admiralDeckReadinessState')?.textContent?.trim()||'NOT RUN',copy=$('admiralDeckReadinessCopy')?.textContent?.trim()||'';
    const b=$('quarterdeckReadiness');if(b){const count=copy.match(/(\d+) current/),text='READINESS · '+stateText+(count?' · '+count[1]:'');if(b.textContent!==text)b.textContent=text;b.title=copy||'Open Govern to inspect readiness';b.setAttribute('aria-label','Readiness '+stateText+'. '+copy+' Open Govern.');b.dataset.state=stateText.toLowerCase();}
  }
  function sync(){
    if(!deck?.isConnected)return;
    const nowVisible=visible(),lane=deck.dataset.admiralLane||'govern';
    deck.querySelectorAll('[data-admiral-lane]').forEach((b,i)=>{b.tabIndex=b.dataset.admiralLane===lane?0:-1;b.id=b.id||'qdLane-'+b.dataset.admiralLane;const p=deck.querySelector('[data-admiral-panel="'+b.dataset.admiralLane+'"]');if(p){p.id=p.id||'qdLanePanel-'+b.dataset.admiralLane;b.setAttribute('aria-controls',p.id);p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);p.tabIndex=-1;}});
    if(lane!==previousLane){if(previousLane==='delegate'&&busy){operation++;busy=false;ready=false;loadedSession='';attemptedSession='';invalidate();}previousLane=lane;const d=$('quarterdeckContinuity');if(d)d.open=lane==='govern';}
    if(wasVisible&&!nowVisible)conceal();wasVisible=nowVisible;
    if(active()&&attemptedSession!==sessionMark()&&!busy)load();
    state();
  }
  window.DarkSkyQuarterdeck=Object.freeze({build:BUILD,mount,sync});
  // Both entry points cover a late-created deck and a deck already present when this module executes.
  window.addEventListener('darksky:admiral-deck-ready',mount);
  window.addEventListener('darksky:admiral-lane-changed',sync);
  window.addEventListener('darksky:admiral-session-changed',()=>{if(mount())sync();});
  for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])window.addEventListener(event,conceal);
  mount();
})();

/* CharterGuard: private agreement preparation, not contract verification or a permission grant.
   No production writes, automatic billing, e-sign request, SQL execution or legal certification. */
;(() => {
 'use strict';
 const BUILD=window.__darkSkyVerifiedRelease.build, TEMPLATE={"template": "Black Flag Fleet Services and Vessel Commissioning Agreement", "version": "CG-1", "review_date": "2026-09-27", "status": "DRAFT FOR LEGAL REVIEW — NOT FOR SIGNATURE", "clauses": [{"title": "1. Parties, purpose and effectiveness", "paragraphs": ["The service provider identified in Schedule A (Provider), using the Black Flag brand, and the vessel business identified in Schedule A (Business) agree to the services and responsibilities expressly selected in this Agreement. A vessel is the identified business workspace, not a separate legal person merely because the software gives it a name. Admiral, Fleet Captain and Vessel Captain are platform roles; they do not replace the legal names or signature capacities of the parties.", "This Agreement becomes binding only when a final version with completed Schedules A through D is signed by authorized representatives of Provider and Business. The designated Captain must also sign the limited Captain acknowledgment before receiving operating access. If one individual holds multiple capacities, each capacity must be separately identified. A drafted, uploaded, hashed, previewed or locally marked document is not by itself proof that anyone signed or had authority to bind a party.", "Commercial commissioning and fee accrual require the parties' executed agreement, the agreed service-start date, and separately documented operational and security readiness. Preparing a workspace or technical registry entry does not authorize public launch, billing or operating access. The later of the service-start date and the recorded commercial activation date controls the start of recurring fees. Tests and demonstrations are not billable sales."]}, {"title": "2. Independent businesses; no unintended ownership", "paragraphs": ["The parties intend an independent service relationship and collaborative business alliance, not a general partnership, joint venture, equity interest, employment relationship or unrestricted agency. No fee based on sales transfers an interest in the Business, its assets, its profits or its debts. Neither party may bind the other to obligations except for the specific, limited written authority in Schedule B. This clause states the intended arrangement; applicable law and the actual conduct of the parties determine their legal relationship.", "A percentage or other fee under this Agreement is compensation for selected services, not a distribution of Business profits or an ownership interest. Sharing gross or eligible-sales returns does not by itself establish co-ownership, but the parties understand that legal classification turns on the actual relationship and conduct, not merely on this label.", "Regulatory classification is a condition to commercial commissioning. Before Provider offers or executes this Agreement with an outside Business, counsel must evaluate the actual branding, prescribed marketing or operating system, degree of control or assistance, required payments, territory and jurisdictions for possible franchise, business-opportunity, agency, employment or other mandatory regimes. If a franchise or similar law may apply, the parties must complete any required registration or exemption, disclosure, waiting period, mandatory contract terms and other prerequisites before the offer, fee activation or commercial launch. Calling a payment a service fee, describing the relationship as independent, or selecting a percentage of sales does not waive mandatory law. Unresolved classification keeps commercial commissioning held.", "Business retains responsibility for its products, customer commitments, permits, workforce, taxes and business decisions except the administrative tasks expressly delegated. Provider retains its platform and pre-existing intellectual property. Appointment or replacement of a Captain does not change ownership or the commercial agreement. No personal guarantee is created by the Captain acknowledgment. Separate legal instruments are required for any equity investment, actual partnership, payroll engagement, authority over bank accounts or transfer of ownership."]}, {"title": "3. Services, operating support and limits", "paragraphs": ["Schedule B identifies Platform Support, Business Support or Managed Service, the selected functions, service hours, response targets, dependencies, responsible contacts and exclusions. Labels alone do not promise services. Provider will perform the selected work with reasonable care and skill, maintain reasonable safeguards appropriate to the information it handles, explain material limitations, and reasonably assist in correcting its errors. Response targets are not resolution guarantees. No particular sales volume, profit, uptime or business outcome is promised unless a specific written service commitment says otherwise.", "Admiral observation is read-only by default. Fleet Captain or managed-service intervention must identify the exact vessel, the acting account, the delegated function and the reason, and preserve a record of material changes. Only functions selected in Schedule B and separately supported by active server authorization may be used. A contract or a link does not itself implement software permission. The parties must verify those permissions before delegated production work begins.", "Provider may retain the limited support functions agreed in Schedule B after a Vessel Captain is appointed. It may not silently become the owner, change Business pricing, issue refunds, incur expenses, transfer funds, broaden access or assume unlisted duties. A financial or customer-facing authority requires a written addendum with limits and approval rules. Current platform status-only tools must not be represented as complete sales administration or bookkeeping."]}, {"title": "4. Business and Captain responsibilities", "paragraphs": ["Business will provide accurate records and lawful instructions, designate authorized contacts, review statements and material operational changes promptly, maintain required licenses and insurance, fulfill its customer obligations, and notify Provider of personnel or authority changes. Business will not conceal or misclassify sales included in the negotiated fee basis. Provider remains responsible for its own work; Business review does not release Provider from responsibility for errors it caused.", "The Captain will use a personal authorized login, protect credentials, operate only the assigned vessel within approved functions, keep accurate task and incident records, and promptly report suspected misuse or material errors. Captain authority does not permit changing fleet fees, signing for an owner without separate authority, granting roles, viewing another vessel's private records or representing that the Captain owns the Business.", "Business may request removal or replacement of its designated Captain. Provider may promptly suspend compromised credentials or suspend access for a substantiated security or compliance reason, explain the reason to the extent lawful, preserve relevant evidence and provide a reasonable correction/review path. Ending a Captain appointment does not automatically terminate this Agreement, erase records or increase fees. The Captain receives notice of access changes where practicable and can raise a documented concern without retaliation for good-faith reporting."]}, {"title": "5. Fees and the eligible-sales basis", "paragraphs": ["Only an authorized Admiral acting for Provider may propose, record, waive or approve Provider's negotiated commercial terms. Business' authorized representative must accept the final terms and material amendments in writing. Neither a Vessel Captain nor a Fleet Captain may alter the rate merely by holding that role. Each vessel has its own percentage, services and effective period. A zero-percent agreement is valid only when expressly selected; no rate is implied by a blank field.", "Schedule C selects either Black Flag-facilitated sales, all eligible Business sales, or specified sales channels. Sales channel describes the origin of an order, not how it was paid. A platform order paid by cash or check remains a platform order; manually entering an in-person sale for bookkeeping does not make it platform-generated. Record each sale once using a stable transaction reference. Splitting an order, recording a deposit, collecting the balance or reconciling a check must not duplicate the fee base.", "Eligible sales are customer sales actually collected during the applicable period, after discounts and net of returns, refunds and chargebacks, limited to the selected channels. Exclude separately collected sales tax, tips passed to workers, test transactions, owner contributions, loans, transfers between accounts and unpaid invoices. Separately stated pass-through shipping or delivery reimbursements are excluded; Business-provided delivery revenue is included unless Schedule C expressly excludes it. Processing fees are not deducted from the sales base unless a signed amendment expressly provides otherwise.", "Gift-card issuance is excluded and redemption is counted once as a sale. A deposit is counted when collected toward a sale, and the same amount is excluded when applied to the final invoice. Refunds and chargebacks generate credits at the original transaction's agreement rate, including after a rate change or termination. Provider will carry forward or settle a legitimate fee credit rather than conceal it by rounding a negative balance to zero. USD is the initial billing currency unless an agreed currency addendum supplies conversion rules.", "The percentage fee is the eligible-sales amount multiplied by the negotiated percentage, rounded to cents once per monthly agreement/rate segment. Different effective rates must be applied to their own segments, not to the entire month retroactively. Optional fixed charges or paid features must be separately enumerated and accepted; a feature included in the percentage may not be billed again. Service tier does not automatically change the percentage."]}, {"title": "6. Statements, reconciliation and payment", "paragraphs": ["Provider will supply an itemized monthly statement within the period in Schedule C identifying the agreement version, sales channels, eligible collections, exclusions, rate, credits, separate agreed charges, amount due and payments received. Business will provide the covered off-platform sales records and identify missing or unreconciled records. A materially incomplete sales set must be labeled provisional, not a final bill represented as complete.", "Payment is due within the negotiated number of days after delivery of an accurate statement. Checks and other agreed traceable payment methods are permitted. This Agreement alone does not authorize account debits, withholding customer proceeds, payment-card processing or custody of funds. Any later automated collection requires separate authorization and processor/compliance arrangements. An amount calculated or invoiced is not recorded as paid without payment evidence.", "Business may dispute a charge in good faith with reasonable detail within 30 days of receiving the statement, without waiving rights concerning fraud, concealed errors or rights that cannot lawfully be waived. The parties will cooperate to resolve it and correct errors; undisputed amounts remain due. No late fee, automatic escalation, security interest, penalty or collection expense is implied by this form.", "Provider may request reasonably necessary records relating to the agreed sales basis on at least 10 business days' notice, ordinarily no more than once a year absent a material discrepancy or reasonable evidence of misconduct. Review must be proportionate, confidential and restricted to this vessel and the covered period. Unrelated customer information and other vessels' records are outside scope. Each party bears its review costs unless a signed, lawful addendum states otherwise."]}, {"title": "7. Managed bookkeeping and regulated work", "paragraphs": ["When selected, bookkeeping is limited to the tasks, source records, review responsibility and reconciliation cycle in Schedule B. Preserve original transactions, link corrections rather than silently overwrite history, keep each legal entity's books separate and provide usable exports. The service fee remains distinct from customer sales; an office label must not invent a second legal entity or duplicate income.", "Business remains responsible for complete source information and obtaining appropriate professional advice. Provider remains responsible for reasonable care in the bookkeeping work it undertakes. This Agreement does not include tax-return preparation, legal advice, CPA audit/attestation, payroll administration, fiduciary investment management, money transmission, banking access or merchant-of-record obligations. Any such service requires an appropriate separately reviewed engagement, qualifications and authority. Platform role names do not establish employment, contractor status or professional licensing."]}, {"title": "8. Data, confidentiality, security and records", "paragraphs": ["Business controls its lawfully held business content and customer records, subject to applicable individual rights and legal duties. Provider receives only the limited access needed to deliver the agreed services, support, security, billing verification and legal compliance. Provider will not sell the Business' private data, use it for unrelated advertising or train a general-purpose model on it without a separate, informed agreement. Approved service providers must be identified in Schedule D and bound to appropriate confidentiality and safeguards.", "Each party will protect the other's nonpublic information with reasonable care and limit disclosure to persons with a legitimate need and appropriate obligations. Exceptions are information lawfully public, independently developed, rightfully received without restriction or disclosed under legal compulsion. Give lawful notice of compelled disclosure where allowed and disclose only what is required. Confidentiality continues for three years after termination; trade secrets remain protected while legally qualifying, and personal information remains protected while retained.", "Provider will use appropriate access controls, vessel separation, change logs, and verified backup/export procedures for the agreed production service. Schedule D must identify data locations, actual subprocessors, retention and restore responsibilities before activation. Test-browser storage or a downloaded fingerprint is not a promised cloud backup. Neither party may claim a security or recovery capability has been verified solely because a screen displays that label.", "Notify the affected party without undue delay after discovering a material unauthorized access or loss affecting the other's information, targeting an initial notice within 48 hours and never delaying a legally required notice. Preserve evidence, cooperate on containment and correction, and comply with applicable notification law. Neither party may use a fee dispute to hold the other's exportable business records hostage."]}, {"title": "9. Intellectual property and branding", "paragraphs": ["Each party retains its existing software, marks, materials, methods and know-how. Business grants Provider a nonexclusive, limited license to use its approved name, marks and supplied materials solely to provide the selected services and identify the vessel during the term. Public promotion, testimonials or portfolio use requires separate permission. No unapproved alteration or cross-vessel reuse of a mark is authorized.", "Business retains its supplied content and business records. Unless a signed work order specifies otherwise, it owns vessel-specific original content created and paid for specifically for it, excluding Provider's pre-existing platform, reusable components, general tools and third-party materials. Applicable licenses for incorporated third-party materials must be disclosed. Provider grants the limited use rights needed for paid deliverables; termination does not transfer the platform source code or cancel Business' ownership of its records."]}, {"title": "10. Term, changes, suspension and an orderly exit", "paragraphs": ["The initial arrangement is month-to-month unless Schedule D states a separately negotiated term. Either party may end it on 30 days' written notice without a termination penalty. A material breach normally requires written notice and 15 days to cure, or a reasonable agreed remediation plan for a breach not reasonably curable in that time. Fraud, unlawful conduct or a serious security threat may justify immediate proportionate suspension or termination to the extent lawful.", "Suspension must be no broader or longer than reasonably needed, with prompt notice where lawful and a practical review path. Preserve records and maintain a safe export method unless a specific legal or security restriction prevents it. A genuinely disputed fee is not by itself grounds to erase data or disable all access. Statutory franchise or other mandatory termination protections, if applicable, are not waived by this form.", "On exit, revoke unnecessary access, cease new recurring fee accrual after the effective end date, reconcile earned fees and refunds, and provide one reasonably usable export of the Business' available records and the executed agreement without an added exit charge. Make the export available for at least 30 days after termination, subject to law and documented security needs. Other transition services require an agreed price. Use the reviewed retention/deletion schedule in Schedule D; retain only what is lawful and necessary, including legal holds, and explain any retained copies.", "Material changes to fees, included sales, services or access require a new dated agreement version accepted by both parties before taking effect. No one may retroactively rewrite an executed version, silently expand a sales basis, or treat a Captain replacement as acceptance of higher fees. A local software checkbox or administrator entry alone is not the parties' signature."]}, {"title": "11. Responsibility, claims and negotiated liability limits", "paragraphs": ["Each party is responsible for its own acts, omissions and obligations. Each will defend and indemnify the other against third-party claims to the extent caused by its negligence, willful misconduct, violation of applicable law or infringement in materials it supplies, excluding loss caused by the other party. Give prompt notice, reasonable cooperation at the defending party's cost, and control of a reasonable defense. No settlement may admit fault, impose nonmonetary duties or require an unreimbursed payment by the protected party without its written consent, not unreasonably withheld.", "To the extent permitted by law, each party's aggregate liability arising from this Agreement is limited to the greater of the fees paid or payable under this vessel's agreement in the preceding 12 months and the negotiated dollar floor in Schedule D. Subject to the same legal limits, neither party is liable for remote consequential, exemplary or punitive damages or speculative lost profits. These limitations do not excuse payment of earned undisputed fees, repayment of money wrongfully held, fraud, willful misconduct, gross negligence, a party's breach of confidentiality or data-protection obligations, infringement, death/personal injury it causes, or liability that cannot lawfully be limited. Review caps, indemnity interactions and insurance with counsel for the actual services; a blank dollar floor is an incomplete draft, not a zero-dollar cap.", "No release in this Agreement authorizes careless performance or knowingly insecure practices. Schedule D identifies the insurance appropriate to the services and any agreed proof of coverage. The Captain does not personally guarantee Business' service fees or indemnify Provider merely by accepting a platform appointment; separate liability for that person's own unlawful conduct is governed by applicable law."]}, {"title": "12. Disputes, notices and interpretation", "paragraphs": ["The parties will first attempt good-faith resolution through the contacts in Schedule A within 15 days after written notice of a dispute. They may agree to confidential mediation. Either may seek urgent relief or take action needed to preserve a legal deadline without waiting. This form does not impose mandatory arbitration, a jury waiver, a class-action waiver, a noncompete covenant or unilateral fee shifting.", "The governing law and courts selected in Schedule D apply only to the extent consistent with mandatory law and valid jurisdiction. Notices go to the specified email and postal addresses; use a method providing reasonable evidence of delivery for termination, breach or material amendments, and promptly update changed contact details. Technical alerts are not substitutes for required legal notices.", "This signed Agreement and its completed schedules are the entire agreement on this service arrangement. A signed, clearly identified amendment controls over earlier inconsistent terms. Schedules control the selected commercial details; no schedule silently grants excluded banking, ownership or regulated-service authority. Sever an unenforceable provision only to the extent lawful without inventing a materially different bargain. No waiver is implied by a delay in enforcement. Assignment to an unrelated party requires the other's written consent, not unreasonably withheld; a change affecting data handling, responsibility or ownership must receive any additional consent required by law."]}, {"title": "13. Signing, copies and commissioning evidence", "paragraphs": ["The parties may sign the same completed version in counterparts on paper or by an agreed electronic-signature process. Each signer must intend to sign in the identified capacity, receive the full agreement and schedules, and be able to keep an accurate copy. Use a process that supports signer attribution, timestamps, document/version linkage, delivery and retention. A typed name can have legal effect in context; this draft does not certify any particular signing method or person's authority.", "Electronic execution is optional. Before electronic signing, obtain a separate, conspicuous consent from each signer covering the final agreement, delivery format, copy-retention method and any required disclosures. No consent is preselected or inferred solely from using the website or making a payment. A party may use paper and may decline electronic handling of other transactions. Counsel must adapt the separate consent record to the applicable law and the actual signing service.", "Before production commissioning, preserve the final signed document, any completion certificate or other signing evidence, the agreement/version and exact vessel identity, and delivery evidence for Provider, Business and the Captain. Preserve each amendment separately. A SHA-256 fingerprint can identify selected bytes but cannot establish that a document was validly signed, that its contents match an unsigned draft, or that a signer controlled the Business.", "The commissioning system must separately confirm executed-agreement evidence, negotiated fee/scope version, current server authority, operating readiness and deliberate Admiral release. If these services are unavailable, record the work as preparation and keep commercial activation blocked. A valid contract does not itself create software access; software access does not itself prove a contract. No automated charge or vessel departure is authorized by this drafting tool."]}, {"title": "14. Limited Captain acknowledgment", "paragraphs": ["The designated Captain acknowledges receiving the final Agreement and its applicable operating scope, agrees to the personal credential, confidentiality, lawful-use and incident-reporting duties in Sections 3, 4 and 8, and understands the review and access-removal process. The acknowledgment is limited to those duties and does not make the Captain the owner, a general partner, Provider's employee or a guarantor of the Business' debts. Actual employment or contractor terms, if any, belong in a separate agreement.", "The Captain confirms the identity and capacity shown in the acknowledgment block. If also authorized to bind Business, the individual must separately sign the Business signature block. A software invitation acceptance is a distinct access event and does not substitute for executing this Agreement or the acknowledgment."]}], "references": [{"title": "Virginia Code § 50-73.88 — Formation of partnership", "url": "https://law.lis.virginia.gov/vacode/title50/chapter2.2/section50-73.88/", "note": "A partnership can arise from conduct, not only a label. Sharing gross returns alone does not establish one. Counsel must assess actual co-ownership/control."}, {"title": "Virginia Code §§ 59.1-483, 485, 487 and 490 — UETA", "url": "https://law.lis.virginia.gov/vacode/title59.1/chapter42.1/", "note": "Electronic agreement, attribution and accurate accessible records matter. A file hash is not a legal opinion or proof of signer authority."}, {"title": "15 U.S.C. § 7001 — E-SIGN", "url": "https://www.law.cornell.edu/uscode/text/15/7001", "note": "Electronic form alone does not invalidate a signature. Record retention/accessibility and applicable consent requirements still matter."}, {"title": "FTC — Franchise Rule Compliance Guide", "url": "https://www.ftc.gov/business-guidance/resources/franchise-rule-compliance-guide", "note": "Ask franchise counsel to assess the actual combination of brand association, significant control/assistance and required payments before offering managed-service arrangements."}, {"title": "Virginia Code §§ 13.1-559 and 13.1-560 — Retail Franchising Act", "url": "https://law.lis.virginia.gov/vacodepopularnames/retail-franchising-act/", "note": "State definitions, offering/registration requirements and mandatory protections may apply. Calling a fee a service fee or disclaiming franchise intent does not decide classification."}]};
 const $=id=>document.getElementById(id), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const CHANNELS={platform:'Black Flag-facilitated',in_person:'In person',telephone:'Phone / direct',other:'Other agreed sales'};
 const SERVICES={platform:'Platform access',sales_entry:'Sales recording',order_support:'Order-status support',bookkeeping:'Bookkeeping preparation',reconciliation:'Reconciliation',reporting:'Reporting support',recovery:'Approved recovery support'};
 const LEVELS={platform:'Platform support',business:'Business support',managed:'Managed service'};
 const FIELDS={providerName:180,providerSigner:120,providerEmail:200,providerAddress:400,businessName:180,businessSigner:120,businessEmail:200,businessAddress:400,captainName:120,captainEmail:200,level:20,serviceLimits:1400,hours:200,response:300,percentage:6,basis:20,startDate:10,paymentDays:3,statementDays:3,extras:500,law:100,venue:200,liabilityFloor:15,insurance:800,dataPlan:1400,classification:1200,reviewer:120,reviewRef:240,reviewNotes:1600};
 const REQUIRED={providerName:'Provider legal name',providerSigner:'Provider signer and capacity',providerEmail:'Provider notice email',providerAddress:'Provider notice address',businessName:'Business legal name',businessSigner:'Business signer and capacity',businessEmail:'Business notice email',businessAddress:'Business notice address',captainName:'Captain legal name',captainEmail:'Captain account email',level:'Service level',serviceLimits:'Responsibilities and limits',hours:'Support hours / time zone',response:'Response target',percentage:'Negotiated percentage (0 allowed)',basis:'Covered sales',startDate:'Proposed start date',paymentDays:'Payment due days',statementDays:'Statement delivery days',law:'Governing law',venue:'Venue',liabilityFloor:'Negotiated liability floor',insurance:'Insurance decision',dataPlan:'Data custody / retention plan',classification:'Counsel classification / required filings and disclosures'};
 const blocked='Signed-agreement server verification is not installed. Production commissioning, departure and fee activation remain held. A local draft or file fingerprint cannot unlock them.';
 function blank(){return Object.assign(Object.fromEntries(Object.keys(FIELDS).map(k=>[k,''])),{services:[],channels:[]});}
 function sanitize(x){if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Invalid agreement fields.');const d=blank();for(const [k,n] of Object.entries(FIELDS)){if(x[k]!=null&&typeof x[k]!=='string')throw Error('Invalid '+k);d[k]=String(x[k]||'');if(d[k].length>n)throw Error(k+' exceeds the field limit.');}
 for(const [k,allow] of [['services',SERVICES],['channels',CHANNELS]]){const a=x[k]||[];if(!Array.isArray(a)||a.length>Object.keys(allow).length||a.some(v=>typeof v!=='string'||!Object.hasOwn(allow,v))||new Set(a).size!==a.length)throw Error('Invalid '+k);d[k]=a.slice().sort();}
 if(d.level&&!Object.hasOwn(LEVELS,d.level))throw Error('Invalid service level.');if(d.basis&&!['platform','all','custom'].includes(d.basis))throw Error('Invalid sales basis.');return d;}
 const projectOk=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(s);
 function percent(v){if(!/^\d{1,3}(?:\.\d{1,2})?$/.test(v))throw Error('Enter a percentage from 0 to 100, using at most two decimal places.');const [a,b='']=v.split('.'),p=Number(a)*100+Number((b+'00').slice(0,2));if(p>10000)throw Error('Percentage cannot exceed 100.');return p;}
 function cents(v){if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(v))throw Error('Use a nonnegative dollar amount with at most two decimal places.');const [a,b='']=v.split('.');return BigInt(a)*100n+BigInt((b+'00').slice(0,2));}
 function amount(v){const n=typeof v==='bigint'?v:BigInt(v);return '$'+(n/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+(n%100n).toString().padStart(2,'0');}
 function channels(d){return d.basis==='platform'?['platform']:d.basis==='all'?Object.keys(CHANNELS):d.basis==='custom'?d.channels:[];}
 function example(d,values){const rate=BigInt(percent(d.percentage)),scope=channels(d);if(!scope.length)throw Error('Choose the covered sales channels.');let total=0n;for(const k of scope)total+=cents(values[k]||'0');return {base:total.toString(),fee:((total*rate+5000n)/10000n).toString()};}
 function missing(d){const list=[];for(const [k,label] of Object.entries(REQUIRED))if(!d[k].trim())list.push(label);if(!d.services.length)list.push('At least one service');if(!channels(d).length)list.push('At least one covered sales channel');if(d.percentage)try{percent(d.percentage);}catch(e){list.push(e.message);}for(const k of ['providerEmail','businessEmail','captainEmail'])if(d[k]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d[k]))list.push(REQUIRED[k]+' is not a complete address');
 for(const k of ['paymentDays','statementDays'])if(d[k]&&(!/^\d{1,3}$/.test(d[k])||Number(d[k])<1||Number(d[k])>365))list.push(REQUIRED[k]+' must be 1–365');if(d.startDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(d.startDate)||!Number.isFinite(new Date(d.startDate+'T12:00:00Z').getTime())||new Date(d.startDate+'T12:00:00Z').toISOString().slice(0,10)!==d.startDate))list.push('Use a valid proposed start date.');if(d.liabilityFloor)try{cents(d.liabilityFloor);}catch(e){list.push('Liability floor: '+e.message);}return list;}
 function stable(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';}
 async function hash(x){if(!crypto.subtle)throw Error('Secure hashing is unavailable. No evidence was recorded.');const b=typeof x==='string'?new TextEncoder().encode(x):x;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(c=>c.toString(16).padStart(2,'0')).join('');}
 function scopeTarget(t){if(!t||!projectOk(t.project_id)||typeof t.display_name!=='string'||!t.display_name.trim()||t.display_name.length>180)throw Error('Choose an exact named vessel.');return {project_id:t.project_id,display_name:t.display_name,prospective:t.prospective===true};}
 function termPayload(r){return {schema:'blackflag-agreement-terms-v1',agreementId:r.agreementId,revision:r.revision,target:scopeTarget(r.target),templateVersion:TEMPLATE.version,templateClauses:TEMPLATE.clauses,terms:sanitize(r.terms)};}
 function schedule(r){const d=r.terms,v=x=>x?.trim()||'[TO COMPLETE]';return [
 ['Schedule A — Parties and vessel',[
 ['Vessel',r.target.display_name],['Exact project key',r.target.project_id],['Registration',r.target.prospective?'Planned only — key not reserved':'Existing registry identity — no ownership implication'],
 ['Provider legal name',v(d.providerName)],['Provider signer / capacity',v(d.providerSigner)],['Provider notices',v(d.providerEmail)+'; '+v(d.providerAddress)],['Business legal name',v(d.businessName)],['Business signer / capacity',v(d.businessSigner)],['Business notices',v(d.businessEmail)+'; '+v(d.businessAddress)],['Captain legal name / account',v(d.captainName)+'; '+v(d.captainEmail)]]],
 ['Schedule B — Services and duties',[
 ['Service arrangement',LEVELS[d.level]||'[TO SELECT]'],['Included services',d.services.map(k=>SERVICES[k]).join('; ')||'[TO SELECT]'],['Responsibilities / support permissions / exclusions',v(d.serviceLimits)],['Service hours and time zone',v(d.hours)],['Response target',v(d.response)],['Access boundary','Only the exact-vessel functions expressly agreed; separate server authorization required. No automatic banking, pricing, ownership or role-grant authority.']]],
 ['Schedule C — Fees and covered sales',[
 ['Negotiated percentage',d.percentage?d.percentage+'%':'[TO SELECT — blank is not 0%]'],['Covered channels',channels(d).map(k=>CHANNELS[k]).join('; ')||'[TO SELECT]'],['Proposed service start',v(d.startDate)+'; fees begin no earlier than commercial activation'],['Monthly statement delivery',v(d.statementDays)+' days after month end'],['Payment due',v(d.paymentDays)+' days after accurate statement delivery'],['Other fees / included paid features',d.extras||'No additional charge or duplicated feature fee is authorized.'],['Calculation rule','Collected eligible sales only; exclusions, attribution, credit treatment and rounding follow Sections 5 and 6. Payment method is not a sales channel. No automated withdrawal authorization.']]],
 ['Schedule D — Risk, records and administration',[
 ['Governing law',v(d.law)],['Court venue',v(d.venue)],['Liability floor',d.liabilityFloor?'USD '+d.liabilityFloor:'[TO NEGOTIATE]'],['Insurance / coverage evidence',v(d.insurance)],['Data custody / actual subprocessors / retention / export and restore responsibility',v(d.dataPlan)],['Regulatory classification / filings / disclosures',v(d.classification)],['Term and ordinary exit','Month-to-month; either party may give 30 days written notice. Any different term requires an explicit signed amendment.'],['Counsel review','The review log is an internal reported record, not a legal certification. Resolve entity, partnership/franchise, tax/licensing, privacy, signature and liability questions before using the contract.']]]];}
 function html(r,h){const vals=schedule(r).map(([t,rows])=>'<section><h2>'+esc(t)+'</h2><table>'+rows.map(([k,v])=>'<tr><th>'+esc(k)+'</th><td>'+esc(v)+'</td></tr>').join('')+'</table></section>').join('');return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+esc(r.target.display_name)+' — Agreement draft</title><style>body{font:16px/1.48 Arial,sans-serif;max-width:860px;margin:32px auto;padding:0 24px;color:#152b32}h1{font-size:28px}h2{font-size:20px;margin-top:26px}h3{font-size:18px}p,td{overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #ccd5d9;padding:8px}th{width:34%}small{font-size:12px}section{break-inside:auto}.notice{border:2px solid #b08322;padding:14px;background:#fff9e5}header{border-bottom:3px solid #173c4a;padding-bottom:15px}.sign{break-inside:avoid;border:1px solid #aaa;padding:16px;margin:18px 0}@media print{body{margin:0;padding:0;font-size:10.5pt}h1{font-size:20pt}h2,h3{break-after:avoid}tr,.notice{break-inside:avoid}a{color:inherit} @page{size:letter;margin:.7in}}</style><header><small>BLACK FLAG · '+esc(BUILD)+' · '+esc(TEMPLATE.version)+'</small><h1>'+esc(TEMPLATE.template)+'</h1><h2>'+esc(r.target.display_name)+'</h2><p class="notice"><b>DRAFT FOR LEGAL REVIEW — NOT FOR SIGNATURE.</b> Resolve all blanks and obtain review of the actual parties, jurisdiction and services. This file is not a signed agreement, legal opinion, invoice or commissioning permission.</p><p>Agreement '+esc(r.agreementId)+' · Revision '+r.revision+' · Project '+esc(r.target.project_id)+'</p><small>Draft terms SHA-256: '+esc(h)+'<br>Fingerprint identifies terms including template, not a signature or proof of identity.</small></header>'+vals+TEMPLATE.clauses.map(c=>'<section><h2>'+esc(c.title)+'</h2>'+c.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</section>').join('')+
 '<h2>Signature blocks — for a completed, separately approved final version</h2>'+['Provider authorized representative (Admiral commercial capacity)','Business authorized representative (not automatically the Captain)','Captain — limited acknowledgment only, not a personal guarantee'].map(t=>'<div class="sign"><h3>'+t+'</h3><p>Legal name: __________________________<br>Title / capacity: ______________________<br>Signature: ___________________________<br>Date and time: _______________________<br>Final agreement/version: _______________</p></div>').join('')+'<h2>Internal review log — reported, not independently verified</h2><p>'+esc(r.terms.reviewer||'[Reviewer not recorded]')+' · '+esc(r.terms.reviewRef||'[Review reference not recorded]')+'</p><p>'+esc(r.terms.reviewNotes||'No legal-review notes recorded.')+'</p><h2>Research references for counsel</h2><p>Research checked 2026-09-27. Virginia is a research starting point, not a selected governing law. Contract terms and periods are proposed drafting choices, not statutory minimums. Consult appropriate counsel for the actual jurisdictions, businesses and managed services.</p>'+TEMPLATE.references.map(s=>'<p><b>'+esc(s.title)+'</b><br><a href="'+esc(s.url)+'">'+esc(s.url)+'</a><br>'+esc(s.note)+'</p>').join('')+'</html>';}
 const model=Object.freeze({blank,sanitize,percent,cents,amount,channels,example,missing,stable,hash,scopeTarget,termPayload,schedule,html,template:TEMPLATE});
 const SESSION='darkSkySupabaseAdmiralSessionV1',DB='blackFlagCharterGuardDraftsV1';
 let root=null,deck=null,originFocus=null,rows=[],record=null,actor='',mark='',epoch=0,busy=false,dirty=false,step=0,db=null,openState=false,observed=null,pending=false;
 const stepNames=['Parties','Duties','Fees','Legal review','Files & signing'];
 // DraftWatch: navigation evidence contains control names/codes only, never draft data.
 let navigationGeneration=0,navigationTimer=0;
 let navigationReceipt=Object.freeze({requested:0,shown:0,code:'',at:0});
 function navigationMessage(message){const node=$('cgNavigationStatus');if(node){node.textContent=message;node.hidden=!message;}}
 function navigationNote(requested,shown,code=''){navigationReceipt=Object.freeze({requested,shown,code,at:Date.now()});}
 function cancelNavigation(){navigationGeneration++;clearTimeout(navigationTimer);navigationTimer=0;}
 function paintStep(n){for(let i=0;i<5;i++){const b=$('cgTab'+i),panel=$('cgPanel'+i);if(!b||!panel)throw Error('draft-panel-missing');b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;panel.hidden=i!==n;}}
 function confirmStep(n,previous){
  cancelNavigation();const generation=navigationGeneration;
  const check=()=>{
   if(generation!==navigationGeneration||!openState)return;
   clearTimeout(navigationTimer);
   if(!allowed()){close(true,'session-unavailable');return;}
   const panel=$('cgPanel'+n),button=$('cgTab'+n);
   const visible=!!root?.open&&!root.hidden&&root.matches(':modal')&&panel&&!panel.hidden&&panel.getClientRects().length>0&&button?.getAttribute('aria-selected')==='true';
   if(visible){navigationNote(n,n);navigationMessage('Viewing '+stepNames[n]+'. Draft terms are unchanged by navigation.');return;}
   try{paintStep(previous);step=previous;}catch(_){}
   navigationNote(n,previous,'DRAFT-TAB-DISPLAY-UNCONFIRMED');
   navigationMessage('DRAFT-TAB-DISPLAY-UNCONFIRMED · '+BUILD+' — '+stepNames[n]+' was not confirmed visible. No save, signature, fee or permission action was requested. Report this message.');
  };
  requestAnimationFrame(()=>requestAnimationFrame(check));navigationTimer=setTimeout(check,1500);
 }

 function client(){const c=window.BlackFlagV3Identity?.productionAuth?.readClientConfig?.();if(!c?.url||!c?.publishableKey||!window.DarkSkySupabase?.create)throw Error('Fleet Core is not configured.');return window.DarkSkySupabase.create({url:c.url,publishableKey:c.publishableKey,sessionKey:SESSION,build:BUILD});}
 function currentMark(){try{const s=window.DarkSkyAdmiralSession?.status(),u=client().readSession()?.user;if(!s?.reusable||!s.startedAt||!u?.id)return '';return String(s.startedAt)+':'+u.id;}catch(_){return '';}}
 function allowed(){return openState&&!!mark&&currentMark()===mark&&deck?.isConnected&&!deck.classList.contains('hidden')&&deck.getAttribute('aria-hidden')!=='true';}
 function status(t,tone='info'){if($('cgStatus')){$('cgStatus').textContent=t;$('cgStatus').dataset.tone=tone;}}
 function controls(){if(!root)return;const lock=!allowed()||busy;root.setAttribute('aria-busy',String(busy));root.querySelectorAll('input,select,textarea,button').forEach(n=>{n.disabled=lock;});$('cgClose').disabled=false;for(const id of ['cgSave','cgExport','cgDraftHtml','cgLoad','cgImport'])if($(id))$(id).disabled=lock||!record;root.querySelectorAll('[data-cg-field],[data-cg-service],[data-cg-channel],[data-cg-example]').forEach(n=>{n.disabled=lock||!record;});$('cgSignedFile').disabled=lock||!record?.snapshot;$('cgCertificateFile').disabled=lock||!record?.snapshot;$('cgEvidenceRef').disabled=lock||!record?.snapshot;$('cgRecordEvidence').disabled=lock||!record?.snapshot;$('cgSendSignatures').disabled=true;$('cgCommission').disabled=true;$('cgActivateFee').disabled=true;}
 function token(){if(!allowed()||busy)throw Error('Authenticate the Admiral and wait for the current task.');busy=true;controls();return {e:++epoch,m:mark,p:record?.target.project_id||''};}
 function valid(t){return !!t&&t.e===epoch&&t.m===mark&&allowed()&&(t.p===(record?.target.project_id||''));}
 async function verified(t){const ok=await client().verifyAdmiralAuthority();if(!ok){close(true);entryState('error','ADMIRAL-AUTHORITY-UNCONFIRMED');entryMessage('Contracts & Services closed because Admiral authority could not be verified. No task was continued.');throw Error('Admiral authority could not be rechecked. No task was continued.');}if(!valid(t))throw Error('The draft task was cancelled.');}
 async function withTask(fn){let t,timer;try{t=token();const work=(async()=>{await verified(t);if(valid(t))await fn(t);})();await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Draft task timed out. Saved state is unconfirmed; no automatic retry was made.')),12000);})]);}catch(e){if(!t||valid(t)){status(e.message,'warn');if(t&&/timed out/.test(e.message)){epoch++;busy=false;}}}finally{clearTimeout(timer);if(!t||t.e===epoch){busy=false;}controls();}}
 function revise(){if(!record)return;if(record.snapshot){record.history.push({revision:record.revision,termsHash:record.snapshot.termsHash,createdAt:record.snapshot.createdAt});record.snapshot=null;record.revision++;$('cgScope').textContent=record.target.display_name+' · '+record.target.project_id+' · DRAFT ONLY · Revision '+record.revision;}dirty=true;$('cgSignedFile').value='';$('cgCertificateFile').value='';updateReview();controls();}
 function newRecord(target){return {schema:'blackflag-agreement-working-v1',agreementId:crypto.randomUUID(),revision:1,target:scopeTarget(target),terms:blank(),history:[],evidence:[],snapshot:null,createdAt:new Date().toISOString()};}
 function field(k,label,type='text',extra=''){return '<label>'+label+'<input data-bf-trim="boundary" id="cg-'+k+'" data-cg-field="'+k+'" type="'+type+'" maxlength="'+FIELDS[k]+'" '+extra+' autocomplete="off"></label>';}
 function area(k,label,rows=3){return '<label>'+label+'<textarea data-bf-trim="boundary" id="cg-'+k+'" data-cg-field="'+k+'" maxlength="'+FIELDS[k]+'" rows="'+rows+'"></textarea></label>';}
 function form(){return `
 <div class="cg-shell"><header class="cg-head"><div><small>BLACK FLAG · VOYAGEKEEPER · ${BUILD}</small><h1 id="cgTitle" tabindex="-1">Commissioning agreements</h1><p id="cgIdentity">Admiral verification required</p></div><button id="cgClose" type="button">BACK TO COMMAND</button></header>
 <div class="cg-warning"><b>PRIVATE DRAFTING · NOT A SIGNATURE SERVICE</b><span>Drafts saved here are browser-local, not cloud-backed. Export your private draft file. No new fees or permissions are activated.</span></div>
 <div class="cg-target"><label>Exact vessel<select id="cgVessel"><option value="">Choose a vessel</option></select></label><div id="cgScope">No vessel selected.</div></div>
 <div id="cgPlanned" class="cg-grid" hidden><label>Planned vessel name<input data-bf-trim="boundary" id="cgPlanName" maxlength="180"></label><label>Proposed permanent key<input data-bf-trim="boundary" id="cgPlanKey" maxlength="63" autocapitalize="none" spellcheck="false" placeholder="new-vessel-key"></label><button id="cgPlanCreate" type="button">START PLANNED DRAFT</button><p>No registry entry or reserved identity is created.</p></div>
 <nav class="cg-tabs" role="tablist" aria-label="Agreement drafting steps">${stepNames.map((n,i)=>`<button id="cgTab${i}" type="button" role="tab" data-cg-step="${i}" aria-controls="cgPanel${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${i+1} · ${n}</button>`).join('')}</nav>
 <p id="cgNavigationStatus" class="cg-navigation-status" role="status" aria-live="polite" hidden></p>
 <section id="cgPanel0" class="cg-panel" role="tabpanel" aria-labelledby="cgTab0">
 <p class="cg-note">Use legal names and capacities, not just Admiral, Captain or a trading name. A Captain is not automatically authorized to sign for the owner.</p><div class="cg-grid">
 ${field('providerName','Black Flag service provider — legal name')}${field('businessName','Vessel business — legal name')}${field('providerSigner','Provider signer — name and title')}${field('businessSigner','Business signer — name and title')}${field('providerEmail','Provider notice email','email')}${field('businessEmail','Business notice email','email')}${field('captainName','Designated Captain — legal name')}${field('captainEmail','Captain account email','email')}</div>
 </section>
 <section id="cgPanel1" class="cg-panel" role="tabpanel" aria-labelledby="cgTab1" hidden><div class="cg-grid"><div><label>Service arrangement<select id="cg-level" data-cg-field="level"><option value="">Choose the negotiated arrangement</option>${Object.entries(LEVELS).map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select></label><fieldset><legend>Included services — choose explicitly</legend>${Object.entries(SERVICES).map(([k,n])=>`<label class="cg-check"><input type="checkbox" data-cg-service="${k}">${n}</label>`).join('')}</fieldset></div><div>${area('serviceLimits','Duties, retained support functions, limits and exclusions',5)}${field('hours','Support hours and time zone')}${field('response','Response target / escalation contact')}</div></div><p class="cg-note">Selected duties are proposed contract terms, not server access. Regulated services, banking, ownership and role-grant authority are excluded unless separately reviewed.</p></section>
 <section id="cgPanel2" class="cg-panel" role="tabpanel" aria-labelledby="cgTab2" hidden><div class="cg-grid"><div>${field('percentage','Admiral-negotiated percentage (0% allowed)','text','inputmode="decimal" placeholder="No default rate"')}<label>Sales included<select id="cg-basis" data-cg-field="basis"><option value="">Choose the negotiated sales basis</option><option value="platform">Black Flag-facilitated sales only</option><option value="all">All eligible business sales</option><option value="custom">Selected sales channels</option></select></label><fieldset id="cgChannels" hidden><legend>Included channels</legend>${Object.entries(CHANNELS).map(([k,n])=>`<label class="cg-check"><input type="checkbox" data-cg-channel="${k}">${n}</label>`).join('')}</fieldset>${field('startDate','Proposed service start — no retroactive activation','date')}<div class="cg-grid">${field('paymentDays','Payment due (days)','text','inputmode="numeric"')}${field('statementDays','Statement delivery (days)','text','inputmode="numeric"')}</div>${area('extras','Other negotiated fees / features included',2)}</div>
 <div class="cg-example"><small>ILLUSTRATION ONLY · NOT AN INVOICE</small><h2>Preview a monthly calculation</h2><p>Enter collected sales after the contract exclusions. Payment method does not change the sales channel.</p><div class="cg-grid">${Object.entries(CHANNELS).map(([k,n])=>`<label>${n}<input data-cg-example="${k}" data-zero-select="1" inputmode="decimal" value="0" maxlength="15"></label>`).join('')}</div><div id="cgMath" role="status">Select a percentage and sales basis.</div><p>No real sales are read, charged, debited or marked paid. Missing sales and later refunds need reconciliation.</p></div></div></section>
 <section id="cgPanel3" class="cg-panel" role="tabpanel" aria-labelledby="cgTab3" hidden><div class="cg-grid"><div>${area('providerAddress','Provider postal notice address',2)}${area('businessAddress','Business postal notice address',2)}${field('law','Governing law — counsel to confirm')}${field('venue','Court venue — counsel to confirm')}${field('liabilityFloor','Negotiated liability floor, USD','text','inputmode="decimal"')}${area('insurance','Insurance / coverage decision',2)}</div><div>${area('dataPlan','Data custody, actual subprocessors, retention, exports and restore responsibility',4)}${area('classification','Regulatory classification / required filings / disclosures — counsel decision',3)}${field('reviewer','Legal reviewer — reported name (not verified)')}${field('reviewRef','Review reference — private record, not a credential')}${area('reviewNotes','Counsel decisions / unresolved issues',3)}</div></div><details><summary>Legal classification and signing checks</summary><p>Collaboration does not require forming a legal partnership. Actual conduct can create partnership or franchise obligations regardless of labels. Counsel should evaluate branding, operational assistance, revenue fees, licensing, liability, privacy and the actual jurisdictions before any outside offer or execution.</p><p>No platform checkbox verifies legal advice, consent, signer authority or an electronic signature. Both business representatives sign; the Captain acknowledges limited personal duties separately.</p></details></section>
 <section id="cgPanel4" class="cg-panel" role="tabpanel" aria-labelledby="cgTab4" hidden><div class="cg-grid"><div><h2>Review and document copies</h2><div id="cgReadiness"></div><button id="cgDraftHtml" type="button">EXPORT CONTRACT REVIEW COPY</button><p>Produces printable HTML containing all schedules, terms, blank signature blocks and legal-review notes. It is marked Draft for legal review, not for signature. Printing or exporting does not verify custody.</p><details><summary>Read the template terms</summary><div id="cgTerms"></div></details><button id="cgSendSignatures" disabled type="button">SEND FOR SIGNATURES — NOT CONNECTED</button></div>
 <div><h2>Externally executed document evidence</h2><p>Select an externally reviewed and signed PDF only after creating a current draft snapshot. Files stay on your device; this tool records fingerprints, not signature validity or cloud custody.</p><label>Signed agreement PDF (maximum 10 MB)<input id="cgSignedFile" type="file" accept="application/pdf,.pdf"></label><label>Completion certificate PDF (optional)<input id="cgCertificateFile" type="file" accept="application/pdf,.pdf"></label><label>External signing / custody reference<input data-bf-trim="boundary" id="cgEvidenceRef" maxlength="240" autocomplete="off" placeholder="Private envelope or records reference"></label><button id="cgRecordEvidence" type="button">RECORD FILE FINGERPRINTS</button><div id="cgEvidence"></div><div class="cg-hold"><b>PRODUCTION COMMISSIONING HELD</b><p>${blocked}</p><button id="cgCommission" disabled type="button">COMMISSION — SERVER CHECK REQUIRED</button><button id="cgActivateFee" disabled type="button">ACTIVATE FEES — NOT ENABLED</button></div></div></div></section>
 <footer class="cg-footer"><button id="cgPrev" type="button">PREVIOUS</button><button id="cgNext" type="button">NEXT</button><button id="cgSave" type="button">SAVE DEVICE DRAFT</button><button id="cgLoad" type="button">LOAD DEVICE DRAFT</button><button id="cgExport" type="button">EXPORT PRIVATE DRAFT</button><label class="cg-import">IMPORT DRAFT<input id="cgImport" type="file" accept="application/json,.json"></label></footer><div id="cgStatus" role="status" aria-live="polite">Choose the exact vessel. No production commands are available.</div></div>`;}
 function setStep(n,focus=false){
  if(!openState||busy||!Number.isInteger(n))return false;
  if(!allowed()){close(true,'session-unavailable');return false;}
  const next=Math.max(0,Math.min(4,n)),previous=step;
  cancelNavigation();navigationNote(next,previous,'OPENING');
  try{
   // Render before switching the visible panel. Failure must not erase the draft or exit Command.
   if(next===4)updateReview();
   paintStep(next);step=next;controls();
   if(focus)$('cgTab'+next).focus({preventScroll:true});
   navigationMessage('Opening '+stepNames[next]+'…');confirmStep(next,previous);return true;
  }catch(_){
   if(!openState||!allowed()){close(true,'session-unavailable');return false;}
   try{paintStep(previous);step=previous;}catch(_){}
   navigationNote(next,previous,'DRAFT-TAB-OPEN-FAILED');
   navigationMessage('DRAFT-TAB-OPEN-FAILED · '+BUILD+' — '+stepNames[next]+' could not be opened. The current draft remains in this workspace. Nothing was saved, signed, charged or activated. Report this message before retrying.');
   return false;
  }
 }
 function fill(){const d=record?.terms||blank();for(const k of Object.keys(FIELDS)){const n=$('cg-'+k);if(n)n.value=d[k];}root.querySelectorAll('[data-cg-service]').forEach(n=>n.checked=d.services.includes(n.dataset.cgService));root.querySelectorAll('[data-cg-channel]').forEach(n=>n.checked=d.channels.includes(n.dataset.cgChannel));$('cgScope').textContent=record?`${record.target.display_name} · ${record.target.project_id} · ${record.target.prospective?'PLANNED ONLY':'DRAFT ONLY'} · Revision ${record.revision}`:'No vessel selected.';$('cgChannels').hidden=d.basis!=='custom';updateReview();math();controls();}
 function math(){try{if(!record)throw Error('Choose a vessel, percentage and sales basis.');const v=Object.fromEntries([...root.querySelectorAll('[data-cg-example]')].map(n=>[n.dataset.cgExample,n.value]));const n=example(record.terms,v);$('cgMath').textContent='Eligible scenario sales: '+amount(n.base)+' · Illustrative fee: '+amount(n.fee);}
 catch(e){$('cgMath').textContent=e.message;}}
 function updateReview(){if(!$('cgReadiness'))return;if(!record){$('cgReadiness').textContent='Choose a vessel to prepare an agreement.';$('cgEvidence').textContent='No files recorded.';return;}
 const gaps=missing(record.terms);$('cgReadiness').innerHTML=`<p><b>${gaps.length?'DRAFT INCOMPLETE · '+gaps.length+' fields / decisions':'DRAFT FIELDS COMPLETE — LEGAL REVIEW STILL REQUIRED'}</b></p>${gaps.length?'<ul>'+gaps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>Field completeness is not a legal opinion or authorization to sign.</p>'}<p>${record.terms.reviewer&&record.terms.reviewRef?'Review reference recorded by Admiral; not independently verified.':'Legal-review evidence has not been recorded.'}</p>${record.snapshot?'<small>Current draft terms SHA-256: '+esc(record.snapshot.termsHash)+'</small>':'<p>Export a review copy or private draft to create a version-bound snapshot.</p>'}`;
 $('cgEvidence').innerHTML=record.evidence.length?record.evidence.map(e=>`<article class="cg-file"><b>${record.snapshot&&e.termsHash===record.snapshot.termsHash?'FILE EVIDENCE RECORDED — SIGNATURES UNVERIFIED':'PRIOR / IMPORTED FILE EVIDENCE — NOT CURRENT SIGNING PROOF'}</b><p>${esc(e.file.name)} · SHA-256 ${esc(e.file.sha256)}</p><small>Bound to draft revision ${esc(e.revision)} · ${esc(e.recordedAt)} · reference ${esc(e.reference)}</small><p>The original PDF is not stored in this draft. Retain it and any certificate in an authorized private record system. No signature, contents match or custody was verified.</p></article>`).join(''):'<p>No executed-file evidence recorded.</p>';
 }
 function discardQuestion(){return !dirty||window.confirm('This draft has changes not confirmed saved. Export or Save device draft before leaving. Leave this draft view now?');}
 async function choose(){if(!allowed()||busy)return;const value=$('cgVessel').value;if(!discardQuestion()){$('cgVessel').value=record?.target.project_id||'';return;}record=null;dirty=false;epoch++;$('cgSignedFile').value='';$('cgCertificateFile').value='';$('cgEvidenceRef').value='';root.querySelectorAll('[data-cg-example]').forEach(n=>n.value='0');$('cgPlanned').hidden=value!=='__planned__';if(value&&value!=='__planned__'){const r=rows.find(x=>x.project_id===value);if(r)record=newRecord(r);}fill();status(record?'New private draft for '+record.target.display_name+'. Use Load device draft to recover an earlier version. No default percentage is selected.':'Select an existing vessel or define a planned vessel.');}
 function plan(){if(!allowed()||busy)return;const name=$('cgPlanName').value.trim(),key=$('cgPlanKey').value.trim().toLowerCase();try{if(rows.some(x=>x.project_id===key))throw Error('That key is already in this directory. Select its existing vessel instead.');record=newRecord({project_id:key,display_name:name,prospective:true});rows.push(record.target);const o=document.createElement('option');o.value=key;o.textContent=name+' · PLANNED';$('cgVessel').append(o);$('cgVessel').value=key;$('cgPlanned').hidden=true;dirty=true;fill();status('Planned draft only. The proposed key is not reserved and no server vessel was created.');}catch(e){status(e.message,'warn');}}
 async function dbOpen(){if(db)return db;db=await new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('drafts',{keyPath:'id'});s.createIndex('scope','scope');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Device draft storage unavailable. Export your private draft instead.'));r.onblocked=()=>reject(Error('Device draft storage is busy. Export your private draft instead.'));});return db;}
 async function storeDraft(t){const h=await dbOpen();if(!valid(t))return;const copy=JSON.parse(JSON.stringify(record)),id=crypto.randomUUID(),at=new Date().toISOString(),scope=actor+'|'+record.target.project_id;
 await new Promise((res,rej)=>{const tx=h.transaction('drafts','readwrite');tx.objectStore('drafts').add({id,scope,at,record:copy});tx.oncomplete=res;tx.onerror=()=>rej(Error('Draft save failed. Export instead; the earlier device copy was not replaced.'));tx.onabort=()=>rej(Error('Draft save interrupted. Export instead.'));});
 const read=await new Promise((res,rej)=>{const tx=h.transaction('drafts','readonly'),q=tx.objectStore('drafts').get(id);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(Error('Draft readback unavailable. Keep an exported copy.'));});if(!read||stable(read.record)!==stable(copy))throw Error('Draft save could not be verified. Keep an exported copy.');if(valid(t)){dirty=false;status('DEVICE DRAFT READBACK VERIFIED · '+at+'. Browser-local only, not a cloud backup. Earlier saves retained.','saved');}}
 async function loadDraft(t){if(!record)throw Error('Select a vessel first.');if(!discardQuestion())return;const h=await dbOpen();if(!valid(t))return;const scope=actor+'|'+record.target.project_id,all=await new Promise((res,rej)=>{const tx=h.transaction('drafts','readonly'),q=tx.objectStore('drafts').index('scope').getAll(scope);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(Error('Device draft could not be read.'));});if(!valid(t))return;if(!all.length)throw Error('No device draft for this Admiral and vessel. Import a private draft or start a new one.');const last=all.sort((a,b)=>a.at.localeCompare(b.at)).at(-1);validateRecord(last.record,record.target.project_id);record=last.record;record.terms=sanitize(record.terms);dirty=false;fill();status('Loaded device draft for '+record.target.display_name+'. Its review notes and file evidence remain unverified.');}
 function validateRecord(r,expected){if(!r||r.schema!=='blackflag-agreement-working-v1'||!scopeTarget(r.target)||r.target.project_id!==expected)throw Error('Draft belongs to a different vessel. Select that exact vessel before importing.');if(typeof r.agreementId!=='string'||!/^[a-f0-9-]{36}$/.test(r.agreementId)||!Number.isInteger(r.revision)||r.revision<1||r.revision>100000)throw Error('Invalid agreement identity/version.');sanitize(r.terms);if(!Array.isArray(r.history)||r.history.length>1000||!Array.isArray(r.evidence)||r.evidence.length>1000)throw Error('Invalid draft history.');}
 async function snapshot(t){if(!record)throw Error('Select a vessel first.');const payload=termPayload(record),termsHash=await hash(stable(payload));if(!valid(t))return null;record.snapshot={termsHash,createdAt:new Date().toISOString(),templateVersion:TEMPLATE.version};updateReview();controls();return {payload,termsHash};}
 function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 async function exportDraft(t,asHtml){const s=await snapshot(t);if(!s||!valid(t))return;const name='BlackFlag-'+record.target.project_id+'-Agreement-r'+record.revision+'-'+s.termsHash.slice(0,10);if(asHtml)download(name+'-LEGAL-REVIEW.html',html(record,s.termsHash),'text/html;charset=utf-8');else download(name+'-PRIVATE-DRAFT.json',JSON.stringify({schema:'blackflag-private-agreement-export-v1',status:'UNVERIFIED_DRAFT',exportedAt:new Date().toISOString(),authorAccount:client().readSession()?.user?.email||'',termsHash:s.termsHash,templateVersion:TEMPLATE.version,record},null,2),'application/json');status('Download prepared. Save it in private Files, not the public GitHub repository. A download request is not proof the file was saved.','info');}
 async function importDraft(t,file){if(!file) return;if(file.size>1200000)throw Error('Draft file exceeds 1.2 MB. No import made.');const data=JSON.parse(await file.text());if(!valid(t))return;if(data.schema!=='blackflag-private-agreement-export-v1'||data.templateVersion!==TEMPLATE.version)throw Error('Unsupported draft format or template. No import made.');validateRecord(data.record,record.target.project_id);const hashValue=await hash(stable(termPayload(data.record)));if(!valid(t))return;if(hashValue!==data.termsHash)throw Error('Draft fingerprint does not match its terms. No import made.');if(!discardQuestion())return;
 // Imported status, signer claims and artifact metadata do not confer trusted review/signature state.
 const r=data.record;record={schema:'blackflag-agreement-working-v1',agreementId:r.agreementId,revision:r.revision,target:scopeTarget(r.target),terms:sanitize(r.terms),history:[],evidence:[],snapshot:null,createdAt:typeof r.createdAt==='string'?r.createdAt:new Date().toISOString()};dirty=true;fill();status('Imported matching vessel terms as an UNVERIFIED DRAFT. External history/signature claims were not trusted. Save a device copy or export a fresh review snapshot.','warn');}
 async function pdfInfo(file){if(!file)return null;if(file.size>10*1024*1024||file.size<5)throw Error('Select a PDF between 5 bytes and 10 MB.');const bytes=await file.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Selected file does not have a PDF header.');return {name:file.name.slice(0,200),bytes:file.size,sha256:await hash(bytes)};}
 async function evidence(t){if(!record?.snapshot)throw Error('Create a current draft snapshot first.');const file=$('cgSignedFile').files[0],cert=$('cgCertificateFile').files[0],ref=$('cgEvidenceRef').value.trim();if(!file||!ref)throw Error('Select the signed-document PDF and enter its external custody reference.');const termsHash=record.snapshot.termsHash,[f,c]=await Promise.all([pdfInfo(file),pdfInfo(cert)]);if(!valid(t)||record.snapshot?.termsHash!==termsHash)return;record.evidence.push({revision:record.revision,termsHash,file:f,certificate:c,reference:ref.slice(0,240),recordedAt:new Date().toISOString(),signaturesVerified:false,custodyVerified:false,source:'manual-file-selection'});dirty=true;$('cgSignedFile').value='';$('cgCertificateFile').value='';updateReview();status('File fingerprints recorded locally. Signatures, signer authority, document contents match and external custody are NOT verified. Save or export this receipt. Production remains held.','warn');}
 function render(){if(root)return;root=document.createElement('dialog');root.id='cgWorkspace';root.className='cg-workspace';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','cgTitle');root.innerHTML=form();document.body.append(root);$('cgTerms').innerHTML=TEMPLATE.clauses.map(c=>'<h3>'+esc(c.title)+'</h3>'+c.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')).join('');
 $('cgClose').onclick=()=>close(false,'back-to-command');$('cgVessel').onchange=choose;$('cgPlanCreate').onclick=plan;$('cgPrev').onclick=()=>setStep(step-1,true);$('cgNext').onclick=()=>setStep(step+1,true);
 for(const [id,fn] of [['cgSave',storeDraft],['cgLoad',loadDraft],['cgExport',t=>exportDraft(t,false)],['cgDraftHtml',t=>exportDraft(t,true)],['cgRecordEvidence',evidence]])$(id).onclick=()=>withTask(fn);
 $('cgImport').onchange=()=>{const f=$('cgImport').files[0];withTask(t=>importDraft(t,f)).finally(()=>$('cgImport').value='');};
 root.addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest('button[data-cg-step]'):null;if(!b||!root.querySelector('.cg-tabs')?.contains(b))return;e.preventDefault();e.stopPropagation();if(!b.disabled&&!busy)setStep(Number(b.dataset.cgStep));});
 root.addEventListener('input',e=>{const n=e.target;if(!record||busy||!allowed())return;if(n.dataset.cgField){const k=n.dataset.cgField;if(!Object.hasOwn(FIELDS,k))return;record.terms[k]=n.value;revise();$('cgChannels').hidden=record.terms.basis!=='custom';math();}if(n.dataset.cgExample)math();});
 root.addEventListener('focusin',e=>{const n=e.target;if(n instanceof HTMLInputElement&&n.dataset.zeroSelect==='1'&&n.value==='0'){requestAnimationFrame(()=>{try{n.select();}catch(_){}});}});
 root.addEventListener('focusout',e=>{const n=e.target;if(n instanceof HTMLInputElement&&n.dataset.zeroSelect==='1'&&!String(n.value||'').trim()){n.value='0';math();}});
 root.addEventListener('change',e=>{const n=e.target;if(!record||busy||!allowed())return;if(n.dataset.cgService){record.terms.services=[...root.querySelectorAll('[data-cg-service]:checked')].map(n=>n.dataset.cgService);revise();}if(n.dataset.cgChannel){record.terms.channels=[...root.querySelectorAll('[data-cg-channel]:checked')].map(n=>n.dataset.cgChannel);revise();math();}if(n.dataset.cgField&&n.tagName==='SELECT')n.dispatchEvent(new Event('input',{bubbles:true}));});
 root.querySelector('.cg-tabs').addEventListener('keydown',e=>{const i=Number(e.target.dataset.cgStep);if(!Number.isInteger(i))return;let n=i;if(e.key==='ArrowRight')n=(i+1)%5;else if(e.key==='ArrowLeft')n=(i+4)%5;else if(e.key==='Home')n=0;else if(e.key==='End')n=4;else return;e.preventDefault();setStep(n,true);});
 root.addEventListener('cancel',e=>{e.preventDefault();close(false,'dismiss-request');});
 root.addEventListener('close',()=>{if(openState&&!root.open)close(true,'native-close');});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(false,'escape');}if(e.key==='Tab'){const focusable=[...root.querySelectorAll('button,input,textarea,select,summary,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 }
 function entryMessage(message){
  const d=$('admiralDeck');if(!d)return;
  let n=$('cgEntryStatus');
  if(!n){n=document.createElement('p');n.id='cgEntryStatus';n.className='cg-entry-status';n.setAttribute('role','status');n.setAttribute('aria-live','polite');n.setAttribute('aria-atomic','true');const anchor=d.querySelector('.admiral-session-strip')||d.querySelector('.admiral-deck-head');if(anchor)anchor.after(n);else d.prepend(n);}
  n.textContent=message;n.hidden=!message;
 }
 // DraftWatch: verify a displayed, reachable modal before loading the vessel directory.
 let entryPhase='idle',entryCode='';
 function entryState(phase,code=''){
  entryPhase=phase;entryCode=code;
  const button=$('cgOpen');if(button){button.dataset.entryState=phase;button.setAttribute('aria-expanded',String(phase==='open'||phase==='opening'));button.setAttribute('aria-busy',String(phase==='opening'));button.textContent=phase==='opening'?'OPENING CONTRACTS…':'CONTRACTS & SERVICES';}
 }
 async function confirmForeground(generation){
  let timer;
  const painted=await Promise.race([
   new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!root?.isConnected||!root.open||root.hidden||!root.matches(':modal')){resolve(false);return;}
    const c=$('cgClose'),r=c?.getBoundingClientRect(),style=getComputedStyle(root);
    if(!r||r.width<1||r.height<1||style.display==='none'||style.visibility!=='visible'||Number(style.opacity)===0){resolve(false);return;}
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    resolve(!!hit&&c.contains(hit));
   }))),
   new Promise(resolve=>{timer=setTimeout(()=>resolve(false),1500);})
  ]);clearTimeout(timer);
  if(!openState||epoch!==generation)return false;
  if(!painted)throw Error('contract-foreground-unconfirmed');
  return true;
 }
 document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest('#cgOpen,[data-cg-open]');
  if(!button||button.disabled||!button.closest('#admiralDeck'))return;
  event.preventDefault();event.stopPropagation();
  void open().catch(()=>{close(true);entryState('error','CONTRACTS-ENTRY-FAILED');entryMessage('CONTRACTS-ENTRY-FAILED · '+BUILD+' — The workspace did not open. Command remains available. No contract or fleet change was made.');});
 },true);
 async function open(){
  deck=$('admiralDeck');
  if(!deck||deck.classList.contains('hidden')||deck.getAttribute('aria-hidden')==='true')return false;
  if(openState&&root?.open){return true;}
  const m=currentMark();
  if(!m){entryState('error','ADMIRAL-SIGNIN-REQUIRED');entryMessage('Contracts & Services did not open: Admiral account verification is required. Return through Build & Govern to authenticate. No contract or fleet change was made.');return false;}
  originFocus=document.activeElement;entryState('opening');entryMessage('Opening Contracts & Services… No contract or fleet change.');
  try{
   render();
   if(typeof root.showModal!=='function')throw Error('modal-unavailable');
   mark=m;actor=client().readSession().user.id;openState=true;epoch++;
   record=null;rows=[];dirty=false;step=0;
   root.hidden=false;
   root.showModal();
   if(!root.open||!root.matches(':modal'))throw Error('native-modal-not-open');
   deck.inert=true;
   root.scrollTop=0;
   fill();setStep(0);$('cgTitle').focus({preventScroll:true});
   entryMessage('');
   status('Opening agreements: checking Admiral authority and reading vessel identities. No contract or fleet change.');
   if(!await confirmForeground(epoch))return false;
   if(!allowed()){close(true);entryState('error','ADMIRAL-SIGNIN-REQUIRED');entryMessage('Admiral verification expired before the workspace opened. Sign in again. No contract or fleet change.');return false;}
   entryState('open');
  }catch(error){
   close(true);
   if(root){root.remove();root=null;}
   deck.inert=false;
   entryState('error','CONTRACTS-DISPLAY-UNCONFIRMED');
   entryMessage('CONTRACTS-DISPLAY-UNCONFIRMED · '+BUILD+' — Contracts & Services could not be displayed. Command remains available. No contract or fleet change was made. Report this message before trying again.');
   return false;
  }
  await withTask(async t=>{
   const data=await client().rpc('admiral_list_vessels_for_branding',{},'Vessel directory unavailable.');
   if(!valid(t))return;
   if(!Array.isArray(data?.records))throw Error('Vessel directory response is incomplete.');
   const raw=data.records.filter(x=>x.mission_class!=='admiral_program');rows=raw.map(x=>scopeTarget(x));
   if(new Set(rows.map(x=>x.project_id)).size!==rows.length)throw Error('Duplicate vessel identities.');
   $('cgVessel').innerHTML='<option value="">Choose a vessel</option>'+rows.map(x=>'<option value="'+esc(x.project_id)+'">'+esc(x.display_name)+'</option>').join('')+'<option value="__planned__">Planned new ship — draft only</option>';
   $('cgIdentity').textContent='Admiral drafting · '+(client().readSession()?.user?.email||'Verified Admiral account');
   status('Vessel identities loaded. Choose an exact ship. Saved drafts stay on this browser; export them privately.');
  });
  return openState;
 }
 function close(force=false,reason='internal-close'){
  // A repeated ended/unavailable event must not erase the reason needed by reauthentication cleanup.
  if(!openState)return;
  if(!force&&!discardQuestion())return;
  const lastRequested=navigationReceipt.requested,hadUnsaved=dirty;
  cancelNavigation();navigationMessage('');entryState('idle');epoch++;busy=false;openState=false;mark='';actor='';record=null;rows=[];dirty=false;if(root){if(root.open)root.close();root.hidden=true;root.querySelectorAll('input,textarea').forEach(n=>n.value='');$('cgVessel').innerHTML='<option value="">Choose a vessel</option>';$('cgReadiness').textContent='';$('cgEvidence').textContent='';$('cgIdentity').textContent='Admiral verification required';$('cgScope').textContent='No vessel selected.';$('cgStatus').textContent='';$('cgMath').textContent='Choose a vessel, percentage and sales basis.';$('cgPlanName').value='';$('cgPlanKey').value='';}if(deck)deck.inert=false;originFocus?.isConnected&&originFocus.focus?.({preventScroll:true});
  const exceptional={'native-close':'DRAFT-WORKSPACE-CLOSED','context-change':'DRAFT-CONTEXT-CHANGED','session-unavailable':'SESSION-ENDED'};
  if(exceptional[reason]){
   const code=exceptional[reason];entryState('error',code);navigationNote(lastRequested,step,code);
   const why=reason==='native-close'?'The draft dialog closed without Back to Command being handled.':reason==='context-change'?'The workspace context changed.':'The Admiral session could not be reused.';
   entryMessage(code+' · '+BUILD+' — '+why+' Last requested section: '+stepNames[lastRequested]+'. Earlier saved device drafts were not deleted.'+(hadUnsaved?' Unsaved edits were not confirmed saved.':'')+' No signing, fee or permission action was requested by this navigation.');
  }
 }
 function mount(){const d=$('admiralDeck');if(!d)return false;deck=d;const actions=d.querySelector('.admiral-deck-head-actions');if(actions&&!$('cgOpen')){const b=document.createElement('button');b.id='cgOpen';b.type='button';b.textContent='CONTRACTS & SERVICES';b.setAttribute('aria-controls','cgWorkspace');b.setAttribute('aria-expanded','false');actions.prepend(b);}const target=$('admiralCommissioningStation');if(target&&!$('cgCommissionNote')){const n=document.createElement('div');n.id='cgCommissionNote';n.className='cg-inline-notice';n.innerHTML='<b>Signed agreement required before a new business joins the fleet.</b><p>Prepare its legal parties, service scope and negotiated fee in Contracts & Services. New business commission and departure controls are held in this client until a server can verify the executed agreement. Existing test vessels and appointments are not changed.</p><button type="button">PREPARE COMMISSIONING AGREEMENT</button>';n.querySelector('button').setAttribute('data-cg-open','');target.prepend(n);}if(!observed){observed=new MutationObserver(()=>{if(openState&&(!currentMark()||currentMark()!==mark||deck.classList.contains('hidden')))close(true,'context-change');});observed.observe(d,{attributes:true,attributeFilter:['class','aria-hidden']});}return true;}
 window.DarkSkyCharterGuard=Object.freeze({build:BUILD,model,open,mount,isWorkspaceOpen:allowed,entryStatus:()=>Object.freeze({build:BUILD,phase:entryPhase,code:entryCode}),navigationStatus:()=>navigationReceipt,holdMessage:blocked,serverContractVerified:()=>false});
 for(const e of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])window.addEventListener(e,()=>{const wasOpen=openState;close(true);if(wasOpen){entryState('error','SESSION-ENDED');entryMessage('Secure Admiral session ended or could not be reverified. Admiral rank is retained. Sign in again before reopening Contracts & Services. Earlier saved device drafts were not deleted.');}});
 window.addEventListener('darksky:admiral-session-changed',()=>{mount();const s=window.DarkSkyAdmiralSession?.status();if(s?.reusable&&entryCode==='SESSION-ENDED'&&!openState){entryState('idle');entryMessage('');}if(openState&&currentMark()!==mark)close(true,'context-change');});
 window.addEventListener('darksky:admiral-deck-ready',mount);window.addEventListener('beforeunload',e=>{if(openState&&dirty){e.preventDefault();e.returnValue='';}});mount();
})();

