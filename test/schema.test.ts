import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MANIFEST, DEFAULT_PALETTE, HexaManifestSchema, checkContrast, parseManifest } from '../src/core/index.ts';

const base = (tokens: unknown, extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  revision: 1,
  issuedAt: '2026-11-13T00:00:00Z',
  tokens,
  ...extra,
});
const ok = (r: ReturnType<typeof parseManifest>) => {
  assert.ok(r.ok, r.ok ? '' : `${r.reason}: ${r.detail}`);
  return r;
};

test('DEFAULT_MANIFEST is itself valid, strict and passes the contrast guard', () => {
  assert.ok(HexaManifestSchema.safeParse(DEFAULT_MANIFEST).success);
  assert.deepEqual(checkContrast(DEFAULT_PALETTE), []);
});

test('empty tokens resolve to brand defaults', () => {
  const r = ok(parseManifest(base({})));
  assert.deepEqual({ ...r.manifest.tokens.palette }, { ...DEFAULT_PALETTE });
});

test('valid override is applied and upper-cased', () => {
  const r = ok(parseManifest(base({ palette: { cyan: '#009AB4' } })));
  assert.equal(r.manifest.tokens.palette.cyan, '#009AB4');
  assert.equal(r.warnings.length, 0);
});

test('bad colours fall back per key with a warning (not all-or-nothing)', () => {
  const r = ok(
    parseManifest(
      base({ palette: { cyan: '#FFF', deepBlue: '#046AA7FF', green: 'white', copper: 'rgb(0,0,0)', crimson: 12, obsidian: '#121E37' } }),
    ),
  );
  assert.equal(r.manifest.tokens.palette.cyan, DEFAULT_PALETTE.cyan);
  assert.equal(r.manifest.tokens.palette.obsidian, '#121E37'); // the valid sibling still applied
  assert.equal(r.warnings.filter((w) => w.code === 'invalid-color').length, 5);
});

test('pure black / white are refused as tokens (Brand Kit v1.0)', () => {
  const r = ok(parseManifest(base({ palette: { white: '#ffffff', obsidian: '#000000' } })));
  assert.equal(r.manifest.tokens.palette.white, DEFAULT_PALETTE.white);
  assert.equal(r.manifest.tokens.palette.obsidian, DEFAULT_PALETTE.obsidian);
  assert.equal(r.warnings.filter((w) => w.code === 'forbidden-color').length, 2);
});

test('unknown keys are ignored with a warning, including prototype-pollution shaped keys', () => {
  const evil = JSON.parse(
    '{"palette":{"__proto__":"#112233","constructor":"#112233","teal":"#112233"},"taglines":{"__proto__":"x","tertiary":"x"}}',
  );
  const r = ok(parseManifest(base(evil)));
  // own '__proto__' keys are dropped outright (safe); the rest are reported.
  assert.equal(r.warnings.filter((w) => w.code === 'unknown-key').length, 3);
  assert.ok(!Object.hasOwn(r.manifest.tokens.palette, '__proto__'));
  assert.equal(({} as Record<string, unknown>).teal, undefined);
  assert.equal(Object.getPrototypeOf(r.manifest.tokens.palette), Object.prototype);
});

test('taglines: trimmed, bounded, and spoofing characters rejected', () => {
  const r = ok(parseManifest(base({ taglines: { primary: '  Hello  ', secondary: 'a\u202Eb' } })));
  assert.equal(r.manifest.tokens.taglines.primary, 'Hello');
  assert.equal(r.manifest.tokens.taglines.secondary, DEFAULT_MANIFEST.tokens.taglines.secondary);
  for (const bad of ['', '   ', 'x'.repeat(121), 'zero\u200Bwidth', 'nul\u0000', 'bom\uFEFF', 123, null, {}]) {
    const w = ok(parseManifest(base({ taglines: { primary: bad } }))).warnings;
    assert.equal(w[0]?.code, 'invalid-tagline', JSON.stringify(bad));
  }
  const big = ok(parseManifest(base({ taglines: { primary: 'x'.repeat(1e7) } })));
  assert.equal(big.manifest.tokens.taglines.primary, DEFAULT_MANIFEST.tokens.taglines.primary);
});

test('markup in a tagline is just data (rendered as text by React)', () => {
  const r = ok(parseManifest(base({ taglines: { primary: '<img src=x onerror=alert(1)>' } })));
  assert.equal(r.manifest.tokens.taglines.primary, '<img src=x onerror=alert(1)>');
});

test('a slightly different but compliant cyan passes the guard', () => {
  assert.ok(parseManifest(base({ palette: { cyan: '#009AB4' } })).ok);
});

test('contrast guard rejects a manifest that would break an allowed pair', () => {
  // Darken copper so obsidian text on copper fails.
  const r = parseManifest(base({ palette: { copper: '#3A2A00' } }));
  assert.ok(!r.ok && r.reason === 'contrast', JSON.stringify(r));
  assert.match((r as { detail: string }).detail, /copper/);
});

test('contrast guard rejects making obsidian/white too close', () => {
  const r = parseManifest(base({ palette: { obsidian: '#9AA5B8' } }));
  assert.ok(!r.ok && r.reason === 'contrast');
});

test('structural problems reject the whole manifest', () => {
  const cases: unknown[] = [
    null,
    undefined,
    'x',
    5,
    [],
    {},
    { schemaVersion: 2 },
    base({}, { schemaVersion: 'banana' }),
    base({}, { revision: -1 }),
    base({}, { revision: 1.5 }),
    base({}, { issuedAt: 'yesterday' }),
    base('nope'),
  ];
  for (const c of cases) {
    const r = parseManifest(c);
    assert.ok(!r.ok && r.reason === 'schema', JSON.stringify(c));
  }
});

test('too many keys is rejected (DoS bound)', () => {
  const palette = Object.fromEntries(Array.from({ length: 65 }, (_, i) => [`k${i}`, '#112233']));
  const r = parseManifest(base({ palette }));
  assert.ok(!r.ok && r.reason === 'schema');
});

test('expiry and rollback', () => {
  const now = Date.parse('2026-12-01T00:00:00Z');
  const expired = parseManifest(base({}, { expiresAt: '2026-11-30T00:00:00Z' }), { now });
  assert.ok(!expired.ok && expired.reason === 'expired');
  assert.ok(parseManifest(base({}, { expiresAt: '2026-12-02T00:00:00Z' }), { now }).ok);
  const old = parseManifest(base({}, { revision: 1 }), { minRevision: 5 });
  assert.ok(!old.ok && old.reason === 'rollback');
});

test('result is deeply frozen', () => {
  const r = ok(parseManifest(base({})));
  assert.ok(Object.isFrozen(r.manifest) && Object.isFrozen(r.manifest.tokens) && Object.isFrozen(r.manifest.tokens.palette));
});

test('parseManifest never throws, even on hostile objects', () => {
  const hostile: unknown[] = [
    Symbol.iterator,
    () => 1,
    new Proxy(
      {},
      {
        get() {
          throw new Error('boom');
        },
      },
    ),
    {
      get schemaVersion() {
        throw new Error('getter');
      },
    },
    {
      schemaVersion: 1,
      revision: 1,
      issuedAt: '2026-11-13T00:00:00Z',
      tokens: {
        get palette() {
          throw new Error('nested');
        },
      },
    },
  ];
  for (const h of hostile) {
    const r = parseManifest(h);
    assert.equal(r.ok, false);
  }
});
