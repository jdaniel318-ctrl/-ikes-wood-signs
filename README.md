# Dark Sky 7.2.1 — Design Lock

Design Lock is the integrity follow-up to Sounding Line. It closes the live-test mismatch where final review showed a two-line approved design but confirmation silently re-rendered it as one line.

The customer journey remains frozen. This candidate changes approved-artifact integrity only and adds a new proving voyage.

# Dark Sky 7.2.0 — Sounding Line

Sounding Line is the narrow Plank Intelligence 2.0 candidate built on the proven True Grain customer journey. It freezes the seven-step Ike flow and focuses on the weak link exposed in live testing: placing lettering against the actual usable wood surface rather than the photograph rectangle.

## Ike's Plank Intelligence 2.0
- Detects a probable plank contour from the uploaded/camera image using a local largest-component image analysis pass.
- Erodes that contour to create a safer interior region and finds the largest usable lettering rectangle.
- Uses that detected region to size and place lettering across Design, Approval, Review and customer-context previews.
- Treats likely holes/cutouts as obstacles during the Sea Trial placement pass.
- Detects only a **reference candidate** for future scale work; it does not claim inches or feet without a validated calibration method.
- Preserves the posted-price fallback until physical measurement is commissioned.

## What did not change
The proven seven-step Ike customer flow, contact timing, confirmation screen, test-mode containment, Black Flag authority boundaries, project isolation, Captain/Admiral contracts and Professional Mode remain unchanged.

## Release discipline
Dark Sky 7.1.0 remains the Last Known Good recovery anchor until 7.2.0 is deployed, passes the live Fleet Proving Ground, produces recovery/evidence artifacts, and is deliberately promoted by the Captain.

See `IKES_SOUNDING_LINE_720.md` for the Sea Trial contract.
