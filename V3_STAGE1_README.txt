BLACK FLAG ENGINE — V3.0 STAGE 1: HULL & BULKHEADS

Baseline:
- v2.9.79 Pirate Mode Asset-Match build

Stage 1 completed:
- Schema v3 project normalization
- Per-project namespace metadata
- Default-deny project isolation metadata
- Central role / permission policy model
- Formal project lifecycle states
- V3 audit foundation bridged to existing project activity
- Pre-migration recovery snapshots
- 2.9.x -> v3 structural migration
- Structural integrity service
- Existing Engine / Owner / Captain / Pirate UI organization preserved

Important boundary:
- This stage establishes the client-side policy architecture.
- Real outside-owner production authentication is NOT represented as complete.
  Server-side identity, secure sessions, authorization, recovery and revocation remain required.

Validation:
- JavaScript syntax checked
- Static duplicate DOM IDs checked
- Critical screens/controls checked for exactly one ID
- Referenced local scripts checked
- CSS brace balance checked

Next:
- Stage 2: wire Owner Portal, kiosks/devices, deployments, orders, customers,
  ledger, telemetry and Captain governance into the v3 structural services.
