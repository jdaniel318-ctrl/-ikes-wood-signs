# Dark Sky 8.0.4 — Lookout

**Candidate release:** 8.0.4 Lookout  
**Known Good anchor:** 7.8.4 Harbor Exit

Lookout calibrates the confidence system so **safe does not become annoying**. A strong, diagnostically distinctive wood image may clear species identification from one photo, and a clearly separated known rack length may clear length from one full-plank photo. Extra evidence is requested only when the required confidence is not earned.

## What changed

- Species confidence is now **feature-weighted**, not globally loosened.
- Cedar can clear from one strong photo only when multiple independent clues agree: reddish heartwood, pale sapwood, heartwood/sapwood contrast, and grain/texture evidence.
- Oak remains family-only unless the exact priced species is safely resolved or the customer confirms Red Oak vs White Oak.
- Length remains inventory-constrained; a single photo may resolve a known rack length only when geometry, framing, and separation from alternative rack lengths are strong.
- If both species and length need more evidence, the customer is asked for **one better full-plank photo first**, not two chores at once.
- That same second full-plank photo is reused as species evidence. A specialized grain photo appears only if species still needs help afterward.
- Price remains locked until exact species, confirmed length, and an active owner rate are all resolved.

## Price contract

`resolved priced species × resolved rack length = one simple customer price`

Lookout never converts weak evidence into a customer price.

## Sea trial

Use the same cedar test plank without a tape measure. A clear normal photo should proceed immediately when both confidence gates are earned. If not, verify that Lookout asks for the minimum additional evidence necessary, one step at a time.

See `LOOKOUT_CONFIDENCE_CONTRACT.md`, `GRAIN_GUARD_CONTRACT.md`, and `SIGHTLINE_LENGTH_CONTRACT.md`.
