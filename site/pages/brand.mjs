import { html } from '../lib/html.mjs';
import { logoMarkup, page, pageHead, section } from '../lib/layout.mjs';

const CORE = ['cyan', 'deepBlue', 'obsidian', 'vividCerulean', 'midnight'];
const STATUS = ['crimson', 'copper', 'green'];
/** Visible spelling (en-IN). Ids and attributes keep the public name `centered`. */
const formLabel = (form) => (form === 'centered' ? 'centred' : form);
const NEUTRAL = ['grey', 'white'];
const NAMES = {
  deepBlue: 'Deep Blue',
  vividCerulean: 'Vivid Cerulean',
  cyan: 'Cyan',
  obsidian: 'Obsidian',
  midnight: 'Midnight',
  crimson: 'Crimson',
  copper: 'Copper',
  green: 'Green',
  grey: 'Grey',
  white: 'White',
};
const USE = {
  cyan: 'Accent fills and non-text UI. Text on cyan is Obsidian.',
  deepBlue: 'Primary action fill (white text) and links on light surfaces.',
  obsidian: 'Dark mode background; primary dark text on light surfaces.',
  vividCerulean: 'Accent text and primary fill on dark surfaces (Obsidian text on it).',
  midnight: 'Secondary dark surface; alternative dark text.',
  crimson: 'Error / destructive. Solid fill with Obsidian text.',
  copper: 'Warning. Solid fill with Obsidian text.',
  green: 'Success. Solid fill with Obsidian text.',
  grey: 'Secondary light surface; muted text and borders on dark.',
  white: 'Light mode background; primary light text on dark surfaces.',
};

export function home(ctx) {
  const { data, base } = ctx;
  const features = [
    ['One import, whole brand', 'Logo, colour, type, spacing and components arrive together. Build your app, not the design.'],
    [
      'Change once, update everywhere',
      'Edit the brand source and every app picks it up: through releases or a signed live channel, with no code changes.',
    ],
    ['Accessible by default', 'Every allowed colour pairing is measured against WCAG and checked in CI, in light and dark.'],
    ['Every stack', 'CSS, Tailwind v3/v4, React, React Native and web components for Vue, Svelte, Angular and plain HTML.'],
  ];
  const stats = [
    [String(data.paletteKeys.length), 'brand colours'],
    ['3', 'typefaces'],
    [String(Object.keys(data.foundations.space).length), 'spacing steps'],
    ['2', 'light and dark themes'],
  ];
  return page(ctx, {
    path: '',
    title: 'Home',
    body: html`<section class="hd-hero site-hero">
        <div class="hd-container site-hero__inner">
          <div>
            <p class="hd-eyebrow">The official HexaData brand system</p>
            <h1 class="site-hero__title">${data.taglines.primary}</h1>
            <p class="site-lede">${data.taglines.secondary}</p>
            <div class="hd-cluster">
              <a class="hd-btn hd-btn--lg" href="${base}stacks/">Use the brand</a>
              <a class="hd-btn hd-btn--secondary hd-btn--lg" href="${base}logo/">See the identity</a>
            </div>
          </div>
          <div class="site-hero__logo" aria-hidden="true">${logoMarkup(ctx, { form: 'icon', size: 'xl', alt: '' })}</div>
        </div>
      </section>
      ${section(
        'why',
        'One source of truth',
        'This site is built from the same files your apps import, so what you see here is what ships.',
        html`<div class="hd-grid">
          ${features.map(
            ([t, d]) =>
              html`<div class="hd-card">
                <h3>${t}</h3>
                <p>${d}</p>
              </div>`,
          )}
        </div>`,
      )}
      <section class="hd-section hd-surface-alt" aria-labelledby="stats-h">
        <div class="hd-container">
          <h2 id="stats-h" class="hd-sr-only">Brand at a glance</h2>
          <ul class="site-stats">
            ${stats.map(([n, l]) => html`<li><span class="site-stats__n">${n}</span><span>${l}</span></li>`)}
          </ul>
        </div>
      </section>
      ${section(
        'live',
        'See it live',
        'Toggle the theme in the header. Components follow automatically: no per-theme code.',
        html`<div class="hd-card hd-stack">
          <div class="hd-cluster">
            <button class="hd-btn">Primary</button><button class="hd-btn hd-btn--secondary">Secondary</button
            ><span class="hd-badge hd-badge--success">Active</span><span class="hd-badge hd-badge--warning">Pending</span>
          </div>
          <div class="hd-alert hd-alert--accent" role="status">Liquid-cooled GPU racks, engineered in India, built for the world.</div>
        </div>`,
      )}`,
  });
}

function logoPanel(ctx, id, form, background) {
  const { resolveLogo } = ctx.data.core;
  const v = resolveLogo(form, 'primary', background);
  const on = background;
  return html`<figure class="site-panel site-panel--${background}">
    <div class="site-panel__stage">
      ${logoMarkup(ctx, { form, size: form === 'icon' ? 'lg' : 'lg', on, tone: 'primary', alt: `HexaData ${formLabel(form)} logo on ${background}` })}
    </div>
    <figcaption>${v.id}</figcaption>
  </figure>`;
}

export function logoPage(ctx) {
  const { data, base } = ctx;
  const rules = data.logoDoc.rules;
  const rows = data.logos.map((v) => {
    const file = v.form === 'icon' ? `${v.id}-512.png` : `${v.id}.png`;
    return html`<tr>
      <th scope="row">${v.id}</th>
      <td>${formLabel(v.form)}</td>
      <td>${v.tone}</td>
      <td>${v.background}</td>
      <td>${v.width}×${v.height}</td>
      <td>
        <a href="${base}v2/logo/${file}" download>PNG</a
        >${v.form === 'icon' ? html` · <a href="${base}v2/logo/${v.id}-1024.webp">WebP 1024</a>` : html` · <a href="${base}v2/logo/${v.id}.webp">WebP</a>`}
      </td>
    </tr>`;
  });
  return page(ctx, {
    path: 'logo/',
    title: 'Logo',
    body: html`${pageHead('Identity', 'Logo', 'The logo is our primary identifier and our signature. Use the right size, the right colour variant for the background, and keep it legible.')}
    ${section(
      'forms',
      'Three forms, two surfaces',
      'Horizontal for headers and tight spaces, centred for covers and splash screens, the icon for apps and social avatars. Each has artwork for light and dark surfaces.',
      html`<div class="site-panels">
          ${logoPanel(ctx, 'h-l', 'horizontal', 'light')}${logoPanel(ctx, 'h-d', 'horizontal', 'dark')}
          ${logoPanel(ctx, 'c-l', 'centered', 'light')}${logoPanel(ctx, 'c-d', 'centered', 'dark')}
          ${logoPanel(ctx, 'i-l', 'icon', 'light')}${logoPanel(ctx, 'i-d', 'icon', 'dark')}
        </div>
        <p class="hd-help">
          In code the right artwork is chosen for you, from the theme: <code>&lt;HexaLogo /&gt;</code> or <code>&lt;hexa-logo&gt;</code>.
        </p>`,
    )}
    ${section(
      'mono',
      'Mono',
      'One-colour artwork for dark and grey surfaces when full colour is not possible. On light surfaces the components fall back to full colour, because no mono artwork exists for them.',
      html`<div class="site-panels">
        <figure class="site-panel site-panel--dark">
          <div class="site-panel__stage">
            ${logoMarkup(ctx, { form: 'horizontal', tone: 'mono', on: 'dark', size: 'lg', alt: 'HexaData mono horizontal logo' })}
          </div>
          <figcaption>horizontal-mono</figcaption>
        </figure>
        <figure class="site-panel site-panel--dark">
          <div class="site-panel__stage">
            ${logoMarkup(ctx, { form: 'centered', tone: 'mono', on: 'dark', size: 'lg', alt: 'HexaData mono centred logo' })}
          </div>
          <figcaption>centered-mono</figcaption>
        </figure>
      </div>`,
    )}
    ${section(
      'rules',
      'Using the logo',
      null,
      html`<div class="hd-grid">
          <div class="hd-card">
            <h3>Clear space</h3>
            <p>${rules.clearSpace}</p>
          </div>
          <div class="hd-card">
            <h3>Minimum size</h3>
            <p>
              Icon ${rules.minWidthPx.icon} px, centred ${rules.minWidthPx.centered} px, horizontal ${rules.minWidthPx.horizontal} px wide.
            </p>
          </div>
          <div class="hd-card hd-card--alt">
            <h3>Never</h3>
            <ul>
              ${rules.never.map((n) => html`<li>${n}</li>`)}
            </ul>
          </div>
        </div>
        <h3>Approved uses without asking</h3>
        <ul>
          <li>Co-branding with partner logos</li>
          <li>Sponsor acknowledgements, where HexaData is a sponsor</li>
          <li>"Logo garden" displays alongside other companies</li>
          <li>Educational or research applications that use HexaData technologies and products</li>
        </ul>
        <p>
          Anything else needs written authorisation from HexaData or Esconet Technologies Limited. See the
          <a href="${base}legal/">brand licence and trademark policy</a>.
        </p>`,
    )}
    ${section(
      'files',
      'Files',
      'Wordmarks are trimmed to the artwork. Icons are published at 64, 128, 256, 512 and 1024 px. The official masters are PNG; vector masters will follow.',
      html`<div class="hd-table-wrap">
        <table class="hd-table">
          <caption class="hd-sr-only">
            Logo files
          </caption>
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Form</th>
              <th scope="col">Tone</th>
              <th scope="col">For surface</th>
              <th scope="col">Size (px)</th>
              <th scope="col">Download</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>`,
    )}`,
  });
}

const swatch = (ctx, key) => {
  const { data } = ctx;
  const hex = data.palette[key];
  const dark = ['obsidian', 'midnight', 'deepBlue'].includes(key);
  return html`<li class="site-swatch">
    <button
      type="button"
      class="site-swatch__chip sw-${key}${dark ? ' site-swatch__chip--on-dark' : ''}"
      data-copy="${hex}"
      aria-label="Copy ${NAMES[key]} ${hex}"
    >
      <span class="site-swatch__hint" aria-hidden="true">Copy</span>
    </button>
    <div class="site-swatch__meta">
      <strong>${NAMES[key]}</strong><code>${hex}</code><span>RGB ${data.rgb(hex)}</span><span><code>--hd-${data.kebab(key)}</code></span
      ><span class="hd-help">${USE[key]}</span>
    </div>
  </li>`;
};

export function colourPage(ctx) {
  const { data } = ctx;
  const group = (title, keys) =>
    html`<h3>${title}</h3>
      <ul class="site-swatches">
        ${keys.map((k) => swatch(ctx, k))}
      </ul>`;
  const roles = Object.keys(data.semantic.light);
  const roleRows = roles.map((r) => {
    const cell = (mode) => {
      const key = data.semantic[mode][r];
      return html`<td><span class="site-dot sw-${key}" aria-hidden="true"></span> ${NAMES[key]} <code>${data.palette[key]}</code></td>`;
    };
    return html`<tr>
      <th scope="row"><code>--hd-${data.kebab(r)}</code></th>
      ${cell('light')}${cell('dark')}
    </tr>`;
  });
  const cellFor = (a, b) => {
    if (a === b) return html`<td class="site-matrix__self" aria-label="same colour">–</td>`;
    const r = data.ratio(a, b);
    const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'UI' : 'fail';
    return html`<td class="site-matrix__${grade}">
      <span class="hd-sr-only">${NAMES[a]} on ${NAMES[b]}: </span>${r.toFixed(2)}<span class="hd-sr-only"> ${grade}</span>
    </td>`;
  };
  const keys = data.paletteKeys;
  return page(ctx, {
    path: 'colour/',
    title: 'Colour',
    body: html`${pageHead('Identity', 'Colour', 'Ten colours. Do not use any other shades of black, grey or white. Pure black and white are only a fallback where the defined shades are technically unusable (print, email clients, forced colours).')}
    ${section('palette', 'Palette', 'Click a swatch to copy its hex value.', html`${group('Core', CORE)}${group('UI, status and call to action', STATUS)}${group('Black, grey and white', NEUTRAL)}`)}
    ${section(
      'roles',
      'Semantic roles',
      'Style with roles, not raw colours. Roles are the contrast-checked pairings and switch with the theme automatically.',
      html`<div class="hd-table-wrap">
        <table class="hd-table">
          <caption class="hd-sr-only">
            Semantic roles per theme
          </caption>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Light theme</th>
              <th scope="col">Dark theme</th>
            </tr>
          </thead>
          <tbody>
            ${roleRows}
          </tbody>
        </table>
      </div>`,
    )}
    ${section(
      'contrast',
      'Contrast matrix',
      'WCAG contrast ratios between every pair. Text needs 4.5 (AA) or 7 (AAA); icons and borders need 3. The brand lists which pairs are allowed; the build fails if an allowed pair ever drops below its minimum.',
      html`<div class="hd-table-wrap">
          <table class="hd-table site-matrix">
            <caption class="hd-sr-only">
              Contrast ratios between palette colours
            </caption>
            <thead>
              <tr>
                <th scope="col"><span class="hd-sr-only">Foreground</span></th>
                ${keys.map((k) => html`<th scope="col">${NAMES[k]}</th>`)}
              </tr>
            </thead>
            <tbody>
              ${keys.map(
                (a) =>
                  html`<tr>
                    <th scope="row">${NAMES[a]}</th>
                    ${keys.map((b) => cellFor(a, b))}
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>
        <p class="hd-help">
          AAA 7+ · AA 4.5+ · UI 3+ (large text, icons, borders) · fail under 3. Contrast is symmetric; use is directional, see the rules
          below.
        </p>`,
    )}
    ${section(
      'rules',
      'Rules that follow from the numbers',
      null,
      html`<div class="hd-grid">
          <div class="hd-card">
            <h3>Text on accent fills</h3>
            <p>
              Use <strong>Obsidian</strong> on cyan, cerulean, crimson, copper and green. White fails there (2.05 to 3.39). Only Deep Blue
              takes white text.
            </p>
          </div>
          <div class="hd-card">
            <h3>Grey text</h3>
            <p>Grey on white is ${data.ratio('grey', 'white').toFixed(2)}:1: never. Grey is for text on dark surfaces and for borders.</p>
          </div>
          <div class="hd-card">
            <h3>Dark surfaces</h3>
            <p>
              Obsidian and Midnight are ${data.ratio('obsidian', 'midnight').toFixed(2)}:1 apart. Separate them with a grey border, never by
              colour alone.
            </p>
          </div>
          <div class="hd-card">
            <h3>Status</h3>
            <p>Use solid fills with Obsidian text for success, warning and error, and say the status in words.</p>
          </div>
        </div>
        <h3>Forbidden pairs</h3>
        <div class="hd-table-wrap">
          <table class="hd-table">
            <caption class="hd-sr-only">
              Forbidden pairs
            </caption>
            <thead>
              <tr>
                <th scope="col">Pair</th>
                <th scope="col">Ratio</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              ${data.forbidden.map(
                (p) =>
                  html`<tr>
                    <th scope="row">${NAMES[p.fg]} on ${NAMES[p.bg]}</th>
                    <td>${data.ratio(p.fg, p.bg).toFixed(2)}</td>
                    <td>${p.reason}</td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>`,
    )}`,
  });
}
