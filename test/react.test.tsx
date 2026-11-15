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
