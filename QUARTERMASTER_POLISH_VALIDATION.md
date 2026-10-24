# Quartermaster 8.8.20.51 — presentation verification

**OFFLINE_RELEASE_CHECKS_PASSED** · recorded 2026-10-23T22:03:24.191868-04:00.

The scoped visual refresh passed 35 presentation checks, 8 focused disclosure/current-identity checks and all 11 existing document workflow scenarios. Independent review approved the changes. Core calculation, PDF, font, storage schema, authentication handlers and customer routes are preserved; this is a presentation update.

The main matrix ran on the new presentation immediately before the final .51 identity stamp. All eight tested source files were then checked for exact or version/seal-only equivalence, followed by current .51 disclosure/identity checks. The final workflow run uses .51 source hashes. This distinction is explicit in QUARTERMASTER_POLISH_VALIDATION.json.

The sealed actual-index loader passed 3 cases: coherent startup, modified-runtime rejection and modified-checksum rejection.

The bundled presentation verifier is VERIFY_QUARTERMASTER_PRESENTATION.cjs. Pass release directory, output directory and `after`; use `--followup` for the focused disclosure/current-identity checks. VERIFY_QUARTERMASTER_POLISH.py checks exact behavior preservation and final release integrity against complete .50. The final archive is separately reconstructed/extracted and booted after sealing; archive hashes are not embedded in themselves.

## Detailed presentation evidence

# Quartermaster presentation verification

## Result

**35 main presentation checks passed, followed by 8 focused disclosure/current-identity checks.** The professional Admiral button cascade regression is reproduced in the preserved .50 baseline and corrected in all three viewport sizes. No new blocking visual issue was found during the inspected screenshots.

The main after run captured the edited presentation while it still declared build .50. Root then stamped .51 identity without changing presentation behavior. `presentation-identity-match.json` confirms all eight tested source files match the final .51 files exactly or after replacing only the build/seal strings back to .50. The focused final run captures the current .51 overview and exercises the newly added native disclosure controls. The main matrix was not repeated solely for identity stamping.

## Environment and scope

- Chromium 151.0.7922.34 through the installed runtime Playwright; new isolated browser contexts, no user profile.
- Gate fixture uses the exact creation template, `setAdmiralEntranceStep`, `showAccountAirlock` and `installAdmiralEntranceViewport` functions extracted from current `captain.js`, plus complete `styles.css`, `business_deck.css` and `quartermaster.css`.
- Gate state is synthetic. No real authentication handler, server permission, credential or identity is exercised. This is presentation, accessibility-state and geometry evidence, not live authentication proof.
- Workspace runs the actual Quartermaster UI/core/PDF modules with native IndexedDB and synthetic authority inside `#admiralDeck.admiral-deck-overlay[data-mode="professional"]`. This deliberately includes the ancestor selectors missing from the earlier isolated document fixture.
- All response bytes are served locally. External requests are blocked, and no external attempts or page errors occurred in the passing runs.
- Viewports: 1024×768,768×1024 and 390×844. Additional gate 390×460 and workspace 768×480 cases cover a short, keyboard-like viewport. Chromium geometry does not certify physical iPad/Safari keyboard behavior.

## Reproduced regression and measured improvement

The preserved baseline's global professional-deck `button` rules use `!important`, overriding Quartermaster's intended selected-tab and action colors. With pointer hover and keyboard focus removed from the comparison, all three baseline sizes show the same dark background and gold text for both selected/inactive tabs and primary/secondary actions.

The updated styles restore a light selected tab with teal text and underline, a teal primary action with white text, and a white secondary action with darker text. These distinctions survive the full host CSS cascade at all three sizes. Disabled actions and focus indicators remain visibly distinct.

| Workspace size | Baseline content height | Updated content height | Touch targets / overflow |
|---|---:|---:|---|
|1024×768|354px|376px|Updated controls ≥44px; no outer horizontal overflow|
|768×1024|514px|536px|Updated controls ≥44px; no outer horizontal overflow|
|390×844|298px|398px|Updated controls ≥44px; contained, intentionally scrollable tabs|
|768×480 short viewport|66px|170px|Editable field reachable with visible focus|

The baseline tabs measured 42.25px high. Updated standard tabs measure 52px. All visible non-checkbox button/input/select/textarea targets in the checked views meet 44px. The newly added disclosure summaries separately meet 44px and retain useful content/field access when expanded, including the short viewport.

## Covered checks

- PIN, account and reusable-session gate presentations at all three sizes.
- PIN label remains immediately before the input; correct input group hidden/shown; exactly one current step; heading focus maintained.
- Gate's disabled CTA and closed surface remain correctly styled/hidden.
- HouseHull overview with the approved 12-item example catalog and one saved draft, in the real professional ancestor cascade.
- Selected/inactive tabs and primary/secondary actions remain distinct.
- No page/dialog/control horizontal overflow outside intentional tab/table scrollers.
- Catalog fields reachable by scrolling/focus; hidden panels stay hidden; disabled catalog action remains disabled; keyboard focus remains visible.
- Short viewport account password and workspace settings input remain reachable.
- Expanded session/storage disclosures preserve touch target size and field access.
- Current runtime exports build 8.8.20.51 and the final overview screenshot was captured from those exact files.

## Evidence

- `presentation-before-final/results.json`: corrected baseline comparison, 31 passing conditions and 4 expected geometry deficiencies. Its collision checks pass by reproducing both styling collisions at all three sizes.
- `presentation-after-initial/results.json`: 35/35 main checks, source hashes and style/geometry data.
- `presentation-final-identity/results.json`: 8/8 focused disclosure/current-identity checks, current hashes.
- `presentation-identity-match.json`: exact or identity-only source equivalence.

The first baseline run in `presentation-before` measured a hovered selected tab, so its border differed due to hover rather than selection. The harness was corrected to blur the control and move the pointer away before comparing. The corrected baseline run above replaces that measurement; no product change was made to satisfy it.

## Inspected screenshots

- `presentation-after-initial/gate-tablet-landscape-pin.png`: concise orientation, prominent PIN action and restrained secondary navigation.
- `presentation-after-initial/gate-phone-account.png`: stacked form, truthful completed/current steps and reachable credential fields.
- `presentation-after-initial/workspace-tablet-landscape-overview.png`: restored action hierarchy and selected navigation under complete inherited styling.
- `presentation-after-initial/workspace-phone-overview.png`: contained layout and larger usable content area.
- `presentation-final-identity/workspace-final-8.8.20.51-overview.png`: final stamped runtime capture.

## Reproduce

From the scratch root, using the installed Node/Playwright dependencies and permitted local Chromium launch:

```bash
node quartermaster-polish/qa/VERIFY_PRESENTATION.cjs quartermaster-build/release quartermaster-polish/qa/presentation-before-final before
node quartermaster-polish/qa/VERIFY_PRESENTATION.cjs quartermaster-polish/release quartermaster-polish/qa/presentation-after-initial after
node quartermaster-polish/qa/VERIFY_PRESENTATION.cjs quartermaster-polish/release quartermaster-polish/qa/presentation-final-identity after --followup
```

The release remains untouched by this harness. It writes only its isolated temporary browser storage and the selected QA output directory. No core/PDF regression suites, unrelated product areas, real accounts or live backends were exercised by this presentation task.
