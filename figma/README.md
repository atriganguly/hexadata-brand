# Figma library: "HexaData Brand 2.0"

`figma/sync-payload.json` is **generated** from `brand/` (never edit it). The Figma file is built from it and recorded in `STATE.json`.
File: <https://www.figma.com/design/qt2L3DrkULnU1kCINsFYIu> (lives in the owner's Drafts: share it from Figma to give others access).

## What is in the file

| Page         | Content                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Brand`      | Cover, Colour (swatches bound to variables, semantic roles light/dark), Typography (text styles), Foundations (radius, elevation, spacing) |
| `Logo`       | The eight official PNG logos, each on the surface it was designed for, with the trademark notice                                           |
| `Components` | `Button` (primary, secondary, ghost, danger) and `Badge` (5 tones) component sets bound to the Semantic Light variables                    |

Variables: `Primitives` (10 colours), `Semantic Light` and `Semantic Dark` (15 roles each, aliases to Primitives), `Spacing`, `Radius`, `Font size`.
Text styles: Heading H1-H5, Body, Label, Mono. Effect styles: Shadow 1-3. Every variable has scopes and a WEB code syntax (`var(--hd-...)`).

## Limits of the current Figma plan (Starter)

- **One mode per collection**, so light/dark are two collections (`Semantic Light`, `Semantic Dark`) instead of two modes. On Professional or above, merge them into one `Semantic` collection with Light and Dark modes.
- **Three pages**, which is why Brand holds several frames.
- **No library publishing** and no Variables REST API, so syncing runs through the Figma plugin API (Claude's `use_figma`), not CI.
- **Fonts:** Figma's font library has no Inter Tight and no Space Grotesk SemiBold. Body styles use Inter and headings H3-H5 use Space Grotesk Bold; each style's description says so. Install the official TTFs (`brand/fonts/ttf`) locally for exact rendering.
- **Logos are raster** (PNG) until the vector masters arrive in v2.1.

## Re-syncing after a brand change

1. Edit `brand/`, then `npm run generate` (rewrites `figma/sync-payload.json`).
2. Ask Claude (with the Figma connector) to "sync the HexaData Figma library from figma/sync-payload.json". The sync is idempotent: variables, styles and frames are matched by name and updated in place.
3. `node scripts/figma-state.mjs record` and commit `figma/STATE.json`.

CI runs `node scripts/figma-state.mjs check` and fails when the brand changed but the recorded sync did not.
