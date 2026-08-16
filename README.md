# Dark Sky v4.4.2 — Full-Hull Fleet Rebase

This build rebases Dark Sky onto the complete v4.3.8 Fleet Marks hull supplied by the Captain.

Key contracts:
- Canonical V4 project registry + admission ledger + fleet manifest
- Grizzle/Grizzly legacy alias migration sealed to canonical `grizzly-bear`
- V4 baseline fleet reconciliation restores the known Grizzly vessel when a stale three-project registry is encountered
- Filter first, then native finger-swipe horizontal fleet rail
- Outlined Control Center and Test Experience actions
- Native Experience Test Deck: Preview / Sea Trial / Live
- Preview writes no operational records; Sea Trial writes project-scoped marked test records
- Full source files, no service-worker source injection
