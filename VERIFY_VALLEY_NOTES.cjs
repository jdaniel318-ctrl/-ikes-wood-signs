'use strict';
// Removing the shared card, mislabeling readiness, exposing personal data or
// detaching an Admiral entry must fail this check. No live identity is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(process.argv[2]||__dirname),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const src=read('captain.js');
const start=src.indexOf('function blackFlagTravelProgramCard('),end=src.indexOf('\n/* End Valley Notes program */',start);
assert.ok(start>=0&&end>start,'Valley Notes reusable program card is present');
const ctx={};vm.createContext(ctx);vm.runInContext(src.slice(start,end),ctx);
for(const location of ['watch','admiral']){
 const html=ctx.blackFlagTravelProgramCard(location);
 assert.match(html,/Valley Notes/);
 assert.match(html,/Local pilot/);
 assert.match(html,/Shared traveler profiles are planned/);
 assert.match(html,/https:\/\/valley-notes-shenandoah-nov26\.tv6m8ysvwt\.chatgpt\.site/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.match(html,/One account, several travelers/);
 assert.match(html,/Weather stays central/);
 assert.match(html,/Prior days and decisions/);
 assert.match(html,/Server commissioning has not been performed/);
 assert.doesNotMatch(html,/825 Wild|Joseph|Becca|@privaterelay|siwc_bypass|Bearer /);
 assert.ok(html.includes('valley-notes-'+location));
}
assert.ok(src.includes("${blackFlagTravelProgramCard('watch')}"),'My Fleet has the program entry');
assert.ok(src.includes("blackFlagTravelProgramCard('admiral')"),'Build & Govern has the program entry');
assert.doesNotMatch(ctx.blackFlagTravelProgramCard('watch'),/data-watch-vessel|data-command-order|<iframe|<form/);
const contract=JSON.parse(read('VALLEY_NOTES_PROGRAM.json'));
assert.equal(contract.status,'local_pilot');
assert.equal(contract.server_commissioned,false);
assert.equal(contract.traveler_model.account_to_travelers,'one_to_many');
assert.equal(contract.traveler_model.companion_login_required,false);
assert.equal(contract.traveler_model.name_match_grants_access,false);
assert.equal(contract.traveler_model.shared_profiles_implemented,false);
assert.ok(contract.preserve.includes('weather_with_freshness'));
const lessons=JSON.parse(read('FLEET_LEARNING_REGISTRY.json')).learnings.filter(x=>x.origin==='Valley Notes');
assert.ok(lessons.length>=4);
assert.ok(lessons.every(x=>x.status==='candidate'&&x.automatic_promotion===false));
console.log('PASS Valley Notes: both Admiral entries, access boundary, honest readiness, traveler contract, weather and retained learning');
