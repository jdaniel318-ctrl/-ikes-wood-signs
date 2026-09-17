# Dark Sky 8.8.15.4 — Spine Surface

Spine Surface is a focused Fleet Spine hardening release. It fixes the Control Plane presentation boundary discovered in live Admiral testing while preserving the shared-hull architecture. Fleet Spine shifts the proving effort from one vessel to the shared fleet hull. Ike’s remains active, but repeated proving loops no longer dominate the roadmap. This release makes the Control Plane, Activity Spine, server-persisted Foundry Gate, and per-vessel release rings tangible Admiral infrastructure.

## What is live in this pass
- **Fleet Spine Control Plane** — authenticated Admiral read of vessel identity, membership counts, station registry posture, Foundry candidate count, release assignments and bounded recent Activity Spine events.
- **Release rings** — each vessel may independently sit in `UNASSIGNED`, `CANARY`, `PROVING`, `LIMITED`, or `FLEET`; rollout state is also per vessel. No global all-at-once release is required.
- **Preview-before-issue course orders** — a release assignment is read, previewed, fingerprinted, reasoned and then issued only if the preview still matches. Previous release identity is retained for rollback posture.
- **Activity Spine** — append-only events carry actor authority, vessel when applicable, event type/version, correlation/causation identity, source and idempotency identity. Business/customer payloads do not belong in Control Plane events.
- **Foundry candidates are durable** — Scout + Clearance now writes fleet-governed candidate records to Fleet Core, visible to active Admiral authority rather than trapped in one browser or one Admiral’s local draft store. Clearance still means Sea Trial only. It does not publish, sell, entitle or broaden authority.
- **Station identity foundation** — Fleet Core now has first-class station records for future WEB / KIOSK / HYBRID outpost health and release assignment. Existing local outposts are not silently migrated in this pass.
- **Unified authority resolver** — server-side identity can resolve global authority and exact-vessel membership through one contract. Existing working authority paths are preserved while the fleet migrates deliberately.

## Fleet doctrine
**Owner operates the vessel business. Engine operates the platform. Captain commands fleet operations. Admiral governs the fleet.**

Control Plane coordinates identity, authority, releases, deployments, capabilities and health. Private vessel business data remains vessel-scoped. A vessel-specific fix does not graduate to Fleet Core until the underlying lesson can be named generically and certified.

## What this does not pretend to finish
This is the spine, not every organ. Existing outposts are not yet bulk-enrolled into `fleet_stations`; not every legacy audit source emits into Activity Spine yet; and release rings do not auto-deploy code. Those migrations remain deliberate proving work.

Recognition Truth, Fleet Runtime, Owner Spine, Watchtower read-only doctrine, Kiosk Watch and the 85-file handoff ceiling remain preserved.
