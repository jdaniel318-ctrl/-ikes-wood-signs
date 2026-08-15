# Commissioning Controls Repair Audit — v3.8.14

## Defect
The Project Commissioning workspace markup was defined after `app.js` and `captain.js` were loaded. Commissioning button listeners were therefore attached while `commissionReset`, `commissionPrev`, `commissionSaveDraft`, `commissionNext`, progress buttons, and the workspace close control did not yet exist in the DOM.

## Repair
- Moved Black Flag application script loading to the end of the document, after all static Engine, Captain, and Project Commissioning workspaces.
- Preserved the existing commissioning handlers and validation logic so there is one canonical commissioning path.
- Kept button IDs unchanged to avoid breaking existing code and tests.
- Simplified commissioning platform branding to one larger canonical Black Flag mark.
- Replaced the large text "Back to Engine" control with the canonical platform mark while retaining accessible label/title text.
- Reworked the footer action hierarchy: Start Over is visually separated, Back is quiet, Save Draft is secondary, Continue/Commission Project is primary.
- Increased iPad touch targets, labels, progress steps, form labels, input sizes, and helper copy.

## Expected behavior
- Start Over confirms and resets the current draft.
- Back moves to the previous reached step and is disabled on Step 1.
- Save Draft persists the current commissioning state to the canonical commissioning draft key.
- Continue validates the current step and advances to the next step; on Step 6 it commissions the private project.
- Progress steps may navigate only to steps already reached.
- Back to Engine closes commissioning without publishing the project.

## Scope guard
No project identity, tenant isolation, visual capability contract, order logic, owner authorization, or deployment lifecycle semantics were changed by this repair.
