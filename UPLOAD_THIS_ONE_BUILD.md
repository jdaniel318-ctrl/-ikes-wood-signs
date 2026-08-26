# Dark Sky 8.0.8 Yardarm — One-Build Recovery Set

This package fixes the service-worker recovery transaction and single-build gate for Yardarm 8.0.8.

Important packaging rule: a truly self-contained release must include every file listed in `DEPLOYMENT_MANIFEST.json > required_runtime_files`. The release gate now verifies the deployed copies before Engine paint, but the upload package itself must also be audited for completeness before it is treated as a standalone replacement.

The service worker must always be registered at `./sw.js` with no version or seal query in its script URL.
