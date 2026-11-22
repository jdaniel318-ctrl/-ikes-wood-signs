// Fixture boundary: simulated station identity and RPC, production renderer and handlers.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const owner = source('owner.html');
const documents = source('captain_documents.js');
const pause = () => new Promise(resolve => setImmediate(resolve));

function element(){
  return {isConnected:true,hidden:false,dataset:{},removeAttribute(name){delete this[name];}};
}
function fixture(project,records,watch=null){
  const elements = new Map();
  const get = id => {
    if(!elements.has(id))elements.set(id,element());
    return elements.get(id);
  };
  const buttons=['quote','invoice','documents'].map(intent=>({...element(),dataset:{intent}}));
  get('[data-actions]').querySelectorAll=()=>buttons;
  const box=get('captainDocumentTools');
  box.querySelector=get;
  const requests=[];
  const launches=[];
  const opens=[];
  const user={id:'test-captain'};
  const receipt={projectId:project,vesselId:'test-vessel',enabled:true,eligible:true,version:1};
  let read=async()=>receipt;
  let markup='';
  const ctx=vm.createContext({
    document:{getElementById:get,querySelectorAll:()=>[]},window:{BlackFlagQuartermasterUI:{
      openForCaptain:async host=>{opens.push(host);launches.push(host.intent);return true;},
      closeCaptain:()=>{}
    }},
    projectId:project,orders:records,watch,access:{ok:true,project_id:project,display_name:'Harbor Shop',vessel_id:'test-vessel',appointment_id:'a'},
    appointment:{appointment_id:'a',status:'accepted'},person:user,stationEpoch:1,BUILD:'synthetic',SUPABASE_URL:'https://fixture.invalid',
    client:{readSession:()=>({user}),rpc:(name,body)=>{requests.push({name,body});return read();}},
    shell:html=>{markup=html;},esc:String,orderSummary:r=>r.id,
    identityStrip:()=>'',enterCaptainWorkspace:()=>{},recoveryMarkup:()=>'',accountSecurityMarkup:()=>'',
    bindIdentityActions:()=>{},bindRecovery:()=>{},bindAccountSecurity:()=>{},signOut:()=>{},publishWatch:()=>{},
    input:{length:s=>String(s||'').length,boundary:s=>s},loadEditor:async()=>{}
  });
  const handlers=documents.slice(documents.indexOf('export function mountCaptainDocuments')).replace(/^export /,'');
  const renderer=owner.slice(owner.indexOf('  const stationLiveries'),owner.indexOf('  function disableActions()'))
    .replace("import('./captain_documents.js?v='+encodeURIComponent(BUILD))","Promise.resolve({mountCaptainDocuments})");
  const recovery=owner.slice(owner.indexOf('  function recoveryMarkup('),owner.indexOf('  function bindRecovery('));
  const security=owner.slice(owner.indexOf('  function accountSecurityMarkup('),owner.indexOf('  async function securityRequest('));
  vm.runInContext(recovery+security+handlers+'\n'+renderer+'\nrenderStation();',ctx);
  return {get,box,buttons,requests,launches,opens,receipt,ctx,markup,readWith:fn=>{read=fn;}};
}
async function run(){
  const project='bf-p-fc2816b8254a4845';
  const f=fixture(project,[{id:'done',status:'Completed'},{id:'pending',status:'New'}],{has_report:true,reported_at:'2026-10-14T12:00:00Z',unresolved_issues:1});
  await pause();
  assert.match(f.markup,/1 open issue</);
  assert.match(f.markup,/>Update report</);
  assert.match(f.markup,/aria-labelledby="deskSupportHeading"/);
  for (const id of ['captainPasswordForm','captainVaultExport','captainFleetHelp','captainPublishWatch']) {
    assert.ok(f.markup.includes('id="'+id+'"'),id);
  }
  assert.match(f.markup,/<h1>Harbor Shop<\/h1>/);
  assert.match(f.markup,/<details class="captain-handoff-panel station-watch">/);
  assert.ok(f.markup.indexOf('data-captain-save-order="pending"')<f.markup.indexOf('Completed orders (1)'));
  assert.ok(f.markup.indexOf('captainOrdersTitle')<f.markup.indexOf('captainDocumentTools'));
  assert.equal(f.get('stationShipMark').src,'fleet-voyagekeeper.webp');
  assert.equal(f.get('[data-actions]').hidden,false); // Original Soundings read receipt.
  assert.doesNotMatch(f.box.innerHTML,/data-toggle|Turn (on|off)/i);
  for(const button of f.buttons)await button.onclick();
  assert.deepEqual(f.launches,['quote','invoice','documents']);
  assert.equal(f.opens[0].brand.name,'Harbor Shop');
  f.readWith(async()=>({...f.receipt,logoPath:project+'/canonical.webp',logoUpdatedAt:'v 2'}));
  await f.buttons[0].onclick();
  assert.equal(f.get('stationShipMark').src,'https://fixture.invalid/storage/v1/object/public/fleet-branding/'+project+'/canonical.webp?v=v%202');
  f.readWith(async()=>({...f.receipt,logoPath:'wrong-project/canonical.png'}));
  await f.buttons[0].onclick();
  assert.equal(f.get('stationShipMark').src,'fleet-voyagekeeper.webp');
  f.readWith(async()=>{throw Error('offline');});
  await f.buttons[0].onclick();
  assert.equal(f.get('[data-actions]').hidden,true);
  assert.equal(f.get('[data-check]').hidden,false);
  const count=f.requests.length;
  await pause();
  assert.equal(f.requests.length,count);
  f.readWith(async()=>({...f.receipt,enabled:false}));
  await f.get('[data-check]').onclick();
  assert.match(f.get('[role=status]').textContent,/assigned to this ship/);
  const detached=fixture('newly-commissioned',[]);
  assert.match(detached.markup,/>No report yet</);
  assert.match(detached.markup,/>Write first report</);
  let done;
  detached.readWith(()=>new Promise(resolve=>{done=resolve;}));
  await pause();
  assert.equal(detached.get('stationShipMark').src,undefined);
  assert.match(detached.markup,/>HS<\/span>/);
  assert.ok(detached.markup.indexOf('captainDocumentTools')<detached.markup.indexOf('captainOrdersTitle'));
  detached.box.isConnected=false;
  done(detached.receipt);
  await pause();
  assert.equal(detached.get('[data-actions]').hidden,true);
  assert.ok(f.requests.every(r=>r.name==='vessel_captain_document_tool'&&Object.keys(r.body).join()==='p_project_id'&&r.body.p_project_id===project));
  console.log('PASS station branding, legacy read, commissioned initials, pending order priority, Watch disclosure, three document intents, failed read and explicit retry, assignment removal, read-only payloads and detached responses.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
