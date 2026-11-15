// Derives every published logo asset from the masters in brand/logo/source (hash-verified against logo.json).
// Output: dist/logo/*  (also what the hosted channel serves at /v2/logo/). Deterministic; no network.
//   <id>.png / <id>.webp               wordmarks, trimmed to the artwork at native size (masters are 500 px: never upscaled)
//   <id>-{64,128,256,512,1024}.png|webp  icons (opaque tiles)
//   favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png (1200x630)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist/logo');
const doc = JSON.parse(readFileSync(join(root, 'brand/logo/logo.json'), 'utf8'));
const palette = JSON.parse(readFileSync(join(root, 'brand/tokens/color.tokens.json'), 'utf8')).color;
const ICON_SIZES = [64, 128, 256, 512, 1024];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const masters = new Map();
for (const v of doc.variants) {
  const buf = readFileSync(join(root, 'brand/logo', v.file));
  if (createHash('sha256').update(buf).digest('hex') !== v.sha256) {
    throw new Error(`build-logos: ${v.file} does not match logo.json (run: node scripts/logo-tool.mjs measure, then review the diff)`);
  }
  masters.set(v.id, buf);
}
const NOTICE_TEXT = `${doc.notice}`;
const exif = { IFD0: { Copyright: doc.notice, ImageDescription: 'HexaData logo (trademark of Esconet Technologies Limited)' } };
const save = (name, pipeline) => pipeline.withExif(exif).toFile(join(out, name));

for (const v of doc.variants) {
  const src = masters.get(v.id);
  if (v.form === 'icon') {
    for (const size of ICON_SIZES) {
      const img = () => sharp(src).resize(size, size, { kernel: 'lanczos3' });
      await save(`${v.id}-${size}.png`, img().png({ compressionLevel: 9 }));
      if (size >= 128) await save(`${v.id}-${size}.webp`, img().webp({ quality: 92, effort: 6 }));
    }
  } else {
    const { left, top, width, height } = v.trim;
    const img = () => sharp(src).extract({ left, top, width, height });
    await save(`${v.id}.png`, img().png({ compressionLevel: 9 }));
    await save(`${v.id}.webp`, img().webp({ lossless: true, effort: 6 }));
  }
}

// Favicon/app icons come from the dark tile (navy), which reads on both light and dark browser chrome.
const tile = masters.get('icon-on-dark');
const square = (size) => sharp(tile).resize(size, size, { kernel: 'lanczos3' });
await save('favicon-32.png', square(32).png());
await save('apple-touch-icon.png', square(180).png());
await save('icon-192.png', square(192).png());
await save('icon-512.png', square(512).png());

// favicon.ico: PNG-compressed entries (supported by every current browser and by Windows Vista+).
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => square(s).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s;
  e[1] = s;
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
writeFileSync(join(out, 'favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));

// Social card: obsidian background (palette) with the on-dark centered lockup at native size.
const hex = palette.obsidian.$value.hex;
const lock = doc.variants.find((v) => v.id === 'centered-primary-on-dark');
const art = await sharp(masters.get(lock.id)).extract(lock.trim).png().toBuffer();
await save(
  'og-image.png',
  sharp({ create: { width: 1200, height: 630, channels: 3, background: hex } })
    .composite([{ input: art, left: Math.round((1200 - lock.trim.width) / 2), top: Math.round((630 - lock.trim.height) / 2) }])
    .png({ compressionLevel: 9 }),
);

writeFileSync(join(out, 'NOTICE.txt'), `${NOTICE_TEXT}\n`);
console.log(`build-logos: ok (${doc.variants.length} masters)`);
