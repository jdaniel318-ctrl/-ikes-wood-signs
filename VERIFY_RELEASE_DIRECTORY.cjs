/* Read-only release preflight. Node.js 18+; never changes files. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'.');
function sha(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
const inventory=path.join(root,'RELEASE_INVENTORY.json');
if(!fs.existsSync(inventory)){console.error('FAIL: RELEASE_INVENTORY.json missing');process.exit(2)}
const d=JSON.parse(fs.readFileSync(inventory,'utf8'));
if(!Array.isArray(d.files)||d.file_count!==d.files.length){console.error('FAIL: inventory list/count mismatch');process.exit(2)}
const missing=[],unsafe=[];for(const f of d.files){const norm=path.normalize(f);const dest=path.resolve(root,norm);if(path.relative(root,dest).startsWith('..')||path.isAbsolute(f)){unsafe.push(f);continue}if(!fs.existsSync(dest))missing.push(f)}
let mismatch=[];const manifest=path.join(root,'DEPLOYMENT_MANIFEST.json');
if(fs.existsSync(manifest)){const m=JSON.parse(fs.readFileSync(manifest));for(const [file,hash] of Object.entries(m.runtime_integrity?.files||{})){const p=path.join(root,file);if(fs.existsSync(p)&&sha(p)!==hash)mismatch.push(file);else if(!fs.existsSync(p)&&!missing.includes(file))missing.push(file)}}
const pass=missing.length===0&&unsafe.length===0&&mismatch.length===0;
const result={pass,inventory_count:d.file_count,files_present:d.files.length-missing.length,missing,unsafe,mismatch,warning:'This verifies local package completeness and declared runtime SHA-256 only. It does not prove deployment, database isolation, account handoff or data restore.'};console.log(JSON.stringify(result,null,2));process.exit(pass?0:1);
