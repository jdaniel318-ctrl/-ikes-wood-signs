# Dark Sky 8.8.17.4 — Storage Bearing

Storage Bearing makes daily fleet recordkeeping dependable under browser storage pressure. A save is reported only after the exact ledger payload is written and read back.

## What changed

- Captain saves now survive the proven duplicate-audit storage pressure by safely compacting duplicate browser audit evidence and retrying once.
- The new ledger record must pass exact local read-back before the form clears or the totals change.
- A failed save leaves every field intact and states plainly that no ledger record was created.
- Automatic recovery touches only the derived authority-audit key; project, customer, order, identity, and book records are never cleared.
- Collapsed audit rows retain their original occurrence count plus first and latest timestamps.
- Captain and Admiral may be held by the same person, but every action still declares an active office.
- Admiral book entries are saved only after Fleet Core verifies a dedicated Admiral identity.
- Accountant CSV exports include authority status, source, and verification time.
- The Fleet Ledger opens from Captain **Record** and Admiral **Govern** through a compact command card.
- Daily recording begins with three plain choices: **Money In**, **Money Out**, or **Move Money**.
- The normal path asks only for the book, amount, counterparty, purpose, and optional receipt or invoice reference.
- Tax year, accounting method, category, acting office, and review status remain under **Accountant Tools** and **More Details**.
- Existing Ledger Integrity browser records remain readable because the durable storage key and schema are unchanged.
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

The page, manifest, release seal, inventory, service worker, and application runtime must all report build `8.8.17.4` and seal `storage-bearing-88174`.

See `CURRENT_ARCHITECTURE.md` for authority/data boundaries, `REGISTRY_LEDGER_MODEL.json` for the ledger contract, and `RELEASE_ACCEPTANCE.md` for release proof.
