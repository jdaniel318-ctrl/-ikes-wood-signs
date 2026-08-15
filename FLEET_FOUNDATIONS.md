# Dark Sky Fleet Foundations

## Doctrine
**The Engine is the first ship, not the fleet. Captain's Quarters is the shipyard.**

Dark Sky should preserve the reusable lessons and platform primitives proven while building the Business Command Engine, while allowing future ships to have independent products, workflows, interfaces, release cycles, and data models.

## Reusable Dark Sky primitives
These belong at the fleet/platform level when they can be cleanly separated from Engine-specific behavior:
- immutable identity and stable internal IDs;
- authorization and default-deny boundaries;
- tenant/data isolation contracts;
- lifecycle and transition contracts;
- audit / Ship's Log conventions;
- telemetry and health reporting;
- recovery/snapshot conventions;
- secure deployment/session boundaries;
- integration contracts and secret-handling rules;
- release/version/migration discipline.

## Engine-specific systems
These should not automatically be inherited by a new ship:
- the Project Control UI;
- business orders and customer-order assumptions;
- Engine project templates;
- ecommerce/custom-product workflow;
- specific project menus;
- Ike's, Becca's, Mugs, or any other vessel-specific branding/data.

## New-ship lifecycle in Captain's Quarters
1. **Concept** — define the mission and customer problem.
2. **Keel** — select only the Dark Sky primitives that genuinely apply.
3. **Prototype** — build the new ship in an isolated experimental boundary.
4. **Sea Trial** — prove its workflows, isolation, recovery, and usability independently.
5. **Commission** — give the ship its own identity, release line, and operating contract.
6. **Fleet** — only then expose shared Admiral-level oversight.

## Anti-baggage rule
A new ship may inherit proven Dark Sky primitives. It must not inherit Engine-specific data structures or workflows merely because they already exist.

## Admiral threshold
Do not invent an Admiral control layer for decoration. It becomes justified when at least two independently useful ships:
- have separate missions and release lines;
- share audited Dark Sky primitives;
- retain independent data/security boundaries;
- need cross-ship health, governance, release, or policy oversight.

At that point, Captain's Quarters can evolve into true fleet command and the Captain can meaningfully become an Admiral.


## Visual Capability Primitive
`visual_capability_contracts` is a reusable Fleet Foundation primitive. A future ship may define entirely different product/customer experiences while reusing the same capability vocabulary and renderer contracts. It must not inherit Business Command Engine shells merely because it uses the same visual capabilities.
