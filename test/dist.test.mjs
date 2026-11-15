import { fileURLToPath } from 'node:url';
// Runs against the BUILT output: `npm run build && npm run test:dist`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const distPath = (p) => fileURLToPath(dist(p));

test('core: ESM and CJS builds expose the same API', async () => {
  const esm = await import(dist('core/index.js'));
  const cjs = require(distPath('core/index.cjs'));
  assert.deepEqual(Object.keys(esm).sort(), Object.keys(cjs).sort());
  for (const k of [
    'parseManifest',
    'fetchSignedManifest',
    'contrastRatio',
    'DEFAULT_PALETTE',
    'DEFAULT_MANIFEST',
    'HexaManifestSchema',
    'applyManifestToElement',
  ])
    assert.ok(k in esm, k);
  assert.equal(esm.DEFAULT_PALETTE.obsidian, '#121E36');
  assert.equal(cjs.parseManifest({}).ok, false);
});

test('react: "use client" is the first statement in both formats; SSR works from dist', async () => {
  for (const f of ['react/index.js', 'react/index.cjs']) assert.match(readFileSync(dist(f), 'utf8'), /^\s*"use client";/);
  const { HexaTagline, HexaProvider } = await import(dist('react/index.js'));
  const { renderToString } = await import('react-dom/server');
  const { createElement } = await import('react');
  assert.equal(renderToString(createElement(HexaProvider, null, createElement(HexaTagline))), '<p>Supercomputing, On-demand.</p>');
  const cjs = require(distPath('react/index.cjs'));
  assert.equal(typeof cjs.HexaProvider, 'function');
});

test('native: loads in both formats without importing react-native', async () => {
  const esm = await import(dist('native/index.js'));
  const cjs = require(distPath('native/index.cjs'));
  assert.equal(typeof esm.resolveNativeTheme, 'function');
  assert.equal(typeof cjs.useHexaNativeTheme, 'function');
  assert.ok(!/from ["']react-native/.test(readFileSync(dist('native/index.js'), 'utf8')));
});

test('tailwind preset loads via require and exposes a theme', () => {
  const preset = require(distPath('tailwind/preset.cjs'));
  assert.ok(preset.theme.colors.hd.cyan.includes('<alpha-value>'));
  assert.equal(typeof preset.createPreset, 'function');
});

test('CSS artefacts exist and contain no URLs', () => {
  for (const f of ['css/hexadata.css', 'tailwind/theme.css']) {
    const text = readFileSync(dist(f), 'utf8');
    assert.ok(text.includes('--hd-cyan'));
    assert.ok(!/https?:\/\//.test(text), f);
  }
});

test('CJS declarations never reference .js specifiers', () => {
  const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
  const files = walk(distPath('types-cjs')).filter((f) => f.endsWith('.d.cts'));
  assert.ok(files.length >= 5);
  for (const f of files) assert.ok(!/from\s+['"]\.{1,2}\/[^'"]+\.js['"]/.test(readFileSync(f, 'utf8')), f);
});

test('self-reference shims point at real files', () => {
  for (const d of ['react', 'native', 'tailwind']) {
    const p = JSON.parse(readFileSync(new URL(`../${d}/package.json`, import.meta.url), 'utf8'));
    assert.ok(existsSync(new URL(`../${d}/${p.main}`, import.meta.url)), `${d}: ${p.main}`);
    assert.ok(existsSync(new URL(`../${d}/${p.types}`, import.meta.url)), `${d}: ${p.types}`);
  }
});

test('manifest-tool: keygen -> sign -> verify round trip; refuses to sign unsafe manifests', async () => {
  const { execFileSync, spawnSync } = await import('node:child_process');
  const { mkdtempSync, writeFileSync, statSync: st } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const tool = fileURLToPath(new URL('../scripts/manifest-tool.mjs', import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), 'hexa-tool-'));
  const keyFile = join(dir, 'k.jwk');
  const kg = spawnSync(process.execPath, [tool, 'keygen', 'k1', keyFile], { encoding: 'utf8' });
  assert.equal(kg.status, 0, kg.stderr);
  const { kid, publicKey } = JSON.parse(kg.stdout);
  assert.equal(kid, 'k1');
  if (process.platform !== 'win32') assert.equal(st(keyFile).mode & 0o777, 0o600, 'private key must be mode 600');

  const good = {
    schemaVersion: 1,
    revision: 3,
    issuedAt: '2026-11-14T00:00:00Z',
    tokens: { palette: { cyan: '#009AB4' }, taglines: { primary: 'Signed.' } },
  };
  writeFileSync(join(dir, 'm.json'), JSON.stringify(good));
  const envelope = execFileSync(process.execPath, [tool, 'sign', join(dir, 'm.json'), keyFile, 'k1'], { encoding: 'utf8' });
  writeFileSync(join(dir, 'env.json'), envelope);
  const verified = JSON.parse(
    execFileSync(process.execPath, [tool, 'verify', join(dir, 'env.json'), 'k1', publicKey], { encoding: 'utf8' }),
  );
  assert.equal(verified.tokens.taglines.primary, 'Signed.');

  // wrong key must not verify
  const kg2 = JSON.parse(spawnSync(process.execPath, [tool, 'keygen', 'k1', join(dir, 'k2.jwk')], { encoding: 'utf8' }).stdout);
  assert.notEqual(spawnSync(process.execPath, [tool, 'verify', join(dir, 'env.json'), 'k1', kg2.publicKey]).status, 0);

  // refuses: contrast regression, and warnings (unknown key / bad colour)
  for (const bad of [
    { ...good, tokens: { palette: { copper: '#3A2A00' } } },
    { ...good, tokens: { palette: { teal: '#112233' } } },
    { ...good, tokens: { palette: { cyan: '#FFF' } } },
  ]) {
    writeFileSync(join(dir, 'bad.json'), JSON.stringify(bad));
    const r = spawnSync(process.execPath, [tool, 'sign', join(dir, 'bad.json'), keyFile, 'k1'], { encoding: 'utf8' });
    assert.notEqual(r.status, 0, JSON.stringify(bad));
    assert.match(r.stderr, /REFUSING TO SIGN/);
  }
});
