/* Lantern Trail: bounded game rules shared by play, saving and progress imports. */
(function(root){'use strict';
const VERSION='0.7.0', W=1000,H=560,MAX_POINTS=1200;
const SYMBOLS=['star','moon','leaf','diamond'];
const CHAPTERS=[
 {name:'The sleeping lighthouse',place:'Willow Reach',gaps:[2,3,1],pieces:[1,2,3,4,2],start:[.08,.76],end:[.92,.25],sparks:[[.26,.7],[.5,.4],[.74,.26]],water:[{x:.3,y:.32,r:55},{x:.61,y:.72,r:65}],symbols:[[.2,.27],[.73,.24],[.36,.7],[.82,.68]],code:[0,2,1],color:'#edc97b'},
 {name:'A glow across the grove',place:'Moonfern Grove',gaps:[3,2,2],pieces:[1,2,3,4,2],start:[.08,.32],end:[.92,.4],sparks:[[.3,.22],[.53,.62],[.76,.7]],water:[{x:.3,y:.65,r:60},{x:.68,y:.29,r:55}],symbols:[[.68,.7],[.22,.67],[.76,.26],[.32,.25]],code:[1,3,2],color:'#8ed9bf'},
 {name:'The sky remembers',place:'Starlight Summit',gaps:[1,3,4],pieces:[1,2,3,4,2],start:[.08,.72],end:[.92,.62],sparks:[[.28,.32],[.54,.25],[.76,.62]],water:[{x:.43,y:.64,r:60},{x:.78,y:.23,r:52}],symbols:[[.78,.67],[.39,.72],[.21,.28],[.68,.25]],code:[3,0,2],color:'#bca2e4'}
];
const copy=s=>JSON.parse(JSON.stringify(s));
function chapter(i){if(!Number.isInteger(i)||i<0||i>2)throw Error('Unknown trail.');return copy(CHAPTERS[i]);}
function fresh(i=0,completed=[]){return{schema:1,chapter:i,step:0,bridge:[-1,-1,-1],trail:[],found:[],code:[],completed:[...completed]};}
const point=p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1);
const distance=(a,b)=>Math.hypot((a[0]-b[0])*W,(a[1]-b[1])*H);
function segmentDistance(p,a,b){const px=p[0]*W,py=p[1]*H,ax=a[0]*W,ay=a[1]*H,dx=(b[0]-a[0])*W,dy=(b[1]-a[1])*H;const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
function nearPath(p,path,r){return path.some((v,i)=>i?segmentDistance(p,path[i-1],v)<=r:distance(p,v)<=r);}
function checkBridge(s){const c=CHAPTERS[s.chapter];return{ok:!!c&&s.bridge.length===3&&new Set(s.bridge).size===3&&s.bridge.every((p,i)=>p>=0&&c.pieces[p]===c.gaps[i]),reason:'bridge'};}
function fitBridge(state,gap,piece){const s=copy(state),c=CHAPTERS[s.chapter];if(!Number.isInteger(gap)||gap<0||gap>2||!Number.isInteger(piece)||piece<0||piece>=c.pieces.length||s.bridge.includes(piece)||c.pieces[piece]!==c.gaps[gap])return{ok:false,state:s};s.bridge[gap]=piece;return{ok:true,state:s};}
function checkTrail(s){const c=CHAPTERS[s.chapter],p=s.trail;if(p.length<2||p.length>MAX_POINTS||!p.every(point)||distance(p[0],c.start)>48)return{ok:false,reason:'start'};
 for(const pond of c.water)if(nearPath([pond.x,pond.y],p,pond.r+9))return{ok:false,reason:'water'};
 if(!c.sparks.every(v=>nearPath(v,p,38)))return{ok:false,reason:'sparks'};
 if(distance(p[p.length-1],c.end)>48)return{ok:false,reason:'end'};
 return{ok:true};
}
function reveal(state,p){const s=copy(state);if(!point(p))return s;CHAPTERS[s.chapter].symbols.forEach((v,i)=>{if(distance(v,p)<=88&&!s.found.includes(i))s.found.push(i);});return s;}
function checkCode(s){const code=CHAPTERS[s.chapter].code;return{ok:code.every(n=>s.found.includes(n))&&s.code.length===3&&s.code.every((n,i)=>n===code[i]),reason:'code'};}
function advance(state){const s=copy(state);if(s.step>=3)return{ok:false,state:s};const r=[checkBridge,checkTrail,checkCode][s.step](s);if(!r.ok)return{...r,state:s};s.step++;if(s.step===3&&!s.completed.includes(s.chapter))s.completed.push(s.chapter);return{ok:true,state:s};}
function nextChapter(s){return fresh((s.chapter+1)%3,s.completed);}
function validate(s){const fail=()=>{throw Error('This Lantern Trail progress is not valid.');};
 if(!s||typeof s!=='object'||Array.isArray(s)||s.schema!==1||!Number.isInteger(s.chapter)||s.chapter<0||s.chapter>2||!Number.isInteger(s.step)||s.step<0||s.step>3)fail();
 if(!Array.isArray(s.bridge)||s.bridge.length!==3||s.bridge.some(n=>!Number.isInteger(n)||n< -1||n>4)||new Set(s.bridge.filter(n=>n>=0)).size!==s.bridge.filter(n=>n>=0).length)fail();
 if(!Array.isArray(s.trail)||s.trail.length>MAX_POINTS||!s.trail.every(point))fail();
 for(const [key,max,len,unique]of [['found',3,4,true],['code',3,3,false],['completed',2,3,true]]){const a=s[key];if(!Array.isArray(a)||a.length>len||a.some(n=>!Number.isInteger(n)||n<0||n>max)||(unique&&new Set(a).size!==a.length))fail();}
 if(s.step>=1&&!checkBridge(s).ok||s.step>=2&&!checkTrail(s).ok||s.step===3&&(!checkCode(s).ok||!s.completed.includes(s.chapter)))fail();
 return{schema:1,chapter:s.chapter,step:s.step,bridge:[...s.bridge],trail:s.trail.map(p=>[...p]),found:[...s.found],code:[...s.code],completed:[...s.completed]};
}
function reward(profile,state){const s=validate(state),before=profile.glowtrail?.completed||[];const earned=s.completed.filter(n=>!before.includes(n)).length;profile.glowtrail=s;if(earned)profile.sparks=Math.min(999999,profile.sparks+earned*10);return earned*10;}
const api=Object.freeze({version:VERSION,W,H,MAX_POINTS,SYMBOLS,chapter,fresh,validate,fitBridge,checkBridge,checkTrail,reveal,checkCode,advance,nextChapter,reward,segmentDistance,distance});
if(typeof module!=='undefined')module.exports=api;root.WWQuest=api;
})(globalThis);
