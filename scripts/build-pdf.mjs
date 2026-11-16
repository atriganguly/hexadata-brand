// Brand Kit PDF, rendered from the website's print route (so the PDF and the site cannot drift).
//   node scripts/build-pdf.mjs            render brand/kit/HexaData-Brand-Kit-v<major.minor>.pdf (needs build, fonts, logos, channel)
//   node scripts/build-pdf.mjs --check    fail if the committed PDF does not carry the current brand fingerprint (no rendering needed)
// The PDF embeds `kit:` (major.minor), `revision:` and `tokens:` fingerprints in its Keywords metadata.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { tokenHash } from './lib/token-hash.mjs';
import { serve } from './lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const core = await import(pathToFileURL(join(root, 'dist/core/index.js')).href);
const minor = pkg.version.split('.').slice(0, 2).join('.'); // the public kit version: major.minor (chore releases never change the PDF)
const target = join(root, 'brand/kit', `HexaData-Brand-Kit-v${minor}.pdf`);
const fingerprint = [`kit:${minor}`, `revision:${core.BRAND_REVISION}`, `tokens:${tokenHash(core)}`];

if (process.argv.includes('--check')) {
  if (!existsSync(target)) {
    console.error(`pdf: ${target} is missing. Run: npm run build:pdf`);
    process.exit(1);
  }
  const doc = await PDFDocument.load(readFileSync(target));
  const have = (doc.getKeywords() ?? '').split(/[\s,;]+/).filter(Boolean);
  const stale = fingerprint.filter((f) => !have.includes(f));
  if (stale.length) {
    console.error(
      `pdf: the committed Brand Kit PDF is out of date (expected ${stale.join(', ')}; has ${have.join(', ') || 'nothing'}). Run: npm run build:pdf and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`pdf: ok (${doc.getPageCount()} pages, ${fingerprint.join(', ')})`);
  process.exit(0);
}

const { chromium } = await import('playwright');
const tmp = mkdtempSync(join(tmpdir(), 'hexa-pdf-'));
let server;
try {
  execFileSync(process.execPath, [join(root, 'site/build.mjs'), '--base', '/', '--out', tmp], { cwd: root, stdio: 'inherit' });
  server = await serve(tmp, 0);
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ colorScheme: 'light' })).newPage();
  await page.goto(`http://127.0.0.1:${server.port}/print/`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  const bytes = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;padding:0 14mm;font:8px sans-serif;color:#121E36;display:flex;justify-content:space-between"><span>HexaData Brand Kit v${minor} · Esconet Technologies Limited</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
  });
  await browser.close();

  const doc = await PDFDocument.load(bytes);
  doc.setTitle(`HexaData Brand Kit v${minor}`);
  doc.setAuthor('HexaData / Esconet Technologies Limited');
  doc.setSubject(`${core.DEFAULT_TAGLINES.primary} ${core.DEFAULT_TAGLINES.secondary}`);
  doc.setKeywords(fingerprint);
  doc.setLanguage('en-IN');
  doc.setCreator('HexaData brand build (site print route)');
  doc.setProducer('Chromium print + pdf-lib');
  const issued = new Date(core.BRAND_ISSUED_AT);
  doc.setCreationDate(issued);
  doc.setModificationDate(issued);
  writeFileSync(target, await doc.save());
  console.log(`pdf: ok (${doc.getPageCount()} pages) -> ${target}`);
} finally {
  await server?.close();
  rmSync(tmp, { recursive: true, force: true });
}
