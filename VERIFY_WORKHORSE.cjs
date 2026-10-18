/* Offline Workhorse checks. No server credentials, no RPC, no network. */
'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.argv[2]||__dirname),file=path.join(root,'business_deck.js');
test('shared business deck module exists',()=>assert.ok(fs.existsSync(file),'Owner deck implementation is absent in the baseline'));
if(fs.existsSync(file)){
 const d=require(file),pid='ikes-wood-signs';
 const rows=[
  {id:'OLD',projectId:pid,wording:'  Smoke  Hole!  ',customerName:'First',status:'New',createdAt:'2026-10-01T10:00:00Z',price:65},
  {id:'SECOND',projectId:pid,wording:'  Smoke  Hole!  ',customerName:'First',status:'In Production',createdAt:'2026-10-02T10:00:00Z',price:55},
  {id:'PICKUP',projectId:pid,wording:'Ready',status:'Ready for Pickup',createdAt:'2026-10-03T10:00:00Z',price:0},
  {id:'CLOSED',projectId:pid,wording:'Completed',status:'Picked Up',createdAt:'bad'},
  {id:'UNKNOWN',projectId:pid,wording:'Check',status:'Awaiting special review'},
  {id:'OTHER',projectId:'beccas-bloom-shop',customerName:'Do not reveal',status:'New',price:500},
  {id:'UNSCOPED',status:'New'},
  {id:'CONFLICT',projectId:pid,namespace:'bf.project.beccas-bloom-shop',status:'New'},
  {id:'ISOLATION',projectId:pid,isolation:{projectId:'other'},status:'New'}
 ];
 const frozen=JSON.stringify(rows);
 test('records are filtered by exact project and consistent identity hints',()=>assert.deepEqual(d.scope(rows,pid).map(x=>x.id),['OLD','SECOND','PICKUP','CLOSED','UNKNOWN']));
 test('missing project scope cannot read records',()=>assert.deepEqual(d.scope(rows,''),[]));
 test('same wording and customer never merge orders',()=>assert.equal(d.scope(rows,pid).filter(x=>x.wording==='  Smoke  Hole!  ').length,2));
 test('active queue excludes completed while unknown statuses remain visible',()=>assert.deepEqual(d.select(rows,pid,{tab:'active'}).rows.map(x=>x.id),['OLD','SECOND','PICKUP','UNKNOWN']));
 test('conflicting local identity is counted for review, not silently deleted',()=>assert.equal(d.facts(rows,pid).quarantined,2));
 test('counts keep production, pickup, completion and unknown separate',()=>{let f=d.facts(rows,pid);assert.equal(f.all,5);assert.equal(f.new,1);assert.equal(f.inprogress,1);assert.equal(f.ready,1);assert.equal(f.closed,1);assert.equal(f.other,1);assert.equal(f.unpriced,2)});
 test('search finds exact ID independent of wording',()=>assert.deepEqual(d.select(rows,pid,{tab:'all',query:' second '}).rows.map(x=>x.id),['SECOND']));
 test('search never returns records from another business',()=>assert.equal(d.select(rows,pid,{tab:'all',query:'Do not reveal'}).total,0));
 test('pagination clamps and retains all matching rows',()=>{let r=d.select(rows,pid,{tab:'all',page:10,pageSize:2});assert.equal(r.page,3);assert.equal(r.pages,3);assert.equal(r.rows.length,1);assert.equal(r.total,5)});
 test('genuine zero amount differs from missing, empty, invalid or negative',()=>{assert.equal(d.amount(0),0);for(let v of [null,undefined,'',' ',NaN,Infinity,-5,'oops'])assert.equal(d.amount(v),null);assert.equal(d.amount('65.50'),65.5)});
 test('payment state is never inferred from price or completion',()=>{assert.equal(d.payment({price:65,status:'Picked Up'}),'Not recorded on this order');assert.equal(d.payment({paymentStatus:'Paid'}),'Paid')});
 test('display escaping rejects injected HTML',()=>assert.equal(d.escape('<img src=x onerror="a">'), '&lt;img src=x onerror=&quot;a&quot;&gt;'));
 test('only raster data image sources can be used for saved photo previews',()=>{assert.ok(d.image('data:image/png;base64,aGVsbG8='));for(let v of ['javascript:alert(1)','data:image/svg+xml,<svg/>','https://evil.invalid/pixel','file:///x'])assert.equal(d.image(v),'')});
 test('evidence checker is case-sensitive and preserves exact wording',()=>{const r=d.coverage('AEJMRT','  RAMJET ramjet!  ');assert.deepEqual(r.missing,['r','a','m','j','e','t','!']);assert.equal(r.wording,'  RAMJET ramjet!  ');assert.equal(r.evidenceOnly,true)});
 test('evidence coverage does not become machine certification',()=>{let r=d.coverage('AEJMRT','RAMJET');assert.equal(r.missing.length,0);assert.equal(r.productionCertified,false)});
 test('price arithmetic is per linear foot and converts inches explicitly',()=>{assert.equal(d.priceGuide(9,24,'in').subtotal,18);assert.equal(d.priceGuide(12,2.5,'ft').subtotal,30)});
 test('price preview rejects incomplete or invalid measurements and labels calculation only',()=>{for(let [r,l,u] of [[null,2,'ft'],[9,0,'ft'],[9,-1,'ft'],[9,2,'cm']])assert.equal(d.priceGuide(r,l,u).ok,false);assert.equal(d.priceGuide(9,2,'ft').isQuote,false)});
 test('helpers preserve every original record byte in fixture',()=>assert.equal(JSON.stringify(rows),frozen));
 test('order details exclude conflicting vessel records',()=>assert.equal(d.orderView(rows[5],pid),null));
 test('Ike details preserve exact sign text and render missing evidence explicitly',()=>{let r=d.orderView(rows[0],pid);assert.equal(r.wording,'  Smoke  Hole!  ');assert.equal(r.lengthFeet,null);assert.equal(r.species,'Not recorded');assert.equal(r.productionVerified,false);assert.equal(r.price,65)});
 test('saved dimensional evidence is not newly approved by viewing',()=>{let r=d.orderView({...rows[0],pricingProof:{speciesName:'Cedar',lengthFeet:2,ratePerFoot:9,ownerVisualVerificationRequired:true}},pid);assert.equal(r.species,'Cedar');assert.equal(r.lengthFeet,2);assert.equal(r.needsLengthReview,true);assert.equal(r.productionVerified,false)});
 test('displayed approval and order price conflict remains explicit',()=>{let r=d.orderView({...rows[0],approvedDesignLock:{wording:'Different',price:80}},pid);assert.equal(r.approvalMismatch,true);assert.equal(r.priceMismatch,true)});
 test('all previous auth/commissioning helper scripts are retained',()=>{for(let n of ['VERIFY_IRONBOUND.cjs','VERIFY_STEADYHAND.cjs','input_hygiene.js','ike_style_registry.js','fleet_supabase.js'])assert.ok(fs.existsSync(path.join(root,n)),n)});
}
