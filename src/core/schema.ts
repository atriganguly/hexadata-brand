import { contrastRatio, isHex6 } from './contrast.js';
import { BRAND_DESCRIPTOR, LOGO_VARIANTS } from './logo.js';
import {
  ALLOWED_PAIRS,
  BRAND_ISSUED_AT,
  BRAND_REVISION,
  DEFAULT_PALETTE,
  DEFAULT_TAGLINES,
  PALETTE_KEYS,
  SEMANTIC,
  SEMANTIC_PAIRS,
  type PaletteKey,
  type TaglineKey,
} from './tokens.js';

/** Resolved, fully-populated manifest: what consumers read. Zero runtime dependencies: validation is hand-written below. */
export interface HexaManifest {
  /** 1 = palette + taglines. 2 adds `descriptor` and `assets` (logo content hashes used for cache-busting). */
  readonly schemaVersion: 1 | 2;
  readonly revision: number;
  readonly issuedAt: string;
  readonly expiresAt?: string;
  readonly tokens: {
    readonly palette: Readonly<Record<PaletteKey, string>>;
    readonly taglines: Readonly<Record<TaglineKey, string>>;
    readonly descriptor: string;
  };
  readonly assets: {
    /** logo id -> SHA-256 (hex) of the master artwork. Changes whenever the artwork changes. */
    readonly logo: Readonly<Record<string, string>>;
  };
}

export type ManifestWarningCode =
  'invalid-color' | 'forbidden-color' | 'unknown-key' | 'invalid-tagline' | 'invalid-descriptor' | 'invalid-asset';
export interface ManifestWarning {
  readonly code: ManifestWarningCode;
  readonly path: string;
  readonly message: string;
}

export type ManifestRejection = 'schema' | 'expired' | 'rollback' | 'contrast';
export type ParseResult =
  | { readonly ok: true; readonly manifest: HexaManifest; readonly warnings: readonly ManifestWarning[] }
  | { readonly ok: false; readonly reason: ManifestRejection; readonly detail: string };

export interface ParseOptions {
  /** Epoch ms used for expiry checks. Defaults to Date.now(). */
  readonly now?: number;
  /** Reject manifests with a lower revision (anti-rollback). Defaults to the baked-in revision. */
  readonly minRevision?: number;
}

const MAX_TAGLINE = 120;
const MAX_KEYS = 64;
const MAX_KEY_LENGTH = 64;
/** Control chars, zero-width and bidi-override characters (Trojan-Source style spoofing). */
const UNSAFE_TEXT = /[\p{Cc}\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/u;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

type Dict = Record<string, unknown>;
const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v);
const isIsoUtc = (v: unknown): v is string => typeof v === 'string' && ISO_UTC.test(v) && !Number.isNaN(Date.parse(v));
const isPaletteKey = (k: string): k is PaletteKey => (PALETTE_KEYS as readonly string[]).includes(k);
const isTaglineKey = (k: string): k is TaglineKey => k === 'primary' || k === 'secondary';
const KNOWN_LOGO_IDS = new Set(LOGO_VARIANTS.map((v) => v.id));

/** Own enumerable entries, minus `__proto__` (never meaningful in a manifest; dropped silently). */
function entriesOf(d: Dict): [string, unknown][] {
  return Object.keys(d)
    .filter((k) => k !== '__proto__')
    .map((k) => [k, d[k]]);
}

/** Reads an optional string-keyed object (e.g. tokens.palette). Returns an error message instead of throwing. */
function readRecord(v: unknown, path: string): { ok: true; value: [string, unknown][] } | { ok: false; detail: string } {
  if (v === undefined) return { ok: true, value: [] };
  if (!isDict(v)) return { ok: false, detail: `${path}: expected object` };
  const entries = entriesOf(v);
  if (entries.some(([k]) => k.length > MAX_KEY_LENGTH)) return { ok: false, detail: `${path}: key too long` };
  return { ok: true, value: entries };
}

export const DEFAULT_MANIFEST: HexaManifest = Object.freeze({
  schemaVersion: 2,
  revision: BRAND_REVISION,
  issuedAt: BRAND_ISSUED_AT,
  tokens: Object.freeze({ palette: DEFAULT_PALETTE, taglines: DEFAULT_TAGLINES, descriptor: BRAND_DESCRIPTOR }),
  assets: Object.freeze({ logo: Object.freeze(Object.fromEntries(LOGO_VARIANTS.map((v) => [v.id, v.sha256]))) }),
});

/** Every contrast rule the palette must keep. Returns human-readable failures. */
export function checkContrast(palette: Readonly<Record<PaletteKey, string>>): string[] {
  const failures: string[] = [];
  for (const p of ALLOWED_PAIRS) {
    const r = contrastRatio(palette[p.fg], palette[p.bg]);
    if (r < p.min) failures.push(`${p.fg} on ${p.bg} is ${r.toFixed(2)}:1, needs ${p.min}:1 (${p.use})`);
  }
  for (const sp of SEMANTIC_PAIRS) {
    const fg = palette[SEMANTIC[sp.mode][sp.fg]];
    const bg = palette[SEMANTIC[sp.mode][sp.bg]];
    const r = contrastRatio(fg, bg);
    if (r < sp.min) failures.push(`[${sp.mode}] ${sp.fg} on ${sp.bg} is ${r.toFixed(2)}:1, needs ${sp.min}:1`);
  }
  return failures;
}

/** Text that is safe to render: 1..max chars, no control / bidi / zero-width characters. Checks the RAW value (trim() would strip U+FEFF). */
function cleanText(value: unknown, max: number): string | undefined {
  const raw = typeof value === 'string' ? value : '';
  const text = raw.trim();
  return text.length === 0 || text.length > max || UNSAFE_TEXT.test(raw) ? undefined : text;
}

/**
 * Core of parseManifest (wrapped below so it is total).
 * - Bad individual colours/taglines/assets fall back to the brand default and are reported as warnings.
 * - Structural problems, expiry, rollback and contrast regressions reject the whole manifest.
 */
function parseManifestUnsafe(input: unknown, options: ParseOptions): ParseResult {
  const schema = (detail: string): ParseResult => ({ ok: false, reason: 'schema', detail });
  if (!isDict(input)) return schema('(root): expected object');
  const { schemaVersion, revision, issuedAt, expiresAt } = input;
  if (schemaVersion !== 1 && schemaVersion !== 2) return schema('schemaVersion: expected 1 or 2');
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0 || revision > Number.MAX_SAFE_INTEGER) {
    return schema('revision: expected a non-negative integer');
  }
  if (!isIsoUtc(issuedAt)) return schema('issuedAt: expected an ISO-8601 UTC datetime');
  if (expiresAt !== undefined && !isIsoUtc(expiresAt)) return schema('expiresAt: expected an ISO-8601 UTC datetime');

  const tokens = input['tokens'] === undefined ? {} : input['tokens'];
  if (!isDict(tokens)) return schema('tokens: expected object');
  const pal = readRecord(tokens['palette'], 'tokens.palette');
  if (!pal.ok) return schema(pal.detail);
  const tag = readRecord(tokens['taglines'], 'tokens.taglines');
  if (!tag.ok) return schema(tag.detail);
  const assetsIn = input['assets'] === undefined ? {} : input['assets'];
  if (!isDict(assetsIn)) return schema('assets: expected object');
  const logo = readRecord(assetsIn['logo'], 'assets.logo');
  if (!logo.ok) return schema(logo.detail);
  if (pal.value.length > MAX_KEYS || tag.value.length > MAX_KEYS || logo.value.length > MAX_KEYS) return schema('too many keys');

  const now = options.now ?? Date.now();
  const minRevision = options.minRevision ?? BRAND_REVISION;
  if (expiresAt !== undefined && Date.parse(expiresAt) <= now) return { ok: false, reason: 'expired', detail: `expired at ${expiresAt}` };
  if (revision < minRevision) return { ok: false, reason: 'rollback', detail: `revision ${revision} < ${minRevision}` };

  const warnings: ManifestWarning[] = [];
  const palette: Record<PaletteKey, string> = { ...DEFAULT_PALETTE };
  const taglines: Record<TaglineKey, string> = { ...DEFAULT_TAGLINES };
  const logoHashes: Record<string, string> = { ...DEFAULT_MANIFEST.assets.logo };

  for (const [key, value] of pal.value) {
    const path = `tokens.palette.${key}`;
    if (!isPaletteKey(key)) {
      warnings.push({ code: 'unknown-key', path, message: 'ignored: not a brand palette key' });
    } else if (!isHex6(value)) {
      warnings.push({ code: 'invalid-color', path, message: 'ignored: expected #RRGGBB' });
    } else if (value.toUpperCase() === '#000000' || value.toUpperCase() === '#FFFFFF') {
      warnings.push({ code: 'forbidden-color', path, message: 'ignored: pure black/white are not brand tokens' });
    } else {
      palette[key] = value.toUpperCase();
    }
  }

  for (const [key, value] of tag.value) {
    const path = `tokens.taglines.${key}`;
    if (!isTaglineKey(key)) {
      warnings.push({ code: 'unknown-key', path, message: 'ignored: not a brand tagline key' });
      continue;
    }
    const text = cleanText(value, MAX_TAGLINE);
    if (text === undefined) {
      warnings.push({
        code: 'invalid-tagline',
        path,
        message: `ignored: must be 1-${MAX_TAGLINE} chars with no control/bidi/zero-width characters`,
      });
    } else {
      taglines[key] = text;
    }
  }

  let descriptor = BRAND_DESCRIPTOR;
  if (tokens['descriptor'] !== undefined) {
    const text = cleanText(tokens['descriptor'], MAX_TAGLINE);
    if (text === undefined)
      warnings.push({ code: 'invalid-descriptor', path: 'tokens.descriptor', message: 'ignored: must be 1-120 safe characters' });
    else descriptor = text;
  }

  for (const [id, value] of logo.value) {
    const path = `assets.logo.${id}`;
    if (!KNOWN_LOGO_IDS.has(id)) warnings.push({ code: 'unknown-key', path, message: 'ignored: not a brand logo id' });
    else if (typeof value !== 'string' || !SHA256_HEX.test(value))
      warnings.push({ code: 'invalid-asset', path, message: 'ignored: expected a lowercase hex SHA-256' });
    else logoHashes[id] = value;
  }

  const failures = checkContrast(palette);
  if (failures.length > 0) return { ok: false, reason: 'contrast', detail: failures.join('; ') };

  const manifest: HexaManifest = Object.freeze({
    schemaVersion,
    revision,
    issuedAt,
    ...(expiresAt !== undefined ? { expiresAt } : {}),
    tokens: Object.freeze({ palette: Object.freeze(palette), taglines: Object.freeze(taglines), descriptor }),
    assets: Object.freeze({ logo: Object.freeze(logoHashes) }),
  });
  return { ok: true, manifest, warnings };
}

/** Parse an untrusted manifest. Total function: any input (even hostile getters/proxies) yields a result, never an exception. */
export function parseManifest(input: unknown, options: ParseOptions = {}): ParseResult {
  try {
    return parseManifestUnsafe(input, options);
  } catch {
    return { ok: false, reason: 'schema', detail: 'input could not be read' };
  }
}

/**
 * Strict check of an already-resolved manifest (useful for consumers and tests). Keeps the `safeParse` shape the previous
 * schema library exposed, so existing callers keep working: `{ success: true, data }` or `{ success: false, error: { issues } }`.
 */
export const HexaManifestSchema = {
  safeParse(
    input: unknown,
  ): { success: true; data: HexaManifest } | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } } {
    const r = parseManifest(input, { minRevision: 0, now: 0 });
    if (r.ok && r.warnings.length === 0) return { success: true, data: r.manifest };
    const issues = r.ok
      ? r.warnings.map((w) => ({ path: w.path.split('.'), message: w.message }))
      : [{ path: [], message: `${r.reason}: ${r.detail}` }];
    return { success: false, error: { issues } };
  },
};
