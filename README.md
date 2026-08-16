# Dark Sky / Black Flag — v3.9.1 Command Watch Reliability

Dark Sky now lets each project relationship contract drive its working language and suggested workflow. Projects inherit reusable operating behavior, then may override it without affecting any other vessel.

# Dark Sky / Black Flag Business Command Platform

**Current release:** v3.9.1 — Command Watch Reliability & Visual Refit

Dark Sky is the platform and shipyard. The Black Flag Engine is the first operational ship: it commissions isolated projects, gives each business a Project Control Center, and launches customer-facing outposts without requiring every new project to inherit Ike's original sign workflow.


## v3.9.1 command-watch reliability
First Mate Watch is now a real command router rather than a set of visually active cards with individually rebound click closures. Watch actions route through one controller with busy state, visible success/error feedback, and highlighted destinations. Run Watch and Ship Integrity also expose working state so a command can no longer appear to do nothing. The Watch cards and integrity results use iPad-readable type and clearer signal hierarchy.

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


## Repeatable business understanding
Every project now preserves a long-form Business Brief and a structured operating model derived from it. The original brief and the structured interpretation are stored separately, so owners/Captain can correct Dark Sky’s understanding without losing the source description. The universal customer shell can use that model for adaptive prompts, fulfillment choices, and scheduling fields.


## Customer Engagement Contracts (v3.8.31)

Dark Sky now treats customer activity as a project-specific engagement rather than assuming every vessel ends in an order. Projects can resolve to purchase, service request, quote, booking, inquiry, partnership, application, reservation, or custom-project relationships. The universal customer shell adapts its action language and confirmation receipt to that relationship. Post-submit receipts persist for the current customer session so a successful submission cannot silently fall back to the form.

## Fleet Commissioning Lane (v3.8.30)
New projects now follow one Captain-facing launch journey: Create → Prepare → Sea Trial → Fleet Ready → Live. Engine project cards and Project Control expose one Continue Launch / Join Fleet action, while the existing deployment, customer-test, immutable identity and isolation rules remain underneath.

### v3.9.3 command-surface reliability

Engine Project Command now uses an early-bound delegated command bus for filters, project search, rail arrows, project opening, launch/join-fleet, publishing, Fleet Health links, and Add Project. These controls remain actionable even when a later optional initializer fails. Mission-critical navigation is armed before asynchronous boot work.

### v3.9.2 command reliability
Waters Ahead and structural command controls are now attached to an independent early-bound command bus. This prevents a partial boot or migration warning from producing visually healthy but non-interactive command cards, particularly on iPad/Safari.
