/* Carvewright Sightline: trial measurement evidence. No storage, network or machine authority.
 * Homographies use a known rectangular reference on the SAME PLANE as the board face.
 * Native evidence uses ARKit metre-space raycasts; neither method certifies machining accuracy. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;g.CarvewrightCapture=api;})(globalThis,function(){'use strict';
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const clone=v=>JSON.parse(JSON.stringify(v));
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
function points(p,n=2){if(!Array.isArray(p)||p.length!==4||p.some(v=>!Array.isArray(v)||v.length!==n||v.some(x=>!finite(x,-1e5,1e5))))throw Error('Four finite corners are required.');return p;}
function quad(p,minEdge=.01){points(p);const turns=p.map((_,i)=>cross(p[i],p[(i+1)%4],p[(i+2)%4]));if(turns.some(x=>Math.abs(x)<1e-8)||!turns.every(x=>Math.sign(x)===Math.sign(turns[0]))||p.some((a,i)=>dist(a,p[(i+1)%4])<minEdge))throw Error('Choose four corners around the edge without crossing.');return p;}
function homography(source,target){quad(source);quad(target);const a=[];for(let i=0;i<4;i++){const [x,y]=source[i],[u,v]=target[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}for(let c=0;c<8;c++){let best=c;for(let r=c+1;r<8;r++)if(Math.abs(a[r][c])>Math.abs(a[best][c]))best=r;[a[c],a[best]]=[a[best],a[c]];const pivot=a[c][c];if(Math.abs(pivot)<1e-10)throw Error('This view is too flat to measure. Retake from above.');a[c]=a[c].map(v=>v/pivot);for(let r=0;r<8;r++)if(r!==c){const k=a[r][c];a[r]=a[r].map((v,j)=>v-k*a[c][j]);}}return a.map(r=>r[8]).concat(1);}
function project(h,p){const z=h[6]*p[0]+h[7]*p[1]+h[8];if(!Number.isFinite(z)||Math.abs(z)<1e-8)throw Error('Perspective cannot be resolved.');const r=[(h[0]*p[0]+h[1]*p[1]+h[2])/z,(h[3]*p[0]+h[4]*p[1]+h[5])/z];if(!r.every(Number.isFinite))throw Error('Invalid projection.');return r;}
function normalize(p){quad(p);let q=p.map(v=>v.slice());if(dist(q[0],q[1])<dist(q[1],q[2]))q=q.slice(1).concat([q[0]]);const edge=dist(q[0],q[1]),u=[(q[1][0]-q[0][0])/edge,(q[1][1]-q[0][1])/edge];const v=[-u[1],u[0]],origin=q[0];let r=q.map(a=>{const d=[a[0]-origin[0],a[1]-origin[1]];return [d[0]*u[0]+d[1]*u[1],d[0]*v[0]+d[1]*v[1]];});if(r[2][1]<0)r=r.map(([x,y])=>[x,-y]);const xs=r.map(v=>v[0]),ys=r.map(v=>v[1]),minX=Math.min(...xs),minY=Math.min(...ys),widthMm=Math.max(...xs)-minX,heightMm=Math.max(...ys)-minY;if(!finite(widthMm,25.4,3048)||!finite(heightMm,25.4,3048))throw Error('Trial boards must measure between 1 inch and 10 feet per side. Check the reference corners.');return {widthMm,heightMm,outlineMm:r.map(([x,y])=>[x-minX,y-minY]),reordered:q};}
function base(p,source){return {...normalize(p),source,units:'mm',thicknessMm:null,species:null,productionReady:false,accuracy:'unverified-device-trial'};}
function imagePoints(p,w,h){quad(p,2);if(!Number.isInteger(w)||!Number.isInteger(h)||!finite(w,1,10000)||!finite(h,1,10000)||p.some(a=>!finite(a[0],0,w)||!finite(a[1],0,h)))throw Error('Keep every corner inside the photograph.');}
const REFERENCE_SIZES=Object.freeze({'index-3x5':Object.freeze({widthMm:127,heightMm:76.2,label:'3 × 5 inch index card'}),'index-4x6':Object.freeze({widthMm:152.4,heightMm:101.6,label:'4 × 6 inch index card'})});
function referenceSize(type='index-3x5'){if(!Object.hasOwn(REFERENCE_SIZES,type))throw Error('Choose a supported index-card size.');return REFERENCE_SIZES[type];}
function measurePhoto({reference,board,imageWidth,imageHeight,referenceType='index-3x5'}){const size=referenceSize(referenceType);imagePoints(reference,imageWidth,imageHeight);imagePoints(board,imageWidth,imageHeight);quad(reference,20);const area=Math.abs(reference.reduce((s,p,i)=>s+p[0]*reference[(i+1)%4][1]-p[1]*reference[(i+1)%4][0],0))/2;if(area<900)throw Error('Move closer so the reference fills more of the photo.');const h=homography(reference,[[0,0],[size.widthMm,0],[size.widthMm,size.heightMm],[0,size.heightMm]]);const denominators=board.map(p=>h[6]*p[0]+h[7]*p[1]+1);if(!denominators.every(v=>v>0)||Math.max(...denominators)/Math.min(...denominators)>4)throw Error('Retake the photograph closer to straight above.');const world=board.map(p=>project(h,p)),m=base(world,'photo-reference');const offset=dist(world[0],world[1])<dist(world[1],world[2])?1:0;m.photoCorners=board.slice(offset).concat(board.slice(0,offset));m.imageWidth=imageWidth;m.imageHeight=imageHeight;m.reference={type:referenceType,widthMm:size.widthMm,heightMm:size.heightMm,corners:clone(reference),samePlaneRequired:true};delete m.reordered;return m;}
// Replace the marked reference in a COPY of the raster. No private card pixels are
// embedded beneath an overlay in the shareable proof. Writing must stay on the card.
function redactReference(rgba,width,height,reference){
 imagePoints(reference,width,height);
 if(!(rgba instanceof Uint8ClampedArray)||rgba.length!==width*height*4)throw Error('Photo pixels do not match their dimensions.');
 const out=rgba.slice(),pad=Math.max(3,Math.min(...reference.map((p,i)=>dist(p,reference[(i+1)%4])))*.03);
 const xs=reference.map(p=>p[0]),ys=reference.map(p=>p[1]);
 const minX=Math.max(0,Math.floor(Math.min(...xs)-pad)),maxX=Math.min(width-1,Math.ceil(Math.max(...xs)+pad));
 const minY=Math.max(0,Math.floor(Math.min(...ys)-pad)),maxY=Math.min(height-1,Math.ceil(Math.max(...ys)+pad));
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
  const p=[x+.5,y+.5],turns=reference.map((a,i)=>cross(a,reference[(i+1)%4],p));
  const inside=turns.every(v=>v>=0)||turns.every(v=>v<=0);
  const nearEdge=inside||reference.some((a,i)=>{const b=reference[(i+1)%4],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<=pad;});
  if(nearEdge)out.set([245,240,221,255],(y*width+x)*4);
 }
 return out;
}
// Read only bounded JPEG frame headers before the browser allocates decoded pixels.
// This is a size preflight, not a replacement for the browser's JPEG decoder.
function nativePhotoSize(packet){
 const w=packet.imageWidth,h=packet.imageHeight;
 if(!Number.isInteger(w)||!Number.isInteger(h)||!finite(w,1,10000)||!finite(h,1,10000)||w*h>16000000)throw Error('Native photo must be at most 16 megapixels.');
 const raw=atob(packet.imageJpegBase64),byte=i=>raw.charCodeAt(i),word=i=>byte(i)*256+byte(i+1);
 if(raw.length<4||word(0)!==0xffd8)throw Error('Invalid JPEG photo header.');
 let i=2;
 while(i<raw.length){
  if(byte(i++)!==0xff)throw Error('Invalid JPEG photo marker.');
  while(i<raw.length&&byte(i)===0xff)i++;
  const marker=byte(i++);
  if(!Number.isInteger(marker)||marker===0xda||marker===0xd9||marker===0x00||marker===0xd8||marker>=0xd0&&marker<=0xd7)break;
  if(marker===0x01)continue;
  if(i+2>raw.length)break;
  const length=word(i);
  if(length<2||i+length>raw.length)break;
  if([0xc0,0xc1,0xc2].includes(marker)){
   if(length<11||byte(i+2)!==8||byte(i+7)<1||byte(i+7)>4||length!==8+3*byte(i+7))break;
   if(word(i+3)!==h||word(i+5)!==w)throw Error('Native JPEG photo dimensions do not match its evidence.');
   return;
  }
  i+=length;
 }
 throw Error('Native capture needs a valid JPEG photo frame header.');
}
function readNative(packet){if(!packet||typeof packet!=='object'||Array.isArray(packet))throw Error('Choose a native capture JSON file.');const keys=['schema','id','createdAt','units','tracking','planeSource','sampleCount','spreadMm','imageWidth','imageHeight','imageJpegBase64','corners','worldCornersMetres'];if(Object.keys(packet).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(packet,k)))throw Error('Unsupported capture fields.');if(packet.schema!=='carvewright-native-capture-v1'||packet.units!=='m'||packet.tracking!=='normal'||packet.planeSource!=='existingPlaneGeometry'||!Number.isInteger(packet.sampleCount)||!finite(packet.sampleCount,5,300)||!finite(packet.spreadMm,0,8))throw Error('Capture needs stable tracking and five consistent board observations.');if(typeof packet.id!=='string'||!/^[\w-]{1,80}$/.test(packet.id)||typeof packet.createdAt!=='string'||packet.createdAt.length>40||!Number.isFinite(Date.parse(packet.createdAt)))throw Error('Invalid capture identity.');if(typeof packet.imageJpegBase64!=='string'||packet.imageJpegBase64.length>8*1024*1024||!/^\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(packet.imageJpegBase64)||packet.imageJpegBase64.length%4)throw Error('Capture needs a bounded JPEG photo.');nativePhotoSize(packet);points(packet.corners);if(packet.corners.some(p=>p.some(v=>!finite(v,0,1))))throw Error('Invalid image corners.');const px=packet.corners.map(([x,y])=>[x*packet.imageWidth,y*packet.imageHeight]);imagePoints(px,packet.imageWidth,packet.imageHeight);const q=points(packet.worldCornersMetres,3);if(q.some(p=>p.some(v=>!finite(v,-100,100))))throw Error('Capture coordinates are out of range.');const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),unit=a=>{const len=Math.hypot(...a);if(len<.001)throw Error('Board corners overlap.');return a.map(v=>v/len);};const u=unit(sub(q[1],q[0])),d=sub(q[3],q[0]),n=unit([u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]]),v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]];if(q.some(p=>Math.abs(dot(sub(p,q[0]),n))>.004))throw Error('Board corners are not on the same measured plane.');const flat=q.map(p=>[dot(sub(p,q[0]),u)*1000,dot(sub(p,q[0]),v)*1000]),m=base(flat,'arkit-plane'),offset=dist(flat[0],flat[1])<dist(flat[1],flat[2])?1:0;delete m.reordered;Object.assign(m,{photoCorners:px.slice(offset).concat(px.slice(0,offset)),imageWidth:packet.imageWidth,imageHeight:packet.imageHeight,captureId:packet.id,sampleCount:packet.sampleCount,repeatSpreadMm:packet.spreadMm});return m;}
function priceOptions(m,rates){if(!finite(m?.widthMm,25.4,3048)||!Array.isArray(rates)||rates.length>30)throw Error('Invalid pricing inputs.');return {finalPriceCents:null,reason:'Species and measured size need shop validation.',options:rates.map(r=>{if(typeof r.species!=='string'||!r.species.trim()||r.species.length>80||!Number.isSafeInteger(r.centsPerFoot)||!finite(r.centsPerFoot,0,1000000))throw Error('Enter a valid price per foot.');return {species:r.species,estimateCents:Math.round(m.widthMm/304.8*r.centsPerFoot)};})};}
function evidence(m,wording){if(!m||m.productionReady!==false||m.thicknessMm!==null||m.species!==null||!finite(m.widthMm,25.4,3048)||!finite(m.heightMm,25.4,3048))throw Error('Only trial measurements can be exported here.');quad(m.outlineMm);return {schema:'carvewright-measurement-trial-v1',id:'CW-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)),createdAt:new Date().toISOString(),measurement:clone(m),wording:String(wording).slice(0,160),customerApproved:false,machineProgramIncluded:false,notes:'Unverified camera measurement. Compare against a ruler. Thickness, species and machining setup remain unconfirmed.'};}
return Object.freeze({referenceSize,measurePhoto,redactReference,readNative,homography,project,priceOptions,evidence});});
