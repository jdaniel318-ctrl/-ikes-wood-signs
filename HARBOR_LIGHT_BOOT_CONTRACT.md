# Dark Sky 7.9.6 — Harbor Pilot Boot Contract

Harbor Pilot closes the startup hole found during Clean Wake testing.

## Fleet boot rules

1. No project-specific surface may paint before route and authority are known.
2. The default root route may paint the Black Flag Engine access gate immediately because it is a neutral platform boundary, not a project surface.
3. Owner and Client Preview routes remain project-scoped and never fall through to a different project's customer shell.
4. Route resolution is bounded. A neutral `Securing Route` state may not persist indefinitely.
5. If Owner/Preview routing cannot resolve within the deadline, Dark Sky shows an explicit neutral route-recovery surface. It does not reveal another project and does not silently cross into Engine authority.
6. Refresh is not part of normal navigation. In-app routes remain the primary contract.

This contract is fleet-wide and applies to all future projects.
