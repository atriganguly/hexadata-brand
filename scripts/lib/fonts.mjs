// Pure helpers for the self-hosted font pipeline (unit-tested; no filesystem, no network).

export const SUBSETS = {
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext':
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};

/** Brand fonts: family name, fontsource slug, and the weight range the Brand Kit uses (400-700). */
export const BRAND_FONTS = [
  { key: 'display', family: 'Space Grotesk', slug: 'space-grotesk', weights: '400 700', fallbackBase: 'arial' },
  { key: 'body', family: 'Inter Tight', slug: 'inter-tight', weights: '400 700', fallbackBase: 'arial' },
  { key: 'mono', family: 'JetBrains Mono', slug: 'jetbrains-mono', weights: '400 700', fallbackBase: 'courierNew' },
];

/** System faces whose metrics are standardised across OSes (Arial = Liberation Sans = Arimo; Courier New = Liberation Mono = Cousine). */
export const FALLBACK_BASES = {
  arial: { label: 'Arial', locals: ['Arial', 'Liberation Sans', 'Arimo', 'Helvetica'] },
  courierNew: { label: 'Courier New', locals: ['Courier New', 'Liberation Mono', 'Cousine'] },
};

export const fontFaceCss = ({ family, weights, file, subset }) =>
  `@font-face {\n  font-family: "${family}";\n  font-style: normal;\n  font-weight: ${weights};\n  font-display: swap;\n  src: url("./fonts/${file}") format("woff2");\n  unicode-range: ${SUBSETS[subset]};\n}\n`;

const pct = (n) => `${(n * 100).toFixed(2)}%`;

/**
 * Capsize/fontaine formula. `font` and `fallback` are Capsize metrics:
 * { unitsPerEm, xWidthAvg, ascent, descent, lineGap, xHeight, capHeight }.
 * Scales the fallback so its average glyph width matches the web font, then
 * pins vertical metrics to the web font's so swapping causes ~zero layout shift.
 */
export function computeOverrides(font, fallback) {
  const sizeAdjust = font.xWidthAvg / font.unitsPerEm / (fallback.xWidthAvg / fallback.unitsPerEm);
  const denom = font.unitsPerEm * sizeAdjust;
  return {
    sizeAdjust,
    ascent: font.ascent / denom,
    descent: Math.abs(font.descent) / denom,
    lineGap: font.lineGap / denom,
  };
}

/** Lower is better: how differently proportioned (x-height, cap-height vs width) the candidate is, after width matching. */
export function shapeError(font, candidate) {
  const r = (m) => [m.xHeight / m.xWidthAvg, m.capHeight / m.xWidthAvg];
  const [fx, fc] = r(font);
  const [cx, cc] = r(candidate);
  return Math.abs(fx - cx) + Math.abs(fc - cc);
}

export const fallbackFaceCss = ({ family, locals, overrides }) =>
  `@font-face {\n  font-family: "${family} Fallback";\n  src: ${locals.map((l) => `local("${l}")`).join(', ')};\n  size-adjust: ${pct(overrides.sizeAdjust)};\n  ascent-override: ${pct(overrides.ascent)};\n  descent-override: ${pct(overrides.descent)};\n  line-gap-override: ${pct(overrides.lineGap)};\n}\n`;
