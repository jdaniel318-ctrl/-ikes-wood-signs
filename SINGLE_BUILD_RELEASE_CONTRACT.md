# Single-Build Release Contract — Dark Sky 8.0.8 Yardarm

Dark Sky must never execute a mixed release. The Engine may paint only after the deployment manifest, `app.js` runtime `BUILD_VERSION`, service-worker build, and unique release seal agree.

## Guardrails

1. **One semantic build:** manifest, runtime, service worker, and UI all remain 8.0.8.
2. **Unique release seal:** `yardarm-808-atomic-6f2c91` busts stale same-version Safari/service-worker assets without inventing a second build number.
3. **Pre-execution verification:** `index.html` fetches the deployment manifest, `app.js`, and `sw.js` with `cache: no-store` before loading any executable platform script.
4. **Hard hold:** any disagreement paints **MIXED BUILD DETECTED** and does not start the Engine.
5. **Safe self-repair:** Clean Release Retry unregisters service workers and removes Dark Sky/Black Flag application caches only. IndexedDB project/order/customer/settings data is untouched.
6. **Atomic service worker:** installation uses `Promise.all`; a missing required core file fails the install instead of creating a half-populated cache.
7. **Seal-bound executables:** every runtime script is requested with the same release seal, so an older same-version cache key cannot silently satisfy a new release.
8. **Upload discipline:** deploy the release as one set. Never cherry-pick `index.html`, `app.js`, `sw.js`, or the manifest from different release folders.

## Captain-visible failure

The Captain should never have to infer a mixed build from scattered cards. A blocked release shows expected build, manifest build, runtime build, and release seal on one recovery surface.
