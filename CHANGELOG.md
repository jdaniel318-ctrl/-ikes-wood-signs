# 8.6.55 — Admiral Command Rail

- Widens and restructures Govern / Standardize / Delegate / Promote for iPad readability.
- Adds dedicated Admiral identity authentication and server-authoritative service entitlement actions.
- Adds Make Standard and Grant Paid Upgrade controls backed by `admiral_set_service_entitlement`.
- Reserves future Basic/Mid/Super package composition without exposing package pricing or activation yet.
- Leaves owner auth, RLS, ownership, and Fleet Services owner request behavior unchanged.

## 8.6.55 — Admiral Command Rail

Paid/Standard entitlement-state precedence, owner-facing Fleet Services language, and the first server-governed Admiral service-command seam.

# Dark Sky 8.6.55 — Fleet Services Framework

- Adds server-backed Fleet capability, vessel entitlement, and owner service-request framework.
- Admiral governs Standard vs Paid classification; owners cannot self-grant paid services.
- Adds Fleet Services to the Owner Bridge with prototype capability groundwork.
- Carries compact vessel identity through Owner Bridge working screens.
- Keeps Supabase owner auth, exact-vessel RLS, ownership, Captain and Admiral boundaries intact.
