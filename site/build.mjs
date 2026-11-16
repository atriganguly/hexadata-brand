// Builds the static website into site-out/ (deployable to GitHub Pages as-is).
//   node site/build.mjs [--base /hexadata-brand/] [--out site-out] [--channel channel-out]
// Needs: npm run build && build:fonts && build:logos && build:channel. The site links the SAME /v2/ files it publishes,
// so it dogfoods the evergreen channel. No framework, no third-party requests, no client-side rendering.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from './lib/data.mjs';
import {
  notFound as notFoundPage,
  changelogPage,
  downloadsPage,
  exampleDashboard,
  exampleLanding,
  exampleSignIn,
  examplesIndex,
  legalPage,
  stacksPage,
} from './pages/more.mjs';
import { colourPage, home, logoPage } from './pages/brand.mjs';
import { foundationsPage, typographyPage, componentsPage } from './pages/system.mjs';
import { printKit } from './pages/print.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

const data = await loadData(root);
const pathname = new URL(data.origin).pathname.replace(/\/?$/, '/');
const base = opt('--base', pathname);
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('--base must start and end with "/"');
const out = resolve(root, opt('--out', 'site-out'));
const channel = resolve(root, opt('--channel', 'channel-out'));
if (!existsSync(join(channel, 'v2'))) throw new Error('site: channel-out/v2 is missing. Run: npm run build:channel');

const kitMinor = data.kit;
const pdfName = `HexaData-Brand-Kit-v${kitMinor}.pdf`;
const hasPdf = existsSync(join(root, 'brand/kit', pdfName));
const ctx = { data, base, pdf: hasPdf };

// Pages (public). Order = sitemap order.
const pages = [
  home,
  logoPage,
  colourPage,
  typographyPage,
  foundationsPage,
  componentsPage,
  examplesIndex,
  exampleLanding,
  exampleDashboard,
  exampleSignIn,
  stacksPage,
  downloadsPage,
  changelogPage,
  legalPage,
];
const rendered = pages.map((fn) => {
  const seen = [];
  const html = String(fn({ ...ctx, capture: seen }));
  return { path: seen[0].path, html };
});

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const publicPaths = [];
const write = (rel, content) => {
  mkdirSync(dirname(join(out, rel)), { recursive: true });
  writeFileSync(join(out, rel), content);
};

for (const r of rendered) {
  write(r.path === '' ? 'index.html' : `${r.path}index.html`, r.html);
  publicPaths.push(r.path);
}
write('404.html', String(notFoundPage(ctx)));

// Print route (used by scripts/build-pdf.mjs; not linked, not indexed)
const printSources = [logoPage, colourPage, typographyPage, foundationsPage, componentsPage, legalPage];
const printCaptured = [];
for (const fn of printSources) fn({ ...ctx, capture: printCaptured });
write('print/index.html', String(printKit(ctx, printCaptured)).replace('<head>', '<head>\n<meta name="robots" content="noindex">'));

// Assets: handwritten CSS + one generated class per token (so no inline styles are ever needed).
const T = data.foundations;
const gen = [
  ...data.paletteKeys.map((k) => `.sw-${k} { background: var(--hd-${data.kebab(k)}); }`),
  ...Object.keys(T.space)
    .filter((k) => k !== '0')
    .map((k) => `.site-bar--${k} { inline-size: var(--hd-space-${k}); }`),
  ...Object.keys(T.radius).map((k) => `.site-tile--r-${k} { border-radius: var(--hd-radius-${k}); }`),
  ...Object.keys(T.shadow).map((k) => `.site-tile--s-${k} { box-shadow: var(--hd-shadow-${k}); }`),
  ...Object.keys(T.fontSize).map((k) => `.site-size--${k} { font-size: var(--hd-font-size-${k}); }`),
  '.site-swatch__chip--on-dark .site-swatch__hint { background: var(--hd-bg); }',
].join('\n');
write(
  'site.css',
  `${readFileSync(join(root, 'site/assets/site.css'), 'utf8')}\n/* Generated from the brand tokens: do not edit. */\n${gen}\n`,
);
write('site.js', readFileSync(join(root, 'site/assets/site.js'), 'utf8'));
write('theme.js', readFileSync(join(root, 'site/assets/theme.js'), 'utf8'));
write(
  'site.webmanifest',
  `${JSON.stringify(
    {
      name: 'HexaData Brand',
      lang: 'en-IN',
      short_name: 'HexaData',
      start_url: base,
      display: 'browser',
      theme_color: data.palette.obsidian,
      background_color: data.palette.white,
      icons: [
        { src: `${base}v2/logo/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}v2/logo/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  )}\n`,
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: ${base}print/\n\nSitemap: ${data.origin}/sitemap.xml\n`);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map((p) => `  <url><loc>${data.origin}/${p}</loc></url>`).join('\n')}\n</urlset>\n`,
);
write('.nojekyll', '');
// RFC 9116 security.txt (expires in one year from the build)
const expires = new Date(Date.now() + 365 * 86_400_000).toISOString().replace(/\.\d+Z$/, 'Z');
write(
  '.well-known/security.txt',
  `Contact: https://github.com/atriganguly/hexadata-brand/security/advisories/new
Contact: mailto:atri.ganguly@esc.co.in
Expires: ${expires}
Preferred-Languages: en
Canonical: ${data.origin}/.well-known/security.txt
Policy: https://github.com/atriganguly/hexadata-brand/blob/main/SECURITY.md
`,
);

// Evergreen channel + immutable copy, and the guideline PDFs
for (const dir of ['v2', data.version]) cpSync(join(channel, dir), join(out, dir), { recursive: true });
mkdirSync(join(out, 'downloads'), { recursive: true });
// Only the current Brand Kit is published; earlier kits stay archived in the repository.
if (hasPdf) cpSync(join(root, 'brand/kit', pdfName), join(out, 'downloads', pdfName));

console.log(
  `site: ok (${publicPaths.length} pages + print + 404, base ${base}${hasPdf ? ', with PDF' : ', no v' + kitMinor + ' PDF yet'}) -> ${out}`,
);
