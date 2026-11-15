# HexaDataBrand (Swift / SwiftUI)

Add the package by URL (`https://github.com/atriganguly/hexadata-brand`, product `HexaDataBrand`), then:

```swift
import HexaDataBrand

Text("Supercomputing, On-demand.")
    .font(HexaFonts.display(HexaFontSize.s4xl))
    .foregroundStyle(HexaRole.fgStrong)      // follows light/dark automatically
    .padding(HexaSpace.s4)
```

Use roles (`HexaRole`), not raw `HexaPalette` colours. Call `HexaFonts.register()` once at launch (release builds bundle the fonts).
Generated from `brand/`; do not edit `Tokens.swift` or the root `Package.swift`. Compiled in CI (`platforms.yml`, macOS runner).

The HexaData name, logos and taglines are trademarks of Esconet Technologies Limited (BRAND-LICENSE.md). Software: Apache-2.0.
