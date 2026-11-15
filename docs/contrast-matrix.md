<!-- GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`). -->
# Contrast matrix (WCAG 2.x)

Computed from `brand/`. Legend: ✓✓ ≥ 7 (AAA text) · ✓ ≥ 4.5 (AA text) · ◐ ≥ 3 (large text / UI only) · ✗ < 3.
Contrast is symmetric, but *use* is directional: see the rules below.

| | cyan | deepBlue | obsidian | vividCerulean | midnight | grey | white | crimson | copper | green |
|---|---|---|---|---|---|---|---|---|---|---|
| **cyan** | – | 1.76 ✗ | 5.03 ✓ | 1.16 ✗ | 5.44 ✓ | 1.52 ✗ | 3.15 ◐ | 1.07 ✗ | 1.54 ✗ | 1.30 ✗ |
| **deepBlue** | 1.76 ✗ | – | 2.87 ✗ | 2.03 ✗ | 3.10 ◐ | 2.67 ✗ | 5.54 ✓ | 1.63 ✗ | 2.70 ✗ | 2.28 ✗ |
| **obsidian** | 5.03 ✓ | 2.87 ✗ | – | 5.83 ✓ | 1.08 ✗ | 7.64 ✓✓ | 15.87 ✓✓ | 4.68 ✓ | 7.73 ✓✓ | 6.55 ✓ |
| **vividCerulean** | 1.16 ✗ | 2.03 ✗ | 5.83 ✓ | – | 6.30 ✓ | 1.31 ✗ | 2.72 ✗ | 1.25 ✗ | 1.33 ✗ | 1.12 ✗ |
| **midnight** | 5.44 ✓ | 3.10 ◐ | 1.08 ✗ | 6.30 ✓ | – | 8.26 ✓✓ | 17.16 ✓✓ | 5.06 ✓ | 8.36 ✓✓ | 7.08 ✓✓ |
| **grey** | 1.52 ✗ | 2.67 ✗ | 7.64 ✓✓ | 1.31 ✗ | 8.26 ✓✓ | – | 2.08 ✗ | 1.63 ✗ | 1.01 ✗ | 1.17 ✗ |
| **white** | 3.15 ◐ | 5.54 ✓ | 15.87 ✓✓ | 2.72 ✗ | 17.16 ✓✓ | 2.08 ✗ | – | 3.39 ◐ | 2.05 ✗ | 2.42 ✗ |
| **crimson** | 1.07 ✗ | 1.63 ✗ | 4.68 ✓ | 1.25 ✗ | 5.06 ✓ | 1.63 ✗ | 3.39 ◐ | – | 1.65 ✗ | 1.40 ✗ |
| **copper** | 1.54 ✗ | 2.70 ✗ | 7.73 ✓✓ | 1.33 ✗ | 8.36 ✓✓ | 1.01 ✗ | 2.05 ✗ | 1.65 ✗ | – | 1.18 ✗ |
| **green** | 1.30 ✗ | 2.28 ✗ | 6.55 ✓ | 1.12 ✗ | 7.08 ✓✓ | 1.17 ✗ | 2.42 ✗ | 1.40 ✗ | 1.18 ✗ | – |

## Allowed pairs (enforced in CI and by the remote-manifest guard)

| Pair | Ratio | Min | Use |
|---|---|---|---|
| obsidian on white | 15.87 | 4.5 | Primary text, light mode |
| midnight on white | 17.16 | 4.5 | Alternative dark text, light mode |
| obsidian on grey | 7.64 | 4.5 | Text on secondary light background |
| midnight on grey | 8.26 | 4.5 | Alternative text on secondary light background |
| white on obsidian | 15.87 | 4.5 | Primary text, dark mode |
| white on midnight | 17.16 | 4.5 | Text on secondary dark background |
| grey on obsidian | 7.64 | 4.5 | Alternative light text / muted text, dark mode |
| grey on midnight | 8.26 | 4.5 | Alternative light text on secondary dark background |
| obsidian on cyan | 5.03 | 4.5 | Text on cyan fill (CTA) |
| obsidian on vividCerulean | 5.83 | 4.5 | Text on cerulean fill (CTA) |
| obsidian on crimson | 4.68 | 4.5 | Text on crimson fill (error/destructive) |
| obsidian on copper | 7.73 | 4.5 | Text on copper fill (warning) |
| obsidian on green | 6.55 | 4.5 | Text on green fill (success) |
| midnight on cyan | 5.44 | 4.5 | Alternative text on cyan fill |
| midnight on vividCerulean | 6.30 | 4.5 | Alternative text on cerulean fill |
| midnight on crimson | 5.06 | 4.5 | Alternative text on crimson fill |
| midnight on copper | 8.36 | 4.5 | Alternative text on copper fill |
| midnight on green | 7.08 | 4.5 | Alternative text on green fill |
| white on deepBlue | 5.54 | 4.5 | Text on deep-blue fill (CTA) |
| deepBlue on white | 5.54 | 4.5 | Links / accent text, light mode |
| cyan on obsidian | 5.03 | 4.5 | Accent text, dark mode |
| cyan on midnight | 5.44 | 4.5 | Accent text, dark mode (secondary) |
| vividCerulean on obsidian | 5.83 | 4.5 | Accent text, dark mode |
| vividCerulean on midnight | 6.30 | 4.5 | Accent text, dark mode (secondary) |
| crimson on obsidian | 4.68 | 4.5 | Error text, dark mode |
| crimson on midnight | 5.06 | 4.5 | Error text, dark mode (secondary) |
| copper on obsidian | 7.73 | 4.5 | Warning text, dark mode |
| copper on midnight | 8.36 | 4.5 | Warning text, dark mode (secondary) |
| green on obsidian | 6.55 | 4.5 | Success text, dark mode |
| green on midnight | 7.08 | 4.5 | Success text, dark mode (secondary) |
| cyan on white | 3.15 | 3 | Non-text UI (icons, borders), light mode |
| deepBlue on white | 5.54 | 3 | Non-text UI, light mode |
| crimson on white | 3.39 | 3 | Non-text UI (error outline), light mode |
| grey on obsidian | 7.64 | 3 | Non-text UI (borders), dark mode |
| grey on midnight | 8.26 | 3 | Non-text UI (borders), dark mode |
| deepBlue on midnight | 3.10 | 3 | Non-text UI on secondary dark background |

## Forbidden pairs (documented, and asserted to be below their threshold)

| Pair | Ratio | Needs | Why |
|---|---|---|---|
| grey on white | 2.08 | 4.5 | Grey text on white is 2.08:1. No single grey can serve both white and obsidian at 4.5:1 (ceiling 3.98:1). |
| white on grey | 2.08 | 4.5 | White text on the grey background is 2.08:1. |
| obsidian on midnight | 1.08 | 3 | 1.08:1. Separate dark surfaces with a grey border, never by colour alone. |
| midnight on obsidian | 1.08 | 3 | 1.08:1. Separate dark surfaces with a grey border, never by colour alone. |
| cyan on white | 3.15 | 4.5 | Cyan text on white is 3.15:1 (UI use at 3:1 is allowed). |
| vividCerulean on white | 2.72 | 3 | 2.72:1: fails even the 3:1 non-text minimum on light backgrounds. |
| crimson on white | 3.39 | 4.5 | Crimson text on white is 3.39:1 (UI use at 3:1 is allowed). |
| copper on white | 2.05 | 3 | 2.05:1: fails the 3:1 non-text minimum on light backgrounds. |
| green on white | 2.42 | 3 | 2.42:1: fails the 3:1 non-text minimum on light backgrounds. |
| deepBlue on obsidian | 2.87 | 3 | 2.87:1 on obsidian: invisible as text or UI in dark mode. |
| deepBlue on midnight | 3.10 | 4.5 | 3.10:1 on midnight: UI use only, never text. |
| deepBlue on grey | 2.67 | 3 | 2.67:1 on the grey background. |
| white on cyan | 3.15 | 4.5 | White text on cyan fill is 3.15:1. Use obsidian. |
| white on vividCerulean | 2.72 | 4.5 | White text on cerulean fill is 2.72:1. Use obsidian. |
| white on crimson | 3.39 | 4.5 | White text on crimson fill is 3.39:1. Use obsidian. |
| white on copper | 2.05 | 4.5 | White text on copper fill is 2.05:1. Use obsidian. |
| white on green | 2.42 | 4.5 | White text on green fill is 2.42:1. Use obsidian. |
