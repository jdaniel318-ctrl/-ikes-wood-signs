# Deployment Persistence Audit — v3.8.19

## Root cause
`saveCompanies()` used the full live document in the global integrity gate. A transient runtime DOM duplicate could therefore block an otherwise valid deployment/project write. This coupled UI health to fleet persistence.

## Repair
- `saveCompanies()` now runs data-only fleet integrity (`integrity(companies, null)`).
- The integrity engine skips DOM checks when no document is supplied.
- Sea Trials / manual ship integrity checks continue to pass the live document and therefore still detect duplicate DOM IDs.
- Deployment creation keeps project-boundary validation before the write and post-write verification after persistence.
- Failure messages now expose the actual blocking reason and create an audit entry.

## Visual coherence
The Outpost Registry and empty berth now use shared dark Fleet Visual System surfaces rather than a bright filler card.
