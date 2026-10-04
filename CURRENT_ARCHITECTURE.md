# Current release — KeelProof 8.8.20.24

The recovery repair is a presentation/binding change inside the existing commissioning workspace. `commissionRecoveryTruth` supplies the banner, inspector and footer. Its same-voyage check is display evidence, not an authorization grant. Existing Admiral gate, hydration/save/receipt RPCs, pending-recovery continuation hold, project commissioning, data stores, ledger and project boundaries are unchanged.

Recovery status changes update only the dedicated recovery slot and footer status; they never capture editable fields. The existing authoritative hydration function still governs replacing a draft following successful read-back. This patch does not create a new backend, publish a vessel, appoint a Captain, or claim a production handoff.

## Preserved prior architecture notes

# Current Architecture — VoyageKeeper 8.8.20.14

Commissioning durability uses the live VoyageGuard Fleet Core tables/RPCs. Browser/session state is a cache and recovery aid, not server truth. VoyageKeeper adds a same-tab bridge to the existing Admiral PIN + authenticated account workspace so the commissioning document can obtain its own valid authenticated session before calling VoyageGuard RPCs.

A successful Admiral gate does not itself commission a vessel. Server-safe status still requires save + readback of the same voyage. Commissioning remains separately gated by Review/Prove and the canonical commissioning RPC.


## 8.8.20.22 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.
