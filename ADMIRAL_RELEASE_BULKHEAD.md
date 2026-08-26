# Admiral Release Bulkhead — Dark Sky 8.0.8

## Mission
Prevent any Captain, Admiral, Engine, project owner, or customer surface from executing a runtime assembled from different release responses.

## Permanent rules
1. Executable files are not cached or intercepted by the service worker.
2. The service worker is an identity sentinel only.
3. Engine first paint remains blocked until a complete no-store runtime snapshot is fetched.
4. CSS and JS execute from the exact fetched bytes; there is no second executable network fetch during boot.
5. Manifest, seal document, inventory, app runtime build, worker source build/seal, and active worker identity must agree.
6. Every required runtime URL and required visual asset must return HTTP 200 before Engine runtime execution.
7. Recovery may unregister workers and delete Dark Sky application caches, but must never delete IndexedDB project/order/customer/owner data.
8. Any mismatch becomes a durable Release Hold with file-level evidence.

Release seal: `yardarm-808-full-keel-91d4c8`
