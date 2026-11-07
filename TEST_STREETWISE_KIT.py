"""Keep the downloadable ship kit in sync with the address field tested in Fleet."""
import json
import unittest
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.local_assets = set()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        for key in ("href", "src"):
            if key in attrs:
                self.local_assets.add(attrs[key])


class ShipKitTest(unittest.TestCase):
    def test_kit_matches_workspace(self):
        manifest = json.loads((ROOT / "STREETWISE_PACKAGE.json").read_bytes())
        filename = f"Streetwise-{manifest['version']}-Standalone.zip"
        fleet = Links()
        fleet.feed((ROOT / "streetwise.html").read_text())
        self.assertIn(filename, fleet.local_assets)
        expected = {manifest["entry"], manifest["stylesheet"], manifest["source"], "STREETWISE_PACKAGE.json"}
        expected.update(f"streetwise_rva_{i:02}.json" for i in range(16))
        with ZipFile(ROOT / filename) as kit:
            self.assertIsNone(kit.testzip())
            self.assertCountEqual(kit.namelist(), ["Streetwise/" + n for n in expected | {manifest["example"]}])
            for name in expected:
                self.assertEqual(kit.read("Streetwise/" + name), (ROOT / name).read_bytes(), name)
            portable = Links()
            portable.feed(kit.read("Streetwise/" + manifest["example"]).decode())
            self.assertTrue(portable.local_assets <= expected)
            self.assertEqual(portable.local_assets | {filename}, fleet.local_assets)


if __name__ == "__main__":
    unittest.main()
