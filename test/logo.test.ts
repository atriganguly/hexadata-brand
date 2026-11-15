import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LOGO_BASE, BRAND_ORIGIN, LOGO_VARIANTS, logoUrl, resolveLogo } from '../src/core/index.ts';

const root = fileURLToPath(new URL('..', import.meta.url));

test('logo.json is consistent with the master files (hash, size, trim box)', () => {
  const out = execFileSync(process.execPath, ['scripts/logo-tool.mjs', 'check'], { cwd: root, encoding: 'utf8' });
  assert.match(out, /logo: ok/);
});

test('every form has artwork for light and dark surfaces; ids are stable file stems', () => {
  for (const form of ['icon', 'centered', 'horizontal'] as const) {
    for (const bg of ['light', 'dark'] as const) assert.ok(resolveLogo(form, 'primary', bg));
  }
  assert.deepEqual(LOGO_VARIANTS.map((v) => v.id).sort(), [
    'centered-mono',
    'centered-primary-on-dark',
    'centered-primary-on-light',
    'horizontal-mono',
    'horizontal-primary-on-dark',
    'horizontal-primary-on-light',
    'icon-on-dark',
    'icon-on-light',
  ]);
});

test('mono exists for dark surfaces only; on light it falls back to full colour (never an invisible logo)', () => {
  assert.equal(resolveLogo('horizontal', 'mono', 'dark').id, 'horizontal-mono');
  assert.equal(resolveLogo('horizontal', 'mono', 'light').id, 'horizontal-primary-on-light');
  assert.equal(resolveLogo('icon', 'mono', 'dark').id, 'icon-on-dark'); // no mono icon in the Kit
});

test('logoUrl: hosted channel by default, custom base normalised, icons carry a size, wordmarks do not', () => {
  assert.equal(DEFAULT_LOGO_BASE, `${BRAND_ORIGIN}/v2/logo/`);
  const h = resolveLogo('horizontal', 'primary', 'dark');
  const i = resolveLogo('icon', 'primary', 'light');
  assert.equal(logoUrl(h, { base: '/x' }), '/x/horizontal-primary-on-dark.png');
  assert.equal(logoUrl(h, { base: '/x/', format: 'webp' }), '/x/horizontal-primary-on-dark.webp');
  assert.equal(logoUrl(i, { base: '/x', size: 512 }), '/x/icon-on-light-512.png');
  assert.equal(logoUrl(i, { base: '/x' }), '/x/icon-on-light-256.png');
});

test('masters are untouched Brand Kit artwork: sizes match what logo.json records', () => {
  const doc = JSON.parse(readFileSync(new URL('../brand/logo/logo.json', import.meta.url), 'utf8')) as {
    variants: { id: string; width: number }[];
  };
  for (const v of doc.variants) assert.ok(v.width === 500 || v.width === 4096, `${v.id} width ${v.width}`);
});
