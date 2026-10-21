'use strict';
// Real Boat controls only. No renderer, simulated collision API, or position injection.
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const S=require(path.join(path.resolve(process.argv[2]||__dirname),'stormwake_core.js'));
const STEP=1/60;
// Reachable loading-pier contact reproduced in the delivered .42 core.
const CONTACT=[{throttle:1,steer:0,frames:170},{throttle:1,steer:-1,frames:272},{throttle:1,steer:1,frames:17}];
function poseClear(boat,open,label){
 assert.equal(S.boatBlocked(boat.x,boat.z,open),false,label+': center must remain clear');
 assert.equal(S.boatBlocked(boat.x+Math.sin(boat.yaw)*1.1,boat.z+Math.cos(boat.yaw)*1.1,open),false,label+': bow must remain clear');
}
function contact(check=false){
 const boat=new S.Boat();let frame=0;
 for(const action of CONTACT)for(let i=0;i<action.frames;i++){
  boat.step(STEP,action,true);
  if(check)poseClear(boat,true,'loading-pier frame '+(++frame));
 }
 return boat;
}

// Reintroducing unconditional yaw commits makes this real reverse escape fail.
test('launch can reverse away after reachable loading-pier contact',()=>{
 const boat=contact(),start={x:boat.x,z:boat.z};
 for(let frame=0;frame<600;frame++)boat.step(STEP,{throttle:-1,steer:0},true);
 assert.ok(Math.hypot(boat.x-start.x,boat.z-start.z)>1,'ten seconds of reverse must move away from contact');
});

// Detect the invalid pose on the exact rejected turn, before later escape input.
test('rejected turns never leave the bow inside the loading pier',()=>{contact(true);});

test('repeated turns and reversals preserve clear boat poses at all safe berths',()=>{
 let seed=1020;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(const berth of Object.keys(S.BERTHS))for(const dt of [1/60,1/30,.05]){
  const boat=new S.Boat(berth);poseClear(boat,true,berth+' initial');
  for(let command=0;command<60;command++){
   const input={throttle:random()<.35?-1:1,steer:[-1,0,1][Math.floor(random()*3)]};
   const frames=15+Math.floor(random()*150);
   for(let frame=0;frame<frames;frame++){
    boat.step(dt,input,true);poseClear(boat,true,berth+' dt '+dt+' command '+command+' frame '+frame);
   }
  }
 }
});

test('closed bridge contains the entire collision pose while preserving reverse escape',()=>{
 const boat=new S.Boat();
 for(let frame=0;frame<600;frame++){
  boat.step(STEP,{throttle:1,steer:0},false);
  assert.ok(boat.z+Math.cos(boat.yaw)*1.1<=27.4,'bow crossed the closed bridge');
  poseClear(boat,false,'closed bridge approach '+frame);
 }
 const stopped={x:boat.x,z:boat.z};assert.ok(stopped.z>25,'boat must actually approach the bridge');
 for(let frame=0;frame<120;frame++){
  boat.step(STEP,{throttle:-1,steer:0},false);poseClear(boat,false,'bridge reverse '+frame);
 }
 assert.ok(boat.z<stopped.z-1,'reverse must move south away from closed bridge');
});
