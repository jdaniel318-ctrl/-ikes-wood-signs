'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const out=path.resolve(process.argv[2]||'../countercraft-evidence');if(out.startsWith(__dirname+path.sep))throw Error('Evidence must be outside source');fs.mkdirSync(out,{recursive:true});
const tests=['CORE','SQL','RECOVERY','FLOW','PRIVACY','OWNER','BOARDS','INTEGRATION'].map(x=>'VERIFY_COUNTERCRAFT_'+x+'.cjs').concat('VERIFY_COUNTERCRAFT_SERVICE.mjs');let failed=0;const results=[];
for(const test of tests){const r=spawnSync(process.execPath,['--input-type=module','-e',`import('./${test}').catch(e=>{console.error(e.message,e.where||'');process.exitCode=1})`],{cwd:__dirname,env:process.env,encoding:'utf8',timeout:120000});const pass=r.status===0;results.push({test,pass,status:r.status});fs.writeFileSync(path.join(out,test+'.log'),(r.stdout||'')+(r.stderr||''));console.log(pass?'PASS':'FAIL',test);if(!pass)failed++;}
fs.writeFileSync(path.join(out,'countercraft-results.json'),JSON.stringify({scope:'synthetic offline PostgreSQL, WebCrypto and production core/service contracts; not native Safari or physical machining',results},null,2));process.exitCode=failed?1:0;
