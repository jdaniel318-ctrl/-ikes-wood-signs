# 6.0.3 Captain Recovery Note

The Captain’s Quarters visual benchmark is the 5.7.9 Quarterdeck surface. This release intentionally restores that Captain-only implementation while retaining the reconciled 6.0 root application tree. Do not reintroduce the 5.8.x Helm render fork unless it is isolated behind a separate experimental path.

# Dark Sky 6.0.3 — Drydock Refit Repository Reconciliation

## Canonical deployment layout
Application/runtime files belong at the repository root. `assets/` contains media only.

### Root runtime
- index.html
- app.js
- captain.js
- styles.css
- sw.js
- platform_core.js
- platform_identity.js
- platform_v4.js
- manifest.webmanifest

### Canonical Captain environment
- assets/captains_quarters_canonical.png

All Captain runtime and fallback references point to this single asset. No alternate Captain background may be selected by load timing or fallback logic.

## GitHub cleanup required after upload
If older full-app files remain under GitHub `/assets`, remove only the non-media duplicates from that folder after the 6.0.3 root deployment is confirmed. Do not delete current logo/image assets.

Non-media files that must not live under `/assets` include: index.html, app.js, captain.js, styles.css, sw.js, platform_*.js, manifest.webmanifest, README/audit/architecture files, deployment manifests, and checksum files.
