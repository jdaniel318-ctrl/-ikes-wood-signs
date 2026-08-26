# Upload This One Build

Upload the entire contents of `DarkSky808-Yardarm-AdmiralSeal` together. Do not cherry-pick individual runtime-control files.

Release seal: `yardarm-808-admiral-seal-4c7e21`
Build: `8.0.8`

## Admiral release rule
The control-plane files in this package are one sealed unit: `index.html`, `owner.html`, `sw.js`, `manifest.webmanifest`, `DEPLOYMENT_MANIFEST.json`, `RELEASE_SEAL.json`, and `RELEASE_INVENTORY.json`.

The Engine will then fetch every required existing repository runtime/asset with `cache: no-store`, verify the 8.0.8 release identity, and execute the exact verified JS/CSS bytes from one in-memory snapshot. The service worker is identity-only and cannot serve stale executable files.

If a required repository runtime/asset is missing or disagrees with the release identity, the Engine remains on Release Hold and names the failing file instead of blending builds.

Project/order/customer/owner data in IndexedDB is outside cleanup scope.
