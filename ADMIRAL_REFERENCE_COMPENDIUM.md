# 8.5.1 Admiral Command Views

Admiral's Deck trial now defaults to Professional Mode. The ceremonial deck remains a second view. Admiral-level responsibility is fleet governance: posture, doctrine, standards, Foundry, delegation, cross-vessel intelligence, continuity, and creation/promotion of new fleet capabilities and vessels. Captain remains mission command; Engine remains operational machinery.

---

# Admiral Reference Compendium
> Consolidated in Dark Sky 8.2.8 to keep the deployment lean while retaining the full historical contracts as an AI-readable regression reference.

---

## Source: `ADMIRALS_DECK_TRIAL.md`

# Admiral’s Deck Trial — Dark Sky 6.2.0

## Hierarchy

Admiral is the singular authority above Captain. The Admiral governs Dark Sky, Black Flag, and the fleet as a whole. Captain remains the singular strategic/operational commander beneath that authority. Project Admin and Project Manager remain project-scoped.

## Trial state

The Admiral’s Deck is available for testing but does **not** represent an earned Admiral promotion. The production UI must show the deck as provisional/trial until the fleet is proven.

## Access contract

- Captain’s Quarters PIN: `19613`
- Admiral’s Deck PIN: `19613` for now, implemented as a separate Admiral credential contract.
- The two credential concepts must remain separable so the Admiral PIN can change later without restructuring Captain access.
- Delegation of Admiral or Captain duties occurs only at the owner’s discretion.

## Navigation

Engine → Captain’s Quarters → Admiral’s Gate → Admiral’s Deck.

The Admiral’s Deck returns downward to Captain’s Quarters. It does not bypass Captain navigation to jump directly into project machinery.

## Scope

The trial deck begins with fleet governance, Fleet Readiness, recovery, future delegation, standards, and expansion. Day-to-day project operations stay in Black Flag and project-specific layers.

---

## Source: `ADMIRAL_ASCENSION_THEATRE.md`

# Admiral Ascension Theatre — 6.8.0

The Admiral threshold is a reusable upper-command transition contract. Theatre must communicate rank transition without changing authority.

## Sequence

1. Captain remains the source context.
2. Admiral's Gate reveals the Captain-forged Admiral visual.
3. Gate title, seal, light sweep, and doors establish the threshold.
4. Admiral PIN authentication remains a separate authority check.
5. Successful authentication triggers a post-auth ascent curtain using the same forged visual.
6. The curtain resolves into the saved Admiral Deck mode: Ceremonial or Professional.

## Timing

- First Gate ceremony: full.
- Repeat Gate ceremony: shortened but materially theatrical.
- First post-auth Deck ascent: full.
- Repeat post-auth Deck ascent: shortened but visible.
- Reduced-motion users receive immediate transitions.

## Boundaries

- Animation never grants authority.
- Visual Forge never changes PINs, readiness, project data, or isolation.
- Professional Mode remains operationally identical regardless of the theatrical path used to reach it.
- The installed Admiral visual is environment art; live data and controls remain separate HTML/runtime state.

---

## Source: `ADMIRAL_CEREMONIAL_INTEGRATION.md`

# Admiral Ceremonial Integration — 6.7.0 Lantern Watch

## Rule
The forged Admiral visual is the Ceremonial environment. Live controls remain HTML/CSS and occupy protected zones around, not across, the primary visual anchor.

## Protected zones
- Top header: controlled dark backing for navigation and mode controls.
- Left governance rail: localized translucent backing.
- Right Fleet Readiness rail: localized translucent backing.
- Bottom continuity dock: localized translucent backing.
- Center gate / compass / horizon: minimal dimming; remains the visual focal point.

## Mode boundary
Professional Mode ignores ceremonial artwork and remains the stable operational fallback.

## Authority boundary
Visual installation cannot change PINs, rank, readiness state, project isolation, Client Preview behavior, recovery state, or routing.

---

## Source: `ADMIRAL_COMMAND_SURFACE.md`

# Admiral Command Surface Contract — 6.5.0

## Purpose
Ceremonial Mode must translate a Visual Forge-installed scene into a real fleet-governance command surface. The visual is an environment layer only; authority, routing, readiness, controls, live fleet state, and safe areas remain real HTML/JavaScript.

## Mode split
- **Ceremonial Mode**: forged environment + responsive live command rails/dock.
- **Professional Mode**: clean governance console with the same authority and data, no theatrical visual dependency.

## Live-only information
Baked-in values in artwork are never authoritative. Vessel counts, sailing outposts, Sea Trials, readiness domains, recovery actions, and reports come from Dark Sky runtime state.

## Governance states
Working controls are READY. Planned governance controls remain visible as FUTURE and return intentional feedback rather than failing silently.

## Isolation
The Admiral visual slot cannot alter Captain, Black Flag, project, Client Preview, project-admin, or customer-experience visuals.

## Promotion
Access to the trial Admiral's Deck does not confer rank. Fleet Readiness proves the fleet; Admiral commissioning remains a separate Captain-owned decision.

---

## Source: `ADMIRAL_MEMORY_LEDGER.md`


## 8.2.3 Ike Fit
- Known stale-worker handoffs self-recover only after the incoming runtime snapshot and release identity fully verify.
- Automatic cleanup is constrained to Dark Sky service-worker registrations and application caches; project/customer/order/owner/configuration data is never touched.
- WATCH is now explicitly non-blocking when protected release contracts are clear.
- Deterministic WATCH work is owned by the shipyard; the Admiral is escalated only for judgment, ambiguity, irreversible action, or deliberate Known Good promotion.
- Proving Ground reports all voyages assessed, separates CLEAR/WATCH/HOLD, and keeps WATCH evidence visible after promotion.
# Admiral Memory Ledger — 8.2.0

The shipyard now retains doctrine, calibration replay, automatic proving evidence, recovery history, and a decision brief.

## Automatic on every candidate
- Release identity and integrity proving.
- Known 2 ft Cedar calibration replay (original + framed variant).
- Protected orientation/species regression gate.
- Experimental length evidence captured as WATCH until calibrated.
- Last clean-release recovery retained.
- What changed / What passed / What needs Captain judgment brief.

## Still manual
Final **MARK CANDIDATE KNOWN GOOD** promotion remains a deliberate Captain decision.

- Visible-glyph occupancy: for manufactured visual layouts, fit against rendered glyph bounds and usable physical surface, not generic font-size labels or character-count estimates. Ike uses aggressive face occupancy based on finished-sign proof.

---

## Source: `ADMIRAL_RELEASE_BULKHEAD.md`

# Admiral Release Bulkhead — Dark Sky 8.0.8

## Mission
Prevent any Captain, Admiral, Engine, project owner, or customer surface from executing a runtime assembled from different release responses.

## Permanent rules
1. Executable files are not cached or intercepted by the service worker.
2. The service worker is an identity sentinel only.
3. Engine first paint remains blocked until a complete no-store runtime snapshot is fetched.
4. CSS and JS execute from the exact fetched bytes; there is no second executable network fetch during boot.
5. Manifest, seal document, inventory, app runtime build, worker source build/seal, and active worker identity must agree.
6. Every required runtime URL and required visual asset must return HTTP 200 before Engine runtime execution.
7. Recovery may unregister workers and delete Dark Sky application caches, but must never delete IndexedDB project/order/customer/owner data.
8. Any mismatch becomes a durable Release Hold with file-level evidence.

Release seal: `yardarm-808-root-keel-6a31fd`


## Root Keel amendment
- All upload-critical files are flat at repository root for iPad/Safari GitHub web upload.
- Nested folders are forbidden as a release-critical dependency.
- Core executable identity may HOLD the Engine. Route/decorative visual media may HOLD only the route that needs it, with a branded fallback where safe.
- Release seal: `yardarm-808-root-keel-6a31fd`.

---

## Source: `ADMIRAL_RELEASE_DOCTRINE.md`


## 8.2.1 Gridwright
- Known stale-worker handoffs self-recover only after the incoming runtime snapshot and release identity fully verify.
- Automatic cleanup is constrained to Dark Sky service-worker registrations and application caches; project/customer/order/owner/configuration data is never touched.
- WATCH is now explicitly non-blocking when protected release contracts are clear.
- Deterministic WATCH work is owned by the shipyard; the Admiral is escalated only for judgment, ambiguity, irreversible action, or deliberate Known Good promotion.
- Proving Ground reports all voyages assessed, separates CLEAR/WATCH/HOLD, and keeps WATCH evidence visible after promotion.
# Admiral Release Doctrine — 8.2.0

This is the fleet-level memory layer for Dark Sky / Black Flag releases.

## Shipyard rule
Automate the repeatable proving work; keep final **MARK CANDIDATE KNOWN GOOD** as a deliberate Captain decision for now.

## Learned contracts retained
- single-build release identity and zero unverified first paint;
- project isolation and authority separation;
- root-safe iPad/GitHub deployment;
- stale-worker recovery and Known Good separation;
- decorative media cannot sink the Engine;
- camera height is not a customer measurement contract;
- experimental length segmentation must not suppress proven orientation or species recognition.

## 8.2.0 detector architecture
- **Proven visual path:** orientation, species, design-zone geometry.
- **Experimental length path:** background-aware Plumb Line segmentation.
- Each path can pass, abstain, or fail independently.

---

## Source: `ADMIRAL_VISUAL_PIPELINE.md`

# Admiral Visual Pipeline — 6.6.0 Sovereign Passage

## Purpose
Prove that Captain can forge and install one visual that becomes the ceremonial environment for both Admiral’s Gate and Admiral’s Deck while Professional Mode stays operational and visually independent.

## Flow
Captain’s Quarters → Visual Forge → Scene → Command Surface → Target: Admiral’s Gate + Deck → Forge Blueprint → Install Visual to Target → Admiral’s Gate → Admiral’s Deck.

## Contracts
- Installed Admiral visual is browser-local during the prototype stage.
- One Admiral visual slot drives Gate and Ceremonial Deck only.
- Professional Mode never consumes the ceremonial visual.
- Live readiness data, authority, navigation, recovery and safety controls remain separate from artwork.
- Admiral rank is not granted by visual installation.
- Future production storage moves to managed object storage under Cloud Readiness.

---

## Source: `ASCENSION_CONTRACT.md`

# Ascension / Command Threshold Contract — Dark Sky 6.3.0

## Hierarchy
Admiral > Captain > Black Flag operations > project-scoped authority.

## Captain Helm
Captain command tools must remain visible, identifiable and reachable without covering the cinematic command room. Fleet Readiness belongs at the Helm because the path toward Admiral is proven through command.

## Captain threshold
First Captain entry may use the full cinematic threshold. Repeat entries use a short transition rather than no transition. Reduced-motion preferences remain authoritative.

## Admiral threshold
Admiral's Gate is a ceremonial proving threshold. It remains provisional until fleet hardening is proven. Repeat gate entry is shortened.

## Admiral's Deck modes
Ceremonial Mode is the default upper-command environment. Professional Mode is always available for faster executive/governance work and must not change authority, data, readiness or routing.

## Visual Forge
Captain and Admiral retain Visual Forge at their respective authority layers. Visual Forge may create and prototype; fleet promotion remains governed and explicit.

---

## Source: `UPPER_COMMAND_THEATRE.md`

# Upper Command Theatre Contract — 6.5.0

Theatrical visuals are a reusable capability, not a one-off skin.

1. Environment art is separate from interactive controls and authority.
2. Captain and Admiral may use Visual Forge to ingest reference visuals.
3. Admiral ceremonial visuals may be installed browser-locally for testing; Professional Mode ignores them.
4. Captain command geometry remains benchmark-locked until a replacement visual is Sea-Trialed.
5. Future production visuals move to managed object storage without changing the command contract.
6. Reduced-motion and shorter repeat entry are permanent accessibility/performance requirements.
