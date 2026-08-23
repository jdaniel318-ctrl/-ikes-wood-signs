# Dark Sky 6.9.1 — Anchor Set

Anchor Set is a focused Proving Ground state-consistency release built from the proven 6.9.0 baseline. It preserves the working authority, isolation, Client Preview, Captain, Admiral, recovery, and Ike's experience contracts while making Known Good promotion state refresh accurately and unambiguously.

## 6.9.1 focus
- Once the current candidate is promoted, the Proving Ground immediately changes from **Promote the cleared candidate** to **Known Good — current version**.
- The promotion button becomes intentionally inactive after promotion instead of inviting the Captain to repeat the same action.
- Release Anchor copy now distinguishes an active candidate from the current Known Good release.
- No proving checks, authority rules, project behavior, or customer experience logic changed.

## What changed
- Fleet Proving Ground presents Status → Highest Priority → Next Best Move first.
- Required voyages group the existing non-destructive evidence into Authority, Isolation, Client Preview, Staging Safety, Release Integrity, and Command Navigation.
- A cleared candidate may be deliberately marked Last Known Good on the current device; this records promotion evidence only and never deploys/publishes.
- Engineering evidence remains available under an expandable detail section.
- Ike's landing experience is more confidence-first, visual, local, and action-oriented while preserving the established sign workflow.
- Ike's now explains the order journey as Pick Your Plank → Make It Yours → See It Before Ike Makes It, with one obvious DESIGN MY SIGN action.

## Authority contracts preserved
- Project Admin recovery: 4353
- Black Flag Engine: 5615
- Captain's Quarters: 19613
- Admiral trial credential: 19613 (separate contract, temporary shared value)
- Client Preview: unique per invite

## Release posture
This build is a Release Candidate until the live Proving Ground is run after deployment. A Known Good label is evidence recorded by the Captain, not an automatic production deployment.
