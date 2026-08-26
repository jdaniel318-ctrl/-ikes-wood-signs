# Dark Sky 8.0.8 — Yardarm — Root Keel

- Flattened all current release media to repository root so iPad GitHub web upload cannot silently omit nested assets.
- Removed Admiral/Captain/project visual assets from Engine first-paint hard requirements.
- Missing route imagery can no longer sink Black Flag Engine.
- Preserved atomic no-store executable snapshot, stable service-worker sentinel URL, and release-seal identity.
- Added root-upload-safe inventory and packaging audit.

# Dark Sky 8.0.8 — Yardarm Admiral Seal

- Removed service-worker executable caching/fetch interception.
- Added complete runtime/asset no-store preflight.
- Executes exact verified JS/CSS bytes from one in-memory snapshot.
- Added active service-worker identity sentinel.
- Hardened Clean Release Retry with visible durable stages.
- Added Admiral Release Bulkhead contract and runtime inventory.

# 8.0.8 — Yardarm One-Build Recovery Hardening

- Fixed Clean Release Retry after stale-worker removal: a missing registration is now the expected state and triggers a fresh `./sw.js` registration instead of an invalid update call.
- Service-worker URL is stable across releases; build/seal identity is verified inside the active worker.
- Clean Release Retry now shows durable step-by-step progress and disables actions while the recovery transaction runs.
- Removed the unsafe “reload without cleanup” bypass; Retry Verification always re-runs the same release gate.
- Cleanup is scoped to this app’s service worker and Dark Sky application caches; project data is preserved.
- Added package-completeness requirement to the Single-Build Release Contract.

# 8.0.8 — Yardarm Single-Build Seal

- Added a unique release seal to defeat stale same-version Safari/service-worker runtime keys.
- Engine runtime scripts are not executed until manifest build, `app.js` BUILD_VERSION, service-worker build, and release seal agree.
- Mixed builds now stop at an explicit **MIXED BUILD DETECTED** surface before Engine paint.
- Clean Release Retry removes only service-worker registrations and Dark Sky/Black Flag application caches; project/order/customer data is not deleted.
- Service-worker install is atomic: missing core runtime files fail installation instead of creating a partial cache.
- All executable requests share the same release seal and use no-store/network-first verification.
- This is still semantic build **8.0.8 Yardarm**; the seal repairs deployment identity without creating a second build.

# 8.0.8 — Yardarm

- Replaces the nominal-width Rangefinder estimate with inventory-constrained aspect-ratio classification for Ike's 2/4/6 ft rack lengths.
- Adds calibrated core bands, overlap zones, framing checks, long-axis stability, and boundary-distance gating.
- Allows a strong one-photo 2 ft classification when pixel geometry is safely separated from longer-stock alternatives.
- Persists ratio/band/boundary evidence and keeps Ike visual production review for pixel-derived lengths.
- Preserves Visual Helm rotation from the untouched source image, photo-top authority, lettering behavior, species sanity checks, owner pricing, and fleet isolation.

# 8.0.7 — Visual Helm

**R1 pre-sea-trial audit:** repeated photo rotation now always renders from the untouched source image to prevent cumulative JPEG degradation; rotation taps are serialized; deployment focus/checksums were reconciled.

- Photo review now owns orientation: repeatable quarter-turn rotation, top-of-photo authority, and no normal Ike TOP button matrix.
- Camera forward action moved to the right.
- Added orientation-aware vertical-board text layout.
- Reworked Ike lettering library around real sign references: Bold Block, Tall Western, and Classic Serif.
- Added transient media stewardship: secondary verification photos are not persisted inside completed order records.
- Preserves Rangefinder visual length evidence and Ike visual-rejection authority.

# Dark Sky Changelog

## 8.0.6 — Rangefinder
- Adds inventory-constrained pixel ranging for Ike's 2/4/6 ft stock lengths.
- Allows a clearly separated one-photo length candidate to unlock pricing while retaining owner visual verification.
- Stores pixel evidence in the order pricing proof for audit/review.
- Adds owner-side Visual Length Check flag before production.
- Preserves Sentry species/orientation sanity gates and Owner Bridge authority boundaries.

# Dark Sky 8.0.6 — Rangefinder

- Rebuilt plank segmentation to retain pale sapwood and reduce false component geometry.
- Added PCA long-axis orientation with contradiction guards.
- Added species plausibility/contradiction scoring and top-vs-runner-up margin.
- Final confirmation now requires orientation + species + length + active rate to be resolved.
- Preserved Owner Bridge, canonical fleet registry, clean Engine boot, and confidence-aware progressive verification.

# Dark Sky 8.0.4 — Lookout

- Calibrated species confidence using diagnostic feature agreement instead of a blanket threshold reduction.
- Added one-photo high-confidence resolution for genuinely distinctive species such as cedar when multiple clues agree.
- Tuned known-rack-length confidence using framing and separation from alternate stock lengths.
- Changed the customer verification sequence to request one better full-plank photo first when both species and length need help.
- Reuses that second full-plank photo as species evidence before asking for a specialized grain photo.
- Preserves Owner Bridge, canonical six-vessel registry, authority isolation, and no-guess pricing.

# Dark Sky 8.0.2 — Grain Guard

- Aligns Ike customer runtime with the Owner Control Center’s six priced species: Pine, Cedar, Red Oak, White Oak, Walnut, and Hickory.
- Replaces one-photo species guessing with conservative confidence-aware evidence.
- Adds a positive second-photo request when visual evidence is not strong enough.
- Treats Oak as a family-level result until Red Oak vs White Oak is explicitly resolved.
- Never calculates a customer price until species is resolved, length is confirmed, and an active owner rate exists.
- Combines two photo observations; disagreements fall back to customer rack-species confirmation instead of a fabricated match.
- Preserves Owner Bridge session durability, canonical six-vessel fleet identity, clean Engine boot, and authority isolation.
- Adds the Grain Guard contract and updates release identity/checksums for the 8.0.2 candidate.

# Dark Sky 8.0.0 — Breakwater

- Established an immediate owner-safe shell for Owner / Partner handoff.
- Hardened owner failures so Black Flag authority and unrelated project surfaces remain sealed.
- Added owner handoff and service-worker navigation-cache protections before the Grain Guard standalone split.

# Dark Sky 7.9.6 — Harbor Pilot

- Deterministic Engine first paint: Engine Access releases on DOM ready without waiting on secondary startup work.
- Removed recursive protected-route retry loop that could leave Securing Route visible forever.
- Added bounded Owner/Preview recovery surface with explicit retry or Engine Access exit.
- Engine transitions clear stale owner/client-preview hashes so refresh cannot misclassify an Engine screen as a protected project route.
- Preserves the Clean Wake no-cross-project-flash guarantee.

# Dark Sky 7.9.6 — Harbor Pilot

## First-paint isolation
- Adds a fleet-wide neutral first-paint bulkhead before any project DOM can paint.
- Resolves Engine, Owner/Partner, and Client Preview routes before removing the neutral shield.
- Prevents Ike’s or any other project identity from flashing during refresh, startup, authentication transitions, or route restoration.
- Engine gate and Owner/Preview surfaces explicitly release first paint only when their correct authority surface is ready.
- Preserves project isolation, owner session bulkheads, Fleet Dock, Test/Preview containment, and the 7.9.3 session fixes.

# Dark Sky 7.9.3 — Bulkhead

- Seals Owner/Partner session lifecycle away from Engine boot/auth: owner login, post-login render, refresh, and bookmark restore stay project-scoped.
- Removes Engine boot-lock classes whenever an owner surface is active so the authenticated Owner Control Center cannot render as a blank page.
- Owner-route startup hashes bypass the Black Flag Engine gate entirely; Engine credentials remain Captain-only.
- Advances fleet registry schema to 10 and groups the known Legacy Plumbing identity by approved display name + business family, so stale branding/contact mirrors cannot create a second vessel.
- Preserves project-scoped evidence during duplicate folding and keeps Fleet Dock/Test/Captain routes isolated.

# Dark Sky 7.9.2 — Watertight

- Sealed Owner / Partner entry as a project-scoped authority route; Fleet Dock owner access now opens the owner login directly and never requires the Black Flag Engine PIN.
- Changed durable owner bookmarks to canonical `index.html#owner-login=<project>` routes; legacy `owner.html` remains a compatibility redirect only.
- Advanced fleet registry schema to 9 and deterministically folds the known Legacy Plumbing duplicate even when stale contact mirrors disagree.
- Preserves conflicting contact values as reconciliation evidence rather than silently discarding them.
- Migrates project-scoped orders/settings/local references from the folded duplicate Project ID into the surviving canonical vessel.
- Preserves True Bearing Fleet Dock, search/filters, three-authority separation, Test mode, project isolation, and command-read protections.

# 7.9.1 — True Bearing

- Made Fleet Dock the primary scalable vessel navigator and redirected normal “Operate Projects” navigation there.
- Added Fleet Dock search plus Needs Attention, Owner Setup, Sea Trial, and Ready / Live filters.
- Separated the three authority routes (Customer, Owner / Partner, Captain) from Test / Preview safe mode.
- Made Owner Setup actionable: unconfigured owner routes open the project Access/Owner workstation; configured owner routes open the project-scoped owner entrance.
- Added approved canonical display-identity repair for Mugs After Dark while preserving its immutable legacy Project ID.
- Added strict duplicate-business reconciliation with maturity-based survivor selection, contact-conflict protection, project-scoped data/reference migration, and audited removal of folded registry rows.
- Reframed the older Project Command area as Advanced Project Command so it no longer competes with Fleet Dock as the normal navigation backbone.

# Dark Sky 7.9.0 — Fleet Spine

- Replaced the hard-coded Ike-only Seaworthiness shortcut with a dynamic Fleet Dock that scales across every registered vessel.
- Each Fleet Dock card exposes separate Customer, Owner / Partner, Test / Preview, and Captain Dock routes while preserving exact project isolation.
- Restored Ike artwork to the durable canonical `ike_character.jpg` path while preserving the approved teeth-only white correction; avoids introducing a fragile new runtime asset dependency.
- Private Preview and Sea Trial now rely on the explicit Return to Test Deck banner rather than the ambiguous floating Black Flag icon.
- Added deadline-bounded Engine command reads and explicit Engine-home refreshes for Broadside Status, Command Deck, and Fleet Dock so optional storage/integrity reads cannot leave primary command surfaces stuck on READING.
- Preserved 9/9 proving-ground voyage contracts, owner/partner isolation, project admin authority, and live customer cleanliness.

# 7.9.0 — Three Watch

- Establishes the reusable three-surface fleet architecture: Customer Experience, Owner / Partner Business Portal, and Black Flag / Captain governance.
- Adds a durable project-scoped `owner.html?project=<project-id>` entrance so owners can manage their vessel without Black Flag credentials.
- Adds an Engine-side Owner / Partner Access command for authorized setup and testing.
- Owner portals keep project-scoped operations, pricing, branding, reporting, devices, staff, and settings inside Black Flag-approved capability boundaries.
- Adds an owner Features module for safe project-scoped choices already approved by Black Flag; platform capabilities and security remain fleet-governed.
- Published public customer sessions remain business-only; Captain/operator entries retain an explicit Black Flag return control so browser Back/Refresh are never required for normal navigation.
- Preserves Ike’s owner-controlled species pricing, simple customer price presentation, Project Options access, and project isolation.

# 7.8.8 — Clear Deck

- Fleet-wide command/navigation affordance pass: actionable tabs and command-bar items now read unmistakably as buttons.
- Disabled capabilities remain visible but are clearly unavailable rather than looking like process-description text.
- Ike’s Project Options is enabled in Project Admin.
- Ike’s Project Options now includes private per-linear-foot wood-species pricing controls for Cedar, Pine, Oak, Walnut, and Other.
- Customer pricing remains simple; owner configuration stays in the background.

# 7.8.6 — Grain Compass

- Ike’s plank photo now suggests wood species inside the existing project-specific recognition lane.
- Ike’s owner Pricing module now controls per-linear-foot rates by species.
- Customer plank confirmation asks only for length; the configured species rate calculates and shows one straightforward price.
- Orders preserve species, length, owner rate, and calculated price as pricing proof.
- Species recognition remains assistive and project-scoped; owner pricing remains authoritative.

# 7.8.5 — Service Proof

- Strengthens Legacy Plumbing service-address capture with full-address validation before continuing.
- Adds explicit customer confirmation that the entered location is where the technician should be sent.
- Renames timing language to requested service window / requested timing and states that it is not a confirmed appointment.
- Carries the service address into the customer receipt and preserves all 7.8.4 Harbor Exit protections.

# Dark Sky 7.8.4 — Harbor Exit Workspace Return

- Safe Cleanup now has a direct inline iPad activation path, matching the successful Compact Diagnostics approach.
- First tap immediately changes the button to CONFIRM SAFE CLEANUP and displays CLEANUP ARMED.
- Removed the competing late cleanup click binding to prevent duplicate or swallowed activation.
- Cleanup remains constrained to positively identified stale Dark Sky application caches only.

# Dark Sky 7.8.2 — Harbor Exit Immediate Acknowledgement

- Compact Diagnostics now opens its modal immediately on tap, before Safari storage enumeration begins.
- The modal shows a visible read-only sounding state so a slow Safari storage API can no longer look like a dead button.
- Successful results replace the loading state inside the same modal; failures are also shown visibly in the modal.
- Removed the duplicate late-bound diagnostics click listener while preserving the storage-independent inline activation path.
- Added a re-entry guard so one tap cannot launch overlapping diagnostic soundings.
- Safe Cleanup remains separate and stale-cache-only.

# 7.8.1 — Harbor Exit
- Rebuilt Compact Diagnostics as a dedicated modal route so tapping it always creates an obvious visible state change on iPad.
- Added a dedicated diagnostics button instead of overloading Safe Cleanup when no stale cache exists.
- Added redundant direct and bound activation paths for iPad/Safari reliability.
- Diagnostics can perform its own read-only sounding if no current sounding is available.
- Safe Cleanup now stays a separate control and is disabled when there are no positively identified stale application caches.
- Preserved all protected storage boundaries and never classifies browser-managed/unattributed storage as disposable.

# 7.8.1 — Harbor Exit
- Fixed Compact Diagnostics so it opens a visible read-only diagnostic panel instead of behaving like a cleanup confirmation.
- Added deeper storage probes for Safari `usageDetails` when available, IndexedDB database catalog, service-worker registrations, SessionStorage, and Origin Private File System files.
- Added a Captain-readable explanation when Safari cannot expose the source of browser-managed / unattributed storage.
- Kept unattributed storage non-deletable unless Dark Sky can enumerate and prove ownership of it.
- Strengthened Storage Steward Voyage to require visible diagnostics, deep-probe wiring, and guarded stale-cache-only cleanup.
- Preserved 7.7.0 Deep Sounding storage breakdowns, 7.6.x session boundaries, Iron Hull fortification, and Iron Proof approved-artifact integrity.

## 7.8.1 — Harbor Exit

- Replaced generic non-live `TEST MODE` order confirmation text with exact `PRIVATE PREVIEW`, `TEST EXPERIENCE`, or fallback non-live session language.
- Private Preview receipt now states that no live order record was created.
- Strengthened Session Boundary Voyage so session-specific confirmation labeling is part of the required contract.
- Preserved True Bearing live/test/preview routing, Iron Hull fortification, Iron Proof approved artifacts, project isolation, and customer journey behavior.

## 7.6.0 — True Bearing
- Fix published **OPEN PROJECT** routing so a stale Test Experience context cannot force a live project into simulated TEST MODE.
- Add explicit customer session contexts: LIVE CUSTOMER, TEST EXPERIENCE, PRIVATE PREVIEW, CLIENT PREVIEW.
- Clear stale customer-session context at Engine boundaries.
- Separate Deployment / Readiness / Approval / Current Session in Project Control.
- Add Session Boundary Voyage to Fleet Proving Ground.
- Preserve Iron Hull fresh-build proof, Approved Artifact integrity, isolation, and test-safety contracts.


## 7.5.0 — Iron Hull
- Fortification and cleanup pass; no intentional customer-journey redesign.
- Adds automatic, build-scoped Proving Ground execution after Engine entry.
- Fresh proof evidence is timestamped, build-bound, and cannot inherit from older candidates.
- Safely trims obsolete application caches and stale proving evidence only.
- Preserves projects, orders, customers, approved artifacts, branding, settings, and recovery evidence.
- Keeps Approved Artifact, authority, isolation, staging safety, recovery, and Visual Forge contracts extensible for future improvement.
## 7.5.0 — Iron Proof

- Approval candidate artifact is rendered before approval and displayed directly on the approval screen.
- Customer approval adopts exact candidate PNG bytes; there is no approval-time re-render.
- Design mutations invalidate candidate + approved lock.
- Approved Artifact Voyage adds an automated synthetic artifact freeze/fingerprint/reuse check.
- Approved artifact export changes from JPEG to PNG.
- Proving Ground artifact voyage now requires both contract and automated proof checks.

## 7.3.0 — Plank Bond

- Flatten exact live Ike preview on approval and fingerprint the artifact.
- Block order creation if approved artifact integrity fails.
- Reuse the exact approved artifact across review, confirmation, admin, and archive.
- Record Ike canonical paper-form production rules as project-scoped production metadata.
- Surface 2/4/6 ft character limits, Other-color spray-paint note, and 7–10 day pickup expectation without inventing measurement capability.
- Keep Sounding Line recognition/placement work in Sea Trial.

## 7.3.0 — Plank Bond
- Freeze Ike approved preview at the approval checkpoint.
- Final review and confirmation consume the same locked visual artifact.
- Store approved-design lock metadata with the order.
- Invalidate the lock whenever design choices change.
- Add Approved Artifact Voyage to Fleet Proving Ground.

## 7.2.0 — Sounding Line
- Froze Ike's proven seven-step journey and targeted the preview-placement engine only.
- Added local plank contour segmentation using a largest connected component heuristic.
- Added an eroded usable-region pass and largest-safe-rectangle lettering zone.
- Applied detected lettering-zone placement to live design, approval, final review and customer-context previews.
- Added truthful cutout/edge avoidance Sea Trial state and reference-scale candidate detection without claiming physical measurement.
- Preserved 7.1.0 as Known Good until live proving/promotion.

## 7.1.0 — True Grain
- Refined Ike's proven seven-step customer flow after live voyage testing.
- Compacted in-flow customer header.
- Added honest recognition readiness + safe-margin/obstacle-avoidance scaffold.
- Reduced preview lettering width until real usable-area segmentation is proven.
- Enlarged lettering choices and marked required contact fields.
- Added Fleet Capability Candidate contract so project lessons promote through evidence rather than copy/paste.
- Preserved 6.9.1 as Known Good until live Proving Ground promotion.

## 7.0.0 — Plankwright
- Reworked Ike’s into a plank-first candidate journey without changing other project customer shells.
- Added Plank Recognition scaffolding with explicit calibration-required measurement state; no fabricated dimensions.
- Added unified Design Your Sign workspace for wording, lettering, finish/color, orientation, top marker, and live exact-plank preview.
- Added optional lettering-reference photo staging for the future Ike Lettering Library.
- Added explicit design approval checkpoint and compact Ike final review.
- Preserved 6.9.1 as Last Known Good until live Proving Ground promotion.

## 6.9.1 — Anchor Set


## 6.9.1 — Anchor Set
- Added the Fleet Proving Ground command surface: Status → priority → next best move, with six required non-destructive voyages and expandable evidence.
- Added deliberate Last Known Good promotion evidence; no automatic deployment or publishing.
- Applied fleet-learned customer-experience standards to Ike's without changing its project identity or sign workflow.
- Strengthened Ike's landing page around handmade/local trust, actual-plank photography, preview-before-order, and one clear DESIGN MY SIGN action.
- Preserved Black Flag 5615, Project Admin 4353, Captain 19613, provisional Admiral contract, Client Preview isolation, recovery, and contact-safety contracts.
# Dark Sky 6.8.0 — High Admiral's Wake

- Strengthened Admiral Gate repeat-entry ceremony to retain roughly two-thirds of the first-entry theatrical experience.
- Added a post-auth Admiral ascent curtain that uses the forged Admiral visual before either Ceremonial or Professional Mode settles in.
- Added longer gate light sweep, title reveal, seal pulse, and door choreography without changing PIN or authority behavior.
- Preserved Professional Mode, Fleet Readiness, recovery tools, Visual Forge, project isolation, Client Preview safety, and test/private contact blocking.
- Preserved reduced-motion behavior.

# Dark Sky 6.7.0 — Lantern Watch

- Focused Admiral Ceremonial Integration pass; no authority or routing changes.
- Raises exposure and color fidelity of Captain-forged Admiral visuals.
- Replaces broad full-screen dimming with protected-zone gradients behind live command rails and docks.
- Keeps the center Admiral gate / compass region nearly unobstructed.
- Softens live panel opacity while maintaining command readability.
- Professional Mode remains frozen and independent from ceremonial artwork.
- Preserves browser-local forged Admiral visual storage and the Gate + Deck pipeline.

# Dark Sky 6.6.0 — Sovereign Passage

- Completes the Visual Forge promise for Admiral ceremonial environments: installed art becomes the command environment, not wallpaper under a generic modal.
- Adds a real ceremonial command surface with live Fleet Readiness, vessel/sailing/Sea Trial counts, Recovery Snapshot, Readiness Report, Visual Forge, and explicitly FUTURE governance stations.
- Keeps Professional Mode visually and operationally separate from ceremonial art.
- Synchronizes readiness state across Ceremonial and Professional modes.
- Tightens Visual Forge into a two-pane iPad workspace with a compact sticky action dock.
- Preserves 4353 / 5615 / 19613 authority contracts, Client Preview isolation, test-contact safety, and project boundaries.

- Extended Captain first-entry and repeat threshold animation cadence by roughly 80%.
- Locked Captain’s Quarters to the Safari dynamic viewport and vignetted obsolete baked lower-HUD content.
- Extended Admiral Gate and Admiral Deck ceremonial transitions.
- Added a cinematic Admiral ceremonial environment with Professional Mode preserved.
- Added browser-local upper-command visual slots through Visual Forge; Admiral ceremonial visuals may be staged without changing authority state.
- Added `UPPER_COMMAND_THEATRE.md` as a reusable fleet capability contract.

# Dark Sky 6.3.0 — Ascension Watch

- Replaces the lower Captain command band with a persistent Captain's Helm rail; working, future, trial and unavailable functions remain visible and intentional.
- Adds live Fleet Readiness at the Captain's Helm so the path toward Admiral is proven through command.
- Restores a short theatrical repeat entrance for Captain's Quarters while preserving the fuller first-session entrance and reduced-motion support.
- Strengthens Admiral's Gate with a ceremonial first ascent and shortened repeat entry.
- Adds Admiral's Deck Ceremonial mode (default) plus Professional mode with a persistent preference; modes do not change authority or fleet data.
- Keeps Visual Forge available to both Captain and Admiral at their respective authority layers.
- Preserves Black Flag 5615, Project Admin 4353, Captain 19613, temporary Admiral 19613, unique Client Preview PINs, isolation, recovery and test-contact safety.

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

# Dark Sky 5.7.8 — Breakwater

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

## 7.9.6 — Harbor Pilot
- Bounded the neutral first-paint route resolver so `Securing Route` cannot hang indefinitely.
- Default Engine routes reveal the neutral Black Flag Engine gate as soon as the DOM is ready, independent of secondary application boot.
- Owner/Partner and Client Preview routes retain project-safe first paint and gain an explicit neutral recovery state if route resolution misses its deadline.
- Preserved the 7.9.4 no-cross-project-flash guarantee.

## 8.0.2 — Breakwater
- Promoted Owner/Partner routing to an immediate first-class authority shell.
- Removed full fleet/database initialization from the critical owner first-paint path.
- Added owner-safe hydration and owner-safe boot failure handling.
- Preserved Keelson canonical six-vessel roster, True Helm Engine precedence, and no-cross-project-flash protection.


## 8.0.2 Breakwater R1 — pre-upload audit
- Corrected the service-worker cache identity from the stale 7.9.8 Keelson cache name to a unique Breakwater R1 cache.
- Fixed navigation caching so `owner.html` can never overwrite the cached `index.html` Engine entrypoint.
- Added `owner.html` to the deployment manifest's required runtime files.
- Preserved the Breakwater owner handoff, canonical six-vessel fleet, no-cross-project first paint, and bounded recovery contracts.
