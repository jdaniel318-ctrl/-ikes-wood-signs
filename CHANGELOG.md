# Dark Sky Changelog

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
