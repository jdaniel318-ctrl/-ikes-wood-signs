#!/usr/bin/env node
'use strict';
// Built-in Node only. Evidence goes OUTSIDE the release; no network or production writes.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(process.argv[2]||__dirname),out=path.resolve(process.argv[3]||path.join(root,'../release-check-evidence'));
if(out===root||out.startsWith(root+path.sep))throw new Error('Evidence folder must be outside the release.');fs.mkdirSync(out,{recursive:true});
const jobs=[['VERIFY_HOMEPORT_ENTRY.cjs',[root]],['VERIFY_FLEETBOUND_PROGRAMS.cjs',[root]],['VERIFY_HARBOR_ROUTES.cjs',[root]],['VERIFY_HARBOR_ASYNC.cjs',[root]],['VERIFY_HARBOR_STORAGE.cjs',[root]],['VERIFY_RELEASE_IDENTITY.cjs',[root]],['VERIFY_FAIRLEAD_LOADER.cjs',[root]],['VERIFY_FAIRLEAD_STARTUP.cjs',[root]],['VERIFY_CLEARDECK_ACCOUNT.cjs',[root]],['VERIFY_RELEASE_CONTRACT.cjs',[root]],['VERIFY_CLEARDECK_PREFLIGHT.cjs',[root]],['VERIFY_IRONHAVEN_CORE.cjs',[root]],['VERIFY_FLEETCARE_READINESS.cjs',[root,path.join(out,'readiness')]],['VERIFY_FLEETCARE_NAVIGATION.cjs',[root,path.join(out,'navigation')]],['VERIFY_FLEETCRAFT_CORE.cjs',[]],['VERIFY_LETTERCRAFT_FONTS.cjs',[]],['VERIFY_QUARTERMASTER_CORE.cjs',['--pure']],['VERIFY_STORMWAKE_CORE.cjs',[root]]];
let failed=0;const results=[];
for(const [name,args]of jobs){const r=spawnSync(process.execPath,[path.join(root,name),...args],{cwd:root,encoding:'utf8',timeout:120000});fs.writeFileSync(path.join(out,name+'.log'),(r.stdout||'')+(r.stderr||''));const pass=r.status===0;failed+=!pass;results.push({name,pass,exit_code:r.status,error:r.error?.message||null});console.log(pass?'PASS':'FAIL',name);}
const py=process.env.PYTHON||'python3';
for(const name of ['TEST_RELEASE_PIPELINE.py','TEST_RELEASE_IDENTITY.py']){
 const pr=spawnSync(py,['-B',path.join(root,name)],{cwd:root,encoding:'utf8',timeout:120000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 fs.writeFileSync(path.join(out,name+'.log'),(pr.stdout||'')+(pr.stderr||''));
 const pp=pr.status===0;failed+=!pp;results.push({name,pass:pp,exit_code:pr.status,error:pr.error?.message||null});console.log(pp?'PASS':'FAIL',name);
}
fs.writeFileSync(path.join(out,'suite-results.json'),JSON.stringify({scope:'listed offline suites; not live Safari, Auth, email or machining certification',results},null,2)+'\n');process.exitCode=failed?1:0;
