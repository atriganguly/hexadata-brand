// Runs against the BUILT package (needs: build, build:fonts, build:logos). Part of `npm run test:dist`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { DEFAULT_MANIFEST } = await import(pathToFileURL(join(root, 'dist/core/index.js')).href);

test('channel build: v2 + immutable copy, hashed assets, unsigned preview without a key, refuses an unlisted key', async () => {
  const out = mkdtempSync(join(tmpdir(), 'hexa-channel-'));
  const run = (extra, env = {}) =>
    execFileSync(process.execPath, ['scripts/build-channel.mjs', '--out', out, ...extra], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  assert.match(run([]), /UNSIGNED \(preview only\)/);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const expected = [
    'css/all.css',
    'css/fonts.css',
    'js/hexadata.js',
    'logo/horizontal-primary-on-light.png',
    'logo/favicon.ico',
    'fonts/ttf/SpaceGrotesk-Bold.ttf',
    'tokens.json',
    'manifest.unsigned.json',
    'integrity.json',
    'version.json',
  ];
  for (const dir of ['v2', pkg.version]) for (const f of expected) assert.ok(existsSync(join(out, dir, f)), `${dir}/${f}`);
  const integrity = JSON.parse(readFileSync(join(out, 'v2/integrity.json'), 'utf8'));
  assert.ok('css/all.css' in integrity.files && 'js/hexadata.js' in integrity.files);
  assert.ok(Object.values(integrity.files).every((v) => v.startsWith('sha384-')));
  assert.equal(JSON.parse(readFileSync(join(out, 'v2/version.json'), 'utf8')).signed, false);
  assert.ok(!readdirSync(join(out, 'v2')).includes('manifest.json'), 'an unsigned build must not publish manifest.json');
  const tokens = JSON.parse(readFileSync(join(out, 'v2/tokens.json'), 'utf8'));
  assert.equal(tokens.semantic.light.bg.hex, DEFAULT_MANIFEST.tokens.palette.white);

  // --require-signed must fail without a key; a key that is not in brand/keys.json must be refused (apps would reject it).
  assert.throws(() => run(['--require-signed']), /no signing key/);
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const jwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey));
  assert.throws(() => run([], { HEXA_SIGNING_JWK: jwk }), /not listed in brand\/keys\.json/);
});
