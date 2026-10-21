"""Refresh final-byte release hashes without relabeling historical evidence.
Usage: python SEAL_BLACKTIDE.py RELEASE_DIR [--baseline IMMUTABLE_BASELINE] [--manifest-only]
Run after compilation, identity stamping, docs and PATCH_CONTRACT are final. This
helper never changes runtime bodies, reference models, evidence, notes or contracts.
Default also refreshes inventory and three checksum ledgers. --manifest-only leaves
those for the integrator. Run runtime regressions, archive verification and extraction
checks after sealing. Hashes describe byte agreement, not authenticity or authority.
"""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
from VERIFY_PACKAGE import CURRENT_MODELS,LEDGERS,PackageError,parse_json,require,sha,verify_full


def encoded(value):
    return (json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode('utf-8')


def seal_release(root: Path, baseline: Path | None = None, *, manifest_only: bool = False):
    root=Path(root)
    entries=[p for p in root.iterdir() if p.name not in ('.git','__pycache__')]
    require(not any(p.is_symlink() for p in entries),'Release contains a symlink')
    require(not any(p.is_dir() for p in entries),'Release must contain flat files only')
    data={p.name:p.read_bytes() for p in entries if p.is_file()}
    m=parse_json(data,'DEPLOYMENT_MANIFEST.json');seal=parse_json(data,'RELEASE_SEAL.json')
    build=m.get('build');token=m.get('release_seal')
    require(bool(build) and bool(token),'Missing build or release seal')
    require(seal.get('build')==build and seal.get('seal')==token,'Manifest/seal mismatch')
    require(m.get('model_integrity',{}).get('algorithm')=='SHA-256','Model integrity must use SHA-256')
    declarations=m['model_integrity']['files']
    for name in CURRENT_MODELS:
        require(name in declarations,'Missing current model declaration: '+name)
        require(declarations[name].get('policy')=='current-runtime-build','Current model policy mismatch: '+name)
        require(declarations[name].get('build')==build,'Current model declaration build mismatch: '+name)
    for name,entry in declarations.items():
        model=parse_json(data,name)
        require(entry.get('policy') in ('current-runtime-build','retained-versioned-reference'),'Unknown model policy: '+name)
        if entry['policy']=='retained-versioned-reference':
            require(sha(data[name])==entry.get('sha256'),'Retained reference changed: '+name)
            if baseline is not None:require((Path(baseline)/name).read_bytes()==data[name],'Retained reference differs from baseline: '+name)
        else:
            require(entry.get('build')==build and model.get('build')==build,'Current model body/declaration build mismatch: '+name)
            entry['sha256']=sha(data[name])
        require(model.get('build')==entry.get('build'),'Model body/declaration build mismatch: '+name)
    for name in m.get('required_runtime_files',[]):require(name in data,'Missing required runtime file: '+name)
    for name in m.get('runtime_integrity',{}).get('files',{}):
        require(name not in (*LEDGERS,'DEPLOYMENT_MANIFEST.json','RELEASE_INVENTORY.json'),'Generated/self-referential runtime hash: '+name)
        require(name in data,'Missing runtime file: '+name)
        m['runtime_integrity']['files'][name]=sha(data[name])
    for name in CURRENT_MODELS:
        require(name in m.get('required_runtime_files',[]),'Current model omitted from required runtime: '+name)
        require(name in m.get('runtime_integrity',{}).get('files',{}),'Current model runtime hash missing: '+name)
    for name,entry in m.get('lazy_program_assets',{}).items():
        require(name in data,'Missing lazy program asset: '+name);entry['sha256']=sha(data[name])
    data['DEPLOYMENT_MANIFEST.json']=encoded(m)
    if manifest_only:
        (root/'DEPLOYMENT_MANIFEST.json').write_bytes(data['DEPLOYMENT_MANIFEST.json'])
        return {'build':build,'seal':token,'manifest_only':True}
    inv=parse_json(data,'RELEASE_INVENTORY.json')
    inv.update(build=build,seal=token)
    release=m.get('release_name')
    if release:
        for key in ('release','name','release_name','releaseName'):
            if key in inv:inv[key]=release
    inv['files']=sorted(set(data)|set(LEDGERS));inv['file_count']=len(inv['files'])
    data['RELEASE_INVENTORY.json']=encoded(inv)
    ledger=''.join(f'{sha(data[n])}  {n}\n' for n in sorted(data) if n not in LEDGERS).encode('utf-8')
    for name in LEDGERS:data[name]=ledger
    result=verify_full(data) # Validate staged bytes before writing any generated file.
    for name in ('DEPLOYMENT_MANIFEST.json','RELEASE_INVENTORY.json',*LEDGERS):(root/name).write_bytes(data[name])
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('release',type=Path);p.add_argument('--baseline',type=Path);p.add_argument('--manifest-only',action='store_true');args=p.parse_args()
    try:print(json.dumps({'pass':True,**seal_release(args.release,args.baseline,manifest_only=args.manifest_only)},indent=2));return 0
    except (PackageError,OSError,KeyError,TypeError,ValueError) as exc:print(json.dumps({'pass':False,'error':str(exc)},indent=2));return 1
if __name__=='__main__':sys.exit(main())
