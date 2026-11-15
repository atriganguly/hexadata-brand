import { test } from 'node:test';
import assert from 'node:assert/strict';
import { base64urlDecode, fetchSignedManifest, type RemoteManifestOptions, type TrustedKey } from '../src/core/index.ts';

const enc = new TextEncoder();
const b64u = (b: Uint8Array | ArrayBuffer): string => Buffer.from(b instanceof ArrayBuffer ? new Uint8Array(b) : b).toString('base64url');

async function makeKey(kid: string) {
  const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const raw = await crypto.subtle.exportKey('raw', pair.publicKey);
  const trusted: TrustedKey = { kid, publicKey: b64u(raw) };
  return {
    trusted,
    sign: async (bytes: Uint8Array) => b64u(await crypto.subtle.sign({ name: 'Ed25519' }, pair.privateKey, bytes as BufferSource)),
  };
}

const manifest = (over: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  revision: 2,
  issuedAt: '2026-11-13T00:00:00Z',
  tokens: { palette: { cyan: '#009AB4' }, taglines: { primary: 'Updated tagline.' } },
  ...over,
});

async function envelope(key: Awaited<ReturnType<typeof makeKey>>, payloadObj: unknown, kid = key.trusted.kid) {
  const payloadBytes = enc.encode(JSON.stringify(payloadObj));
  return { kid, payload: b64u(payloadBytes), signature: await key.sign(payloadBytes) };
}

const jsonResponse = (body: unknown, init: ResponseInit & { url?: string } = {}) => {
  const res = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (init.url) Object.defineProperty(res, 'url', { value: init.url });
  return res;
};
const URL_OK = 'https://brand.example.com/manifest.json';
const run = (over: Partial<RemoteManifestOptions> & Pick<RemoteManifestOptions, 'keys'>) => fetchSignedManifest({ url: URL_OK, ...over });

test('base64url decoder: round-trips and rejects malformed input', () => {
  const bytes = crypto.getRandomValues(new Uint8Array(64));
  assert.deepEqual(Array.from(base64urlDecode(b64u(bytes))!), Array.from(bytes));
  for (const bad of ['a', 'ab=c', 'ab+/', 'ab c', 'abcde']) assert.equal(base64urlDecode(bad), null, bad);
  assert.deepEqual(Array.from(base64urlDecode('')!), []);
});

test('happy path: signed manifest is verified, parsed and returned', async () => {
  const key = await makeKey('k1');
  const env = await envelope(key, manifest());
  const r = await run({ keys: [key.trusted], fetch: async () => jsonResponse(env) });
  assert.ok(r.ok, JSON.stringify(r));
  if (r.ok) {
    assert.equal(r.manifest.revision, 2);
    assert.equal(r.manifest.tokens.palette.cyan, '#009AB4');
    assert.equal(r.manifest.tokens.taglines.primary, 'Updated tagline.');
  }
});

test('request is privacy-hardened: no credentials, no referrer, no custom headers, https', async () => {
  const key = await makeKey('k1');
  let seen: { url: string; init: RequestInit } | undefined;
  await run({
    keys: [key.trusted],
    fetch: async (url, init) => {
      seen = { url: String(url), init: init ?? {} };
      return jsonResponse(await envelope(key, manifest()));
    },
  });
  assert.ok(seen);
  assert.equal(seen.url, URL_OK);
  assert.equal(seen.init.credentials, 'omit');
  assert.equal(seen.init.referrerPolicy, 'no-referrer');
  assert.equal(seen.init.method, 'GET');
  assert.deepEqual(Object.keys(seen.init.headers as Record<string, string>), ['accept']);
});

test('tampered payload is rejected', async () => {
  const key = await makeKey('k1');
  const env = await envelope(key, manifest());
  const tampered = { ...env, payload: b64u(enc.encode(JSON.stringify(manifest({ tokens: { taglines: { primary: 'Pwned' } } })))) };
  const r = await run({ keys: [key.trusted], fetch: async () => jsonResponse(tampered) });
  assert.deepEqual([r.ok, !r.ok && r.reason], [false, 'bad-signature']);
});

test('signature from a different key is rejected', async () => {
  const good = await makeKey('k1');
  const attacker = await makeKey('k1'); // same kid, different key
  const r = await run({ keys: [good.trusted], fetch: async () => jsonResponse(await envelope(attacker, manifest())) });
  assert.deepEqual([r.ok, !r.ok && r.reason], [false, 'bad-signature']);
});

test('unknown kid is rejected; key rotation (second trusted key) works', async () => {
  const k1 = await makeKey('2026-01');
  const k2 = await makeKey('2026-11');
  const env = await envelope(k2, manifest());
  const unknown = await run({ keys: [k1.trusted], fetch: async () => jsonResponse(env) });
  assert.deepEqual([unknown.ok, !unknown.ok && unknown.reason], [false, 'unknown-kid']);
  const rotated = await run({ keys: [k1.trusted, k2.trusted], fetch: async () => jsonResponse(env) });
  assert.ok(rotated.ok);
});

test('transport guards: http, credentials-in-URL, garbage URL, non-https redirect', async () => {
  const key = await makeKey('k1');
  const never = async () => {
    throw new Error('must not fetch');
  };
  for (const [url, reason] of [
    ['http://brand.example.com/m.json', 'insecure-url'],
    ['https://u:p@brand.example.com/m.json', 'invalid-url'],
    ['not a url', 'invalid-url'],
    ['javascript:alert(1)', 'insecure-url'],
    ['data:application/json,{}', 'insecure-url'],
  ] as const) {
    const r = await fetchSignedManifest({ url, keys: [key.trusted], fetch: never });
    assert.deepEqual([r.ok, !r.ok && r.reason], [false, reason], url);
  }
  const redirected = await run({
    keys: [key.trusted],
    fetch: async () => jsonResponse(await envelope(key, manifest()), { url: 'http://evil.example/m.json' }),
  });
  assert.deepEqual([redirected.ok, !redirected.ok && redirected.reason], [false, 'insecure-url']);
});

test('HTTP status, content-type and size limits', async () => {
  const key = await makeKey('k1');
  const env = await envelope(key, manifest());
  const s500 = await run({ keys: [key.trusted], fetch: async () => jsonResponse(env, { status: 500 }) });
  assert.deepEqual([s500.ok, !s500.ok && s500.reason], [false, 'http-status']);
  const html = await run({ keys: [key.trusted], fetch: async () => jsonResponse(env, { headers: { 'content-type': 'text/html' } }) });
  assert.deepEqual([html.ok, !html.ok && html.reason], [false, 'bad-content-type']);
  const none = await run({ keys: [key.trusted], fetch: async () => new Response(JSON.stringify(env)) });
  assert.ok(!none.ok); // text/plain default
  const big = await run({ keys: [key.trusted], maxBytes: 100, fetch: async () => jsonResponse(env) });
  assert.deepEqual([big.ok, !big.ok && big.reason], [false, 'too-large']);
  const declared = await run({
    keys: [key.trusted],
    fetch: async () => jsonResponse(env, { headers: { 'content-type': 'application/json', 'content-length': '99999999' } }),
  });
  assert.deepEqual([declared.ok, !declared.ok && declared.reason], [false, 'too-large']);
});

test('a huge streamed body is cut off, not buffered', async () => {
  const key = await makeKey('k1');
  let pulled = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulled += 1;
      controller.enqueue(new Uint8Array(4096));
      if (pulled > 1000) controller.close();
    },
  });
  const r = await run({
    keys: [key.trusted],
    maxBytes: 8192,
    fetch: async () => new Response(stream, { headers: { 'content-type': 'application/json' } }),
  });
  assert.deepEqual([r.ok, !r.ok && r.reason], [false, 'too-large']);
  assert.ok(pulled < 20, `read ${pulled} chunks before stopping`);
});

test('malformed envelopes', async () => {
  const key = await makeKey('k1');
  const env = await envelope(key, manifest());
  const bodies: unknown[] = [
    'not json',
    '[]',
    {},
    { ...env, payload: '***' },
    { ...env, signature: 'AAAA' },
    { ...env, kid: '' },
    { ...env, payload: 'x'.repeat(40000) },
  ];
  for (const b of bodies) {
    const r = await run({ keys: [key.trusted], fetch: async () => jsonResponse(b) });
    assert.equal(r.ok, false, JSON.stringify(b).slice(0, 40));
  }
});

test('signed but invalid content is still rejected (expiry, rollback, contrast, schema)', async () => {
  const key = await makeKey('k1');
  const now = () => Date.parse('2026-12-01T00:00:00Z');
  const cases: [Record<string, unknown>, string, number?][] = [
    [manifest({ expiresAt: '2026-11-30T00:00:00Z' }), 'expired'],
    [manifest({ revision: 1 }), 'rollback', 5],
    [manifest({ tokens: { palette: { copper: '#3A2A00' } } }), 'contrast'],
    [manifest({ schemaVersion: 9 }), 'schema'],
  ];
  for (const [m, reason, minRevision] of cases) {
    const r = await run({
      keys: [key.trusted],
      now,
      ...(minRevision !== undefined ? { minRevision } : {}),
      fetch: async () => jsonResponse(await envelope(key, m)),
    });
    assert.deepEqual([r.ok, !r.ok && r.reason], [false, reason], reason);
  }
});

test('timeout and caller abort are distinguished and clean up', async () => {
  const key = await makeKey('k1');
  const hang = (_: unknown, init?: RequestInit) =>
    new Promise<Response>((_res, rej) => {
      const abort = () => rej(new DOMException('aborted', 'AbortError'));
      if (init?.signal?.aborted) abort();
      else init?.signal?.addEventListener('abort', abort);
    });
  const t = await run({ keys: [key.trusted], timeoutMs: 20, fetch: hang as typeof fetch });
  assert.deepEqual([t.ok, !t.ok && t.reason], [false, 'timeout']);
  const ac = new AbortController();
  const p = run({ keys: [key.trusted], timeoutMs: 5000, signal: ac.signal, fetch: hang as typeof fetch });
  ac.abort();
  const a = await p;
  assert.deepEqual([a.ok, !a.ok && a.reason], [false, 'aborted']);
  const pre = new AbortController();
  pre.abort();
  let fetched = false;
  const b = await run({
    keys: [key.trusted],
    signal: pre.signal,
    fetch: (async () => {
      fetched = true;
      return jsonResponse({});
    }) as typeof fetch,
  });
  assert.equal(fetched, false, 'an already-aborted signal must not start a request');
  assert.deepEqual([b.ok, !b.ok && b.reason], [false, 'aborted']);
});

test('network error and missing verifier fail closed to a reason (never throw)', async () => {
  const key = await makeKey('k1');
  const net = await run({
    keys: [key.trusted],
    fetch: async () => {
      throw new TypeError('offline');
    },
  });
  assert.deepEqual([net.ok, !net.ok && net.reason], [false, 'network']);
  const env = await envelope(key, manifest());
  const { VerifierUnavailableError } = await import('../src/core/index.ts');
  const nv = await run({
    keys: [key.trusted],
    fetch: async () => jsonResponse(env),
    verify: async () => {
      throw new VerifierUnavailableError('no crypto');
    },
  });
  assert.deepEqual([nv.ok, !nv.ok && nv.reason], [false, 'no-verifier']);
  const crashing = await run({
    keys: [key.trusted],
    fetch: async () => jsonResponse(env),
    verify: async () => {
      throw new Error('boom');
    },
  });
  assert.deepEqual([crashing.ok, !crashing.ok && crashing.reason], [false, 'bad-signature']);
});

test('custom verifier (React Native path) is used when provided', async () => {
  const key = await makeKey('k1');
  const env = await envelope(key, manifest());
  let called = false;
  const r = await run({
    keys: [key.trusted],
    fetch: async () => jsonResponse(env),
    verify: async () => {
      called = true;
      return true;
    },
  });
  assert.ok(r.ok && called);
});
