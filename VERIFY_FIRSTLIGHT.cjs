'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(process.argv[2]||'.'),source=fs.readFileSync(path.join(root,'app.js'),'utf8');
function fn(name){const m=new RegExp('^  (?:async )?function '+name+'\\(','m').exec(source);a.ok(m,name);const end=source.indexOf('\n  }\n',m.index);a.ok(end>m.index,name);return source.slice(m.index,end+5);}
function setup(){
 const images=[],nodes=new Map();const ctx={images,nodes,console,Date,Number,String,Error,Object,Array,Math,JSON,Promise,Set};
 ctx.window={BlackFlagHeadway:{validateSize:(d)=>({ok:!!d,nominalFeet:d?.nominalFeet}),validateSpecies:d=>({ok:!!d})}};
 ctx.Image=class{constructor(){this.naturalWidth=1000;this.naturalHeight=600;images.push(this);}set src(v){this.source=v;}};
 vm.createContext(ctx);
 vm.runInContext(`let activeProjectId='ikes-wood-signs';let state={photoData:'photo-A',photoOriginalData:'photo-A',plankRecognition:{},price:0};const BUILD_VERSION='test';let species={speciesId:'cedar',speciesName:'Cedar',speciesResolved:true,speciesConfidence:'high',speciesScore:.82};let failDetector=false;let mode='preview';let orientation={resolved:true,orientation:'Horizontal',confidence:'high',score:.9};
 const $=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',disabled:false,src:''});return nodes.get(id);};
 const headwayContext=()=>({projectId:activeProjectId,mode,photoHash:state.photoData});const currentExperienceContext=()=>({state:mode}),activeProject=()=>({id:activeProjectId});
 const ikeSpeciesRate=id=>id==='cedar'?9:0;const escapeHtml=v=>String(v).replaceAll('<','&lt;').replaceAll('>','&gt;');
 const ikeAnalyzePlankPixelsProven=()=>{if(failDetector)throw Error('bad image');return {usableRegion:{x:.2,y:.2,w:.6,h:.5},confidence:'geometry-probable'};};
 const resizePhoto=async()=>'secondary-photo';const ikeAnalyzePlankPixelsLength=()=>({});const ikeOrientationEvidence=()=>orientation;const ikeVisualSpeciesEvidence=()=>species;const ikeCombineSpeciesEvidence=(x,y)=>y||x;
 const ikeLengthEvidenceFromGeometry=()=>({feet:2,candidateFeet:2,resolved:true,score:.65}),ikeCombineLengthEvidence=x=>x;
 const invalidateIkeApprovedDesignLock=()=>{},woodwrightReset=()=>{};
 function updateUi(){headwayRefreshRecognition();headwayRenderPlank();}
 `+['headwayRefreshRecognition','headwaySizeMarkup','headwayWoodMarkup','headwayRenderPlank','recalcIkePrice','headwayResetPlank','analyzeIkePlankPhoto','analyzeIkeSecondSpeciesPhoto','analyzeIkeSecondLengthPhoto'].map(fn).join('\n')+`
 globalThis.api={get:()=>state,analyze:analyzeIkePlankPhoto,refresh:headwayRefreshRecognition,render:headwayRenderPlank,reset:headwayResetPlank,secondary:analyzeIkeSecondSpeciesPhoto,secondaryLength:analyzeIkeSecondLengthPhoto,
 species:x=>{species=x;},photo:x=>{state.photoData=x;state.photoOriginalData=x;},project:x=>{activeProjectId=x;},mode:x=>{mode=x;},fail:()=>{failDetector=true;}};`,ctx);
 return ctx;
}
const data=(c)=>c.api.get().plankRecognition;
test('early UI refresh cannot erase completed first-photo Cedar suggestion',()=>{const c=setup();c.api.analyze();c.api.refresh();c.images[0].onload();a.equal(data(c).speciesName,'Cedar');a.equal(data(c).headwaySuggestedWood,'Cedar');});
test('first-photo result survives repeated ordinary UI refreshes',()=>{const c=setup();c.api.analyze();c.api.refresh();c.images[0].onload();for(let i=0;i<25;i++)c.api.refresh();a.equal(data(c).speciesName,'Cedar');});
test('pending image has a visible analysis state instead of an empty decision wall',()=>{const c=setup();c.api.analyze();c.api.refresh();c.api.render();a.match(c.nodes.get('ikeRecognitionHeadline').textContent,/ANALYZING/);});
test('analysis cannot grant accepted wood, nominal size or a price',()=>{const c=setup();c.api.analyze();c.images[0].onload();a.equal(data(c).speciesResolved,false);a.equal(data(c).lengthResolved,false);a.equal(c.api.get().price,0);a.equal(c.nodes.get('ikeConfirmPlankBtn').disabled,true);});
test('unverified size candidate is displayed without a physical-measurement claim',()=>{const c=setup();c.api.analyze();c.images[0].onload();a.match(c.nodes.get('ikeDetectedSize').textContent,/2.*unverified/i);a.equal(data(c).lengthFeet,0);});
test('insufficient visual evidence never becomes fixed Cedar',()=>{const c=setup();c.api.species({speciesName:'',speciesId:'',speciesResolved:false,speciesConfidence:'low'});c.api.analyze();c.images[0].onload();a.equal(data(c).speciesName,'');a.match(c.nodes.get('ikeDetectedSpecies').textContent,/uncertain|confirmation/i);});
test('failed image decode ends analysis and holds confirmation',()=>{const c=setup();c.api.analyze();a.equal(typeof c.images[0].onerror,'function');c.images[0].onerror();a.equal(data(c).analysisStatus,'failed');a.equal(c.nodes.get('ikeConfirmPlankBtn').disabled,true);});
test('detector exception creates an explicit uncertainty not an uncaught callback',()=>{const c=setup();c.api.analyze();c.api.fail();a.doesNotThrow(()=>c.images[0].onload());a.equal(data(c).analysisStatus,'failed');});
test('zero-sized decoded frame is held',()=>{const c=setup();c.api.analyze();c.images[0].naturalWidth=0;c.images[0].width=0;c.images[0].onload();a.equal(data(c).analysisStatus,'failed');});
test('newer analysis of the same image cannot be replaced by an older callback',()=>{const c=setup();c.api.analyze();c.api.analyze();c.api.species({speciesId:'walnut',speciesName:'Walnut',speciesResolved:true});c.images[1].onload();c.api.species({speciesId:'cedar',speciesName:'Cedar',speciesResolved:true});c.images[0].onload();a.equal(data(c).speciesName,'Walnut');a.equal(data(c).primarySpeciesEvidence.speciesId,'walnut');});
test('replacement photo invalidates old callback',()=>{const c=setup();c.api.analyze();c.api.photo('photo-B');c.api.analyze();c.api.species({speciesId:'walnut',speciesName:'Walnut',speciesResolved:true});c.images[1].onload();c.images[0].onload();a.equal(data(c).speciesName,'Walnut');a.equal(data(c).primarySpeciesEvidence.speciesId,'walnut');});
test('reset prevents ABA same-photo result from being reused',()=>{const c=setup();c.api.analyze();c.api.reset();c.api.project('beccas-bloom-shop');c.api.project('ikes-wood-signs');c.api.photo('photo-A');const before=JSON.stringify(data(c));c.images[0].onload();a.equal(JSON.stringify(data(c)),before);});
test('foreign vessel receives no stale image result',()=>{const c=setup();c.api.analyze();c.api.project('househull');const before=JSON.stringify(data(c));c.images[0].onload();a.equal(JSON.stringify(data(c)),before);});
test('separate preview decisions survive recognition and still calculate $18',()=>{const c=setup();c.api.get().headwaySizeDecision={nominalFeet:2};c.api.get().headwaySpeciesDecision={speciesId:'cedar',speciesName:'Cedar'};c.api.analyze();c.api.refresh();c.images[0].onload();a.equal(data(c).speciesName,'Cedar');a.equal(c.api.get().price,18);a.equal(data(c).speciesResolved,true);a.equal(c.nodes.get('ikeConfirmPlankBtn').disabled,false);});
test('real route still has no customer-facing owner acceptance button',()=>{const c=setup();c.api.mode('live');c.api.analyze();c.images[0].onload();a.doesNotMatch(c.nodes.get('ikeSpeciesAssist').innerHTML,/data-hw-wood/);a.equal(c.nodes.get('ikeConfirmPlankBtn').disabled,true);});
test('no pending snapshot carries the previous photo species',()=>{const c=setup();c.api.analyze();c.images[0].onload();c.api.photo('photo-B');c.api.analyze();c.api.refresh();a.equal(data(c).headwaySuggestedWood,'');a.equal(data(c).speciesName,'');});

for(const name of ['secondary','secondaryLength']){
 test(name+' completed evidence is not overwritten by old suggestions',async()=>{const c=setup();c.api.analyze();c.images[0].onload();c.api.species({speciesId:'walnut',speciesName:'Walnut',speciesResolved:true});const pending=c.api[name]({});await Promise.resolve();await Promise.resolve();const image=c.images[c.images.length-1];a.ok(image!==c.images[0]);image.onload();await pending;a.equal(data(c).speciesName,'Walnut');a.equal(data(c).speciesResolved,false);});
 test(name+' cannot write a result after photo replacement',async()=>{const c=setup();c.api.analyze();c.images[0].onload();const pending=c.api[name]({});await Promise.resolve();await Promise.resolve();c.api.photo('different-photo');c.api.reset();const before=JSON.stringify(data(c));c.images[c.images.length-1].onload();await pending;a.equal(JSON.stringify(data(c)),before);});
}
