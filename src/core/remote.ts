import { z } from 'zod';
import { parseManifest, type HexaManifest, type ManifestRejection, type ManifestWarning } from './schema.js';
import { BRAND_REVISION } from './tokens.js';

/**
 * Optional runtime brand updates.
 *
 * Privacy/security posture (see PRIVACY.md):
 *  - OFF unless the app passes `remote` options. Nothing is fetched by default.
 *  - No cookies, no credentials, no Referer, no custom headers, no browser storage.
 *  - The manifest is an Ed25519-signed envelope; unsigned or tampered data is rejected,
 *    so a compromised CDN cannot rebrand an app.
 *  - Anti-rollback (revision) and expiry are enforced.
 *  - https only, bounded size, bounded time.
 */

export interface TrustedKey {
  /** Key id, matched against the envelope's `kid` (supports rotation). */
  readonly kid: string;
  /** Raw 32-byte Ed25519 public key, base64url-encoded. */
  readonly publicKey: string;
}

/** Returns true iff `signature` is a valid signature of `payload` under `publicKey`. */
export type Verifier = (payload: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) => Promise<boolean>;

export class VerifierUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerifierUnavailableError';
  }
}

export interface RemoteManifestOptions {
  readonly url: string;
  readonly keys: readonly TrustedKey[];
  /** Reject anything older than this revision. Defaults to the baked-in revision. */
  readonly minRevision?: number;
  /** Default 5000. */
  readonly timeoutMs?: number;
  /** Default 16384 bytes. */
  readonly maxBytes?: number;
  /** Override for tests / custom runtimes (e.g. React Native needs its own Ed25519 verifier). */
  readonly verify?: Verifier;
  readonly fetch?: typeof fetch;
  readonly signal?: AbortSignal;
  readonly now?: () => number;
}

export type RemoteFailure =
  | 'invalid-url'
  | 'insecure-url'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'http-status'
  | 'bad-content-type'
  | 'too-large'
  | 'bad-envelope'
  | 'unknown-kid'
  | 'bad-signature'
  | 'no-verifier'
  | ManifestRejection;

export type RemoteResult =
  | { readonly ok: true; readonly manifest: HexaManifest; readonly warnings: readonly ManifestWarning[] }
  | { readonly ok: false; readonly reason: RemoteFailure; readonly detail?: string };

const Envelope = z.object({
  kid: z.string().min(1).max(64),
  payload: z.string().min(1).max(32768),
  signature: z.string().min(1).max(256),
});

const B64URL = /^[A-Za-z0-9_-]*$/;

/** Portable base64url decoder (no atob/Buffer dependency; works in Hermes). Returns null if malformed. */
export function base64urlDecode(input: string): Uint8Array | null {
  if (!B64URL.test(input) || input.length % 4 === 1) return null;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const out = new Uint8Array(Math.floor((input.length * 3) / 4));
  let acc = 0;
  let bits = 0;
  let n = 0;
  for (const ch of input) {
    acc = (acc << 6) | alphabet.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[n++] = (acc >> bits) & 0xff;
    }
  }
  return out.subarray(0, n);
}

/** Default verifier: WebCrypto Ed25519 (Node 20+, Chrome 137+, Safari 17+, Firefox 129+). */
export const webCryptoEd25519Verifier: Verifier = async (payload, signature, publicKey) => {
  const subtle = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (!subtle) throw new VerifierUnavailableError('WebCrypto is not available');
  let key: CryptoKey;
  try {
    key = await subtle.importKey('raw', publicKey as BufferSource, { name: 'Ed25519' }, false, ['verify']);
  } catch (e) {
    if (e instanceof Error && e.name === 'NotSupportedError')
      throw new VerifierUnavailableError('Ed25519 is not supported by this runtime');
    return false; // malformed key
  }
  return subtle.verify({ name: 'Ed25519' }, key, signature as BufferSource, payload as BufferSource);
};

function validateUrl(raw: string): URL | RemoteFailure {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 'invalid-url';
  }
  if (url.protocol !== 'https:') return 'insecure-url';
  if (url.username !== '' || url.password !== '') return 'invalid-url';
  return url;
}

async function readLimited(res: Response, maxBytes: number): Promise<string | null> {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;

  const reader = res.body?.getReader?.();
  if (!reader) {
    const text = await res.text();
    return new TextEncoder().encode(text).length > maxBytes ? null : text;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(all);
}

export async function fetchSignedManifest(options: RemoteManifestOptions): Promise<RemoteResult> {
  const url = validateUrl(options.url);
  if (typeof url === 'string') return { ok: false, reason: url };

  if (options.signal?.aborted) return { ok: false, reason: 'aborted' };

  const doFetch = options.fetch ?? (globalThis as { fetch?: typeof fetch }).fetch;
  if (!doFetch) return { ok: false, reason: 'network', detail: 'fetch is not available' };

  const verify = options.verify ?? webCryptoEd25519Verifier;
  const maxBytes = options.maxBytes ?? 16384;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? 5000);
  const onAbort = (): void => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });

  try {
    let res: Response;
    try {
      res = await doFetch(url.href, {
        method: 'GET',
        headers: { accept: 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        mode: 'cors',
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch {
      return { ok: false, reason: timedOut ? 'timeout' : controller.signal.aborted ? 'aborted' : 'network' };
    }

    if (res.url && !res.url.startsWith('https://')) return { ok: false, reason: 'insecure-url', detail: 'redirected to a non-https URL' };
    if (!res.ok) return { ok: false, reason: 'http-status', detail: String(res.status) };
    if (!(res.headers.get('content-type') ?? '').toLowerCase().includes('json')) return { ok: false, reason: 'bad-content-type' };

    let body: string | null;
    try {
      body = await readLimited(res, maxBytes);
    } catch {
      return { ok: false, reason: timedOut ? 'timeout' : controller.signal.aborted ? 'aborted' : 'bad-envelope' };
    }
    if (body === null) return { ok: false, reason: 'too-large' };

    let envelope: z.infer<typeof Envelope>;
    try {
      const parsed = Envelope.safeParse(JSON.parse(body));
      if (!parsed.success) return { ok: false, reason: 'bad-envelope' };
      envelope = parsed.data;
    } catch {
      return { ok: false, reason: 'bad-envelope' };
    }

    const key = options.keys.find((k) => k.kid === envelope.kid);
    if (!key) return { ok: false, reason: 'unknown-kid', detail: envelope.kid };

    const payload = base64urlDecode(envelope.payload);
    const signature = base64urlDecode(envelope.signature);
    const publicKey = base64urlDecode(key.publicKey);
    if (!payload || !signature || !publicKey || signature.length !== 64 || publicKey.length !== 32) {
      return { ok: false, reason: 'bad-envelope', detail: 'malformed base64url, signature or key length' };
    }

    try {
      if (!(await verify(payload, signature, publicKey))) return { ok: false, reason: 'bad-signature' };
    } catch (e) {
      if (e instanceof VerifierUnavailableError) return { ok: false, reason: 'no-verifier', detail: e.message };
      return { ok: false, reason: 'bad-signature' };
    }

    let json: unknown;
    try {
      json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload));
    } catch {
      return { ok: false, reason: 'schema', detail: 'payload is not valid UTF-8 JSON' };
    }

    const parsed = parseManifest(json, {
      now: options.now?.() ?? Date.now(),
      minRevision: options.minRevision ?? BRAND_REVISION,
    });
    return parsed.ok
      ? { ok: true, manifest: parsed.manifest, warnings: parsed.warnings }
      : { ok: false, reason: parsed.reason, detail: parsed.detail };
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
