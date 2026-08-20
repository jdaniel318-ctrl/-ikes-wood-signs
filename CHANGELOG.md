## 4.7.7 — Captain Rail Restoration
- Fixed the delayed bottom overlay revealed by the Captain's Quarters image-load transition.
- Restored the original five transparent command hit targets over the cinematic cabin's painted drawers.
- Removed the rendered six-button overlay that covered the original rail and reduced usable screen space.
- Moved Test Access to a compact themed brass control beneath First Mate's Watch.
- Kept Test Access authorization and session-only bypass behavior unchanged.


## 4.7.6 — Captain Command Rail Integration Repair
- Restored the Captain’s Quarters bottom command area to the original visual footprint.
- Removed the duplicate/stacked command-layer effect introduced in 4.7.5.
- Integrated six themed command compartments into one rail, including Test Access.
- Removed the floating “Captain command controls are live” hint from the cabin.
- Shortened Test Access rail status to SECURE / ACTIVE for cleaner iPad fit.
- Test Access authorization and underlying PIN/security structure remain unchanged.

# v4.7.6 — Test Access Command Rail

- Moved Test Access from the unreliable floating plaque position into the Captain's Quarters bottom command rail.
- Added a sixth visible brass/wood themed compartment labeled TEST ACCESS with a live SECURE/ACTIVE indicator lamp.
- Preserved the existing five Captain command destinations and their handlers.
- Reused the existing Engine PIN + Captain PIN authorization flow; no PIN values, roles, project isolation, or lockout architecture were removed.
- Kept Test Access session-only and advanced executable/cache versioning to 4.7.6.

# v4.7.4 — Captain Test Access Plaque

- Added a visible, brass-and-lantern styled TEST ACCESS control directly to the cinematic Captain's Quarters dashboard.
- Reused the existing dual-authorization Test Access flow rather than creating a second security path.
- Added live OFF/ACTIVE status and indicator lamp to the Captain dashboard control.
- Preserved session-only bypass behavior, PIN architecture, lockouts, project isolation, and Captain authority boundaries.
- Advanced executable/cache versioning to 4.7.4.

# v4.7.3 — Login Gate Repair

- Fixed a Black Flag login regression introduced by the v4.7.2 Test Access hook.
- The outer Black Flag portal now reads Test Access through the public `window.DarkSkyTestAccess` API instead of referencing an internal function outside its scope.
- Normal PIN authentication works again when Test Access is off.
- Test Access can still bypass the Black Flag gate when it has been explicitly authorized from Captain's Quarters.
- No PIN values, role boundaries, project isolation rules, or existing project structure were removed.
- Advanced executable/cache versioning to 4.7.3.

# v4.7.2 — Test Access Foundation

- Engine appearance now always starts in Business Mode on a fresh load; Pirate Mode remains available for the current session only.
- Added Captain-controlled Test Access Mode for faster commissioning and QA.
- Test Access requires dual authorization (Engine PIN + Captain PIN) before activation.
- Once active, Engine, Captain, project-admin, and protected PIN gates can be entered without repeatedly typing PINs.
- Test Access is session-scoped and does not alter saved PINs, role boundaries, lockout rules, project isolation, or data namespaces.
- Added a persistent on-screen TEST ACCESS ACTIVE warning while the bypass is enabled.
- Destructive Engine reset still requires its final confirmation even while Test Access is active.
- Advanced executable/cache versioning to 4.7.2.

# v4.7.1 — Engine Appearance Binding Repair

## Fixed
- Corrected a v4.7.0 regression in `bindEngineAppearanceControls()`: the function called itself recursively instead of attaching appearance event listeners.
- Business/Pirate controls on the Engine login gate now bind before database initialization.
- Engine Settings appearance controls use the same idempotent binding path.
- Removed duplicate late event attachment for the same controls.
- Cache namespace and executable asset version strings advanced to 4.7.1.

## Preserved
- v4.6.9+ platform architecture and project data boundaries.
- Engine PIN behavior and authority remain independent from appearance.
