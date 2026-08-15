# Dark Sky v3.8.2 — Project Identity Audit

## Doctrine
Names can change. Identity cannot.

## Permanent identity
- `project.id` is the canonical immutable Project ID.
- `project.namespace` derives from that ID.
- deployment authorization remains bound to that ID/namespace.
- existing IDs are preserved to prevent destructive re-keying.
- new projects receive opaque `bf-p-*` IDs.

## Mutable identity
- `project.name` / `identity.displayName` may be renamed.
- customer-facing `branding.businessName` is synchronized by the controlled rename path.
- previous names are retained in `identity.previousNames`.
- renames are written to both project activity and the platform audit log.

## Explicit non-effects of rename
A rename does not change project ID, technical namespace, project code, order prefix, orders, customers, deployments, graphics, permissions, analytics, or historical records.

## Legacy migration
Legacy projects may have human-readable IDs originally derived from their first names. Those IDs are now frozen as permanent identifiers rather than rewritten. This avoids breaking existing references.

## Future public URLs
Public slugs/URLs should be modeled separately from tenant identity and should support redirects when changed.
