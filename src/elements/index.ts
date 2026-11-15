/**
 * Framework-agnostic custom elements (light DOM, so the .hd-* styles apply). Work in plain HTML, Vue, Svelte, Angular, etc.
 * No storage, no network, no innerHTML: text is always set through textContent.
 *
 *   <script type="module" src="@hexadata/brand/elements/auto"></script>   (or import { defineHexaElements })
 *   <hexa-tagline variant="secondary"></hexa-tagline>
 *   <hexa-theme-toggle label="Dark mode"></hexa-theme-toggle>
 *   <hexa-tooltip text="Opens the docs"><a href="/docs">Docs</a></hexa-tooltip>
 */
import { DEFAULT_TAGLINES, type TaglineKey } from '../core/tokens.js';

type Ctor = new () => HTMLElement;
const Base: Ctor = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as unknown as Ctor;
let idCounter = 0;

/** <hexa-tagline variant="primary|secondary"> renders the brand tagline as plain text. */
export class HexaTaglineElement extends Base {
  static readonly observedAttributes = ['variant'];
  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    this.render();
  }
  private render(): void {
    const v = this.getAttribute('variant');
    const key: TaglineKey = v === 'secondary' ? 'secondary' : 'primary';
    this.textContent = DEFAULT_TAGLINES[key];
    this.classList.add('hd-tagline');
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
  ['hexa-theme-toggle', HexaThemeToggleElement],
  ['hexa-tooltip', HexaTooltipElement],
];

/** Idempotent and safe on the server (does nothing without a DOM). */
export function defineHexaElements(): void {
  if (typeof customElements === 'undefined') return;
  for (const [name, ctor] of ELEMENTS) if (!customElements.get(name)) customElements.define(name, ctor);
}
