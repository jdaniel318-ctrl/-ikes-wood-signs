# Dark Sky 6.0.8 — Chart Table Regression Gates

## Captain visual / interaction
- Exactly one visible "Charting the Future Fleet" treatment in the main room.
- No live First Mate card overlays the painted Signals region.
- Captain Intelligence remains live on the right.
- Captain's Desk is fully visible on iPad landscape and grouped Command / Build / Explore.
- Active desk routes resolve to real runtime targets.
- Future station remains visible and intentionally reports FUTURE.
- Missing targets downgrade to UNAVAILABLE.
- Return to Engine remains main-room only; Captain subviews retain Return to Quarters.

## Preserved contracts
- Project Admin fleet PIN: 4353
- Black Flag Engine PIN: 5615
- Captain's Quarters PIN: 19613
- Client Preview PIN: unique per invite
- Client Preview pre-paint isolation preserved
- Test/private-preview real-world contact blocking preserved
- Project isolation preserved


## 6.1.1 Admiral Watch additions

- Runtime readiness gate performs read-only authentication checks (`recordFailure:false`).
- Project Admin 4353 is checked across every current project.
- Client Preview generated code is checked against authority credentials.
- Canonical Project ID uniqueness and order isolation consistency are checked.
- Fleet external-contact guard and Client Preview pre-paint bulkhead are checked.
- Deployment manifest/runtime version agreement is checked.
- Recovery export is explicit and never auto-restores or mutates live state.
