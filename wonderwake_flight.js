(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WWFlight=api;})(typeof globalThis==='object'?globalThis:this,function(){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function random(seed){let n=(seed>>>0)||1;return()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
function shuffle(items,rng){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function createFlight({seed=1,previous=[]}={}){
 const rng=random(seed),bag=shuffle(Array.from({length:12},(_,i)=>i+1),rng);
 if(bag[0]===previous[0])[bag[0],bag[1]]=[bag[1],bag[0]];
 const targets=bag.slice(0,5);
 const s={x:170,y:280,tx:170,ty:280,score:0,target:targets[0],targets,balloons:[],phase:'flying',time:0,finishTime:0,lock:0,feedbackTime:0,message:'Steer into the matching balloon.',feedback:'guide',hit:null};
 function spawn(){
  const choices=shuffle([s.target,...shuffle(bag.filter(n=>n!==s.target),rng).slice(0,3)],rng);
  const heights=shuffle([115,185,265,345],rng);
  s.balloons=choices.map((n,i)=>({n,x:440+i*145+(rng()-.5)*24,y:clamp(heights[i]+(rng()-.5)*20,100,360),wobble:0}));
  for(const b of s.balloons)if(Math.hypot(b.x-s.x,b.y-s.y)<105)b.y=s.y>235?110:350;
 }
 spawn();
 function steer(x,y){if(s.phase==='complete')return;s.tx=clamp(x,35,915);s.ty=clamp(y,50,415);}
 function step(seconds,{paused=false,hidden=false,motion=true,scaleX=1,scaleY=1,spriteScale=1}={}){
  if(paused||hidden)return null;
  const dt=clamp(Number(seconds)||0,0,.05);s.time+=dt;
  if(s.phase==='complete'){s.finishTime+=dt;return null;}
  s.x+=(s.tx-s.x)*Math.min(1,dt*7);s.y+=(s.ty-s.y)*Math.min(1,dt*7);
  s.feedbackTime=Math.max(0,s.feedbackTime-dt);if(!s.feedbackTime&&s.feedback==='wrong'){s.feedback='guide';s.message='Find '+s.target+'. Steer into its balloon.';}
  if(s.lock>0){s.lock=Math.max(0,s.lock-dt);if(s.lock===0&&s.phase==='between'){s.phase='flying';s.target=targets[s.score];spawn();s.message='Find '+s.target+'. Steer into its balloon.';s.feedback='guide';s.hit=null;s.lock=.45;}return null;}
  for(const b of s.balloons){
   if(b.wobble>0){b.wobble=Math.max(0,b.wobble-dt);if(b.wobble===0){const spots=[440,585,730,875].flatMap(x=>[110,190,270,350].map(y=>({x,y})));const spot=spots.find(p=>Math.hypot(p.x-s.x,p.y-s.y)>105&&s.balloons.every(other=>other===b||Math.hypot(p.x-other.x,p.y-other.y)>100));if(spot){b.x=spot.x;b.y=spot.y;}}continue;}
   if(motion)b.x-=dt*24;if(b.x<35)b.x=980;
   if(Math.hypot((b.x-s.x)*scaleX,(b.y-s.y)*scaleY)>=43*spriteScale)continue;
   s.hit={x:b.x,y:b.y,n:b.n};
   if(b.n!==s.target){b.wobble=1.4;s.feedback='wrong';s.feedbackTime=4;s.message='That is '+b.n+'. Find '+s.target+'.';return {type:'wrong',number:b.n,target:s.target};}
   s.score++;s.feedback='correct';s.feedbackTime=1;s.message='Yes! You found '+b.n+'.';
   s.phase=s.score===5?'complete':'between';s.lock=1;
   return {type:s.phase==='complete'?'complete':'correct',number:b.n};
  }
  return null;
 }
 return {steer,step,snapshot:()=>JSON.parse(JSON.stringify(s))};
}
function mount(host,{flight,art,motion=()=>true,night=()=>false,avatar='explorer',artwork=null,onComplete=()=>true,onReplay,onPaint,onHome,onSpeak=()=>{}}){
 host.innerHTML=`<section class="glider-wrap"><div class="glider-toolbar"><div><span class="flight-kicker">STAR GLIDER</span><h3 id="glider-target"></h3></div><span class="mission-badge" id="glider-score"></span><button class="secondary" id="pause-flight">Pause</button></div><div class="flight-scene"><canvas id="glider-canvas" class="glider-canvas" tabindex="0" aria-label="Steer into the matching number balloon. Use your finger, Pencil, mouse, or arrow keys. Space pauses." aria-describedby="flight-message"></canvas><p id="flight-message" class="flight-message" role="status" aria-live="polite"></p><div class="flight-paused" hidden>Flight paused</div></div><div class="flight-help">Steer into the number above. Touch or drag to fly · Arrows move · Space pauses.</div><div class="flight-finish" hidden><button class="primary gold" id="flight-replay">Fly again</button><button class="secondary" id="flight-paint">Paint your flight</button><button class="secondary" id="flight-home">Back to islands</button></div><p id="flight-save" hidden role="status"></p></section>`;
 const $=id=>host.querySelector('#'+id),can=$('glider-canvas'),g=can.getContext('2d'),scene=host.querySelector('.flight-scene');
 let stopped=false,paused=false,last=performance.now(),frame,completed=false,lastMessage='',w=950,h=470,dpr=1;
 function resize(){const r=can.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);can.width=Math.round(w*dpr);can.height=Math.round(h*dpr);}
 const observer=new ResizeObserver(resize);observer.observe(can);resize();
 const cx=x=>x/950*w,cy=y=>y/470*h,size=()=>clamp(Math.min(w/950,h/470),.62,1.7);
 function steer(e){if(paused||completed)return;e.preventDefault();const b=can.getBoundingClientRect();flight.steer((e.clientX-b.left)/b.width*950,(e.clientY-b.top)/b.height*470);}
 function down(e){if(!e.isPrimary||e.button>0)return;can.setPointerCapture(e.pointerId);can.focus({preventScroll:true});steer(e);}
 function move(e){if(e.isPrimary&&(e.buttons||e.pointerType==='mouse'))steer(e);}
 function togglePause(){paused=!paused;$('pause-flight').textContent=paused?'Resume':'Pause';host.querySelector('.flight-paused').hidden=!paused;last=performance.now();}
 function key(e){if(e.code==='Space'){e.preventDefault();togglePause();return;}if(!e.key.startsWith('Arrow')||paused||completed)return;e.preventDefault();const s=flight.snapshot();flight.steer(s.tx+(e.key==='ArrowLeft'?-45:e.key==='ArrowRight'?45:0),s.ty+(e.key==='ArrowUp'?-40:e.key==='ArrowDown'?40:0));}
 can.addEventListener('pointerdown',down);can.addEventListener('pointermove',move);can.addEventListener('keydown',key);
 $('pause-flight').onclick=togglePause;$('flight-replay').onclick=onReplay;$('flight-paint').onclick=onPaint;$('flight-home').onclick=onHome;
 const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);
 function message(text,kind){if(text!==lastMessage){$('flight-message').textContent=text;lastMessage=text;}$('flight-message').dataset.kind=kind;}
 function paperPlane(x,y,scale,bank=0){
  g.save();g.translate(x,y);g.scale(scale,scale);g.rotate(bank);
  art.ellipse(g,0,28,43,6,'#173e5522');
  art.line(g,[[-77,5],[-56,5]],'#fff3c8',2);art.line(g,[[-65,-5],[-50,-5]],'#fff3c899',2);
  art.poly(g,[[-39,17],[42,0],[-27,-23],[-10,1]],'#a1dcca','#295e69');
  art.poly(g,[[-39,17],[-10,1],[42,0],[-6,18]],'#f7db92','#937f51');
  art.poly(g,[[-10,1],[-27,-23],[7,-5]],'#62aaa3');
  art.line(g,[[-10,1],[42,0]],'#fff7d6',2);art.star(g,-13,-8,5,'#fff3c7');g.restore();
 }
 function balloon(b,s,animate){
  const scale=size(),hit=b.wobble>0,x=cx(b.x)+(hit&&animate?Math.sin(s.time*24)*5*scale:0),y=cy(b.y);
  g.save();g.translate(x,y);g.scale(scale,scale);
  g.beginPath();g.moveTo(0,35);g.quadraticCurveTo(8,49,-4,60);g.strokeStyle='#e7edd4';g.lineWidth=2;g.stroke();
  const grad=g.createRadialGradient(-12,-15,2,6,8,48);grad.addColorStop(0,'#fff3bd');grad.addColorStop(.75,'#f2cc7e');grad.addColorStop(1,'#d9ac5d');
  art.ellipse(g,0,0,33,38,grad);art.poly(g,[[-4,38],[4,38],[0,31]],'#c4964e');
  g.strokeStyle=hit?'#b7652d':'#e3bc72';g.lineWidth=hit?5:1.5;g.beginPath();g.ellipse(0,0,hit?39:33,hit?44:38,0,0,Math.PI*2);g.stroke();
  art.ellipse(g,-15,-20,4,8,'#fffdf08a');g.fillStyle='#193e50';g.font='750 29px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(b.n,0,1);
  if(hit){art.round(g,-13,-66,26,21,7,'#fff3d8');g.fillStyle='#865122';g.font='bold 17px system-ui';g.fillText('↻',0,-55);}g.restore();
 }
 function fireworks(t,animate){
  const centers=[[.19,.24],[.52,.18],[.79,.28]],colors=['#ffe2a1','#abe0d2','#d4c0f0'];
  centers.forEach(([x,y],i)=>{const age=t-(.9+i*.65);if(animate&&(age<0||age>1.7))return;const u=animate?age/1.7:.48,r=(12+80*u)*size();g.save();g.globalAlpha=animate?Math.sin(Math.PI*u):.8;for(let j=0;j<12;j++){const a=j*Math.PI/6;art.line(g,[[w*x+Math.cos(a)*r*.65,h*y+Math.sin(a)*r*.65],[w*x+Math.cos(a)*r,h*y+Math.sin(a)*r]],colors[i],2.5*size());art.star(g,w*x+Math.cos(a)*r,h*y+Math.sin(a)*r,3*size(),colors[i]);}g.restore();});
 }
 function draw(s,animate){
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);art.background(g,w,h,animate?s.time*.45:0,night());
  // Distant islands and a windsock give the flight a destination without changing its steering.
  g.save();g.globalAlpha=.45;art.ellipse(g,w*.18,h*.88,w*.13,h*.025,'#2c6b7d');art.ellipse(g,w*.84,h*.85,w*.1,h*.02,'#2c6b7d');g.restore();
  if(s.phase!=='complete'){
   s.balloons.forEach(b=>balloon(b,s,animate));
   if(s.phase==='between'&&s.hit){g.save();g.globalAlpha=.85;for(let i=0;i<8;i++){const a=i*Math.PI/4,r=animate?(1-s.lock)*48:28;art.star(g,cx(s.hit.x)+Math.cos(a)*r*size(),cy(s.hit.y)+Math.sin(a)*r*size(),5*size(),'#fff4c7');}g.restore();}
   paperPlane(cx(s.x),cy(s.y),size(),animate?clamp((s.ty-s.y)/350,-.16,.16):0);
  }else{
   const t=animate?s.finishTime:5,u=clamp(t/2.2,0,1),ease=1-Math.pow(1-u,3),x=s.x+(710-s.x)*ease,y=s.y+(300-s.y)*ease-Math.sin(u*Math.PI)*100;
   const scale=size();art.island(g,cx(750),cy(385),200*scale,35*scale,45*scale);
   art.line(g,[[cx(840),cy(373)],[cx(840),cy(295)]],'#eee3b9',3*scale);art.poly(g,[[cx(840),cy(295)],[cx(840)+34*scale,cy(303)],[cx(840),cy(315)]],'#efcc80');
   for(let i=0;i<5;i++){const px=w*(.16+i*.145),py=h*(.48-Math.sin(i*.65)*.12);art.star(g,px,py,19*scale,'#f6d78c');g.fillStyle='#204954';g.font='700 '+(15*scale)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(s.targets[i],px,py+scale);}
   paperPlane(cx(x),cy(y),scale,animate?Math.sin(u*Math.PI)*-.35:0);
   if(t>1.7||!animate)art.hero(g,cx(785),cy(375),.75*scale,avatar,0,artwork);
   fireworks(t,animate);
  }
 }
 function finish(){
  completed=true;scene.classList.add('flight-landed');host.querySelector('.flight-help').hidden=true;host.querySelector('.flight-finish').hidden=false;$('flight-save').hidden=false;$('flight-save').textContent='Saving your flight…';
  $('glider-target').textContent='A sky full of discoveries.';can.setAttribute('aria-label','Flight complete. Your glider lands on a floating island beneath five number stars and fireworks.');
  message('Five numbers found. Welcome to Star Landing!','complete');onSpeak('Five numbers found. Welcome to Star Landing!');
  Promise.resolve().then(onComplete).then(ok=>{if(!stopped)$('flight-save').textContent=ok?'Flight saved on this device.':'Flight finished. Save failed — keep a progress copy before leaving.';},()=>{if(!stopped)$('flight-save').textContent='Flight finished. Save failed — keep a progress copy before leaving.';});
 }
 function run(now){
  if(stopped)return;const dt=Math.min(.05,(now-last)/1000);last=now;const animate=motion();
  const event=flight.step(dt,{paused,hidden:document.hidden,motion:animate,scaleX:w/950,scaleY:h/470,spriteScale:size()});const s=flight.snapshot();
  if(event?.type==='complete')finish();
  else if(event)onSpeak(s.message);
  if(!completed){$('glider-target').textContent=s.phase==='between'?'You found '+s.target+'!':'Find the number '+s.target;message(s.message,s.feedback);}
  $('glider-score').textContent=s.score+' / 5 discoveries';
  if(!document.hidden){draw(s,animate);}
  frame=requestAnimationFrame(run);
 }
 message('Steer into the matching balloon.','guide');frame=requestAnimationFrame(run);
 return ()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);can.removeEventListener('pointerdown',down);can.removeEventListener('pointermove',move);can.removeEventListener('keydown',key);};
}

return {version:'0.10.0',createFlight,mount};
});
