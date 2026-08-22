# Admiral Command Surface Contract — 6.5.0

## Purpose
Ceremonial Mode must translate a Visual Forge-installed scene into a real fleet-governance command surface. The visual is an environment layer only; authority, routing, readiness, controls, live fleet state, and safe areas remain real HTML/JavaScript.

## Mode split
- **Ceremonial Mode**: forged environment + responsive live command rails/dock.
- **Professional Mode**: clean governance console with the same authority and data, no theatrical visual dependency.

## Live-only information
Baked-in values in artwork are never authoritative. Vessel counts, sailing outposts, Sea Trials, readiness domains, recovery actions, and reports come from Dark Sky runtime state.

## Governance states
Working controls are READY. Planned governance controls remain visible as FUTURE and return intentional feedback rather than failing silently.

## Isolation
The Admiral visual slot cannot alter Captain, Black Flag, project, Client Preview, project-admin, or customer-experience visuals.

## Promotion
Access to the trial Admiral's Deck does not confer rank. Fleet Readiness proves the fleet; Admiral commissioning remains a separate Captain-owned decision.
