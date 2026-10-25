# Carvewright Fleetcraft 8.8.20.59

Fleetcraft continues the working Carvewright 8.8.20.58 sign studio. It adds independent lettering and emblem objects, eight outline fonts, sixteen vector graphics, direct positioning, and an order brief that can accompany an Ike’s Wood Signs job.

## Install and test in three steps

1. Extract the **Fleetcraft Upload** ZIP. Open its single matching folder and upload the files inside it to the existing GitHub repository root, replacing matching names and retaining the other files. Use the current complete .58 site as the starting point. Your existing saved designs stay in their current browser/account workspace.
2. Open Carvewright and confirm **8.8.20.59**. Choose **Open sample sign**, name this new job **Fleetcraft test**, and choose **Open design studio**. Change the lettering style to check the new font picker.
3. Use **Objects → Add graphic** to insert a star. Move it to a clear area within the blank margins, adjust its size or rotation, and **Save design**. Return to the job and reopen the studio to confirm the saved layout. Send a screenshot of that result before proceeding to further tests.

No browser-data reset, SQL or account change is part of this update. A ZIP does not publish itself.

The separate **Fleetcraft Standalone** ZIP contains an independent local workspace. Keep its extracted files together and open `carvewright.html` in a browser. That copy has its own browser storage scope; use an exported editable design JSON to move a sign into it. Opening local HTML depends on the device/browser's file handling, so the existing hosted site remains the primary iPad testing route.

## Design controls

The editor keeps the preview visible and groups controls into **Edit**, **Objects**, **Blank** and **Review**.

- **Objects:** select your main lettering, add another text object, or choose an emblem. Each additional object has its own wording or graphic, position, size and rotation. Duplicate an object to make a separate editable copy. Removing the main lettering clears its wording; other objects remain.
- **Edit:** change the selected object's properties. Text has wording, font, size, spacing and alignment. Graphics have physical width and height. Position fields use your selected inches or millimeters. For graphics, position is the artwork center measured from the blank's upper-left corner. Text retains its established offset-from-layout controls.
- **Drag:** select an object and move it directly on the preview. A move beyond the blank margins is rejected. Numeric controls remain available for precise placement and recovery from an invalid value.
- **Rotate:** enter degrees. Graphic size describes the actual artwork before rotation, not empty space around the source drawing. New graphics begin with their original proportions.
- **Undo / redo:** step through this editor session's design changes. Undo does not roll back the saved revision counter or reinstate an old review. Save again to retain the chosen result.
- **Blank:** enter the actual material dimensions and margin; the illustrative wood appearance does not measure a real slab.
- **Review:** check the wording, placement and dimensions, mark the layout reviewed, and save before preparing machining or a saved-revision handoff.

Up to twelve objects, including the main text object, may be placed in a design. The combined design is limited to 240 visible lettering outlines and graphics for the bounded machining pipeline. Empty wording with no graphics produces a blank sign. Empty wording with graphics produces a valid graphic-only design.

## Eight bundled outline fonts

| Font | Design use |
|---|---|
| Studio Sans Bold | Clear, substantial everyday lettering |
| Studio Serif Bold | Traditional serif lettering |
| Frontier Western | Western display lettering; derived from Rye |
| Cinzel Bold | Inscription-style capitals and serif forms |
| Harbor Script | Flowing script forms; derived from Lobster |
| Heritage Stencil | Stencil-style lettering; derived from Stardos Stencil Bold |
| Cottage Serif | Rounded, friendly serif lettering; derived from Bree Serif |
| Black Ops One | Angular display lettering |

These are public reference styles with bundled vector paths and attribution. They are separate from Ike's approved production A/B/C alphabets. The font picker shows the actual outlines used for the sign. Unsupported characters are reported explicitly; there is no browser-font substitution. Cottage Serif's source lacks the currency symbol `¤`, which remains unsupported in that style.

## Sixteen editable graphics

Anchor, compass, pine tree, mountains, oak leaf, antlers, fish, paw print, cabin, campfire, wave, sun, heart, star, crossed tools and ribbon.

Each is filled vector artwork. The entered scale and installed cutter determine which details can be pocketed. The CAM engine rejects a disconnected detail that the selected cutter cannot fit; choose suitable artwork dimensions and a suitable verified tool before a physical job. The original fixed-depth flat-endmill pocket operation remains in use.

The software matrix checks all sixteen graphics at a **100 mm longest dimension**, rotated **17°**, with a **3.175 mm flat endmill**. Smaller details can need a different cutter or larger artwork; the smaller-compass rejection remains covered. These checks establish software behavior for those inputs, not suitability for every scale or physical tool.

## Save and move existing designs

Existing v1 jobs keep their original model and geometry until an advanced object or rotation operation is used. Advanced layouts use the explicit v2 design and job-file schemas. Carvewright .59 reads both; an older studio cannot read a v2 file. Import creates a new unreviewed copy and preserves the original source record.

Browser saves retain the current account, business workspace, backend, environment and site boundaries. Keep downloaded editable job files for portable copies. Moving to another browser, device, standalone folder or site can produce a different local workspace.

## Handoff for Ike’s and other requesting businesses

Set the **Requesting business**, **Source job or order reference** and **Job notes** in the job details. The Ike sample already identifies Ike’s Wood Signs. Review the layout and save it, then open **Handoff** and choose that saved revision.

**Prepare files & order brief** prepares the requested SVG and/or editable JSON, a printable HTML brief, and an order-brief JSON when editable output is selected. The brief includes the named requesting business, source reference, blank dimensions, wording, notes, exact design revision, fingerprint and artwork.

Download the files you want to deliver. Preparing or downloading them does not send a message or create an order, invoice, payment or customer record. Requesting-business labels describe the job; they do not grant access to another business's private workspace. A newer saved revision invalidates the prepared handoff at download time.

## CNC preparation

The same composed vector paths feed the on-screen layout, physical-size SVG, editable job and existing CAM engine. Preserve the current workflow: review and save the design, open **Prepare machining**, confirm the intended settings, calculate paths, inspect the preview, and use the appropriate export action.

Controller-preview files remain available when the machine is elsewhere. Setup-confirmed cutting exports keep their separate confirmation. The browser does not operate a machine. Software checks and a preview file do not establish that a particular physical CNC, cutter or workholding setup is ready.

The operation remains fixed-depth flat-endmill pocketing. Variable-depth V-carving, arbitrary SVG/image import, relief carving, cutouts with tabs and direct machine streaming are separate future work.

## How this strengthens the fleet

The expanded font library, immutable artwork catalog, physical layout controls, exact export checks, safe download checks and regression tests are reusable capabilities. The catalog contains artwork and source identities, with no customer, order or financial data. Each receiving business retains an explicit handoff and its existing authorization boundary.

Current software verification and its limits are recorded in `FLEETCRAFT_EVIDENCE.json`. This includes 17 model and original-file checks, 26 geometry/controller cases, 9 editor cases, 4 handoff cases, 5 machining-download cases, and 3 actual release-loader cases, plus asset and package validation. The original revision-4 “Smoke Hole!” fingerprint and ShopBot preview remain byte-exact. Phone and iPad layouts were tested in Chromium with touch events; native iPad Safari and a real machine cut remain separate acceptance checks.

Package reconstruction is measured against the exact recovered GitHub .58 source; `FLEETCRAFT_BASELINE.json` explains the old inventory's missing temporary entry. Historical release evidence remains historical.
