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
