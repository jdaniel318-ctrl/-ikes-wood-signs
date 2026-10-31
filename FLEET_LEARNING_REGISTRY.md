# Fleetbound addition — 31 October 2026

Six Wonderwake Skybloom candidates are retained in `WONDERWAKE_FLEET_LESSONS.json` and `FLEET_LEARNING_REGISTRY.json`, and displayed in the Engine Fleet Learning section. They are review candidates, not inherited doctrine or automatically staged/adopted components. The existing runtime recommendation engine remains unchanged; it does not silently bulk-promote these additions. See FLEETBOUND_GUIDE.md for mission-fit examples.

# 8.2.0 Learning — Mission-Specific Fit Controls

Constrained customer sizing is reusable, but control vocabulary/defaults must match the vessel mission. Ike uses aggressive safe face-fit grounded in finished signs; other vessels may use S/M/L, sliders, or other controls.

# Fleet Learning Registry — 8.2.3 Ike Fit

Real Face adds mission-fit confidence to recommendation compression.

- **Strong** — direct mission evidence; may be bulk-staged for review.
- **Plausible** — useful but adaptation evidence must be reviewed first.
- **Experimental** — weak/indirect fit; never bulk-staged by default.

The registry must explain *why* each vessel qualifies. Photo availability alone is not evidence that a classifier belongs in a mission. Doctrine remains centrally inherited; project business logic remains explicit and project-scoped.
