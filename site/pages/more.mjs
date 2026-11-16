import { code, html, raw } from '../lib/html.mjs';
import { logoMarkup, page, pageHead, section } from '../lib/layout.mjs';
import { markdown } from '../lib/markdown.mjs';

export function examplesIndex(ctx) {
  const { base } = ctx;
  const items = [
    ['landing/', 'Marketing landing page', 'Hero, product cards, call to action and footer.'],
    ['dashboard/', 'Application dashboard', 'Stat cards, table, status badges and alerts.'],
    ['sign-in/', 'Sign-in form', 'Fields, validation and error handling done accessibly.'],
  ];
  return page(ctx, {
    path: 'examples/',
    title: 'Examples',
    body: html`${pageHead('System', 'Examples', 'Whole pages built only from the components and tokens, with no page-specific colours. Try the theme toggle.')}
    ${section(
      'list',
      'Pages',
      null,
      html`<div class="hd-grid">
        ${items.map(
          ([href, t, d]) =>
            html`<a class="hd-card hd-card--interactive site-card-link" href="${base}examples/${href}"
              ><h3>${t}</h3>
              <p>${d}</p>
              <span class="hd-link">Open example</span></a
            >`,
        )}
      </div>`,
    )}`,
  });
}

export function exampleLanding(ctx) {
  const { data } = ctx;
  const products = [
    ['Custom server solutions', 'Platforms engineered around your workload, from a single node to a rack.'],
    ['High-density GPU systems', 'Up to eight accelerators per chassis with the power and airflow to match.'],
    ['Liquid-cooled enterprise compute', 'Direct-to-chip cooling for dense, quiet, efficient data centres.'],
  ];
  return page(ctx, {
    path: 'examples/landing/',
    title: 'Example: landing page',
    body: html`<section class="hd-hero">
        <div class="hd-container hd-stack">
          <p class="hd-eyebrow">HexaData servers and workstations</p>
          <h1>${data.taglines.primary}</h1>
          <p class="site-lede">
            ${data.descriptor}: HexaData is an enterprise hardware engineering vendor specialising in high-performance computing platforms
            and custom GPU servers.
          </p>
          <div class="hd-cluster">
            <a class="hd-btn hd-btn--lg" href="#">Talk to an engineer</a
            ><a class="hd-btn hd-btn--secondary hd-btn--lg" href="#">Browse systems</a>
          </div>
        </div>
      </section>
      ${section(
        'products',
        'Built for the workloads that matter',
        null,
        html`<div class="hd-grid">
          ${products.map(
            ([t, d], i) =>
              html`<div class="hd-card ${i === 1 ? 'hd-card--alt' : ''}">
                <span class="hd-badge ${i === 1 ? '' : 'hd-badge--accent'}">${i === 1 ? 'Popular' : 'New'}</span>
                <h3>${t}</h3>
                <p>${d}</p>
                <a class="hd-link" href="#">Learn more</a>
              </div>`,
          )}
        </div>`,
      )}
      <section class="hd-section hd-surface-alt">
        <div class="hd-container hd-stack">
          <h2>${data.taglines.secondary}</h2>
          <p>Designed, validated and supported by one team.</p>
          <div><a class="hd-btn" href="#">Request a quote</a></div>
        </div>
      </section>`,
  });
}

export function exampleDashboard(ctx) {
  const stats = [
    ['Active nodes', '1,284', 'success', 'Healthy'],
    ['Queued jobs', '37', 'warning', 'Busy'],
    ['Failed (24h)', '2', 'danger', 'Attention'],
  ];
  const rows = [
    ['HX-8-0042', 'Mumbai', 'Running', 'success'],
    ['HX-4-0107', 'Pune', 'Queued', 'warning'],
    ['HX-8-0099', 'Chennai', 'Failed', 'danger'],
    ['HX-2-0015', 'Delhi', 'Running', 'success'],
  ];
  return page(ctx, {
    path: 'examples/dashboard/',
    title: 'Example: dashboard',
    body: html`${pageHead('Example', 'Fleet overview', 'A dense application screen: stats, a table and status that never relies on colour alone.')}
      <div class="hd-container hd-stack">
        <div class="hd-alert hd-alert--warning" role="alert">
          <strong>Maintenance window.</strong> Rack C3 cooling service starts at 02:00 IST.
        </div>
        <div class="hd-grid">
          ${stats.map(
            ([l, n, tone, word]) =>
              html`<div class="hd-card">
                <p class="hd-muted">${l}</p>
                <p class="site-stat">${n}</p>
                <span class="hd-badge hd-badge--${tone}">${word}</span>
              </div>`,
          )}
        </div>
        <div class="hd-table-wrap">
          <table class="hd-table">
            <caption>
              Recent jobs
            </caption>
            <thead>
              <tr>
                <th scope="col">Node</th>
                <th scope="col">Site</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(
                ([n, s, st, tone]) =>
                  html`<tr>
                    <th scope="row">${n}</th>
                    <td>${s}</td>
                    <td><span class="hd-badge hd-badge--${tone}">${st}</span></td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>
      </div>`,
  });
}

export function exampleSignIn(ctx) {
  return page(ctx, {
    path: 'examples/sign-in/',
    title: 'Example: sign in',
    body: html`<section class="hd-section">
      <div class="hd-container site-narrow">
        <div class="hd-card hd-stack">
          <div>${logoMarkup(ctx, { size: 'lg' })}</div>
          <h1 class="site-h2">Sign in</h1>
          <div class="hd-alert hd-alert--danger" role="alert">
            <strong>Could not sign in.</strong> Check your email and password and try again.
          </div>
          <form class="hd-stack" novalidate>
            <div class="hd-field">
              <label class="hd-label" for="si-email">Email</label
              ><input
                class="hd-input"
                id="si-email"
                type="email"
                autocomplete="username"
                aria-invalid="true"
                aria-describedby="si-email-err"
              />
              <p class="hd-error" id="si-email-err">Enter a valid email address.</p>
            </div>
            <div class="hd-field">
              <label class="hd-label" for="si-pw">Password</label
              ><input class="hd-input" id="si-pw" type="password" autocomplete="current-password" aria-describedby="si-pw-help" />
              <p class="hd-help" id="si-pw-help">At least 12 characters.</p>
            </div>
            <label class="hd-choice"><input class="hd-check" type="checkbox" /> Keep me signed in on this device</label>
            <button class="hd-btn hd-btn--block" type="submit">Sign in</button>
          </form>
          <p><a class="hd-link" href="#">Forgot your password?</a></p>
        </div>
      </div>
    </section>`,
  });
}

export function stacksPage(ctx) {
  const { data } = ctx;
  const o = data.origin;
  const stacks = [
    [
      'css',
      'CSS (any framework)',
      'Self-hosted fonts, tokens, base styles and components.',
      `npm install @hexadata/brand

/* app.css */
@import '@hexadata/brand/fonts-fallback.css';
@import '@hexadata/brand/fonts.css';
@import '@hexadata/brand/all.css';`,
    ],
    [
      'html',
      'Plain HTML, CMS or no build step',
      'Point at the evergreen hosted channel: it updates with no release. Pin /<version>/ plus the SRI hashes in integrity.json for reproducible builds.',
      `<link rel="stylesheet" href="${o}/v2/css/fonts.css">
<link rel="stylesheet" href="${o}/v2/css/all.css">
<script src="${o}/v2/js/hexadata.js" defer></script>

<hexa-logo form="horizontal"></hexa-logo>
<button class="hd-btn">Get started</button>`,
    ],
    [
      'react',
      'React and Next.js (App Router safe)',
      'Provider, logo, tagline and component wrappers. Live brand updates are on by default; pass live={false} for none.',
      `import '@hexadata/brand/all.css';
import { HexaProvider, HexaLogo, Button } from '@hexadata/brand/react';

export default function Layout({ children }) {
  return (
    <HexaProvider>
      <HexaLogo />
      {children}
    </HexaProvider>
  );
}`,
    ],
    [
      'tw4',
      'Tailwind CSS v4',
      'Strict by default: only brand colours exist, bg-hd-cyan/50 works.',
      `@import 'tailwindcss';
@import '@hexadata/brand/css';
@import '@hexadata/brand/tailwind/theme.css';`,
    ],
    [
      'tw3',
      'Tailwind CSS v3',
      'A preset; pass createPreset({ extend: true }) to keep Tailwind defaults.',
      `// tailwind.config.js
module.exports = { presets: [require('@hexadata/brand/tailwind')] };`,
    ],
    [
      'elements',
      'Vue, Svelte, Angular and others',
      'Framework-agnostic custom elements; no wrapper needed.',
      `import { defineHexaElements } from '@hexadata/brand/elements';
defineHexaElements();

<hexa-tagline variant="secondary"></hexa-tagline>
<hexa-theme-toggle label="Dark mode"></hexa-theme-toggle>`,
    ],
    [
      'native',
      'React Native',
      'Theme object with colours per mode, foundations in dp and font names. Copy the official TTFs from @hexadata/brand/fonts/ttf.',
      `import { HexaNativeProvider, useHexaNativeTheme } from '@hexadata/brand/native';
const theme = useHexaNativeTheme(useColorScheme() === 'dark' ? 'dark' : 'light');
// theme.colors.bg, theme.fonts.display.bold, theme.space['4']`,
    ],
    [
      'tokens',
      'Any tool: tokens.json and DTCG',
      'Resolved tokens at /v2/tokens.json. The source is W3C Design Tokens (2025.10) in brand/tokens.',
      `curl ${o}/v2/tokens.json`,
    ],
  ];
  return page(ctx, {
    path: 'stacks/',
    title: 'Stacks',
    body: html`${pageHead('Use it', 'Stacks', 'Pick your stack. Whatever you choose, the brand arrives the same way and updates the same way.')}
    ${stacks.map(([id, title, d, c]) => section(id, title, d, code(c)))}
    ${section('soon', 'More stacks', 'In progress for 2.0: Python, Flutter, native iOS and Android, and Office, email and print templates.', '')}`,
  });
}

export function downloadsPage(ctx) {
  const { data, base } = ctx;
  const ttfs = data.fontsDoc.files;
  const tr = (label, href, note = '') =>
    html`<tr>
      <th scope="row">${label}</th>
      <td><a href="${base}${href}">${href}</a></td>
      <td>${note}</td>
    </tr>`;
  const kit = ctx.pdf
    ? html`${tr(`Brand Kit v${data.kit} (PDF)`, `downloads/HexaData-Brand-Kit-v${data.kit}.pdf`, 'Current guidelines')}`
    : '';
  return page(ctx, {
    path: 'downloads/',
    title: 'Downloads',
    body: html`${pageHead('Use it', 'Downloads', 'Everything is also available from the evergreen channel at /v2/ and, immutable, at /' + data.version + '/.')}
    ${section(
      'docs',
      'Guidelines',
      null,
      html`<div class="hd-table-wrap">
        <table class="hd-table">
          <caption class="hd-sr-only">
            Documents
          </caption>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Path</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            ${kit}
          </tbody>
        </table>
      </div>`,
    )}
    ${section(
      'data',
      'Tokens and code',
      null,
      html`<div class="hd-table-wrap">
        <table class="hd-table">
          <caption class="hd-sr-only">
            Tokens and code
          </caption>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Path</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            ${tr('Resolved tokens', 'v2/tokens.json', 'Palette, roles, foundations, taglines, logo list')}
            ${tr('Signed manifest', 'v2/manifest.json', 'What live updates verify (Ed25519)')}
            ${tr('All styles', 'v2/css/all.css', 'Tokens + base + components')}
            ${tr('Custom elements', 'v2/js/hexadata.js', 'hexa-logo, hexa-tagline, hexa-theme-toggle, hexa-tooltip')}
            ${tr('Integrity hashes', 'v2/integrity.json', 'SRI sha384 for CSS and JS')}
          </tbody>
        </table>
      </div>`,
    )}
    ${section(
      'fonts',
      'Fonts (SIL OFL 1.1)',
      'Official static TTFs, unmodified. Free to use under the OFL; the licence text is included.',
      html`<div class="hd-table-wrap">
        <table class="hd-table">
          <caption class="hd-sr-only">
            Fonts
          </caption>
          <thead>
            <tr>
              <th scope="col">Face</th>
              <th scope="col">Weight</th>
              <th scope="col">File</th>
            </tr>
          </thead>
          <tbody>
            ${ttfs.map(
              (f) =>
                html`<tr>
                  <th scope="row">${f.family}</th>
                  <td>${f.weight}</td>
                  <td><a href="${base}v2/${f.file.startsWith('ttf/') ? 'fonts/' + f.file : f.file}">${f.file.replace('ttf/', '')}</a></td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>`,
    )}
    ${section('logos', 'Logos', html`See the <a href="${base}logo/">logo page</a> for every file with its intended surface. Use is governed by the <a href="${base}legal/">brand licence</a>.`, '')}`,
  });
}

export function changelogPage(ctx) {
  return page(ctx, {
    path: 'changelog/',
    title: 'Changelog',
    body: html`${pageHead('Project', 'Changelog')}
      <div class="hd-container site-prose">${markdown(ctx.data.changelog.replace(/^# Changelog\s*/, ''), { baseHeading: 2, repoBase: 'https://github.com/atriganguly/hexadata-brand/blob/main/' })}</div>`,
  });
}

export function legalPage(ctx) {
  // Only the public policy: everything below the marker is repository-specific and stays on GitHub.
  const body = ctx.data.brandLicense.split('<!-- public-end -->')[0].replace(/^# .*\n/, '');
  return page(ctx, {
    path: 'legal/',
    title: 'Brand licence and trademarks',
    body: html`${pageHead('Legal', 'Brand licence and trademark policy')}
      <div class="hd-container site-prose">${markdown(body, { baseHeading: 2, repoBase: 'https://github.com/atriganguly/hexadata-brand/blob/main/' })}</div>`,
  });
}

export function notFound(ctx) {
  return page(ctx, {
    path: '404.html',
    title: 'Page not found',
    body: html`<section class="hd-hero">
      <div class="hd-container hd-stack">
        <p class="hd-eyebrow">404</p>
        <h1>Page not found</h1>
        <p class="site-lede">That page does not exist. Try the navigation above, or start from the home page.</p>
        <div><a class="hd-btn" href="${ctx.base}">Home</a></div>
      </div>
    </section>`,
  });
}

export { raw };
