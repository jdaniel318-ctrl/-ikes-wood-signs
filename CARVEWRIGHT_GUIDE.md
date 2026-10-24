# Ike’s Carve Studio

**Carvewright 8.8.20.54 — vector design foundation**

Create a sign layout, keep an editable job file, and export the lettering as physical vector artwork. You can begin with the included reference lettering without a VCarve `.crv` file.

## Open the standalone studio

1. Extract `DarkSky882054-Carvewright-Standalone.zip` and keep its nine files together in the extracted folder.
2. Open `carve-studio.html` in your browser. The example starts with “Smoke Hole!” on an entered 24 × 8 inch blank.
3. Change the wording and blank dimensions, then choose **Download job** and click the visible **Download file** link to keep your editable copy.

This standalone copy opens without a sign-in or web server. Its local saved-design list is separate from the signed-in business workspace. Moving or renaming the folder, changing browser/profile, or clearing website data can affect browser storage. Keep downloaded job files for work you want to retain or move.

## Open it inside the business application

Install the Carvewright update over the complete Quartermaster 8.8.20.53 release using `UPLOAD_THIS_ONE_BUILD.md`. In the existing authorized **Quotes & invoices** workspace, select **Ike’s Wood Signs** and choose **Open Carve Studio** on Overview.

Saved designs are scoped to the current account, business, backend, environment and site. Closing the owning workspace or changing its business/session closes the editor. The studio has a separate design store; it does not edit catalogs, quotes, invoices or orders.

## Make a layout

| Control | What it does |
|---|---|
| Design name | Names your saved design and downloaded files. |
| Your wording | Preserves uppercase/lowercase letters, punctuation, spaces and explicit line breaks. Up to three lines and 240 Unicode characters. |
| Lettering style | Uses bundled Studio Sans Bold or Studio Serif Bold vector outlines. These are public reference styles, not Ike’s approved A/B/C alphabets. |
| Lettering size | Scales the whole layout within the entered blank and margins. It is a percentage of available layout space, not a fixed letter height. |
| Letter spacing | Adjusts spacing between glyphs. |
| Alignment | Aligns the lines left, center or right. |
| Blank & size | Sets physical width, height, thickness, margins and position in inches or millimeters. |
| Material / Outlines | Changes the preview appearance. The wood image is illustrative and does not measure or identify a real slab. |
| Guides | Shows or hides the preview margin and center guides. |

The layout uses real vector outlines, including counters in letters such as A, B and O. Leading/trailing spaces and blank-line advances participate in fitting and placement. Unsupported characters are reported explicitly; the editor will not substitute an unrelated browser font. Blank wording leaves a blank sign. Invalid dimensions or lettering outside the margins block review and export.

## Save, review and move a design

**Save design** stores a revision in this browser. Choose it under **Saved on this device** and press **Open** to return to it. If another window has saved a newer revision, the editor reports a conflict; download your current job to retain those edits before reopening the saved copy. A storage error is shown as an error, never as a successful save. Portable exports remain available when storage is unavailable.

**Mark layout reviewed** records that this exact design was checked locally. Changes to the design reset that review. Save afterward to retain it. This marker is not customer approval and does not release a machine job.

**Download job** prepares a JSON file containing the editable design, exact generated geometry and source identity. Click the resulting **Download file** link. On another device, choose **Open job file** and select that JSON. Import checks the data and generated paths, then opens a new, unreviewed copy; it does not overwrite an existing design. There is no automatic cross-device synchronization.

The import control accepts Carve Studio job JSON only. This version does not import arbitrary SVG, DXF, VCarve `.crv`, pictures or old game/business JSON files.

## Export artwork

Choose **Export SVG**, then click **Download file**. The SVG contains the same glyph outlines and transform values shown in the preview, with physical width/height in millimeters and a blank-sized coordinate system. It includes lettering only. Preview wood, guides, rulers and the decorative blank outline are excluded.

Opening the SVG in a compatible design/CAM program is the next handoff. Check the imported size and placement in that program. Compatibility and units have not yet been checked in Ike’s installed VCarve version. The SVG is artwork, with no toolpaths, cutter selection, depth, feeds, safe heights or machine instructions.

## Current scope and next build

This release is the design stage of our own integrated application. It provides an editable physical vector document, preview, reviewed-layout state, isolated local saves and portable exports. It does not perform CAM calculation, material-removal simulation, automatic quoting or machine operation.

The next engineering stage is an independently verified CAM worker: begin with a simple reference shape, verify cutter geometry and depth, then connect toolpath preview and material-removal simulation. A machine-specific postprocessor and shop acceptance follow after the actual controller, tools and setup are known. Approved Ike lettering can be added when its vector geometry becomes available; it is not required to continue developing the application.

Offline Chromium checks cover vector geometry, scope/revision behavior, the actual editor and integrated workspace, responsive layouts and a local-file entry. Native Firefox, iPad Safari, the installed VCarve program and physical machining are separate acceptance checks.

Public references and font attribution are listed in `CARVEWRIGHT_REFERENCE_SOURCES.md` and `carve_font_license.txt`.
