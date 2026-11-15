import { createRoot } from 'react-dom/client';
import { HexaProvider, HexaTagline } from '@hexadata/brand/react';

declare const __KEY__: string;
declare global {
  interface Window {
    __issues: unknown[];
    __rendered: boolean;
  }
}

window.__issues = [];
const mode = new URLSearchParams(location.search).get('mode');
const remote =
  mode === 'remote'
    ? { url: 'https://brand.example.com/manifest.json', keys: [{ kid: 'e2e', publicKey: __KEY__ }], timeoutMs: 3000 }
    : undefined;

createRoot(document.getElementById('root')!).render(
  <HexaProvider {...(remote ? { remote } : {})} onIssue={(i: unknown) => window.__issues.push(i)}>
    <HexaTagline id="tag" />
  </HexaProvider>,
);
window.__rendered = true;
