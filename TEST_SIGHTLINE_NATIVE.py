import pathlib,tempfile,unittest,plistlib,re
from MAKE_SIGHTLINE_NATIVE import generate
class ProjectTest(unittest.TestCase):
 def test_source_project_contract(self):
  with tempfile.TemporaryDirectory() as tmp:
   out=generate(pathlib.Path(tmp)/'Sightline')
   info=plistlib.loads((out/'Sightline/Info.plist').read_bytes())
   self.assertIn('NSCameraUsageDescription',info)
   text=(out/'Sightline.xcodeproj/project.pbxproj').read_text()
   defined=set(re.findall(r'^([0-9A-F]{24}) =',text,re.M))
   used=set(re.findall(r'\b[0-9A-F]{24}\b',text));self.assertEqual(used,defined)
   for name in ['SightlineApp.swift','SightlineCaptureController.swift']:
    self.assertIn(name,text);self.assertTrue((out/'Sightline'/name).is_file())
   source=(out/'Sightline/SightlineCaptureController.swift').read_text()
   self.assertIn('carvewright-native-capture-v1',source)
   self.assertIn('not compiled, signed or device-tested',(out/'READ_ME.md').read_text())
if __name__=='__main__': unittest.main()
