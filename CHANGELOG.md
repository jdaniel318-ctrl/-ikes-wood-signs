# 8.8.15.8 — Spine Continuity
- Removed the duplicate Fleet Spine / Station Registry Admiral-session refresh race.
- Station Registry no longer runs its own `admiral_read_fleet_spine` request; it consumes the Control Plane snapshot event.
- Added single-flight Admiral token refresh and single-flight Fleet Spine reads.
- Added a 9-second network deadline with durable timeout/authentication errors instead of frozen `READING…` states.
- Added safe visible-return refresh for an open Fleet Spine without concurrent RPCs.
- Upper-command secure/Engine restoration now closes Fleet Spine and clears its body lock explicitly.
- No Fleet Core migration and no vessel/customer payload change.

# Dark Sky 8.8.15.7 — Fleet Truth

- Fixed Station Registry empty-state resolution: a successful zero-row read now displays `0 REGISTERED` and a durable no-stations message instead of appearing to load forever.
- Replaced misleading `RELEASE ASSIGNMENTS` summary with `ACTIVE RELEASES`; historical unassigned/HOLD rows remain retained but are not counted as active posture.
- Added Fleet Core `active_release_assignments` and `release_assignment_records` counts so presentation matches server truth.
- Preserved Station Registry preview-before-register, heartbeat independence, Activity Spine, release-ring history, and exact-vessel authority boundaries.
- Canonical identity: `8.8.15.7 / fleet-truth-88157`.


- Added durable Fleet Core station identity for WEB / KIOSK / HYBRID customer endpoints.
- Added Station Registry metadata: exact vessel, station key, display name, mode, lifecycle state, runtime release, policy version, profile, heartbeat, recovery time/count and bounded metadata.
- Added secure `fleet_upsert_station_identity`, `fleet_station_heartbeat`, and `fleet_station_record_recovery` server contracts with exact-vessel membership/global-authority checks.
- Added Admiral-only **preview-before-register** RPCs with fingerprint and explicit intent enforcement.
- Extended `admiral_read_fleet_spine` with durable station rows and WEB/KIOSK/HYBRID counts.
- Registration no longer fabricates a heartbeat; new station identities truthfully remain **AWAITING HEARTBEAT** until runtime proof exists.
- Added a bounded browser bridge from Deployment Shipwright to Fleet Spine that exposes station identity only—never customer/order/photo payloads.
- Added a new Fleet Spine **Station Registry** section showing `LOCAL ONLY`, `REGISTERED · ALIGNED`, `SYNC NEEDED`, and `FLEET CORE ONLY` states.
- Station registration/update/recovery now render as human-readable Activity Spine events.
- Preserved Admiral Lens release-course governance, six-vessel isolation, Owner Spine, Watchtower and Foundry boundaries.
- No station rows were auto-created or seeded.
- Canonical identity: `8.8.15.7 / fleet-truth-88157`.