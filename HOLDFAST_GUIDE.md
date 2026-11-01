# Holdfast · 8.8.20.80

Holdfast gives the Captain a clear path to preserve older Ike records, verify the saved file, and remove only old copies that fully match current storage. It keeps the existing fleet and ship workspaces.

## Install

Extract **Holdfast-Upload.zip**. Open its single **Holdfast** folder and upload every file inside to the existing GitHub repository root, replacing matching files and keeping everything else. The canonical long-named upload ZIP contains the same files.

After GitHub Pages finishes, reopen the Engine and confirm **8.8.20.80 · HOLDFAST**. No Safari data reset is needed. The upload changes application software only; it does not run cleanup or backend migrations.

**Holdfast-FullBackup.zip** is the full application source. It is separate from your business-record backups and is not the upload patch.

## First iPad check — three moves

1. Open **Configure Engine → Storage & Recovery → Prepare older records**.
2. Tap **1. Save older records** and save the JSON file to Files.
3. Tap **2. Verify saved file**, choose that saved JSON, and check the comparison. A successful check says **Saved file verified**. Rows marked **Keep** remain untouched.

Preparing, saving and verifying do not remove anything. For this first device round, stop at the verified comparison. The separate **Remove verified old copies** control performs the cleanup only when you choose it.

## What the comparison means

- **Matched:** every old record, including its photos, proof and stored fields, is present in current storage. The entire old copy must qualify before that storage entry can be removed.
- **Keep:** something is unique, changed, unreadable, quarantined or associated with another ship. It is preserved in the recovery file and kept in browser storage.
- Each older draft is checked separately against the current Ike draft.
- Cleanup repeats the comparison. Changed records, leaving the Engine, unreadable storage or a timeout stop the operation.
- If removal cannot be confirmed, the result states that uncertainty. Keep the verified file and prepare a fresh comparison before another cleanup attempt.

## Backup coverage

Captain’s backup retains its existing orders/settings format, including media stored in those order records. The separate older-records file preserves the exact values of `ikesWoodSignsOrdersBackupV15`, `ikesOrderDraftV2`, and `ikesOrderDraftV2:ikes-wood-signs`, even when a value cannot be parsed.

Neither file is a complete fleet/device backup. The older-records file is an exact preservation archive; this release does not add a restore/import button. Current drafts, project graphics, server data and other stores are not added to Captain’s backup by this repair.

## Validation and next work

Automated checks cover raw preservation, cross-ship holds, media comparison, wrong saved files, changed sources, session changes, quota/read failures, timeouts, downloads and responsive layouts. Native iPad/iPhone Safari acceptance remains pending. Package proof records checksums, ZIP readback, exact patch reconstruction and software rollback.

Next ship focus: Ike’s available shop boards, measured dimensions and species confirmation, a positive customer design flow, and a consistent approved proof for the Carvewright/CNC handoff. Customer-supplied wood remains a future option. Holdfast makes no machining or automatic measurement claim.
