# Ike's Sounding Line 7.2.0 — Plank Intelligence 2.0

## Mission
Make the preview trust the photographed plank itself. The customer journey is frozen; this release improves only recognition and lettering placement.

## Sea Trial behavior
1. Downscale the photograph locally and classify likely wood-tone pixels.
2. Keep the largest connected candidate as the probable plank.
3. Erode the candidate boundary to protect edges and interior cutouts.
4. Find the largest safe rectangular lettering region inside the remaining mask.
5. Scale and center lettering inside that detected region across all Ike preview surfaces.
6. Flag probable cutout/edge avoidance as **Sea Trial**, not as proven production geometry.
7. A likely scale/reference object may be reported as a candidate, but no inches/feet are produced until calibration is validated across repeated photos.

## Failure behavior
If contour analysis is weak or unavailable, the app falls back to the proven basic-margin preview rather than inventing geometry.

## Promotion rule
This remains Ike-specific until repeated Sea Trials prove contour, cutout avoidance and placement across materially different plank shapes. Only then may the capability be nominated as a Fleet Capability Candidate.
