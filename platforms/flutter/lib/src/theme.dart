import 'package:flutter/material.dart';

import 'tokens.dart';

ColorScheme _scheme(Brightness brightness, HexaRoles r) => ColorScheme(
      brightness: brightness,
      primary: r.accentFill,
      onPrimary: r.onAccentFill,
      secondary: r.accentFill,
      onSecondary: r.onAccentFill,
      error: r.danger,
      onError: r.onStatus,
      surface: r.bg,
      onSurface: r.fg,
      onSurfaceVariant: r.fgMuted,
      surfaceContainerHighest: r.bgAlt,
      outline: r.borderStrong,
      outlineVariant: r.borderSubtle,
    );

TextTheme _textTheme(HexaRoles r) {
  TextStyle display(double size, FontWeight w) =>
      TextStyle(fontFamily: HexaFonts.display, fontSize: size, fontWeight: w, color: r.fgStrong, height: 1.2);
  TextStyle body(double size, [FontWeight w = FontWeight.w400]) =>
      TextStyle(fontFamily: HexaFonts.body, fontSize: size, fontWeight: w, color: r.fg, height: 1.5);
  return TextTheme(
    displayLarge: display(HexaFontSize.s6xl, FontWeight.w700),
    displayMedium: display(HexaFontSize.s5xl, FontWeight.w700),
    displaySmall: display(HexaFontSize.s4xl, FontWeight.w700),
    headlineLarge: display(HexaFontSize.s3xl, FontWeight.w700),
    headlineMedium: display(HexaFontSize.s2xl, FontWeight.w600),
    headlineSmall: display(HexaFontSize.xl, FontWeight.w600),
    titleLarge: display(HexaFontSize.lg, FontWeight.w600),
    titleMedium: body(HexaFontSize.base, FontWeight.w600),
    titleSmall: body(HexaFontSize.sm, FontWeight.w600),
    bodyLarge: body(HexaFontSize.lg),
    bodyMedium: body(HexaFontSize.base),
    bodySmall: body(HexaFontSize.sm),
    labelLarge: body(HexaFontSize.base, FontWeight.w600),
    labelMedium: body(HexaFontSize.sm, FontWeight.w500),
    labelSmall: body(HexaFontSize.xs, FontWeight.w500),
  );
}

ThemeData _theme(Brightness brightness, HexaRoles r) {
  final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(HexaRadius.md));
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: _scheme(brightness, r),
    scaffoldBackgroundColor: r.bg,
    textTheme: _textTheme(r),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: r.accentFill,
        foregroundColor: r.onAccentFill,
        minimumSize: const Size(44, 44),
        shape: shape,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: r.fg,
        side: BorderSide(color: r.borderStrong, width: 2),
        minimumSize: const Size(44, 44),
        shape: shape,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(HexaRadius.md),
        borderSide: BorderSide(color: r.borderStrong, width: 2),
      ),
    ),
    cardTheme: CardThemeData(
      color: r.bg,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(HexaRadius.lg),
        side: BorderSide(color: r.borderSubtle),
      ),
    ),
    dividerColor: r.borderSubtle,
  );
}

/// Material 3 theme for light mode.
ThemeData hexaLightTheme() => _theme(Brightness.light, hexaLightRoles);

/// Material 3 theme for dark mode.
ThemeData hexaDarkTheme() => _theme(Brightness.dark, hexaDarkRoles);
