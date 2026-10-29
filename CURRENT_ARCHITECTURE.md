# Current architecture — Brightwake 8.8.20.72

The .71 fleet remains. One normal anchor adds Brightwake to the Engine launchpad. No new game bodies are required at Engine startup; the verified loader dependency list is unchanged.

brightwake.html uses independent curriculum, core, store, play, scene and app modules plus the existing unchanged fleet Three.js renderer. Page scripts/styles carry SHA-256 subresource integrity; BRIGHTWAKE_VESSEL.json has the optional asset inventory. This checks bytes, not permissions.

Up to 12 local profiles are stored in blackflag.brightwake.learners.v1 / learners with profile transactions and readback. No existing fleet store or backend endpoint is accessed. Family switching is not secure authentication. The privacy and persistence limits are explicit in BRIGHTWAKE_GUIDE.md.

Release metadata is generated from RELEASE_CONFIG.json. APP_COMPONENT_REVISION stays 8.8.20.71. All existing shared JavaScript except the identity-only worker remains byte-identical. The six Fleet Core businesses and Stormwake remain. This is a candidate learning ship, not a server-commissioned vessel.

The .71 storage investigation stays paused. Brightwake invokes no old migration, cleanup or snapshot operation.

## Verification and packaging
node VERIFY_RELEASE_ALL.cjs . ../release-check-evidence
python3 -B VERIFY_BRIGHTWAKE_BROWSER.py . --out ../browser-evidence
python3 -B PREPARE_RELEASE.py . --seal-only
python3 -B BUILD_RELEASE.py . --baseline <exact .71 full-source ZIP> --out <new external directory>

Browser fixtures use synthetic storage, not native Safari or live backend integration. Source backup is not a learner backup. Public child rollout, school use, consent, private server accounts and cloud recovery require further review and explicit commissioning.
