"""Read-only, offline release/delta verification. Never extracts an archive or calls a service.
Usage: python VERIFY_PACKAGE.py --base PRIOR_FULL.zip --update UPDATE.zip --full FULL.zip
Hashes detect inconsistency, not authenticity. Keep trusted full archives separately.
"""
from __future__ import annotations
import argparse, hashlib, json, re, stat, sys, zipfile
from pathlib import Path, PurePosixPath
from typing import Any

LEDGERS = ('CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt')
class PackageError(ValueError): pass

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

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

def verify_full(data: dict[str,bytes]) -> dict[str,Any]:
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
    return {'build':build,'seal':token,'file_count':len(data)}

def verify_package(base: Path, update: Path, full: Path) -> dict[str,Any]:
    original=load_archive(base); patch=load_archive(update); target=load_archive(full)
    previous=verify_full(original); current=verify_full(target)
    contract=parse_json(target,'PATCH_CONTRACT.json')
    require(contract.get('target_build')==current['build'] and contract.get('target_seal')==current['seal'],'Patch target mismatch')
    require(contract.get('requires_deletions') is False and contract.get('database_actions')=='none','Unsupported mutation/deletion contract')
    require(any(x.get('build')==previous['build'] and x.get('sha256')==sha(base.read_bytes()) for x in contract.get('supported_bases',[])), 'Unknown or changed baseline archive')
    limit=min(85,int(contract.get('max_upload_files',85)))
    require(0<len(patch)<=limit, f'Update exceeds {limit}-file handoff budget')
    require(set(original)<=set(target),'Release deletes existing baseline files')
    require(set(patch)<=set(target),'Update contains unexpected files')
    for n,b in patch.items(): require(target[n]==b,'Update bytes differ from full release: '+n)
    combined=original|patch
    require(combined==target,'Update is incomplete or mixes builds; full reconstruction failed')
    require(verify_full(combined)==current,'Reconstructed identity mismatch')
    return {'pass':True,'base_build':previous['build'],'target_build':current['build'],'update_files':len(patch),'full_files':len(target),'byte_exact_reconstruction':True,'deleted_files':0,'base_sha256':sha(base.read_bytes()),'update_sha256':sha(update.read_bytes()),'full_sha256':sha(full.read_bytes()),'scope':'offline archive checks only; not a signature, live audit or Safari test'}

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base',type=Path,required=True);parser.add_argument('--update',type=Path,required=True);parser.add_argument('--full',type=Path,required=True)
    args=parser.parse_args()
    try:
        print(json.dumps(verify_package(args.base,args.update,args.full),indent=2));return 0
    except (PackageError,OSError,zipfile.BadZipFile,KeyError,TypeError,ValueError) as exc:
        print(json.dumps({'pass':False,'error':str(exc)},indent=2));return 1
if __name__=='__main__':sys.exit(main())
