# Keelson Canonical Fleet Contract — Dark Sky 7.9.8

## Purpose
Every Engine fleet surface derives from one reconciled canonical project registry. Fleet Dock is the primary navigator; Advanced Project Command is a secondary drill-down tool.

## Invariants
1. One immutable Project ID represents one vessel.
2. Duplicate business identities are reconciled at the canonical registry source before any fleet surface paints.
3. Fleet Dock, fleet counts, readiness proof, owner state, and Advanced Project Command consume the same canonical roster.
4. Display order never defines vessel identity. Fleet cards show a stable callsign derived from project identity.
5. If duplicate business identities survive canonical reconciliation, Fleet Dock reports an identity hold rather than silently pretending the roster is healthy.
6. Project data is migrated to the surviving canonical Project ID before a duplicate row is removed; project isolation remains sealed.
7. Fleet Dock is the normal operational navigator. Advanced Project Command remains available, collapsed by default, for deeper administration.

## Release intent
7.9.8 is a structural fleet pass: one roster, one set of counts, one navigation spine.
