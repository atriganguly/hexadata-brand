import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as core from '../src/core/index.ts';
import * as react from '../src/react/index.ts';
import * as native from '../src/native/index.tsx';

/**
 * Names are the API; values are data. This snapshot only ever GROWS within a major version:
 * removing or renaming any public name fails here. Adding a name is allowed, then recorded with
 * `UPDATE_CONTRACT=1 npm test` (which writes the union, never dropping a name).
 * A deliberate removal is a major version bump: delete the snapshot entry in that PR.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'test/contract/public-api.json');
const read = (rel: string): string => readFileSync(resolve(root, rel), 'utf8');
const matches = (text: string, re: RegExp): string[] => [...text.matchAll(re)].map((m) => m[1]!);

const preset = createRequire(import.meta.url)(resolve(root, 'src/tailwind/preset.cjs')) as {
  theme: { colors: { hd: Record<string, string> } };
};

const current: Record<string, string[]> = {
  'export:core': Object.keys(core).sort(),
  'export:react': Object.keys(react).sort(),
  'export:native': Object.keys(native).sort(),
  'css-variables': [...new Set(matches(read('src/css/hexadata.css'), /(--hd-[a-z0-9-]+)\s*:/g))].sort(),
  'tailwind-v4-theme': [...new Set(matches(read('src/tailwind/theme.css'), /(--(?:color|font)-[a-z0-9-*]+)\s*:/g))].sort(),
  'tailwind-v3-colors': Object.keys(preset.theme.colors.hd).sort(),
};

test('public API names are never removed or renamed within a major version', () => {
  let stored: Record<string, string[]> = {};
  try {
    stored = JSON.parse(readFileSync(file, 'utf8')) as Record<string, string[]>;
  } catch {
    // first run
  }
  if (process.env['UPDATE_CONTRACT'] === '1') {
    const union: Record<string, string[]> = {};
    for (const k of new Set([...Object.keys(stored), ...Object.keys(current)]))
      union[k] = [...new Set([...(stored[k] ?? []), ...(current[k] ?? [])])].sort();
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(union, null, 2)}\n`);
    stored = union;
  }
  assert.ok(Object.keys(stored).length > 0, 'contract snapshot missing: run UPDATE_CONTRACT=1 npm test');
  for (const [group, names] of Object.entries(stored)) {
    const have = new Set(current[group] ?? []);
    const missing = names.filter((n) => !have.has(n));
    assert.deepEqual(missing, [], `${group}: public names removed or renamed (breaking change; needs a major version)`);
  }
});
