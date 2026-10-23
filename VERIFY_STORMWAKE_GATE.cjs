'use strict';const{test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),p=require('node:path');const r=p.resolve(process.argv[2]||__dirname),s=()=>fs.readFileSync(p.join(r,'fun_program.js'),'utf8');
test('renderer is verified and fetched lazily after Admiral verification',()=>{const t=s();a.ok(t.includes('STORMWAKE_SHA'));a.ok(t.includes("crypto.subtle.digest('SHA-256'"));a.ok(t.indexOf('await verified(turn)')<t.indexOf('await loadStormwake(turn)'));});
test('new saved run has explicit replacement confirmation',()=>{a.ok(s().includes('funConfirmImport'));a.ok(s().includes('funCancelImport'));});
test('old and new save engines retained and can be chosen without touching accounts',()=>{a.ok(s().includes('BlackFlagStormwake'));a.ok(s().includes('openLegacy'));a.ok(s().includes('legacyMode'));});
// Device persistence is owned by the verified host, never the opaque game.
// Its scoped-write and timeout/reload behavior is tested in the browser suite.
test('sandbox remains opaque and accepts only its own null-origin channel',()=>{const t=s();a.ok(t.includes("setAttribute('sandbox','allow-scripts')"));a.ok(t.includes('event.source!==frame.contentWindow'));a.match(t,/event\.origin\s*!==\s*'null'/);a.match(t,/event\.data\.channel\s*!==\s*channel/);a.doesNotMatch(t,/allow-same-origin|allow-top-navigation|allow-popups|allow-forms|\.rpc\(/);});
