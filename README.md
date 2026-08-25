# Dark Sky 8.0.6 — Rangefinder

**Candidate release:** 8.0.6 Rangefinder  
**Known Good anchor:** 7.8.4

Rangefinder builds on Sentry by testing a controlled pixel-based length classifier for Ike's known rack sizes. The goal is a one-photo customer experience when the visual evidence clearly supports a stock length, while preserving Ike's final visual review and right to reject a mismatch before production.

## What changed

- Whole-plank pixels now classify against Ike's discrete 2 ft, 4 ft, and 6 ft rack lengths using aspect geometry, framing quality, long-axis stability, and distance from the next-best stock length.
- Pixels are **not** treated as an absolute ruler. A length only clears automatically when the inventory-constrained candidate is strongly separated.
- High-confidence visual length can unlock customer pricing immediately. The order keeps a durable `ownerVisualVerificationRequired` flag and the supporting pixel evidence for Ike's production review.
- Owner Orders shows a visible **Visual Length Check** notice when a visually ranged order still requires Ike's photo verification.
- Manual/rack length confirmation remains the fallback and removes the visual-review requirement for length.
- Sentry orientation and species contradiction guards remain intact.
- Price still requires resolved orientation, species, length, and an active owner species rate.

## Acceptance test

Use the known cedar test plank with one normal full-plank photo and no tape measure. Expected best case: **Horizontal + Cedar + 2 ft + $18** from one photo. If 2 ft does not clearly beat 4 ft/6 ft on the pixel model, ask for one additional full-plank view rather than guessing. Any visually resolved length must remain flagged for Ike review on the resulting order.

See `PIXEL_RANGEFINDER_CONTRACT.md` for the contract and `CHANGELOG.md` for release history.
