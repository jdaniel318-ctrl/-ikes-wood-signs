# Changelog

## 4.5.2 — Functional Visual Polish
- Tightened the Engine Room header after iPad review so it behaves like a working command console rather than a landing-page hero.
- Preserved one deliberate Black Flag primary lockup while reducing unnecessary vertical space.
- Centers content within logical groups instead of forcing the full header into a centered stack.
- Keeps the 4.5.1 spacing, action-button clarity, and platform branding discipline.
- Presentation/cache delivery only; no application logic, navigation, project identity, storage, security, or workflow changes.

# v4.5.0 — Trust Release

- Project Command filters now derive from actual launch state: Current = live; Test / Private = Draft, Preparing, Sea Trial, Fleet Ready; Future = intentionally parked/other future state.
- Search indexes project name, code, immutable Project ID, business type, operating-model summary, and customer relationship.
- Fleet rail reports `Showing X of Y projects` after filtering/search.
- Published/Private is a status indicator; workflow no longer hides behind a checkbox.
- Missing admission metadata preserves canonical project data and marks the vessel for admission review instead of deleting its registry row.
- Four Fleet Marks defaults are migration seeds only, not permanent recovery authority.
- Join Fleet and major project-owned settings use project-local persistence rather than whole-fleet rewrites.
- Structural terminology distinguishes Project Envelope from Storage schema; Engine summary exposes build/storage/contract diagnostics.

## 4.4.7 — Forward-Only IndexedDB Migration
- Bumped the primary Dark Sky database schema to 5 so devices previously upgraded through the 3.9 continuity line are never asked to open a lower schema.
- Added a forward-compatible VersionError fallback: if a future/newer schema already exists, Dark Sky reopens that existing schema without attempting a downgrade and validates the required stores.
- Kept project-local persistence and fleet-safe mutation boundaries from 4.4.5/4.4.6.
- Added required-store validation before any project mutation proceeds.

## 4.4.7 — Primary DB Readiness Gate
- Guarantees a live IndexedDB handle before project-local mutations.
- Reopens and retries once for closed, inactive, or undefined DB transaction failures.
- Adds a descriptive storage readiness guard instead of raw `db.transaction` failures.
- Preserves the v4.4.5 project-local persistence boundary and full fleet integrity.

## 4.4.5 — Fleet-safe Project Mutations
- Replaced deployment/outpost full-fleet saves with immutable Project-ID row updates.
- Added one-time primary IndexedDB reconnect for interrupted/closed Safari database connections.
- Canonical project-row read-back now verifies outpost creation without depending on the compatibility settings mirror.
- Project Command reseals/preserves the admitted V4 fleet before rendering; a failed project-local write cannot collapse the visible fleet to the active project.
- Deployment manifest, lifecycle, launch-offer, customer-test, and Experience Sea Trial evidence now use project-local persistence.

# Changelog

## 4.4.3 — Canonical Experience Identity Resolver
- Fixed Test Experience failing on Grizzly Bear with `could not resolve Project ID grizzly-bear`.
- Project lookup now canonicalizes both the requested identity and every current fleet row instead of relying on one strict in-memory equality check.
- Experience Test Deck resolution now verifies the project through memory, the canonical IndexedDB `projects` store, the compatibility settings mirror, and the verified registry backup — always by immutable/canonical Project ID, never by business name.
- A project recovered from a durable registry source is rehydrated into the active fleet collection before Preview / Sea Trial / Live opens, preventing a stale in-memory fleet from stranding the Test Deck.
- Failure diagnostics now report the requested identity, canonical identity, and registry sources searched instead of a silent/dead command.
- Preserved the full v4 hull, Grizzle→Grizzly alias migration, finger-swipe fleet rail, filters, outlined project controls, and no-write Preview / marked-data Sea Trial contracts.
