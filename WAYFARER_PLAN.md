# Wayfarer Implementation Plan

Goal: add Valley Notes to Admiral and retain its proven travel features and account-with-several-travelers model.
Architecture: a reusable read-only card in the existing Captain controller, an inventoried product contract, and candidate learning records. Continue linking to the private Site. No backend mutations.
Tech stack: existing static HTML/CSS/JavaScript and Python release tools.
Spec: VALLEY_NOTES_PROGRAM.md.

Global constraints: preserve existing authentication, six core vessels, prior programs, private Site access, current trip content and local drafts. Use root-level files for the established upload workflow. Keep requirements distinct from implemented behavior.

Review focus: guest names must not grant access; private trip data must not enter public source; stale forecasts must not be labeled live; local catalog entries must not increase server registry counts; phone layouts and keyboard controls must remain usable.

- [x] Add a failing focused test for the card in both Admiral locations and its private guide link, distinct status and model.
- [x] Add the shared card in captain.js, scoped styles, VALLEY_NOTES_PROGRAM.json and candidate entries in FLEET_LEARNING_REGISTRY.json. Keep substantive behavior unchanged.
- [x] Run the focused test, existing 49 suites, and a local browser fixture with fictional state. Review the change independently.
- [ ] Generate Wayfarer 8.8.20.123 from exact Fairmark Git baseline; add model integrity and the new check to the release runner. Package upload, full source and rollback with the existing release tool.
- [ ] Save reviewable artifacts and report the upload requirement because the connected GitHub writer is unavailable.

Ruling: the user's instruction authorizes adding this program now; production traveler storage, AI, billing and server commissioning remain separately described future work. A local program entry does not stand in for those operations.

Verification: 50/50 offline suites passed. Local Chromium card fixture checked at 390 and 780 px; disclosure opens by click and closes with Enter. Independent review found no actionable issues. Physical iPad and hosted authentication remain untested.
