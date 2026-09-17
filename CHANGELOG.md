# Dark Sky 8.8.15.0 — Fleet Runtime

- Adds the fleet-wide deterministic customer runtime state machine: `READY → CUSTOMER_ACTIVE → SYSTEM_HANDOFF → SAFE_RESET / RECOVERING`.
- Fixes the Sea Trial camera regression at the architectural level: opening a camera/photo/file picker pauses abandonment logic and preserves the exact customer step on return.
- Makes `visibilitychange` evidence only; it cannot independently reset a customer session.
- Keeps the configured kiosk idle timeout authoritative for true abandonment and purges transient customer cargo before returning to exact-vessel safe home.
- Adds a bounded, non-PII runtime event journal with vessel/outpost/session/correlation identity as the seed contract for the future Fleet Activity Spine.
- Establishes the fleet authority grammar: Owner operates the vessel business; Engine operates the platform; Captain commands fleet operations; Admiral governs the fleet.
- Defines Control Plane vs Vessel Data Plane, release rings, first-class station identity, executable capability-manifest requirements, and proving-vessel graduation rules without moving vessel data or authority.
- Adds release-blocking Golden Voyages and regression gates for system-handoff preservation and fresh-process kiosk recovery.
- Keeps the release at the 85-file handoff ceiling with canonical identity `8.8.15.0 / fleet-runtime-88150`.

# Dark Sky 8.8.14.23 — Deck Signal

- Makes every expandable Deployment Shipwright control unmistakably interactive with stronger button surfaces, OPEN/OPENED state pills, tap/pressed feedback, keyboard focus, and consistent styling across Outpost behavior, Operational Details, and Manifest Details.
- Keeps advanced controls professional and visually quieter than primary actions while eliminating the static-card ambiguity found during iPad Sea Trial.
- Extends deployment save confirmation visibility before rerender so consequential changes remain readable while durable saved state remains visible afterward.
- Preserves Kiosk Standing Watch, Route Safe, Settings Keel, 26 durable Ike orders, owner settings CURRENT, exact-vessel authority, and Admiral read-only boundaries.
- Canonical identity: 8.8.14.23 / deck-signal-881423.

# Dark Sky 8.8.14.23 — Route Safe

- Repairs the Owner Route Safe crash caused by an undefined `OWNER_ROUTE_STARTED_AT` timing symbol.
- Authority timing now derives from the active auth start with page-start fallback, so owner recovery can never fail just because telemetry is unavailable.
- Preserves Kiosk Watch WEB/KIOSK/HYBRID behavior and all Settings Keel durability work.
- Keeps the release at 85 files with canonical identity 8.8.14.23 / deck-signal-881423.

# Dark Sky 8.8.14.23 — Route Safe

- Added dedicated `owner_sync_business_settings` path so owner settings can become durable independently of order snapshot latency.
- Bootstrap Witness now separates authority proof, settings durability, and order reconciliation.
- Verified owner work remains available while background durability catches up.
- Local recovery no longer leaves PASSAGE CHECKING ambiguous; it is explicitly labeled recovery-only.
- Preserves 26 durable Ike orders and exact-vessel owner / read-only Admiral boundaries.

# Dark Sky 8.8.14.23 — Route Safe

- Cuts owner-route latency by reusing the password-grant user/session and resolving exact-vessel authority with one bounded RPC instead of sequential identity reads.
- Removes redundant client-side membership checks from server-authorized owner RPCs.
- Batches durable order + owner-settings synchronization into one Fleet Core snapshot write, then merges cloud records in the background.
- Bootstrap Witness now reports route timing and confirms when both orders and owner settings are current.

# Dark Sky 8.8.14.23 — Route Safe

- Replaces the multi-query post-login owner authority resolver with one exact-vessel Fleet Core RPC.
- Owner portal paints immediately after authority verification; durable order/settings synchronization is detached into the background and can no longer hold the owner at “Verifying owner authority…”.
- Adds bounded authority/network checks with a deterministic safe failure instead of an indefinite route shield.
- Adds Bootstrap Witness: a small owner-side passage witness that shows route verification and background durable-sync state without exposing credentials or expanding Engine authority.
- Preserves Fleet Owner Spine, Owner Steady navigation, Session Current, Auto Signal, six-vessel Fleet Core, and Admiral read-only boundaries.

# Dark Sky 8.8.14.23 — Route Safe

- Repairs the atomic release identity mismatch that correctly triggered RELEASE RECOVERY REQUIRED in 8.8.14.13.
- Aligns document, deployment manifest, service worker, release gate, inventory, PWA manifest, and runtime seal to one canonical identity: 8.8.14.23 / deck-signal-881423.
- Preserves Owner Steady navigation, Owner Spine durability, exact-vessel owner authority, Fleet Watch, and Admiral read-only observability.

# Dark Sky 8.8.14.23 — Route Safe

- Removed the 120 ms owner-subview blanking window that could expose an empty panel while Settings or other async views were still loading.
- Owner subviews now finish rendering off-screen, then commit in one deterministic swap on the next paint.
- Added a transition token so an older async view cannot overwrite or bounce back over the newest owner navigation.
- Preserved the Fleet Owner Spine: standalone owner operation, durable vessel records, exact-vessel authority, audited support separation, Fleet Watch, and Admiral read-only observability.

# Dark Sky 8.8.14.23 — Session Current

- Turned Ike’s Owner Orders from read-only cards into a clear authenticated operating surface.
- Added deliberate `MANAGE` → status workflow: New → In Production → Ready for Pickup → Completed.
- Added owner queue summary cards and durable save confirmation.
- A real owner status change now automatically publishes a bounded Watch signal immediately; no customer identity, wording, price, photos, or order details cross the bulkhead.
- Clarified authority: Engine may route into Owner Bridge, but only the verified exact-vessel owner session can modify the business. Return to Black Flag is navigation, not authority.
- Preserved Admiral read-only observability, six-member Fleet Core isolation, Bootstrap Build separation, full-frame viewport behavior, and manual Watch publishing.


## 8.8.14.23 — Session Current
- Unified live Ike owner authentication across same-origin Black Flag tabs so Fleet Watch reuses the freshest Supabase owner session instead of drifting from the Owner Bridge.
- Added refresh-token handoff/retry against the shared current session to survive token rotation in another open tab.
- Auto Signal now reports bounded queue posture (New / In Production / Ready / Completed) instead of only total open orders.
- Preserved exact-vessel owner authority, Admiral read-only observability, and no customer/order-detail leakage.


## 8.8.14.23 — Owner Spine
- Fleet-wide Owner/Partner operating contract: each vessel is designed to run directly from its own Owner Control Center without entering Engine.
- Added vessel-scoped durable business record synchronization to Fleet Core for owner orders and owner settings.
- Added direct owner-entry visibility in Settings and explicit separation between owner authority and Black Flag support access.
- Owner order status changes now best-effort synchronize to the vessel’s durable Fleet Core record before emitting bounded Auto Signal.
- Owner Settings exposes durable order count, local working-set count, standalone mode, manual sync, and direct owner-entry link.
- Existing Admiral Watchtower remains read-only; Bootstrap Build remains outside Fleet Core.

## 8.8.14.23 — Route Safe
- Added a dedicated exact-vessel owner settings keel RPC that guarantees a durable settings row exists immediately after owner authority is proven.
- Owner Settings now self-heals from PENDING by confirming the durable settings keel, then reading Fleet Core truth again.
- Bootstrap Witness separates settings-keel confirmation from the later full local settings snapshot and order reconciliation.
- One bounded settings-keel retry is allowed without blocking the owner surface.


## 8.8.14.23 — Route Safe
- Added fleet-wide WEB / KIOSK / HYBRID deployment modes.
- Added persistent kiosk safe-home reset and same-vessel self-recovery after visibility, page restore, focus, and network return.
- Added a discreet customer-safe Station Ready beacon; no Black Flag/authority diagnostics are exposed.
- Kiosk inactivity now resets customer cargo instead of leaving/closing the vessel.
- Privileged authority remains independently expiring.
