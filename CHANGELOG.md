## 8.2.1 — Gridwright
- Replaces rectangle-only Ike text placement with a 14-column live-edge face grid.
- Selects a width-biased carve-safe corridor so short words can claim the usable face.
- Calibrates Style A to a broad block face and accounts for visible glyph bounds plus letter spacing.
- Keeps More Room / Ike Fit / Full Face as customer intent while the layout engine owns safe size and placement.
- Removes the customer lettering-reference upload control; real finished Ike signs are the retained proof source.
- Adds an automated Ike face-grid fit contract to Proving Ground.


## 8.2.0 — Real Face
- Replaced character-count sizing with visible-glyph measurement using canvas text bounds.
- Ike Fit now targets aggressive finished-sign face occupancy; Full Face pushes to maximum carve-safe occupancy, while More Room remains intentionally restrained.
- Short Style A routed words receive a stronger vertical fill rule modeled on the real RAMJET sign.
- True Fit remains a mission adapter: other vessels keep their own sizing vocabulary and constraints.

# 8.2.0 — Real Face

- Replaced generic size presets with More Room / Ike Fit / Full Face.
- Removed legacy 64px preview ceiling; fit is style-aware and face-filling.
- Grounded layout against finished SMOKE HOLE! and RAMJET examples.
- New Ike orders hard-reset stale wording, contact, recognition, and approved-design state.
- Preserved 8.1.8 final-order serializer and complete-order boundary.

# 8.2.0 — Real Face

- Fixed final Ike submission failure caused by missing `ikeRecognitionForOrder` serializer.
- Added release-blocking automated Ike complete-order boundary evidence.
- Added Small / Balanced / Large / Fill lettering-size presets beside lettering style; all presets are bounded by detected usable-zone geometry and exact approved render is frozen.
- New Ike orders start with blank wording.
- Rotation review now reports explicit quarter-turn/original state and current layout.
- Customer recognition surfaces no longer expose Sea Trial terminology.
- Camera flow detects permission state when supported and gives concise grant/deny guidance without attempting to bypass Safari.
- Review My Design and Place My Order are visibly gated until required choices/approval are complete.

# 8.1.7 — Fleet Judgment

- Adds mission-fit confidence to Fleet Learning Registry.
- Every capability recommendation now explains why a vessel qualifies.
- Strong matches can be staged together; plausible matches route to review; experimental matches are suppressed from bulk staging.
- Confidence-Aware Visual Identification no longer treats photo capture alone as enough evidence for automatic staging.
- Adds Mission-Fit Confidence as retained fleet doctrine.
- Preserves doctrine inheritance, recommendation compression, project isolation, and manual Known Good promotion.

# Dark Sky 8.1.7 — Fleet Judgment

- Recovery Completion Contract: verified automatic recovery must restore same-tab interaction and remove the preflight shield; a bounded fallback re-enables the Engine PIN surface.
- Doctrine Inheritance: fleet doctrine is inherited automatically by admitted vessels instead of creating repetitive per-vessel review work.
- Admiral Recommendation Compression: raw vessel matches are grouped into a small mission-aware decision queue; project-level details remain available on demand.
- Shared Fleet Pattern Detection: repeated commissioning deficiencies are grouped as shipyard patterns (for example, experience approval across multiple vessels).
- Manual Known Good promotion remains deliberate.


## 8.1.7 Fleet Judgment
- Known stale-worker handoffs self-recover only after the incoming runtime snapshot and release identity fully verify.
- Automatic cleanup is constrained to Dark Sky service-worker registrations and application caches; project/customer/order/owner/configuration data is never touched.
- WATCH is now explicitly non-blocking when protected release contracts are clear.
- Deterministic WATCH work is owned by the shipyard; the Admiral is escalated only for judgment, ambiguity, irreversible action, or deliberate Known Good promotion.
- Proving Ground reports all voyages assessed, separates CLEAR/WATCH/HOLD, and keeps WATCH evidence visible after promotion.
# Dark Sky 8.1.7 — Fleet Judgment

- Repairs the 8.1.3 Admiral calibration replay so species replay follows the same `ikeCombineSpeciesEvidence` resolution path as production customer recognition.
- Adds assertion-level incident diagnosis: expected, observed, confidence, PASS/HOLD/WATCH and reason for orientation, species and length independently.
- Adds automatic distinction between detector regression and replay/resolution-harness failure.
- Adds one-screen Admiral Incident brief with likely cause, recommended action and whether Captain/Admiral intervention is actually required.
- Adds **COPY ADMIRAL BRIEF** for direct chat handoff; full JSON evidence remains a fallback.
- Keeps experimental length evidence on WATCH and prevents it from implicating protected orientation/species behavior.
- Final Known Good promotion remains manual.
