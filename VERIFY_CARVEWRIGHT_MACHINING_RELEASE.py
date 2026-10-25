"""Read-only First Cut integrity and preservation verification.
Offline software verification is not physical CNC acceptance.
"""
from pathlib import Path
import argparse, json, re, sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, CURRENT_MODELS, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full, load_archive
from VERIFY_CARVEWRIGHT_SESSION_RELEASE import BASES as PREVIOUS_BASES, STANDALONE as PREVIOUS_STANDALONE, files, cumulative_patch, source_maps

BUILD, SEAL, NAME = '8.8.20.57', 'firstcut-882057', 'First Cut'
BASE_BUILD, BASE_SEAL, BASE_COUNT = '8.8.20.56', 'carvewright-882056', 369
BASE_DIGEST = '6b4133d126ac08924a53f1491fe3da03013f2a7062a534a6d64c916e124c9fb3'
BASES = ({'build':BASE_BUILD, 'seal':BASE_SEAL, 'file_count':BASE_COUNT, 'content_sha256':BASE_DIGEST, 'directory':'carvewright-session', 'archive':'DarkSky882056-Carvewright-FullBackup.zip', 'archive_sha256':'8cf59711d7e238a83f8b2a59c83e6876e5adee7ef9763d1d6cb30b09344579ec'},) + PREVIOUS_BASES
ASSETS = ('carvewright_clipper.js','carvewright_cam.js','carvewright_posts.js','carvewright_machining.js','carvewright_machining.css')
INTEGRATED = {'index.html','carvewright.html','carvewright_studio.js','carvewright_fleet.js'}
STANDALONE = PREVIOUS_STANDALONE + ASSETS + ('CARVEWRIGHT_CLIPPER_LICENSE.txt','CARVEWRIGHT_MACHINING_GUIDE.md')
RUNTIME_SUFFIXES = {'.js','.html','.css'}

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
        require(sha(archive.read_bytes()) == identity['archive_sha256'] and load_archive(archive) == original, 'Original archive differs: ' + identity['build'])
        originals.append((directory,archive,original))
    return originals

def normalize(text):
    return text.replace(BUILD,BASE_BUILD).replace(SEAL,BASE_SEAL)

def verify(root, baseline):
    current = files(root)
    originals = exact_baselines(baseline)
    base = originals[0][2]
    result = verify_full(current)
    require(result['build'] == BUILD and result['seal'] == SEAL, 'Wrong release identity')
    require(set(base) <= set(current), 'Baseline files removed')
    require(set(ASSETS) <= set(current), 'Machining assets missing')
    expected_runtime = {n for n in base if Path(n).suffix in RUNTIME_SUFFIXES} | set(ASSETS)
    require({n for n in current if Path(n).suffix in RUNTIME_SUFFIXES} == expected_runtime, 'Unexpected runtime inventory')
    compared = 0
    for name in sorted(base):
        if Path(name).suffix not in RUNTIME_SUFFIXES or name in INTEGRATED:
            continue
        actual, old = normalize(current[name].decode()), base[name].decode()
        if name == 'fun_program.js':
            def mask(text): return re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}", r'\1PLAYER_HASH', text)
            actual, old = mask(actual), mask(old)
        require(actual == old, 'Unrelated runtime behavior changed: ' + name)
        compared += 1
    for name in ('carve_fonts.js','carve_core.js','carve_store.js','carvewright_core.js','carvewright_store.js','carve_font_license.txt'):
        require(current[name] == base[name], 'Existing geometry, font or design storage changed: ' + name)
    m, old_m = parse_json(current,'DEPLOYMENT_MANIFEST.json'), parse_json(base,'DEPLOYMENT_MANIFEST.json')
    require(m['release_name'] == NAME and m['version'] == BUILD, 'Manifest identity differs')
    require(m['required_runtime_files'] == old_m['required_runtime_files'] + list(ASSETS), 'Runtime dependency inventory differs')
    require(set(m['runtime_integrity']['files']) == set(old_m['runtime_integrity']['files']) | set(ASSETS), 'Runtime hash inventory differs')
    declarations, old_declarations = m['model_integrity']['files'], old_m['model_integrity']['files']
    require(set(declarations) == set(old_declarations), 'Model inventory changed')
    retained = 0
    for name, entry in declarations.items():
        prior = old_declarations[name]
        require(entry['policy'] == prior['policy'], 'Model policy changed: ' + name)
        if entry['policy'] == 'retained-versioned-reference':
            require(entry == prior and current[name] == base[name], 'Historical model changed: ' + name)
            retained += 1
        else:
            require(name in CURRENT_MODELS and dict(parse_json(current,name),build=BASE_BUILD) == parse_json(base,name), 'Current model behavior changed: ' + name)
            require(dict(entry,build=prior['build'],sha256=prior['sha256']) == prior, 'Current model declaration changed: ' + name)
    require(retained == 39, 'Retained model count changed')
    for key in ('carvewright','carvewright_fleet','carvewright_session'):
        require(m[key] == old_m[key], 'Historical capability metadata changed: ' + key)
    machining = m['carvewright_machining']
    require(machining['build'] == BUILD and machining['machine_acceptance'] is False and machining['browser_local'] is True and machining['existing_design_schema_changed'] is False, 'Machining scope differs')
    require(normalize(current['BUILD_STORMWAKE_PLAYER.py'].decode()) == base['BUILD_STORMWAKE_PLAYER.py'].decode(), 'Player compiler changed')
    report, prior = parse_json(current,'STORMWAKE_PLAYER_BUILD.json'), parse_json(base,'STORMWAKE_PLAYER_BUILD.json')
    require(report['build'] == BUILD and report['runtime_network'] is False and set(report['inputs_sha256']) == set(prior['inputs_sha256']), 'Player build contract differs')
    require(all(sha(current[n]) == v for n,v in report['inputs_sha256'].items()), 'Stale player input hash')
    player_sha = sha(current['stormwake_player.html'])
    require(report['player']['sha256'] == player_sha and report['player']['bytes'] == len(current['stormwake_player.html']), 'Player build output differs')
    require(re.findall(r"\bSTORMWAKE_SHA\s*=\s*['\"]([a-f0-9]{64})['\"]",current['fun_program.js'].decode()) == [player_sha], 'Host player digest differs')
    evidence = parse_json(current,'CARVEWRIGHT_MACHINING_EVIDENCE.json')
    gate = parse_json(current,'RELEASE_GATE.json')
    require(evidence['build'] == BUILD and evidence['baseline'] == BASE_BUILD and evidence['pass'] is True, 'Evidence is pending or wrong build')
    require(gate['build'] == BUILD and gate['pass'] is True and gate['evidence_file'] == 'CARVEWRIGHT_MACHINING_EVIDENCE.json', 'Release gate differs')
    require(gate['prior_release_evidence'] == parse_json(base,'RELEASE_GATE.json'), 'Historical release evidence changed')
    require(all(c.get('status') == 'passed' and c.get('name') for c in evidence['checks']) and bool(evidence['checks']), 'Evidence checks missing or failing')
    count, covered = source_maps(evidence,current)
    require(set(ASSETS) | INTEGRATED | {'fun_program.js','stormwake_player.html'} <= covered, 'Evidence omits changed runtime')
    for e in (gate,evidence):
        for key in ('native_safari_acceptance','native_firefox_acceptance','live_commissioning_acceptance','machine_production_acceptance'):
            require(e[key] == 'not claimed', 'Unobserved acceptance claimed: ' + key)
    contract = parse_json(current,'PATCH_CONTRACT.json')
    expected = [{k:b[k] for k in ('build','file_count','content_sha256')} | {'content_digest_algorithm':CONTENT_DIGEST_ALGORITHM} for b in BASES]
    require(contract['supported_bases'] == expected and contract['target_build'] == BUILD and contract['target_seal'] == SEAL and contract['requires_deletions'] is False and contract['database_actions'] == 'none' and contract['max_upload_files'] == 85, 'Patch contract differs')
    mutable = set(LEDGERS) | set(CURRENT_MODELS) | {'BUILD_STORMWAKE_PLAYER.py','STORMWAKE_PLAYER_BUILD.json','DEPLOYMENT_MANIFEST.json','PATCH_CONTRACT.json','RELEASE_SEAL.json','RELEASE_GATE.json','RELEASE_INVENTORY.json','manifest.webmanifest','UPLOAD_THIS_ONE_BUILD.md','BUILD_NOTES.txt'}
    historical = 0
    for name in base:
        if Path(name).suffix in RUNTIME_SUFFIXES or name in mutable: continue
        require(current[name] == base[name], 'Historical file changed: ' + name)
        historical += 1
    patch = cumulative_patch([v[2] for v in originals], current)
    require(all(files(d) == old and sha(a.read_bytes()) == b['archive_sha256'] for (d,a,old),b in zip(originals,BASES)), 'Baseline changed during verification')
    require(files(root) == current, 'Verification changed target')
    return dict(result,build=BUILD,seal=SEAL,release=NAME,upload_files=len(patch),byte_exact_reconstruction=True,deleted_files=0,retained_models=retained,existing_runtime_files_compared=compared,historical_files_preserved=historical,evidence_hashes_checked=count,**{'pass':True})

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('release',nargs='?',type=Path,default=Path(__file__).resolve().parent)
    p.add_argument('baseline',nargs='?',type=Path,default=Path(__file__).resolve().parents[2]/'carvewright-session/release')
    a=p.parse_args()
    try: print(json.dumps(verify(a.release,a.baseline),indent=2)); return 0
    except (PackageError,OSError,KeyError,TypeError,ValueError) as e: print(json.dumps({'pass':False,'error':str(e)},indent=2)); return 1
if __name__ == '__main__': sys.exit(main())
