# Proposal: v2.0 foundations and components (needs owner approval)

**Status:** implemented as `proposed`, **not yet approved**. Brand Kit v1.0 defines logo, colours, fonts and taglines only. Everything below is new and is tagged `"status": "proposed"` in `brand/tokens/*`. Approve, change or reject each row; changes are one-line edits in `brand/` followed by `UPDATE_GOLDEN=1 npm test`.

Nothing here changes any Kit-defined value (palette, fonts, taglines, black/grey/white rules).

| Area               | Proposal                                                                                                       | Why                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Spacing            | 4px base: 0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 (x 0.25rem)                                          | Identical to Tailwind's default, so utilities and variables agree                                       |
| Radius             | none 0, sm 4px, md 8px, lg 12px, xl 16px, full                                                                 | Friendly but technical; hardware-vendor feel                                                            |
| Elevation          | 3 levels, tinted with Midnight                                                                                 | Brand rule: on dark surfaces separate with a grey border, shadow is a bonus                             |
| Motion             | 120 / 200 / 320 ms; 3 easings; zero under `prefers-reduced-motion`                                             | Accessibility                                                                                           |
| Type scale         | 0.75 to 3.75 rem (10 steps); line heights 1.2 / 1.35 / 1.5 / 1.7; headings fluid                               | Space Grotesk for headings, Inter Tight body, JetBrains Mono for detailed paragraphs and code (per Kit) |
| Breakpoints        | 40 / 48 / 64 / 80 / 96 rem                                                                                     | Standard                                                                                                |
| z-index            | base 0, dropdown 1000 ... tooltip 1500                                                                         | Avoids z-index wars across apps                                                                         |
| New semantic roles | `accentFill`, `onAccentFill`, `danger`, `warning`, `success`, `onStatus` (all map to existing palette colours) | Lets components stay inside the Kit's allowed contrast pairs in both themes                             |

## Logo (needs owner input)

- **Raster only.** Brand Kit v1.0 contains PNG-quality logos (500 px wordmarks, 4096 px icon tiles). 500 px is soft for large displays; please supply vector masters or 2000 px+ exports. Replace the files in `brand/logo/source/`, run `npm run logo:measure`, and nothing else changes.
- **Inconsistent artwork in the Kit:** the three centered lockups have different proportions (442x296, 456x293, 479x362) and the dark-tile icon uses a navy that is not in the palette. Flagged, not altered.
- **Mono artwork exists only for dark surfaces**, and there is no transparent icon (only white and navy tiles).
- **Clear space, minimum size and misuse rules are proposals** (in `brand/logo/logo.json`, `rules`): clear space of about 0.2 x logo height; minimum widths 24 px icon, 96 px centered, 120 px horizontal.
- **Default image source is the hosted channel** (`<origin>/v2/logo/`). Say if you would rather default to self-hosting.

## Rules the components follow (derived from the Kit, not invented)

- Text on cyan, cerulean, crimson, copper and green fills is **Obsidian**; only Deep Blue takes White (light mode primary buttons). In dark mode the primary fill is Vivid Cerulean with Obsidian text.
- Status alerts and badges are **solid fills** because status colours fail 3:1 on white as text or thin outlines.
- Links on the grey (alt) surface use Obsidian + underline, since Deep Blue on Grey is 2.67:1. The real-browser test caught this exact case.
- Hover/active states use elevation, underline and the alt surface, never a new colour shade ("DO NOT use any other shades").
- Disabled controls use reduced opacity (WCAG-exempt); this is the only place a blended shade can appear.

## Not done / deliberately open

- **On-light text variants of accent colours and a light-mode muted grey** (`docs/AMENDMENT-REQUEST.md`) are **not implemented**; they are new brand colours. Components use the rule-based approach above.
- **Tooltip** is not included: an accessible tooltip needs script behaviour; it will ship with the web components.
- Hover/pressed colours for primary buttons are intentionally absent for the same "no new shades" reason.

## How it is verified

- `test/css-rules.test.ts`: hand-written CSS uses only `--hd-*` variables, no raw colours, and every background/text pair in one rule passes 4.5:1 in **both** themes.
- `test/e2e/run.mjs`: a component gallery is rendered in real Chromium in light and dark; every text element's computed contrast must be at least 4.5:1.
- `test/contract.test.ts`: every class name and variable is frozen within 2.x.
