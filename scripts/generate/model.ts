import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isHex6 } from '../../src/core/contrast.ts';
import type { Tokens } from './types.ts';

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

  return {
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
  };
}
