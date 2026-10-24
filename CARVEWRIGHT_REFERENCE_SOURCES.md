# Carvewright 8.8.20.54 — public reference sources

Reviewed 24 October 2026. This release contains our original design editor and bundled public reference lettering. No shop `.crv` file or private VCarve project was required.

## Bundled lettering

- **DejaVu Sans Bold and DejaVu Serif Bold:** https://dejavu-fonts.github.io/
- **License:** https://dejavu-fonts.github.io/License.html

The editor labels its reference styles **Studio Sans Bold** and **Studio Serif Bold**. Glyph outlines and advances were generated from the installed source TTF files with fontTools, rather than drawn with whatever font happens to be installed in the browser. Each style supplies 198 glyph entries, including spaces, basic Latin lettering, Latin-1 characters and selected typographic punctuation. Source names and SHA-256 hashes are embedded in `carve_fonts.js`; portable job files bind those hashes and the generated paths. The font license and notices accompany the assets in `carve_font_license.txt`.

These reference styles do not claim to reproduce Ike’s approved A/B/C alphabets. Unsupported glyphs are rejected explicitly. The source font identity does not establish compatibility with any previous shop project.

## Vectric workflow research

- **VCarve Pro 12.5 — V-Carve Toolpath:** https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/form/VCarve%20Toolpath%20Creator/index.html
- **VCarve Pro 12.5 — File menu and vector export:** https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/form/file-menu/index.html
- **Vectric Gadgets — developer information:** https://gadgets.vectric.com/developerinfo/

The documented V-carving operation relates tool angle and vector width/shape to a variable cutting depth. That informed the separation between physical artwork and future cutting calculations. Vectric’s documented vector-export formats include SVG. These public documents inform workflow design; they do not establish that our exported SVG has been opened or machined in Ike’s installed software. No proprietary `.crv` parser, Vectric program code, or Vectric artwork is included.

## Candidate independent CAM engine — research only

- **FreeCAD V-carve implementation:** https://github.com/FreeCAD/FreeCAD/blob/main/src/Mod/CAM/Path/Op/Vcarve.py
- **FreeCAD V-carve checks:** https://github.com/FreeCAD/FreeCAD/blob/main/src/Mod/CAM/CAMTests/TestPathVcarve.py
- **FreeCAD CAM simulation documentation:** https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/CAM_Simulator.md
- **FreeCAD postprocessor documentation:** https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/CAM_Post.md

The public FreeCAD implementation uses compiled geometry capabilities, including a Voronoi diagram service. Its reference checks include tool geometry/depth calculations and a rectangular shape. FreeCAD is a candidate for a separately versioned CAM worker; it is not bundled into this browser release. The required compiled runtime was absent from the build environment, so there is no claim of a successfully executed FreeCAD toolpath, stock simulation or machine output here. The next stage must pin a specific compatible build and verify its actual results.

## Shop equipment reference

- **ShopBot control software information:** https://shopbottools.com/support-resources/control-software/

This is a possible controller reference, not confirmation of Ike’s machine/controller model, firmware, postprocessor or operating settings. Those remain to be established before a machine-specific workflow is released.
