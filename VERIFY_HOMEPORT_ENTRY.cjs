'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||__dirname),s=fs.readFileSync(path.join(root,'index.html'),'utf8');
let n=0;function check(name,fn){fn();console.log('PASS',name);n++;}
const match=s.match(/<!-- HOMEPORT_VESSEL_START -->([\s\S]*?)<!-- HOMEPORT_VESSEL_END -->/);
check('named preview vessel entry exists',()=>assert.ok(match,'Wonderwake ship launch must be present'));
const b=match[1];
check('inside fleet dock, outside canonical roster',()=>{assert.ok(s.indexOf(match[0])>s.indexOf('id="fleetCommissioningReference"'));assert.ok(s.indexOf(match[0])<s.indexOf('id="fleetLearningRegistry"'));});
check('exact ship destination; no identity query or fragment',()=>assert.match(b,/href="https:\/\/jdaniel318-ctrl\.github\.io\/wonderwake\/"/));
check('opened without opener or referrer',()=>assert.match(b,/target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"/));
check('commissioning explicitly not granted',()=>assert.match(b,/Server commissioning pending/));
check('not represented as a program',()=>assert.match(b,/INDEPENDENT LEARNING VESSEL/));
check('no inherited vessel control action',()=>assert.doesNotMatch(b,/data-(?:project-id|open-project-control|fleet-dock-action)|iframe|<script/));
check('no learner transfer or live-health claim',()=>{assert.match(b,/No learner data or account session is sent/);assert.match(b,/not a live health check/);});
check('shared capability promotion stays deliberate',()=>assert.match(b,/reviewed and adopted deliberately/));
console.log(n+' Homeport entry checks passed');
