# Privacy & data-flow statement

**Engineering statement, not legal advice.** Have your DPO/counsel review before relying on it externally.

## Summary

`@hexadata/brand` is a presentation library. It **collects, stores and transmits no personal data** and contains no analytics, telemetry, tracking, cookies or fingerprinting.

## Data flows

| Surface                     | Default                                                                                                                                                      | When enabled                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Network requests at runtime | **One `GET` of the brand's signed manifest** from the brand origin, only when trusted keys are embedded; **none** with `live={false}` / `data-hd-live="off"` | With `remote`: one `GET` to the URL the app chose |
| Fonts                       | Self-hosted, served from the app's own origin; **no Google Fonts**                                                                                           | n/a                                               |
| Browser/device storage      | **None** (no localStorage, sessionStorage, IndexedDB, cookies, Cache API, AsyncStorage)                                                                      | **None**                                          |
| Install time                | No lifecycle scripts (`preinstall`/`install`/`postinstall`); **zero runtime dependencies**                                                                   | n/a                                               |
| Build/CI                    | No telemetry                                                                                                                                                 | n/a                                               |

Each row is enforced by tests/CI (`test/e2e/run.mjs`, `scripts/verify-package.mjs`, ESLint `no-restricted-*`, `test/react.test.tsx`).

## Live updates (default) and `remote`

Live updates are on by default, so unless an app sets `live={false}` its visitors' browsers send one request to the brand origin (GitHub Pages today). The request exposes the **visitor's IP address, User-Agent and TLS parameters to whoever serves the manifest URL**; IP addresses are personal data under GDPR/UK GDPR and are likely "personal data" under India's DPDP Act. The request carries **no cookies, no credentials, no Referer and no custom headers** (tested).

To keep exposure to zero third parties:

1. **Host the manifest on your own domain** (same legal entity as the app). Avoid third-party CDNs unless covered by a DPA and a valid transfer mechanism.
2. Disable or minimise access logs for the manifest path, or pseudonymise IPs and set a short retention.
3. Cache aggressively (`Cache-Control: public, max-age=300, stale-while-revalidate=86400`) so visitors rarely hit the origin.
4. For EU/UK/India audiences where exposure to the brand origin is not acceptable, set `live={false}` (or `data-hd-live="off"`) and self-host the logo files (`base` prop): brand updates then arrive with each package release, with zero runtime requests. The same applies to logo images, which are fetched from the brand origin unless `base` points elsewhere.

Legal basis, notice and records of processing for this request are the **app operator's** responsibility (see `docs/COMPLIANCE.md`).

## Manifest content

Only brand tokens (colours, two taglines, the descriptor, logo content hashes). Taglines are length-limited, stripped of control/zero-width/bidi characters, and rendered by React as text (never as HTML).
