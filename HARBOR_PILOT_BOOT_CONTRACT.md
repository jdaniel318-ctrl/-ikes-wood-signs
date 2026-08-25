# Dark Sky 7.9.6 — Harbor Pilot Boot Contract

1. Route authority is decided before project-specific paint.
2. The root/Engine route paints the neutral Black Flag Engine Access gate synchronously on DOM ready.
3. Engine first paint may not wait on IndexedDB, migrations, telemetry, service workers, fleet reads, or project restoration.
4. Owner and Client Preview routes remain project-scoped and may never fall through to another project.
5. Protected route resolution is bounded. Failure produces an explicit neutral recovery surface; it never loops indefinitely.
6. Returning to Engine clears stale Owner/Preview route markers before the next refresh.
7. No project identity may flash during startup, refresh, authentication transitions, or route restoration.
