/* Public configuration selects a location; the gateway authorizes every operation. */
(function(g){'use strict';
const base=Object.freeze({projectId:'ikes-wood-signs',backend:'https://sjgqqtnuttnkwsoebbqf.supabase.co',environment:'staging',site:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',deploymentId:'countercraft-pilot-1',mode:'live'});
function checked(s){if(!s||Object.keys(s).length!==6||['projectId','backend','environment','site'].some(k=>s[k]!==base[k])||!/^[-a-zA-Z0-9_]{1,80}$/.test(s.deploymentId)||!['live','sea_trial'].includes(s.mode))throw Error('Choose a valid Ike location.');return Object.freeze({...s});}
function activeLocation(){try{const s=JSON.parse(g.localStorage.getItem('countercraft-active-location'));return s?checked(s):null;}catch(_){return null;}}
function selectLocation(s){const value=checked(s);g.localStorage.setItem('countercraft-active-location',JSON.stringify(value));return value;}
function consumeLaunch(nonce,kind){if(!/^[a-f0-9]{32}$/.test(nonce||''))return null;const key='blackflag-engine-launch:'+nonce;let record;try{record=JSON.parse(g.sessionStorage.getItem(key));g.sessionStorage.removeItem(key);if(!record||record.kind!==kind||record.build!=='8.8.20.88'||record.expiresAt<Date.now()||record.expiresAt>Date.now()+600001)return null;return {...record,scope:checked(record.scope)};}catch(_){return null;}}
function link(query,scope,token){const s=checked(scope),url=new URL('countercraft.html',g.location.href);url.search=query;url.searchParams.set('location',s.deploymentId);url.searchParams.set('mode',s.mode);if(token)url.hash='token='+token;return url.href;}
function receiptScope(params){return checked({...base,deploymentId:params.get('location')||base.deploymentId,mode:params.get('mode')||'sea_trial'});}
g.CountercraftConfig=Object.freeze({scope:base,build:'8.8.20.88',name:'Harborlight',activeLocation,selectLocation,checked,link,receiptScope,consumePreview:nonce=>consumeLaunch(nonce,'preview'),consumeTrial:nonce=>consumeLaunch(nonce,'trial')});
})(globalThis);
