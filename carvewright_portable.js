/* Shopcraft neutral artwork export. No tool offsets or machine instructions.
 * ASCII AutoCAD 2000 DXF: closed LWPOLYLINEs, millimeters, lower-left XY/Y-up.
 * Curves use the shared physical flattener; Clipper's nonzero union preserves
 * filled overlaps and counters on its existing 0.0001 mm coordinate grid.
 */
(function(root,factory){
 'use strict';
 var node=typeof module==='object'&&module.exports;
 var api=factory(node?require('./carvewright_core.js'):root.CarvewrightCore,node?require('./carvewright_cam.js'):root.CarvewrightCAM);
 if(node)module.exports=api;if(root)root.CarvewrightPortable=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core,cam){
 'use strict';
 var MAX_BYTES=5*1024*1024,BAD=['__proto__','constructor','prototype'];
 function fail(message){throw new Error('Portable artwork: '+message);}
 function plain(o){return !!o&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);}
 function finite(n){return typeof n==='number'&&Number.isFinite(n);}
 function dataTree(o,depth,state){
  state=state||{n:0};depth=depth||0;if(++state.n>250000||depth>24)fail('Input data is too large or deeply nested.');
  if(o===null||typeof o==='string'||typeof o==='boolean'||finite(o))return;
  if(!plain(o)&&!Array.isArray(o))fail('Input must contain plain finite JSON data.');
  Reflect.ownKeys(o).forEach(function(k){
   if(Array.isArray(o)&&k==='length')return;
   if(typeof k!=='string'||BAD.indexOf(k)!==-1)fail('Unsafe input key.');
   var d=Object.getOwnPropertyDescriptor(o,k);
   if(!d||!d.enumerable||!Object.prototype.hasOwnProperty.call(d,'value'))fail('Input accessors are not supported; use own data properties.');
   dataTree(d.value,depth+1,state);
  });
 }
 function tolerance(options){
  if(options===undefined)return .02;
  dataTree(options);if(!plain(options))fail('DXF options must be a plain object.');
  Object.keys(options).forEach(function(k){if(k!=='toleranceMm')fail('Unknown DXF option: '+k);});
  var t=Object.prototype.hasOwnProperty.call(options,'toleranceMm')?options.toleranceMm:.02;
  if(!finite(t)||t<.0001||t>1)fail('Curve tolerance must be a finite number between 0.0001 and 1 mm.');
  return t;
 }
 function number(n){
  if(!finite(n))fail('A geometry coordinate is not finite.');
  var s=n.toFixed(4).replace(/\.?0+$/,'');return !s||s==='-0'?'0':s;
 }
 function normalizedContours(design,fonts,options){
  var t=tolerance(options);dataTree(design);dataTree(fonts);
  if(!core||typeof core.layout!=='function'||!cam||typeof cam.normalizeContours!=='function')fail('The artwork geometry engines are unavailable.');
  var layout=core.layout(design,fonts);
  if(!layout.ok||layout.blank)fail((layout.errors||[]).join(' ')||'Enter nonblank artwork before export.');
  var width=design.stock.widthMm,height=design.stock.heightMm;
  var polygons=cam.flattenGlyphs(layout.glyphs,{widthMm:width,heightMm:height,origin:'lower-left',toleranceMm:t});
  var contours=cam.normalizeContours(polygons),count=0,bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
  contours.forEach(function(c){
   count+=c.points.length;
   c.points.forEach(function(p){
    if(!finite(p.x)||!finite(p.y)||p.x<-.0001||p.x>width+.0001||p.y<-.0001||p.y>height+.0001)fail('Artwork lies outside the physical sign bounds.');
    bounds.minX=Math.min(bounds.minX,p.x);bounds.minY=Math.min(bounds.minY,p.y);
    bounds.maxX=Math.max(bounds.maxX,p.x);bounds.maxY=Math.max(bounds.maxY,p.y);
   });
  });
  return {contours:contours,toleranceMm:t,bounds:bounds,pointCount:count};
 }
 function toDxf(design,fonts,options){
  var geometry=normalizedContours(design,fonts,options),bounds=geometry.bounds,lines=[],bytes=0;
  function pair(code,value){
   // Every value is generated ASCII: bytes equal characters including CRLF.
   var c=String(code),v=String(value);bytes+=c.length+v.length+4;
   if(bytes>MAX_BYTES)fail('DXF exceeds the 5 MiB file limit. Reduce artwork complexity.');
   lines.push(c,v);
  }
  function coordinate(code,p){pair(code,number(p.x));pair(code+10,number(p.y));pair(code+20,'0');}
  pair(999,'Neutral artwork only; choose tooling and a machine-specific post in CAM.');
  pair(999,'Millimeters; lower-left stock origin; Y-up; curve tolerance '+geometry.toleranceMm+' mm; coordinate grid 0.0001 mm.');
  pair(999,'Reference stock '+number(design.stock.widthMm)+' x '+number(design.stock.heightMm)+' mm; stock boundary is not cutting geometry.');
  pair(0,'SECTION');pair(2,'HEADER');
  pair(9,'$ACADVER');pair(1,'AC1015');
  pair(9,'$DWGCODEPAGE');pair(3,'ANSI_1252');
  pair(9,'$HANDSEED');pair(5,(5+geometry.contours.length).toString(16).toUpperCase());
  pair(9,'$INSUNITS');pair(70,4);pair(9,'$MEASUREMENT');pair(70,1);
  pair(9,'$INSBASE');coordinate(10,{x:0,y:0});
  pair(9,'$EXTMIN');coordinate(10,{x:bounds.minX,y:bounds.minY});
  pair(9,'$EXTMAX');coordinate(10,{x:bounds.maxX,y:bounds.maxY});
  pair(0,'ENDSEC');
  pair(0,'SECTION');pair(2,'TABLES');
  pair(0,'TABLE');pair(2,'LTYPE');pair(5,'1');pair(100,'AcDbSymbolTable');pair(70,1);
  pair(0,'LTYPE');pair(5,'2');pair(330,'1');pair(100,'AcDbSymbolTableRecord');pair(100,'AcDbLinetypeTableRecord');
  pair(2,'CONTINUOUS');pair(70,0);pair(3,'Solid line');pair(72,65);pair(73,0);pair(40,0);pair(0,'ENDTAB');
  pair(0,'TABLE');pair(2,'LAYER');pair(5,'3');pair(100,'AcDbSymbolTable');pair(70,1);
  pair(0,'LAYER');pair(5,'4');pair(330,'3');pair(100,'AcDbSymbolTableRecord');pair(100,'AcDbLayerTableRecord');
  pair(2,'ARTWORK');pair(70,0);pair(62,7);pair(6,'CONTINUOUS');pair(0,'ENDTAB');pair(0,'ENDSEC');
  pair(0,'SECTION');pair(2,'ENTITIES');
  geometry.contours.forEach(function(c,i){
   pair(0,'LWPOLYLINE');pair(5,(5+i).toString(16).toUpperCase());pair(100,'AcDbEntity');pair(8,'ARTWORK');pair(100,'AcDbPolyline');
   pair(90,c.points.length);pair(70,1);pair(38,0);
   c.points.forEach(function(p){pair(10,number(p.x));pair(20,number(p.y));});
  });
  pair(0,'ENDSEC');pair(0,'EOF');
  return {text:lines.join('\r\n')+'\r\n',mime:'application/dxf',units:'mm',toleranceMm:geometry.toleranceMm,bounds:bounds,contourCount:geometry.contours.length,pointCount:geometry.pointCount};
 }
 return Object.freeze({toDxf:toDxf,normalizedContours:normalizedContours});
});
