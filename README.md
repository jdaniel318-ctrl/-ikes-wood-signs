# Dark Sky 8.0.5 — Sentry

**Candidate release:** 8.0.5 Sentry  
**Known Good anchor:** 7.8.4  

Sentry hardens visual evidence before any customer-facing fact is allowed to become final. It preserves Owner Bridge, the six-vessel canonical fleet, and Lookout's progressive verification, while adding contradiction checks and geometry sanity guards.

## What changed

- Whole-plank segmentation now includes pale sapwood instead of isolating only dark heartwood.
- Orientation is derived from the plank body's long axis (PCA) and must pass geometry sanity checks before it is displayed as final.
- Cedar and Walnut now compete through positive evidence, contradiction penalties, and a required confidence margin. A dark patch alone cannot make Walnut win when cedar-like sapwood/heartwood evidence contradicts it.
- Species, orientation, and length remain independent gates. An unresolved field displays as checking rather than a confident but shaky answer.
- Final plank confirmation and pricing require resolved orientation, species, length, and an active owner rate.
- One good photo remains the target; extra evidence is requested only when a gate has not earned confidence.

## Acceptance test

Use the same known cedar test plank with one normal full-plank photo and no tape measure. Sentry must never report an obviously contradictory orientation, must not call Walnut when cedar diagnostic evidence dominates, and must withhold final price whenever any independent gate remains unresolved.

See `SENTRY_VISUAL_SANITY_CONTRACT.md` for the release contract and `CHANGELOG.md` for history.
