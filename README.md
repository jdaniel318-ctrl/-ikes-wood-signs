# Dark Sky / Black Flag Engine

**Current release:** v3.8.21 — Deployment Voyage Refit

This release simplifies the Deployment Shipwright around one guided voyage: **Configure → Save → Sea Trial → Test → Active**. The outpost registry stays visible, the setup area becomes the primary work surface, customer preview and the next required action share one column, and technical manifest details are collapsed under Advanced.

## What changed
- Rebuilt the Deployment Shipwright for iPad-first scanning and larger touch targets.
- Added a five-step outpost progress rail.
- Added one clear **Next Step** card that changes with deployment state.
- Draft attract screens are explicitly **Preview Only** instead of pretending to be live controls.
- Sea Trial unlocks **Open Test Outpost**.
- Projects with a real customer shell can test the actual customer experience; generic projects get an honest test dock explaining that an operating model/customer shell is still required.
- Activation is blocked for a generic project until a customer operating model exists.
- Readiness and health now use the Fleet Visual System instead of light filler cards.
- Technical manifest details are collapsed under **Advanced → Manifest Details**.
- The Outpost Registry remains project-sealed and scrollable as more outposts are added.

## Current course
Continue Sea Trials on Andie’s Lemonade Stand and the existing vessels. Once deployment journeys are intuitive and reliable, proceed into **v3.9 — Operating Models** so generic projects can inherit real customer experiences from reusable capabilities rather than hard-coded shells.

## Security boundary
This remains a browser-local prototype. Project IDs, deployment sealing, authorization checks, persistence verification, and audit records are meaningful prototype controls, but unrelated production tenants still require server-side identity, authorization, durable storage controls, secret management, and revocation.


### Launch readiness
Newly commissioned projects use the universal customer shell. If a project reaches Sea Trial without a customer-ready offer, the Deployment Shipwright now asks for the first launch offer directly instead of presenting a dead activation path. A real Sea Trial order must be completed before activation.
