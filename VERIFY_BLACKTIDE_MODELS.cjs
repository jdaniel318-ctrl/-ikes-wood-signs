/* Real KeelGuard model-loading regression, offline only. Usage: node VERIFY_BLACKTIDE_MODELS.cjs [release-dir] [--baseline baseline-dir]
 * Uses the exact production functions from app.js, with file-backed fetch and WebCrypto.
 * No authority, live database, storage recovery or native-device evidence is produced.
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'.');
const baselineIndex=process.argv.indexOf('--baseline');
const baseline=baselineIndex<0?null:path.resolve(process.argv[baselineIndex+1]);
const names=['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];
const bytes=Object.fromEntries(['app.js','index.html','DEPLOYMENT_MANIFEST.json',...names].map(n=>[n,fs.readFileSync(path.join(root,n),'utf8')]));
const build=bytes['app.js'].match(/const\s+BUILD_VERSION\s*=\s*['"]([^'"]+)['"]/)[1];
const seal=bytes['index.html'].match(/DARK_SKY_RELEASE\s*=\s*Object\.freeze\(\{build:'[^']+',seal:'([^']+)'/)[1];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
async function load(overrides={}){
  const files={...bytes,...overrides};
  const source=bytes['app.js'].match(/  const KEELGUARD_MODELS=[\s\S]*?(?=  function keelGuardModelFailure)/)?.[0];
  assert.ok(source,'production model guard block exists');
  const context={BUILD_VERSION:build,window:{__darkSkyExpectedRelease:{seal}},crypto:crypto.webcrypto,TextEncoder,AbortController,setTimeout,clearTimeout,
    fetch:async url=>{const n=url.split('?')[0];return {ok:typeof files[n]==='string',status:typeof files[n]==='string'?200:404,text:async()=>files[n]};}};
  vm.createContext(context);vm.runInContext(source+'\nthis.loadModels=keelGuardLoadModels;',context);
  return context.loadModels();
}
function manifestWith(edit){const m=JSON.parse(bytes['DEPLOYMENT_MANIFEST.json']);for(const n of names)m.model_integrity.files[n].build=build;edit(m);return {'DEPLOYMENT_MANIFEST.json':JSON.stringify(m)};}
function rejected(bundle,name,pattern){assert.equal(bundle.models[name],null,name);assert.equal(bundle.evidence[name].ok,false,name);assert.match(bundle.evidence[name].reasons.join(' '),pattern,name);}
test('production KeelGuard accepts every shipped current-build model',async()=>{
  const b=await load();for(const n of names){assert.equal(b.evidence[n].ok,true,`${n}: ${b.evidence[n].reasons.join(' ')}`);assert.equal(b.models[n].build,build);}
});
test('production KeelGuard rejects stale declaration even when body SHA matches',async()=>{
  for(const n of names){const overrides=manifestWith(m=>{m.model_integrity.files[n].build='stale-build';assert.equal(m.model_integrity.files[n].sha256,sha(bytes[n]));});rejected(await load(overrides),n,/Current-build model checksum declaration missing/);}
});
test('production KeelGuard rejects changed bytes',async()=>{for(const n of names)rejected(await load({...manifestWith(()=>{}),[n]:bytes[n]+'\n'}),n,/checksum mismatch/);});
test('production KeelGuard rejects a wrong manifest seal',async()=>{const b=await load(manifestWith(m=>m.release_seal='wrong-seal'));for(const n of names)rejected(b,n,/build or seal does not match/);});
test('production KeelGuard rejects omitted required model declarations',async()=>{for(const n of names)rejected(await load(manifestWith(m=>delete m.model_integrity.files[n])),n,/declaration missing/);});
test('production KeelGuard rejects missing model files',async()=>{for(const n of names)rejected(await load({...manifestWith(()=>{}),[n]:undefined}),n,/HTTP 404/);});
test('production KeelGuard rejects wrong current-model policy',async()=>{for(const n of names)rejected(await load(manifestWith(m=>m.model_integrity.files[n].policy='retained-versioned-reference')),n,/declaration missing/);});
test('production KeelGuard rejects stale model body with matching recomputed SHA',async()=>{
  for(const n of names){const body=JSON.stringify({...JSON.parse(bytes[n]),build:'stale-build'});rejected(await load({...manifestWith(m=>m.model_integrity.files[n].sha256=sha(body)),[n]:body}),n,/Build mismatch/);}
});
test('production KeelGuard preserves semantic authority checks after hashing',async()=>{
  const n='ADMIRAL_ENTITLEMENT_STATE_MODEL.json',model=JSON.parse(bytes[n]);model.admiral_passage.local_self_promotion=true;const body=JSON.stringify(model);
  rejected(await load({...manifestWith(m=>m.model_integrity.files[n].sha256=sha(body)),[n]:body}),n,/Local self-promotion must remain forbidden/);
});
if(baseline)test('retained versioned-reference models are byte-for-byte historical bytes',()=>{
  const m=JSON.parse(bytes['DEPLOYMENT_MANIFEST.json']),old=JSON.parse(fs.readFileSync(path.join(baseline,'DEPLOYMENT_MANIFEST.json'),'utf8'));
  const retained=Object.entries(old.model_integrity.files).filter(([,e])=>e.policy==='retained-versioned-reference');assert.ok(retained.length>0);
  for(const [n,e]of retained){assert.deepEqual(fs.readFileSync(path.join(root,n)),fs.readFileSync(path.join(baseline,n)),n);assert.deepEqual(m.model_integrity.files[n],e,n);}
});
