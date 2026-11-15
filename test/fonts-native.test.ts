import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FONTS } from '../src/core/index.ts';
import { NATIVE_FONTS } from '../src/native/index.tsx';

const root = fileURLToPath(new URL('..', import.meta.url));
const doc = JSON.parse(readFileSync(new URL('../brand/fonts/fonts.json', import.meta.url), 'utf8')) as {
  files: { role: 'display' | 'body' | 'mono'; family: string; weight: number; postScriptName: string }[];
};

test('official TTFs match fonts.json, are static, and are the faces they claim (family, weight, PostScript name)', () => {
  const out = execFileSync(process.execPath, ['scripts/font-tool.mjs', 'check'], { cwd: root, encoding: 'utf8' });
  assert.match(out, /fonts: ok/);
});

test('the shipped static fonts are exactly the PostScript names the React Native theme refers to', () => {
  const shipped = doc.files.map((f) => f.postScriptName).sort();
  const referenced = Object.values(NATIVE_FONTS)
    .flatMap((role) => Object.values(role))
    .sort();
  assert.deepEqual(shipped, referenced);
});

test('families and weights match the Brand Kit typography tokens', () => {
  for (const role of ['display', 'body', 'mono'] as const) {
    const files = doc.files.filter((f) => f.role === role);
    assert.ok(files.every((f) => f.family === FONTS[role].family));
    assert.deepEqual(files.map((f) => f.weight).sort(), [...FONTS[role].weights].sort());
  }
});
