# Accessibility

Target: **WCAG 2.2 AA** (a superset of the 2.1 AA level referenced by EN 301 549 / the European Accessibility Act). The brand colours are _measured_, not assumed:
the full matrix is in [docs/contrast-matrix.md](docs/contrast-matrix.md) (generated; CI fails on drift).

## What holds without changing a single brand hex

All four neutrals already pass every pairing the Brand Kit prescribes (AAA: 7.6–17.2:1). Two things can **never** work and are forbidden:

| Never                                         | Because                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Grey text on white (or white text on grey)    | 2.08:1. No single grey can reach 4.5:1 on both white and obsidian (ceiling 3.98:1, proven in `test/tokens.test.ts`). |
| Obsidian ↔ midnight as text/background/border | 1.08:1. Separate dark surfaces with a **grey border** (7.64:1), never colour alone.                                  |

## Pairing rules

- **Text on an accent fill** (cyan, cerulean, crimson, copper, green): use **obsidian** (4.68–7.73:1). White text on those fills fails (2.05–3.39:1). Only **deep blue** takes white text (5.54:1).
- **Accent as text on light backgrounds:** only **deep blue** passes (5.54:1). Cyan/crimson are fine for non-text UI (≥3:1); cerulean, copper and green fail even 3:1 on light backgrounds, so **never rely on them alone**; pair with an icon, label or outline (WCAG 1.4.1, 1.4.11).
- **Accent as text on dark backgrounds:** cyan, cerulean, crimson, copper, green pass (≥4.68:1). **Deep blue fails** (2.87:1 on obsidian).
- **Muted text:** dark mode → grey (7.64:1). Light mode → obsidian at lighter weight/size (no sanctioned light-mode grey exists; see the proposed amendment in [docs/AMENDMENT-REQUEST.md](docs/AMENDMENT-REQUEST.md)).
- **Controls' borders** that identify an input need 3:1: use `--hd-border-strong`. `--hd-border-subtle` is decorative only.

All of the above are encoded as `ALLOWED_PAIRS`/`FORBIDDEN_PAIRS`, tested in CI, and **enforced on every remote manifest**.

## Built in

`prefers-color-scheme` + `data-theme`, `prefers-contrast: more` (subtle borders/muted text promote to strong), `color-scheme` set so native controls follow the theme.
Pure `#000000`/`#FFFFFF` are never tokens; per Brand Kit v1.0 they are available only as `FALLBACK_COLORS` for print/email/forced-colors situations.

## Not guaranteed by a token package

Focus visibility and size (2.4.11/2.5.8), target sizes, motion, text spacing (1.4.12; note the Brand Kit sets JetBrains Mono for paragraphs, so test long text), heading structure, and screen-reader semantics are the application's responsibility. Test with axe plus manual keyboard/screen-reader passes.
