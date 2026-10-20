from pathlib import Path
import sys
r=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parent
css=(r/'fun_player.css').read_text();js=(r/'fun_core.js').read_text()+'\n'+(r/'fun_player.js').read_text()
assert '</script' not in js.lower()
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>FUN — first solo draft</title><style>'''+css+'''</style></head><body><main class="locked"><span class="small">Separate Admiral program</span><h1>FUN</h1><p>Open this first draft through Black Flag’s verified Admiral Programs entrance. Invitations and community play are not enabled.</p><small>Fictional adventure. No business data.</small></main><script>'''+js+'''</script></body></html>'''
(r/'fun_player.html').write_text(html)
