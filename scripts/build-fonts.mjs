// Self-hosts the brand fonts: copies pinned variable WOFF2 files + OFL licences out of node_modules
// (integrity-pinned by package-lock.json) and generates fonts.css and fonts-fallback.css.
// No network access at build or runtime. Fails loudly if anything is missing.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_FONTS, FALLBACK_BASES, computeOverrides, fallbackFaceCss, fontFaceCss, shapeError } from './lib/fonts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const out = join(root, 'dist/css');
mkdirSync(join(out, 'fonts'), { recursive: true });
mkdirSync(join(root, 'dist/licenses'), { recursive: true });

const die = (msg) => {
  console.error(`build-fonts: ${msg}`);
  process.exit(1);
};

let fontsCss = '/* Self-hosted brand fonts (SIL OFL 1.1). Served from your own origin: no third-party requests. */\n';
const copied = [];
for (const f of BRAND_FONTS) {
  let pkgDir;
  try {
    pkgDir = dirname(require.resolve(`@fontsource-variable/${f.slug}/package.json`));
  } catch {
    die(`@fontsource-variable/${f.slug} is not installed. Run npm ci.`);
  }
  for (const subset of ['latin', 'latin-ext']) {
    const file = `${f.slug}-${subset}-wght-normal.woff2`;
    const src = join(pkgDir, 'files', file);
    if (!existsSync(src))
      die(`${src} not found (fontsource file layout changed?). Found: ${readdirSync(join(pkgDir, 'files')).slice(0, 8).join(', ')}`);
    cpSync(src, join(out, 'fonts', file));
    copied.push(file);
    fontsCss += `\n${fontFaceCss({ family: f.family, weights: f.weights, file, subset })}`;
  }
  // The OFL text supplied with the official TTFs is authoritative for both the WOFF2 and the TTF builds.
  cpSync(join(root, `brand/fonts/licenses/${f.slug}-OFL.txt`), join(root, `dist/licenses/${f.slug}-OFL.txt`));
}
// Static TTFs (unmodified, hash-checked by font-tool) for React Native, Flutter, iOS/Android, Office and print.
execFileSync(process.execPath, [join(root, 'scripts/font-tool.mjs'), 'check'], { stdio: 'inherit' });
mkdirSync(join(root, 'dist/fonts/ttf'), { recursive: true });
const ttfs = JSON.parse(readFileSync(join(root, 'brand/fonts/fonts.json'), 'utf8')).files;
for (const t of ttfs) cpSync(join(root, 'brand/fonts', t.file), join(root, 'dist/fonts', t.file));
writeFileSync(join(out, 'fonts.css'), fontsCss);

// Metric-matched fallback faces (Capsize). The ranking is printed so maintainers can sanity-check the choice.
let fallbackCss = '/* Metric-adjusted system fallbacks: minimise layout shift while web fonts load. Generated. */\n';
try {
  const { fromFile } = await import('@capsizecss/unpack/fs');
  for (const f of BRAND_FONTS) {
    const pkgDir = dirname(require.resolve(`@fontsource-variable/${f.slug}/package.json`));
    const metrics = await fromFile(join(pkgDir, 'files', `${f.slug}-latin-wght-normal.woff2`));
    const base = FALLBACK_BASES[f.fallbackBase];
    const { default: baseMetrics } = await import(`@capsizecss/metrics/${f.fallbackBase}`);
    const o = computeOverrides(metrics, baseMetrics);
    console.log(
      `  ${f.family}: ${base.label} size-adjust ${(o.sizeAdjust * 100).toFixed(2)}%, shape error ${shapeError(metrics, baseMetrics).toFixed(3)}`,
    );
    fallbackCss += `\n${fallbackFaceCss({ family: f.family, locals: base.locals, overrides: o })}`;
  }
} catch (e) {
  die(`could not compute fallback metrics (${e.code ?? e.message}). Install @capsizecss/unpack and @capsizecss/metrics.`);
}
writeFileSync(join(out, 'fonts-fallback.css'), fallbackCss);
console.log(`build-fonts: ok (${copied.length} woff2 + ${ttfs.length} ttf)`);
