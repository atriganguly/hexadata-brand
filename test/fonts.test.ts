import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error plain .mjs helper without declarations
import { BRAND_FONTS, SUBSETS, computeOverrides, fallbackFaceCss, fontFaceCss, shapeError } from '../scripts/lib/fonts.mjs';
import { FONTS } from '../src/core/index.ts';

test('brand font list agrees with tokens (family names and 400-700 range)', () => {
  const byKey = Object.fromEntries((BRAND_FONTS as { key: string; family: string; weights: string }[]).map((f) => [f.key, f]));
  for (const k of ['display', 'body', 'mono'] as const) {
    assert.equal(byKey[k]!.family, FONTS[k].family);
    assert.equal(byKey[k]!.weights, '400 700');
  }
});

test('@font-face is same-origin, swap, woff2, and carries a unicode-range', () => {
  const css: string = fontFaceCss({
    family: 'Space Grotesk',
    weights: '400 700',
    file: 'space-grotesk-latin-wght-normal.woff2',
    subset: 'latin',
  });
  assert.match(css, /font-display: swap;/);
  assert.match(css, /src: url\("\.\/fonts\/space-grotesk-latin-wght-normal\.woff2"\) format\("woff2"\);/);
  assert.ok(css.includes(`unicode-range: ${SUBSETS.latin};`));
  assert.ok(!/https?:\/\//.test(css));
});

test('Capsize override maths (hand-computed example)', () => {
  // font: 1000 upm, avg width 600, ascent 900, descent -300, gap 0. fallback: 2048 upm, avg width 1000.
  const o = computeOverrides(
    { unitsPerEm: 1000, xWidthAvg: 600, ascent: 900, descent: -300, lineGap: 0 },
    { unitsPerEm: 2048, xWidthAvg: 1000 },
  );
  const sizeAdjust = 0.6 / (1000 / 2048); // 1.2288
  assert.ok(Math.abs(o.sizeAdjust - sizeAdjust) < 1e-9);
  assert.ok(Math.abs(o.ascent - 900 / (1000 * sizeAdjust)) < 1e-9);
  assert.ok(Math.abs(o.descent - 300 / (1000 * sizeAdjust)) < 1e-9);
  assert.equal(o.lineGap, 0);
});

test('identical metrics give a no-op adjustment', () => {
  const m = { unitsPerEm: 1000, xWidthAvg: 500, ascent: 800, descent: -200, lineGap: 0, xHeight: 500, capHeight: 700 };
  const o = computeOverrides(m, m);
  assert.equal(o.sizeAdjust, 1);
  assert.equal(shapeError(m, m), 0);
});

test('fallback face uses only local() sources (never a URL) and named "<Family> Fallback"', () => {
  const css: string = fallbackFaceCss({
    family: 'Inter Tight',
    locals: ['Arial', 'Liberation Sans'],
    overrides: { sizeAdjust: 1.0123, ascent: 0.9, descent: 0.2, lineGap: 0 },
  });
  assert.match(css, /font-family: "Inter Tight Fallback";/);
  assert.match(css, /src: local\("Arial"\), local\("Liberation Sans"\);/);
  assert.match(css, /size-adjust: 101\.23%;/);
  assert.ok(!/url\(/.test(css));
});
