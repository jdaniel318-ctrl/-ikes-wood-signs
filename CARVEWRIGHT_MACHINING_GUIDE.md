# Carvewright First Cut — 8.8.20.57

Carvewright can now turn reviewed sign lettering into fixed-depth recessed pockets and downloadable CNC programs. It is an independent fleet application; quoting and invoicing remain separate business workflows.

## Start with your saved sign

1. Open Carvewright, open your saved job, and enter its design editor. Import your existing design JSON if you are using a different browser or the standalone workspace. Review and save any layout changes.
2. Select **Prepare machining**. Enter the measured material thickness, actual center-cutting flat end mill, depth, feeds, spindle speed and clearance. Select the controller, file units and work-zero position. The supplied numbers are editable examples, not cutting recommendations for your material or machine.
3. Select **Calculate toolpaths**, inspect **Preview**, then use **Export** to prepare the controller program and machining record after checking the exact setup.

Width and height come from the saved design. The lower-left origin is the lower-left of the blank as viewed from above, with positive X to the right and positive Y upward. Center origin places XY zero at the blank center. In both cases, Z zero is the top surface of the stock and negative Z is into the material. The installed tool must have enough cutting length for the requested depth.

Feeds are always displayed in **mm/min**; the program converts them to the selected controller units. Changing the inch/mm display changes length presentation without rescaling the saved artwork. The displayed time includes cutting and plunging only; travel, acceleration, setup and operator pauses add time.

## What the preview means

**Target lettering** is the intended pocket region. **Centerlines** are the generated cutter-center paths. **2D cut footprint** is the area swept by the actual circular cutter along those paths; it is not a 3D material-removal or collision simulation. **Travel** shows XY moves at the specified clearance above stock. Every pocket loop retracts before moving to another loop. Multiple depth passes repeat the calculated pockets down to the final depth.

Letter openings and islands are retained. A round cutter leaves a radius in sharp internal corners; the detail estimate reports areas the selected cutter cannot reach. Choose a smaller suitable cutter or enlarge the design when the remaining detail matters. A disconnected letter or punctuation region that the cutter cannot enter blocks calculation with an explanation instead of disappearing silently.

Large or excessively detailed work is bounded. If the job exceeds the available path budget, increase the cutter size or stepover where appropriate, simplify the geometry, or split the job into smaller designs. A rejected calculation does not produce a cutting file.

## Controller profiles

| Profile | Download | Units | Spindle behavior |
|---|---|---|---|
| ShopBot inches | `.sbp` | inches | Manual operator start/stop |
| ShopBot millimeters | `.sbp` | mm | Manual operator start/stop |
| GRBL 1.1 millimeters / inches | `.nc` | mm / inches | Manual or explicit controller spindle mode |
| LinuxCNC millimeters / inches | `.nc` | mm / inches | Manual or explicit controller spindle mode |

The machine photograph identifies the ShopBot brand, but not its exact model, controller generation or installed software. The ShopBot templates use documented OpenSBP linear commands and check the controller's current units before any movement. They do not change machine calibration or work zeros, home the machine, force Move/Cut mode, or assume spindle relay wiring. A units mismatch stops the program. Start and stop the spindle using the shop's established procedure at the program's operator prompts.

GRBL and LinuxCNC programs explicitly select the existing **G54** work coordinate system, clear temporary G92 and tool-length offsets, and begin with a Z-only clearance move before XY travel. Set the installed tool's stock-top zero and the selected XY origin in G54. LinuxCNC uses explicit exact-path mode. Controller spindle mode is appropriate only when the machine is configured to honor its M3/S and M5 commands; the program still pauses for speed confirmation.

No template connects to or starts a machine from the browser. Transfer the program through the machine's normal control software, network or removable-drive workflow. First load it in that controller's preview and confirm units, sign orientation, bounds, zero position and depth. Verify the physical setup, clearances and spindle operation with the machine operator before a trial cut. The browser cannot inspect clamps, actual stock placement, machine limits, controller configuration or tool installation.

## Keep three files with the job

- **Controller program:** the `.sbp` or `.nc` file to load into the selected controller after setup checks.
- **Machining record:** JSON containing the exact source design, setup, calculated movements, controller program and its checksum. Import this record through **Import setup** to reuse its settings; Carvewright recalculates paths for the currently open reviewed design.
- **Editable design:** the existing portable Carvewright design JSON. It retains the artwork and original design schema.

**Save setup** retains machining settings locally under the exact account, backend, environment, site, business and design. Fleet and standalone stores remain separate. Browser storage is not a shared server backup, so keep the downloaded JSON files. Editing any setup value clears the prior calculation/confirmation and revokes prepared download links. Closing the machining screen or losing its authorized workspace also releases those links. Routine valid session refreshes do not end work; the existing fleet idle and maximum-session policies still apply.

## Installation

The small **Upload** ZIP updates an exact complete 8.8.20.53, .54, .55 or .56 installation. Extract it, open its single matching folder, and upload every file inside over the existing repository files. Retain other existing files. Do not clear browser storage or reset the database.

The **Standalone** ZIP contains the independent local workspace. Extract the entire folder and open **carvewright.html** on a desktop browser. Keep every file together. No fleet sign-in is needed for the standalone reference workspace; its saved jobs do not automatically appear in the fleet workspace. The release has been exercised in isolated Chromium; native Firefox and iPad Safari acceptance are not claimed by those checks.

## Current scope and next development

This release supplies working flat-endmill lettering pockets and three controller families. It does not yet implement variable-depth V-bit carving, external SVG/DXF artwork import, 3D reliefs, profile cutouts with tabs, automatic tool changes, arbitrary third-party G-code import, or direct machine streaming. Existing artwork SVG export remains available. A proprietary `.crv` file is not required.

The next machining operation should be true V-bit carving, followed by controlled profile cutouts, tabs and job-level multi-tool sequencing. Additional controller families require their own documented post and verification; file extensions alone do not establish compatibility. Actual workshop cuts will determine the suitable material/tool presets and machine-specific adjustments.

## Primary references and bundled dependency

- [ShopBot control software](https://shopbottools.com/support-resources/control-software/)
- [ShopBot command reference](https://shopbottools.com/wp-content/uploads/2024/01/SBG00253150707CommandRefV3.pdf)
- [ShopBot programming handbook](https://shopbottools.com/wp-content/uploads/2024/01/SBG00314150707ProgHandWin.pdf)
- [Official GRBL 1.1 project](https://github.com/gnea/grbl)
- [LinuxCNC G-code reference](https://linuxcnc.org/docs/stable/html/gcode/g-code.html)
- [Clipper JavaScript library](https://github.com/junmer/clipper-lib), pinned package 6.4.2. Complete Boost and JSBN notices are in **CARVEWRIGHT_CLIPPER_LICENSE.txt**. The original bundled font attribution remains in **carve_font_license.txt** and the retained source guide.

Offline geometry, file readback, interface and release checks are recorded in **CARVEWRIGHT_MACHINING_EVIDENCE.json**. They are software evidence, not certification of an unidentified physical machine.
