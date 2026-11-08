/* Wonderwake Fernlight: original artwork and a constrained SVG exchange bridge.
 * Design references: VectorCraft's SVG workflow and documented pen/finger policy.
 * No ArtCraft runtime, backend, assets, or upstream implementation is bundled.
 * See CREATIVE_WORKFLOW.md for provenance, limitations and supported SVG subset. */
(function(root, factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.WWCreative=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const NS='http://www.w3.org/2000/svg';
const LIMITS=Object.freeze({sourceBytes:262144,elements:500,depth:24,pathChars:120000,pngChars:350000,pixels:512});
const DINO=[
 ['ellipse',{cx:162,cy:255,rx:124,ry:15,fill:'#244e4c',opacity:'.12'}],
 ['path',{d:'M93 197 Q37 210 20 160 Q45 180 84 151 Z',fill:'#468f77'}],
 ['path',{d:'M67 167 Q56 116 104 104 Q151 89 193 141 L202 200 Q163 235 95 218 Z',fill:'#68b495'}],
 ['ellipse',{cx:119,cy:175,rx:52,ry:47,fill:'#91c8a6'}],
 ['path',{d:'M87 203 L85 242 Q86 255 107 253 L118 252 L119 205 Z',fill:'#3a806e'}],
 ['path',{d:'M151 206 L153 244 Q156 257 178 253 L187 249 L182 198 Z',fill:'#397f6a'}],
 ['path',{d:'M78 200 L75 236 Q78 247 97 244 L102 240 L107 204 Z',fill:'#65ac88'}],
 ['path',{d:'M129 202 L125 241 Q126 255 149 254 L161 251 L162 198 Z',fill:'#68b490'}],
 ['path',{d:'M80 237 L86 230 L90 239 M92 240 L98 231 L102 241 M135 247 L141 238 L145 249 M147 249 L153 239 L157 248',fill:'none',stroke:'#e3e3b4','stroke-width':4,'stroke-linecap':'round'}],
 ['path',{d:'M92 116 Q76 102 78 80 Q87 64 99 74 Q105 42 127 45 Q145 47 151 65 Q177 44 193 65 Q211 85 199 100 Q224 111 217 134 Q206 154 183 154 L128 177 L99 149 Z',fill:'#397c69'}],
 ['path',{d:'M103 124 Q86 105 95 89 Q105 79 116 88 Q112 60 132 61 Q145 61 146 84 Q169 62 184 80 Q194 94 179 108 Q205 107 204 125 Q202 142 177 139 L139 156 Z',fill:'#a8d3a6'}],
 ['path',{d:'M126 133 Q130 98 166 97 Q211 94 228 137 L265 146 Q286 152 284 177 Q281 201 250 204 L175 207 Q145 205 134 184 Z',fill:'#77bf97'}],
 ['path',{d:'M168 178 Q217 185 259 175 Q285 175 275 191 Q265 205 240 204 L177 203 Z',fill:'#c5dda7'}],
 ['path',{d:'M161 114 Q166 89 188 64 Q181 93 182 120 Z',fill:'#fff1cc',stroke:'#e2cca0','stroke-width':2}],
 ['path',{d:'M206 123 Q215 103 236 87 Q227 114 225 137 Z',fill:'#fff1cc',stroke:'#e2cca0','stroke-width':2}],
 ['path',{d:'M256 149 Q265 133 275 125 L271 157 Z',fill:'#fff1cc',stroke:'#e2cca0','stroke-width':2}],
 ['ellipse',{cx:204,cy:147,rx:12,ry:15,fill:'#fcf2cf'}],
 ['ellipse',{cx:207,cy:148,rx:7,ry:11,fill:'#244c45'}],
 ['ellipse',{cx:210,cy:143,rx:2.6,ry:3.4,fill:'#ffffff'}],
 ['path',{d:'M190 130 Q201 124 211 128',fill:'none',stroke:'#3c8065','stroke-width':4,'stroke-linecap':'round'}],
 ['ellipse',{cx:268,cy:167,rx:3.2,ry:2.7,fill:'#437c61'}],
 ['ellipse',{cx:221,cy:176,rx:10,ry:6,fill:'#d99a7c',opacity:'.7'}],
 ['path',{d:'M235 187 Q249 192 262 185',fill:'none',stroke:'#477d5e','stroke-width':3,'stroke-linecap':'round'}],
 ['path',{d:'M132 179 Q146 198 170 201 L160 218 Q139 215 122 199 Z',fill:'#d78263'}],
 ['path',{d:'M132 197 L117 226 L137 226 L145 206 Z',fill:'#e6a36f'}],
 ['path',{d:'M92 117 Q77 112 69 130 L67 171 Q79 182 95 173 L106 142 Z',fill:'#d9b87b',stroke:'#b2915e','stroke-width':3}],
 ['path',{d:'M82 132 L85 139 L93 140 L87 146 L88 154 L81 150 L74 154 L75 146 L69 140 L78 139 Z',fill:'#fff1c5'}],
 ['ellipse',{cx:112,cy:182,rx:5,ry:4,fill:'#599f7a'}],
 ['ellipse',{cx:121,cy:194,rx:3,ry:3,fill:'#599f7a'}],
 ['ellipse',{cx:101,cy:194,rx:3,ry:3,fill:'#599f7a'}]
];
function dinosaurSVG(){return `<svg xmlns="${NS}" width="320" height="280" viewBox="0 0 320 280"><title>Fern, Wonderwake's original triceratops explorer</title>`+DINO.map(([tag,a])=>'<'+tag+' '+Object.entries(a).map(([k,v])=>k+'="'+v+'"').join(' ')+'/>').join('')+'</svg>';}
function drawDinosaur(g,x,y,scale=1,time=0,walk=0){g.save();g.translate(x-46*scale,y-72*scale+Math.sin(time*1.8)*scale);g.scale(.30*scale,.30*scale);for(const [index,[tag,a]] of DINO.entries()){g.save();
// Only the optional quest walk pose articulates the legs; existing studio/portrait calls stay still.
if(walk&&index>=5&&index<=8){const pivot=[95,167,90,142][index-5];g.translate(pivot,203);g.rotate(Math.sin(time*13+(index%2)*Math.PI)*.18*walk);g.translate(-pivot,-203);}
if(walk&&index===9){for(const [pivot,phase,d]of [[90,Math.PI,'M80 237 L86 230 L90 239 M92 240 L98 231 L102 241'],[142,0,'M135 247 L141 238 L145 249 M147 249 L153 239 L157 248']]){g.save();g.translate(pivot,203);g.rotate(Math.sin(time*13+phase)*.18*walk);g.translate(-pivot,-203);g.strokeStyle='#e3e3b4';g.lineWidth=4;g.lineCap='round';g.stroke(new Path2D(d));g.restore();}g.restore();continue;}
g.globalAlpha=Number(a.opacity||1);let p;if(tag==='path')p=new Path2D(a.d);else{p=new Path2D();p.ellipse(a.cx,a.cy,a.rx,a.ry,0,0,Math.PI*2);}if(a.fill&&a.fill!=='none'){g.fillStyle=a.fill;g.fill(p);}if(a.stroke){g.strokeStyle=a.stroke;g.lineWidth=Number(a['stroke-width']||1);g.lineCap=a['stroke-linecap']||'round';g.lineJoin='round';g.stroke(p);}g.restore();}g.restore();}
function pointerGuard(){let active=null,pen=false;return{begin(e){if(active!==null||e.button>0||(pen&&e.pointerType==='touch'))return false;active=e.pointerId;if(e.pointerType==='pen')pen=true;return true;},move:e=>active!==null&&active===e.pointerId,end(e){if(active!==e.pointerId)return false;active=null;return true;},cancel(){active=null;},allowFinger(){active=null;pen=false;},penSeen:()=>pen};}
function validateArtwork(a){
 if(!a||a.schema!==1||typeof a.label!=='string'||!a.label.trim()||a.label.length>40||/[<>\x00-\x1f]/.test(a.label))throw Error('Invalid illustration label.');
 const p=a.png;if(typeof p!=='string'||p.length>LIMITS.pngChars||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(p))throw Error('Illustration must be a small PNG prepared by the artwork workshop.');
 let b;try{b=atob(p.slice(22));}catch{throw Error('Unreadable illustration.');}
 if(b.length<45||b.slice(0,8)!=='\x89PNG\r\n\x1a\n'||b.slice(12,16)!=='IHDR'||b.slice(-8,-4)!=='IEND')throw Error('Invalid PNG illustration.');
 const n=i=>(b.charCodeAt(i)*16777216+b.charCodeAt(i+1)*65536+b.charCodeAt(i+2)*256+b.charCodeAt(i+3));
 if(n(16)<1||n(20)<1||n(16)>LIMITS.pixels||n(20)>LIMITS.pixels)throw Error('Illustration dimensions exceed 512 pixels.');
 return{schema:1,label:a.label.trim(),png:p};
}
const TAGS=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop']);
const PRESENT=new Set(['fill','stroke','opacity','fill-opacity','stroke-opacity','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','fill-rule','stop-color','stop-opacity']);
const NUMERIC=new Set(['x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','fx','fy','width','height','stroke-width','stroke-miterlimit']);
const ATTR=new Set([...PRESENT,...NUMERIC,'id','d','points','transform','viewBox','gradientUnits','gradientTransform','offset','preserveAspectRatio']);
const fail=msg=>{throw Error(msg+' Nothing has been applied. Export a simple SVG with outlined text and no linked images, filters or scripts.');};
function numeric(s,percent=false){if(typeof s!=='string'||!new RegExp('^[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?'+(percent?'%?':'(?:px)?')+'$').test(s.trim()))fail('Unsupported SVG number.');const n=parseFloat(s);if(!Number.isFinite(n)||Math.abs(n)>1000000)fail('SVG coordinates are too large.');return n;}
function numbers(s){const vals=s.trim().split(/[ ,\s]+/).map(x=>numeric(x));if(!vals.length||vals.length>10000)fail('SVG geometry is too complex.');return vals;}
function paint(s,refs){s=s.trim();const m=s.match(/^url\(\s*#([A-Za-z_][\w.-]{0,63})\s*\)$/);if(m){refs.push(m[1]);return 'url(#'+m[1]+')';}if(/^#[0-9a-f]{3,4}$/i.test(s)||/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(s)||/^(none|transparent|black|white|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|cyan|magenta|teal|navy|lime|gold|silver)$/i.test(s))return s;
 if(/^rgba?\([\d.% ,+-]+\)$/.test(s)){const parts=s.slice(s.indexOf('(')+1,-1).split(/[,\s]+/).filter(Boolean);if(parts.length!==3&&parts.length!==4)fail('Unsupported SVG color.');parts.forEach(p=>numeric(p,true));return s;}fail('Unsupported SVG paint.');}
function sanitizeSVG(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>LIMITS.sourceBytes)fail('SVG exceeds 256 KiB.');
 if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(text))fail('External declarations are not allowed.');
 if(typeof DOMParser==='undefined')throw Error('SVG import needs a browser.');
 const doc=new DOMParser().parseFromString(text,'image/svg+xml');if(doc.querySelector('parsererror'))fail('SVG could not be parsed.');
 const root=doc.documentElement;if(root.localName!=='svg'||root.namespaceURI!==NS)fail('Choose an SVG image.');
 for(const n of doc.childNodes)if(n.nodeType===7)fail('SVG processing instructions are not allowed.');
 const out=document.implementation.createDocument(NS,'svg',null),ids=new Map(),refs=[];let count=0,paths=0;
 function walk(el,dest,depth){if(depth>LIMITS.depth||++count>LIMITS.elements)fail('SVG has too many shapes or groups.');
  const tag=el.localName;if(el.namespaceURI!==NS||!TAGS.has(tag)||(tag==='svg'&&el!==root))fail('Unsupported SVG element: '+tag+'.');
  if(el.children.length&& !['svg','g','defs','linearGradient','radialGradient'].includes(tag))fail('Unexpected nested SVG content.');
  const a={};for(const at of el.attributes){if(at.name==='xmlns'&&at.value===NS&&el===root)continue;if(at.name==='xmlns:xlink'&&at.value==='http://www.w3.org/1999/xlink'&&el===root)continue;
   if(at.name==='version'&&el===root&&/^1\.[01]$/.test(at.value))continue;
   if(at.name==='style'){for(const item of at.value.split(';').map(x=>x.trim()).filter(Boolean)){const i=item.indexOf(':');if(i<0||!PRESENT.has(item.slice(0,i).trim()))fail('Unsupported SVG style.');a[item.slice(0,i).trim()]=item.slice(i+1).trim();}continue;}
   if(at.namespaceURI||!ATTR.has(at.name))fail('Unsupported SVG attribute: '+at.name+'.');a[at.name]=at.value;
  }
  for(const [name,raw]of Object.entries(a)){const v=raw.trim();if(v.length>(name==='d'?LIMITS.pathChars:80000))fail('SVG attribute is too large.');
   if(name==='id'){if(!/^[A-Za-z_][\w.-]{0,63}$/.test(v)||ids.has(v))fail('Invalid or duplicated SVG identifier.');ids.set(v,tag);}
   else if(['fill','stroke','stop-color'].includes(name)){dest.setAttribute(name,paint(v,refs));continue;}
   else if(NUMERIC.has(name)){const n=numeric(v,true);if(['r','rx','ry','width','height','stroke-width'].includes(name)&&n<0)fail('Negative SVG dimensions are not supported.');}
   else if(['opacity','fill-opacity','stroke-opacity','stop-opacity','offset'].includes(name)){let n=numeric(v,true);if(v.endsWith('%'))n/=100;if(n<0||n>1)fail('Invalid opacity or gradient stop.');}
   else if(name==='d'){paths+=v.length;if(paths>LIMITS.pathChars||!/^\s*[Mm][MmZzLlHhVvCcSsQqTtAa0-9eE+.,\s-]*$/.test(v))fail('Unsupported path data.');for(const n of v.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)||[])numeric(n);}
   else if(name==='points'){const p=numbers(v);if(p.length<4||p.length%2)fail('Invalid SVG point list.');}
   else if(name==='viewBox'){const p=numbers(v);if(p.length!==4||p[2]<=0||p[3]<=0||p[2]>100000||p[3]>100000)fail('Invalid SVG viewBox.');}
   else if(name==='transform'||name==='gradientTransform'){let rest=v.replace(/(?:matrix|translate|scale|rotate|skewX|skewY)\s*\(([^()]*)\)/g,(_,args)=>{numbers(args);return '';});if(rest.trim().replace(/,/g,''))fail('Unsupported SVG transform.');}
   else if(name==='preserveAspectRatio'){if(!/^(?:none|x(?:Min|Mid|Max)Y(?:Min|Mid|Max)(?: (?:meet|slice))?)$/.test(v))fail('Unsupported aspect ratio.');}
   else if(name==='gradientUnits'){if(!['userSpaceOnUse','objectBoundingBox'].includes(v))fail('Unsupported gradient units.');}
   else if(name==='fill-rule'){if(!['evenodd','nonzero'].includes(v))fail('Unsupported fill rule.');}
   else if(name==='stroke-linecap'){if(!['butt','round','square'].includes(v))fail('Unsupported line cap.');}
   else if(name==='stroke-linejoin'){if(!['miter','round','bevel'].includes(v))fail('Unsupported line join.');}
   dest.setAttribute(name,v);
  }
  for(const n of el.childNodes){if(n.nodeType===1){if(n.localName==='title'||n.localName==='desc'){if(n.children.length)fail('Unexpected SVG description.');continue;}const child=out.createElementNS(NS,n.localName);walk(n,child,depth+1);dest.appendChild(child);}else if(n.nodeType===3&&n.textContent.trim())fail('Text must be converted to outlines.');else if(n.nodeType!==3&&n.nodeType!==8)fail('Unsupported SVG document content.');}
 }
 walk(root,out.documentElement,0);for(const id of refs)if(!['linearGradient','radialGradient'].includes(ids.get(id)))fail('Paint must reference an included gradient.');
 let vb=out.documentElement.getAttribute('viewBox');if(!vb){const w=numeric(root.getAttribute('width')||'0'),h=numeric(root.getAttribute('height')||'0');if(w<=0||h<=0)fail('SVG needs a viewBox or positive dimensions.');vb=`0 0 ${w} ${h}`;out.documentElement.setAttribute('viewBox',vb);}
 out.documentElement.setAttribute('width','512');out.documentElement.setAttribute('height','512');out.documentElement.setAttribute('preserveAspectRatio','xMidYMid meet');
 return{svg:new XMLSerializer().serializeToString(out),elements:count};
}
async function prepareArtwork(text,label='My illustration'){
 const checked=sanitizeSVG(text);const url=URL.createObjectURL(new Blob([checked.svg],{type:'image/svg+xml'}));
 try{const image=await new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>{im.src='';reject(Error('Artwork preview timed out. Nothing was applied.'));},12000);im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=()=>{clearTimeout(timer);reject(Error('Artwork could not be drawn. Nothing was applied.'));};im.src=url;});
  const c=document.createElement('canvas');c.width=c.height=LIMITS.pixels;const g=c.getContext('2d');if(!g)throw Error('Artwork preview is unavailable.');g.drawImage(image,0,0,LIMITS.pixels,LIMITS.pixels);
  return validateArtwork({schema:1,label,png:c.toDataURL('image/png')});
 }finally{URL.revokeObjectURL(url);}
}
const cache=new Map();function imageFor(a,ready){if(!a)return null;let im=cache.get(a.png);if(!im){if(cache.size>=24)cache.delete(cache.keys().next().value);im=new Image();im.src=a.png;cache.set(a.png,im);}if(im.complete&&im.naturalWidth>0)return im;if(ready)im.addEventListener('load',ready,{once:true});return null;}
return Object.freeze({version:'0.3.0',LIMITS,dinosaurSVG,drawDinosaur,pointerGuard,validateArtwork,sanitizeSVG,prepareArtwork,imageFor});
});
