# Dark Sky 4.3.7 — Showroom Restore

- Restored Ike's existing customer ordering showroom from Project Command → Continue Launch when its published bespoke shell is available.
- Preserved Ike's V4 launch/deployment state instead of falsely marking a legacy showroom preview as a completed V4 deployment.
- Replaced the obsolete `customer` launch-tab route with the supported `experience` Project Control tab.
- Added backward-compatible project-tab aliases (`customer` → `experience`, `deployments` → `deployment`).
- Added a visible Project Route Recovery panel so an unsupported project-tab route cannot produce an empty body.
- Added audit/diagnostic evidence for showroom compatibility and recovered legacy routes.
- Advanced runtime/cache generation to 4.3.7 without changing projects, orders, customers, admissions, quarantine, or Captain/Engine security boundaries.
