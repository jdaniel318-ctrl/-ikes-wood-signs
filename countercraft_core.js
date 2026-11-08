/* Countercraft's shared contracts. Pure functions; no identity or network authority. */
(function(g,f){const api=f(typeof module==='object'&&module.exports?require('./ike_shop_core.js'):g.IkeShopCore);if(typeof module==='object'&&module.exports)module.exports=api;g.CountercraftCore=api;})(globalThis,function(S){
'use strict';
const MiB=1048576,LIMITS=Object.freeze({requestBytes:8*MiB,photoBytes:MiB,proofBytes:2*MiB,photos:3,recoveryBytes:64*MiB,recoveryRows:32});
const clone=S.clone,canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
const hash=v=>S.sha256(typeof v==='string'||v instanceof Uint8Array?v:canonical(v));
function exact(v,names,label){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!names.includes(k))||names.some(k=>!(k in v)))throw Error('Invalid '+label+'.');}
function scope(s){exact(s,['projectId','backend','environment','site','deploymentId','mode'],'scope');if(s.projectId!=='ikes-wood-signs'||s.backend!=='https://sjgqqtnuttnkwsoebbqf.supabase.co'||s.environment!=='staging'||s.site!=='https://jdaniel318-ctrl.github.io/-ikes-wood-signs/'||!/^[-a-zA-Z0-9_]{1,80}$/.test(s.deploymentId)||!['sea_trial','live'].includes(s.mode))throw Error('Invalid shop scope.');return clone(s);}
function sameScope(a,b){return canonical(scope(a))===canonical(scope(b));}
function publication(p){scope(p.scope);if(!Number.isSafeInteger(p.revision)||p.revision<1||typeof p.enabled!=='boolean'||!Array.isArray(p.stocks)||p.stocks.length>200||!Array.isArray(p.rates)||p.rates.length>40)throw Error('Invalid publication.');const ids=new Set(),species=new Set();for(const r of p.rates){exact(r,['species','centsPerFoot'],'rate');if(!/^[\w -]{1,60}$/.test(r.species)||species.has(r.species)||!Number.isSafeInteger(r.centsPerFoot)||r.centsPerFoot<1||r.centsPerFoot>1000000)throw Error('Invalid published rate.');species.add(r.species);}for(const s of p.stocks){exact(s,['id','revision','species','nominalInches','available','actualMm'],'stock');if(!/^[\w-]{1,32}$/.test(s.id)||ids.has(s.id)||!Number.isSafeInteger(s.revision)||s.revision<1||!Number.isFinite(s.nominalInches)||s.nominalInches<=0||s.nominalInches>240||typeof s.available!=='boolean'||typeof s.species!=='string'||s.species.length>60)throw Error('Invalid published stock.');if(s.actualMm!==null&&(!Array.isArray(s.actualMm)||s.actualMm.length!==3||!s.actualMm.every(n=>Number.isFinite(n)&&n>0&&n<=6100)))throw Error('Invalid actual dimensions.');ids.add(s.id);}return clone(p);}
function price(pub,stockId,quantity){publication(pub);if(!Number.isSafeInteger(quantity)||quantity<1||quantity>100)throw Error('Invalid quantity.');const stock=pub.stocks.find(s=>s.id===stockId),rate=stock&&pub.rates.find(r=>r.species===stock.species);if(stockId&&!stock)throw Error('This stock is no longer published. Ask Ike to review it.');const known=stock?.available&&rate;return {publicationRevision:pub.revision,stockId:stockId||'',stockRevision:stock?.revision||null,species:stock?.species||null,nominalInches:stock?.nominalInches||null,centsPerFoot:known?rate.centsPerFoot:null,quantity,totalCents:known?Math.round(stock.nominalInches/12*rate.centsPerFoot)*quantity:null,currency:'USD',state:known?'published':'review-needed'};}
// Measured stock is owner-published evidence, separate from uncalibrated photo placement.
function measuredDimensions(mm){
 if(!Array.isArray(mm)||mm.length!==3||!mm.every(Number.isFinite)||mm[0]<25.4||mm[0]>3048||mm[1]<25.4||mm[1]>3048||mm[2]<1||mm[2]>150)throw Error('Measured dimensions need length and width from 1 to 120 inches, and thickness from 1 to 150 mm.');
 return [...mm];
}
function measurementsFromInches(values){
 if(!Array.isArray(values)||values.length!==3)throw Error('Enter all three board measurements.');
 const strings=values.map(v=>String(v).trim());if(strings.every(v=>v===''))return null;
 if(strings.some(v=>v===''||!/^\d*\.?\d+$/.test(v)))throw Error('Enter length, width and thickness as positive decimal measurements.');
 return measuredDimensions(strings.map(v=>Math.round(Number(v)*25.4*1e9)/1e9));
}
function boardSpec(pub,stockId){
 publication(pub);if(!stockId)return null;
 const stock=pub.stocks.find(s=>s.id===stockId);if(!stock||!stock.available)throw Error('This shop board is no longer available. Choose another board.');
 if(stock.actualMm===null)return null;if(!stock.species.trim())throw Error('Confirm the measured board species in shop setup.');
 return {source:'shop-measured',stockId:stock.id,stockRevision:stock.revision,publicationRevision:pub.revision,species:stock.species,actualMm:measuredDimensions(stock.actualMm)};
}
function checkBoard(snapshot,pub=null,required=false){
 const b=snapshot.boardSpec;if(b==null){if(required)throw Error('Record the measured shop board in a proposal and obtain customer approval before production.');return null;}
 exact(b,['source','stockId','stockRevision','publicationRevision','species','actualMm'],'measured board');measuredDimensions(b.actualMm);
 if(b.source!=='shop-measured'||b.stockId!==snapshot.stockId||!Number.isSafeInteger(b.stockRevision)||b.stockRevision<1||!Number.isSafeInteger(b.publicationRevision)||b.publicationRevision<1||typeof b.species!=='string'||!b.species.trim()||b.species.length>60)throw Error('Invalid measured board record.');
 const d=snapshot.request.design.stock;
 if(d.id!==b.stockId||d.species!==b.species||[d.widthMm,d.heightMm,d.thicknessMm].some((n,i)=>!Number.isFinite(n)||Math.abs(n-b.actualMm[i])>1e-6))throw Error('Design dimensions must match the measured shop board. Select the board again before reviewing.');
 if(pub&&canonical(boardSpec(pub,snapshot.stockId))!==canonical(b))throw Error('The published board measurements changed. Select the board again and review the layout.');
 return clone(b);
}
function boardSummary(snapshot){
 const b=checkBoard(snapshot),d=snapshot.request.design.stock,mm=b?b.actualMm:[d.widthMm,d.heightMm,d.thicknessMm];
 return {measured:!!b,dimensions:mm.map(n=>Number((n/25.4).toFixed(3))).join(' × ')+' in',species:b?.species||d.species||'Species to confirm',stockId:snapshot.stockId||'Board identification pending',marginInches:Number((d.marginMm/25.4).toFixed(3)),layoutMm:[d.widthMm-2*d.marginMm,d.heightMm-2*d.marginMm]};
}

function photoSizeNote(s){
 const e=s.plankEvidence?.[0]?.layoutSize,stock=s.request?.design?.stock;
 if(s.stockId||!e||!stock||e.photoId!==s.request.photos?.[0]?.id||e.lengthMm!==stock.widthMm||e.widthMm!==stock.heightMm)return '';
 if(e.source==='matched-tape'&&e.referenceId==='CW-20a94bae-17ee-4598-8279-f900f6f8c15a'&&e.thicknessMm===stock.thicknessMm&&e.lengthMm===598.4875&&e.widthMm===234.95&&e.thicknessMm===34.925)
   return '23 9/16 in long × 9 1/4 in wide at center · 1 3/8 in thick at center. From the matched board’s tape record.';
 if(e.source==='photo-card'&&s.request.photos.some(p=>p.id===e.scalePhotoId)&&[e.lengthMm,e.widthMm].every(v=>Number.isFinite(v)&&v>=25.4&&v<=3048))
   return 'About '+(e.lengthMm/25.4).toFixed(1)+' in long × '+(e.widthMm/25.4).toFixed(1)+' in wide at center. Card-scaled photo · thickness to check.';
 return '';
}
function metadata(snapshot){const n=clone(snapshot);for(const p of n.request.photos||[])delete p.dataUrl;if(n.request.proof)delete n.request.proof.dataUrl;return n;}
async function approvalDigest(snapshot){const s=metadata(snapshot);delete s.approval;delete s.contactPreference;delete s.request.customer;delete s.request.approval;delete s.request.delivery;delete s.request.updatedAt;delete s.request.revision;return hash(s);}
async function digest(snapshot){return hash(metadata(snapshot));}
async function approve(snapshot,fonts){const s=clone(snapshot);if(!await S.approvalMatches(s.request,fonts))throw Error('Review the current sign proof first.');s.approval={kind:'customer-complete-request',at:new Date().toISOString(),digest:await approvalDigest(s)};return s;}
async function validateSubmission(snapshot,pub,fonts){
 const s=clone(snapshot);exact(s,['schema','request','stockId','price','contactPreference','requestedPickup','approval',...('plankEvidence' in s?['plankEvidence']:[]),...('lettering' in s?['lettering']:[]),...('boardSpec' in s?['boardSpec']:[])],'request envelope');if(s.schema!=='countercraft-request-v1')throw Error('Unsupported request.');if(new TextEncoder().encode(canonical(s)).length>LIMITS.requestBytes)throw Error('Complete request exceeds 8 MiB. Keep every required photo; ask Ike for help.');
 checkBoard(s,pub);
 const v=S.validate(s.request,fonts,{complete:true});if(!v.ok)throw Error(v.errors.join(' '));
 const digits=s.request.customer.phone.replace(/\D/g,'');if(!S.emailValid(s.request.customer.email)&&digits.length<7)throw Error('Enter a usable email address or phone number.');
 if(!['email','phone'].includes(s.contactPreference)||(s.contactPreference==='email'&&!S.emailValid(s.request.customer.email))||(s.contactPreference==='phone'&&digits.length<7))throw Error('Choose an available contact method.');
 if(s.plankEvidence&&(!Array.isArray(s.plankEvidence)||s.plankEvidence.length>2||canonical(s.plankEvidence).length>32768))throw Error('Invalid plank evidence.');if(s.lettering!==undefined&&s.lettering!==null&&(!['A','B'].includes(s.lettering.style)||typeof s.lettering.resolved!=='boolean'||s.lettering.resolved))throw Error('Ike confirms requested shop lettering after submission.');
 if(typeof s.requestedPickup!=='string'||s.requestedPickup.length>120)throw Error('Invalid requested pickup.');
 if(!await S.approvalMatches(s.request,fonts))throw Error('The sign proof changed. Review it again.');
 if(!s.approval||s.approval.kind!=='customer-complete-request'||!Number.isFinite(Date.parse(s.approval.at))||s.approval.digest!==await approvalDigest(s))throw Error('Approve the current complete request.');
 if(canonical(price(pub,s.stockId,s.request.details.quantity))!==canonical(s.price))throw Error('The published stock or price changed. Review the current price before submitting.');
 return s;
}
const transitions={received:['needs-details','ready-for-production','declined','cancelled'],'needs-details':['needs-details','ready-for-production','declined','cancelled'],'awaiting-customer-approval':['needs-details','cancelled','declined'],'ready-for-production':['needs-details','in-production','cancelled'],'in-production':['needs-details','ready-for-pickup','cancelled'],'ready-for-pickup':['in-production','collected','cancelled'],collected:[],declined:[],cancelled:[]};
function transition(job,command){const j=clone(job),to=command.status;if(to==='ready-for-production'&&j.customerApprovedRevision!==j.revision)throw Error('Current customer approval is required.');if(!transitions[j.status]?.includes(to))throw Error('This job transition is unavailable.');if(['needs-details','cancelled','declined'].includes(to)&&(!command.reason?.trim()||command.reason.length>2000))throw Error('Record a specific reason.');if(to==='ready-for-production'&&!['material','price','geometry'].every(k=>command.checks?.[k]===true))throw Error('Complete the material, price and geometry review.');j.status=to;j.version++;if(to==='ready-for-production')j.checks=clone(command.checks);if(to==='in-production')j.production={revision:j.revision,startedAt:new Date().toISOString()};return j;}
function bytes64(s){if(typeof s!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('Invalid asset encoding.');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
async function backupDigest(b){return hash({schema:b.schema,scope:b.scope,jobs:b.jobs,assets:b.assets.map(({data,...a})=>a)});}
async function rehearse(value,expectedScope){const b=clone(value);if(b.schema!=='countercraft-backup-v1'||!sameScope(b.scope,expectedScope)||!Array.isArray(b.jobs)||!Array.isArray(b.assets))throw Error('Backup scope or schema mismatch.');if(b.checksum!==await backupDigest(b))throw Error('Backup metadata checksum mismatch.');let total=0;const files=new Map();for(const a of b.assets){if(files.has(a.name))throw Error('Duplicate backup asset.');const bytes=bytes64(a.data);total+=bytes.length;if(total>100*MiB||bytes.length!==a.bytes||await hash(bytes)!==a.sha256)throw Error('Backup checksum or size mismatch.');files.set(a.name,a);}for(const j of b.jobs){if(!Array.isArray(j.revisions)||!Array.isArray(j.events))throw Error('Missing job history.');for(const r of j.revisions)for(const a of r.assets||[]){const f=files.get(a.name);if(!f||f.sha256!==a.sha256||f.bytes!==a.bytes)throw Error('Missing backup media.');}}return {jobs:b.jobs.length,assets:files.size,bytes:total,restored:clone(b)};}
return Object.freeze({limits:LIMITS,clone,canonical,hash,scope,sameScope,publication,price,measuredDimensions,measurementsFromInches,boardSpec,checkBoard,boardSummary,photoSizeNote,metadata,approvalDigest,digest,approve,validateSubmission,transition,transitions,bytes64,base64,backupDigest,rehearse});
});
