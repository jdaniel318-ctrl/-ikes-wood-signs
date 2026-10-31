'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||__dirname),s=fs.readFileSync(path.join(root,'index.html'),'utf8');
let n=0;function check(name,fn){fn();console.log('PASS',name);n++;}
const match=s.match(/<!-- HOMEPORT_VESSEL_START -->([\s\S]*?)<!-- HOMEPORT_VESSEL_END -->/);
check('named Wonderwake vessel entry exists',()=>assert.ok(match,'Wonderwake ship launch must be present'));
const b=match[1];
check('inside fleet dock, outside canonical roster',()=>{assert.ok(s.indexOf(match[0])>s.indexOf('id="fleetCommissioningReference"'));assert.ok(s.indexOf(match[0])<s.indexOf('id="fleetLearningRegistry"'));});
check('exact ship destination; no identity query or fragment',()=>assert.match(b,/href="https:\/\/jdaniel318-ctrl\.github\.io\/wonderwake\/"/));
check('opened without opener or referrer',()=>assert.match(b,/target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"/));
check('dated commissioning receipt is visible',()=>{assert.match(b,/Commissioned · 31 Oct 2026 · Admiral Program/);assert.match(b,/not a live health check/);const r=JSON.parse(fs.readFileSync(path.join(root,'WONDERWAKE_COMMISSION_RECEIPT.json'),'utf8'));assert.equal(r.project_id,'wonderwake');assert.equal(r.status,'commissioned');assert.equal(r.browser_admiral_authenticated,false);assert.equal(r.existing_permissions_unchanged,true);assert.equal(r.authority_audit_id,33);});
check('learning identity retained',()=>assert.match(b,/INDEPENDENT LEARNING VESSEL/));
check('no inherited vessel control action',()=>assert.doesNotMatch(b,/data-(?:project-id|open-project-control|fleet-dock-action)|iframe|<script/));
check('no learner transfer or live-health claim',()=>{assert.match(b,/No learner data or account session is sent/);assert.match(b,/not a live health check/);});
check('shared capability promotion stays deliberate',()=>assert.match(b,/reviewed and adopted deliberately/));


check('launch is accessible on the Engine launchpad',()=>{const launch=s.match(/<!-- FLEETBOUND_LAUNCH_START -->([\s\S]*?)<!-- FLEETBOUND_LAUNCH_END -->/);assert.ok(launch);assert.ok(s.indexOf(launch[0])>s.indexOf('id="clearDeckLaunchpad"'));assert.ok(s.indexOf(launch[0])<s.indexOf('id="clearDeckSystemsToggle"'));assert.match(launch[0],/href="https:\/\/jdaniel318-ctrl\.github\.io\/wonderwake\/"/);});
check('mission-fit lessons remain unadopted',()=>{const r=JSON.parse(fs.readFileSync(path.join(root,'WONDERWAKE_FLEET_LESSONS.json'),'utf8'));assert.equal(r.automatic_promotion,false);assert.equal(r.candidates.length,6);assert.ok(r.candidates.every(x=>x.status==='candidate'&&x.automatic_promotion===false&&x.applies.length===0));assert.match(s,/id="wonderwakeFleetLessons"/);});

console.log(n+' Fleetbound entry checks passed');
