# Plankfit · 8.8.20.92

Your plank now uses less vertical space on landscape iPads. Photo controls,
rack selection, reference-photo button and Make it mine stay together.
Photo-check guidance opens on demand. Portrait, enlarged text, optional
expanded guidance and smaller screens may scroll; content is never hidden
just to force a fit.

Unmeasured board-size readouts are omitted from the customer request,
review/receipt, and the embedded photo editor Board tab and preview label.
Actual shop-recorded measurements remain visible. Existing advanced object
size and position controls retain their working units; design geometry is unchanged.

## Install and test

1. Extract `DarkSky882092-Plankfit-Upload.zip`. Upload every file inside its one
   folder to the existing repository root, replacing matches and keeping all
   other files. Confirm the Engine shows **8.8.20.92 · PLANKFIT**.
2. Open Ike's private preview, choose Design my sign, and check the entire
   empty plank step fits on your landscape iPad with Safari's tabs visible.
3. Add a photo and confirm the photo controls, rack selection, Add a reference
   photo and Make it mine are visible. Send that screenshot before continuing.

Browser layout QA is synthetic Chromium, not native iPad Safari or a camera
field test. The HTTP-only QA fixture uses a test-only secure-origin/hash shim;
production source retains its secure-context guard. No customer data was used.

## Scope and remaining field notes

This focused update does not change capture zoom, session limits, Engine or
Admiral access, stored projects, or the Truebound boundary repair. Pending:
- Investigate the camera's perceived zoom / two-foot capture distance while
  keeping the new capture screen.
- Add five minutes to Ike's preview inactivity window.
- Provide ship-specific customer timeout controls in the Engine, separately
  from Engine/Admiral security sessions.

Nothing has been deployed by this build. Backend idle-v1 prerequisites remain
as recorded in PATCH_CONTRACT.json. FullBackup is application source only;
it is not a backup of business records or photos. Software rollback restores
.91 code and does not undo confirmed boundary repairs or user data.
