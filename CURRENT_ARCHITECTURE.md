# Current Architecture — VoyageKeeper 8.8.20.14

Commissioning durability uses the live VoyageGuard Fleet Core tables/RPCs. Browser/session state is a cache and recovery aid, not server truth. VoyageKeeper adds a same-tab bridge to the existing Admiral PIN + authenticated account workspace so the commissioning document can obtain its own valid authenticated session before calling VoyageGuard RPCs.

A successful Admiral gate does not itself commission a vessel. Server-safe status still requires save + readback of the same voyage. Commissioning remains separately gated by Review/Prove and the canonical commissioning RPC.


## 8.8.20.20 KeelLock — release integrity repair
BlackWake field proof isolated a packaging-order defect: final runtime bytes and DEPLOYMENT_MANIFEST runtime hashes diverged. KeelLock regenerates integrity hashes from the final immutable bytes and validates the package before ZIP handoff. Runtime integrity remains fail-closed; no checksum bypass was added. Field deployment proof remains required.
