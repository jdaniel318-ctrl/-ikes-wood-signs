(function(root){'use strict';const C=typeof module!=='undefined'?require('./wonderwake_content.js'):root.WWContent;
const Q=typeof module!=='undefined'?require('./wonderwake_quest.js'):root.WWQuest;
const ids=['starling','comet','aurora'];const MAX_LEARNERS=24;
const DRAWING_LIMITS=Object.freeze({strokes:2000,points:50000,importBytes:64000000});
function validLearnerId(id){return typeof id==='string'&&(ids.includes(id)||/^learner-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id));}
function nickname(value){if(typeof value!=='string'||value.trim().length<1||value.trim().length>24||/[<>\x00-\x1f\x7f]/.test(value))throw Error('Choose a short nickname, 1–24 characters, with no markup or line breaks.');return value.trim();}
function displayName(p){return p.nickname||(ids.includes(p.id)?p.id[0].toUpperCase()+p.id.slice(1):'Explorer');}
const avatars=['explorer','princess','robot','dinosaur','custom'];
const X=typeof module!=='undefined'?require('./wonderwake_creative.js'):root.WWCreative;
function canonical(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';}
function number(s){if(typeof s==='number')return Number.isFinite(s)?s:null;if(typeof s!=='string')return null;s=s.trim().replace(/−/g,'-');if(/^[-+]?\d+(?:\.\d+)?\s*\/\s*[-+]?\d+(?:\.\d+)?$/.test(s)){const [a,b]=s.split('/').map(Number);return b!==0?a/b:null;}if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;const v=Number(s);return Number.isFinite(v)?v:null;}
function answerEqual(a,b){const x=number(a),y=number(b);if(x!==null&&y!==null)return Math.abs(x-y)<1e-8;if(typeof a==='string'&&typeof b==='string')return a.trim().toLowerCase()===b.trim().toLowerCase();return false;}
function newProfile(id,name){if(!validLearnerId(id))throw Error('Unknown explorer');return{...(name===undefined?{}:{nickname:nickname(name)}),schema:1,vessel:'wonderwake',id,revision:0,levels:{math:0,spelling:0},skills:{},sparks:0,bridges:0,words:0,flights:0,theme:'day',avatar:id==='starling'?'princess':id==='comet'?'robot':'explorer',motion:true,voice:false,art:{pumpkin:[],tree:[],robot:[]},seed:1,updatedAt:0};}
function record(p,subject,skill,signature,correct,hinted,now=Date.now()){
if(!['math','spelling'].includes(subject))throw Error('Unknown subject');const bank=C[subject];const index=bank.findIndex(s=>s.id===skill);if(index<0)throw Error('Unknown skill');const day=new Date(now).toISOString().slice(0,10);
let s=p.skills[skill]||(p.skills[skill]={attempts:0,correct:0,independent:0,seen:[],days:[],streak:0,lastSeen:0,reviewAt:0});
s.attempts++;const fresh=!s.seen.includes(signature);if(correct){s.correct++;if(!hinted&&fresh){s.independent++;s.streak++;s.seen.push(signature);if(s.seen.length>60)s.seen.shift();if(!s.days.includes(day))s.days.push(day);s.days=s.days.slice(-14);}else if(hinted)s.streak=0;}else s.streak=0;
s.lastSeen=now;s.reviewAt=now+86400000;let advanced=false;
if(correct&&!hinted&&fresh&&s.streak>=3&&p.levels[subject]===index&&index<bank.length-1){p.levels[subject]++;s.streak=0;advanced=true;}
if(correct&&fresh)p.sparks+=hinted?1:3;p.sparks=Math.min(p.sparks,999999);p.updatedAt=now;p.revision++;return{advanced,level:p.levels[subject],status:skillStatus(s)};
}
function skillStatus(s){return !s?'new':s.independent>=5&&s.days.length>=2&&s.correct/Math.max(1,s.attempts)>=0.8?'steady':'practicing';}
function chooseSkill(p,subject,now=Date.now()){
const i=p.levels[subject];const bank=C[subject];const due=bank.slice(0,i).filter(x=>p.skills[x.id]&&p.skills[x.id].reviewAt<=now);
return due.length&&p.seed%4===0?due[0].index:i;
}
function validateProfile(p){const fail=()=>{throw Error('This file is not valid Wonderwake progress. Nothing was replaced.');};
if(!p||typeof p!=='object'||Array.isArray(p)||p.schema!==1||p.vessel!=='wonderwake'||!validLearnerId(p.id))fail();
const int=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
if(!p.levels||!int(p.levels.math,C.math.length-1)||!int(p.levels.spelling,C.spelling.length-1))fail();
for(const k of ['sparks','bridges','words','flights','revision','seed'])if(!int(p[k],k==='seed'?2147483647:9999999))fail();
if(!['day','night'].includes(p.theme)||!avatars.includes(p.avatar)||typeof p.motion!=='boolean'||typeof p.voice!=='boolean'||!Number.isFinite(p.updatedAt)||p.updatedAt<0)fail();
if(!p.skills||Array.isArray(p.skills)||typeof p.skills!=='object'||Object.keys(p.skills).length>C.math.length+C.spelling.length)fail();
const allowed=new Set([...C.math,...C.spelling].map(s=>s.id));let clean=newProfile(p.id,p.nickname);for(const k of ['revision','sparks','bridges','words','flights','seed','theme','avatar','motion','voice','updatedAt'])clean[k]=p[k];clean.levels={math:p.levels.math,spelling:p.levels.spelling};
for(const [k,s]of Object.entries(p.skills)){if(!allowed.has(k)||!s||!['attempts','correct','independent','streak'].every(n=>int(s[n],9999999))||s.correct>s.attempts||s.independent>s.correct||!Array.isArray(s.seen)||s.seen.length>60||s.seen.some(x=>typeof x!=='string'||x.length>1500)||!Array.isArray(s.days)||s.days.length>14||s.days.some(x=>!/^\d{4}-\d{2}-\d{2}$/.test(x))||![s.lastSeen,s.reviewAt].every(x=>Number.isFinite(x)&&x>=0))fail();clean.skills[k]={attempts:s.attempts,correct:s.correct,independent:s.independent,streak:s.streak,seen:[...s.seen],days:[...s.days],lastSeen:s.lastSeen,reviewAt:s.reviewAt};}
if(p.artwork!==undefined){try{clean.artwork=X.validateArtwork(p.artwork);}catch(e){fail();}}if(p.avatar==='custom'&&!clean.artwork)fail();
if(!p.art||typeof p.art!=='object')fail();for(const k of ['pumpkin','tree','robot']){if(!Array.isArray(p.art[k])||p.art[k].length>100)fail();clean.art[k]=p.art[k].map(o=>{if(!o||!['circle','star','triangle','heart','diamond','bolt','eye','mouth','sticker'].includes(o.type)||![o.x,o.y,o.size,o.rotation].every(Number.isFinite)||o.x<0||o.x>1||o.y<0||o.y>1||o.size<0.02||o.size>0.25||Math.abs(o.rotation)>360||!/^#[0-9a-f]{6}$/i.test(o.color))fail();if(o.type==='sticker'&&!clean.artwork)fail();return{type:o.type,x:o.x,y:o.y,size:o.size,rotation:o.rotation,color:o.color};});}
if(p.makerInk!==undefined){
 if(!p.makerInk||typeof p.makerInk!=='object'||Array.isArray(p.makerInk))fail();clean.makerInk={};
 for(const kind of ['pumpkin','tree','robot']){const ink=p.makerInk[kind];let points=0;if(!Array.isArray(ink)||ink.length>DRAWING_LIMITS.strokes)fail();
  clean.makerInk[kind]=ink.map(s=>{if(!s||!/^#[0-9a-f]{6}$/i.test(s.color)||!Number.isInteger(s.size)||s.size<2||s.size>30||!Array.isArray(s.points)||!s.points.length||(points+=s.points.length)>DRAWING_LIMITS.points||s.points.some(pt=>!Array.isArray(pt)||pt.length!==2||pt.some(v=>!Number.isFinite(v)||v<0||v>1)))fail();return{color:s.color,size:s.size,points:s.points.map(pt=>[...pt])};});
 }
}
if(p.paintTools!==undefined){
 const t=p.paintTools,keys=['pen','pencil','marker','eraser'];
 if(!t||typeof t!=='object'||Array.isArray(t)||!Array.isArray(t.colors)||t.colors.length>16||t.colors.some(c=>typeof c!=='string'||!/^#[0-9a-f]{6}$/i.test(c))||new Set(t.colors.map(c=>c.toLowerCase())).size!==t.colors.length||!t.sizes||typeof t.sizes!=='object'||Array.isArray(t.sizes)||keys.some(k=>!Number.isInteger(t.sizes[k])||t.sizes[k]<1||t.sizes[k]>40))fail();
 clean.paintTools={colors:[...t.colors],sizes:Object.fromEntries(keys.map(k=>[k,t.sizes[k]]))};
 if(t.sizes.brush!==undefined){if(!Number.isInteger(t.sizes.brush)||t.sizes.brush<1||t.sizes.brush>40)fail();clean.paintTools.sizes.brush=t.sizes.brush;}
 if(t.opacities!==undefined){const all=[...keys,'brush'];if(!t.opacities||typeof t.opacities!=='object'||Array.isArray(t.opacities)||all.some(k=>!Number.isInteger(t.opacities[k])||t.opacities[k]<1||t.opacities[k]>100))fail();clean.paintTools.opacities=Object.fromEntries(all.map(k=>[k,t.opacities[k]]));}
}
if(p.gallery!==undefined){
 if(!Array.isArray(p.gallery)||p.gallery.length>12)fail();
 clean.gallery=p.gallery.map(d=>{
  if(!d||typeof d.title!=='string'||!d.title.trim()||d.title.length>80||/[<>\x00-\x1f]/.test(d.title)||!Number.isFinite(d.createdAt)||d.createdAt<0||!Array.isArray(d.strokes)||d.strokes.length>DRAWING_LIMITS.strokes)fail();let points=0;
  if(d.paper!==undefined&&(!d.paper||d.paper.width!==1600||!Number.isInteger(d.paper.height)||d.paper.height<667||d.paper.height>2667))fail();
  let layers;
  if(d.layers!==undefined){
   if(!Array.isArray(d.layers)||!d.layers.length||d.layers.length>6||new Set(d.layers.map(l=>l?.id)).size!==d.layers.length)fail();
   layers=d.layers.map(l=>{if(!l||!Number.isInteger(l.id)||l.id<1||l.id>1000000||typeof l.name!=='string'||!l.name.trim()||l.name.length>24||/[<>\x00-\x1f]/.test(l.name)||typeof l.visible!=='boolean'||typeof l.locked!=='boolean'||!Number.isInteger(l.opacity)||l.opacity<1||l.opacity>100)fail();return{id:l.id,name:l.name,visible:l.visible,locked:l.locked,opacity:l.opacity};});
  }
  return {title:d.title,createdAt:d.createdAt,...(d.paper===undefined?{}:{paper:{width:d.paper.width,height:d.paper.height}}),...(layers?{layers}:{}),strokes:d.strokes.map(s=>{
   if(!s||(s.tool!==undefined&&!['pen','pencil','marker','eraser','brush'].includes(s.tool))||!/^#[0-9a-f]{6}$/i.test(s.color)||!Number.isInteger(s.size)||s.size<1||s.size>40||!Array.isArray(s.points)||!s.points.length||(points+=s.points.length)>DRAWING_LIMITS.points||s.points.some(pt=>!Array.isArray(pt)||pt.length!==2||pt.some(v=>!Number.isFinite(v)||v<0||v>1)))fail();
   if(s.opacity!==undefined&&(!Number.isInteger(s.opacity)||s.opacity<1||s.opacity>100))fail();
   if(layers?!layers.some(l=>l.id===s.layer):s.layer!==undefined)fail();
   return {...(s.tool===undefined?{}:{tool:s.tool}),color:s.color,size:s.size,...(s.opacity===undefined?{}:{opacity:s.opacity}),...(layers?{layer:s.layer}:{}),points:s.points.map(pt=>[...pt])};
  })};
 });
}
if(p.school!==undefined){const school=typeof module!=='undefined'?require('./school-state.js'):root.WWSchoolState;clean.school=school.validate(p.school);}
if(p.glowtrail!==undefined){try{clean.glowtrail=Q.validate(p.glowtrail);}catch(e){fail();}}
return clean;
}
const api={ids,MAX_LEARNERS,DRAWING_LIMITS,validLearnerId,nickname,displayName,avatars,newProfile,record,chooseSkill,skillStatus,answerEqual,number,canonical,validateProfile};if(typeof module!=='undefined')module.exports=api;root.WWCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
