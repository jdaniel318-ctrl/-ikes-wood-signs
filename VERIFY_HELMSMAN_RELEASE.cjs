/* Final-byte Helmsman contract. Usage: node VERIFY_HELMSMAN_RELEASE.cjs [release-dir] [exact-blacktide-baseline-dir]
 * Run after compilation and final sealing. Historical verifiers are preserved unchanged.
 */
'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||'.'),baseline=path.resolve(process.argv[3]||path.join(root,'..','baseline'));
const bytes=n=>fs.readFileSync(path.join(root,n)),read=n=>bytes(n).toString('utf8'),json=n=>JSON.parse(read(n));
const oldBytes=n=>fs.readFileSync(path.join(baseline,n)),oldJson=n=>JSON.parse(oldBytes(n));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),build='8.8.20.43',seal='helmsman-882043';
const currentModels=['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];
const runtimeLabels=['app.js','index.html','owner.html','captain.js','platform_identity.js','input_hygiene.js','fleet_supabase.js','simple_books.js','business_deck.js','headway_contracts.js','fun_program.js','sw.js','manifest.webmanifest','stormwake_game.js'];
function unstamp(s){for(const[now,old]of [['8.8.20.43','8.8.20.42'],['helmsman-882043','blacktide-882042'],['Helmsman TEST','Blacktide TEST'],['HELMSMAN TEST','BLACKTIDE TEST'],['HELMSMAN ·','BLACKTIDE ·'],['helmsman=882043','blacktide=882042'],['Helmsman','Blacktide']])s=s.replaceAll(now,old);return s.replaceAll(hash(bytes('stormwake_player.html')),hash(oldBytes('stormwake_player.html')));}
test('Helmsman page, app, worker, current metadata and live module labels agree',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),s=json('RELEASE_SEAL.json'),w=json('manifest.webmanifest');
  a.equal(m.build,build);a.equal(m.version,build);a.equal(m.release_seal,seal);a.equal(m.release_name,'Helmsman TEST');a.equal(m.releaseName,'Helmsman TEST');a.equal(m.release,'Helmsman TEST');
  a.equal(s.build,build);a.equal(s.seal,seal);a.equal(s.release,'Helmsman TEST');a.equal(w.version,build);a.ok(w.start_url.includes(seal));
  for(const n of runtimeLabels){a.ok(read(n).includes(build),n);a.ok(!read(n).includes('8.8.20.42'),n);a.ok(!read(n).includes('blacktide-882042'),n);a.ok(!read(n).includes('blacktide=882042'),n);}
  a.ok(read('stormwake_game.js').includes('HELMSMAN · 8.8.20.43 TEST'));a.ok(read('index.html').includes(seal));a.ok(read('sw.js').includes(seal));
});
test('actual shared transport default and saved session use Helmsman identity',()=>{
  const stored=new Map(),context={window:{addEventListener(){},dispatchEvent(){}},document:{addEventListener(){}},performance:{now:()=>0},sessionStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)},fetch(){throw Error('Network forbidden');},setTimeout(){throw Error('Unexpected session timer');},clearTimeout(){}};
  vm.createContext(context);vm.runInContext(read('fleet_supabase.js'),context);
  const client=context.window.DarkSkySupabase.create({url:'https://invalid.test',publishableKey:'synthetic-public-key',sessionKey:'synthetic-helmsman-identity'});
  a.equal(client.build,build);a.equal(client.saveSession({access_token:'synthetic-token',user:{id:'synthetic-user'}}).build,build);a.equal(JSON.parse(stored.get(client.sessionKey)).build,build);
});
test('unrelated business and access modules change release labels only',()=>{for(const n of runtimeLabels.filter(n=>!['fleet_supabase.js','fun_program.js','stormwake_game.js'].includes(n)))a.equal(hash(Buffer.from(unstamp(read(n)))),hash(oldBytes(n)),n);});
test('four current models match runtime while all 39 retained reference declarations and bodies stay exact',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),old=oldJson('DEPLOYMENT_MANIFEST.json');let retained=0;
  for(const n of currentModels){const d=m.model_integrity.files[n];a.equal(d.build,build);a.equal(d.policy,'current-runtime-build');a.equal(json(n).build,build);a.equal(read(n).replaceAll(build,'8.8.20.42'),oldBytes(n).toString('utf8'),n);}
  for(const[n,d]of Object.entries(old.model_integrity.files))if(d.policy==='retained-versioned-reference'){retained++;a.deepEqual(m.model_integrity.files[n],d,n);a.deepEqual(bytes(n),oldBytes(n),n);}a.equal(retained,39);
});
test('runtime, model and compiled-player declarations hash final actual bytes',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json');a.equal(Object.keys(m.runtime_integrity.files).length,30);
  for(const n of m.required_runtime_files)a.ok(fs.existsSync(path.join(root,n)),n);
  for(const[n,h]of Object.entries(m.runtime_integrity.files))a.equal(hash(bytes(n)),h,n);
  for(const[n,d]of Object.entries(m.model_integrity.files))a.equal(hash(bytes(n)),d.sha256,n);
  const player=bytes('stormwake_player.html'),d=m.lazy_program_assets['stormwake_player.html'];a.equal(hash(player),d.sha256);a.equal(player.length,d.bytes);a.ok(player.length<1048576);a.ok(read('fun_program.js').includes(d.sha256));
});
test('exact 221-file baseline identity and every old filename survive',()=>{
  const inv=oldJson('RELEASE_INVENTORY.json');a.equal(inv.file_count,221);a.equal(inv.files.length,221);
  const rows=inv.files.slice().sort().map(n=>[n,hash(oldBytes(n))]);a.equal(hash(JSON.stringify(rows)),'453be03c7007efec61db20b49401bb427f967f1f1fd27c7630d6e9ec577bd368');
  for(const n of inv.files)a.ok(fs.existsSync(path.join(root,n)),n);
});
test('all unscoped baseline bodies, including Blacktide evidence, business assets and SQL, stay exact',()=>{
  const allowed=new Set([...runtimeLabels,...currentModels,'stormwake_core.js','stormwake_world.js','stormwake_game.css','stormwake_player.html','DEPLOYMENT_MANIFEST.json','RELEASE_SEAL.json','PATCH_CONTRACT.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt','README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md','CURRENT_ARCHITECTURE.md','CHANGELOG.md']);
  for(const n of oldJson('RELEASE_INVENTORY.json').files)if(!allowed.has(n))a.deepEqual(bytes(n),oldBytes(n),n);
});
test('patch targets exact Blacktide content with no deletions, database action or expanded handoff budget',()=>{
  const p=json('PATCH_CONTRACT.json');a.equal(p.target_build,build);a.equal(p.target_seal,seal);a.equal(p.requires_deletions,false);a.equal(p.database_actions,'none');a.equal(p.max_upload_files,85);a.equal(p.supported_bases.length,1);
  const b=p.supported_bases[0];a.equal(b.build,'8.8.20.42');a.equal(b.content_digest_algorithm,'release-content-sha256-v1');a.equal(b.content_sha256,'453be03c7007efec61db20b49401bb427f967f1f1fd27c7630d6e9ec577bd368');
});
test('current instructions and gate preserve honest pending native and final-byte evidence boundaries',()=>{
  for(const n of ['START_HERE_HELMSMAN.md','HELMSMAN_TEST_REPORT.md','README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md','CURRENT_ARCHITECTURE.md','CHANGELOG.md'])a.ok(read(n).split('\n')[0].includes(build),n);
  const start=read('START_HERE_HELMSMAN.md');a.ok(start.includes('SAVE GAME FILE'));a.ok(start.includes('before refresh'));a.ok(start.includes('Do not run SQL'));a.ok(start.includes('winch'));a.ok(start.includes('reverse'));a.ok(start.includes('rescue'));a.ok(start.includes('save'));a.doesNotMatch(start,/reset (?:the |your )?(?:game|progress)|second device/i);a.equal((start.match(/^\d\. /gm)||[]).length,3);
  const g=json('RELEASE_GATE.json');a.equal(g.build,build);a.equal(g.release,'Helmsman TEST');a.equal(g.native_field_acceptance,'PENDING');a.equal(g.quota_recovery,'NOT_CLAIMED');a.equal(g.live_database_writes,false);a.deepEqual(g.prior_release_evidence,oldJson('RELEASE_GATE.json'));
});
test('inventory and three identical ledgers cover all final release files exactly once',()=>{
  const names=fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort(),i=json('RELEASE_INVENTORY.json');a.equal(i.build,build);a.equal(i.seal,seal);a.deepEqual(i.files,names);a.equal(i.file_count,names.length);
  const ledger=read('CHECKSUMS.sha256');a.equal(ledger,read('RELEASE_CHECKSUMS.sha256'));a.equal(ledger,read('SHA256SUMS.txt'));const rows=ledger.trim().split('\n').map(l=>l.split('  '));a.equal(rows.length,names.length-3);a.equal(new Set(rows.map(x=>x[1])).size,rows.length);for(const[h,n]of rows)a.equal(hash(bytes(n)),h,n);
});
