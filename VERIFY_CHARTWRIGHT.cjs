'use strict';
// Offline release/plan checks. No network, database, browser data, or file writes.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'.');
const read=n=>{assert.ok(fs.existsSync(path.join(root,n)),`Required file missing: ${n}`);return fs.readFileSync(path.join(root,n),'utf8');};
const json=n=>JSON.parse(read(n));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const normalize=s=>s.replace(/\n\s*<!-- CHARTWRIGHT_PLAN_LINK_START -->[\s\S]*?<!-- CHARTWRIGHT_PLAN_LINK_END -->/,'').replaceAll('8.8.20.34','@BUILD@').replaceAll('8.8.20.33','@BUILD@').replaceAll('chartwright-882034','@SEAL@').replaceAll('surefoot-882033','@SEAL@').replaceAll('CHARTWRIGHT','@NAME@').replaceAll('SUREFOOT','@NAME@').replaceAll('Chartwright','@Name@').replaceAll('SureFoot','@Name@').replace(/\n\s*<!-- CHARTWRIGHT_PLAN_LINK_START -->[\s\S]*?<!-- CHARTWRIGHT_PLAN_LINK_END -->/,'');
test('one unique Chartwright release identity agrees across deployment metadata',()=>{
 const m=json('DEPLOYMENT_MANIFEST.json'),s=json('RELEASE_SEAL.json'),i=json('RELEASE_INVENTORY.json');
 assert.equal(m.build,'8.8.20.34');assert.equal(m.release_name,'Chartwright TEST');assert.equal(m.release_seal,'chartwright-882034');
 assert.equal(s.build,m.build);assert.equal(s.seal,m.release_seal);assert.equal(i.build,m.build);assert.equal(i.seal,m.release_seal);
 for(const n of ['index.html','owner.html','captain.js']){assert.ok(read(n).includes('8.8.20.34'));assert.ok(read(n).includes('CHARTWRIGHT TEST'));}
});
test('current acceptance and installation instructions no longer point to SteadyHand',()=>{
 for(const n of ['README.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md'])assert.ok(read(n).split('\n')[0].includes('8.8.20.34'),n);
 const text=read('START_HERE_CHARTWRIGHT.md');assert.ok(text.includes('8.8.20.32')&&text.includes('8.8.20.33'));assert.ok(text.includes('Do not run SQL'));assert.ok(text.includes('Do not clear Safari'));
});
test('planning brief is static, public-safe documentation, never an operating workspace',()=>{
 const s=read('chartwright-brief.html');assert.ok(s.includes('PLANNED · NOT COMMISSIONED'));assert.ok(s.includes('Planning document only'));
 assert.doesNotMatch(s,/<script\b|<form\b|\bonclick\s*=|\bonload\s*=|\bcontenteditable\s*=/i);
 assert.doesNotMatch(s,/access_token|refresh_token|service_role|@yahoo\.com|@gmail\.com/i);
 assert.ok(s.includes('connect-src &#39;none&#39;')||s.includes("connect-src 'none'"));
});
test('Engine links to the brief without creating or authorizing a vessel',()=>{
 const index=read('index.html');assert.ok(index.includes('id="chartwrightPlanLink"'));assert.ok(index.includes('href="chartwright-brief.html"'));
 const p=json('IRON_SQUARE_PLAN.json');assert.equal(p.status,'planning_only');assert.equal(p.commissioned,false);assert.equal(p.canonical_project_id,null);assert.equal(p.auto_commission,false);assert.equal(p.auto_retry,'forbidden');
});
test('SureFoot executable behavior is preserved apart from release labels and the plan link',()=>{
 const p=json('CHARTWRIGHT_PRESERVATION.json');assert.ok(Object.keys(p.normalized_runtime_sha256).length>=10);
 for(const [n,h] of Object.entries(p.normalized_runtime_sha256))assert.equal(hash(normalize(read(n))),h,n+' behavior drift');
});
test('all historical evidence, images, SQL, style geometry and unchanged records code stay byte-exact',()=>{
 const p=json('CHARTWRIGHT_PRESERVATION.json');assert.equal(p.image_count,16);assert.equal(p.sql_count,5);
 assert.ok(p.exact_sha256['ike_style_registry.js']);assert.ok(p.exact_sha256['SUREFOOT_TEST_EVIDENCE.json']);
 for(const [n,h] of Object.entries(p.exact_sha256))assert.equal(hash(fs.readFileSync(path.join(root,n))),h,n+' preservation drift');
});
test('new ship starts with siding and retains accessory, nails, trim and photo requirements',()=>{
 const p=json('IRON_SQUARE_PLAN.json');assert.equal(p.phases[0].id,'siding');
 for(const v of ['front','back','left','right'])assert.ok(p.photo_views.includes(v));
 for(const v of ['siding','starter','inside_corners','outside_corners','opening_trim','fasteners','miscellaneous'])assert.ok(p.material_line_types.includes(v));
 assert.equal(p.scale_policy,'field_measure_or_verified_reference_required');assert.equal(p.complete_takeoff_requires_resolved_material_rules,true);
});
test('plan separates Admiral ownership, Fleet Core business class and programs',()=>{
 const p=json('IRON_SQUARE_PLAN.json');assert.equal(p.proposed_class,'fleet_core_business_vessel');assert.equal(p.proposed_ownership,'admiral_owned');assert.equal(p.final_class_requires_approval,true);assert.equal(p.bootstrap_build_class,'admiral_program_outside_fleet_core');assert.equal(p.prior_househull_reconciliation_required,true);
});
test('planned acceptance fixture arithmetic is internally consistent, not an estimator certification',()=>{
 const p=json('IRON_SQUARE_PLAN.json');assert.equal(p.fixture_scope,'synthetic_specification_examples_not_product_execution');
 for(const c of p.arithmetic_fixtures){const gross=c.width_ft*c.height_ft+c.gable_base_ft*c.gable_height_ft/2;const deductions=c.openings.reduce((s,o)=>s+o.width_ft*o.height_ft*o.count,0);const net=gross-deductions;const ordered=net*(1+c.waste_percent/100);assert.ok(net>=0);for(const [v,e] of [[gross,c.expected.gross_sqft],[net,c.expected.net_sqft],[net/100,c.expected.net_squares],[ordered,c.expected.with_waste_sqft],[Math.ceil(ordered/c.pack_coverage_sqft),c.expected.packs]])assert.ok(Math.abs(v-e)<1e-8,c.id+': arithmetic discrepancy');}
});
test('server-owned operations cannot be replayed by a planning file',()=>{
 const p=json('IRON_SQUARE_PLAN.json');assert.equal(p.existing_operation_policy,'read_and_reconcile_only_never_replay');assert.equal(p.permissions_changed,false);
 for(const id of ['2d7fc23f-180d-4d61-ae22-f241d096cde5','5bceb74a-86c6-49e3-a2a1-d9152527d3b0'])assert.ok(p.protected_operations.includes(id));
});
test('all runtime and model hashes still match the final package bytes',()=>{
 const m=json('DEPLOYMENT_MANIFEST.json');for(const [n,h] of Object.entries(m.runtime_integrity.files))assert.equal(hash(fs.readFileSync(path.join(root,n))),h,n);
 for(const [n,v] of Object.entries(m.model_integrity.files))assert.equal(hash(fs.readFileSync(path.join(root,n))),v.sha256,n);
});
test('inventory and three checksum ledgers cover the complete flat release',()=>{
 const actual=fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort();const inv=json('RELEASE_INVENTORY.json');assert.deepEqual(inv.files.slice().sort(),actual);assert.equal(inv.file_count,actual.length);
 const sums=read('CHECKSUMS.sha256');assert.equal(read('RELEASE_CHECKSUMS.sha256'),sums);assert.equal(read('SHA256SUMS.txt'),sums);
 const rows=sums.trim().split('\n').map(x=>x.split(/\s{2,}/));assert.equal(rows.length,actual.length-3);
 for(const [h,n] of rows)assert.equal(hash(fs.readFileSync(path.join(root,n))),h,n);
});
