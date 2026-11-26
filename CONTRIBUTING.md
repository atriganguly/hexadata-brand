# Contributing

Thanks for helping. This repository is the **single source of truth for the HexaData brand**, so a few rules protect it. Please read [AGENTS.md](AGENTS.md) (it applies to people as much as to AI agents) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## What can be contributed

| Welcome                                                                                   | Needs the brand owner first                                                                                                    |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Bug fixes, accessibility fixes, docs, tests, build and CI improvements, new platform glue | Any change to a brand value (colour, font, tagline, logo, spacing), `LICENSE`, `BRAND-LICENSE.md`, `NOTICE`, `brand/keys.json` |
| New components or tokens that follow the existing patterns (additive only)                | Removing or renaming a public name (needs a major version)                                                                     |

Open an issue first for anything larger than a small fix. For brand changes use the **Brand permission request** or **Feature request** template and wait for approval.

## Versioning

Versions are MAJOR.VISUAL.CHORE: the first number is the major version of the system, the second counts visual updates (it resets the third), the third counts technical chores that do not change the brand's appearance. `npm run version:check` enforces it against the last release tag; see AGENTS.md.

## Set up

Node 22 or newer.

```bash
git clone https://github.com/atriganguly/hexadata-brand.git
cd hexadata-brand
npm ci --ignore-scripts
npm run generate && npm test
npm run build && npm run build:fonts && npm run build:logos
```

Before opening a pull request run everything CI runs:

```bash
npm run generate:check && npm run typecheck && npm run lint && npm run format:check && npm test
npm run test:dist && npm run test:e2e && npm run test:site && npm run verify:release
```

(`npx playwright install chromium` once for the browser tests.) See [AGENTS.md](AGENTS.md) for the repo map and recipes.

## Rules that CI enforces

- **Generated files are never edited by hand.** Change `brand/` or an emitter in `scripts/generate/`, then `npm run generate`.
- **Names are the API.** The contract test only lets public names grow within a major version.
- **Contrast is a gate.** Do not loosen a pair in `brand/contrast.json`.
- **Zero runtime dependencies, no network or storage in shipped code**, no inline styles or scripts.
- **Accessibility:** the website must stay axe-clean (WCAG 2.2 AA) in light and dark.
- Add or update tests, and add a line to [CHANGELOG.md](CHANGELOG.md).

## Pull requests

- Small, focused, with a clear title in the imperative (`fix: ...`, `feat: ...`, `docs: ...`). PRs are squash-merged, so the title becomes the commit message.
- Fill in the template checklist honestly, including anything you could not verify.
- By contributing you agree that your contribution is licensed under Apache-2.0 (the software). You cannot contribute HexaData trademarks or brand assets; see [BRAND-LICENSE.md](BRAND-LICENSE.md).

### Review and testing policy

- The project is maintained by one person, so there is no mandatory second human review. Every change to `main` is instead gated by the required CI checks in the `main protection` ruleset (pull request, squash merge, and passing `verify (22)`, `verify (24)` and `browser`).
- Changes that touch brand values also need the two-key golden update described in [AGENTS.md](AGENTS.md).
- Fuzzing is not yet in CI. Parsing-heavy code (the signed-manifest verifier and token readers) is covered by unit and e2e tests instead.

## Security and conduct

Report vulnerabilities privately (see [SECURITY.md](SECURITY.md)), never in a public issue. Report conduct problems to the address in the [Code of Conduct](CODE_OF_CONDUCT.md).
