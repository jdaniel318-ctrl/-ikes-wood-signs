/* Strongbox: synthetic legacy archive fidelity tests; no network or production database. */
'use strict';
const {test}=require('node:test'), a=require('node:assert/strict'), path=require('node:path');
const H=require(path.resolve(process.argv[2]||__dirname,'headway_contracts.js'));
const pid='ikes-wood-signs', photo='data:image/png;base64,c291cmNl', preview='data:image/png;base64,cHJldmlldw==';
function row(id='TEST-1'){return {id,projectId:pid,namespace:'bf.project.'+pid,price:65,wording:'  Smoke  Hole!  ',photoData:photo,approvedPreviewData:preview};}
const round=b=>JSON.parse(JSON.stringify(b));
async function seal(b){const c={...b};delete c.integrityHash;c.integrityHash=await H.sha256(H.canonical(c));return c;}
for(const [name,value]of [['NaN',NaN],['Infinity',Infinity],['-Infinity',-Infinity],['-0',-0],['undefined',undefined]]) {
 test('legacy '+name+' survives nested/array JSON download and isolated decode',async()=>{
  const r=row();r.legacy={value,array:[1,value,null]};const before=structuredClone(r);const b=await H.backup(pid,[r]);
  a.equal(b.schema,'strongbox-business-backup-v2');const parsed=round(b),proof=await H.rehearse(parsed,pid);
  a.equal(proof.records,1);a.equal(proof.sourcePhotos,1);a.equal(proof.approvedPreviews,1);a.ok(proof.specialValues.length>=2);
  const recovered=await H.readBackupRows(parsed,pid);a.deepEqual(recovered,[before]);a.deepEqual(r,before);a.equal(recovered[0].wording,r.wording);a.equal(recovered[0].photoData,photo);
 });
}
test('26 row export includes completed work and every preserved media reference',async()=>{
 const rows=Array.from({length:26},(_,i)=>({...row('TEST-'+i),status:i===25?'Picked Up':'New'}));rows[17].old={ratio:NaN,more:[Infinity,-Infinity]};
 const before=structuredClone(rows),b=round(await H.backup(pid,rows)),p=await H.rehearse(b,pid);a.equal(p.records,26);a.equal(p.sourcePhotos,26);a.equal(p.approvedPreviews,26);a.equal(p.specialValues.length,3);a.ok(p.specialValues.some(x=>x.path==='/rows/17/old/ratio'));
 a.deepEqual(await H.readBackupRows(b,pid),before);a.deepEqual(rows,before);
});
test('ordinary finite backup remains v1 and readable by the existing interface',async()=>{
 const r=row(),b=round(await H.backup(pid,[r]));a.equal(b.schema,'headway-business-backup-v1');a.equal(b.rows[0].photoData,photo);a.equal((await H.rehearse(b,pid)).ok,true);
});
test('pre-repair v1 JSON backup can still be rehearsed and decoded',async()=>{
 const b=await seal({schema:'headway-business-backup-v1',projectId:pid,createdAt:'2026-10-18T00:00:00Z',rows:[row()],count:1,includes:'legacy v1'});
 a.equal((await H.rehearse(round(b),pid)).records,1);a.deepEqual(await H.readBackupRows(round(b),pid),[row()]);
});
test('empty exact-business backup is explicit, not fabricated',async()=>{const b=await H.backup(pid,[]);a.equal((await H.rehearse(round(b),pid)).records,0);a.deepEqual(await H.readBackupRows(round(b),pid),[]);});
test('literal marker-like objects and escaped paths cannot masquerade as encoded data',async()=>{
 const r=row();r.marker={type:'NaN',tag:'special',value:'Infinity',nested:['special','NaN']};r['a/b~c']={value:NaN};
 const b=round(await H.backup(pid,[r]));a.ok(b.specialValues.some(x=>x.path==='/rows/0/a~1b~0c/value'));a.deepEqual(await H.readBackupRows(b,pid),[r]);
});
test('sparse array, undefined property and null stay distinct',async()=>{
 const r=row();r.a=new Array(4);r.a[1]=undefined;r.a[2]=null;r.present=undefined;
 const b=round(await H.backup(pid,[r])),v=(await H.readBackupRows(b,pid))[0];a.equal(0 in v.a,false);a.equal(1 in v.a,true);a.equal(v.a[1],undefined);a.equal(v.a[2],null);a.equal(3 in v.a,false);a.equal(Object.hasOwn(v,'present'),true);a.deepEqual(v,r);
});
test('null-prototype objects round trip without prototype pollution',async()=>{const r=row();r.x=Object.assign(Object.create(null),{n:NaN});const b=round(await H.backup(pid,[r]));a.deepEqual((await H.readBackupRows(b,pid))[0],r);a.equal({}.polluted,undefined);});
for(const v of [NaN,Infinity,-Infinity])test('new-job canonicalization still rejects '+String(v),()=>a.throws(()=>H.canonical({price:v}),/nonfinite-data/));
for(const fixture of [()=>new Date(),()=>new Map([['x',1]]),()=>new Set([1]),()=>BigInt(3),()=>new Uint8Array([1,2]),()=>/x/])test('unsupported archival type fails explicitly: '+String(fixture()),async()=>{
 const r=row();r.unsupported=fixture();await a.rejects(()=>H.backup(pid,[r]),/unsupported-backup.*\/rows\/0\/unsupported/);
});
test('getter is rejected without evaluation or original mutation',async()=>{let calls=0;const r=row();Object.defineProperty(r,'unsafe',{enumerable:true,get(){calls++;return 1;}});await a.rejects(()=>H.backup(pid,[r]),/unsupported-backup/);a.equal(calls,0);});
test('cyclic data is rejected with explicit path rather than recursion crash',async()=>{const r=row();r.loop=r;await a.rejects(()=>H.backup(pid,[r]),/cyclic-backup.*\/rows\/0\/loop/);});
test('too deep or symbolic fields are rejected explicitly',async()=>{const r=row();r[Symbol('lost')]=1;await a.rejects(()=>H.backup(pid,[r]),/unsupported-backup/);const s=row();let p=s;for(let i=0;i<110;i++)p=p.deep={};await a.rejects(()=>H.backup(pid,[s]),/backup-depth/);});
for(const [name,fn]of Object.entries({foreign:r=>{r.projectId='househull'},namespace:r=>{r.namespace='bf.project.househull'},isolation:r=>{r.isolation={projectId:'househull'}},missingId:r=>{delete r.id}}))test('scope rejection '+name,async()=>{const r=row();fn(r);r.value=NaN;await a.rejects(()=>H.backup(pid,[r]),/backup-scope/);});
test('duplicate IDs cannot be silently merged',async()=>{const r=row();r.value=NaN;await a.rejects(()=>H.backup(pid,[r,r]),/backup-scope-or-duplicate/);});
test('wrong vessel import and damaged media are rejected, originals unchanged',async()=>{const r=row();r.n=NaN;const before=structuredClone(r),b=round(await H.backup(pid,[r]));await a.rejects(()=>H.rehearse(b,'househull'),/backup-identity/);b.rows[0]=['string','damaged'];await a.rejects(()=>H.rehearse(b,pid),/backup-integrity/);a.deepEqual(r,before);});
test('rewritten exception manifest fails even with recomputed checksum',async()=>{const r=row();r.n=NaN;const b=round(await H.backup(pid,[r]));b.specialValues=[];await a.rejects(async()=>H.rehearse(await seal(b),pid),/backup-special-manifest/);});
test('malformed v2 tags and duplicate object keys cannot decode',async()=>{const r=row();r.n=NaN;const b=round(await H.backup(pid,[r]));b.rows[0]=['evil','payload'];await a.rejects(async()=>H.rehearse(await seal(b),pid),/backup-wire/);const c=round(await H.backup(pid,[r]));c.rows[0][1].push(c.rows[0][1][0]);await a.rejects(async()=>H.rehearse(await seal(c),pid),/backup-wire/);});
test('hostile object keys rejected at export and decoded import',async()=>{const r=JSON.parse('{"projectId":"ikes-wood-signs","id":"X","__proto__":{"polluted":true}}');await a.rejects(()=>H.backup(pid,[r]),/unsafe-object-key/);const s=row();s.n=NaN;const b=round(await H.backup(pid,[s]));b.rows[0][1].push(['__proto__',['null']]);await a.rejects(async()=>H.rehearse(await seal(b),pid),/unsafe-object-key/);a.equal({}.polluted,undefined);});
test('multiple ordinary vessels can back up only their own rows',async()=>{for(const id of ['househull','beccas-bloom-shop','legacy-plumbing']){const r={...row(),projectId:id,namespace:'bf.project.'+id,n:NaN};const b=round(await H.backup(id,[r]));a.equal((await H.rehearse(b,id)).records,1);a.deepEqual(await H.readBackupRows(b,id),[r]);}});
test('supported deep legacy record does not exceed its own wire validation budget',async()=>{const r=row();let o=r;for(let i=0;i<60;i++)o=o.nested={};o.value=NaN;const b=round(await H.backup(pid,[r]));a.deepEqual(await H.readBackupRows(b,pid),[r]);});
test('raw special JS values in imported JSON envelope are rejected',async()=>{const b=await H.backup(pid,[row()]);b.extra=NaN;await a.rejects(()=>H.rehearse(b,pid),/backup-wire-not-json/);});
