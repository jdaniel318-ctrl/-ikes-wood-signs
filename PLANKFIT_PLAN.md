# Plankfit implementation plan

Goal: fit the Your plank step on one landscape iPad screen where practical.
Spec: the Captain's November 6 screenshots and request; remove customer-facing
reference dimensions while retaining real measured-board details.

- [x] Keep existing branding and normal document flow; shorten duplicate copy,
  reduce heading/placeholder spacing, align cards and keep touch controls at
  least 44 CSS pixels tall. Collapse secondary photo analysis on demand.
- [x] Remove assumed board-size readouts and display actual recorded measurements.
  Preserve customer/editor data and session transitions.
- [x] Verify empty, photo, rotated photo, expanded guidance, phone/portrait,
  next/back and reset views with the real renderer on a synthetic origin.
- [x] Run integration and full offline release checks. Prepare a coherent .92
  upload over the exact .91 full backup, plus source backup and rollback.

Review focus: Safari chrome reduces height; expanded text must scroll; a rotated
photo must remain inside its card; entering/leaving the step must restore other
layouts; the footer must not overlap required controls.

No deployment or backend/session-policy work is included in this layout patch.

Verification result: 37/37 listed offline suites and Countercraft integration
passed. Synthetic Chromium layout and transition checks passed; native iPad
Safari acceptance remains pending. BUILD_RELEASE.py separately repeats the
checks and only emits packages after reconstruction and rollback readback.
