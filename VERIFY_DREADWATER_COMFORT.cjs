'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const S=require('./stormwake_core.js'),C=require('./stormwake_comfort.js');
test('a roof overhang outside the ground collision footprint blocks the camera ray',()=>{
 const target=[14,2.77,2],eye=[14,6,-5.3],roof=[6.2,16.8,5.1,9.8,-15.8,-5.2];
 const safe=C.cameraEye(target,eye,[roof]);
 a.ok(Math.hypot(...safe.map((v,i)=>v-target[i]))<Math.hypot(...eye.map((v,i)=>v-target[i])));
 a.equal(C.segmentBox(target,safe,roof),null);
});
test('a ray below the roof stays open and a wall remains solid',()=>{
 const roof=[6,17,5.1,10,-16,-5],target=[14,2.77,2],eye=[14,4,-4.8];
 a.deepEqual(C.cameraEye(target,eye,[roof]),eye);
 const wall=[7,16,0,6,-15,-6],safe=C.cameraEye(target,[14,4,-12],[wall]);
 a.ok(safe[2]>-6);a.equal(C.segmentBox(target,safe,wall),null);
});
test('smoothing around a workshop corner cannot pull target or eye into a wall',()=>{
 const h=new S.Character();h.x=6.68;h.z=-7;let smoothed=[h.x,h.y+1.17,h.z];
 for(let n=0;n<5;n++){h.step(.05,{z:1});const p=[h.x,h.y+1.17,h.z];smoothed=smoothed.map((v,i)=>v+(p[i]-v)*.35);}
 h.step(.05,{x:1});const actual=[h.x,h.y+1.17,h.z];smoothed=smoothed.map((v,i)=>v+(actual[i]-v)*.35);
 a.equal(S.blocked(h.x,h.z,h.y),false);
 const boxes=C.cameraBounds([[6.2,16.8,5.1,9.8,-15.8,-5.2]]),target=C.cameraTarget(smoothed,actual,boxes),eye=C.cameraEye(target,[h.x,6,-12.8],boxes);
 a.deepEqual(target,actual);a.ok(boxes.every(b=>C.segmentBox(target,target,b)===null));a.ok(boxes.every(b=>C.segmentBox(eye,eye,b)===null));a.ok(Math.hypot(...eye.map((v,i)=>v-target[i]))>=1.45);
});
test('close approach to Bootstrap stops outside his body while interaction remains in reach',()=>{
 const state=S.fresh(),before=JSON.stringify(state),h=new S.Character();h.z=-15.12;
 C.separateCrew(h,{x:0,z:-15.38},state);
 const d=Math.hypot(h.x,h.z+15);a.ok(d>=C.CREW_RADIUS-1e-8&&d<2.7);a.equal(JSON.stringify(state),before);a.equal(S.blocked(h.x,h.z,h.y),false);
});
test('exact-center overlap resolves without NaN or teleporting off land',()=>{
 const s=S.fresh(),h=new S.Character();h.z=-15;C.separateCrew(h,{x:0,z:-15},s);
 a.ok(Number.isFinite(h.x)&&Number.isFinite(h.z));a.ok(Math.hypot(h.x,h.z+15)>=C.CREW_RADIUS-1e-8);a.equal(S.surfaceAt(h.x,h.z),1.6);
});
test('chartmaker and reunited crew use mission positions without rewriting the save',()=>{
 const s=S.fresh();s.mission.briefed=true;s.mission.parts=[...S.PARTS];s.mission.weight=4;s.mission.bridgeOpen=true;s.mission.passenger=true;s.mission.complete=true;s.mission.checkpoint='lighthouse';
 a.deepEqual(C.crewPositions(s),[[-16,1.6,31],[-17.3,1.6,30]]);
 const h=new S.Character('lighthouse');h.x=-17.3;h.z=30;C.separateCrew(h,{x:-17.3,z:29.7},s);
 a.ok(C.crewPositions(s).every(p=>Math.hypot(h.x-p[0],h.z-p[2])>=C.CREW_RADIUS-1e-6));a.deepEqual(S.validate(s),s);
});
test('open water and elevated jumps are never dragged toward an NPC',()=>{
 const s=S.fresh(),h=new S.Character();h.x=0;h.z=-15;h.y=4.1;C.separateCrew(h,{x:0,z:-15.3},s);a.equal(h.z,-15);
 a.deepEqual(C.cameraEye([0,2,20],[0,6,12],[]),[0,6,12]);
});
test('a stationary near-wall view converges instead of repeatedly changing camera sides',()=>{
 const target=[6.3,2.77,-9],yaw=-Math.PI/2,desired=[target[0]-Math.sin(yaw)*Math.cos(.34)*7.6,target[1]+Math.sin(.34)*7.6+1,target[2]-Math.cos(yaw)*Math.cos(.34)*7.6];
 const boxes=C.cameraBounds([[6.2,16.8,5.1,9.8,-15.8,-5.2]]);let pose={target:target.slice(),eye:desired.slice()},max=0;
 for(let n=0;n<600;n++){const next=C.cameraPose(pose,target,desired,boxes,7/60);if(n>120)max=Math.max(max,Math.hypot(...next.eye.map((v,i)=>v-pose.eye[i])));a.ok(boxes.every(b=>C.segmentBox(next.target,next.eye,b)===null));pose=next;}
 a.ok(max<.005,`Stationary camera moved ${max} world units per frame`);
});
