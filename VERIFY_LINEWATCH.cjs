'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=JSON.parse(fs.readFileSync(__dirname+'/brassline.ship.json')).player,ctx=vm.createContext({});
for(const [,id,src] of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)){
  const script=new vm.Script(src);if(id==='rules'||id==='cabinet-model')script.runInContext(ctx);
}
const C=ctx.ReelCabinet,R=ctx.BrasslineRules;
const spin=(s)=>{C.spin(s);assert.equal(s.phase,'spinning');C.stop(s);C.land(s);assert.equal(s.phase,'nudge');};
const expected=[[1,'up',10],[1,'up',40],[0,'down',20]];
for(const [i,[reel,dir,value]] of expected.entries()){
  for(const level of [1,2,3])for(const choice of [0,1,2,3,4,5,null]){
    const s=C.create('vault',i);s.nextLevel=level;spin(s);
    const available=R.moves('vault',s.board,level);
    assert.equal(available.filter(m=>m.value>0).length,1);
    const best=available.find(m=>m.value>0);assert.deepEqual([best.reel,best.dir,best.value],[reel,dir,value*level]);
    C.openFeature(s);assert.equal(s.feature,null);
    C.nudge(s,choice===null?null:available[choice]);
    const points=choice===null?0:available[choice].value;
    assert.equal(s.score,points);assert.equal(s.phase,'settled');
    C.nudge(s,best);assert.equal(s.score,points);
    C.openFeature(s);C.openFeature(s);
    if(i===2 && points){
      assert.deepEqual(Array.from(s.feature.lines,m=>m.value),[20*level,20*level,15*level,0,0]);
      assert.equal(s.score,points+55*level);
    }else assert.equal(s.feature,null);
  }
}
assert.ok(html.includes('id="raiseRow"'));assert.ok(html.includes('id="lowerRow"'));
console.log('Three filmed reads adapted to practice. All six choices, pass, levels, one-move limit and five-line totals verified.');
