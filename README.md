# Dark Sky v4.7.6 — Test Access Command Rail

This build preserves the working v4.7.4 Captain's Quarters and moves Test Access into the established bottom command rail as a sixth themed compartment. The underlying dual-authorization, session-only Test Access security architecture is unchanged. Business remains the fresh-load default and Pirate remains an in-session appearance option.

# Dark Sky v4.7.4 — Captain Test Access Plaque

This build continues forward from v4.7.1 without removing the existing security architecture. Business Mode is the default on every fresh load. A Captain can deliberately enable session-only Test Access after entering both the Engine PIN and Captain PIN; while active, repetitive PIN entry is bypassed for testing while existing PIN values, roles, project isolation, and destructive-action confirmations remain intact.

# Dark Sky v4.7.1 — Engine Appearance Binding Repair

This release advances from v4.7.0 and repairs the pre-login Business/Pirate appearance selector.

## Repair
- Removed the accidental recursive call in `bindEngineAppearanceControls()` that prevented the appearance controls from being armed.
- Added idempotent element-level binding for both Business/Pirate segmented buttons and legacy appearance toggles.
- Reused the same binding function during late event setup to prevent duplicate click/change handlers.
- Preserved appearance-only behavior: no authentication, project authority, project data, or isolation rules are changed.
- Advanced executable/cache versioning to v4.7.1 so browsers and installed service workers request the repaired code.
