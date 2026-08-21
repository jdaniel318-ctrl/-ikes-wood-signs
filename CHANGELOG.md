# Dark Sky 5.6.0 — Client Preview + Project Command Tightening

- Added a project-scoped **Client Preview** mode for customer demonstrations before publication.
- Client Preview uses a unique 4–10 digit preview PIN and a sealed, self-contained URL-fragment payload representing one project revision.
- Client Preview exposes no Engine Room, Captain, Project Admin, Test Deck, or other fleet controls.
- Client Preview always runs under preview/test contact safety: calls, email, SMS, payments, notifications, and real submissions remain blocked/simulated.
- Preview links carry an expiration date and revision fingerprint.
- Project Command cards were tightened: one primary lifecycle action, one prominent Client Preview action, and internal tools collapsed under Project Tools.
- Portable project graphics are included only when small enough for a cross-device link; source-site/public project assets remain available through the project snapshot.
- Preserved authority spine: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# Dark Sky 5.6.0 — iPhone Compatibility Hardening

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

## 5.6.0 — Fleet Customer Experience Hardening
- Added a fleet-wide fresh-entry viewport contract: every project, Private Preview, Test Experience, and Home entry resets to the top of that project's landing page, including iOS Safari nested/document scroll recovery.
- Applied Legacy Plumbing lessons as reusable principles rather than shared project state: confidence-first entry, clear primary action, business-appropriate categories, guided intake, required transactional email, mobile-first behavior, and project-owned visual identity.
- Added a dedicated Signal Restoration confidence-first landing page before damage intake; the existing damage workflow remains behind `I NEED HELP NOW`.
- Signal Restoration email is now required and validated for requests.
- Mugs After Dark and Becca's Bloom Shop now require and validate email before transactional review/submission, matching the fleet transactional-contact contract.
- Preserved strict Project ID isolation and the authority spine: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.
