(()=>{
  'use strict';
  const VERSION='4.3.9';
  const MODE_KEY='bfExperienceTestDeckModeV1';
  const PREVIEW_KEY='bfExperiencePreviewSeenV1';
  const DB_NAME='blackFlagPlatformV1';
  const ORDERS_STORE='orders';
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const now=()=>new Date().toISOString();
  let activeDeckProjectId='';
  let seaTrialPoll=null;

  function bridge(){return window.DarkSkyExperienceBridge||null;}
  function project(id){return bridge()?.projectById?.(id)||null;}
  function deploymentsFor(p){try{return (bridge()?.migrateLegacyDeployment?.(p)||[]).filter(d=>d&&d.state!=='retired');}catch(_){return [];}}
  function rendererReady(p){try{return !!bridge()?.projectCustomerOperatingModelReady?.(p);}catch(_){return false;}}
  function stable(value){
    if(Array.isArray(value))return value.map(stable);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((o,k)=>{if(value[k]!==undefined)o[k]=stable(value[k]);return o;},{});
    return value;
  }
  function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function configSignature(p){
    if(!p)return '';
    const payload={
      id:p.id,name:p.name,tagline:p.tagline,description:p.description,
      branding:p.branding,products:p.products,customerExperience:p.customerExperience,
      businessBrief:p.businessBrief,operatingModel:p.operatingModel,customerRelationship:p.customerRelationship,
      visualPresentation:p.visualPresentation,workflow:p.workflow,architecture:p.architecture,
      graphics:p.graphics,assets:p.assets,assetSlots:p.assetSlots,projectTheme:p.projectTheme,type:p.type,businessType:p.businessType
    };
    return `cfg-${hash(JSON.stringify(stable(payload)))}`;
  }
  function stateFor(p){
    const sig=configSignature(p);
    const exp=p?.experienceTest||{};
    const approval=exp.approval||{};
    const sea=exp.seaTrial||{};
    const ds=deploymentsFor(p);
    const boundary=ds.every(d=>!d.projectId||String(d.projectId)===String(p.id));
    const currentApproval=!!sig&&approval.signature===sig;
    const currentSea=!!sig&&sea.signature===sig&&!!sea.passedAt;
    const shellReady=rendererReady(p);
    const trial=ds.find(d=>d.state==='sea_trial')||ds.find(d=>d.state==='deployed')||null;
    const live=ds.find(d=>d.state==='deployed')||null;
    const ready=currentApproval&&currentSea&&shellReady&&boundary&&!!trial;
    return {sig,approval,sea,currentApproval,currentSea,shellReady,boundary,trial,live,ds,ready};
  }
  function fleetReadinessFor(p){
    const s=stateFor(p);
    const missing=[];
    if(!s.shellReady)missing.push('customer experience');
    if(!s.currentApproval)missing.push(s.approval?.signature?'fresh experience approval':'experience approval');
    if(!s.trial)missing.push('Sea Trial outpost');
    if(!s.currentSea)missing.push(s.sea?.signature?'fresh Sea Trial proof':'Sea Trial proof');
    if(!s.boundary)missing.push('project boundary repair');
    return {ready:s.ready,detail:s.ready?'Experience approved and Sea Trial proof matches the current configuration.':`Test Deck requires ${missing.join(', ')}.`};
  }

  function injectStyles(){
    if(document.getElementById('experienceTestDeckStyles'))return;
    const style=document.createElement('style');style.id='experienceTestDeckStyles';style.textContent=`
      .project-card-actions.experience-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
      .project-card-actions.experience-actions [data-project-launch]{grid-column:1/-1}
      .experience-test-btn{border-color:#4d9ab4!important;color:#d9f5ff!important;background:rgba(27,92,113,.18)!important}
      #experienceTestDeck{position:fixed;inset:0;z-index:2147483000;background:#06161c;color:#edf6f7;overflow:auto;-webkit-overflow-scrolling:touch;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #experienceTestDeck.hidden{display:none!important}.etd-shell{max-width:1180px;margin:0 auto;padding:32px clamp(18px,4vw,44px) 70px}.etd-head{display:flex;gap:20px;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #274751;padding-bottom:22px;margin-bottom:22px}.etd-kicker{font-size:13px;letter-spacing:.18em;font-weight:800;color:#79d4ea}.etd-head h1{font:800 clamp(32px,5vw,54px)/1.02 Georgia,serif;margin:7px 0 8px;color:#fff}.etd-head p{margin:0;color:#9db1b7;font-size:17px}.etd-close{min-height:50px;padding:0 20px;border-radius:12px;border:1px solid #56707a;background:#edf3f4;color:#142b34;font-weight:800}.etd-statusbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:20px}.etd-status{border:1px solid #294b57;background:#0a2028;border-radius:14px;padding:15px}.etd-status span{display:block;color:#7fa0aa;font-size:11px;letter-spacing:.13em;font-weight:800}.etd-status strong{display:block;margin-top:5px;font-size:18px}.etd-status.pass{border-color:#397257}.etd-status.warn{border-color:#80672d}.etd-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.etd-mode{border:1px solid #2b505d;background:linear-gradient(145deg,#0b232c,#081b22);border-radius:18px;padding:20px;display:flex;flex-direction:column;min-height:310px}.etd-mode .num{font-size:12px;letter-spacing:.16em;color:#72cce2;font-weight:800}.etd-mode h2{margin:10px 0 8px;font-size:28px;color:#fff}.etd-mode p{color:#a9bcc2;line-height:1.45;margin:0 0 14px}.etd-mode ul{margin:4px 0 18px;padding-left:19px;color:#c4d2d6;line-height:1.55}.etd-mode button{margin-top:auto;min-height:54px;border-radius:12px;border:1px solid #4b879a;background:#166d91;color:#fff;font-weight:800;padding:10px}.etd-mode button.secondary{background:#122d36}.etd-mode button:disabled{opacity:.45}.etd-checks{margin-top:18px;border:1px solid #294b57;background:#091d24;border-radius:18px;padding:20px}.etd-checks h2{margin:0 0 14px}.etd-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.etd-check{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #234550;border-radius:11px;padding:12px 14px;background:#0a222a}.etd-check b{font-size:13px}.etd-check span{font-size:12px;font-weight:800}.etd-check.pass span{color:#80d69b}.etd-check.warn span{color:#e5c66c}.etd-check.fail span{color:#ef8d7d}.etd-ready{margin-top:18px;padding:16px 18px;border-radius:14px;border:1px solid #7c6430;background:#2a2210;color:#f1d982}.etd-ready.pass{border-color:#3c7d59;background:#10291b;color:#9ce2b4}.etd-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.etd-actions button{min-height:48px;padding:0 18px;border-radius:10px;border:1px solid #426b78;background:#12303a;color:#eef7f8;font-weight:800}.etd-actions button.primary{background:#19759b}.etd-note{font-size:13px;color:#819aa2;margin-top:12px}.etd-modebar{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147482999;display:flex;align-items:center;gap:14px;background:#071b22f2;border:1px solid #3b6877;box-shadow:0 10px 35px #0008;border-radius:999px;padding:8px 9px 8px 16px;max-width:calc(100vw - 24px);color:#eef7f8}.etd-modebar strong{font-size:12px;letter-spacing:.09em;white-space:nowrap}.etd-modebar span{font-size:12px;color:#a5bcc4;white-space:nowrap}.etd-modebar button{border:0;border-radius:999px;background:#eaf1f2;color:#18303a;padding:10px 14px;font-weight:800;white-space:nowrap}.etd-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483001;background:#102a34;color:#fff;border:1px solid #53889b;border-radius:12px;padding:13px 18px;box-shadow:0 12px 34px #0009;font-weight:700;max-width:min(680px,calc(100vw - 30px));text-align:center}.etd-preview-blocked{outline:2px dashed #69b5c8!important;outline-offset:2px}
      @media(max-width:820px){.etd-modes{grid-template-columns:1fr}.etd-statusbar{grid-template-columns:1fr}.etd-check-grid{grid-template-columns:1fr}.etd-head{flex-direction:column}.etd-close{width:100%}.etd-mode{min-height:auto}.etd-modebar span{display:none}.project-card-actions.experience-actions{grid-template-columns:1fr!important}.project-card-actions.experience-actions [data-project-launch]{grid-column:auto}}
    `;document.head.appendChild(style);
  }
  function toast(message){const old=document.querySelector('.etd-toast');old?.remove();const el=document.createElement('div');el.className='etd-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);}

  function addCardButtons(){
    $$('#projectCommandCards .project-card').forEach(card=>{
      if(card.classList.contains('commission-draft-card'))return;
      const control=card.querySelector('[data-open-project-control]');
      const actions=card.querySelector('.project-card-actions');
      if(!control||!actions)return;
      const id=control.dataset.openProjectControl;
      if(!id||actions.querySelector('[data-test-experience]'))return;
      const b=document.createElement('button');b.type='button';b.dataset.testExperience=id;b.className='secondary-btn small experience-test-btn';b.textContent='TEST EXPERIENCE';
      const launch=actions.querySelector('[data-project-launch]');actions.insertBefore(b,launch||null);actions.classList.add('experience-actions');
    });
  }

  function openDeck(projectId){
    const p=project(projectId);if(!p){toast('Dark Sky could not resolve that Project ID.');return;}
    activeDeckProjectId=projectId;
    injectStyles();
    let deck=document.getElementById('experienceTestDeck');if(!deck){deck=document.createElement('section');deck.id='experienceTestDeck';document.body.appendChild(deck);}
    renderDeck(p,deck);deck.classList.remove('hidden');document.body.style.overflow='hidden';
  }
  function closeDeck(){document.getElementById('experienceTestDeck')?.classList.add('hidden');document.body.style.overflow='';activeDeckProjectId='';}

  function previewSeen(p,s){try{const x=JSON.parse(sessionStorage.getItem(PREVIEW_KEY)||'{}');return x[p.id]===s.sig;}catch(_){return false;}}
  function markPreviewSeen(p,s){try{const x=JSON.parse(sessionStorage.getItem(PREVIEW_KEY)||'{}');x[p.id]=s.sig;sessionStorage.setItem(PREVIEW_KEY,JSON.stringify(x));}catch(_){}}
  function check(label,ok,waiting='REQUIRED'){return `<div class="etd-check ${ok?'pass':'warn'}"><b>${esc(label)}</b><span>${ok?'PASS':waiting}</span></div>`;}

  function renderDeck(p,deck=document.getElementById('experienceTestDeck')){
    if(!deck)return;const s=stateFor(p);const seen=previewSeen(p,s);const trialLabel=s.trial?`${s.trial.name||'Outpost'} • ${String(s.trial.state).replace('_',' ')}`:'No Sea Trial outpost';
    const liveReady=!!s.live&&p.publish?.status==='live';
    deck.innerHTML=`<div class="etd-shell">
      <header class="etd-head"><div><div class="etd-kicker">BLACK FLAG • EXPERIENCE TEST DECK • ${esc(VERSION)}</div><h1>${esc(p.name)}</h1><p>One customer experience. Three operating modes. Preview without writes, Sea Trial against real project infrastructure, Live only when sailing.</p></div><button type="button" class="etd-close" data-etd-close>RETURN TO ENGINE</button></header>
      <div class="etd-statusbar"><div class="etd-status ${s.currentApproval?'pass':'warn'}"><span>EXPERIENCE APPROVAL</span><strong>${s.currentApproval?'CURRENT':s.approval?.signature?'STALE':'NOT APPROVED'}</strong></div><div class="etd-status ${s.currentSea?'pass':'warn'}"><span>SEA TRIAL PROOF</span><strong>${s.currentSea?'CURRENT':s.sea?.signature?'STALE':'NOT PASSED'}</strong></div><div class="etd-status ${s.boundary?'pass':'warn'}"><span>PROJECT BOUNDARY</span><strong>${s.boundary?'SEALED':'CHECK REQUIRED'}</strong></div></div>
      <div class="etd-modes">
        <article class="etd-mode"><span class="num">01 • PREVIEW</span><h2>See what customers see</h2><p>Uses this vessel's real customer renderer and current configuration without creating customer, order, engagement, deployment, or lifecycle records.</p><ul><li>Current branding and offers</li><li>Current customer workflow</li><li>Submission is deliberately disabled</li></ul><button type="button" data-etd-preview ${s.shellReady?'':'disabled'}>${s.shellReady?'OPEN PRIVATE PREVIEW':'CUSTOMER EXPERIENCE NOT READY'}</button></article>
        <article class="etd-mode"><span class="num">02 • SEA TRIAL</span><h2>Prove the infrastructure</h2><p>Runs the same experience against a real project-scoped outpost. Test records are marked and excluded from live intent.</p><ul><li>${esc(trialLabel)}</li><li>Project ID and test record verified</li><li>Proof is bound to current configuration</li></ul><button type="button" data-etd-sea class="secondary">${s.trial?'RUN SEA TRIAL':'PREPARE SEA TRIAL'}</button></article>
        <article class="etd-mode"><span class="num">03 • LIVE</span><h2>Customer operation</h2><p>Opens the actual deployed customer experience. This mode is intentionally unavailable until the vessel is published and has an active outpost.</p><ul><li>Production records are real</li><li>Live deployment identity retained</li><li>No test banner ambiguity</li></ul><button type="button" data-etd-live ${liveReady?'':'disabled'}>${liveReady?'OPEN LIVE EXPERIENCE':'NOT LIVE'}</button></article>
      </div>
      <section class="etd-checks"><h2>Readiness evidence</h2><div class="etd-check-grid">${check('Customer renderer',s.shellReady)}${check('Project isolation',s.boundary,'CHECK')}${check('Preview inspected',seen)}${check('Experience approved',s.currentApproval)}${check('Sea Trial outpost',!!s.trial)}${check('Current Sea Trial proof',s.currentSea)}</div>
      <div class="etd-ready ${s.ready?'pass':''}"><strong>${s.ready?'FLEET READY TEST EVIDENCE':'TEST EVIDENCE INCOMPLETE'}</strong><div>${esc(fleetReadinessFor(p).detail)}</div></div>
      <div class="etd-actions"><button type="button" class="primary" data-etd-approve ${seen&&!s.currentApproval?'':'disabled'}>${s.currentApproval?'EXPERIENCE APPROVED':seen?'APPROVE CURRENT EXPERIENCE':'PREVIEW BEFORE APPROVAL'}</button><button type="button" data-etd-refresh>REFRESH EVIDENCE</button>${!s.shellReady?'<button type="button" data-etd-configure>OPEN PROJECT EXPERIENCE</button>':''}</div><p class="etd-note">Approval and Sea Trial proof are tied to configuration signature <strong>${esc(s.sig)}</strong>. If customer-facing configuration changes, current evidence automatically becomes stale.</p></section>
    </div>`;
  }

  async function approveCurrent(p){
    const s=stateFor(p);if(!previewSeen(p,s)){toast('Open the current Preview before approving it.');return;}
    p.experienceTest=p.experienceTest||{};p.experienceTest.approval={signature:s.sig,approvedAt:now(),approvedBy:'captain',mode:'preview'};
    try{await bridge().saveCompanies();bridge().logActivity?.(p.id,'Customer experience approved',`Configuration ${s.sig}`);toast('Experience approved for the current configuration.');renderDeck(p);await bridge().renderProjectCommand?.();}catch(err){toast(`Approval could not be saved: ${err?.message||err}`);}
  }

  function setMode(mode,p,deployment=null){
    const payload={mode,projectId:p.id,deploymentId:deployment?.id||null,signature:configSignature(p),startedAt:now(),sessionId:`etd-${Date.now().toString(36)}`};
    sessionStorage.setItem(MODE_KEY,JSON.stringify(payload));window.__darkSkyExperienceMode=payload;
    if(mode==='preview') window.__deploymentCustomerContext={projectId:p.id,deploymentId:null,state:'preview',attractTitle:'Private Preview'};
    if(mode==='sea_trial') window.__deploymentCustomerContext={projectId:p.id,deploymentId:deployment?.id||null,state:'sea_trial',attractTitle:deployment?.attractTitle||'Sea Trial'};
    if(mode==='live') window.__deploymentCustomerContext={projectId:p.id,deploymentId:deployment?.id||null,state:'deployed',attractTitle:deployment?.attractTitle||'Live'};
    return payload;
  }
  function mode(){try{return window.__darkSkyExperienceMode||JSON.parse(sessionStorage.getItem(MODE_KEY)||'null');}catch(_){return null;}}
  function clearMode(){sessionStorage.removeItem(MODE_KEY);window.__darkSkyExperienceMode=null;window.__deploymentCustomerContext=null;document.querySelector('.etd-modebar')?.remove();if(seaTrialPoll){clearInterval(seaTrialPoll);seaTrialPoll=null;}}

  function renderModeBar(){
    const m=mode();if(!m)return;document.querySelector('.etd-modebar')?.remove();const bar=document.createElement('div');bar.className='etd-modebar';
    const label=m.mode==='preview'?'PRIVATE PREVIEW':m.mode==='sea_trial'?'SEA TRIAL':'LIVE EXPERIENCE';
    const note=m.mode==='preview'?'Read-only • submissions disabled':m.mode==='sea_trial'?'Test records • project scoped':'Production customer experience';
    bar.innerHTML=`<strong>${label}</strong><span>${note}</span><button type="button" data-etd-return>RETURN TO TEST DECK</button>`;document.body.appendChild(bar);
  }
  function annotatePreviewSubmit(){
    const m=mode();if(m?.mode!=='preview')return;
    ['approveBtn','mugsSubmitOrder','flowersSubmitOrder','universalSubmitOrder'].forEach(id=>{const b=document.getElementById(id);if(b){b.classList.add('etd-preview-blocked');b.title='Private Preview — submission disabled';}});
  }

  async function enterPreview(p){
    const s=stateFor(p);if(!s.shellReady){toast('Configure a customer-ready experience before previewing this vessel.');return;}
    markPreviewSeen(p,s);setMode('preview',p);closeDeck();await bridge().enterProject(p.id);renderModeBar();annotatePreviewSubmit();
  }
  async function enterLive(p){const s=stateFor(p);if(!s.live||p.publish?.status!=='live')return;setMode('live',p,s.live);closeDeck();await bridge().enterProject(p.id);renderModeBar();}

  function openOrdersDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB unavailable'));});}
  async function allOrders(){const db=await openOrdersDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(ORDERS_STORE,'readonly');const r=tx.objectStore(ORDERS_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}finally{db.close();}}
  async function putOrder(row){const db=await openOrdersDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(ORDERS_STORE,'readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.objectStore(ORDERS_STORE).put(row);});}finally{db.close();}}

  async function recordSeaTrialProof(p,session,order){
    if(!order||String(order.projectId||'')!==String(p.id)){toast('Sea Trial record did not prove the expected Project ID. Proof was not granted.');return false;}
    const s=stateFor(p);const d=deploymentsFor(p).find(x=>String(x.id)===String(session.deploymentId));if(!d){toast('Sea Trial outpost could not be resolved. Proof was not granted.');return false;}
    order.testMode=true;order.deploymentId=order.deploymentId||d.id;order.experienceTestDeck={version:VERSION,signature:session.signature,sessionId:session.sessionId,verifiedAt:now()};
    try{await putOrder(order);}catch(err){console.warn('Test record annotation warning',err);}
    d.lastTestedAt=now();d.lastTestOrderId=order.id;d.testMode='experience_test_deck';d.testSignature=session.signature;d.updatedAt=d.lastTestedAt;
    p.experienceTest=p.experienceTest||{};p.experienceTest.seaTrial={signature:session.signature,passedAt:d.lastTestedAt,deploymentId:d.id,orderId:order.id,sessionId:session.sessionId,recordProjectId:order.projectId};
    try{await bridge().saveCompanies();bridge().logActivity?.(p.id,'Experience Test Deck Sea Trial passed',`${d.name||d.id} • ${order.id} • ${session.signature}`);toast('Sea Trial passed. Test record and Project ID verified.');return true;}catch(err){toast(`Sea Trial proof could not be saved: ${err?.message||err}`);return false;}
  }
  async function startSeaTrialPolling(p,session){
    if(seaTrialPoll)clearInterval(seaTrialPoll);const start=Date.parse(session.startedAt)||Date.now();let busy=false;
    seaTrialPoll=setInterval(async()=>{if(busy)return;busy=true;try{const rows=await allOrders();const candidates=rows.filter(o=>String(o.projectId||'')===String(p.id)&&(Date.parse(o.createdAt||0)||0)>=start-1000&&o.id).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));if(candidates.length){clearInterval(seaTrialPoll);seaTrialPoll=null;await recordSeaTrialProof(project(p.id)||p,session,candidates[0]);}}catch(err){console.warn('Sea Trial proof watch warning',err);}finally{busy=false;}},1400);
  }
  async function prepareSeaTrial(p){closeDeck();await bridge().openProjectEngineControl(p.id);await bridge().renderProjectTab(p.id,'deployment');}
  async function enterSeaTrial(p){
    const s=stateFor(p);if(!s.shellReady){toast('Customer experience must be ready before Sea Trial.');return;}
    if(!s.trial){await prepareSeaTrial(p);return;}
    const session=setMode('sea_trial',p,s.trial);closeDeck();await bridge().enterProject(p.id);renderModeBar();await startSeaTrialPolling(p,session);
  }

  async function returnToDeck(){
    const m=mode();if(!m)return;const pid=m.projectId;document.querySelector('.etd-modebar')?.remove();
    try{await bridge().returnExperienceToEngine?.(pid);}catch(err){console.warn('Experience return bridge warning',err);}
    clearMode();setTimeout(()=>openDeck(pid),80);
  }

  function bind(){
    injectStyles();addCardButtons();
    document.addEventListener('click',async e=>{
      const t=e.target.closest?.('[data-test-experience],[data-etd-close],[data-etd-preview],[data-etd-sea],[data-etd-live],[data-etd-approve],[data-etd-refresh],[data-etd-configure],[data-etd-return]');if(!t)return;
      if(t.matches('[data-test-experience]')){e.preventDefault();e.stopImmediatePropagation();openDeck(t.dataset.testExperience);return;}
      const p=project(activeDeckProjectId||mode()?.projectId);if(t.matches('[data-etd-close]')){closeDeck();return;}if(!p&& !t.matches('[data-etd-return]'))return;
      if(t.matches('[data-etd-preview]')){await enterPreview(p);return;}if(t.matches('[data-etd-sea]')){await enterSeaTrial(p);return;}if(t.matches('[data-etd-live]')){await enterLive(p);return;}if(t.matches('[data-etd-approve]')){await approveCurrent(p);return;}if(t.matches('[data-etd-refresh]')){renderDeck(p);return;}if(t.matches('[data-etd-configure]')){closeDeck();await bridge().openProjectEngineControl(p.id);await bridge().renderProjectTab(p.id,'experience');return;}if(t.matches('[data-etd-return]')){await returnToDeck();return;}
    },true);
    document.addEventListener('click',e=>{
      const m=mode();if(m?.mode!=='preview')return;const submit=e.target.closest?.('#approveBtn,#mugsSubmitOrder,#flowersSubmitOrder,#universalSubmitOrder,button[type="submit"]');if(!submit)return;e.preventDefault();e.stopImmediatePropagation();toast('Private Preview is read-only. Run a Sea Trial to test real submission infrastructure.');
    },true);
    const obs=new MutationObserver(()=>{addCardButtons();if(mode())setTimeout(()=>{renderModeBar();annotatePreviewSubmit();},0);});obs.observe(document.documentElement,{childList:true,subtree:true});
  }

  async function waitForBridge(){for(let i=0;i<80;i++){if(bridge())return true;await new Promise(r=>setTimeout(r,50));}return false;}

  window.DarkSkyExperienceTestDeck={version:VERSION,open:openDeck,fleetReadinessFor,configSignature,stateFor};
  waitForBridge().then(ok=>{if(!ok){console.error('Experience Test Deck bridge unavailable. Reload after service worker activation.');return;}bind();bridge().returnExperienceToEngine=async function(projectId){
    window.__deploymentCustomerContext=null;
    try{bridge().hideAllCustomerShells?.();}catch(_){}
    const ret=document.getElementById('returnToEngineBtn');ret?.classList.add('hidden');
    document.body.classList.remove('project-mode','universal-project','mugs-project','flowers-project','ikes-project','boot-locked');document.body.classList.add('engine-mode');
    document.getElementById('blackFlagEntryGate')?.classList.add('hidden');document.getElementById('adminPanel')?.classList.add('hidden');document.getElementById('enginePanel')?.classList.remove('hidden');
    await bridge().renderProjectCommand?.();window.scrollTo({top:document.getElementById('engineProjectsSection')?.offsetTop||0,left:0,behavior:'instant'});
  };
  bridge().renderProjectCommand?.().catch?.(()=>{});
  const restored=mode();if(restored&&document.body.classList.contains('project-mode')){renderModeBar();annotatePreviewSubmit();if(restored.mode==='sea_trial'){const p=project(restored.projectId);if(p)startSeaTrialPolling(p,restored);}}
  });
})();
