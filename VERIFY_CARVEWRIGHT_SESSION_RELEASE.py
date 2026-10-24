"""Read-only Carvewright release/source verification against exact immutable complete .55/.54/.53.
Usage: python -B VERIFY_CARVEWRIGHT_SESSION_RELEASE.py [RELEASE_DIR] [BASELINE_DIR]
Passing is offline integrity/source evidence, not native Safari or machine acceptance.
"""
from pathlib import Path
import argparse
import json
import re
import sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, CURRENT_MODELS, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full, load_archive
BUILD, SEAL, NAME = '8.8.20.56', 'carvewright-882056', 'Carvewright'
BASE_BUILD, BASE_SEAL, BASE_COUNT = '8.8.20.55', 'carvewright-882055', 366
BASE_DIGEST = 'c2299990eb726302008b589b437a63c12860dc2b0ba8a4afbf703b2b44056333'
BASES = (
    {'build':BASE_BUILD,'seal':BASE_SEAL,'file_count':BASE_COUNT,'content_sha256':BASE_DIGEST,'directory':'carvewright-fleet','archive':'DarkSky882055-Carvewright-FullBackup.zip','archive_sha256':'8a119104e873baafad9d1cb818c5b9316fb04253ddd9da902baea02f87d1a523'},
    {'build':'8.8.20.54','seal':'carvewright-882054','file_count':355,'content_sha256':'a763ee9c966e0892f07a4f00a3343a59dd9d783183fb5109a9dd16306769562a','directory':'ike-carve-studio','archive':'DarkSky882054-Carvewright-FullBackup.zip','archive_sha256':'d459ddaffc2213a99dca13820e7c6bda614b40888d2d5e2dab58c0b68a79e689'},
    {'build':'8.8.20.53','seal':'quartermaster-882053','file_count':343,'content_sha256':'25e0df92753fcd1b7519ed6b6df341b25186cc00c9522dd2d1b1373f2da86a13','directory':'quartermaster-studio','archive':'DarkSky882053-Quartermaster-FullBackup.zip','archive_sha256':'12565397fbba3d6027609e4ec7684f6724fde2ea8955de2fea9d7fa26894a5fa'},
)
ASSETS = ('carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright_fleet.js','carvewright.css','carvewright.html')
STANDALONE = ('carve_fonts.js','carve_core.js','carve_store.js','carve_font_license.txt','carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright.css','carvewright.html','CARVEWRIGHT_SESSION_GUIDE.md','CARVEWRIGHT_FLEET_SOURCES.md')
RUNTIME_SUFFIXES = {'.js', '.html', '.css'}
STATUS = 'OFFLINE_RELEASE_CHECKS_PASSED'
# Exact independently reviewed session repair snapshot; approved by the controller.
# Original qa/session-changes.json SHA-256: 1b9d2f7214390f9436e2df80ce85ac8b2cfc848845e78c01f65b16b92a90b4e4
# Never load a caller supplied mutation allowlist or compare against mutable local git state.
INTEGRATION_REVIEWED = True
INTEGRATION_SNAPSHOT_SHA256 = '1b9d2f7214390f9436e2df80ce85ac8b2cfc848845e78c01f65b16b92a90b4e4'
INTEGRATION_CHANGES = [{'file': 'carvewright_app.js', 'before': "for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable','darksky:admiral-session-changed'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});", 'after': "for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});\n g.addEventListener('darksky:admiral-session-changed',()=>{if(current&&!current.options.referenceOnly&&!alive(current))close(true);});"}, {'file': 'carvewright_studio.js', 'before': "for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable','darksky:admiral-session-changed'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});", 'after': "for(const event of ['darksky:admiral-session-ended','darksky:admiral-session-unavailable'])g.addEventListener(event,()=>{if(current&&!current.options.referenceOnly)close(true);});\n  g.addEventListener('darksky:admiral-session-changed',()=>{if(current&&!current.options.referenceOnly&&!alive(current))close(true);});"}, {'file': 'carvewright_fleet.js', 'before': 'const held={generation:++generation,deck,mark:mark(ctx)};pending=held;monitor();', 'after': 'const held={generation:++generation,deck,mark:mark(ctx),activity:Object.freeze({userId:ctx.accountId,startedAt:ctx.startedAt})};pending=held;monitor();'}, {'file': 'carvewright_fleet.js', 'before': ' g.CarvewrightFleet=Object.freeze({build:BUILD,open,requestOpen,close});', 'after': " function activity(event){\n  const held=active;\n  if(!event.isTrusted||!held||active!==held||!matches(held)||!g.CarvewrightApp?.isOpen?.())return;\n  const target=event.target instanceof Element?event.target:null;\n  const root=target?.closest('#carvewrightApp, #carvewrightStudio');\n  if(!root?.isConnected||!root.open||root!==$(root.id))return;\n  if(root.id==='carvewrightStudio'&&!g.CarvewrightStudio?.isOpen?.())return;\n  g.DarkSkyAdmiralSession?.noteProgramActivity?.(held.activity);\n }\n for(const event of ['pointerdown','keydown','wheel','touchstart'])document.addEventListener(event,activity,{capture:true,passive:true});\n g.CarvewrightFleet=Object.freeze({build:BUILD,open,requestOpen,close});"}]
SESSION_FILES = {'carvewright_app.js','carvewright_studio.js','carvewright_fleet.js'}


def require_review():
    require(INTEGRATION_REVIEWED and bool(INTEGRATION_CHANGES), 'Reviewed embedded session snapshot required')
    require({e['file'] for e in INTEGRATION_CHANGES} == SESSION_FILES, 'Reviewed snapshot must cover exactly the three session runtime files')
    require(all(set(e) == {'file','before','after'} and isinstance(e['before'],str) and isinstance(e['after'],str) and e['before'] != e['after'] for e in INTEGRATION_CHANGES), 'Invalid reviewed session substitution')


def exact_baselines(baseline):
    baseline = Path(baseline).resolve()
    siblings = baseline.parents[1]
    originals = []
    for identity in BASES:
        directory = baseline if identity is BASES[0] else siblings / identity['directory'] / 'release'
        archive = siblings / identity['directory'] / 'qa/archives' / identity['archive']
        original = files(directory)
        checked = verify_full(original)
        require(checked['build'] == identity['build'] and checked['seal'] == identity['seal'] and len(original) == identity['file_count'] and content_digest(original) == identity['content_sha256'], 'Exact immutable baseline required: ' + identity['build'])
        require(sha(archive.read_bytes()) == identity['archive_sha256'], 'Original archive SHA differs: ' + identity['build'])
        require(load_archive(archive) == original, 'Original archive bytes differ: ' + identity['build'])
        originals.append((directory,archive,original))
    return originals


def files(root):
    entries = list(Path(root).iterdir())
    require(all(p.is_file() and not p.is_symlink() for p in entries), 'Expected flat regular release files: ' + str(root))
    return {p.name: p.read_bytes() for p in entries}


def normalize(text):
    return text.replace(BUILD, BASE_BUILD).replace(SEAL, BASE_SEAL)


def source_maps(value, current):
    checked, sources = 0, set()
    if isinstance(value, dict):
        for key, child in value.items():
            if key in ('source_sha256', 'source_hashes'):
                require(isinstance(child, dict) and bool(child), 'Missing evidence source hashes')
                for name, digest in child.items():
                    require(name in current and Path(name).name == name, 'Invalid evidence source: ' + str(name))
                    require(sha(current[name]) == digest, 'Stale evidence source: ' + name)
                    sources.add(name)
                    checked += 1
            else:
                n, s = source_maps(child, current); checked += n; sources |= s
    elif isinstance(value, list):
        for child in value:
            n, s = source_maps(child, current); checked += n; sources |= s
    return checked, sources


def validate_supported_bases(supported):
    require(isinstance(supported, list) and len(supported) == len(BASES), 'Wrong number of supported exact baselines')
    for declared, expected in zip(supported, BASES):
        require(isinstance(declared, dict) and all(declared.get(k) == expected[k] for k in ('build','file_count','content_sha256')) and declared.get('content_digest_algorithm') == CONTENT_DIGEST_ALGORITHM, 'Wrong exact baseline contract')


def check_reconstruction(bases, patch, target):
    require(0 < len(patch) <= 85, 'Upload file budget exceeded')
    require(set(patch) <= set(target) and all(target[n] == b for n,b in patch.items()), 'Patch contains wrong or unexpected target bytes')
    for base in bases:
        require(set(base) <= set(target), 'Baseline files deleted')
        require(base | patch == target, 'Cumulative patch does not reconstruct exact target from every base')


def cumulative_patch(bases, target):
    require(bool(bases), 'No exact baselines supplied')
    patch = {name:body for name,body in target.items() if any(base.get(name) != body for base in bases)}
    check_reconstruction(bases, patch, target)
    return patch


def verify_existing_runtime(current, base):
    require_review()
    for name in ('carve_fonts.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','carve_font_license.txt'):
        require(current[name] == base[name], 'Preserved font/geometry/store bytes changed: ' + name)
    compared = 0
    for name in sorted(base):
        if Path(name).suffix not in RUNTIME_SUFFIXES:
            continue
        actual, old = normalize(current[name].decode()), base[name].decode()
        # The trusted exact .55 bytes define each edit location. Forward application
        # permits exact block removal without guessing where to reinsert empty text.
        for edit in INTEGRATION_CHANGES:
            if edit['file'] == name:
                before, after = normalize(edit['before']), normalize(edit['after'])
                require(bool(before) and old.count(before) == 1, 'Integration baseline substitution ambiguous or changed: ' + name)
                old = old.replace(before, after, 1)
        if name == 'fun_program.js':
            def mask(text):
                return re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}", r'\1PLAYER_HASH', text)
            actual, old = mask(actual), mask(old)
        require(actual == old, 'Existing runtime changed outside exact identity/integration: ' + name)
        compared += 1
    return compared


def verify(root, baseline):
    require_review()
    current = files(root)
    originals = exact_baselines(baseline)
    base = originals[0][2]
    previous, result = verify_full(base), verify_full(current)
    require(result['build'] == BUILD and result['seal'] == SEAL, 'Wrong target identity')
    require(set(base) <= set(current), 'Existing baseline files removed')
    require(set(ASSETS) <= set(current), 'Bundled Carve Studio assets missing')
    manifest, old_manifest = parse_json(current, 'DEPLOYMENT_MANIFEST.json'), parse_json(base, 'DEPLOYMENT_MANIFEST.json')
    require(manifest['release_name'] == NAME and manifest['releaseName'] == NAME and manifest['version'] == BUILD, 'Wrong target release name')
    require((BUILD + ' • CARVEWRIGHT').encode() in current['index.html'], 'Current visible heading missing')
    seal = parse_json(current, 'RELEASE_SEAL.json')
    prior_seal = parse_json(base, 'RELEASE_SEAL.json')
    restored_seal = dict(seal, build=BASE_BUILD, seal=BASE_SEAL)
    for key in ('release', 'release_name', 'name', 'releaseName'):
        require(seal[key] == NAME, 'Wrong seal release name')
        restored_seal[key] = prior_seal[key]
    require(restored_seal == prior_seal, 'Seal semantics changed')
    require(normalize(current['manifest.webmanifest'].decode()) == base['manifest.webmanifest'].decode(), 'Webmanifest behavior changed')
    expected_runtime = {n for n in base if Path(n).suffix in RUNTIME_SUFFIXES} | {n for n in ASSETS if Path(n).suffix in RUNTIME_SUFFIXES}
    require({n for n in current if Path(n).suffix in RUNTIME_SUFFIXES} == expected_runtime, 'Unexpected runtime inventory')
    compared = verify_existing_runtime(current, base)
    declarations, old_declarations = manifest['model_integrity']['files'], old_manifest['model_integrity']['files']
    require(set(declarations) == set(old_declarations), 'Model inventory changed')
    require({k:v for k,v in manifest['model_integrity'].items() if k != 'files'} == {k:v for k,v in old_manifest['model_integrity'].items() if k != 'files'}, 'Model integrity policy changed')
    retained, models = 0, set()
    for name, entry in declarations.items():
        prior = old_declarations[name]
        require(entry['policy'] == prior['policy'], 'Model version policy changed: ' + name)
        if entry['policy'] == 'retained-versioned-reference':
            require(current[name] == base[name] and entry == prior, 'Historical model changed: ' + name)
            retained += 1
        else:
            model, old_model = parse_json(current, name), parse_json(base, name)
            require(model['build'] == BUILD and dict(model, build=BASE_BUILD) == old_model, 'Current model semantics changed: ' + name)
            require(dict(entry, build=prior['build'], sha256=prior['sha256']) == prior, 'Current model declaration changed: ' + name)
            models.add(name)
    require(retained == 39 and models == set(CURRENT_MODELS), 'Expected four current and 39 retained models')
    require(normalize(current['BUILD_STORMWAKE_PLAYER.py'].decode()) == base['BUILD_STORMWAKE_PLAYER.py'].decode(), 'Player compiler behavior changed')
    report, prior = parse_json(current, 'STORMWAKE_PLAYER_BUILD.json'), parse_json(base, 'STORMWAKE_PLAYER_BUILD.json')
    require(report['build'] == BUILD and report['runtime_network'] is False, 'Wrong player report identity/network')
    require(set(report['inputs_sha256']) == set(prior['inputs_sha256']), 'Player input inventory changed')
    for name, digest in report['inputs_sha256'].items():
        require(sha(current[name]) == digest, 'Player input hash stale: ' + name)
    player_digest = sha(current['stormwake_player.html'])
    require(report['player'] == {'bytes':len(current['stormwake_player.html']), 'sha256':player_digest, 'limit_bytes':prior['player']['limit_bytes']}, 'Compiled player report differs')
    require(report['player']['bytes'] <= report['player']['limit_bytes'], 'Compiled player size limit exceeded')
    require({k:v for k,v in report.items() if k not in ('build','inputs_sha256','player')} == {k:v for k,v in prior.items() if k not in ('build','inputs_sha256','player')}, 'Player vendor/art contract changed')
    require(re.findall(r"\bSTORMWAKE_SHA\s*=\s*['\"]([a-f0-9]{64})['\"]", current['fun_program.js'].decode()) == [player_digest], 'Host player SHA must match actual rebuilt player')
    required, old_required = manifest['required_runtime_files'], old_manifest['required_runtime_files']
    require(required == old_required, 'Required runtime inventory differs from exact additive assets')
    runtime, old_runtime = manifest['runtime_integrity'], old_manifest['runtime_integrity']
    require(set(runtime['files']) == set(old_runtime['files']), 'Runtime integrity inventory differs')
    require({k:v for k,v in runtime.items() if k != 'files'} == {k:v for k,v in old_runtime.items() if k != 'files'}, 'Runtime integrity policy changed')
    for name, entry in manifest['lazy_program_assets'].items():
        old_entry = old_manifest['lazy_program_assets'][name]
        require(entry['sha256'] == sha(current[name]) and entry['bytes'] == len(current[name]), 'Lazy asset digest/size differs: ' + name)
        require(dict(entry, sha256=old_entry['sha256'], bytes=old_entry['bytes']) == old_entry, 'Lazy asset semantics changed')
    require(set(manifest['lazy_program_assets']) == set(old_manifest['lazy_program_assets']), 'Lazy inventory changed')
    mutable = {'build','version','release_name','releaseName','release_seal','release_focus','release_note','required_runtime_files','runtime_integrity','model_integrity','lazy_program_assets','carvewright_session'}
    require(set(manifest) == set(old_manifest) | {'carvewright_session'}, 'Unexpected manifest fields')
    for key in set(old_manifest) - mutable:
        require(manifest[key] == old_manifest[key], 'Historical manifest metadata changed: ' + key)
    require(manifest['carvewright'] == old_manifest['carvewright'], 'Historical .54 Carvewright metadata changed')
    require(manifest['carvewright_fleet'] == old_manifest['carvewright_fleet'], 'Historical .55 fleet metadata changed')
    cw = manifest['carvewright_session']
    require(set(cw) == {'build','base','base_file_count','changed_runtime','idle_minutes','maximum_minutes','server_verification_changed','reference_workspace_independent','machine_output','live_service_actions','data_migration_required','customer_routes_changed','existing_document_records_changed'}, 'Unexpected session metadata fields')
    require(cw['build'] == BUILD and cw['base'] == BASE_BUILD and cw['base_file_count'] == BASE_COUNT and cw['changed_runtime'] == sorted(SESSION_FILES), 'Carvewright manifest identity/assets wrong')
    require(cw['idle_minutes'] == 15 and cw['maximum_minutes'] == 60 and cw['server_verification_changed'] is False and cw['reference_workspace_independent'] is True, 'Session authority/timer/reference policy changed')
    for key in ('machine_output','live_service_actions','data_migration_required','customer_routes_changed','existing_document_records_changed'):
        require(cw[key] is False, 'Unsupported Carvewright scope claim: ' + key)
    gate, evidence = parse_json(current, 'RELEASE_GATE.json'), parse_json(current, 'CARVEWRIGHT_SESSION_EVIDENCE.json')
    require(gate['build'] == BUILD and gate['release'] == NAME and gate['pass'] is True and gate['verification_status'] == STATUS and gate['evidence_file'] == 'CARVEWRIGHT_SESSION_EVIDENCE.json', 'Wrong or pending current gate')
    require(gate['prior_release_evidence'] == parse_json(base, 'RELEASE_GATE.json'), 'Prior release gate/evidence changed')
    require(evidence['build'] == BUILD and evidence['baseline'] == BASE_BUILD and evidence['pass'] is True, 'Wrong or failing current evidence')
    for item in (gate, evidence):
        require(item['native_safari_acceptance'] == 'not claimed' and item['native_firefox_acceptance'] == 'not claimed' and item['live_commissioning_acceptance'] == 'not claimed' and item['machine_production_acceptance'] == 'not claimed', 'Unobserved native or machine acceptance claimed')
    checks = evidence['checks']
    require(isinstance(checks, list) and bool(checks) and all(isinstance(c,dict) and c.get('status') == 'passed' and c.get('name') for c in checks), 'Fresh recorded checks must all pass')
    evidence_count, sources = source_maps(evidence, current)
    require(SESSION_FILES | {'index.html','fun_program.js','stormwake_player.html'} <= sources, 'Fresh evidence omits changed runtime inputs')
    contract = parse_json(current, 'PATCH_CONTRACT.json')
    require(contract['target_build'] == BUILD and contract['target_seal'] == SEAL and contract['requires_deletions'] is False and contract['max_upload_files'] == 85 and contract['database_actions'] == 'none', 'Wrong patch contract')
    supported = contract['supported_bases']
    validate_supported_bases(supported)
    mutable_files = set(LEDGERS) | set(CURRENT_MODELS) | {'BUILD_STORMWAKE_PLAYER.py','STORMWAKE_PLAYER_BUILD.json','DEPLOYMENT_MANIFEST.json','PATCH_CONTRACT.json','RELEASE_SEAL.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','manifest.webmanifest','UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt'}
    history = 0
    for name in set(base) - mutable_files:
        if Path(name).suffix in RUNTIME_SUFFIXES:
            continue
        require(current[name] == base[name], 'Existing historical/reference file changed: ' + name)
        history += 1
    for name in ('UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt','CARVEWRIGHT_SESSION_GUIDE.md'):
        require(name in current and BUILD.encode() in current[name] and NAME.encode() in current[name], 'Current documentation missing identity: ' + name)
    require(current['UPLOAD_THIS_ONE_BUILD.md'].endswith(base['UPLOAD_THIS_ONE_BUILD.md']), 'Prior upload notes must be preserved verbatim as suffix')
    require(current['BUILD_NOTES.txt'].endswith(base['BUILD_NOTES.txt']), 'Prior build notes must be preserved verbatim as suffix')
    additions = {'VERIFY_CARVEWRIGHT_SESSION_RELEASE.py','CARVEWRIGHT_SESSION_GUIDE.md','CARVEWRIGHT_SESSION_EVIDENCE.json'}
    require(set(current) == set(base) | additions, 'Unexpected added or missing release files')
    require(len(current) == 369, 'Expected exactly 369 release files')
    patch = cumulative_patch([item[2] for item in originals], current)
    require(all(files(directory) == original and sha(archive.read_bytes()) == identity['archive_sha256'] for (directory,archive,original),identity in zip(originals,BASES)) and files(root) == current, 'Verification changed release, baseline or archive bytes')
    return {'pass':True, **result, 'release':NAME, 'baseline_build':BASE_BUILD, 'baseline_files':BASE_COUNT, 'baseline_content_sha256':BASE_DIGEST,'supported_bases':[{k:b[k] for k in ('build','file_count','content_sha256')} for b in BASES],'existing_runtime_files_compared':compared,'exact_integration_substitutions':len(INTEGRATION_CHANGES),'retained_models':retained,'current_models':len(models),'historical_files_preserved':history,'evidence_hashes_checked':evidence_count,'upload_files':len(patch),'byte_exact_reconstruction':True,'deleted_files':0,'native_safari_acceptance':'not claimed','native_firefox_acceptance':'not claimed','live_commissioning_acceptance':'not claimed','machine_production_acceptance':'not claimed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('release', nargs='?', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('baseline', nargs='?', type=Path, default=Path(__file__).resolve().parents[2] / 'carvewright-fleet/release')
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.release,args.baseline),indent=2)); return 0
    except (PackageError,OSError,KeyError,TypeError,ValueError) as exc:
        print(json.dumps({'pass':False,'error':str(exc)},indent=2)); return 1
if __name__ == '__main__':
    sys.exit(main())
