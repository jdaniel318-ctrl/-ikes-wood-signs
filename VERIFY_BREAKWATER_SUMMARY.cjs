'use strict';
// Exercise the real save/mission engine. The presentation helper must neither
// advance progress nor change any pre-Breakwater core code.
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||__dirname),S=require(path.join(root,'stormwake_core.js'));
const summary=s=>{a.equal(typeof S.voyageSummary,'function','Missing read-only voyageSummary');return S.voyageSummary(s);};
const event=(s,e)=>a.equal(S.event(s,e).ok,true,'Fixture event rejected: '+e.type);
const legacy=()=>({schema:'fun-solo-v1',stage:6,history:['shore','hull','cargo','channel','sail','gate'],help:0,mistakes:1,completed:true,lessons:['function'],pennant:'teal'});
function stages(){
  const s=S.fresh(),out=[];
  const keep=(stage,objective)=>out.push({state:S.validate(s),stage,objective});
  keep(1,'Meet Bootstrap by the pier');
  event(s,{type:'talk'});keep(2,'Recover the bridge salvage · 0/3');
  event(s,{type:'collect',id:'rope'});keep(2,'Recover the bridge salvage · 1/3');
  event(s,{type:'collect',id:'timber'});keep(2,'Recover the bridge salvage · 2/3');
  event(s,{type:'collect',id:'gear'});keep(3,'Reopen the rescue channel');
  const work=new S.BridgeWork(s);a.equal(work.fitGear(s),true);a.equal(work.secureBrace(s),true);a.equal(work.setHolding(true,s),true);
  for(let i=0;i<121;i++)work.step(.05,s);
  keep(4,'Reach the stranded chartmaker');
  event(s,{type:'rescue'});keep(5,'Bring your crewmate home');
  event(s,{type:'finish'});keep(6,'Crew home · channel reopened');
  return out;
}
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}

test('voyage summary follows every real mission stage and existing objective hint',()=>{
  for(const {state,stage,objective}of stages()){
    const v=summary(state);a.equal(v.objective,objective);a.equal(v.hint,S.goal(state).hint);a.equal(v.stage,stage);a.equal(v.stageCount,6);
    a.deepEqual(Object.keys(v).sort(),['hint','objective','safeDock','stage','stageCount']);
  }
});
test('safe return names follow all four saved checkpoints independently of completion',()=>{
  const s=stages().at(-1).state;
  for(const [checkpoint,label]of Object.entries({arrival:'Arrival quay',pier:'Loading pier',chartmaker:'Chartmaker’s dock',lighthouse:'Lighthouse landing'})){
    event(s,{type:'checkpoint',id:checkpoint});const v=summary(s);a.equal(v.safeDock,label);a.equal(v.stage,6);a.equal(v.objective,'Crew home · channel reopened');
  }
});
test('a frozen save keeps every mission, legacy and preference byte after repeated summaries',()=>{
  const s=stages().at(-1).state;s.legacy=legacy();event(s,{type:'chart'});event(s,{type:'prefs',prefs:{quality:'high',sound:true,reducedMotion:true}});
  const before=S.serialize(s);freeze(s);
  for(let i=0;i<3;i++){const v=summary(s);v.objective='Changed display copy';a.equal(summary(s).objective,'Crew home · channel reopened');}
  a.equal(S.serialize(s),before);a.deepEqual(s.mission.parts,['rope','timber','gear']);a.equal(s.legacy.pennant,'teal');a.deepEqual(s.legacy.lessons,['function']);
});
test('completed First Light imports preview a fresh rescue at Arrival quay',()=>{
  const original=freeze(legacy()),before=JSON.stringify(original),migrated=S.restore(before);
  const v=summary(original);a.deepEqual(v,summary(migrated));a.equal(v.objective,'Meet Bootstrap by the pier');a.equal(v.stage,1);a.equal(v.safeDock,'Arrival quay');
  a.equal(migrated.mission.complete,false);a.deepEqual(migrated.legacy,original);a.equal(JSON.stringify(original),before);
});
test('incomplete winch work never becomes saved repair completion in the summary',()=>{
  const s=stages().find(v=>v.stage===3).state,work=new S.BridgeWork(s),before=S.serialize(s);
  work.fitGear(s);work.secureBrace(s);work.setHolding(true,s);for(let i=0;i<30;i++)work.step(.05,s);
  const v=summary(s);a.equal(v.objective,'Reopen the rescue channel');a.equal(v.stage,3);a.equal(S.serialize(s),before);
  a.match(v.hint,/Fit the gear, secure the timber and rope/);a.equal('progress'in v,false);
});
test('invalid saves cannot produce a plausible voyage preview',()=>{
  summary(S.fresh());
  for(const mutate of [s=>s.mission.checkpoint='invented',s=>s.mission.passenger=true,s=>s.mission.position={x:1},s=>s.prefs.quality='ultra']){
    const s=S.fresh();mutate(s);a.throws(()=>S.voyageSummary(s));
  }
  a.throws(()=>S.voyageSummary({schema:'orders',rows:[]}));
});
test('all pre-Breakwater core bytes survive the single added presentation helper and export',()=>{
  summary(S.fresh());
  const source=fs.readFileSync(path.join(root,'stormwake_core.js'),'utf8'),helper=S.voyageSummary.toString();
  a.equal(source.split(helper).length,2,'Expected one declared summary helper');
  const preserved=source.replace(helper+'\n','').replace('event,goal,voyageSummary,BridgeWork','event,goal,BridgeWork');
  a.equal(crypto.createHash('sha256').update(preserved).digest('hex'),'53bc3070f55feceeff08ac5743f3220d70e0c3dda901b0b107092b2e3da16cc9','Prior core code changed beyond the presentation helper/export');
});
