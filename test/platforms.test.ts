import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PALETTE, FOUNDATIONS, PALETTE_KEYS, SEMANTIC } from '../src/core/index.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string): string => readFileSync(join(root, f), 'utf8');
const hex = (k: string): string => (DEFAULT_PALETTE as Record<string, string>)[k]!.slice(1).toUpperCase();

test('every platform output contains every palette colour exactly as in the Brand Kit', () => {
  const files = [
    'platforms/python/src/hexadata_brand/tokens.py',
    'platforms/flutter/lib/src/tokens.dart',
    'platforms/swift/Sources/HexaDataBrand/Tokens.swift',
    'platforms/android/hexadata-brand/src/main/kotlin/com/hexadata/brand/Tokens.kt',
    'platforms/android/hexadata-brand/src/main/res/values/hexadata_colors.xml',
    'platforms/print/colors.json',
  ];
  for (const f of files) {
    const text = read(f).toUpperCase();
    for (const k of PALETTE_KEYS) assert.ok(text.includes(hex(k)), `${f} is missing ${k} (#${hex(k)})`);
    // The print sheet records the Brand Kit's documented black/white FALLBACKS separately; they are never palette tokens anywhere.
    if (!f.endsWith('colors.json'))
      assert.ok(!/(0xFF000000|#000000\b|0xFFFFFFFF|#FFFFFF\b)/i.test(text), `${f}: pure black/white must never be a token`);
  }
});

test('every semantic role exists on every platform, in both themes', () => {
  const roles = Object.keys(SEMANTIC.light);
  const camel = (s: string): string => s;
  const snake = (s: string): string => s.replace(/([A-Z])/g, '_$1').toLowerCase();
  const dart = read('platforms/flutter/lib/src/tokens.dart');
  const swift = read('platforms/swift/Sources/HexaDataBrand/Tokens.swift');
  const kotlin = read('platforms/android/hexadata-brand/src/main/kotlin/com/hexadata/brand/Tokens.kt');
  const night = read('platforms/android/hexadata-brand/src/main/res/values-night/hexadata_colors.xml');
  const py = read('platforms/python/src/hexadata_brand/tokens.py');
  for (const r of roles) {
    assert.ok(dart.includes(`final Color ${camel(r)};`), `dart ${r}`);
    assert.ok(swift.includes(`static let ${camel(r)} = Color.hexaDynamic`), `swift ${r}`);
    assert.ok(kotlin.includes(`val ${camel(r)}: Color,`), `kotlin ${r}`);
    assert.ok(night.includes(`name="hd_${snake(r)}"`), `android night ${r}`);
    assert.ok(py.includes(`"${snake(r)}":`), `python ${r}`);
  }
  assert.ok(night.includes(`>#${hex('obsidian')}<`), 'dark bg is obsidian in values-night');
});

test('scales are numeric and match the web foundations (rem x 16)', () => {
  assert.match(read('platforms/flutter/lib/src/tokens.dart'), /static const double s4 = 16;/);
  assert.match(read('platforms/swift/Sources/HexaDataBrand/Tokens.swift'), /static let s4: CGFloat = 16/);
  assert.match(read('platforms/android/hexadata-brand/src/main/res/values/hexadata_dimens.xml'), /hd_space_4">16dp/);
  assert.equal(FOUNDATIONS.space['4'], '1rem');
});

test('office theme files are well-formed and map the palette', () => {
  const colors = read('platforms/office/HexaData.theme-colors.xml');
  assert.ok(colors.includes(`<a:dk1><a:srgbClr val="${hex('obsidian')}"/></a:dk1>`));
  assert.ok(colors.includes(`<a:lt1><a:srgbClr val="${hex('white')}"/></a:lt1>`));
  assert.ok(colors.includes(`<a:accent1><a:srgbClr val="${hex('deepBlue')}"/></a:accent1>`));
  const fonts = read('platforms/office/HexaData.theme-fonts.xml');
  assert.ok(fonts.includes('typeface="Space Grotesk"') && fonts.includes('typeface="Inter Tight"'));
  for (const xml of [colors, fonts]) {
    const tags = [...xml.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([A-Za-z:]+)[^>]*?(\/?)>/g)];
    const stack: string[] = [];
    for (const [, close, name, self] of tags) {
      if (self || name!.startsWith('?')) continue;
      if (close) assert.equal(stack.pop(), name, 'unbalanced tag');
      else stack.push(name!);
    }
    assert.deepEqual(stack, []);
  }
});

test('email template: literal hex + system fallbacks, no CSS variables, bulletproof button, trademark line', () => {
  const html = read('platforms/email/template.html');
  assert.ok(!/var\(--/.test(html));
  assert.ok(html.includes(`bgcolor="#${hex('deepBlue')}"`) || html.toUpperCase().includes(`BGCOLOR="#${hex('deepBlue')}"`));
  assert.ok(html.includes('{{cta_url}}') && html.includes('trademark of Esconet Technologies Limited'));
  assert.ok(/font-family:[^;]*Arial/.test(html), 'must fall back to a system font');
});

test('print sheet is explicitly UNPROOFED and never invents Pantone values', () => {
  const sheet = JSON.parse(read('platforms/print/colors.json')) as {
    status: string;
    colors: Record<string, { pantone: unknown; cmykNominal: number[] }>;
  };
  assert.equal(sheet.status, 'UNPROOFED');
  for (const c of Object.values(sheet.colors)) {
    assert.equal(c.pantone, null);
    assert.equal(c.cmykNominal.length, 4);
  }
});

test('python package imports and passes its own tests when Python is available', (t) => {
  const py = process.platform === 'win32' ? 'python' : 'python3';
  const probe = spawnSync(py, ['--version'], { encoding: 'utf8' });
  if (probe.status !== 0) return t.skip('python is not installed');
  const r = spawnSync(py, ['-m', 'unittest', 'discover', '-s', 'platforms/python/tests'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: join(root, 'platforms/python/src') },
  });
  assert.equal(r.status, 0, r.stderr);
  const check = spawnSync(py, ['-c', 'from hexadata_brand import PALETTE; print(PALETTE["cyan"])'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: join(root, 'platforms/python/src') },
  });
  assert.equal(check.stdout.trim(), DEFAULT_PALETTE.cyan);
});
