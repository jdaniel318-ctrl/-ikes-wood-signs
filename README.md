# Dark Sky 7.4.0 — Iron Proof

Iron Proof is the approval-integrity foundation release. It does not broaden Ike's customer flow. Instead, it changes approval mechanics so the visual the customer sees on the approval screen is the exact immutable PNG that later becomes the production artifact. No post-approval re-render is allowed.

## Core changes
- Build the approval artifact *before* the customer can approve it.
- Approval screen displays the frozen PNG candidate, not a live text overlay.
- Approval adopts the exact candidate bytes and fingerprint; it does not render again.
- Any wording/style/fill/orientation/price edit invalidates both candidate and lock.
- Review, confirmation, admin and archive reuse `approvedPreviewData`.
- Approved Artifact Voyage now includes an automated synthetic PNG freeze/fingerprint/reuse check in addition to static contract verification.
- PNG is used for the approved artifact to preserve deterministic pixels/bytes more reliably than the previous JPEG flatten.

## Guardrails
- Ike's 7-step journey remains unchanged.
- Plank Recognition / cutout avoidance remain Sea Trial.
- Physical measurement remains uncommissioned.
- 7.3.0/previous Known Good remains the recovery anchor until the Captain proves and promotes 7.4.0.

# Dark Sky 7.3.0 — Plank Bond

Plank Bond hardens Ike’s production contract around the canonical front/back paper form and upgrades Design Lock from metadata-only locking to a flattened, fingerprinted approved artifact. The customer journey remains unchanged.

# Dark Sky 7.3.0 — Plank Bond

Plank Bond is the integrity follow-up to Sounding Line. It closes the live-test mismatch where final review showed a two-line approved design but confirmation silently re-rendered it as one line.

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
