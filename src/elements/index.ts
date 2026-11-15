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

/** <hexa-theme-toggle label="Dark mode"> switches <html data-theme> between light and dark. Nothing is persisted. */
export class HexaThemeToggleElement extends Base {
  private button: HTMLButtonElement | undefined;
  connectedCallback(): void {
    if (this.button) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hd-btn hd-btn--secondary hd-btn--sm';
    b.textContent = this.getAttribute('label') ?? 'Dark mode';
    b.setAttribute('aria-pressed', String(this.isDark()));
    b.addEventListener('click', () => {
      const next = this.isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      b.setAttribute('aria-pressed', String(next === 'dark'));
      this.dispatchEvent(new CustomEvent('hexa-theme-change', { bubbles: true, detail: { theme: next } }));
    });
    this.button = b;
    this.append(b);
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
