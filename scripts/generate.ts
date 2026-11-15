/**
 * Generates every derived artefact from tokens/brand.json so the palette is
 * defined exactly once. Output is deterministic (no timestamps) so CI can run
 * `npm run generate:check` and fail on drift.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio, hexToChannels, isHex6 } from '../src/core/contrast.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface FontSpec {
  family: string;
  role: string;
  weights: number[];
  system: string[];
}
interface Pair {
  fg: string;
  bg: string;
  min: number;
  use?: string;
  reason?: string;
}
interface Tokens {
  source: string;
  owner: string;
  revision: number;
  issuedAt: string;
  palette: Record<string, string>;
  taglines: { primary: string; secondary: string };
  fallbackColors: { black: string; white: string; note: string };
  fonts: Record<'display' | 'body' | 'mono', FontSpec>;
  semantic: Record<'light' | 'dark', Record<string, string>>;
  semanticPairs: { mode: 'light' | 'dark'; fg: string; bg: string; min: number }[];
  pairs: Pair[];
  forbiddenPairs: Pair[];
}

const t: Tokens = JSON.parse(readFileSync(resolve(root, 'tokens/brand.json'), 'utf8'));

// ---- validate the source before generating anything -----------------------
const fail = (msg: string): never => {
  throw new Error(`tokens/brand.json: ${msg}`);
};
for (const [k, v] of Object.entries(t.palette)) {
  if (!isHex6(v)) fail(`palette.${k} is not #RRGGBB`);
  if (v.toUpperCase() === '#000000' || v.toUpperCase() === '#FFFFFF')
    fail(`palette.${k} is pure black/white (forbidden by Brand Kit v1.0)`);
}
const paletteKeys = Object.keys(t.palette);
for (const p of [...t.pairs, ...t.forbiddenPairs]) {
  if (!(p.fg in t.palette) || !(p.bg in t.palette)) fail(`unknown palette key in pair ${p.fg}/${p.bg}`);
}
for (const mode of ['light', 'dark'] as const) {
  for (const [role, key] of Object.entries(t.semantic[mode])) {
    if (!(key in t.palette)) fail(`semantic.${mode}.${role} -> unknown palette key ${key}`);
  }
}
for (const sp of t.semanticPairs) {
  if (!(sp.fg in t.semantic[sp.mode]) || !(sp.bg in t.semantic[sp.mode])) fail(`unknown semantic role in ${JSON.stringify(sp)}`);
}

// ---- helpers ---------------------------------------------------------------
const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const GENERIC = new Set(['sans-serif', 'serif', 'monospace', 'system-ui', 'ui-monospace', '-apple-system']);
const quoteFamily = (f: string): string => (GENERIC.has(f) ? f : `"${f}"`);
const stack = (f: FontSpec): string[] => [f.family, `${f.family} Fallback`, ...f.system];
const cssStack = (f: FontSpec): string => stack(f).map(quoteFamily).join(', ');
const jsStack = (f: FontSpec): string => JSON.stringify(stack(f).map(quoteFamily));
const HEADER = 'GENERATED FILE: DO NOT EDIT. Source: tokens/brand.json (run `npm run generate`).';
const write = (rel: string, content: string): void => {
  const abs = resolve(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content.endsWith('\n') ? content : `${content}\n`);
  console.log(`  wrote ${rel}`);
};

// ---- src/core/tokens.ts ----------------------------------------------------
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

// ---- src/css/hexadata.css --------------------------------------------------
const paletteVars = paletteKeys
  .map((k) => `  --hd-${kebab(k)}: ${t.palette[k]!.toUpperCase()};\n  --hd-${kebab(k)}-rgb: ${hexToChannels(t.palette[k]!)};`)
  .join('\n');
const semVars = (mode: 'light' | 'dark', indent: string): string =>
  Object.entries(t.semantic[mode])
    .map(
      ([role, key]) =>
        `${indent}--hd-${kebab(role)}: var(--hd-${kebab(key)});\n${indent}--hd-${kebab(role)}-rgb: var(--hd-${kebab(key)}-rgb);`,
    )
    .join('\n');
write(
  'src/css/hexadata.css',
  `/* ${HEADER} */
:root {
${paletteVars}

  --hd-font-display: ${cssStack(t.fonts.display)};
  --hd-font-body: ${cssStack(t.fonts.body)};
  --hd-font-mono: ${cssStack(t.fonts.mono)};

  /* Semantic roles: light (default) */
${semVars('light', '  ')}
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${semVars('dark', '    ')}
    color-scheme: dark;
  }
}

:root[data-theme='dark'] {
${semVars('dark', '  ')}
  color-scheme: dark;
}

/* Users who ask for more contrast get the strong border/text roles everywhere. */
@media (prefers-contrast: more) {
  :root {
    --hd-border-subtle: var(--hd-border-strong);
    --hd-border-subtle-rgb: var(--hd-border-strong-rgb);
    --hd-fg-muted: var(--hd-fg);
    --hd-fg-muted-rgb: var(--hd-fg-rgb);
  }
}
`,
);

// ---- src/tailwind/preset.cjs (Tailwind v3) ---------------------------------
const roles = Object.keys(t.semantic.light);
const hdColors = [...paletteKeys, ...roles].map((n) => `    '${kebab(n)}': rgb('${kebab(n)}'),`).join('\n');
write(
  'src/tailwind/preset.cjs',
  `'use strict';
/* ${HEADER} */

// \`rgb(var(--x-rgb) / <alpha-value>)\` keeps Tailwind opacity modifiers (bg-hd-cyan/50)
// working while the values stay overridable through CSS variables.
const rgb = (name) => \`rgb(var(--hd-\${name}-rgb) / <alpha-value>)\`;

const brandColors = {
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
  black: rgb('obsidian'),
  white: rgb('white'),
  gray: { DEFAULT: rgb('grey') },
  hd: {
${hdColors}
  },
};

const fontFamily = {
  display: ${jsStack(t.fonts.display)},
  body: ${jsStack(t.fonts.body)},
  mono: ${jsStack(t.fonts.mono)},
};

/**
 * @param {{ extend?: boolean }} [options]
 * Default (strict): REPLACES Tailwind's colour palette so only brand colours exist.
 * \`extend: true\`: adds brand colours alongside Tailwind's defaults.
 */
function createPreset(options = {}) {
  if (options.extend === true) {
    return { theme: { extend: { colors: brandColors, fontFamily } } };
  }
  return { theme: { colors: brandColors, extend: { fontFamily } } };
}

const preset = createPreset();
Object.defineProperty(preset, 'createPreset', { value: createPreset, enumerable: false });
module.exports = preset;
`,
);

// ---- src/tailwind/theme.css (Tailwind v4) ----------------------------------
const v4Colors = [...paletteKeys, ...roles].map((n) => `  --color-hd-${kebab(n)}: var(--hd-${kebab(n)});`).join('\n');
write(
  'src/tailwind/theme.css',
  `/* ${HEADER} */
/* Tailwind v4: import AFTER "tailwindcss" and "@hexadata/brand/css". */
@theme inline {
  --color-*: initial;
  --color-black: var(--hd-obsidian);
  --color-white: var(--hd-white);
  --color-gray: var(--hd-grey);
${v4Colors}
  --font-display: var(--hd-font-display);
  --font-body: var(--hd-font-body);
  --font-mono: var(--hd-font-mono);
}
`,
);

// ---- docs/contrast-matrix.md -----------------------------------------------
const ratio = (a: string, b: string): number => contrastRatio(t.palette[a]!, t.palette[b]!);
const cell = (r: number): string => `${r.toFixed(2)}${r >= 7 ? ' ✓✓' : r >= 4.5 ? ' ✓' : r >= 3 ? ' ◐' : ' ✗'}`;
const matrix = [
  `| | ${paletteKeys.join(' | ')} |`,
  `|---|${paletteKeys.map(() => '---').join('|')}|`,
  ...paletteKeys.map((a) => `| **${a}** | ${paletteKeys.map((b) => (a === b ? '–' : cell(ratio(a, b)))).join(' | ')} |`),
].join('\n');
const rows = (list: Pair[], extra: 'use' | 'reason'): string =>
  list.map((p) => `| ${p.fg} on ${p.bg} | ${ratio(p.fg, p.bg).toFixed(2)} | ${p.min} | ${p[extra] ?? ''} |`).join('\n');
write(
  'docs/contrast-matrix.md',
  `<!-- ${HEADER} -->
# Contrast matrix (WCAG 2.x)

Computed from \`tokens/brand.json\`. Legend: ✓✓ ≥ 7 (AAA text) · ✓ ≥ 4.5 (AA text) · ◐ ≥ 3 (large text / UI only) · ✗ < 3.
Contrast is symmetric, but *use* is directional: see the rules below.

${matrix}

## Allowed pairs (enforced in CI and by the remote-manifest guard)

| Pair | Ratio | Min | Use |
|---|---|---|---|
${rows(t.pairs, 'use')}

## Forbidden pairs (documented, and asserted to be below their threshold)

| Pair | Ratio | Needs | Why |
|---|---|---|---|
${rows(t.forbiddenPairs, 'reason')}
`,
);
console.log('generate: ok');
