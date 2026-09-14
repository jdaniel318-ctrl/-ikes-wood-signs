# Dark Sky 8.8.14.23 — Deck Signal

Deployment controls now visibly behave like controls: obvious OPEN/OPENED affordances, pressed/focus states, and durable save confirmation, while Kiosk Watch and all fleet authority boundaries remain unchanged.

# Dark Sky 8.8.14.23 — Route Safe

Owner-route telemetry is fail-safe: missing timing metadata can no longer prevent the authenticated owner surface from opening. Kiosk Watch remains intact.

# Dark Sky 8.8.14.23 — Route Safe

Route Safe hardens the fleet owner spine for scale: exact-vessel owner settings sync through a dedicated bounded write before slower order reconciliation, Bootstrap Witness reports authority/settings/order phases separately, and owner work never waits on durability reconciliation. Kiosk/customer persistence remains a separate fleet operating mode concern from privileged owner sessions.

# Dark Sky 8.8.14.23 — Route Safe

Owner entry is optimized for fleet scale: one exact-vessel authority proof opens the business, while durable orders and settings synchronize in a batched background passage.

# Dark Sky 8.8.14.23 — Route Safe

Post-login owner authority resolves in one exact-vessel check; the owner portal opens before durable business sync, which continues safely in the background. Bootstrap Witness makes that passage visible without granting Engine authority.

# Dark Sky 8.8.14.23 — Route Safe

Route Safe hardens Owner/Partner navigation after the Owner Spine rollout. Owner subviews now render completely before the previous surface is removed, preventing blank panes, scroll-triggered paint, and delayed rollback on iPad. A transition token prevents older asynchronous view loads from overwriting the newest owner navigation. The Fleet Owner Spine, durable vessel records, direct owner entry, exact-vessel authority, Fleet Watch, and Admiral read-only boundary remain unchanged.

Engine remains a route and support surface. Opening Owner Bridge from Engine does not grant Engine owner authority; the live Supabase exact-vessel membership is the authority. Admiral remains read-only. The six-member Fleet Core and Bootstrap Build’s separate Admiral Program class are preserved.


### 8.8.14.23 Session Current
Owner Bridge and Fleet Watch now consume one synchronized live owner identity across Black Flag tabs; Auto Signal reports bounded queue posture only.


### Route Safe
Customer deployments now support WEB, KIOSK and HYBRID modes. Kiosk persistence is customer-surface-only: idle sessions purge/reset safely, and recovery restores the exact vessel home without exposing fleet authority. Device-level Guided Access / Single App Mode remains the correct protection against iPad/Safari process termination.
