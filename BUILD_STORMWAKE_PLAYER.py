"""Compile pinned renderer, embedded artwork and legacy into an offline player.

Usage: python BUILD_STORMWAKE_PLAYER.py [release-directory]
No dependency install or network request occurs in this compiler.
"""
from pathlib import Path
import sys,json
from STORMWAKE_BUILD_RULES import validate_art,validate_vendor,check_player,sha,PLAYER_LIMIT
SOURCES=['fun_core.js','stormwake_core.js','stormwake_comfort.js','stormwake_three_vendor.js','stormwake_gl.js','stormwake_cast.js','stormwake_three.js','stormwake_world.js','stormwake_game.js']
def compile_player(r):
 art=(r/'stormwake_assets.json').read_bytes();art_info=validate_art(art);vendor=validate_vendor(r)
 source_data={name:(r/name).read_bytes() for name in SOURCES};chunks=[]
 for name,data in source_data.items():
  source=data.decode('utf-8')
  if '</script' in source.lower():raise ValueError('Inline script terminator in '+name)
  chunks.append(source)
  if name=='stormwake_three_vendor.js':chunks.append('window.StormwakeAssets='+json.dumps(json.loads(art),separators=(',',':'),ensure_ascii=True).replace('<','\\u003c')+';')
 legacy=json.dumps((r/'fun_player.html').read_text()).replace('<','\\u003c');css=(r/'stormwake_game.css').read_text()
 if '</style' in css.lower():raise ValueError('Inline style terminator')
 html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src about:; form-action 'none'; base-uri 'none'"><title>Black Flag: Stormwake</title><style>'''+css+'''</style></head><body><main id="swLocked"><span class="eyebrow">FUN · Separate Admiral Program</span><h1>Black Flag: Stormwake</h1><p>Open Stormwake through Black Flag's authenticated Admiral Programs entrance. Direct file access does not start a game session.</p><p>Solo 3D first playable. No business data, community invitations, or cloud saves.</p></main><script>window.STORMWAKE_LEGACY_HTML='''+legacy+';\n'+'\n'.join(chunks)+'''</script></body></html>'''
 raw=html.encode('utf-8');check_player(raw);(r/'stormwake_player.html').write_bytes(raw)
 inputs={name:sha(data) for name,data in source_data.items()}
 for name in ['stormwake_assets.json','STORMWAKE_VENDOR.json','fun_player.html','stormwake_game.css','BUILD_STORMWAKE_PLAYER.py','STORMWAKE_BUILD_RULES.py']:inputs[name]=sha((r/name).read_bytes())
 report={'schema':'stormwake-player-build-v1','build':'8.8.20.50','inputs_sha256':inputs,'art':art_info,'vendor':vendor,'player':{'bytes':len(raw),'sha256':sha(raw),'limit_bytes':PLAYER_LIMIT},'runtime_network':False}
 (r/'STORMWAKE_PLAYER_BUILD.json').write_text(json.dumps(report,indent=2)+'\n')
 print('Stormwake compiled:',len(raw),'bytes;',art_info['maps'],'embedded maps; pinned Three',vendor['version'],'; no remote runtime.')
 return report
if __name__=='__main__':compile_player(Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent)
