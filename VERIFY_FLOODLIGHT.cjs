// Play both routes using the packaged game's controls. Only this synthetic test exposes observations.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const cart=JSON.parse(fs.readFileSync(path.join(__dirname,'fleet-arcade.ship.json')));
const code=cart.player.match(/<script>([\s\S]*?)<\/script>/)[1];
const entry='  updateHud();\n  return {input,pointer,update,draw};';
assert.equal(code.split(entry).length,2);
const fixture=`api.read=()=>({x:hero.x,y:hero.y,bx:buddy.x,by:buddy.y,phase,time,goal:goal(),fullMap,signal,cooldown,captures,guard:{...guard},done,grid,departure,stepDistance:hero.travel||0,deck:buddy.deckHeight||0});
api.bump=()=>{Object.assign(guard,hero);guardTarget='';grace=0;};`;
const env={window:{},Image:class{},Path2D:class{},structuredClone};
vm.runInNewContext(code.replace(entry,fixture+entry),env);
const game=env.window.games.nightsignal;
assert.deepEqual(Array.from(game.levels),['Cobra Relay Station','Floodlight Quay']);
function setup(){
 const results=[],feedback=[],labels=[],saved=[];
 const api={recordClear:s=>saved.push(s),hud:s=>feedback.push(s),end:(...x)=>results.push(x),tone(){},controls:items=>labels.push(...items)};
 const g=game.create(api,1);
 const step=(n)=>{for(let i=0;i<n;i++)g.update(1/60);};
 const drag=(dx,dy)=>{g.pointer('down',120,100);g.pointer('move',120+dx,100+dy);};
 const tap=id=>{g.input(id,true);g.input(id,false);};
 return {g,read:api.read,step,drag,tap,results,feedback,labels,saved,bump:api.bump};
}
const a=setup(),begin=a.read();a.drag(20,-20);a.step(9);a.g.pointer('up',140,80);
const diag=a.read();assert.ok(diag.x>begin.x+.2&&diag.y<begin.y-.2);a.step(4);assert.equal(a.read().x,diag.x);assert.equal(a.read().stepDistance,diag.stepDistance);assert.ok(diag.stepDistance>0);
a.tap('decoy');assert.ok(a.read().signal);const t=a.read().time;a.tap('map');a.step(100);assert.equal(a.read().time,t);a.tap('map');a.step(430);assert.equal(a.read().cooldown,0);
assert.ok(a.labels.some(o=>o.label==='Ready in 7s'));
a.g.input('left',true);a.step(200);a.g.input('left',false);assert.ok(a.read().x>=1.18);
a.bump();a.step(1);assert.equal(a.read().captures,1);assert.equal(a.read().phase,0);assert.equal(a.read().bx,17.7);
for(const alternate of [false,true]){
 const r=setup();
 function go(x,y){
   for(let i=0;i<900;i++){
     const s=r.read(), dx=x-s.x,dy=y-s.y;
     if(Math.hypot(dx,dy)<.07||s.departure){r.g.pointer('up',0,0);return;}
     const n=Math.hypot(dx,dy);r.drag(dx/n*24,dy/n*24);r.step(1);
   }
   throw Error('Stuck on route to '+[x,y]+' after phase '+r.read().phase+' at '+[r.read().x,r.read().y]);
 }
 if(alternate){go(1.8,12);go(1.8,3.6);}else{go(6.5,12);go(6.5,4.4);}
 go(3.1,3.6);assert.equal(r.read().phase,1);
 if(alternate){r.bump();r.step(1);assert.equal(r.read().phase,1);r.step(65);}
 go(3.1,1.55);go(17.7,1.55);go(17.7,3.4);assert.equal(r.read().phase,2);
 if(!alternate){r.bump();r.step(1);assert.equal(r.read().phase,2);r.step(65);}
 r.tap('decoy');go(19.45,3.4);go(19.45,12.75);go(17.8,12.7);
 for(let n=0;n<180&&!r.read().departure;n++)r.step(1);
 const landing=r.read();assert.ok(landing.departure);assert.ok(Math.hypot(landing.bx-17.8,landing.by-12.7)<1.3);
 assert.equal(r.saved.length,1);assert.equal(r.results.length,0);
 r.tap('map');r.tap('decoy');r.step(85);
 assert.equal(r.read().time,landing.time);assert.equal(r.read().fullMap,false);assert.ok(r.read().deck>=.32);
 assert.equal(r.results.length,0);r.step(100);
 assert.ok(r.read().done);assert.equal(r.results.length,1);assert.equal(r.results[0][0],true);
 assert.match(r.results[0][1],/Duke aboard at Pier 4/);assert.ok(r.read().bx>20);assert.equal(r.results[0][2],r.saved[0]);assert.equal(r.saved[0],Math.max(600,8000-Math.floor(landing.time)*18-landing.captures*250));
 r.step(100);assert.equal(r.results.length,1);
}
console.log('PASS Floodlight free movement, wall collision, map pause, decoy cooldown, alternative routes, saved checkpoints and escort extraction.');
const host=fs.readFileSync(path.join(__dirname,'fun_program.js'),'utf8'),store=new Map();
const records=vm.runInNewContext(host.slice(host.indexOf('const arcadeGames ='),host.indexOf('function lanternCleared('))+
  ';({arcadeRecords,saveArcadeRecord})',{window:{navigator:{}},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},lanternAccess:r=>r.allowed});
const run=(scope,allowed=true)=>({allowed,who:{context:{scope}},canSave:true});
const training=run('test-harbor'),msg=(level,score)=>({type:'arcade-clear',id:'nightsignal',level,score});
for(const [level,score] of [[0,5118],[1,7700],[1,6000],[2,9999]])records.saveArcadeRecord(training,msg(level,score));
records.saveArcadeRecord(run('other',false),msg(1,9000));
const r=records.arcadeRecords(training);assert.equal(r['nightsignal.0'].best,5118);assert.equal(r['nightsignal.1'].best,7700);
assert.equal(r['nightsignal.2'],undefined);assert.equal(Object.keys(records.arcadeRecords(run('other'))).length,0);
