# Upload Dark Sky 8.0.8 Yardarm — Sealed

This is a **same-build repair overlay**, not a second release. The repository runtime is already 8.0.8; this overlay adds the atomic release seal that prevents Safari/service-worker state from pairing an older cached runtime with the current manifest.

Upload **all files in this folder together**. Do not mix individual files from older Dark Sky folders into the same commit.

The seal verifies the live repository before the Engine starts:

- `DEPLOYMENT_MANIFEST.json` must report 8.0.8.
- `app.js` must expose `BUILD_VERSION = 8.0.8`.
- `sw.js` must report 8.0.8 and the exact Yardarm release seal.
- the required runtime-file list must be complete.

If any check fails, Dark Sky blocks first paint and displays **MIXED BUILD DETECTED**.

`CLEAN RELEASE RETRY` removes only service-worker registrations and Dark Sky/Black Flag application caches. It does **not** delete IndexedDB projects, orders, customers, owner settings, or other project data.
