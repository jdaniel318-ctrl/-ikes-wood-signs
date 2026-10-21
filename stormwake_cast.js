/* Saltglass cast · original authored anatomy, tailoring and skeletal animation.
 * No downloaded model, actor likeness, runtime request or external import.
 * The existing 19-bone rig and locomotion poses remain the animation contract. */
(function(root){'use strict';
function create(T,materialFactory,role='player'){
 const old=role==='bootstrap',scholar=role==='chartmaker',object=new T.Group();object.name='Saltglass '+role;
 const palettes={coat:old?[.30,.235,.16]:scholar?[.48,.405,.29]:[.10,.205,.285],lining:old?[.43,.34,.22]:scholar?[.31,.275,.205]:[.42,.17,.12],skin:old?[.61,.425,.31]:scholar?[.63,.435,.305]:[.69,.485,.35],hair:old?[.355,.325,.275]:[.12,.085,.06],shirt:[.76,.725,.61],leather:[.16,.115,.078],trousers:old?[.235,.225,.195]:[.205,.235,.25],brass:[.64,.465,.235],red:[.45,.125,.085]};
 const materials=[],parts=[],bones=[],bind={},clamp=T.MathUtils.clamp,colorScale=1.22;
 const mat=(name,id)=>{const m=materialFactory(id,palettes[name]).clone();m.name='cast '+role+' '+name;m.side=T.DoubleSide;m.vertexColors=true;m.color.multiplyScalar(colorScale);m.userData.castSurface=name;if(name==='skin'){m.roughness=.79;m.normalMap=null;}if(name==='hair'){m.roughness=.96;m.normalMap=null;}if(name==='leather')m.roughness=.87;materials.push(m);return materials.length-1;};
 const M={coat:mat('coat',3),lining:mat('lining',3),skin:mat('skin',6),hair:mat('hair',8),shirt:mat('shirt',3),leather:mat('leather',7),trousers:mat('trousers',3),brass:mat('brass',4),red:mat('red',3)};
 function bone(name,parent,xyz){const b=new T.Bone();b.name=name;b.position.set(...xyz);if(parent)parent.add(b);else object.add(b);bind[name]=b;bones.push(b);return b;}
 const hip=bone('hips',null,[0,1.07,0]),spine=bone('spine',hip,[0,.18,0]),chest=bone('chest',spine,[0,.30,0]),neck=bone('neck',chest,[0,.22,0]),head=bone('head',neck,[0,.20,0]);
 const limb={};for(const s of[-1,1]){const n=s<0?'L':'R';const thigh=bone('thigh'+n,hip,[s*.145,-.04,0]),shin=bone('shin'+n,thigh,[0,-.47,.015]),foot=bone('foot'+n,shin,[0,-.43,-.015]);const upper=bone('upper'+n,chest,[s*.32,.09,0]),fore=bone('fore'+n,upper,[s*.04,-.31,0]),hand=bone('hand'+n,fore,[0,-.30,0]);limb[n]={thigh,shin,foot,upper,fore,hand};}
 const tailL=bone('tailL',hip,[-.16,.08,-.12]),tailR=bone('tailR',hip,[.16,.08,-.12]);object.updateMatrixWorld(true);
 const rigid=b=>()=>[bones.indexOf(b),0,1,0];
 const blend=(a,b,joint,width)=>p=>{const v=clamp((joint+width*.5-p[1])/width,0,1);return[bones.indexOf(a),bones.indexOf(b),1-v,v];};
 const gauss=(a,b)=>Math.exp(-Math.pow(a/b,2));
 // Bounded local color variation belongs to the mesh, so it follows every pose.
 // Skin is warm at cheeks/ears and cooler under the jaw; cloth is worn at edges.
 function pigment(material,x,y,z){
  let v=.96+.025*Math.sin(x*31+y*19+z*23)*Math.sin(y*41-z*17),r=v,g=v,b=v;
  if(material===M.skin){
   const front=clamp(z/.09,0,1),cheek=gauss(Math.abs(x)-.079,.037)*gauss(y-1.943,.031)*front;
   const socket=gauss(Math.abs(x)-.054,.028)*gauss(y-1.98,.014)*front;
   const nose=gauss(x,.026)*gauss(y-1.944,.024)*front;
   const jaw=!old&&!scholar?gauss(y-1.865,.043)*clamp((z+.03)/.11,0,1)*.085:0;
   r=v*(1+.055*cheek+.035*nose-.11*socket-jaw);g=v*(1-.065*cheek-.075*nose-.15*socket-jaw);b=v*(1-.10*cheek-.12*nose-.15*socket-jaw*.7);
  }else if(material===M.hair){v=.83+.16*(.5+.5*Math.sin(x*155+y*63+z*82));r=v;g=v;b=v;}
  else if(material===M.leather){v=.83+.105*Math.sin(x*13+y*17+z*27)+.035*Math.sin(x*87-y*61+z*49);r=v;g=v*.99;b=v*.97;}
  else if(material===M.coat||material===M.lining||material===M.trousers){v=.91+.045*Math.sin(x*23+y*17-z*9)+.035*Math.sin(x*41-y*37+z*31);r=v;g=v*1.015;b=v*1.025;}
  return[r,g,b];
 }
 function add(g,material,weights=rigid(chest),tint=null){
  const p=g.attributes.position,indices=[],values=[],colors=[];
  for(let i=0;i<p.count;i++){const xyz=[p.getX(i),p.getY(i),p.getZ(i)],w=weights(xyz),c=pigment(material,...xyz),t=typeof tint==='function'?tint(...xyz):tint;indices.push(w[0],w[1],0,0);values.push(w[2],w[3],0,0);for(let k=0;k<3;k++)colors.push(clamp(c[k]*(t?t[k]:1),.06,1.22));}
  g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(values,4));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(p.count*2),2));parts.push({g,material});return g;
 }
 function ell(material,c,r,b=chest,rotation=null,tint=null){const radius=Math.max(...r),fine=radius>.055,micro=radius<=.018,g=new T.SphereGeometry(1,fine?16:micro?8:10,fine?10:micro?6:7);g.scale(...r);if(rotation){g.rotateX(rotation[0]||0);g.rotateY(rotation[1]||0);g.rotateZ(rotation[2]||0);}g.translate(...c);return add(g,material,typeof b==='function'?b:rigid(b),tint);}
 // Each authored component is smooth internally. Keep its separate pieces and
 // UV edges, but share the normal at duplicate points so draping cannot create
 // triangular lighting patches or a seam down the middle of the face.
 function smoothCoincident(g){const p=g.attributes.position,n=g.attributes.normal,shared=new Map(),keys=[];for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join('/');keys.push(key);const sum=shared.get(key)||[0,0,0];sum[0]+=n.getX(i);sum[1]+=n.getY(i);sum[2]+=n.getZ(i);shared.set(key,sum);}for(let i=0;i<p.count;i++){const v=shared.get(keys[i]),d=Math.hypot(...v)||1;n.setXYZ(i,v[0]/d,v[1]/d,v[2]/d);}return g;}
 function surface(material,rows,cols,point,weight=rigid(chest),tint=null){const pos=[],uv=[],index=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){pos.push(...point(i/cols,j/rows));uv.push(i/cols,j/rows);}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;index.push(a,a+1,b+1,a,b+1,b);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();smoothCoincident(g);return add(g,material,weight,tint);}
 function sectionAt(sections,y){if(y<=sections[0][1])return sections[0];for(let j=1;j<sections.length;j++)if(y<=sections[j][1]){const a=sections[j-1],b=sections[j],t=(y-a[1])/(b[1]-a[1]);return a.map((v,i)=>v+(b[i]-v)*t);}return sections[sections.length-1];}
 function loft(material,sections,weight=rigid(chest),segments=24,fold=0,tint=null){return surface(material,sections.length-1,segments,(u,t)=>{const j=Math.round(t*(sections.length-1)),[x,y,z,rx,rz]=sections[j],a=u*Math.PI*2,f=1+fold*(Math.sin(a*5+j*.89)+.42*Math.sin(a*9-j*.7))*Math.sin(t*Math.PI);return[x+Math.sin(a)*rx*f,y,z+Math.cos(a)*rz*f];},weight,tint);}
 // Subdivide garment panels before draping them over the torso. Their raised
 // folded edges now remain above the coat, including between silhouette points.
 function panel(material,pts,b=chest,drape=null,tint=null){
  const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);s.closePath();const base=new T.ShapeGeometry(s),bp=base.attributes.position,bi=base.index.array,pos=[],uv=[],steps=drape?3:1;
  const zAt=(x,y)=>{let nearest=pts[0],d=Infinity;for(const pt of pts){const dd=Math.hypot(pt[0]-x,pt[1]-y);if(dd<d){d=dd;nearest=pt;}}return nearest[2];};
  for(let k=0;k<bi.length;k+=3){const v=[0,1,2].map(i=>{const n=bi[k+i],x=bp.getX(n),y=bp.getY(n);return[x,y,zAt(x,y)];});const p=(u,w)=>{const q=v[0].map((n,i)=>n*(1-u-w)+v[1][i]*u+v[2][i]*w);return drape?[q[0],q[1],drape(q[0],q[1])+q[2]]:q;};const tri=(a,b,c)=>{for(const q of[a,b,c]){pos.push(...q);uv.push(q[0]*2,q[1]*2);}};for(let i=0;i<steps;i++)for(let j=0;j<steps-i;j++){tri(p(i/steps,j/steps),p((i+1)/steps,j/steps),p(i/steps,(j+1)/steps));if(i+j<steps-1)tri(p((i+1)/steps,j/steps),p((i+1)/steps,(j+1)/steps),p(i/steps,(j+1)/steps));}}
  base.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();if(drape)smoothCoincident(g);return add(g,material,typeof b==='function'?b:rigid(b),tint);
 }
 function tube(material,points,r,b=chest,tint=null){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(new T.TubeGeometry(curve,Math.min(88,Math.max(8,points.length*2)),r,5,false),material,typeof b==='function'?b:rigid(b),tint);}
 const torsoWeight=blend(chest,spine,1.38,.32),bodyWidth=old?1.045:scholar?.965:1;
 const torso=[[0,1.10,0,.224,.153],[0,1.18,0,.229,.160],[0,1.29,-.004,.247,.175],[0,1.40,-.009,.278,.185],[0,1.51,-.016,.306,.180],[0,1.60,-.021,.319,.160],[0,1.65,-.016,.292,.148],[0,1.69,-.009,.221,.126],[0,1.725,0,.106,.091]].map(s=>[s[0],s[1],s[2],s[3]*bodyWidth,s[4]*(old?1.04:1)]);
 const torsoZ=(x,y)=>{const c=sectionAt(torso,y);return c[2]+c[4]*Math.sqrt(Math.max(.035,1-Math.pow(x/c[3],2)));};
 const clothEdge=[1.13,1.10,1.06],clothShadow=[.75,.78,.81];
 loft(M.trousers,[[0,.93,0,.21,.13],[0,1.03,0,.245,.15],[0,1.14,0,.205,.135]],blend(hip,spine,1.15,.22));
 loft(M.coat,torso,torsoWeight,32,.014);
 panel(M.shirt,[[-.082,1.695,.012],[.082,1.695,.012],[.142,1.50,.012],[.126,1.18,.015],[0,1.16,.017],[-.126,1.18,.015],[-.142,1.50,.012]],torsoWeight,torsoZ);
 tube(M.shirt,[[0,1.63,torsoZ(0,1.63)+.02],[0,1.40,torsoZ(0,1.40)+.022],[0,1.19,torsoZ(0,1.19)+.023]],.0032,torsoWeight,[.81,.82,.79]);
 for(let k=0;k<4;k++)ell(M.brass,[.019,1.27+k*.078,torsoZ(.019,1.27+k*.078)+.028],[.0075,.008,.0045],torsoWeight);
 for(const s of[-1,1]){
  panel(M.lining,[[s*.088,1.718,.020],[s*.252,1.638,.022],[s*.217,1.536,.028],[s*.105,1.275,.023],[s*.117,1.489,.038],[s*.057,1.627,.033]],torsoWeight,torsoZ);
  const lapel=[[s*.088,1.718],[s*.252,1.638],[s*.217,1.536],[s*.105,1.275]].map(([x,y])=>[x,y,torsoZ(x,y)+.030]);tube(M.lining,lapel,.0037,torsoWeight,clothEdge);
  // Collar leaves curl over the neckcloth rather than lying flat on the chest.
  panel(M.shirt,[[s*.026,1.764,.082],[s*.110,1.724,.126],[s*.119,1.698,.165],[s*.072,1.638,.187],[s*.042,1.694,.149]],neck,null,[1.03,1.03,1.01]);
  for(let k=0;k<4;k++){const y=1.27+k*.086,x=s*(.169+k*.008);ell(M.brass,[x,y,torsoZ(x,y)+.028],[.011,.012,.006],torsoWeight);}
  // Sewn shoulder and back princess seams use the existing coat material.
  tube(M.coat,[[s*.109,1.72,.013],[s*.231,1.684,.007],[s*.313,1.625,.002]],.004,chest,clothEdge);
  tube(M.coat,[[s*.18,1.60,-.163],[s*.144,1.40,-.181],[s*.125,1.21,-.145]],.0032,torsoWeight,clothShadow);
  const tail=s<0?tailL:tailR,tailWeight=blend(hip,tail,1.12,.32),length=scholar?.505:old?.47:.49;
  surface(M.coat,10,18,(u,t)=>{const a=s*(.155+u*2.82),pleat=Math.sin(u*Math.PI*6+.4)*.008*t*t,r=.235+t*.086+pleat;return[Math.sin(a)*r,1.18-t*(length+.018*Math.sin(u*Math.PI))+.006*Math.sin(u*9)*t,Math.cos(a)*(.171+t*.060)+.007*Math.sin(u*Math.PI*6)*t];},tailWeight);
  const hem=[];for(let i=0;i<=18;i++){const u=i/18,a=s*(.155+u*2.82),r=.321+.008*Math.sin(u*Math.PI*6+.4);hem.push([Math.sin(a)*r,1.18-length-.018*Math.sin(u*Math.PI)+.006*Math.sin(u*9),Math.cos(a)*.231+.007*Math.sin(u*Math.PI*6)]);}tube(M.coat,hem,.0038,tail,clothEdge);
  tube(M.lining,[[s*.037,1.17,.178],[s*.053,.95,.208],[s*.070,1.18-length,.235]],.005,tail,[.85,.86,.86]);
  const skirtZ=(x,y)=>{const t=clamp((1.18-y)/length,0,1);return(.171+t*.06)*Math.sqrt(Math.max(.05,1-Math.pow(x/(.235+t*.086),2)));};
  panel(M.coat,[[s*.105,1.045,.014],[s*.242,1.055,.014],[s*.249,1.004,.020],[s*.18,.983,.020],[s*.104,.992,.018]],tailWeight,skirtZ,[1.09,1.08,1.06]);
  tube(M.coat,[[s*.108,1.046,skirtZ(s*.108,1.046)+.020],[s*.174,1.051,skirtZ(s*.174,1.051)+.021],[s*.24,1.055,skirtZ(s*.24,1.055)+.020]],.0034,tailWeight,clothShadow);
 }
 tube(M.coat,[[0,1.701,-.131],[0,1.50,-.201],[0,1.20,-.165]],.003,torsoWeight,clothEdge);
 loft(M.red,[[0,1.105,0,.237,.169],[0,1.125,0,.245,.175],[0,1.15,0,.242,.173],[0,1.175,0,.236,.169]],rigid(hip),32,.012);
 loft(M.leather,[[0,1.078,0,.245,.178],[0,1.122,0,.249,.181]],rigid(hip),28);
 for(const y of[1.083,1.117])tube(M.leather,[[-.21,y,.099],[-.14,y,.153],[0,y,.185],[.14,y,.153],[.21,y,.099]],.0025,hip,[1.18,1.15,1.08]);
 const buckle=new T.TorusGeometry(.031,.006,5,14);buckle.scale(1.32,1,1);buckle.translate(.018,1.101,.194);add(buckle,M.brass,rigid(hip));tube(M.brass,[[.018,1.101,.195],[.045,1.101,.197]],.003,hip);
 loft(M.skin,[[0,1.69,0,.074,.068],[0,1.76,-.006,.077,.070],[0,1.83,-.009,.073,.066]],rigid(neck),20);
 ell(M.red,[0,1.735,.104],[.052,.037,.028],neck,[0,0,.09]);panel(M.red,[[-.008,1.731,.132],[.035,1.719,.137],[.066,1.555,.194],[.021,1.575,.196]],torsoWeight);tube(M.red,[[.010,1.710,.141],[.025,1.657,.170],[.043,1.588,.193]],.003,torsoWeight,[1.12,1.08,1.03]);

 // A continuous cranium, jaw and face. Local relief makes cheekbones, sockets,
 // the nose bridge/alar wings, muzzle and chin actual lit form, not glued beads.
 const faceWidth=old?1.055:scholar?.955:1.015;
 const faceSections=[[0,1.805,.007,.042,.047],[0,1.817,.009,.069,.069],[0,1.839,.003,.092,.084],[0,1.862,-.002,.107,.091],[0,1.893,-.007,.117,.101],[0,1.925,-.010,.129,.109],[0,1.957,-.013,.135,.113],[0,1.990,-.014,.132,.112],[0,2.022,-.014,.130,.113],[0,2.054,-.016,.122,.109],[0,2.083,-.017,.105,.097],[0,2.109,-.018,.073,.072],[0,2.126,-.018,.021,.025],[0,2.128,-.018,.002,.002]].map(s=>[s[0],s[1],s[2],s[3]*faceWidth,s[4]]);
 const faceRelief=(x,y)=>.013*gauss(Math.abs(x)-.073,.035)*gauss(y-1.948,.026)-.013*gauss(Math.abs(x)-.054,.029)*gauss(y-1.979,.015)+.011*gauss(Math.abs(x)-.050,.039)*gauss(y-2.000,.010)+.023*gauss(x,.019)*gauss(y-1.977,.039)+(old?.053:scholar?.047:.050)*gauss(x,old?.025:.022)*gauss(y-1.944,.017)+.015*gauss(Math.abs(x)-.021,.011)*gauss(y-1.937,.010)+.009*gauss(x,.044)*gauss(y-1.901,.020)+.010*gauss(x,.049)*gauss(y-1.854,.015)-.003*gauss(Math.abs(x)-.037,.009)*gauss(y-1.916,.018);
 const faceZ=(x,y)=>{const c=sectionAt(faceSections,y),q=Math.sqrt(Math.max(0,1-Math.pow(x/c[3],2)));return c[2]+c[4]*Math.pow(q,.58)+faceRelief(x,y)*Math.pow(q,.7);};
 surface(M.skin,40,56,(u,t)=>{const y=1.805+t*.323,c=sectionAt(faceSections,y),a=u*Math.PI*2,si=Math.sin(a),co=Math.cos(a),x=c[3]*si;return[x,y,co>=0?faceZ(x,y):c[2]+c[4]*co];},rigid(head));
 for(const s of[-1,1]){
  // Small almond whites sit inside full upper/lower eyelid rims.
  const ex=s*.054,ey=old?1.978:1.980,ez=faceZ(ex,ey)+.004;
  ell(M.shirt,[ex,ey,ez],[.022,.0075,.008],head,null,[.82,.85,.83]);
  ell(M.hair,[ex-s*.001,ey,ez+.008],[.0061,.0063,.0022],head,null,old?[.23,.23,.22]:[.72,.77,.72]);
  ell(M.hair,[ex-s*.001,ey,ez+.010],[.0029,.0040,.0011],head,null,[.12,.14,.15]);
  const lid=(upper)=>[-1,-.5,0,.5,1].map(q=>{const x=ex+q*.022,y=ey+(upper?.0077:-.0060)*(1-q*q)+s*q*.0007;return[x,y,ez+.0055+.0045*(1-q*q)];});
  tube(M.skin,lid(true),old?.0037:.0031,head,[.88,.81,.77]);tube(M.skin,lid(false),.0027,head,[1.05,.99,.95]);
  const brow=[[-.025,.016],[-.010,.022],[.009,.021],[.026,.014]].map(([x,y])=>[ex+x,ey+y,faceZ(ex+x,ey+y)+.0035]);tube(M.hair,brow,old?.0045:.0038,head,old?[.72,.68,.63]:[.87,.83,.79]);
  if(old){const under=[[-.020,-.014],[0,-.018],[.021,-.013]].map(([x,y])=>[ex+x,ey+y,faceZ(ex+x,ey+y)+.0015]);tube(M.skin,under,.0016,head,[.75,.73,.72]);}
  // Nose wings and nostril shadows are flush with the continuous nose surface.
  const nx=s*(old?.022:.019),ny=1.934;ell(M.skin,[nx,ny,faceZ(nx,ny)+.001],[.0044,.0021,.0024],head,[-.25,0,s*.18],[.50,.43,.40]);
  // Ears have a raised helix, an inset concha and a rounded attached lobe.
  const earX=s*(.134*faceWidth),earY=old?1.952:1.955;
  ell(M.skin,[earX,earY,-.014],[.018,.034,.016],head,[0,0,-s*.08],[1.02,.94,.91]);
  ell(M.skin,[earX+s*.005,earY+.002,.000],[.009,.021,.0045],head,null,[.78,.66,.62]);
  const helix=[];for(let j=0;j<=9;j++){const a=-1.10+j/9*Math.PI*1.82;helix.push([earX+s*(.003+.010*Math.cos(a)),earY+.026*Math.sin(a),.002+.002*Math.cos(a)]);}tube(M.skin,helix,.0034,head,[1.08,.98,.93]);
  tube(M.skin,[[earX,earY-.014,.006],[earX+s*.004,earY,.008],[earX,earY+.014,.005]],.0026,head,[.94,.86,.82]);
 }
 const mouthY=old?1.898:1.901;
 surface(M.skin,4,16,(u,t)=>{const x=(u-.5)*.062,w=Math.sin(u*Math.PI),cup=.0027*gauss(Math.abs(x)-.010,.006)-.0007*gauss(x,.004),y=mouthY+(t-.5)*.012*w+cup,z=faceZ(x,y)+.0025+.0048*Math.sin(t*Math.PI)*w;return[x,y,z];},rigid(head),[1.01,.76,.72]);
 tube(M.skin,[[-.029,mouthY,faceZ(-.029,mouthY)+.003],[0,mouthY-.0008,faceZ(0,mouthY)+.008],[.029,mouthY+.0005,faceZ(.029,mouthY)+.003]],.00125,head,[.51,.43,.41]);
 tube(M.skin,[[-.017,1.879,faceZ(-.017,1.879)+.001],[0,1.877,faceZ(0,1.877)+.002],[.017,1.879,faceZ(.017,1.879)+.001]],.0012,head,[.87,.82,.79]);
 if(old){
  // A close, salt-streaked beard follows the jaw instead of hanging as a cone.
  surface(M.hair,9,28,(u,t)=>{const a=(u-.5)*2.60,yTop=1.936-.038*Math.pow(Math.cos(a),3),y=yTop-t*(yTop-1.818),c=sectionAt(faceSections,y),x=Math.sin(a)*(c[3]+.005),z=faceZ(x,y)+.005+.003*Math.sin(a*21+t*4);return[x,y,z];},rigid(head),(x,y,z)=>{const silver=.91+.17*Math.sin(x*103-y*21+z*38);return[silver,silver*1.02,silver*1.05];});
  for(const s of[-1,1])tube(M.hair,[[s*.005,1.918,faceZ(s*.005,1.918)+.008],[s*.019,1.916,faceZ(s*.019,1.916)+.009],[s*.037,1.909,faceZ(s*.037,1.909)+.007]],.0053,head,[.81,.79,.76]);
 }else if(!scholar){
  surface(M.hair,3,12,(u,t)=>{const x=(u-.5)*.063,y=1.852+t*.022;return[x,y,faceZ(x,y)+.0018];},rigid(head),[.55,.58,.60]);
 }
 // Swept hair masses and overlapping locks remain compact under the headwear.
 ell(M.hair,[0,2.077,-.044],[.132,.052,.102],head,[0,0,.08]);
 for(const s of[-1,1]){ell(M.hair,[s*.117,1.957,-.051],[.025,.087,.053],head,[0,0,s*.14]);for(let k=0;k<3;k++)tube(M.hair,[[s*(.112-k*.019),2.034,-.083],[s*(.128-k*.020),1.952,-.113],[s*(.115-k*.023),1.868,-.113]],.008,head,old&&k===0?[1.18,1.20,1.22]:[.94,.94,.96]);}
 if(scholar){
  loft(M.red,[[0,2.046,-.016,.133,.116],[0,2.060,-.019,.137,.119],[0,2.078,-.020,.131,.114],[0,2.098,-.020,.106,.098]],rigid(head),28,.015);
  tube(M.red,[[-.125,2.058,.020],[-.081,2.053,.086],[0,2.054,.103],[.081,2.053,.086],[.125,2.058,.020]],.0031,head,[1.13,1.08,1.04]);
  for(const s of[-1,1]){const g=new T.TorusGeometry(.026,.0025,5,20);g.translate(s*.054,1.979,faceZ(s*.054,1.979)+.022);add(g,M.brass,rigid(head));tube(M.brass,[[s*.079,1.981,.117],[s*.113,1.985,.077],[s*.134,1.971,.014]],.002,head);}
  tube(M.brass,[[-.028,1.983,.127],[0,1.990,.140],[.028,1.983,.127]],.0023,head);ell(M.hair,[0,1.840,-.115],[.059,.057,.046],head);
 }else{
  // Turned-up tricorn with a soft crown, stitched binding and worn rolled rim.
  surface(M.leather,6,48,(u,t)=>{const a=u*Math.PI*2,r=.125+t*(.195+.035*Math.cos(3*a));return[Math.sin(a)*r,2.09+.025*(1-t)+t*t*(.025+.07*(1-Math.cos(3*a)))+.003*Math.sin(a*7)*t,Math.cos(a)*r*.92];},rigid(head));
  loft(M.leather,[[0,2.10,0,.143,.125],[0,2.18,-.01,.140,.120],[0,2.23,-.01,.116,.102],[0,2.252,-.01,.045,.041],[0,2.255,-.01,.001,.001]],rigid(head),28,.012);
  const edge=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=.32+.035*Math.cos(3*a);edge.push([Math.sin(a)*r,2.115+.07*(1-Math.cos(3*a))+.003*Math.sin(a*7),Math.cos(a)*r*.92]);}tube(M.lining,edge,.006,head,[.97,.95,.90]);
  loft(M.lining,[[0,2.105,0,.145,.128],[0,2.128,0,.145,.127]],rigid(head),24,0,[.82,.83,.84]);
 }
 for(const s of[-1,1]){
  const n=s<0?'L':'R',b=limb[n],x=s*.145,ax=s*.35;
  loft(M.trousers,[[x,.46,.016,.085,.085],[x,.53,.016,.097,.096],[x,.61,.012,.106,.104],[x,.69,.008,.105,.106],[x,.78,-.005,.114,.111],[x,.93,0,.125,.116],[x,1.05,0,.112,.105]],blend(b.thigh,b.shin,.56,.17),24,.022);
  loft(M.leather,[[x,.105,0,.090,.097],[x,.153,0,.093,.100],[x,.186,.002,.085,.092],[x,.215,0,.090,.094],[x,.25,0,.085,.090],[x,.37,.014,.091,.098],[x,.49,.018,.101,.106],[x,.53,.018,.113,.116]],rigid(b.shin),24,.008);
  loft(M.leather,[[x,.49,.018,.115,.116],[x,.532,.018,.120,.122],[x,.553,.018,.116,.119],[x,.567,.018,.105,.111]],rigid(b.shin),24,0,[1.12,1.10,1.06]);
  tube(M.leather,[[x+s*.09,.18,-.022],[x+s*.091,.35,-.013],[x+s*.113,.54,.005]],.0032,b.shin,[1.19,1.15,1.10]);
  // Shaped instep and squared toe, above an unchanged .009-high sole contact.
  const shoe=[[-.104,.045,.052,.041],[-.072,.076,.078,.064],[0,.095,.100,.078],[.10,.101,.067,.053],[.19,.088,.049,.036],[.247,.050,.040,.025],[.257,.008,.037,.010]];
  surface(M.leather,shoe.length-1,20,(u,t)=>{const j=Math.round(t*(shoe.length-1)),[z,rx,cy,ry]=shoe[j],a=u*Math.PI*2;return[x+Math.sin(a)*rx,cy+Math.cos(a)*ry,z];},rigid(b.foot));
  ell(M.leather,[x,.034,.079],[.108,.025,.185],b.foot,null,[.69,.70,.71]);tube(M.leather,[[x-.087,.063,.12],[x-.062,.065,.225],[x,.064,.25],[x+.062,.065,.225],[x+.087,.063,.12]],.0036,b.foot,[1.20,1.16,1.09]);
  loft(M.coat,[[ax,1.02,0,.069,.069],[ax,1.11,0,.074,.076],[ax,1.20,.001,.082,.080],[s*.349,1.275,.004,.083,.084],[s*.344,1.306,-.004,.078,.081],[s*.341,1.34,0,.089,.086],[s*.332,1.46,-.006,.099,.101],[s*.322,1.58,-.008,.111,.108],[s*.314,1.65,-.008,.100,.096],[s*.310,1.67,-.006,.080,.077]],blend(b.upper,b.fore,1.33,.20),24,.022);
  tube(M.coat,[[ax+s*.068,1.11,.016],[s*.348+s*.08,1.29,.014],[s*.329+s*.10,1.50,.013]],.003,blend(b.upper,b.fore,1.33,.2),clothEdge);
  loft(M.lining,[[ax,1.024,0,.081,.084],[ax,1.055,0,.095,.096],[ax,1.105,0,.097,.097],[ax,1.130,0,.089,.090]],rigid(b.fore),24,.008);
  loft(M.lining,[[ax,1.033,0,.088,.091],[ax,1.046,0,.095,.097]],rigid(b.fore),24,0,[1.16,1.12,1.07]);
  for(let k=0;k<2;k++)ell(M.brass,[ax+s*.056,1.061+k*.036,.079],[.007,.008,.004],b.fore);
  loft(M.shirt,[[ax,.995,0,.061,.061],[ax,1.016,0,.070,.069],[ax,1.031,0,.073,.072]],rigid(b.hand),20,.012);
  // A tapered palm, webbed knuckle line, and gently curled finger segments.
  // All hand geometry remains rigid to the existing wrist bone.
  const palmScale=old?1.055:scholar?.96:1;
  loft(M.skin,[[ax,.918,.006,.041*palmScale,.021],[ax,.932,.006,.047*palmScale,.028],[ax,.958,.002,.050*palmScale,.031],[ax,.981,-.002,.043*palmScale,.029],[ax,1.006,-.002,.031*palmScale,.027]],rigid(b.hand),16);
  ell(M.skin,[ax-s*.029,.955,.019],[.026,.034,.018],b.hand,[0,0,s*.18]);
  for(let k=0;k<4;k++){
   const side=(k-1.5),fx=ax+side*.023*palmScale,len=[.068,.080,.075,.058][k],rootY=.926-Math.abs(side)*.002,r=.0115*(k===3?.86:1),sections=[];
   for(let j=0;j<=6;j++){const t=j/6,tip=j===6?.24:1-.28*t,px=fx+side*.003*t,y=rootY-len*t,z=.006+.006*t+.015*t*t;sections.push([px,y,z,r*tip,r*(.88-.12*t)*tip]);}
   loft(M.skin,sections.reverse(),rigid(b.hand),10);
   const ky=rootY-len*.47;ell(M.skin,[fx+side*.0014,ky,.021],[r*.96,.0042,.006],b.hand,null,[.89,.82,.78]);
   const nailY=rootY-len*.83;ell(M.skin,[fx+side*.0025,nailY,.004],[r*.66,.010,.0018],b.hand,[.22,0,0],[1.13,1.09,1.02]);
  }
  const thumb=[[ax-s*.043,.971,.012,.019,.018],[ax-s*.056,.951,.024,.018,.017],[ax-s*.064,.932,.034,.015,.015],[ax-s*.064,.915,.041,.011,.012],[ax-s*.061,.908,.044,.004,.005]];loft(M.skin,thumb.reverse(),rigid(b.hand),12);
  tube(M.skin,[[ax-s*.022,.972,.031],[ax-s*.007,.959,.035],[ax+s*.014,.952,.031]],.0013,b.hand,[.77,.70,.66]);
 }
 // A curved baldric sits above both lapels; stitching, strap ends and a satchel
 // flap give the leather some construction without another material or draw.
 const strapZ=(x,y)=>torsoZ(x,y)+.058;
 panel(M.leather,[[-.237,1.675,0],[-.178,1.689,0],[.233,1.143,0],[.176,1.128,0]],torsoWeight,strapZ,[.98,.96,.92]);
 tube(M.leather,[[-.224,1.674,strapZ(-.224,1.674)+.003],[-.027,1.421,strapZ(-.027,1.421)+.003],[.188,1.144,strapZ(.188,1.144)+.003]],.0023,torsoWeight,[1.22,1.18,1.11]);
 ell(M.leather,[.285,1.017,-.030],[.108,.139,.092],hip);panel(M.leather,[[.184,1.122,.047],[.373,1.119,.045],[.367,1.021,.074],[.291,.995,.087],[.199,1.018,.076]],hip,null,[1.18,1.12,1.05]);
 tube(M.leather,[[.198,1.104,.062],[.206,1.027,.080],[.290,1.005,.092],[.359,1.029,.079]],.0028,hip,[1.20,1.16,1.09]);ell(M.brass,[.289,1.031,.090],[.011,.014,.006],hip);
 if(scholar){for(const s of[-1,1]){loft(M.shirt,[[s*.06,.90,-.23,.037,.037],[s*.06,1.37,-.23,.037,.037]],rigid(hip),16,0,[.91,.89,.81]);loft(M.leather,[[s*.06,1.04,-.23,.039,.039],[s*.06,1.065,-.23,.039,.039]],rigid(hip),16);}}
 else{tube(M.leather,[[-.27,1.10,-.01],[-.33,.83,-.03],[-.38,.55,-.07]],.030,hip);tube(M.brass,[[-.37,1.1,.01],[-.27,1.12,.02],[-.18,1.10,.01]],.014,hip);tube(M.leather,[[-.27,1.10,.02],[-.25,1.25,.03]],.022,hip);}
 // One skinned draw per material, with the original skeleton and joint weights.
 const dst={position:[],normal:[],uv:[],color:[],skinIndex:[],skinWeight:[]},sizes={position:3,normal:3,uv:2,color:3,skinIndex:4,skinWeight:4},geometry=new T.BufferGeometry();let start=0;
 for(let mi=0;mi<materials.length;mi++){let count=0;for(const part of parts.filter(p=>p.material===mi)){const g=part.g.index?part.g.toNonIndexed():part.g;for(const key of Object.keys(dst))dst[key].push(...g.attributes[key].array);count+=g.attributes.position.count;if(g!==part.g)g.dispose();}geometry.addGroup(start,count,mi);start+=count;}
 // Three normalized bytes hold each color; the material restores colorScale.
 // This keeps authored highlights while avoiding a 12-byte float color stream.
 for(const key of Object.keys(dst))geometry.setAttribute(key,key==='skinIndex'?new T.Uint16BufferAttribute(dst[key],sizes[key]):key==='color'?new T.Uint8BufferAttribute(dst[key].map(v=>Math.round(clamp(v/colorScale,0,1)*255)),3,true):new T.Float32BufferAttribute(dst[key],sizes[key]));geometry.computeBoundingSphere();for(const part of parts)part.g.dispose();
 const mesh=new T.SkinnedMesh(geometry,materials);mesh.name='weighted adult anatomy and tailored garments';mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;object.add(mesh);const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);object.userData={role,originalArt:true,skinVertices:geometry.attributes.position.count,boneCount:bones.length};
 function update(a={}){const c=a.motion||{},t=Number(a.time)||0,reduced=!!a.reduced,run=Math.min(1,Math.max(0,c.run||0)),phase=c.phase??t*6,air=c.grounded===false,helm=!!a.boat,swing=Math.sin(phase)*run;hip.position.y=1.07+(reduced?0:Math.abs(Math.sin(phase*2))*run*.026)-(c.landing||0)*.25;hip.rotation.y=swing*.045;spine.rotation.set(air?.10:run*.045,0,-swing*.025);chest.rotation.y=-swing*.06;head.rotation.y=helm?0:Math.sin(t*.7)*.045;head.rotation.x=.01;
 for(const s of[-1,1]){const b=limb[s<0?'L':'R'],step=swing*s,lift=Math.max(0,-step);b.thigh.rotation.set(air?s*.25:step*.48-.035,0,-s*.025);b.shin.rotation.x=air?.55:.075+lift*.70;b.foot.rotation.x=-.045-lift*.27;b.upper.rotation.set(helm?-1.02:air?-.55:-step*.39-.07,0,-s*(helm?.15:.09));b.fore.rotation.set(helm?-.44:-.16-Math.max(0,step)*.28,0,0);b.hand.rotation.set(.05,0,s*.035);}
 if(c.interacting>0){limb.R.upper.rotation.x=-.72;limb.R.fore.rotation.x=-.90;limb.R.hand.rotation.y=-.25;}const cloth=reduced?0:Math.sin(phase+.5)*run*.13+Math.sin(t*1.7)*.018;tailL.rotation.x=.035+cloth;tailR.rotation.x=.035-cloth;tailL.rotation.z=-run*.035;tailR.rotation.z=run*.035;object.updateMatrixWorld(true);skeleton.update();}
 update({});return{object,update,dispose(){geometry.dispose();for(const m of materials)m.dispose();skeleton.dispose();}};
}
root.StormwakeCast=Object.freeze({create,version:'saltglass-1'});
})(typeof window!=='undefined'?window:globalThis);
