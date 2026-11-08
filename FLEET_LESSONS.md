# Practices worth bringing back to the fleet

Use a common flow: understand the goal → act → see the result → choose what is next. Keep each activity's tools and celebration appropriate to that activity.

| Lesson | Implemented example | Evidence to carry when adopting |
| --- | --- | --- |
| Tell people what happened where they are looking | Flight mismatch names both the hit number and target inside the scene; the balloon also reacts. | `flight-browser.cjs`: wrong-hit feedback and unchanged score. Do not rely on color, sound, or a distant footer alone. |
| Completion should match the work | Flight lands on an island with collected-number stars; math retains its bridge. | `flight-browser.cjs`: flight has no bridge mission canvas. New activities need their own outcome. |
| Preserve good control behavior | Same glider steering bounds and smoothing; rendered collision distances account for screen shape. | `flight-unit.cjs`: steering, portrait collision, separated choices. Recheck the target device before changing input feel. |
| Keep actions visible with their work | Painting and puzzle docks; responsive flight target, feedback and finish controls. | Layout scripts and six flight viewports include short landscape and narrow portrait. Shrink decoration before shrinking tap targets. |
| Tool choice and input device are separate | Maker Shapes versus Draw; Draw with finger actually chooses ink and resets the Pencil guard. | `clearpath-browser.cjs`, `maker-pointer-browser.cjs`. Verify a menu-dismiss gesture cannot mark the canvas. |
| A save label must mean a completed save | Flight confirmation follows the existing transaction/readback save path; painting keeps explicit saving/saved/retry states. | Blocked-save flight test; store/race tests. Do not announce success when merely queuing data. |
| Scope every asynchronous operation | Completion captures the active learner; disposing the view cancels its frame loop and observers. | Flight exit, learner isolation and once-only credit tests. Late callbacks cannot write into another screen. |
| Animation has a lifecycle | Flight runs on active frame time, pauses, freezes when hidden, respects reduced motion, and lets the child leave immediately. | Unit pause/hidden test and live reduced-motion browser test. No endless fireworks or compulsory wait. |
| Variety should remain solvable | Five different target numbers; four unique balloon values; safe spacing when a wrong balloon returns. | Seed sweep tests cover round bounds, repetition and spacing. Test generation rules, not one lucky playthrough. |
| Be precise about what a result means | Flight is movement practice; handwriting is child-confirmed, not automatic recognition; passport is metadata, not commissioning. | Existing academic evidence tests and `fleet-return-unit.cjs`. Keep these boundaries explicit. |

## Adoption method

Read the implementation and tests together. Extract the smallest useful component or rule, adapt its wording and sizing to the destination, and test failure paths as well as success. Start with one fleet page and preserve its original flow. No game data, local profile, credentials or fleet authority should travel with these interaction improvements.

Candidate code: `wonderwake_flight.js` (model/lifecycle/presentation), `wonderwake_paint.js` (save and tool states), `wonderwake_drawing.js` (guided answer modes), `wonderwake_quest_ui.js` (puzzle docks) and `wonderwake_store.js` (transaction/readback). These are examples to review, not automatically installed fleet dependencies.
