# Stormwake — a voyage with purpose

## The direction

The Captain's references call for believable pirate characters, expressive faces, worn clothing, warm lantern light, dark timber, and a world with consequences. The rescue should matter to the crew and to the next voyage. A separate arithmetic screen interrupts that purpose.

The uploaded candlelit portrait and 33-second interior scene are visual references. We are taking cues from their lighting, material contrast, expressions, and scene composition. They are not game footage, and this release does not claim to reproduce their image quality.

## Helmsman .43: the immediate work

This upload replaces the bridge's required arithmetic screen with a harbor repair that uses the salvaged gear, timber, and rope. The player operates the repaired winch, sees the mechanism and bridge respond, and opens the channel needed to rescue the chartmaker. The launch also receives the reachable pier-collision repair. Active input in the isolated game is connected to the existing idle tracker without extending the maximum session or granting authority.

The final HELMSMAN_TEST_REPORT.md is the evidence record for what actually passed. Native iPad/Safari acceptance remains a separate check. Existing saved voyages and First Light progress must remain compatible. An exported game file is still required to survive a full page reload or replacement; this upload does not introduce cloud saves.

## Next art milestone: one convincing harbor scene

Build and review a small, playable scene at the loading pier before expanding the map. It should include the Captain, Bootstrap, the launch, a working winch, timber, iron fittings, rope, water, and one lantern-lit conversation. Judge it from the normal playing camera on the Captain's iPad.

| Area | Concrete upgrade | Acceptance in the running game |
| --- | --- | --- |
| Characters | Author proportioned meshes, distinctive faces, layered coats, hands, boots, and role-specific equipment. | The Captain, Bootstrap, and chartmaker remain recognizable by silhouette and expression without relying on labels. |
| Materials | Add properly mapped wood grain, cloth, rope, leather, iron, skin, and wear. | Materials look different under the same light; detail does not become flicker or visual noise at playing distance. |
| Lighting | Establish warm lantern pools against a cooler harbor, soft contact shadows, and readable faces. | The player can still find paths, controls, and objectives in darker scenes. |
| Motion | Add intentional turns, grounded steps, helm use, winch operation, and restrained facial or head reactions. | Actions visibly connect the character to the object being used, and touch cancellation stops the action. |
| Water and boat | Refine the hull, fittings, wake, foam near pilings, and water response. | Sailing and docking remain readable and responsive; visual movement never hides a collision problem. |
| Camera | Frame conversations and repairs while preserving a usable view of the harbor. | No roof, tower, or panel obscures the action the player needs to understand. |

The current renderer and cast are authored in stormwake_gl.js and stormwake_world.js. The cast uses procedural geometry and color-based materials. Moving toward the reference quality requires an asset and animation pipeline, plus suitable rendering support. More decorative geometry or a sharper screenshot alone will not meet this milestone.

Prototype the asset pipeline inside an isolated game build first. Set graphics budgets from measured iPad behavior, then retain scalable quality settings. Do not claim a frame-rate target is achieved from software-rendered desktop tests. Keep all game assets independent of business records, credentials, and real fleet authority.

## Mission milestone: make success change the next voyage

The proposed continuation begins with the chartmaker's recovered route. The rescue gives the crew someone they need, opens a passage, and produces a reason to sail again. A future crew roster can show who is aboard and what each person contributes. A future chart can reveal an actual playable destination after its route exists.

Use a consistent mission structure:

1. **Someone needs something for a reason.** Establish the person, the problem, and what is at stake in the scene.
2. **The player does work that changes the world.** Sail, repair, search, negotiate, or recover something with a visible result.
3. **Success changes the next choice.** A rescued crew member, repaired vessel, usable route, supply, or piece of knowledge makes the next voyage possible.

Avoid mandatory school-style questions that do not serve the action. Preserve the existing optional Chart Room lessons and the player's earned progress. Keep new chapter entrances unavailable until their playable content and save behavior are finished.

## Keep the fleet strong while the game grows

Continue with one identifiable upload at a time, an exact supported baseline, a matching ZIP/folder name, and no silent deletions. Keep the game isolated from business operations. Preserve the existing account checks and session limits. Test save import/export, app switching, touch cancellation, and mission completion alongside each meaningful gameplay change.

Before adding a longer campaign, design reliable progress recovery explicitly. The current tab-only checkpoint plus deliberate JSON export is not sufficient evidence of cloud durability. Any future account-bound saving needs its own authorization, recovery, conflict, and account-isolation checks.

The next art milestone is complete when the running scene looks and feels convincing on the actual device. The next mission milestone is complete when the player can explain who they helped, what changed, and why the next voyage matters.
