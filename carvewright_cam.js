/* Carvewright First Cut: bounded 2.5D recessed-letter pocket CAM. All units mm.
 * Uses bundled, unmodified Clipper 6.4.2.2; see CARVEWRIGHT_CLIPPER_LICENSE.txt.
 * contours = [{points:[{x,y}],hole:boolean}] in machine XY, Y-up, without a
 * duplicate closing point. These are artwork boundaries, not cutter paths.
 * flattenPath returns matrix-applied closed polygon rings; flattenGlyphs flips
 * SVG Y to machine Y; pocketPolygons accepts machine-XY nonzero-fill rings.
 */
(function(root,factory){'use strict';var node=typeof module==='object'&&module.exports;
 var api=factory(node?require('./carvewright_clipper.js'):root.ClipperLib,node?require('./carvewright_core.js'):root.CarvewrightCore);
 if(node)module.exports=api;if(root)root.CarvewrightCAM=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Clipper,core){
 'use strict';
 var SCALE=10000,MAX_POINTS=30000,MAX_TOKENS=100000,MAX_MOVES=200000,MAX_OFFSETS=1000,MAX_PASSES=100;
 var PROFILES=['shopbot-inch','shopbot-mm','grbl-mm','grbl-inch','linuxcnc-mm','linuxcnc-inch'];
 var BAD=['__proto__','constructor','prototype'];
 function fail(message){throw new Error(message);}
 function plain(o){return o&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);}
 function finite(n){return typeof n==='number'&&Number.isFinite(n);}
 function copy(o){return JSON.parse(JSON.stringify(o));}
 function dataTree(o,depth,state){
  state=state||{n:0};depth=depth||0;if(++state.n>250000||depth>24)fail('Input data is too large or deeply nested.');
  if(o===null||typeof o==='string'||typeof o==='boolean'||finite(o))return;
  if(!plain(o)&&!Array.isArray(o))fail('Input must contain plain finite JSON data.');
  Reflect.ownKeys(o).forEach(function(k){if(Array.isArray(o)&&k==='length')return;if(typeof k!=='string'||BAD.indexOf(k)!==-1)fail('Unsafe input key.');var d=Object.getOwnPropertyDescriptor(o,k);if(!d||!d.enumerable||!Object.prototype.hasOwnProperty.call(d,'value'))fail('Input accessors are not supported.');dataTree(d.value,depth+1,state);});
 }
 function fields(o,names,label,errors){if(!plain(o)){errors.push(label+' must be an object.');return false;}Object.keys(o).forEach(function(k){if(names.indexOf(k)===-1)errors.push('Unknown '+label+' field: '+k);});names.forEach(function(k){if(!Object.prototype.hasOwnProperty.call(o,k))errors.push('Missing '+label+' field: '+k);});return true;}
 function range(n,lo,hi){return finite(n)&&n>=lo&&n<=hi;}
 function text(s,max,empty){return typeof s==='string'&&s.length<=(max||120)&&(empty||s.trim().length>0)&&!/[\u0000-\u001f\u007f]/.test(s);}
 function defaults(design){
  dataTree(design);if(!design||!design.stock)fail('Open a design before setting up machining.');
  return {schema:'carvewright-machining-setup-v1',operation:'pocket',stock:{widthMm:design.stock.widthMm,heightMm:design.stock.heightMm,thicknessMm:design.stock.thicknessMm},tool:{type:'flat-endmill',diameterMm:3.175,cuttingLengthMm:12.7,centerCutting:true,label:'1/8 inch flat end mill',partNumber:''},cut:{depthMm:1.5,stepDownMm:.75,stepOverPercent:40,feedMmMin:600,plungeMmMin:150,spindleRpm:12000,clearanceMm:6,toleranceMm:.02},origin:{xy:'lower-left',z:'stock-top'},machine:{postId:'shopbot-inch',label:'ShopBot — verify installed controller',spindleMode:'manual'}};
 }
 function validateSetup(design,s){
  var errors=[];try{dataTree(s);if(design)dataTree(design);}catch(e){return {ok:false,errors:[e.message]};}
  if(!fields(s,['schema','operation','stock','tool','cut','origin','machine'],'machining setup',errors))return {ok:false,errors:errors};
  if(s.schema!=='carvewright-machining-setup-v1')errors.push('Unsupported machining setup schema.');
  if(s.operation!=='pocket')errors.push('This version supports fixed-depth recessed-letter pockets only.');
  if(fields(s.stock,['widthMm','heightMm','thicknessMm'],'stock',errors)){
   if(!range(s.stock.widthMm,25.4,3048)||!range(s.stock.heightMm,25.4,3048))errors.push('Stock width and height must be 25.4–3048 mm.');
   if(!range(s.stock.thicknessMm,1,150))errors.push('Measured stock thickness must be 1–150 mm.');
   if(design&&(!design.stock||Math.abs(s.stock.widthMm-design.stock.widthMm)>1e-6||Math.abs(s.stock.heightMm-design.stock.heightMm)>1e-6))errors.push('Machining stock width and height must match the saved design.');
  }
  if(fields(s.tool,['type','diameterMm','cuttingLengthMm','centerCutting','label','partNumber'],'tool',errors)){
   if(s.tool.type!=='flat-endmill'||s.tool.centerCutting!==true)errors.push('Choose a center-cutting flat end mill for pocketing.');
   if(!range(s.tool.diameterMm,.1,100))errors.push('Tool diameter must be 0.1–100 mm.');
   if(!range(s.tool.cuttingLengthMm,.1,150))errors.push('Tool cutting length must be 0.1–150 mm.');
   if(!text(s.tool.label,120,true)||!text(s.tool.partNumber,120,true))errors.push('Tool label and part number must be plain text of at most 120 characters.');
  }
  if(fields(s.cut,['depthMm','stepDownMm','stepOverPercent','feedMmMin','plungeMmMin','spindleRpm','clearanceMm','toleranceMm'],'cut',errors)){
   var c=s.cut;
   if(!range(c.depthMm,.01,149)||!s.stock||!(c.depthMm<s.stock.thicknessMm)||!s.tool||!(c.depthMm<=s.tool.cuttingLengthMm))errors.push('Cut depth must be positive, less than measured stock thickness, and within the tool cutting length.');
   if(!range(c.stepDownMm,.01,149)||!(c.stepDownMm<=c.depthMm))errors.push('Step-down must be at least 0.01 mm and no greater than cut depth.');
   if(finite(c.depthMm)&&finite(c.stepDownMm)&&Math.ceil(c.depthMm/c.stepDownMm)>MAX_PASSES)errors.push('This setup exceeds the 100 depth-pass limit; increase step-down or reduce depth.');
   if(!range(c.stepOverPercent,10,50))errors.push('Stepover must be 10–50 percent of the tool diameter.');
   if(!range(c.feedMmMin,1,30000)||!range(c.plungeMmMin,1,5000)||c.plungeMmMin>c.feedMmMin)errors.push('Feed must be 1–30000 mm/min; plunge must be 1–5000 mm/min and no faster than feed.');
   if(!range(c.spindleRpm,100,50000))errors.push('Spindle setting must be 100–50000 RPM.');
   if(!range(c.clearanceMm,.1,150))errors.push('Clearance above stock must be 0.1–150 mm.');
   if(!range(c.toleranceMm,.005,.1)||!s.tool||c.toleranceMm>s.tool.diameterMm/20)errors.push('Geometry tolerance must be 0.005–0.1 mm and at most one twentieth of tool diameter.');
  }
  if(fields(s.origin,['xy','z'],'origin',errors)&&(['lower-left','center'].indexOf(s.origin.xy)===-1||s.origin.z!=='stock-top'))errors.push('Choose lower-left or center XY, with Z zero at the stock top.');
  if(fields(s.machine,['postId','label','spindleMode'],'machine',errors)){
   if(PROFILES.indexOf(s.machine.postId)===-1)errors.push('Choose a supported controller output.');
   if(!text(s.machine.label,120,false))errors.push('Enter a machine label of at most 120 characters.');
   if(['manual','controller'].indexOf(s.machine.spindleMode)===-1)errors.push('Choose manual or controller spindle control.');
   if(/^shopbot-/.test(s.machine.postId)&&s.machine.spindleMode!=='manual')errors.push('ShopBot output in this version uses manual spindle control.');
  }
  return {ok:errors.length===0,errors:errors};
 }
 function assertSetup(design,s){var v=validateSetup(design,s);if(!v.ok)fail(v.errors.join(' '));}
 function dist2(a,b){var x=a.x-b.x,y=a.y-b.y;return x*x+y*y;}
 function segmentDistance(p,a,b){var x=b.x-a.x,y=b.y-a.y,len=x*x+y*y,t=len?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/len)):0;return Math.hypot(p.x-a.x-t*x,p.y-a.y-t*y);}
 function mid(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
 function transform(x,y,m){var p={x:x*m[0]+y*m[2]+m[4],y:x*m[1]+y*m[3]+m[5]};if(!finite(p.x)||!finite(p.y)||Math.abs(p.x)>100000||Math.abs(p.y)>100000)fail('Path coordinates are nonfinite or outside supported bounds.');return p;}
 function flattenPath(d,m,tol){
  if(typeof d!=='string'||d.length>500000)fail('SVG path is too large.');
  if(!Array.isArray(m)||m.length!==6||!m.every(finite)||!range(tol,.0001,1))fail('Invalid physical path transform or tolerance.');
  var tokens=[],rx=/([A-Za-z])|([-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?)/g,match,last=0;
  while((match=rx.exec(d))){if(!/^[\s,]*$/.test(d.slice(last,match.index)))fail('Malformed SVG path data.');tokens.push(match[1]||Number(match[2]));last=rx.lastIndex;if(tokens.length>MAX_TOKENS)fail('SVG path token limit exceeded.');}
  if(!/^[\s,]*$/.test(d.slice(last))||!tokens.length)fail('Malformed or empty SVG path.');
  var i=0,cmd='',x=0,y=0,start=null,ring=null,rings=[],total=0;
  function add(p){if(!ring)fail('SVG path must begin with a move.');if(!ring.length||dist2(p,ring[ring.length-1])>1e-20){ring.push(p);if(++total>MAX_POINTS)fail('Flattened path point limit exceeded.');}}
  function number(){var n=tokens[i++];if(!finite(n))fail('SVG path is missing a finite coordinate.');return n;}
  function quad(a,b,c,n){if(segmentDistance(b,a,c)<=tol){add(c);return;}if(n>=20)fail('Curve subdivision limit exceeded.');var ab=mid(a,b),bc=mid(b,c),q=mid(ab,bc);quad(a,ab,q,n+1);quad(q,bc,c,n+1);}
  function cubic(a,b,c,e,n){if(Math.max(segmentDistance(b,a,e),segmentDistance(c,a,e))<=tol){add(e);return;}if(n>=20)fail('Curve subdivision limit exceeded.');var ab=mid(a,b),bc=mid(b,c),ce=mid(c,e),q=mid(ab,bc),r=mid(bc,ce),s=mid(q,r);cubic(a,ab,q,s,n+1);cubic(s,r,ce,e,n+1);}
  while(i<tokens.length){
   if(typeof tokens[i]==='string')cmd=tokens[i++];else if(!cmd)fail('SVG path command is missing.');
   var upper=cmd.toUpperCase(),relative=cmd!==upper,ox=relative?x:0,oy=relative?y:0,a=transform(x,y,m),nx,ny;
   if(upper==='M'){
    if(ring)fail('Every SVG contour must close before another starts.');x=number()+ox;y=number()+oy;start={x:x,y:y};ring=[];add(transform(x,y,m));cmd=relative?'l':'L';
   }else if(upper==='L'){nx=number()+ox;ny=number()+oy;add(transform(nx,ny,m));x=nx;y=ny;
   }else if(upper==='H'){x=number()+ox;add(transform(x,y,m));
   }else if(upper==='V'){y=number()+oy;add(transform(x,y,m));
   }else if(upper==='Q'){var qx=number()+ox,qy=number()+oy;nx=number()+ox;ny=number()+oy;quad(a,transform(qx,qy,m),transform(nx,ny,m),0);x=nx;y=ny;
   }else if(upper==='C'){var x1=number()+ox,y1=number()+oy,x2=number()+ox,y2=number()+oy;nx=number()+ox;ny=number()+oy;cubic(a,transform(x1,y1,m),transform(x2,y2,m),transform(nx,ny,m),0);x=nx;y=ny;
   }else if(upper==='Z'){
    if(!ring||!start)fail('Unexpected SVG close command.');if(ring.length>1&&dist2(ring[0],ring[ring.length-1])<1e-20)ring.pop();if(ring.length<3)fail('SVG contour has fewer than three distinct vertices.');rings.push(ring);ring=null;x=start.x;y=start.y;start=null;cmd='';
   }else fail('Unsupported SVG path command: '+cmd+'. Only closed M/L/H/V/Q/C/Z outlines are supported.');
  }
  if(ring)fail('Open SVG contours cannot be pocketed.');return rings;
 }
 function flattenGlyphs(glyphs,options){
  dataTree(glyphs);dataTree(options);if(!Array.isArray(glyphs)||glyphs.length<1||glyphs.length>240)fail('Use 1–240 visible glyphs for machining.');
  if(!options||!range(options.widthMm,25.4,3048)||!range(options.heightMm,25.4,3048)||['lower-left','center'].indexOf(options.origin)===-1)fail('Invalid stock or machine origin.');
  var polygons=[],count=0,dx=options.origin==='center'?options.widthMm/2:0,dy=options.origin==='center'?options.heightMm/2:0;
  glyphs.forEach(function(g){if(!g||typeof g.d!=='string')fail('Invalid glyph outline.');flattenPath(g.d,g.matrix,options.toleranceMm).forEach(function(r){count+=r.length;if(count>MAX_POINTS)fail('The design exceeds the 30000 flattened-vertex limit.');polygons.push(r.map(function(p){return {x:p.x-dx,y:options.heightMm-p.y-dy};}));});});
  if(polygons.length>1000)fail('The design contains too many disconnected contours.');return polygons;
 }
 function toInt(polygons){
  if(!Array.isArray(polygons)||!polygons.length||polygons.length>1000)fail('Empty or excessive polygon input.');var total=0;
  return polygons.map(function(r){if(!Array.isArray(r)||r.length<3)fail('Pocket contours need at least three vertices.');var out=[];
   r.forEach(function(p){if(!plain(p)||!finite(p.x)||!finite(p.y)||Math.abs(p.x)>3048.001||Math.abs(p.y)>3048.001)fail('Polygon contains nonfinite or out-of-bounds coordinates.');var q={X:Math.round(p.x*SCALE),Y:Math.round(p.y*SCALE)};if(!out.length||q.X!==out[out.length-1].X||q.Y!==out[out.length-1].Y)out.push(q);if(++total>MAX_POINTS)fail('Polygon vertex limit exceeded.');});
   if(out.length>1&&out[0].X===out[out.length-1].X&&out[0].Y===out[out.length-1].Y)out.pop();if(out.length<3||Math.abs(Clipper.Clipper.Area(out))<1)fail('Pocket contour is degenerate.');return out;
  });
 }
 function union(paths,tree){var cl=new Clipper.Clipper();cl.StrictlySimple=true;cl.AddPaths(paths,Clipper.PolyType.ptSubject,true);var result=tree?new Clipper.PolyTree():[];if(!cl.Execute(Clipper.ClipType.ctUnion,result,Clipper.PolyFillType.pftNonZero,Clipper.PolyFillType.pftNonZero))fail('Unable to normalize the lettering outlines.');return result;}
 // Neutral artwork normalization deliberately has no cutter or motion setup.
 // Keep pocketPolygons/build untouched so legacy motion and post bytes remain
 // identical. The same nonzero fill rule/grid removes overlaps and keeps holes.
 function normalizeContours(polygons){
  if(!Clipper||!Clipper.Clipper)fail('The bundled geometry engine is unavailable.');dataTree(polygons);
  var normal=Clipper.Clipper.PolyTreeToPaths(union(toInt(polygons),true)),count=0;
  if(!normal.length)fail('The artwork contains no filled area.');
  if(normal.length>1000)fail('Normalized artwork exceeds the 1000 contour limit.');
  return normal.map(function(r){
   if(r.length<3||Math.abs(Clipper.Clipper.Area(r))<1)fail('Normalized artwork contour is degenerate.');
   count+=r.length;if(count>MAX_POINTS)fail('Normalized artwork exceeds the 30000 vertex limit.');
   return {points:r.map(function(p){return {x:p.X/SCALE,y:p.Y/SCALE};}),hole:!Clipper.Clipper.Orientation(r)};
  });
 }
 function offset(paths,distance,tol){var co=new Clipper.ClipperOffset(2,tol*SCALE),out=[];co.AddPaths(paths,Clipper.JoinType.jtRound,Clipper.EndType.etClosedPolygon);co.Execute(out,distance*SCALE);return out;}
 function area(paths){return Math.abs(paths.reduce(function(a,p){return a+Clipper.Clipper.Area(p);},0))/(SCALE*SCALE);}
 function stockBounds(s){var c=s.origin.xy==='center';return {minX:c?-s.stock.widthMm/2:0,maxX:c?s.stock.widthMm/2:s.stock.widthMm,minY:c?-s.stock.heightMm/2:0,maxY:c?s.stock.heightMm/2:s.stock.heightMm};}
 function exceedsOffsetReach(group,distance){
  // A real interior disk proves that this component survives beyond the offset
  // cap. A bounding box alone cannot prove this for thin or concave lettering.
  var outer=group[0],loX=Infinity,hiX=-Infinity,loY=Infinity,hiY=-Infinity;
  outer.forEach(function(p){loX=Math.min(loX,p.X);hiX=Math.max(hiX,p.X);loY=Math.min(loY,p.Y);hiY=Math.max(hiY,p.Y);});
  var center={X:Math.floor((loX+hiX)/2),Y:Math.floor((loY+hiY)/2)},limit=distance*SCALE;
  if(Clipper.Clipper.PointInPolygon(center,outer)!==1)return false;
  for(var h=1;h<group.length;h++)if(Clipper.Clipper.PointInPolygon(center,group[h])!==0)return false;
  for(var r=0;r<group.length;r++)for(var i=0;i<group[r].length;i++){
   var a=group[r][i],b=group[r][(i+1)%group[r].length],dx=b.X-a.X,dy=b.Y-a.Y,length=dx*dx+dy*dy;
   var t=length?Math.max(0,Math.min(1,((center.X-a.X)*dx+(center.Y-a.Y)*dy)/length)):0;
   var x=center.X-a.X-t*dx,y=center.Y-a.Y-t*dy;if(x*x+y*y<=limit*limit)return false;
  }
  return true;
 }
 function pocketPolygons(polygons,s){
  assertSetup(null,s);if(!Clipper||!Clipper.ClipperOffset)fail('The bundled geometry engine is unavailable.');dataTree(polygons);
  var input=toInt(polygons),tree=union(input,true),normal=Clipper.Clipper.PolyTreeToPaths(tree),bounds=stockBounds(s),c=s.cut;
  if(!normal.length)fail('The artwork contains no filled area to pocket.');
  normal.forEach(function(r){r.forEach(function(p){var x=p.X/SCALE,y=p.Y/SCALE;if(x<bounds.minX-1e-6||x>bounds.maxX+1e-6||y<bounds.minY-1e-6||y>bounds.maxY+1e-6)fail('Artwork extends outside the machining stock bounds.');});});
  var radius=s.tool.diameterMm/2,guard=c.toleranceMm*3+2/SCALE,effective=radius+guard,step=s.tool.diameterMm*c.stepOverPercent/100,passes=Math.ceil(c.depthMm/c.stepDownMm);
  var node=tree.GetFirst();while(node){if(!node.IsHole()){
    var group=[node.Contour()];node.Childs().forEach(function(child){if(child.IsHole())group.push(child.Contour());});
    if(exceedsOffsetReach(group,effective+MAX_OFFSETS*step+2*c.toleranceMm))fail('Pocket offset iteration limit exceeded. Increase tool size or stepover.');
    if(!offset(group,-effective,c.toleranceMm).length)fail('The selected tool is too large for a disconnected artwork component. Choose a smaller tool or larger lettering.');
   }node=node.GetNext();}
  var first=offset(normal,-effective,c.toleranceMm),paths=[],storedVertices=0,done=false;
  for(var level=0;level<MAX_OFFSETS;level++){
   var rings=level===0?first:offset(normal,-(effective+level*step),c.toleranceMm);
   if(!rings.length){done=true;break;}
   rings.forEach(function(r){if(r.length>=3){
    if(paths.length>=10000)fail('Pocket path limit exceeded. Increase tool size or stepover.');
    // Every ring needs its vertices plus XY positioning, plunge and retract per
    // depth pass. Bound retained geometry before collecting the next offset.
    storedVertices+=r.length;
    if((storedVertices+3*(paths.length+1))*passes>MAX_MOVES)fail('Projected toolpath move limit exceeded. Increase tool size or stepover, or reduce complexity or depth passes.');
    paths.push(r);
   }});
  }
  if(!done)fail('Pocket offset iteration limit exceeded. Increase tool size or stepover.');
  if(!paths.length)fail('The selected tool cannot enter this artwork.');
  var approximateReach=offset(first,radius,c.toleranceMm),sourceArea=area(normal),reachableArea=area(approximateReach),residual=Math.max(0,sourceArea-reachableArea);
  var warnings=['Fixed-depth pocketing with a center-cutting flat end mill; internal corners are limited by the tool radius.','Toolpath preview shows cutter travel, not material-removal simulation.'];
  if(residual>.01)warnings.push('About '+residual.toFixed(2)+' mm² of sharp or narrow detail may remain with this tool; inspect the preview and use a smaller cutter where needed.');
  var moves=[],cutLength=0,rapidLength=0,minutes=0,current=null;
  var actual={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};
  function emit(kind,x,y,z,feed){
   if(moves.length>=MAX_MOVES)fail('Toolpath move limit exceeded. Reduce complexity or depth passes.');
   if(![x,y,z,feed].every(finite))fail('Nonfinite tool movement rejected.');
   var m={kind:kind,x:x,y:y,z:z,feedMmMin:feed};
   if(current){var length=Math.hypot(x-current.x,y-current.y,z-current.z);if(length<1e-12&&kind===current.kind)return;if(kind==='cut'){cutLength+=length;minutes+=length/feed;}else rapidLength+=length;
    if(kind==='rapid'&&(x!==current.x||y!==current.y)&&(current.z!==c.clearanceMm||z!==c.clearanceMm))fail('Internal error: rapid travel below clearance.');
    if(kind==='cut'&&z!==current.z&&(x!==current.x||y!==current.y))fail('Internal error: simultaneous XYZ cutting is unsupported.');
   }
   moves.push(m);current=m;actual.minX=Math.min(actual.minX,x);actual.maxX=Math.max(actual.maxX,x);actual.minY=Math.min(actual.minY,y);actual.maxY=Math.max(actual.maxY,y);actual.minZ=Math.min(actual.minZ,z);actual.maxZ=Math.max(actual.maxZ,z);
  }
  for(var pass=1;pass<=passes;pass++){
   var depth=-Math.min(c.depthMm,pass*c.stepDownMm);
   paths.forEach(function(r){var start=0;if(current){var best=Infinity;for(var k=0;k<r.length;k++){var v=(r[k].X/SCALE-current.x)*(r[k].X/SCALE-current.x)+(r[k].Y/SCALE-current.y)*(r[k].Y/SCALE-current.y);if(v<best){best=v;start=k;}}}
    var p=r[start],x=p.X/SCALE,y=p.Y/SCALE;
    if(current)emit('rapid',current.x,current.y,c.clearanceMm,0);
    emit('rapid',x,y,c.clearanceMm,0);emit('cut',x,y,depth,c.plungeMmMin);
    for(var j=1;j<=r.length;j++){p=r[(start+j)%r.length];emit('cut',p.X/SCALE,p.Y/SCALE,depth,c.feedMmMin);}
    emit('rapid',current.x,current.y,c.clearanceMm,0);
   });
  }
  return {moves:moves,contours:normal.map(function(r){return {points:r.map(function(p){return {x:p.X/SCALE,y:p.Y/SCALE};}),hole:!Clipper.Clipper.Orientation(r)};}),stats:{pathCount:paths.length,passCount:passes,moveCount:moves.length,cutLengthMm:cutLength,rapidLengthMm:rapidLength,estimatedMinutes:minutes,bounds:actual,residualAreaMm2:residual,sourceAreaMm2:sourceArea,toleranceGuardMm:guard},warnings:warnings.concat(['Time estimate includes programmed cutting and plunging only; rapid travel, acceleration and setup are additional.'])};
 }
 function build(design,fonts,setup){
  if(!core||!core.layout)fail('The Carvewright artwork engine is unavailable.');dataTree(design);dataTree(fonts);assertSetup(design,setup);
  var l=core.layout(design,fonts);if(!l.ok||l.blank)fail((l.errors||[]).join(' ')||'Enter supported lettering before generating a toolpath.');
  var polygons=flattenGlyphs(l.glyphs,{widthMm:setup.stock.widthMm,heightMm:setup.stock.heightMm,origin:setup.origin.xy,toleranceMm:setup.cut.toleranceMm});
  var result=pocketPolygons(polygons,setup),font=fonts.fonts[design.text.fontId];
  result.schema='carvewright-toolpath-v1';result.units='mm';result.source={designId:design.id,revision:design.revision,title:design.title,fontId:design.text.fontId,fontSourceSha256:font.sourceSha256};
  if(design.schema==='carvewright-design-v2'){
    result.source.artworkSchema=design.schema;
    result.source.fontAssets=core.fontAssets(design,fonts);
    result.source.graphicAssets=core.graphicAssets(design);
  }
  result.setup=copy(setup);return result;
 }
 return Object.freeze({defaults:defaults,validateSetup:validateSetup,build:build,flattenPath:flattenPath,flattenGlyphs:flattenGlyphs,pocketPolygons:pocketPolygons,normalizeContours:normalizeContours});
});
