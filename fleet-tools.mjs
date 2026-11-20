// Pure functions. Supply the trip's zone and the vessel's verified authority at the call site.
export function localDate(zone,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=k=>parts.find(p=>p.type===k).value;
 return [get('year'),get('month'),get('day')].join('-');
}
export function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const t=Date.parse(s+'T12:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===s;}
export function addDays(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function dayToOpen(start,end,zone,now){const d=localDate(zone,now);return d<start?start:d>end?end:d;}
export function clock(minutes){return [Math.floor(minutes/60),minutes%60].map(n=>String(n).padStart(2,'0')).join(':');}
export function minutes(s){return /^([01]\d|2[0-3]):[0-5]\d$/.test(s)?Number(s.slice(0,2))*60+Number(s.slice(3)):NaN;}
export function routeLinks(destination){const d=encodeURIComponent(destination);return {Apple:'https://maps.apple.com/directions?destination='+d,Google:'https://www.google.com/maps/dir/?api=1&destination='+d,Waze:'https://www.waze.com/ul?q='+d};}
export function reflow(stops,delay,after=0){
 const fixed=stops.filter(s=>s.fixed||s.done).map(s=>[minutes(s.at),minutes(s.at)+s.duration]);
 const updates=[];let cursor=after;
 for(const s of [...stops].sort((a,b)=>a.at.localeCompare(b.at))){
  const old=minutes(s.at);if(s.fixed||s.done||old<after)continue;
  let at=Math.max(old+delay,cursor);
  for(const [a,b] of [...fixed].sort((x,y)=>x[0]-y[0]))if(at<b&&at+s.duration>a)at=b;
  if(at+s.duration>1440){updates.push({id:s.id,old:s.at,at:null});continue;}
  cursor=at+s.duration;updates.push({id:s.id,old:s.at,at:clock(at)});
 }
 return updates;
}
export function mayUse(actor,operation,vessel){
 if(!actor||!vessel)return false;
 if(operation==='publish-tool')return actor.role==='admiral'&&actor.fleetGovernance===true;
 if(operation==='approve-trial')return actor.role==='captain'&&actor.vessels?.includes(vessel)===true;
 return operation==='preview'&&['first-mate','captain','admiral'].includes(actor.role)&&actor.vessels?.includes(vessel)===true;
}
