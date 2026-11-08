# Creative exchange · Fernlight 0.3.0

## Upstream resources reviewed (October 29, 2026)

- VectorCraft repository and README: https://github.com/storytold/vectorcraft — SVG import/export and browser/desktop workflow.
- Browser entry-point documentation: https://raw.githubusercontent.com/storytold/vectorcraft/main/apps/vectorcraft-web/src/main.rs — documented Pointer Events, pen/finger distinction and browser download/file-picker paths.
- Automation documentation: https://raw.githubusercontent.com/storytold/vectorcraft/main/docs/mcp.md — scoped filesystem automation; researched, NOT connected or executed in this release.
- License: https://raw.githubusercontent.com/storytold/vectorcraft/main/LICENSE-MIT — reviewed. No upstream code was copied, so no VectorCraft binary, implementation or assets are redistributed here.
- Asset attribution policy: https://raw.githubusercontent.com/storytold/vectorcraft/main/ASSETS.md — branding and third-party assets have their own conditions. No such assets, logos, fonts or audio are included.
- SVG image restrictions: https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image — image contexts differ from executable embedded documents. This importer rebuilds a narrow allowlist and then rasterizes; it does not depend on a raw SVG being harmless.

These are the sources actually inspected. There is no pinned vendored dependency, no compiled ArtCraft suite, and no claim of a native VectorCraft roundtrip. Network access from the build container was unavailable; official documentation was reviewed through the browsing tool. No ArtCraft service credentials or backend are needed.

## What actually integrates

A local file-format handoff: **editable SVG → validated preview → PNG → one learner's explorer / creative stamp**. This does not import a professional editor or connect learner profiles to external services. The code is original, inspired by the documented workflow; it is not a port of upstream Rust implementation.

Fern's SVG geometry is original artwork created for this Black Flag release. It can be downloaded from the workshop or found in `Fern-original.svg`. The game and editable file use the same shape definitions. Do not assume open-source software licenses grant rights to arbitrary imported art; use your own or permissioned illustration.

## Supported SVG subset

- Root SVG with valid namespace and viewBox or positive dimensions.
- Groups; paths; rectangles; circles; ellipses; lines; polylines; polygons.
- Flat fills, strokes, bounded transforms and simple local linear/radial gradients.
- Selected inline presentation properties. Title/description text is discarded.
- At most 256 KiB, 500 elements, nesting depth 24, 120,000 path characters; coordinates are bounded.

Scripts, event handlers, stylesheets, foreignObject, links, images (including embedded images), external references, text/fonts, animations, filters, masks, use/symbol references and unsupported attributes are refused. Unsupported content is **not silently stripped into a misleading partial illustration**. Export outlined text and simple vector geometry. Complex exports may need simplifying in their authoring tool.

A PNG up to 512 × 512 is produced in the browser. The preview approval is separate from selecting the file. A stale asynchronous preview cannot attach itself to another learner after switching. The editable SVG source stays outside the stored profile. No raw source markup is inserted into the active page.

## Saved representation

Optional profile property: `artwork = {schema: 1, label: string, png: data:image/png;base64,...}`. At most 350,000 data-URL characters. Only a PNG with the expected header/trailer and bounded dimensions is accepted by profile validation. This is a bounded representation check, not an independent full PNG decoder. The browser performs actual image decoding during preparation. The normal progress-export checksum covers the image too, but is not a signature, access control or encryption.

One illustration per learner. Replacing it changes that learner's existing My art stamps. Changing explorer to Fern or another built-in does not remove their imported illustration or prior creations. Other learners are never changed by this action.

## Fleet reuse

The static public ship passport names this capability for review-and-adopt. Nothing auto-updates the fleet. Future production integration still requires separate origin/authority design, educator/privacy review, and verified recovery. Do not place personal progress exports in repositories or in a public asset library.
