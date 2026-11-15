# AGENTS.md: HexaData Brand (maintainer guide for humans and AI agents)

> Skeleton from Phase 0. The full version is written in Phase 8 of the 2.0 plan. Rules below are already binding.

## What this repo is

The single source of truth for the HexaData brand. Every HexaData app, site and document consumes it. Brand values live in one place and everything else is generated.

## Hard rules (never break)

1. **Never invent, infer or "improve" a brand value** (colour, font, tagline, logo, spacing). Source order: `brand/` > `brand/kit/HexaData-Brand-Kit-v1.0.pdf` > nothing. If a value is not there, stop and ask a human.
2. **Never hand-edit a file whose first lines say `GENERATED FILE`.** Edit the source and run `npm run generate`.
3. **Never rename or remove a public name** (CSS variable, class, export, element tag, hosted path, manifest key) without a major version bump.
4. **Never touch signing keys** (`*.jwk`, `*.pem`, `*.key`), never publish, never push tags, never force-push.
5. A brand value change must update the source **and** the golden values in `test/tokens.test.ts` together; CI fails otherwise.
6. Never add a runtime dependency, network call, browser storage or third-party URL to shipped code.
7. Pure `#000000` / `#FFFFFF` are never tokens.
8. **Keys**: `brand/keys.json` holds PUBLIC keys only. Never generate, print, commit or paste a private signing key; never change the trusted keys without the brand owner. The channel is only ever signed in CI by the brand owner's secret.
9. **Licensing split**: software is Apache-2.0, HexaData Brand Assets are NOT (see BRAND-LICENSE.md). Never relicense, never put brand assets (logos, taglines, Brand Kit) outside `brand/logo/` and `brand/kit/`, never describe them as open or free, never edit `LICENSE`, `BRAND-LICENSE.md` or `NOTICE` without the brand owner's approval.

## Commands (Node 22+; on this Windows machine activate with `fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression; fnm use default`)

`npm run generate` · `npm run typecheck` · `npm run lint` · `npm run format:check` · `npm test` · `npm run build` · `npm run build:fonts` · `npm run test:dist` · `npm run test:e2e` · `npm run verify:release`

## Website and PDF

`site/` is a framework-free static generator that reads the BUILT package (`dist/core`), so it cannot disagree with what ships. Never hard-code a colour, size or text that exists in `brand/`: read it from the data. Never add inline `style=` attributes (strict-CSP friendly). The Brand Kit PDF is the site's `/print/` route; after any brand change run `npm run build:pdf` and commit the PDF (CI runs `pdf:check`). The site test (`npm run test:site`) must stay axe-clean in light and dark.

## Definition of done

All commands above pass, `npm run generate:check` shows no drift, CHANGELOG updated, and anything needing human sign-off (new brand values, licence, publishing) is listed for the owner rather than done.
