/* Final-byte Lanternwake contract. Usage: node VERIFY_LANTERNWAKE_RELEASE.cjs [release-dir] [exact-helmsman-baseline-dir]
 * Run after compilation and final sealing. Historical verifiers remain unchanged.
 */
'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||'.'),baseline=path.resolve(process.argv[3]||path.join(root,'..','baseline'));
const bytes=n=>fs.readFileSync(path.join(root,n)),read=n=>bytes(n).toString('utf8'),json=n=>JSON.parse(read(n));
const oldBytes=n=>fs.readFileSync(path.join(baseline,n)),oldJson=n=>JSON.parse(oldBytes(n));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),build='8.8.20.44',seal='lanternwake-882044';
const baseDigest='8d9edff6bc943dc36215edda00be7f0a9e349f3178d6b8f39becc6c896ab4b69';
const currentModels=['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];
const runtimeLabels=['app.js','index.html','owner.html','captain.js','platform_identity.js','input_hygiene.js','fleet_supabase.js','simple_books.js','business_deck.js','headway_contracts.js','fun_program.js','sw.js','manifest.webmanifest','stormwake_game.js'];
const headerDocs=['README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md','CURRENT_ARCHITECTURE.md','CHANGELOG.md'];
function unstamp(s){for(const[now,old]of [['8.8.20.44','8.8.20.43'],['lanternwake-882044','helmsman-882043'],['Lanternwake TEST','Helmsman TEST'],['LANTERNWAKE TEST','HELMSMAN TEST'],['LANTERNWAKE ·','HELMSMAN ·'],['lanternwake=882044','helmsman=882043']])s=s.replaceAll(now,old);return s.replaceAll(hash(bytes('stormwake_player.html')),hash(oldBytes('stormwake_player.html')));}
const currentFiles=()=>fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort();
const changedFiles=()=>currentFiles().filter(n=>!fs.existsSync(path.join(baseline,n))||!bytes(n).equals(oldBytes(n)));

test('Lanternwake page, app, worker, current metadata and live module labels agree',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),s=json('RELEASE_SEAL.json'),w=json('manifest.webmanifest');
  a.equal(m.build,build);a.equal(m.version,build);a.equal(m.release_seal,seal);a.equal(m.release_name,'Lanternwake TEST');a.equal(m.releaseName,'Lanternwake TEST');a.equal(m.release,'Lanternwake TEST');
  a.equal(s.build,build);a.equal(s.seal,seal);a.equal(s.release,'Lanternwake TEST');a.equal(w.version,build);a.ok(w.start_url.includes(seal));
  for(const n of runtimeLabels){a.ok(read(n).includes(build),n);a.ok(!read(n).includes('8.8.20.43'),n);a.ok(!read(n).includes('helmsman-882043'),n);a.ok(!read(n).includes('helmsman=882043'),n);}
  a.ok(read('stormwake_game.js').includes('LANTERNWAKE · 8.8.20.44 TEST'));a.ok(read('index.html').includes(seal));a.ok(read('sw.js').includes(seal));
});
test('actual shared transport default and saved session use Lanternwake identity',()=>{
  const stored=new Map(),context={window:{addEventListener(){},dispatchEvent(){}},document:{addEventListener(){}},performance:{now:()=>0},sessionStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)},fetch(){throw Error('Network forbidden');},setTimeout(){throw Error('Unexpected session timer');},clearTimeout(){}};
  vm.createContext(context);vm.runInContext(read('fleet_supabase.js'),context);
  const client=context.window.DarkSkySupabase.create({url:'https://invalid.test',publishableKey:'synthetic-public-key',sessionKey:'synthetic-lanternwake-identity'});
  a.equal(client.build,build);a.equal(client.saveSession({access_token:'synthetic-token',user:{id:'synthetic-user'}}).build,build);a.equal(JSON.parse(stored.get(client.sessionKey)).build,build);
});
test('all nonvisual runtime modules preserve exact .43 behavior after reversing labels and player digest',()=>{
  for(const n of runtimeLabels)a.deepEqual(Buffer.from(unstamp(read(n))),oldBytes(n),n);
  for(const n of ['stormwake_core.js','stormwake_game.css','BUILD_STORMWAKE_PLAYER.py','fun_core.js','fun_player.js','fun_player.css','fun_player.html'])a.deepEqual(bytes(n),oldBytes(n),n);
});
test('four current models match runtime while all 39 retained reference declarations and bodies stay exact',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),old=oldJson('DEPLOYMENT_MANIFEST.json');let retained=0;
  a.deepEqual(Object.keys(m.model_integrity.files).sort(),Object.keys(old.model_integrity.files).sort());
  for(const n of currentModels){const d=m.model_integrity.files[n];a.equal(d.build,build);a.equal(d.policy,'current-runtime-build');a.equal(json(n).build,build);a.equal(read(n).replaceAll(build,'8.8.20.43'),oldBytes(n).toString('utf8'),n);}
  for(const[n,d]of Object.entries(old.model_integrity.files))if(d.policy==='retained-versioned-reference'){retained++;a.deepEqual(m.model_integrity.files[n],d,n);a.deepEqual(bytes(n),oldBytes(n),n);}a.equal(retained,39);
});
test('runtime, model and compiled-player declarations hash final actual bytes',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json');a.equal(Object.keys(m.runtime_integrity.files).length,30);
  for(const n of m.required_runtime_files)a.ok(fs.existsSync(path.join(root,n)),n);
  for(const[n,h]of Object.entries(m.runtime_integrity.files))a.equal(hash(bytes(n)),h,n);
  for(const[n,d]of Object.entries(m.model_integrity.files))a.equal(hash(bytes(n)),d.sha256,n);
  const player=bytes('stormwake_player.html'),d=m.lazy_program_assets['stormwake_player.html'];a.equal(hash(player),d.sha256);a.equal(player.length,d.bytes);a.ok(player.length<1048576);a.ok(read('fun_program.js').includes(d.sha256));a.ok(player.toString('utf8').includes('LANTERNWAKE · 8.8.20.44 TEST'));
});
test('exact 233-file Helmsman baseline content identity and every old filename survive',()=>{
  const inv=oldJson('RELEASE_INVENTORY.json');a.equal(inv.file_count,233);a.equal(inv.files.length,233);a.equal(inv.build,'8.8.20.43');a.equal(inv.seal,'helmsman-882043');
  // release-content-sha256-v1: UTF-8 compact JSON sorted [filename, body SHA-256] rows.
  const rows=inv.files.slice().sort().map(n=>[n,hash(oldBytes(n))]);a.equal(hash(JSON.stringify(rows)),baseDigest);
  for(const n of inv.files)a.ok(fs.existsSync(path.join(root,n)),n);
});
test('all unscoped baseline bodies including Helmsman evidence, business assets and SQL stay exact',()=>{
  const allowed=new Set([...runtimeLabels,...currentModels,...headerDocs,'stormwake_gl.js','stormwake_world.js','stormwake_player.html','DEPLOYMENT_MANIFEST.json','RELEASE_SEAL.json','PATCH_CONTRACT.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt']);
  for(const n of oldJson('RELEASE_INVENTORY.json').files)if(!allowed.has(n))a.deepEqual(bytes(n),oldBytes(n),n);
});
test('current document headers retain every previous body byte as an exact suffix',()=>{
  for(const n of headerDocs){const now=bytes(n),old=oldBytes(n);a.ok(now.length>old.length,n);a.deepEqual(now.subarray(now.length-old.length),old,n);a.ok(read(n).split('\n')[0].includes(build),n);}
});
test('patch targets exact Helmsman content with no deletion, database action or expanded upload budget',()=>{
  const p=json('PATCH_CONTRACT.json');a.equal(p.target_build,build);a.equal(p.target_seal,seal);a.equal(p.requires_deletions,false);a.equal(p.database_actions,'none');a.equal(p.max_upload_files,85);a.equal(p.supported_bases.length,1);
  const b=p.supported_bases[0];a.equal(b.build,'8.8.20.43');a.equal(b.file_count,233);a.equal(b.content_digest_algorithm,'release-content-sha256-v1');a.equal(b.content_sha256,baseDigest);
  a.ok(changedFiles().length>0&&changedFiles().length<=85,'Changed/new file budget');
});
test('three user steps preserve completed progress and identify the exact bounded upload',()=>{
  const start=read('START_HERE_LANTERNWAKE.md');a.ok(start.split('\n')[0].includes(build));a.ok(read('LANTERNWAKE_TEST_REPORT.md').split('\n')[0].includes(build));
  a.ok(start.includes('SAVE GAME FILE'));a.ok(start.includes('before refresh'));a.ok(start.includes('Do not run SQL'));a.ok(start.includes('Helmsman 8.8.20.43'));a.ok(start.includes('LANTERNWAKE TEST · 8.8.20.44'));a.ok(start.includes('saved completed game'));a.match(start,/no replay is required/i);a.equal((start.match(/^\d\. /gm)||[]).length,3);a.doesNotMatch(start,/reset (?:the |your )?(?:game|progress)|second device/i);
  const count=changedFiles().length,filename=`DarkSky882044-Lanternwake-Upload${count}-TEST.zip`;
  for(const n of ['START_HERE_LANTERNWAKE.md','LANTERNWAKE_TEST_REPORT.md','README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md']){a.ok(read(n).includes(filename),n);a.doesNotMatch(read(n),/__LANTERNWAKE_/,n);}
});
test('current gate keeps .44 native and live acceptance boundaries separate from exact .43 evidence',()=>{
  const g=json('RELEASE_GATE.json'),m=json('DEPLOYMENT_MANIFEST.json');a.equal(g.build,build);a.equal(g.release,'Lanternwake TEST');a.equal(g.native_field_acceptance,'PENDING');a.equal(g.quota_recovery,'NOT_CLAIMED');a.equal(g.live_database_writes,false);a.equal(g.server_permission_certification,'NOT_CLAIMED');a.equal(g.working_business_handoff,'NOT_CLAIMED');a.deepEqual(g.prior_release_evidence,oldJson('RELEASE_GATE.json'));
  a.equal(g.previous_user_observation.build,'8.8.20.43');a.equal(g.game_activity_relay.idle_minutes,15);a.equal(g.game_activity_relay.maximum_minutes,60);a.equal(g.visual_scope.core_mission_save_input_behavior_changed,false);a.equal(g.visual_scope.reference_media_bytes_in_game,false);
  a.deepEqual(m.helmsman_upgrade,oldJson('DEPLOYMENT_MANIFEST.json').helmsman_upgrade);a.equal(m.lanternwake_upgrade.admiral_idle_minutes,15);a.equal(m.lanternwake_upgrade.admiral_maximum_minutes,60);a.equal(m.lanternwake_upgrade.game_activity_transport_changed,false);a.equal(m.lanternwake_upgrade.server_authority_changed,false);a.equal(m.lanternwake_upgrade.production_activation,false);
});
test('inventory and three identical ledgers cover all final release files exactly once',()=>{
  const names=currentFiles(),i=json('RELEASE_INVENTORY.json');a.equal(i.build,build);a.equal(i.seal,seal);a.deepEqual(i.files,names);a.equal(i.file_count,names.length);
  const ledger=read('CHECKSUMS.sha256');a.equal(ledger,read('RELEASE_CHECKSUMS.sha256'));a.equal(ledger,read('SHA256SUMS.txt'));const rows=ledger.trim().split('\n').map(l=>l.split('  '));a.equal(rows.length,names.length-3);a.equal(new Set(rows.map(x=>x[1])).size,rows.length);for(const[h,n]of rows)a.equal(hash(bytes(n)),h,n);
});
