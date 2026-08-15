# Dark Sky v3.8.1 — Command Deck Repair Audit

## Regression repaired
The v3.8.0 Command & Visibility refit exposed mission-critical navigation to ordinary module event wiring. v3.8.1 gives the primary routes their own capture-phase navigation layer:

1. Project Control tab navigation.
2. Project Control Black Flag mark → Engine command deck.
3. Universal project Black Flag mark → Black Flag Engine entry gate.

These handlers bind first and do not depend on a specific project template.

## iPad safeguards
- Primary controls explicitly retain pointer events.
- Touch action is set to manipulation for navigation controls.
- Universal return mark is kept above project surfaces with a dedicated z-index.
- Project Control remains a normal document workspace; no fixed full-screen scroll lock was reintroduced.

## Visual correction
The v3.8.0 overview used large white surfaces. v3.8.1 converts overview, KPI, activity, attention, analytics and command-menu panels to layered navy/steel instrument surfaces while preserving readable contrast.

## Deliberate boundary
This repair does not advance the v3.9 Operating Models work. It stabilizes v3.8 before the next heading.
