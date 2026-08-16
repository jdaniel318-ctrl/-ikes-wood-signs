(() => {
  const DB_NAME = 'ikesWoodSignsV1';
  const DB_VERSION = 1;
  const STORE_ORDERS = 'orders';
  const STORE_SETTINGS = 'settings';
  const screenOrder = ['welcome','price','photo','orientation','wording','font','fill','preview','customer','review','done'];

  const state = {
    current: 'welcome', price: 65, photoData: '', orientation: 'Horizontal',
    topSide: 'Top of photo', wording: 'Smoke Hole', font: 'B', fill: 'Black',
    contactPreference: 'Text', customerName: '', customerPhone: '',
    customerEmail: '', currentOrderId: ''
  };

  let db = null;
  let storageReady = false;
  let cameraStream = null;
  let eventsBound = false;
  const $ = id => document.getElementById(id);
  const $$ = sel => [...document.querySelectorAll(sel)];

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
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
      req.onerror=()=>reject(req.error || new Error('IndexedDB open failed'));
      req.onblocked=()=>reject(new Error('IndexedDB open blocked'));
    });
  }

  function requireDb(){
    if(!db || !storageReady) throw new Error('Local order storage is unavailable.');
    return db;
  }
  function tx(store,mode='readonly'){ return requireDb().transaction(store,mode).objectStore(store); }
  function reqToPromise(req){ return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); }
  async function put(store,value){ return reqToPromise(tx(store,'readwrite').put(value)); }
  async function getAll(store){ return reqToPromise(tx(store).getAll()); }
  async function getSetting(key){ return reqToPromise(tx(STORE_SETTINGS).get(key)); }

  function setScreen(name){
    if(!screenOrder.includes(name)) return;
    if(state.current==='photo' && name!=='photo') stopCamera();
    state.current=name;
    $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
    const index=screenOrder.indexOf(name);
    if($('progressBar')) $('progressBar').style.width=`${Math.max(1,(index+1)/screenOrder.length*100)}%`;
    if($('stepLabel')) $('stepLabel').textContent=name==='done'?'Complete':`Step ${index+1} of ${screenOrder.length-1}`;
    if($('backBtn')) $('backBtn').style.visibility=['welcome','done'].includes(name)?'hidden':'visible';
    updateUi();
  }

  function selectButtons(containerId, attr, value){
    const box=$(containerId); if(!box) return;
    [...box.querySelectorAll(`[${attr}]`)].forEach(b=>b.classList.toggle('selected',b.getAttribute(attr)===String(value)));
  }
  function fillColor(){
    if(state.fill==='White') return '#ffffff';
    if(state.fill==='Natural') return '#704426';
    if(state.fill==='Other') return '#202020';
    return '#111111';
  }
  function applyPreview(){
    $$('[data-preview-img]').forEach(img=>{
      const card=img.closest('.preview-card');
      if(state.photoData){img.src=state.photoData;card?.classList.add('has-photo');}
      else{img.removeAttribute('src');card?.classList.remove('has-photo');}
    });
    $$('[data-preview-text]').forEach(el=>{
      el.textContent=state.wording || 'Your Sign';
      el.classList.remove('style-a','style-b','style-c');
      el.classList.add(`style-${state.font.toLowerCase()}`);
      el.style.color=fillColor();
    });
    $$('[data-font-sample]').forEach(el=>el.textContent=state.wording||'Your Sign');
    if($('previewPrice')) $('previewPrice').textContent=`Your $${state.price} Ike's Wood Sign`;
  }
  function updateUi(){
    selectButtons('priceChoices','data-price',state.price);
    selectButtons('orientationChoices','data-orientation',state.orientation);
    selectButtons('fontChoices','data-font',state.font);
    selectButtons('fillChoices','data-fill',state.fill);
    selectButtons('contactChoices','data-contact',state.contactPreference);
    if($('wordingInput')) $('wordingInput').value=state.wording;
    if($('charCount')) $('charCount').textContent=`${state.wording.length} character${state.wording.length===1?'':'s'}`;
    if($('topSide')) $('topSide').value=state.topSide;
    applyPreview();
    if(state.photoData){
      if($('woodPhoto')) $('woodPhoto').src=state.photoData;
      $('photoFrame')?.classList.add('has-photo'); $('photoFrame')?.classList.remove('hidden');
      $('photoReviewControls')?.classList.remove('hidden'); $('cameraPanel')?.classList.add('hidden');
      $('cameraControls')?.classList.add('hidden');
    }else{
      $('photoFrame')?.classList.remove('has-photo'); $('photoFrame')?.classList.add('hidden');
      $('photoReviewControls')?.classList.add('hidden'); $('cameraPanel')?.classList.remove('hidden');
      $('cameraControls')?.classList.remove('hidden');
    }
    if(state.current==='review') renderSummary();
  }
  function bindChoice(containerId, attr, key, transform=v=>v){
    const el=$(containerId); if(!el) return;
    el.addEventListener('click',e=>{
      const b=e.target.closest(`[${attr}]`); if(!b) return;
      state[key]=transform(b.getAttribute(attr)); updateUi();
    });
  }
  function validateCustomer(){
    const n=$('customerName')?.value.trim()||'', p=$('customerPhone')?.value.trim()||'', e=$('customerEmail')?.value.trim()||'';
    if(!n||!p||!e){if($('customerError')) $('customerError').textContent='Please enter name, cell phone number, and email address.';return false;}
    if(!/^\S+@\S+\.\S+$/.test(e)){if($('customerError')) $('customerError').textContent='Please enter a valid email address.';return false;}
    state.customerName=n;state.customerPhone=p;state.customerEmail=e;if($('customerError')) $('customerError').textContent='';return true;
  }
  function renderSummary(){
    const rows=[['Exact wording',state.wording],['Wood',`$${state.price}`],['Orientation',state.orientation],['Top marker',state.topSide],['Style',state.font],['Fill',state.fill],['Name',state.customerName],['Cell',state.customerPhone],['Email',state.customerEmail],['Contact by',state.contactPreference]];
    if($('orderSummary')) $('orderSummary').innerHTML=rows.map(([k,v])=>`<div class="summary-row"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');
  }
  function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
  function newOrderId(){const d=new Date();const y=d.getFullYear().toString().slice(-2),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `IKE-${y}${m}${day}-${String(Date.now()).slice(-5)}`;}

  async function saveOrder(){
    const id=newOrderId();
    const order={id,createdAt:new Date().toISOString(),status:'New',price:state.price,photoData:state.photoData,orientation:state.orientation,topSide:state.topSide,wording:state.wording,font:state.font,fill:state.fill,contactPreference:state.contactPreference,customerName:state.customerName,customerPhone:state.customerPhone,customerEmail:state.customerEmail,approved:true};
    await put(STORE_ORDERS,order); state.currentOrderId=id; if($('doneOrderId')) $('doneOrderId').textContent=id; return order;
  }
  function resetOrder(){
    Object.assign(state,{current:'welcome',price:65,photoData:'',orientation:'Horizontal',topSide:'Top of photo',wording:'Smoke Hole',font:'B',fill:'Black',contactPreference:'Text',customerName:'',customerPhone:'',customerEmail:'',currentOrderId:''});
    ['customerName','customerPhone','customerEmail'].forEach(id=>{if($(id)) $(id).value='';});
    if($('approvalCheck')) $('approvalCheck').checked=false; setScreen('welcome');
  }
  function emailBody(order){
    return `Ike's Wood Signs Order\n\nOrder: ${order.id}\nCustomer: ${order.customerName}\nCell: ${order.customerPhone}\nEmail: ${order.customerEmail}\nContact preference: ${order.contactPreference}\n\nWording: ${order.wording}\nPrice: $${order.price}\nOrientation: ${order.orientation}\nTop: ${order.topSide}\nStyle: ${order.font}\nFill: ${order.fill}\nStatus: ${order.status}\n\nThe full order, including the wood photo, remains stored on the trailer iPad.`;
  }
  async function prepareEmail(order){
    let recipients='';
    try{ const setting=await getSetting('adminEmails'); recipients=setting?.value?.trim()||''; }catch(e){}
    const subject=encodeURIComponent(`Ike's Wood Signs ${order.id} - ${order.wording}`);
    const body=encodeURIComponent(emailBody(order));
    location.href=`mailto:${encodeURIComponent(recipients).replace(/%2C/g,',')}?subject=${subject}&body=${body}`;
  }
  async function renderAdmin(){
    const list=$('orderList'); if(!list) return;
    if(!storageReady){list.innerHTML='<div class="empty">Local order storage is unavailable in this browser session.</div>';return;}
    const orders=(await getAll(STORE_ORDERS)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    if(!orders.length){list.innerHTML='<div class="empty">No saved orders yet.</div>';return;}
    list.innerHTML=orders.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-card-head"><div><h3>${escapeHtml(o.id)}</h3><div class="helper">${new Date(o.createdAt).toLocaleString()}</div></div><strong>$${o.price}</strong></div><div class="summary-row"><span>Sign</span><strong>${escapeHtml(o.wording)}</strong></div><div class="summary-row"><span>Customer</span><strong>${escapeHtml(o.customerName)}</strong></div><div class="summary-row"><span>Cell</span><strong>${escapeHtml(o.customerPhone)}</strong></div><div class="summary-row"><span>Email</span><strong>${escapeHtml(o.customerEmail)}</strong></div>${o.photoData?`<img src="${o.photoData}" alt="Wood blank for ${escapeHtml(o.id)}" class="thumb">`:''}<label>Status<select class="status-select" data-status><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='In Production'?'selected':''}>In Production</option><option ${o.status==='Ready'?'selected':''}>Ready</option><option ${o.status==='Picked Up'?'selected':''}>Picked Up</option></select></label><div class="order-actions"><button class="secondary-btn small" data-email>PREPARE EMAIL</button></div></article>`).join('');
    list.querySelectorAll('[data-status]').forEach(sel=>sel.addEventListener('change',async e=>{const card=e.target.closest('[data-id]');const orders=await getAll(STORE_ORDERS);const o=orders.find(x=>x.id===card.dataset.id);if(o){o.status=e.target.value;await put(STORE_ORDERS,o);}}));
    list.querySelectorAll('[data-email]').forEach(btn=>btn.addEventListener('click',async e=>{const id=e.target.closest('[data-id]').dataset.id;const orders=await getAll(STORE_ORDERS);const o=orders.find(x=>x.id===id);if(o)prepareEmail(o);}));
  }
  async function exportBackup(){
    const data={version:1,exportedAt:new Date().toISOString(),orders:await getAll(STORE_ORDERS),settings:await getAll(STORE_SETTINGS)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ikes-wood-signs-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function restoreBackup(file){
    const text=await file.text();const data=JSON.parse(text);if(!Array.isArray(data.orders)) throw new Error('Invalid backup');
    for(const o of data.orders) await put(STORE_ORDERS,o);for(const s of (data.settings||[])) await put(STORE_SETTINGS,s);await renderAdmin();
  }
  function cameraSupported(){return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);}
  async function startCamera(){
    if($('photoError')) $('photoError').textContent='';
    if($('photoHelp')) $('photoHelp').textContent='Starting camera…';
    if(!cameraSupported()){
      if($('photoError')) $('photoError').textContent='This viewing app does not provide direct camera access. Open the site in Safari or use the saved-photo option for testing.';
      if($('photoHelp')) $('photoHelp').textContent='Direct camera access requires a browser environment that supports the iPad camera.'; return;
    }
    try{
      stopCamera();
      cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
      const video=$('cameraVideo'); video.srcObject=cameraStream; await video.play();
      $('cameraIdle')?.classList.add('hidden'); video.classList.add('active');
      $('startCameraBtn')?.classList.add('hidden'); $('capturePhotoBtn')?.classList.remove('hidden'); $('cancelCameraBtn')?.classList.remove('hidden');
      if($('photoHelp')) $('photoHelp').textContent='Center the entire wood blank in the frame, then tap TAKE PICTURE.';
    }catch(err){
      console.error('Camera start failed',err); stopCamera();
      const insecure=!window.isSecureContext;
      if($('photoError')) $('photoError').textContent=insecure?'Camera access is blocked because this page is not running in a secure browser context.':'The iPad camera could not be opened here. Camera permission may be blocked by the app displaying this page.';
      if($('photoHelp')) $('photoHelp').textContent='The camera stays inside the ordering step when the browser allows camera access.';
    }
  }
  function stopCamera(){
    if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
    const video=$('cameraVideo'); if(video){video.pause();video.srcObject=null;video.classList.remove('active');}
    $('cameraIdle')?.classList.remove('hidden'); $('startCameraBtn')?.classList.remove('hidden');
    $('capturePhotoBtn')?.classList.add('hidden'); $('cancelCameraBtn')?.classList.add('hidden');
  }
  function captureCameraPhoto(){
    const video=$('cameraVideo'); if(!video?.videoWidth||!video.videoHeight){if($('photoError')) $('photoError').textContent='The camera is not ready yet. Please try again.';return;}
    try{
      const maxSide=1600, scale=Math.min(1,maxSide/Math.max(video.videoWidth,video.videoHeight));
      const w=Math.max(1,Math.round(video.videoWidth*scale)), h=Math.max(1,Math.round(video.videoHeight*scale));
      const canvas=$('cameraCanvas'); canvas.width=w; canvas.height=h; const ctx=canvas.getContext('2d',{alpha:false}); ctx.drawImage(video,0,0,w,h);
      state.photoData=canvas.toDataURL('image/jpeg',0.78); stopCamera();
      if($('photoHelp')) $('photoHelp').textContent='Picture captured. Review it below before continuing.'; updateUi();
    }catch(err){console.error('Camera capture failed',err);if($('photoError')) $('photoError').textContent='The picture could not be captured. Please try again.';}
  }
  function resizePhoto(file){
    return new Promise((resolve,reject)=>{
      if(!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'));
      const objectUrl=URL.createObjectURL(file), img=new Image();
      img.onload=()=>{try{const maxSide=1600,w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h)throw new Error('Image has no dimensions');const scale=Math.min(1,maxSide/Math.max(w,h)),outW=Math.max(1,Math.round(w*scale)),outH=Math.max(1,Math.round(h*scale)),canvas=document.createElement('canvas');canvas.width=outW;canvas.height=outH;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(img,0,0,outW,outH);const data=canvas.toDataURL('image/jpeg',0.78);URL.revokeObjectURL(objectUrl);resolve(data);}catch(err){URL.revokeObjectURL(objectUrl);reject(err);}};
      img.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error('Image decode failed'));}; img.src=objectUrl;
    });
  }

  function bindEvents(){
    if(eventsBound) return;
    eventsBound=true;
    $$('.next').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.next)));
    $$('.goto').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.goto)));
    $('backBtn')?.addEventListener('click',()=>{const i=screenOrder.indexOf(state.current);if(i>0)setScreen(screenOrder[i-1]);});
    bindChoice('priceChoices','data-price','price',Number); bindChoice('orientationChoices','data-orientation','orientation'); bindChoice('fontChoices','data-font','font'); bindChoice('fillChoices','data-fill','fill'); bindChoice('contactChoices','data-contact','contactPreference');
    $('topSide')?.addEventListener('change',e=>state.topSide=e.target.value);
    $('wordingInput')?.addEventListener('input',e=>{state.wording=e.target.value;if($('charCount'))$('charCount').textContent=`${state.wording.length} character${state.wording.length===1?'':'s'}`;applyPreview();});
    $('startCameraBtn')?.addEventListener('click',startCamera); $('capturePhotoBtn')?.addEventListener('click',captureCameraPhoto);
    $('cancelCameraBtn')?.addEventListener('click',()=>{stopCamera();if($('photoHelp'))$('photoHelp').textContent='Camera canceled. Tap START CAMERA when you are ready.';});
    $('photoInput')?.addEventListener('change',async e=>{const input=e.target,f=input.files?.[0];if(!f)return;if($('photoError'))$('photoError').textContent='';if($('photoHelp'))$('photoHelp').textContent='Preparing your picture…';try{state.photoData=await resizePhoto(f);stopCamera();updateUi();if($('photoHelp'))$('photoHelp').textContent='Picture added. Review it before continuing.';}catch(err){console.error('Photo processing failed',err);if($('photoError'))$('photoError').textContent='That picture could not be added. Please try again.';}finally{input.value='';}});
    $('retakeBtn')?.addEventListener('click',()=>{state.photoData='';updateUi();startCamera();});
    $('reviewBtn')?.addEventListener('click',()=>{if(validateCustomer())setScreen('review');});
    $('approveBtn')?.addEventListener('click',async()=>{if(!$('approvalCheck')?.checked){if($('approvalError'))$('approvalError').textContent='Please check the approval box first.';return;}if($('approvalError'))$('approvalError').textContent='';try{await saveOrder();setScreen('done');}catch(err){console.error('Order save failed',err);if($('approvalError'))$('approvalError').textContent='This browser could not save the order locally. Do not leave this screen; reopen the customer experience in Safari and try again.';}});
    $('newOrderBtn')?.addEventListener('click',resetOrder);
    $('emailOrderBtn')?.addEventListener('click',async()=>{try{const orders=await getAll(STORE_ORDERS);const o=orders.find(x=>x.id===state.currentOrderId);if(o)prepareEmail(o);}catch(err){console.error(err);}});
    $('adminBtn')?.addEventListener('click',async()=>{$('customerApp')?.classList.add('hidden');$('adminPanel')?.classList.remove('hidden');try{const s=await getSetting('adminEmails');if($('adminEmails'))$('adminEmails').value=s?.value||'';}catch(e){}try{await renderAdmin();}catch(e){console.error(e);}});
    $('closeAdminBtn')?.addEventListener('click',()=>{$('adminPanel')?.classList.add('hidden');$('customerApp')?.classList.remove('hidden');});
    $('settingsBtn')?.addEventListener('click',()=>$('adminSettings')?.classList.toggle('hidden'));
    $('saveSettingsBtn')?.addEventListener('click',async()=>{try{await put(STORE_SETTINGS,{key:'adminEmails',value:$('adminEmails')?.value.trim()||''});$('adminSettings')?.classList.add('hidden');}catch(e){alert('Local settings storage is unavailable.');}});
    $('exportBtn')?.addEventListener('click',async()=>{try{await exportBackup();}catch(e){alert('Local order storage is unavailable.');}});
    $('restoreInput')?.addEventListener('change',async e=>{try{if(e.target.files?.[0])await restoreBackup(e.target.files[0]);}catch(err){alert('That backup file could not be restored.');}});
  }

  window.addEventListener('pagehide',stopCamera);
  window.addEventListener('beforeunload',stopCamera);

  async function init(){
    // Critical repair: make the customer UI interactive BEFORE opening IndexedDB.
    // A storage failure can no longer leave START YOUR SIGN dead.
    bindEvents();
    setScreen('welcome');

    try{
      db=await openDb();
      storageReady=true;
    }catch(err){
      storageReady=false;
      console.error('Local storage startup failed; customer navigation remains available.',err);
    }

    if('serviceWorker' in navigator && location.protocol.startsWith('http')){
      navigator.serviceWorker.register('sw.js?v=start-repair-1').catch(err=>console.warn('Service worker registration failed',err));
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
