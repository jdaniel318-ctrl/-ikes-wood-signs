/* Final-byte Blacktide release contract. Run after SEAL_BLACKTIDE.py.
 * Earlier release-specific checks remain historical; they are not relabeled.
 */
'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'.'),bytes=n=>fs.readFileSync(path.join(root,n)),read=n=>bytes(n).toString('utf8'),json=n=>JSON.parse(read(n));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),build='8.8.20.42',seal='blacktide-882042';
function unstamp(s){for(const [now,old] of [['8.8.20.42','8.8.20.41'],['blacktide-882042','stormwake-882041'],['Blacktide TEST','Stormwake TEST'],['BLACKTIDE TEST','STORMWAKE TEST'],['blacktide=882042','stormwake=882041']])s=s.replaceAll(now,old);return s;}

test('current page, manifest, worker, station and shared-client identities agree',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),s=json('RELEASE_SEAL.json'),w=json('manifest.webmanifest');
  a.equal(m.build,build);a.equal(m.release_seal,seal);a.equal(m.release_name,'Blacktide TEST');a.equal(s.build,build);a.equal(s.seal,seal);a.equal(w.version,build);
  for(const n of ['app.js','index.html','owner.html','captain.js','platform_identity.js','input_hygiene.js','fleet_supabase.js','sw.js'])a.ok(read(n).includes(build),n);
  a.ok(read('index.html').includes(seal));a.ok(read('sw.js').includes(seal));
});
test('runtime and model digests bind every actual required byte',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json');
  // The atomic loader hashes its executable snapshot. Required metadata, retained
  // models and original artwork also belong to the inventory/full-file ledgers.
  for(const n of m.required_runtime_files)a.ok(fs.existsSync(path.join(root,n)),n);
  a.equal(Object.keys(m.runtime_integrity.files).length,30);
  for(const [n,h] of Object.entries(m.runtime_integrity.files))a.equal(hash(bytes(n)),h,n);
  for(const [n,d] of Object.entries(m.model_integrity.files)){a.equal(hash(bytes(n)),d.sha256,n);a.equal(json(n).build,d.build,n);}
});
test('four current models and all 39 retained references retain their correct policy',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),p=json('BLACKTIDE_PRESERVATION.json');
  a.equal(p.retained_reference_models.length,39);
  for(const n of ['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json']){a.equal(m.model_integrity.files[n].policy,'current-runtime-build');a.equal(m.model_integrity.files[n].build,build);a.equal(json(n).build,build);}
  for(const [n,d] of Object.entries(p.retained_reference_declarations))a.deepEqual(m.model_integrity.files[n],d,n);
});
test('all 208 baseline filenames survive and unchanged payloads remain exact',()=>{
  const p=json('BLACKTIDE_PRESERVATION.json');a.equal(p.baseline_files.length,208);
  for(const n of p.baseline_files)a.ok(fs.existsSync(path.join(root,n)),n);
  for(const [n,h] of Object.entries(p.exact_sha256))a.equal(hash(bytes(n)),h,n);
});
test('business runtime and account modules differ only in release labels',()=>{
  const p=json('BLACKTIDE_PRESERVATION.json');a.equal(Object.keys(p.release_label_only_sha256).length,12);
  for(const [n,h] of Object.entries(p.release_label_only_sha256))a.equal(hash(Buffer.from(unstamp(read(n)))),h,n);
});
test('original game, mission/save logic, geometry and every SQL file are unchanged',()=>{
  const p=json('BLACKTIDE_PRESERVATION.json');
  for(const n of ['fun_core.js','fun_player.js','fun_player.css','fun_player.html','BUILD_FUN_PLAYER.py','stormwake_core.js','woodwright_fit.js',...p.sql_files]){a.ok(p.exact_sha256[n],n);a.equal(hash(bytes(n)),p.exact_sha256[n],n);}
  a.equal(p.sql_files.length,5);a.equal(p.image_files.length,16);
  for(const n of p.image_files)a.equal(hash(bytes(n)),p.exact_sha256[n],n);
});
test('compiled game has exact host and manifest digest and stays lazy and bounded',()=>{
  const b=bytes('stormwake_player.html'),m=json('DEPLOYMENT_MANIFEST.json'),h=hash(b),d=m.lazy_program_assets['stormwake_player.html'];
  a.equal(h,d.sha256);a.equal(b.length,d.bytes);a.ok(b.length<1048576);a.ok(read('fun_program.js').includes(h));
  const snapshot=read('index.html').match(/const snapshotPaths=\[([^;]+);/);a.ok(snapshot);a.ok(!snapshot[0].includes('stormwake_player.html'));
  a.ok(read('stormwake_player.html').includes("connect-src 'none'"));
});
test('game retains opaque isolation and introduces no network or site-storage dependency',()=>{
  for(const n of ['stormwake_core.js','stormwake_world.js','stormwake_gl.js','stormwake_game.js'])a.doesNotMatch(read(n),/\bfetch\s*\(|localStorage|indexedDB|XMLHttpRequest|WebSocket/);
  a.ok(read('fun_program.js').includes('allow-scripts'));a.ok(read('fun_program.js').includes("credentials:'omit'"));
  const m=json('DEPLOYMENT_MANIFEST.json').blacktide_upgrade;a.equal(m.external_runtime_dependencies,false);a.equal(m.business_authority_changed,false);a.equal(m.mission_schema_changed,false);
});
test('current instructions and reports distinguish test evidence from field acceptance',()=>{
  for(const n of ['START_HERE_BLACKTIDE.md','README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md','CURRENT_ARCHITECTURE.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md','BLACKTIDE_TEST_REPORT.md'])a.ok(read(n).split('\n')[0].includes(build),n);
  a.ok(read('START_HERE_BLACKTIDE.md').includes('Do not run SQL'));a.ok(read('BLACKTIDE_TEST_REPORT.md').includes('8 passed / 2 failed'));
  const g=json('RELEASE_GATE.json');a.equal(g.build,build);a.equal(g.native_field_acceptance,'PENDING');a.equal(g.quota_recovery,'NOT_CLAIMED');a.equal(g.live_database_writes,false);a.equal(g.prior_release_evidence.build,'8.8.20.41');
});
test('patch contract binds the exact Stormwake content without deletions or SQL',()=>{
  const p=json('PATCH_CONTRACT.json');a.equal(p.target_build,build);a.equal(p.target_seal,seal);a.equal(p.requires_deletions,false);a.equal(p.database_actions,'none');a.equal(p.max_upload_files,85);
  a.equal(p.supported_bases.length,1);a.equal(p.supported_bases[0].build,'8.8.20.41');a.equal(p.supported_bases[0].content_digest_algorithm,'release-content-sha256-v1');a.equal(p.supported_bases[0].content_sha256,'d260fea42435403df738ff2236f9b57b6c444fbffe9ccddf0c3bc63c1397df44');
});
test('inventory and three identical checksum ledgers cover the complete flat release',()=>{
  const names=fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort(),i=json('RELEASE_INVENTORY.json');
  a.equal(i.build,build);a.equal(i.seal,seal);a.deepEqual(i.files,names);a.equal(i.file_count,names.length);
  const ledger=read('CHECKSUMS.sha256');a.equal(ledger,read('RELEASE_CHECKSUMS.sha256'));a.equal(ledger,read('SHA256SUMS.txt'));
  const entries=ledger.trim().split('\n').map(line=>line.split('  '));a.equal(entries.length,names.length-3);a.equal(new Set(entries.map(x=>x[1])).size,entries.length);
  for(const [h,n] of entries)a.equal(hash(bytes(n)),h,n);
});
