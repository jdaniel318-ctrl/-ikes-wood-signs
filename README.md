# Dark Sky v4.4.6 — Primary DB Readiness Gate


This build keeps the complete v4 hull and repairs the identity boundary between Project Command and the Experience Test Deck.

Key contracts:
- Canonical V4 project registry + admission ledger + fleet manifest
- Grizzle/Grizzly legacy alias migration sealed to canonical `grizzly-bear`
- V4 baseline fleet reconciliation restores the known Grizzly vessel when a stale three-project registry is encountered
- Filter first, then native finger-swipe horizontal fleet rail
- Outlined Control Center and Test Experience actions
- Native Experience Test Deck: Preview / Sea Trial / Live
- Preview writes no operational records; Sea Trial writes project-scoped marked test records
- Full source files, no service-worker source injection
Experience identity contract:
- Engine project cards pass the vessel identity into one canonical resolver.
- The resolver matches immutable/canonical Project ID across memory, canonical IndexedDB, compatibility mirror, and verified registry backup.
- Legacy aliases are migration inputs only; business names are never used to authorize or resolve the Test Deck.
- Durable registry resolution rehydrates the active fleet row before Preview / Sea Trial / Live.



## V4.4.5 — Fleet-safe project mutations
Outpost and Experience Test mutations now update only the owning canonical project row. They never clear/rewrite the full fleet registry. Primary IndexedDB operations retry once after a closed/interrupted connection, and Project Command reseals the admitted V4 baseline before rendering so a failed project mutation cannot collapse the fleet to one visible vessel.


## V4.4.6 — Primary DB readiness
Project-scoped mutations now guarantee that the primary IndexedDB connection exists before any transaction starts. Safari connection loss or an uninitialized DB handle triggers one controlled reopen/retry. A project mutation still updates only its owning canonical Project ID and never rewrites the fleet.
