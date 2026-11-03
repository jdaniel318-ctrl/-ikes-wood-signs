# Keephaven independent review
Fresh read-only review by a separate agent. Initial assessment: request changes; no critical findings, two important findings and one minor cancellation regression.

## Findings and response
1. Restore could trigger old startup migration if the completion marker was absent. Fixed: Engine restore now reads canonical settings in recovery/read-only mode and requires exactly one platformMigration:v3.7 marker with complete === true. Missing, malformed, unavailable or incomplete state blocks restoration. Downloads remain available. Regression RED then GREEN.
2. One invalid snapshot hid all good archives. Fixed: independent validation yields verified rows plus a visible held-row warning. Invalid snapshots have no action controls. Regression RED then GREEN.
3. Lock during old-copy cleanup nulled state before the old catch dereferenced it. Regraded Important because the new reset introduced failed cancellation in a recovery flow. Fixed: null-safe catch and no stale status after lock/navigation. Regression RED then GREEN.

## Boundaries considered
Native Safari remains pending. Controlled Chromium storage and layouts use synthetic fixtures; the HTTP-only preview has a known-fixture digest adapter, while production SHA-256 runs in Node WebCrypto tests. Transaction completion/readback does not promise persistence across eviction or power loss; keep the external saved file. LocalStorage does not provide a cross-tab compare-and-delete transaction: close other Black Flag tabs during archival/restoration. Existing unrelated startup migration/compaction and credential repair are outside this repair; new restore is gated to prevent reactivating legacy import. Packaging proof is produced separately by BUILD_RELEASE.py.
