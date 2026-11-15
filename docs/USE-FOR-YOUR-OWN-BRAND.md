# Use this repository for your own brand

The software here (generators, CSS, React, React Native, web components, tests) is **Apache-2.0** and was built so that one directory, `brand/`, holds a whole identity. You can build the same kind of system for **your** organisation. The HexaData Brand Assets are _not_ part of that grant: see [BRAND-LICENSE.md](../BRAND-LICENSE.md).

## Steps

1. **Fork or copy** the repository. Keep `LICENSE` and the Apache-2.0 notices.
2. **Remove the HexaData Brand Assets**: `brand/logo/`, `brand/kit/`, the HexaData values in `brand/tokens/*`, `brand/contrast.json`, `brand/content.json` (name, descriptor, taglines, origin), and `brand/logo/logo.json`'s artwork references. Delete or replace the HexaData text in `README.md`, `CHANGELOG.md`, `docs/`, `PRIVACY.md`, `SECURITY.md` and `NOTICE`.
3. **Add your brand** in the same shapes:
   - `brand/tokens/color.tokens.json`: your palette (DTCG colour tokens). Keep the semantic roles in `semantic.tokens.json` pointing at your colours.
   - `brand/contrast.json`: the colour pairs you allow and forbid. The build fails if an allowed pair drops below its WCAG ratio.
   - `brand/tokens/typography.tokens.json`, `space`, `radius`, `shadow`, `motion`, `breakpoint`, `z-index`: your type and foundations.
   - `brand/content.json`: your name, taglines, owner and the https origin where you will host the files.
   - `brand/logo/source/*.png` and `logo.json`, then `npm run logo:measure`.
   - `brand/fonts/` if you use different fonts (check their licences), then `npm run font:measure`.
4. **Rename**: package name and scope in `package.json`, the `--hd-*` CSS prefix, the `.hd-*` class names, `hexa-*` element names and the `Hexa*` React exports are all HexaData-specific. Search for `hd-`, `hexa`, `Hexa` and `hexadata` and replace them with your own prefix. (A parameterised prefix is planned for a later release.)
5. **Regenerate and verify**: `UPDATE_GOLDEN=1 UPDATE_CONTRACT=1 npm test` once to record your values, then `npm run generate && npm test && npm run build && npm run verify:release`.
6. **Own the release**: your own npm scope, signing keys, hosting origin and licence statement for your brand assets.

## What the safeguards do for you

- A brand value can only change when `brand/` **and** the golden snapshot change together.
- Renaming or removing a public name fails the contract test unless you bump the major version.
- Contrast is enforced for every allowed colour pairing, in light and dark.
- Generated files carry a "do not edit" header, so a change always starts in `brand/`.
