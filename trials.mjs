import {mayUse,validDate} from './fleet-tools.mjs';
export const tools=Object.freeze(['local-day','schedule-shift','map-handoff','partner-offer','two-person-confirmation']);
export function trialChange(previous,actor,change,today){
 const {vessel,tool,action,until}=change;
 if(!tools.includes(tool)||typeof vessel!=='string'||!vessel||!validDate(today))throw Error('Specify a tool, vessel and date.');
 const same=previous?.tool===tool&&previous?.vessel===vessel;
 const permitted=op=>mayUse(actor,op,vessel);
 if(action==='propose'&&permitted('preview')){
  if(previous)throw Error('A trial record already exists.');
  return {vessel,tool,status:'proposed',revision:1};
 }
 if(!same||previous.revision!==change.revision)throw Error('Read the current trial first.');
 const next=status=>({...previous,status,revision:previous.revision+1});
 if(action==='approve'&&previous.status==='proposed'&&permitted('approve-trial')&&validDate(until)&&until>=today)return {...next('active'),until};
 if(action==='disable'&&previous.status==='active'&&permitted('approve-trial'))return next('disabled');
 if(action==='promote'&&previous.status==='active'&&previous.until>=today&&permitted('publish-tool')){
  return {tool,status:'available-to-propose',automatic_promotion:false};
 }
 throw Error('This action requires the applicable vessel or fleet authority.');
}
export function trialEnabled(record,tool,vessel,today){return Boolean(record&&record.vessel===vessel&&record.tool===tool&&record.status==='active'&&validDate(today)&&validDate(record.until)&&today<=record.until);}
