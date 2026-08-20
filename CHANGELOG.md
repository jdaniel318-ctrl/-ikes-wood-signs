# Dark Sky 4.9.0 — Mobile Customer Experience Foundation

- Rebuilt BOR customer presentation as a modern, mobile-first service experience while preserving the three-step intake structure.
- Added consumer-style service cards, concise supporting copy, clearer progress, stronger request summary, improved photo presentation, and a more actionable confirmation screen.
- Added iPhone safe-area handling, phone-first single-column service navigation, touch-sized controls, sticky mobile emergency call action, and responsive layouts through iPad/desktop.
- Replaced BOR’s fragile per-render action bindings with delegated customer-flow controls so Start Another Request, Back, damage selection, Continue, and Submit survive re-rendering.
- Fixed Start Another Request to clear temporary BOR customer state and return to Step 1 without leaving Private Preview/Test Experience.
- Established the Dark Sky Responsive Customer Contract. BOR is the first certified implementation; existing projects remain unchanged until individually regression-tested against the contract.
- Preserved BOR project isolation and the protected fleet/commissioning structure from 4.8.5.

# Dark Sky 4.8.5 — BOR Exact-Row Commissioning Repair

- Fixes BOR remaining absent from existing four-project browsers after 4.8.4.
- Captain-approved release vessels are now materialized as an exact canonical project-row upsert immediately after storage opens, before fleet reconciliation or Project Command rendering.
- Existing project rows are never rewritten by this repair.
- Canonical read-back is required before BOR receives its release admission.
- Project isolation, Captain’s Quarters, Test Access, Settings, and return-navigation contracts remain unchanged.

# Dark Sky 4.8.5 — BOR Commissioning Repair

## 4.8.5 — BOR Registry Materialization Repair
- Fixed the upgrade path that left BOR absent on browsers whose canonical fleet already contained the four existing projects.
- Release-approved new vessels are now appended by immutable Project ID before registry reconciliation.
- Existing project rows are preserved; the repair appends BOR rather than replacing or rebuilding the fleet.
- BOR admission still occurs only after canonical registry persistence/read-back.


- Fixed BOR North Richmond not appearing in Project Command on existing four-project installations.
- Added an explicit, one-time fleet admission for immutable Project ID `bor-north-richmond`.
- Raised the fleet registry schema to 6 so existing installations reconcile the new bundled vessel.
- Added a release allowlist: merely defining a future project in source code can no longer automatically seed it into an existing fleet.
- Preserved the four existing project definition blocks byte-for-byte from 4.8.2.
- Kept BOR's 4.8.2 fail-closed isolation boundary and project-specific data namespace intact.
- Advanced executable/service-worker cache references to 4.8.5 and added the BOR brand asset to offline caching.
- Added `COMMISSIONING_AUDIT.md` with preservation and admission checks.

# Dark Sky 4.8.2 — Project Isolation Guard

- Added fail-closed BOR project-context checks before rendering and before any BOR request can be persisted.
- BOR submissions are blocked if the active Project ID changes, preventing cross-project writes.
- Added explicit BOR runtime cleanup when leaving the vessel: customer state, photo state, BOR body class, BOR theme marker, and rendered BOR shell content are removed.
- Existing Captain’s Quarters, security, platform core, identity, V4 governance modules, and existing project assets remain byte-for-byte unchanged from 4.8.0.
- BOR remains a local vessel implementation; no BOR-specific workflow, branding, phone number, or status model is promoted into other projects.
- Added an isolation audit manifest and static regression checks before packaging.

# Dark Sky 4.8.1 — BOR North Richmond Response

- Added **Best Option Restoration — North Richmond** as an isolated Dark Sky project while preserving Captain’s Quarters, Black Flag Engine, Test Access, and existing project contracts.
- Added a purpose-built, customer-first emergency intake with only three steps: choose damage type, give property details, give contact information.
- Added direct 24/7 call actions for the North Richmond number, optional photo capture, clear back/next controls, and a simple confirmation/reference screen.
- Added a restoration workflow: New Loss → Contacted → Dispatched → On Site → Mitigation → Monitoring → Reconstruction → Closed.
- Reused the platform-wide project settings and return contracts so the project admin gear and Back to Ordering remain standardized.
- Added the current Best Option Restoration blue/orange circular brand mark as a project-owned asset; no other project inherits it.
- Preserved project isolation and marks test submissions as test data during Sea Trial/Test Experience.

## 4.7.9 — Project Settings Access Repair

- Made project settings/admin access a mission-critical early-bound control.
- Test Access opens project admin without a redundant PIN prompt while preserving active project identity and isolation.
- Fixed customer-shell hiding/restoration so project admin works correctly for Ike's, Mugs, Flowers, and universal commissioned projects.
- Added a settings gear to the reusable universal project header for access parity.
- Preserved the 4.7.7 Captain's Quarters visual baseline.

## 4.7.7 — Captain Rail Restoration
- Fixed the delayed bottom overlay revealed by the Captain's Quarters image-load transition.
- Restored the original five transparent command hit targets over the cinematic cabin's painted drawers.
- Removed the rendered six-button overlay that covered the original rail and reduced usable screen space.
- Moved Test Access to a compact themed brass control beneath First Mate's Watch.
- Kept Test Access authorization and session-only bypass behavior unchanged.


## 4.7.6 — Captain Command Rail Integration Repair
- Restored the Captain’s Quarters bottom command area to the original visual footprint.
- Removed the duplicate/stacked command-layer effect introduced in 4.7.5.
- Integrated six themed command compartments into one rail, including Test Access.
- Removed the floating “Captain command controls are live” hint from the cabin.
- Shortened Test Access rail status to SECURE / ACTIVE for cleaner iPad fit.
- Test Access authorization and underlying PIN/security structure remain unchanged.

# v4.7.6 — Test Access Command Rail

- Moved Test Access from the unreliable floating plaque position into the Captain's Quarters bottom command rail.
- Added a sixth visible brass/wood themed compartment labeled TEST ACCESS with a live SECURE/ACTIVE indicator lamp.
- Preserved the existing five Captain command destinations and their handlers.
- Reused the existing Engine PIN + Captain PIN authorization flow; no PIN values, roles, project isolation, or lockout architecture were removed.
- Kept Test Access session-only and advanced executable/cache versioning to 4.7.6.

# v4.7.4 — Captain Test Access Plaque

- Added a visible, brass-and-lantern styled TEST ACCESS control directly to the cinematic Captain's Quarters dashboard.
- Reused the existing dual-authorization Test Access flow rather than creating a second security path.
- Added live OFF/ACTIVE status and indicator lamp to the Captain dashboard control.
- Preserved session-only bypass behavior, PIN architecture, lockouts, project isolation, and Captain authority boundaries.
- Advanced executable/cache versioning to 4.7.4.

# v4.7.3 — Login Gate Repair

- Fixed a Black Flag login regression introduced by the v4.7.2 Test Access hook.
- The outer Black Flag portal now reads Test Access through the public `window.DarkSkyTestAccess` API instead of referencing an internal function outside its scope.
- Normal PIN authentication works again when Test Access is off.
- Test Access can still bypass the Black Flag gate when it has been explicitly authorized from Captain's Quarters.
- No PIN values, role boundaries, project isolation rules, or existing project structure were removed.
- Advanced executable/cache versioning to 4.7.3.

# v4.7.2 — Test Access Foundation

- Engine appearance now always starts in Business Mode on a fresh load; Pirate Mode remains available for the current session only.
- Added Captain-controlled Test Access Mode for faster commissioning and QA.
- Test Access requires dual authorization (Engine PIN + Captain PIN) before activation.
- Once active, Engine, Captain, project-admin, and protected PIN gates can be entered without repeatedly typing PINs.
- Test Access is session-scoped and does not alter saved PINs, role boundaries, lockout rules, project isolation, or data namespaces.
- Added a persistent on-screen TEST ACCESS ACTIVE warning while the bypass is enabled.
- Destructive Engine reset still requires its final confirmation even while Test Access is active.
- Advanced executable/cache versioning to 4.7.2.

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