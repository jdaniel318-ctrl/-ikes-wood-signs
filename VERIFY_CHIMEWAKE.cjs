'use strict';
// Reproduce the wharf decision from the Captain's run with a fresh in-memory player.
// Fixtures advance to distant checkpoints. Input, collision, gate, score and draw are real.
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const {join}=require('node:path');
const scripts=(file,field='player')=>Array.from(JSON.parse(fs.readFileSync(join(__dirname,file)))[field].matchAll(/<script>([\s\S]*?)<\/script>/g),m=>m[1]);
let [gameSource,shell]=scripts('fleet-arcade.ship.json');
function expose(before,code){
  assert.equal(gameSource.split(before).length,2,'Ambiguous fixture entry');
  gameSource=gameSource.replace(before,code+'\n'+before);
}
expose('    status();\n    return {update,draw,input,pointer(type)',`
  api.fixture={
    p, course:s, rung,
    align(index){const b=bellPos(s.bells[index],t);Object.assign(p,{x:b.x,y:b.y+19,vx:0,vy:0,ground:false,hook:-1});lock=0;freeze=0;},
    landAtGate(){Object.assign(p,{x:s.length-32,y:s.roofs.at(-1)[2],vy:0,vx:0,ground:true,hook:-1});cam=s.length-480;freeze=0;},
    lookAt(index){cam=clamp(s.bells[index][0]-220,0,s.length-480);},
    fall
  };`);
expose('    updateHUD();\n    return {update,draw,input,pointer};',`
  api.fixture={beforeQuota(){gateNo=course.need-1;cleared=gateNo;
    const gate=nextGate();s=gate[0]-.05;x=center(gate[0])+gate[1];speed=32;}};
`);
expose('    let scenery=null;\n    function landscape(c)',`
  api.fixture={returning(low){x=180;y=110;departed=true;air=low?6:site.air;cargo=low?0:site.quota;}};
`);
const cueTexts=[], boxes=[];
const noop=()=>{};
function recordingContext(){
  return new Proxy({canvas:{width:1440,height:810},measureText:s=>({width:s.length*6}),
    createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),
    fillText:text=>cueTexts.push(String(text)),strokeRect(...coords){boxes.push(coords);}},
    {get:(obj,k)=>k in obj?obj[k]:noop});
}
const ctx=recordingContext();
const sandbox={window:{},Image:class {},Path2D:class {},structuredClone};
vm.runInNewContext(gameSource,sandbox);
const catalog=sandbox.window.games;
function start(id,level=0){
  const events=[],api={getData:()=>null,saveData:noop,tone:noop,hud:text=>events.push(text),end:(...outcome)=>events.push(outcome),controls:noop,hideReplay:noop,replay:noop};
  const game=catalog[id].create(api,level);
  function frame(){cueTexts.length=0;boxes.length=0;game.draw(ctx);return [...cueTexts];}
  function advance(n=1){for(let i=0;i<n;i++)game.update(1/60);}
  return {game,advance,frame,events,get f(){return api.fixture;}};
}
for(const [id,title] of Object.entries(catalog)){
  for(let level=0;level<title.levels.length;level++){
    const run=start(id,level);run.advance();run.frame();
  }
}
for(let level=0;level<3;level++){
  const {game,f,advance,frame,events}=start('riptail',level);
  game.input('jump',true);f.align(0);advance();
  assert.equal(f.p.hook,0);assert.ok(frame().includes('Release Jump'));
  game.input('jump',false);assert.ok(frame().includes('Press Jump to leap'));
  game.input('jump',true);assert.equal(f.p.hook,-1);assert.ok(f.p.vy<0);
  game.input('jump',false);f.align(2);advance();
  f.landAtGate();advance();assert.ok(frame().includes('← Bell 2'));
  assert.ok(events.some(text=>String(text).includes('Gate closed · Return to bell 2')));
  assert.ok(!events.some(Array.isArray),'Locked gate must not finish the round');
  f.lookAt(1);assert.ok(frame().includes('Ring bell 2'));
  f.align(1);advance();
  assert.ok(frame().some(s=>s==='Gate open →'||s==='Finish here'));
  f.fall();advance(20);assert.ok(f.rung.every(Boolean),'Bells survive a respawn');
  f.landAtGate();advance();const end=events.find(Array.isArray);assert.ok(end[0]&&end[2]>0);
}
const last=start('riptail');
for(let i=0;i<3;i++){last.f.align(i);last.advance();}
for(let i=0;i<3;i++)last.f.fall();
assert.match(last.events.find(Array.isArray)[1],/All three bells rang/);
// Also make the first catch and launch from the wharf under normal game input.
let caughtFromPier=false;
for(let takeoff=98;takeoff<=170&&!caughtFromPier;takeoff+=3){
  const {f,game,advance,frame}=start('riptail');game.input('right',true);
  let jumped=false;
  for(let tick=0;tick<140;tick++){
    if(!jumped&&f.p.x>=takeoff){game.pointer('down');jumped=true;}
    advance();
    if(f.p.hook===0){
      assert.ok(frame().includes('Release Jump'));game.pointer('up');
      assert.ok(frame().includes('Press Jump to leap'));game.pointer('down');
      assert.ok(f.p.vy<0&&f.p.hook===-1);caughtFromPier=true;break;
    }
  }
}
assert.ok(caughtFromPier,'First catch and launch must work from the starting roof');
const boat=start('skullwater');boat.f.beforeQuota();boat.advance();
assert.ok(boat.frame().includes('Quota met · race to the finish'));boat.advance(155);
assert.ok(!boat.frame().includes('Quota met · race to the finish'));
const dive=start('deepbell');assert.ok(!dive.frame().includes('Refill here'));
dive.f.returning(false);assert.ok(dive.frame().includes('Land cargo here'));
dive.f.returning(true);assert.ok(dive.frame().includes('Refill here'));
const pipes=start('pipeworks');pipes.game.input('test',true);pipes.advance(900);
assert.ok(pipes.frame().includes('FIRST LEAK MARKED') && boxes.length);
pipes.game.input('rotate',true);assert.ok(!pipes.frame().includes('FIRST LEAK MARKED'));
const dock=start('dockmaster');assert.ok(dock.frame().includes('Milk · due bell 2'));
dock.game.input('cart',true);dock.advance(80);assert.ok(!dock.frame().includes('Milk · due bell 2'));
const chalk=start('chalkwing');
chalk.game.input('roll',true);chalk.advance(600);
assert.ok(chalk.frame().includes('Extend from here'));
chalk.game.pointer('down',130,140);chalk.game.pointer('move',170,145);chalk.game.pointer('up',170,145);
assert.ok(!chalk.frame().includes('Extend from here'));
const goals=vm.runInNewContext(shell.slice(shell.indexOf('  function openingObjective'),shell.indexOf('  const opening=byId'))+'; openingObjective');
for(const [id,g] of Object.entries(catalog))for(let i=0;i<g.levels.length;i++)assert.ok(goals(id,i).length>10);
let [maze]=scripts('lantern-run.ship.json');
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{style:{},dataset:{},classList:{toggle:noop},setAttribute:noop,getContext:()=>ctx});return elements.get(id);}
const mazeEnv={document:{getElementById:element},window:{},matchMedia:()=>({matches:true}),console};
const mazeCore=maze.slice(0,maze.indexOf('function action(){'));
vm.runInNewContext(mazeCore+`
  hostChannel='fixture';s.mode='over';s.power=0;
  const remaining=Array.from(s.board.cargo).slice(0,1);
  s.board.cargo=new Set(remaining);screenKey='';sync();
`,{...mazeEnv,resetStick:noop,touch:null,canSave:true,cleared:0});
assert.equal(element('status').textContent,'1 star left!');assert.match(element('desc').textContent,/One star short/);
const regatta=scripts('regatta-player.json','document');
const race=vm.runInNewContext(regatta.slice(0,3).join('\n')+';Regatta',{Image:class {}});
race.start(0,noop,()=>.4);assert.equal(race.currentHint(),'');
for(let i=0;i<185;i++)race.tick(1/60);
const helm=race.state.racers[0];helm.s=75;helm.x=0;assert.match(race.currentHint(),/port/);
helm.x=-.53;assert.match(race.currentHint(),/Hold course/);helm.x=-.91;assert.match(race.currentHint(),/starboard/);
helm.s=1120;assert.match(race.currentHint(),/gust available/);race.gust();assert.equal(race.currentHint(),'Finish straight');
console.log('PASS 23 challenge first frames, three bell courses, physical-input simulation, return and finish, arcade scene feedback, Lantern end state and Regatta steering cues.');
