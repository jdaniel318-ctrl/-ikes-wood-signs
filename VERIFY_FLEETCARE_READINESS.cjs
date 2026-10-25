#!/usr/bin/env node
'use strict';
// Actual production source reader/model checks with file-backed, offline transport.
// Usage: node VERIFY_FLEETCARE_READINESS.cjs [RELEASE_DIR] [OUTPUT_DIR]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||__dirname);
const out=path.resolve(process.argv[3]||path.join(root,'../fleetcare-readiness-evidence'));
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const block=source.match(/  const KEELGUARD_MODELS=[\s\S]*?(?=  function keelGuardModelFailure)/)?.[0];
assert.ok(block,'Production KeelGuard source is required.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'DEPLOYMENT_MANIFEST.json'),'utf8'));
const names=['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];
const bytes=Object.fromEntries(['DEPLOYMENT_MANIFEST.json','owner.html',...names].map(n=>[n,fs.readFileSync(path.join(root,n),'utf8')]));
const results=[];
fs.mkdirSync(out,{recursive:true});

function fixture(overrides={}){
  const files={...bytes,...overrides},calls=[];
  const context={BUILD_VERSION:manifest.build,window:{__darkSkyExpectedRelease:{seal:manifest.release_seal}},crypto:crypto.webcrypto,TextEncoder,AbortController,setTimeout,clearTimeout,
    fetch:async(url,options)=>{
      const name=url.split('?')[0];calls.push({name,cache:options.cache,signal:options.signal});
      if(files[name] instanceof Error)throw files[name];
      const body=files[name];return {ok:typeof body==='string',status:typeof body==='string'?200:404,text:async()=>body};
    }};
  vm.createContext(context);
  // The baseline fallback exercises its real uncached reader, so the regression
  // fails on duplicate requests rather than a missing test-only export.
  vm.runInContext(block+'\nthis.readSource=typeof keelGuardSourceReader===\'function\'?keelGuardSourceReader:()=>keelGuardFetchText;this.loadModels=keelGuardLoadModels;',context);
  return {files,calls,reader:()=>context.readSource(),load:read=>context.loadModels(read)};
}
async function check(name,fn){const row={name,pass:false};try{await fn();row.pass=true;}catch(e){row.error=e.stack||String(e);}results.push(row);console.log(JSON.stringify({name,pass:row.pass,...(row.error?{error:row.error.split('\n')[0]}:{})}));}
function rejectModels(bundle,pattern){for(const name of names){assert.equal(bundle.models[name],null);assert.equal(bundle.evidence[name].ok,false);assert.match(bundle.evidence[name].reasons.join(' '),pattern);}}

(async()=>{
  await check('same-run concurrent and later consumers share one owner body',async()=>{
    const f=fixture(),read=f.reader();
    const values=await Promise.all([read('owner.html'),read('owner.html'),read('owner.html')]);
    f.files['owner.html']='different bytes after first observation';
    assert.equal(await read('owner.html'),bytes['owner.html']);
    assert.deepEqual(values,[bytes['owner.html'],bytes['owner.html'],bytes['owner.html']]);
    assert.equal(f.calls.filter(c=>c.name==='owner.html').length,1,'one static source observation per run');
    assert.equal(f.calls[0].cache,'no-store');assert.ok(f.calls[0].signal instanceof AbortSignal);
  });
  await check('model verification and identity consumer share one manifest observation',async()=>{
    const f=fixture(),read=f.reader();const [bundle,body]=await Promise.all([f.load(read),read('DEPLOYMENT_MANIFEST.json')]);
    for(const name of names)assert.equal(bundle.evidence[name].ok,true,bundle.evidence[name].reasons.join(' '));
    assert.equal(JSON.parse(body).build,manifest.build);
    assert.equal(f.calls.filter(c=>c.name==='DEPLOYMENT_MANIFEST.json').length,1);
    for(const name of names)assert.equal(f.calls.filter(c=>c.name===name).length,1);
  });
  await check('new run reads fresh owner bytes and retains no prior success',async()=>{
    const f=fixture();assert.equal(await f.reader()('owner.html'),bytes['owner.html']);
    f.files['owner.html']='second-run source';assert.equal(await f.reader()('owner.html'),'second-run source');
    assert.equal(f.calls.filter(c=>c.name==='owner.html').length,2);
  });
  await check('missing source failure is shared within a run and next run can recover',async()=>{
    const f=fixture({'owner.html':undefined}),read=f.reader();
    const first=await Promise.allSettled([read('owner.html'),read('owner.html')]);
    assert.ok(first.every(x=>x.status==='rejected'&&/HTTP 404/.test(x.reason.message)));
    f.files['owner.html']=bytes['owner.html'];await assert.rejects(read('owner.html'),/HTTP 404/);
    assert.equal(f.calls.length,1);assert.equal(await f.reader()('owner.html'),bytes['owner.html']);assert.equal(f.calls.length,2);
  });
  await check('transport rejection stays a failure without retry or prior-body fallback',async()=>{
    const f=fixture(),first=f.reader();await first('owner.html');
    f.files['owner.html']=new Error('isolated unavailable transport');const second=f.reader();
    await assert.rejects(second('owner.html'),/unavailable transport/);
    await assert.rejects(second('owner.html'),/unavailable transport/);
    assert.equal(f.calls.length,2);
  });
  await check('a new run rejects changed manifest seal even after a successful run',async()=>{
    const f=fixture();const good=await f.load(f.reader());assert.ok(names.every(n=>good.evidence[n].ok));
    f.files['DEPLOYMENT_MANIFEST.json']=JSON.stringify({...manifest,release_seal:'wrong-seal'});
    rejectModels(await f.load(f.reader()),/build or seal does not match/);
    assert.equal(f.calls.filter(c=>c.name==='DEPLOYMENT_MANIFEST.json').length,2);
  });
  await check('a new run rejects a stale manifest build after a successful run',async()=>{
    const f=fixture();await f.load(f.reader());
    f.files['DEPLOYMENT_MANIFEST.json']=JSON.stringify({...manifest,build:'stale-build'});
    rejectModels(await f.load(f.reader()),/build or seal does not match/);
  });
  await check('a new run rejects malformed manifest and does not use prior model success',async()=>{
    const f=fixture();await f.load(f.reader());f.files['DEPLOYMENT_MANIFEST.json']='{invalid';
    const bad=await f.load(f.reader());for(const name of names){assert.equal(bad.models[name],null);assert.equal(bad.evidence[name].ok,false);}
  });
  await check('changed model bytes remain rejected after same-run source sharing',async()=>{
    const name=names[0],f=fixture({[names[0]]:bytes[names[0]]+'\n'});const bundle=await f.load(f.reader());
    assert.equal(bundle.models[name],null);assert.equal(bundle.evidence[name].ok,false);assert.match(bundle.evidence[name].reasons.join(' '),/checksum mismatch/);
    for(const other of names.slice(1))assert.equal(bundle.evidence[other].ok,true);
  });
  await check('a matching checksum cannot make malformed model JSON valid on the next run',async()=>{
    const f=fixture(),name=names[0];await f.load(f.reader());
    const body='{incomplete',changed=structuredClone(manifest);
    changed.model_integrity.files[name].sha256=crypto.createHash('sha256').update(body).digest('hex');
    f.files[name]=body;f.files['DEPLOYMENT_MANIFEST.json']=JSON.stringify(changed);
    const bundle=await f.load(f.reader());assert.equal(bundle.models[name],null);assert.equal(bundle.evidence[name].ok,false);
    for(const other of names.slice(1))assert.equal(bundle.evidence[other].ok,true);
  });
  await check('a matching recomputed checksum cannot admit a stale model build on the next run',async()=>{
    const f=fixture(),name=names[0];await f.load(f.reader());
    const body=JSON.stringify({...JSON.parse(bytes[name]),build:'stale-build'}),changed=structuredClone(manifest);
    changed.model_integrity.files[name].sha256=crypto.createHash('sha256').update(body).digest('hex');
    f.files[name]=body;f.files['DEPLOYMENT_MANIFEST.json']=JSON.stringify(changed);
    const bundle=await f.load(f.reader());assert.equal(bundle.models[name],null);assert.equal(bundle.evidence[name].ok,false);assert.match(bundle.evidence[name].reasons.join(' '),/Build mismatch/);
    for(const other of names.slice(1))assert.equal(bundle.evidence[other].ok,true);
  });
  const report={scope:'Actual KeelGuard functions with isolated file-backed transport; no live authority, browser timing or operational queries',passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results};
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
