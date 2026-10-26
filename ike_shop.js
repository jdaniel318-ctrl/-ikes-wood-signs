/* Ike's Shopcraft — a distinct design request for review, never a production order. */
(function (g) {
  'use strict';
  if (!g.document || g.IkeShop) return;
  const BUILD='8.8.20.65',LIMIT=5*1024*1024;
  const core=()=>g.IkeShopCore,fonts=()=>g.IkeCarveFonts;
  const clone=value=>g.structuredClone?g.structuredClone(value):JSON.parse(JSON.stringify(value));
  const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}':JSON.stringify(value);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const size=bytes=>bytes<1024*1024?Math.max(1,Math.ceil(bytes/1024))+' KB':(bytes/(1024*1024)).toFixed(2)+' MiB';
  const node=(s,id)=>s.root.querySelector('#'+id);
  let current=null;
  function alive(s){try{return current===s&&!s.closed&&s.root.open&&s.parent.isConnected&&s.parent.getClientRects().length>0&&getComputedStyle(s.parent).visibility!=='hidden'&&s.options.guard()===true;}catch(_){return false;}}
  function assertLive(s){if(!alive(s))throw Object.assign(Error('The shop context changed. Reopen a fresh sign request to continue.'),{code:'AUTH'});}
  function canSend(s){try{return s.options.mode==='deployed'&&alive(s)&&typeof s.options.canSend==='function'&&s.options.canSend()===true;}catch(_){return false;}}
  function locked(s){return ['attempted','provider-accepted','unconfirmed'].includes(s.request.delivery.status);}
  function ceiling(s){return Math.min(LIMIT,Number.isFinite(s.config.maxBytes)&&s.config.maxBytes>0?s.config.maxBytes:LIMIT);}
  function status(s,message,tone='info'){if(current!==s||s.closed)return;node(s,'ishStatus').textContent=message;node(s,'ishStatus').dataset.tone=tone;}
  function revoke(s){for(const url of s.urls)URL.revokeObjectURL(url);s.urls=[];}
  function clearPackage(s){revoke(s);s.bundle=null;s.bundleRequest=null;s.handoff=null;s.shareReady=false;node(s,'ishPackage').hidden=true;node(s,'ishFiles').replaceChildren();}
  function invalidate(s){s.generation++;s.dirty=true;s.request.approval=null;s.request.proof=null;s.request.delivery={status:'not-sent'};s.approved=false;s.deliveryView=null;clearPackage(s);render(s);status(s,'Request changed. Check the updated design, details and photographs, then approve it again.');}
  function completeCheck(s){try{return core().validate(s.request,fonts(),{complete:true});}catch(e){return {ok:false,errors:[e.message||'Check the request details.']};}}
  function controls(s){
    if(current!==s||s.closed)return;
    const unavailable=s.busy||s.editing||!alive(s),frozen=locked(s),check=completeCheck(s);
    s.root.setAttribute('aria-busy',String(s.busy));
    s.root.querySelectorAll('button,input,textarea,select').forEach(n=>{n.disabled=unavailable||frozen||s.conflict;});
    node(s,'ishClose').disabled=false;node(s,'ishNewRequest').disabled=unavailable;
    node(s,'ishPhotoInput').disabled=unavailable||frozen||s.conflict||s.request.photos.length>=3;
    for(const id of ['ishCameraInput','ishTakePhoto','ishChoosePhoto'])node(s,id).disabled=node(s,'ishPhotoInput').disabled;
    node(s,'ishApproval').disabled=unavailable||frozen||s.conflict||!check.ok;
    node(s,'ishPrepare').disabled=unavailable||frozen||s.conflict||!check.ok||!s.approved||!!s.bundle;
    node(s,'ishPrepare').textContent=s.busy?'Working…':s.bundle?'Complete package ready':'Prepare complete package';
    node(s,'ishDownload').disabled=unavailable||s.conflict||!s.bundle;
    node(s,'ishSend').disabled=unavailable||frozen||s.conflict||!s.bundle||s.bundle.bytes.byteLength>ceiling(s)||!canSend(s);
    node(s,'ishSend').textContent=s.request.delivery.status==='failed'||s.request.delivery.status==='blocked'?'Try sending this request again':'Send request to Ike';
    node(s,'ishShare').disabled=unavailable||frozen||s.conflict||!s.handoff||!s.shareReady||!canSend(s);
    node(s,'ishMail').disabled=unavailable||frozen||s.conflict||!s.handoff||!canSend(s);
    node(s,'ishApproval').checked=s.approved;
    const errors=node(s,'ishValidation');errors.hidden=check.ok;errors.textContent=check.ok?'':check.errors.join(' ');
    node(s,'ishPhotoLimit').textContent=s.request.photos.length+' of 3 photographs added · one sign request';
  }
  function preview(s){
    const box=node(s,'ishDesignPreview'),design=s.request.design,layout=g.CarvewrightCore.layout(design,fonts());
    if(s.request.proof&&s.request.approval){const image=document.createElement('img');image.src=s.request.proof.dataUrl;image.alt='Frozen preview of the design approved for this request';box.replaceChildren(image);node(s,'ishProofState').textContent='Frozen approved preview — this exact image is in the ZIP.';}
    else if(s.request.board){const photo=s.request.photos.find(p=>p.id===s.request.board.photoId);try{box.innerHTML=g.BoardcraftPhoto.scene(design,photo,s.request.board,fonts()).svg;node(s,'ishProofState').textContent=s.request.board.frameConfirmed?'Your board and your design · Ike confirms the final dimensions.':'Your board · open the editor to place your words where you want them.';}catch(_){box.textContent='Open the editor to adjust the layout area on your board.';node(s,'ishProofState').textContent='The board layout needs another look.';}}
    else if(layout.ok&&!layout.blank){box.innerHTML=g.CarvewrightCore.toSvg(design,fonts());node(s,'ishProofState').textContent='Layout on a reference blank. Add your own board photograph to see it on your wood.';}
    else{box.innerHTML='<div class="ish-empty"><span aria-hidden="true">Aa</span><strong>Make your sign</strong><p>Add lettering and graphics, then set your requested size.</p></div>';node(s,'ishProofState').textContent='Your design will appear here.';}
    const stock=design.stock,inch=n=>Number((n/25.4).toFixed(2));
    node(s,'ishSpecs').textContent='Reference layout: '+inch(stock.widthMm)+' × '+inch(stock.heightMm)+' in. Ike confirms your actual board size and thickness before making it.';
    box.classList.toggle('ish-has-photo',!!s.request.board);
    node(s,'ishEditDesign').textContent=layout.ok&&!layout.blank?'Edit sign design':'Create sign design';
  }
  function photos(s){
    const list=node(s,'ishPhotoList');list.replaceChildren();
    for(const photo of s.request.photos){
      const selected=s.request.board?.photoId===photo.id,card=document.createElement('article'),image=document.createElement('img'),copy=document.createElement('div'),name=document.createElement('strong'),meta=document.createElement('span'),actions=document.createElement('div'),remove=document.createElement('button');
      card.className='ish-photo';image.src=photo.dataUrl;image.alt=(selected?'Your board: ':'Additional reference: ')+photo.originalName;name.textContent=selected?'Your board':photo.originalName;meta.textContent=selected?'Used in your sign preview':'Additional reference picture';remove.type='button';remove.dataset.photoRemove=photo.id;remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+photo.originalName);copy.append(name,meta);actions.className='ish-photo-actions';
      if(!selected){const use=document.createElement('button');use.type='button';use.dataset.photoBoard=photo.id;use.textContent='Use as my board';actions.append(use);}actions.append(remove);card.append(image,copy,actions);list.append(card);
    }
  }
  function deliveryText(s){
    const result=s.deliveryView||s.request.delivery;
    if(result.status==='provider-accepted')return 'The email provider accepted the complete request package. Inbox receipt is not yet confirmed. Ike will review the wood and machine setup before accepting production.';
    if(result.status==='unconfirmed')return 'Delivery is unconfirmed. The provider may already have received this request. Check with Ike before sending another copy. Your complete package is still available to download.';
    if(result.status==='attempted')return 'This request has a recorded send attempt. Keep this page open for the result. If the result cannot be confirmed, check with Ike before sending another copy.';
    if(result.status==='failed'||result.status==='blocked')return result.message||'This request was not accepted by the email provider. You can download the complete package or deliberately try sending again.';
    if(s.options.mode!=='deployed')return (s.options.mode==='sea_trial'?'Sea Trial':'Private Preview')+' — this request stays in memory and cannot send email.';
    if(s.bundle&&s.bundle.bytes.byteLength>ceiling(s))return 'This complete package is larger than the '+size(ceiling(s))+' direct-email attachment limit. Use the complete ZIP with Mail, or download it to attach yourself.';
    if(!canSend(s))return 'Sending is unavailable in this shop context. You can keep the complete package by downloading it.';
    return 'Send one complete ZIP with your approved preview, board pictures, sign details and editable artwork. Ike reviews it before production.';
  }
  function packageView(s){
    const section=node(s,'ishPackage');section.hidden=!s.bundle;if(!s.bundle)return;
    node(s,'ishPackageMeta').textContent=s.bundle.name+' · '+size(s.bundle.bytes.byteLength)+' · saved request revision '+s.bundleRequest.revision;
    node(s,'ishRecipient').textContent='Intended recipient: '+(s.config.recipient||'Not configured');
    node(s,'ishPackageSummary').textContent=s.request.customer.name+' · '+[s.request.customer.email,s.request.customer.phone].filter(Boolean).join(' · ')+' · Quantity '+s.request.details.quantity+' · Finish: '+s.request.details.finish;
    node(s,'ishPackageNotes').textContent=s.request.details.notes||'No additional notes.';
    const list=node(s,'ishFiles');list.replaceChildren();for(const file of s.bundle.files){const row=document.createElement('li'),name=document.createElement('span'),bytes=document.createElement('span');name.textContent=file.name;bytes.textContent=size(file.bytes.byteLength);row.append(name,bytes);list.append(row);}
    node(s,'ishPackageHash').textContent='Archive SHA-256: '+s.bundle.sha256;
  }
  function render(s){if(current!==s||s.closed)return;s.root.dataset.requestId=s.request.id;preview(s);photos(s);packageView(s);node(s,'ishDelivery').textContent=deliveryText(s);node(s,'ishDelivery').dataset.state=(s.deliveryView||s.request.delivery).status;controls(s);}
  function fields(s){for(const [id,value]of Object.entries({ishName:s.request.customer.name,ishEmail:s.request.customer.email,ishPhone:s.request.customer.phone,ishQuantity:s.request.details.quantity,ishFinish:s.request.details.finish,ishNotes:s.request.details.notes}))node(s,id).value=value;node(s,'ishPhotoInput').value='';node(s,'ishCameraInput').value='';}
  async function run(s,action){
    if(s.busy||s.editing)return;try{assertLive(s);}catch(_){close(true);return;}
    s.busy=true;controls(s);let generation=s.generation;
    const valid=()=>{assertLive(s);if(s.generation!==generation)throw Object.assign(Error('The request changed before this action completed.'),{code:'STALE'});};
    valid.acceptContentChange=()=>{assertLive(s);generation=s.generation;};
    try{await action(valid,generation);valid();}
    catch(error){if(current===s&&!s.closed){if(error.code==='AUTH'||!alive(s))close(true);else{if(error.code==='CONFLICT'||error.code==='STALE'){s.conflict=true;s.approved=false;s.request.approval=null;s.request.proof=null;clearPackage(s);render(s);}status(s,error.code==='CONFLICT'?'A newer or changed request was saved. This package is blocked. Start a fresh request to continue.':error.message||'This action could not be completed.','error');}}}
    finally{if(current===s&&!s.closed){s.busy=false;controls(s);}}
  }
  function saved(s,request){s.request=request;s.savedSignature=canonical(request);s.dirty=false;}
  async function recheck(s,valid){
    if(!s.bundle||!s.bundleRequest||!s.savedSignature)throw Error('Prepare a complete package first.');
    const latest=await s.store.load(s.request.id);valid();
    if(!latest||latest.revision!==s.request.revision||canonical(latest)!==s.savedSignature)throw Object.assign(Error('The saved request revision changed.'),{code:'CONFLICT'});
    if(!await core().approvalMatches(latest,fonts()))throw Object.assign(Error('The approved request content changed.'),{code:'STALE'});valid();
    const fingerprint=await core().fingerprint(latest,fonts());valid();
    if(fingerprint!==s.bundle.manifest.contentFingerprint||!await core().verifyPackage(s.bundleRequest,s.bundle,fonts()))throw Object.assign(Error('The package no longer matches the reviewed request.'),{code:'STALE'});valid();return latest;
  }
  async function prepare(s,valid){
    if(locked(s)||s.conflict||!s.approved)throw Error('Review and approve this request before preparing the package.');const check=completeCheck(s);if(!check.ok)throw Error(check.errors.join(' '));
    const reviewed=await core().review(clone(s.request),fonts());valid();
    const request=await s.store.save(reviewed,s.request.revision);valid();saved(s,request);
    const bundle=await core().buildPackage(clone(request),fonts());valid();s.bundle=bundle;s.bundleRequest=clone(request);await prepareHandoff(s,valid);valid();render(s);status(s,'Complete package ready. Send it to Ike, share the ZIP with Mail, or keep a download.','success');node(s,'ishPackage').scrollIntoView({block:'start',behavior:'smooth'});
  }
  async function prepareHandoff(s,valid){
    s.handoff=null;s.shareReady=false;if(!canSend(s)||locked(s)||!s.bundle)return;
    const request=s.request,bundle=s.bundle,bundleRequest=s.bundleRequest,generation=s.generation;
    const ticket=await g.IkeShopDelivery.prepareHandoff({request:bundleRequest,bundle,config:s.config,guard:()=>alive(s)&&s.request===request&&s.bundle===bundle&&s.bundleRequest===bundleRequest&&s.generation===generation,canSend:()=>canSend(s)});
    valid();s.handoff=ticket;s.shareReady=ticket.canShare();
  }
  function useEditor(s){
    if(s.busy||s.editing||locked(s)||s.conflict)return;assertLive(s);s.editing=true;controls(s);
    const photo=s.request.board&&s.request.photos.find(p=>p.id===s.request.board.photoId);
    try{const opened=g.CarvewrightStudio.openEmbedded({draft:clone(s.request.design),...(photo?{boardPhoto:{photo:clone(photo),board:clone(s.request.board)}}:{}),parent:s.root,guard:()=>alive(s),onUse:(design,board)=>{assertLive(s);const check=g.CarvewrightCore.validate(design,fonts());if(!check.ok)throw Error(check.errors.join(' '));if(photo){const b=g.BoardcraftPhoto.validate(design,photo,board,fonts(),{requireConfirmed:true});if(!b.ok)throw Error(b.errors.join(' '));}const nextBoard=photo?board:null;if(canonical(design)!==canonical(s.request.design)||canonical(nextBoard)!==canonical(s.request.board)){s.request.design=clone(design);s.request.board=nextBoard?clone(nextBoard):null;invalidate(s);}},onClose:()=>{s.editing=false;if(alive(s)){render(s);node(s,'ishEditDesign').focus({preventScroll:true});}}});if(opened===false){s.editing=false;controls(s);}}
    catch(error){s.editing=false;controls(s);throw error;}
  }
  async function addPhotos(s,files,valid){
    if(locked(s)||s.conflict)return;if(s.request.photos.length+files.length>3)throw Error('Keep at most three reference photographs. Remove a photograph before adding another.');
    const added=[];for(const file of files){if(file.size>10*1024*1024)throw Error('Each original photograph must be 10 MiB or smaller.');const photo=await core().normalizePhoto(file);valid();added.push(photo);}valid();s.request.photos.push(...added);if(!s.request.board&&added.length)s.request.board=g.BoardcraftPhoto.createBoard(s.request.design,added[0]);invalidate(s);valid.acceptContentChange();status(s,'Your photo is ready. Open the sign editor to add your words and place the design on your board.');
  }
  async function download(s,valid){
    await recheck(s,valid);valid();revoke(s);const url=URL.createObjectURL(new Blob([s.bundle.bytes],{type:'application/zip'}));s.urls.push(url);const link=document.createElement('a');link.href=url;link.download=s.bundle.name;link.rel='noopener';link.hidden=true;
    link.addEventListener('click',event=>{try{valid();}catch(_){event.preventDefault();}});s.root.append(link);valid();link.click();link.remove();status(s,'Complete ZIP download started. Keep this file as your copy of the request.','success');
  }
  async function send(s,valid,generation){
    if(locked(s)||s.conflict)return;if(!canSend(s))throw Error('Sending is unavailable in this shop context.');if(!s.bundle||s.bundle.bytes.byteLength>ceiling(s))throw Error('The complete package must fit the email attachment limit.');
    await recheck(s,valid);valid();
    const attempt=clone(s.request);attempt.delivery={status:'attempted',attemptId:g.crypto.randomUUID(),attemptedAt:new Date().toISOString(),recipient:s.config.recipient};
    const attempted=await s.store.save(attempt,s.request.revision);valid();saved(s,attempted);render(s);
    // Bookkeeping is a new saved revision. Rebuild its archive without changing approved content.
    const bundle=await core().buildPackage(clone(s.request),fonts());valid();s.bundle=bundle;s.bundleRequest=clone(s.request);render(s);await recheck(s,valid);valid();
    let result;
    try{result=await g.IkeShopDelivery.send({request:clone(s.request),bundle:s.bundle,config:clone(s.config),guard:()=>alive(s)&&s.generation===generation,canSend:()=>canSend(s)});}
    catch(_){result={status:'unconfirmed',message:'The send result could not be confirmed. Check with Ike before sending again.',attemptId:attempt.delivery.attemptId,packageSha256:s.bundle.sha256,recipient:s.config.recipient};}
    valid();s.deliveryView=clone(result);render(s);
    const finished=clone(s.request);finished.delivery={status:result.status,attemptedAt:attempt.delivery.attemptedAt};for(const key of ['message','attemptId','providerAcceptedAt','packageSha256','recipient'])if(result[key]!==undefined)finished.delivery[key]=result[key];
    const recorded=await s.store.save(finished,s.request.revision);valid();saved(s,recorded);s.deliveryView=null;
    if(['failed','blocked'].includes(result.status)){s.bundle=await core().buildPackage(clone(recorded),fonts());valid();s.bundleRequest=clone(recorded);await prepareHandoff(s,valid);valid();}
    render(s);status(s,deliveryText(s),result.status==='provider-accepted'?'success':result.status==='failed'||result.status==='blocked'?'error':'info');
  }
  function input(s,event){
    if(s.busy||s.editing||locked(s)||s.conflict||!alive(s))return;const target=event.target;
    if(target.id==='ishApproval'){s.approved=target.checked;if(!s.approved){s.request.approval=null;s.request.proof=null;clearPackage(s);s.generation++;}render(s);return;}
    const contact={ishName:'name',ishEmail:'email',ishPhone:'phone'},details={ishFinish:'finish',ishNotes:'notes'};
    if(contact[target.id])s.request.customer[contact[target.id]]=target.value;
    else if(details[target.id])s.request.details[details[target.id]]=target.value;
    else if(target.id==='ishQuantity')s.request.details.quantity=target.value.trim()===''?NaN:Number(target.value);
    else return;invalidate(s);
  }
  async function click(s,event){
    const button=event.target.closest('button');if(!button||!s.root.contains(button))return;
    if(button.id==='ishClose'){close();return;}if(s.busy||s.editing)return;if(!alive(s)){close(true);return;}
    if(button.id==='ishNewRequest'){if((s.dirty||s.bundle||locked(s))&&!g.confirm('Start a fresh request? Download the current complete package first if you need a copy. The new request will have blank contact details and no photographs.'))return;clearPackage(s);s.request=core().createRequest();s.savedSignature=null;s.approved=false;s.deliveryView=null;s.dirty=false;s.conflict=false;s.generation++;fields(s);render(s);status(s,'A fresh sign request is ready.');node(s,'ishTitle').focus({preventScroll:true});return;}
    if(locked(s)&&button.id!=='ishDownload')return;
    if(button.id==='ishTakePhoto'){node(s,'ishCameraInput').click();return;}
    if(button.id==='ishChoosePhoto'){node(s,'ishPhotoInput').click();return;}
    if(button.id==='ishMail'){
      try{if(!canSend(s)||!s.handoff)throw Error('Prepare the complete package in Ike’s live shop first.');const uri=s.handoff.mailto();status(s,'Email draft requested. Attach '+s.bundle.name+' from your downloads, check Ike’s address and send it in Mail.');g.location.href=uri;}catch(error){status(s,error.message,'error');}return;
    }
    if(button.id==='ishShare'){
      if(!canSend(s)||!s.handoff)return;
      const ticket=s.handoff;s.busy=true;controls(s);
      try{
        // Native sharing must start in this tap, before any asynchronous work.
        // Package verification happened when this immutable ticket was prepared.
        const pending=ticket.share(),result=await pending;
        if(alive(s)&&s.handoff===ticket)status(s,result.message,result.status==='blocked'?'error':'info');
      }catch(error){if(alive(s))status(s,error.message||'Sharing could not open. Download the ZIP and attach it in Mail.','error');}
      finally{if(alive(s)){s.busy=false;controls(s);}}return;
    }
    if(button.id==='ishEditDesign'){try{useEditor(s);}catch(error){status(s,error.message,'error');}return;}
    if(button.dataset.photoBoard){const photo=s.request.photos.find(p=>p.id===button.dataset.photoBoard);if(photo){s.request.board=g.BoardcraftPhoto.createBoard(s.request.design,photo);invalidate(s);status(s,'This is now your board photograph. Open the editor to position your design.');}return;}
    if(button.dataset.photoRemove){const primary=s.request.board?.photoId===button.dataset.photoRemove;s.request.photos=s.request.photos.filter(photo=>photo.id!==button.dataset.photoRemove);if(primary)s.request.board=s.request.photos[0]?g.BoardcraftPhoto.createBoard(s.request.design,s.request.photos[0]):null;invalidate(s);return;}
    await run(s,(valid,generation)=>button.id==='ishPrepare'?prepare(s,valid):button.id==='ishDownload'?download(s,valid):button.id==='ishSend'?send(s,valid,generation):undefined);
  }
  function shell(){return `<div class="ish-shell"><header class="ish-header"><div class="ish-brand"><img class="ish-ike-character" src="ike_character.png" width="48" height="66" alt="Ike’s Wood Signs"><div><span class="ish-eyebrow">IKE’S WOOD SIGNS</span><h1 id="ishTitle" tabindex="-1">Your custom sign</h1></div></div><div class="ish-header-actions"><button id="ishNewRequest" type="button">New request</button><button id="ishClose" type="button" aria-label="Close sign request">Close</button></div></header>
    <main class="ish-main"><section class="ish-intro"><span class="ish-review-badge">MADE PERSONAL. REVIEWED BY IKE.</span><h2>Start with your board. Make the words your own.</h2><p>Photograph the piece of wood you have chosen, then try your words, lettering and artwork on it. Ike gets your complete design to review, refine and make.</p></section>
    <div class="ish-workgrid"><div class="ish-art-column">
    <section id="ishPhotoSection" class="ish-card"><div class="ish-section-heading"><span class="ish-step">1</span><h2>Your piece of wood</h2></div><p class="ish-note">Take a straight-on photo with the whole board in view. Its grain, knots and edges stay visible while you design.</p><div class="ish-photo-buttons"><button id="ishTakePhoto" class="ish-primary" type="button">Take a photo of my board</button><button id="ishChoosePhoto" type="button">Choose my own photo</button></div><input id="ishCameraInput" type="file" accept="image/*" capture="environment" aria-label="Take a photo of this board" hidden><input id="ishPhotoInput" type="file" accept="image/*" multiple aria-label="Choose my own photographs" hidden><span id="ishPhotoLimit" class="ish-caption"></span><div id="ishPhotoList" class="ish-photo-list"></div><p class="ish-note">You can add two more pictures for Ike. This request starts fresh with your photos.</p></section>
    <section id="ishDesignSection" class="ish-card"><div class="ish-section-heading"><span class="ish-step">2</span><h2>Make it yours</h2></div><div id="ishDesignPreview" class="ish-design-preview"></div><p id="ishProofState" class="ish-caption"></p><p id="ishSpecs" class="ish-specs"></p><button id="ishEditDesign" class="ish-primary ish-wide" type="button">Create sign design</button><p class="ish-note">Try your own words, lettering, colors and graphics. Move the layout to suit your board; Ike confirms the finished size.</p></section></div>
    <section class="ish-card ish-details"><div class="ish-section-heading"><span class="ish-step">3</span><h2>How can Ike reach you?</h2></div><p class="ish-note">Leave your name and an email address or phone number so Ike can follow up.</p><label for="ishName">Your name<input id="ishName" maxlength="160" autocomplete="off" data-bf-trim="preserve"></label><label for="ishEmail">Email address<input id="ishEmail" type="email" maxlength="254" autocomplete="off" autocapitalize="off" inputmode="email" data-bf-trim="preserve"></label><label for="ishPhone">Phone number<input id="ishPhone" type="tel" maxlength="80" autocomplete="off" inputmode="tel" data-bf-trim="preserve"></label><div class="ish-two-fields"><label for="ishQuantity">Quantity<input id="ishQuantity" type="number" min="1" max="100" step="1" inputmode="numeric"></label><label for="ishFinish">Requested finish<input id="ishFinish" maxlength="120" autocomplete="off" data-bf-trim="preserve"></label></div><label for="ishNotes">Anything Ike should know?<textarea id="ishNotes" rows="5" maxlength="4000" placeholder="Wood preferences, mounting, timing or other details…" data-bf-trim="preserve"></textarea></label><p class="ish-note">One sign is all you need to start. Quantity is for additional copies of this design.</p></section></div>
    <section class="ish-card ish-approval"><div class="ish-section-heading"><span class="ish-step">4</span><h2>Review your sign</h2></div><p id="ishValidation" class="ish-validation" role="status"></p><label class="ish-check" for="ishApproval"><input id="ishApproval" type="checkbox"><span>I checked my words, layout, details and pictures. I’m ready for Ike to review this design and confirm the wood, size and price.</span></label><button id="ishPrepare" class="ish-primary" type="button">Prepare complete package</button></section>
    <section id="ishPackage" class="ish-card ish-package" hidden aria-labelledby="ishPackageTitle"><div class="ish-section-heading"><span class="ish-step">5</span><h2 id="ishPackageTitle">Ready for Ike</h2></div><p id="ishPackageMeta" class="ish-package-meta"></p><strong id="ishRecipient" class="ish-recipient"></strong><p id="ishPackageSummary"></p><p id="ishPackageNotes" class="ish-package-notes"></p><details class="ish-file-details"><summary>Your pictures, sign information and editable artwork</summary><ul id="ishFiles" class="ish-files"></ul></details><p class="ish-note">Your ZIP includes the exact preview, photos, request details, editable design and SVG/DXF artwork. Ike can adjust the design, confirm the size and create the cutting program for his machine.</p><p id="ishPackageHash" class="ish-hash"></p><div class="ish-package-actions"><button id="ishSend" class="ish-primary" type="button">Send request to Ike</button><button id="ishDownload" type="button">Download complete ZIP</button></div><div class="ish-mail-handoff"><h3>Send the complete file with Mail</h3><p id="ishMailHelp" class="ish-note">Share the ZIP, choose Mail and address it to Ike. Or download the ZIP, open the addressed email below and attach that file yourself. Opening an email draft does not add an attachment.</p><div class="ish-package-actions"><button id="ishShare" type="button">Share ZIP with Mail…</button><button id="ishMail" type="button">Open email to Ike…</button></div><p class="ish-note">If your device does not offer file sharing, use Download complete ZIP. Finish sending in your mail app.</p></div></section>
    <p id="ishDelivery" class="ish-delivery" role="status"></p></main><footer class="ish-footer"><p id="ishStatus" role="status" aria-live="polite">Start with your board photo, then make your sign your own.</p></footer></div>`;}
  function open(options){
    if(!options||options.scope?.projectId!=='ikes-wood-signs'||typeof options.guard!=='function'||options.guard()!==true||!['deployed','preview','sea_trial'].includes(options.mode))throw Error('Open a sign request from Ike’s shop.');
    if(!core()?.createRequest||!g.IkeShopStore?.create||!g.IkeShopDelivery?.send||!g.IkeShopDelivery?.prepareHandoff||!g.BoardcraftPhoto?.scene||!g.CarvewrightStudio?.openEmbedded||!g.CarvewrightPortable||!fonts())throw Error('The sign request files are incomplete. Reload the complete release.');
    const parent=options.parent||document.body;if(!parent.isConnected)throw Error('The shop is no longer open.');if(current&&!close())return false;
    const root=document.createElement('dialog');root.id='ikeShop';root.className='ish-modal';root.setAttribute('aria-labelledby','ishTitle');root.innerHTML=shell();document.body.append(root);
    const s={root,parent,options:{...options,scope:clone(options.scope)},config:clone(options.deliveryConfig||{}),request:core().createRequest(),origin:document.activeElement,store:null,bundle:null,bundleRequest:null,handoff:null,shareReady:false,savedSignature:null,deliveryView:null,approved:false,dirty:false,conflict:false,busy:false,editing:false,closed:false,generation:0,urls:[],timer:null};current=s;root.showModal();
    try{s.store=g.IkeShopStore.create({scope:s.options.scope,guard:()=>{assertLive(s);return true;},memoryOnly:options.mode!=='deployed'});}catch(error){close(true);throw error;}
    root.addEventListener('input',event=>{event.stopPropagation();input(s,event);});root.addEventListener('click',event=>{event.stopPropagation();click(s,event);});
    root.addEventListener('change',event=>{event.stopPropagation();if(!['ishPhotoInput','ishCameraInput'].includes(event.target.id)||s.busy||s.editing||locked(s)||!alive(s))return;const input=event.target,files=Array.from(input.files||[]);if(files.length)run(s,valid=>addPhotos(s,files,valid)).finally(()=>{if(alive(s))input.value='';});});
    root.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();close();});root.addEventListener('close',()=>{if(current===s)close(true);});
    fields(s);render(s);node(s,'ishTitle').focus({preventScroll:true});s.timer=setInterval(()=>{if(!alive(s))close(true);else controls(s);},400);return true;
  }
  function close(force=false){
    const s=current;if(!s)return true;
    if(!force&&s.busy&&!g.confirm('Close this request? If sending has started, it may already have reached the email provider. Keep this page open to see the result.'))return false;
    if(!force&&!s.busy&&(s.dirty||s.bundle)&&s.request.delivery.status!=='provider-accepted'&&!g.confirm('Close this request? Download its complete package first if you need a copy. The next request starts with blank details and no pictures.'))return false;
    s.closed=true;s.generation++;clearInterval(s.timer);if(s.editing)g.CarvewrightStudio.close(true);s.store?.close();revoke(s);s.bundle=null;s.bundleRequest=null;s.handoff=null;s.request=null;current=null;if(s.root.open)s.root.close();s.root.remove();if(s.origin?.isConnected)s.origin.focus({preventScroll:true});if(typeof s.options.onClose==='function')s.options.onClose();return true;
  }
  g.addEventListener('focus',()=>{if(current&&!alive(current))close(true);});
  g.addEventListener('beforeunload',event=>{if(current&&(current.dirty||current.request.delivery.status==='attempted')){event.preventDefault();event.returnValue='';}});
  g.IkeShop=Object.freeze({build:BUILD,open,close,isOpen:()=>!!current&&alive(current)});
})(typeof window!=='undefined'?window:globalThis);
