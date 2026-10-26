/* Black Flag Recovery Pilot — encrypted, exact-vessel, offline verification.
 * Does not restore a production database or claim a durable cloud backup.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BlackFlagRecovery = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SNAP = 'blackflag-exact-vessel-captain-snapshot-v1';
  const VAULT = 'blackflag-encrypted-captain-snapshot-v1';
  const LIMIT = 6 * 1024 * 1024;
  const ITERATIONS = 310000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', {fatal:true});
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const projectOK = v => typeof v === 'string' && /^[a-z0-9][a-z0-9-]{0,95}$/.test(v);
  const eq = (a,b) => String(a) === String(b);
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function cryptoSource(custom) {
    const c = custom || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
    assert(c && c.subtle && typeof c.getRandomValues === 'function', 'Secure encryption is unavailable on this device. No unencrypted backup was created.');
    return c;
  }
  function canonical(value) {
    if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
    if (isObj(value)) return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    assert(value !== undefined && typeof value !== 'function' && typeof value !== 'symbol', 'Unsupported data in the snapshot.');
    return JSON.stringify(value);
  }
  function b64(bytes) {
    if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
    let binary='';
    for(let i=0;i<bytes.length;i+=32768) binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
    return btoa(binary);
  }
  function unb64(value, maxBytes=LIMIT+4096) {
    assert(typeof value==='string' && value.length>0 && value.length<=Math.ceil(maxBytes/3)*4+8 && /^[A-Za-z0-9+/]+={0,2}$/.test(value), 'Recovery file has invalid or oversized encoded content.');
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value,'base64'));
    const s=atob(value), a=new Uint8Array(s.length);
    for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
    return a;
  }
  function projectScoped(snapshot, expected='') {
    assert(isObj(snapshot)&&snapshot.schema===SNAP, 'This is not a supported Captain recovery snapshot.');
    assert(projectOK(snapshot.project_id), 'Exact vessel identity is missing or invalid.');
    assert(typeof snapshot.vessel_id==='string' && /^[a-f0-9-]{36}$/i.test(snapshot.vessel_id),'Verified vessel identifier is missing.');
    if (expected) assert(eq(snapshot.project_id,expected), 'Recovery file belongs to a different vessel. No restore or import was attempted.');
    assert(typeof snapshot.vessel_name==='string' && snapshot.vessel_name.length>0 && snapshot.vessel_name.length<=256, 'Vessel display name is invalid.');
    assert(Number.isFinite(Date.parse(snapshot.captured_at)) && snapshot.captured_at.length<=40, 'Snapshot time is invalid.');
    assert(snapshot.source==='captain-authenticated-readback', 'Unverified snapshot source.');
    assert(isObj(snapshot.records), 'Snapshot records are missing.');
    assert(Array.isArray(snapshot.records.orders) && snapshot.records.orders.length<=5000, 'Order record count is invalid.');
    const ids=new Set();
    for(const order of snapshot.records.orders) {
      assert(isObj(order) && typeof order.id==='string' && order.id.length>0 && order.id.length<=256, 'Malformed order record.');
      assert(!ids.has(order.id), 'Duplicate order found; recovery snapshot refused.');ids.add(order.id);
      if (order.project_id!=null) assert(eq(order.project_id,snapshot.project_id),'Another vessel was found in this recovery file.');
      if (order.vessel_id!=null) assert(eq(order.vessel_id,snapshot.vessel_id),'Another vessel was found in this recovery file.');
      if (isObj(order.payload) && order.payload.project_id!=null) assert(eq(order.payload.project_id,snapshot.project_id),'Foreign order payload detected.');
    }
    const watch=snapshot.records.watch;
    assert(isObj(watch)&&eq(watch.project_id,snapshot.project_id)&&typeof watch.has_report==='boolean', 'Watch report belongs to another vessel or is malformed.');
    assert(snapshot.records.scope==='orders-and-latest-watch-only', 'An unsupported record scope was supplied.');
    return {project_id:snapshot.project_id, vessel_name:snapshot.vessel_name, captured_at:snapshot.captured_at,
      order_count:snapshot.records.orders.length, watch_report_present:watch.has_report, scope:snapshot.records.scope};
  }
  function snapshotFor({projectId,vesselId,vesselName,orders,watch,at=new Date().toISOString()}) {
    assert(projectOK(projectId), 'Invalid exact vessel.');
    assert(typeof vesselId==='string' && /^[a-f0-9-]{36}$/i.test(vesselId), 'Missing verified server vessel ID.');
    assert(isObj(orders) && eq(orders.project_id,projectId) && Array.isArray(orders.records), 'Order readback does not match the selected vessel.');
    assert(isObj(watch) && eq(watch.project_id,projectId), 'Watch readback does not match the selected vessel.');
    const result={schema:SNAP,source:'captain-authenticated-readback',project_id:projectId,vessel_id:vesselId,vessel_name:vesselName,captured_at:at,
      records:{scope:'orders-and-latest-watch-only',orders:orders.records,watch}};
    projectScoped(result,projectId);return result;
  }
  function validatePassphrase(value) {
    assert(typeof value==='string' && value.length>=14 && value.length<=128 && value.trim().length>=14,'Use a separate recovery passphrase of at least 14 characters.');
    return value;
  }
  async function digest(c,data){return b64(new Uint8Array(await c.subtle.digest('SHA-256',data)));}
  async function secretKey(c,passphrase,salt,iterations) {
    const key=await c.subtle.importKey('raw',encoder.encode(validatePassphrase(passphrase)),'PBKDF2',false,['deriveKey']);
    return c.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},key,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  function aad(envelope){return encoder.encode(VAULT+'|'+envelope.project_id+'|'+envelope.created_at);}
  async function encrypt(snapshot,passphrase,cryptoImpl) {
    const summary=projectScoped(snapshot);
    const c=cryptoSource(cryptoImpl),plain=encoder.encode(canonical(snapshot));
    assert(plain.byteLength<=LIMIT, 'Snapshot exceeds the safe iPad export size.');
    const salt=c.getRandomValues(new Uint8Array(16)),iv=c.getRandomValues(new Uint8Array(12));
    const envelope={schema:VAULT,version:1,project_id:summary.project_id,created_at:snapshot.captured_at,
      kdf:'PBKDF2-SHA256',iterations:ITERATIONS,cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv)};
    const key=await secretKey(c,passphrase,salt,ITERATIONS);
    const encrypted=new Uint8Array(await c.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(envelope)},key,plain));
    envelope.ciphertext=b64(encrypted);
    envelope.ciphertext_sha256=await digest(c,encrypted);
    return {filename:'blackflag-'+summary.project_id+'-recovery-'+snapshot.captured_at.replace(/[-:]/g,'').replace(/\..*Z$/,'Z')+'.json',
      text:JSON.stringify(envelope,null,2)+'\n',summary};
  }
  async function verify(text,passphrase,expectedProjectId,cryptoImpl) {
    assert(typeof text==='string' && text.length<=Math.ceil(LIMIT/3)*4+8192,'Recovery file is too large.');
    let envelope;try{envelope=JSON.parse(text);}catch(_){throw new Error('The recovery file is not valid JSON.');}
    assert(isObj(envelope)&&envelope.schema===VAULT&&envelope.version===1,'Unsupported encrypted recovery format.');
    assert(projectOK(envelope.project_id)&&projectOK(expectedProjectId)&&eq(envelope.project_id,expectedProjectId), 'Recovery file belongs to a different vessel. No restore was attempted.');
    assert(envelope.kdf==='PBKDF2-SHA256'&&envelope.iterations===ITERATIONS&&envelope.cipher==='AES-256-GCM','Unsupported or weakened encryption settings.');
    assert(Number.isFinite(Date.parse(envelope.created_at)), 'Invalid recovery timestamp.');
    const salt=unb64(envelope.salt,32),iv=unb64(envelope.iv,32),ciphertext=unb64(envelope.ciphertext,LIMIT+32);
    assert(salt.length===16&&iv.length===12&&ciphertext.length>16&&ciphertext.length<=LIMIT+16,'Malformed encrypted recovery file.');
    const c=cryptoSource(cryptoImpl);
    assert((await digest(c,ciphertext))===envelope.ciphertext_sha256,'The encrypted file checksum does not match.');
    const key=await secretKey(c,passphrase,salt,ITERATIONS);
    let plain;try{plain=await c.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad(envelope)},key,ciphertext);}
    catch(_){throw new Error('Passphrase or encrypted file could not be verified. No records were changed.');}
    let snapshot;try{snapshot=JSON.parse(decoder.decode(plain));}catch(_){throw new Error('The decrypted recovery file is invalid.');}
    const summary=projectScoped(snapshot,expectedProjectId);
    assert(eq(snapshot.captured_at,envelope.created_at),'Recovery timestamps do not match.');
    return {verified:true,mode:'READ-ONLY — NO RESTORE PERFORMED',...summary};
  }
  return Object.freeze({SNAP,VAULT,ITERATIONS,snapshotFor,validatePassphrase,projectScoped,encrypt,verify});
});
