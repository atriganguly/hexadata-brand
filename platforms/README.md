# Platforms

Everything here is **generated from `brand/`** (run `npm run generate`) except the small hand-written glue next to it. Do not edit generated files.

| Folder     | What                                                                        | Status in this repository                                              |
| ---------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `python/`  | `hexadata-brand` package: tokens, Matplotlib/Plotly themes, assets          | Imported and tested here (`test/platforms.test.ts`)                    |
| `flutter/` | `hexadata_brand`: palette, roles, scales, Material 3 themes                 | Statically checked here; compiled by `.github/workflows/platforms.yml` |
| `swift/`   | SwiftUI package (root `Package.swift`): palette, dynamic roles, fonts       | Statically checked here; compiled on a macOS runner in `platforms.yml` |
| `android/` | Kotlin + Compose theme and XML resources (`values/`, `values-night/`)       | Statically checked here; built in `platforms.yml`                      |
| `office/`  | Theme Colors and Theme Fonts for Word, Excel and PowerPoint                 | Well-formedness tested here. `.pptx`/`.docx` templates are planned     |
| `email/`   | Table-based, inline-styled e-mail template (hex literals, system fallbacks) | Structure tested here                                                  |
| `print/`   | Colour sheet with nominal CMYK, **UNPROOFED**, no Pantone values invented   | Needs a printer proof and owner sign-off before any print run          |

`npm run build:platforms` stages each package with the official fonts and logos in `dist/platforms/` (binaries are not committed twice); release builds
create the wheel/archives from there.

The HexaData name, logos and taglines are trademarks of Esconet Technologies Limited (see `BRAND-LICENSE.md`). Software: Apache-2.0.
