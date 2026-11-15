import type { Ctx, Pair, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER, quoteFamily, stack, paletteKeys }: Ctx): void {
  const tsPalette = paletteKeys.map((k) => `  ${k}: '${t.palette[k]!.toUpperCase()}',`).join('\n');
  const tsFonts = (Object.keys(t.fonts) as (keyof Tokens['fonts'])[])
    .map((k) => {
      const f = t.fonts[k];
      return `  ${k}: {\n    family: ${JSON.stringify(f.family)},\n    role: ${JSON.stringify(f.role)},\n    weights: ${JSON.stringify(f.weights)},\n    stack: ${JSON.stringify(stack(f).map(quoteFamily))},\n  },`;
    })
    .join('\n');
  const tsPairs = (list: Pair[], extra: 'use' | 'reason'): string =>
    list.map((p) => `  { fg: '${p.fg}', bg: '${p.bg}', min: ${p.min}, ${extra}: ${JSON.stringify(p[extra] ?? '')} },`).join('\n');
  const tsSemantic = (mode: 'light' | 'dark'): string =>
    Object.entries(t.semantic[mode])
      .map(([r, k]) => `    ${r}: '${k}',`)
      .join('\n');
  const tsSemPairs = t.semanticPairs.map((p) => `  { mode: '${p.mode}', fg: '${p.fg}', bg: '${p.bg}', min: ${p.min} },`).join('\n');

  write(
    'src/core/tokens.ts',
    `/* ${HEADER} */

export const BRAND_SOURCE = ${JSON.stringify(t.source)};
export const BRAND_REVISION = ${t.revision};
export const BRAND_ISSUED_AT = ${JSON.stringify(t.issuedAt)};

export const PALETTE_KEYS = [${paletteKeys.map((k) => `'${k}'`).join(', ')}] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];

export const DEFAULT_PALETTE: Readonly<Record<PaletteKey, string>> = Object.freeze({
${tsPalette}
});

export const DEFAULT_TAGLINES = Object.freeze({
  primary: ${JSON.stringify(t.taglines.primary)},
  secondary: ${JSON.stringify(t.taglines.secondary)},
});
export type TaglineKey = keyof typeof DEFAULT_TAGLINES;

/**
 * Brand Kit v1.0: pure black/white are acceptable ONLY where the defined shades
 * are technically unusable (print, email, forced-colors) or as a fallback.
 * They are never palette or manifest tokens.
 */
export const FALLBACK_COLORS = Object.freeze({ black: ${JSON.stringify(t.fallbackColors.black)}, white: ${JSON.stringify(t.fallbackColors.white)} });

export const FONTS = {
${tsFonts}
} as const;
export type FontRole = keyof typeof FONTS;

export type SemanticRole = ${Object.keys(t.semantic.light)
      .map((r) => `'${r}'`)
      .join(' | ')};
export type ThemeMode = 'light' | 'dark';
export const SEMANTIC: Readonly<Record<ThemeMode, Readonly<Record<SemanticRole, PaletteKey>>>> = {
  light: {
${tsSemantic('light')}
  },
  dark: {
${tsSemantic('dark')}
  },
};

export interface ColorPair {
  readonly fg: PaletteKey;
  readonly bg: PaletteKey;
  /** Minimum WCAG contrast ratio: 4.5 for text, 3 for non-text UI. */
  readonly min: number;
  readonly use: string;
}
export interface ForbiddenPair {
  readonly fg: PaletteKey;
  readonly bg: PaletteKey;
  readonly min: number;
  readonly reason: string;
}
export interface SemanticPair {
  readonly mode: ThemeMode;
  readonly fg: SemanticRole;
  readonly bg: SemanticRole;
  readonly min: number;
}

/** Palette pairs the brand permits, each with the minimum ratio it must keep. */
export const ALLOWED_PAIRS: readonly ColorPair[] = [
${tsPairs(t.pairs, 'use')}
];

/** Palette pairs that must never be used (for the stated purpose). */
export const FORBIDDEN_PAIRS: readonly ForbiddenPair[] = [
${tsPairs(t.forbiddenPairs, 'reason')}
];

/** Semantic role pairs that must hold in each theme mode. */
export const SEMANTIC_PAIRS: readonly SemanticPair[] = [
${tsSemPairs}
];

export const cssVarName = (key: string): string => \`--hd-\${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}\`;
`,
  );
}
