# Owner Bridge Contract — 8.0.1

Owner / Partner authority is a standalone project-scoped surface.

- Fleet Dock routes Owner / Partner actions directly to `owner.html?project=<immutable-id>`.
- `owner.html` opens the canonical Dark Sky IndexedDB directly and does not boot the Black Flag Engine application.
- Owner session state uses the project-scoped owner session namespace and survives refresh within the same tab.
- Owner login and Control Center never require or grant Black Flag Engine credentials.
- Owner data reads and writes are filtered to the requested immutable Project ID.
- If owner storage cannot open, the owner surface fails safe in-place; it does not paint another project or authority.
- Returning to Black Flag is an explicit testing/Captain action only when the route originated from Engine.
