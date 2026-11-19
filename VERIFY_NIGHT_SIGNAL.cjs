// Exercise the packaged cartridge. Only the test copy exposes state for observations.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),crypto=require('node:crypto');
const load=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const bytes=load('fleet-arcade.ship.json'),pack=JSON.parse(bytes),host=load('fun_program.js');
assert.equal(pack.levels,25);
assert.ok(host.includes(crypto.createHash('sha256').update(bytes).digest('hex')));
const stage=pack.player.match(/<script>([\s\S]*?)<\/script>/)[1];
const marker='    status();\n    return {input,pointer,update,draw};';
assert.equal(stage.split(marker).length,2);
const expose=`api.probe={read:()=>({hero:{...hero},bat:{...bat},scout:{...scout},rescued,alerts,done,queued,freeze,signalAt,signalTime,cooldown,radarMode,elapsed,shield,boarding,buddy:{...buddy}}),
 route:(a,b)=>path(a,b,rescued),cell,lift,hatch,
 encounter(){shield=0;bat=actor(hero.at);},place(n){hero=actor(n);},see(){scout=actor(tile(3,1),-1);hero=actor(lift);}};
`;
const env={window:{},Image:class{},Path2D:class{},structuredClone};
vm.runInNewContext(stage.replace(marker,expose+marker),env);
assert.equal(Object.values(env.window.games).reduce((n,g)=>n+g.levels.length,0),25);
function start(){
 const endings=[],api={hud(){},tone(){},end(...v){endings.push(v)}};
 const g=env.window.games.nightsignal.create(api,0),p=api.probe;
 const tick=(n=1)=>{for(let f=0;f<n;f++)g.update(1/60);};
 const tap=id=>{g.input(id,true);g.input(id,false);};
 return {g,p,tick,tap,endings};
}
const directions={1:'right',21:'down','-1':'left','-21':'up'};
const a=start();
a.tap('up');a.tick(30);assert.equal(a.p.read().hero.at,a.p.lift);
a.g.pointer('down',50,60);a.g.pointer('move',72,60);a.tick(10);a.g.pointer('up',72,60);a.tick(18);
assert.equal(a.p.read().hero.at,a.p.lift+1);a.tick(30);assert.equal(a.p.read().hero.at,a.p.lift+1);
a.g.pointer('down',70,60);a.g.pointer('move',85,60);a.tick(1);a.g.pointer('cancel',85,60);a.tick(34);
assert.equal(a.p.read().hero.at,a.p.lift+2);
a.p.see();a.tick();assert.equal(a.p.read().radarMode,'SEARCH');
a.tap('decoy');const s=a.p.read();assert.ok(s.signalTime>0&&s.cooldown>0);
a.tick(8);a.tap('decoy');assert.ok(a.p.read().cooldown<s.cooldown);assert.equal(a.p.read().radarMode,'DECOY');
const b=start();b.p.encounter();b.tick();assert.equal(b.p.read().alerts,1);assert.equal(b.p.read().hero.at,b.p.lift);
const mission=start(),{p,tick,tap}=mission;const out=p.route(p.lift,p.cell);
assert.ok(out.length>40&&!out.includes(p.hatch));
let rescueFrame=0,firstBoard=-1;
for(let f=0;f<3500&&!p.read().done;f++){
 const s=p.read(),h=s.hero;
 if(f>=333&&h.at===h.to&&!s.freeze&&!s.queued&&!s.boarding){
   const dist=Math.abs(h.at%21-s.scout.at%21)+Math.abs(Math.floor(h.at/21)-Math.floor(s.scout.at/21));
   if(!s.cooldown&&dist<8)tap('decoy');
   const dest=p.route(h.at,s.rescued?p.lift:p.cell)[0];if(dest!==undefined)tap(directions[dest-h.at]);
 }
 tick();
 if(!rescueFrame&&p.read().rescued){
   rescueFrame=f;const home=p.route(p.cell,p.lift);assert.ok(home.length<out.length&&home.includes(p.hatch));
 }
 if(p.read().boarding&&firstBoard<0){firstBoard=f;assert.ok(!p.read().done);}
}
assert.ok(rescueFrame>0&&firstBoard>rescueFrame);assert.equal(mission.endings.length,1);
assert.equal(mission.endings[0][0],true);assert.equal(p.read().buddy.at,p.lift);
assert.match(mission.endings[0][1],/Duke extracted/);tick(90);assert.equal(mission.endings.length,1);
const checkpoint=start(),k=checkpoint.p;
k.place(k.cell-21);checkpoint.tap('down');checkpoint.tick(20);
assert.ok(k.read().rescued);k.encounter();checkpoint.tick();
assert.equal(k.read().hero.at,k.cell);assert.ok(k.read().rescued&&k.read().alerts===1);
checkpoint.tick(120);assert.equal(k.read().hero.at,k.cell);
// Verify scoped score persistence, idempotent clears, other game records, and invalid levels.
const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
const head=host.indexOf('const arcadeGames ='),tail=host.indexOf('function lanternCleared(',head);
const harness=vm.runInNewContext(host.slice(head,tail)+';({saveArcadeRecord,arcadeRecords})',
 {window:{navigator:{}},localStorage:storage,lanternAccess:run=>run.allowed});
const run=scope=>({allowed:true,who:{context:{scope}},canSave:true});
const r=run('training-A'),other=run('training-B');
const save=(r,id,level,score)=>harness.saveArcadeRecord(r,{type:'arcade-clear',id,level,score});
save(r,'riptail',0,3080);save(r,'nightsignal',0,5150);save(r,'nightsignal',0,400);
save(r,'nightsignal',2,9999);save({...other,allowed:false},'nightsignal',0,1550);
assert.equal(harness.arcadeRecords(r)['nightsignal.0'].best,5150);assert.equal(harness.arcadeRecords(r)['riptail.0'].best,3080);
assert.equal(Object.keys(harness.arcadeRecords(other)).length,0);assert.equal(map.size,2);assert.equal(harness.arcadeRecords(r)['nightsignal.2'],undefined);
console.log('PASS Night Signal cartridge, buffered and swipe input, enemy sight and decoy, cooldown, checkpoint reset, end-to-end extraction, return shortcut, replay score and existing save isolation.');
