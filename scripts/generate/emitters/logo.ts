import type { Ctx, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER }: Ctx): void {
  const variants = t.logo
    .map(
      (v) =>
        `  { id: '${v.id}', form: '${v.form}', tone: '${v.tone}', background: '${v.background}', opaque: ${v.opaque}, width: ${v.width}, height: ${v.height} },`,
    )
    .join('\n');
  write(
    'src/core/logo.ts',
    `/* ${HEADER} */

/** Where the evergreen hosted channel lives. Apps may self-host instead and pass their own base. */
export const BRAND_ORIGIN = ${JSON.stringify(t.origin)};
export const BRAND_DESCRIPTOR = ${JSON.stringify(t.descriptor)};
export const DEFAULT_LOGO_BASE = \`\${BRAND_ORIGIN}/v2/logo/\`;

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
  /** Rendered (trimmed) artwork size in px. */
  readonly width: number;
  readonly height: number;
}

export const LOGO_VARIANTS: readonly LogoVariant[] = [
${variants}
];

/**
 * Picks the artwork for a form + tone on a given surface. The Brand Kit supplies mono artwork only for dark
 * surfaces, so mono on a light surface falls back to the primary (full colour) artwork rather than an invisible logo.
 */
export function resolveLogo(form: LogoForm, tone: LogoTone, background: LogoBackground): LogoVariant {
  const pick = (tn: LogoTone, bg: LogoBackground): LogoVariant | undefined =>
    LOGO_VARIANTS.find((v) => v.form === form && v.tone === tn && (v.tone === 'mono' || v.background === bg));
  const found = (tone === 'mono' && background === 'dark' ? pick('mono', 'dark') : undefined) ?? pick('primary', background);
  if (!found) throw new Error(\`No logo for \${form}/\${tone}/\${background}\`);
  return found;
}

/** Published file URL. Icons are published at several sizes; wordmarks at their native (trimmed) size. */
export function logoUrl(variant: LogoVariant, options: { base?: string; format?: LogoFormat; size?: IconSize } = {}): string {
  const base = (options.base ?? DEFAULT_LOGO_BASE).replace(/\\/?$/, '/');
  const suffix = variant.form === 'icon' ? \`-\${options.size ?? 256}\` : '';
  return \`\${base}\${variant.id}\${suffix}.\${options.format ?? 'png'}\`;
}
`,
  );
}
