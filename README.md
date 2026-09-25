# Dark Sky 8.8.17.10 — Ledger Recovery Keel

Ledger Recovery Keel hardens the Fleet Ledger migration after the first durable-storage cutover did not surface the two earlier $1 field-test records.

## What changed

- Runs a recovery sweep before declaring the browser ledger migrated.
- Reads the current durable IndexedDB book plus every same-origin localStorage/sessionStorage key whose name indicates ledger, book, account, tax, transaction, money, or finance data.
- Uses the IndexedDB database catalog when available to inspect earlier ledger-like databases without inventing or opening guessed databases.
- Accepts only records that match the real ledger shape: entity, transaction date, entry type, positive amount, and description.
- Requires the recovered entity to resolve to a current canonical fleet, office, or Admiral-program key so a foreign browser record cannot cross into this ledger.
- Preserves distinct transactions by stable `entry_id`; two genuine $1 records remain two records even when their visible fields are similar.
- Merges genuine legacy records into `darkSkyDurableLedgerV1`, writes the complete book, reads it back, and verifies a deterministic whole-ledger proof.
- Writes the migration receipt only after the durable read-back passes.
- Locks transaction and correction writes until durable recovery is verified; a failed migration cannot silently accept new bookkeeping.
- Does **not** delete earlier ledger source storage during recovery.
- Writes a separate verified recovery mirror when localStorage capacity permits.
- If no earlier records can be found, the UI says so explicitly and creates no replacement or synthetic transaction.

## Field-test target

The expected result on the test iPad is the recovery of the two earlier $1 Money In records, producing **$2.00 Money In**, if those genuine records still exist anywhere in same-origin browser storage. If the browser has already deleted every copy, this build will report that no recoverable source exists rather than fabricating $2.00.

## Authority and fleet boundaries

Captain and Admiral remain explicit offices. Admiral server evidence still requires authenticated Fleet Core authority. Project isolation, owner boundaries, Bootstrap Build's separate Admiral-program status, preview safety, and the six Fleet Core vessel identities are unchanged.

## Deployment

Upload the contents of the release folder to the GitHub Pages repository root. Do not nest the release folder inside the deployed site.

The page, manifest, release seal, inventory, service worker, and application runtime must all report build `8.8.17.10` and seal `ledger-recovery-keel-881710`.
