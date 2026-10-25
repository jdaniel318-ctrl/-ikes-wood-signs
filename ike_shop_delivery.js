/* One complete ZIP, one guarded submission. No text-only downgrade or retry.
 * Provider acknowledgement is not evidence of delivery to Ike's inbox. */
(function(root,factory){
  'use strict';
  const api=factory(root,typeof module==='object'&&module.exports?require('./ike_shop_core.js'):root.IkeShopCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.IkeShopDelivery=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root,Core){
  'use strict';
  const ENDPOINT='https://api.web3forms.com/submit',TIMEOUT_MS=15000,inFlight=new Set(),outcomes=new Map();
  function sameBytes(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
  function samePackage(a,b){return a.name===b.name&&a.sha256===b.sha256&&JSON.stringify(a.manifest)===JSON.stringify(b.manifest)&&sameBytes(a.bytes,b.bytes)&&a.files.length===b.files.length&&a.files.every((f,i)=>{const g=b.files[i];return f.name===g.name&&f.mime===g.mime&&f.sha256===g.sha256&&sameBytes(f.bytes,g.bytes);});}
  function allowed(guard,canSend){
    if(typeof guard!=='function'||typeof canSend!=='function')return false;
    try{return guard()===true&&canSend()===true;}catch(_){return false;}
  }
  function remember(key,status){outcomes.set(key,status);while(outcomes.size>64)outcomes.delete(outcomes.keys().next().value);}
  function summary(r,b,attemptId,recipient){
    const s=r.design.stock;
    return ["Ike's Wood Signs — sign design request",'Ike reviews before production. This request is not an accepted production order.','', 'Request: '+r.id,'Saved revision: '+r.revision,'Attempt: '+attemptId,'Customer: '+r.customer.name,'Email: '+(r.customer.email||'Not supplied'),'Phone: '+(r.customer.phone||'Not supplied'),'Design: '+r.design.title,'Quantity: '+r.details.quantity,'Requested finish: '+r.details.finish,'Requested blank: '+s.widthMm+' × '+s.heightMm+' × '+s.thicknessMm+' mm','Requested species: '+s.species,'Reference photographs: '+r.photos.length,'','Customer notes:',r.details.notes||'No additional notes.','','Customer-approved layout: '+r.approval.approvedAt,'Content fingerprint: '+b.manifest.contentFingerprint,'Complete attachment: '+b.name,'ZIP SHA-256: '+b.sha256,'Intended shop recipient: '+recipient,'','The ZIP contains the frozen PNG preview, every normalized reference photograph, HTML/text brief, outlined SVG, millimeter DXF, editable design and checksum manifest. Extract it before opening the HTML brief.','Pictures are references, not calibrated measurements. Ike confirms actual material and machine setup before production. No universal executable CNC program is included.'].join('\n');
  }
  async function prepareHandoff(options){
    if(!options||typeof options!=='object')throw Error('Prepare the complete saved request before opening an email handoff.');
    // Verify private copies now; the final user tap must not wait on hashing or ZIP creation.
    const request=Core.clone(options.request),bundle=Core.copyPackage(options.bundle),config=Core.clone(options.config);
    if(!Core.emailValid(config?.recipient))throw Error('The intended shop recipient is missing or invalid. Keep the complete ZIP.');
    if(request.projectId!=='ikes-wood-signs'||!Number.isSafeInteger(request.revision)||request.revision<1||request.design?.revision!==request.revision)throw Error('Save the current Ike request before preparing its email handoff.');
    const valid=Core.validate(request,undefined,{complete:true});
    if(!valid.ok)throw Error('The request is incomplete or changed. Prepare its complete package again.');
    if(request.delivery.recipient!==undefined&&request.delivery.recipient!==config.recipient)throw Error('The intended recipient changed after this request was prepared. Prepare it again.');
    const initialRequest=JSON.stringify(request),initialConfig=JSON.stringify(config),contentKey=request.id+':'+request.approval?.contentFingerprint;
    function assertCurrent(){
      if(!allowed(options.guard,options.canSend))throw Error('Email handoff is available only from the active live Ike shop.');
      if(['attempted','provider-accepted','unconfirmed'].includes(request.delivery.status)||inFlight.has(request.id)||outcomes.has(contentKey))throw Error('This request has an active, accepted or unconfirmed attempt. Check with Ike before sending another copy.');
      if(JSON.stringify(Core.clone(options.request))!==initialRequest||JSON.stringify(Core.clone(options.config))!==initialConfig||!samePackage(bundle,Core.copyPackage(options.bundle)))throw Error('The request, recipient or complete ZIP changed. Prepare the current package again.');
    }
    assertCurrent();
    if(!await Core.verifyPackage(request,bundle))throw Error('The complete ZIP does not match the saved request, approved design or required pictures. Prepare it again.');
    assertCurrent();
    const file=typeof root.File==='function'?new root.File([bundle.bytes],bundle.name,{type:'application/zip'}):null;
    const navigator=options.navigatorImpl===undefined?root.navigator:options.navigatorImpl;
    const subject="Ike's sign request — "+request.design.title+' — '+request.id;
    const body=['Sign request: '+request.id,'Design: '+request.design.title,'Ike reviews before production.','','Attach the downloaded complete ZIP before sending:',bundle.name,'','This draft does not attach the ZIP automatically.','ZIP SHA-256: '+bundle.sha256].join('\r\n');
    const uri='mailto:'+encodeURIComponent(config.recipient).replace(/%40/g,'@')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    const result=(status,message)=>Object.freeze({status,message,recipient:config.recipient,packageSha256:bundle.sha256,filename:bundle.name});
    function supported(){
      try{return !!file&&typeof navigator?.canShare==='function'&&typeof navigator?.share==='function'&&navigator.canShare({files:[file]})===true;}catch(_){return false;}
    }
    function canShare(){try{assertCurrent();const yes=supported();assertCurrent();return yes;}catch(_){return false;}}
    function mailto(){assertCurrent();return uri;}
    function share(){
      try{
        assertCurrent();const yes=supported();assertCurrent();
        if(!yes)return Promise.resolve(result('unavailable','This device cannot share this ZIP directly. Download the complete package, then attach it to the email draft.'));
        const failed=error=>error?.name==='AbortError'?result('cancelled','Sharing was cancelled. The complete ZIP remains available.'):result('unavailable','The device did not confirm a handoff. Check your mail app before trying again; the complete ZIP remains available.');
        inFlight.add(request.id);
        let handoff;
        // Deliberately synchronous: preserve the final tap's transient user activation.
        try{handoff=navigator.share({files:[file],title:subject,text:'Choose Mail and send this complete ZIP to '+config.recipient+'. Sign request: '+request.id+'.'});}
        catch(error){inFlight.delete(request.id);return Promise.resolve(failed(error));}
        return Promise.resolve(handoff).then(()=>result('handed-off','The complete ZIP was handed to your chosen app. Choose Mail and send it to '+config.recipient+'. Email sending and inbox receipt are not confirmed.'),failed).finally(()=>inFlight.delete(request.id));
      }catch(error){return Promise.resolve(result('blocked',String(error?.message||'The request changed. Prepare the complete package again.')));}
    }
    return Object.freeze({canShare,mailto,share});
  }
  async function send(options){
    let request,bundle,config,lock,contentKey,dispatched=false;
    const base={attemptId:'',packageSha256:'',recipient:''};
    const result=(status,message,extra)=>Object.assign({},base,{status,message},extra||{});
    try{
      if(!options||typeof options!=='object')return result('blocked','The complete saved request and delivery context are required.');
      // Snapshot before the first await; edits cannot switch the attachment while it is checked.
      request=Core.clone(options.request);config=Core.clone(options.config);
      if(Core.attemptIdValid(request.delivery?.attemptId))base.attemptId=request.delivery.attemptId;
      if(Core.emailValid(config?.recipient))base.recipient=config.recipient;
      if(!allowed(options.guard,options.canSend))return result('blocked','Sending is available only from the active deployed Ike shop.');
      if(!Core.emailValid(config?.recipient))return result('blocked','The shop recipient is missing or invalid. Keep the package and ask the shop owner to confirm delivery settings.');
      if(typeof config.accessKey!=='string'||!config.accessKey.trim()||config.accessKey.length>512||/[\u0000-\u0020\u007f]/.test(config.accessKey))return result('blocked','The shop delivery service is not configured. Keep the complete package.');
      if(config.maxBytes!==undefined&&(!Number.isSafeInteger(config.maxBytes)||config.maxBytes<1))return result('blocked','The delivery attachment limit is invalid.');
      const maxBytes=Math.min(Core.limits.transportBytes,config.maxBytes===undefined?Core.limits.transportBytes:config.maxBytes);
      bundle=Core.copyPackage(options.bundle);base.packageSha256=bundle.sha256;
      if(bundle.bytes.length>maxBytes)return result('blocked','The complete ZIP exceeds the delivery attachment limit. Download the package and reduce its photographs or artwork before another review.');
      if(request.projectId!=='ikes-wood-signs'||!Number.isSafeInteger(request.revision)||request.revision<1||request.design?.revision!==request.revision)return result('blocked','Save the current Ike request before sending its complete package.');
      if(['provider-accepted','unconfirmed'].includes(request.delivery?.status))return result('blocked','This request was already accepted by the provider or has an unconfirmed attempt. Check with Ike before sending it again.');
      if(request.delivery?.status!=='attempted'||!Core.attemptIdValid(request.delivery.attemptId))return result('blocked','Save the delivery attempt identifier and timestamp before sending this complete request.');
      if(request.delivery.recipient!==undefined&&request.delivery.recipient!==config.recipient)return result('blocked','The configured recipient changed after this delivery attempt was saved. Prepare it again.');
      const valid=Core.validate(request,undefined,{complete:true});if(!valid.ok)return result('blocked','The request is incomplete or changed. Review and prepare the complete package again.');
      const attemptId=base.attemptId;
      lock=request.id;contentKey=request.id+':'+request.approval?.contentFingerprint;
      if(inFlight.has(lock)){lock=null;return result('blocked','This request already has a delivery attempt in progress.');}
      if(outcomes.has(contentKey)){lock=null;return result('blocked','This approved request already has an accepted or unconfirmed attempt. Check with Ike before sending it again.');}
      inFlight.add(lock);
      const initialRequest=JSON.stringify(request);
      if(!await Core.verifyPackage(request,bundle))return result('blocked','The package does not match this saved revision, approved design or required pictures. Prepare it again.');
      // Copy/compare caller-owned bytes after all asynchronous checks. A changed source is never sent.
      if(JSON.stringify(Core.clone(options.request))!==initialRequest||!samePackage(bundle,Core.copyPackage(options.bundle)))return result('blocked','The request or attachment changed while it was being checked. Prepare the current package again.');
      const fetcher=options.fetchImpl===undefined?(typeof root.fetch==='function'?root.fetch.bind(root):null):options.fetchImpl;
      if(typeof fetcher!=='function'||typeof FormData==='undefined'||typeof Blob==='undefined')return result('blocked','This browser cannot submit the complete attachment. Download the prepared package.');
      const body=new FormData();body.append('access_key',config.accessKey);body.append('subject',"Ike's sign request — "+request.design.title+' — '+request.id);body.append('from_name',"Ike's Wood Signs request");body.append('name',request.customer.name);
      if(request.customer.email){body.append('email',request.customer.email);body.append('replyto',request.customer.email);}
      if(request.customer.phone)body.append('phone',request.customer.phone);
      body.append('request_id',request.id);body.append('request_revision',String(request.revision));body.append('attempt_id',attemptId);body.append('package_sha256',bundle.sha256);body.append('message',summary(request,bundle,attemptId,config.recipient));
      body.append('attachment',new Blob([bundle.bytes],{type:'application/zip'}),bundle.name);
      // The host provides exact project/deployment/session guards. Run them immediately
      // before calling fetch; there is no await between this check and dispatch.
      if(!allowed(options.guard,options.canSend))return result('blocked','The Ike shop session changed before sending. The complete package remains available.');
      const controller=typeof AbortController==='function'?new AbortController():null;let timer;
      const timeout=new Promise(resolve=>{timer=setTimeout(()=>{controller?.abort();resolve({kind:'uncertain'});},TIMEOUT_MS);});
      dispatched=true;
      try{
        const network=(async()=>{
          const response=await fetcher(ENDPOINT,{method:'POST',body,headers:{Accept:'application/json'},...(controller?{signal:controller.signal}:{})});
          let value;try{value=await response.json();}catch(_){return {kind:'uncertain'};}
          if(response.ok===true&&response.status>=200&&response.status<300&&value?.success===true)return {kind:'accepted'};
          if(response.status>=200&&response.status<500&&value?.success===false)return {kind:'rejected'};
          return {kind:'uncertain'};
        })();
        const response=await Promise.race([network,timeout]);
        if(response.kind==='accepted'){remember(contentKey,'provider-accepted');return result('provider-accepted','The email provider accepted the complete ZIP request. Inbox receipt has not been confirmed.',{providerAcceptedAt:new Date().toISOString()});}
        if(response.kind==='rejected')return result('failed','The provider rejected the complete ZIP request. Attachment uploads require Web3Forms PRO support. Keep the ZIP and use the email handoff, or have the shop owner check attachment support before a deliberate retry. Nothing was resent.');
        remember(contentKey,'unconfirmed');return result('unconfirmed','The provider response did not confirm the result. The request may have been accepted. Check with Ike before sending again; the complete ZIP is retained.');
      }catch(_){remember(contentKey,'unconfirmed');return result('unconfirmed','The delivery response was interrupted. The request may have been accepted. Check with Ike before sending again; the complete ZIP is retained.');}
      finally{clearTimeout(timer);}
    }catch(_){
      if(dispatched){if(contentKey)remember(contentKey,'unconfirmed');return result('unconfirmed','Delivery could not be confirmed. Check with Ike before sending again; keep the complete ZIP.');}
      return result('blocked','The complete saved request or package could not be verified. Prepare the current request again.');
    }finally{if(lock)inFlight.delete(lock);}
  }
  return Object.freeze({send,prepareHandoff});
});
