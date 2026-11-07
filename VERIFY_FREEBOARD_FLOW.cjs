'use strict';
const assert=require('node:assert/strict'),F=require('./countercraft_flow.js');
let count=0;function test(name,fn){fn();count++;console.log('PASS',name);}
const placed=()=>{const f=F.create();f.state().request.board={frameConfirmed:true};return f;};
for(const [field,value] of [['wording','Fleet Test 4'],['font','different-font'],['lettering',{style:'A',resolved:false}],['finish','White']])test(field+' change requires fresh placement confirmation',()=>{const f=placed();f.set(field,value);assert.equal(f.state().request.board.frameConfirmed,false);});
test('unchanged wording preserves placement and approval',()=>{const f=placed(),r=f.state().request;r.approval={digest:'same'};f.set('wording',r.design.text.value);assert.equal(r.board.frameConfirmed,true);assert.equal(r.approval.digest,'same');});
for(const field of ['name','email','phone'])test(field+' trims pasted outer whitespace and clears final approval only',()=>{const f=placed(),r=f.state().request;r.approval={digest:'old'};f.set(field,' \u00a0Fleet Test\u00a0 ');assert.equal(r.customer[field],'Fleet Test');assert.equal(r.board.frameConfirmed,true);assert.equal(r.approval,null);});
test('sign wording preserves deliberate spaces and line breaks',()=>{const f=F.create();f.set('wording','  Fleet\nTest 4  ');assert.equal(f.state().request.design.text.value,'  Fleet\nTest 4  ');});
test('Studio return never silently confirms customer placement',()=>{const f=placed();f.useDesign(f.state().request.design,{frameConfirmed:true});assert.equal(f.state().request.board.frameConfirmed,false);});
test('new kiosk request always represents one unique board',()=>{const f=F.create();f.set('quantity',10);assert.equal(f.state().request.details.quantity,1);});
test('editable restored draft is one board while its saved source remains unchanged',()=>{const f=F.create(),s=JSON.parse(JSON.stringify(f.state()));s.request.customer={name:' Fleet Tester ',email:' fleet.tester@example.com ',phone:' 804-555-0147 '};s.request.details.quantity=2;f.restore(s);assert.equal(f.state().request.customer.email,'fleet.tester@example.com');assert.equal(f.state().request.details.quantity,1);assert.equal(s.request.details.quantity,2);});
test('adding a reference photo requires a new placement check',()=>{const f=placed();f.addPhoto({id:'extra'});assert.equal(f.state().request.board.frameConfirmed,false);});
console.log('FREEBOARD FLOW:',count,'passed');
