/* Ike's private kiosk. Image evidence supports a layout; only shop inventory can authorize a production dimension. */
(function (root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.IkePhotoSize = api;
})(globalThis, function () {
  'use strict';
  // Sampled grayscale landmarks on the previously tape-measured face (Measurement-record.json).
  // These small patches exclude the card, countertop and everything outside the wood.
  const landmarks = [
    {x: 147, y: 28, pattern: [
      0.07146, 0.07533, 0.0676, 0.08693, 0.10626, 0.0908, 0.10626, 0.10626, 0.10626,
      0.08693, -0.23014, 0.07533, 0.07533, 0.08306, 0.08306, 0.07146, 0.07146, 0.05986,
      -0.24947, -0.24174, -0.21081, -0.002, 0.08693, 0.07146, 0.0792, 0.0908, 0.10626,
      -0.21081, -0.23401, -0.25334, -0.24561, -0.12574, 0.0792, 0.06373, 0.07533, 0.0792,
      0.0676, 0.0676, 0.05986, 0.0212, -0.25721, -0.25721, 0.07146, 0.056, 0.05213,
      0.0096, 0.01346, -0.002, 0.01346, -0.17601, -0.23401, -0.24561, 0.01346, -0.00587,
      0.03666, 0.05213, 0.0328, 0.04826, 0.0444, -0.14121, -0.07547, 0.02893, 0.01346,
      0.02506, 0.02506, 0.04826, 0.02506, 0.02893, 0.01346, 0.02506, 0.02506, 0.0096,
      0.0444, 0.05986, 0.0444, 0.04053, 0.0328, 0.0328, 0.02893, 0.00186, 0.02891
    ]},
    {x: 22, y: 39, pattern: [
      -0.10516, -0.16019, 0.12595, -0.06114, -0.02813, -0.06114, -0.03913, -0.09416, 0.09294,
      -0.20422, -0.10516, 0.07093, -0.09416, -0.11617, 0.00489, 0.03791, -0.11617, 0.0269,
      -0.19321, -0.02813, -0.06114, -0.01712, -0.1712, -0.07215, -0.03913, -0.05014, 0.09294,
      -0.06114, -0.22623, -0.03913, -0.10516, -0.02813, 0.0159, 0.12595, 0.00489, 0.04891,
      -0.12718, -0.1712, -0.09416, -0.08315, 0.04891, 0.0159, -0.08315, -0.10516, -0.01712,
      -0.07215, -0.02813, -0.06114, -0.11617, 0.0269, -0.01712, 0.0269, -0.08315, 0.0159,
      0.08193, 0.04891, 0.0159, -0.16019, -0.01712, 0.0269, 0.05992, -0.11617, 0.20299,
      0.14796, 0.03791, 0.08193, 0.07093, 0.12595, 0.11495, 0.14796, 0.19199, 0.26903,
      0.09294, 0.20299, 0.04891, 0.03791, 0.10394, 0.07093, 0.09294, 0.24702, 0.32404
    ]},
    {x: 93, y: 22, pattern: [
      0.01136, 0.06473, 0.07807, 0.03805, 0.06473, 0.05139, 0.03805, -0.01532, 0.03805,
      0.09141, 0.10475, -0.06868, 0.02471, -0.00198, 0.05139, 0.10475, 0.30488, 0.3449,
      -0.06868, -0.042, 0.01136, -0.09537, -0.25546, -0.30883, -0.00198, 0.17146, 0.14478,
      -0.05534, 0.02471, -0.12205, -0.042, -0.09537, -0.13539, -0.2021, 0.15812, 0.13144,
      -0.05534, 0.07807, -0.18876, -0.06868, -0.13539, -0.06868, -0.13539, -0.09537, -0.042,
      -0.01532, -0.16207, -0.14873, -0.10871, -0.02866, -0.01532, -0.06868, 0.03805, -0.16207,
      0.1181, 0.13144, -0.16207, 0.1181, 0.09141, -0.16207, -0.05534, -0.00198, -0.01532,
      0.1181, 0.07807, 0.05139, -0.02866, -0.01532, -0.01532, 0.03805, 0.07807, 0.09141,
      0.03805, 0.05139, 0.09141, 0.07807, 0.07807, 0.01136, 0.02471, -0.00198, 0.01137
    ]},
    {x: 30, y: 54, pattern: [
      -0.06839, -0.02583, -0.06839, 0.00963, 0.03091, -0.01165, -0.13932, -0.07548, 0.07347,
      0.038, 0.02382, -0.02583, 0.00963, -0.09676, -0.09676, 0.05928, 0.27207, 0.0451,
      -0.09676, -0.08258, -0.0613, 0.02382, 0.038, 0.038, -0.01165, -0.01165, -0.02583,
      -0.08258, -0.0542, 0.00254, 0.10184, -0.00455, -0.14641, -0.00455, -0.01165, -0.01874,
      0.10893, -0.10386, -0.04002, -0.18897, -0.11095, -0.11095, 0.00963, 0.05219, 0.22242,
      -0.07548, 0.08056, 0.17277, 0.16568, 0.27917, 0.1444, 0.17277, 0.02382, -0.12513,
      -0.08258, -0.11095, -0.08258, -0.09676, 0.00963, -0.08967, -0.04711, -0.1606, -0.13932,
      0.15149, -0.08967, -0.08967, -0.0613, -0.17479, -0.21734, -0.07548, -0.0613, 0.12312,
      0.17986, 0.18696, 0.23661, 0.17986, 0.18696, -0.04711, 0.01673, 0.038, 0.09478
    ]}
  ];
  const referenceId = 'CW-20a94bae-17ee-4598-8279-f900f6f8c15a';
  const referenceMm = Object.freeze([598.4875, 234.95, 34.925]);
  const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);

  function matchGrain(data,w,h,box,turn) {
    function luminance(u,v) {
      const fx = [u,1-v,1-u,v][turn], fy = [v,u,1-v,1-u][turn];
      const x = Math.max(0,Math.min(w-1,Math.floor((box.x+fx*box.w)*w)));
      const y = Math.max(0,Math.min(h-1,Math.floor((box.y+fy*box.h)*h)));
      const p = (y*w+x)*4;
      return .299*data[p]+.587*data[p+1]+.114*data[p+2];
    }
    const scores = landmarks.map(({x,y,pattern})=>{
      let best = 0;
      // The crop and perspective can move a feature by several thumbnail pixels.
      for(let dy=-5;dy<=5;dy++) for(let dx=-5;dx<=5;dx++) {
        let sum=0,square=0,dot=0,i=0;
        for(let j=-4;j<=4;j++) for(let k=-4;k<=4;k++){
          const value=luminance((x+dx+k*1.5+.5)/160,(y+dy+j*1.5+.5)/64);
          sum+=value;square+=value*value;dot+=value*pattern[i++];
        }
        const variance=square-sum*sum/i;
        if(variance>i*5) best=Math.max(best,dot/Math.sqrt(variance));
      }
      return best;
    });
    return scores[0]>.78 && scores[1]>.67 && scores[2]>.65 && scores[3]>.62;
  }
  // Fit each card edge through many boundary pixels. A single bright corner pixel
  // can skew the scale noticeably when projected all the way to the end of a plank.
  function cardCorners(group, rough, w, factor=1) {
    const occupied=new Set(group);
    const boundary=group.filter(p=>[p-1,p+1,p-w,p+w].some(n=>!occupied.has(n)));
    const sides=rough.map((start,i)=>{
      const end=rough[(i+1)%4],dx=end[0]-start[0],dy=end[1]-start[1],len=Math.hypot(dx,dy);
      const nx=-dy/len,ny=dx/len;
      const points=[];
      for(const p of boundary){
        const x=p%w,y=Math.floor(p/w);
        const along=((x-start[0])*dx+(y-start[1])*dy)/(len*len);
        const across=(x-start[0])*nx+(y-start[1])*ny;
        if(along>.1&&along<.9&&Math.abs(across)<3*factor)points.push([x,y]);
      }
      if(points.length<len*.42)return null;
      const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cy=points.reduce((s,p)=>s+p[1],0)/points.length;
      let xx=0,xy=0,yy=0;
      for(const [x,y] of points){xx+=(x-cx)**2;xy+=(x-cx)*(y-cy);yy+=(y-cy)**2;}
      const angle=.5*Math.atan2(2*xy,xx-yy);
      let a=-Math.sin(angle),b=Math.cos(angle);
      if(a*nx+b*ny<0){a=-a;b=-b;}
      return {a,b,c:a*cx+b*cy-.5};
    });
    if(sides.includes(null))return null;
    const corners=[];
    for(let i=0;i<4;i++){
      const prev=sides[(i+3)%4],next=sides[i],det=prev.a*next.b-next.a*prev.b;
      if(Math.abs(det)<.7)return null;
      const point=[(prev.c*next.b-next.c*prev.b)/det,(prev.a*next.c-next.a*prev.c)/det];
      if(distance(point,rough[i])>4*factor)return null;
      corners.push(point);
    }
    return corners;
  }
  function rectangleCard(data,scene,box) {
    const {width:w,height:h,mask}=scene;
    const labels=new Uint8Array(w*h);
    for(let y=box.top;y<=box.bottom;y++) for(let x=box.left;x<=box.right;x++){
      const p=y*w+x,i=p*4;
      const low=Math.min(data[i],data[i+1],data[i+2]), high=Math.max(data[i],data[i+1],data[i+2]);
      if(!mask[p] && low>=135 && high-low<54) labels[p]=1;
    }
    const candidates=[];
    for(let p=0;p<labels.length;p++){
      if(!labels[p])continue;
      const group=[p];labels[p]=0;
      let boundary=false;
      for(let n=0;n<group.length;n++){
        const k=group[n],x=k%w,y=Math.floor(k/w);
        if(x===box.left||x===box.right||y===box.top||y===box.bottom)boundary=true;
        for(const q of [k-w,k+w,k-1,k+1]){
          if(q>=0&&q<labels.length&&labels[q]&&Math.abs(q%w-x)<=1){labels[q]=0;group.push(q);}
        }
      }
      if(boundary||group.length<250||group.length>mask.length*.25)continue;
      const corners=[null,null,null,null],best=[-Infinity,-Infinity,-Infinity,-Infinity];
      for(const k of group){
        const x=k%w,y=Math.floor(k/w),scores=[-x-y,x-y,x+y,y-x];
        scores.forEach((score,i)=>{if(score>best[i]){best[i]=score;corners[i]=[x,y];}});
      }
      const edges=corners.map((p,i)=>distance(p,corners[(i+1)%4]));
      const area=Math.abs(corners.reduce((s,p,i)=>s+p[0]*corners[(i+1)%4][1]-p[1]*corners[(i+1)%4][0],0))/2;
      if(Math.min(...edges)<20||area<900||group.length/area<.80||group.length/area>1.12)continue;
      if(Math.max(edges[0],edges[2])/Math.min(edges[0],edges[2])>1.22||Math.max(edges[1],edges[3])/Math.min(edges[1],edges[3])>1.22)continue;
      const ordered=edges[0]>=edges[1]?corners:corners.slice(1).concat([corners[0]]);
      const ratio=distance(ordered[0],ordered[1])/distance(ordered[1],ordered[2]);
      if(ratio<1.25||ratio>2.0)continue;
      const center=[0,1].map(axis=>corners.reduce((s,p)=>s+p[axis],0)/4);
      const surrounded=corners.every(([x,y])=>{
        const xx=Math.round(x+(x-center[0])*.14), yy=Math.round(y+(y-center[1])*.14);
        return xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx];
      });
      if(surrounded){
        const refined=cardCorners(group,ordered,w);
        if(refined)candidates.push(refined);
      }
    }
    return candidates.length===1?candidates[0]:null;
  }
  function alignedFace(scene) {
    let count=0,xSum=0,ySum=0,xx=0,xy=0,yy=0;
    for(let i=0;i<scene.mask.length;i++){
      if(!scene.mask[i])continue;
      const x=i%scene.width,y=Math.floor(i/scene.width);
      count++;xSum+=x;ySum+=y;xx+=x*x;xy+=x*y;yy+=y*y;
    }
    const a=xx-xSum*xSum/count,b=xy-xSum*ySum/count,d=yy-ySum*ySum/count;
    const angle=.5*Math.atan2(2*b,a-d);
    return Math.abs(Math.sin(2*angle))<.27 && Math.hypot(a-d,2*b)>(a+d)*.32;
  }
  function midline(scene,box,horizontal) {
    const {width:w,mask}=scene,points=[];
    const center=horizontal?(box.top+box.bottom)/2:(box.left+box.right)/2;
    for(let offset=-2;offset<=2;offset++){
      let first=null,last=null;
      for(let n=horizontal?box.left:box.top;n<=(horizontal?box.right:box.bottom);n++){
        const pair=horizontal?[n,Math.round(center)+offset]:[Math.round(center)+offset,n];
        if(mask[pair[1]*w+pair[0]]){first??=pair;last=pair;}
      }
      if(first&&last)points.push([first,last]);
    }
    if(points.length!==5)return null;
    points.sort((a,b)=>distance(...a)-distance(...b));
    return points[2];
  }
  function inspect(data,w,h,wood) {
    const empty={reference:null,card:null};
    // Remove warm countertop pixels before asking the fleet boundary detector for a face.
    const filtered=new Uint8ClampedArray(data);
    for(let i=0;i<filtered.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2];
      if(r-g<14||r-b<40||r-b<r*.32)filtered[i+3]=0;
    }
    const scene=wood.detectPixels(filtered,w,h);
    if(!scene)return empty;
    const c=scene.contour,box={left:Math.round(c.x*w),top:Math.round(c.y*h),right:Math.round((c.x+c.w)*w)-1,bottom:Math.round((c.y+c.h)*h)-1};
    if(Math.min(box.left,w-1-box.right,box.top,h-1-box.bottom)<Math.max(3,Math.min(w,h)*.012))return empty;
    const aspect=c.w*w/(c.h*h),elongation=Math.max(aspect,1/aspect);
    const turns=aspect>=1?[0,2]:[1,3];
    const matched=elongation>1.9&&elongation<3.2&&turns.some(t=>matchGrain(data,w,h,c,t));
    const ref=rectangleCard(data,scene,box);
    const across=midline(scene,box,true),down=midline(scene,box,false);
    const card=ref&&across&&down&&alignedFace(scene)?{reference:ref,across,down,w,h}:null;
    return {reference:matched?referenceId:null,card,region:scene.region};
  }
  function measure(candidate,type,C) {
    if(!candidate||!['index-3x5','index-4x6'].includes(type))throw Error('Select the size printed on the index card package.');
    const {reference,across,down,w,h}=candidate;
    const size=C.referenceSize(type),quad=[[0,0],[size.widthMm,0],[size.widthMm,size.heightMm],[0,size.heightMm]];
    if(![...reference,...across,...down].every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=w&&y>=0&&y<=h)||
       Math.min(...reference.map((p,i)=>distance(p,reference[(i+1)%4])))<Math.max(12,Math.max(w,h)*.025))
      throw Error('Move closer so the four card corners are clearly visible.');
    const observed=distance(reference[0],reference[1])/distance(reference[1],reference[2]);
    if(Math.abs(observed/(size.widthMm/size.heightMm)-1)>.14)throw Error('Keep the card flat and photograph the board from directly above.');
    const H=C.homography(reference,quad);
    const coverage=across.concat(down).map(([x,y])=>H[6]*x+H[7]*y+1);
    if(Math.min(...coverage)<=0||Math.max(...coverage)/Math.min(...coverage)>1.4)throw Error('Take a straighter photo with the card flat on the board.');
    const [a,b]=across.map(p=>C.project(H,p)),[c,d]=down.map(p=>C.project(H,p));
    const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]],delta=[c[0]-a[0],c[1]-a[1]];
    const cross=(p,q)=>p[0]*q[1]-p[1]*q[0];
    const area=cross(u,v),lengths=[distance(a,b),distance(c,d)];
    const intersection=[cross(delta,v)/area,cross(delta,u)/area];
    if(Math.abs(area)<.8*lengths[0]*lengths[1]||intersection.some(t=>!Number.isFinite(t)||t<.3||t>.7))
      throw Error('Mark the length through the middle and the width halfway along the board.');

    const [lengthMm,widthMm]=lengths.sort((a,b)=>b-a);
    if(!Number.isFinite(lengthMm)||!Number.isFinite(widthMm)||lengthMm>3048||widthMm<25.4)throw Error('The board edges could not be measured.');
    return {source:'photo-card',lengthMm,widthMm,referenceType:type};
  }
  async function analyze(photo,wood){
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=photo.dataUrl;});
    const k=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*k));c.height=Math.max(1,Math.round(img.naturalHeight*k));
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,c.width,c.height);
    const result=inspect(ctx.getImageData(0,0,c.width,c.height).data,c.width,c.height,wood);
    if(!result.card||k>=1)return result;
    // Refine the small reference at source resolution. Extrapolating even a one-pixel
    // corner shift from a thumbnail to both board ends can change the reading.
    const xs=img.naturalWidth/c.width,ys=img.naturalHeight/c.height;
    const ref=result.card.reference.map(([x,y])=>[(x+.5)*xs-.5,(y+.5)*ys-.5]);
    const pad=Math.ceil(4*Math.max(xs,ys));
    const left=Math.max(0,Math.floor(Math.min(...ref.map(p=>p[0])))-pad);
    const top=Math.max(0,Math.floor(Math.min(...ref.map(p=>p[1])))-pad);
    const right=Math.min(img.naturalWidth,Math.ceil(Math.max(...ref.map(p=>p[0])))+pad+1);
    const bottom=Math.min(img.naturalHeight,Math.ceil(Math.max(...ref.map(p=>p[1])))+pad+1);
    const patch=document.createElement('canvas');patch.width=right-left;patch.height=bottom-top;
    const pc=patch.getContext('2d',{willReadFrequently:true});pc.drawImage(img,-left,-top);
    const pixels=pc.getImageData(0,0,patch.width,patch.height).data,group=[];
    for(let i=0;i<pixels.length;i+=4){
      const low=Math.min(pixels[i],pixels[i+1],pixels[i+2]),high=Math.max(pixels[i],pixels[i+1],pixels[i+2]);
      if(low>=135&&high-low<54)group.push(i/4);
    }
    const refined=cardCorners(group,ref.map(([x,y])=>[x-left,y-top]),patch.width,Math.max(xs,ys));
    if(refined)result.card.reference=refined.map(([x,y])=>[(x+left+.5)/xs-.5,(y+top+.5)/ys-.5]);
    return result;
  }
  return Object.freeze({referenceId,referenceMm,analyze,inspect,measure});
});
