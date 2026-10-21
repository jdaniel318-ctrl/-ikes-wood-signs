"""Pinned, bounded offline inputs for the Dreadwater player compiler."""
import base64, hashlib, io, json, re, struct
from pathlib import Path
from PIL import Image
ART_LIMIT=4*1024*1024
PLAYER_LIMIT=8*1024*1024
CHANNELS={'Diffuse':'map','nor_gl':'normalMap','Rough':'roughnessMap'}
FAMILIES={'wood','stone','rock','cloth'}
VENDOR_SHA256='6e40e410c97c908254aa41dcbeba4bb57de69c7d37b1a33d72def3d0d0f884c6'
def require(ok,message):
 if not ok:raise ValueError(message)
def sha(data):return hashlib.sha256(data).hexdigest()
def jpeg_size(data):
 require(data.startswith(b'\xff\xd8') and data.endswith(b'\xff\xd9'),'Invalid JPEG envelope')
 p=2
 while p<len(data)-3:
  require(data[p]==255,'Invalid JPEG marker');p+=1
  while p<len(data) and data[p]==255:p+=1
  marker=data[p];p+=1
  if marker in (1,0xD8,0xD9) or 0xD0<=marker<=0xD7:continue
  require(p+2<=len(data),'Truncated JPEG');length=struct.unpack('>H',data[p:p+2])[0]
  require(length>=2 and p+length<=len(data),'Invalid JPEG segment')
  if marker in (0xC0,0xC1,0xC2):
   require(length>=8,'Invalid JPEG dimensions');height,width=struct.unpack('>HH',data[p+3:p+7]);return[width,height]
  p+=length
 raise ValueError('JPEG dimensions unavailable')
def validate_art(raw):
 require(0<len(raw)<=ART_LIMIT,'Art package exceeds 4 MiB')
 a=json.loads(raw);require(set(a)=={'schema','build','textures','sources'},'Unexpected art fields')
 require(a['schema']=='stormwake-art-v1' and a['build']=='8.8.20.45','Wrong art schema/build')
 require(isinstance(a['textures'],dict) and set(a['textures'])==FAMILIES,'Wrong art families')
 require(isinstance(a['sources'],list) and len(a['sources'])==4,'Missing art provenance')
 sources={s['family']:s for s in a['sources']};require(set(sources)==FAMILIES,'Wrong source families')
 count=total=pixels=0
 for family,maps in a['textures'].items():
  require(isinstance(maps,dict) and 'map' in maps and set(maps)<=set(CHANNELS.values()),'Unexpected map slots')
  source=sources[family];require(source['license']=='CC0-1.0' and source.get('author'),'Unlicensed art input')
  records={CHANNELS.get(v['channel']):v for v in source['maps']};require(set(records)==set(maps),'Provenance map mismatch')
  for slot,data in maps.items():
   require(isinstance(data,str) and re.fullmatch(r'data:image/jpeg;base64,[A-Za-z0-9+/=]+',data) is not None,'Expected embedded JPEG data URI')
   image=base64.b64decode(data.split(',',1)[1],validate=True);record=records[slot]
   require(0<len(image)<=2*1024*1024,'Individual image exceeds bound')
   require(sha(image)==record['sha256'] and len(image)==record['size'],'Image integrity mismatch')
   dimensions=jpeg_size(image);require(dimensions==record['dimensions'],'Image dimension mismatch')
   require(all(1<=v<=2048 for v in dimensions),'Image dimension limit exceeded')
   try:
    with Image.open(io.BytesIO(image)) as decoded:
     require(decoded.format=='JPEG' and list(decoded.size)==dimensions,'Invalid decoded JPEG');decoded.verify()
    with Image.open(io.BytesIO(image)) as decoded:decoded.load()
   except (OSError,SyntaxError) as exc:raise ValueError('Corrupt JPEG pixels') from exc
   count+=1;total+=len(image);pixels+=dimensions[0]*dimensions[1]
 require(pixels<=12*1024*1024,'Texture pixel budget exceeded')
 return {'sha256':sha(raw),'bytes':len(raw),'maps':count,'decoded_bytes':total,'pixels':pixels}
def validate_vendor(root):
 root=Path(root);m=json.loads((root/'STORMWAKE_VENDOR.json').read_text());raw=(root/'stormwake_three_vendor.js').read_bytes()
 require(m['schema']=='stormwake-vendor-v1' and m['name']=='three' and m['version']=='0.180.0','Unpinned vendor')
 require(m['sha256']==sha(raw)==VENDOR_SHA256 and m['bytes']==len(raw),'Vendor integrity mismatch')
 require(m['license']=='MIT' and m['runtimeNetwork'] is False,'Unexpected vendor provenance')
 require(len(raw)<1024*1024,'Vendor bundle exceeds bound')
 return m
def check_player(raw):require(0<len(raw)<=PLAYER_LIMIT,'Compiled player exceeds 8 MiB')
