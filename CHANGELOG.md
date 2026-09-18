# Dark Sky 8.8.15.5 — Admiral Lens

- Enlarged the Fleet Spine Control Plane type scale, spacing, labels, controls and vessel state hierarchy for iPad command use.
- Rebuilt **PREVIEW COURSE** as a durable visible proof surface: exact BEFORE → AFTER course, selected vessel, server fingerprint and explicit “nothing issued” state.
- Kept **ISSUE RELEASE COURSE** locked until the visible server preview is fresh and reports a real change.
- Any change to release ring, rollout state, release identity or Admiral intent now invalidates the old preview and re-locks issue.
- Preview failures now remain visible in both the course proof area and the Control Plane status band; no quick flash can hide a failed command.
- Replaced raw Activity Spine JSON as the default view with human-readable event cards; correlation ID, event type and bounded payload live behind **TECHNICAL DETAILS**.
- Strengthened selected-vessel state and changed Admiral intent to a readable multi-line field.
- Preserved Fleet Spine server contracts, six-vessel isolation, read-only default posture, Foundry persistence, release rings, Station foundation, Authority Gateway foundation, Owner Spine and Watchtower boundaries.
- No Fleet Core migration is required for this visual/interaction hardening pass.
- Canonical identity: `8.8.15.5 / admiral-lens-88155`.
