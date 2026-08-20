# Dark Sky 5.0.4

Black Flag authentication structure restored after the 5.0 cleanup regression. Normal Engine access uses `5615`; Project Admin uses `4353`; Captain's Quarters uses `19613`; Captain Test Access remains a session-only bypass. Project isolation work from 5.0 remains in place.

# Dark Sky 5.0.3 — Authority Spine + SIG Test Release

This release finishes the 5.0 authentication correction before Signal Restoration sea trials. The authority layers are deliberately different and must not bleed into one another:

- **Project Admin:** `4353` fleet default/recovery credential. A project may add its own scoped PIN, but 4353 remains valid at the project-admin layer.
- **Black Flag / Engine Room:** `5615` during normal operation. Historical `enginePin` storage is ignored so project PINs, migrations, or stale builds cannot redefine Black Flag.
- **Captain's Quarters:** `19613`. Captain authority remains separate from both Engine and project administration.
- **Captain Test Access:** session-only bypass for Engine PIN entry after it is deliberately enabled with both the Engine and Captain credentials. It does not change any PIN and does not bypass Project Admin.

## Stable spine, flexible modules

Dark Sky 5.0 treats authentication, immutable Project ID, project namespaces, layer transitions, permissions, and routing as the stable spine. Business capabilities, manager workspaces, layouts, workflows, and project experiences remain flexible modules inside those boundaries.

## Isolation contract

One project may never inherit another project's UI, admin state, data context, branding, settings, orders, media, or navigation state. Project identity is always resolved by immutable Project ID. Engine project selection is not a customer/admin project session. Crossing into Black Flag clears project-owned surfaces before Engine rendering.

## Signal Restoration test target

The immediate sea-trial path is: Signal Restoration → Project Admin (`4353`) → Project Manager Workspace → Black Flag → Engine (`5615`, unless Captain Test Access is already active) → return/select projects without cross-project carryover.


Key 5.0 changes:
- Added a single Fleet Boundary Spine for transitions between Project Experience, Project Admin, Black Flag Engine, Project Control, and Captain authority.
- Returning to Black Flag now clears every project customer/admin surface before the Engine gate appears.
- Engine unlock now hides Ike, Mugs, Flowers, Signal/universal, PIN, Admin, Orders, Ledger, and owner surfaces before rendering the Engine.
- The previous generic company/admin shortcut that could implicitly fall back to Ike is retired. Project Admin must originate from an explicit project.
- Project Admin gates are stamped with the immutable Project ID that opened them; unlock fails closed if project context changes.
- Project-manager order workflows now use each project's own workflow instead of Ike/global status defaults.
- Async order/admin operations capture and re-check their Project ID before committing UI or data changes.
- Added runtime isolation diagnostics (`darkSkyIsolationSnapshot()` / `darkSkyVerifyIsolation()`) for future Sea Trials.
- Removed the unused legacy Best Option Restoration logo asset; the internal legacy Signal project ID is retained only for data continuity.

# Dark Sky v4.9.7 — Fleet Project Admin Authentication Spine

This release repairs Project Admin authentication at the routing/event layer. The fleet-wide Project Admin default/recovery PIN is **4353** across test, preview, and live project shells. Captain/Test Access cannot override or suppress that credential.

# Dark Sky v4.9.7 — Project Access Contract + Show the Flag

This build standardizes Project Admin access across the fleet: PIN `4353` is the default for every project unless deliberately overridden inside that project. It also repairs Project Admin gate readability and guarantees the canonical Black Flag return mark remains visible on project-owned customer and protected screens.

# Dark Sky v4.9.4 — Capability Authority + Project Manager Workspace

This build separates the Dark Sky master capability library from project authorization and project-manager operations. Capabilities are enabled only in each Project Control Center, while the Project Manager Workspace presents the enabled set in business-specific operational groups. Signal Restoration is the proving ground and now prioritizes restoration operations while keeping visual-placement tooling as an advanced option.