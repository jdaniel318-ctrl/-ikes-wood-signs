# Black Flag Engine — Dark Sky

**Current release:** v3.6.2 — Spring Cleaning

Dark Sky is the Black Flag multi-project business platform. The Engine provides shared command, project commissioning, owner/device boundaries, project-scoped operations, telemetry, recovery, and Captain-level governance while preserving each business project's independent identity.

## Deployment

This package is intentionally deployable as a small static web application. Upload the contents of this folder together; do not separate `index.html`, the JavaScript files, `styles.css`, `manifest.webmanifest`, `sw.js`, or the referenced `assets/` directory.

For GitHub Pages, publish the folder contents at the site root used by the project. After replacing an older build, allow the service worker to activate and refresh once if the browser was already open.

## Permanent boundaries

- Black Flag owns platform chrome and Engine command surfaces.
- Project customer experiences remain project branded.
- The small Black Flag mark in the lower-right of project shells is the shared return path to the Dark Sky Engine gate.
- Project data and authority are project scoped by default.
- Captain authority remains separate from ordinary project and Engine administration.
- Browser-side controls are not a substitute for server-backed authentication when external production access is introduced.

See `ARCHITECTURE.md` for standing structural rules and `CHANGELOG.md` for the release narrative.
