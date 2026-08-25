# Breakwater Authority Handoff Contract — Dark Sky 8.0.1

## Mission
Customer, Owner / Partner, and Captain are separate authority routes over one canonical fleet registry.

## Owner / Partner handoff
- Fleet Dock Owner / Partner actions arm the immutable Project ID and navigate directly to an explicit `surface=owner` route.
- The Black Flag Engine gate must never paint, claim, or authenticate an explicit owner route.
- Active owners enter only their project-scoped Control Center; unauthenticated owners see only that project's owner login.
- Owner refresh restores the owner route. Owner sign-out returns to the owner login, never Engine Access.
- `owner.html` remains a durable outside-owner entrance, but Captain-to-owner navigation does not depend on an intermediate redirect.

## Captain boundary
- Normal `index.html` without an explicit protected surface is Engine authority.
- Engine PIN is Captain/Engine-only and is never a project-owner credential.

## Fleet truth
- Fleet Dock, metrics, readiness, Project Tools, callsigns, and owner state consume the same canonical registry established by Keelson.

## Interaction proof
- Consequential actions leave a durable visible state.
- Transient confirmations remain visible long enough to read on iPad/iPhone.
