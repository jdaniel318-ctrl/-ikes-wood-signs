# Dark Sky 5.8.9 — Pocket Fleet

Pocket Fleet finishing pass: customer-site polish, reusable trust/process graphics, clean footer termination, compact internal test navigation, and preserved fleet contracts.

Repeatable fleet capability release. Engine foundations now become explicit project next steps, with a Fleet Command shipyard queue and project-scoped preparation contract. Dark Sky remains the permanent platform home and Black Flag remains the Engine authority.

Fleet polish release. Dark Sky is the permanent platform home, Black Flag remains the Engine, and every internal project/commissioning route has a reliable return to Dark Sky. Customer/client-preview isolation remains intact.

# Dark Sky 5.7.8

Dark Sky is once again the platform-first landing experience. A fresh root visit opens Dark Sky, and Black Flag is entered as the protected Engine beneath it. Client Preview links remain direct customer routes and do not expose platform or Engine controls.

# Dark Sky 5.7.4

Dark Sky 5.7.4 is the Engine-entry recovery release. It adds a first-light authentication path for the canonical Black Flag PIN `5615` so Engine access does not depend on secondary startup modules, storage migrations, or stale browser application state. It also refreshes the service-worker cache identity and preserves the existing project-isolation and authority contracts.

Dark Sky 5.7.3 was the cloud-readiness and portability hardening release. It keeps the current static/browser fleet fully testable while making the future migration contract explicit: source code is recoverable from version control, devices are clients rather than authoritative data stores, routing remains host/domain agnostic, and future production data/assets are expected to move to managed cloud storage without rewriting customer experiences.

## Standing authority and safety contracts

- **Project Admin:** `4353` fleet default/recovery credential.
- **Black Flag / Engine Room:** `5615` normal Engine credential.
- **Captain's Quarters:** `19613`.
- **Client Preview:** unique invite-specific PIN; never one of the authority credentials.
- **Test / Private Preview:** real calls, texts, emails, payments, notifications, and external submissions remain blocked/simulated.
- **Project isolation:** customer, order, asset, configuration, admin, lifecycle, and preview state remain scoped to the exact Project ID.

## Cloud-readiness direction

The current iPad/iPhone/kiosk experiences remain first-class clients. GitHub Pages can continue serving the test build, but no future production architecture should require a particular device, repository path, registrar, or hosting vendor. See `CLOUD_READINESS.md` and `DEPLOYMENT_MANIFEST.json`.

## Recovery principle

Losing a device must never mean losing Dark Sky. Code recovery, production-data recovery, asset recovery, and deployment rollback are separate responsibilities and must each have a durable path before Live customer data is entrusted to the platform.

# Dark Sky 5.3.2

- Accepted business-intake evidence now compiles into a runnable, project-scoped customer configuration instead of remaining advisory only.
- Plumbing intake creates a confidence-first landing page, plumbing-specific service categories, required email/contact capture, and a universal service-request workflow.
- Existing commissioned plumbing projects with intake evidence are upgraded deterministically at read time, so Preview is available without recreating the vessel.
- Project IDs, assets, orders, admin state, and runtime context remain isolated; the compiler never borrows another project's state.
- Authority spine unchanged: Project Admin 4353, Black Flag 5615, Captain's Quarters 19613.

# Dark Sky 5.3.0

5.3.0 turns Existing Business Intake into a guided onboarding experience. Website import is now the recommended path, with direct public-site reading first and a public-site text reader fallback when browser CORS blocks the business website. Uploads remain a separate local-evidence path, and manual Business Brief entry remains a first-class option. The intake UI now explains the three paths clearly, provides friendly failure states, and keeps every recommendation editable and project-scoped.

The authority spine is unchanged: Project Admin 4353, Black Flag Engine 5615, Captain's Quarters 19613. No customer, project, asset, or admin state is shared across Project IDs.

# Dark Sky 5.2.0

5.2.0 strengthens the Black Flag Engine command hierarchy without changing the authority spine. Commission New Project is now a first-class Engine action, Project Command cards emphasize one next best move, Seaworthiness is framed as proof/release review for vessels already in the fleet, and the Experience Test Deck explicitly shows Configure → Preview → Approve as the internal work inside the high-level Prepare stage.

Project Control headers now use a protected shared chassis with project-owned graphics and business-category styling. Project assets remain scoped to the exact Project ID; artwork cannot own or move navigation/control hit areas.

Authority remains Project Admin 4353 • Black Flag Engine 5615 • Captain's Quarters 19613.

# Dark Sky 5.1.0

5.1.0 adds the first Existing Business Intake / Fleet Learning commissioning workflow. Black Flag can analyze a current business from an accessible website or uploaded HTML/text site files, propose a business model, opportunity scan and project-specific visual directions, then let the Captain accept or change every recommendation before commissioning. Imported evidence is stored only inside that Project ID; fleet learning is pattern guidance, not cross-project data sharing.

Black Flag authentication structure restored after the 5.0 cleanup regression. Normal Engine access uses `5615`; Project Admin uses `4353`; Captain's Quarters uses `19613`; Captain Test Access remains a session-only bypass. Project isolation work from 5.0 remains in place.

5.1.0 begins the reversible Engine commissioning model: Configure → Preview → Approve → Sea Trial → Ready → Live. The lifecycle exists only in Black Flag Engine governance; customer and Project Manager layers do not own it. Returning to configuration preserves project identity and data, while customer-facing changes automatically stale downstream preview/approval/Sea Trial evidence until retested.

# Dark Sky 5.0.3 — Authority Spine + SIG Test Release

This release finishes the 5.0 authentication correction before Signal Restoration sea trials. The authority layers are deliberately different and must not bleed into one another:

- **Project Admin:** `4353` fleet default/recovery credential. A project may add its own scoped PIN, but 4353 remains valid at the project-admin layer.
- **Black Flag / Engine Room:** `5615` during normal operation. Historical `enginePin` storage is ignored so project PINs, migrations, or stale builds cannot redefine Black Flag.
- **Captain's Quarters:** `19613`. Captain authority remains separate from both Engine and project administration.
- **Captain Test Access:** session-only bypass for Engine PIN entry after it is deliberately enabled with both the Engine and Captain credentials. It does not change any PIN and does not bypass Project Admin.

## Stable spine, flexible modules

Dark Sky 5.0 treats authentication, immutable Project ID, project namespaces, layer transitions, permissions, and routing as the stable spine. Business capabilities, manager workspaces, layouts, workflows, and project experiences remain flexible modules inside those boundaries.

## Isolation contract

One project may never inherit another project's UI, admin state, data context, branding, settings, orders, media, or navigation state. Project identity is always resolved by immutable Project ID. Engine project selection is not a customer/admin project session. Crossing into Black Flag clears project-owned surfaces before Engine rendering.

## Signal Restoration test target

The immediate sea-trial path is: Signal Restoration → Project Admin (`4353`) → Project Manager Workspace → Black Flag → Engine (`5615`, unless Captain Test Access is already active) → return/select projects without cross-project carryover.


Key 5.0 changes:
- Added a single Fleet Boundary Spine for transitions between Project Experience, Project Admin, Black Flag Engine, Project Control, and Captain authority.
- Returning to Black Flag now clears every project customer/admin surface before the Engine gate appears.
- Engine unlock now hides Ike, Mugs, Flowers, Signal/universal, PIN, Admin, Orders, Ledger, and owner surfaces before rendering the Engine.
- The previous generic company/admin shortcut that could implicitly fall back to Ike is retired. Project Admin must originate from an explicit project.
- Project Admin gates are stamped with the immutable Project ID that opened them; unlock fails closed if project context changes.
- Project-manager order workflows now use each project's own workflow instead of Ike/global status defaults.
- Async order/admin operations capture and re-check their Project ID before committing UI or data changes.
- Added runtime isolation diagnostics (`darkSkyIsolationSnapshot()` / `darkSkyVerifyIsolation()`) for future Sea Trials.
- Removed the unused legacy Best Option Restoration logo asset; the internal legacy Signal project ID is retained only for data continuity.

# Dark Sky v4.9.7 — Fleet Project Admin Authentication Spine

This release repairs Project Admin authentication at the routing/event layer. The fleet-wide Project Admin default/recovery PIN is **4353** across test, preview, and live project shells. Captain/Test Access cannot override or suppress that credential.

# Dark Sky v4.9.7 — Project Access Contract + Show the Flag

This build standardizes Project Admin access across the fleet: PIN `4353` is the default for every project unless deliberately overridden inside that project. It also repairs Project Admin gate readability and guarantees the canonical Black Flag return mark remains visible on project-owned customer and protected screens.

# Dark Sky v4.9.4 — Capability Authority + Project Manager Workspace

This build separates the Dark Sky master capability library from project authorization and project-manager operations. Capabilities are enabled only in each Project Control Center, while the Project Manager Workspace presents the enabled set in business-specific operational groups. Signal Restoration is the proving ground and now prioritizes restoration operations while keeping visual-placement tooling as an advanced option.

## Client Preview

From Project Command, use **Client Preview** to create a clean unpublished customer-facing link. Create a unique preview PIN, choose an expiration window, generate the link, and share the PIN separately. Client Preview cannot call, email, text, submit to the real business, take payments, or expose Engine/Captain/Project Admin controls.

## 5.7.3 Engine entry stabilization
- Black Flag 5615 is treated as a pre-storage entry invariant.
- The Engine transition is atomic: all project/customer/admin surfaces are hidden before the PIN cover is removed, preventing legacy Ike/project flashes.
- A secondary initialization or migration failure no longer revokes an already-authenticated Engine session or reopens the PIN gate.
- Engine render warnings remain visible/recoverable without silently locking the Captain back out.
