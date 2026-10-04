# Blackwake 8.8.20.27 — current acceptance scope

Blackwake is a client test candidate for the recovered-voyage authorization path. It preserves IronLatch recovery disclosure behavior and changes the unverified recovered-voyage primary action to **VERIFY ADMIRAL & RESUME**.

A recovered voyage may clear its hold only after the existing Admiral gate succeeds and Fleet Core read-back confirms the exact saved draft/voyage pair. Failure, mismatch, or unavailable server evidence keeps the recovery hold in place and does not publish, grant ownership, appoint a Captain, or create a replacement voyage.

## iPad acceptance

1. Upload all files inside `DarkSky882025-Blackwake` to the existing site root and confirm **8.8.20.27 / BLACKWAKE** on the Engine.
2. Open **Commission New Project** and confirm VoyageKeeper remains at Step 5 with **Sync Needed / Recheck Required**. The primary recovery action must read **VERIFY ADMIRAL & RESUME**.
3. Tap it once. Complete the existing Admiral gate. Stop on the returned commissioning screen and capture the result before using Continue. A mismatch or failed read-back must remain held.


## 8.8.20.27 — Blackwake
Verified recovered voyages now enter 06 · Review deterministically from Continue Voyage. Entering Review is navigation-only: no commission, publication, owner handoff, or Fleet Core mutation is issued. Review carries the exact recovered voyage identity and SERVER SAFE / NOT PUBLISHED truth.
