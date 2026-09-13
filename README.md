# Dark Sky 8.8.14.14 — Release Current

Release Current hardens Owner/Partner navigation after the Owner Spine rollout. Owner subviews now render completely before the previous surface is removed, preventing blank panes, scroll-triggered paint, and delayed rollback on iPad. A transition token prevents older asynchronous view loads from overwriting the newest owner navigation. The Fleet Owner Spine, durable vessel records, direct owner entry, exact-vessel authority, Fleet Watch, and Admiral read-only boundary remain unchanged.

Engine remains a route and support surface. Opening Owner Bridge from Engine does not grant Engine owner authority; the live Supabase exact-vessel membership is the authority. Admiral remains read-only. The six-member Fleet Core and Bootstrap Build’s separate Admiral Program class are preserved.


### 8.8.14.14 Session Current
Owner Bridge and Fleet Watch now consume one synchronized live owner identity across Black Flag tabs; Auto Signal reports bounded queue posture only.
