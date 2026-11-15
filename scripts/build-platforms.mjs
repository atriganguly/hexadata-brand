// Stages every non-web platform package into dist/platforms/<name>/ with the official fonts and logos copied in
// (binaries are never committed twice). Needs: npm run build:logos. Output is what release archives/wheels are built from.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist/platforms');
if (!existsSync(join(root, 'dist/logo'))) throw new Error('build-platforms: dist/logo is missing. Run: npm run build:logos');
rmSync(out, { recursive: true, force: true });

const fonts = JSON.parse(readFileSync(join(root, 'brand/fonts/fonts.json'), 'utf8')).files;
const logos = readdirSync(join(root, 'dist/logo')).filter((f) => /\.(png|ico)$/.test(f) || f === 'NOTICE.txt');
const copy = (from, to) => cpSync(join(root, from), join(out, to), { recursive: true });
const put = (list, fromDir, toDir, rename = (f) => f) => {
  mkdirSync(join(out, toDir), { recursive: true });
  for (const f of list) cpSync(join(root, fromDir, f), join(out, toDir, rename(f)));
};
const ttf = fonts.map((f) => f.file.replace('ttf/', ''));
const androidFont = (f) =>
  f
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace('-', '_')
    .toLowerCase();
const androidLogo = (f) => `hd_logo_${f.replace(/-/g, '_')}`;

for (const p of ['python', 'flutter', 'swift', 'android', 'office', 'email', 'print']) copy(`platforms/${p}`, p);
for (const dir of [
  'python/src/hexadata_brand/assets/fonts',
  'flutter/assets/fonts',
  'swift/Sources/HexaDataBrand/Resources',
  'office/fonts',
]) {
  put(ttf, 'brand/fonts/ttf', dir);
}
for (const dir of ['python/src/hexadata_brand/assets/logo', 'flutter/assets/logo', 'swift/Sources/HexaDataBrand/Resources']) {
  put(logos, 'dist/logo', dir);
}
put(ttf, 'brand/fonts/ttf', 'android/hexadata-brand/src/main/res/font', androidFont);
put(
  logos.filter((f) => f.endsWith('.png')),
  'dist/logo',
  'android/hexadata-brand/src/main/res/drawable-nodpi',
  androidLogo,
);
for (const p of ['python', 'flutter', 'swift', 'android']) cpSync(join(root, 'LICENSE'), join(out, p, 'LICENSE'));
for (const p of ['python', 'flutter', 'swift', 'android']) cpSync(join(root, 'BRAND-LICENSE.md'), join(out, p, 'BRAND-LICENSE.md'));
cpSync(join(root, 'brand/fonts/licenses'), join(out, 'office/fonts/licenses'), { recursive: true });
console.log(`build-platforms: ok -> ${out}`);
