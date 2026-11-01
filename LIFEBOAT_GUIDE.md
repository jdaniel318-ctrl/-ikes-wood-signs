# Lifeboat 8.8.20.79

Repairs the inactive Captain backup button after interrupted startup. The backup listener now binds before database migrations, using the same existing Engine authentication. A separate status region avoids the hull report replacing download feedback. Concurrent taps are ignored while preparation runs. A failed primary order read produces an error instead of silently falling back to local order metadata. If the database connection is stale, backup can reopen the existing database without diagnostic writes or a schema upgrade. An unresponsive read ends after 20 seconds and cannot publish a late download.

This release does not delete records, free space, clear warnings, rerun failed migrations, or certify recovery. Captain backup remains the existing version-3 merged orders and settings format; projects, quarantine, admissions and other local-only stores are not a complete part of this export. Keep Safari data intact. Do not use cleanup until the largest LocalStorage keys have been inspected.

## iPad check

1. Upload the contents of Upload to the existing repository, preserving paths and replacing matching files. Wait for Pages and confirm 8.8.20.79 · LIFEBOAT.
2. Open Configure Engine → Storage & Recovery → Export Captain's Backup. A dedicated status should immediately show preparation, readiness, or an error.
3. Tap Download Captain's Backup, save to Files, then send the status screenshot. After saving, Open Storage Breakdown → Largest LocalStorage keys is the next diagnostic.

No native iPad storage is accessible from the development workspace. Offline tests use synthetic records; the actual iPad export must be confirmed on that device. Full source backup in the delivery ZIP is software only, not a backup of customer data.
