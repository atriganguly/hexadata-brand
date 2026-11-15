# hexadata-brand (Android)

Kotlin + Jetpack Compose theme and plain XML resources (`hd_*` colours and dimens, with `values-night` for dark).

```kotlin
HexaTheme { Text("Supercomputing, On-demand.", color = LocalHexaRoles.current.fgStrong) }
```

XML: `@color/hd_fg`, `@color/hd_accent_fill`, `@dimen/hd_space_4` (follow day/night automatically). Fonts are bundled in `res/font` by the release build.
Generated from `brand/`; do not edit `Tokens.kt` or the `hexadata_*.xml` resources. Compiled in CI (`platforms.yml`).

The HexaData name, logos and taglines are trademarks of Esconet Technologies Limited (BRAND-LICENSE.md). Software: Apache-2.0.
