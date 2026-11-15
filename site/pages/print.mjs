import { html, raw } from '../lib/html.mjs';
import { logoMarkup, page } from '../lib/layout.mjs';

/**
 * The Brand Kit PDF is the website's own pages (logo, colour, typography, foundations, components, legal) printed in one go,
 * behind a cover and an introduction, so the PDF and the site can never drift apart.
 */
export function printKit(ctx, captured, tokenHash) {
  const { data } = ctx;
  const minor = data.version.split('.').slice(0, 2).join('.');
  const cover = html`<section class="print-page print-cover">
    <div>${logoMarkup(ctx, { form: 'centered', size: 'xl', on: 'light', eager: true })}</div>
    <div>
      <p class="hd-eyebrow">Brand Kit v${minor}</p>
      <h1>HexaData Brand Guidelines</h1>
      <p class="site-lede">${data.taglines.primary}</p>
      <p>${data.taglines.secondary}</p>
    </div>
    <p class="hd-help">
      Package ${data.version} · brand revision ${data.core.BRAND_REVISION} · tokens ${tokenHash}<br />This document is generated from the
      same source as the website and the code. The latest version is always at ${data.origin}/downloads/.
    </p>
  </section>`;
  const intro = html`<section class="print-page">
    <h2>About these guidelines</h2>
    <p>
      HexaData's logo and other branded elements are key to our company's unique identity and differentiation. These assets may not be used
      in any manner that isn't expressly authorized in writing by HexaData or Esconet Technologies Limited.
    </p>
    <p>
      The HexaData logo is our primary brand identifier and the most often-used element of HexaData's visual identity. It's our signature,
      so consistent and proper use is important. Usage of our logo also implies a partnership or endorsement, so following the guidance
      below is critical to ensure brand consistency across all touchpoints.
    </p>
    <h3>Examples of approved logo usage</h3>
    <ul>
      <li>For co-branding with partner logos.</li>
      <li>When HexaData is a sponsor.</li>
      <li>In a group of logos alongside other companies ("logo garden").</li>
      <li>In educational or research applications that use HexaData technologies and products.</li>
      <li>Any other forms of officially-approved usage.</li>
    </ul>
    <p><strong>Use the right size, use the right colour, keep it legible.</strong></p>
    <h3>Our taglines</h3>
    <p class="site-h2 hd-text-display">${data.taglines.primary}</p>
    <p class="site-lede">${data.taglines.secondary}</p>
    <h3>How to use this system</h3>
    <p>
      Developers import the package (CSS, Tailwind, React, React Native or web components) and never re-implement the brand. When the brand
      changes, the source in the repository is updated once and every product receives the change. See the Stacks page of the website for
      each integration.
    </p>
    <p class="hd-help">Sections marked <em>Proposed</em> are not part of Brand Kit v1.0 and await approval by the brand owner.</p>
  </section>`;
  const articles = captured.map((c) => html`<article class="print-page">${c.body}</article>`);
  return page(ctx, { path: 'print/', title: 'Brand Kit (print)', print: true, body: html`${cover}${intro}${articles}` });
}

export { raw };
