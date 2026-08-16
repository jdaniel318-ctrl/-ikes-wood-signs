# Dark Sky v4.4.3 — Canonical Experience Identity Resolver

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

