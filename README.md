# Dark Sky 8.0.1 — Owner Bridge

**Candidate release:** 8.0.1 Owner Bridge  
**Known Good anchor:** 7.8.4 Harbor Exit  
**Status:** Candidate — requires Captain sea-trial evidence before promotion.

Owner Bridge is the project-owner authority release built on the canonical six-vessel Keelson fleet. Its purpose is to make the **Owner / Partner Control Center a standalone, project-scoped surface** that does not depend on Black Flag Engine authentication or full Engine startup.

## What this release changes

- **Standalone Owner / Partner entry:** Fleet Dock opens the dedicated `owner.html` project-owner surface directly.
- **Project-scoped authority:** Owner login and Owner Control Center remain bound to the immutable project ID and never require the Black Flag Engine PIN.
- **Owner refresh persistence:** an authenticated owner refresh should restore the owner surface in the same project boundary rather than fall back to Engine Access or generic Route Recovery.
- **Independent owner boot:** the owner shell can render before fleet reconciliation, telemetry, migrations, and other Engine-only background work finish.
- **Safe failure surface:** if owner initialization genuinely fails, the failure remains owner-safe and exposes no other project or Captain authority.
- **Canonical fleet preserved:** the six-vessel source-of-truth roster, Fleet Dock hierarchy, callsigns, and duplicate-business reconciliation remain intact.
- **Clean first paint preserved:** no project identity may flash on an unrelated route during refresh/startup.
- **Readable state feedback:** consequential actions should remain visible long enough to read and leave a durable result after transient confirmation disappears.

## First sea-trial sequence

1. Open the normal Engine route and confirm Black Flag Engine Access appears without an Ike/project flash.
2. Enter the Engine and confirm Fleet Dock still shows the canonical six-vessel roster.
3. Open **Ike’s Wood Signs → Owner / Partner → Control Center**.
4. Confirm the Ike Business Portal/owner login opens directly — not Engine Access and not generic Business Portal Route Recovery.
5. Sign in, confirm Ike’s Owner Control Center renders, then refresh once.
6. Confirm refresh remains inside Ike’s Owner authority and project boundary.

Do **not** promote 8.0.1 to Known Good until those owner-authority steps are proven in the deployed build.

## Release contracts

- `OWNER_BRIDGE_CONTRACT.md` — standalone owner application contract.
- `BREAKWATER_OWNER_HANDOFF_CONTRACT.md` — protected owner handoff rules inherited from 8.0.0.
- `KEELSON_CANONICAL_FLEET_CONTRACT.md` — one canonical fleet roster / one source of truth.
- `TRUE_HELM_ROUTE_CONTRACT.md` — explicit route authority and Engine precedence.
- `BULKHEAD_SESSION_CONTRACT.md` — Owner/Captain session separation.
- `CLEAN_WAKE_FIRST_PAINT_CONTRACT.md` — no cross-project first-paint bleed.
- `PROVING_GROUND.md` — release proving and evidence rules.
- `CHANGELOG.md` — release history.

## Packaging contract

This release is delivered as one clean top-level folder with a unique release-folder identity for reliable iPad extraction. Runtime identity, service-worker/cache identity, deployment manifest, release gate, README, and checksums must all agree with the current release before handoff.
