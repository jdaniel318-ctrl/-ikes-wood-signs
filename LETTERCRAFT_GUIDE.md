# Lettercraft 8.8.20.61 - two new lettering trials

Carvewright and Ike's embedded sign designer now offer ten vector lettering styles. This update adds **Retroline** and **Orchard Swash** to the existing eight. Both new families are bundled as exact outlines; customers can type their own wording, change size/position/rotation, combine graphics, save editable jobs and export the same geometry to SVG/DXF.

**Your test starts in Ike's store with your own words.** Open **Design a sign for Ike**, type the wording for the first board, choose either new font, and arrange the sign. The examples below are optional starting points; no preset phrase is required. Create a separate request for the second board so its distinct wording, font, measurements and pictures stay together.

## The two-board trial

| Board | Starter wording | New font and composition | What to learn |
|---|---|---|---|
| 01 | NIGHT TIDE | Retroline striped lettering and a wave accent | Fine channels, islands, counters, spacing and cutter access |
| 02 | Cedar & Ember | Orchard Swash mixed case, a tilted baseline and paired oak leaves | Thick/thin transitions, decorative strokes, ampersand detail and small accents |

These are two separate editable drafts, quantity one each. The starter wording/layouts were selected for this experiment and can be changed. They use **24 x 8 x 0.75 inch reference canvases** (609.6 x 203.2 x 19.05 mm). Those are not measurements of your actual boards. Cedar coloring is illustrative; Ike fits the artwork to the measured boards before creating his cutting files.

The job pack **Ikes-Two-Board-Trial-01.zip** contains a separate folder for each design, each with `editable-design.json`, `artwork.svg`, `artwork.dxf`, `preview.png` and `board-notes.txt`. The combined preview and two-page review/result sheet let Ike compare the pair and record decisions and results. `trial.json` records the design fingerprints, reference status and pending approvals. A checksum manifest identifies the exact files.

## Three focused steps

1. **Install and enter Ike's store.** Extract the Lettercraft Upload ZIP, open its one matching folder, and upload every file inside over your existing .60 repository. Replace matching files and retain the rest. Reload and confirm **8.8.20.61**. Open Ike's customer experience and choose **Design a sign for Ike**, then **Create sign design**. The font picker should offer ten styles including Retroline and Orchard Swash.
2. **Create your two distinct signs.** Type your own words for Board 1, choose a new font, set its size and arrangement, then **Use this design**. Add the board photo, contact details and quantity **1**; review, **Prepare complete package**, and **Download complete ZIP**. Keep that ZIP before choosing **New request**. Repeat with your own second wording and a different font for Board 2. Each package retains its own editable JSON, exact outlined SVG/DXF, preview, photographs and details.
3. **Learn with Ike.** Send each complete request from the live store, or give Ike the two downloaded packages. He can import each `artwork.dxf` or `artwork.svg` into his CAM, fit it to its actual board, select his cutter/setup and machine post, and approve the trial. Use the review/result sheet to record the actual wording and findings. Keep a photo, any adjusted artwork and the machine setup with each board's result.

To explore the optional examples separately, extract **Ikes-Two-Board-Trial-01.zip** and import either board's `editable-design.json` through Carvewright **Bring a design** after installing .61. Each imported file becomes a separate editable job. The customer-store test does not require importing these examples.

## Artwork and machine output

SVG retains exact outlined curves and a physical millimeter canvas. DXF contains closed polylines, explicit millimeter units, a lower-left origin, and a 0.02 mm curve-flattening tolerance. Artwork bounds are smaller than the reference stock: set the CAM stock dimensions separately instead of stretching the artwork bounds to the blank automatically.

Retroline intentionally has multiple fine channels and small islands. Orchard Swash contains stroke contrast and ornamental ends. A suitable cutter and scale may change the result; that is part of this trial. Use the actual CNC's CAM/postprocessor for executable movement commands. The supplied trial ZIP contains editable artwork and review material, not an asserted universal machine program. Existing Carvewright flat-endmill pocketing and ShopBot, GRBL 1.1 and LinuxCNC inch/mm exporters remain available separately.

## Ike requests and fleet reuse

The existing Ike request flow still accepts photos, contact/details, customer review and a complete downloadable package. Its email submission sends one complete ZIP in an identified live deployment; real provider attachment support and actual inbox receipt still need confirmation. This update sends no message automatically. A customer review remains separate from Ike's approval of the actual job and setup.

The new fonts live in the shared catalog so compatible fleet tools can reuse them. Editable/vector artwork can travel with a job; each receiving shop chooses the setup for its own machine. Customer records, private jobs, finances and sign-offs remain in their own business scope.

The own-wording storefront check also exposed an existing resize handler outside its owning scope. This update moves it beside its private placement function, so changing the viewport while designing no longer raises that reference error.

## Preservation and evidence

All eight previous font objects and sixteen graphic objects remain unchanged. Existing design/storage schemas and request transport are preserved. The functional changes are the new catalog entries, license notices, dynamic font-picker count and the scoped Ike resize handler, plus release identities and records. No SQL, clearing Safari storage, deletion or database reset is needed.

The .61 software update is an exact overlay of the delivered Shopcraft .60 full release. The full software backup does not contain private browser-saved designs; keep their exported JSONs. Historical release guides/evidence retain their original version numbers.

See `LETTERCRAFT_EVIDENCE.json` for completed file/editor/release verification. These checks establish software behavior and file integrity; actual board measurements, Ike's approval, CAM acceptance and physical cutting results are workshop evidence to collect during the trial.

## Font sources

The two new families come from the official Google Fonts repository, with pinned source and OFL license hashes recorded in the generator and complete notices in `carve_font_license.txt`.

- https://github.com/google/fonts/tree/main/ofl/monoton
- https://github.com/google/fonts/tree/main/ofl/berkshireswash

The application variants are named Retroline (source: Monoton) and Orchard Swash (source: Berkshire Swash). Original names, authorship and reserved-name declarations remain in the source attribution and license notices.

A focused software check found that Retroline lettering in the older exemplar job has a disconnected detail that the example 3.175 mm cutter cannot enter. The engine correctly rejects that setup. A separate 1.5875 mm software fixture generated and parsed all six supported controller outputs successfully. These are verification settings, not cutting recommendations for your actual boards.
