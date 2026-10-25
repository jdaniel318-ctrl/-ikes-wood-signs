/* Ike's sign requests. Frozen customer proof and one complete portable archive.
 * This module creates no accepted order, machine program, network call or store. */
(function(root,factory){
  'use strict';
  const api=factory(root,typeof module==='object'&&module.exports?require('./carvewright_core.js'):root.CarvewrightCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.IkeShopCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root,Design){
  'use strict';
  const SCHEMA='ike-sign-request-v1',PROJECT='ikes-wood-signs',MiB=1024*1024;
  const LIMITS=Object.freeze({photos:3,inputPhotoBytes:10*MiB,photoBytes:MiB,photoEdge:1600,proofBytes:2*MiB,packageBytes:20*MiB,transportBytes:5*MiB});
  const BAD=new Set(['__proto__','prototype','constructor']);
  const REQUEST_KEYS=['schema','projectId','id','revision','createdAt','updatedAt','customer','details','design','photos','approval','proof','delivery','productionApproved'];
  const PHOTO_KEYS=['id','name','mime','dataUrl','sha256','originalName','originalSha256','width','height'];
  const PROOF_KEYS=['mime','dataUrl','sha256','width','height','designFingerprint'];
  const APPROVAL_KEYS=['kind','approvedAt','contentFingerprint','designFingerprint','photoFingerprints','proofSha256','productionApproved'];
  const DELIVERY_KEYS=['status','attemptId','attemptedAt','providerAcceptedAt','packageSha256','recipient','message'];
  const STATES=['not-sent','attempted','provider-accepted','failed','unconfirmed','blocked'];
  const encoder=new TextEncoder();
  function plain(v){return !!v&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);}
  function clone(value){
    const budget={nodes:0,chars:0},seen=new Set();
    function copy(v,depth){
      if(++budget.nodes>50000||depth>24)throw Error('Request data exceeds the nesting or item limit.');
      if(v===null||typeof v==='boolean')return v;
      if(typeof v==='string'){budget.chars+=v.length;if(v.length>4*MiB||budget.chars>16*MiB)throw Error('Request text or media exceeds the size limit.');return v;}
      if(typeof v==='number'){if(!Number.isFinite(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER)throw Error('Request numbers must be finite and safe.');return v;}
      const array=Array.isArray(v);
      if((!array&&!plain(v))||(array&&Object.getPrototypeOf(v)!==Array.prototype))throw Error('Request data must contain plain JSON objects and arrays.');
      if(seen.has(v))throw Error('Request data must not contain cycles.');seen.add(v);
      const keys=Reflect.ownKeys(v),out=array?[]:{};
      if(keys.length>(array?16385:512)||(array&&v.length>16384))throw Error('Request collection exceeds the item limit.');
      for(const key of keys){
        if(array&&key==='length')continue;
        if(typeof key!=='string'||BAD.has(key)||(array&&!/^(0|[1-9][0-9]*)$/.test(key)))throw Error('Unsafe request property.');
        const d=Object.getOwnPropertyDescriptor(v,key);
        if(!d||!Object.prototype.hasOwnProperty.call(d,'value')||!d.enumerable)throw Error('Request properties must be enumerable data, not accessors.');
        out[key]=copy(d.value,depth+1);
      }
      if(array&&(out.length!==v.length||keys.length!==v.length+1))throw Error('Request arrays must not contain holes or extra properties.');
      seen.delete(v);return out;
    }
    return copy(value,0);
  }
  function keys(v,allowed,required,label,errors){
    if(!plain(v)){errors.push(label+' must be an object.');return false;}
    for(const key of Object.keys(v))if(!allowed.includes(key))errors.push('Unknown '+label+' field: '+key+'.');
    for(const key of required)if(!Object.prototype.hasOwnProperty.call(v,key))errors.push('Missing '+label+' field: '+key+'.');
    return true;
  }
  function line(v,min,max){return typeof v==='string'&&v.length>=min&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);}
  function prose(v,max){return typeof v==='string'&&v.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);}
  function hash(v){return typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);}
  function identity(v){return typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(v);}
  function attemptIdValid(v){return typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
  function date(v){return typeof v==='string'&&v.length<=32&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v)&&Number.isFinite(Date.parse(v));}
  function email(v){return typeof v==='string'&&v.length<=254&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(v)&&!v.includes('..');}
  function fontsOrDefault(fonts){return fonts||root.IkeCarveFonts||(typeof require==='function'?require('./carve_fonts.js'):null);}
  function boardPhotos(){const api=root.BoardcraftPhoto||(typeof require==='function'?require('./boardcraft_photo.js'):null);if(!api?.scene)throw Error('The board-photo editor is unavailable. Reload the complete app.');return api;}
  function portable(){const api=root.CarvewrightPortable||(typeof require==='function'?require('./carvewright_portable.js'):null);if(!api?.toDxf)throw Error('Portable artwork export is unavailable. Reload the complete app.');return api;}
  function uuid(){if(root.crypto?.randomUUID)return root.crypto.randomUUID();if(typeof require==='function')return require('node:crypto').randomUUID();throw Error('Secure request identifiers are unavailable.');}
  function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
  async function sha256(value){const bytes=typeof value==='string'?encoder.encode(value):value;if(!(bytes instanceof Uint8Array))throw Error('Hash input must contain bytes.');if(root.crypto?.subtle){const b=await root.crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(b)).map(n=>n.toString(16).padStart(2,'0')).join('');}if(typeof require==='function')return require('node:crypto').createHash('sha256').update(bytes).digest('hex');throw Error('SHA-256 is unavailable in this context.');}
  function encodedImage(value,mime,limit){
    const prefix='data:'+mime+';base64,';
    return typeof value==='string'&&value.startsWith(prefix)&&value.length<=prefix.length+4*Math.ceil(limit/3)&&value.length>prefix.length&&/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.slice(prefix.length));
  }
  function imageBytes(value,mime,limit){
    if(!encodedImage(value,mime,limit))throw Error('Image data is missing, malformed or too large.');
    const b64=value.slice(value.indexOf(',')+1),str=typeof atob==='function'?atob(b64):null;
    const bytes=str===null?new Uint8Array(require('node:buffer').Buffer.from(b64,'base64')):Uint8Array.from(str,c=>c.charCodeAt(0));
    if(bytes.length>limit)throw Error('Image data exceeds the size limit.');return bytes;
  }
  function pngSize(bytes){if(bytes.length<33||bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71||bytes[4]!==13||bytes[5]!==10||bytes[6]!==26||bytes[7]!==10||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw Error('Frozen preview must be a valid PNG.');const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);return {width:d.getUint32(16),height:d.getUint32(20)};}
  function jpegSize(b){
    if(b.length<4||b[0]!==255||b[1]!==216)throw Error('Reference photograph must be JPEG.');
    let i=2;while(i+4<=b.length){if(b[i++]!==255)throw Error('Malformed JPEG reference photograph.');while(b[i]===255)i++;const marker=b[i++];if(marker===217||marker===218)break;if(marker===1||(marker>=208&&marker<=215))continue;const length=(b[i]<<8)|b[i+1];if(length<2||i+length>b.length)throw Error('Malformed JPEG reference photograph.');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){if(length<7)break;return {width:(b[i+5]<<8)|b[i+6],height:(b[i+3]<<8)|b[i+4]};}i+=length;}
    throw Error('Reference photograph has no image dimensions.');
  }
  function createRequest(design){const now=new Date().toISOString(),d=design===undefined?Design.createDraft():clone(design);d.revision=0;return {schema:SCHEMA,projectId:PROJECT,id:uuid(),revision:0,createdAt:now,updatedAt:now,customer:{name:'',email:'',phone:''},details:{quantity:1,finish:'Black',notes:''},design:d,photos:[],board:null,approval:null,proof:null,delivery:{status:'not-sent'},productionApproved:false};}
  function validate(value,fonts,options){
    let r;try{r=clone(value);}catch(e){return {ok:false,errors:[e.message]};}
    const errors=[],complete=options?.complete===true;fonts=fontsOrDefault(fonts);
    // Optional photo placement keeps original v1 requests and their exact
    // approval/package bytes readable without a migration.
    if(!keys(r,REQUEST_KEYS.concat('board'),REQUEST_KEYS,'request',errors))return {ok:false,errors};
    if(r.schema!==SCHEMA||r.projectId!==PROJECT)errors.push('This is not an Ike sign request.');
    if(!identity(r.id)||!Number.isSafeInteger(r.revision)||r.revision<0)errors.push('Invalid request identity or revision.');
    if(!date(r.createdAt)||!date(r.updatedAt))errors.push('Invalid request timestamp.');
    if(r.productionApproved!==false)errors.push('Ike must review this request before approving production.');
    if(keys(r.customer,['name','email','phone'],['name','email','phone'],'customer',errors)){
      if(!line(r.customer.name,0,160)||(complete&&!r.customer.name.trim()))errors.push('Enter the customer name (up to 160 characters).');
      if(!line(r.customer.email,0,254)||(r.customer.email&&!email(r.customer.email)))errors.push('Enter a valid customer email address.');
      if(!line(r.customer.phone,0,80)||(r.customer.phone&&!/[0-9]/.test(r.customer.phone)))errors.push('Enter a valid contact phone number.');
      if(complete&&!(typeof r.customer.email==='string'&&r.customer.email.trim())&&!(typeof r.customer.phone==='string'&&r.customer.phone.trim()))errors.push('Enter an email address or phone number for Ike to reply.');
    }
    if(keys(r.details,['quantity','finish','notes'],['quantity','finish','notes'],'details',errors)){
      if(!Number.isSafeInteger(r.details.quantity)||r.details.quantity<1||r.details.quantity>100)errors.push('Quantity must be a whole number from 1 to 100.');
      if(!line(r.details.finish,1,120)||!r.details.finish.trim())errors.push('Enter the requested finish.');
      if(!prose(r.details.notes,5000))errors.push('Request notes are limited to 5,000 characters.');
    }
    try{const v=Design.validate(r.design,fonts);if(!v.ok)errors.push(...v.errors);else if(complete){const l=Design.layout(r.design,fonts);if(!l.ok)errors.push(...l.errors);else if(l.blank)errors.push('Add lettering or a graphic before reviewing the sign.');}}catch(_){errors.push('The sign design or font assets are unavailable.');}
    if(!Array.isArray(r.photos)||r.photos.length>LIMITS.photos||(complete&&!r.photos.length))errors.push('Add one to three reference or plank photographs.');
    else{
      const ids=new Set();
      for(const p of r.photos){
        if(!keys(p,PHOTO_KEYS,PHOTO_KEYS,'photograph',errors))continue;
        if(!identity(p.id)||ids.has(p.id))errors.push('Photograph identifiers must be unique.');ids.add(p.id);
        if(!line(p.name,1,120)||!line(p.originalName,1,255))errors.push('Invalid photograph filename.');
        if(p.mime!=='image/jpeg'||!encodedImage(p.dataUrl,'image/jpeg',LIMITS.photoBytes))errors.push('Reference photographs must be bounded JPEG copies.');
        if(!hash(p.sha256)||!hash(p.originalSha256))errors.push('Missing photograph checksum.');
        if(!Number.isSafeInteger(p.width)||!Number.isSafeInteger(p.height)||p.width<1||p.height<1||Math.max(p.width,p.height)>LIMITS.photoEdge)errors.push('Invalid normalized photograph dimensions.');
      }
    }
    if(r.board!==undefined&&r.board!==null){
      const photo=Array.isArray(r.photos)&&r.photos.find(p=>p.id===r.board?.photoId);
      if(!photo)errors.push('Choose the photograph of this board again.');
      else try{const b=boardPhotos().validate(r.design,photo,r.board,fonts,{requireConfirmed:complete});if(!b.ok)errors.push(...b.errors);}catch(e){errors.push(e.message||'The board-photo layout is invalid.');}
    }
    if(r.proof!==null&&keys(r.proof,PROOF_KEYS,PROOF_KEYS,'proof',errors)){
      const p=r.proof;if(p.mime!=='image/png'||!encodedImage(p.dataUrl,'image/png',LIMITS.proofBytes)||!hash(p.sha256)||!hash(p.designFingerprint))errors.push('The frozen PNG preview is invalid.');
      if(!Number.isSafeInteger(p.width)||!Number.isSafeInteger(p.height)||p.width<1||p.height<1||Math.max(p.width,p.height)>1600)errors.push('Invalid frozen preview dimensions.');
    }
    if(r.approval!==null&&keys(r.approval,APPROVAL_KEYS,APPROVAL_KEYS,'approval',errors)){
      const a=r.approval;if(a.kind!=='customer-design-approval'||a.productionApproved!==false||!date(a.approvedAt)||!hash(a.contentFingerprint)||!hash(a.designFingerprint)||!hash(a.proofSha256)||!Array.isArray(a.photoFingerprints)||a.photoFingerprints.length>3||!a.photoFingerprints.every(hash))errors.push('Invalid customer design approval.');
    }
    if(keys(r.delivery,DELIVERY_KEYS,['status'],'delivery',errors)){
      const d=r.delivery;if(!STATES.includes(d.status))errors.push('Invalid delivery state.');
      if(d.attemptId!==undefined&&!(d.attemptId===''||attemptIdValid(d.attemptId)))errors.push('Invalid delivery attempt identifier.');
      if(d.status==='attempted'&&(!attemptIdValid(d.attemptId)||!date(d.attemptedAt)))errors.push('A delivery attempt needs its saved identifier and timestamp.');
      if(d.message!==undefined&&!prose(d.message,1000))errors.push('Invalid delivery message.');
      if(d.recipient!==undefined&&!(d.recipient===''||email(d.recipient)))errors.push('Invalid delivery recipient.');
      if(d.packageSha256!==undefined&&!(d.packageSha256===''||hash(d.packageSha256)))errors.push('Invalid delivered-package checksum.');
      for(const field of ['attemptedAt','providerAcceptedAt'])if(d[field]!==undefined&&!date(d[field]))errors.push('Invalid delivery timestamp.');
    }
    return {ok:!errors.length,errors};
  }
  function required(r,fonts,complete){const v=validate(r,fonts,{complete});if(!v.ok)throw Error(v.errors.join(' '));}
  async function verifyPhotos(r){
    for(const p of r.photos){const b=imageBytes(p.dataUrl,'image/jpeg',LIMITS.photoBytes),size=jpegSize(b);if(size.width!==p.width||size.height!==p.height||await sha256(b)!==p.sha256)throw Error('A reference photograph changed. Add it again and approve the new preview.');}
  }
  async function contentFingerprint(r,fonts){
    const designFingerprint=await Design.fingerprint(r.design,fonts);
    return {designFingerprint,contentFingerprint:await sha256(canonical({schema:r.schema,projectId:r.projectId,id:r.id,customer:r.customer,details:r.details,designFingerprint,photos:r.photos.map(p=>({id:p.id,name:p.name,mime:p.mime,sha256:p.sha256,originalName:p.originalName,originalSha256:p.originalSha256,width:p.width,height:p.height})),...(r.board?{board:r.board}:{}),productionApproved:false}))};
  }
  async function fingerprint(request,fonts){const r=clone(request);fonts=fontsOrDefault(fonts);required(r,fonts,true);await verifyPhotos(r);return (await contentFingerprint(r,fonts)).contentFingerprint;}
  function rasterType(b){
    if(b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';
    if(b[0]===137&&String.fromCharCode(...b.slice(1,4))==='PNG')return 'image/png';
    if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return 'image/webp';
    if(['GIF87a','GIF89a'].includes(String.fromCharCode(...b.slice(0,6))))return 'image/gif';
    if(b[0]===66&&b[1]===77)return 'image/bmp';
    if(String.fromCharCode(...b.slice(4,8))==='ftyp'){const brand=String.fromCharCode(...b.slice(8,12));if(['avif','avis'].includes(brand))return 'image/avif';if(['heic','heix','hevc','hevx','mif1','msf1'].includes(brand))return 'image/heic';}
    throw Error('Choose a supported photograph (JPEG, PNG, WebP or a photo your browser can decode). SVG and other active files are not reference photos.');
  }
  function canvas(width,height){if(!root.document?.createElement)throw Error('Photo and proof rendering require a browser.');const c=root.document.createElement('canvas');c.width=width;c.height=height;if(!c.getContext('2d'))throw Error('Image rendering is unavailable in this browser.');return c;}
  async function loadImage(blob){
    const url=URL.createObjectURL(blob);
    try{return await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('This photograph could not be decoded. Try a JPEG or PNG copy.'));image.src=url;});}finally{URL.revokeObjectURL(url);}
  }
  function canvasBlob(c,type,quality){return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('The browser could not encode this image.')),type,quality));}
  async function normalizePhoto(file){
    if(typeof Blob==='undefined'||!(file instanceof Blob)||!Number.isSafeInteger(file.size)||file.size<1||file.size>LIMITS.inputPhotoBytes)throw Error('Each input photograph must be at most 10 MiB.');
    const original=new Uint8Array(await file.arrayBuffer()),type=rasterType(original),originalSha256=await sha256(original),image=await loadImage(new Blob([original],{type}));
    if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>50000000||Math.max(image.naturalWidth,image.naturalHeight)>20000)throw Error('This photograph exceeds the 50-megapixel decoding limit. Choose a smaller copy.');
    let scale=Math.min(1,LIMITS.photoEdge/Math.max(image.naturalWidth,image.naturalHeight)),blob,c;
    for(let resize=0;resize<5;resize++){
      c=canvas(Math.max(1,Math.round(image.naturalWidth*scale)),Math.max(1,Math.round(image.naturalHeight*scale)));
      const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);
      for(const quality of [.88,.76,.62,.48]){blob=await canvasBlob(c,'image/jpeg',quality);if(blob.size<=LIMITS.photoBytes)break;}
      if(blob.size<=LIMITS.photoBytes)break;scale*=.8;
    }
    if(!blob||blob.size>LIMITS.photoBytes)throw Error('This photograph cannot fit in the request. Choose a smaller reference copy.');
    const bytes=new Uint8Array(await blob.arrayBuffer()),dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('The reference photograph could not be read.'));reader.readAsDataURL(blob);});
    const originalName=typeof file.name==='string'?file.name.slice(0,255).replace(/[\u0000-\u001f\u007f]/g,'_'):'reference-photo';
    const name=(originalName.replace(/\.[^.]*$/,'').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80)||'reference')+'.jpg';
    return {id:uuid(),name,mime:'image/jpeg',dataUrl,sha256:await sha256(bytes),originalName:originalName||'reference-photo',originalSha256,width:c.width,height:c.height};
  }
  async function renderBoardProof(design,fonts,context){
    const scene=boardPhotos().scene(design,context.photo,context.board,fonts);
    const im=await loadImage(new Blob([scene.svg],{type:'image/svg+xml'}));
    let scale=Math.min(1,1600/Math.max(scene.width,scene.height));
    // Detailed real wood can exceed a PNG budget at 1600px. Keep the complete
    // scene and its proportions, reducing only raster resolution when needed.
    for(let attempt=0;attempt<7;attempt++){
      const c=canvas(Math.max(1,Math.round(scene.width*scale)),Math.max(1,Math.round(scene.height*scale))),ctx=c.getContext('2d');
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);
      const blob=await canvasBlob(c,'image/png');
      if(blob.size<=LIMITS.proofBytes){
        const dataUrl=c.toDataURL('image/png'),bytes=imageBytes(dataUrl,'image/png',LIMITS.proofBytes);
        return {mime:'image/png',dataUrl,sha256:await sha256(bytes),width:c.width,height:c.height,designFingerprint:await Design.fingerprint(design,fonts)};
      }
      scale*=.8;
    }
    throw Error('This photo proof is too detailed to package. Choose a smaller photograph and review it again.');
  }
  async function renderProof(design,fonts,boardContext){
    if(boardContext)return renderBoardProof(clone(design),fontsOrDefault(fonts),clone(boardContext));
    const d=clone(design);fonts=fontsOrDefault(fonts);const svg=Design.toSvg(d,fonts),s=d.stock,scale=1600/Math.max(s.widthMm,s.heightMm),c=canvas(Math.max(1,Math.round(s.widthMm*scale)),Math.max(1,Math.round(s.heightMm*scale)));
    // Illustrative material only. Fixed warm light/dark tones retain contrast for
    // both Ivory and the dark Studio inks without changing artwork or CNC geometry.
    const luminance=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
    const ink=luminance(d.appearance.ink),contrast=hex=>{const value=luminance(hex);return (Math.max(ink,value)+.05)/(Math.min(ink,value)+.05);};
    const background=contrast('#d6b48a')>=contrast('#7e6046')?'#d6b48a':'#7e6046';
    const im=await loadImage(new Blob([svg],{type:'image/svg+xml'})),ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);
    const dataUrl=c.toDataURL('image/png'),bytes=imageBytes(dataUrl,'image/png',LIMITS.proofBytes);
    return {mime:'image/png',dataUrl,sha256:await sha256(bytes),width:c.width,height:c.height,designFingerprint:await Design.fingerprint(d,fonts)};
  }
  async function review(request,fonts){
    const r=clone(request);fonts=fontsOrDefault(fonts);required(r,fonts,true);await verifyPhotos(r);
    r.design=await Design.review(r.design,fonts);const fp=await contentFingerprint(r,fonts);r.proof=await renderProof(r.design,fonts,r.board?{photo:r.photos.find(p=>p.id===r.board.photoId),board:r.board}:null);
    r.approval={kind:'customer-design-approval',approvedAt:new Date().toISOString(),contentFingerprint:fp.contentFingerprint,designFingerprint:fp.designFingerprint,photoFingerprints:r.photos.map(p=>p.sha256),proofSha256:r.proof.sha256,productionApproved:false};
    r.updatedAt=r.approval.approvedAt;r.delivery={status:'not-sent'};return r;
  }
  async function approvalMatches(request,fonts){
    try{
      const r=clone(request);fonts=fontsOrDefault(fonts);required(r,fonts,true);if(!r.approval||!r.proof)return false;
      await verifyPhotos(r);const fp=await contentFingerprint(r,fonts),b=imageBytes(r.proof.dataUrl,'image/png',LIMITS.proofBytes),size=pngSize(b),a=r.approval;
      return size.width===r.proof.width&&size.height===r.proof.height&&a.contentFingerprint===fp.contentFingerprint&&a.designFingerprint===fp.designFingerprint&&r.proof.designFingerprint===fp.designFingerprint&&a.proofSha256===r.proof.sha256&&await sha256(b)===r.proof.sha256&&canonical(a.photoFingerprints)===canonical(r.photos.map(p=>p.sha256));
    }catch(_){return false;}
  }
  function xml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function inches(mm){return Number((mm/25.4).toFixed(3));}
  function wording(design){return Design.layerList(design).filter(l=>l.type==='text'&&l.text.value.trim()).map(l=>l.text.value);}
  function briefText(r){
    const s=r.design.stock;
    return ['IKE\'S WOOD SIGNS — SIGN REQUEST','Ike reviews before production. This is a request for review, not an accepted production order.','', 'Request: '+r.id,'Saved revision: '+r.revision,'Design: '+r.design.title,'Customer: '+r.customer.name,'Email: '+(r.customer.email||'Not supplied'),'Phone: '+(r.customer.phone||'Not supplied'),'Quantity: '+r.details.quantity,'Requested finish: '+r.details.finish,'Requested blank: '+s.widthMm+' × '+s.heightMm+' × '+s.thicknessMm+' mm ('+inches(s.widthMm)+' × '+inches(s.heightMm)+' × '+inches(s.thicknessMm)+' in)','Requested species: '+s.species,'Reference blank: '+s.id,'','Wording:',...(wording(r.design).length?wording(r.design):['Graphic-only artwork']),'','Customer notes:',r.details.notes||'No additional notes.','','Customer design approval: '+r.approval.approvedAt,'Content fingerprint: '+r.approval.contentFingerprint,'Artwork fingerprint: '+r.approval.designFingerprint,'Frozen preview SHA-256: '+r.proof.sha256,(r.board?'Preview background: the selected board photograph with the customer-approved artwork placement. Frame and quarter-turn orientation are saved in request.json. Physical dimensions remain unconfirmed; the photograph is not calibrated.':'Preview background: illustrative warm tone for legibility, not confirmed material or finish.'),'','Reference photographs: '+r.photos.length,'Photographs are reference copies, not calibrated measurements. Ike confirms the actual wood, dimensions, thickness and machine setup before production.','','The attached SVG and DXF contain artwork geometry in millimeters. Ike imports it into CAM and selects a machine-specific post. No universal executable CNC program is included.',''].join('\n');
  }
  function briefHtml(r){
    const s=r.design.stock;
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\' file:; style-src \'unsafe-inline\'"><title>'+xml(r.design.title)+' — Ike sign request</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#1c3436;max-width:920px;margin:32px auto;padding:0 22px}header{border-bottom:3px solid #346d59}h1{font-size:30px}h2{font-size:21px}dl{display:grid;grid-template-columns:minmax(120px,1fr) 3fr;gap:8px 20px}dt{font-weight:600}dd{margin:0;overflow-wrap:anywhere}img{max-width:100%;height:auto;border:1px solid #bbb}pre,.notes{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.fingerprint{font:12px/1.5 monospace;overflow-wrap:anywhere}figure{margin:16px 0}footer{border-top:1px solid #aaa;margin-top:28px;padding-top:16px}@media print{body{margin:10mm;max-width:none}figure{break-inside:avoid}}</style></head><body><header><p>IKE\'S WOOD SIGNS · SIGN REQUEST</p><h1>'+xml(r.design.title)+'</h1><p><strong>Ike reviews before production.</strong> This request does not accept a production order or approve machine setup.</p></header><dl><dt>Customer</dt><dd>'+xml(r.customer.name)+'</dd><dt>Email</dt><dd>'+xml(r.customer.email||'Not supplied')+'</dd><dt>Phone</dt><dd>'+xml(r.customer.phone||'Not supplied')+'</dd><dt>Quantity</dt><dd>'+r.details.quantity+'</dd><dt>Requested finish</dt><dd>'+xml(r.details.finish)+'</dd><dt>Requested blank</dt><dd>'+s.widthMm+' × '+s.heightMm+' × '+s.thicknessMm+' mm ('+inches(s.widthMm)+' × '+inches(s.heightMm)+' × '+inches(s.thicknessMm)+' in)</dd><dt>Requested species</dt><dd>'+xml(s.species)+'</dd><dt>Reference blank</dt><dd>'+xml(s.id)+'</dd><dt>Saved request</dt><dd>'+xml(r.id)+' · revision '+r.revision+'</dd></dl><h2>Customer-approved layout</h2><figure><img src="preview.png" alt="Frozen customer-approved sign preview"><figcaption>The exact frozen layout approved on '+xml(r.approval.approvedAt)+'. '+(r.board?'This proof uses the selected board photograph and approved placement. Ike confirms physical dimensions and finish; the photo is not calibrated.':'The warm background is illustrative for legibility; Ike confirms actual wood and finish.')+' Display size is a preview; artwork files declare physical dimensions.</figcaption></figure><h2>Wording</h2><pre>'+xml(wording(r.design).join('\n\n')||'Graphic-only artwork')+'</pre><h2>Customer notes</h2><p class="notes">'+xml(r.details.notes||'No additional notes.')+'</p><h2>Reference photographs</h2><p>These are reference copies, not calibrated measurements. Ike confirms actual wood and dimensions before production.</p>'+r.photos.map((p,i)=>'<figure><img src="photos/reference-'+String(i+1).padStart(2,'0')+'.jpg" alt="Reference photograph '+(i+1)+'"><figcaption>'+xml(p.originalName)+'</figcaption></figure>').join('')+'<footer><p>SVG and DXF provide artwork in millimeters for import into CAM. Ike chooses the actual toolpath and machine-specific post before cutting. No universal executable CNC program is included.</p><p class="fingerprint">Content: '+r.approval.contentFingerprint+'<br>Artwork: '+r.approval.designFingerprint+'<br>Frozen preview: '+r.proof.sha256+'</p></footer></body></html>\n';
  }
  function readme(r){return ['IKE\'S WOOD SIGNS — COMPLETE SIGN REQUEST','Request '+r.id+' / revision '+r.revision,'Ike reviews before production. Customer layout approval is not production approval.','','FILES',(r.board?'preview.png — exact frozen customer-approved layout on the selected board photograph. Placement and quarter-turn orientation are retained in request.json. Actual dimensions are unconfirmed; this is a visual layout, not a calibrated measurement.':'preview.png — exact frozen customer-approved layout on an illustrative warm background selected for legibility. Ike confirms actual wood and finish.'),'photos/ — normalized JPEG reference copies, maximum 1600 pixels per edge. Original photo checksums and names remain in request.json.','request-brief.html / request-brief.txt — readable contact information and requested sign details. Extract the full archive before opening the HTML so its pictures remain alongside it.','artwork.svg — exact outlined artwork with physical millimeter size; no installed font dependency.','artwork.dxf — closed LWPOLYLINE artwork, AutoCAD 2000 / AC1015, units millimeters, lower-left origin, Y up; curves approximated within 0.02 mm. Counters are separate contours.','editable-design.json — editable Carvewright job with exact bundled font/graphic source fingerprints.','request.json — request, approval, reference-photo and proof metadata.','manifest.json — SHA-256 and byte count for every other file (the manifest does not hash itself).','','CNC IMPORT','Import SVG or DXF into the CAM software supported by the actual machine. Select millimeters and verify the imported artwork size against the requested blank before creating toolpaths. Geometry contains artwork only; it does not add a stock perimeter or photograph to the cutting contours.','SVG artwork is outlined; DXF normalizes overlapping filled contours. Both describe the same approved sign. Small details remain in these neutral files even if a default cutter cannot fit them.','Choose suitable tools, operation/depth, material, feeds, spindle, work origin, safe clearances and clamps in CAM. Select and inspect the machine-specific post and simulate its toolpaths. Verify the actual machine setup before cutting.','There is no single executable G-code or CNC program that is correct for every controller. This package supplies portable artwork; it does not include an unverified universal cutting program.','','MATERIAL AND REVIEW','Blank dimensions, species, finish and quantity are customer requests. Photographs are references, not proof of dimensions or machining suitability. Ike confirms the actual material and setup before accepting production.','The package checksum displayed by the app identifies the exact archive submitted. Provider acceptance does not prove inbox receipt.',''].join('\n');}
  let crcTable;
  function crc32(bytes){if(!crcTable){crcTable=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;crcTable[n]=c;}}let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
  function zip(files){
    let size=22,centralSize=0;const entries=files.map(file=>{const name=encoder.encode(file.name);if(!/^[A-Za-z0-9_./-]+$/.test(file.name)||file.name.includes('..')||file.name.startsWith('/'))throw Error('Unsafe archive filename.');size+=30+name.length+file.bytes.length+46+name.length;centralSize+=46+name.length;return {file,name,crc:crc32(file.bytes),offset:0};});
    if(size>LIMITS.packageBytes)throw Error('The complete request package exceeds 20 MiB. Reduce the artwork or photographs.');
    const out=new Uint8Array(size),v=new DataView(out.buffer);let p=0;const u16=n=>{v.setUint16(p,n,true);p+=2;},u32=n=>{v.setUint32(p,n,true);p+=4;};
    for(const e of entries){e.offset=p;u32(0x04034b50);u16(20);u16(0x800);u16(0);u16(0);u16(33);u32(e.crc);u32(e.file.bytes.length);u32(e.file.bytes.length);u16(e.name.length);u16(0);out.set(e.name,p);p+=e.name.length;out.set(e.file.bytes,p);p+=e.file.bytes.length;}
    const centralOffset=p;
    for(const e of entries){u32(0x02014b50);u16(20);u16(20);u16(0x800);u16(0);u16(0);u16(33);u32(e.crc);u32(e.file.bytes.length);u32(e.file.bytes.length);u16(e.name.length);u16(0);u16(0);u16(0);u16(0);u32(0);u32(e.offset);out.set(e.name,p);p+=e.name.length;}
    u32(0x06054b50);u16(0);u16(0);u16(entries.length);u16(entries.length);u32(centralSize);u32(centralOffset);u16(0);return out;
  }
  async function buildPackage(request,fonts){
    const r=clone(request);fonts=fontsOrDefault(fonts);required(r,fonts,true);
    if(r.revision<1||r.design.revision!==r.revision)throw Error('Save the reviewed request and design at the same revision before preparing the package.');
    if(!await approvalMatches(r,fonts))throw Error('Review and approve the current complete request before preparing its package.');
    const files=[],add=async(name,mime,body)=>{const bytes=typeof body==='string'?encoder.encode(body):body;files.push({name,mime,bytes,sha256:await sha256(bytes)});};
    await add('preview.png','image/png',imageBytes(r.proof.dataUrl,'image/png',LIMITS.proofBytes));
    for(let i=0;i<r.photos.length;i++)await add('photos/reference-'+String(i+1).padStart(2,'0')+'.jpg','image/jpeg',imageBytes(r.photos[i].dataUrl,'image/jpeg',LIMITS.photoBytes));
    await add('request-brief.html','text/html;charset=utf-8',briefHtml(r));await add('request-brief.txt','text/plain;charset=utf-8',briefText(r));
    await add('artwork.svg','image/svg+xml',Design.toSvg(r.design,fonts));const dxf=portable().toDxf(r.design,fonts,{toleranceMm:.02});await add('artwork.dxf',dxf.mime||'image/vnd.dxf',dxf.text);
    await add('editable-design.json','application/json',JSON.stringify(await Design.createPacket(r.design,fonts),null,2)+'\n');
    const metadata={schema:SCHEMA,projectId:PROJECT,id:r.id,revision:r.revision,createdAt:r.createdAt,updatedAt:r.updatedAt,customer:r.customer,details:r.details,design:{file:'editable-design.json',id:r.design.id,revision:r.design.revision,title:r.design.title,stock:r.design.stock,fingerprint:r.approval.designFingerprint},photos:r.photos.map((p,i)=>({id:p.id,file:'photos/reference-'+String(i+1).padStart(2,'0')+'.jpg',name:p.name,mime:p.mime,sha256:p.sha256,originalName:p.originalName,originalSha256:p.originalSha256,width:p.width,height:p.height})),proof:{file:'preview.png',mime:r.proof.mime,sha256:r.proof.sha256,width:r.proof.width,height:r.proof.height,designFingerprint:r.proof.designFingerprint},approval:r.approval,delivery:r.delivery,productionApproved:false};
    if(r.board)metadata.board=clone(r.board);
    await add('request.json','application/json',JSON.stringify(metadata,null,2)+'\n');await add('README.txt','text/plain;charset=utf-8',readme(r));
    const manifest={schema:'ike-sign-package-v1',projectId:PROJECT,requestId:r.id,requestRevision:r.revision,contentFingerprint:r.approval.contentFingerprint,designFingerprint:r.approval.designFingerprint,proofSha256:r.proof.sha256,approvedAt:r.approval.approvedAt,deliveryAttempt:attemptIdValid(r.delivery.attemptId)&&date(r.delivery.attemptedAt)?{attemptId:r.delivery.attemptId,attemptedAt:r.delivery.attemptedAt}:null,productionApproved:false,units:'mm',dxfToleranceMm:.02,files:files.map(f=>({name:f.name,mime:f.mime,bytes:f.bytes.length,sha256:f.sha256}))};
    await add('manifest.json','application/json',JSON.stringify(manifest,null,2)+'\n');const bytes=zip(files);
    return {name:'ike-sign-'+r.id+'-r'+r.revision+'.zip',bytes,sha256:await sha256(bytes),manifest,files};
  }
  function ownData(value,names){if(!plain(value)||Reflect.ownKeys(value).length!==names.length)throw Error('Invalid package data.');for(const name of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,name);if(typeof name!=='string'||!names.includes(name)||!d||!Object.prototype.hasOwnProperty.call(d,'value')||!d.enumerable)throw Error('Invalid package properties.');}}
  function byteCopy(value){if(!(value instanceof Uint8Array)||Object.getPrototypeOf(value)!==Uint8Array.prototype||value.byteLength>LIMITS.packageBytes)throw Error('Invalid package bytes.');return value.slice();}
  function copyPackage(bundle){
    ownData(bundle,['name','bytes','sha256','manifest','files']);if(!line(bundle.name,1,240)||!hash(bundle.sha256)||!Array.isArray(bundle.files)||Object.getPrototypeOf(bundle.files)!==Array.prototype||bundle.files.length<1||bundle.files.length>16||Reflect.ownKeys(bundle.files).length!==bundle.files.length+1)throw Error('Invalid complete package.');
    const out={name:bundle.name,bytes:byteCopy(bundle.bytes),sha256:bundle.sha256,manifest:clone(bundle.manifest),files:[]};let total=0;
    for(let i=0;i<bundle.files.length;i++){const descriptor=Object.getOwnPropertyDescriptor(bundle.files,String(i));if(!descriptor||!Object.prototype.hasOwnProperty.call(descriptor,'value'))throw Error('Invalid package attachment.');const f=descriptor.value;ownData(f,['name','mime','bytes','sha256']);if(!line(f.name,1,160)||!line(f.mime,1,80)||!hash(f.sha256))throw Error('Invalid package attachment metadata.');const bytes=byteCopy(f.bytes);total+=bytes.length;if(total>LIMITS.packageBytes)throw Error('Package attachments exceed the size limit.');out.files.push({name:f.name,mime:f.mime,bytes,sha256:f.sha256});}return out;
  }
  function equalBytes(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
  async function verifyPackage(request,bundle,fonts){
    try{const r=clone(request),actual=copyPackage(bundle),expected=await buildPackage(r,fontsOrDefault(fonts));if(actual.name!==expected.name||actual.sha256!==expected.sha256||!equalBytes(actual.bytes,expected.bytes)||canonical(actual.manifest)!==canonical(expected.manifest)||actual.files.length!==expected.files.length)return false;for(let i=0;i<actual.files.length;i++){const a=actual.files[i],e=expected.files[i];if(a.name!==e.name||a.mime!==e.mime||a.sha256!==e.sha256||!equalBytes(a.bytes,e.bytes))return false;}return true;}catch(_){return false;}
  }
  return Object.freeze({createRequest,clone,validate,normalizePhoto,renderProof,review,approvalMatches,fingerprint,buildPackage,verifyPackage,copyPackage,sha256,emailValid:email,attemptIdValid,limits:LIMITS});
});
