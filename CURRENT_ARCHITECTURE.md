# Dark Sky 8.8.17.23 — CharterPort

## Current release: Contracts & Services entry hardening

This uniquely numbered client repair follows the actual CharterBridge package. It supersedes the two different .22 repair names for the next field check; it is not a new contract, permission grant, or fleet launch.

The field screenshot confirms that CharterBridge did not visibly open after a tap. The ordinary isolated Chromium fixture does open CharterBridge, so the exact iPad failure cause is not established. A controlled button-node redraw demonstrates a separate weakness: the old element-specific handler is lost. CharterPort uses narrowly scoped delegated entry handling that survives this redraw and native modal presentation rather than relying on a numeric z-index race.

Before requesting the contract directory, the entry verifies that the native modal is open and its Back to Command control is in front for hit-testing. An unconfirmed display unwinds to a usable Command Deck with a persistent CONTRACTS-DISPLAY-UNCONFIRMED message. It does not repeatedly open itself, repeat a command, or bypass authentication. Existing 15-minute idle / 60-minute maximum workspace rules remain.

All CG-1 wording, fee calculations, draft storage keys, business logic, existing appointments and server authority contracts are retained. This update neither signs an agreement nor enables fees, commercial commissioning, departure, or Fleet Captain server operation. No live service calls, database changes or website-data deletion are part of this repair. Do not run the bundled SQL. Keep private contracts off the public GitHub repository.

**Field acceptance pending:** confirm 8.8.17.23 · CHARTERPORT, authenticate Admiral normally, tap Contracts & Services once, and inspect the empty workspace. Native iPad Safari and real server interactions have not been tested by the fixture suites.

---

## Retained predecessor documentation

# CharterBridge repair — 8.8.17.22

Agreement, Admiral deck and security gate are sibling surfaces. The agreement is above the deck and below the security gate. Local eligibility and live-authority recheck remain required. Trusted drafting activity affects only the existing idle timer, not maximum age, grants or server session policy. CG-1 and all commercial activation holds remain unchanged.

# Dark Sky 8.8.17.21 — CharterGuard

Private commissioning-agreement preparation. Admiral-only client workspace: named legal parties and Captain acknowledgment, selected duties, per-vessel sales basis/percentage, counsel review log, private draft export/import, browser-local append-only draft saves with readback, printable legal-review copy, and externally executed PDF fingerprints.

**Not a signing service, legal certification, billing activation or server authorization update.** Document fingerprints do not prove signature validity, signer authority, content equivalence or cloud custody. Actual business entities, jurisdiction, insurance and risk allocation require review. Selected service duties are proposed terms, not access grants.

No production fee is calculated from live records or collected. The fee calculator is a labeled manual scenario. No production contract, user, appointment, owner, report or ledger record is created. No live SQL is needed or included. Existing SQL references are not to be executed.

**Commercial commission and departure are held in this client** pending an executed-agreement verification service. This does not retrofit a server gate: old clients/direct server commands still require a separately authorized server implementation and test. Existing test vessels/accepted appointments remain. Internal Admiral programs remain distinct.

New route: Engine → Build & Govern → normal Admiral authentication → CONTRACTS & SERVICES. Select an existing ship or prepare a planned vessel key; this does not reserve it. Save device draft is private browser storage, not a cloud backup. Export JSON/HTML into private Files; never upload private agreements to the public GitHub site.

Before signing externally, complete all terms and have appropriate counsel finalize the document. The generated contract is conspicuously marked DRAFT FOR LEGAL REVIEW — NOT FOR SIGNATURE. Retain final signed copies and signing evidence outside this test browser. Future server verification must precede commercial activation.

Existing identity/appointment, owner, ledger, project and Admiral session boundaries remain. No purge or automatic legal/rate defaults.

---

# TrueBearing 8.8.17.20 — current release note

Named vessel/account navigation; no new operating authority installed. Fleet Command operations remain disabled pending server activation. Existing Captain operations and read-only Admiral observation remain distinct. See README.md.

---

# Current release overlay — 8.8.17.19 HelmDeck

The architecture below is retained from Quarterdeck. This update changes the Vessel Captain rendering and readback lifecycle only. The existing six-vessel/core, Admiral program, ownership, commissioning and Captain scope boundaries remain unchanged. Existing SQL, server authority checks and protected business modules are not edited by this update.

## Retained Quarterdeck architecture

# Current Architecture and Authority Contract

## Route hierarchy

Dark Sky is the neutral release and route shield. Black Flag is the operating engine. Owner, Captain, and Admiral are separate authority surfaces; opening one surface never silently grants another. One human may hold Captain and Admiral simultaneously, but every retained action declares the active office and its authority source.

## Dual-office commission

- The Captain is officially permitted to hold the Admiral office at the same time.
- Captain and Admiral are two offices, not one blended permission set.
- Captain authority covers operational command and retained browser evidence.
- Admiral authority covers fleet observation, governance, and commissioning after dedicated Supabase authentication and an active global Admiral grant.
- Moving from Captain work to Admiral work requires an explicit surface and server verification; a Captain session never silently elevates.
- The Authority Ledger is navigable from both offices and labels browser evidence separately from server-attested audit rows.

## Credential model

| Layer | Purpose | Authority granted |
|---|---|---|
| Passage PIN | Opens a local protected doorway | None by itself |
| Supabase Auth | Proves the named person and active session | Identity only |
| Fleet membership | Connects one identity to one vessel | Exact-vessel owner scope |
| Global authority | Connects one identity to an Admiral role | Fleet-wide read/governance scope |

Passwords are handled only by Supabase Auth. The public application may use a Supabase publishable key; it must never contain a secret or service-role key.

## Supabase contract

- `fleet_vessels` is the canonical vessel registry.
- `fleet_memberships` grants exact-vessel membership after identity exists.
- `fleet_global_authorities` grants server-side Admiral authority.
- `fleet_business_settings` is project-scoped business configuration.
- `fleet_observability_reports` stores the narrow owner-published operational heartbeat.
- Owner reporting is performed through authenticated RPCs that verify `auth.uid()` and exact project membership.
- Admiral observation is read-only and must not expose modifying controls.
- Admiral commissioning is an explicit modifying workflow: preview, exact target, active server authority, retained intent, durable audit, and verified readback are required.

## Vessel Captain appointment and operating contract

- A **Vessel Captain** is not the Fleet-wide `captain` authority role. The appointment is bound to one `fleet_vessels.id` and one authenticated person.
- Admiral appointment is previewed first and remains `pending` until the named person accepts through their own Supabase account. The route alone grants no authority.
- Acceptance creates or reactivates only an exact-vessel `operator` membership and records `vessel_captain` as the appointment role. Ownership remains unchanged.
- The Vessel Captain station is intentionally narrower than Owner Control: server-backed order status and vessel Watch reporting are operating actions; branding, pricing, staff, entitlements, ownership and Fleet governance remain outside this appointment.
- Revocation is audited. A membership created solely for the appointment is revoked with it; a membership that existed before the appointment is not silently deleted.
- A vessel marked `captain_operated` still requires an accepted, active exact-vessel Captain appointment before Admiral departure preview can pass.
- Depart Harbor also requires a retained working-ship proof reference; the reference is an audit pointer, not proof by itself.
- `active` is a Fleet lifecycle state, not proof that the customer website is published or that a complete handoff voyage passed.

## Admiral-owned programs

The Admiral may commission an Admiral-owned program such as Bootstrap Build. The ownership model `admiral_owned` records fleet ownership of the program; it does not create an individual `project_owner` membership. A new commission begins in `commissioning`, creates no entitlements, and is not live.

Bootstrap Build remains outside the six independent Fleet Core businesses until an authenticated commissioning order creates its durable registry identity. Its default commissioning posture is `admiral_program`, `admiral_owned`, and `fleet_operated`.

RLS remains enabled for every public table. Tables intentionally accessible only through vetted functions require explicit documentation, least-privilege grants, fixed function search paths, and advisor review.

## Fleet readiness vocabulary

| State | Meaning |
|---|---|
| Registry seeded | Permanent vessel identity exists |
| Owner unassigned | No real outside owner membership exists |
| Owner ready | A real identity and exact-vessel owner membership both exist |
| Never reported | No vessel heartbeat has been published |
| Fresh | Latest verified heartbeat is within the freshness window |
| Stale | A heartbeat exists but is older than the freshness window |
| Action queue | Never reported, stale, unresolved issues, hold, or blocked |

“Owner unassigned” must never be converted to an invented user or membership.

## Release and storage contract

- Atomic loader verifies all executable runtime files before execution.
- Service worker is an identity sentinel only and has no fetch handler.
- A mixed build or seal mismatch blocks first paint and opens explicit recovery.
- `sessionStorage` may retain the active browser session; passwords are never stored there.
- IndexedDB remains the durable browser-local application store where a server source has not yet replaced it.
- Legacy localStorage mirrors are compatibility-only and may not override server truth.
- Ledger migration is evidence-preserving: same-origin legacy sources are scanned, never deleted during recovery, and migration is complete only after the merged IndexedDB book and recovery receipt both read back successfully.
- Recovered ledger rows must resolve to a canonical Fleet/office/program entity before merge; foreign entity keys fail closed instead of crossing a vessel boundary.


## 8.8.17.11 local correction/audit contract

A correction retains `correction_of` as the original transaction ID and records `previous_revision_id` for the exact version previewed. Immutable stored rows may not be removed or overwritten. The save reads, checks, merges and writes within a single IndexedDB read/write transaction; it verifies that transaction's complete result and checks committed rows again. A conflict requires a new preview rather than silently overwriting another tab. Unrelated concurrent additions survive. Recovery unions new IDs into a freshly read durable book without altering existing IDs' payloads.

The correction surface has no fixed first-twelve limitation. Record details are read-only; CORRECT RECORD is an explicit modifying action with reason, preview, fresh office checks and confirmation. Captain authorization is a read-only witness of the existing Captain closure, not a stored credential or a server grant. Any Admiral actor or Admiral/program book requires explicit Admiral context and active identity. All persisted local corrections remain BROWSER BOOK evidence.

Ordinary review states are unreviewed, accountant_review and ready. The retained approved state is a historical value, not proof of approval. New approval records require the separate workflow, name/date/evidence and explicit operator attestation attached to the prior revision. Corrections do not carry that approval forward. Legacy approval selections remain preserved and visibly unverified.

Current-summary CSVs resolve one row per original transaction; they never sum corrections as income. Full-history JSON exports include originals and every correction only for the selected book and original-transaction year. Recorded predecessor IDs are checked; older inferred links are separately labeled and never written back over old records. SHA-256 covers JSON.stringify(payload) in exported key order, encoded as UTF-8; this is an integrity checksum, not an authenticated signature. Export does not constitute a restore or a server backup.

Primary implementation references: IndexedDB transaction scheduling and lifecycle, https://www.w3.org/TR/IndexedDB-3/ ; spreadsheet formula-injection precautions, https://owasp.org/www-community/attacks/CSV_Injection .

## 8.8.17.12 correction touch/focus contract

Ledger corrections edit on a document-flow page outside the fixed scrolling ledger. Do not add smooth-scroll plus input-autofocus, fixed/transform input ancestors, pointer-coordinate remapping, or resize-driven focus changes. Status uses explicit native radio choices. Core transaction fields are disabled until deliberately unlocked. Cancel/completion restores suspended command surfaces without changing authority or ledger data. The existing append-only storage and exact-book authority checks remain mandatory.


## KeelGuard 8.8.17.13 — evidence boundary
Runtime/model hash agreement protects deployment consistency; it is not independent signing or authorization. Retained authored model versions remain historical except the four exact-version current governance contracts. Readiness is a labeled mix of source contracts, local runtime observations and outstanding field tests. A source-contract PASS must never be interpreted as proven Captain appointment or production readiness. Test ownership remains with Captain and Bootstrap. The Captain's Admiral acceptance still requires working-ship commissioning, an accepted ship-scoped Captain appointment and continuing authenticated Admiral oversight/download/advice.

LocalStorage is a degraded compatibility channel when probes fail. Verified session fallback can continue diagnostic work but is not a substitute for the separately verified book or cloud storage. Readiness history snapshots retain the original run time/identity; view changes do not create fresh verification. No cleanup, stored proof fabrication, role escalation or automatic live publication is authorized by these diagnostics.


## WatchBeacon readiness-presentation contract — 8.8.17.14

The readiness report remains the source of a single identified assessment. Its current cards, summary and downloadable snapshot must describe that same run. A failed display never means no findings and never clears a warning. Retry Display is read-only with respect to the report and business records; it is not a new readiness run. Renderer observations are separate from assessed facts. Authentication remains unchanged: passage PIN plus dedicated account/server-authority verification, no local self-promotion.


## ClearPassage entrance contract — 8.8.17.15

The Command Deck entrance is a presentation layer over the existing passage PIN handler and dedicated-account/server-authority handler. `data-auth-step` describes visible progress only; it is not an authority token. The renderer, responsive classes, viewport events and progress indicators may not grant roles or open the workspace by themselves. Existing session policy and route dispatch remain unchanged.

No credential input is automatically focused on initial entry or the change to the account step. No scale transform or coordinate remapping is applied. The modal has one scroll plane; viewport height/offset is observed at normal zoom without altering authentication state. At pinch zoom, the browser controls panning and the layout is not resized into the magnified visual viewport. Cancel clears credentials; rendering and resizing never persist them. Password-manager autocomplete remains enabled for the dedicated account only, with manual PIN entry retained.

The separate My Fleet account surface is not redesigned by this scoped release. Optional ceremonial Command Deck presentation remains available. Reduced-motion preferences suppress the operational entrance fade.

Implementation references: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport and https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length (accessed September 26, 2026).


## WatchKeeper browser session boundary — 8.8.17.16

The page-level Admiral window begins only after the shared client receives a full password sign-in response with a user identity. It becomes reusable only after authenticated user/active non-revoked Admiral role verification. Passage PIN validation remains a separate UI gate; a PIN never grants server authority.

The document keeps private start/activity times, bound to the signed-in user. A 15-minute idle deadline and 60-minute absolute deadline use elapsed time and wall-clock checks; suspicious backward clock changes fail closed. Background polling, token refresh, focus, visibility changes and untrusted synthetic events do not extend the idle deadline. Expiration is checked before activity and before protected shared RPC dispatch. A short time away for guidance is not itself logout. A full document exit/reload ends the local window.

The window is a **client-side protection, not backend session expiry**. Existing server authorization remains independent. Backend idle/absolute limits, comprehensive denial tests and immediate revocation of issued access tokens have not been implemented or verified by this release. Never describe a local countdown or successful model check as that proof. `admiral-session-window` remains WATCH until a separately reviewed server policy and live tests close this gap.

Logout is scoped to the current Admiral token and local key. It does not clear unrelated owner keys, ledger records, localStorage, IndexedDB, or caches. Outstanding requests are cancelled locally; already committed remote commands are not undone and must not be automatically replayed. Authentication fields and diagnostics never retain the password.

Admiral-facing operational UI and identity checks continue to be distinct from the user’s earned Admiral milestone: a working commissioned ship, a scoped accepted Captain appointment, independent operation, and ongoing Admiral visibility/downloads/advice are still required.


## 8.8.17.18 Quarterdeck scoped repair

The existing HarborMaster backend remains a prerequisite; no live SQL or authority change is made in this release. The Admiral deck emits a creation event after its real controls and gate handlers exist. The delegation controller mounts once for that deck, then loads server records only in an authenticated visible Delegate lane. Lock/session-end clears local delegation display/drafts; it does not delete business records. Task changes preserve normal page scrolling and readable input sizes. Account/transport authorization remains independent of the UI. Form changes invalidate previews; shared RPCs still verify the active account/role. A mutation is presented as read-back verified only after the independent vessel/appointment list agrees. Missing evidence remains unverified.
