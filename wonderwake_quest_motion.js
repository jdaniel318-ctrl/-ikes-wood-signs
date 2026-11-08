/* Presentation-only distance sampling. Quest rules and saved points stay independent. */
(function(root){'use strict';
function route(points){
 const path=points.length?points.map(p=>[...p]):[[0,0]],segments=[];let total=0;
 for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],dx=(b[0]-a[0])*1000,dy=(b[1]-a[1])*560,length=Math.hypot(dx,dy);
  if(!length)continue;segments.push({a,b,length,start:total,direction:dx<0?-1:1});total+=length;
 }
 return{start:path[0],end:path[path.length-1],segments,total};
}
function sample(r,progress){
 if(progress<=0)return{point:[...r.start],direction:r.segments[0]?.direction||1};
 if(progress>=1)return{point:[...r.end],direction:r.segments[r.segments.length-1]?.direction||1};
 const distance=Math.max(0,Math.min(1,progress))*r.total;
 const s=r.segments.find(s=>distance<=s.start+s.length)||r.segments[r.segments.length-1];
 if(!s)return{point:[...r.start],direction:1};
 const t=Math.max(0,Math.min(1,(distance-s.start)/s.length));
 return{point:[s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t],direction:s.direction};
}
root.WWQuestMotion=Object.freeze({version:'0.7.1',route,sample});
})(globalThis);
