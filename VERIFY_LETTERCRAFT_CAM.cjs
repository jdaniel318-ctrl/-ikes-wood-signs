'use strict';
const assert=require('node:assert/strict'),C=require('./carvewright_core.js'),F=require('./carve_fonts.js'),A=require('./fleet_design_assets.js'),CAM=require('./carvewright_cam.js'),P=require('./carvewright_posts.js');
// Lettercraft contract: fine Retroline components reject the exemplar tool, then
// use a smaller offline fixture to verify all supported controller exporters.
const results=[];
function check(name,fn){try{const details=fn();results.push({name,pass:true,...details});}catch(e){results.push({name,pass:false,error:e.message});}}
for(const id of A.fontOrder)check('mixed-case '+id+' through pocket CAM and all six controller profiles',()=>{
 const d=C.createDraft();d.text.value='Smoke Hole!';d.text.fontId=id;const setup=CAM.defaults(d);let exampleToolRejected=false;if(id==='monoton'){assert.throws(()=>CAM.build(d,F,setup),/tool is too large/);exampleToolRejected=true;setup.tool.diameterMm=1.5875;setup.tool.label='Offline verification fixture';}const job=CAM.build(d,F,setup);assert(job.moves.length>10);
 for(const p of P.profiles){const exported=P.exportProgram(job,{id:p.id,spindleMode:'manual'});assert.equal(exported.validation.pass,true);const parsed=P.parseProgram(exported.text,{id:p.id,spindleMode:'manual'});assert.equal(parsed.moves.length,job.moves.length);assert.equal(parsed.programEnd,true);}
 return {moves:job.moves.length,profiles:6,exampleToolRejected,testDiameterMm:setup.tool.diameterMm};
});
for(const id of A.graphicOrder)check('rotated 100 mm '+id+' has real contours and validated machine output',()=>{
 let d=C.addGraphicLayer(C.createDraft(),id);const a=d.layers[0],scale=100/Math.max(a.widthMm,a.heightMm);a.widthMm*=scale;a.heightMm*=scale;a.rotationDeg=17;const l=C.layout(d,F);assert.equal(l.ok,true,l.errors.join(' '));const job=CAM.build(d,F,CAM.defaults(d));const exported=P.exportProgram(job,'shopbot-inch');assert.equal(exported.validation.pass,true);assert.equal(job.source.graphicAssets[0].id,id);return {moves:job.moves.length,contours:job.contours.length};
});
check('small compass keeps the oversized-tool rejection',()=>{
 const d=C.addGraphicLayer(C.createDraft(),'compass');assert.throws(()=>CAM.build(d,F,CAM.defaults(d)),/tool.*large|large.*tool|fit|collaps/i);return {guard:'Small disconnected regions require a smaller cutter or larger artwork.'};
});
check('overlapping text and emblem union preserves both filled regions',()=>{
 let text=C.createDraft();text.text.value='O';text.text.sizePercent=65;
 const star=C.addGraphicLayer(C.createDraft(),'star');star.layers[0].widthMm=130;star.layers[0].heightMm=120;
 const both=C.addGraphicLayer(text,'star');Object.assign(both.layers[0],{widthMm:130,heightMm:120});
 const a=CAM.build(text,F,CAM.defaults(text)),b=CAM.build(star,F,CAM.defaults(star)),u=CAM.build(both,F,CAM.defaults(both));
 assert(u.stats.sourceAreaMm2>=Math.max(a.stats.sourceAreaMm2,b.stats.sourceAreaMm2)-.1,'Nonzero winding must not cancel overlapping artwork');
 assert(u.stats.sourceAreaMm2<=a.stats.sourceAreaMm2+b.stats.sourceAreaMm2+.1,'Overlapping artwork is unioned once');
 return {textArea:a.stats.sourceAreaMm2,graphicArea:b.stats.sourceAreaMm2,unionArea:u.stats.sourceAreaMm2};
});
const out={suite:'Lettercraft geometry to controller',passed:results.filter(x=>x.pass).length,total:results.length,results};console.log(JSON.stringify(out,null,2));process.exitCode=out.passed===out.total?0:1;
