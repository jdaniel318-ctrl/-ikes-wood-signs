(() => {
  const DB_NAME = 'ikesWoodSignsV1';
  const DB_VERSION = 1;
  const STORE_ORDERS = 'orders';
  const STORE_SETTINGS = 'settings';
  const LOCAL_ORDERS_KEY = 'ikesWoodSignsOrdersBackupV15';
  const DEFAULT_ADMIN_PIN = '4353';
  const DEFAULT_ENGINE_PIN = '5615';
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
    if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Workshop Engine';
    if($('schemaVersionSetting')) $('schemaVersionSetting').value=Number(engineConfig.schemaVersion||2);
    if($('engineStatusesSetting')) $('engineStatusesSetting').value=(businessConfig.orderStatuses||DEFAULT_BUSINESS_CONFIG.orderStatuses).join(', ');
  }

  async function openEnginePanel(){
    $('adminPanel').classList.add('hidden');
    $('enginePanel').classList.remove('hidden');
    populateEngineSettings();
    await refreshEngineDiagnostics();
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
    $('previewPrice').textContent=`Your $${state.price} Ike's Wood Sign`;
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
      ['Exact wording',state.wording],['Wood',`$${state.price}`],['Orientation',state.orientation],['Top marker',state.topSide],['Style',state.font],['Fill',state.fill],
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
    return `${businessConfig.orderPrefix||'IKE'}-${y}${m}${day}-${suffix}`;
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
    const order={schemaVersion:Number(engineConfig.schemaVersion||2),business:{name:businessConfig.businessName,orderPrefix:businessConfig.orderPrefix},id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'New',price:state.price,photoData:state.photoData,approvedPreviewData,orientation:state.orientation,topSide:state.topSide,wording:state.wording,font:state.font,fill:state.fill,customColor:state.customColor,contactPreference:state.contactPreference,customerName:state.customerName,customerPhone:state.customerPhone,customerEmail:state.customerEmail,approved:true};
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
    return `Ike's Wood Signs Order\n\nOrder: ${order.id}\nCustomer: ${order.customerName}\nCell: ${order.customerPhone}\nEmail: ${order.customerEmail}\nContact preference: ${order.contactPreference}\n\nWording: ${order.wording}\nPrice: $${order.price}\nOrientation: ${order.orientation}\nTop: ${order.topSide}\nStyle: ${order.font}\nFill: ${order.fill}\nStatus: ${order.status}\n\nThe full order, including the wood photo, remains stored on the trailer iPad.`;
  }

  async function prepareEmail(order){
    const setting=await getSetting('adminEmails');
    const recipients=setting?.value?.trim()||ORDER_EMAIL;
    const subject=encodeURIComponent(`Ike's Wood Signs ${order.id} - ${order.wording}`);
    const body=encodeURIComponent(emailBody(order));
    location.href=`mailto:${encodeURIComponent(recipients).replace(/%2C/g,',')}?subject=${subject}&body=${body}`;
  }

  async function updateOrderStatus(id,status){
    const orders=await getMergedOrders(),o=orders.find(x=>x.id===id);if(!o)return;
    o.status=status;o.updatedAt=new Date().toISOString();backupOrderLocally(o);try{await put(STORE_ORDERS,o)}catch(_){}await renderAdmin();
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
      $('enginePinGate').classList.add('hidden');
      document.body.classList.remove('modal-open');
      await openEnginePanel();
    });
    $('closeEngineBtn').addEventListener('click',()=>{
      $('enginePanel').classList.add('hidden');
      $('adminPanel').classList.remove('hidden');
      window.scrollTo({top:0,left:0,behavior:'instant'});
    });

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

  window.addEventListener('pagehide',stopCamera);
  window.addEventListener('beforeunload',stopCamera);

  async function init(){
    db=await openDb();
    await loadFeatureSettings();
    await loadBusinessConfig();
    await loadEngineConfig();
    bindEvents();
    const recovered=recoverDraft();
    setScreen(recovered?state.current:'welcome');
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
  }
  init().catch(err=>{console.error(err);alert('The app could not start. Please reload the page.');});
})();
