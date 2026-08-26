# Dark Sky 8.1.4 — Incident Intelligence

- Repairs the 8.1.3 Admiral calibration replay so species replay follows the same `ikeCombineSpeciesEvidence` resolution path as production customer recognition.
- Adds assertion-level incident diagnosis: expected, observed, confidence, PASS/HOLD/WATCH and reason for orientation, species and length independently.
- Adds automatic distinction between detector regression and replay/resolution-harness failure.
- Adds one-screen Admiral Incident brief with likely cause, recommended action and whether Captain/Admiral intervention is actually required.
- Adds **COPY ADMIRAL BRIEF** for direct chat handoff; full JSON evidence remains a fallback.
- Keeps experimental length evidence on WATCH and prevents it from implicating protected orientation/species behavior.
- Final Known Good promotion remains manual.
