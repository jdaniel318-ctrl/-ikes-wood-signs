'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),R=require('./stormwake_gl.js');
function meshes(n,out=[]){if(n.mesh)out.push(n);for(const c of n.children)meshes(c,out);return out;}
test('material batching retains separate surfaces, colors and nested transforms with the legacy stride',()=>{
 const scene=new R.Node(),parent=scene.add(new R.Node());parent.pos=[10,2,0];
 for(const [material,x,color] of [[1,0,[.5,.7,.9]],[2,2,[.8,.6,.4]],[1,4,[.2,.3,.4]]]){const n=parent.add(new R.Node(R.shape.box(),color));n.material=material;n.pos=[x,0,0];}
 const list=meshes(R.batch(scene));a.equal(list.length,2);a.deepEqual(list.map(n=>n.material).sort(),[1,2]);
 a.equal(list.reduce((s,n)=>s+n.mesh.length,0),3*R.shape.box().length);
 for(const n of list){a.equal(n.mesh.length%27,0);a.ok(n.mesh.every(Number.isFinite));for(let i=0;i<n.mesh.length;i+=9){a.ok(n.mesh[i]>=9.5&&n.mesh[i]<=14.5);a.ok(n.mesh[i+1]>=1.5&&n.mesh[i+1]<=2.5);a.ok(n.mesh[i+6]>=.2&&n.mesh[i+6]<=.8);}}
});
test('rebatching preserves material and transparency without multiplying tint twice',()=>{
 const scene=new R.Node(),n=scene.add(new R.Node(R.shape.box(),[.25,.5,.75]));n.material=3;n.alpha=.6;n.emission=.7;n.castShadow=false;
 const b=meshes(R.batch(R.batch(scene)))[0];a.equal(b.material,3);a.equal(b.alpha,.6);a.equal(b.emission,.7);a.equal(b.castShadow,false);a.deepEqual(b.mesh.slice(6,9),[.25,.5,.75]);
});
test('profile geometry creates a shaped closed barrel with outward normals and finite legacy vertices',()=>{
 a.equal(typeof R.shape.lathe,'function');const g=R.shape.lathe([[.32,-.5],[.43,0],[.32,.5]],12);a.equal(g.length%27,0);a.ok(g.every(Number.isFinite));let radial=0;for(let i=0;i<g.length;i+=9)radial+=g[i]*g[i+3]+g[i+2]*g[i+5];a.ok(radial>0);a.ok(g.some((v,i)=>i%9===0&&Math.abs(v)>.4));
});
test('smooth sphere normals track its surface for rounded character lighting',()=>{
 const g=R.shape.sphere(1,12,8);for(let i=0;i<g.length;i+=9){const dot=g[i]*g[i+3]+g[i+1]*g[i+4]+g[i+2]*g[i+5];a.ok(dot>.999,'sphere needs radial normals');}
});
test('material batching transforms normals under nonuniform scale and leaves hidden nodes out',()=>{
 const scene=new R.Node(),n=scene.add(new R.Node(R.shape.sphere(1,6,4)));n.scale=[2,3,1];n.rot=[.2,.5,.1];n.material=2;const hidden=scene.add(new R.Node(R.shape.box()));hidden.visible=false;
 const b=meshes(R.batch(scene))[0];a.equal(b.mesh.length,n.mesh.length);for(let i=0;i<b.mesh.length;i+=9)a.ok(Math.abs(Math.hypot(...b.mesh.slice(i+3,i+6))-1)<1e-6);
});
test('upgraded scene stays within a bounded draw and geometry budget and preserves joint handles',()=>{
 const fs=require('fs'),vm=require('vm'),S=require('./stormwake_core.js'),env={StormGL:R,BlackFlagStormwake:S,window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/stormwake_world.js','utf8'),env);const w=env.window.StormwakeWorld.create();w.update(0,0,S.fresh(),new S.Character(),new S.Boat(),'walk',true);
 const visible=[];function walk(n){if(!n.visible)return;if(n.mesh)visible.push(n);n.children.forEach(walk);}walk(w.root);
 a.ok(visible.length<=115,'too many main scene draws');a.ok(visible.reduce((s,n)=>s+n.mesh.length/27,0)<=90000,'too many main scene triangles');a.ok(new Set(visible.map(n=>n.material)).size>=5,'material families must survive world batching');
 for(const person of [w.player,w.bootstrap,w.cartographer])for(const joint of ['head','armL','armR','legL','legR'])a.ok(person.j[joint].children.length,'missing animated joint '+joint);
 for(const n of visible){a.equal(n.mesh.length%27,0);a.ok(n.mesh.every(Number.isFinite));}
});
