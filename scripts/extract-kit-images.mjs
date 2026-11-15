// One-off provenance tool: extracts every image (with its alpha mask) from a Brand Kit PDF as RGBA PNGs.
// Usage: node scripts/extract-kit-images.mjs <kit.pdf> <outDir>
// Handles exactly what Adobe Express wrote into Brand Kit v1.0: DCTDecode RGB images with a FlateDecode DeviceGray /SMask.
// It never executes anything from the PDF; it only reads image streams.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import sharp from 'sharp';

const [pdfPath, outDir] = process.argv.slice(2);
if (!pdfPath || !outDir) {
  console.error('usage: node scripts/extract-kit-images.mjs <kit.pdf> <outDir>');
  process.exit(2);
}
const pdf = readFileSync(resolve(pdfPath));
const text = pdf.toString('latin1'); // 1 char = 1 byte, so string offsets are byte offsets
mkdirSync(resolve(outDir), { recursive: true });

const objRe = /(\d+) 0 obj\s*<<((?:(?!endobj)[\s\S])*?)>>\s*stream\r?\n/g;
const images = new Map();
for (let m = objRe.exec(text); m; m = objRe.exec(text)) {
  const dict = m[2];
  if (!/\/Subtype\s*\/Image/.test(dict)) continue;
  const len = Number(/\/Length (\d+)/.exec(dict)?.[1]);
  const start = m.index + m[0].length;
  images.set(Number(m[1]), {
    dict,
    width: Number(/\/Width (\d+)/.exec(dict)[1]),
    height: Number(/\/Height (\d+)/.exec(dict)[1]),
    filter: /\/Filter\s*\/(\w+)/.exec(dict)?.[1],
    smask: Number(/\/SMask (\d+) 0 R/.exec(dict)?.[1]) || undefined,
    data: pdf.subarray(start, start + len),
  });
}

const report = [];
for (const [id, img] of images) {
  if (img.filter !== 'DCTDecode') continue; // masks are consumed through their parent
  const { width, height } = img;
  const rgb = await sharp(img.data).removeAlpha().raw().toBuffer();
  if (rgb.length !== width * height * 3) throw new Error(`obj ${id}: unexpected JPEG layout`);
  let rgba = rgb;
  const mask = img.smask ? images.get(img.smask) : undefined;
  if (mask) {
    if (mask.filter !== 'FlateDecode' || mask.width !== width || mask.height !== height) throw new Error(`obj ${id}: unsupported SMask`);
    const alpha = inflateSync(mask.data);
    if (alpha.length !== width * height) throw new Error(`obj ${id}: SMask size mismatch`);
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = rgb[i * 3];
      rgba[i * 4 + 1] = rgb[i * 3 + 1];
      rgba[i * 4 + 2] = rgb[i * 3 + 2];
      rgba[i * 4 + 3] = alpha[i];
    }
  }
  const pipeline = sharp(rgba, { raw: { width, height, channels: mask ? 4 : 3 } });
  const file = join(resolve(outDir), `obj-${String(id).padStart(3, '0')}-${width}x${height}.png`);
  await pipeline.png().toFile(file);
  report.push({ object: id, width, height, alpha: Boolean(mask), file });
}
writeFileSync(join(resolve(outDir), 'index.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`extracted ${report.length} images`);
for (const r of report) console.log(`  obj ${r.object}: ${r.width}x${r.height} alpha=${r.alpha}`);
