# Workshop Engine v2.9.60 — Architecture Consolidation

This release fixes the architectural shortcuts identified in the v2.9.59 review.

## Engine Appearance
- `engineAppearance` is now the primary setting.
- Business Mode and Pirate Mode are two complete presentations of the same Engine Room.
- Business Mode is the default.
- Login selector and in-Engine selector read/write the same setting.
- Legacy Pirate Mode functions remain only as compatibility wrappers.
- Engine text, entrance styling, Operations Bay/Cove treatment, navigation rail, buttons and panel materials now visibly change with the selected presentation.
- Neither mode changes permissions, project data, isolation, workflows or authority.

## Captain's five visible doors
Added five dedicated hitboxes aligned to the five painted cinematic controls:
- Cargo Hold
- Powder Keg
- Black Flag
- Captain's Log
- Ship's Blueprint

The visible painted button is now the actual interaction target. Existing desk objects remain secondary shortcuts, not substitutes.

## Captain responsibilities
- Cargo Hold = innovation pipeline and workshop notes.
- Powder Keg = Captain-only high-consequence authority review.
- Black Flag = fleet command / state awareness.
- Captain's Log = fleet performance, audit history, Standing Orders and waived-fee records.
- Ship's Blueprint = architecture only, with access to the full living blueprint.

Each command area now receives a distinct visual treatment inside the Captain Command workspace.

## Engine responsibilities
- Analytics remain removed from the primary Engine Room.
- Company Registry remains removed from the daily surface because Fleet Command duplicates it.
- Project operations and controls remain in the Engine Room / First Mate's Workbench.
- No project control has been moved into Captain Command.

## Assets
No new assets added, removed, renamed or replaced in v2.9.60.
Existing Captain's Quarters and Engine Room benchmark assets remain unchanged.
