/* Independent Carvewright model. Legacy core is a private physical geometry adapter. */
(function(root,factory){'use strict';var api=factory(typeof module==='object'&&module.exports?require('./carve_core.js'):root.IkeCarveCore);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CarvewrightCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(legacy){
'use strict';
var DESIGN='carvewright-design-v1',PACKET='carvewright-job-v1',BAD=['__proto__','prototype','constructor'];
var clone=function(x){return JSON.parse(JSON.stringify(x));};
function uuid(){if(globalThis.crypto&&globalThis.crypto.randomUUID)return globalThis.crypto.randomUUID();if(typeof require==='function')return require('node:crypto').randomUUID();throw Error('Secure design identifiers are unavailable.');}
function plain(x){return x&&typeof x==='object'&&!Array.isArray(x)&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);}
function safeTree(value,depth){if(depth>24)throw Error('Design nesting is too deep.');if(value===null||typeof value==='string'||typeof value==='boolean')return;if(typeof value==='number'&&Number.isFinite(value))return;if(!plain(value)&&!Array.isArray(value))throw Error('Design must contain plain JSON data.');Reflect.ownKeys(value).forEach(function(k){if(Array.isArray(value)&&k==='length')return;if(typeof k!=='string'||BAD.indexOf(k)!==-1)throw Error('Unsafe design key.');var p=Object.getOwnPropertyDescriptor(value,k);if(!p||!Object.prototype.hasOwnProperty.call(p,'value')||!p.enumerable)throw Error('Design properties must be enumerable own data properties.');safeTree(p.value,depth+1);});}
function keys(x,allowed,label,errors){if(!plain(x)){errors.push(label+' must be an object.');return false;}Reflect.ownKeys(x).forEach(function(k){if(allowed.indexOf(k)===-1)errors.push('Unknown '+label+' field: '+String(k));});allowed.forEach(function(k){if(!Object.prototype.hasOwnProperty.call(x,k))errors.push('Missing '+label+' field: '+k);});return true;}
function string(x,min,max){return typeof x==='string'&&x.length>=min&&x.length<=max&&!/[\u0000-\u001f\u007f]/.test(x);}
function hash(x){return typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);}
function adapter(d){return {schema:'ike-carve-design-v1',id:d.id,revision:d.revision,title:d.title,projectId:'ikes-wood-signs',stock:d.stock,text:d.text,appearance:d.appearance,review:d.review};}
function createDraft(){var d=legacy.createDraft();return {schema:DESIGN,applicationId:'carvewright',id:uuid(),revision:0,title:'Untitled design',stock:clone(d.stock),text:Object.assign({},d.text,{value:''}),appearance:clone(d.appearance),request:{vesselId:'',vesselName:'',jobReference:'',brief:'',output:'both'},origin:null,review:null};}
function validate(d,fonts){var errors=[],missing=[];try{safeTree(d,0);}catch(e){return {ok:false,errors:[e.message],missingGlyphs:missing};}var fields=['schema','applicationId','id','revision','title','stock','text','appearance','request','origin','review'];if(!keys(d,fields,'design',errors))return {ok:false,errors:errors,missingGlyphs:missing};if(d.schema!==DESIGN||d.applicationId!=='carvewright')errors.push('Unsupported Carvewright design identity.');if(!string(d.id,1,128))errors.push('Design identifier must contain 1–128 characters.');if(keys(d.request,['vesselId','vesselName','jobReference','brief','output'],'request',errors)){var r=d.request;if(typeof r.vesselId!=='string'||r.vesselId.length>160||!/^[A-Za-z0-9._:-]*$/.test(r.vesselId))errors.push('Invalid requesting vessel identifier.');if(!string(r.vesselName,0,120)||!string(r.jobReference,0,120))errors.push('Requester and job reference are limited to 120 characters.');if(typeof r.brief!=='string'||r.brief.length>2000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(r.brief))errors.push('Brief is limited to 2000 characters.');if(['svg-artwork','editable-design','both'].indexOf(r.output)===-1)errors.push('Invalid requested output.');}if(d.origin!==null&&keys(d.origin,['kind','applicationId','designId','revision','fingerprint'],'origin',errors)){var o=d.origin;if(!((['legacy-file','legacy-local'].indexOf(o.kind)!==-1&&o.applicationId==='ikes-wood-signs')||(o.kind==='carvewright-file'&&o.applicationId==='carvewright')))errors.push('Invalid origin application and kind.');if(!string(o.designId,1,o.applicationId==='ikes-wood-signs'?160:128)||!Number.isSafeInteger(o.revision)||o.revision<0||(o.fingerprint!==null&&!hash(o.fingerprint)))errors.push('Invalid origin record.');}if(d.review!==null&&(!plain(d.review)||!hash(d.review.fingerprint)))errors.push('Invalid local layout review fingerprint: require a 64-character lowercase hexadecimal string.');var v=legacy.validate(adapter(d),fonts);errors=errors.concat(v.errors);missing=v.missingGlyphs;return {ok:errors.length===0,errors:errors,missingGlyphs:missing};}
function layout(d,fonts){var v=validate(d,fonts);if(v.ok)return legacy.layout(adapter(d),fonts);return {ok:false,errors:v.errors,missingGlyphs:v.missingGlyphs,glyphs:[],bounds:null,blank:true,lineCount:1};}
function usable(d,fonts){var r=layout(d,fonts);if(!r.ok||r.blank)throw Error(r.errors.join(' ')||'Enter supported lettering before review or export.');return r;}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+canonical(v[k]);}).join(',')+'}';return JSON.stringify(v);}
function assets(d,f){var a=f.fonts[d.text.fontId];return [{id:a.id,name:a.name,source:a.source,sourceSha256:a.sourceSha256}];}
async function sha256(s){if(globalThis.crypto&&globalThis.crypto.subtle){var b=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');}if(typeof require==='function')return require('node:crypto').createHash('sha256').update(s).digest('hex');throw Error('SHA-256 is unavailable in this context.');}
async function fingerprint(d,fonts){var r=usable(d,fonts);return sha256(canonical({design:{schema:d.schema,applicationId:d.applicationId,title:d.title,stock:d.stock,text:d.text,appearance:d.appearance,request:d.request,origin:d.origin},fontAssets:assets(d,fonts),geometry:r.glyphs}));}
async function review(d,fonts){safeTree(d,0);var copy=clone(d),fp=await fingerprint(copy,fonts);copy.review={kind:'local-layout-review',fingerprint:fp,reviewedAt:new Date().toISOString(),productionReady:false};return copy;}
async function reviewMatches(d,fonts){try{safeTree(d,0);return !!d.review&&d.review.kind==='local-layout-review'&&d.review.productionReady===false&&d.review.fingerprint===await fingerprint(d,fonts);}catch(_){return false;}}
function xml(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c];});}
function toSvg(d,fonts){var r=usable(d,fonts),f=fonts.fonts[d.text.fontId],s=d.stock,m={schema:DESIGN,applicationId:'carvewright',title:d.title,wording:d.text.value,request:d.request,origin:d.origin,units:'mm',font:f.name,sourceSha256:f.sourceSha256,referenceLettering:true,productionReady:false,toolpathsIncluded:false,review:'Local layout review only; not customer approval or machining release.'};var json=JSON.stringify(m).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff\ufffe\uffff]/g,function(c){return '\\u'+c.charCodeAt(0).toString(16).padStart(4,'0');});return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="'+s.widthMm+'mm" height="'+s.heightMm+'mm" viewBox="0 0 '+s.widthMm+' '+s.heightMm+'">\n<metadata>'+xml(json)+'</metadata>\n<g fill="'+d.appearance.ink+'" fill-rule="nonzero">\n'+legacy.renderPaths(r)+'\n</g>\n</svg>\n';}
async function createPacket(d,fonts){safeTree(d,0);var s=clone(d),r=usable(s,fonts);return {schema:PACKET,design:s,fontAssets:assets(s,fonts),geometry:r.glyphs,fingerprint:await fingerprint(s,fonts),productionReady:false,toolpathsIncluded:false};}
async function fromLegacyDesign(d,fonts,options){safeTree(d,0);var v=legacy.validate(d,fonts);if(!v.ok)throw Error(v.errors.join(' '));var r=legacy.layout(d,fonts);if(!r.ok)throw Error(r.errors.join(' '));if(!options||['legacy-file','legacy-local'].indexOf(options.kind)===-1||(options.fingerprint!==null&&!hash(options.fingerprint)))throw Error('Invalid legacy provenance.');var n=createDraft();n.title=d.title;n.stock=clone(d.stock);n.text=clone(d.text);n.appearance=clone(d.appearance);n.request.vesselId='ikes-wood-signs';n.request.vesselName="Ike's Wood Signs";n.origin={kind:options.kind,applicationId:'ikes-wood-signs',designId:d.id,revision:d.revision,fingerprint:options.fingerprint};return n;}
async function readPacket(text,fonts){if(typeof text!=='string'||text.length>4194304||new TextEncoder().encode(text).byteLength>4194304)throw Error('Job file must be at most 4 MiB.');var p;try{p=JSON.parse(text);}catch(_){throw Error('Job file is not valid JSON.');}safeTree(p,0);if(p&&p.schema==='ike-carve-job-v1'){await legacy.readPacket(text,fonts);return fromLegacyDesign(p.design,fonts,{kind:'legacy-file',fingerprint:p.fingerprint});}var errors=[],fields=['schema','design','fontAssets','geometry','fingerprint','productionReady','toolpathsIncluded'];if(!keys(p,fields,'job',errors)||errors.length||p.schema!==PACKET||p.productionReady!==false||p.toolpathsIncluded!==false)throw Error('Unsupported or malformed job file.');var r=usable(p.design,fonts);if(canonical(p.fontAssets)!==canonical(assets(p.design,fonts)))throw Error('Job font assets do not match bundled fonts.');if(canonical(p.geometry)!==canonical(r.glyphs))throw Error('Job geometry does not match exact regenerated paths.');if(!hash(p.fingerprint)||p.fingerprint!==await fingerprint(p.design,fonts))throw Error('Job fingerprint does not match design and paths.');var n=clone(p.design);if(!n.origin)n.origin={kind:'carvewright-file',applicationId:'carvewright',designId:n.id,revision:n.revision,fingerprint:p.fingerprint};n.id=uuid();n.revision=0;n.review=null;return n;}
return Object.freeze({createDraft:createDraft,validate:validate,layout:layout,renderPaths:legacy.renderPaths,toSvg:toSvg,fingerprint:fingerprint,review:review,reviewMatches:reviewMatches,createPacket:createPacket,readPacket:readPacket,fromLegacyDesign:fromLegacyDesign});
});

/* Fleetcraft: explicit v2 artwork, with the original v1 implementation retained
 * above so existing files, source fingerprints and machining records stay exact. */
(function (root, base, catalog) {
  'use strict';
  const V1='carvewright-design-v1', V2='carvewright-design-v2', P2='carvewright-job-v2';
  const primary='primary', maxObjects=12, maxPaths=240;
  const badKeys=['__proto__','prototype','constructor'];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  const textString=(s,min,max)=>typeof s==='string'&&s.length>=min&&s.length<=max&&!/[\u0000-\u001f\u007f]/.test(s);
  const plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);
  function checkTree(v,depth=0) {
    if(depth>24)throw Error('Design nesting is too deep.');
    if(v===null||typeof v==='string'||typeof v==='boolean'||(typeof v==='number'&&Number.isFinite(v)))return;
    if(!plain(v)&&!Array.isArray(v))throw Error('Design must contain plain finite JSON data.');
    Reflect.ownKeys(v).forEach(k=>{
      if(Array.isArray(v)&&k==='length')return;
      if(typeof k!=='string'||badKeys.includes(k))throw Error('Unsafe design key.');
      const p=Object.getOwnPropertyDescriptor(v,k);
      if(!p||!own(p,'value')||!p.enumerable)throw Error('Design properties must be enumerable own data properties.');
      checkTree(p.value,depth+1);
    });
  }
  function fields(o,allowed,label,errors) {
    if(!plain(o)){errors.push(label+' must be an object.');return false;}
    Object.keys(o).forEach(k=>{if(!allowed.includes(k))errors.push('Unknown '+label+' field: '+k);});
    allowed.forEach(k=>{if(!own(o,k))errors.push('Missing '+label+' field: '+k);});return true;
  }
  function newId() {
    if(root.crypto?.randomUUID)return root.crypto.randomUUID();
    if(typeof require==='function')return require('node:crypto').randomUUID();
    throw Error('Secure object identifiers are unavailable.');
  }
  function asV1(d) {
    const n=Object.assign({},d,{schema:V1});delete n.layers;delete n.primaryTransform;return n;
  }
  function rotation(v,label,errors){if(!finite(v,-360,360))errors.push(label+' rotation must be between −360 and 360 degrees.');}
  function validate(d,fonts) {
    if(d?.schema!==V2)return base.validate(d,fonts);
    const errors=[],missing=[];
    try{checkTree(d);}catch(e){return {ok:false,errors:[e.message],missingGlyphs:missing};}
    fields(d,['schema','applicationId','id','revision','title','stock','text','appearance','request','origin','review','primaryTransform','layers'],'design',errors);
    const v=base.validate(asV1(d),fonts);errors.push(...v.errors);missing.push(...v.missingGlyphs);
    if(fields(d.primaryTransform,['rotationDeg'],'main lettering transform',errors))rotation(d.primaryTransform.rotationDeg,'Main lettering',errors);
    if(!Array.isArray(d.layers)||d.layers.length>maxObjects-1)errors.push('Use at most 12 objects, including the main lettering.');
    else {
      const ids=new Set([primary]);
      d.layers.forEach((a,index)=>{
        const label='Object '+(index+2);
        if(!plain(a)){errors.push(label+' must be an object.');return;}
        const expected=a.type==='text'?['id','type','name','text','rotationDeg']:a.type==='graphic'?['id','type','name','assetId','centerXmm','centerYmm','widthMm','heightMm','rotationDeg']:null;
        if(!expected){errors.push(label+' must be text or a graphic.');return;}
        fields(a,expected,label,errors);
        if(typeof a.id!=='string'||!/^[-_a-zA-Z0-9]{1,128}$/.test(a.id)||ids.has(a.id))errors.push(label+' must have a unique safe identifier.');
        ids.add(a.id);
        if(!textString(a.name,1,80))errors.push(label+' name must contain 1–80 characters.');
        rotation(a.rotationDeg,label,errors);
        if(a.type==='text'){
          const check=base.validate(Object.assign(asV1(d),{text:a.text}),fonts);
          errors.push(...check.errors.map(e=>label+': '+e));
          check.missingGlyphs.forEach(c=>{if(!missing.includes(c))missing.push(c);});
        }else{
          if(typeof a.assetId!=='string'||!catalog?.graphics||!own(catalog.graphics,a.assetId))errors.push(label+' graphic is not in the bundled artwork catalog.');
          const w=d.stock?.widthMm,h=d.stock?.heightMm;
          if(!finite(a.centerXmm,-w,2*w)||!finite(a.centerYmm,-h,2*h))errors.push(label+' position must be finite and near the blank.');
          if(!finite(a.widthMm,.1,6096)||!finite(a.heightMm,.1,6096))errors.push(label+' width and height must be 0.1–6096 mm.');
        }
      });
    }
    return {ok:errors.length===0,errors,missingGlyphs:missing};
  }
  function layerList(d) {
    const list=[{id:primary,type:'text',name:'Main lettering',text:d.text,rotationDeg:d.schema===V2?d.primaryTransform.rotationDeg:0}];
    return clone(list.concat(d.schema===V2?d.layers:[]));
  }
  function ensureLayers(d) {
    checkTree(d);if(![V1,V2].includes(d.schema)||d.applicationId!=='carvewright')throw Error('Open a Carvewright design first.');
    const n=clone(d);if(n.schema===V1){n.schema=V2;n.primaryTransform={rotationDeg:0};n.layers=[];n.review=null;}return n;
  }
  function room(d){if(d.layers.length>=maxObjects-1)throw Error('This design has the 12-object limit. Remove an object before adding another.');}
  function addTextLayer(d,value='New text') {
    if(typeof value!=='string')throw Error('New wording must be text.');
    const n=ensureLayers(d);room(n);
    n.layers.push({id:newId(),type:'text',name:'Text '+(n.layers.filter(a=>a.type==='text').length+2),text:Object.assign({},n.text,{value,sizePercent:25,trackingEm:0,align:'center',offsetXmm:0,offsetYmm:0}),rotationDeg:0});n.review=null;return n;
  }
  function addGraphicLayer(d,assetId) {
    if(!catalog?.graphics||!own(catalog.graphics,assetId))throw Error('Choose a bundled graphic.');
    const n=ensureLayers(d);room(n);const a=catalog.graphics[assetId],size=Math.min(n.stock.widthMm-2*n.stock.marginMm,n.stock.heightMm-2*n.stock.marginMm)*.32;
    const w=a.bounds[2]-a.bounds[0],h=a.bounds[3]-a.bounds[1],scale=size/Math.max(w,h);
    n.layers.push({id:newId(),type:'graphic',name:a.name,assetId,centerXmm:n.stock.widthMm/2,centerYmm:n.stock.heightMm/2,widthMm:w*scale,heightMm:h*scale,rotationDeg:0});n.review=null;return n;
  }
  function duplicateLayer(d,id) {
    const n=ensureLayers(d);room(n);const a=layerList(n).find(x=>x.id===id);if(!a)throw Error('Select an object to duplicate.');
    const c=clone(a);c.id=newId();c.name=(a.name+' copy').slice(0,80);n.layers.push(c);n.review=null;return n;
  }
  function removeLayer(d,id) {
    const n=ensureLayers(d);if(id===primary)n.text.value='';else{const i=n.layers.findIndex(a=>a.id===id);if(i<0)throw Error('Select an object to remove.');n.layers.splice(i,1);}n.review=null;return n;
  }
  function matrixProduct(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
  function rotateAround(deg,x,y){const r=deg*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return [c,s,-s,c,x-c*x+s*y,y-s*x-c*y];}
  // Evaluate the extrema of transformed curves, rather than rotating their
  // empty rectangular envelope. This stays exact for the bundled M/L/H/V/Q/C/Z
  // paths and avoids both false margin failures and flattened-curve rounding.
  function pathBounds(path,m) {
    const pattern=/[MLHVQCZ]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
    if(typeof path!=='string'||path.replace(pattern,'').replace(/[\s,]/g,''))throw Error('Unsupported vector outline command.');
    const tokens=path.match(pattern)||[];
    if(tokens.length>100000)throw Error('Vector outline exceeds the bounded path limit.');
    let i=0,command=null,x=0,y=0,startX=0,startY=0,xMin=Infinity,yMin=Infinity,xMax=-Infinity,yMax=-Infinity;
    const transform=(a,b)=>[m[0]*a+m[2]*b+m[4],m[1]*a+m[3]*b+m[5]];
    function add(p){if(!p.every(Number.isFinite))throw Error('Vector bounds are not finite.');xMin=Math.min(xMin,p[0]);yMin=Math.min(yMin,p[1]);xMax=Math.max(xMax,p[0]);yMax=Math.max(yMax,p[1]);}
    function read(){if(i>=tokens.length||/^[A-Z]$/.test(tokens[i]))throw Error('Incomplete vector outline.');const n=Number(tokens[i++]);if(!Number.isFinite(n))throw Error('Vector coordinates are not finite.');return n;}
    function quadratic(p0,p1,p2){
      add(p0);add(p2);
      for(let axis=0;axis<2;axis++){const d0=p1[axis]-p0[axis],d1=p2[axis]-p1[axis],denominator=d1-d0,tolerance=64*Number.EPSILON*Math.max(1,Math.abs(d0),Math.abs(d1));if(Math.abs(denominator)<=tolerance)continue;const t=-d0/denominator;if(t>0&&t<1){const u=1-t;add([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]);}}
    }
    function cubic(p0,p1,p2,p3){
      add(p0);add(p3);
      const candidates=[];
      for(let axis=0;axis<2;axis++){
        const d0=p1[axis]-p0[axis],d1=p2[axis]-p1[axis],d2=p3[axis]-p2[axis];
        const a=d0-2*d1+d2,b=2*(d1-d0),c=d0,tolerance=64*Number.EPSILON*Math.max(1,Math.abs(d0),Math.abs(d1),Math.abs(d2));
        if(Math.abs(a)<=tolerance){if(Math.abs(b)>tolerance)candidates.push(-c/b);}
        else {const disc=b*b-4*a*c,discTolerance=64*Number.EPSILON*Math.max(1,b*b,Math.abs(4*a*c));if(disc>=-discTolerance){const r=Math.sqrt(Math.max(0,disc)),q=-.5*(b+(b<0?-r:r));if(q===0)candidates.push(-b/(2*a));else candidates.push(q/a,c/q);}}
      }
      for(const t of candidates)if(t>0&&t<1){const u=1-t;add([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]);}
    }
    while(i<tokens.length){
      if(/^[A-Z]$/.test(tokens[i]))command=tokens[i++];
      if(command==='Z'){x=startX;y=startY;add(transform(x,y));command=null;continue;}
      if(command==='M'){x=read();y=read();startX=x;startY=y;add(transform(x,y));command='L';}
      else if(command==='L'){x=read();y=read();add(transform(x,y));}
      else if(command==='H'){x=read();add(transform(x,y));}
      else if(command==='V'){y=read();add(transform(x,y));}
      else if(command==='Q'){const p0=transform(x,y),p1=transform(read(),read());x=read();y=read();quadratic(p0,p1,transform(x,y));}
      else if(command==='C'){const p0=transform(x,y),p1=transform(read(),read()),p2=transform(read(),read());x=read();y=read();cubic(p0,p1,p2,transform(x,y));}
      else throw Error('Vector outline must begin with a supported move command.');
    }
    return Number.isFinite(xMin)?{xMin,yMin,xMax,yMax,width:xMax-xMin,height:yMax-yMin}:null;
  }
  function outlineBounds(glyphs){const all=glyphs.map(g=>pathBounds(g.d,g.matrix)).filter(Boolean);return all.length?boundsFrom(all.flatMap(b=>[b.xMin,b.xMax]),all.flatMap(b=>[b.yMin,b.yMax])):null;}
  function boundsFrom(xs,ys){const xMin=Math.min(...xs),xMax=Math.max(...xs),yMin=Math.min(...ys),yMax=Math.max(...ys);return {xMin,yMin,xMax,yMax,width:xMax-xMin,height:yMax-yMin};}
  function outside(b,s){return b&&(b.xMin<s.marginMm-1e-7||b.yMin<s.marginMm-1e-7||b.xMax>s.widthMm-s.marginMm+1e-7||b.yMax>s.heightMm-s.marginMm+1e-7);}
  function layout(d,fonts) {
    if(d?.schema!==V2){const l=base.layout(d,fonts);return Object.assign({},l,{layers:[{id:primary,type:'text',name:'Main lettering',bounds:l.bounds,glyphStart:0,glyphCount:l.glyphs.length}]});}
    const v=validate(d,fonts),result={ok:v.ok,errors:v.errors.slice(),missingGlyphs:v.missingGlyphs,glyphs:[],bounds:null,blank:true,lineCount:1,layers:[]};
    if(!v.ok)return result;
    layerList(d).forEach(a=>{
      let bounds=null,glyphs=[];
      if(a.type==='text'){
        const l=base.layout(Object.assign(asV1(d),{text:a.text}),fonts);
        glyphs=l.glyphs;bounds=l.bounds;result.lineCount=Math.max(result.lineCount,l.lineCount);
        // The unrotated layout may lie outside a margin while a later rotation
        // brings it in. Only final geometry decides the physical bounds check.
        if(l.errors.some(e=>!/overflows the inset area/.test(e)))result.errors.push(...l.errors.filter(e=>!/overflows the inset area/.test(e)).map(e=>a.name+': '+e));
        if(bounds&&a.rotationDeg!==0){
          const m=rotateAround(a.rotationDeg,(bounds.xMin+bounds.xMax)/2,(bounds.yMin+bounds.yMax)/2);
          glyphs=glyphs.map(g=>({char:g.char,d:g.d,matrix:matrixProduct(m,g.matrix)}));bounds=outlineBounds(glyphs);
        }
      }else{
        const asset=catalog.graphics[a.assetId],b=asset.bounds,sx=a.widthMm/(b[2]-b[0]),sy=a.heightMm/(b[3]-b[1]);
        const move=[sx,0,0,sy,a.centerXmm-(b[0]+b[2])/2*sx,a.centerYmm-(b[1]+b[3])/2*sy];
        const m=matrixProduct(rotateAround(a.rotationDeg,a.centerXmm,a.centerYmm),move);
        glyphs=[{char:'',d:asset.d,matrix:m}];bounds=outlineBounds(glyphs);
      }
      const start=result.glyphs.length;result.glyphs.push(...glyphs);
      result.layers.push({id:a.id,type:a.type,name:a.name,bounds,glyphStart:start,glyphCount:glyphs.length});
      if(outside(bounds,d.stock))result.errors.push(a.name+' extends outside the blank margins. Move, rotate or reduce this object.');
    });
    if(result.glyphs.length>maxPaths)result.errors.push('Use at most 240 visible lettering outlines and graphics in one design.');
    const bounds=result.layers.map(a=>a.bounds).filter(Boolean);
    if(bounds.length)result.bounds=boundsFrom(bounds.flatMap(b=>[b.xMin,b.xMax]),bounds.flatMap(b=>[b.yMin,b.yMax]));
    result.blank=result.glyphs.length===0;result.ok=result.errors.length===0;return result;
  }
  function usable(d,fonts){const l=layout(d,fonts);if(!l.ok||l.blank)throw Error(l.errors.join(' ')||'Add supported lettering or a graphic before review or export.');return l;}
  function fontAssets(d,fonts) {
    const ids=[...new Set(layerList(d).filter(a=>a.type==='text').map(a=>a.text.fontId))];
    return ids.map(id=>{const f=fonts.fonts[id];if(!f)throw Error('Unknown lettering source.');return {id:f.id,name:f.name,source:f.source,sourceSha256:f.sourceSha256};});
  }
  function graphicAssets(d) {
    return [...new Set((d.layers||[]).filter(a=>a.type==='graphic').map(a=>a.assetId))].map(id=>{const a=catalog.graphics[id];if(!a)throw Error('Unknown graphic source.');return {id:a.id,name:a.name,source:a.source,sourceSha256:a.sourceSha256};});
  }
  function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
  async function hash(s){if(root.crypto?.subtle){const b=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(n=>n.toString(16).padStart(2,'0')).join('');}if(typeof require==='function')return require('node:crypto').createHash('sha256').update(s).digest('hex');throw Error('SHA-256 is unavailable in this context.');}
  async function fingerprint(d,fonts) {
    if(d?.schema!==V2)return base.fingerprint(d,fonts);
    const l=usable(d,fonts),content={schema:d.schema,applicationId:d.applicationId,title:d.title,stock:d.stock,text:d.text,appearance:d.appearance,request:d.request,origin:d.origin,primaryTransform:d.primaryTransform,layers:d.layers};
    return hash(canonical({design:content,fontAssets:fontAssets(d,fonts),graphicAssets:graphicAssets(d),geometry:l.glyphs}));
  }
  async function review(d,fonts){if(d?.schema!==V2)return base.review(d,fonts);checkTree(d);const n=clone(d);n.review={kind:'local-layout-review',fingerprint:await fingerprint(n,fonts),reviewedAt:new Date().toISOString(),productionReady:false};return n;}
  async function reviewMatches(d,fonts){try{if(d?.schema!==V2)return await base.reviewMatches(d,fonts);checkTree(d);return !!d.review&&d.review.kind==='local-layout-review'&&d.review.productionReady===false&&d.review.fingerprint===await fingerprint(d,fonts);}catch(_){return false;}}
  function xml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
  function toSvg(d,fonts) {
    if(d?.schema!==V2)return base.toSvg(d,fonts);
    const l=usable(d,fonts),s=d.stock,meta={schema:V2,applicationId:'carvewright',title:d.title,request:d.request,origin:d.origin,units:'mm',fontAssets:fontAssets(d,fonts),graphicAssets:graphicAssets(d),productionReady:false,toolpathsIncluded:false,review:'Local layout review only; not customer approval or machining release.'};
    const text=JSON.stringify(meta).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff\ufffe\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="'+s.widthMm+'mm" height="'+s.heightMm+'mm" viewBox="0 0 '+s.widthMm+' '+s.heightMm+'">\n<metadata>'+xml(text)+'</metadata>\n<g fill="'+d.appearance.ink+'" fill-rule="nonzero">\n'+base.renderPaths(l)+'\n</g>\n</svg>\n';
  }
  async function createPacket(d,fonts) {
    if(d?.schema!==V2)return base.createPacket(d,fonts);
    checkTree(d);const s=clone(d),l=usable(s,fonts);return {schema:P2,design:s,fontAssets:fontAssets(s,fonts),graphicAssets:graphicAssets(s),geometry:l.glyphs,fingerprint:await fingerprint(s,fonts),productionReady:false,toolpathsIncluded:false};
  }
  async function readPacket(text,fonts) {
    if(typeof text!=='string'||text.length>4194304||new TextEncoder().encode(text).byteLength>4194304)throw Error('Job file must be at most 4 MiB.');
    let p;try{p=JSON.parse(text);}catch(_){throw Error('Job file is not valid JSON.');}
    if(p?.schema!==P2)return base.readPacket(text,fonts);
    checkTree(p);const errors=[];
    fields(p,['schema','design','fontAssets','graphicAssets','geometry','fingerprint','productionReady','toolpathsIncluded'],'job',errors);
    if(errors.length||p.design?.schema!==V2||p.productionReady!==false||p.toolpathsIncluded!==false)throw Error('Unsupported or malformed layered job file. '+errors.join(' '));
    const l=usable(p.design,fonts);
    if(canonical(p.fontAssets)!==canonical(fontAssets(p.design,fonts)))throw Error('Job font assets do not match the bundled fonts.');
    if(canonical(p.graphicAssets)!==canonical(graphicAssets(p.design)))throw Error('Job graphic assets do not match the bundled artwork.');
    if(canonical(p.geometry)!==canonical(l.glyphs))throw Error('Job geometry does not match the exact regenerated paths.');
    if(typeof p.fingerprint!=='string'||!/[a-f0-9]{64}/.test(p.fingerprint)||p.fingerprint!==await fingerprint(p.design,fonts))throw Error('Job fingerprint does not match design and paths.');
    const n=clone(p.design);if(!n.origin)n.origin={kind:'carvewright-file',applicationId:'carvewright',designId:n.id,revision:n.revision,fingerprint:p.fingerprint};
    n.id=newId();n.revision=0;n.review=null;return n;
  }
  async function createOrderBrief(d,fonts) {
    checkTree(d);if(!Number.isSafeInteger(d.revision)||d.revision<1||!await reviewMatches(d,fonts))throw Error('Choose a saved, reviewed layout for the order brief.');
    const artwork=await createPacket(d,fonts);
    return {schema:'blackflag-design-order-brief-v1',createdAt:new Date().toISOString(),target:{vesselId:d.request.vesselId||null,vesselName:d.request.vesselName||'Own work',jobReference:d.request.jobReference},source:{applicationId:'carvewright',designId:d.id,revision:d.revision,title:d.title,fingerprint:artwork.fingerprint},stock:clone(d.stock),notes:d.request.brief,requestedOutput:d.request.output,wording:layerList(d).filter(a=>a.type==='text').map(a=>({name:a.name,value:a.text.value})),artwork,orderCreated:false,productionReady:false,physicalMachineAcceptance:false};
  }
  async function toOrderBriefHtml(d,fonts) {
    const b=await createOrderBrief(d,fonts),svg=toSvg(d,fonts).replace(/<\?xml[^>]*>\s*/,''),inch=n=>Number((n/25.4).toFixed(3));
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+xml(d.title)+' — order brief</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#173a3e;max-width:900px;margin:36px auto;padding:0 24px}header{border-bottom:3px solid #286b60;padding-bottom:20px}small{letter-spacing:.08em;color:#567571}h1{font-size:32px;margin:8px 0}h2{font-size:20px}dl{display:grid;grid-template-columns:1fr 1fr;gap:18px}dt{font-size:13px;color:#567571}dd{margin:0;font-weight:600}.art{padding:24px 0}.art svg{display:block;width:100%;height:auto;border:1px solid #b4c6be;background:#f7f3e9}.notes{white-space:pre-wrap}.fingerprint{overflow-wrap:anywhere;font:11px monospace}footer{font-size:13px;border-top:1px solid #b4c6be;margin-top:28px;padding-top:18px}@media print{body{margin:12mm;max-width:none;padding:0}.art{break-inside:avoid}}</style></head><body><header><small>CARVEWRIGHT · DESIGN ORDER BRIEF</small><h1>'+xml(d.title)+'</h1><p>Prepared for <strong>'+xml(b.target.vesselName)+'</strong> · saved revision '+d.revision+'</p></header><dl><div><dt>Order / source reference</dt><dd>'+xml(b.target.jobReference||'Not assigned')+'</dd></div><div><dt>Blank dimensions</dt><dd>'+inch(d.stock.widthMm)+' × '+inch(d.stock.heightMm)+' × '+inch(d.stock.thicknessMm)+' in</dd></div><div><dt>Material / blank</dt><dd>'+xml(d.stock.species)+' · '+xml(d.stock.id)+'</dd></div><div><dt>Layout status</dt><dd>Locally reviewed</dd></div></dl><div class="art">'+svg+'</div><h2>Wording</h2>'+b.wording.filter(a=>a.value).map(a=>'<p class="notes"><strong>'+xml(a.name)+'</strong><br>'+xml(a.value)+'</p>').join('')+'<h2>Job notes</h2><p class="notes">'+xml(b.notes||'No additional notes.')+'</p><footer>Design handoff for review. This document creates no order and is not a machining release. The editable design and artwork remain in the accompanying files.<p class="fingerprint">Layout fingerprint: '+xml(b.source.fingerprint)+'</p></footer></body></html>';
  }
  const api=Object.freeze(Object.assign({},base,{validate,layout,ensureLayers,layerList,addTextLayer,addGraphicLayer,duplicateLayer,removeLayer,fontAssets,graphicAssets,fingerprint,review,reviewMatches,toSvg,createPacket,readPacket,createOrderBrief,toOrderBriefHtml}));
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CarvewrightCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,
  typeof module==='object'&&module.exports?module.exports:globalThis.CarvewrightCore,
  typeof module==='object'&&module.exports?require('./fleet_design_assets.js'):globalThis.BlackFlagDesignAssets);
