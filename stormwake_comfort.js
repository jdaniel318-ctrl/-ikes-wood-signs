/* Dreadwater camera and close-crew clearance. No mission or save changes. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./stormwake_core.js'):root.BlackFlagStormwake);if(typeof module==='object'&&module.exports)module.exports=api;else root.StormwakeComfort=api;})(typeof globalThis!=='undefined'?globalThis:this,function(S){'use strict';
const CREW_RADIUS=.86;
// Full 3D bounds, unlike the core's ground-to-height walking obstacles.
function segmentBox(from,to,b){let lo=0,hi=1;for(let i=0;i<3;i++){const min=b[i*2],max=b[i*2+1],d=to[i]-from[i];if(Math.abs(d)<1e-8){if(from[i]<min||from[i]>max)return null;}else{let a=(min-from[i])/d,c=(max-from[i])/d;if(a>c)[a,c]=[c,a];lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>hi)return null;}}return lo>=0&&lo<=1?lo:null;}
function cameraTarget(smoothed,anchor,boxes){return boxes.some(b=>segmentBox(smoothed,smoothed,b)!==null)?anchor.slice():smoothed;}
function clipEye(target,eye,boxes){const length=Math.hypot(...eye.map((x,i)=>x-target[i]));if(length<1e-6)return eye.slice();let t=1;for(const b of boxes){const hit=segmentBox(target,eye,b);if(hit!==null)t=Math.min(t,Math.max(0,hit-.20/length));}const result=eye.map((x,i)=>target[i]+(x-target[i])*t);result[1]=Math.max(.8,result[1]);return result;}
function cameraEye(target,eye,boxes){
 const distance=p=>Math.hypot(...p.map((x,i)=>x-target[i]));
 const clip=p=>clipEye(target,p,boxes);
 let result=clip(eye);if(distance(result)>=1.45)return result;
 // If a wall leaves no usable shoulder view, try nearby clear angles instead
 // of collapsing the camera into the captain's head. All candidates are traced.
 let dx=eye[0]-target[0],dz=eye[2]-target[2];const horizontal=Math.hypot(dx,dz);
 if(horizontal<2.6){const scale=2.6/(horizontal||1);dx=horizontal?dx*scale:0;dz=horizontal?dz*scale:-2.6;}
 const dy=Math.max(1.1,eye[1]-target[1]);
 for(const angle of [.55,-.55,1.1,-1.1,1.65,-1.65,Math.PI]){const c=Math.cos(angle),s=Math.sin(angle),candidate=clip([target[0]+dx*c-dz*s,target[1]+dy,target[2]+dx*s+dz*c]);if(distance(candidate)>distance(result))result=candidate;if(distance(result)>=2.3)break;}
 return result;
}
function cameraPose(camera,anchor,desired,boxes,smoothing){
 const target=cameraTarget(camera.target.map((v,i)=>v+(anchor[i]-v)*smoothing),anchor,boxes);
 // Select from the stable requested view, not the previously corrected eye.
 // Feeding the last clipped eye back into angle selection causes corner jitter.
 const goal=cameraEye(target,desired,boxes),interpolated=camera.eye.map((v,i)=>v+(goal[i]-v)*smoothing);
 let eye=clipEye(target,interpolated,boxes);
 if(Math.hypot(...eye.map((v,i)=>v-target[i]))<1.45)eye=goal;
 return {target,eye};
}
function cameraBounds(extra=[]){return S.OBSTACLES.map(b=>[b[0]-.25,b[1]+.25,0,b[4]+.3,b[2]-.25,b[3]+.25]).concat(extra.map(b=>[b[0]-.15,b[1]+.15,b[2]-.15,b[3]+.15,b[4]-.15,b[5]+.15]));}
function crewPositions(state){const m=state.mission;return[m.passenger?[-16,1.6,31]:[0,1.6,-15],m.complete?[-17.3,1.6,30]:m.passenger?[14.1,1.6,50.5]:[18,1.6,48.5]];}
function separateCrew(hero,previous,state){const crew=crewPositions(state),valid=(x,z)=>{const y=S.surfaceAt(x,z);return y!==null&&Math.abs(y-1.6)<.01&&!S.blocked(x,z,hero.y)&&crew.every(p=>hero.y>=p[1]+2.15||Math.hypot(x-p[0],z-p[2])>=CREW_RADIUS-1e-7);};let moved=false;
 for(const p of crew){if(hero.y>=p[1]+2.15||hero.y+1.8<=p[1])continue;let dx=hero.x-p[0],dz=hero.z-p[2],d=Math.hypot(dx,dz);if(d>=CREW_RADIUS)continue;if(d<1e-6){dx=previous.x-p[0];dz=previous.z-p[2];d=Math.hypot(dx,dz);if(d<1e-6){dx=0;dz=-1;d=1;}}const a=Math.atan2(dx,dz);for(const offset of[0,.18,-.18,.40,-.40,.8,-.8,1.4,-1.4,Math.PI]){const x=p[0]+Math.sin(a+offset)*CREW_RADIUS,z=p[2]+Math.cos(a+offset)*CREW_RADIUS;if(valid(x,z)){hero.x=x;hero.z=z;moved=true;break;}}if(!moved&&valid(previous.x,previous.z)){hero.x=previous.x;hero.z=previous.z;moved=true;}}
 return moved;
}
return Object.freeze({CREW_RADIUS,segmentBox,cameraTarget,cameraEye,cameraPose,cameraBounds,crewPositions,separateCrew});});
