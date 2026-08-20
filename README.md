# Dark Sky 5.0.1 — Fleet Boundary Hardening

Dark Sky 5.0 is a structural cleanup release. Its primary contract is simple: **one project may never inherit another project's UI, admin state, data context, or navigation state.** Project identity is always the immutable Project ID. Project Admin remains project-scoped with fleet default/recovery PIN **4353**. Engine and Captain authority remain separate layers.

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
