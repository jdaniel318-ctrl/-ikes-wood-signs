/* Bounded history and media parts; no complete shop history in the index. */
(function(g,f){const api=f(typeof module==='object'&&module.exports?require('./countercraft_core.js'):g.CountercraftCore);if(typeof module==='object'&&module.exports)module.exports=api;g.CountercraftBackup=api;})(globalThis,function(C){'use strict';
const LIMIT=6*1048576,FILE_LIMIT=16*1048576,encode=new TextEncoder();
const size=value=>encode.encode(JSON.stringify(value)).length;
const payload=b=>({schema:b.schema,scope:b.scope,counts:b.counts,history:b.history,assets:b.assets,parts:b.parts});
async function pack(source){
 const assets=new Map(),history=[],counts={jobs:0,revisions:0,events:0};let records=[],bytes=2;
 async function flush(){if(records.length){history.push({records,bytes:size(records),sha256:await C.hash(records)});records=[];bytes=2;}}
 async function add(record){const n=size(record)+1;if(n>LIMIT)throw Error('One history record exceeds the supported 6 MiB backup limit. No backup was prepared; ask for an assisted export.');if(bytes+n>LIMIT)await flush();records.push(record);bytes+=n;}
 for(const original of source.jobs){const {revisions,events,...header}=original,job=counts.jobs++;await add({type:'job',job,value:C.clone(header)});
  for(const originalRevision of revisions){const r=C.clone(originalRevision);for(const a of r.assets){assets.set(a.path,{name:a.path,mime:a.mime,bytes:a.bytes,sha256:a.sha256});a.logicalName=a.name;a.name=a.path;}counts.revisions++;await add({type:'revision',job,value:r});}
  for(const e of events){counts.events++;await add({type:'event',job,value:C.clone(e)});}
 }await flush();
 const b={schema:'countercraft-backup-v3',scope:C.clone(source.scope),counts,history:history.map(({bytes,sha256,records})=>({bytes,sha256,records:records.length})),assets:[...assets.values()].sort((a,b)=>a.name.localeCompare(b.name)),parts:[]};let part=[],total=0;
 for(const a of b.assets){if(!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>2*1048576)throw Error('Invalid backup asset size.');if(total+a.bytes>LIMIT){b.parts.push(part);part=[];total=0;}part.push(a.name);total+=a.bytes;}if(part.length)b.parts.push(part);
 b.checksum=await C.hash(payload(b));if(size(b)>FILE_LIMIT)throw Error('Backup manifest exceeds the supported 16 MiB index limit. No backup was prepared; ask for an assisted export.');return {index:b,history};
}
async function index(source){return (await pack(source)).index;}
async function verifyIndex(b,scope){
 if(b.schema!=='countercraft-backup-v3'||!C.sameScope(b.scope,scope)||!b.counts||!Array.isArray(b.history)||!Array.isArray(b.assets)||!Array.isArray(b.parts))throw Error('Backup scope or schema mismatch.');
 if(size(b)>FILE_LIMIT||b.checksum!==await C.hash(payload(b)))throw Error('Backup index checksum or size mismatch.');for(const k of ['jobs','revisions','events'])if(!Number.isSafeInteger(b.counts[k])||b.counts[k]<0)throw Error('Invalid history counts.');
 let records=0;for(const h of b.history){if(!Number.isSafeInteger(h.bytes)||h.bytes<2||h.bytes>LIMIT||!Number.isSafeInteger(h.records)||h.records<1||!/^[a-f0-9]{64}$/.test(h.sha256))throw Error('Invalid history part.');records+=h.records;}if(records!==b.counts.jobs+b.counts.revisions+b.counts.events)throw Error('Missing history index.');
 const assets=new Map();for(const a of b.assets){if(assets.has(a.name)||!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>2*1048576)throw Error('Invalid backup asset index.');assets.set(a.name,a);}
 const named=new Set();for(const p of b.parts){let bytes=0;if(!Array.isArray(p)||!p.length)throw Error('Invalid backup part.');for(const name of p){if(named.has(name)||!assets.has(name))throw Error('Duplicate or unknown backup media.');named.add(name);bytes+=assets.get(name).bytes;}if(bytes>LIMIT)throw Error('Backup part is too large.');}if(named.size!==assets.size)throw Error('Missing backup part.');return assets;
}
async function historyPart(source,b,n){const packed=await pack(source);if(packed.index.checksum!==b.checksum)throw Error('Shop history changed. Prepare a fresh backup index and parts.');if(!Number.isSafeInteger(n)||!packed.history[n])throw Error('Unknown history part.');return {schema:'countercraft-backup-history-v3',backup:b.checksum,part:n,records:packed.history[n].records};}
async function part(b,n,fetchAsset){const assets=await verifyIndex(b,b.scope);if(!Number.isSafeInteger(n)||!b.parts[n])throw Error('Unknown backup part.');const out={schema:'countercraft-backup-part-v3',backup:b.checksum,part:n,assets:[]};for(const name of b.parts[n]){const expected=assets.get(name),a=await fetchAsset(name),bytes=C.bytes64(a.data);if(bytes.length!==expected.bytes||await C.hash(bytes)!==expected.sha256||a.mime!==expected.mime)throw Error('Backup media checksum mismatch.');out.assets.push({...expected,data:a.data});}return out;}
async function rehearseFiles(files,scope){
 const list=Array.from(files),indices=list.filter(f=>/-index\.json$/.test(f.name));if(list.some(f=>f.size>FILE_LIMIT))throw Error('Choose bounded Countercraft backup files (up to 16 MiB each).');if(indices.length!==1)throw Error('Choose one backup index and all history and media parts.');
 const b=JSON.parse(await indices[0].text()),expected=await verifyIndex(b,scope),seen=new Set(),parts=new Set(),history=new Set(),jobs=new Set(),refs=new Set(),counts={jobs:0,revisions:0,events:0};let total=0;
 for(const f of list){if(f===indices[0])continue;const p=JSON.parse(await f.text());if(p.backup!==b.checksum||!Number.isSafeInteger(p.part)||p.part<0)throw Error('Wrong backup part.');
  if(p.schema==='countercraft-backup-history-v3'){
   const h=b.history[p.part];if(!h||history.has(p.part)||!Array.isArray(p.records)||p.records.length!==h.records||size(p.records)!==h.bytes||await C.hash(p.records)!==h.sha256)throw Error('History checksum or part mismatch.');history.add(p.part);
   for(const r of p.records){if(!Number.isSafeInteger(r.job)||r.job<0||r.job>=b.counts.jobs)throw Error('Invalid history job reference.');if(r.type==='job'){if(jobs.has(r.job))throw Error('Duplicate history job.');jobs.add(r.job);counts.jobs++;}else if(r.type==='revision'){counts.revisions++;for(const a of r.value.assets){const x=expected.get(a.name);if(!x||x.sha256!==a.sha256||x.bytes!==a.bytes||x.mime!==a.mime)throw Error('Missing backup media reference.');refs.add(a.name);}}else if(r.type==='event')counts.events++;else throw Error('Invalid history record.');}
  }else if(p.schema==='countercraft-backup-part-v3'){
   if(!b.parts[p.part]||parts.has(p.part)||!Array.isArray(p.assets)||p.assets.length!==b.parts[p.part].length)throw Error('Wrong, repeated or missing backup part.');parts.add(p.part);
   for(const a of p.assets){const x=expected.get(a.name);if(!x||seen.has(a.name)||!b.parts[p.part].includes(a.name))throw Error('Unexpected backup media.');const bytes=C.bytes64(a.data);if(bytes.length!==x.bytes||await C.hash(bytes)!==x.sha256||a.mime!==x.mime)throw Error('Backup checksum mismatch.');seen.add(a.name);total+=bytes.length;}
  }else throw Error('Unknown backup part schema.');
 }
 if(history.size!==b.history.length||parts.size!==b.parts.length||seen.size!==expected.size||refs.size!==expected.size||Object.keys(counts).some(k=>counts[k]!==b.counts[k]))throw Error('Missing backup parts or history.');return {jobs:counts.jobs,assets:seen.size,bytes:total};
}
return Object.freeze({index,verifyIndex,historyPart,part,rehearseFiles,partBytes:LIMIT});});
