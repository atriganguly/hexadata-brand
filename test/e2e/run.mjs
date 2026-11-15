// Real-browser verification of the BUILT package: strict CSP, zero third-party requests, no storage, signed update.
// Usage: node test/e2e/run.mjs   (needs `npm run build` first and Playwright + Chromium)
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const b64u = (b) => Buffer.from(b).toString('base64url');

// --- signing material -------------------------------------------------------
const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
const pub = b64u(await crypto.subtle.exportKey('raw', pair.publicKey));
const sign = async (obj) => {
  const payload = new TextEncoder().encode(JSON.stringify(obj));
  return { kid: 'e2e', payload: b64u(payload), signature: b64u(await crypto.subtle.sign({ name: 'Ed25519' }, pair.privateKey, payload)) };
};
const manifest = {
  schemaVersion: 1,
  revision: 2,
  issuedAt: '2026-11-13T00:00:00Z',
  tokens: { palette: { cyan: '#009AB4' }, taglines: { primary: 'Signed update applied.' } },
};
const good = await sign(manifest);
const tampered = {
  ...good,
  payload: b64u(new TextEncoder().encode(JSON.stringify({ ...manifest, tokens: { taglines: { primary: 'EVIL' } } }))),
};

// --- bundle the demo against dist (not src) --------------------------------
const out = mkdtempSync(join(tmpdir(), 'hexa-e2e-'));
await build({
  entryPoints: [join(root, 'test/e2e/demo.tsx')],
  outfile: join(out, 'demo.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  minify: true,
  logLevel: 'warning',
  define: { __KEY__: JSON.stringify(pub), 'process.env.NODE_ENV': '"production"' },
  alias: { '@hexadata/brand/react': join(root, 'dist/react/index.js') },
  absWorkingDir: root,
});
writeFileSync(
  join(out, 'index.html'),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>e2e</title><link rel="stylesheet" href="/hexadata.css"></head><body><div id="root"></div><script src="/demo.js"></script></body></html>',
);

const CSP =
  "default-src 'none'; script-src 'self'; style-src 'self'; connect-src https://brand.example.com; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const GALLERY = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>gallery</title><link rel="stylesheet" href="/all.css"></head><body>
<main class="hd-container hd-stack">
<h1 data-check>Supercomputing, On-demand.</h1><p data-check>Body text <a data-check href="#">link</a></p>
<p class="hd-muted" data-check>Muted</p>
<div class="hd-cluster"><button class="hd-btn" data-check>Primary</button><button class="hd-btn hd-btn--secondary" data-check>Secondary</button><button class="hd-btn hd-btn--ghost" data-check>Ghost</button><button class="hd-btn hd-btn--danger" data-check>Danger</button></div>
<div class="hd-alert hd-alert--danger" data-check>Danger</div><div class="hd-alert hd-alert--warning" data-check>Warning</div><div class="hd-alert hd-alert--success" data-check>Success</div><div class="hd-alert hd-alert--accent" data-check>Accent</div>
<div class="hd-card" data-check>Card</div><div class="hd-card hd-card--alt" data-check>Alt card <a data-check href="#">link</a></div>
<span class="hd-badge" data-check>Badge</span><span class="hd-badge hd-badge--accent" data-check>Accent</span>
<label class="hd-field"><span class="hd-label" data-check>Name</span><input class="hd-input" data-check placeholder="Placeholder"></label>
<table class="hd-table"><thead><tr><th data-check>H</th></tr></thead><tbody><tr><td data-check>C</td></tr></tbody></table>
<hexa-logo id="lg" base="/logo/" alt="HexaData"></hexa-logo><hexa-logo id="lgi" form="icon" base="/logo/"></hexa-logo>
<hexa-tagline id="et" variant="secondary"></hexa-tagline><hexa-theme-toggle></hexa-theme-toggle><hexa-tooltip text="Tip text"><button class="hd-btn" id="tb">Tip</button></hexa-tooltip>
<footer class="hd-footer" data-check>Footer <a data-check href="#">link</a></footer>
</main><script src="/elements.js"></script></body></html>`;
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  const files = { '/': ['index.html', 'text/html'], '/demo.js': ['demo.js', 'text/javascript'] };
  res.setHeader('Content-Security-Policy', CSP);
  if (path === '/hexadata.css') {
    res.setHeader('content-type', 'text/css');
    return res.end(readFileSync(join(root, 'dist/css/hexadata.css')));
  }
  if (path === '/all.css') {
    res.setHeader('content-type', 'text/css');
    return res.end(readFileSync(join(root, 'dist/css/all.css')));
  }
  if (path === '/elements.js') {
    res.setHeader('content-type', 'text/javascript');
    return res.end(readFileSync(join(root, 'dist/elements/auto.js')));
  }
  if (path.startsWith('/logo/')) {
    try {
      const name = path.slice(6);
      if (!/^[a-z0-9.-]+$/.test(name)) throw new Error('bad name');
      res.setHeader('content-type', name.endsWith('.webp') ? 'image/webp' : 'image/png');
      return res.end(readFileSync(join(root, 'dist/logo', name)));
    } catch {
      res.statusCode = 404;
      return res.end();
    }
  }
  if (path === '/gallery') {
    res.setHeader('content-type', 'text/html');
    return res.end(GALLERY);
  }
  const f = files[path];
  if (!f) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', f[1]);
  res.end(readFileSync(join(out, f[0])));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const results = [];
const check = (name, fn) =>
  fn().then(
    () => {
      results.push(['ok', name]);
    },
    (e) => {
      results.push(['FAIL', name, e.message]);
    },
  );

async function open(query, manifestBody, opts = {}) {
  const ctx = await browser.newContext({ colorScheme: opts.colorScheme ?? 'light' });
  const page = await ctx.newPage();
  const requests = [],
    consoleErrors = [];
  page.on('request', (r) => requests.push({ url: r.url(), headers: r.headers() }));
  page.on('console', (m) => {
    if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  await page.route('https://brand.example.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(manifestBody),
    }),
  );
  await page.goto(`${origin}/?${query}`);
  await page.waitForFunction(() => window.__rendered === true);
  return { ctx, page, requests, consoleErrors };
}
const css = (page, name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

await check('default mode: renders tagline, ZERO requests beyond own origin, no CSP violations', async () => {
  const { ctx, page, requests, consoleErrors } = await open('mode=none', good);
  assert.equal(await page.textContent('#tag'), 'Supercomputing, On-demand.');
  assert.ok(
    requests.every((r) => r.url.startsWith(origin)),
    'third-party request: ' + requests.map((r) => r.url).join(', '),
  );
  assert.deepEqual(consoleErrors, []);
  assert.equal(await css(page, '--hd-cyan'), '#009BB6');
  await ctx.close();
});

await check('signed update: applied via CSSOM under strict CSP; request has no cookies/referrer', async () => {
  const { ctx, page, requests, consoleErrors } = await open('mode=remote', good);
  await page.waitForFunction(() => document.getElementById('tag').textContent === 'Signed update applied.');
  assert.equal(await css(page, '--hd-cyan'), '#009AB4');
  assert.equal(await css(page, '--hd-cyan-rgb'), '0 154 180');
  const m = requests.find((r) => r.url.startsWith('https://brand.example.com'));
  assert.ok(m, 'manifest request missing');
  assert.equal(m.headers.cookie, undefined);
  assert.equal(m.headers.referer, undefined);
  assert.ok(requests.every((r) => r.url.startsWith(origin) || r.url.startsWith('https://brand.example.com/')));
  assert.deepEqual(consoleErrors, []);
  await ctx.close();
});

await check('tampered manifest is rejected: defaults stay, issue reported as bad-signature', async () => {
  const { ctx, page } = await open('mode=remote', tampered);
  await page.waitForFunction(() => window.__issues.length > 0);
  assert.equal(await page.textContent('#tag'), 'Supercomputing, On-demand.');
  assert.equal(await css(page, '--hd-cyan'), '#009BB6');
  assert.equal((await page.evaluate(() => window.__issues[0])).reason, 'bad-signature');
  await ctx.close();
});

await check('nothing is stored: no localStorage, sessionStorage, cookies, IndexedDB or caches', async () => {
  const { ctx, page } = await open('mode=remote', good);
  await page.waitForFunction(() => document.getElementById('tag').textContent === 'Signed update applied.');
  const s = await page.evaluate(async () => ({
    ls: localStorage.length,
    ss: sessionStorage.length,
    ck: document.cookie,
    idb: (await indexedDB.databases()).length,
    cs: (await caches.keys()).length,
  }));
  assert.deepEqual(s, { ls: 0, ss: 0, ck: '', idb: 0, cs: 0 });
  assert.deepEqual(await ctx.cookies(), []);
  await ctx.close();
});

await check('semantic CSS follows prefers-color-scheme and data-theme (light=white/obsidian, dark=obsidian/white)', async () => {
  const probe = (page) =>
    page.evaluate(() => {
      const el = document.createElement('div');
      el.style.background = 'var(--hd-bg)';
      el.style.color = 'var(--hd-fg)';
      document.body.append(el);
      const c = getComputedStyle(el);
      return [c.backgroundColor, c.color];
    });
  const l = await open('mode=none', good, { colorScheme: 'light' });
  assert.deepEqual(await probe(l.page), ['rgb(248, 250, 252)', 'rgb(18, 30, 54)']);
  // explicit override beats the OS preference
  await l.page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  assert.deepEqual(await probe(l.page), ['rgb(18, 30, 54)', 'rgb(248, 250, 252)']);
  await l.ctx.close();
  const d = await open('mode=none', good, { colorScheme: 'dark' });
  assert.deepEqual(await probe(d.page), ['rgb(18, 30, 54)', 'rgb(248, 250, 252)']);
  await d.page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  assert.deepEqual(await probe(d.page), ['rgb(248, 250, 252)', 'rgb(18, 30, 54)']);
  await d.ctx.close();
});

for (const [scheme, shown, hidden] of [
  ['light', 'on-light', 'on-dark'],
  ['dark', 'on-dark', 'on-light'],
]) {
  await check(`logo: ${scheme} theme shows the ${shown} artwork, loads real files, same-origin only`, async () => {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    const bad = [];
    page.on('requestfailed', (r) => bad.push(r.url()));
    page.on('response', (r) => {
      if (r.status() >= 400) bad.push(r.url());
    });
    await page.goto(`${origin}/gallery`);
    await page.waitForLoadState('networkidle');
    const vis = (sel) => page.locator(sel).isVisible();
    assert.equal(await vis(`#lg .hd-logo__img--${shown}`), true);
    assert.equal(await vis(`#lg .hd-logo__img--${hidden}`), false);
    const ok = await page.evaluate(() =>
      [...document.querySelectorAll('#lg img, #lgi img')]
        .filter((i) => getComputedStyle(i).display !== 'none')
        .map((i) => i.complete && i.naturalWidth > 0),
    );
    assert.ok(ok.length === 2 && ok.every(Boolean), 'visible logos must load');
    // a forced theme wins over the OS preference
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), scheme === 'light' ? 'dark' : 'light');
    assert.equal(await vis(`#lg .hd-logo__img--${hidden}`), true);
    assert.deepEqual(bad, []);
    await ctx.close();
  });
}

await check('custom elements: tagline text, theme toggle (no storage), accessible dismissible tooltip, strict CSP', async () => {
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  const errors = [];
  const requested = [];
  page.on('request', (r) => requested.push(r.url()));
  page.on('console', (m) => {
    if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${origin}/gallery`);
  assert.equal(await page.textContent('#et'), 'Engineered in India. Built for the World.');
  const toggle = page.locator('hexa-theme-toggle button');
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
  await toggle.click();
  assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(18, 30, 54)');
  const tip = page.locator('.hd-tooltip');
  assert.equal(await tip.isHidden(), true);
  await page.focus('#tb');
  assert.equal(await tip.isVisible(), true);
  assert.equal(await page.getAttribute('#tb', 'aria-describedby'), await tip.getAttribute('id'));
  await page.keyboard.press('Escape');
  assert.equal(await tip.isHidden(), true);
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0);
  assert.deepEqual(errors, []);
  // Live updates are on by default, but with no keys embedded in this build there is nothing to verify against: no request.
  assert.ok(
    requested.every((u) => u.startsWith(origin)),
    `unexpected request(s): ${requested.filter((u) => !u.startsWith(origin)).join(', ')}`,
  );
  await ctx.close();
});

for (const scheme of ['light', 'dark']) {
  await check(`components: every text element has >= 4.5:1 contrast in ${scheme} mode (computed, real browser)`, async () => {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(`${origin}/gallery`);
    const bad = await page.evaluate(() => {
      const lum = ([r, g, b]) =>
        [r, g, b]
          .map((v) => v / 255)
          .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
          .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
      const parse = (v) => v.match(/[\d.]+/g).map(Number);
      const bgOf = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const c = parse(getComputedStyle(e).backgroundColor);
          if (c.length < 4 || c[3] > 0.99) return c.slice(0, 3);
        }
        return [255, 255, 255];
      };
      const out = [];
      for (const el of document.querySelectorAll('[data-check]')) {
        const fg = parse(getComputedStyle(el).color).slice(0, 3);
        const bg = bgOf(el);
        const [a, b] = [lum(fg), lum(bg)];
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        if (ratio < 4.5) out.push(`${el.tagName}.${el.className} ${ratio.toFixed(2)}`);
      }
      return out;
    });
    assert.deepEqual(bad, []);
    await ctx.close();
  });
}

await browser.close();
server.close();
for (const r of results) console.log(r[0] === 'ok' ? '  ok  ' : '  FAIL', r[1], r[2] ?? '');
const failed = results.filter((r) => r[0] !== 'ok').length;
console.log(`e2e: ${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
