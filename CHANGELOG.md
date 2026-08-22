# Dark Sky 6.2.0 — Foundry

- Added Visual Command Forge to Captain's Desk.
- Added Visual Forge governance station to Admiral's Deck.
- Reference visuals can be uploaded locally and translated into exportable build blueprints.
- Forge stores only blueprint metadata in localStorage; it does not publish or contact external systems.
- Generative execution remains explicitly future/backend-dependent.
- Preserved 4353 / 5615 / 19613 / unique Client Preview authority contracts.

# Dark Sky 6.2.0 — Upper Deck Trial

- Added Admiral’s Gate as a deliberate upward route from Captain’s Quarters.
- Added provisional Admiral’s Deck governing Dark Sky, Black Flag, and fleet-level standards.
- Admiral credential is a separate contract while temporarily sharing Captain PIN `19613`.
- Renamed user-facing Admiral Readiness to Fleet Readiness: the system proves the fleet, not the owner’s rank.
- Admiral’s Deck returns to Captain’s Quarters; Captain remains the normal mission command layer.
- Added trial Fleet Readiness, recovery snapshot, readiness report, and future governance stations.
- No changes to Project Admin `4353`, Black Flag `5615`, Client Preview isolation, or test-contact blocking.

# Dark Sky Changelog

## 6.2.0 — Admiral Watch

- Added Black Flag Admiral Readiness Gate with non-destructive checks for authority, isolation, Client Preview, contact safety, Captain navigation, and release identity.
- Added secure downloadable fleet recovery snapshot for interim off-device recovery.
- Added downloadable machine-readable readiness report.
- Added formal Admiral Readiness, Recovery Playbook, and Staging/Live contracts.
- Preserved Black Flag 5615, Project Admin 4353, Captain 19613, unique Client Preview PINs, project isolation, Captain visual/navigation, and customer behavior.

# Dark Sky 6.0.8 — Chart Table

- Captain-only consolidation of the three seams found in the iPad review.
- Removed duplicate live title treatment over the cinematic command-center title.
- Removed the live First Mate card from the decorative Signals tile; signal status remains live in Captain Intelligence and detailed First Mate access remains on the Desk.
- Rebuilt the real Captain's Desk as one fully visible lower command band grouped into Command / Build / Explore.
- Added clear READY / FUTURE / UNAVAILABLE station treatments without deleting roadmap features.
- No changes to Black Flag auth, Project Admin auth, Client Preview isolation, project routing, or production-contact safety.

# Dark Sky 6.0.8 — Brass Compass

- Audited every visible Captain's Desk station against its actual runtime target.
- Added explicit READY, FUTURE, and UNAVAILABLE station states without removing roadmap controls.
- Added Captain-style feedback for future/unavailable stations so no control fails silently.
- Grouped Captain tools into Command, Build, and Explore while preserving the selected cinematic room.
- Added the future Trade Routes station as an intentionally non-operational roadmap control.
- Preserved Black Flag 5615, Project Admin 4353, Captain's Quarters 19613, Client Preview unique invite PINs, project isolation, and customer routing.

# Dark Sky 6.0.8 — Clear Decks

- Separated Captain navigation authority: the main Captain room owns Return to Engine; Captain subviews own Return to Quarters.
- Hid the global Captain exit while a Captain command workspace is open.
- Escape now backs out of a Captain subview before it can leave Captain’s Quarters.
- Hardened Captain exit cleanup so stale subview state cannot survive into Black Flag.
- Aligned runtime and service-worker cache identity on 6.0.8.
- Kept Black Flag 5615, Project Admin 4353, Captain 19613, Client Preview, project isolation, and customer surfaces unchanged.
- Kept the deployment ZIP intentionally lean: runtime + canonical docs + media-only assets.

# Dark Sky 6.0.3 — Harbor Sentinel

- Black Flag Engine gate visual-presence pass only: larger brand lockup, stronger Engine Room hierarchy, integrated secure access panel, and tighter iPad/iPhone composition.
- Authentication and routing contracts are unchanged; 5615 remains the Black Flag Engine credential.
- Legacy appearance hooks remain in the DOM for compatibility but are visually silent on the gate.
- Captain’s Quarters, project routing, Client Preview isolation, and customer experiences are unchanged.

# Dark Sky 6.0.3 — Drydock Reconciliation

Canonical repository/root reconciliation release. Captain’s Quarters now uses one canonical production environment asset (`assets/captains_quarters_canonical.png`) across all runtime and fallback paths. The deployable `assets/` directory contains media only; application/runtime files remain at repository root. Client Preview isolation, Black Flag, project routing, authority contracts, and cloud-readiness contracts are preserved.

# 6.0.3 — Helm Sunset Fix

- Restored the selected clean sunset harbor Captain's Quarters environment.
- Preserved the responsive 5.8.1 Helm interface and real live controls.
- Removed the old cabin background from the active Captain path.
- Tuned overlays so the room remains visible while controls keep contrast.
- Captain-only visual change; Black Flag, project surfaces and Client Preview are untouched.

# 6.0.3 — Helm

- Rebuilt Captain’s Quarters production surface over a clean cinematic room asset.
- Removed reliance on baked-in concept controls and fictional dashboard data.
- Added responsive real navigation, live Captain intelligence, quick actions, and visible Return to Engine.
- Kept Black Flag, Client Preview, project routing, auth, and project/customer surfaces unchanged.

# 5.7.9 — Quarterdeck

- Refined Captain’s Quarters only.
- Replaced baked fictional intelligence metrics with a live fleet snapshot overlay.
- Strengthened Return to Engine visibility and interaction contrast.
- Replaced conquest-style hero language with “Chart. Decide. Build.”
- Integrated First Mate Watch more cleanly into the Chartroom visual.
- Preserved Chartroom asset, Captain controller hooks, Engine auth, Client Preview bulkhead, and all project isolation paths.

# 5.7.8 — Chartroom

- Captain's Quarters only: installs the selected cinematic command-center artwork as the Captain chamber visual foundation.
- Existing Captain features remain real DOM controls; major functions are remapped to visual hotspots instead of being replaced by a static screenshot.
- Fleet chart, Shipyard, Signals/First Mate Watch, Captain's Log, Blueprint/Archives, Test Access and return-to-Engine controls remain operational.
- Covers the mockup's fictional top-right profile area with the real return-to-Engine control.
- Black Flag, project, customer and Client Preview surfaces are intentionally unchanged.
- Preserves the 5.7.6 Bulkhead Client Preview pre-paint isolation fix.

# Dark Sky 5.7.8 — Ironclad

- Based on the proven 5.7.3 Engine-entry structure; no authentication or routing logic changes.
- Preserved every Black Flag gate DOM hook to avoid another cleanup-induced regression.
- Aligned runtime, service-worker cache, and deployment manifest on 5.7.8.
- Added presentation-only command-portal finish and reduced-motion support.
- Authority spine unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, Client Preview unique per invite.

# Dark Sky 5.7.3 — Black Flag Entry Recovery

- Restores the Black Flag Engine entry contract without altering the authority hierarchy: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.
- The canonical Engine recovery PIN 5615 is now checked before persisted browser lockout/settings state. This prevents stale lockout state from an earlier regression/test cycle from rejecting the correct Black Flag credential.
- Incorrect Engine PIN attempts still use the established brute-force lockout policy.
- No project routing, Client Preview, cloud-readiness, customer experience, or isolation behavior was changed in this repair.

# Dark Sky 5.7.0 — Cloud Readiness + Portability Contract

- Added a formal cloud-readiness and portability contract so future cleanup cannot accidentally bind Dark Sky to the current iPad, GitHub Pages path, registrar, or future cloud vendor.
- Added a machine-readable deployment manifest describing runtime files, entrypoint, storage assumptions, external dependencies, authority contracts, and migration expectations.
- Declared Git/source history as the canonical code recovery path and separated code recovery from future production-data recovery.
- Defined a no-single-device/no-single-service design target: an iPad remains a client/console, never the authoritative home of production data.
- Added migration gates for domain changes, managed hosting, cloud database/object storage, Client Preview backend evolution, secrets/configuration, and rollback.
- Preserved the working fleet contracts: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, unique Client Preview PINs, strict Project ID isolation, and Test/Private Preview outbound-contact safety.
- Bumped executable/cache identity to 5.7.0 and retained network-first delivery of navigation and executable assets to reduce stale Safari deployments.

# Dark Sky 5.6.2 — Fleet Cleanup Pass

- Tightened Project Command cards around identity, status, next best move, and compact project tools.
- Removed superseded one-off audit clutter from the deployable package while retaining canonical architecture, commissioning, isolation, mobile, and regression documentation.
- Corrected service-worker cache identity so Safari does not remain pinned to an older build.
- Preserved the authority and isolation contracts without structural rewrites.

# Dark Sky 5.6.1 — Unique Client Invite PINs

- Client Preview PINs are generated automatically by Black Flag for each invite; the user no longer supplies or reuses the PIN.
- Every invite receives a cryptographically random six-digit PIN plus a unique invite ID/salt.
- Client invite PIN generation excludes the authority credentials 4353, 5615, and 19613 and avoids recent invite PIN reuse on the same device.
- A new invite always produces a new invite ID and a new PIN.
- Existing 5.6.0 preview links remain compatible.

# Dark Sky 5.6.0 — Client Preview + Project Command Tightening

- Added a project-scoped **Client Preview** mode for customer demonstrations before publication.
- Client Preview uses a unique 4–10 digit preview PIN and a sealed, self-contained URL-fragment payload representing one project revision.
- Client Preview exposes no Engine Room, Captain, Project Admin, Test Deck, or other fleet controls.
- Client Preview always runs under preview/test contact safety: calls, email, SMS, payments, notifications, and real submissions remain blocked/simulated.
- Preview links carry an expiration date and revision fingerprint.
- Project Command cards were tightened: one primary lifecycle action, one prominent Client Preview action, and internal tools collapsed under Project Tools.
- Portable project graphics are included only when small enough for a cross-device link; source-site/public project assets remain available through the project snapshot.
- Preserved authority spine: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# Dark Sky 5.4.1 — iPhone Compatibility Hardening

- Added a fleet-wide narrow-mobile layout contract across customer, Engine, commissioning, Project Admin/Manager, Test Deck, and Captain surfaces.
- Added iPhone safe-area handling for persistent controls and sticky action bars.
- Added dynamic viewport-height support for Safari toolbar/keyboard changes.
- Prevented Safari form-focus zoom by enforcing 16px inputs on phone.
- Converted dense commissioning and Project Admin navigation into touch-friendly swipe rails.
- Converted Engine project cards and major operational panels to single-column phone layouts.
- Hardened Legacy Plumbing / contractor landing and request flows for portrait phones.
- Kept Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, project isolation, and Test/Private Preview safety contracts unchanged.

# Dark Sky 5.4.0 — Contractor Platform Proof

- Promoted plumbing from a generic service skin into a contractor-grade operating experience.
- Legacy Plumbing can use project-scoped public website visual evidence: source logo, service imagery, and trust imagery.
- Added a responsive contractor header/nav with protected control zones.
- Rebuilt the landing journey around trust, service selection, proof, process, testimonials, and request service.
- Added a three-step plumbing request workflow: Job Details → Property & Photos → Contact & Review.
- Required service address, name, mobile number, and email before submission; photos remain optional.
- Moved Private Preview control away from central content for plumbing experiences.
- Preserved project isolation and existing authority credentials.

# Dark Sky 5.3.2 — Premium Project-Aware Customer Experience

- Rebuilt the plumbing landing experience around confidence, trust, local service, a single Help Now action, plumbing-specific service graphics, proof sections, and a stronger brand chassis.
- Added first-class parsing for `black-flag-business-intake-package-v1` JSON so structured evidence no longer leaks raw JSON into customer-facing copy.
- Structured intake now carries service catalog, trust signals, hours, market and contact evidence into the isolated project compiler.
- Kept the customer renderer project-scoped and compatible with project-owned uploaded logos when available.
- Authority contracts unchanged: Project Admin 4353, Engine 5615, Captain 19613.

# Dark Sky 5.3.2 — Intake Compiler & Service Preview

- Accepted business-intake evidence now compiles into a runnable, project-scoped customer configuration instead of remaining advisory only.
- Plumbing intake creates a confidence-first landing page, plumbing-specific service categories, required email/contact capture, and a universal service-request workflow.
- Existing commissioned plumbing projects with intake evidence are upgraded deterministically at read time, so Preview is available without recreating the vessel.
- Project IDs, assets, orders, admin state, and runtime context remain isolated; the compiler never borrows another project's state.
- Authority spine unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# Dark Sky 5.3.0 — Guided Business Intake

- Rebuilt Commissioning Step 2 as guided onboarding rather than a dense setup form.
- Website URL is now the recommended import path.
- Added direct fetch + public-site reader fallback for public business websites that block browser CORS.
- Kept uploaded files local to the browser commissioning flow; the public reader fallback is not used for uploaded project files.
- Added friendly retry/fallback states and a first-class manual Business Brief path.
- Added trade/category inference for plumbing and restoration so business-specific opportunity and visual recommendations can diverge without copying another project.
- Preserved project isolation and the existing authority PIN spine.

# Dark Sky 5.2.0 — Engine Command Strengthening

- Elevated **Commission New Project** into the Engine hero and Command Deck while preserving the Project Command entry point.
- Clarified Engine hierarchy around attention, operating vessels, and the next useful action.
- Project cards now present one explicit **Next Best Move** before Control Center, Test Experience, and Seaworthiness tools.
- Consolidated commissioning vocabulary: Engine overview remains **Create → Prepare → Sea Trial → Fleet Ready → Live**; the detailed Test Deck identifies **Configure → Preview → Approve** as Prepare work.
- Reframed Seaworthiness Dock as proof/release review for already-created vessels, not the new-project entry point.
- Added an isolated Project Header Chassis: shared safe geometry, project-owned logo/hero/background skin, business-aware defaults, non-interactive artwork layer, protected Black Flag controls.
- Preserved authentication contracts and project namespace boundaries unchanged.

# Dark Sky 5.1.0 — Business Intake / Fleet Learning Foundation

- Added Existing Business Intake to project commissioning: website URL or uploaded current-site files can seed a project-owned business profile.
- Added local HTML/text analysis for business name, description, likely category, contact signals, brand colors, calls to action and business themes.
- Added Opportunity Scan and three project-specific visual-direction recommendations.
- Recommendations are optional and editable; applying them seeds the business brief, operating model, visual profile and capability defaults without publishing anything.
- Commissioned projects retain a project-scoped Business Intake snapshot in Project Marketing so the evidence and opportunities remain reviewable without crossing project boundaries.
- Website URL analysis is best-effort because third-party CORS policies can block browser reads; uploading HTML/site files is the reliable fallback.
- Authentication and authority credentials are unchanged: Project Admin 4353, Black Flag 5615, Captain’s Quarters 19613.

# Dark Sky 5.1.0

- Added an Engine-only reversible project commissioning rail: Configure → Preview → Approve → Sea Trial → Ready → Live.
- Added one-click return from the Test Deck to the project Customer Experience settings.
- Experience approval is now blocked until the current project revision has been previewed.
- Sea Trial is now blocked until that same current revision is approved, preserving the Engine commissioning sequence.
- Preview, approval, and Sea Trial evidence are signature-bound to the current project configuration; customer-facing changes automatically make downstream evidence stale without deleting project configuration.
- Added a compact current-revision fingerprint to make retest requirements visible without exposing lifecycle controls to Project Manager or customer layers.
- Preserved project isolation and the 4353 / 5615 / 19613 authority spine.

# Dark Sky 5.1.0 — Black Flag Structure Restore

- Restores the proven Black Flag Engine authentication contract from the pre-5.0 cleanup: `5615` is always a valid Engine PIN.
- Restores compatibility with an explicitly configured Engine PIN without allowing Project Admin (`4353`) or Captain (`19613`) credentials to authenticate Black Flag.
- Captain Test Access remains the only session-only Engine bypass and does not rewrite any credential.
- Adds a one-time Engine lockout repair because repeated tests against the incorrect 5.0.1–5.0.3 credential changes could leave the correct `5615` PIN locally locked out. Future brute-force lockouts continue normally.
- Keeps the 5.0 project-isolation and fleet-boundary work intact; this release changes the Engine authentication spine only.

# Dark Sky 5.0.3 — Authority Spine Correction

- Restored Black Flag / Engine Room normal PIN to **5615**.
- Kept Project Admin fleet default/recovery PIN at **4353**.
- Kept Captain's Quarters PIN at **19613**.
- Preserved the established Captain Test Access behavior: when deliberately enabled for the browser session, Engine PIN entry is bypassed; the Engine PIN itself is not changed.
- Engine authentication now ignores stale/historical `enginePin` storage so a project PIN or prior regression build cannot redefine Black Flag.
- All Engine gates continue to route through the same `BlackFlagAuth.verify` controller when Test Access is not active.
- Bumped executable and service-worker cache references to **5.0.3**.

# Dark Sky 5.0.2 — Engine Authentication Repair

- Restored the fleet-standard 4353 PIN as the guaranteed Black Flag Engine default/recovery credential.
- Preserved any deliberately configured Engine PIN as an additional accepted credential; it can no longer make 4353 fail.
- Kept Project Admin on the same 4353 fleet default/recovery contract.
- Captain's Quarters remains a separate privileged platform layer with its own credential.
- Bumped all executable/cache references to 5.0.2 so Safari/GitHub Pages cannot remain pinned to the broken 5.0.1 Engine PIN constant.

# Dark Sky 5.0.1 — Isolation Hardening

Second-pass audit of the 5.0 fleet boundary release.

- Removed the last unsafe Engine-entry cancel fallback that could expose Ike's customer shell without an explicit Project ID.
- Project Admin UI no longer changes to a Captain/Test Access message; project-admin authentication stays visibly independent.
- Reference-vessel rendering no longer substitutes the first fleet project if Ike's reference vessel is unavailable.
- Bumped runtime and service-worker cache references to 5.0.1.

# Dark Sky 5.0.0 — Fleet Boundary Spine

- Reworked cross-layer navigation so Project Experience, Project Admin, Engine, Engine Project Control, and Captain layers cannot remain visually active at the same time.
- Fixed the failure that allowed a Signal Restoration Project Admin gate to remain on screen while returning toward the Engine.
- Fixed Engine entry cleanup so the universal/Signal customer shell is hidden just like Ike, Mugs, and Flowers.
- Engine entry now clears active project identity before Engine rendering. The only project identity preserved during a cancelled Engine entry is an immutable return Project ID.
- Cancelling Engine entry re-enters that exact project through the canonical `enterProject()` route rather than rebuilding a partial shell.
- Retired the unsafe legacy generic Company/Admin shortcut that could click Ike's admin button without an explicit Project ID.
- Project Admin PIN gates now carry the Project ID that launched them and fail closed if the active project changes before unlock.
- Added boundary guards to protected Admin, Orders, Ledger, status-update, and async admin-render paths.
- Converted Project Manager status controls and filters to the project's own workflow contract instead of global/Ike defaults.
- Added runtime isolation snapshot/verification diagnostics for Sea Trial and regression work.
- Removed unused legacy BOR logo artwork while retaining the historical internal Signal Project ID for continuity.
- Bumped all runtime/cache references to 5.0.0.

# Dark Sky 4.9.7 — Fleet Project Admin Authentication Spine

- Fixed the actual failure mode behind the Project Admin PIN screen: the gear/settings route was bound early, but the **UNLOCK ADMIN** handler was still bound late inside the full application event setup. If initialization stalled before that point, the gate appeared correctly while the button was effectively dead.
- Added an early, storage-independent Project Admin authentication spine bound before IndexedDB and migrations.
- `4353` is a hard fleet invariant and always unlocks Project Admin for every current/future project, independent of stale project settings, project-specific PINs, Test Experience, Private Preview, live deployment, or Captain/Test Access state.
- Deliberate project-specific PINs remain additional valid credentials; they can never replace or disable `4353`.
- Project Admin no longer bypasses its PIN merely because Captain Test Access is active. Captain/Test Access and Project Admin authentication are now explicitly separate authority layers.
- All Project Admin launch controls converge on the same route: Ike's admin control, Mugs, Becca's, Signal Restoration, universal/future project shells, Test Experience, preview, and live project shells.
- Enter-key submission and button submission now use the same verifier and same lockout state.
- A valid PIN is no longer reported as incorrect if a downstream workspace-render/storage error occurs after authentication.

# Dark Sky 4.9.7 — Project Access Contract + Show the Flag

- Makes `4353` the fleet-standard Project Admin PIN for every project unless that project has been deliberately given an override through protected project settings.
- Adds explicit override metadata so stale project-local PIN rows cannot silently defeat the fleet default.
- Performs a one-time fleet repair for existing projects and clears stale per-project lockout state when restoring the default.
- Improves Project Admin gate contrast and readability across project themes.
- Restores the approved Black Flag platform icon as the fixed bottom-right return control on customer, PIN gate, Project Manager, Orders, and Ledger project surfaces.
- Replaces the embedded return-control image with the canonical bundled Black Flag asset and bumps service-worker cache identity.

# Dark Sky 4.9.4 — Capability Authority + Project Manager Workspace

- Added a master project capability catalog with AVAILABLE vs FOUNDATION status.
- Added business-profile recommendations so each project starts with capabilities relevant to its business description.
- Added Project Control Center → Operate → Capabilities as the sole activation/deactivation authority.
- Added a Project Manager Workspace that reorganizes enabled capabilities into Jobs, Schedule, Customers, Field Documentation, Estimates, Team, Reports, Customer Experience, and System.
- Project managers can see/use enabled capabilities but cannot activate or deactivate them.
- Signal Restoration now defaults to restoration-focused capabilities: intake/status, customers/property, field documentation, crew/scheduling, insurance, estimates/authorizations, notes, and reporting.
- Signal Restoration visual-placement catalog is retained but moved behind an Advanced Visual Capability Library with No Visual Placement as the appropriate default.
- Preserved project isolation and test/private-preview contact safety boundaries.

# Dark Sky 4.9.3 — SIG Admin + Project Control Center Standard

## Signal Restoration repair
- Restores the Signal Restoration project-admin test baseline to the fleet-standard PIN `4353` once for this testing build, preventing stale project-local preview storage from blocking access.
- Keeps the repair project-scoped; other vessels' admin credentials are untouched.
- Adds a bundled fallback for the approved `signal_restoration_logo.png` on the project-admin gate when no project-local uploaded logo override exists.

## Project Control Center
- Adds an Overview-first Project Control Center to the protected project-admin experience.
- Adds project health, open workload, customer, recent-activity, isolation and system/build signals.
- Adds Signal Restoration-specific restoration operations, contact and Test/Private Preview safety status without leaking those business rules into other projects.
- Adapts quick stats to each project's workflow instead of assuming Ike-style production statuses.
- Preserves project-local orders, customers, settings, credentials and Test/Private Preview call restrictions.

# Dark Sky 4.9.2 — Signal Restoration Brand + Market Foundation

## Restoration project
- Rebrands the restoration vessel from the temporary Best Option/BOR concept to the original **Signal Restoration** brand.
- Uses the approved Signal Restoration logo asset.
- Project contact profile: `jdaniel318@gmail.com`, `804-317-3230`, `19600 Genito Rd`.
- Removes North Richmond / North Chesterfield positioning. Initial active market is Greater Richmond.
- Adds a project-local multi-market model so future Signal Restoration markets can have their own service area, phone, email, base address and deployment without creating cross-project data coupling.
- Keeps the legacy immutable project key internally for migration continuity; no BOR/Best Option identity is customer-facing.
- Request references now use the `SIG` prefix.

## Mobile + safety protections carried forward from 4.9.1
- Test/Private Preview call actions remain non-live and cannot place a real phone call.
- Live deployments use the new Signal Restoration number only.
- iPhone Engine keyboard scrolling and project-rail vertical gesture fixes are preserved.
- Dark Sky test navigation remains de-emphasized on mobile and can be removed entirely for standalone live deployments.

## Isolation
- Existing vessel definitions and Captain’s Quarters assets are not rebranded or modified by Signal Restoration.
- Signal Restoration brand/market migration updates only its canonical project row.

## 5.5.0 — Fleet Customer Experience Hardening
- Added a fleet-wide fresh-entry viewport contract: every project, Private Preview, Test Experience, and Home entry resets to the top of that project's landing page, including iOS Safari nested/document scroll recovery.
- Applied Legacy Plumbing lessons as reusable principles rather than shared project state: confidence-first entry, clear primary action, business-appropriate categories, guided intake, required transactional email, mobile-first behavior, and project-owned visual identity.
- Added a dedicated Signal Restoration confidence-first landing page before damage intake; the existing damage workflow remains behind `I NEED HELP NOW`.
- Signal Restoration email is now required and validated for requests.
- Mugs After Dark and Becca's Bloom Shop now require and validate email before transactional review/submission, matching the fleet transactional-contact contract.
- Preserved strict Project ID isolation and the authority spine: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

## 5.6.2 — Fleet Cleanup Pass
- Tightened Project Command cards without removing project state, next action, Client Preview, Control Center, Internal Test, or Seaworthiness.
- Consolidated repeated deployment/governance chrome into one compact project-status line.
- Consolidated project activity into a compact three-metric strip.
- Reduced card height so more of the fleet is visible at once on iPad and desktop; preserved swipeable single-card behavior on phones.
- Removed superseded one-off audit documents from the deployable package. Canonical architecture, commissioning, isolation, mobile contract, regression, changelog, and README documents remain.
- No changes to the authority spine or Client Preview invite security.

## 5.7.3 Engine entry stabilization
- Black Flag 5615 is treated as a pre-storage entry invariant.
- The Engine transition is atomic: all project/customer/admin surfaces are hidden before the PIN cover is removed, preventing legacy Ike/project flashes.
- A secondary initialization or migration failure no longer revokes an already-authenticated Engine session or reopens the PIN gate.
- Engine render warnings remain visible/recoverable without silently locking the Captain back out.

## 5.7.8 — Bulkhead
- Added a pre-paint Client Preview isolation bulkhead so sealed preview links cannot expose the default Ike customer shell for even one frame while Safari/JavaScript starts.
- Client Preview now routes before IndexedDB, fleet migrations, bundled-project materialization, or project restoration. The sealed invite snapshot is the only project allowed to enter that runtime.
- The Black Flag portal no longer removes the boot lock while a Client Preview hash is waiting to route.
- Client Preview first paint is now the preview PIN gate; project/customer content is revealed only after that gate is installed and the invite PIN is accepted.
- Expanded the preview boundary clear to include customer shells, project admin surfaces, Engine controls, owner surfaces, Captain surfaces, Test Deck, and return controls.
- No changes to Project Admin 4353, Black Flag 5615, Captain's Quarters 19613, or unique Client Preview PIN generation.

## 6.0.3 — Helm Fix
- Fixed Captain's Quarters falling back to the legacy cabin when the cinematic background asset had not loaded yet in Safari.
- The responsive Helm UI is now the deterministic Captain's Quarters surface; image loading only affects background quality, never interface selection.
- Added the clean Captain room asset to the service-worker pre-cache for more reliable iPad/iPhone loading.
- If the preferred room asset fails, Helm remains active and falls back to the existing Captain cinematic background instead of exposing the legacy Captain UI.

## Dark Sky 6.0.3 — Gangway
- Captain's Quarters now has one permanent, high-contrast Return to Engine control rendered outside the cinematic Captain DOM so artwork and Captain subviews cannot cover it.
- The Captain exit closes every Captain-only subview and returns to the Engine top without requiring a new Engine login while the current Engine session remains active.
- Escape key also returns an authorized Captain session to Engine as a secondary accessibility/safety path.
- Black Flag authentication, Client Preview, project routing, and project isolation were not changed.
