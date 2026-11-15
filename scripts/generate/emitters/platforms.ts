import { camel, noHash, snake, toNumber } from '../lib.ts';
import type { Ctx, Tokens } from '../types.ts';

/**
 * Generated token modules for every non-web platform: Python, Flutter (Dart), SwiftUI, Android (Kotlin + XML),
 * Office theme files, e-mail template and print colour sheet. Hand-written glue lives next to them and imports these.
 */
export function emit(t: Tokens, { write }: Ctx): void {
  const P = t.palette;
  const pal = Object.keys(P);
  const roles = Object.keys(t.semantic.light);
  const F = t.foundations;
  const fs = (k: string): string => (/^[0-9]/.test(k) ? `s${k}` : k);
  const px = (g: Record<string, string>): [string, number][] => Object.entries(g).map(([k, v]) => [k, toNumber(v)]);
  const hashHeader = `GENERATED FILE: DO NOT EDIT. Source: brand/ (run \`npm run generate\`).`;

  // ---------------------------------------------------------------- Python
  const pyDict = (name: string, entries: [string, string | number][], quote = true): string =>
    `${name} = {\n${entries.map(([k, v]) => `    ${JSON.stringify(k)}: ${quote && typeof v === 'string' ? JSON.stringify(v) : v},`).join('\n')}\n}`;
  write(
    'platforms/python/src/hexadata_brand/tokens.py',
    `# ${hashHeader}
"""HexaData brand tokens as plain Python data (no dependencies). Source of truth: brand/ in the repository."""

BRAND_SOURCE = ${JSON.stringify(t.source)}
BRAND_REVISION = ${t.revision}
VERSION = ${JSON.stringify(t.version)}
ORIGIN = ${JSON.stringify(t.origin)}
DESCRIPTOR = ${JSON.stringify(t.descriptor)}

${pyDict(
  'PALETTE',
  pal.map((k) => [snake(k), P[k]!.toUpperCase()]),
)}

SEMANTIC = {
${(['light', 'dark'] as const).map((m) => `    ${JSON.stringify(m)}: {\n${roles.map((r) => `        ${JSON.stringify(snake(r))}: ${JSON.stringify(P[t.semantic[m][r]!]!.toUpperCase())},`).join('\n')}\n    },`).join('\n')}
}

${pyDict('TAGLINES', Object.entries(t.taglines))}

FONTS = {
${Object.entries(t.fonts)
  .map(
    ([k, f]) =>
      `    ${JSON.stringify(k)}: {"family": ${JSON.stringify(f.family)}, "weights": ${JSON.stringify(f.weights)}, "fallbacks": ${JSON.stringify(f.system)}},`,
  )
  .join('\n')}
}

${pyDict(
  'SPACE_PX',
  px(F.space).map(([k, v]) => [k, v]),
  false,
)}

${pyDict(
  'RADIUS_PX',
  px(F.radius).map(([k, v]) => [k, v]),
  false,
)}

${pyDict(
  'FONT_SIZE_PX',
  px(F.fontSize).map(([k, v]) => [k, v]),
  false,
)}

LOGOS = [
${t.logo.map((v) => `    {"id": ${JSON.stringify(v.id)}, "form": ${JSON.stringify(v.form)}, "tone": ${JSON.stringify(v.tone)}, "background": ${JSON.stringify(v.background)}, "width": ${v.width}, "height": ${v.height}, "sha256": ${JSON.stringify(v.sha256)}},`).join('\n')}
]
`,
  );
  write(
    'platforms/python/pyproject.toml',
    `# ${hashHeader}
[build-system]
requires = ["hatchling>=1.24"]
build-backend = "hatchling.build"

[project]
name = "hexadata-brand"
version = ${JSON.stringify(t.version)}
description = "HexaData brand tokens, chart themes and assets for Python (reports, dashboards, e-mail, Streamlit, Plotly, Matplotlib)."
readme = "README.md"
requires-python = ">=3.9"
license = { text = "Apache-2.0 AND LicenseRef-HexaData-Brand" }
dependencies = []
classifiers = ["Programming Language :: Python :: 3", "License :: OSI Approved :: Apache Software License"]

[project.optional-dependencies]
matplotlib = ["matplotlib>=3.7"]
plotly = ["plotly>=5.18"]

[project.urls]
Homepage = ${JSON.stringify(t.origin)}
Source = "https://github.com/atriganguly/hexadata-brand"

[tool.hatch.build.targets.wheel]
packages = ["src/hexadata_brand"]
`,
  );

  // ---------------------------------------------------------------- Flutter / Dart
  const dartColor = (hex: string): string => `Color(0xFF${noHash(hex)})`;
  write(
    'platforms/flutter/lib/src/tokens.dart',
    `// ${hashHeader}
import 'dart:ui' show Color;

const String hexaBrandVersion = ${JSON.stringify(t.version)};
const int hexaBrandRevision = ${t.revision};
const String hexaDescriptor = ${JSON.stringify(t.descriptor)};
const String hexaPrimaryTagline = ${JSON.stringify(t.taglines.primary)};
const String hexaSecondaryTagline = ${JSON.stringify(t.taglines.secondary)};

/// Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white.
abstract final class HexaPalette {
${pal.map((k) => `  static const Color ${camel(k)} = ${dartColor(P[k]!)};`).join('\n')}
}

/// Semantic roles per theme: the contrast-checked pairings. Style with roles, not raw palette.
class HexaRoles {
  const HexaRoles({
${roles.map((r) => `    required this.${camel(r)},`).join('\n')}
  });
${roles.map((r) => `  final Color ${camel(r)};`).join('\n')}
}

const HexaRoles hexaLightRoles = HexaRoles(
${roles.map((r) => `  ${camel(r)}: HexaPalette.${camel(t.semantic.light[r]!)},`).join('\n')}
);
const HexaRoles hexaDarkRoles = HexaRoles(
${roles.map((r) => `  ${camel(r)}: HexaPalette.${camel(t.semantic.dark[r]!)},`).join('\n')}
);

abstract final class HexaSpace {
${px(F.space)
  .map(([k, v]) => `  static const double s${k.replace('-', '_')} = ${v};`)
  .join('\n')}
}
abstract final class HexaRadius {
${px(F.radius)
  .map(([k, v]) => `  static const double ${camel(k)} = ${v};`)
  .join('\n')}
}
abstract final class HexaFontSize {
${px(F.fontSize)
  .map(([k, v]) => `  static const double ${fs(k)} = ${v};`)
  .join('\n')}
}
abstract final class HexaFonts {
${Object.entries(t.fonts)
  .map(([k, f]) => `  static const String ${camel(k)} = ${JSON.stringify(f.family)};`)
  .join('\n')}
}
`,
  );
  write(
    'platforms/flutter/pubspec.yaml',
    `# ${hashHeader}
name: hexadata_brand
description: HexaData brand colours, typography and Material 3 themes for Flutter.
version: ${t.version}
homepage: ${t.origin}
repository: https://github.com/atriganguly/hexadata-brand
publish_to: none # flip once the pub.dev publisher is set up

environment:
  sdk: ">=3.3.0 <4.0.0"
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  # Font and logo files are staged into assets/ by \`npm run build:platforms\` (they are not committed twice).
  fonts:
${Object.values(t.fonts)
  .map(
    (f) =>
      `    - family: ${f.family}\n      fonts:\n${f.weights.map((w) => `        - asset: assets/fonts/${f.family.replace(/ /g, '')}-${{ 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' }[w]}.ttf\n          weight: ${w}`).join('\n')}`,
  )
  .join('\n')}
`,
  );

  // ---------------------------------------------------------------- Swift
  const swiftColor = (hex: string): string => `HexaColor(hex: 0x${noHash(hex)})`;
  write(
    'platforms/swift/Sources/HexaDataBrand/Tokens.swift',
    `// ${hashHeader}
import SwiftUI

public enum HexaBrand {
    public static let version = ${JSON.stringify(t.version)}
    public static let revision = ${t.revision}
    public static let descriptor = ${JSON.stringify(t.descriptor)}
    public static let primaryTagline = ${JSON.stringify(t.taglines.primary)}
    public static let secondaryTagline = ${JSON.stringify(t.taglines.secondary)}
}

/// Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white.
public enum HexaPalette {
${pal.map((k) => `    public static let ${camel(k)} = ${swiftColor(P[k]!)}`).join('\n')}
}

/// Semantic roles: dynamic colours that follow light/dark automatically. Style with roles, not raw palette.
public enum HexaRole {
${roles.map((r) => `    public static let ${camel(r)} = Color.hexaDynamic(light: HexaPalette.${camel(t.semantic.light[r]!)}, dark: HexaPalette.${camel(t.semantic.dark[r]!)})`).join('\n')}
}

public enum HexaSpace {
${px(F.space)
  .map(([k, v]) => `    public static let s${k.replace('-', '_')}: CGFloat = ${v}`)
  .join('\n')}
}
public enum HexaRadius {
${px(F.radius)
  .map(([k, v]) => `    public static let ${camel(k)}: CGFloat = ${v}`)
  .join('\n')}
}
public enum HexaFontSize {
${px(F.fontSize)
  .map(([k, v]) => `    public static let ${fs(k)}: CGFloat = ${v}`)
  .join('\n')}
}
public enum HexaFontName {
${Object.entries(t.fonts)
  .map(([k, f]) => `    public static let ${camel(k)} = ${JSON.stringify(f.family.replace(/ /g, ''))}`)
  .join('\n')}
}
`,
  );
  write(
    'Package.swift',
    `// swift-tools-version:5.9
// ${hashHeader}
import PackageDescription

let package = Package(
    name: "HexaDataBrand",
    platforms: [.iOS(.v15), .macOS(.v12), .tvOS(.v15), .watchOS(.v8)],
    products: [.library(name: "HexaDataBrand", targets: ["HexaDataBrand"])],
    targets: [
        .target(
            name: "HexaDataBrand",
            path: "platforms/swift/Sources/HexaDataBrand",
            resources: [.process("Resources")]
        ),
        .testTarget(name: "HexaDataBrandTests", dependencies: ["HexaDataBrand"], path: "platforms/swift/Tests/HexaDataBrandTests"),
    ]
)
`,
  );

  // ---------------------------------------------------------------- Android (Kotlin + XML)
  const ktColor = (hex: string): string => `Color(0xFF${noHash(hex)})`;
  write(
    'platforms/android/hexadata-brand/src/main/kotlin/com/hexadata/brand/Tokens.kt',
    `// ${hashHeader}
package com.hexadata.brand

import androidx.compose.ui.graphics.Color

object HexaBrand {
    const val VERSION = ${JSON.stringify(t.version)}
    const val REVISION = ${t.revision}
    const val DESCRIPTOR = ${JSON.stringify(t.descriptor)}
    const val PRIMARY_TAGLINE = ${JSON.stringify(t.taglines.primary)}
    const val SECONDARY_TAGLINE = ${JSON.stringify(t.taglines.secondary)}
}

/** Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white. */
object HexaPalette {
${pal.map((k) => `    val ${camel(k)} = ${ktColor(P[k]!)}`).join('\n')}
}

data class HexaRoles(
${roles.map((r) => `    val ${camel(r)}: Color,`).join('\n')}
)

val HexaLightRoles = HexaRoles(
${roles.map((r) => `    ${camel(r)} = HexaPalette.${camel(t.semantic.light[r]!)},`).join('\n')}
)
val HexaDarkRoles = HexaRoles(
${roles.map((r) => `    ${camel(r)} = HexaPalette.${camel(t.semantic.dark[r]!)},`).join('\n')}
)

/** dp values. */
object HexaSpace {
${px(F.space)
  .map(([k, v]) => `    const val s${k.replace('-', '_')} = ${v}f`)
  .join('\n')}
}
object HexaRadius {
${px(F.radius)
  .map(([k, v]) => `    const val ${camel(k)} = ${v}f`)
  .join('\n')}
}
/** sp values. */
object HexaFontSize {
${px(F.fontSize)
  .map(([k, v]) => `    const val ${fs(k)} = ${v}f`)
  .join('\n')}
}
`,
  );
  const xmlColors = (rolesMode: 'light' | 'dark' | null): string =>
    `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${hashHeader} -->\n<resources>\n${
      rolesMode === null
        ? pal.map((k) => `    <color name="hd_${snake(k)}">#${noHash(P[k]!)}</color>`).join('\n') +
          '\n' +
          roles.map((r) => `    <color name="hd_${snake(r)}">#${noHash(P[t.semantic.light[r]!]!)}</color>`).join('\n')
        : roles.map((r) => `    <color name="hd_${snake(r)}">#${noHash(P[t.semantic[rolesMode][r]!]!)}</color>`).join('\n')
    }\n</resources>\n`;
  write('platforms/android/hexadata-brand/src/main/res/values/hexadata_colors.xml', xmlColors(null));
  write('platforms/android/hexadata-brand/src/main/res/values-night/hexadata_colors.xml', xmlColors('dark'));
  write(
    'platforms/android/hexadata-brand/src/main/res/values/hexadata_dimens.xml',
    `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${hashHeader} -->\n<resources>\n${px(F.space)
      .map(([k, v]) => `    <dimen name="hd_space_${snake(k)}">${v}dp</dimen>`)
      .join('\n')}\n${px(F.radius)
      .map(([k, v]) => `    <dimen name="hd_radius_${snake(k)}">${v}dp</dimen>`)
      .join('\n')}\n${px(F.fontSize)
      .map(([k, v]) => `    <dimen name="hd_font_size_${snake(k)}">${v}sp</dimen>`)
      .join('\n')}\n</resources>\n`,
  );

  // ---------------------------------------------------------------- Office theme files (Word, Excel, PowerPoint)
  const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
  const clr = (key: string): string => `<a:srgbClr val="${noHash(P[key]!)}"/>`;
  write(
    'platforms/office/HexaData.theme-colors.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!-- ${hashHeader} Install: copy to %AppData%\\Microsoft\\Templates\\Document Themes\\Theme Colors\\ -->
<a:clrScheme ${A} name="HexaData">
  <a:dk1>${clr('obsidian')}</a:dk1>
  <a:lt1>${clr('white')}</a:lt1>
  <a:dk2>${clr('midnight')}</a:dk2>
  <a:lt2>${clr('grey')}</a:lt2>
  <a:accent1>${clr('deepBlue')}</a:accent1>
  <a:accent2>${clr('cyan')}</a:accent2>
  <a:accent3>${clr('vividCerulean')}</a:accent3>
  <a:accent4>${clr('green')}</a:accent4>
  <a:accent5>${clr('copper')}</a:accent5>
  <a:accent6>${clr('crimson')}</a:accent6>
  <a:hlink>${clr('deepBlue')}</a:hlink>
  <a:folHlink>${clr('midnight')}</a:folHlink>
</a:clrScheme>
`,
  );
  write(
    'platforms/office/HexaData.theme-fonts.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!-- ${hashHeader} Install: copy to %AppData%\\Microsoft\\Templates\\Document Themes\\Theme Fonts\\ (install the fonts from fonts/ttf first) -->
<a:fontScheme ${A} name="HexaData">
  <a:majorFont><a:latin typeface="${t.fonts.display.family}"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
  <a:minorFont><a:latin typeface="${t.fonts.body.family}"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
</a:fontScheme>
`,
  );

  // ---------------------------------------------------------------- E-mail template (table layout, inline styles, hex literals)
  const sans = `'${t.fonts.body.family}', ${t.fonts.body.system.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')}`;
  const display = `'${t.fonts.display.family}', ${t.fonts.display.system.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')}`;
  const logo = t.logo.find((v) => v.id === 'horizontal-primary-on-light')!;
  write(
    'platforms/email/template.html',
    `<!doctype html>
<!-- ${hashHeader} E-mail clients ignore CSS variables and most web fonts, so values are literal and stacks fall back to system fonts. -->
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{{subject}}</title>
</head>
<body style="margin:0;padding:0;background-color:${P.white};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${P.white};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${P.white};">
      <tr><td style="padding:0 0 24px 0;border-bottom:2px solid ${P.obsidian};">
        <a href="${t.origin}/"><img src="${t.origin}/v2/logo/horizontal-primary-on-light.png" width="${Math.round(logo.width / 2.5)}" height="${Math.round(logo.height / 2.5)}" alt="HexaData" style="display:block;border:0;"></a>
      </td></tr>
      <tr><td style="padding:32px 0 8px 0;font-family:${display};font-size:28px;line-height:34px;font-weight:700;color:${P.midnight};">{{headline}}</td></tr>
      <tr><td style="padding:0 0 24px 0;font-family:${sans};font-size:16px;line-height:24px;color:${P.obsidian};">{{body}}</td></tr>
      <tr><td style="padding:0 0 32px 0;">
        <!-- Bulletproof button: Deep Blue fill with white text is the one allowed combination on a light background (5.54:1). -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${P.deepBlue}" style="background-color:${P.deepBlue};border-radius:8px;">
          <a href="{{cta_url}}" style="display:inline-block;padding:14px 28px;font-family:${sans};font-size:16px;font-weight:600;color:${P.white};text-decoration:none;">{{cta_label}}</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:16px 0 0 0;border-top:1px solid ${P.grey};font-family:${sans};font-size:13px;line-height:20px;color:${P.obsidian};">
        ${t.taglines.secondary}<br>HexaData is a trademark of Esconet Technologies Limited. {{unsubscribe_or_address}}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
`,
  );

  // ---------------------------------------------------------------- Print colour sheet (nominal, UNPROOFED)
  const cmyk = (hex: string): [number, number, number, number] => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
    const k = 1 - Math.max(r, g, b);
    if (k >= 1) return [0, 0, 0, 100];
    const c = (x: number): number => Math.round(((1 - x - k) / (1 - k)) * 100);
    return [c(r), c(g), c(b), Math.round(k * 100)];
  };
  write(
    'platforms/print/colors.json',
    `${JSON.stringify(
      {
        $generated: hashHeader,
        status: 'UNPROOFED',
        warning:
          'CMYK values are a naive mathematical conversion from sRGB. They are NOT Pantone matches and NOT press-proofed. Have the printer proof and sign off before any print run, then record the approved values in brand/.',
        fallbacks: t.fallbackColors,
        colors: Object.fromEntries(
          pal.map((k) => [
            k,
            {
              hex: P[k]!.toUpperCase(),
              rgb: [1, 3, 5].map((i) => parseInt(P[k]!.slice(i, i + 2), 16)),
              cmykNominal: cmyk(P[k]!),
              pantone: null,
            },
          ]),
        ),
      },
      null,
      2,
    )}\n`,
  );
}
