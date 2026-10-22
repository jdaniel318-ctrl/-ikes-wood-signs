"""Stage and seal final Homeward .48 metadata over the exact .47 baseline.

Usage: python -B SEAL_HOMEWARD.py RELEASE_DIR --baseline EXACT_47 [--dry-run]
Finish compilation, host digest, selected evidence and current documents first.
Pending or stale current evidence cannot be sealed. Historical sealers stay exact.
Hashes establish byte agreement; package reconstruction and device acceptance are separate.
"""
from __future__ import annotations
import argparse
import json
import re
import sys
import tempfile
from pathlib import Path, PurePosixPath
from SEAL_BLACKTIDE import encoded, seal_release
from STORMWAKE_BUILD_RULES import PLAYER_LIMIT, check_player, validate_art, validate_vendor
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full

BUILD, SEAL = '8.8.20.48', 'homeward-882048'
BASE_BUILD, BASE_SEAL = '8.8.20.47', 'breakwater-882047'
BASE_COUNT = 286
BASE_DIGEST = 'f77147f8684b4492e8d0d4851ed06c9778710650cea464fd10a4c348577a42e6'
STATUS = 'OFFLINE_TARGETED_CHECKS_PASSED'
BUILD_INPUTS = frozenset(('fun_core.js', 'stormwake_core.js', 'stormwake_comfort.js',
    'stormwake_three_vendor.js', 'stormwake_gl.js', 'stormwake_cast.js',
    'stormwake_three.js', 'stormwake_world.js', 'stormwake_game.js',
    'stormwake_assets.json', 'STORMWAKE_VENDOR.json', 'fun_player.html',
    'stormwake_game.css', 'BUILD_STORMWAKE_PLAYER.py', 'STORMWAKE_BUILD_RULES.py'))
EVIDENCE_INPUTS = BUILD_INPUTS | frozenset(('fun_program.js', 'fun_program.css',
    'stormwake_player.html', 'STORMWAKE_PLAYER_BUILD.json', 'VERIFY_HOMEWARD_RECOVERY.py'))


def validate_compiled_inputs(root: Path, data: dict[str, bytes]):
    report = parse_json(data, 'STORMWAKE_PLAYER_BUILD.json')
    require(report.get('schema') == 'stormwake-player-build-v1' and report.get('build') == BUILD,
            'Wrong compiled-player report identity')
    require(report.get('runtime_network') is False, 'Unexpected runtime network declaration')
    inputs = report.get('inputs_sha256')
    require(isinstance(inputs, dict) and set(inputs) == BUILD_INPUTS, 'Incomplete compiled-player input inventory')
    for name, digest in inputs.items():
        require(name in data and sha(data[name]) == digest, 'Stale compiled-player input: ' + name)
    require('stormwake_player.html' in data, 'Missing compiled player')
    player = data['stormwake_player.html']
    check_player(player)
    require(report.get('player') == {'bytes': len(player), 'sha256': sha(player), 'limit_bytes': PLAYER_LIMIT},
            'Compiled-player bytes differ from build report')
    require(report.get('art') == validate_art(data['stormwake_assets.json']), 'Stale embedded-art build report')
    require(report.get('vendor') == validate_vendor(root), 'Stale pinned-vendor build report')
    declared = re.findall(r"\bSTORMWAKE_SHA\s*=\s*['\"]([a-f0-9]{64})['\"]", data['fun_program.js'].decode())
    require(declared == [sha(player)], 'Compile and update the exact host player digest before finalization')
    return report


def validate_current_evidence(data: dict[str, bytes]):
    """Check the shipped bounded evidence against current player and host bytes."""
    evidence = parse_json(data, 'HOMEWARD_TEST_RESULTS.json')
    require(evidence.get('schema') == 'homeward-bounded-evidence-v1'
            and evidence.get('build') == BUILD and evidence.get('pass') is True
            and evidence.get('status') == STATUS, 'Current Homeward evidence is pending or failing')
    sources = evidence.get('source_sha256')
    require(isinstance(sources, dict) and set(sources) >= EVIDENCE_INPUTS, 'Current evidence omits player/host inputs')
    for name, digest in sources.items():
        require(isinstance(name, str) and Path(name).name == name and name in data,
                'Invalid evidence source: ' + str(name))
        require(sha(data[name]) == digest, 'Stale current evidence source: ' + name)
    checks = evidence.get('checks')
    require(isinstance(checks, list) and bool(checks), 'Missing selected checks')
    ids = set()
    kinds = set()

    def refs(entries):
        require(isinstance(entries, list) and bool(entries), 'Missing exact evidence references')
        for entry in entries:
            require(isinstance(entry, dict), 'Invalid evidence reference')
            filename = entry.get('file')
            require(isinstance(filename, str) and bool(filename)
                    and not PurePosixPath(filename).is_absolute()
                    and '..' not in PurePosixPath(filename).parts and '\\' not in filename,
                    'Unsafe evidence reference')
            require(isinstance(entry.get('sha256'), str)
                    and re.fullmatch('[a-f0-9]{64}', entry['sha256']) is not None,
                    'Missing evidence digest')

    for check in checks:
        require(isinstance(check, dict) and check.get('pass') is True, 'A selected check did not pass')
        name = check.get('id')
        require(isinstance(name, str) and bool(name.strip()) and name not in ids, 'Missing or duplicate check id')
        require(isinstance(check.get('scope'), str) and bool(check['scope'].strip()), 'Missing check scope')
        ids.add(name)
        kinds.add(check.get('kind'))
        refs(check.get('evidence'))
    require(kinds >= {'recovery', 'player'}, 'Selected checks do not cover recovery and actual compiled Resume')
    require(evidence.get('native_field_acceptance') == 'PENDING', 'Do not certify unobserved native acceptance')
    return evidence


def finalize_release(root: Path, baseline: Path, *, dry_run: bool = False):
    root, baseline = Path(root), Path(baseline)
    entries = [p for p in root.iterdir() if p.name not in ('.git', '__pycache__')]
    require(all(p.is_file() and not p.is_symlink() for p in entries), 'Release must contain regular flat files only')
    data = {p.name: p.read_bytes() for p in entries}
    manifest = parse_json(data, 'DEPLOYMENT_MANIFEST.json')
    contract = parse_json(data, 'PATCH_CONTRACT.json')
    gate = parse_json(data, 'RELEASE_GATE.json')
    require(manifest.get('build') == BUILD and manifest.get('release_seal') == SEAL,
            'Homeward manifest identity mismatch')
    require(contract.get('target_build') == BUILD and contract.get('target_seal') == SEAL,
            'Patch target identity mismatch')
    require(contract.get('requires_deletions') is False and contract.get('database_actions') == 'none'
            and contract.get('max_upload_files') == 85, 'Unsupported deletion/database/upload contract')
    inventory = json.loads((baseline / 'RELEASE_INVENTORY.json').read_bytes())
    names = inventory.get('files')
    require(isinstance(names, list) and len(names) == len(set(names)) == BASE_COUNT, 'Expected exact 286-file Breakwater baseline')
    require(all(isinstance(n, str) and Path(n).name == n and n not in ('.', '..') for n in names), 'Unsafe baseline filename')
    original = {name: (baseline / name).read_bytes() for name in names}
    previous = verify_full(original)
    require(previous['build'] == BASE_BUILD and previous['seal'] == BASE_SEAL
            and content_digest(original) == BASE_DIGEST, 'Baseline is not exact Breakwater .47')
    bases = contract.get('supported_bases')
    require(isinstance(bases, list) and len(bases) == 1, 'Expected one exact supported baseline')
    base = bases[0]
    require(base.get('build') == BASE_BUILD and base.get('file_count') == BASE_COUNT
            and base.get('content_digest_algorithm') == CONTENT_DIGEST_ALGORITHM
            and base.get('content_sha256') == BASE_DIGEST, 'Wrong patch baseline content declaration')
    require(set(original) <= set(data), 'Release omits an existing baseline file')
    validate_compiled_inputs(root, data)
    validate_current_evidence(data)
    require(gate.get('build') == BUILD and gate.get('pass') is True
            and gate.get('verification_status') == STATUS
            and gate.get('evidence_file') == 'HOMEWARD_TEST_RESULTS.json', 'Current release gate is pending')
    require(gate.get('prior_release_evidence') == parse_json(original, 'RELEASE_GATE.json'), 'Historical gate changed')
    require('stormwake_player.html' in manifest.get('lazy_program_assets', {}), 'Missing lazy player declaration')
    for name, entry in manifest['lazy_program_assets'].items():
        require(name in data, 'Missing lazy asset: ' + name)
        entry['sha256'], entry['bytes'] = sha(data[name]), len(data[name])
    data['DEPLOYMENT_MANIFEST.json'] = encoded(manifest)
    generated = ('DEPLOYMENT_MANIFEST.json', 'RELEASE_INVENTORY.json', *LEDGERS)
    with tempfile.TemporaryDirectory(prefix='homeward-finalize-') as directory:
        staged = Path(directory)
        for name, body in data.items():
            (staged / name).write_bytes(body)
        result = seal_release(staged, baseline)
        final = {name: (staged / name).read_bytes() for name in data}
        changed = sorted(name for name in final if original.get(name) != final[name])
        require(0 < len(changed) <= 85, 'Final update exceeds 85-file upload budget')
        if not dry_run:
            for name in generated:
                (root / name).write_bytes(final[name])
    return {'pass': True, **result, 'changed_files': len(changed), 'dry_run': dry_run,
        'scope': 'Current scoped evidence and metadata/build-input byte agreement; package/extraction/device checks remain separate'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('release', type=Path)
    parser.add_argument('--baseline', type=Path, required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(finalize_release(args.release, args.baseline, dry_run=args.dry_run), indent=2))
        return 0
    except (PackageError, OSError, KeyError, TypeError, ValueError) as error:
        print(json.dumps({'pass': False, 'error': str(error)}, indent=2))
        return 1


if __name__ == '__main__':
    sys.exit(main())
