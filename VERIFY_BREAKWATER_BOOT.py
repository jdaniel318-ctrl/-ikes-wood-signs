"""Actual index atomic boot and production model guard, isolated offline Chromium.

Usage: PYTHONPATH=/tmp/blacktide-python BLACKFLAG_CHROMIUM=/path/to/chromium \
       python VERIFY_BREAKWATER_BOOT.py RELEASE_DIR OUTPUT_DIR

Run after final runtime hashes have been refreshed. Every HTTPS response is served
from the flat release snapshot through page.route; all other network is blocked.
Each case uses a fresh browser context with no user/session/storage seed. The real
loader's no-service-worker branch is exercised by removing that browser capability
before navigation. This is not service-worker, hosted, authenticated or Safari proof.
The stale model-declaration case boots the actual document, then runs the unchanged
production KeelGuard block with browser fetch and WebCrypto: index itself does not
check model declaration policy, and this test does not claim otherwise.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import json
import mimetypes
import os
import re
import sys

from playwright.sync_api import sync_playwright


BUILD = '8.8.20.47'
SEAL = 'breakwater-882047'
ORIGIN = 'https://breakwater.test'
MODELS = ('FLEET_DOCTRINE_REGISTRY.json', 'GOLDEN_VOYAGES.json',
          'FLEET_COMMAND_MODEL.json', 'ADMIRAL_ENTITLEMENT_STATE_MODEL.json')


def main():
    root = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    out.mkdir(parents=True, exist_ok=True)
    files = {p.name: p.read_bytes() for p in root.iterdir() if p.is_file()}
    manifest = json.loads(files['DEPLOYMENT_MANIFEST.json'])
    assert manifest['build'] == BUILD and manifest['release_seal'] == SEAL
    app = files['app.js'].decode('utf-8')
    guard_match = re.search(r'  const KEELGUARD_MODELS=[\s\S]*?(?=  function keelGuardModelFailure)', app)
    assert guard_match, 'Exact production KeelGuard block was not found'
    guard = guard_match.group(0)
    index = files['index.html'].decode('utf-8')
    executed_match = re.search(r"for\(const path of (\[[^\n]+\])\)\{\s*await new Promise", index)
    assert executed_match, 'Actual loader executable dependency list was not found'
    expected_scripts = re.findall(r"'([^']+)'", executed_match.group(1))
    results = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=os.environ.get('BLACKFLAG_CHROMIUM', '/usr/bin/chromium'),
            headless=True, args=['--no-sandbox'])

        def case(name, overrides=None, hold_fragment=None, stale_models=False):
            context = browser.new_context(viewport={'width': 1280, 'height': 900}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(20000)
            served, blocked, errors = set(), [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            row = {'name': name, 'pass': False}
            bodies = files | (overrides or {})

            def route(request):
                parsed = urlsplit(request.request.url)
                path = unquote(parsed.path).lstrip('/') or 'index.html'
                if (parsed.scheme == 'https' and parsed.netloc == 'breakwater.test'
                        and request.request.method == 'GET' and '/' not in path and path in bodies):
                    served.add(path)
                    content_type = mimetypes.guess_type(path)[0] or 'application/octet-stream'
                    if path.endswith('.js'):
                        content_type = 'text/javascript'
                    request.fulfill(status=200, content_type=content_type, body=bodies[path])
                else:
                    # Never log request queries, headers, bodies or credentials.
                    blocked.append({'origin': parsed.scheme + '://' + parsed.netloc,
                                    'path': parsed.path, 'method': request.request.method})
                    request.abort()

            page.route('**/*', route)
            page.add_init_script("""(() => {
              delete Navigator.prototype.serviceWorker;
              window.__breakwaterBootEvents = [];
              window.addEventListener('darksky:release-seal-clear', e => {
                window.__breakwaterBootEvents.push({build:e.detail.build,seal:e.detail.seal});
              });
            })();""")
            try:
                page.goto(ORIGIN + '/index.html', wait_until='domcontentloaded')
                assert page.evaluate("!('serviceWorker' in navigator)"), 'No-worker capability setup failed'
                page.wait_for_function("['clear','hold'].includes(window.__darkSkyReleaseGateState)")
                state = page.evaluate("window.__darkSkyReleaseGateState")
                scripts = page.evaluate("Array.from(document.querySelectorAll('script[data-release-seal]')).map(s=>s.dataset.releaseSeal)")
                if hold_fragment:
                    assert state == 'hold', 'Altered release escaped the actual atomic loader hold'
                    text = page.locator('.ds-release-hold').inner_text()
                    assert hold_fragment in text, 'Unexpected hold reason: ' + text[:500]
                    assert scripts == [], 'Atomic failure executed runtime scripts'
                    assert page.evaluate('window.__breakwaterBootEvents.length') == 0
                    row['hold_reason'] = hold_fragment
                else:
                    assert state == 'clear', 'Coherent release held: ' + page.locator('body').inner_text()[:500]
                    assert scripts == [SEAL] * len(expected_scripts), 'Incomplete actual executable sequence'
                    assert set(expected_scripts) <= served
                    assert page.evaluate('window.__breakwaterBootEvents') == [{'build': BUILD, 'seal': SEAL}]
                    integrity = page.evaluate('window.__darkSkyKeelGuardRuntimeIntegrity')
                    assert integrity['build'] == BUILD and integrity['seal'] == SEAL
                    assert not page.locator('.ds-release-hold').count()
                    # The exact functions run in a separate lexical scope after the actual
                    # boot, using real browser fetch/crypto and the routed actual bytes.
                    bundle = page.evaluate('async () => { const BUILD_VERSION=' + json.dumps(BUILD)
                                           + ';\n' + guard + '\nreturn await keelGuardLoadModels(); }')
                    for model in MODELS:
                        evidence = bundle['evidence'][model]
                        if stale_models:
                            assert bundle['models'][model] is None and evidence['ok'] is False
                            assert 'Current-build model checksum declaration missing' in ' '.join(evidence['reasons'])
                        else:
                            assert evidence['ok'] is True, model + ': ' + str(evidence['reasons'])
                            assert bundle['models'][model]['build'] == BUILD
                    row.update(executed_runtime_scripts=len(scripts), runtime_files_verified=integrity['files'],
                               model_guard='rejected-stale-declarations' if stale_models else 'accepted-current-models')
                assert not errors, 'Uncaught browser errors: ' + str(errors)
                row['pass'] = True
            except Exception as error:
                row['error'] = str(error)
                row['page_errors'] = errors
            finally:
                row['served_local_files'] = sorted(served)
                row['blocked_requests'] = blocked
                results.append(row)
                context.close()
                print(json.dumps({'name': name, 'pass': row['pass'], **({'error': row['error']} if 'error' in row else {})}), flush=True)

        case('coherent actual .47 index executes complete runtime and accepts current models')
        case('altered required runtime body fails before execution',
             {'input_hygiene.js': files['input_hygiene.js'] + b'\n/* isolated integrity mutation */\n'},
             'Runtime checksum mismatch: input_hygiene.js')
        wrong_hash = json.loads(files['DEPLOYMENT_MANIFEST.json'])
        wrong_hash['runtime_integrity']['files']['input_hygiene.js'] = '0' * 64
        case('mismatched required runtime hash declaration fails before execution',
             {'DEPLOYMENT_MANIFEST.json': json.dumps(wrong_hash).encode()},
             'Runtime checksum mismatch: input_hygiene.js')
        stale = json.loads(files['DEPLOYMENT_MANIFEST.json'])
        for model in MODELS:
            assert stale['model_integrity']['files'][model]['sha256'] == hashlib.sha256(files[model]).hexdigest()
            stale['model_integrity']['files'][model]['build'] = '8.8.20.40'
        case('real boot followed by production KeelGuard rejects reproduced stale model declarations',
             {'DEPLOYMENT_MANIFEST.json': json.dumps(stale).encode()}, stale_models=True)
        browser.close()

    report = {'scope': 'Actual index and routed release bytes in isolated Chromium; no-service-worker branch. '
                       'No live network, existing user storage, authentication, service-worker or native-device proof.',
              'build': BUILD, 'seal': SEAL, 'source_sha256': {name: hashlib.sha256(body).hexdigest() for name, body in files.items()}, 'results': results,
              'passed': sum(row['pass'] for row in results),
              'failed': sum(not row['pass'] for row in results)}
    (out / 'results.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'passed': report['passed'], 'failed': report['failed']}))
    return int(bool(report['failed']))


if __name__ == '__main__':
    sys.exit(main())
