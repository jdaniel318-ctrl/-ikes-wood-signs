# Helmward execution ledger — HELMWARD_PLAN.md
- Authorization: Captain approved the focused navigation and recovery fixes and asked to apply the improvement to the fleet.
- Baseline: exact Harborlight full source archive; 788 files, 29/29 release suites passed before edits.
- Isolation: archive source has no Git history; independent source copy retained beside unmodified baseline.
- Live-source limitation: GitHub connector returned Unknown tool for two read calls. User screenshots confirm Harborlight in use; no live repository or server mutation attempted.
- Pre-flight: selected-vessel state feeds Test Center return; runtime source must be sealed before browser boot. All data and authority functions retained.

- Task 1 implemented: shared compact roster, focused workstation and named return routes. Selected state is presentation only; verified roster and existing guarded route handlers are retained.
- Task 2 implemented: Test Center entrance, top-level mode actions, folded evidence, explicit ended-preview recovery. Single-use/expiry/build checks and backend allowlist remain enforced.
- Test-first evidence: new navigation and recovery suites failed against Harborlight; async and review regression cases failed before their fixes and pass after.
- Existing scope test was version-pinned to Harborlight. It now uses the exported current build and separately rejects a wrong-build launch. Existing Fleetcare tests isolate the new Test Center cleanup collaborator; actual lock cleanup is covered by Helmward async tests.
- Browser QA: controlled production-renderer fixtures at 1024×768 and 390×844; selected actions visible without horizontal scrolling; Test Center Preview visible first; Back/All vessels/Back to Engine verified. Started-preview header overflow found at 420px in a 390px viewport, fixed and remeasured at 390px.
- Whole-app browser boot and actual recovery page on local HTTP were refused by existing HTTPS/integrity protection. Production guards were not altered. Recovery is verified by actual startup execution in Node. No native Safari/hosted certification claimed.
- Independent review findings resolved: Back Engine and vessel changes cancel pending opens; failed identity returns to its origin, clears old title; old approval/action results cannot repaint a newer vessel; pending preview launch is canceled; locking closes visible Test Center.
- Review inspection target resolved: started-preview header now wraps on narrow screens.
- Release remains software-only, based on exact retained Harborlight archive. Live deployment and server/owner prerequisites are separate. Final package proof and suite logs accompany the release.

- Final reviewed runtime: all 32 integrated offline suites passed with zero failures. Independent reviewer found no outstanding issues in scope. Packaging reruns the suite against an immutable snapshot and only emits archives after exact reconstruction and rollback checks pass.
