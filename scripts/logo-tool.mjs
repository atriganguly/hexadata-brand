// Keeps brand/logo/logo.json honest about the master files.
//   node scripts/logo-tool.mjs measure   rewrite sha256, size and trim box from the masters (run after replacing a master)
//   node scripts/logo-tool.mjs check     fail if logo.json does not match the masters (used by tests and CI)
// The trim box is the opaque bounding box: masters carry transparent padding, components render the trimmed art.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'brand/logo/logo.json');
const mode = process.argv[2];
if (mode !== 'measure' && mode !== 'check') {
  console.error('usage: node scripts/logo-tool.mjs measure|check');
  process.exit(2);
}

async function measure(v) {
  const buf = readFileSync(join(root, 'brand/logo', v.file));
  const meta = await sharp(buf).metadata();
  let trim = { left: 0, top: 0, width: meta.width, height: meta.height };
  if (!v.opaque) {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let [minX, minY, maxX, maxY] = [info.width, info.height, -1, -1];
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++)
        if (data[(y * info.width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
    trim = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  }
  return { sha256: createHash('sha256').update(buf).digest('hex'), width: meta.width, height: meta.height, trim };
}

const doc = JSON.parse(readFileSync(jsonPath, 'utf8'));
let bad = 0;
for (const v of doc.variants) {
  const m = await measure(v);
  if (mode === 'measure') Object.assign(v, m);
  else if (JSON.stringify([v.sha256, v.width, v.height, v.trim]) !== JSON.stringify([m.sha256, m.width, m.height, m.trim])) {
    console.error(`logo.json is stale for ${v.id} (run: node scripts/logo-tool.mjs measure)`);
    bad++;
  }
}
if (mode === 'measure') {
  writeFileSync(jsonPath, `${JSON.stringify(doc, null, 2)}\n`);
  for (const v of doc.variants) console.log(`${v.id}: ${v.width}x${v.height}, art ${v.trim.width}x${v.trim.height}`);
} else if (bad) process.exit(1);
else console.log('logo: ok');
