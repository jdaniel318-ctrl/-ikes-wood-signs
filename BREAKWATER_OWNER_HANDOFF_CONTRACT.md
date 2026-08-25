# Dark Sky 8.0.0 — Breakwater Owner Handoff Contract

## Mission
Owner / Partner authority must open as a first-class project-scoped surface. It must never wait behind the full Engine/fleet boot sequence and must never fall through to Black Flag authority.

## Contract
1. An explicit owner route paints a protected Owner shell immediately from the immutable Project ID.
2. Fleet/database/storage hydration happens behind that shell.
3. The generic protected-route watchdog cannot falsely recover a legitimate owner route while fleet storage is loading.
4. After canonical project hydration, Owner Login or Owner Control Center replaces the shell in place.
5. Owner refresh restores the owner authority route.
6. Owner failure remains Owner-safe and offers Retry Owner Portal or Return to Engine Access; it never exposes another project.
7. Engine, Preview, Customer, and Owner sessions remain separate namespaces.

This contract applies fleet-wide to every project that enables Owner / Partner access.
