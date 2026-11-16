// GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).
import 'dart:ui' show Color;

const String hexaBrandVersion = "2.1.1";
const int hexaBrandRevision = 2;
const String hexaDescriptor = "servers and workstations";
const String hexaPrimaryTagline = "Supercomputing, On-demand.";
const String hexaSecondaryTagline = "Engineered in India. Built for the World.";

/// Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white.
abstract final class HexaPalette {
  static const Color cyan = Color(0xFF009BB6);
  static const Color deepBlue = Color(0xFF046AA7);
  static const Color obsidian = Color(0xFF121E36);
  static const Color vividCerulean = Color(0xFF01A3E5);
  static const Color midnight = Color(0xFF040F49);
  static const Color grey = Color(0xFFA3B1C6);
  static const Color white = Color(0xFFF8FAFC);
  static const Color crimson = Color(0xFFFF3B30);
  static const Color copper = Color(0xFFF59E0B);
  static const Color green = Color(0xFF10B981);
}

/// Semantic roles per theme: the contrast-checked pairings. Style with roles, not raw palette.
class HexaRoles {
  const HexaRoles({
    required this.bg,
    required this.fg,
    required this.fgStrong,
    required this.fgMuted,
    required this.bgAlt,
    required this.fgOnAlt,
    required this.accent,
    required this.borderStrong,
    required this.borderSubtle,
    required this.accentFill,
    required this.onAccentFill,
    required this.accentFillHover,
    required this.indicator,
    required this.danger,
    required this.warning,
    required this.success,
    required this.onStatus,
  });
  final Color bg;
  final Color fg;
  final Color fgStrong;
  final Color fgMuted;
  final Color bgAlt;
  final Color fgOnAlt;
  final Color accent;
  final Color borderStrong;
  final Color borderSubtle;
  final Color accentFill;
  final Color onAccentFill;
  final Color accentFillHover;
  final Color indicator;
  final Color danger;
  final Color warning;
  final Color success;
  final Color onStatus;
}

const HexaRoles hexaLightRoles = HexaRoles(
  bg: HexaPalette.white,
  fg: HexaPalette.obsidian,
  fgStrong: HexaPalette.midnight,
  fgMuted: HexaPalette.obsidian,
  bgAlt: HexaPalette.white,
  fgOnAlt: HexaPalette.obsidian,
  accent: HexaPalette.deepBlue,
  borderStrong: HexaPalette.obsidian,
  borderSubtle: HexaPalette.grey,
  accentFill: HexaPalette.deepBlue,
  onAccentFill: HexaPalette.white,
  accentFillHover: HexaPalette.midnight,
  indicator: HexaPalette.cyan,
  danger: HexaPalette.crimson,
  warning: HexaPalette.copper,
  success: HexaPalette.green,
  onStatus: HexaPalette.obsidian,
);
const HexaRoles hexaDarkRoles = HexaRoles(
  bg: HexaPalette.obsidian,
  fg: HexaPalette.white,
  fgStrong: HexaPalette.white,
  fgMuted: HexaPalette.grey,
  bgAlt: HexaPalette.midnight,
  fgOnAlt: HexaPalette.white,
  accent: HexaPalette.vividCerulean,
  borderStrong: HexaPalette.grey,
  borderSubtle: HexaPalette.grey,
  accentFill: HexaPalette.vividCerulean,
  onAccentFill: HexaPalette.obsidian,
  accentFillHover: HexaPalette.cyan,
  indicator: HexaPalette.vividCerulean,
  danger: HexaPalette.crimson,
  warning: HexaPalette.copper,
  success: HexaPalette.green,
  onStatus: HexaPalette.obsidian,
);

abstract final class HexaSpace {
  static const double s0 = 0;
  static const double s1 = 4;
  static const double s2 = 8;
  static const double s3 = 12;
  static const double s4 = 16;
  static const double s5 = 20;
  static const double s6 = 24;
  static const double s8 = 32;
  static const double s10 = 40;
  static const double s12 = 48;
  static const double s16 = 64;
  static const double s20 = 80;
  static const double s24 = 96;
  static const double s0_5 = 2;
}
abstract final class HexaRadius {
  static const double none = 0;
  static const double sm = 2;
  static const double md = 4;
  static const double lg = 8;
  static const double xl = 12;
  static const double full = 9999;
}
abstract final class HexaFontSize {
  static const double xs = 12;
  static const double sm = 14;
  static const double base = 16;
  static const double lg = 18;
  static const double xl = 20;
  static const double s2xl = 24;
  static const double s3xl = 30;
  static const double s4xl = 36;
  static const double s5xl = 48;
  static const double s6xl = 60;
}
abstract final class HexaFonts {
  static const String display = "Space Grotesk";
  static const String body = "Inter Tight";
  static const String mono = "JetBrains Mono";
}
