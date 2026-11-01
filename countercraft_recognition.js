/* Unchanged Ike recognition kernels. Regenerate with SYNC_COUNTERCRAFT_RECOGNITION.py. */
(function(g){'use strict';
  function ikeRgbToHsv(r,g,b){
    r/=255;g/=255;b/=255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let h=0;
    if(d){
      if(max===r)h=((g-b)/d)%6;
      else if(max===g)h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h*=60;if(h<0)h+=360;
    }
    return {h,s:max?d/max:0,v:max};
  }
  function ikeErodeMask(componentMask,w,h,radius=3){
    const out=new Uint8Array(componentMask.length);
    for(let y=radius;y<h-radius;y++)for(let x=radius;x<w-radius;x++){
      const i=y*w+x;if(!componentMask[i])continue;
      let safe=1;
      outer:for(let yy=y-radius;yy<=y+radius;yy+=Math.max(1,radius))for(let xx=x-radius;xx<=x+radius;xx+=Math.max(1,radius)){
        if(!componentMask[yy*w+xx]){safe=0;break outer;}
      }
      if(safe)out[i]=1;
    }
    return out;
  }
  function ikeLargestRectangle(mask,w,h){
    const heights=new Int16Array(w);let best={area:0,x:0,y:0,w:0,h:0};
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++)heights[x]=mask[y*w+x]?heights[x]+1:0;
      const stack=[];
      for(let x=0;x<=w;x++){
        const cur=x<w?heights[x]:0;
        while(stack.length&&heights[stack[stack.length-1]]>cur){
          const top=stack.pop(),hh=heights[top],left=stack.length?stack[stack.length-1]+1:0,ww=x-left,area=hh*ww;
          if(area>best.area){best={area,x:left,y:y-hh+1,w:ww,h:hh};}
        }
        stack.push(x);
      }
    }
    return best;
  }
  function ikeAnalyzePlankPixelsProven(img){
    const scene=window.BlackFlagWoodwright?.analyzeImage(img);
    if(!scene)return null;
    const c=scene.contour,bw=c.w*scene.width,bh=c.h*scene.height;
    const orientation=bw>=bh?'Horizontal':'Vertical';
    return {contour:c,usableRegion:scene.region,fitBand:scene.region,faceGrid:[],
      obstacleDetected:true,referenceCandidate:false,axisOrientation:orientation,bboxOrientation:orientation,
      orientationResolved:Math.max(bw,bh)/Math.max(1,Math.min(bw,bh))>=1.25,
      elongation:Math.max(bw,bh)/Math.max(1,Math.min(bw,bh)),axisAngleDeg:orientation==='Horizontal'?0:90,
      confidence:'geometry-probable',requiresVisualReview:true,boundaryVersion:scene.version};
  }
  function ikeAnalyzePlankPixelsLength(img){
    const maxW=240,scale=Math.min(1,maxW/Math.max(1,img.naturalWidth||img.width));
    const w=Math.max(64,Math.round((img.naturalWidth||img.width)*scale));
    const h=Math.max(44,Math.round((img.naturalHeight||img.height)*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    const data=ctx.getImageData(0,0,w,h).data;

    // 8.1.0 PLUMB LINE: learn the scene before trying to measure the plank.
    // A single photo cannot provide survey-grade absolute scale by itself, so our
    // job is to isolate the actual plank silhouette reliably and classify only
    // against Ike's calibrated stock families. Camera distance is intentionally
    // not a confidence input.
    const border=[];
    const bx=Math.max(2,Math.round(w*.08)),by=Math.max(2,Math.round(h*.08));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      if(x<bx||x>=w-bx||y<by||y>=h-by){const i=(y*w+x)*4;border.push([data[i],data[i+1],data[i+2]]);}
    }
    function medianChannel(k){const a=border.map(v=>v[k]).sort((a,b)=>a-b);return a[(a.length/2)|0]||0;}
    const bg=[medianChannel(0),medianChannel(1),medianChannel(2)];
    const permissive=new Uint8Array(w*h),core=new Uint8Array(w*h),growable=new Uint8Array(w*h),yellow=new Uint8Array(w*h);
    let coreBgDistSum=0,coreBgDistCount=0;
    for(let i=0,p=0;i<data.length;i+=4,p++){
      const r=data[i],g=data[i+1],b=data[i+2],hsv=ikeRgbToHsv(r,g,b);
      const warmHue=hsv.h>=5&&hsv.h<=82&&r>=b*.92;
      const bgDist=Math.hypot(r-bg[0],g-bg[1],b-bg[2]);
      if(warmHue&&hsv.s>=.10&&hsv.v>=.08&&hsv.v<=.96)permissive[p]=1;
      if(warmHue&&hsv.s>=.21&&hsv.v>=.08&&hsv.v<=.94){core[p]=1;coreBgDistSum+=bgDist;coreBgDistCount++;}
      // Pale sapwood is allowed to join the silhouette only when it is visibly
      // different from the learned border/background. This avoids the old warm
      // countertop contamination while recovering the true live-edge dimensions.
      if(warmHue&&hsv.v>=.08&&hsv.v<=.97&&(hsv.s>=.13||bgDist>=34))growable[p]=1;
      if(hsv.h>=35&&hsv.h<=70&&hsv.s>=.35&&hsv.v>=.45)yellow[p]=1;
    }
    function structuralMask(source,vr){
      const out=new Uint8Array(source.length);
      for(let y=vr;y<h-vr;y++)for(let x=vr;x<w-vr;x++){
        const i=y*w+x;if(!source[i])continue;let solid=1;
        // Cross erosion rejects skinny warm bridges (arms, marble veins, clutter)
        // that previously allowed unrelated scene regions to join the plank.
        for(let d=1;d<=vr;d++){
          if(!source[(y-d)*w+x]||!source[(y+d)*w+x]||!source[y*w+(x-d)]||!source[y*w+(x+d)]){solid=0;break;}
        }
        if(solid)out[i]=1;
      }
      return out;
    }
    function components(source){
      const seen=new Uint8Array(source.length),rows=[];
      const dirs=[-1,1,-w,w,-w-1,-w+1,w-1,w+1];
      for(let i=0;i<source.length;i++){
        if(!source[i]||seen[i])continue;
        const q=[i],comp=[];seen[i]=1;
        let minX=w,minY=h,maxX=0,maxY=0,sx=0,sy=0;
        for(let qi=0;qi<q.length;qi++){
          const cur=q[qi],x=cur%w,y=(cur/w)|0;comp.push(cur);sx+=x;sy+=y;
          minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
          for(const d of dirs){const n=cur+d;if(n<0||n>=source.length||seen[n]||!source[n])continue;const nx=n%w,ny=(n/w)|0;if(Math.abs(nx-x)>1||Math.abs(ny-y)>1)continue;seen[n]=1;q.push(n);}
        }
        const bw=Math.max(1,maxX-minX+1),bh=Math.max(1,maxY-minY+1),cx=sx/Math.max(1,comp.length),cy=sy/Math.max(1,comp.length);
        const edgeTouch=minX<=1||minY<=1||maxX>=w-2||maxY>=h-2;
        const elong=Math.max(bw,bh)/Math.max(1,Math.min(bw,bh));
        const centerDist=Math.hypot(cx-w/2,cy-h/2)/Math.max(w,h);
        let score=comp.length;
        score*=Math.max(.35,1-centerDist*1.35);
        if(elong>=1.55)score*=1.35; else if(elong<1.25)score*=.58;
        if(edgeTouch)score*=.20;
        rows.push({comp,minX,minY,maxX,maxY,bw,bh,cx,cy,edgeTouch,elong,score});
      }
      return rows.sort((a,b)=>b.score-a.score);
    }
    let mode='saturated-core',picked=components(structuralMask(core,2))[0]||null;
    if(!picked||picked.comp.length<Math.max(110,w*h*.010)||picked.elong<1.30){
      mode='permissive-fallback';picked=components(structuralMask(permissive,3))[0]||null;
    }
    if(!picked||picked.comp.length<Math.max(110,w*h*.010))return null;

    // Guided silhouette growth: start from the trusted core, then admit neighboring
    // sapwood only inside a bounded envelope. The growth cannot jump across the
    // scene into the countertop or side clutter.
    const seed=new Uint8Array(w*h);picked.comp.forEach(i=>seed[i]=1);
    const envPadX=Math.max(3,Math.round(picked.bw*.16)),envPadY=Math.max(3,Math.round(picked.bh*.22));
    const ex0=Math.max(0,picked.minX-envPadX),ex1=Math.min(w-1,picked.maxX+envPadX),ey0=Math.max(0,picked.minY-envPadY),ey1=Math.min(h-1,picked.maxY+envPadY);
    const grown=new Uint8Array(w*h),queue=picked.comp.slice();picked.comp.forEach(i=>grown[i]=1);
    const dirs=[-1,1,-w,w,-w-1,-w+1,w-1,w+1];
    for(let qi=0;qi<queue.length;qi++){
      const cur=queue[qi],x=cur%w,y=(cur/w)|0;
      for(const d of dirs){
        const n=cur+d;if(n<0||n>=grown.length||grown[n]||!growable[n])continue;
        const nx=n%w,ny=(n/w)|0;if(Math.abs(nx-x)>1||Math.abs(ny-y)>1||nx<ex0||nx>ex1||ny<ey0||ny>ey1)continue;
        grown[n]=1;queue.push(n);
      }
    }
    const grownRows=components(grown),g=grownRows.find(r=>r.comp.some(i=>seed[i]))||grownRows[0]||picked;
    const rawCoreRatio=Math.max(picked.bw,picked.bh)/Math.max(1,Math.min(picked.bw,picked.bh));
    const grownRatio=Math.max(g.bw,g.bh)/Math.max(1,Math.min(g.bw,g.bh));
    const shapeStability=Math.max(0,1-Math.abs(grownRatio-rawCoreRatio)/Math.max(.5,rawCoreRatio));
    const backgroundSeparation=coreBgDistCount?coreBgDistSum/coreBgDistCount:0;

    const padX=Math.max(1,Math.round(g.bw*.018)),padY=Math.max(1,Math.round(g.bh*.035));
    const minX=Math.max(0,g.minX-padX),maxX=Math.min(w-1,g.maxX+padX);
    const minY=Math.max(0,g.minY-padY),maxY=Math.min(h-1,g.maxY+padY);
    const bw=Math.max(1,maxX-minX+1),bh=Math.max(1,maxY-minY+1);
    const coreFill=g.comp.length/Math.max(1,g.bw*g.bh);
    const cm=new Uint8Array(w*h);g.comp.forEach(i=>{cm[i]=1;});
    const eroded=ikeErodeMask(cm,w,h,Math.max(2,Math.round(Math.min(g.bw,g.bh)*.04)));
    let rect=ikeLargestRectangle(eroded,w,h);
    if(rect.area<Math.max(60,g.bw*g.bh*.06)){
      const insetX=Math.round(g.bw*.12),insetY=Math.round(g.bh*.16);
      rect={x:g.minX+insetX,y:g.minY+insetY,w:Math.max(1,g.bw-insetX*2),h:Math.max(1,g.bh-insetY*2),area:1};
    }
    const obstacleDetected=coreFill<.70;
    let yellowCount=0,yellowMinX=w,yellowMaxX=0,yellowMinY=h,yellowMaxY=0;
    for(let i=0;i<yellow.length;i++)if(yellow[i]){yellowCount++;const x=i%w,y=(i/w)|0;yellowMinX=Math.min(yellowMinX,x);yellowMaxX=Math.max(yellowMaxX,x);yellowMinY=Math.min(yellowMinY,y);yellowMaxY=Math.max(yellowMaxY,y);}
    const referenceCandidate=yellowCount>w*h*.003&&(yellowMaxX-yellowMinX)>w*.25&&(yellowMaxY-yellowMinY)<h*.28;

    let mx=0,my=0;for(const i of g.comp){mx+=i%w;my+=(i/w)|0;}mx/=Math.max(1,g.comp.length);my/=Math.max(1,g.comp.length);
    let xx=0,yy=0,xy=0;for(const i of g.comp){const dx=(i%w)-mx,dy=((i/w)|0)-my;xx+=dx*dx;yy+=dy*dy;xy+=dx*dy;}
    xx/=Math.max(1,g.comp.length);yy/=Math.max(1,g.comp.length);xy/=Math.max(1,g.comp.length);
    const trace=xx+yy,disc=Math.sqrt(Math.max(0,(xx-yy)*(xx-yy)+4*xy*xy));
    const l1=Math.max(.0001,(trace+disc)/2),l2=Math.max(.0001,(trace-disc)/2);
    const angle=.5*Math.atan2(2*xy,xx-yy),elongation=Math.sqrt(l1/l2);
    const axisOrientation=Math.abs(Math.cos(angle))>=Math.abs(Math.sin(angle))?'Horizontal':'Vertical';
    const bboxOrientation=bw>=bh?'Horizontal':'Vertical';
    const orientationResolved=elongation>=1.42 && (axisOrientation===bboxOrientation || Math.max(bw,bh)/Math.max(1,Math.min(bw,bh))>=1.72);
    return {
      contour:{x:minX/w,y:minY/h,w:bw/w,h:bh/h,fill:Number(coreFill.toFixed(3))},
      usableRegion:{x:rect.x/w,y:rect.y/h,w:rect.w/w,h:rect.h/h,source:'plumb-line-grown-silhouette-safe-rectangle'},
      obstacleDetected,referenceCandidate,
      axisOrientation,bboxOrientation,orientationResolved,
      axisAngleDeg:Number((angle*180/Math.PI).toFixed(1)),elongation:Number(elongation.toFixed(2)),
      segmentationMode:mode==='saturated-core'?'background-aware-core-growth':mode,
      coreSaturationGate:.21,rawCoreRatio:Number(rawCoreRatio.toFixed(2)),grownSilhouetteRatio:Number(grownRatio.toFixed(2)),
      shapeStability:Number(shapeStability.toFixed(2)),backgroundSeparation:Number(backgroundSeparation.toFixed(1)),
      backgroundRgb:bg.map(v=>Math.round(v)),growthEnvelope:{x:ex0/w,y:ey0/h,w:(ex1-ex0+1)/w,h:(ey1-ey0+1)/h},
      coreBounds:{x:picked.minX/w,y:picked.minY/h,w:picked.bw/w,h:picked.bh/h},
      confidence:(mode==='saturated-core'&&g.comp.length>w*h*.03&&g.elong>=1.42&&shapeStability>=.55)?'geometry-clear':'geometry-probable'
    };
  }
  function ikeVisualSpeciesEvidence(img,analysis){
    // 8.0.7 Rangefinder: confidence is evidence-weighted, not merely threshold-lowered.
    // Distinctive species may clear from one strong photo when several independent
    // visual clues agree. Ambiguous families (especially oak) still require an
    // exact rack-species confirmation before pricing.
    try{
      const c=document.createElement('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});
      const iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;
      const contour=analysis?.contour;
      let sx=0,sy=0,sw=iw,sh=ih;
      if(contour){
        const inset=.015;
        sx=Math.max(0,(contour.x+contour.w*inset)*iw);sy=Math.max(0,(contour.y+contour.h*inset)*ih);
        sw=Math.max(1,contour.w*(1-inset*2)*iw);sh=Math.max(1,contour.h*(1-inset*2)*ih);
      }
      const w=160,h=Math.max(72,Math.round(160*sh/sw));
      c.width=w;c.height=h;ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
      const d=ctx.getImageData(0,0,w,h).data;
      let n=0,rs=0,gs=0,bs=0,dark=0,light=0,warm=0,texture=0,prevLum=null;
      let cn=0,cr=0,cg=0,cb=0,cwarm=0,clight=0;
      let en=0,er=0,eg=0,eb=0,elight=0,ewarm=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x+=2){
        const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2],sum=r+g+b;if(sum<90||sum>735)continue;
        const hsv=ikeRgbToHsv(r,g,b),lum=sum/3;
        // Keep cream sapwood and colored heartwood while rejecting most white
        // countertop/background pixels that can fall inside an irregular bbox.
        const woodLike=(hsv.h>=5&&hsv.h<=78&&hsv.s>=.075&&hsv.v>=.12&&hsv.v<=.94);
        if(!woodLike)continue;
        n++;rs+=r;gs+=g;bs+=b;
        if(lum<92)dark++;if(lum>164)light++;if(r>g*1.10&&g>b*1.03)warm++;
        if(prevLum!==null)texture+=Math.abs(lum-prevLum);prevLum=lum;
        const nx=x/w,ny=y/h,edge=(nx<.19||nx>.81||ny<.17||ny>.83);
        const center=(nx>.20&&nx<.80&&ny>.18&&ny<.82);
        if(center){cn++;cr+=r;cg+=g;cb+=b;if(r>g*1.10&&g>b*1.03)cwarm++;if(lum>164)clight++;}
        if(edge){en++;er+=r;eg+=g;eb+=b;if(lum>164)elight++;if(r>g*1.08&&g>b*1.02)ewarm++;}
      }
      if(n<120)return {family:'unknown',candidateId:'',candidateName:'Wood species',score:.20,reason:'insufficient-visual-evidence',diagnostics:{sampleCount:n}};
      const ar=rs/n,ag=gs/n,ab=bs/n,lum=(ar+ag+ab)/3,warmRatio=warm/n,darkRatio=dark/n,lightRatio=light/n,tex=Math.min(1,texture/Math.max(1,n)/34);
      const centerLum=cn?((cr+cg+cb)/cn/3):lum,edgeLum=en?((er+eg+eb)/en/3):lum;
      const centerWarm=cn?cwarm/cn:warmRatio,edgeLight=en?elight/en:lightRatio;
      const heartSapContrast=edgeLum-centerLum;
      const redHeart=cn?((cr/cn)-(cg/cn)):ar-ag;
      const quality=Math.max(.35,Math.min(1,(n/(w*h*.35))*(analysis?.confidence==='geometry-clear'?1:.9)));
      const diagnostics={sampleCount:n,quality:Number(quality.toFixed(2)),warmRatio:Number(warmRatio.toFixed(2)),centerWarm:Number(centerWarm.toFixed(2)),edgeLight:Number(edgeLight.toFixed(2)),heartSapContrast:Number(heartSapContrast.toFixed(1)),redHeart:Number(redHeart.toFixed(1)),texture:Number(tex.toFixed(2))};

      // 8.0.7 Rangefinder: score positive evidence and contradictions separately.
      // A dark patch alone can no longer make Walnut win when cedar's diagnostic
      // heartwood/sapwood pattern is present.
      const cedarSignals=[centerWarm>=.38,redHeart>=13,edgeLight>=.18,heartSapContrast>=14,tex>=.13].filter(Boolean).length;
      let cedarScore=.30 + cedarSignals*.115;
      if(centerWarm>=.48)cedarScore+=.05;if(redHeart>=20)cedarScore+=.05;if(heartSapContrast>=22)cedarScore+=.05;
      cedarScore=Math.max(.15,Math.min(.98,cedarScore*quality + .08));
      const cedarContradiction=(centerWarm<.24&&redHeart<8&&heartSapContrast<8);

      let walnutScore=.30 + Math.min(.28,darkRatio*.48) + Math.min(.12,tex*.12);
      if(lum<98)walnutScore+=.10;
      // Walnut should not beat a cream-sapwood/red-heart pattern.
      if(edgeLight>=.18)walnutScore-=.12;if(heartSapContrast>=14)walnutScore-=.14;if(redHeart>=13)walnutScore-=.12;if(centerWarm>=.38)walnutScore-=.08;
      walnutScore=Math.max(.10,Math.min(.93,walnutScore*quality + .06));
      const walnutPlausible=edgeLight<.18&&heartSapContrast<14&&redHeart<13;
      diagnostics.cedarSignals=cedarSignals;diagnostics.cedarScore=Number(cedarScore.toFixed(2));diagnostics.walnutScore=Number(walnutScore.toFixed(2));

      if(!cedarContradiction&&cedarSignals>=4&&cedarScore>=.84&&cedarScore-walnutScore>=.12){
        return {family:'cedar',candidateId:'cedar',candidateName:'Cedar',score:Number(cedarScore.toFixed(2)),runnerUpScore:Number(walnutScore.toFixed(2)),margin:Number((cedarScore-walnutScore).toFixed(2)),reason:'diagnostic-heartwood-sapwood-cedar-pattern',distinctiveness:'high',diagnosticSignals:cedarSignals,diagnostics};
      }
      if(walnutPlausible&&walnutScore>=.84&&walnutScore-cedarScore>=.14){
        return {family:'walnut',candidateId:'walnut',candidateName:'Walnut',score:Number(walnutScore.toFixed(2)),runnerUpScore:Number(cedarScore.toFixed(2)),margin:Number((walnutScore-cedarScore).toFixed(2)),reason:'guarded-dark-hardwood-pattern',distinctiveness:'high',diagnostics};
      }
      if(warmRatio>.50&&ar>128){
        const score=Math.min(.86,.62+warmRatio*.28+tex*.06);
        return {family:'cedar',candidateId:'cedar',candidateName:'Cedar',score:Number(score.toFixed(2)),reason:'warm-reddish-pattern',distinctiveness:'medium',diagnostics};
      }
      if(lum>165&&lightRatio>.42&&Math.abs(ar-ag)<30){
        const score=Math.min(.86,.60+lightRatio*.28+Math.max(0,quality-.6)*.08);
        return {family:'pine',candidateId:'pine',candidateName:'Pine',score:Number(score.toFixed(2)),reason:'light-softwood-pattern',distinctiveness:score>=.84?'high':'medium',diagnostics};
      }
      if(ar>ag&&ag>ab&&lum>112){
        return {family:'oak',candidateId:'',candidateName:'Oak family',score:.66,reason:'oak-family-visual-pattern',distinctiveness:'family-only',diagnostics};
      }
      return {family:'unknown',candidateId:'',candidateName:'Wood species',score:.35,reason:'ambiguous-visual-pattern',distinctiveness:'low',diagnostics};
    }catch(_){return {family:'unknown',candidateId:'',candidateName:'Wood species',score:.20,reason:'analysis-unavailable',distinctiveness:'low'};}
  }
  function ikeCombineSpeciesEvidence(primary,secondary){
    const evidence=[primary,secondary].filter(Boolean);
    if(!evidence.length)return {family:'unknown',speciesId:'',speciesName:'Wood species',speciesResolved:false,speciesConfidence:'low',speciesScore:0,evidenceCount:0,needsSecondPhoto:true,candidates:[]};
    const first=evidence[0],second=evidence[1];
    if(first.family==='oak' || second?.family==='oak'){
      const oakAgreement=!second||second.family==='oak';
      return {family:'oak',speciesId:'',speciesName:'Oak family',speciesResolved:false,speciesConfidence:second&&oakAgreement?'medium':'low',speciesScore:(second&&oakAgreement)?0.74:0.60,evidenceCount:evidence.length,needsSecondPhoto:!second,candidates:['red-oak','white-oak'],reason:'oak-family-requires-exact-species-confirmation'};
    }
    // One excellent image can be enough when the species has genuinely diagnostic
    // evidence. This is deliberately not a global threshold reduction.
    if(!second&&first.candidateId&&first.score>=.88&&first.distinctiveness==='high'&&Number(first.margin??.20)>=.12){
      return {family:first.family,speciesId:first.candidateId,speciesName:first.candidateName,speciesResolved:true,speciesConfidence:'high',speciesScore:first.score,evidenceCount:1,needsSecondPhoto:false,candidates:[],reason:'one-photo-diagnostic-high-confidence'};
    }
    if(second&&first.candidateId&&first.candidateId===second.candidateId){
      const score=Math.min(.97,(first.score+second.score)/2+.10);
      return {family:first.family,speciesId:first.candidateId,speciesName:first.candidateName,speciesResolved:score>=.86,speciesConfidence:score>=.86?'high':'medium',speciesScore:Number(score.toFixed(2)),evidenceCount:2,needsSecondPhoto:false,candidates:[],reason:'two-photo-consistent'};
    }
    if(second&&first.candidateId&&second.candidateId&&first.candidateId!==second.candidateId){
      return {family:'unknown',speciesId:'',speciesName:'Wood species',speciesResolved:false,speciesConfidence:'low',speciesScore:.30,evidenceCount:2,needsSecondPhoto:false,candidates:[],reason:'two-photo-disagreement'};
    }
    if(first.candidateId){
      return {family:first.family,speciesId:first.candidateId,speciesName:first.candidateName,speciesResolved:false,speciesConfidence:first.score>=.78?'medium':'low',speciesScore:first.score,evidenceCount:evidence.length,needsSecondPhoto:!second,candidates:[first.candidateId],reason:second?'second-photo-not-confirming':'one-photo-candidate'};
    }
    return {family:'unknown',speciesId:'',speciesName:'Wood species',speciesResolved:false,speciesConfidence:'low',speciesScore:first.score||.3,evidenceCount:evidence.length,needsSecondPhoto:evidence.length<2,candidates:[],reason:'unresolved'};
  }
  function ikeLengthEvidenceFromGeometry(img,analysis){
    // 8.1.0 PLUMB LINE — background-aware silhouette classification.
    // Absolute physical length cannot be proven from unreferenced monocular pixels
    // alone. We therefore classify only against Ike's calibrated stock families,
    // require a stable isolated silhouette, and keep Ike's final visual review.
    const contour=analysis?.contour,iw=Number(img?.naturalWidth||img?.width||0),ih=Number(img?.naturalHeight||img?.height||0);
    if(!contour||!iw||!ih)return {resolved:false,confidence:'low',score:.12,feet:0,candidateFeet:0,needsSecondPhoto:true,reviewRequired:true,reason:'no-usable-silhouette'};
    const pw=Math.max(1,contour.w*iw),ph=Math.max(1,contour.h*ih);
    const longPx=Math.max(pw,ph),shortPx=Math.max(1,Math.min(pw,ph)),ratio=longPx/shortPx;
    const edgeMargin=Math.min(contour.x,contour.y,1-(contour.x+contour.w),1-(contour.y+contour.h));
    const fullyFramed=edgeMargin>.0025;
    const fill=Number(contour.fill||0),elongation=Number(analysis?.elongation||ratio);
    const orientationStable=elongation>=1.42;
    const geometryClear=analysis?.confidence==='geometry-clear';
    const shapeStability=Number(analysis?.shapeStability||0);
    const backgroundSeparation=Number(analysis?.backgroundSeparation||0);
    const growthTrusted=String(analysis?.segmentationMode||'')==='background-aware-core-growth';

    // Real-stock calibration currently exists only for the known 2 ft cedar blank.
    // 4/6 ft remain provisional until physical examples are captured. Bands are
    // classification priors, never a claim that pixels equal inches.
    const bands=[
      {feet:2,min:1.48,max:3.18,coreMin:1.62,coreMax:2.92,center:2.22,calibrated:true},
      {feet:4,min:3.05,max:5.45,coreMin:3.45,coreMax:5.05,center:4.25,calibrated:false},
      {feet:6,min:5.20,max:9.50,coreMin:5.85,coreMax:8.70,center:6.75,calibrated:false}
    ];
    const matches=bands.filter(b=>ratio>=b.min&&ratio<=b.max);
    let band=matches.length===1?matches[0]:null;
    if(!band&&matches.length>1)band=matches.slice().sort((a,b)=>Math.abs(ratio-a.center)-Math.abs(ratio-b.center))[0];
    if(!band){
      return {resolved:false,confidence:'low',score:.18,feet:0,candidateFeet:0,estimatedFeet:0,aspectRatio:Number(ratio.toFixed(2)),longPixels:Math.round(longPx),shortPixels:Math.round(shortPx),needsSecondPhoto:true,reviewRequired:true,shapeStability,backgroundSeparation,reason:'silhouette-ratio-outside-stock-bands'};
    }

    const insideCore=ratio>=band.coreMin&&ratio<=band.coreMax,overlap=matches.length>1;
    const half=Math.max(.25,(band.max-band.min)/2),centerDistance=Math.abs(ratio-band.center)/half;
    const boundaryDistance=Math.min(ratio-band.min,band.max-ratio);
    let score=.54 + Math.max(0,.18*(1-Math.min(1,centerDistance)));
    if(insideCore)score+=.11;
    if(fullyFramed)score+=.05; else score-=.16;
    if(orientationStable)score+=.05; else score-=.12;
    if(geometryClear)score+=.04;
    if(growthTrusted)score+=.05;
    if(shapeStability>=.72)score+=.06; else if(shapeStability<.50)score-=.18;
    if(backgroundSeparation>=42)score+=.03; else if(backgroundSeparation<24)score-=.08;
    if(fill>.26&&fill<.88)score+=.02;
    if(overlap)score-=.18;
    score=Math.max(.08,Math.min(.98,score));

    const calibrationCoverage=band.calibrated?'real-stock-calibrated':'provisional-needs-real-stock-example';
    const segmentationTrusted=growthTrusted&&shapeStability>=.55&&backgroundSeparation>=22;
    const high=band.feet===2&&band.calibrated&&score>=.80&&insideCore&&fullyFramed&&orientationStable&&segmentationTrusted&&!overlap&&boundaryDistance>=.10;
    const medium=score>=.62;
    return {
      resolved:high,
      confidence:high?'high-visual':(medium?'medium':'low'),
      score:Number(score.toFixed(2)),feet:high?band.feet:0,candidateFeet:band.feet,
      estimatedFeet:Number(band.feet),aspectRatio:Number(ratio.toFixed(2)),
      aspectBand:`${band.min.toFixed(2)}-${band.max.toFixed(2)}`,
      aspectCore:`${band.coreMin.toFixed(2)}-${band.coreMax.toFixed(2)}`,
      boundaryDistance:Number(boundaryDistance.toFixed(2)),calibrationCoverage,
      segmentationMode:String(analysis?.segmentationMode||''),rawCoreRatio:Number(analysis?.rawCoreRatio||0),grownSilhouetteRatio:Number(analysis?.grownSilhouetteRatio||0),
      shapeStability,backgroundSeparation,
      longPixels:Math.round(longPx),shortPixels:Math.round(shortPx),needsSecondPhoto:!high,
      reviewRequired:high,verificationPolicy:high?'ike-visual-order-review':'not-resolved',
      reason:high?'plumb-line-calibrated-silhouette-high-confidence':(medium?'plumb-line-silhouette-needs-more-evidence':'plumb-line-silhouette-not-safe-enough')
    };
  }
  function ikeCombineLengthEvidence(primary,secondary){
    if(!primary)return {resolved:false,confidence:'low',score:.1,feet:0,candidateFeet:0,needsSecondPhoto:true,reason:'no-primary-length-evidence'};
    if(primary.resolved)return {...primary,evidenceCount:1,reviewRequired:primary.reviewRequired!==false};
    if(!secondary)return {...primary,evidenceCount:1,needsSecondPhoto:true};
    const same=Number(primary.candidateFeet||0)>0&&Number(primary.candidateFeet)===Number(secondary.candidateFeet||0);
    const estimateGap=Math.abs(Number(primary.estimatedFeet||0)-Number(secondary.estimatedFeet||0));
    if(same&&estimateGap<=.55){
      const score=Math.min(.94,(Number(primary.score||0)+Number(secondary.score||0))/2+.14);
      if(score>=.76)return {resolved:true,confidence:'high-visual',score:Number(score.toFixed(2)),feet:Number(primary.candidateFeet),candidateFeet:Number(primary.candidateFeet),estimatedFeet:Number(((Number(primary.estimatedFeet||0)+Number(secondary.estimatedFeet||0))/2).toFixed(2)),aspectRatio:Number(primary.aspectRatio||0),needsSecondPhoto:false,evidenceCount:2,reviewRequired:true,verificationPolicy:'ike-visual-order-review',reason:'two-full-plank-photos-agree'};
    }
    return {resolved:false,confidence:'low',score:Math.max(.2,Math.min(Number(primary.score||0),Number(secondary.score||0))),feet:0,candidateFeet:same?Number(primary.candidateFeet):0,needsSecondPhoto:false,evidenceCount:2,reason:same?'two-photos-still-not-safe':'two-photos-disagree'};
  }
  function ikeOrientationEvidence(img,analysis){
    const iw=Number(img?.naturalWidth||img?.width||0),ih=Number(img?.naturalHeight||img?.height||0);
    const imageOrientation=iw>=ih?'Horizontal':'Vertical';
    if(!analysis)return {resolved:false,orientation:'',confidence:'low',reason:'no-plank-geometry'};
    const axis=analysis.axisOrientation||'';
    const bbox=analysis.bboxOrientation||(analysis.contour?(analysis.contour.w>=analysis.contour.h?'Horizontal':'Vertical'):'');
    const elong=Number(analysis.elongation||0);
    const contour=analysis.contour||{};
    const bodyCoverage=Number(contour.w||0)*Number(contour.h||0);
    // Strong plank geometry gets priority. If geometry disagrees with the raw image
    // frame, require extra strength rather than letting a crop or background flip it.
    const agrees=axis&&bbox&&axis===bbox;
    const strong=elong>=1.55&&bodyCoverage>=.08&&agrees;
    const veryStrong=elong>=2.05&&bodyCoverage>=.06;
    if(strong||veryStrong)return {resolved:true,orientation:axis||bbox,confidence:'high',score:Math.min(.98,.72+Math.min(.22,(elong-1.4)*.12)),reason:'plank-long-axis'};
    // A full landscape customer photo plus a landscape bbox is useful corroboration,
    // but never enough to claim the opposite orientation from the detected long axis.
    if(axis&&bbox&&axis===bbox&&bbox===imageOrientation&&elong>=1.3)return {resolved:true,orientation:axis,confidence:'medium',score:.76,reason:'axis-bbox-frame-agree'};
    return {resolved:false,orientation:'',confidence:'low',score:.35,reason:'orientation-evidence-conflict'};
  }
const api={species:ikeCombineSpeciesEvidence,length:ikeCombineLengthEvidence};
api.analyze=async function(photo){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=photo.dataUrl;});if(Math.max(img.width,img.height)/Math.max(1,Math.min(img.width,img.height))>8)return {species:null,length:null,orientation:null};const proven=ikeAnalyzePlankPixelsProven(img),length=ikeAnalyzePlankPixelsLength(img);return {species:ikeVisualSpeciesEvidence(img,proven),length:ikeLengthEvidenceFromGeometry(img,length),orientation:ikeOrientationEvidence(img,proven)};};
g.CountercraftRecognition=Object.freeze(api);
})(globalThis);
