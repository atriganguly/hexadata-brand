// Preview the built site: node scripts/serve.mjs [dir] [port]   (127.0.0.1 only)
import { serve } from './lib/static-server.mjs';

const dir = process.argv[2] ?? 'site-out';
const { port } = await serve(dir, Number(process.argv[3] ?? 4173));
console.log(`serving ${dir} at http://127.0.0.1:${port}/`);
