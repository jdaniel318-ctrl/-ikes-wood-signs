'use strict';
const assert=require('node:assert/strict'),C=require('./ike_shop_core.js'),D=require('./carvewright_core.js'),F=require('./carve_fonts.js');
async function main(){
 const r=C.createRequest();r.design.stock={...r.design.stock,widthMm:598.4875,heightMm:234.95,thicknessMm:34.925};r.design.text.value='Andie Rose';r.customer.name='Private Name';r.customer.email='private@example.invalid';
 r.boardSetup={source:'customer-reported',lengthMm:598.4875,widthMm:234.95,thicknessMm:34.925,pricingLengthFt:2};
 assert.equal(typeof C.exportStart,'function','Portable selected-board handoff must exist');
 const file=await C.exportStart(r,F);assert.equal(file.schema,'ike-sign-start-v1');assert(!JSON.stringify(file).includes('Private Name'));assert(!JSON.stringify(file).includes('private@example.invalid'));
 const next=await C.importStart(JSON.stringify(file),F);assert.deepEqual(next.design.stock,r.design.stock);assert.deepEqual(next.boardSetup,r.boardSetup);assert.deepEqual(next.customer,{name:'',email:'',phone:''});assert.equal(next.approval,null);assert.equal(next.delivery.status,'not-sent');assert.notEqual(next.id,r.id);assert.equal(next.design.text.value,'Andie Rose');
 const bad=structuredClone(file);bad.boardSetup.lengthMm=609.6;await assert.rejects(()=>C.importStart(JSON.stringify(bad),F),/measurements|dimensions/i);
 bad.boardSetup=file.boardSetup;bad.customer={name:'injected'};await assert.rejects(()=>C.importStart(JSON.stringify(bad),F),/Unknown/);
 r.customer.email='unfinished@';r.details.quantity=0;assert.equal((await C.exportStart(r,F)).designPacket.design.text.value,'Andie Rose','Saving artwork must not require a finished contact form');
 r.details.quantity=NaN;assert.equal((await C.exportStart(r,F)).designPacket.design.text.value,'Andie Rose','A cleared quantity must not block saving artwork');
 let touched=false;const unsafe={...r};Object.defineProperty(unsafe,'design',{enumerable:true,get(){touched=true;return r.design;}});await assert.rejects(()=>C.exportStart(unsafe,F),/accessor|data/i);assert.equal(touched,false);
 const raw=await D.createPacket(r.design,F);const legacy=await C.importStart(JSON.stringify(raw),F);assert.deepEqual(legacy.design.stock,r.design.stock);assert.equal(legacy.customer.name,'');assert.equal(legacy.boardSetup,undefined);
 const layered=await D.createPacket(D.ensureLayers(r.design),F);assert.equal(layered.schema,'carvewright-job-v2');const current=await C.importStart(JSON.stringify(layered),F);assert.equal(current.design.schema,'carvewright-design-v2');assert.deepEqual(current.design.stock,r.design.stock);assert.equal(current.approval,null);
 const legacyRequest=C.createRequest();assert(C.validate(legacyRequest,F).ok,'Existing requests remain valid');
 console.log('PASS: private board handoff, exact dimensions, new identities, nominal price separation, malformed input, old packet compatibility');
}main().catch(e=>{console.error(e);process.exitCode=1;});
