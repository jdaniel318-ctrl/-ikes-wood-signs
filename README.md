# Workshop Engine v2.9.64 — Review Cleanup

This release applies the first three items from the Captain's review without adding cover-up layers.

## Review Item 1 — Engine PIN contrast
- Raised contrast on Engine Room title, subtitle, PIN labels, footer/help copy, mode selector and PIN field.
- Business/Pirate selection is clearer at normal iPad viewing distance.
- Business entry no longer presents a pirate graphic.

## Review Item 2 — Business Mode identity
Business Mode is now a professional operations environment, not Pirate Mode with decorations removed.
- Removed pirate graphics from Business Engine surfaces.
- Professionalized typography, geometry, project cards, instrumentation and control styling.
- Business terminology:
  - Orders
  - Recovery Status
  - Storage
  - System Status
  - Platform Operations / System Operations
- Pirate terminology remains available only when Pirate Mode is deliberately selected.
- Captain's Quarters remains the one nautical/Captain access point visible from Business Mode.
- Removed the dead Fleet Overview navigation link that pointed to a hidden compatibility registry.

## Review Item 3 — Captain's Quarters structural artifacts
Root causes were removed rather than covered:
- The light rectangle over the Dark Sky map came from the old `.cq-interactive-map::after` border surviving after the map became a transparent cinematic hotspot. That pseudo-element is now explicitly disabled in cinematic mode.
- The small box over Captain's Log came from obsolete transparent desk-object buttons still layered over the cinematic artwork. The four duplicated legacy desk controls (Log, Cargo, Black Flag, Powder Keg) were removed from the DOM and their command listeners removed.
- The five painted lower command buttons remain the sole command-door system.
- Touch hotspots no longer leave persistent iPad focus/tap rectangles; keyboard focus indication remains available on pointer/keyboard devices.
- The unique Dark Sky map, desk Blueprint, First Mate's Watch and Spyglass controls remain functional.

## Safety
- No project data, namespace, deployment, order, permission, storage or Captain authorization model was changed.
- Hidden Engine Reset binding target is preserved because `app.js` still depends on it.
- No new destructive actions were enabled.

## Assets
No assets added, removed, renamed or replaced.
