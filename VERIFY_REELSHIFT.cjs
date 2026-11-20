'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player;
const ctx=vm.createContext({});
for(const [,id,source] of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)){
 const script=new vm.Script(source);
 if(id==='rules'||id==='cabinet-model')script.runInContext(ctx);
}
const C=ctx.ReelCabinet,R=ctx.BrasslineRules;
let seed=19827;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const vault=C.create('vault');
assert.equal(vault.phase,'ready');C.land(vault);C.nudge(vault,{reel:0,dir:'up'});assert.equal(vault.score,0);
C.spin(vault,random);assert.equal(vault.phase,'spinning');C.land(vault);assert.equal(vault.phase,'spinning');
C.stop(vault);C.stop(vault);assert.equal(vault.phase,'braking');C.land(vault);
assert.deepEqual(Array.from(R.line(vault.board)),['K','K','J']);
assert.equal(vault.phase,'nudge');C.nudge(vault,{reel:0,dir:'down'});assert.equal(vault.phase,'nudge');
C.nudge(vault,{reel:2,dir:'down'});assert.equal(vault.win,25);
assert.equal(vault.score,25);C.land(vault);C.nudge(vault,{reel:2,dir:'down'});assert.equal(vault.score,25);
for(const id of Object.keys(R.games))for(const level of [1,2,3]){
 const s=C.create(id);s.nextLevel=level;let total=0,landed=0,empty=0,nudges=0,reads=0;
 for(let i=0;i<81;i++){
  C.spin(s,random);assert.equal(s.phase,'spinning');assert.equal(s.spins,i+1);const board=s.board;
  C.spin(s,random);assert.equal(s.board,board);C.stop(s);assert.equal(s.phase,'braking');C.land(s);
  const direct=R.award(id,R.line(board))*level,opts=R.moves(id,board,level),top=Math.max(...opts.map(m=>m.value));
  if(direct){landed++;total+=direct;assert.equal(s.outcome,'landed');}
  else if(!top){empty++;assert.equal(s.outcome,'empty');}
  else{
   nudges++;assert.equal(s.phase,'nudge');
   const best=opts.find(m=>m.value===top);
   const choice=i%4===0?null:i%4===1?opts.find(m=>m.reel===best.reel&&m.dir!==best.dir):best;
   s.help=i%5===0;C.nudge(s,choice);
   if(!s.help)reads++;
   total+=choice?.value||0;
  }
  assert.equal(s.phase,'settled');assert.equal(s.score,total);assert.equal(s.attempts,reads);
  C.land(s);C.nudge(s,null);assert.equal(s.score,total);
 }
 assert.ok(landed&&empty&&nudges,id);
}
console.log('1,215 cabinet spins checked across all five games and three levels, plus the opening kings, optional moves, stop guards and exact-once scoring.');
