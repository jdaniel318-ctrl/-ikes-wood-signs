(() => {
  const DB_NAME = 'ikesWoodSignsV1';
  const DB_VERSION = 1;
  const STORE_ORDERS = 'orders';
  const STORE_SETTINGS = 'settings';
  const LOCAL_ORDERS_KEY = 'ikesWoodSignsOrdersBackupV15';
  const DEFAULT_ADMIN_PIN = '4353';
  const DEFAULT_ENGINE_PIN = '5615';
  const DEFAULT_COMPANIES = [
    {
      id:'ikes-wood-signs',
      name:"Ike's Wood Signs",
      type:'custom_wood_signs',
      visibility:'published',
      projectTheme:'ikes',
      status:'active',
      orderPrefix:'IKE',
      ai:{mode:'off',minConfidence:0.90,requireScaleReference:true},
      customization:{maxCharacters:null,characterLimitStatus:'unset',allowCustomColors:true},
      workflow:['New','In Production','Ready for Pickup','Completed'],
      customerExperience:{photoRequired:true,previewApproval:true},
      publish:{status:'live'},
      payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},
      products:[{id:'custom-wood-sign',name:'Custom Wood Sign',published:true,characterLimit:null}]
    },
    {
      id:'mugshot-after-dark',
      name:'Mugs After Dark',
      tagline:'Custom mugs for the night shift.',
      type:'custom_mugs',
      visibility:'engine_only',
      projectTheme:'mugs-after-dark',
      status:'future',
      orderPrefix:'MUG',
      ai:{mode:'assist',minConfidence:0.92,requireScaleReference:false},
      customization:{maxCharacters:32,softWarningAt:26,characterLimitStatus:'configured',allowCustomColors:true},
      workflow:['New','In Production','Ready for Pickup','Completed'],
      customerExperience:{photoRequired:true,previewApproval:true},
      publish:{status:'development'},
      payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},
      pricing:{status:'tbd'},
      products:[{id:'classic-custom-mug',name:'Classic Custom Mug',published:false,characterLimit:32}]
    }
  ];
  let companies=structuredClone(DEFAULT_COMPANIES);
  let activeProjectId = null;
  let engineActiveProjectId = null;
  const PROJECT_ACTIVITY_KEY='blackFlagProjectActivityV1';
  const PROJECT_LEDGER_KEY='blackFlagProjectLedgersV1';

  function projects(){ return companies; }
  function projectById(id){ return companies.find(p=>p.id===id); }
  function slugifyProjectName(name){
    return String(name||'project').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48) || ('project-'+Date.now());
  }
  function readActivity(){
    try{return JSON.parse(localStorage.getItem(PROJECT_ACTIVITY_KEY)||'[]')}catch(_){return[]}
  }
  function logActivity(projectId, action, detail=''){
    const rows=readActivity();
    rows.unshift({id:'ACT-'+Date.now(),projectId,action,detail,at:new Date().toISOString()});
    localStorage.setItem(PROJECT_ACTIVITY_KEY,JSON.stringify(rows.slice(0,500)));
  }
  function readLedgers(){
    try{return JSON.parse(localStorage.getItem(PROJECT_LEDGER_KEY)||'{}')}catch(_){return{}}
  }
  function writeLedgers(v){localStorage.setItem(PROJECT_LEDGER_KEY,JSON.stringify(v))}
  function projectLedger(projectId){const l=readLedgers();return Array.isArray(l[projectId])?l[projectId]:[]}
  function postOrderToLedger(order){
    const projectId=order.projectId || (order.business?.name==="Ike's Wood Signs"?'ikes-wood-signs':activeProjectId||'ikes-wood-signs');
    const ledgers=readLedgers(); const list=Array.isArray(ledgers[projectId])?ledgers[projectId]:[];
    if(list.some(x=>x.orderId===order.id)) return;
    list.push({
      ledgerId:'LED-'+Date.now(),
      orderId:order.id,
      completedAt:new Date().toISOString(),
      customer:order.customerName||'',
      product:order.wording||'Custom Order',
      revenue:Number(order.price)||0,
      materialCost:Number(order.materialCost)||0,
      otherDirectCost:Number(order.otherDirectCost)||0,
      tax:Number(order.tax)||0,
      inventoryImpact:order.inventoryImpact||'',
      paymentStatus:order.paymentStatus||'Unknown',
      immutable:true
    });
    ledgers[projectId]=list; writeLedgers(ledgers);
    logActivity(projectId,'Ledger posted',order.id);
  }


  const DEFAULT_ENGINE_CONFIG = {
    engineName:'Workshop Engine',
    schemaVersion:2
  };
  let engineConfig={...DEFAULT_ENGINE_CONFIG};
  const DRAFT_KEY='ikesOrderDraftV2';
  const DEFAULT_BUSINESS_CONFIG={businessName:"Ike's Wood Signs",orderPrefix:'IKE',thankYouHeadline:"THANK YOU FOR CHOOSING IKE!",prices:[45,55,65,90,135],orderStatuses:['New','In Production','Ready for Pickup','Completed']};
  let businessConfig={...DEFAULT_BUSINESS_CONFIG};
  // Paste the Web3Forms access key for "Ike's Wood Signs Orders" below before publishing v1.3.
  const WEB3FORMS_ACCESS_KEY = 'c97f16ac-2070-46b8-923c-9d7524031bce';
  const ORDER_EMAIL = 'ikeswoodsigns.orders@yahoo.com';
  const screenOrder = ['welcome','price','photo','orientation','wording','font','fill','preview','customer','review','done'];

  const state = {
    current: 'welcome',
    price: 65,
    photoData: '',
    orientation: 'Horizontal',
    topSide: 'Top of photo',
    wording: 'Smoke Hole',
    font: 'B',
    fill: 'Black',
    contactPreference: 'Text',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    currentOrderId: '',
    currentOrder: null,
    approvedPreviewData: '',
    customColor: '#1f6feb',
    allowCustomColors: true,
    customerConfirmationEmail: false
  };

  let db;
  let cameraStream = null;

  // Engine security is intentionally session-only. Leaving Black Flag locks it again.
  let engineSessionUnlocked = false;
  function lockEngineSession(){
    engineSessionUnlocked = false;
    document.body.classList.remove('engine-mode');
    const engineScreen = $('enginePanel');
    if(engineScreen) engineScreen.classList.add('hidden');
  }

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const d=req.result;
        if(!d.objectStoreNames.contains(STORE_ORDERS)){
          const s=d.createObjectStore(STORE_ORDERS,{keyPath:'id'});
          s.createIndex('createdAt','createdAt');
          s.createIndex('status','status');
        }
        if(!d.objectStoreNames.contains(STORE_SETTINGS)) d.createObjectStore(STORE_SETTINGS,{keyPath:'key'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  function tx(store,mode='readonly'){ return db.transaction(store,mode).objectStore(store); }
  function reqToPromise(req){ return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); }

  function readLocalOrders(){
    try{
      const raw=localStorage.getItem(LOCAL_ORDERS_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed:[];
    }catch(err){
      console.warn('Local order backup could not be read',err);
      return [];
    }
  }

  function writeLocalOrders(orders){
    try{
      localStorage.setItem(LOCAL_ORDERS_KEY,JSON.stringify(orders));
      return true;
    }catch(err){
      console.warn('Local order backup could not be written',err);
      return false;
    }
  }

  function backupOrderLocally(order){
    const orders=readLocalOrders();
    const i=orders.findIndex(o=>o.id===order.id);
    if(i>=0) orders[i]=order;
    else orders.push(order);
    return writeLocalOrders(orders);
  }

  async function getMergedOrders(){
    let indexed=[];
    try{ indexed=await getAll(STORE_ORDERS); }catch(err){ console.warn('IndexedDB orders unavailable',err); }
    const local=readLocalOrders();
    const map=new Map();
    [...local,...indexed].forEach(o=>{ if(o && o.id) map.set(o.id,o); });
    return [...map.values()];
  }
  async function put(store,value){
    const result=await reqToPromise(tx(store,'readwrite').put(value));
    if(store===STORE_ORDERS) backupOrderLocally(value);
    return result;
  }
  async function getAll(store){ return reqToPromise(tx(store).getAll()); }
  async function getSetting(key){ return reqToPromise(tx(STORE_SETTINGS).get(key)); }
  async function setSetting(key,value){
    try{ return await put(STORE_SETTINGS,{key,value}); }
    catch(err){ console.warn('Setting could not be saved',key,err); throw err; }
  }

  async function getAdminPin(){
    try{
      const saved=await getSetting('adminPin');
      return saved?.value || DEFAULT_ADMIN_PIN;
    }catch(err){
      console.warn('Admin PIN setting unavailable; using default',err);
      return DEFAULT_ADMIN_PIN;
    }
  }

  async function getEnginePin(){
    try{
      const saved=await getSetting('enginePin');
      return saved?.value || DEFAULT_ENGINE_PIN;
    }catch(err){
      console.warn('Engine PIN setting unavailable; using default',err);
      return DEFAULT_ENGINE_PIN;
    }
  }

  // Black Flag portal bridge. 5615 is the guaranteed recovery/default PIN for this test build.
  // This bridge keeps the portal and engine session using the SAME authentication state.
  window.BlackFlagAuth = {
    async expectedPin(){
      try{
        const configured=await getEnginePin();
        return String(configured || DEFAULT_ENGINE_PIN);
      }catch(_){
        return DEFAULT_ENGINE_PIN;
      }
    },
    unlock(){
      engineSessionUnlocked=true;
      return true;
    },
    lock(){
      lockEngineSession();
      return true;
    },
    isUnlocked(){
      return engineSessionUnlocked===true;
    },
    recoveryPin: DEFAULT_ENGINE_PIN
  };

  async function loadCompanies(){
    try{
      const saved=await getSetting('companies');
      companies=Array.isArray(saved?.value)&&saved.value.length?saved.value:structuredClone(DEFAULT_COMPANIES);
    }catch(_){companies=structuredClone(DEFAULT_COMPANIES);}
    // Non-destructive project identity migration: keep project-specific settings,
    // but move the mug project away from the inherited Ike visual identity.
    const mugs=companies.find(c=>c.id==='mugshot-after-dark');
    if(mugs){
      mugs.name='Mugs After Dark';
      mugs.tagline='Custom mugs for the night shift.';
      mugs.projectTheme='mugs-after-dark';
      mugs.type='custom_mugs';
      mugs.orderPrefix=mugs.orderPrefix||'MUG';
    }
  }
  async function saveCompanies(){await setSetting('companies',companies);}
  function companyById(id){return companies.find(c=>c.id===id);}
  function companyStatusLabel(c){
    return c.publish?.status==='live'?'LIVE':(c.publish?.status==='test'?'TEST':'DEVELOPMENT');
  }

  async function projectStats(p){
    const orders=await getMergedOrders();
    const rows=orders.filter(o=>{
      const pid=o.projectId || ((o.business?.name||"Ike's Wood Signs")==="Ike's Wood Signs"?'ikes-wood-signs':'');
      return pid===p.id;
    });
    const month=new Date().toISOString().slice(0,7);
    const monthRows=rows.filter(o=>(o.createdAt||'').slice(0,7)===month);
    const ledger=projectLedger(p.id);
    return {
      orders:rows.length,
      ordersMonth:monthRows.length,
      revenueMonth:monthRows.reduce((s,o)=>s+(Number(o.price)||0),0),
      completed:ledger.length,
      ledgerRevenue:ledger.reduce((s,x)=>s+(Number(x.revenue)||0),0)
    };
  }
  async function renderProjectCommand(){
    const box=$('projectCommandCards');if(!box)return;
    const list=projects();
    const live=list.filter(p=>p.publish?.status==='live').length;
    $('projectSummaryBadge').textContent=`${list.length} PROJECTS • ${live} PUBLISHED • ${list.length-live} PRIVATE/TEST`;
    const cards=[];
    for(const p of list){
      const s=await projectStats(p);
      cards.push(`<article class="project-card">
        <div class="project-card-head">
          <span class="project-mark">${escapeHtml((p.name||'?').slice(0,1).toUpperCase())}</span>
          <label class="project-publish-toggle"><input type="checkbox" data-project-publish="${escapeHtml(p.id)}" ${p.publish?.status==='live'?'checked':''}><span>${p.publish?.status==='live'?'PUBLISHED':'PRIVATE'}</span></label>
        </div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.tagline||p.type.replaceAll('_',' '))}</p>
        <div class="project-kpis"><span><strong>${s.orders}</strong> orders</span><span><strong>$${s.revenueMonth.toFixed(0)}</strong> month</span><span><strong>${s.completed}</strong> ledger</span></div>
        <div class="project-card-actions">
          <button data-open-project-control="${escapeHtml(p.id)}" class="secondary-btn small">CONTROL CENTER</button>
          <button data-enter-project="${escapeHtml(p.id)}" class="primary-btn small" ${p.publish?.status==='live'||p.publish?.status==='test'?'':'disabled'}>OPEN PROJECT</button>
        </div>
      </article>`);
    }
    cards.push(`<button id="addProjectCard" class="project-card add-project-card"><div class="add-project-plus">＋</div><h4>Add Project</h4><p>Create another private business/project on Black Flag.</p></button>`);
    box.innerHTML=cards.join('');
    box.querySelectorAll('[data-open-project-control]').forEach(b=>b.addEventListener('click',()=>openProjectEngineControl(b.dataset.openProjectControl)));
    box.querySelectorAll('[data-enter-project]').forEach(b=>b.addEventListener('click',()=>enterProject(b.dataset.enterProject)));
    box.querySelectorAll('[data-project-publish]').forEach(t=>t.addEventListener('change',async()=>{
      const p=projectById(t.dataset.projectPublish);if(!p)return;
      const next=t.checked?'live':'development';
      if(t.checked && !confirm(`Publish ${p.name}? Customers may be able to access this project.`)){t.checked=false;return;}
      p.publish={status:next};p.visibility=t.checked?'published':'engine_only';await saveCompanies();logActivity(p.id,t.checked?'Project published':'Project unpublished');await renderProjectCommand();
    }));
    const add=$('addProjectCard');if(add)add.addEventListener('click',openAddProject);
  }

  function projectTabsHtml(p,tab){
    const products=p.products||[];
    if(tab==='overview') return `<div class="pec-grid">
      <article class="pec-card"><h4>Project Status</h4><p><strong>${escapeHtml(p.publish?.status||'development')}</strong></p><p>Theme: ${escapeHtml(p.projectTheme||'custom')}</p><p>Order prefix: ${escapeHtml(p.orderPrefix||'PRJ')}</p></article>
      <article class="pec-card"><h4>Character Limit</h4><p>${p.customization?.maxCharacters?`${p.customization.maxCharacters} characters`:'Not set'}</p><p class="helper">${p.id==='ikes-wood-signs'?'Intentionally unset until Ike’s real rule is confirmed.':'Project rule.'}</p></article>
      <article class="pec-card"><h4>Activity</h4><div>${readActivity().filter(x=>x.projectId===p.id).slice(0,6).map(x=>`<div class="activity-line"><span>${escapeHtml(x.action)}</span><small>${new Date(x.at).toLocaleString()}</small></div>`).join('')||'<p class="helper">No activity yet.</p>'}</div></article>
    </div>`;
    if(tab==='products') return `<div class="pec-card"><div class="pec-title-row"><h4>Products</h4><button id="addProductBtn" class="secondary-btn small">ADD PRODUCT</button></div>
      <div class="product-list">${products.map(pr=>`<div class="product-row"><div><strong>${escapeHtml(pr.name)}</strong><small>${pr.characterLimit?`${pr.characterLimit} char max`:'Character limit unset'}</small></div><label><input data-product-publish="${escapeHtml(pr.id)}" type="checkbox" ${pr.published?'checked':''}> Published</label></div>`).join('')}</div></div>`;
    if(tab==='experience') return `<div class="pec-card"><h4>Customer Experience</h4>
      <label class="admin-toggle-row compact-toggle"><span><strong>Photo step</strong><small>Require product photo.</small></span><input id="ptPhoto" type="checkbox" ${p.customerExperience?.photoRequired!==false?'checked':''}></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Preview approval</strong><small>Require customer approval.</small></span><input id="ptPreview" type="checkbox" ${p.customerExperience?.previewApproval!==false?'checked':''}></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Custom colors</strong><small>Allow custom color picker.</small></span><input id="ptColors" type="checkbox" ${p.customization?.allowCustomColors!==false?'checked':''}></label>
      <button id="saveExperienceTab" class="primary-btn small">SAVE EXPERIENCE</button></div>`;
    if(tab==='ai') return `<div class="pec-card"><h4>AI Product Recognition</h4><p class="helper">Recognition suggests structured attributes. Project pricing rules remain authoritative.</p>
      <label>Mode<select id="ptAI"><option value="off">Off</option><option value="assist">Assist</option><option value="automatic">Automatic</option></select></label>
      <label>Minimum confidence<input id="ptConfidence" class="text-input" type="number" min=".5" max=".99" step=".01" value="${Number(p.ai?.minConfidence||.9).toFixed(2)}"></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Require scale reference</strong><small>Recommended for physical measurements.</small></span><input id="ptScale" type="checkbox" ${p.ai?.requireScaleReference!==false?'checked':''}></label>
      <button id="saveAITab" class="primary-btn small">SAVE AI POLICY</button></div>`;
    if(tab==='workflow') return `<div class="pec-card"><h4>Workflow</h4><p class="helper">One stage per line.</p><textarea id="ptWorkflow" rows="7">${escapeHtml((p.workflow||DEFAULT_BUSINESS_CONFIG.orderStatuses).join('\n'))}</textarea><button id="saveWorkflowTab" class="primary-btn small">SAVE WORKFLOW</button></div>`;
    if(tab==='publishing') return `<div class="pec-card"><h4>Publishing</h4><label>Project status<select id="ptPublish"><option value="development">Development — engine only</option><option value="test">Test</option><option value="live">Published / Live</option><option value="paused">Paused</option></select></label><p class="helper">Product-level publish controls are in Products.</p><button id="savePublishingTab" class="primary-btn small">SAVE PUBLISHING</button></div>`;
    if(tab==='orders') return `<div class="pec-card"><h4>Project Orders</h4><div id="ptOrders">Loading…</div></div>`;
    if(tab==='ledger') {
      const ledger=projectLedger(p.id);
      const rev=ledger.reduce((s,x)=>s+(Number(x.revenue)||0),0), cost=ledger.reduce((s,x)=>s+(Number(x.materialCost)||0)+(Number(x.otherDirectCost)||0),0);
      return `<div class="ledger-summary"><div><span>Completed</span><strong>${ledger.length}</strong></div><div><span>Revenue</span><strong>$${rev.toFixed(2)}</strong></div><div><span>Direct Costs</span><strong>$${cost.toFixed(2)}</strong></div><div><span>Est. Gross Profit</span><strong>$${(rev-cost).toFixed(2)}</strong></div></div>
      <div class="pec-card"><h4>Completed Order Ledger</h4><p class="helper">Core financial history lives in Black Flag. Project views may be read-only in the future.</p>${ledger.length?ledger.slice().reverse().map(x=>`<div class="ledger-row"><strong>${escapeHtml(x.orderId)}</strong><span>${new Date(x.completedAt).toLocaleDateString()}</span><span>$${Number(x.revenue).toFixed(2)}</span><span>${escapeHtml(x.paymentStatus)}</span></div>`).join(''):'<p class="helper">No completed orders posted yet.</p>'}</div>`;
    }
    if(tab==='payments'){
      const pay=p.payments||{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false};
      return `<div class="pec-grid">
        <article class="pec-card payment-structure-card">
          <h4>Pay by App</h4>
          <p class="helper">Engine-only structure for now. Nothing is exposed to customers yet.</p>
          <label class="admin-toggle-row compact-toggle"><span><strong>Enable payment capability</strong><small>Controlled only through Black Flag.</small></span><input id="ptPaymentsEnabled" type="checkbox" ${pay.enabled?'checked':''}></label>
          <label>Payment mode<select id="ptPaymentMode"><option value="payment_link">Hosted payment link</option><option value="integrated_checkout">Integrated checkout — future</option><option value="manual">Manual / record only</option></select></label>
          <label>Provider<select id="ptPaymentProvider"><option value="not_configured">Not configured</option><option value="square">Square — future setup</option><option value="stripe">Stripe — future setup</option><option value="paypal">PayPal — future setup</option></select></label>
          <div class="payment-safety-note">Customer checkout stays OFF until a secure provider integration is deliberately completed later.</div>
          <button id="savePaymentsTab" class="primary-btn small">SAVE PAYMENT STRUCTURE</button>
        </article>
        <article class="pec-card">
          <h4>Payment Tracking Foundation</h4>
          <div class="payment-foundation"><span>Customer checkout</span><strong>Not exposed</strong></div>
          <div class="payment-foundation"><span>Ledger payment status</span><strong>Ready</strong></div>
          <div class="payment-foundation"><span>Provider</span><strong>${escapeHtml(pay.provider||'not_configured').replaceAll('_',' ')}</strong></div>
        </article>
      </div>`;
    }
    return '';
  }

  async function renderProjectTab(id,tab){
    const p=projectById(id), box=$('projectTabContent');if(!p||!box)return;
    box.innerHTML=projectTabsHtml(p,tab);
    $$('#projectTabs [data-project-tab]').forEach(b=>b.classList.toggle('active',b.dataset.projectTab===tab));
    if(tab==='ai'){ $('ptAI').value=p.ai?.mode||'off'; $('saveAITab').onclick=async()=>{p.ai={mode:$('ptAI').value,minConfidence:Number($('ptConfidence').value)||.9,requireScaleReference:$('ptScale').checked};await saveCompanies();logActivity(p.id,'AI policy changed',p.ai.mode);};}
    if(tab==='experience') $('saveExperienceTab').onclick=async()=>{p.customerExperience={photoRequired:$('ptPhoto').checked,previewApproval:$('ptPreview').checked};p.customization=p.customization||{};p.customization.allowCustomColors=$('ptColors').checked;await saveCompanies();logActivity(p.id,'Customer experience updated');};
    if(tab==='workflow') $('saveWorkflowTab').onclick=async()=>{const rows=$('ptWorkflow').value.split('\n').map(x=>x.trim()).filter(Boolean);if(rows.length>=2){p.workflow=rows;await saveCompanies();logActivity(p.id,'Workflow updated',rows.join(' → '));}};
    if(tab==='publishing'){ $('ptPublish').value=p.publish?.status||'development'; $('savePublishingTab').onclick=async()=>{const next=$('ptPublish').value;if(next==='live'&&!confirm(`Publish ${p.name}?`))return;p.publish={status:next};p.visibility=next==='live'?'published':'engine_only';await saveCompanies();logActivity(p.id,'Publishing changed',next);await renderProjectCommand();};}
    if(tab==='products'){
      $$('[data-product-publish]').forEach(t=>t.onchange=async()=>{const pr=(p.products||[]).find(x=>x.id===t.dataset.productPublish);if(!pr)return;if(t.checked&&!confirm(`Publish product "${pr.name}"?`)){t.checked=false;return;}pr.published=t.checked;await saveCompanies();logActivity(p.id,t.checked?'Product published':'Product unpublished',pr.name);});
      if($('addProductBtn')) $('addProductBtn').onclick=async()=>{const name=prompt('Product name');if(!name)return;p.products=p.products||[];p.products.push({id:slugifyProjectName(name)+'-'+Date.now().toString().slice(-4),name,published:false,characterLimit:null});await saveCompanies();logActivity(p.id,'Product added',name);renderProjectTab(p.id,'products');};
    }
    if(tab==='payments'){
      const pay=p.payments||{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false};
      $('ptPaymentMode').value=pay.mode||'payment_link';
      $('ptPaymentProvider').value=pay.provider||'not_configured';
      $('savePaymentsTab').onclick=async()=>{
        p.payments={enabled:$('ptPaymentsEnabled').checked,mode:$('ptPaymentMode').value,provider:$('ptPaymentProvider').value,customerVisible:false};
        await saveCompanies();
        logActivity(p.id,'Payment structure updated',`${p.payments.enabled?'enabled':'disabled'} • ${p.payments.provider}`);
      };
    }
    if(tab==='orders'){
      const orders=await getMergedOrders();const rows=orders.filter(o=>(o.projectId||'ikes-wood-signs')===p.id);
      $('ptOrders').innerHTML=rows.length?rows.slice().reverse().map(o=>`<div class="ledger-row"><strong>${escapeHtml(o.id)}</strong><span>${escapeHtml(o.status)}</span><span>$${Number(o.price||0).toFixed(2)}</span><span>${escapeHtml(o.customerName||'')}</span></div>`).join(''):'<p class="helper">No orders for this project yet.</p>';
    }
  }

  async function openProjectEngineControl(id){
    const p=projectById(id);if(!p)return;
    engineActiveProjectId=id;
    $('pecTitle').textContent=p.name;
    $('pecSubtitle').textContent='Project-specific controls. Black Flag remains unlocked only while you stay in the Engine.';
    $('projectEngineControl').classList.remove('hidden');
    await renderProjectTab(id,'overview');
    window.scrollTo({top:$('projectEngineControl').offsetTop-20,behavior:'smooth'});
  }

  function enterProject(id){
    const p=projectById(id);if(!p)return;
    if(!['live','test'].includes(p.publish?.status||'development')) return;
    activeProjectId=id;
    logActivity(id,'Project opened');
    // HARD SECURITY RULE: entering a project always destroys Black Flag authorization.
    engineSessionUnlocked=false;
    document.body.classList.remove('boot-locked','engine-mode');
    $('enginePanel')?.classList.add('hidden');
    $('blackFlagEntryGate')?.classList.add('hidden');
    document.body.classList.add('project-mode');
    $('returnToEngineBtn')?.classList.remove('hidden');
    $('customerApp')?.classList.remove('hidden');
    $('adminPanel')?.classList.add('hidden');
    applyProjectTheme(p);
    if(typeof setScreen==='function')setScreen('welcome');
  }

  function setProjectText(selector,text){
    const el=document.querySelector(selector);
    if(el) el.textContent=text;
  }
  function setProjectButton(selector,text){
    const el=document.querySelector(selector);
    if(el) el.textContent=text;
  }
  function applyIkeCustomerCopy(){
    setProjectText('.welcome-wordmark',"Ike's Wood Signs");
    setProjectText('.welcome-subtitle','Self-Serve Sign Ordering');
    setProjectText('.welcome-copy p',"Pick the piece of wood you love. Ike will guide you through the rest.");
    setProjectText('.start-band',"Let's get started!");
    setProjectButton('.hero-start','START YOUR SIGN →');
    setProjectText('[data-screen="price"] h2','How long is the wood you picked?');
    setProjectText('[data-screen="price"] p.helper',"For now, choose the price posted with that length of wood in the trailer. Ike's current price groups are shown below.");
    setProjectText('[data-screen="photo"] h2','Take a Picture of Your Wood');
    setProjectText('[data-screen="photo"] > p','Place the entire blank in view. The picture stays with Ike’s order and becomes the background for your preview.');
    setProjectText('[data-screen="orientation"] h2','How should your sign face?');
    setProjectText('[data-screen="wording"] h2','What should your sign say?');
    setProjectText('[data-screen="font"] h2','Choose Your Letter Style');
    setProjectText('[data-screen="fill"] h2','Choose Your Letter Finish');
    setProjectText('[data-screen="fill"] p.helper','Choose painted lettering, a realistic CNC-carved look, or create your own custom color.');
    setProjectText('[data-screen="customer"] h2','Your Contact Information');
    setProjectText('[data-screen="customer"] > p','Ike will use this information to let you know when your sign is ready for pickup.');
    setProjectText('[data-screen="review"] h2','Review Before You Order');
    const actions=document.querySelectorAll('.brand-action');
    const labels=[['Design Your Sign','Type it exactly how you want it.'],['Use Your Plank','Photograph the exact wood you picked.'],['Preview & Approve','See your sign before you order.']];
    actions.forEach((a,i)=>{if(labels[i]){const strong=a.querySelector('strong'),small=a.querySelector('small');if(strong)strong.textContent=labels[i][0];if(small)small.textContent=labels[i][1];}});
    const natural=document.querySelector('[data-fill="Natural"]');if(natural)natural.classList.remove('project-hidden-choice');
  }
  function applyMugsAfterDarkCustomerCopy(){
    setProjectText('.welcome-wordmark','Mugs After Dark');
    setProjectText('.welcome-subtitle','Late-Night Custom Mug Studio');
    setProjectText('.welcome-copy p','Build a mug with a little more personality after sunset.');
    setProjectText('.start-band','Make something worth staying up for.');
    setProjectButton('.hero-start','START YOUR MUG →');
    setProjectText('[data-screen="price"] h2','Choose your mug option');
    setProjectText('[data-screen="price"] p.helper','Select the posted mug option for this test build. Mug-specific products and pricing will live only in this project.');
    setProjectText('[data-screen="photo"] h2','Add Your Inspiration');
    setProjectText('[data-screen="photo"] > p','Photograph artwork, handwriting, a reference, or something you want us to work from.');
    setProjectText('[data-screen="orientation"] h2','How should the design sit on the mug?');
    setProjectButton('[data-orientation="Horizontal"]','↔ WRAP / WIDE');
    setProjectButton('[data-orientation="Vertical"]','↕ FRONT / STACKED');
    setProjectText('[data-screen="wording"] h2','What should your mug say?');
    setProjectText('[data-screen="font"] h2','Choose Your Mug Letter Style');
    setProjectText('[data-screen="fill"] h2','Choose Your Design Color');
    setProjectText('[data-screen="fill"] p.helper','Choose a clean print color or create your own custom color.');
    setProjectText('[data-screen="customer"] h2','Where should we send the mug update?');
    setProjectText('[data-screen="customer"] > p','We will use this information to let you know when your mug is ready.');
    setProjectText('[data-screen="review"] h2','Review Your Mug Before Ordering');
    const actions=document.querySelectorAll('.brand-action');
    const labels=[['Choose Your Mug','Start with the mug you want to make yours.'],['Make It Yours','Add words, style, color and inspiration.'],['Preview the Pour','Review the design before you approve it.']];
    actions.forEach((a,i)=>{if(labels[i]){const strong=a.querySelector('strong'),small=a.querySelector('small');if(strong)strong.textContent=labels[i][0];if(small)small.textContent=labels[i][1];}});
    const natural=document.querySelector('[data-fill="Natural"]');if(natural)natural.classList.add('project-hidden-choice');
  }
  function applyProjectTheme(p){
    document.body.dataset.projectTheme=p.projectTheme||'custom';
    document.body.dataset.activeProject=p.id||'';
    if(p.id==='ikes-wood-signs'){
      document.title="Ike's Wood Signs";
      document.querySelectorAll('.brand-title').forEach(el=>el.textContent="IKE'S WOOD SIGNS");
      document.querySelectorAll('.brand-subtitle').forEach(el=>el.textContent="Self-Serve Sign Ordering");
      document.querySelectorAll('.brand-kicker').forEach(el=>el.textContent="Pick your wood • Design • Preview • Order");
      applyIkeCustomerCopy();
    }else if(p.id==='mugshot-after-dark'){
      document.title='Mugs After Dark';
      document.querySelectorAll('.brand-title').forEach(el=>el.textContent='MUGS AFTER DARK');
      document.querySelectorAll('.brand-subtitle').forEach(el=>el.textContent='Late-Night Custom Mug Studio');
      document.querySelectorAll('.brand-kicker').forEach(el=>el.textContent='Choose • Personalize • Preview • Order');
      applyMugsAfterDarkCustomerCopy();
    }else{
      document.title=p.name;
      document.querySelectorAll('.brand-title').forEach(el=>el.textContent=p.name.toUpperCase());
      document.querySelectorAll('.brand-subtitle').forEach(el=>el.textContent=p.tagline||'Custom Ordering');
      document.querySelectorAll('.brand-kicker').forEach(el=>el.textContent='Customize • Preview • Approve • Order');
    }
    if($('adminBtn')){
      $('adminBtn').textContent='SETTINGS';
      $('adminBtn').setAttribute('aria-label','Open project settings');
      $('adminBtn').setAttribute('title','Project settings — PIN required');
    }
    updateUi();
  }

  function requestEngineFromProject(){
    engineSessionUnlocked=false;
    document.body.classList.remove('project-mode','engine-mode');
    document.body.classList.add('boot-locked');
    $('returnToEngineBtn')?.classList.add('hidden');
    $('customerApp')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');
    if(typeof requireEngineEntry==='function') requireEngineEntry();
    else $('blackFlagEntryGate')?.classList.remove('hidden');
  }

  function openAddProject(){
    $('newProjectName').value='';$('newProjectPrefix').value='';$('addProjectError').textContent='';
    $('addProjectGate').classList.remove('hidden');
  }

  async function createProject(){
    const name=$('newProjectName').value.trim(), type=$('newProjectType').value;
    const prefix=($('newProjectPrefix').value||name.slice(0,3)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);
    if(!name){$('addProjectError').textContent='Enter a project name.';return;}
    const id=slugifyProjectName(name);
    if(projectById(id)){$('addProjectError').textContent='A project with that name already exists.';return;}
    companies.push({id,name,type,tagline:'',visibility:'engine_only',status:'future',projectTheme:id,orderPrefix:prefix||'PRJ',ai:{mode:'off',minConfidence:.9,requireScaleReference:true},customization:{maxCharacters:null,characterLimitStatus:'unset',allowCustomColors:true},customerExperience:{photoRequired:true,previewApproval:true},workflow:['New','In Production','Ready for Pickup','Completed'],publish:{status:'development'},payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},products:[]});
    await saveCompanies();logActivity(id,'Project created');$('addProjectGate').classList.add('hidden');await renderProjectCommand();
  }

  function renderCompanyCommand(){
    const box=$('companyCommandCards'); if(!box)return;
    const live=companies.filter(c=>c.publish?.status==='live').length;
    const dev=companies.length-live;
    if($('companySummaryBadge')) $('companySummaryBadge').textContent=`${companies.length} COMPANIES • ${live} LIVE • ${dev} DEVELOPMENT`;
    box.innerHTML=companies.map(c=>`
      <button class="company-command-card" data-company-open="${escapeHtml(c.id)}">
        <div class="company-command-top">
          <span class="company-monogram">${c.id==='ikes-wood-signs'?'I':'M'}</span>
          <span class="company-live-state ${companyStatusLabel(c).toLowerCase()}">${companyStatusLabel(c)}</span>
        </div>
        <h4>${escapeHtml(c.name)}</h4>
        <p>${escapeHtml(c.tagline || (c.id==='ikes-wood-signs'?'Current production company':'Future company profile'))}</p>
        <div class="company-command-meta">
          <span>AI: ${escapeHtml(c.ai?.mode||'off')}</span>
          <span>${c.customization?.maxCharacters?`${c.customization.maxCharacters} char max`:'Character limit: not set'}</span>
        </div>
        <strong class="open-control">OPEN CONTROL CENTER →</strong>
      </button>`).join('');
    box.querySelectorAll('[data-company-open]').forEach(btn=>btn.addEventListener('click',()=>openCompanyControl(btn.dataset.companyOpen)));
  }
  function openCompanyControl(id){
    const c=companyById(id), panel=$('companyControlCenter'); if(!c||!panel)return;
    panel.classList.remove('hidden');
    const charValue=c.customization?.maxCharacters ?? '';
    panel.innerHTML=`
      <div class="control-center-head">
        <div><div class="engine-kicker">COMPANY CONTROL CENTER</div><h3>${escapeHtml(c.name)}</h3><p>Changes here apply to this company only.</p></div>
        <button class="secondary-btn small" id="closeCompanyControl">CLOSE</button>
      </div>
      <div class="company-control-grid">
        <article class="control-module">
          <h4>Customer Experience</h4>
          <label class="admin-toggle-row compact-toggle"><span><strong>Photo step</strong><small>Require a product photo in the order flow.</small></span><input id="ccPhoto" type="checkbox" ${c.customerExperience?.photoRequired!==false?'checked':''}></label>
          <label class="admin-toggle-row compact-toggle"><span><strong>Preview approval</strong><small>Customer approves the visual before submitting.</small></span><input id="ccPreview" type="checkbox" ${c.customerExperience?.previewApproval!==false?'checked':''}></label>
          <label class="admin-toggle-row compact-toggle"><span><strong>Custom colors</strong><small>Allow customer-selected custom lettering colors.</small></span><input id="ccColors" type="checkbox" ${c.customization?.allowCustomColors!==false?'checked':''}></label>
        </article>
        <article class="control-module">
          <h4>AI Recognition</h4>
          <label>Mode<select id="ccAI"><option value="off">Off</option><option value="assist">Assist</option><option value="automatic">Automatic</option></select></label>
          <label>Minimum confidence<input id="ccConfidence" class="text-input" type="number" min=".5" max=".99" step=".01" value="${Number(c.ai?.minConfidence||.9).toFixed(2)}"></label>
          <label class="admin-toggle-row compact-toggle"><span><strong>Scale reference</strong><small>Require a known reference before measurement-based decisions.</small></span><input id="ccScale" type="checkbox" ${c.ai?.requireScaleReference!==false?'checked':''}></label>
        </article>
        <article class="control-module">
          <h4>Lettering Rules</h4>
          <label>Maximum characters<input id="ccChars" class="text-input" type="number" min="1" max="250" value="${charValue}" placeholder="Not set"></label>
          <p class="helper">${c.id==='ikes-wood-signs'?'Ike’s limit is intentionally NOT SET until the actual business rule is confirmed.':'Current test limit is 32 characters.'}</p>
        </article>
        <article class="control-module">
          <h4>Publishing</h4>
          <label>Status<select id="ccPublish"><option value="development">Development — engine only</option><option value="test">Test</option><option value="live">Live</option></select></label>
          <p class="helper">Development companies remain hidden from customer-facing ordering.</p>
        </article>
      </div>
      <button id="saveCompanyControl" class="primary-btn">SAVE ${escapeHtml(c.name.toUpperCase())} SETTINGS</button>
      <p id="companyControlStatus" class="helper"></p>`;
    $('ccAI').value=c.ai?.mode||'off';
    $('ccPublish').value=c.publish?.status||'development';
    $('closeCompanyControl').addEventListener('click',()=>panel.classList.add('hidden'));
    $('saveCompanyControl').addEventListener('click',async()=>{
      c.customerExperience={photoRequired:$('ccPhoto').checked,previewApproval:$('ccPreview').checked};
      c.customization=c.customization||{};
      c.customization.allowCustomColors=$('ccColors').checked;
      const chars=$('ccChars').value.trim();
      c.customization.maxCharacters=chars?Number(chars):null;
      c.customization.characterLimitStatus=chars?'configured':'unset';
      c.ai={mode:$('ccAI').value,minConfidence:Number($('ccConfidence').value)||.9,requireScaleReference:$('ccScale').checked};
      c.publish={status:$('ccPublish').value};
      await saveCompanies();
      renderCompanyCommand();renderCompanyFleet();await renderFleetStats();
      $('companyControlStatus').textContent='Company settings saved.';
    });
  }

  function renderCompanyFleet(){
    const box=$('companyFleet'); if(!box)return;
    box.innerHTML=companies.map(c=>`
      <article class="company-card ${c.visibility==='engine_only'?'future-company':''}">
        <div class="company-card-top">
          <div><span class="company-status">${escapeHtml(c.status)}</span><h4>${escapeHtml(c.name)}</h4>${c.tagline?`<p>${escapeHtml(c.tagline)}</p>`:''}</div>
          <span class="visibility-pill">${c.visibility==='engine_only'?'ENGINE ONLY':'PUBLISHED'}</span>
        </div>
        <div class="company-meta">
          <span>${escapeHtml(c.type.replaceAll('_',' '))}</span>
          <span>AI: ${escapeHtml(c.ai?.mode||'off')}</span>
          ${c.customization?.maxCharacters?`<span>Character limit: ${c.customization.maxCharacters}</span>`:''}
          ${c.pricing?.status==='tbd'?'<span>Pricing: TBD</span>':''}
        </div>
      </article>`).join('');
    const ai=$('aiCompanySetting');
    if(ai){
      const current=ai.value;
      ai.innerHTML=companies.map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
      if(current&&companyById(current)) ai.value=current;
      loadAIForm();
    }
  }
  function loadAIForm(){
    const id=$('aiCompanySetting')?.value||companies[0]?.id, c=companyById(id);if(!c)return;
    $('aiRecognitionMode').value=c.ai?.mode||'off';
    $('aiConfidenceSetting').value=Number(c.ai?.minConfidence||0.90).toFixed(2);
    $('aiScaleReferenceSetting').checked=c.ai?.requireScaleReference!==false;
  }
  async function saveAIForm(){
    const c=companyById($('aiCompanySetting').value);if(!c)return;
    c.ai={mode:$('aiRecognitionMode').value,minConfidence:Math.max(.5,Math.min(.99,Number($('aiConfidenceSetting').value)||.9)),requireScaleReference:$('aiScaleReferenceSetting').checked};
    await saveCompanies();renderCompanyFleet();$('aiSettingsStatus').textContent='AI recognition policy saved for '+c.name+'.';
  }
  async function renderFleetStats(){
    const box=$('fleetStats');if(!box)return;
    const orders=await getMergedOrders();
    const stats=companies.map(c=>{
      const matched=orders.filter(o=>{
        const n=(o.business?.name||"Ike's Wood Signs").toLowerCase();
        return n===c.name.toLowerCase() || (c.id==='ikes-wood-signs' && !o.business?.name);
      });
      const completed=matched.filter(o=>o.status==='Completed').length;
      const revenue=matched.reduce((s,o)=>s+(Number(o.price)||0),0);
      return {c,count:matched.length,completed,revenue};
    });
    box.innerHTML=stats.map(({c,count,completed,revenue})=>`<article class="stat-company"><h4>${escapeHtml(c.name)}</h4><div class="stat-row"><span>Orders</span><strong>${count}</strong></div><div class="stat-row"><span>Completed</span><strong>${completed}</strong></div><div class="stat-row"><span>Recorded value</span><strong>$${revenue.toFixed(0)}</strong></div><div class="stat-row"><span>AI mode</span><strong>${escapeHtml(c.ai?.mode||'off')}</strong></div></article>`).join('');
  }

  async function loadEngineConfig(){
    try{
      const saved=await getSetting('engineConfig');
      engineConfig={...DEFAULT_ENGINE_CONFIG,...(saved?.value||{})};
    }catch(err){
      console.warn('Engine config unavailable; using defaults',err);
      engineConfig={...DEFAULT_ENGINE_CONFIG};
    }
  }

  async function saveEngineConfig(){
    await setSetting('engineConfig',engineConfig);
  }

  async function refreshEngineDiagnostics(){
    const merged=await getMergedOrders();
    let indexedCount=0;
    try{ indexedCount=(await getAll(STORE_ORDERS)).length; }catch(_){}
    const localCount=readLocalOrders().length;
    const hasDraft=!!localStorage.getItem(DRAFT_KEY);
    let storageText='Available';
    try{
      const estimate=await navigator.storage?.estimate?.();
      if(estimate?.usage!=null && estimate?.quota){
        const used=(estimate.usage/1024/1024).toFixed(1);
        const quota=(estimate.quota/1024/1024).toFixed(0);
        storageText=`${used} MB / ${quota} MB`;
      }
    }catch(_){}
    if($('engineOrderCount')) $('engineOrderCount').textContent=String(merged.length);
    if($('engineDraftStatus')) $('engineDraftStatus').textContent=hasDraft?'Recoverable':'Clear';
    if($('engineStorageStatus')) $('engineStorageStatus').textContent=storageText;
    if($('engineEmailStatus')) $('engineEmailStatus').textContent=WEB3FORMS_ACCESS_KEY && !WEB3FORMS_ACCESS_KEY.includes('PASTE_')?'Configured':'Needs Setup';
    if($('engineStorageDetail')) $('engineStorageDetail').textContent=`IndexedDB: ${indexedCount} order(s) • Local backup: ${localCount} order(s) • Merged view: ${merged.length} order(s).`;
  }

  function populateEngineSettings(){
    renderProjectCommand();
    renderCompanyCommand();
    renderCompanyFleet();
    if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Workshop Engine';
    if($('schemaVersionSetting')) $('schemaVersionSetting').value=Number(engineConfig.schemaVersion||2);
    if($('engineStatusesSetting')) $('engineStatusesSetting').value=(businessConfig.orderStatuses||DEFAULT_BUSINESS_CONFIG.orderStatuses).join(', ');
  }

  async function openEnginePanel(){
    $('adminPanel').classList.add('hidden');
    $('enginePanel').classList.remove('hidden');
    populateEngineSettings();
    await refreshEngineDiagnostics();
    await renderFleetStats();
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  async function loadFeatureSettings(){
    try{
      const custom=await getSetting('allowCustomColors');
      const confirm=await getSetting('customerConfirmationEmail');
      state.allowCustomColors=custom?.value !== false;
      state.customerConfirmationEmail=confirm?.value === true;
    }catch(err){
      console.warn('Feature settings unavailable; using defaults',err);
      state.allowCustomColors=true;
      state.customerConfirmationEmail=false;
    }
  }

  async function saveFeatureSettings(){
    state.allowCustomColors=!!$('allowCustomColorsToggle')?.checked;
    state.customerConfirmationEmail=!!$('customerEmailToggle')?.checked;
    await setSetting('allowCustomColors',state.allowCustomColors);
    await setSetting('customerConfirmationEmail',state.customerConfirmationEmail);
    if(!state.allowCustomColors && state.fill==='Other'){
      state.fill='Black';
    }
    updateUi();
  }


  function setScreen(name){
    if(state.current==='photo' && name!=='photo') stopCamera();
    state.current=name;
    $$('.screen').forEach(s=>{
      const isCurrent=s.dataset.screen===name;
      s.classList.toggle('active',isCurrent);
      s.setAttribute('aria-hidden',isCurrent?'false':'true');
    });
    const index=screenOrder.indexOf(name);
    $('progressBar').style.width=`${Math.max(1,(index+1)/screenOrder.length*100)}%`;
    $('stepLabel').textContent=name==='done'?'Complete':`Step ${index+1} of ${screenOrder.length-1}`;
    $('backBtn').style.visibility=['welcome','done'].includes(name)?'hidden':'visible';
    updateUi();
    saveDraft();
    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:'instant'});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    });
  }

  function selectButtons(containerId, attr, value){
    const box=$(containerId);
    [...box.querySelectorAll(`[${attr}]`)].forEach(b=>b.classList.toggle('selected',b.getAttribute(attr)===String(value)));
  }

  function fillColor(){
    if(state.fill==='White') return '#ffffff';
    if(state.fill==='Natural') return '#6b4429';
    if(state.fill==='Other') return state.customColor || '#1f6feb';
    return '#111111';
  }

  function applyPreview(){
    $$('[data-preview-img]').forEach(img=>{
      const card=img.closest('.preview-card');
      if(state.photoData){img.src=state.photoData;card.classList.add('has-photo');}
      else{img.removeAttribute('src');card.classList.remove('has-photo');}
    });
    $$('[data-preview-text]').forEach(el=>{
      el.textContent=state.wording || 'Your Sign';
      el.classList.remove('style-a','style-b','style-c','cnc-carved');
      el.classList.add(`style-${state.font.toLowerCase()}`);
      if(state.fill==='Natural'){
        el.classList.add('cnc-carved');
        el.style.removeProperty('color');
      }else{
        el.style.color=fillColor();
      }
    });
    $$('[data-font-sample]').forEach(el=>el.textContent=state.wording||'Your Sign');
    const activeProject=projectById(activeProjectId||'ikes-wood-signs');
    $('previewPrice').textContent=activeProjectId==='mugshot-after-dark'?`Your $${state.price} Mugs After Dark custom mug`:`Your $${state.price} Ike's Wood Sign`;
    const customChoice=document.querySelector('[data-fill="Other"]');
    if(customChoice) customChoice.classList.toggle('hidden',!state.allowCustomColors);
    if(!state.allowCustomColors && state.fill==='Other') state.fill='Black';
    if($('customColorPanel')) $('customColorPanel').classList.toggle('hidden',state.fill!=='Other');
    if($('customColor')){
      $('customColor').value=state.customColor||'#1f6feb';
      $('customColorName').textContent=(state.customColor||'#1f6feb').toUpperCase();
      $('customSwatch').style.background=state.customColor||'#1f6feb';
    }
  }

  function updateUi(){
    selectButtons('priceChoices','data-price',state.price);
    selectButtons('orientationChoices','data-orientation',state.orientation);
    selectButtons('fontChoices','data-font',state.font);
    selectButtons('fillChoices','data-fill',state.fill);
    selectButtons('contactChoices','data-contact',state.contactPreference);
    $('wordingInput').value=state.wording;
    $('charCount').textContent=`${state.wording.length} character${state.wording.length===1?'':'s'}`;
    $('topSide').value=state.topSide;
    applyPreview();
    if(state.photoData){
      $('woodPhoto').src=state.photoData;
      $('photoFrame').classList.add('has-photo');
      $('photoFrame').classList.remove('hidden');
      $('photoReviewControls').classList.remove('hidden');
      $('cameraPanel').classList.add('hidden');
      $('cameraControls').classList.add('hidden');
    }else{
      $('photoFrame').classList.remove('has-photo');
      $('photoFrame').classList.add('hidden');
      $('photoReviewControls').classList.add('hidden');
      $('cameraPanel').classList.remove('hidden');
      $('cameraControls').classList.remove('hidden');
    }
    if(state.current==='review') renderSummary();
  }

  function bindChoice(containerId, attr, key, transform=v=>v){
    $(containerId).addEventListener('click',e=>{
      const b=e.target.closest(`[${attr}]`); if(!b) return;
      state[key]=transform(b.getAttribute(attr)); updateUi();
    });
  }

  function validateCustomer(){
    const n=$('customerName').value.trim(), p=$('customerPhone').value.trim(), e=$('customerEmail').value.trim();
    if(!n||!p||!e){$('customerError').textContent='Please enter name, cell phone number, and email address.';return false;}
    if(!/^\S+@\S+\.\S+$/.test(e)){$('customerError').textContent='Please enter a valid email address.';return false;}
    state.customerName=n;state.customerPhone=p;state.customerEmail=e;$('customerError').textContent='';return true;
  }

  function renderSummary(){
    const rows=[
      ['Exact wording',state.wording],[activeProjectId==='mugshot-after-dark'?'Mug option':'Wood',`$${state.price}`],[activeProjectId==='mugshot-after-dark'?'Design placement':'Orientation',state.orientation],[activeProjectId==='mugshot-after-dark'?'Reference top':'Top marker',state.topSide],['Style',state.font],[activeProjectId==='mugshot-after-dark'?'Design color':'Fill',state.fill],
      ['Name',state.customerName],['Cell',state.customerPhone],['Email',state.customerEmail],['Contact by',state.contactPreference]
    ];
    $('orderSummary').innerHTML=rows.map(([k,v])=>`<div class="summary-row"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');
  }

  function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
  function newOrderId(){
    const d=new Date();
    const y=d.getFullYear().toString().slice(-2);
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    const suffix=(Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,4)).toUpperCase();
    const project=projectById(activeProjectId||'ikes-wood-signs');
    const prefix=project?.orderPrefix || businessConfig.orderPrefix || 'IKE';
    return `${prefix}-${y}${m}${day}-${suffix}`;
  }

  async function createApprovedPreview(){
    const source=state.photoData;
    if(!source) return '';
    return new Promise((resolve)=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const maxSide=1600;
          const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
          const w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
          const h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
          const canvas=document.createElement('canvas');
          canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext('2d',{alpha:false});
          if(!ctx) return resolve('');
          ctx.drawImage(img,0,0,w,h);

          // Draw the customer's approved wording over the exact wood photo.
          const fontSize=Math.max(30,Math.min(Math.round(w*0.09),Math.round(h*0.28)));
          const family=state.font==='A'?'Georgia':state.font==='C'?"Times New Roman":'Georgia';
          const style=state.font==='B'?'italic ':'';
          const weight=state.font==='C'?'400':'700';
          ctx.font=`${style}${weight} ${fontSize}px ${family}`;
          ctx.textAlign='center';
          ctx.textBaseline='middle';
          ctx.lineJoin='round';

          let color='#111111';
          if(state.fill==='White') color='#ffffff';
          else if(state.fill==='Natural') color='#6b4429';
          else if(state.fill==='Other') color=state.customColor||'#1f6feb';

          const text=state.wording||'';
          const maxWidth=w*0.88;
          let drawSize=fontSize;
          while(drawSize>20){
            ctx.font=`${style}${weight} ${drawSize}px ${family}`;
            if(ctx.measureText(text).width<=maxWidth) break;
            drawSize-=2;
          }
          if(state.fill==='Natural'){
            // CNC/no-fill simulation: recessed cut with highlight on the upper edge
            // and a darker lower-edge shadow, rather than painted brown lettering.
            ctx.save();
            ctx.lineWidth=Math.max(2,drawSize*0.055);
            ctx.strokeStyle='rgba(255,235,202,.48)';
            ctx.strokeText(text,w/2-2,h/2-2,maxWidth);
            ctx.strokeStyle='rgba(58,28,13,.72)';
            ctx.strokeText(text,w/2+2,h/2+3,maxWidth);
            ctx.fillStyle='rgba(92,54,30,.58)';
            ctx.fillText(text,w/2,h/2,maxWidth);
            ctx.restore();
          }else{
            ctx.lineWidth=Math.max(2,drawSize*0.045);
            ctx.strokeStyle=color==='#ffffff'?'rgba(0,0,0,.55)':'rgba(255,255,255,.55)';
            ctx.strokeText(text,w/2,h/2,maxWidth);
            ctx.fillStyle=color;
            ctx.fillText(text,w/2,h/2,maxWidth);
          }

          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(err){
          console.error('Approved preview flatten failed',err);
          resolve('');
        }
      };
      img.onerror=()=>resolve('');
      img.src=source;
    });
  }

  async function saveOrder(){
    const id=newOrderId();
    const approvedPreviewData=await createApprovedPreview();
    state.approvedPreviewData=approvedPreviewData;
    const orderProject=projectById(activeProjectId||'ikes-wood-signs');
    const order={projectId:activeProjectId||'ikes-wood-signs',schemaVersion:Number(engineConfig.schemaVersion||2),business:{name:orderProject?.name||businessConfig.businessName,orderPrefix:orderProject?.orderPrefix||businessConfig.orderPrefix},id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'New',price:state.price,photoData:state.photoData,approvedPreviewData,orientation:state.orientation,topSide:state.topSide,wording:state.wording,font:state.font,fill:state.fill,customColor:state.customColor,contactPreference:state.contactPreference,customerName:state.customerName,customerPhone:state.customerPhone,customerEmail:state.customerEmail,approved:true};
    backupOrderLocally(order);
    try{
      await put(STORE_ORDERS,order);
    }catch(err){
      console.warn('IndexedDB save failed; local backup retained',err);
    }
    state.currentOrderId=id;
    state.currentOrder=order;
    clearDraft();
    $('doneOrderId').textContent=id;
    if($('doneApprovedPreview')){
      if(order.approvedPreviewData){
        $('doneApprovedPreview').src=order.approvedPreviewData;
        $('doneApprovedPreview').classList.remove('hidden');
      }else{
        $('doneApprovedPreview').classList.add('hidden');
      }
    }
    return order;
  }

  async function loadBusinessConfig(){
    try{const s=await getSetting('businessConfig');businessConfig={...DEFAULT_BUSINESS_CONFIG,...(s?.value||{})};}catch(_){businessConfig={...DEFAULT_BUSINESS_CONFIG};}
    if(!Array.isArray(businessConfig.prices)||!businessConfig.prices.length) businessConfig.prices=[45,55,65,90,135];
    renderConfiguredPrices(); applyBusinessCopy();
  }
  function renderConfiguredPrices(){
    const box=$('priceChoices'); if(!box)return;
    if(!businessConfig.prices.includes(Number(state.price))) state.price=Number(businessConfig.prices[0]);
    box.innerHTML=businessConfig.prices.map(p=>`<button class="choice-btn ${Number(state.price)===Number(p)?'selected':''}" data-price="${Number(p)}">$${Number(p)}</button>`).join('');
    box.querySelectorAll('[data-price]').forEach(b=>b.addEventListener('click',()=>{state.price=Number(b.dataset.price);renderConfiguredPrices();updateUi();}));
  }
  function applyBusinessCopy(){
    document.querySelectorAll('.brand-title').forEach(e=>e.textContent=(businessConfig.businessName||"Ike's Wood Signs").toUpperCase());
    const h=document.querySelector('[data-screen="done"] .celebration-kicker');if(h)h.textContent=businessConfig.thankYouHeadline;
  }
  function populateBusinessSettings(){
    if(!$('businessNameSetting'))return;
    $('businessNameSetting').value=businessConfig.businessName;$('orderPrefixSetting').value=businessConfig.orderPrefix;$('thankYouSetting').value=businessConfig.thankYouHeadline;$('priceChoicesSetting').value=businessConfig.prices.join(',');
  }
  async function saveBusinessConfigFromAdmin(){
    const prices=$('priceChoicesSetting').value.split(',').map(v=>Number(v.trim())).filter(v=>Number.isFinite(v)&&v>0);
    businessConfig={...businessConfig,businessName:$('businessNameSetting').value.trim()||"Ike's Wood Signs",orderPrefix:($('orderPrefixSetting').value||'IKE').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'IKE',thankYouHeadline:$('thankYouSetting').value.trim()||DEFAULT_BUSINESS_CONFIG.thankYouHeadline,prices:prices.length?prices:[45,55,65,90,135]};
    await setSetting('businessConfig',businessConfig);renderConfiguredPrices();applyBusinessCopy();$('businessSettingsStatus').textContent='Business settings saved.';
  }
  function saveDraft(){if(['welcome','done'].includes(state.current))return;try{localStorage.setItem(DRAFT_KEY,JSON.stringify({...state,currentOrder:null,approvedPreviewData:''}));}catch(_){}}
  function clearDraft(){try{localStorage.removeItem(DRAFT_KEY)}catch(_){}}
  function recoverDraft(){try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(d&&screenOrder.includes(d.current)){Object.assign(state,d);return true}}catch(_){}return false}

  function resetOrder(){
    Object.assign(state,{current:'welcome',price:65,photoData:'',orientation:'Horizontal',topSide:'Top of photo',wording:'Smoke Hole',font:'B',fill:'Black',contactPreference:'Text',customerName:'',customerPhone:'',customerEmail:'',currentOrderId:'',currentOrder:null,approvedPreviewData:'',customColor:'#1f6feb'});
    ['customerName','customerPhone','customerEmail'].forEach(id=>$(id).value='');$('approvalCheck').checked=false;setScreen('welcome');
  }

  async function dataUrlToBlob(dataUrl){
    const response=await fetch(dataUrl);
    return response.blob();
  }

  async function sendWeb3FormsWithOptionalPreview(order,payload){
    // Web3Forms accepts a single attachment using multipart/form-data on plans
    // that support file attachments. If the attachment is rejected, the caller
    // falls back automatically to the proven text-only submission.
    if(order.approvedPreviewData){
      try{
        const form=new FormData();
        Object.entries(payload).forEach(([k,v])=>form.append(k,String(v??'')));
        const blob=await dataUrlToBlob(order.approvedPreviewData);
        if(blob.size<=5*1024*1024){
          form.append('attachment',blob,`${order.id}-approved-preview.jpg`);
          const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:form});
          const result=await response.json().catch(()=>({success:false,message:'Invalid response from Web3Forms'}));
          if(response.ok && result.success===true){
            return {response,result,attachmentSent:true};
          }
          console.warn('Preview attachment submission unavailable; falling back to text-only.',result);
        }
      }catch(err){
        console.warn('Preview attachment attempt failed; falling back to text-only.',err);
      }
    }
    const response=await fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({success:false,message:'Invalid response from Web3Forms'}));
    return {response,result,attachmentSent:false};
  }

  async function submitOrder(order){
    const status=$('submitStatus');
    const retry=$('retrySubmitBtn');
    retry.classList.add('hidden');
    const orderProject=projectById(order.projectId||'ikes-wood-signs');
    if(order.projectId && order.projectId!=='ikes-wood-signs'){
      status.className='submit-status centered success';
      status.textContent=`${orderProject?.name||'Project'} test order saved inside this project. No Ike’s order email was sent.`;
      return true;
    }
    status.className='submit-status centered sending';
    status.textContent='Sending your order to Ike…';

    if(!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.includes('PASTE_WEB3FORMS')){
      status.className='submit-status centered error-text';
      status.textContent='Order saved on this iPad, but automatic email is not configured yet.';
      retry.classList.remove('hidden');
      return false;
    }

    const payload={
      access_key:WEB3FORMS_ACCESS_KEY,
      subject:`NEW IKE'S WOOD SIGN ORDER — ${order.id}`,
      from_name:"Ike's Wood Signs Online Orders",
      order_number:order.id,
      customer_name:order.customerName,
      customer_cell:order.customerPhone,
      customer_email:order.customerEmail,
      ...(state.customerConfirmationEmail ? {email:order.customerEmail} : {}),
      contact_preference:order.contactPreference,
      exact_wording:order.wording,
      wood_price:`$${order.price}`,
      orientation:order.orientation,
      top_marker:order.topSide,
      letter_style:order.font,
      letter_fill:order.fill,
      custom_color:order.fill==='Other'?(order.customColor||''): '',
      order_status:order.status,
      submitted_at:new Date(order.createdAt).toLocaleString(),
      message:`Order ${order.id}\n\nCustomer: ${order.customerName}\nCell: ${order.customerPhone}\nEmail: ${order.customerEmail}\nContact by: ${order.contactPreference}\n\nExact wording: ${order.wording}\nWood: $${order.price}\nOrientation: ${order.orientation}\nTop marker: ${order.topSide}\nLetter style: ${order.font}\nLetter fill: ${order.fill}${order.fill==='Other' ? ` (${order.customColor})` : ''}\n\nApproved customer preview: attached when the configured Web3Forms plan supports file attachments.`
    };

    try{
      const {response,result,attachmentSent}=await sendWeb3FormsWithOptionalPreview(order,payload);
      console.log('Web3Forms response',response.status,result,'attachmentSent=',attachmentSent);
      if(!response.ok || result.success!==true) throw new Error(result.message||`Submission failed (${response.status})`);
      order.previewAttachmentSent=attachmentSent;
      order.emailSentAt=new Date().toISOString();
      order.emailRecipient=ORDER_EMAIL;
      backupOrderLocally(order);
      try{ await put(STORE_ORDERS,order); }catch(err){ console.warn('Email status IndexedDB update failed',err); }
      status.className='submit-status centered success';
      status.textContent=`Order received! Ike has your order details. Thank you again for choosing Ike's Wood Signs.`;
      if($('customerEmailStatus')){
        if(state.customerConfirmationEmail){
          $('customerEmailStatus').classList.remove('hidden');
          $('customerEmailStatus').textContent='A confirmation email has been requested for '+order.customerEmail+'.';
        }else{
          $('customerEmailStatus').classList.add('hidden');
          $('customerEmailStatus').textContent='';
        }
      }
      return true;
    }catch(err){
      console.error('Automatic order email failed',err);
      order.emailError=String(err?.message||err||'Unknown error');
      order.emailFailedAt=new Date().toISOString();
      backupOrderLocally(order);
      try{ await put(STORE_ORDERS,order); }catch(dbErr){ console.warn('Failed email state IndexedDB update failed',dbErr); }
      status.className='submit-status centered error-text';
      status.textContent='Your order is saved on this iPad, but the automatic email did not send. Please show this screen to Ike before leaving.';
      if($('customerEmailStatus')){
        $('customerEmailStatus').classList.add('hidden');
        $('customerEmailStatus').textContent='';
      }
      retry.classList.remove('hidden');
      return false;
    }
  }

  function emailBody(order){
    return `${order.business?.name||"Ike's Wood Signs"} Order\n\nOrder: ${order.id}\nCustomer: ${order.customerName}\nCell: ${order.customerPhone}\nEmail: ${order.customerEmail}\nContact preference: ${order.contactPreference}\n\nWording: ${order.wording}\nPrice: $${order.price}\nOrientation: ${order.orientation}\nTop: ${order.topSide}\nStyle: ${order.font}\nFill: ${order.fill}\nStatus: ${order.status}\n\nThe full order, including the wood photo, remains stored on the trailer iPad.`;
  }

  async function prepareEmail(order){
    const setting=await getSetting('adminEmails');
    const recipients=setting?.value?.trim()||ORDER_EMAIL;
    const subject=encodeURIComponent(`${order.business?.name||"Ike's Wood Signs"} ${order.id} - ${order.wording}`);
    const body=encodeURIComponent(emailBody(order));
    location.href=`mailto:${encodeURIComponent(recipients).replace(/%2C/g,',')}?subject=${subject}&body=${body}`;
  }

  async function updateOrderStatus(id,status){
    const orders=await getMergedOrders(),o=orders.find(x=>x.id===id);if(!o)return;
    o.status=status;o.updatedAt=new Date().toISOString();backupOrderLocally(o);try{await put(STORE_ORDERS,o)}catch(_){}
    if(status==='Completed') postOrderToLedger(o);
    await renderAdmin();
  }

  async function renderAdmin(){
    const orders=(await getMergedOrders()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const list=$('orderList');
    if(!orders.length){list.innerHTML='<div class="empty">No saved orders yet.</div>';return;}
    list.innerHTML=orders.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-card-head"><div><h3>${escapeHtml(o.id)}</h3><div class="helper">${new Date(o.createdAt).toLocaleString()}</div></div><strong>$${o.price}</strong></div><div class="summary-row"><span>Sign</span><strong>${escapeHtml(o.wording)}</strong></div><div class="summary-row"><span>Customer</span><strong>${escapeHtml(o.customerName)}</strong></div><div class="summary-row"><span>Cell</span><strong>${escapeHtml(o.customerPhone)}</strong></div><div class="summary-row"><span>Email</span><strong>${escapeHtml(o.customerEmail)}</strong></div><div class="summary-row"><span>Letter finish</span><strong>${escapeHtml(o.fill)}${o.fill==='Other'&&o.customColor?` • <span class="color-dot" style="background:${escapeHtml(o.customColor)}"></span> ${escapeHtml(o.customColor.toUpperCase())}`:''}</strong></div>${o.approvedPreviewData?`<div class="admin-preview-label">APPROVED CUSTOMER PREVIEW</div><img src="${o.approvedPreviewData}" alt="Approved sign preview for ${escapeHtml(o.id)}" class="thumb approved-thumb">`:o.photoData?`<img src="${o.photoData}" alt="Wood blank for ${escapeHtml(o.id)}" class="thumb">`:''}<label>Status<select class="status-select" data-status><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='In Production'?'selected':''}>In Production</option><option ${o.status==='Ready'?'selected':''}>Ready</option><option ${o.status==='Picked Up'?'selected':''}>Picked Up</option></select></label><div class="order-status-control"><label>Status</label><select data-order-status="${escapeHtml(o.id)}">${businessConfig.orderStatuses.map(s=>`<option value="${escapeHtml(s)}" ${o.status===s?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div><div class="order-actions"><span class="helper">${o.emailSentAt?'Automatic email sent':'Saved locally'}</span></div></article>`).join('');
    list.querySelectorAll('[data-status]').forEach(sel=>sel.addEventListener('change',async e=>{const card=e.target.closest('[data-id]');const orders=await getMergedOrders();const o=orders.find(x=>x.id===card.dataset.id);if(o){o.status=e.target.value;await put(STORE_ORDERS,o);}}));
  }

  async function exportBackup(){
    const data={version:1,exportedAt:new Date().toISOString(),orders:await getMergedOrders(),settings:await getAll(STORE_SETTINGS)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ikes-wood-signs-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  async function restoreBackup(file){
    const text=await file.text();const data=JSON.parse(text);if(!Array.isArray(data.orders)) throw new Error('Invalid backup');
    for(const o of data.orders) await put(STORE_ORDERS,o);for(const s of (data.settings||[])) await put(STORE_SETTINGS,s);await renderAdmin();
  }

  function cameraSupported(){
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async function startCamera(){
    $('photoError').textContent='';
    $('photoHelp').textContent='Starting camera…';
    if(!cameraSupported()){
      $('photoError').textContent='This viewing app does not provide direct camera access. Try opening Version 1.2 in Safari or use the saved-photo option for testing.';
      $('photoHelp').textContent='Direct camera access requires a browser environment that supports the iPad camera.';
      return;
    }
    try{
      stopCamera();
      cameraStream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},
        audio:false
      });
      const video=$('cameraVideo');
      video.srcObject=cameraStream;
      await video.play();
      $('cameraIdle').classList.add('hidden');
      video.classList.add('active');
      $('startCameraBtn').classList.add('hidden');
      $('capturePhotoBtn').classList.remove('hidden');
      $('cancelCameraBtn').classList.remove('hidden');
      $('photoHelp').textContent='Center the entire wood blank in the frame, then tap TAKE PICTURE.';
    }catch(err){
      console.error('Camera start failed',err);
      stopCamera();
      const insecure=!window.isSecureContext;
      $('photoError').textContent=insecure
        ? 'Camera access is blocked because this page is not running in a secure browser context.'
        : 'The iPad camera could not be opened here. Camera permission may be blocked by the app displaying this page.';
      $('photoHelp').textContent='Version 1.2 keeps the camera inside the ordering step when the browser allows camera access.';
    }
  }

  function stopCamera(){
    if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
    const video=$('cameraVideo');
    if(video){video.pause();video.srcObject=null;video.classList.remove('active');}
    if($('cameraIdle')) $('cameraIdle').classList.remove('hidden');
    if($('startCameraBtn')) $('startCameraBtn').classList.remove('hidden');
    if($('capturePhotoBtn')) $('capturePhotoBtn').classList.add('hidden');
    if($('cancelCameraBtn')) $('cancelCameraBtn').classList.add('hidden');
  }

  function captureCameraPhoto(){
    const video=$('cameraVideo');
    if(!video.videoWidth||!video.videoHeight){$('photoError').textContent='The camera is not ready yet. Please try again.';return;}
    try{
      const maxSide=1600;
      const scale=Math.min(1,maxSide/Math.max(video.videoWidth,video.videoHeight));
      const w=Math.max(1,Math.round(video.videoWidth*scale));
      const h=Math.max(1,Math.round(video.videoHeight*scale));
      const canvas=$('cameraCanvas');
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});
      ctx.drawImage(video,0,0,w,h);
      state.photoData=canvas.toDataURL('image/jpeg',0.78);
      stopCamera();
      $('photoHelp').textContent='Picture captured. Review it below before continuing.';
      updateUi();
    }catch(err){
      console.error('Camera capture failed',err);
      $('photoError').textContent='The picture could not be captured. Please try again.';
    }
  }

  function resizePhoto(file){
    return new Promise((resolve,reject)=>{
      if(!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'));
      const objectUrl=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>{
        try{
          const maxSide=1600;
          const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
          if(!w||!h) throw new Error('Image has no dimensions');
          const scale=Math.min(1,maxSide/Math.max(w,h));
          const outW=Math.max(1,Math.round(w*scale)), outH=Math.max(1,Math.round(h*scale));
          const canvas=document.createElement('canvas');
          canvas.width=outW; canvas.height=outH;
          const ctx=canvas.getContext('2d',{alpha:false});
          if(!ctx) throw new Error('Canvas unavailable');
          ctx.drawImage(img,0,0,outW,outH);
          const data=canvas.toDataURL('image/jpeg',0.78);
          URL.revokeObjectURL(objectUrl);
          resolve(data);
        }catch(err){URL.revokeObjectURL(objectUrl);reject(err);}
      };
      img.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error('Image decode failed'));};
      img.src=objectUrl;
    });
  }

  function bindEvents(){
    $$('.next').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.busy==='1') return;
      b.dataset.busy='1';
      setScreen(b.dataset.next);
      setTimeout(()=>delete b.dataset.busy,220);
    }));
    $$('.goto').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.goto)));
    $('backBtn').addEventListener('click',()=>{const i=screenOrder.indexOf(state.current);if(i>0)setScreen(screenOrder[i-1]);});
    bindChoice('priceChoices','data-price','price',Number);bindChoice('orientationChoices','data-orientation','orientation');bindChoice('fontChoices','data-font','font');bindChoice('fillChoices','data-fill','fill');bindChoice('contactChoices','data-contact','contactPreference');
    if($('customColor')){
      $('customColor').addEventListener('input',e=>{
        state.customColor=e.target.value;
        state.fill='Other';
        updateUi();
      });
    }
    $('topSide').addEventListener('change',e=>state.topSide=e.target.value);
    $('wordingInput').addEventListener('input',e=>{state.wording=e.target.value;$('charCount').textContent=`${state.wording.length} character${state.wording.length===1?'':'s'}`;applyPreview();});
    $('startCameraBtn').addEventListener('click',startCamera);
    $('capturePhotoBtn').addEventListener('click',captureCameraPhoto);
    $('cancelCameraBtn').addEventListener('click',()=>{stopCamera();$('photoHelp').textContent='Camera canceled. Tap START CAMERA when you are ready.';});
    $('photoInput').addEventListener('change',async e=>{
      const input=e.target;
      const f=input.files?.[0];
      if(!f) return;
      $('photoError').textContent='';
      $('photoHelp').textContent='Preparing your picture…';
      try{
        state.photoData=await resizePhoto(f);
        stopCamera();
        updateUi();
        $('photoHelp').textContent='Picture added. Review it before continuing.';
      }catch(err){
        console.error('Photo processing failed',err);
        $('photoError').textContent='That picture could not be added. Please try again.';
      }finally{input.value='';}
    });
    $('retakeBtn').addEventListener('click',()=>{state.photoData='';updateUi();startCamera();});
    $('reviewBtn').addEventListener('click',()=>{if(validateCustomer())setScreen('review');});
    $('approveBtn').addEventListener('click',async()=>{
      if(!$('approvalCheck').checked){$('approvalError').textContent='Please check the approval box first.';return;}
      $('approvalError').textContent='';
      const btn=$('approveBtn');
      btn.disabled=true;btn.textContent='PLACING YOUR ORDER…';
      try{
        const order=await saveOrder();
        setScreen('done');
        await submitOrder(order);
      }finally{
        btn.disabled=false;btn.textContent='PLACE MY ORDER →';
      }
    });
    $('newOrderBtn').addEventListener('click',resetOrder);
    if($('completeOrderBtn')) $('completeOrderBtn').addEventListener('click',resetOrder);
    $('retrySubmitBtn').addEventListener('click',async()=>{if(state.currentOrder)await submitOrder(state.currentOrder);});
    $('adminBtn').addEventListener('click',()=>{
      document.body.classList.add('modal-open');
      $('adminPinInput').value='';
      $('pinGateError').textContent='';
      $('pinGate').classList.remove('hidden');
      setTimeout(()=>$('adminPinInput').focus(),50);
    });
    $('closeAdminBtn').addEventListener('click',()=>{$('adminPanel').classList.add('hidden');$('customerApp').classList.remove('hidden');});
    $('orderList').addEventListener('change',e=>{const s=e.target.closest('[data-order-status]');if(s)updateOrderStatus(s.dataset.orderStatus,s.value);});

    $('engineRoomBtn').addEventListener('click',()=>{
      document.body.classList.add('modal-open');
      $('enginePinInput').value='';
      $('enginePinError').textContent='';
      $('enginePinGate').classList.remove('hidden');
      setTimeout(()=>$('enginePinInput').focus(),50);
    });
    $('cancelEngineBtn').addEventListener('click',()=>{$('enginePinGate').classList.add('hidden');document.body.classList.remove('modal-open');});
    $('enginePinInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('unlockEngineBtn').click();});
    $('unlockEngineBtn').addEventListener('click',async()=>{
      const entered=$('enginePinInput').value.trim();
      const expected=await getEnginePin();
      if(entered!==expected){
        const pirateLines=[
          'Arrr… wrong code, matey.',
          'No treasure for ye. Try the captain’s code again.',
          'That code be walking the plank.',
          'Ye almost fooled the parrot. Almost.'
        ];
        $('enginePinError').textContent=pirateLines[Math.floor(Math.random()*pirateLines.length)];
        $('enginePinInput').select();
        return;
      }
      $('enginePinInput').value='';
      $('enginePinGate').classList.add('hidden');
      document.body.classList.remove('modal-open');
      await openEnginePanel();
    });
    if($('closeEngineBtn')) $('closeEngineBtn').addEventListener('click',()=>{
      lockEngineSession();
      document.body.classList.remove('engine-mode','project-mode');
      document.body.classList.add('boot-locked');
      $('enginePanel')?.classList.add('hidden');
      $('adminPanel')?.classList.add('hidden');
      $('customerApp')?.classList.add('hidden');
      $('blackFlagEntryGate')?.classList.remove('hidden');
      window.scrollTo({top:0,left:0,behavior:'instant'});
    });

    $('aiCompanySetting').addEventListener('change',loadAIForm);
    $('saveAISettingsBtn').addEventListener('click',saveAIForm);

    if($('addProjectBtn')) $('addProjectBtn').addEventListener('click',openAddProject);
    if($('closeProjectEngineControl')) $('closeProjectEngineControl').addEventListener('click',()=>{$('projectEngineControl').classList.add('hidden');engineActiveProjectId=null;});
    if($('projectTabs')) $('projectTabs').addEventListener('click',e=>{const b=e.target.closest('[data-project-tab]');if(b&&engineActiveProjectId)renderProjectTab(engineActiveProjectId,b.dataset.projectTab);});
    if($('cancelAddProjectBtn')) $('cancelAddProjectBtn').addEventListener('click',()=>$('addProjectGate').classList.add('hidden'));
    if($('createProjectBtn')) $('createProjectBtn').addEventListener('click',createProject);
    if($('returnToEngineBtn')) $('returnToEngineBtn').addEventListener('click',requestEngineFromProject);

    $('saveEngineIdentityBtn').addEventListener('click',async()=>{
      const name=$('engineNameSetting').value.trim()||'Workshop Engine';
      const version=Math.max(2,Math.min(99,Number($('schemaVersionSetting').value)||2));
      engineConfig={...engineConfig,engineName:name,schemaVersion:version};
      await saveEngineConfig();
      $('engineIdentityStatus').textContent='Engine identity saved.';
    });

    $('saveEngineWorkflowBtn').addEventListener('click',async()=>{
      const statuses=$('engineStatusesSetting').value.split(',').map(v=>v.trim()).filter(Boolean);
      if(statuses.length<2){
        $('engineWorkflowStatus').textContent='Use at least two workflow stages.';
        return;
      }
      businessConfig.orderStatuses=statuses.slice(0,12);
      await setSetting('businessConfig',businessConfig);
      $('engineWorkflowStatus').textContent='Workflow saved.';
      await renderAdmin();
    });

    $('engineRefreshDiagnosticsBtn').addEventListener('click',refreshEngineDiagnostics);
    $('engineClearDraftBtn').addEventListener('click',()=>{
      clearDraft();
      $('engineStorageDetail').textContent='Interrupted-order draft cleared. Existing saved orders were not changed.';
      refreshEngineDiagnostics();
    });
    $('engineExportBtn').addEventListener('click',exportBackup);

    $('engineResetSettingsBtn').addEventListener('click',async()=>{
      const typed=prompt('Danger Locker: type RESET ENGINE to restore default engine/business settings. Saved orders will remain.');
      if(typed!=='RESET ENGINE') return;
      const stores=tx(STORE_SETTINGS,'readwrite');
      try{ stores.clear(); }catch(_){}
      businessConfig={...DEFAULT_BUSINESS_CONFIG};
      engineConfig={...DEFAULT_ENGINE_CONFIG};
      companies=structuredClone(DEFAULT_COMPANIES);
      await saveCompanies();
      state.allowCustomColors=true;
      state.customerConfirmationEmail=false;
      clearDraft();
      await loadBusinessConfig();
      await loadEngineConfig();
      populateEngineSettings();
      $('engineStorageDetail').textContent='Engine settings reset to defaults. Saved orders were preserved.';
      await refreshEngineDiagnostics();
    });
    $('unlockAdminBtn').addEventListener('click',async()=>{
      const entered=$('adminPinInput').value.trim();
      const expected=await getAdminPin();
      if(entered!==expected){
        $('pinGateError').textContent='Incorrect PIN.';
        $('adminPinInput').select();
        return;
      }
      $('pinGate').classList.add('hidden');
      document.body.classList.remove('modal-open');
      $('customerApp').classList.add('hidden');
      $('adminPanel').classList.remove('hidden');
      if($('allowCustomColorsToggle')) $('allowCustomColorsToggle').checked=state.allowCustomColors;
      if($('customerEmailToggle')) $('customerEmailToggle').checked=state.customerConfirmationEmail;
      populateBusinessSettings();
      await renderAdmin();
    });
    $('adminPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('unlockAdminBtn').click();});
    $('cancelAdminPinBtn').addEventListener('click',()=>{$('pinGate').classList.add('hidden');document.body.classList.remove('modal-open');});
    $('savePinBtn').addEventListener('click',async()=>{
      const p=$('newAdminPin').value.trim();
      const c=$('confirmAdminPin').value.trim();
      if(!/^\d{4,8}$/.test(p)){
        $('pinSettingsError').textContent='PIN must be 4 to 8 numbers.';
        return;
      }
      if(p!==c){
        $('pinSettingsError').textContent='The two PIN entries do not match.';
        return;
      }
      await setSetting('adminPin',p);
      $('pinSettingsError').textContent='PIN updated.';
      $('newAdminPin').value='';
      $('confirmAdminPin').value='';
    });

    $('settingsBtn').addEventListener('click',()=>{
      $('adminSettings').classList.toggle('hidden');
      if($('allowCustomColorsToggle')) $('allowCustomColorsToggle').checked=state.allowCustomColors;
      if($('customerEmailToggle')) $('customerEmailToggle').checked=state.customerConfirmationEmail;
    });
    if($('allowCustomColorsToggle')) $('allowCustomColorsToggle').addEventListener('change',saveFeatureSettings);
    if($('customerEmailToggle')) $('customerEmailToggle').addEventListener('change',saveFeatureSettings);
    if($('saveBusinessSettingsBtn')) $('saveBusinessSettingsBtn').addEventListener('click',saveBusinessConfigFromAdmin);
    $('exportBtn').addEventListener('click',exportBackup);
    $('restoreInput').addEventListener('change',async e=>{try{if(e.target.files?.[0])await restoreBackup(e.target.files[0]);}catch(err){alert('That backup file could not be restored.');}});
  }

  // Customer/project mode owns downward swipes. Prevent iPad pull-to-refresh from
  // tearing the user out of the order flow and back to the Black Flag entry gate.
  let projectTouchStartY=null;
  document.addEventListener('touchstart',e=>{
    if(!document.body.classList.contains('project-mode')) return;
    if(window.scrollY<=0 && e.touches && e.touches.length===1) projectTouchStartY=e.touches[0].clientY;
    else projectTouchStartY=null;
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(projectTouchStartY===null || !document.body.classList.contains('project-mode')) return;
    if(!e.touches || e.touches.length!==1) return;
    const dy=e.touches[0].clientY-projectTouchStartY;
    if(dy>8 && window.scrollY<=0) e.preventDefault();
  },{passive:false});
  document.addEventListener('touchend',()=>{projectTouchStartY=null;},{passive:true});

  window.addEventListener('pagehide',stopCamera);
  window.addEventListener('beforeunload',stopCamera);

  window.renderBlackFlagHome = async function(){
    try{ populateEngineSettings(); }catch(err){ console.warn('populateEngineSettings warning',err); }
    try{ await renderProjectCommand(); }catch(err){ console.warn('renderProjectCommand warning',err); }
    try{ await refreshEngineDiagnostics(); }catch(err){ console.warn('diagnostics warning',err); }
    try{ await renderFleetStats(); }catch(err){ console.warn('fleet stats warning',err); }
  };

  async function init(){
    db=await openDb();
    await loadFeatureSettings();
    await loadBusinessConfig();
    await loadCompanies();
    await loadEngineConfig();
    bindEvents();
    const recovered=recoverDraft();
    state.current=recovered?state.current:'welcome';
    $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===state.current));
    $('customerApp')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
  }
  init().catch(err=>{
    console.error('Secondary app initialization warning',err);
    // Do not block Black Flag entry. The PIN portal is the recovery surface.
    const gate=document.getElementById('blackFlagEntryGate');
    if(gate) gate.classList.remove('hidden');
    document.body.classList.add('boot-locked');
  });
})();

// v2.4.1 security boundary: leaving Engine always destroys Engine authorization.
document.addEventListener('click', (event) => {
  const target = event.target.closest && event.target.closest('#backToAdminBtn,[data-engine-logout],.engine-logout');
  if(target) lockEngineSession();
});


// ===== v2.5 BLACK FLAG PORTAL =====
(function(){
  function byId(id){ return document.getElementById(id); }

  async function requireEngineEntry(){
    const gate=byId('blackFlagEntryGate');
    if(gate){
      gate.classList.remove('hidden');
      document.body.classList.add('bf-entry-open');
      const input=byId('blackFlagEntryPin');
      if(input){ input.value=''; setTimeout(()=>input.focus(),60); }
      const err=byId('blackFlagEntryError'); if(err) err.textContent='';
    }
  }

  function leaveEntry(){
    const gate=byId('blackFlagEntryGate');
    if(gate) gate.classList.add('hidden');
    document.body.classList.remove('bf-entry-open');
  }

  async function unlockFromEntry(){
    const input=byId('blackFlagEntryPin');
    const entered=(input?.value||'').trim();

    // 5615 is guaranteed to work as the current/default Engine PIN for recovery.
    // If a configured PIN exists, it is accepted too.
    let configured='5615';
    try{
      if(window.BlackFlagAuth) configured=await window.BlackFlagAuth.expectedPin();
    }catch(_){ configured='5615'; }

    const valid = entered==='5615' || entered===String(configured);
    if(!valid){
      const err=byId('blackFlagEntryError');
      if(err) err.textContent='Incorrect Engine PIN.';
      if(input) input.select();
      return;
    }

    if(window.BlackFlagAuth) window.BlackFlagAuth.unlock();
    if(input) input.value='';
    leaveEntry();
    document.body.classList.remove('boot-locked','project-mode');
    document.body.classList.add('engine-mode');

    const customer=byId('customerApp'); if(customer) customer.classList.add('hidden');
    const admin=byId('adminPanel'); if(admin) admin.classList.add('hidden');
    const engine=byId('enginePanel'); if(engine) engine.classList.remove('hidden');

    // Render through the normal engine routines when available.
    try{
      if(typeof window.renderBlackFlagHome==='function') await window.renderBlackFlagHome();
    }catch(err){ console.warn('Engine home render warning',err); }

    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  function openCompanyApp(){
    lockEngineSession();
    leaveEntry();
    document.body.classList.remove('engine-mode');
    const engine=byId('enginePanel'); if(engine) engine.classList.add('hidden');
    const admin=byId('adminPanel'); if(admin) admin.classList.add('hidden');
    const customer=byId('customerApp'); if(customer) customer.classList.remove('hidden');
    if(typeof setScreen==='function') setScreen('welcome');
  }

  function openCompanyAdminGate(){
    lockEngineSession();
    leaveEntry();
    document.body.classList.remove('engine-mode');
    const engine=byId('enginePanel'); if(engine) engine.classList.add('hidden');
    const customer=byId('customerApp'); if(customer) customer.classList.remove('hidden');
    // Re-use the existing 4353 admin PIN gate.
    const adminBtn=byId('adminBtn');
    if(adminBtn) adminBtn.click();
  }

  function lockAndReturnToEntry(){
    lockEngineSession();
    document.body.classList.remove('engine-mode','project-mode');
    document.body.classList.add('boot-locked');
    const engine=byId('enginePanel'); if(engine) engine.classList.add('hidden');
    const customer=byId('customerApp'); if(customer) customer.classList.add('hidden');
    const admin=byId('adminPanel'); if(admin) admin.classList.add('hidden');
    requireEngineEntry();
  }

  function bindBlackFlagPortal(){
    if(window.__blackFlagPortalBound) return;
    window.__blackFlagPortalBound=true;

    const unlock=byId('blackFlagEntryUnlock');
    const pin=byId('blackFlagEntryPin');
    const company=byId('openCompanyAppBtn');
    const admin=byId('openAdminFromEntryBtn');
    const engineCompany=byId('engineCompanyAppBtn');
    const logout=byId('engineLogoutBtn');

    if(unlock) unlock.addEventListener('click',unlockFromEntry);
    if(pin) pin.addEventListener('keydown',e=>{if(e.key==='Enter') unlockFromEntry();});
    if(company) company.addEventListener('click',openCompanyApp);
    if(admin) admin.addEventListener('click',openCompanyAdminGate);
    if(engineCompany) engineCompany.addEventListener('click',openCompanyApp);
    if(logout) logout.addEventListener('click',lockAndReturnToEntry);

    // Engine portal is always the first screen after a fresh page load.
        requireEngineEntry();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindBlackFlagPortal);
  else bindBlackFlagPortal();

  // Any explicit back/exit from Engine locks the Engine.
  document.addEventListener('click',e=>{
    const t=e.target.closest && e.target.closest('#backToAdminBtn,[data-engine-logout],.engine-logout');
    if(!t) return;
    lockEngineSession();
  });
})();
