/* Shadecraft raster composition. Saved legacy pictures retain their original rendering. */
(function(root){'use strict';
const PAPER='#fffdf3';
const alpha=s=>s.opacity===undefined?(s.tool==='marker'?.38:s.tool==='pencil'?.78:1):s.opacity/100;
function path(g,s,w,h,width){
 const p=s.points;g.lineWidth=width;g.beginPath();
 if(p.length===1){g.arc(p[0][0]*w,p[0][1]*h,width/2,0,Math.PI*2);g.fill();}
 else{g.moveTo(p[0][0]*w,p[0][1]*h);for(let i=1;i<p.length;i++)g.lineTo(p[i][0]*w,p[i][1]*h);g.stroke();}
}
function stroke(g,s,w,h,layered=false){
 if(!s.points.length)return;g.save();g.lineCap=g.lineJoin='round';
 g.strokeStyle=g.fillStyle=s.tool==='eraser'?PAPER:s.color;
 if(layered&&s.tool==='eraser')g.globalCompositeOperation='destination-out';
 const width=s.size*w/800*(s.tool==='marker'?2:s.tool==='pencil'?.6:s.tool==='brush'?3:1),opacity=alpha(s);
 if(s.tool==='brush'){
  // Nested whole paths feather the edge without accumulating dots along a stroke.
  let previous=0;for(let i=1;i<=16;i++){const target=opacity*(i/16)**2;g.globalAlpha=(target-previous)/(1-previous);path(g,s,w,h,width*(1-(i-1)/16));previous=target;}
 }else{g.globalAlpha=opacity;path(g,s,w,h,width);}g.restore();
}
function canvasLike(canvas){const c=canvas.ownerDocument.createElement('canvas');c.width=canvas.width;c.height=canvas.height;return c;}
function background(canvas){const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.fillStyle=PAPER;g.fillRect(0,0,canvas.width,canvas.height);return g;}
function blend(g,canvas,layer){g.save();g.globalAlpha=layer.opacity/100;g.drawImage(canvas,0,0);g.restore();}
function paint(canvas,strokes,paper,layers){
 canvas.width=paper?.width||800;canvas.height=paper?.height||480;const g=background(canvas);
 if(!layers){for(const s of strokes)stroke(g,s,canvas.width,canvas.height);return;}
 const buffer=canvasLike(canvas),b=buffer.getContext('2d');
 for(const layer of layers){if(!layer.visible)continue;b.clearRect(0,0,buffer.width,buffer.height);for(const s of strokes)if(s.layer===layer.id)stroke(b,s,buffer.width,buffer.height,true);blend(g,buffer,layer);}
 buffer.width=buffer.height=1;
}
function createPainter(canvas,live){
 const cache=new Map();let scratch=null;
 function layerCanvas(id){if(!cache.has(id))cache.set(id,canvasLike(canvas));return cache.get(id);}
 function release(){for(const c of cache.values())c.width=c.height=1;cache.clear();if(scratch)scratch.width=scratch.height=1;scratch=null;}
 function compose(layers,target=canvas,current=null){
  const g=background(target);
  for(const layer of layers){if(!layer.visible)continue;let c=cache.get(layer.id);
   if(current?.layer===layer.id){scratch=scratch||canvasLike(canvas);const b=scratch.getContext('2d');b.clearRect(0,0,scratch.width,scratch.height);if(c)b.drawImage(c,0,0);stroke(b,current,canvas.width,canvas.height,true);c=scratch;}
   if(c)blend(g,c,layer);
  }
 }
 function rebuild(strokes,paper,layers){release();canvas.width=paper?.width||800;canvas.height=paper?.height||480;live.width=canvas.width;live.height=canvas.height;
  for(const s of strokes){const c=layerCanvas(s.layer);stroke(c.getContext('2d'),s,c.width,c.height,true);}compose(layers);
 }
 function commit(s,layers){const c=layerCanvas(s.layer);stroke(c.getContext('2d'),s,c.width,c.height,true);compose(layers);}
 return {rebuild,commit,compose,preview:(s,layers)=>compose(layers,live,s),dispose:release};
}
root.WWPaint=Object.freeze({version:'0.6.0',PAPER,stroke,paint,createPainter});
})(globalThis);
