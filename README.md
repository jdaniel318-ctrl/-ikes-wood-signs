# Workshop Engine v2.9.62 — Captain Workspace Layer Fix

## Root cause found
The five Captain command buttons were working as hit targets, but their command workspace was opening behind the Captain's Quarters.

- Captain's Quarters z-index: 99999
- Captain Command workspace z-index in v2.9.61: 19000

That made the workspace functionally open while remaining invisible behind the cinematic cabin.

## Fix
- Captain Command workspace raised above the cabin to z-index 120500.
- Captain's Quarters stops receiving pointer events while a Captain command workspace is open.
- Workspace remains interactive.
- Stale hint text changed from "Objects on the desk are live controls" to "Captain command controls are live."

## Assets
No assets added, removed, renamed, or replaced.
