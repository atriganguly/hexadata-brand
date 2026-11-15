import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';
import { PALETTE_KEYS, SEMANTIC } from '../src/core/index.ts';

const require = createRequire(import.meta.url);
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const theme = readFileSync(new URL('../src/tailwind/theme.css', import.meta.url), 'utf8');

async function build(candidates: string[]): Promise<string> {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, { base: process.cwd() });
  return compiler.build(candidates);
}

test('v4 theme: brand utilities exist and reference the CSS variables (OTA-overridable)', async () => {
  const css = await build([
    'bg-hd-cyan',
    'text-hd-deep-blue',
    'bg-hd-bg',
    'text-hd-fg',
    'border-hd-border-strong',
    'font-display',
    'font-body',
    'font-mono',
  ]);
  assert.match(css, /background-color:\s*var\(--hd-cyan\)/);
  assert.match(css, /color:\s*var\(--hd-deep-blue\)/);
  assert.match(css, /var\(--hd-bg\)/);
  assert.match(css, /font-family:\s*var\(--hd-font-display\)/);
});

test('v4 theme: opacity modifiers work on brand colours', async () => {
  const css = await build(['bg-hd-cyan/50']);
  assert.match(css, /color-mix\(.*var\(--hd-cyan\)\s*50%/);
});

test('v4 theme: strict by default, so off-brand Tailwind colours generate nothing', async () => {
  const css = await build(['bg-red-500', 'text-blue-600', 'bg-slate-100']);
  assert.equal(
    css
      .trim()
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim(),
    '',
  );
});

test('v4 theme: black/white/gray are aliased to brand shades, never pure', async () => {
  const css = await build(['bg-black', 'text-white', 'bg-gray']);
  assert.match(css, /var\(--hd-obsidian\)/);
  assert.match(css, /var\(--hd-white\)/);
  assert.match(css, /var\(--hd-grey\)/);
  assert.ok(!/#000(000)?\b|#fff(fff)?\b/i.test(css));
});

test('v4 theme: every palette colour and semantic role has a utility', async () => {
  const roles = Object.keys(SEMANTIC.light);
  const names = [...PALETTE_KEYS, ...roles].map(kebab);
  const css = await build(names.map((n) => `bg-hd-${n}`));
  for (const n of names) assert.ok(css.includes(`--hd-${n})`), `bg-hd-${n} missing`);
});

test('v3 preset: strict mode replaces palette; every colour supports <alpha-value>', () => {
  const preset = require('../src/tailwind/preset.cjs');
  const { colors } = preset.theme;
  assert.ok(colors.hd && colors.hd.cyan);
  assert.equal(colors.red, undefined);
  assert.equal(colors.slate, undefined);
  const flat = [colors.black, colors.white, colors.gray.DEFAULT, ...Object.values<string>(colors.hd)];
  for (const v of flat) assert.match(v, /^rgb\(var\(--hd-[a-z-]+-rgb\) \/ <alpha-value>\)$/);
  assert.ok(preset.theme.extend.fontFamily.display[0] === '"Space Grotesk"');
});

test('v3 preset: createPreset({extend:true}) keeps Tailwind defaults; createPreset is non-enumerable', () => {
  const preset = require('../src/tailwind/preset.cjs');
  const ext = preset.createPreset({ extend: true });
  assert.ok(ext.theme.extend.colors.hd);
  assert.equal(ext.theme.colors, undefined);
  assert.equal(Object.keys(preset).includes('createPreset'), false);
});

test('v3 preset: font stacks end in a generic family and include metric fallbacks', () => {
  const { fontFamily } = require('../src/tailwind/preset.cjs').theme.extend;
  assert.equal(fontFamily.display.at(-1), 'sans-serif');
  assert.equal(fontFamily.body.at(-1), 'sans-serif');
  assert.equal(fontFamily.mono.at(-1), 'monospace');
  assert.ok(fontFamily.display.includes('"Space Grotesk Fallback"'));
  assert.ok(fontFamily.body.includes('"Noto Sans Devanagari"'));
});
