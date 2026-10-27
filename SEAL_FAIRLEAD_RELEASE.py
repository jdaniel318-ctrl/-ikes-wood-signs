#!/usr/bin/env python3
"""Recompute current content hashes/inventory in a prepared Fairlead source tree.
Does not certify tests, deploy, delete source, or change any application/database records.
"""
from pathlib import Path
import hashlib,json,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parent).resolve()
def load(name):return json.loads((root/name).read_text())
def write(name,value):(root/name).write_text(json.dumps(value,indent=2)+'\n')
def sha(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()
def files():return sorted(p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and '.git' not in p.relative_to(root).parts)
m=load('DEPLOYMENT_MANIFEST.json')
if m['build']!='8.8.20.68' or m['release_seal']!='fairlead-882068':raise SystemExit('Refusing to seal a different release.')
for name in m['runtime_integrity']['files']:m['runtime_integrity']['files'][name]=sha(name)
for name,item in m['model_integrity']['files'].items():
 item['sha256']=sha(name)
 if item.get('policy')=='current-runtime-build':item['build']=m['build']
 if 'bytes' in item:item['bytes']=(root/name).stat().st_size
write('DEPLOYMENT_MANIFEST.json',m)
inv=load('RELEASE_INVENTORY.json');inv['files']=files();inv['file_count']=len(inv['files']);write('RELEASE_INVENTORY.json',inv)
checks={'CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt'}
text=''.join(sha(name)+'  '+name+'\n' for name in files() if name not in checks)
for name in checks:(root/name).write_text(text)
print('Sealed source files:',inv['file_count'],'runtime digests:',len(m['runtime_integrity']['files']))
