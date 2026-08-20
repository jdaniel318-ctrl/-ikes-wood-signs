# Dark Sky 4.9.0 Regression Audit

## Protected shared/platform files
- platform_core.js: UNCHANGED (SHA-256 cf30295342e93493...)
- platform_v4.js: UNCHANGED (SHA-256 b484e6452dea23d8...)
- platform_identity.js: UNCHANGED (SHA-256 40258a7826a10903...)
- captain.js: UNCHANGED (SHA-256 86539f233a871084...)
- assets/captains_quarters_cinematic_v2953.jpg: UNCHANGED (SHA-256 f68e466636693e4d...)
- assets/engine_room_modern_benchmark_v2976.png: UNCHANGED (SHA-256 ffaec34c7feb88a7...)
- assets/engine_room_pirate_benchmark_v2978.png: UNCHANGED (SHA-256 65ed8f851e5aa6a2...)
- assets/black_flag_primary_lockup.png: UNCHANGED (SHA-256 5dc518e32a9aa098...)
- assets/black_flag_platform_icon.png: UNCHANGED (SHA-256 dc4e3b99abd6478d...)
- assets/ike_character.jpg: UNCHANGED (SHA-256 8d38dc8ad156fe00...)

## Existing project definitions
- beccas-bloom-shop: UNCHANGED from 4.8.5
- grizzly-bear: UNCHANGED from 4.8.5
- ikes-wood-signs: UNCHANGED from 4.8.5
- mugshot-after-dark: UNCHANGED from 4.8.5

## Intended 4.9.0 change surface
- BOR customer renderer and BOR-scoped responsive CSS.
- Build/cache references and documentation.
- No Captain’s Quarters asset or Captain controller changes.
- No shared security/platform module changes.
- No existing project definition changes.

## Mobile rollout discipline
BOR is certified first. Existing fleet projects are preserved and will be mobile-certified one at a time to avoid a cross-project visual regression.
