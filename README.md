# Dark Sky 6.0.1 — Drydock Refit

Dark Sky 6.0.1 is the reconciled fleet baseline. It restores one canonical application tree at repository root, one canonical Captain’s Quarters production environment, and one runtime path for that Captain environment.

## Canonical structure

Runtime/application files live at repository root. `assets/` contains media only.

Captain’s Quarters production environment:

- `assets/captains_quarters_canonical.png`

No runtime or fallback path selects an alternate Captain background.

## Authority contracts

- Project Admin fleet default/recovery PIN: `4353`
- Black Flag Engine PIN: `5615`
- Captain’s Quarters PIN: `19613`
- Client Preview: unique invite PIN per preview

## Preserved platform contracts

- Strict project isolation
- Client Preview pre-paint isolation bulkhead
- Test/private-preview real-world contact blocking
- Domain/host portability
- iPad/iPhone responsive contracts
- Cloud-readiness and recovery documentation

## GitHub deployment note

Deploy this package from the repository root. If an older upload left application files inside GitHub `/assets`, remove those non-media duplicates after the 6.0.1 root deployment is confirmed. See `REPOSITORY_RECONCILIATION.md`.
