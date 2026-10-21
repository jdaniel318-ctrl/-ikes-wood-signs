# Saltglass 8.8.20.46 — art notes

## Authored changes

- Crew: sculpted adult faces, attached facial details, hands, garment folds, lapels, cuffs and footwear; existing 19-bone animation contract retained.
- Terrain: flat walking meshes with broad sandy routes, muted olive turf/moss/shingle transitions, steep tide-darkened coast faces, sparse grass and low coastal stones. Lighthouse and chartmaker ground remains at y=1.600; new quay planting beds remain below y=1.610.
- Lighting: current dusk balance and contact shading, preserved authored ground colors, shared existing maps and a softer tagged lighthouse beam.

## Evidence and limits

The final eight captures and root review are bound to the exact sources in SALTGLASS_TEST_RESULTS.json. Existing licensed image maps and the pinned Three.js bundle remain unchanged; no new downloaded artwork or generated bitmap is introduced. CPU evidence confirms finite geometry, the existing rig and reunited-crew clearance. The core, camera/comfort, save format, mission targets, walking surfaces and boat berths are preserved.

Current root visual review notes:

- Root visually inspected all eight final unaltered canvas PNGs; lighthouse and cast views were also independently inspected by the lighting reviewer.
- Faces have modeled sockets, eyelids, noses, lips and ears; clothing panels now shade smoothly and hands have defined fingers. The result remains stylized 3D art.
- Worn sandy routes, muted turf and sparse grass replace uniform story-island green slabs; coast edges and nearby foam read at the normal pier camera.
- First-pass shadow grid on ground, paving and character details is absent after restoring the proven depth/normal bias offsets.
- Both staged walking poses retain the prior silhouette, foot motion and separate crew; normal camera and portrait Low views remain readable.
- The lighthouse beam is softer and less solid; warm lanterns and cool dusk remain distinct.
- All eight embedded textures loaded with no GL, console or page errors and no attempted network requests.
- Native iPad Safari appearance and sustained performance of .46 remain pending; .45 smoothness was user-reported and is not an FPS measurement.

These are offline visual/geometry results. The latest completed user JSON has not been inspected, and native .46 appearance or FPS is not certified. Package reconstruction and extracted BOOT proof remain external after sealing.
