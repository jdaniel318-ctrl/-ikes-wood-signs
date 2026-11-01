# Holdfast Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Preserve and compare older Ike records and offer verified, narrow cleanup with clear recovery UI.
**Architecture:** Pure legacy capture/comparison/archive module, integrated with early-bound Engine controls and existing read-only DB access. Saved-file selection verifies the downloaded archive before explicit removal.
**Tech Stack:** Existing vanilla JS, Web Crypto, IndexedDB, CSS; Node and Playwright tests.
**Spec:** HOLDFAST_DESIGN.md

## Global Constraints
- No startup cleanup, migration retry, permission change, or backend change.
- Exact raw source preservation; three-key allowlist; canonical comparison only.
- Engine auth before and after async boundaries; 20-second timeout; stale completion ignored.
- UI preserves fleet structure and works on iPad/iPhone.

## Review Focus
- Malformed old data preserved but never eligible.
- Identical IDs across vessels and quarantined rows never treated as Ike duplicates.
- Wrong/tampered saved file cannot authorize deletion.
- Changed sources or session while awaiting I/O invalidate removal.
- Partial storage failures must report removals accurately and retain archive access.

### Task 1: Pure preservation/comparison
Files: fleet_legacy_recovery.js; VERIFY_HOLDFAST_CORE.cjs.
Interfaces: capture(storage), compare(entries, orders, currentDraft, excludedIds), archive(entries, build), verify(text, entries), removeVerified(storage, entries, eligibleKeys).
- [x] Write/run failing behavioral tests for raw export, field/media preservation, scope, malformed records, verified-file mismatch, changed raw storage and partial removal.
- [x] Implement pure module and run core tests to PASS.
- [x] Commit module and tests.

### Task 2: Recovery controls and accurate status
Files: app.js, index.html, styles.css; VERIFY_HOLDFAST_BROWSER.cjs.
Consumes Task 1 module. Produces early-bound Engine preserve/verify/remove controls and legacy-aware diagnostics.
- [x] Reproduce old-status omissions and closed nested minus indicator; create browser tests before UI implementation.
- [x] Integrate read-only snapshot, download, file verification, fresh comparison, explicit cleanup. Preserve timeout/auth/error semantics.
- [x] Correct counts and layout; test actual downloads, file selection, locked/quota/read-failure/race paths and 3 viewport layouts.
- [x] Commit code/tests.

### Task 3: Release and delivery
Files: release configuration/manifests, HOLDFAST_GUIDE.md, release runner.
- [x] Generate/seal 8.8.20.80 Holdfast against exact Lifeboat full-source baseline.
- [x] Run core, browser, full release suite and independent whole-change review; fix material findings with regression tests.
- [ ] Build upload, full software backup and rollback; validate CRC and exact reconstructed trees.
- [ ] Deliver a short single-folder upload ZIP and separate full software backup; verify uploaded ZIP bytes by downloading them back.

## Progress
- Baseline cf4206382908d68d575004a28bea5bfac3beefc3. Isolated worktree reused on holdfast branch. Existing approved three-part design governs; no repeated approval requested.

- Core: 11 behavioral checks pass. Browser: 15 checks pass at iPad landscape/portrait and iPhone sizes. Captain backup: 6 regression checks pass. Independent review findings fixed and rechecked.
- Review scope exclusions accepted: existing Captain backup session semantics and startup/background writes are unchanged; native Safari and packaging remain separate acceptance.

- Sealed source records completed implementation and testing. External PackageProof.json and delivery verification record packaging and download roundtrip after this snapshot is sealed.
