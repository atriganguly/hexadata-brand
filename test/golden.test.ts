import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModel } from '../scripts/generate/model.ts';

/**
 * Two-key rule: a brand value can only change if brand/ AND test/golden/brand.golden.json change together.
 * An accidental or hallucinated edit to brand/ fails here. After a deliberate, human-approved change run
 * `UPDATE_GOLDEN=1 npm test` and review the golden diff in the same pull request.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const goldenPath = resolve(root, 'test/golden/brand.golden.json');

const m = loadModel(root);
const current = {
  palette: m.palette,
  taglines: m.taglines,
  fallbackColors: { black: m.fallbackColors.black, white: m.fallbackColors.white },
  fonts: Object.fromEntries(Object.entries(m.fonts).map(([k, f]) => [k, { family: f.family, weights: f.weights, stack: f.system }])),
  semantic: m.semantic,
};

test('brand/ matches the golden snapshot (two-key rule)', () => {
  if (process.env['UPDATE_GOLDEN'] === '1') mkdirSync(dirname(goldenPath), { recursive: true });
  if (process.env['UPDATE_GOLDEN'] === '1') writeFileSync(goldenPath, `${JSON.stringify(current, null, 2)}\n`);
  const golden: unknown = JSON.parse(readFileSync(goldenPath, 'utf8'));
  assert.deepEqual(
    current,
    golden,
    'brand/ changed without the golden file. If this is an approved brand change, run: UPDATE_GOLDEN=1 npm test',
  );
});
