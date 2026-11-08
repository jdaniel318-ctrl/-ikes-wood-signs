/* Original canvas artwork; no remote textures, fonts or game libraries. */
(function(root){'use strict';
const TAU=Math.PI*2;function poly(g,pts,fill,stroke){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.stroke();}}
function ellipse(g,x,y,rx,ry,fill){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fillStyle=fill;g.fill();}
function line(g,pts,color,width=2){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.stroke();}
function round(g,x,y,w,h,r,fill){g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill();}
function star(g,x,y,r,fill,rot=0){const pts=[];for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2+rot;pts.push([x+Math.cos(a)*r*(i%2?.45:1),y+Math.sin(a)*r*(i%2?.45:1)]);}poly(g,pts,fill);}
// One-shot canvas fireworks: the caller owns time, cancellation and reduced motion.
// Three stage bursts finish at 1.95s; five island bursts finish at 2.6s.
function celebrate(g,w,h,t,kind='island'){
 const stage=kind==='stage',duration=stage?1.95:2.6;
 if(!Number.isFinite(t)||t<=0||t>=duration)return;
 const colors=['#ffbf53','#ed83aa','#65d4bd','#b093e8','#ffa77d','#acd977'];
 const bursts=stage?[[.22,.25,.05],[.76,.2,.45],[.5,.15,.9]]:[[.57,.24,.05],[.84,.24,.4],[.4,.55,.75],[.78,.52,1.1],[.61,.28,1.45]];
 const life=stage?1.05:1.15,radius=Math.min(w*.11,h*.22);
 g.save();g.beginPath();g.rect(0,0,w,h);g.clip();
 bursts.forEach(([x,y,delay],i)=>{
  const age=t-delay;if(age<=0||age>=life)return;x*=w;y*=h;
  if(age<.2){const p=age/.2,at=y+(1-p)*h*.15;g.globalAlpha=Math.sin(p*Math.PI)*.75;line(g,[[x,at+9],[x,at]],colors[i],2);return;}
  const p=(age-.2)/(life-.2),spread=(1-Math.pow(1-p,3))*radius,fall=p*p*radius*.3;
  g.globalAlpha=Math.min(1,p*9)*(1-p)*.88;
  for(let j=0;j<12;j++){
   const a=j*TAU/12+i*.4,color=colors[(i+j%3)%colors.length],dx=Math.cos(a),dy=Math.sin(a);
   line(g,[[x+dx*spread*.73,y+dy*spread*.73+fall],[x+dx*spread,y+dy*spread+fall]],color,Math.max(1.4,radius*.035));
   star(g,x+dx*spread,y+dy*spread+fall,Math.max(1.7,radius*.045)*(1-p*.4),color,a+p*.35);
  }
 });g.restore();
}
function crystal(g,x,y,r=13,color='#9debe8'){poly(g,[[x,y-r],[x+r*.65,y-r*.4],[x+r*.55,y+r*.6],[x,y+r],[x-r*.65,y+r*.3],[x-r*.6,y-r*.4]],color);poly(g,[[x,y-r],[x,y+r],[x-r*.65,y+r*.3],[x-r*.6,y-r*.4]],'#51b7bb');line(g,[[x-r*.1,y-r*.6],[x+r*.25,y-r*.2]],'#e7fffc',2);}
function tree(g,x,y,s=1,pink=false){g.save();g.translate(x,y);g.scale(s,s);ellipse(g,0,5,24,7,'#183f4c35');poly(g,[[-3,0],[-2,-49],[4,-46],[5,0]],'#6f4b39');const colors=pink?['#efab9b','#dd797e','#ffd2ad']:['#86c88d','#3e947a','#b9d796'];ellipse(g,-13,-48,20,23,colors[1]);ellipse(g,11,-48,23,27,colors[0]);ellipse(g,-4,-69,22,22,colors[2]);g.restore();}
function pine(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);round(g,-3,-20,6,25,1,'#755342');poly(g,[[-27,-12],[0,-51],[26,-12]],'#39776e');poly(g,[[-23,-31],[0,-68],[23,-31]],'#4c9580');poly(g,[[-17,-51],[0,-84],[17,-51]],'#8ab79a');g.restore();}
function island(g,x,y,rx,ry,deep=95){ellipse(g,x,y+deep+15,rx*.9,ry*.55,'#10294b2b');let points=[[x-rx,y],[x-rx*.76,y+deep*.48],[x-rx*.37,y+deep*.7],[x-rx*.1,y+deep],[x+rx*.25,y+deep*.83],[x+rx*.67,y+deep*.46],[x+rx,y]];poly(g,points,'#826e76');poly(g,[[x-rx,y],[x-rx*.76,y+deep*.48],[x-rx*.37,y+deep*.7],[x-rx*.24,y+8]],'#b09a8c');poly(g,[[x-rx*.24,y+8],[x-rx*.37,y+deep*.7],[x-rx*.1,y+deep],[x+rx*.25,y+deep*.83],[x+rx*.2,y]],'#938089');poly(g,[[x+rx*.2,y],[x+rx*.25,y+deep*.83],[x+rx*.67,y+deep*.46],[x+rx,y]],'#645f78');ellipse(g,x,y,rx,ry,'#b3c7a0');ellipse(g,x,y-8,rx*.98,ry*.9,'#6ea48b');ellipse(g,x-12,y-15,rx*.78,ry*.64,'#95c49a');for(let i=0;i<8;i++){const dx=Math.sin(i*12.5)*rx*.8;line(g,[[x+dx,y+ry*.15],[x+dx+3,y+20+i%3*8]],'#60a18b',5);}}
function hut(g,x,y,s=1,roof='#bd745c'){g.save();g.translate(x,y);g.scale(s,s);ellipse(g,0,4,49,12,'#193a4e2b');poly(g,[[-35,-8],[-35,-65],[5,-78],[43,-59],[43,-8],[5,10]],'#f2dfb1');poly(g,[[5,-78],[43,-59],[43,-8],[5,10]],'#c6ad87');poly(g,[[-45,-63],[-5,-112],[51,-64],[4,-48]],roof);poly(g,[[-45,-63],[-5,-112],[4,-48]],'#df9971');line(g,[[-45,-63],[4,-48],[51,-64]],'#ffe3aa',3);round(g,-15,-34,19,38,9,'#385f6b');round(g,18,-42,13,16,5,'#7cc8c5');line(g,[[24,-41],[24,-28]],'#f7d697',2);g.restore();}
function tower(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);ellipse(g,0,8,37,10,'#193a4e30');poly(g,[[-22,0],[-18,-91],[19,-91],[24,0]],'#e4d9be');poly(g,[[7,-90],[19,-91],[24,0],[7,7]],'#b3c0b3');round(g,-25,-105,51,20,3,'#497788');ellipse(g,0,-105,26,9,'#89c4cc');poly(g,[[-31,-111],[0,-143],[32,-111]],'#69aaaa');poly(g,[[0,-143],[32,-111],[0,-107]],'#408995');round(g,-7,-76,14,21,7,'#478293');g.fillStyle='#f5d887';g.fillRect(-9,-101,18,10);star(g,0,-154,9,'#ffe3a2');g.restore();}
function bridge(g,x1,y1,x2,y2,complete=1){const n=14;const end=Math.floor(n*complete);for(let i=0;i<end;i++){const t=i/(n-1),x=x1+(x2-x1)*t,y=y1+(y2-y1)*t+Math.sin(t*Math.PI)*12;poly(g,[[x-16,y-5],[x+16,y-3],[x+19,y+5],[x-17,y+4]],i%2?'#d0a375':'#e5bd87');}if(complete){line(g,[[x1-15,y1-13],[(x1+x2)/2-15,(y1+y2)/2],[x2-15,y2-13]],'#e3bf8b',2);line(g,[[x1+15,y1-10],[(x1+x2)/2+15,(y1+y2)/2+4],[x2+15,y2-10]],'#ead4a2',2);}}
function hero(g,x,y,s=1,avatar='explorer',t=0,artwork=null,walk=0){if(avatar==='dinosaur'&&root.WWCreative){root.WWCreative.drawDinosaur(g,x,y,s,t,walk);return;}if(avatar==='custom'&&artwork&&root.WWCreative){const im=root.WWCreative.imageFor(artwork,()=>{if(g.canvas.isConnected)hero(g,x,y,s,avatar,t,artwork);});if(im)g.drawImage(im,x-42*s,y-72*s,84*s,84*s);return;}g.save();g.translate(x,y);g.scale(s,s);ellipse(g,0,12,18,5,'#1534473a');const step=Math.sin(t*13)*walk;round(g,-8,-1-Math.max(0,step)*5,7,13,3,'#344467');round(g,3,-1-Math.max(0,-step)*5,7,13,3,'#344467');poly(g,[[-12,-27],[12,-27],[18,4],[-18,4]],avatar==='princess'?'#a783d2':'#37888e');poly(g,[[-11,-25],[-18,3],[-27,9],[-21,-26]],'#e7b269');ellipse(g,0,-38,14,16,'#b8775d');ellipse(g,0,-34,12,13,'#edba8a');ellipse(g,-4,-37,1.4,2,'#243845');ellipse(g,5,-37,1.4,2,'#243845');line(g,[[-2,-30],[2,-29],[5,-31]],'#915d4f',1.5);if(avatar==='robot'){round(g,-16,-52,32,30,8,'#b3d6ce');round(g,-11,-45,23,11,5,'#244c65');ellipse(g,-5,-40,2.2,2.2,'#ffdb79');ellipse(g,6,-40,2.2,2.2,'#ffdb79');line(g,[[0,-52],[0,-60]],'#b3d6ce',3);ellipse(g,0,-63,4,4,'#f1bb62');}else if(avatar==='princess'){poly(g,[[-13,-48],[-17,-64],[-6,-58],[0,-70],[7,-58],[17,-64],[13,-48]],'#f3d17c');ellipse(g,0,-56,3,4,'#8a8dd1');}else{poly(g,[[-19,-46],[-10,-61],[10,-61],[17,-44]],'#eac18a');line(g,[[-21,-44],[20,-44]],'#ffdda4',4);poly(g,[[8,-58],[19,-74],[20,-61]],'#72cbb8');}g.restore();}
function fox(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);poly(g,[[6,0],[35,-5],[39,-29],[27,-24],[18,-13]],'#e1a066');poly(g,[[39,-29],[27,-24],[27,-13],[36,-15]],'#fff0d0');ellipse(g,0,-4,20,12,'#d98e59');poly(g,[[-17,-10],[-21,-38],[-6,-29],[8,-38],[10,-7]],'#efa56b');poly(g,[[-15,-20],[6,-20],[-4,-7]],'#ffedc8');ellipse(g,-11,-23,1.7,2,'#243845');ellipse(g,3,-23,1.7,2,'#243845');ellipse(g,-5,-12,3,2,'#243845');g.restore();}
function cloud(g,x,y,s,alpha=.8){g.save();g.globalAlpha=alpha;ellipse(g,x,y,46*s,12*s,'#f3f4df');ellipse(g,x-17*s,y-8*s,22*s,14*s,'#f3f4df');ellipse(g,x+14*s,y-15*s,26*s,21*s,'#f3f4df');g.restore();}
function background(g,w,h,t,night){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,night?'#101f41':'#bedfdf');gr.addColorStop(.6,night?'#254b69':'#73b7bb');gr.addColorStop(1,night?'#285e73':'#3c8e9a');g.fillStyle=gr;g.fillRect(0,0,w,h);const sun=g.createRadialGradient(w*.76,h*.2,1,w*.76,h*.2,130);sun.addColorStop(0,night?'#d6e9c3aa':'#ffe9b8cc');sun.addColorStop(1,'#ffe9b800');g.fillStyle=sun;g.fillRect(0,0,w,h);ellipse(g,w*.76,h*.2,night?27:43,night?27:43,night?'#e6edcc':'#fff1c6');if(night){for(let i=0;i<65;i++){const x=(i*197.2)%w,y=(i*79.3)%(h*.6);star(g,x,y,i%4?1.5:3,'#eff6db',0);}}poly(g,[[0,h*.45],[w*.14,h*.15],[w*.29,h*.44],[w*.44,h*.2],[w*.62,h*.5],[w*.76,h*.24],[w,h*.48],[w,h],[0,h]],night?'#315773':'#79b0b4');poly(g,[[0,h*.57],[w*.17,h*.4],[w*.27,h*.55],[w*.4,h*.37],[w*.6,h*.61],[w*.79,h*.36],[w,h*.6],[w,h],[0,h]],night?'#386d82':'#5b9da8');for(let i=0;i<25;i++){let x=(i*143+Math.sin(t*.25+i)*12)%w,y=h*.59+(i*23)%(h*.4);line(g,[[x,y],[x+24+i%4*13,y]],night?'#80bdbb25':'#c8eee535',1.6);}cloud(g,150+t%80,90,1.4,.5);cloud(g,580,60,1.1,.35);cloud(g,1050-t%90,160,1.2,.45);}
function drawWorld(g,t,state){const w=1200,h=650;background(g,w,h,t,state.theme==='night');
// Distant islands, waterfall, curved rope bridges and a lived-in harbor.
island(g,350,228,150,53,82);island(g,930,278,178,61,97);island(g,622,410,272,91,137);island(g,292,508,113,40,62);
bridge(g,445,264,520,354,1);bridge(g,817,366,863,316,1);bridge(g,384,489,469,445,1);
const wat=g.createLinearGradient(584,444,630,608);wat.addColorStop(0,'#ccf6e3');wat.addColorStop(.4,'#70d1ce');wat.addColorStop(1,'#70cfd400');poly(g,[[585,446],[624,452],[626,592],[606,620],[584,592]],wat);for(let i=0;i<5;i++)line(g,[[590+i*6,468+(t*30+i*20)%90],[590+i*6,495+(t*30+i*20)%90]],'#dcffff77',2);
// Main workshop town.
for(const a of [[440,382,.8],[779,409,1],[705,445,.7],[500,417,.7],[765,358,.7]])tree(g,...a,a[0]===765);
hut(g,608,387,1.3);hut(g,704,386,.75,'#598fa4');tower(g,535,352,.6);line(g,[[584,406],[561,428],[530,442],[507,448]],'#d5c79c',18);line(g,[[629,402],[664,429],[711,443]],'#d5c79c',13);
for(let i=0;i<7;i++){ellipse(g,470+i*45,452+Math.sin(i)*8,4,3,'#dcca76');}hero(g,630,444,1.05,state.avatar,t,state.artwork);fox(g,669,448,.75);
// Observatory island.
tower(g,943,255,1.15);hut(g,1036,293,.57,'#698fbb');for(const p of [[819,273,.7],[850,290,.9],[1040,240,.75],[1005,310,.55]])pine(g,...p);crystal(g,897,272,20);star(g,890,186+Math.sin(t*2)*5,11,'#ffe0a1',t*.2);
// Word island library.
hut(g,347,213,1.05,'#ae80a4');tree(g,263,229,.9,true);tree(g,423,232,.85,true);poly(g,[[330,231],[348,224],[366,232],[366,247],[348,239],[330,247]],'#fff1c8');line(g,[[348,224],[348,239]],'#b39184',2);
// Maker grove.
tree(g,280,489,.8,true);ellipse(g,323,506,19,14,'#dc9354');line(g,[[320,493],[324,486]],'#b3c79a',4);pine(g,235,504,.6);
// Airship hovering by the dock.
const by=363+Math.sin(t*1.3)*6;ellipse(g,168,by-25,65,35,'#f3d191');poly(g,[[118,by-24],[167,by-60],[167,by+9]],'#e9ad78');ellipse(g,168,by-25,52,33,'#f2cd8a');line(g,[[136,by],[146,by+28],[185,by+28],[199,by]],'#d9c9a1',2);poly(g,[[136,by+23],[196,by+23],[182,by+42],[149,by+42]],'#536c7a');line(g,[[145,by+21],[185,by+21]],'#f4d995',4);
// Fireflies, glowing buoy lanterns and drifting petals.
for(let i=0;i<18;i++){let x=430+(i*79)%370+Math.sin(t+i)*7,y=310+(i*43)%140+Math.cos(t*.7+i)*5;ellipse(g,x,y,2,2,'#ffe6a7');}
cloud(g,82,580,1.5,.65);cloud(g,1113,480,1.5,.35);const lit=state.glowtrail?.completed||[];for(let i=0;i<3;i++){const x=690+i*40,y=110;ellipse(g,x,y,13,13,lit.includes(i)?'#fff0a878':'#537e7d33');star(g,x,y,8,lit.includes(i)?'#ffe39a':'#91b6ad');}
}
function setup(canvas,width=1200,height=650){const dpr=Math.min(root.devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return g;}
function world(canvas,getState){const g=setup(canvas);let handle,stopped=false,start=performance.now(),last=-100,stamp='';function frame(ts){if(stopped)return;const s=getState();const key=s.theme+'|'+s.avatar+'|'+s.motion;if(ts-last>32&&!document.hidden&&(s.motion||key!==stamp)){stamp=key;drawWorld(g,s.motion?(ts-start)/1000:0,s);last=ts;}handle=requestAnimationFrame(frame);}handle=requestAnimationFrame(frame);return()=>{stopped=true;cancelAnimationFrame(handle);};}
function visual(canvas,v){const g=setup(canvas,600,190);g.clearRect(0,0,600,190);if(!v)return;
if(v.type==='count'||v.type==='take'){let n=v.n;for(let i=0;i<n;i++){let x=300-((Math.min(n,5)-1)*45)+i%5*90,y=n>5?58+Math.floor(i/5)*72:96;g.globalAlpha=v.type==='take'&&i>=n-v.removed?.2:1;crystal(g,x,y,22);if(v.type==='take'&&i>=n-v.removed)line(g,[[x-17,y-15],[x+17,y+15]],'#c85d4f',3);}g.globalAlpha=1;}
else if(v.type==='groups'){[v.a,v.b].forEach((n,j)=>{for(let i=0;i<n;i++)crystal(g,100+j*300+(i%5)*24,62+Math.floor(i/5)*36,12,j?'#f0d184':'#9debe8');});g.fillStyle='#365a66';g.font='32px system-ui';g.fillText(v.op==='or'?'or':'+',280,99);}
else if(v.type==='array'){for(let i=0;i<v.rows;i++)for(let j=0;j<v.cols;j++)crystal(g,300-(v.cols-1)*18+j*36,30+i*26,10);}
else if(v.type==='place'){for(let i=0;i<v.a;i++){round(g,90+i*25,40,15,100,3,'#559d9d');for(let k=1;k<10;k++)line(g,[[90+i*25,40+k*10],[105+i*25,40+k*10]],'#d9f4e7',1);}for(let i=0;i<v.b;i++)crystal(g,400+(i%3)*32,50+Math.floor(i/3)*35,11);}
else if(v.type==='fraction'){for(let i=0;i<v.b;i++){round(g,300-v.b*26+i*52,55,48,80,8,i<v.a?'#4daba5':'#c9d9cb');}g.fillStyle='#486376';g.font='15px system-ui';g.textAlign='center';g.fillText('Equal-sized parts',300,165);}
else if(v.type==='polygon'){let pts=[];for(let i=0;i<v.sides;i++){let angle=TAU*i/v.sides-Math.PI/2+(v.sides===4?Math.PI/4:0);pts.push([300+Math.cos(angle)*70,95+Math.sin(angle)*70]);}poly(g,pts,'#e9c77e','#9c794c');}
else if(v.type==='rect'){round(g,190,32,220,118,8,'#79b6ab');if(v.grid){for(let i=1;i<v.a;i++)line(g,[[190+220*i/v.a,32],[190+220*i/v.a,150]],'#e2f2d1',1);for(let i=1;i<v.b;i++)line(g,[[190,32+118*i/v.b],[410,32+118*i/v.b]],'#e2f2d1',1);}g.fillStyle='#285166';g.textAlign='center';g.font='20px system-ui';g.fillText(v.a+' '+v.unit,300,178);g.fillText(v.b,453,95);}
else if(v.type==='triangle'||v.type==='right'){poly(g,[[190,145],[190,40],[410,145]],'#97c6b2','#508b80');g.fillStyle='#285166';g.font='20px system-ui';g.fillText(v.a+(v.type==='triangle'?'°':''),142,90);g.fillText(v.b+(v.type==='triangle'?'°':''),284,173);if(v.type==='right')line(g,[[190,128],[207,128],[207,145]],'#508b80',2);}
else {star(g,300,94,48,'#e9ce8d',.1);ellipse(g,300,162,44,7,'#24567113');}}
function mission(canvas,progress=0,avatar='explorer',night=false,artwork=null,t=0){const g=setup(canvas,950,230);background(g,950,230,t,night);island(g,125,177,180,39,50);island(g,845,177,180,39,50);bridge(g,274,168,679,168,progress/4);tree(g,60,171,.7);tower(g,834,172,.7);const hop=progress>=4&&t>0&&t<.72?Math.sin(Math.PI*t/.72)*12:0;hero(g,240+Math.min(progress,4)*113,161+Math.sin(t*2)*2-hop,.8,avatar,t,artwork);for(let i=0;i<4;i++){ellipse(g,335+i*100,191,16,5,'#f2e5b43b');if(i<progress)star(g,335+i*100,116+Math.sin(t*2+i)*4,10,'#ffde81',t*.15);}cloud(g,472+Math.sin(t*.4)*20,216,1.3,.5);if(progress>=4){for(let i=0;i<18;i++)star(g,(i*83)%950,20+(i*31)%160,2+i%3,'#ffe4a2',i);celebrate(g,950,230,t);}}
root.WWArt={poly,ellipse,line,round,star,celebrate,crystal,tree,pine,island,hero,fox,background,setup,world,visual,mission};
})(globalThis);
