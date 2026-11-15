import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The repo is open (Apache-2.0 software) but the HexaData Brand Assets are protected. These tests keep that split from
 * eroding: every protected path must be named in BRAND-LICENSE.md, and nothing may claim the assets are open.
 */
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string): string => readFileSync(join(root, f), 'utf8');
const pkg = JSON.parse(read('package.json')) as { license: string; files: string[]; publishConfig: { access: string } };

test('software is Apache-2.0; brand assets carry their own licence reference in the package licence expression', () => {
  assert.match(read('LICENSE'), /^Apache License\s+Version 2\.0, January 2004/);
  assert.equal(pkg.license, 'Apache-2.0 AND LicenseRef-HexaData-Brand');
  assert.equal(pkg.publishConfig.access, 'public');
  for (const f of ['LICENSE', 'BRAND-LICENSE.md', 'NOTICE']) assert.ok(pkg.files.includes(f), `${f} must ship in the package`);
});

test('BRAND-LICENSE.md names every protected asset location and the reuse guide exists', () => {
  const text = read('BRAND-LICENSE.md');
  for (const needle of [
    'brand/logo/**',
    'dist/logo/**',
    'brand/kit/**',
    'brand/tokens/**',
    'brand/content.json',
    'Supercomputing, On-demand.',
    'Engineered in India. Built for the World.',
    'SIL Open Font License',
    'Apache License 2.0',
  ]) {
    assert.ok(text.includes(needle), `BRAND-LICENSE.md must mention ${needle}`);
  }
  assert.ok(existsSync(join(root, 'docs/USE-FOR-YOUR-OWN-BRAND.md')));
  assert.ok(read('README.md').includes('BRAND-LICENSE.md'), 'README must link the brand licence');
});

test('no document claims the brand assets are open, or that everything is proprietary', () => {
  for (const f of ['README.md', 'NOTICE', 'docs/COMPLIANCE.md', 'BRAND-LICENSE.md']) {
    const text = read(f);
    assert.ok(!/UNLICENSED/.test(text.replace(/the package stays `UNLICENSED`[^\n]*/g, '')), `${f}: stale UNLICENSED wording`);
    assert.ok(!/MIT licen[cs]e.*logo|logos? .*(are|is) (free|open)/i.test(text), `${f}: must not call logos free/open`);
  }
});

test('logo masters and Brand Kit sit only under the protected directories', () => {
  const walk = (d: string): string[] =>
    readdirSync(join(root, d)).flatMap((n) => (statSync(join(root, d, n)).isDirectory() ? walk(`${d}/${n}`) : [`${d}/${n}`]));
  const images = [...walk('brand'), ...walk('src'), ...walk('docs'), ...walk('test')].filter((f) => /\.(png|webp|ico|pdf|svg)$/i.test(f));
  for (const f of images)
    assert.ok(f.startsWith('brand/logo/') || f.startsWith('brand/kit/'), `${f}: brand imagery outside the protected directories`);
});
