# Fleet Project Rail Audit — v3.8.16

## Purpose
Ensure newly commissioned projects remain visible in Engine Project Command as the fleet grows beyond the original four-card layout.

## Repairs
- Project cards now render as a horizontal, touch-scrollable fleet rail.
- iPad users can swipe left/right; explicit previous/next controls are also provided.
- Add Project remains at the end of the rail.
- Commissioned projects now receive a safe `type` fallback from their business type.
- Project-card rendering no longer assumes every project already has a legacy `type` string.
- Search/status filters reset the rail to the beginning and retain horizontal navigation.

## Root cause addressed
Newly commissioned projects could be persisted correctly but fail the Engine card render because the legacy card description attempted `p.type.replaceAll(...)` on a project that had no legacy `type` field. The stale four-project DOM could therefore remain visible after commissioning.

## Acceptance checks
1. Commission a fifth project.
2. Return to Engine.
3. Project summary reflects five projects.
4. Swipe the Project Command rail left/right and locate the new vessel.
5. Open its Control Center.
6. Reload Safari and confirm the project remains in the rail.
