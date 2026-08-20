# 4.9.7 Fleet Project Admin Authentication Regression

Required invariants:
- `verifyProjectAdminPin('4353', <any project id>)` succeeds before any project-specific settings lookup is required.
- Project Admin unlock is event-delegated and bound in `init()` before storage/migrations.
- Test Access does not bypass Project Admin authentication.
- Captain authority is not read by Project Admin PIN verification.
- Every settings launcher (`#adminBtn`, `#mugsAdminBtn`, `#flowersAdminBtn`, `[data-project-settings-launch]`) converges on `openProjectSettingsFromCustomer()`.
- No second late `#unlockAdminBtn` authentication handler exists.
- Project-specific PINs are optional additional credentials; fleet PIN `4353` remains valid.

# Dark Sky 4.9.1 Regression Audit

## Protected surfaces
- Captain’s Quarters controller: unchanged from 4.9.0.
- Platform core, V4 platform contract, and platform identity modules: unchanged from 4.9.0.
- Existing fleet project definitions remain in place.
- BOR keeps Project ID `bor-north-richmond` and cross-project access deny semantics.

## Intended change surface
- BOR renderer and BOR-scoped styling.
- Shared mobile CSS only for Engine login viewport scrolling and Project Command gesture handling.
- Experience Test Deck mobile presentation for BOR test mode.
- Build/cache references.

## Safety checks
- Test BOR calling: rendered as buttons, not `tel:` anchors.
- Live BOR calling: rendered as `tel:` anchors.
- JavaScript syntax checked with Node.
- ZIP integrity checked before release.

## 4.9.4 Capability Authority + Manager Workspace
- PASS: JavaScript syntax checks for app.js, platform_core.js, platform_v4.js, captain.js.
- PASS: protected DOM IDs remain unique; Engine, Project Control, Admin, Orders, and Ledger shells each occur exactly once.
- PASS: capability activation UI exists only in Project Control Center → Operate → Capabilities.
- PASS: Project Manager Workspace renders enabled capabilities as operational areas and provides no capability activation controls.
- PASS: Signal Restoration default capability set is restoration-focused and project-scoped.
- PASS: Signal Restoration visual-placement library remains available but is demoted to an Advanced Visual Capability Library.
- PASS: existing Signal Restoration test/private-preview contact safety logic remains unchanged.

## 4.9.7 Project Admin Access + Navigation Repair
- Verified fleet default project PIN contract: 4353 unless deliberately overridden in protected project settings.
- Verified canonical Black Flag return control remains visible on project customer, PIN, admin, orders, and ledger surfaces.
- Verified Project Admin gate contrast overrides remain project-branded but readable.
