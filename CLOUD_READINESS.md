# Dark Sky Cloud Readiness & Portability Contract — 5.7.6 Ironclad

## Purpose
Dark Sky must be able to move from the current test harbor to a custom domain and managed cloud infrastructure without redesigning the fleet. This contract is a standing engineering constraint for cleanup, feature work, deployment, and vendor selection.

## Non-negotiable principles

1. **No single device is authoritative.** iPad, iPhone, Android, kiosk, and desktop are clients/operating consoles. Production code and data must survive loss of any one device.
2. **Source history is recoverable.** A known-good application release must be restorable from version control/release artifacts without hunting for a local ZIP.
3. **Code and business data are different recovery problems.** Git/source history protects application code; production orders, customers, project settings, photos, assets, preview records, and audit history require managed data/storage backups.
4. **Host and domain are replaceable.** Customer experiences, Engine routing, asset paths, and Client Preview link generation may not depend on the current GitHub Pages repository path.
5. **Provider choice is replaceable.** Registrar, DNS provider, hosting provider, database, object storage, email provider, and managed-service provider are infrastructure choices—not application identity.
6. **Stable spine, flexible infrastructure.** Authentication domains, Project ID isolation, lifecycle boundaries, and customer safety contracts survive hosting/backend migrations.
7. **No hidden outbound actions in test.** Test, Private Preview, and Client Preview remain simulation-only regardless of future cloud integrations.
8. **Migration is rehearsed before production.** Export, restore, rollback, DNS cutover, and recovery procedures must be proven before real customer data becomes dependent on them.

## Current state

- Runtime: static HTML/CSS/JavaScript application.
- Current test host: GitHub Pages.
- Local/browser stores are acceptable for test data only; they are not the final production datastore.
- Client Preview currently uses a portable sealed link payload. A future preview backend may replace transport without changing project/PIN/safety semantics.
- Public website intake currently includes browser/public-reader approaches. A future server-side intake service should replace browser CORS dependence.

## Target managed-cloud shape

- **Source control:** canonical Git repository + tagged releases.
- **Web runtime:** managed static/web application hosting behind a custom domain.
- **Application API:** managed serverless/container API when browser-only capability is insufficient.
- **Structured data:** managed database with automated backup and point-in-time recovery where available.
- **Files/assets:** managed object storage with versioning/retention policies.
- **Secrets/config:** provider-managed secret/configuration store; never hard-coded into client bundles.
- **Observability:** managed logs, health checks, deployment history, and alerting.
- **Recovery:** documented restore targets and tested rollback procedure.

## Domain migration gate
Before changing the public domain:

- Verify no hard-coded GitHub Pages origin/path is required by navigation.
- Verify service worker uses relative application assets and receives a new cache identity.
- Verify Client Preview builds links from the active host or future preview service.
- Verify manifest/start URL and app metadata operate under the target path/domain.
- Verify HTTPS, DNS, redirect/canonical behavior, and mobile install behavior.
- Run fleet isolation and outbound-contact safety regression after cutover.

## Production-data gate
Before storing real customer/order data:

- Move authoritative records out of device-local browser storage.
- Define Project ID as an enforced datastore partition/tenant boundary.
- Define backup frequency, retention, restore ownership, and recovery objectives.
- Separate test/private-preview data from live production data.
- Ensure uploaded customer photos/files are stored per project with access controls and lifecycle deletion rules.
- Prove project export/restore without exposing another project's data.

## Cleanup retention rule
Remove clutter, not capability. Keep code or documentation that materially supports portability, project isolation, migration, recovery, capability reuse, lifecycle/revision management, mobile/kiosk support, or future backend interfaces. Remove duplicate/dead paths, stale assets, obsolete one-off audits, host-specific assumptions, and project-specific fallbacks that can cause cross-project behavior.

## Authority contract
- Project Admin: 4353 default/recovery
- Black Flag Engine: 5615
- Captain's Quarters: 19613
- Client Preview: unique invite-specific PIN

These authority domains must remain distinct through migration.
