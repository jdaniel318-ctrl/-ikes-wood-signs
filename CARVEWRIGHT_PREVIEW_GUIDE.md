# Carvewright 8.8.20.58 — controller-preview downloads

You can prepare a program for inspection in the intended controller before the machine is available. This update adds a separate preview export and retains the existing setup-confirmed cutting export. The geometry, depth passes, feeds and controller command generation are unchanged from .57.

## Prepare a preview file

1. Open your saved sign, enter **Open design studio → Prepare machining**, and load or enter the intended settings. Existing saved designs and machining setups are retained by the update.
2. Select **Calculate toolpaths** and inspect the Preview. Each reopened machining session requires a fresh calculation.
3. Open **Export** and select **Prepare preview files**. Download the controller program and machining record. A physical-setup confirmation is not required for this preview path.

The program filename includes **PREVIEW**. Its comments identify the setup as unverified. The machining record states `exportPurpose: "controller-preview"`, `setupConfirmation: null`, and `physicalMachineAcceptance: false`. The editable-design download retains the existing design schema and source artwork.

These are actual CNC instructions for loading in the controller's preview mode. **The filename and comments are labels, not a hardware interlock:** the file can cause movement if run in a machine's cutting mode. Use controller Preview/Simulation mode for inspection and verify the actual workshop setup before any physical cut. The browser does not connect to a CNC machine.

ShopBot states that its control software can run in Preview Mode without a connected machine. Its download page distinguishes software for different ShopBot controller generations: [ShopBot Control Software](https://shopbottools.com/support-resources/control-software/). A photograph identifying the ShopBot brand does not establish its exact controller generation.

## Prepare setup-confirmed cutting files

Use the existing cutting-file action after checking the exact layout, measured stock, installed cutter, work zero, travel clearance and controller settings for the intended machine. That path still requires its confirmation checkbox. Generating a file does not certify the physical machine or setup; controller preview and the operator's checks remain necessary.

Both purposes use the same bounded CAM engine, exact source revision and controller profiles. Each program is checked through readback; the machining record's program checksum covers the actual delivered bytes, including any preview header. The preview does not alter feeds, depths, movement order, spindle mode or coordinate system.

Changing a setup value invalidates either prepared export. Every download rechecks the live workspace and saved source revision; a newer saved design prevents a stale prepared download. Closing the workspace or losing its authorized session releases prepared links. Previously downloaded files remain separate copies, so keep the appropriate machining record with each file.

## Existing work and installation

The update preserves the saved-design and machining-setup databases, account/business boundaries and session policy. No database reset, browser-data clearing, design reimport or SQL is required. Fleet and standalone workspaces continue to use separate local storage scopes.

Use the small current **Upload** ZIP over an exact complete .53, .54, .55, .56 or .57 installation: extract the single matching folder, upload every file inside, replace matching names, and retain other repository files. The **Standalone** ZIP opens independently through **carvewright.html** with all extracted files kept together.

The prior guide **CARVEWRIGHT_MACHINING_GUIDE.md** remains the reference for toolpath setup, coordinate systems, controller profiles and current machining scope. Its original export instructions describe the .57 cutting-file path; this guide adds the .58 preview-file path. Current validation is recorded in **CARVEWRIGHT_PREVIEW_EVIDENCE.json**; original .57 evidence is retained unchanged.

This release still implements fixed-depth flat-endmill letter pockets. Variable-depth V-bit carving, profile cutouts with tabs, relief carving and direct machine streaming are not added by this update.
