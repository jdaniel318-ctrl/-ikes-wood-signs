'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player;
const ctx=vm.createContext({});
for(const [_,id,src] of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)){
 const unit=new vm.Script(src);if(id==='rules'||id==='cabinet-model')unit.runInContext(ctx);
}
const R=ctx.BrasslineRules,C=ctx.ReelCabinet;
const paths=[[0,0,0],[1,1,1],[2,2,2],[0,1,2],[2,1,0]];
let seed=77;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const awardKey=(s,nudge)=>{
 C.spin(s,random);s.board=nudge?['AHHLH','AHHLH','ALAHH']:['AHHLH','AHHLH','ALHLH'];C.stop(s);C.land(s);
 if(nudge)C.nudge(s,{reel:2,dir:'up'});
};
const unique=new Set();
for(let i=0;i<120;i++){
 const s=C.create('vault');s.nextLevel=(i%3)+1;
 for(let k=0;k<3;k++){awardKey(s,k%2===0);assert.equal(s.keys,k+1);const score=s.score;C.land(s);C.nudge(s,null);assert.equal(s.score,score);assert.equal(s.keys,k+1);}
 const earned=s.level,score=s.score;s.nextLevel=earned===3?1:3;C.spin(s,random);const board=s.board;unique.add(board.join(''));
 assert.ok(s.vaultSpin);assert.equal(s.keys,0);assert.equal(s.level,earned);C.spin(s);assert.equal(s.board,board);
 C.stop(s);C.land(s);const strips=R.visible(board),values=paths.map(path=>R.award('vault',path.map((row,reel)=>strips[reel][row]))*earned);
 const total=values.reduce((a,b)=>a+b);
 assert.deepEqual(Array.from(s.feature.lines,l=>l.value),values);assert.ok(total>0);assert.equal(s.win,total);assert.equal(s.score,score+total);
 C.land(s);C.nudge(s,null);C.openFeature(s);assert.equal(s.score,score+total);
 C.spin(s,random);assert.ok(!s.vaultSpin);assert.equal(s.level,s.nextLevel);assert.equal(s.feature,null);
}
assert.ok(unique.size>100);
for(const game of Object.keys(R.games).filter(id=>id!=='vault')){const s=C.create(game);for(let k=0;k<4;k++)awardKey(s,false);assert.equal(s.keys,0);}
for(const pick of [null,{reel:0,dir:'up'}]){const s=C.create('vault');C.spin(s);s.board=['AHKAH','AWKHL','AKJLA'];C.stop(s);C.land(s);C.nudge(s,pick);assert.equal(s.keys,0);}
const f=C.create('vault',0);C.spin(f);C.stop(f);C.land(f);C.nudge(f,{reel:1,dir:'up'});assert.equal(f.keys,0);
const visible=html.split('<body>')[1].split('</main>')[0];assert.ok(!visible.includes('Training circuit'));assert.ok(visible.includes('id="rightPlay"'));
console.log('120 earned vault spins, locked level, independent five-line totals, exact-once awards, other cabinets and field isolation verified.');
