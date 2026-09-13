# Dark Sky 8.8.14.11 — Session Current

- Turned Ike’s Owner Orders from read-only cards into a clear authenticated operating surface.
- Added deliberate `MANAGE` → status workflow: New → In Production → Ready for Pickup → Completed.
- Added owner queue summary cards and durable save confirmation.
- A real owner status change now automatically publishes a bounded Watch signal immediately; no customer identity, wording, price, photos, or order details cross the bulkhead.
- Clarified authority: Engine may route into Owner Bridge, but only the verified exact-vessel owner session can modify the business. Return to Black Flag is navigation, not authority.
- Preserved Admiral read-only observability, six-member Fleet Core isolation, Bootstrap Build separation, full-frame viewport behavior, and manual Watch publishing.


## 8.8.14.11 — Session Current
- Unified live Ike owner authentication across same-origin Black Flag tabs so Fleet Watch reuses the freshest Supabase owner session instead of drifting from the Owner Bridge.
- Added refresh-token handoff/retry against the shared current session to survive token rotation in another open tab.
- Auto Signal now reports bounded queue posture (New / In Production / Ready / Completed) instead of only total open orders.
- Preserved exact-vessel owner authority, Admiral read-only observability, and no customer/order-detail leakage.
