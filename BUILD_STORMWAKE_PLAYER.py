"""Compile original 3D player and retained legacy into an opaque offline document."""
from pathlib import Path
import sys,json
r=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parent
sources=['fun_core.js','stormwake_core.js','stormwake_gl.js','stormwake_world.js','stormwake_game.js']
js='\n'.join((r/x).read_text() for x in sources)
assert '</script' not in js.lower()
legacy=json.dumps((r/'fun_player.html').read_text()).replace('</','<\\/')
css=(r/'stormwake_game.css').read_text()
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src about:; form-action 'none'; base-uri 'none'"><title>Black Flag: Stormwake</title><style>'''+css+'''</style></head><body><main id="swLocked"><span class="eyebrow">FUN · Separate Admiral Program</span><h1>Black Flag: Stormwake</h1><p>Open Stormwake through Black Flag's authenticated Admiral Programs entrance. Direct file access does not start a game session.</p><p>Solo 3D first playable. No business data, community invitations, or cloud saves.</p></main><script>window.STORMWAKE_LEGACY_HTML='''+legacy+';\n'+js+'''</script></body></html>'''
(r/'stormwake_player.html').write_text(html)
print('Stormwake compiled:',len(html.encode()),'bytes; inline original renderer and legacy; no remote runtime.')
