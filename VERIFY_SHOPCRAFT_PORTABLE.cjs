/* Portable artwork contracts. Uses ezdxf + fontTools for independent readback.
 * Run: node VERIFY_SHOPCRAFT_PORTABLE.cjs [original-r4-design.json]
 * No controller connection, browser, or network is used.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const C=require('./carvewright_core.js');
const F=require('./carve_fonts.js');
const A=require('./fleet_design_assets.js');
const CAM=require('./carvewright_cam.js');
const portablePath=path.join(__dirname,'carvewright_portable.js');
const P=fs.existsSync(portablePath)?require(portablePath):{};
const tests=[];
const test=(name,fn)=>tests.push([name,fn]);
const copy=o=>JSON.parse(JSON.stringify(o));
const close=(a,b,t=.00011)=>assert.ok(Math.abs(a-b)<=t,`${a} differs from expected ${b}`);
function textDesign(value='OBPR'){const d=C.createDraft();d.text.value=value;return d;}
function graphic(id='star',attrs={}){const d=C.addGraphicLayer(C.createDraft(),id);Object.assign(d.layers[0],attrs);return d;}
function exportDxf(d,options){assert.equal(typeof P.toDxf,'function','Portable DXF export must be implemented');return P.toDxf(d,F,options);}

// This is deliberately a separate parser and geometry implementation. Expected
// paths are read by fontTools; ezdxf reads the actual emitted file, not a private
// exporter structure. Winding samples compare original artwork with imported XY.
const independentPython=String.raw`
import io,json,math,sys
import ezdxf
from fontTools.pens.recordingPen import RecordingPen
from fontTools.svgLib.path import parse_path

def cross(a,b,p): return (b[0]-a[0])*(p[1]-a[1])-(p[0]-a[0])*(b[1]-a[1])
def winding(rings,p):
    n=0
    for r in rings:
        for i,a in enumerate(r):
            b=r[(i+1)%len(r)]
            if a[1]<=p[1]<b[1] and cross(a,b,p)>0: n+=1
            elif b[1]<=p[1]<a[1] and cross(a,b,p)<0: n-=1
    return n
def near(rings,p):
    for r in rings:
        for i,a in enumerate(r):
            b=r[(i+1)%len(r)];x=b[0]-a[0];y=b[1]-a[1];den=x*x+y*y
            t=max(0,min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/den)) if den else 0
            if math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y)<=.06: return True
    return False
def source_rings(glyphs,height):
    rings=[]
    for g in glyphs:
        pen=RecordingPen();parse_path(g['d'],pen);m=g['matrix'];r=[];last=None
        def xy(p):return (p[0]*m[0]+p[1]*m[2]+m[4],height-(p[0]*m[1]+p[1]*m[3]+m[5]))
        for op,args in pen.value:
            if op=='moveTo':r=[xy(args[0])];last=args[0]
            elif op=='lineTo':r.append(xy(args[0]));last=args[0]
            elif op in ('qCurveTo','curveTo'):
                control=[last]+list(args)
                assert len(control)==(3 if op=='qCurveTo' else 4), 'Unexpected source curve'
                for j in range(1,129):
                    t=j/128;u=1-t
                    if len(control)==3:
                        p=tuple(u*u*control[0][k]+2*u*t*control[1][k]+t*t*control[2][k] for k in (0,1))
                    else:
                        p=tuple(u*u*u*control[0][k]+3*u*u*t*control[1][k]+3*u*t*t*control[2][k]+t*t*t*control[3][k] for k in (0,1))
                    r.append(xy(p))
                last=args[-1]
            elif op=='closePath':
                if r[0]==r[-1]:r.pop()
                rings.append(r);r=[];last=None
            else: raise AssertionError('Unsupported source pen command '+op)
    return rings

out=[]
for case in json.load(sys.stdin):
    doc=ezdxf.read(io.StringIO(case['text'],newline=None));audit=doc.audit()
    assert not audit.errors and not audit.fixes, 'DXF parser had to repair the file: '+repr([(e.code,e.message) for e in audit.errors+audit.fixes])
    entities=list(doc.modelspace());assert entities and all(e.dxftype()=='LWPOLYLINE' for e in entities)
    rings=[]
    for e in entities:
        assert e.closed and e.dxf.elevation==0
        vertices=list(e.get_points('xyb'));assert all(p[2]==0 for p in vertices)
        r=[(float(p[0]),float(p[1])) for p in vertices]
        assert len(r)>=3 and len(r)==e.dxf.count and r[0]!=r[-1]
        assert all(math.isfinite(x) and math.isfinite(y) for x,y in r)
        rings.append(r)
    pts=[p for r in rings for p in r];areas=[sum(r[i][0]*r[(i+1)%len(r)][1]-r[(i+1)%len(r)][0]*r[i][1] for i in range(len(r)))/2 for r in rings]
    result={'version':doc.dxfversion,'units':doc.header.get('$INSUNITS'),'measurement':doc.header.get('$MEASUREMENT'),'contours':len(rings),'points':len(pts),'layers':sorted(set(e.dxf.layer for e in entities)),'bounds':{'minX':min(p[0] for p in pts),'minY':min(p[1] for p in pts),'maxX':max(p[0] for p in pts),'maxY':max(p[1] for p in pts)},'positive':sum(a>0 for a in areas),'negative':sum(a<0 for a in areas),'area':sum(areas),'rings':rings if case.get('returnRings') else None}
    if 'glyphs' in case:
        src=source_rings(case['glyphs'],case['height']);b=result['bounds'];sampled=0
        for i in range(29):
            for j in range(23):
                p=(b['minX']+(i+.371)*(b['maxX']-b['minX'])/29,b['minY']+(j+.613)*(b['maxY']-b['minY'])/23)
                expected=winding(src,p)!=0;actual=winding(rings,p)!=0
                assert expected==actual or near(src,p) or near(rings,p), 'Imported fill differs at '+repr(p)
                sampled+=1
        result['fillSamples']=sampled
    out.append(result)
print(json.dumps(out))
`;
function readback(cases){
  const result=spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python3',['-c',independentPython],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:16*1024*1024,timeout:60000});
  assert.equal(result.status,0,'Independent ezdxf/fontTools verification: '+(result.stderr||result.error||''));
  return JSON.parse(result.stdout);
}
function verifyFile(d,result,parsed){
  assert.equal(result.mime,'application/dxf');assert.equal(result.units,'mm');assert.equal(result.toleranceMm,.02);
  assert.equal(parsed.version,'AC1015');assert.equal(parsed.units,4);assert.equal(parsed.measurement,1);
  assert.deepEqual(parsed.layers,['ARTWORK'],'Only actual artwork belongs in the cutting import');
  assert.equal(result.contourCount,parsed.contours);assert.equal(result.pointCount,parsed.points);
  assert.ok(parsed.points<=30000);assert.ok(parsed.contours<=1000);
  assert.ok(Buffer.byteLength(result.text,'utf8')<=5*1024*1024);
  assert.match(result.text,/^[\x09\x0a\x0d\x20-\x7e]+$/);
  for(const k of ['minX','maxX','minY','maxY'])close(result.bounds[k],parsed.bounds[k]);
  const bounds=C.layout(d,F).bounds;
  close(parsed.bounds.minX,bounds.xMin,.0202);close(parsed.bounds.maxX,bounds.xMax,.0202);
  close(parsed.bounds.minY,d.stock.heightMm-bounds.yMax,.0202);close(parsed.bounds.maxY,d.stock.heightMm-bounds.yMin,.0202);
  assert.ok(parsed.area>0,'Normalized filled area must remain positive');
}

test('DXF has physical millimeter size, lower-left Y-up coordinates and closed artwork only',()=>{
  const d=graphic('star',{centerXmm:200,centerYmm:70,widthMm:80,heightMm:40});
  const before=JSON.stringify(d),result=exportDxf(d),[p]=readback([{text:result.text,returnRings:true}]);verifyFile(d,result,p);
  assert.deepEqual(p.bounds,{minX:160,minY:113.2,maxX:240,maxY:153.2});assert.equal(p.contours,1);
  assert.ok(p.rings[0].some(v=>Math.abs(v[0]-200)<.00011&&Math.abs(v[1]-153.2)<.00011),'The star tip stays at the top, not mirrored');
  assert.equal(JSON.stringify(d),before,'Export cannot mutate the saved master');
});
test('a rotated asymmetric graphic keeps its entered physical center and orientation',()=>{
  const d=graphic('star',{centerXmm:200,centerYmm:70,widthMm:80,heightMm:40,rotationDeg:90});
  const result=exportDxf(d,{toleranceMm:.02}),[p]=readback([{text:result.text,returnRings:true}]);verifyFile(d,result,p);
  assert.deepEqual(p.bounds,{minX:180,minY:93.2,maxX:220,maxY:173.2});
  assert.ok(p.rings[0].some(v=>Math.abs(v[0]-220)<.00011&&Math.abs(v[1]-133.2)<.00011),'The upper tip rotates to the right');
});
test('O B P R preserve all five letter counters as holes',()=>{
  const d=textDesign(),result=exportDxf(d),[p]=readback([{text:result.text,glyphs:C.layout(d,F).glyphs,height:d.stock.heightMm}]);verifyFile(d,result,p);
  assert.equal(p.positive,4);assert.equal(p.negative,5);assert.equal(p.contours,9);assert.equal(p.fillSamples,667);
});
test('nonzero normalization unions overlapping boundaries and preserves nested holes',()=>{
  assert.equal(typeof CAM.normalizeContours,'function','Tool-independent contour normalization must be available');
  const rect=(x0,y0,x1,y1)=>[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
  const area=contours=>contours.reduce((sum,c)=>sum+c.points.reduce((s,a,i)=>{const b=c.points[(i+1)%c.points.length];return s+a.x*b.y-b.x*a.y;},0)/2,0);
  const union=CAM.normalizeContours([rect(0,0,10,10),rect(5,0,15,10)]);assert.equal(union.length,1);close(area(union),150);
  const donut=CAM.normalizeContours([rect(0,0,20,20),rect(5,5,15,15).reverse()]);assert.equal(donut.length,2);assert.equal(donut.filter(c=>c.hole).length,1);close(area(donut),300);
  const island=CAM.normalizeContours([rect(0,0,20,20),rect(5,5,15,15).reverse(),rect(8,8,12,12)]);assert.equal(island.length,3);assert.equal(island.filter(c=>c.hole).length,1);close(area(island),316);
});
test('duplicate graphic layers normalize to one boundary instead of duplicate cutting geometry',()=>{
  const single=graphic('star',{centerXmm:200,centerYmm:70,widthMm:80,heightMm:40});
  const duplicate=C.duplicateLayer(single,single.layers[0].id);Object.assign(duplicate.layers[1],single.layers[0],{id:duplicate.layers[1].id});
  const one=exportDxf(single),two=exportDxf(duplicate),[a,b]=readback([{text:one.text},{text:two.text}]);
  assert.equal(b.contours,1);assert.equal(b.points,a.points);close(b.area,a.area);assert.equal(two.text,one.text);
});
test('overlapping lettering and graphic match the source nonzero fill',()=>{
  let d=textDesign('O');d.text.sizePercent=65;d=C.addGraphicLayer(d,'star');Object.assign(d.layers[0],{widthMm:130,heightMm:120});
  const result=exportDxf(d),[p]=readback([{text:result.text,glyphs:C.layout(d,F).glyphs,height:d.stock.heightMm}]);verifyFile(d,result,p);assert.equal(p.fillSamples,667);
});
test('small neutral artwork exports even when the default cutter cannot enter it',()=>{
  const d=graphic('compass');assert.throws(()=>CAM.build(d,F,CAM.defaults(d)),/tool.*large|large.*tool|fit|collaps/i);
  const result=exportDxf(d),[p]=readback([{text:result.text,glyphs:C.layout(d,F).glyphs,height:d.stock.heightMm}]);verifyFile(d,result,p);assert.ok(p.negative>=2);
});
test('all eight fonts and sixteen graphics independently import without fill or size changes',()=>{
  const cases=[];
  for(const id of A.fontOrder){const d=textDesign('OBPR Smoke');d.text.fontId=id;cases.push({id,d});}
  for(const id of A.graphicOrder){const d=graphic(id);const a=d.layers[0],scale=90/Math.max(a.widthMm,a.heightMm);a.widthMm*=scale;a.heightMm*=scale;a.rotationDeg=17;cases.push({id,d});}
  assert.equal(cases.length,24);
  for(const c of cases){c.result=exportDxf(c.d);const layout=C.layout(c.d,F);c.input={text:c.result.text,glyphs:layout.glyphs,height:c.d.stock.heightMm};}
  const parsed=readback(cases.map(c=>c.input));let samples=0;
  for(let i=0;i<cases.length;i++){try{verifyFile(cases[i].d,cases[i].result,parsed[i]);samples+=parsed[i].fillSamples;}catch(e){throw Error(cases[i].id+': '+e.message);}}
  assert.equal(samples,16008);
});
test('invalid, blank, unsupported and out-of-stock artwork cannot export',()=>{
  assert.throws(()=>exportDxf(C.createDraft()),/blank|letter|artwork|design/i);
  assert.throws(()=>exportDxf(textDesign('☃')),/unsupported/i);
  const outside=graphic();outside.layers[0].centerXmm=0;assert.throws(()=>exportDxf(outside),/margin|outside|inset|overflow/i);
  const nonfinite=graphic();nonfinite.layers[0].rotationDeg=NaN;assert.throws(()=>exportDxf(nonfinite),/finite|JSON|rotation/i);
  const prototype=Object.assign(Object.create({inherited:true}),textDesign());assert.throws(()=>exportDxf(prototype),/plain|JSON|prototype/i);
  let calls=0;const accessor=textDesign();Object.defineProperty(accessor,'schema',{enumerable:true,get(){calls++;return 'carvewright-design-v1';}});
  assert.throws(()=>exportDxf(accessor),/accessor|data|plain|property/i);assert.equal(calls,0,'Validation must not evaluate untrusted accessors');
});
test('tolerance is explicit, bounded and rejects untrusted options without invoking getters',()=>{
  const d=textDesign('O');const fine=exportDxf(d,{toleranceMm:.01});assert.equal(fine.toleranceMm,.01);assert.ok(fine.pointCount>=exportDxf(d).pointCount);
  for(const n of [NaN,Infinity,0,-.02,2,'0.02'])assert.throws(()=>exportDxf(d,{toleranceMm:n}),/tolerance|finite|number/i);
  assert.throws(()=>exportDxf(d,{toleranceMm:.02,origin:'center'}),/option|field|unknown/i);
  let calls=0;const options={};Object.defineProperty(options,'toleranceMm',{enumerable:true,get(){calls++;return .02;}});assert.throws(()=>exportDxf(d,options),/accessor|data|property/i);assert.equal(calls,0);
});
test('normalization rejects degenerate, nonfinite, excessive and unsafe polygon data',()=>{
  assert.equal(typeof CAM.normalizeContours,'function');
  const triangle=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];
  assert.throws(()=>CAM.normalizeContours([]),/empty/i);assert.throws(()=>CAM.normalizeContours([[{x:0,y:0},{x:1,y:0},{x:2,y:0}]]),/degenerate/i);
  assert.throws(()=>CAM.normalizeContours([[{x:0,y:0},{x:Infinity,y:0},{x:0,y:1}]]),/finite|JSON/i);
  assert.throws(()=>CAM.normalizeContours(Array.from({length:1001},()=>copy(triangle))),/excessive|limit|many/i);
  assert.throws(()=>CAM.normalizeContours([Array.from({length:30001},(_,i)=>({x:i%2,y:i%3}))]),/limit|large|exceed/i);
  let calls=0;const point={y:1};Object.defineProperty(point,'x',{enumerable:true,get(){calls++;return 1;}});assert.throws(()=>CAM.normalizeContours([[...triangle,point]]),/accessor|data/i);assert.equal(calls,0);
});
test('the actual original revision 4 retains its fingerprint and byte-exact ShopBot preview',async()=>{
  const fixture=process.argv[2]||path.join(__dirname,'../recovered/BlackFlag Airmail/Captians-Sign-r4-PREVIEW-design.json');
  assert.ok(fs.existsSync(fixture),'Pass the original revision 4 fixture path for the mandatory compatibility check');
  const packet=JSON.parse(fs.readFileSync(fixture,'utf8'));
  assert.equal(await C.fingerprint(packet.design,F),'ac6efe64af97f005eeb401841f5d3a25b67142745111b5f61e5f30c468ea5283');
  const record=JSON.parse(fs.readFileSync(fixture.replace('-design.json','-machining.json'),'utf8'));
  const job=CAM.build(packet.design,F,record.setup);assert.equal(job.moves.length,13992);
  const post=require('./carvewright_posts.js').exportProgram(job,{id:record.setup.machine.postId,spindleMode:record.setup.machine.spindleMode});
  const header=['PREVIEW - UNVERIFIED SETUP','Controller preview only. Physical setup has not been confirmed.','Executable CNC program. Verify the actual machine setup before running.'].map(s=>"' "+s).join('\r\n')+'\r\n';
  const expected=fs.readFileSync(fixture.replace('-design.json','-shopbot-inch.sbp.txt'),'utf8');
  assert.equal(header+post.text,expected);assert.equal(record.post.sha256,crypto.createHash('sha256').update(expected).digest('hex'));
  const result=exportDxf(packet.design),[p]=readback([{text:result.text}]);verifyFile(packet.design,result,p);
});

(async()=>{let passed=0;const failures=[];for(const [name,fn] of tests){try{await fn();passed++;console.log('PASS '+name);}catch(e){failures.push({name,error:e.message});console.error('FAIL '+name+' — '+e.message);}}console.log(JSON.stringify({suite:'Shopcraft portable artwork',passed,total:tests.length,independentParser:'ezdxf + fontTools',failures},null,2));process.exitCode=failures.length?1:0;})();
