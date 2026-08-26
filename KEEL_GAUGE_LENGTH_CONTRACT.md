# Dark Sky 8.0.9 — Keel Gauge Length Contract

## Mission
Resolve Ike plank length from ordinary customer photos when the visual evidence genuinely supports it, without turning camera height into a customer requirement and without pretending pixels are an absolute ruler.

## What 8.0.8 taught us
The dominant failure was not the 2 ft confidence threshold. Warm marble/countertop pixels were being merged into the wood mask, so the classifier often measured the photograph/background instead of the plank. A controlled ~32 inch image actually made that failure easier to see: species and orientation stayed correct while the length contour lost the board.

## Keel Gauge segmentation
1. Build a **high-saturation wood core** first. This rejects warm marble/countertop contamination.
2. Select the best centered, elongated, non-border component rather than the largest warm-colored component.
3. Pad that strong core slightly so pale sapwood/live edges participate in geometry without allowing the counter to become the measured object.
4. Derive long-axis, short-axis, orientation, and length ratio from that plank component only.

## Calibration discipline
- The current known ground truth is the real **2 ft cedar test plank**.
- A 2 ft result may auto-resolve only when segmentation is trusted, the normalized ratio is safely inside the calibrated 2 ft core, framing is complete, orientation is stable, and the result is separated from the 4 ft boundary.
- 4 ft and 6 ft remain provisional until real known examples are supplied. They may be suggested, but not one-photo auto-confirmed merely because a formula says so.
- Camera height is not part of customer acceptance. The model must remain stable as framing distance changes.

## Evidence
Each analysis records internal evidence: segmentation mode, raw core ratio, measured contour ratio, long/short pixels, candidate class, confidence score, boundary distance, calibration coverage, resolution result, and reason.

## Safety
Visual length is evidence, not survey-grade measurement. Pixel-derived length continues to carry Ike visual-review authority before production. If the evidence is ambiguous, ask rather than guess.
