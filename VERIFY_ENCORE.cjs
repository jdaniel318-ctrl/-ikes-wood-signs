'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=name=>JSON.parse(fs.readFileSync(__dirname+'/'+name));
const html=read('brassline.ship.json').player,ctx=vm.createContext({});
const scripts=new Map([...html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)].map(m=>[m[1],m[2]]));
for(const k of ['rules','cabinet-model','bonus-model'])vm.runInContext(scripts.get(k),ctx);
for(const code of scripts.values())new vm.Script(code);
const C=ctx.ReelCabinet,R=ctx.BrasslineRules,B=vm.runInContext('BrassBonus',ctx);
const ids=Object.keys(R.games),names=new Set();let completed=0;
assert.equal(ids.length,6);assert.deepEqual(Object.keys(B.themes).sort(),ids.sort());
assert.match(html,/<main hidden class="machine"/);assert.match(html,/id="lobby"/);
assert.ok(!html.includes('id="bonusesOpen"') && !html.includes('More bonus games') && !html.includes('Play exhibition'));
assert.ok(scripts.get('game').trim().endsWith('openLobby();\n})();'));assert.match(read('fleet-arcade.ship.json').player,/aria-label="Play Brassline"/);
for(const id of ids){
 for(const [index,kind] of ['mint','signal','dial'].entries()){
  names.add(B.themes[id].titles[index]);
  for(const level of [1,2,3]){
   const s=C.create(id);s.nextLevel=level;assert.ok(C.paidSpin(s));
   const strips=C.stripsFor(id);
   // Find a reachable ordinary board that enters nudge; choose an actual winning move.
   outer:for(let a=0;a<strips[0].length;a++)for(let b=0;b<strips[1].length;b++)for(let c=0;c<strips[2].length;c++){
    const board=C.boardAt(id,[a,b,c]);if(!R.award(id,R.line(board))&&R.moves(id,board).some(m=>m.value)){s.board=board;break outer;}
   }
   C.stop(s);C.land(s);assert.equal(s.phase,'nudge');
   C.nudge(s,R.moves(id,s.board,level).find(m=>m.value));assert.ok(s.win>0);
   const before=C.balance(s);
   const draws=[0,(index+.5)/3];assert.ok(B.earn(s,()=>draws.shift()));assert.ok(!B.earn(s));s.nextLevel=4-level;
   const feature=B.begin(s);assert.equal(feature.title,B.themes[id].titles[index]);assert.equal(feature.kind,kind);assert.equal(feature.level,level);
   assert.equal(B.begin(s),null);assert.ok(!B.finish(feature));
   for(let r=0;r<3;r++){
    assert.ok(B.wave(feature,()=>.42));assert.ok(!B.wave(feature));
    if(kind==='mint')B.take(feature,feature.sequence.indexOf(25*level));
    if(kind==='signal'){feature.phase='choose';for(const step of feature.sequence)B.take(feature,step);}
    if(kind==='dial')B.take(feature,feature.target);
    assert.equal(feature.phase,'between');assert.ok(!B.take(feature,0));
   }
   assert.ok(B.finish(feature));const expected=(kind==='signal'?90:75)*level;
   assert.equal(C.balance(s),before+expected);assert.equal(s.lastBonusWin,expected);assert.ok(!B.finish(feature,true));assert.equal(B.begin(s),null);assert.ok(!B.earn(s));completed++;
  }
 }
 const line=C.create(id);
 function lineWin(){assert.ok(C.paidSpin(line));Object.assign(line,{phase:'settled',win:25,outcome:'landed'});}
 lineWin();
 assert.ok(!B.earn(line,()=>.8));assert.ok(!B.earn(line,()=>0));lineWin();assert.ok(B.earn(line,()=>0));
 const other=C.create(id);assert.equal(B.begin(other),null);
 const partial=B.begin(line);B.wave(partial);B.take(partial,0);assert.ok(B.finish(partial,true));assert.equal(line.lastBonusWin,partial.points);assert.ok(!B.finish(partial,true));assert.equal(B.begin(line),null);
 for(const reason of ['empty','passed','nudged']){
  const failed=C.create(id);Object.assign(failed,{phase:'settled',outcome:reason,spins:1,win:0});assert.equal(B.earn(failed),false);
 }
}
assert.equal(names.size,18);assert.equal(completed,54);
console.log('PASS six playable cabinets, eighteen distinct draws at three bets, one-time banking, early exit, no rerolls, and six isolated balances.');
