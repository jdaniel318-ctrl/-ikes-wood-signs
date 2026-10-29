# Harbor 8.8.20.71 — rescue controls connected

## Purpose and supported baseline
Updates the exact delivered Harbor 8.8.20.70 full-source baseline. This repair addresses two reproduced defects: health viewing invoked write-capable repair, and failed snapshot saves could be reported as successful. It does not identify the current iPad quota-failing key or claim to fix storage capacity. Existing evidence and records must be preserved.

## Corrective change in .71
The .70 rescue controls were omitted from the production delegated click selector. Clicking Prepare therefore never reached its confirmation or capture handler. Four rescue IDs are now admitted by that existing listener. No capture, authorization, privacy filter, quota handling, storage limit, session or server operation is changed.

The prior browser fixture assigned onclick directly, so it did not test production routing. The fixture now binds the actual shipped command listener, with no replacement button wiring. Its storage and digest adapters remain synthetic. A new offline route suite verifies dispatch, cancel, access denial, duplicate-binding protection, download filenames and existing-log navigation. Native Safari acceptance is still required.

## Storage safety retained from .70
- Engine health rendering and Inspect Ship Integrity use direct read-only localStorage/IndexedDB observation. They do not converge envelopes, normalize/delete records, write migration markers, or persist their diagnostics.
- An unavailable/read-incomplete source produces INCOMPLETE / NOT VERIFIED, not zero records or an optimistic pass. A completed observation can still expose real mismatches. Historical migration failure stays labelled FAILED (RECORDED).
- The specific automatic boot convergence and legacy-reference-repair calls are replaced/held for read-only inspection. Other pre-existing startup normalization/admission/persistence behavior was not redesigned. This is NOT a claim that the entire application performs zero startup writes.
- Explicit snapshot creation checks prior history, write success, and exact immediate storage readback. Old snapshot/vault rows are not pruned to make space. A failed save/readback is not certified. V4 recovery-point creation requires both its core snapshot and vault index to be verified.
- Existing quarantined order references remain respected and unmodified. Unreadable quarantine is reported, not silently discarded.
- New local rescue capture is separate from repair. No automatic quota retries, cache deletion, cloud migration, commissioning success or permissions are introduced.

## First native iPad checkpoint — protect before repair
Open Configure Engine. Below Ship Integrity, find **Protect this device's records**.
1. Choose **Prepare Read-only Rescue** and confirm. It reads existing allowlisted local records; it does not upload, write or repair them. A partial result is useful evidence, not a complete backup.
2. Download the **PRIVATE Rescue File** to a private Files location. It is NOT encrypted. Do NOT upload it to GitHub or this chat. Select **Verify Saved Rescue File**, reopen that saved JSON, and read the coverage message.
3. Download **Diagnostic Summary** and share only that small `storage-diagnostic.json` file for investigation. It contains store names/counts/error codes, not the captured records or raw error messages.
No password, new appointment, commissioning, Sea Trial, cleanup, or storage reset is required. Leave Safe Cleanup and Compact Diagnostics alone. Do not repeatedly try local snapshots when a quota refusal occurs.

## Coverage and privacy
Allowlisted data sources: blackFlagPlatformV1; ikesWoodSignsV1; blackFlagGraphicsDB; bootstrapBuildScheduleDB; blackflag-ike-sign-requests-v1; blackflag-carvewright-v1; blackflag-carve-studio-v1; blackflag-carvewright-machining-v1; darkSkyDurableLedgerV1; blackFlagCharterGuardDraftsV1; dark-sky-upper-command-visuals-v1; blackflag-stormwake-voyages-v1. Recognized application localStorage keys are included except known credentials/session/PIN/token values.

Unknown databases, unrelated local keys, sessionStorage, CacheStorage, OPFS, server data and cloud media are NOT captured. Credential-looking keys/fields are omitted. Opaque non-JSON values are omitted and reported. Arbitrary business text can still contain private information; the file is sensitive. Blob/binary values use explicit base64 type records. Dates/maps/sets/typed values are represented explicitly. This is a sequential, non-atomic capture, not a restore format certified against production.

Capture budget: 64 MiB approximate source serialization, 20,000 rows per store, 8-second timeout per database/read transaction/catalog, recursion depth 40. File preparation/verification additionally enforces output-size bounds. Bounds, failures, or unsupported catalogs produce partial status or explicit refusal, not silent completeness. Open of absent IndexedDB is aborted on upgrade; no store is created. Connections are closed. The capture stays in memory and is cleared on Engine lock; no rescue content is automatically transmitted.

A matching SHA-256 validates the bytes of that file, NOT completeness, future durability, provenance against an adversary, business accuracy, restored authority, or successful restoration. A deliberate local reopen verifies an actual selected file. A download request alone is not labelled saved. Reopening after a new page load checks the file's own integrity; comparing to the currently prepared capture is possible only while that capture remains in memory.

## Verification and limits
The selected release suite includes all 17 .70 baseline suites plus the rescue-route regression suite. The existing navigation fixture now includes the real private-capture invalidation helper and an additional lock test; prior navigation assertions remain.
Browser fixtures execute shipped modules and UI using an explicit synthetic asynchronous IndexedDB/localStorage adapter, because browser navigation to file/HTTP/HTTPS test origins is blocked by this environment. Chromium about:blank does not provide native storage or WebCrypto; browser digest calls use a Python SHA-256 fixture. Node tests use actual Node WebCrypto. Do NOT call this native IndexedDB, native Safari, production authentication, physical quota exhaustion, or live database evidence.
No independent reviewer/subagent was available; review is self-review plus executable tests. No live credentials, databases or deployments were used. Native Safari capture/file-readback is pending.

## Remaining boundaries
The existing local commissioning and legacy maintenance actions still exist; they are not invoked by the new inspection. Do not clear their historical failure status without real evidence. Server-backed isolation, revocation, ownership and Captain/Admiral authorization code is unchanged. The legacy snapshot function is a project snapshot, not complete customer/photo backup. Recovery export does not restore anything. Full-source release backup is application source only.
