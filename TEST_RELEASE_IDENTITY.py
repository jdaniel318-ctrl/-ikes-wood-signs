#!/usr/bin/env python3
"""Pure preparation tests; synthetic next build is NOT a shipped/deployed release."""
import importlib.util, json, unittest, hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('prepare_release',HERE/'PREPARE_RELEASE.py')
module=None
if spec and spec.loader and (HERE/'PREPARE_RELEASE.py').exists():
 module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def jb(v):return (json.dumps(v,indent=2)+'\n').encode()
class IdentityPreparationTests(unittest.TestCase):
 def setUp(self):
  self.assertIsNotNone(module,'Release identity generator is not implemented')
  self.files=module.load_tree(HERE);self.config=json.loads(self.files['RELEASE_CONFIG.json'])
 def test_config_rerun_is_idempotent(self):
  one=module.prepare(self.files,self.config);self.assertEqual(module.prepare(one,self.config),one)
 def test_future_number_does_not_rewrite_shared_javascript(self):
  original=module.prepare(self.files,self.config)
  future={**self.config,'build':'8.8.20.999','name':'FixtureOnly','seal':'fixtureonly-8820999','base':'8.8.20.69','base_files':len(original),'base_sha256':'a'*64}
  next_files=module.prepare(original,future)
  changed_js=[n for n in original if n.endswith('.js') and original[n]!=next_files[n]]
  self.assertEqual(changed_js,['sw.js'])
  self.assertEqual(set(original),set(next_files))
 def test_future_snapshot_rehashes_exact_component_contents(self):
  f=module.prepare(self.files,{**self.config,'build':'8.8.20.999','seal':'fixtureonly-8820999','name':'FixtureOnly'})
  m=json.loads(f['DEPLOYMENT_MANIFEST.json'])
  for name,h in m['runtime_integrity']['files'].items():self.assertEqual(hashlib.sha256(f[name]).hexdigest(),h,name)
  self.assertEqual(m['component_contract']['app_revision'],self.config['app_component_revision'])
 def test_generated_documents_use_new_release_without_component_rewrite(self):
  f=module.prepare(self.files,{**self.config,'build':'8.8.20.999','seal':'fixtureonly-8820999','name':'FixtureOnly'})
  for name in ['index.html','owner.html','sw.js','CURRENT_BASELINE.json','CURRENT_ARCHITECTURE.md','UPLOAD_THIS_ONE_BUILD.md','RELEASE_SEAL.json']:
   self.assertIn(b'8.8.20.999',f[name],name)
  self.assertNotIn(b'8.8.20.999',f['app.js']);self.assertNotIn(b'8.8.20.999',f['captain.js'])
 def test_inventory_names_follow_installed_release(self):
  f=module.prepare(self.files,self.config);i=json.loads(f['RELEASE_INVENTORY.json'])
  self.assertEqual(i['name'],self.config['name']);self.assertEqual(i['release'],self.config['name'])
 def test_preparation_does_not_certify_success(self):
  f=module.prepare(self.files,self.config);g=json.loads(f['RELEASE_GATE.json'])
  self.assertFalse(g['pass']);self.assertEqual(g['verification_status'],'PREPARED_NOT_TESTED')
  self.assertFalse(g['production_certification'])
 def test_unsafe_release_labels_rejected(self):
  for change in [{'name':'<script>alert(1)</script>'},{'build':'../../file'},{'seal':'evil"html'},{'base_sha256':'nope'},{'app_component_revision':'*'}]:
   with self.assertRaises(ValueError):module.prepare(self.files,{**self.config,**change})
 def test_missing_generation_marker_rejected(self):
  f=dict(self.files);f['index.html']=b'<html>No marker</html>'
  with self.assertRaisesRegex(ValueError,'marker'):module.prepare(f,self.config)
 def test_input_snapshot_not_mutated(self):
  before=dict(self.files);module.prepare(self.files,self.config);self.assertEqual(self.files,before)
 def test_no_original_paths_removed(self):
  f=module.prepare(self.files,self.config);self.assertEqual(set(f),set(self.files))
 def test_component_revision_mismatch_rejected(self):
  with self.assertRaisesRegex(ValueError,'component'):module.prepare(self.files,{**self.config,'app_component_revision':'0.0.0'})
 def test_unchanged_customer_and_auth_helpers_are_retained(self):
  f=module.prepare(self.files,self.config)
  for n in ['ike_shop.js','ike_shop_store.js','ike_shop_delivery.js','carvewright_app.js','fleet_supabase.js','input_hygiene.js','business_deck.js','headway_contracts.js','fleet_recovery_core.js','styles.css']:
   self.assertEqual(f[n],self.files[n],n)
 def test_packager_uses_declared_verified_runner(self):
  self.assertTrue(hasattr(module.package,'verification_runner'),'version-independent runner missing')
  f=dict(self.files);d=json.loads(f['CURRENT_BASELINE.json']);d['verification_runner']='VERIFY_RELEASE_ALL.cjs';f['CURRENT_BASELINE.json']=jb(d);f['VERIFY_RELEASE_ALL.cjs']=b'// test runner fixture'
  self.assertEqual(module.package.verification_runner(f),'VERIFY_RELEASE_ALL.cjs')
 def test_runner_path_traversal_rejected(self):
  self.assertTrue(hasattr(module.package,'verification_runner'),'version-independent runner missing')
  f=dict(self.files);d=json.loads(f['CURRENT_BASELINE.json']);d['verification_runner']='../untrusted.cjs';f['CURRENT_BASELINE.json']=jb(d)
  with self.assertRaises(ValueError):module.package.verification_runner(f)
 def test_missing_declared_runner_rejected(self):
  self.assertTrue(hasattr(module.package,'verification_runner'),'version-independent runner missing')
  f=dict(self.files);d=json.loads(f['CURRENT_BASELINE.json']);d['verification_runner']='VERIFY_ABSENT.cjs';f['CURRENT_BASELINE.json']=jb(d)
  with self.assertRaises(ValueError):module.package.verification_runner(f)
if __name__=='__main__':unittest.main(verbosity=2)
