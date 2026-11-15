import { html, raw } from './html.mjs';

export const NAV = [
  ['logo/', 'Logo'],
  ['colour/', 'Colour'],
  ['typography/', 'Typography'],
  ['foundations/', 'Foundations'],
  ['components/', 'Components'],
  ['examples/', 'Examples'],
  ['stacks/', 'Stacks'],
  ['downloads/', 'Downloads'],
];

/** Same markup as <HexaLogo>: both artworks in the DOM, CSS shows the one for the active theme. */
export function logoMarkup(ctx, { form = 'horizontal', size = 'md', tone = 'primary', alt = 'HexaData', on = 'auto', eager = false } = {}) {
  const { resolveLogo, logoUrl } = ctx.data.core;
  const base = `${ctx.base}v2/logo/`;
  const img = (side) => {
    const v = resolveLogo(form, tone, side);
    const src = logoUrl(v, { base, version: ctx.data.core.DEFAULT_MANIFEST.assets.logo[v.id] });
    return html`<img
      class="hd-logo__img hd-logo__img--on-${side}"
      src="${src}"
      width="${v.width}"
      height="${v.height}"
      alt="${alt}"
      ${eager ? raw('') : raw('loading="lazy" ')}decoding="async"
    />`;
  };
  return html`<span class="hd-logo hd-logo--${form} hd-logo--${size}" data-on="${on}">${img('light')}${img('dark')}</span>`;
}

export function page(ctx, { path, title, description, body, wide = false, print = false }) {
  const { data, base } = ctx;
  ctx.capture?.push({ path, title, body });
  const fullTitle = path === '' ? `HexaData Brand: ${data.taglines.primary}` : `${title} · HexaData Brand`;
  const url = `${data.origin}/${path}`;
  const desc =
    description ?? `${data.taglines.primary} ${data.taglines.secondary} Official HexaData brand system: logo, colour, type, components.`;
  const link = (rel) => `${base}${rel}`;
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${data.palette.white}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${data.palette.obsidian}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${data.origin}/v2/logo/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${link('v2/logo/favicon.ico')}" sizes="48x48">
<link rel="icon" type="image/png" href="${link('v2/logo/favicon-32.png')}" sizes="32x32">
<link rel="apple-touch-icon" href="${link('v2/logo/apple-touch-icon.png')}">
<link rel="manifest" href="${link('site.webmanifest')}">
<link rel="stylesheet" href="${link('v2/css/fonts-fallback.css')}">
<link rel="stylesheet" href="${link('v2/css/fonts.css')}">
<link rel="stylesheet" href="${link('v2/css/all.css')}">
<link rel="stylesheet" href="${link('site.css')}">
<script src="${link('v2/js/hexadata.js')}" defer></script>
<script src="${link('site.js')}" defer></script>
</head>
<body${print ? raw(' class="print"') : ''}>
<a class="hd-skip-link" href="#main">Skip to content</a>
${
  print
    ? ''
    : html`<header class="hd-header site-header">
        <div class="hd-container site-header__inner">
          <a href="${link('')}" class="site-brand" aria-label="HexaData Brand home"
            >${logoMarkup(ctx, { eager: true })}<span class="hd-sr-only">Brand</span></a
          >
          <nav aria-label="Main">
            <ul class="hd-nav">
              ${NAV.map(([href, label]) => html`<li><a href="${link(href)}" ${path === href ? raw(' aria-current="page"') : ''}>${label}</a></li>`)}
            </ul>
          </nav>
          <hexa-theme-toggle label="Dark mode"></hexa-theme-toggle>
        </div>
      </header>`
}
<main id="main"${wide ? raw(' class="site-wide"') : ''} tabindex="-1">${body}</main>
${
  print
    ? ''
    : html`<footer class="hd-footer">
        <div class="hd-container site-footer">
          <div>
            ${logoMarkup(ctx, { size: 'sm' })}
            <p class="hd-muted-on-alt">${data.taglines.secondary}</p>
          </div>
          <ul class="site-footer__links">
            <li><a href="${link('downloads/')}">Downloads</a></li>
            <li><a href="${link('changelog/')}">Changelog</a></li>
            <li><a href="${link('legal/')}">Brand licence &amp; trademarks</a></li>
            <li><a href="https://github.com/atriganguly/hexadata-brand">Source on GitHub</a></li>
          </ul>
          <p class="site-footer__legal">
            HexaData is a trademark of Esconet Technologies Limited. Software: Apache-2.0. Brand assets: all rights reserved, see the
            <a href="${link('legal/')}">brand licence</a>. Version ${data.version}.
          </p>
        </div>
      </footer>`
}
</body>
</html>
`;
}

export const section = (id, heading, intro, body) =>
  html`<section class="hd-section site-section" aria-labelledby="${id}">
    <div class="hd-container">
      <h2 id="${id}">${heading}</h2>
      ${intro ? html`<p class="site-lede">${intro}</p>` : ''} ${body}
    </div>
  </section>`;

export const pageHead = (eyebrow, title, lede) =>
  html`<section class="hd-section site-page-head">
    <div class="hd-container">
      <p class="hd-eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      ${lede ? html`<p class="site-lede">${lede}</p>` : ''}
    </div>
  </section>`;
