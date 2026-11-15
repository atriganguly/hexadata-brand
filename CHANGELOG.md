# Changelog

## 2.0.0 (unreleased)

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

### Fixed

- Build blockers in 1.0.0: JSX inside a `.ts` file, missing `tsconfig.json`, missing dev dependencies, `"use client"` stripped by the bundler.
- Brand-rule enforcement: pure black/white refused as tokens (allowed only as documented fallbacks), no stray Tailwind greys.
