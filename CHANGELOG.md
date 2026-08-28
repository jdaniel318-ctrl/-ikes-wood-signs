## 8.6.3 — Registry Ledger
- Restores and guards the canonical six-vessel roster, including Legacy Plumbing by immutable Project ID.
- Preserves bounded Fleet Intelligence first paint from 8.6.1.
- Adds durable per-vessel staging ledger with read-back verification and visible staged state.
- Adds live-state Proving Ground gates for roster, intelligence paint, and staging round-trip.

# 8.6.3 — Registry Ledger

- Added bounded Fleet Intelligence first paint: within 650 ms the deck falls back to the already-loaded canonical/local roster instead of remaining on READING FLEET.
- Added LOCAL FLEET • VERIFYING state while live cross-vessel signal reconciliation continues in the background.
- Health Matrix, Capability Map, and Admiral Strategy remain usable from the local roster-backed snapshot during reconciliation.
- Added a Proving Ground contract for Fleet Intelligence bounded first paint and folded it into Command Navigation Voyage.
- Preserved 8.5.7 Known Good as the protected recovery anchor; 8.6.3 remains a candidate until it earns promotion.
- Preserved normalized fleet signals, capability adoption mapping, Admiral Strategy, project isolation, explicit adoption, Voyage Truth, GlyphForge, and telemetry contracts.
