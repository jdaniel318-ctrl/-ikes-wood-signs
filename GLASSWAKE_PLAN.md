# Glasswake 8.8.20.90 — diagnostic update

Approved scope: the Captain requested the proposed diagnostic update. Extend the existing read-only inspector and its Engine report. No repair, storage migration, permissions change, or live commissioning.

## Design
Show project names plus IDs, four boundary checks (registry, local ledger, database mirror, memory), and failing field names without raw values. Missing/unreadable data must not look passed. Show all findings, including informational quarantine, with severity labels. Offer an allowlisted diagnostic JSON download from the same inspection; exclude orders, customer records, credentials and free-text issue details. Keep the new displayed/downloadable report in memory, clear on Engine lock or customer entry, cancel late report results on lock/navigation. Existing convergence caches are outside this cleanup claim.

## Plan
1. Add failing regression checks for hidden detail, per-field failure reasons, incomplete reads, duplicate IDs, and export privacy.
2. Extend fleet_storage_safety.js evaluator preserving existing pass criteria; add allowlisted report projection. Update app.js renderer, download and lock cleanup; responsive styles.css cards.
3. Test real evaluator and extracted UI handlers, including navigation/lock cancellation and HTML escaping. Review the diff; run all release suites and narrow-screen browser QA.
4. Generate coherent .90 identity, package against exact .89 source ZIP, verify upload reconstruction/rollback, save upload/full source/rollback and guide.

Native iPad acceptance remains pending. This update exposes evidence; it does not claim to repair the two stored envelope failures.
