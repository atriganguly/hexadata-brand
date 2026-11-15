# Security policy

## Reporting a vulnerability

Email **<SECURITY-CONTACT: set before publishing>** with details and reproduction steps. Please do not open public issues for vulnerabilities.
Target response: acknowledgement within 3 business days; fix or mitigation plan within 14 days for high severity. Coordinated disclosure; credit given if you wish.
Publish a `/.well-known/security.txt` (RFC 9116) for the domain that hosts the manifest.

## Supported versions

Latest major only (currently 2.x).

## Threat model (what this package defends)

| Threat                                                     | Control                                                                                          | Evidence                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Compromised/malicious CDN rebrands apps or injects content | Ed25519-signed manifest, pinned public keys, `kid` rotation                                      | `test/remote.test.ts`, `test/e2e/run.mjs`    |
| Replay of an old signed manifest                           | `revision` ≥ baseline; optional `expiresAt`                                                      | `test/schema.test.ts`, `test/remote.test.ts` |
| Malicious values (CSS injection, spoofed text)             | Strict `#RRGGBB` only; taglines bounded + control/bidi/zero-width stripped; React text rendering | `test/schema.test.ts`                        |
| Inaccessible/off-brand update                              | Contrast guard rejects the whole manifest                                                        | `test/schema.test.ts`                        |
| DoS via large/slow/huge-key manifest                       | 16 KB streaming cap, 5 s timeout, ≤64 keys                                                       | `test/remote.test.ts`                        |
| Downgrade to http / redirect to http / URL credentials     | https-only, post-redirect check                                                                  | `test/remote.test.ts`                        |
| XSS via inline code                                        | No inline script/style, no `dangerouslySetInnerHTML`/`eval`; CSSOM-only writes                   | CSP e2e, ESLint, `verify-package`            |
| Supply-chain (install-time code)                           | No lifecycle scripts; 1 runtime dep; lockfile; `npm ci --ignore-scripts`                         | `verify-package`, CI                         |

**Out of scope:** compromise of the app itself, of your signing-key custody, or of the registry account.

## Key management and incident response

- Keep the private key in a KMS/HSM; CI signs via short-lived, access-controlled credentials; never commit `*.jwk`/`*.pem` (git-ignored).
- **Rotation:** add the new key to `brand/keys.json` (second slot) and release the package, wait for apps to adopt it, then sign with the new key and later drop the old one. `build:channel` refuses to sign with a key that is not listed.
- **Suspected key compromise:** stop signing; publish a new key; ship app updates trusting only the new `kid`; bump the baseline `revision` in a package release so previously issued manifests become rollbacks; rotate hosting credentials. Because keys are pinned in app builds, revocation is **only as fast as your app release cycle**. Keep `expiresAt` short (e.g. 30 days) on issued manifests to bound exposure.
- **npm account:** enforce 2FA, use granular/automation tokens scoped to this package, require approval on the `release` environment.
