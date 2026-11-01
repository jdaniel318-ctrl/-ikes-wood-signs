'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require(process.env.COUNTERCRAFT_PGLITE||'@electric-sql/pglite');
const scope={projectId:'ikes-wood-signs',backend:'https://sjgqqtnuttnkwsoebbqf.supabase.co',environment:'staging',site:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',deploymentId:'countercraft-pilot-1',mode:'sea_trial'};
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',SID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',VID='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
async function setup(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema fleet_private;create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);create table public.fleet_vessels(id uuid primary key,project_id text,lifecycle_state text);create table public.fleet_memberships(user_id uuid,vessel_id uuid,role text,active boolean,revoked_at timestamptz);insert into auth.sessions values('${SID}','${A}',null);insert into public.fleet_vessels values('${VID}','ikes-wood-signs','staging');insert into public.fleet_memberships values('${A}','${VID}','project_owner',true,null);`);const sql=__dirname+'/COUNTERCRAFT_INTAKE.sql';if(fs.existsSync(sql))await db.exec(fs.readFileSync(sql,'utf8'));await db.exec('set role service_role');return db;}
const owner={userId:A,sessionId:SID,expiresAt:new Date(Date.now()+3600000).toISOString()};
async function rpc(db,action,input={},s=scope){return (await db.query('select public.countercraft_gateway($1,$2,$3) as result',[action,s,input])).rows[0].result;}
async function main(){const db=await setup();let publication,session,job;try{
publication=await rpc(db,'publish',{...owner,expectedVersion:0,settings:{stocks:[],rates:[]},enabled:true});assert.equal(publication.revision,1);
await assert.rejects(rpc(db,'publish',{...owner,expectedVersion:0,settings:{stocks:[],rates:[]},enabled:true}),/version/i);
await assert.rejects(rpc(db,'publish',{...owner,expectedVersion:1,settings:{},enabled:true},{...scope,projectId:'wonderwake'}),/scope/i);
await assert.rejects(rpc(db,'owner-list',{...owner,userId:B}),/owner|session/i);
const d=await rpc(db,'enroll',{...owner,key:{kty:'EC',crv:'P-256',x:'fixture',y:'fixture'},label:'Synthetic iPad'});
const ch=await rpc(db,'challenge',{deviceId:d.id,nonce:'random-nonce'});
session=await rpc(db,'start',{deviceId:d.id,challengeId:ch.id,tokenHash:'a'.repeat(64)});assert(session.id);
await assert.rejects(rpc(db,'start',{deviceId:d.id,challengeId:ch.id,tokenHash:'b'.repeat(64)}),/challenge/i);
const op='cccccccc-cccc-4ccc-8ccc-cccccccccccc',sha='c'.repeat(64);const begin={tokenHash:'a'.repeat(64),operationId:op,digest:sha,publicationRevision:1,snapshot:{schema:'synthetic'},manifest:[{name:'proof.png',mime:'image/png',bytes:3,sha256:'d'.repeat(64)},{name:'photo.jpg',mime:'image/jpeg',bytes:3,sha256:'e'.repeat(64)}]};
await rpc(db,'begin',begin);await assert.rejects(rpc(db,'commit',{...begin,assets:[]}),/asset/i);
job=await rpc(db,'commit',{...begin,assets:[{name:'proof.png',mime:'image/png',bytes:3,sha256:'d'.repeat(64),path:'private/immutable.png'},{name:'photo.jpg',mime:'image/jpeg',bytes:3,sha256:'e'.repeat(64),path:'private/immutable.jpg'}]});assert.equal(job.receipt.digest,sha);
assert.equal((await rpc(db,'commit',{...begin,assets:[]})).receipt.jobId,job.receipt.jobId);
assert.equal((await rpc(db,'result',{tokenHash:'a'.repeat(64),operationId:op})).receipt.jobId,job.receipt.jobId);
await assert.rejects(rpc(db,'begin',{...begin,digest:'e'.repeat(64)}),/conflict/i);
assert.equal((await rpc(db,'owner-list',owner)).jobs.length,1);
await assert.rejects(rpc(db,'owner-job',{...owner,userId:B,jobId:job.receipt.jobId}),/owner|session/i);
await assert.rejects(rpc(db,'owner-command',{...owner,jobId:job.receipt.jobId,expectedVersion:0,operationId:crypto.randomUUID(),digest:'f'.repeat(64),status:'needs-details',reason:'Need width'}),/version/i);
const cmd={...owner,jobId:job.receipt.jobId,expectedVersion:1,operationId:crypto.randomUUID(),digest:'f'.repeat(64),status:'needs-details',reason:'Need width'};
const changed=await rpc(db,'owner-command',cmd);assert.equal(changed.job.version,2);assert.equal((await rpc(db,'owner-command',cmd)).job.version,2);
await assert.rejects(rpc(db,'owner-command',{...cmd,operationId:crypto.randomUUID(),expectedVersion:2,status:'in-production'}),/transition/i);
await db.exec('reset role');await db.query('update public.fleet_memberships set revoked_at=now()');await db.exec('set role service_role');await assert.rejects(rpc(db,'owner-list',owner),/owner/i);
await db.exec('reset role');await db.query('update public.fleet_memberships set revoked_at=null');await db.exec('set role service_role');await rpc(db,'revoke-device',{...owner,deviceId:d.id});await assert.rejects(rpc(db,'begin',{...begin,operationId:crypto.randomUUID()}),/device|session/i);
await db.exec('reset role;set role anon');await assert.rejects(rpc(db,'owner-list',owner),/permission/i);await assert.rejects(db.query('select * from fleet_private.cc_jobs'),/permission/i);
console.log('PASS real PostgreSQL: exact scope/current owner, enrollment, one-use challenge, complete assets, idempotence, CAS, revocation and grants');
}finally{await db.close();}}
module.exports={setup,rpc,scope,owner};if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
