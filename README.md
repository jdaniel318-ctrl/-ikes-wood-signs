# Dark Sky — Black Flag Business Command Platform

**Current release:** v3.7.0 — Cut the Mooring Lines

Dark Sky is the Black Flag multi-project business platform. Black Flag owns shared command, project commissioning, platform identity, project boundaries, telemetry, recovery, owner/device policy, and Captain governance. Each business remains an independent project with its own brand, workflow, data, media, settings, and authority.

## What changed in v3.7.0

This release moves the underlying application away from its original Ike-specific storage assumptions. The active platform database and local backup keys are now Black Flag/Dark Sky named, project records are expected to carry an explicit `projectId`, project-admin PINs and lockout state are project scoped, project feature settings are sourced from the owning project, and fleet/order reads no longer silently treat unscoped records as Ike's.

A one-time compatibility bridge copies existing legacy Ike storage into the new Black Flag storage and stamps historical unscoped orders as Ike's **only during migration/import**. That compatibility rule is not used during normal runtime authorization.

## Deployment

Upload the entire contents of this folder together. Keep `index.html`, the JavaScript files, `styles.css`, `manifest.webmanifest`, `sw.js`, and the complete `assets/` folder at the same relative paths. GitHub Pages may need one refresh after deployment while the new service worker replaces the previous cache.

## Standing boundaries

- Black Flag owns platform chrome and Engine command surfaces.
- Project customer experiences remain project branded.
- The compact Black Flag mark in the lower-right of project shells is the shared return path to the Dark Sky Engine gate.
- Orders, customers, media, settings, ledgers, owner sessions, and admin authority are project scoped by default.
- Captain's Quarters remains a separately gated authority above ordinary Engine and project administration.
- Client-side controls are not a substitute for server-backed identity and authorization when external production access is introduced.

See `ARCHITECTURE.md` for permanent structural rules and `CHANGELOG.md` for the release narrative.
