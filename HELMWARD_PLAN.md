# Helmward Implementation Plan

> For agentic workers: execute inline using superpowers:executing-plans; one fresh final review.

Goal: Turn the fleet's long vessel section into focused navigation, use Test Center consistently, and recover safely from ended previews.
Architecture: Extend the current Engine renderer and its existing guarded routes. A compact vessel chooser and one selected workstation share the already-verified roster. Keep one-use preview entry and all owner/server checks.
Tech stack: Existing buildless JavaScript, HTML and CSS; offline Node verification and controlled browser inspection.
Spec: Captain's screenshots and explicit instruction to implement the proposed focused screens, consistent labels and return paths. No further design approval is needed.

## Constraints and decisions
- Apply navigation to every rendered vessel; preserve all records, branding, owner gates and Fleet Core/Admiral Program distinction.
- Choose focused screens over merely reducing card padding; reuse the current app over building a parallel dashboard.
- Preview recovery may navigate to Engine; it never restores authority or an old customer's work.
- Leave server deployment and publication unchanged. This is an upload release over the exact Harborlight full backup.
- Source archive is not a Git checkout. Work in an isolated copy and prove exact patch reconstruction and rollback.

## Tasks
1. [x] Fleet navigation: index.html, app.js, styles.css. Add a compact chooser, selected-vessel state, All vessels and Back to Engine actions. Verify public/locked access cannot select, unknown IDs do not reveal another card, renders retain valid selection and clear missing selection, and main actions fit iPad/iPhone.
2. [x] Testing navigation: app.js, countercraft_customer.js, countercraft.html, countercraft.css. Rename the entrance Test Center across vessels, return to the selected workstation, give active and expired Engine previews a Return to Engine link, keep unconfigured customer stations separate. Verify consumed/malformed preview tokens never grant access or issue a submission.
3. [x] Release: release identity 8.8.20.88 Helmward, current guide/evidence, integrated regression runner. Run baseline regressions, focused tests, browser QA, independent final review, then seal and package upload/full-source backup/rollback.

## Test-first steps
- Write VERIFY_HELMWARD_NAVIGATION.cjs exercising production navigation functions and DOM state; run against unchanged source and observe failures.
- Write VERIFY_HELMWARD_RECOVERY.cjs executing the actual customer startup with used/absent/malformed launch tokens; verify correct recovery and no transport call.
- Implement one task at a time and rerun the relevant tests.
- Run node VERIFY_RELEASE_ALL.cjs . ../verification; expected all pass.
- Inspect actual Engine, vessel chooser, selected workstation, Test Center and recovered preview in the controlled browser. Native iPad acceptance remains Captain's field test.
- Build with BUILD_RELEASE.py against the retained exact Harborlight ZIP; expected exact reconstruction, zero deletions, rollback restoring baseline bytes.

## Review focus
- Delayed render/session loss cannot reopen private surfaces.
- A selected vessel or empty search cannot bleed another vessel's actions.
- Project Control/Test Center return preserves selected vessel and usable focus.
- Preview refresh/old tab closes access while providing useful recovery.
- Phone/iPad controls remain reachable without horizontal scroll or a long Engine scroll.
