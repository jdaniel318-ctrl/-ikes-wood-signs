'use strict';
// Exercise the actual pricing editor, agreement serializer and printable document with device fixtures.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const captain=fs.readFileSync(path.join(__dirname,'captain.js'),'utf8');
function section(a,b) {
 const start=captain.indexOf(a), end=captain.indexOf(b,start);
 assert.ok(start>=0 && end>start,a);
 return captain.slice(start,end);
}
const nodes=new Map();
function node(id) {
 if(!nodes.has(id)) nodes.set(id,{removeAttribute(k){delete this[k]},value:'',addEventListener(){},focus(){}});
 return nodes.get(id);
}
const docs=new Map(), rows=new Map();
const actor1='admiral-one',actor2='admiral-two';
const plain=x=>JSON.parse(JSON.stringify(x));
function testDB() {
 return {transaction(){
  const tx={};let result;
  tx.objectStore=()=>({
   put(x){rows.set(x.id,plain(x))},
   add(x){rows.set(x.id,plain(x));queueMicrotask(()=>tx.oncomplete())},
   get(id){const q={result:rows.get(id)};queueMicrotask(()=>{q.onsuccess?.();tx.oncomplete?.()});return q;},
   index(){return {getAll(scope){const q={result:[...rows.values()].filter(r=>r.scope===scope).map(plain)};queueMicrotask(()=>q.onsuccess());return q;}}}
  });
  return tx;
 }};
}
const t=vm.createContext({$:node,record:null,actor:actor1,allowed:()=>t.authed,busy:false,authed:true,
 valid:()=>t.authed,revise(){t.dirty=true},status(){},fill(){run('fillFeeEditor()')},discardQuestion:()=>true,
 Blob,URL:{createObjectURL(doc){const id='blob:'+docs.size;docs.set(id,doc);return id;},revokeObjectURL(id){docs.delete(id)}},
 crypto:require('node:crypto').webcrypto,TextEncoder,dbOpen:async()=>testDB(),dirty:false,
 TEMPLATE:{version:'CG-1',clauses:[]},esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')});
const run=(code)=>vm.runInContext(code,t);
run(section(' const CHANNELS=',' function html(r,h)')+section(' const suggestedLaunchFees',' const launchDemos=')+
 section(' function eligiblePilot(target)',' function pilotPanel()')+section(' async function storeDraft(t)',' async function snapshot(t)'));
const original={schema:'blackflag-agreement-working-v1',agreementId:'fedcba98-1234-4123-8123-123456789012',revision:1,
 target:{project_id:'example-shop',display_name:'A & B <Shop>',prospective:true},terms:plain(run('blank()')),history:[],evidence:[]};
const chosen={setup:'925.50',deposit:'125.25',monthly:'49.95'};
function select(id,name){t.record=plain(original);t.record.target.project_id=id;t.record.target.display_name=name;run('fillFeeEditor()');}
function edit(fees){t.prices=fees;run('putFeeInputs(prices);editLaunchFees(prices)');}
(async()=>{
 select('example-shop','A & B <Shop>');
 assert.equal(node('cgFee-setup').value,'500.00');
 assert.equal(node('cgFeeOffer').hidden,true);
 assert.equal(Object.hasOwn(run('termPayload(record)').terms,'launchFees'),false);
 assert.equal(fs.readFileSync(path.join(__dirname,'fleet-launch-offer.html'),'utf8'),run("launchOfferDocument('',suggestedLaunchFees)"));
 edit(chosen);assert.match(node('cgFeeBalance').textContent,/800\.25/);
 await run('saveOfferFees({})');
 let doc=await docs.get(node('cgFeeOffer').href).text();
 for(const val of ['A &amp; B &lt;Shop&gt;','$925.50','$125.25','$800.25','$49.95'])assert.ok(doc.includes(val),val);
 assert.doesNotMatch(doc,/\$500|\$250|\$99|example-shop|setupMinutes|launch-fee|<input/);
 assert.equal(plain(run('schedule(record)')).flat(2).some(v=>v[1]==='$800.25'),true);
 assert.deepEqual(plain(run('termPayload(record).terms.launchFees')),chosen);
 const oldPayload=run('stable(termPayload(record))');
 await run('personalRates({},true)');
 edit({...chosen,deposit:'930'});assert.equal(node('cgFeeOffer').hidden,true);assert.equal(docs.size,0);
 await assert.rejects(run('saveOfferFees({})'),/at most/);
 for(const bad of ['', '-1', '1.234', '5e2','Infinity','2,00','0x10']) {
  edit({...chosen,monthly:bad});
  await assert.rejects(run('storeDraft({})'),/Monthly support/);
  assert.throws(()=>run('termPayload(record)'),/Monthly support/);
 }
 await run('loadDraft({})');
 assert.equal(run('stable(termPayload(record))'),oldPayload);
 assert.equal(node('cgFeeOffer').hidden,false);
 select('second-vessel','Sea Glass');assert.equal(docs.size,0);
 await run('personalRates({},false)');assert.equal(node('cgFee-monthly').value,'49.95');
 assert.equal(node('cgFeeOffer').hidden,true);
 edit({setup:'0',deposit:'0',monthly:'0'});await run('saveOfferFees({})');
 doc=await docs.get(node('cgFeeOffer').href).text();
 assert.match(doc,/No deposit is due/);assert.match(doc,/No setup balance is due/);assert.match(doc,/included at no charge/);
 select('example-shop','A & B <Shop>');await run('loadDraft({})');
 assert.equal(node('cgFee-monthly').value,'49.95');
 t.actor=actor2;select('example-shop','A & B <Shop>');
 await assert.rejects(run('loadDraft({})'),/No device draft/);
 await assert.rejects(run('personalRates({},false)'),/Save a set/);
 t.authed=false;await run('saveOfferFees({})');await run('personalRates({},true)');
 run("editLaunchFees({setup:'9',deposit:'1',monthly:'0'})");
 assert.equal(t.record.terms.launchFees,undefined);
 t.authed=true;edit({setup:'109.99',deposit:'109.99',monthly:'0.01'});
 assert.equal(node('cgFeeBalance').textContent,'Due at handoff · $0.00');
 assert.notEqual(run('stable(termPayload(record))'),oldPayload);
 assert.equal(plain(run("launchFeeTerms({setup:'1000000.00',deposit:'0',monthly:'1'})")).setup,'1000000.00');
 assert.match(captain,/function withTask\(fn\)[\s\S]+?await verified\(t\)/);
 assert.match(captain,/action\('cgFeeSave', saveOfferFees\)/);
 console.log('PASS suggested, negotiated, waived and invalid amounts, offer, agreement fingerprints, draft readback, exact vessel and Admiral scope, saved starting rates, session guard.');
})().catch(e=>{console.error(e);process.exitCode=1});
