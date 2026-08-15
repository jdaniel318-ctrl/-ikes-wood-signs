# Dark Sky / Black Flag Engine

**Current release:** v3.8.15 — Commissioning Reliability & Clarity

This release repairs the project shipyard so new vessels can be commissioned reliably on iPad while preserving the v3.8.13 visual-capability architecture, v3.8.11 Sea Trials, immutable project identity, Project Control navigation, and fleet foundations.

## What changed
- Commissioning actions are rebound every time the workspace opens or rerenders.
- Continue, Back, Save Draft, and Reset Draft now run through one commissioning command controller.
- Continue either advances or displays a visible field-level validation/error state; silent failure is treated as a defect.
- The commissioning workspace is fully opaque; Engine telemetry and controls no longer ghost through behind it.
- Reset Draft is separated from the normal voyage actions.
- Progress states, form labels, action hierarchy, and validation feedback are easier to read/use on iPad.
- Release telemetry reflects the active schema 7 / policy 3.5 foundation.

## Current course
Test a new vessel through all six commissioning steps. If the shipyard is reliable, continue Sea Trials and then move into **v3.9 — Operating Models**.

## Security boundary
The current GitHub Pages/browser-local build remains a private/test platform. Real unrelated production tenants still require server-backed identity, authorization, secrets, tenant controls, revocation, and durable server-side audit.
