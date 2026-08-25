# Dark Sky 8.0.2 — Grain Guard

**Candidate release:** 8.0.2 Grain Guard  
**Known Good anchor:** 7.8.4 Harbor Exit  
**Status:** Candidate — requires Captain sea-trial evidence before promotion.

Grain Guard hardens Ike’s photo-to-price workflow on top of the now-stable Owner Bridge and canonical six-vessel Keelson fleet. Its purpose is to make wood identification conservative, confidence-aware, and explicitly unable to convert uncertainty into a customer price.

## What this release changes

- **Confidence-aware wood verification:** customer pricing no longer treats a one-photo visual guess as a priced species.
- **Two-photo evidence path:** when the first picture is not strong enough, the customer gets a positive prompt for one closer grain photo; Dark Sky combines both pictures.
- **Oak-family safety:** an Oak-family result does not silently choose Red Oak or White Oak. The customer confirms the exact Ike rack species, or takes another picture if unsure.
- **No-guess pricing rule:** price remains unavailable until the species is explicitly resolved and an active owner rate exists.
- **Species × length pricing:** the final customer price is calculated only from the resolved species rate per linear foot multiplied by the confirmed plank length.
- **Pricing taxonomy aligned:** customer runtime and Owner Control Center now use the same canonical species list: Pine, Cedar, Red Oak, White Oak, Walnut, and Hickory.
- **Positive fallback:** if two photos still disagree or remain ambiguous, the customer chooses the species they picked from Ike’s rack rather than receiving a fabricated recognition result.
- **Owner Bridge preserved:** project-scoped owner login, refresh persistence, pricing controls, six-vessel canonical fleet, and clean authority boundaries remain intact.

## First sea-trial sequence

1. Confirm Engine boot and the canonical six-vessel Fleet Dock remain clean.
2. Open Ike Owner Control Center and confirm the saved species rates are still present.
3. Start Ike’s customer experience with the same 2-foot oak plank.
4. Verify the customer sees **Oak family — confirm type** rather than a guessed Red/White Oak price.
5. Choose **I’m not sure — take one more photo** and add a closer grain image; confirm the app combines both pictures.
6. If exact species still cannot be resolved safely, choose the species from Ike’s rack and verify the final price equals owner rate × confirmed length.
7. Refresh the Owner Control Center once and confirm the project-scoped session remains durable.

Do **not** promote 8.0.2 to Known Good until the no-guess species and price calculation flow is proven in the deployed build.

## Release contracts

- `GRAIN_GUARD_CONTRACT.md` — confidence-aware wood identification and no-guess pricing contract.
- `OWNER_BRIDGE_CONTRACT.md` — standalone owner application contract.
- `BREAKWATER_OWNER_HANDOFF_CONTRACT.md` — protected owner handoff rules inherited from 8.0.0.
- `KEELSON_CANONICAL_FLEET_CONTRACT.md` — one canonical fleet roster / one source of truth.
- `TRUE_HELM_ROUTE_CONTRACT.md` — explicit route authority and Engine precedence.
- `BULKHEAD_SESSION_CONTRACT.md` — Owner/Captain session separation.
- `CLEAN_WAKE_FIRST_PAINT_CONTRACT.md` — no cross-project first-paint bleed.
- `PROVING_GROUND.md` — release proving and evidence rules.
- `CHANGELOG.md` — release history.

## Packaging contract

This release is delivered as one clean top-level folder with a unique release-folder identity for reliable iPad extraction. Runtime identity, service-worker/cache identity, deployment manifest, release gate, README, and checksums must all agree with the current release before handoff.
