'use strict';
const assert=require('node:assert/strict'),C=require('./countercraft_core.js'),Flow=require('./countercraft_flow.js');
const scope={projectId:'ikes-wood-signs',backend:'https://sjgqqtnuttnkwsoebbqf.supabase.co',environment:'staging',site:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',deploymentId:'countercraft-pilot-1',mode:'sea_trial'};
const pub={scope,revision:7,enabled:true,rates:[{species:'Walnut',centsPerFoot:1800}],stocks:[{id:'W30',revision:2,species:'Walnut',nominalInches:30,available:true,actualMm:[762,228.6,19.05]},{id:'U24',revision:1,species:'Pine',nominalInches:24,available:true,actualMm:null}]};
function testPhotoRuler() {
 const size=require('./ike_photo_size.js'),wood=require('./woodwright_fit.js'),capture=require('./carvewright_capture_core.js');
 function mockPhoto(cards) {
  const w=560,h=270,pixels=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const on=x>=40&&x<520&&y>=45&&y<225;
    const card=cards.some(([a,b,end,bottom])=>x>=a&&x<end&&y>=b&&y<bottom);
    const color=card?[240,240,238]:on?[147,89,48]:[90,115,138];
    pixels.set([...color,255],(y*w+x)*4);
  }
  return size.inspect(pixels,w,h,wood);
 }
 for(const [type,corners] of [['index-3x5',[131,102,231,162]],['index-4x6',[151,89,271,169]]]){
  const scan=mockPhoto([corners]);assert(scan.card);assert.equal(scan.reference,null);
  const r=size.measure(scan.card,type,capture);assert(Math.abs(r.lengthMm/25.4-24)<.15);assert(Math.abs(r.widthMm/25.4-9)<.15);
  assert.equal(r.thicknessMm,undefined);
 }
 assert.equal(mockPhoto([]).card,null);
 assert.equal(mockPhoto([[110,78,210,138],[285,110,385,170]]).card,null);
 const scene={w:800,h:600,reference:[[220,140],[320,140],[320,200],[220,200]],across:[[100,230],[580,230]],down:[[340,140],[340,320]]};

 function project([x,y]){const k=1+.00015*x+.00016*y;return [(1.1*x+.08*y+15)/k,(-.06*x+1.12*y+50)/k];}
 for(const k of ['reference','across','down'])scene[k]=scene[k].map(project);
 const measured=size.measure(scene,'index-3x5',capture);
 assert(Math.abs(measured.lengthMm/25.4-24)<.001);assert(Math.abs(measured.widthMm/25.4-9)<.001);
 assert.throws(()=>size.measure({...scene,down:scene.across},'index-3x5',capture),/middle/);
 assert.throws(()=>size.measure(scene,'unknown',capture),/card/);
 console.log('PASS synthetic 3×5 and 4×6, perspective-correct dimensions, no card, ambiguous cards, no identity by shape, no inferred thickness, invalid lines.');
}
(async()=>{
 testPhotoRuler();
 const sweepFlow=Flow.create(),sweepState=sweepFlow.state();
 const scanPhoto={id:'scan-photo',mime:'image/jpeg',sha256:'a'.repeat(64),width:800,height:400,dataUrl:'data:image/jpeg;base64,/9j/2Q=='};
 sweepState.request.photos=[scanPhoto];
 sweepState.plankEvidence=[{photoId:scanPhoto.id,nativeScan:{captureId:'fixture',lengthMm:609.6,widthMm:228.6}}];
 const sweepSize={source:'native-sweep',captureId:'fixture',lengthMm:609.6,widthMm:228.6};
 assert.throws(()=>sweepFlow.applyPhotoSize({...sweepSize,captureId:'other'}));
 sweepFlow.applyPhotoSize(sweepSize);
 assert.match(C.photoSizeNote(sweepState),/24.0 in long × 9.0 in wide.*Sightline/);
 assert.equal(sweepState.boardSpec,null);
 assert.throws(()=>C.checkBoard(sweepState,null,true),/measured shop board/);
 sweepFlow.clearPhotoSize();assert.equal(C.photoSizeNote(sweepState),'');

 assert.equal(typeof C.boardSpec,'function','Measured stock provenance must be available');
 assert.deepEqual(C.measurementsFromInches(['30','9','.75']),[762,228.6,19.05]);
 assert.equal(C.measurementsFromInches(['','','']),null);
 for(const input of [['30','','.75'],['0','9','.75'],['121','9','.75'],['30','9','0'],['NaN','9','.75']])assert.throws(()=>C.measurementsFromInches(input),/measure|dimension|length|width|thickness/i);
 const f=Flow.create();f.set('wording','Andie');f.addPhoto((await require('./COUNTERCRAFT_TEST_FIXTURE.cjs').fixture(pub)).request.photos[0]);
 f.state().request.approval={old:true};f.state().request.proof={old:true};f.selectStock(pub,'W30');
 const st=f.state();assert.equal(st.stockId,'W30');assert.deepEqual(st.boardSpec.actualMm,[762,228.6,19.05]);assert.equal(st.boardSpec.stockRevision,2);assert.equal(st.boardSpec.publicationRevision,7);
 assert.equal(st.request.design.stock.widthMm,762);assert.equal(st.request.design.stock.heightMm,228.6);assert.equal(st.request.design.stock.thicknessMm,19.05);assert.equal(st.request.design.stock.species,'Walnut');assert.equal(st.request.design.text.value,'Andie');assert.equal(st.request.approval,null);assert.equal(st.request.proof,null);assert.equal(st.request.board.frameConfirmed,false);
 const snapshot={request:st.request,stockId:st.stockId,boardSpec:st.boardSpec,price:C.price(pub,st.stockId,1)};
 C.checkBoard(snapshot,pub,true);assert.equal(snapshot.price.totalCents,4500,'Nominal linear-foot pricing stays unchanged');
 const before=await C.approvalDigest(snapshot),changed=C.clone(snapshot);changed.boardSpec.stockRevision++;assert.notEqual(await C.approvalDigest(changed),before);
 assert.throws(()=>C.checkBoard(changed,pub),/board|publication/i);
 const bad=C.clone(st.request.design);bad.stock.widthMm=609.6;assert.throws(()=>f.useDesign(bad,st.request.board),/board|dimension/i);
 assert.throws(()=>C.checkBoard({...snapshot,request:{...snapshot.request,design:bad}},null,true),/board|dimension/i);
 const updated=C.clone(pub);updated.revision++;updated.stocks[0].actualMm[0]=700;assert.throws(()=>C.checkBoard(snapshot,updated),/board|publication/i);
 assert.throws(()=>f.selectStock({...pub,stocks:[{...pub.stocks[0],available:false}]},'W30'),/available/i);
 assert.throws(()=>f.selectStock({...pub,stocks:[{...pub.stocks[0],actualMm:[4000,200,20]}]},'W30'),/dimension|length/i);
 f.freeze();assert.throws(()=>f.selectStock(pub,'U24'),/submission/i);f.reReview();f.selectStock(pub,'U24');assert.equal(f.state().boardSpec,null);assert.equal(f.state().request.design.stock.id,'U24');assert.equal(f.state().request.design.stock.species,'Pine');assert.throws(()=>C.checkBoard({request:f.state().request,stockId:'U24',boardSpec:null},null,true),/measure/i);
 f.selectStock(pub,'W30');const restored=Flow.create();restored.restore({...snapshot,contactPreference:'email',requestedPickup:''});assert.deepEqual(restored.state().boardSpec.actualMm,[762,228.6,19.05]);assert.equal(restored.state().request.approval,null);
 const recovered=Flow.create();recovered.restore(snapshot);assert.equal(recovered.reconcileStock(pub).changed,false);const retired=C.clone(pub);retired.stocks[0].available=false;assert.equal(recovered.reconcileStock(retired).changed,true);assert.equal(recovered.state().stockId,'');assert.equal(recovered.state().boardSpec,null);assert.equal(recovered.state().request.design.text.value,'Andie');assert.equal(recovered.state().request.photos.length,1);assert.equal(recovered.state().request.board.frameConfirmed,false);recovered.restore(snapshot);const oversize=C.clone(pub);oversize.stocks[0].actualMm[0]=4000;recovered.reconcileStock(oversize);assert.equal(recovered.state().stockId,'');
 f.selectStock(pub,'');assert.equal(f.state().boardSpec,null);assert.notEqual(f.state().request.design.stock.id,'W30');
 const measured=await require('./COUNTERCRAFT_TEST_FIXTURE.cjs').fixture(pub,{stockId:'W30'});
 assert.equal(measured.request.design.stock.widthMm,762,'Approved request must use the measured board');
 assert.deepEqual(measured.boardSpec.actualMm,[762,228.6,19.05]);
 const F=require('./carve_fonts.js');await C.validateSubmission(measured,pub,F);
 const forged=C.clone(measured);forged.boardSpec.stockRevision++;await assert.rejects(C.validateSubmission(forged,pub,F),/board|publication/i);
 require('./carvewright_clipper.js');require('./carvewright_cam.js');require('./carvewright_portable.js');const X=require('./countercraft_exports.js');
 const job={id:crypto.randomUUID(),number:'IKE-TRUEFIT',revision:1,version:1,status:'received',customerApprovedRevision:1,revisions:[{revision:1,snapshot:measured}],events:[]};
 const bundle=await X.build(job,F),file=n=>bundle.files.find(f=>f.name===n),json=n=>JSON.parse(new TextDecoder().decode(file(n).bytes));
 assert.deepEqual(json('countercraft-job.json').boardSpec.actualMm,[762,228.6,19.05]);
 assert.deepEqual(json('countercraft-job.json').layoutAreaMm,[736.6,203.2]);
 assert.match(new TextDecoder().decode(file('artwork.svg').bytes),/width="762mm" height="228.6mm"/);
 assert.match(new TextDecoder().decode(file('board-setup.txt').bytes),/30 × 9 × 0.75 in/);
 assert.equal(json('request.json').design.stock.thicknessMm,19.05);
 assert.equal(json('countercraft-job.json').productionApproved,false);
 console.log('PASS measured stock dimensions, pricing independence, selection/restore, provenance, immutable approval and customer editing boundary');
})().catch(e=>{console.error(e);process.exitCode=1;});
