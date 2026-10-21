"""Adversarial archive checks. Temporary synthetic ZIPs only; no network or business data."""
from pathlib import Path
import tempfile,unittest,zipfile,json,stat,warnings
from VERIFY_PACKAGE import load_archive,verify_full,verify_package,sha,LEDGERS,PackageError

CURRENT_MODELS=('FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json')
def refresh_ledgers(data):
    ledger=''.join(f'{sha(b)}  {n}\n' for n,b in sorted(data.items()) if n not in LEDGERS).encode()
    for n in LEDGERS:data[n]=ledger
    return data

def full_files(build,seal,extra=None):
    data={'app.js':f"const BUILD_VERSION='{build}';\n".encode(),'index.html':f"const DARK_SKY_RELEASE = Object.freeze({{build:'{build}',seal:'{seal}'}});".encode(),'sw.js':f"const RELEASE_BUILD='{build}';const RELEASE_SEAL='{seal}';".encode(),'manifest.webmanifest':json.dumps({'version':build,'start_url':f'./index.html?_darkSkyRelease={build}&_darkSkySeal={seal}'}).encode()}|(extra or {})
    for n in CURRENT_MODELS:data[n]=json.dumps({'build':build}).encode()
    data['DEPLOYMENT_MANIFEST.json']=json.dumps({'build':build,'release_seal':seal,'required_runtime_files':list(CURRENT_MODELS),'runtime_integrity':{'files':{n:sha(data[n]) for n in ('app.js','index.html','sw.js','manifest.webmanifest',*CURRENT_MODELS)}},'model_integrity':{'algorithm':'SHA-256','files':{n:{'sha256':sha(data[n]),'build':build,'policy':'current-runtime-build'} for n in CURRENT_MODELS}}}).encode()
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
class CurrentModelTests(unittest.TestCase):
    def change_manifest(self,data,edit):
        m=json.loads(data['DEPLOYMENT_MANIFEST.json']);edit(m);data['DEPLOYMENT_MANIFEST.json']=json.dumps(m).encode();return refresh_ledgers(data)
    def test_rejects_stale_declaration_despite_matching_sha(self):
        for name in CURRENT_MODELS:
            d=full_files('current','s');self.change_manifest(d,lambda m:m['model_integrity']['files'][name].update(build='old'))
            with self.assertRaisesRegex(PackageError,'Current model declaration build'):verify_full(d)
    def test_historical_mode_checks_original_hashes_without_rewriting_known_defect(self):
        d=full_files('current','s');self.change_manifest(d,lambda m:m['model_integrity']['files'][CURRENT_MODELS[0]].update(build='old'))
        self.assertEqual(verify_full(d,historical=True)['build'],'current')
        d[CURRENT_MODELS[0]]+=b' '
        with self.assertRaisesRegex(PackageError,'Checksum mismatch'):verify_full(d,historical=True)
    def test_rejects_stale_body_even_with_all_updated_hashes(self):
        d=full_files('current','s');n=CURRENT_MODELS[0];d[n]=json.dumps({'build':'old'}).encode()
        def edit(m):m['model_integrity']['files'][n]['sha256']=sha(d[n]);m['runtime_integrity']['files'][n]=sha(d[n])
        self.change_manifest(d,edit)
        with self.assertRaisesRegex(PackageError,'Current model body build'):verify_full(d)
    def test_rejects_omitted_required_model_declaration(self):
        d=full_files('current','s');self.change_manifest(d,lambda m:m['model_integrity']['files'].pop(CURRENT_MODELS[0]))
        with self.assertRaisesRegex(PackageError,'Missing current model declaration'):verify_full(d)
    def test_rejects_omitted_model_file_even_if_every_record_is_removed(self):
        d=full_files('current','s');n=CURRENT_MODELS[0];del d[n]
        def edit(m):
            m['model_integrity']['files'].pop(n);m['runtime_integrity']['files'].pop(n);m['required_runtime_files'].remove(n)
        self.change_manifest(d,edit);inv=json.loads(d['RELEASE_INVENTORY.json']);inv['files'].remove(n);inv['file_count']-=1;d['RELEASE_INVENTORY.json']=json.dumps(inv).encode();refresh_ledgers(d)
        with self.assertRaisesRegex(PackageError,'Missing current model file'):verify_full(d)
    def test_rejects_reference_policy_for_current_model(self):
        d=full_files('current','s');self.change_manifest(d,lambda m:m['model_integrity']['files'][CURRENT_MODELS[0]].update(policy='retained-versioned-reference'))
        with self.assertRaisesRegex(PackageError,'Current model policy'):verify_full(d)
    def test_rejects_omitted_model_runtime_hash(self):
        d=full_files('current','s');self.change_manifest(d,lambda m:m['runtime_integrity']['files'].pop(CURRENT_MODELS[0]))
        with self.assertRaisesRegex(PackageError,'Current model runtime hash'):verify_full(d)
    def test_rejects_resealed_wrong_runtime_manifest_build(self):
        d=full_files('current','s');d['app.js']=b"const BUILD_VERSION='old';";self.change_manifest(d,lambda m:m['runtime_integrity']['files'].update({'app.js':sha(d['app.js'])}))
        with self.assertRaisesRegex(PackageError,'App runtime build'):verify_full(d)
    def test_rejects_wrong_page_seal_despite_valid_hashes(self):
        d=full_files('current','s');d['index.html']=b"const DARK_SKY_RELEASE = Object.freeze({build:'current',seal:'wrong'});";self.change_manifest(d,lambda m:m['runtime_integrity']['files'].update({'index.html':sha(d['index.html'])}))
        with self.assertRaisesRegex(PackageError,'Page build or seal'):verify_full(d)
    def test_rejects_wrong_worker_seal_despite_valid_hashes(self):
        d=full_files('current','s');d['sw.js']=b"const RELEASE_BUILD='current';const RELEASE_SEAL='wrong';";self.change_manifest(d,lambda m:m['runtime_integrity']['files'].update({'sw.js':sha(d['sw.js'])}))
        with self.assertRaisesRegex(PackageError,'Worker build or seal'):verify_full(d)
    def test_rejects_wrong_installed_webmanifest_identity(self):
        d=full_files('current','s');d['manifest.webmanifest']=json.dumps({'version':'old','start_url':'./index.html?_darkSkyRelease=old&_darkSkySeal=s'}).encode();self.change_manifest(d,lambda m:m['runtime_integrity']['files'].update({'manifest.webmanifest':sha(d['manifest.webmanifest'])}))
        with self.assertRaisesRegex(PackageError,'Webmanifest release identity'):verify_full(d)
    def test_rejects_wrong_seal(self):
        d=full_files('current','s');d['RELEASE_SEAL.json']=json.dumps({'build':'current','seal':'wrong'}).encode();refresh_ledgers(d)
        with self.assertRaisesRegex(PackageError,'Manifest/seal mismatch'):verify_full(d)

class SealingTests(unittest.TestCase):
    def test_final_byte_sealing_does_not_rewrite_evidence_or_references(self):
        from SEAL_BLACKTIDE import seal_release
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);(root/'.git').mkdir();(root/'.git'/'HEAD').write_text('test metadata');d=full_files('current','s',{'historical-evidence.json':b'{"build":"old","pass":false}\n','reference.json':b'{"build":"old"}\n'})
            m=json.loads(d['DEPLOYMENT_MANIFEST.json']);m['model_integrity']['files']['reference.json']={'build':'old','policy':'retained-versioned-reference','sha256':sha(d['reference.json'])};d['DEPLOYMENT_MANIFEST.json']=json.dumps(m).encode()
            for n,b in d.items():(root/n).write_bytes(b)
            (root/'app.js').write_bytes(b"const BUILD_VERSION='current'; // final compiled bytes\n")
            self.assertEqual(seal_release(root)['build'],'current')
            actual={p.name:p.read_bytes() for p in root.iterdir() if p.is_file()}
            self.assertEqual(actual['historical-evidence.json'],d['historical-evidence.json']);self.assertEqual(actual['reference.json'],d['reference.json']);verify_full(actual)
    def test_sealing_refuses_to_relabel_changed_retained_reference(self):
        from SEAL_BLACKTIDE import seal_release
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);d=full_files('current','s',{'reference.json':b'{"build":"old"}'})
            m=json.loads(d['DEPLOYMENT_MANIFEST.json']);m['model_integrity']['files']['reference.json']={'build':'old','policy':'retained-versioned-reference','sha256':sha(d['reference.json'])};d['DEPLOYMENT_MANIFEST.json']=json.dumps(m).encode()
            for n,b in d.items():(root/n).write_bytes(b)
            before=(root/'DEPLOYMENT_MANIFEST.json').read_bytes();(root/'reference.json').write_bytes(b'{"build":"changed"}')
            with self.assertRaisesRegex(PackageError,'Retained reference changed'):seal_release(root)
            self.assertEqual((root/'DEPLOYMENT_MANIFEST.json').read_bytes(),before)

class ContentDigestTests(unittest.TestCase):
    setUp=PackagingTests.setUp
    tearDown=PackagingTests.tearDown
    fixture=PackagingTests.fixture
    def use_content_base(self):
        from VERIFY_PACKAGE import content_digest,CONTENT_DIGEST_ALGORITHM
        b,p,f,_,t=self.fixture();contract=json.loads(t['PATCH_CONTRACT.json']);contract['supported_bases']=[{'build':'before','content_sha256':content_digest(load_archive(b)),'content_digest_algorithm':CONTENT_DIGEST_ALGORITHM}]
        t['PATCH_CONTRACT.json']=json.dumps(contract).encode();refresh_ledgers(t);write_zip(f,t);old=load_archive(b);write_zip(p,{n:v for n,v in t.items() if old.get(n)!=v})
        return b,p,f
    def test_content_digest_matches_repacked_exact_bytes(self):
        b,p,f=self.use_content_base();data=load_archive(b)
        with zipfile.ZipFile(b,'w',zipfile.ZIP_STORED) as z:
            for n,v in reversed(list(data.items())):z.writestr(b.stem+'/'+n,v)
        self.assertTrue(verify_package(b,p,f)['byte_exact_reconstruction'])
    def test_changed_but_internally_valid_baseline_fails_content_contract(self):
        b,p,f=self.use_content_base();write_zip(b,full_files('before','before-seal',{'changed.txt':b'wrong bytes'}))
        with self.assertRaisesRegex(PackageError,'Unknown or changed baseline'):verify_package(b,p,f)
    def test_content_digest_is_order_independent_and_filename_sensitive(self):
        from VERIFY_PACKAGE import content_digest
        self.assertEqual(content_digest({'a':b'x','b':b'y'}),content_digest({'b':b'y','a':b'x'}))
        self.assertNotEqual(content_digest({'a':b'x'}),content_digest({'b':b'x'}))
    def test_unknown_content_digest_algorithm_is_rejected(self):
        b,p,f=self.use_content_base();t=load_archive(f);c=json.loads(t['PATCH_CONTRACT.json']);c['supported_bases'][0]['content_digest_algorithm']='unknown';t['PATCH_CONTRACT.json']=json.dumps(c).encode();refresh_ledgers(t);write_zip(f,t);old=load_archive(b);write_zip(p,{n:v for n,v in t.items() if old.get(n)!=v})
        with self.assertRaisesRegex(PackageError,'Unknown or changed baseline'):verify_package(b,p,f)

if __name__=='__main__':unittest.main(verbosity=2)
