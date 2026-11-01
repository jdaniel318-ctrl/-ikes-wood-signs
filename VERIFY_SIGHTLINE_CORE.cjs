'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
assert.ok(fs.existsSync(__dirname+'/carvewright_capture_core.js'),'capture measurement core must exist');
const C=require('./carvewright_capture_core.js');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS',name);};
const near=(a,b)=>assert.ok(Math.abs(a-b)<.001,`${a} != ${b}`);
// Independent perspective projection of a 600 x 200 mm board and a 3 x 5 inch index card.
const p=([x,y])=>[(1.2*x+.18*y+80)/(.0002*x+.0001*y+1),(0.1*x+1.3*y+60)/(.0002*x+.0001*y+1)];
const card=[[40,40],[167,40],[167,116.2],[40,116.2]].map(p);
const board=[[0,0],[600,0],[600,200],[0,200]].map(p);
const photo=()=>C.measurePhoto({reference:card,board,imageWidth:1000,imageHeight:600});
test('known-size reference recovers independent perspective dimensions',()=>{const m=photo();near(m.widthMm,600);near(m.heightMm,200);assert.equal(m.thicknessMm,null);assert.equal(m.productionReady,false);assert.equal(m.species,null);});
test('photo calibration retains the actual board polygon',()=>{const m=photo();near(m.outlineMm[1][0],600);near(m.outlineMm[2][1],200);assert.equal(m.source,'photo-reference');});
test('corner ordering, tiny reference and outside-photo points are rejected',()=>{for(const ref of [[card[0],card[2],card[1],card[3]],[[1,1],[2,1],[2,2],[1,2]],card.map(([x,y])=>[x-2000,y])])assert.throws(()=>C.measurePhoto({reference:ref,board,imageWidth:1000,imageHeight:600}));});
test('extreme perspective and tiny or huge wood cannot become a design',()=>{for(const b of [[[0,0],[10000,0],[10000,1],[0,1]],[[1,1],[1.1,1],[1.1,1.1],[1,1.1]]])assert.throws(()=>C.measurePhoto({reference:card,board:b,imageWidth:1000,imageHeight:600}));});
// Minimal JPEG frame headers exercise preflight parsing; browser decoding is checked separately.
const jpegHeader=(w,h,frame=0xc0)=>Buffer.from([0xff,0xd8,0xff,frame,0,11,8,h>>8,h&255,w>>8,w&255,1,1,0x11,0,0xff,0xd9]).toString('base64');
const native=()=>({schema:'carvewright-native-capture-v1',id:'test-capture-1',createdAt:'2026-11-01T12:00:00Z',units:'m',tracking:'normal',planeSource:'existingPlaneGeometry',sampleCount:5,spreadMm:2,imageWidth:1000,imageHeight:600,imageJpegBase64:jpegHeader(1000,600),corners:[[.1,.1],[.7,.1],[.7,.3],[.1,.3]],worldCornersMetres:[[0,0,0],[.6,0,0],[.6,0,.2],[0,0,.2]]});
test('native metre geometry becomes millimetres, without production authority',()=>{const m=C.readNative(native());near(m.widthMm,600);near(m.heightMm,200);assert.equal(m.source,'arkit-plane');assert.equal(m.productionReady,false);});
test('native malformed, unstable, sparse or non-planar evidence is refused',()=>{for(const patch of [{units:'mm'},{tracking:'limited'},{spreadMm:40},{sampleCount:1},{worldCornersMetres:[[0,0,0],[.6,0,0],[.6,.1,.2],[0,0,.2]]},{imageJpegBase64:'<svg onload="alert(1)">'}])assert.throws(()=>C.readNative({...native(),...patch}));});
test('a caller cannot import production approval or executable output',()=>{assert.throws(()=>C.readNative({...native(),productionReady:true}));assert.throws(()=>C.readNative({...native(),gcode:'G0 X0'}));});
test('unverified species never silently selects a final price',()=>{const rows=C.priceOptions(photo(),[{species:'Pine',centsPerFoot:700},{species:'Cedar',centsPerFoot:900}]);assert.equal(rows.finalPriceCents,null);assert.equal(rows.options[0].estimateCents,1378);assert.equal(rows.options[1].estimateCents,1772);assert.throws(()=>C.priceOptions(photo(),[{species:'Pine',centsPerFoot:-1}]));});
test('preview dimensions remain test measurements in exported evidence',()=>{const packet=C.evidence(photo(),'Test sign');assert.equal(packet.measurement.productionReady,false);assert.equal(packet.customerApproved,false);assert.equal(packet.machineProgramIncluded,false);assert.equal(packet.measurement.thicknessMm,null);});


test('4 x 6 calibration recovers the same board and exports its true reference',()=>{
 const ref=[[40,40],[192.4,40],[192.4,141.6],[40,141.6]].map(p);
 const m=C.measurePhoto({reference:ref,referenceType:'index-4x6',board,imageWidth:1000,imageHeight:600});
 near(m.widthMm,600);near(m.heightMm,200);
 assert.equal(m.reference.type,'index-4x6');near(m.reference.widthMm,152.4);near(m.reference.heightMm,101.6);
 assert.equal(photo().reference.type,'index-3x5');
 assert.throws(()=>C.measurePhoto({reference:ref,referenceType:'unknown-card',board,imageWidth:1000,imageHeight:600}));
});
test('card-free native measurement and evidence have no reference dependency',()=>{
 const m=C.readNative(native());assert.equal(m.reference,undefined);near(m.widthMm,600);
 assert.equal(C.evidence(m,'Native trial').measurement.reference,undefined);
});
test('proof redaction removes card pixels and edge writing without altering private source',()=>{
 const input=new Uint8ClampedArray(100*100*4);input.fill(255);
 const at=(x,y)=>(y*100+x)*4;
 for(let y=25;y<76;y++)for(let x=25;x<76;x++)input.set([12,24,36,255],at(x,y));
 const before=input.slice(),card=[[50,20],[80,50],[50,80],[20,50]];
 const clean=C.redactReference(input,100,100,card);
 assert.deepEqual(input,before,'private capture must remain intact');
 for(const [x,y] of [[50,50],[50,20],[80,50],[50,80],[20,50],[50,18]])assert.deepEqual([...clean.slice(at(x,y),at(x,y)+4)],[245,240,221,255]);
 assert.deepEqual([...clean.slice(at(0,0),at(0,0)+4)],[255,255,255,255]);
 assert.deepEqual(C.redactReference(input,100,100,[...card].reverse()),clean);
 assert.throws(()=>C.redactReference(new Uint8ClampedArray(8),100,100,card));
});

test('native image dimensions are bounded and match the JPEG before decoding',()=>{
 assert.throws(()=>C.readNative({...native(),imageWidth:10000,imageHeight:10000,imageJpegBase64:jpegHeader(10000,10000)}),/photo|image|JPEG/i);
 assert.throws(()=>C.readNative({...native(),imageJpegBase64:jpegHeader(10000,10000)}),/photo|image|JPEG/i);
 assert.throws(()=>C.readNative({...native(),imageJpegBase64:jpegHeader(900,600)}),/photo|image|JPEG/i);
 for(const bytes of [[255,216,255,224,0,1],[255,216,255,224,255,255],[255,216,255,192,0,11,8,2]])assert.throws(()=>C.readNative({...native(),imageJpegBase64:Buffer.from(bytes).toString('base64')}),/photo|image|JPEG/i);
 near(C.readNative({...native(),imageJpegBase64:jpegHeader(1000,600,0xc2)}).widthMm,600);
});
console.log(`${count} Sightline behavioral checks passed`);
