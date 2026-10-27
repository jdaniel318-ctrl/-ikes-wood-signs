#!/usr/bin/env python3
"""Offline failure-path tests; no network, live records, or credentials."""
import importlib.util, json, hashlib, unittest, tempfile, zipfile, stat
from pathlib import Path
HERE=Path(__file__).resolve().parent
SPEC=importlib.util.spec_from_file_location("pipeline",HERE/"BUILD_RELEASE.py")
pipeline=None
if SPEC and SPEC.loader and (HERE/"BUILD_RELEASE.py").exists():
    pipeline=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(pipeline)
def sha(b):return hashlib.sha256(b).hexdigest()
def jb(x):return (json.dumps(x,indent=2)+"\n").encode()
def fixture():
    files={"app.js":b"// sealed app\n","owner.html":b"<h1>unchanged</h1>\n"}
    files["DEPLOYMENT_MANIFEST.json"]=jb({"build":"1.2.3","release_name":"Fixture","release_seal":"fixture-123",
      "runtime_integrity":{"files":{"app.js":sha(files["app.js"]),"owner.html":sha(files["owner.html"]) }},
      "model_integrity":{"files":{}},"required_runtime_files":["app.js","owner.html"]})
    files["RELEASE_SEAL.json"]=jb({"build":"1.2.3","seal":"fixture-123"})
    files["CURRENT_BASELINE.json"]=jb({"build":"1.2.3","seal":"fixture-123"})
    files["RELEASE_INVENTORY.json"]=jb({"build":"1.2.3","seal":"fixture-123","file_count":7,
      "files":sorted([*files,"RELEASE_INVENTORY.json","CHECKSUMS.sha256"])})
    files["CHECKSUMS.sha256"]="".join(sha(v)+"  "+k+"\n" for k,v in sorted(files.items())).encode()
    return files
class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(pipeline,"BUILD_RELEASE.py is required; no release pipeline exists yet")
    def test_valid_sealed_fixture(self):
        self.assertEqual(pipeline.verify_release(fixture())["build"],"1.2.3")
    def test_target_contract_mismatch_blocked(self):
        self.assertTrue(hasattr(pipeline,"verify_target"),"target identity validation missing")
        with self.assertRaisesRegex(ValueError,"target"):
            pipeline.verify_target({"target_build":"9.9.9","target_seal":"other"},{"build":"1.2.3","seal":"fixture-123"})
    def test_tampered_runtime_blocked(self):
        f=fixture();f["app.js"]+=b"tamper"
        with self.assertRaisesRegex(ValueError,"digest|checksum"):pipeline.verify_release(f)
    def test_missing_runtime_blocked(self):
        f=fixture();del f["owner.html"]
        with self.assertRaises(ValueError):pipeline.verify_release(f)
    def test_unlisted_extra_blocked(self):
        f=fixture();f["extra.txt"]=b"oops"
        with self.assertRaisesRegex(ValueError,"inventory"):pipeline.verify_release(f)
    def test_wrong_manifest_seal_blocked(self):
        f=fixture();f["RELEASE_SEAL.json"]=jb({"build":"1.2.3","seal":"other"})
        with self.assertRaises(ValueError):pipeline.verify_release(f)
    def test_modified_unhashed_document_blocked(self):
        f=fixture();f["CURRENT_BASELINE.json"]+=b" "
        with self.assertRaisesRegex(ValueError,"checksum"):pipeline.verify_release(f)
    def test_removed_baseline_file_blocked(self):
        with self.assertRaisesRegex(ValueError,"removed"):pipeline.delta({"a":b"a","b":b"b"},{"a":b"a"})
    def test_delta_only_changed_and_added(self):
        d=pipeline.delta({"a":b"a","b":b"b"},{"a":b"a","b":b"c","c":b"d"})
        self.assertEqual(d,{"changed":["b"],"added":["c"],"unchanged":1})
    def test_no_source_output_nesting(self):
        with tempfile.TemporaryDirectory() as t:
            r=Path(t)/"source";r.mkdir()
            with self.assertRaisesRegex(ValueError,"outside"):pipeline.require_external_output(r,r/"out")
    def test_existing_output_refused(self):
        with tempfile.TemporaryDirectory() as t:
            r=Path(t)/"source";r.mkdir();o=Path(t)/"out";o.mkdir()
            with self.assertRaisesRegex(ValueError,"exists"):pipeline.require_external_output(r,o)
    def test_source_symlink_refused(self):
        with tempfile.TemporaryDirectory() as t:
            r=Path(t);(r/"real").write_text("x");(r/"link").symlink_to(r/"real")
            with self.assertRaisesRegex(ValueError,"symlink"):pipeline.load_tree(r)
    def test_traversal_zip_refused(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"bad.zip"
            with zipfile.ZipFile(p,"w") as z:z.writestr("root/../bad",b"x")
            with self.assertRaises(ValueError):pipeline.read_zip(p)
    def test_multiroot_zip_refused(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"bad.zip"
            with zipfile.ZipFile(p,"w") as z:z.writestr("one/a",b"x");z.writestr("two/b",b"y")
            with self.assertRaises(ValueError):pipeline.read_zip(p)
    def test_zip_symlink_refused(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"bad.zip";i=zipfile.ZipInfo("root/link");i.create_system=3;i.external_attr=(stat.S_IFLNK|0o777)<<16
            with zipfile.ZipFile(p,"w") as z:z.writestr(i,"/elsewhere")
            with self.assertRaisesRegex(ValueError,"symlink"):pipeline.read_zip(p)
    def test_duplicate_case_refused(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"bad.zip"
            with zipfile.ZipFile(p,"w") as z:z.writestr("root/A",b"x");z.writestr("root/a",b"y")
            with self.assertRaises(ValueError):pipeline.read_zip(p)
    def test_wrong_baseline_digest_refused(self):
        with self.assertRaisesRegex(ValueError,"baseline"):pipeline.verify_baseline(fixture(),"bad",[{"source_sha256":"expected","build":"1.2.3","file_count":7}])
    def test_reproducible_zip_and_roundtrip(self):
        with tempfile.TemporaryDirectory() as t:
            a=Path(t)/"a.zip";b=Path(t)/"b.zip";f=fixture()
            pipeline.write_zip(a,"Release",f,(2026,10,27,20,0,0));pipeline.write_zip(b,"Release",f,(2026,10,27,20,0,0))
            self.assertEqual(a.read_bytes(),b.read_bytes());self.assertEqual(pipeline.read_zip(a),f)
    def test_empty_zip_refused(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"empty.zip"
            with zipfile.ZipFile(p,"w"):pass
            with self.assertRaises(ValueError):pipeline.read_zip(p)
    def test_success_marker_not_assumed(self):
        with tempfile.TemporaryDirectory() as t:
            # A failing subprocess is NOT a successful verification.
            import sys
            with self.assertRaisesRegex(ValueError,"failed"):pipeline.run_check([sys.executable,"-c","raise SystemExit(3)"],HERE,Path(t)/"failure.log")
if __name__=="__main__":unittest.main(verbosity=2)
