// Small DOM / formatting helpers shared by every page.

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, (c) => ESC[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const NF = new Intl.NumberFormat("en-US");
export const fmtInt = (n) => (n == null ? "—" : NF.format(n));
export const fmt = (n, d = 2) => (n == null || Number.isNaN(n) ? "—" : Number(n).toFixed(d));
export const fmtPct = (n, d = 1) => (n == null ? "—" : `${Number(n).toFixed(d)}%`);

export function debounce(fn, ms = 150) {
  let t;
  const wrapped = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  wrapped.flush = (...a) => { clearTimeout(t); fn(...a); };
  return wrapped;
}

export function rafThrottle(fn) {
  let queued = false;
  return (...a) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...a); });
  };
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function mean(xs) {
  let s = 0, n = 0;
  for (const x of xs) if (x != null) { s += x; n++; }
  return n ? s / n : null;
}

export function median(sorted) {
  if (!sorted.length) return null;
  const m = sorted.length >> 1;
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

export function fmtDate(iso, withTime = true) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const pad = (x) => String(x).padStart(2, "0");
  const day = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  return withTime ? `${day} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC` : day;
}

export function timeAgo(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function download(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export function escRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/** Wrap occurrences of the search terms in <mark>; input is raw text, output is safe HTML. */
export function highlight(text, terms) {
  const safe = esc(text);
  if (!terms || !terms.length) return safe;
  const re = new RegExp(`(${terms.map((t) => escRegex(esc(t))).join("|")})`, "gi");
  return safe.replace(re, "<mark>$1</mark>");
}

export function isTyping(e) {
  const t = e.target;
  return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}

const ROMAN = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function roman(n) {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}
