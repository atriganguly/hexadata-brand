// Builds the website into a temp dir and checks it in real Chromium: every page loads, no console errors, no off-origin requests,
// no broken internal links or images, axe (WCAG 2.2 AA) clean in light AND dark, no horizontal scroll on a phone.
// Usage: node test/site.e2e.mjs   (needs: npm run build && build:fonts && build:logos)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { AxeBuilder } from '@axe-core/playwright';
import { serve } from '../scripts/lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const work = mkdtempSync(join(tmpdir(), 'hexa-site-'));
const run = (script, args) =>
  execFileSync(process.execPath, [join(root, script), ...args], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
run('scripts/build-channel.mjs', ['--out', join(work, 'channel')]);
run('site/build.mjs', ['--base', '/', '--out', join(work, 'site'), '--channel', join(work, 'channel')]);

const server = await serve(join(work, 'site'), 0);
const origin = `http://127.0.0.1:${server.port}`;
const sitemap = readFileSync(join(work, 'site/sitemap.xml'), 'utf8');
const paths = [...sitemap.matchAll(/<loc>[^<]*?\/hexadata-brand\/([^<]*)<\/loc>/g)].map((m) => `/${m[1]}`);
assert.ok(paths.length >= 14, `expected the full page list, got ${paths.length}`);

const browser = await chromium.launch();
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(['ok', name]);
  } catch (e) {
    results.push(['FAIL', name, e.message.split('\n').slice(0, 12).join('\n')]);
  }
};
const checked = new Map();

for (const scheme of ['light', 'dark']) {
  for (const path of [...paths, '/404.html']) {
    await check(`${path} (${scheme}): loads clean, axe WCAG 2.2 AA clean`, async () => {
      const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      const problems = [];
      page.on('console', (m) => {
        if (m.type() === 'error') problems.push(`console: ${m.text()}`);
      });
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
      page.on('response', (r) => {
        if (r.status() >= 400 && !r.url().endsWith('/manifest.json')) problems.push(`HTTP ${r.status()}: ${r.url()}`);
        // The ONLY allowed off-origin request is the brand's own signed manifest (live updates default ON); everything else must be same-origin.
        if (!r.url().startsWith(origin) && !r.url().endsWith('/v2/manifest.json')) problems.push(`off-origin: ${r.url()}`);
      });
      // Live updates are on by default; the local site has no signed manifest, which must fail silently (a malformed envelope is served here).
      await page.route('**/v2/manifest.json', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }),
      );
      const res = await page.goto(`${origin}${path}`);
      assert.ok(res && (res.ok() || path === '/404.html'), `status ${res?.status()}`);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // trigger lazy images
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => [...document.images].every((i) => getComputedStyle(i).display === 'none' || i.complete), null, {
        timeout: 15000,
      });
      const broken = await page.evaluate(() =>
        [...document.images].filter((i) => getComputedStyle(i).display !== 'none' && !(i.complete && i.naturalWidth > 0)).map((i) => i.src),
      );
      assert.deepEqual(broken, [], 'broken images');
      assert.deepEqual(problems, []);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      assert.deepEqual(
        axe.violations.map(
          (v) =>
            `${v.id}: ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.html.slice(0, 120)} :: ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`,
        ),
        [],
      );
      if (scheme === 'light') {
        const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
        for (const href of links) {
          if (!href || href.startsWith('#') || /^(https?:|mailto:)/.test(href)) continue;
          const url = new URL(href, `${origin}${path}`);
          if (url.origin === origin && !url.pathname.endsWith('/v2/manifest.json') && !checked.has(url.pathname))
            checked.set(
              url.pathname,
              fetch(url).then((r) => r.status),
            );
        }
      }
      await ctx.close();
    });
  }
}

await check('internal links all resolve', async () => {
  const bad = [];
  for (const [p, status] of checked) if ((await status) >= 400) bad.push(`${p} -> ${await status}`);
  assert.deepEqual(bad, []);
});

await check('phone width (375px): no horizontal scroll on any page', async () => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, isMobile: true });
  const page = await ctx.newPage();
  const wide = [];
  for (const path of paths) {
    await page.goto(`${origin}${path}`);
    await page.waitForLoadState('networkidle');
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) wide.push(`${path} (+${over}px)`);
  }
  assert.deepEqual(wide, []);
  await ctx.close();
});

await browser.close();
await server.close();
for (const r of results) console.log(r[0] === 'ok' ? '  ok  ' : '  FAIL', r[1], r[2] ? `\n${r[2]}` : '');
const failed = results.filter((r) => r[0] !== 'ok').length;
console.log(`site e2e: ${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
