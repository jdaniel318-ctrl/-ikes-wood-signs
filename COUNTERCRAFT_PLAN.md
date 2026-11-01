# Countercraft implementation plan

> Approved design: `../specs/2026-11-01-ikes-countercraft-design.md`. User explicitly approved implementation; execute inline without another design gate.

**Goal:** Connect Ike’s guided shared-iPad sign request to an immutable, complete owner inbox and production/pickup workflow.
**Architecture:** Existing Carvewright/Boardcraft request engine; additive browser core, encrypted store, customer and owner adapters; a dedicated Supabase Edge boundary and service-only transactional SQL functions. Existing mutable orders remain separate. Countercraft 8.8.20.77 is a staging candidate; real customer publication remains off until physical-device acceptance.
**Stack:** Buildless JS/CSS/HTML, WebCrypto, IndexedDB, PostgreSQL, Deno fetch API. No new paid service or browser framework.

## Global constraints

Preserve all old vessel authority, prices, fonts, scope and business data. Do not bypass PIN/session or grant aliases. `project_owner` must be active, unrevoked and associated with a current server auth session. Customer capability never grants owner reading or mutations. Stage/Sea Trial and live must not mix. A receipt means complete verified assets committed, not owner acceptance. No auto retry, email, payment or machine action. Exact approved geometry and wording are immutable. Keep existing personal-device design paths available. No downloaded customer files by default on a shared iPad.

## Settled implementation decisions

- Dedicated private tables for publications, recovery keys, enrolled devices, challenges, customer sessions, immutable revisions, jobs, operation receipts, assets, events, review sessions and receipt transfers. Only a service-role RPC gateway can access them. Gateway rechecks exact scope, role, current session, and version in each transaction.
- Edge validates complete request via the existing core; separately uploads normalized media to a private bucket with unique immutable object names and `upsert:false`. No customer Storage signing credential. On timeout, retry an identical object and verify its digest; commit only its verified manifest. Unreferenced staging objects may be removed only after expiration and a fresh reference check. Retain committed objects.
- Bounds derived from Shopcraft: three normalized JPEGs at most 1 MiB each, PNG proof at most 2 MiB; 10 MiB original input ceiling, 1600px normalized maximum. All request metadata/artwork/media together at most 8 MiB per intake; existing portable archive ceiling 20 MiB. Maximum 32 sealed drafts / 64 MiB local encrypted recovery; refuse a new checkpoint rather than evict another customer’s work. Shop cap 200 intake sessions/day, 100 committed jobs/day; owner can disable publication.
- Recovery keys generated server-side using RSA-OAEP SHA-256, 3072 bits. Versioned public JWK published to the scoped session; private JWK retained only in `fleet_private` with no browser grants. Per-draft AES-GCM 256-bit key and independent 96-bit IV per checkpoint; ciphertext AAD binds scope, draft and key version. Wrap AES key with public RSA key. Retain old private versions indefinitely while old envelopes may exist; rotation creates a new active version without deleting old keys. Owner unwrap requires fresh server auth and exact vessel, never a public RPC. Keys never appear in logs or exports.
- Device enrollment uses nonexportable ECDSA P-256 private CryptoKey in IndexedDB, public JWK on server, one-use server challenge. Customer session capability in memory only. Shared-mode transition revokes current server auth session and clears known privileged caches across tabs. Broadcast/storage signal plus startup/pageshow guards hide old private DOM. Failure blocks handoff. Browser-origin isolation is not claimed.
- Receipt and amended-proof tokens are one-scope capabilities; receipt transfer one redemption/15 min and phone read-only session at most1h. Review acceptance/decline binds exact revision and cannot advance production alone. QR is local generated code, no external QR image service.

## Review focus

1. Response lost after commit, duplicate tap and explicit retry retain one job/receipt.
2. Wrong vessel/mode/site, stale owner version, revoked owner/device and guessed IDs fail closed.
3. Next customer/reload/Back/new tab cannot disclose old draft or usable privileged authority.
4. Changed proof/price clears approval; owner cannot accept an amendment on the customer’s behalf.
5. Backup extraction/rehearsal reproduces all immutable revisions/events/assets; no legacy writer can replace canonical jobs.

## Tasks and interfaces

### 1. Request contracts, pricing and workflow
Files: `countercraft_core.js`, `VERIFY_COUNTERCRAFT_CORE.cjs`.
Implement pure publication/request validation, current price basis, digest, full-request approval separate from design approval, state transitions and portable backup validation. Use existing core/geometry without substitution. RED: valid unknown-price request, price revision changed, blank/case preservation, changed approval, prohibited transition, corrupt backup. GREEN then core regressions and commit.

### 2. Transactional backend
Files: `COUNTERCRAFT_INTAKE.sql`, `VERIFY_COUNTERCRAFT_SQL.cjs`.
Add private normalized storage and narrowly service-granted gateway. Endpoint commands have literal scope and expected version. Enforce quotas, op/digest idempotence, immutable revision history, current auth, customer/review/receipt capability lifetimes. RED on real PGlite database before implementation. GREEN hostile roles/concurrency/revocation/legacy separation.

### 3. Edge service and asset verification
Files: `countercraft_service.mjs`, `supabase/functions/countercraft/index.ts`, deployment helper, service tests.
Inject HTTP/database/blob adapters only at network boundary; core validation and hashes remain real. Server auth independently resolves user/session. Validate asset type/hash/size, immutable storage and exact receipt. Generate recovery keys, verify device challenge, implement receipt/review exchanges and owner backup. RED missing media/lost receipt/invalid auth/capability attempts; GREEN end-to-end synthetic service + SQL.

### 4. Client recovery and transport
Files: `countercraft_store.js`, `countercraft_client.js`, tests.
Durable encrypted checkpoints before request, stable operation IDs, explicit read reconciliation. Session capabilities only inside sealed records or memory, no URL/query logging. Native IndexedDB key persistence; limits and no silent loss. RED tampered/wrong-scope envelope, changed op, interrupted response, failed checkpoint; GREEN WebCrypto and local state tests.

### 5. Guided customer and phone receipt
Files: `countercraft.html`, `countercraft_customer.js`, `countercraft.css`, QR helper, entry adapter.
One prominent start; photo/camera/retake/rotate; board/design via existing editor, stock association and uncertainty, exact complete review/contact/approval, submission/receipt/Next customer. Memory-only Preview. Preserve public alternatives. Dedicated receipt/review modes with fragment removal and no-store/no-referrer; controls remain accessible with keyboard. RED meaningful controller and DOM tests, then managed browser QA.

### 6. Owner inbox, setup, amendment and recovery
Files: `countercraft_owner.js`, `owner.html` adapter, shared privacy guard.
Existing owner entrance gets new inbox alongside legacy. Search/status filters and queue position; all media/proof/specs/contact/price; explicit CAS actions, stock/publication/enrollment/revoke/rotation, amendment + iPad review; export full jobs and isolated restore; originating-iPad recovery. RED owner/controller integration and stale version, then GREEN.

### 7. Integrated proof, review and package
Run full offline suite, SQL/core/service/recovery/backup suites; managed browser representative iPad/iPhone UI; separately label physical Safari/backend evidence. One fresh whole-branch reviewer as required by executing-plans; fix critical/important findings with regressions. Prepare current identity and complete inventory, package single-folder upload/full backup/rollback/evidence against exact .76 baseline; persist deliverables and three-step guide. Do not call staged or synthetic success a live customer/machine acceptance.

## Execution ledger

Use `COUNTERCRAFT_LEDGER.md` for each task’s base, RED/GREEN commands, decisions and commits. No duplicate plan approval. Native inline execution chosen under the user’s explicit authorization.

## Baseline and rulings

- Isolated sibling worktree, branch `countercraft`, baseline `c247ccc`; original .76 unchanged.
- Baseline release suite: 19 groups pass, release contract fails only complete inventory 686 vs685 due to approved design document. This known generated-file delta is resolved by final seal, not a product regression.
- Managed Linux preview: use `sites-preview` and CUA only. Offline VM/PGlite tests are not browser simulations or native Safari acceptance.
