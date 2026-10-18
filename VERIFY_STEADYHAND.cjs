/* Offline regression and packaging checks. No live RPC, sign-in, network or credentials.
   node VERIFY_STEADYHAND.cjs [release directory] */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const r=path.resolve(process.argv[2]||__dirname),read=n=>fs.readFileSync(path.join(r,n),'utf8');
const h=require(path.join(r,'input_hygiene.js'));
const expected={p_project_id:'bf-p-fixture',p_current_work:'Task in progress',p_unresolved_issues:1,p_issue_summary:'Test note'};
const reply={project_id:expected.p_project_id,current_work:expected.p_current_work,unresolved_issues:1,issue_summary:'Test note',report_id:'fixture-report',reported_at:'2026-10-05T04:02:39Z'};
test('boundary whitespace removes ASCII, tabs, newlines, NBSP and BOM without changing interior text',()=>{
 for(const pad of [' ','    ','\t','\r\n','\u00a0','\uFEFF','\u2009'])assert.equal(h.boundary(pad+'Alpha  Beta\n  Gamma'+pad),'Alpha  Beta\n  Gamma');
});
test('Unicode length counts database characters instead of UTF-16 halves',()=>{assert.equal(h.length('A😀B'),3);assert.equal(h.length(h.boundary('  Task  ')),4);});
test('canonical report payload agrees across boundary whitespace varieties',()=>{
 const p=h.reportPayload(' bf-p-fixture ',' \tTask in progress\u00a0',1,'\nTest note\t');assert.deepEqual(p,expected);assert.ok(h.reportMatches(reply,p));
});
test('valid empty summary accepts only the database null/empty representation',()=>{
 const p={...expected,p_issue_summary:''};assert.ok(h.reportMatches({...reply,issue_summary:null},p));assert.ok(h.reportMatches({...reply,issue_summary:''},p));const missing={...reply};delete missing.issue_summary;assert.equal(h.reportMatches(missing,p),false);
});
for(const [label,change] of Object.entries({project:{project_id:'other-vessel'},work:{current_work:'Task changed'},summary:{issue_summary:'Changed'},issueCount:{unresolved_issues:0},nullCount:{unresolved_issues:null},stringCount:{unresolved_issues:'1'},missingId:{report_id:null},invalidDate:{reported_at:'invalid'}}))test('rejects a genuinely different or incomplete report: '+label,()=>assert.equal(h.reportMatches({...reply,...change},expected),false));
test('independent read must have the exact newly saved report ID',()=>{assert.ok(h.reportMatches(reply,expected,'fixture-report'));assert.equal(h.reportMatches(reply,expected,'another-report'),false);});
test('validation is on the same normalized text that is sent',()=>{
 assert.throws(()=>h.reportPayload('p','   ab  ',1,''));assert.throws(()=>h.reportPayload('p','a'.repeat(161),1,''));assert.throws(()=>h.reportPayload('p','Task',-1,''));assert.throws(()=>h.reportPayload('p','Task',1.5,''));assert.throws(()=>h.reportPayload('p','Task',1,'x'.repeat(501)));assert.equal(h.reportPayload('p','  '+ '😀'.repeat(160)+' ',1,'').p_current_work.length,320);
});
function overview(v){
 const s=read('captain.js'),names=['facts','controlLabel','overview'];
 const functions=names.map(n=>s.split('\n').find(l=>l.startsWith('  function '+n+'('))).join('\n');
 const elements={watchOverviewBody:{innerHTML:''},watchOverview:{classList:{remove(){}},setAttribute(){}},watchOverviewClose:{focus(){}}};
 const ctx={records:[v],programs:[],PROGRAM:{project_id:'bootstrap-build'},lastSync:'2026-10-15T01:00:00Z',mark:()=>'',safe:v=>String(v??''),words:v=>String(v||'unknown').replaceAll('_',' '),$:id=>elements[id],Date};
 vm.createContext(ctx);vm.runInContext(functions+'\noverview(records[0].project_id)',ctx);return elements.watchOverviewBody.innerHTML;
}
test('Admiral detail renders actual commissioning lifecycle separately from stale report age',()=>{
 const html=overview({project_id:'bf-p-fixture',display_name:'Fixture',lifecycle_state:'commissioning',operating_model:'captain_operated',reported_at:'2000-01-01T00:00:00Z',supabase_control_state:'fleet_seeded',settings_present:true,current_work:'Task',issue_summary:'Pending'});
 assert.ok(html.includes('VESSEL LIFECYCLE</small><b>COMMISSIONING'));assert.ok(html.includes('REPORT FRESHNESS</small><b>STALE REPORT'));assert.ok(html.includes('OPERATING MODEL</small><b>CAPTAIN OPERATED'));assert.ok(html.includes('LAST FLEET READ (NOT A NEW REPORT)'));assert.ok(html.includes('CAPTAIN REPORT SAVED AT'));assert.ok(html.includes('FLEET COMMAND OPERATIONS NOT ENABLED'));assert.ok(html.includes('This is not a backend-health warning'));assert.ok(html.includes('button type="button" disabled'));assert.ok(!html.includes('data-watch-publish'));
});
test('unreported and suspended details do not invent a fresh report or active lifecycle',()=>{
 const html=overview({project_id:'bf-p-fixture',display_name:'Fixture',lifecycle_state:'suspended',operating_model:'captain_operated',settings_present:true});assert.ok(html.includes('VESSEL LIFECYCLE</small><b>SUSPENDED'));assert.ok(html.includes('REPORT FRESHNESS</small><b>NEVER REPORTED'));
});
test('all JavaScript files and inline HTML scripts parse',()=>{
 for(const name of fs.readdirSync(r)){
  if(name.endsWith('.js')||name.endsWith('.cjs'))new vm.Script(read(name),{filename:name});
  if(name.endsWith('.html'))for(const m of read(name).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())new vm.Script(m[1],{filename:name+' inline'});
 }
});
test('shared helper is included before form handlers and in the Engine integrity latch',()=>{
 assert.ok(read('owner.html').indexOf('src="input_hygiene.js')<read('owner.html').indexOf('const BUILD='));
 assert.ok(read('index.html').includes("const snapshotPaths=['input_hygiene.js'"));
 assert.ok(read('index.html').includes("for(const path of ['input_hygiene.js','platform_core.js'"));
});
test('known production wording and all password fields explicitly opt out',()=>{
 const source=read('index.html')+read('owner.html');
 for(const id of ['ikeWordingInput','wordingInput','mugsMessage','flowersMessage','sfText','sfNewSample','sfGraphicText'])assert.match(source,new RegExp('<(?:input|textarea)[^>]*data-bf-trim="preserve"[^>]*id="'+id+'"'));
 for(const name of ['index.html','owner.html','app.js','captain.js','simple_books.js'])for(const m of read(name).matchAll(/<input(?=[\s>])[^>]*type="password"[^>]*>/g))assert.ok(m[0].includes('data-bf-trim="preserve"'),name+': '+m[0]);
});
test('release runtime hashes, inventory and version latch agree',()=>{
 const m=JSON.parse(read('DEPLOYMENT_MANIFEST.json')),seal=JSON.parse(read('RELEASE_SEAL.json')),inv=JSON.parse(read('RELEASE_INVENTORY.json'));
 assert.equal(m.build,'8.8.20.33');assert.equal(seal.build,m.build);assert.equal(inv.build,m.build);assert.equal(inv.seal,m.release_seal);
 assert.ok(m.runtime_integrity.files['input_hygiene.js']);
 for(const [file,hash] of Object.entries(m.runtime_integrity.files))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),hash,file+' runtime hash');
 const files=fs.readdirSync(r).filter(n=>fs.statSync(path.join(r,n)).isFile()).sort();assert.deepEqual(inv.files.slice().sort(),files);assert.equal(inv.file_count,files.length);
 for(const n of ['FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'])assert.equal(JSON.parse(read(n)).build,m.build);
});
