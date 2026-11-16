/**
 * Framework-agnostic custom elements (light DOM, so the .hd-* styles apply). Work in plain HTML, Vue, Svelte, Angular, etc.
 * No storage, no network, no innerHTML: text is always set through textContent.
 *
 *   <script type="module" src="@hexadata/brand/elements/auto"></script>   (or import { defineHexaElements })
 *   <hexa-tagline variant="secondary"></hexa-tagline>
 *   <hexa-theme-toggle label="Dark mode"></hexa-theme-toggle>
 *   <hexa-tooltip text="Opens the docs"><a href="/docs">Docs</a></hexa-tooltip>
 */
import { DEFAULT_LOGO_BASE, logoUrl, resolveLogo, type LogoForm, type LogoTone } from '../core/logo.js';
import type { TaglineKey } from '../core/tokens.js';
import { getBrand, onBrandChange } from './brand.js';

export { getBrand, onBrandChange, startHexaLive, type HexaLiveOptions } from './brand.js';

type Ctor = new () => HTMLElement;
const Base: Ctor = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as unknown as Ctor;
let idCounter = 0;

/** <hexa-tagline variant="primary|secondary"> renders the brand tagline as plain text. */
export class HexaTaglineElement extends Base {
  static readonly observedAttributes = ['variant'];
  private off: (() => void) | undefined;
  connectedCallback(): void {
    this.render();
    this.off = onBrandChange(() => this.render());
  }
  disconnectedCallback(): void {
    this.off?.();
    this.off = undefined;
  }
  attributeChangedCallback(): void {
    this.render();
  }
  private render(): void {
    const v = this.getAttribute('variant');
    const key: TaglineKey = v === 'secondary' ? 'secondary' : 'primary';
    this.textContent = getBrand().tokens.taglines[key];
    this.classList.add('hd-tagline');
  }
}

const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

/**
 * <hexa-logo form="horizontal|centered|icon" tone="primary|mono" on="auto|light|dark" size="sm|md|lg|xl" base="..." alt="HexaData">
 * Same markup as the React <HexaLogo>; the stylesheet shows the artwork for the active theme.
 */
export class HexaLogoElement extends Base {
  static readonly observedAttributes = ['form', 'tone', 'on', 'size', 'base', 'alt'];
  private off: (() => void) | undefined;
  connectedCallback(): void {
    this.render();
    this.off = onBrandChange(() => this.render());
  }
  disconnectedCallback(): void {
    this.off?.();
    this.off = undefined;
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  private render(): void {
    const form = pick<LogoForm>(this.getAttribute('form'), ['horizontal', 'centered', 'icon'], 'horizontal');
    const tone = pick<LogoTone>(this.getAttribute('tone'), ['primary', 'mono'], 'primary');
    const on = pick(this.getAttribute('on'), ['auto', 'light', 'dark'], 'auto');
    const size = pick(this.getAttribute('size'), ['sm', 'md', 'lg', 'xl'], 'md');
    const base = this.getAttribute('base') ?? DEFAULT_LOGO_BASE;
    const alt = this.getAttribute('alt') ?? 'HexaData';
    const wrap = document.createElement('span');
    wrap.className = `hd-logo hd-logo--${form} hd-logo--${size}`;
    wrap.dataset['on'] = on;
    for (const side of ['light', 'dark'] as const) {
      const v = resolveLogo(form, tone, side);
      const img = document.createElement('img');
      img.className = `hd-logo__img hd-logo__img--on-${side}`;
      img.src = logoUrl(v, { base, version: getBrand().assets.logo[v.id] ?? v.sha256 });
      img.width = v.width;
      img.height = v.height;
      img.alt = alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      wrap.append(img);
    }
    this.replaceChildren(wrap);
  }
}

const ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<path data-hd="moon" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' +
  '<g data-hd="sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>' +
  '</svg>';

/**
 * <hexa-theme-toggle label="Dark mode" appearance="text|icon"> switches <html data-theme> between light and dark. Nothing is
 * persisted by the package. `icon` renders a minimal icon-only button (moon in light mode, sun in dark mode) named by `label`.
 * The state follows the page: other toggles, the system theme and data-theme changes made elsewhere all keep it in sync.
 */
export class HexaThemeToggleElement extends Base {
  private button: HTMLButtonElement | undefined;
  private moon: SVGElement | undefined;
  private sun: SVGElement | undefined;
  private observer: MutationObserver | undefined;
  private media: MediaQueryList | undefined;
  private readonly onMedia = (): void => this.sync();

  connectedCallback(): void {
    if (!this.button) this.build();
    this.sync();
    if (typeof MutationObserver === 'function' && !this.observer) {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    if (typeof matchMedia === 'function' && !this.media) {
      this.media = matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', this.onMedia);
    }
  }
  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.media?.removeEventListener('change', this.onMedia);
    this.media = undefined;
  }
  private build(): void {
    const label = this.getAttribute('label') ?? 'Dark mode';
    const icon = this.getAttribute('appearance') === 'icon';
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => {
      const next = this.isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      this.sync();
      this.dispatchEvent(new CustomEvent('hexa-theme-change', { bubbles: true, detail: { theme: next } }));
    });
    if (icon) {
      b.className = 'hd-btn hd-btn--ghost hd-btn--icon';
      b.setAttribute('aria-label', label);
      // A constant, trusted string parsed by the HTML parser (which puts <svg> in the SVG namespace): no user input, no URL.
      const parsed = new DOMParser().parseFromString(ICON_SVG, 'text/html').body.firstElementChild;
      const svg = document.importNode(parsed as Element, true);
      this.moon = svg.querySelector('[data-hd="moon"]') as SVGElement;
      this.sun = svg.querySelector('[data-hd="sun"]') as SVGElement;
      b.append(svg);
    } else {
      b.className = 'hd-btn hd-btn--secondary hd-btn--sm';
      b.textContent = label;
    }
    this.button = b;
    this.append(b);
  }
  /** Mirrors the real theme onto aria-pressed and, for the icon button, shows the icon of the theme you would switch to. */
  private sync(): void {
    const dark = this.isDark();
    this.button?.setAttribute('aria-pressed', String(dark));
    this.moon?.setAttribute('display', dark ? 'none' : 'inline');
    this.sun?.setAttribute('display', dark ? 'inline' : 'none');
  }
  private isDark(): boolean {
    const forced = document.documentElement.getAttribute('data-theme');
    if (forced === 'dark' || forced === 'light') return forced === 'dark';
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

/** <hexa-tooltip text="…"> wraps one focusable child. Dismissible (Esc), hoverable and persistent while focused (WCAG 1.4.13). */
export class HexaTooltipElement extends Base {
  private tip: HTMLElement | undefined;
  connectedCallback(): void {
    if (this.tip) return;
    const tip = document.createElement('span');
    tip.id = `hexa-tip-${++idCounter}`;
    tip.className = 'hd-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    tip.textContent = this.getAttribute('text') ?? '';
    this.tip = tip;
    this.firstElementChild?.setAttribute('aria-describedby', tip.id);
    this.append(tip);
    const show = (): void => {
      tip.hidden = false;
    };
    const hide = (): void => {
      tip.hidden = true;
    };
    this.addEventListener('mouseenter', show);
    this.addEventListener('mouseleave', hide);
    this.addEventListener('focusin', show);
    this.addEventListener('focusout', hide);
    this.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') hide();
    });
  }
}

const ELEMENTS: readonly (readonly [string, Ctor])[] = [
  ['hexa-tagline', HexaTaglineElement],
  ['hexa-logo', HexaLogoElement],
  ['hexa-theme-toggle', HexaThemeToggleElement],
  ['hexa-tooltip', HexaTooltipElement],
];

/** Idempotent and safe on the server (does nothing without a DOM). */
export function defineHexaElements(): void {
  if (typeof customElements === 'undefined') return;
  for (const [name, ctor] of ELEMENTS) if (!customElements.get(name)) customElements.define(name, ctor);
}
