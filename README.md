# Workshop Engine v2.9.59 — Business/Pirate Modes + Captain Command Suite

## Engine appearance architecture
- Business Mode and Pirate Mode are now two first-class presentations of the same Engine Room.
- Business Mode is the default professional Engine Room.
- Pirate Mode remains optional and changes presentation only.
- The Engine PIN screen uses one segmented Business / Pirate selector.
- Engine Settings uses the same selector and the same underlying `engineAppearance` setting.
- Changing appearance does not log out, switch projects, alter permissions, or mutate project data.
- Legacy `darkFlagPirateMode` storage is retained only for backward compatibility.

## Captain's five command doors
The cinematic Captain's Quarters visual benchmark is preserved. Its bottom/desk hotspots now open real management areas:

### Cargo Hold
AI Workshop & Innovation with an Idea → Prototype → Sea Trial → Approved → Engine Capability pipeline and persistent workshop notes.

### Powder Keg
Captain-only authority review for destructive/high-consequence operations. Destructive execution remains deliberately disconnected until each operation has a tested recovery path.

### Black Flag
Fleet Command Center: Captain-level view of project states and deployments, without duplicating Engine project controls.

### Captain's Log
Fleet performance, Captain audit history, persistent Standing Orders, and the Captain-only waived-fee ledger.

### Ship's Blueprint
Living architecture summary plus access to the detailed existing Ship's Blueprint.

## Data boundary
- Captain Command reads project/order/deployment data through a dedicated read-only snapshot exposed by the Engine.
- Project control remains in the Engine Room.
- Captain authority does not bypass Engine project namespaces.

## Assets
No asset files added, removed, renamed, or replaced in v2.9.59.
Existing Captain's Quarters and Engine Room benchmark assets remain unchanged.
