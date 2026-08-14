BLACK FLAG ENGINE — V3.0 STAGE 2: MACHINERY & OPERATIONS

Baseline:
- Certified v3.0 Stage 1 — Hull & Bulkheads

Stage 2 completed:
- Owner Portal module access now passes through the central v3 identity/role policy in addition to project capabilities.
- Owner order reads and owner status changes are project-scoped through the v3 boundary guard.
- Orders created by Ike, Mugs After Dark, and flower-project shells now carry schema v3 namespace/isolation envelopes.
- Customer records are normalized with project namespace, schema and isolation metadata.
- Customer-directory rebuild uses project-scoped orders.
- Ledger entries carry project namespace, schema and isolation metadata.
- Kiosk/deployment records receive explicit device authorization metadata:
  customer-session scope only, no Engine access, no Owner access, cross-project access denied.
- Engine Revenue/Profit/Usage/Cost calculations now also feed the v3 telemetry service.
- Captain business-relationship decisions create explicit v3 governance audit events.
- Stage 1 project lifecycle normalization continues to run whenever projects are saved.

Deliberate boundary:
- This remains a browser/local test implementation.
- Central policy is now wired into operations, but production owner identity still requires server-side authentication,
  secure sessions, password recovery, authorization enforcement and revocation.

Next:
- Stage 3: Command Experience & Certification
  First Mate Watch, lifecycle status surfaces, recovery/audit UI, legacy-bleed cleanup,
  button/navigation checks, service-worker/version finalization and final Ship Integrity certification.
