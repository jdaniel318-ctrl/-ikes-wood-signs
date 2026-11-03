'use strict';const assert=require('node:assert/strict'),{setup,rpc,scope,owner}=require('./VERIFY_COUNTERCRAFT_SQL.cjs');
(async()=>{const db=await setup(process.env.COUNTERCRAFT_BASE_SQL);try{
 await rpc(db,'publish',{...owner,expectedVersion:0,settings:{stocks:[],rates:[]},enabled:true});
 const device=await rpc(db,'enroll',{...owner,key:{kty:'EC',crv:'P-256',x:'fixture',y:'fixture'},label:'Session fixture'});
 const ch=await rpc(db,'challenge',{deviceId:device.id,nonce:'nonce'}),tokenHash='b'.repeat(64);
 let s=await rpc(db,'start',{deviceId:device.id,challengeId:ch.id,tokenHash:'a'.repeat(64)});
 await db.exec('reset role');await db.exec(require('node:fs').readFileSync(__dirname+'/HARBORLIGHT_SESSION_HARDENING.sql','utf8'));await db.exec('set role service_role');await assert.rejects(rpc(db,'context',{tokenHash:'a'.repeat(64)}),/session/i);const nextChallenge=await rpc(db,'challenge',{deviceId:device.id,nonce:'after-upgrade'});s=await rpc(db,'start',{deviceId:device.id,challengeId:nextChallenge.id,tokenHash:'b'.repeat(64)});
 assert(Date.parse(s.expiresAt)-Date.now()<=180500,'Server idle window must be three minutes, not four hours');
 assert.equal(s.sessionPolicy,'idle-v1');assert.equal((await rpc(db,'touch',{tokenHash})).sessionPolicy,'idle-v1');
 await db.exec('reset role');await db.query("update fleet_private.cc_sessions set expires_at=now()-interval '1 second' where id=$1",[s.id]);await db.exec('set role service_role');
 for(const action of ['touch','context','result'])await assert.rejects(rpc(db,action,{tokenHash,operationId:crypto.randomUUID()}),/session|device/i);
 await db.exec('reset role');await db.query("update fleet_private.cc_sessions set expires_at=now()+interval '3 minutes',created_at=now()-interval '5 hours' where id=$1",[s.id]);await db.exec('set role service_role');await assert.rejects(rpc(db,'touch',{tokenHash}),/session/i);
 console.log('PASS upgrade preserves enrollment and ends old sessions; server idle deadline, activity renewal, expiry cannot revive, absolute session limit');
 }finally{await db.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
