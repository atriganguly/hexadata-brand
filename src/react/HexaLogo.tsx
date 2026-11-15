import type { ImgHTMLAttributes, ReactElement } from 'react';
import { DEFAULT_LOGO_BASE, resolveLogo, logoUrl, type IconSize, type LogoForm, type LogoFormat, type LogoTone } from '../core/index.js';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface HexaLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height' | 'alt'> {
  /** Lockup: `horizontal` (default), `centered` or the square app/social `icon`. */
  form?: LogoForm;
  /** `primary` (full colour, default) or `mono`. Mono artwork exists for dark surfaces; on light it falls back to primary. */
  tone?: LogoTone;
  /** `auto` follows the theme (prefers-color-scheme and <html data-theme>); or pin to a surface. */
  on?: 'auto' | 'light' | 'dark';
  size?: LogoSize;
  /**
   * Where the files come from. Default is the evergreen hosted channel, so logo changes reach the app with no release.
   * Self-host by copying `node_modules/@hexadata/brand/dist/logo` and passing its URL (needed under a strict img-src CSP).
   */
  base?: string;
  format?: LogoFormat;
  /** Icon file size (px). Ignored for wordmarks. */
  iconSize?: IconSize;
  /** Accessible name. Pass "" only when the logo is decorative next to the visible text "HexaData". */
  alt?: string;
}

/**
 * Renders the on-light and on-dark artwork and lets CSS pick one (no JavaScript, no hydration mismatch).
 * Requires the stylesheet: import '@hexadata/brand/all.css' (or components.css).
 */
export function HexaLogo({
  form = 'horizontal',
  tone = 'primary',
  on = 'auto',
  size = 'md',
  base = DEFAULT_LOGO_BASE,
  format = 'png',
  iconSize = 256,
  alt = 'HexaData',
  className,
  loading = 'lazy',
  ...rest
}: HexaLogoProps): ReactElement {
  const light = resolveLogo(form, tone, 'light');
  const dark = resolveLogo(form, tone, 'dark');
  const img = (v: typeof light, side: 'light' | 'dark'): ReactElement => (
    <img
      className={`hd-logo__img hd-logo__img--on-${side}`}
      src={logoUrl(v, { base, format, size: iconSize })}
      width={v.width}
      height={v.height}
      alt={alt}
      loading={loading}
      decoding="async"
      {...rest}
    />
  );
  return (
    <span className={['hd-logo', `hd-logo--${form}`, `hd-logo--${size}`, className].filter(Boolean).join(' ')} data-on={on}>
      {img(light, 'light')}
      {img(dark, 'dark')}
    </span>
  );
}
