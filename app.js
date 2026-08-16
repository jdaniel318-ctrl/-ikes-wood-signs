(() => {
  const $ = window.$ || ((id) => document.getElementById(id));
  const $$ = window.$$ || ((sel) => Array.from(document.querySelectorAll(sel)));
  window.$ = $;
  window.$$ = $$;
  window.__darkSkyBootStage = 'app-module-entered';
  const DB_NAME = 'blackFlagPlatformV1';
  const DB_VERSION = 2;
  const STORE_ORDERS = 'orders';
  const STORE_SETTINGS = 'settings';
  const STORE_PROJECTS = 'projects';
  const LOCAL_ORDERS_KEY = 'blackFlagOrdersBackupV1';
  const LEGACY_DB_NAMES = ['ikesWoodSignsV1'];
  const LEGACY_LOCAL_ORDERS_KEYS = ['ikesWoodSignsOrdersBackupV15'];
  const PROJECT_REGISTRY_BACKUP_KEY = 'blackFlagProjectRegistryBackupV1';
  const COMMISSION_JOURNAL_KEY = 'blackFlagCommissionJournalV1';
  const BUILD_VERSION = '4.2.1';
  // Sounding Line: global DOM helpers are bootstrapped in <head>; lexical aliases are bound before all app declarations.
  const FLEET_REGISTRY_SCHEMA_VERSION = 5;
  const FLEET_REGISTRY_SCHEMA_KEY = 'fleetRegistrySchemaVersion';
  const LEGACY_IKE_PROJECT_ID = 'ikes-wood-signs';
  const LEGACY_GRIZZLE_PROJECT_ID = 'grizzle-bear';
  const CANONICAL_GRIZZLY_PROJECT_ID = 'grizzly-bear';
  const PROJECT_ID_ALIASES = Object.freeze({[LEGACY_GRIZZLE_PROJECT_ID]:CANONICAL_GRIZZLY_PROJECT_ID});
  function canonicalProjectId(id){ return PROJECT_ID_ALIASES[String(id||'')]||String(id||''); }
  const DEFAULT_ADMIN_PIN = '4353';
  const DEFAULT_ENGINE_PIN = '5615';
  const DEFAULT_COMPANIES = [
    {
      id:'ikes-wood-signs',
      projectCode:'IKE',
      name:"Ike's Wood Signs",
      branding:{
        businessName:"Ike's Wood Signs",
        adminLabel:"IKE'S WOOD SIGNS",
        primary:'#f4d238',
        accent:'#1373b8',
        subtitle:'Self-Serve Sign Ordering'
      },
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
      permissions:{ordersView:true,ordersUpdate:true,ledgerView:false,costEntry:false,profitView:false,projectOptionsView:false},
      customerHistory:{adminVisible:false},
      notifications:{customerConfirmationEmail:false},
      products:[{id:'custom-wood-sign',name:'Custom Wood Sign',published:true,characterLimit:null}]
    },
    {
      id:'mugshot-after-dark',
      projectCode:'MUG',
      name:'Mugshot After Dark',
      tagline:'Classy mugs. Questionable messages.',
      type:'custom_mugs',
      branding:{
        businessName:'Mugshot After Dark',
        adminLabel:'MUGSHOT AFTER DARK',
        primary:'#1c1c1f',
        accent:'#9b2451',
        subtitle:'Custom Mug Ordering'
      },
      visibility:'engine_only',
      projectTheme:'mugshot-after-dark',
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
    },
    {
      id:'beccas-bloom-shop',
      projectCode:'BBS',
      name:"Becca's Bloom Shop",
      tagline:'Fresh flowers, thoughtfully arranged.',
      type:'custom_flowers',
      branding:{businessName:"Becca's Bloom Shop",adminLabel:"BECCA'S BLOOM SHOP",primary:'#496b4f',accent:'#b85f79',subtitle:'Custom Flower Ordering'},
      visibility:'engine_only',projectTheme:'flowers',status:'future',orderPrefix:'BBS',
      ai:{mode:'off',minConfidence:0.90,requireScaleReference:false},
      customization:{maxCharacters:60,characterLimitStatus:'configured',allowCustomColors:true},
      workflow:['New','In Production','Ready for Pickup','Completed'],
      customerExperience:{photoRequired:true,previewApproval:true},publish:{status:'development'},
      payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},
      permissions:{ordersView:true,ordersUpdate:true,ledgerView:false,costEntry:false,profitView:false,projectOptionsView:false},
      customerHistory:{adminVisible:false},notifications:{customerConfirmationEmail:false},
      products:[{id:'custom-flower-arrangement',name:'Custom Flower Arrangement',published:false,characterLimit:60}]
    }
,
    {
      id:'grizzly-bear',
      projectCode:'GRZ',
      name:'Grizzly Bear',
      tagline:'Outdoor and camping equipment built for the wild.',
      type:'outdoor_camping_equipment',
      branding:{businessName:'Grizzly Bear',adminLabel:'GRIZZLY BEAR',primary:'#4f3b2b',accent:'#b86b32',subtitle:'Outdoor & Camping Equipment'},
      visibility:'engine_only',projectTheme:'universal',status:'future',orderPrefix:'GRZ',
      ai:{mode:'off',minConfidence:0.90,requireScaleReference:false},
      customization:{maxCharacters:null,characterLimitStatus:'unset',allowCustomColors:true},
      workflow:['New','In Production','Ready for Pickup','Completed'],
      customerExperience:{photoRequired:false,previewApproval:false},publish:{status:'development'},
      payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},
      permissions:{ordersView:true,ordersUpdate:true,ledgerView:false,costEntry:false,profitView:false,projectOptionsView:false},
      customerHistory:{adminVisible:false},notifications:{customerConfirmationEmail:false},
      products:[]
    }
  ];

  const PROJECT_CUSTOMER_EXPERIENCES={
    'ikes-wood-signs':{
      businessName:"Ike's Wood Signs",subtitle:'Self-Serve Sign Ordering',
      kicker:'Pick your wood • Design • Preview • Order',orderPrefix:'IKE',
      defaultPrice:65,prices:[45,55,65,90,135],wordingDefault:'Smoke Hole',
      intro:'Pick the piece of wood you love. Ike will guide you through the rest.',
      ribbon:'YOUR WOOD • YOUR WORDS • YOUR SIGN',
      start:'START YOUR SIGN →',
      priceTitle:'How long is the wood you picked?',
      priceCopy:"For now, choose the price posted with that length of wood in the trailer. Ike's current price groups are shown below.",
      priceTrust:'Pick the posted price for the length you chose — Ike will take it from there.',
      photoBadge:'YOUR WOOD',photoTitle:'Take a Picture of Your Wood',
      photoCopy:"Place the entire blank in view. The picture stays with Ike's order and becomes the background for your preview.",
      orientationTitle:'How should your sign face?',
      wordingTitle:'What should your sign say?',fontTitle:'Choose Your Letter Style',fillTitle:'Choose Your Letter Finish',
      customerCopy:'Ike will use this information to let you know when your sign is ready for pickup.',
      doneHeadline:"Your Custom Sign Is In Ike's Hands!",
      doneCopy:"Thank you for trusting Ike's Wood Signs to make something personal for you. We truly appreciate you choosing a small local business.",
      hideIke:false
    },
    'mugshot-after-dark':{
      businessName:'Mugs After Dark',subtitle:'Custom mugs for the night shift.',
      kicker:'Customize • Photograph • Preview • Order',orderPrefix:'MUG',
      defaultPrice:0,prices:[0],wordingDefault:'Your Message',
      intro:'Create a custom mug with your own message and preview it before you order.',
      ribbon:'YOUR MUG • YOUR WORDS • YOUR STYLE',
      start:'START YOUR MUG →',
      priceTitle:'Mug pricing is being configured',
      priceCopy:'This project is in test mode. Final mug pricing will be set in Black Flag before customer launch.',
      priceTrust:'TEST MODE • Final pricing has not been configured yet.',
      photoBadge:'YOUR MUG',photoTitle:'Take a Picture of Your Mug',
      photoCopy:'Place the entire mug in view. The picture stays with this order and becomes the background for your preview.',
      orientationTitle:'How should the mug design face?',
      wordingTitle:'What should your mug say?',fontTitle:'Choose Your Letter Style',fillTitle:'Choose Your Letter Color',
      customerCopy:'Mugs After Dark will use this information to contact you about your order.',
      doneHeadline:'Your Custom Mug Is In The Queue!',
      doneCopy:'Thank you for choosing Mugs After Dark. Your approved mug design and order details have been saved.',
      hideIke:true
    },
    'beccas-bloom-shop':{
      businessName:"Becca's Bloom Shop",subtitle:'Fresh flowers, thoughtfully arranged.',
      kicker:'Choose • Photograph • Personalize • Approve',orderPrefix:'BBS',defaultPrice:0,prices:[0],wordingDefault:'Thinking of You',
      intro:'Create a flower order with your arrangement, personal message, preview, and approval.',
      ribbon:'YOUR FLOWERS • YOUR MESSAGE • YOUR MOMENT',start:'START YOUR FLOWER ORDER →',
      priceTitle:'Flower pricing is being configured',priceCopy:'This project is in test mode. Final flower pricing will be configured in Black Flag.',priceTrust:'TEST MODE • Final pricing has not been configured yet.',
      photoBadge:'YOUR FLOWERS',photoTitle:'Take a Picture of Your Flowers',photoCopy:'Keep the full arrangement in view. This photo stays with this flower order only.',
      orientationTitle:'How should the arrangement be presented?',wordingTitle:'What should the card say?',fontTitle:'Choose Your Letter Style',fillTitle:'Choose Your Letter Color',
      customerCopy:"Becca's Bloom Shop will use this information to contact you about this flower order.",doneHeadline:'Your Flower Order Is In The Queue!',doneCopy:'Your approved flower order and details have been saved.',hideIke:true
    }
  };

  function customerExperienceForProject(p){
    return PROJECT_CUSTOMER_EXPERIENCES[p?.id]||{
      businessName:p?.name||'Custom Project',subtitle:p?.tagline||'Custom Ordering',
      kicker:'Customize • Preview • Approve • Order',orderPrefix:p?.orderPrefix||'ORD',
      defaultPrice:0,prices:[0],wordingDefault:'Your Message',
      intro:p?.tagline||'Build your custom order.',ribbon:'YOUR PRODUCT • YOUR WORDS • YOUR ORDER',
      start:'START YOUR ORDER →',priceTitle:'Choose your product option',
      priceCopy:'Select the configured option for this project.',priceTrust:'',
      photoBadge:'YOUR PRODUCT',photoTitle:'Take a Picture of Your Product',
      photoCopy:'Keep the entire product in view.',orientationTitle:'Choose the orientation',
      wordingTitle:'What should it say?',fontTitle:'Choose Your Letter Style',fillTitle:'Choose Your Color',
      customerCopy:'We will use this information to contact you about your order.',
      doneHeadline:'Your Custom Order Has Been Received!',doneCopy:'Your approved design and order details have been saved.',
      hideIke:true
    };
  }

  let companies=structuredClone(DEFAULT_COMPANIES);
  let activeProjectId = null;
  let engineActiveProjectId = null;
  let marketingActiveGraphicSlot = null;
  const PROJECT_ACTIVITY_KEY='blackFlagProjectActivityV1';
  const PROJECT_LEDGER_KEY='blackFlagProjectLedgersV1';
  const PROJECT_CUSTOMERS_KEY='blackFlagProjectCustomersV1';

  function readCustomerDirectory(){
    try{
      const raw=JSON.parse(localStorage.getItem(PROJECT_CUSTOMERS_KEY)||'{}');
      return raw && typeof raw==='object' ? raw : {};
    }catch(_){ return {}; }
  }

  function writeCustomerDirectory(v){
    localStorage.setItem(PROJECT_CUSTOMERS_KEY,JSON.stringify(v||{}));
  }

  function normalizeCustomerKey(o){
    const email=String(o.customerEmail||'').trim().toLowerCase();
    const phone=String(o.customerPhone||'').replace(/\D/g,'');
    const name=String(o.customerName||'').trim().toLowerCase();
    if(email) return 'email:'+email;
    if(phone) return 'phone:'+phone;
    if(name) return 'name:'+name;
    return '';
  }

  function briefPurchaseDescription(o){
    const parts=[];
    if(o.wording) parts.push(o.wording);
    if(o.business?.name) parts.push(o.business.name);
    return (parts.join(' • ')||'Custom order').slice(0,120);
  }

  function captureCustomerFromOrder(order){
    const projectId=String(order?.projectId||'');
    if(!projectId){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'integrity',action:'customer.capture.blocked',detail:`Unscoped order ${order?.id||'unknown'}`});
      return;
    }
    const p=projectById(projectId);
    if(!p){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId,category:'integrity',action:'customer.capture.blocked',detail:order?.id||'unknown'});
      return;
    }
    const scoped=window.BlackFlagV3Core?.assertProjectScope?.({...order,projectId},projectId);
    if(scoped&&!scoped.ok)return;

    const key=normalizeCustomerKey(order);
    if(!key) return;

    const directory=readCustomerDirectory();
    directory[projectId]=directory[projectId]||{};
    const existing=directory[projectId][key]||{
      projectId,
      namespace:window.BlackFlagV3Core?.namespaceFor?.(projectId)||`bf.project.${projectId}`,
      schemaVersion:3,
      isolation:{projectId,crossProjectAccess:'deny'},
      customerKey:key,
      name:order.customerName||'',
      phone:order.customerPhone||'',
      email:order.customerEmail||'',
      firstOrderDate:order.createdAt||new Date().toISOString(),
      lastOrderDate:order.createdAt||new Date().toISOString(),
      orderCount:0,
      purchases:[]
    };

    existing.projectId=projectId;
    existing.namespace=window.BlackFlagV3Core?.namespaceFor?.(projectId)||`bf.project.${projectId}`;
    existing.schemaVersion=3;
    existing.isolation={projectId,crossProjectAccess:'deny'};
    existing.name=order.customerName||existing.name||'';
    existing.phone=order.customerPhone||existing.phone||'';
    existing.email=order.customerEmail||existing.email||'';
    existing.lastOrderDate=order.createdAt||new Date().toISOString();

    if(!existing.purchases.some(x=>x.orderId===order.id)){
      existing.orderCount=(existing.orderCount||0)+1;
      existing.purchases.unshift({
        orderId:order.id,
        date:order.createdAt||new Date().toISOString(),
        description:briefPurchaseDescription(order),
        amount:Number(order.price)||0
      });
      existing.purchases=existing.purchases.slice(0,50);
    }

    directory[projectId][key]=existing;
    writeCustomerDirectory(directory);
  }

  function rebuildCustomerDirectoryForProject(projectId, orders){
    const p=projectById(projectId);
    const directory=readCustomerDirectory();
    directory[projectId]={};
    writeCustomerDirectory(directory);
    projectScopedOrders(orders||[],projectId).forEach(captureCustomerFromOrder);
  }

  function engineWideCustomerMatches(customerKey){
    if(!customerKey) return [];
    const directory=readCustomerDirectory();
    const matches=[];
    Object.entries(directory).forEach(([projectId,rows])=>{
      const row=rows?.[customerKey];
      if(row) matches.push({projectId,row});
    });
    return matches;
  }



  const PIN_SECURITY_KEY='blackFlagPinSecurityV1';
  function readPinSecurity(){try{return JSON.parse(localStorage.getItem(PIN_SECURITY_KEY)||'{}')}catch(_){return{}}}
  function writePinSecurity(v){localStorage.setItem(PIN_SECURITY_KEY,JSON.stringify(v))}
  function pinSecurityState(key){
    const all=readPinSecurity(), now=Date.now(), row=all[key]||{attempts:[],lockedUntil:0};
    row.attempts=(row.attempts||[]).filter(t=>now-t<=180000);
    if(row.lockedUntil && row.lockedUntil<=now) row.lockedUntil=0;
    all[key]=row;writePinSecurity(all);return row;
  }
  function pinLocked(key){return pinSecurityState(key).lockedUntil>Date.now()}
  function recordBadPin(key){
    const all=readPinSecurity(),now=Date.now(),row=pinSecurityState(key);
    row.attempts.push(now);row.attempts=row.attempts.filter(t=>now-t<=180000);
    if(row.attempts.length>=10){row.lockedUntil=now+300000;row.attempts=[]}
    all[key]=row;writePinSecurity(all);return row;
  }
  function clearPinFailures(key){const all=readPinSecurity();all[key]={attempts:[],lockedUntil:0};writePinSecurity(all)}
  function adminSecurityKey(projectId=activeProjectId){
    return `admin:${projectId||'no-project'}`;
  }
  let pinTimerHandle=null;
  function showPinLock(key,timerId,inputId,buttonId){
    const timer=$(timerId),input=$(inputId),button=$(buttonId);
    const tick=()=>{
      const row=pinSecurityState(key),left=Math.max(0,row.lockedUntil-Date.now());
      if(left<=0){timer?.classList.add('hidden');if(input)input.disabled=false;if(button)button.disabled=false;clearInterval(pinTimerHandle);pinTimerHandle=null;return}
      const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);
      if(timer){timer.textContent=`Locked for ${m}:${String(s).padStart(2,'0')}`;timer.classList.remove('hidden')}
      if(input)input.disabled=true;if(button)button.disabled=true;
    };
    if(pinTimerHandle)clearInterval(pinTimerHandle);tick();pinTimerHandle=setInterval(tick,1000);
  }
  function activeProject(){return activeProjectId ? projectById(activeProjectId) : null}

  function projects(){ return companies; }
  function projectById(id){ const canonical=canonicalProjectId(id); return companies.find(p=>p.id===canonical); }
  window.blackFlagV4ProjectById=(id)=>projectById(id);
  window.blackFlagV4Projects=()=>companies.map(p=>structuredClone(p));

  const OWNER_CAPABILITIES=[
    'orders','customers','products','pricing','branding','kiosks','deployments','staff','reporting','notifications'
  ];

  function ensureProjectGovernance(p){
    if(!p || typeof p!=='object') return p;
    p.governance=p.governance&&typeof p.governance==='object'?p.governance:{};

    // v2.9.66 migration: "refused" meant business relationship refusal,
    // never data deletion. Preserve the decision while clarifying its meaning.
    if(p.governance.platformStatus==='refused') p.governance.platformStatus='relationship_ended';
    if(!['approved','suspended','relationship_ended'].includes(p.governance.platformStatus)){
      p.governance.platformStatus='approved';
    }

    p.governance.updatedAt=p.governance.updatedAt||new Date().toISOString();
    p.governance.history=Array.isArray(p.governance.history)?p.governance.history:[];

    p.ownerAccess=p.ownerAccess&&typeof p.ownerAccess==='object'?p.ownerAccess:{};
    p.ownerAccess.status=['not_claimed','invited','active'].includes(p.ownerAccess.status)?p.ownerAccess.status:'not_claimed';
    p.ownerAccess.ownerName=p.ownerAccess.ownerName||'';
    p.ownerAccess.ownerEmail=p.ownerAccess.ownerEmail||'';
    p.ownerAccess.capabilities=Array.isArray(p.ownerAccess.capabilities)&&p.ownerAccess.capabilities.length
      ? p.ownerAccess.capabilities.filter(x=>OWNER_CAPABILITIES.includes(x))
      : [...OWNER_CAPABILITIES];
    p.ownerAccess.staff=Array.isArray(p.ownerAccess.staff)?p.ownerAccess.staff:[];
    p.ownerAccess.invitation=p.ownerAccess.invitation&&typeof p.ownerAccess.invitation==='object'
      ? p.ownerAccess.invitation
      : null;
    p.ownerAccess.credential=p.ownerAccess.credential&&typeof p.ownerAccess.credential==='object'
      ? p.ownerAccess.credential
      : null;
    return p;
  }

  function platformStatus(p){ return ensureProjectGovernance(p).governance.platformStatus; }
  function platformStatusLabel(p){
    const s=platformStatus(p);
    if(s==='suspended') return 'SUSPENDED';
    if(s==='relationship_ended') return 'RELATIONSHIP ENDED';
    return 'APPROVED';
  }
  function ownerAccessLabel(p){
    const s=ensureProjectGovernance(p).ownerAccess.status;
    if(s==='active') return 'OWNER ACTIVE';
    if(s==='invited') return 'OWNER INVITED';
    return 'OWNER NOT CLAIMED';
  }
  const OWNER_SESSION_KEY='blackFlagOwnerSessionV1';
  let ownerPreviewReturnState=null;
  let ownerPreviewOpening=false;

  function ownerInviteStatus(p){
    ensureProjectGovernance(p);
    const inv=p.ownerAccess.invitation;
    if(!inv) return 'none';
    if(inv.revokedAt) return 'revoked';
    if(inv.claimedAt) return 'claimed';
    if(Number(inv.expiresAt||0)<=Date.now()) return 'expired';
    return 'active';
  }

  function purgeExpiredOwnerInvitation(p){
    ensureProjectGovernance(p);
    const inv=p.ownerAccess.invitation;
    if(!inv)return false;
    if(inv.claimedAt||inv.revokedAt)return false;
    if(Number(inv.expiresAt||0)>Date.now())return false;

    // Expired claim credentials are not retained.
    // Owner identity/capabilities remain because those are project ownership data,
    // not invitation credentials.
    p.ownerAccess.invitation=null;
    if(p.ownerAccess.status==='invited')p.ownerAccess.status='not_claimed';
    p.ownerAccess.updatedAt=new Date().toISOString();
    logActivity(p.id,'Expired owner invitation purged',p.ownerAccess.ownerEmail||'');
    return true;
  }

  async function purgeAllExpiredOwnerInvitations(){
    let changed=false;
    companies.forEach(p=>{if(purgeExpiredOwnerInvitation(p))changed=true;});
    if(changed)await saveCompanies();
    return changed;
  }

  function randomOwnerToken(){
    const bytes=new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function sha256Hex(value){
    if(!globalThis.crypto?.subtle) throw new Error('Secure invitation hashing requires HTTPS or localhost.');
    const data=new TextEncoder().encode(String(value||''));
    const digest=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }

  function ownerClaimLink(projectId,token){
    const base=location.href.split('#')[0];
    return `${base}#owner-claim=${encodeURIComponent(projectId+'.'+token)}`;
  }

  function ownerSession(){
    try{return JSON.parse(sessionStorage.getItem(OWNER_SESSION_KEY)||'null')}catch(_){return null}
  }
  function saveOwnerSession(projectId){
    const session={
      projectId,
      sessionId:'OWN-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),
      startedAt:new Date().toISOString()
    };
    sessionStorage.setItem(OWNER_SESSION_KEY,JSON.stringify(session));
    window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId,category:'session',action:'owner.session.started',detail:session.sessionId});
    return session;
  }
  function clearOwnerSession(){
    const s=ownerSession();
    if(s)window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId:s.projectId,category:'session',action:'owner.session.ended',detail:s.sessionId||''});
    sessionStorage.removeItem(OWNER_SESSION_KEY);
  }

  const OWNER_TEST_LOGIN={login:'joe',password:'4353'};

  function normalizeOwnerLogin(value){
    return String(value||'').trim().toLowerCase();
  }

  function ownerLoginLink(projectId){
    const base=location.href.split('#')[0];
    return `${base}#owner-login=${encodeURIComponent(projectId)}`;
  }

  async function createOwnerCredential(p,login,password,{testMode=false}={}){
    ensureProjectGovernance(p);
    const cleanLogin=normalizeOwnerLogin(login);
    const cleanPassword=String(password||'');
    if(!cleanLogin)return {ok:false,error:'A login is required.'};
    if(!testMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanLogin)){
      return {ok:false,error:'A valid email address is required.'};
    }
    if(!testMode && (cleanPassword.length<8 || !/[A-Za-z]/.test(cleanPassword) || !/\d/.test(cleanPassword))){
      return {ok:false,error:'Use at least 8 characters with at least one letter and one number.'};
    }
    if(testMode && !cleanPassword)return {ok:false,error:'A password is required.'};

    const salt=randomOwnerToken().slice(0,24);
    const passwordHash=await sha256Hex(`${salt}:${cleanPassword}`);
    p.ownerAccess.credential={
      login:cleanLogin,
      passwordHash,
      salt,
      hashAlgorithm:'SHA-256-SALTED-LOCAL-PROTOTYPE',
      testMode:!!testMode,
      createdAt:p.ownerAccess.credential?.createdAt||new Date().toISOString(),
      changedAt:new Date().toISOString()
    };
    return {ok:true};
  }

  async function verifyOwnerCredential(p,login,password){
    ensureProjectGovernance(p);
    const c=p.ownerAccess.credential;
    if(!c)return false;
    if(normalizeOwnerLogin(login)!==normalizeOwnerLogin(c.login))return false;
    if(c.passwordHash&&c.salt){
      try{return await sha256Hex(`${c.salt}:${String(password||'')}`)===c.passwordHash;}catch(_){return false;}
    }
    // One-way migration bridge for older local test credentials. A successful login re-hashes them.
    if(c.password!=null && String(password||'')===String(c.password||'')){
      const migrated=await createOwnerCredential(p,c.login,String(password||''),{testMode:!!c.testMode});
      if(migrated.ok)await saveCompanies();
      return migrated.ok;
    }
    return false;
  }

  async function ensureTestOwnerCredential(p){
    ensureProjectGovernance(p);
    if(!p.ownerAccess.credential){
      await createOwnerCredential(p,OWNER_TEST_LOGIN.login,OWNER_TEST_LOGIN.password,{testMode:true});
      p.ownerAccess.status='active';
      await saveCompanies();
      logActivity(p.id,'Test owner login enabled','joe');
    }
  }

  async function showOwnerLogin(projectId,message=''){
    const p=projectById(projectId);
    if(!p)return;
    ensureProjectGovernance(p);
    if(!p.ownerAccess.credential && p.id==='ikes-wood-signs'){
      await ensureTestOwnerCredential(p);
    }

    hideCoreSurfacesForOwner();
    $('ownerPortal')?.classList.add('hidden');
    $('ownerClaimGate')?.classList.remove('hidden');
    const box=$('ownerClaimContent');
    if(!box)return;

    box.innerHTML=`<div class="owner-login-card">
      <small>BUSINESS PORTAL</small>
      <h2>${escapeHtml(p.name)}</h2>
      <p>Welcome back. Sign in to manage your business.</p>
      ${message?`<div class="owner-login-message">${escapeHtml(message)}</div>`:''}
      <label>Email or login<input id="ownerLoginEmail" type="text" autocomplete="username" value="${escapeHtml(p.ownerAccess.credential?.testMode?'joe':(p.ownerAccess.ownerEmail||''))}"></label>
      <label>Password<input id="ownerLoginPassword" type="password" autocomplete="current-password"></label>
      <button id="ownerLoginSubmit" class="primary-btn" type="button">SIGN IN</button>
      <p id="ownerLoginError" class="owner-login-error"></p>
      ${p.ownerAccess.credential?.testMode?'<p class="owner-test-login-note">Test login for this build: <strong>joe</strong> / <strong>4353</strong></p>':''}
    </div>`;

    $('ownerLoginSubmit')?.addEventListener('click',async()=>{
      if(platformStatus(p)!=='approved'){
        $('ownerLoginError').textContent='Your business portal is not currently available.';
        return;
      }
      const login=$('ownerLoginEmail')?.value||'';
      const password=$('ownerLoginPassword')?.value||'';
      if(!await verifyOwnerCredential(p,login,password)){
        $('ownerLoginError').textContent='The login or password did not match.';
        return;
      }
      saveOwnerSession(p.id);
      history.replaceState(null,'',location.pathname+location.search+'#owner-portal');
      await openOwnerPortal(p.id);
    });

    $('ownerLoginPassword')?.addEventListener('keydown',e=>{
      if(e.key==='Enter')$('ownerLoginSubmit')?.click();
    });
  }

  async function generateOwnerInvitation(p){
    ensureProjectGovernance(p);
    if(platformStatus(p)!=='approved') return {ok:false,error:'This business is not currently available for owner access.'};
    if(!p.ownerAccess.enabled) return {ok:false,error:'Owner Portal is disabled for this project. Enable it before creating an invitation.'};
    if(!String(p.ownerAccess.ownerName||'').trim()) return {ok:false,error:'Enter and save the owner name first.'};
    if(!String(p.ownerAccess.ownerEmail||'').trim()) return {ok:false,error:'Enter and save the owner email first.'};

    try{
      const token=randomOwnerToken();
      const tokenHash=await sha256Hex(token);
      const now=Date.now();
      p.ownerAccess.invitation={
        inviteId:'INV-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,7),
        projectId:p.id,
        namespace:p.namespace||window.BlackFlagV3Core?.namespaceFor?.(p.id)||'',
        intendedEmail:normalizeOwnerLogin(p.ownerAccess.ownerEmail),
        tokenHash:tokenHash,
        createdAt:new Date(now).toISOString(),
        expiresAt:now+(7*24*60*60*1000),
        claimedAt:null,
        revokedAt:null,
        createdBy:'engine'
      };
      p.ownerAccess.status='invited';
      p.ownerAccess.updatedAt=new Date(now).toISOString();
      await saveCompanies();
      logActivity(p.id,'Owner invitation generated',p.ownerAccess.ownerEmail);
      return {ok:true,link:ownerClaimLink(p.id,token),expiresAt:p.ownerAccess.invitation.expiresAt};
    }catch(err){
      return {ok:false,error:err?.message||'Secure owner invitation could not be generated.'};
    }
  }

  async function validateOwnerClaim(projectId,token){
    const p=projectById(projectId);
    if(!p) return {ok:false,error:'Business invitation was not found.'};
    ensureProjectGovernance(p);
    if(purgeExpiredOwnerInvitation(p)){
      await saveCompanies();
      return {ok:false,error:'This invitation has expired. Please request a new invitation.'};
    }
    if(platformStatus(p)!=='approved') return {ok:false,error:'This business portal is not currently available.'};
    if(!p.ownerAccess.enabled) return {ok:false,error:'Owner access is disabled for this project.'};
    const inv=p.ownerAccess.invitation;
    if(!inv) return {ok:false,error:'No active invitation was found for this business.'};
    if(inv.projectId && inv.projectId!==p.id) return {ok:false,error:'This invitation does not match the requested project.'};
    if(inv.namespace && inv.namespace!==(p.namespace||window.BlackFlagV3Core?.namespaceFor?.(p.id)||'')) return {ok:false,error:'This invitation is outside the project security boundary.'};
    if(inv.intendedEmail && inv.intendedEmail!==normalizeOwnerLogin(p.ownerAccess.ownerEmail)) return {ok:false,error:'The intended owner changed after this invitation was created. Request a new invitation.'};
    if(inv.revokedAt) return {ok:false,error:'This invitation is no longer active.'};
    if(inv.claimedAt) return {ok:false,error:'This invitation has already been accepted.'};
    if(Number(inv.expiresAt||0)<=Date.now()) return {ok:false,error:'This invitation has expired.'};
    try{
      const hash=await sha256Hex(token);
      if(hash!==inv.tokenHash) return {ok:false,error:'This invitation is invalid.'};
    }catch(err){
      return {ok:false,error:err?.message||'This invitation could not be validated.'};
    }
    return {ok:true,project:p};
  }

  async function claimOwnerAccess(projectId,token,login,password,{testMode=false}={}){
    const validation=await validateOwnerClaim(projectId,token);
    if(!validation.ok) return validation;
    const p=validation.project;
    if(normalizeOwnerLogin(login)!==normalizeOwnerLogin(p.ownerAccess.ownerEmail)) return {ok:false,error:'Use the email address this invitation was issued to.'};
    const credential=await createOwnerCredential(p,login,password,{testMode});
    if(!credential.ok)return credential;
    p.ownerAccess.status='active';
    p.ownerAccess.invitation.claimedAt=new Date().toISOString();
    p.ownerAccess.updatedAt=p.ownerAccess.invitation.claimedAt;
    await saveCompanies();
    logActivity(p.id,'Owner access claimed',p.ownerAccess.ownerEmail);
    saveOwnerSession(p.id);
    return {ok:true,project:p};
  }

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
    window.BlackFlagV3Core?.audit?.({actorRole:engineSessionUnlocked?'engine_admin':'local_session',projectId:projectId||null,action,detail,category:'project_operation'});
  }
  function readLedgers(){
    try{return JSON.parse(localStorage.getItem(PROJECT_LEDGER_KEY)||'{}')}catch(_){return{}}
  }
  function writeLedgers(v){localStorage.setItem(PROJECT_LEDGER_KEY,JSON.stringify(v))}
  function projectLedger(projectId){const l=readLedgers();return Array.isArray(l[projectId])?l[projectId]:[]}
  function postOrderToLedger(order){
    const projectId=String(order?.projectId||'');
    if(!projectId){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'integrity',action:'ledger.post.blocked',detail:`Unscoped order ${order?.id||'unknown'}`});
      return;
    }
    const scoped=window.BlackFlagV3Core?.assertProjectScope?.({...order,projectId},projectId);
    if(scoped&&!scoped.ok)return;
    const ledgers=readLedgers(); const list=Array.isArray(ledgers[projectId])?ledgers[projectId]:[];
    if(list.some(x=>x.orderId===order.id)) return;
    list.push({
      ledgerId:'LED-'+Date.now(),
      projectId,
      namespace:window.BlackFlagV3Core?.namespaceFor?.(projectId)||`bf.project.${projectId}`,
      schemaVersion:3,
      isolation:{projectId,crossProjectAccess:'deny'},
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
    engineName:'Dark Sky',
    schemaVersion:3
  };
  let engineConfig={...DEFAULT_ENGINE_CONFIG};
  const DRAFT_KEY='blackFlagProjectDraftV1';
  const LEGACY_DRAFT_KEYS=['ikesOrderDraftV2'];
  const DEFAULT_BUSINESS_CONFIG={businessName:'Project',orderPrefix:'PRJ',thankYouHeadline:'THANK YOU FOR YOUR ORDER!',prices:[0],orderStatuses:['New','In Production','Ready for Pickup','Completed']};
  let businessConfig={...DEFAULT_BUSINESS_CONFIG};
  const PLATFORM_DEFAULT_WORKFLOW_KEY='blackFlagDefaultWorkflowV1';
  let platformDefaultWorkflow=[...DEFAULT_BUSINESS_CONFIG.orderStatuses];
  // Legacy Ike integration is intentionally project-specific. New projects must never inherit it.
  const LEGACY_IKE_WEB3FORMS_ACCESS_KEY = 'c97f16ac-2070-46b8-923c-9d7524031bce';
  const LEGACY_IKE_ORDER_EMAIL = 'ikeswoodsigns.orders@yahoo.com';
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
  let pendingCaptainDeploymentRoute = null;
  window.__darkSkyBootStage = 'app-declarations';
  function lockEngineSession(){
    engineSessionUnlocked = false;
    if($('enginePinInput')) $('enginePinInput').value='';
    if($('blackFlagEntryPin')) $('blackFlagEntryPin').value='';
    document.body.classList.remove('engine-mode');
    const engineScreen = $('enginePanel');
    if(engineScreen) engineScreen.classList.add('hidden');
  }


  function normalizeOrderIsolation(order,{legacyImport=false}={}){
    if(!order || typeof order!=='object') return order;
    if(!order.projectId && legacyImport) order.projectId=LEGACY_IKE_PROJECT_ID;
    if(order.projectId){
      order.namespace=order.namespace||window.BlackFlagV3Core?.namespaceFor?.(order.projectId)||`bf.project.${order.projectId}`;
      order.isolation={...(order.isolation||{}),projectId:order.projectId,namespace:order.namespace,crossProjectAccess:'deny'};
      order.schemaVersion=Number(order.schemaVersion||3);
    }
    return order;
  }

  function openNamedDb(name){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(name);
      req.onsuccess=()=>{
        const opened=req.result;
        opened.onversionchange=()=>{ try{ opened.close(); }catch(_){} };
        resolve(opened);
      };
      req.onblocked=()=>console.warn('Dark Sky storage upgrade is waiting for another open tab to release the database.');
      req.onerror=()=>reject(req.error);
    });
  }

  function dbStoreRows(database,storeName){
    return new Promise((resolve)=>{
      try{
        if(!database.objectStoreNames.contains(storeName)) return resolve([]);
        const req=database.transaction(storeName,'readonly').objectStore(storeName).getAll();
        req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
        req.onerror=()=>resolve([]);
      }catch(_){ resolve([]); }
    });
  }

  async function migrateLegacyPlatformStorage(){
    const markerKey='platformMigration:v3.7';
    try{ if((await getSetting(markerKey))?.value?.complete) return; }catch(_){}
    let ordersCopied=0, settingsCopied=0, localCopied=0, draftCopied=0;

    for(const legacyName of LEGACY_DB_NAMES){
      if(legacyName===DB_NAME) continue;
      let legacyDb=null;
      try{
        legacyDb=await openNamedDb(legacyName);
        const legacyOrders=await dbStoreRows(legacyDb,STORE_ORDERS);
        const legacySettings=await dbStoreRows(legacyDb,STORE_SETTINGS);
        for(const raw of legacyOrders){
          const row=normalizeOrderIsolation(structuredClone(raw),{legacyImport:true});
          if(row?.id){ await put(STORE_ORDERS,row); ordersCopied++; }
        }
        for(const row of legacySettings){
          if(!row?.key || row.key===markerKey) continue;
          const exists=await getSetting(row.key);
          if(!exists){ await put(STORE_SETTINGS,row); settingsCopied++; }
        }
      }catch(err){ console.warn('Legacy database migration skipped',legacyName,err); }
      finally{ try{legacyDb?.close()}catch(_){} }
    }

    const mergedLocal=readLocalOrders();
    for(const key of LEGACY_LOCAL_ORDERS_KEYS){
      try{
        const rows=JSON.parse(localStorage.getItem(key)||'[]');
        if(Array.isArray(rows)) rows.forEach(raw=>{
          const row=normalizeOrderIsolation(structuredClone(raw),{legacyImport:true});
          if(row?.id && !mergedLocal.some(x=>x.id===row.id)){ mergedLocal.push(row); localCopied++; }
        });
      }catch(_){}
    }
    writeLocalOrders(mergedLocal);

    for(const legacyBase of LEGACY_DRAFT_KEYS){
      const candidates=[legacyBase,`${legacyBase}:${LEGACY_IKE_PROJECT_ID}`];
      for(const key of candidates){
        try{
          const raw=localStorage.getItem(key);
          const target=`${DRAFT_KEY}:${LEGACY_IKE_PROJECT_ID}`;
          if(raw && !localStorage.getItem(target)){ localStorage.setItem(target,raw); draftCopied++; }
        }catch(_){}
      }
    }

    await setSetting(markerKey,{complete:true,at:new Date().toISOString(),ordersCopied,settingsCopied,localCopied,draftCopied});
    window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'migration',action:'v3.7.platform.storage.migrated',projectId:null,detail:`orders ${ordersCopied} • settings ${settingsCopied} • local ${localCopied} • drafts ${draftCopied}`});
  }

  async function migrateLegacyProjectSettings(){
    const p=projectById(LEGACY_IKE_PROJECT_ID);
    if(!p) return;
    let changed=false;
    try{
      const legacyBusiness=await getSetting('businessConfig');
      const scopedBusiness=await getSetting(`businessConfig:${LEGACY_IKE_PROJECT_ID}`);
      if(legacyBusiness?.value && !scopedBusiness){
        await setSetting(`businessConfig:${LEGACY_IKE_PROJECT_ID}`,legacyBusiness.value);
      }
      const legacyAdminPin=await getSetting('adminPin');
      const scopedAdminPin=await getSetting(`projectAdminPin:${LEGACY_IKE_PROJECT_ID}`);
      if(legacyAdminPin?.value && !scopedAdminPin){
        await setSetting(`projectAdminPin:${LEGACY_IKE_PROJECT_ID}`,legacyAdminPin.value);
      }
      const legacyColors=await getSetting('allowCustomColors');
      if(legacyColors && p.customization?.allowCustomColors!==legacyColors.value){
        p.customization=p.customization||{};p.customization.allowCustomColors=legacyColors.value!==false;changed=true;
      }
      const legacyConfirm=await getSetting('customerConfirmationEmail');
      if(legacyConfirm && !!p.notifications?.customerConfirmationEmail!==!!legacyConfirm.value){
        p.notifications=p.notifications||{};p.notifications.customerConfirmationEmail=!!legacyConfirm.value;changed=true;
      }
      if(changed) await saveCompanies();
    }catch(err){ console.warn('Legacy project settings translation skipped',err); }
  }

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
        if(!d.objectStoreNames.contains(STORE_PROJECTS)) d.createObjectStore(STORE_PROJECTS,{keyPath:'id'});
      };
      req.onsuccess=()=>{
        const opened=req.result;
        opened.onversionchange=()=>{ try{ opened.close(); }catch(_){} };
        resolve(opened);
      };
      req.onblocked=()=>console.warn('Dark Sky storage upgrade is waiting for another open tab to release the database.');
      req.onerror=()=>reject(req.error);
    });
  }

  function tx(store,mode='readonly'){ return db.transaction(store,mode).objectStore(store); }
  function reqToPromise(req){ return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); }

  function readLocalOrders(){
    try{
      const raw=localStorage.getItem(LOCAL_ORDERS_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed.map(o=>normalizeOrderIsolation(o)):[];
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
    const quarantined=quarantinedOrderIds();
    const map=new Map();
    [...local,...indexed].forEach(o=>{
      const row=normalizeOrderIsolation(o);
      if(row && row.id && !quarantined.has(String(row.id))) map.set(row.id,row);
    });
    return [...map.values()];
  }

  function roughBytes(value){
    try{return new Blob([typeof value==='string'?value:JSON.stringify(value)]).size}catch(_){try{return JSON.stringify(value).length*2}catch(__){return 0}}
  }
  async function blackFlagStorageBreakdown(onProgress){
    const progress=(stage,detail='')=>{try{if(typeof onProgress==='function')onProgress(stage,detail)}catch(_){}};
    progress('local','Reading LocalStorage');
    const local=[];let localBytes=0;
    try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);const val=localStorage.getItem(key)||'';const bytes=roughBytes(key)+roughBytes(val);local.push({key,bytes});localBytes+=bytes}}catch(_){}
    local.sort((a,b)=>b.bytes-a.bytes);
    progress('indexeddb','Reading IndexedDB stores');
    const stores={};let indexedDbBytes=0;
    for(const store of [STORE_ORDERS,STORE_SETTINGS,STORE_PROJECTS]){
      try{const rows=await getAll(store);const bytes=roughBytes(rows);stores[store]={rows:rows.length,bytes};indexedDbBytes+=bytes}catch(err){stores[store]={rows:null,bytes:null,error:String(err?.message||err)}}
    }
    progress('caches','Reading Cache Storage');
    const cacheRows=[];let cacheBytes=0;
    if(typeof caches!=='undefined'){
      const cacheNames=await caches.keys().catch(()=>[]);let cacheIndex=0;
      for(const name of cacheNames){
        cacheIndex++;progress('cache',`${cacheIndex}/${cacheNames.length} • ${name}`);
        let bytes=0,entries=0;
        try{const c=await caches.open(name);const reqs=await c.keys();entries=reqs.length;for(const req of reqs){try{const res=await c.match(req);const len=Number(res?.headers?.get('content-length')||0);if(len)bytes+=len;else if(res){const blob=await res.clone().blob();bytes+=blob.size}}catch(_){}}}catch(_){}
        cacheRows.push({name,entries,bytes});cacheBytes+=bytes;
      }
    }
    cacheRows.sort((a,b)=>b.bytes-a.bytes);
    progress('done','Storage sounding complete');
    return {at:new Date().toISOString(),localStorage:{bytes:localBytes,topKeys:local.slice(0,12)},indexedDb:{bytes:indexedDbBytes,stores},cacheStorage:{bytes:cacheBytes,caches:cacheRows},knownBytes:localBytes+indexedDbBytes+cacheBytes};
  }
  window.blackFlagStorageBreakdown=blackFlagStorageBreakdown;

  function formatStorageMb(n){return n==null?'?':(Number(n)/1024/1024).toFixed(1)}
  function renderStorageStewardReport(r){
    const b=r?.breakdown||{};const stores=b.indexedDb?.stores||{};
    const cachesTop=(b.cacheStorage?.caches||[]).slice(0,8);
    const localTop=(b.localStorage?.topKeys||[]).slice(0,6);
    const cacheRows=cachesTop.length?cachesTop.map(x=>`<tr><td>${escapeHtml(x.name||'cache')}</td><td>${Number(x.entries||0)}</td><td>${formatStorageMb(x.bytes)} MB</td></tr>`).join(''):'<tr><td colspan="3">No cache entries measured.</td></tr>';
    const localRows=localTop.length?localTop.map(x=>`<tr><td>${escapeHtml(x.key||'key')}</td><td colspan="2">${formatStorageMb(x.bytes)} MB</td></tr>`).join(''):'<tr><td colspan="3">No LocalStorage entries measured.</td></tr>';
    return `<div class="storage-report-head"><strong>STORAGE SOUNDING COMPLETE</strong><span>${r.usage!=null?formatStorageMb(r.usage)+' MB origin usage':'Origin usage unavailable'}</span></div>
      <div class="storage-report-grid">
        <div><b>${formatStorageMb(b.knownBytes)} MB</b><small>Measured Dark Sky data</small></div>
        <div><b>${formatStorageMb(b.cacheStorage?.bytes)} MB</b><small>Cache Storage</small></div>
        <div><b>${formatStorageMb(b.indexedDb?.bytes)} MB</b><small>IndexedDB</small></div>
        <div><b>${formatStorageMb(b.localStorage?.bytes)} MB</b><small>LocalStorage</small></div>
      </div>
      <p class="helper">Orders: ${stores.orders?.rows??'?'} rows / ${formatStorageMb(stores.orders?.bytes)} MB • Projects: ${stores.projects?.rows??'?'} rows / ${formatStorageMb(stores.projects?.bytes)} MB • Settings: ${stores.settings?.rows??'?'} rows / ${formatStorageMb(stores.settings?.bytes)} MB.</p>
      <p class="helper">${r.oldCaches?.length||0} stale application cache${(r.oldCaches?.length||0)===1?'':'s'} eligible for safe cleanup. Clean remains guarded and does not touch projects, orders, customers, graphics, admissions, or quarantine evidence.</p>
      <details class="storage-report-details"><summary>Largest caches</summary><table><thead><tr><th>Cache</th><th>Entries</th><th>Size</th></tr></thead><tbody>${cacheRows}</tbody></table></details>
      <details class="storage-report-details"><summary>Largest LocalStorage keys</summary><table><tbody>${localRows}</tbody></table></details>`;
  }
  window.BlackFlagStorageStewardInspect=async function(){
    const btn=$('engineStorageStewardPreviewBtn'), clean=$('engineStorageStewardCleanBtn'), box=$('engineStorageStewardStatus');
    if(!box)return false;
    if(btn){btn.disabled=true;btn.textContent='SOUNDING…'}
    if(clean)clean.disabled=true;
    box.classList.add('is-active');box.innerHTML='<strong>Storage sounding started…</strong><br><span>Reading browser storage. Large caches can take several seconds on iPad.</span>';
    try{box.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}
    try{
      const r=await window.DarkSkyV4?.storageStewardPreview?.((stage,detail)=>{if(box)box.innerHTML=`<strong>Storage sounding…</strong><br><span>${escapeHtml(detail||stage||'Working')}</span>`});
      if(!r)throw new Error('Storage Steward unavailable');
      box.innerHTML=renderStorageStewardReport(r);
      box.dataset.inspectOk='1';if(clean)clean.disabled=false;
      window.DarkSkyV4?.diagnostic?.('storage.inspect.complete','Storage sounding completed',{usage:r.usage,knownBytes:r.breakdown?.knownBytes,cacheBytes:r.breakdown?.cacheStorage?.bytes,indexedDbBytes:r.breakdown?.indexedDb?.bytes,localStorageBytes:r.breakdown?.localStorage?.bytes,staleCaches:r.oldCaches?.length||0});
      return true;
    }catch(err){
      const message=String(err?.message||err||'Unknown inspection failure');box.innerHTML=`<strong>INSPECTION INTERRUPTED</strong><br><span>${escapeHtml(message)}</span>`;
      window.DarkSkyV4?.diagnostic?.('storage.inspect.ui_failed',message,{build:'4.2.1'});return false;
    }finally{if(btn){btn.disabled=false;btn.textContent='INSPECT STORAGE'}}
  };

  async function blackFlagCommandSearchData(){
    const projectRows=companies.map(p=>({type:'project',id:p.id,projectId:p.id,title:p.name||p.id,detail:`${p.publish?.status||p.publishStatus||'development'} • ${p.description||''}`}));
    const orders=(await getMergedOrders()).map(o=>({type:'order',id:o.id,projectId:o.projectId||'',title:o.id||'Order',detail:`${o.customerName||'Customer not named'} • ${canonicalOrderStatus(o.status||'New')} • $${Number(o.price||0).toFixed(0)}`}));
    const customers=[];
    for(const p of companies){for(const c of projectCustomerRows(p.id)){customers.push({type:'customer',id:c.customerKey||`${p.id}:${c.email||c.phone||c.name||''}`,projectId:p.id,title:c.name||c.email||c.phone||'Customer',detail:`${p.name} • ${Number(c.orderCount||0)} order${Number(c.orderCount||0)===1?'':'s'}`})}}
    return [...projectRows,...orders,...customers];
  }
  window.blackFlagCommandSearchData=blackFlagCommandSearchData;

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

  function transactionToPromise(transaction){
    return new Promise((resolve,reject)=>{
      transaction.oncomplete=()=>resolve(true);
      transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed.'));
      transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction was aborted.'));
    });
  }

  async function readCanonicalProjectRegistry(){
    try{
      const rows=await getAll(STORE_PROJECTS);
      return Array.isArray(rows)?rows:[];
    }catch(err){
      console.warn('Canonical project registry could not be read',err);
      return [];
    }
  }

  function uniqueRegistryRows(rows){
    const map=new Map();
    for(const p of (Array.isArray(rows)?rows:[])){
      const id=String(p?.id||'').trim();
      if(!id) throw new Error('Fleet registry contains a project without an immutable Project ID.');
      if(map.has(id)) throw new Error(`Duplicate Project ID blocked: ${id}`);
      map.set(id,p);
    }
    return [...map.values()];
  }

  async function persistProjectRegistry(rows,{allowRemovalIds=[]}={}){
    let projects=uniqueRegistryRows(structuredClone(Array.isArray(rows)?rows:[]));
    // v3.10.0: registry writes are non-destructive by default. A normal save may
    // update a vessel, but it may not silently make an already-registered Project ID
    // disappear. Explicit removal must name the exact immutable Project ID.
    let existing=[];
    try{ existing=await readCanonicalProjectRegistry(); }catch(_){ existing=[]; }
    const allowed=new Set((allowRemovalIds||[]).map(String));
    const nextIds=projectRegistryIds(projects);
    const preserved=[];
    for(const prior of existing){
      const id=String(prior?.id||'');
      if(id && !nextIds.has(id) && !allowed.has(id)){
        projects.push(structuredClone(prior));
        nextIds.add(id);
        preserved.push(id);
      }
    }
    projects=uniqueRegistryRows(projects);
    if(preserved.length){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'recovery',action:'project.registry.shrink_blocked',detail:preserved.join(' • ')});
    }

    const transaction=db.transaction([STORE_PROJECTS,STORE_SETTINGS],'readwrite');
    const projectStore=transaction.objectStore(STORE_PROJECTS);
    const settingsStore=transaction.objectStore(STORE_SETTINGS);
    projectStore.clear();
    projects.forEach(project=>projectStore.put(project));
    settingsStore.put({key:'companies',value:projects});
    settingsStore.put({key:FLEET_REGISTRY_SCHEMA_KEY,value:FLEET_REGISTRY_SCHEMA_VERSION});
    await transactionToPromise(transaction);

    const canonical=await readCanonicalProjectRegistry();
    const mirror=await getSetting('companies');
    const mirrorRows=Array.isArray(mirror?.value)?mirror.value:[];
    const expectedIds=projectRegistryIds(projects);
    const canonicalIds=projectRegistryIds(canonical);
    const mirrorIds=projectRegistryIds(mirrorRows);
    const canonicalComplete=[...expectedIds].every(id=>canonicalIds.has(id)) && canonicalIds.size===expectedIds.size;
    const mirrorComplete=[...expectedIds].every(id=>mirrorIds.has(id)) && mirrorIds.size===expectedIds.size;
    if(!canonicalComplete || !mirrorComplete){
      throw new Error(`Fleet registry read-back verification failed (${canonical.length}/${projects.length} canonical, ${mirrorRows.length}/${projects.length} mirror).`);
    }
    return canonical;
  }

  function projectAdminPinKey(projectId=activeProjectId){
    return projectId ? `projectAdminPin:${projectId}` : '';
  }

  async function getAdminPin(projectId=activeProjectId){
    try{
      const scopedKey=projectAdminPinKey(projectId);
      if(scopedKey){
        const scoped=await getSetting(scopedKey);
        if(scoped?.value) return scoped.value;
      }
      // Compatibility bridge only for the original Ike project. Other projects never inherit Ike's legacy PIN.
      if(String(projectId||'')===LEGACY_IKE_PROJECT_ID){
        const legacy=await getSetting('adminPin');
        if(legacy?.value) return legacy.value;
      }
      return DEFAULT_ADMIN_PIN;
    }catch(err){
      console.warn('Project admin PIN setting unavailable; using default',err);
      return DEFAULT_ADMIN_PIN;
    }
  }

  async function setAdminPin(value,projectId=activeProjectId){
    const scopedKey=projectAdminPinKey(projectId);
    if(!scopedKey) throw new Error('Project context required for admin PIN changes.');
    return setSetting(scopedKey,value);
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

  // Unified Black Flag Engine authentication. Every Engine gate must use this controller.
  // 5615 remains the guaranteed recovery/default PIN for this test build.
  async function verifyEnginePin(rawValue,{recordFailure=true}={}){
    const entered=String(rawValue||'').trim();
    const security=pinSecurityState('engine');
    if(security.lockedUntil>Date.now()){
      return {ok:false,code:'locked',lockedUntil:security.lockedUntil};
    }
    let configured=DEFAULT_ENGINE_PIN;
    try{ configured=String(await getEnginePin() || DEFAULT_ENGINE_PIN); }catch(_){ configured=DEFAULT_ENGINE_PIN; }
    const ok=entered===String(DEFAULT_ENGINE_PIN) || entered===configured;
    if(ok){
      clearPinFailures('engine');
      return {ok:true,code:'ok',configured,recovery:entered===String(DEFAULT_ENGINE_PIN)};
    }
    const row=recordFailure ? recordBadPin('engine') : pinSecurityState('engine');
    return {ok:false,code:row.lockedUntil>Date.now()?'locked':'incorrect',lockedUntil:row.lockedUntil||0};
  }

  function engineAuthMessage(result){
    if(result?.code==='locked') return 'Engine access is temporarily locked. Wait for the lock timer, then try again.';
    return 'Incorrect Engine PIN.';
  }

  // Black Flag portal bridge. This bridge keeps every Engine PIN surface on one authentication state.
  window.BlackFlagAuth = {
    async expectedPin(){
      try{
        const configured=await getEnginePin();
        return String(configured || DEFAULT_ENGINE_PIN);
      }catch(_){
        return DEFAULT_ENGINE_PIN;
      }
    },
    verify: verifyEnginePin,
    message: engineAuthMessage,
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
    recoveryPin: DEFAULT_ENGINE_PIN,
    pinLocked, recordBadPin, clearPinFailures, showPinLock
  };
  window.pinLocked=pinLocked; window.recordBadPin=recordBadPin; window.clearPinFailures=clearPinFailures; window.showPinLock=showPinLock;

  function readProjectRegistryBackup(){
    try{
      const raw=JSON.parse(localStorage.getItem(PROJECT_REGISTRY_BACKUP_KEY)||'null');
      if(!raw||!Array.isArray(raw.projects))return null;
      return raw;
    }catch(_){return null;}
  }

  function writeProjectRegistryBackup(rows,reason='verified-save'){
    try{
      const projects=structuredClone(Array.isArray(rows)?rows:[]);
      localStorage.setItem(PROJECT_REGISTRY_BACKUP_KEY,JSON.stringify({
        version:2,
        fleetSchemaVersion:FLEET_REGISTRY_SCHEMA_VERSION,
        savedAt:new Date().toISOString(),
        reason,
        projectCount:projects.length,
        projects
      }));
      return true;
    }catch(err){
      console.warn('Project registry backup could not be written',err);
      return false;
    }
  }

  function projectRegistryIds(rows){
    return new Set((Array.isArray(rows)?rows:[]).map(p=>String(p?.id||'')).filter(Boolean));
  }

  function registryContainsProject(rows,projectId){
    return (Array.isArray(rows)?rows:[]).some(p=>String(p?.id||'')===String(projectId||''));
  }

  function readCommissionJournal(){
    try{
      const row=JSON.parse(localStorage.getItem(COMMISSION_JOURNAL_KEY)||'null');
      if(!row || !row.project || !row.project.id)return null;
      return row;
    }catch(_){return null;}
  }

  function writeCommissionJournal(project,stage='candidate_captured',detail=''){
    if(!project?.id)return null;
    const existing=readCommissionJournal();
    const row={
      version:1,
      build:BUILD_VERSION,
      stage,
      detail:String(detail||''),
      createdAt:existing?.project?.id===project.id ? existing.createdAt : new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      project:structuredClone(project)
    };
    localStorage.setItem(COMMISSION_JOURNAL_KEY,JSON.stringify(row));
    return row;
  }

  function clearCommissionJournal(projectId=''){
    const row=readCommissionJournal();
    if(!row)return;
    if(projectId && String(row.project?.id||'')!==String(projectId))return;
    localStorage.removeItem(COMMISSION_JOURNAL_KEY);
  }

  function commissioningRecoveryCandidate(){
    const row=readCommissionJournal();
    if(!row?.project?.id)return null;
    const project=structuredClone(row.project);
    window.BlackFlagV3Core?.ensure?.(project);
    return {row,project};
  }


  function draftMatchesProject(draft,project){
    if(!draft||!project)return false;
    if(draft.projectId && String(draft.projectId)===String(project.id))return true;
    return String(draft.name||'').trim().toLowerCase()===String(project.name||'').trim().toLowerCase();
  }

  async function reconcileCommissioningArtifacts({attemptRepair=true,source='engine'}={}){
    // v3.9.9 — canonical Project ID is the sole authority after commissioning.
    // Recovery/journal/draft state may preserve an interrupted transition, but it
    // must never compete with a project that is actually present in the canonical
    // registry. Reconcile by immutable Project ID only; display names are used only
    // to clear the matching pre-commission draft after identity has been verified.
    const recovery=commissioningRecoveryCandidate();
    if(!recovery)return {status:'none'};
    const candidate=recovery.project;
    let canonical=[];
    try{ canonical=await readCanonicalProjectRegistry(); }
    catch(err){
      writeCommissionJournal(candidate,'recovery_pending',`Canonical registry read failed: ${String(err?.message||err)}`);
      return {status:'read_failed',error:err,candidate};
    }

    if(registryContainsProject(canonical,candidate.id)){
      companies=canonical.map(p=>window.BlackFlagV3Core?.ensure?.(p)||p).map(normalizeProjectCode).map(ensureProjectGovernance);
      const draft=readCommissionDraft();
      clearCommissionJournal(candidate.id);
      if(draftMatchesProject(draft,candidate))clearCommissionDraft();
      writeProjectRegistryBackup(companies,`reconciled-${source}`);
      window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId:candidate.id,category:'recovery',action:'commissioning.registry_wins',detail:`${candidate.name} reconciled from canonical registry • ${source}`});
      return {status:'commissioned',candidate,canonical};
    }

    if(!attemptRepair){
      return {status:'missing',candidate,canonical,row:recovery.row};
    }

    // One controlled repair attempt. Persist against the registry we just read,
    // never against a stale in-memory collection. This makes the repair idempotent
    // and prevents duplicate Project IDs.
    const sameId=canonical.find(p=>String(p.id)===String(candidate.id));
    if(sameId){
      return {status:'identity_conflict',candidate,canonical};
    }
    try{
      writeCommissionJournal(candidate,'recovery_committing','Canonical registry is missing this Project ID. Retrying the preserved commissioned candidate.');
      const repaired=await persistProjectRegistry([...canonical,candidate]);
      const verify=await readCanonicalProjectRegistry();
      if(!registryContainsProject(repaired,candidate.id)||!registryContainsProject(verify,candidate.id)){
        throw new Error('Project ID was not present after canonical registry recovery read-back.');
      }
      companies=verify.map(p=>window.BlackFlagV3Core?.ensure?.(p)||p).map(normalizeProjectCode).map(ensureProjectGovernance);
      const draft=readCommissionDraft();
      clearCommissionJournal(candidate.id);
      if(draftMatchesProject(draft,candidate))clearCommissionDraft();
      writeProjectRegistryBackup(companies,`recovery-verified-${source}`);
      window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId:candidate.id,category:'recovery',action:'commissioning.registry_recovery.verified',detail:`${candidate.name} promoted to canonical fleet registry • ${source}`});
      return {status:'recovered',candidate,canonical:verify};
    }catch(err){
      writeCommissionJournal(candidate,'recovery_failed',String(err?.message||err));
      return {status:'repair_failed',candidate,canonical,error:err};
    }
  }

  function normalizeProjectCode(p){
    if(!p)return p;
    const seeded={ 'ikes-wood-signs':'IKE','mugshot-after-dark':'MUG','beccas-bloom-shop':'BBS','grizzly-bear':'GRZ' };
    const fallback=String(p.orderPrefix||p.name||'PRJ').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'PRJ';
    p.projectCode=String(p.projectCode||seeded[p.id]||fallback).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);
    if(!p.orderPrefix)p.orderPrefix=p.projectCode;
    return p;
  }
  function projectNameKey(p){
    return String(p?.name||p?.identity?.displayName||'').trim().toLowerCase().replace(/\s+/g,' ');
  }

  function reconcileFleetSources(canonicalRows=[],savedRows=[],backupRows=[]){
    const merged=[];
    const byId=new Map();
    const add=(row,source)=>{
      if(!row?.id)return;
      const id=String(row.id);
      if(byId.has(id))return;
      const clone=structuredClone(row);
      clone.registryRecovery={...(clone.registryRecovery||{}),lastSeenSource:source,lastSeenAt:new Date().toISOString()};
      byId.set(id,clone); merged.push(clone);
    };
    (canonicalRows||[]).forEach(p=>add(p,'canonical'));
    (savedRows||[]).forEach(p=>add(p,'settings-mirror'));
    (backupRows||[]).forEach(p=>add(p,'verified-backup'));

    // Current fleet baseline. Existing matching identities win; a seed is used only
    // when every persisted source has lost the vessel. This is the one-time rescue
    // path for the Grizzle/Grizzly Bear regression seen in 3.9.9.
    const existingNames=new Set(merged.map(projectNameKey));
    for(const seed of DEFAULT_COMPANIES){
      const aliases=seed.id==='grizzly-bear'?new Set(['grizzle bear','grizzly bear']):new Set([projectNameKey(seed)]);
      const hasAlias=[...existingNames].some(n=>aliases.has(n));
      if(!byId.has(seed.id) && !hasAlias){
        const clone=structuredClone(seed);
        clone.registryRecovery={restoredBy:'3.10.1-registry-seal',restoredAt:new Date().toISOString(),reason:'baseline-project-missing'};
        add(clone,'3.10.1-baseline-rescue');
        existingNames.add(projectNameKey(clone));
      }
    }
    return uniqueRegistryRows(merged);
  }

  function replaceProjectIdDeep(value,fromId,toId){
    if(value===fromId)return toId;
    if(Array.isArray(value))return value.map(v=>replaceProjectIdDeep(v,fromId,toId));
    if(!value || typeof value!=='object')return value;
    const out={};
    for(const [key,val] of Object.entries(value)){
      const nextKey=key===fromId?toId:key.replaceAll(`:${fromId}`,`:${toId}`);
      out[nextKey]=replaceProjectIdDeep(val,fromId,toId);
    }
    return out;
  }

  function canonicalizeRegistryAliasRows(rows){
    const out=[];
    let changed=false;
    for(const raw of (Array.isArray(rows)?rows:[])){
      const row=structuredClone(raw);
      if(String(row?.id||'')===LEGACY_GRIZZLE_PROJECT_ID){
        row.id=CANONICAL_GRIZZLY_PROJECT_ID;
        if(row.namespace===`bf.project.${LEGACY_GRIZZLE_PROJECT_ID}`)row.namespace=`bf.project.${CANONICAL_GRIZZLY_PROJECT_ID}`;
        row.identity=row.identity&&typeof row.identity==='object'?row.identity:{};
        if(row.identity.projectId===LEGACY_GRIZZLE_PROJECT_ID)row.identity.projectId=CANONICAL_GRIZZLY_PROJECT_ID;
        row.registryMigration={...(row.registryMigration||{}),legacyProjectId:LEGACY_GRIZZLE_PROJECT_ID,canonicalProjectId:CANONICAL_GRIZZLY_PROJECT_ID,sealedBy:'3.10.1',sealedAt:new Date().toISOString()};
        changed=true;
      }
      out.push(replaceProjectIdDeep(row,LEGACY_GRIZZLE_PROJECT_ID,CANONICAL_GRIZZLY_PROJECT_ID));
    }
    // If both legacy and canonical somehow survived, canonical identity wins and the
    // alias row is folded into one vessel rather than becoming a duplicate.
    const map=new Map();
    for(const row of out){
      const id=String(row?.id||'');
      if(!id)continue;
      if(!map.has(id))map.set(id,row);
      else changed=true;
    }
    return {rows:[...map.values()],changed};
  }

  async function migrateGrizzlyProjectAliasData(){
    const fromId=LEGACY_GRIZZLE_PROJECT_ID,toId=CANONICAL_GRIZZLY_PROJECT_ID;
    let changed=false;

    // Orders in IndexedDB retain their order IDs; only project scope is canonicalized.
    try{
      const rows=await getAll(STORE_ORDERS);
      const affected=rows.filter(o=>String(o?.projectId||'')===fromId);
      if(affected.length){
        const transaction=db.transaction(STORE_ORDERS,'readwrite');
        const store=transaction.objectStore(STORE_ORDERS);
        affected.forEach(order=>store.put(replaceProjectIdDeep(order,fromId,toId)));
        await transactionToPromise(transaction); changed=true;
      }
    }catch(err){console.warn('Grizzly order alias migration could not complete',err);}

    // Project-scoped settings (admin PIN, owner access, business brief, etc.).
    try{
      const rows=await getAll(STORE_SETTINGS);
      const existingKeys=new Set(rows.map(r=>String(r?.key||'')));
      const transaction=db.transaction(STORE_SETTINGS,'readwrite');
      const store=transaction.objectStore(STORE_SETTINGS);
      for(const row of rows){
        const oldKey=String(row?.key||'');
        if(oldKey==='companies')continue;
        const newKey=oldKey.replaceAll(`:${fromId}`,`:${toId}`);
        const next=replaceProjectIdDeep(row,fromId,toId);
        if(newKey!==oldKey){
          next.key=newKey;
          if(!existingKeys.has(newKey))store.put(next);
          store.delete(oldKey); changed=true;
        }else if(JSON.stringify(next)!==JSON.stringify(row)){
          store.put(next); changed=true;
        }
      }
      await transactionToPromise(transaction);
    }catch(err){console.warn('Grizzly settings alias migration could not complete',err);}

    // Local recovery/state stores are project scoped too. Rewrite exact ID values and
    // map keys without changing the human-facing business name.
    try{
      const keys=Object.keys(localStorage).filter(k=>k.startsWith('blackFlag') || k.startsWith(DRAFT_KEY+':'));
      for(const key of keys){
        const raw=localStorage.getItem(key); if(raw==null)continue;
        let parsed; try{parsed=JSON.parse(raw);}catch(_){continue;}
        const next=replaceProjectIdDeep(parsed,fromId,toId);
        const newKey=key.replaceAll(`:${fromId}`,`:${toId}`);
        if(newKey!==key){ if(localStorage.getItem(newKey)==null)localStorage.setItem(newKey,JSON.stringify(next)); localStorage.removeItem(key); changed=true; }
        else if(JSON.stringify(next)!==raw){ localStorage.setItem(key,JSON.stringify(next)); changed=true; }
      }
    }catch(err){console.warn('Grizzly local state alias migration could not complete',err);}

    if(changed)window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId:toId,category:'migration',action:'v3.10.1.grizzly.project_id.sealed',detail:`${fromId} → ${toId} • legacy alias retained for resolution`});
    return changed;
  }


  async function commissionV4ProjectEnvelopes({force=false}={}){
    const result=await ensureV4EnvelopeConvergence({persistRegistry:true,record:true});
    if(result.sealed!==result.total)throw new Error(result.error||`V4 convergence incomplete: ${result.sealed}/${result.total}.`);
    return {changed:true,sealed:result.sealed,total:result.total,rows:result.rows};
  }



  // V4.0.4 — Project Envelope Ledger. The registry owns business/project data;
  // this ledger owns the security envelope contract. Keeping the contract in a
  // dedicated, project-ID-keyed ledger prevents older project serializers from
  // accidentally dropping security fields while preserving canonical identity.
  // V4.1.1 — Harbor Master. Project existence and project security now share one
  // explicit fleet manifest. The canonical projects object store remains the durable
  // record store, but only immutable IDs on this manifest are active vessels. Recovery
  // artifacts and legacy/ghost rows are preserved in quarantine instead of being
  // silently promoted into the fleet or counted by telemetry/commissioning.
  const V4_FLEET_MANIFEST_KEY='darkSkyV4FleetManifestV1';
  const V4_FLEET_MANIFEST_SETTING='darkSkyV4FleetManifestV1';
  const V4_ADMISSION_LEDGER_KEY='darkSkyV4ProjectAdmissionsV1';
  const V4_ADMISSION_LEDGER_SETTING='darkSkyV4ProjectAdmissionsV1';
  const V4_BASELINE_FLEET_IDS=Object.freeze(['ikes-wood-signs','mugshot-after-dark','beccas-bloom-shop','grizzly-bear']);

  function readV4FleetManifest(){
    try{const v=JSON.parse(localStorage.getItem(V4_FLEET_MANIFEST_KEY)||'null');return Array.isArray(v)?[...new Set(v.map(String).filter(Boolean))]:[]}catch(_){return[]}
  }
  function writeV4FleetManifest(ids){
    const clean=[...new Set((ids||[]).map(String).filter(Boolean))];
    localStorage.setItem(V4_FLEET_MANIFEST_KEY,JSON.stringify(clean));
    return clean;
  }
  function readV4AdmissionLedger(){
    try{const v=JSON.parse(localStorage.getItem(V4_ADMISSION_LEDGER_KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(_){return{}}
  }
  function writeV4AdmissionLedger(value){
    const clean=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    localStorage.setItem(V4_ADMISSION_LEDGER_KEY,JSON.stringify(clean));
    return clean;
  }
  async function persistV4AdmissionLedger(value){
    const clean=writeV4AdmissionLedger(value);
    try{await setSetting(V4_ADMISSION_LEDGER_SETTING,clean);}catch(_){ }
    return clean;
  }
  function validV4Admission(row,id){
    return !!(row&&row.admitted===true&&String(row.projectId||'')===String(id||'')&&String(row.transactionId||'').trim());
  }
  async function ensureV4AdmissionLedger(canonicalRows=[]){
    const canonicalById=new Map((canonicalRows||[]).map(p=>[String(p?.id||''),p]).filter(([id])=>id));
    let local=readV4AdmissionLedger(), stored={};
    try{const v=(await getSetting(V4_ADMISSION_LEDGER_SETTING))?.value; if(v&&typeof v==='object'&&!Array.isArray(v))stored=v;}catch(_){ }
    // Admission records, not the old manifest, are authority. Merge only records
    // that prove their own Project ID and transaction. A stale manifest cannot grant
    // citizenship to a recovery artifact.
    const ledger={...stored,...local};
    const now=new Date().toISOString();
    for(const id of V4_BASELINE_FLEET_IDS){
      if(!canonicalById.has(id))continue;
      if(!validV4Admission(ledger[id],id))ledger[id]={projectId:id,admitted:true,source:'v4-baseline',transactionId:`baseline:${id}`,admittedAt:now,build:BUILD_VERSION};
    }
    // Drop malformed admission rows. Valid rows for projects no longer present are
    // retained as historical evidence, but they cannot enter the active manifest.
    for(const [id,row] of Object.entries({...ledger}))if(!validV4Admission(row,id))delete ledger[id];
    await persistV4AdmissionLedger(ledger);
    return ledger;
  }
  async function admitProjectToV4Fleet(projectId,{source='commissioning',detail=''}={}){
    const id=String(projectId||'').trim(); if(!id)throw new Error('Project admission requires an immutable Project ID.');
    const canonical=await readCanonicalProjectRegistry();
    if(!canonical.some(p=>String(p?.id||'')===id))throw new Error(`Project ${id} cannot be admitted before canonical registry verification.`);
    const ledger=await ensureV4AdmissionLedger(canonical);
    const existing=ledger[id];
    if(validV4Admission(existing,id))return existing;
    const record={projectId:id,admitted:true,source:String(source||'commissioning'),transactionId:`admit:${id}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2,7)}`,admittedAt:new Date().toISOString(),detail:String(detail||''),build:BUILD_VERSION};
    ledger[id]=record;
    await persistV4AdmissionLedger(ledger);
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:id,category:'project',action:'v4.1.1.project.admitted',detail:`${record.source} • ${record.transactionId}`});
    window.DarkSkyV4?.diagnostic?.('fleet_admission.complete',`${id} admitted to active fleet`,{transactionId:record.transactionId,source:record.source});
    return record;
  }
  async function addProjectToV4FleetManifest(projectId){
    // Compatibility entry point used by the project factory. In V4.1.1 this is an
    // admission transaction, not a list append.
    await admitProjectToV4Fleet(projectId,{source:'commissioning',detail:'Canonical registry read-back verified.'});
    const state=await ensureCanonicalFleetManifest({repairRegistry:false});
    return state.ids;
  }
  async function ensureCanonicalFleetManifest({repairRegistry=true}={}){
    let canonical=await readCanonicalProjectRegistry();
    const canonicalById=new Map(canonical.map(p=>[String(p?.id||''),p]).filter(([id])=>id));
    const admissions=await ensureV4AdmissionLedger(canonical);
    // Harbor Master rule: the active fleet is the intersection of canonical rows and
    // explicit valid admissions. The persisted manifest is now a projection/cache only.
    // It can never add an ID to the fleet by itself.
    const ids=Object.keys(admissions).filter(id=>canonicalById.has(id)&&validV4Admission(admissions[id],id));
    writeV4FleetManifest(ids);
    try{await setSetting(V4_FLEET_MANIFEST_SETTING,ids);}catch(_){ }

    const allowed=new Set(ids);
    const orphans=canonical.filter(p=>p?.id&&!allowed.has(String(p.id)));
    if(orphans.length){
      for(const ghost of orphans)appendV4Quarantine('unadmitted_registry_orphan',String(ghost.id),structuredClone(ghost));
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'recovery',action:'v4.1.1.harbor_master.quarantined',detail:`${orphans.length} unadmitted registry row${orphans.length===1?'':'s'} quarantined: ${orphans.map(p=>p.id).join(' • ')}`});
      window.DarkSkyV4?.diagnostic?.('fleet_admission.orphans.quarantined',`${orphans.length} unadmitted registry row${orphans.length===1?'':'s'} quarantined`,{projectIds:orphans.map(p=>p.id)});
      if(repairRegistry){
        const keep=canonical.filter(p=>allowed.has(String(p?.id||'')));
        canonical=await persistProjectRegistry(keep,{allowRemovalIds:orphans.map(p=>String(p.id))});
      }
    }

    // Security stores are strict projections of the admitted fleet. A ghost can be
    // preserved in Recovery Vault, but it cannot keep an envelope or affect counts.
    const localLedger=readV4EnvelopeLedger();
    const cleanLedger={};
    for(const id of ids)if(localLedger[id])cleanLedger[id]=localLedger[id];
    if(Object.keys(localLedger).some(id=>!allowed.has(id)))writeV4EnvelopeLedger(cleanLedger);
    try{
      const mirror=(await getSetting(V4_ENVELOPE_MIRROR_SETTING))?.value||{};
      const cleanMirror={};for(const id of ids)if(mirror?.[id])cleanMirror[id]=mirror[id];
      if(Object.keys(mirror||{}).some(id=>!allowed.has(id)))await setSetting(V4_ENVELOPE_MIRROR_SETTING,cleanMirror);
    }catch(_){ }

    const latest=repairRegistry?canonical:canonical.filter(p=>allowed.has(String(p?.id||'')));
    const memoryById=new Map((companies||[]).map(p=>[String(p?.id||''),p]));
    companies=ids.map(id=>{const row=latest.find(p=>String(p?.id||'')===id);const mem=memoryById.get(id);return row?(mem?{...mem,...row,id:row.id}:row):null;}).filter(Boolean).map(normalizeProjectCode).map(ensureProjectGovernance);
    return {ids,rows:companies,orphans,admissions};
  }

  const V4_ENVELOPE_LEDGER_KEY='darkSkyV4ProjectEnvelopesV1';
  function readV4EnvelopeLedger(){
    try{const v=JSON.parse(localStorage.getItem(V4_ENVELOPE_LEDGER_KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(_){return{}}
  }
  function writeV4EnvelopeLedger(value){localStorage.setItem(V4_ENVELOPE_LEDGER_KEY,JSON.stringify(value||{}));return value||{}}
  function buildV4ProjectEnvelope(project){
    const core=window.BlackFlagV3Core, id=String(project?.id||'').trim(); if(!id)return null;
    const namespace=core?.namespaceFor?.(id)||`bf.project.${id}`;
    return {projectId:id,namespace,schemaVersion:Number(core?.schemaVersion||8),policyVersion:String(core?.policyVersion||'4.0'),isolation:{projectId:id,namespace,crossProjectAccess:'deny'},permissions:{projectScoped:true,defaultDeny:true},sealedAt:new Date().toISOString(),build:BUILD_VERSION};
  }
  function sealProjectFromEnvelope(project,envelope){
    if(!project?.id||!envelope||String(envelope.projectId)!==String(project.id))return project;
    project.schemaVersion=Number(envelope.schemaVersion||window.BlackFlagV3Core?.schemaVersion||8);
    project.namespace=String(envelope.namespace||window.BlackFlagV3Core?.namespaceFor?.(project.id)||`bf.project.${project.id}`);
    project.isolation={...(project.isolation||{}),...(envelope.isolation||{}),projectId:project.id,namespace:project.namespace,crossProjectAccess:'deny'};
    project.permissions={...(project.permissions||{}),...(envelope.permissions||{}),policyVersion:String(envelope.policyVersion||window.BlackFlagV3Core?.policyVersion||'4.0'),projectScoped:true,defaultDeny:true};
    if(project.identity&&typeof project.identity==='object')project.identity.projectId=project.id;
    return project;
  }
  function hydrateFleetFromEnvelopeLedger(){
    const ledger=readV4EnvelopeLedger();
    if(!Array.isArray(companies))return {sealed:0,total:0};
    companies=companies.map(project=>{
      const envelope=ledger[String(project?.id||'')];
      return envelope?sealProjectFromEnvelope(project,envelope):project;
    });
    const schema=Number(window.BlackFlagV3Core?.schemaVersion||8);
    const sealed=companies.filter(p=>Number(p?.schemaVersion)===schema&&p?.namespace===(window.BlackFlagV3Core?.namespaceFor?.(p.id)||`bf.project.${p.id}`)&&p?.isolation?.projectId===p?.id&&p?.isolation?.crossProjectAccess==='deny'&&p?.permissions?.defaultDeny===true).length;
    return {sealed,total:companies.length};
  }
  function sealFleetEnvelopeLedger(){
    const prior=readV4EnvelopeLedger(), next={};
    for(const project of (companies||[])){
      const id=String(project?.id||''); if(!id)continue;
      const fresh=buildV4ProjectEnvelope(project); next[id]={...(prior[id]||{}),...fresh};
      sealProjectFromEnvelope(project,next[id]);
    }
    writeV4EnvelopeLedger(next);
    return hydrateFleetFromEnvelopeLedger();
  }

  const V4_ENVELOPE_MIRROR_SETTING='darkSkyV4ProjectEnvelopesV1';
  let v4EnvelopeConvergenceState={at:null,total:0,sealed:0,rows:[],error:''};

  function envelopeValidForProject(envelope,project){
    const core=window.BlackFlagV3Core, id=String(project?.id||'').trim(), schema=Number(core?.schemaVersion||8);
    const namespace=core?.namespaceFor?.(id)||`bf.project.${id}`;
    return !!(id&&envelope&&String(envelope.projectId||'')===id&&Number(envelope.schemaVersion)===schema&&String(envelope.namespace||'')===namespace&&String(envelope?.isolation?.projectId||'')===id&&String(envelope?.isolation?.namespace||'')===namespace&&envelope?.isolation?.crossProjectAccess==='deny'&&envelope?.permissions?.defaultDeny===true&&envelope?.permissions?.projectScoped===true);
  }

  async function ensureV4EnvelopeConvergence({persistRegistry=true,record=false}={}){
    const core=window.BlackFlagV3Core;
    const rows=[];
    if(!core||!Array.isArray(companies)){
      v4EnvelopeConvergenceState={at:new Date().toISOString(),total:0,sealed:0,rows:[],error:'Core or fleet unavailable'};
      return v4EnvelopeConvergenceState;
    }
    try{
      // v4.1.1 — Harbor Master. Explicit admissions define the fleet. The
      // registry cannot expand the denominator merely because it contains recovery
      // cargo, and memory cannot resurrect a quarantined project.
      const manifest=await ensureCanonicalFleetManifest({repairRegistry:true});
      const canonicalSeed=manifest.rows||[];
      if(canonicalSeed.length)companies=canonicalSeed.map(normalizeProjectCode).map(ensureProjectGovernance);

      const expected={};
      for(const project of companies){
        const e=buildV4ProjectEnvelope(project); if(e) expected[String(project.id)]=e;
      }
      writeV4EnvelopeLedger(expected);
      await setSetting(V4_ENVELOPE_MIRROR_SETTING,expected);
      const localRead=readV4EnvelopeLedger();
      const dbRead=(await getSetting(V4_ENVELOPE_MIRROR_SETTING))?.value||{};

      companies=companies.map(project=>sealProjectFromEnvelope(project,localRead[String(project?.id||'')])).map(project=>core.ensure(project)).map(normalizeProjectCode).map(ensureProjectGovernance);
      if(persistRegistry){
        await persistProjectRegistry(companies);
        const canonical=await readCanonicalProjectRegistry();
        companies=canonical.map(project=>sealProjectFromEnvelope(project,localRead[String(project?.id||'')])).map(project=>core.ensure(project)).map(normalizeProjectCode).map(ensureProjectGovernance);
      }

      const canonicalRows=await readCanonicalProjectRegistry();
      const canonicalById=new Map(canonicalRows.map(p=>[String(p?.id||''),p]));
      const schema=Number(core.schemaVersion||8);
      for(const project of companies){
        const id=String(project?.id||''), localEnvelope=localRead[id], dbEnvelope=dbRead?.[id], canonical=canonicalById.get(id);
        const namespace=core.namespaceFor?.(id)||`bf.project.${id}`;
        const localOk=envelopeValidForProject(localEnvelope,project);
        const dbOk=envelopeValidForProject(dbEnvelope,project);
        const memoryOk=Number(project?.schemaVersion)===schema&&String(project?.namespace||'')===namespace&&String(project?.isolation?.projectId||'')===id&&project?.isolation?.crossProjectAccess==='deny'&&project?.permissions?.defaultDeny===true;
        const registryOk=!!canonical&&Number(canonical?.schemaVersion)===schema&&String(canonical?.namespace||'')===namespace&&String(canonical?.isolation?.projectId||'')===id&&canonical?.isolation?.crossProjectAccess==='deny'&&canonical?.permissions?.defaultDeny===true;
        const ok=localOk&&dbOk&&memoryOk&&registryOk;
        rows.push({projectId:id,name:project?.name||id,registryFound:!!canonical,localEnvelope:localOk,dbEnvelope:dbOk,memorySealed:memoryOk,registrySealed:registryOk,ok});
      }
      const sealed=rows.filter(r=>r.ok).length;
      v4EnvelopeConvergenceState={at:new Date().toISOString(),total:rows.length,sealed,rows,error:''};
      window.__darkSkyV4EnvelopeConvergence=v4EnvelopeConvergenceState;
      if(record||sealed!==rows.length)window.DarkSkyV4?.diagnostic?.('commissioning.convergence',`${sealed}/${rows.length} envelope contracts converged`,{rows});
      if(sealed===rows.length&&rows.length)window.DarkSkyV4?.completeCommissioning?.(companies,{sealedCount:sealed});
      else window.DarkSkyV4?.markCommissioningFailed?.(companies,`Convergence invariant failed: ${sealed}/${rows.length}.`);
      return v4EnvelopeConvergenceState;
    }catch(err){
      v4EnvelopeConvergenceState={at:new Date().toISOString(),total:Array.isArray(companies)?companies.length:0,sealed:0,rows,error:String(err?.message||err)};
      window.__darkSkyV4EnvelopeConvergence=v4EnvelopeConvergenceState;
      window.DarkSkyV4?.markCommissioningFailed?.(companies,v4EnvelopeConvergenceState.error);
      window.DarkSkyV4?.diagnostic?.('commissioning.convergence.failed',v4EnvelopeConvergenceState.error);
      return v4EnvelopeConvergenceState;
    }
  }

  function renderV4EnvelopeTrace(state=v4EnvelopeConvergenceState){
    const box=$('v4EnvelopeTrace'); if(!box)return;
    if(!state||!state.total){box.innerHTML='';return;}
    const cell=(ok)=>`<span class="${ok?'pass':'fail'}">${ok?'PASS':'FAIL'}</span>`;
    box.innerHTML=`<div class="trace-head"><span>V4 ENVELOPE CONVERGENCE</span><strong>${state.sealed}/${state.total} SEALED</strong></div>
      <div class="trace-grid">
        <span>PROJECT</span><span>REGISTRY</span><span>LOCAL LEDGER</span><span>IDB MIRROR</span><span>MEMORY</span><span>RESULT</span>
        ${state.rows.map(r=>`<span class="trace-label">${escapeHtml(r.name)}<br><small>${escapeHtml(r.projectId)}</small></span>${cell(r.registrySealed)}${cell(r.localEnvelope)}${cell(r.dbEnvelope)}${cell(r.memorySealed)}${cell(r.ok)}`).join('')}
      </div>${state.error?`<div class="trace-note">${escapeHtml(state.error)}</div>`:'<div class="trace-note">The Broadside counter, commissioning gate, and Integrity preflight use this same convergence result.</div>'}`;
  }

  const V4_PROJECT_REFERENCE_ALIASES=Object.freeze({
    'grizzle-bear':'grizzly-bear',
    'becca-s-bloom-shop':'beccas-bloom-shop'
  });
  const V4_QUARANTINE_KEY='darkSkyV4LegacyQuarantineV1';
  const V4_ORPHAN_ORDER_TOMBSTONES_KEY='darkSkyV4OrphanOrderTombstonesV1';
  function readOrphanOrderTombstones(){
    try{const v=JSON.parse(localStorage.getItem(V4_ORPHAN_ORDER_TOMBSTONES_KEY)||'[]');return new Set(Array.isArray(v)?v.map(String):[])}catch(_){return new Set()}
  }
  function writeOrphanOrderTombstones(ids){
    try{localStorage.setItem(V4_ORPHAN_ORDER_TOMBSTONES_KEY,JSON.stringify([...new Set([...ids].map(String))].slice(-500)));return true}catch(_){return false}
  }
  function quarantinedOrderIds(){
    const ids=readOrphanOrderTombstones();
    for(const row of readV4Quarantine()){
      if((row?.kind==='order'||row?.kind==='orphan_order')&&row?.payload?.id)ids.add(String(row.payload.id));
    }
    return ids;
  }
  function isQuarantinedOrder(order){return !!order?.id&&quarantinedOrderIds().has(String(order.id));}
  function readV4Quarantine(){try{const v=JSON.parse(localStorage.getItem(V4_QUARANTINE_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}}
  function appendV4Quarantine(kind,projectId,payload){
    const rows=readV4Quarantine(), pid=String(projectId||''), payloadId=String(payload?.id||payload?.key||'');
    const duplicate=rows.some(r=>r?.kind===kind&&String(r?.projectId||'')===pid&&String(r?.payload?.id||r?.payload?.key||'')===payloadId&&payloadId);
    if(!duplicate)rows.unshift({id:`Q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,at:new Date().toISOString(),kind,projectId:pid,payload});
    localStorage.setItem(V4_QUARANTINE_KEY,JSON.stringify(rows.slice(0,250)));
  }
  function inferCanonicalProjectId(row,valid){
    const raw=String(row?.projectId||'');
    if(valid.has(raw))return raw;
    const alias=V4_PROJECT_REFERENCE_ALIASES[raw]; if(alias&&valid.has(alias))return alias;
    const prefix=String(row?.id||'').split('-')[0].toUpperCase();
    const byPrefix={IKE:'ikes-wood-signs',MUG:'mugshot-after-dark',BBS:'beccas-bloom-shop',GRZ:'grizzly-bear'}[prefix];
    if(byPrefix&&valid.has(byPrefix))return byPrefix;
    const business=String(row?.business?.name||row?.projectName||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
    if(business){
      const hits=companies.filter(p=>String(p?.name||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'')===business);
      if(hits.length===1)return hits[0].id;
      if(business==='mugsafterdark'&&valid.has('mugshot-after-dark'))return'mugshot-after-dark';
    }
    return '';
  }
  async function repairLegacyProjectReferences(){
    const valid=new Set(companies.map(p=>p.id)); let migrated=0,quarantined=0;
    // Orders: deterministic aliases/prefixes are re-scoped; ambiguous legacy rows are preserved in quarantine, never assigned by guess.
    let indexed=[]; try{indexed=await getAll(STORE_ORDERS)}catch(_){}
    const local=readLocalOrders(); const merged=new Map(); [...local,...indexed].forEach(o=>{if(o?.id)merged.set(o.id,structuredClone(o))});
    const keep=[];
    for(const order of merged.values()){
      const original=String(order?.projectId||''); const canonical=inferCanonicalProjectId(order,valid);
      if(canonical){
        if(canonical!==original)migrated++;
        order.projectId=canonical; order.namespace=window.BlackFlagV3Core?.namespaceFor?.(canonical)||`bf.project.${canonical}`;
        order.isolation={...(order.isolation||{}),projectId:canonical,namespace:order.namespace,crossProjectAccess:'deny'};
        keep.push(order);
      }else if(original && !valid.has(original)){
        appendV4Quarantine('orphan_order',original,order);
        const tombstones=readOrphanOrderTombstones(); tombstones.add(String(order.id||'')); writeOrphanOrderTombstones(tombstones);
        quarantined++;
      }else keep.push(order);
    }
    if(indexed.length||keep.length){
      try{const tr=db.transaction(STORE_ORDERS,'readwrite'),st=tr.objectStore(STORE_ORDERS);st.clear();keep.forEach(o=>st.put(o));await transactionToPromise(tr)}catch(err){console.warn('V4 order reference repair could not rewrite IndexedDB',err)}
      writeLocalOrders(keep);
    }
    // V4.1.1 — Orphan Watch: quarantine is authoritative even if a browser keeps a stale IDB row alive.
    // Physically delete tombstoned order IDs when possible; getMergedOrders also excludes them as a fail-safe.
    try{
      const tombstones=readOrphanOrderTombstones();
      if(tombstones.size){
        const tr=db.transaction(STORE_ORDERS,'readwrite'),st=tr.objectStore(STORE_ORDERS);
        tombstones.forEach(id=>{if(id)st.delete(id)});
        await transactionToPromise(tr);
        writeLocalOrders(readLocalOrders().filter(o=>!tombstones.has(String(o?.id||''))));
      }
    }catch(err){console.warn('V4 orphan order purge could not fully rewrite IndexedDB',err)}
    // Customer directory buckets are project-scoped. Known aliases move atomically; unknown buckets are quarantined intact.
    const dir=readCustomerDirectory(),next={};
    for(const [pid,bucket] of Object.entries(dir||{})){
      const canonical=valid.has(pid)?pid:(V4_PROJECT_REFERENCE_ALIASES[pid]&&valid.has(V4_PROJECT_REFERENCE_ALIASES[pid])?V4_PROJECT_REFERENCE_ALIASES[pid]:'');
      if(canonical){
        if(canonical!==pid)migrated++;
        const existing=next[canonical]&&typeof next[canonical]==='object'?next[canonical]:{};
        next[canonical]={...existing,...(bucket&&typeof bucket==='object'?bucket:{})};
      }else{
        appendV4Quarantine('customer_directory',pid,bucket); quarantined++;
      }
    }
    writeCustomerDirectory(next);
    if(migrated||quarantined){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'migration',action:'v4.1.1.orphan_watch.references.repaired',detail:`${migrated} migrated • ${quarantined} quarantined`});
      window.DarkSkyV4?.diagnostic?.('commissioning.legacy_references',`${migrated} migrated • ${quarantined} quarantined`,{quarantineKey:V4_QUARANTINE_KEY});
    }
    return {migrated,quarantined};
  }


  async function loadCompanies(){
    let canonicalRows=[];
    let savedRows=null;
    try{ canonicalRows=await readCanonicalProjectRegistry(); }catch(_){ canonicalRows=[]; }
    try{
      const saved=await getSetting('companies');
      savedRows=Array.isArray(saved?.value)&&saved.value.length?saved.value:null;
    }catch(err){
      console.warn('Legacy project registry mirror could not be read from IndexedDB',err);
    }

    const backup=readProjectRegistryBackup();
    const backupRows=Array.isArray(backup?.projects)?backup.projects:[];
    let registrySource=canonicalRows.length?'canonical-project-store':savedRows?'legacy-settings-mirror':backupRows.length?'verified-local-backup':'defaults';
    companies=reconcileFleetSources(canonicalRows,savedRows||[],backupRows);
    if(!companies.length)companies=structuredClone(DEFAULT_COMPANIES);
    companies=companies.map(normalizeProjectCode).map(ensureProjectGovernance);
    const core=window.BlackFlagV3Core;
    let migrationChanged=false;
    if(core){
      const before=structuredClone(companies);
      const migration=core.migrate(companies);
      companies=migration.projects;
      migrationChanged=!!migration.changed;
      if(migration.changed){
        core.snapshot(before,'pre-v3.8.2-identity-migration');
        core.markMigration({from:'3.3',to:'3.4',stage:'immutable-project-identity',status:'complete',projectCount:companies.length});
        core.audit({category:'migration',action:'v3.8.2.project.identity.migration.complete',detail:`${companies.length} projects`});
      }
    }

    // v3.9.6: the dedicated `projects` object store is now the canonical registry.
    // On the first launch after upgrade, seed it from the existing settings mirror
    // (or verified backup/defaults). Thereafter every fleet mutation is committed
    // atomically to the canonical store and the compatibility mirror.
    let registrySchema=0;
    try{registrySchema=Number((await getSetting(FLEET_REGISTRY_SCHEMA_KEY))?.value||0);}catch(_){}
    const aliasCanonicalized=canonicalizeRegistryAliasRows(companies);
    companies=aliasCanonicalized.rows.map(normalizeProjectCode).map(ensureProjectGovernance);
    if(registrySchema<FLEET_REGISTRY_SCHEMA_VERSION) await migrateGrizzlyProjectAliasData();
    const canonicalIdsBefore=projectRegistryIds(canonicalRows);
    const reconciledIds=projectRegistryIds(companies);
    const registryReconciled=canonicalIdsBefore.size!==reconciledIds.size || [...reconciledIds].some(id=>!canonicalIdsBefore.has(id));
    if(!canonicalRows.length || migrationChanged || aliasCanonicalized.changed || registryReconciled || registrySchema<FLEET_REGISTRY_SCHEMA_VERSION){
      companies=await persistProjectRegistry(companies,{allowRemovalIds:aliasCanonicalized.changed?[LEGACY_GRIZZLE_PROJECT_ID]:[]});
      companies=companies.map(normalizeProjectCode).map(ensureProjectGovernance);
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'migration',action:'v3.10.1.fleet.registry.reconciled',detail:`${companies.length} projects • schema ${FLEET_REGISTRY_SCHEMA_VERSION}`});
    }

    // v3.9.9 — reconcile commissioning artifacts against the canonical Project ID.
    // A verified canonical project wins and stale journal/draft artifacts are removed.
    // If the Project ID is missing, one idempotent recovery attempt uses the preserved
    // commissioned candidate and verifies it by reading the canonical store back.
    await reconcileCommissioningArtifacts({attemptRepair:true,source:'engine-boot'});

    try{ await ensureCanonicalFleetManifest({repairRegistry:true}); }catch(err){ console.warn('V4 fleet manifest repair warning',err); window.DarkSkyV4?.diagnostic?.('fleet_manifest.repair.failed',String(err?.message||err)); }
    try{ window.DarkSkyV4?.bootstrap?.(companies); }catch(err){ console.warn('V4 migration gate warning',err); window.DarkSkyV4?.diagnostic?.('migration.warning',String(err?.message||err)); }
    try{ await repairLegacyProjectReferences(); }catch(err){ console.warn('V4 legacy project-reference repair warning',err); window.DarkSkyV4?.diagnostic?.('commissioning.legacy_references.failed',String(err?.message||err)); }
    try{ await ensureV4EnvelopeConvergence({persistRegistry:true,record:true}); }catch(err){ console.warn('V4 envelope convergence warning',err); }
    writeProjectRegistryBackup(companies,`load-${registrySource}`);
  }

  function criticalIntegrityFingerprint(issue){
    return [String(issue?.code||''),String(issue?.projectId||''),String(issue?.detail||'')].join('::');
  }

  function newlyIntroducedCriticalIssues(beforeRows,afterRows){
    const core=window.BlackFlagV3Core;
    if(!core?.integrity)return [];
    const before=core.integrity(Array.isArray(beforeRows)?beforeRows:[],null);
    const after=core.integrity(Array.isArray(afterRows)?afterRows:[],null);
    const priorCounts=new Map();
    (before?.issues||[]).filter(x=>x.level==='critical').forEach(issue=>{
      const key=criticalIntegrityFingerprint(issue);
      priorCounts.set(key,(priorCounts.get(key)||0)+1);
    });
    const introduced=[];
    (after?.issues||[]).filter(x=>x.level==='critical').forEach(issue=>{
      const key=criticalIntegrityFingerprint(issue);
      const remaining=priorCounts.get(key)||0;
      if(remaining>0)priorCounts.set(key,remaining-1);
      else introduced.push(issue);
    });
    return introduced;
  }

  async function saveCompanies(){
    companies=companies.map(p=>window.BlackFlagV3Core?.ensure?.(ensureProjectGovernance(p))||ensureProjectGovernance(p));

    // v3.9.6 — Existing test/legacy integrity findings must remain visible, but they
    // must not freeze the entire fleet registry. Compare the candidate registry with
    // the last persisted registry and fail closed only when this write INTRODUCES a
    // new critical boundary violation. This permits safe commissioning and repairs
    // while preserving the strict hull-integrity standard.
    let prior=[];
    try{
      prior=await readCanonicalProjectRegistry();
      if(!prior.length){
        const current=await getSetting('companies');
        prior=Array.isArray(current?.value)?current.value:[];
      }
    }catch(err){
      console.warn('Could not read prior project registry before save',err);
      if(companies.length){
        window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'integrity',action:'project.collection.save.blocked',detail:'Prior registry unavailable; refusing unverified fleet mutation'});
        throw new Error('Dark Sky could not verify the existing fleet registry before saving. No project changes were written.');
      }
    }

    const introduced=newlyIntroducedCriticalIssues(prior,companies);
    if(introduced.length){
      const summary=introduced.slice(0,4).map(x=>`${x.code}${x.projectId?`:${x.projectId}`:''}`).join(' • ');
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'integrity',action:'project.collection.save.blocked_new_critical',detail:summary||'New critical integrity failure'});
      throw new Error(`Dark Sky blocked this write because it introduced a new hull-integrity failure. ${summary}`);
    }

    const remainingIntegrity=window.BlackFlagV3Core?.integrity?.(companies,null);
    if(remainingIntegrity?.critical){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'integrity',action:'project.collection.save.with_existing_findings',detail:`${remainingIntegrity.critical} pre-existing critical finding(s) remain visible for repair`});
    }

    const persisted=await persistProjectRegistry(companies);
    const missing=companies.filter(p=>!registryContainsProject(persisted,p.id));
    if(missing.length){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'recovery',action:'project.registry.verify_failed',detail:missing.map(p=>`${p.name}:${p.id}`).join(' • ')});
      throw new Error(`Project registry verification failed for ${missing.map(p=>p.name).join(', ')}.`);
    }
    companies=persisted.map(normalizeProjectCode).map(ensureProjectGovernance);
    writeProjectRegistryBackup(companies,'verified-atomic-save');
    return companies;
  }


  async function renameProjectDisplayName(p,newName,{actorRole='engine_admin',syncBranding=true}={}){
    if(!p?.id)return{ok:false,error:'project_missing'};
    const next=String(newName||'').trim().replace(/\s+/g,' ');
    if(next.length<2)return{ok:false,error:'name_too_short'};
    const old=String(p.name||p.identity?.displayName||'').trim();
    if(next===old)return{ok:true,unchanged:true};
    const core=window.BlackFlagV3Core;
    const projectId=p.id,namespace=p.namespace||core?.namespaceFor?.(projectId)||`bf.project.${projectId}`;
    p.identity=p.identity||{};
    p.identity.previousNames=Array.isArray(p.identity.previousNames)?p.identity.previousNames:[];
    p.identity.previousNames.unshift({name:old,changedTo:next,changedAt:new Date().toISOString(),changedBy:actorRole});
    p.identity.previousNames=p.identity.previousNames.slice(0,25);
    p.name=next;
    p.identity.displayName=next;
    p.identity.normalizedName=core?.normalizeProjectName?.(next)||next.toLocaleLowerCase();
    p.identity.projectId=projectId;
    p.identity.immutableProjectId=true;
    p.namespace=namespace;
    if(syncBranding){p.branding=p.branding||{};p.branding.businessName=next;}
    p.updatedAt=new Date().toISOString();
    await saveCompanies();
    core?.audit?.({actorRole,projectId,category:'project',action:'project.display_name.changed',detail:`${old||'(unnamed)'} → ${next} • Project ID unchanged`});
    logActivity(projectId,'Business name changed',`${old||'(unnamed)'} → ${next}`);
    return{ok:true,oldName:old,newName:next,projectId,namespace};
  }

  function projectMutationDenied(p,action,result){
    const reason=result?.error||'project_mutation_denied';
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:p?.id||null,category:'authorization',action:'project.mutation.blocked',detail:`${action} • ${reason}`});
    console.warn('Dark Sky blocked project mutation',action,p?.id,reason);
    return false;
  }

  function requireEngineProjectMutation(p,action){
    const result=window.BlackFlagV3Core?.authorizeProjectMutation?.({project:p,actorRole:'engine_admin',contextProjectId:engineActiveProjectId});
    if(!engineSessionUnlocked || engineActiveProjectId!==p?.id || (result && !result.ok)){
      return projectMutationDenied(p,action,result||{error:!engineSessionUnlocked?'engine_session_locked':'project_context_mismatch'});
    }
    return true;
  }

  function requireEngineFleetMutation(p,action){
    const result=window.BlackFlagV3Core?.authorizeProjectMutation?.({project:p,actorRole:'engine_admin',contextProjectId:p?.id||''});
    if(!engineSessionUnlocked || !p?.id || (result && !result.ok)){
      return projectMutationDenied(p,action,result||{error:!engineSessionUnlocked?'engine_session_locked':'project_missing'});
    }
    return true;
  }

  function requireOwnerProjectMutation(p,capability,action){
    const session=ownerSession();
    const result=window.BlackFlagV3Core?.authorizeProjectMutation?.({project:p,actorRole:'project_owner',contextProjectId:session?.projectId||'',capability});
    if(!session || session.projectId!==p?.id || (result && !result.ok)){
      window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId:p?.id||null,category:'authorization',action:'owner.mutation.blocked',detail:`${action} • ${result?.error||'owner_session_mismatch'}`});
      return false;
    }
    return true;
  }

  function requireDeploymentBoundary(p,d,action){
    if(!requireEngineProjectMutation(p,action))return false;
    const result=window.BlackFlagV3Core?.validateDeployment?.(p,d);
    if(result && !result.ok){
      window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:p.id,category:'authorization',action:'deployment.mutation.blocked',detail:`${action} • ${result.error} • ${(result.failures||[]).join(', ')}`});
      alert('Dark Sky blocked this deployment change because the outpost identity does not match the active project.');
      return false;
    }
    return true;
  }

  function requireEngineFleetDeploymentBoundary(p,d,action){
    if(!requireEngineFleetMutation(p,action))return false;
    const result=window.BlackFlagV3Core?.validateDeployment?.(p,d);
    if(result && !result.ok){
      window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:p.id,category:'authorization',action:'deployment.fleet_mutation.blocked',detail:`${action} • ${result.error} • ${(result.failures||[]).join(', ')}`});
      alert('Dark Sky blocked this fleet action because the outpost identity does not match its project boundary.');
      return false;
    }
    return true;
  }
  function companyById(id){return companies.find(c=>c.id===id);}
  function companyStatusLabel(c){
    return c.publish?.status==='live'?'LIVE':(c.publish?.status==='test'?'TEST':'DEVELOPMENT');
  }

  function projectScopedOrders(orders,projectId){
    return (orders||[]).filter(o=>{
      const result=window.BlackFlagV3Core?.assertProjectScope?.(o,projectId);
      return result ? result.ok : String(o?.projectId||'')===String(projectId||'');
    });
  }

  async function projectStats(p){
    const orders=await getMergedOrders();
    const rows=projectScopedOrders(orders,p.id);
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

  async function projectBrandVisual(p){
    const code=String(p?.projectCode||p?.orderPrefix||'PRJ').toUpperCase().slice(0,3);
    let logo='';
    try{logo=(await readProjectAssets(p.id))?.projectLogo||'';}catch(_){}
    return {code,logo};
  }

  async function applyProjectControlBrand(p){
    const visual=await projectBrandVisual(p);
    if(engineActiveProjectId!==p.id)return;
    const mark=$('pecBrandMark'), img=$('pecBrandLogo'), code=$('pecBrandCode');
    if(code) code.textContent=visual.code;
    if(img){
      if(visual.logo){
        img.src=visual.logo;
        img.alt=`${p.name} logo`;
        img.classList.remove('hidden');
        mark?.classList.add('has-project-logo');
      }else{
        img.removeAttribute('src');
        img.classList.add('hidden');
        mark?.classList.remove('has-project-logo');
      }
    }
  }

  async function renderFleetHealth(){
    const box=$('engineFleetHealth'); if(!box)return;
    try{
      const list=projects();
      let activeDeployments=0, attentionProjects=0, pendingOwners=0, openOrders=0;
      const flags=[];
      for(const p of list){
        try{
          const snap=await projectControlSnapshot(p);
          activeDeployments+=snap.activeDeployments.length;
          openOrders+=snap.open.length;
          if(snap.attention.length){attentionProjects++; flags.push({p,issue:snap.attention[0]});}
          const owner=ensureProjectGovernance(p).ownerAccess;
          if(owner?.status==='invited')pendingOwners++;
        }catch(err){
          attentionProjects++;
          flags.push({p,issue:{title:'Fleet health check interrupted'}});
          console.warn('Fleet health project warning',p?.id,err);
        }
      }
      box.innerHTML=`<section class="fleet-health-head"><div><span>FLEET HEALTH</span><h3>Operational picture</h3><p>One glance across every project before you enter a specific control center.</p></div><strong class="fleet-health-state ${attentionProjects?'watch':'clear'}">${attentionProjects?'WATCH':'CLEAR'}</strong></section>
        <div class="fleet-health-kpis">
          <article><span>Projects</span><strong>${list.length}</strong><small>${attentionProjects} need attention</small></article>
          <article><span>Open workload</span><strong>${openOrders}</strong><small>Across the fleet</small></article>
          <article><span>Active deployments</span><strong>${activeDeployments}</strong><small>Outposts sailing</small></article>
          <article><span>Owner invites</span><strong>${pendingOwners}</strong><small>Awaiting claim</small></article>
        </div>
        <div class="fleet-health-flags">${flags.length?flags.slice(0,4).map(({p,issue})=>`<button type="button" data-fleet-health-project="${escapeHtml(p.id)}"><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(issue.title)}</small></span><b>OPEN →</b></button>`).join(''):`<div class="fleet-health-clear"><strong>ALL PROJECTS CLEAR</strong><span>No rule-based project warnings are active.</span></div>`}</div>`;
      // Fleet Health OPEN actions are owned by the early Engine Project Command bus.
    }catch(err){
      console.warn('Fleet health render warning',err);
      box.innerHTML=`<section class="fleet-health-head"><div><span>FLEET HEALTH</span><h3>Health check interrupted</h3><p>The fleet panel stayed visible, but its live summary could not be completed. Project Command remains available below.</p></div><strong class="fleet-health-state watch">CHECK</strong></section>`;
    }
  }

  async function renderFullSailCommandDeck(){
    const host=$('fullSailCommandBody'),state=$('fullSailState');if(!host)return;
    try{
      const list=projects();let open=0,activeDeployments=0,fleetReady=0,draft=0,customerReady=0;
      for(const p of list){
        const snap=await projectControlSnapshot(p);open+=snap.open.length;activeDeployments+=snap.activeDeployments.length;
        const launch=projectFleetLaunchState(p);if(launch.key==='fleet_ready')fleetReady++;if(launch.key==='draft')draft++;customerReady+=launch.offers?.length||0;
      }
      const brief=window.DarkSkyV4?.commandBrief?.(list)||null;
      let usage='—';try{const e=await navigator.storage?.estimate?.();if(e?.usage!=null)usage=`${(e.usage/1024/1024).toFixed(1)} MB`}catch(_){}
      const posture=brief?.preflight?.ok?'CLEAR HORIZON':'WATCH';if(state){state.textContent=posture;state.className=`full-sail-state ${brief?.preflight?.ok?'clear':'watch'}`;}
      const priorities=(brief?.priorities||[]).map(x=>`<article class="full-sail-priority ${escapeHtml(x.level)}"><span>${escapeHtml(x.level.toUpperCase())}</span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.detail)}</small></article>`).join('');
      host.innerHTML=`<div class="full-sail-kpis">
        <article><span>OPEN WORKLOAD</span><strong>${open}</strong><small>${list.length} admitted vessels</small></article>
        <article><span>FLEET READY</span><strong>${fleetReady}</strong><small>${activeDeployments} active deployment${activeDeployments===1?'':'s'}</small></article>
        <article><span>CUSTOMER-READY OFFERS</span><strong>${customerReady}</strong><small>${draft} draft vessel${draft===1?'':'s'}</small></article>
        <article><span>ENGINE STORAGE</span><strong>${usage}</strong><small>${brief?.recoveryPoints||0} recovery points • ${brief?.diagnostics||0} black-box events</small></article>
      </div><div class="full-sail-lower"><div class="full-sail-priorities"><h4>Next best moves</h4>${priorities}</div><div class="full-sail-actions"><h4>Quick command</h4><button type="button" data-full-sail="watch">RUN WATCH</button><button type="button" data-full-sail="projects">PROJECT COMMAND</button><button type="button" data-full-sail="configure">CONFIGURE ENGINE</button><button type="button" data-full-sail="captain">CAPTAIN'S QUARTERS</button></div></div>`;
      host.querySelectorAll('[data-full-sail]').forEach(btn=>btn.onclick=async()=>{
        const a=btn.dataset.fullSail;if(a==='watch'){await renderFirstMateWatch();$('firstMateWatch')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(a==='projects'){$('engineProjectsSection')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(a==='configure'){openEngineConfiguration('top');}else if(a==='captain'){$('captainModeAccessBtn')?.click();}
      });
    }catch(err){console.warn('Full Sail command deck warning',err);if(state){state.textContent='CHECK';state.className='full-sail-state watch';}host.innerHTML='<p class="helper">Command Deck could not finish its live read. Fleet controls below remain available.</p>';}
  }

  function projectFleetLaunchState(p){
    const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
    const active=deployments.filter(d=>d.state==='deployed');
    const tested=deployments.filter(d=>d.state==='sea_trial'&&d.lastTestedAt);
    const trials=deployments.filter(d=>d.state==='sea_trial');
    const offers=(p.products||[]).filter(x=>x&&x.active!==false&&(x.customerReady===true||x.published===true));
    const brief=String(p.businessBrief?.text||p.description||'').trim();
    const live=p.publish?.status==='live'&&active.length>0;
    if(live)return {key:'live',label:'LIVE',step:5,detail:`${active.length} active outpost${active.length===1?'':'s'} serving customers.`,action:'open',actionLabel:'OPEN PROJECT',deployments,active,tested,trials,offers,brief};
    if(tested.length||active.length)return {key:'fleet_ready',label:'FLEET READY',step:4,detail:'Sea Trial proof is recorded. Captain approval can join this vessel to the live fleet.',action:'join',actionLabel:'JOIN FLEET',deployments,active,tested,trials,offers,brief};
    if(trials.length)return {key:'sea_trial',label:'SEA TRIAL',step:3,detail:'Complete one customer test order through the Sea Trial outpost.',action:'continue',actionLabel:'CONTINUE SEA TRIAL',deployments,active,tested,trials,offers,brief};
    if(deployments.length)return {key:'preparing',label:'PREPARING',step:2,detail:'An outpost exists. Finish its setup and begin Sea Trial.',action:'continue',actionLabel:'CONTINUE LAUNCH',deployments,active,tested,trials,offers,brief};
    if(offers.length&&brief)return {key:'preparing',label:'PREPARING',step:2,detail:'The business is defined. Create its first customer outpost.',action:'continue',actionLabel:'CREATE FIRST OUTPOST',deployments,active,tested,trials,offers,brief};
    return {key:'draft',label:'DRAFT',step:1,detail:!brief?'Finish the Business Brief so Dark Sky understands this vessel.':'Add at least one customer-ready offer before launch.',action:'continue',actionLabel:'CONTINUE LAUNCH',deployments,active,tested,trials,offers,brief};
  }

  async function renderEngineRoom(){
    // v3.9.8 — one canonical Engine refresh route. Earlier commissioning/join-fleet
    // paths called a non-existent helper after a successful registry commit, which
    // left the Engine DOM stale and made a durable project look as if it vanished.
    if(typeof window.renderBlackFlagHome==='function'){
      await window.renderBlackFlagHome();
      return true;
    }
    await renderProjectCommand();
    try{ await refreshEngineDiagnostics(); }catch(err){ console.warn('diagnostics refresh warning',err); }
    try{ await renderFleetStats(); }catch(err){ console.warn('fleet stats refresh warning',err); }
    try{ await refreshV3CommandSystems(); }catch(err){ console.warn('v4 command refresh warning',err); }
    try{ window.renderDarkSkyV4EngineStatus?.(); }catch(err){ console.warn('v4 status render warning',err); }
    try{ await renderFullSailCommandDeck(); }catch(err){ console.warn('full sail render warning',err); }
    return true;
  }

  async function joinProjectFleet(p){
    if(!p||!requireEngineFleetMutation(p,'project.join_fleet'))return false;
    const launch=projectFleetLaunchState(p);
    if(!['fleet_ready','live'].includes(launch.key)){
      alert('This vessel is not Fleet Ready yet. Continue Launch will take you to the next required step.');
      await continueProjectLaunch(p);
      return false;
    }
    if(launch.key==='live')return true;
    let outpost=launch.tested[0]||launch.active[0];
    if(!outpost){alert('Dark Sky could not find the tested outpost required to join the fleet.');return false;}
    if(!requireEngineFleetDeploymentBoundary(p,outpost,'project.join_fleet'))return false;
    if(outpost.state==='sea_trial'){
      if(!(await deploymentCommissionOrder(p,outpost)))return false;
      if(!window.BlackFlagV3Core?.canTransitionDeployment?.(outpost.state,'deployed')){
        alert('Dark Sky blocked an invalid deployment transition.');
        return false;
      }
      outpost.state='deployed';
      outpost.updatedAt=new Date().toISOString();
      outpost.manifestVersion=Number(outpost.manifestVersion||1)+1;
      normalizeDeploymentIdentity(p,outpost);
    }
    p.publish={...(p.publish||{}),status:'live'};
    p.visibility='published';
    p.published=true;
    p.lifecycle={...(p.lifecycle||{}),state:'live',version:Math.max(2,Number(p.lifecycle?.version||2)),updatedAt:new Date().toISOString()};
    p.updatedAt=new Date().toISOString();
    try{
      await saveCompanies();
    }catch(err){
      console.error('Join Fleet persistence failed',err);
      alert('Dark Sky could not finish joining this vessel to the fleet. Nothing was reported as complete. Please try again.');
      return false;
    }
    logActivity(p.id,'Project joined fleet',`${p.name} • ${outpost.name} active`);
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:p.id,category:'project',action:'project.joined_fleet',detail:`${p.name} • ${outpost.id}`});
    await renderEngineRoom();
    if(engineActiveProjectId===p.id)await renderProjectTab(p.id,'overview');
    return true;
  }

  async function continueProjectLaunch(p){
    if(!p)return;
    const launch=projectFleetLaunchState(p);
    if(launch.key==='live'){enterProject(p.id);return;}
    if(launch.key==='fleet_ready'){await joinProjectFleet(p);return;}
    await openProjectEngineControl(p.id);
    if(launch.key==='draft'){
      if(!launch.brief){await renderProjectTab(p.id,'customer');return;}
      if(!launch.offers.length){await renderProjectTab(p.id,'products');return;}
    }
    await renderProjectTab(p.id,'deployment');
    if(!launch.deployments.length){
      setTimeout(()=>document.getElementById('createDeploymentBtn')?.click(),80);
    }
  }

  function projectActivityMetricLabel(p){
    // Project Command's first KPI is backed by projectStats().orders. Keep the label
    // aligned with the value being rendered for the Grizzly Bear retail vessel even
    // while its broader customer-relationship model is still being configured.
    if(canonicalProjectId(p?.id)===CANONICAL_GRIZZLY_PROJECT_ID)return 'ORDERS';
    const type=customerRelationshipForProject(p)?.type||'purchase';
    return ({purchase:'ORDERS',service_request:'REQUESTS',quote:'QUOTES',booking:'BOOKINGS',inquiry:'INQUIRIES',partnership:'ENGAGEMENTS',application:'APPLICATIONS',reservation:'RESERVATIONS',custom_project:'PROJECTS'})[type]||'ACTIVITY';
  }

  async function renderProjectCommand(){
    const box=$('projectCommandCards');if(!box)return;
    // Reconcile before counting/rendering so Project Command cannot show a verified
    // project as both recovery cargo and a Shipyard Draft.
    const reconciliation=await reconcileCommissioningArtifacts({attemptRepair:true,source:'project-command'});
    const list=projects();
    const live=list.filter(p=>p.publish?.status==='live').length;
    const journal=readCommissionJournal();
    const journalState=journal?.project?.id && !list.some(p=>String(p.id)===String(journal.project.id)) ? ` • 1 RECOVERY PENDING` : '';
    $('projectSummaryBadge').textContent=`${list.length} PROJECTS • ${live} PUBLISHED • ${list.length-live} PRIVATE/TEST • BUILD ${BUILD_VERSION}${journalState}`;
    const cards=[];
    for(const p of list){
      const s=await projectStats(p);
      const brandVisual=await projectBrandVisual(p);
      ensureProjectGovernance(p);
      const platformState=platformStatus(p);
      const ownerState=ownerAccessLabel(p);
      const launch=projectFleetLaunchState(p);
      cards.push(`<article class="project-card ${platformState!=='approved'?'platform-blocked':''} fleet-launch-${launch.key}">
        <span class="pirate-card-ribbon fleet-launch-ribbon ${launch.key}">${escapeHtml(launch.label)}</span>
        <span class="pirate-card-watermark" aria-hidden="true">☠</span>
        <div class="project-card-head">
          <div class="project-brand-badge ${brandVisual.logo?'has-logo':'code-only'}" title="${escapeHtml(p.name)}">
            ${brandVisual.logo?`<img src="${brandVisual.logo}" alt="${escapeHtml(p.name)} logo">`:`<span>${escapeHtml(brandVisual.code)}</span>`}
          </div>
          <label class="project-publish-toggle"><input type="checkbox" data-project-publish="${escapeHtml(p.id)}" ${p.publish?.status==='live'?'checked':''}><span>${p.publish?.status==='live'?'PUBLISHED':'PRIVATE'}</span></label>
        </div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.tagline||String(p.type||p.businessType||'project').replaceAll('_',' '))}</p>
        ${(()=>{const ds=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');const active=ds.filter(d=>d.state==='deployed').length;return `<div class="project-deployment-badge ${active?'active':''}">${active?(p.publish?.status==='live'?`${active} OUTPOST${active===1?'':'S'} SAILING`:`${active} OUTPOST${active===1?'':'S'} READY`):ds.length?`${ds.length} OUTPOST${ds.length===1?'':'S'} IN HARBOR`:'STANDARD DEPLOYMENT'}</div>`;})()}
        <div class="project-governance-strip">
          <span class="platform-status ${platformState}">${platformStatusLabel(p)}</span>
          <span>${ownerState}</span>
          <span class="v3-lifecycle-badge">${escapeHtml(window.BlackFlagV3Core?.lifecycle?.(p)||'project')}</span>
        </div>
        <div class="project-kpis">
          <span><small>${escapeHtml(projectActivityMetricLabel(p))}</small><strong>${s.orders}</strong></span>
          <span><small>REVENUE · 30D</small><strong>$${s.revenueMonth.toFixed(0)}</strong></span>
          <span><small>LEDGER</small><strong>${s.completed}</strong></span>
        </div>
        <div class="project-launch-line ${launch.key}"><span>${escapeHtml(launch.label)}</span><small>${escapeHtml(launch.detail)}</small></div>
        <div class="project-card-actions">
          <button data-open-project-control="${escapeHtml(p.id)}" class="secondary-btn small">CONTROL CENTER</button>
          <button data-project-launch="${escapeHtml(p.id)}" class="primary-btn small">${escapeHtml(launch.actionLabel)}</button>
        </div>
      </article>`);
    }
    const journalRecovery=commissioningRecoveryCandidate();
    if(journalRecovery && !list.some(p=>String(p.id)===String(journalRecovery.project.id))){
      const jp=journalRecovery.project;
      const stage=String(journalRecovery.row.stage||'recovery_pending');
      const failed=stage==='recovery_failed'||stage==='recovery_pending';
      cards.push(`<article class="project-card commission-draft-card registry-recovery-card">
        <div class="project-card-head"><div class="project-brand-badge code-only"><span>${escapeHtml(commissionCode(jp.name))}</span></div><span class="commission-draft-badge">REGISTRY RECOVERY</span></div>
        <h4>${escapeHtml(jp.name)}</h4>
        <p>Dark Sky preserved this commissioned Project ID, but the canonical fleet registry has not verified it yet.</p>
        <div class="project-launch-line draft"><span>${escapeHtml(stage.replaceAll('_',' ').toUpperCase())}</span><small>${escapeHtml(journalRecovery.row.detail||'Canonical registry recovery remains pending.')}</small></div>
        <div class="project-card-actions"><button type="button" data-retry-project-registry="${escapeHtml(jp.id)}" class="primary-btn small">${failed?'RETRY RECOVERY':'VERIFY REGISTRY'}</button></div>
      </article>`);
    }
    const pendingDraft=readCommissionDraft();
    const draftShadowedByJournal=journalRecovery && draftMatchesProject(pendingDraft,journalRecovery.project);
    if(pendingDraft?.name && !draftShadowedByJournal && !list.some(p=>String(p.name||'').trim().toLowerCase()===String(pendingDraft.name||'').trim().toLowerCase())){
      cards.push(`<article class="project-card commission-draft-card">
        <div class="project-card-head"><div class="project-brand-badge code-only"><span>${escapeHtml(commissionCode(pendingDraft.name))}</span></div><span class="commission-draft-badge">SHIPYARD DRAFT</span></div>
        <h4>${escapeHtml(pendingDraft.name)}</h4>
        <p>This project has a saved commissioning draft but is not yet in the fleet registry.</p>
        <div class="project-launch-line draft"><span>COMMISSIONING</span><small>Resume the saved draft to finish adding this vessel.</small></div>
        <div class="project-card-actions"><button type="button" data-resume-commissioning="1" class="primary-btn small">CONTINUE COMMISSIONING</button></div>
      </article>`);
    }
    cards.push(`<button id="addProjectCard" class="project-card add-project-card"><div class="add-project-plus">＋</div><h4>Add Project</h4><p>Create another private business or project in the Engine.</p><span class="pirate-add-copy">RAISE ANOTHER FLAG</span></button>`);
    box.innerHTML=cards.join('');
    // Project card actions are owned by the early Engine Project Command bus.
    await renderFleetHealth();
  }

  const DEPLOYMENT_PROFILES={
    kiosk_self_service:{label:'Kiosk / Self-Service',short:'KIOSK'},
    staff_assisted:{label:'Staff-Assisted',short:'STAFF'},
    event_popup:{label:'Event / Pop-Up',short:'EVENT'},
    showroom:{label:'Showroom',short:'SHOWROOM'},
    mobile_sales:{label:'Mobile Sales',short:'MOBILE'},
    demo_exhibition:{label:'Demo / Exhibition',short:'DEMO'}
  };
  const DEPLOYMENT_STATES={
    draft:'Draft',
    sea_trial:'Sea Trial',
    deployed:'Deployed / Sailing',
    paused:'In Harbor / Paused',
    retired:'Retired'
  };
  const deploymentSelectionByProject=new Map();

  function deploymentIdFor(p){
    const code=String(p.projectCode||p.orderPrefix||'PRJ').toLowerCase().replace(/[^a-z0-9]+/g,'-');
    return `${code}-outpost-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
  }

  function migrateLegacyDeployment(p){
    p.deployments=Array.isArray(p.deployments)?p.deployments:[];
    const legacy=p.deployment?.kiosk;
    if(legacy && !p.deployments.length){
      p.deployments.push({
        id:deploymentIdFor(p),
        name:legacy.name||'Primary Kiosk',
        profile:'kiosk_self_service',
        state:legacy.enabled?'deployed':'draft',
        manifestVersion:1,
        idleMinutes:Number(legacy.idleMinutes||3),
        resetAfterComplete:legacy.resetAfterComplete!==false,
        purgeSession:legacy.purgeSession!==false,
        showStartOver:legacy.showStartOver!==false,
        resumeAfterReload:!!legacy.resumeAfterReload,
        deviceLockVerified:false,
        capabilityScope:'project_default',
        attractTitle:legacy.attractTitle||'Ready when you are.',
        createdAt:legacy.updatedAt||new Date().toISOString(),
        updatedAt:legacy.updatedAt||new Date().toISOString(),
        lastCheckIn:null,
        source:'migrated_v2_9_46'
      });
    }
    p.deployments=p.deployments.map(d=>normalizeDeploymentIdentity(p,d));
    return p.deployments;
  }

  function newProjectDeployment(p,name,profile='kiosk_self_service'){
    const id=deploymentIdFor(p), namespace=window.BlackFlagV3Core?.namespaceFor?.(p.id)||`bf.project.${p.id}`;
    return normalizeDeploymentIdentity(p,{
      id,name:name||'New Customer Device',profile,state:'draft',manifestVersion:1,idleMinutes:3,
      resetAfterComplete:true,purgeSession:true,showStartOver:true,resumeAfterReload:false,
      deviceLockVerified:false,capabilityScope:'project_default',attractTitle:'Ready when you are.',
      projectId:p.id,namespace,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),lastCheckIn:null
    });
  }

  function deploymentForEditor(p){
    const deployments=migrateLegacyDeployment(p);
    const selected=deploymentSelectionByProject.get(p.id);
    let d=deployments.find(x=>x.id===selected);
    if(!d) d=deployments.find(x=>x.state!=='retired')||deployments[0]||null;
    if(d) deploymentSelectionByProject.set(p.id,d.id);
    return d;
  }

  function deploymentCommissionOrder(p,d){
    return new Promise(resolve=>{
      let modal=document.getElementById('deploymentCommissionOrder');
      if(!modal){
        modal=document.createElement('div');
        modal.id='deploymentCommissionOrder';
        modal.className='deployment-commission-overlay';
        modal.innerHTML=`<div class="deployment-commission-card">
          <div class="commission-seal">⚓</div>
          <small>BLACK FLAG • COMMISSIONING ORDER</small>
          <h3>SEND HER TO SEA</h3>
          <div id="commissionOrderBody"></div>
          <div class="commission-actions">
            <button id="commissionCancel" class="secondary-btn" type="button">HOLD IN SEA TRIAL</button>
            <button id="commissionApprove" class="primary-btn" type="button">SEND HER TO SEA</button>
          </div>
        </div>`;
        document.body.appendChild(modal);
      }
      const readiness=deploymentReadiness(d);
      document.getElementById('commissionOrderBody').innerHTML=`
        <div class="commission-order-line"><span>VESSEL</span><strong>${escapeHtml(p.name)}</strong></div>
        <div class="commission-order-line"><span>OUTPOST</span><strong>${escapeHtml(d.name)}</strong></div>
        <div class="commission-order-line"><span>ENGINE READINESS</span><strong>${readiness.score}%</strong></div>
        <div class="commission-order-line ${d.deviceLockVerified?'pass':'warn'}"><span>DEVICE LOCK</span><strong>${d.deviceLockVerified?'VERIFIED':'NOT VERIFIED'}</strong></div>
        <p>Commissioning changes this outpost from Sea Trial to active service. Device-level iPad lock remains a separate responsibility.</p>`;
      modal.classList.add('open');
      const finish=(answer)=>{modal.classList.remove('open');resolve(answer);};
      document.getElementById('commissionCancel').onclick=()=>finish(false);
      document.getElementById('commissionApprove').onclick=()=>finish(true);
    });
  }

  function deviceAuthorizationState(d){
    if(d?.state==='retired'||d?.deviceIdentity?.status==='revoked')return 'revoked';
    if(d?.state==='paused')return 'paused';
    if(d?.state==='deployed')return 'active';
    if(d?.state==='sea_trial')return 'testing';
    return 'authorized';
  }

  function deviceStatusLabel(d){
    const s=deviceAuthorizationState(d);
    return ({revoked:'REVOKED',paused:'PAUSED',active:'ACTIVE',testing:'SEA TRIAL',authorized:'AUTHORIZED'})[s]||'AUTHORIZED';
  }

  function normalizeDeploymentIdentity(p,d){
    const namespace=window.BlackFlagV3Core?.namespaceFor?.(p.id)||`bf.project.${p.id}`;
    d.projectId=p.id;
    d.namespace=namespace;
    d.authorization={...(d.authorization||{}),role:'device',projectId:p.id,namespace,scope:'customer_session',crossProjectAccess:'deny',policyVersion:'3.3',engineAccess:false,ownerAccess:false};
    d.deviceIdentity=d.deviceIdentity&&typeof d.deviceIdentity==='object'?d.deviceIdentity:{
      deviceId:'DEV-'+String(d.id||deploymentIdFor(p)).replace(/[^a-z0-9-]/gi,'').slice(-28),
      projectId:p.id,namespace,issuedAt:d.createdAt||new Date().toISOString()
    };
    d.deviceIdentity.projectId=p.id;
    d.deviceIdentity.namespace=namespace;
    d.deviceIdentity.status=deviceAuthorizationState(d);
    d.deviceIdentity.lastSeen=d.lastCheckIn||d.deviceIdentity.lastSeen||null;
    return d;
  }

  function deploymentStateClass(state){
    return ['deployed','sea_trial','paused','retired'].includes(state)?state:'draft';
  }

  function deploymentReadiness(d){
    if(!d)return {score:0,checks:[]};
    const checks=[
      {label:'Project isolation',pass:true,detail:'Project-owned manifest'},
      {label:'Customer-session purge',pass:d.purgeSession!==false,detail:d.purgeSession!==false?'Ready':'Turn purge on'},
      {label:'Admin separation',pass:true,detail:'Project admin remains protected'},
      {label:'Idle reset',pass:Number(d.idleMinutes)>0,detail:`${Number(d.idleMinutes||0)} min`},
      {label:'Device-level lock',pass:!!d.deviceLockVerified,warning:!d.deviceLockVerified,detail:d.deviceLockVerified?'Verified':'Not verified'}
    ];
    const required=checks.filter(x=>!x.warning);
    const score=Math.round(required.filter(x=>x.pass).length/required.length*100);
    return {score,checks};
  }


  function deploymentVoyageState(p,d){
    if(!d)return {step:1,label:'Configure',nextLabel:'Create Outpost',nextAction:'create',detail:'Create an outpost to begin.'};
    const saved=Number(d.manifestVersion||1)>1;
    const shellReady=projectCustomerOperatingModelReady(p);
    if(d.state==='draft'&&!saved) return {step:1,label:'Configure',nextLabel:'Save Outpost Setup',nextAction:'save',detail:'Finish the outpost setup and save it before Sea Trial.',shellReady};
    if(d.state==='draft') return {step:2,label:'Saved',nextLabel:'Begin Sea Trial',nextAction:'sea_trial',detail:'Configuration is saved. Start a controlled Sea Trial.',shellReady};
    if(d.state==='sea_trial'&&!shellReady) return {step:3,label:'Sea Trial',nextLabel:'Add Customer Offer',nextAction:'offer',detail:'This vessel needs one customer-ready offer before Dark Sky can open a real customer test.',shellReady};
    if(d.state==='sea_trial'&&!d.lastTestedAt) return {step:3,label:'Sea Trial',nextLabel:'Open Test Outpost',nextAction:'test',detail:'Open the real customer experience and complete one test order.',shellReady};
    if(d.state==='sea_trial') return {step:4,label:'Tested',nextLabel:'Activate Outpost',nextAction:'deployed',detail:'Customer test order recorded. Activate when you are satisfied.',shellReady};
    if(d.state==='deployed') return {step:5,label:'Active',nextLabel:'Open Customer Experience',nextAction:'test',detail:'This outpost is active.',shellReady};
    if(d.state==='paused') return {step:5,label:'Paused',nextLabel:'Resume Outpost',nextAction:'deployed',detail:'The outpost is paused and can be resumed.',shellReady};
    return {step:5,label:'Retired',nextLabel:'Retired',nextAction:'none',detail:'This outpost is preserved as history.',shellReady};
  }

  function openDeploymentTestDock(p,d){
    const shellReady=projectCustomerOperatingModelReady(p);
    if(shellReady){
      window.__deploymentCustomerContext={projectId:p.id,deploymentId:d.id,state:d.state,attractTitle:d.attractTitle||'Ready when you are.'};
      d.testOpenedAt=new Date().toISOString();
      d.updatedAt=d.testOpenedAt;
      saveCompanies().catch(()=>{});
      closeEngineWorkspace($('projectEngineControl'));
      enterProject(p.id);
      return;
    }
    alert('Add one customer-ready offer first. Dark Sky will then open a real Sea Trial customer experience.');
    renderProjectTab(p.id,'deployment');
  }

  function deploymentManifestHtml(p,d){
    if(!d)return '';
    const readiness=deploymentReadiness(d);
    const profile=DEPLOYMENT_PROFILES[d.profile]||DEPLOYMENT_PROFILES.kiosk_self_service;
    return `<div class="deployment-manifest">
      <div class="manifest-head"><span>DEPLOYMENT MANIFEST</span><strong>v${Number(d.manifestVersion||1)}</strong></div>
      <div class="manifest-trust-strip"><span>DEVICE ${escapeHtml(d.deviceIdentity?.deviceId||'PENDING')}</span><span>${escapeHtml(deviceStatusLabel(d))}</span><span>PROJECT ONLY</span><span>NO ENGINE ACCESS</span></div>
      <div class="manifest-grid">
        <div><small>VESSEL</small><b>${escapeHtml(p.projectCode||p.orderPrefix||'PRJ')} • ${escapeHtml(p.name)}</b></div>
        <div><small>OUTPOST</small><b>${escapeHtml(d.name)}</b></div>
        <div><small>PROFILE</small><b>${escapeHtml(profile.label)}</b></div>
        <div><small>LIFECYCLE</small><b>${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)}</b></div>
        <div><small>SESSION BOUNDARY</small><b>${d.purgeSession!==false?'PURGE BETWEEN CUSTOMERS':'NEEDS ATTENTION'}</b></div>
        <div><small>CAPABILITY SCOPE</small><b>${d.capabilityScope==='project_default'?'PROJECT DEFAULT':'APPROVED SUBSET'}</b></div>
        <div><small>MANIFEST REVISION</small><b>${Number(d.manifestVersion||1)}</b></div>
        <div><small>SEA-TRIAL READINESS</small><b>${readiness.score}%</b></div>
      </div>
    </div>`;
  }

  function deploymentSnapshot(){
    return companies.map(p=>{
      const deployments=migrateLegacyDeployment(p);
      const active=deployments.filter(d=>d.state==='deployed');
      const attention=deployments.filter(d=>d.state==='sea_trial'||d.state==='paused'||(d.state==='deployed'&&deploymentReadiness(d).score<100));
      return {
        projectId:p.id,
        code:p.projectCode||p.orderPrefix||'PRJ',
        name:p.name,
        totalOutposts:deployments.filter(d=>d.state!=='retired').length,
        activeOutposts:active.length,
        attentionOutposts:attention.length,
        outposts:deployments.map(d=>{
          const ready=deploymentReadiness(d);
          const reasons=[];
          if(d.state==='paused') reasons.push('Returned to harbor / paused');
          if(d.state==='sea_trial') reasons.push('Sea Trial in progress');
          if(d.state==='deployed'&&ready.score<100) reasons.push('Engine readiness needs attention');
          if(!d.deviceLockVerified && d.profile==='kiosk_self_service') reasons.push('Device-level kiosk lock not verified');
          return {
            id:d.id,name:d.name,profile:d.profile,state:d.state,
            manifestVersion:Number(d.manifestVersion||1),
            readiness:ready.score,
            deviceLockVerified:!!d.deviceLockVerified,
            authorizationState:deviceAuthorizationState(d),
            deviceId:d.deviceIdentity?.deviceId||null,
            attentionReasons:reasons,
            lastCheckIn:d.lastCheckIn||null
          };
        })
      };
    });
  }
  window.blackFlagDeploymentFleetSnapshot=deploymentSnapshot;

  function projectCustomerRows(projectId){
    const directory=readCustomerDirectory();
    const rows=directory?.[projectId]||{};
    return Object.values(rows).filter(x=>String(x?.projectId||'')===String(projectId||''));
  }

  function projectControlMoney(value){
    return '$'+Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function projectControlTrend(current,previous,{money=false}={}){
    const c=Number(current||0), p=Number(previous||0);
    if(!p && !c) return {label:'No activity yet',tone:'flat'};
    if(!p && c) return {label:'New activity',tone:'up'};
    const pct=((c-p)/Math.abs(p))*100;
    const prefix=pct>0?'+':'';
    return {label:`${prefix}${pct.toFixed(0)}% vs prior 30 days`,tone:pct>0?'up':pct<0?'down':'flat'};
  }

  function projectControlTime(value){
    if(!value)return '—';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '—';
    return d.toLocaleString();
  }

  function projectControlAgeHours(value){
    const t=new Date(value||0).getTime();
    return Number.isFinite(t)&&t>0 ? (Date.now()-t)/3600000 : 0;
  }

  async function projectControlSnapshot(p){
    const all=await getMergedOrders();
    const orders=approvedProjectOrders(all,p).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    const now=Date.now(), d30=30*86400000, d60=60*86400000;
    const recent=orders.filter(o=>{const t=new Date(o.createdAt||0).getTime();return t>=now-d30;});
    const prior=orders.filter(o=>{const t=new Date(o.createdAt||0).getTime();return t>=now-d60&&t<now-d30;});
    const revenue30=recent.reduce((s,o)=>s+(Number(o.price)||0),0);
    const revenuePrior=prior.reduce((s,o)=>s+(Number(o.price)||0),0);
    const open=orders.filter(o=>canonicalOrderStatus(o.status)!=='Completed');
    const newOrders=orders.filter(o=>canonicalOrderStatus(o.status)==='New');
    const completed=orders.filter(o=>canonicalOrderStatus(o.status)==='Completed');
    const customers=projectCustomerRows(p.id).sort((a,b)=>String(b.lastOrderDate||'').localeCompare(String(a.lastOrderDate||'')));
    const repeatCustomers=customers.filter(c=>Number(c.orderCount||0)>1);
    const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
    const activeDeployments=deployments.filter(d=>d.state==='deployed');
    const activity=readActivity()
      .filter(x=>x.projectId===p.id && String(x.action||'').toLowerCase()!=='project opened')
      .slice(0,5);
    const ledger=projectLedger(p.id);
    const attention=[];

    newOrders.filter(o=>projectControlAgeHours(o.createdAt)>=48).slice(0,3).forEach(o=>attention.push({
      level:'watch',title:`New ${activityTermsForProject(p).lowerSingular} waiting ${Math.floor(projectControlAgeHours(o.createdAt)/24)}d`,detail:o.id,tab:'orders'
    }));
    deployments.forEach(d=>{
      const readiness=deploymentReadiness(d);
      if(d.state==='sea_trial') attention.push({level:'info',title:'Deployment in Sea Trial',detail:d.name||d.id,tab:'deployment'});
      if(d.state==='deployed'&&readiness.score<100) attention.push({level:'watch',title:'Deployment readiness needs attention',detail:`${d.name||d.id} • ${readiness.score}%`,tab:'deployment'});
      if(d.state==='paused') attention.push({level:'info',title:'Deployment paused',detail:d.name||d.id,tab:'deployment'});
    });
    const ownerState=ensureProjectGovernance(p).ownerAccess.status;
    if(p.ownerAccess?.enabled && ownerState!=='active') attention.push({level:'info',title:'Owner access not active',detail:p.ownerAccess?.ownerEmail||'Invitation not completed',tab:'owner'});
    if(!(p.products||[]).length) attention.push({level:'setup',title:'No products or services configured',detail:'Add the first offer before launch.',tab:'products'});
    if((p.products||[]).length && !(p.products||[]).some(x=>x.published)) attention.push({level:'info',title:'No customer-ready offers',detail:'Products exist, but none are published.',tab:'products'});
    if(['test','live'].includes(p.publish?.status) && !deployments.length) attention.push({level:'watch',title:'No deployment commissioned',detail:'This project is exposed beyond development without an outpost record.',tab:'deployment'});
    if(p.publish?.status==='live' && !activeDeployments.length) attention.push({level:'watch',title:'Live project has no active deployment',detail:'Review publishing and deployment state.',tab:'deployment'});
    if(p.payments?.enabled && (!p.payments?.provider || p.payments.provider==='not_configured')) attention.push({level:'watch',title:'Payments enabled without provider',detail:'Select a payment provider or disable payment capability.',tab:'payments'});
    if(!Array.isArray(p.workflow)||p.workflow.length<2) attention.push({level:'info',title:'Using suggested workflow',detail:`Dark Sky is using the ${customerRelationshipForProject(p).label} operating model. Customize it only if this business works differently.`,tab:'workflow'});

    const status=attention.some(x=>x.level==='watch')?'WATCH':(p.publish?.status==='live'?'OPERATING':'SETUP');
    return {
      orders,recent,prior,revenue30,revenuePrior,open,newOrders,completed,
      customers,repeatCustomers,deployments,activeDeployments,activity,ledger,attention,status,
      orderTrend:projectControlTrend(recent.length,prior.length),
      revenueTrend:projectControlTrend(revenue30,revenuePrior,{money:true})
    };
  }

  function projectControlKpi(label,value,meta,id){
    return `<article class="pc-kpi-card"><span>${escapeHtml(label)}</span><strong${id?` id="${id}"`:''}>${escapeHtml(String(value))}</strong><small>${escapeHtml(meta||'')}</small></article>`;
  }

  async function renderProjectControlOverview(p){
    const box=$('projectOverviewLive');
    if(!box || engineActiveProjectId!==p.id)return;
    const s=await projectControlSnapshot(p);
    if(engineActiveProjectId!==p.id)return;
    const revenueTrend=s.revenueTrend, orderTrend=s.orderTrend;
    const attention=s.attention.length?s.attention.slice(0,6).map(x=>`<button class="pc-attention-row ${escapeHtml(x.level)}" data-project-jump="${escapeHtml(x.tab)}" type="button"><span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.detail)}</small></span><b>VIEW →</b></button>`).join(''):
      `<div class="pc-clear-state"><strong>NO IMMEDIATE FLAGS</strong><span>Dark Sky has no rule-based attention items for this project right now.</span></div>`;
    const recentActivity=s.activity.length?s.activity.map(x=>`<div class="pc-activity-row"><span><strong>${escapeHtml(x.action||'Activity')}</strong><small>${escapeHtml(x.detail||'')}</small></span><time>${escapeHtml(projectControlTime(x.at))}</time></div>`).join(''):
      `<div class="pc-empty-inline">No meaningful project changes have been recorded yet.</div>`;
    const newestOrders=s.orders.slice(0,5).map(o=>`<button class="pc-order-pulse" data-project-jump="orders" type="button"><span><strong>${escapeHtml(o.id)}</strong><small>${escapeHtml(o.customerName||'Customer not named')}</small></span><span><b>${escapeHtml(canonicalOrderStatus(o.status))}</b><small>${escapeHtml(compactOrderDate(o.createdAt))}</small></span></button>`).join('')||`<div class="pc-empty-inline">No approved ${escapeHtml(activityTermsForProject(p).lowerPlural)} yet.</div>`;
    const customerSignal=s.customers.length?`${s.repeatCustomers.length} repeat customer${s.repeatCustomers.length===1?'':'s'}`:'Customer history begins with the first order';
    const deploymentSignal=s.deployments.length?`${s.activeDeployments.length} deployed • ${s.deployments.length} total active records`:'No deployments commissioned yet';

    box.innerHTML=`
      <section class="pc-overview-hero">
        <div>
          <div class="pc-overview-eyebrow">COMMAND VIEW</div>
          <h4>${escapeHtml(p.name)}</h4>
          <p>${escapeHtml(p.description||'Project operating overview.')}</p>
        </div>
        <div class="pc-operational-state ${s.status.toLowerCase()}"><span>OPERATIONAL STATE</span><strong>${s.status}</strong><small>${escapeHtml(platformStatusLabel(p))}</small></div>
      </section>

      ${(()=>{const launch=projectFleetLaunchState(p);return `<section class="pc-fleet-launch-lane ${launch.key}">
        <div class="pc-fleet-launch-copy"><span>FLEET COMMISSIONING LANE</span><h4>${escapeHtml(launch.label)}</h4><p>${escapeHtml(launch.detail)}</p></div>
        <div class="pc-fleet-launch-progress" aria-label="Fleet launch progress">${['Create','Prepare','Sea Trial','Fleet Ready','Live'].map((label,i)=>`<span class="${launch.step>i+1?'done':''} ${launch.step===i+1?'current':''}"><b>${i+1}</b>${label}</span>`).join('')}</div>
        <button type="button" data-project-launch-action="${escapeHtml(p.id)}" class="primary-btn pc-fleet-launch-action">${escapeHtml(launch.actionLabel)}</button>
      </section>`})()}

      <section class="pc-kpi-grid" aria-label="Project operating indicators">
        ${projectControlKpi('Revenue · 30 days',projectControlMoney(s.revenue30),revenueTrend.label)}
        ${projectControlKpi('Orders · 30 days',s.recent.length,orderTrend.label)}
        ${projectControlKpi('Open workload',s.open.length,`${s.newOrders.length} new • ${s.completed.length} completed all-time`)}
        ${projectControlKpi('Customers',s.customers.length,customerSignal)}
        ${projectControlKpi('Deployments',s.activeDeployments.length,deploymentSignal)}
        ${projectControlKpi('Completed ledger',s.ledger.length,`${projectControlMoney(s.ledger.reduce((sum,x)=>sum+(Number(x.revenue)||0),0))} recorded revenue`)}
      </section>

      <section class="pc-command-grid">
        <article class="pc-command-panel pc-attention-panel">
          <header><div><span>NEEDS ATTENTION</span><h4>What should I look at?</h4></div><b>${s.attention.length}</b></header>
          <div>${attention}</div>
        </article>
        <article class="pc-command-panel">
          <header><div><span>${escapeHtml(activityTermsForProject(p).plural.toUpperCase())} PULSE</span><h4>Latest business activity</h4></div><button data-project-jump="orders" type="button">ALL ${escapeHtml(activityTermsForProject(p).plural.toUpperCase())}</button></header>
          <div>${newestOrders}</div>
        </article>
      </section>

      <section class="pc-command-grid pc-command-grid-lower pc-overview-compact-row">
        <article class="pc-command-panel pc-activity-panel">
          <header><div><span>RECENT CHANGES</span><h4>Meaningful activity</h4></div><small class="pc-panel-hint">Latest 5 changes</small></header>
          <div class="pc-activity-list">${recentActivity}</div>
        </article>
        <article class="pc-command-panel pc-project-profile pc-project-profile-compact">
          <header><div><span>PROJECT PROFILE</span><h4>Operating identity</h4></div><button data-project-jump="marketing" type="button">EDIT IDENTITY</button></header>
          <dl>
            <div><dt>Business</dt><dd>${escapeHtml(p.name)}</dd></div>
            <div><dt>Project ID</dt><dd>${escapeHtml(p.id)}</dd></div>
            <div><dt>State</dt><dd>${escapeHtml(p.lifecycle?.state||p.status||'draft')} · ${escapeHtml(p.publish?.status||'development')}</dd></div>
            <div><dt>Owner</dt><dd>${escapeHtml(ownerAccessLabel(p))}</dd></div>
          </dl>
        </article>
      </section>

      <section class="pc-quick-actions" aria-label="Project quick actions">
        <div class="pc-quick-actions-head"><span>QUICK ACTIONS</span><strong>Common commands</strong></div>
        <div class="pc-quick-actions-grid">
          <button data-project-jump="orders" type="button"><b>${escapeHtml(activityTermsForProject(p).plural.toUpperCase())}</b><small>Open workload</small></button>
          <button data-project-jump="customers" type="button"><b>CUSTOMERS</b><small>History & contact</small></button>
          <button data-project-jump="deployment" type="button"><b>DEPLOYMENTS</b><small>Outposts & state</small></button>
          <button data-project-jump="marketing" type="button"><b>EDIT BUSINESS</b><small>Name & brand</small></button>
          <button data-project-jump="owner" type="button"><b>OWNER ACCESS</b><small>Handoff & access</small></button>
          <button data-project-jump="payments" type="button"><b>PAYMENTS</b><small>Provider readiness</small></button>
        </div>
      </section>`;
    bindProjectControlJumpLinks(p);
    box.querySelectorAll('[data-project-launch-action]').forEach(btn=>btn.addEventListener('click',async()=>{const target=projectById(btn.dataset.projectLaunchAction);if(target)await continueProjectLaunch(target);}));
  }

  function monthlyProjectBuckets(orders,count=6){
    const rows=[];
    const now=new Date();
    for(let i=count-1;i>=0;i--){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label=d.toLocaleDateString(undefined,{month:'short',year:'2-digit'});
      const monthOrders=orders.filter(o=>String(o.createdAt||'').slice(0,7)===key);
      rows.push({key,label,orders:monthOrders.length,revenue:monthOrders.reduce((sum,o)=>sum+(Number(o.price)||0),0)});
    }
    return rows;
  }

  async function renderProjectAnalytics(p){
    const box=$('projectAnalyticsLive');
    if(!box || engineActiveProjectId!==p.id)return;
    const s=await projectControlSnapshot(p);
    if(engineActiveProjectId!==p.id)return;
    const buckets=monthlyProjectBuckets(s.orders,6);
    const maxOrders=Math.max(1,...buckets.map(x=>x.orders));
    const statusCounts={};
    s.orders.forEach(o=>{const st=canonicalOrderStatus(o.status);statusCounts[st]=(statusCounts[st]||0)+1;});
    box.innerHTML=`
      <section class="pc-analytics-head"><div><span>PROJECT ANALYTICS</span><h4>Operational signals we can prove.</h4><p>These numbers come from project-scoped orders, customers, ledgers and deployments already stored by Dark Sky. Visitor and conversion telemetry are intentionally not invented.</p></div><button data-project-jump="overview" type="button">← OVERVIEW</button></section>
      <section class="pc-kpi-grid">
        ${projectControlKpi('Orders · all time',s.orders.length,`${s.completed.length} completed`)}
        ${projectControlKpi('Revenue · 30 days',projectControlMoney(s.revenue30),s.revenueTrend.label)}
        ${projectControlKpi('Customers',s.customers.length,`${s.repeatCustomers.length} repeat`)}
        ${projectControlKpi('Avg order · 30 days',s.recent.length?projectControlMoney(s.revenue30/s.recent.length):projectControlMoney(0),'Recorded order value')}
      </section>
      <section class="pc-command-grid">
        <article class="pc-command-panel pc-monthly-panel"><header><div><span>6-MONTH ORDER VOLUME</span><h4>Operating rhythm</h4></div></header><div class="pc-monthly-bars">${buckets.map(x=>`<div class="pc-month-row"><span>${escapeHtml(x.label)}</span><div><i style="width:${x.orders?Math.max(3,(x.orders/maxOrders)*100):0}%"></i></div><strong>${x.orders}</strong><small>${escapeHtml(projectControlMoney(x.revenue))}</small></div>`).join('')}</div></article>
        <article class="pc-command-panel"><header><div><span>WORKFLOW MIX</span><h4>Order status</h4></div></header><div class="pc-status-stack">${Object.entries(statusCounts).length?Object.entries(statusCounts).map(([k,v])=>`<div><span>${escapeHtml(k)}</span><strong>${v}</strong></div>`).join(''):'<div class="pc-empty-inline">No orders yet.</div>'}</div></article>
      </section>
      <section class="pc-command-grid pc-command-grid-lower">
        <article class="pc-command-panel"><header><div><span>CUSTOMER SIGNAL</span><h4>Relationship depth</h4></div></header><div class="pc-customer-signal"><strong>${s.customers.length}</strong><span>known project customers</span><strong>${s.repeatCustomers.length}</strong><span>repeat customers</span><strong>${s.customers.reduce((sum,c)=>sum+Number(c.orderCount||0),0)}</strong><span>customer-linked orders</span></div></article>
        <article class="pc-command-panel"><header><div><span>TELEMETRY BOUNDARY</span><h4>What Dark Sky does not claim yet</h4></div></header><div class="pc-telemetry-boundary"><p><b>Visitors:</b> not instrumented</p><p><b>Conversion rate:</b> not instrumented</p><p><b>Time on page:</b> not instrumented</p><p><b>Campaign attribution:</b> not instrumented</p><small>These become available only after real deployment telemetry is installed.</small></div></article>
      </section>`;
    bindProjectControlJumpLinks(p);
  }

  function bindProjectControlJumpLinks(p){
    $('projectTabContent')?.querySelectorAll('[data-project-jump]').forEach(btn=>{
      btn.addEventListener('click',()=>renderProjectTab(p.id,btn.dataset.projectJump));
    });
  }

  function projectModuleHero(p,eyebrow,title,copy,meta=''){
    return `<section class="pc-module-hero"><div><span>${escapeHtml(eyebrow)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(copy)}</p></div>${meta?`<div class="pc-module-meta">${meta}</div>`:''}</section>`;
  }

  function projectLifecycleDisplay(p){
    const state=window.BlackFlagV3Core?.lifecycle?.(p)||p.lifecycle?.state||'draft';
    const labels={draft:'Draft',configured:'Configured',owner_invited:'Owner Invited',owner_active:'Owner Active',deployment_ready:'Deployment Ready',testing:'Testing',live:'Live',suspended:'Suspended',relationship_ended:'Relationship Ended',archived:'Archived'};
    return labels[state]||String(state).replaceAll('_',' ');
  }

  function projectTabsHtml(p,tab){
    const products=p.products||[];
    if(tab==='overview') return `<div id="projectOverviewLive" class="pc-command-shell"><div class="pc-loading-state"><strong>Reading project signals…</strong><span>Orders, customers, deployments, ledger and activity stay scoped to ${escapeHtml(p.name)}.</span></div></div>`;
    if(tab==='analytics') return `<div id="projectAnalyticsLive" class="pc-command-shell"><div class="pc-loading-state"><strong>Building project analytics…</strong><span>Only project-scoped data that Dark Sky can verify will be shown.</span></div></div>`;

    if(tab==='owner'){
      ensureProjectGovernance(p);
      purgeExpiredOwnerInvitation(p);
      const oa=p.ownerAccess;
      const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
      return `<div class="owner-access-shell">
        <section class="owner-access-hero">
          <div class="owner-access-hero-copy">
            <div class="owner-access-eyebrow">PROJECT OWNER ACCESS</div>
            <h3>${escapeHtml(p.name)}</h3>
            <p>Give the owner a secure, project-scoped business portal without exposing Black Flag, the Engine Room, Captain authority, or another project's data.</p>
          </div>
          <div class="owner-access-state">
            <span>${escapeHtml(ownerAccessLabel(p))}</span>
            <strong>${escapeHtml(platformStatusLabel(p))}</strong>
          </div>
        </section>
        <div class="pec-grid">
          <article class="pec-card owner-access-card owner-identity-card ${oa.ownerName||oa.ownerEmail?'owner-identity-saved':''}">
            <div class="owner-card-heading"><div><span>01</span><h4>Owner Identity</h4></div><small>WHO OWNS THIS BUSINESS</small></div>
            ${(oa.ownerName||oa.ownerEmail)?`
              <div class="owner-saved-banner"><span>✓</span><div><strong>OWNER IDENTITY SAVED</strong><small>Locked to prevent accidental changes.</small></div></div>
            `:''}
            <label>Owner name<input id="ownerAccessName" value="${escapeHtml(oa.ownerName||'')}" placeholder="Business owner" ${(oa.ownerName||oa.ownerEmail)?'readonly':''}></label>
            <label>Owner email<input id="ownerAccessEmail" type="email" value="${escapeHtml(oa.ownerEmail||'')}" placeholder="owner@example.com" ${(oa.ownerName||oa.ownerEmail)?'readonly':''}></label>
            <div class="owner-claim-state"><span>ACCESS STATE</span><strong>${escapeHtml(ownerAccessLabel(p))}</strong></div>
            <div class="owner-identity-actions">
              <button id="saveOwnerAccess" class="primary-btn ${(oa.ownerName||oa.ownerEmail)?'hidden':''}" type="button">SAVE OWNER IDENTITY</button>
              <button id="editOwnerAccess" class="secondary-btn ${!(oa.ownerName||oa.ownerEmail)?'hidden':''}" type="button">EDIT OWNER IDENTITY</button>
              <button id="cancelOwnerEdit" class="secondary-btn hidden" type="button">CANCEL EDIT</button>
            </div>
            <p class="helper">Owner access becomes active only after a valid invitation is claimed. Editing owner identity does not grant access by itself.</p>
          </article>
          <article class="pec-card owner-access-card owner-invitation-card">
            <div class="owner-card-heading"><div><span>02</span><h4>Owner Invitation</h4></div><small>CLAIM ACCESS</small></div>
            <p class="helper">Generate a one-time project-scoped claim link. It expires after 7 days.</p>
            <div class="owner-invite-status"><span>INVITATION</span><strong>${escapeHtml(ownerInviteStatus(p).toUpperCase())}</strong></div>
            <div class="owner-invite-actions">
              <button id="generateOwnerInvite" class="primary-btn small" type="button">GENERATE TEST INVITATION</button>
              <button id="revokeOwnerInvite" class="secondary-btn small" type="button" ${!oa.invitation||ownerInviteStatus(p)==='revoked'?'disabled':''}>REVOKE INVITATION</button>
              <button id="previewOwnerPortal" class="secondary-btn small" type="button">PREVIEW OWNER PORTAL</button>
            </div>
            <div id="ownerInviteOutput" class="owner-invite-output hidden">
              <label>Claim link<textarea id="ownerInviteLink" readonly></textarea></label>
              <div class="owner-invite-output-actions">
                <button id="copyOwnerInviteLink" class="secondary-btn small" type="button">COPY CLAIM LINK</button>
                <button id="openOwnerInviteLink" class="secondary-btn small" type="button">OPEN TEST CLAIM</button>
              </div>
              <p id="ownerInviteExpiry" class="helper"></p>
            </div>
            <p class="owner-test-flight-note"><strong>TEST FLIGHT:</strong> This proves the invitation and project-isolation flow locally. Secure owner access from another device still requires the server-side identity service.</p>
          </article>
          <article class="pec-card owner-access-card owner-capabilities-card">
            <div class="owner-card-heading"><div><span>03</span><h4>Owner Capabilities</h4></div><small>PROJECT-SCOPED PERMISSIONS</small></div>
            <p class="helper">Capabilities are restricted to this project's namespace.</p>
            <div class="owner-capability-grid">${OWNER_CAPABILITIES.map(c=>`<label><input type="checkbox" data-owner-capability="${c}" ${oa.capabilities.includes(c)?'checked':''}> ${c.replace(/_/g,' ').toUpperCase()}</label>`).join('')}</div>
          </article>
          <article class="pec-card owner-access-card owner-deployment-card">
            <div class="owner-card-heading"><div><span>04</span><h4>Deployment Access</h4></div><small>AUTHORIZED DEVICES</small></div>
            <p><strong>${deployments.length}</strong> registered deployment${deployments.length===1?'':'s'}</p>
            <p class="helper">A kiosk/device receives project-scoped device authorization, never owner or Engine credentials.</p>
            <div class="owner-device-list">${deployments.length?deployments.map(d=>`<div><strong>${escapeHtml(d.name)}</strong><span>${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)} • ${escapeHtml(DEPLOYMENT_PROFILES[d.profile]?.label||d.profile)}</span></div>`).join(''):'<p class="helper">No deployment devices registered yet.</p>'}</div>
          </article>
          <article class="pec-card owner-access-card owner-security-card">
            <div class="owner-card-heading"><div><span>05</span><h4>Security Boundary</h4></div><small>BLACK FLAG BULKHEAD</small></div>
            <p>Owner access cannot cross project namespaces, alter another project's ledger or marketing, enter Black Flag, or invoke Captain authority.</p>
            <p class="helper">Captain retains platform-wide visibility and final business-relationship authority.</p>
          </article>
        </div>
      </div>`;
    }

    if(tab==='marketing') return `<div class="marketing-brand-shell">
      <div class="marketing-brand-hero">
        <div>
          <div class="engine-kicker">PROJECT MARKETING</div>
          <h3>${escapeHtml(p.name)}</h3>
          <p>Brand identity and customer-facing graphics for this project only.</p>
        </div>
        <div id="marketingProjectBrandSeal" class="marketing-project-seal">
          <div id="marketingProjectBrandVisual" class="marketing-project-brand-visual"><span>${escapeHtml((p.projectCode||p.orderPrefix||'PRJ').slice(0,3))}</span></div>
          <span>SEALED PROJECT</span>
        </div>
      </div>

      <div class="marketing-brand-grid">
        <article class="pec-card marketing-identity-card">
          <div class="marketing-identity-heading"><h4>Business Identity</h4><button id="renameProjectBtn" class="secondary-btn compact" type="button">EDIT NAME</button></div>
          <div class="marketing-identity-row"><span>Business name</span><strong>${escapeHtml(p.name)}</strong></div>
          <div class="marketing-identity-row"><span>Project code</span><strong>${escapeHtml(p.projectCode||p.orderPrefix||'PRJ')}</strong></div>
          <div class="marketing-identity-row"><span>Dark Sky Project ID</span><strong class="namespace-text">${escapeHtml(p.id)}</strong></div>
          <div class="marketing-identity-row technical-identity-row"><span>Technical namespace</span><strong class="namespace-text">${escapeHtml(p.namespace||window.BlackFlagV3Core?.namespaceFor?.(p.id)||'')}</strong></div>
          <p class="helper">Dark Sky isolates this business by its permanent Project ID. Changing the business name or branding does not change ownership, historical records, deployments, or project security.</p>
        </article>

        <article class="pec-card marketing-future-card">
          <h4>Creative Tools</h4>
          <p class="helper">The Graphics Library is ready for upload/assignment. Graphics AI will dock here after the isolation layer is certified.</p>
          <div class="future-tool-row"><span>Upload / Replace</span><strong>ACTIVE</strong></div>
          <div class="future-tool-row"><span>Graphics AI</span><strong>COMING NEXT</strong></div>
          <div class="future-tool-row"><span>AI Edit</span><strong>PLANNED</strong></div>
        </article>
      </div>

      <article class="pec-card project-marketing-graphics">
        <div class="graphics-manager-head">
          <div>
            <div class="engine-kicker">PROJECT GRAPHICS LIBRARY</div>
            <h4 id="graphicsProjectIdentity">PROJECT</h4>
          </div>
          <span id="graphicsSealStatus" class="graphics-lock-mark">VERIFYING</span>
        </div>
        <p id="graphicsIsolationNote" class="helper">Checking project graphics identity…</p>

        <div id="graphicsSaveConfirmation" class="graphics-save-confirmation hidden" role="status" aria-live="polite"></div>

        <div id="graphicsLibrary" class="graphics-library graphics-library-large"></div>

        <section id="graphicsFocusedEditor" class="graphics-focused-editor hidden">
          <div class="graphics-focused-head">
            <button id="graphicsFocusedClose" type="button" class="secondary-btn small graphics-back-btn">← BACK TO GRAPHICS LIBRARY</button>
            <div class="graphics-focused-copy">
              <div class="engine-kicker">PROJECT GRAPHIC</div>
              <h4 id="graphicsFocusedTitle">Project Graphic</h4>
              <p id="graphicsFocusedHelp" class="helper">Manage this project-owned graphic.</p>
            </div>
            <div id="graphicsEditState" class="graphics-edit-state">SAVED</div>
          </div>
          <div class="graphics-manager-divider"><span>MANAGE SELECTED PROJECT ASSET</span></div>
        <div class="asset-slot-grid marketing-asset-slot-grid focused-slot-grid">
          <label class="asset-slot" data-asset-slot-card="projectLogo">
            <span>Project Logo / Mark</span>
            <input id="assetProjectLogoInput" type="file" accept="image/*">
            <div class="asset-preview-stage">
              <img id="assetProjectLogoPreview" alt="Project logo preview"><div class="asset-preview-empty" data-preview-empty-for="assetProjectLogoPreview"><strong>No Project Logo / Mark Yet</strong><span>Choose an image to preview it here before saving.</span></div>
              <button type="button" class="asset-expand-btn hidden" data-expand-asset="projectLogo" aria-label="Expand Project Logo / Mark">+</button>
            </div>
            <button id="assetProjectLogoClear" type="button" class="secondary-btn small">CLEAR</button>
          </label>
          <label class="asset-slot" data-asset-slot-card="heroGraphic">
            <span>Hero Graphic</span>
            <input id="assetHeroGraphicInput" type="file" accept="image/*">
            <div class="asset-preview-stage">
              <img id="assetHeroGraphicPreview" alt="Hero graphic preview"><div class="asset-preview-empty" data-preview-empty-for="assetHeroGraphicPreview"><strong>No Welcome Hero Graphic Yet</strong><span>Choose an image to preview it here before saving.</span></div>
              <button type="button" class="asset-expand-btn hidden" data-expand-asset="heroGraphic" aria-label="Expand Hero Graphic">+</button>
            </div>
            <button id="assetHeroGraphicClear" type="button" class="secondary-btn small">CLEAR</button>
          </label>
          <label class="asset-slot" data-asset-slot-card="footerGraphic">
            <span>Footer Graphic</span>
            <input id="assetFooterGraphicInput" type="file" accept="image/*">
            <div class="asset-preview-stage">
              <img id="assetFooterGraphicPreview" alt="Footer graphic preview"><div class="asset-preview-empty" data-preview-empty-for="assetFooterGraphicPreview"><strong>No Footer Graphic Yet</strong><span>Choose an image to preview it here before saving.</span></div>
              <button type="button" class="asset-expand-btn hidden" data-expand-asset="footerGraphic" aria-label="Expand Footer Graphic">+</button>
            </div>
            <button id="assetFooterGraphicClear" type="button" class="secondary-btn small">CLEAR</button>
          </label>
          <label class="asset-slot" data-asset-slot-card="backgroundImage">
            <span>Background / Texture</span>
            <input id="assetBackgroundInput" type="file" accept="image/*">
            <div class="asset-preview-stage">
              <img id="assetBackgroundPreview" alt="Background preview"><div class="asset-preview-empty" data-preview-empty-for="assetBackgroundPreview"><strong>No Background / Texture Yet</strong><span>Choose an image to preview it here before saving.</span></div>
              <button type="button" class="asset-expand-btn hidden" data-expand-asset="backgroundImage" aria-label="Expand Background / Texture">+</button>
            </div>
            <button id="assetBackgroundClear" type="button" class="secondary-btn small">CLEAR</button>
          </label>
        </div>

        <div class="asset-actions marketing-asset-actions">
          <button id="assetSaveBtn" class="primary-btn small" type="button">SAVE SELECTED GRAPHIC</button>
          <span id="assetSaveMessage" class="helper"></span>
        </div>
        </section>
      </article>

      <div id="graphicsExpandModal" class="graphics-expand-modal hidden" role="dialog" aria-modal="true" aria-label="Expanded project graphic">
        <div class="graphics-expand-card">
          <button id="graphicsExpandClose" class="graphics-expand-close" type="button" aria-label="Close expanded graphic">×</button>
          <div id="graphicsExpandTitle" class="graphics-expand-title">Project Graphic</div>
          <img id="graphicsExpandImage" alt="Expanded project graphic">
          <div id="graphicsExpandNamespace" class="graphics-expand-namespace"></div>
        </div>
      </div>
    </div>`;

    if(tab==='products') return `${projectModuleHero(p,'OPERATE','Products & Services','Manage the offers this business can sell and whether each offer is ready for customers.',`<span>${products.length} OFFERS</span>`)}<div class="pec-card"><div class="pec-title-row"><h4>Offer Registry</h4><button id="addProductBtn" class="secondary-btn small">ADD PRODUCT</button></div>
      <div class="product-list">${products.map(pr=>`<div class="product-row"><div><strong>${escapeHtml(pr.name)}</strong><small>${pr.characterLimit?`${pr.characterLimit} char max`:'Character limit unset'}</small></div><label><input data-product-publish="${escapeHtml(pr.id)}" type="checkbox" ${pr.published?'checked':''}> Published</label></div>`).join('')}</div></div>`;
    if(tab==='experience'){ const visual=visualPresentationFor(p); const operating=operatingModelForProject(p); const brief=window.BlackFlagV3Core?.normalizeBusinessBrief?.(p)||{text:p.description||''}; return `${projectModuleHero(p,'EXPERIENCE','Customer Experience','Teach Dark Sky how this business operates, then control the customer-facing steps and visual capabilities it needs.',`<span>${escapeHtml(String(operating.mode||'other').replaceAll('-',' ').toUpperCase())}</span>`)}
      <div class="pec-card business-brief-card"><div class="pec-title-row"><div><h4>Business Brief</h4><p class="helper">The owner's original explanation stays with this Project ID. Dark Sky derives a structured operating model from it, and you can correct that interpretation without rewriting the brief.</p></div></div>
      <label>How this business works<textarea id="ptBusinessBrief" rows="9" maxlength="12000" placeholder="What does this business do? What does it sell or provide? How should customers interact with it? How is work fulfilled? What information, scheduling, photos, approvals, or special rules matter?">${escapeHtml(brief.text||'')}</textarea></label>
      <div class="business-understanding-head"><div><small>DARK SKY UNDERSTANDING</small><h4>Structured operating model</h4></div><span>Repeatable • Project-scoped</span></div>
      ${operatingUnderstandingMarkup(p)}
      <div class="business-model-corrections"><label>Operating model<select id="ptOperatingMode">${operatingModelModeOptions(operating.mode||'other')}</select></label><label>Customer journey<select id="ptOperatingFlow"><option value="guided" ${operating.customerFlow==='guided'?'selected':''}>Guided</option><option value="catalog" ${operating.customerFlow==='catalog'?'selected':''}>Catalog</option><option value="request" ${operating.customerFlow==='request'?'selected':''}>Request / Quote</option></select></label><label>Customer relationship<select id="ptRelationshipType">${customerRelationshipOptions(operating.overrides?.relationshipType||operating.relationshipType||'auto')}</select></label><label>Fulfillment methods<input id="ptOperatingFulfillment" class="text-input" value="${escapeHtml((operating.fulfillment||[]).join(', '))}" placeholder="pickup, delivery, shipping, on-site"></label><label class="checkline"><input id="ptOperatingScheduling" type="checkbox" ${operating.schedulingNeeded?'checked':''}> Scheduling / appointment needed</label></div>
      <div class="visual-cap-note"><strong>Interpretation stays correctable.</strong><span>Dark Sky keeps both the source brief and the structured model. Changes here affect this project only and do not alter another vessel.</span></div></div>
      <div class="pec-card"><h4>Experience Rules</h4>
      <label class="admin-toggle-row compact-toggle"><span><strong>Photo step</strong><small>Require product photo.</small></span><input id="ptPhoto" type="checkbox" ${p.customerExperience?.photoRequired!==false?'checked':''}></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Preview approval</strong><small>Require customer approval.</small></span><input id="ptPreview" type="checkbox" ${p.customerExperience?.previewApproval!==false?'checked':''}></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Custom colors</strong><small>Allow custom color picker.</small></span><input id="ptColors" type="checkbox" ${p.customization?.allowCustomColors!==false?'checked':''}></label>
      </div>
      <div class="pec-card visual-capability-card"><div class="pec-title-row"><div><h4>Visual Presentation Capability</h4><p class="helper">Start with a profile, then tailor the capability families to the business. AVAILABLE means the current Engine has working behavior; FOUNDATION records a supported requirement for future renderers without pretending it is already production-ready.</p></div></div>
      <label class="visual-profile-select">Starting profile<select id="ptVisualProfile">${visualProfileOptions(visual.profile||'none')}</select></label>
      <div id="visualCapabilityDeck" class="visual-cap-deck">${visualCapabilityDeck(visual)}</div>
      <div class="visual-cap-note"><strong>Composable by design.</strong><span>A project can combine multiple inputs, placement zones, transforms, preview styles, approval stages, and outputs. New ships can extend this catalog without inheriting an Engine-specific customer shell.</span></div>
      <button id="saveExperienceTab" class="primary-btn small">SAVE BUSINESS & EXPERIENCE MODEL</button></div>`;}
    if(tab==='ai') return `${projectModuleHero(p,'SYSTEM','AI Recognition','Configure assistive recognition without giving AI authority over pricing or project policy.')}<div class="pec-card"><h4>Recognition Policy</h4><p class="helper">Recognition suggests structured attributes. Project pricing rules remain authoritative.</p>
      <label>Mode<select id="ptAI"><option value="off">Off</option><option value="assist">Assist</option><option value="automatic">Automatic</option></select></label>
      <label>Minimum confidence<input id="ptConfidence" class="text-input" type="number" min=".5" max=".99" step=".01" value="${Number(p.ai?.minConfidence||.9).toFixed(2)}"></label>
      <label class="admin-toggle-row compact-toggle"><span><strong>Require scale reference</strong><small>Recommended for physical measurements.</small></span><input id="ptScale" type="checkbox" ${p.ai?.requireScaleReference!==false?'checked':''}></label>
      <button id="saveAITab" class="primary-btn small">SAVE AI POLICY</button></div>`;
    if(tab==='workflow'){const terms=activityTermsForProject(p),workflow=projectWorkflowFor(p),suggested=!Array.isArray(p.workflow)||p.workflow.length<2;return `${projectModuleHero(p,'OPERATE','Workflow',`Define how ${terms.lowerPlural} move through this business from first contact to completion.`, `<span>${escapeHtml(customerRelationshipForProject(p).label.toUpperCase())}</span>`)}<div class="pec-card operating-workflow-card"><div class="pec-title-row"><div><h4>${escapeHtml(terms.singular)} Stages</h4><p class="helper">One stage per line. Dark Sky supplies a reusable starting workflow from the Customer Relationship contract; this project can override it without changing another vessel.</p></div><span class="operating-source-badge ${suggested?'suggested':'custom'}">${suggested?'DARK SKY SUGGESTED':'PROJECT CUSTOM'}</span></div><textarea id="ptWorkflow" rows="8">${escapeHtml(workflow.join('\n'))}</textarea><div class="workflow-action-row"><button id="saveWorkflowTab" class="primary-btn small">SAVE PROJECT WORKFLOW</button>${!suggested?'<button id="resetWorkflowTab" class="secondary-btn small">USE SUGGESTED WORKFLOW</button>':''}</div></div>`;}
    if(tab==='publishing') return `${projectModuleHero(p,'SYSTEM','Publishing','Control whether this business remains private, enters test waters, or is available to customers.',`<span>${escapeHtml(projectLifecycleDisplay(p))}</span>`)}<div class="pec-card"><h4>Project Availability</h4><label>Project status<select id="ptPublish"><option value="development">Development — engine only</option><option value="test">Test</option><option value="live">Published / Live</option><option value="paused">Paused</option></select></label><p class="helper">Product-level publish controls are in Products.</p><button id="savePublishingTab" class="primary-btn small">SAVE PUBLISHING</button></div>`;
    if(tab==='orders'){const terms=activityTermsForProject(p);return `<div class="pec-orders-shell"><div class="pec-orders-heading"><div><small>${escapeHtml(terms.plural.toUpperCase())} COMMAND</small><h4>Project ${escapeHtml(terms.plural)}</h4><p>Current ${escapeHtml(terms.lowerPlural)}, customer contact, request details, and recorded value for this project.</p></div></div><div id="ptOrders">Loading…</div></div>`;}
    if(tab==='ledger') {
      const ledger=projectLedger(p.id);
      const rev=ledger.reduce((s,x)=>s+(Number(x.revenue)||0),0), cost=ledger.reduce((s,x)=>s+(Number(x.materialCost)||0)+(Number(x.otherDirectCost)||0),0);
      return `${projectModuleHero(p,'INSIGHT','Financial Overview','Read the completed-order ledger and direct-cost picture Dark Sky can verify today.')}<div class="ledger-summary"><div><span>Completed</span><strong>${ledger.length}</strong></div><div><span>Revenue</span><strong>$${rev.toFixed(2)}</strong></div><div><span>Direct Costs</span><strong>$${cost.toFixed(2)}</strong></div><div><span>Est. Gross Profit</span><strong>$${(rev-cost).toFixed(2)}</strong></div></div>
      <div class="pec-card"><h4>Completed Order Ledger</h4><p class="helper">Core financial history lives in Black Flag. Project views may be read-only in the future.</p>${ledger.length?ledger.slice().reverse().map(x=>`<div class="ledger-row"><strong>${escapeHtml(x.orderId)}</strong><span>${new Date(x.completedAt).toLocaleDateString()}</span><span>$${Number(x.revenue).toFixed(2)}</span><span>${escapeHtml(x.paymentStatus)}</span></div>`).join(''):'<p class="helper">No completed orders posted yet.</p>'}</div>`;
    }
    if(tab==='payments'){
      const pay=p.payments||{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false};
      return `${projectModuleHero(p,'SYSTEM','Payments','Configure how this project will connect to a payment provider without making Dark Sky the bank.')}<div class="pec-grid">
        <article class="pec-card payment-structure-card">
          <h4>Pay by App</h4>
          <p class="helper">Engine configuration only for now. Nothing is exposed to customers yet.</p>
          <label class="admin-toggle-row compact-toggle"><span><strong>Enable payment capability</strong><small>Controlled through the Engine.</small></span><input id="ptPaymentsEnabled" type="checkbox" ${pay.enabled?'checked':''}></label>
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
    if(tab==='permissions'){
      const pm=p.permissions||{ordersView:true,ordersUpdate:true,ledgerView:false,costEntry:false,profitView:false};
      return `${projectModuleHero(p,'ACCESS','Permissions','Define what project administrators may see and change inside this business.')}<div class="pec-card"><h4>Project Admin Access</h4>
        <label class="admin-toggle-row compact-toggle"><span><strong>Orders</strong></span><input id="permOrdersView" type="checkbox" ${pm.ordersView?'checked':''}></label>
        <label class="admin-toggle-row compact-toggle"><span><strong>Update order status</strong></span><input id="permOrdersUpdate" type="checkbox" ${pm.ordersUpdate?'checked':''}></label>
        <label class="admin-toggle-row compact-toggle"><span><strong>Ledger</strong></span><input id="permLedgerView" type="checkbox" ${pm.ledgerView?'checked':''}></label>
        <label class="admin-toggle-row compact-toggle"><span><strong>Cost entry</strong></span><input id="permCostEntry" type="checkbox" ${pm.costEntry?'checked':''}></label>
        <label class="admin-toggle-row compact-toggle"><span><strong>Profit / margin</strong></span><input id="permProfitView" type="checkbox" ${pm.profitView?'checked':''}></label>
        <label class="admin-toggle-row compact-toggle"><span><strong>Project Options</strong></span><input id="permProjectOptionsView" type="checkbox" ${pm.projectOptionsView?'checked':''}></label>
        <button id="savePermissionsTab" class="primary-btn small">SAVE ACCESS</button></div>`;
    }
    if(tab==='customers'){
      const adminVisible=!!p.customerHistory?.adminVisible;
      const directory=readCustomerDirectory();
      const rows=Object.values(directory[p.id]||{}).sort((a,b)=>
        String(b.lastOrderDate||'').localeCompare(String(a.lastOrderDate||''))
      );

      const directoryHtml=rows.map(c=>{
        const matches=engineWideCustomerMatches(c.customerKey);
        const repeatAcross=matches.reduce((s,m)=>s+(m.row.orderCount||0),0);
        const projectCount=matches.length;
        const latest=(c.purchases||[])[0];
        return `<article class="customer-directory-card">
          <div class="customer-directory-head">
            <div>
              <h4>${escapeHtml(c.name||'Customer')}</h4>
              <span>${escapeHtml(c.phone||'')}</span>
              <span>${escapeHtml(c.email||'')}</span>
            </div>
            <div class="repeat-customer-badge ${repeatAcross>1?'repeat':''}">
              ${repeatAcross>1?'REPEAT CUSTOMER':'CUSTOMER'}
            </div>
          </div>
          <div class="customer-directory-stats">
            <span><strong>${c.orderCount||0}</strong> this project</span>
            <span><strong>${repeatAcross}</strong> engine-wide orders</span>
            <span><strong>${projectCount}</strong> project${projectCount===1?'':'s'}</span>
          </div>
          <div class="customer-last-purchase">
            <span>Last purchase</span>
            <strong>${latest?escapeHtml(latest.description):'—'}</strong>
            <small>${latest?new Date(latest.date).toLocaleDateString():''}</small>
          </div>
        </article>`;
      }).join('');

      return `${projectModuleHero(p,'COMMAND','Customers','Review retained project customer history, repeat business, and the latest known purchase context.',`<span>${rows.length} CUSTOMERS</span>`)}<div class="pec-card customer-history-engine">
        <div class="pec-title-row">
          <div>
            <h4>Customer History</h4>
            <p class="helper">Black Flag retains project customer history automatically.</p>
          </div>
          <span class="engine-always-on">ENGINE ON</span>
        </div>
        <label class="admin-toggle-row compact-toggle">
          <span><strong>Show Customer History in Project Admin</strong><small>Controls project-admin visibility only. Black Flag retention remains on.</small></span>
          <input id="customerHistoryAdminVisible" type="checkbox" ${adminVisible?'checked':''}>
        </label>
        <button id="saveCustomerHistoryTab" class="primary-btn small">SAVE PROJECT ACCESS</button>
        <button id="rebuildCustomerHistoryBtn" class="secondary-btn small">REBUILD FROM SAVED ORDERS</button>
        <div class="customer-directory-list">${directoryHtml||'<div class="empty">No retained customers yet.</div>'}</div>
      </div>`;
    }
    if(tab==='deployment'){
      const deployments=migrateLegacyDeployment(p);
      const d=deploymentForEditor(p);
      const list=deployments.filter(x=>x.state!=='retired');
      const readiness=d?deploymentReadiness(d):null;
      const profile=d?(DEPLOYMENT_PROFILES[d.profile]||DEPLOYMENT_PROFILES.kiosk_self_service):null;
      return `<div class="deployment-fleet">
        <section class="deployment-fleet-hero">
          <div>
            <div class="engine-kicker">DARK SKY DEPLOYMENT FLEET</div>
            <h3>Deployment Shipwright</h3>
            <p><strong>${escapeHtml(p.name)}</strong> is the vessel. Deployments are the outposts where that vessel serves customers. One project can operate through many outposts without cloning its identity.</p>
          </div>
          <button id="createDeploymentBtn" class="deployment-launch-btn" type="button"><span>＋</span><strong>LAY NEW KEEL</strong><small>Create Outpost</small></button>
        </section>

        <section id="deploymentCreateForm" class="deployment-create-form hidden" aria-label="Create deployment outpost">
          <div class="deployment-create-copy">
            <small>NEW OUTPOST</small>
            <strong>Commission a customer deployment</strong>
            <span>Give this outpost a clear name and starting mission profile. It remains sealed to ${escapeHtml(p.name)}.</span>
          </div>
          <label>Outpost name<input id="newDeploymentName" class="text-input" autocomplete="off" placeholder="Example: Lemonade Stand — Front Counter"></label>
          <label>Deployment profile<select id="newDeploymentProfile">${Object.entries(DEPLOYMENT_PROFILES).map(([value,x])=>`<option value="${value}">${escapeHtml(x.label)}</option>`).join('')}</select></label>
          <div class="deployment-create-actions">
            <button id="cancelCreateDeploymentBtn" class="secondary-btn" type="button">CANCEL</button>
            <button id="confirmCreateDeploymentBtn" class="primary-btn" type="button">CREATE OUTPOST</button>
          </div>
          <div id="deploymentCreateStatus" class="deployment-create-status" role="status" aria-live="polite"></div>
        </section>

        <div class="deployment-fleet-layout">
          <aside class="deployment-outpost-list">
            <div class="deployment-section-title"><span>OUTPOST REGISTRY</span><b>${list.length}</b></div>
            ${list.length?list.map(x=>{
              const pr=DEPLOYMENT_PROFILES[x.profile]||DEPLOYMENT_PROFILES.kiosk_self_service;
              return `<button class="deployment-outpost-row ${d?.id===x.id?'active':''}" data-deployment-select="${escapeHtml(x.id)}">
                <span class="outpost-signal ${deploymentStateClass(x.state)}"></span>
                <span><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(pr.label)}</small></span>
                <b>${escapeHtml(DEPLOYMENT_STATES[x.state]||x.state)}</b>
              </button>`;
            }).join(''):`<div class="deployment-empty-berth"><strong>No outposts yet.</strong><span>Lay the first keel to create a deployment manifest for this project.</span></div>`}
            ${deployments.some(x=>x.state==='retired')?`<div class="deployment-retired-note">${deployments.filter(x=>x.state==='retired').length} retired outpost${deployments.filter(x=>x.state==='retired').length===1?'':'s'} preserved in deployment history.</div>`:''}
          </aside>

          <main class="deployment-command">
            ${d?`
            ${(()=>{const voyage=deploymentVoyageState(p,d);return `
            <div class="deployment-command-head deployment-command-head-refit">
              <div><small>SELECTED OUTPOST</small><h4>${escapeHtml(d.name)}</h4><span class="deployment-state-pill ${deploymentStateClass(d.state)}">${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)}</span></div>
              <div class="deployment-voyage-progress" aria-label="Outpost progress">
                ${['Configure','Save','Sea Trial','Test','Active'].map((label,i)=>`<span class="${voyage.step>i+1?'done':''} ${voyage.step===i+1?'current':''}"><b>${i+1}</b>${label}</span>`).join('')}
              </div>
            </div>

            <section class="deployment-guided-launch">
              <div class="deployment-guided-step"><span>STEP ${Math.min(voyage.step,5)} OF 5</span><strong>${escapeHtml(voyage.nextLabel)}</strong></div>
              <div class="deployment-guided-copy"><small>WHAT TO DO NOW</small><p>${escapeHtml(voyage.detail)}</p></div>
              <div class="deployment-guided-state"><small>CURRENT STATE</small><b>${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)}</b></div>
            </section>

            <div class="deployment-shipwright-grid">
              <article class="pec-card deployment-editor deployment-setup-card">
                <div class="deployment-card-heading"><small>OUTPOST SETUP</small><h4>Customer-facing basics</h4><p>These are the settings most operators need. Advanced controls stay available below without getting in the way.</p></div>
                <div class="deployment-setup-fields deployment-core-fields">
                  <label>Outpost name<input id="deployName" class="text-input" value="${escapeHtml(d.name)}"></label>
                  <label>Deployment profile
                    <select id="deployProfile">${Object.entries(DEPLOYMENT_PROFILES).map(([value,x])=>`<option value="${value}" ${d.profile===value?'selected':''}>${escapeHtml(x.label)}</option>`).join('')}</select>
                  </label>
                  <label class="deployment-attract-input">Customer welcome message<input id="deployAttractTitle" class="text-input" value="${escapeHtml(d.attractTitle||'Ready when you are.')}" /></label>
                </div>

                <details class="deployment-advanced-settings">
                  <summary><span>ADVANCED</span><strong>Outpost behavior & session safety</strong><small>Idle reset, capabilities, customer reset and device settings</small></summary>
                  <div class="deployment-advanced-settings-body">
                    <div class="deployment-setup-fields">
                      <label>Idle-session reset
                        <select id="deployIdle">${[1,2,3,5,10,15].map(n=>`<option value="${n}" ${Number(d.idleMinutes||3)===n?'selected':''}>${n} minute${n===1?'':'s'}</option>`).join('')}</select>
                      </label>
                      <label>Capability scope
                        <select id="deployCapabilityScope">
                          <option value="project_default" ${d.capabilityScope!=='approved_subset'?'selected':''}>Project default capabilities</option>
                          <option value="approved_subset" ${d.capabilityScope==='approved_subset'?'selected':''}>Approved deployment subset (framework)</option>
                        </select>
                      </label>
                    </div>
                    <div class="deployment-toggle-stack deployment-session-card">
                      <div class="deployment-subheading"><small>CUSTOMER SESSION</small><strong>Safe reset behavior</strong></div>
                      <label class="admin-toggle-row compact-toggle"><span><strong>Reset after completed order</strong><small>Return to this outpost's attract screen.</small></span><input id="deployReset" type="checkbox" ${d.resetAfterComplete!==false?'checked':''}></label>
                      <label class="admin-toggle-row compact-toggle"><span><strong>Purge customer session cargo</strong><small>Clear photos, uploads, previews, drafts and temporary customer data between sessions.</small></span><input id="deployPurge" type="checkbox" ${d.purgeSession!==false?'checked':''}></label>
                      <label class="admin-toggle-row compact-toggle"><span><strong>Show Start Over</strong><small>Customer-safe reset; project admin remains hidden.</small></span><input id="deployStartOver" type="checkbox" ${d.showStartOver!==false?'checked':''}></label>
                      <label class="admin-toggle-row compact-toggle"><span><strong>Resume deployment after reload</strong><small>Restore the outpost, never the previous customer's session.</small></span><input id="deployResume" type="checkbox" ${d.resumeAfterReload?'checked':''}></label>
                      <label class="admin-toggle-row compact-toggle"><span><strong>Device-level kiosk lock verified</strong><small>Mark only after iPad Guided Access / managed Single App Mode is configured.</small></span><input id="deployDeviceLock" type="checkbox" ${d.deviceLockVerified?'checked':''}></label>
                    </div>
                  </div>
                </details>
                <div class="deployment-save-row"><button id="saveDeploymentManifestBtn" class="secondary-btn">SAVE CHANGES</button><span id="deploymentSaveStatus" class="helper"></span></div>
              </article>

              <aside class="deployment-preview-column">
                <article class="pec-card deployment-attract-card deployment-preview-card">
                  <div class="deployment-card-heading"><small>CUSTOMER PREVIEW</small><h4>Attract screen</h4></div>
                  <div class="deployment-preview-badge">${d.state==='deployed'?'LIVE CUSTOMER VIEW':d.state==='sea_trial'?'SEA TRIAL PREVIEW':'PREVIEW ONLY • NOT LIVE'}</div>
                  <div class="deployment-attract-preview">
                    <div class="deployment-attract-mark">${escapeHtml((p.projectCode||p.orderPrefix||'PRJ').slice(0,3))}</div>
                    <strong>${escapeHtml(d.attractTitle||'Ready when you are.')}</strong>
                    ${d.state==='deployed'||d.state==='sea_trial'
                      ?`<button type="button" id="deploymentPreviewActionBtn" class="deployment-preview-action">${d.state==='deployed'?'OPEN CUSTOMER EXPERIENCE':'TEST AS CUSTOMER'}</button>`
                      :`<span class="deployment-preview-static">PREVIEW</span>`}
                  </div>
                  <p class="helper">This preview reflects the saved outpost setup. Customer testing is unlocked during Sea Trial.</p>
                </article>

                <article class="deployment-next-step-card">
                  <small>NEXT STEP</small>
                  <h4>${escapeHtml(voyage.nextLabel)}</h4>
                  <p>${escapeHtml(voyage.detail)}</p>
                  ${voyage.nextAction==='save'?`<button type="button" data-deployment-next="save" class="primary-btn">SAVE OUTPOST SETUP</button>`:''}
                  ${voyage.nextAction==='sea_trial'?`<button type="button" data-deployment-next="sea_trial" class="primary-btn">BEGIN SEA TRIAL</button>`:''}
                  ${voyage.nextAction==='offer'?`<div class="deployment-launch-offer"><label>Customer offer<input id="deploymentLaunchOfferName" class="text-input" placeholder="e.g., Fresh Lemonade"></label><label>Starting price <span>(optional)</span><input id="deploymentLaunchOfferPrice" class="text-input" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00"></label><button type="button" id="createDeploymentLaunchOfferBtn" class="primary-btn">CREATE CUSTOMER OFFER</button><small>Dark Sky will make this offer customer-ready inside this project only. You can refine it later in Products & Services.</small></div>`:''}
                  ${voyage.nextAction==='test'?`<button type="button" id="testDeploymentExperienceBtn" class="primary-btn">${d.state==='deployed'?'OPEN CUSTOMER EXPERIENCE':'OPEN TEST OUTPOST'}</button>`:''}
                  ${voyage.nextAction==='deployed'?`<button type="button" data-deployment-next="deployed" class="primary-btn">ACTIVATE OUTPOST</button>`:''}
                  ${d.state==='paused'?`<button type="button" data-deployment-next="deployed" class="primary-btn">RESUME OUTPOST</button>`:''}
                </article>
              </aside>
            </div>

            <details class="deployment-operational-details">
              <summary><span>OPERATIONAL DETAILS</span><strong>Readiness, health & lifecycle controls</strong><small>Open when you need diagnostics or secondary controls</small></summary>
              <div class="deployment-operational-details-body">
                <div class="deployment-operational-grid">
                  <article class="pec-card deployment-readiness">
                    <div class="deployment-card-heading"><small>READINESS</small><h4>Sea Trial inspection</h4></div>
                    <div class="deployment-readiness-summary"><strong>${readiness.score}%</strong><span>ENGINE READY</span><b class="${d.deviceLockVerified?'ready':'warn'}">${d.deviceLockVerified?'DEVICE VERIFIED':'DEVICE CHECK'}</b></div>
                    ${readiness.checks.map(c=>`<div class="readiness-row ${c.pass?'pass':c.warning?'warn':'fail'}"><span>${escapeHtml(c.label)}</span><strong>${escapeHtml(c.detail)}</strong></div>`).join('')}
                  </article>
                  <article class="pec-card deployment-signal-watch">
                    <div class="deployment-card-heading"><small>OUTPOST HEALTH</small><h4>${escapeHtml(voyage.label)}</h4></div>
                    <div class="deployment-gauge"><i class="${d.state==='deployed'?'live':''}"></i><strong>${d.state==='deployed'?'ACTIVE • SERVING CUSTOMERS':d.state==='sea_trial'?(d.lastTestedAt?'SEA TRIAL • TEST RECORDED':'SEA TRIAL • NOT ACTIVE'):d.state==='paused'?'PAUSED':'IN HARBOR'}</strong></div>
                    <p><b>Last check-in:</b> ${d.lastCheckIn?escapeHtml(new Date(d.lastCheckIn).toLocaleString()):'Telemetry not installed yet'}</p>
                    <p><b>Manifest:</b> v${Number(d.manifestVersion||1)}</p>
                    <p><b>Last customer test:</b> ${d.lastTestedAt?escapeHtml(new Date(d.lastTestedAt).toLocaleString()):'Not tested yet'}</p>
                  </article>
                </div>

                <section class="deployment-secondary-actions">
                  <div><small>OUTPOST CONTROL</small><p>Use these controls only when you need to move backward, pause, or retire an outpost.</p></div>
                  <div>
                    ${d.state==='sea_trial'?`<button data-deployment-action="draft" class="secondary-btn">RETURN TO DRAFT</button>`:''}
                    ${d.state==='deployed'?`<button data-deployment-action="paused" class="secondary-btn">PAUSE OUTPOST</button>`:''}
                    ${d.state!=='retired'?`<button data-deployment-action="retired" class="danger-outline-btn">RETIRE OUTPOST</button>`:''}
                  </div>
                </section>
              </div>
            </details>

            <details class="deployment-advanced-manifest">
              <summary><span>ADVANCED</span><strong>Manifest Details</strong><small>IDs, isolation and technical deployment record</small></summary>
              ${deploymentManifestHtml(p,d)}
            </details>
            `})()}
            `:`<div class="deployment-no-selection"><span>⚓</span><strong>No Deployment Manifest</strong><p>Create an outpost to begin.</p></div>`}
          </main>
        </div>

        <section class="deployment-future">
          <div><small>DEPLOYMENT PROFILE BERTHS</small><h4>One vessel. Many missions.</h4><p>Kiosk is only the first profile. Every deployment remains subordinate to the owning project's business rules and Project ID.</p></div>
          <div class="future-deployment-chips">${Object.values(DEPLOYMENT_PROFILES).map(x=>`<span>${escapeHtml(x.label)}</span>`).join('')}</div>
        </section>
      </div>`;
    }

    if(tab==='notifications'){
      const n=p.notifications||{customerConfirmationEmail:false};
      return `${projectModuleHero(p,'SYSTEM','Notifications','Choose which customer messages Dark Sky may send for this project.')}<div class="pec-card">
        <h4>Customer Notifications</h4>
        <label class="admin-toggle-row compact-toggle">
          <span><strong>Customer confirmation email</strong><small>Black Flag controls this feature separately for each project.</small></span>
          <input id="projectCustomerEmailEnabled" type="checkbox" ${n.customerConfirmationEmail?'checked':''}>
        </label>
        <button id="saveNotificationsTab" class="primary-btn small">SAVE NOTIFICATIONS</button>
      </div>`;
    }
    return '';
  }

  const PROJECT_COMMAND_GROUPS={
    products:'operate',workflow:'operate',deployment:'operate',
    analytics:'insight',ledger:'insight',
    marketing:'experience',experience:'experience',
    owner:'access',permissions:'access',
    payments:'system',notifications:'system',publishing:'system',ai:'system'
  };

  function syncProjectCommandNavigation(tab,{expandedGroup=null}={}){
    const nav=$('projectTabs');
    if(!nav)return;
    const activeGroup=PROJECT_COMMAND_GROUPS[tab]||null;
    const visibleGroup=expandedGroup===undefined?activeGroup:expandedGroup;
    $$('#projectTabs [data-project-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.projectTab===tab));
    $$('#projectTabs [data-project-group]').forEach(btn=>{
      const group=btn.dataset.projectGroup;
      btn.classList.toggle('active',group===activeGroup);
      btn.classList.toggle('expanded',group===visibleGroup);
      btn.setAttribute('aria-expanded',group===visibleGroup?'true':'false');
    });
    $$('#projectTabs [data-project-subnav]').forEach(row=>{
      const show=row.dataset.projectSubnav===visibleGroup;
      row.classList.toggle('hidden',!show);
      row.setAttribute('aria-hidden',show?'false':'true');
    });
    nav.dataset.openGroup=visibleGroup||'';
  }

  async function renderProjectTab(id,tab){
    const p=projectById(id), box=$('projectTabContent');if(!p||!box)return;
    box.innerHTML=projectTabsHtml(p,tab);
    syncProjectCommandNavigation(tab,{expandedGroup:PROJECT_COMMAND_GROUPS[tab]||null});
    bindProjectControlJumpLinks(p);
    if(tab==='overview'){await renderProjectControlOverview(p);return;}
    if(tab==='analytics'){await renderProjectAnalytics(p);return;}
    if(tab==='marketing'){
      if(engineActiveProjectId!==p.id)return;
      bindProjectAssetEditor();
      await loadProjectAssetsEditor();
      const visual=await projectBrandVisual(p);
      const brandBox=$('marketingProjectBrandVisual');
      if(brandBox){
        brandBox.innerHTML=visual.logo
          ? `<img src="${visual.logo}" alt="${escapeHtml(p.name)} logo">`
          : `<span>${escapeHtml(visual.code)}</span>`;
        brandBox.classList.toggle('has-logo',!!visual.logo);
      }
      closeMarketingGraphicSlot();
      $('renameProjectBtn')?.addEventListener('click',async()=>{
        if(!requireEngineProjectMutation(p,'project.identity.rename'))return;
        const proposed=prompt('Business name',p.name||'');
        if(proposed===null)return;
        const next=String(proposed||'').trim().replace(/\s+/g,' ');
        if(next.length<2){alert('Enter a business name with at least two characters.');return;}
        const same=window.BlackFlagV3Core?.findProjectsByName?.(companies,next,{includeArchived:false})?.filter(x=>x.projectId!==p.id)||[];
        if(same.length&&!confirm(`Another project currently uses the display name “${next}”. Project IDs keep them isolated. Rename this business anyway?`))return;
        const result=await renameProjectDisplayName(p,next,{actorRole:'engine_admin',syncBranding:true});
        if(!result.ok){alert('Dark Sky could not rename this business.');return;}
        $('pecTitle').textContent=p.name;
        await applyProjectControlBrand(p);
        await renderProjectTab(p.id,'marketing');
      });
    }
    if(tab==='ai'){ $('ptAI').value=p.ai?.mode||'off'; $('saveAITab').onclick=async()=>{if(!requireEngineProjectMutation(p,'ai.policy.update'))return;p.ai={mode:$('ptAI').value,minConfidence:Number($('ptConfidence').value)||.9,requireScaleReference:$('ptScale').checked};await saveCompanies();logActivity(p.id,'AI policy changed',p.ai.mode);};}
    if(tab==='experience'){ const profile=$('ptVisualProfile'); if(profile) profile.onchange=()=>{ const preset=visualPresets()[profile.value]; if(!preset)return; VISUAL_FAMILIES.forEach(f=>{ $$(`[data-visual-family=\"${f}\"]`).forEach(cb=>{cb.checked=(preset[f]||[]).includes(cb.value);cb.closest('.visual-cap-option')?.classList.toggle('selected',cb.checked);}); }); }; $$('#visualCapabilityDeck input[type=\"checkbox\"]').forEach(cb=>cb.onchange=()=>cb.closest('.visual-cap-option')?.classList.toggle('selected',cb.checked)); $('saveExperienceTab').onclick=async()=>{if(!requireEngineProjectMutation(p,'customer.experience.update'))return;
        p.customerExperience={...(p.customerExperience||{}),mode:$('ptOperatingFlow')?.value||p.customerExperience?.mode||'guided',photoRequired:$('ptPhoto').checked,previewApproval:$('ptPreview').checked};
        p.customization=p.customization||{};p.customization.allowCustomColors=$('ptColors').checked;p.visualPresentation=collectVisualPresentationFromControls(p);
        window.BlackFlagV3Core?.updateBusinessUnderstanding?.(p,{briefText:$('ptBusinessBrief')?.value||'',overrides:{mode:$('ptOperatingMode')?.value||'other',customerFlow:$('ptOperatingFlow')?.value||'guided',relationshipType:($('ptRelationshipType')?.value&&$('ptRelationshipType').value!=='auto')?$('ptRelationshipType').value:undefined,fulfillment:String($('ptOperatingFulfillment')?.value||'').split(',').map(x=>x.trim()).filter(Boolean),schedulingNeeded:!!$('ptOperatingScheduling')?.checked}});
        await saveCompanies();logActivity(p.id,'Business understanding updated',window.BlackFlagV3Core?.resolveOperatingModel?.(p)?.summary||`visual: ${p.visualPresentation.profile}`);await renderProjectTab(p.id,'experience');};}
    if(tab==='workflow'){ $('saveWorkflowTab').onclick=async()=>{if(!requireEngineProjectMutation(p,'workflow.update'))return;const rows=$('ptWorkflow').value.split('\n').map(x=>x.trim()).filter(Boolean);if(rows.length>=2){p.workflow=rows;await saveCompanies();logActivity(p.id,'Workflow updated',rows.join(' → '));await renderProjectTab(p.id,'workflow');}};if($('resetWorkflowTab'))$('resetWorkflowTab').onclick=async()=>{if(!requireEngineProjectMutation(p,'workflow.reset'))return;delete p.workflow;await saveCompanies();logActivity(p.id,'Workflow reset to operating model',customerRelationshipForProject(p).label);await renderProjectTab(p.id,'workflow');};}
    if(tab==='publishing'){ $('ptPublish').value=p.publish?.status||'development'; $('savePublishingTab').onclick=async()=>{if(!requireEngineProjectMutation(p,'project.publishing.update'))return;const next=$('ptPublish').value;if(next==='live'&&!confirm(`Publish ${p.name}?`))return;p.publish={status:next};p.visibility=next==='live'?'published':'engine_only';await saveCompanies();logActivity(p.id,'Publishing changed',next);await renderProjectCommand();};}
    if(tab==='products'){
      $$('[data-product-publish]').forEach(t=>t.onchange=async()=>{if(!requireEngineProjectMutation(p,'product.publish.update')){t.checked=!t.checked;return;}const pr=(p.products||[]).find(x=>x.id===t.dataset.productPublish);if(!pr)return;if(t.checked&&!confirm(`Publish product "${pr.name}"?`)){t.checked=false;return;}pr.published=t.checked;await saveCompanies();logActivity(p.id,t.checked?'Product published':'Product unpublished',pr.name);});
      if($('addProductBtn')) $('addProductBtn').onclick=async()=>{if(!requireEngineProjectMutation(p,'product.create'))return;const name=prompt('Product name');if(!name)return;p.products=p.products||[];p.products.push({id:slugifyProjectName(name)+'-'+Date.now().toString().slice(-4),name,published:false,characterLimit:null});await saveCompanies();logActivity(p.id,'Product added',name);renderProjectTab(p.id,'products');};
    }
    if(tab==='payments'){
      const pay=p.payments||{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false};
      $('ptPaymentMode').value=pay.mode||'payment_link';
      $('ptPaymentProvider').value=pay.provider||'not_configured';
      $('savePaymentsTab').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'payments.structure.update'))return;
        p.payments={enabled:$('ptPaymentsEnabled').checked,mode:$('ptPaymentMode').value,provider:$('ptPaymentProvider').value,customerVisible:false};
        await saveCompanies();
        logActivity(p.id,'Payment structure updated',`${p.payments.enabled?'enabled':'disabled'} • ${p.payments.provider}`);
      };
    }
    if(tab==='permissions'){
      const syncPermissionDependencies=()=>{
        const ordersOn=$('permOrdersView').checked;
        $('permOrdersUpdate').disabled=!ordersOn;
        if(!ordersOn) $('permOrdersUpdate').checked=false;
        const ledgerOn=$('permLedgerView').checked;
        $('permCostEntry').disabled=!ledgerOn;
        $('permProfitView').disabled=!ledgerOn;
        if(!ledgerOn){$('permCostEntry').checked=false;$('permProfitView').checked=false;}
      };
      ['permOrdersView','permLedgerView'].forEach(id=>$(id).addEventListener('change',syncPermissionDependencies));
      syncPermissionDependencies();
      $('savePermissionsTab').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'project.permissions.update'))return;
        p.permissions={
          ordersView:$('permOrdersView').checked,
          ordersUpdate:$('permOrdersView').checked&&$('permOrdersUpdate').checked,
          ledgerView:$('permLedgerView').checked,
          costEntry:$('permLedgerView').checked&&$('permCostEntry').checked,
          profitView:$('permLedgerView').checked&&$('permProfitView').checked,
          projectOptionsView:$('permProjectOptionsView').checked
        };
        await saveCompanies();logActivity(p.id,'Project admin access updated');
      };
    }
    if(tab==='owner'){
      ensureProjectGovernance(p);
      let latestInviteLink='';

      const setOwnerIdentityEditMode=(editing)=>{
        const name=$('ownerAccessName'),email=$('ownerAccessEmail');
        if(name)name.readOnly=!editing;
        if(email)email.readOnly=!editing;
        $('saveOwnerAccess')?.classList.toggle('hidden',!editing);
        $('editOwnerAccess')?.classList.toggle('hidden',editing);
        $('cancelOwnerEdit')?.classList.toggle('hidden',!editing);
        document.querySelector('.owner-identity-card')?.classList.toggle('editing',editing);
        if(editing)name?.focus();
      };

      $('editOwnerAccess')?.addEventListener('click',()=>setOwnerIdentityEditMode(true));
      $('cancelOwnerEdit')?.addEventListener('click',()=>renderProjectTab(p.id,'owner'));

      $('saveOwnerAccess')?.addEventListener('click',async()=>{
        if(!requireEngineProjectMutation(p,'owner.identity.update'))return;
        const ownerName=String($('ownerAccessName')?.value||'').trim();
        const ownerEmail=String($('ownerAccessEmail')?.value||'').trim();
        if(!ownerName){alert('Owner name is required.');return;}
        if(!ownerEmail){alert('Owner email is required.');return;}
        const priorOwnerEmail=String(p.ownerAccess.ownerEmail||'').trim();
        const ownerEmailChanged=normalizeOwnerLogin(priorOwnerEmail)!==normalizeOwnerLogin(ownerEmail);
        if(ownerEmailChanged && p.ownerAccess.status==='active' && p.ownerAccess.credential){
          if(!confirm('Changing the email for an active owner will revoke the current owner login. Continue?'))return;
          p.ownerAccess.credential=null;
          p.ownerAccess.status='not_claimed';
          p.ownerAccess.invitation=null;
          clearOwnerSession();
          logActivity(p.id,'Owner login revoked after identity change',`${priorOwnerEmail} → ${ownerEmail}`);
        }
        p.ownerAccess.ownerName=ownerName;
        p.ownerAccess.ownerEmail=ownerEmail;
        p.ownerAccess.capabilities=$$('[data-owner-capability]').filter(x=>x.checked).map(x=>x.dataset.ownerCapability);
        p.ownerAccess.updatedAt=new Date().toISOString();

        // If owner identity changes after an unclaimed invite was issued,
        // revoke/purge that invitation so it cannot be used by the prior identity.
        const inv=p.ownerAccess.invitation;
        if(inv && !inv.claimedAt){
          p.ownerAccess.invitation=null;
          if(p.ownerAccess.status==='invited')p.ownerAccess.status='not_claimed';
          logActivity(p.id,'Owner invitation cleared after identity update',ownerEmail);
        }

        await saveCompanies();
        logActivity(p.id,'Project owner identity saved',ownerEmail);
        await renderProjectTab(p.id,'owner');
      });

      $$('[data-owner-capability]').forEach(box=>box.addEventListener('change',async()=>{
        if(!requireEngineProjectMutation(p,'owner.capabilities.update')){await renderProjectTab(p.id,'owner');return;}
        p.ownerAccess.capabilities=$$('[data-owner-capability]').filter(x=>x.checked).map(x=>x.dataset.ownerCapability);
        p.ownerAccess.updatedAt=new Date().toISOString();
        await saveCompanies();
        logActivity(p.id,'Owner capabilities updated',p.ownerAccess.capabilities.join(', '));
      }));

      $('generateOwnerInvite')?.addEventListener('click',async()=>{
        if(!requireEngineProjectMutation(p,'owner.invitation.generate'))return;
        purgeExpiredOwnerInvitation(p);
        p.ownerAccess.ownerName=String($('ownerAccessName')?.value||'').trim();
        p.ownerAccess.ownerEmail=String($('ownerAccessEmail')?.value||'').trim();
        p.ownerAccess.capabilities=$$('[data-owner-capability]').filter(x=>x.checked).map(x=>x.dataset.ownerCapability);
        const result=await generateOwnerInvitation(p);
        if(!result.ok){alert(result.error);return;}
        latestInviteLink=result.link;
        if($('ownerInviteLink')) $('ownerInviteLink').value=result.link;
        if($('ownerInviteExpiry')) $('ownerInviteExpiry').textContent=`Expires ${new Date(result.expiresAt).toLocaleString()}. The raw claim link is displayed only for this generation.`;
        $('ownerInviteOutput')?.classList.remove('hidden');
      });

      $('copyOwnerInviteLink')?.addEventListener('click',async()=>{
        const value=latestInviteLink||$('ownerInviteLink')?.value||'';
        if(!value)return;
        try{
          await navigator.clipboard.writeText(value);
          if($('ownerInviteExpiry')) $('ownerInviteExpiry').textContent='Claim link copied. Share it directly with the intended owner.';
        }catch(_){
          $('ownerInviteLink')?.focus();
          $('ownerInviteLink')?.select();
        }
      });

      $('openOwnerInviteLink')?.addEventListener('click',()=>{
        const value=latestInviteLink||$('ownerInviteLink')?.value||'';
        if(!value)return;
        location.href=value;
        routeOwnerAccessFromHash();
      });

      $('revokeOwnerInvite')?.addEventListener('click',async()=>{
        if(!requireEngineProjectMutation(p,'owner.invitation.revoke'))return;
        if(!p.ownerAccess.invitation)return;
        if(!confirm(`Revoke the current owner invitation for ${p.name}?`))return;
        p.ownerAccess.invitation.revokedAt=new Date().toISOString();
        if(p.ownerAccess.status==='invited')p.ownerAccess.status='not_claimed';
        p.ownerAccess.updatedAt=new Date().toISOString();
        await saveCompanies();
        logActivity(p.id,'Owner invitation revoked',p.ownerAccess.ownerEmail);
        await renderProjectTab(p.id,'owner');
      });

      const previewOwnerBtn=$('previewOwnerPortal');
      if(previewOwnerBtn) previewOwnerBtn.onclick=async()=>{
        if(ownerPreviewOpening)return;
        ownerPreviewOpening=true;
        ownerPreviewReturnState={projectId:p.id,tab:'owner'};
        try{
          await openOwnerPortal(p.id,{preview:true});
        }catch(err){
          console.error('Owner Portal preview failed',err);
          alert('Owner Portal preview could not be opened. Please try again.');
        }finally{
          ownerPreviewOpening=false;
        }
      };
    }
    if(tab==='customers'){
      const savedOrders=await getMergedOrders();
      rebuildCustomerDirectoryForProject(p.id,savedOrders);
      $('saveCustomerHistoryTab').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'customer.history.settings.update'))return;
        p.customerHistory={adminVisible:$('customerHistoryAdminVisible').checked};
        await saveCompanies();
        logActivity(p.id,'Project Admin customer history '+(p.customerHistory.adminVisible?'enabled':'disabled'));
        await renderProjectTab(p.id,'customers');
      };
      $('rebuildCustomerHistoryBtn').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'customer.history.rebuild'))return;
        rebuildCustomerDirectoryForProject(p.id,await getMergedOrders());
        logActivity(p.id,'Customer history rebuilt');
        await renderProjectTab(p.id,'customers');
      };
    }
    if(tab==='deployment'){
      const deployments=migrateLegacyDeployment(p);
      let d=deploymentForEditor(p);

      $$('[data-deployment-select]').forEach(btn=>btn.onclick=()=>{
        deploymentSelectionByProject.set(p.id,btn.dataset.deploymentSelect);
        renderProjectTab(p.id,'deployment');
      });

      const createDeploymentBtn=$('createDeploymentBtn');
      const deploymentCreateForm=$('deploymentCreateForm');
      const deploymentCreateStatus=$('deploymentCreateStatus');
      const setDeploymentCreateStatus=(message,tone='')=>{
        if(!deploymentCreateStatus)return;
        deploymentCreateStatus.textContent=message||'';
        deploymentCreateStatus.dataset.tone=tone||'';
      };
      if(createDeploymentBtn) createDeploymentBtn.onclick=()=>{
        if(!requireEngineProjectMutation(p,'deployment.create.open'))return;
        const input=$('newDeploymentName');
        const profileInput=$('newDeploymentProfile');
        if(input)input.value='';
        if(profileInput)profileInput.value='kiosk_self_service';
        deploymentCreateForm?.classList.remove('hidden');
        setDeploymentCreateStatus('');
        requestAnimationFrame(()=>input?.focus());
      };
      if($('cancelCreateDeploymentBtn')) $('cancelCreateDeploymentBtn').onclick=()=>{
        deploymentCreateForm?.classList.add('hidden');
        setDeploymentCreateStatus('');
      };
      if($('confirmCreateDeploymentBtn')) $('confirmCreateDeploymentBtn').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'deployment.create'))return;
        const input=$('newDeploymentName');
        const profileInput=$('newDeploymentProfile');
        const name=String(input?.value||'').trim().replace(/\s+/g,' ');
        if(name.length<2){
          setDeploymentCreateStatus('Enter an outpost name before creating this deployment.','error');
          input?.focus();
          return;
        }
        const profile=DEPLOYMENT_PROFILES[profileInput?.value]?profileInput.value:'kiosk_self_service';
        // Always resolve the canonical fleet record at commit time. Project Control may have
        // rerendered since this tab was opened, so a captured project/array reference is not
        // authoritative for persistence confirmation.
        const canonicalProject=projectById(p.id);
        if(!canonicalProject){
          setDeploymentCreateStatus('Dark Sky could not resolve the owning project. Return to the Engine and reopen this project.','error');
          return;
        }
        const canonicalDeployments=migrateLegacyDeployment(canonicalProject);
        const fresh=newProjectDeployment(canonicalProject,name,profile);
        const boundary=window.BlackFlagV3Core?.validateDeployment?.(canonicalProject,fresh);
        if(boundary && !boundary.ok){
          setDeploymentCreateStatus('Dark Sky blocked this outpost because its project identity could not be sealed correctly.','error');
          window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:canonicalProject.id,category:'deployment',action:'deployment.create.blocked',detail:(boundary.failures||[]).join(', ')});
          return;
        }
        const createBtn=$('confirmCreateDeploymentBtn');
        if(createBtn){createBtn.disabled=true;createBtn.textContent='CREATING…';}
        canonicalDeployments.push(fresh);
        deploymentSelectionByProject.set(canonicalProject.id,fresh.id);
        try{
          // Confirm attachment before persistence, then confirm the actual IndexedDB registry
          // after persistence. This avoids treating a stale UI reference as proof of storage.
          if(!migrateLegacyDeployment(canonicalProject).some(x=>x.id===fresh.id)){
            throw new Error('deployment_not_attached_to_project');
          }
          await saveCompanies();
          const persisted=await getSetting('companies');
          const persistedProject=Array.isArray(persisted?.value)
            ? persisted.value.find(x=>String(x?.id||'')===String(canonicalProject.id))
            : null;
          const persistedDeployment=Array.isArray(persistedProject?.deployments)
            ? persistedProject.deployments.find(x=>String(x?.id||'')===String(fresh.id))
            : null;
          if(!persistedDeployment) throw new Error('deployment_persistence_not_confirmed');
          const persistedBoundary=window.BlackFlagV3Core?.validateDeployment?.(persistedProject,persistedDeployment);
          if(persistedBoundary && !persistedBoundary.ok) throw new Error(`deployment_persisted_boundary_invalid:${(persistedBoundary.failures||[]).join(',')}`);
          logActivity(canonicalProject.id,'Deployment outpost created',`${fresh.name} • ${DEPLOYMENT_PROFILES[profile]?.label||profile}`);
          window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:canonicalProject.id,category:'deployment',action:'deployment.created',detail:`${fresh.id} • ${fresh.name}`});
          await renderProjectTab(canonicalProject.id,'deployment');
        }catch(err){
          const liveProject=projectById(canonicalProject.id);
          const liveDeployments=liveProject?migrateLegacyDeployment(liveProject):canonicalDeployments;
          const idx=liveDeployments.findIndex(x=>x.id===fresh.id);
          if(idx>=0) liveDeployments.splice(idx,1);
          deploymentSelectionByProject.delete(canonicalProject.id);
          console.error('Deployment creation failed',err);
          const reason=String(err?.message||'deployment_write_failed').replace(/^Error:\s*/,'');
          setDeploymentCreateStatus(`Outpost was not created. Dark Sky preserved the project unchanged. ${reason}`,'error');
          window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:canonicalProject.id,category:'deployment',action:'deployment.create.failed',detail:reason});
          if(createBtn){createBtn.disabled=false;createBtn.textContent='CREATE OUTPOST';}
        }
      };

      if(d && $('saveDeploymentManifestBtn')) $('saveDeploymentManifestBtn').onclick=async()=>{
        if(!requireDeploymentBoundary(p,d,'deployment.manifest.update'))return;
        d.name=$('deployName').value.trim()||d.name;
        d.profile=$('deployProfile').value;
        d.idleMinutes=Number($('deployIdle').value)||3;
        d.capabilityScope=$('deployCapabilityScope').value;
        d.resetAfterComplete=$('deployReset').checked;
        d.purgeSession=$('deployPurge').checked;
        d.showStartOver=$('deployStartOver').checked;
        d.resumeAfterReload=$('deployResume').checked;
        d.deviceLockVerified=$('deployDeviceLock').checked;
        d.attractTitle=$('deployAttractTitle').value.trim()||'Ready when you are.';
        d.manifestVersion=Number(d.manifestVersion||1)+1;
        d.updatedAt=new Date().toISOString();
        await saveCompanies();
        logActivity(p.id,'Deployment manifest revised',`${d.name} • v${d.manifestVersion}`);
        const saveStatus=$('deploymentSaveStatus');
        if(saveStatus){
          saveStatus.textContent='✓ Changes saved · Project isolation confirmed';
          saveStatus.dataset.state='success';
          saveStatus.title=`Manifest v${d.manifestVersion} saved. Project bulkhead remains sealed.`;
          saveStatus.setAttribute('aria-live','polite');
        }
        setTimeout(()=>renderProjectTab(p.id,'deployment'),500);
      };

      if($('createDeploymentLaunchOfferBtn')) $('createDeploymentLaunchOfferBtn').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'product.launch_offer.create'))return;
        const name=$('deploymentLaunchOfferName')?.value.trim();
        const priceRaw=$('deploymentLaunchOfferPrice')?.value.trim();
        if(!name){
          $('deploymentLaunchOfferName')?.focus();
          return;
        }
        const canonicalProject=projectById(p.id); if(!canonicalProject)return;
        canonicalProject.products=Array.isArray(canonicalProject.products)?canonicalProject.products:[];
        const offer={
          id:`offer-${Date.now().toString(36)}`,
          name,
          active:true,
          published:true,
          customerReady:true,
          pricingMode:priceRaw?'fixed':'quote',
          price:priceRaw?Math.max(0,Number(priceRaw)||0):0,
          createdAt:new Date().toISOString()
        };
        canonicalProject.products.push(offer);
        try{
          await saveCompanies();
          logActivity(canonicalProject.id,'Customer launch offer created',offer.name);
          window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:canonicalProject.id,category:'product',action:'product.launch_offer.created',detail:offer.name});
          await renderProjectTab(canonicalProject.id,'deployment');
        }catch(err){
          canonicalProject.products=canonicalProject.products.filter(x=>x.id!==offer.id);
          alert(`Dark Sky could not save the customer offer: ${String(err?.message||err)}`);
        }
      };

      const triggerDeploymentSave=()=>document.getElementById('saveDeploymentManifestBtn')?.click();
      $$('[data-deployment-next]').forEach(btn=>btn.onclick=()=>{
        const action=btn.dataset.deploymentNext;
        if(action==='save'){triggerDeploymentSave();return;}
        const lifecycle=document.querySelector(`[data-deployment-action="${action}"]`);
        if(lifecycle){lifecycle.click();return;}
        if(action==='sea_trial' || action==='deployed'){
          const proxy=document.createElement('button');
          proxy.dataset.deploymentAction=action;
          proxy.className='hidden';
          document.body.appendChild(proxy);
          const current=d;
          if(!current){proxy.remove();return;}
          (async()=>{
            if(!requireDeploymentBoundary(p,current,'deployment.lifecycle.update')){proxy.remove();return;}
            if(!window.BlackFlagV3Core?.canTransitionDeployment?.(current.state,action)){proxy.remove();return;}
            const readiness=deploymentReadiness(current);
            if(action==='sea_trial' && readiness.score<100 && !confirm(`Sea Trial readiness is ${readiness.score}%. Continue to Sea Trial with warnings?`)){proxy.remove();return;}
            if(action==='deployed'){
              if(!projectCustomerOperatingModelReady(p)){alert('Add at least one customer-ready offer before activating this outpost.');proxy.remove();return;}
              if(!(await deploymentCommissionOrder(p,current))){proxy.remove();return;}
            }
            const prior=current.state; current.state=action; current.updatedAt=new Date().toISOString(); normalizeDeploymentIdentity(p,current); current.manifestVersion=Number(current.manifestVersion||1)+1;
            await saveCompanies(); logActivity(p.id,'Deployment lifecycle changed',`${current.name}: ${prior} → ${action}`); await renderProjectCommand(); await renderProjectTab(p.id,'deployment'); proxy.remove();
          })();
        }
      });
      const openDeploymentCustomerTest=async()=>{
        if(!d || !requireDeploymentBoundary(p,d,'deployment.customer_test'))return;
        if(d.state!=='sea_trial' && d.state!=='deployed'){
          alert('Save the outpost and begin Sea Trial before opening the customer test.');
          return;
        }
        d.testOpenedAt=new Date().toISOString();
        d.updatedAt=d.testOpenedAt;
        d.testMode='customer_shell';
        await saveCompanies();
        logActivity(p.id,'Deployment customer test opened',d.name);
        openDeploymentTestDock(p,d);
      };
      if($('testDeploymentExperienceBtn')) $('testDeploymentExperienceBtn').onclick=openDeploymentCustomerTest;
      if($('deploymentPreviewActionBtn')) $('deploymentPreviewActionBtn').onclick=openDeploymentCustomerTest;

      $$('[data-deployment-action]').forEach(btn=>btn.onclick=async()=>{
        if(!d)return;
        if(!requireDeploymentBoundary(p,d,'deployment.lifecycle.update'))return;
        const next=btn.dataset.deploymentAction;
        if(!window.BlackFlagV3Core?.canTransitionDeployment?.(d.state,next)){
          window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:p.id,category:'authorization',action:'deployment.transition.blocked',detail:`${d.id} • ${d.state} → ${next}`});
          alert(`Dark Sky blocked an invalid outpost transition: ${d.state} → ${next}.`);
          return;
        }
        const readiness=deploymentReadiness(d);
        if(next==='sea_trial' && readiness.score<100){
          if(!confirm(`Sea Trial readiness is ${readiness.score}%. Continue to Sea Trial with warnings?`))return;
        }
        if(next==='deployed'){
          if(d.state!=='sea_trial'&&d.state!=='paused')return;
          if(!projectCustomerOperatingModelReady(p)){alert('Add at least one customer-ready offer before activating this outpost.');return;}
          if(!(await deploymentCommissionOrder(p,d)))return;
        }
        if(next==='retired'){
          if(!confirm(`Retire ${d.name}? Historical deployment records will be preserved.`))return;
        }
        const prior=d.state;
        d.state=next;
        d.updatedAt=new Date().toISOString();
        normalizeDeploymentIdentity(p,d);
        if(next==='retired')d.deviceIdentity.revokedAt=d.updatedAt;
        else if(d.deviceIdentity)delete d.deviceIdentity.revokedAt;
        d.manifestVersion=Number(d.manifestVersion||1)+1;
        await saveCompanies();
        logActivity(p.id,'Deployment lifecycle changed',`${d.name}: ${prior} → ${next}`);
        await renderProjectCommand();
        await renderProjectTab(p.id,'deployment');
      });
    }
    if(tab==='notifications'){
      $('saveNotificationsTab').onclick=async()=>{
        if(!requireEngineProjectMutation(p,'notifications.update'))return;
        p.notifications={customerConfirmationEmail:$('projectCustomerEmailEnabled').checked};
        await saveCompanies();
        logActivity(p.id,'Customer confirmation email '+(p.notifications.customerConfirmationEmail?'enabled':'disabled'));
      };
    }
    if(tab==='orders'){
      const orders=approvedProjectOrders(await getMergedOrders(),p).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
      const stats={
        total:orders.length,
        newOrders:orders.filter(o=>canonicalOrderStatus(o.status)==='New').length,
        active:orders.filter(o=>canonicalOrderStatus(o.status)!=='Completed').length,
        completed:orders.filter(o=>canonicalOrderStatus(o.status)==='Completed').length
      };
      const summary=`<div class="pec-order-summary">
        <article><span>Total Orders</span><strong>${stats.total}</strong></article>
        <article><span>New</span><strong>${stats.newOrders}</strong></article>
        <article><span>Active</span><strong>${stats.active}</strong></article>
        <article><span>Completed</span><strong>${stats.completed}</strong></article>
      </div>`;
      const commandList=orders.length?`<div class="pec-order-command-list">${orders.map(o=>{
        const status=canonicalOrderStatus(o.status);
        const statusClass=adminStatusClass(status);
        const request=orderRequestedText(o);
        const style=orderStyleSummary(o);
        const offer=orderOfferSummary(o,p)||p.name;
        return `<article class="pec-order-command-card ${escapeHtml(statusClass)}">
          <div class="pec-order-command-head">
            <div class="pec-order-command-id"><small>ORDER</small><strong>${escapeHtml(o.id)}</strong><span>${escapeHtml(compactOrderDate(o.createdAt))}</span></div>
            <div class="pec-order-command-state"><span class="pec-order-status ${escapeHtml(statusClass)}">${escapeHtml(status)}</span><strong>$${Number(o.price||0).toFixed(2)}</strong></div>
          </div>
          <div class="pec-order-command-body">
            <section><small>CUSTOMER</small><strong>${escapeHtml(o.customerName||'Not captured')}</strong><div class="pec-order-contact-stack">${o.customerPhone?`<a href="tel:${escapeHtml(o.customerPhone)}">${escapeHtml(o.customerPhone)}</a>`:'<span>No phone</span>'}${o.customerEmail?`<a href="mailto:${escapeHtml(o.customerEmail)}">${escapeHtml(o.customerEmail)}</a>`:'<span>No email</span>'}</div></section>
            <section><small>REQUEST</small><strong>${escapeHtml(request||'No request detail')}</strong><span>${escapeHtml(style||offer)}</span></section>
            <section><small>OFFER / SOURCE</small><strong>${escapeHtml(offer)}</strong><span>${escapeHtml(p.name)} · ${escapeHtml(p.projectCode||p.orderPrefix||'PROJECT')}</span></section>
          </div>
        </article>`;
      }).join('')}</div>`:`<div class="pec-order-empty"><strong>No orders yet</strong><span>The first approved project order will appear here.</span></div>`;
      $('ptOrders').innerHTML=summary+commandList;
    }
  }


  // =========================================================
  // v3.3 PROJECT COMMISSIONING — Engine-native project factory
  // =========================================================
  let commissionStep=1;
  let commissionDraft=null;

  function commissionSlug(v){
    return String(v||'').trim().toLowerCase()
      .replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,54);
  }

  function commissionCode(v){
    const words=String(v||'').trim().split(/\s+/).filter(Boolean);
    return (words.map(x=>x[0]).join('').slice(0,4)||'PRJ').toUpperCase();
  }

  const COMMISSION_DRAFT_KEY='blackFlagCommissionDraftV2';
  function freshCommissionDraft(){
    return {
      draftId:'commission-'+Date.now(),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      _step:1,_maxStepReached:1,_recovered:false,
      name:'',ownerName:'',ownerEmail:'',
      businessType:'other',description:'',businessBrief:'',
      primaryOffer:'',characterLimit:32,pricingMode:'manual',
      customerMode:'guided',relationshipType:'auto',photoRequired:false,contactCapture:true,visualProfile:'none',
      ownerPortal:true,customerRetention:false,notifications:false,
      namespace:'',projectCode:'',orderPrefix:'',
      status:'development',visibility:'private',deploymentState:'sea_trial'
    };
  }
  function readCommissionDraft(){
    try{
      const saved=JSON.parse(localStorage.getItem(COMMISSION_DRAFT_KEY)||localStorage.getItem('blackFlagCommissionDraft')||'null');
      if(!saved||typeof saved!=='object')return null;
      return {...freshCommissionDraft(),...saved,_recovered:true};
    }catch(_){return null;}
  }
  function clearCommissionDraft(){
    localStorage.removeItem(COMMISSION_DRAFT_KEY);
    localStorage.removeItem('blackFlagCommissionDraft');
  }

  function openProjectCommissioning(){
    const recovered=readCommissionDraft();
    commissionDraft=recovered||freshCommissionDraft();
    commissionStep=Math.max(1,Math.min(6,Number(commissionDraft._step||1)));
    commissionDraft._maxStepReached=Math.max(1,Math.min(6,Number(commissionDraft._maxStepReached||commissionStep||1)));
    const w=$('projectCommissioningWorkspace');
    w.classList.remove('hidden'); w.setAttribute('aria-hidden','false');
    document.body.classList.add('engine-workspace-open');
    renderCommissioning();
    bindCommissioningControls();
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',category:'project',action:recovered?'commissioning.resumed':'commissioning.opened',detail:commissionDraft.draftId});
  }

  function closeProjectCommissioning(){
    const w=$('projectCommissioningWorkspace');
    w.classList.add('hidden'); w.setAttribute('aria-hidden','true');
    document.body.classList.remove('engine-workspace-open');
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  function captureCommissionFields(){
    document.querySelectorAll('#commissioningBody [data-cfield]').forEach(el=>{
      const k=el.dataset.cfield;
      commissionDraft[k]=el.type==='checkbox'?!!el.checked:(el.type==='number'?Number(el.value||0):el.value);
    });
    if(commissionDraft.name){
      commissionDraft.projectCode=commissionDraft.projectCode||commissionCode(commissionDraft.name);
      commissionDraft.orderPrefix=commissionDraft.orderPrefix||commissionDraft.projectCode;
    }
    if(String(commissionDraft.businessBrief||'').trim()){
      commissionDraft.description=String(commissionDraft.businessBrief).trim().split(/\n+/)[0].slice(0,180);
    }
    commissionDraft._step=commissionStep;
    commissionDraft._maxStepReached=Math.max(Number(commissionDraft._maxStepReached||1),commissionStep);
    commissionDraft.updatedAt=new Date().toISOString();
  }

  function commissioningOperatingPreview(){
    const core=window.BlackFlagV3Core;
    const sample={
      businessType:commissionDraft?.businessType||'other',
      type:commissionDraft?.businessType||'other',
      description:commissionDraft?.description||'',
      businessBrief:{text:commissionDraft?.businessBrief||commissionDraft?.description||''},
      products:commissionDraft?.primaryOffer?[{name:commissionDraft.primaryOffer,active:true}]:[],
      customerExperience:{mode:commissionDraft?.customerMode||'guided',relationshipType:commissionDraft?.relationshipType&&commissionDraft.relationshipType!=='auto'?commissionDraft.relationshipType:undefined,photoRequired:!!commissionDraft?.photoRequired,contactCapture:commissionDraft?.contactCapture!==false},
      visualPresentation:{profile:commissionDraft?.visualProfile||'none'}
    };
    return core?.deriveOperatingProfile?.(sample,commissionDraft?.businessBrief||commissionDraft?.description||'')||{mode:'other',customerFlow:commissionDraft?.customerMode||'guided',fulfillment:[],schedulingNeeded:false,requiredInputs:[],summary:'Operating model will be derived at commissioning.'};
  }

  function commissioningStepMarkup(){
    const d=commissionDraft;
    if(commissionStep===1)return `
      <div class="commission-panel">
        <div class="eyebrow">01 • BUSINESS IDENTITY</div><h2>Name the vessel</h2>
        <p>Give the business a clear display name and identify the intended owner. Dark Sky assigns a separate immutable project ID when the vessel is commissioned.</p>
        <div class="commission-grid two">
          <label>Business / project name<input data-cfield="name" value="${escapeHtml(d.name)}" placeholder="Example Company"></label>
          <label>Project code<input data-cfield="projectCode" value="${escapeHtml(d.projectCode)}" placeholder="Assigned automatically"></label>
          <label>Owner name<input data-cfield="ownerName" value="${escapeHtml(d.ownerName)}" placeholder="Business owner"></label>
          <label>Owner email<input data-cfield="ownerEmail" value="${escapeHtml(d.ownerEmail)}" placeholder="owner@example.com"></label>
        </div>
        <div class="commission-callout"><b>SEALED FROM BIRTH</b><span>The visible business name is a label, not a security boundary. Dark Sky creates a unique immutable Project ID at commissioning. The business name can change later without changing ownership, history, or project isolation.</span></div>
      </div>`;
    if(commissionStep===2)return `
      <div class="commission-panel">
        <div class="eyebrow">02 • BUSINESS BRIEF</div><h2>Teach Dark Sky how this business works</h2>
        <p>Choose the closest starting model, then describe the business in your own words. Dark Sky keeps the original brief and turns it into a structured operating model that can be reviewed and corrected later.</p>
        <div class="commission-grid">
          <label>Starting model<select data-cfield="businessType">
            ${['wood_signs','mugs','flowers','retail','service','food','other'].map(x=>`<option value="${x}" ${d.businessType===x?'selected':''}>${x.replace(/_/g,' ').toUpperCase()}</option>`).join('')}
          </select></label>
          <label class="commission-brief-field">Business brief<textarea data-cfield="businessBrief" rows="9" maxlength="12000" placeholder="Tell Dark Sky what the business does, what it sells or provides, how customers should interact with it, how work is fulfilled, whether scheduling matters, what information customers need to provide, and anything unusual about how the business operates.">${escapeHtml(d.businessBrief||d.description||'')}</textarea></label>
        </div>
        <div class="business-brief-prompts"><span>Helpful prompts</span><b>What do you sell or provide?</b><b>How should customers buy or request it?</b><b>Pickup, delivery, shipping, on-site, event, or digital?</b><b>Does scheduling or a photo/reference matter?</b></div>
        <div class="commission-callout"><b>ONE BRIEF • REUSABLE UNDERSTANDING</b><span>The brief stays attached to this Project ID. Dark Sky derives customer flow, fulfillment, required inputs, scheduling needs, visual needs, and workflow signals from it without replacing what the owner actually wrote.</span></div>
      </div>`;
    if(commissionStep===3)return `
      <div class="commission-panel">
        <div class="eyebrow">03 • PRODUCTS & PRICING</div><h2>Establish the first offer</h2>
        <div class="commission-grid three">
          <label>Primary product / service<input data-cfield="primaryOffer" value="${escapeHtml(d.primaryOffer)}" placeholder="Primary offer"></label>
          <label>Character / input limit<input type="number" min="1" max="500" data-cfield="characterLimit" value="${Number(d.characterLimit||32)}"></label>
          <label>Pricing mode<select data-cfield="pricingMode">
            <option value="manual" ${d.pricingMode==='manual'?'selected':''}>MANUAL</option>
            <option value="fixed" ${d.pricingMode==='fixed'?'selected':''}>FIXED</option>
            <option value="rules" ${d.pricingMode==='rules'?'selected':''}>RULE BASED</option>
          </select></label>
        </div>
        <div class="commission-callout"><b>START SMALL</b><span>This commissions the project's first offer. Additional products remain managed inside its Control Center.</span></div>
      </div>`;
    if(commissionStep===4)return `
      <div class="commission-panel">
        <div class="eyebrow">04 • CUSTOMER EXPERIENCE</div><h2>Set the operating pattern</h2>
        <div class="commission-grid two">
          <label>Customer flow<select data-cfield="customerMode">
            <option value="guided" ${d.customerMode==='guided'?'selected':''}>GUIDED STEP-BY-STEP</option>
            <option value="catalog" ${d.customerMode==='catalog'?'selected':''}>CATALOG</option>
            <option value="request" ${d.customerMode==='request'?'selected':''}>REQUEST / QUOTE</option>
          </select></label>
          <label>Customer relationship<select data-cfield="relationshipType">${customerRelationshipOptions(d.relationshipType||'auto')}</select></label>
          <label class="checkline"><input type="checkbox" data-cfield="photoRequired" ${d.photoRequired?'checked':''}> Require customer photo</label>
          <label class="checkline"><input type="checkbox" data-cfield="contactCapture" ${d.contactCapture?'checked':''}> Capture customer contact information</label>
          <label>Visual presentation<select data-cfield="visualProfile">${visualProfileOptions(d.visualProfile||'none')}</select></label>
        </div>
        <div class="commission-callout"><b>VISUAL PROFILE IS A STARTING PRESET</b><span>Choose the closest preview behavior now. Project Control can later add or remove visual inputs, placement modes, transforms, proof steps, and production outputs without changing the project identity.</span></div>
        <div class="commission-callout"><b>BRANDING COMES NEXT</b><span>The new project receives safe placeholders now. Logo, hero graphics and other assets can be assigned later without changing the structural identity.</span></div>
      </div>`;
    if(commissionStep===5)return `
      <div class="commission-panel">
        <div class="eyebrow">05 • ACCESS & SERVICES</div><h2>Prepare the owner handoff</h2>
        <div class="commission-grid two">
          <label class="checkline"><input type="checkbox" data-cfield="ownerPortal" ${d.ownerPortal?'checked':''}> Prepare Owner Portal</label>
          <label class="checkline"><input type="checkbox" data-cfield="customerRetention" ${d.customerRetention?'checked':''}> Customer retention capability</label>
          <label class="checkline"><input type="checkbox" data-cfield="notifications" ${d.notifications?'checked':''}> Notifications capability</label>
        </div>
        <div class="commission-callout warning"><b>DEFAULT DENY</b><span>Capabilities not selected remain unavailable. Owner access is project-scoped only; commissioning never grants Engine or Captain authority to an outside owner.</span></div>
      </div>`;
    return `
      <div class="commission-panel sea-trial-review">
        <div class="eyebrow">06 • PRIVATE SEA TRIAL</div><h2>Ready to lay the keel</h2>
        <p>Review the project before Black Flag creates it. Commissioned projects begin private and unpublished.</p>
        <div class="commission-review-grid">
          <div><small>PROJECT</small><b>${escapeHtml(d.name||'Not named')}</b></div>
          <div><small>OWNER</small><b>${escapeHtml(d.ownerName||'Not assigned')}</b></div>
          <div><small>PERMANENT ID</small><b>ASSIGNED AT COMMISSION</b></div>
          <div><small>CODE</small><b>${escapeHtml(d.projectCode||commissionCode(d.name))}</b></div>
          <div><small>STARTING MODEL</small><b>${escapeHtml(String(d.businessType||'other').replace(/_/g,' ').toUpperCase())}</b></div>
          <div><small>VISUAL PROFILE</small><b>${escapeHtml((visualPresets()[d.visualProfile||'none']?.label||d.visualProfile||'None').toUpperCase())}</b></div>
          <div><small>OFFER</small><b>${escapeHtml(d.primaryOffer||'Configure later')}</b></div>
          <div><small>OWNER HANDOFF</small><b>${d.ownerPortal&&d.ownerName&&d.ownerEmail?'READY TO INVITE':'CONFIGURE LATER'}</b></div>
          <div><small>LAUNCH STATE</small><b>PRIVATE • SEA TRIAL</b></div>
        </div>
        ${(()=>{const m=commissioningOperatingPreview();return `<div class="commission-understanding-preview"><small>DARK SKY UNDERSTANDING</small><strong>${escapeHtml(String(m.mode||'other').replaceAll('-',' ').toUpperCase())}</strong><span>${escapeHtml(m.summary||'')}</span><span>Fulfillment: ${escapeHtml((m.fulfillment||[]).join(', ')||'project-defined')} • Scheduling: ${m.schedulingNeeded?'needed':'not currently indicated'}</span></div>`})()}
        <div class="commission-readiness" aria-label="Commissioning readiness">
          <div class="ready"><span>✓</span><b>IDENTITY SEALED</b><small>A unique immutable Project ID is generated at commission; names and branding can change later.</small></div>
          <div class="ready"><span>✓</span><b>PRIVATE BY DEFAULT</b><small>No customer deployment is published by commissioning alone.</small></div>
          <div class="${d.ownerPortal&&d.ownerName&&d.ownerEmail?'ready':'deferred'}"><span>${d.ownerPortal&&d.ownerName&&d.ownerEmail?'✓':'•'}</span><b>OWNER HANDOFF</b><small>${d.ownerPortal&&d.ownerName&&d.ownerEmail?'Ready for a project-bound invitation after commission.':'Deferred until an owner is assigned in Project Control.'}</small></div>
          <div class="deferred"><span>•</span><b>DEPLOYMENT</b><small>Outposts are commissioned separately after the project is reviewed.</small></div>
        </div>
        <div class="commission-callout success"><b>CAPTAIN APPROVAL REQUIRED FOR PUBLISHING</b><span>Commissioning creates the project structure only. It does not publish the business.</span></div>
      </div>`;
  }

  function renderCommissioning(){
    if(!commissionDraft)return;
    $('commissioningBody').innerHTML=commissioningStepMarkup();
    document.querySelectorAll('[data-commission-step]').forEach(b=>{
      const step=Number(b.dataset.commissionStep);
      b.classList.toggle('active',step===commissionStep);
      b.classList.toggle('complete',step<commissionStep||step<Number(commissionDraft._maxStepReached||1));
      b.disabled=step>Number(commissionDraft._maxStepReached||1);
      b.setAttribute('aria-current',step===commissionStep?'step':'false');
    });
    $('commissionPrev').disabled=commissionStep===1;
    $('commissionNext').textContent=commissionStep===6?'COMMISSION PROJECT':'CONTINUE';
    const recovered=commissionDraft._recovered?' • RECOVERED DRAFT':'';
    $('commissionDraftStatus').textContent=`DRAFT • STEP ${commissionStep}/6${recovered} • NOT PUBLISHED`;
    clearCommissionValidation();
    bindCommissioningControls();
  }

  async function saveCommissionDraft(){
    captureCommissionFields();
    commissionDraft._step=commissionStep;
    commissionDraft._recovered=false;
    localStorage.setItem(COMMISSION_DRAFT_KEY,JSON.stringify(commissionDraft));
    localStorage.removeItem('blackFlagCommissionDraft');
    $('commissionDraftStatus').textContent=`DRAFT SAVED • ${new Date().toLocaleTimeString()} • NOT PUBLISHED`;
  }

  function commissionError(message,fieldName){
    const el=$('commissionValidation');
    if(el){
      el.textContent=message;
      el.classList.add('visible');
      el.scrollIntoView({block:'nearest',behavior:'smooth'});
    }else alert(message);
    if(fieldName){
      const field=document.querySelector(`#commissioningBody [data-cfield="${fieldName}"]`);
      if(field){
        field.classList.add('commission-field-error');
        field.setAttribute('aria-invalid','true');
        setTimeout(()=>field.focus({preventScroll:true}),60);
      }
    }
    return false;
  }
  function clearCommissionValidation(){
    const el=$('commissionValidation');
    if(el){el.textContent='';el.classList.remove('visible');}
    document.querySelectorAll('#commissioningBody .commission-field-error').forEach(field=>{
      field.classList.remove('commission-field-error');
      field.removeAttribute('aria-invalid');
    });
  }
  function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());}
  function validateCommissionStep(){
    clearCommissionValidation();
    captureCommissionFields();
    if(commissionStep===1){
      if(!String(commissionDraft.name||'').trim())return commissionError('Enter a business or project name before continuing.','name');
      if(String(commissionDraft.name||'').trim().length<2)return commissionError('Use at least two characters for the business name.','name');
      if(commissionDraft.ownerEmail && !validEmail(commissionDraft.ownerEmail))return commissionError('Enter a valid owner email address or leave it blank for later.','ownerEmail');
    }
    if(commissionStep===5 && commissionDraft.ownerPortal){
      if(!String(commissionDraft.ownerName||'').trim())return commissionError('Owner Portal is selected. Add the owner name in Step 1 or turn Owner Portal off for now.','ownerName');
      if(!validEmail(commissionDraft.ownerEmail))return commissionError('Owner Portal is selected. Add a valid owner email in Step 1.','ownerEmail');
    }
    return true;
  }

  function validateCommissionDraftFinal(){
    captureCommissionFields();
    if(!String(commissionDraft.name||'').trim())return commissionError('Business identity is incomplete. Add the project name in Step 1.');
    if(commissionDraft.ownerEmail && !validEmail(commissionDraft.ownerEmail))return commissionError('The owner email is not valid. Correct it in Step 1.');
    if(commissionDraft.ownerPortal){
      if(!String(commissionDraft.ownerName||'').trim())return commissionError('Owner handoff is enabled, but the owner name is missing.');
      if(!validEmail(commissionDraft.ownerEmail))return commissionError('Owner handoff is enabled, but a valid owner email is missing.');
    }
    return true;
  }

  async function handleCommissionAction(action){
    try{
      if(!commissionDraft)commissionDraft=readCommissionDraft()||freshCommissionDraft();
      if(action==='back'){
        captureCommissionFields();
        commissionStep=Math.max(1,commissionStep-1);
        commissionDraft._step=commissionStep;
        localStorage.setItem(COMMISSION_DRAFT_KEY,JSON.stringify(commissionDraft));
        renderCommissioning();
        return;
      }
      if(action==='save'){
        await saveCommissionDraft();
        return;
      }
      if(action==='reset'){
        if(!confirm('Discard this commissioning draft and start a new project setup?'))return;
        const discardedId=commissionDraft?.draftId||'';
        clearCommissionDraft();
        commissionDraft=freshCommissionDraft();
        commissionStep=1;
        renderCommissioning();
        window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',category:'project',action:'commissioning.draft.discarded',detail:discardedId});
        return;
      }
      if(action==='continue'){
        if(!validateCommissionStep())return;
        if(commissionStep<6){
          commissionStep++;
          commissionDraft._step=commissionStep;
          commissionDraft._maxStepReached=Math.max(Number(commissionDraft._maxStepReached||1),commissionStep);
          localStorage.setItem(COMMISSION_DRAFT_KEY,JSON.stringify(commissionDraft));
          renderCommissioning();
          document.querySelector('.commissioning-shell')?.scrollIntoView({block:'start'});
          return;
        }
        await commissionProject();
      }
    }catch(err){
      console.error('Commissioning command failed',err);
      commissionError(`Commissioning command interrupted. Nothing was advanced. ${err?.message||'Please try again.'}`);
      window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',category:'project',action:'commissioning.command.failed',detail:String(err?.message||err)});
    }
  }

  function bindCommissioningControls(){
    const workspace=$('projectCommissioningWorkspace');
    if(!workspace)return;
    const bind=(id,action)=>{
      const btn=$(id);
      if(!btn)return;
      btn.onclick=(event)=>{event.preventDefault();event.stopPropagation();handleCommissionAction(action);};
    };
    bind('commissionPrev','back');
    bind('commissionSaveDraft','save');
    bind('commissionReset','reset');
    bind('commissionNext','continue');
    const close=$('closeProjectCommissioning');
    if(close)close.onclick=(event)=>{event.preventDefault();closeProjectCommissioning();};
    workspace.querySelectorAll('[data-commission-step]').forEach(btn=>{
      btn.onclick=(event)=>{
        event.preventDefault();
        const requested=Number(btn.dataset.commissionStep);
        if(!commissionDraft || requested>Number(commissionDraft._maxStepReached||1))return;
        captureCommissionFields();
        commissionStep=requested;
        commissionDraft._step=commissionStep;
        localStorage.setItem(COMMISSION_DRAFT_KEY,JSON.stringify(commissionDraft));
        renderCommissioning();
      };
    });
  }

  async function commissionProject(){
    captureCommissionFields();
    if(!validateCommissionDraftFinal())return;
    const code=(commissionDraft.projectCode||commissionCode(commissionDraft.name)).toUpperCase();
    const core=window.BlackFlagV3Core;
    const id=core?.createProjectId?.(commissionDraft.name,companies)||('bf-p-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8));
    const sameNames=core?.findProjectsByName?.(companies,commissionDraft.name,{includeArchived:false})||[];
    if(sameNames.length){
      core?.audit?.({actorRole:'engine_admin',category:'project',action:'project.display_name.reused',detail:`${commissionDraft.name} • existing ${sameNames.map(x=>x.projectId).join(', ')}`});
    }
    const p={
      id,
      name:commissionDraft.name.trim(),
      description:commissionDraft.description||commissionDraft.businessBrief||commissionDraft.primaryOffer||'New commissioned project',
      businessBrief:{text:String(commissionDraft.businessBrief||commissionDraft.description||'').trim(),source:'commissioning',updatedAt:new Date().toISOString()},
      projectCode:code,
      orderPrefix:commissionDraft.orderPrefix||code,
      namespace:core?.namespaceFor?.(id)||('bf.project.'+id),
      permanentNamespace:core?.namespaceFor?.(id)||('bf.project.'+id),
      status:'development',
      visibility:'private',
      approved:true,
      published:false,
      characterLimit:Number(commissionDraft.characterLimit||32),
      theme:'commissioned',
      businessType:commissionDraft.businessType,
      type:commissionDraft.businessType||'custom_service',
      customerExperience:{
        mode:commissionDraft.customerMode,
        relationshipType:commissionDraft.relationshipType&&commissionDraft.relationshipType!=='auto'?commissionDraft.relationshipType:undefined,
        photoRequired:!!commissionDraft.photoRequired,
        contactCapture:!!commissionDraft.contactCapture
      },
      visualPresentation:window.BlackFlagV3Core?.normalizeVisualPresentation?.({businessType:commissionDraft.businessType,customerExperience:{photoRequired:!!commissionDraft.photoRequired},visualPresentation:{profile:commissionDraft.visualProfile||'none'}}),
      products:commissionDraft.primaryOffer?[{id:'product-'+Date.now().toString(36),name:commissionDraft.primaryOffer,active:true,published:true,customerReady:true,pricingMode:commissionDraft.pricingMode}]:[],
      ownerAccess:{
        enabled:!!commissionDraft.ownerPortal,
        ownerName:commissionDraft.ownerName||'',
        ownerEmail:commissionDraft.ownerEmail||'',
        status:'not_claimed',
        invitation:null,
        credential:null,
        updatedAt:new Date().toISOString()
      },
      capabilities:{
        customerRetention:!!commissionDraft.customerRetention,
        notifications:!!commissionDraft.notifications
      },
      orders:[],customers:[],deployments:[],ledger:[],
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      commissionedAt:new Date().toISOString(),
      lifecycle:{state:'draft',version:3,updatedAt:new Date().toISOString()},
      registry:{version:1,source:'commissioning',displayNameUnique:false},
      commissioningVersion:'3.9.9'
    };

    // Commissioning is a durable registry transaction, not a visual completion.
    // Seal the candidate, commit it to the canonical per-project store + legacy
    // mirror atomically, read the registry back, then render FROM that read-back.
    // The draft is cleared only after all of those checks succeed.
    core?.ensure?.(p);
    // First durable checkpoint: preserve the complete immutable project candidate
    // outside IndexedDB before attempting any registry transaction.
    writeCommissionJournal(p,'candidate_captured','Project identity sealed; canonical registry write has not completed yet.');
    const beforeCommission=structuredClone(companies);
    companies.push(p);
    let persistedRegistry;
    try{
      persistedRegistry=await saveCompanies();
      writeCommissionJournal(p,'registry_written','Canonical registry transaction completed; verifying read-back.');
      if(!registryContainsProject(persistedRegistry,id)){
        throw new Error(`${p.name} was not verified in the canonical fleet registry.`);
      }
      const canonicalReadback=await readCanonicalProjectRegistry();
      if(!registryContainsProject(canonicalReadback,id)){
        throw new Error(`${p.name} disappeared during canonical registry read-back.`);
      }
      companies=canonicalReadback.map(normalizeProjectCode).map(ensureProjectGovernance);
      if(!projectById(id)) throw new Error(`${p.name} could not be resolved after registry reload.`);
      await addProjectToV4FleetManifest(id);
      writeCommissionJournal(p,'registry_verified','Canonical project registry read-back verified and Project ID added to the V4 fleet manifest. Rendering Engine card.');
    }catch(err){
      companies=beforeCommission;
      commissionDraft._lastError=String(err?.message||err);
      commissionDraft._step=6;
      commissionDraft._maxStepReached=6;
      commissionDraft.updatedAt=new Date().toISOString();
      localStorage.setItem(COMMISSION_DRAFT_KEY,JSON.stringify(commissionDraft));
      writeCommissionJournal(p,'registry_failed',String(err?.message||err));
      throw err;
    }

    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:id,category:'project',action:'project.commissioned',detail:`${p.name} • ${p.namespace} • canonical registry verified`});
    // Record durable success BEFORE any presentation work. A UI refresh is allowed
    // to fail without changing the truth that the vessel is already in the registry.
    localStorage.setItem('blackFlagLastCommissionVerificationV1',JSON.stringify({projectId:id,name:p.name,at:new Date().toISOString(),registryVerified:true,renderVerified:false,build:BUILD_VERSION}));
    closeProjectCommissioning();
    await renderEngineRoom();
    const rendered=document.querySelector(`[data-open-project-control="${CSS.escape(id)}"]`);
    if(!rendered){
      writeCommissionJournal(p,'presentation_refresh_failed','Registry verified, but the Engine card did not appear after refresh.');
      throw new Error(`${p.name} is safely in the fleet registry, but its Engine card did not render. Reload the Engine; the project has NOT been lost.`);
    }
    clearCommissionDraft();
    clearCommissionJournal(id);
    localStorage.setItem('blackFlagLastCommissionVerificationV1',JSON.stringify({projectId:id,name:p.name,at:new Date().toISOString(),registryVerified:true,renderVerified:true,build:BUILD_VERSION}));
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId:id,category:'project',action:'commissioning.presentation.verified',detail:`${p.name} rendered in Project Command on build ${BUILD_VERSION}`});
    setTimeout(async()=>{const created=projectById(id);if(created)await continueProjectLaunch(created);},120);
  }

  async function openProjectEngineControl(id){
    const p=projectById(id);if(!p)return;
    clearGraphicsTransientUi();
    engineActiveProjectId=id;
    $('pecTitle').textContent=p.name;
    $('pecSubtitle').textContent='Business command, operating visibility, and project-scoped controls. Black Flag remains unlocked only while you stay in the Engine.';
    await applyProjectControlBrand(p);
    syncProjectOperatingLanguage(p);
    openEngineWorkspace($('projectEngineControl'));
    await renderProjectTab(id,'overview');
  }

  async function openCaptainDeploymentRoute(route){
    const p=projectById(route?.projectId); if(!p)return;
    deploymentSelectionByProject.set(p.id,route.outpostId||'');
    if(!engineSessionUnlocked){
      pendingCaptainDeploymentRoute=route;
      document.getElementById('captainFleetChart')?.classList.add('hidden');
      document.getElementById('captainQuarters')?.classList.add('hidden');
      $('engineRoomBtn')?.click();
      return;
    }
    await openProjectEngineControl(p.id);
    await renderProjectTab(p.id,'deployment');
  }
  window.addEventListener('blackflag:open-deployment',e=>openCaptainDeploymentRoute(e.detail||{}));




  const PROJECT_ASSET_STORAGE_KEY='blackFlagProjectAssetsV1'; // legacy localStorage key; migrated once
  const PROJECT_ASSET_DB='blackFlagGraphicsDB';
  const PROJECT_ASSET_DB_VERSION=1;
  const PROJECT_ASSET_STORE='projectGraphics';
  const PROJECT_ASSET_SLOTS=['projectLogo','heroGraphic','footerGraphic','backgroundImage'];
  const projectAssetMemory=new Map();

  function openProjectAssetDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(PROJECT_ASSET_DB,PROJECT_ASSET_DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(PROJECT_ASSET_STORE)) db.createObjectStore(PROJECT_ASSET_STORE,{keyPath:'key'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Graphics storage could not be opened.'));
    });
  }
  async function idbGraphicGet(projectId,slot){
    const db=await openProjectAssetDb();
    return new Promise((resolve,reject)=>{
      const req=db.transaction(PROJECT_ASSET_STORE,'readonly').objectStore(PROJECT_ASSET_STORE).get(`${projectId}::${slot}`);
      req.onsuccess=()=>{
        const row=req.result||null;
        if(row && (row.projectId!==projectId || row.slot!==slot || row.key!==`${projectId}::${slot}`)){
          reject(new Error('Project graphics namespace mismatch.'));
          return;
        }
        resolve(row);
      };
      req.onerror=()=>reject(req.error);
    });
  }
  async function idbGraphicPut(projectId,slot,blob){
    const db=await openProjectAssetDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PROJECT_ASSET_STORE,'readwrite');
      tx.objectStore(PROJECT_ASSET_STORE).put({key:`${projectId}::${slot}`,projectId,slot,blob,updatedAt:new Date().toISOString()});
      tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error||new Error('Graphic could not be stored.'));
    });
  }
  async function idbGraphicDelete(projectId,slot){
    const db=await openProjectAssetDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PROJECT_ASSET_STORE,'readwrite');
      tx.objectStore(PROJECT_ASSET_STORE).delete(`${projectId}::${slot}`);
      tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
    });
  }
  function blobToDataUrl(blob){
    return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
  }
  async function readProjectAssets(projectId){
    if(projectAssetMemory.has(projectId)) return projectAssetMemory.get(projectId);
    const assets={};
    for(const slot of PROJECT_ASSET_SLOTS){
      const row=await idbGraphicGet(projectId,slot);
      if(row?.blob) assets[slot]=await blobToDataUrl(row.blob);
    }
    projectAssetMemory.set(projectId,assets);
    return assets;
  }
  async function saveProjectAssetFile(projectId,slot,file){
    await idbGraphicPut(projectId,slot,file);
    const assets={...(projectAssetMemory.get(projectId)||{})};
    assets[slot]=await blobToDataUrl(file);
    projectAssetMemory.set(projectId,assets);
    return assets[slot];
  }
  async function clearProjectAsset(projectId,slot){
    await idbGraphicDelete(projectId,slot);
    const assets={...(projectAssetMemory.get(projectId)||{})}; delete assets[slot]; projectAssetMemory.set(projectId,assets);
  }
  async function migrateLegacyProjectAssets(){
    let legacy={}; try{legacy=JSON.parse(localStorage.getItem(PROJECT_ASSET_STORAGE_KEY)||'{}')||{};}catch(_){legacy={};}
    const ids=Object.keys(legacy); if(!ids.length)return;
    try{
      for(const projectId of ids){
        for(const slot of PROJECT_ASSET_SLOTS){
          const data=legacy[projectId]?.[slot]; if(!data)continue;
          const existing=await idbGraphicGet(projectId,slot); if(existing)continue;
          const blob=await (await fetch(data)).blob(); await idbGraphicPut(projectId,slot,blob);
        }
      }
      localStorage.removeItem(PROJECT_ASSET_STORAGE_KEY);
    }catch(err){console.warn('Legacy project graphics migration deferred',err);}
  }
  // Clear Horizon: expose the legacy graphics migrator through an explicit runtime bridge.
  // Old startup paths may call the bridge, but missing helpers can no longer throw a ReferenceError.
  window.blackFlagMigrateLegacyProjectAssets = migrateLegacyProjectAssets;
  function setSlotImage(id,data){
    const el=$(id);if(!el)return;
    if(data){el.src=data;el.classList.remove('hidden');}
    else{el.removeAttribute('src');el.classList.add('hidden');}
  }
  async function applyProjectAssetSlots(p){
    if(!p)return;
    const requestedProjectId=p.id;
    const assets=await readProjectAssets(requestedProjectId);

    // Project assets may only finish rendering into the project that requested them.
    if(activeProjectId && activeProjectId!==requestedProjectId)return;

    const customerLogo=$('customerProjectLogo');
    const customerLogoWrap=$('customerProjectLogoWrap');
    if(customerLogo && customerLogoWrap){
      if(assets.projectLogo){
        customerLogo.src=assets.projectLogo;
        customerLogo.alt=`${p.name} logo`;
        customerLogoWrap.classList.remove('hidden');
      }else{
        customerLogo.removeAttribute('src');
        customerLogoWrap.classList.add('hidden');
      }
    }

    const applyShellBackground=(shell)=>{
      if(!shell)return;
      shell.classList.toggle('has-project-background',!!assets.backgroundImage);
      shell.style.backgroundImage=assets.backgroundImage?`linear-gradient(rgba(255,255,255,.88),rgba(255,255,255,.88)),url("${assets.backgroundImage}")`:'';
      shell.style.backgroundSize=assets.backgroundImage?'cover':'';
      shell.style.backgroundPosition=assets.backgroundImage?'center':'';
      shell.style.backgroundAttachment=assets.backgroundImage?'fixed':'';
    };
    const applyHero=(imageId,artId)=>{
      const art=$(artId), image=$(imageId);
      const heroSource=assets.heroGraphic||assets.projectLogo||'';
      const usesHeroGraphic=!!assets.heroGraphic;
      const usesProjectLogo=!usesHeroGraphic && !!assets.projectLogo;

      setSlotImage(imageId,heroSource);
      if(image){
        image.alt=usesHeroGraphic?`${p.name} hero graphic`:usesProjectLogo?`${p.name} logo`:'';
      }
      if(art){
        art.classList.toggle('has-hero-graphic',usesHeroGraphic);
        art.classList.toggle('has-showcase-logo',usesProjectLogo);
        art.classList.toggle('has-showcase-asset',!!heroSource);
      }
    };

    if(p.id==='mugshot-after-dark'){
      setSlotImage('mugsProjectLogoImg',assets.projectLogo);
      $('mugsProjectLogoImg')?.closest('.mugs-shell-mark-wrap')?.classList.toggle('has-project-logo',!!assets.projectLogo);
      applyHero('mugsHeroGraphicImg','mugsHeroArt');
      setSlotImage('mugsFooterGraphicImg',assets.footerGraphic);
      applyShellBackground($('mugsCustomerShell'));
    }else if(p.id==='beccas-bloom-shop' || p.projectTheme==='flowers'){
      setSlotImage('flowersProjectLogoImg',assets.projectLogo);
      $('flowersProjectLogoImg')?.closest('.mugs-shell-mark-wrap')?.classList.toggle('has-project-logo',!!assets.projectLogo);
      applyHero('flowersHeroGraphicImg','flowersHeroArt');
      setSlotImage('flowersFooterGraphicImg',assets.footerGraphic);
      applyShellBackground($('flowersCustomerShell'));
    }else if(p.id==='ikes-wood-signs'){
      const root=$('customerApp');
      if(root){
        root.classList.toggle('has-project-background',!!assets.backgroundImage);
        root.style.backgroundImage=assets.backgroundImage?`linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.82)),url("${assets.backgroundImage}")`:'';
        root.style.backgroundSize=assets.backgroundImage?'cover':'';
        root.style.backgroundPosition=assets.backgroundImage?'center':'';
      }
    }
  }


  const PROJECT_ASSET_META_KEY='blackFlagProjectAssetMetaV1';
  const GRAPHIC_SLOT_LABELS={
    projectLogo:'Project Logo / Mark',
    heroGraphic:'Welcome Hero Graphic',
    footerGraphic:'Footer Graphic',
    backgroundImage:'Background / Texture'
  };
  function readAllProjectAssetMeta(){
    try{return JSON.parse(localStorage.getItem(PROJECT_ASSET_META_KEY)||'{}')||{};}catch(_){return {};}
  }
  function readProjectAssetMeta(projectId){
    return readAllProjectAssetMeta()[projectId]||{};
  }
  function writeProjectAssetMeta(projectId,meta){
    const all=readAllProjectAssetMeta();
    all[projectId]=meta||{};
    localStorage.setItem(PROJECT_ASSET_META_KEY,JSON.stringify(all));
  }
  function graphicSlotsForProject(p){
    const template=PROJECT_SHELL_TEMPLATES[p?.type]||PROJECT_SHELL_TEMPLATES['custom-product'];
    return template?.graphicSlots||PROJECT_ASSET_SLOTS;
  }
  function recordProjectGraphic(projectId,slot,data,file){
    const meta=readProjectAssetMeta(projectId);
    meta[slot]={
      slot,
      label:GRAPHIC_SLOT_LABELS[slot]||slot,
      fileName:file?.name||meta[slot]?.fileName||'Project graphic',
      mime:file?.type||meta[slot]?.mime||'image/*',
      updatedAt:new Date().toISOString(),
      bytes:file?.size||meta[slot]?.bytes||0,
      projectId
    };
    writeProjectAssetMeta(projectId,meta);
  }
  function removeProjectGraphicMeta(projectId,slot){
    const meta=readProjectAssetMeta(projectId);
    delete meta[slot];
    writeProjectAssetMeta(projectId,meta);
  }

  function graphicsProject(){
    const p=projectById(engineActiveProjectId);
    return p||null;
  }
  function clearGraphicsTransientUi(){
    ['assetProjectLogoInput','assetHeroGraphicInput','assetFooterGraphicInput','assetBackgroundInput'].forEach(id=>{
      const el=$(id); if(el) el.value='';
    });
    ['assetProjectLogoPreview','assetHeroGraphicPreview','assetFooterGraphicPreview','assetBackgroundPreview'].forEach(id=>{
      const el=$(id); if(el){el.removeAttribute('src');el.classList.add('hidden');}
    });
    $$('[data-expand-asset]').forEach(b=>b.classList.add('hidden'));
    if($('assetSaveMessage')) $('assetSaveMessage').textContent='';
    if($('graphicsSaveConfirmation')){
      $('graphicsSaveConfirmation').textContent='';
      $('graphicsSaveConfirmation').classList.add('hidden');
    }
    closeGraphicsExpandedPreview();
  }
  function closeGraphicsExpandedPreview(){
    $('graphicsExpandModal')?.classList.add('hidden');
    if($('graphicsExpandImage')) $('graphicsExpandImage').removeAttribute('src');
    if($('graphicsExpandTitle')) $('graphicsExpandTitle').textContent='Project Graphic';
    if($('graphicsExpandNamespace')) $('graphicsExpandNamespace').textContent='';
  }
  async function verifyGraphicsNamespace(projectId){
    if(!projectId)return false;
    for(const slot of PROJECT_ASSET_SLOTS){
      const row=await idbGraphicGet(projectId,slot);
      if(row && (row.projectId!==projectId || row.slot!==slot || row.key!==`${projectId}::${slot}`)){
        console.error('Graphics namespace verification failed',projectId,slot,row);
        return false;
      }
    }
    return true;
  }

  async function renderProjectGraphicsLibrary(){
    const p=graphicsProject(); if(!p)return;
    const requestedProjectId=p.id;
    const assets=await readProjectAssets(requestedProjectId);
    if(engineActiveProjectId!==requestedProjectId)return;
    const meta=readProjectAssetMeta(requestedProjectId);
    const slots=graphicSlotsForProject(p);
    const verified=await verifyGraphicsNamespace(requestedProjectId);
    if(engineActiveProjectId!==requestedProjectId)return;

    if($('graphicsProjectIdentity')) $('graphicsProjectIdentity').textContent=`${p.projectCode||p.orderPrefix||'PRJ'} • ${p.name}`;
    if($('graphicsIsolationNote')) $('graphicsIsolationNote').textContent=`SEALED PROJECT ID: ${requestedProjectId} • Reads and writes are restricted to this project.`;
    if($('graphicsSealStatus')){
      $('graphicsSealStatus').textContent=verified?'SEALED':'CHECK HULL';
      $('graphicsSealStatus').classList.toggle('seal-failed',!verified);
    }
    if($('graphicsLibrary')){
      $('graphicsLibrary').innerHTML=slots.map(slot=>{
        const has=!!assets[slot], m=meta[slot]||{};
        return `<article class="graphics-library-item ${has?'has-graphic':'empty-graphic'}" data-manage-graphic="${escapeHtml(slot)}" tabindex="0" role="button" aria-label="Manage ${escapeHtml(GRAPHIC_SLOT_LABELS[slot]||slot)}">
          <div class="graphics-library-preview">
            ${has?`<img src="${assets[slot]}" alt="${escapeHtml(GRAPHIC_SLOT_LABELS[slot]||slot)}"><button type="button" class="graphics-library-expand" data-expand-asset="${escapeHtml(slot)}" aria-label="Expand ${escapeHtml(GRAPHIC_SLOT_LABELS[slot]||slot)}">+</button>`:`<span>${escapeHtml((p.projectCode||'PRJ').slice(0,3))}</span>`}
          </div>
          <div class="graphics-library-copy"><strong>${escapeHtml(GRAPHIC_SLOT_LABELS[slot]||slot)}</strong>
          <small>${has?escapeHtml(m.fileName||'Assigned project graphic'):'No graphic assigned to this project'}</small></div>
          <span class="graphics-slot-state">${has?'SAVED':'OPEN SLOT'}<b>MANAGE</b></span>
        </article>`;
      }).join('');
    }
  }


  const GRAPHIC_SLOT_HELP={
    projectLogo:'Primary identity mark used throughout this project. The original artwork is preserved exactly.',
    heroGraphic:'Shown prominently on the customer welcome screen. It takes priority over the project logo in Project Showcase.',
    footerGraphic:'Displayed near the bottom of this project’s customer experience when assigned.',
    backgroundImage:'Used as a softened customer-experience background so content remains readable.'
  };
  const GRAPHIC_SLOT_SAVE_LABEL={
    projectLogo:'SAVE PROJECT LOGO',
    heroGraphic:'SAVE HERO GRAPHIC',
    footerGraphic:'SAVE FOOTER GRAPHIC',
    backgroundImage:'SAVE BACKGROUND / TEXTURE'
  };
  const GRAPHIC_SLOT_INPUT={
    projectLogo:'assetProjectLogoInput',
    heroGraphic:'assetHeroGraphicInput',
    footerGraphic:'assetFooterGraphicInput',
    backgroundImage:'assetBackgroundInput'
  };
  const GRAPHIC_SLOT_PREVIEW={
    projectLogo:'assetProjectLogoPreview',
    heroGraphic:'assetHeroGraphicPreview',
    footerGraphic:'assetFooterGraphicPreview',
    backgroundImage:'assetBackgroundPreview'
  };

  function setGraphicEditState(state,text){
    const el=$('graphicsEditState'); if(!el)return;
    el.className=`graphics-edit-state ${state||''}`.trim();
    el.textContent=text||'';
  }
  function updatePreviewEmptyState(previewId,hasImage){
    const empty=document.querySelector(`[data-preview-empty-for="${previewId}"]`);
    if(empty) empty.classList.toggle('hidden',!!hasImage);
  }
  function selectedFileForGraphicSlot(slot){
    const input=$(GRAPHIC_SLOT_INPUT[slot]);
    return input?.files?.[0]||null;
  }
  function previewSelectedGraphic(slot,file){
    const preview=$(GRAPHIC_SLOT_PREVIEW[slot]);
    if(!preview||!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      preview.src=String(reader.result||'');
      preview.classList.remove('hidden');
      updatePreviewEmptyState(preview.id,true);
      document.querySelector(`[data-asset-slot-card="${slot}"] [data-expand-asset="${slot}"]`)?.classList.remove('hidden');
      setGraphicEditState('unsaved','NEW IMAGE • NOT SAVED');
      const save=$('assetSaveBtn');
      if(save){save.disabled=false;save.textContent=GRAPHIC_SLOT_SAVE_LABEL[slot]||'SAVE GRAPHIC';}
      if($('assetSaveMessage')) $('assetSaveMessage').textContent='Previewing a new image. Save to make it live.';
    };
    reader.readAsDataURL(file);
  }

  function focusMarketingGraphicSlot(slot){
    const p=graphicsProject(); if(!p)return;
    const allowed=graphicSlotsForProject(p); if(!allowed.includes(slot))return;
    marketingActiveGraphicSlot=slot;
    const editor=$('graphicsFocusedEditor');
    if(editor){editor.classList.remove('hidden');editor.style.display='block';}
    if($('graphicsFocusedTitle')) $('graphicsFocusedTitle').textContent=GRAPHIC_SLOT_LABELS[slot]||'Project Graphic';
    if($('graphicsFocusedHelp')) $('graphicsFocusedHelp').textContent=GRAPHIC_SLOT_HELP[slot]||'Manage this project-owned graphic.';
    $$('[data-asset-slot-card]').forEach(card=>{
      const active=card.dataset.assetSlotCard===slot;
      card.classList.toggle('focused-active-slot',active);
      card.style.display=active?'flex':'none';
    });

    const preview=$(GRAPHIC_SLOT_PREVIEW[slot]);
    const hasSaved=!!(preview?.src && !preview.classList.contains('hidden'));
    updatePreviewEmptyState(GRAPHIC_SLOT_PREVIEW[slot],hasSaved);
    const save=$('assetSaveBtn');
    if(save){
      save.textContent=GRAPHIC_SLOT_SAVE_LABEL[slot]||'SAVE GRAPHIC';
      save.disabled=true;
    }
    setGraphicEditState(hasSaved?'saved':'open',hasSaved?'SAVED':'OPEN SLOT');
    if($('assetSaveMessage')) $('assetSaveMessage').textContent=hasSaved?'Choose a new image to replace the saved graphic.':'Choose an image to begin.';
    editor?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function closeMarketingGraphicSlot(){
    marketingActiveGraphicSlot=null;
    const editor=$('graphicsFocusedEditor');
    if(editor){editor.classList.add('hidden');editor.style.display='none';}
    $$('[data-asset-slot-card]').forEach(card=>{
      card.classList.remove('focused-active-slot');
      card.style.display='none';
    });
    $('graphicsLibrary')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  async function loadProjectAssetsEditor(){
    const p=graphicsProject(); if(!p)return;
    const requestedProjectId=p.id;
    clearGraphicsTransientUi();
    marketingActiveGraphicSlot=null;
    $('graphicsFocusedEditor')?.classList.add('hidden');
    const assets=await readProjectAssets(requestedProjectId);
    if(engineActiveProjectId!==requestedProjectId)return;
    const map={
      projectLogo:'assetProjectLogoPreview',
      heroGraphic:'assetHeroGraphicPreview',
      footerGraphic:'assetFooterGraphicPreview',
      backgroundImage:'assetBackgroundPreview'
    };
    Object.entries(map).forEach(([slot,id])=>{
      const el=$(id);if(!el)return;
      const data=assets[slot];
      if(data){
        el.src=data;el.classList.remove('hidden');
        updatePreviewEmptyState(id,true);
        document.querySelector(`[data-asset-slot-card="${slot}"] [data-expand-asset="${slot}"]`)?.classList.remove('hidden');
      }else{
        el.removeAttribute('src');el.classList.add('hidden');
        updatePreviewEmptyState(id,false);
      }
    });
    await renderProjectGraphicsLibrary();
  }

  async function collectAndSaveProjectAssets(){
    const p=graphicsProject();if(!p)return;
    const requestedProjectId=p.id;
    const slot=marketingActiveGraphicSlot;
    if(!slot || !GRAPHIC_SLOT_INPUT[slot])return;

    const input=$(GRAPHIC_SLOT_INPUT[slot]);
    const file=input?.files?.[0];
    if(!file){
      if($('assetSaveMessage')) $('assetSaveMessage').textContent='Choose an image before saving.';
      return;
    }

    if(engineActiveProjectId!==requestedProjectId) throw new Error('Project changed while graphics were being saved. Nothing was written.');
    setGraphicEditState('saving','SAVING…');
    const save=$('assetSaveBtn'); if(save) save.disabled=true;

    await saveProjectAssetFile(requestedProjectId,slot,file);
    recordProjectGraphic(requestedProjectId,slot,null,file);

    if(engineActiveProjectId!==requestedProjectId) throw new Error('Project changed before graphics confirmation.');
    await applyProjectAssetSlots(p);
    await loadProjectAssetsEditor();
    closeMarketingGraphicSlot();

    const label=GRAPHIC_SLOT_LABELS[slot]||'Project Graphic';
    if($('graphicsSaveConfirmation')){
      $('graphicsSaveConfirmation').innerHTML=`<strong>${escapeHtml(label.toUpperCase())} SAVED</strong><span>${escapeHtml(label)} saved to ${escapeHtml(p.name)} only.</span>`;
      $('graphicsSaveConfirmation').classList.remove('hidden');
    }
    logActivity(requestedProjectId,'Project graphic saved',label);
    await applyProjectControlBrand(p);
    await renderProjectCommand();
    return readProjectAssets(requestedProjectId);
  }
  function bindProjectAssetEditor(){
    Object.entries(GRAPHIC_SLOT_INPUT).forEach(([slot,id])=>{
      const input=$(id); if(!input)return;
      input.onchange=()=>{
        const file=input.files?.[0];
        if(file) previewSelectedGraphic(slot,file);
      };
    });

    const save=$('assetSaveBtn');
    if(save) save.onclick=()=>collectAndSaveProjectAssets().catch(err=>{
      if($('assetSaveMessage')) $('assetSaveMessage').textContent=err?.message||'Could not save graphics.';
    });

    const clears={
      assetProjectLogoClear:'projectLogo',
      assetHeroGraphicClear:'heroGraphic',
      assetFooterGraphicClear:'footerGraphic',
      assetBackgroundClear:'backgroundImage'
    };
    Object.entries(clears).forEach(([id,slot])=>{
      const el=$(id); if(!el)return;
      el.onclick=async()=>{
        const p=graphicsProject();if(!p)return;
        const requestedProjectId=p.id;
        await clearProjectAsset(requestedProjectId,slot);
        removeProjectGraphicMeta(requestedProjectId,slot);
        if(engineActiveProjectId!==requestedProjectId)return;
        await applyProjectAssetSlots(p);
        await loadProjectAssetsEditor();
        closeMarketingGraphicSlot();
        if($('graphicsSaveConfirmation')){
          $('graphicsSaveConfirmation').innerHTML=`<strong>GRAPHIC REMOVED</strong><span>${escapeHtml(GRAPHIC_SLOT_LABELS[slot]||slot)} removed from ${escapeHtml(p.name)} only.</span>`;
          $('graphicsSaveConfirmation').classList.remove('hidden');
        }
      };
    });

    const shell=$('projectTabContent');
    if(shell){
      shell.onclick=e=>{
        const manage=e.target.closest('[data-manage-graphic]');
        if(manage && !e.target.closest('[data-expand-asset]')){ focusMarketingGraphicSlot(manage.dataset.manageGraphic); return; }
        const expand=e.target.closest('[data-expand-asset]');
        if(!expand)return;
        const p=graphicsProject();if(!p)return;
        const slot=expand.dataset.expandAsset;
        const preview=$(GRAPHIC_SLOT_PREVIEW[slot]);
        const currentSrc=preview?.src||'';
        if(currentSrc && !preview.classList.contains('hidden')){
          if($('graphicsExpandImage')) $('graphicsExpandImage').src=currentSrc;
          if($('graphicsExpandTitle')) $('graphicsExpandTitle').textContent=GRAPHIC_SLOT_LABELS[slot]||'Project Graphic';
          if($('graphicsExpandNamespace')) $('graphicsExpandNamespace').textContent=`${p.projectCode||p.orderPrefix||'PRJ'} • ${p.id}${selectedFileForGraphicSlot(slot)?' • PREVIEW NOT YET SAVED':''}`;
          $('graphicsExpandModal')?.classList.remove('hidden');
          return;
        }
        readProjectAssets(p.id).then(assets=>{
          if(engineActiveProjectId!==p.id || !assets[slot])return;
          if($('graphicsExpandImage')) $('graphicsExpandImage').src=assets[slot];
          if($('graphicsExpandTitle')) $('graphicsExpandTitle').textContent=GRAPHIC_SLOT_LABELS[slot]||'Project Graphic';
          if($('graphicsExpandNamespace')) $('graphicsExpandNamespace').textContent=`${p.projectCode||p.orderPrefix||'PRJ'} • ${p.id}`;
          $('graphicsExpandModal')?.classList.remove('hidden');
        });
      };
    }
    if($('graphicsFocusedClose')) $('graphicsFocusedClose').onclick=closeMarketingGraphicSlot;
    if($('graphicsExpandClose')) $('graphicsExpandClose').onclick=closeGraphicsExpandedPreview;
    if($('graphicsExpandModal')) $('graphicsExpandModal').onclick=e=>{if(e.target.id==='graphicsExpandModal')closeGraphicsExpandedPreview();};
  }

  function operatingModelForProject(p){
    return window.BlackFlagV3Core?.resolveOperatingModel?.(p)||{mode:'other',customerFlow:p?.customerExperience?.mode||'guided',fulfillment:[],schedulingNeeded:false,requiredInputs:[],summary:'Project operating model'};
  }
  function customerRelationshipForProject(p){
    return window.BlackFlagV3Core?.resolveCustomerRelationship?.(p)||{type:'custom_project',label:'Custom Project',noun:'project request',actionLabel:'START PROJECT',testActionLabel:'SUBMIT TEST PROJECT',receiptLabel:'PROJECT REQUEST RECEIVED',confirmationHeading:'Project request received.',nextStep:'The business can review the project and follow up.',detailHeading:'Tell us about the project',detailPlaceholder:'Describe what you want to accomplish and anything the business should know.'};
  }
  function activityTermsForProject(p){return window.BlackFlagV3Core?.activityTermsForProject?.(p)||{type:'purchase',singular:'Order',plural:'Orders',lowerSingular:'order',lowerPlural:'orders'};}
  function projectWorkflowFor(p){return window.BlackFlagV3Core?.resolveProjectWorkflow?.(p)||((Array.isArray(p?.workflow)&&p.workflow.length>=2)?p.workflow:DEFAULT_BUSINESS_CONFIG.orderStatuses);}
  function syncProjectOperatingLanguage(p){if(!p)return;const terms=activityTermsForProject(p);const nav=document.querySelector('#projectTabs [data-project-tab="orders"] span:last-child');if(nav)nav.textContent=terms.plural;const adminNav=document.querySelector('#adminOrdersMenuBtn span');if(adminNav)adminNav.textContent=terms.plural;const adminHeading=$('adminOrdersHeading');if(adminHeading)adminHeading.textContent=`All ${terms.plural}`;const openFull=$('openFullOrdersBtn');if(openFull)openFull.textContent=`OPEN ${terms.plural.toUpperCase()}`;}
  function customerRelationshipOptions(selected='auto'){
    const rels=window.BlackFlagV3Core?.customerRelationshipTypes||{};
    return `<option value="auto" ${selected==='auto'?'selected':''}>AUTO — DERIVE FROM BUSINESS BRIEF</option>`+Object.entries(rels).map(([id,meta])=>`<option value="${escapeHtml(id)}" ${id===selected?'selected':''}>${escapeHtml(meta.label||id)}</option>`).join('');
  }
  function operatingModelModeOptions(selected='other'){
    const labels={'custom-product':'Custom Product','retail':'Retail','food-service':'Food / Beverage','service':'Service','request-quote':'Request / Quote','mixed':'Mixed','other':'Other'};
    return Object.entries(labels).map(([id,label])=>`<option value="${id}" ${id===selected?'selected':''}>${label}</option>`).join('');
  }
  function operatingUnderstandingMarkup(p){
    const model=operatingModelForProject(p);
    const fulfillment=(model.fulfillment||[]).join(', ')||'Project-defined';
    const inputs=(model.requiredInputs||[]).map(x=>x.replaceAll('_',' ')).join(', ')||'No special inputs detected';
    return `<div class="business-understanding-grid">
      <div><small>OPERATING MODEL</small><strong>${escapeHtml(String(model.mode||'other').replaceAll('-',' '))}</strong></div>
      <div><small>CUSTOMER FLOW</small><strong>${escapeHtml(String(model.customerFlow||'guided').replaceAll('-',' '))}</strong></div>
      <div><small>CUSTOMER RELATIONSHIP</small><strong>${escapeHtml(customerRelationshipForProject(p).label)}</strong></div>
      <div><small>FULFILLMENT</small><strong>${escapeHtml(fulfillment)}</strong></div>
      <div><small>SCHEDULING</small><strong>${model.schedulingNeeded?'Needed':'Not currently indicated'}</strong></div>
      <div><small>REQUIRED INPUTS</small><strong>${escapeHtml(inputs)}</strong></div>
      <div><small>VISUAL PROFILE</small><strong>${escapeHtml(model.visualProfile||'none')}</strong></div>
    </div>`;
  }

  const PROJECT_SHELL_TEMPLATES={
    'wood-sign':{id:'wood-sign',name:'Wood Sign',customerShell:'ikes',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true,visualProfile:'flat-surface',previewGeometry:'flat-surface'}},
    'custom-mug':{id:'custom-mug',name:'Custom Mug',customerShell:'mugs',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true,visualProfile:'cylindrical-wrap',previewGeometry:'cylindrical-wrap'}},
    'custom_flowers':{id:'custom_flowers',name:'Flower Shop',customerShell:'flowers',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true,visualProfile:'card-overlay',previewGeometry:'card-overlay'}},
    'custom-product':{id:'custom-product',name:'Custom Product',customerShell:null,graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:false,previewApproval:false,wording:true,styles:false,visualProfile:'none'}}
  };
  const VISUAL_FAMILIES=['input','placement','transform','preview','approval','output'];
  function visualCatalog(){return window.BlackFlagV3Core?.visualCapabilityCatalog||{};}
  function visualPresets(){return window.BlackFlagV3Core?.visualProfilePresets||{};}
  function visualPresentationFor(p){return window.BlackFlagV3Core?.normalizeVisualPresentation?.(p)||p?.visualPresentation||{profile:'none',input:[],placement:['none'],transform:[],preview:['none'],approval:['none'],output:['none']};}
  function visualProfileOptions(selected='none'){return Object.entries(visualPresets()).map(([id,p])=>`<option value="${escapeHtml(id)}" ${id===selected?'selected':''}>${escapeHtml(p.label||id)}</option>`).join('');}
  function visualCapabilityDeck(v){
    const cat=visualCatalog();
    return VISUAL_FAMILIES.map(f=>{
      const items=cat[f]||{};
      return `<section class="visual-cap-family"><div class="visual-cap-family-head"><strong>${escapeHtml(f.toUpperCase())}</strong><span>${Object.keys(items).length} capabilities</span></div><div class="visual-cap-grid">${Object.entries(items).map(([id,meta])=>{const checked=(v[f]||[]).includes(id);const status=meta.status==='available'?'AVAILABLE':'FOUNDATION';return `<label class="visual-cap-option ${checked?'selected':''}"><input type="checkbox" data-visual-family="${escapeHtml(f)}" value="${escapeHtml(id)}" ${checked?'checked':''}><span><b>${escapeHtml(meta.label||id)}</b><small>${escapeHtml(meta.description||'')}</small></span><em class="${meta.status==='available'?'available':'foundation'}">${status}</em></label>`}).join('')}</div></section>`;
    }).join('');
  }
  function collectVisualPresentationFromControls(p){
    const current=visualPresentationFor(p);
    const profile=$('ptVisualProfile')?.value||current.profile||'none';
    const next={...current,profile,enabled:profile!=='none',updatedAt:new Date().toISOString()};
    VISUAL_FAMILIES.forEach(f=>{next[f]=$$(`[data-visual-family="${f}"]:checked`).map(x=>x.value)});
    const built=window.BlackFlagV3Core?.normalizeVisualPresentation?.({...(p||{}),visualPresentation:next});
    return built||next;
  }
  const universalCustomerState={projectId:null,offerId:'',photoData:'',customerName:'',customerPhone:'',customerEmail:'',notes:'',preferredTiming:'',fulfillment:'',receipt:null};
  function universalReceiptKey(p,ctx=universalCustomerContextFor(p)){return `bfUniversalReceipt:${p?.id||'project'}:${ctx?.deploymentId||'private'}`;}
  function readUniversalReceipt(p){try{return JSON.parse(sessionStorage.getItem(universalReceiptKey(p))||'null')}catch(_){return null}}
  function writeUniversalReceipt(p,receipt){try{sessionStorage.setItem(universalReceiptKey(p),JSON.stringify(receipt))}catch(_){} universalCustomerState.receipt=receipt;}
  function clearUniversalReceipt(p){try{sessionStorage.removeItem(universalReceiptKey(p))}catch(_){} universalCustomerState.receipt=null;}
  function resetUniversalCustomerState(p){
    const offers=universalOffersFor(p);
    Object.assign(universalCustomerState,{projectId:p?.id||null,offerId:offers[0]?.id||'',photoData:'',customerName:'',customerPhone:'',customerEmail:'',notes:'',preferredTiming:'',fulfillment:'',receipt:readUniversalReceipt(p)});
  }
  function universalCustomerContextFor(p){
    const ctx=window.__deploymentCustomerContext;
    if(ctx && ctx.projectId===p?.id)return ctx;
    return {projectId:p?.id||null,deploymentId:null,state:'private_test',attractTitle:p?.description||'Ready when you are.'};
  }
  function universalCustomerStageLabel(p){
    const ctx=universalCustomerContextFor(p);
    if(ctx.state==='deployed')return 'ACTIVE OUTPOST';
    if(ctx.state==='sea_trial')return 'SEA TRIAL • CUSTOMER TEST';
    return 'PRIVATE PROJECT TEST';
  }
  function universalSelectedOffer(p){
    const offers=universalOffersFor(p);
    return offers.find(x=>x.id===universalCustomerState.offerId)||offers[0]||null;
  }
  function universalPriceLabel(offer){
    const price=Number(offer?.price||offer?.basePrice||0);
    return price>0?`$${price.toFixed(2)}`:'PRICE CONFIRMED BY BUSINESS';
  }
  function renderUniversalCustomerShell(p){
    const shell=$('universalCustomerShell'); if(!shell||!p)return;
    if(universalCustomerState.projectId!==p.id)resetUniversalCustomerState(p);
    const offers=universalOffersFor(p);
    const offer=universalSelectedOffer(p);
    const photoRequired=!!p.customerExperience?.photoRequired;
    const contactCapture=p.customerExperience?.contactCapture!==false;
    const ctx=universalCustomerContextFor(p);
    const operating=operatingModelForProject(p);
    const relationship=customerRelationshipForProject(p);
    const detailHeading=relationship.detailHeading||'Tell us what you need';
    const detailPlaceholder=relationship.detailPlaceholder||'Details, preferences, or special instructions';
    const initials=(p.projectCode||p.orderPrefix||p.name||'PRJ').replace(/[^A-Za-z0-9]/g,'').slice(0,3).toUpperCase()||'PRJ';
    const receipt=universalCustomerState.receipt||readUniversalReceipt(p);
    if(receipt){
      universalCustomerState.receipt=receipt;
      const contact=[receipt.customerName,receipt.customerPhone,receipt.customerEmail].filter(Boolean).join(' • ');
      const contextBits=[receipt.fulfillment?`Fulfillment: ${receipt.fulfillment.replaceAll('-',' ')}`:'',receipt.preferredTiming?`Timing: ${receipt.preferredTiming}`:''].filter(Boolean);
      shell.innerHTML=`<header class="universal-shell-header"><div class="universal-mark">${escapeHtml(initials)}</div><div><small>${escapeHtml(universalCustomerStageLabel(p))}</small><h1>${escapeHtml(p.name)}</h1></div>${ctx.deploymentId?'<button type="button" id="universalReturnShipwright" class="secondary-btn universal-return-shipwright">RETURN TO SHIPWRIGHT</button>':''}</header>
      <main class="universal-shell-main"><section class="universal-done-card universal-receipt-card"><div class="universal-done-mark">✓</div><small>${escapeHtml(ctx.state==='sea_trial'?`SEA TRIAL • ${relationship.receiptLabel}`:relationship.receiptLabel)}</small><h2>${escapeHtml(ctx.state==='sea_trial'?'Customer test complete.':relationship.confirmationHeading)}</h2><p class="universal-receipt-next">${escapeHtml(ctx.state==='sea_trial'?'The customer engagement was recorded against this outpost. Return to Shipwright to continue launch.':relationship.nextStep)}</p><div class="universal-receipt-summary"><div><span>REFERENCE</span><strong>${escapeHtml(receipt.id)}</strong></div><div><span>ENGAGEMENT</span><strong>${escapeHtml(relationship.label)}</strong></div><div><span>WHAT THEY SENT</span><strong>${escapeHtml(receipt.offerName||'Request')}</strong></div>${contact?`<div><span>CONTACT</span><strong>${escapeHtml(contact)}</strong></div>`:''}${contextBits.length?`<div><span>DETAILS</span><strong>${escapeHtml(contextBits.join(' • '))}</strong></div>`:''}</div>${ctx.deploymentId?'<button type="button" id="universalDoneReturnShipwright" class="primary-btn">RETURN TO SHIPWRIGHT</button>':'<div class="universal-receipt-actions"><button type="button" id="universalAnotherOrder" class="secondary-btn">START ANOTHER</button></div>'}</section></main>`;
      $('universalAnotherOrder')?.addEventListener('click',()=>{clearUniversalReceipt(p);resetUniversalCustomerState(p);renderUniversalCustomerShell(p)});
      $('universalReturnShipwright')?.addEventListener('click',()=>returnUniversalTestToShipwright(p));
      $('universalDoneReturnShipwright')?.addEventListener('click',()=>returnUniversalTestToShipwright(p));
      return;
    }
    shell.innerHTML=`<header class="universal-shell-header"><div class="universal-mark">${escapeHtml(initials)}</div><div class="universal-brand-copy"><small>${escapeHtml(universalCustomerStageLabel(p))}</small><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.description||'Choose an offer and send your request.')}</p></div>${ctx.deploymentId?'<button type="button" id="universalReturnShipwright" class="secondary-btn universal-return-shipwright">RETURN TO SHIPWRIGHT</button>':''}</header>
      <main class="universal-shell-main">
        ${ctx.state==='sea_trial'?'<div class="universal-trial-banner">SEA TRIAL — Orders created here are test orders until this outpost is activated.</div>':''}
        <section class="universal-order-card">
          <div class="universal-section-head"><small>1 • ${escapeHtml(relationship.type==='purchase'?'OFFER':'ENGAGEMENT')}</small><h2>${escapeHtml(relationship.type==='partnership'?'How can we work together?':'What can we help with?')}</h2></div>
          <div class="universal-offer-grid">${offers.length?offers.map(x=>`<button type="button" class="universal-offer ${offer?.id===x.id?'selected':''}" data-universal-offer="${escapeHtml(x.id)}"><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(universalPriceLabel(x))}</span></button>`).join(''):'<div class="universal-empty"><strong>No customer-ready offers yet.</strong><span>Return to Project Control and make an offer available before testing this vessel.</span></div>'}</div>
        </section>
        ${photoRequired?`<section class="universal-order-card"><div class="universal-section-head"><small>2 • REFERENCE</small><h2>Add the required photo</h2></div><label class="universal-photo-picker"><input id="universalPhotoInput" type="file" accept="image/*" capture="environment"><span>${universalCustomerState.photoData?'CHANGE PHOTO':'TAKE OR CHOOSE PHOTO'}</span></label>${universalCustomerState.photoData?`<img class="universal-photo-preview" src="${universalCustomerState.photoData}" alt="Customer reference photo">`:''}</section>`:''}
        <section class="universal-order-card"><div class="universal-section-head"><small>${photoRequired?'3':'2'} • DETAILS</small><h2>${escapeHtml(detailHeading)}</h2><p>${escapeHtml((window.BlackFlagV3Core?.normalizeBusinessBrief?.(p)?.text||'').slice(0,240))}</p></div><textarea id="universalNotes" class="universal-input" rows="5" maxlength="${Math.max(1000,Number(p.characterLimit||500))}" placeholder="${escapeHtml(detailPlaceholder)}">${escapeHtml(universalCustomerState.notes)}</textarea>${operating.schedulingNeeded?`<label class="universal-adaptive-field">Preferred date / timing<input id="universalPreferredTiming" class="universal-input" value="${escapeHtml(universalCustomerState.preferredTiming)}" placeholder="When would you like this?"></label>`:''}${(operating.fulfillment||[]).length?`<label class="universal-adaptive-field">Fulfillment<select id="universalFulfillment" class="universal-input"><option value="">Choose an option</option>${operating.fulfillment.map(x=>`<option value="${escapeHtml(x)}" ${universalCustomerState.fulfillment===x?'selected':''}>${escapeHtml(x.replaceAll('-',' '))}</option>`).join('')}</select></label>`:''}</section>
        ${contactCapture?`<section class="universal-order-card"><div class="universal-section-head"><small>${photoRequired?'4':'3'} • CONTACT</small><h2>How should we reach you?</h2></div><div class="universal-contact-grid"><label>Name<input id="universalCustomerName" class="universal-input" autocomplete="name" value="${escapeHtml(universalCustomerState.customerName)}"></label><label>Phone<input id="universalCustomerPhone" class="universal-input" type="tel" autocomplete="tel" value="${escapeHtml(universalCustomerState.customerPhone)}"></label><label>Email<input id="universalCustomerEmail" class="universal-input" type="email" autocomplete="email" value="${escapeHtml(universalCustomerState.customerEmail)}"></label></div></section>`:''}
        <section class="universal-review-card"><div><small>READY TO SEND</small><h2>${escapeHtml(offer?.name||'Select an offer')}</h2><p>${escapeHtml(universalPriceLabel(offer))}</p></div><button type="button" id="universalSubmitOrder" class="primary-btn" ${offers.length?'':'disabled'}>${escapeHtml(ctx.state==='sea_trial'?relationship.testActionLabel:relationship.actionLabel)}</button></section>
      </main>`;
    $$('[data-universal-offer]').forEach(btn=>btn.addEventListener('click',()=>{universalCustomerState.offerId=btn.dataset.universalOffer;renderUniversalCustomerShell(p)}));
    $('universalNotes')?.addEventListener('input',e=>universalCustomerState.notes=e.target.value);
    $('universalPreferredTiming')?.addEventListener('input',e=>universalCustomerState.preferredTiming=e.target.value);
    $('universalFulfillment')?.addEventListener('change',e=>universalCustomerState.fulfillment=e.target.value);
    $('universalCustomerName')?.addEventListener('input',e=>universalCustomerState.customerName=e.target.value);
    $('universalCustomerPhone')?.addEventListener('input',e=>universalCustomerState.customerPhone=e.target.value);
    $('universalCustomerEmail')?.addEventListener('input',e=>universalCustomerState.customerEmail=e.target.value);
    $('universalPhotoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{universalCustomerState.photoData=String(r.result||'');renderUniversalCustomerShell(p)};r.readAsDataURL(file)});
    $('universalSubmitOrder')?.addEventListener('click',()=>submitUniversalCustomerOrder(p));
    $('universalReturnShipwright')?.addEventListener('click',()=>returnUniversalTestToShipwright(p));
  }
  async function returnUniversalTestToShipwright(p){
    const ctx=universalCustomerContextFor(p);
    if(!ctx.deploymentId)return;
    window.__deploymentCustomerContext=null;
    hideAllCustomerShells();
    $('returnToEngineBtn')?.classList.add('hidden');
    document.body.classList.remove('project-mode','universal-project');
    document.body.classList.add('engine-mode');
    $('enginePanel')?.classList.remove('hidden');
    activeProjectId=null;
    engineSessionUnlocked=true;
    await openProjectEngineControl(p.id);
    deploymentSelectionByProject.set(p.id,ctx.deploymentId);
    await renderProjectTab(p.id,'deployment');
  }
  async function submitUniversalCustomerOrder(p){
    const offer=universalSelectedOffer(p); if(!offer){alert('Choose an offer first.');return;}
    if(p.customerExperience?.photoRequired && !universalCustomerState.photoData){alert(`Add the required photo before sending this ${activityTermsForProject(p).lowerSingular}.`);return;}
    if(p.customerExperience?.contactCapture!==false && !universalCustomerState.customerName.trim()){alert('Enter your name before sending this order.');return;}
    if(p.customerExperience?.contactCapture!==false && !universalCustomerState.customerPhone.trim() && !universalCustomerState.customerEmail.trim()){alert('Add a phone number or email so the business can reach you.');return;}
    const prefix=(p.orderPrefix||p.projectCode||'ORD').replace(/[^A-Za-z0-9]/g,'').slice(0,8).toUpperCase()||'ORD';
    const now=new Date(), y=String(now.getFullYear()).slice(-2), mo=String(now.getMonth()+1).padStart(2,'0'), day=String(now.getDate()).padStart(2,'0'), suffix=(Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,4)).toUpperCase();
    const id=`${prefix}-${y}${mo}${day}-${suffix}`;
    const ctx=universalCustomerContextFor(p);
    const price=Number(offer.price||offer.basePrice||0);
    const relationship=customerRelationshipForProject(p);
    const order={projectId:p.id,namespace:window.BlackFlagV3Core?.namespaceFor?.(p.id)||p.namespace,isolation:{projectId:p.id,crossProjectAccess:'deny'},schemaVersion:Number(engineConfig.schemaVersion||3),business:{name:p.name,orderPrefix:prefix},id,createdAt:now.toISOString(),updatedAt:now.toISOString(),status:projectWorkflowFor(p)[0]||'New',price,productId:offer.id,productName:offer.name,offerName:offer.name,wording:universalCustomerState.notes.trim(),notes:universalCustomerState.notes.trim(),preferredTiming:universalCustomerState.preferredTiming.trim(),fulfillment:universalCustomerState.fulfillment||'',operatingModel:operatingModelForProject(p).mode,photoData:universalCustomerState.photoData||'',contactPreference:universalCustomerState.customerPhone?'Text':'Email',customerName:universalCustomerState.customerName.trim(),customerPhone:universalCustomerState.customerPhone.trim(),customerEmail:universalCustomerState.customerEmail.trim(),approved:true,testMode:ctx.state!=='deployed',deploymentId:ctx.deploymentId||null,source:'universal_customer_shell',recordType:relationship.type==='purchase'?'order':'engagement',relationshipType:relationship.type,engagementLabel:relationship.label,customerAction:relationship.actionLabel};
    backupOrderLocally(order);captureCustomerFromOrder(order);try{await put(STORE_ORDERS,order)}catch(err){console.warn('Universal order save failed',err);alert(`The ${activityTermsForProject(p).lowerSingular} could not be saved. Please try again.`);return;}
    if(ctx.state==='sea_trial' && ctx.deploymentId){
      const canonicalProject=projectById(p.id);
      const deployment=migrateLegacyDeployment(canonicalProject).find(x=>x.id===ctx.deploymentId);
      if(deployment){
        deployment.lastTestedAt=new Date().toISOString();
        deployment.lastTestOrderId=id;
        deployment.testMode='customer_order';
        deployment.updatedAt=deployment.lastTestedAt;
        try{await saveCompanies();logActivity(p.id,'Sea Trial customer engagement completed',`${deployment.name} • ${relationship.label} • ${id}`);}catch(err){console.warn('Sea Trial engagement metadata sync failed',err);window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId:p.id,category:'deployment',action:'sea_trial.engagement_sync_failed',detail:`${deployment.name} • ${id} • ${err?.message||err}`});}
      }
    }
    const receipt={id,relationshipType:relationship.type,offerName:offer.name,customerName:universalCustomerState.customerName.trim(),customerPhone:universalCustomerState.customerPhone.trim(),customerEmail:universalCustomerState.customerEmail.trim(),fulfillment:universalCustomerState.fulfillment||'',preferredTiming:universalCustomerState.preferredTiming.trim(),submittedAt:new Date().toISOString()};
    writeUniversalReceipt(p,receipt);renderUniversalCustomerShell(p);
  }

  const PROJECT_SHELLS={'ikes-wood-signs':'ikes','mugshot-after-dark':'mugs','beccas-bloom-shop':'flowers'};
  function projectShellFor(p){
    if(!p)return 'generic';
    const explicit=PROJECT_SHELLS[p.id];
    if(explicit)return explicit;
    const shell=(p.shellType||p.projectTheme||p.type||'').toLowerCase();
    if(shell==='ikes'||shell==='wood-sign'||shell==='custom_wood_sign'||shell==='wood_sign')return 'ikes';
    if(shell==='mugs'||shell==='custom-mug'||shell==='custom_mug'||shell==='mugshot-after-dark')return 'mugs';
    if(shell==='flowers'||shell==='flower-shop'||shell==='custom_flowers'||shell==='flowers-project')return 'flowers';
    // Every commissioned vessel receives the reusable Dark Sky customer shell.
    // Bespoke shells remain enhancements, never a prerequisite for leaving harbor.
    if(p.commissionedAt || p.registry?.source==='commissioning' || p.businessType || (p.products||[]).length)return 'universal';
    return 'generic';
  }
  function universalOffersFor(p){
    return (p?.products||[]).filter(pr=>pr && pr.active!==false && (pr.published===true || pr.active===true));
  }
  function projectCustomerOperatingModelReady(p){
    const shell=projectShellFor(p);
    if(['ikes','mugs','flowers'].includes(shell))return true;
    if(shell==='universal')return universalOffersFor(p).length>0;
    return false;
  }
  function hideAllCustomerShells(){$('customerApp')?.classList.add('hidden');$('mugsCustomerShell')?.classList.add('hidden');$('flowersCustomerShell')?.classList.add('hidden');$('universalCustomerShell')?.classList.add('hidden');}
  function enforceCustomerShellIsolation(shell){
    const legacyHeader=document.querySelector('#app > .brand-header');
    const legacyProgress=document.querySelector('#app > .progress-track');
    const ikeOnly=shell==='ikes';
    legacyHeader?.classList.toggle('hidden',!ikeOnly);
    legacyProgress?.classList.toggle('hidden',!ikeOnly);
    if(!ikeOnly)$('customerApp')?.classList.add('hidden');
  }
  function showCustomerShellForProject(p){
    hideAllCustomerShells();
    document.body.classList.remove('ikes-project','mugs-project','flowers-project','universal-project');
    const shell=projectShellFor(p);
    enforceCustomerShellIsolation(shell);
    if(shell==='ikes') $('customerApp')?.classList.remove('hidden');
    else if(shell==='mugs') $('mugsCustomerShell')?.classList.remove('hidden');
    else if(shell==='flowers') $('flowersCustomerShell')?.classList.remove('hidden');
    else if(shell==='universal'){ $('universalCustomerShell')?.classList.remove('hidden'); document.body.classList.add('universal-project'); renderUniversalCustomerShell(p); }
    else console.warn('No customer shell registered for project',p?.id);
  }


  function applyFlowersIdentity(p){
    const name=p?.branding?.businessName||p?.name||"Becca's Bloom Shop";
    const initial=(name.trim().match(/[A-Za-z0-9]/)?.[0]||'B').toUpperCase();
    if($('flowersHeaderMark')) $('flowersHeaderMark').textContent=initial;
    if($('flowersHeroMark')) $('flowersHeroMark').textContent=initial;
    document.title=name;    if($('flowersDoneBusinessName')) $('flowersDoneBusinessName').textContent=name;
  }

  async function enterProject(id){
    const p=projectById(id);if(!p)return;
    const resolvedShell=projectShellFor(p);
    if(resolvedShell==='generic'){
      alert('This project does not yet have a customer operating model. Add a customer-ready offer in Project Control before testing.');
      return;
    }
    activeProjectId=id;logActivity(id,'Project opened');engineSessionUnlocked=false;
    document.body.classList.remove('boot-locked','engine-mode');$('enginePanel')?.classList.add('hidden');$('blackFlagEntryGate')?.classList.add('hidden');document.body.classList.add('project-mode');$('adminPanel')?.classList.add('hidden');
    showCustomerShellForProject(p);
    await applyProjectAssetSlots(p);
    if(resolvedShell==='ikes'){
      $('returnToEngineBtn')?.classList.remove('hidden');resetRuntimeStateForProject(p);applyProjectTheme(p);await loadFeatureSettings();await loadBusinessConfig();recoverDraft();if($('wordingInput'))$('wordingInput').value=state.wording;updateUi();if(typeof setScreen==='function')setScreen('welcome');
    }else if(resolvedShell==='mugs'){
      $('returnToEngineBtn')?.classList.remove('hidden');document.title='Mugs After Dark';document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='mugshot-after-dark';document.body.classList.remove('ikes-project','flowers-project');document.body.classList.add('mugs-project');resetMugsShell();showMugsScreen('welcome');
    }else if(resolvedShell==='flowers'){
      $('returnToEngineBtn')?.classList.remove('hidden');applyFlowersIdentity(p);document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='flowers';document.body.classList.remove('ikes-project','mugs-project','universal-project');document.body.classList.add('flowers-project');resetFlowersShell();showFlowersScreen('welcome');
    }else if(resolvedShell==='universal'){
      $('returnToEngineBtn')?.classList.remove('hidden');document.title=p.name||'Project';document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='universal';document.body.classList.remove('ikes-project','mugs-project','flowers-project');document.body.classList.add('universal-project');resetUniversalCustomerState(p);renderUniversalCustomerShell(p);
    }
  }

  function normalizeProjectArchitecture(p){
    if(!p)return p;
    p.architecture=p.architecture||{};
    p.architecture.template=p.architecture.template||'custom';
    p.architecture.layout=p.architecture.layout||'showcase';
    p.architecture.modules=p.architecture.modules||{};
    p.architecture.workflow=p.architecture.workflow||{};
    p.architecture.workflow.steps=Array.isArray(p.architecture.workflow.steps)?p.architecture.workflow.steps:[];
    p.architecture.workflow.fields=Array.isArray(p.architecture.workflow.fields)?p.architecture.workflow.fields:[];
    p.architecture.workflow.rules=p.architecture.workflow.rules||{};
    return p;
  }

  function applyProjectPermissions(p){
    normalizeProjectArchitecture(p);
    const pm=p?.permissions||{};
    $('projectOrdersLaunchBtn')?.classList.toggle('hidden',!pm.ordersView);
    $('projectLedgerLaunchBtn')?.classList.toggle('hidden',!pm.ledgerView);
  }



  const BLACK_FLAG_ADMIN_THEMES={
    IKE:{
      header:'#f4d238',headerText:'#176a9f',subText:'#a53631',accent:'#1681c4',
      nav:'#173742',button:'#2d9448',buttonText:'#ffffff',surface:'#f6f7f2',
      all:'#294d5d',decoration:'none'
    },
    MUG:{
      header:'#211e25',headerText:'#f5e5c9',subText:'#d7b46a',accent:'#9b2451',
      nav:'#211e25',button:'#9b2451',buttonText:'#ffffff',surface:'#f5f1f5',
      all:'#3b3440',decoration:'radial-gradient(circle at 82% 30%,rgba(155,36,81,.18),transparent 24%)'
    },
    BBS:{
      header:'#315f3b',headerText:'#fff8e9',subText:'#ef9aad',accent:'#d66f89',
      nav:'#174d2a',button:'#cd6b82',buttonText:'#ffffff',surface:'#fbf8f0',
      all:'#315f3b',
      decoration:'radial-gradient(circle at 76% 28%,rgba(239,154,173,.13) 0 3px,transparent 4px),radial-gradient(circle at 81% 48%,rgba(255,248,233,.09) 0 4px,transparent 5px),linear-gradient(120deg,transparent 64%,rgba(255,248,233,.06) 64% 65%,transparent 65%)'
    }
  };
  function blackFlagAdminThemeFor(p){
    const code=String(p?.projectCode||p?.orderPrefix||'').toUpperCase();
    const fallback=BLACK_FLAG_ADMIN_THEMES[code]||{
      header:p?.branding?.primary||'#173742',
      headerText:'#ffffff',
      subText:p?.branding?.accent||'#d7bd72',
      accent:p?.branding?.accent||'#d7bd72',
      nav:p?.branding?.primary||'#173742',
      button:p?.branding?.accent||'#315f3b',
      buttonText:'#ffffff',
      surface:'#f6f7f3',
      all:'#294d5d',
      decoration:'none'
    };
    // Project-owned configuration wins. Named themes above are only starter defaults,
    // so future projects are not forced into an Ike/Mugs/Flowers workflow or appearance.
    return {...fallback,...(p?.adminTheme||{})};
  }

  function applyProjectBranding(p){
    const b=p?.branding||{};
    const name=b.businessName||p?.name||'Project';
    const primary=b.primary||'#173742';
    const accent=b.accent||'#d7bd72';
    const admin=blackFlagAdminThemeFor(p);

    document.documentElement.style.setProperty('--project-primary',primary);
    document.documentElement.style.setProperty('--project-accent',accent);
    document.documentElement.style.setProperty('--project-admin-header',admin.header);
    document.documentElement.style.setProperty('--project-admin-header-text',admin.headerText);
    document.documentElement.style.setProperty('--project-admin-subtext',admin.subText);
    document.documentElement.style.setProperty('--project-admin-accent',admin.accent);
    document.documentElement.style.setProperty('--project-admin-nav',admin.nav);
    document.documentElement.style.setProperty('--project-admin-button',admin.button);
    document.documentElement.style.setProperty('--project-admin-button-text',admin.buttonText);
    document.documentElement.style.setProperty('--project-admin-surface',admin.surface);
    document.documentElement.style.setProperty('--project-admin-all',admin.all);
    document.documentElement.style.setProperty('--project-admin-decoration',admin.decoration||'none');
    document.documentElement.style.setProperty('--project-code',`"${p?.projectCode||p?.orderPrefix||''}"`);

    if($('adminBrandTitle')) $('adminBrandTitle').textContent=(b.adminLabel||name).toUpperCase();
    if($('adminBrandSubtitle')) $('adminBrandSubtitle').textContent='PROJECT ADMIN';
    $$('[data-project-business-name]').forEach(el=>el.textContent=name);
    $$('[data-project-subtitle]').forEach(el=>el.textContent=b.subtitle||p?.tagline||'');
  }

  function applyProjectTheme(p){
    applyProjectBranding(p);
    applyProjectCustomerExperience(p);
  }

  function restoreBlackFlagTheme(){
    document.body.classList.remove('project-mode','mugs-project','ikes-project','flowers-project');
    document.body.removeAttribute('data-active-project');
    document.body.removeAttribute('data-project-theme');
    document.documentElement.style.removeProperty('--project-primary');
    document.documentElement.style.removeProperty('--project-accent');
    document.documentElement.style.removeProperty('--project-admin-header');
    document.documentElement.style.removeProperty('--project-admin-nav');
    document.documentElement.style.removeProperty('--project-admin-button');
    document.documentElement.style.removeProperty('--project-admin-button-text');
    document.documentElement.style.removeProperty('--project-admin-surface');
    document.documentElement.style.removeProperty('--project-admin-header-text');
    document.documentElement.style.removeProperty('--project-admin-subtext');
    document.documentElement.style.removeProperty('--project-admin-accent');
    document.documentElement.style.removeProperty('--project-admin-all');
    document.documentElement.style.removeProperty('--project-admin-decoration');
    document.documentElement.style.removeProperty('--project-code');
    document.title='Dark Sky — Black Flag Engine';
  }

  function requestEngineFromProject(){
    // Crossing toward Black Flag always locks authorization, but retain the project id
    // only while the login gate is open so CLOSE can safely return to the same project.
    lockEngineSession();
    window.pendingEngineReturnProjectId=activeProjectId||null;
    restoreBlackFlagTheme();

    document.body.classList.remove('engine-mode');
    document.body.classList.add('boot-locked');
    $('returnToEngineBtn')?.classList.add('hidden');
    hideAllCustomerShells();
    $('adminPanel')?.classList.add('hidden');
    $('projectOrdersPanel')?.classList.add('hidden');
    $('projectLedgerPanel')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');

    if(typeof window.requireEngineEntry==='function') window.requireEngineEntry();
    else $('blackFlagEntryGate')?.classList.remove('hidden');
  }

  async function cancelEngineEntryToProject(){
    const id=window.pendingEngineReturnProjectId||activeProjectId;
    window.pendingEngineReturnProjectId=null;
    const p=projectById(id);
    if(!p)return;

    activeProjectId=id;
    document.body.classList.remove('boot-locked','engine-mode');
    document.body.classList.add('project-mode');
    $('enginePanel')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    showCustomerShellForProject(p);
    $('returnToEngineBtn')?.classList.remove('hidden');

    if(projectShellFor(p)==='ikes'){
      applyProjectTheme(p);
      if(typeof setScreen==='function')setScreen(state.current||'welcome');
    }else if(projectShellFor(p)==='mugs'){
      document.title='Mugs After Dark';document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='mugshot-after-dark';document.body.classList.remove('ikes-project','flowers-project');document.body.classList.add('mugs-project');showMugsScreen(mugsState.screen||'welcome');
    }else if(projectShellFor(p)==='flowers'){
      applyFlowersIdentity(p);document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='flowers';document.body.classList.remove('ikes-project','mugs-project');document.body.classList.add('flowers-project');showFlowersScreen(flowersState.screen||'welcome');
    }
  }
  window.cancelEngineEntryToProject=cancelEngineEntryToProject;

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
      if(!requireEngineFleetMutation(c,'project.legacy_control.update'))return;
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
    if(!requireEngineFleetMutation(c,'ai.policy.fleet_update'))return;
    c.ai={mode:$('aiRecognitionMode').value,minConfidence:Math.max(.5,Math.min(.99,Number($('aiConfidenceSetting').value)||.9)),requireScaleReference:$('aiScaleReferenceSetting').checked};
    await saveCompanies();renderCompanyFleet();$('aiSettingsStatus').textContent='AI recognition policy saved for '+c.name+'.';
  }
  async function renderFleetStats(){
    const box=$('fleetStats');if(!box)return;
    const orders=await getMergedOrders();
    const stats=companies.map(c=>{
      const matched=orders.filter(o=>String(o?.projectId||'')===String(c.id));
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
      const workflow=await getSetting(PLATFORM_DEFAULT_WORKFLOW_KEY);
      platformDefaultWorkflow=Array.isArray(workflow?.value)&&workflow.value.length>=2?workflow.value:[...DEFAULT_BUSINESS_CONFIG.orderStatuses];
    }catch(err){
      console.warn('Engine config unavailable; using defaults',err);
      engineConfig={...DEFAULT_ENGINE_CONFIG};
      platformDefaultWorkflow=[...DEFAULT_BUSINESS_CONFIG.orderStatuses];
    }
  }

  async function saveEngineConfig(){
    await setSetting('engineConfig',engineConfig);
  }

  const ENGINE_TELEMETRY_HISTORY_KEY='blackFlagEngineTelemetryHistoryV1';
  const ENGINE_ECONOMICS_KEY='engineEconomicsV1';

  function readEngineTelemetryHistory(){
    try{
      const rows=JSON.parse(localStorage.getItem(ENGINE_TELEMETRY_HISTORY_KEY)||'[]');
      return Array.isArray(rows)?rows:[];
    }catch(_){return []}
  }
  function writeEngineTelemetryHistory(rows){
    localStorage.setItem(ENGINE_TELEMETRY_HISTORY_KEY,JSON.stringify((rows||[]).slice(-120)));
  }
  async function readEngineEconomics(){
    try{
      const row=await getSetting(ENGINE_ECONOMICS_KEY);
      const v=row?.value||{};
      return {
        fixed30:Math.max(0,Number(v.fixed30)||0),
        perOrder:Math.max(0,Number(v.perOrder)||0),
        variablePct:Math.max(0,Math.min(100,Number(v.variablePct)||0))
      };
    }catch(_){return {fixed30:0,perOrder:0,variablePct:0}}
  }
  async function saveEngineEconomics(){
    const economics={
      fixed30:Math.max(0,Number($('engineFixedCost30')?.value)||0),
      perOrder:Math.max(0,Number($('engineCostPerOrder')?.value)||0),
      variablePct:Math.max(0,Math.min(100,Number($('engineVariableCostPct')?.value)||0))
    };
    await setSetting(ENGINE_ECONOMICS_KEY,economics);
    if($('engineEconomicsStatus')) $('engineEconomicsStatus').textContent='Performance model saved.';
    await renderEnginePerformance();
  }

  function engineDayKey(date){
    const d=new Date(date);
    return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);
  }
  function lastNDays(n){
    const rows=[];
    const now=new Date();
    for(let i=n-1;i>=0;i--){
      const d=new Date(now);
      d.setHours(12,0,0,0);
      d.setDate(d.getDate()-i);
      rows.push(d.toISOString().slice(0,10));
    }
    return rows;
  }
  function drawEngineTrend(canvas,values,color,{money=false,emptyLabel='NO DATA'}={}){
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const cssW=Math.max(260,canvas.clientWidth||430);
    const cssH=Math.max(110,canvas.clientHeight||150);
    const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    canvas.width=Math.round(cssW*dpr);
    canvas.height=Math.round(cssH*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const vals=(values||[]).map(v=>Number(v)||0);
    const left=10,right=8,top=10,bottom=22;
    const w=cssW-left-right,h=cssH-top-bottom;
    const max=Math.max(...vals,0);
    const min=Math.min(...vals,0);
    const span=Math.max(1,max-min);

    ctx.strokeStyle='rgba(126,153,164,.14)';
    ctx.lineWidth=1;
    for(let i=0;i<4;i++){
      const y=top+(h*i/3);
      ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+w,y);ctx.stroke();
    }

    if(!vals.length || vals.every(v=>v===0)){
      ctx.fillStyle='rgba(166,184,190,.55)';
      ctx.font='700 11px system-ui';
      ctx.textAlign='center';
      ctx.fillText(emptyLabel,cssW/2,cssH/2);
    }else{
      const pts=vals.map((v,i)=>({
        x:left+(vals.length===1?w/2:(i/(vals.length-1))*w),
        y:top+h-((v-min)/span)*h
      }));
      const grad=ctx.createLinearGradient(0,top,0,top+h);
      grad.addColorStop(0,color+'55'); grad.addColorStop(1,color+'00');
      ctx.beginPath();
      ctx.moveTo(pts[0].x,top+h);
      pts.forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts[pts.length-1].x,top+h);
      ctx.closePath();ctx.fillStyle=grad;ctx.fill();

      ctx.beginPath();
      pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();

      const p=pts[pts.length-1];
      ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    }

    ctx.fillStyle='rgba(165,184,190,.7)';
    ctx.font='10px system-ui';
    ctx.textAlign='left';ctx.fillText('30 DAYS',left,cssH-5);
    ctx.textAlign='right';ctx.fillText('TODAY',left+w,cssH-5);
  }

  async function renderEnginePerformance(){
    const orders=await getMergedOrders();
    const days=lastNDays(30);
    const byDay=new Map(days.map(d=>[d,[]]));
    orders.forEach(o=>{
      const k=engineDayKey(o.createdAt);
      if(byDay.has(k))byDay.get(k).push(o);
    });

    const revenue=days.map(d=>byDay.get(d).reduce((s,o)=>s+(Number(o.price)||0),0));
    const orderCounts=days.map(d=>byDay.get(d).length);
    const economics=await readEngineEconomics();
    const configured=economics.fixed30>0||economics.perOrder>0||economics.variablePct>0;
    const fixedDaily=economics.fixed30/30;
    const costs=revenue.map((r,i)=>configured ? fixedDaily+(orderCounts[i]*economics.perOrder)+(r*economics.variablePct/100) : 0);
    const profit=revenue.map((r,i)=>configured ? r-costs[i] : 0);

    const totalRevenue=revenue.reduce((a,b)=>a+b,0);
    const totalCost=costs.reduce((a,b)=>a+b,0);
    const totalProfit=profit.reduce((a,b)=>a+b,0);

    if($('engineRevenue30')) $('engineRevenue30').textContent=`$${totalRevenue.toLocaleString(undefined,{maximumFractionDigits:0})}`;
    if($('engineProfit30')) $('engineProfit30').textContent=configured?`$${totalProfit.toLocaleString(undefined,{maximumFractionDigits:0})}`:'—';
    if($('engineCost30')) $('engineCost30').textContent=configured?`$${totalCost.toLocaleString(undefined,{maximumFractionDigits:0})}`:'—';
    if($('engineProfitDelta')) $('engineProfitDelta').textContent=configured?'Revenue less configured costs':'Configure operating costs';
    if($('engineCostDelta')) $('engineCostDelta').textContent=configured?'Configured operating model':'Configure cost model';

    let usageMB=0,quotaMB=0;
    try{
      const est=await navigator.storage?.estimate?.();
      usageMB=Number(est?.usage||0)/1024/1024;
      quotaMB=Number(est?.quota||0)/1024/1024;
    }catch(_){}
    if($('engineUsageNow')) $('engineUsageNow').textContent=usageMB?`${usageMB.toFixed(1)} MB`:'—';
    if($('engineUsageDelta')) $('engineUsageDelta').textContent=quotaMB?`${((usageMB/quotaMB)*100).toFixed(2)}% of ${quotaMB.toFixed(0)} MB available`:'Storage used';

    const history=readEngineTelemetryHistory();
    const now=Date.now();
    history.push({at:now,usageMB:Number(usageMB.toFixed(3)),revenue30:Number(totalRevenue.toFixed(2)),cost30:Number(totalCost.toFixed(2)),profit30:Number(totalProfit.toFixed(2))});
    const compact=[];
    history.filter(x=>now-Number(x.at||0)<=45*86400000).forEach(row=>{
      const day=new Date(row.at).toISOString().slice(0,10);
      const existing=compact.find(x=>x.day===day);
      if(existing)Object.assign(existing,row,{day}); else compact.push({...row,day});
    });
    writeEngineTelemetryHistory(compact);

    const usageByDay=new Map(compact.map(x=>[x.day,Number(x.usageMB)||0]));
    const usage=days.map(d=>usageByDay.has(d)?usageByDay.get(d):0);

    const pirateTrend=pirateModeEnabled?'#c92d26':null;
    drawEngineTrend($('engineRevenueTrend'),revenue,pirateTrend||'#2aa7f7',{money:true,emptyLabel:'NO RECORDED REVENUE'});
    drawEngineTrend($('engineProfitTrend'),profit,pirateTrend||'#61d15f',{money:true,emptyLabel:configured?'NO PROFIT DATA':'CONFIGURE COST MODEL'});
    drawEngineTrend($('engineUsageTrend'),usage,pirateTrend||'#b46cf4',{emptyLabel:usageMB?'BUILDING USAGE HISTORY':'NO USAGE DATA'});
    drawEngineTrend($('engineCostTrend'),costs,pirateTrend||'#f3aa22',{money:true,emptyLabel:configured?'NO COST DATA':'CONFIGURE COST MODEL'});
    renderPirateCommandLog();
    window.BlackFlagV3Core?.telemetry?.('engine.performance',{
      revenue30:Number(totalRevenue.toFixed(2)),
      cost30:Number(totalCost.toFixed(2)),
      profit30:Number(totalProfit.toFixed(2)),
      usageMB:Number(usageMB.toFixed(3)),
      orders30:orderCounts.reduce((a,b)=>a+b,0)
    });
  }

  function renderPirateCommandLog(){
    const box=$('pirateLogFeed'); if(!box)return;
    const rows=[];
    try{
      const activity=readActivity();
      const all=projects().flatMap(p=>activity.filter(x=>x.projectId===p.id).map(x=>({...x,projectName:p.name})));
      all.sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
      all.slice(0,3).forEach(x=>{
        const d=new Date(x.at||Date.now());
        rows.push(`<span><b>${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b>${escapeHtml(x.action||'Engine activity')}<i>${escapeHtml(x.projectName||'')}</i></span>`);
      });
    }catch(_){}
    if(!rows.length){
      rows.push('<span><b>NOW</b>Engine systems standing by<i>Black Flag</i></span>');
      rows.push('<span><b>NOW</b>Project boundaries sealed<i>Engine</i></span>');
    }
    box.innerHTML=rows.join('');
  }

  async function refreshEngineDiagnostics(){
    const merged=await getMergedOrders();
    let indexedCount=0;
    try{ indexedCount=(await getAll(STORE_ORDERS)).length; }catch(_){}
    const localCount=readLocalOrders().length;
    const hasDraft=Object.keys(localStorage).some(k=>k.startsWith(DRAFT_KEY+':'));
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
    if($('engineEmailStatus')) $('engineEmailStatus').textContent=LEGACY_IKE_WEB3FORMS_ACCESS_KEY && !LEGACY_IKE_WEB3FORMS_ACCESS_KEY.includes('PASTE_')?'Configured':'Needs Setup';
    if($('engineStorageDetail')) $('engineStorageDetail').textContent=`IndexedDB: ${indexedCount} order(s) • Local backup: ${localCount} order(s) • Merged view: ${merged.length} order(s).`;
    await renderEnginePerformance();
  }



  function renderDarkSkyV4EngineStatus(){
    const host=$('v3ArchitectureStatus'); if(!host||!window.DarkSkyV4)return;
    const st=window.DarkSkyV4.status(companies);
    const flags=st.flags||{};
    host.innerHTML=`<div class="v4-broadside-grid">
      <article class="v4-broadside-card ${st.preflight.ok?'clear':'attention'}"><small>PLATFORM CONTRACT</small><strong>${st.preflight.ok?'SEALED':'REVIEW REQUIRED'}</strong><span>${st.preflight.critical} critical • ${st.preflight.warnings} warning</span></article>
      <article class="v4-broadside-card"><small>RECOVERY VAULT</small><strong>${st.recoveryPoints}</strong><span>fleet recovery point${st.recoveryPoints===1?'':'s'}</span></article>
      <article class="v4-broadside-card"><small>BLACK BOX</small><strong>${flags.black_box?.enabled?'ARMED':'OFF'}</strong><span>${st.diagnostics} diagnostic event${st.diagnostics===1?'':'s'}</span></article>
      <article class="v4-broadside-card"><small>RELEASE RING</small><strong>${escapeHtml(String(st.release.currentRing||'captain').replaceAll('_',' ').toUpperCase())}</strong><span>controlled rollout</span></article>
    </div>
    <div class="v4-contract-strip">${st.contract.map((x,i)=>`<span><b>0${i+1}</b>${escapeHtml(x)}</span>`).join('')}</div>`;
    const badge=$('v3SchemaBadge');if(badge)badge.textContent=`V4 SCHEMA ${st.schema}`;
  }
  window.renderDarkSkyV4EngineStatus=renderDarkSkyV4EngineStatus;

  let engineAppearance='business';
  let pirateModeEnabled=false; // compatibility alias for older Engine code.

  function applyEngineAppearance(mode,{announce=false}={}){
    engineAppearance=mode==='pirate'?'pirate':'business';
    pirateModeEnabled=engineAppearance==='pirate';

    document.body.classList.toggle('dark-flag-pirate-mode',pirateModeEnabled);
    document.body.classList.toggle('business-engine-mode',!pirateModeEnabled);
    document.body.dataset.engineAppearance=engineAppearance;

    if($('blackFlagPirateModeToggle')) $('blackFlagPirateModeToggle').checked=pirateModeEnabled;
    if($('enginePirateModeToggle')) $('enginePirateModeToggle').checked=pirateModeEnabled;

    $$('[data-engine-appearance]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.engineAppearance===engineAppearance);
      btn.setAttribute('aria-pressed',btn.dataset.engineAppearance===engineAppearance?'true':'false');
    });

    const status=$('engineAppearanceStatus');
    if(status){
      status.classList.toggle('pirate',pirateModeEnabled);
      status.innerHTML=pirateModeEnabled
        ? '<span></span><strong>PIRATE MODE</strong><small>Black Flag command presentation • same Engine machinery</small>'
        : '<span></span><strong>BUSINESS MODE</strong><small>Professional Engine Room</small>';
    }

    if($('pirateModeStatus')) $('pirateModeStatus').textContent=pirateModeEnabled
      ? 'Pirate Mode active. Engine logic, permissions, project boundaries and data remain unchanged.'
      : 'Business presentation active. Professional Engine Room controls are unchanged beneath the surface.';

    const kicker=document.querySelector('#blackFlagEntryGate .bf-entry-kicker');
    const sub=document.querySelector('#blackFlagEntryGate .bf-entry-sub');
    const enter=$('blackFlagEntryUnlock');
    if(kicker) kicker.textContent=pirateModeEnabled?'DARK FLAG • ENGINE ACCESS':'ENGINE ACCESS';
    if(sub) sub.textContent=pirateModeEnabled
      ? 'Secure Engine access with the themed presentation.'
      : 'Secure project operations and platform control.';
    if(enter) enter.textContent=pirateModeEnabled?'BOARD ENGINE ROOM →':'ENTER ENGINE ROOM →';

    const engineKicker=document.querySelector('#enginePanel .command-masthead .engine-kicker');
    const engineTitle=document.querySelector('#enginePanel .command-masthead h2');
    const engineSub=document.querySelector('#enginePanel .command-masthead p');
    const coveKicker=document.querySelector('#enginePanel .dark-flag-cove-banner .cove-kicker');
    const coveTitle=document.querySelector('#enginePanel .dark-flag-cove-banner .cove-title');
    const coveMotto=document.querySelector('#enginePanel .dark-flag-cove-banner .cove-motto');
    const modeGraphic=$('engineModeGraphic');
    const modeAccent=$('engineModeAccent');
    const projectsHelp=$('engineProjectsHelp');
    const ordersLabel=$('engineOrdersLabel');
    const recoveryLabel=$('engineRecoveryLabel');
    const storageLabel=$('engineStorageLabel');
    const systemLabel=$('engineSystemLabel');
    const footer=document.querySelector('#enginePanel .pirate-footer');
    if(engineKicker) engineKicker.textContent=pirateModeEnabled?'BLACK FLAG COMMAND':'ENGINE CONTROL';
    if(engineTitle) engineTitle.textContent='Engine Room';
    if(engineSub) engineSub.textContent=pirateModeEnabled
      ? 'Fleet operations and project machinery beneath the Dark Flag.'
      : 'Multi-project operations, configuration, testing, and platform control.';
    if(coveKicker) coveKicker.textContent=pirateModeEnabled?'BLACK FLAG':'PLATFORM OPERATIONS';
    if(coveTitle) coveTitle.textContent=pirateModeEnabled?'COMMAND DECK':'SYSTEM OPERATIONS';
    if(coveMotto) coveMotto.textContent=pirateModeEnabled
      ? 'ONE ENGINE • MANY PROJECTS • SEALED HOLDS'
      : 'MULTI-PROJECT CONTROL • SEALED DATA BOUNDARIES';
    if(modeGraphic){
      modeGraphic.textContent=pirateModeEnabled?'☠':'';
      modeGraphic.hidden=!pirateModeEnabled;
    }
    if(modeAccent){
      modeAccent.textContent=pirateModeEnabled?'✦':'';
      modeAccent.hidden=!pirateModeEnabled;
    }
    if(projectsHelp) projectsHelp.textContent=pirateModeEnabled
      ? 'Open a vessel to command its project systems. Project holds remain sealed from one another.'
      : 'Open a project to manage its controls. Project data remains isolated.';
    if(ordersLabel) ordersLabel.textContent=pirateModeEnabled?'Orders Aboard':'Orders';
    if(recoveryLabel) recoveryLabel.textContent=pirateModeEnabled?'Stranded Draft':'Recovery Status';
    if(storageLabel) storageLabel.textContent=pirateModeEnabled?'Cargo Hold':'Storage';
    if(systemLabel) systemLabel.textContent=pirateModeEnabled?'Signal Flag':'System Status';
    if(footer) footer.textContent=pirateModeEnabled
      ? "BLACK FLAG ENGINE • CAPTAIN AUTHORIZED" // authoritative pirate footer
      : "ENGINE ROOM • AUTHORIZED OPERATIONS ONLY";
    /* legacy pirate footer retired */
    if(false) footer.textContent=pirateModeEnabled
      ? "☠ If ye don't know what a button does, keep yer hook off it."
      : 'ENGINE ROOM • AUTHORIZED OPERATIONS ONLY';

    if(announce && $('pirateModeStatus')){
      $('pirateModeStatus').textContent=pirateModeEnabled
        ? 'Pirate Mode engaged. Presentation changed; Engine authority and data did not.'
        : 'Business Mode engaged. Professional presentation active.';
    }
  }

  function applyPirateMode(enabled,{announce=false}={}){
    applyEngineAppearance(enabled?'pirate':'business',{announce});
  }

  async function loadEngineAppearance(){
    try{
      const explicit=await getSetting('engineAppearance');
      if(explicit?.value==='business'||explicit?.value==='pirate'){
        engineAppearance=explicit.value;
      }else{
        const legacy=await getSetting('darkFlagPirateMode');
        engineAppearance=legacy?.value===true?'pirate':'business';
      }
    }catch(_){
      engineAppearance='business';
    }
    applyEngineAppearance(engineAppearance);
  }

  async function setEngineAppearance(mode){
    applyEngineAppearance(mode,{announce:true});
    try{
      await setSetting('engineAppearance',engineAppearance);
      await setSetting('darkFlagPirateMode',engineAppearance==='pirate'); // backwards compatibility
    }catch(err){ console.warn('Engine appearance could not be saved',err); }
  }

  async function loadPirateMode(){ return loadEngineAppearance(); } // legacy compatibility only

  async function setPirateMode(enabled){
    await setEngineAppearance(enabled?'pirate':'business');
  }


  function maybeShowDarkFlagTreasure(){
    if(!pirateModeEnabled)return;
    // Rare, harmless Engine-only easter egg. Never affects routing, data or security.
    if(Math.random()<0.12){
      const foot=document.querySelector('#blackFlagEntryGate .bf-entry-foot');
      if(!foot)return;
      const normal=foot.textContent;
      const finds=[
        'Treasure found: a clean wake and a steady compass.',
        'A small chest rattles below deck. Nothing mission-critical inside.',
        'Good seamanship detected. The charts remain yours.',
        'Hidden treasure: one less loose line in the Engine.'
      ];
      foot.textContent=finds[Math.floor(Math.random()*finds.length)];
      setTimeout(()=>{ if(foot) foot.textContent=normal; },6500);
    }
  }

  function populateEngineSettings(){
    applyPirateMode(pirateModeEnabled);
    renderProjectCommand();
    renderCompanyCommand();
    renderCompanyFleet();
    if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Dark Sky';
    if($('engineNameDisplay')) $('engineNameDisplay').textContent=engineConfig.engineName||'Dark Sky';
    $('engineIdentityEditView')?.classList.add('hidden');
    $('engineIdentitySavedView')?.classList.remove('hidden');
    if($('engineStatusesSetting')) $('engineStatusesSetting').value=(platformDefaultWorkflow||DEFAULT_BUSINESS_CONFIG.orderStatuses).join(', ');
    readEngineEconomics().then(e=>{
      if($('engineFixedCost30')) $('engineFixedCost30').value=String(e.fixed30||0);
      if($('engineCostPerOrder')) $('engineCostPerOrder').value=String(e.perOrder||0);
      if($('engineVariableCostPct')) $('engineVariableCostPct').value=String(e.variablePct||0);
    });
    renderEnginePerformance();
  }

  async function openEnginePanel(){
    $('adminPanel').classList.add('hidden');
    $('enginePanel').classList.remove('hidden');
    populateEngineSettings();
    await refreshEngineDiagnostics();
    await renderFleetStats();
    await refreshV3CommandSystems();
    window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',category:'session',action:'engine.opened',detail:'v3 command deck'});
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  async function loadFeatureSettings(){
    const p=activeProject();
    state.allowCustomColors=p ? p?.customization?.allowCustomColors!==false : true;
    state.customerConfirmationEmail=p ? !!p?.notifications?.customerConfirmationEmail : false;
  }

  async function saveFeatureSettings(){
    const p=activeProject();
    if(!p) return;
    state.allowCustomColors=!!$('allowCustomColorsToggle')?.checked;
    state.customerConfirmationEmail=!!$('customerEmailToggle')?.checked;
    p.customization=p.customization||{};
    p.notifications=p.notifications||{};
    p.customization.allowCustomColors=state.allowCustomColors;
    p.notifications.customerConfirmationEmail=state.customerConfirmationEmail;
    await saveCompanies();
    if(!state.allowCustomColors && state.fill==='Other') state.fill='Black';
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
    const px=customerExperienceForProject(activeProject());
    $('previewPrice').textContent=activeProjectId==='mugshot-after-dark'
      ? (Number(state.price)>0?`Your $${state.price} ${px.businessName} Mug`:`${px.businessName} • Test Pricing`)
      : `Your $${state.price} ${px.businessName} Sign`;
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
    const build=(label,value,kind='detail')=>`<article class="review-summary-item ${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
    $('orderSummary').innerHTML=`
      <section class="review-summary-head"><div><span>ORDER SUMMARY</span><strong>${escapeHtml(state.wording||'Your sign')}</strong></div><div class="review-summary-price"><span>PRICE</span><strong>$${escapeHtml(state.price)}</strong></div></section>
      <section class="review-summary-group"><h3>Sign details</h3><div class="review-summary-grid">${[
        ['Orientation',state.orientation],['Top marker',state.topSide],['Letter style',state.font],['Letter fill',state.fill]
      ].map(r=>build(r[0],r[1])).join('')}</div></section>
      <section class="review-summary-group"><h3>Contact & pickup</h3><div class="review-summary-grid contact">${[
        ['Name',state.customerName],['Cell',state.customerPhone],['Email',state.customerEmail],['Contact by',state.contactPreference]
      ].map(r=>build(r[0],r[1],'contact')).join('')}</div></section>`;
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


  function projectRequiresPhoto(){
    const p=activeProject();
    return !!p?.customerExperience?.photoRequired;
  }

  function hasConfirmedProjectPhoto(){
    return !!(state.photoData && String(state.photoData).startsWith('data:image/'));
  }

  function canCreateOrderNumber(){
    if(!projectRequiresPhoto()) return true;
    return hasConfirmedProjectPhoto();
  }

  async function saveOrder(){
    if(!canCreateOrderNumber()){
      alert('A confirmed product photo is required before this order can be submitted.');
      return null;
    }

    // Build and verify the approved preview before creating a confirmation/order number.
    const approvedPreviewData=await createApprovedPreview();
    if(projectRequiresPhoto() && !approvedPreviewData){
      alert('The approved photo preview could not be confirmed. Please return to the photo/preview step and try again.');
      return null;
    }

    const id=newOrderId();
    state.approvedPreviewData=approvedPreviewData;
    const order={projectId:activeProjectId,namespace:window.BlackFlagV3Core?.namespaceFor?.(activeProjectId)||`bf.project.${activeProjectId}`,isolation:{projectId:activeProjectId,crossProjectAccess:'deny'},schemaVersion:Number(engineConfig.schemaVersion||3),business:{name:businessConfig.businessName,orderPrefix:businessConfig.orderPrefix},id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'New',price:state.price,photoData:state.photoData,approvedPreviewData,orientation:state.orientation,topSide:state.topSide,wording:state.wording,font:state.font,fill:state.fill,customColor:state.customColor,contactPreference:state.contactPreference,customerName:state.customerName,customerPhone:state.customerPhone,customerEmail:state.customerEmail,approved:true};
    backupOrderLocally(order);
    captureCustomerFromOrder(order);
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


  function projectScopedKey(baseKey,projectId=activeProjectId){
    return `${baseKey}:${projectId||'no-project'}`;
  }
  function projectDraftKey(){return projectScopedKey(DRAFT_KEY);}
  function projectBusinessConfigKey(){return `businessConfig:${activeProjectId||'no-project'}`;}

  function resetRuntimeStateForProject(p){
    const x=customerExperienceForProject(p);
    Object.assign(state,{
      current:'welcome',price:Number(x.defaultPrice||0),photoData:'',orientation:'Horizontal',
      topSide:'Top of photo',wording:x.wordingDefault||'Your Message',font:'B',fill:'Black',
      contactPreference:'Text',customerName:'',customerPhone:'',customerEmail:'',
      currentOrderId:'',currentOrder:null,approvedPreviewData:'',customColor:'#1f6feb'
    });
    if($('wordingInput')) $('wordingInput').value=state.wording;
    ['customerName','customerPhone','customerEmail'].forEach(id=>{if($(id))$(id).value='';});
    if($('approvalCheck')) $('approvalCheck').checked=false;
    state.allowCustomColors=p?.customization?.allowCustomColors!==false;
    state.customerConfirmationEmail=!!p?.notifications?.customerConfirmationEmail;
  }

  function setProjectText(id,text){const el=$(id);if(el&&text!==undefined)el.textContent=text;}

  function applyProjectCustomerExperience(p){
    const x=customerExperienceForProject(p);
    document.title=p.name;
    document.body.dataset.activeProject=p.id;
    document.body.dataset.projectTheme=p.projectTheme||p.id||'custom';
    document.body.classList.toggle('mugs-project',p.id==='mugshot-after-dark');
    document.body.classList.toggle('ikes-project',p.id==='ikes-wood-signs');

    document.querySelectorAll('.brand-title').forEach(el=>el.textContent=String(x.businessName).toUpperCase());
    document.querySelectorAll('.brand-subtitle').forEach(el=>el.textContent=x.subtitle);
    document.querySelectorAll('.brand-kicker').forEach(el=>el.textContent=x.kicker);

    setProjectText('welcomeWordmark',x.businessName);
    setProjectText('welcomeSubtitle',x.subtitle);
    setProjectText('welcomeIntro',x.intro);
    setProjectText('welcomeRibbon',x.ribbon);
    setProjectText('projectStartButton',x.start);
    setProjectText('priceStepTitle',x.priceTitle);
    setProjectText('priceStepCopy',x.priceCopy);
    setProjectText('priceTrustNote',x.priceTrust);
    setProjectText('photoStepBadge',x.photoBadge);
    setProjectText('photoStepTitle',x.photoTitle);
    setProjectText('photoStepCopy',x.photoCopy);
    setProjectText('orientationStepTitle',x.orientationTitle);
    setProjectText('wordingStepTitle',x.wordingTitle);
    setProjectText('fontStepTitle',x.fontTitle);
    setProjectText('fillStepTitle',x.fillTitle);
    setProjectText('customerStepCopy',x.customerCopy);
    setProjectText('doneHeadline',x.doneHeadline);
    setProjectText('doneCopy',x.doneCopy);

    ['projectHeaderCharacter','welcomeCharacter'].forEach(id=>{
      const el=$(id);if(el)el.classList.toggle('project-character-hidden',!!x.hideIke);
    });
    applyProjectPermissions(p);
  }

  async function loadBusinessConfig(){
    const p=activeProject(),x=customerExperienceForProject(p);
    const defaults={
      businessName:x.businessName,orderPrefix:x.orderPrefix,
      thankYouHeadline:p?.id==='ikes-wood-signs'?'THANK YOU FOR CHOOSING IKE!':`THANK YOU FOR CHOOSING ${String(x.businessName).toUpperCase()}!`,
      prices:Array.isArray(x.prices)?x.prices:[0],
      orderStatuses:projectWorkflowFor(p)
    };
    try{
      const s=await getSetting(projectBusinessConfigKey());
      businessConfig={...defaults,...(s?.value||{})};
    }catch(_){businessConfig={...defaults};}
    if(!Array.isArray(businessConfig.prices)||!businessConfig.prices.length) businessConfig.prices=[0];
    renderConfiguredPrices();
    applyBusinessCopy();
  }
  function renderConfiguredPrices(){
    const box=$('priceChoices'); if(!box)return;
    if(!businessConfig.prices.includes(Number(state.price))) state.price=Number(businessConfig.prices[0]);
    box.innerHTML=businessConfig.prices.map(p=>`<button class="choice-btn ${Number(state.price)===Number(p)?'selected':''}" data-price="${Number(p)}">$${Number(p)}</button>`).join('');
    box.querySelectorAll('[data-price]').forEach(b=>b.addEventListener('click',()=>{state.price=Number(b.dataset.price);renderConfiguredPrices();updateUi();}));
  }
  function applyBusinessCopy(){
    const p=activeProject(),x=customerExperienceForProject(p);
    document.querySelectorAll('.brand-title').forEach(e=>e.textContent=String(businessConfig.businessName||x.businessName).toUpperCase());
    const h=document.querySelector('[data-screen="done"] .celebration-kicker');if(h)h.textContent=businessConfig.thankYouHeadline;
    if(p) applyProjectCustomerExperience(p);
  }
  function populateBusinessSettings(){
    if(!$('businessNameSetting'))return;
    $('businessNameSetting').value=businessConfig.businessName;$('orderPrefixSetting').value=businessConfig.orderPrefix;$('thankYouSetting').value=businessConfig.thankYouHeadline;$('priceChoicesSetting').value=businessConfig.prices.join(',');
  }
  async function saveBusinessConfigFromAdmin(){
    const prices=$('priceChoicesSetting').value.split(',').map(v=>Number(v.trim())).filter(v=>Number.isFinite(v)&&v>0);
    const p=activeProject(),x=customerExperienceForProject(p);
    const fallbackPrefix=String(p?.orderPrefix||x.orderPrefix||'PRJ').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'PRJ';
    businessConfig={...businessConfig,businessName:$('businessNameSetting').value.trim()||x.businessName||p?.name||'Project',orderPrefix:($('orderPrefixSetting').value||fallbackPrefix).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||fallbackPrefix,thankYouHeadline:$('thankYouSetting').value.trim()||`THANK YOU FOR CHOOSING ${String(x.businessName||p?.name||'US').toUpperCase()}!`,prices:prices.length?prices:(Array.isArray(x.prices)&&x.prices.length?x.prices:[0])};
    await setSetting(projectBusinessConfigKey(),businessConfig);renderConfiguredPrices();applyBusinessCopy();$('businessSettingsStatus').textContent='Business settings saved.';
  }
  function saveDraft(){if(['welcome','done'].includes(state.current))return;try{localStorage.setItem(projectDraftKey(),JSON.stringify({...state,currentOrder:null,approvedPreviewData:''}));}catch(_){}}
  function clearDraft(){try{localStorage.removeItem(projectDraftKey())}catch(_){}}
  function recoverDraft(){try{const d=JSON.parse(localStorage.getItem(projectDraftKey())||'null');if(d&&screenOrder.includes(d.current)){Object.assign(state,d);return true}}catch(_){}return false}

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

  function projectCustomerConfirmationEnabled(){
    const p=activeProject();
    return !!p?.notifications?.customerConfirmationEmail;
  }

  async function submitOrder(order){
    const status=$('submitStatus');
    const retry=$('retrySubmitBtn');
    retry.classList.add('hidden');
    status.className='submit-status centered sending';
    const p=activeProject();
    const projectName=p?.branding?.businessName||p?.name||businessConfig.businessName||'this project';
    status.textContent=`Sending your order to ${projectName}…`;

    if(String(order?.projectId||'')!==LEGACY_IKE_PROJECT_ID){
      status.className='submit-status centered success';
      status.textContent=`Order saved for ${projectName}. Automatic delivery is not configured for this project.`;
      return true;
    }

    if(!LEGACY_IKE_WEB3FORMS_ACCESS_KEY || LEGACY_IKE_WEB3FORMS_ACCESS_KEY.includes('PASTE_WEB3FORMS')){
      status.className='submit-status centered error-text';
      status.textContent='Order saved on this iPad, but automatic email is not configured yet.';
      retry.classList.remove('hidden');
      return false;
    }

    const payload={
      access_key:LEGACY_IKE_WEB3FORMS_ACCESS_KEY,
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
      if(!response.ok || result.success!==true) throw new Error(result.message||`Submission failed (${response.status})`);
      order.previewAttachmentSent=attachmentSent;
      order.emailSentAt=new Date().toISOString();
      order.emailRecipient=LEGACY_IKE_ORDER_EMAIL;
      backupOrderLocally(order);
      try{ await put(STORE_ORDERS,order); }catch(err){ console.warn('Email status IndexedDB update failed',err); }
      status.className='submit-status centered success';
      status.textContent=`Order received! ${projectName} has your order details. Thank you for your order.`;
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
      status.textContent=`Your order is saved on this iPad, but automatic delivery did not send. Please show this screen to ${projectName} before leaving.`;
      if($('customerEmailStatus')){
        $('customerEmailStatus').classList.add('hidden');
        $('customerEmailStatus').textContent='';
      }
      retry.classList.remove('hidden');
      return false;
    }
  }

  function emailBody(order){
    const p=projectById(order?.projectId)||activeProject();
    const name=p?.branding?.businessName||p?.name||order?.business?.name||'Project';
    return `${name} Order

Order: ${order.id}
Customer: ${order.customerName}
Cell: ${order.customerPhone}
Email: ${order.customerEmail}
Contact preference: ${order.contactPreference}

Wording: ${order.wording}
Price: $${order.price}
Orientation: ${order.orientation||''}
Top: ${order.topSide||''}
Style: ${order.font||''}
Fill: ${order.fill||''}
Status: ${order.status}

The full order and approved media remain stored with this project.`;
  }

  async function prepareEmail(order){
    const p=projectById(order?.projectId)||activeProject();
    const cfg=p ? await loadProjectAdminSettings(p.id) : {};
    const recipients=String(cfg?.email||'').trim() || (p?.id===LEGACY_IKE_PROJECT_ID?LEGACY_IKE_ORDER_EMAIL:'');
    if(!recipients){ alert('No project admin email is configured.'); return; }
    const name=p?.branding?.businessName||p?.name||order?.business?.name||'Project';
    const subject=encodeURIComponent(`${name} ${order.id} - ${order.wording||'Order'}`);
    const body=encodeURIComponent(emailBody(order));
    location.href=`mailto:${encodeURIComponent(recipients).replace(/%2C/g,',')}?subject=${subject}&body=${body}`;
  }

  async function updateOrderStatus(id,status){
    const orders=await getMergedOrders(),o=orders.find(x=>x.id===id&&(!activeProjectId||String(x.projectId||'')===String(activeProjectId)));if(!o)return;
    o.status=status;o.updatedAt=new Date().toISOString();if(status==='Completed'&&!o.completedAt)o.completedAt=o.updatedAt;backupOrderLocally(o);try{await put(STORE_ORDERS,o)}catch(_){}
    if(status==='Completed') postOrderToLedger(o);
    await renderAdmin();
    if(document.body.classList.contains('project-admin-mode')) await renderProjectAdminQuickStats();
  }

  async function renderAdmin(){
    const allOrders=await getMergedOrders();
    const orders=(activeProjectId?projectScopedOrders(allOrders,activeProjectId):allOrders).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const list=$('orderList');
    if(!orders.length){list.innerHTML='<div class="empty">No saved orders yet.</div>';return;}
    list.innerHTML=orders.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-card-head"><div><h3>${escapeHtml(o.id)}</h3><div class="helper">${new Date(o.createdAt).toLocaleString()}</div></div><strong>$${o.price}</strong></div><div class="summary-row"><span>Sign</span><strong>${escapeHtml(o.wording)}</strong></div><div class="summary-row"><span>Customer</span><strong>${escapeHtml(o.customerName)}</strong></div><div class="summary-row"><span>Cell</span><strong>${escapeHtml(o.customerPhone)}</strong></div><div class="summary-row"><span>Email</span><strong>${escapeHtml(o.customerEmail)}</strong></div><div class="summary-row"><span>Letter finish</span><strong>${escapeHtml(o.fill)}${o.fill==='Other'&&o.customColor?` • <span class="color-dot" style="background:${escapeHtml(o.customColor)}"></span> ${escapeHtml(o.customColor.toUpperCase())}`:''}</strong></div>${o.approvedPreviewData?`<div class="admin-preview-label">APPROVED CUSTOMER PREVIEW</div><img src="${o.approvedPreviewData}" alt="Approved sign preview for ${escapeHtml(o.id)}" class="thumb approved-thumb">`:o.photoData?`<img src="${o.photoData}" alt="Wood blank for ${escapeHtml(o.id)}" class="thumb">`:''}<label>Status<select class="status-select" data-status><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='In Production'?'selected':''}>In Production</option><option ${o.status==='Ready'?'selected':''}>Ready</option><option ${o.status==='Picked Up'?'selected':''}>Picked Up</option></select></label><div class="order-status-control"><label>Status</label><select data-order-status="${escapeHtml(o.id)}">${businessConfig.orderStatuses.map(s=>`<option value="${escapeHtml(s)}" ${o.status===s?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div><div class="order-actions"><span class="helper">${o.emailSentAt?'Automatic email sent':'Saved locally'}</span></div></article>`).join('');
    list.querySelectorAll('[data-status]').forEach(sel=>sel.addEventListener('change',async e=>{const card=e.target.closest('[data-id]');const orders=await getMergedOrders();const o=orders.find(x=>x.id===card.dataset.id);if(o){o.status=e.target.value;await put(STORE_ORDERS,o);}}));
  }


  function orderProjectId(o){return String(o?.projectId||'')}
  function formatOrderDateTime(value){
    if(!value) return '—';
    const d=new Date(value);
    return Number.isNaN(d.getTime())?'—':d.toLocaleString();
  }
  function compactOrderDate(value){
    if(!value) return '—';
    const d=new Date(value);
    return Number.isNaN(d.getTime())?'—':d.toLocaleDateString();
  }
  function orderRequestedText(o){
    return String(o?.wording||o?.message||o?.cardMessage||o?.description||'Custom order').trim()||'Custom order';
  }
  function orderStyleSummary(o){
    const bits=[];
    if(o?.font) bits.push(String(o.font));
    if(o?.fill) bits.push(o.fill==='Other'&&o?.customColor?`${o.fill} (${o.customColor})`:String(o.fill));
    if(o?.orientation) bits.push(String(o.orientation));
    if(o?.topSide) bits.push(`Top: ${o.topSide}`);
    return bits.join(' • ')||'—';
  }
  function orderOfferSummary(o,p){
    const bits=[];
    if(o?.business?.name) bits.push(String(o.business.name));
    else if(p?.name) bits.push(String(p.name));
    if(o?.productName) bits.push(String(o.productName));
    if(o?.business?.orderPrefix || p?.orderPrefix) bits.push(`Prefix ${o?.business?.orderPrefix||p?.orderPrefix}`);
    return bits.join(' • ');
  }
  function orderContactSummary(o){
    return [o?.customerName,o?.customerPhone,o?.customerEmail].filter(Boolean).join(' • ')||'—';
  }
  function orderInfoColumns(o,p){
    return [
      ['Created',formatOrderDateTime(o?.createdAt)],
      ['Updated',formatOrderDateTime(o?.updatedAt||o?.createdAt)],
      ['Contact Preference',o?.contactPreference||'—'],
      ['Offer',orderOfferSummary(o,p)||'—'],
      ['Style / Finish',orderStyleSummary(o)],
      ['Status',canonicalOrderStatus(o?.status||'New')]
    ];
  }
  function statusBadge(o){
    if(o.status==='Ready for Pickup') return '<span class="order-check ready-check" title="Ready for Pickup">✓</span>';
    if(o.status==='Completed') return '<span class="order-check completed-check" title="Completed">✓</span>';
    return '';
  }
  function completedAgeDays(o){
    const d=o.completedAt||o.updatedAt||o.createdAt; return (Date.now()-new Date(d).getTime())/86400000;
  }
  function projectOrderCard(o,canUpdate=true){
    const p=projectById(o?.projectId)||activeProject();
    const preview=o.approvedPreviewData||'';
    const status=canonicalOrderStatus(o.status);
    const statusClass=adminStatusClass(status);
    const infoRows=orderInfoColumns(o,p).map(([label,value])=>`<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value||'—'))}</strong></article>`).join('');
    const notes=[
      ['Requested wording',orderRequestedText(o)],
      ['Customer contact',orderContactSummary(o)],
      ['Email / Delivery',o?.emailSentAt?`Automatic delivery sent ${formatOrderDateTime(o.emailSentAt)}`:(o?.customerEmail||'No customer email captured')],
      ['Isolation',`${p?.name||'Project'} • ${o?.projectId||'unscoped'}`]
    ].map(([label,value])=>`<div class="project-order-note-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value||'—'))}</strong></div>`).join('');
    return `<article class="order-card order-card-with-preview ${statusClass}" data-id="${escapeHtml(o.id)}">
      <div class="order-card-layout">
        ${preview?`<button class="project-order-preview admin-preview-open" type="button" data-preview-src="${preview}" aria-label="Open larger approved preview for ${escapeHtml(o.id)}"><div class="project-order-preview-label">APPROVED CUSTOMER PREVIEW</div><img src="${preview}" alt="Approved customer preview for ${escapeHtml(o.id)}"><span class="preview-zoom-mark">＋</span></button>`:''}
        <div class="project-order-details">
          <div class="order-card-head"><div class="order-title-with-check">${statusBadge(o)}<div><h3>${escapeHtml(o.id)}</h3><div class="helper">${formatOrderDateTime(o.createdAt)}</div></div></div><strong>$${Number(o.price||0).toFixed(2)}</strong></div>
          <div class="summary-row"><span>${escapeHtml(activityTermsForProject(p).singular)}</span><strong>${escapeHtml(orderRequestedText(o))}</strong></div>
          <div class="project-order-meta-grid">${infoRows}</div>
          <div class="project-order-notes">${notes}</div>
          ${canUpdate?`<div class="order-status-control ${statusClass}" data-workflow-status="${escapeHtml(statusClass)}"><label class="order-status-label" style="color:${adminStatusColor(status)}">Status</label><select data-order-status="${escapeHtml(o.id)}">${businessConfig.orderStatuses.map(s=>`<option value="${escapeHtml(s)}" ${canonicalOrderStatus(o.status)===canonicalOrderStatus(s)?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div>`:`<span class="admin-status-pill ${statusClass}">${adminStatusLabel(status)}</span>`}
        </div>
      </div>
    </article>`;
  }
  async function renderProjectOrdersView(){
    const p=activeProject(), pm=p?.permissions||{};
    const terms=activityTermsForProject(p);if(!pm.ordersView){$('projectActiveOrders').innerHTML=`<div class="empty">${escapeHtml(terms.plural)} access is disabled in Black Flag.</div>`;$('projectCompletedOrders').innerHTML='';return;}
    const rows=approvedProjectOrders(await getMergedOrders(),p).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    const recent=rows.filter(o=>o.status!=='Completed'||completedAgeDays(o)<=10);
    const archived=rows.filter(o=>o.status==='Completed'&&completedAgeDays(o)>10);
    $('projectActiveOrders').innerHTML=recent.map(o=>projectOrderCard(o,!!pm.ordersUpdate)).join('')||`<div class="empty">No current ${escapeHtml(terms.lowerPlural)}.</div>`;
    $('projectCompletedOrders').innerHTML=archived.map(o=>projectOrderCard(o,false)).join('')||`<div class="empty">No archived completed ${escapeHtml(terms.lowerPlural)}.</div>`;
    document.querySelectorAll('#projectActiveOrders [data-order-status], #projectCompletedOrders [data-order-status]').forEach(s=>s.addEventListener('change',e=>updateOrderStatus(s.dataset.orderStatus,e.target.value)));
  }
  async function renderProjectLedgerView(){
    const p=activeProject(),pm=p?.permissions||{};
    if(!pm.ledgerView){$('projectLedgerView').innerHTML='<div class="empty">Ledger access is disabled in Black Flag.</div>';return;}
    const rows=projectLedger(p.id).slice().reverse();
    $('projectLedgerView').innerHTML=rows.map(x=>{
      const costs=(Number(x.materialCost)||0)+(Number(x.otherDirectCost)||0);
      const profit=(Number(x.revenue)||0)-costs;
      return `<article class="ledger-admin-card" data-ledger-id="${escapeHtml(x.ledgerId)}"><div class="ledger-row"><strong>${escapeHtml(x.orderId)}</strong><span>${new Date(x.completedAt).toLocaleDateString()}</span><span>$${Number(x.revenue||0).toFixed(2)}</span><span>${escapeHtml(x.paymentStatus||'Unknown')}</span></div>
      ${pm.costEntry?`<div class="ledger-cost-grid"><label>Material cost<input data-cost="materialCost" type="number" step=".01" value="${Number(x.materialCost||0)}"></label><label>Other direct cost<input data-cost="otherDirectCost" type="number" step=".01" value="${Number(x.otherDirectCost||0)}"></label><button data-save-ledger="${escapeHtml(x.ledgerId)}" class="secondary-btn small">SAVE COSTS</button></div>`:''}
      ${pm.profitView?`<div class="ledger-profit">Estimated gross profit <strong>$${profit.toFixed(2)}</strong></div>`:''}</article>`;
    }).join('')||'<div class="empty">No completed ledger entries.</div>';
    $('projectLedgerView').querySelectorAll('[data-save-ledger]').forEach(btn=>btn.addEventListener('click',()=>{
      const all=readLedgers(),list=all[p.id]||[],row=list.find(x=>x.ledgerId===btn.dataset.saveLedger);if(!row)return;
      const card=btn.closest('[data-ledger-id]');row.materialCost=Number(card.querySelector('[data-cost="materialCost"]').value)||0;row.otherDirectCost=Number(card.querySelector('[data-cost="otherDirectCost"]').value)||0;
      writeLedgers(all);logActivity(p.id,'Ledger costs updated',row.orderId);renderProjectLedgerView();
    }));
  }

  async function exportBackup(){
    const data={version:2,platform:'Dark Sky / Black Flag',schemaVersion:3,exportedAt:new Date().toISOString(),orders:await getMergedOrders(),settings:await getAll(STORE_SETTINGS)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`dark-sky-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  async function restoreBackup(file){
    const text=await file.text();const data=JSON.parse(text);if(!Array.isArray(data.orders)) throw new Error('Invalid backup');
    for(const raw of data.orders){const o=normalizeOrderIsolation(raw,{legacyImport:!raw?.projectId});await put(STORE_ORDERS,o);}for(const s of (data.settings||[])) await put(STORE_SETTINGS,s);await renderAdmin();
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



  const PROJECT_ADMIN_IDLE_MS=15*60*1000;
  let projectAdminIdleTimer=null;
  let projectAdminActivityBound=false;
  function stopProjectAdminIdleTimer(){
    if(projectAdminIdleTimer){clearTimeout(projectAdminIdleTimer);projectAdminIdleTimer=null;}
  }
  function resetProjectAdminIdleTimer(){
    if(!document.body.classList.contains('project-admin-mode')) return;
    stopProjectAdminIdleTimer();
    projectAdminIdleTimer=setTimeout(()=>{
      if(document.body.classList.contains('project-admin-mode')) returnToCustomerAndLockProtected();
    },PROJECT_ADMIN_IDLE_MS);
  }
  function startProjectAdminIdleTimer(){
    resetProjectAdminIdleTimer();
    if(projectAdminActivityBound) return;
    projectAdminActivityBound=true;
    ['pointerdown','keydown','input','change','touchstart','scroll'].forEach(type=>{
      document.addEventListener(type,()=>{
        if(document.body.classList.contains('project-admin-mode')) resetProjectAdminIdleTimer();
      },{passive:true});
    });
  }

  function returnToCustomerAndLockProtected(){
    stopProjectAdminIdleTimer();
    $('adminPanel')?.classList.add('hidden');
    $('projectOrdersPanel')?.classList.add('hidden');
    $('projectLedgerPanel')?.classList.add('hidden');
    $('pinGate')?.classList.add('hidden');
    $('adminSettings')?.classList.add('hidden');
    $('customerApp')?.classList.remove('hidden');
    document.body.classList.remove('modal-open','project-admin-mode','project-orders-mode','project-ledger-mode');
    document.body.classList.add('project-mode');
    if($('adminPinInput')) $('adminPinInput').value='';
    if($('pinGateError')) $('pinGateError').textContent='';
    window.__pendingProtectedPage=null;
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  async function openProtectedProjectPage(kind){
    const p=activeProject(), pm=p?.permissions||{};
    if(kind==='orders' && !pm.ordersView) return;
    if(kind==='ledger' && !pm.ledgerView) return;
    window.__pendingProtectedPage=kind;
    $('adminPinInput').value='';
    $('pinGateError').textContent='';
    $('pinGate').classList.remove('hidden');
    document.body.classList.add('modal-open');
    setTimeout(()=>{
      if(pinLocked(adminSecurityKey())) showPinLock(adminSecurityKey(),'adminLockTimer','adminPinInput','unlockAdminBtn');
      else $('adminPinInput').focus();
    },50);
  }




  async function renderProjectAdminQuickStats(){
    const p=activeProject();
    const box=$('projectAdminQuickStats');
    if(!p||!box)return;

    const orders=approvedProjectOrders(await getMergedOrders(),p);
    const counts={
      all:orders.length,
      New:orders.filter(o=>o.status==='New').length,
      'In Production':orders.filter(o=>o.status==='In Production').length,
      'Ready for Pickup':orders.filter(o=>o.status==='Ready for Pickup'||o.status==='Ready').length,
      Completed:orders.filter(o=>o.status==='Completed').length
    };

    box.innerHTML=`
      <button class="admin-stat-block stat-all" data-order-filter="all"><span>All Orders</span><strong>${counts.all}</strong></button>
      <button class="admin-stat-block stat-new" data-order-filter="New"><span>New Orders</span><strong>${counts.New}</strong></button>
      <button class="admin-stat-block stat-production" data-order-filter="In Production"><span>In Production</span><strong>${counts['In Production']}</strong></button>
      <button class="admin-stat-block stat-ready" data-order-filter="Ready for Pickup"><span>Ready</span><strong>${counts['Ready for Pickup']}</strong></button>
      <button class="admin-stat-block stat-completed" data-order-filter="Completed"><span>Completed</span><strong>${counts.Completed}</strong></button>
    `;
    $$('#projectAdminQuickStats [data-order-filter]').forEach(btn=>{
      btn.addEventListener('click',()=>setAdminOrderFilter(btn.dataset.orderFilter));
    });
    syncAdminFilterActiveState();
  }


  let adminOrderFilter='all';

  function canonicalOrderStatus(status){
    if(status==='Ready') return 'Ready for Pickup';
    return status||'New';
  }

  function adminStatusLabel(status){
    const s=canonicalOrderStatus(status);
    if(s==='Ready for Pickup') return 'Ready';
    if(s==='New') return 'New Order';
    return s;
  }

  function adminStatusColor(status){
    const s=canonicalOrderStatus(status);
    if(s==='New') return '#d52220';
    if(s==='In Production') return '#ef6b00';
    if(s==='Ready for Pickup') return '#9a7400';
    if(s==='Completed') return '#159447';
    return '#315f3b';
  }

  function adminStatusClass(status){
    const s=canonicalOrderStatus(status);
    if(s==='New') return 'status-new';
    if(s==='In Production') return 'status-production';
    if(s==='Ready for Pickup') return 'status-ready';
    if(s==='Completed') return 'status-completed';
    return 'status-other';
  }

  function approvedProjectOrders(rows,p){
    const requiresPhoto=!!p?.customerExperience?.photoRequired;
    return (rows||[]).filter(o=>{
      const sameProject=String(o.projectId||'')===String(p.id);
      const approved=o.approved===true;
      // For photo-required projects the generated approved preview is the proof
      // that the required customer photo made it through approval.
      const photoOkay=!requiresPhoto || !!o.approvedPreviewData;
      return sameProject && approved && photoOkay;
    });
  }

  function orderMatchesAdminFilter(o){
    if(adminOrderFilter==='all') return true;
    return canonicalOrderStatus(o.status)===canonicalOrderStatus(adminOrderFilter);
  }

  function adminFilterTitle(){
    if(adminOrderFilter==='all') return 'All Orders';
    if(adminOrderFilter==='New') return 'New Orders';
    if(adminOrderFilter==='In Production') return 'In Production';
    if(adminOrderFilter==='Ready for Pickup') return 'Ready';
    if(adminOrderFilter==='Completed') return 'Completed';
    return 'Orders';
  }

  function syncAdminFilterActiveState(){
    $$('#projectAdminQuickStats [data-order-filter], #adminOrderFilterChips [data-order-filter]').forEach(btn=>{
      btn.classList.toggle('active',canonicalOrderStatus(btn.dataset.orderFilter)===canonicalOrderStatus(adminOrderFilter) || (btn.dataset.orderFilter==='all'&&adminOrderFilter==='all'));
    });
  }

  async function setAdminOrderFilter(filter){
    adminOrderFilter=filter||'all';
    if($('adminOrdersHeading')) $('adminOrdersHeading').textContent=adminFilterTitle();
    await renderAdminOrderOverview();
    syncAdminFilterActiveState();
    // Clicking a top status block always brings the admin back to Orders.
    await showProjectAdminModule('orders');
  }

  function renderAdminOrderFilterChips(counts){
    const box=$('adminOrderFilterChips');
    if(!box)return;
    box.innerHTML=`
      <button class="filter-chip chip-all" data-order-filter="all">All Orders (${counts.all})</button>
      <button class="filter-chip chip-new" data-order-filter="New">New Orders (${counts.New})</button>
      <button class="filter-chip chip-production" data-order-filter="In Production">In Production (${counts['In Production']})</button>
      <button class="filter-chip chip-ready" data-order-filter="Ready for Pickup">Ready (${counts['Ready for Pickup']})</button>
      <button class="filter-chip chip-completed" data-order-filter="Completed">Completed (${counts.Completed})</button>
    `;
    [...box.querySelectorAll('[data-order-filter]')].forEach(btn=>btn.addEventListener('click',()=>setAdminOrderFilter(btn.dataset.orderFilter)));
    syncAdminFilterActiveState();
  }

  function applyProjectAdminMenuPermissions(){
    const p=activeProject(); if(!p)return;
    const pm=p.permissions||{};
    const access={
      orders:pm.ordersView!==false,
      customers:!!p.customerHistory?.adminVisible,
      ledger:!!pm.ledgerView,
      payments:!!p.payments?.enabled,
      options:!!pm.projectOptionsView
    };
    const map={
      orders:'adminOrdersMenuBtn',
      customers:'adminCustomersMenuBtn',
      ledger:'adminLedgerMenuBtn',
      payments:'adminPaymentsMenuBtn',
      options:'adminOptionsMenuBtn'
    };
    Object.entries(map).forEach(([key,id])=>{
      const btn=$(id);if(!btn)return;
      btn.classList.remove('hidden');
      btn.disabled=!access[key];
      btn.classList.toggle('module-disabled',!access[key]);
      btn.setAttribute('aria-disabled',String(!access[key]));
    });
  }

  async function showProjectAdminMenu(){
    await showProjectAdminModule('orders');
  }

  async function showProjectAdminModule(moduleName){
    const p=activeProject(); if(!p)return;
    const pm=p.permissions||{};

    const allowed={
      admin:true,
      orders:pm.ordersView!==false,
      customers:!!p.customerHistory?.adminVisible,
      ledger:!!pm.ledgerView,
      payments:!!p.payments?.enabled,
      options:!!pm.projectOptionsView
    };
    if(!allowed[moduleName]) return;

    $('projectAdminMenu')?.classList.remove('hidden');
    $('projectAdminModuleBar')?.classList.add('hidden');
    $$('.admin-module-panel').forEach(el=>el.classList.add('hidden'));
    $$('#projectAdminMenu [data-admin-module]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminModule===moduleName));

    if(moduleName==='admin'){
      $('adminCoreSettingsModule')?.classList.remove('hidden');
      populateAdminCoreSettings();
    }else if(moduleName==='orders'){
      $('adminOrdersModule')?.classList.remove('hidden');
      await renderAdminOrderOverview();
    }else if(moduleName==='options'){
      $('adminSettings')?.classList.remove('hidden');
      populateBusinessSettings();
    }else if(moduleName==='customers'){
      $('adminCustomerHistory')?.classList.remove('hidden');
      renderProjectAdminCustomerHistory();
    }else if(moduleName==='ledger'){
      stopProjectAdminIdleTimer();
      $('adminPanel')?.classList.add('hidden');
      document.body.classList.remove('project-admin-mode');
      $('projectLedgerPanel')?.classList.remove('hidden');
      document.body.classList.add('project-ledger-mode');
      await renderProjectLedgerView();
      return;
    }else if(moduleName==='payments'){
      $('adminPaymentsModule')?.classList.remove('hidden');
    }
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }


  function adminProjectSettingsKey(projectId){
    return 'projectAdminSettings:'+projectId;
  }

  async function loadProjectAdminSettings(projectId){
    try{
      const row=await getSetting(adminProjectSettingsKey(projectId));
      return row?.value||{};
    }catch(_){ return {}; }
  }

  async function populateAdminCoreSettings(){
    const p=activeProject(); if(!p)return;
    const cfg=await loadProjectAdminSettings(p.id);
    if($('adminContactName')) $('adminContactName').value=cfg.contactName||'';
    if($('adminBusinessPhone')) $('adminBusinessPhone').value=cfg.phone||'';
    if($('adminBusinessEmail')) $('adminBusinessEmail').value=cfg.email||'';
    if($('adminBusinessAddress')) $('adminBusinessAddress').value=cfg.address||'';
    ['adminCurrentPinChange','adminNewPinChange','adminConfirmPinChange'].forEach(id=>{if($(id))$(id).value='';});
    if($('adminCoreSettingsStatus')) $('adminCoreSettingsStatus').textContent='';
  }

  async function saveAdminCoreSettings(){
    const p=activeProject(); if(!p)return;
    const current=$('adminCurrentPinChange')?.value.trim()||'';
    const next=$('adminNewPinChange')?.value.trim()||'';
    const confirmNext=$('adminConfirmPinChange')?.value.trim()||'';

    if(next||confirmNext){
      const expected=String(await getAdminPin());
      if(current!==expected){
        $('adminCoreSettingsStatus').textContent='Current PIN is incorrect.';
        return;
      }
      if(next.length<4 || next!==confirmNext){
        $('adminCoreSettingsStatus').textContent='New PINs must match and be at least 4 digits.';
        return;
      }
      await setAdminPin(next,p.id);
    }

    await putSetting(adminProjectSettingsKey(p.id),{
      contactName:$('adminContactName')?.value.trim()||'',
      phone:$('adminBusinessPhone')?.value.trim()||'',
      email:$('adminBusinessEmail')?.value.trim()||'',
      address:$('adminBusinessAddress')?.value.trim()||''
    });

    ['adminCurrentPinChange','adminNewPinChange','adminConfirmPinChange'].forEach(id=>{if($(id))$(id).value='';});
    $('adminCoreSettingsStatus').textContent='Admin settings saved.';
  }


  async function configureProjectAdminGate(){
    const p=activeProject();
    if(!p)return;
    normalizeProjectCode(p);
    const code=String(p.projectCode||p.orderPrefix||'PRJ').toUpperCase();
    const name=p?.branding?.businessName||p.name||'Project';
    const theme=blackFlagAdminThemeFor(p);
    const assets=await readProjectAssets(p.id);

    document.documentElement.style.setProperty('--gate-header',theme.header||'#173742');
    document.documentElement.style.setProperty('--gate-accent',theme.accent||'#d7bd72');
    document.documentElement.style.setProperty('--gate-button',theme.button||theme.nav||'#173742');
    document.documentElement.style.setProperty('--gate-button-text',theme.buttonText||'#fff');
    document.documentElement.style.setProperty('--gate-focus',theme.accent||theme.button||'#d7bd72');
    document.body.dataset.pinProjectCode=code;

    if($('projectAdminGateCode')) $('projectAdminGateCode').textContent=code;
    if($('projectAdminGateKicker')) $('projectAdminGateKicker').textContent=`${code} • PROJECT ADMIN`;
    if($('pinGateTitle')) $('pinGateTitle').textContent=`${name} Admin Access`;
    if($('projectAdminGatePrompt')) $('projectAdminGatePrompt').textContent=`Enter ${name}'s admin PIN to view this project's orders and settings.`;

    const logo=$('projectAdminGateLogo');
    const mark=$('projectAdminGateMark');
    if(logo){
      let src=assets.projectLogo||'';
      if(!src && code==='IKE') src='assets/ike_character.jpg';
      if(src){
        logo.src=src;
        logo.alt=`${name} admin mark`;
        logo.classList.remove('hidden');
        mark?.classList.add('has-logo');
      }else{
        logo.removeAttribute('src');
        logo.classList.add('hidden');
        mark?.classList.remove('has-logo');
      }
    }
  }

  function clearProjectAdminGateTheme(){
    document.documentElement.style.removeProperty('--gate-header');
    document.documentElement.style.removeProperty('--gate-accent');
    document.documentElement.style.removeProperty('--gate-button');
    document.documentElement.style.removeProperty('--gate-button-text');
    document.documentElement.style.removeProperty('--gate-focus');
    delete document.body.dataset.pinProjectCode;
  }

  function updateProjectAdminBrand(){
    const p=activeProject(); if(!p)return;
    normalizeProjectCode(p);
    applyProjectBranding(p);
    const label=p.branding?.adminLabel||p.name;
    if($('adminBrandTitle')) $('adminBrandTitle').textContent=label.toUpperCase();
    document.body.dataset.adminProjectCode=p.projectCode||'';
  }


  function renderProjectAdminCustomerHistory(){
    const p=activeProject();
    const box=$('adminCustomerHistory');
    if(!p||!box) return;

    const visible=!!p.customerHistory?.adminVisible;
    box.classList.toggle('hidden',!visible);
    if(!visible){box.innerHTML='';return;}

    const directory=readCustomerDirectory();
    const rows=Object.values(directory[p.id]||{}).sort((a,b)=>
      String(b.lastOrderDate||'').localeCompare(String(a.lastOrderDate||''))
    ).slice(0,10);

    box.innerHTML=`<div class="admin-customer-history-head">
      <div><h3>Customers</h3><p class="helper">Recent project customers</p></div>
    </div>
    <div class="admin-customer-history-list">${
      rows.map(c=>`<div class="admin-customer-row">
        <strong>${escapeHtml(c.name||'Customer')}</strong>
        <span>${escapeHtml(c.phone||'')}</span>
        <span>${escapeHtml(c.email||'')}</span>
        <span>${c.orderCount||0} order${c.orderCount===1?'':'s'}</span>
      </div>`).join('') || '<div class="empty">No retained customers yet.</div>'
    }</div>`;
  }

  async function renderAdminOrderOverview(){
    const p=activeProject(); if(!p||!$('adminOrderOverviewList'))return;
    const all=approvedProjectOrders(await getMergedOrders(),p)
      .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    const counts={
      all:all.length,
      New:all.filter(o=>canonicalOrderStatus(o.status)==='New').length,
      'In Production':all.filter(o=>canonicalOrderStatus(o.status)==='In Production').length,
      'Ready for Pickup':all.filter(o=>canonicalOrderStatus(o.status)==='Ready for Pickup').length,
      Completed:all.filter(o=>canonicalOrderStatus(o.status)==='Completed').length
    };
    const rows=all.filter(orderMatchesAdminFilter);
    if($('adminOrdersHeading')) $('adminOrdersHeading').textContent=adminFilterTitle();
    renderAdminOrderFilterChips(counts);
    $('adminOrderOverviewList').innerHTML=
      rows.map(o=>projectOrderCard(o,true)).join('') || `<div class="empty">No ${adminFilterTitle().toLowerCase()}.</div>`;
    $('adminOrderOverviewList').querySelectorAll('[data-order-status]').forEach(s=>{
      s.addEventListener('change',async e=>{
        await updateOrderStatus(s.dataset.orderStatus,e.target.value);
        await renderProjectAdminQuickStats();
        await renderAdminOrderOverview();
      });
    });
  }

  async function showProtectedProjectPage(kind){
    $('customerApp')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');
    $('blackFlagEntryGate')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    $('projectOrdersPanel')?.classList.add('hidden');
    $('projectLedgerPanel')?.classList.add('hidden');
    document.body.classList.remove('project-admin-mode','project-orders-mode','project-ledger-mode');

    if(kind==='settings'){
      $('adminPanel')?.classList.remove('hidden');
      $('adminSettings')?.classList.remove('hidden');
      document.body.classList.add('project-admin-mode');
      updateProjectAdminBrand();
      applyProjectAdminMenuPermissions();
      adminOrderFilter='all';
      await renderProjectAdminQuickStats();
      await showProjectAdminModule('orders');
      startProjectAdminIdleTimer();
    }else if(kind==='orders'){
      $('projectOrdersPanel')?.classList.remove('hidden');
      document.body.classList.add('project-orders-mode');
      await renderProjectOrdersView();
    }else if(kind==='ledger'){
      $('projectLedgerPanel')?.classList.remove('hidden');
      document.body.classList.add('project-ledger-mode');
      await renderProjectLedgerView();
    }
    window.__pendingProtectedPage=null;
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }


  const mugsState={screen:'welcome',photoData:'',message:'',style:'bold',customerName:'',customerPhone:'',customerEmail:'',approvedPreviewData:''};
  const MUGS_SCREEN_ORDER=['welcome','photo','message','preview','customer','review','done'];
  function resetMugsShell(){Object.assign(mugsState,{screen:'welcome',photoData:'',message:'',style:'bold',customerName:'',customerPhone:'',customerEmail:'',approvedPreviewData:''});if($('mugsPhotoInput'))$('mugsPhotoInput').value='';$('mugsPhotoPreviewWrap')?.classList.add('hidden');if($('mugsPhotoNext'))$('mugsPhotoNext').disabled=true;if($('mugsMessage'))$('mugsMessage').value='';if($('mugsCharCount'))$('mugsCharCount').textContent='0';['mugsCustomerName','mugsCustomerPhone','mugsCustomerEmail'].forEach(id=>{if($(id))$(id).value='';});if($('mugsApprovalCheck'))$('mugsApprovalCheck').checked=false;if($('mugsSubmitOrder'))$('mugsSubmitOrder').disabled=true;}
  function showMugsScreen(name){mugsState.screen=name;$$('.mugs-screen').forEach(s=>s.classList.toggle('active',s.dataset.mugsScreen===name));const i=MUGS_SCREEN_ORDER.indexOf(name);if($('mugsProgressBar'))$('mugsProgressBar').style.width=`${Math.max(5,(i+1)/MUGS_SCREEN_ORDER.length*100)}%`;if(name==='preview')renderMugsPreview();if(name==='review')renderMugsReview();window.scrollTo({top:0,left:0,behavior:'instant'});}
  function mugWrapLines(value=''){
    const text=String(value||'Your Message').trim()||'Your Message';
    if(text.length<=18)return [text];
    const words=text.split(/\s+/);let a='',b='';
    words.forEach(word=>{if((a+' '+word).trim().length<=Math.ceil(text.length/2)+3 || !a)a=(a+' '+word).trim();else b=(b+' '+word).trim();});
    return b?[a,b]:[text.slice(0,Math.ceil(text.length/2)),text.slice(Math.ceil(text.length/2))];
  }
  function mugWrapLineMarkup(line){
    const chars=Array.from(line);const half=Math.max(1,(chars.length-1)/2);
    return `<span class="mug-wrap-line">${chars.map((ch,i)=>{const n=(i-half)/half,edge=Math.abs(n),drop=Math.round(edge*edge*8),scale=(1-edge*.32).toFixed(3),turn=(n*5).toFixed(2);return `<span style="--wrap-y:${drop}px;--wrap-scale:${scale};--wrap-turn:${turn}deg">${ch===' '?'&nbsp;':escapeHtml(ch)}</span>`;}).join('')}</span>`;
  }
  function applyMugWrapOverlay(el,text,style){
    if(!el)return;
    el.className=`mugs-preview-text mug-wrap-overlay mugs-style-${style}`;
    el.innerHTML=mugWrapLines(text).map(mugWrapLineMarkup).join('');
  }
  function mugWrapMarkup(text,style){return `<div class="mugs-review-overlay mug-wrap-overlay mugs-style-${escapeHtml(style)}">${mugWrapLines(text).map(mugWrapLineMarkup).join('')}</div>`;}
  function renderMugsPreview(){if($('mugsPreviewImage')&&mugsState.photoData)$('mugsPreviewImage').src=mugsState.photoData;applyMugWrapOverlay($('mugsPreviewText'),mugsState.message||'Your Message',mugsState.style);}
  function renderMugsReview(){const box=$('mugsReviewSummary');if(!box)return;box.innerHTML=`<div class="mugs-review-preview mug-cylinder-preview"><img src="${mugsState.photoData}" alt="Confirmed mug photo">${mugWrapMarkup(mugsState.message||'Your Message',mugsState.style)}<span class="mug-wrap-cue">CYLINDRICAL WRAP PREVIEW</span></div><div class="mugs-review-details"><article><span>Message</span><strong>${escapeHtml(mugsState.message||'')}</strong></article><article><span>Letter style</span><strong>${escapeHtml(mugsState.style||'bold')}</strong></article><article><span>Customer</span><strong>${escapeHtml(mugsState.customerName||'')}</strong></article><article><span>Phone</span><strong>${escapeHtml(mugsState.customerPhone||'')}</strong></article><article><span>Email</span><strong>${escapeHtml(mugsState.customerEmail||'')}</strong></article><article><span>Pricing</span><strong>TEST MODE</strong></article></div>`;}
  function drawMugWrapLine(ctx,line,cx,cy,maxWidth,size,family){
    const chars=Array.from(line);if(!chars.length)return;
    ctx.font=`700 ${size}px ${family}`;
    const widths=chars.map(ch=>ctx.measureText(ch).width),raw=widths.reduce((a,b)=>a+b,0)||1,fit=Math.min(1,maxWidth/raw),scaled=widths.map(w=>w*fit),total=scaled.reduce((a,b)=>a+b,0);
    let x=-total/2;
    chars.forEach((ch,i)=>{const cw=scaled[i],mid=x+cw/2,n=Math.max(-1,Math.min(1,mid/(maxWidth/2))),edge=Math.abs(n),y=cy+(edge*edge*size*.11),sx=.68+.32*Math.cos(edge*Math.PI/2),rot=n*.075;ctx.save();ctx.translate(cx+mid,y);ctx.rotate(rot);ctx.scale(sx,1);ctx.font=`700 ${size}px ${family}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=Math.max(3,size*.075);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.fillStyle='#111';ctx.strokeText(ch,0,0);ctx.fillText(ch,0,0);ctx.restore();x+=cw;});
  }
  async function createMugsApprovedPreview(){if(!mugsState.photoData)return '';return new Promise(resolve=>{const img=new Image();img.onload=()=>{try{const scale=Math.min(1,1600/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height)),w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale)),h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return resolve('');ctx.drawImage(img,0,0,w,h);const lines=mugWrapLines(mugsState.message||'');let size=Math.max(30,Math.min(Math.round(w*.075),Math.round(h*.16)));const family=mugsState.style==='classic'?'Georgia':mugsState.style==='script'?'cursive':'Arial';const maxWidth=w*.58,spacing=size*1.05,startY=h*.5-((lines.length-1)*spacing/2);lines.forEach((line,i)=>drawMugWrapLine(ctx,line,w*.5,startY+i*spacing,maxWidth,size,family));resolve(canvas.toDataURL('image/jpeg',.86));}catch(err){console.warn('Mugs preview failed',err);resolve('');}};img.onerror=()=>resolve('');img.src=mugsState.photoData;});}
  async function submitMugsOrder(){if(activeProjectId!=='mugshot-after-dark')return;if(!mugsState.photoData){alert('A confirmed mug photo is required.');showMugsScreen('photo');return;}if(!mugsState.message.trim()){alert('Enter the mug message.');showMugsScreen('message');return;}if(!mugsState.customerName.trim()||!mugsState.customerPhone.trim()){alert('Name and phone are required.');showMugsScreen('customer');return;}if(!$('mugsApprovalCheck')?.checked)return;const approvedPreviewData=await createMugsApprovedPreview();if(!approvedPreviewData){alert('The approved mug preview could not be confirmed.');showMugsScreen('photo');return;}const d=new Date(),y=String(d.getFullYear()).slice(-2),mo=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'),suffix=(Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,4)).toUpperCase(),id=`MUG-${y}${mo}${day}-${suffix}`;const order={projectId:'mugshot-after-dark',namespace:window.BlackFlagV3Core?.namespaceFor?.('mugshot-after-dark')||'bf.project.mugshot-after-dark',isolation:{projectId:'mugshot-after-dark',crossProjectAccess:'deny'},schemaVersion:Number(engineConfig.schemaVersion||3),business:{name:'Mugs After Dark',orderPrefix:'MUG'},id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'New',price:0,photoData:mugsState.photoData,approvedPreviewData,wording:mugsState.message,font:mugsState.style,fill:'Black',contactPreference:'Text',customerName:mugsState.customerName,customerPhone:mugsState.customerPhone,customerEmail:mugsState.customerEmail,approved:true,testMode:true};backupOrderLocally(order);captureCustomerFromOrder(order);try{await put(STORE_ORDERS,order)}catch(err){console.warn('Mugs order save failed',err);}mugsState.approvedPreviewData=approvedPreviewData;$('mugsDoneOrderId').textContent=id;$('mugsDonePreview').src=approvedPreviewData;showMugsScreen('done');}
  function bindMugsShell(){if(window.__mugsShellBound)return;window.__mugsShellBound=true;$('mugsCustomerShell')?.addEventListener('click',e=>{const n=e.target.closest('[data-mugs-next]');if(n&&!n.disabled){showMugsScreen(n.dataset.mugsNext);return;}const b=e.target.closest('[data-mugs-back]');if(b){showMugsScreen(b.dataset.mugsBack);}});$('mugsPhotoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{mugsState.photoData=String(r.result||'');$('mugsPhotoPreview').src=mugsState.photoData;$('mugsPhotoPreviewWrap').classList.remove('hidden');$('mugsPhotoNext').disabled=!mugsState.photoData;};r.readAsDataURL(file);});$('mugsRetakePhoto')?.addEventListener('click',()=>{mugsState.photoData='';$('mugsPhotoInput').value='';$('mugsPhotoPreviewWrap').classList.add('hidden');$('mugsPhotoNext').disabled=true;$('mugsPhotoInput').click();});$('mugsMessage')?.addEventListener('input',e=>{mugsState.message=e.target.value;$('mugsCharCount').textContent=String(mugsState.message.length);});$('mugsStyle')?.addEventListener('change',e=>mugsState.style=e.target.value);$('mugsCustomerNext')?.addEventListener('click',()=>{mugsState.customerName=$('mugsCustomerName').value.trim();mugsState.customerPhone=$('mugsCustomerPhone').value.trim();mugsState.customerEmail=$('mugsCustomerEmail').value.trim();if(!mugsState.customerName||!mugsState.customerPhone){alert('Name and phone are required.');return;}showMugsScreen('review');});$('mugsApprovalCheck')?.addEventListener('change',e=>$('mugsSubmitOrder').disabled=!e.target.checked);$('mugsSubmitOrder')?.addEventListener('click',submitMugsOrder);$('mugsNewOrder')?.addEventListener('click',()=>{resetMugsShell();showMugsScreen('welcome');});$('mugsAdminBtn')?.addEventListener('click',()=>{$('adminBtn')?.click();});}

  const flowersState={screen:'welcome',photoData:'',message:'',style:'bold',customerName:'',customerPhone:'',customerEmail:'',approvedPreviewData:''};
  const FLOWERS_SCREEN_ORDER=['welcome','photo','message','preview','customer','review','done'];
  function resetFlowersShell(){Object.assign(flowersState,{screen:'welcome',photoData:'',message:'',style:'bold',customerName:'',customerPhone:'',customerEmail:'',approvedPreviewData:''});if($('flowersPhotoInput'))$('flowersPhotoInput').value='';$('flowersPhotoPreviewWrap')?.classList.add('hidden');if($('flowersPhotoNext'))$('flowersPhotoNext').disabled=true;if($('flowersMessage'))$('flowersMessage').value='';if($('flowersCharCount'))$('flowersCharCount').textContent='0';['flowersCustomerName','flowersCustomerPhone','flowersCustomerEmail'].forEach(id=>{if($(id))$(id).value='';});if($('flowersApprovalCheck'))$('flowersApprovalCheck').checked=false;if($('flowersSubmitOrder'))$('flowersSubmitOrder').disabled=true;}
  function showFlowersScreen(name){flowersState.screen=name;$('flowersCustomerShell')?.querySelectorAll('.mugs-screen').forEach(s=>s.classList.toggle('active',s.dataset.flowersScreen===name));const i=FLOWERS_SCREEN_ORDER.indexOf(name);if($('flowersProgressBar'))$('flowersProgressBar').style.width=`${Math.max(5,(i+1)/FLOWERS_SCREEN_ORDER.length*100)}%`;if(name==='preview')renderFlowersPreview();if(name==='review')renderFlowersReview();window.scrollTo({top:0,left:0,behavior:'instant'});}
  function renderFlowersPreview(){if($('flowersPreviewImage')&&flowersState.photoData)$('flowersPreviewImage').src=flowersState.photoData;if($('flowersPreviewText')){$('flowersPreviewText').textContent=flowersState.message||'Your Message';$('flowersPreviewText').className=`mugs-preview-text mugs-style-${flowersState.style}`;}}
  function renderFlowersReview(){const box=$('flowersReviewSummary');if(!box)return;box.innerHTML=`<div class="mugs-review-preview"><img src="${flowersState.photoData}" alt="Confirmed flower arrangement photo"><div class="mugs-review-overlay mugs-style-${escapeHtml(flowersState.style)}">${escapeHtml(flowersState.message||'Your Message')}</div></div><div class="mugs-review-row"><span>Message</span><strong>${escapeHtml(flowersState.message||'')}</strong></div><div class="mugs-review-row"><span>Name</span><strong>${escapeHtml(flowersState.customerName||'')}</strong></div><div class="mugs-review-row"><span>Phone</span><strong>${escapeHtml(flowersState.customerPhone||'')}</strong></div><div class="mugs-review-row"><span>Email</span><strong>${escapeHtml(flowersState.customerEmail||'')}</strong></div><div class="mugs-review-row"><span>Pricing</span><strong>TEST MODE</strong></div>`;}
  async function createFlowersApprovedPreview(){if(!flowersState.photoData)return '';return new Promise(resolve=>{const img=new Image();img.onload=()=>{try{const scale=Math.min(1,1600/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height)),w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale)),h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return resolve('');ctx.drawImage(img,0,0,w,h);const text=flowersState.message||'';let size=Math.max(30,Math.min(Math.round(w*.09),Math.round(h*.22)));const family=flowersState.style==='classic'?'Georgia':flowersState.style==='script'?'cursive':'Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111';while(size>20){ctx.font=`700 ${size}px ${family}`;if(ctx.measureText(text).width<=w*.82)break;size-=2;}ctx.lineWidth=Math.max(3,size*.08);ctx.strokeStyle='rgba(255,255,255,.82)';ctx.strokeText(text,w/2,h/2,w*.82);ctx.fillText(text,w/2,h/2,w*.82);resolve(canvas.toDataURL('image/jpeg',.84));}catch(err){console.warn('Flowers preview failed',err);resolve('');}};img.onerror=()=>resolve('');img.src=flowersState.photoData;});}
  async function submitFlowersOrder(){
    const p=projectById(activeProjectId);
    if(!p || projectShellFor(p)!=='flowers'){
      alert('This flower order is not attached to an active flower project. Return to Black Flag and reopen the project.');
      return;
    }
    if(!flowersState.photoData){alert('A confirmed flower arrangement photo is required.');showFlowersScreen('photo');return;}
    if(!flowersState.message.trim()){alert('Enter the card message.');showFlowersScreen('message');return;}
    if(!flowersState.customerName.trim()||!flowersState.customerPhone.trim()){alert('Name and phone are required.');showFlowersScreen('customer');return;}
    if(!$('flowersApprovalCheck')?.checked)return;

    const approvedPreviewData=await createFlowersApprovedPreview();
    if(!approvedPreviewData){alert('The approved flower preview could not be confirmed.');showFlowersScreen('photo');return;}

    const prefix=String(p.orderPrefix||'FLW').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'FLW';
    const businessName=p?.branding?.businessName||p.name||'Flower Project';
    const d=new Date(),y=String(d.getFullYear()).slice(-2),mo=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    const suffix=(Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,4)).toUpperCase();
    const id=`${prefix}-${y}${mo}${day}-${suffix}`;

    const order={
      projectId:p.id,
      namespace:window.BlackFlagV3Core?.namespaceFor?.(p.id)||`bf.project.${p.id}`,
      isolation:{projectId:p.id,crossProjectAccess:'deny'},
      schemaVersion:Number(engineConfig.schemaVersion||3),
      business:{name:businessName,orderPrefix:prefix},
      id,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      status:'New',
      price:0,
      photoData:flowersState.photoData,
      approvedPreviewData,
      wording:flowersState.message,
      font:flowersState.style,
      fill:'Black',
      contactPreference:'Text',
      customerName:flowersState.customerName,
      customerPhone:flowersState.customerPhone,
      customerEmail:flowersState.customerEmail,
      approved:true,
      testMode:true
    };

    backupOrderLocally(order);
    captureCustomerFromOrder(order);
    try{
      await put(STORE_ORDERS,order);
    }catch(err){
      console.warn('Flowers order save failed',err);
      alert(`The ${activityTermsForProject(p).lowerSingular} could not be saved. Please try again.`);
      return;
    }

    flowersState.approvedPreviewData=approvedPreviewData;
    if($('flowersDoneOrderId'))$('flowersDoneOrderId').textContent=id;
    if($('flowersDonePreview'))$('flowersDonePreview').src=approvedPreviewData;
    showFlowersScreen('done');
  }

  window.addEventListener('pagehide',stopCamera);
  window.addEventListener('beforeunload',stopCamera);


  function drawCaptainBarChart(canvasId, labels, values, prefix=''){
    const canvas=$(canvasId);
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const cssWidth=Math.max(320, canvas.clientWidth || 640);
    const cssHeight=230;
    const ratio=window.devicePixelRatio || 1;
    canvas.width=Math.floor(cssWidth*ratio);
    canvas.height=Math.floor(cssHeight*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,cssWidth,cssHeight);

    const left=44,right=16,top=26,bottom=50;
    const chartW=cssWidth-left-right;
    const chartH=cssHeight-top-bottom;
    const max=Math.max(1,...values);
    const slot=chartW/Math.max(1,labels.length);

    ctx.strokeStyle='#d8d9d3';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(left,top+chartH+.5);
    ctx.lineTo(left+chartW,top+chartH+.5);
    ctx.stroke();

    labels.forEach((label,i)=>{
      const barW=Math.min(64,slot*.54);
      const x=left+i*slot+(slot-barW)/2;
      const barH=(Number(values[i])||0)/max*chartH;
      const y=top+chartH-barH;

      ctx.fillStyle='#244b57';
      ctx.fillRect(x,y,barW,barH);

      ctx.textAlign='center';
      ctx.font='700 12px system-ui';
      ctx.fillStyle='#173742';
      const val=Number(values[i])||0;
      ctx.fillText(prefix+(prefix?Math.round(val):Math.round(val)),x+barW/2,Math.max(12,y-8));

      ctx.font='11px system-ui';
      ctx.fillStyle='#687476';
      ctx.fillText(String(label).slice(0,16),x+barW/2,top+chartH+20);
    });
  }

  async function renderCaptainsLog(){
    const kpis=$('captainsLogKpis');
    if(!kpis) return;

    const allOrders=await getMergedOrders();
    const rows=[];

    for(const p of projects()){
      const projectOrders=allOrders.filter(o=>String(o.projectId||'')===String(p.id));
      const completed=projectOrders.filter(o=>o.status==='Completed').length;
      const revenue=projectOrders.reduce((sum,o)=>sum+(Number(o.price)||0),0);

      const customerKeys={};
      projectOrders.forEach(o=>{
        const key=(o.customerEmail||o.customerPhone||o.customerName||'').trim().toLowerCase();
        if(key) customerKeys[key]=(customerKeys[key]||0)+1;
      });

      rows.push({
        project:p,
        orders:projectOrders.length,
        completed,
        revenue,
        repeatCustomers:Object.values(customerKeys).filter(v=>v>1).length
      });
    }

    const totalOrders=rows.reduce((s,r)=>s+r.orders,0);
    const customerDirectory=readCustomerDirectory();
    const globalCustomerKeys={};
    Object.values(customerDirectory).forEach(projectRows=>{
      Object.entries(projectRows||{}).forEach(([key,row])=>{
        globalCustomerKeys[key]=(globalCustomerKeys[key]||0)+(row.orderCount||0);
      });
    });
    const retainedRepeatCustomers=Object.values(globalCustomerKeys).filter(v=>v>1).length;
    const totalRevenue=rows.reduce((s,r)=>s+r.revenue,0);
    const totalCompleted=rows.reduce((s,r)=>s+r.completed,0);

    const engineCustomerKeys={};
    allOrders.forEach(o=>{
      const key=(o.customerEmail||o.customerPhone||o.customerName||'').trim().toLowerCase();
      if(key) engineCustomerKeys[key]=(engineCustomerKeys[key]||0)+1;
    });
    const repeatAcrossEngine=Object.values(engineCustomerKeys).filter(v=>v>1).length;

    kpis.innerHTML=`
      <div><span>Projects</span><strong>${rows.length}</strong></div>
      <div><span>Orders</span><strong>${totalOrders}</strong></div>
      <div><span>Completed</span><strong>${totalCompleted}</strong></div>
      <div><span>Recorded Revenue</span><strong>$${totalRevenue.toFixed(0)}</strong></div>
      <div><span>Repeat Customers</span><strong>${retainedRepeatCustomers||repeatAcrossEngine}</strong></div>
    `;

    const table=$('captainsProjectTable');
    if(table){
      table.innerHTML=rows.map(r=>`
        <div class="captains-project-row">
          <strong>${escapeHtml(r.project.name)}</strong>
          <span>${r.orders} orders</span>
          <span>${r.completed} completed</span>
          <span>$${r.revenue.toFixed(0)} recorded</span>
          <span>${r.repeatCustomers} repeat</span>
        </div>
      `).join('');
    }

    requestAnimationFrame(()=>{
      drawCaptainBarChart('captainsOrdersChart',rows.map(r=>r.project.name),rows.map(r=>r.orders));
      drawCaptainBarChart('captainsRevenueChart',rows.map(r=>r.project.name),rows.map(r=>r.revenue),'$');
    });
  }

  window.blackFlagCaptainManagementSnapshot = async function(){
    const rows=[];
    const orders=await getMergedOrders();
    for(const p of projects()){
      const stats=await projectStats(p);
      const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
      rows.push({
        id:p.id,
        code:p.projectCode||p.orderPrefix||'PRJ',
        name:p.name,
        status:p.status||'active',
        publishStatus:p.publish?.status||'development',
        visibility:p.visibility||'engine_only',
        platformStatus:platformStatus(p),
        ownerStatus:ensureProjectGovernance(p).ownerAccess.status,
        ownerName:ensureProjectGovernance(p).ownerAccess.ownerName||'',
        ownerEmail:ensureProjectGovernance(p).ownerAccess.ownerEmail||'',
        orders:stats.orders,
        revenueMonth:stats.revenueMonth,
        ledgerRevenue:stats.ledgerRevenue,
        deployments:deployments.map(d=>({id:d.id,name:d.name,state:d.state,profile:d.profile,manifestVersion:d.manifestVersion||1}))
      });
    }
    return {
      projects:rows,
      totalOrders:orders.length,
      generatedAt:new Date().toISOString()
    };
  };

  window.blackFlagCaptainSetPlatformStatus = async function(projectId,nextStatus,reason=''){
    const p=projectById(projectId);
    if(!p) return {ok:false,error:'Project not found'};
    if(!['approved','suspended','relationship_ended'].includes(nextStatus)){
      return {ok:false,error:'Invalid platform relationship status'};
    }
    ensureProjectGovernance(p);
    const previous=p.governance.platformStatus;
    const cleanReason=String(reason||'').trim();
    if(nextStatus!=='approved'&&!cleanReason){
      return {ok:false,error:'Captain reason is required'};
    }

    const event={
      at:new Date().toISOString(),
      previous,
      nextStatus,
      reason:cleanReason,
      by:'captain',
      preservesBusinessRecords:true
    };

    p.governance.platformStatus=nextStatus;
    p.governance.reason=cleanReason;
    p.governance.updatedAt=event.at;
    p.governance.updatedBy='captain';
    p.governance.history.unshift(event);
    p.governance.history=p.governance.history.slice(0,200);

    if(nextStatus!=='approved'){
      // Relationship/platform access decision only:
      // publication and active deployments stop; business-owned records stay.
      p.publish=p.publish||{};
      p.publish.status='development';
      p.visibility='engine_only';
      migrateLegacyDeployment(p).forEach(d=>{
        if(d.state==='deployed'||d.state==='sea_trial') d.state='paused';
        d.updatedAt=event.at;
      });
    }

    await saveCompanies();
    logActivity(
      p.id,
      'Captain business relationship decision',
      `${previous} → ${nextStatus}${cleanReason?' • '+cleanReason:''}`
    );
    window.BlackFlagV3Core?.audit?.({
      actorRole:'captain',projectId:p.id,category:'governance',
      action:'business.relationship.changed',
      detail:`${previous} → ${nextStatus}${cleanReason?' • '+cleanReason:''}`
    });
    await renderProjectCommand();
    return {ok:true,projectId:p.id,previous,nextStatus,event};
  };

  window.blackFlagCaptainRelationshipHistory = function(projectId){
    const p=projectById(projectId);
    if(!p) return [];
    ensureProjectGovernance(p);
    return [...p.governance.history];
  };

  window.renderBlackFlagHome = async function(){
    try{ populateEngineSettings(); }catch(err){ console.warn('populateEngineSettings warning',err); }
    try{ await renderProjectCommand(); }catch(err){ console.warn('renderProjectCommand warning',err); }
    try{ await refreshEngineDiagnostics(); }catch(err){ console.warn('diagnostics warning',err); }
    try{ await renderFleetStats(); }catch(err){ console.warn('fleet stats warning',err); }
    try{ await renderCaptainsLog(); }catch(err){ console.warn("Captain's Log warning",err); }
    try{ await refreshV3CommandSystems(); }catch(err){ console.warn('v3 command systems warning',err); }
  };

  function bindFlowersShell(){if(window.__flowersShellBound)return;window.__flowersShellBound=true;$('flowersCustomerShell')?.addEventListener('click',e=>{const n=e.target.closest('[data-flowers-next]');if(n&&!n.disabled){showFlowersScreen(n.dataset.flowersNext);return;}const b=e.target.closest('[data-flowers-back]');if(b){showFlowersScreen(b.dataset.flowersBack);}});$('flowersPhotoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{flowersState.photoData=String(r.result||'');$('flowersPhotoPreview').src=flowersState.photoData;$('flowersPhotoPreviewWrap').classList.remove('hidden');$('flowersPhotoNext').disabled=!flowersState.photoData;};r.readAsDataURL(file);});$('flowersRetakePhoto')?.addEventListener('click',()=>{flowersState.photoData='';$('flowersPhotoInput').value='';$('flowersPhotoPreviewWrap').classList.add('hidden');$('flowersPhotoNext').disabled=true;$('flowersPhotoInput').click();});$('flowersMessage')?.addEventListener('input',e=>{flowersState.message=e.target.value;$('flowersCharCount').textContent=String(flowersState.message.length);});$('flowersStyle')?.addEventListener('change',e=>flowersState.style=e.target.value);$('flowersCustomerNext')?.addEventListener('click',()=>{flowersState.customerName=$('flowersCustomerName').value.trim();flowersState.customerPhone=$('flowersCustomerPhone').value.trim();flowersState.customerEmail=$('flowersCustomerEmail').value.trim();if(!flowersState.customerName||!flowersState.customerPhone){alert('Name and phone are required.');return;}showFlowersScreen('review');});$('flowersApprovalCheck')?.addEventListener('change',e=>$('flowersSubmitOrder').disabled=!e.target.checked);$('flowersSubmitOrder')?.addEventListener('click',submitFlowersOrder);$('flowersNewOrder')?.addEventListener('click',()=>{resetFlowersShell();showFlowersScreen('welcome');});$('flowersAdminBtn')?.addEventListener('click',()=>{$('adminBtn')?.click();});}

  function bindProjectTemplateShells(){
    // Template-level customer behaviors. These are bound once and are not tied
    // to a particular company/project ID.
    bindMugsShell();
    bindFlowersShell();
  }



  function engineFleetCommandContext(){
    const search=$('engineFleetSearch');
    const host=$('projectCommandCards');
    const filterButtons=Array.from(document.querySelectorAll('[data-engine-fleet-filter]'));
    return {search,host,filterButtons};
  }

  function updateEngineFleetRailState(){
    const {host}=engineFleetCommandContext();
    if(!host)return;
    host.classList.toggle('can-scroll-fleet',host.scrollWidth>host.clientWidth+3);
  }

  function applyEngineFleetFilter(){
    const {search,host,filterButtons}=engineFleetCommandContext();
    if(!search||!host||!filterButtons.length)return;
    const q=String(search.value||'').trim().toLowerCase();
    const mode=filterButtons.find(b=>b.classList.contains('active'))?.dataset.engineFleetFilter||'all';

    Array.from(host.children).forEach(card=>{
      const addCard=card.id==='addProjectCard' || card.classList.contains('add-project-card');
      if(addCard){card.hidden=mode!=='all'||!!q;return;}
      const draftCard=card.classList.contains('commission-draft-card');
      if(draftCard){
        const text=(card.textContent||'').toLowerCase();
        const matchesText=!q||text.includes(q);
        card.hidden=!(matchesText&&(mode==='all'||mode==='private'));
        return;
      }
      const control=card.querySelector('[data-open-project-control]');
      const projectId=control?.dataset.openProjectControl||'';
      const p=projectId?projectById(projectId):null;
      const text=(card.textContent||'').toLowerCase();
      const matchesText=!q || text.includes(q);
      let matchesMode=true;
      if(mode==='active') matchesMode=!!p && (p.publish?.status==='live' || p.status==='active');
      if(mode==='private') matchesMode=!!p && p.publish?.status!=='live';
      if(mode==='future') matchesMode=!!p && p.status==='future';
      card.hidden=!(matchesText&&matchesMode);
    });
    host.scrollLeft=0;
    requestAnimationFrame(updateEngineFleetRailState);
  }

  async function handleProjectPublishToggle(t){
    const p=projectById(t.dataset.projectPublish);if(!p)return;
    if(!requireEngineFleetMutation(p,'project.publishing.quick_update')){t.checked=!t.checked;return;}
    const next=t.checked?'live':'development';
    if(t.checked){
      const launch=projectFleetLaunchState(p);
      if(launch.key!=='fleet_ready'&&launch.key!=='live'){
        t.checked=false;
        alert(`${p.name} is ${launch.label}. Continue Launch will take you to the next required step before publishing.`);
        await continueProjectLaunch(p);return;
      }
      if(launch.key==='fleet_ready'){t.checked=false;await joinProjectFleet(p);return;}
      if(!confirm(`Publish ${p.name}? Customers may be able to access this project.`)){t.checked=false;return;}
    }
    p.publish={status:next};p.visibility=t.checked?'published':'engine_only';p.published=!!t.checked;
    if(!t.checked&&p.lifecycle?.state==='live')p.lifecycle={...p.lifecycle,state:'paused',updatedAt:new Date().toISOString()};
    await saveCompanies();logActivity(p.id,t.checked?'Project published':'Project returned to private service');await renderProjectCommand();
  }

  function bindEngineProjectCommandBus(){
    if(window.__blackFlagEngineProjectCommandBusBound)return;
    window.__blackFlagEngineProjectCommandBusBound=true;

    // v3.9.4 — Project Command is an independent command surface. Filters, rail,
    // project cards and launch controls must remain actionable even if a later
    // migration or optional initializer fails.
    document.addEventListener('click',async event=>{
      const target=event.target?.closest?.('[data-engine-fleet-filter],[data-open-project-control],[data-project-launch],[data-fleet-health-project],#addProjectBtn,#addProjectCard,[data-resume-commissioning],[data-retry-project-registry]');
      if(!target)return;
      event.preventDefault();
      event.stopPropagation();

      if(target.matches('[data-engine-fleet-filter]')){
        document.querySelectorAll('[data-engine-fleet-filter]').forEach(b=>b.classList.toggle('active',b===target));
        applyEngineFleetFilter();return;
      }
      if(target.id==='addProjectBtn'||target.id==='addProjectCard'||target.matches('[data-resume-commissioning]')){openProjectCommissioning();return;}
      if(target.matches('[data-retry-project-registry]')){
        const recovery=commissioningRecoveryCandidate();
        if(!recovery || String(recovery.project.id)!==String(target.dataset.retryProjectRegistry||'')){alert('No matching commissioning recovery record is available.');return;}
        const prior=target.textContent;target.disabled=true;target.textContent='VERIFYING…';
        try{
          const result=await reconcileCommissioningArtifacts({attemptRepair:true,source:'manual-recovery'});
          if(!['commissioned','recovered'].includes(result.status)){
            throw result.error||new Error(`Registry recovery remains ${result.status}.`);
          }
          await renderProjectCommand();
          alert(`${recovery.project.name} is verified in the fleet registry.`);
        }catch(err){
          alert(`Registry recovery did not complete: ${String(err?.message||err)}`);
        }finally{if(document.body.contains(target)){target.disabled=false;target.textContent=prior;}}
        return;
      }

      if(target.matches('[data-fleet-health-project]')){await openProjectEngineControl(target.dataset.fleetHealthProject);return;}
      if(target.matches('[data-open-project-control]')){await openProjectEngineControl(target.dataset.openProjectControl);return;}
      if(target.matches('[data-project-launch]')){
        const p=projectById(target.dataset.projectLaunch);if(!p||target.disabled)return;
        const prior=target.textContent;target.disabled=true;target.dataset.commandBusy='1';
        target.textContent=projectFleetLaunchState(p).key==='fleet_ready'?'JOINING…':'OPENING…';
        try{await continueProjectLaunch(p);}catch(err){console.error('Project launch command failed',err);alert(`Launch command interrupted: ${String(err?.message||err)}`);}finally{if(document.body.contains(target)){target.disabled=false;delete target.dataset.commandBusy;target.textContent=prior;}}
      }
    },true);

    document.addEventListener('input',event=>{
      if(event.target?.id==='engineFleetSearch')applyEngineFleetFilter();
    },true);

    document.addEventListener('change',event=>{
      const target=event.target;
      if(target?.matches?.('[data-project-publish]')){
        event.stopPropagation();
        Promise.resolve(handleProjectPublishToggle(target)).catch(err=>{console.error('Project publish command failed',err);alert(`Publish command interrupted: ${String(err?.message||err)}`);});
      }
    },true);

    document.addEventListener('scroll',event=>{if(event.target?.id==='projectCommandCards')updateEngineFleetRailState();},true);
  }

  function bindEngineFleetCommand(){
    // Compatibility shim: all actionable behavior now lives on the early command bus.
    applyEngineFleetFilter();
    updateEngineFleetRailState();
  }

  function hideCoreSurfacesForOwner(){
    $('blackFlagEntryGate')?.classList.add('hidden');
    $('customerApp')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');
    document.body.classList.add('owner-portal-open');
  }

  async function closeOwnerPortal(){
    const session=ownerSession();
    const lastProjectId=session?.projectId||activeProjectId||'';
    $('ownerPortal')?.classList.add('hidden');
    clearOwnerSession();
    document.body.classList.add('owner-portal-open');
    history.replaceState(null,'',location.pathname+location.search+`#owner-login=${encodeURIComponent(lastProjectId)}`);
    await showOwnerLogin(lastProjectId,'You have been signed out.');
  }

  async function ownerPortalMetrics(p){
    const orders=(await getMergedOrders()).filter(o=>String(o?.projectId||'')===String(p.id));
    const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
    const customers=Object.values(readCustomerDirectory()[p.id]||{});
    return {orders,deployments,customers};
  }

  function ownerProjectOrders(orders,p){
    return projectScopedOrders(orders,p.id);
  }

  async function ownerBusinessConfig(p){
    const defaults=customerExperienceForProject(p);
    try{
      const saved=await getSetting(`businessConfig:${p.id}`);
      const value=saved?.value||{};
      return {
        businessName:value.businessName||defaults.businessName||p.name,
        orderPrefix:value.orderPrefix||p.orderPrefix||p.projectCode||'PRJ',
        thankYouHeadline:value.thankYouHeadline||`THANK YOU FOR CHOOSING ${String(p.name).toUpperCase()}!`,
        prices:Array.isArray(value.prices)&&value.prices.length?value.prices:(Array.isArray(defaults.prices)?defaults.prices:[0]),
        orderStatuses:Array.isArray(value.orderStatuses)&&value.orderStatuses.length?value.orderStatuses:(Array.isArray(p.workflow)?p.workflow:[...platformDefaultWorkflow])
      };
    }catch(_){
      return {businessName:p.name,orderPrefix:p.orderPrefix||'PRJ',thankYouHeadline:`THANK YOU FOR CHOOSING ${String(p.name).toUpperCase()}!`,prices:Array.isArray(defaults.prices)?defaults.prices:[0],orderStatuses:Array.isArray(p.workflow)?p.workflow:[...platformDefaultWorkflow]};
    }
  }

  async function ownerUpdateOrderStatus(p,orderId,status){
    if(!requireOwnerProjectMutation(p,'orders','order.status.update'))return false;
    const orders=await getMergedOrders();
    const o=orders.find(x=>x.id===orderId && projectScopedOrders([x],p.id).length===1);
    if(!o)return false;
    o.status=status;
    o.updatedAt=new Date().toISOString();
    if(status==='Completed'&&!o.completedAt)o.completedAt=o.updatedAt;
    backupOrderLocally(o);
    try{await put(STORE_ORDERS,o)}catch(_){}
    if(status==='Completed')postOrderToLedger(o);
    captureCustomerFromOrder(o);
    logActivity(p.id,'Owner updated order status',`${o.id} → ${status}`);
    return true;
  }

  function ownerModuleShell(title,subtitle,content){
    return `<section class="owner-module-workspace">
      <header class="owner-module-head">
        <div><small>BUSINESS PORTAL</small><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div>
        <button id="ownerModuleBack" class="secondary-btn" type="button">← BACK TO OVERVIEW</button>
      </header>
      <div class="owner-module-body">${content}</div>
    </section>`;
  }

  async function renderOwnerModule(p,moduleKey){
    ensureProjectGovernance(p);
    if(platformStatus(p)!=='approved'){await openOwnerPortal(p.id);return;}
    const session=ownerSession();
    const v3Allowed=window.BlackFlagV3Identity?.ownerCan
      ? window.BlackFlagV3Identity.ownerCan(p,moduleKey,session?.projectId||'')
      : true;
    if(!v3Allowed){alert('This business tool is not currently enabled.');return;}
    const caps=new Set(p.ownerAccess.capabilities||[]);
    if(moduleKey!=='settings' && !caps.has(moduleKey)){alert('This business tool is not currently enabled.');return;}
    const body=$('ownerPortalBody'); if(!body)return;

    const orders=ownerProjectOrders(await getMergedOrders(),p);
    const customers=Object.values(readCustomerDirectory()[p.id]||{});
    const deployments=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');
    const config=await ownerBusinessConfig(p);

    if(moduleKey==='orders'){
      const statuses=Array.isArray(p.workflow)&&p.workflow.length?p.workflow:config.orderStatuses;
      body.innerHTML=ownerModuleShell('Orders','Review customer orders and update their progress.',
        `<div class="owner-order-list">${orders.length?orders.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(o=>`
          <article class="owner-order-card">
            <div class="owner-order-head"><div><small>${escapeHtml(o.id)}</small><h3>${escapeHtml(o.wording||'Custom Order')}</h3></div><strong>$${Number(o.price||0).toFixed(2)}</strong></div>
            <div class="owner-order-grid">
              <span><b>CUSTOMER</b>${escapeHtml(o.customerName||'—')}</span>
              <span><b>PHONE</b>${escapeHtml(o.customerPhone||'—')}</span>
              <span><b>EMAIL</b>${escapeHtml(o.customerEmail||'—')}</span>
              <span><b>ORDERED</b>${escapeHtml(new Date(o.createdAt).toLocaleString())}</span>
            </div>
            <label>Order status<select data-owner-order-status="${escapeHtml(o.id)}">${statuses.map(s=>`<option value="${escapeHtml(s)}" ${canonicalOrderStatus(o.status)===canonicalOrderStatus(s)?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></label>
          </article>`).join(''):'<div class="owner-module-empty"><h3>No orders yet</h3><p>New customer orders will appear here.</p></div>'}</div>`);
    } else if(moduleKey==='customers'){
      body.innerHTML=ownerModuleShell('Customers','Review customer contact information and purchase history.',
        `<div class="owner-customer-list">${customers.length?customers.map(c=>`
          <article class="owner-customer-card"><div><small>CUSTOMER</small><h3>${escapeHtml(c.name||'Customer')}</h3><p>${escapeHtml(c.phone||'')}${c.phone&&c.email?' • ':''}${escapeHtml(c.email||'')}</p></div><div class="owner-customer-stats"><span><b>${Number(c.orderCount||0)}</b> Orders</span><span><b>${escapeHtml(c.lastOrderDate?new Date(c.lastOrderDate).toLocaleDateString():'—')}</b> Last Order</span></div></article>`).join(''):'<div class="owner-module-empty"><h3>No customers yet</h3><p>Customer history will build as orders are placed.</p></div>'}</div>`);
    } else if(moduleKey==='products'){
      body.innerHTML=ownerModuleShell('Products','Add products and choose which products are currently available.',
        `<div class="owner-module-toolbar"><button id="ownerAddProduct" class="primary-btn" type="button">+ ADD PRODUCT</button></div><div class="owner-product-list">${(p.products||[]).map(pr=>`
          <article class="owner-product-row"><div><small>PRODUCT</small><input data-owner-product-name="${escapeHtml(pr.id)}" value="${escapeHtml(pr.name)}"></div><label class="owner-switch"><input data-owner-product-published="${escapeHtml(pr.id)}" type="checkbox" ${pr.published?'checked':''}><span>${pr.published?'AVAILABLE':'HIDDEN'}</span></label><button data-owner-product-save="${escapeHtml(pr.id)}" class="secondary-btn" type="button">SAVE</button></article>`).join('')||'<div class="owner-module-empty"><h3>No products yet</h3><p>Add your first product to begin.</p></div>'}`);
    } else if(moduleKey==='pricing'){
      body.innerHTML=ownerModuleShell('Pricing','Manage the customer price choices used by this business.',
        `<article class="owner-form-card"><label>Price choices <small>Enter amounts separated by commas.</small><input id="ownerPriceChoices" value="${escapeHtml(config.prices.join(', '))}"></label><button id="ownerSavePricing" class="primary-btn" type="button">SAVE PRICING</button><p id="ownerPricingStatus" class="owner-save-status"></p></article>`);
    } else if(moduleKey==='branding'){
      const branding=p.branding||{};
      body.innerHTML=ownerModuleShell('Branding','Manage your business name and customer-facing subtitle.',
        `<article class="owner-form-card"><label>Business name<input id="ownerBrandName" value="${escapeHtml(branding.businessName||p.name)}"></label><label>Customer-facing subtitle<input id="ownerBrandSubtitle" value="${escapeHtml(branding.subtitle||'')}"></label><button id="ownerSaveBranding" class="primary-btn" type="button">SAVE BRANDING</button><p id="ownerBrandingStatus" class="owner-save-status"></p></article>`);
    } else if(moduleKey==='kiosks'||moduleKey==='deployments'){
      const kiosks=moduleKey==='kiosks';
      const list=kiosks?deployments.filter(d=>d.profile==='kiosk_self_service'):deployments;
      body.innerHTML=ownerModuleShell(kiosks?'Kiosks':'Locations & Devices',kiosks?'Create and manage self-service kiosk locations.':'Manage the locations and devices serving your customers.',
        `<div class="owner-module-toolbar"><button id="ownerCreateDeployment" class="primary-btn" type="button">+ ADD ${kiosks?'KIOSK':'LOCATION / DEVICE'}</button></div>
        <div class="owner-device-guidance"><strong>Customer Device Access</strong><span>Devices are authorized only for ${escapeHtml(p.name)} customer service. Engine, Captain, and other-project access are not included.</span></div>
        <div class="owner-deployment-list">${list.length?list.map(d=>{
          const ready=deploymentReadiness(d),device=d.deviceIdentity||{};
          return `<article class="owner-deployment-row owner-device-card">
            <div><small>${escapeHtml((DEPLOYMENT_PROFILES[d.profile]?.label||d.profile).toUpperCase())}</small><h3>${escapeHtml(d.name)}</h3>
            <p>${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)} • Readiness ${ready.score}%</p>
            <div class="owner-device-meta"><span>DEVICE ${escapeHtml(device.deviceId||'PENDING')}</span><span>${device.lastSeen?'LAST SEEN '+escapeHtml(new Date(device.lastSeen).toLocaleString()):'NOT CHECKED IN'}</span><span>${escapeHtml(deviceStatusLabel(d))}</span><span>PROJECT ONLY</span></div></div>
            <div class="owner-device-actions">${['deployed','paused'].includes(d.state)?`<button data-owner-deploy-toggle="${escapeHtml(d.id)}" class="secondary-btn" type="button">${d.state==='paused'?'RESUME':'PAUSE'}</button>`:''}<button data-owner-device-revoke="${escapeHtml(d.id)}" class="secondary-btn danger-soft" type="button">REVOKE DEVICE</button></div>
          </article>`;
        }).join(''):'<div class="owner-module-empty"><h3>None yet</h3><p>Add a customer device when you are ready to serve customers from another location.</p></div>'}</div>`);
    } else if(moduleKey==='staff'){
      const staff=Array.isArray(p.ownerAccess.staff)?p.ownerAccess.staff:[];
      body.innerHTML=ownerModuleShell('Staff','Manage the people who help operate your business.',
        `<div class="owner-module-toolbar"><button id="ownerAddStaff" class="primary-btn" type="button">+ ADD STAFF MEMBER</button></div><div class="owner-staff-list">${staff.length?staff.map(s=>`
          <article class="owner-staff-row"><div><small>${escapeHtml((s.role||'STAFF').toUpperCase())}</small><h3>${escapeHtml(s.name||'Staff Member')}</h3><p>${escapeHtml(s.email||'')}</p></div><button data-owner-staff-remove="${escapeHtml(s.id)}" class="secondary-btn" type="button">REMOVE</button></article>`).join(''):'<div class="owner-module-empty"><h3>No staff added yet</h3><p>Add staff as your business grows.</p></div>'}</div>`);
    } else if(moduleKey==='reporting'){
      const revenue=orders.reduce((s,o)=>s+Number(o.price||0),0);
      const completed=orders.filter(o=>canonicalOrderStatus(o.status)==='Completed').length;
      const recent=orders.filter(o=>Date.now()-new Date(o.createdAt).getTime()<=30*86400000);
      body.innerHTML=ownerModuleShell('Reporting','A simple view of current business activity.',
        `<div class="owner-report-grid"><article><span>TOTAL ORDERS</span><strong>${orders.length}</strong></article><article><span>RECORDED SALES</span><strong>$${revenue.toFixed(2)}</strong></article><article><span>COMPLETED</span><strong>${completed}</strong></article><article><span>LAST 30 DAYS</span><strong>${recent.length}</strong></article><article><span>CUSTOMERS</span><strong>${customers.length}</strong></article><article><span>LOCATIONS / DEVICES</span><strong>${deployments.length}</strong></article></div>`);
    } else if(moduleKey==='notifications'){
      const n=p.notifications||{customerConfirmationEmail:false};
      body.innerHTML=ownerModuleShell('Notifications','Choose the customer notifications currently available for your business.',
        `<article class="owner-form-card"><label class="owner-toggle-row"><span><strong>Customer confirmation email</strong><small>Use the configured confirmation message after an order is placed.</small></span><input id="ownerConfirmationEmail" type="checkbox" ${n.customerConfirmationEmail?'checked':''}></label><button id="ownerSaveNotifications" class="primary-btn" type="button">SAVE NOTIFICATIONS</button><p id="ownerNotificationStatus" class="owner-save-status"></p></article>`);
    } else if(moduleKey==='settings'){
      body.innerHTML=ownerModuleShell('Settings','Manage your Business Portal login.',
        `<article class="owner-form-card owner-settings-card">
          <h3>Change Password</h3>
          <label>Current password<input id="ownerCurrentPassword" type="password" autocomplete="current-password"></label>
          <label>New password<input id="ownerNewPassword" type="password" autocomplete="new-password"></label>
          <label>Confirm new password<input id="ownerConfirmPassword" type="password" autocomplete="new-password"></label>
          <button id="ownerChangePassword" class="primary-btn" type="button">CHANGE PASSWORD</button>
          <p id="ownerSettingsStatus" class="owner-save-status"></p>
          <p class="owner-test-login-note">This build allows the temporary test password 4353. Production accounts will require a valid email and a stronger password.</p>
        </article>`);
    }

    $('ownerModuleBack')?.addEventListener('click',()=>openOwnerPortal(p.id));

    $$('[data-owner-order-status]').forEach(sel=>sel.addEventListener('change',()=>ownerUpdateOrderStatus(p,sel.dataset.ownerOrderStatus,sel.value)));

    $('ownerAddProduct')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'products','product.create'))return;
      const name=prompt('Product name'); if(!name?.trim())return;
      p.products=p.products||[]; p.products.push({id:slugifyProjectName(name)+'-'+Date.now().toString().slice(-5),name:name.trim(),published:false,characterLimit:null});
      await saveCompanies(); logActivity(p.id,'Owner added product',name.trim()); await renderOwnerModule(p,'products');
    });
    $$('[data-owner-product-save]').forEach(btn=>btn.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'products','product.update'))return;
      const pr=(p.products||[]).find(x=>x.id===btn.dataset.ownerProductSave); if(!pr)return;
      const name=document.querySelector(`[data-owner-product-name="${CSS.escape(pr.id)}"]`)?.value?.trim();
      const published=document.querySelector(`[data-owner-product-published="${CSS.escape(pr.id)}"]`)?.checked;
      if(name)pr.name=name; pr.published=!!published; await saveCompanies(); logActivity(p.id,'Owner updated product',pr.name); await renderOwnerModule(p,'products');
    }));
    $('ownerSavePricing')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'pricing','pricing.update'))return;
      const prices=String($('ownerPriceChoices')?.value||'').split(',').map(x=>Number(x.trim())).filter(x=>Number.isFinite(x)&&x>=0);
      if(!prices.length){alert('Enter at least one valid price.');return;}
      const next={...config,prices}; await setSetting(`businessConfig:${p.id}`,next); logActivity(p.id,'Owner updated pricing',prices.join(', '));
      if($('ownerPricingStatus'))$('ownerPricingStatus').textContent='Pricing saved.';
    });
    $('ownerSaveBranding')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'branding','branding.update'))return;
      const name=String($('ownerBrandName')?.value||'').trim(),subtitle=String($('ownerBrandSubtitle')?.value||'').trim();
      if(!name){alert('Business name is required.');return;}
      const priorName=p.name;
      const renamed=await renameProjectDisplayName(p,name,{actorRole:'project_owner',syncBranding:true});
      if(!renamed.ok){alert('Dark Sky could not update the business name.');return;}
      p.branding=p.branding||{}; p.branding.subtitle=subtitle; await saveCompanies();
      if(priorName===name)logActivity(p.id,'Owner updated branding',name);
      if($('ownerBrandingStatus'))$('ownerBrandingStatus').textContent=`Branding saved. Project ID ${p.id} remains unchanged.`;
    });
    $('ownerCreateDeployment')?.addEventListener('click',async()=>{
      const ownerDeploymentCapability=moduleKey==='kiosks'?'kiosks':'deployments';
      if(!requireOwnerProjectMutation(p,ownerDeploymentCapability,'deployment.create'))return;
      const name=prompt(moduleKey==='kiosks'?'Kiosk name':'Location / device name'); if(!name?.trim())return;
      const fresh=newProjectDeployment(p,name.trim(),'kiosk_self_service');
      migrateLegacyDeployment(p).push(fresh); await saveCompanies(); logActivity(p.id,'Owner added location/device',fresh.name); await renderOwnerModule(p,moduleKey);
    });
    $$('[data-owner-deploy-toggle]').forEach(btn=>btn.addEventListener('click',async()=>{
      const ownerDeploymentCapability=moduleKey==='kiosks'?'kiosks':'deployments';
      if(!requireOwnerProjectMutation(p,ownerDeploymentCapability,'deployment.lifecycle.update'))return;
      const d=migrateLegacyDeployment(p).find(x=>x.id===btn.dataset.ownerDeployToggle); if(!d)return;
      const prior=d.state;
      const next=d.state==='paused'?'deployed':'paused';
      if(!window.BlackFlagV3Core?.canTransitionDeployment?.(prior,next)){
        window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId:p.id,category:'authorization',action:'deployment.transition.blocked',detail:`${d.id} • ${prior} → ${next}`});
        alert(`Dark Sky blocked an invalid outpost transition: ${prior} → ${next}.`);
        return;
      }
      d.state=next;
      d.updatedAt=new Date().toISOString();
      normalizeDeploymentIdentity(p,d);
      await saveCompanies();
      logActivity(p.id,'Owner changed deployment state',`${d.name}: ${prior} → ${d.state}`);
      window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId:p.id,category:'deployment',action:'device.state.changed',detail:`${d.id}: ${prior} → ${d.state}`});
      await renderOwnerModule(p,moduleKey);
    }));
    $$('[data-owner-device-revoke]').forEach(btn=>btn.addEventListener('click',async()=>{
      const ownerDeploymentCapability=moduleKey==='kiosks'?'kiosks':'deployments';
      if(!requireOwnerProjectMutation(p,ownerDeploymentCapability,'deployment.revoke'))return;
      const d=migrateLegacyDeployment(p).find(x=>x.id===btn.dataset.ownerDeviceRevoke); if(!d)return;
      if(!confirm(`Revoke customer-device access for ${d.name}? Historical deployment information will remain.`))return;
      if(!window.BlackFlagV3Core?.canTransitionDeployment?.(d.state,'retired')){alert('Dark Sky blocked an invalid deployment retirement transition.');return;}
      d.state='retired'; d.updatedAt=new Date().toISOString();
      normalizeDeploymentIdentity(p,d);
      d.deviceIdentity.revokedAt=d.updatedAt;
      await saveCompanies();
      logActivity(p.id,'Owner revoked customer device',d.name);
      window.BlackFlagV3Core?.audit?.({actorRole:'project_owner',projectId:p.id,category:'deployment',action:'device.revoked',detail:d.id});
      await renderOwnerModule(p,moduleKey);
    }));
    $('ownerAddStaff')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'staff','staff.create'))return;
      const name=prompt('Staff member name'); if(!name?.trim())return;
      const email=prompt('Staff member email (optional)','')||'',role=prompt('Role','Staff')||'Staff';
      p.ownerAccess.staff=p.ownerAccess.staff||[]; p.ownerAccess.staff.push({id:'STF-'+Date.now().toString(36),name:name.trim(),email:email.trim(),role:role.trim()||'Staff'});
      await saveCompanies(); logActivity(p.id,'Owner added staff member',name.trim()); await renderOwnerModule(p,'staff');
    });
    $$('[data-owner-staff-remove]').forEach(btn=>btn.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'staff','staff.remove'))return;
      const member=(p.ownerAccess.staff||[]).find(x=>x.id===btn.dataset.ownerStaffRemove); if(!member)return;
      if(!confirm(`Remove ${member.name} from the staff list?`))return;
      p.ownerAccess.staff=(p.ownerAccess.staff||[]).filter(x=>x.id!==member.id); await saveCompanies(); logActivity(p.id,'Owner removed staff member',member.name); await renderOwnerModule(p,'staff');
    }));
    $('ownerSaveNotifications')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'notifications','notifications.update'))return;
      p.notifications=p.notifications||{}; p.notifications.customerConfirmationEmail=!!$('ownerConfirmationEmail')?.checked;
      await saveCompanies(); logActivity(p.id,'Owner updated notifications',p.notifications.customerConfirmationEmail?'enabled':'disabled');
      if($('ownerNotificationStatus'))$('ownerNotificationStatus').textContent='Notification settings saved.';
    });
    $('ownerChangePassword')?.addEventListener('click',async()=>{
      if(!requireOwnerProjectMutation(p,'','owner.credential.update'))return;
      const current=$('ownerCurrentPassword')?.value||'',next=$('ownerNewPassword')?.value||'',confirmNext=$('ownerConfirmPassword')?.value||'';
      if(!verifyOwnerCredential(p,p.ownerAccess.credential?.login||'',current)){ $('ownerSettingsStatus').textContent='Current password did not match.'; return; }
      if(next!==confirmNext){ $('ownerSettingsStatus').textContent='New passwords do not match.'; return; }
      const testMode=!!p.ownerAccess.credential?.testMode;
      const result=await createOwnerCredential(p,p.ownerAccess.credential.login,next,{testMode});
      if(!result.ok){$('ownerSettingsStatus').textContent=result.error;return;}
      await saveCompanies(); logActivity(p.id,'Owner changed portal password',p.ownerAccess.credential.login); $('ownerSettingsStatus').textContent='Password changed.';
    });
  }

  async function openOwnerPortal(projectId,{preview=false}={}){
    const p=projectById(projectId);
    if(!p)return;
    ensureProjectGovernance(p);
    if(preview && !ownerPreviewReturnState){
      ownerPreviewReturnState={projectId:p.id,tab:'owner'};
    }
    hideCoreSurfacesForOwner();
    $('ownerClaimGate')?.classList.add('hidden');
    $('ownerPortal')?.classList.remove('hidden');

    if($('ownerPortalBusiness')) $('ownerPortalBusiness').textContent=p.name;
    if($('ownerPortalSubtitle')) $('ownerPortalSubtitle').textContent=preview?'PREVIEW MODE':`${p.ownerAccess.ownerName||'Business Owner'} • OWNER`;
    $('ownerPortalPreviewBadge')?.classList.toggle('hidden',!preview);
    $('ownerPortalClosePreview')?.classList.toggle('hidden',!preview);
    $('ownerPortalSignOut')?.classList.toggle('hidden',preview);

    const body=$('ownerPortalBody');
    if(!body)return;

    if(platformStatus(p)!=='approved'){
      body.innerHTML=`<div class="owner-portal-blocked"><small>BUSINESS PORTAL STATUS</small><h2>${escapeHtml(platformStatusLabel(p))}</h2><p>Your business portal is not currently available. Your saved business information remains preserved.</p></div>`;
      return;
    }

    const metrics=await ownerPortalMetrics(p);
    const caps=new Set(p.ownerAccess.capabilities||[]);
    const kioskCount=metrics.deployments.filter(d=>d.profile==='kiosk_self_service').length;
    const modules=[
      ['orders','Orders',`${metrics.orders.length} recorded order${metrics.orders.length===1?'':'s'}`],
      ['customers','Customers',`${metrics.customers.length} customer${metrics.customers.length===1?'':'s'}`],
      ['products','Products',`${(p.products||[]).length} product${(p.products||[]).length===1?'':'s'}`],
      ['pricing','Pricing','Manage customer price choices'],
      ['branding','Branding','Manage your business identity'],
      ['kiosks','Kiosks',`${kioskCount} kiosk${kioskCount===1?'':'s'}`],
      ['deployments','Locations & Devices',`${metrics.deployments.length} configured`],
      ['staff','Staff','Manage your team'],
      ['reporting','Reporting','Review business activity'],
      ['notifications','Notifications','Manage customer notifications']
    ].filter(([key])=>caps.has(key));
    modules.push(['settings','Settings','Manage your login and password']);

    body.innerHTML=`<section class="owner-portal-overview">
        <div><small>${escapeHtml(p.name.toUpperCase())}</small><h2>Welcome, ${escapeHtml(p.ownerAccess.ownerName||'Business Owner')}</h2><p>Your business portal brings your approved tools, activity, and customer-facing operations together in one place.</p></div>
        <div class="owner-portal-status"><span>BUSINESS STATUS</span><strong>${escapeHtml(platformStatusLabel(p))}</strong></div>
      </section>
      <div class="owner-portal-metrics">
        <article><span>ORDERS</span><strong>${metrics.orders.length}</strong></article>
        <article><span>CUSTOMERS</span><strong>${metrics.customers.length}</strong></article>
        <article><span>LOCATIONS / DEVICES</span><strong>${metrics.deployments.length}</strong></article>
        <article><span>PORTAL STATUS</span><strong>${escapeHtml(String(p.ownerAccess.status||'not_claimed').toUpperCase())}</strong></article>
      </div>
      <section class="owner-portal-modules">${modules.map(([key,title,desc])=>`<button type="button" data-owner-module="${key}"><div><small>${key.toUpperCase()}</small><h3>${title}</h3><p>${desc}</p></div><span>OPEN →</span></button>`).join('')}</section>`;
    $$('[data-owner-module]').forEach(btn=>btn.addEventListener('click',()=>renderOwnerModule(p,btn.dataset.ownerModule)));
  }

  async function routeOwnerAccessFromHash(){
    const hash=String(location.hash||'');
    if(hash.startsWith('#owner-claim=')){
      const payload=decodeURIComponent(hash.slice('#owner-claim='.length));
      const dot=payload.indexOf('.');
      if(dot<=0)return;
      const projectId=payload.slice(0,dot);
      const token=payload.slice(dot+1);

      hideCoreSurfacesForOwner();
      $('ownerPortal')?.classList.add('hidden');
      $('ownerClaimGate')?.classList.remove('hidden');

      const validation=await validateOwnerClaim(projectId,token);
      const box=$('ownerClaimContent');
      if(!box)return;

      if(!validation.ok){
        box.innerHTML=`<div class="owner-claim-error"><small>BUSINESS PORTAL INVITATION</small><h2>This invitation is unavailable</h2><p>${escapeHtml(validation.error)}</p><button id="ownerClaimExit" class="secondary-btn" type="button">CLOSE</button></div>`;
        $('ownerClaimExit')?.addEventListener('click',closeOwnerPortal);
        return;
      }

      const p=validation.project;
      box.innerHTML=`<div class="owner-claim-card owner-partner-welcome">
        <small>WELCOME TO YOUR BUSINESS PORTAL</small>
        <h2>${escapeHtml(p.name)}</h2>
        <p class="owner-claim-welcome">Welcome, <strong>${escapeHtml(p.ownerAccess.ownerName||'Business Owner')}</strong>. We are excited to have the opportunity to work with you and support your business.</p>
        <p class="owner-claim-intro">Please review your invitation details, create your login, and continue when you are ready.</p>

        <div class="owner-claim-facts">
          <span><b>BUSINESS OWNER</b>${escapeHtml(p.ownerAccess.ownerName||'—')}</span>
          <span><b>EMAIL</b>${escapeHtml(p.ownerAccess.ownerEmail||'—')}</span>
          <span><b>INVITATION VALID UNTIL</b>${new Date(p.ownerAccess.invitation.expiresAt).toLocaleString()}</span>
        </div>

        <div class="owner-password-setup">
          <h3>Create Your Login</h3>
          <p>Confirm the invited email and create a password for this project portal. This local build proves the project-scoped handoff; production identity will move to the server-side identity service.</p>
          <label>Email<input id="ownerClaimLogin" type="email" value="${escapeHtml(p.ownerAccess.ownerEmail||'')}" autocomplete="username"></label>
          <label>Password<input id="ownerClaimPassword" type="password" value="" autocomplete="new-password" placeholder="8+ characters, letter + number"></label>
          <p class="owner-test-login-note">Invitation is bound to <strong>${escapeHtml(p.ownerAccess.ownerEmail||'the intended owner')}</strong> and this project only.</p>
          <p id="ownerClaimPasswordError" class="owner-login-error"></p>
        </div>

        <p class="owner-claim-partner-note">Your business portal is designed to give you a clear, simple place to manage the tools and activity prepared for your business.</p>

        <button id="ownerClaimAccept" class="primary-btn" type="button">ACCEPT & OPEN MY BUSINESS PORTAL</button>
        <button id="ownerClaimCancel" class="secondary-btn" type="button">NOT NOW</button>
      </div>`;

      $('ownerClaimAccept')?.addEventListener('click',async()=>{
        const login=$('ownerClaimLogin')?.value||'';
        const password=$('ownerClaimPassword')?.value||'';
        const result=await claimOwnerAccess(projectId,token,login,password,{testMode:false});
        if(!result.ok){
          if($('ownerClaimPasswordError'))$('ownerClaimPasswordError').textContent=result.error;
          return;
        }
        history.replaceState(null,'',location.pathname+location.search+'#owner-portal');
        await openOwnerPortal(projectId);
      });
      $('ownerClaimCancel')?.addEventListener('click',closeOwnerPortal);
      return;
    }

    if(hash.startsWith('#owner-login=')){
      const projectId=decodeURIComponent(hash.slice('#owner-login='.length));
      await showOwnerLogin(projectId);
      return;
    }

    if(hash==='#owner-portal'){
      const session=ownerSession();
      const p=session?.projectId?projectById(session.projectId):null;
      if(p&&p.ownerAccess?.status==='active'){
        await openOwnerPortal(p.id);
      }
    }
  }

  function bindOwnerPortal(){
    $('ownerPortalSignOut')?.addEventListener('click',closeOwnerPortal);
    $('ownerPortalClosePreview')?.addEventListener('click',async()=>{
      $('ownerPortal')?.classList.add('hidden');
      $('ownerClaimGate')?.classList.add('hidden');
      document.body.classList.remove('owner-portal-open');

      const returnState=ownerPreviewReturnState;
      ownerPreviewReturnState=null;

      $('blackFlagEntryGate')?.classList.add('hidden');
      $('customerApp')?.classList.add('hidden');
      $('adminPanel')?.classList.add('hidden');
      $('enginePanel')?.classList.remove('hidden');

      if(returnState?.projectId){
        engineActiveProjectId=returnState.projectId;
        await openProjectEngineControl(returnState.projectId);
        await renderProjectTab(returnState.projectId,returnState.tab||'owner');
      }
    });
    window.addEventListener('hashchange',()=>routeOwnerAccessFromHash());
  }



  let engineWorkspaceReturnScrollY=0;
  function openEngineWorkspace(el){
    if(!el)return;
    // Dedicated workspace navigation: park the command deck instead of placing a
    // fixed overlay above it. This is intentionally iPad/Safari-safe.
    engineWorkspaceReturnScrollY=window.scrollY||0;
    ['projectEngineControl','engineConfigurationDock'].forEach(id=>{
      const workspace=$(id);
      if(workspace && workspace!==el) workspace.classList.add('hidden');
    });
    el.classList.remove('hidden');
    document.body.classList.add('engine-workspace-open');
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
  }
  function closeEngineWorkspace(el){
    if(!el)return;
    el.classList.add('hidden');
    const stillOpen=document.querySelector('#projectEngineControl:not(.hidden),#engineConfigurationDock:not(.hidden)');
    if(!stillOpen){
      document.body.classList.remove('engine-workspace-open');
      const restoreY=engineWorkspaceReturnScrollY||0;
      requestAnimationFrame(()=>window.scrollTo({top:restoreY,left:0,behavior:'instant'}));
    }
  }
  function openEngineConfiguration(target='top'){
    const dock=$('engineConfigurationDock');if(!dock)return;
    openEngineWorkspace(dock);
    if(target==='economics') requestAnimationFrame(()=>$('engineFixedCost30')?.focus({preventScroll:false}));
    if(target==='integrity') requestAnimationFrame(()=>$('shipIntegritySummary')?.scrollIntoView({behavior:'smooth',block:'center'}));
  }

  function v3LifecycleLabel(state){
    return ({
      draft:'DRAFT',configured:'CONFIGURED',owner_invited:'OWNER INVITED',owner_active:'OWNER ACTIVE',
      deployment_ready:'DEPLOYMENT READY',testing:'TESTING',live:'LIVE',suspended:'SUSPENDED',
      relationship_ended:'RELATIONSHIP ENDED',archived:'ARCHIVED'
    })[state]||String(state||'PROJECT').toUpperCase();
  }

  async function runShipIntegrityV3({record=false}={}){
    // V4.1.1 uses one admission-authoritative convergence routine for storage, status, and certification.
    // Integrity therefore cannot disagree with the Broadside envelope counter.
    const convergence=await ensureV4EnvelopeConvergence({persistRegistry:true,record:false});
    try{await repairLegacyProjectReferences();}catch(err){console.warn('Integrity preflight reference repair warning',err);}
    const base=window.BlackFlagV3Core?.integrity?.(companies,document)||{issues:[]};
    const issues=[...(base.issues||[])], valid=new Set(companies.map(p=>p.id));
    for(const row of (convergence?.rows||[])){
      if(!row.ok)issues.push({level:'critical',code:'V4_ENVELOPE_CONVERGENCE_FAILED',projectId:row.projectId,detail:`registry=${row.registrySealed} local=${row.localEnvelope} idb=${row.dbEnvelope} memory=${row.memorySealed}`});
    }

    try{
      for(const o of await getMergedOrders()){
        const pid=String(o?.projectId||'');
        if(!pid)issues.push({level:'critical',code:'UNSCOPED_ORDER',detail:o.id||''});
        else if(!valid.has(pid))issues.push({level:'critical',code:'ORDER_PROJECT_UNKNOWN',projectId:pid,detail:o.id||''});
        else{
          const scoped=window.BlackFlagV3Core?.assertProjectScope?.({...o,projectId:pid},pid);
          if(scoped&&!scoped.ok)issues.push({level:'critical',code:'ORDER_SCOPE_MISMATCH',projectId:pid,detail:o.id||''});
        }
      }
    }catch(e){issues.push({level:'warning',code:'ORDER_STORE_CHECK_FAILED',detail:String(e?.message||e)})}

    const orphanOrderCount=quarantinedOrderIds().size;
    if(orphanOrderCount){
      issues.push({level:'info',code:'ORPHAN_ORDER_QUARANTINED',detail:`${orphanOrderCount} preserved in Recovery Vault`});
    }

    try{
      Object.keys(readLedgers()||{}).forEach(pid=>{
        if(!valid.has(pid))issues.push({level:'critical',code:'LEDGER_PROJECT_UNKNOWN',projectId:pid});
      });
    }catch(_){}

    try{
      Object.keys(readCustomerDirectory()||{}).forEach(pid=>{
        if(!valid.has(pid))issues.push({level:'critical',code:'CUSTOMER_PROJECT_UNKNOWN',projectId:pid});
      });
    }catch(_){}

    try{
      const canonical=await readCanonicalProjectRegistry();
      const mirror=(await getSetting('companies'))?.value||[];
      const expected=projectRegistryIds(companies), canonicalIds=projectRegistryIds(canonical), mirrorIds=projectRegistryIds(mirror);
      for(const id of expected){
        if(!canonicalIds.has(id))issues.push({level:'critical',code:'REGISTRY_PROJECT_MISSING',projectId:id,detail:'Missing from canonical projects store'});
        if(!mirrorIds.has(id))issues.push({level:'critical',code:'REGISTRY_MIRROR_MISSING',projectId:id,detail:'Missing from settings mirror'});
      }
      if(canonicalIds.size!==expected.size)issues.push({level:'critical',code:'REGISTRY_COUNT_MISMATCH',detail:`memory ${expected.size} • canonical ${canonicalIds.size}`});
      const schema=Number((await getSetting(FLEET_REGISTRY_SCHEMA_KEY))?.value||0);
      if(schema!==FLEET_REGISTRY_SCHEMA_VERSION)issues.push({level:'warning',code:'REGISTRY_SCHEMA_MISMATCH',detail:`expected ${FLEET_REGISTRY_SCHEMA_VERSION} • found ${schema||'unset'}`});
      if(expected.has(LEGACY_GRIZZLE_PROJECT_ID)||canonicalIds.has(LEGACY_GRIZZLE_PROJECT_ID)||mirrorIds.has(LEGACY_GRIZZLE_PROJECT_ID))issues.push({level:'critical',code:'LEGACY_PROJECT_ID_UNSEALED',projectId:LEGACY_GRIZZLE_PROJECT_ID,detail:`Must resolve only through alias to ${CANONICAL_GRIZZLY_PROJECT_ID}`});
      const grizzly=companies.find(p=>p.id===CANONICAL_GRIZZLY_PROJECT_ID);
      if(grizzly){
        const expectedNamespace=window.BlackFlagV3Core?.namespaceFor?.(CANONICAL_GRIZZLY_PROJECT_ID)||`bf.project.${CANONICAL_GRIZZLY_PROJECT_ID}`;
        if(grizzly.namespace && grizzly.namespace!==expectedNamespace)issues.push({level:'critical',code:'PROJECT_NAMESPACE_IDENTITY_MISMATCH',projectId:grizzly.id,detail:`expected ${expectedNamespace} • found ${grizzly.namespace}`});
        if(projectById(LEGACY_GRIZZLE_PROJECT_ID)?.id!==CANONICAL_GRIZZLY_PROJECT_ID)issues.push({level:'critical',code:'PROJECT_ALIAS_RESOLUTION_FAILED',projectId:grizzly.id,detail:`${LEGACY_GRIZZLE_PROJECT_ID} alias did not resolve to canonical vessel`});
        if(projectActivityMetricLabel(grizzly)!=='ORDERS')issues.push({level:'warning',code:'PROJECT_COMMAND_METRIC_LABEL_MISMATCH',projectId:grizzly.id,detail:'Grizzly Bear first fleet KPI must render as ORDERS'});
      }
    }catch(e){issues.push({level:'critical',code:'REGISTRY_VERIFY_FAILED',detail:String(e?.message||e)})}

    const criticalIds=['engineConfigureBtn','captainModeAccessBtn','projectEngineControl','engineConfigurationDock','projectCommandCards','ownerPortal','firstMateWatch','v3ArchitectureDeck','seaTrialsStation'];
    criticalIds.forEach(id=>{if(!$(id))issues.push({level:'critical',code:'CRITICAL_CONTROL_MISSING',detail:id})});

    const report={
      at:new Date().toISOString(),
      ok:!issues.some(x=>x.level==='critical'),
      critical:issues.filter(x=>x.level==='critical').length,
      warnings:issues.filter(x=>x.level==='warning').length,
      issues
    };
    if(record)window.BlackFlagV3Core?.audit?.({
      actorRole:'engine_admin',category:'integrity',action:'ship.integrity.check',
      detail:`${report.critical} critical • ${report.warnings} warning`
    });
    return report;
  }

  function seaTrialCheck(id,title,level,detail){ return {id,title,level,detail}; }

  async function runSeaTrialsV3811({record=false}={}){
    const checks=[];
    const core=window.BlackFlagV3Core;
    const integrity=await runShipIntegrityV3();
    checks.push(seaTrialCheck('structural','Structural integrity',integrity.ok?'pass':'fail',`${integrity.critical} critical • ${integrity.warnings} warning`));

    const ids=new Set(); let identityFail=0, isolationFail=0;
    for(const p of companies){
      if(!p?.id||ids.has(p.id)) identityFail++; else ids.add(p.id);
      try{
        const clone=JSON.parse(JSON.stringify(p)); const id=clone.id, ns=clone.namespace;
        clone.name=`${clone.name||'Project'} — Sea Trial`; core?.ensure?.(clone);
        if(clone.id!==id||clone.namespace!==ns) identityFail++;
      }catch(_){ identityFail++; }
      const good=core?.authorizeProjectMutation?.({project:p,actorRole:'engine_admin',contextProjectId:p.id});
      if(!good?.ok && !['project_read_only'].includes(good?.error)) isolationFail++;
      const other=companies.find(x=>x.id!==p.id);
      if(other){
        const wrong=core?.authorizeProjectMutation?.({project:p,actorRole:'engine_admin',contextProjectId:other.id});
        if(wrong?.ok) isolationFail++;
        const scope=core?.assertProjectScope?.({projectId:other.id},p.id);
        if(scope?.ok) isolationFail++;
      }
    }
    checks.push(seaTrialCheck('identity','Immutable project identity',identityFail?'fail':'pass',identityFail?`${identityFail} identity invariant failure(s)`:`${companies.length} project identities remain stable through an in-memory rename`));
    checks.push(seaTrialCheck('isolation','Cross-project isolation',isolationFail?'fail':'pass',isolationFail?`${isolationFail} authorization/scope failure(s)`:'Wrong-project mutation and scope probes fail closed'));

    let orderFail=0;
    try{ const valid=new Set(companies.map(p=>p.id)); for(const o of await getMergedOrders()){ if(!o?.projectId||!valid.has(String(o.projectId))) orderFail++; } }catch(_){ orderFail++; }
    checks.push(seaTrialCheck('orders','Order ownership',orderFail?'fail':'pass',orderFail?`${orderFail} order ownership issue(s)`:'Stored orders resolve to a known project'));

    let depFail=0; for(const p of companies){ for(const d of (Array.isArray(p.deployments)?p.deployments:[])){ if(!core?.validateDeployment?.(p,d)?.ok) depFail++; } }
    checks.push(seaTrialCheck('deployments','Deployment boundaries',depFail?'fail':'pass',depFail?`${depFail} deployment boundary issue(s)`:'Deployment records remain sealed to their project'));

    const transitionOk=!!(core?.canTransitionDeployment?.('draft','sea_trial')&&core?.canTransitionDeployment?.('sea_trial','deployed')&&!core?.canTransitionDeployment?.('deployed','draft')&&!core?.canTransitionDeployment?.('retired','deployed'));
    checks.push(seaTrialCheck('lifecycle','Deployment lifecycle',transitionOk?'pass':'fail',transitionOk?'Forward, pause/retire rules reject invalid backdoors':'Deployment transition contract failed'));

    const criticalRoutes=['engineConfigureBtn','captainModeAccessBtn','projectCommandCards','projectEngineControl','closeProjectEngineControl','returnToEngineBtn','projectTabs'];
    const missing=criticalRoutes.filter(id=>!$(id));
    checks.push(seaTrialCheck('navigation','Mission navigation',missing.length?'fail':'pass',missing.length?`Missing: ${missing.join(', ')}`:'Engine, Project Control, and Black Flag escape controls are mounted'));

    let persistence='pass', persistenceDetail='Browser persistence round-trip passed';
    try{ const k='blackFlagSeaTrialProbeV1', v=`probe-${Date.now()}`; localStorage.setItem(k,v); if(localStorage.getItem(k)!==v) throw new Error('round-trip mismatch'); localStorage.removeItem(k); }catch(e){ persistence='fail'; persistenceDetail=String(e?.message||e); }
    checks.push(seaTrialCheck('persistence','Local persistence',persistence,persistenceDetail));

    const audits=core?.readAudit?.()||[];
    checks.push(seaTrialCheck('audit',"Ship's Log",Array.isArray(audits)?'pass':'fail',Array.isArray(audits)?`${audits.length} recent audit event(s) available`:'Audit log unavailable'));

    const authReady=window.BlackFlagV3Identity?.productionAuth?.ready===true;
    checks.push(seaTrialCheck('production','Production security boundary',authReady?'pass':'warn',authReady?'Server-backed production identity reports ready':'Prototype remains private/test only until server-side identity, authorization, sessions, and secret storage are installed'));

    const failures=checks.filter(x=>x.level==='fail').length, warnings=checks.filter(x=>x.level==='warn').length;
    const report={at:new Date().toISOString(),ok:failures===0,failures,warnings,checks};
    window.__lastDarkSkySeaTrial=report;
    if(record){
      core?.audit?.({actorRole:'engine_admin',category:'sea_trial',action:'platform.sea_trials.run',detail:`${failures} failure • ${warnings} caution • ${checks.length} checks`});
      core?.telemetry?.('sea_trials',{failures,warnings,checks:checks.map(x=>({id:x.id,level:x.level}))},null);
    }
    return report;
  }

  function renderSeaTrials(report){
    const box=$('seaTrialsSummary'); if(!box||!report)return;
    const state=report.failures?'NOT READY':report.warnings?'PRIVATE / TEST READY':'CLEAR';
    box.innerHTML=`<div class="sea-trials-result ${report.failures?'fail':report.warnings?'watch':'pass'}"><div><small>SEA TRIAL RESULT</small><strong>${state}</strong><span>${report.failures} failure • ${report.warnings} caution • ${report.checks.length} checks</span></div><time>${new Date(report.at).toLocaleString()}</time></div><div class="sea-trials-checks">${report.checks.map(x=>`<article class="${escapeHtml(x.level)}"><span>${x.level==='pass'?'PASS':x.level==='warn'?'CAUTION':'FAIL'}</span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.detail)}</small></article>`).join('')}</div>`;
  }

  async function renderV3ArchitectureStatus(){
    const box=$('v3ArchitectureStatus');if(!box)return;
    const convergence=await ensureV4EnvelopeConvergence({persistRegistry:true,record:false});
    const states=companies.map(p=>window.BlackFlagV3Core?.lifecycle?.(p));
    const report=await runShipIntegrityV3();
    const migration=window.DarkSkyV4?.migrationState?.()||window.BlackFlagV3Core?.migrationState?.();
    const activeSchema=Number(window.BlackFlagV3Core?.schemaVersion||engineConfig.schemaVersion||8);
    const sealed=Number(convergence?.sealed||0);
    renderV4EnvelopeTrace(convergence);
    if($('v3SchemaBadge')) $('v3SchemaBadge').textContent=`SCHEMA ${activeSchema}`;
    const live=states.filter(x=>x==='live').length;
    const testing=states.filter(x=>x==='testing'||x==='deployment_ready').length;
    box.innerHTML=`
      <article><span>PROJECT ENVELOPES</span><strong>${sealed}/${companies.length}</strong><small>Schema ${activeSchema} + default deny</small></article>
      <article><span>LIVE</span><strong>${live}</strong><small>Published projects</small></article>
      <article><span>TESTING</span><strong>${testing}</strong><small>Deployment / sea trial</small></article>
      <article><span>INTEGRITY</span><strong class="${report.ok?'ok':'warn'}">${report.ok?'CLEAR':'ATTENTION'}</strong><small>${report.critical} critical • ${report.warnings} warning</small></article>
      <article><span>IDENTITY</span><strong>POLICY LIVE</strong><small>Production server auth still required</small></article>
      <article><span>MIGRATION</span><strong>${sealed===companies.length&&migration?.completed?'V4 COMMISSIONED':migration?.failed?'COMMISSIONING FAILED':'V4 COMMISSIONING'}</strong><small>${migration?.at?new Date(migration.at).toLocaleString():'Broadside migration gate active'}</small></article>`;
  }

  async function firstMateWatchItems(){
    const report=await runShipIntegrityV3();
    const economics=await readEngineEconomics();
    const items=[];
    if(report.critical)items.push({
      level:'captain',title:'Captain Decision Needed',
      detail:`${report.critical} structural issue${report.critical===1?'':'s'} detected.`,
      recommendation:'Run Ship Integrity and review the exact failed checks before continuing.',
      action:'integrity',cta:'RUN INTEGRITY CHECK'
    });
    else if(report.warnings)items.push({
      level:'attention',title:'First Mate Attention',
      detail:`${report.warnings} non-blocking warning${report.warnings===1?'':'s'} remain on watch.`,
      recommendation:'Review the integrity report and clear warnings that affect deployment.',
      action:'integrity',cta:'REVIEW WARNINGS'
    });
    else items.push({
      level:'clear',title:'All Clear',
      detail:'Project boundaries and critical command controls passed the current watch.',
      recommendation:'No corrective action required.',
      action:'results',cta:'VIEW CHECK RESULTS'
    });

    if(window.BlackFlagV3Identity?.productionAuth?.ready===false){
      items.push({
        level:'attention',title:'Production Owner Identity',
        detail:'Server-backed authentication remains required before real outside-owner deployment.',
        recommendation:'Keep outside owner rollout in test/private mode until production identity is installed.',
        action:'projects',cta:'REVIEW OWNER ACCESS'
      });
    }
    if(!(economics.fixed30||economics.perOrder||economics.variablePct)){
      items.push({
        level:'recommendation',title:'Operating Cost Model',
        detail:'Profit telemetry does not yet have real operating-cost information.',
        recommendation:'Enter known fixed, per-order, and variable costs to make Profit decision-grade.',
        action:'economics',cta:'CONFIGURE COST MODEL'
      });
    }

    const invited=companies.filter(p=>window.BlackFlagV3Core?.lifecycle?.(p)==='owner_invited');
    invited.forEach(p=>items.push({
      level:'attention',title:`${p.name} — Owner Invitation Pending`,
      detail:'The project owner invitation is awaiting claim.',
      recommendation:'Review the invitation status and decide whether to leave it active, revoke it, or regenerate it.',
      action:'project-owner',projectId:p.id,cta:'OPEN OWNER ACCESS'
    }));

    const testing=companies.filter(p=>['testing','deployment_ready'].includes(window.BlackFlagV3Core?.lifecycle?.(p)));
    testing.forEach(p=>{
      const launch=projectFleetLaunchState(p);
      if(launch.key==='fleet_ready')items.push({
        level:'recommendation',title:`${p.name} — Fleet Ready`,
        detail:'Sea Trial proof is recorded and the vessel is waiting for Captain approval.',
        recommendation:'Join this vessel to the live fleet when you are ready.',
        action:'project-launch',projectId:p.id,cta:'JOIN FLEET'
      });
      else items.push({
        level:'recommendation',title:`${p.name} — Sea Trial Watch`,
        detail:'This project is still in deployment/testing state.',
        recommendation:'Open Deployment and complete the next Sea Trial step.',
        action:'project-deployment',projectId:p.id,cta:'OPEN DEPLOYMENT'
      });
    });
    return items.slice(0,8);
  }

  function setFirstMateActionStatus(message='',tone='info'){
    const box=$('firstMateActionStatus');if(!box)return;
    box.textContent=message||'';
    box.className=`first-mate-action-status ${tone||'info'}${message?'':' empty'}`;
  }

  function pulseCommandTarget(el){
    if(!el)return;
    el.classList.remove('command-target-pulse');
    void el.offsetWidth;
    el.classList.add('command-target-pulse');
    setTimeout(()=>el.classList.remove('command-target-pulse'),1800);
  }

  async function routeFirstMateAction(action,projectId='',button=null){
    const original=button?.textContent||'';
    if(button){button.disabled=true;button.dataset.commandBusy='1';button.textContent='OPENING…';}
    setFirstMateActionStatus('Opening the recommended command…','working');
    try{
      if(action==='integrity'||action==='results'){
        openEngineConfiguration('integrity');
        const report=await runShipIntegrityV3({record:action==='integrity'});
        renderShipIntegrity(report);
        requestAnimationFrame(()=>pulseCommandTarget($('v3IntegrityStation')));
        setFirstMateActionStatus(action==='integrity'?'Integrity check complete. Review the structural results below.':'Showing the latest structural results.','success');
      }else if(action==='economics'){
        openEngineConfiguration('economics');
        requestAnimationFrame(()=>{
          const target=$('engineEconomicsConfig');
          target?.scrollIntoView({behavior:'smooth',block:'start'});
          pulseCommandTarget(target);
          $('engineFixedCost30')?.focus({preventScroll:true});
        });
        setFirstMateActionStatus('Engine Economics is open. Enter only costs you want included in performance telemetry.','success');
      }else if(action==='project-owner'&&projectId){
        await openProjectEngineControl(projectId);
        await renderProjectTab(projectId,'owner');
        requestAnimationFrame(()=>pulseCommandTarget($('projectTabContent')));
        setFirstMateActionStatus('Owner Access is open for the selected project.','success');
      }else if(action==='project-deployment'&&projectId){
        await openProjectEngineControl(projectId);
        await renderProjectTab(projectId,'deployment');
        requestAnimationFrame(()=>pulseCommandTarget($('projectTabContent')));
        setFirstMateActionStatus('Deployment command is open for the selected project.','success');
      }else if(action==='project-launch'&&projectId){
        const target=projectById(projectId);
        if(!target)throw new Error('The project could not be resolved from the fleet registry.');
        await continueProjectLaunch(target);
      }else if(action==='projects'){
        const section=$('engineProjectsSection');
        section?.scrollIntoView({behavior:'smooth',block:'start'});
        pulseCommandTarget(section);
        setFirstMateActionStatus('Project Command is highlighted. Open a vessel’s Control Center → Access → Owner Access for project-specific owner controls.','success');
      }else{
        throw new Error('This recommendation does not have a valid command route.');
      }
    }catch(err){
      console.error('First Mate command route failed',action,projectId,err);
      setFirstMateActionStatus(`Command route interrupted: ${String(err?.message||err)}`,'error');
      if(button){button.disabled=false;button.textContent=original||'TRY AGAIN';delete button.dataset.commandBusy;}
      return false;
    }
    if(button){button.disabled=false;button.textContent=original||'OPEN';delete button.dataset.commandBusy;}
    return true;
  }

  async function renderFirstMateWatch(){
    const box=$('firstMateWatchItems');if(!box)return;
    const items=await firstMateWatchItems();
    const summary=$('firstMateWatchSummary');
    if(summary){
      const critical=items.filter(x=>x.level==='captain').length;
      const attention=items.filter(x=>x.level==='attention').length;
      const recommendations=items.filter(x=>x.level==='recommendation').length;
      const clear=items.filter(x=>x.level==='clear').length;
      const state=critical?'CAPTAIN ACTION':attention?'WATCH':'STEADY';
      summary.innerHTML=`<div><span>WATCH STATUS</span><strong>${state}</strong></div><div class="first-mate-watch-counts">${critical?`<span class="captain">${critical} critical</span>`:''}${attention?`<span class="attention">${attention} attention</span>`:''}${recommendations?`<span>${recommendations} recommendation${recommendations===1?'':'s'}</span>`:''}${clear?`<span class="clear">${clear} clear</span>`:''}</div><time>${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</time>`;
    }
    box.innerHTML=items.map((x)=>`
      <article class="first-mate-item ${escapeHtml(x.level)}">
        <div class="first-mate-item-head"><span class="first-mate-signal" aria-hidden="true"></span><span>${x.level==='clear'?'ALL CLEAR':x.level==='captain'?'CAPTAIN':x.level==='attention'?'ATTENTION':'RECOMMEND'}</span></div>
        <strong>${escapeHtml(x.title)}</strong>
        <small>${escapeHtml(x.detail)}</small>
        <p><b>FIRST MATE</b><span>${escapeHtml(x.recommendation||'Review this item.')}</span></p>
        <button type="button" class="first-mate-action-btn" data-first-mate-action="${escapeHtml(x.action||'')}" ${x.projectId?`data-first-mate-project="${escapeHtml(x.projectId)}"`:''}>${escapeHtml(x.cta||'OPEN')}</button>
      </article>`).join('');
  }


  function renderShipIntegrity(report){
    const box=$('shipIntegritySummary');if(!box)return;
    box.innerHTML=`<div class="v3-integrity-result ${report.ok?'pass':'fail'}">
      <div><small>LAST CHECK</small><strong>${report.ok?'SHIP INTEGRITY CLEAR':'ATTENTION REQUIRED'}</strong><span>${report.critical} critical • ${report.warnings} warning</span></div>
      <time>${new Date(report.at).toLocaleString()}</time>
    </div>
    <div class="v3-integrity-issues">${report.issues.length?report.issues.slice(0,16).map(x=>`<span class="${escapeHtml(x.level)}"><b>${escapeHtml(x.code)}</b>${escapeHtml(x.projectId||x.detail||'')}</span>`).join(''):'<span class="clear"><b>ALL CLEAR</b>No structural issues detected by the current certification checks.</span>'}</div>`;
  }

  function renderV3AuditTrail(){
    const box=$('v3AuditViewer');if(!box)return;
    const rows=window.BlackFlagV3Core?.readAudit?.().slice(0,100)||[];
    box.classList.remove('hidden');
    box.innerHTML=`<header><strong>V3 AUDIT TRAIL</strong><button id="closeV3AuditViewer" class="secondary-btn small" type="button">CLOSE</button></header>
      <div>${rows.length?rows.map(x=>`<article><time>${new Date(x.at).toLocaleString()}</time><span>${escapeHtml(x.actorRole||'')}</span><strong>${escapeHtml(x.action||'')}</strong><small>${escapeHtml(x.projectId||'PLATFORM')}${x.detail?' • '+escapeHtml(x.detail):''}</small></article>`).join(''):'<p class="helper">No v3 audit events yet.</p>'}</div>`;
    $('closeV3AuditViewer')?.addEventListener('click',()=>box.classList.add('hidden'));
  }

  async function createV3RecoverySnapshot(){
    const snapshot=window.BlackFlagV3Core?.snapshot?.(companies,'captain-v3-final');
    if(snapshot){
      renderShipIntegrity(await runShipIntegrityV3());
      const box=$('shipIntegritySummary');
      if(box)box.insertAdjacentHTML('afterbegin',`<div class="v3-recovery-confirm"><strong>RECOVERY SNAPSHOT CREATED</strong><span>${escapeHtml(snapshot.id)} • ${snapshot.projectCount} project(s)</span></div>`);
    }
  }

  async function refreshV3CommandSystems(){
    await renderV3ArchitectureStatus();
    await renderFirstMateWatch();
    await renderFullSailCommandDeck();
  }

  window.blackFlagV3={
    version:'4.1.2-full-sail-compat',
    runIntegrity:()=>runShipIntegrityV3({record:true}),
    refresh:refreshV3CommandSystems,
    createSnapshot:createV3RecoverySnapshot,
    audit:()=>window.BlackFlagV3Core?.readAudit?.()||[],
    runSeaTrials:()=>runSeaTrialsV3811({record:true})
  };

  function bindMissionCriticalNavigation(){
    if(window.__blackFlagMissionNavigationBound)return;
    window.__blackFlagMissionNavigationBound=true;

    // Navigation that must survive every project/template/control-center refit.
    // Capture phase intentionally owns these routes before feature-level handlers.
    document.addEventListener('click',event=>{
      const target=event.target?.closest?.('#projectTabs [data-project-tab],#projectTabs [data-project-group],#closeProjectEngineControl,#returnToEngineBtn');
      if(!target)return;

      if(target.matches('#projectTabs [data-project-group]')){
        event.preventDefault();
        event.stopPropagation();
        const nav=$('projectTabs');
        const group=target.dataset.projectGroup;
        if(!nav||!group)return;
        const next=nav.dataset.openGroup===group?null:group;
        const current=$('#projectTabs [data-project-tab].active')?.dataset.projectTab||'overview';
        syncProjectCommandNavigation(current,{expandedGroup:next});
        return;
      }

      if(target.matches('#projectTabs [data-project-tab]')){
        event.preventDefault();
        event.stopPropagation();
        const projectId=engineActiveProjectId;
        const tab=target.dataset.projectTab;
        if(!projectId||!tab)return;
        if(target.dataset.navBusy==='1')return;
        target.dataset.navBusy='1';
        Promise.resolve(renderProjectTab(projectId,tab))
          .catch(err=>{
            console.error('Project Control navigation failed',err);
            window.BlackFlagV3Core?.audit?.({actorRole:'engine_admin',projectId,category:'navigation',action:'project.control.tab.failed',detail:`${tab} • ${String(err?.message||err)}`});
            const box=$('projectTabContent');
            if(box)box.innerHTML=`<div class="pc-navigation-error"><strong>COMMAND ROUTE INTERRUPTED</strong><span>${escapeHtml(String(err?.message||'This Project Control section could not be opened.'))}</span><button type="button" data-project-jump="overview">RETURN TO OVERVIEW</button></div>`;
          })
          .finally(()=>{delete target.dataset.navBusy;});
        return;
      }

      if(target.id==='closeProjectEngineControl'){
        event.preventDefault();
        event.stopPropagation();
        clearGraphicsTransientUi();
        closeEngineWorkspace($('projectEngineControl'));
        engineActiveProjectId=null;
        // Project Control may change the human-facing business identity. Refresh the
        // fleet command immediately so Engine cards never retain stale display data.
        Promise.resolve(renderProjectCommand()).catch(err=>console.warn('Engine project command refresh warning',err));
        return;
      }

      if(target.id==='returnToEngineBtn'){
        event.preventDefault();
        event.stopPropagation();
        requestEngineFromProject();
      }
    },true);
  }

  function bindWatchCommandBus(){
    if(window.__blackFlagWatchCommandBusBound)return;
    window.__blackFlagWatchCommandBusBound=true;

    // v3.9.3 — Command Watch controls live on their own delegated bus.
    // This intentionally binds before IndexedDB migrations / optional Engine setup.
    // Waters Ahead must remain actionable even when a noncritical initializer fails.
    document.addEventListener('click',async event=>{
      const target=event.target?.closest?.('#firstMateRefreshBtn,[data-first-mate-action],#runShipIntegrityBtn,#createRecoverySnapshotBtn,#showAuditTrailBtn,#openShipsLogBtn,#runSeaTrialsBtn');
      if(!target)return;

      event.preventDefault();
      event.stopPropagation();

      if(target.matches('[data-first-mate-action]')){
        if(target.dataset.commandBusy==='1')return;
        await routeFirstMateAction(target.dataset.firstMateAction,target.dataset.firstMateProject||'',target);
        return;
      }

      if(target.id==='firstMateRefreshBtn'){
        if(target.disabled||target.dataset.commandBusy==='1')return;
        const prior=target.textContent;
        target.disabled=true;target.dataset.commandBusy='1';target.textContent='SCANNING…';
        setFirstMateActionStatus('Running First Mate watch across the fleet…','working');
        try{
          await refreshV3CommandSystems();
          setFirstMateActionStatus('Watch refreshed. Recommendations are current.','success');
        }catch(err){
          console.error('First Mate watch refresh failed',err);
          setFirstMateActionStatus(`Watch interrupted: ${String(err?.message||err)}`,'error');
        }finally{
          target.disabled=false;delete target.dataset.commandBusy;target.textContent=prior||'RUN WATCH';
        }
        return;
      }

      if(target.id==='runShipIntegrityBtn'){
        if(target.disabled||target.dataset.commandBusy==='1')return;
        const prior=target.textContent;
        target.disabled=true;target.dataset.commandBusy='1';target.textContent='RUNNING CHECK…';
        try{
          const report=await runShipIntegrityV3({record:true});
          renderShipIntegrity(report);
          await renderFirstMateWatch();
          await renderV3ArchitectureStatus();
          pulseCommandTarget($('shipIntegritySummary'));
        }catch(err){
          console.error('Ship Integrity check failed',err);
          const box=$('shipIntegritySummary');
          if(box)box.innerHTML=`<div class="v3-integrity-result fail"><div><small>CHECK INTERRUPTED</small><strong>SHIP INTEGRITY COULD NOT COMPLETE</strong><span>${escapeHtml(String(err?.message||err))}</span></div></div>`;
        }finally{
          target.disabled=false;delete target.dataset.commandBusy;target.textContent=prior||'RUN SHIP INTEGRITY CHECK';
        }
        return;
      }

      if(target.id==='createRecoverySnapshotBtn'){
        await createV3RecoverySnapshot();
        return;
      }
      if(target.id==='showAuditTrailBtn'||target.id==='openShipsLogBtn'){
        renderV3AuditTrail();
        return;
      }
      if(target.id==='runSeaTrialsBtn'){
        const prior=target.textContent;
        if(target.dataset.commandBusy==='1')return;
        target.dataset.commandBusy='1';target.disabled=true;target.textContent='RUNNING SEA TRIALS…';
        try{
          const report=await runSeaTrialsV3811({record:true});
          renderSeaTrials(report);
          await renderFirstMateWatch();
          await renderV3ArchitectureStatus();
        }catch(err){
          console.error('Sea Trials command failed',err);
          setFirstMateActionStatus(`Sea Trials interrupted: ${String(err?.message||err)}`,'error');
        }finally{
          delete target.dataset.commandBusy;target.disabled=false;target.textContent=prior||'RUN SEA TRIALS';
        }
      }
    },true);
  }

  function bindEvents(){
    // Bind the ship's primary escape routes first. If a later optional control
    // ever throws during setup, the Captain can still navigate safely.
    bindMissionCriticalNavigation();
    bindEngineFleetCommand();

    // v3.9.3 Watch / integrity / Sea Trial buttons are owned by bindWatchCommandBus().


    $('pirateSettingsBtn')?.addEventListener('click',()=>{
      $('engineConfigurationDock')?.classList.remove('hidden');
      $('engineConfigurationDock')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    $('pirateOverrideBtn')?.addEventListener('click',()=>{
      $('engineConfigurationDock')?.classList.remove('hidden');
      $('engineConfigurationDock .protected-control-center')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    $('pirateExitBtn')?.addEventListener('click',()=>setEngineAppearance('business'));
    $$('[data-pirate-jump]').forEach(btn=>btn.addEventListener('click',()=>{
      const target=btn.dataset.pirateJump;
      if(target==='projects') $('engineProjectsSection')?.scrollIntoView({behavior:'smooth',block:'start'});
      if(target==='config'||target==='settings'){
        $('engineConfigurationDock')?.classList.remove('hidden');
        $('engineConfigurationDock')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(target==='recovery'){
        $('engineConfigurationDock')?.classList.remove('hidden');
        $('engineConfigurationDock .protected-control-center')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(target==='telemetry'){
        $('engineConfigurationDock')?.classList.remove('hidden');
        $('engineAnalyticsSection')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(target==='captain') $('captainModeAccessBtn')?.click();
    }));

    $('engineConfigureBtn')?.addEventListener('click',()=>openEngineConfiguration('top'));
    $('engineConfigurationCloseBtn')?.addEventListener('click',()=>closeEngineWorkspace($('engineConfigurationDock')));
    $('saveEngineEconomicsBtn')?.addEventListener('click',saveEngineEconomics);
    $('blackFlagPirateModeToggle')?.addEventListener('change',e=>setPirateMode(e.target.checked));
    $('enginePirateModeToggle')?.addEventListener('change',e=>setPirateMode(e.target.checked));
    $$('[data-engine-appearance]').forEach(btn=>btn.addEventListener('click',()=>setEngineAppearance(btn.dataset.engineAppearance)));

    bindProjectAssetEditor();
    bindProjectTemplateShells();
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
    $('adminBtn').addEventListener('click',async()=>{
      await configureProjectAdminGate();
      window.__pendingProtectedPage='settings';
      document.body.classList.add('modal-open');
      $('adminPinInput').value='';
      $('pinGateError').textContent='';
      $('pinGate').classList.remove('hidden');
      setTimeout(()=>{if(pinLocked(adminSecurityKey()))showPinLock(adminSecurityKey(),'adminLockTimer','adminPinInput','unlockAdminBtn');else $('adminPinInput').focus()},50);
    });
    $('closeAdminBtn').addEventListener('click',returnToCustomerAndLockProtected);
    const closeAdminPreviewLightbox=()=>{
      const gate=$('adminPreviewLightbox');
      if(gate) gate.classList.add('hidden');
      if($('adminPreviewLightboxImage')) $('adminPreviewLightboxImage').src='';
    };
    $('closeAdminPreviewLightbox')?.addEventListener('click',closeAdminPreviewLightbox);
    $('adminPreviewLightbox')?.addEventListener('click',e=>{
      if(e.target.id==='adminPreviewLightbox') closeAdminPreviewLightbox();
    });
    $('adminPanel')?.addEventListener('click',e=>{
      const preview=e.target.closest('.admin-preview-open');
      if(!preview)return;
      const src=preview.dataset.previewSrc||preview.querySelector('img')?.src||'';
      if(!src)return;
      $('adminPreviewLightboxImage').src=src;
      $('adminPreviewLightbox').classList.remove('hidden');
    });

    $('adminHomeMenuBtn')?.addEventListener('click',()=>showProjectAdminModule('admin'));
    $('saveAdminCoreSettingsBtn')?.addEventListener('click',saveAdminCoreSettings);
    $('projectAdminMenu')?.addEventListener('click',e=>{
      const card=e.target.closest('[data-admin-module]');
      if(card) showProjectAdminModule(card.dataset.adminModule);
    });

    $('openFullOrdersBtn')?.addEventListener('click',async()=>{
      stopProjectAdminIdleTimer();
      $('adminPanel')?.classList.add('hidden');
      document.body.classList.remove('project-admin-mode');
      $('projectOrdersPanel')?.classList.remove('hidden');
      document.body.classList.add('project-orders-mode');
      await renderProjectOrdersView();
    });
    $('orderList').addEventListener('change',e=>{const s=e.target.closest('[data-order-status]');if(s)updateOrderStatus(s.dataset.orderStatus,s.value);});

    if($('engineRoomBtn')) $('engineRoomBtn').addEventListener('click',()=>{
      document.body.classList.add('modal-open');
      $('enginePinInput').value='';
      $('enginePinError').textContent='';
      $('enginePinGate').classList.remove('hidden');
      setTimeout(()=>{if(pinLocked('engine'))showPinLock('engine','engineLockTimer','enginePinInput','unlockEngineBtn');else $('enginePinInput').focus()},50);
    });
    $('cancelEngineBtn').addEventListener('click',()=>{$('enginePinInput').value='';$('enginePinGate').classList.add('hidden');document.body.classList.remove('modal-open');});
    $('enginePinInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('unlockEngineBtn').click();});
    $('unlockEngineBtn').addEventListener('click',async()=>{
      const entered=$('enginePinInput').value.trim();
      const result=await window.BlackFlagAuth.verify(entered);
      if(!result.ok){
        if(result.code==='locked'){
          $('enginePinError').textContent='';
          window.showPinLock('engine','engineLockTimer','enginePinInput','unlockEngineBtn');
        }else{
          const pirateLines=[
            'Arrr… wrong code, matey.',
            'No treasure for ye. Try the captain’s code again.',
            'That code be walking the plank.',
            'Ye almost fooled the parrot. Almost.'
          ];
          $('enginePinError').textContent=pirateLines[Math.floor(Math.random()*pirateLines.length)];
          $('enginePinInput').select();
        }
        return;
      }
      $('enginePinInput').value='';
      $('enginePinGate').classList.add('hidden');
      document.body.classList.remove('modal-open');
      await openEnginePanel();
      if(pendingCaptainDeploymentRoute){
        const route=pendingCaptainDeploymentRoute;
        pendingCaptainDeploymentRoute=null;
        await openCaptainDeploymentRoute(route);
      }
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

    if($('addProjectBtn')) $('addProjectBtn').addEventListener('click',(e)=>{e.preventDefault();openProjectCommissioning();});
    // Project Control tabs and Black Flag return routes are owned by
    // bindMissionCriticalNavigation() so they cannot be lost in a module refit.
    $('editEngineNameBtn')?.addEventListener('click',()=>{
      if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Dark Sky';
      $('engineIdentityStatus').textContent='';
      $('engineIdentitySavedView')?.classList.add('hidden');
      $('engineIdentityEditView')?.classList.remove('hidden');
      setTimeout(()=>$('engineNameSetting')?.focus(),40);
    });

    $('cancelEngineNameEditBtn')?.addEventListener('click',()=>{
      if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Dark Sky';
      $('engineIdentityStatus').textContent='';
      $('engineIdentityEditView')?.classList.add('hidden');
      $('engineIdentitySavedView')?.classList.remove('hidden');
    });

    $('saveEngineIdentityBtn')?.addEventListener('click',async()=>{
      const name=$('engineNameSetting')?.value.trim()||'Dark Sky';
      engineConfig={...engineConfig,engineName:name};
      await saveEngineConfig();
      if($('engineNameDisplay')) $('engineNameDisplay').textContent=name;
      $('engineIdentityEditView')?.classList.add('hidden');
      $('engineIdentitySavedView')?.classList.remove('hidden');
      const status=$('engineIdentityStatus');
      if(status){
        status.textContent='Engine name saved.';
        status.classList.add('is-saved');
        window.setTimeout(()=>status.classList.remove('is-saved'),2200);
      }
    });

    $('saveEngineWorkflowBtn').addEventListener('click',async()=>{
      const statuses=$('engineStatusesSetting').value.split(',').map(v=>v.trim()).filter(Boolean);
      if(statuses.length<2){
        $('engineWorkflowStatus').textContent='Use at least two workflow stages.';
        return;
      }
      platformDefaultWorkflow=statuses.slice(0,12);
      await setSetting(PLATFORM_DEFAULT_WORKFLOW_KEY,platformDefaultWorkflow);
      $('engineWorkflowStatus').textContent='Default workflow saved for newly commissioned projects.';
    });

    $('engineRefreshDiagnosticsBtn').addEventListener('click',refreshEngineDiagnostics);
    $('engineClearDraftBtn').addEventListener('click',()=>{
      clearDraft();
      $('engineStorageDetail').textContent='Interrupted-order draft cleared. Existing saved orders were not changed.';
      refreshEngineDiagnostics();
    });
    $('engineExportBtn').addEventListener('click',exportBackup);
    $('engineStorageStewardCleanBtn')?.addEventListener('click',async()=>{const box=$('engineStorageStewardStatus');if(!confirm('Clean only stale caches and older V4 diagnostic/recovery manifests? Projects, orders, customers, graphics and quarantine evidence will not be touched.'))return;try{if(box)box.textContent='Cleaning temporary debris…';const r=await window.DarkSkyV4?.storageStewardClean?.();if(!r)throw new Error('Storage Steward unavailable');if(box)box.textContent=`Safe cleanup complete • ${r.removedCaches.length} stale caches • ${r.diagnosticsTrimmed} old diagnostics • ${r.recoveryPointsTrimmed} old recovery manifests.`;await refreshEngineDiagnostics();await renderFullSailCommandDeck();}catch(err){if(box)box.textContent='Cleanup interrupted: '+String(err.message||err);}});
    $('engineResetSettingsBtn').addEventListener('click',()=>{
      $('engineResetPinInput').value='';
      $('engineResetError').textContent='';
      $('engineResetGate').classList.remove('hidden');
      setTimeout(()=>$('engineResetPinInput').focus(),50);
    });
    $('cancelEngineResetBtn').addEventListener('click',()=>{
      $('engineResetPinInput').value='';
      $('engineResetError').textContent='';
      $('engineResetGate').classList.add('hidden');
    });
    $('confirmEngineResetBtn').addEventListener('click',async()=>{
      const entered=$('engineResetPinInput').value.trim();
      const result=await window.BlackFlagAuth.verify(entered);
      if(!result.ok){
        $('engineResetError').textContent=window.BlackFlagAuth.message(result);
        if(result.code==='locked') window.showPinLock('engine','engineResetLockTimer','engineResetPinInput','confirmEngineResetBtn');
        else{ $('engineResetPinInput').value=''; $('engineResetPinInput').focus(); }
        return;
      }
      if(!confirm('Final confirmation: reset Engine and project settings to defaults? Saved orders will remain.')) return;
      try{ await reqToPromise(tx(STORE_SETTINGS,'readwrite').clear()); }catch(_){}
      await setSetting('platformMigration:v3.7',{complete:true,at:new Date().toISOString(),resetBaseline:true});
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
      $('engineResetPinInput').value='';
      $('engineResetGate').classList.add('hidden');
      $('engineStorageDetail').textContent='Engine settings reset to defaults. Saved orders were preserved.';
      await refreshEngineDiagnostics();
    });
    $('unlockAdminBtn').addEventListener('click',async()=>{
      if(pinLocked(adminSecurityKey())){showPinLock(adminSecurityKey(),'adminLockTimer','adminPinInput','unlockAdminBtn');return;}
      const entered=$('adminPinInput').value.trim();
      const expected=await getAdminPin();
      if(entered!==expected){
        const row=recordBadPin(adminSecurityKey());
        $('pinGateError').textContent='Incorrect PIN.';
        if(row.lockedUntil>Date.now()) showPinLock(adminSecurityKey(),'adminLockTimer','adminPinInput','unlockAdminBtn');
        else $('adminPinInput').select();
        return;
      }
      clearPinFailures(adminSecurityKey());
      $('pinGate').classList.add('hidden');
      document.body.classList.remove('modal-open');
      const target=window.__pendingProtectedPage||'settings';
      await showProtectedProjectPage(target);
    });
    $('adminPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('unlockAdminBtn').click();});
    $('cancelAdminPinBtn').addEventListener('click',returnToCustomerAndLockProtected);
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
      await setAdminPin(p,activeProjectId);
      $('pinSettingsError').textContent='PIN updated.';
      $('newAdminPin').value='';
      $('confirmAdminPin').value='';
    });

    $('projectOrdersLaunchBtn')?.addEventListener('click',()=>openProtectedProjectPage('orders'));
    $('projectLedgerLaunchBtn')?.addEventListener('click',()=>openProtectedProjectPage('ledger'));
    $('closeProjectOrdersBtn')?.addEventListener('click',returnToCustomerAndLockProtected);
    $('closeProjectLedgerBtn')?.addEventListener('click',returnToCustomerAndLockProtected);
    if($('allowCustomColorsToggle')) $('allowCustomColorsToggle').addEventListener('change',saveFeatureSettings);
    
    if($('saveBusinessSettingsBtn')) $('saveBusinessSettingsBtn').addEventListener('click',saveBusinessConfigFromAdmin);
    if($('exportBtn')) $('exportBtn').addEventListener('click',exportBackup);
    if($('restoreInput')) $('restoreInput').addEventListener('change',async e=>{try{if(e.target.files?.[0])await restoreBackup(e.target.files[0]);}catch(err){alert('That backup file could not be restored.');}});
  }

  async function init(){
    // Mission-critical command controls must exist even if a later migration fails.
    bindWatchCommandBus();
    bindEngineProjectCommandBus();
    bindMissionCriticalNavigation();
    await loadEngineAppearance();
    db=await openDb();
    await migrateLegacyPlatformStorage();
    await loadFeatureSettings();
    await loadBusinessConfig();
    await loadCompanies();
    await migrateLegacyProjectSettings();
    await purgeAllExpiredOwnerInvitations();
    await loadEngineConfig();
    bindEvents();
    window.BlackFlagV3Core?.audit?.({actorRole:'system',category:'boot',action:'platform.v3.9.9.ready',detail:`${companies.length} projects • schema 7 • policy 3.5 • customer engagement contracts + durable post-submit receipts + fleet commissioning lane + repeatable business understanding + adaptive universal customer shell + unified Engine authentication + guided deployment launch + shell isolation`});
    const recovered=recoverDraft();
    state.current=recovered?state.current:'welcome';
    $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===state.current));
    $('customerApp')?.classList.add('hidden');
    $('adminPanel')?.classList.add('hidden');
    $('enginePanel')?.classList.add('hidden');
    bindOwnerPortal();
    await routeOwnerAccessFromHash();
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
  }
  // Arm independent command buses immediately. init() calls these again safely.
  bindWatchCommandBus();
  bindEngineProjectCommandBus();
  bindMissionCriticalNavigation();
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
      if(input){ input.value=''; setTimeout(()=>{input.value='';input.focus();},60); }
      const err=byId('blackFlagEntryError'); if(err) err.textContent='';
    }
  }

  window.requireEngineEntry=requireEngineEntry;

  function leaveEntry(){
    const gate=byId('blackFlagEntryGate');
    if(gate) gate.classList.add('hidden');
    document.body.classList.remove('bf-entry-open');
  }

  async function unlockFromEntry(){
    const input=byId('blackFlagEntryPin');
    const entered=(input?.value||'').trim();

    const result=await window.BlackFlagAuth.verify(entered);
    if(!result.ok){
      const err=byId('blackFlagEntryError');
      if(result.code==='locked'){
        if(err) err.textContent='';
        window.showPinLock('engine','blackFlagLockTimer','blackFlagEntryPin','blackFlagEntryUnlock');
      }else{
        if(err) err.textContent=window.BlackFlagAuth.message(result);
        if(input){ input.value=''; input.focus(); }
      }
      return;
    }

    if(window.BlackFlagAuth) window.BlackFlagAuth.unlock();
    if(input) input.value='';
    leaveEntry();
    if(typeof restoreBlackFlagTheme==='function') restoreBlackFlagTheme();
    window.pendingEngineReturnProjectId=null;
    activeProjectId=null;
    document.body.classList.remove('boot-locked','project-mode');
    document.body.classList.add('engine-mode');

    const customer=byId('customerApp'); if(customer) customer.classList.add('hidden');
    const mugs=byId('mugsCustomerShell'); if(mugs) mugs.classList.add('hidden'); const flowers=byId('flowersCustomerShell'); if(flowers) flowers.classList.add('hidden');
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
    const closeEntry=byId('closeBlackFlagEntry');
    if(closeEntry) closeEntry.addEventListener('click',async()=>{
      leaveEntry();
      if(typeof window.cancelEngineEntryToProject==='function'){
        await window.cancelEngineEntryToProject();
        return;
      }
      document.body.classList.remove('boot-locked','engine-mode');
      document.body.classList.add('project-mode');
      const engine=byId('enginePanel');if(engine)engine.classList.add('hidden');
      const customer=byId('customerApp');if(customer)customer.classList.remove('hidden');
      const ret=byId('returnToEngineBtn');if(ret)ret.classList.remove('hidden');
      if(typeof setScreen==='function')setScreen('welcome');
    });
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
  if(typeof window.blackFlagMigrateLegacyProjectAssets==='function'){
    window.blackFlagMigrateLegacyProjectAssets().catch(err=>console.warn('Graphics migration warning',err));
  }


  // v3.8.18 commissioning controls are rebound by openProjectCommissioning()/renderCommissioning().
  // This avoids stale or missing handlers when the workspace DOM changes.


  if($('addProjectBtn')) $('addProjectBtn').addEventListener('click',(e)=>{e.stopImmediatePropagation();e.preventDefault();openProjectCommissioning();},true);

})();
