'use strict';
const fs=require('fs'),vm=require('vm'),a=require('assert/strict'),path=require('path');
function boot(query,hash='',active=false){
 const els=new Map(),store=new Map(),element=id=>els.get(id)||els.set(id,{hidden:false,innerHTML:'',textContent:'',dataset:{},replaceChildren(){},setAttribute(){}}).get(id);
 const ctx={URLSearchParams,URL,console,isSecureContext:true,crypto:{subtle:{}},location:{search:query,hash,pathname:'/countercraft.html'},localStorage:{getItem:k=>store.get(k)||null},sessionStorage:{getItem:()=>null,removeItem(){}},document:{getElementById:element,addEventListener(){},querySelectorAll:()=>[]},CountercraftFlow:{create:()=>({})},CountercraftClient:{transport(){throw Error('Unexpected transport before valid entry')}},history:{replaceState(){}}};ctx.globalThis=ctx;
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'countercraft_config.js'),'utf8'),ctx);
 if(active)store.set('countercraft-active-location',JSON.stringify(ctx.CountercraftConfig.scope));
 vm.runInContext(fs.readFileSync(path.join(__dirname,'countercraft_customer.js'),'utf8'),ctx);return {els,html:element('ccApp').innerHTML};
}
for(const [q,h,configured] of [['?preview=1','',false],['?preview=1','#launch=bad',false],['?preview=1','#launch='+'a'.repeat(32),true]]){
 const r=boot(q,h,configured);a.match(r.html,/Preview ended/);a.match(r.html,/href="index.html"/);a.match(r.html,/Return to Engine/);a.doesNotMatch(r.html,/Please ask Ike/);a.equal(r.els.get('ccHelp').hidden,true);
}
const normal=boot('');a.match(normal.html,/Please ask Ike/);a.doesNotMatch(normal.html,/Return to Engine|href="index.html"/);
console.log('PASS expired, malformed and consumed preview recovery; no service call; ordinary kiosk remains separate');
