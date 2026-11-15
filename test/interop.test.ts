import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { DEFAULT_PALETTE, PALETTE_KEYS } from '../src/core/index.ts';

/** brand/tokens must stay standard DTCG 2025.10: an independent implementation (Style Dictionary v5) must read it and agree with our palette. */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('brand/tokens parse under Style Dictionary v5 (DTCG) and resolve to the generated palette', async () => {
  const sd = new StyleDictionary({
    log: { verbosity: 'silent', warnings: 'disabled' },
    usesDtcg: true,
    source: [resolve(root, 'brand/tokens/*.tokens.json').replaceAll('\\', '/')],
    platforms: { css: { transformGroup: 'css', buildPath: 'build-unused/' } },
  });
  const all = await sd.getPlatformTokens('css');
  const tokens = all.allTokens;

  for (const key of PALETTE_KEYS) {
    const tok = tokens.find((t) => t.path.join('.') === `color.${key}`);
    assert.ok(tok, `color.${key} missing in Style Dictionary output`);
    assert.equal(String(tok.$value ?? tok.value).toLowerCase(), DEFAULT_PALETTE[key].toLowerCase(), `color.${key}`);
  }

  // Semantic aliases must resolve through to a palette colour in both modes.
  for (const mode of ['light', 'dark']) {
    const roles = tokens.filter((t) => t.path[0] === 'semantic' && t.path[1] === mode);
    assert.ok(roles.length >= 9, `${mode} roles`);
    for (const r of roles) assert.match(String(r.$value ?? r.value), /^#[0-9a-f]{6}$/i, `${r.path.join('.')} did not resolve to a hex`);
  }
});
