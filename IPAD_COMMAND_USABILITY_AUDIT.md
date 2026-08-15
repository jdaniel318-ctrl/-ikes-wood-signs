# v3.8.5 iPad Command Usability Audit

## Objective
Retain the fast two-level Project Control navigation introduced in v3.8.4 while making it easier to read and operate on iPad-class screens.

## Changes
- Removed secondary micro-copy from primary command buttons.
- Increased primary command label and icon size.
- Increased tap target height and padding.
- At 821–1440px viewport widths, primary navigation uses four columns over two rows.
- At 601–820px, primary navigation uses two large columns.
- Phone layouts retain horizontal scrolling with larger minimum targets.
- Contextual sub-navigation receives larger labels, controls, and hit areas.
- Active/expanded states are more visually pronounced.

## Architecture preserved
No Project Control route names, mission-critical navigation handlers, project identity rules, authorization boundaries, or sub-navigation group mappings were changed.
