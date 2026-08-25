# Dark Sky 8.0.7 — Visual Helm

**Candidate release:** 8.0.7 Visual Helm  
**Known Good anchor:** 7.8.4

**Pre-sea-trial audit:** R1 preserves the untouched source photo across repeated 90° rotations so visual evidence does not degrade with each turn.

Visual Helm turns the customer's photo into the orientation authority. Customers rotate the photographed plank until it looks like the finished sign should hang; the top of that image is then the top of the sign. The design workspace follows the photo instead of asking customers to manage abstract TOP/orientation controls.

## What changed

- Added repeatable 90° **Rotate Left / Rotate Right** controls during photo review.
- The rotated photo is persisted as the order image; **top of photo = top of sign**.
- Removed Ike's normal design-step TOP/orientation button cluster and replaced it with a visual orientation cue.
- Vertical boards receive orientation-aware text layout automatically.
- Lettering choices now reflect two real Ike sign directions: **Bold Block** (RAMJET-style) and **Tall Western** (SMOKE HOLE!-style), plus a Classic Serif option.
- Ike's back-side stamp is treated as non-authoritative visual content and is not used to set top/orientation.
- Camera controls follow forward-action placement: cancel/secondary left, **Take Picture** right.
- Persisted orders no longer retain full secondary verification-photo payloads; they keep the derived recognition evidence instead. This addresses the storage growth observed during repeated sea trials.
- Rangefinder/Sentry species, orientation, length, pricing, Owner Bridge, and canonical fleet protections remain intact.

## Acceptance test

Photograph a 2 ft cedar plank, rotate the photo as needed, then use it. Confirm that the app treats the top of the rotated photo as sign top, identifies horizontal/vertical from the resulting board geometry, adapts lettering placement, and never asks the customer for a separate TOP selection in the normal Ike flow. Test Bold Block and Tall Western against the supplied real-sign reference image.

See `VISUAL_HELM_CONTRACT.md` and `CHANGELOG.md`.
