import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (file: string, env: Record<string, string> = {}) =>
  spawnSync(process.execPath, ['.claude/hooks/guard.mjs'], {
    cwd: root,
    encoding: 'utf8',
    input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: file } }),
    env: { ...process.env, HEXA_ALLOW_PROTECTED: '', CLAUDE_PROJECT_DIR: root, ...env },
  });

test('the agent guard blocks generated files, keys, licences, masters and build output; allows normal source', () => {
  for (const blocked of [
    'src/core/tokens.ts',
    'src/css/hexadata.css',
    'platforms/flutter/lib/src/tokens.dart',
    'brand/keys.json',
    'LICENSE',
    'BRAND-LICENSE.md',
    'brand/logo/source/icon-on-dark.png',
    'brand/fonts/ttf/SpaceGrotesk-Bold.ttf',
    'brand/kit/HexaData-Brand-Kit-v2.0.pdf',
    'dist/core/index.js',
    'secrets/anything.jwk',
  ]) {
    const r = run(blocked);
    assert.equal(r.status, 2, `${blocked} should be blocked: ${r.stderr}`);
  }
  for (const allowed of ['brand/tokens/color.tokens.json', 'src/core/remote.ts', 'site/catalogue.mjs', 'AGENTS.md']) {
    assert.equal(run(allowed).status, 0, `${allowed} should be allowed`);
  }
  assert.equal(run('LICENSE', { HEXA_ALLOW_PROTECTED: '1' }).status, 0, 'explicit owner override');
});

test('the guard never blocks on malformed input', () => {
  const r = spawnSync(process.execPath, ['.claude/hooks/guard.mjs'], { cwd: root, input: 'not json', encoding: 'utf8' });
  assert.equal(r.status, 0);
});
