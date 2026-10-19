# Strongbox 8.8.20.37 TEST — start here

## Install only over Headway 8.8.20.36
Use the small `DarkSky882037-Strongbox-Upload40-TEST.zip` whose actual file count is in the final package proof. Extract it and upload every file INSIDE its single matching folder to the existing repository root. Keep the existing files that are not in the update. Commit after every selected filename finishes uploading. Do not upload the ZIP itself, add the outer folder to the repository, or delete existing files. The full snapshot is recovery material, not one upload batch.

## Three focused field steps
1. Upload the small update; after deployment refresh the existing owner tab once. Confirm **STRONGBOX TEST · 8.8.20.37**. Use the existing owner account only when asked. Do not reset its password.
2. Open Orders, then **Protect this business’s saved orders**. Tap **EXPORT FULL ORDER BACKUP** once. Expect `Backup prepared: 26 records` for the user's last known 26-row store, assuming no intentional intervening changes. Confirm the JSON file exists in Files/Downloads. The archive covers all loaded business records, not just six visible rows or 25 active records. Its legacy-values report lists any special values preserved unchanged.
3. Tap **CHECK A BACKUP IN ISOLATION**, choose the just-downloaded JSON, and send the resulting status screenshot. Expect `Isolated restore comparison passed: 26 records`. Missing historical images remain missing and are reported. This rehearses only in memory; it does not import into the original database.

Keep the JSON private: it contains customer information and images. Never upload it to GitHub. Do not share a password, token, sign-in link, or raw customer backup for this test.

If an error or unexpected count appears, stop at that message. Do not edit prices to force a pass, delete records, clear Safari website data, use Local Recovery, or repeatedly attempt an operation. Do not run SQL, migrations, commissioning, or appointment changes. No extra plugin or new service permission is required.

Strongbox supports old finite v1 archives. New special-value v2 archives require Strongbox or a compatible reader; older Headway does not understand their tagged representation. Neither format is a business-data cloud backup or an approved production database restore.

## Recovery
Retain the full Headway .36 source archive and the private order backup. Rolling application files back to .36 reintroduces the reported nonfinite export failure and does not undo or repair business data. Never restore over the original database merely to test a file. Obtain a separate, scoped plan before any actual data import or migration.
