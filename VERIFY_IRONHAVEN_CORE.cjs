#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');const {webcrypto}=require('node:crypto');
const path=require('node:path');const root=process.argv[2]||__dirname;
const api=require(path.join(root,'fleet_recovery_core.js'));
let passes=0;
async function check(label,fn){try{await fn();passes++;console.log('PASS',label)}catch(e){console.error('FAIL',label,e.stack);process.exitCode=1;}}
function sample(scope='voyagekeeper-recovery-test'){
 const vesselId='11111111-1111-4111-8111-111111111111';
 const orders={project_id:scope,records:[{id:'TEST-1',status:'Ready',payload:{name:'Sensitive customer',notes:'Handle privately'}}]};
 const watch={project_id:scope,has_report:true,report_id:'R-1',current_work:'Test-only work',reported_at:'2026-10-25T22:00:00Z'};
 return api.snapshotFor({projectId:scope,vesselId,vesselName:'VoyageKeeper Recovery Test',orders,watch,at:'2026-10-26T01:25:00Z'});
}
const pass='Long unique recovery passphrase #2026';
(async()=>{
 let doc;
 await check('exact vessel snapshot with no foreign data',()=>{const s=sample();const sum=api.projectScoped(s,'voyagekeeper-recovery-test');assert.equal(sum.order_count,1);assert.equal(sum.watch_report_present,true)});
 await check('encrypt with real WebCrypto + stable metadata',async()=>{doc=await api.encrypt(sample(),pass,webcrypto);assert.match(doc.filename,/blackflag-voyagekeeper-recovery-test-recovery/);const raw=JSON.parse(doc.text);assert.equal(raw.cipher,'AES-256-GCM');assert.equal(raw.iterations,310000);assert.equal(raw.project_id,'voyagekeeper-recovery-test')});
 await check('encrypted export has no private plaintext',()=>{for(const value of ['Sensitive customer','TEST-1','Test-only work','Long unique recovery'])assert(!doc.text.includes(value));});
 await check('same vessel decrypts exactly',async()=>{const v=await api.verify(doc.text,pass,'voyagekeeper-recovery-test',webcrypto);assert.equal(v.verified,true);assert.equal(v.order_count,1);assert.equal(v.mode,'READ-ONLY — NO RESTORE PERFORMED')});
 await check('wrong vessel rejected before decrypt',async()=>await assert.rejects(api.verify(doc.text,pass,'ikes-wood-signs',webcrypto),/different vessel/));
 await check('wrong passphrase does not disclose records',async()=>await assert.rejects(api.verify(doc.text,'another very long passphrase','voyagekeeper-recovery-test',webcrypto),/could not be verified/));
 await check('ciphertext tamper rejected',async()=>{const x=JSON.parse(doc.text);x.ciphertext=x.ciphertext.slice(0,16)+'A'+x.ciphertext.slice(17);await assert.rejects(api.verify(JSON.stringify(x),pass,'voyagekeeper-recovery-test',webcrypto),/checksum|verified/)});
 await check('header date tamper rejected by authenticated data',async()=>{const x=JSON.parse(doc.text);x.created_at='2026-10-25T00:00:00Z';await assert.rejects(api.verify(JSON.stringify(x),pass,'voyagekeeper-recovery-test',webcrypto),/could not be verified/)});
 await check('weakening KDF iterations fails closed',async()=>{const x=JSON.parse(doc.text);x.iterations=1000;await assert.rejects(api.verify(JSON.stringify(x),pass,'voyagekeeper-recovery-test',webcrypto),/Unsupported/)});
 await check('fresh encryption uses different nonce/ciphertext',async()=>{const other=await api.encrypt(sample(),pass,webcrypto);assert.notEqual(JSON.parse(other.text).iv,JSON.parse(doc.text).iv);assert.notEqual(JSON.parse(other.text).ciphertext,JSON.parse(doc.text).ciphertext)});
 await check('foreign order payload refused before encryption',()=>{let s=sample();s.records.orders[0].payload.project_id='ikes-wood-signs';assert.throws(()=>api.projectScoped(s),/Foreign/)});
 await check('mismatched server watch refused before export',()=>{assert.throws(()=>api.snapshotFor({projectId:'voyagekeeper-recovery-test',vesselId:'11111111-1111-4111-8111-111111111111',vesselName:'VoyageKeeper',orders:{project_id:'voyagekeeper-recovery-test',records:[]},watch:{project_id:'ikes-wood-signs',has_report:false}}),/Watch readback/)});
 await check('duplicate order IDs refused',()=>{const s=sample();s.records.orders.push({...s.records.orders[0]});assert.throws(()=>api.projectScoped(s),/Duplicate/)});
 await check('missing vessel ID refused',()=>{const s=sample();delete s.vessel_id;assert.throws(()=>api.projectScoped(s),/identifier/)});
 await check('recovery passphrase short refused',()=>assert.throws(()=>api.validatePassphrase('short'),/14/));
 await check('bad JSON refused',async()=>await assert.rejects(api.verify('bad json',pass,'voyagekeeper-recovery-test',webcrypto),/JSON/));
 await check('oversize import refused',async()=>await assert.rejects(api.verify('x'.repeat(10_000_000),pass,'voyagekeeper-recovery-test',webcrypto),/too large/));
 await check('empty Watch report supported',async()=>{const s=sample();s.records.watch={project_id:'voyagekeeper-recovery-test',has_report:false};const d=await api.encrypt(s,pass,webcrypto);const v=await api.verify(d.text,pass,s.project_id,webcrypto);assert.equal(v.watch_report_present,false)});
 console.log('IRONHAVEN CORE:',passes,'checks;',process.exitCode===1?'FAIL':'PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
