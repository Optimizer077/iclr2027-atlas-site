// Shared plumbing for the visualization pages (map.html, graph.html):
// boot (shell + data), nav fallback, theme palette for canvas, colour maths, drawer, hash state, label placement.
import { initShell, setFooter, loadingOverlay, currentTheme } from "./core/shell.js";
import { loadPapers, loadTaxonomy, loadClusters, loadStats, pageHref } from "./core/data.js";
import { setScale, refreshScale, ratingRGB, getScale } from "./core/scale.js";
import { PaperDrawer } from "./components/detail.js";
import { esc, fmt, fmtInt, isTyping } from "./core/util.js";

export const T0 = performance.now();

/** The shell's PAGES list may not include Graph yet: add the link after Map (no-op once it exists). */
export function ensureGraphNav(page) {
  const nav = document.querySelector(".topbar .nav");
  if (!nav || nav.querySelector('[data-page="graph"]')) return;
  const a = document.createElement("a");
  a.href = pageHref("graph.html");
  a.dataset.page = "graph";
  a.textContent = "Graph";
  if (page === "graph") a.setAttribute("aria-current", "page");
  const map = nav.querySelector('[data-page="map"]');
  if (map) map.after(a); else nav.append(a);
}

/** Shell + papers + taxonomy (+ clusters, stats). Rejects after showing the overlay error. */
export async function boot({ page, label, keys = [], clusters = false }) {
  initShell({ page, keys });
  ensureGraphNav(page);
  const ov = loadingOverlay(label);
  try {
    const [data, tax, cl, stats] = await Promise.all([
      loadPapers((got, total) => ov.progress(got, total)),
      loadTaxonomy(),
      clusters ? loadClusters() : Promise.resolve([]),
      loadStats(),
    ]);
    setScale(data.meta.rating_scale);
    refreshScale();
    let ranked = 0;
    for (const p of data.papers) if (p.rk != null) ranked++;
    return { data, tax, clusters: cl, stats, ranked, overlay: ov };
  } catch (e) {
    ov.error(String((e && e.message) || e));
    throw e;
  }
}

export function footer(ctx, extra = "") {
  setFooter({ generated: ctx.data.meta.generated, records: ctx.data.papers.length, extra });
}

/* ---------- colour ---------- */
export function hexToRgb(hex) {
  const m = String(hex || "").trim().replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  return n.some(Number.isNaN) ? [138, 133, 120] : n;
}
export const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export const mix = (a, b, t) => [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * t));
const lum = (c) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;

/** Canvas-facing snapshot of the theme tokens (re-read on atlas:theme). */
export function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  const p = {
    dark: currentTheme() === "dark",
    bg: v("--bg"), bgSunk: v("--bg-sunk"), surface: v("--surface"), surfaceHi: v("--surface-hi"),
    ink: v("--ink"), ink2: v("--ink-2"), ink3: v("--ink-3"), ink4: v("--ink-4"),
    rule: v("--rule"), rule2: v("--rule-2"), accent: v("--accent"), accent2: v("--accent-2"), grid: v("--grid"),
    fontDisplay: v("--font-display") || "Georgia, serif",
    fontUi: v("--font-ui") || "sans-serif",
    fontMono: v("--font-mono") || "monospace",
  };
  p.bgRGB = hexToRgb(p.bg);
  p.inkRGB = hexToRgb(p.ink);
  return p;
}

/** Label colour for a category: its hue pulled toward the ink so it reads on paper and night. */
export function labelInk(hex, pal, t = 0.38) {
  const c = hexToRgb(hex);
  const target = pal.dark ? mix(c, [236, 230, 216], 0.25) : mix(c, pal.inkRGB, t);
  return `rgb(${target[0]},${target[1]},${target[2]})`;
}

/** Quantised diverging ramp for mean ratings: bins → [r,g,b]. */
export function ratingBins(nb = 32) {
  const { min, max } = getScale();
  const out = [];
  for (let b = 0; b < nb; b++) out.push(ratingRGB(min + ((b + 0.5) / nb) * (max - min)) || [136, 136, 136]);
  return out;
}
export function ratingBin(v, nb = 32) {
  const { min, max } = getScale();
  if (v == null) return -1;
  return Math.max(0, Math.min(nb - 1, Math.floor(((v - min) / (max - min)) * nb)));
}
export const inkFor = (c) => (lum(c) > 0.6 ? "#1d1b17" : "#ffffff");

/* ---------- canvas ---------- */
/** Size a canvas backing store to its CSS box × devicePixelRatio. Returns true when it changed. */
export function fitCanvas(canvas) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width === w && canvas.height === h && canvas._dpr === dpr) return false;
  canvas.width = w;
  canvas.height = h;
  canvas._dpr = dpr;
  return true;
}

/** Greedy screen-space label collision. */
export class LabelBoxes {
  constructor() { this.b = []; }
  reset() { this.b.length = 0; }
  fits(x0, y0, x1, y1) {
    for (const q of this.b) if (x0 < q[2] && x1 > q[0] && y0 < q[3] && y1 > q[1]) return false;
    return true;
  }
  add(x0, y0, x1, y1) { this.b.push([x0, y0, x1, y1]); }
  place(x0, y0, x1, y1) { if (!this.fits(x0, y0, x1, y1)) return false; this.add(x0, y0, x1, y1); return true; }
}

/** Text with a paper-coloured halo (map lettering). */
export function haloText(ctx, text, x, y, fill, halo, width = 3) {
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = halo;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/* ---------- drawer ---------- */
export function makeDrawer(ctx, { onOpen, onClose } = {}) {
  const el = document.getElementById("drawer");
  const d = new PaperDrawer(el, {
    byId: ctx.data.byId, tax: ctx.tax, stats: ctx.stats, rankedCount: ctx.ranked, onOpen, onClose,
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && d.isOpen && !isTyping(e) && !document.querySelector(".modal-back")) { d.close(); e.preventDefault(); }
  });
  return d;
}

/* ---------- tooltip body ---------- */
export function paperTip(p, tax) {
  const m = tax.major(p.maj);
  const rs = p.rs && p.rs.length ? ` <span class="vt-rs">(${p.rs.join(" · ")})</span>` : "";
  return `<div class="t">${esc(p.t)}</div>
    <div class="m">#${p.n} · ${p.r != null ? `<b>${fmt(p.r)}</b> mean · σ ${fmt(p.sd)} · ${p.nr || 0} reviews${rs}` : "no rating"}${p.rk != null ? ` · rank ${fmtInt(p.rk)}` : ""}</div>
    <div class="vt-row"><span class="vt-sw" style="background:${esc(m.color)}"></span>${esc(m.name)}${p.s !== "active" ? ` <span class="vt-dot">·</span> ${esc(p.s.replace("_", "-"))}` : ""}</div>`;
}

/* ---------- hash state ---------- */
export const readHash = () => new URLSearchParams(location.hash.replace(/^#/, ""));
export function writeHash(obj) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v != null && v !== "" && v !== false) sp.set(k, String(v));
  const s = sp.toString();
  history.replaceState(null, "", s ? `#${s}` : `${location.pathname}${location.search}`);
}

/** Expose timing + state for smoke tests. */
export function markReady(info) {
  window.__viz = Object.assign(window.__viz || {}, info);
  document.documentElement.dataset.vizReady = "1";
}

export { esc, fmt, fmtInt, pageHref };
