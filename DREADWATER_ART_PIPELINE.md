# Dreadwater 8.8.20.45 TEST — playable art and rebuild guide

## Delivered rendering path

The current game uses pinned Three.js 0.180.0 on WebGL2, with the original StormGL WebGL1 path retained for a browser that cannot create WebGL2. The host fetches the single compiled player after the existing verified entrance, checks its complete SHA-256, then runs it in an opaque `allow-scripts` iframe. The player has no external network access, runtime CDN, generic asset proxy, decoder worker or account-data bridge.

This first asset package is fixed and embedded. It makes the artwork inspectable, reproducible and replaceable within the existing deployment. It does not add arbitrary user model uploads or unbounded streaming.

## Original cast and environment

`stormwake_cast.js` creates three original adult pirate roles using actual Three.js skinned meshes, nineteen bones, normalized joint weights and blended limb/tail vertices. The player, Bootstrap and chartmaker have distinct coats, headwear, tailoring and accessories. Production motion drives knees, elbows, ankles, hands, torso and coat tails. No film character, actor likeness, clip frame or downloaded executable model is included.

`stormwake_world.js` retains the authoritative walking surfaces, mission targets, bridge handles and boat berths. It adds curved boat planking/gunwales, pegs and mooring fittings, roof eaves, rope coils, rock formations and fuller palms. Roof geometry also supplies bounded camera occluders. The original character trees remain available to the fallback renderer.

The modern facade adapts the existing nine-float geometry stride (position, normal, color) and preserves material IDs: wood1, stone2, cloth3, metal4, roof5, skin6, leather7, hair8, foliage9, ground10, plaster11, rope12, rock13. UVs are generated at adaptation time. Rock/ground color and roughness use blended triplanar sampling to remove hard projection seams. Rock's tangent normal is deliberately omitted because its single projection basis is inappropriate for this blend; wood normal mapping remains active.

## Embedded material images

`stormwake_assets.json` contains eight exact original JPEGs from four Poly Haven CC0 assets. `STORMWAKE_ART_LICENSES.md` records authors, exact source URLs, licenses, dimensions and image hashes. The JSON is 4,063,325 bytes, under the 4 MiB art cap; decoded compressed JPEG bytes total 3,044,280. Seven maps are used by current material shaders; the packaged rock normal is retained with provenance for future compatible use. All eight are validated and decoded.

| Family | Source | Embedded channels |
| --- | --- | --- |
| Wood | Wood Planks Grey | Base color, OpenGL normal, roughness |
| Stone | Rock Tile Floor | Base color |
| Rock | Rock Wall 02 | Base color, OpenGL normal, roughness |
| Cloth | Cotton Jersey | Base color |

There is no image transformation during packaging. Base color uses sRGB; normal and roughness maps use linear data. The compiler checks family/slot allowlists, strict data URIs, raw byte and pixel bounds, recorded hashes, JPEG dimensions, Pillow verification and full pixel decoding before writing the player.

## Rebuild the player

Python 3 with Pillow is needed only on the build machine. The delivered game needs neither Python nor npm. From the flat release folder:

```bash
python -m pip install Pillow
python VERIFY_DREADWATER_ASSETS.py
python BUILD_STORMWAKE_PLAYER.py
```

The compiler writes `stormwake_player.html` and `STORMWAKE_PLAYER_BUILD.json`. Identical source inputs reproduce identical bytes. It includes the preserved original First Light game, fixed artwork, pinned vendor and game scripts. The complete output must be at most 8,388,608 bytes. Its content security policy keeps `connect-src 'none'` and allows only embedded image data.

Changing compiled inputs requires regenerating the player, updating the exact `STORMWAKE_SHA` in `fun_program.js`, completing the current evidence, and resealing metadata. A matching filename or version string alone is insufficient. `SEAL_DREADWATER.py` rejects stale compiled inputs, an inconsistent player report or a host digest that does not match the actual bytes.

## Optional vendor reproduction

The exact vendor bundle ships with the release. A developer can reproduce it using the pinned build-only packages in a separate folder:

```bash
npm install --prefix ../build --no-audit --no-fund --ignore-scripts --save-exact three@0.180.0 esbuild@0.25.10
node BUILD_STORMWAKE_VENDOR.mjs ../build
```

The build checks both dependency versions. The accepted bundle SHA-256 is fixed in `STORMWAKE_BUILD_RULES.py` and recorded in `STORMWAKE_VENDOR.json`; its MIT license is in `STORMWAKE_THIRD_PARTY.txt`. A dependency upgrade is a new reviewed build, not a silent runtime update.

## Verification and practical limits

Run the current `VERIFY_DREADWATER_*` tools for assets, cast, adapter, comfort, actual compiled gameplay, art cameras, final release and startup. The renderer and cast CPU verifiers can use the shipped pinned vendor without installing dependencies. Browser suites require Playwright and a local Chromium executable supplied through `BLACKFLAG_CHROMIUM`.

The camera uses actual roof bounds, resets an obstructed smoothed target, chooses a clear goal before smoothing, and traces the transition. Crew clearance resolves body overlap while preserving interaction reach. Save/mission validation stays in the unchanged core files.

Balanced, Low and High remain explicit user preferences. Low disables modern shadow passes and limits drawing resolution. Native iPad/Safari appearance and sustained performance must be assessed on the device; software-renderer timings are not a device FPS promise. The current art remains a stylized 3D browser adventure with room for future artist-authored faces, props and additional missions.
