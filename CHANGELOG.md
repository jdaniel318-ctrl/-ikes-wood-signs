# 8.6.11 — Proof Barrier

- Added explicit BOOTING → RECONCILING → ROSTER READY → DOCK PAINTED → INTELLIGENCE PAINTED → PROOF COMMITTED lifecycle.
- Proving Ground now waits for the proof barrier and reads one canonical current six-vessel proof.
- Intermediate 5-row / 0-admission observations remain diagnostics/history and cannot create a current HOLD.
- Fleet Dock and Fleet Intelligence successful paints commit the same current proof used by readiness.
- Six-vessel rescue and Legacy immutable identity logic remain unchanged.

# 8.6.11 — Proof Barrier

- Proving Ground now consumes the same current successful Fleet Dock trace that renders **SIX ABOARD**.
- Successful six-card Fleet Dock renders write a canonical current proof record for this build.
- Fleet Intelligence writes current first-paint proof when a six-vessel usable view renders.
- Earlier failed trace/READING FLEET attempts remain historical evidence but no longer override newer success.
- Fixed the Muster Trace readiness helper so it no longer collapses to `trace unavailable` from an out-of-scope safe wrapper.
- Canonical-six recovery logic is frozen; staging remains a non-blocking WATCH until deliberately exercised.

## 8.6.11 — Proof Barrier

- Moves roster diagnostics inside the async resolver itself.
- Bounds every named resolver stage and records PASS / FAIL / TIMEOUT with protected vessel IDs.
- Adds an outer Engine command convergence guard so Fleet Dock cannot remain on READING FLEET indefinitely.
- Keeps Dock Source Trace and protected-six guards aboard.
- Preserves 8.5.7 as Last Known Good until this candidate earns promotion.

## 8.6.8 — Dock Source Trace

- Adds a professional, read-only Fleet Registry Trace to Engine diagnostics and Fleet Dock.
- Captures IndexedDB projects, settings mirror, admissions, manifest, in-memory companies, Dock input, visible rows, and rendered cards.
- Highlights Legacy Plumbing immutable ID `bf-p-f92f87e8ec44` at every stage.
- The Fleet Dock renderer fails closed if the final input or rendered cards lose any protected vessel.
- Adds a Proving Ground Fleet Dock last-mile source-trace gate.

## 8.6.8 — Dock Source Trace

- Adds a six-stage live roster trace from protected seed through rendered Fleet Dock.
- Fleet Dock fails closed at the first stage that loses a protected vessel.
- Exposes the exact Project IDs present/missing at every stage.
- Adds a Proving Ground Dock Source Trace six-stage proof gate.

# 8.6.8 — Dock Source Trace

- Restores Legacy Plumbing to the protected six-vessel canonical fleet without overwriting existing project data.
- Repairs the actual fleet-admission ledger so a restored canonical row also regains active fleet citizenship.
- Pins the six immutable Known Good vessel IDs from 8.5.7 as the protected roster contract.
- Adds a release-blocking `Canonical six fleet citizenship` gate: all six rows and all six admissions must agree.
- Preserves 8.6.1 bounded Fleet Intelligence first paint and Registry Ledger live-state gates.
- Keeps 8.5.7 as Last Known Good until 8.6.8 earns promotion.

## 8.6.8 — Dock Source Trace
- Restores and guards the canonical six-vessel roster, including Legacy Plumbing by immutable Project ID.
- Preserves bounded Fleet Intelligence first paint from 8.6.1.
- Adds durable per-vessel staging ledger with read-back verification and visible staged state.
- Adds live-state Proving Ground gates for roster, intelligence paint, and staging round-trip.

# 8.6.8 — Dock Source Trace

- Added bounded Fleet Intelligence first paint: within 650 ms the deck falls back to the already-loaded canonical/local roster instead of remaining on READING FLEET.
- Added LOCAL FLEET • VERIFYING state while live cross-vessel signal reconciliation continues in the background.
- Health Matrix, Capability Map, and Admiral Strategy remain usable from the local roster-backed snapshot during reconciliation.
- Added a Proving Ground contract for Fleet Intelligence bounded first paint and folded it into Command Navigation Voyage.
- Preserved 8.5.7 Known Good as the protected recovery anchor; 8.6.8 remains a candidate until it earns promotion.
- Preserved normalized fleet signals, capability adoption mapping, Admiral Strategy, project isolation, explicit adoption, Voyage Truth, GlyphForge, and telemetry contracts.


## 8.6.8 — Dock Source Trace
Protected six-vessel muster seed restores exact Known Good identities and admissions before fleet surfaces paint. Runtime registry drift cannot redefine fleet membership.
