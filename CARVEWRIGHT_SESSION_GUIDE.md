# Carvewright 8.8.20.56

## Session repair in this release

The earlier fleet workspace treated a normal five-second session-status notification as a close command. This release checks whether the actual authorized workspace is still valid before responding to that notification. Normal status updates, a routine authority recheck and returning focus to the same valid session keep the current design open.

Trusted interaction inside Carvewright’s job workspace and design studio now reaches the existing session activity tracker. The application’s existing 15-minute idle limit and 60-minute maximum sign-in window remain in force. A background status tick, synthetic event or unrelated page interaction does not extend those limits. Signing out, locking the secure workspace, losing authority or changing the signed-in context still closes the private workspace.

The current repair is verified against the real bundled session manager and timer, with isolated synthetic server responses. It does not change Supabase settings or server policy. Earlier releases and their evidence remain historical records.

## An independent design workspace for the fleet

Carvewright has its own home, jobs, design studio and artwork handoff. Open it directly from the Engine, Admiral command or the Carvewright service card in My Fleet. Quotes & invoices is no longer its entrance or its owner.

The application can support work requested by Ike’s Wood Signs, HouseHull or another business. A requesting-business label and source reference describe the job; they do not grant access to that business’s customer records or finances. The service card honestly says **Registration pending**. This downloadable release does not claim live canonical commissioning or add a confirmed vessel to the protected fleet count.

## Start in three steps

1. Open **Carvewright**, then choose **New design** or **Open sample sign**.
2. Enter the design name, requesting business and source reference. Open **Design studio** to set the wording and physical dimensions. Review the layout and save it.
3. Choose **Handoff**, select the saved reviewed job and choose **Prepare files**. Click the visible SVG and/or editable-job download links. Deliver the files yourself through the appropriate business workflow.

Preparing files does not send them, accept a customer order, create a quote or invoice, reserve a schedule or mark the work delivered.

## Open the standalone copy

Extract `DarkSky882056-Carvewright-Standalone.zip`, keep its twelve files together, and open **carvewright.html** in your browser. It is a complete local design workspace without a sign-in or web server. The supplied reference sign is an unsaved sample; it becomes a job only when you save it.

The standalone workspace is separate from the authenticated fleet workspace. Browser/profile, site or folder changes can affect local storage. Download editable JSON copies for designs you want to keep or move. No cross-device synchronization is included.

If browser storage is unavailable, the application reports that saved jobs are unavailable. You can still create a valid layout in the studio and prepare a portable editable job or SVG. A failed local save is not reported as successful.

## Install the fleet update

The cumulative Upload ZIP supports complete **8.8.20.53 Quartermaster**, **8.8.20.54 Carvewright** or **8.8.20.55 Carvewright**. Extract it and upload all files inside its single matching folder to the same repository location as the current `index.html`, replacing matching filenames and retaining the other existing files. Use the exact current ZIP named at the top of `UPLOAD_THIS_ONE_BUILD.md`.

The update uses the existing Admiral sign-in and authority check for the integrated workspace. If My Fleet is open, its normal Close action runs before the Admiral gate appears. Canceling sign-in cancels the Carvewright request. Closing Quotes & invoices or selecting a different accounting business does not close Carvewright. Closing the Admiral workspace, ending the session or changing the authenticated context closes its private design surfaces.

There are no SQL or database-reset steps. Existing quote, invoice, catalog and earlier design records are retained. The local design store is separate from financial data.

## Workspace sections

| Section | What it provides |
|---|---|
| Home | Actual saved-job and reviewed-layout counts, recent work, a reference sign and direct design actions. |
| Jobs | Search by title, requesting business, source reference or wording. Filter reviewed layouts or drafts. Open a saved revision. |
| Job details | Design name, requesting business, source job/order reference, requested output and notes. |
| Design studio | Vector lettering, physical blank size, margins, alignment, spacing, position, preview, local layout review and revisioned saves. |
| Bring a design | Import a current Carvewright JSON or an earlier Ike Carve Studio JSON; explicitly find and copy a selected earlier locally saved design. |
| Handoff | Prepare the requested files from one saved, reviewed revision; filenames include that revision. |

Changing the wording, dimensions, appearance or job details resets layout review. The marker means the current layout was reviewed locally; it is not a customer approval or machine release.

## Lettering and physical layout

Studio Sans Bold and Studio Serif Bold are bundled public reference lettering. They use real vector paths and are not claimed to be Ike’s approved A/B/C alphabets. Uppercase/lowercase, spaces and explicit line breaks are retained. Unsupported characters are reported rather than substituted with another font.

Enter the blank width, height, thickness and margins in inches or millimeters. The preview and SVG use the same physical path geometry. Lettering size is a percentage of available layout space, rather than a fixed letter height. Spacing, alignment and offsets remain editable. Zero or invalid dimensions, unsupported characters and lettering outside the permitted blank area block review and export. A blank draft can be saved; add valid lettering before preparing an artwork file.

The wood preview is illustrative. It does not measure or identify the material. Exported SVG contains the lettering paths, physical millimeter dimensions and design metadata; decorative wood, guides, rulers and the preview border are excluded.

## Save and reopen work

**Save job details** and the studio’s **Save design** create a new local revision. Jobs reopen from the same account/backend/environment/site/Carvewright scope. A save conflict reports that another revision exists and keeps the unsaved edits available. Download the current editable job before discarding conflicting edits, then reopen the current saved job.

Local saves are not cloud backups. Keep portable JSON copies before clearing browser data, moving between folders/devices or changing profiles. The complete release ZIP contains software, not your browser’s private saved jobs.

## Bring earlier work forward

There are two explicit paths:

- **Open a job file:** select an earlier Ike Carve Studio JSON or a current Carvewright JSON. Geometry and source integrity are checked. The result is a new, unreviewed Carvewright copy with its original design identity/revision recorded as provenance. Saving it does not overwrite the source design.
- **Find earlier designs:** look in the earlier Ike store in this exact browser/account/backend/environment/site scope. Choose one saved design to copy. Original records stay in their earlier workspace; no automatic bulk migration occurs.

If no earlier records appear because you moved to a different folder, browser or account, open the earlier studio where they were saved, download its editable JSON and bring that file into Carvewright. Files from the game or accounting backup are different formats. This release does not import arbitrary SVG, DXF, `.crv` files or photographs.

## Prepare an artwork handoff

In the studio, check the wording and dimensions, choose **Mark layout reviewed**, and save. Under **Handoff**, choose that saved layout. **Prepare files** rechecks the saved revision and its review before generating the requested SVG, editable JSON or both.

The visible native links let the browser download or open the files. Navigating away or losing the session invalidates prepared links. The JSON retains the job brief, requesting-business reference, design origin, font identity and exact generated geometry. Importing it elsewhere creates a separate unreviewed copy.

## What comes next

This release establishes the independent design and artwork-handoff application. Cutter/material libraries, part-number relationships, CAM calculations, cutting-depth validation, toolpath preview, material-removal simulation, machine-specific output and live ScheduleJoe/financial handoffs are later stages. No machine instructions are produced by this release.

The bundled lettering license is `carve_font_license.txt`. `CARVEWRIGHT_FLEET_SOURCES.md` lists public references and the retained geometry provenance. Release verification uses isolated Chromium with real local browser storage and synthetic authority. Native Firefox, iPad Safari, installed VCarve compatibility, canonical commissioning and physical machining are not claimed as accepted.
