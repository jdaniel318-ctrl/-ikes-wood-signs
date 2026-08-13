# Workshop Engine v2.9.61 — Captain Door Function Fix

## Fix
The five painted Captain command buttons were visually selectable in v2.9.60 but could fail to open their management workspaces.

Root cause addressed:
- Captain Command initialization previously depended on one DOMContentLoaded path.
- Dedicated button handlers were bound directly to the initial elements.

v2.9.61:
- Boots Captain Command whether DOMContentLoaded has already fired or not.
- Adds a capture-phase delegated handler for the five command doors.
- Prevents overlapping cinematic cabin layers from swallowing the action.
- Keeps the exact five-button hitbox alignment from v2.9.60.

## Captain doors
- Cargo Hold → AI Workshop & Innovation
- Powder Keg → Dangerous Authority
- Black Flag → Fleet Command
- Captain's Log → history, governance, fleet performance
- Ship's Blueprint → living architecture

## Engine appearance
Business / Pirate architecture from v2.9.60 is unchanged.

## Assets
No assets added, removed, renamed or replaced.
