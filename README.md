# Dark Sky / Black Flag Engine

**Current release:** v3.8.14 — Project-Specific Preview & Customer Review Refit

This release stops adding surface features long enough to test the Engine as a system and begins formally separating reusable Dark Sky foundations from Engine-specific business behavior.

## What changed
- Added a non-destructive Sea Trials station to Engine Configuration.
- Sea Trials check structural integrity, immutable project identity, cross-project authorization, order ownership, deployment boundaries, lifecycle transitions, mission navigation, local persistence, and the Ship's Log.
- Production server identity remains an explicit caution; the browser-local prototype is not presented as production multi-tenant security.
- Corrected Structural Status so Project Envelopes report against the active schema (6), not the obsolete schema-3 comparison.
- Added `FLEET_FOUNDATIONS.md`: Engine is the first ship; Captain's Quarters is the shipyard; future ships reuse Dark Sky primitives without inheriting Engine baggage.
- Added `SEA_TRIALS_AUDIT.md` with permanent regression voyages.
- Added a machine-readable Fleet Foundation catalog to `platform_core.js` for later extraction.
- Advanced cache/version references to v3.8.14.

## Current course
Finish Sea Trials and repair anything they expose. Only then proceed to **v3.9 — Operating Models**, where reusable business capabilities are extracted from the current vessels.

## Security boundary
Passing Sea Trials does **not** certify GitHub Pages/browser-local Dark Sky for unrelated production tenants. Real production identity, authorization, sessions, secrets, tenant data controls, revocation, and durable server audit remain future infrastructure.


## v3.8.14 focus
Customer-facing previews now declare business-specific geometry instead of assuming every product is a flat sign. The Add Project fleet tile also uses the same commissioning path as the Engine toolbar. See `PROJECT_SPECIFIC_PREVIEW_AUDIT.md`.
