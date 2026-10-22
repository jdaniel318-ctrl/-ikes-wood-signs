/* Scoped Breakwater final-release invariants; historical verifiers stay exact.
 * node VERIFY_BREAKWATER_RELEASE.cjs RELEASE EXACT_46 [--preseal]
 * --preseal checks source/compiled preservation before evidence/metadata sealing.
 * No browser, network, GPU, database or game replay is performed.
 */
'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),child=require('node:child_process');
const positional=process.argv.slice(2).filter(x=>!x.startsWith('--'));
const root=path.resolve(positional[0]||__dirname),baseline=path.resolve(positional[1]||path.join(root,'../baseline'));
const preseal=process.argv.includes('--preseal'),build='8.8.20.47',seal='breakwater-882047';
const baseDigest='0a32c46a80a86d324ef876a8153057f3091528d53d6cfc9ebd56f00019ad1f8c';
const bytes=n=>fs.readFileSync(path.join(root,n)),read=n=>bytes(n).toString('utf8'),json=n=>JSON.parse(read(n));
const oldBytes=n=>fs.readFileSync(path.join(baseline,n)),oldRead=n=>oldBytes(n).toString('utf8'),oldJson=n=>JSON.parse(oldRead(n));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const labelOnly=['app.js','index.html','owner.html','captain.js','platform_identity.js','input_hygiene.js','fleet_supabase.js','simple_books.js','business_deck.js','headway_contracts.js','sw.js','manifest.webmanifest'];
const currentModels=['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];
const headers=['README.md','README.txt','UPLOAD_THIS_ONE_BUILD.md','RELEASE_ACCEPTANCE.md','TEST_BUILD_REPORT.md','CURRENT_ARCHITECTURE.md','CHANGELOG.md'];
const currentFiles=()=>fs.readdirSync(root).filter(n=>fs.lstatSync(path.join(root,n)).isFile()).sort();
const changedFiles=()=>currentFiles().filter(n=>!fs.existsSync(path.join(baseline,n))||!bytes(n).equals(oldBytes(n)));
function unstamp(s){for(const[now,old]of [['8.8.20.47','8.8.20.46'],['breakwater-882047','saltglass-882046'],['Breakwater TEST','Saltglass TEST'],['BREAKWATER TEST','SALTGLASS TEST'],['BREAKWATER ·','SALTGLASS ·'],['breakwater=882047','saltglass=882046']])s=s.replaceAll(now,old);return s;}
function python(script){const run=child.spawnSync(process.env.PYTHON||process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['-B','-c',script,root,baseline],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});a.equal(run.status,0,run.stderr||run.stdout);return run.stdout;}

test('current page, app, worker, metadata and player labels agree on .47',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),s=json('RELEASE_SEAL.json'),w=json('manifest.webmanifest');
  a.equal(m.build,build);a.equal(m.version,build);a.equal(m.release_seal,seal);a.equal(s.build,build);a.equal(s.seal,seal);
  for(const key of ['release_name','releaseName','release'])a.equal(m[key],'Breakwater TEST');
  a.equal(w.version,build);a.ok(w.start_url.includes(seal));
  for(const n of [...labelOnly,'fun_program.js','stormwake_game.js']){a.ok(read(n).includes(build),n);a.ok(!read(n).includes('8.8.20.46'),n);a.ok(!read(n).includes('saltglass-882046'),n);a.ok(!read(n).includes('saltglass=882046'),n);}
  a.ok(read('stormwake_game.js').includes('BREAKWATER · 8.8.20.47 TEST'));
});

test('unrelated current business runtime differs only by release labels',()=>{
  for(const n of labelOnly)a.deepEqual(Buffer.from(unstamp(read(n))),oldBytes(n),n);
});

test('current four model versions and all 39 historical model declarations remain coherent',()=>{
  const m=json('DEPLOYMENT_MANIFEST.json'),old=oldJson('DEPLOYMENT_MANIFEST.json');let retained=0;
  a.deepEqual(Object.keys(m.model_integrity.files).sort(),Object.keys(old.model_integrity.files).sort());
  for(const n of currentModels){const entry=m.model_integrity.files[n];a.equal(entry.build,build);a.equal(entry.policy,'current-runtime-build');a.equal(json(n).build,build);a.equal(read(n).replaceAll(build,'8.8.20.46'),oldRead(n));}
  for(const[n,entry]of Object.entries(old.model_integrity.files))if(entry.policy==='retained-versioned-reference'){retained++;a.deepEqual(m.model_integrity.files[n],entry,n);a.deepEqual(bytes(n),oldBytes(n),n);}a.equal(retained,39);
});

test('voyageSummary is the only added core export and all existing mechanics remain exact',()=>{
  const previous=require(path.join(baseline,'stormwake_core.js')),current=require(path.join(root,'stormwake_core.js'));
  a.deepEqual(Object.keys(current).sort(),[...Object.keys(previous),'voyageSummary'].sort());a.equal(typeof current.voyageSummary,'function');
  for(const[name,value]of Object.entries(previous))if(typeof value==='function')a.equal(current[name].toString(),value.toString(),name);else a.deepEqual(current[name],value,name);
  const text=read('stormwake_core.js'),match=/return Object\.freeze\(\{([^}]*)\}\);\}\);\s*$/.exec(text);a.ok(match,'Core export form');
  const normalized=text.slice(0,match.index)+match[0].replace(match[1],match[1].split(',').filter(v=>v.trim()!=='voyageSummary').join(','));
  // Every pre-existing source line must survive, in order; additions may surround them.
  const lines=normalized.split('\n');let at=0;
  for(const line of oldRead('stormwake_core.js').split('\n')){if(!line.trim())continue;while(at<lines.length&&lines[at]!==line)at++;a.ok(at<lines.length,'Changed pre-existing core source line: '+line.slice(0,100));at++;}
  const state=current.fresh(),before=current.serialize(state);current.voyageSummary(state);a.equal(current.serialize(state),before,'Summary changed save state');
});

test('renderer, cast, texture package, controls CSS and legacy program remain byte-exact',()=>{
  for(const n of ['stormwake_three.js','stormwake_cast.js','stormwake_gl.js','stormwake_comfort.js','stormwake_game.css','stormwake_assets.json','STORMWAKE_VENDOR.json','stormwake_three_vendor.js','STORMWAKE_BUILD_RULES.py','fun_core.js','fun_player.js','fun_player.css','fun_player.html'])a.deepEqual(bytes(n),oldBytes(n),n);
  a.deepEqual(Buffer.from(read('BUILD_STORMWAKE_PLAYER.py').replaceAll(build,'8.8.20.46')),oldBytes('BUILD_STORMWAKE_PLAYER.py'));
});

test('exact 276-file .46 baseline content identity and every previous filename survive',()=>{
  const inv=oldJson('RELEASE_INVENTORY.json');a.equal(inv.file_count,276);a.equal(inv.files.length,276);a.equal(inv.build,'8.8.20.46');a.equal(inv.seal,'saltglass-882046');
  a.equal(sha(JSON.stringify(inv.files.slice().sort().map(n=>[n,sha(oldBytes(n))]))),baseDigest);
  for(const n of inv.files)a.ok(fs.existsSync(path.join(root,n)),n);
});

test('all unscoped old files and historical reports/verifiers remain byte-exact',()=>{
  const allowed=new Set([...labelOnly,...currentModels,...headers,'fun_program.js','fun_program.css','stormwake_core.js','stormwake_game.js','stormwake_world.js','BUILD_STORMWAKE_PLAYER.py','STORMWAKE_PLAYER_BUILD.json','stormwake_player.html','DEPLOYMENT_MANIFEST.json','RELEASE_SEAL.json','PATCH_CONTRACT.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt']);
  for(const n of oldJson('RELEASE_INVENTORY.json').files)if(!allowed.has(n))a.deepEqual(bytes(n),oldBytes(n),n);
});

test('document history, earlier gate and prior manifest upgrade blocks are preserved',()=>{
  for(const n of headers){const now=bytes(n),old=oldBytes(n);a.ok(now.length>old.length,n);a.deepEqual(now.subarray(now.length-old.length),old,n);a.ok(read(n).split('\n')[0].includes(build),n);}
  const g=json('RELEASE_GATE.json'),m=json('DEPLOYMENT_MANIFEST.json'),old=oldJson('DEPLOYMENT_MANIFEST.json');a.deepEqual(g.prior_release_evidence,oldJson('RELEASE_GATE.json'));
  for(const[key,value]of Object.entries(old))if(key.endsWith('_upgrade')||key.endsWith('_repair'))a.deepEqual(m[key],value,key);
  a.equal(g.native_field_acceptance,'PENDING');a.equal(g.live_database_writes,false);a.equal(g.game_program.save_schema,'fun-stormwake-v2');
  for(const upgrade of [m.breakwater_upgrade,g.breakwater_upgrade]){a.equal(upgrade.save_format_changed,false);a.equal(upgrade.mission_rules_changed,false);a.equal(upgrade.existing_core_function_bodies_changed,false);a.equal(upgrade.movement_camera_controls_changed,false);a.equal(upgrade.renderer_cast_assets_changed,false);a.equal(upgrade.admiral_idle_minutes,15);a.equal(upgrade.admiral_maximum_minutes,60);a.equal(upgrade.game_activity_transport_changed,false);a.equal(upgrade.server_authority_changed,false);a.equal(upgrade.production_activation,false);}
});

test('patch names exact .46 content with no deletions or database action and at most 85 files',()=>{
  const p=json('PATCH_CONTRACT.json');a.equal(p.target_build,build);a.equal(p.target_seal,seal);a.equal(p.requires_deletions,false);a.equal(p.database_actions,'none');a.equal(p.max_upload_files,85);a.equal(p.supported_bases.length,1);
  const b=p.supported_bases[0];a.equal(b.build,'8.8.20.46');a.equal(b.file_count,276);a.equal(b.content_digest_algorithm,'release-content-sha256-v1');a.equal(b.content_sha256,baseDigest);
  a.ok(changedFiles().length>0&&changedFiles().length<=85);
  for(const n of fs.readdirSync(root)){if(['.git','__pycache__'].includes(n))continue;const s=fs.lstatSync(path.join(root,n));a.ok(s.isFile()&&!s.isSymbolicLink(),n);if(!fs.existsSync(path.join(baseline,n)))a.match(n,/^(?:BREAKWATER_[A-Z_]+\.(?:md|json)|START_HERE_BREAKWATER\.md|VERIFY_BREAKWATER_[A-Z_]+\.(?:py|cjs|mjs)|SEAL_BREAKWATER\.py)$/);}
});

test('compiled player input chain and host digest identify the final bounded offline bytes',()=>{
  a.match(python("import pathlib,sys;sys.path.insert(0,sys.argv[1]);from SEAL_BREAKWATER import validate_compiled_inputs;r=pathlib.Path(sys.argv[1]);d={p.name:p.read_bytes() for p in r.iterdir() if p.is_file()};validate_compiled_inputs(r,d);print('PASS current compiled inputs')"),/PASS/);
  a.ok(read('stormwake_player.html').includes('BREAKWATER · 8.8.20.47 TEST'));
  const m=json('DEPLOYMENT_MANIFEST.json'),old=oldJson('DEPLOYMENT_MANIFEST.json');a.deepEqual(m.required_runtime_files,old.required_runtime_files);a.deepEqual(Object.keys(m.runtime_integrity.files).sort(),Object.keys(old.runtime_integrity.files).sort());
});

test('current selected evidence is passing and bound to final source bytes',{skip:preseal},()=>{
  a.match(python("import pathlib,sys;sys.path.insert(0,sys.argv[1]);from SEAL_BREAKWATER import validate_current_evidence;r=pathlib.Path(sys.argv[1]);d={p.name:p.read_bytes() for p in r.iterdir() if p.is_file()};validate_current_evidence(d);print('PASS current selected evidence')"),/PASS/);
  const g=json('RELEASE_GATE.json'),e=json('BREAKWATER_TEST_RESULTS.json');a.equal(g.pass,true);a.equal(g.verification_status,'OFFLINE_TARGETED_CHECKS_PASSED');a.equal(g.evidence_file,'BREAKWATER_TEST_RESULTS.json');a.equal(e.build,build);
});

test('final instructions name the exact patch and preserve saved progress',{skip:preseal},()=>{
  const start=read('START_HERE_BREAKWATER.md'),count=changedFiles().length,filename=`DarkSky882047-Breakwater-Upload${count}-TEST.zip`;
  for(const n of ['START_HERE_BREAKWATER.md','BREAKWATER_TEST_REPORT.md',...headers]){const text=read(n);a.ok(text.includes(filename),n);a.doesNotMatch(text.slice(0,text.indexOf('## Preserved')<0?text.length:text.indexOf('## Preserved')),/NOT READY FOR UPLOAD|__BREAKWATER_/);}
  a.equal((start.match(/^\d\. /gm)||[]).length,3);a.ok(start.includes('SAVE GAME FILE'));a.ok(start.includes('before refresh'));a.ok(start.includes('Saltglass 8.8.20.46'));a.ok(start.includes('Do not run SQL'));a.match(start,/no replay is required/i);
});

test('final inventory, metadata and three identical ledgers verify strictly',{skip:preseal},()=>{
  a.match(python("import pathlib,sys;sys.path.insert(0,sys.argv[1]);from VERIFY_PACKAGE import verify_full;r=pathlib.Path(sys.argv[1]);d={p.name:p.read_bytes() for p in r.iterdir() if p.is_file()};verify_full(d);print('PASS strict full release')"),/PASS/);
  const m=json('DEPLOYMENT_MANIFEST.json'),player=bytes('stormwake_player.html'),asset=m.lazy_program_assets['stormwake_player.html'];a.equal(asset.sha256,sha(player));a.equal(asset.bytes,player.length);a.deepEqual(json('RELEASE_INVENTORY.json').files,currentFiles());
});

console.log(preseal?'Scope: source/compiled preseal checks only; evidence and final ledger checks skipped.':'Scope: final release source/evidence/hash preservation; no browser or device-performance claim.');
