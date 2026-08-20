# Dark Sky v4.9.7 — Fleet Project Admin Authentication Spine

This release repairs Project Admin authentication at the routing/event layer. The fleet-wide Project Admin default/recovery PIN is **4353** across test, preview, and live project shells. Captain/Test Access cannot override or suppress that credential.

# Dark Sky v4.9.7 — Project Access Contract + Show the Flag

This build standardizes Project Admin access across the fleet: PIN `4353` is the default for every project unless deliberately overridden inside that project. It also repairs Project Admin gate readability and guarantees the canonical Black Flag return mark remains visible on project-owned customer and protected screens.

# Dark Sky v4.9.4 — Capability Authority + Project Manager Workspace

This build separates the Dark Sky master capability library from project authorization and project-manager operations. Capabilities are enabled only in each Project Control Center, while the Project Manager Workspace presents the enabled set in business-specific operational groups. Signal Restoration is the proving ground and now prioritizes restoration operations while keeping visual-placement tooling as an advanced option.
