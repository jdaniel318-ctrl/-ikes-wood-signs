# Dark Sky Responsive Customer Contract — 4.9.1

All current and future customer-facing vessels must remain viable on iPhone, iPad/tablet, and desktop.

## Required behavior
- iPhone portrait is a first-class commissioning target.
- Vertical document scrolling must remain available even inside horizontally swipeable components.
- Keyboard focus must not trap or permanently compress the page viewport.
- Controls must be touch-sized and not depend on hover.
- Fixed/sticky actions must respect device safe areas and must not obscure core content.
- Test/Private Preview cannot initiate real-world contact actions.
- Platform/test navigation is subordinate to project branding; launched standalone projects may hide it entirely.
- Customer temporary state must reset reliably between sessions/requests.

## Certification status
- Signal Restoration: active restoration/mobile reference implementation (legacy internal Project ID retained only for continuity).
- Existing fleet: preserved; certify individually rather than applying global project restyles.


## 5.9.1 iPhone Engine Rule
- Engine Access is vertically and horizontally centered within the usable phone viewport.
- Fleet project cards use horizontal touch scrolling with snap alignment on phones to keep the Engine condensed.
- A visible partial next-card edge may be used as a swipe affordance; cards must not trap vertical scrolling.

## Engine entry on mobile
- The Engine credential field must not assume a fixed PIN length.
- Typing must never auto-submit or move the viewport on the final digit; entry occurs only on explicit submit/keyboard Enter.
- Keep the Engine gate visually stable until Fleet Command is ready, then perform one clean transition.
- The configured Engine PIN remains valid at its configured length; recovery credential 5615 remains separate and valid.

## 6.0.0 Benchmark-aware responsive composition
A saved Design Benchmark may select responsive composition rules for a project, but it does not become customer-facing artwork. Phone, tablet, and desktop adapt the same project identity and content deliberately. Canonical logos render intact at every breakpoint; surrounding layout changes around them. Legacy Plumbing is the proving vessel for the responsive benchmark contract.
