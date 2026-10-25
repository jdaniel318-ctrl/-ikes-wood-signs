# Ike’s Shopcraft 8.8.20.60

## What this build adds

Ike’s customer welcome now has **Design a sign for Ike**. It opens the same vector lettering and graphics editor proven in Fleetcraft, inside an Ike-branded sign request. The customer supplies photographs and contact details, approves the complete request, downloads one ZIP and can submit that ZIP to the existing email provider from the live shop.

**Ike reviews before production.** This request gives Ike the artwork and information needed to assess the job. Ike confirms the actual wood, dimensions, finish, price, tooling and machine setup before accepting production. The existing production-order checkout and its stock/species holds remain in place.

## Upload the update

Use the **DarkSky882060-Shopcraft-Upload…zip** provided with this guide. Extract it, open its one matching folder and upload every file inside to the existing Fleetcraft .59 repository. Replace matching filenames and retain the rest. The update requires no SQL, deletion, database reset or clearing of Safari data.

The update is verified against the complete .59 active release at GitHub commit `355afe648910bb944ffc83504ece4bb8d79575ab`. The accompanying **DarkSky882060-Shopcraft-FullBackup.zip** is the complete active software release. Software backups do not contain browser-saved designs or private customer requests; keep their own exported files.

After the site finishes updating, reload and confirm **8.8.20.60**. The sign request footer also identifies **Shopcraft 8.8.20.60**.

## Three focused iPad tests

1. **Open and design.** Open Ike’s customer experience and tap **Design a sign for Ike**. Tap **Create sign design**, enter a short test sign, choose a font and graphic, set the requested physical size, then tap **Use this design**. Confirm the wording, placement and dimensions are correct when you return to the request.
2. **Prepare and keep the complete package.** Add at least one plank/reference photograph and your name plus email or phone. Enter quantity, finish and notes, check the review box, and tap **Prepare complete package**. Tap **Download complete ZIP**. In Files, extract it and open `request-brief.html`; check that the approved picture, reference photo, contact information and dimensions all appear. Keep this ZIP.
3. **Test the real handoff once.** In the live customer experience, check the intended recipient and tap **Send request to Ike** once. Record the displayed result. Ask Ike to confirm that the email arrived with the ZIP and that he can extract it. Have him import `artwork.svg` or `artwork.dxf` into his actual CNC software, using millimeters and checking the geometry against the brief. Stop after that handoff test; this software check does not authorize a machine cut.

Private Preview and Sea Trial deliberately cannot send. They can prepare and download a package in memory. A live shop without an identified deployed customer context also cannot send.

## Customer workflow

### Design

The embedded editor offers the existing eight outlined fonts and sixteen graphics, separate text/graphic objects, position, size, rotation, undo and redo. **Use this design** returns the artwork to the request. It does not open private Admiral jobs or save over an existing Carvewright design.

Dimensions and species entered here are requested specifications. The wood-like preview is illustrative. Photographs show the actual plank or inspiration, but do not establish a calibrated size or prove that the wood is suitable for machining.

### Pictures and details

Add **one to three photographs**, each original file no larger than **10 MiB**. The app creates bounded JPEG reference copies with a longest edge of at most **1,600 pixels**. Original filenames and SHA-256 hashes accompany the reference metadata; the archive contains the normalized copies. If Safari cannot decode a selected image, use a JPEG or PNG copy.

The form requires a name, an email address or phone number, quantity from 1 to 100, and nonblank valid artwork. The requested finish and freeform notes travel with the request. No price is calculated or production order accepted by this workflow.

### Review, save and package

The review checkbox covers the design, dimensions, details and pictures. Preparing the package freezes the exact preview and saves a request revision before enabling download or send. Changing content or pictures clears approval and the old package. Prepare the revised request again.

Only the current request is shown in the customer workspace. **New request** clears the contact fields, pictures and design for the next customer. Closing and reopening also starts fresh. There is no public customer-history list. Download your complete ZIP before leaving if you need a portable copy.

### Send and read the result

The app displays the intended shop address, currently **ikeswoodsigns.orders@yahoo.com**, before submission. The existing provider access key determines the actual email route; the displayed address is not proof of the provider account’s current destination. No provider credentials or destination were changed for this build.

The app submits **one required complete ZIP**, subject to a **5 MiB application ceiling**. It does not replace a failed attachment submission with text alone. A send attempt is saved first, with an attempt identifier carried in the email/package metadata. The delivered bytes and archive hash remain available for download.

| Result | Meaning and next action |
|---|---|
| Provider accepted | The provider acknowledged the complete request submission. Confirm actual inbox receipt with Ike. |
| Failed | The provider explicitly rejected the submission. Keep the ZIP and have the shop owner check attachment support before a deliberate retry. |
| Unconfirmed | The response was interrupted, timed out or ambiguous. The provider may already have accepted it. Check with Ike before sending another copy. |
| Blocked | The app did not dispatch this attempt because the request, package, scope, configuration or size check failed. Read the displayed reason. |

Accepted, unconfirmed and still-attempted requests cannot automatically resend. A changed saved revision blocks an old package. A larger package can still be downloaded; reduce the photographs or artwork and approve a new package to fit the email ceiling.

**Provider requirement:** Web3Forms documents file attachments as a PRO feature requiring an active subscription. Its current account entitlement, ZIP-file acceptance, configured destination and real inbox receipt were not verified during software development. If the provider rejects the ZIP, the complete downloaded archive is available for manual attachment in your email application. Do not treat a provider acknowledgement as an inbox receipt.

## What Ike receives

With one photograph, the package contains ten files; each additional photograph adds one file.

| File | Purpose |
|---|---|
| `preview.png` | Frozen picture of the customer-approved design. |
| `photos/reference-01.jpg` and optional `02` / `03` | Normalized plank or inspiration photographs. |
| `request-brief.html` | Readable visual brief with the preview, pictures, contact information and specifications. Extract the whole ZIP before opening so relative pictures can load. |
| `request-brief.txt` | Plain text copy of the sign information. |
| `artwork.svg` | Exact outlined artwork with a physical millimeter canvas; no installed fonts are needed. |
| `artwork.dxf` | Closed polyline artwork for CAD/CAM import, in millimeters. |
| `editable-design.json` | Editable Carvewright job with the source font/graphic fingerprints. |
| `request.json` | Saved request, approval, reference metadata and any persisted delivery attempt. |
| `README.txt` | File explanations and CNC import/setup instructions. |
| `manifest.json` | SHA-256 hashes and byte counts for the other files, plus the saved revision and artwork/proof fingerprints. |

The app also displays the SHA-256 hash of the complete ZIP, which identifies the exact archive submitted. Hashes establish byte agreement; they do not certify the sign or the machine setup.

## CNC compatibility

The portable master files are **SVG and DXF**, so Ike can use the CAM software associated with his machine. The design is outlined geometry; it does not depend on having the customer’s font installed.

| Software family | Documented import route |
|---|---|
| Vectric VCarve Pro / Aspire | SVG or DXF vector import; choose the actual machine’s post when saving toolpaths. |
| Carbide Create | SVG or DXF import, followed by toolpath creation. |
| Easel | Outlined vector SVG or closed-polyline DXF; choose matching millimeter units and observe Easel’s file-size limit. |
| Autodesk Fusion | Insert SVG or DXF into a sketch, then create CAM operations and select the actual machine’s post. |

These are documented file-format routes, not a claim that this build was opened in each commercial program or tested on every machine.

The DXF uses ASCII AutoCAD 2000 (`AC1015`) closed `LWPOLYLINE` entities, explicit millimeter units, a lower-left stock origin and Y-up coordinates. Curves are flattened at **0.02 mm tolerance** on the existing 0.0001 mm coordinate grid. Overlapping filled shapes are normalized and counters remain separate contours. There is no stock perimeter or photograph in the cutting geometry. Small artwork remains exportable even when a default cutter cannot fit it.

Extremely small contours can fall below that export tolerance and will be rejected explicitly. Enlarge the detail before preparing the package. The independent review observed this with an entire fish graphic only 0.1 mm across; normal sign-scale graphics passed.

**Check size on import:** the artwork’s bounding box can be smaller than the requested blank. Set the CAM job’s stock dimensions from the brief; do not resize the artwork’s bounding box to the full blank. Confirm the location, scale, orientation and holes before calculating toolpaths. SVG carries a physical-size canvas; DXF carries the artwork coordinates and units.

No single runnable CNC program is correct for every controller, tool, work origin and machine setup. Ike must choose the material, tool, operation, cut depth, feeds, spindle, clearance and machine-specific post in CAM. The separate Carvewright machining workspace retains its existing **ShopBot OpenSBP, GRBL 1.1 and LinuxCNC** posts in inch and millimeter variants. Those are six specific exporters, not universal G-code. No unverified machine program is automatically placed in the customer package.

## Verification and remaining acceptance

`SHOPCRAFT_EVIDENCE.json` records the completed software checks and exact scope. Verification uses real browser Canvas, IndexedDB, native file downloads and the production modules in isolated Chromium, with provider networking intercepted locally. The DXF is independently parsed and checked against source outlines. The package is independently extracted with CRC and SHA checks. The original revision-4 sign and its existing ShopBot preview are regression checked.

This build still needs the user’s native iPad Safari test, the real provider attachment/inbox test, and import into Ike’s actual CAM software. A successful software test is not physical machine acceptance.

## Primary references

Checked during this build. Provider accounts, software versions and machine posts can differ.

- [Web3Forms file attachments](https://docs.web3forms.com/getting-started/pro-features/file-attachments)
- [Vectric VCarve Pro user guide](https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/page/user-guide/index.html)
- [Vectric Aspire user guide](https://docs.vectric.com/docs/V12.5/Aspire/ENU/Help/page/user-guide/index.html)
- [Vectric save toolpaths and machine post](https://docs.vectric.com/docs/V12.5/VCarvePro/ENU/Help/form/Save%20Toolpaths/index.html)
- [Carbide Create SVG/DXF import](https://carbide3d.com/carbidecreate/)
- [Easel supported imports and DXF requirements](https://support.easel.com/hc/en-us/articles/360056766513-Can-I-import-files-from-another-program)
- [Fusion SVG insertion](https://help.autodesk.com/cloudhelp/ENU/Fusion-Model/files/SLD-INS-SVG.htm)
- [Fusion DXF insertion](https://help.autodesk.com/view/fusion360/ENU/?contextId=DESIGN-INSERT-INSERT-DXF-CMD)
- [Fusion machine post selection](https://help.autodesk.com/cloudhelp/ENU/Fusion-CAM/files/MFG-REF-NC-PROGRAM-POST-SELECTION.htm)
