# Sightline Fieldnote 8.8.20.83 — index-card bridge

Carvewright remains part of the Black Flag fleet. Open **Ike’s Shop inbox → Try camera measurement** or the camera trial link on Carvewright’s home page. Existing owner sign-in, saved orders and shop publication are unchanged.

**Measuring without a card is the destination.** Index cards are a temporary way to establish scale in this browser photo trial. The independent native sweep route uses its own measured scale and never requires a card. Neither route has certified production accuracy.

## Three first tests

1. Choose **3 × 5 inches** or **4 × 6 inches** to match the physical index card. Check its package or measure the card once; do not guess its size. Place it flat on the board’s top face, long edge across the photo. Customer name and phone/email can be written clearly inside its edges. Keep all four corners visible.
2. Take or choose a photo of the entire flat rectangular board. Tap the card’s corners starting at top left and following the long edge clockwise, then the board’s corners clockwise. Compare the reported length and width with a ruler. Repeat photos before assessing accuracy. Changing card size clears old measurements and downloads; the generated sample rebuilds itself using the new size.
3. Enter wording, choose lettering and prepare files. Keep the **Private job JSON** private: it contains the capture with the card’s writing and measurement/artwork evidence. Save **Private photo for Ike** as well: this unredacted JPEG opens directly in Files so Ike can read the card. The **Photo proof** SVG embeds an image with the marked card pixels covered. Inspect it before sharing. Save the artwork SVG and DXF in millimeters for CAM review.

The card’s contact information stays as a photograph for Ike to read. There is no handwriting transcription or automatic order submission. The capture in the private file is the browser-normalized JPEG (up to 1600 pixels on its longest edge), not the untouched camera original. Downloads are not encrypted. Writing outside the marked card is not removed; careful corner marking and a visual proof check are necessary.

The covered area is intentionally plain; the app does not invent hidden wood grain. Photo proof and artwork use the same outlined lettering. The exported SVG photo now uses an image reference compatible with SVG 1.1 renderers as well as current browsers.

## Native sweep path

The unchanged **Sightline-Native-Source.zip** is an iOS development project, not an installable app. It uses ARKit and Vision rectangle detection without requiring a reference card. A Mac with Xcode and a signing team is needed to build/install it; see SIGHTLINE_NATIVE.md. It has not been compiled, signed or tested on an Apple device here. Open its bounded capture JSON using **Open native sweep file**.

Native imports do not acquire a reference-card dependency. Native proofs have no automatic card redaction; inspect them for personal details before sharing. Test the exact iPad Pro model and iPhone 16 before relying on results. Stable repeatability is not certified accuracy.

## Scope

- No rack code, board dimension or species typing is required in this trial. Photo corner taps and the reference size choice are temporary testing aids.
- Start with flat rectangular boards. Live-edge tracing, thickness measurement and reliable species identification are still future work. The user’s live-edge board is useful future test material, but this release does not trace its actual boundary.
- Card and board face must lie on the same plane. Avoid wide-angle lens distortion, cut-off corners and poor light. A wrong card size produces a wrong board scale.
- Pricing remains conditional on species. Only per-foot rates are entered; no species guess becomes a final price.
- SVG/DXF are design inputs for CAM, not a machine program. Dimensions remain unverified; customer approval is false and species/thickness remain unknown.
- Everything stays in this tab until downloaded. No autosave, production order writes, server upload, authentication or backend changes. Download before closing/reloading.

## Before production

Production use still needs a review of upload permissions and customer-data handling. This build remains a device trial; its private downloads are unencrypted and must be kept private. Native imports now check both declared dimensions and the actual JPEG frame header against the 16-megapixel limit before decoding.

## Verification

Automated checks exercise both reference sizes against independently projected dimensions, invalid inputs, pixel-level redaction without changing the private source, native evidence validation, preview/artwork consistency and retained fleet behavior. Browser checks cover both samples, ordinary photo corner marking, changed-size invalidation, native import and private JSON download/readback. The embedded proof raster was inspected for redaction and its SVG rendered successfully in Inkscape. Cloud SVG download completion remains unconfirmed; device download and real measurement acceptance remain pending. See FIELDNOTE_EVIDENCE.json and the external package proof.

## Install

Extract **Fieldnote-Upload.zip** and upload every file inside its single folder to the existing repository root over complete **8.8.20.82 Sightline**. Replace matching files and keep all others. After GitHub Pages finishes, confirm **8.8.20.83 · FIELDNOTE** in the Engine. Do not clear Safari data.

**Fieldnote-FullBackup.zip** contains application source only, not customer/device/database records. The native source project is unchanged. Building these archives does not deploy the website.
