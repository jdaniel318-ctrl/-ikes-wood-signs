"""Read-only Carvewright release/source verification against exact complete .53.
Usage: python -B VERIFY_CARVEWRIGHT_RELEASE.py [RELEASE_DIR] [BASELINE_DIR]
Passing is offline integrity/source evidence, not native Safari or machine acceptance.
"""
from pathlib import Path
import argparse
import json
import re
import sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, CURRENT_MODELS, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full
BUILD, SEAL, NAME = '8.8.20.54', 'carvewright-882054', 'Carvewright'
BASE_BUILD, BASE_SEAL, BASE_COUNT = '8.8.20.53', 'quartermaster-882053', 343
BASE_DIGEST = '25e0df92753fcd1b7519ed6b6df341b25186cc00c9522dd2d1b1373f2da86a13'
ASSETS = ('carve_fonts.js', 'carve_core.js', 'carve_store.js', 'carve_studio.js', 'carve_studio.css', 'carve-studio.html', 'carve_font_license.txt')
RUNTIME_SUFFIXES = {'.js', '.html', '.css'}
STATUS = 'OFFLINE_RELEASE_CHECKS_PASSED'
INTEGRATION_CHANGES = [{'file': 'quartermaster.js', 'before': '<p class="qm-studio-note">Each business keeps its own records. You decide when to share a PDF; supplier orders, payments and ledger entries are separate.</p>`;\n }', 'after': '<p class="qm-studio-note">Each business keeps its own records. You decide when to share a PDF; supplier orders, payments and ledger entries are separate.</p>`;\n  /* CARVEWRIGHT_ENTRY_START */\n  if(selected===\'ikes-wood-signs\'){const b=document.createElement(\'button\');b.id=\'qmCarveOpen\';b.type=\'button\';b.className=\'qm-workspace-link qm-carve-entry\';b.innerHTML=\'<span class="qm-link-icon">\'+icon(\'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>\')+\'</span><span><strong>Open Carve Studio</strong><small>Vector lettering, saved layouts &amp; SVG artwork</small></span>\'+arrow;n.querySelector(\'.qm-workspace-links\').prepend(b);}\n  /* CARVEWRIGHT_ENTRY_END */\n }'}, {'file': 'quartermaster.js', 'before': " else if(b.id==='qmSampleCatalog')await loadExamples(valid);", 'after': " /* CARVEWRIGHT_OPEN_START */\n else if(b.id==='qmCarveOpen'){\n  if(selected!=='ikes-wood-signs'||!g.IkeCarveStudio)throw Error('Carve Studio is available in the Ike’s workspace with the complete Carvewright release.');\n  const heldRoot=root,heldEpoch=epoch,heldBusiness=selected,scope={accountId:actor.accountId,backend:actor.backend,environment:actor.environment,site:actor.site,businessId:selected};\n  g.IkeCarveStudio.open({scope,parent:root,referenceOnly:false,guard:()=>{if(root!==heldRoot||epoch!==heldEpoch||selected!==heldBusiness)throw Object.assign(Error('The business workspace changed.'),{code:'AUTH'});return guard();}});\n }\n /* CARVEWRIGHT_OPEN_END */\n else if(b.id==='qmSampleCatalog')await loadExamples(valid);"}, {'file': 'index.html', 'before': "'quartermaster_pdf.js','quartermaster.js','quartermaster.css'", 'after': "'quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js','quartermaster.css','carve_studio.css'"}, {'file': 'index.html', 'before': "+'\\n'+fetched['quartermaster.css'];document.head.appendChild(css)", 'after': "+'\\n'+fetched['quartermaster.css']+'\\n'+fetched['carve_studio.css'];document.head.appendChild(css)"}, {'file': 'index.html', 'before': "'quartermaster_pdf.js','quartermaster.js']", 'after': "'quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js']"}]


def files(root):
    entries = list(Path(root).iterdir())
    require(all(p.is_file() and not p.is_symlink() for p in entries), 'Expected flat regular release files: ' + str(root))
    return {p.name: p.read_bytes() for p in entries}


def normalize(text):
    return text.replace(BUILD, BASE_BUILD).replace(SEAL, BASE_SEAL).replace(BASE_BUILD + ' • CARVEWRIGHT', BASE_BUILD + ' • QUARTERMASTER')


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


def verify(root, baseline):
    current, base = files(root), files(baseline)
    require(len(base) == BASE_COUNT and content_digest(base) == BASE_DIGEST, 'Exact immutable complete 343-file .53 baseline required')
    previous, result = verify_full(base), verify_full(current)
    require(previous['build'] == BASE_BUILD and previous['seal'] == BASE_SEAL, 'Wrong baseline identity')
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
    compared = 0
    for name in sorted(base):
        if Path(name).suffix not in RUNTIME_SUFFIXES:
            continue
        actual, old = normalize(current[name].decode()), base[name].decode()
        for edit in reversed(INTEGRATION_CHANGES):
            if edit['file'] == name:
                after = normalize(edit['after'])
                require(actual.count(after) == 1, 'Integration substitution ambiguous or changed: ' + name)
                actual = actual.replace(after, edit['before'], 1)
        if name == 'fun_program.js':
            def mask(text):
                return re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}", r'\1PLAYER_HASH', text)
            actual, old = mask(actual), mask(old)
        require(actual == old, 'Existing runtime changed outside exact identity/integration: ' + name)
        compared += 1
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
    require(required == old_required + list(ASSETS), 'Required runtime inventory differs from exact additive assets')
    runtime, old_runtime = manifest['runtime_integrity'], old_manifest['runtime_integrity']
    require(set(runtime['files']) == set(old_runtime['files']) | set(ASSETS), 'Runtime integrity inventory differs')
    require({k:v for k,v in runtime.items() if k != 'files'} == {k:v for k,v in old_runtime.items() if k != 'files'}, 'Runtime integrity policy changed')
    for name, entry in manifest['lazy_program_assets'].items():
        old_entry = old_manifest['lazy_program_assets'][name]
        require(entry['sha256'] == sha(current[name]) and entry['bytes'] == len(current[name]), 'Lazy asset digest/size differs: ' + name)
        require(dict(entry, sha256=old_entry['sha256'], bytes=old_entry['bytes']) == old_entry, 'Lazy asset semantics changed')
    require(set(manifest['lazy_program_assets']) == set(old_manifest['lazy_program_assets']), 'Lazy inventory changed')
    mutable = {'build','version','release_name','releaseName','release_seal','release_focus','release_note','required_runtime_files','runtime_integrity','model_integrity','lazy_program_assets','carvewright'}
    require(set(manifest) == set(old_manifest) | {'carvewright'}, 'Unexpected manifest fields')
    for key in set(old_manifest) - mutable:
        require(manifest[key] == old_manifest[key], 'Historical manifest metadata changed: ' + key)
    cw = manifest['carvewright']
    require(cw['build'] == BUILD and cw['base'] == BASE_BUILD and cw['base_file_count'] == BASE_COUNT and cw['assets'] == list(ASSETS), 'Carvewright manifest identity/assets wrong')
    for key in ('machine_output','live_service_actions','data_migration_required','customer_routes_changed','existing_document_records_changed'):
        require(cw[key] is False, 'Unsupported Carvewright scope claim: ' + key)
    gate, evidence = parse_json(current, 'RELEASE_GATE.json'), parse_json(current, 'CARVEWRIGHT_EVIDENCE.json')
    require(gate['build'] == BUILD and gate['release'] == NAME and gate['pass'] is True and gate['verification_status'] == STATUS and gate['evidence_file'] == 'CARVEWRIGHT_EVIDENCE.json', 'Wrong or pending current gate')
    require(gate['prior_release_evidence'] == parse_json(base, 'RELEASE_GATE.json'), 'Prior release gate/evidence changed')
    require(evidence['build'] == BUILD and evidence['baseline'] == BASE_BUILD and evidence['pass'] is True, 'Wrong or failing current evidence')
    for item in (gate, evidence):
        require(item['native_safari_acceptance'] == 'not claimed' and item['machine_production_acceptance'] == 'not claimed', 'Unobserved native or machine acceptance claimed')
    checks = evidence['checks']
    require(isinstance(checks, list) and bool(checks) and all(isinstance(c,dict) and c.get('status') == 'passed' and c.get('name') for c in checks), 'Fresh recorded checks must all pass')
    evidence_count, sources = source_maps(evidence, current)
    require(set(ASSETS) | {'index.html','quartermaster.js','fun_program.js','stormwake_player.html'} <= sources, 'Fresh evidence omits changed runtime inputs')
    contract = parse_json(current, 'PATCH_CONTRACT.json')
    require(contract['target_build'] == BUILD and contract['target_seal'] == SEAL and contract['requires_deletions'] is False and contract['max_upload_files'] == 85 and contract['database_actions'] == 'none', 'Wrong patch contract')
    supported = contract['supported_bases']
    require(len(supported) == 1 and supported[0]['build'] == BASE_BUILD and supported[0]['file_count'] == BASE_COUNT and supported[0]['content_digest_algorithm'] == CONTENT_DIGEST_ALGORITHM and supported[0]['content_sha256'] == BASE_DIGEST, 'Wrong exact baseline contract')
    mutable_files = set(LEDGERS) | set(CURRENT_MODELS) | {'BUILD_STORMWAKE_PLAYER.py','STORMWAKE_PLAYER_BUILD.json','DEPLOYMENT_MANIFEST.json','PATCH_CONTRACT.json','RELEASE_SEAL.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','manifest.webmanifest','UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt'}
    history = 0
    for name in set(base) - mutable_files:
        if Path(name).suffix in RUNTIME_SUFFIXES:
            continue
        require(current[name] == base[name], 'Existing historical/reference file changed: ' + name)
        history += 1
    for name in ('UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt','CARVEWRIGHT_GUIDE.md','CARVEWRIGHT_REFERENCE_SOURCES.md'):
        require(name in current and BUILD.encode() in current[name] and NAME.encode() in current[name], 'Current documentation missing identity: ' + name)
    patch = {n:b for n,b in current.items() if base.get(n) != b}
    require(0 < len(patch) <= 85 and base | patch == current, 'Exact reconstruction/file budget failed')
    return {'pass':True, **result, 'release':NAME, 'baseline_build':BASE_BUILD, 'baseline_files':BASE_COUNT, 'baseline_content_sha256':BASE_DIGEST,'existing_runtime_files_compared':compared,'exact_integration_substitutions':len(INTEGRATION_CHANGES),'retained_models':retained,'current_models':len(models),'historical_files_preserved':history,'evidence_hashes_checked':evidence_count,'upload_files':len(patch),'byte_exact_reconstruction':True,'deleted_files':0,'native_safari_acceptance':'not claimed','machine_production_acceptance':'not claimed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('release', nargs='?', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('baseline', nargs='?', type=Path, default=Path(__file__).resolve().parents[2] / 'quartermaster-studio/release')
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.release,args.baseline),indent=2)); return 0
    except (PackageError,OSError,KeyError,TypeError,ValueError) as exc:
        print(json.dumps({'pass':False,'error':str(exc)},indent=2)); return 1
if __name__ == '__main__':
    sys.exit(main())
