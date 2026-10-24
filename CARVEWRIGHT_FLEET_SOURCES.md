# Carvewright 8.8.20.55 — source and design notes

This release implements the Captain’s approved independent Carvewright direction. Its app, jobs, editor integration and fleet adapter are original project code. The seven new runtime assets are `carvewright_core.js`, `carvewright_store.js`, `carvewright_studio.js`, `carvewright_app.js`, `carvewright_fleet.js`, `carvewright.css` and `carvewright.html`.

## Retained geometry and reference lettering

The independent core reuses the verified physical glyph/layout implementation in `carve_core.js` and the bundled outlines in `carve_fonts.js`. These legacy files and `carve_store.js` remain byte-identical to 8.8.20.54. The older store is used only to read a selected same-scope design for an explicit copy. Current Carvewright records use a separate schema and store.

- DejaVu project: <https://dejavu-fonts.github.io/>
- DejaVu license: <https://dejavu-fonts.github.io/License.html>

Studio Sans Bold and Studio Serif Bold are the public reference styles derived from DejaVu Sans Bold and DejaVu Serif Bold. Their source hashes and outline data remain bundled, with the license and required notices in `carve_font_license.txt`. They are not representations of Ike’s approved A/B/C lettering.

## Public workflow references retained from .54 research

- Vectric VCarve Pro 12.5, V-Carve Toolpath: <https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/form/VCarve%20Toolpath%20Creator/index.html>
- Vectric VCarve Pro 12.5, File menu: <https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/form/file-menu/index.html>
- Vectric Gadgets developer information: <https://gadgets.vectric.com/developerinfo/>
- FreeCAD V-carve implementation: <https://github.com/FreeCAD/FreeCAD/blob/main/src/Mod/CAM/Path/Op/Vcarve.py>
- FreeCAD V-carve checks: <https://github.com/FreeCAD/FreeCAD/blob/main/src/Mod/CAM/CAMTests/TestPathVcarve.py>
- FreeCAD CAM simulator documentation: <https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/CAM_Simulator.md>
- FreeCAD postprocessor documentation: <https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/CAM_Post.md>

These are retained research references, not newly verified compatibility or machining results. No Vectric program code, proprietary `.crv` reader or shop project is included. FreeCAD remains a candidate for a future separately verified CAM worker; it is not bundled or executed by this browser release.

## Authority and handoff boundaries

The signed-in entry uses the existing Admiral authority verification and captures account, backend, environment, site and application scope. Requesting-business metadata is a job label and provenance, not authorization. The local My Fleet service card does not alter canonical vessel registration or protected counts. The standalone entry contains no fleet-auth adapter or private-account configuration.

Handoff files describe a saved reviewed layout. Preparing or downloading them does not transmit data to another business, reserve a ScheduleJoe slot, post an invoice, order material or operate a machine. Existing financial and customer workflows remain in their own scope.

The new `CARVEWRIGHT_FLEET_EVIDENCE.json` records current source verification. Earlier evidence and source documentation stay in the full release as historical records; they do not describe the new .55 navigation. Use `CARVEWRIGHT_FLEET_GUIDE.md` for the current workflow.
