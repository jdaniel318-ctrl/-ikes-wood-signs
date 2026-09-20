# Dark Sky 8.8.17 — Admiral Commission

Admiral Commission makes the Captain + Admiral dual-office assignment official while preserving the authority boundary between the two offices. It adds a navigable Authority Ledger and expands Commissioning Orders so an authenticated Admiral can deliberately commission an Admiral-owned program such as Bootstrap Build.

## What changed

- Captain and Admiral may be held by the same person.
- Every action still declares an active office; Captain access never silently elevates to Admiral authority.
- The Authority Ledger opens from Captain **Record** and Admiral **Govern**.
- Captain rows are labeled **Browser Evidence**; Admiral rows are labeled **Server Attested** only after Fleet Core verifies the dedicated Admiral identity.
- The ledger supports office filters, cross-field search, refresh, exact targets, authority source, outcome, intent/detail, and up to 200 server rows.
- Commissioning Orders now expose mission class, ownership model, and operating model instead of hard-coding every commission as fleet-unassigned.
- Bootstrap Build defaults to `admiral_program`, `admiral_owned`, and `fleet_operated`.
- An Admiral-owned commission creates no individual project-owner membership, no entitlement, and no live publication.

## Authority contract

| Office | Authority source | Ledger evidence | Scope |
|---|---|---|---|
| Captain | Captain command surface | Browser evidence | Operational command and retained decisions |
| Admiral | Supabase identity plus active global Admiral grant | Server-attested `fleet_authority_audit` | Fleet governance and explicit commissioning |

The passage PIN opens a local doorway; it grants no server authority. Passwords remain handled by Supabase Auth. Every modifying Admiral command remains previewed, authenticated, exact-scope, reasoned, audited, and verified by readback.

## Bootstrap Build

Bootstrap Build remains a separate Admiral program outside the six independent Fleet Core businesses until the Admiral issues a real commissioning order. The packaged SQL extends Fleet Core with `admiral_read_authority_ledger`; it is reference migration material and is not claimed as applied by this static release.

## Deployment

Upload the contents of the release folder to the GitHub Pages repository root. Do not nest the folder itself inside the deployed site.

The page, manifest, release seal, inventory, service worker, and application runtime must all report build `8.8.17` and seal `admiral-commission-8817`.

See `CURRENT_ARCHITECTURE.md` for authority/data boundaries, `REGISTRY_LEDGER_MODEL.json` for the ledger contract, and `RELEASE_ACCEPTANCE.md` for release proof.
