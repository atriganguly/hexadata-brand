# Changelog

## Unreleased

- Tooling: dev-tooling group update (eslint 10, `@eslint/js` 10, `eslint-plugin-react-hooks` 7, `@capsizecss/unpack` 4 and `metrics` 4); `build-fonts` imports `fromFile` from `@capsizecss/unpack/fs`; `@types/node` stays on 22 (Dependabot ignores its majors). Generated output is unchanged.
- Repository: README with the official logo, badges and contents; community files (Code of Conduct, Contributing, Support, issue and PR templates, release-note categories, CITATION.cff); CodeQL, dependency review and OpenSSF Scorecard workflows; `security.txt` on the website; package metadata; GitHub settings, labels and rulesets.

## 2.0.0 (2026-11-15)

Full rebuild following a security/compliance/accessibility audit of 1.0.0. **Breaking.**

### Removed (breaking)

- Runtime Google Fonts `<link>` (`HexaBrandFonts`): fonts are self-hosted (`@hexadata/brand/fonts.css`).
- `localStorage`/`AsyncStorage` manifest cache and the `@react-native-async-storage/async-storage`, `react-native-svg`, `react-dom` peer dependencies.
- `HexaStyleRegistry` (inline `<script>`/`dangerouslySetInnerHTML`); replaced by a static stylesheet (`@hexadata/brand/css`).
- Hard-coded default `manifestUrl`; remote updates are opt-in (`remote`) and **must be Ed25519-signed**.
- `HexaDataProvider` → `HexaProvider`; `useHexaNativeTheme` now takes a theme mode.
- CSS variables are kebab-case (`--hd-deep-blue`, was `--hd-deepBlue`).

### Added

- `brand/` (DTCG token files) single source of truth + generator (TS, CSS, Tailwind v3 preset, Tailwind v4 theme, contrast matrix doc).
- WCAG contrast engine; allowed/forbidden colour pairs, semantic light/dark roles, CI enforcement, and a contrast guard on remote manifests.
- Signed manifest transport (https-only, no credentials/referrer, size/time bounded, anti-rollback, expiry, key rotation), per-key fallback with warnings, `parseManifest` is total (never throws).
- Operator tool `manifest-tool` (keygen/sign/verify); refuses to sign invalid manifests.
- Tailwind opacity modifiers (`bg-hd-cyan/50`), strict brand-only palette (opt-out via `createPreset({ extend: true })`).
- `"use client"` preserved in the React bundle; correct dual ESM/CJS types (`.d.cts`); resolver shims for old Metro / TS node10.
- Self-hosted variable WOFF2 (latin, latin-ext) + metric-matched fallbacks; Devanagari-capable system fallbacks in the stack.
- Docs: PRIVACY, SECURITY, ACCESSIBILITY, COMPLIANCE, amendment request. CI, release workflow, SBOM, Dependabot.

- Foundations (spacing, radius, elevation, motion, type scale, breakpoints, z-index) as DTCG tokens, emitted as CSS variables, `FOUNDATIONS` (TS), Tailwind v3 preset and v4 theme. **Proposed, pending owner approval**: `docs/FOUNDATIONS-PROPOSAL.md`.
- New semantic roles `accentFill`, `onAccentFill`, `danger`, `warning`, `success`, `onStatus` (palette colours only).
- `@hexadata/brand/base.css`, `/components.css`, `/all.css`: cascade-layered base styles and 20+ CSS components (button, fields, switch, card, badge, alert, table, tabs, dialog, breadcrumb, pagination, spinner, skeleton, avatar, code, layout, header/nav/footer). Contrast lint plus real-browser contrast test in both themes.
- Golden two-key test, public-API contract snapshot, Style Dictionary v5 interop test.

- Logo system: official PNG masters supplied by HexaData Marketing in `brand/logo/` (hash-verified by `logo.json`; same artwork as Brand Kit v1.0 p.2); `npm run build:logos` derives trimmed PNG/WebP wordmarks, icon sizes 64-1024, favicon.ico, app icons and a 1200x630 social card into `dist/logo` (also served as `@hexadata/brand/logo/*`). `<HexaLogo>` / `<hexa-logo>` render both artworks and let CSS pick one for the active theme. **Raster only**; vector masters are planned for v2.1.
- Custom elements `<hexa-tagline>`, `<hexa-logo>`, `<hexa-theme-toggle>`, `<hexa-tooltip>` (`@hexadata/brand/elements`, plus a self-registering `elements/auto` script) and React wrappers (`Button`, `ButtonLink`, `Alert`, `Badge`, `Card`, `Container`, `Stack`, `Cluster`, `Grid`, `Spinner`, `TextField`, `ThemeToggle`).

- Official fonts: the four brand weights of each family as static TTF in `brand/fonts` (hash-checked, identity-checked), shipped at `@hexadata/brand/fonts/ttf/*` for React Native, Flutter, iOS/Android and Office; supplied OFL texts are the authoritative licences.
- **Licensing changed**: software is now Apache-2.0; HexaData Brand Assets are protected by `BRAND-LICENSE.md` (trademark policy, permitted co-branding/sponsor/educational uses); `docs/USE-FOR-YOUR-OWN-BRAND.md` explains reuse for other brands. Package licence expression `Apache-2.0 AND LicenseRef-HexaData-Brand`; `publishConfig.access` is now `public`. Logo outputs embed the trademark notice (EXIF) and ship `dist/logo/NOTICE.txt`.

- **Live channel**: signed manifest v2 (adds descriptor and logo content hashes), keys embedded from `brand/keys.json`, live updates on by default for `HexaProvider` and `<hexa-*>` elements (`live={false}` / `data-hd-live="off"` to disable; no request at all while no keys are embedded). `npm run build:channel` assembles `/v2/` + an immutable `/<version>/` copy with SRI hashes and a signed `manifest.json`. Logo URLs carry a content-hash cache buster.
- **Zero runtime dependencies**: `zod` replaced by a hand-written validator (closes the high-severity audit finding); `HexaManifestSchema.safeParse` is kept.

- **Website** (static, framework-free, built from the package itself): home, logo, colour (swatches, roles, live contrast matrix, forbidden pairs), typography, foundations, every component with copyable HTML/React, three full example pages, per-stack quick starts, downloads, changelog and brand licence. Deployed to GitHub Pages together with the evergreen channel (`.github/workflows/pages.yml`). Tested in real Chromium: axe WCAG 2.2 AA in light and dark on every page, no console errors, no off-origin requests (except the brand manifest), no broken links or images, no horizontal scroll at 375 px.
- **Brand Kit v2.0 PDF** (`brand/kit/HexaData-Brand-Kit-v2.0.pdf`), rendered from the site's print route with an embedded brand fingerprint; `npm run pdf:check` fails CI when the brand changed but the PDF did not. Kit v1.0 stays archived; its typos are fixed in v2.0.
- `.hd-link` now follows the alternate-surface contrast rule (found by the website's axe run).

- **Platforms** (generated from `brand/`, see `platforms/README.md`): Python (`hexadata-brand`: tokens, Matplotlib/Plotly themes), Flutter (Material 3 themes), SwiftUI (root `Package.swift`, dynamic light/dark roles), Android (Compose theme + `values`/`values-night` XML), Office Theme Colors/Fonts, a table-based e-mail template and a print colour sheet (nominal CMYK, **UNPROOFED**, no invented Pantone values). `npm run build:platforms` stages them with the official fonts and logos. Python is imported and tested here; Flutter/Swift/Android are statically tested here and compiled by `.github/workflows/platforms.yml`. `.pptx`/`.docx` templates are planned for 2.1.
- Fixed: font licence hash was line-ending dependent (CI on Linux disagreed with Windows); `.gitattributes` now marks fonts and icons binary.

- **Approvals (2026-11-15):** foundations, component rules and logo rules approved by the HexaData Marketing owner; licence text approved on behalf of Esconet counsel; brand contact set.

### Fixed

- Build blockers in 1.0.0: JSX inside a `.ts` file, missing `tsconfig.json`, missing dev dependencies, `"use client"` stripped by the bundler.
- Brand-rule enforcement: pure black/white refused as tokens (allowed only as documented fallbacks), no stray Tailwind greys.
