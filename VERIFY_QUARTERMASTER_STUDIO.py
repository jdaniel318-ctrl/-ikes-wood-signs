"""Verify sealed .53 workspace design and exact preservation of the complete .52 base.

Usage: python -B VERIFY_QUARTERMASTER_STUDIO.py [RELEASE_DIR] [BASELINE_DIR]
Read-only source/release checks; browser results remain separately scoped evidence.
"""
from pathlib import Path
import argparse
import json
import re
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from VERIFY_PACKAGE import CONTENT_DIGEST_ALGORITHM, CURRENT_MODELS, LEDGERS, PackageError, content_digest, parse_json, require, sha, verify_full

BUILD, SEAL, NAME = '8.8.20.53', 'quartermaster-882053', 'Quartermaster'
BASE_BUILD, BASE_SEAL, BASE_COUNT = '8.8.20.52', 'quartermaster-882052', 334
BASE_DIGEST = '08a0144b24078079032245680bab68e793694d72960fb613d7578c9e8e4050a9'
CHANGES = 'QUARTERMASTER_STUDIO_CHANGES.json'
EVIDENCE = 'QUARTERMASTER_STUDIO_VALIDATION.json'
STATUS = 'OFFLINE_RELEASE_CHECKS_PASSED'
NOTES = frozenset(('CHANGELOG.md', 'CURRENT_ARCHITECTURE.md', 'README.md',
                   'README.txt', 'UPLOAD_THIS_ONE_BUILD.md'))
START_NOTE = 'START_HERE_QUARTERMASTER_53.md'
BROWSER_VERIFIER = 'VERIFY_QUARTERMASTER_STUDIO.cjs'
RUNTIME_SUFFIXES = frozenset(('.js', '.html', '.css'))
BOUNDARY_FLAGS = (
    'authority_changed', 'storage_schema_changed', 'document_numbering_or_money_changed',
    'prepared_pdf_bytes_changed', 'pdf_handoff_changed', 'backup_download_changed',
    'customer_routes_changed', 'session_limits_changed', 'game_behavior_changed',
    'new_network_assets', 'live_service_actions', 'data_migration_required',
)


def files(root):
    entries = list(root.iterdir())
    require(all(p.is_file() and not p.is_symlink() for p in entries),
            'Release must contain regular flat files only: ' + str(root))
    return {p.name: p.read_bytes() for p in entries}


def normalize(text):
    return text.replace(BUILD, BASE_BUILD).replace(SEAL, BASE_SEAL)


def selector_parts(selector):
    """Split selector lists without splitting commas inside :is() or attributes."""
    parts, start, depth, quote, escaped = [], 0, 0, '', False
    for index, char in enumerate(selector):
        if escaped:
            escaped = False
            continue
        if char == '\\':
            escaped = True
            continue
        if quote:
            if char == quote:
                quote = ''
            continue
        if char in ('"', "'"):
            quote = char
        elif char in '([':
            depth += 1
        elif char in ')]':
            depth -= 1
            require(depth >= 0, 'Unbalanced scoped CSS selector')
        elif char == ',' and depth == 0:
            parts.append(selector[start:index].strip())
            start = index + 1
    require(not quote and depth == 0 and not escaped, 'Unbalanced scoped CSS selector')
    parts.append(selector[start:].strip())
    return parts


def scoped_selector(selector):
    """Require the workspace itself or its descendants, never an outside sibling."""
    prefix = '#quartermasterWorkspace'
    if not selector.startswith(prefix):
        return False
    rest = selector[len(prefix):]
    if rest and not (rest[0].isspace() or rest[0] in '.:#[:>'):
        return False
    depth, quote, escaped = 0, '', False
    for index, char in enumerate(rest):
        if escaped:
            escaped = False
            continue
        if char == '\\':
            escaped = True
            continue
        if quote:
            if char == quote:
                quote = ''
            continue
        if char in ('"', "'"):
            quote = char
        elif char in '([':
            depth += 1
        elif char in ')]':
            depth -= 1
        elif depth == 0 and (char.isspace() or char in '>+~'):
            remaining = rest[index:].lstrip()
            return not remaining.startswith(('+', '~', '||'))
    return depth == 0 and not quote and not escaped


def verify_styles(tail):
    """Allow ordinary scoped rules and @media containers, with no asset loading."""
    css = re.sub(r'/\*.*?\*/', '', tail.decode('utf-8'), flags=re.S)
    require(not re.search(r'(?i)(?:url|(?:-webkit-)?image-set)\s*\(|@import\b', css),
            'Appended workspace styles introduce an asset dependency')
    stack, start, quote, escaped, rules = [], 0, '', False, 0
    for index, char in enumerate(css):
        if escaped:
            escaped = False
            continue
        if char == '\\':
            escaped = True
            continue
        if quote:
            if char == quote:
                quote = ''
            continue
        if char in ('"', "'"):
            quote = char
            continue
        if char == '{':
            require(not stack or stack[-1] == 'media', 'Nested CSS rule extends scope')
            header = css[start:index].strip()
            if header.startswith('@'):
                require(re.fullmatch(r'@media(?:\s+|(?=\())[^{};]+', header),
                        'Only @media containers are allowed in appended styles')
                stack.append('media')
            else:
                selectors = selector_parts(header)
                require(all(scoped_selector(item) for item in selectors),
                        'Appended style selector is outside #quartermasterWorkspace: ' + header)
                stack.append('rule')
                rules += 1
            start = index + 1
        elif char == '}':
            require(bool(stack), 'Unbalanced appended stylesheet')
            kind = stack.pop()
            if kind == 'media':
                require(not css[start:index].strip(), 'Unparsed content inside CSS media container')
            start = index + 1
    require(not stack and not quote and not escaped and not css[start:].strip() and rules > 0,
            'Incomplete or empty appended workspace stylesheet')
    return rules


def source_maps(value, current):
    checked = 0
    if isinstance(value, dict):
        for key, child in value.items():
            if key in ('source_sha256', 'source_hashes'):
                require(isinstance(child, dict) and bool(child), 'Missing evidence source hashes')
                for name, digest in child.items():
                    require(name in current and Path(name).name == name,
                            'Invalid evidence source: ' + str(name))
                    require(sha(current[name]) == digest, 'Stale evidence source: ' + name)
                    checked += 1
            else:
                checked += source_maps(child, current)
    elif isinstance(value, list):
        checked += sum(source_maps(child, current) for child in value)
    return checked


def verify(root, baseline):
    current, base = files(root), files(baseline)
    require(len(base) == BASE_COUNT and content_digest(base) == BASE_DIGEST,
            'Unexpected complete Quartermaster .52 baseline')
    previous, result = verify_full(base), verify_full(current)
    require(previous['build'] == BASE_BUILD and previous['seal'] == BASE_SEAL,
            'Wrong baseline identity')
    require(result['build'] == BUILD and result['seal'] == SEAL, 'Wrong current identity')
    require(set(base) <= set(current), 'An existing baseline file was removed')
    manifest = parse_json(current, 'DEPLOYMENT_MANIFEST.json')
    prior_manifest = parse_json(base, 'DEPLOYMENT_MANIFEST.json')
    require(manifest['release_name'] == NAME and manifest['version'] == BUILD,
            'Wrong current manifest heading/version')
    require((BUILD + ' \u2022 QUARTERMASTER').encode() in current['index.html'],
            'Current visible heading missing')
    seal = parse_json(current, 'RELEASE_SEAL.json')
    require(all(seal[key] == NAME for key in ('release', 'release_name', 'name', 'releaseName')),
            'Wrong current seal name')
    for name in ('RELEASE_SEAL.json', 'manifest.webmanifest'):
        require(normalize(current[name].decode('utf-8')) == base[name].decode('utf-8'),
                'Behavior outside the current identity changed: ' + name)

    changes = parse_json(current, CHANGES)
    require(changes.get('build') == BUILD and changes.get('baseline') == BASE_BUILD,
            'Wrong workspace change-record identity')
    replacements = changes.get('replacements')
    require(isinstance(replacements, list) and len(replacements) == 2,
            'Expected only complete shell and renderOverview replacements')
    old_js = base['quartermaster.js'].decode('utf-8')
    permitted_old = {}
    for function in ('shell', 'renderOverview'):
        lines = [line for line in old_js.splitlines(keepends=True)
                 if line.lstrip().startswith('function ' + function + '(')]
        require(len(lines) == 1 and lines[0].endswith('}\n'),
                'Baseline render-function boundary is ambiguous: ' + function)
        permitted_old[lines[0]] = function
    require(all(isinstance(edit, dict) and edit.get('file') == 'quartermaster.js'
                and edit.get('count') == 1 and isinstance(edit.get('new'), str)
                and bool(edit['new']) for edit in replacements), 'Unexpected workspace replacement scope')
    require({edit.get('old') for edit in replacements} == set(permitted_old),
            'A replacement extends beyond the two authorized complete functions')
    for edit in replacements:
        function = permitted_old[edit['old']]
        require(re.match(r'^\s*function\s+' + function + r'\(\)\s*\{', edit['new'])
                and edit['new'].endswith('}\n'),
                'Recorded replacement is not a complete render function: ' + function)
        old_ids = re.findall(r'\bid="([^"]+)"', edit['old'])
        new_ids = re.findall(r'\bid="([^"]+)"', edit['new'])
        require(set(old_ids) <= set(new_ids) and len(new_ids) == len(set(new_ids)),
                'Operative IDs were removed or duplicated in ' + function)
        require(re.findall(r'\bdata-qm-tab="([^"]+)"', edit['old']) ==
                re.findall(r'\bdata-qm-tab="([^"]+)"', edit['new']),
                'Tab routes or ordering changed in ' + function)
        assets = r'\b(?:src|href)\s*=\s*[\'"]([^\'"]+)[\'"]'
        require(re.findall(assets, edit['new']) == re.findall(assets, edit['old']),
                'Render function introduces or changes an asset/link dependency: ' + function)
        require(not re.search(r'(?i)<\s*(?:script|iframe|object|embed|link|audio|video|image)\b',
                              edit['new']), 'Unexpected active or network markup in ' + function)
    styles = changes.get('appended_styles')
    require(isinstance(styles, dict) and set(styles) == {'quartermaster.css'},
            'Unexpected appended style scope')
    require({name for name in current if Path(name).suffix in RUNTIME_SUFFIXES} ==
            {name for name in base if Path(name).suffix in RUNTIME_SUFFIXES},
            'Runtime file inventory changed')
    runtime_count = 0
    style_rules = 0
    for name in sorted(base):
        if Path(name).suffix not in RUNTIME_SUFFIXES:
            continue
        old, actual = base[name].decode('utf-8'), current[name].decode('utf-8')
        new = normalize(actual)
        for edit in reversed(replacements):
            if edit['file'] != name:
                continue
            replacement = normalize(edit['new'])
            require(new.count(replacement) == edit['count'], 'Recorded workspace replacement differs: ' + name)
            new = new.replace(replacement, edit['old'], edit['count'])
        if name in styles:
            require(new.startswith(old), 'Existing styles changed: ' + name)
            # Both identity strings retain their lengths. Hash the actual recorded
            # suffix before normalization, including any current-build comment.
            tail = actual[len(old):].encode('utf-8')
            record = styles[name]
            require(len(tail) == record['bytes'] and sha(tail) == record['sha256'],
                    'Appended workspace style bytes differ: ' + name)
            style_rules = verify_styles(tail)
            new = new[:len(old)]
        if name == 'fun_program.js':
            def mask(text):
                return re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}",
                              r'\1PLAYER_HASH', text)
            old, new = mask(old), mask(new)
        require(new == old, 'Behavior outside the declared workspace presentation changed: ' + name)
        runtime_count += 1
    require(runtime_count == 45, 'Expected all 45 original runtime files to be compared')
    new_js = current['quartermaster.js'].decode('utf-8')
    require(new_js.count("className='qm-download'") == 1
            and new_js.count("className='qm-open-pdf'") == 1,
            'The retained download and separate-tab PDF actions must remain unique')

    declarations = manifest['model_integrity']['files']
    prior_declarations = prior_manifest['model_integrity']['files']
    require(set(declarations) == set(prior_declarations), 'Model inventory changed')
    require({k: v for k, v in manifest['model_integrity'].items() if k != 'files'} ==
            {k: v for k, v in prior_manifest['model_integrity'].items() if k != 'files'},
            'Historical model policy metadata changed')
    reference_count = 0
    current_models = set()
    for name, entry in declarations.items():
        prior_entry = prior_declarations[name]
        require(entry['policy'] == prior_entry['policy'], 'Model policy changed: ' + name)
        if entry['policy'] == 'retained-versioned-reference':
            require(current[name] == base[name] and entry == prior_entry,
                    'Retained model or declaration changed: ' + name)
            reference_count += 1
        else:
            require(normalize(current[name].decode('utf-8')) == base[name].decode('utf-8'),
                    'Current model behavior changed: ' + name)
            require(entry | {'build': prior_entry['build'], 'sha256': prior_entry['sha256']} == prior_entry,
                    'Current model declaration semantics changed: ' + name)
            current_models.add(name)
    require(reference_count == 39 and current_models == set(CURRENT_MODELS),
            'Expected exactly four current and 39 retained models')
    preserved = {
        'quartermaster_core.js', 'quartermaster_pdf.js', 'quartermaster_fonts.js',
        'quartermaster_font_license.txt', 'QUARTERMASTER_CAPABILITY.json',
        'CAPABILITY_ADOPTION_MAP.json', 'HOUSEHULL_PLAN.json', 'HOUSEHULL_BUILD_PLAN.md',
        'stormwake_assets.json', 'STORMWAKE_VENDOR.json', 'stormwake_three_vendor.js',
        'STORMWAKE_ART_LICENSES.md', 'STORMWAKE_BUILD_RULES.py',
    } | {name for name in base if Path(name).suffix == '.sql'}
    for name in preserved:
        require(current[name] == base[name], 'Preserved document/schema/art contract changed: ' + name)

    report = parse_json(current, 'STORMWAKE_PLAYER_BUILD.json')
    prior_report = parse_json(base, 'STORMWAKE_PLAYER_BUILD.json')
    require(report['build'] == BUILD and report['runtime_network'] is False,
            'Compiled report identity/network differs')
    require(set(report['inputs_sha256']) == set(prior_report['inputs_sha256']),
            'Compiled-player input inventory changed')
    for name, digest in report['inputs_sha256'].items():
        require(sha(current[name]) == digest, 'Compiled input differs: ' + name)
    player_digest = sha(current['stormwake_player.html'])
    require(report['player'] == {'bytes': len(current['stormwake_player.html']),
                                'sha256': player_digest,
                                'limit_bytes': prior_report['player']['limit_bytes']},
            'Compiled-player size or digest differs')
    require(len(current['stormwake_player.html']) <= report['player']['limit_bytes'],
            'Compiled player exceeds its size limit')
    require({k: v for k, v in report.items() if k not in ('build', 'inputs_sha256', 'player')} ==
            {k: v for k, v in prior_report.items() if k not in ('build', 'inputs_sha256', 'player')},
            'Compiled artwork/vendor metadata changed')
    declared = re.findall(r"\bSTORMWAKE_SHA\s*=\s*['\"]([a-f0-9]{64})['\"]",
                          current['fun_program.js'].decode('utf-8'))
    require(declared == [player_digest], 'Host player reference differs')
    require(normalize(current['BUILD_STORMWAKE_PLAYER.py'].decode('utf-8')) ==
            base['BUILD_STORMWAKE_PLAYER.py'].decode('utf-8'), 'Compiler behavior changed')
    require(manifest['required_runtime_files'] == prior_manifest['required_runtime_files'],
            'Required runtime inventory changed')
    require(set(manifest['runtime_integrity']['files']) == set(prior_manifest['runtime_integrity']['files']),
            'Runtime hash inventory changed')
    require({k: v for k, v in manifest['runtime_integrity'].items() if k != 'files'} ==
            {k: v for k, v in prior_manifest['runtime_integrity'].items() if k != 'files'},
            'Runtime integrity policy changed')
    for name in manifest['required_runtime_files']:
        require(name in current, 'Runtime missing: ' + name)
    for name in ('captain.js', 'styles.css', 'quartermaster.js', 'quartermaster.css'):
        require(manifest['runtime_integrity']['files'][name] == sha(current[name]),
                'Changed runtime unsealed: ' + name)
    require(set(manifest['lazy_program_assets']) == set(prior_manifest['lazy_program_assets']),
            'Lazy asset inventory changed')
    for name, entry in manifest['lazy_program_assets'].items():
        prior = prior_manifest['lazy_program_assets'][name]
        require(entry['sha256'] == sha(current[name]) and entry['bytes'] == len(current[name]),
                'Lazy asset size or digest differs: ' + name)
        require(entry | {'sha256': prior['sha256'], 'bytes': prior['bytes']} == prior,
                'Lazy asset behavior changed: ' + name)
    mutable_manifest = {'build', 'version', 'release_seal', 'release_name', 'release_focus',
                        'release_note', 'runtime_integrity', 'model_integrity',
                        'lazy_program_assets', 'quartermaster_workspace_design'}
    require(set(manifest) == set(prior_manifest) | {'quartermaster_workspace_design'},
            'Unexpected manifest fields added or removed')
    for key in set(prior_manifest) - mutable_manifest:
        require(manifest[key] == prior_manifest[key], 'Prior manifest/history changed: ' + key)
    design = manifest['quartermaster_workspace_design']
    require(design['build'] == BUILD and design['base'] == BASE_BUILD
            and design['base_file_count'] == BASE_COUNT, 'Wrong workspace metadata identity')
    require(design['scope'] == [
        'Quartermaster shell and overview', 'read-only recent saved documents',
        'scoped workspace styles and decorative inline vector artwork',
    ], 'Wrong workspace scope declaration')
    for flag in BOUNDARY_FLAGS:
        require(design[flag] is False, 'Unsupported workspace scope declaration: ' + flag)
    for key in ('quartermaster_visual_refinement', 'quartermaster_pdf_handoff'):
        require(manifest[key] == prior_manifest[key], 'Prior Quartermaster metadata changed: ' + key)

    gate = parse_json(current, 'RELEASE_GATE.json')
    require(gate['build'] == BUILD and gate['release'] == NAME and gate['pass'] is True
            and gate['verification_status'] == STATUS and gate['evidence_file'] == EVIDENCE,
            'Current release gate is pending, failing or mismatched')
    require(gate['prior_release_evidence'] == parse_json(base, 'RELEASE_GATE.json'),
            'Historical .52 gate changed')
    require(all(gate[flag] is False for flag in ('live_database_writes', 'auto_retry', 'data_migration_required')),
            'Unsupported gate side-effect declaration')
    require(gate['native_field_acceptance'] == 'PENDING_FOR_NEW_WORKSPACE_DESIGN',
            'Unobserved native acceptance must remain pending')
    evidence = parse_json(current, EVIDENCE)
    require(evidence['build'] == BUILD and evidence['release'] == NAME
            and evidence['baseline'] == BASE_BUILD and evidence['status'] == STATUS,
            'Wrong current workspace evidence identity/status')
    evidence_sources = source_maps(evidence, current)
    require(set(evidence['source_sha256']) >= {'quartermaster.js', 'quartermaster.css',
            'styles.css', 'business_deck.css', 'quartermaster_core.js',
            'quartermaster_pdf.js', 'quartermaster_fonts.js', CHANGES},
            'Current workspace evidence omits its inputs or exact change map')
    require(evidence['presentation']['passed'] >= 6 and evidence['presentation']['failed'] == 0
            and evidence['pdf_handoff']['passed'] == 13 and evidence['pdf_handoff']['failed'] == 0
            and evidence['workflow']['passed'] == 11 and evidence['workflow']['failed'] == 0,
            'Workspace, PDF handoff or workflow checks are incomplete or failing')
    require(evidence['independent_review']['verdict'] == 'APPROVED'
            and evidence['independent_review']['report'] in current, 'Independent review is missing')
    require(evidence['actual_index']['passed'] == 3 and evidence['actual_index']['failed'] == 0
            and evidence['actual_index']['pending'] is False, 'Actual-index startup gate is incomplete')

    contract = parse_json(current, 'PATCH_CONTRACT.json')
    require(contract['target_build'] == BUILD and contract['target_seal'] == SEAL
            and contract['requires_deletions'] is False and contract['max_upload_files'] == 85
            and contract['database_actions'] == 'none', 'Wrong patch target or mutation contract')
    supported = contract['supported_bases']
    require(len(supported) == 1 and supported[0]['build'] == BASE_BUILD
            and supported[0]['file_count'] == BASE_COUNT
            and supported[0]['content_digest_algorithm'] == CONTENT_DIGEST_ALGORITHM
            and supported[0]['content_sha256'] == BASE_DIGEST, 'Wrong exact .52 patch baseline')
    for name in NOTES:
        require(current[name].endswith(base[name]), 'Previous release notes were changed or lost: ' + name)
        heading = current[name].splitlines()[0].decode('utf-8')
        require(BUILD in heading and NAME in heading and 'TEST' not in heading.upper(),
                'Wrong current note heading: ' + name)
    require(START_NOTE in current and BROWSER_VERIFIER in current,
            'Current workspace start note or browser verifier is missing')
    start_heading = current[START_NOTE].splitlines()[0].decode('utf-8')
    require(BUILD in start_heading and NAME in start_heading and 'TEST' not in start_heading.upper(),
            'Wrong current workspace start heading')
    mutable_files = NOTES | set(CURRENT_MODELS) | set(LEDGERS) | {
        'BUILD_STORMWAKE_PLAYER.py', 'DEPLOYMENT_MANIFEST.json', 'PATCH_CONTRACT.json',
        'RELEASE_SEAL.json', 'RELEASE_GATE.json', 'RELEASE_INVENTORY.json',
        'STORMWAKE_PLAYER_BUILD.json', 'manifest.webmanifest',
    }
    historical_files = 0
    for name in set(base) - mutable_files:
        if Path(name).suffix in RUNTIME_SUFFIXES:
            continue
        require(current[name] == base[name], 'Unrelated baseline/history bytes changed: ' + name)
        historical_files += 1
    patch = {name: body for name, body in current.items() if base.get(name) != body}
    require(0 < len(patch) <= 85 and base | patch == current,
            'Upload exceeds budget or does not reconstruct exact target')
    upload_name = f'DarkSky882053-Quartermaster-Upload{len(patch)}.zip'
    current_note = current['UPLOAD_THIS_ONE_BUILD.md'][:-len(base['UPLOAD_THIS_ONE_BUILD.md'])]
    require(upload_name.encode() in current_note and 'TEST' not in upload_name.upper(),
            'Current upload filename is stale or mislabeled')
    return {'pass': True, 'build': BUILD, 'seal': SEAL, 'file_count': len(current),
            'changed_or_added_files': len(patch), 'maximum_upload_files': 85,
            'baseline_names_retained': BASE_COUNT, 'baseline_content_sha256': BASE_DIGEST,
            'retained_models_exact': reference_count, 'runtime_files_compared': runtime_count,
            'presentation_functions_replaced': len(replacements), 'scoped_style_rules': style_rules,
            'historical_files_exact': historical_files, 'evidence_source_hashes_checked': evidence_sources,
            'core_pdf_fonts_capabilities_schema_art': 'byte-exact .52',
            'behavior_preservation': 'exact after reversing only recorded shell/overview replacements and appended scoped CSS, with current identity/host-digest normalization',
            'scope': 'Offline source/release integrity; browser evidence is scoped separately; native Safari acceptance is not claimed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('release', nargs='?', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('baseline', nargs='?', type=Path)
    args = parser.parse_args()
    root = args.release.resolve()
    baseline = args.baseline.resolve() if args.baseline else root.parent.parent / 'quartermaster-pdf-handoff/release'
    try:
        print(json.dumps(verify(root, baseline), indent=2))
        return 0
    except (PackageError, OSError, KeyError, TypeError, ValueError) as exc:
        print(json.dumps({'pass': False, 'error': str(exc)}, indent=2))
        return 1


if __name__ == '__main__':
    sys.exit(main())
