// Tiny, safe Markdown renderer: headings, paragraphs, nested lists, task boxes, pipe tables,
// fenced code, blockquotes, hr, and inline code / bold / italic / strike / links.
// All text is HTML-escaped before formatting is applied.
import { esc } from "./util.js";

const LIST_RE = /^\s*([-*+]|\d+[.)])\s+/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const indentOf = (l) => l.match(/^\s*/)[0].replace(/\t/g, "    ").length;

function safeUrl(u) {
  if (/^\s*(javascript|data|vbscript):/i.test(u)) return null;
  return u;
}

export function inline(src) {
  const codes = [];
  let s = String(src).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    const url = safeUrl(u);
    return url ? `<a href="${url}" target="_blank" rel="noopener">${t}</a>` : t;
  });
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^\w])__([^_]+)__(?!\w)/g, "$1<strong>$2</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>").replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/\u0000(\d+)\u0000/g, (_, k) => `<code>${esc(codes[Number(k)])}</code>`);
  return s;
}

function checkbox(html) {
  return html
    .replace(/^\[ \]\s?/, '<span class="ck" title="open"></span> ')
    .replace(/^\[[xX]\]\s?/, '<span class="ck done" title="done">✓</span> ')
    .replace(/^\[~\]\s?/, '<span class="ck wip" title="in progress">~</span> ');
}

function isBlockStart(line, next) {
  if (line == null) return false;
  return /^(#{1,6})\s/.test(line) || /^\s*(```|~~~)/.test(line) || /^\s*>/.test(line) ||
    /^\s*([-*_])(\s*\1){2,}\s*$/.test(line) || LIST_RE.test(line) ||
    (line.includes("|") && next != null && TABLE_SEP_RE.test(next));
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

function parseTable(lines, i) {
  const head = splitRow(lines[i]);
  const aligns = splitRow(lines[i + 1]).map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : ""));
  i += 2;
  const rows = [];
  while (i < lines.length && lines[i].includes("|") && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
  const cell = (tag, c, k) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ""}>${checkbox(inline(c ?? ""))}</${tag}>`;
  const html = `<div class="tbl-wrap"><table><thead><tr>${head.map((c, k) => cell("th", c, k)).join("")}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${head.map((_, k) => cell("td", r[k], k)).join("")}</tr>`).join("")}</tbody></table></div>`;
  return [html, i];
}

function parseList(lines, start) {
  const base = indentOf(lines[start]);
  const ordered = /^\s*\d+[.)]/.test(lines[start]);
  const items = [];
  let i = start;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && indentOf(lines[j]) >= base && LIST_RE.test(lines[j])) { i = j; continue; }
      break;
    }
    const ind = indentOf(l);
    const m = l.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (m && ind === base) { items.push({ text: m[2], kids: [] }); i++; continue; }
    if (ind > base && items.length) {
      if (m) { const [html, next] = parseList(lines, i); items[items.length - 1].kids.push(html); i = next; continue; }
      items[items.length - 1].text += `\n${l.trim()}`; i++; continue;
    }
    if (!m && items.length && ind >= base && !isBlockStart(l, lines[i + 1])) { items[items.length - 1].text += `\n${l.trim()}`; i++; continue; }
    break;
  }
  const tag = ordered ? "ol" : "ul";
  const body = items.map((it) => `<li>${checkbox(inline(it.text)).replace(/\n/g, "<br>")}${it.kids.join("")}</li>`).join("");
  return [`<${tag}>${body}</${tag}>`, i];
}

export function renderMarkdown(src) {
  const lines = String(src ?? "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (!line.trim()) { i++; continue; }
    if ((m = line.match(/^\s*(```|~~~)/))) {
      const fence = m[1];
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if ((m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) { const lv = m[1].length; out.push(`<h${lv}>${inline(m[2])}</h${lv}>`); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      out.push(`<blockquote>${renderMarkdown(buf.join("\n"))}</blockquote>`);
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) { const [html, next] = parseTable(lines, i); out.push(html); i = next; continue; }
    if (LIST_RE.test(line)) { const [html, next] = parseList(lines, i); out.push(html); i = next; continue; }
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) { buf.push(lines[i]); i++; }
    out.push(`<p>${inline(buf.join("\n")).replace(/\n/g, "<br>")}</p>`);
  }
  return out.join("\n");
}
