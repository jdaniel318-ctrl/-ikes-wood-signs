# Highwater 8.8.20.75

Highwater keeps quote and invoice controls clear of the iPad keyboard accessory bar. During touch editing, the current step, save state, total, Save and next action move above the form. They stay there through blur so a Save tap can finish. Done editing closes the editing layout without saving. A successful save or step change restores the usual bottom strip.

When a full keyboard leaves very little screen height, the header and global tabs temporarily collapse, leaving room for the field and document controls. Notes remain editable in a compact, internally scrollable field. Done editing restores normal navigation and field height. Desktop typing keeps the bottom strip; pinch zoom keeps native sizing.

## Install over Steadyhelm 8.8.20.74

1. Extract `DarkSky882075-Highwater-Upload.zip` and open its single folder.
2. Upload every file inside to the existing repository root, replacing matching files and keeping all others. Commit the upload and allow the existing deployment to finish.
3. Open the Engine through its usual link. Confirm `8.8.20.75 · HIGHWATER`, then open Quotes & invoices. No clearing Safari data, resetting records or running SQL is needed.

The FullBackup ZIP contains all application source. It does not contain device drafts, Supabase records or customer media. The rollback ZIP restores the prior software files; it does not roll back business records. Newly added release documents/tests can remain unused after rollback.

## Three iPad checks

1. **Edit with the toolbar present.** Open the saved sample quote `HouseHull Steadyhelm review`. In Items & quantities, change vinyl siding from 8 to 9 cartons. The total should be **$6,460.00**. Scroll while the keyboard/password toolbar is showing: the total, Save draft and Done editing should remain visible above the form. If using a full keyboard, also check landscape and tap another field.
2. **Save and reopen.** Restore siding to 8 cartons. Tap Save draft while the field is still focused. Expect **Saved on this device** and **$6,271.00**. Use All documents and reopen the same quote; confirm 8 cartons and the saved project name. Done editing by itself should leave an actual edit marked Unsaved changes.
3. **Check the PDF and return.** Choose Review & PDF, Prepare PDF, then Open PDF in new tab. Confirm the saved name, current document revision and **$6,271.00** total. Switch back to the original workspace tab; the saved quote should still be there. Keep this test copy a draft.

Send screenshots of the editing controls with the toolbar present, the reopened saved quote and the resulting PDF.

## Verification boundary

The new keyboard cases use offline Chromium, native IndexedDB and simulated touch/keyboard geometry. Physical Safari acceptance for Highwater remains pending. Previous Steadyhelm screenshots confirm the save/reopen/PDF flow while exposing the toolbar obstruction; see `STEADYHELM_FIELD_ACCEPTANCE.json`.

Highwater changes Quartermaster presentation and release identity. The document core, PDF renderer, fonts, authentication and authorization code are unchanged. No deployment, database action or customer-record change was performed while building it. The separate fleet governance holds remain unresolved by this UI patch.
