# Keephaven 8.8.20.89

This release adds an explicit way to preserve the three older Ike storage entries in an on-device archive, then free their LocalStorage space. It addresses the device's quota failure without deleting differing orders or unique drafts. The archive does not become current work.

## Upload

Use **DarkSky882089-Keephaven-Upload.zip** over the complete **8.8.20.88 Helmward** site. Extract the single folder and upload every file inside to the existing GitHub repository root. Replace matching files and keep all other files. This does not deploy the pending Countercraft backend changes or make customer stations ready.

Confirm the Engine label is **8.8.20.89 · KEEPHAVEN**. Do not clear Safari website data. No archive or source removal runs merely by uploading or opening this build.

## First field round — preserve and verify

1. Open Configure Engine → Storage & Recovery → Prepare older records.
2. Tap Save older records and keep the file in private Files storage. An existing exact saved copy may be selected in the next step instead.
3. Tap Verify saved file and choose that older-records file. Stop at the result; keep the file private.

The earlier in-memory verification does not carry through a page reload. The separate Captain backup covers current orders/settings; neither file is a complete fleet backup.

## Archive after verification

Close other Black Flag tabs before archival or restoration, so another tab cannot change the same older entries during the move. LocalStorage has no cross-tab compare-and-delete transaction.

Tap **3. Archive & free older space** only when you want to move the prepared older entries. This explicitly stores all three entries, including differing or unique content, in `blackFlagOlderIkeArchiveV1`. It waits for the write transaction to commit, reopens the archive, verifies its hashes and exact contents, and rechecks the original entries before removing those same older LocalStorage entries. It never edits current orders/drafts, registry, permissions, admissions or quarantine.

A failed write/read, changed source or ended session stops removal. If removal partially succeeds or cannot be read back, the status reports the confirmed and unconfirmed counts; the archive and your saved file remain. Do not repeatedly tap if a failure is reported. Check the archive and storage result first. Freeing these entries does not by itself certify every previously failed fleet write.

## Find, save or restore an archive

Under **Archived older records**, tap Check archived records. This works after reload and does not create a database when no archive exists. Select Prepare download, then Save archived file. Files are plaintext private business data; keep them out of GitHub and chat.

**Restore older entries** first requires a readable, completed legacy migration marker. If that cannot be proved, restore is held and archive download stays available, so the old startup import cannot promote the restored entries into current work. Restore fills only absent original legacy keys and never overwrites any existing legacy value. It uses LocalStorage space again and may stop if that quota is full. It retains the archive even on success. This restores the older storage entries, not an order into current work or a complete fleet backup. No upload/import of arbitrary archive files is provided.

The general rescue export includes the two known older draft keys while they remain in LocalStorage. The archive database is explicitly excluded from that redacted export, because its exact opaque strings require the dedicated archive download. The general rescue's existing size cap and partial-capture limitations remain.

## Verification and rollback limits

All 34 offline suites passed. Controlled native IndexedDB browser checks used synthetic fixtures on an HTTP preview with a fixed-fixture hash adapter; production SHA-256 was tested with Node WebCrypto. The browser download event timed out, so saved download bytes are not independently confirmed here. Full check details are recorded in KEEPHAVEN_EVIDENCE.json. Native iPad Safari and the user's records remain field checks; no customer data was used in test fixtures. No production database was changed by the build process.

The FullBackup ZIP is complete application source, not business data. The rollback ZIP restores Helmward software only and does not move archived records back. Helmward cannot display the new archive panel. Before software rollback after archival, save the archive file and retain this build for access; restoration may fail if LocalStorage is still full. Never clear website data to apply or roll back this release.
