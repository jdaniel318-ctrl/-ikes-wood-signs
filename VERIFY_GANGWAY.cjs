'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bridge = fs.readFileSync(path.join(__dirname, 'carvewright_fleet.js'), 'utf8');

function fixture() {
  let route = 4, options, startedAt = 1, reusable = true;
  const elements = new Map(), listeners = new Map(), visits = [];
  function element(id) {
    const classes = new Set();
    const e = {id,isConnected:true,dataset:{},getAttribute:()=>null,querySelector:()=>null,
      addEventListener(){},classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)}};
    elements.set(id,e); return e;
  }
  const deck = element('admiralDeck'), fleet = element('bootstrapFleet');
  deck.classList.add('hidden');
  const document = {getElementById:id=>elements.get(id),addEventListener(){}};
  const w = {document,location:{href:'https://shop.invalid/'},URL,
    MutationObserver:class {observe(){} disconnect(){}},setInterval:()=>1,clearInterval(){},
    addEventListener(type,fn){listeners.set(type,fn);},
    DarkSkyFleetNavigator:{state:()=>({generation:route})},
    BlackFlagV3Identity:{productionAuth:{readClientConfig:()=>({url:'https://identity.invalid',publishableKey:'fixture'})}},
    DarkSkySupabase:{create:()=>({readSession:()=>({user:{id:'fixture-user'}}),verifyAdmiralAuthority:()=>w.verify()})},
    DarkSkyAdmiralSession:{status:()=>({reusable,startedAt})},
    DarkSkyLeaveFleetForCarvewright(){fleet.classList.add('hidden');return true;},
    DarkSkyOpenAdmiralGate(source,target){route++;visits.push(target);},
    DarkSkyOpenFleetWatchtower(o){visits.push(o.focusProgram);},DarkSkyReturnToEngine(){visits.push('engine');},
    verify:async()=>true,CarvewrightApp:{open(o){assert.ok(o.guard());options=o;return true;},close(force){options?.onClose(force);},isOpen(){return !!options;}}};
  w.window=w; vm.runInNewContext(bridge,w);
  return {w,visits,deck,fleet,options:()=>options,expire(){reusable=false;},
    routeAway(){route++;listeners.get('darksky:command-route')();},
    emitEnded(){listeners.get('darksky:admiral-session-ended')();},
    finish(t){deck.classList.remove('hidden');return w.CarvewrightFleet.finishPassage(t);}};
}
(async()=>{
  for(const origin of ['fleet','engine']){
    const f=fixture(),b=f.w.CarvewrightFleet;
    if(origin==='engine')f.fleet.classList.add('hidden');
    assert.equal(b.requestOpen(),true); assert.equal(b.requestOpen(),false);
    const target=origin==='fleet'?'carvewright-fleet':'carvewright';
    assert.deepEqual(f.visits,[target]);
    f.emitEnded(); // a new sign-in can end the previous session while still on the gate
    assert.equal(await f.finish(target),true);
    assert.equal(f.options().returnTo,origin);
    assert.equal(f.options().scope.businessId,'carvewright');
    f.options().onClose(false);
    assert.deepEqual(f.visits,[target,origin==='fleet'?'carvewright':'engine']);
  }
  for(const expired of [false,true]){
    const f=fixture(),b=f.w.CarvewrightFleet;b.requestOpen();if(expired)f.expire();
    assert.equal(b.cancelPassage(),true);
    assert.deepEqual(f.visits,['carvewright-fleet',expired?'fleet-programs':'carvewright']);
    assert.equal(await f.finish('carvewright-fleet'),false);assert.equal(f.options(),undefined);
  }
  const wrong=fixture();wrong.w.CarvewrightFleet.requestOpen();wrong.routeAway();
  assert.equal(await wrong.finish('carvewright-fleet'),false);
  const denied=fixture();denied.w.verify=async()=>false;denied.w.CarvewrightFleet.requestOpen();
  assert.equal(await denied.finish('carvewright-fleet'),false);assert.equal(denied.options(),undefined);
  const late=fixture();let answer;late.w.verify=()=>new Promise(r=>{answer=r;});
  late.w.CarvewrightFleet.requestOpen();const opening=late.finish('carvewright-fleet');
  late.emitEnded();answer(true);assert.equal(await opening,false);assert.equal(late.options(),undefined);
  const ended=fixture();ended.w.CarvewrightFleet.requestOpen();await ended.finish('carvewright-fleet');ended.emitEnded();
  assert.deepEqual(ended.visits,['carvewright-fleet']);
  console.log('PASS Carvewright launch, return, cancellation, duplicate activation, route change and verification lifecycle');
})().catch(e=>{console.error(e);process.exitCode=1;});
