import { defineHexaElements, startHexaLive } from './index.js';

/**
 * Side-effect entry for plain HTML: loading this file registers every <hexa-*> element and starts the live brand update.
 * Opt out of the (signed, silent-on-failure) update with <script src="auto.js" data-hd-live="off"> or <html data-hd-live="off">.
 */
defineHexaElements();
const script = typeof document === 'undefined' ? null : (document.currentScript as HTMLScriptElement | null);
const off =
  typeof document !== 'undefined' && (script?.dataset['hdLive'] === 'off' || document.documentElement.dataset['hdLive'] === 'off');
if (typeof document !== 'undefined' && !off) startHexaLive();
