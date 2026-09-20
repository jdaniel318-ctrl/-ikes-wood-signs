# Dark Sky 8.8.16.1 — Clear Watch

Clear Watch is a focused iPad presentation patch for the Dark Sky / Black Flag fleet platform. It preserves the proven Legacy Plumbing Owner → Supabase → Admiral reporting path and the 8.8.16 authority model while correcting the My Fleet scroll layers.

## Surfaces

1. **Customer Experience** — independent, project-branded customer workflow.
2. **Owner / Partner Control Center** — exact-vessel Supabase identity and owner tools.
3. **Black Flag Engine** — project operations, diagnostics, and controlled support.
4. **Captain Command** — operational command kept separate from owner authority.
5. **Admiral** — authenticated fleet observation and preview-before-command governance.

## Non-negotiable boundaries

- Every vessel is independent. Project identity, customers, orders, branding, settings, and owner authority must not cross project IDs.
- A passage PIN opens a local doorway; it does not establish a Supabase identity or grant server authority.
- Owner authority requires an authenticated user and active exact-vessel `project_owner` membership.
- Admiral authority requires an authenticated user and active `admiral` global authority.
- My Fleet is read-only. It must never create an owner, modify a vessel, or substitute registry activity for a missing vessel report.
- Every modifying Admiral command remains exact-vessel, previewed, authenticated, reasoned, and audited.
- Test and private-preview surfaces block real-world phone, email, and messaging actions.
- Dark Sky first paint must resolve to a verified release or an explicit recovery screen; mixed runtime builds may not paint.

## Clear Watch changes

- The My Fleet search and filter panel remains in normal document flow instead of sticking beneath the Fleet header.
- Vessel cards can no longer slide underneath a second floating control layer on iPad landscape.
- The authenticated Fleet header remains sticky so Refresh Watch, Sign Out, and Close stay available.
- No Supabase schema, RPC, RLS, vessel record, membership, report, or authority behavior changed.

## Preserved from 8.8.16

- Added `fleet_supabase.js`, the shared browser-safe Supabase Auth/RPC transport.
- Owner and primary Admiral identity flows now use one session-expiry and refresh contract.
- My Fleet now shows an Action Queue including never-reported, stale, unresolved, held, and blocked vessels.
- `fleet_seeded` is presented as **Owner Unassigned**, making the operational meaning clear without inventing an owner.
- Filter buttons show live counts.
- My Fleet and Owner Control Center retain the 8.8.16 density improvements.
- Default PIN values are no longer displayed as credentials in the normal interface.
- Historical release narratives were removed from the deployed payload. The 8.8.15.9 source package remains the historical archive.

## Current fleet truth

- 6 registered Fleet Core vessels
- 6 server settings rows
- 2 commissioned owner memberships
- 4 owner-unassigned vessels
- Legacy Plumbing and Ike's Wood Signs have proven owner reporting paths
- Bootstrap Build remains a separate Admiral program outside Fleet Core

## Deployment

Upload the contents of this single release folder to the GitHub Pages repository root. Do not nest the folder itself inside the deployed site.

The page, manifest, release seal, inventory, service worker, and application runtime must all report build `8.8.16.1` and seal `clear-watch-88161`.

See `CURRENT_ARCHITECTURE.md` for authority and data contracts and `RELEASE_ACCEPTANCE.md` for the required release proof.
