# @hexadata/brand

HexaData brand tokens (colour, typography, taglines) for **web, React, React Native and Tailwind**, generated from a
single source of truth: [`brand/`](brand/), transcribed from _HexaData Brand Kit v1.0_.

**Design goals:** brand-exact · WCAG-enforced · no third-party requests · no browser storage · no personal data · tamper-evident updates.

> Status: v2.0.0, not yet published. See [Verification status](#verification-status) for exactly what has and has not been run.

## Install

```bash
npm install @hexadata/brand          # private scope: configure your registry/token first
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

**Fonts:** bundle static TTFs named per `NATIVE_FONTS` (`SpaceGrotesk-Regular|Medium|SemiBold|Bold`, `InterTight-…`, `JetBrainsMono-…`),
e.g. from the OFL-licensed `@expo-google-fonts/*` packages. React Native does not handle variable fonts well, so static files are used. Nothing is downloaded at runtime.

## Content-Security-Policy

Nothing here needs `unsafe-inline`, `unsafe-eval`, inline scripts or third-party origins:

```
default-src 'self'; font-src 'self'; style-src 'self'; script-src 'self'
# only if you enable runtime updates:  connect-src https://brand.your-domain.example
```

## Runtime brand updates (optional, off by default)

By default **no request is made**. To let an app pick up brand changes without a redeploy, pass signed-manifest options:

```tsx
<HexaProvider
  remote={{ url: 'https://brand.your-domain.example/manifest.json', keys: [{ kid: '2026-11', publicKey: '<base64url Ed25519>' }] }}
  onIssue={(i) => report(i)}>
```

What protects you: Ed25519 signature (unsigned/tampered → rejected) · https only · no cookies/credentials/referrer/custom headers ·
16 KB size cap · 5 s timeout · anti-rollback (`revision`) · optional `expiresAt` · **contrast guard** (an update that would break any
allowed colour pairing is rejected) · nothing written to storage. Host the manifest on **your own domain** to avoid any third-party exposure
([PRIVACY.md](PRIVACY.md)). Browsers without WebCrypto Ed25519 (and React Native without an injected `verify`) simply keep the baked-in brand.

Operate keys and manifests with the bundled tool (refuses to sign anything invalid):

```bash
npm run build
npm run manifest -- keygen 2026-11 ./brand-signing.jwk            # prints the public key to embed in apps
npm run manifest -- sign manifest.json ./brand-signing.jwk 2026-11 > envelope.json
npm run manifest -- verify envelope.json 2026-11 <public-key>
```

Use a KMS/HSM for production signing keys. Key rotation, compromise response: [SECURITY.md](SECURITY.md).

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
