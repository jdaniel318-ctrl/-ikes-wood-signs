#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||__dirname),json=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8')),text=n=>fs.readFileSync(path.join(root,n),'utf8'),sha=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
let passed=0,failed=0;function check(n,f){try{f();passed++;console.log('PASS',n);}catch(e){failed++;console.error('FAIL',n,e.message);}}
const manifest=json('DEPLOYMENT_MANIFEST.json'),seal=json('RELEASE_SEAL.json'),inventory=json('RELEASE_INVENTORY.json'),index=text('index.html'),owner=text('owner.html');
check('release manifest identity',()=>{assert.equal(manifest.build,'8.8.20.67');assert.equal(manifest.release_name,'Cleardeck');assert.equal(manifest.release_seal,'cleardeck-882067');});
check('seal and inventory agree',()=>{assert.equal(seal.build,manifest.build);assert.equal(seal.seal,manifest.release_seal);assert.equal(inventory.build,manifest.build);assert.equal(inventory.seal,manifest.release_seal);});
check('loader app and worker identity',()=>{assert(index.includes("build:'8.8.20.67',seal:'cleardeck-882067'"));assert(/const BUILD_VERSION=['"]8\.8\.20\.67/.test(text('app.js')));assert(text('sw.js').includes('cleardeck-882067'));});
check('installed web app starts current build',()=>{const m=json('manifest.webmanifest'),u=new URL(m.start_url,'https://example.invalid/');assert.equal(m.version,manifest.build);assert.equal(u.searchParams.get('_darkSkyRelease'),manifest.build);assert.equal(u.searchParams.get('_darkSkySeal'),manifest.release_seal);});
check('all runtime hashes',()=>{for(const [f,h]of Object.entries(manifest.runtime_integrity.files))assert.equal(sha(f),h,f);});
check('current model build declarations agree',()=>{for(const [f,v]of Object.entries(manifest.model_integrity.files))if(v.policy==='current-runtime-build'){assert.equal(v.build,manifest.build,f);assert.equal(json(f).build,manifest.build,f);}});
check('all model hashes',()=>{for(const [f,v]of Object.entries(manifest.model_integrity.files))assert.equal(sha(f),v.sha256,f);});
check('every required dependency exists',()=>{for(const f of manifest.required_runtime_files)assert(fs.existsSync(path.join(root,f)),f);});
check('complete source inventory',()=>{function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.git').flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(root,path.join(dir,e.name)).replaceAll(path.sep,'/')]);}const actual=walk(root).sort();assert.equal(actual.length,inventory.file_count);assert.deepEqual(actual,inventory.files);});
check('all root JavaScript parses',()=>{for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.js')))new vm.Script(text(f),{filename:f});});
check('inline HTML scripts parse',()=>{for(const file of ['owner.html','index.html'])for(const m of text(file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc=|type=["']application\/json/.test(m[1]))new vm.Script(m[2],{filename:file});});
check('new current documents agree',()=>{for(const f of ['CURRENT_ARCHITECTURE.md','UPLOAD_THIS_ONE_BUILD.md','CURRENT_BASELINE.json','CLEARDECK_GUIDE.md'])assert(text(f).includes(manifest.build),f);});
check('no database or authority changes declared',()=>{assert.equal(json('PATCH_CONTRACT.json').database_actions,'none');assert.equal(manifest.cleardeck_upgrade.authority_changes,false);assert.equal(manifest.cleardeck_upgrade.storage_changes,false);});
check('rollback software only',()=>{assert(text('CLEARDECK_GUIDE.md').includes('Do not restore old business data'));});
check('no misleading passkey claim',()=>{assert.equal(manifest.cleardeck_upgrade.passkeys_implemented,false);assert(!owner.includes('Sign in with Face ID'));});
check('existing exact vessel recovery checks preserved',()=>{const a=owner.slice(owner.indexOf('  function bindRecovery(){'),owner.indexOf('  function bindIdentityActions(){'));assert(a.match(/rpc\('vessel_captain_verify_access'/g).length>=3);assert(a.includes('core.encrypt'));});
check('manual check-only workflow template',()=>{const s=text('CLEARDECK_CHECK_ONLY.workflow.yml');assert(s.includes('workflow_dispatch'));assert(s.includes('contents: read'));assert(!/git push|contents: write|deploy-pages|supabase|secrets\./i.test(s));});
check('historical deletion workflow bytes unchanged',()=>{assert.equal(sha('.github/workflows/drydock-batch1.yml'),'313b3248c63cd50db34ffef8727a8ddead86a003b1fe0e8b50b51871c6e55346');});
console.log(`CLEARDECK RELEASE: ${passed} passed; ${failed} failed`);process.exitCode=failed?1:0;
