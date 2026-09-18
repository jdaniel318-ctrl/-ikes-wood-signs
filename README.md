# Dark Sky 8.8.15.7 — Fleet Truth

Fleet Truth keeps Station Registry and release-ring governance literal at the Admiral surface: zero means zero, local means local, active means active, and retained history never masquerades as current posture. The future Admiral can now see the difference between a local deployment manifest and a registered Fleet Core station, preview the exact identity before registration, and issue registration only with a fresh server fingerprint and recorded intent.

## What changes
- **Durable station identity** — Fleet Core stores station key, exact vessel, display name, WEB/KIOSK/HYBRID mode, lifecycle state, runtime release, policy version, profile, recovery count and heartbeat posture.
- **No invented migration** — existing Deployment Shipwright outposts remain local until deliberately adopted. Fleet Spine shows them as **LOCAL ONLY** rather than silently creating records.
- **Preview-before-register** — Admiral station registration uses the same visible proof discipline as release courses: exact before/after identity, fresh fingerprint, explicit intent, then issue.
- **Heartbeat truth** — registration does not fabricate station health. A newly registered station remains **AWAITING HEARTBEAT** until a real runtime heartbeat arrives.
- **Bounded Control Plane bridge** — the browser exposes only project ID, station/outpost identity, mode/state/profile/runtime metadata. No customer, order, photo, pricing or private business payload crosses into Fleet Spine.
- **Activity Spine integration** — station registration/update/recovery events render as human-readable durable fleet events with technical detail behind disclosure.
- **Fleet-level readability preserved** — Admiral Lens type scale, selected states, durable previews and readable Activity Spine remain intact.
- **Fleet Core migration applied** — Station Registry schema/RPC contracts are installed in the connected Fleet Core. No fabricated station rows were seeded.

## Fleet doctrine
**Owner operates the vessel business. Engine operates the platform. Captain commands fleet operations. Admiral governs the fleet.**

A station is a durable endpoint identity, not a customer session. Customer cargo is never Station Registry payload. A release ring is not a station heartbeat. A local outpost is not a Fleet Core station until registration is explicitly previewed and issued.

## Required proving voyage
Authenticate Admiral → open Fleet Spine → inspect **Station Registry** → verify any browser-local outpost appears as **LOCAL ONLY** → select it → record station-registration intent → **PREVIEW STATION IDENTITY** → inspect exact proof → only then consider **REGISTER EXACT STATION**. After registration the station must show **AWAITING HEARTBEAT**, not a fabricated healthy state.


## 8.8.15.7 Fleet Truth
- Zero registered stations resolve immediately to a durable empty state instead of remaining on “READING STATIONS…”.
- The Control Plane summary now reports ACTIVE RELEASES, not historical release-assignment rows.
- Historical release records remain retained for continuity and rollback context.
- Station Registry continues to keep local manifests LOCAL ONLY until deliberate preview + registration.
