// Keeps claude-design-system/STATE.json honest: the Claude Design System artifact must be re-published whenever its generated content changes.
//   node scripts/claude-ds-state.mjs record   after publishing, record the fingerprint
//   node scripts/claude-ds-state.mjs check    fail if the repo changed since the last published fingerprint
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const statePath = join(root, 'claude-design-system/STATE.json');
const hash = execFileSync(process.execPath, [join(root, 'scripts/build-claude-ds.mjs'), '--hash'], { cwd: root, encoding: 'utf8' }).trim();
const mode = process.argv[2];
const state = JSON.parse(readFileSync(statePath, 'utf8'));

if (mode === 'record') {
  writeFileSync(statePath, `${JSON.stringify({ ...state, contentHash: hash }, null, 2)}\n`);
  console.log(`claude-ds: recorded ${hash}`);
} else if (mode === 'check') {
  if (state.contentHash !== hash) {
    console.error(
      `claude-ds: the Claude Design System is out of date (published ${state.contentHash || 'never'}, repo is ${hash}). Publish it (see claude-design-system/README.md), then: npm run claude-ds:record`,
    );
    process.exit(1);
  }
  console.log(`claude-ds: ok (${hash})`);
} else {
  console.error('usage: node scripts/claude-ds-state.mjs record|check');
  process.exit(2);
}
