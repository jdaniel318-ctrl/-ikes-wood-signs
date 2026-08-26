# Repository Reconciliation — Dark Sky 6.0.6 Clear Decks

## Canonical layout
Runtime/application files live at repository root. `assets/` is media-only.

### Root runtime
- `index.html`
- `app.js`
- `captain.js`
- `styles.css`
- `sw.js`
- `platform_core.js`
- `platform_identity.js`
- `platform_v4.js`
- `manifest.webmanifest`

### Current Captain media
- `captains_quarters_command_center_v578.png` — production Captain command-center plate
- `captains_quarters_cinematic_v2953.jpg` — retained cinematic source/fallback asset

## Rule
No application/runtime/documentation file belongs under `assets/`. No project or Captain runtime may select a different project’s media as a fallback.
