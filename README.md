# Dark Sky / Black Flag Engine

**Current release:** v3.7.7 — Hull Integrity

This release closes the current 3.7 foundation cycle by tightening project mutation authorization, deployment ownership, lifecycle transitions, and integrity checks before the Project Control cockpit rebuild.

## What changed
- Every Project Control mutation now requires an unlocked Engine session and the exact active project context.
- Engine fleet-level project writes use an explicit project-scoped authorization gate instead of writing directly.
- Project-owner writes now require an active owner session for the same project plus the appropriate owner capability.
- Owner Portal preview mode can no longer silently mutate live project data because preview does not satisfy owner-session authorization.
- Deployment manifests are sealed to one project ID and namespace, with `crossProjectAccess: deny`, no Engine access, and no owner access.
- Deployment integrity is checked before persistence and boundary mismatches block writes.
- Deployment lifecycle transitions are constrained: draft → Sea Trial → deployed; deployed ↔ paused; active/test states may retire; retired is terminal.
- Owner pause/resume controls only appear for deployed or paused outposts.
- Collection saves now fail closed when the integrity scanner finds critical project/deployment boundary defects.
- Schema advances to 5 and policy metadata to 3.3.
- Service-worker cache bumped for iPad/Safari deployment.
- `HULL_INTEGRITY_AUDIT.md` records the completed pass and remaining production boundary.

## Important boundary
Dark Sky remains a browser-local prototype. v3.7.7 materially improves tenant discipline inside the current architecture, but production public multi-tenant use still requires server-side identity, authorization, session handling, rate limits, secret storage, and server-enforced tenant boundaries.

## Deployment
Upload the contents of this folder together, preserving `assets/`. GitHub Pages may need one refresh while the v3.7.7 service worker replaces the previous cache.

## Next heading
**v3.8 — Command & Visibility.** Rebuild Project Control so the opening screen explains the business immediately: what is happening, what needs attention, how it is performing, what changed, and where the operator should go next.
