import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isHex6 } from '../../src/core/contrast.ts';
import type { FoundationGroup, Foundations, LogoVariantSpec, Tokens, TrustedKeySpec } from './types.ts';

/** Reads brand/ (DTCG 2025.10 token files + contrast.json + content.json) into the flat model emitters use. */

type Json = Record<string, unknown>;
const read = (root: string, rel: string): Json => JSON.parse(readFileSync(resolve(root, rel), 'utf8')) as Json;
const fail = (msg: string): never => {
  throw new Error(`brand/: ${msg}`);
};
const obj = (v: unknown, path: string): Json =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : fail(`${path} must be an object`);

function hexOf(token: unknown, path: string): string {
  const v = obj(token, path)['$value'];
  const hex = typeof v === 'object' && v !== null ? (v as Json)['hex'] : v;
  if (typeof hex !== 'string' || !isHex6(hex.toUpperCase())) return fail(`${path} has no valid #RRGGBB hex`);
  return hex.toUpperCase();
}

const num = (v: unknown, path: string): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fail(`${path} must be a finite number`);

function unitValue(v: unknown, path: string, units: string[]): string {
  const o = obj(v, path);
  const unit = String(o['unit']);
  if (!units.includes(unit)) fail(`${path} unit must be one of ${units.join('/')}`);
  const n = num(o['value'], `${path}.value`);
  return n === 0 && unit !== 'ms' ? '0' : `${n}${unit}`;
}

/** Reads one DTCG group (children with $value) and converts each to its CSS value. */
function group(root: Json, key: string, convert: (value: unknown, path: string, token: Json) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, tok] of Object.entries(obj(root[key], key))) {
    if (name.startsWith('$')) continue;
    const t = obj(tok, `${key}.${name}`);
    out[name] = convert(t['$value'], `${key}.${name}`, t);
  }
  return out;
}

function shadowValue(value: unknown, path: string, token: Json): string {
  const layers = Array.isArray(value) ? value : fail(`${path} must be a shadow array`);
  const alphas = (obj(obj(token['$extensions'], `${path}.$extensions`)['com.hexadata'], 'com.hexadata')['alpha'] ?? []) as number[];
  return layers
    .map((l, i) => {
      const o = obj(l, `${path}[${i}]`);
      const m = typeof o['color'] === 'string' ? /^\{color\.([A-Za-z0-9]+)\}$/.exec(o['color']) : null;
      if (!m) fail(`${path}[${i}].color must alias a palette colour like {color.midnight}`);
      const kebab = m![1]!.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      const px = (k: string): string => unitValue(o[k], `${path}[${i}].${k}`, ['px']);
      return `${px('offsetX')} ${px('offsetY')} ${px('blur')} ${px('spread')} rgb(var(--hd-${kebab}-rgb) / ${num(alphas[i], `${path}.alpha[${i}]`)})`;
    })
    .join(', ');
}

function loadFoundations(root: string): Foundations {
  const rd = (f: string): Json => read(root, `brand/tokens/${f}.tokens.json`);
  const dimension = (v: unknown, p: string): string => unitValue(v, p, ['rem', 'px']);
  const typography = obj(rd('typography')['font'], 'font');
  const motion = obj(rd('motion')['motion'], 'motion');
  const f: Record<FoundationGroup, Record<string, string>> = {
    space: group(rd('space'), 'space', dimension),
    radius: group(rd('radius'), 'radius', dimension),
    shadow: group(rd('shadow'), 'shadow', shadowValue),
    duration: group(motion, 'duration', (v, p) => unitValue(v, p, ['ms'])),
    easing: group(motion, 'easing', (v, p) => {
      const a = Array.isArray(v) && v.length === 4 ? v : fail(`${p} must be 4 numbers`);
      return `cubic-bezier(${a.map((n, i) => num(n, `${p}[${i}]`)).join(', ')})`;
    }),
    fontSize: group(typography, 'size', dimension),
    lineHeight: group(typography, 'lineHeight', (v, p) => String(num(v, p))),
    breakpoint: group(rd('breakpoint'), 'breakpoint', dimension),
    zIndex: group(rd('z-index'), 'z', (v, p) => String(num(v, p))),
  };
  return f;
}

export function loadModel(root: string): Tokens {
  const content = read(root, 'brand/content.json');
  const contrast = read(root, 'brand/contrast.json');
  const color = obj(read(root, 'brand/tokens/color.tokens.json')['color'], 'color');
  const semantic = obj(read(root, 'brand/tokens/semantic.tokens.json')['semantic'], 'semantic');
  const font = obj(read(root, 'brand/tokens/typography.tokens.json')['font'], 'font');

  const palette: Record<string, string> = {};
  for (const [k, tok] of Object.entries(color)) if (!k.startsWith('$')) palette[k] = hexOf(tok, `color.${k}`);

  const sem = { light: {} as Record<string, string>, dark: {} as Record<string, string> };
  for (const mode of ['light', 'dark'] as const) {
    for (const [role, tok] of Object.entries(obj(semantic[mode], `semantic.${mode}`))) {
      const ref = obj(tok, `semantic.${mode}.${role}`)['$value'];
      const m = typeof ref === 'string' ? /^\{color\.([A-Za-z0-9]+)\}$/.exec(ref) : null;
      if (!m) fail(`semantic.${mode}.${role} must be an alias like {color.name}`);
      sem[mode][role] = m![1]!;
    }
  }

  const weights = Object.values(obj(font['weight'], 'font.weight'))
    .filter((v): v is Json => typeof v === 'object' && v !== null)
    .map((v) => v['$value'] as number);
  const families = obj(font['family'], 'font.family');
  const fonts = {} as Tokens['fonts'];
  for (const role of ['display', 'body', 'mono'] as const) {
    const tok = obj(families[role], `font.family.${role}`);
    const list = tok['$value'];
    const ext = obj(obj(tok['$extensions'], `font.family.${role}.$extensions`)['com.hexadata'], 'com.hexadata');
    if (!Array.isArray(list) || list.length < 2) fail(`font.family.${role} must be a stack array`);
    const [family, ...system] = list as string[];
    fonts[role] = { family: family!, role: String(ext['role']), weights, system };
  }

  const logoDoc = read(root, 'brand/logo/logo.json');
  const logo = (logoDoc['variants'] as Json[]).map((v) => {
    const trim = obj(v['trim'], `logo ${String(v['id'])}.trim`);
    return {
      id: String(v['id']),
      form: v['form'] as LogoVariantSpec['form'],
      tone: v['tone'] as LogoVariantSpec['tone'],
      background: v['background'] as LogoVariantSpec['background'],
      opaque: v['opaque'] === true,
      sha256: String(v['sha256']),
      width: num(trim['width'], 'trim.width'),
      height: num(trim['height'], 'trim.height'),
    };
  });

  const trustedKeys = ((read(root, 'brand/keys.json')['keys'] ?? []) as Json[]).map(
    (k) => ({ kid: String(k['kid']), publicKey: String(k['publicKey']) }) satisfies TrustedKeySpec,
  );

  const version = String((JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as Json)['version']);

  return {
    version,
    trustedKeys,
    origin: String(content['origin']),
    descriptor: String(content['descriptor']),
    logo,
    source: String(content['source']),
    owner: String(content['owner']),
    revision: Number(content['revision']),
    issuedAt: String(content['issuedAt']),
    palette,
    taglines: content['taglines'] as Tokens['taglines'],
    fallbackColors: content['fallbackColors'] as Tokens['fallbackColors'],
    fonts,
    semantic: sem,
    semanticPairs: contrast['semanticPairs'] as Tokens['semanticPairs'],
    pairs: contrast['pairs'] as Tokens['pairs'],
    forbiddenPairs: contrast['forbiddenPairs'] as Tokens['forbiddenPairs'],
    foundations: loadFoundations(root),
  };
}
