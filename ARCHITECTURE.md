# Dark Sky Architecture — v4.4.3

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
## Experience identity boundary
Project Command and the Experience Test Deck share one canonical project-reference resolver. A card may present a legacy or canonical reference, but the Test Deck must resolve the vessel by immutable Project ID across the active fleet and durable registry sources before it opens. Display names are never identity authority. If a durable canonical row is found while the in-memory fleet is stale, that exact row is rehydrated into memory before Preview, Sea Trial, or Live mode begins.



## V4.4.5 Project Mutation Boundary
A project-scoped operational change (deployment/outpost, offer, Sea Trial evidence) MUST persist by immutable Project ID into that project’s canonical row. It MUST NOT clear or replace the fleet registry. The compatibility `companies` mirror is secondary and may be refreshed after canonical read-back; failure of that mirror cannot invalidate an already verified project-row commit. Project Command restores/seals admitted fleet memory before every render so a project-local storage fault cannot reduce fleet visibility.
