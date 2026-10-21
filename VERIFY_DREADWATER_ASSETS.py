"""Offline build boundary tests; no network or image alteration."""
import copy, importlib.util, json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('rules',ROOT/'STORMWAKE_BUILD_RULES.py')
rules=importlib.util.module_from_spec(spec);spec.loader.exec_module(rules)
class AssetRules(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.art=json.loads((ROOT/'stormwake_assets.json').read_text())
 def test_valid_pinned_art(self):
  result=rules.validate_art((ROOT/'stormwake_assets.json').read_bytes());self.assertEqual(result['maps'],8);self.assertEqual(result['decoded_bytes'],3044280)
 def test_remote_url_rejected(self):
  a=copy.deepcopy(self.art);a['textures']['wood']['map']='https://example.com/texture.jpg'
  with self.assertRaisesRegex(ValueError,'embedded JPEG'):rules.validate_art(json.dumps(a).encode())
 def test_corrupt_embedded_map_rejected(self):
  a=copy.deepcopy(self.art);a['textures']['wood']['map']=a['textures']['wood']['map'][:-8]+'AAAAAAAA'
  with self.assertRaises(ValueError):rules.validate_art(json.dumps(a).encode())
 def test_missing_family_rejected(self):
  a=copy.deepcopy(self.art);del a['textures']['cloth']
  with self.assertRaisesRegex(ValueError,'families'):rules.validate_art(json.dumps(a).encode())
 def test_oversized_art_rejected_before_parse(self):
  with self.assertRaisesRegex(ValueError,'4 MiB'):rules.validate_art(b' '*(rules.ART_LIMIT+1))
 def test_unexpected_executable_slot_rejected(self):
  a=copy.deepcopy(self.art);a['textures']['wood']['script']='alert(1)'
  with self.assertRaisesRegex(ValueError,'map slots'):rules.validate_art(json.dumps(a).encode())
 def test_vendor_exact_digest(self):
  self.assertEqual(rules.validate_vendor(ROOT)['version'],'0.180.0')
 def test_explicit_player_budget(self):
  rules.check_player(b'x'*2000000)
  with self.assertRaisesRegex(ValueError,'8 MiB'):rules.check_player(b'x'*(rules.PLAYER_LIMIT+1))
if __name__=='__main__':unittest.main(verbosity=2)
