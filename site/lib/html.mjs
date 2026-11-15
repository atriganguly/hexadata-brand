// Tiny, dependency-free HTML templating: everything interpolated is escaped unless wrapped in raw().
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}
/** Marks a string as already-safe HTML. Only ever use on strings this build produced. */
export const raw = (s) => new Raw(String(s));

const render = (v) => {
  if (v === null || v === undefined || v === false) return '';
  if (Array.isArray(v)) return v.map(render).join('');
  if (v instanceof Raw) return v.value;
  return esc(v);
};

/** html`<p>${userText}</p>`: returns Raw so templates compose. */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => {
    out += render(v) + strings[i + 1];
  });
  return new Raw(out);
}

/** A code sample: the text is shown escaped inside the .hd-code block. */
export const code = (text) => html`<pre class="hd-code"><code>${text.trim()}</code></pre>`;

export const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
