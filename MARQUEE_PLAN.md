# Marquee arcade pass

Goal: carry the cabinet's easy selection and legible controls into the existing Fleet Arcade.

Design decision: keep the existing seven games, art, rules, saves and verified Admiral entrance. Replace the oversized baseball shelf feature with equal game cards. Show each game's cleared count and next challenge, retaining Lantern Run's entrance. Put touch and keyboard controls beside the chosen challenge. Keyboard arrows browse visible rows; Enter uses the existing button action; Escape returns from challenges. Controller navigation retains its existing mapping.

Alternatives considered: a new cabinet game would leave the current collection's entry friction; a renderer rewrite would put unrelated gameplay at risk. This pass changes the shared arcade shell only, following the Captain's standing direction to apply useful lessons across games.

Implementation sequence
- [x] Reconcile latest source with public Git tree and signed-out Pages assets.
- [x] Add regressions for independent per-game progress and menu navigation, observe the missing behavior.
- [x] Update the shared player shell, loader edition/digest and manifest asset checksum together.
- [x] Check selection, controls, start/pause/return and phone/tablet layout locally, using synthetic game progress only.
- [x] Run the existing 50-suite gate plus the new arcade regression, seal and package against the exact public tree; verify patch reconstruction and rollback.

Review focus: all-cleared games; middle gaps in cleared challenges; keyboard focus on pace checkbox; controller focus after returning; long labels on narrow screens. Touch hardware, paired controllers and live authenticated acceptance remain Captain checks. No private records or network mutations.
