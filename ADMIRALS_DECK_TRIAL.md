# Admiral’s Deck Trial — Dark Sky 6.1.1

## Hierarchy

Admiral is the singular authority above Captain. The Admiral governs Dark Sky, Black Flag, and the fleet as a whole. Captain remains the singular strategic/operational commander beneath that authority. Project Admin and Project Manager remain project-scoped.

## Trial state

The Admiral’s Deck is available for testing but does **not** represent an earned Admiral promotion. The production UI must show the deck as provisional/trial until the fleet is proven.

## Access contract

- Captain’s Quarters PIN: `19613`
- Admiral’s Deck PIN: `19613` for now, implemented as a separate Admiral credential contract.
- The two credential concepts must remain separable so the Admiral PIN can change later without restructuring Captain access.
- Delegation of Admiral or Captain duties occurs only at the owner’s discretion.

## Navigation

Engine → Captain’s Quarters → Admiral’s Gate → Admiral’s Deck.

The Admiral’s Deck returns downward to Captain’s Quarters. It does not bypass Captain navigation to jump directly into project machinery.

## Scope

The trial deck begins with fleet governance, Fleet Readiness, recovery, future delegation, standards, and expansion. Day-to-day project operations stay in Black Flag and project-specific layers.
