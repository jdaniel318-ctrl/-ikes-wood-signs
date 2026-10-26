# Ironhaven 8.8.20.66 — Captain account security and encrypted recovery rehearsal

## Install safely

Extract the `DarkSky882066-Ironhaven-Upload44.zip` and upload **all files inside the single folder** to the current Keelwatch `8.8.20.65` repository root. Replace matching files and keep the other existing files. Do not delete existing files, run SQL or clear Safari data. The separate full backup ZIP is not the update.

## What's new

**Captain account security (even after revoked appointment).** In `My Assigned Vessels`, an authenticated account can expand **Account Security · Set or Change Password**. Password updates are sent **only** to the existing Supabase Auth `/auth/v1/user` endpoint; a confirmed success returns to sign-in so the Captain can verify the new password. The current-password and email reauthentication code fields are optional if the account/provider does not require them. Only the account holder can do this. It does not reappoint a Captain or grant owner/Admiral authority. No password is written to project files, localStorage, cookies or application records.

**Encrypted recovery drill (only while a Captain is appointed to the exact vessel).** The authorized Captain Station offers an expandable recovery tool. The Captain chooses a unique, separate passphrase (minimum 14 characters). On Download, it rechecks exact-vessel authority, fetches the currently scoped **server orders and latest Watch report**, encrypts locally using PBKDF2-SHA256 (310,000 iterations) and AES-256-GCM, rechecks authorization and downloads a file. The raw business data is not placed in the downloaded JSON as readable text. **Verify without Restoring** decrypts a chosen file with its passphrase and checks format, integrity, and exact-vessel scope **without sending any records to a server or changing a database**. Wrong passphrase, corrupted ciphertext, foreign vessel, unsupported format and weakened KDF are rejected.

**Limitations (do not overclaim):** This is a portable, operator-held **partial recovery snapshot**, not a full independent backup, server-side restoration, off-device durable copy, restoration of customer photographs, or Fleetguard certified backup. It includes only server-backed business orders and the latest Watch report that the Captain Station currently exposes. On Safari, normal Download storage and the passphrase are the account holder's responsibility. Prior downloaded data cannot be remotely revoked. Local decryption and checksums confirm integrity and vessel labeling but do **not** independently attest that the file came from the server or that the snapshot is complete. This must not count as a signed commissioning receipt. Production restoration will require a separately reviewed server-side transaction and cross-vessel negative tests.

## Three focused iPad checks

1. Confirm Engine Room shows **8.8.20.66 · IRONHAVEN**.
2. As the signed-in **VoyageKeeper Captain** on **My Assigned Vessels**, expand **Account Security**. Because the old appointment is revoked, the list should stay empty, but setting a password should be possible after email-link authentication. Use a unique password; never send it to Bootstrap. After the server confirms, sign in again to verify. If the provider requests reauthentication, use the email code.
3. For an **accepted** test Captain (no need to reappoint VoyageKeeper merely for this step), open its Captain Station and inspect **Encrypted Recovery Drill**. Download and verify a snapshot. The result must say **READ-ONLY / no restore**. If unavailable, keep the release and report the screen; do not invent a pass.

## Evidence and rollback

- Verification: `node VERIFY_IRONHAVEN_CORE.cjs` plus `node VERIFY_IRONHAVEN_RELEASE.cjs` in a **complete** source folder.
- Identity/appointments and all existing customer records are unchanged by this GitHub-only release.
- The full `.65` source backup remains the rollback baseline. The `.66` backup is source files, **not a Supabase database backup**.
