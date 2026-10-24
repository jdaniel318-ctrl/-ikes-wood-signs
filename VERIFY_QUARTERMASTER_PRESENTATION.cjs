'use strict';
// Focused offline rendering: exact gate presentation functions/template and actual
// Quartermaster modules under the complete professional Admiral CSS cascade.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const{createRequire}=require('node:module');
const req=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'));
const{chromium}=req('playwright');
function initFixture(options={}){
 const cfg={account:'synthetic-admiral-a',backend:'https://synthetic-backend.invalid',environment:'isolated-qa',authority:true,reusable:true,...options};
 return '('+function(cfg){
 window.fixture={...cfg,stamp:100,checks:0,completedChecks:0,rpcs:[],idbOpens:[],idbWrites:[],idbBlocked:false,idbWriteBlocked:false,authWait:false,authRelease:null};
 const records=[{project_id:'househull',display_name:'HouseHull',name:'HouseHull',vessel_name:'HouseHull'},{project_id:'other-business',display_name:'Other synthetic business',name:'Other synthetic business'}];
 window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp}),noteProgramActivity:()=>{}};
 window.DarkSkyReadAdmiralFleet=()=>records;
 window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:fixture.backend,environment:fixture.environment,env:fixture.environment,publishableKey:'synthetic-public-key'})}};
 window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.account},access_token:'SYNTHETIC-NEVER-SENT'}),verifyAdmiralAuthority:async()=>{fixture.checks++;if(fixture.authWait)await new Promise(resolve=>fixture.authRelease=resolve);fixture.completedChecks++;return fixture.authority;},rpc:async(name,body)=>{fixture.rpcs.push({name,body});if(name!=='admiral_list_vessels_for_branding')throw Error('Unexpected synthetic RPC '+name);return {records};}})};
 const open=IDBFactory.prototype.open;
 IDBFactory.prototype.open=function(name){fixture.idbOpens.push(String(name));if(fixture.idbBlocked)throw new DOMException('Synthetic storage blocked','SecurityError');return Reflect.apply(open,this,arguments);};
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){fixture.idbWrites.push({store:this.name,key:String(key)});if(fixture.idbWriteBlocked)throw new DOMException('Synthetic storage quota','QuotaExceededError');return Reflect.apply(put,this,arguments);};
 }+')('+JSON.stringify(cfg)+');';
}
const ROOT=path.resolve(process.argv[2]),OUT=path.resolve(process.argv[3]),PHASE=process.argv[4]||'after';
fs.mkdirSync(OUT,{recursive:true});
const names=['captain.js','styles.css','business_deck.css','quartermaster.js','quartermaster.css','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js'];
const bytes=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(ROOT,n))]));
const sources=Object.fromEntries(names.map(n=>[n,crypto.createHash('sha256').update(bytes[n]).digest('hex')]));
const captain=bytes['captain.js'].toString();
function between(start,end){const a=captain.indexOf(start);assert(a>=0,'source marker missing '+start);const b=captain.indexOf(end,a+start.length);assert(b>a,'end marker missing '+end);return captain.slice(a,b);}
const step=between('  function setAdmiralEntranceStep(gate,step){','\n  function refreshAdmiralSessionStrip');
const viewport=between('  function installAdmiralEntranceViewport(gate){','\n  function ensureAdmiralDeck');
const create=between("    gate=document.createElement('div');","\n\n    const deck=document.createElement('div');");
const airlock=between('    const showAccountAirlock=()=>{',"    byId('admiralUnlockBtn').onclick=");
const gateScript=`const byId=id=>document.getElementById(id);window.gateFixture={reusable:false};window.DarkSkyAdmiralSession={status:()=>({reusable:gateFixture.reusable,reason:gateFixture.reusable?'idle':''})};${step}\n${viewport}\nlet gate;${create}\n${airlock}\nwindow.setGateMode=mode=>{gateFixture.reusable=mode==='resume';gate.classList.remove('hidden');gate.dataset.entrySource='engine';gate.dataset.directTarget='quartermaster';byId('admiralGateReturnBtn').textContent='← RETURN TO ENGINE';const input=byId('admiralPinInput');input.classList.remove('hidden');input.previousElementSibling.classList.remove('hidden');byId('admiralUnlockBtn').classList.remove('hidden');byId('admiralPinError').classList.remove('hidden');byId('admiralAccountAirlock').classList.add('hidden');if(mode==='account')showAccountAirlock();else setAdmiralEntranceStep(gate,'pin');};setGateMode('pin');`;
const styles='<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="business_deck.css"><link rel="stylesheet" href="quartermaster.css">';
const head='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated presentation verification</title>'+styles+'</head>';
const gateHTML=head+'<body><script src="gate-fixture.js"></script></body></html>';
const workspaceHTML=head+'<body><section id="admiralDeck" class="admiral-deck-overlay" data-mode="professional" aria-hidden="false"><div class="admiral-deck-shell"><header class="admiral-deck-head"><h2>Admiral workspace</h2></header></div></section>'+['quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','quartermaster.js'].map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>';
const ORIGIN='https://quartermaster-presentation.invalid';
const results=[],regressions=[];let browser;
async function context(type,size){
 const ctx=await browser.newContext({viewport:{width:size[0],height:size[1]},serviceWorkers:'block',reducedMotion:'reduce'});
 if(type==='workspace')await ctx.addInitScript(initFixture());
 const blocked=[],errors=[];
 await ctx.route('**/*',async route=>{
  const u=new URL(route.request().url()),name=decodeURIComponent(u.pathname).replace(/^\//,'');
  if(u.origin!==ORIGIN||name.includes('/')||route.request().method()!=='GET'){blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();}
  let body=name==='index.html'?Buffer.from(type==='gate'?gateHTML:workspaceHTML):name==='gate-fixture.js'?Buffer.from(gateScript):bytes[name];
  if(!body&&fs.existsSync(path.join(ROOT,name))&&fs.statSync(path.join(ROOT,name)).isFile())body=fs.readFileSync(path.join(ROOT,name));
  if(!body){blocked.push({origin:u.origin,path:u.pathname,method:route.request().method()});return route.abort();}
  const ct=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.html')?'text/html':name.endsWith('.png')?'image/png':name.endsWith('.jpg')||name.endsWith('.jpeg')?'image/jpeg':'application/octet-stream';
  return route.fulfill({status:200,body,contentType:ct});
 });
 const page=await ctx.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(ORIGIN+'/index.html',{waitUntil:'load'});return{ctx,page,blocked,errors};
}
function record(name,pass,details={}){results.push({name,pass,...details});if(!pass)console.error('FAIL '+name);}
async function geometry(page,selector){return page.evaluate(selector=>{
 const root=document.querySelector(selector),r=root.getBoundingClientRect(),controls=[...root.querySelectorAll('button,input,select,textarea,a.qm-download')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
 const small=controls.filter(e=>e.type!=='checkbox'&&(e.getBoundingClientRect().height<43.5||e.getBoundingClientRect().width<43.5)).map(e=>({id:e.id||e.textContent.trim().slice(0,35),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
 const overflow=controls.filter(e=>!e.closest('.qm-tabs,.qm-table-scroll')).map(e=>({id:e.id||e.textContent.trim().slice(0,35),r:e.getBoundingClientRect()})).filter(x=>x.r.left< -1||x.r.right>innerWidth+1).map(x=>({id:x.id,left:x.r.left,right:x.r.right}));
 const content=document.querySelector('#qmContent');
 return{width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,root:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height},small,overflow,contentHeight:content?.clientHeight??null,contentScrollHeight:content?.scrollHeight??null};
},selector);}
async function controls(page,selectors){return page.evaluate(selectors=>Object.fromEntries(Object.entries(selectors).map(([key,s])=>{const n=document.querySelector(s);if(!n)return[key,null];const c=getComputedStyle(n);return[key,{background:c.backgroundColor,image:c.backgroundImage,color:c.color,border:c.borderColor,opacity:c.opacity,cursor:c.cursor,minHeight:c.minHeight,height:n.getBoundingClientRect().height,outline:c.outlineStyle,outlineWidth:c.outlineWidth,disabled:n.disabled,hidden:!n.getClientRects().length}];})),selectors);}
function visual(c){return JSON.stringify([c.background,c.image,c.color,c.border]);}
async function reachable(page,selector,container){const n=page.locator(selector);await n.scrollIntoViewIfNeeded();await n.focus();return page.evaluate(({selector,container})=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),box=document.querySelector(container).getBoundingClientRect(),left=Math.max(r.left,box.left,0),right=Math.min(r.right,box.right,innerWidth),top=Math.max(r.top,box.top,0),bottom=Math.min(r.bottom,box.bottom,innerHeight);return{focused:document.activeElement===e,visibleWidth:right-left,visibleHeight:bottom-top,rect:{top:r.top,bottom:r.bottom},container:{top:box.top,bottom:box.bottom}};},{selector,container});}
async function gate(size,label){const f=await context('gate',size),p=f.page;try{
 for(const mode of ['pin','account','resume']){
  await p.evaluate(mode=>setGateMode(mode),mode);await p.waitForTimeout(50);
  const g=await geometry(p,'#admiralGateOverlay');
  const state=await p.evaluate(()=>{const pin=document.querySelector('#admiralPinInput'),account=document.querySelector('#admiralAccountAirlock');return{mode:document.querySelector('#admiralGateOverlay').dataset.authStep,labelAdjacent:pin.previousElementSibling?.matches('label[for="admiralPinInput"]'),pinVisible:!!pin.getClientRects().length,accountVisible:!!account.getClientRects().length,focus:document.activeElement.id,current:[...document.querySelectorAll('.admiral-entrance-progress [aria-current="step"]')].map(n=>n.id)};});
  const initial=mode!=='account';record(`gate ${label} ${mode} geometry and state`,g.documentWidth<=g.width+1&&g.overflow.length===0&&g.small.length===0&&state.labelAdjacent&&state.pinVisible===initial&&state.accountVisible===!initial&&state.focus==='admiralGateTitle'&&state.current.length===1,{geometry:g,state});
  await p.screenshot({path:path.join(OUT,`gate-${label}-${mode}.png`),fullPage:true});
 }
 await p.evaluate(()=>{setGateMode('pin');document.querySelector('#admiralUnlockBtn').disabled=true;});
 const c=await controls(p,{disabled:'#admiralUnlockBtn'});record(`gate ${label} disabled primary remains distinct`,c.disabled.disabled&&Number(c.disabled.opacity)<1,{style:c.disabled});
 await p.evaluate(()=>{document.querySelector('#admiralGateOverlay').classList.add('hidden');});
 record(`gate ${label} closed surface hidden`,await p.locator('#admiralGateOverlay').isHidden());
 assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
 }catch(e){record(`gate ${label} harness completion`,false,{error:e.stack});}finally{await f.ctx.close();}}
async function workspace(size,label){const f=await context('workspace',size),p=f.page;try{
 await p.waitForFunction(()=>window.BlackFlagQuartermasterUI);await p.evaluate(()=>BlackFlagQuartermasterUI.open());await p.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');
 await p.locator('#qmExampleQuote').click();await p.waitForFunction(()=>document.querySelector('#qmStatus')?.textContent.includes('Example quote saved'));await p.locator('[data-qm-tab="overview"]').click();await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);await p.waitForTimeout(180);
 const g=await geometry(p,'#quartermasterWorkspace');
 record(`workspace ${label} overview geometry`,g.documentWidth<=g.width+1&&g.root.left>=-1&&g.root.right<=g.width+1&&g.overflow.length===0&&g.small.length===0&&g.contentHeight>=180,{geometry:g});
 const c=await controls(p,{selected:'[data-qm-tab="overview"]',inactive:'[data-qm-tab="catalog"]',primary:'#qmNewQuote',secondary:'#qmNewInvoice'});
 const distinct={selectedTabs:visual(c.selected)!==visual(c.inactive),primarySecondary:visual(c.primary)!==visual(c.secondary)};
 regressions.push({name:`professional Admiral button cascade ${label}`,phase:PHASE,...distinct,styles:c});
 record(`workspace ${label} selected tab and primary action remain distinct`,PHASE==='before'?!distinct.selectedTabs&&!distinct.primarySecondary:distinct.selectedTabs&&distinct.primarySecondary,{expected:PHASE==='before'?'reproduced original collision':'collision corrected',...distinct});
 await p.screenshot({path:path.join(OUT,`workspace-${label}-overview.png`),fullPage:true});
 await p.locator('[data-qm-tab="catalog"]').click();await p.locator('#qmAddPart').click();
 const r=await reachable(p,'#qmPartSku','#qmContent');record(`workspace ${label} catalog fields reachable`,r.focused&&r.visibleHeight>=40&&r.visibleWidth>=80,{reachability:r});
 const hidden=await p.evaluate(()=>[...document.querySelectorAll('#quartermasterWorkspace [hidden]')].every(n=>!n.getClientRects().length));record(`workspace ${label} hidden panels stay hidden`,hidden);
 await p.evaluate(()=>document.querySelector('#qmSavePart').disabled=true);const d=await controls(p,{disabled:'#qmSavePart'});record(`workspace ${label} disabled action has disabled presentation`,d.disabled.disabled&&Number(d.disabled.opacity)<1,{style:d.disabled});
 await p.locator('#qmCancelPart').click();await p.locator('[data-qm-tab="overview"]').click();
 // Tab focus/selection should remain legible under the inherited global focus rule.
 await p.locator('[data-qm-tab="overview"]').focus();const focus=await controls(p,{selected:'[data-qm-tab="overview"]'});record(`workspace ${label} keyboard focus visible`,focus.selected.outline!=='none'&&parseFloat(focus.selected.outlineWidth)>0,{style:focus.selected});
 assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
 }catch(e){record(`workspace ${label} harness completion`,false,{error:e.stack});await p.screenshot({path:path.join(OUT,`workspace-${label}-failure.png`),fullPage:true}).catch(()=>{});}finally{await f.ctx.close();}}
async function short(){const f=await context('gate',[390,460]),p=f.page;try{
 await p.evaluate(()=>setGateMode('account'));const r=await reachable(p,'#admiralAirlockPassword','#admiralGateOverlay');record('gate short viewport password reachable',r.focused&&r.visibleHeight>=44,{reachability:r});await p.screenshot({path:path.join(OUT,'gate-short-account.png')});assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
 }catch(e){record('gate short viewport completion',false,{error:e.stack});}finally{await f.ctx.close();}
 const w=await context('workspace',[768,480]),q=w.page;try{
 await q.waitForFunction(()=>window.BlackFlagQuartermasterUI);await q.evaluate(()=>BlackFlagQuartermasterUI.open());await q.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');await q.locator('[data-qm-tab="settings"]').click();const g=await geometry(q,'#quartermasterWorkspace');const r=await reachable(q,'#qmBizEmail','#qmContent');record('workspace short viewport editable field reachable',g.contentHeight>=96&&r.focused&&r.visibleHeight>=40,{geometry:g,reachability:r});await q.screenshot({path:path.join(OUT,'workspace-short-settings.png')});assert.deepEqual(w.errors,[]);assert.deepEqual(w.blocked,[]);
 }catch(e){record('workspace short viewport completion',false,{error:e.stack});}finally{await w.ctx.close();}}
async function followup(){
 for(const [width,height,label]of [[1024,768,'final-tablet'],[390,844,'phone-disclosure'],[768,480,'short-disclosure']]){
  const f=await context('workspace',[width,height]),p=f.page;
  try{await p.waitForFunction(()=>window.BlackFlagQuartermasterUI);await p.evaluate(()=>BlackFlagQuartermasterUI.open());await p.waitForFunction(()=>document.querySelector('#quartermasterWorkspace')?.getAttribute('aria-busy')==='false');
   if(label==='final-tablet'){
    await p.locator('#qmExampleQuote').click();await p.waitForFunction(()=>document.querySelector('#qmStatus')?.textContent.includes('Example quote saved'));await p.locator('[data-qm-tab="overview"]').click();await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);await p.screenshot({path:path.join(OUT,'workspace-final-8.8.20.51-overview.png'),fullPage:true});
    const build=await p.evaluate(()=>BlackFlagQuartermasterUI.build);record('current identity overview renders',build==='8.8.20.51',{build});
   }
   const summary=p.locator('.qm-storage-details summary'),box=await summary.boundingBox();await summary.click();
   const open=await p.locator('.qm-storage-details').getAttribute('open');const g=await geometry(p,'#quartermasterWorkspace');record(`workspace ${label} disclosure target and expansion`,box.height>=44&&box.width>=44&&open!==null&&g.contentHeight>=96,{target:box,geometry:g});
   await p.locator('[data-qm-tab="settings"]').click();const reach=await reachable(p,'#qmBizEmail','#qmContent');record(`workspace ${label} expanded disclosure retains field access`,reach.focused&&reach.visibleHeight>=40,{reachability:reach});
   if(label!=='final-tablet')await p.screenshot({path:path.join(OUT,`${label}-expanded-settings.png`)});
   assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
  }catch(e){record(`workspace ${label} follow-up completion`,false,{error:e.stack});}finally{await f.ctx.close();}
 }
 const f=await context('gate',[390,460]),p=f.page;try{
  await p.evaluate(()=>setGateMode('account'));const s=p.locator('.admiral-session-help summary'),box=await s.boundingBox();await s.click();const reach=await reachable(p,'#admiralAirlockPassword','#admiralGateOverlay');record('gate session disclosure target and expanded field access',box.height>=44&&box.width>=44&&reach.focused&&reach.visibleHeight>=44,{target:box,reachability:reach});assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
 }catch(e){record('gate disclosure follow-up completion',false,{error:e.stack});}finally{await f.ctx.close();}
}
(async()=>{browser=await chromium.launch({executablePath:process.env.QUARTERMASTER_CHROMIUM||'/tmp/quartermaster-chromium/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 if(process.argv.includes('--followup'))await followup();else{for(const [width,height,label]of [[1024,768,'tablet-landscape'],[768,1024,'tablet-portrait'],[390,844,'phone']]){await gate([width,height],label);await workspace([width,height],label);}await short();}
 const report={phase:PHASE,root:ROOT,scope:'Exact extracted gate presentation/template and state writers plus complete host CSS; actual Quartermaster UI/native IndexedDB in professional Admiral host; isolated synthetic account; all external requests blocked. No actual authentication or Safari proof.',browser:browser.version(),sources,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,regressions,results};fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase:PHASE,passed:report.passed,failed:report.failed,regressions:regressions.map(({name,selectedTabs,primarySecondary})=>({name,selectedTabs,primarySecondary}))}));if(PHASE==='after'&&report.failed)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
