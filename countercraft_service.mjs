// Shared Edge boundary, executable against the real PostgreSQL gateway in tests.
import * as fontModule from './carve_fonts.js';
import './carve_core.js';
import './fleet_design_assets.js';
import './carvewright_core.js';
import './boardcraft_photo.js';
import './ike_shop_core.js';
import './countercraft_core.js';
import './countercraft_backup.js';
const C=globalThis.CountercraftCore,S=globalThis.IkeShopCore,D=globalThis.CarvewrightCore,F=globalThis.IkeCarveFonts||fontModule.default;
const utf8=new TextEncoder();
const uuid=v=>{if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v||''))throw Error('Invalid operation identifier.');return v;};
const secret=()=>C.base64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const tokenHash=async t=>{if(!/^[A-Za-z0-9_-]{43}$/.test(t||''))throw Error('Customer session is unavailable.');return C.hash(t);};
export async function assetsFor(snapshot){
 const out=[];for(let n=0;n<snapshot.request.photos.length;n++){const p=snapshot.request.photos[n];out.push({name:'photo-'+n+'.jpg',mime:'image/jpeg',bytes:C.bytes64(p.dataUrl.split(',')[1])});}
 out.push({name:'proof.png',mime:'image/png',bytes:C.bytes64(snapshot.request.proof.dataUrl.split(',')[1])});out.push({name:'artwork.svg',mime:'image/svg+xml',bytes:utf8.encode(D.toSvg(snapshot.request.design,F))});
 for(const a of out){if(a.bytes.length>2*1048576)throw Error('A saved asset exceeds 2 MiB.');a.sha256=await C.hash(a.bytes);}return out;
}
export function createService(io){
 const rpc=(a,s,i)=>io.rpc(a,s,i);
 function version(action,input){if(['publish','owner-command','amend','contact-correct'].includes(action)&&(!Number.isSafeInteger(input.expectedVersion)||input.expectedVersion<(action==='publish'?0:1)))throw Error('A current saved version is required.');}
 async function owner(bearer){if(!bearer)throw Error('Current owner sign-in required.');return io.auth(bearer);}
 async function hydrate(record){const r=C.clone(record);for(const [index,photo]of r.snapshot.request.photos.entries()){const asset=r.assets.find(a=>a.name==='photo-'+index+'.jpg');photo.dataUrl=await dataUrl(asset);}r.snapshot.request.proof.dataUrl=await dataUrl(r.assets.find(a=>a.name==='proof.png'));return r;}
 async function dataUrl(a){if(!a)throw Error('Required saved media is missing.');const b=await io.get(a.path);if(b.bytes.length!==a.bytes||b.mime!==a.mime||await C.hash(b.bytes)!==a.sha256)throw Error('Saved media checksum mismatch.');return 'data:'+a.mime+';base64,'+C.base64(b.bytes);}
 async function saveAssets(scope,operationId,assets,identity,kind){const scopeHash=await C.hash(scope),saved=[];await rpc('asset-stage-'+kind,scope,{...identity,operationId,paths:assets.map(a=>scopeHash+'/'+operationId+'/'+a.sha256+'-'+a.name)});for(const a of assets){const path=scopeHash+'/'+operationId+'/'+a.sha256+'-'+a.name;try{await io.put(path,a.bytes,a.mime);}catch(e){const existing=await io.get(path);if(existing.mime!==a.mime||existing.bytes.length!==a.bytes.length||await C.hash(existing.bytes)!==a.sha256)throw Error('Asset write could not be verified.');}const check=await io.get(path);if(check.mime!==a.mime||check.bytes.length!==a.bytes.length||await C.hash(check.bytes)!==a.sha256)throw Error('Asset readback mismatch.');saved.push({name:a.name,mime:a.mime,bytes:a.bytes.length,sha256:a.sha256,path});}return saved;}
 async function recoveryKey(scope,auth,rotate=false){let key=rotate?null:await rpc('recovery-key',scope,auth);if(!key){const pair=await crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['wrapKey','unwrapKey']);key=await rpc('rotate-key',scope,{...auth,publicJwk:await crypto.subtle.exportKey('jwk',pair.publicKey),privateJwk:await crypto.subtle.exportKey('jwk',pair.privateKey)});}return {id:key.id,publicJwk:key.publicJwk};}
 return async function handle(body,bearer=''){
  const {action,input={}}=body,scope=C.scope(body.scope);if(typeof action!=='string'||C.canonical(input).length>12*1048576)throw Error('Invalid request size.');
  if(action==='publish'){const auth=await owner(bearer);version(action,input);const p={scope,revision:1,enabled:input.enabled,stocks:input.stocks,rates:input.rates};C.publication(p);const result=await rpc('publish',scope,{...auth,expectedVersion:input.expectedVersion,enabled:input.enabled,settings:{stocks:p.stocks,rates:p.rates}});await recoveryKey(scope,auth);return result;}
  if(action==='rotate-key')return recoveryKey(scope,await owner(bearer),true);
  if(action==='enroll'){const auth=await owner(bearer);if(input.key?.d||input.key?.kty!=='EC'||input.key?.crv!=='P-256')throw Error('A public device key is required.');await crypto.subtle.importKey('jwk',input.key,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);if(typeof input.label!=='string'||!input.label.trim()||input.label.length>120)throw Error('Name this shop device.');return rpc('enroll',scope,{...auth,key:input.key,label:input.label});}
  if(action==='challenge'){const result=await rpc('challenge',scope,{deviceId:uuid(input.deviceId),nonce:secret()});return {id:result.id,nonce:result.nonce,expiresAt:result.expiresAt};}
  if(action==='start'){const deviceId=uuid(input.deviceId),challengeId=uuid(input.challengeId),ch=await rpc('challenge-read',scope,{deviceId,challengeId});const key=await crypto.subtle.importKey('jwk',ch.key,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,C.bytes64(input.signature),utf8.encode(C.canonical({scope,deviceId,challengeId,nonce:ch.nonce}))))throw Error('Device signature was rejected.');const token=secret(),s=await rpc('start',scope,{deviceId,challengeId,tokenHash:await tokenHash(token)});if(!s.publication.recoveryKey)throw Error('Ike must finish recovery-key setup before using this device.');return {...s,token};}
  if(action==='submit'){
   const th=await tokenHash(input.token),operationId=uuid(input.operationId),prior=await rpc('result',scope,{tokenHash:th,operationId});
   if(prior.receipt){if(prior.receipt.digest!==input.digest)throw Error('Operation digest conflict.');return prior;}
   async function refresh(){const result=await rpc('refresh-request',scope,{tokenHash:th,operationId,digest:input.digest,publicationRevision:input.snapshot?.price?.publicationRevision});if(result.receipt)return result;const e=Error('Ike updated the available planks or prices. Review the refreshed details before sending.');e.code='review-required';e.publication=result.publication;throw e;}
   const pub=await rpc('context',scope,{tokenHash:th});if(input.snapshot?.price&&input.snapshot.price.publicationRevision!==pub.revision)return refresh();
   try{const snapshot=await C.validateSubmission(input.snapshot,pub,F),digest=await C.digest(snapshot);if(digest!==input.digest)throw Error('The saved operation digest changed.');
    const assets=await assetsFor(snapshot),manifest=assets.map(a=>({name:a.name,mime:a.mime,bytes:a.bytes.length,sha256:a.sha256})),args={tokenHash:th,operationId,digest,publicationRevision:pub.revision,snapshot:C.metadata(snapshot),manifest};
    const begin=await rpc('begin',scope,args);if(begin.receipt)return begin;
    const saved=await saveAssets(scope,operationId,assets,{tokenHash:th},'customer');return await rpc('commit',scope,{...args,assets:saved});
   }catch(e){const latest=await rpc('context',scope,{tokenHash:th});if(latest.revision!==pub.revision)return refresh();throw e;}
  }
  if(['result','end'].includes(action))return rpc(action,scope,{tokenHash:await tokenHash(input.token),...(action==='result'?{operationId:uuid(input.operationId)}:{})});
  if(action==='resume')return rpc('resume',scope,{tokenHash:await tokenHash(input.token),resumeTokenHash:await tokenHash(input.resumeToken)});
  if(action==='receipt-token'){const token=secret(),r=await rpc(action,scope,{tokenHash:await tokenHash(input.token),newTokenHash:await tokenHash(token)});return {...r,token};}
  if(action==='exchange'){const token=secret(),r=await rpc(action,scope,{tokenHash:await tokenHash(input.token),newTokenHash:await tokenHash(token)});return {...r,token};}
  if(action==='token-read'){const r=await rpc(action,scope,{tokenHash:await tokenHash(input.token)});r.record=await hydrate(r.record);return r;}
  if(action==='review-respond')return rpc(action,scope,{tokenHash:await tokenHash(input.token),answer:input.answer,digest:input.digest});
  // Everything below is exact-vessel owner work. Never accept client-provided user/session IDs.
  const auth=await owner(bearer);version(action,input);
  if(action==='owner-list'||action==='devices')return rpc(action,scope,auth);
  if(action==='revoke-device')return rpc(action,scope,{...auth,deviceId:uuid(input.deviceId)});
  if(action==='owner-job'){const job=await rpc(action,scope,{...auth,jobId:uuid(input.jobId)});for(let n=0;n<job.revisions.length;n++)job.revisions[n]=await hydrate(job.revisions[n]);return job;}
  if(['owner-result','owner-reconcile','owner-dismiss'].includes(action))return rpc(action,scope,{...auth,operationId:uuid(input.operationId)});
  if(action==='review-token'){const token=secret(),r=await rpc(action,scope,{...auth,jobId:uuid(input.jobId),newTokenHash:await tokenHash(token)});return {...r,token};}
  if(action==='owner-command'){
   const args={jobId:uuid(input.jobId),expectedVersion:input.expectedVersion,operationId:uuid(input.operationId),status:input.status,reason:String(input.reason||'').slice(0,2000),checks:input.checks||null,confirmedPickup:String(input.confirmedPickup||'').slice(0,120)};
   const previous=await rpc('owner-result',scope,{...auth,operationId:args.operationId});if(previous){const candidate=await C.hash(args);return rpc(action,scope,{...auth,...args,digest:candidate});}
   if(input.status==='ready-for-production'){const job=await rpc('owner-job',scope,{...auth,jobId:args.jobId}),record=await hydrate(job.revisions.find(r=>r.revision===job.revision));if(record.snapshot.lettering&&!record.snapshot.lettering.resolved)throw Error('Prepare a matching lettering proposal and obtain customer approval first.');if(!Number.isSafeInteger(record.snapshot.price.totalCents)||record.snapshot.price.totalCents<1)throw Error('Confirm the price in an amendment and obtain customer approval first.');const layout=D.layout(record.snapshot.request.design,F);if(!layout.ok||layout.blank)throw Error('Exportable artwork needs review.');}
   return rpc(action,scope,{...auth,...args,digest:await C.hash(args)});
  }
  if(action==='contact-correct'){
   const args={jobId:uuid(input.jobId),expectedVersion:input.expectedVersion,operationId:uuid(input.operationId),reason:String(input.reason||'').trim(),customer:input.customer,contactPreference:input.contactPreference};if(!args.reason||args.reason.length>2000)throw Error('Record the reason for this correction.');args.digest=await C.hash(args);const previous=await rpc('owner-result',scope,{...auth,operationId:args.operationId});if(previous)return rpc(action,scope,{...auth,...args});
   const job=await rpc('owner-job',scope,{...auth,jobId:args.jobId}),r=await hydrate(job.revisions.find(r=>r.revision===job.revision)),snapshot=r.snapshot,before=await C.approvalDigest(snapshot);snapshot.request.customer=C.clone(input.customer);snapshot.contactPreference=input.contactPreference;
   const v=S.validate(snapshot.request,F,{complete:true});if(!v.ok)throw Error(v.errors.join(' '));if(!['email','phone'].includes(snapshot.contactPreference)||(snapshot.contactPreference==='email'&&!S.emailValid(snapshot.request.customer.email))||(snapshot.contactPreference==='phone'&&snapshot.request.customer.phone.replace(/\D/g,'').length<7))throw Error('Choose a usable contact method.');
   snapshot.request.approval.contentFingerprint=await S.fingerprint(snapshot.request,F);if(before!==await C.approvalDigest(snapshot))throw Error('Contact correction changed approved design content.');return rpc(action,scope,{...auth,...args,snapshot:C.metadata(snapshot),assets:r.assets});
  }
  if(action==='amend'){
   if(!String(input.reason||'').trim())throw Error('Explain the proposed change.');
   const snapshot=C.clone(input.snapshot),check=S.validate(snapshot.request,F,{complete:true});if(!check.ok||!await S.approvalMatches(snapshot.request,F))throw Error('Render and review the proposed sign proof. '+check.errors.join(' '));
   if(!Number.isSafeInteger(snapshot.price.totalCents)||snapshot.price.totalCents<1||snapshot.price.totalCents>100000000)throw Error('Enter the confirmed whole-cent price.');snapshot.price.state='owner-quote';snapshot.approval={kind:'owner-proposal',at:new Date().toISOString(),digest:await C.approvalDigest(snapshot)};
   const operationId=uuid(input.operationId),args={jobId:uuid(input.jobId),expectedVersion:input.expectedVersion,operationId,snapshot:C.metadata(snapshot),reason:String(input.reason||'').slice(0,2000)};args.digest=await C.hash({...args,snapshot:{...args.snapshot,approval:{...args.snapshot.approval,at:null}}});
   const previous=await rpc('owner-result',scope,{...auth,operationId});if(previous)return rpc(action,scope,{...auth,...args,assets:[]});
   args.assets=await saveAssets(scope,operationId,await assetsFor(snapshot),auth,'owner');return rpc(action,scope,{...auth,...args});
  }
  if(action==='recover'||action==='recover-resume'){
   const e=input.envelope;if(!e||!C.sameScope(e.scope,scope))throw Error('Recovery scope mismatch.');const key=await rpc('recover-key',scope,{...auth,keyId:uuid(e.keyId)});if(!key)throw Error('Recovery key version unavailable.');const privateKey=await crypto.subtle.importKey('jwk',key.privateJwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['unwrapKey']);const dataKey=await crypto.subtle.unwrapKey('raw',C.bytes64(e.wrappedKey),privateKey,'RSA-OAEP',{name:'AES-GCM',length:256},false,['decrypt']);const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:C.bytes64(e.iv),additionalData:utf8.encode(C.canonical({scope,keyId:e.keyId,draftId:e.draftId}))},dataKey,C.bytes64(e.ciphertext));const recovered=JSON.parse(new TextDecoder().decode(bytes));if(action==='recover')return recovered;const token=secret(),snapshot=recovered.pending?.snapshot||recovered.snapshot;if(!snapshot?.request||C.canonical(snapshot).length>8*1048576)throw Error('No recoverable draft in this envelope.');const r=await rpc('owner-resume',scope,{...auth,draftSessionId:uuid(recovered.session?.id),operationId:recovered.pending?.operationId||null,snapshot,newTokenHash:await tokenHash(token)});return {...r,token};
  }
  if(action==='owner-cleanup'){const batches=await rpc(action,scope,auth);let files=0;for(const b of batches){for(const p of b.paths){await io.remove(p);files++;}await rpc('cleanup-done',scope,{...auth,operationId:b.operationId});}return {batches:batches.length,files};}
  if(action==='owner-backup')return globalThis.CountercraftBackup.index(await rpc('owner-backup',scope,auth));
  if(action==='owner-backup-history'){const source=await rpc('owner-backup',scope,auth);return globalThis.CountercraftBackup.historyPart(source,{checksum:input.checksum},input.part);}
  if(action==='owner-backup-asset'){const a=await rpc(action,scope,{...auth,path:input.path});if(!a)throw Error('Backup asset is not in this shop.');const b=await io.get(a.path);if(b.bytes.length!==a.bytes||b.mime!==a.mime||await C.hash(b.bytes)!==a.sha256)throw Error('Backup media could not be verified.');return {mime:a.mime,data:C.base64(b.bytes)};}
  if(action==='handoff'){await rpc('owner-list',scope,auth);await io.logout(bearer);let revoked=false;try{await rpc('owner-list',scope,auth);}catch(_){revoked=true;}if(!revoked)throw Error('Server sign-out is not confirmed. Keep the iPad with Ike.');return {ended:true};}
  throw Error('Unsupported Countercraft action.');
 };
}
