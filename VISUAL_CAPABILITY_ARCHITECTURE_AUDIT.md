# Visual Capability Architecture Audit — v3.8.13

## Objective
Make visual presentation project-owned and extensible beyond flat surface, cylindrical wrap, and card overlay without hard-coding future businesses into the Engine.

## Implemented
- Six composable capability families: input, placement, transform, preview, approval, output.
- Fifteen starting visual profiles, including no-preview.
- Existing project migration to a normalized `visualPresentation` contract.
- Commissioning field for starting visual profile.
- Project Control visual capability editor.
- Available/foundation status distinction so unimplemented renderers are not falsely represented as production-ready.
- Visual capability contract promoted into Fleet Foundations for future ships.

## Current working renderers
- Flat Surface
- Cylindrical Wrap
- Card / Message Overlay

## Foundation renderer requirements recorded
Curved surface, front/back, multi-zone, bounded print area, perspective, freeform, template overlay, room/environment, vehicle/equipment, arrangement, before/after, multi-view, owner approval, revision loops, print-ready output, and machine-ready export.

## Boundary
Selecting a FOUNDATION capability records the project's requirement and preserves it through configuration. It does not claim that the current customer shell can render that feature yet. Renderer installation/activation remains a later Operating Models task.
