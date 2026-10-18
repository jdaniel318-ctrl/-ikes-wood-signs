"""Adversarial archive checks. Temporary synthetic ZIPs only; no network or business data."""
from pathlib import Path
import tempfile,unittest,zipfile,json,stat,warnings
from VERIFY_PACKAGE import load_archive,verify_full,verify_package,sha,LEDGERS,PackageError

def full_files(build,seal,extra=None):
    data={'app.js':b'// synthetic unchanged runtime\n'}|(extra or {})
    data['DEPLOYMENT_MANIFEST.json']=json.dumps({'build':build,'release_seal':seal,'runtime_integrity':{'files':{'app.js':sha(data['app.js'])}},'model_integrity':{'files':{}}}).encode()
    data['RELEASE_SEAL.json']=json.dumps({'build':build,'seal':seal}).encode()
    names=sorted(set(data)|{'RELEASE_INVENTORY.json'}|set(LEDGERS))
    data['RELEASE_INVENTORY.json']=json.dumps({'build':build,'seal':seal,'files':names,'file_count':len(names)}).encode()
    ledger=''.join(f'{sha(b)}  {n}\n' for n,b in sorted(data.items())).encode()
    for n in LEDGERS:data[n]=ledger
    return data

def write_zip(path,data):
    with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr(path.stem+'/',b'')
        for n,b in sorted(data.items()):z.writestr(path.stem+'/'+n,b)

class PackagingTests(unittest.TestCase):
    def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
    def tearDown(self):self.tmp.cleanup()
    def fixture(self):
        base=self.root/'baseline.zip';patch=self.root/'patch.zip';full=self.root/'release.zip'
        b=full_files('before','before-seal');write_zip(base,b)
        contract={'target_build':'after','target_seal':'after-seal','requires_deletions':False,'database_actions':'none','max_upload_files':85,'supported_bases':[{'build':'before','sha256':sha(base.read_bytes())}]}
        t=full_files('after','after-seal',{'PATCH_CONTRACT.json':json.dumps(contract).encode(),'new.md':b'plan only'})
        p={n:v for n,v in t.items() if b.get(n)!=v};write_zip(patch,p);write_zip(full,t)
        return base,patch,full,p,t
    def test_known_overlay_is_byte_exact(self):
        b,p,f,_,_=self.fixture();self.assertTrue(verify_package(b,p,f)['byte_exact_reconstruction'])
    def test_missing_update_file_is_rejected(self):
        b,p,f,data,_=self.fixture();del data['new.md'];write_zip(p,data)
        with self.assertRaisesRegex(PackageError,'incomplete'):verify_package(b,p,f)
    def test_altered_update_bytes_are_rejected(self):
        b,p,f,data,_=self.fixture();data['new.md']=b'changed';write_zip(p,data)
        with self.assertRaisesRegex(PackageError,'differ'):verify_package(b,p,f)
    def test_unknown_base_is_rejected(self):
        b,p,f,_,_=self.fixture();data=load_archive(b);data['notes.md']=b'not in inventory';write_zip(b,data)
        with self.assertRaises(PackageError):verify_package(b,p,f)
    def test_checksum_mismatch_is_rejected(self):
        data=full_files('b','s');data['app.js']=b'bad'
        with self.assertRaisesRegex(PackageError,'Checksum mismatch'):verify_full(data)
    def test_missing_ledger_row_is_rejected(self):
        data=full_files('b','s');lines=data[LEDGERS[0]].splitlines(keepends=True)[1:]
        for n in LEDGERS:data[n]=b''.join(lines)
        with self.assertRaisesRegex(PackageError,'Incomplete checksum'):verify_full(data)
    def test_path_traversal_rejected_without_extraction(self):
        p=self.root/'bad.zip'
        with zipfile.ZipFile(p,'w') as z:z.writestr('bad/../escape.txt',b'bad')
        with self.assertRaisesRegex(PackageError,'Unsafe ZIP path'):load_archive(p)
        self.assertFalse((self.root/'escape.txt').exists())
    def test_duplicate_member_is_rejected(self):
        p=self.root/'bad.zip'
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            with zipfile.ZipFile(p,'w') as z:z.writestr('bad/x',b'a');z.writestr('bad/x',b'b')
        with self.assertRaisesRegex(PackageError,'Duplicate ZIP'):load_archive(p)
    def test_nested_release_is_rejected(self):
        p=self.root/'bad.zip'
        with zipfile.ZipFile(p,'w') as z:z.writestr('bad/folder/file.txt',b'bad')
        with self.assertRaisesRegex(PackageError,'single flat'):load_archive(p)
    def test_mismatched_folder_name_is_rejected(self):
        p=self.root/'bad.zip'
        with zipfile.ZipFile(p,'w') as z:z.writestr('different/file.txt',b'bad')
        with self.assertRaisesRegex(PackageError,'do not match'):load_archive(p)
    def test_symlink_is_rejected(self):
        p=self.root/'bad.zip';info=zipfile.ZipInfo('bad/link');info.create_system=3;info.external_attr=(stat.S_IFLNK|0o777)<<16
        with zipfile.ZipFile(p,'w') as z:z.writestr(info,'../../target')
        with self.assertRaisesRegex(PackageError,'Symlink'):load_archive(p)
    def test_mixed_runtime_manifest_is_rejected(self):
        d=full_files('a','s');m=json.loads(d['DEPLOYMENT_MANIFEST.json']);m['runtime_integrity']['files']['app.js']='0'*64;d['DEPLOYMENT_MANIFEST.json']=json.dumps(m).encode();ledger=''.join(f'{sha(b)}  {n}\n' for n,b in sorted(d.items()) if n not in LEDGERS).encode()
        for n in LEDGERS:d[n]=ledger
        with self.assertRaisesRegex(PackageError,'Runtime hash'):verify_full(d)
    def test_oversized_update_batch_is_rejected(self):
        b,p,f,_,_=self.fixture();data={f'f{i}.txt':b'x' for i in range(86)};write_zip(p,data)
        with self.assertRaisesRegex(PackageError,'handoff budget'):verify_package(b,p,f)
if __name__=='__main__':unittest.main(verbosity=2)
