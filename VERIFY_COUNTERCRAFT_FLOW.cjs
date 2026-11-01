'use strict';const assert=require('node:assert/strict'),fs=require('node:fs');
assert(fs.existsSync(__dirname+'/countercraft_flow.js'),'Guided Countercraft customer flow must exist');const Flow=require('./countercraft_flow.js'),S=require('./ike_shop_core.js');
const f=Flow.create();assert.equal(f.state().step,0);assert.equal(f.state().request.design.text.value,'');assert.equal(f.state().request.customer.name,'');
assert.throws(()=>f.next(),/photo/i);f.addPhoto({id:'photo-1',width:100,height:20});f.next();assert.equal(f.state().step,1);
f.set('wording','  My  Sign!  ');assert.equal(f.state().request.design.text.value,'  My  Sign!  ');f.next();assert.equal(f.state().step,2);assert.throws(()=>f.next(),/name/i);
f.set('name','Synthetic Customer');f.set('email','not an email');assert.throws(()=>f.next(),/contact|email/i);f.set('email','customer@example.invalid');f.next();assert.equal(f.state().step,3);
f.freeze({kind:'test'});assert.throws(()=>f.set('wording','changed'),/submission/i);f.reset();assert.equal(f.state().request.photos.length,0);assert.equal(f.state().request.customer.email,'');
console.log('PASS guided flow: fresh blank, photo/design/contact gates, exact spaces and immutable pending submission');
