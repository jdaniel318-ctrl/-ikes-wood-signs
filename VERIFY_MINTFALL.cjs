'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const doc=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player,ctx=vm.createContext({});
for(const [,id,source] of doc.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)){
  const code=new vm.Script(source);
  if(['rules','cabinet-model','bonus-model'].includes(id))code.runInContext(ctx);
}
const C=ctx.ReelCabinet,R=ctx.BrasslineRules,B=vm.runInContext('BrassBonus',ctx);
for(const id of Object.keys(R.games)){
  const strips=C.stripsFor(id), buckets={empty:0,nudge:0,landed:0}, first={};
  for(let a=0;a<strips[0].length;a++)for(let b=0;b<strips[1].length;b++)for(let c=0;c<strips[2].length;c++){
    const stops=[a,b,c],board=C.boardAt(id,stops);
    const category=R.award(id,R.line(board))?'landed':R.moves(id,board).some(m=>m.value)?'nudge':'empty';
    buckets[category]++;first[category]??=stops;
  }
  console.log(id,JSON.stringify(buckets));
  for(const [type,stops] of Object.entries(first)){
    const s=C.create(id);let i=0;C.spin(s,()=>{const j=i++;return (stops[j]+.5)/strips[j].length;});assert.equal(i,3);
    assert.deepEqual([...s.stops],stops);C.stop(s);C.land(s);assert.equal(s.outcome||s.phase,type);
  }
  assert.deepEqual(Object.keys(first).sort(),['empty','landed','nudge']);
}
function win(s,spin=1){Object.assign(s,{phase:'settled',outcome:'nudged',win:25,spins:spin});}
const pig=C.create('vault'),pirate=C.create('pirate');win(pig);
assert.ok(B.earn(pig,()=>0));assert.ok(!B.earn(pig));assert.ok(!B.ready(pirate));
const b=B.begin(pig);
for(let n=0;n<3;n++){assert.ok(B.wave(b));assert.ok(B.take(b,b.sequence.indexOf(25)));assert.ok(!B.take(b,2));}
assert.ok(B.finish(b));assert.equal(pig.score,75);assert.ok(!B.finish(b));assert.equal(pig.keys,0);assert.ok(!B.ready(pig));assert.ok(!B.earn(pig));
assert.equal(B.begin(pirate),null);
win(pirate);assert.ok(B.earn(pirate,()=>.5));const test=B.begin(pirate);
for(let n=0;n<3;n++){B.wave(test,()=>0);test.phase='choose';if(n===0)B.take(test,2);else for(const i of test.sequence)B.take(test,i);}
assert.ok(B.finish(test));assert.equal(test.points,75);assert.equal(pirate.score,75);assert.equal(B.begin(pirate),null);
win(pirate,2);assert.ok(B.earn(pirate));const next=B.begin(pirate);B.wave(next);
assert.ok(B.ready(pirate));assert.ok(!B.finish(next));assert.ok(B.finish(next,true));assert.equal(B.begin(pirate),null);
assert.ok(!B.earn(C.create('harbor')));console.log('All reel stops plus earned awards, independent cabinet accounts and single-use features passed.');
