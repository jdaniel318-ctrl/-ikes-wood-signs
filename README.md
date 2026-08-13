# Workshop Engine v2.9.63 — Mop the Deck

This is a structural visual cleanup, not a band-aid pass.

## What was cleaned
- Removed the entire accumulated Engine/Captain visual patch stack from v2.9.54 through v2.9.62 (54,549 CSS characters).
- Replaced it with one authoritative Engine Room / Captain Command presentation layer.
- Removed 23 earlier Pirate-mode rules that could style project/customer-specific surfaces.
- Removed the Engine benchmark screenshot as a live CSS background. It remains in assets as a benchmark/reference only.
- Made the Engine masthead and all operational panels opaque to eliminate ghost UI/background bleed.
- Standardized project-title, body-copy, form, filter, button and status contrast.
- Established one simple z-index ladder.
- Consolidated Business Mode and Pirate Mode presentation while keeping the same Engine machinery underneath.
- Consolidated Captain Command styling while preserving the working five-button architecture.
- Kept Company Registry and old Engine telemetry DOM only as compatibility support for existing render functions; they remain intentionally hidden from the daily Engine surface.

## Functional safety
- app.js is byte-for-byte unchanged from v2.9.62.
- captain.js is byte-for-byte unchanged from v2.9.62.
- Project workflows, data, permissions, deployment, storage, Captain authority and isolation logic were not changed.

## Appearance boundaries
- Business/Pirate appearance is Engine-only.
- Customer/project shells are not repainted by Engine appearance.
- Pirate Mode no longer uses a screenshot containing fake UI beneath live controls.

## Assets
No assets added, removed, renamed or replaced.

## Maintenance rule
Future visual band-aid/override fixes should not be added without Captain approval. Visual defects should first be traced to their root selector/layer and reported before code is changed.
