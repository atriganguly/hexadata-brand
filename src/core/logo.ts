/* GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`). */

/** Where the evergreen hosted channel lives. Apps may self-host instead and pass their own base. */
export const BRAND_ORIGIN = "https://atriganguly.github.io/hexadata-brand";
export const BRAND_DESCRIPTOR = "servers and workstations";
export const DEFAULT_LOGO_BASE = `${BRAND_ORIGIN}/v2/logo/`;

export type LogoForm = 'icon' | 'centered' | 'horizontal';
export type LogoTone = 'primary' | 'mono';
export type LogoBackground = 'light' | 'dark';
export type LogoFormat = 'png' | 'webp';
export const ICON_SIZES = [64, 128, 256, 512, 1024] as const;
export type IconSize = (typeof ICON_SIZES)[number];

export interface LogoVariant {
  /** Stable file stem; never renamed within a major version. */
  readonly id: string;
  readonly form: LogoForm;
  readonly tone: LogoTone;
  /** The surface this artwork is designed for. */
  readonly background: LogoBackground;
  /** Icons are opaque tiles; wordmarks are transparent. */
  readonly opaque: boolean;
  /** SHA-256 (hex) of the master artwork; used to cache-bust and to detect logo updates. */
  readonly sha256: string;
  /** Rendered (trimmed) artwork size in px. */
  readonly width: number;
  readonly height: number;
}

export const LOGO_VARIANTS: readonly LogoVariant[] = [
  { id: 'centered-primary-on-light', form: 'centered', tone: 'primary', background: 'light', opaque: false, sha256: '9295fe94b82e9e6fe2e94f88ead90dd3c96f0b7a13f191bd858b6d5e2bf440e8', width: 442, height: 296 },
  { id: 'centered-primary-on-dark', form: 'centered', tone: 'primary', background: 'dark', opaque: false, sha256: '48db2b750456409c496f1fdedb10cd43713c7b39c288af94aaba31af89f0cda7', width: 456, height: 293 },
  { id: 'centered-mono', form: 'centered', tone: 'mono', background: 'dark', opaque: false, sha256: '8e5212c0170ccef8a92729038a376e89cb8906022259381ba5c804d732823acf', width: 479, height: 362 },
  { id: 'horizontal-primary-on-light', form: 'horizontal', tone: 'primary', background: 'light', opaque: false, sha256: '735e68dcc4dae14cd9494f3889f854df3bacf75fff9ada376290ae4b1b367f98', width: 471, height: 131 },
  { id: 'horizontal-primary-on-dark', form: 'horizontal', tone: 'primary', background: 'dark', opaque: false, sha256: '7623570ea35acac284278993737566bdee07e138ee7a9c961dd3e5f08cd12498', width: 461, height: 132 },
  { id: 'horizontal-mono', form: 'horizontal', tone: 'mono', background: 'dark', opaque: false, sha256: '13fbdb43916f1f04037f48e2b7ee0dd7eb08de4e901de1808109589cb344400c', width: 473, height: 141 },
  { id: 'icon-on-light', form: 'icon', tone: 'primary', background: 'light', opaque: true, sha256: 'af0fad8d00fde41619d042d379db04e264e524f8dfb07678a70adf1893cfb725', width: 4096, height: 4096 },
  { id: 'icon-on-dark', form: 'icon', tone: 'primary', background: 'dark', opaque: true, sha256: '37c6df1f49cd6fc77e3af0135fc1e6a9136ddf75d9d587aec1740c5c5439c582', width: 4096, height: 4096 },
];

/**
 * Picks the artwork for a form + tone on a given surface. The Brand Kit supplies mono artwork only for dark
 * surfaces, so mono on a light surface falls back to the primary (full colour) artwork rather than an invisible logo.
 */
export function resolveLogo(form: LogoForm, tone: LogoTone, background: LogoBackground): LogoVariant {
  const pick = (tn: LogoTone, bg: LogoBackground): LogoVariant | undefined =>
    LOGO_VARIANTS.find((v) => v.form === form && v.tone === tn && (v.tone === 'mono' || v.background === bg));
  const found = (tone === 'mono' && background === 'dark' ? pick('mono', 'dark') : undefined) ?? pick('primary', background);
  if (!found) throw new Error(`No logo for ${form}/${tone}/${background}`);
  return found;
}

/** Published file URL. Icons are published at several sizes; wordmarks at their native (trimmed) size. */
export function logoUrl(variant: LogoVariant, options: { base?: string; format?: LogoFormat; size?: IconSize; version?: string } = {}): string {
  const base = (options.base ?? DEFAULT_LOGO_BASE).replace(/\/?$/, '/');
  const suffix = variant.form === 'icon' ? `-${options.size ?? 256}` : '';
  const v = options.version ? `?v=${options.version.slice(0, 12)}` : '';
  return `${base}${variant.id}${suffix}.${options.format ?? 'png'}${v}`;
}
