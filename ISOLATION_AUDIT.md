# Dark Sky 4.8.2 — Isolation Audit

Pre-release isolation audit for BOR North Richmond.

## Core preservation

The following existing platform/security/Captain files are byte-for-byte unchanged from the 4.8.0 baseline:

- `captain.js` — unchanged — SHA-256 `86539f233a8710841c7a00750eea31d61064817e6554a8fbb55eeb78cc75f1a4`
- `platform_core.js` — unchanged — SHA-256 `cf30295342e93493065c4ea1a364ab203cdc965bac1cf895a2c282e28fc20cf0`
- `platform_identity.js` — unchanged — SHA-256 `40258a7826a10903bef5f63e4364f8298ec372e78cf9320ce4859a5ede84e6e1`
- `platform_v4.js` — unchanged — SHA-256 `b484e6452dea23d857ee3e0482704163488bd3691908790b7b9ad1ce68a00b65`
- `assets/black_flag_platform_icon.png` — unchanged — SHA-256 `dc4e3b99abd6478d75be1bb77709b8da136bdcfd76d86d39ecd8d0259753a7b0`
- `assets/black_flag_primary_lockup.png` — unchanged — SHA-256 `5dc518e32a9aa098d099bbb59b2a6eb1fb0d818328cb1ccbacda2ec60ee4ef2f`
- `assets/captains_quarters_cinematic_v2953.jpg` — unchanged — SHA-256 `f68e466636693e4dc9b47f2b7fbfca687b7bf4724ba2b5cb14dde179c790ef2b`
- `assets/engine_room_modern_benchmark_v2976.png` — unchanged — SHA-256 `ffaec34c7feb88a7b05560e6b5469c4d57861b00f308d032d526760e5a422c1c`
- `assets/engine_room_pirate_benchmark_v2978.png` — unchanged — SHA-256 `65ed8f851e5aa6a213c4eac37d3509d87c40c3ff431234eed6ff6b456381c7cf`
- `assets/ike_character.jpg` — unchanged — SHA-256 `8d38dc8ad156fe00cf2f09eebf3e83fe0f775f8b59d9c6cd230856e01969fbad`

## Boundary checks

- build_4_8_2: PASS
- bor_exact_id: PASS
- bor_context_guard: PASS
- bor_cleanup: PASS
- cross_project_deny: PASS
- bor_css_scoped_names: PASS
- test_access_preserved: PASS
- project_return_contract_preserved: PASS

## BOR containment

- BOR has one immutable Project ID: `bor-north-richmond`.
- BOR persistence fails closed unless the active project is that exact Project ID.
- BOR records keep `crossProjectAccess: deny`.
- Leaving BOR clears temporary customer state, photo data, BOR CSS class/theme marker, and rendered BOR shell content.
- BOR-specific branding, phone number, loss workflow, and copy are not added to Captain/security/platform modules.
- Existing project assets are unchanged from the 4.8.0 baseline.

## Promotion rule

BOR lessons are local until separately reviewed and promoted into shared Dark Sky capabilities.
