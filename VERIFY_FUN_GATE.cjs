'use strict';
const{test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const r=path.resolve(process.argv[2]||'.'),read=n=>fs.readFileSync(path.join(r,n),'utf8');
test('Admiral program gateway is present',()=>a.ok(fs.existsSync(path.join(r,'fun_program.js'))));
// Harborhold permits a dedicated host-side IndexedDB voyage save.
// Actual save scope, reload recovery, denied writes and account isolation are
// exercised by VERIFY_HARBORHOLD_STORAGE.py; source gates are not behavioral proof.
test('game gateway rechecks actual shared authority and never grants a platform role',()=>{const s=read('fun_program.js');a.match(s,/verifyAdmiralAuthority/);a.match(s,/DarkSkyAdmiralSession/);a.doesNotMatch(s,/\.rpc\(|signInWithPassword|saveSession\(/);});
test('game cores and opaque players remain free of site-storage interfaces',()=>{for(const n of ['fun_core.js','fun_player.js','stormwake_core.js','stormwake_game.js'])a.doesNotMatch(read(n),/localStorage|sessionStorage|indexedDB/);});
test('host device-recovery behavior has a separate executable browser verifier',()=>a.ok(fs.existsSync(path.join(r,'VERIFY_HARBORHOLD_STORAGE.py'))));
test('game iframe is scripts-only without same-origin, forms, popups or top navigation',()=>{const s=read('fun_program.js');a.ok(s.includes("setAttribute('sandbox','allow-scripts')"));a.doesNotMatch(s,/allow-same-origin|allow-top-navigation|allow-popups|allow-forms/);a.ok(s.includes('event.source!==frame.contentWindow'));});
test('game export uses a small whitelist-only format, not order backup',()=>{const s=read('fun_program.js');a.ok(s.includes('8192'));a.ok(s.includes('G.serialize'));a.ok(s.includes('G.restore'));a.ok(s.includes("'darksky:admiral-session-ended'"));});
test('FUN is an Admiral program, not inserted in Fleet Core roster',()=>{const s=read('captain.js');a.ok(s.includes('funProgramLaunch'));const app=read('app.js');a.doesNotMatch(app,/project_id\s*:\s*['"]fun['"]/);});
