# Freeboard · 8.8.20.94
Install over the complete **Longwatch 8.8.20.93** build.

1. Extract **DarkSky882094-Freeboard-Upload.zip**. Upload every file inside its single folder to the existing repository root. Replace matching files and keep all other files.
2. After Pages finishes building, open the Engine and confirm **8.8.20.94 · FREEBOARD**.
3. Use the three field checks below. Nothing in this package publishes a contractor website, submits a customer request or runs a database migration.

## Three checks on the shop iPad

1. **Contractor entry.** Open Legacy Plumbing’s shared Owner Workspace link in a fresh browser. It should offer the contractor’s own sign-in without an Engine PIN. In a separate tab, open Fleet Compass, scroll to Legacy, then open its workstation. The top navigation should be visible and the dark background should reach the bottom. Enter its private preview and check whether Safari still offers to save the Engine PIN as a password.
2. **Board and camera.** In Ike’s private preview, photograph a plank sitting below the center of the picture. Type “Fleet Test 4”. Check the suggested fit against the actual wood; the editor remains available if the edges are hard to see. Retake once within that same preview. The app can reuse the camera for this retake; canceling, leaving the page in the background, or ending the session releases it. Safari controls whether the next request shows Allow. “Choose a photo” uses an existing picture without starting the in-page camera.
3. **Contact and review.** Save a layout, check its placement, and paste a name and either an email or phone number with leading spaces. The contact should read cleanly. The normal landscape review should show the full photo, sign details, approval and finish button together. Verify that changing the lettering requires checking placement again; changing only contact details requires renewed final approval. Finish the preview and check that the entire “Start another preview” button is available. No request is sent in preview.

## What works without the Engine
Give the contractor their **shared owner link** (for Legacy: `owner.html?project=bf-p-f92f87e8ec44&view=portal` under the installed site). It can start on a browser that has never visited the Engine. Online sign-in still requires an active owner account for that exact business. Records stored only on another device do not appear here. Use Fleet → Test Center for support and private testing.

This update does not turn the private Legacy preview into a public customer website. Separately hosting the customer experience and testing a real request from submission to contractor receipt is the next handoff. Ike’s existing service, SQL and location setup remain prerequisites for live kiosk use.

## What changed for Ike
One photographed board is one sign. New requests no longer ask for a quantity or display a multiplier. Resuming an older draft makes the editable copy a one-board request; old receipts are unchanged. The starting layout uses a suggested region of usable wood when available and leaves room around the lettering. It is a visual estimate, not a board measurement. Saving in Studio returns the exact layout to the request for the customer to check.

## Recovery
The FullBackup is the complete **application source**, not a backup of customer records or photos. To revert the software, extract DarkSky882093-RollbackFrom882094.zip and replace the matching files in the same repository root. The extra Freeboard test and documentation files can remain unused. Do not clear browser storage or restore business data or permissions.
