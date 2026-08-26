# Dark Sky 8.1.1 — Admiral Doctrine

**Release seal:** `admiral-doctrine-811-root-keel-7f3a2c`

Admiral Doctrine turns lessons from the 8.0.x/8.1.0 sea trials into retained fleet contracts and automated preflight checks. The final Known Good promotion remains manual, but repeatable release identity, authority, isolation, detector-independence, and artifact checks run automatically.

For Ike's, proven orientation/species recognition is restored on its own visual path while Plumb Line length segmentation runs independently. A length abstention can no longer erase Cedar or Horizontal.

See `ADMIRAL_RELEASE_DOCTRINE.json`, `ADMIRAL_RELEASE_DOCTRINE.md`, and the Proving Ground engineering evidence.

---

# Dark Sky 8.1.0 — Plumb Line

Plumb Line is the second-pass length-classification build. It learns the photo background, isolates a cross-eroded wood core, grows the true live-edge silhouette into pale sapwood only where pixels remain distinct from the scene, and removes camera height/frame occupancy from the customer contract. One-photo 2 ft auto-resolution is permitted only when the calibrated silhouette passes stability and separation gates.

Release seal: `plumb-line-810-root-keel-5d82b4`

See `PLUMB_LINE_LENGTH_CONTRACT.md` and `PLUMB_LINE_CALIBRATION_AUDIT.json`.

---

# Dark Sky 8.0.9 — Keel Gauge — Root Keel

**Release seal:** `keel-gauge-809-root-keel-a7c341`  
**Length mission:** silhouette-first segmentation + real-stock 2 ft calibration.

Keel Gauge fixes the key lesson from Yardarm: the length classifier was often measuring warm countertop contamination instead of the plank. Geometry now starts from a strong saturated wood core, chooses a centered elongated non-border component, and only then pads the contour to include pale sapwood. The known 2 ft cedar plank is the first real-stock calibration; 4 ft and 6 ft remain intentionally conservative until known physical examples are supplied.

See `KEEL_GAUGE_LENGTH_CONTRACT.md`.

# Dark Sky 8.0.8 — Yardarm — Root Keel

**Release seal:** `yardarm-808-root-keel-6a31fd`  
**Deployment contract:** root-upload-safe; every executable and required visual file is a repository-root file. No nested `assets/` upload is required.

Root Keel repairs the iPad/GitHub web-upload failure discovered during Full Keel testing. The Engine now treats executable/runtime identity as fleet-critical while Admiral/Captain/project imagery is route-scoped. A missing ceremonial image can never sink Black Flag Engine again.

The boot verifier still fetches and freezes the complete executable snapshot with `cache:no-store` before Engine paint. Route media is checked/fallback-rendered when its route opens.

# Dark Sky 8.0.8 — Yardarm — Full Keel Snapshot (Admiral Seal)

**Release seal:** `yardarm-808-root-keel-6a31fd`  

**Full snapshot status:** PASS — all required executable runtime files and required assets are physically aboard this ZIP.
**First-paint bulkhead:** raw Engine DOM remains hidden until verified CSS/runtime release the shield.
**Execution model:** complete no-store runtime snapshot → execute exact verified in-memory bytes → identity-only service-worker sentinel → Engine paint.

This repair hardens the shipyard itself. A stale service worker can no longer serve executable JavaScript/CSS, and the Engine cannot execute a second network response after verification. If any required runtime file or required asset is missing or disagrees with 8.0.8, first paint remains blocked with a durable Release Hold.

See `ADMIRAL_RELEASE_BULKHEAD.md` and `RELEASE_INVENTORY.json`.

# Dark Sky 8.0.8 — Yardarm (One-Build Recovery Hardened)

**Release seal:** `yardarm-808-root-keel-6a31fd`  
**Service-worker URL:** stable `./sw.js`  
**Recovery contract:** visible unregister → cache cleanup → fresh worker registration → identity verification → reload.

# Dark Sky 8.0.8 — Yardarm

**Candidate release:** 8.0.8 Yardarm  
**Known Good anchor:** 7.8.4

Yardarm strengthens Ike's automatic length handling. Instead of converting a photographed board's aspect ratio through one assumed board width, Dark Sky now classifies the plank against Ike's known rack-length families using pixel geometry. Strong evidence can resolve the stock length from one normal customer photo; ambiguous evidence still asks rather than guesses.

## What changed

- Replaced the old nominal-width length estimate with an **inventory-ratio pixel classifier** for 2 ft / 4 ft / 6 ft stock.
- Added calibrated aspect-ratio bands with conservative overlap zones and explicit boundary-distance checks.
- A fully framed, geometry-stable 2 ft plank can now clear from one strong photo when its ratio sits safely inside the 2 ft core band.
- Pixel-derived length remains **visual evidence, not survey-grade measurement** and carries an Ike visual-review requirement before production.
- Persisted order proof now includes aspect ratio, classifier band, boundary distance, and pixel dimensions.
- Preserves Visual Helm's reversible photo rotation, top-of-photo authority, right-side forward camera action, real-sign lettering styles, Cedar/species sanity guards, Owner Bridge, and the canonical six-vessel fleet.

## Acceptance test

Photograph the known 2 ft cedar test plank once with the whole board visible and no tape measure. Rotate as needed and use the photo. The preferred result is **Horizontal → Cedar → 2 ft → $18** from one strong view. If the ratio lands near an ambiguous boundary, Dark Sky must request more evidence rather than force a length.

See `YARDARM_LENGTH_CONTRACT.md`, `VISUAL_HELM_CONTRACT.md`, and `CHANGELOG.md`.
