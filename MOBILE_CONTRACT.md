# Dark Sky Responsive Customer Contract — 4.9.0

Permanent project requirement:

- iPhone portrait is a first-class customer target, not a fallback.
- iPhone landscape, iPad portrait/landscape, and desktop must remain functional.
- Touch targets must be large enough for finger use; essential actions may not depend on hover.
- Forms must not require horizontal scrolling or browser zoom.
- iPhone safe-area insets must be respected at the top, sides, and home-indicator edge.
- Camera/photo capture must remain reachable from mobile customer flows where enabled.
- Project Settings and Dark Sky return controls must remain reachable without covering primary customer actions.
- Customer state must reset cleanly on Start New / Start Another and when leaving a project.
- Project-specific mobile improvements do not automatically alter another project's branding, workflow, or data.
- Shared responsive primitives may be promoted only after regression testing.

Certification status in 4.9.0:
- BOR North Richmond: first full mobile-first implementation.
- Existing fleet projects: preserved from 4.8.5; mobile certification to be completed project-by-project rather than through an unsafe global restyle.
