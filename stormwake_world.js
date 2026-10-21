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
function house(p,e,x,z,w,d,h,col=C.cream){const y=1.6;cameraOccluders.push([x-w/2-.55,x+w/2+.55,y+h-.22,y+h*1.38,z-d/2-.55,z+d/2+.55],[x-1,x+1,y+h+.20,y+h+1.65,z+d*.12-1,z+d*.12+1]);box(p,C.stone,x,y+.25,z,w+.5,.5,d+.5);box(p,col,x,y+h/2,z,w,h,d).material=MAT.plaster;for(const sx of [-1,1])for(const sz of [-1,1])box(p,C.wood,x+sx*w*.49,y+h/2,z+sz*d*.49,.22,h,.22);for(let yy=.2;yy<h;yy+=1.4)box(p,C.wood,x,y+yy,z+d/2+.03,w+.08,.12,.14);make(p,geo.roof,C.roof,[x,y+h,z],[w+1.1,h*.76,d+1.1]);for(let i=-d/2-.4;i<=d/2+.4;i+=.48){beam(p,tint(C.roof,1.2),[x-w/2-.5,y+h,i+z],[x,y+h*1.38,i+z],.035).material=MAT.roof;beam(p,tint(C.roof,1.2),[x,y+h*1.38,i+z],[x+w/2+.5,y+h,i+z],.035).material=MAT.roof;}box(p,C.wood,x,y+1.1,z+d/2+.08,1.35,2.2,.18);for(let i=-.5;i<.6;i+=.25)box(p,tint(C.plank,.8),x+i,y+1.08,z+d/2+.19,.17,2.08,.03).material=MAT.wood;make(p,geo.sphere,C.gold,[x+.4,y+1.1,z+d/2+.25],[.08,.08,.08]);windowFrame(p,e,x-w*.3,y+2.6,z+d/2+.12,1.05);windowFrame(p,e,x+w*.3,y+2.6,z+d/2+.12,1.05);windowFrame(p,e,x+w/2+.09,y+2.4,z,1.1,true);windowFrame(p,e,x-w*.28,y+2.4,z-d/2-.10,1.1,'back');windowFrame(p,e,x+w*.28,y+2.4,z-d/2-.10,1.1,'back');for(let yy=.2;yy<h;yy+=1.4)box(p,C.wood,x,y+yy,z-d/2-.03,w+.08,.12,.14);box(p,C.wood,x,y+1.0,z-d/2-.08,1.2,2,.16);box(p,C.stone,x-w*.3,y+h+.7,z-d*.25,.65,2.4,.7);
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
for(const[x,z]of[[-18,-23],[-7,-23],[18,-22],[18,-3],[-18,-5],[8,8],[17,8],[-5,8]]){box(staticG,C.grass,x,1.65,z,2.4,.1,2.0).material=MAT.ground;tree(staticG,x,1.6,z,.9+rng()*.2);}
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
for(const b of [S.SURFACES[4],S.SURFACES[6]]){box(staticG,C.stone,(b[0]+b[1])/2,-.11,(b[2]+b[3])/2,b[1]-b[0],3.10,b[3]-b[2]);box(staticG,C.grass,(b[0]+b[1])/2,1.52,(b[2]+b[3])/2,b[1]-b[0],.16,b[3]-b[2]).material=MAT.ground;for(let x=b[0];x<=b[1];x+=1.5)for(const z of[b[2],b[3]])rock(staticG,x,-.2,z,1.1,1.6,.8);}
deck(staticG,S.SURFACES[5]);deck(staticG,S.SURFACES[7]);house(staticG,emit,18.5,54.5,7,5,3.7,[.69,.61,.45]);tree(staticG,23,1.6,49,1.1);tree(staticG,14.5,1.6,57,.9);
// Lighthouse: tapered masonry, balcony, glazing and an amber cap.
for(let i=0;i<6;i++)make(staticG,shape.cylinder(2.15-i*.12,2.03-i*.12,2.1,16),i%2?C.cream:C.rust,[-20,2.65+i*2.1,35],undefined,undefined,MAT.plaster);cyl(staticG,C.wood,-20,14.5,35,2, .22,16);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cyl(staticG,C.metal,-20+Math.sin(a)*1.9,15.05,35+Math.cos(a)*1.9,.035,.95);}const glow=cyl(emit,C.gold,-20,15.4,35,1.15,1.6,12);glow.emission=1;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cyl(staticG,C.metal,-20+Math.sin(a)*1.20,15.4,35+Math.cos(a)*1.20,.05,1.8);}make(staticG,shape.cylinder(1.9,0,1.8,12),C.dark,[-20,17.1,35],undefined,undefined,MAT.metal);box(staticG,C.wood,-20,2.85,32.83,1.15,2.4,.20);
const beacon=dynamic.add(new Node());beacon.pos=[-20,15.4,35];beacon.rot[0]=.22;const lightCone=make(beacon,shape.cylinder(.12,4.5,62,24),[1,.85,.48],[0,0,31],[1,1,1],[Math.PI/2,0,0]);lightCone.emission=1;lightCone.alpha=.055;lightCone.castShadow=false;const reflector=make(beacon,geo.sphere,C.gold,[0,0,.5],[.50,.50,.15]);reflector.emission=1;reflector.castShadow=false;
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
