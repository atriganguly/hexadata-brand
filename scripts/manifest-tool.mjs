#!/usr/bin/env node
// Operator tool for signed brand manifests (Ed25519). Requires `npm run build` first.
//   keygen <kid> <private-key-out.jwk>          create a key pair (prints the public key to embed in apps)
//   sign   <manifest.json> <private-key.jwk> <kid>   validate + sign -> envelope JSON on stdout
//   verify <envelope.json> <kid> <public-key>        verify an envelope and print the parsed manifest
//
// Production keys belong in a KMS/HSM (e.g. AWS KMS / GCP KMS Ed25519 / Cloud HSM). This tool's file-based
// private key is for development and for CI signing with a short-lived, access-controlled secret.
import { chmodSync, readFileSync, writeFileSync } from 'node:fs';
import { parseManifest, base64urlDecode, webCryptoEd25519Verifier } from '../dist/core/index.js';

const b64u = (b) => Buffer.from(b).toString('base64url');
const [cmd, ...args] = process.argv.slice(2);
const usage = () => {
  console.error('usage: manifest-tool <keygen|sign|verify> ... (see header of scripts/manifest-tool.mjs)');
  process.exit(2);
};

if (cmd === 'keygen') {
  const [kid, out] = args;
  if (!kid || !out) usage();
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  writeFileSync(out, JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey)), { mode: 0o600 });
  chmodSync(out, 0o600);
  const pub = b64u(await crypto.subtle.exportKey('raw', pair.publicKey));
  console.error(`private key written to ${out} (mode 600). NEVER commit it.`);
  console.log(JSON.stringify({ kid, publicKey: pub }, null, 2));
} else if (cmd === 'sign') {
  const [file, keyFile, kid] = args;
  if (!file || !keyFile || !kid) usage();
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  const check = parseManifest(manifest, { minRevision: 0 });
  if (!check.ok) {
    console.error(`REFUSING TO SIGN: ${check.reason}: ${check.detail}`);
    process.exit(1);
  }
  if (check.warnings.length) {
    console.error('REFUSING TO SIGN: manifest has warnings (invalid/unknown values would be silently dropped):');
    check.warnings.forEach((w) => console.error(`  ${w.path}: ${w.message}`));
    process.exit(1);
  }
  const key = await crypto.subtle.importKey('jwk', JSON.parse(readFileSync(keyFile, 'utf8')), { name: 'Ed25519' }, false, ['sign']);
  const payload = new TextEncoder().encode(JSON.stringify(manifest));
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, key, payload));
  console.log(JSON.stringify({ kid, payload: b64u(payload), signature: b64u(signature) }));
} else if (cmd === 'verify') {
  const [file, kid, publicKey] = args;
  if (!file || !kid || !publicKey) usage();
  const env = JSON.parse(readFileSync(file, 'utf8'));
  if (env.kid !== kid) {
    console.error(`kid mismatch: envelope has ${env.kid}`);
    process.exit(1);
  }
  const payload = base64urlDecode(env.payload),
    sig = base64urlDecode(env.signature),
    pub = base64urlDecode(publicKey);
  if (!payload || !sig || !pub || !(await webCryptoEd25519Verifier(payload, sig, pub))) {
    console.error('INVALID signature');
    process.exit(1);
  }
  const parsed = parseManifest(JSON.parse(new TextDecoder().decode(payload)), { minRevision: 0 });
  if (!parsed.ok) {
    console.error(`signature OK but content rejected: ${parsed.reason}: ${parsed.detail}`);
    process.exit(1);
  }
  console.log(JSON.stringify(parsed.manifest, null, 2));
} else usage();
