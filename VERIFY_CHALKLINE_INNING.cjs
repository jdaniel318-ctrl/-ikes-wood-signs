// Deterministic at-bats exercise the initially occupied second base through real input.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const player=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json')).player;
const text=[...player.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(s=>s.includes('function createNinth('));
const key='return {update,draw,input(id,down){\n      if(!down||';
const moduleText=text.replace(key,'return {read:()=>({phase,age,pitch,play,call,feedback,occupied,runs,outs,strikes}),update,draw,input(id,down){\n      if(!down||');assert.notEqual(text,moduleText);
function testPitch(side,location,height,offset=0,opening=null){
 const seq=[.55,.55,.5];
 function pickPitch(){seq.push(.02,side,.99,location,height);}
 if(opening==='twoOut')for(let n=0;n<3;n++)seq.push(.02,.55,.99,0,.5);
 pickPitch();
 const math=Object.create(Math);math.random=()=>seq.length?seq.shift():.55;
 const env={Math:math,Image:class{},window:{games:{}}};vm.runInNewContext(moduleText,env);
 const game=env.window.games.sluggers.create({hud(){},tone(){},controls(){},end(){}},3);
 const state=game.read;
 function until(fn){for(let n=0;n<4800&&!fn(state());n++)game.update(1/240);assert(fn(state()),JSON.stringify(state()));}
 function take(){until(s=>s.phase==='pitch');until(s=>s.phase!=='pitch');}
 take();if(opening==='twoOut'){take();take();take();}
 until(s=>s.phase==='pitch');until(s=>s.age>=(1+offset)*s.pitch.speed-.12);game.input('swing',true);
 until(s=>s.phase!=='pitch');return {state,until};
}
for(const [side,name] of [[.1,'pulled to left'],[.9,'driven to right']]){
 const a=testPitch(side,.97,.45,side<.5?-.035:.035);const p=a.state().play;
 assert.equal(p?.kind,'double',name+' should split the gap');assert.equal(Math.sign(p.landing[0]-240),side<.5?-1:1);
 a.until(s=>s.phase==='call');assert.equal(a.state().runs,3);assert.deepEqual([...a.state().occupied],[false,true,false]);
 console.log('PASS '+name+' for two bases, runner scores once');
}
for(const [side,isSafe] of [[.9,false],[.1,true]]){
 const a=testPitch(side,.72,.96);assert.equal(a.state().play?.kind,'ground');
 a.until(s=>s.phase==='firstThrow');assert.equal(a.state().outs,1);assert.equal(a.state().play.safe,isSafe);
 a.until(s=>s.phase==='call');assert.equal(a.state().outs,isSafe?1:2);assert.deepEqual([...a.state().occupied],[isSafe,true,false]);
 assert.equal(a.state().runs,2);console.log('PASS clocked pickup and throw across diamond, batter '+(isSafe?'safe':'out'));
}
const end=testPitch(.9,.72,.96,0,'twoOut');end.until(s=>s.phase==='call');assert.equal(end.state().outs,3);assert.equal(end.state().runs,2);console.log('PASS third out at first ends the threat');
const foul=testPitch(.45,.4,.4,-.19);assert.equal(foul.state().call,'Foul ball');assert(foul.state().feedback.foulSide<0);console.log('PASS early foul travels toward the third-base side');
