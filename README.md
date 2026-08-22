# Dark Sky 6.3.0 — Ascension Watch

Captain/Admiral command hardening release. Captain tools move from the lower overlay band into a persistent Captain's Helm rail; Fleet Readiness is now provable from the Helm; Captain and Admiral thresholds regain short theatrical transitions; and Admiral's Deck adds Ceremonial and Professional modes while remaining explicitly provisional.

The established authority spine remains unchanged: Project Admin 4353, Black Flag 5615, Captain 19613, Admiral 19613 temporarily, and Client Preview unique per invite.

# Dark Sky 6.2.0 — Foundry

Visual Command Forge release. Captain and Admiral now share a real visual-to-blueprint creation capability while preserving separate authority and fleet isolation.

# Dark Sky 6.2.0 — Upper Deck Trial

Adds a testable authority layer above Captain’s Quarters: **Admiral’s Gate → Admiral’s Deck**. The deck is explicitly provisional while the fleet is being proven. Captain and Admiral use separate credential contracts even though both temporarily accept `19613`. Fleet Readiness replaces “Admiral Readiness” as the name of the hardening standard; the checks prove the fleet, not the rank.

# Dark Sky 6.2.0 — Admiral Watch

Fleet-hardening release on the reconciled 6.0 platform spine. This build adds a non-destructive Admiral Readiness Gate to Black Flag, a downloadable fleet recovery snapshot, release/readiness evidence, and explicit staging/recovery contracts while preserving the proven customer/project/Captain boundaries.

## Admiral Readiness Gate

Black Flag can now verify, without changing authentication state:

- Black Flag `5615` recovery access
- Project Admin `4353` recovery access across the current fleet
- Captain's Quarters `19613` authority contract
- unique Client Preview credential generation
- canonical Project ID uniqueness
- order/project isolation consistency
- test/private external-contact guard
- Client Preview pre-paint isolation bulkhead
- Captain main-room/subview navigation contract
- runtime/deployment-manifest release identity

The gate reports **CLEAR**, **WATCH**, or **HOLD**. It does not silently publish, mutate project lifecycle, or bypass any authority layer.

## Recovery

`CREATE RECOVERY SNAPSHOT` downloads an interim fleet recovery artifact containing the canonical project rows available to the browser, merged orders, settings, and verified local registry backup. The file may contain sensitive configuration and must be stored securely. It is not a substitute for the planned managed production database/object-storage backup architecture.

## Authority contracts

- Project Admin: `4353` fleet default/recovery
- Black Flag Engine: `5615`
- Captain's Quarters: `19613`
- Client Preview: unique PIN per invite

## Preserved contracts

- strict project isolation
- Test / Private Preview real-world contact blocking
- Client Preview pre-paint isolation
- iPad/iPhone responsive behavior
- host/domain portability
- Captain-only visual identity and navigation

Deploy from the repository root. Runtime files belong at root; `assets/` is media-only.
