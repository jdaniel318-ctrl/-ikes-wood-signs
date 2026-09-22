# Dark Sky Changelog

## 8.8.17.8 — Deep Hold

- Moved Fleet Ledger primary storage to IndexedDB with integrity checks and exact read-back verification.
- Migrates the legacy local-storage ledger only after merging by entry ID; removes only the verified source ledger key afterward.
- Preserves every project, customer, order, identity, authority, and bookkeeping record during storage recovery.
- Resets only transient queue, detail, and unsaved form state on Safari page restore.
- Reorganized the To Check queue and Professional Captain's Quarters for clearer iPad operation.
- Preserved Check-first payment tracking with ACH and other traceable digital methods ready for fleet growth.

## 8.8.17.7 — Clear the Deck

- Made **To Check** tappable and exposed each transaction's exact attention reasons.
- Added append-only resolution and correction records; originals remain intact and totals count only the latest revision once.
- Added Check-first payment classification with ACH, cards, digital wallets, cash, bank transfer, and other trackable methods.
- Allowed safe check, receipt, and payment confirmation references while forbidding payment credentials.
- Exported payment method and correction lineage in the accountant CSV.
- Added a durable **Already saved once** result for rapid repeat taps.
- Preserved all Ledger Truth, Clear Entry, Storage Bearing, authority, and iPad touch protections.

## 8.8.17.6 — Ledger Truth

- Changed **To Check** from a sum of warning reasons to a count of distinct transactions needing attention.
- Kept the unreviewed and missing-receipt reason totals visible without double-counting a transaction.
- Added per-form submission IDs, an in-flight save latch, duplicate-ID rejection, and exact single-row read-back verification.
- Added explicit validation for book, positive amount, description, and transaction date before a write begins.
- Resynchronized the iPad ledger compositor after viewport, orientation, focus, and keyboard geometry changes.
- Rejects a stale Safari touch target and asks for one clean retry instead of activating the wrong control.
- Preserved Clear Entry amount readability, Storage Bearing quota recovery, authority boundaries, and all existing ledger records.

## 8.8.17.4 — Storage Bearing

- Made Simple Books writes explicit, synchronous, and read-back verified before success is shown.
- Added one safe automatic retry after compacting duplicate authority-audit evidence.
- Preserved duplicate occurrence counts and first/latest timestamps after compaction.
- Kept project, customer, order, identity, and bookkeeping records outside automatic cleanup scope.
- Kept form values intact and displayed a durable **Not saved** message when capacity recovery cannot complete the write.
- Applied the same guarded write path to accounting-method changes.

## 8.8.17.3 — Clear Authority

- Kept fleet bookkeeping to Money In, Money Out, and Move Money.
- Blocked Admiral entries until Fleet Core verifies dedicated Admiral authority.
- Prevented Engine Room users from silently labeling records as owner actions.
- Added authority status, source, and verification time to retained records and accountant CSV exports.
- Corrected local transaction dates so they follow the operator device instead of UTC.
- Preserved the existing browser-book storage key and all prior records.

## 8.8.17.2 — Simple Books

- Replaced the accountant-first entry form with Money In, Money Out, and Move Money.
- Reduced the normal record to five understandable inputs while retaining optional accountant detail.
- Preserved isolated per-entity books, append-only corrections, Captain/Admiral authority labels, and CSV export.
- Rebuilt the Captain and Admiral ledger launcher as a compact naval command card.
- Kept all 8.8.17.1 records and storage compatible.

## 8.8.17.1 — Ledger Integrity

- Added isolated, append-only tax books for every fleet member, Captain Operations, Admiral Operations, and Bootstrap Build.
- Added tax-year and accounting-method controls, evidence and review status, summaries, and accountant CSV export.
- Stopped unchanged commissioning from writing the same audit event on every boot.
- Collapsed retained duplicate evidence and paginated the authority audit without deleting history.
- Packaged an RLS-governed Supabase reference migration; the static release does not claim it is applied.

## 8.8.17 — Admiral Commission

### Added

- Made the same-person Captain + Admiral assignment an explicit dual-office commission.
- Added a navigable Authority Ledger to Captain Record and Admiral Govern.
- Kept Captain browser evidence and server-attested Admiral audit rows visibly distinct.
- Added office filters, target/action/detail search, refresh, and authority/result context.
- Packaged the authenticated `admiral_read_authority_ledger` Fleet Core RPC.
- Added explicit ownership and operating models to Commissioning Orders.
- Made Bootstrap Build default to an Admiral-owned, fleet-operated Admiral program.

### Preserved

- No silent Captain-to-Admiral elevation.
- Fresh Admiral authentication and active server authority remain mandatory.
- New commissions are not live and create no individual owner membership or entitlements.
- My Fleet remains read-only and all six independent vessel boundaries remain exact.

### Deployment boundary

- The new Fleet Core RPC is packaged as migration/reference SQL and is not claimed as applied by the static release.

## 8.8.16.1 — Clear Watch

### Corrected

- Removed the second sticky layer from the My Fleet search and filter panel.
- Prevented the filter panel from covering vessel cards while scrolling on iPad landscape.
- Preserved the sticky authenticated Fleet header and all existing read-only controls.

### Change boundary

- CSS and release identity only.
- No Supabase schema, RPC, RLS, membership, report, vessel data, or authority behavior changed.

## 8.8.16 — Cleanup Keel

### Preserved

- Proven Legacy Plumbing Owner → Supabase → Admiral report path
- Exact-project isolation and independent owner authority
- Fresh Admiral authentication on every document load
- Read-only My Fleet observation
- Bootstrap Build as a separate Admiral program
- Atomic release verification and recovery behavior

### Consolidated

- Added one shared browser-safe Supabase session/auth/RPC transport.
- Owner Auth and the primary Admiral identity controller use the shared transport.
- Reduced deployed documentation to the current README, architecture contract, acceptance checklist, and this changelog.
- Removed eight superseded historical narrative files from the deployable package; the prior 8.8.15.9 package remains unchanged as the archive.

### Corrected

- Replaced the misleading zero-attention posture with a computed Action Queue.
- Presented `fleet_seeded` as Owner Unassigned.
- Added counts to My Fleet filters.
- Clarified that a passage PIN is not identity or server authority.
- Reduced My Fleet and Owner Control Center vertical overhead on iPad.

### Security posture

- No service-role key is present in the browser runtime.
- No new database migration is introduced or applied by this release; the pre-existing commissioning SQL remains packaged as reference material.
- Existing exact-vessel owner reporting RPCs are unchanged.
- Existing RLS and server authority checks remain the source of truth.
- The public `SECURITY DEFINER` RPC inventory remains a separately gated database-hardening task; it is not changed blindly by this browser cleanup.
