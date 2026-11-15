import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';
import { HexaProvider, HexaTagline, useHexaBrand } from '../src/react/index.ts';
import { resolveNativeTheme, HexaNativeProvider, useHexaNativeTheme } from '../src/native/index.tsx';
import { DEFAULT_MANIFEST, DEFAULT_PALETTE, DEFAULT_TAGLINES } from '../src/core/index.ts';

test('HexaTagline renders the primary tagline by default, secondary on request', () => {
  assert.equal(renderToString(<HexaTagline />), `<p>${DEFAULT_TAGLINES.primary}</p>`);
  assert.equal(renderToString(<HexaTagline variant="secondary" />), `<p>${DEFAULT_TAGLINES.secondary}</p>`);
});

test('HexaTagline works without a provider and passes props through once', () => {
  const html = renderToString(<HexaTagline className="hero" id="t" />);
  assert.equal(html, `<p class="hero" id="t">${DEFAULT_TAGLINES.primary}</p>`);
});

test('HexaProvider without `remote` renders the baked-in brand and does nothing else (SSR-identical)', () => {
  const Probe = () => <span>{useHexaBrand().tokens.palette.cyan}</span>;
  assert.equal(
    renderToString(
      <HexaProvider>
        <Probe />
      </HexaProvider>,
    ),
    `<span>${DEFAULT_PALETTE.cyan}</span>`,
  );
});

test('taglines are escaped by React (markup is text)', () => {
  // The manifest layer allows markup-looking text as data; the renderer must escape it.
  const html = renderToString(<p>{'<img src=x onerror=alert(1)>'}</p>);
  assert.ok(!html.includes('<img'));
});

test('react entry source never uses dangerouslySetInnerHTML or storage', async () => {
  const { readFileSync } = await import('node:fs');
  for (const f of ['../src/react/HexaProvider.tsx', '../src/react/HexaTagline.tsx', '../src/native/index.tsx', '../src/core/remote.ts']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(
      !/dangerouslySetInnerHTML|localStorage|sessionStorage|AsyncStorage|document\.cookie|indexedDB|eval\(|new Function/.test(src),
      f,
    );
  }
});

test('native theme resolution is mode-aware and uses semantic roles', () => {
  const light = resolveNativeTheme(DEFAULT_MANIFEST, 'light');
  const dark = resolveNativeTheme(DEFAULT_MANIFEST, 'dark');
  assert.equal(light.colors.bg, DEFAULT_PALETTE.white);
  assert.equal(light.colors.fg, DEFAULT_PALETTE.obsidian);
  assert.equal(dark.colors.bg, DEFAULT_PALETTE.obsidian);
  assert.equal(dark.colors.fg, DEFAULT_PALETTE.white);
  assert.equal(dark.colors.fgMuted, DEFAULT_PALETTE.grey);
});

test('native provider + hook render with defaults and no remote', () => {
  const Probe = () => <>{useHexaNativeTheme('dark').colors.bg}</>;
  assert.equal(
    renderToString(
      <HexaNativeProvider>
        <Probe />
      </HexaNativeProvider>,
    ),
    DEFAULT_PALETTE.obsidian,
  );
});

test('component wrappers emit the .hd-* classes and accessible defaults (SSR)', async () => {
  const { Alert, Badge, Button, ButtonLink, Card, Spinner, TextField } = await import('../src/react/index.ts');
  assert.equal(renderToString(<Button>Go</Button>), '<button type="button" class="hd-btn">Go</button>');
  assert.equal(
    renderToString(
      <Button variant="danger" size="sm" block>
        x
      </Button>,
    ),
    '<button type="button" class="hd-btn hd-btn--danger hd-btn--sm hd-btn--block">x</button>',
  );
  assert.match(renderToString(<ButtonLink href="/a">A</ButtonLink>), /^<a class="hd-btn" href="\/a">A<\/a>$/);
  assert.match(renderToString(<Alert tone="danger">e</Alert>), /role="alert" class="hd-alert hd-alert--danger"/);
  assert.match(renderToString(<Alert tone="success">ok</Alert>), /role="status"/);
  assert.equal(renderToString(<Badge tone="accent">b</Badge>), '<span class="hd-badge hd-badge--accent">b</span>');
  assert.match(renderToString(<Card alt>c</Card>), /class="hd-card hd-card--alt"/);
  assert.match(renderToString(<Spinner label="Loading" />), /role="status"[^>]*><span class="hd-sr-only">Loading<\/span>/);
  const f = renderToString(<TextField label="Email" help="We never share it" error="Required" />);
  assert.match(f, /aria-invalid="true"/);
  assert.match(f, /aria-describedby="[^"]+-help [^"]+-error"/);
  assert.match(f, /<label class="hd-label" for=/);
});

test('native theme exposes foundations in dp', () => {
  const t = resolveNativeTheme(DEFAULT_MANIFEST, 'light');
  assert.equal(t.space['4'], 16);
  assert.equal(t.radius['md'], 8);
  assert.equal(t.fontSize['base'], 16);
  assert.equal(t.duration['base'], 200);
  assert.equal(t.colors.accentFill, DEFAULT_PALETTE.deepBlue);
});

test('HexaLogo renders both artworks, hosted base by default, overridable base, mono fallback on light', async () => {
  const { HexaLogo } = await import('../src/react/index.ts');
  const { BRAND_ORIGIN } = await import('../src/core/index.ts');
  const html = renderToString(<HexaLogo />);
  assert.ok(html.includes(`src="${BRAND_ORIGIN}/v2/logo/horizontal-primary-on-light.png?v=`), 'hosted base + content-hash cache buster');
  assert.match(html, /\?v=[0-9a-f]{12}"/);
  assert.match(html, /hd-logo__img--on-dark/);
  assert.match(html, /data-on="auto"/);
  const self = renderToString(<HexaLogo form="icon" base="/brand/logo" iconSize={512} format="webp" alt="" />);
  assert.ok(self.includes('src="/brand/logo/icon-on-light-512.webp?v='));
  const mono = renderToString(<HexaLogo tone="mono" />);
  assert.ok(mono.includes('horizontal-primary-on-light.png')); // no mono artwork for light surfaces
  assert.ok(mono.includes('horizontal-mono.png'));
});
