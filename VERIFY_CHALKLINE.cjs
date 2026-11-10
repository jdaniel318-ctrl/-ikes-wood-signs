const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const {createCanvas,Image}=require('@napi-rs/canvas');
const player=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json')).player;
const mod=[...player.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('function createNinth('));
const read=[], math=Object.create(Math);let seq=[];
math.random=()=>seq.length?seq.shift():.55;
class Img extends Image{set src(value){read.push(new Promise((ok,fail)=>{this.onload=ok;this.onerror=fail;super.src=Buffer.from(value.slice(value.indexOf(',')+1),'base64')}));}}
const env={Math:math,window:{games:{}},Image:Img};
let s=mod.replace('window.games.sluggers=', 'window.hitter=drawHitter;window.grip=gripTrack;window.games.sluggers=');
s=s.replace('return {draw,update,input(id,down){if(id===\'swing\'', 'return {probe:()=>({phase,age,duration:duration(),result}),draw,update,input(id,down){if(id===\'swing\'');
s=s.replace('return {update,draw,input(id,down){\n      if(!down||','return {probe:()=>({phase,age,pitch,feedback,call,outs,strikes}),update,draw,input(id,down){\n      if(!down||');
vm.runInNewContext(s,env);
async function geometry(){
 await Promise.all(read);
 const ready=env.window.grip[0], launch=env.window.grip[9], contact=env.window.grip[13];
 assert(ready[0]<154 && ready[1]<55,'Ready grip should be high beside the back shoulder, behind the head in this camera');
 assert(contact[0]-launch[0]>65,'Hands must stay back until front foot plant, then extend into the lane');
 const c=createCanvas(480,340),cx=c.getContext('2d');let minBack=999,maxBack=0,minFront=999,maxFront=0;
 for(const [age,load] of [[-1,0],[-1,1],...Array.from({length:91},(_,i)=>[i*.0094,1])]){
  cx.clearRect(0,0,480,340);env.window.hitter(cx,1,age,load,{x:240,y:189});
  const im=cx.getImageData(0,0,480,340).data;
  let ranges=[];
  for(const [start,end] of [[70,152],[153,240]]){
   let bottom=0;for(let y=201;y<330;y++)for(let x=start;x<=end;x++)if(im[(y*480+x)*4+3]>140)bottom=y;
   assert(bottom>=215&&bottom<=253,'Cropped or misplaced cleat at y='+bottom+' age='+age);
   let xs=[];for(let y=bottom-4;y<=bottom;y++)for(let x=start;x<=end;x++)if(im[(y*480+x)*4+3]>140)xs.push(x);
   const left=111-(bottom-215)*.95,right=203-(bottom-215)*.22;
   assert(Math.min(...xs)>left+2&&Math.max(...xs)<right-2,'Shoe overlaps chalk '+[age,bottom,Math.min(...xs),Math.max(...xs),left,right]);
   ranges.push(bottom);
  }
  assert(ranges[0]-ranges[1]>=6,'Feet must be staggered toward the mound '+[age,load,...ranges]);
  minBack=Math.min(minBack,ranges[0]);maxBack=Math.max(maxBack,ranges[0]);minFront=Math.min(minFront,ranges[1]);maxFront=Math.max(maxFront,ranges[1]);
 }
 console.log('PASS rendered feet stay inside chalk, back '+[minBack,maxBack]+' / lead '+[minFront,maxFront]+' at 93 swing/load samples');
}
function timing(){
 for(const [lead,expected] of [[.12,'On time'],[.34,'Early'],[0,'Late']]){
  seq=[.55,.55,.5,.04,.55,.99,0,.5];
  const a=env.window.games.sluggers.create({hud(){},tone(){},crowd(){},end(){}},3);
  function until(fn){let i=0;while(!fn(a.probe())&&i++<40000)a.update(.0005);assert(fn(a.probe()))}
  until(s=>s.phase==='pitch');until(s=>s.phase!=='pitch');until(s=>s.phase==='pitch');assert.equal(a.probe().pitch.dx,0);
  until(s=>s.age>=s.pitch.speed-lead);a.input('power',true);a.input('swing',true);
  assert.equal(a.probe().feedback,null,'No verdict on finger-down');a.update(.10);assert.equal(a.probe().feedback,null,'No verdict before barrel enters plane');
  for(let i=0;i<24;i++)a.update(.001);
  assert.equal(a.probe().feedback.message,expected);if(lead===.12)assert.equal(a.probe().call,'Deep drive…');
 }
 console.log('PASS one swing per delivery and center-fastball barrel timing, early/on-time/late');
}
function practice(){
 for(const level of [0,1,2]){
  const game=env.window.games.sluggers.create({hud(){},tone(){},end(){}},level);
  for(let i=0;i<6000&&game.probe().phase!=='pitch';i++)game.update(.001);
  while(game.probe().age<game.probe().duration-.12)game.update(.001);
  game.pointer('down');game.update(.09);assert.equal(game.probe().result,null);
  game.update(.031);assert.equal(game.probe().result.bases,4);
 }
 console.log('PASS all three practice challenges time the barrel at the plate');
}
(async()=>{let failed=0;for(const fn of [geometry,timing,practice])try{await fn()}catch(e){console.error(e.message);failed++}process.exitCode=Number(failed>0)})();
