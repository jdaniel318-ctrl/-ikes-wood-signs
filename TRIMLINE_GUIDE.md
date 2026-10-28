# Trimline 8.8.20.69

A bounded release-identity cleanup built on Fairlead 8.8.20.68.

Installed release identity and component revisions are distinct. The Engine and Admiral use the verified release context; the owner page uses a generated page identity and explicitly pinned, unchanged .68 helper revisions. Customer and specialist modules retain their existing bytes and component version labels.

Every required Engine body still requires its exact SHA-256. Missing/altered files, mismatched manifest/seal/inventory, wrong worker identity, missing component contract or a wrong app revision hold startup. No dependencies are removed or deferred. Checksums are integrity/consistency evidence, not server signatures or permission grants.

Fleet Maintenance now says FLEET STEWARD · STORAGE & RECOVERY; the old 8.8.17 prefix is removed. No maintenance or deletion behavior changes.

RELEASE_CONFIG.json is the input for PREPARE_RELEASE.py. The generator updates only known shell/metadata locations, not shared JavaScript bodies except the identity-only service worker. Preparing a release explicitly resets verification to untested. BUILD_RELEASE.py uses the declared verification runner and emits patches, complete source, rollback and evidence together.

Use UPLOAD_THIS_ONE_BUILD.md. No SQL, new account, password change, appointment, Face ID, data restore or automated deployment is required. Do not restore old business data to roll back software.

Tests use synthetic data and offline browser fixtures. A synthetic 8.8.20.70 used by tests is NOT a release to upload. Native Safari and hosted startup require acceptance. This is not a speed-improvement claim. Source backups are not customer-data/media backups.
