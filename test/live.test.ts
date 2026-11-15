import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_MANIFEST,
  DEFAULT_MANIFEST_URL,
  BRAND_ORIGIN,
  TRUSTED_KEYS,
  base64urlDecode,
  parseManifest,
  resolveRemote,
  startLive,
  type RemoteConfig,
} from '../src/core/index.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const b64u = (b: ArrayBuffer | Uint8Array): string => Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString('base64url');

async function makeKey() {
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  return { pair, trusted: { kid: 'k1', publicKey: b64u(await crypto.subtle.exportKey('raw', pair.publicKey)) } };
}
async function envelope(k: Awaited<ReturnType<typeof makeKey>>, manifest: unknown) {
  const payload = new TextEncoder().encode(JSON.stringify(manifest));
  return { kid: 'k1', payload: b64u(payload), signature: b64u(await crypto.subtle.sign({ name: 'Ed25519' }, k.pair.privateKey, payload)) };
}
const json = (body: unknown): Response =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

test('zero runtime dependencies: nothing in package.json, nothing imported by the core', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { dependencies?: object };
  assert.equal(pkg.dependencies, undefined);
  for (const f of ['src/core/schema.ts', 'src/core/remote.ts', 'src/core/live.ts']) {
    assert.ok(!/from 'zod'|require\('zod'\)/.test(readFileSync(join(root, f), 'utf8')), f);
  }
});

test('live is ON by default for the brand channel, but only when keys are embedded; explicit remote wins; live=false is zero requests', () => {
  const keys = [{ kid: 'a', publicKey: 'x'.repeat(43) }];
  assert.deepEqual(resolveRemote({}, keys, 'https://b.example/v2/manifest.json'), { url: 'https://b.example/v2/manifest.json', keys });
  assert.equal(resolveRemote({ live: false }, keys), undefined);
  assert.equal(resolveRemote({}, []), undefined, 'no embedded keys => nothing to verify against => no request');
  const mine: RemoteConfig = { url: 'https://mine.example/m.json', keys: [] };
  assert.equal(resolveRemote({ remote: mine, live: false }, keys), mine);
  assert.equal(DEFAULT_MANIFEST_URL, `${BRAND_ORIGIN}/v2/manifest.json`);
});

test('embedded trusted keys are well-formed (<= 2, 32-byte Ed25519 public keys)', () => {
  assert.ok(TRUSTED_KEYS.length <= 2);
  for (const k of TRUSTED_KEYS) assert.equal(base64urlDecode(k.publicKey)?.length, 32);
});

test('manifest v2: descriptor and logo hashes are validated; bad ones fall back with warnings; unknown ids are ignored', () => {
  const id = Object.keys(DEFAULT_MANIFEST.assets.logo)[0]!;
  const good = 'a'.repeat(64);
  const base = { schemaVersion: 2, revision: 9, issuedAt: '2026-11-13T00:00:00Z' };
  const ok = parseManifest({ ...base, tokens: { descriptor: 'servers and more' }, assets: { logo: { [id]: good } } });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.manifest.tokens.descriptor, 'servers and more');
    assert.equal(ok.manifest.assets.logo[id], good);
  }
  const bad = parseManifest({ ...base, tokens: { descriptor: 'x‮y' }, assets: { logo: { [id]: 'NOTHEX', nope: good } } });
  assert.ok(bad.ok);
  if (bad.ok) {
    assert.deepEqual(bad.warnings.map((w) => w.code).sort(), ['invalid-asset', 'invalid-descriptor', 'unknown-key']);
    assert.equal(bad.manifest.assets.logo[id], DEFAULT_MANIFEST.assets.logo[id]);
  }
  assert.ok(parseManifest({ ...base, schemaVersion: 1 }).ok, 'v1 manifests still parse');
  assert.ok(!parseManifest({ ...base, schemaVersion: 3 }).ok);
});

test('startLive applies a verified update, reports tampering, and stop() restores the baked values', async () => {
  const k = await makeKey();
  const m = { schemaVersion: 2, revision: 5, issuedAt: '2026-11-13T00:00:00Z', tokens: { palette: { cyan: '#009AB4' } } };
  const set = new Map<string, string>();
  const target = {
    style: {
      setProperty: (n: string, v: string): void => void set.set(n, v),
      removeProperty: (n: string): string => (set.delete(n), ''),
    },
  };
  const seen: number[] = [];
  const h = startLive(
    { url: 'https://b.example/m.json', keys: [k.trusted], minRevision: 1, fetch: async () => json(await envelope(k, m)) },
    { target, onManifest: (x) => seen.push(x.revision) },
  );
  const r = await h.done;
  assert.ok(r?.ok);
  assert.equal(set.get('--hd-cyan'), '#009AB4');
  assert.deepEqual(seen, [5]);
  h.stop();
  assert.equal(set.size, 0, 'stop() removes what was applied');

  const issues: string[] = [];
  const evil = { ...(await envelope(k, m)), payload: b64u(new TextEncoder().encode('{"x":1}')) };
  const h2 = startLive(
    { url: 'https://b.example/m.json', keys: [k.trusted], fetch: async () => json(evil) },
    { target, onIssue: (i) => issues.push(i.kind === 'remote-failed' ? i.reason : 'warnings') },
  );
  await h2.done;
  assert.deepEqual(issues, ['bad-signature']);
  assert.equal(set.size, 0);
  assert.equal(await startLive(undefined).done, undefined);
});
