# Stormwake Dreadwater art licenses

Build: **8.8.20.45**. Verification date: **2026-10-21**.

## Asset permission and provenance

All embedded third-party texture maps are original downloadable JPEG maps from Poly Haven. Poly Haven states that its texture assets are published under **CC0 1.0 Universal** and permits use, modification, redistribution and commercial use without required attribution. The artist credits below are retained voluntarily. No sample renders, logos, user-submitted renders or website artwork are included.

- Provider license: https://polyhaven.com/license
- CC0 summary and legal code: https://creativecommons.org/publicdomain/zero/1.0/ and https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Public API terms: https://github.com/Poly-Haven/Public-API/blob/master/ToS.md

Only build-time public metadata and asset downloads were used. Requests carried a Stormwake-Art-Build user agent. The game embeds image data and never calls the API or source URLs at runtime. No payment, account or login was used.

## Material inventory

| Runtime family | Source asset | Artist credit | Embedded channels |
| --- | --- | --- | --- |
| wood | [wood_planks_grey](https://polyhaven.com/a/wood_planks_grey) | Rob Tuytel | Diffuse, nor_gl, Rough |
| stone | [rock_tile_floor](https://polyhaven.com/a/rock_tile_floor) | Charlotte Baglioni | Diffuse |
| rock | [rock_wall_02](https://polyhaven.com/a/rock_wall_02) | Rob Tuytel | Diffuse, nor_gl, Rough |
| cloth | [cotton_jersey](https://polyhaven.com/a/cotton_jersey) | colormass (photography); Rico Cilliers (processing) | Diffuse |

Diffuse maps are sRGB base color. `nor_gl` maps are OpenGL tangent-space normals; roughness images are data maps. Stone and cloth intentionally omit optional normal and roughness maps to retain four recognizable original materials inside the 4 MiB JSON budget. Wood is naturally weathered gray; the renderer may apply a warm tint. Cotton Jersey is beige knit cloth, with original source dimensions 1024 × 1025; the other maps are 1024 × 1024.

## Exact map downloads and integrity

All files are provider-supplied 1K JPEG variants, embedded unchanged. No resizing, recompression, retouching or image generation was used. `size` means decoded JPEG byte count, before base64. SHA-256 is independently computed; MD5 is checked against Poly Haven public file metadata.

### wood / Diffuse

- File: `wood_planks_grey_Diffuse_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_grey/wood_planks_grey_diff_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/wood_planks_grey
- Bytes: 228,279; pixels: 1024 × 1024
- SHA-256: `d758be23e8fe7bfbd73bc4ab257cfd59406e1835f6557c12a67cd4fdb15de0d8`
- Provider MD5: `f2b4a70fed329c13850917c5f2d1498c`

### wood / nor_gl

- File: `wood_planks_grey_nor_gl_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_grey/wood_planks_grey_nor_gl_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/wood_planks_grey
- Bytes: 157,419; pixels: 1024 × 1024
- SHA-256: `5e570e57d688b016b217b9e8e0592f9a8b3364406e22bf6cd775da990452bdb6`
- Provider MD5: `fe633ea606ac22b732d4204a7fa52b03`

### wood / Rough

- File: `wood_planks_grey_Rough_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_grey/wood_planks_grey_rough_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/wood_planks_grey
- Bytes: 186,804; pixels: 1024 × 1024
- SHA-256: `ef640502cec94bd2b6500e252891a778a7a721be16b5536d4efc9fe4d99b12aa`
- Provider MD5: `eb620bf4c075153d9272de00f1bf7633`

### stone / Diffuse

- File: `rock_tile_floor_Diffuse_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_tile_floor/rock_tile_floor_diff_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/rock_tile_floor
- Bytes: 1,132,879; pixels: 1024 × 1024
- SHA-256: `2401d2b47d180858257c0e58ef1a31173c6f562bc8cfb2aa20c7dad0c6eb7f10`
- Provider MD5: `970954d7d45f8c9ccf3051b33577d735`

### rock / Diffuse

- File: `rock_wall_02_Diffuse_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_wall_02/rock_wall_02_diff_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/rock_wall_02
- Bytes: 303,985; pixels: 1024 × 1024
- SHA-256: `4f1d2f80c07e502f5a5ecb4e58388cbf7f4cb33f507e39d024a17ea6d24539b5`
- Provider MD5: `19204f9cc44062a87bb9270c1341c237`

### rock / nor_gl

- File: `rock_wall_02_nor_gl_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_wall_02/rock_wall_02_nor_gl_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/rock_wall_02
- Bytes: 198,730; pixels: 1024 × 1024
- SHA-256: `81888d4950cb395cfba7e47691299470034a9e0d97e553957d21531e8720bb71`
- Provider MD5: `218d1718fe8d64e096ca59e40a1a3e67`

### rock / Rough

- File: `rock_wall_02_Rough_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_wall_02/rock_wall_02_rough_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/rock_wall_02
- Bytes: 254,824; pixels: 1024 × 1024
- SHA-256: `5887a7f43a228aae2378cc2afee92012ef6a9f90d08bc7dfc9b7e3f6df14b60e`
- Provider MD5: `cdda4828265f954a1509f1973376907f`

### cloth / Diffuse

- File: `cotton_jersey_Diffuse_1k.jpg`
- Original download: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cotton_jersey/cotton_jersey_diff_1k.jpg
- Source file metadata: https://api.polyhaven.com/files/cotton_jersey
- Bytes: 581,360; pixels: 1024 × 1025
- SHA-256: `0f1b790e4087223275aaa6fdffdd46a556a26d2af72cd811acf72ba9c21ec1f6`
- Provider MD5: `d2f4493fdd48634b50d40f810ce9deb7`

## Packaging and verification

- Raw image bytes: 3,044,280.
- Embedded JSON bytes: 4,063,325 (limit 4,194,304).
- Runtime schema: `stormwake-art-v1`; four texture families, eight image data URIs.
- Reproduction: run `python build/build_assets.py` from the release workspace with cached approved files and `build/assets/manifest.json`; add `--download` to reacquire the eight fixed URLs. SHA-256, provider MD5, exact byte counts, JPEG format and dimensions must match before output is written.
- Build scripts, source metadata cache and test-only image previews are not runtime dependencies.
