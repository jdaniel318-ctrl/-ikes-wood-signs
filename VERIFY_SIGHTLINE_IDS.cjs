const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const c={crypto:{getRandomValues:a=>crypto.webcrypto.getRandomValues(a)}};vm.createContext(c);
for(const file of ['carve_core.js','carvewright_core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
const ids=new Set();for(let i=0;i<100;i++)ids.add(c.CarvewrightCore.createDraft().id);
assert.equal(ids.size,100);for(const id of ids)assert.match(id,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
console.log('PASS cryptographic design IDs without randomUUID');
