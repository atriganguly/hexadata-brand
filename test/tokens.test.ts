import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLOWED_PAIRS,
  DEFAULT_PALETTE,
  DEFAULT_TAGLINES,
  FALLBACK_COLORS,
  FONTS,
  FORBIDDEN_PAIRS,
  PALETTE_KEYS,
  SEMANTIC,
  SEMANTIC_PAIRS,
  contrastRatio,
  isHex6,
  cssVarName,
} from '../src/core/index.ts';

// Golden values transcribed from "HexaData Brand Kit v1.0" (PDF). Changing the brand must be a deliberate edit here.
const BRAND_KIT_V1 = {
  cyan: '#009BB6',
  deepBlue: '#046AA7',
  obsidian: '#121E36',
  vividCerulean: '#01A3E5',
  midnight: '#040F49',
  crimson: '#FF3B30',
  copper: '#F59E0B',
  green: '#10B981',
  grey: '#A3B1C6',
  white: '#F8FAFC',
} as const;

test('palette matches Brand Kit v1.0 exactly', () => {
  assert.deepEqual({ ...DEFAULT_PALETTE }, BRAND_KIT_V1);
  assert.equal(PALETTE_KEYS.length, 10);
});

test('taglines and fonts match Brand Kit v1.0', () => {
  assert.equal(DEFAULT_TAGLINES.primary, 'Supercomputing, On-demand.');
  assert.equal(DEFAULT_TAGLINES.secondary, 'Engineered in India. Built for the World.');
  assert.equal(FONTS.display.family, 'Space Grotesk');
  assert.equal(FONTS.body.family, 'Inter Tight');
  assert.equal(FONTS.mono.family, 'JetBrains Mono');
  for (const f of Object.values(FONTS)) assert.deepEqual([...f.weights], [400, 500, 600, 700]);
});

test('no palette token is pure black/white; fallbacks are kept separate', () => {
  for (const v of Object.values(DEFAULT_PALETTE)) {
    assert.ok(isHex6(v));
    assert.notEqual(v.toUpperCase(), '#000000');
    assert.notEqual(v.toUpperCase(), '#FFFFFF');
  }
  assert.deepEqual({ ...FALLBACK_COLORS }, { black: '#000000', white: '#FFFFFF' });
});

test('every ALLOWED pair meets its minimum contrast', () => {
  for (const p of ALLOWED_PAIRS) {
    const r = contrastRatio(DEFAULT_PALETTE[p.fg], DEFAULT_PALETTE[p.bg]);
    assert.ok(r >= p.min, `${p.fg} on ${p.bg}: ${r.toFixed(3)} < ${p.min}`);
  }
});

test('every FORBIDDEN pair really is below the threshold it claims', () => {
  for (const p of FORBIDDEN_PAIRS) {
    const r = contrastRatio(DEFAULT_PALETTE[p.fg], DEFAULT_PALETTE[p.bg]);
    assert.ok(r < p.min, `${p.fg} on ${p.bg} is ${r.toFixed(3)}, which is not below ${p.min}`);
  }
});

test('a pair is never both allowed and forbidden at the same purpose (min)', () => {
  for (const f of FORBIDDEN_PAIRS) {
    for (const a of ALLOWED_PAIRS) {
      if (a.fg === f.fg && a.bg === f.bg) assert.ok(a.min < f.min, `${a.fg}/${a.bg} allowed at ${a.min} but forbidden at ${f.min}`);
    }
  }
});

test('semantic roles hold in both modes', () => {
  assert.ok(SEMANTIC_PAIRS.length >= 10);
  for (const p of SEMANTIC_PAIRS) {
    const r = contrastRatio(DEFAULT_PALETTE[SEMANTIC[p.mode][p.fg]], DEFAULT_PALETTE[SEMANTIC[p.mode][p.bg]]);
    assert.ok(r >= p.min, `[${p.mode}] ${p.fg}/${p.bg}: ${r.toFixed(3)} < ${p.min}`);
  }
});

test('documented neutral matrix values (regression lock)', () => {
  const r = (a: keyof typeof DEFAULT_PALETTE, b: keyof typeof DEFAULT_PALETTE) => contrastRatio(DEFAULT_PALETTE[a], DEFAULT_PALETTE[b]);
  assert.ok(Math.abs(r('white', 'obsidian') - 15.87) < 0.02);
  assert.ok(Math.abs(r('white', 'midnight') - 17.16) < 0.02);
  assert.ok(Math.abs(r('grey', 'obsidian') - 7.64) < 0.02);
  assert.ok(Math.abs(r('grey', 'midnight') - 8.26) < 0.02);
  assert.ok(Math.abs(r('grey', 'white') - 2.08) < 0.02);
  assert.ok(Math.abs(r('obsidian', 'midnight') - 1.08) < 0.02);
});

test('grey cannot serve as 4.5:1 text on both white and obsidian (ceiling proof)', () => {
  // Maximise the minimum ratio over every grey level: it tops out below 4.5.
  let best = 0;
  for (let v = 0; v <= 255; v++) {
    const g = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
    best = Math.max(best, Math.min(contrastRatio(g, DEFAULT_PALETTE.white), contrastRatio(g, DEFAULT_PALETTE.obsidian)));
  }
  assert.ok(best < 4.5, `best achievable ${best.toFixed(2)}`);
});

test('css variable names are kebab-case', () => {
  assert.equal(cssVarName('deepBlue'), '--hd-deep-blue');
  assert.equal(cssVarName('vividCerulean'), '--hd-vivid-cerulean');
  assert.equal(cssVarName('cyan'), '--hd-cyan');
});

test('generated artefacts are in sync with the palette', () => {
  const css = readFileSync(new URL('../src/css/hexadata.css', import.meta.url), 'utf8');
  for (const k of PALETTE_KEYS) assert.ok(css.includes(`${cssVarName(k)}: ${DEFAULT_PALETTE[k]};`), `${k} missing in css`);
  const preset = readFileSync(new URL('../src/tailwind/preset.cjs', import.meta.url), 'utf8');
  assert.ok(preset.includes('<alpha-value>'));
  assert.ok(!/fonts\.googleapis|https?:\/\//.test(css + preset), 'generated CSS/preset must contain no URLs');
});
