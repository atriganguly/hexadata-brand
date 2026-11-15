# AGENTS.md: HexaData Brand (maintainer guide for humans and AI agents)

This file is canonical. `CLAUDE.md` imports it. Machine guardrails back every rule here (`.claude/hooks/guard.mjs`, `.claude/settings.json`, tests, CI), but read the rules anyway.

## What this repo is

The single source of truth for the HexaData brand. Everything visual (colours, type, logos, taglines, foundations) lives in `brand/`; everything else is **generated** from it or hand-written glue that consumes it. Every HexaData app, site, document and platform imports the outputs, so one change in `brand/` reaches all of them.

## Repo map

| Path                                                         | What                                                                                                      | Edit by hand?                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `brand/tokens/*.tokens.json`                                 | W3C DTCG 2025.10 tokens: colour, semantic roles, typography, space, radius, shadow, motion, breakpoint, z | **Yes (the source)**                   |
| `brand/contrast.json`, `content.json`                        | Allowed/forbidden colour pairs; names, taglines, origin, revision                                         | **Yes (the source)**                   |
| `brand/logo/`, `brand/fonts/`, `kit/`                        | Official masters (PNG logos, static TTFs, Brand Kit PDFs) + `logo.json` / `fonts.json` fingerprints       | Replace files only with owner approval |
| `brand/keys.json`                                            | PUBLIC Ed25519 keys for the signed live manifest                                                          | Owner only                             |
| `scripts/generate/` + `generate.ts`                          | Model loader, validator and one emitter per output                                                        | Yes                                    |
| `src/core`, `react`, `native`, `elements`, `css`, `tailwind` | Package source. Files headed `GENERATED FILE` are outputs                                                 | Only the non-generated ones            |
| `platforms/`                                                 | Python, Flutter, Swift, Android, Office, e-mail, print (tokens generated, glue hand-written)              | Glue only                              |
| `figma/`                                                     | Generated sync payload, `STATE.json`, runbook                                                             | `README.md`/`STATE.json` via the tool  |
| `site/`                                                      | Static website generator + print route for the PDF                                                        | Yes                                    |
| `scripts/`                                                   | Build, release, channel, PDF, logo/font tools                                                             | Yes                                    |
| `test/`                                                      | Unit, golden, contract, dist, e2e, site tests                                                             | Yes                                    |
| `dist/`, `channel-out/`, `site-out/`                         | Build output (git-ignored)                                                                                | Never                                  |

## Hard rules (never break)

1. **Never invent, infer or "improve" a brand value** (colour, font, tagline, logo, spacing). Source order: `brand/` > `brand/kit/HexaData-Brand-Kit-v1.0.pdf` > nothing. If a value is not there, stop and ask a human. Foundations, component rules and logo rules were approved by the owner on 2026-11-15; anything new that Brand Kit v1.0 and `docs/FOUNDATIONS-PROPOSAL.md` do not cover is NOT approved: propose it, do not ship it as official.
2. **Never hand-edit a file whose first lines say `GENERATED FILE`.** Edit `brand/` (or the emitter), then `npm run generate`. The guard hook blocks it.
3. **Never rename or remove a public name** (CSS variable, class, export, element tag, hosted path, manifest key, logo id) without a major version bump. `test/contract/public-api.json` only grows within a major.
4. **Never touch signing keys** (`*.jwk`, `*.pem`, `*.key`, `~/.hexadata-brand-secrets`): never read, print, paste, commit or regenerate them. `brand/keys.json` holds PUBLIC keys only and changes only with the brand owner. The channel is signed in CI by the owner's `HEXA_SIGNING_JWK` secret.
5. **Two-key rule:** a brand value changes only if `brand/` AND `test/golden/brand.golden.json` change together (`UPDATE_GOLDEN=1 npm test`, then review the diff). Same for the contract snapshot (`UPDATE_CONTRACT=1`).
6. Never add a runtime dependency, network call, browser storage, inline `style=`/`<script>`, `eval`, or third-party URL to shipped code. The package has **zero runtime dependencies**; the only URL allowed is the brand origin.
7. Pure `#000000` / `#FFFFFF` are never tokens (only documented fallbacks).
8. **Licensing split:** software is Apache-2.0; the HexaData Brand Assets (names, logos, taglines, Brand Kit, brand pack) are NOT open (`BRAND-LICENSE.md`). Never relicense, never place brand assets outside `brand/logo/` and `brand/kit/`, never call them open or free, never edit `LICENSE`, `BRAND-LICENSE.md` or `NOTICE` without the owner.
9. **Outward-facing actions need the owner's explicit go-ahead in that session:** `git push`, tags, releases, npm/PyPI publish, GitHub settings or secrets, Pages changes, Figma file changes. Never force-push. Never use a personal email in commits: use the GitHub noreply identity already configured.
10. Contrast is a build gate: never loosen a contrast pair, never add an allowed pair that is below its minimum, never use a forbidden pair.

## Recipes

**Change a colour / tagline / font / foundation value (owner-approved only).** Edit the file in `brand/` -> bump `revision` in `brand/content.json` -> `npm run generate` -> `UPDATE_GOLDEN=1 npm test` and review the golden diff -> `npm run build:pdf` (commit the PDF) -> `npm run figma:check` then re-sync Figma and `npm run figma:record` -> CHANGELOG -> full checks.

**Replace a logo.** Owner supplies the file -> overwrite the file in `brand/logo/source/` keeping the id -> `npm run logo:measure` -> review `logo.json` diff -> `npm run build:logos` -> build:pdf, Figma re-sync -> checks. Vector masters (v2.1) follow the same path; ids never change.

**Replace a font.** Same with `brand/fonts/ttf/` + `npm run font:measure`; check the licence (SIL OFL) and that PostScript names still match `NATIVE_FONTS`.

**Add a token group / component / platform.** Add the DTCG file or emitter under `scripts/generate/`, register it in `generate.ts`, add tests (golden/contract/css-rules/platforms), update the site catalogue (`site/catalogue.mjs`) and docs. New names are additive only.

**Rotate the signing key.** Owner generates the new key (`npm run manifest -- keygen`), adds its PUBLIC key as the second slot of `brand/keys.json`, release, wait for adoption, switch the CI secret, later drop the old public key. See `SECURITY.md`.

**Release.** Owner bumps `package.json` version + CHANGELOG, tags `vX.Y.Z`; `release.yml` verifies, builds archives/wheel/SBOM and creates the GitHub release. npm/PyPI publishing is off until the owner sets the `PUBLISH_NPM` / `PUBLISH_PYPI` variables and configures trusted publishing.

## Commands (Node 22+; on the maintainer's Windows machine activate with `fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression; fnm use default`)

`npm run generate` · `generate:check` · `typecheck` · `lint` · `format:check` · `test` · `build` · `build:fonts` · `build:logos` · `build:channel` · `build:platforms` · `build:site -- --base /` · `build:pdf` · `test:dist` · `test:e2e` · `test:site` · `verify:release` · `pdf:check` · `figma:check` · `preview`

Run the full set before saying "done". `npm test` needs no build; the dist/e2e/site tests need `build`, `build:fonts`, `build:logos` first.

## Website and PDF

`site/` is a framework-free static generator that reads the BUILT package (`dist/core`), so it cannot disagree with what ships. Never hard-code a colour, size or text that exists in `brand/`: read it from the data. Never add inline `style=` attributes. The Brand Kit PDF is the site's `/print/` route; after any brand change run `npm run build:pdf` and commit the PDF (CI runs `pdf:check`). `npm run test:site` must stay axe-clean in light and dark.

## Pitfalls seen in this repo

- Generated and tool-written JSON (`test/contract`, `test/golden`, `figma/sync-payload.json`) is Prettier-ignored on purpose.
- Text files must hash identically on Windows and Linux (CRLF!): hash normalised content only; fonts/icons/PDFs/PNGs are `binary` in `.gitattributes`.
- A CSP host source with a path must match exactly: use the bare origin in `connect-src`.
- `HexaProvider`/`<hexa-*>` fetch the signed manifest by default once keys exist: tests that assert "zero requests" must opt out (`live={false}`, `data-hd-live="off"`).

## Definition of done

All commands above pass, `generate:check` shows no drift, CHANGELOG updated, and anything needing human sign-off (new brand values, licence, publishing, pushing) is listed for the owner rather than done.
