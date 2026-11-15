# @hexadata/brand

HexaData brand tokens (colour, typography, taglines) for **web, React, React Native and Tailwind**, generated from a
single source of truth: [`brand/`](brand/), transcribed from _HexaData Brand Kit v1.0_.

**Design goals:** brand-exact · WCAG-enforced · no third-party requests · no browser storage · no personal data · tamper-evident updates.

> Status: v2.0.0 (release candidate; npm and PyPI publishing arrives with trusted publishing in v2.2). See [Verification status](#verification-status) for exactly what has and has not been run.

## Licence: open software, protected brand

- **The software** (generators, CSS, React, React Native, web components, tests) is **Apache-2.0**. Anyone may use it, including to build a design system for **their own** brand: see [docs/USE-FOR-YOUR-OWN-BRAND.md](docs/USE-FOR-YOUR-OWN-BRAND.md).
- **The HexaData brand assets** (name, logos, taglines, Brand Kit, the HexaData brand pack) are **trademarks and proprietary material of Esconet Technologies Limited**, not open source. Allowed and forbidden uses are in [BRAND-LICENSE.md](BRAND-LICENSE.md).
- **The fonts** (Space Grotesk, Inter Tight, JetBrains Mono) are under the SIL Open Font License 1.1.

## Install

```bash
npm install @hexadata/brand
```

Peer dependencies are optional: `react` (for `/react`, `/native`), `react-native` (for `/native`), `tailwindcss` (for `/tailwind`).

## Use

### CSS (any framework): fonts + variables

```css
@import '@hexadata/brand/fonts.css'; /* self-hosted WOFF2, served from YOUR origin */
@import '@hexadata/brand/fonts-fallback.css'; /* metric-matched fallbacks: near-zero layout shift */
@import '@hexadata/brand/css'; /* --hd-* palette, semantic roles, light/dark */
```

Semantic roles (`--hd-bg`, `--hd-fg`, `--hd-bg-alt`, `--hd-fg-muted`, `--hd-accent`, `--hd-border-strong`, …) follow `prefers-color-scheme`
and can be forced with `<html data-theme="light|dark">`. **Style with roles, not raw palette**: the roles are the contrast-checked pairings.

### Ready-made styles and components (any framework)

```css
@import '@hexadata/brand/fonts.css';
@import '@hexadata/brand/all.css'; /* tokens + base + components in cascade layers hd-base / hd-components / hd-utilities */
```

```html
<button class="hd-btn">Get started</button>
<div class="hd-alert hd-alert--success" role="status">Saved.</div>
```

Use `base.css` / `components.css` separately if you prefer. Spacing, radius, elevation, motion and the type scale were approved by the brand owner on 2026-11-15 ([docs/FOUNDATIONS-PROPOSAL.md](docs/FOUNDATIONS-PROPOSAL.md)).

### Logo

```tsx
import { HexaLogo } from '@hexadata/brand/react';
<HexaLogo />                          {/* horizontal, follows light/dark automatically */}
<HexaLogo form="icon" size="lg" />    {/* also: form="centered", tone="mono", on="dark" */}
```

```html
<script src="https://atriganguly.github.io/hexadata-brand/v2/js/hexadata.js"></script>
<hexa-logo form="horizontal"></hexa-logo>
```

By default the images come from the **evergreen hosted channel** (`/v2/logo/`), so a logo change reaches every app without a release. To serve them from your own origin (strict `img-src` CSP, offline), copy `node_modules/@hexadata/brand/dist/logo` into your public folder and pass `base="/brand/logo"`. Files are also importable as `@hexadata/brand/logo/<name>.png`. The Brand Kit only supplies **raster** logos (500 px wordmarks, 4096 px icons) and mono artwork for dark surfaces; mono on a light surface falls back to full colour.

### React / Next.js (App Router safe)

```tsx
import { HexaProvider, HexaTagline } from '@hexadata/brand/react';

export default function Layout({ children }) {
  return <HexaProvider>{children}</HexaProvider>; // no network, baked-in brand
}
<HexaTagline variant="secondary" className="text-hd-fg" />;
```

The `react` entry ships with `"use client"` as its first statement (verified in CI).

### Tailwind

**v4** (`app.css`):

```css
@import 'tailwindcss';
@import '@hexadata/brand/css';
@import '@hexadata/brand/tailwind/theme.css'; /* strict: only brand colours exist; bg-hd-cyan/50 works */
```

**v3** (`tailwind.config.js`):

```js
module.exports = { presets: [require('@hexadata/brand/tailwind')] }; // strict (replaces the palette)
// or: presets: [require('@hexadata/brand/tailwind').createPreset({ extend: true })] // keeps Tailwind defaults
```

Utilities: `bg-hd-bg text-hd-fg border-hd-border-strong bg-hd-cyan/50 font-display font-body font-mono`.

### React Native

```tsx
import { HexaNativeProvider, useHexaNativeTheme } from '@hexadata/brand/native';
const theme = useHexaNativeTheme(useColorScheme() === 'dark' ? 'dark' : 'light');
// theme.colors.bg, theme.colors.fg, theme.fonts.display.bold, theme.taglines.primary
```

**Fonts:** the official static TTFs ship in the package at `@hexadata/brand/fonts/ttf/*.ttf` (`SpaceGrotesk-Regular|Medium|SemiBold|Bold`, `InterTight-…`, `JetBrainsMono-…`), already named per `NATIVE_FONTS` (checked by a test against each file's PostScript name). Copy them into your app's font folder (Expo: `expo-font`; bare RN: `react-native.config.js` assets). React Native does not handle variable fonts well, so static files are used. Nothing is downloaded at runtime.

## Live brand updates (on by default, silent on failure)

Change the logo, a colour or a tagline in this repository and every app updates **without a release or any developer action**. Two mechanisms, both automatic:

1. **Build-time:** the package is semver. Apps on `^2` get brand updates (new artwork, colours, taglines) as minor/patch releases; a bot (Renovate/Dependabot, config shipped here) opens and auto-merges them. Names never change inside a major version, so nothing breaks.
2. **Runtime, no redeploy:** `HexaProvider` and the `<hexa-*>` elements render the baked-in brand first, then fetch a **signed manifest** from the evergreen hosted channel (`<origin>/v2/manifest.json`) and apply it. Logo URLs carry a content hash, so a new logo shows up immediately despite caches.

```tsx
<HexaProvider>…</HexaProvider>                 {/* live: on */}
<HexaProvider live={false}>…</HexaProvider>    {/* zero network requests: strict CSP / offline / air-gapped */}
```

```html
<script src="https://atriganguly.github.io/hexadata-brand/v2/js/hexadata.js"></script>
<!-- live: on -->
<script src="https://atriganguly.github.io/hexadata-brand/v2/js/hexadata.js" data-hd-live="off"></script>
<!-- live: off -->
```

**What protects you:** Ed25519 signature checked against keys embedded in the package (`brand/keys.json`; unsigned/tampered → rejected) · https only · no cookies/credentials/referrer/custom headers · 16 KB cap · 5 s timeout · anti-rollback (`revision`) · expiry · **contrast guard** (an update that would break any allowed colour pairing is rejected) · nothing written to storage · **any failure keeps the baked-in brand**. With no keys embedded (the state until the brand owner provisions a signing key) no request is made at all.

Your own manifest instead of the brand channel: `<HexaProvider remote={{ url, keys }}>` (always wins over `live`). React Native has no WebCrypto Ed25519: live updates are off there unless you pass `remote` with a `verify` function.

### The hosted channel

Built by `npm run build:channel` and deployed to GitHub Pages (later your own domain; only `brand/content.json` `origin` changes):

| Path                                                                                      | What                                                                                          |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/v2/`                                                                                    | **Evergreen**: redeployed on every release; point apps here to update with no release         |
| `/<version>/`                                                                             | **Immutable** copy; pin it and use the SRI hashes in `integrity.json` for reproducible builds |
| `css/{all,hexadata,base,components,fonts}.css`, `js/hexadata.js`, `logo/*`, `fonts/ttf/*` | Assets (`css/fonts/*.woff2` are referenced by `css/fonts.css`)                                |
| `tokens.json`, `manifest.json`, `integrity.json`, `version.json`                          | Resolved tokens for tooling, the signed manifest, SRI hashes, build info                      |

### Content-Security-Policy

Nothing here needs `unsafe-inline`, `unsafe-eval` or inline scripts. Self-hosted everything:

```
default-src 'self'; font-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'
```

To use the evergreen channel add its origin: `connect-src https://atriganguly.github.io; img-src 'self' https://atriganguly.github.io` (and `script-src` / `style-src` / `font-src` if you load the files from it).

### Operating keys and manifests

```bash
npm run build
npm run manifest -- keygen 2026-11 ./brand-signing.jwk     # prints {kid, publicKey}; add the public key to brand/keys.json, release
HEXA_SIGNING_JWK="$(cat brand-signing.jwk)" npm run build:channel -- --require-signed   # sign + assemble the channel
npm run manifest -- verify channel-out/v2/manifest.json 2026-11 <public-key>
```

Use a KMS/HSM or a protected CI secret for the production key; never commit it. Rotation and compromise response: [SECURITY.md](SECURITY.md).

## Website, Brand Kit PDF and local preview

```bash
npm run build && npm run build:fonts && npm run build:logos
npm run build:channel                 # the hosted /v2/ + /<version>/ files (signed when HEXA_SIGNING_JWK is set)
npm run build:pdf                     # brand/kit/HexaData-Brand-Kit-v2.0.pdf, rendered from the site (commit it)
npm run build:site -- --base /        # site-out/ for local preview
npm run preview                       # http://127.0.0.1:4173/
npm run test:site                     # axe (light+dark), links, console, phone width
```

The site deploys to GitHub Pages on every push to `main` (Settings > Pages > Source: GitHub Actions). `npm run pdf:check` (CI) fails if the brand changed but the committed PDF did not.

## Develop

```bash
npm install            # FIRST TIME ONLY: creates package-lock.json. Commit it (CI requires it)
npm run generate       # brand/ -> TS, CSS, Tailwind v3/v4, docs/contrast-matrix.md
npm test               # unit tests (node:test via tsx)
npm run build && npm run build:fonts
npm run test:dist && npm run test:e2e   # built output + real Chromium (strict CSP, no 3rd-party, no storage)
npm run verify:release # exports, banned APIs/URLs, tarball whitelist, consumer types, publint, attw
```

**Changing the brand = edit `brand/` + the golden values in `test/tokens.test.ts`, run `npm run generate`.** CI fails if any
allowed pairing drops below its WCAG minimum or if generated files drift.

## Documents

[ACCESSIBILITY.md](ACCESSIBILITY.md) · [PRIVACY.md](PRIVACY.md) · [SECURITY.md](SECURITY.md) · [docs/COMPLIANCE.md](docs/COMPLIANCE.md) ·
[docs/contrast-matrix.md](docs/contrast-matrix.md) · [docs/AMENDMENT-REQUEST.md](docs/AMENDMENT-REQUEST.md) · [CHANGELOG.md](CHANGELOG.md)

## Verification status

| Check                                                                                                                      | Status                                                                              |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 68 unit tests (tokens vs Brand Kit, contrast, schema fuzz, Ed25519 transport, React SSR, Tailwind v4 compile, fonts maths) | ✅ run, passing (Node 22)                                                           |
| Built-output tests, `.d.cts` correctness, consumer type-check (ESM + CJS, node16) for core + tailwind                      | ✅ run, passing                                                                     |
| Real Chromium: strict CSP, zero third-party requests, no storage, signed update applied, tamper rejected                   | ✅ run, 5/5                                                                         |
| Whole-repo `tsc --strict` (TypeScript 6.0.3)                                                                               | ✅ run, clean                                                                       |
| `npm ci`, ESLint, Prettier, publint, attw, `npm audit`, CI workflows                                                       | ⚠️ **not run** (offline authoring); first CI run is the check                       |
| Self-hosted font build (`build:fonts`) and fallback metrics                                                                | ⚠️ **not run** (needs `@fontsource-variable/*`, `@capsizecss/*`); logic unit-tested |
| `react`/`native` consumer typings with real `@types/react`                                                                 | ⚠️ checked with stubs only                                                          |
| Tailwind **v3** preset in a real v3 build; React Native on a device                                                        | ⚠️ structural tests only                                                            |
