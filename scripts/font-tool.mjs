// Keeps brand/fonts/fonts.json honest about the supplied official TTF files.
//   node scripts/font-tool.mjs measure   rewrite sha256 / identity from the files (run after replacing a font)
//   node scripts/font-tool.mjs check     fail if fonts.json does not match the files, or a file is not the face it claims to be
// Only the weights the Brand Kit uses (400/500/600/700, upright) are kept; fonts are shipped UNMODIFIED (SIL OFL 1.1).
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTtfInfo } from './lib/ttf.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'brand/fonts/fonts.json');
const mode = process.argv[2];
if (mode !== 'measure' && mode !== 'check') {
  console.error('usage: node scripts/font-tool.mjs measure|check');
  process.exit(2);
}

const FAMILIES = [
  { role: 'display', family: 'Space Grotesk', stem: 'SpaceGrotesk', slug: 'space-grotesk' },
  { role: 'body', family: 'Inter Tight', stem: 'InterTight', slug: 'inter-tight' },
  { role: 'mono', family: 'JetBrains Mono', stem: 'JetBrainsMono', slug: 'jetbrains-mono' },
];
const WEIGHTS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
const sha = (b) => createHash('sha256').update(b).digest('hex');

const files = [];
const problems = [];
for (const f of FAMILIES) {
  const license = readFileSync(join(root, `brand/fonts/licenses/${f.slug}-OFL.txt`));
  for (const [style, weight] of Object.entries(WEIGHTS)) {
    const file = `ttf/${f.stem}-${style}.ttf`;
    const buf = readFileSync(join(root, 'brand/fonts', file));
    const info = readTtfInfo(buf);
    if (info.family !== f.family) problems.push(`${file}: family is "${info.family}", expected "${f.family}"`);
    if (info.postScriptName !== `${f.stem}-${style}`) problems.push(`${file}: PostScript name is "${info.postScriptName}"`);
    if (info.weight !== weight) problems.push(`${file}: weight class ${info.weight}, expected ${weight}`);
    if (info.isVariable) problems.push(`${file}: is a variable font; native platforms need static files`);
    files.push({
      role: f.role,
      family: f.family,
      weight,
      file,
      postScriptName: info.postScriptName,
      version: info.version,
      sha256: sha(buf),
      license: `licenses/${f.slug}-OFL.txt`,
      licenseSha256: sha(license),
    });
  }
}

if (mode === 'measure') {
  writeFileSync(
    jsonPath,
    `${JSON.stringify({ $description: 'Official HexaData brand fonts (static TTF, upright 400/500/600/700), supplied by the HexaData Marketing owner on 2026-11-15 from Google Fonts. SIL Open Font License 1.1, shipped unmodified.', files }, null, 2)}\n`,
  );
  console.log(`font-tool: measured ${files.length} files`);
} else {
  const doc = JSON.parse(readFileSync(jsonPath, 'utf8'));
  if (JSON.stringify(doc.files) !== JSON.stringify(files))
    problems.push('fonts.json is stale (run: node scripts/font-tool.mjs measure, then review the diff)');
}
if (problems.length) {
  for (const p of problems) console.error(`  FAIL: ${p}`);
  process.exit(1);
}
if (mode === 'check') console.log('fonts: ok');
