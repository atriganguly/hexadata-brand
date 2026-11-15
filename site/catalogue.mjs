// One source for every component example: rendered live on the Components page AND shown as copyable code,
// so the documentation can never drift from the markup. Strings are authored here (trusted); they are never user input.
export const CATALOGUE = [
  {
    id: 'button',
    name: 'Button',
    description: 'Primary, secondary, ghost and danger, in three sizes. Targets are at least 44 px (32 px for small).',
    a11y: 'Use a real <button> for actions and <a> for navigation. Hover adds elevation and an underline, never a new colour shade. Focus ring is always visible.',
    html: `<div class="hd-cluster">
  <button class="hd-btn">Get started</button>
  <button class="hd-btn hd-btn--secondary">Secondary</button>
  <button class="hd-btn hd-btn--ghost">Ghost</button>
  <button class="hd-btn hd-btn--danger">Delete</button>
  <button class="hd-btn" disabled>Disabled</button>
</div>
<div class="hd-cluster">
  <button class="hd-btn hd-btn--sm">Small</button>
  <button class="hd-btn">Medium</button>
  <button class="hd-btn hd-btn--lg">Large</button>
</div>`,
    react: `<Button>Get started</Button>
<Button variant="secondary" size="sm">Secondary</Button>
<ButtonLink href="/docs" variant="ghost">Docs</ButtonLink>`,
  },
  {
    id: 'fields',
    name: 'Form fields',
    description: 'Label, input, help and error text wired together. Errors use a bar plus the message, never colour alone.',
    a11y: 'Connect help and error text with aria-describedby and set aria-invalid. The React TextField does this for you.',
    html: `<div class="hd-stack">
  <div class="hd-field">
    <label class="hd-label" for="f-email">Work email</label>
    <input class="hd-input" id="f-email" type="email" placeholder="you@company.com" aria-describedby="f-email-help">
    <p class="hd-help" id="f-email-help">We only use it to reply to you.</p>
  </div>
  <div class="hd-field">
    <label class="hd-label" for="f-name">Name</label>
    <input class="hd-input" id="f-name" aria-invalid="true" aria-describedby="f-name-err">
    <p class="hd-error" id="f-name-err">Enter your name.</p>
  </div>
  <label class="hd-choice"><input class="hd-check" type="checkbox"> Send me product updates</label>
  <label class="hd-choice"><input class="hd-switch" type="checkbox" role="switch"> Dark mode</label>
</div>`,
    react: `<TextField label="Work email" help="We only use it to reply to you." type="email" />
<TextField label="Name" error="Enter your name." />`,
  },
  {
    id: 'card',
    name: 'Card',
    description: 'A surface with a subtle border and elevation. The alternate card uses the secondary surface.',
    a11y: 'Separate dark surfaces with the grey border, never by colour alone. Links inside the alternate card switch to the strong text colour automatically.',
    html: `<div class="hd-grid">
  <div class="hd-card"><h3>Custom servers</h3><p>Engineered to your workload.</p><a class="hd-link" href="#">Learn more</a></div>
  <div class="hd-card hd-card--alt"><h3>GPU systems</h3><p>High-density, liquid-cooled.</p><a href="#">Learn more</a></div>
</div>`,
    react: `<Card><h3>Custom servers</h3></Card>
<Card alt interactive>…</Card>`,
  },
  {
    id: 'alert',
    name: 'Alert',
    description: 'Status uses solid fills with Obsidian text, the only way every status colour keeps 4.5:1 in both themes.',
    a11y: 'Danger and warning use role="alert"; others role="status". Never rely on colour alone: write the status in the text.',
    html: `<div class="hd-stack">
  <div class="hd-alert hd-alert--success" role="status"><strong>Saved.</strong> Your changes are live.</div>
  <div class="hd-alert hd-alert--warning" role="alert"><strong>Heads up.</strong> Maintenance starts at 02:00.</div>
  <div class="hd-alert hd-alert--danger" role="alert"><strong>Error.</strong> The payment failed.</div>
  <div class="hd-alert hd-alert--accent" role="status">New: liquid-cooled GPU racks.</div>
  <div class="hd-alert" role="status">Neutral information.</div>
</div>`,
    react: `<Alert tone="success"><strong>Saved.</strong> Your changes are live.</Alert>`,
  },
  {
    id: 'badge',
    name: 'Badge',
    description: 'Compact labels. Status badges are solid fills with Obsidian text.',
    a11y: 'Put the meaning in the text ("Active"), not only in the colour.',
    html: `<div class="hd-cluster">
  <span class="hd-badge">Neutral</span>
  <span class="hd-badge hd-badge--accent">New</span>
  <span class="hd-badge hd-badge--success">Active</span>
  <span class="hd-badge hd-badge--warning">Pending</span>
  <span class="hd-badge hd-badge--danger">Failed</span>
</div>`,
    react: `<Badge tone="success">Active</Badge>`,
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Tabular numbers, strong header rule, subtle row rules, scrolls horizontally on small screens.',
    a11y: 'Use <caption>, <th scope> and keep the wrapper focusable only if it scrolls.',
    html: `<div class="hd-table-wrap">
  <table class="hd-table">
    <caption>GPU systems</caption>
    <thead><tr><th scope="col">Model</th><th scope="col">GPUs</th><th scope="col">Cooling</th></tr></thead>
    <tbody>
      <tr><th scope="row">HX-8</th><td>8</td><td>Liquid</td></tr>
      <tr><th scope="row">HX-4</th><td>4</td><td>Air</td></tr>
    </tbody>
  </table>
</div>`,
    react: null,
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Selected tab gets a thick accent underline and bold weight, so it never depends on colour alone.',
    a11y: 'Needs the ARIA tabs pattern: role="tablist", role="tab" with aria-selected and aria-controls, role="tabpanel", arrow-key navigation (app code).',
    html: `<div role="tablist" class="hd-tabs" aria-label="Product views">
  <button role="tab" aria-selected="true" id="t1" aria-controls="p1">Overview</button>
  <button role="tab" aria-selected="false" id="t2" aria-controls="p2" tabindex="-1">Specs</button>
  <button role="tab" aria-selected="false" id="t3" aria-controls="p3" tabindex="-1">Support</button>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1" class="hd-card"><p>Overview content.</p></div>`,
    react: null,
  },
  {
    id: 'dialog',
    name: 'Dialog',
    description: 'Built on the native <dialog>: focus trapping, Esc to close and the backdrop come from the browser.',
    a11y: 'Give it a heading and label (aria-labelledby). Return focus to the opener on close (the browser does this for showModal()).',
    html: `<button class="hd-btn hd-btn--secondary" data-open-dialog="demo-dialog">Open dialog</button>
<dialog class="hd-dialog" id="demo-dialog" aria-labelledby="demo-dialog-title">
  <h3 id="demo-dialog-title">Confirm</h3>
  <p>This action cannot be undone.</p>
  <form method="dialog" class="hd-cluster"><button class="hd-btn hd-btn--danger" value="ok">Delete</button><button class="hd-btn hd-btn--secondary" value="cancel">Cancel</button></form>
</dialog>`,
    react: null,
  },
  {
    id: 'navigation',
    name: 'Breadcrumb & pagination',
    description: 'Breadcrumbs mark the current page with aria-current; pagination reuses small buttons.',
    a11y: 'Wrap in <nav> with an aria-label. aria-current="page" is also what styles the current item.',
    html: `<nav class="hd-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li><li><a href="#">Products</a></li><li aria-current="page">HX-8</li></ol></nav>
<nav aria-label="Pagination"><ul class="hd-pagination">
  <li><a class="hd-btn hd-btn--secondary hd-btn--sm" href="#">Previous</a></li>
  <li><a class="hd-btn hd-btn--secondary hd-btn--sm" href="#">1</a></li>
  <li><a class="hd-btn hd-btn--sm" href="#" aria-current="page">2</a></li>
  <li><a class="hd-btn hd-btn--secondary hd-btn--sm" href="#">Next</a></li>
</ul></nav>`,
    react: null,
  },
  {
    id: 'feedback',
    name: 'Spinner, skeleton, tooltip',
    description: 'Loading and hint patterns. Animations stop under prefers-reduced-motion.',
    a11y: 'The spinner needs a text label. The tooltip is dismissible with Esc and stays while hovered or focused (WCAG 1.4.13).',
    html: `<div class="hd-cluster">
  <span class="hd-spinner" role="status"><span class="hd-sr-only">Loading</span></span>
  <div class="hd-skeleton site-skel" aria-hidden="true"></div>
  <hexa-tooltip text="Opens the documentation"><a class="hd-btn hd-btn--ghost" href="#">Hover or focus me</a></hexa-tooltip>
</div>`,
    react: `<Spinner label="Loading" />`,
  },
  {
    id: 'identity',
    name: 'Avatar, code, tagline',
    description: 'Identity helpers: avatar initials, code blocks in JetBrains Mono, and the brand taglines.',
    a11y: 'Give avatars an accessible name (aria-label) when they carry meaning.',
    html: `<div class="hd-cluster"><span class="hd-avatar" aria-label="Atri Ganguly">AG</span><hexa-tagline variant="primary"></hexa-tagline></div>
<pre class="hd-code"><code>npm install @hexadata/brand</code></pre>`,
    react: `<HexaTagline variant="secondary" />`,
  },
  {
    id: 'layout',
    name: 'Layout primitives',
    description: 'Container, stack, cluster, grid, section and hero: composition without custom CSS.',
    a11y: 'These are layout only; use real landmarks (header, nav, main, footer) around them.',
    html: `<div class="hd-container hd-stack">
  <p class="hd-eyebrow">Eyebrow</p>
  <h3>Stack of content</h3>
  <div class="hd-grid"><div class="hd-card">One</div><div class="hd-card">Two</div><div class="hd-card">Three</div></div>
</div>`,
    react: `<Container><Stack>…</Stack></Container>`,
  },
];
