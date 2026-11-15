# hexadata_brand (Flutter)

HexaData palette, semantic roles, spacing/radius/type scales and Material 3 light/dark themes.

```dart
MaterialApp(theme: hexaLightTheme(), darkTheme: hexaDarkTheme(), themeMode: ThemeMode.system);
final r = hexaLightRoles; // r.fg, r.bg, r.accentFill ... use roles, not raw HexaPalette colours
```

Fonts (Space Grotesk, Inter Tight, JetBrains Mono) and logos are staged into `assets/` by `npm run build:platforms` in the repository and are
bundled in release archives. Generated from `brand/`; do not edit `lib/src/tokens.dart` or `pubspec.yaml`.

Status: generated and statically checked in this repository's tests; compiled in CI by `.github/workflows/platforms.yml`.

Licence: software Apache-2.0; HexaData name, logos and taglines are trademarks of Esconet Technologies Limited (BRAND-LICENSE.md).
