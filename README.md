# Workshop Engine v2.9.65 — Owner & Deployment Foundation

## What this release establishes
- Project Owner Access is now a first-class project Control Center area.
- Owner identity, claim state and project-scoped capability grants are stored per project.
- Owners are structurally below Black Flag/Engine/Captain authority and cannot cross project namespaces.
- Existing deployment/outpost records are surfaced to the owner-access layer without granting Engine credentials.
- Engine project cards now show both platform admission status and owner-access status.

## Captain authority
- Captain management snapshots now include platform admission and owner state for every project.
- Powder Keg now contains a live **Business Admission Authority**.
- Captain may Approve/Restore, Suspend, or Refuse a business.
- Suspension/refusal requires a Captain reason and explicit confirmation.
- Suspension/refusal removes public publication and returns active/Sea Trial deployments to harbor.
- Business records are preserved: no ledger, marketing, customer or project record is rewritten by this authority.
- Other dangerous Powder Keg actions remain review-only.

## Owner boundary
The Project Owner layer is intended to run the owner's own business:
orders, customers, products, pricing, branding, kiosks/deployments, staff, reporting and notifications.
It does not grant Black Flag, Engine Room, Captain, other-project, cross-ledger or cross-marketing authority.

## Current scope / next phase
This is the local architecture and management foundation. It does **not** pretend that a real remote owner account or remote kiosk activation service exists yet. Those require a server-side identity/device-token service before deployment to arbitrary outside owners/devices.

## Assets
No assets added, removed, renamed or replaced.
