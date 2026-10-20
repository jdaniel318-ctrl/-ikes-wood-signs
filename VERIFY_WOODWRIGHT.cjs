'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.argv[2]||__dirname),p=path.join(root,'woodwright_fit.js');
let W;try{W=require(p)}catch(_){}
function api(){a.ok(W,'Woodwright fit contract must be supplied');return W;}
function board(w=100,h=60,rect={x:20,y:20,w:60,h:20}){const mask=new Uint8Array(w*h);for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)mask[y*w+x]=1;return{width:w,height:h,mask};}
function pixels(w,h,fg=[165,105,60],bg=[192,183,166],r={x:20,y:20,w:60,h:20}){const d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const col=x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h?fg:bg;d.set([...col,255],4*(y*w+x));}return d;}
test('no warm-countertop fallback with no actual contrasting wood',()=>{const w=api();a.equal(w.detectPixels(pixels(100,60,[192,183,166]),100,60),null);});
test('warm background is excluded; detected center belongs to the board',()=>{const s=api().detectPixels(pixels(100,60),100,60);a.ok(s);a.ok(s.region.x>=.2);a.ok(s.region.y>=1/3);a.ok(s.region.x+s.region.w<=.8);a.equal(s.mask[30*100+5],0);a.ok(s.mask[30*100+50]);});
test('no all-image fallback for featureless brown image',()=>{a.equal(api().detectPixels(pixels(100,60,[165,105,60],[165,105,60]),100,60),null);});
test('known rectangular board keeps a safety inset',()=>{const b=board();const r=api().interior(b,2);a.deepEqual(r,{x:22,y:22,w:56,h:16});});
test('interior rectangle never crosses open cutout',()=>{const b=board();for(let y=20;y<33;y++)for(let x=46;x<53;x++)b.mask[y*100+x]=0;const r=api().interior(b,2);a.ok(r.w>0);a.ok(api().containsBox(b,r));});
test('invalid or empty masks fail closed',()=>{a.equal(api().interior(board(100,60,{x:0,y:0,w:0,h:0}),2),null);a.equal(api().containsBox(board(),{x:NaN,y:0,w:1,h:1}),false);});
test('outside glyphs are rejected without masking them off',()=>{const b=board();const ink=new Uint8ClampedArray(100*60*4);ink[4*(30*100+10)+3]=255;a.equal(api().verifyInk(ink,100,60,b).ok,false);a.equal(ink[4*(30*100+10)+3],255);});
test('all visible glyph pixels inside board pass',()=>{const b=board();const ink=new Uint8ClampedArray(100*60*4);for(let x=30;x<70;x++)ink[4*(30*100+x)+3]=255;a.equal(api().verifyInk(ink,100,60,b).ok,true);});
test('empty lettering cannot receive fit proof',()=>{a.equal(api().verifyInk(new Uint8ClampedArray(24000),100,60,board()).ok,false);});
test('mismatched image arrays fail closed',()=>{a.throws(()=>api().verifyInk(new Uint8ClampedArray(4),100,60,board()));});
test('visible bounds include transformed oversize letters; fit always scales down',()=>{const r={x:20,y:20,w:60,h:20};const out=api().fitRect(120,100,r);a.ok(out.w<=60&&out.h<=20);a.equal(out.x+out.w/2,50);a.equal(out.y+out.h/2,30);});
test('short text expands by one uniform factor, no crop or arbitrary offsets',()=>{const r={x:20,y:20,w:60,h:20};const o=api().fitRect(20,10,r);a.equal(o.w/o.h,2);a.ok(o.x>=20&&o.x+o.w<=80);});
test('negative, NaN, Infinity extents fail closed',()=>{for(const val of [-1,0,NaN,Infinity])a.equal(api().fitRect(val,10,{x:0,y:0,w:1,h:1}),null);});
test('known rotated band stays inside source mask',()=>{const b=board(100,100,{x:0,y:0,w:0,h:0});for(let y=10;y<90;y++)for(let x=10;x<90;x++)if(Math.abs(x-y)<12)b.mask[y*100+x]=1;const r=api().interior(b,2);a.ok(r);a.ok(api().containsBox(b,r));});
test('source buffers are not mutated by detection or inset calculation',()=>{const d=pixels(100,60),before=Buffer.from(d);api().detectPixels(d,100,60);a.equal(Buffer.compare(before,Buffer.from(d)),0);const b=board(),b0=Buffer.from(b.mask);api().interior(b,2);a.equal(Buffer.compare(b0,Buffer.from(b.mask)),0);});
test('fit module cannot confer stock, ownership, or storage authority',()=>{const w=api();a.equal(w.productionCertified,false);const s=fs.readFileSync(p,'utf8');a.doesNotMatch(s,/localStorage|sessionStorage|indexedDB|fetch\(|\.setItem\(/);});
