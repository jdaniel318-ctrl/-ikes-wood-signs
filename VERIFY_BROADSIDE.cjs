'use strict';
// Synthetic pixels and bundled design assets only.
const assert=require('node:assert/strict');
const {test}=require('node:test');
const B=require('./boardcraft_photo.js'),D=require('./carvewright_core.js'),F=require('./carve_fonts.js');
const I=require('./ike_photo_size.js'),W=require('./woodwright_fit.js'),Flow=require('./countercraft_flow.js');
const width=360,height=210,photo={id:'fixture-plank',width,height,mime:'image/jpeg',sha256:'a'.repeat(64),dataUrl:'data:image/jpeg;base64,/9j/2Q=='};
function scan(knot,clipped=false){
  const pixels=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const face=x>(clipped?-5:36)&&x<330&&y>53+4*Math.sin(x/19)&&y<154+3*Math.sin(x/14);
    const mark=knot&&Math.hypot(x-57,(y-103)*1.7)<10;
    pixels.set(face?(mark?[38,32,30,255]:[169,108,56,255]):[193,189,186,255],4*(y*width+x));
  }
  return I.inspect(pixels,width,height,W);
}
function lettering(size=100){
  const d=Flow.create().state().request.design;
  Object.assign(d.text,{value:'Andie Rose',sizePercent:size});
  return d;
}
function separate(a,b){return a.xMax<=b.xMin||b.xMax<=a.xMin||a.yMax<=b.yMin||b.yMax<=a.yMin;}
test('a dark knot leaves the face, physical dimensions and single edge margin intact',()=>{
  const marked=scan(true),clean=scan(false),d=lettering(),stock=structuredClone(d.stock);
  const area=I.faceArea(photo,marked);assert(area);assert.deepEqual(area,I.faceArea(photo,clean));assert.equal(marked.reference,null);
  const board=B.createBoard(d,photo,0,area);
  const old=B.createBoard(d,photo,0,{...area,source:'woodwright-inset-candidate',fit:'stock-interior',region:marked.region});
  assert(board.frame.w>old.frame.w);assert.equal(board.frameConfirmed,false);
  const scene=B.scene(d,photo,board,F),bounds=D.layout(d,F).bounds;
  assert.equal(scene.matrix[0],scene.matrix[3]);
  assert(bounds.width*scene.matrix[0]>(330-36)*.90);
  assert.deepEqual(stock,d.stock);
  for(const turns of [0,1,2,3]){
    const b=B.createBoard(d,photo,turns,area);assert(B.validate(d,photo,b,F).ok);assert.equal(b.dimensionsStatus,'reference-unconfirmed');
  }
  assert.equal(I.faceArea(photo,scan(true,true)),null);
  for(const invalid of [{productionCertified:true},{photoId:'different-photo'},{requiresVisualReview:false}]){
    assert.deepEqual(B.createBoard(d,photo,0,{...area,...invalid}),B.createBoard(d,photo));
  }
  // The prior stock-interior rule maps the already inset rectangle onto the
  // stock's inner dimensions. Approved older frames keep that exact scale.
  const r=marked.region,innerScale=Math.min(r.w*width/(stock.widthMm-2*stock.marginMm),r.h*height/(stock.heightMm-2*stock.marginMm));
  assert(Math.abs(B.scene(d,photo,old,F).matrix[0]-innerScale)<1e-8);
});
test('artwork takes a free side first, or the space above or below full-width lettering',async()=>{
  for(const size of [50,85,100]){
    const original=lettering(size),first=D.addGraphicLayer(original,'oak-leaf',F);
    const [word,leaf]=D.layout(first,F).layers.map(layer=>layer.bounds);
    assert(separate(word,leaf));if(size===50)assert(leaf.xMax<=word.xMin||leaf.xMin>=word.xMax);
    const next=D.addGraphicLayer(first,'anchor',F),layout=D.layout(next,F);
    assert(layout.ok,layout.errors.join(' '));
    const anchor=layout.layers[2].bounds;assert(separate(word,anchor));assert(separate(leaf,anchor));
    assert.deepEqual(next.layers[0],first.layers[0]);assert.deepEqual(next.text,original.text);
    const saved=await D.readPacket(JSON.stringify(await D.createPacket(next,F)),F);
    assert.deepEqual(D.layout(saved,F).glyphs,layout.glyphs);
  }
});
test('blank stock, existing graphic placement and a full board stay editable',()=>{
  const blank=lettering();blank.text.value='';
  const centered=D.addGraphicLayer(blank,'anchor',F);assert.equal(centered.layers[0].centerXmm,blank.stock.widthMm/2);
  const oldDefault=D.addGraphicLayer(lettering(60),'anchor');assert.equal(oldDefault.layers[0].centerXmm,blank.stock.widthMm/2);
  const filled=D.addGraphicLayer(blank,'star');const a=filled.layers[0];
  a.widthMm=filled.stock.widthMm-2*filled.stock.marginMm;a.heightMm=filled.stock.heightMm-2*filled.stock.marginMm;
  const added=D.addGraphicLayer(filled,'oak-leaf',F);
  assert.deepEqual(added.layers[0],a);assert.equal(added.layers.length,2);
  assert(D.layout(added,F).ok);assert.equal(added.review,null);
});
