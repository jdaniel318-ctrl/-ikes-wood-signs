"""Read-only, offline release/delta verification. Never extracts an archive or calls a service.
Usage: python VERIFY_PACKAGE.py --base PRIOR_FULL.zip --update UPDATE.zip --full FULL.zip
Hashes detect inconsistency, not authenticity. Keep trusted full archives separately.
Additional commands: --content-digest FULL.zip; --verify-full FULL.zip [--historical].
PATCH_CONTRACT supported_bases may identify a baseline by original archive `sha256`,
or by `content_sha256` with `content_digest_algorithm: release-content-sha256-v1`.
The content digest is SHA-256 of UTF-8 compact JSON sorted [filename, body SHA-256]
rows (ensure_ascii=True). ZIP timestamps/compression/folder name are excluded;
every release filename and byte is included. This is not an authenticity signature.
Historical verification preserves original archives, including old declaration defects;
strict current runtime model policy is mandatory for the target and reconstruction.
"""
from __future__ import annotations
import argparse, hashlib, json, re, stat, sys, zipfile
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import parse_qs, urlsplit

CONTENT_DIGEST_ALGORITHM = 'release-content-sha256-v1'
CURRENT_MODELS = ('FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json')
LEDGERS = ('CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt')
class PackageError(ValueError): pass

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def content_digest(data: dict[str, bytes]) -> str:
    """Canonical whole-release content identity, independent of the ZIP envelope."""
    rows = [[name, sha(data[name])] for name in sorted(data)]
    return sha(json.dumps(rows,ensure_ascii=True,separators=(',',':')).encode('utf-8'))

def require(condition: bool, reason: str) -> None:
    if not condition: raise PackageError(reason)

def load_archive(path: Path) -> dict[str, bytes]:
    """Validate members before reading. A release is one flat folder matching the ZIP name."""
    require(path.is_file(), f'Missing archive: {path.name}')
    require(path.stat().st_size <= 200*1024*1024, 'Archive exceeds verification size limit')
    data: dict[str, bytes] = {}; seen: set[str] = set(); roots: set[str] = set()
    with zipfile.ZipFile(path) as archive:
        items=archive.infolist()
        require(len(items)<=501, 'Too many archive members')
        require(sum(i.file_size for i in items)<=200*1024*1024, 'Expanded archive is too large')
        for info in items:
            name=info.filename; clean=PurePosixPath(name)
            require(name not in seen, 'Duplicate ZIP entry: '+name);seen.add(name)
            require(not name.startswith('/') and '\\' not in name and '\x00' not in name and '..' not in clean.parts and not any(':' in p for p in clean.parts), 'Unsafe ZIP path: '+name)
            require(not stat.S_ISLNK(info.external_attr>>16), 'Symlink in ZIP: '+name)
            require(not (info.flag_bits & 1), 'Encrypted ZIP member unsupported')
            roots.add(clean.parts[0])
            if info.is_dir():
                require(len(clean.parts)==1, 'Nested directory not permitted')
                continue
            require(len(clean.parts)==2, 'File is outside the single flat release folder: '+name)
            require(info.file_size<=25*1024*1024,'Oversized browser-upload file: '+name)
            require(clean.name not in data,'Duplicate release filename: '+clean.name)
            data[clean.name]=archive.read(info) # zipfile validates member CRC while reading
    require(len(roots)==1 and path.stem in roots,'ZIP filename and internal folder do not match')
    require(bool(data),'Empty release archive')
    return data

def parse_json(data: dict[str,bytes], name: str) -> Any:
    require(name in data, 'Missing file: '+name)
    try: return json.loads(data[name])
    except (ValueError,UnicodeError) as exc: raise PackageError('Invalid JSON: '+name) from exc

def verify_runtime_identity(data: dict[str,bytes], build: str, token: str) -> None:
    """Read the actual current boot identity sources; matching ledgers alone are insufficient."""
    def literals(name,identifier):
        require(name in data,'Missing runtime identity file: '+name)
        return re.findall(r"\bconst\s+"+re.escape(identifier)+r"\s*=\s*['\"]([^'\"]+)['\"]",data[name].decode('utf-8'))
    require(literals('app.js','BUILD_VERSION')==[build],'App runtime build mismatch')
    require('index.html' in data,'Missing runtime identity file: index.html')
    page=re.findall(r"\bDARK_SKY_RELEASE\s*=\s*Object\.freeze\(\{\s*build\s*:\s*['\"]([^'\"]+)['\"]\s*,\s*seal\s*:\s*['\"]([^'\"]+)['\"]\s*\}\)",data['index.html'].decode('utf-8'))
    require(page==[(build,token)],'Page build or seal mismatch')
    require(literals('sw.js','RELEASE_BUILD')==[build] and literals('sw.js','RELEASE_SEAL')==[token],'Worker build or seal mismatch')
    web=parse_json(data,'manifest.webmanifest');start=urlsplit(web.get('start_url',''));query=parse_qs(start.query)
    require(web.get('version')==build and not start.scheme and not start.netloc and start.path in ('./index.html','index.html') and query.get('_darkSkyRelease')==[build] and query.get('_darkSkySeal')==[token],'Webmanifest release identity mismatch')


def verify_full(data: dict[str,bytes], *, historical: bool = False) -> dict[str,Any]:
    m=parse_json(data,'DEPLOYMENT_MANIFEST.json'); seal=parse_json(data,'RELEASE_SEAL.json'); inv=parse_json(data,'RELEASE_INVENTORY.json')
    build=m.get('build'); token=m.get('release_seal')
    require(bool(build) and bool(token),'Missing build or seal')
    require(seal.get('build')==build and seal.get('seal')==token,'Manifest/seal mismatch')
    require(inv.get('build')==build and inv.get('seal')==token,'Inventory identity mismatch')
    require(inv.get('file_count')==len(data) and sorted(inv.get('files',[]))==sorted(data),'Inventory omits or repeats release files')
    for name in LEDGERS: require(name in data,'Missing checksum ledger: '+name)
    require(data[LEDGERS[0]]==data[LEDGERS[1]]==data[LEDGERS[2]],'Checksum ledgers disagree')
    found: set[str]=set()
    for line in data[LEDGERS[0]].decode('utf-8').splitlines():
        match=re.fullmatch(r'([a-f0-9]{64})  ([^/\\]+)',line)
        require(match is not None,'Invalid checksum line')
        digest,name=match.groups()
        require(name not in found,'Duplicate checksum row: '+name);found.add(name)
        require(name in data and name not in LEDGERS,'Unexpected checksum target: '+name)
        require(sha(data[name])==digest,'Checksum mismatch: '+name)
    require(found==set(data)-set(LEDGERS),'Incomplete checksum coverage')
    for name,digest in m.get('runtime_integrity',{}).get('files',{}).items():
        require(name in data and sha(data[name])==digest,'Runtime hash mismatch: '+name)
    for name,entry in m.get('model_integrity',{}).get('files',{}).items():
        require(name in data and sha(data[name])==entry.get('sha256'),'Model hash mismatch: '+name)
    if not historical:
        integrity=m.get('model_integrity',{})
        require(integrity.get('algorithm')=='SHA-256','Current model integrity algorithm must be SHA-256')
        declarations=integrity.get('files',{})
        for name in CURRENT_MODELS:
            require(name in data,'Missing current model file: '+name)
            entry=declarations.get(name)
            require(isinstance(entry,dict),'Missing current model declaration: '+name)
            require(entry.get('policy')=='current-runtime-build','Current model policy mismatch: '+name)
            require(entry.get('build')==build,'Current model declaration build mismatch: '+name)
            model=parse_json(data,name)
            require(isinstance(model,dict) and model.get('build')==build,'Current model body build mismatch: '+name)
            require(name in m.get('required_runtime_files',[]),'Current model omitted from required runtime: '+name)
            require(m.get('runtime_integrity',{}).get('files',{}).get(name)==sha(data[name]),'Current model runtime hash missing or wrong: '+name)
        for name,entry in declarations.items():
            policy=entry.get('policy')
            require(policy in ('current-runtime-build','retained-versioned-reference'),'Unknown model version policy: '+name)
            model=parse_json(data,name)
            require(isinstance(model,dict) and entry.get('build')==model.get('build'),'Model declaration/body build mismatch: '+name)
            if policy=='current-runtime-build':require(entry.get('build')==build,'Current model declaration build mismatch: '+name)
        verify_runtime_identity(data,build,token)
    return {'build':build,'seal':token,'file_count':len(data)}

def verify_package(base: Path, update: Path, full: Path) -> dict[str,Any]:
    original=load_archive(base); patch=load_archive(update); target=load_archive(full)
    previous=verify_full(original,historical=True); current=verify_full(target)
    contract=parse_json(target,'PATCH_CONTRACT.json')
    require(contract.get('target_build')==current['build'] and contract.get('target_seal')==current['seal'],'Patch target mismatch')
    require(contract.get('requires_deletions') is False and contract.get('database_actions')=='none','Unsupported mutation/deletion contract')
    base_sha=sha(base.read_bytes()); base_content=content_digest(original)
    require(any(x.get('build')==previous['build'] and (
        x.get('sha256')==base_sha or (
            x.get('content_digest_algorithm')==CONTENT_DIGEST_ALGORITHM and x.get('content_sha256')==base_content
        )) for x in contract.get('supported_bases',[])), 'Unknown or changed baseline archive/content')
    limit=min(85,int(contract.get('max_upload_files',85)))
    require(0<len(patch)<=limit, f'Update exceeds {limit}-file handoff budget')
    require(set(original)<=set(target),'Release deletes existing baseline files')
    require(set(patch)<=set(target),'Update contains unexpected files')
    for n,b in patch.items(): require(target[n]==b,'Update bytes differ from full release: '+n)
    combined=original|patch
    require(combined==target,'Update is incomplete or mixes builds; full reconstruction failed')
    require(verify_full(combined)==current,'Reconstructed identity mismatch')
    return {'pass':True,'base_build':previous['build'],'target_build':current['build'],'update_files':len(patch),'full_files':len(target),'byte_exact_reconstruction':True,'deleted_files':0,'base_sha256':base_sha,'base_content_sha256':base_content,'content_digest_algorithm':CONTENT_DIGEST_ALGORITHM,'update_sha256':sha(update.read_bytes()),'full_sha256':sha(full.read_bytes()),'scope':'offline archive checks only; not a signature, live audit or Safari test'}

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base',type=Path);parser.add_argument('--update',type=Path);parser.add_argument('--full',type=Path)
    modes=parser.add_mutually_exclusive_group()
    modes.add_argument('--content-digest',type=Path,metavar='ARCHIVE');modes.add_argument('--verify-full',type=Path,metavar='ARCHIVE')
    parser.add_argument('--historical',action='store_true',help='Verify original historical full archive; not available for target/delta validation')
    args=parser.parse_args()
    try:
        if args.content_digest:
            require(not args.historical,'--historical applies only to --verify-full')
            result={'content_digest_algorithm':CONTENT_DIGEST_ALGORITHM,'content_sha256':content_digest(load_archive(args.content_digest)),'scope':'content identity only; not authenticity or runtime validation'}
        elif args.verify_full:
            result={'pass':True,**verify_full(load_archive(args.verify_full),historical=args.historical),'validation':'historical-original' if args.historical else 'current-runtime-models'}
        else:
            require(not args.historical,'Historical exception is forbidden for target/delta validation')
            require(all((args.base,args.update,args.full)),'Provide --base, --update and --full, or use --content-digest / --verify-full')
            result=verify_package(args.base,args.update,args.full)
        print(json.dumps(result,indent=2));return 0
    except (PackageError,OSError,zipfile.BadZipFile,KeyError,TypeError,ValueError) as exc:
        print(json.dumps({'pass':False,'error':str(exc)},indent=2));return 1
if __name__=='__main__':sys.exit(main())
