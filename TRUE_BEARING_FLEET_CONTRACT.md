# True Bearing Fleet Contract — 7.9.1

## Primary navigation
Fleet Dock is the normal fleet navigator. The Captain chooses a vessel first, then the authority route. Advanced Project Command remains available for deeper administration but is not the navigation backbone.

## Three authority routes
1. Customer Experience — business-facing customer journey only.
2. Owner / Partner — project-scoped self-service for the independent business owner.
3. Captain — Black Flag commissioning, governance, security, isolation, and fleet-level control.

Test / Preview is a safe operating mode, not a fourth authority.

## Canonical identity
Immutable Project IDs remain the security and data boundary. Human-facing business identity may be deliberately corrected without changing that Project ID. A strict duplicate-business reconciler may fold duplicate vessel rows only when business identity agrees and available contact evidence does not conflict. Project-scoped references are migrated before the duplicate row is removed.

## Owner path
If owner access is not configured, Fleet Dock routes the Captain to project-scoped owner setup. If owner access is configured, Fleet Dock routes to the owner entrance. Active owners operate their vessel within approved capabilities without Black Flag credentials.

## Scale
Fleet Dock must remain searchable, filterable, status-aware, and priority-sorted as the fleet grows. Hard-coded vessel-specific shortcuts may exist only as optional conveniences, never as the architecture.
