# Dark Sky Architecture — v4.4.1

## Fleet identity law
The immutable Project ID is authoritative. `grizzle-bear` is a legacy alias only; the canonical Grizzly vessel ID is `grizzly-bear`. Identity migration rewrites project-scoped references without relying on the display name.

## V4 fleet authority
1. Canonical IndexedDB `projects` store records vessels.
2. V4 admission ledger proves which canonical IDs are active fleet citizens.
3. Fleet manifest is a projection of canonical rows intersected with valid admissions.
4. Project envelope ledger seals namespace, default-deny permissions, and project isolation.
5. Commissioning journal preserves an interrupted candidate until canonical read-back and presentation verification succeed.

## Experience Test Deck
Preview, Sea Trial, and Live use the same customer renderer. Preview is no-write. Sea Trial uses real infrastructure but marks test records and binds them to Project ID + Deployment ID. Live is production.
