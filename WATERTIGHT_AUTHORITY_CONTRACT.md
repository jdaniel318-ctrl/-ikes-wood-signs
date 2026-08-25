# Watertight Authority Contract — 7.9.2

## Owner / Partner bulkhead
- Owner / Partner is project-scoped authority.
- Entering an owner portal must never request or accept the Black Flag Engine PIN as the normal owner credential.
- Fleet Dock owner entry routes directly to the project owner login/control center.
- Durable owner bookmarks use `index.html#owner-login=<Project ID>`.
- Black Flag/Captain authentication remains a separate authority boundary.

## Canonical vessel identity
- Fleet Dock must render one canonical vessel per real business identity.
- The known Legacy Plumbing duplicate is folded even if stale contact mirrors differ.
- Project-scoped evidence and references migrate to the survivor before the duplicate row is removed.
- Conflicting contact values are retained as reconciliation evidence for review.

## Promotion hold
Do not promote this build to Known Good until Owner Entrance reaches the owner login without Engine authentication and the Fleet Dock shows only one Legacy Plumbing vessel.
