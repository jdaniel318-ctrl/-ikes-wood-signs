# Dark Sky 4.8.3 — BOR Commissioning Audit

## Purpose
Admit the already-isolated BOR North Richmond vessel into an existing 4-project fleet without rewriting the four existing vessel definitions.

## Existing vessel definition preservation
The following DEFAULT_COMPANIES project definition blocks are byte-for-byte identical to 4.8.2:

- `ikes-wood-signs` — PASS — SHA-256 prefix `2ea81ed5d4162093`
- `mugshot-after-dark` — PASS — SHA-256 prefix `ebd332eef10f967f`
- `beccas-bloom-shop` — PASS — SHA-256 prefix `9bfa69782ce89154`
- `grizzly-bear` — PASS — SHA-256 prefix `f31e1a0b906c025b`

## Admission guard
- BOR is the only new Project ID explicitly admitted by the 4.8.3 release migration.
- A source-code project definition does not automatically gain fleet citizenship; release seeding is gated by an explicit allowlist.
- BOR admission occurs only after `bor-north-richmond` exists in the canonical project registry.
- Existing project data rows are not cleared, renamed, or replaced by the admission migration.
- BOR remains subject to its 4.8.2 fail-closed project-context and cross-project isolation checks.

## Expected first-load result
- Project Command shows 5 projects: the existing four plus Best Option Restoration — North Richmond.
- Existing order counts and project identities remain unchanged.
- BOR appears PRIVATE/TEST until separately commissioned/published.

## Static validation
- JavaScript syntax checks: PASS.
- Existing four default vessel definitions unchanged: PASS.
- Explicit BOR release admission present: PASS.
- Service worker build/cache advanced to 4.8.3: PASS.
