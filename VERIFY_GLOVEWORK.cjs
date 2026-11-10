// Render a catch through the shipped Harbor Sluggers game entry points.
// Compare visibility of the field to the actual out and next-play times.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const pack=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json'));
const script=[...pack.player.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('function createNinth('));
function create(level,random,manual=false){
 const images=[];
 class Picture{constructor(){this.naturalWidth=1536;this.complete=true;images.push(this);}}
 const math=Object.create(Math);math.random=()=>random;
 const env={Math:math,Image:Picture,window:{games:{}}};
 vm.runInNewContext(script.replace('window.games.sluggers=', 'window.baseballImages={park:ninthField,fielders:broadcastDefense};window.games.sluggers='),env);
 let hud='',end=null,labels=[],replay=null;
 const g=env.window.games.sluggers.create({manualPitches:manual,replay:r=>replay=r,hud:x=>hud=x,end:(...v)=>end=v,controls:x=>labels=x,tone(){},crowd(){}},level);
 const tick=()=>g.update(1/120);
 const advance=n=>{for(let i=0;i<n;i++)tick();};
 function until(test){for(let i=0;i<5000;i++){if(test())return i;tick();}throw Error(hud);}
 const traces=[];
 const ctx=new Proxy({drawImage(img,...args){traces.push([img,args]);},font:'',measureText:s=>({width:s.length*4}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(t,k)=>k in t?t[k]:()=>{}});
 function field(){traces.length=0;g.draw(ctx);return traces.some(x=>x[0]===env.window.baseballImages.park);}
 return {g,hud:()=>hud,end:()=>end,labels:()=>labels,advance,until,field,ctx,replay:()=>replay};
}
function routineFly(x){
 const a=create(4,.55);a.g.pointer('down',x,188);
 a.g.input('swing',true);a.advance(86);a.g.input('swing',true);
 const before=a.until(()=>a.hud().includes('Fly ball'));
 assert(before>=85&&before<=89,'Fastball keeps its original travel time');
 const out=a.until(()=>a.hud().includes('Flyout to'));
 assert(out>=209&&out<=212,'Out recorded on the original frame');
 assert(a.field(),'Keep the outfield camera on the completed catch');
 a.advance(80);assert(a.field(),'Hold the outfield for at least two-thirds of a second');
 const ready=a.until(()=>a.labels()[0].label==='Start pitch');
 assert(ready+80>=185&&ready+80<=188,'Ready for the next pitch on original frame');assert(!a.field());
 return a.hud();
}
// Vega is looking fastball, so a hittable strike produces a fly ball.
for(const x of [421,387])assert.match(routineFly(x),/1 out/);
console.log('PASS left and right catches visible through possession, original unaltered pitching clock');

for(const level of [0,1,2,3]){
 const a=create(level,.55,true);
 a.until(()=>a.labels()[0]?.label==='Next pitch');
 const saved=a.hud(),film=a.replay();
 assert.equal(film.label,'Replay pitch');
 for(let i=0;i<45;i++)film.draw(a.ctx,film.duration*i/44);
 a.advance(1200);assert.equal(saved,a.hud());assert.equal(a.end(),null);
 const resumeId='swing';a.g.input(resumeId,true);
 assert.notEqual(a.labels()[0]?.label,'Next pitch');
 a.until(()=>a.hud()!==saved);assert(!a.end());
}
console.log('PASS all four batting entries wait indefinitely, replay the delivery and advance once on demand');
const a=create(4,.55);a.g.pointer('down',421,188);a.g.input('swing',true);a.advance(86);a.g.input('swing',true);
a.until(()=>a.hud().includes('Flyout'));const h=a.hud(),film=a.replay();assert.equal(film.label,'Replay catch');
for(let i=0;i<190;i++)film.draw(a.ctx,film.duration*i/189);
assert.equal(h,a.hud());assert.equal(a.end(),null);
console.log('PASS catch replay renders the original play independently of the simulation');
const visual={Math,Image:class{},window:{games:{}}};
vm.runInNewContext(script.replace('window.games.sluggers=','window.makeFly=makeFly;window.pose=catchPose;window.wall=turfLimit;window.games.sluggers='),visual);
for(const side of [-1,1])for(const depth of [0,.25,.5,.75,1]){
 const shot=visual.window.makeFly(side,depth,[false,true,false],1.75), planted=visual.window.pose(shot,1,0);
 for(let i=0;i<=240;i++){
  const t=i/240,s=visual.window.pose(shot,t,0);
  assert(s.feet[1]>visual.window.wall(s.feet[0])+5);
  if(t>=.71)assert.deepEqual([...s.feet],[...planted.feet]);
 }
 for(const t of [0,.1,.2,.5,.8])assert.deepEqual([...visual.window.pose(shot,1,t).feet],[...planted.feet]);
 assert(planted.pocket[1]<planted.feet[1]-planted.h*.80&&planted.pocket[1]>planted.feet[1]-planted.h);
}
console.log('PASS grass, plant and glove-height geometry across ten routes and 2,410 flight samples');
