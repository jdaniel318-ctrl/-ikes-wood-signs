'use strict';const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');let root=path.resolve(process.argv[2]||__dirname);assert(fs.existsSync(path.join(root,'brightwake_play.js')),'Touch-sailing module not built');let G=require(path.join(root,'brightwake_play.js')),n=0;const test=(s,f)=>{f();n++;console.log('PASS',s)};
test('flight starts idle and separate from academic score',()=>{let s=G.create(7);assert.equal(s.caught,0);assert.equal(s.done,false);assert(!('grade' in s));});
test('boat follows clamped target; dt is capped',()=>{let s=G.create(7);G.step(s,1000,900);assert(s.playerX<=1&&s.playerX>=0);assert(s.time<=.06);});
test('lantern collection needs contact, not elapsed time',()=>{let s=G.create(7);s.items=[{x:s.playerX,y:.78,kind:'light',speed:.1}];G.step(s,.01,s.playerX);assert.equal(s.caught,1);assert.equal(s.items.length,0);});
test('clouds never take earned lights or lives',()=>{let s=G.create(7);s.caught=4;s.items=[{x:s.playerX,y:.78,kind:'cloud',speed:.1}];G.step(s,.01,s.playerX);assert.equal(s.caught,4);assert(!('lives' in s));});
test('eight collected lights end one voyage',()=>{let s=G.create(7);s.caught=7;s.items=[{x:s.playerX,y:.78,kind:'light',speed:.1}];G.step(s,.01,s.playerX);assert(s.done);});
test('finished game cannot farm more rewards',()=>{let s=G.create(7);s.done=true;s.caught=8;let b=JSON.stringify(s);G.step(s,1,1);assert.equal(JSON.stringify(s),b);});
console.log(JSON.stringify({passed:n,scope:'Pure touch-sailing physics; not learning assessment'}));
