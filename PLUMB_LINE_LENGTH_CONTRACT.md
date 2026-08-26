# Dark Sky 8.1.0 — Plumb Line Length Contract

Plumb Line is a second-pass repair of Keel Gauge. It explicitly treats camera height as a non-contractual customer variable and does not use frame occupancy as physical scale.

## Scene-first segmentation
1. Learn a border/background color model from the photograph.
2. Find a saturated warm wood core using cross-erosion so thin warm bridges, skin, marble veins, and side clutter cannot join the plank.
3. Grow only from that trusted core into neighboring pale sapwood pixels that are visibly separated from the learned background.
4. Constrain growth to a bounded envelope around the core.
5. Measure the grown plank silhouette, not the image frame.

## Confidence guardrails
A one-photo 2 ft result requires all of: calibrated 2 ft ratio family, full framing, stable orientation, trusted background-aware growth, shape stability, adequate background separation, no class overlap, and safe distance from the decision boundary.

4 ft and 6 ft remain provisional until known physical examples are tested. No release may fake calibration coverage.

## Truthfulness
Pixel geometry is inventory classification evidence, not survey-grade measurement. Ike retains final visual authority before production.
