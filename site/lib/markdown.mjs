// A deliberately small Markdown subset (headings, paragraphs, lists, tables, bold, inline code, links) for our own docs.
// Input is our repository's markdown (trusted), but everything is escaped first anyway.
import { esc, raw } from './html.mjs';

const inline = (text, repoBase = '') =>
  esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
      if (/^(https?:|mailto:|#)/.test(href)) return `<a href="${href}">${label}</a>`;
      // Relative links in repository markdown point at repository files: send them to GitHub, never to a dead path on this site.
      return /^[A-Za-z0-9_./-]+$/.test(href)
        ? `<a href="${repoBase}${href.replace(/^\.?\//, '')}">${label}</a>`
        : `<a href="#">${label}</a>`;
    });

export function markdown(src, { baseHeading = 2, repoBase = '' } = {}) {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(6, h[1].length + baseHeading - 1);
      out.push(`<h${level}>${inline(h[2], repoBase)}</h${level}>`);
      i++;
      continue;
    }
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      const cells = (l) =>
        l
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        `<div class="hd-table-wrap"><table class="hd-table"><thead><tr>${head.map((c) => `<th scope="col">${inline(c, repoBase)}</th>`).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c, repoBase)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let item = lines[i++].replace(/^\s*[-*]\s+(\[[ x]\]\s*)?/, '');
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) item += ` ${lines[i++].trim()}`;
        items.push(`<li>${inline(item, repoBase)}</li>`);
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]))
        items.push(`<li>${inline(lines[i++].replace(/^\s*\d+\.\s+/, ''), repoBase)}</li>`);
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }
    if (line.startsWith('```')) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      out.push(`<pre class="hd-code"><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*[-*]\s|\s*\d+\.\s|\||```)/.test(lines[i])) para.push(lines[i++].trim());
    if (para.length === 0) {
      i++;
      continue;
    }
    out.push(`<p>${inline(para.join(' '), repoBase)}</p>`);
  }
  return raw(out.join('\n'));
}
