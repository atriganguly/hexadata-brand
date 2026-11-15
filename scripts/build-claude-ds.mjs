// Generates the "Claude Design System" artifact content (project/ tree) from the built package, deterministically.
//   node scripts/build-claude-ds.mjs [--out claude-ds-out]      write the tree (needs: build, build:logos)
//   node scripts/build-claude-ds.mjs --hash                      print the fingerprint of everything the artifact would contain
// The artifact itself is published with Claude (see claude-design-system/README.md); STATE.json records what was last published.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CATALOGUE } from '../site/catalogue.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const out = resolve(root, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'claude-ds-out');
const core = await import(pathToFileURL(join(root, 'dist/core/index.js')).href);
const read = (f) => readFileSync(join(root, f), 'utf8');
const assets = JSON.parse(read('claude-design-system/assets.json'));
const logoDoc = JSON.parse(read('brand/logo/logo.json'));
const fontsDoc = JSON.parse(read('brand/fonts/fonts.json'));
const pkg = JSON.parse(read('package.json'));
const P = core.DEFAULT_PALETTE;
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const px = (css) => (css.endsWith('rem') ? `${parseFloat(css) * 16}px` : css === '0' ? '0' : css);
const files = new Map(); // path under project/ -> text
const put = (p, text) => files.set(p, text.endsWith('\n') ? text : `${text}\n`);
const NAMES = {
  cyan: 'Cyan',
  deepBlue: 'Deep Blue',
  obsidian: 'Obsidian',
  vividCerulean: 'Vivid Cerulean',
  midnight: 'Midnight',
  grey: 'Grey',
  white: 'White',
  crimson: 'Crimson',
  copper: 'Copper',
  green: 'Green',
};

// ---------------------------------------------------------------- tokens.json
const USE = {
  cyan: 'Accent fills and non-text UI. Text on a cyan fill is `obsidian`.',
  'deep-blue': 'Primary action fill in light mode (text `white`); links on `white`.',
  obsidian: 'Dark-mode background; primary text on `white`; text on cyan, cerulean, crimson, copper and green fills.',
  'vivid-cerulean': 'Primary action fill and accent text in dark mode (text on a cerulean fill is `obsidian`).',
  midnight: 'Secondary dark surface; alternative dark text on `white`.',
  grey: 'Secondary light surface; muted text and borders on dark surfaces. Never text on `white`.',
  white: 'Light-mode background; primary text on dark surfaces.',
  crimson: 'Error and destructive actions. Solid fill, text `obsidian`.',
  copper: 'Warning. Solid fill, text `obsidian`.',
  green: 'Success. Solid fill, text `obsidian`.',
};
const ROLE_USE = {
  bg: 'Page background. Text on it: `fg`, `fg-strong`, `fg-muted`, `accent`.',
  fg: 'Primary text on `bg`.',
  'fg-strong': 'Headings and emphasis on `bg`.',
  'fg-muted': 'Secondary text on `bg` (dark theme: grey; light theme uses obsidian, never grey on white).',
  'bg-alt': 'Secondary surface (cards, footers, hover). Text on it: `fg-on-alt`.',
  'fg-on-alt': 'Text and links on `bg-alt`.',
  accent: 'Links and accent text on `bg`.',
  'border-strong': 'Borders of controls and anything that identifies an input (3:1 on `bg`).',
  'border-subtle': 'Decorative dividers only.',
  'accent-fill': 'Primary button and selected-state fill. Text on it: `on-accent-fill`.',
  'on-accent-fill': 'Text and icons on `accent-fill`.',
  danger: 'Error and destructive fill. Text on it: `on-status`.',
  warning: 'Warning fill. Text on it: `on-status`.',
  success: 'Success fill. Text on it: `on-status`.',
  'on-status': 'Text on `danger`, `warning` and `success` fills (always Obsidian).',
};
const colorTokens = [
  ...core.PALETTE_KEYS.map((k) => ({ name: kebab(k), value: P[k].toLowerCase(), usage: USE[kebab(k)] })),
  ...Object.keys(core.SEMANTIC.light).map((r) => ({
    name: kebab(r),
    value: { light: `{${kebab(core.SEMANTIC.light[r])}}`, dark: `{${kebab(core.SEMANTIC.dark[r])}}` },
    usage: ROLE_USE[kebab(r)],
  })),
];
const F = core.FOUNDATIONS;
const midnight = [4, 15, 73];
const shadow = Object.entries(F.shadow).map(([k, css]) => ({
  name: `shadow-${k}`,
  value: css
    .replace(/rgb\(var\(--hd-midnight-rgb\) \/ ([0-9.]+)\)/g, (_m, a) => `rgba(${midnight.join(', ')}, ${a})`)
    .replace(/\b0px\b/g, '0'),
  usage:
    { 1: 'Resting cards.', 2: 'Raised cards, hovered buttons.', 3: 'Dialogs and popovers.' }[k] +
    ' On dark surfaces separate with a grey border, never shadow alone.',
}));
const styles = (family, list) =>
  list.map(([name, size, lh, w, usage]) => ({ name, fontSize: `${size}px`, lineHeight: lh, fontWeight: w, usage }));
const fs = (k) => core.FOUNDATIONS.fontSize[k] && parseFloat(core.FOUNDATIONS.fontSize[k]) * 16;
const tokens = {
  name: 'HexaData',
  version: 1,
  color: {
    themes: [
      { id: 'light', name: 'Light' },
      { id: 'dark', name: 'Dark' },
    ],
    tokens: colorTokens,
  },
  type: {
    fonts: fontsDoc.files.map((f) => ({
      family: f.family,
      file: `fonts/${f.file.replace('ttf/', '')}`,
      weight: String(f.weight),
      style: 'normal',
    })),
    families: Object.fromEntries(Object.entries(core.FONTS).map(([k, f]) => [k, f.stack.join(', ')])),
    groups: [
      {
        name: 'Display (Space Grotesk)',
        family: 'display',
        styles: styles('display', [
          ['h1', fs('5xl'), 1.2, 700, 'Hero and page titles.'],
          ['h2', fs('4xl'), 1.2, 700, 'Section titles.'],
          ['h3', fs('2xl'), 1.2, 600, 'Sub-sections.'],
          ['h4', fs('xl'), 1.2, 600, 'Card titles.'],
          ['h5', fs('lg'), 1.2, 600, 'Small headings.'],
        ]),
      },
      {
        name: 'Body (Inter Tight)',
        family: 'body',
        styles: styles('body', [
          ['body-lg', fs('lg'), 1.5, 400, 'Lead paragraphs and subtitles.'],
          ['body', fs('base'), 1.5, 400, 'Default text.'],
          ['body-strong', fs('base'), 1.5, 600, 'Emphasis, labels.'],
          ['body-sm', fs('sm'), 1.5, 400, 'Help text, captions.'],
          ['label', fs('xs'), 1.5, 500, 'Badges, small labels.'],
        ]),
      },
      {
        name: 'Detail (JetBrains Mono)',
        family: 'mono',
        styles: styles('mono', [
          ['detail', fs('sm'), 1.7, 400, 'Detailed descriptions and paragraphs (Brand Kit: JetBrains Mono), code.'],
          ['detail-sm', fs('xs'), 1.7, 400, 'Code captions.'],
        ]),
      },
    ],
  },
  spacing: {
    tokens: Object.entries(F.space)
      .filter(([k]) => k !== '0')
      .map(([k, v]) => ({
        name: `space-${k}`,
        value: px(v),
        usage: 'Spacing scale, 4px base (same as Tailwind). Use for padding, gaps and margins.',
      })),
  },
  radius: {
    tokens: Object.entries(F.radius).map(([k, v]) => ({
      name: `radius-${k}`,
      value: px(v),
      usage: {
        none: 'Square corners.',
        sm: 'Badges, small chips.',
        md: 'Buttons, inputs.',
        lg: 'Cards, dialogs.',
        xl: 'Large surfaces.',
        full: 'Pills, avatars, switches.',
      }[k],
    })),
  },
  shadow: { tokens: shadow },
  breakpoint: { tokens: Object.entries(F.breakpoint).map(([k, v]) => ({ name: `bp-${k}`, value: px(v), usage: 'Min-width breakpoint.' })) },
  zIndex: { tokens: Object.entries(F.zIndex).map(([k, v]) => ({ name: `z-${k}`, value: v, usage: 'Layering order.' })) },
};
put('tokens.json', JSON.stringify(tokens, null, 2));

// ---------------------------------------------------------------- README.md (brand book)
const logoRows = logoDoc.variants.map((v) => `| \`${v.id}\` | ${v.form} | ${v.tone} | ${v.background} |`).join('\n');
put(
  'README.md',
  `Use this system for ANYTHING that carries the HexaData brand: web pages, apps, slides, documents, e-mails, charts, social posts. It is generated from the official repository (https://github.com/atriganguly/hexadata-brand, package \`@hexadata/brand\` ${pkg.version}, brand revision ${core.BRAND_REVISION}); the repository is the source of truth and always wins.

## Content fundamentals

- Company: **HexaData**, by **Esconet Technologies Limited**. Descriptor: "${core.BRAND_DESCRIPTOR}". Enterprise hardware engineering vendor: high-performance computing platforms, custom GPU servers, high-density data-centre infrastructure.
- Primary tagline: **${core.DEFAULT_TAGLINES.primary}** Secondary tagline: **${core.DEFAULT_TAGLINES.secondary}** Use them exactly, with their punctuation and capitalisation; never paraphrase or translate them.
- Voice: plain, confident, engineering-first. Write from the customer's side ("Custom Server Solutions, High-Density GPU Systems, and Liquid-Cooled Enterprise Compute"). Say what a system does and how many; no hype, no emoji, no exclamation marks.
- Always spell the name "HexaData" (capital H, capital D, one word).

## Visual foundations

- **Colour.** Ten brand colours only (\`cyan\`, \`deep-blue\`, \`obsidian\`, \`vivid-cerulean\`, \`midnight\`, \`grey\`, \`white\`, \`crimson\`, \`copper\`, \`green\`). Never use any other shade of black, grey or white; pure #000000 / #FFFFFF only as a technical fallback (print, e-mail, forced colours). Style with the semantic roles (\`bg\`, \`fg\`, \`fg-strong\`, \`fg-muted\`, \`bg-alt\`, \`fg-on-alt\`, \`accent\`, \`border-strong\`, \`border-subtle\`, \`accent-fill\`, \`on-accent-fill\`, \`danger\`, \`warning\`, \`success\`, \`on-status\`): they switch with the theme and are the contrast-checked pairings.
- **Contrast rules.** Text on cyan, cerulean, crimson, copper and green fills is \`obsidian\` (white fails there); only \`deep-blue\` takes white text. Never grey text on white. \`obsidian\` and \`midnight\` are 1.08:1 apart: separate dark surfaces with a \`grey\` border. Status is a solid fill with \`on-status\` text and a word, never colour alone. Hover is elevation, underline or \`bg-alt\`, never a new shade.
- **Type.** Space Grotesk for titles, headings and hero text (\`h1\`-\`h5\`); Inter Tight for subtitles, body and descriptions; JetBrains Mono for detailed descriptions, paragraphs of specification text and code (\`detail\`). Weights 400/500/600/700 only. Fonts are SIL OFL, files in \`fonts/\`.
- **Spacing and shape.** 4px base scale (\`space-1\`..\`space-24\`); radius \`radius-md\` 8px for buttons and inputs, \`radius-lg\` 12px for cards and dialogs, \`radius-full\` for pills. Elevation \`shadow-1\`..\`shadow-3\` tinted with \`midnight\`. Targets at least 44px. Motion 120/200/320ms, none under reduced-motion.
- **Themes.** Light (\`white\` ground) and Dark (\`obsidian\` ground). Always design both.
- **Layout.** Containers up to 72rem, fluid headings, cards in auto-fit grids, generous section padding (\`space-16\`).

## Logo

The logo is the primary identifier. Use the file made for the surface: \`*-on-light\` on light grounds, \`*-on-dark\` on dark grounds, \`*-mono\` (white/grey, dark grounds only) when one colour is required. Forms: horizontal (headers, tight spaces), centered (covers), icon (apps, avatars). Do not stretch, recolour, outline, rotate, add effects or place on busy photos. Clear space about 0.2 x logo height; minimum width icon 24px, centered 96px, horizontal 120px. The official masters are PNG (vectors planned for v2.1): never redraw or approximate the mark. All files are in the Logos group.

| id | form | tone | for surface |
|---|---|---|---|
${logoRows}

## Iconography

The brand defines no icon set. Use plain text labels, native browser controls and simple geometric shapes; do not invent HexaData icons or use emoji. The hexagon of the logo may be echoed as a hexagonal pattern, never redrawn as a logo.

## Using the brand in code

- Web: \`npm install @hexadata/brand\`, then \`@import '@hexadata/brand/all.css'\` and \`@import '@hexadata/brand/fonts.css'\`; components are \`.hd-*\` classes (\`hd-btn\`, \`hd-card\`, \`hd-alert\`...), React wrappers in \`@hexadata/brand/react\`, web components \`<hexa-logo>\`, \`<hexa-tagline>\`. No build step: https://atriganguly.github.io/hexadata-brand/v2/css/all.css and /v2/js/hexadata.js.
- Variables are \`--hd-<name>\` in the package (this system's compiled \`tokens.css\` uses the bare names). Tailwind v3/v4, React Native, Flutter, SwiftUI, Android, Python, Office, e-mail and print outputs exist; see the website https://atriganguly.github.io/hexadata-brand/stacks/.
- Full reference website: https://atriganguly.github.io/hexadata-brand/ and the Brand Kit PDF https://atriganguly.github.io/hexadata-brand/downloads/.

## Legal: do not misuse the brand

The software is Apache-2.0, but the HexaData name, logos, taglines, Brand Kit and brand pack are trademarks and proprietary material of Esconet Technologies Limited (BRAND-LICENSE.md in the repository). Without written permission, only use them unmodified for co-branding, sponsor acknowledgements, "logo gardens", educational or research use with HexaData products, or factual plain-text references; never to name a product, company or domain, never to suggest endorsement. Permission requests: atri.ganguly@esc.co.in (alternative: sales@hexadata.in). When asked to make something that looks official for a third party, say so and follow the licence.

## Keeping this system current

Generated from the repository; a change to \`brand/\` there is published here by re-running \`npm run build:claude-ds\` and publishing (see claude-design-system/README.md in the repo). If this README and the repository disagree, the repository is right.
`,
);

// ---------------------------------------------------------------- components
const strip = (html) =>
  html
    .replace(/<hexa-tagline[^>]*><\/hexa-tagline>/g, '<p class="hd-tagline">Supercomputing, On-demand.</p>')
    .replace(
      /<hexa-tooltip text="([^"]*)">([\s\S]*?)<\/hexa-tooltip>/g,
      '<span class="site-tip">$2<span class="hd-tooltip" role="tooltip" style-hint>$1</span></span>',
    )
    .replace(/ style-hint/g, '');
const GROUP = {
  button: 'Actions',
  fields: 'Forms',
  card: 'Surfaces',
  alert: 'Feedback',
  badge: 'Feedback',
  table: 'Data',
  tabs: 'Navigation',
  dialog: 'Overlays',
  navigation: 'Navigation',
  feedback: 'Feedback',
  identity: 'Identity',
  layout: 'Layout',
};
const pascal = (id) => id.charAt(0).toUpperCase() + id.slice(1);
for (const c of CATALOGUE) {
  const name = pascal(c.id);
  const h = Math.max(120, Math.min(420, 80 + Math.round(strip(c.html).length / 6)));
  put(
    `components/${name}/README.md`,
    `${c.description}\n\n**Accessibility.** ${c.a11y}\n\n**Markup** (CSS classes from \`@hexadata/brand/all.css\`; roles and tokens switch with the theme automatically):\n\n\`\`\`html\n${c.html}\n\`\`\`\n${c.react ? `\n**React** (\`@hexadata/brand/react\`):\n\n\`\`\`tsx\n${c.react}\n\`\`\`\n` : ''}`,
  );
  const dialogScript =
    c.id === 'dialog'
      ? '<script>document.addEventListener("click",function(e){var b=e.target.closest("[data-open-dialog]");if(b){var d=document.getElementById(b.dataset.openDialog);if(d&&d.showModal)d.showModal();}});</script>'
      : '';
  put(
    `components/${name}/preview.html`,
    `<!-- @dsCard group="${GROUP[c.id]}" height=${h} subtitle="${c.name}" -->\n<div class="hd-surface" id="root" style="padding:16px">${strip(c.html)}</div>\n${dialogScript}`,
  );
}
// Logo component: the uploaded files, each on its designed surface.
const logoTile = (id, surf) => {
  const u = assets.uploads[id];
  return `<figure class="t ${surf}"><img src="/_blob/${u.blob}" alt="HexaData logo ${id}" style="max-height:${id.startsWith('icon') ? 96 : id.startsWith('centered') ? 110 : 56}px"><figcaption>${id}</figcaption></figure>`;
};
put(
  'components/Logo/README.md',
  `The HexaData logo, one file per form and surface (see the README for rules). Use \`*-on-light\` on light grounds and \`*-on-dark\` on dark grounds; \`*-mono\` only on dark grounds. The files are the official PNG masters in the Logos asset group; never redraw them.\n`,
);
put(
  'components/Logo/preview.html',
  `<!-- @dsCard group="Identity" height=520 subtitle="Official logo files" -->
<style>.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;padding:16px}.t{margin:0;padding:16px 12px 8px;border:1px solid var(--grey);border-radius:var(--radius-lg);display:grid;gap:8px;justify-items:center}.t figcaption{font:12px var(--font-mono)}.l{background:var(--white);color:var(--obsidian)}.d{background:var(--obsidian);color:var(--white)}.t img{max-width:100%}</style>
<div class="g">${[
    ['horizontal-primary-on-light', 'l'],
    ['horizontal-primary-on-dark', 'd'],
    ['horizontal-mono', 'd'],
    ['centered-primary-on-light', 'l'],
    ['centered-primary-on-dark', 'd'],
    ['centered-mono', 'd'],
    ['icon-on-light', 'l'],
    ['icon-on-dark', 'd'],
  ]
    .map(([id, s]) => logoTile(id, s))
    .join('')}</div>
`,
);

// Cover (palette blocks + hexagon pattern, name bottom-left)
const hex = (cx, cy, r) =>
  `${[0, 1, 2, 3, 4, 5].map((i) => `${(cx + r * Math.cos((Math.PI / 3) * i + Math.PI / 6)).toFixed(1)},${(cy + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)).toFixed(1)}`).join(' ')}`;
const hexes = [];
for (let row = 0; row < 3; row++)
  for (let col = 0; col < 4; col++) hexes.push(`<polygon class="hx" points="${hex(530 + col * 52 + (row % 2) * 26, 50 + row * 45, 22)}"/>`);
put(
  'components/Cover/preview.html',
  `<!-- @dsCard height=300 -->
<!--
blocks: deep-blue 288x240 slab, cyan 156x112, vivid-cerulean 156x112, copper 80x112 accent, grey 156x120 (radius-lg corners)
arrangement: one tall slab with satellites stacked to its right, bleeding to the right edge
pattern: hexagon grid at a 4px-scale pitch, ground-coloured outlines cut into the slab (the logo is a hexagon)
steps/radii: space-6 gaps, radius-lg corners
-->
<style>
html,body{margin:0}
.cover{width:960px;height:300px;position:relative;background:var(--bg);overflow:hidden}
.cover svg{position:absolute;left:0;top:0}
.deep{fill:var(--deep-blue)}.cy{fill:var(--cyan)}.vc{fill:var(--vivid-cerulean)}.cu{fill:var(--copper)}.gr{fill:var(--grey)}
.hx{fill:none;stroke:var(--bg);stroke-width:2}
.name{position:absolute;left:32px;bottom:62px;font:700 80px/.95 var(--font-display);color:var(--fg-strong);letter-spacing:-.01em;margin:0}
.tag{position:absolute;left:32px;bottom:30px;font:400 14px/1.4 var(--font-body);color:var(--fg-muted);margin:0}
</style>
<div class="cover">
<svg width="960" height="300" viewBox="0 0 960 300" role="img" aria-label="HexaData brand colours and hexagon pattern">
<rect class="deep" x="504" y="24" width="288" height="252" rx="12"/>
<rect class="cy" x="816" y="24" width="120" height="112" rx="12"/>
<rect class="vc" x="816" y="148" width="120" height="68" rx="12"/>
<rect class="cu" x="816" y="228" width="56" height="48" rx="12"/>
<rect class="gr" x="884" y="228" width="52" height="48" rx="12"/>
${hexes.join('\n')}
</svg>
<h1 class="name">HexaData</h1>
<p class="tag">${core.DEFAULT_TAGLINES.primary}</p>
</div>
`,
);

// ---------------------------------------------------------------- bundle.css (our real stylesheet, so previews render exactly like production) and fonts
put('components/bundle.css', ['hexadata.css', 'base.css', 'components.css'].map((f) => read(`src/css/${f}`)).join('\n'));

// ---------------------------------------------------------------- index (written last)
const groupFiles = {};
for (const v of logoDoc.variants) {
  const u = assets.uploads[v.id];
  groupFiles[u.file] = { name: u.file, blob: u.blob, size: u.size, type: 'image/png' };
}
put(
  'assets/Logos/README.md',
  `Official HexaData logo files (PNG masters; vectors planned for v2.1). Light-surface files have dark text; \`*-on-dark\` and \`*-mono\` have light text and are for dark grounds only. Icons are opaque tiles (white or dark) for app and social avatars. Trademarks of Esconet Technologies Limited: use only as BRAND-LICENSE.md permits.\n`,
);
const index = {
  v: 3,
  layout: 'files',
  title: 'HexaData',
  namespace: 'HexaData',
  libraries: [],
  sections: {},
  groups: ['Logos'],
  assetGroups: { Logos: { name: 'Logos', tile: 'l', order: Object.keys(groupFiles), files: groupFiles } },
  blobs: {},
  docs: { sections: [] },
};
// (the index's createdOnFiles marker and lastChange are added by the publisher, which reads the live index first)

if (args.includes('--hash')) {
  const h = createHash('sha256');
  for (const [p, t] of [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) h.update(`${p}\0${t}\0`);
  h.update(JSON.stringify(index));
  for (const f of fontsDoc.files) h.update(f.sha256);
  for (const v of logoDoc.variants) h.update(v.sha256);
  console.log(h.digest('hex').slice(0, 16));
} else {
  rmSync(out, { recursive: true, force: true });
  for (const [p, t] of files) {
    mkdirSync(dirname(join(out, 'project', p)), { recursive: true });
    writeFileSync(join(out, 'project', p), t);
  }
  mkdirSync(join(out, 'project/fonts'), { recursive: true });
  for (const f of fontsDoc.files) cpSync(join(root, 'brand/fonts', f.file), join(out, 'project/fonts', f.file.replace('ttf/', '')));
  writeFileSync(join(out, 'index.template.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`claude-ds: wrote ${files.size + fontsDoc.files.length + 1} files -> ${out}/project`);
}
