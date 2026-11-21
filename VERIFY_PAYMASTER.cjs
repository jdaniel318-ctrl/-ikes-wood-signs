'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm');
const page=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player;
const scripts=Object.fromEntries([...page.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)].map(m=>[m[1],m[2]]));
const ctx=vm.createContext({});
for(const name of ['rules','cabinet-model','bonus-model'])vm.runInContext(scripts[name],ctx);
const C=ctx.ReelCabinet,R=ctx.BrasslineRules,B=vm.runInContext('BrassBonus',ctx);
const board=['ALAKH','AKWJA','AKJAL']; // iPad's final three visible rows
function recorded(level){
  const s=C.create('vault');s.nextLevel=level;
  assert.equal(C.balance(s),500);
  assert.ok(C.paidSpin(s));assert.equal(C.balance(s),500-10*level);assert.ok(!C.paidSpin(s));
  s.board=board;C.stop(s);C.land(s);
  assert.equal(s.phase,'nudge');
  const wins=R.moves('vault',board,level).filter(m=>m.value);
  assert.equal(wins.length,1);assert.equal(wins[0].reel,2);assert.equal(wins[0].dir,'up');assert.equal(wins[0].value,30*level);
  return s;
}
for(const level of [1,2,3]){
 const s=recorded(level);C.nudge(s,{reel:2,dir:'up'});C.nudge(s,{reel:2,dir:'up'});
 assert.equal(C.balance(s),500+20*level);assert.equal(s.win,30*level);assert.ok(B.earn(s));
 s.nextLevel=level===3?1:3;s.level=s.nextLevel;
 const b=B.begin('mint',s);assert.equal(b.level,level);
 for(let i=0;i<3;i++){B.wave(b,()=>0);B.take(b,b.sequence.indexOf(25*level));}
 assert.ok(B.finish(b));assert.ok(!B.finish(b));assert.equal(s.lastBonusWin,75*level);
 assert.equal(C.balance(s),500+95*level);
 const pass=recorded(level);assert.ok(C.paidSpin(pass));assert.equal(pass.wagered,20*level);
 assert.equal(pass.phase,'spinning');assert.equal(pass.score,0);
}
const poor=recorded(1);poor.wagered=500;const spin=poor.spins;
assert.ok(!C.paidSpin(poor));assert.equal(poor.phase,'nudge');assert.equal(poor.spins,spin);
poor.topUps+=500;assert.equal(C.balance(poor),500);assert.ok(C.paidSpin(poor));assert.equal(C.balance(poor),490);
const vault=C.create('vault');vault.keys=3;vault.wagered=500;vault.vaultLevel=2;vault.nextLevel=3;
assert.equal(C.nextCost(vault),0);assert.ok(C.paidSpin(vault,()=>0));assert.equal(vault.level,2);assert.equal(C.balance(vault),0);
C.stop(vault);C.land(vault);assert.equal(C.balance(vault),vault.feature.total);assert.ok(B.earn(vault));assert.ok(!B.earn(vault));
assert.ok(B.ready(vault,'dial'));assert.ok(!B.ready(vault,'mint'));
function runDial(s,offset){
 const b=B.begin('dial',s);
 for(let i=0;i<3;i++){
   assert.ok(B.wave(b,()=>.5));assert.ok(!B.take(b,-1));
   assert.ok(B.take(b,b.target+offset));assert.ok(!B.take(b,b.target));
 }
 assert.ok(B.finish(b));return b;
}
const extra=runDial(vault,0);assert.equal(extra.points,150);assert.equal(vault.lastBonusWin,150);
const saved=C.balance(vault),ex=runDial(vault,7);assert.equal(ex.points,30);assert.equal(ex.ranked,false);assert.equal(C.balance(vault),saved);
assert.equal(runDial(vault,30).points,0);
const field=C.create('vault',0);C.paidSpin(field);assert.equal(field.wagered,0);
console.log('PASS recorded right-reel nudge at all three bets, skip, insufficient funds, refill, exact-once charges, free vault, locked bonus rates and dial awards.');
