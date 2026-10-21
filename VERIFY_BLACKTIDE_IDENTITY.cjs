/* Offline current shared-client identity regression. Runs the complete real module
 * with synthetic configuration and in-memory browser storage. No network is allowed.
 * Usage: node VERIFY_BLACKTIDE_IDENTITY.cjs [release-dir]
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||'.');
const source=fs.readFileSync(path.join(root,'fleet_supabase.js'),'utf8');
function moduleFixture(){
  const stored=new Map();let requests=0;
  const context={
    document:{addEventListener(){}},window:{addEventListener(){},dispatchEvent(){}},
    sessionStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,String(value)),removeItem:key=>stored.delete(key)},
    fetch(){requests++;throw new Error('Network forbidden in identity regression');},
    setTimeout(){throw new Error('Identity-only checks must not start a session timer');},clearTimeout(){},
    performance:{now:()=>0}
  };
  vm.createContext(context);vm.runInContext(source,context,{filename:'fleet_supabase.js'});
  return {api:context.window.DarkSkySupabase,stored,requests:()=>requests};
}
const options={url:'https://invalid.test',publishableKey:'synthetic-public-key',sessionKey:'synthetic-blacktide-identity'};
const session={access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_in:3600,user:{id:'synthetic-user'}};
test('real shared client defaults its public identity to Blacktide .42',()=>{
  const f=moduleFixture(),client=f.api.create(options);
  assert.equal(client.build,'8.8.20.42');assert.equal(f.requests(),0);assert.equal(f.stored.size,0);
});
test('real shared client saves Blacktide .42 in session when build is omitted',()=>{
  const f=moduleFixture(),client=f.api.create(options),saved=client.saveSession(session);
  assert.equal(saved.build,'8.8.20.42');assert.equal(JSON.parse(f.stored.get(options.sessionKey)).build,'8.8.20.42');
  assert.equal(client.readSession().build,'8.8.20.42');assert.equal(f.requests(),0);
});
test('Admiral station key also records current identity without granting a workspace',()=>{
  const f=moduleFixture(),key='darkSkySupabaseAdmiralSessionV1',client=f.api.create({...options,sessionKey:key}),saved=client.saveSession(session);
  assert.equal(client.build,'8.8.20.42');assert.equal(saved.build,'8.8.20.42');assert.equal(JSON.parse(f.stored.get(key)).build,'8.8.20.42');
  assert.equal(client.readSession(),null,'saving synthetic token material must not grant Admiral workspace authority');assert.equal(f.requests(),0);
});
test('explicit caller build still governs client and saved session',()=>{
  const f=moduleFixture(),client=f.api.create({...options,build:'explicit-test-build'}),saved=client.saveSession(session);
  assert.equal(client.build,'explicit-test-build');assert.equal(saved.build,'explicit-test-build');assert.equal(client.readSession().build,'explicit-test-build');assert.equal(f.requests(),0);
});
