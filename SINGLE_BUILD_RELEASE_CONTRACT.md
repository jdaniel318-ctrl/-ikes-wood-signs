# Single-Build Release Contract — Dark Sky 8.0.8 Yardarm

Dark Sky must never paint the Engine from a mixed runtime.

## Required invariants
1. Manifest, app runtime, service-worker source, and active service-worker identity must all report **8.0.8**.
2. The release seal is **yardarm-808-onebuild-93e4b7** and must match in the manifest, release seal file, boot gate, and worker.
3. The service-worker registration URL is permanently stable: `./sw.js`. Release identity belongs inside the worker, never in the worker URL.
4. A failed release verification has no bypass. `RETRY VERIFICATION` runs the same gate again; it does not paint the Engine around the gate.
5. `CLEAN RELEASE RETRY` is a visible transaction: unregister this app's worker → clear Dark Sky application caches → register a fresh stable worker → verify build/seal → reload.
6. Cleanup never deletes project/order/customer/owner IndexedDB data.
7. A release folder is not considered self-contained unless every `required_runtime_files` entry is physically present in the package.
8. Uploads must be one coherent release set. Cherry-picking runtime files from different releases is forbidden.

## Failure behavior
Any mismatch or incomplete worker recovery blocks first paint and presents an explicit release hold with durable progress/evidence.
