# Dark Sky 8.8.15.6 — Station Registry

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
- Canonical identity: `8.8.15.6 / station-registry-88156`.
