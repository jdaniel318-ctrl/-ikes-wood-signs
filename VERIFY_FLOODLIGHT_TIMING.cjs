// Offline rendered-feedback regression, using the sealed game cartridge.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=JSON.parse(fs.readFileSync(__dirname+'/fleet-arcade.ship.json'));
const src=[...p.player.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(s=>s.includes('function createNinth('));
const math=Object.create(Math);math.random=()=>.55;
const env={window:{games:{}},Math:math,Image:class{}};
vm.runInNewContext(src,env);
const shown=[];
const ctx=new Proxy({canvas:{width:1440,height:810},fillText(text){shown.push(text)},measureText(t){return {width:t.length*5}},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}},{get:(o,k)=>k in o?o[k]:()=>{}});
function simulate(at,power=false){
 const a=env.window.games.sluggers.create({hud(){},tone(){},end(){},crowd(){}},3);
 function tick(t){for(let i=0;i<Math.round(t*120);i++)a.update(1/120);}
 tick(1.12+1.12*1.23+1.23+1.11);tick(at);a.input(power?'power':'swing',true);tick(.16);shown.length=0;a.draw(ctx);return shown.slice();
}
assert(simulate(.54).some(t=>/^early/i.test(t)), 'an early swing needs visible timing feedback');
assert(simulate(1.40,true).some(t=>/^late/i.test(t)), 'a late power swing needs visible timing feedback');
console.log('PASS rendered real early and late swing feedback');
