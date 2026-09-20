# Dark Sky 8.8.15.9 — Report Proof

Report Proof makes the two-stage Admiral boundary unmistakable. The passage PIN completes layer one; a separate full-screen Supabase Admiral account gate completes layer two. Until both checks pass, My Fleet, Refresh Watch, vessel counts, reports, and all other Admiral work controls remain hidden.

This is a presentation and fail-closed routing hardening. It does not weaken the existing server authority check or turn an owner identity into an Admiral. A failed, expired, signed-out, or project-owner-only session stays at the airlock and receives no fleet view.

Fleet Core server posture remains complete without inventing owners. All six canonical vessels have a neutral `fleet_business_settings` record in Supabase; outside-owner authority still requires a real Auth identity and exact `project_owner` membership.

The authenticated Admiral Fleet Spine now reports registry, settings, owner identity, membership, orders, and vessel-report posture together. My Fleet presents those facts read-only as **Owner Ready**, **Fleet Seeded**, **Owner Attention**, or **Registry Only**. Fleet Seeded is deliberately not ownership: no invitation, credential, membership, business fact, publication, or authority is created by the seed.

The two server mutation commands for commissioning and release assignment now repeat the active-Admiral check at their own boundary before preview or write. Existing exact-vessel RLS/RPC isolation, Recovery Helm, Truth Signal, and the local recovery bridge remain aboard.

## Quick Report Proof check

1. Enter the Admiral Passage PIN and open **Admiral My Fleet**.
2. Confirm only **Admiral Security Layer** appears, with **01 Passage PIN — Verified**, **02 Admiral Account — Required**, and **03 Fleet Workspace — Locked**.
3. Confirm no Refresh Watch, vessel counts, reports, search, filters, or vessel cards are visible.
4. Try an Owner account and confirm the airlock stays closed with no fleet data exposed.
5. Sign in with the dedicated Supabase Admiral account and confirm the full My Fleet workspace appears only after server verification.
6. Confirm the server-posture strip shows 6 registered and 6 settings-seeded vessels, then verify exact-vessel cards still match Supabase.
7. Tap **Sign Out** and confirm the workspace disappears immediately and the second security layer returns.

## Preserved Recovery Helm

Recovery Helm closes the field-confirmed forgotten-password gap on every Owner Entrance. Supabase-backed owners receive a privacy-preserving recovery email; provisional/local owners receive an exact-vessel Project Admin recovery screen with retry lockout, password confirmation, and a durable success state.

Recovery changes only the selected vessel's owner credential. It never grants Engine, Captain, Admiral, ownership, or Fleet Watch reporting authority. The Truth Signal contract remains intact: a live Supabase `project_owner` membership is still required before an Owner Control Center can publish operational truth.

The **Fleet Launch Service** introduced in Launch Harbor remains intact: Founder Preview → Owner Review → Prepare → Private Preview → Sea Trial → Owner Handoff → Launch. It remains advisory and free by default, grants no equity or credentials, retains the outside owner, and never publishes automatically.

## Quick Recovery Helm check

1. Open Legacy Plumbing → **Owner Entrance** and confirm **Forgot Password?** is visible.
2. Tap it and confirm the exact-vessel recovery screen names Legacy Plumbing and explains the authority boundary.
3. Enter the owner login, Project Admin recovery PIN, and a new password of at least 10 characters twice.
4. Confirm the durable **Password reset complete for this business only** result.
5. Sign in with the new password and confirm Legacy Plumbing opens without exposing Engine or Admiral controls.
6. Open **Fleet Report** and confirm local recovery remains view-only until a Supabase owner membership is commissioned.
7. Return to Engine, open Ike's live owner recovery, and confirm email recovery still uses the private non-enumerating message.

## Preserved Admiral Passage check

1. Open **Commission New Project**, enter **Crossroads Pizza**, and press **Continue** once.
2. Confirm Step 2 **Import / Model** opens without a quota error.
3. Press **Save Draft** and confirm the status says **SESSION SAFE** if Safari's legacy storage is full.
4. Move Back and Continue again; confirm the name remains and navigation still advances.
5. Continue through Access & Services. Confirm Owner Portal starts at **Prepare Later**, tap it twice, and verify both states persist without a page jump.
6. Leave it at **Prepare Later**, continue to Review, and confirm **OWNER HANDOFF — CONFIGURE LATER** with no validation error.
7. Enter Admiral's Gate, open Promote, and confirm the four-step Admiral Passage is visible. Run Fleet Readiness; rank still requires authenticated server authority.

# Dark Sky 8.8.14.6 — Full Frame

Full Frame repairs the two field-confirmed defects in Legacy Plumbing's private review: the preview could invalidate its own evidence because derived timestamps changed the revision hash, and the iPad opening composition clipped the header while its fixed controls covered page content.

Revision evidence now hashes stable customer-facing values rather than normalization timestamps. The iPad landscape preview uses a compact, top-reset composition with a complete header, reduced hero, reserved bottom space, and separated return/safety controls. Approval remains deliberate and Sadie remains in Sea Trial.

## Quick Full Frame check

1. Open Legacy Plumbing → Experience → Customer Experience → **Preview & Review**.
2. Tap **Open Private Preview** and confirm the full header plus bottom return/safety controls are visible together without overlap.
3. Tap **Return to Test Deck** without submitting a request.
4. Confirm the current revision is unchanged and **Approve Experience** is enabled. Stop before approval; Sadie must remain in Sea Trial.

# Dark Sky 8.8.14.0 — Fleet Ready

Fleet Ready turns the Captain’s verified fleet picture into an exact operating course. The scoped Signal Report now separates vessel lifecycle, owner posture, current outpost evidence, the next required step, and the authorized Engine route.

For a Sea Trial such as Legacy Plumbing’s Sadie outpost, the Captain can now see whether the customer test is recorded, whether experience approval is current, what remains before Live, and a route labeled for the actual task. Device lock is described as a **Before Live** requirement during Sea Trial instead of appearing as an unexplained current fault. Opening the route visibly changes to **Routing…** before Project Control opens the exact selected outpost.

Fleet Ready never promotes or activates automatically. It does not claim owner access, generate invitations, change deployment state, approve an experience, or weaken authentication. All consequential actions remain inside the existing exact-vessel Project Control boundary.

## Fleet Ready proof circuit

1. Open Captain Watch and run Fleet Readiness.
2. Open Legacy Plumbing’s exact course and confirm the report shows lifecycle, owner posture, Sadie, the next step, and the Before Live device requirement.
3. Tap the exact route once and confirm its visible **Routing…** acknowledgement.
4. Confirm Project Control opens Legacy Plumbing → Deployments with Sadie selected.
5. Stop before activation unless the Captain deliberately chooses to complete that separate operation.

# Dark Sky 8.8.13.14 — Night Watch

Night Watch is the field-learning release. It preserves every route proven on iPad tonight—exact Customer Experience passage, storage-independent return to the order, Captain Fleet Readiness, and the lifted exact-vessel Signal Report—then hardens the feedback and return seams around them.

Captain subviews now remember the control that opened them, move focus into the visible command surface, and return focus to the originating control when closed. The Signal Report announces that exact-vessel scope is confirmed and provides an immediate visual acknowledgement instead of relying on a background state change. Touch feedback is explicit, overscroll is contained inside the chart, and reduced-motion preferences are honored.

These are navigation, presentation, and accessibility safeguards only. Night Watch does not alter fleet evidence, readiness predicates, watch counts, project records, deployment state, authentication, owner identity, authority, or vessel isolation.

## Night Watch proof circuit

1. From Operate Vessels, open Customer Experience for Signal Restoration, Ike's Wood Signs, and Legacy Plumbing; confirm each exact brand and correct live/private posture.
2. On a customer surface, open Project Admin and choose **Return to My Order**; confirm the exact customer page returns.
3. In Captain Professional View, run Fleet Readiness and open Legacy Plumbing's signal report; confirm the green **Signal Report Open** acknowledgement.
4. Close the inner report and then the Fleet Chart; confirm focus and scroll return to the same Professional command position.
5. Return to Engine and confirm no project, owner, deployment, readiness, or watch state changed.

# Dark Sky 8.8.13.13 — Signal Lift

Signal Lift repairs the field-confirmed Captain Professional **Open Signal Report** visibility failure. The command already opened the correct scoped Fleet Signal Report, but iPad rendered it behind the higher Professional surface.

The protected Fleet Chart report now lifts above Professional View as a true modal. Closing it returns to the same Professional command position; Cinematic View continues to use the same report and evidence source.

The repair is presentation-only. It does not alter readiness results, watch items, signal evidence, Captain outcomes, project state, deployments, authentication, or vessel boundaries. True Passage and Homeward Bearing remain intact.

## Quick Signal Lift check

1. Open Captain Watch in Professional View and run Fleet Readiness.
2. Under Act, tap **Open Signal Report** for Legacy Plumbing once.
3. Confirm the Fleet Chart and Legacy's scoped signal report appear above Professional View.
4. Close the report and confirm Professional View returns at the same position.

# Dark Sky 8.8.13.12 — Homeward Bearing

Homeward Bearing binds **Return to My Order** on every project-admin PIN gate to the early, storage-independent customer-return rail. It closes the gate and restores the exact vessel's existing live or Private Preview customer shell without changing authentication or project state.

# Dark Sky 8.8.13.11 — True Passage

True Passage separates Fleet Dock **Customer Experience** from lifecycle and Shipwright commands. Live vessels open their published customer experience; non-live vessels open a no-record, contact-blocked Private Preview.

# Dark Sky 8.8.13.10 — Shared Bearing

Shared Bearing is the narrow repair for the field-confirmed Captain Professional Fleet Readiness fault. The completed report now refreshes the existing shared Captain command picture instead of calling the missing `refreshCaptainProfessional` symbol. Professional and Cinematic views continue to run the same protected readiness service and retain the same report.

The secondary Captain panel is now named **Engineering Systems**, matching the Engine Room, and its former faint **OPEN WHEN NEEDED** caption is replaced by a restrained but recognizable **SYSTEMS AVAILABLE** state. No readiness predicate, authentication boundary, authority gate, fleet record, vessel route, staged/adopted state, or release evidence is changed.

## Quick Shared Bearing check

1. Open Captain Watch in Professional View.
2. Open Engineering Systems and tap Fleet Readiness once.
3. Confirm the completed report remains visible and no missing-variable notice appears.
4. Switch to Cinematic View and confirm the same readiness result and findings functions remain available.
5. Return to Engine and open two different vessels, confirming exact identity and records in both.

# Dark Sky 8.8.13.9 — Keelbound

Keelbound is the narrow repair for the field-observed Engine stall. The protected six-vessel roster now paints from its complete local chart before slower registry, storage, proof, and project reads begin. Existing vessel rows remain authoritative; the local guard only supplies a missing protected presentation row and does not persist, admit, adopt, promote, or rewrite evidence.

Fleet Intelligence, Command Deck, Fleet Health, Proving Ground, Fleet Learning, Project Tools, and the Dark Sky storage KPI now show a usable local result or an honest **VERIFYING** state immediately. Independent background stages have bounded handoffs, so one slow browser read cannot strand every downstream station on **READING**. Completed Dark Sky soundings remain distinct from Safari's total origin estimate.

This release preserves Fleet Circuit's Captain Professional/Cinematic parity, durable staging proof, storage attribution language, and Engineering Systems discoverability. Authentication timing, authority gates, Known Good promotion, staged/adopted separation, project records, and exact-vessel boundaries are unchanged.

## Quick Keelbound circuit

1. Enter Engine Room and confirm Project Tools immediately reports all six projects.
2. Open Engineering Systems and confirm Fleet Intelligence, Command Deck, Fleet Health, Proving Ground, and Fleet Learning leave their initial placeholders or show **VERIFYING** without becoming blank.
3. Open two different vessels in sequence and confirm identity, brand, Project ID, and records remain exact.
4. Open Captain Watch in Professional and Cinematic views and confirm the same readiness and findings functions remain available.
5. Return to Engine and run Fleet Readiness once. Do not promote the candidate unless the resulting evidence supports that separate decision.

# Dark Sky 8.8.13.8 — Fleet Circuit

Fleet Circuit is a focused field-validation release. Captain Professional View now exposes **Run Fleet Readiness** and **View Current Findings** directly, while Cinematic View retains the same functions. Presentation may differ; command capability does not.

Fleet Readiness now hydrates the durable Fleet Learning command record before evaluating the Staging Ledger. A verified staged action remains valid across a compatible release transition when its staged rows, project IDs, learning ID, recorded build, and ledger entries agree. Staged review remains separate from adoption: the six field-staged review records do not change any vessel capability.

Completed storage soundings immediately refresh the Engine's measured Dark Sky summary. The readiness finding is now **Safari storage-attribution gap** and explicitly separates measured Dark Sky data from Safari's browser-managed remainder; a falling or unattributed origin estimate is never called Dark Sky growth.

The Engine's **Engineering Systems** control now has a restrained systems mark, clearer edge, descriptive subtitle, and durable OPEN/OPENED state. Authentication timing is deliberately unchanged because the single idle-login observation was not enough to prove a defect.

## Quick Fleet Circuit

1. Engine: confirm **Engineering Systems** is recognizable, opens once, and reports **OPENED**.
2. Captain Professional: run Fleet Readiness directly and confirm the prior six-record staging action passes with adoption still zero.
3. Captain Cinematic: confirm Fleet Readiness and Current Findings remain available.
4. Operate Vessels: open two different vessels in sequence and confirm name, brand, Project ID, and records never bleed across the boundary.
5. Admiral My Fleet: authenticate, confirm six independent vessels, open one read-only overview, and return.
6. Storage: rescan once and confirm the Engine summary matches the completed measured Dark Sky value; perform no cleanup.

Expected posture is no critical holds. Known experimental calibration, live server revocation, and a material Safari attribution gap may remain WATCH; the previously completed Staging Ledger round trip should pass.

# Dark Sky 8.8.13.7 — True Bearing

True Bearing repairs the verified-readiness handoff between Captain Cinematic View and the Admiral Command Deck. After the Captain completes Fleet Readiness and deliberately chooses **View Current Findings**, the authenticated Admiral deck now carries that exact completed report forward, renders its current findings immediately, and preserves its WATCH, HOLD, or CLEAR posture without requiring a duplicate run.

When no completed report exists, the Admiral deck now states **NOT RUN** and offers a deliberate manual check instead of claiming indefinitely that verification is underway. A genuine background-pending event may still show VERIFYING, and **Run Fleet Readiness** remains available as an optional fresh diagnosis.

This is a state-handoff repair only. The four genuine True North watches remain intact, and no readiness predicate, Fleet Core record, vessel boundary, authentication or authority gate, commissioning evidence, entitlement, owner state, canonical brand, Bootstrap schedule, weekday norm, weekend exception, recovery path, or growth contract is weakened or removed.

# Dark Sky 8.8.13.6 — True North

True North repairs the fleet-readiness truth model exposed during iPad field testing. The Fleet Doctrine, Golden Voyage, and Engine → Captain → Admiral command registries were structurally verified against their existing release-blocking predicates, then aligned to the current build. No check is suppressed: stale proof identity no longer creates three false critical holds, while unresolved field evidence remains visible as WATCH.

Professional-first readiness now verifies the configured default and deliberate view switch instead of treating the Captain's currently open Cinematic View as a contract failure. Cinematic Fleet Readiness also gains a prominent **View Current Findings** route. It still crosses the strict Admiral PIN gate, then lands directly in Govern → Current Findings without changing vessel state.

The expected current posture is zero registry holds with the legitimate watches retained: Ike calibration replay, live server revocation proof, Staging Ledger round trip, and Engine-origin storage growth. Fleet Core membership, scalable roster rendering, exact-vessel isolation, owner independence, commissioning, evidence, authority, authentication, entitlements, Bootstrap Build schedules, weekday norms, weekend exceptions, recovery, and future growth contracts remain unchanged.

# Dark Sky 8.8.13.5 — Proof Lantern

Proof Lantern repairs the field-confirmed Fleet Readiness dead-button appearance inside Captain Cinematic View. The check now becomes a first-class chart state: the First Mate panel immediately reports **CHECKING**, then retains the authoritative **CLEAR**, **WATCH**, **HOLD**, or **UNAVAILABLE** result with completed-check, watch-item, and critical-hold counts. The Captain can deliberately run the proof again from the same visible panel.

Support-station failures now produce a visible, readable status notice instead of disappearing into an unstyled element outside the cinematic viewport. Important notices remain long enough to read on iPad. Other support routes continue through the shared Captain command rail, and missing stations fail visibly.

Constellation's signal-first chart, selected-vessel context, Watch → Decide → Act → Record loop, Professional View, exact-vessel routing, and cinematic motion remain intact. No Fleet Core membership, Bootstrap schedule, weekend exception, authentication rule, authority boundary, commissioning evidence, entitlement, owner state, canonical brand, recovery path, or growth capability is changed.

# Dark Sky 8.8.13.4 — Constellation

Constellation is the field-hardening and cinematic-depth pass for the Captain's Living Chart. Captain Watch now exposes one shell-owned **Return to Engine** control instead of allowing the legacy global escape to overlap **Professional View**. When fleet truth arrives, the first genuine attention signal automatically becomes the opening focus; after the Captain deliberately selects another vessel, that bearing remains under Captain control.

The six vessels retain stable, non-overlapping positions with more room for full names. Illuminated routes, constellation points, bearings, chart depth, ambient light, selected-vessel focus, Sea Trial distinction, and signal-acquisition motion make the chart feel alive without turning decoration into false operational state. **Watch → Decide → Act → Record** and **More Systems** remain the sole command structure.

Engine and Captain PIN inputs now advertise one-time security-code semantics to Safari rather than ordinary account-password semantics. PINs remain masked, uncached by Dark Sky, required at their established boundaries, and governed by the existing lockout contracts.

No Fleet Core record, Bootstrap Build program or schedule, authentication secret, authority boundary, vessel route, commissioning record, evidence chain, entitlement, owner state, canonical brand, or growth capability is changed.

# Dark Sky 8.8.13.3 — Living Chart

Living Chart turns the Captain's Cinematic View into a working command chamber. The fleet map now occupies the center of the room with six stable, non-overlapping vessel positions. A genuine attention signal is illuminated without making quiet vessels compete for the Captain's eye. Selecting a vessel updates one integrated First Mate panel through **Watch → Decide → Act → Record**, and the scoped report remains read-only until the Captain deliberately routes into the exact vessel.

The crowded station rail is replaced by those four command stages plus **More Systems**. Fleet Readiness, Workshop, Visual Forge, Shipyard, Blueprint, Test Access, and the provisional Admiral's Gate remain available there; no capability is removed. Professional View remains the efficient daily operating surface and retains the field-proven Clear Helm controls.

Motion is restrained to chart light, signal beacons, and selection transitions, with a reduced-motion fallback. This build changes presentation and Captain-side read/route composition only. It does not change Fleet Core membership, Bootstrap Build, authentication, authority, vessel isolation, canonical branding, entitlements, commissioning, evidence, or saved schedules.

# Dark Sky 8.8.13.2 — Clear Helm

Clear Helm repairs the field-confirmed iPad obstruction in the Captain Watch action strip. Professional mode now suppresses the cinematic room masks that were still sitting above the operational surface. The Captain command bar and professional surface are isolated on explicit top layers, while **Return to Engine** and **Cinematic View** receive solid backgrounds, full opacity, clear borders, 48-pixel touch targets, and visible pressed and keyboard-focus states.

This is a presentation-only repair. It changes no fleet data, authority, authentication contract, vessel route, commissioning path, evidence ledger, owner state, entitlement, canonical brand, or Bootstrap schedule. Cinematic presentation remains available when deliberately selected; it simply cannot obscure Professional Command.

# Dark Sky 8.8.13.1 — Deck Clearance

Deck Clearance tightens the Fleet Rigging structure after iPad field review. The Engine's first view now stays focused on its four operating levels; **Waters Ahead** remains intact inside Engineering Systems instead of duplicating Captain Watch. **Operate Vessels** is now a clean exact-vessel doorway to Customer Experience, Owner / Partner, and Black Flag Project Control, with Test / Preview kept visibly separate. Commissioning and readiness evidence remain available through Captain and governed support routes.

Captain Watch now has one Fleet Intelligence summary, one **Watch → Decide → Act → Record** loop, and one progressive Support Stations drawer. The duplicate change summary and oversized route footers no longer compete for the deck. The command bar is constrained to the iPad viewport so **Return to Engine** and **Cinematic View** remain distinct, readable, and tappable.

The Admiral gate now paints a neutral authority shield before authentication. A saved Presentation Forge image can still style the authenticated Admiral deck, but it cannot appear behind the PIN gate or reveal fleet-like content before authority is established. The Admiral command brief reports verified governance/readiness posture; routine operational signals remain Captain-level work.

No controller, capability contract, evidence ledger, recovery route, commissioning path, Fleet Learning record, owner state, entitlement, vessel identity, canonical mark, or saved schedule is removed. The six Fleet Core vessels remain independent, Bootstrap Build remains a separate uncommissioned Admiral Program, and all three Bootstrap test projects retain movement, edge resizing, weekday norms, weekend exceptions, calculated-risk warnings, local vendor logs, and project-isolated storage.

## Deck Clearance disposition

| Disposition | 8.8.13.1 decision |
| --- | --- |
| Keep | Four operating levels, three vessel surfaces, My Fleet, commissioning, Build & Govern, Admiral Programs, evidence, recovery, Fleet Learning, and Bootstrap scheduling. |
| Move | Engine Watch presentation appears through Engineering Systems; Captain support stations open only when requested. |
| Combine | Captain intelligence, readiness, and the primary decision loop share one operational surface. |
| Conceal | Saved Admiral presentation imagery is withheld until after Admiral authorization. |
| Remove | Duplicate presentation only. No durable data or capability controller is deleted. |

# Dark Sky 8.8.13 — Fleet Rigging

Fleet Rigging organizes the existing platform around four clear operating levels: **Operate Vessels**, **Captain Watch**, **Admiral My Fleet**, and **Build & Govern**. Each job now has one primary doorway, while commissioning, Engine configuration, performance, maintenance, recovery, release proof, Fleet Intelligence, learning, and engineering evidence remain available through explicit support and Engineering Systems routes.

The daily Engine view no longer presents an empty Fleet Dock placeholder or incomplete cost/storage panels as primary command. **Vessel Workstations** opens only when requested and continues to consume the scalable runtime roster rather than a hard-coded six-vessel layout. Every vessel retains its Project Control, customer experience, owner/partner access, commissioning, and test/preview paths.

Captain Watch now puts one highest-priority signal through a readable **Watch → Decide → Act → Record** flow. Routine navigation is filtered from visible recent work without deleting durable command records, and the duplicate iPad Return to Engine control is suppressed. Admiral command keeps Govern, Standardize, Delegate, and Promote, but removes the redundant explanatory layer and compacts readiness and continuity around the active lane.

This release changes organization and presentation, not fleet authority. The six Fleet Core vessels remain independent; Bootstrap Build remains a separate uncommissioned Admiral Program; Admiral My Fleet remains read-only after strict two-step authentication; and all mutations remain exact-vessel, previewed, authenticated, reasoned, and audited. Existing schedules, entitlements, owner state, canonical marks, recovery contracts, and Fleet Learning records are preserved.

## Fleet Rigging dead-weight ledger

| Disposition | Current decision |
| --- | --- |
| Keep | Vessel Workstations, all three vessel surfaces, commissioning, Admiral Programs, entitlements, canonical branding, recovery, audit/rollback, Fleet Learning, release proof, and Bootstrap scheduling. |
| Move | Performance, browser storage, maintenance, diagnostics, Proving Ground, Fleet Intelligence, and engineering evidence move behind Engineering Systems. |
| Combine | Captain signal/analysis/route/history becomes one priority flow; Admiral orientation and readiness tighten around the selected governance lane. |
| Hide | The closed Fleet Dock placeholder, incomplete cost/storage cards on the daily deck, the duplicate Captain header exit, and the extra Engine Captain shortcut no longer compete with primary command. |
| Remove | No durable data, migration, recovery path, capability contract, or retired controller is deleted in this release. Permanent removal requires dependency and regression proof in a later cleanup release. |

# Dark Sky 8.8.12.1 — Clear Watch

Clear Watch repairs the iPad field findings from Fleet Watchtower. Fleet Core cards now render one full-width row at iPad landscape sizes so lifecycle, freshness, operational fields, and **Open Vessel** remain readable and fully tappable without horizontal clipping.

The Watchtower no longer substitutes the Black Flag platform mark for every vessel. It uses the project-owned canonical asset when one is available, preserves uploaded Fleet Branding marks, and uses a clearly project-scoped code mark when no approved image artifact exists. No replacement logo is invented and no branding record is mutated.

# Dark Sky 8.8.12 — Fleet Watchtower

Fleet Watchtower turns the direct **Engine Room → My Fleet** passage into the Admiral's fast daily read without weakening its two-step security. After the Admiral PIN and separate account authentication, the six independent Fleet Core vessels appear as operational cards with canonical identity, lifecycle, current-work and issue fields, truthful freshness, search, attention filters, and a deterministic **Open Vessel** action.

Every opened vessel establishes one exact read-only project context and exposes no modifying control. Missing operating data is labeled **Not reported** and records without a trustworthy activity timestamp are marked **Stale / Unverified** rather than presented as healthy. Bootstrap Build remains outside Fleet Core in a separate **Admiral Programs** section and is not commissioned by this release.

The Watchtower enlarges iPad authentication fields, metadata, touch targets, and operational hierarchy while retaining the restrained deep-teal, gold, and blue-radiation visual language. Commissioning, entitlements, branding commands, owner independence, and all three isolated Bootstrap schedules remain unchanged.

# Dark Sky 8.8.11.9 — Quick Passage

Quick Passage makes the daily routes shorter and the construction schedule more tactile without weakening the security boundary. The Engine Room now has a direct **Open My Fleet** command: Admiral PIN verification leads immediately to the Fleet Registry, where the active Admiral account still completes the separate authenticated read. The full Admiral Command Deck remains available for governance work.

Schedule cards now have dedicated left and right edge grips. Dragging the card body moves the task; dragging an edge changes its start or finish and therefore its duration. Shortened plans and same-vendor overlap remain permitted, but a calculated-risk warning is attached to the task and recorded in the local communication history.

Project Roster opens Bootstrap Build on an organized project list instead of dropping directly into one house. The test roster contains three isolated schedules: Lot 1234 · Unit A, Lot 1234 · Unit B, and Lot 1235 · Unit A. Each row shows its start, projected completion, current task, issue count, schedule status, and last saved time, then opens only that project's calendar.

The schedule controller now keeps a separate IndexedDB record plus a local mirror for every lot/unit. The prior Lot 1234 · Unit A record is migrated when available; moves, vendor assignments, reset actions, and change history cannot bleed into the other two projects. A successful save is visibly timestamped, and a storage failure is reported instead of silently presenting a fresh seed as saved work.

Monday through Friday remains the standard calendar. A construction manager can activate one specific Saturday or Sunday as an AM, PM, or full-day accelerated exception, mark it proposed or vendor-confirmed, and attach the selected task. The date is visible beneath its week and in the vendor log; removing it returns that weekend to off without shifting the weekday plan.

The restrained construction palette is retained and refined: blue for general work, green for sitework, amber for inspections, purple for deliveries, and red for milestones. Selection, edge grips, warning badges, and accelerated lanes are distinct interaction signals rather than task categories.

The release continues to require a new Admiral sign-in after every full page load. Before any Admiral station initializes, it removes only the shared Admiral command token from browser tab storage. Commissioning Orders, Course Orders, Vessel Logo Helm, Admiral Fleet, and the Bootstrap Build Schedule therefore return locked after refresh.

The Engine PIN and Captain authority remain separate. The registry remains read-only, and this repair changes no Fleet Core record, vessel identity, entitlement, owner assignment, commissioning state, or saved project schedule. Vendor notices remain a local test simulation; live multi-device vendor access will require the governed server-backed schedule phase.

# Dark Sky 8.8.11.1 — Bootstrap Build Schedule

This patch repairs the missing **Open Bootstrap Build Schedule** doorway. The Bootstrap identity panel is created dynamically after Admiral authentication; the doorway now attaches as soon as that panel appears and remains separate from commissioning.

# Dark Sky 8.8.11 — Bootstrap Build Schedule

Bootstrap Build Schedule gives Bootstrap Build a focused construction-scheduling proving ground. The included sample uses twelve vertical Monday-through-Friday weeks and familiar work from clearing through settlement, while the product name and structure do not impose a fixed project length. Single-day and multi-day bars can move with mouse drag, iPad touch, day-heading taps, or keyboard arrows while each task's duration remains intact.

The test hierarchy remains Region `ABC` → Division `CBA` → Community `AB` → Lot `1234` → Unit `A`. The calendar is browser-local and resettable. It creates no commissioning order, Fleet Core vessel, owner assignment, customer commitment, or live construction record.

Every seeded task has a test vendor. The schedule can be filtered to one vendor, a selected task can be reassigned, and every move is written to a local communication log showing the vendor its previous and new date. This release deliberately does not send email, text, or push notifications.

# Dark Sky 8.8.10 — Fleet Structure

Fleet Structure restores the intended lateral fleet model. Black Flag owns the authenticated, read-only Fleet Registry; the six existing businesses remain independent Fleet Core members; and Bootstrap Build remains a separate, uncommissioned Admiral-level program rather than a parent or container.

The registry now reads each member's authoritative mission class, ownership model, operating model, lifecycle, permanent key, and canonical mark. Shared capabilities can pass through explicit adoption at any mission level, but ownership, authority, branding, namespace, and project data never travel with them. This release issues no commissioning order and changes no existing vessel record.

# Dark Sky 8.8.9.1 — Admiral Fleet Surface

Admiral Fleet Surface repairs the confirmed iPad opening failure. The fleet view was opening beneath the higher Admiral deck; it now owns a higher presentation layer, captures the tap before competing deck handlers, announces its opening immediately, and places keyboard focus on its visible Close control.

The repair changes presentation and navigation only. Fleet Core remains read-only in this view, all six vessels are preserved, and no commissioning order is issued.

## 8.8.9 — Fleet Door Repair

Fleet Door Repair places **OPEN ADMIRAL FLEET** directly on the Promote lane, ahead of Commissioning Orders. Bootstrap controls now install when the Admiral panel actually becomes available instead of relying on first-load timing. The commissioning Boundary cards stack cleanly at iPad widths, and the Admiral Fleet remains a read-only view of authenticated Fleet Core records.

The shared Admiral session remains intact across Commissioning Orders, Vessel Logo Helm, and Admiral Fleet. The database upgrade is separately governed and does not authorize a commissioning order.

The Black Flag Fleet Core upgrade was applied and verified on September 10, 2026. All six existing vessels were preserved, the authority-gated commissioning and branding functions are available, and no Bootstrap Build vessel or commissioning order was created by this repair.

## 8.8.8 — Bootstrap Admiral Fleet

Bootstrap Build now has an unmistakable **OPEN ADMIRAL FLEET** door beside its approved identity kit and a second **ADMIRAL FLEET** door inside the construction schedule. The resulting surface is read-only: it shows every authenticated Fleet Core vessel, lifecycle state, permanent project key, and current vessel mark without exposing a fleet mutation control.

The ABC → CBA → AB → 1234 → A hierarchy remains ordinary test data for exercising the scheduler. It is not treated as a fake product or disposable vessel identity.

## 8.8.7 — Bootstrap Build Helm

Bootstrap Build Helm installs the founding construction-scheduling identity as three separate production assets: primary vessel badge, horizontal dashboard lockup, and compact fleet icon. The professional Admiral deck adds a Vessel Logo Helm where an active Admiral can inspect a Fleet Core vessel, preview a PNG/JPEG/WebP replacement, save its canonical Storage path, or restore the approved default. Logo commands are audited and never rename the vessel, alter its permanent project key or namespace, grant authority, or change feature entitlements.

A local-first Construction Schedule proving ground launches from the Bootstrap Build commissioning identity. Its resettable sample hierarchy is Region `ABC` → Division `CBA` → Community `AB` → Lot `1234` → Unit `A`. Ten familiar construction tasks can be dragged between a seven-day calendar, moved by tap controls on iPad/iPhone, or moved with arrow keys. This prototype writes only to browser-local test storage and does not create Fleet Core, owner, customer, or live schedule records.

The supplied `SUPABASE_ADMIRAL_COMMISSIONING_886.sql` is the combined Fleet Core migration used by the authenticated Admiral Fleet and Vessel Logo Helm.

# Dark Sky 8.8.6.1 — Command Deck Refit

Command Deck Refit keeps Bootstrap Build and the 8.8.6 commissioning contract intact while replacing the tall split station with one compact command flow. Working identity, permanent keel, and authority boundary share one readable band; the impact preview sits directly beneath the order; verified identity collapses to a small status action; and an unavailable Fleet Core migration is explained in plain language without exposing a raw schema-cache error.

# Dark Sky 8.8.6 — Commissioning Orders

Commissioning Orders adds a server-governed Admiral shipyard for creating one durable Fleet Core vessel identity after an explicit preview. **Bootstrap Build** replaces ScheduleJoe as the construction-scheduling vessel's working name. The name stays editable, while the UUID, project key, namespace, lineage, and records remain stable. New vessels begin in `commissioning`, with no owner membership, no entitlements, and no live publication. The supplied `SUPABASE_ADMIRAL_COMMISSIONING_886.sql` migration is prepared but is not applied by the static release.

# Dark Sky 8.8.5 — Command Acknowledgment

Command Acknowledgment keeps the field-proven 8.8.4 Course Orders and Native Passage intact while making completed command results durable on screen. Verified issue and rollback receipts now remain visible after server readback, completed intent is cleared, and a post-rollback preview is explicitly identified as a new proposal rather than the restored state. No Supabase migration is required.

# Dark Sky 8.8.4 — Course Orders

Course Orders gives the Admiral one deliberate commercial command surface. The Admiral chooses a vessel, then one feature, a named service group, or the entire vessel; chooses Off, Free, or Paid; reviews the exact before/after impact; and issues one atomic server-governed order. Each successful order is read back, written to the durable Admiral Log, and can be rolled back only when no newer command conflicts. Professional Mode now uses strong outlined controls and responsive iPad/iPhone layouts. Readiness, testing, refresh, and launch remain unable to change entitlements. The field-proven 8.8.3 Native Passage back to Engine Room is preserved.

# Dark Sky 8.8.3 — Native Passage

Native Passage makes the Admiral header exit a true Safari-owned document crossing. No touch, pointer, click, Captain, or Admiral controller is allowed to cancel that link. A short-lived, one-use same-tab handoff preserves the Engine session that opened Admiral; an absent, copied, expired, or wrong-build handoff returns to the normal Engine gate. The destination resolves Engine before upper-command modules paint, and the runtime settles Engine again after initialization. The Admiral header visibly carries build 8.8.3 so field screenshots prove which controller is running. Project data, vessel identity, authority records, and Admiral-controlled Off/Free/Paid entitlements remain untouched.

# Dark Sky 8.7.13 — True Return

True Return commits Admiral-to-Engine navigation on the iPad pointer release itself. It no longer depends on Safari producing a later synthesized click after visibly pressing the button; movement protection prevents a scroll gesture from activating the route.

# Dark Sky 8.7.12 — Clear Passage

Clear Passage makes Return to Engine a positive, canonical transition instead of merely uncovering an assumed Engine state. It also gives the iPad control explicit touch geometry, removes redundant sign-in actions after Admiral verification, and releases entitlement pickers after a choice so Safari cannot reopen them when the app resumes.

# Dark Sky 8.7.11 — Fixed Bearing

Fixed Bearing guards the professional Admiral scroll plane against the abrupt reset observed when an iPad screenshot leaves the email field focused. It reacts to the actual scroll reset, restores the open entitlement station after Safari settles, and yields to deliberate touch scrolling. Supabase authentication, sign-out, and exact-vessel entitlement authority remain unchanged.

# Dark Sky 8.7.10 — Held Course

Held Course keeps the open Fleet Feature Entitlements panel in place while iPad Safari expands or dismisses its on-screen keyboard, including the viewport change observed after taking a screenshot. The repair anchors the single professional-deck scroll plane around Admiral identity input without changing Supabase authentication, sign-out, or exact-vessel entitlement authority.

# Dark Sky 8.7.9 — Clean Signal

Clean Signal preserves True Touch's iPad geometry and vessel-isolation repairs while restoring the identity station's exact signed-out presentation. The Sign Out action stays absent until server verification succeeds; hidden state now outranks the shared touch-button display rule. Supabase password authentication and exact-vessel authority remain unchanged.

# Dark Sky 8.7.0 — Feature Freedom

Every Fleet feature can now be independently Off, Free or Paid for every vessel. Off controls access; Free/Paid controls commercial terms; Sea Trial/Live remains a separate safety state. The server-governed Admiral seam and exact-vessel isolation remain intact.

This first 8.7 foundation is Fleet-wide. Ike's can use features free during testing and later move to Paid without rebuilding the feature, losing its records or changing another vessel.

# Dark Sky 8.6.64 — Admiral Scroll Rail

Professional Admiral command is now top-anchored inside its own iPad-safe vertical scroll container. Expanded Standardize content can no longer create unreachable negative overflow above Safari's scroll origin. The fixed command overlay retains authority isolation while allowing the Captain to return to the Admiral header without refresh or browser Back.

# Dark Sky 8.6.63 — Recovery Sovereign Route

Admiral recovery is now a sovereign first-light route. Both recovery-request and callback URLs are classified before any runtime loading, the full Engine/customer application snapshot is not executed behind recovery, and CSS keeps every non-recovery body surface sealed for the route's lifetime. This removes the observed Recovery → pre-login check → Ike → Engine flash chain.

# Dark Sky 8.6.62 — Recovery Route Lock

The main Black Flag portal now treats Admiral recovery as a protected head-owned route. Its late DOM-ready binder, general route resolver, and `requireEngineEntry` function are all barred from opening Engine Access while a recovery request or recovery callback is active. This closes the observed flash-then-Engine regression in 8.6.61.

# Dark Sky 8.6.61 — Recovery Callback Bulkhead

Password recovery now wins first-paint routing for every Supabase callback form Dark Sky can receive: implicit hash sessions, `token_hash` verification callbacks, query access tokens, PKCE codes, and callback errors. Token-hash callbacks are exchanged for a session before Admiral authority is checked. Incomplete, expired, or unsupported callbacks enter a dedicated recovery safe hold and can never fall through to Engine Access.

# Dark Sky 8.6.60 — Recovery Identity Landing

Supabase auth callbacks are now resolved before Engine first paint. Dark Sky asks Supabase who the callback belongs to, then verifies the caller's active server-side Admiral authority before showing password recovery. The Admiral entitlement station now originates its own recovery emails with an explicit root recovery callback, avoiding generic Site URL routing.

# Dark Sky 8.6.59 — Admiral Recovery Landing

A valid Supabase `type=recovery` session now outranks Engine routing at first light. Dark Sky renders a dedicated Admiral password-reset surface, updates the password only through Supabase Auth, scrubs the recovery token from the URL, and revokes the recovery session after success. Engine, Captain, project-owner, and Fleet authority boundaries remain separate.

# Dark Sky 8.6.58 — Admiral First-Paint Recovery

Restores command-first Admiral entry after the 8.6.57 proof-chain regression. Background proof verification may update only the compact readiness posture; it cannot populate Current Findings, choose the active diagnostic view, or move scroll position. Every Admiral entry opens Professional → Govern at the top. Full findings appear only after an explicit Run Fleet Readiness action.

# Dark Sky 8.6.57 — Proof Chain Settlement

Readiness now settles the existing bootstrap/signer lifecycle before judging dependent proof. If current proof still cannot commit, the Proof Signer finalizer/read-back remains the single root HOLD; roster, Dock, Intelligence, admission and source-trace checks report blocked-upstream WATCH instead of cascading false-independent HOLDs.

# Dark Sky 8.6.56 — Doctrine Authority Repair

Repairs current Admiral doctrine authority proof, gives readiness findings a real on-screen doctrine detail surface, and prevents Safari browser-managed storage estimates from becoming a critical HOLD without measured Dark Sky ownership evidence.

# Dark Sky 8.6.55 — Admiral Command Rail

Admiral professional hardening: readable four-lane command rail plus a real server-governed Fleet Service Entitlements station. Entitlement writes require a dedicated authenticated Supabase identity with active Admiral global authority. Future Basic/Mid/Super-style packages are reserved as bundles of the same capabilities; no package UI is live yet.

# Dark Sky 8.6.55 — Admiral Command Rail

Paid/Standard entitlement-state precedence, owner-facing Fleet Services language, and the first server-governed Admiral service-command seam.

# Dark Sky 8.6.55 — Fleet Services Framework

Admiral-governed Standard vs Paid Fleet capability entitlements, owner-visible service availability, persistent vessel identity across Owner Bridge working screens, and owner request groundwork. Auth, ownership and existing RLS vessel boundaries remain unchanged.

8.6.52 Owner Bridge Core remains the immediate UI baseline beneath this framework.
