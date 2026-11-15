# Draft: Brand Kit v1.1 amendment request

**To:** HexaData brand owner / Esconet Technologies Limited · **Status:** draft, **nothing here is implemented in the package** (Brand Kit v1.0: "DO NOT use any other shades").

## Why

Measured against the Brand Kit's own white (`#F8FAFC`), all prescribed neutral pairings already pass AAA, so **no change to Obsidian, Midnight, Grey or White is proposed**.
Two real-world needs cannot be met with v1.0 colours (see `docs/contrast-matrix.md`):

1. **Muted/secondary text on light backgrounds.** Grey is 2.08:1 on white. No grey can be ≥4.5:1 on both white and obsidian (mathematical ceiling 3.98:1), so light and dark modes need _different_ muted greys.
2. **Coloured text/icons on white.** Of the accents only Deep Blue passes 4.5:1 on white.

Until approved, the package follows **rules instead of new colours**: muted text on light = obsidian; accent text on light = deep blue; text on accent fills = obsidian (see `ACCESSIBILITY.md`).

## Proposal (derived tokens: visible changes, ΔE2000 ≈ 8–21, so they are _new tokens_, not tweaks)

| Token                                      | Hex       | Ratio on white `#F8FAFC`            | Notes                                                           |
| ------------------------------------------ | --------- | ----------------------------------- | --------------------------------------------------------------- |
| **Grey Ink** (muted text, light mode only) | `#6A7381` | 4.58                                | Not for dark mode (3.46 on obsidian); keep Grey `#A3B1C6` there |
| Cyan, on-light                             | `#007E95` | 4.54                                | Only for text/icons on white                                    |
| Vivid Cerulean, on-light                   | `#017BAE` | 4.51                                |                                                                 |
| Crimson, on-light                          | `#D93229` | 4.52                                |                                                                 |
| Green, on-light                            | `#0B835C` | 4.55                                |                                                                 |
| Copper, on-light                           | `#A06707` | 4.52                                |                                                                 |
| Deep Blue, on-dark                         | `#3E8DBB` | 4.53 on obsidian · 4.90 on midnight | Only for text/icons on dark                                     |

Margins are thin (4.51–4.58). If approved, nudge each ≥ 0.1 darker for rounding/rendering safety. These tokens are valid **on white only** (≈2.2:1 on the grey background) and would be added to
`tokens/brand.json` with their pairs, after which the generator, CI matrix and remote guard pick them up automatically.

## Decision requested

☐ Approve Grey Ink · ☐ Approve accent on-light variants · ☐ Approve Deep Blue on-dark · ☐ Keep rule-based approach only
