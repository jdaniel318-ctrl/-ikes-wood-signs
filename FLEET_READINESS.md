# Fleet Readiness Contract — 6.1.1

Fleet Readiness is a release gate, not a decorative rank. A fleet is Admiral-ready only when authority, isolation, preview safety, recovery, navigation, and release identity can be proved without relying on a single device or hidden manual knowledge.

## Gate classes

- **CLEAR** — contract verified by a non-destructive runtime check.
- **WATCH** — no critical breach, but evidence or legacy data needs review.
- **HOLD** — critical authority/isolation/safety/release contract failed; do not promote the release.

## Critical contracts

1. Black Flag recovery credential remains 5615.
2. Project Admin recovery/default remains 4353 for every project.
3. Captain authority remains a separate 19613 boundary.
4. Client Preview uses a unique invite credential and never an authority credential.
5. Canonical Project IDs remain unique.
6. Active project/order records may not carry conflicting isolation IDs.
7. Test/private surfaces retain the external-contact guard.
8. Client Preview owns first paint through the pre-paint bulkhead.
9. Captain main-room exit and subview return remain distinct.
10. Runtime version and deployment manifest agree.

## Release discipline

A release should not be promoted when the gate reports HOLD. WATCH items require an explicit Captain review and should become a logged follow-up. The gate is intentionally read-only: it never repairs, publishes, changes PINs, or mutates project state.
