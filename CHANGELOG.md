# Changelog

## Unreleased

Chore: CI and build-tooling dependency updates. No change to any brand value, colour, shape or component style.

- GitHub Actions: `actions/setup-java` 6.3.0, `gradle/actions/setup-gradle` (pinned SHA), `actions/dependency-review-action` 5.0.1, `ossf/scorecard-action` 2.6.0.
- Dev tooling: `eslint` 10.15, `typescript-eslint` 8.73, `@capsizecss/metrics` 4.5.
- Security: `glob` pinned to 14 for the build-time token tooling, so `minimatch` resolves to a patched 11.x (fixes Dependabot alert #3, GHSA-g3hv-75wg-m249, which affects `minimatch` 7.0.0 up to 11.0.1).

## 2.1.1 (2026-11-16)

Chore release: no change to any brand value, colour, shape or component style. Corrects wording that still described the 2.0 look.

- Website and Brand Kit v2.1 PDF: the Grey swatch note now describes grey as the hairline and border colour. The PDF is regenerated.
- Claude Design System: token notes, README text and version line follow Brand Kit v2.1 (new roles, precision radii, accent hover states); it now states the Brand Kit version and brand revision.
- Release workflow attaches only the current Brand Kit PDF; older kits stay archived in the repository.

## 2.1.0 (2026-11-16)

Visual update: Brand Kit v2.1. Brand revision 2. No public name was removed or renamed.

### Changed (visual)

- **Grey is for lines, not surfaces.** The light-mode secondary surface (`bgAlt`) is now White instead of Grey; Grey stays the hairline and border colour in both themes. Dark mode keeps Midnight and gains grey hairlines on alternate bands.
- **Hover and current states use the accent colours** instead of Grey (light) or Midnight (dark): nav, tabs, secondary and ghost buttons turn to `accent` text; primary buttons move to the new `accentFillHover` role (Midnight in light, Cyan in dark); the current page, selected tab and interactive card edge use the new `indicator` role (Cyan in light, Vivid Cerulean in dark). All pairs are in the contrast gate.
- **"Precision" shape scale.** Radius is now sm 2 px, md 4 px, lg 8 px, xl 12 px (was 4, 8, 12, 16): tags 2, controls 4, containers 8; circles only where the geometry needs them (avatar, switch, spinner). Badges are square-cornered mono tags, borders are 1 px hairlines, and resting cards are flat.
- The theme toggle on the website is an icon-only button (moon in light mode, sun in dark mode), and the chosen theme now stays across pages of the website for the browser tab (one `sessionStorage` key, written only after the toggle is pressed; the package itself still stores nothing).

### Added

- Roles `accentFillHover` and `indicator` (`--hd-accent-fill-hover`, `--hd-indicator`, Tailwind `accent-fill-hover`, `indicator`); class `.hd-btn--icon`; `<hexa-theme-toggle appearance="icon">` and `<ThemeToggle appearance="icon" />`. The toggle now keeps its state in sync with the page.
- `npm run version:check` and the versioning rule **MAJOR.VISUAL.CHORE**: the second number counts visual updates (resets the third), the third counts technical chores. Public surfaces show only MAJOR.VISUAL.

### Website and Brand Kit

- Only the current Brand Kit is published for download; Brand Kit v2.1 replaces v2.0 (earlier kits stay archived in the repository).
- Public pages and the Brand Kit PDF no longer carry internal provenance wording; the brand licence page shows the corporate policy only (repository terms follow the `public-end` marker in `BRAND-LICENSE.md`).
- Indian English (en-IN) throughout: `lang="en-IN"`, spelling, PDF language; enforced by the website test.
- The Brand Kit PDF fingerprint is now `kit:`, `revision:`, `tokens:` and also covers the component styles.

## 2.0.1 (2026-11-16)

Patch release: no change to the shipped package or any brand value. Updates CI and release automation and dev tooling (see below).

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
