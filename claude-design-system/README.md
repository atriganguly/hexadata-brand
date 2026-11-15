# Claude Design System for HexaData

The artifact <https://claude.ai/artifact/5WqsTjQNdX7cu2m1qZGpNA> ("HexaData Design System") lets Claude build anything on-brand: tokens (colour roles in light and dark, type, spacing, radius, shadow), the brand book (voice, rules, legal), the official logos and fonts, and live previews of every component.

It is **generated from this repository** (`scripts/build-claude-ds.mjs` reads the built package) and never edited by hand.

## Keeping it in sync

- `npm run claude-ds:check` (run by CI) fails when the repo changed since the last published version.
- To publish: `npm run build && npm run build:logos`, then `node scripts/build-claude-ds.mjs` and ask Claude (with the Artifact tool) to publish `claude-ds-out/project/*` to the artifact URL (index: `claude-ds-out/index.template.json` plus `createdOnFiles`/`lastChange`; read the live index first). Then `npm run claude-ds:record` and commit `STATE.json`.
- A scheduled Claude task checks weekly and re-publishes automatically when the check fails.
- **Logos:** the artifact stores uploads. If `brand/logo` changed, re-upload the changed PNGs from `dist/logo` and update the blob ids in `assets.json`.
- Anything Claude produces from this system is still bound by `BRAND-LICENSE.md`.
