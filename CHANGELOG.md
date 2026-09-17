# Dark Sky 8.8.15.3 — Fleet Spine

- Added **Fleet Spine** Admiral Control Plane surface with vessel/release/station/membership posture and bounded Activity Spine readback.
- Added Fleet Core `fleet_activity_events`, `foundry_candidates`, `fleet_release_assignments`, and `fleet_stations` foundations.
- Added idempotency, correlation and causation identity to shared activity events.
- Moved Foundry Scout candidate persistence from browser-local drafts to Admiral-authenticated Fleet Core records.
- Preserved the above-board Foundry rule: public source does not mean auto-scrape, auto-publish, auto-sell, auto-entitle, or ownership transfer.
- Added per-vessel release rings: Unassigned → Canary → Proving → Limited → Fleet.
- Added release-course preview fingerprint + explicit intent before issue, with previous release retained for rollback posture.
- Added server authority resolver foundation for global authority plus exact-vessel membership.
- Added Station identity foundation for future persistent WEB / KIOSK / HYBRID outpost health.
- Preserved Fleet Runtime, Recognition Truth, Owner Spine, durable orders/settings, Admiral Watchtower read-only doctrine, project isolation and 85-file handoff ceiling.
- Canonical identity: `8.8.15.3 / fleet-spine-88153`.
