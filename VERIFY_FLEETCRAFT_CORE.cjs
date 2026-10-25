/* Behavioral contracts for layered artwork; no browser or network required. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const C = require('./carvewright_core.js');
const F = require('./carve_fonts.js');
const CAM = require('./carvewright_cam.js');
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const copy = x => JSON.parse(JSON.stringify(x));
function sample() { const d=C.createDraft(); d.text.value='Smoke Hole!'; return d; }

test('old sign keeps exact outlines when advanced features are unused', async () => {
  const d=sample();
  // Golden values captured from unmodified upstream 2249bdf6 before editing.
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(C.layout(d,F).glyphs)).digest('hex'),'2187619abe3c37c7d0a48d95ad1ebba821f9a4d9fba644bf31df205978e680f6');
  assert.equal(await C.fingerprint(d,F),'e6f94b4b3b0c83548c673374d613db03a98b665df89dd38bfc34e7139a393bd1');
  const p=await C.createPacket(d,F);assert.equal(p.schema,'carvewright-job-v1');assert.equal(p.graphicAssets,undefined);
});
test('advanced design adds an independent second text without changing main wording', () => {
  assert.equal(typeof C.addTextLayer,'function','independent text layers must be implemented');
  const d=sample(), n=C.addTextLayer(d,'Cabin No. 7');
  assert.equal(n.schema,'carvewright-design-v2');
  assert.equal(n.text.value,'Smoke Hole!');
  assert.equal(n.layers[0].text.value,'Cabin No. 7');
  assert.equal(d.layers,undefined);
  assert.equal(C.layerList(n).length,2);
});
test('graphic-only artwork is nonblank, physical and portable', async () => {
  const d=C.addGraphicLayer(C.createDraft(),'star'), l=C.layout(d,F);
  assert.equal(l.ok,true,l.errors?.join(' '));assert.equal(l.blank,false);assert.equal(l.glyphs.length,1);
  assert.equal(l.layers[0].glyphCount,0);assert.equal(l.layers[1].glyphCount,1);
  const svg=C.toSvg(d,F); assert.match(svg,/width="609.6mm"/);assert.match(svg,/<path /);assert.doesNotMatch(svg,/<text[ >]/);
  const p=await C.createPacket(d,F);assert.equal(p.schema,'carvewright-job-v2');assert.equal(p.graphicAssets[0].id,'star');
  const restored=await C.readPacket(JSON.stringify(p),F);
  assert.notEqual(restored.id,d.id);assert.equal(restored.review,null);assert.equal(restored.layers[0].assetId,'star');
  assert.deepEqual(C.layout(restored,F).glyphs,l.glyphs);
});
test('90-degree graphic transform uses entered center and swapped dimensions', () => {
  const d=C.addGraphicLayer(C.createDraft(),'star'), a=d.layers[0];
  a.centerXmm=200;a.centerYmm=100;a.widthMm=80;a.heightMm=40;a.rotationDeg=90;
  const l=C.layout(d,F),b=l.layers[1].bounds,g=l.glyphs[0];
  assert.ok(Math.abs(g.matrix[0])<1e-12);assert.ok(Math.abs(g.matrix[3])<1e-12);
  assert.ok(Math.abs(b.width-40)<1e-9,'A 90-degree turn must make the actual graphic 40 mm wide');
  assert.ok(Math.abs(b.height-80)<1e-9,'Entered size measures artwork, not surrounding empty canvas');
  assert.ok(Math.abs((b.xMin+b.xMax)/2-200)<1e-9);assert.ok(Math.abs((b.yMin+b.yMax)/2-100)<1e-9);
});
test('rotated primary text remains the same paths with changed affine matrices', () => {
  const old=sample(), d=C.ensureLayers(old);d.primaryTransform.rotationDeg=10;
  const l=C.layout(d,F);assert.ok(l.glyphs.length>0);assert.equal(l.glyphs[0].d,C.layout(old,F).glyphs[0].d);
  assert.notDeepEqual(l.glyphs[0].matrix,C.layout(old,F).glyphs[0].matrix);
});
test('out-of-margin graphic retains editable geometry but blocks export', () => {
  const d=C.addGraphicLayer(C.createDraft(),'star');d.layers[0].centerXmm=0;
  const l=C.layout(d,F);assert.equal(l.ok,false);assert.ok(l.glyphs.length);assert.ok(l.layers[1].bounds);
  assert.throws(()=>C.toSvg(d,F),/margin|inset|outside|overflow/i);
});
test('a rotated star that physically fits near the margin is accepted', () => {
  const d=C.addGraphicLayer(C.createDraft(),'star');Object.assign(d.layers[0],{widthMm:80,heightMm:80,rotationDeg:45,centerXmm:60,centerYmm:100});
  const l=C.layout(d,F);assert.equal(l.ok,true,'Use actual path extrema, not rotated empty bbox corners: '+l.errors.join(' '));
  const b=l.layers[1].bounds;assert(b.xMin>14.2&&b.xMin<14.3);assert(b.yMin>65&&b.yMax<146);
});
test('a nearly linear cubic derivative preserves ribbon dimensions and margin checks', () => {
  const d=C.addGraphicLayer(C.createDraft(),'ribbon');Object.assign(d.layers[0],{widthMm:80,heightMm:40,rotationDeg:0});
  const b=C.layout(d,F).layers[1].bounds;
  assert(Math.abs(b.height-40)<1e-9,'The curved ribbon must retain its entered 40 mm height.');
  assert(Math.abs(b.yMin-(d.layers[0].centerYmm-20))<1e-9,'The cubic midpoint is the true top edge.');
  d.layers[0].centerYmm=d.stock.marginMm+20-.02;
  assert.equal(C.layout(d,F).ok,false,'A 0.02 mm margin crossing must be blocked.');
});
test('duplicate and remove affect only the selected object', () => {
  const d=C.addGraphicLayer(sample(),'anchor'), n=C.duplicateLayer(d,d.layers[0].id);
  assert.equal(n.layers.length,2);assert.notEqual(n.layers[0].id,n.layers[1].id);
  assert.equal(C.removeLayer(n,n.layers[1].id).layers.length,1);
  const cleared=C.removeLayer(n,'primary');assert.equal(cleared.text.value,'');assert.equal(cleared.layers.length,2);
  const listed=C.layerList(n);listed[0].text.value='Changed copy';listed[1].widthMm=1;
  assert.notEqual(n.text.value,'Changed copy');assert.notEqual(n.layers[0].widthMm,1);
});
test('unknown graphics, duplicate IDs and nonfinite transforms fail closed', () => {
  const d=C.addGraphicLayer(sample(),'star');
  const bad=copy(d);bad.layers[0].assetId='untrusted';assert.equal(C.validate(bad,F).ok,false);
  const dup=copy(d);dup.layers.push(copy(dup.layers[0]));assert.equal(C.validate(dup,F).ok,false);
  const nan=copy(d);nan.layers[0].rotationDeg=NaN;assert.equal(C.validate(nan,F).ok,false);
  const extra=copy(d);extra.layers[0].html='<script>';assert.equal(C.validate(extra,F).ok,false);
});
test('missing characters in additional text block review without font substitution', async () => {
  const d=C.addTextLayer(sample(),'Hello 🦊');assert.equal(C.validate(d,F).ok,false);
  assert.ok(C.validate(d,F).missingGlyphs.includes('🦊'));await assert.rejects(C.review(d,F),/Unsupported/);
});
test('object and geometry budgets reject excess work explicitly', () => {
  let d=sample();for(let i=0;i<11;i++)d=C.addGraphicLayer(d,'star');
  assert.throws(()=>C.addGraphicLayer(d,'star'),/12|limit/i);
  let many=C.addTextLayer(sample(),'A'.repeat(240));assert.equal(C.layout(many,F).ok,false);
});
test('graphic edit invalidates review and tampered paths cannot import', async () => {
  let d=C.addGraphicLayer(sample(),'star');d.layers[0].centerYmm=40;d.layers[0].widthMm=30;d.layers[0].heightMm=30;
  d=await C.review(d,F);assert.equal(await C.reviewMatches(d,F),true);
  const n=copy(d);n.layers[0].rotationDeg=12;assert.equal(await C.reviewMatches(n,F),false);
  const p=await C.createPacket(d,F);p.geometry[0].matrix[4]+=1;
  await assert.rejects(C.readPacket(JSON.stringify(p),F),/geometry/i);
});
test('all used fonts and graphic sources participate in the packet fingerprint', async () => {
  let d=C.addTextLayer(sample(),'Harbor');d.layers[0].text.fontId='studio-serif';d.layers[0].text.sizePercent=20;
  d=C.addGraphicLayer(d,'star');const p=await C.createPacket(d,F);
  assert.deepEqual(p.fontAssets.map(x=>x.id),['studio-sans','studio-serif']);assert.equal(p.graphicAssets.length,1);
  const n=copy(p);n.graphicAssets[0].sourceSha256='0'.repeat(64);
  await assert.rejects(C.readPacket(JSON.stringify(n),F),/graphic|asset/i);
});
test('CAM cuts graphic-only layout and binds all source assets', () => {
  const d=C.addGraphicLayer(C.createDraft(),'star');const job=CAM.build(d,F,CAM.defaults(d));
  assert.ok(job.moves.some(m=>m.kind==='cut'||m.type==='cut'||m.z<0));assert.equal(job.source.graphicAssets[0].id,'star');
});
test('order brief requires saved reviewed source and names the chosen business', async () => {
  let d=sample();d.request.vesselId='ikes-wood-signs';d.request.vesselName='Ike’s Wood Signs';d.request.jobReference='JOB-7';
  await assert.rejects(C.createOrderBrief(d,F),/saved|review/i);
  d.revision=3;d=await C.review(d,F);const brief=await C.createOrderBrief(d,F);
  assert.equal(brief.schema,'blackflag-design-order-brief-v1');assert.equal(brief.target.vesselId,'ikes-wood-signs');
  assert.equal(brief.source.revision,3);assert.equal(brief.orderCreated,false);assert.equal(brief.productionReady,false);
  assert.equal(brief.artwork.fingerprint,await C.fingerprint(d,F));
});
if(process.argv[2])test('actual revision 4 retains fingerprint and byte-exact ShopBot preview', async () => {
  const path=process.argv[2];
  const p=JSON.parse(fs.readFileSync(path,'utf8'));assert.equal(await C.fingerprint(p.design,F),p.fingerprint);
  await C.readPacket(JSON.stringify(p),F);
  const record=JSON.parse(fs.readFileSync(path.replace('-design.json','-machining.json'),'utf8'));
  const job=CAM.build(p.design,F,record.setup);assert.equal(job.moves.length,13992);
  const post=require('./carvewright_posts.js').exportProgram(job,{id:record.setup.machine.postId,spindleMode:record.setup.machine.spindleMode});
  const header=['PREVIEW - UNVERIFIED SETUP','Controller preview only. Physical setup has not been confirmed.','Executable CNC program. Verify the actual machine setup before running.'].map(s=>"' "+s).join('\r\n')+'\r\n';
  const actual=fs.readFileSync(path.replace('-design.json','-shopbot-inch.sbp.txt'),'utf8');
  assert.equal(header+post.text,actual);assert.equal(actual,record.post.text);
  assert.equal(crypto.createHash('sha256').update(actual).digest('hex'),record.post.sha256);
});

(async()=>{let passed=0;const failures=[];for(const [name,fn] of tests){try{await fn();passed++;console.log('PASS '+name);}catch(e){failures.push({name,error:e.message});console.error('FAIL '+name+' — '+e.message);}}console.log(JSON.stringify({suite:'Fleetcraft model',passed,total:tests.length,failures},null,2));process.exitCode=failures.length?1:0;})();
