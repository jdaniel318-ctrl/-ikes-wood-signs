# Sightline 8.8.20.82 — first camera trial

Carvewright remains part of the Black Flag fleet. This build gives Ike a separate camera trial accessible from **Shop inbox → Try camera measurement** and from the Carvewright home page. Existing owner sign-in, saved orders and shop publication are unchanged.

## What can be tested now

1. Open the camera trial and use **Try the sample**. The generated board should measure **600.0 × 200.0 mm** and show your wording on the board.
2. For a real board, place a blank **85.60 × 53.98 mm ID-1 reference card** flat on its top face. The app needs that known scale; an ordinary photo alone cannot establish physical size. Include the entire card and rectangular board, with good light and no cut-off corners.
3. Take or choose the photo. Tap the card's four corners, starting at its top left and following its long edge clockwise; tap the board's four corners clockwise. The app calculates length and width. No board dimensions, rack code or species entry is required.
4. Compare with a ruler or tape, and repeat three times. Record actual dimensions, app dimensions and differences. These initial measurements are estimates; no production tolerance is certified.
5. Change wording and lettering. Prepare the test files, then tap each download in Safari. Save the evidence JSON, photo proof SVG, artwork SVG and artwork DXF together in Files. Confirm the files are present. Open the vector file in the shop's CAM software in **millimeters** and check dimensions before any machining.
6. Optionally enter your per-foot rates. The trial shows an estimate for each priced species, using measured length. It does not select a species or final price.

The browser route is the immediate measurement test. Corner taps are a first-test aid. The longer-term customer experience is automatic board detection, with retakes only where needed.

## Native sweep companion

`Sightline-Native-Source.zip` contains a small iOS Xcode project. It uses the ordinary rear camera, ARKit tracking and Vision rectangle detection; it does not request LiDAR. It finds a rectangular face, collects repeated plane measurements, and saves one photo/evidence JSON file through the system share sheet. Open that file in Carvewright with **Open native sweep file** to continue the same preview and export flow.

**This is source, not an installable iPad/iPhone app.** It has not been compiled, signed or run on an Apple device here. A Mac with Xcode and a signing team is needed. Follow `SIGHTLINE_NATIVE.md`; actual support and measurement quality must be checked on your iPhone 16 and your exact iPad Pro model. No TestFlight/IPA delivery is claimed.

## Scope and limits

- Start with flat rectangular shop boards. Live edges, curves, automatic species classification and thickness measurement are not implemented in this trial.
- Native repeatability is not accuracy. ARKit can lock onto the table plane instead of the board face; the device test must check that case.
- The photo method assumes a flat board and card on the same plane. Lens distortion, imprecise taps, shadows, glossy finishes and rounded card corners can affect results. Avoid the ultrawide lens.
- iPad/iPhone camera orientation and HEIC handling require device testing. JPEG/PNG can be used if the browser cannot decode a chosen image.
- SVG/DXF contain the exact outlined lettering shown in the preview. They are design inputs for CAM, not G-code or an approved machine program. Tooling, thickness, workholding and machine settings still belong to production preparation.
- The proof includes the board photograph; the artwork exports contain vectors. The evidence explicitly marks dimensions unverified, species/thickness unknown, customer approval false and machine program absent.
- Rates, photos and lettering are held only in this tab. There is no autosave, order submission, customer-data access, upload service or backend change. Download before closing or reloading.

## Verification for this release

Checks cover perspective calibration, invalid geometry, strict native-file validation, unknown-species pricing, shared preview/artwork geometry, export units, stale-data protection in the UI, cryptographic ID compatibility and Xcode project structure. Full fleet regression results are recorded in `SIGHTLINE_EVIDENCE.json` and the external package proof.

Cloud browser testing covered the sample, a synthetic native-file import, the rendered board proof, invalid-wording blocking and an actual evidence JSON download. SVG download completion was not confirmed by the cloud browser. iPad Safari downloads, native compilation, real photo/sweep accuracy and physical machining remain device acceptance work.

## Install this build

Use **Sightline-Upload.zip** over the complete **8.8.20.81 Keyline** source. Extract its one folder and upload **all files inside** to the existing repository root, replacing matching files and keeping everything else. After GitHub Pages finishes, confirm **8.8.20.82 · SIGHTLINE** in the Engine. Do not clear Safari data.

`Sightline-FullBackup.zip` is complete application source, not a backup of business records, Supabase or device photos. `Sightline-Native-Source.zip` is a separate development project; do not upload it into the website as the patch. Nothing has been deployed by producing these files.
