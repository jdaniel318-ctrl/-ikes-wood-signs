# Dark Sky 5.5.0 — iPhone Compatibility Audit

Scope: customer experiences, contractor intake, Black Flag Engine, Project Command cards, Project Control/Admin, commissioning, Experience Test Deck, PIN gates, and Captain surfaces.

## Mobile contract
- Uses `viewport-fit=cover` and iPhone safe-area insets.
- Uses dynamic viewport height where supported so Safari's toolbar/keyboard do not strand fixed overlays.
- All text inputs/selects/areas render at 16px on narrow screens to prevent Safari focus-zoom.
- Primary touch targets are at least ~44–50px high on narrow screens.
- Desktop minimum widths are removed on phone.
- Wide navigation/progress structures become horizontal swipe rails instead of compressed unreadable controls.
- Fixed return/test controls respect bottom/right safe areas.
- Commissioning and contractor request actions remain reachable above the home indicator.
- Engine project cards become a single-column command stack on phone.
- Test Deck becomes single-column and keeps its Return action reachable.
- Project Manager/Admin navigation scrolls horizontally rather than overlapping.
- Contractor landing/intake becomes single-column with a phone-readable hero and sticky request actions.
- Captain overlays are constrained to the visible mobile viewport without changing Captain authority.

## Isolation / authority
This is a layout-only mobile hardening pass. Project IDs, project storage namespaces, project assets, project admin authentication, Engine authentication, Captain authentication, and Test/Private Preview safety rules are unchanged.

## Sea-trial widths
Targeted CSS breakpoints cover common iPhone portrait widths through 430px and narrow mobile through 767px, with existing tablet/iPad rules retained above that range.
