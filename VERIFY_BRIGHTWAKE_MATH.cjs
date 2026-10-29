'use strict';
// Independent arithmetic oracle: derive answers from the DISPLAYED prompt / diagram,
// not from the generator's answer field or its seed. No network / user records.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(process.argv[2]||__dirname),C=require(path.join(root,'brightwake_core.js')),D=require(path.join(root,'brightwake_curriculum.js'));
function oracle(q){const p=q.prompt,n=(p.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number),v=q.visual;switch(q.skill){
case 'count':return v.a;case 'compare':return Math.max(...n);case 'sides':return v.sides;
case 'add10':case 'add100':case 'decadd':case 'signed':return n[0]+n[1];
case 'sub10':case 'sub100':return n[0]-n[1];case 'tens':return n[0]*10+n[1];
case 'coins':return n[0]*5+n[1]*10;case 'multiply':return n[0]*n[1];case 'divide':return n[0]/n[1];
case 'perimeter':return (n[0]+n[1])*2;case 'rectangle':return n[0]*n[1];case 'angles':return 180-n[0];
case 'equivalent':return n[0]*n[2]/n[1];case 'fracadd':return n[0]/n[1]+n[2]/n[3];case 'volume':return n[0]*n[1]*n[2];
case 'ratio':return n[1]*n[2]/n[0];case 'percent':return n[0]*n[1]/100;case 'trianglearea':return n[0]*n[1]/2;
case 'scale':return n[1]*n[2];case 'probability':return n[0]/(n[0]+n[1]);case 'linear':return (n[2]-n[1])/n[0];
case 'pythagoras':return Math.sqrt(n[0]*n[0]+n[1]*n[1]);case 'slope':return (n[3]-n[1])/(n[2]-n[0]);
case 'distribute':return n[2]/n[0]-n[1];case 'systems':return n[2]-n[0];case 'function':return n[1]**2+n[0];
case 'circle':return Math.round(n[1]*n[0]*n[0]*100)/100;case 'similar':return n[2]*n[1]/n[0];
case 'triangleangles':return 180-n[0]-n[1];case 'quadratic':return Math.sqrt(n[0]);case 'growth':return n[0]*2**n[1];
case 'trig':return n[0]/2;case 'logarithm':return Math.log2(n[0]);case 'series':return n[0]*(2*n[1]+(n[0]-1)*(n[2]-n[1]))/2;
case 'expected':return(n[0]+n[1])/2;default:throw Error('No oracle for '+q.skill)}}
let cases=0;
for(const s of D.math){for(let seed=1;seed<=200;seed++){const q=C.mathQuestion(s.id,seed),expected=oracle(q);assert.ok(Number.isFinite(expected),q.prompt);assert.ok(Math.abs(q.answer-expected)<1e-8,`${s.id}: ${q.prompt}; expected ${expected}, actual ${q.answer}`);assert.ok(C.checkAnswer(q,String(expected)),s.id+' expected answer rejected');assert.equal(C.checkAnswer(q,String(expected+0.123)),false,s.id+' wrong answer accepted');cases++;}console.log('PASS',s.id,'200 independently computed examples');}
for(const band of Object.values(D.words)){for(const w of band){assert(/^[a-z]+$/.test(w.word),'Nonalphabetic word');assert(w.example.includes('__'),'Cloze missing');assert(w.definition.length>5,'Definition missing');}}
console.log(JSON.stringify({skill_sets:D.math.length,independently_computed_math_examples:cases,incorrect_answer_rejections:cases,word_entries:Object.values(D.words).flat().length,scope:'Arithmetical correctness of these generators only; not completeness, pedagogical validation or school grade certification'}));
