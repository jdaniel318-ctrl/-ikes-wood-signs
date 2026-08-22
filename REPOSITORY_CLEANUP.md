# GitHub Cleanup Checklist — after 6.0.4 is confirmed live

Do not delete anything before the 6.0.4 root deployment is tested. After confirmation:

## Safe cleanup targets
Archive or remove historical one-off audit files from repository root that are not part of the canonical release documentation. Examples include old `*_AUDIT.md`, old command/deployment repair reports, superseded mobile audits, `README.txt`, and duplicate checksum files.

## Keep at repository root
- README.md
- ARCHITECTURE.md
- CHANGELOG.md
- CLOUD_READINESS.md
- COMMISSIONING_AUDIT.md
- ISOLATION_AUDIT.md
- MOBILE_CONTRACT.md
- REGRESSION_AUDIT.md
- REPOSITORY_RECONCILIATION.md
- REPOSITORY_CLEANUP.md
- DEPLOYMENT_MANIFEST.json
- RELEASE_CHECKSUMS.sha256
- runtime files listed in REPOSITORY_RECONCILIATION.md
- assets/

## Clean `assets/`
`assets/` should contain images/media only. Remove any accidental copies of `index.html`, JS/CSS, manifests, README/audit files, or checksums from `assets/` after confirming the root deployment works.

## Do not blindly delete media
Project logos and approved Captain/Engine benchmark assets may still be needed. Remove media only after code references are verified.
