import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULT_PALETTE, FOUNDATIONS, SEMANTIC, contrastRatio } from '../src/core/index.ts';

/** Static lint of the hand-written CSS: it may only use brand variables, and every text/background pair it declares must pass in BOTH themes. */
const read = (f: string): string => readFileSync(new URL(`../src/css/${f}`, import.meta.url), 'utf8');
const handwritten = { 'base.css': read('base.css'), 'components.css': read('components.css') };
const tokensCss = read('hexadata.css');

const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const roleByCssName = new Map(Object.keys(SEMANTIC.light).map((r) => [`--hd-${kebab(r)}`, r as keyof typeof SEMANTIC.light]));
const strip = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

test('hand-written CSS contains no raw colours, URLs or imports', () => {
  for (const [name, raw] of Object.entries(handwritten)) {
    const css = strip(raw);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), `${name}: raw hex colour`);
    assert.ok(!/\b(?:hsl|hsla|rgba|oklch|lab|lch)\(/.test(css), `${name}: non-variable colour function`);
    for (const m of css.matchAll(/\brgb\(([^)]*)\)/g))
      assert.match(m[1]!, /^var\(--hd-[a-z-]+-rgb$/, `${name}: rgb() must use a palette -rgb variable (${m[0]})`);
    assert.ok(!/url\(|@import|https?:\/\//.test(css), `${name}: no URLs or @import`);
  }
});

test('every --hd-* variable used by the hand-written CSS is defined by the tokens (or has a local fallback)', () => {
  const all = tokensCss + Object.values(handwritten).join(' ');
  const defined = new Set([...all.matchAll(/(--hd-[a-z0-9-]+)\s*:/g)].map((m) => m[1]!));
  for (const [name, raw] of Object.entries(handwritten)) {
    for (const m of strip(raw).matchAll(/var\((--hd-[a-z0-9-]+)(,)?/g)) {
      if (m[2] === ',') continue; // local override hook with a fallback, e.g. var(--hd-stack-gap, ...)
      assert.ok(defined.has(m[1]!), `${name}: ${m[1]} is not defined in hexadata.css`);
    }
  }
});

test('every background/colour pair declared in one rule meets 4.5:1 in light AND dark', () => {
  let checked = 0;
  for (const [name, raw] of Object.entries(handwritten)) {
    for (const m of strip(raw).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const body = m[2]!;
      const bg = /(?:^|[;\s])background(?:-color)?:\s*var\((--hd-[a-z-]+)\)/.exec(body)?.[1];
      const fg = /(?:^|[;\s])color:\s*var\((--hd-[a-z-]+)\)/.exec(body)?.[1];
      const bgRole = bg ? roleByCssName.get(bg) : undefined;
      const fgRole = fg ? roleByCssName.get(fg) : undefined;
      if (!bgRole || !fgRole) continue;
      for (const mode of ['light', 'dark'] as const) {
        const r = contrastRatio(DEFAULT_PALETTE[SEMANTIC[mode][fgRole]], DEFAULT_PALETTE[SEMANTIC[mode][bgRole]]);
        assert.ok(r >= 4.5, `${name} "${m[1]!.trim()}": ${fg} on ${bg} is ${r.toFixed(2)}:1 in ${mode} mode`);
      }
      checked++;
    }
  }
  assert.ok(checked >= 20, `expected to check many pairs, checked ${checked}`);
});

test('foundations: spacing matches the Tailwind 0.25rem base; durations are valid <time> values; reduced motion is honoured', () => {
  assert.equal(FOUNDATIONS.space['4'], '1rem');
  assert.equal(FOUNDATIONS.space['0'], '0');
  for (const v of Object.values(FOUNDATIONS.duration)) assert.match(v, /^\d+ms$/);
  assert.match(tokensCss, /prefers-reduced-motion: reduce[\s\S]*--hd-duration-base: 0ms/);
  assert.ok(Object.keys(FOUNDATIONS.shadow).length >= 3);
});
