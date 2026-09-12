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
