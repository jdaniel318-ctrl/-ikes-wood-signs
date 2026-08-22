# Dark Sky 6.0.4 — Clear Decks

Stabilization and repository-hygiene release on the reconciled Dark Sky 6.0 platform spine. This build fixes Captain navigation authority without changing the working Black Flag, Project Admin, Client Preview, or project-isolation contracts.

## What changed

- Captain’s Quarters main room alone owns **Return to Engine**.
- Captain subviews such as Cargo Hold / Workshop, Shipyard, Blueprint, Log, Signals and Fleet Map return to **Captain’s Quarters**, not directly to Black Flag.
- The global Captain exit is hidden while a Captain subview is open.
- Escape closes an open Captain subview first; it exits Captain’s Quarters only from the main room.
- A defensive cleanup closes any Captain subview before the Captain → Engine crossing.
- Runtime/cache/release identity is aligned on 6.0.4.
- The deployable package keeps one clean runtime tree at repository root and media-only `assets/`.

## Authority contracts

- Project Admin fleet default/recovery PIN: `4353`
- Black Flag Engine PIN: `5615`
- Captain’s Quarters PIN: `19613`
- Client Preview PIN: unique per invite

## Preserved platform contracts

- strict project isolation
- Client Preview pre-paint isolation bulkhead
- Test/Private Preview real-world contact blocking
- domain/host portability
- iPad/iPhone responsive contracts
- cloud-readiness and recovery posture

## Canonical deployment layout

Deploy the contents of this ZIP at the **repository root**. Runtime files stay at root; `assets/` contains media only. Historical one-off audit files already in GitHub may be archived or deleted after this build is confirmed. See `REPOSITORY_CLEANUP.md`.
