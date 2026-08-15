# Dark Sky / Black Flag Business Command Platform

**Current release:** v3.8.27 — Unified Engine Authentication

Dark Sky is the platform and shipyard. The Black Flag Engine is the first operational ship: it commissions isolated projects, gives each business a Project Control Center, and launches customer-facing outposts without requiring every new project to inherit Ike's original sign workflow.

## Current release focus
The Deployment Shipwright now guides operators through one plain-language voyage:

**Configure → Save → Sea Trial → Test → Active**

- The current step and required next action are shown prominently.
- Basic outpost settings stay visible; session/device/capability controls are collapsed under **Advanced Outpost Settings**.
- Readiness, health, backward lifecycle controls, and diagnostics are collapsed under **Operational Details**.
- Manifest IDs and technical isolation records remain under **Advanced → Manifest Details**.
- The universal customer shell remains isolated from legacy Ike customer chrome.
- A universal project needs a customer-ready offer and a completed Sea Trial test order before activation.

## Canonical repository files
The Captain upload package intentionally stays lean. Runtime capability is in the code, not in a pile of release-audit documents.

- `index.html`
- `styles.css`
- `app.js`
- `platform_core.js`
- `platform_identity.js`
- `captain.js`
- `sw.js`
- `manifest.webmanifest`
- `README.md`
- `CHANGELOG.md`
- `ARCHITECTURE.md`
- `assets/` referenced by the runtime

Historical build audits are development records and do not need to remain in the live GitHub root once their durable decisions are consolidated into the canonical docs above.

## Platform doctrine
- **Names can change. Identity cannot.** Immutable Project IDs own project data and deployment boundaries.
- **Data isolation and presentation isolation are both required.**
- The Engine is the first ship, not the fleet. Captain's Quarters remains the future shipyard for separate products that reuse proven Dark Sky primitives without inheriting Engine-specific baggage.
- The current GitHub Pages/browser build remains a prototype boundary; unrelated production tenants ultimately require server-side identity, authorization, secret management, and durable storage controls.
