# Upload Highwater 8.8.20.75

Use `DarkSky882075-Highwater-Upload.zip` over the complete Steadyhelm 8.8.20.74 source.
Extract it, open its single folder, and upload ALL files inside to the existing repository ROOT. Replace matching files, KEEP everything else, and commit the upload.
After the deployment finishes, open the Engine through the usual link and confirm `8.8.20.75 · HIGHWATER`.

This patch moves the document action strip above the form while touch editing and keeps the form usable with a short keyboard viewport. Read `HIGHWATER_GUIDE.md` for the three iPad checks.
Do not clear Safari storage, reset records, run SQL or change permissions. No deployment was performed by the build process.

FullBackup: application source only, not device drafts, database records or customer media.
Rollback: `DarkSky882074-RollbackFrom882075.zip` restores prior software files only. Never restore old permissions or business data. New release documentation/tests can remain unused.

Offline checks do not certify physical Safari behavior or resolve fleet governance holds.
