"""Read-only Carvewright release/source verification against exact complete .54 and cumulative .53.
Usage: python -B VERIFY_CARVEWRIGHT_FLEET_RELEASE.py [RELEASE_DIR] [BASELINE_DIR]
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
BUILD, SEAL, NAME = '8.8.20.55', 'carvewright-882055', 'Carvewright'
BASE_BUILD, BASE_SEAL, BASE_COUNT = '8.8.20.54', 'carvewright-882054', 355
BASE_DIGEST = 'a763ee9c966e0892f07a4f00a3343a59dd9d783183fb5109a9dd16306769562a'
BASES = (
    {'build':BASE_BUILD,'seal':BASE_SEAL,'file_count':BASE_COUNT,'content_sha256':BASE_DIGEST,'directory':'ike-carve-studio','archive':'DarkSky882054-Carvewright-FullBackup.zip'},
    {'build':'8.8.20.53','seal':'quartermaster-882053','file_count':343,'content_sha256':'25e0df92753fcd1b7519ed6b6df341b25186cc00c9522dd2d1b1373f2da86a13','directory':'quartermaster-studio','archive':'DarkSky882053-Quartermaster-FullBackup.zip'},
)
ASSETS = ('carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright_fleet.js','carvewright.css','carvewright.html')
STANDALONE = ('carve_fonts.js','carve_core.js','carve_store.js','carve_font_license.txt','carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright.css','carvewright.html','CARVEWRIGHT_FLEET_GUIDE.md','CARVEWRIGHT_FLEET_SOURCES.md')
RUNTIME_SUFFIXES = {'.js', '.html', '.css'}
STATUS = 'OFFLINE_RELEASE_CHECKS_PASSED'
# Exact snapshot reviewed by the controller; original qa/integration_changes.json SHA-256: 4e94694341e45ee678d7e05c4e82b7091a3def46e54f8ae9544d37af5a679a24
# Never load an arbitrary caller-supplied allowlist in the extracted verifier.
INTEGRATION_REVIEWED = True
INTEGRATION_CHANGES = [{'file': 'quartermaster.js', 'before': '  /* CARVEWRIGHT_ENTRY_START */\n  if(selected===\'ikes-wood-signs\'){const b=document.createElement(\'button\');b.id=\'qmCarveOpen\';b.type=\'button\';b.className=\'qm-workspace-link qm-carve-entry\';b.innerHTML=\'<span class="qm-link-icon">\'+icon(\'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>\')+\'</span><span><strong>Open Carve Studio</strong><small>Vector lettering, saved layouts &amp; SVG artwork</small></span>\'+arrow;n.querySelector(\'.qm-workspace-links\').prepend(b);}\n  /* CARVEWRIGHT_ENTRY_END */\n', 'after': ''}, {'file': 'quartermaster.js', 'before': " /* CARVEWRIGHT_OPEN_START */\n else if(b.id==='qmCarveOpen'){\n  if(selected!=='ikes-wood-signs'||!g.IkeCarveStudio)throw Error('Carve Studio is available in the Ike’s workspace with the complete Carvewright release.');\n  const heldRoot=root,heldEpoch=epoch,heldBusiness=selected,scope={accountId:actor.accountId,backend:actor.backend,environment:actor.environment,site:actor.site,businessId:selected};\n  g.IkeCarveStudio.open({scope,parent:root,referenceOnly:false,guard:()=>{if(root!==heldRoot||epoch!==heldEpoch||selected!==heldBusiness)throw Object.assign(Error('The business workspace changed.'),{code:'AUTH'});return guard();}});\n }\n /* CARVEWRIGHT_OPEN_END */\n", 'after': ''}, {'file': 'index.html', 'before': '        <div class="qm-engine-entry"><div><strong>ADMIRAL BUSINESS SUPPORT</strong><small>Business catalogs, material quantities, quotes and invoices.</small><small id="qmEntryStatus" role="status" aria-live="polite"></small></div><button id="quartermasterEngineOpen" type="button">QUOTES &amp; INVOICES</button></div>', 'after': '        <div class="qm-engine-entry"><div><strong>ADMIRAL BUSINESS SUPPORT</strong><small>Business catalogs, material quantities, quotes and invoices.</small><small id="qmEntryStatus" role="status" aria-live="polite"></small></div><button id="quartermasterEngineOpen" type="button">QUOTES &amp; INVOICES</button></div>\n        <div class="qm-engine-entry carvewright-engine-entry"><div><strong>CARVEWRIGHT</strong><small>Independent local vector design workspace · registration pending.</small><small id="carvewrightEntryStatus" role="status" aria-live="polite"></small></div><button id="carvewrightEngineOpen" type="button">OPEN CARVEWRIGHT</button></div>'}, {'file': 'index.html', 'before': "    const snapshotPaths=['input_hygiene.js','fun_core.js','stormwake_core.js','fun_program.js','fun_program.css','fun_player.html','fleet_viewport.js','fleet_viewport.css','headway_contracts.js','woodwright_fit.js','styles.css','simple_books.css','platform_core.js','platform_v4.js','platform_identity.js','fleet_supabase.js','ike_style_registry.js','app.js','captain.js','simple_books.js','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js','quartermaster.css','carve_studio.css'];", 'after': "    const snapshotPaths=['input_hygiene.js','fun_core.js','stormwake_core.js','fun_program.js','fun_program.css','fun_player.html','fleet_viewport.js','fleet_viewport.css','headway_contracts.js','woodwright_fit.js','styles.css','simple_books.css','platform_core.js','platform_v4.js','platform_identity.js','fleet_supabase.js','ike_style_registry.js','app.js','captain.js','simple_books.js','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js','quartermaster.css','carve_studio.css','carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright_fleet.js','carvewright.css'];"}, {'file': 'index.html', 'before': "    const presencePaths=['business_deck.js','business_deck.css','owner.html','manifest.webmanifest','IKE_STYLE_FOUNDRY.json','sw.js','FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];", 'after': "    const presencePaths=['carvewright.html','business_deck.js','business_deck.css','owner.html','manifest.webmanifest','IKE_STYLE_FOUNDRY.json','sw.js','FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json'];"}, {'file': 'index.html', 'before': "      const css=document.createElement('style');css.id='darkSkyVerifiedReleaseStyles';css.dataset.releaseSeal=SEAL;css.textContent=fetched['fun_program.css']+'\\n'+fetched['styles.css']+'\\n'+fetched['simple_books.css']+'\\n'+fetched['fleet_viewport.css']+'\\n'+fetched['quartermaster.css']+'\\n'+fetched['carve_studio.css'];document.head.appendChild(css);", 'after': "      const css=document.createElement('style');css.id='darkSkyVerifiedReleaseStyles';css.dataset.releaseSeal=SEAL;css.textContent=fetched['fun_program.css']+'\\n'+fetched['styles.css']+'\\n'+fetched['simple_books.css']+'\\n'+fetched['fleet_viewport.css']+'\\n'+fetched['quartermaster.css']+'\\n'+fetched['carve_studio.css']+'\\n'+fetched['carvewright.css'];document.head.appendChild(css);"}, {'file': 'index.html', 'before': "      for(const path of ['input_hygiene.js','platform_core.js','fleet_viewport.js','headway_contracts.js','woodwright_fit.js','platform_v4.js','platform_identity.js','fleet_supabase.js','ike_style_registry.js','app.js','captain.js','fun_core.js','stormwake_core.js','fun_program.js','simple_books.js','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js']){", 'after': "      for(const path of ['input_hygiene.js','platform_core.js','fleet_viewport.js','headway_contracts.js','woodwright_fit.js','platform_v4.js','platform_identity.js','fleet_supabase.js','ike_style_registry.js','app.js','captain.js','fun_core.js','stormwake_core.js','fun_program.js','simple_books.js','quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','carve_fonts.js','carve_core.js','carve_store.js','carve_studio.js','quartermaster.js','carvewright_core.js','carvewright_store.js','carvewright_studio.js','carvewright_app.js','carvewright_fleet.js']){"}]


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
    compared = 0
    for name in sorted(base):
        if Path(name).suffix not in RUNTIME_SUFFIXES:
            continue
        actual, old = normalize(current[name].decode()), base[name].decode()
        # The trusted exact .54 bytes define each edit location. Forward application
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


def verify(root, baseline, cumulative_baseline=None):
    require(INTEGRATION_REVIEWED and bool(INTEGRATION_CHANGES), 'Reviewed embedded integration snapshot required')
    current, base = files(root), files(baseline)
    require(len(base) == BASE_COUNT and content_digest(base) == BASE_DIGEST, 'Exact immutable complete 355-file .54 baseline required')
    cumulative_baseline = Path(cumulative_baseline) if cumulative_baseline is not None else Path(baseline).resolve().parents[1] / 'quartermaster-studio/release'
    base53 = files(cumulative_baseline)
    legacy = BASES[1]
    require(len(base53) == legacy['file_count'] and content_digest(base53) == legacy['content_sha256'], 'Exact immutable complete 343-file .53 cumulative baseline required')
    earlier = verify_full(base53)
    require(earlier['build'] == legacy['build'] and earlier['seal'] == legacy['seal'], 'Wrong cumulative baseline identity')
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
    require(required == old_required + list(ASSETS), 'Required runtime inventory differs from exact additive assets')
    runtime, old_runtime = manifest['runtime_integrity'], old_manifest['runtime_integrity']
    require(set(runtime['files']) == set(old_runtime['files']) | set(ASSETS), 'Runtime integrity inventory differs')
    require({k:v for k,v in runtime.items() if k != 'files'} == {k:v for k,v in old_runtime.items() if k != 'files'}, 'Runtime integrity policy changed')
    for name, entry in manifest['lazy_program_assets'].items():
        old_entry = old_manifest['lazy_program_assets'][name]
        require(entry['sha256'] == sha(current[name]) and entry['bytes'] == len(current[name]), 'Lazy asset digest/size differs: ' + name)
        require(dict(entry, sha256=old_entry['sha256'], bytes=old_entry['bytes']) == old_entry, 'Lazy asset semantics changed')
    require(set(manifest['lazy_program_assets']) == set(old_manifest['lazy_program_assets']), 'Lazy inventory changed')
    mutable = {'build','version','release_name','releaseName','release_seal','release_focus','release_note','required_runtime_files','runtime_integrity','model_integrity','lazy_program_assets','carvewright_fleet'}
    require(set(manifest) == set(old_manifest) | {'carvewright_fleet'}, 'Unexpected manifest fields')
    for key in set(old_manifest) - mutable:
        require(manifest[key] == old_manifest[key], 'Historical manifest metadata changed: ' + key)
    require(manifest['carvewright'] == old_manifest['carvewright'], 'Historical .54 Carvewright metadata changed')
    cw = manifest['carvewright_fleet']
    require(cw['build'] == BUILD and cw['base'] == BASE_BUILD and cw['base_file_count'] == BASE_COUNT and cw['assets'] == list(ASSETS), 'Carvewright manifest identity/assets wrong')
    for key in ('machine_output','live_service_actions','data_migration_required','customer_routes_changed','existing_document_records_changed'):
        require(cw[key] is False, 'Unsupported Carvewright scope claim: ' + key)
    gate, evidence = parse_json(current, 'RELEASE_GATE.json'), parse_json(current, 'CARVEWRIGHT_FLEET_EVIDENCE.json')
    require(gate['build'] == BUILD and gate['release'] == NAME and gate['pass'] is True and gate['verification_status'] == STATUS and gate['evidence_file'] == 'CARVEWRIGHT_FLEET_EVIDENCE.json', 'Wrong or pending current gate')
    require(gate['prior_release_evidence'] == parse_json(base, 'RELEASE_GATE.json'), 'Prior release gate/evidence changed')
    require(evidence['build'] == BUILD and evidence['baseline'] == BASE_BUILD and evidence['pass'] is True, 'Wrong or failing current evidence')
    for item in (gate, evidence):
        require(item['native_safari_acceptance'] == 'not claimed' and item['native_firefox_acceptance'] == 'not claimed' and item['live_commissioning_acceptance'] == 'not claimed' and item['machine_production_acceptance'] == 'not claimed', 'Unobserved native or machine acceptance claimed')
    checks = evidence['checks']
    require(isinstance(checks, list) and bool(checks) and all(isinstance(c,dict) and c.get('status') == 'passed' and c.get('name') for c in checks), 'Fresh recorded checks must all pass')
    evidence_count, sources = source_maps(evidence, current)
    require(set(ASSETS) | {'index.html','quartermaster.js','fun_program.js','stormwake_player.html'} <= sources, 'Fresh evidence omits changed runtime inputs')
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
    for name in ('UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt','CARVEWRIGHT_FLEET_GUIDE.md','CARVEWRIGHT_FLEET_SOURCES.md'):
        require(name in current and BUILD.encode() in current[name] and NAME.encode() in current[name], 'Current documentation missing identity: ' + name)
    require(current['UPLOAD_THIS_ONE_BUILD.md'].endswith(base['UPLOAD_THIS_ONE_BUILD.md']), 'Prior upload notes must be preserved verbatim as suffix')
    require(current['BUILD_NOTES.txt'].endswith(base['BUILD_NOTES.txt']), 'Prior build notes must be preserved verbatim as suffix')
    additions = set(ASSETS) | {'VERIFY_CARVEWRIGHT_FLEET_RELEASE.py','CARVEWRIGHT_FLEET_GUIDE.md','CARVEWRIGHT_FLEET_SOURCES.md','CARVEWRIGHT_FLEET_EVIDENCE.json'}
    require(set(current) == set(base) | additions, 'Unexpected added or missing release files')
    patch = cumulative_patch([base, base53], current)
    require(files(baseline) == base and files(cumulative_baseline) == base53 and files(root) == current, 'Verification changed release or baseline bytes')
    return {'pass':True, **result, 'release':NAME, 'baseline_build':BASE_BUILD, 'baseline_files':BASE_COUNT, 'baseline_content_sha256':BASE_DIGEST,'supported_bases':[{k:b[k] for k in ('build','file_count','content_sha256')} for b in BASES],'existing_runtime_files_compared':compared,'exact_integration_substitutions':len(INTEGRATION_CHANGES),'retained_models':retained,'current_models':len(models),'historical_files_preserved':history,'evidence_hashes_checked':evidence_count,'upload_files':len(patch),'byte_exact_reconstruction':True,'deleted_files':0,'native_safari_acceptance':'not claimed','native_firefox_acceptance':'not claimed','live_commissioning_acceptance':'not claimed','machine_production_acceptance':'not claimed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('release', nargs='?', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('baseline', nargs='?', type=Path, default=Path(__file__).resolve().parents[2] / 'ike-carve-studio/release')
    parser.add_argument('--cumulative-baseline', type=Path, help='Exact .53 release; defaults beside the .54 project')
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.release,args.baseline,args.cumulative_baseline),indent=2)); return 0
    except (PackageError,OSError,KeyError,TypeError,ValueError) as exc:
        print(json.dumps({'pass':False,'error':str(exc)},indent=2)); return 1
if __name__ == '__main__':
    sys.exit(main())
