'use strict';
// Execute the whole production customer controller and real flow/core modules.
// A deterministic clock replaces waiting; DOM/network boundaries are local fixtures.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/countercraft_customer.js','utf8');

function fixture(mode='preview',setup=()=>{}){
 let now=1000000,serial=0,flow,network=0;
 const timers=new Map(),elements=new Map(),events=new Map(),windowEvents=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',dataset:{},open:false,hidden:false,listeners:{},classList:{toggle(){},remove(){}},focus(){},replaceChildren(){this.innerHTML='';},showModal(){this.open=true;},close(){this.open=false;},addEventListener(type,fn){this.listeners[type]=fn;}});return elements.get(id);};
 const DateFixture=class extends Date {static now(){return now;}};
 const scope={projectId:'ikes-wood-signs',backend:'https://sjgqqtnuttnkwsoebbqf.supabase.co',environment:'staging',site:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',deploymentId:'fixture',mode:mode==='preview'?'sea_trial':mode};
 let realmScope,realmPub;
 const c={console,URLSearchParams,Date:DateFixture,crypto,TextEncoder,TextDecoder,Uint8Array,Intl,Promise,location:{search:mode==='preview'||mode==='forged'?'?preview=1':'',hash:'#launch=fixture',pathname:'/countercraft.html'},history:{replaceState(){}},isSecureContext:true,
  document:{hidden:false,getElementById:el,querySelector:()=>null,querySelectorAll:()=>[],body:{classList:{toggle(){},remove(){}}},addEventListener:(type,fn,options)=>{if(!events.has(type))events.set(type,[]);events.get(type).push({fn,options});}},
  setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id),scrollTo(){},addEventListener:(type,fn)=>windowEvents.set(type,fn),confirm:()=>true,
  CountercraftConfig:{consumePreview:()=>mode==='preview'?{scope:realmScope}:null,activeLocation:()=>realmScope},
  CountercraftClient:{transport:()=>async()=>{network++;},start:async()=>({token:'fixture',sessionPolicy:'idle-v1',publication:realmPub}),create:()=>({checkpoint:async()=>{},end:async()=>{}})},CountercraftStore:{create:()=>({})},CountercraftPrivacy:{sealBrowser:async()=>{},release(){}},IkeGlyphBench:{pack:id=>({anchorImage:"fixture.png",anchorText:"Fixture",label:id})},CarvewrightStudio:{close(){}},navigator:{}};
 c.globalThis=c;c.window=c;vm.createContext(c);
 for(const name of ['carve_fonts.js','carve_core.js','fleet_design_assets.js','carvewright_core.js','boardcraft_photo.js','ike_shop_core.js','countercraft_core.js','countercraft_flow.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),c,{filename:name});
 realmScope=vm.runInContext('('+JSON.stringify(scope)+')',c);
 realmPub=vm.runInContext('('+JSON.stringify({scope,revision:1,enabled:false,stocks:[],rates:[],recoveryKey:null})+')',c);
 const createFlow=c.CountercraftFlow.create;c.CountercraftFlow={create:()=>flow=createFlow()};
 setup(c);vm.runInContext(source,c,{filename:'countercraft_customer.js'});
 const emit=(type,stopped=false,targetId=null,value='')=>{let halted=false;const e={stopImmediatePropagation(){halted=true;},stopPropagation(){halted=true;}};const handlers=events.get(type)||[];for(const h of handlers.filter(h=>h.options?.capture)){h.fn(e);if(halted)return;}if(targetId){el(targetId).value=value;el(targetId).listeners[type]?.(e);}if(stopped||halted)return;for(const h of handlers.filter(h=>!h.options?.capture))h.fn(e);};
 return {c,el,flow:()=>flow,network:()=>network,emit,start:async()=>{await el('ccBegin').onclick();assert.notEqual(el('ccStatus').dataset.error,'true',el('ccStatus').textContent);assert.match(el('ccApp').innerHTML,/get to know your board/);assert.equal(typeof el('ccName').listeners.input,'function');flow.set('name','Preview Customer');flow.set('wording','Andie Rose');},advance:ms=>{const end=now+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;},jump:ms=>{now+=ms;},hasWork:()=>flow.state().request.customer.name==='Preview Customer'};
}
let passed=0,failed=0;
async function test(name,fn){try{await fn();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
if(require.main===module)(async()=>{
 await test('preview retains work beyond the old timeout; warns at seven minutes and resets at seven and a half',async()=>{const f=fixture();await f.start();f.advance(180000);assert(f.hasWork(),'Preview was cleared at the old 150-second limit');assert.equal(f.el('ccCover').open,false);f.advance(239999);assert.equal(f.el('ccCover').open,false);f.advance(1);assert.equal(f.el('ccCover').open,true);f.advance(29999);assert(f.hasWork());f.advance(1);assert.equal(f.hasWork(),false);assert.equal(f.el('ccCover').open,false);assert.equal(f.network(),0);await f.el('ccBegin').onclick();assert.equal(f.flow().state().request.customer.name,'');assert.equal(f.flow().state().request.design.text.value,'');assert.equal(f.flow().state().request.photos.length,0);});
 await test('Continue before expiry renews the complete preview inactivity window',async()=>{const f=fixture();await f.start();f.advance(440000);f.el('ccContinue').onclick();assert.equal(f.el('ccCover').open,false);f.advance(419999);assert(f.hasWork());assert.equal(f.el('ccCover').open,false);f.advance(1);assert.equal(f.el('ccCover').open,true);});
 for(const event of ['pointerdown','keydown','input'])await test(event+' activity restarts the preview timer',async()=>{const f=fixture();await f.start();f.advance(400000);f.emit(event);f.advance(419999);assert(f.hasWork());assert.equal(f.el('ccCover').open,false);f.advance(1);assert.equal(f.el('ccCover').open,true);});
 await test('editor input still counts when its handler stops bubbling',async()=>{const f=fixture();await f.start();f.advance(400000);f.emit('input',true);f.advance(60000);assert(f.hasWork(),'Stopped editor input did not restart timer');assert.equal(f.el('ccCover').open,false);});
 await test('returning from another app during the extra five minutes retains work',async()=>{const f=fixture();await f.start();f.jump(240000);f.emit('visibilitychange');assert(f.hasWork());assert.equal(f.el('ccCover').open,false);});
 await test('returning after expiry clears work even when background timers were suspended',async()=>{const f=fixture();await f.start();f.jump(450000);f.emit('visibilitychange');assert.equal(f.hasWork(),false);});
 await test('Continue at the expiry boundary cannot revive an expired request',async()=>{const f=fixture();await f.start();f.advance(420000);f.jump(30000);f.el('ccContinue').onclick();assert.equal(f.hasWork(),false);});
 await test('late input cannot revive an expired request',async()=>{const f=fixture();await f.start();f.jump(450000);f.emit('input');assert.equal(f.hasWork(),false);});
 for(const mode of ['preview','live','sea_trial'])await test(mode+' expired capture cannot let the old input repopulate the new customer',async()=>{const f=fixture(mode);await f.start();f.jump(mode==='preview'?450000:150000);f.emit('input',false,'ccName','Secret Previous Customer');assert.equal(f.flow().state().request.customer.name,'');});
 await test('incidental input does not dismiss the Continue warning',async()=>{const f=fixture();await f.start();f.advance(420000);f.emit('input');assert.equal(f.el('ccCover').open,true);f.advance(30000);assert.equal(f.hasWork(),false);});
 for(const mode of ['live','sea_trial'])await test(mode+' keeps the server-compatible warning and expiry',async()=>{const f=fixture(mode);await f.start();f.advance(119999);assert.equal(f.el('ccCover').open,false);f.advance(1);assert.equal(f.el('ccCover').open,true);f.advance(29999);assert(f.hasWork());f.advance(1);assert.equal(f.hasWork(),false);});
 await test('a public preview query without an Engine launch cannot start a session',()=>{const f=fixture('forged');assert.equal(f.el('ccBegin').onclick,undefined);assert.match(f.el('ccApp').innerHTML,/Preview ended/);});
 await test('Finish session immediately clears work and cancels the old warning',async()=>{const f=fixture();await f.start();await f.el('ccExit').onclick();assert.equal(f.hasWork(),false);f.advance(450000);assert.equal(f.el('ccCover').open,false);});
 console.log(`LONGWATCH IDLE: ${passed} passed, ${failed} failed`);process.exitCode=failed?1:0;
})();

module.exports={fixture};
