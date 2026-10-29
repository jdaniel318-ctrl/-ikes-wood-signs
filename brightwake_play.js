(function(root,f){const v=f();if(typeof module==='object'&&module.exports)module.exports=v;else root.BrightwakePlay=v;})(globalThis,function(){'use strict';
function create(seed){return{seed:(Number(seed)>>>0)||1,time:0,spawn:0,playerX:.5,caught:0,done:false,items:[],sparkles:[],breeze:0};}
function rand(s){s.seed=(1664525*s.seed+1013904223)>>>0;return s.seed/4294967296;}
function step(s,dt,target){if(s.done)return s;dt=Math.max(0,Math.min(.05,Number(dt)||0));target=Math.max(.06,Math.min(.94,Number(target)||0));s.time+=dt;s.playerX+=(target-s.playerX)*Math.min(1,dt*8);s.spawn+=dt;s.breeze=Math.max(0,s.breeze-dt);
 if(s.spawn>.75){s.spawn=0;s.items.push({x:.08+rand(s)*.84,y:-.1,kind:rand(s)>.21?'light':'cloud',speed:.15+rand(s)*.08});}
 for(let i=s.items.length-1;i>=0;i--){let x=s.items[i];x.y+=x.speed*dt;if(Math.abs(x.x-s.playerX)<.085&&Math.abs(x.y-.78)<.075){if(x.kind==='light'){s.caught++;s.sparkles.push({x:x.x,y:x.y,life:1});}else s.breeze=.5;s.items.splice(i,1);}else if(x.y>1.1)s.items.splice(i,1);}
 for(let i=s.sparkles.length-1;i>=0;i--){s.sparkles[i].life-=dt;if(s.sparkles[i].life<=0)s.sparkles.splice(i,1);}if(s.caught>=8)s.done=true;return s;}
return{create,step};});
