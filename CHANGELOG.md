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
