'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const {setup,rpc,owner}=require('./VERIFY_COUNTERCRAFT_SQL.cjs');
const root=__dirname,results=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:String(e)});console.error('FAIL '+name+': '+e);}}
(async()=>{
 await check('upgrade expires old review sessions while retaining receipt and transfer access',async()=>{
  const db=await setup(process.env.COUNTERCRAFT_BASE_SQL);try{
   const p=await rpc(db,'publish',{...owner,expectedVersion:0,settings:{stocks:[],rates:[]},enabled:true});await db.exec('reset role');
   const j=(await db.query('insert into fleet_private.cc_jobs(publication_id,status) values($1,$2) returning id',[p.id,'awaiting-customer-approval'])).rows[0];
   const snapshot={request:{customer:{name:'Synthetic'},design:{text:{value:'SYNTHETIC REVIEW'}}},approval:{digest:'review-digest'}};
   await db.query('insert into fleet_private.cc_revisions(job_id,revision,snapshot,assets) values($1,1,$2,$3)',[j.id,snapshot,[]]);
   const old='d'.repeat(64),receipt='e'.repeat(64),transfer='f'.repeat(64),fresh='a'.repeat(64);
   for(const [token,kind]of [[old,'review-session'],[receipt,'receipt-session'],[transfer,'review-transfer']])await db.query("insert into fleet_private.cc_tokens values($1,$2,$3,1,$4,now()+interval '50 minutes',null,null,now()-interval '10 minutes')",[token,p.id,j.id,kind]);
   await db.exec(fs.readFileSync(path.join(root,'HARBORLIGHT_SESSION_HARDENING.sql'),'utf8'));await db.exec('set role service_role');
   await assert.rejects(rpc(db,'token-read',{tokenHash:old}),/expired/i);
   await assert.rejects(rpc(db,'review-respond',{tokenHash:old,answer:'accept',digest:'review-digest'}),/expired/i);
   assert.equal((await rpc(db,'token-read',{tokenHash:receipt})).kind,'receipt-session');
   assert.equal((await rpc(db,'exchange',{tokenHash:transfer,newTokenHash:fresh})).kind,'review-session');
   assert.equal((await rpc(db,'token-read',{tokenHash:fresh})).sessionPolicy,'idle-v1');
   await db.exec('reset role');const row=(await db.query('select expires_at from fleet_private.cc_tokens where token_hash=$1',[fresh])).rows[0];assert(Date.parse(row.expires_at)-Date.now()<=180500);
  }finally{await db.close();}
 });
 await check('server-confirmed review locks owner peers even through a receipt URL',async()=>{
  const {chromium}=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');
  const S=require('./ike_shop_core.js'),request=S.createRequest();request.design.text.value='SYNTHETIC REVIEW';request.proof={dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN2kAAAAASUVORK5CYII='};
  const record={kind:'review-session',sessionPolicy:'idle-v1',number:'IKE-1',revision:2,record:{snapshot:{request,price:{totalCents:null},stockId:'',boardSpec:null,approval:{digest:'a'.repeat(64)}}}};
  const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});try{
   const c=await b.newContext(),errors=[];
   await c.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/functions/v1/countercraft'){const a=route.request().postDataJSON().action;return route.fulfill({json:a==='exchange'?{kind:'review-session',token:'synthetic-review'}:record});}
    if(u.origin!=='https://fixture.invalid')return route.abort();
    if(u.pathname==='/peer.html')return route.fulfill({contentType:'text/html',body:'<body><div id="ownerControls">SYNTHETIC OWNER CONTROLS</div><script src="countercraft_privacy.js"></script></body>'});
    const file=path.resolve(root,u.pathname.slice(1));if(!file.startsWith(root+'/')||!fs.existsSync(file))return route.abort();return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html'});
   });
   const peer=await c.newPage();await peer.goto('https://fixture.invalid/peer.html');
   const p=await c.newPage();p.on('pageerror',e=>errors.push(String(e)));
   await p.goto('https://fixture.invalid/countercraft.html?receipt=1#token=synthetic-transfer');await p.locator('#ccAccept').waitFor();
   assert.equal(await peer.locator('#ownerControls').count(),0,'Owner peer must be cleared before review controls appear');
   assert(await p.evaluate(()=>localStorage.getItem('countercraft-customer-lease')),'Shared review must hold a customer lease');
   assert.deepEqual(errors,[]);
  }finally{await b.close();}
 });
 const out=process.argv[2];if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({scope:'isolated PostgreSQL and synthetic Chromium service responses',results},null,2));}
 if(results.some(r=>!r.pass))process.exitCode=1;
})();
