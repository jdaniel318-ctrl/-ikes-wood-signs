# Dark Sky — Hull Integrity Audit

**Release:** v3.7.7 — Hull Integrity

## Mission
Finish the 3.7 foundation cycle by turning project isolation from a navigation convention into a write-time rule throughout the current browser-local architecture.

## Project mutation boundary
- Project Control mutations require an unlocked Engine session.
- The active Engine project ID must exactly match the project being changed.
- Fleet-level Engine controls authorize against the selected project before writing.
- Archived and relationship-ended projects are read-only to normal Engine/project-owner mutation paths.
- Blocked mutations create authorization audit events.

## Owner mutation boundary
- Owner mutations require an active Owner Portal session bound to the same project ID.
- Owner Portal access must be enabled and active.
- Module writes require the matching enabled capability (orders, products, pricing, branding, deployments/kiosks, staff, notifications).
- Preview mode does not satisfy the owner-session mutation gate and therefore cannot alter live business data.

## Deployment boundary
Every normalized deployment is sealed with:
- project ID
- project namespace
- device authorization project ID/namespace
- `crossProjectAccess: deny`
- `engineAccess: false`
- `ownerAccess: false`

The integrity scanner verifies those claims before project collection persistence. A boundary mismatch is critical and blocks the save.

## Deployment lifecycle
Allowed transitions:
- `draft → sea_trial | retired`
- `sea_trial → draft | deployed | retired`
- `deployed → paused | retired`
- `paused → deployed | retired`
- `retired →` no further transition

Owner pause/resume is intentionally limited to deployed/paused outposts. Retirement preserves historical deployment information.

## Persistence posture
`saveCompanies()` runs the project/deployment integrity scanner before persistence. Critical integrity faults fail closed and are audited. Duplicate display names remain warnings because display names are not security identity.

## Production boundary still open
This is strong prototype isolation, not public multi-tenant security. Before production, Dark Sky still needs server-side:
1. authentication and session issuance
2. authorization on every data request/mutation
3. tenant-scoped database queries/constraints
4. secret and credential storage
5. rate limiting and abuse controls
6. invitation/recovery/revocation services
7. audit log durability and tamper resistance
8. security testing against a deployed backend

## Exit criteria for 3.7
- Canonical project identity: complete for current prototype.
- Commissioning/owner handoff foundation: complete for current prototype.
- Project/deployment mutation isolation: complete for current prototype.
- Critical collection writes fail closed: complete.
- Production server-side tenant enforcement: explicitly deferred, not represented as complete.

**Next release:** v3.8 — Command & Visibility.
