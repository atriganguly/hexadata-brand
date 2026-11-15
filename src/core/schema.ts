import { z } from 'zod';
import { contrastRatio, isHex6 } from './contrast.js';
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

/** Resolved, fully-populated manifest: what consumers read. */
export interface HexaManifest {
  readonly schemaVersion: 1;
  readonly revision: number;
  readonly issuedAt: string;
  readonly expiresAt?: string;
  readonly tokens: {
    readonly palette: Readonly<Record<PaletteKey, string>>;
    readonly taglines: Readonly<Record<TaglineKey, string>>;
  };
}

export type ManifestWarningCode = 'invalid-color' | 'forbidden-color' | 'unknown-key' | 'invalid-tagline';
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
/** Control chars, zero-width and bidi-override characters (Trojan-Source style spoofing). */
const UNSAFE_TEXT = /[\p{Cc}\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/u;

const RawManifest = z.object({
  schemaVersion: z.literal(1),
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  tokens: z
    .object({
      palette: z.record(z.string().max(64), z.unknown()).default({}),
      taglines: z.record(z.string().max(64), z.unknown()).default({}),
    })
    .default({ palette: {}, taglines: {} }),
});

const BrandHex = z
  .string()
  .regex(/^#[0-9A-F]{6}$/)
  .refine((v) => v !== '#000000' && v !== '#FFFFFF', 'Pure black/white are not brand tokens');

const paletteShape = {} as Record<PaletteKey, typeof BrandHex>;
for (const k of PALETTE_KEYS) paletteShape[k] = BrandHex;

/** Strict schema for an already-resolved manifest (useful for consumers and tests). */
export const HexaManifestSchema = z.object({
  schemaVersion: z.literal(1),
  revision: z.number().int().nonnegative(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  tokens: z.object({
    palette: z.object(paletteShape),
    taglines: z.object({
      primary: z.string().min(1).max(MAX_TAGLINE),
      secondary: z.string().min(1).max(MAX_TAGLINE),
    }),
  }),
});

export const DEFAULT_MANIFEST: HexaManifest = Object.freeze({
  schemaVersion: 1,
  revision: BRAND_REVISION,
  issuedAt: BRAND_ISSUED_AT,
  tokens: Object.freeze({ palette: DEFAULT_PALETTE, taglines: DEFAULT_TAGLINES }),
});

const isPaletteKey = (k: string): k is PaletteKey => (PALETTE_KEYS as readonly string[]).includes(k);
const isTaglineKey = (k: string): k is TaglineKey => k === 'primary' || k === 'secondary';

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

/**
 * Core of parseManifest (wrapped below so it is total).
 * - Bad individual colours/taglines fall back to the brand default and are reported as warnings.
 * - Structural problems, expiry, rollback and contrast regressions reject the whole manifest.
 */
function parseManifestUnsafe(input: unknown, options: ParseOptions): ParseResult {
  const raw = RawManifest.safeParse(input);
  if (!raw.success) {
    return { ok: false, reason: 'schema', detail: raw.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ') };
  }
  const data = raw.data;
  const now = options.now ?? Date.now();
  const minRevision = options.minRevision ?? BRAND_REVISION;

  if (data.expiresAt !== undefined && Date.parse(data.expiresAt) <= now) {
    return { ok: false, reason: 'expired', detail: `expired at ${data.expiresAt}` };
  }
  if (data.revision < minRevision) {
    return { ok: false, reason: 'rollback', detail: `revision ${data.revision} < ${minRevision}` };
  }

  const warnings: ManifestWarning[] = [];
  const palette: Record<PaletteKey, string> = { ...DEFAULT_PALETTE };
  const taglines: Record<TaglineKey, string> = { ...DEFAULT_TAGLINES };

  const paletteEntries = Object.entries(data.tokens.palette);
  const taglineEntries = Object.entries(data.tokens.taglines);
  if (paletteEntries.length > MAX_KEYS || taglineEntries.length > MAX_KEYS) {
    return { ok: false, reason: 'schema', detail: 'too many keys' };
  }

  for (const [key, value] of paletteEntries) {
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

  for (const [key, value] of taglineEntries) {
    const path = `tokens.taglines.${key}`;
    if (!isTaglineKey(key)) {
      warnings.push({ code: 'unknown-key', path, message: 'ignored: not a brand tagline key' });
      continue;
    }
    // Check the RAW value: String#trim() would otherwise silently strip U+FEFF before the unsafe-character test.
    const rawText = typeof value === 'string' ? value : '';
    const text = rawText.trim();
    if (text.length === 0 || text.length > MAX_TAGLINE || UNSAFE_TEXT.test(rawText)) {
      warnings.push({
        code: 'invalid-tagline',
        path,
        message: `ignored: must be 1-${MAX_TAGLINE} chars with no control/bidi/zero-width characters`,
      });
    } else {
      taglines[key] = text;
    }
  }

  const failures = checkContrast(palette);
  if (failures.length > 0) {
    return { ok: false, reason: 'contrast', detail: failures.join('; ') };
  }

  const manifest: HexaManifest = Object.freeze({
    schemaVersion: 1,
    revision: data.revision,
    issuedAt: data.issuedAt,
    ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
    tokens: Object.freeze({ palette: Object.freeze(palette), taglines: Object.freeze(taglines) }),
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
