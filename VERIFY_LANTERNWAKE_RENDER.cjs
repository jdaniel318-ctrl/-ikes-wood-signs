'use strict';
// Real geometry checks: catches lighting seams and malformed/outward normals.
const {test}=require('node:test'),a=require('node:assert/strict'),path=require('node:path');
const R=require(path.resolve(process.argv[2]||__dirname,'stormwake_gl.js'));
test('joined round profiles share smooth lighting normals across radial and profile seams',()=>{
  const g=R.shape.lathe([[.25,0],[.32,.2],[.34,.55],[.22,1]],16),seen=new Map();
  for(let i=0;i<g.length;i+=9){
    if(g[i+1]<.01||g[i+1]>.99)continue;
    const key=g.slice(i,i+3).map(v=>v.toFixed(7)).join('/'),n=g.slice(i+3,i+6);
    if(seen.has(key))a.ok(n.every((v,j)=>Math.abs(v-seen.get(key)[j])<1e-6),'Visible normal seam at '+key);
    else seen.set(key,n);
  }
  a.ok(seen.size>=32);
});
test('closed profile retains finite vertices, unit normals and outward side lighting',()=>{
  const g=R.shape.lathe([[.32,-.5],[.43,0],[.32,.5]],12);
  a.equal(g.length,1944);a.ok(g.every(Number.isFinite));
  for(let i=0;i<g.length;i+=9){
    a.ok(Math.abs(Math.hypot(...g.slice(i+3,i+6))-1)<1e-6);
    if(Math.abs(g[i+4])<.999)a.ok(g[i]*g[i+3]+g[i+2]*g[i+5]>0);
  }
});
