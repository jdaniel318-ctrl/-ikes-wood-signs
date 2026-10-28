#!/usr/bin/env python3
"""Shipped Harbor modules/UI in Chromium with an explicit asynchronous in-memory storage adapter.
All records are synthetic. No external network, production Auth or native Safari proof.
"""
import argparse,json,re,shutil,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
 p=argparse.ArgumentParser();p.add_argument('root',type=Path);p.add_argument('--out',type=Path,required=True);a=p.parse_args();root=a.root.resolve();out=a.out.resolve();out.mkdir(parents=True,exist_ok=True)
 text=(root/'index.html').read_text();app=(root/'app.js').read_text();module=(root/'fleet_storage_safety.js').read_text();core=(root/'platform_core.js').read_text();build=json.loads((root/'RELEASE_CONFIG.json').read_text())['build']
 panel=text[text.index('<section id="harborRescuePanel"'):];panel=panel[:panel.index('</section>')+10]
 css=re.search(r'<style id="harborStorageSafetyStyle">([\s\S]*?)</style>',text)[1]
 ui=app[app.index('  let harborRescueDocument='):app.index('  async function refreshV3CommandSystems(')]
 status=app[app.index('  async function renderV3ArchitectureStatus('):app.index('  async function firstMateWatchItems(')]
 observer=app[app.index('  let v4ReadOnlyInspectionPending='):app.index('  const V4_PROJECT_REFERENCE_ALIASES')]
 integrity=app[app.index('  async function runShipIntegrityV3('):app.index('  function seaTrialCheck(')]
 snaps=app[app.index('  async function createV3RecoverySnapshot('):app.index('  let harborRescueDocument=')]
 checks=[];errors=[];network=[]
 def check(name,value):
  checks.append({'name':name,'pass':bool(value)});print('PASS' if value else 'FAIL',name,flush=True)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1366,'height':1024},accept_downloads=True)
  html='<style>'+ (root/'styles.css').read_text()+css + '</style><body style="background:#071b23;color:#e6eef0;padding:20px"><main style="max-width:1120px;margin:auto"><p style="background:#ead187;color:#11242d;padding:12px">OFFLINE TEST FIXTURE · synthetic storage adapter · not Safari or a live backup</p><h2>Harbor — Configure Engine</h2>'+panel+'<div id="shipIntegritySummary"></div><div id="v3ArchitectureStatus"></div><div id="v4EnvelopeTrace"></div><span id="v3SchemaBadge"></span><button id="createRecoverySnapshotBtn">Save snapshot</button></main></body>'
  context.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body=html) if route.request.url=='https://harbor-fixture.invalid/' else (network.append(route.request.url),route.abort())[-1])
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(html)
  page.add_script_tag(content=(root/'HARBOR_TEST_FIXTURE.js').read_text())
  page.expose_function('testDigest',lambda data:list(hashlib.sha256(bytes(data)).digest()))
  page.add_script_tag(content="Object.defineProperty(window,'crypto',{value:{subtle:{digest:async(name,data)=>new Uint8Array(await window.testDigest(Array.from(new Uint8Array(data)))).buffer}},configurable:true});")
  page.add_script_tag(content=module);page.add_script_tag(content=core)
  page.evaluate('''async()=>{
    window.fixtureProjects=Array.from({length:7},(_,i)=>({id:'test-'+i,name:'Synthetic vessel '+i,namespace:'bf.project.test-'+i,schemaVersion:8,isolation:{projectId:'test-'+i,crossProjectAccess:'deny'},permissions:{defaultDeny:true}}));
    const envelopes=Object.fromEntries(fixtureProjects.map(p=>[p.id,{projectId:p.id,namespace:p.namespace,schemaVersion:8,isolation:{...p.isolation,namespace:p.namespace},permissions:{defaultDeny:true,projectScoped:true}}]));
    localStorage.setItem('darkSkyV4ProjectEnvelopesV1',JSON.stringify(envelopes));
    localStorage.setItem('blackFlagOrdersBackupV1','[]');localStorage.setItem('blackFlagProjectLedgersV1','{}');localStorage.setItem('blackFlagProjectCustomersV1','{}');
    localStorage.setItem('darkSkyV4MigrationGateV1',JSON.stringify({failed:true,at:'2026-10-14T01:02:55Z'}));
    localStorage.setItem('blackFlagV3RecoverySnapshotsV1','[]');localStorage.setItem('blackFlagSessionV1','PRIVATE-AUTH-TOKEN');
    localStorage.setItem('blackFlagPrivateCustomerV1',JSON.stringify({name:'PRIVATE CUSTOMER',password:'PRIVATE PASSWORD',email:'private@example.invalid'}));
    const make=(name,setup)=>new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>setup(r.result);r.onsuccess=()=>{r.result.close();resolve();};r.onerror=()=>reject(r.error);});
    await make('blackFlagPlatformV1',db=>{const ps=db.createObjectStore('projects',{keyPath:'id'});fixtureProjects.forEach(p=>ps.put(p));const ss=db.createObjectStore('settings',{keyPath:'key'});ss.put({key:'companies',value:fixtureProjects});ss.put({key:'darkSkyV4ProjectEnvelopesV1',value:envelopes});ss.put({key:'enginePin',value:'PRIVATE PIN'});const os=db.createObjectStore('orders',{keyPath:'id'});os.put({id:'order-1',projectId:'test-0',customer:'PRIVATE CUSTOMER',photo:new Blob(['test photo'],{type:'image/jpeg'})});});
    await make('unrelated-private-db',db=>db.createObjectStore('data').put('OTHER APP PRIVATE','k'));
    window.beforeStorage=Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
    window.writeAttempts=[];const denied=function(name){return function(){writeAttempts.push(name);throw new DOMException('Injected read-only test guard','QuotaExceededError');}};
    Storage.prototype.setItem=denied('localStorage.setItem');Storage.prototype.removeItem=denied('localStorage.removeItem');Storage.prototype.clear=denied('localStorage.clear');
    for(const n of ['put','add','delete','clear'])IDBObjectStore.prototype[n]=denied('IDB.'+n);
    IDBFactory.prototype.deleteDatabase=denied('deleteDatabase');
    const t=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(stores,mode){if(mode&&mode!=='readonly')return denied('transaction:'+mode)();return t.call(this,stores,mode)};
  }''')
  bootstrap="""let engineSessionUnlocked=true;const $=id=>document.getElementById(id);const BUILD_VERSION=%s;let companies=window.fixtureProjects,v4EnvelopeConvergenceState={};const engineConfig={schemaVersion:8};const PROJECT_LEDGER_KEY='blackFlagProjectLedgersV1',PROJECT_CUSTOMERS_KEY='blackFlagProjectCustomersV1',LOCAL_ORDERS_KEY='blackFlagOrdersBackupV1',FLEET_REGISTRY_SCHEMA_KEY='schema',FLEET_REGISTRY_SCHEMA_VERSION=1;const V4_ORPHAN_ORDER_TOMBSTONES_KEY='tombstones',V4_QUARANTINE_KEY='quarantine';const LEGACY_GRIZZLE_PROJECT_ID='grizzle-bear',CANONICAL_GRIZZLY_PROJECT_ID='grizzly-bear';const projectRegistryIds=rows=>new Set(rows.map(p=>p.id));const escapeHtml=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');"""%json.dumps(build)
  page.add_script_tag(content=bootstrap+observer+integrity+status+snaps+ui+"document.querySelectorAll('#harborRescuePanel button').forEach(b=>b.onclick=()=>handleHarborRescueAction(b.id));window.fixtureSetAccess=v=>{engineSessionUnlocked=v;if(!v)clearHarborRescueMemory();};")
  r=page.evaluate('inspectV4EnvelopeConvergence()')
  check('IndexedDB-adapter observation checks seven stored vessels',r['status']=='complete' and r['sealed']==7)
  page.evaluate('renderV3ArchitectureStatus()')
  check('historical failure remains labelled RECORDED','FAILED (RECORDED)' in page.locator('#v3ArchitectureStatus').inner_text())
  check('status observation triggers no storage writes',page.evaluate('writeAttempts.length')==0)
  check('live server authority not inferred','CHECKED SEPARATELY' in page.locator('#v3ArchitectureStatus').inner_text())
  # No creation during missing-database read.
  missing=page.evaluate("BlackFlagStorageSafety.readDatabase(indexedDB,'blackflag-carve-studio-v1')")
  catalog=page.evaluate('indexedDB.databases()')
  check('missing database open aborted without creation',missing['status']=='not-present' and all(x['name']!='blackflag-carve-studio-v1' for x in catalog))
  page.evaluate('fixtureSetAccess(false)');page.locator('#harborPrepareRescue').click();page.wait_for_timeout(50)
  check('locked Engine cannot prepare rescue','locked' in page.locator('#harborRescueStatus').inner_text())
  page.evaluate('fixtureSetAccess(true)');page.once('dialog',lambda d:d.dismiss());page.locator('#harborPrepareRescue').click()
  check('cancelled confirmation creates no capture',page.locator('#harborDownloadRescue').is_disabled())
  page.once('dialog',lambda d:d.accept());page.locator('#harborPrepareRescue').click();page.wait_for_function("!document.getElementById('harborDownloadRescue').disabled",timeout=25000)
  check('prepare captures without quota writes',page.evaluate('writeAttempts.length')==0)
  check('private export warning is prominent','not encrypted' in page.locator('.harbor-private-warning').inner_text())
  with page.expect_download() as event:page.locator('#harborDownloadRescue').click()
  event.value.save_as(out/'SYNTHETIC-PRIVATE-rescue.json');doc=json.loads((out/'SYNTHETIC-PRIVATE-rescue.json').read_text());raw=json.dumps(doc)
  check('private export contains synthetic customer and photo','PRIVATE CUSTOMER' in raw and 'Blob' in raw)
  check('known credentials and unrelated application data excluded',all(x not in raw for x in ['PRIVATE-AUTH-TOKEN','PRIVATE PASSWORD','PRIVATE PIN','OTHER APP PRIVATE']))
  check('no failed read silently reported as full backup',doc['payload']['coverage']['restorable_claim'] is False)
  check('download request not mislabelled saved','not yet verified saved' in page.locator('#harborRescueStatus').inner_text())
  page.locator('#harborVerifyRescue').click();page.locator('#harborVerifyRescueInput').set_input_files(out/'SYNTHETIC-PRIVATE-rescue.json');page.wait_for_function("document.getElementById('harborRescueStatus').textContent.includes('SAVED FILE READBACK MATCHED')")
  check('downloaded rescue bytes reopened and verified', 'No restore' in page.locator('#harborRescueStatus').inner_text())
  with page.expect_download() as event:page.locator('#harborDownloadDiagnostic').click()
  event.value.save_as(out/'diagnostic-summary.json');diag=(out/'diagnostic-summary.json').read_text()
  check('shareable summary has no customer or credential content',all(x not in diag for x in ['PRIVATE','private@example','test-0','photo','order-1']))
  # Invalid JSON read is incomplete, not 0/7 or green.
  bad=page.evaluate("BlackFlagStorageSafety.inspect({projects:fixtureProjects,indexedDB,localStorage:{getItem(){throw new DOMException('blocked','SecurityError')}}})")
  check('unavailable storage distinguished from record loss',bad['status']=='incomplete' and bad['sealed'] is None and bad['checked']==0)
  # Force quota rejection on actual core snapshot function; UI must not show a success element.
  page.evaluate('createV3RecoverySnapshot()')
  check('snapshot quota rejection shown without false success',page.locator('#shipIntegritySummary .v3-recovery-confirm').count()==0 and 'SNAPSHOT NOT CONFIRMED' in page.locator('#shipIntegritySummary').inner_text())
  check('failed snapshot did not overwrite prior data',page.evaluate("JSON.stringify(beforeStorage)===JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])))"))
  tampered=json.loads(json.dumps(doc));tampered['payload']['notes'].append('changed');(out/'tampered.json').write_text(json.dumps(tampered))
  page.locator('#harborVerifyRescue').click();page.locator('#harborVerifyRescueInput').set_input_files(out/'tampered.json');page.wait_for_function("document.getElementById('harborRescueStatus').textContent.includes('FILE NOT VERIFIED')")
  check('tampered file refused','checksum' in page.locator('#harborRescueStatus').inner_text())
  check('unrelated database remains untouched',any(x['name']=='unrelated-private-db' for x in page.evaluate('indexedDB.databases()')))
  check('only deliberate snapshot attempted writes',page.evaluate("writeAttempts.every(x=>x==='localStorage.setItem')&&writeAttempts.length===1"))
  page.screenshot(path=str(out/'harbor-rescue-ipad.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});check('phone rescue panel does not overflow',page.locator('#harborRescuePanel').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2'))
  page.screenshot(path=str(out/'harbor-rescue-phone.png'),full_page=True)
  page.evaluate('fixtureSetAccess(false)');check('locking clears private capture and disables download',page.locator('#harborDownloadRescue').is_disabled() and page.locator('#harborDownloadDiagnostic').is_disabled())
  check('no external network calls',not network);check('no unhandled page exceptions',not errors)
  browser.close()
 (out/'browser-results.json').write_text(json.dumps({'scope':__doc__,'checks':checks,'page_errors':errors,'network_attempts':network},indent=2))
 raise SystemExit(1 if any(not x['pass'] for x in checks) else 0)
if __name__=='__main__':main()
