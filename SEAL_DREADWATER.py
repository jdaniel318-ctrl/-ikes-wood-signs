"""Final-byte Dreadwater wrapper; historical sealers remain unchanged.

Usage: python SEAL_DREADWATER.py RELEASE_DIR --baseline EXACT_44 [--dry-run]
Finish compilation, embedded host digest, metadata/docs and evidence first.
All generated metadata is staged and verified before any final metadata is written.
Pillow is a build-only dependency through STORMWAKE_BUILD_RULES.
Hashes verify byte agreement, not authenticity, native acceptance or authority.
"""
from __future__ import annotations
import argparse
import json
import sys
import tempfile
from pathlib import Path
from SEAL_BLACKTIDE import encoded, seal_release
from STORMWAKE_BUILD_RULES import PLAYER_LIMIT, check_player, validate_art, validate_vendor
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full

BUILD = '8.8.20.45'
SEAL = 'dreadwater-882045'
BASE_BUILD = '8.8.20.44'
BASE_SEAL = 'lanternwake-882044'
BASE_DIGEST = 'fcbddaeec8def5cad6c16eb364885b6a1c1e07b4c88c83c4c714f14b241efaaa'
BUILD_INPUTS = frozenset(('fun_core.js', 'stormwake_core.js', 'stormwake_comfort.js',
    'stormwake_three_vendor.js', 'stormwake_gl.js', 'stormwake_cast.js',
    'stormwake_three.js', 'stormwake_world.js', 'stormwake_game.js',
    'stormwake_assets.json', 'STORMWAKE_VENDOR.json', 'fun_player.html',
    'stormwake_game.css', 'BUILD_STORMWAKE_PLAYER.py', 'STORMWAKE_BUILD_RULES.py'))


def validate_compiled_inputs(root: Path, data: dict[str, bytes]):
    """Reject a stale/missing build report or changed inputs before sealing."""
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
    art = validate_art(data['stormwake_assets.json'])
    require(report.get('art') == art, 'Art input differs from build report')
    vendor = validate_vendor(root)
    require(report.get('vendor') == vendor, 'Vendor input differs from build report')
    return report


def finalize_release(root: Path, baseline: Path, *, dry_run: bool = False):
    root = Path(root)
    baseline = Path(baseline)
    entries = [p for p in root.iterdir() if p.name not in ('.git', '__pycache__')]
    require(not any(p.is_symlink() or p.is_dir() or not p.is_file() for p in entries),
            'Release must contain regular flat files only')
    data = {p.name: p.read_bytes() for p in entries}
    manifest = parse_json(data, 'DEPLOYMENT_MANIFEST.json')
    contract = parse_json(data, 'PATCH_CONTRACT.json')
    require(manifest.get('build') == BUILD and manifest.get('release_seal') == SEAL,
            'Dreadwater manifest identity mismatch')
    require(contract.get('target_build') == BUILD and contract.get('target_seal') == SEAL,
            'Patch target identity mismatch')
    require(contract.get('requires_deletions') is False and contract.get('database_actions') == 'none',
            'Unsupported deletion/database contract')
    require(contract.get('max_upload_files') == 85, 'Upload budget contract must remain 85')
    inventory = json.loads((baseline / 'RELEASE_INVENTORY.json').read_bytes())
    names = inventory.get('files')
    require(isinstance(names, list) and len(names) == 241 and len(set(names)) == 241,
            'Expected exact 241-file Lanternwake baseline')
    require(all(isinstance(n, str) and Path(n).name == n and n not in ('.', '..') for n in names),
            'Unsafe baseline filename')
    original = {name: (baseline / name).read_bytes() for name in names}
    previous = verify_full(original, historical=True)
    require(previous['build'] == BASE_BUILD and previous['seal'] == BASE_SEAL,
            'Wrong baseline release identity')
    require(content_digest(original) == BASE_DIGEST, 'Baseline content is not exact Lanternwake .44')
    bases = contract.get('supported_bases')
    require(isinstance(bases, list) and len(bases) == 1, 'Expected one exact supported baseline')
    base = bases[0]
    require(base.get('build') == BASE_BUILD and base.get('file_count') == 241
            and base.get('content_digest_algorithm') == CONTENT_DIGEST_ALGORITHM
            and base.get('content_sha256') == BASE_DIGEST, 'Patch baseline content declaration mismatch')
    require(set(original) <= set(data), 'Release omits an existing baseline file')
    validate_compiled_inputs(root, data)
    require('stormwake_player.html' in manifest.get('lazy_program_assets', {}),
            'Missing lazy compiled-player declaration')
    for name, entry in manifest.get('lazy_program_assets', {}).items():
        require(name in data, 'Missing compiled asset: ' + name)
        digest = sha(data[name])
        entry['sha256'] = digest
        entry['bytes'] = len(data[name])
        if name == 'stormwake_player.html':
            import re
            host = data.get('fun_program.js', b'').decode('utf-8')
            declared = re.findall(r"\bSTORMWAKE_SHA\s*=\s*['\"]([a-f0-9]{64})['\"]", host)
            require(declared == [digest], 'Compile and update the exact host player digest before finalization')
    data['DEPLOYMENT_MANIFEST.json'] = encoded(manifest)
    generated = ('DEPLOYMENT_MANIFEST.json', 'RELEASE_INVENTORY.json', *LEDGERS)
    with tempfile.TemporaryDirectory(prefix='dreadwater-finalize-') as directory:
        staged = Path(directory)
        for name, body in data.items():
            (staged / name).write_bytes(body)
        result = seal_release(staged, baseline)
        final = {name: (staged / name).read_bytes() for name in data}
        changed = [name for name in final if original.get(name) != final[name]]
        require(0 < len(changed) <= 85, 'Final update exceeds 85-file upload budget')
        require(set(original) <= set(final), 'Staged release deletes baseline files')
        if not dry_run:
            for name in generated:
                (root / name).write_bytes(final[name])
    return {'pass': True, **result, 'changed_files': len(changed), 'dry_run': dry_run,
            'scope': 'Final metadata/build-input byte agreement only; archive/extraction/browser/native checks remain separate'}


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
