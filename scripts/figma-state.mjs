// Keeps figma/STATE.json honest: the Figma library must be re-synced whenever the generated payload changes.
//   node scripts/figma-state.mjs record   after a successful sync, record the payload fingerprint
//   node scripts/figma-state.mjs check    fail if the brand changed since the last recorded sync
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const payload = JSON.parse(readFileSync(join(root, 'figma/sync-payload.json'), 'utf8'));
// The package version alone must not force a re-sync: fingerprint only the visual content.
const visual = { ...payload };
delete visual.$generated;
delete visual.version;
const hash = createHash('sha256').update(JSON.stringify(visual)).digest('hex').slice(0, 16);
const statePath = join(root, 'figma/STATE.json');
const mode = process.argv[2];

if (mode === 'record') {
  const prev = JSON.parse(readFileSync(statePath, 'utf8'));
  writeFileSync(statePath, `${JSON.stringify({ ...prev, syncedRevision: payload.revision, payloadHash: hash }, null, 2)}\n`);
  console.log(`figma: recorded revision ${payload.revision}, payload ${hash}`);
} else if (mode === 'check') {
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  if (state.payloadHash !== hash) {
    console.error(
      `figma: the Figma library is out of sync (recorded ${state.payloadHash}, brand is ${hash}). Re-sync (see figma/README.md) then run: node scripts/figma-state.mjs record`,
    );
    process.exit(1);
  }
  console.log(`figma: ok (revision ${state.syncedRevision}, payload ${hash})`);
} else {
  console.error('usage: node scripts/figma-state.mjs record|check');
  process.exit(2);
}
