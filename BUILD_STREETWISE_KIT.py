"""Rebuild the standalone Streetwise download from the released public assets."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent


def build():
    manifest = json.loads((ROOT / "STREETWISE_PACKAGE.json").read_bytes())
    page = (ROOT / "streetwise.html").read_text(encoding="utf-8")
    before, start, rest = page.partition("    <!-- fleet-download-start -->")
    _, end, after = rest.partition("    <!-- fleet-download-end -->\n")
    if not start or not end:
        raise ValueError("The Fleet download section could not be located.")
    files = {"index.html": (before + after).encode()}
    names = [manifest["entry"], manifest["stylesheet"], manifest["source"], "STREETWISE_PACKAGE.json"]
    names.extend(f"streetwise_rva_{bucket:02}.json" for bucket in range(16))
    for name in names:
        files[name] = (ROOT / name).read_bytes()
    name = f"Streetwise-{manifest['version']}-Standalone.zip"
    if f'href="{name}" download' not in rest:
        raise ValueError("The workspace download link must match the package version.")
    with ZipFile(ROOT / name, "w") as archive:
        for filename, content in sorted(files.items()):
            entry = ZipInfo(f"Streetwise/{filename}")
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, content, compress_type=ZIP_DEFLATED, compresslevel=6)
    return name


if __name__ == "__main__":
    print(build())
