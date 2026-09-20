# Current Architecture and Authority Contract

## Route hierarchy

Dark Sky is the neutral release and route shield. Black Flag is the operating engine. Owner, Captain, and Admiral are separate authority surfaces; opening one surface never silently grants another.

## Credential model

| Layer | Purpose | Authority granted |
|---|---|---|
| Passage PIN | Opens a local protected doorway | None by itself |
| Supabase Auth | Proves the named person and active session | Identity only |
| Fleet membership | Connects one identity to one vessel | Exact-vessel owner scope |
| Global authority | Connects one identity to an Admiral role | Fleet-wide read/governance scope |

Passwords are handled only by Supabase Auth. The public application may use a Supabase publishable key; it must never contain a secret or service-role key.

## Supabase contract

- `fleet_vessels` is the canonical vessel registry.
- `fleet_memberships` grants exact-vessel membership after identity exists.
- `fleet_global_authorities` grants server-side Admiral authority.
- `fleet_business_settings` is project-scoped business configuration.
- `fleet_observability_reports` stores the narrow owner-published operational heartbeat.
- Owner reporting is performed through authenticated RPCs that verify `auth.uid()` and exact project membership.
- Admiral observation is read-only and must not expose modifying controls.

RLS remains enabled for every public table. Tables intentionally accessible only through vetted functions require explicit documentation, least-privilege grants, fixed function search paths, and advisor review.

## Fleet readiness vocabulary

| State | Meaning |
|---|---|
| Registry seeded | Permanent vessel identity exists |
| Owner unassigned | No real outside owner membership exists |
| Owner ready | A real identity and exact-vessel owner membership both exist |
| Never reported | No vessel heartbeat has been published |
| Fresh | Latest verified heartbeat is within the freshness window |
| Stale | A heartbeat exists but is older than the freshness window |
| Action queue | Never reported, stale, unresolved issues, hold, or blocked |

“Owner unassigned” must never be converted to an invented user or membership.

## Release and storage contract

- Atomic loader verifies all executable runtime files before execution.
- Service worker is an identity sentinel only and has no fetch handler.
- A mixed build or seal mismatch blocks first paint and opens explicit recovery.
- `sessionStorage` may retain the active browser session; passwords are never stored there.
- IndexedDB remains the durable browser-local application store where a server source has not yet replaced it.
- Legacy localStorage mirrors are compatibility-only and may not override server truth.
