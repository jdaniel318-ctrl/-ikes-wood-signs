# Dark Sky 7.9.1 — True Bearing

Three clean layers: customer, project owner/partner, and Black Flag/Captain. See CHANGELOG.md for release details.

# Dark Sky 7.8.4 — Harbor Exit

Harbor Exit makes Compact Diagnostics and Safe Cleanup unmistakable iPad-safe interactions with direct activation, while preserving Deep Sounding storage inspection, Iron Hull, True Bearing, approved-artifact integrity, project isolation, and future extensibility.

See `STORAGE_TELEMETRY_781.md` for the diagnostics interaction contract and `STORAGE_TELEMETRY_770.md` for the storage safety contract.

# Dark Sky 7.8.4 — Harbor Exit

Session-boundary correction and state-clarity release built on Iron Hull. Published projects and customer sessions are now separate, explicit contracts.

## Core changes
- **OPEN PROJECT** on a published project establishes an explicit `LIVE CUSTOMER` session before customer UI renders.
- Test Experience / Sea Trial and Client Preview remain explicit simulated contexts and cannot leak into the live route.
- Engine/project boundary cleanup clears stale customer-session context.
- Project Control separates **Deployment**, **Readiness**, **Approval**, and **Current Session** instead of overloading one status label.
- Proving Ground adds an eighth **Session Boundary Voyage**. A broken live/test/preview route is HOLD-worthy.
- Iron Hull automatic fresh-build proving and cache hygiene remain intact.

## Safety
The live route now enables real project contact behavior only when the project is actually published and the session is explicitly `LIVE CUSTOMER`. Test and Preview remain contained.

## Release discipline
7.6.0 remains the prior release line; promote 7.8.4 only after fresh Proving Ground evidence and deliberate Captain approval.

# Dark Sky 7.5.0 — Iron Hull

Fortification release. See `FORTIFICATION_750.md`.

# Dark Sky 7.5.0 — Iron Proof

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
- 7.3.0/previous Known Good remains the recovery anchor until the Captain proves and promotes 7.5.0.

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


## 7.9.0 Fleet Spine
Dynamic Fleet Dock, explicit Customer/Owner/Captain routes, canonical Ike asset path, and fail-safe Engine command reads.


## 7.9.1 True Bearing

True Bearing hardens the Fleet Spine around canonical business identity and a scalable primary Fleet Dock. It preserves immutable Project IDs while repairing approved human-facing business identity, including Mugs After Dark. Strict duplicate-business folding now chooses the more mature canonical vessel only when business identity matches and contact evidence does not conflict, then migrates project-scoped references before removing the duplicate registry row.

Fleet Dock is the normal vessel navigator: searchable, filterable, priority-sorted, and explicit about the three authority routes — Customer Experience, Owner / Partner, and Captain Dock. Test / Preview is shown separately as a safe mode rather than a fourth authority. Owner setup is now an actionable Captain route; active owners retain their project-scoped portal without Black Flag credentials. The older Project Command surface remains available as advanced administration rather than competing with Fleet Dock as the primary route.
