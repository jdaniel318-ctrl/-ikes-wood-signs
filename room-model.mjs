import {addDays,validDate,minutes,reflow} from './fleet-tools.mjs';
import {ideasFor} from './ideas.mjs';
export function need(ok,message,status=400){if(!ok){const error=new Error(message);error.status=status;throw error;}}
export function str(v,n=160){return typeof v==='string'?v.trim().slice(0,n):'';}
export function web(v){if(!v)return '';try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
export function makeRoom(input,user,id){
 const name=str(input.name,80),nick=str(input.nick,40);need(name&&nick,'Add a title and your display name.');
 const common={id,kind:input.kind==='weegee'?'weegee':'trip',name,owner:user,people:{[user]:nick},history:[]};
 if(common.kind==='weegee')return {...common,picks:{},agreed:{},result:'',settled:{}};
 const place=str(input.place,120),start=input.start,end=input.end,zone=str(input.zone,60);
 need(place&&validDate(start)&&validDate(end)&&end>=start&&end<=addDays(start,59),'Choose a destination and a trip of 1–60 days.');
 try{new Intl.DateTimeFormat('en',{timeZone:zone}).format();}catch{need(false,'Choose a valid trip time zone.');}
 return {...common,place,start,end,zone,ideas:[],votes:{},saves:{},stops:[],preferences:{},offers:true,hunts:true};
}
function ideaFields(x){
 const title=str(x.title,100),source=web(x.source);need(title,'Give the idea a title.');need(!x.source||source,'Use a full https source link.');
 return {title,detail:str(x.detail,360),where:str(x.where,180),source,category:str(x.category,32)||'Group idea',at:'10:00',duration:60};
}
export function catalogFor(r,day){return [...ideasFor(r.place,day).filter(i=>r.hunts||i.category!=='Scavenger hunt'),...r.ideas.filter(i=>(!i.sponsored||i.approved&&r.offers)&&(!i.day||i.day===day))];}
export function apply(r,user,x){
 const op=x.op,host=r.owner===user; need(r.people[user],'Join this room first.',403);
 const hostOnly=()=>need(host,'Only this room’s organizer can do that.',403);
 if(r.kind==='weegee'){
  need(['pick','agree','result','confirm'].includes(op),'Choose a Weegee action.');
  if(op==='pick'){need(Object.keys(r.picks).length<2,'Both picks are in and locked.');const v=str(x.text,100);need(v,'Enter your pick.');r.picks[user]=v;}
  if(op==='agree'){need(Object.keys(r.people).length===2&&Object.keys(r.picks).length===2,'Both people must enter a pick first.');r.agreed[user]=true;}
  if(op==='result'){need(Object.keys(r.agreed).length===2,'Both people must confirm their picks.');need(!Object.values(r.settled).some(Boolean),'The result is awaiting confirmation.');const t=str(x.text,120);need(t,'Enter a result.');r.result=t;}
  if(op==='confirm'){need(r.result,'Enter a result first.');r.settled[user]=true;}
  return;
 }
 const date=x.day||r.start;need(validDate(date)&&date>=r.start&&date<=r.end,'Choose a day on this trip.');
 const idea=()=>{const a=catalogFor(r,date).find(i=>i.id===x.idea);need(a,'This idea is unavailable on that date.');return a;};
 const stop=()=>{const s=r.stops.find(s=>s.id===x.stop&&s.day===date);need(s,'This stop has changed.');return s;};
 if(op==='vote'||op==='save'){const a=idea(),bag=op==='vote'?r.votes:r.saves;bag[a.id]??={};if(x.value===true)bag[a.id][user]=true;else delete bag[a.id][user];return;}
 if(op==='prefs'){r.preferences[user]=str(x.text,120);return;}
 if(op==='addIdea'||op==='offer'){need(r.ideas.length<250,'This room has reached its idea limit.');const row=ideaFields(x);if(op==='offer')need(row.source&&str(x.terms,180),'Offers need a source and terms.');r.ideas.push({...row,id:x.key,by:user,day:x.onlyDay?date:null,sponsored:op==='offer',terms:str(x.terms,180),approved:false});return;}
 if(op==='approve'){hostOnly();const i=r.ideas.find(i=>i.id===x.idea&&i.sponsored);need(i,'Offer unavailable.');i.approved=x.value===true;return;}
 if(op==='settings'){hostOnly();r.offers=x.offers===true;r.hunts=x.hunts===true;return;}
 if(op==='extend'){hostOnly();need(r.end<addDays(r.start,59),'60-day limit reached.');r.end=addDays(r.end,1);return;}
 if(op==='schedule'||op==='rest'){hostOnly();need(r.stops.length<400,'This trip has reached its stop limit.');const a=op==='rest'?{id:'',title:'Time off',fixed:true,where:''}:idea();const at=a.fixed&&a.at?a.at:x.at;const duration=a.fixed&&a.duration?a.duration:Number(x.duration);const start=minutes(at);
 need(Number.isInteger(start)&&Number.isInteger(duration)&&duration>=5&&duration<=720&&start+duration<=1440,'Choose a start and duration within this day.');
 need(!r.stops.some(s=>s.day===date&&start<minutes(s.at)+s.duration&&start+duration>minutes(s.at)),'That time overlaps a stop or protected downtime.');
 r.stops.push({id:x.key,day:date,idea:a.id,title:a.title,where:a.where,at,duration,fixed:Boolean(a.fixed||x.fixed),done:false,going:{[user]:true}});return;}
 if(op==='going'){const s=stop();if(x.value)s.going[user]=true;else delete s.going[user];return;}
 if(op==='done'){const s=stop();need(host||s.going[user],'Join this stop to check it off.',403);s.done=x.value===true;return;}
 if(op==='remove'){hostOnly();const s=stop();r.stops=r.stops.filter(t=>t.id!==s.id);return;}
 if(op==='shift'){hostOnly();const delay=Number(x.delay),after=minutes(x.after);need(Number.isInteger(delay)&&delay>=5&&delay<=240&&Number.isFinite(after),'Choose a valid delay and starting time.');
 const list=reflow(r.stops.filter(s=>s.day===date),delay,after);need(list.length,'There are no flexible stops to shift.');need(list.every(s=>s.at),'A shifted stop falls beyond midnight. Shorten or remove it first.');
 for(const s of list)r.stops.find(t=>t.id===s.id).at=s.at;return;}
 need(false,'Unknown action.');
}
export function project(r,u){
 const host=r.owner===u;const me=r.people[u];need(me,'Room access required.',403);
 const people=Object.values(r.people);
 if(r.kind==='weegee'){const both=Object.keys(r.picks).length===2;
 return {id:r.id,name:r.name,kind:r.kind,host,me,people,picks:Object.entries(r.picks).filter(([k])=>both||k===u).map(([k,v])=>({who:r.people[k],text:v})),mine:r.picks[u]||'',agreed:!!r.agreed[u],agreements:Object.keys(r.agreed).length,result:r.result,signed:!!r.settled[u],confirmations:Object.keys(r.settled).length};}
 const v={id:r.id,kind:r.kind,name:r.name,place:r.place,start:r.start,end:r.end,zone:r.zone,host,me,people,prefs:r.preferences[u]||'',offers:r.offers,hunts:r.hunts,
 ideas:r.ideas.filter(i=>!i.sponsored||host||i.by===u||i.approved&&r.offers).map(({by,...i})=>({...i,own:by===u})),votes:{},saves:[],stops:r.stops.map(({going,...s})=>({...s,mine:!!going[u],count:Object.keys(going).length})),recent:r.history.slice(-8).reverse()};
 for(const [id,voters] of Object.entries(r.votes)){const mine=!!voters[u],n=Object.keys(voters).length;if(mine||n>=2)v.votes[id]={mine,count:n>=2?n:0};}
 for(const [id,savers] of Object.entries(r.saves))if(savers[u])v.saves.push(id);
 return v;
}
