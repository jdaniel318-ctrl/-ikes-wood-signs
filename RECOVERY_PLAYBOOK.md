# Dark Sky Recovery Playbook — 6.1.0

## Recovery objective

Loss of an iPad, browser state, bad deployment, or hosting provider must not become loss of the fleet.

## Current interim layers

1. Git repository: source/release history.
2. Release ZIP + checksums: known-good deployable artifact.
3. Admiral Recovery Snapshot: browser-visible project/order/settings recovery artifact.
4. Existing local order/project registry backups: secondary test-stage recovery evidence.

## Restore order

1. Restore a known-good application release from source/release artifact.
2. Verify authority contracts and run Admiral Readiness.
3. Restore durable project/customer data only from a trusted recovery source.
4. Re-run project isolation and Client Preview safety checks.
5. Sea Trial affected projects before returning them to Live.

## Production target

Move canonical project/customer/order data to a managed database, project media to managed object storage, configuration/secrets to managed configuration, and run automated off-device backups with tested restore procedures. GitHub remains source control, not the production customer-data backup.
