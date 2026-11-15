# HexaData Brand Assets Licence and Trademark Policy

**Who this is from:** Esconet Technologies Limited, owner of the HexaData brand ("HexaData").
**Status:** v1.0 of this policy, derived from the usage rules in _HexaData Brand Kit v1.0_. Approved on behalf of Esconet Technologies Limited's counsel by the HexaData Marketing owner on 2026-11-15.

This repository is **two things with two licences**:

|                                                                                                                                                | Licence                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **The software**: generators, build scripts, CSS/React/React Native/web-component source, tests, docs, workflows (everything not listed below) | **Apache License 2.0** ([LICENSE](LICENSE)). Use it for anything, including your own brand.                        |
| **The HexaData Brand Assets** (listed below)                                                                                                   | **Not open source.** All rights reserved by Esconet Technologies Limited, except as stated here.                   |
| **The fonts** (Space Grotesk, Inter Tight, JetBrains Mono in `brand/fonts`, `dist/fonts`, `dist/css/fonts`)                                    | Their own **SIL Open Font License 1.1** (see `dist/licenses/`). Free to use, unmodified or modified under the OFL. |

Nothing in the Apache License grants any right to HexaData's trade names, trademarks or service marks (Apache-2.0 section 6).

## The HexaData Brand Assets

| Asset                                                                                                                                                      | Where it lives                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| The names **HexaData** and "HexaData servers and workstations", and the HexaData logo in every form (icon, centered, horizontal; full colour, white, mono) | `brand/logo/**`, `dist/logo/**` (favicons, app icons, social card), `@hexadata/brand/logo/*`                                                    |
| The taglines "Supercomputing, On-demand." and "Engineered in India. Built for the World."                                                                  | `brand/content.json`, generated outputs                                                                                                         |
| The Brand Kit documents                                                                                                                                    | `brand/kit/**`, any generated Brand Kit PDF                                                                                                     |
| The HexaData **brand pack**: the specific colour palette, semantic roles and type selection, as the identity of HexaData                                   | `brand/tokens/**`, `brand/contrast.json`, `brand/content.json`, and the files generated from them in the **official** `@hexadata/brand` package |

## What you may do without asking

You may use the logos and names **unmodified**, for these purposes only, and only in the way the Brand Kit describes (right size, right colour variant for the background, legible, clear space around it):

1. **Co-branding** with HexaData next to your own logo.
2. **Sponsor** acknowledgements where HexaData is actually a sponsor.
3. **"Logo garden"** displays that list HexaData among other companies you genuinely work with.
4. **Educational or research** applications that actually use HexaData technologies and products.
5. **Factual references** to HexaData in plain text (for example "runs on HexaData servers"), without the logo.
6. Any other use that HexaData has **approved in writing**.

Apps, sites and documents **built by or for HexaData / Esconet** use the official package under their internal authority.

## What you may not do without written permission

- Modify, recolour, redraw, stretch, rotate, outline, animate or add effects to a logo (use the mono variant for one-colour needs).
- Use the names, logos or taglines in **your own** company, product, service, app, domain, package (for example the `@hexadata` npm scope, `hexadata-*` PyPI names), repository or social-media account names.
- Suggest that HexaData **endorses, certifies, sponsors, partners with, or is the source of** you or your product, or present a fork as the official HexaData package.
- Ship the HexaData brand pack (palette, type selection, logos, taglines) as **your** brand identity, or build a look-alike of HexaData's identity that could confuse people about who you are.
- Register or use confusingly similar trademarks, domains or handles.

## Using this repository for your own brand

The software is designed to be reused: the whole identity lives in `brand/`, and everything else is generated from it. To build **your own** brand system, fork or copy the repository under Apache-2.0 and follow [docs/USE-FOR-YOUR-OWN-BRAND.md](docs/USE-FOR-YOUR-OWN-BRAND.md): replace the contents of `brand/` with your own, remove the HexaData Brand Assets above, and rename the packages. Do **not** keep HexaData's names, logos, taglines or brand pack in your fork.

## Questions, permission requests, reports of misuse

Send them to the HexaData Marketing owner: **atri.ganguly@esc.co.in** (alternative: **sales@hexadata.in**). Esconet may ask you to stop or correct any use that breaches this policy.
