# Fleetclarity 8.8.20.64 — clear fleet status

Install this release over the exact delivered **Fleetcare 8.8.20.63** software.
Use **DarkSky882064-Fleetclarity-Upload…zip**: extract the one filename-matching
folder and upload every file inside, replacing matching filenames and retaining
all other files. No SQL, deletion, database reset or browser-data clearing is
required. The generated current README, architecture and upload headers name
the same build, ZIP and baseline. Instructions below those headers, including
all Fleetcare records, remain historical.

**DarkSky882064-Fleetclarity-FullBackup.zip** is the complete software backup.
Software ZIPs do not export private records saved only in a browser. Keep your
editable jobs, request ZIPs and private backup exports separately. Reload and
confirm Engine/Bootstrap build **8.8.20.64**, seal **fleetclarity-882064**.

## What the status means

**Publication** describes the saved publication setting for both bespoke and
universal vessels. **PUBLISHED** means that the saved setting is live. It does
not establish site availability, a deployed outpost, server authority or
completed commissioning. Test, development and unknown publication settings
remain distinct.

**Owner setup** describes the saved local state: disabled, unclaimed, invited
or locally active. An enabled doorway awaiting a claim or invitation acceptance
is labeled **Owner Sign-In**, with its pending setup state. Its existing
sign-in destination and authorization rules remain unchanged. A local owner
record does not independently verify server authority or become a new
commissioning gate.

**Local commissioning** describes the individual existing evidence gates.
Overview and Captain show their actual pass values; publication or a launch
step cannot stand in for those checks. Missing or stale evidence stays
incomplete or unverified. A local Captain record cannot clear other unmet
gates. **Review Commissioning Dock** opens the existing Commissioning Dock for
review. It does not create an outpost, claim an owner, invite anyone, grant
approval, publish a vessel, start Sea Trial or commission a vessel.

Overview identifies the actual saved owner setup state and reports one missing
current-deployment issue for a published/test vessel without current records.
A current outpost with none deployed can have its separate no-active-deployment
issue. Paused, Sea Trial, readiness and order-specific attention remain distinct.
An empty outpost list cannot establish that a published vessel is safely offline.

Customers still opens the selected vessel's retained history and totals.
Existing customer-opening and Preview routes keep their operational meaning.
Fleet Compass return, fresh readiness reads, Ike's branding, own-board photograph
flow, one-sign request, complete ZIP handoff, contact guards and CNC geometry
remain preserved. Stored records and authentication policies are not migrated.

## Three focused iPad checks

1. Reload the Engine and confirm build **8.8.20.64**.
2. Choose **Operate Vessels**, find **Ike**, open **Project Control**, and inspect
   **Overview**. Confirm saved publication is explicit, owner setup reflects its
   saved state, and missing commissioning evidence stays incomplete even when
   publication says **PUBLISHED**.
3. Tap **Review Commissioning Dock**. Confirm it opens the existing Commissioning
   Dock for review of that vessel. Send a screenshot of the destination.

Ike's normal customer workflow continues to use one sign, that customer's own
photograph and chosen words; no two-board repeat is requested.

## Verification scope and release evidence

**FLEETCLARITY_EVIDENCE.json** remains pending until the actual sealed runtime
passes the required offline checks. Candidate staging creates
**candidate_fleetclarity** and a pending candidate proof, with `pass=false` and
no ZIPs. Final packaging requires six matching actual suite reports against
those exact runtime and shipped verifier bytes, then creates
**release_fleetclarity**, the update ZIP and the full software backup.

The six suites are the new Fleetclarity workflows and actual-index checks,
preserved Fleetcare navigation and readiness checks, preserved Quartermaster
sealed-loader boot/tamper checks, and preserved Boardcraft actual-index
photo/wording/ZIP smoke checks. Final packaging validates every named case,
totals, report hash, release identity, tested runtime and verifier hash. Reports
remain external review evidence, bound by SHA-256 rather than added to runtime.

The packager pins the original .63 full archive and all 430 baseline filenames.
It checks retained historical bytes, unchanged exact atomic loader lists, an
update of at most 85 files, current America/New_York timestamps, one
filename-matching folder per ZIP and byte-exact reconstruction of the full
release from the original .63 archive plus the update. Current release
metadata is additive under `fleetclarity`; Fleetcare evidence, verifiers and
metadata remain historical.

Offline synthetic checks do not establish native iPad/Safari acceptance, live
account/provider acceptance, sent email, inbox receipt or physical CNC machine
acceptance. These remain separate user checks. No deployment is performed.
