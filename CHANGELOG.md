# Changelog

## 4.4.3 — Canonical Experience Identity Resolver
- Fixed Test Experience failing on Grizzly Bear with `could not resolve Project ID grizzly-bear`.
- Project lookup now canonicalizes both the requested identity and every current fleet row instead of relying on one strict in-memory equality check.
- Experience Test Deck resolution now verifies the project through memory, the canonical IndexedDB `projects` store, the compatibility settings mirror, and the verified registry backup — always by immutable/canonical Project ID, never by business name.
- A project recovered from a durable registry source is rehydrated into the active fleet collection before Preview / Sea Trial / Live opens, preventing a stale in-memory fleet from stranding the Test Deck.
- Failure diagnostics now report the requested identity, canonical identity, and registry sources searched instead of a silent/dead command.
- Preserved the full v4 hull, Grizzle→Grizzly alias migration, finger-swipe fleet rail, filters, outlined project controls, and no-write Preview / marked-data Sea Trial contracts.
