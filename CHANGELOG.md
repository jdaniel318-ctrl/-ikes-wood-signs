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
