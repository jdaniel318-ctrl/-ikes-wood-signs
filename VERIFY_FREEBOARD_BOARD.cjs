'use strict';
// Local synthetic pixels only; visual candidates never prove wood identity or size.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const W=require('./woodwright_fit.js'),B=require('./boardcraft_photo.js'),D=require('./carvewright_core.js'),Fonts=require('./carve_fonts.js');
const fixture=(w=320,h=200,rects=[{x:88,y:118,w:208,h:58}])=>{
 const data=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const inside=rects.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
  data.set(inside?[165,105,60,255]:[192,183,166,255],4*(y*w+x));
 }
 return {data,width:w,height:h};
};
const detect=f=>W.detectPixels(f.data,f.width,f.height);
const photo=(width=320,height=200)=>({id:'off-center-board',mime:'image/jpeg',dataUrl:'data:image/jpeg;base64,/9j/2Q==',sha256:'a'.repeat(64),width,height});
const evidence=(p,s)=>s?{photoId:p.id,region:{x:s.region.x,y:s.region.y,w:s.region.w,h:s.region.h},source:'woodwright-inset-candidate',requiresVisualReview:true,productionCertified:false}:null;
const draft=()=>{const d=D.createDraft();d.text.value='Andie';d.stock.widthMm=600;d.stock.heightMm=160;return d;};
const approx=(a,b,msg)=>assert(Math.abs(a-b)<1e-9,msg||`${a} ~= ${b}`);
const rotated=(r,q)=>[{...r},{x:1-r.y-r.h,y:r.x,w:r.h,h:r.w},{x:1-r.x-r.w,y:1-r.y-r.h,w:r.w,h:r.h},{x:r.y,y:1-r.x-r.w,w:r.h,h:r.w}][q];
const inside=(f,r)=>{assert(f.x>=r.x-1e-9);assert(f.y>=r.y-1e-9);assert(f.x+f.w<=r.x+r.w+1e-9);assert(f.y+f.h<=r.y+r.h+1e-9);};

test('existing detector isolates off-center warm rectangle without changing source pixels',()=>{
 const f=fixture(),before=Buffer.from(f.data),s=detect(f);assert(s);assert.equal(Buffer.compare(before,Buffer.from(f.data)),0);
 inside(s.region,{x:88/320,y:118/200,w:208/320,h:58/200});
 assert(s.region.x+s.region.w/2>.55);assert(s.region.y+s.region.h/2>.65);assert.equal(s.productionCertified,false);assert.equal(s.requiresVisualReview,true);
});
test('no wood, full warm scene, and competing candidates fail closed',()=>{
 assert.equal(detect(fixture(320,200,[])),null);
 assert.equal(detect(fixture(320,200,[{x:0,y:0,w:320,h:200}])),null);
 assert.equal(detect(fixture(320,200,[{x:20,y:40,w:110,h:45},{x:190,y:115,w:110,h:45}])),null);
});
test('detected initial frame follows visible board, keeps uniform design scale and whole photo',()=>{
 const f=fixture(),p=photo(),d=draft(),s=detect(f),area=evidence(p,s),before=JSON.stringify({p,d,area}),b=B.createBoard(d,p,0,area),scene=B.scene(d,p,b,Fonts);
 inside(b.frame,s.region);approx(b.frame.x+b.frame.w/2,s.region.x+s.region.w/2);approx(b.frame.y+b.frame.h/2,s.region.y+s.region.h/2);
 assert.equal(b.frameConfirmed,false);assert.equal(b.dimensionsStatus,'reference-unconfirmed');assert.equal(B.validate(d,p,b,Fonts,{requireConfirmed:true}).ok,false);
 assert.equal(scene.width,p.width);assert.equal(scene.height,p.height);assert(scene.svg.includes(p.dataUrl));assert(scene.photoSvg.includes('preserveAspectRatio="xMidYMid meet"'));
 approx(scene.matrix[0],scene.matrix[3]);assert.equal(JSON.stringify({p,d,area}),before);
});
test('all quarter turns and portrait/landscape aspects stay inside transformed original-photo region',()=>{
 for(const [w,h,r] of [[320,200,{x:88,y:118,w:208,h:58}],[200,320,{x:115,y:80,w:58,h:208}]]){
  const s=detect(fixture(w,h,[r])),p=photo(w,h),d=draft(),area=evidence(p,s);assert(s);
  for(const q of [0,1,2,3]){
   const b=B.createBoard(d,p,q,area),rr=rotated(s.region,q),scene=B.scene(d,p,b,Fonts);inside(b.frame,rr);
   approx(b.frame.x+b.frame.w/2,rr.x+rr.w/2);approx(b.frame.y+b.frame.h/2,rr.y+rr.h/2);
   approx(scene.framePixels.w/scene.framePixels.h,d.stock.widthMm/d.stock.heightMm);assert.equal(B.validate(d,p,b,Fonts).ok,true);
   assert.equal(scene.width,q%2?h:w);assert.equal(scene.height,q%2?w:h);
  }
 }
});
test('missing, stale, ambiguous or malformed evidence gives bounded unconfirmed fallback',()=>{
 const p=photo(),d=draft(),full=B.initialFrame(d,p),good=evidence(p,detect(fixture()));
 for(const area of [null,undefined,{...good,photoId:'old-photo'},{...good,productionCertified:true},{...good,requiresVisualReview:false},{...good,region:{x:0,y:0,w:NaN,h:.3}},{...good,region:{x:.9,y:.6,w:.5,h:.3}},{...good,region:{x:.5,y:.5,w:.00001,h:.00001}}]){
  const b=B.createBoard(d,p,0,area);approx(b.frame.w,full.w*.8);approx(b.frame.h,full.h*.8);approx(b.frame.x+b.frame.w/2,.5);approx(b.frame.y+b.frame.h/2,.5);
  assert.equal(b.frameConfirmed,false);assert.equal(b.dimensionsStatus,'reference-unconfirmed');assert(B.validate(d,p,b,Fonts).ok);
 }
});
test('recognition returns serializable photo-bound area while retaining existing evidence',async()=>{
 const f=fixture(),s=detect(f),p=photo();
 // Canvas sampler exercises the unchanged species/length wrapper without a browser or network.
 const context={console,Uint8Array,Uint8ClampedArray,Int16Array,Math,Image:class {constructor(){this.width=f.width;this.height=f.height;}set src(_){queueMicrotask(()=>this.onload());}},document:{createElement(){let args=[];return {getContext(){return {drawImage(...a){args=a;},getImageData(x,y,w,h){const out=new Uint8ClampedArray(w*h*4),crop=args.length===9?[args[1],args[2],args[3],args[4]]:[0,0,f.width,f.height];for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const sx=Math.min(f.width-1,Math.floor(crop[0]+xx/w*crop[2])),sy=Math.min(f.height-1,Math.floor(crop[1]+yy/h*crop[3]));out.set(f.data.subarray(4*(sy*f.width+sx),4*(sy*f.width+sx)+4),4*(yy*w+xx));}return {data:out};}};}};}},window:{BlackFlagWoodwright:{analyzeImage:()=>s}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/countercraft_recognition.js','utf8'),context);
 const result=JSON.parse(JSON.stringify(await context.CountercraftRecognition.analyze(p)));assert.deepEqual(result.boardArea,evidence(p,s));assert('species' in result&&'length' in result&&'orientation' in result);
 context.window.BlackFlagWoodwright.analyzeImage=()=>null;assert.equal((await context.CountercraftRecognition.analyze(p)).boardArea,null);
});

test('actual Studio reset and dimension handlers retain evidence while manual scale keeps full range',async()=>{
 const source=fs.readFileSync(__dirname+'/carvewright_studio.js','utf8');
 const extract=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)+start.length));
 const clone=v=>JSON.parse(JSON.stringify(v)),p=photo(),d=draft(),area=evidence(p,detect(fixture()));
 const context={JSON,Math,Number,clone,photoCore:()=>B,remember(){},changed(s){s.boardPhoto.board.frameConfirmed=false;},status(){},alive:()=>true,applyBoard(s,b){s.boardPhoto.board=b;s.boardPhoto.board.frameConfirmed=false;}};
 vm.createContext(context);vm.runInContext(extract('  function applyDraft(', '  function applyBoard(')+extract('  function boardInput(', '  function mutate(')+extract('  async function click(', '  function input('),context);
 const s={draft:d,boardPhoto:{photo:p,board:B.createBoard(d,p,0,area),boardArea:area},root:{contains:()=>true},selectedId:'primary'};
 context.boardInput(s,'cweFrameScale','100');approx(s.boardPhoto.board.frame.w,B.initialFrame(d,p).w);
 const click=id=>context.click(s,{target:{closest:()=>({id})}});
 await click('cweFrameReset');assert.deepEqual(s.boardPhoto.board.frame,B.createBoard(d,p,0,area).frame);
 await click('cwePhotoRotateRight');assert.equal(s.boardPhoto.board.quarterTurns,1);assert.deepEqual(s.boardPhoto.board.frame,B.createBoard(d,p,1,area).frame);
 const next=clone(d);next.stock.widthMm=304.8;context.applyDraft(s,next);assert.deepEqual(s.boardPhoto.board.frame,B.createBoard(next,p,1,area).frame);assert.equal(s.boardPhoto.board.frameConfirmed,false);
 s.boardPhoto.boardArea=null;await click('cweFrameReset');assert.deepEqual(s.boardPhoto.board.frame,B.createBoard(next,p,1).frame);
});
