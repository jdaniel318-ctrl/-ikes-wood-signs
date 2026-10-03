# Current Architecture — PassageLine 8.8.20.8

Commissioning durability uses the live VoyageGuard Fleet Core tables/RPCs. Browser/session state is a cache and recovery aid, not server truth. PassageLine adds a same-tab bridge to the existing Admiral PIN + authenticated account workspace so the commissioning document can obtain its own valid authenticated session before calling VoyageGuard RPCs.

A successful Admiral gate does not itself commission a vessel. Server-safe status still requires save + readback of the same voyage. Commissioning remains separately gated by Review/Prove and the canonical commissioning RPC.
