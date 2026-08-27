# 8.3.4 — HarborExit

## 8.3.2 — SmokeTruth (superseded)
- Forced Style B lowercase to uppercase; sea trial proved this was the wrong CX contract.
- Added a tall/narrow transform, but compensating font-size math made the rendered Style B too heavy/wide on iPad.
- Preserved Dock Lock and artifact continuity; those contracts remain carried forward.

## 8.3.4 — HarborExit correction
- Reversed the 8.3.2 uppercase-only regression: Ike now preserves customer-entered uppercase and lowercase exactly.
- Style B accepts the approved mixed-case customer alphabet and blocks unsupported glyphs without silent substitution.
- Rebalanced Style B toward the tall/narrow SMOKE HOLE! silhouette without the horizontal compensation that made 8.3.2 too heavy and wide.
- Added an automated HarborExit regression gate for uppercase, lowercase, mixed case, unsupported punctuation, and immutable-artifact continuity.
- Preserved 8.3.1 Dock Lock, Style A behavior, orientation/species detectors, order idempotency, and approved-artifact locking.

## 8.3.4 — HarborExit iPad case-input correction
- Fixed the actual iPad wording control: removed `autocapitalize="characters"`, which was still forcing uppercase even though the case-preservation helper passed.
- Added a CSS production-intent guard (`text-transform:none`) on Ike's wording input.
- Strengthened the Proving Ground gate to inspect the real `#ikeWordingInput` control, not just the helper function, so this exact regression cannot falsely pass again.
- Preserves Dock Lock, Style A, Style B tall/narrow calibration, protected detectors, duplicate-order protection, and immutable approved-artifact continuity.
