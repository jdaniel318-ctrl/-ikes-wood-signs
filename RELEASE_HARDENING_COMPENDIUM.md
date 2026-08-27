# Release Hardening Compendium
> Consolidated in Dark Sky 8.2.8 to keep the deployment lean while retaining the full historical contracts as an AI-readable regression reference.

---

## Source: `CLOUD_READINESS.md`

# Dark Sky Cloud Readiness & Portability Contract — 5.8.2 Helm


## Purpose
Dark Sky must be able to move from the current test harbor to a custom domain and managed cloud infrastructure without redesigning the fleet. This contract is a standing engineering constraint for cleanup, feature work, deployment, and vendor selection.

## Non-negotiable principles

1. **No single device is authoritative.** iPad, iPhone, Android, kiosk, and desktop are clients/operating consoles. Production code and data must survive loss of any one device.
2. **Source history is recoverable.** A known-good application release must be restorable from version control/release artifacts without hunting for a local ZIP.
3. **Code and business data are different recovery problems.** Git/source history protects application code; production orders, customers, project settings, photos, assets, preview records, and audit history require managed data/storage backups.
4. **Host and domain are replaceable.** Customer experiences, Engine routing, asset paths, and Client Preview link generation may not depend on the current GitHub Pages repository path.
5. **Provider choice is replaceable.** Registrar, DNS provider, hosting provider, database, object storage, email provider, and managed-service provider are infrastructure choices—not application identity.
6. **Stable spine, flexible infrastructure.** Authentication domains, Project ID isolation, lifecycle boundaries, and customer safety contracts survive hosting/backend migrations.
7. **No hidden outbound actions in test.** Test, Private Preview, and Client Preview remain simulation-only regardless of future cloud integrations.
8. **Migration is rehearsed before production.** Export, restore, rollback, DNS cutover, and recovery procedures must be proven before real customer data becomes dependent on them.

## Current state

- Runtime: static HTML/CSS/JavaScript application.
- Current test host: GitHub Pages.
- Local/browser stores are acceptable for test data only; they are not the final production datastore.
- Client Preview currently uses a portable sealed link payload. A future preview backend may replace transport without changing project/PIN/safety semantics.
- Public website intake currently includes browser/public-reader approaches. A future server-side intake service should replace browser CORS dependence.

## Target managed-cloud shape

- **Source control:** canonical Git repository + tagged releases.
- **Web runtime:** managed static/web application hosting behind a custom domain.
- **Application API:** managed serverless/container API when browser-only capability is insufficient.
- **Structured data:** managed database with automated backup and point-in-time recovery where available.
- **Files/assets:** managed object storage with versioning/retention policies.
- **Secrets/config:** provider-managed secret/configuration store; never hard-coded into client bundles.
- **Observability:** managed logs, health checks, deployment history, and alerting.
- **Recovery:** documented restore targets and tested rollback procedure.

## Domain migration gate
Before changing the public domain:

- Verify no hard-coded GitHub Pages origin/path is required by navigation.
- Verify service worker uses relative application assets and receives a new cache identity.
- Verify Client Preview builds links from the active host or future preview service.
- Verify manifest/start URL and app metadata operate under the target path/domain.
- Verify HTTPS, DNS, redirect/canonical behavior, and mobile install behavior.
- Run fleet isolation and outbound-contact safety regression after cutover.

## Production-data gate
Before storing real customer/order data:

- Move authoritative records out of device-local browser storage.
- Define Project ID as an enforced datastore partition/tenant boundary.
- Define backup frequency, retention, restore ownership, and recovery objectives.
- Separate test/private-preview data from live production data.
- Ensure uploaded customer photos/files are stored per project with access controls and lifecycle deletion rules.
- Prove project export/restore without exposing another project's data.

## Cleanup retention rule
Remove clutter, not capability. Keep code or documentation that materially supports portability, project isolation, migration, recovery, capability reuse, lifecycle/revision management, mobile/kiosk support, or future backend interfaces. Remove duplicate/dead paths, stale assets, obsolete one-off audits, host-specific assumptions, and project-specific fallbacks that can cause cross-project behavior.

## Authority contract
- Project Admin: 4353 default/recovery
- Black Flag Engine: 5615
- Captain's Quarters: 19613
- Client Preview: unique invite-specific PIN

These authority domains must remain distinct through migration.

---

## Source: `COMMISSIONING_AUDIT.md`

# Dark Sky 4.8.5 — BOR Commissioning Audit

## Purpose
Admit the already-isolated BOR North Richmond vessel into an existing 4-project fleet without rewriting the four existing vessel definitions.

## Existing vessel definition preservation
The following DEFAULT_COMPANIES project definition blocks are byte-for-byte identical to 4.8.2:

- `ikes-wood-signs` — PASS — SHA-256 prefix `2ea81ed5d4162093`
- `mugshot-after-dark` — PASS — SHA-256 prefix `ebd332eef10f967f`
- `beccas-bloom-shop` — PASS — SHA-256 prefix `9bfa69782ce89154`
- `grizzly-bear` — PASS — SHA-256 prefix `f31e1a0b906c025b`

## Admission guard
- BOR is the only new Project ID explicitly admitted by the 4.8.5 release migration.
- A source-code project definition does not automatically gain fleet citizenship; release seeding is gated by an explicit allowlist.
- BOR admission occurs only after `bor-north-richmond` exists in the canonical project registry.
- Existing project data rows are not cleared, renamed, or replaced by the admission migration.
- BOR remains subject to its 4.8.2 fail-closed project-context and cross-project isolation checks.

## Expected first-load result
- Project Command shows 5 projects: the existing four plus Best Option Restoration — North Richmond.
- Existing order counts and project identities remain unchanged.
- BOR appears PRIVATE/TEST until separately commissioned/published.

## Static validation
- JavaScript syntax checks: PASS.
- Existing four default vessel definitions unchanged: PASS.
- Explicit BOR release admission present: PASS.
- Service worker build/cache advanced to 4.8.5: PASS.

---

## Source: `FLEET_READINESS.md`

# Fleet Readiness Contract — 6.2.0

Fleet Readiness is a release gate, not a decorative rank. A fleet is Admiral-ready only when authority, isolation, preview safety, recovery, navigation, and release identity can be proved without relying on a single device or hidden manual knowledge.

## Gate classes

- **CLEAR** — contract verified by a non-destructive runtime check.
- **WATCH** — no critical breach, but evidence or legacy data needs review.
- **HOLD** — critical authority/isolation/safety/release contract failed; do not promote the release.

## Critical contracts

1. Black Flag recovery credential remains 5615.
2. Project Admin recovery/default remains 4353 for every project.
3. Captain authority remains a separate 19613 boundary.
4. Client Preview uses a unique invite credential and never an authority credential.
5. Canonical Project IDs remain unique.
6. Active project/order records may not carry conflicting isolation IDs.
7. Test/private surfaces retain the external-contact guard.
8. Client Preview owns first paint through the pre-paint bulkhead.
9. Captain main-room exit and subview return remain distinct.
10. Runtime version and deployment manifest agree.

## Release discipline

A release should not be promoted when the gate reports HOLD. WATCH items require an explicit Captain review and should become a logged follow-up. The gate is intentionally read-only: it never repairs, publishes, changes PINs, or mutates project state.

---

## Source: `FORTIFICATION_750.md`

# Dark Sky 7.5.0 — Iron Hull

## Mission
Fortify the known-good platform without freezing future improvement.

## Protected contracts
- Authority boundaries remain explicit: Engine, Project Admin, Captain, Admiral trial, Client Preview.
- Project identity/data/media/settings remain isolated by canonical Project ID.
- Test and Private Preview remain externally contained.
- Ike’s approved design remains one immutable production artifact after approval.
- Known Good remains a deliberate Captain promotion, never an automatic deployment.
- Visual environment art remains separate from live controls and state.

## Fresh proof
Iron Hull runs a non-destructive proving pass in the background after Engine entry. Evidence is scoped to the exact build and expires after six hours. A prior build’s CLEAR state cannot be treated as current proof. Captain reruns remain available and produce fresh evidence.

## Safe hygiene
Iron Hull may remove only obsolete Dark Sky/Black Flag application caches and stale Proving Ground evidence records. It does not delete projects, orders, customers, approved artifacts, project graphics, settings, recovery exports, or quarantine evidence.

## Future change rule
Fortified means safe to extend, not finished forever. New capabilities attach through explicit contracts, Sea Trial evidence, and candidate promotion rather than mutating proven behavior silently.

---

## Source: `HARDENING_AUDIT_610.md`

# Dark Sky 6.2.0 Hardening Audit

Scope: Admiral Readiness, recovery/export evidence, release discipline, and preserved authority/isolation contracts.

- Readiness checks are non-destructive and do not increment PIN failures.
- No release gate automatically publishes or repairs project state.
- Recovery snapshot is user-initiated and downloaded locally.
- Test/private contact blocking remains unchanged.
- Captain visual/desk work from 6.0.8 remains unchanged.
- Client Preview routing/bulkhead remains unchanged.

---

## Source: `IRON_PROOF_740.md`

# Iron Proof 7.5.0

## Problem proved in live testing
7.3.0 could show a two-line live approval design but later review/confirmation could lose or reconstruct lettering. Metadata and a nominal artifact record were insufficient.

## Contract
`Design workspace -> build immutable PNG candidate -> show candidate on approval screen -> Captain/customer approval -> adopt exact bytes -> fingerprint -> reuse exact bytes everywhere.`

No later surface is permitted to reconstruct an approved visual from wording/style/layout metadata. Metadata is traceability only.

## Automated proof
The Proving Ground creates a synthetic plank + two-line design, renders the approved PNG through the production renderer, fingerprints it, and verifies stage-reuse contracts for approval, review, confirmation, admin and archive. Any render failure or contract gap is HOLD.

## Next maturity step
A future browser-driving voyage can validate actual DOM navigation on a managed test runner. Iron Proof establishes the deterministic artifact engine and in-app automated proof hook first.

---

## Source: `ISOLATION_AUDIT.md`

# Dark Sky 5.0.1 — Second-Pass Isolation Audit

A second code pass found and removed four residual cross-fleet risks after 5.0.0:

- Engine-gate cancel no longer has a legacy fallback that exposes `customerApp` (Ike) when the canonical return route is unavailable; it now fails closed back to the Engine gate.
- Project Admin button copy no longer inherits Captain/Test Access state, eliminating a misleading visual coupling between Captain authority and project authentication.
- Order email/card helpers no longer fall back to `activeProject()` when an order has an invalid/missing Project ID.
- Legacy admin status mutation now requires both the active Project ID and the order Project ID to match before write-back.
- Dead project-level hooks to the full-fleet backup/restore functions were removed; fleet backup remains an Engine function.
- Reference-vessel display no longer substitutes the first project in the fleet if Ike is absent.

Static checks: JavaScript syntax PASS; duplicate DOM IDs NONE; missing local runtime references NONE; missing referenced assets NONE.

# Dark Sky 5.0.0 — Fleet Isolation Audit

## Failure reproduced from 4.9.7 architecture
The project-to-Engine route hid customer/admin panels but did not consistently hide `pinGate`, the Signal/universal customer shell, or all protected project surfaces. The Engine portal also contained legacy generic Company/Admin code that could implicitly route through Ike's `#adminBtn`. Together these paths could visually retain SIG admin state and later expose Ike as an unintended fallback.

## 5.0 corrections
- All project surfaces are cleared through one boundary helper before Engine entry/render.
- `universalCustomerShell` is included in Engine cleanup.
- `pinGate`, Admin, Orders, Ledger, preview, owner claim, and owner portal are included in project protected-surface cleanup.
- Active Project ID is cleared before Engine rendering.
- Engine Project Control uses `engineActiveProjectId` only and clears customer/admin project context first.
- Cancel from the Engine gate returns only to the immutable Project ID saved before crossing the boundary.
- Generic Company/Admin fallback to Ike has been retired.
- Project Admin gate/unlock is stamped and verified against the same immutable Project ID.
- Order writes and admin async renders re-check Project ID after awaits.
- Project Manager workflows are project-local.

## Runtime test hook
`window.darkSkyIsolationSnapshot()` reports visible major surfaces and active IDs. `window.darkSkyVerifyIsolation(layer, projectId)` records an integrity audit event if an Engine/project boundary is violated.

# Dark Sky 4.8.2 — Isolation Audit

Pre-release isolation audit for BOR North Richmond.

## Core preservation

The following existing platform/security/Captain files are byte-for-byte unchanged from the 4.8.0 baseline:

- `captain.js` — unchanged — SHA-256 `86539f233a8710841c7a00750eea31d61064817e6554a8fbb55eeb78cc75f1a4`
- `platform_core.js` — unchanged — SHA-256 `cf30295342e93493065c4ea1a364ab203cdc965bac1cf895a2c282e28fc20cf0`
- `platform_identity.js` — unchanged — SHA-256 `40258a7826a10903bef5f63e4364f8298ec372e78cf9320ce4859a5ede84e6e1`
- `platform_v4.js` — unchanged — SHA-256 `b484e6452dea23d857ee3e0482704163488bd3691908790b7b9ad1ce68a00b65`
- `black_flag_platform_icon.png` — unchanged — SHA-256 `dc4e3b99abd6478d75be1bb77709b8da136bdcfd76d86d39ecd8d0259753a7b0`
- `black_flag_primary_lockup.png` — unchanged — SHA-256 `5dc518e32a9aa098d099bbb59b2a6eb1fb0d818328cb1ccbacda2ec60ee4ef2f`
- `captains_quarters_cinematic_v2953.jpg` — unchanged — SHA-256 `f68e466636693e4dc9b47f2b7fbfca687b7bf4724ba2b5cb14dde179c790ef2b`
- `engine_room_modern_benchmark_v2976.png` — unchanged — SHA-256 `ffaec34c7feb88a7b05560e6b5469c4d57861b00f308d032d526760e5a422c1c`
- `engine_room_pirate_benchmark_v2978.png` — unchanged — SHA-256 `65ed8f851e5aa6a213c4eac37d3509d87c40c3ff431234eed6ff6b456381c7cf`
- `ike_character_white_teeth.png` — unchanged — SHA-256 `8d38dc8ad156fe00cf2f09eebf3e83fe0f775f8b59d9c6cd230856e01969fbad`

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


## 5.0.3 authority boundary note
Black Flag normal authentication is fixed to 5615 and ignores stale Engine PIN storage. Project Admin remains 4353 by fleet contract; Captain remains 19613. Captain Test Access is session-only and may bypass Engine entry but never changes project identity or Project Admin authentication.

---

## Source: `PERFORMANCE_AUDIT_608.md`

# Dark Sky 6.0.8 — Captain Desk Responsiveness & Station Audit

Focused transition-speed cleanup on the stabilized 6.0.4 spine.

## Concrete barnacles removed

- Captain entrance controls previously remained gated for 4.3 seconds even though the main entrance animation completed substantially earlier. First entry now releases at 2.5 seconds.
- The cinematic Captain entrance now runs once per browser session; later Engine → Captain round-trips become interactive immediately.
- The service worker previously attempted to pre-cache a non-existent `captains_quarters_canonical.png` path.
- Engine appearance benchmark images (~3.6 MB combined) are no longer eagerly pre-cached on every release install; they remain available on demand.
- The actual Captain production environment is now the Captain image included in the pre-cache list.

## Contracts intentionally untouched

- Black Flag Engine PIN/authentication: 5615.
- Project Admin fleet default/recovery: 4353.
- Captain's Quarters PIN: 19613.
- Client Preview unique PIN-per-invite.
- Project isolation, test contact blocking, and Captain subview routing.

## Station-state behavior

- READY stations route to verified runtime targets.
- FUTURE stations remain visible and return an intentional Captain notice instead of failing silently.
- Any READY station whose runtime target is missing is downgraded to UNAVAILABLE when the desk is built.
- The selected cinematic Captain environment and existing transition timing are unchanged.

---

## Source: `RECOVERY_PLAYBOOK.md`

# Dark Sky Recovery Playbook — 6.2.0

## Recovery objective

Loss of an iPad, browser state, bad deployment, or hosting provider must not become loss of the fleet.

## Current interim layers

1. Git repository: source/release history.
2. Release ZIP + checksums: known-good deployable artifact.
3. Admiral Recovery Snapshot: browser-visible project/order/settings recovery artifact.
4. Existing local order/project registry backups: secondary test-stage recovery evidence.

## Restore order

1. Restore a known-good application release from source/release artifact.
2. Verify authority contracts and run Admiral Readiness.
3. Restore durable project/customer data only from a trusted recovery source.
4. Re-run project isolation and Client Preview safety checks.
5. Sea Trial affected projects before returning them to Live.

## Production target

Move canonical project/customer/order data to a managed database, project media to managed object storage, configuration/secrets to managed configuration, and run automated off-device backups with tested restore procedures. GitHub remains source control, not the production customer-data backup.

---

## Source: `REGRESSION_AUDIT.md`

# Dark Sky 6.0.8 — Chart Table Regression Gates

## Captain visual / interaction
- Exactly one visible "Charting the Future Fleet" treatment in the main room.
- No live First Mate card overlays the painted Signals region.
- Captain Intelligence remains live on the right.
- Captain's Desk is fully visible on iPad landscape and grouped Command / Build / Explore.
- Active desk routes resolve to real runtime targets.
- Future station remains visible and intentionally reports FUTURE.
- Missing targets downgrade to UNAVAILABLE.
- Return to Engine remains main-room only; Captain subviews retain Return to Quarters.

## Preserved contracts
- Project Admin fleet PIN: 4353
- Black Flag Engine PIN: 5615
- Captain's Quarters PIN: 19613
- Client Preview PIN: unique per invite
- Client Preview pre-paint isolation preserved
- Test/private-preview real-world contact blocking preserved
- Project isolation preserved


## 6.2.0 Admiral Watch additions

- Runtime readiness gate performs read-only authentication checks (`recordFailure:false`).
- Project Admin 4353 is checked across every current project.
- Client Preview generated code is checked against authority credentials.
- Canonical Project ID uniqueness and order isolation consistency are checked.
- Fleet external-contact guard and Client Preview pre-paint bulkhead are checked.
- Deployment manifest/runtime version agreement is checked.
- Recovery export is explicit and never auto-restores or mutates live state.


## 6.5.0 Flag Bridge
- [ ] Captain first-entry ceremony completes and controls unlock after ~4.5s.
- [ ] Repeat Captain entry completes in ~1.1s.
- [ ] Captain room has no primary vertical overflow on iPad landscape.
- [ ] Admiral Gate ceremony is longer than 6.3.0 and remains skippable via reduced motion.
- [ ] Admiral Ceremonial Mode shows cinematic graphics; Professional Mode removes them.
- [ ] Visual Forge can stage an Admiral ceremonial image without changing PIN/rank/readiness.
- [ ] Project Admin 4353, Engine 5615, Captain 19613, Admiral 19613 temporary contract remain intact.

---

## Source: `REPOSITORY_CLEANUP.md`

# GitHub Cleanup Checklist — after 6.0.6 is confirmed live

Do not delete anything before the 6.0.6 root deployment is tested. After confirmation:

## Safe cleanup targets
Archive or remove historical one-off audit files from repository root that are not part of the canonical release documentation. Examples include old `*_AUDIT.md`, old command/deployment repair reports, superseded mobile audits, `README.txt`, and duplicate checksum files.

## Keep at repository root
- README.md
- ARCHITECTURE.md
- CHANGELOG.md
- CLOUD_READINESS.md
- COMMISSIONING_AUDIT.md
- ISOLATION_AUDIT.md
- MOBILE_CONTRACT.md
- REGRESSION_AUDIT.md
- REPOSITORY_RECONCILIATION.md
- REPOSITORY_CLEANUP.md
- DEPLOYMENT_MANIFEST.json
- RELEASE_CHECKSUMS.sha256
- runtime files listed in REPOSITORY_RECONCILIATION.md
- assets/

## Clean `assets/`
`assets/` should contain images/media only. Remove any accidental copies of `index.html`, JS/CSS, manifests, README/audit files, or checksums from `assets/` after confirming the root deployment works.

## Do not blindly delete media
Project logos and approved Captain/Engine benchmark assets may still be needed. Remove media only after code references are verified.

---

## Source: `REPOSITORY_RECONCILIATION.md`

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

---

## Source: `SENTRY_VISUAL_SANITY_CONTRACT.md`

# Sentry Visual Sanity Contract — 8.0.5

1. **Geometry before labels.** Orientation is derived from the detected plank body's long axis, not from a fragile bounding box alone.
2. **Contradictions veto confidence.** A species candidate cannot become final when strong visible evidence contradicts that species.
3. **Margin matters.** A high top score is insufficient when the runner-up remains too close.
4. **Independent gates.** Orientation, species, and length resolve independently. One passing field cannot promote another.
5. **No shaky facts.** Unresolved fields are shown as checking/pending, never as confident customer facts.
6. **Price last.** Customer price requires resolved species, resolved length, an active owner rate, and a resolved plank orientation.
7. **Minimum burden.** One strong normal photo remains the target. Extra photos are conditional and field-specific.

---

## Source: `SINGLE_BUILD_RELEASE_CONTRACT.md`

# Single-Build Release Contract — Dark Sky 8.0.8 Yardarm

Dark Sky must never paint the Engine from a mixed runtime.

## Required invariants
1. Manifest, app runtime, service-worker source, and active service-worker identity must all report **8.0.8**.
2. The release seal is **yardarm-808-root-keel-6a31fd** and must match in the manifest, release seal file, boot gate, and worker.
3. The service-worker registration URL is permanently stable: `./sw.js`. Release identity belongs inside the worker, never in the worker URL.
4. A failed release verification has no bypass. `RETRY VERIFICATION` runs the same gate again; it does not paint the Engine around the gate.
5. `CLEAN RELEASE RETRY` is a visible transaction: unregister this app's worker → clear Dark Sky application caches → register a fresh stable worker → verify build/seal → reload.
6. Cleanup never deletes project/order/customer/owner IndexedDB data.
7. A release folder is not considered self-contained unless every `required_runtime_files` entry is physically present in the package.
8. Uploads must be one coherent release set. Cherry-picking runtime files from different releases is forbidden.

## Failure behavior
Any mismatch or incomplete worker recovery blocks first paint and presents an explicit release hold with durable progress/evidence.


## Admiral Seal addendum
Release `yardarm-808-root-keel-6a31fd` upgrades the contract: executable service-worker caching is forbidden; the browser executes only the exact bytes fetched and verified in one no-store snapshot before first paint.


## Root Keel amendment
- All upload-critical files are flat at repository root for iPad/Safari GitHub web upload.
- Nested folders are forbidden as a release-critical dependency.
- Core executable identity may HOLD the Engine. Route/decorative visual media may HOLD only the route that needs it, with a branded fallback where safe.
- Release seal: `yardarm-808-root-keel-6a31fd`.

---

## Source: `STAGING_CONTRACT.md`

# Staging / Live Contract — 6.2.0

- Draft, Test, Private Preview, Client Preview, and Sea Trial are non-live states.
- No non-live state may place a real call, text, email, payment, webhook, notification, or contractor submission.
- Customer-facing revisions may be prepared and reviewed without changing the currently proven Live revision.
- A customer-facing change that invalidates prior evidence must be previewed/approved/Sea-Trialed again before promotion.
- Rollback means returning to a previously proven application/configuration state; it must not reconstruct state from memory or another project.
- Project state, assets, customers, orders, and revision evidence remain scoped by exact Project ID.

---

## Source: `UPLOAD_THIS_ONE_BUILD.md`

# Upload This One Build

**Dark Sky 8.2.7 — Keelbook**

Upload all 99 files from this folder to the repository root using the iPad GitHub uploader. Do not split the build or mix it with an older release.

This pass is deliberately narrow: Ike’s sign preview composition only.

---

## Source: `VISUAL_FORGE_CONTRACT.md`

# Visual Command Forge Contract — Dark Sky 6.2.0

The Visual Command Forge is a shared high-authority creation capability available to Captain and Admiral.

## Captain
- Create and prototype from reference visuals.
- Translate scenes, brands and layouts into buildable briefs.
- Keep experiments isolated until promoted through Workshop / Sea Trial.

## Admiral
- Use the same Forge at fleet-governance scope.
- Review whether a successful visual pattern should become a fleet standard.
- Promotion of patterns remains explicit; private project data and assets never become shared implicitly.

## Current execution boundary
6.2.0 performs local reference intake, blueprint generation, persistence and export. Managed AI execution that directly generates production code/assets remains a future backend capability and must not be simulated as complete.

## True Wake — stale document / fresh manifest handoff
Observed during 8.2.8 dry dock: Safari displayed an older 8.2.4 HTML shell while the deployment manifest was already 8.2.8. Worker registrations and application caches cleared correctly, but the old document continued verifying against its embedded 8.2.4 identity. True Wake makes the page identity single-source and permits one cache-busted document promotion when the deployment manifest proves a different complete release is present. Repeated promotion is forbidden; unresolved disagreement remains a release HOLD.
