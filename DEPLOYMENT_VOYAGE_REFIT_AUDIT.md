# Deployment Voyage Refit Audit — v3.8.21

## Locked design
- iPad-first registry + setup + preview/next-step hierarchy.
- One obvious next action at a time.
- Draft preview is explicitly non-interactive.
- Sea Trial unlocks customer testing.
- Active outposts expose the customer experience.
- Technical manifest details are collapsed under Advanced.
- Dark Fleet Visual System is the default; no raw administrative white filler surfaces.

## State mapping
- Configure: draft manifest v1.
- Saved: draft manifest v2+.
- Sea Trial: lifecycle `sea_trial`.
- Tested: Sea Trial with a recorded customer test.
- Active: lifecycle `deployed`.
- Paused/Retired remain operational lifecycle states.

## Generic vessel boundary
A project without a customer operating model/customer shell can open a Sea Trial test dock, but activation is blocked until a customer model exists. This keeps the deployment infrastructure honest while Operating Models are still being extracted.
