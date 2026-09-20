# Dark Sky Changelog

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
