# Sightline 8.8.20.82 implementation plan

Goal: give Ike a real photo-to-dimension-to-vector trial and supply the native ARKit sweep companion source while preserving the fleet.
Architecture: an isolated local-memory capture workspace, shared measurement core, existing Carvewright outlined lettering and DXF export, and an iOS ARKit/Vision companion exporting a bounded versioned evidence file.
Tech stack: browser JavaScript/canvas; Swift/UIKit/ARKit/Vision; existing fleet geometry modules.
Spec: the approved conversation: no routine rack/species/dimension typing, shop-owned boards, fleet-shared measurement, photograph/sweep, accurate CX and honest production limits.

Global constraints: no production records, accounts or backend changes; no species certainty invented; no final-price selection from color heuristics; no cutting programs from unverified measurements; preview and artwork share geometry; imports bounded and strictly validated. Native app source cannot be compiled or signed in this Linux environment.
Review focus: misleading machine-ready claims; invalid or hostile capture JSON; stale exports after edits; out-of-board artwork; phone EXIF orientation; projective instability; raycast/image coordinate consistency; malformed files bypassing trial restrictions.

1. Measurement core: write behavioral tests for perspective calibration, geometry limits, native packet validation and price withholding; observe failure, implement and run. Files: carvewright_capture_core.js, VERIFY_SIGHTLINE_CORE.cjs.
2. Capture workspace: add photo/reference corner workflow, native capture import, actual photo proof, existing outlined lettering and durable downloads. Link from Ike inbox and Carvewright. Verify UI on tablet/mobile and data never touches production.
3. Native companion: ARKit tracking plus automatic Vision rectangle candidates, repeated plane raycasts, local photo/evidence sharing, complete Xcode project generator and install instructions. No claim of native build/device testing.
4. Release: core and fleet regression suites, fresh review, honest guide/evidence, sealed .82 release and tested flat upload/source ZIPs.

Ruling: keep this plan at the release root, matching existing HOLDFAST_PLAN.md; the reviewed uploader only accepts flat changed files. Store execution scratch/evidence outside the source tree.

## Delivery record

- Implemented the photo/reference measurement core, bounded native import, same-geometry preview and SVG/DXF export, isolated pricing trial, and fleet entry links.
- Supplied ARKit/Vision source plus a reproducible unsigned Xcode project generator. Xcode compilation, signing and physical-device acceptance remain pending.
- All 25 offline verification suites passed. Independent source review reported no Critical/Important issues; minor step/error-state findings were corrected.
- Cloud browser exercised sample, synthetic native import, preview, invalid/valid wording and evidence JSON download. SVG download completion could not be confirmed in the cloud browser.
- Keep the Sightline branch and workspace for device feedback. Deliver software ZIPs; no remote deployment or merge is part of this build.
