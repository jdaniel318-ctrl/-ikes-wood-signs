'use strict';
const fs=require('node:fs'),path=require('node:path');
const {PGlite}=require(process.env.TRADEWINDS_PGLITE||path.resolve(__dirname,'../test-runtime/node_modules/@electric-sql/pglite'));
const {bootstrap,identity,rpc,A,B,S}=require('./VERIFY_TRADEWINDS_SQL.cjs');
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=require(path.join(runtime,'playwright'));
const ORIGIN='https://jdaniel318-ctrl.github.io',SITE=ORIGIN+'/-ikes-wood-signs/';
async function harness(root=__dirname){
 const db=new PGlite();await bootstrap(db);await db.exec(fs.readFileSync(path.join(root,'QUARTERMASTER_TRADEWINDS.sql'),'utf8'));
 const browser=await chromium.launch({executablePath:process.env.QUARTERMASTER_CHROMIUM||'/tmp/steadyhelm-browser/chrome-linux/headless_shell',headless:true,args:['--no-sandbox']});
 let queue=Promise.resolve(),commits=0;
 async function device(options={}){
  const ctx=await browser.newContext({viewport:{width:options.width||1024,height:options.height||768},hasTouch:true,serviceWorkers:'block',acceptDownloads:true});
  await ctx.exposeBinding('tradeRpc',async({page},request)=>{const work=queue.then(async()=>{const opts=await page.evaluate(()=>({...fixture,authRelease:null}));await identity(db,opts.account,opts.account===B?'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb':S);
   if(request.name==='admiral_list_vessels_for_branding')return {records:[{project_id:'ikes-wood-signs',display_name:"Ike's Wood Signs",mission_class:'independent_business'}]};
   if(opts.failBefore)throw Error('Synthetic network interrupted before request');
   const result=await rpc(db,request.name,request.body);if(request.name==='quartermaster_commit_workspace'){commits++;if(opts.loseReply)throw Error('Synthetic response lost after server commit');}return result;
  });queue=work.catch(()=>{});try{return {value:await work};}catch(e){return {error:{message:e.message,code:e.code}};}});
  await ctx.addInitScript(({account})=>{
   window.fixture={account,authority:true,reusable:true,stamp:1,loseReply:false,failBefore:false,idbWriteBlocked:false};
   window.DarkSkyAdmiralSession={status:()=>({reusable:fixture.reusable,startedAt:fixture.stamp})};
   window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({url:'https://sjgqqtnuttnkwsoebbqf.supabase.co',environment:'staging',publishableKey:'SYNTHETIC'})}};
   window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:fixture.account}}),verifyAdmiralAuthority:async()=>{if(!fixture.authority){fixture.reusable=false;dispatchEvent(new Event('darksky:admiral-session-unavailable'));throw Error('Synthetic verification unavailable');}return true;},rpc:async(name,body)=>{const r=await tradeRpc({name,body});if(r.error)throw Object.assign(Error(r.error.message),{code:r.error.code});return r.value;}})};
   const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){if(fixture.idbWriteBlocked)throw new DOMException('Synthetic quota failure','QuotaExceededError');return put.apply(this,arguments);};
  },{account:options.account||A});
  const errors=[],blocked=[];
  await ctx.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==ORIGIN||route.request().method()!=='GET'){blocked.push(u.href);return route.abort();}const name=u.pathname.split('/').pop()||'index.html';if(name==='index.html'){const modules=['quartermaster_core.js','quartermaster_sync.js','quartermaster_fonts.js','quartermaster_pdf.js','quartermaster.js'].filter(n=>fs.existsSync(path.join(root,n)));return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="quartermaster.css"></head><body><section id="admiralDeck"><button>Fixture launch</button></section>'+modules.map(n=>'<script src="'+n+'"></script>').join('')+'</body></html>'});}const file=path.join(root,name);if(!fs.existsSync(file))return route.fulfill({status:404,body:''});await route.fulfill({body:fs.readFileSync(file),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'application/octet-stream'});});
  const page=await ctx.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(SITE+'index.html');return {page,ctx,errors,blocked};
 }
 return {db,browser,device,commits:()=>commits,close:async()=>{await browser.close();await db.close();}};
}
module.exports={harness,SITE};
