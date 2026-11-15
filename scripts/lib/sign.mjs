// Ed25519 signing helpers shared by scripts/manifest-tool.mjs and scripts/build-channel.mjs.
// The private key is only ever read from a file or an environment variable at signing time; it is never written anywhere.
import { readFileSync } from 'node:fs';

export const b64u = (bytes) => Buffer.from(bytes).toString('base64url');

/** Loads the signing key from HEXA_SIGNING_JWK (JSON, for CI secrets) or a file path. Returns undefined when neither is provided. */
export function loadSigningJwk(filePath) {
  const raw = process.env.HEXA_SIGNING_JWK ?? (filePath ? readFileSync(filePath, 'utf8') : undefined);
  if (!raw) return undefined;
  const jwk = JSON.parse(raw);
  if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519' || typeof jwk.d !== 'string')
    throw new Error('signing key must be an Ed25519 private JWK');
  return jwk;
}

/** Signs the exact UTF-8 bytes of JSON.stringify(manifest) and returns the envelope the clients verify. */
export async function signManifest(manifest, jwk, kid) {
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['sign']);
  const payload = new TextEncoder().encode(JSON.stringify(manifest));
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, key, payload));
  return { kid, payload: b64u(payload), signature: b64u(signature) };
}
