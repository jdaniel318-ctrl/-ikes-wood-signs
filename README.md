# Dark Sky 8.4.2 — GlyphBench

GlyphBench hardens Ike Style Foundry around scalable evidence, glyph coverage, geometry certification, and safe creation of new production styles from uploaded graphics.

## What changed
- Adds per-style glyph coverage grids for uppercase, lowercase, numbers, and punctuation.
- Adds visible evidence cards inside each style pack.
- Adds a geometry-certification stage between compile and CX publication.
- Adds Create Style from Graphic: one graphic plus exact visible wording creates a draft style and draft evidence record in one step.
- Graphic import never claims a full font from one image: only the characters visibly evidenced by the graphic count as proven.
- New styles remain project-scoped, draft, and hidden from CX until evidence is approved, compiled, geometry-certified, and deliberately published.
- Preserves TrueCase, Dock Lock, A/B anchors, detector isolation, immutable approved artifacts, and order safeguards.

## Graphic-to-style rule
A graphic may seed a style pack, but it does not magically prove missing letters. Add further graphics/sign photos to build coverage, approve them, compile, then certify geometry before publishing.

# Dark Sky 8.4.2 — GlyphBench

Narrow geometry release branched from the proven 8.3.5 TrueCase build. Customer wording case is frozen as a protected contract; this pass changes only Style B shape and Ike Fit calibration.

## 8.4.2 GlyphBench
- Preserves `Smoke Hole!`, `smoke hole!`, and `SMOKE HOLE!` exactly as typed.
- Keeps the working TrueCase DOM → state → preview round trip untouched.
- Recalibrates Style B toward the real finished SMOKE HOLE! sign: taller, narrower, tighter spacing, and stronger face occupancy.
- Style B effective width/height are measured using the same visual condensation/stretch that the customer sees, so Ike Fit sizes against visible ink rather than an unscaled font box.
- Adds an `ike-style-b-truth` Proving Ground gate and requires the TrueCase gate to remain green.
- Preserves Dock Lock, Style A/RAMJET, orientation/species detectors, approved-artifact immutability, duplicate-order protection, and project isolation.
- Length remains experimental and isolated.


## 8.2.8 changes
- Adds `FLEET_REGRESSION_LIBRARY.md` as the standing cross-project regression reference for relevant fleet work.
- Adds machine-readable `FLEET_REGRESSION_GATES.json`.
- Adds `RELEASE_DISCIPLINE_827.md` with BLOCK / HOLD / PASS semantics and inherited-contract rules.
- Extends the release gate to require project-history regression discipline, explicit exclusion boundaries, mobile/navigation/customer-surface checks, production truth, service-contract isolation and final package verification.
- Preserves the 8.2.6 Foundry foundation; this is a hardening pass, not a feature multiplication pass.

## Preserved 8.2.6 foundation
Fleet-structure pass built from the 8.2.5 Reference Library. This release audits future-facing features already present before adding new Admiral services, and establishes The Foundry as the Admiral proving vessel for reusable fleet capabilities.

## 8.2.6 changes
- Adds a machine-readable four-tier operating model: Owner / Operator, Full-Service Operator, Captain Fleet, Admiral Fleet.
- Adds Foundry service domains and a first capability registry without granting new cross-project authority.
- Classifies existing Custom Colors, Payments, Ledger, Customer/Order Insight, Fleet Learning, AI recommendations, and vendor/capacity routing as foundations instead of duplicating them.
- Adds a real Admiral **The Foundry** workspace showing the operating model, domains, classified capabilities, and boundary law.
- Preserves Ike's as the primary sign manufacturer; inlay production begins as vendor facilitation and can grow into fleet-owned capacity only when justified.
- Adds `FOUNDATION_AUDIT_826.md` and `FLEET_SERVICES_CONTRACT.md`.

## 8.2.6 Reference Library
- Locked customer-facing style examples to canonical samples (A = RAMJET, B = SMOKE HOLE!).
- Tuned Style A to stay closer to the RAMJET benchmark.
- Simplified the customer-facing Ike Fit explanation block in the design step.


## 8.2.6 Reference Library
- Added owner + Engine project-scoped production reference uploads.
- Draft → Approved → Superseded governance and version history.
- Separates machine geometry from visual examples/secondary evidence.
- Approved style references are attached to Ike design/order traceability; uploads never auto-change CX.
- Removed customer-facing Ike Fit explanation cards; blank wording renders a blank plank.


## 8.4.2 GlyphBench
Ike lettering is now governed through production style packs. Bundled RAMJET and SMOKE HOLE! finished-sign anchors are release assets. Owner and Engine may upload additional real examples, tag the exact wording shown, approve evidence deliberately, and compile project-scoped glyph coverage. Draft uploads never change customer output. TrueCase remains preserved.
