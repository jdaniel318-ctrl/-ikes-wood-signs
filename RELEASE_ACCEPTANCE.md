# Dark Sky 8.8.18.0 — AdmiralKeel

## Current release: commissioned Admiral office hardening

AdmiralKeel marks the Fleet role transition requested by the Captain: **the Admiral office is now accepted as a durable Fleet role rather than a temporary promotion milestone.** This is a product/governance role state, not a bypass of authentication. Each secure Admiral workspace still requires the passage PIN and server-verified active Admiral identity. Session timeout, logout, page reload, readiness WATCH items, and unfinished tests lock work; they do not demote the Admiral. Only an explicit server-side authority revocation can remove the active role.

Captain and Admiral remain separate offices held by the same person. Admiral observation remains read-only by default. Modifying commands remain exact-vessel, deliberate, authenticated, reasoned, and audited. Existing Vessel Captain appointments, owner authority, Becca's browser-local CG-1 agreement draft, Fleet Core membership, and all unresolved readiness warnings are preserved. Fleet Captain operating-server activation, executed-contract verification, commercial fee activation, server-wide session expiry, revocation proof, and complete working-ship handoff remain unfinished.

This hardening also improves input ergonomics discovered during field testing: single-line pasted text trims only accidental leading/trailing whitespace while preserving internal spaces; contract illustration fields select their default zero on focus so the first typed amount replaces it, while the negotiated percentage remains blank unless deliberately set.

**Admiral rank and secure session are now explicitly different states throughout the Engine, Admiral gate, Command Deck, and Contracts & Services session messaging.**

---

# Dark Sky 8.8.17.23 — CharterPort

## Current release: Contracts & Services entry hardening

This uniquely numbered client repair follows the actual CharterBridge package. It supersedes the two different .22 repair names for the next field check; it is not a new contract, permission grant, or fleet launch.

The field screenshot confirms that CharterBridge did not visibly open after a tap. The ordinary isolated Chromium fixture does open CharterBridge, so the exact iPad failure cause is not established. A controlled button-node redraw demonstrates a separate weakness: the old element-specific handler is lost. CharterPort uses narrowly scoped delegated entry handling that survives this redraw and native modal presentation rather than relying on a numeric z-index race.

Before requesting the contract directory, the entry verifies that the native modal is open and its Back to Command control is in front for hit-testing. An unconfirmed display unwinds to a usable Command Deck with a persistent CONTRACTS-DISPLAY-UNCONFIRMED message. It does not repeatedly open itself, repeat a command, or bypass authentication. Existing 15-minute idle / 60-minute maximum workspace rules remain.

All CG-1 wording, fee calculations, draft storage keys, business logic, existing appointments and server authority contracts are retained. This update neither signs an agreement nor enables fees, commercial commissioning, departure, or Fleet Captain server operation. No live service calls, database changes or website-data deletion are part of this repair. Do not run the bundled SQL. Keep private contracts off the public GitHub repository.

**Field acceptance pending:** confirm 8.8.17.23 · CHARTERPORT, authenticate Admiral normally, tap Contracts & Services once, and inspect the empty workspace. Native iPad Safari and real server interactions have not been tested by the fixture suites.

---

## Retained predecessor documentation

# CharterBridge field checkpoint — 8.8.17.22

After Pages deployment, confirm CharterBridge, authenticate Admiral, and tap Contracts & Services once. The agreement must visibly cover the deck, keep Back to Command reachable, and return focus/control when closed. Inspect the empty Parties form before entering any real terms. No fee, signature, commission, departure, permission or live-data change is part of this test.

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

# 8.8.17.19 HelmDeck — acceptance

This is a client test release, not a completed working-ship handoff.

## Native iPad acceptance still required

1. Confirm Engine reports 8.8.17.19 · HELMDECK after the complete upload finishes.
2. Reopen the existing accepted Captain Station route and sign in with the appointed test account if asked. Do not repeat acceptance for an accepted appointment.
3. Verify the empty Orders state, Watch fields and Publish button fit together in landscape, while Access & scope expands and collapses normally.
4. Verify readable input targeting with the keyboard open, rotation, and longer content. Normal scrolling is expected at reduced height and with many records.
5. Before any order change or publication, confirm the exact project and staging state. The layout test itself requires no business mutation.
6. Continue the previously planned live Watch, order, cross-vessel-denial, revocation and isolated-restore tests separately.

## Failure handling

Do not clear website data. Do not repeatedly press Accept or Publish after an unconfirmed result. Recheck Station reads the saved appointment only. Report a recovery screen without issuing new authority or departing a vessel.

## Retained prior acceptance reference

# 8.8.17.18 Quarterdeck acceptance

## Automated evidence

Isolated Chromium tests execute the full shipped Captain and shared Supabase-transport modules with original HTML/styles. Server/account/storage replies are fixtures. They reproduce the prior delayed-initialization defect, exercise the candidate's PIN/account path and exact-vessel preview/results, and verify layouts without touching live data. Package/body integrity tests are separate from operating proof. The external Quarterdeck verification report records the final extracted-ZIP results.

## Native iPad acceptance (not yet completed)

1. Confirm 8.8.17.18 · QUARTERDECK after a successful test deployment.
2. Open Build & Govern after the page has been idle longer than one second. Authenticate normally.
3. Select Delegate. Confirm the initial form appears, task tabs work and the Preview Appointment control fits the normal landscape screen.
4. Verify navigation back to Govern, session-details expansion, and reports/recovery tools. Do not delete storage or issue lifecycle commands during this display check.
5. Later, use a separate account controlled by the Captain for a read-only appointment preview before any actual appointment is authorized.

## Still separate

Browser workspace timing is not a server-wide token-expiry guarantee. A model PASS is not an operating acceptance. Actual cross-vessel denial, revocation, independent-device record durability, restore, a complete customer/operator workflow, accepted Captain appointment and Admiral observation must be demonstrated before the working-ship milestone is certified. Five existing warning conditions remain unresolved by this repair.
