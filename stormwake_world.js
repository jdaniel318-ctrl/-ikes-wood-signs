/* Original authored Stormwake harbor and articulated cast. Fictional geometry only. */
(function(){'use strict';const R=StormGL,{Node,shape,V}=R,S=BlackFlagStormwake;
const C={stone:[.39,.43,.40],pale:[.64,.64,.51],sand:[.68,.60,.42],grass:[.22,.38,.31],wood:[.39,.25,.16],plank:[.57,.39,.23],dark:[.13,.20,.21],navy:[.045,.13,.18],teal:[.06,.29,.30],roof:[.075,.25,.26],cream:[.87,.80,.59],gold:[.98,.66,.24],rust:[.57,.25,.16],metal:[.20,.26,.25],skin:[.73,.45,.27],white:[.86,.86,.72]};
// Material families are explicit draw state; batching retains them without larger vertices.
const MAT={wood:1,stone:2,cloth:3,metal:4,roof:5,skin:6,leather:7,hair:8,foliage:9,ground:10,plaster:11,rope:12,rock:13};
const geo={box:shape.box(),cyl:shape.cylinder(.5,.5,1,12),sphere:shape.sphere(1,10,6),detail:shape.sphere(1,6,4),roof:shape.roof(),rock:rockGeometry(),cone:shape.cylinder(.6,0,1,9),ring:shape.torus(1,.09,14,5),diamond:shape.oct()};
let cameraOccluders=[];
let seed=261020;function rng(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}const tint=(c,s)=>c.map(x=>x*s);
function make(parent,g,col,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0],material){const n=parent.add(new Node(g,col));n.pos=pos;n.scale=scale;n.rot=rot;n.material=material??(col===C.wood||col===C.plank?MAT.wood:col===C.stone||col===C.pale?MAT.stone:col===C.sand?MAT.ground:col===C.grass?MAT.foliage:col===C.roof?MAT.roof:col===C.metal||col===C.gold?MAT.metal:col===C.skin?MAT.skin:0);return n;}
// Rigid detail stays inside its original moving parent and shares material draw buckets.
function mergeRigid(n){const st=new Node();st.children=n.children;n.children=[];n.add(R.batch(st));}
const box=(p,c,x,y,z,w,h,d,rot=[0,0,0])=>make(p,geo.box,c,[x,y,z],[w,h,d],rot),cyl=(p,c,x,y,z,rad,h,n=12)=>make(p,n===12?geo.cyl:shape.cylinder(.5,.5,1,n),c,[x,y,z],[rad*2,h,rad*2]);
function beam(p,c,a,b,r=.05){const mid=V.mul(V.add(a,b),.5),v=V.sub(b,a),l=Math.hypot(...v),yaw=Math.atan2(v[0],v[2]),pitch=Math.acos(v[1]/l);return make(p,geo.cyl,c,mid,[r*2,l,r*2],[pitch,yaw,0]);}
function barrel(p,x,y,z,s=1){make(p,shape.lathe([[.31,0],[.38,.16],[.42,.48],[.38,.82],[.31,.96]],12),C.plank,[x,y,z],[s,s,s]);for(const h of [.14,.79])cyl(p,C.metal,x,y+h*s,z,.387*s,.065*s);cyl(p,C.wood,x,y+.965*s,z,.31*s,.025*s);box(p,C.wood,x,y+.988*s,z,.06*s,.02*s,.57*s);}
function crate(p,x,y,z,s=.9){box(p,C.plank,x,y+s/2,z,s,s,s);for(const e of [-1,1]){box(p,C.wood,x+e*s*.44,y+s/2,z,.085,s+.05,s+.04);box(p,C.wood,x,y+s*.1,z+e*s*.51,s,.10,.045);box(p,C.wood,x,y+s*.9,z+e*s*.51,s,.10,.045);}box(p,C.wood,x,y+s/2,z+s*.516,s*1.12,.065,.05,[0,0,Math.PI/4]);}
function rockGeometry(){const source=shape.sphere(1,18,10),faces=[],normals=new Map(),g=[];
const warp=([x,y,z])=>{const w=1+.11*Math.sin(x*4+z*3+y*2)+.07*Math.cos(z*6-y*3),shelf=1+.07*Math.sin(y*7+x*2);return[x*w*shelf+.08*y*y,y*.87+.065*Math.sin(x*4+z*3)*(1-y*y),z*w*.94+.05*y];},key=p=>p.map(v=>v.toFixed(5)).join(',');
for(let i=0;i<source.length;i+=27){const pts=[0,9,18].map(k=>warp(source.slice(i+k,i+k+3))),n=V.cross(V.sub(pts[1],pts[0]),V.sub(pts[2],pts[0]));if(Math.hypot(...n)<1e-8)continue;faces.push(pts);for(const p of pts){const k=key(p);normals.set(k,V.add(normals.get(k)||[0,0,0],n));}}
for(const pts of faces)R.tri(g,...pts,[1,1,1],pts.map(p=>V.norm(normals.get(key(p)))));return g;}
function rock(p,x,y,z,sx,sy,sz){return make(p,geo.rock,tint(C.stone,.80+rng()*.35),[x,y,z],[sx,sy,sz],[rng()*.2,rng()*6,rng()*.15],MAT.rock);}
// Ground art is deterministic independently of the prop RNG: the existing harbor,
// low passage shoulders and all mission placements retain their exact transforms.
const landHash=(x,z)=>{const a=Math.sin(x*127.1+z*311.7)*43758.5453;return a-Math.floor(a);};
const landMix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),landEase=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
function landNoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),tx=landEase(0,1,x-ix),tz=landEase(0,1,z-iz),a=landHash(ix,iz)*(1-tx)+landHash(ix+1,iz)*tx,b=landHash(ix,iz+1)*(1-tx)+landHash(ix+1,iz+1)*tx;return a*(1-tz)+b*tz;}
function landTri(g,points,colors,normals){const n=V.norm(V.cross(V.sub(points[1],points[0]),V.sub(points[2],points[0])));for(let i=0;i<3;i++)g.push(...points[i],...(normals?.[i]||n),...colors[i]);}
function pathDistance(x,z,points){let d=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;}
function grassClump(g,x,z,s=1){
// Narrow, bent blades have warm dry tips; a clump is only fifteen triangles.
for(let i=0;i<5;i++){const a=landHash(x+i*3.1,z-i*.7)*Math.PI*2,r=landHash(x-i*2.7,z+i)*.16*s,cx=x+Math.sin(a)*r,cz=z+Math.cos(a)*r,h=(.19+landHash(x+i,z+4)*.19)*s,w=(.023+landHash(x-i,z+7)*.014)*s,bend=(.07+landHash(x+8,z-i)*.10)*s,sn=Math.sin(a),cs=Math.cos(a),root=1.602,baseA=[cx-cs*w,root,cz+sn*w],baseB=[cx+cs*w,root,cz-sn*w],midA=[cx+bend*.48-cs*w*.52,root+h*.60,cz+bend*.22+sn*w*.52],midB=[cx+bend*.48+cs*w*.52,root+h*.60,cz+bend*.22-sn*w*.52],tip=[cx+bend,root+h,cz+bend*.48],low=[.25,.31,.18],middle=[.34,.39,.23],dry=[.49,.47,.29];landTri(g,[baseA,baseB,midB],[low,low,middle]);landTri(g,[baseA,midB,midA],[low,middle,middle]);landTri(g,[midA,midB,tip],[middle,middle,dry]);}}
function plantingBed(p,x,z){const g=[],leaves=[],n=16,center=[x,1.603,z],inner=[],outer=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.81+landHash(x+i,z)*.33;inner.push([x+Math.sin(a)*r,1.603,z+Math.cos(a)*r*.78]);outer.push([x+Math.sin(a)*(r+.42),1.603,z+Math.cos(a)*(r+.42)*.82]);}for(let i=0;i<n;i++){const j=(i+1)%n,c=tint([.29,.35,.24],.88+landHash(x+i,z+2)*.17);landTri(g,[center,inner[i],inner[j]],[[.28,.31,.21],c,c]);landTri(g,[inner[i],outer[i],outer[j]],[c,C.sand,C.sand]);landTri(g,[inner[i],outer[j],inner[j]],[c,C.sand,c]);if(i%3===0)grassClump(leaves,inner[i][0],inner[i][2],.72);}make(p,g,[1,1,1],undefined,undefined,undefined,MAT.ground);make(p,leaves,[1,1,1],undefined,undefined,undefined,MAT.foliage);}
function coastalIsland(p,b,lighthouse=false){
const[x0,x1,z0,z1]=b,ground=[],coast=[],leaves=[],chips=[],paths=lighthouse?[
 {p:[[-12,34],[-14.0,33.4],[-16.0,31.3],[-18.2,31.4],[-20,32.65]],w:1.12},
 {p:[[-16,31.3],[-15.9,35.8],[-17.2,38.4],[-20.3,39.4]],w:.70},
 {p:[[-20,32.65],[-23.1,32.0],[-23.5,36.4],[-22.8,39.3],[-20.3,39.4]],w:.50}
]:[
 {p:[[13,50.5],[15.1,50.3],[17.7,49.1],[18,48.5]],w:1.0},
 {p:[[15.1,50.3],[16.8,51.2],[18.5,51.8]],w:.78},
 {p:[[18,48.5],[21.0,49.6],[22.8,51.4],[23.0,55.8],[21.8,57.9],[18.5,57.4]],w:.55}
],clear=lighthouse?[[-16,31,1.65],[-17.3,30,1.5],[-18,31.5,.48],[-12,34,1.45]]:[[18,48.5,1.6],[14.1,50.5,1.3],[13,50.5,1.25],[17,47.5,.5]],edgeAt=(x,z)=>Math.min(x-x0,x1-x,z-z0,z1-z),wearAt=(x,z)=>{const grain=(landNoise(x*2.3,z*2.3)-.5)*.28;let worn=0;for(const path of paths)worn=Math.max(worn,1-landEase(path.w*.38,path.w*1.37,pathDistance(x,z,path.p)+grain));const cx=lighthouse?-16.7:17.7,cz=lighthouse?31.05:48.8,d=Math.hypot((x-cx)/(lighthouse?2.5:1.6),(z-cz)/(lighthouse?1.72:1.25));return Math.max(worn,(1-landEase(.35,1.12,d))*.93);},colorAt=(x,z)=>{const broad=landNoise(x*.43+9,z*.43-6),fine=landNoise(x*2.8,z*2.8),grass=landMix([.265,.325,.22],[.38,.405,.275],broad),soil=landMix([.47,.415,.295],[.62,.55,.405],fine*.45+broad*.40),shingle=landMix([.405,.43,.365],[.56,.535,.425],broad),edge=1-landEase(.12,1.36,edgeAt(x,z)+(broad-.5)*1.35);return landMix(landMix(grass,shingle,edge*.94),soil,wearAt(x,z)*.96);};
// A single continuous flat mesh keeps every playable point at y=1.600. Color
// boundaries meander; no decorative bump can lift or bury a walking character.
const nx=Math.ceil((x1-x0)/.65),nz=Math.ceil((z1-z0)/.65),point=(i,j)=>[x0+(x1-x0)*i/nx,1.6,z0+(z1-z0)*j/nz];
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1),cs=[a,b,c,d].map(v=>colorAt(v[0],v[2]));landTri(ground,[a,d,c],[cs[0],cs[3],cs[2]]);landTri(ground,[a,c,b],[cs[0],cs[2],cs[1]]);}
// The top edge is the authoritative walking rectangle. Chipped sides drop
// steeply beneath it, with no horizontal ledge outside the safe footprint.
const perimeter=[],corners=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];for(let side=0;side<4;side++){const a=corners[side],b=corners[(side+1)%4],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.68);for(let i=0;i<count;i++){const x=a[0]+(b[0]-a[0])*i/count,z=a[1]+(b[1]-a[1])*i/count,dx=x===x0?-1:x===x1?1:0,dz=z===z0?-1:z===z1?1:0,n=V.norm([dx,0,dz]),join=lighthouse?x===x1&&z>=32&&z<=36:x===x0&&z>=49&&z<=52,grain=landNoise(x*1.7,z*1.7),s=join?0:1,heights=[1.6,.86+grain*.13,.14+grain*.13,-1.65],ext=[0,(.11+grain*.12)*s,(.34+grain*.38)*s,(.18+grain*.15)*s],colors=[colorAt(x,z),landMix([.38,.40,.345],[.49,.47,.39],grain),landMix([.20,.27,.25],[.31,.34,.29],grain),[.18,.24,.23]];perimeter.push({x,z,n,join,rings:heights.map((y,k)=>[x+n[0]*ext[k],y,z+n[2]*ext[k]]),colors});}}
for(let i=0;i<perimeter.length;i++){const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];for(let band=0;band<3;band++){landTri(coast,[a.rings[band],b.rings[band],b.rings[band+1]],[a.colors[band],b.colors[band],b.colors[band+1]]);landTri(coast,[a.rings[band],b.rings[band+1],a.rings[band+1]],[a.colors[band],b.colors[band+1],a.colors[band+1]]);}
// Low angular stones break the exposed east/west margins. Their highest point
// stays below the walking floor and their wet outer face stays inside boat padding.
if(i%3===1&&!a.join&&Math.abs(a.n[0])>.9){const h=landHash(a.x+3,a.z),cx=a.x+a.n[0]*.18,cz=a.z,ry=.23+h*.18,rx=.27+h*.12,rz=.35+h*.19,cy=.93,top=[cx+a.n[0]*.06,cy+ry,cz-.04],base=[],mid=[];for(let j=0;j<6;j++){const t=j/6*Math.PI*2,r=.85+landHash(a.x+j,a.z)*.23;mid.push([cx+Math.sin(t)*rx*r,cy+.025*Math.sin(t*3),cz+Math.cos(t)*rz*r]);base.push([cx+Math.sin(t)*rx*.86,cy-ry,cz+Math.cos(t)*rz*.86]);}for(let j=0;j<6;j++){const k=(j+1)%6,c=landMix([.38,.415,.36],[.53,.53,.43],landHash(cx+j,cz));landTri(chips,[top,mid[j],mid[k]],[c,c,c]);landTri(chips,[mid[j],base[j],base[k]],[c,[.25,.31,.28],[.25,.31,.28]]);landTri(chips,[mid[j],base[k],mid[k]],[c,[.25,.31,.28],c]);}}}
// Loose drifts leave the authored routes, both reunion positions, all item
// targets, buildings and the two landings open. They do not use the prop RNG.
for(let z=z0+.7;z<z1-.45;z+=.92)for(let x=x0+.7;x<x1-.45;x+=.98){const xx=x+(landHash(x,z)-.5)*.58,zz=z+(landHash(z,x)-.5)*.58,e=edgeAt(xx,zz),coastal=e<2.15,noise=landNoise(xx*.8+12,zz*.8);if(e<.42||wearAt(xx,zz)>.13||(!coastal&&noise<.76)||landHash(xx+7,zz)<.29||clear.some(([cx,cz,r])=>Math.hypot(xx-cx,zz-cz)<r)||S.OBSTACLES.some(o=>xx>o[0]-.35&&xx<o[1]+.35&&zz>o[2]-.35&&zz<o[3]+.35))continue;grassClump(leaves,xx,zz,.72+landHash(xx,zz)*.42);}
make(p,ground,[1,1,1],undefined,undefined,undefined,MAT.ground);make(p,coast,[1,1,1],undefined,undefined,undefined,MAT.rock);make(p,chips,[1,1,1],undefined,undefined,undefined,MAT.rock);make(p,leaves,[1,1,1],undefined,undefined,undefined,MAT.foliage);
}
function tree(p,x,y,z,s=1){
// Bent trunks and feathered, drooping leaflets replace the broad triangular palm paddles.
const bend=.5*s,trunk=[];for(let k=0;k<6;k++)for(let i=0;i<7;i++){const point=(j,angle)=>{const t=j/6,r=(.15-t*.06)*s;return[x+bend*t*t+Math.sin(angle)*r,y+t*3.7*s,z+Math.cos(angle)*r];},a=i/7*Math.PI*2,b=(i+1)/7*Math.PI*2;R.quad(trunk,point(k,a),point(k,b),point(k+1,b),point(k+1,a),[.88+k*.025,.88+k*.025,.88+k*.025]);}make(p,trunk,C.wood,undefined,undefined,undefined,MAT.wood);
const crown=[x+bend,y+3.7*s,z];for(let k=0;k<10;k++){const a=k*Math.PI*2/10+.10*Math.sin(k*2),leaf=[],sn=Math.sin(a),cs=Math.cos(a),len=(2.12+(k%3)*.13)*s;
const at=v=>[crown[0]+sn*v*len,crown[1]+(Math.sin(v*Math.PI)*(.52+(k%2)*.08)-v*v*.93)*s,crown[2]+cs*v*len];
const side=(v,d)=>{const q=at(v);return[q[0]+cs*d,q[1]-.09*Math.abs(d),q[2]-sn*d];};
for(let j=0;j<8;j++){const t=j/8,tt=(j+1)/8,w=(1-t)*.028*s,ww=(1-tt)*.028*s;R.quad(leaf,side(t,w),side(t,-w),side(tt,-ww),side(tt,ww),[.86,.95,.88]);
 const v=.04+j*.112,spread=(.19+Math.sin(v*Math.PI)*.29)*s;for(const sign of[-1,1]){const A=at(v),B=side(Math.min(1,v+.10),spread*sign),C=side(Math.min(1,v+.21),spread*.72*sign);R.tri(leaf,A,...(sign===1?[C,B]:[B,C]),[.90+j*.018,.93+j*.012,.88+j*.018]);}}
make(p,leaf,tint(C.grass,.77+k*.035),undefined,undefined,undefined,MAT.foliage);}
for(const dx of[-.12,.14])make(p,geo.diamond,C.wood,[crown[0]+dx*s,crown[1]-.16*s,crown[2]],[.10*s,.14*s,.10*s],undefined,MAT.wood);
}
function lamp(p,emit,x,y,z,low=false){
const cy=y+(low?1.5:3.2),post=cy-y-.30;
cyl(p,low?C.wood:C.metal,x,y+post/2,z,low?.065:.045,post).material=low?MAT.wood:MAT.metal;
cyl(p,C.metal,x,y+.045,z,.12,.09,8);box(p,C.metal,x,cy-.30,z,.37,.065,.37);
// Open corner frames leave the amber glass visible from every approach.
for(const sx of[-1,1])for(const sz of[-1,1])box(p,C.metal,x+sx*.145,cy,z+sz*.145,.025,.55,.025);
box(p,C.metal,x,cy+.29,z,.39,.055,.39);
const l=box(emit,C.gold,x,cy,z,.235,.47,.235);l.emission=1;l.castShadow=false;
make(p,shape.cylinder(.25,.045,.23,8),C.metal,[x,cy+.43,z]);
}
function windowFrame(p,e,x,y,z,w=1,side=false){const rot=side==='back'?[0,Math.PI,0]:side?[0,Math.PI/2,0]:[0,0,0],g=p.add(new Node());g.pos=[x,y,z];g.rot=rot;box(g,C.wood,0,0,0,w+.24,1.42,.12);const h=box(e,C.gold,x,y,z+(side==='back'?-.075:side?0:.075),w,1.15,.04,rot);if(side&&side!=='back')h.pos[0]+=.075;h.emission=.7;h.castShadow=false;box(g,C.wood,0,0,.10,.07,1.18,.06);box(g,C.wood,0,0,.10,w,.07,.06);for(const k of[-1,1])box(g,C.roof,k*(w*.7),0,-.01,.28,1.28,.13,[0,k*.25,0]).material=MAT.wood;}
// Layered roof construction stays below the original eave/ridge outline.
// The former solid wedge hid the gable framing behind its outer end caps.
function harborRoof(p,x,z,w,d,h,col){
const eave=1.6+h,rise=h*.38,half=w/2+.55,front=z-d/2-.55,back=z+d/2+.55;
const roof=[],trim=[],gable=[],under=.085,roofColor=landMix(C.roof,C.stone,.24);
const point=(side,r,zz,drop=0)=>[x+side*r,eave+rise*(1-r/half)-drop,zz];
const slope=(mesh,side,a,b,c,d,color)=>R.quad(mesh,...(side>0?[a,b,c,d]:[d,c,b,a]),color);
const rows=Math.ceil(Math.hypot(half,rise)/.50),columns=Math.ceil((back-front)/.72),step=(back-front)/columns;
for(const side of[-1,1]){
 // A continuous dark backing closes the narrow joints and the roof underside.
 slope(roof,side,point(side,0,front,under),point(side,0,back,under),point(side,half,back,under),point(side,half,front,under),tint(roofColor,.66));
 for(let row=0;row<rows;row++){
  const r0=half*row/rows,r1=half*(row+1)/rows;
  for(let j=0;j<=columns;j++){
   const start=Math.max(front,front+(j-(row%2)*.5)*step),end=Math.min(back,front+(j+1-(row%2)*.5)*step);
   if(end-start<.04)continue;
   const left=start+(start>front?.008:0),right=end-(end<back?.008:0);
   // This coordinate hash never consumes the shared harbor/prop RNG stream.
   const wear=landHash(x+side*13+row*1.81,z+j*2.17),color=tint(roofColor,.88+wear*.19);
   const head=.044+wear*.006,butt=row===rows-1?0:.006+wear*.002;
   const a=point(side,r0,left,head),b=point(side,r0,right,head),c=point(side,r1,right,butt),d=point(side,r1,left,butt);
   slope(roof,side,a,b,c,d,color);
   // The shallow exposed butt gives each overlapping course an actual edge.
   slope(roof,side,d,c,point(side,r1,right,butt+.038),point(side,r1,left,butt+.038),tint(color,.67));
  }
 }
 // Narrow ridge covers retain the exact original peak, without round ribs.
 for(let j=0;j<columns;j++){
  const left=front+j*step+(j?.006:0),right=front+(j+1)*step-(j<columns-1?.006:0);
  slope(roof,side,point(side,0,left),point(side,0,right),point(side,.18,right,.006),point(side,.18,left,.006),tint(roofColor,1.03));
 }
 slope(trim,side,point(side,half,front),point(side,half,back),point(side,half,back,under),point(side,half,front,under),tint(C.wood,.70));
}
for(const sign of[-1,1]){
 const zz=sign<0?front:back;
 for(const side of[-1,1]){
  const a=point(side,0,zz),b=point(side,half,zz),c=point(side,half,zz,under),d=point(side,0,zz,under);
  R.quad(trim,...(sign*side>0?[d,c,b,a]:[a,b,c,d]),tint(C.wood,.76));
 }
 // Infill sits at the wall, behind the retained timber braces, under the roof.
 const wall=z+sign*(d/2+.015),shoulder=eave+rise*(1-w*.5/half)-under;
 const outline=[[x-w/2,eave,wall],[x+w/2,eave,wall],[x+w/2,shoulder,wall],[x,eave+rise-under,wall],[x-w/2,shoulder,wall]];
 const face=sign>0?outline:[outline[0],...outline.slice(1).reverse()];
 for(let i=1;i<face.length-1;i++)R.tri(gable,face[0],face[i],face[i+1],col);
}
make(p,roof,[1,1,1],undefined,undefined,undefined,MAT.roof);
make(p,trim,[1,1,1],undefined,undefined,undefined,MAT.wood);
make(p,gable,[1,1,1],undefined,undefined,undefined,MAT.plaster);
}
function house(p,e,x,z,w,d,h,col=C.cream){const y=1.6;cameraOccluders.push([x-w/2-.55,x+w/2+.55,y+h-.22,y+h*1.38,z-d/2-.55,z+d/2+.55],[x-1,x+1,y+h+.20,y+h+1.65,z+d*.12-1,z+d*.12+1]);box(p,C.stone,x,y+.25,z,w+.5,.5,d+.5);box(p,col,x,y+h/2,z,w,h,d).material=MAT.plaster;for(const sx of [-1,1])for(const sz of [-1,1])box(p,C.wood,x+sx*w*.49,y+h/2,z+sz*d*.49,.22,h,.22);for(let yy=.2;yy<h;yy+=1.4)box(p,C.wood,x,y+yy,z+d/2+.03,w+.08,.12,.14);harborRoof(p,x,z,w,d,h,col);box(p,C.wood,x,y+1.1,z+d/2+.08,1.35,2.2,.18);for(let i=-.5;i<.6;i+=.25)box(p,tint(C.plank,.8),x+i,y+1.08,z+d/2+.19,.17,2.08,.03).material=MAT.wood;make(p,geo.sphere,C.gold,[x+.4,y+1.1,z+d/2+.25],[.08,.08,.08]);windowFrame(p,e,x-w*.3,y+2.6,z+d/2+.12,1.05);windowFrame(p,e,x+w*.3,y+2.6,z+d/2+.12,1.05);windowFrame(p,e,x+w/2+.09,y+2.4,z,1.1,true);windowFrame(p,e,x-w*.28,y+2.4,z-d/2-.10,1.1,'back');windowFrame(p,e,x+w*.28,y+2.4,z-d/2-.10,1.1,'back');for(let yy=.2;yy<h;yy+=1.4)box(p,C.wood,x,y+yy,z-d/2-.03,w+.08,.12,.14);box(p,C.wood,x,y+1.0,z-d/2-.08,1.2,2,.16);box(p,C.stone,x-w*.3,y+h+.7,z-d*.25,.65,2.4,.7);
// Deep eaves and exposed rafters cast legible roof shadows.
for(const side of[-1,1]){box(p,tint(C.wood,.74),x+side*(w/2+.26),y+h-.08,z,.23,.22,d+.9);for(let zz=-d/2-.3;zz<d/2+.4;zz+=.62)beam(p,C.wood,[x+side*(w/2-.35),y+h-.20,z+zz],[x+side*(w/2+.48),y+h-.05,z+zz],.065);}
// Weathered half-timber gables, a dormer and hanging guild crest distinguish each inn.
for(const sign of[-1,1]){const front=z+sign*(d/2+.09);beam(p,C.wood,[x-w*.46,y+.3,front],[x-w*.20,y+h-.2,front],.075);beam(p,C.wood,[x+w*.46,y+.3,front],[x+w*.20,y+h-.2,front],.075);beam(p,C.wood,[x-w*.5,y+h,front],[x,y+h*1.38,front],.10);beam(p,C.wood,[x,y+h*1.38,front],[x+w*.5,y+h,front],.10);box(p,C.wood,x,y+h*1.15,front,.14,h*.30,.12);}
box(p,C.wood,x,y+h-.3,z+d/2+.28,w*.72,.18,.65);for(let xx=-w*.32;xx<=w*.33;xx+=.62)box(p,C.wood,x+xx,y+h+.15,z+d/2+.53,.055,.75,.07);box(p,C.wood,x,y+h+.53,z+d/2+.53,w*.73,.09,.11);
box(p,C.cream,x,y+h+.55,z+d*.12,1.5,1.3,1.5).material=MAT.plaster;make(p,geo.roof,C.roof,[x,y+h+1.2,z+d*.12],[2,.9,2]);windowFrame(p,e,x,y+h+.58,z+d*.12+.78,.65);
beam(p,C.metal,[x+w*.38,y+3.3,z+d/2],[x+w*.38,y+3.3,z+d/2+1.0],.04);const sign=box(p,C.teal,x+w*.38,y+2.9,z+d/2+.90,.75,.65,.10);sign.material=MAT.wood;make(p,geo.ring,C.gold,[x+w*.38,y+2.9,z+d/2+.96],[.21,.21,.21],[Math.PI/2,0,0]);
}
// Slightly uneven, split-end planks with separate edge timbers and pegged piles.
function deck(p,b){const[x0,x1,z0,z1,y]=b;for(let z=z0+.26;z<z1;z+=.52){const inset=rng()*.035;box(p,tint(C.plank,.84+rng()*.27),(x0+x1)/2,y-.12+(rng()-.5)*.018,z,x1-x0-inset,.24,.474,[0,(rng()-.5)*.0015,0]).material=MAT.wood;for(const x of[x0+.35,x1-.35])cyl(p,C.metal,x,y+.008,z,.022,.014,6);}
for(const x of[x0+.20,x1-.20]){for(let z=z0+.2;z<z1;z+=2.35){const n=cyl(p,tint(C.wood,.85+rng()*.22),x,.47,z,.17,2.8);n.rot[2]=(rng()-.5)*.045;cyl(p,C.wood,x,1.87,z,.19,.075);for(const h of[1.54,1.67])make(p,geo.ring,C.cream,[x,h,z],[.18,.18,.18],undefined,MAT.rope);box(p,C.wood,x,y-.48,z,.32,.23,.65);}box(p,C.wood,x,y-.36,(z0+z1)/2,.24,.4,z1-z0+.08);}
for(const z of[z0+.16,z1-.16])box(p,tint(C.wood,.88),(x0+x1)/2,y-.38,z,x1-x0+.12,.42,.22);
}
function person(parent,role='player'){
const root=parent.add(new Node()),j={},older=role==='bootstrap',scholar=role==='chartmaker';
root.avatar={role,time:0,motion:{run:0,phase:0,grounded:true},boat:false,reduced:false};
const coat=older?[.075,.235,.235]:scholar?[.29,.095,.125]:[.055,.115,.17],lining=older?[.25,.27,.20]:scholar?[.39,.25,.16]:[.26,.19,.12];
const skin=older?[.60,.38,.245]:scholar?[.65,.425,.29]:[.70,.45,.29],hair=older?[.43,.44,.39]:scholar?[.16,.09,.055]:[.12,.075,.045];
const leather=[.105,.080,.055],shirt=[.64,.61,.47],brass=[.59,.42,.20],trousers=scholar?[.23,.215,.19]:[.17,.20,.21];
const body=root.add(new Node());j.body=body;
const part=(p,g,c,pos,scale,rot,mat=MAT.cloth)=>make(p,g,c,pos,scale,rot,mat);
const ell=(p,c,pos,scale,mat=MAT.skin,rot=[0,0,0],g=geo.sphere)=>part(p,g,c,pos,scale,rot,mat);
const panel=(p,c,pts,thickness=.025,mat=MAT.cloth)=>{
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const area=pts.reduce((sum,a,i)=>{const b=pts[(i+1)%pts.length];return sum+a[0]*b[1]-b[0]*a[1];},0);
 let front=area<0?[pts[0],...pts.slice(1).reverse()]:pts.slice();
 // A concave lapel needs a visible fan origin; all outer faces then point +Z.
 for(let k=0;k<front.length;k++){const f=front.slice(k).concat(front.slice(0,k));if(f.slice(1,-1).every((v,i)=>cross(f[0],v,f[i+2])>0)){front=f;break;}}
 const g=[],back=front.map(v=>[v[0],v[1],v[2]-thickness]);
 for(let i=1;i<front.length-1;i++){R.tri(g,front[0],front[i],front[i+1]);R.tri(g,back[0],back[i+1],back[i]);}
 for(let i=0;i<front.length;i++)R.quad(g,front[i],back[i],back[(i+1)%front.length],front[(i+1)%front.length]);
 return part(p,g,c,undefined,undefined,undefined,mat);};
// Long legs, a compact ribcage and a 0.326-unit head give an adult seven-head silhouette.
part(body,shape.lathe([[.215,-.28],[.23,-.15],[.275,.13],[.295,.25],[.205,.31]],12),coat,[0,1.405,0],[1,1,.64]);
part(body,shape.lathe([[.22,-.055],[.235,.035],[.21,.09]],12),lining,[0,1.12,0],[1,1,.7]);
panel(body,shirt,[[-.13,1.70,.135],[.13,1.70,.135],[.105,1.21,.165],[-.105,1.21,.165]],.025);
for(const side of[-1,1]){
 panel(body,coat,[[side*.075,1.18,.17],[side*.235,1.20,.13],[side*.31,.78,.12],[side*.12,.71,.19]],.10);
 panel(body,tint(coat,.82),[[side*.02,1.16,-.15],[side*.225,1.17,-.12],[side*.29,.69,-.17],[side*.045,.65,-.21]],.045);
 panel(body,lining,[[side*.13,1.72,.14],[side*.27,1.60,.185],[side*.18,1.42,.215],[side*.08,1.31,.19],[side*.115,1.57,.20]],.035);
 panel(body,shirt,[[side*.045,1.75,.12],[side*.13,1.71,.145],[side*.11,1.59,.205],[side*.025,1.66,.18]],.018);
 for(let k=0;k<3;k++)ell(body,brass,[side*.185,1.27+k*.10,.199],[.018,.018,.010],MAT.metal,undefined,geo.detail);
 // Narrow seams and rubbed edges read as tailoring without more draw calls.
 panel(body,tint(lining,1.22),[[side*.243,1.16,.181],[side*.255,1.16,.176],[side*.308,.79,.151],[side*.294,.78,.16]],.006);
}
part(body,shape.lathe([[.237,-.035],[.239,.035]],12),[.36,.105,.075],[0,1.145,0],[1,1,.76],[0,0,.035]);
part(body,shape.lathe([[.242,-.022],[.242,.022]],12),leather,[0,1.11,0],[1,1,.77],undefined,MAT.leather);
part(body,geo.box,brass,[0,1.11,.192],[.095,.072,.025],undefined,MAT.metal);
part(body,geo.box,leather,[0,1.11,.208],[.057,.041,.010],undefined,MAT.leather);
// The neck and scarf sit above the jacket instead of merging the head into the shoulders.
part(body,shape.lathe([[.068,-.08],[.075,.06]],10),skin,[0,1.78,0],[1,1,.9],undefined,MAT.skin);
ell(body,[.37,.12,.08],[0,1.73,.12],[.07,.052,.038],MAT.cloth,undefined,geo.detail);
panel(body,[.37,.12,.08],[[-.02,1.72,.157],[.045,1.71,.15],[.075,1.52,.185],[.015,1.55,.192]],.018);
const head=body.add(new Node());head.pos=[0,1.94,.005];j.head=head;
part(head,shape.lathe([[.025,-.153],[.083,-.139],[.12,-.086],[.137,-.015],[.14,.060],[.121,.126],[.064,.166],[0,.173]],16),skin,[0,0,0],[1,1,.86],undefined,MAT.skin);
for(const side of[-1,1]){
 ell(head,tint(skin,.91),[side*.137,-.01,-.005],[.027,.046,.026],MAT.skin,undefined,geo.detail);
 ell(head,tint(skin,.68),[side*.151,-.009,.008],[.010,.025,.012],MAT.skin,undefined,geo.detail);
 // Recessed, naturally small eyes: no oversized white blocks.
 ell(head,tint(skin,.63),[side*.055,.030,.111],[.031,.016,.011],MAT.skin,undefined,geo.detail);
 ell(head,[.59,.56,.46],[side*.055,.030,.120],[.023,.010,.009],MAT.skin,undefined,geo.detail);
 ell(head,[.09,.105,.072],[side*.054,.030,.128],[.008,.009,.0038],MAT.skin,undefined,geo.detail);
 ell(head,[.025,.028,.021],[side*.054,.030,.131],[.0036,.006,.002],MAT.skin,undefined,geo.detail);
 ell(head,hair,[side*.055,.056,.116],[.033,.009,.012],MAT.hair,[0,0,side*-.14],geo.detail);
 ell(head,tint(skin,.96),[side*.067,-.021,.105],[.046,.030,.021],MAT.skin,undefined,geo.detail);
}
// A shaped bridge, nostrils and tapered jaw keep expressions readable in close views.
const nose=[];const nA=[-.018,.053,.115],nB=[.018,.053,.115],nC=[.025,-.025,.128],nD=[-.025,-.025,.128],nTip=[0,-.010,.174];
R.tri(nose,nA,nD,nTip);R.tri(nose,nA,nTip,nB);R.tri(nose,nB,nTip,nC);R.tri(nose,nD,nC,nTip);part(head,nose,tint(skin,1.035),undefined,undefined,undefined,MAT.skin);
for(const side of[-1,1])ell(head,tint(skin,.55),[side*.016,-.023,.142],[.008,.0045,.007],MAT.skin,undefined,geo.detail);
ell(head,[.35,.18,.13],[0,-.072,.112],[.039,.006,.008],MAT.skin,undefined,geo.detail);
ell(head,tint(skin,.93),[0,-.083,.113],[.032,.007,.008],MAT.skin,undefined,geo.detail);
ell(head,tint(skin,1.04),[0,-.112,.088],[.049,.022,.023],MAT.skin,undefined,geo.detail);
// Hair is built around the skull and nape; Bootstrap has a separate forked salt beard.
ell(head,hair,[0,.104,-.033],[.145,.083,.128],MAT.hair);
for(const side of[-1,1]){
 ell(head,hair,[side*.123,-.029,-.039],[.033,.133,.066],MAT.hair,[0,0,side*.08]);
 ell(head,tint(hair,.77),[side*.102,-.139,-.069],[.035,scholar?.089:.064,.04],MAT.hair,[.15,0,side*.1],geo.detail);
}
if(older){
 const beard=[];for(let i=0;i<12;i++){const a=-1.18+i/12*2.36,b=-1.18+(i+1)/12*2.36,top=t=>[Math.sin(t)*.124,-.059+Math.abs(Math.sin(t))*.014,Math.cos(t)*.118],bottom=t=>[Math.sin(t)*.078,-.211+Math.abs(Math.sin(t))*.070,Math.cos(t)*.104];R.quad(beard,top(a),bottom(a),bottom(b),top(b));}part(head,beard,hair,undefined,undefined,undefined,MAT.hair);
 for(const side of[-1,1])ell(head,tint(hair,1.20),[side*.041,-.052,.137],[.046,.016,.025],MAT.hair,[0,0,side*.16],geo.detail);
 for(const side of[-1,1])ell(head,tint(hair,.85),[side*.033,-.178,.087],[.035,.061,.038],MAT.hair,[0,0,-side*.10],geo.detail);
}else if(!scholar){
 const stubble=[];for(let i=0;i<9;i++){const a=-1.27+i/9*2.54,b=-1.27+(i+1)/9*2.54,pt=(t,y,r)=>[Math.sin(t)*r,y,Math.cos(t)*r*.88];R.quad(stubble,pt(a,-.098,.104),pt(a,-.144,.080),pt(b,-.144,.080),pt(b,-.098,.104));}part(head,stubble,tint(hair,1.35),undefined,undefined,undefined,MAT.hair);
}
if(scholar){
 // A low wrapped headscarf, tied hair and fine spectacles make the chartmaker distinct.
 part(head,shape.lathe([[.14,-.018],[.146,.016],[.135,.044]],12),coat,[0,.111,-.012],[1,1,.9],undefined,MAT.cloth);
 ell(head,hair,[0,-.14,-.114],[.065,.064,.054],MAT.hair,undefined,geo.detail);
 for(const side of[-1,1])part(head,shape.torus(1,.065,12,4),brass,[side*.055,.030,.139],[.032,.032,.032],[Math.PI/2,0,0],MAT.metal);
 part(head,geo.box,brass,[0,.033,.140],[.045,.006,.006],undefined,MAT.metal);
 for(const side of[-1,1])part(head,geo.box,brass,[side*.104,.032,.080],[.005,.005,.115],[0,side*.38,0],MAT.metal);
}else{
 const hat=head.add(new Node());hat.pos=[0,.145,0];hat.rot=[-.035,Math.PI,0];const brim=[],edge=[];
 const pt=t=>{const r=.235+.075*Math.cos(t*3);return[Math.sin(t)*r,.018+.083*(1-Math.cos(t*3)),Math.cos(t)*r];};
 for(let k=0;k<24;k++){const a=k/24*Math.PI*2,b=(k+1)/24*Math.PI*2,A=pt(a),B=pt(b);R.tri(brim,[0,.025,0],A,B);R.quad(edge,A,[A[0]*.97,A[1]+.012,A[2]*.97],[B[0]*.97,B[1]+.012,B[2]*.97],B);}
 part(hat,brim,[.085,.075,.058],undefined,undefined,undefined,MAT.leather);part(hat,edge,[.35,.27,.145],undefined,undefined,undefined,MAT.leather);
 part(hat,shape.lathe([[.141,0],[.136,.095],[.112,.148],[.04,.159]],12),[.080,.072,.057],[0,.018,0],[1,1,.91],undefined,MAT.leather);
 part(hat,shape.lathe([[.144,0],[.143,.027]],12),lining,[0,.028,0],[1,1,.92],undefined,MAT.leather);
 part(hat,geo.box,brass,[0,.060,-.138],[.055,.041,.012],undefined,MAT.metal);
}
for(const side of[-1,1]){
 const leg=body.add(new Node());leg.pos=[side*.145,1.07,0];j[side===-1?'legL':'legR']=leg;
 part(leg,shape.lathe([[.080,-.58],[.096,-.33],[.119,-.055],[.103,.035]],10),trousers,undefined,[1,1,.89]);
 part(leg,shape.lathe([[.091,-.96],[.085,-.82],[.101,-.60],[.119,-.52]],10),leather,undefined,[1,1,1.03],undefined,MAT.leather);
 ell(leg,leather,[0,-.974,.069],[.108,.081,.187],MAT.leather);
 ell(leg,[.055,.047,.038],[0,-1.033,.074],[.112,.022,.192],MAT.leather);
 part(leg,shape.lathe([[.119,-.565],[.128,-.555],[.126,-.505],[.111,-.493]],10),tint(leather,1.5),undefined,[1,1,.98],undefined,MAT.leather);
 part(leg,geo.box,tint(leather,1.8),[0,-.80,.102],[.165,.028,.022],undefined,MAT.leather);
 const arm=body.add(new Node());arm.pos=[side*.322,1.675,0];j[side===-1?'armL':'armR']=arm;
 ell(arm,coat,[side*.007,-.045,0],[.105,.133,.107],MAT.cloth);
 part(arm,shape.lathe([[.073,-.493],[.081,-.315],[.100,-.065],[.086,.024]],10),coat,undefined,[1,1,.93]);
 part(arm,shape.lathe([[.088,-.523],[.103,-.495],[.105,-.431],[.091,-.416]],10),lining,undefined,[1,1,1.02]);
 part(arm,shape.lathe([[.078,-.549],[.080,-.517]],10),shirt,undefined,[1,1,.92]);
 // Flattened palms, individually rounded fingers and an opposed thumb replace ball hands.
 ell(arm,skin,[0,-.605,.008],[.057,.074,.033],MAT.skin);
 for(let k=-1;k<=1;k++)ell(arm,skin,[k*.034,-.679+(Math.abs(k)*.009),.013],[.018,.044,.028],MAT.skin,undefined,geo.detail);
 ell(arm,tint(skin,.97),[-side*.053,-.596,.029],[.025,.050,.028],MAT.skin,[0,0,-side*.48],geo.detail);
}
// Leather satchel, stitched strap and tools keep role silhouettes legible at game distance.
part(body,shape.lathe([[.095,-.14],[.115,-.09],[.11,.10],[.08,.15]],8),scholar?[.30,.18,.09]:[.24,.12,.065],[.285,1.035,-.04],[1,1,1.10],[0,0,-.08],MAT.leather);
panel(body,tint(leather,1.8),[[-.22,1.65,.177],[-.165,1.66,.189],[.24,1.08,.203],[.185,1.07,.214]],.018,MAT.leather);
if(scholar){
 for(const x of[-.085,.085])part(body,geo.cyl,shirt,[x,1.19,-.25],[.105,.56,.105],[0,0,-.10],MAT.cloth);
 part(body,geo.box,leather,[0,1.17,-.30],[.30,.055,.05],undefined,MAT.leather);
}else if(older){
 part(body,geo.box,leather,[-.275,1.025,.07],[.13,.19,.12],undefined,MAT.leather);
 part(body,geo.cyl,[.23,.25,.23],[-.29,1.08,.145],[.034,.31,.034],undefined,MAT.metal);
 part(body,geo.box,[.23,.25,.23],[-.29,1.235,.145],[.16,.055,.07],undefined,MAT.metal);
}
for(const n of[j.head,j.armL,j.armR,j.legL,j.legR])mergeRigid(n);
const moving=[j.head,j.armL,j.armR,j.legL,j.legR],st=new Node();st.children=body.children.filter(n=>!moving.includes(n));body.children=moving;body.add(R.batch(st));
return{root,j,animate(t,c,helm=false,reduced=false){root.avatar.time=t;root.avatar.motion={run:c.run||0,phase:c.phase||0,grounded:c.grounded!==false,landing:c.landing||0,interacting:c.interacting||0};root.avatar.boat=helm;root.avatar.reduced=reduced;const a=Math.sin(c.phase||t*1.5)*(c.run||0)*.60,air=c.grounded===false;j.legL.rot[0]=air?-.45:a;j.legR.rot[0]=air?.30:-a;j.armL.rot[0]=helm?-1.02:air?-.6:-a*.85;j.armR.rot[0]=helm?-1.02:air?-.6:a*.85;j.armL.rot[2]=helm?-.14:.035;j.armR.rot[2]=helm?.14:-.035;if(c.interacting>0)j.armR.rot[0]=-1.8;j.body.pos[1]=reduced?0:(Math.abs(Math.sin((c.phase||0)*2))*(c.run||0)*.035-(c.landing||0)*.35);j.head.rot[1]=helm?0:Math.sin(t*.8)*.035;}};
}
function boat(parent){const root=parent.add(new Node()),staticGroup=new Node(),hull=[],top=[],sections=[];
// Rounded sections and a rising sheer create an actual clinker-built launch silhouette.
for(let k=0;k<=18;k++){const t=k/18,z=-2.30+t*4.85,w=.035+1.16*Math.pow(Math.sin((.13+t*.87)*Math.PI),.72),sheer=.41+.17*Math.pow(Math.abs(t-.45)*2,2);sections.push([z,w,sheer]);}
const section=(q,j,s)=>{const[z,w,h]=q,t=j/6;return[s*w*Math.pow(t,.66),-.43+(h+.43)*Math.pow(t,1.45),z];};
for(let k=0;k<sections.length-1;k++){const q=sections[k],r=sections[k+1];for(const sign of[-1,1])for(let j=0;j<6;j++){const col=[.79+j*.032,.79+j*.032,.79+j*.032];R.quad(hull,section(q,j,sign),section(r,j,sign),section(r,j+1,sign),section(q,j+1,sign),col);}const[z,w,h]=q,[zz,ww,hh]=r;R.quad(top,[-w*.93,.395,z],[-ww*.93,.395,zz],[ww*.93,.395,zz],[w*.93,.395,z]);for(const sign of[-1,1]){beam(staticGroup,C.cream,[sign*w,h+.045,z],[sign*ww,hh+.045,zz],.055).material=MAT.wood;beam(staticGroup,C.wood,[sign*w*.97,h-.04,z],[sign*ww*.97,hh-.04,zz],.043);for(const j of[2,4])beam(staticGroup,tint(C.wood,.70),section(q,j,sign),section(r,j,sign),.018);}}
make(staticGroup,hull,C.wood,undefined,undefined,undefined,MAT.wood);make(staticGroup,top,C.plank,undefined,undefined,undefined,MAT.wood);
const q=sections[0];box(staticGroup,C.wood,0,.06,-2.30,q[1]*2,.76,.10);beam(staticGroup,C.wood,[0,-.42,-2.30],[0,-.42,2.52],.065);
for(let k=0;k<sections.length;k+=2){const[z,w,h]=sections[k];box(staticGroup,tint(C.plank,.85),0,.408,z,w*1.83,.025,.035);for(const sign of[-1,1])beam(staticGroup,C.wood,[sign*w*.90,.40,z],[sign*w,h,z],.042);}
for(const z of[-1.48,1.05]){const w=z<0?1.02:.75;box(staticGroup,C.teal,0,.60,z,w*2,.12,.36).material=MAT.wood;for(const side of[-1,1])box(staticGroup,C.wood,side*w*.75,.48,z,.09,.24,.30);}
box(staticGroup,C.wood,0,.80,.45,.14,.80,.14);make(staticGroup,geo.ring,C.gold,[0,1.11,.42],[.31,.31,.31],[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;beam(staticGroup,C.wood,[0,1.11,.42],[Math.sin(a)*.40,1.11+Math.cos(a)*.40,.42],.025);}
for(const s of[-1,1]){beam(staticGroup,C.wood,[s*.83,.53,-1.75],[s*.96,.55,.90],.035);box(staticGroup,C.plank,s*.96,.55,1.08,.12,.045,.49);make(staticGroup,geo.ring,C.metal,[s*1.12,.55,-.2],[.073,.073,.073],[Math.PI/2,0,0]);}
for(let k=0;k<4;k++)make(staticGroup,geo.ring,C.cream,[-.55,.425+k*.025,-1.9],[.19+k*.028,.11,.19+k*.028],undefined,MAT.rope);
cyl(staticGroup,C.wood,0,1.55,-1.8,.046,2.5);root.add(R.batch(staticGroup));const pennant=make(root,shape.flag(1.0,.60),C.dark,[0,2.8,-1.8],[1,1,1],[0,.2,0]);pennant.kind=2;pennant.material=MAT.cloth;pennant.castShadow=false;
const repair=root.add(new Node());for(let z=-1.5;z<=1;z+=.7)box(repair,C.plank,0,.43,z,1.70,.045,.48);mergeRigid(repair);make(root,geo.ring,C.cream,[1.04,.15,-.75],[.35,.35,.35],[Math.PI/2,0,Math.PI/2]);return{root,pennant,repair};}
function create(){seed=261020;cameraOccluders=[];const root=new Node(),staticG=new Node(),emit=new Node(),dynamic=root.add(new Node());
const water=make(root,shape.plane(230,72),[1,1,1],[0,.06,12]);water.kind=1;water.castShadow=false;
// Main quay: stone escarpment, warm paving and wind-bent margins.
box(staticG,C.stone,0,-.14,-8,40,3.12,36);box(staticG,C.sand,0,1.51,-8,40,.18,36);
for(let z=-25.4;z<9.4;z+=.9)for(let x=-4.5;x<4.5;x+=.9)box(staticG,tint(C.pale,.90+rng()*.14),x+(Math.floor(z)%2)*.2,1.618,z,.81,.075,.81).material=MAT.stone;
for(let x=-19.5;x<20;x+=1.6){rock(staticG,x,-.2,-26.1,1.0,1.65,.7);rock(staticG,x,-.2,10.05,1.1,1.65,.7);}for(let z=-24;z<10;z+=1.65){rock(staticG,-20,-.2,z,.7,1.7,1.0);rock(staticG,20,-.2,z,.7,1.7,1.1);}
for(const[x,z]of[[-18,-23],[-7,-23],[18,-22],[18,-3],[-18,-5],[8,8],[17,8],[-5,8]]){plantingBed(staticG,x,z);tree(staticG,x,1.6,z,.9+rng()*.2);}
house(staticG,emit,-12.5,-15.5,9,9,4.1);house(staticG,emit,11.5,-10.5,9,9,3.9,[.65,.65,.49]);house(staticG,emit,-12,3.5,8,7,3.4,[.58,.50,.35]);
// An open market stall, rope coils and stacked cargo invite exploration.
for(const x of[-5,0])cyl(staticG,C.wood,x,2.9,-4,.08,2.6);for(const x of[-5,0])cyl(staticG,C.wood,x,2.9,-7,.08,2.6);for(let i=0;i<6;i++){const fabric=[];for(let k=0;k<12;k++){const z=-7.15+k*3.3/12,zz=z+3.3/12,h=t=>4.14-.16*Math.sin((t+7.15)/3.3*Math.PI)-.09*(t+5.5);R.quad(fabric,[-5.02+i*.83,h(z),z],[-5.02+i*.83,h(zz),zz],[-4.18+i*.83,h(zz),zz],[-4.18+i*.83,h(z),z]);}make(staticG,fabric,i%2?C.cream:C.teal,undefined,undefined,undefined,MAT.cloth);}for(let i=0;i<6;i++){const n=box(staticG,i%2?C.cream:C.teal,-4.6+i*.83,3.87,-3.83,.82,.36,.055);n.material=MAT.cloth;}box(staticG,C.wood,-2.5,2.2,-5.5,4.7,1.1,1.5);for(let i=0;i<8;i++)make(staticG,geo.sphere,[.69,.31,.14],[-4+i*.42,2.9,-5.3],[.17,.15,.18]);
for(const[x,z]of[[-6,-8],[-6.8,-9],[6,-4],[7,-3],[-6,3],[3.3,8],[13,5],[16,4],[-18,8]])barrel(staticG,x,1.6,z,.8+rng()*.4);
for(const[x,z,s]of[[5,-19,1.2],[6.3,-19,1],[5,-17.7,.9],[-6,1,1],[10,5,1.25],[11.4,5,.9],[-17,-8,1]])crate(staticG,x,1.6,z,s);
for(const[x,z]of[[-6,-21],[6,-17],[-5,7],[5,6],[-4,19],[12,51],[-11,34]])lamp(staticG,emit,x,1.6,z);
for(const[x,z]of[[-1.5,-15],[17,47.5],[-18,31.5]])lamp(staticG,emit,x,1.6,z,true);
for(const b of S.SURFACES.slice(1,4))deck(staticG,b);
// Broken pier is a real gap, with striped edges and no deceptive invisible floor.
box(staticG,C.gold,0,1.64,13.85,5.8,.06,.12);box(staticG,C.gold,0,1.64,15.75,5.8,.06,.12);
// Massive coping blocks, tide-darkened footings and attached mooring fittings.
for(const side of[-1,1])for(let z=-24.8;z<9.4;z+=1.25){box(staticG,tint(C.pale,.85+rng()*.18),side*19.96,1.44,z,.44,.26,1.16,[0,(rng()-.5)*.012,0]).material=MAT.stone;}
for(let x=-19.3;x<19.6;x+=1.25)if(Math.abs(x)>4.6){box(staticG,tint(C.pale,.88+rng()*.14),x,1.44,9.94,1.16,.25,.43).material=MAT.stone;box(staticG,tint(C.stone,.55),x,.1,10.06,1.21,.35,.24).material=MAT.stone;}
for(const[x,z]of[[-7,8.9],[11,8.9],[-18.8,-3],[18.8,-16]]){cyl(staticG,C.metal,x,1.78,z,.10,.30);box(staticG,C.metal,x,1.91,z,.38,.065,.10);for(let k=0;k<4;k++)make(staticG,geo.ring,C.cream,[x+.42,1.65+k*.025,z],[.22+k*.025,.10,.22+k*.025],undefined,MAT.rope);}
// Story islands and their actual safe berths.
for(const b of [S.SURFACES[4],S.SURFACES[6]]){coastalIsland(staticG,b,b===S.SURFACES[6]);for(let x=b[0];x<=b[1];x+=1.5)for(const z of[b[2],b[3]])rock(staticG,x,-.2,z,1.1,1.6,.8);}
deck(staticG,S.SURFACES[5]);deck(staticG,S.SURFACES[7]);house(staticG,emit,18.5,54.5,7,5,3.7,[.69,.61,.45]);tree(staticG,23,1.6,49,1.1);tree(staticG,14.5,1.6,57,.9);
// Lighthouse: tapered masonry, balcony, glazing and an amber cap.
for(let i=0;i<6;i++)make(staticG,shape.cylinder(2.15-i*.12,2.03-i*.12,2.1,16),i%2?C.cream:C.rust,[-20,2.65+i*2.1,35],undefined,undefined,MAT.plaster);cyl(staticG,C.wood,-20,14.5,35,2, .22,16);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cyl(staticG,C.metal,-20+Math.sin(a)*1.9,15.05,35+Math.cos(a)*1.9,.035,.95);}const glow=cyl(emit,C.gold,-20,15.4,35,1.15,1.6,12);glow.emission=1;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cyl(staticG,C.metal,-20+Math.sin(a)*1.20,15.4,35+Math.cos(a)*1.20,.05,1.8);}make(staticG,shape.cylinder(1.9,0,1.8,12),C.dark,[-20,17.1,35],undefined,undefined,MAT.metal);box(staticG,C.wood,-20,2.85,32.83,1.15,2.4,.20);
const beacon=dynamic.add(new Node());beacon.pos=[-20,15.4,35];beacon.rot[0]=.22;const lightCone=make(beacon,shape.cylinder(.12,4.5,62,24),[1,.85,.48],[0,0,31],[1,1,1],[Math.PI/2,0,0]);lightCone.effect='beaconBeam';lightCone.emission=1;lightCone.alpha=.055;lightCone.castShadow=false;const reflector=make(beacon,geo.sphere,C.gold,[0,0,.5],[.50,.50,.15]);reflector.emission=1;reflector.castShadow=false;
// Passage bridge with rock shoulders: boats must actually pass through its opening.
for(const b of S.ROCKS){for(let x=b[0]+1.5;x<b[1];x+=3){const z=(b[2]+b[3])/2,n=rock(staticG,x,1.2,z,2.3,2.8,3.6),m=R.M.compose(n.pos,n.rot,n.scale),bounds=[Infinity,-Infinity,Infinity,-Infinity];
// Test the authored footprint, not the boat collision rectangle: rotated shoulders can extend onto safe land.
for(let i=0;i<n.mesh.length;i+=9){const p=R.M.point(m,n.mesh.slice(i,i+3));bounds[0]=Math.min(bounds[0],p[0]);bounds[1]=Math.max(bounds[1],p[0]);bounds[2]=Math.min(bounds[2],p[2]);bounds[3]=Math.max(bounds[3],p[2]);}
const onLand=S.SURFACES.some(s=>bounds[1]>=s[0]&&bounds[0]<=s[1]&&bounds[3]>=s[2]&&bounds[2]<=s[3]);if(onLand){n.pos[1]=.30;n.scale[1]=.55;n.rot[0]=0;n.rot[2]=0;}
const growTree=rng()>.6;if(growTree&&!onLand)tree(staticG,x,3,z,.65);}}
for(const x of[-8.4,8.4]){box(staticG,C.stone,x,3.9,30,1.9,7.8,4.5);box(staticG,C.pale,x,7.9,30,2.3,.25,4.8);cyl(staticG,C.wood,x,8.6,30,.09,1.4);}
const bridge=dynamic.add(new Node());bridge.pos=[-8.4,2.1,30];const leaf=new Node();for(let x=.2;x<16.7;x+=.47)box(leaf,C.plank,x,0,0,.42,.30,3.7);for(const z of[-1.6,1.6]){box(leaf,C.wood,8.4,-.28,z,17,.4,.22);box(leaf,C.dark,8.4,.50,z,17,.10,.10).material=MAT.wood;for(let x=.1;x<17;x+=1.5)cyl(leaf,C.wood,x,.25,z,.04,.65);}bridge.add(R.batch(leaf));
// The recovered parts become a working winch, with a visible brace and load rope.
const mech=dynamic.add(new Node());mech.pos=[-1.8,1.6,21];box(mech,C.wood,0,.15,0,1.7,.3,1.2);for(const x of [-.65,.65]){box(mech,C.wood,x,.83,0,.20,1.45,.32);box(mech,C.metal,x,1.12,0,.32,.24,.40);}box(mech,C.metal,0,1.12,0,1.5,.15,.18);box(mech,C.metal,0,.32,.35,1.5,.14,.22);
const winchGear=mech.add(new Node());winchGear.pos=[0,1.12,-.32];make(winchGear,geo.ring,C.gold,[0,0,0],[.48,.48,.48],[Math.PI/2,0,0]);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;box(winchGear,C.metal,Math.sin(a)*.52,Math.cos(a)*.52,0,.15,.19,.18,[0,0,-a]);}for(const a of [0,Math.PI/3,Math.PI*2/3])box(winchGear,C.gold,0,0,0,.83,.06,.12,[0,0,a]);box(winchGear,C.wood,.36,0,-.18,.15,.15,.38);
const winchBrace=mech.add(new Node());beam(winchBrace,C.plank,[-.78,.25,-.45],[.65,1.34,.1],.12);beam(winchBrace,C.plank,[.78,.25,-.45],[-.65,1.34,.1],.12);for(const x of [-.62,.62]){for(let i=0;i<3;i++)make(winchBrace,geo.ring,C.cream,[x,1.13+i*.065,0],[.22,.22,.22],[Math.PI/2,0,0],MAT.rope);}
const winchRope=mech.add(new Node());for(let k=0;k<5;k++)make(winchRope,geo.ring,C.cream,[0,1.12,-.12+k*.07],[.27,.27,.27],[Math.PI/2,0,0],MAT.rope);beam(winchRope,C.cream,[0,1.40,.12],[-6.6,2.45,8.8],.045).material=MAT.rope;make(winchRope,geo.ring,C.gold,[-6.6,2.45,8.8],[.25,.25,.25],[Math.PI/2,0,0]);
// Distant islands form an original backdrop, not fake mission entrances.
for(const[x,z,s]of[[-59,48,11],[-48,81,13],[1,95,19],[41,88,17],[59,49,12],[-62,-22,14],[60,-26,14]]){const height=4+s*.12;rock(staticG,x,-1,z,s*.86,height,s*.70);for(const side of[-1,1])rock(staticG,x+side*s*.57,-.65,z+side*s*.17,s*.49,height*.56,s*.45);for(let i=0;i<9;i++){const dx=(rng()-.5)*s*.88,dz=(rng()-.5)*s*.48;tree(staticG,x+dx,-1+height*.72,z+dz,1.15+rng()*1.2);}}
// Boardwalk pennants, mooring ropes and lantern color carry the Black Flag identity.
const flags=[];for(const[x,z,y]of[[-5,-12,5.4],[5,8,5],[-8.4,30,9.2],[8.4,30,9.2],[15,50,4.8],[-12,34,4.8]]){cyl(staticG,C.wood,x,(y+1.6)/2,z,.055,y-1.6);const f=make(dynamic,shape.flag(1.2,.7),C.dark,[x,y,z],[1,1,1],[0,.25,0]);f.kind=2;f.material=MAT.cloth;flags.push(f);}
for(let x=-5;x<5;x+=.7)beam(staticG,C.cream,[x,4.5,-12],[x+.7,4.5,-12],.015).material=MAT.rope;
const buoys=[];for(const z of[25,35,43,50])for(const x of[-5.3,5.3]){const b=dynamic.add(new Node());b.pos=[x,.3,z];cyl(b,C.teal,0,0,0,.36,.40,8);cyl(b,C.cream,0,.35,0,.16,.4,8);make(b,geo.cone,C.teal,[0,.80,0],[.5,.65,.5]);mergeRigid(b);buoys.push(b);}
// Original collectible models: iron cog, bundled timber, coiled rope.
const items={};for(const id of S.PARTS){const pos=S.TARGETS[id],i=dynamic.add(new Node());i.pos=[pos[0],2.22,pos[1]];const ring=make(i,geo.ring,C.gold,[0,0,0],[.8,.8,.8]);ring.emission=.35;ring.castShadow=false;if(id==='timber'){for(let k=-1;k<=1;k++)box(i,C.plank,k*.2,.28,0,.17,.23,1.1,[.15,0,.1]);}else if(id==='rope'){for(let k=0;k<3;k++)make(i,geo.ring,C.cream,[0,.18+k*.1,0],[.40,.40,.40],undefined,MAT.rope);}else{make(i,geo.ring,C.gold,[0,.4,0],[.48,.48,.48],[Math.PI/2,0,0]);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;box(i,C.metal,Math.sin(a)*.52,.40+Math.cos(a)*.52,0,.15,.19,.2,[0,0,-a]);}}mergeRigid(i);items[id]=i;}
const chart=dynamic.add(new Node());chart.pos=[-18,2.3,6];box(chart,C.cream,0,0,0,.8,.05,.6,[.4,0,.1]);for(let k=0;k<3;k++)box(chart,C.teal,-.2+k*.2,.10,0,.06,.015,.28,[.4,0,.1]);
const marker=make(dynamic,geo.diamond,C.gold,[0,4,-15],[.18,.25,.18]);marker.emission=.85;marker.castShadow=false;
const player=person(dynamic),bootstrap=person(dynamic,'bootstrap'),cartographer=person(dynamic,'chartmaker'),launch=boat(dynamic);bootstrap.root.pos=[0,1.6,-15];bootstrap.root.rot[1]=Math.PI;cartographer.root.pos=[18,1.6,48.5];
const wake=[];for(let i=0;i<20;i++){const w=make(dynamic,geo.ring,[.45,.77,.73],[0,.16,0],[.6,.03,.6]);w.visible=false;w.castShadow=false;w.emission=.35;wake.push({n:w,life:0});}
const birds=[];for(let i=0;i<6;i++){const b=dynamic.add(new Node()),left=box(b,C.cream,-.25,0,0,.5,.03,.20,[0,.3,-.2]),right=box(b,C.cream,.25,0,0,.5,.03,.20,[0,-.3,.2]);box(b,C.cream,0,0,.02,.10,.1,.35);birds.push({b,left,right,phase:i});}
mergeRigid(winchGear);mergeRigid(winchBrace);mergeRigid(winchRope);mergeRigid(chart);
const mechParts=new Node();mechParts.children=mech.children.filter(n=>![winchGear,winchBrace,winchRope].includes(n));mech.children=[winchGear,winchBrace,winchRope];mech.add(R.batch(mechParts));
root.add(R.batch(staticG));const em=R.batch(emit);root.add(em);
let bridgeAngle=0,wakeClock=0;
function update(time,dt,state,c,b,mode,reduced=false,work=null){const m=state.mission;beacon.rot[1]=reduced?.35:time*.20;const lift=m.bridgeOpen?1:(work?.progress||0);bridgeAngle+=(lift*1.33-bridgeAngle)*Math.min(1,dt*8);bridge.rot[2]=bridgeAngle;winchGear.visible=m.bridgeOpen||!!work?.gear;winchBrace.visible=m.bridgeOpen||!!work?.braced;winchRope.visible=winchBrace.visible;winchGear.rot[2]=-lift*Math.PI*8;for(const id of S.PARTS){items[id].visible=m.briefed&&!m.parts.includes(id);items[id].rot[1]=time*.5;items[id].pos[1]=2.10+(reduced?0:Math.sin(time*2+S.PARTS.indexOf(id))*.11);}chart.visible=!m.chart;chart.rot[1]=time*.25;chart.pos[1]=2.2+(reduced?0:Math.sin(time*1.7)*.1);launch.root.pos=[b.x,.38+(reduced?0:Math.sin(time*1.35)*.035),b.z];launch.root.rot=[reduced?0:Math.sin(time*1.1)*.018,b.yaw,reduced?0:Math.cos(time)*.015];launch.pennant.color=state.legacy.completed?C[state.legacy.pennant==='gold'?'gold':state.legacy.pennant==='teal'?'teal':'rust']:C.dark;launch.repair.visible=true;
if(mode==='boat'){player.root.pos=V.add(launch.root.pos,[Math.sin(b.yaw)*-.7,.50,Math.cos(b.yaw)*-.7]);player.root.rot[1]=b.yaw;player.animate(time,{grounded:true,run:0,phase:0},true,reduced);}else{player.root.pos=[c.x,c.y,c.z];player.root.rot[1]=c.yaw;player.animate(time,c,false,reduced);}bootstrap.root.pos=m.passenger?[-16,1.6,31]:[0,1.6,-15];bootstrap.animate(time,{run:0,phase:0,interacting:Math.sin(time*.8)>.7?.5:0},false,reduced);bootstrap.root.rot[1]=Math.atan2(c.x-bootstrap.root.pos[0],c.z-bootstrap.root.pos[2]);if(m.passenger&&mode==='boat'){cartographer.root.pos=V.add(launch.root.pos,[Math.sin(b.yaw)*1.15,.5,Math.cos(b.yaw)*1.15]);cartographer.root.rot[1]=b.yaw+Math.PI;cartographer.animate(time,{run:0,phase:0},false,reduced);}else{cartographer.root.pos=m.complete?[-17.3,1.6,30]:m.passenger?[14.1,1.6,50.5]:[18,1.6,48.5];cartographer.animate(time,{run:0,phase:0},false,reduced);}
const goal=S.goal(state);marker.visible=!m.complete;marker.pos=[goal.pos[0],3.4+(reduced?0:Math.sin(time*2.5)*.14),goal.pos[1]];marker.rot[1]=time*.8;
for(let i=0;i<buoys.length;i++)buoys[i].pos[1]=.28+(reduced?0:Math.sin(time*1.4+i)*.07);
if(!reduced&&mode==='boat'&&Math.abs(b.speed)>.4){wakeClock-=dt;if(wakeClock<=0){wakeClock=.12;const w=wake.find(w=>w.life<=0)||wake[0];w.life=1.8;w.n.pos=[b.x-Math.sin(b.yaw)*2.2,.15,b.z-Math.cos(b.yaw)*2.2];}}
for(const w of wake){w.life=Math.max(0,w.life-dt);w.n.visible=w.life>0&&!reduced;const s=(1.8-w.life)*.8+.4;w.n.scale=[s,.018,s];w.n.color=[.08+w.life*.15,.38+w.life*.12,.4+w.life*.10];}
for(const bird of birds){const t=time*.15+bird.phase*1.1;bird.b.pos=[Math.cos(t)*17,10+Math.sin(t*2)*.4,34+Math.sin(t)*13];bird.b.rot[1]=-t;const flap=reduced?0:Math.sin(time*4+bird.phase)*.45;bird.left.rot[2]=flap;bird.right.rot[2]=-flap;}}
return{root,player,bootstrap,cartographer,launch,bridge,beacon,winchGear,winchBrace,winchRope,items,marker,cameraOccluders,update};}
window.StormwakeWorld=Object.freeze({create,C,person});})();
