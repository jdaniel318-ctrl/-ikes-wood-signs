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
    const projectId=order.projectId||'ikes-wood-signs';
    const p=projectById(projectId);
    if(!p){
      window.BlackFlagV3Core?.audit?.({actorRole:'system',projectId,category:'integrity',action:'customer.capture.blocked',detail:order?.id||'unknown'});
      return;
    }
    const scoped=window.BlackFlagV3Core?.assertProjectScope?.({...order,projectId},projectId,{legacyIke:true});
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
  function activeProject(){return projectById(activeProjectId)||projectById('ikes-wood-signs')||companies[0]}

  function projects(){ return companies; }
  function projectById(id){ return companies.find(p=>p.id===id); }

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
    return session;
  }
  function clearOwnerSession(){ sessionStorage.removeItem(OWNER_SESSION_KEY); }

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

    p.ownerAccess.credential={
      login:cleanLogin,
      password:cleanPassword,
      testMode:!!testMode,
      createdAt:p.ownerAccess.credential?.createdAt||new Date().toISOString(),
      changedAt:new Date().toISOString()
    };
    return {ok:true};
  }

  function verifyOwnerCredential(p,login,password){
    ensureProjectGovernance(p);
    const c=p.ownerAccess.credential;
    if(!c)return false;
    return normalizeOwnerLogin(login)===normalizeOwnerLogin(c.login) && String(password||'')===String(c.password||'');
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
      if(!verifyOwnerCredential(p,login,password)){
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
    if(!String(p.ownerAccess.ownerName||'').trim()) return {ok:false,error:'Enter and save the owner name first.'};
    if(!String(p.ownerAccess.ownerEmail||'').trim()) return {ok:false,error:'Enter and save the owner email first.'};

    try{
      const token=randomOwnerToken();
      const tokenHash=await sha256Hex(token);
      const now=Date.now();
      p.ownerAccess.invitation={
        inviteId:'INV-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,7),
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
    const inv=p.ownerAccess.invitation;
    if(!inv) return {ok:false,error:'No active invitation was found for this business.'};
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
    const projectId=order.projectId || (order.business?.name==="Ike's Wood Signs"?'ikes-wood-signs':activeProjectId||'ikes-wood-signs');
    const scoped=window.BlackFlagV3Core?.assertProjectScope?.({...order,projectId},projectId,{legacyIke:true});
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
    engineName:'Workshop Engine',
    schemaVersion:3
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
  let pendingCaptainDeploymentRoute = null;
  function lockEngineSession(){
    engineSessionUnlocked = false;
    if($('enginePinInput')) $('enginePinInput').value='';
    if($('blackFlagEntryPin')) $('blackFlagEntryPin').value='';
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
    recoveryPin: DEFAULT_ENGINE_PIN,
    pinLocked, recordBadPin, clearPinFailures, showPinLock
  };
  window.pinLocked=pinLocked; window.recordBadPin=recordBadPin; window.clearPinFailures=clearPinFailures; window.showPinLock=showPinLock;

  function normalizeProjectCode(p){
    if(!p)return p;
    const seeded={ 'ikes-wood-signs':'IKE','mugshot-after-dark':'MUG','beccas-bloom-shop':'BBS' };
    const fallback=String(p.orderPrefix||p.name||'PRJ').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'PRJ';
    p.projectCode=String(p.projectCode||seeded[p.id]||fallback).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);
    if(!p.orderPrefix)p.orderPrefix=p.projectCode;
    return p;
  }
  async function loadCompanies(){
    try{
      const saved=await getSetting('companies');
      companies=Array.isArray(saved?.value)&&saved.value.length?saved.value:structuredClone(DEFAULT_COMPANIES);
    }catch(_){companies=structuredClone(DEFAULT_COMPANIES);}
    companies=companies.map(normalizeProjectCode).map(ensureProjectGovernance);
    const core=window.BlackFlagV3Core;
    if(core){
      const before=structuredClone(companies);
      const migration=core.migrate(companies);
      companies=migration.projects;
      if(migration.changed){
        core.snapshot(before,'pre-v3-stage1-migration');
        await setSetting('companies',companies);
        core.markMigration({from:'2.9.x',to:'3.0',stage:1,status:'complete',projectCount:companies.length});
        core.audit({category:'migration',action:'v3.stage1.migration.complete',detail:`${companies.length} projects`});
      }
    }
  }
  async function saveCompanies(){
    companies=companies.map(p=>window.BlackFlagV3Core?.ensure?.(ensureProjectGovernance(p))||ensureProjectGovernance(p));
    await setSetting('companies',companies);
  }
  function companyById(id){return companies.find(c=>c.id===id);}
  function companyStatusLabel(c){
    return c.publish?.status==='live'?'LIVE':(c.publish?.status==='test'?'TEST':'DEVELOPMENT');
  }

  function projectScopedOrders(orders,projectId){
    return (orders||[]).filter(o=>{
      const result=window.BlackFlagV3Core?.assertProjectScope?.(o,projectId,{legacyIke:true});
      return result ? result.ok : (o.projectId||'ikes-wood-signs')===projectId;
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

  async function renderProjectCommand(){
    const box=$('projectCommandCards');if(!box)return;
    const list=projects();
    const live=list.filter(p=>p.publish?.status==='live').length;
    $('projectSummaryBadge').textContent=`${list.length} PROJECTS • ${live} PUBLISHED • ${list.length-live} PRIVATE/TEST`;
    const cards=[];
    for(const p of list){
      const s=await projectStats(p);
      const brandVisual=await projectBrandVisual(p);
      ensureProjectGovernance(p);
      const platformState=platformStatus(p);
      const ownerState=ownerAccessLabel(p);
      cards.push(`<article class="project-card ${platformState!=='approved'?'platform-blocked':''}">
        <span class="pirate-card-ribbon">ACTIVE</span>
        <span class="pirate-card-watermark" aria-hidden="true">☠</span>
        <div class="project-card-head">
          <div class="project-brand-badge ${brandVisual.logo?'has-logo':'code-only'}" title="${escapeHtml(p.name)}">
            ${brandVisual.logo?`<img src="${brandVisual.logo}" alt="${escapeHtml(p.name)} logo">`:`<span>${escapeHtml(brandVisual.code)}</span>`}
          </div>
          <label class="project-publish-toggle"><input type="checkbox" data-project-publish="${escapeHtml(p.id)}" ${p.publish?.status==='live'?'checked':''}><span>${p.publish?.status==='live'?'PUBLISHED':'PRIVATE'}</span></label>
        </div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.tagline||p.type.replaceAll('_',' '))}</p>
        ${(()=>{const ds=migrateLegacyDeployment(p).filter(d=>d.state!=='retired');const active=ds.filter(d=>d.state==='deployed').length;return `<div class="project-deployment-badge ${active?'active':''}">${active?`${active} OUTPOST${active===1?'':'S'} SAILING`:ds.length?`${ds.length} OUTPOST${ds.length===1?'':'S'} IN HARBOR`:'STANDARD DEPLOYMENT'}</div>`;})()}
        <div class="project-governance-strip">
          <span class="platform-status ${platformState}">${platformStatusLabel(p)}</span>
          <span>${ownerState}</span>
        </div>
        <div class="project-kpis">
          <span><small>ORDERS</small><strong>${s.orders}</strong></span>
          <span><small>REVENUE · 30D</small><strong>$${s.revenueMonth.toFixed(0)}</strong></span>
          <span><small>LEDGER</small><strong>${s.completed}</strong></span>
        </div>
        <div class="project-card-actions">
          <button data-open-project-control="${escapeHtml(p.id)}" class="secondary-btn small">CONTROL CENTER</button>
          <button data-enter-project="${escapeHtml(p.id)}" data-project-shell="${escapeHtml(projectShellFor(p))}" class="primary-btn small">${p.publish?.status==='live'?'OPEN PROJECT':'OPEN PRIVATE TEST'}</button>
        </div>
      </article>`);
    }
    cards.push(`<button id="addProjectCard" class="project-card add-project-card"><div class="add-project-plus">＋</div><h4>Add Project</h4><p>Create another private business or project in the Engine.</p><span class="pirate-add-copy">RAISE ANOTHER FLAG</span></button>`);
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
    const namespace=window.BlackFlagV3Core?.namespaceFor?.(p.id)||`bf.project.${p.id}`;
    p.deployments=p.deployments.map(d=>{
      d.projectId=p.id;
      d.namespace=namespace;
      d.authorization={...(d.authorization||{}),role:'device',projectId:p.id,namespace,scope:'customer_session',crossProjectAccess:'deny',policyVersion:'3.0',engineAccess:false,ownerAccess:false};
      return d;
    });
    return p.deployments;
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

  function deploymentManifestHtml(p,d){
    if(!d)return '';
    const readiness=deploymentReadiness(d);
    const profile=DEPLOYMENT_PROFILES[d.profile]||DEPLOYMENT_PROFILES.kiosk_self_service;
    return `<div class="deployment-manifest">
      <div class="manifest-head"><span>DEPLOYMENT MANIFEST</span><strong>v${Number(d.manifestVersion||1)}</strong></div>
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
            attentionReasons:reasons,
            lastCheckIn:d.lastCheckIn||null
          };
        })
      };
    });
  }
  window.blackFlagDeploymentFleetSnapshot=deploymentSnapshot;

  function projectTabsHtml(p,tab){
    const products=p.products||[];
    if(tab==='overview') return `<div class="pec-grid">
      <article class="pec-card"><h4>Project Status</h4><p><strong>${escapeHtml(p.publish?.status||'development')}</strong></p><p>Theme: ${escapeHtml(p.projectTheme||'custom')}</p><p>Order prefix: ${escapeHtml(p.orderPrefix||'PRJ')}</p></article>
      <article class="pec-card"><h4>Character Limit</h4><p>${p.customization?.maxCharacters?`${p.customization.maxCharacters} characters`:'Not set'}</p><p class="helper">${p.id==='ikes-wood-signs'?'Intentionally unset until Ike’s real rule is confirmed.':'Project rule.'}</p></article>
      <article class="pec-card"><h4>Activity</h4><div>${readActivity().filter(x=>x.projectId===p.id).slice(0,6).map(x=>`<div class="activity-line"><span>${escapeHtml(x.action)}</span><small>${new Date(x.at).toLocaleString()}</small></div>`).join('')||'<p class="helper">No activity yet.</p>'}</div></article>
    </div>`;

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
          <h4>Brand Identity</h4>
          <div class="marketing-identity-row"><span>Project</span><strong>${escapeHtml(p.name)}</strong></div>
          <div class="marketing-identity-row"><span>Project code</span><strong>${escapeHtml(p.projectCode||p.orderPrefix||'PRJ')}</strong></div>
          <div class="marketing-identity-row"><span>Permanent namespace</span><strong class="namespace-text">${escapeHtml(p.id)}</strong></div>
          <p class="helper">The Engine uses the permanent namespace—not the display name—to keep project marketing assets isolated.</p>
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
        <p id="graphicsIsolationNote" class="helper">Checking project graphics namespace…</p>

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
      return `<div class="pec-card"><h4>Project Admin Access</h4>
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

      return `<div class="pec-card customer-history-engine">
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
            <p><strong>${escapeHtml(p.name)}</strong> is the vessel. Deployments are the outposts where that vessel serves customers. One project can operate through many outposts without cloning its namespace.</p>
          </div>
          <button id="createDeploymentBtn" class="deployment-launch-btn" type="button"><span>＋</span><strong>LAY NEW KEEL</strong><small>Create Outpost</small></button>
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
            <div class="deployment-command-head">
              <div><small>SELECTED OUTPOST</small><h4>${escapeHtml(d.name)}</h4><span class="deployment-state-pill ${deploymentStateClass(d.state)}">${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)}</span></div>
              <div class="deployment-manifest-stamp"><span>MANIFEST</span><strong>v${Number(d.manifestVersion||1)}</strong></div>
            </div>

            <div class="deployment-editor-grid">
              <article class="pec-card deployment-editor">
                <label>Outpost name<input id="deployName" class="text-input" value="${escapeHtml(d.name)}"></label>
                <label>Deployment profile
                  <select id="deployProfile">${Object.entries(DEPLOYMENT_PROFILES).map(([value,x])=>`<option value="${value}" ${d.profile===value?'selected':''}>${escapeHtml(x.label)}</option>`).join('')}</select>
                </label>
                <label>Idle-session reset
                  <select id="deployIdle">${[1,2,3,5,10,15].map(n=>`<option value="${n}" ${Number(d.idleMinutes||3)===n?'selected':''}>${n} minute${n===1?'':'s'}</option>`).join('')}</select>
                </label>
                <label>Capability scope
                  <select id="deployCapabilityScope">
                    <option value="project_default" ${d.capabilityScope!=='approved_subset'?'selected':''}>Project default capabilities</option>
                    <option value="approved_subset" ${d.capabilityScope==='approved_subset'?'selected':''}>Approved deployment subset (framework)</option>
                  </select>
                </label>
                <div class="deployment-toggle-stack">
                  <label class="admin-toggle-row compact-toggle"><span><strong>Reset after completed order</strong><small>Return to this outpost's attract screen.</small></span><input id="deployReset" type="checkbox" ${d.resetAfterComplete!==false?'checked':''}></label>
                  <label class="admin-toggle-row compact-toggle"><span><strong>Purge customer session cargo</strong><small>Clear photos, uploads, previews, drafts and temporary customer data between sessions.</small></span><input id="deployPurge" type="checkbox" ${d.purgeSession!==false?'checked':''}></label>
                  <label class="admin-toggle-row compact-toggle"><span><strong>Show Start Over</strong><small>Customer-safe reset; project admin remains hidden.</small></span><input id="deployStartOver" type="checkbox" ${d.showStartOver!==false?'checked':''}></label>
                  <label class="admin-toggle-row compact-toggle"><span><strong>Resume deployment after reload</strong><small>Restore the outpost, never the previous customer's session.</small></span><input id="deployResume" type="checkbox" ${d.resumeAfterReload?'checked':''}></label>
                  <label class="admin-toggle-row compact-toggle"><span><strong>Device-level kiosk lock verified</strong><small>Mark only after iPad Guided Access / managed Single App Mode is configured.</small></span><input id="deployDeviceLock" type="checkbox" ${d.deviceLockVerified?'checked':''}></label>
                </div>
                <button id="saveDeploymentManifestBtn" class="primary-btn">SAVE MANIFEST REVISION</button>
                <span id="deploymentSaveStatus" class="helper"></span>
              </article>

              <article class="pec-card deployment-attract-card">
                <small>OUTPOST ATTRACT SCREEN</small><h4>${escapeHtml(p.name)}</h4>
                <div class="deployment-attract-preview">
                  <div class="deployment-attract-mark">${escapeHtml((p.projectCode||p.orderPrefix||'PRJ').slice(0,3))}</div>
                  <strong>${escapeHtml(d.attractTitle||'Ready when you are.')}</strong>
                  <span>TOUCH TO START</span>
                </div>
                <label>Attract message<input id="deployAttractTitle" class="text-input" value="${escapeHtml(d.attractTitle||'Ready when you are.')}"></label>
                <p class="helper">Future outpost-specific graphics remain owned by this project namespace.</p>
              </article>
            </div>

            <section class="deployment-lifecycle">
              <div><small>OUTPOST LIFECYCLE</small><h4>Draft → Sea Trial → Deployed → Paused → Retired</h4><p>Dark Sky never needs to clone ${escapeHtml(p.name)} to operate it somewhere new.</p></div>
              <div class="deployment-lifecycle-actions">
                ${d.state==='draft'?`<button data-deployment-action="sea_trial" class="secondary-btn">BEGIN SEA TRIAL</button>`:''}
                ${d.state==='sea_trial'?`<button data-deployment-action="deployed" class="primary-btn">DEPLOY OUTPOST</button><button data-deployment-action="draft" class="secondary-btn">RETURN TO DRAFT</button>`:''}
                ${d.state==='deployed'?`<button data-deployment-action="paused" class="return-harbor-btn"><strong>RETURN TO HARBOR</strong><small>Pause this deployment</small></button>`:''}
                ${d.state==='paused'?`<button data-deployment-action="deployed" class="primary-btn">SET SAIL <small>Resume deployment</small></button>`:''}
                ${d.state!=='retired'?`<button data-deployment-action="retired" class="danger-outline-btn">RETIRE OUTPOST</button>`:''}
              </div>
            </section>

            <div class="deployment-command-grid">
              <article class="pec-card deployment-readiness">
                <small>SEA TRIAL</small><h4>Readiness Inspection</h4>
                <div class="deployment-readiness-split">
                  <div class="deployment-readiness-score"><strong>${readiness.score}%</strong><span>ENGINE READINESS</span></div>
                  <div class="deployment-device-readiness ${d.deviceLockVerified?'verified':'action'}"><strong>${d.deviceLockVerified?'VERIFIED':'ACTION REQUIRED'}</strong><span>DEVICE READINESS</span></div>
                </div>
                ${readiness.checks.map(c=>`<div class="readiness-row ${c.pass?'pass':c.warning?'warn':'fail'}"><span>${escapeHtml(c.label)}</span><strong>${escapeHtml(c.detail)}</strong></div>`).join('')}
                <p class="helper">Engine readiness measures Dark Sky. Device readiness separately reflects iPad Guided Access / managed Single App Mode.</p>
              </article>

              <article class="pec-card deployment-signal-watch">
                <small>SIGNAL WATCH</small><h4>Outpost Health</h4>
                <div class="deployment-gauge"><i class="${d.state==='deployed'?'live':''}"></i><strong>${d.state==='deployed'?'SAILING':d.state==='sea_trial'?'SEA TRIAL':d.state==='paused'?'IN HARBOR':'IN HARBOR'}</strong></div>
                <p><b>Last check-in:</b> ${d.lastCheckIn?escapeHtml(new Date(d.lastCheckIn).toLocaleString()):'Telemetry not installed yet'}</p>
                <p><b>Manifest:</b> v${Number(d.manifestVersion||1)}</p>
                <p><b>Source attribution:</b> Outpost ID reserved for future order provenance</p>
                <p class="helper">Connection telemetry is not fabricated in this build. This is the berth where real outpost health will report later.</p>
              </article>
            </div>

            ${deploymentManifestHtml(p,d)}
            `:`<div class="deployment-no-selection"><span>⚓</span><strong>No Deployment Manifest</strong><p>Create an outpost to begin.</p></div>`}
          </main>
        </div>

        <section class="deployment-future">
          <div><small>DEPLOYMENT PROFILE BERTHS</small><h4>One vessel. Many missions.</h4><p>Kiosk is only the first profile. Every deployment remains subordinate to the owning project's business rules and namespace.</p></div>
          <div class="future-deployment-chips">${Object.values(DEPLOYMENT_PROFILES).map(x=>`<span>${escapeHtml(x.label)}</span>`).join('')}</div>
        </section>
      </div>`;
    }

    if(tab==='notifications'){
      const n=p.notifications||{customerConfirmationEmail:false};
      return `<div class="pec-card">
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

  async function renderProjectTab(id,tab){
    const p=projectById(id), box=$('projectTabContent');if(!p||!box)return;
    box.innerHTML=projectTabsHtml(p,tab);
    $$('#projectTabs [data-project-tab]').forEach(b=>b.classList.toggle('active',b.dataset.projectTab===tab));
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
    }
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
        const ownerName=String($('ownerAccessName')?.value||'').trim();
        const ownerEmail=String($('ownerAccessEmail')?.value||'').trim();
        if(!ownerName){alert('Owner name is required.');return;}
        if(!ownerEmail){alert('Owner email is required.');return;}
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
        p.ownerAccess.capabilities=$$('[data-owner-capability]').filter(x=>x.checked).map(x=>x.dataset.ownerCapability);
        p.ownerAccess.updatedAt=new Date().toISOString();
        await saveCompanies();
        logActivity(p.id,'Owner capabilities updated',p.ownerAccess.capabilities.join(', '));
      }));

      $('generateOwnerInvite')?.addEventListener('click',async()=>{
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
        p.customerHistory={adminVisible:$('customerHistoryAdminVisible').checked};
        await saveCompanies();
        logActivity(p.id,'Project Admin customer history '+(p.customerHistory.adminVisible?'enabled':'disabled'));
        await renderProjectTab(p.id,'customers');
      };
      $('rebuildCustomerHistoryBtn').onclick=async()=>{
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

      if($('createDeploymentBtn')) $('createDeploymentBtn').onclick=async()=>{
        const name=prompt('Outpost name','New Outpost');
        if(!name)return;
        const fresh={
          id:deploymentIdFor(p),
          name:name.trim()||'New Outpost',
          profile:'kiosk_self_service',
          state:'draft',
          manifestVersion:1,
          idleMinutes:3,
          resetAfterComplete:true,
          purgeSession:true,
          showStartOver:true,
          resumeAfterReload:false,
          deviceLockVerified:false,
          capabilityScope:'project_default',
          attractTitle:'Ready when you are.',
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString(),
          lastCheckIn:null
        };
        deployments.push(fresh);
        deploymentSelectionByProject.set(p.id,fresh.id);
        await saveCompanies();
        logActivity(p.id,'Deployment outpost created',fresh.name);
        await renderProjectTab(p.id,'deployment');
      };

      if(d && $('saveDeploymentManifestBtn')) $('saveDeploymentManifestBtn').onclick=async()=>{
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
        $('deploymentSaveStatus').textContent=`Manifest v${d.manifestVersion} saved. Project bulkhead remains sealed.`;
        setTimeout(()=>renderProjectTab(p.id,'deployment'),500);
      };

      $$('[data-deployment-action]').forEach(btn=>btn.onclick=async()=>{
        if(!d)return;
        const next=btn.dataset.deploymentAction;
        const readiness=deploymentReadiness(d);
        if(next==='sea_trial' && readiness.score<100){
          if(!confirm(`Sea Trial readiness is ${readiness.score}%. Continue to Sea Trial with warnings?`))return;
        }
        if(next==='deployed'){
          if(d.state!=='sea_trial'&&d.state!=='paused')return;
          if(!(await deploymentCommissionOrder(p,d)))return;
        }
        if(next==='retired'){
          if(!confirm(`Retire ${d.name}? Historical deployment records will be preserved.`))return;
        }
        const prior=d.state;
        d.state=next;
        d.updatedAt=new Date().toISOString();
        d.manifestVersion=Number(d.manifestVersion||1)+1;
        await saveCompanies();
        logActivity(p.id,'Deployment lifecycle changed',`${d.name}: ${prior} → ${next}`);
        await renderProjectCommand();
        await renderProjectTab(p.id,'deployment');
      });
    }
    if(tab==='notifications'){
      $('saveNotificationsTab').onclick=async()=>{
        p.notifications={customerConfirmationEmail:$('projectCustomerEmailEnabled').checked};
        await saveCompanies();
        logActivity(p.id,'Customer confirmation email '+(p.notifications.customerConfirmationEmail?'enabled':'disabled'));
      };
    }
    if(tab==='orders'){
      const orders=await getMergedOrders();const rows=orders.filter(o=>(o.projectId||'ikes-wood-signs')===p.id);
      $('ptOrders').innerHTML=rows.length?rows.slice().reverse().map(o=>`<div class="ledger-row"><strong>${escapeHtml(o.id)}</strong><span>${escapeHtml(o.status)}</span><span>$${Number(o.price||0).toFixed(2)}</span><span>${escapeHtml(o.customerName||'')}</span></div>`).join(''):'<p class="helper">No orders for this project yet.</p>';
    }
  }

  async function openProjectEngineControl(id){
    const p=projectById(id);if(!p)return;
    clearGraphicsTransientUi();
    engineActiveProjectId=id;
    $('pecTitle').textContent=p.name;
    $('pecSubtitle').textContent='Project-specific controls. Black Flag remains unlocked only while you stay in the Engine.';
    await applyProjectControlBrand(p);
    $('projectEngineControl').classList.remove('hidden');
    await renderProjectTab(id,'overview');
    window.scrollTo({top:$('projectEngineControl').offsetTop-20,behavior:'smooth'});
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
    if($('graphicsIsolationNote')) $('graphicsIsolationNote').textContent=`SEALED NAMESPACE: ${requestedProjectId} • Reads and writes are restricted to this project.`;
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

  const PROJECT_SHELL_TEMPLATES={
    'wood-sign':{id:'wood-sign',name:'Wood Sign',customerShell:'ikes',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true}},
    'custom-mug':{id:'custom-mug',name:'Custom Mug',customerShell:'mugs',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true}},
    'custom_flowers':{id:'custom_flowers',name:'Flower Shop',customerShell:'flowers',graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:true,previewApproval:true,wording:true,styles:true}},
    'custom-product':{id:'custom-product',name:'Custom Product',customerShell:null,graphicSlots:['projectLogo','heroGraphic','footerGraphic','backgroundImage'],capabilities:{photoRequired:false,previewApproval:false,wording:true,styles:false}}
  };
  const PROJECT_SHELLS={'ikes-wood-signs':'ikes','mugshot-after-dark':'mugs','beccas-bloom-shop':'flowers'};
  function projectShellFor(p){
    if(!p)return 'generic';
    const explicit=PROJECT_SHELLS[p.id];
    if(explicit)return explicit;
    const shell=(p.shellType||p.projectTheme||p.type||'').toLowerCase();
    if(shell==='ikes'||shell==='wood-sign'||shell==='custom_wood_sign'||shell==='wood_sign')return 'ikes';
    if(shell==='mugs'||shell==='custom-mug'||shell==='custom_mug'||shell==='mugshot-after-dark')return 'mugs';
    if(shell==='flowers'||shell==='flower-shop'||shell==='custom_flowers'||shell==='flowers-project')return 'flowers';
    return 'generic';
  }
  function hideAllCustomerShells(){$('customerApp')?.classList.add('hidden');$('mugsCustomerShell')?.classList.add('hidden');$('flowersCustomerShell')?.classList.add('hidden');}
  function showCustomerShellForProject(p){
    hideAllCustomerShells();
    document.body.classList.remove('ikes-project','mugs-project','flowers-project');
    const shell=projectShellFor(p);
    if(shell==='ikes') $('customerApp')?.classList.remove('hidden');
    else if(shell==='mugs') $('mugsCustomerShell')?.classList.remove('hidden');
    else if(shell==='flowers') $('flowersCustomerShell')?.classList.remove('hidden');
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
      alert('This project does not have a customer shell assigned yet. Open its Control Center and assign a project type/template before testing.');
      return;
    }
    activeProjectId=id;logActivity(id,'Project opened');engineSessionUnlocked=false;
    document.body.classList.remove('boot-locked','engine-mode');$('enginePanel')?.classList.add('hidden');$('blackFlagEntryGate')?.classList.add('hidden');document.body.classList.add('project-mode');$('adminPanel')?.classList.add('hidden');
    showCustomerShellForProject(p);
    await applyProjectAssetSlots(p);
    if(resolvedShell==='ikes'){
      $('returnToEngineBtn')?.classList.remove('hidden');resetRuntimeStateForProject(p);applyProjectTheme(p);await loadBusinessConfig();recoverDraft();if($('wordingInput'))$('wordingInput').value=state.wording;updateUi();if(typeof setScreen==='function')setScreen('welcome');
    }else if(resolvedShell==='mugs'){
      $('returnToEngineBtn')?.classList.remove('hidden');document.title='Mugs After Dark';document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='mugshot-after-dark';document.body.classList.remove('ikes-project','flowers-project');document.body.classList.add('mugs-project');resetMugsShell();showMugsScreen('welcome');
    }else if(resolvedShell==='flowers'){
      $('returnToEngineBtn')?.classList.remove('hidden');applyFlowersIdentity(p);document.body.dataset.activeProject=p.id;document.body.dataset.projectTheme='flowers';document.body.classList.remove('ikes-project','mugs-project');document.body.classList.add('flowers-project');resetFlowersShell();showFlowersScreen('welcome');
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
    document.title='Workshop Engine';
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
    companies.push({id,projectCode:(prefix||name.slice(0,3)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'PRJ',name,type,shellType:PROJECT_SHELL_TEMPLATES[type]?.customerShell||'custom-product',tagline:type==='custom_flowers'?'Fresh flowers, thoughtfully arranged.':'',visibility:'engine_only',status:'future',projectTheme:type==='custom_flowers'?'flowers':id,orderPrefix:prefix||'PRJ',ai:{mode:'off',minConfidence:.9,requireScaleReference:true},customization:{maxCharacters:null,characterLimitStatus:'unset',allowCustomColors:true},customerExperience:{photoRequired:true,previewApproval:true},workflow:['New','In Production','Ready for Pickup','Completed'],publish:{status:'development'},payments:{enabled:false,mode:'payment_link',provider:'not_configured',customerVisible:false},
permissions:{ordersView:true,ordersUpdate:true,ledgerView:false,costEntry:false,profitView:false,projectOptionsView:false},
customerHistory:{adminVisible:false},notifications:{customerConfirmationEmail:false},products:[]});
    if(type==='custom_flowers') PROJECT_SHELLS[id]='flowers'; await saveCompanies();
    const __allAssets=readAllProjectAssets();delete __allAssets[id];writeAllProjectAssets(__allAssets);
    logActivity(id,'Project created');$('addProjectGate').classList.add('hidden');await renderProjectCommand();
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
      const all=projects().flatMap(p=>(readActivity(p.id)||[]).map(x=>({...x,projectName:p.name})));
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
    await renderEnginePerformance();
  }


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
    if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Workshop Engine';
    if($('engineNameDisplay')) $('engineNameDisplay').textContent=engineConfig.engineName||'Workshop Engine';
    $('engineIdentityEditView')?.classList.add('hidden');
    $('engineIdentitySavedView')?.classList.remove('hidden');
    if($('engineStatusesSetting')) $('engineStatusesSetting').value=(businessConfig.orderStatuses||DEFAULT_BUSINESS_CONFIG.orderStatuses).join(', ');
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
      orderStatuses:Array.isArray(p?.workflow)?p.workflow:DEFAULT_BUSINESS_CONFIG.orderStatuses
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
    businessConfig={...businessConfig,businessName:$('businessNameSetting').value.trim()||"Ike's Wood Signs",orderPrefix:($('orderPrefixSetting').value||'IKE').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'IKE',thankYouHeadline:$('thankYouSetting').value.trim()||DEFAULT_BUSINESS_CONFIG.thankYouHeadline,prices:prices.length?prices:[45,55,65,90,135]};
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
    o.status=status;o.updatedAt=new Date().toISOString();if(status==='Completed'&&!o.completedAt)o.completedAt=o.updatedAt;backupOrderLocally(o);try{await put(STORE_ORDERS,o)}catch(_){}
    if(status==='Completed') postOrderToLedger(o);
    await renderAdmin();
    if(document.body.classList.contains('project-admin-mode')) await renderProjectAdminQuickStats();
  }

  async function renderAdmin(){
    const orders=(await getMergedOrders()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const list=$('orderList');
    if(!orders.length){list.innerHTML='<div class="empty">No saved orders yet.</div>';return;}
    list.innerHTML=orders.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-card-head"><div><h3>${escapeHtml(o.id)}</h3><div class="helper">${new Date(o.createdAt).toLocaleString()}</div></div><strong>$${o.price}</strong></div><div class="summary-row"><span>Sign</span><strong>${escapeHtml(o.wording)}</strong></div><div class="summary-row"><span>Customer</span><strong>${escapeHtml(o.customerName)}</strong></div><div class="summary-row"><span>Cell</span><strong>${escapeHtml(o.customerPhone)}</strong></div><div class="summary-row"><span>Email</span><strong>${escapeHtml(o.customerEmail)}</strong></div><div class="summary-row"><span>Letter finish</span><strong>${escapeHtml(o.fill)}${o.fill==='Other'&&o.customColor?` • <span class="color-dot" style="background:${escapeHtml(o.customColor)}"></span> ${escapeHtml(o.customColor.toUpperCase())}`:''}</strong></div>${o.approvedPreviewData?`<div class="admin-preview-label">APPROVED CUSTOMER PREVIEW</div><img src="${o.approvedPreviewData}" alt="Approved sign preview for ${escapeHtml(o.id)}" class="thumb approved-thumb">`:o.photoData?`<img src="${o.photoData}" alt="Wood blank for ${escapeHtml(o.id)}" class="thumb">`:''}<label>Status<select class="status-select" data-status><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='In Production'?'selected':''}>In Production</option><option ${o.status==='Ready'?'selected':''}>Ready</option><option ${o.status==='Picked Up'?'selected':''}>Picked Up</option></select></label><div class="order-status-control"><label>Status</label><select data-order-status="${escapeHtml(o.id)}">${businessConfig.orderStatuses.map(s=>`<option value="${escapeHtml(s)}" ${o.status===s?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div><div class="order-actions"><span class="helper">${o.emailSentAt?'Automatic email sent':'Saved locally'}</span></div></article>`).join('');
    list.querySelectorAll('[data-status]').forEach(sel=>sel.addEventListener('change',async e=>{const card=e.target.closest('[data-id]');const orders=await getMergedOrders();const o=orders.find(x=>x.id===card.dataset.id);if(o){o.status=e.target.value;await put(STORE_ORDERS,o);}}));
  }


  function orderProjectId(o){return o.projectId||'ikes-wood-signs'}
  function statusBadge(o){
    if(o.status==='Ready for Pickup') return '<span class="order-check ready-check" title="Ready for Pickup">✓</span>';
    if(o.status==='Completed') return '<span class="order-check completed-check" title="Completed">✓</span>';
    return '';
  }
  function completedAgeDays(o){
    const d=o.completedAt||o.updatedAt||o.createdAt; return (Date.now()-new Date(d).getTime())/86400000;
  }
  function projectOrderCard(o,canUpdate=true){
    const preview=o.approvedPreviewData||'';
    const status=canonicalOrderStatus(o.status);
    const statusClass=adminStatusClass(status);
    return `<article class="order-card order-card-with-preview ${statusClass}" data-id="${escapeHtml(o.id)}">
      <div class="order-card-layout">
        ${preview?`<button class="project-order-preview admin-preview-open" type="button" data-preview-src="${preview}" aria-label="Open larger approved preview for ${escapeHtml(o.id)}"><div class="project-order-preview-label">APPROVED CUSTOMER PREVIEW</div><img src="${preview}" alt="Approved customer preview for ${escapeHtml(o.id)}"><span class="preview-zoom-mark">＋</span></button>`:''}
        <div class="project-order-details">
          <div class="order-card-head"><div class="order-title-with-check">${statusBadge(o)}<div><h3>${escapeHtml(o.id)}</h3><div class="helper">${new Date(o.createdAt).toLocaleString()}</div></div></div><strong>$${Number(o.price||0).toFixed(2)}</strong></div>
          <div class="summary-row"><span>Order</span><strong>${escapeHtml(o.wording||'Custom order')}</strong></div>
          <div class="summary-row"><span>Customer</span><strong>${escapeHtml(o.customerName||'')}</strong></div>
          <div class="summary-row"><span>Phone</span><strong>${escapeHtml(o.customerPhone||'')}</strong></div>
          <div class="summary-row"><span>Email</span><strong>${escapeHtml(o.customerEmail||'')}</strong></div>
          ${canUpdate?`<div class="order-status-control ${statusClass}" data-workflow-status="${escapeHtml(statusClass)}"><label class="order-status-label" style="color:${adminStatusColor(status)}">Status</label><select data-order-status="${escapeHtml(o.id)}">${businessConfig.orderStatuses.map(s=>`<option value="${escapeHtml(s)}" ${canonicalOrderStatus(o.status)===canonicalOrderStatus(s)?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div>`:`<span class="admin-status-pill ${statusClass}">${adminStatusLabel(status)}</span>`}
        </div>
      </div>
    </article>`;
  }
  async function renderProjectOrdersView(){
    const p=activeProject(), pm=p?.permissions||{};
    if(!pm.ordersView){$('projectActiveOrders').innerHTML='<div class="empty">Orders access is disabled in Black Flag.</div>';$('projectCompletedOrders').innerHTML='';return;}
    const rows=approvedProjectOrders(await getMergedOrders(),p).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const recent=rows.filter(o=>o.status!=='Completed'||completedAgeDays(o)<=10);
    const archived=rows.filter(o=>o.status==='Completed'&&completedAgeDays(o)>10);
    $('projectActiveOrders').innerHTML=recent.map(o=>projectOrderCard(o,!!pm.ordersUpdate)).join('')||'<div class="empty">No current orders.</div>';
    $('projectCompletedOrders').innerHTML=archived.map(o=>projectOrderCard(o,false)).join('')||'<div class="empty">No archived completed orders.</div>';
    $('projectActiveOrders').querySelectorAll('[data-order-status]').forEach(s=>s.addEventListener('change',e=>updateOrderStatus(s.dataset.orderStatus,e.target.value)));
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
      if(pinLocked('admin')) showPinLock('admin','adminLockTimer','adminPinInput','unlockAdminBtn');
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
      const sameProject=(o.projectId||'ikes-wood-signs')===p.id;
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
      await putSetting('adminPin',next);
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
  function renderMugsPreview(){if($('mugsPreviewImage')&&mugsState.photoData)$('mugsPreviewImage').src=mugsState.photoData;if($('mugsPreviewText')){$('mugsPreviewText').textContent=mugsState.message||'Your Message';$('mugsPreviewText').className=`mugs-preview-text mugs-style-${mugsState.style}`;}}
  function renderMugsReview(){const box=$('mugsReviewSummary');if(!box)return;box.innerHTML=`<div class="mugs-review-preview"><img src="${mugsState.photoData}" alt="Confirmed mug photo"><div class="mugs-review-overlay mugs-style-${escapeHtml(mugsState.style)}">${escapeHtml(mugsState.message||'Your Message')}</div></div><div class="mugs-review-row"><span>Message</span><strong>${escapeHtml(mugsState.message||'')}</strong></div><div class="mugs-review-row"><span>Name</span><strong>${escapeHtml(mugsState.customerName||'')}</strong></div><div class="mugs-review-row"><span>Phone</span><strong>${escapeHtml(mugsState.customerPhone||'')}</strong></div><div class="mugs-review-row"><span>Email</span><strong>${escapeHtml(mugsState.customerEmail||'')}</strong></div><div class="mugs-review-row"><span>Pricing</span><strong>TEST MODE</strong></div>`;}
  async function createMugsApprovedPreview(){if(!mugsState.photoData)return '';return new Promise(resolve=>{const img=new Image();img.onload=()=>{try{const scale=Math.min(1,1600/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height)),w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale)),h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return resolve('');ctx.drawImage(img,0,0,w,h);const text=mugsState.message||'';let size=Math.max(30,Math.min(Math.round(w*.09),Math.round(h*.22)));const family=mugsState.style==='classic'?'Georgia':mugsState.style==='script'?'cursive':'Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111';while(size>20){ctx.font=`700 ${size}px ${family}`;if(ctx.measureText(text).width<=w*.82)break;size-=2;}ctx.lineWidth=Math.max(3,size*.08);ctx.strokeStyle='rgba(255,255,255,.82)';ctx.strokeText(text,w/2,h/2,w*.82);ctx.fillText(text,w/2,h/2,w*.82);resolve(canvas.toDataURL('image/jpeg',.84));}catch(err){console.warn('Mugs preview failed',err);resolve('');}};img.onerror=()=>resolve('');img.src=mugsState.photoData;});}
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
      alert('The order could not be saved. Please try again.');
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
      const projectOrders=allOrders.filter(o=>(o.projectId||'ikes-wood-signs')===p.id);
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
  };

  function bindFlowersShell(){if(window.__flowersShellBound)return;window.__flowersShellBound=true;$('flowersCustomerShell')?.addEventListener('click',e=>{const n=e.target.closest('[data-flowers-next]');if(n&&!n.disabled){showFlowersScreen(n.dataset.flowersNext);return;}const b=e.target.closest('[data-flowers-back]');if(b){showFlowersScreen(b.dataset.flowersBack);}});$('flowersPhotoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{flowersState.photoData=String(r.result||'');$('flowersPhotoPreview').src=flowersState.photoData;$('flowersPhotoPreviewWrap').classList.remove('hidden');$('flowersPhotoNext').disabled=!flowersState.photoData;};r.readAsDataURL(file);});$('flowersRetakePhoto')?.addEventListener('click',()=>{flowersState.photoData='';$('flowersPhotoInput').value='';$('flowersPhotoPreviewWrap').classList.add('hidden');$('flowersPhotoNext').disabled=true;$('flowersPhotoInput').click();});$('flowersMessage')?.addEventListener('input',e=>{flowersState.message=e.target.value;$('flowersCharCount').textContent=String(flowersState.message.length);});$('flowersStyle')?.addEventListener('change',e=>flowersState.style=e.target.value);$('flowersCustomerNext')?.addEventListener('click',()=>{flowersState.customerName=$('flowersCustomerName').value.trim();flowersState.customerPhone=$('flowersCustomerPhone').value.trim();flowersState.customerEmail=$('flowersCustomerEmail').value.trim();if(!flowersState.customerName||!flowersState.customerPhone){alert('Name and phone are required.');return;}showFlowersScreen('review');});$('flowersApprovalCheck')?.addEventListener('change',e=>$('flowersSubmitOrder').disabled=!e.target.checked);$('flowersSubmitOrder')?.addEventListener('click',submitFlowersOrder);$('flowersNewOrder')?.addEventListener('click',()=>{resetFlowersShell();showFlowersScreen('welcome');});$('flowersAdminBtn')?.addEventListener('click',()=>{$('adminBtn')?.click();});}

  function bindProjectTemplateShells(){
    // Template-level customer behaviors. These are bound once and are not tied
    // to a particular company/project ID.
    bindMugsShell();
    bindFlowersShell();
  }



  function bindEngineFleetCommand(){
    const search=$('engineFleetSearch');
    const host=$('projectCommandCards');
    const filterButtons=Array.from(document.querySelectorAll('[data-engine-fleet-filter]'));
    if(!search||!host||!filterButtons.length)return;

    const apply=()=>{
      const q=String(search.value||'').trim().toLowerCase();
      const mode=filterButtons.find(b=>b.classList.contains('active'))?.dataset.engineFleetFilter||'all';

      Array.from(host.children).forEach(card=>{
        const addCard=card.id==='addProjectCard' || card.classList.contains('add-project-card');
        if(addCard){
          card.hidden=mode!=='all'||!!q;
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
    };

    search.addEventListener('input',apply);
    filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
      filterButtons.forEach(b=>b.classList.toggle('active',b===btn));
      apply();
    }));

    new MutationObserver(apply).observe(host,{childList:true});
    apply();
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
    const lastProjectId=session?.projectId||'ikes-wood-signs';
    $('ownerPortal')?.classList.add('hidden');
    clearOwnerSession();
    document.body.classList.add('owner-portal-open');
    history.replaceState(null,'',location.pathname+location.search+`#owner-login=${encodeURIComponent(lastProjectId)}`);
    await showOwnerLogin(lastProjectId,'You have been signed out.');
  }

  async function ownerPortalMetrics(p){
    const orders=(await getMergedOrders()).filter(o=>{
      const pid=o.projectId || ((o.business?.name||"Ike's Wood Signs")==="Ike's Wood Signs"?'ikes-wood-signs':'');
      return pid===p.id;
    });
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
        orderStatuses:Array.isArray(value.orderStatuses)&&value.orderStatuses.length?value.orderStatuses:(Array.isArray(p.workflow)?p.workflow:['New','In Production','Ready for Pickup','Completed'])
      };
    }catch(_){
      return {businessName:p.name,orderPrefix:p.orderPrefix||'PRJ',thankYouHeadline:`THANK YOU FOR CHOOSING ${String(p.name).toUpperCase()}!`,prices:Array.isArray(defaults.prices)?defaults.prices:[0],orderStatuses:Array.isArray(p.workflow)?p.workflow:['New','In Production','Ready for Pickup','Completed']};
    }
  }

  async function ownerUpdateOrderStatus(p,orderId,status){
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
        `<div class="owner-module-toolbar"><button id="ownerCreateDeployment" class="primary-btn" type="button">+ ADD ${kiosks?'KIOSK':'LOCATION / DEVICE'}</button></div><div class="owner-deployment-list">${list.length?list.map(d=>`
          <article class="owner-deployment-row"><div><small>${escapeHtml((DEPLOYMENT_PROFILES[d.profile]?.label||d.profile).toUpperCase())}</small><h3>${escapeHtml(d.name)}</h3><p>${escapeHtml(DEPLOYMENT_STATES[d.state]||d.state)}</p></div><button data-owner-deploy-toggle="${escapeHtml(d.id)}" class="secondary-btn" type="button">${d.state==='paused'?'RESUME':'PAUSE'}</button></article>`).join(''):'<div class="owner-module-empty"><h3>None yet</h3><p>Add one when you are ready.</p></div>'}</div>`);
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
      const name=prompt('Product name'); if(!name?.trim())return;
      p.products=p.products||[]; p.products.push({id:slugifyProjectName(name)+'-'+Date.now().toString().slice(-5),name:name.trim(),published:false,characterLimit:null});
      await saveCompanies(); logActivity(p.id,'Owner added product',name.trim()); await renderOwnerModule(p,'products');
    });
    $$('[data-owner-product-save]').forEach(btn=>btn.addEventListener('click',async()=>{
      const pr=(p.products||[]).find(x=>x.id===btn.dataset.ownerProductSave); if(!pr)return;
      const name=document.querySelector(`[data-owner-product-name="${CSS.escape(pr.id)}"]`)?.value?.trim();
      const published=document.querySelector(`[data-owner-product-published="${CSS.escape(pr.id)}"]`)?.checked;
      if(name)pr.name=name; pr.published=!!published; await saveCompanies(); logActivity(p.id,'Owner updated product',pr.name); await renderOwnerModule(p,'products');
    }));
    $('ownerSavePricing')?.addEventListener('click',async()=>{
      const prices=String($('ownerPriceChoices')?.value||'').split(',').map(x=>Number(x.trim())).filter(x=>Number.isFinite(x)&&x>=0);
      if(!prices.length){alert('Enter at least one valid price.');return;}
      const next={...config,prices}; await setSetting(`businessConfig:${p.id}`,next); logActivity(p.id,'Owner updated pricing',prices.join(', '));
      if($('ownerPricingStatus'))$('ownerPricingStatus').textContent='Pricing saved.';
    });
    $('ownerSaveBranding')?.addEventListener('click',async()=>{
      const name=String($('ownerBrandName')?.value||'').trim(),subtitle=String($('ownerBrandSubtitle')?.value||'').trim();
      if(!name){alert('Business name is required.');return;}
      p.branding=p.branding||{}; p.branding.businessName=name; p.branding.subtitle=subtitle; await saveCompanies(); logActivity(p.id,'Owner updated branding',name);
      if($('ownerBrandingStatus'))$('ownerBrandingStatus').textContent='Branding saved.';
    });
    $('ownerCreateDeployment')?.addEventListener('click',async()=>{
      const name=prompt(moduleKey==='kiosks'?'Kiosk name':'Location / device name'); if(!name?.trim())return;
      const fresh={id:deploymentIdFor(p),name:name.trim(),profile:'kiosk_self_service',state:'draft',manifestVersion:1,idleMinutes:3,resetAfterComplete:true,purgeSession:true,showStartOver:true,resumeAfterReload:false,deviceLockVerified:false,capabilityScope:'project_default',attractTitle:'Ready when you are.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),lastCheckIn:null};
      migrateLegacyDeployment(p).push(fresh); await saveCompanies(); logActivity(p.id,'Owner added location/device',fresh.name); await renderOwnerModule(p,moduleKey);
    });
    $$('[data-owner-deploy-toggle]').forEach(btn=>btn.addEventListener('click',async()=>{
      const d=migrateLegacyDeployment(p).find(x=>x.id===btn.dataset.ownerDeployToggle); if(!d)return;
      d.state=d.state==='paused'?'draft':'paused'; d.updatedAt=new Date().toISOString(); await saveCompanies(); logActivity(p.id,'Owner changed deployment state',d.name); await renderOwnerModule(p,moduleKey);
    }));
    $('ownerAddStaff')?.addEventListener('click',async()=>{
      const name=prompt('Staff member name'); if(!name?.trim())return;
      const email=prompt('Staff member email (optional)','')||'',role=prompt('Role','Staff')||'Staff';
      p.ownerAccess.staff=p.ownerAccess.staff||[]; p.ownerAccess.staff.push({id:'STF-'+Date.now().toString(36),name:name.trim(),email:email.trim(),role:role.trim()||'Staff'});
      await saveCompanies(); logActivity(p.id,'Owner added staff member',name.trim()); await renderOwnerModule(p,'staff');
    });
    $$('[data-owner-staff-remove]').forEach(btn=>btn.addEventListener('click',async()=>{
      const member=(p.ownerAccess.staff||[]).find(x=>x.id===btn.dataset.ownerStaffRemove); if(!member)return;
      if(!confirm(`Remove ${member.name} from the staff list?`))return;
      p.ownerAccess.staff=(p.ownerAccess.staff||[]).filter(x=>x.id!==member.id); await saveCompanies(); logActivity(p.id,'Owner removed staff member',member.name); await renderOwnerModule(p,'staff');
    }));
    $('ownerSaveNotifications')?.addEventListener('click',async()=>{
      p.notifications=p.notifications||{}; p.notifications.customerConfirmationEmail=!!$('ownerConfirmationEmail')?.checked;
      await saveCompanies(); logActivity(p.id,'Owner updated notifications',p.notifications.customerConfirmationEmail?'enabled':'disabled');
      if($('ownerNotificationStatus'))$('ownerNotificationStatus').textContent='Notification settings saved.';
    });
    $('ownerChangePassword')?.addEventListener('click',async()=>{
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
          <p>For this test build, use the temporary login below. Before production, this becomes the owner's valid email address and chosen password.</p>
          <label>Email or login<input id="ownerClaimLogin" type="text" value="joe" autocomplete="username"></label>
          <label>Password<input id="ownerClaimPassword" type="password" value="4353" autocomplete="new-password"></label>
          <p class="owner-test-login-note">Test credentials: <strong>joe</strong> / <strong>4353</strong></p>
          <p id="ownerClaimPasswordError" class="owner-login-error"></p>
        </div>

        <p class="owner-claim-partner-note">Your business portal is designed to give you a clear, simple place to manage the tools and activity prepared for your business.</p>

        <button id="ownerClaimAccept" class="primary-btn" type="button">ACCEPT & OPEN MY BUSINESS PORTAL</button>
        <button id="ownerClaimCancel" class="secondary-btn" type="button">NOT NOW</button>
      </div>`;

      $('ownerClaimAccept')?.addEventListener('click',async()=>{
        const login=$('ownerClaimLogin')?.value||'';
        const password=$('ownerClaimPassword')?.value||'';
        const result=await claimOwnerAccess(projectId,token,login,password,{testMode:true});
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

  function bindEvents(){
    bindEngineFleetCommand();

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

    $('engineConfigureBtn')?.addEventListener('click',()=>{
      const dock=$('engineConfigurationDock'); if(!dock)return;
      dock.classList.remove('hidden');
      dock.scrollIntoView({behavior:'smooth',block:'start'});
    });
    $('engineConfigurationCloseBtn')?.addEventListener('click',()=>{
      $('engineConfigurationDock')?.classList.add('hidden');
      $('enginePanel')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
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
      setTimeout(()=>{if(pinLocked('admin'))showPinLock('admin','adminLockTimer','adminPinInput','unlockAdminBtn');else $('adminPinInput').focus()},50);
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
      if(window.pinLocked('engine')){window.showPinLock('engine','engineLockTimer','enginePinInput','unlockEngineBtn');return;}
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
        const row=window.recordBadPin('engine');
        if(row.lockedUntil>Date.now()) showPinLock('engine','engineLockTimer','enginePinInput','unlockEngineBtn');
        else $('enginePinInput').select();
        return;
      }
      clearPinFailures('engine');
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

    if($('addProjectBtn')) $('addProjectBtn').addEventListener('click',openAddProject);
    if($('closeProjectEngineControl')) $('closeProjectEngineControl').addEventListener('click',()=>{clearGraphicsTransientUi();$('projectEngineControl').classList.add('hidden');engineActiveProjectId=null;});
    if($('projectTabs')) $('projectTabs').addEventListener('click',e=>{const b=e.target.closest('[data-project-tab]');if(b&&engineActiveProjectId)renderProjectTab(engineActiveProjectId,b.dataset.projectTab);});
    if($('cancelAddProjectBtn')) $('cancelAddProjectBtn').addEventListener('click',()=>$('addProjectGate').classList.add('hidden'));
    if($('createProjectBtn')) $('createProjectBtn').addEventListener('click',createProject);
    if($('returnToEngineBtn')) $('returnToEngineBtn').addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      requestEngineFromProject();
    },true);
    $('editEngineNameBtn')?.addEventListener('click',()=>{
      if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Workshop Engine';
      $('engineIdentityStatus').textContent='';
      $('engineIdentitySavedView')?.classList.add('hidden');
      $('engineIdentityEditView')?.classList.remove('hidden');
      setTimeout(()=>$('engineNameSetting')?.focus(),40);
    });

    $('cancelEngineNameEditBtn')?.addEventListener('click',()=>{
      if($('engineNameSetting')) $('engineNameSetting').value=engineConfig.engineName||'Workshop Engine';
      $('engineIdentityStatus').textContent='';
      $('engineIdentityEditView')?.classList.add('hidden');
      $('engineIdentitySavedView')?.classList.remove('hidden');
    });

    $('saveEngineIdentityBtn')?.addEventListener('click',async()=>{
      const name=$('engineNameSetting')?.value.trim()||'Workshop Engine';
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
      const expected=String(await getEnginePin());
      if(entered!==expected && entered!==String(DEFAULT_ENGINE_PIN)){
        $('engineResetError').textContent='Incorrect Engine PIN.';
        $('engineResetPinInput').value='';
        $('engineResetPinInput').focus();
        return;
      }
      if(!confirm('Final confirmation: reset Engine and project settings to defaults? Saved orders will remain.')) return;
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
      $('engineResetPinInput').value='';
      $('engineResetGate').classList.add('hidden');
      $('engineStorageDetail').textContent='Engine settings reset to defaults. Saved orders were preserved.';
      await refreshEngineDiagnostics();
    });
    $('unlockAdminBtn').addEventListener('click',async()=>{
      if(pinLocked('admin')){showPinLock('admin','adminLockTimer','adminPinInput','unlockAdminBtn');return;}
      const entered=$('adminPinInput').value.trim();
      const expected=await getAdminPin();
      if(entered!==expected){
        const row=recordBadPin('admin');
        $('pinGateError').textContent='Incorrect PIN.';
        if(row.lockedUntil>Date.now()) showPinLock('admin','adminLockTimer','adminPinInput','unlockAdminBtn');
        else $('adminPinInput').select();
        return;
      }
      clearPinFailures('admin');
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
      await setSetting('adminPin',p);
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
    await loadEngineAppearance();
    db=await openDb();
    await loadFeatureSettings();
    await loadBusinessConfig();
    await loadCompanies();
    await purgeAllExpiredOwnerInvitations();
    await loadEngineConfig();
    bindEvents();
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

    // 5615 is guaranteed to work as the current/default Engine PIN for recovery.
    // If a configured PIN exists, it is accepted too.
    let configured='5615';
    try{
      if(window.BlackFlagAuth) configured=await window.BlackFlagAuth.expectedPin();
    }catch(_){ configured='5615'; }

    const valid = entered==='5615' || entered===String(configured);
    if(pinLocked('engine')){window.showPinLock('engine','blackFlagLockTimer','blackFlagEntryPin','blackFlagEntryUnlock');return;}
    if(!valid){
      const err=byId('blackFlagEntryError');
      if(err) err.textContent='Incorrect Engine PIN.';
      const row=window.recordBadPin('engine');
      if(row.lockedUntil>Date.now()) window.showPinLock('engine','blackFlagLockTimer','blackFlagEntryPin','blackFlagEntryUnlock');
      else if(input){ input.value=''; input.focus(); }
      return;
    }
    window.clearPinFailures('engine');

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
  migrateLegacyProjectAssets().catch(err=>console.warn('Graphics migration warning',err));

})();
