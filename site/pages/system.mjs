import { code, html, raw } from '../lib/html.mjs';
import { page, pageHead, section } from '../lib/layout.mjs';
import { CATALOGUE } from '../catalogue.mjs';

const px = (v) => (v.endsWith('rem') ? `${parseFloat(v) * 16} px` : v);
const PROPOSED = html``; // foundations were approved by the brand owner on 2026-11-15

export function typographyPage(ctx) {
  const { data } = ctx;
  const f = data.fonts;
  const weights = [
    ['Regular', 400],
    ['Medium', 500],
    ['Semibold', 600],
    ['Bold', 700],
  ];
  const specimen = (role, cls, heading, sample) =>
    html`<div class="hd-card site-specimen">
      <p class="hd-eyebrow">${heading}</p>
      <h3 class="${cls}">${f[role].family}</h3>
      <p class="site-specimen__sample ${cls}">${sample}</p>
      <ul class="site-weights ${cls}">
        ${weights.map(([n, w]) => html`<li class="site-w${w}">${n} ${w}</li>`)}
      </ul>
      <p class="hd-help">Stack: <code>${f[role].stack.join(', ')}</code></p>
    </div>`;
  const sizes = Object.entries(data.foundations.fontSize);
  return page(ctx, {
    path: 'typography/',
    title: 'Typography',
    body: html`${pageHead('Identity', 'Typography', 'Three typefaces, four weights each. All are open source (SIL OFL) and served from your own origin: no Google Fonts requests.')}
    ${section(
      'faces',
      'Typefaces',
      'Each has one job.',
      html`<div class="hd-grid">
        ${specimen('display', 'hd-text-display', 'Title / Heading / Hero', data.taglines.primary)}
        ${specimen('body', 'site-body-face', 'Subtitle / Body / Descriptions', data.taglines.secondary)}
        ${specimen('mono', 'site-mono-face', 'Detailed descriptions / Paragraphs', 'HexaData is an enterprise hardware engineering vendor specializing in high-performance computing platforms, custom GPU servers, and high-density data center infrastructure.')}
      </div>`,
    )}
    ${section(
      'scale',
      'Type scale',
      null,
      html`${PROPOSED}
        <div class="hd-table-wrap">
          <table class="hd-table">
            <caption class="hd-sr-only">
              Type scale
            </caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Size</th>
                <th scope="col">Sample</th>
              </tr>
            </thead>
            <tbody>
              ${sizes.map(
                ([k, v]) =>
                  html`<tr>
                    <th scope="row"><code>--hd-font-size-${k}</code></th>
                    <td>${v} (${px(v)})</td>
                    <td><span class="site-size site-size--${k}">Supercomputing</span></td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>
        <p class="hd-help">
          Headings scale fluidly between the smallest and largest step of their range. Line height: tight
          ${data.foundations.lineHeight.tight}, snug ${data.foundations.lineHeight.snug}, normal ${data.foundations.lineHeight.normal},
          relaxed ${data.foundations.lineHeight.relaxed}.
        </p>`,
    )}
    ${section(
      'use',
      'In code',
      null,
      code(`<h1>Heading in Space Grotesk</h1>
<p>Body in Inter Tight.</p>
<p class="hd-text-detail">Detailed description in JetBrains Mono.</p>
<code>inline code</code>`),
    )}`,
  });
}

export function foundationsPage(ctx) {
  const { data } = ctx;
  const F = data.foundations;
  return page(ctx, {
    path: 'foundations/',
    title: 'Foundations',
    body: html`${pageHead('System', 'Foundations', 'Spacing, radius, elevation, motion, breakpoints and layering: the small decisions that make every product feel like HexaData.')}
      <div class="hd-container">${PROPOSED}</div>
      ${section(
        'space',
        'Spacing',
        'A 4 px base. Identical to the Tailwind default, so utilities and variables always agree.',
        html`<ul class="site-bars">
          ${Object.entries(F.space)
            .filter(([k]) => k !== '0')
            .map(
              ([k, v]) =>
                html`<li>
                  <code>--hd-space-${k}</code><span class="site-bar site-bar--${k}" aria-hidden="true"></span><span>${v} (${px(v)})</span>
                </li>`,
            )}
        </ul>`,
      )}
      ${section(
        'radius',
        'Radius',
        null,
        html`<ul class="site-tiles">
          ${Object.entries(F.radius).map(([k, v]) => html`<li><span class="site-tile site-tile--r-${k}" aria-hidden="true"></span><code>--hd-radius-${k}</code><span>${v === '9999px' ? 'full' : px(v)}</span></li>`)}
        </ul>`,
      )}
      ${section(
        'elevation',
        'Elevation',
        'Shadows are tinted with Midnight. On dark surfaces separate with a grey border: shadow is a bonus, never the only cue.',
        html`<ul class="site-tiles">
          ${Object.keys(F.shadow).map((k) => html`<li><span class="site-tile site-tile--s-${k}" aria-hidden="true"></span><code>--hd-shadow-${k}</code></li>`)}
        </ul>`,
      )}
      ${section(
        'motion',
        'Motion',
        'Short and purposeful. Everything drops to 0 ms under prefers-reduced-motion.',
        html`<div class="hd-table-wrap">
          <table class="hd-table">
            <caption class="hd-sr-only">
              Motion tokens
            </caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ...Object.entries(F.duration).map(([k, v]) => [`--hd-duration-${k}`, v]),
                ...Object.entries(F.easing).map(([k, v]) => [`--hd-ease-${k}`, v]),
              ].map(
                ([k, v]) =>
                  html`<tr>
                    <th scope="row"><code>${k}</code></th>
                    <td><code>${v}</code></td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>`,
      )}
      ${section(
        'breakpoints',
        'Breakpoints and layering',
        null,
        html`<div class="hd-grid">
          <div class="hd-card">
            <h3>Breakpoints (min-width)</h3>
            <ul>
              ${Object.entries(F.breakpoint).map(([k, v]) => html`<li><code>${k}</code> ${v} (${px(v)})</li>`)}
            </ul>
          </div>
          <div class="hd-card">
            <h3>z-index</h3>
            <ul>
              ${Object.entries(F.zIndex).map(([k, v]) => html`<li><code>--hd-z-${k}</code> ${v}</li>`)}
            </ul>
          </div>
        </div>`,
      )}`,
  });
}

export function componentsPage(ctx) {
  const toc = CATALOGUE.map((c) => html`<li><a href="#${c.id}">${c.name}</a></li>`);
  const blocks = CATALOGUE.map(
    (c) =>
      html`<section class="hd-section site-component" aria-labelledby="${c.id}-h" id="${c.id}">
        <div class="hd-container">
          <h2 id="${c.id}-h">${c.name}</h2>
          <p class="site-lede">${c.description}</p>
          <div class="site-preview">${raw(c.html)}</div>
          <p class="hd-help"><strong>Accessibility:</strong> ${c.a11y}</p>
          <details>
            <summary>HTML</summary>
            ${code(c.html)}
          </details>
          ${
            c.react
              ? html`<details>
                  <summary>React</summary>
                  ${code(c.react)}
                </details>`
              : ''
          }
        </div>
      </section>`,
  );
  return page(ctx, {
    path: 'components/',
    title: 'Components',
    body: html`${pageHead('System', 'Components', 'CSS-first, on native HTML semantics, with React wrappers and web components. Every example below is the exact markup that ships, in the theme you have selected.')}
      <div class="hd-container">
        <nav aria-label="Components">
          <ul class="hd-pagination site-toc">
            ${toc}
          </ul>
        </nav>
        <p>
          Import once: <code>@import '@hexadata/brand/all.css';</code> (tokens + base + components, in cascade layers you can override).
        </p>
      </div>
      ${blocks}`,
  });
}
