# Dark Sky Changelog

## 8.8.17.10 — Ledger Recovery Keel

- Added an exhaustive same-origin ledger recovery sweep before migration completion.
- Preserves legacy ledger sources instead of deleting them after first merge.
- Rejects ledger-shaped records unless their entity resolves to a current canonical Fleet member, Captain/Admiral office, or Admiral program boundary.
- Merges by stable entry identity so two separate $1 test records remain two records.
- Verifies the entire durable book by deterministic read-back proof, not only by checking that entry IDs exist.
- Writes a recovery receipt only after durable verification succeeds.
- Adds a verified local recovery mirror when browser capacity permits.
- Refuses to fabricate missing transactions when no recoverable browser source exists.
- Keeps the one-record-at-a-time To Check workflow, authority boundaries, project isolation, and prior fleet behavior intact.

## 8.8.17.9 — Clear Orders Repair

- Guides one unresolved ledger record at a time through payment, safe reference, and review status.
- Locks Save until the three required completion facts are ready.
- Verifies every append-only correction before automatically opening the next record.
- Preserves existing browser-book data while moving the primary ledger to IndexedDB.
- Keeps Check first while supporting ACH, cards, digital wallets, bank transfers, cash, and other trackable methods.
- Reorganizes Captain's Quarters into Watch → Decide → Act with a dedicated Record station.

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
