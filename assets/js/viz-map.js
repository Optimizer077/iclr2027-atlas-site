// map.html — atlas plate of every submission: UMAP scatter on canvas with zoom/pan, lettering,
// colour by major or mean rating, filters, search highlighting, hover tooltip and the shared detail drawer.
import {
  T0, boot, footer, readPalette, hexToRgb, ratingBins, ratingBin, fitCanvas, makeDrawer, paperTip,
  readHash, writeHash, markReady, fmtInt,
} from "./viz-common.js";
import { Camera } from "./viz-camera.js";
import { PointQuadtree } from "./viz-quadtree.js";
import { MapRenderer, dotRadius } from "./viz-map-render.js";
import { buildPanel } from "./viz-map-panel.js";
import { runQuery, searchAvailable, robustBounds } from "./viz-semantic.js";
import { ResultsPanel } from "./viz-results.js";
import { showTip, hideTip } from "./core/shell.js";
import { loadShardEntry } from "./core/data.js";
import { getScale } from "./core/scale.js";
import { debounce, isTyping } from "./core/util.js";

const KEYS = [["/", "Search (semantic when the API is up)"], ["+ / −", "Zoom in / out"], ["0", "Fit the whole plate"], ["← ↑ → ↓", "Pan"],
  ["c", "Colour by major / mean rating"], ["l", "Lettering on / off"], ["Esc", "Close paper / clear search"]];

const ctx = await boot({ page: "map", label: "Unfolding the atlas", keys: KEYS, clusters: true });
const tLoaded = performance.now();
const { papers } = ctx.data;
const n = papers.length;

/* ---------- model ---------- */
const majors = ctx.tax.majors.slice();
const majIndex = new Map(majors.map((m, i) => [m.id, i]));
for (const p of papers) if (!majIndex.has(p.maj)) { const m = ctx.tax.major(p.maj); majIndex.set(p.maj, majors.length); majors.push(m); }
const RB = 32;
const sc = getScale();
const M = {
  papers, n, colorMode: "maj", q: "", nMatch: -1,
  X: new Float32Array(n), Y: new Float32Array(n),
  maj: new Uint8Array(n), rbin: new Int8Array(n), size: new Uint8Array(n),
  lit: new Uint8Array(n), match: new Uint8Array(n), hitW: new Float32Array(n), hits: null, searchMode: "",
  litList: new Int32Array(0), ghostList: new Int32Array(0), matchList: new Int32Array(0),
  majorRGB: majors.map((m) => hexToRgb(m.color)), rampRGB: ratingBins(RB),
  panelRight: 0,
};
for (let i = 0; i < n; i++) {
  const p = papers[i];
  const ok = Number.isFinite(p.x) && Number.isFinite(p.y);
  M.X[i] = ok ? p.x : NaN;
  M.Y[i] = ok ? p.y : NaN;
  M.maj[i] = majIndex.get(p.maj);
  M.rbin[i] = ratingBin(p.r, RB);
  M.size[i] = p.r == null ? 0 : Math.max(0, Math.min(5, Math.floor(((p.r - sc.min) / (sc.max - sc.min)) * 5.999)));
}
M.colorOf = (i) => (M.colorMode === "rating" ? (M.rampRGB[M.rbin[i]] || [140, 140, 140]) : M.majorRGB[M.maj[i]]);
// draw order: low ratings first so strong papers sit on top
const order = Int32Array.from({ length: n }, (_, i) => i)
  .filter((i) => Number.isFinite(M.X[i]))
  .sort((a, b) => (papers[a].r ?? -1) - (papers[b].r ?? -1) || papers[a].n - papers[b].n);
M.qt = new PointQuadtree(M.X, M.Y, order);

let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
for (const i of order) { const x = M.X[i], y = M.Y[i]; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
const padB = 0.03 * Math.max(bx1 - bx0, by1 - by0);
const BOUNDS = [bx0 - padB, by0 - padB, bx1 + padB, by1 + padB];
{
  const cols = 14, cw = (BOUNDS[2] - BOUNDS[0]) / cols;
  const rows = Math.max(4, Math.round((BOUNDS[3] - BOUNDS[1]) / cw));
  M.grid = { x0: BOUNDS[0], y0: BOUNDS[1], x1: BOUNDS[2], y1: BOUNDS[3], cols, rows, cw, ch: (BOUNDS[3] - BOUNDS[1]) / rows };
}
const gridRef = (i) => {
  const G = M.grid, c = Math.floor((M.X[i] - G.x0) / G.cw), r = Math.floor((G.y1 - M.Y[i]) / G.ch);
  return c >= 0 && r >= 0 ? `${String.fromCharCode(65 + c)}${r + 1}` : "";
};

/** Major lettering anchor: the densest 3×3 block of a 48×48 histogram, not the (often empty) mean. */
function majorAnchors() {
  const Gn = 48, sx = Gn / (BOUNDS[2] - BOUNDS[0]), sy = Gn / (BOUNDS[3] - BOUNDS[1]);
  const H = majors.map(() => new Uint16Array(Gn * Gn));
  const count = new Int32Array(majors.length);
  for (const i of order) {
    const gx = Math.min(Gn - 1, Math.floor((M.X[i] - BOUNDS[0]) * sx)), gy = Math.min(Gn - 1, Math.floor((M.Y[i] - BOUNDS[1]) * sy));
    H[M.maj[i]][gy * Gn + gx]++; count[M.maj[i]]++;
  }
  majors.forEach((m, mi) => {
    const h = H[mi];
    let best = -1, bv = 0;
    for (let gy = 1; gy < Gn - 1; gy++) for (let gx = 1; gx < Gn - 1; gx++) {
      let v = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) v += h[(gy + dy) * Gn + gx + dx];
      if (v > bv) { bv = v; best = gy * Gn + gx; }
    }
    m._count = count[mi];
    if (best < 0) return;
    const cgx = best % Gn, cgy = Math.floor(best / Gn);
    let ax = 0, ay = 0, k = 0;
    for (const i of order) {
      if (M.maj[i] !== mi) continue;
      const gx = Math.floor((M.X[i] - BOUNDS[0]) * sx), gy = Math.floor((M.Y[i] - BOUNDS[1]) * sy);
      if (Math.abs(gx - cgx) <= 1 && Math.abs(gy - cgy) <= 1) { ax += M.X[i]; ay += M.Y[i]; k++; }
    }
    m.lx = ax / k; m.ly = ay / k;
    const name = m.name.toUpperCase();
    if (name.length > 18) {
      const mid = name.length / 2;
      let cut = -1;
      for (let j = 0; j < name.length; j++) if (name[j] === " " && (cut < 0 || Math.abs(j - mid) < Math.abs(cut - mid))) cut = j;
      m.lines = cut > 0 ? [name.slice(0, cut), name.slice(cut + 1)] : [name];
    } else m.lines = [name];
    m.visible = true;
  });
  M.majorsByCount = majors.filter((m) => m.lines).sort((a, b) => b._count - a._count);
}
majorAnchors();

/** Cluster names from top terms: keep the most specific of overlapping terms, at most two. */
function clusterText(c) {
  const terms = (c.top_terms && c.top_terms.length ? c.top_terms : String(c.label || "").split(" · ")).slice(0, 6);
  let chosen = [];
  for (const t of terms) {
    if (!t) continue;
    if (chosen.some((x) => x.includes(t))) continue;
    const sub = chosen.filter((x) => t.includes(x));
    if (sub.length) chosen = chosen.filter((x) => !t.includes(x)).concat([t]);
    else if (chosen.length < 2) chosen.push(t);
  }
  return chosen.slice(0, 2).join(" · ");
}
M.clusters = (ctx.clusters || []).filter((c) => Number.isFinite(c.x)).sort((a, b) => b.size - a.size)
  .map((c, rank, all) => ({ x: c.x, y: c.y, size: c.size, maj: c.maj, text: clusterText(c), z: 1.45 + 2.6 * (rank / all.length), visible: true }));

/* ---------- state ---------- */
const H0 = readHash();
const S = {
  color: H0.get("c") === "rating" ? "rating" : "maj",
  st: ["active", "withdrawn", "desk_rejected", "all"].includes(H0.get("st")) ? H0.get("st") : "active",
  rmin: Number.isFinite(parseFloat(H0.get("r"))) ? parseFloat(H0.get("r")) : sc.min,
  off: new Set((H0.get("off") || "").split(",").filter(Boolean)),
  q: H0.get("q") || "",
  mode: H0.get("m") === "kw" ? "kw" : "sem",
  k: Math.max(50, Math.min(500, parseInt(H0.get("k") || "200", 10) || 200)),
  labels: H0.get("lab") !== "0",
};
M.colorMode = S.color;

function applyFilters() {
  const eps = 1e-9;
  const lit = [], ghost = [];
  const byMaj = new Int32Array(majors.length), byBin = new Int32Array(RB), bySt = { active: 0, withdrawn: 0, desk_rejected: 0 };
  for (const i of order) {
    const p = papers[i];
    bySt[p.s] = (bySt[p.s] || 0) + 1;
    const stOk = S.st === "all" || p.s === S.st;
    const rOk = S.rmin <= sc.min + eps || (p.r != null && p.r >= S.rmin - eps);
    const base = stOk && rOk;
    if (base) byMaj[M.maj[i]]++;
    const on = base && !S.off.has(p.maj);
    M.lit[i] = on ? 1 : 0;
    if (on) { lit.push(i); if (M.rbin[i] >= 0) byBin[M.rbin[i]]++; } else ghost.push(i);
  }
  M.litList = Int32Array.from(lit);
  M.ghostList = Int32Array.from(ghost);
  for (const m of M.majorsByCount) m.visible = !S.off.has(m.id) && byMaj[majIndex.get(m.id)] > 0;
  for (const c of M.clusters) c.visible = !S.off.has(c.maj);
  M.counts = { byMaj, byBin, bySt, lit: lit.length };
  applySearch();
}

/** Intersect the current query hits with the plotted (filtered) papers. Draw order: least relevant first. */
function applySearch() {
  M.match.fill(0);
  if (!M.hits || !S.q) { M.q = ""; M.nMatch = -1; M.matchList = new Int32Array(0); return; }
  M.q = S.q;
  const ml = [];
  for (let t = M.hits.length - 1; t >= 0; t--) { const i = M.hits[t]; if (M.lit[i]) { M.match[i] = 1; ml.push(i); } }
  M.matchList = Int32Array.from(ml);
  M.nMatch = ml.length;
}

let qToken = 0, lastQuery = null;
/** Run the query (semantic or keyword), then highlight, list and (optionally) fit the camera to the hits. */
async function runSearch({ fit = true } = {}) {
  const tok = ++qToken;
  if (!S.q) {
    lastQuery = null; M.hits = null; M.hitW.fill(0); M.searchMode = ""; M.rightPad = 0;
    applySearch(); results.set({ q: "" }); panel.update(); updateCartouche(); rerender(); syncHash();
    return;
  }
  panel.busy(true);
  const r = await runQuery(S.q, { k: S.mode === "kw" ? Infinity : S.k, status: S.st, mode: S.mode, data: ctx.data });
  if (tok !== qToken) return;
  panel.busy(false);
  lastQuery = { ...r, statusUsed: S.st };
  M.searchMode = r.mode;
  M.hitW.fill(0);
  const hits = [];
  const sMax = r.items.reduce((m, it) => Math.max(m, it.s), 0), sMin = r.items.reduce((m, it) => Math.min(m, it.s), Infinity);
  for (const it of r.items) {
    const i = it.p._i;
    if (!Number.isFinite(M.X[i])) continue;
    hits.push(i);
    M.hitW[i] = r.mode === "sem" && sMax > sMin ? 0.3 + (0.7 * (it.s - sMin)) / (sMax - sMin) : 0.55;
  }
  M.hits = Int32Array.from(hits);
  applySearch();
  const listed = r.mode === "kw" ? r.items.slice(0, S.k) : r.items;
  results.set({ q: S.q, mode: r.mode, items: listed, total: r.items.length, took: r.took, note: r.note, shown: M.nMatch, label: "on the plate" });
  M.rightPad = resultsWidth() ? resultsWidth() - 64 : 0;
  if (fit) fitHits();
  panel.update(); updateCartouche(); rerender(); syncHash();
  markReady({ searchMode: r.mode, searchHits: r.items.length, searchShown: M.nMatch, searchMs: r.took });
}

function fitHits() {
  const src = M.nMatch > 0 ? M.matchList : M.hits;
  if (!src || !src.length) return;
  const xs = [], ys = [];
  for (const i of src) { xs.push(M.X[i]); ys.push(M.Y[i]); }
  const b = robustBounds(xs, ys, (BOUNDS[2] - BOUNDS[0]) * 0.08);
  if (!b) return;
  cam.interacted = true;
  // phones: the results list is a bottom sheet and the panel head sits on top
  const narrow = cam.w <= 900 && results.visible;
  const pr = plate.getBoundingClientRect();
  const padBottom = narrow ? Math.max(0, pr.bottom - results.el.getBoundingClientRect().top) : 0;
  const padTop = narrow ? Math.max(0, panelEl.getBoundingClientRect().bottom - pr.top) : 0;
  cam.fit(b, narrow ? 16 : 40, { animate: true, remember: false, padLeft: M.panelRight ? M.panelRight - 10 : 0, padRight: resultsWidth(), padTop, padBottom, maxZoom: 9 });
}
const resultsWidth = () => (results.visible && cam.w > 900 ? results.el.getBoundingClientRect().width + 80 : 0);

/* ---------- canvases, camera, renderer ---------- */
const plate = document.getElementById("plate");
const cvBase = document.getElementById("cv-base"), cvOver = document.getElementById("cv-over"), cvHeat = document.getElementById("cv-heat");
let hover = -1, sel = -1, nbrs = [], hoverStrong = false;
let baseDirty = true, overDirty = true, raf = 0;
const cam = new Camera(cvOver, {
  onChange: () => { camMovedAt = performance.now(); baseDirty = overDirty = true; schedule(); saveView(); },
  onHover: (x, y, e) => pick(x, y, e),
  onLeave: () => { if (hover >= 0) { hover = -1; overDirty = true; schedule(); } hideTip(); results.mark(null); },
  onClick: (x, y) => { const i = hit(x, y); if (i >= 0) drawer.open(papers[i].id); },
  onDragStart: () => { hideTip(); hover = -1; overDirty = true; },
});
const R = new MapRenderer(cvBase, cvOver, cam, M, cvHeat);
window.__vizStats = R.stats;
R.setPalette(readPalette());
R.showLabels = S.labels;

function schedule() { if (!raf) raf = requestAnimationFrame(frame); }
let firstFrame = 0, camMovedAt = 0, settleTimer = 0, forceFull = true;
function frame() {
  raf = 0;
  if (baseDirty) {
    // A slow full draw (> 12 ms) is replaced by a re-blit while the camera is moving; full detail returns on settle.
    const moving = !forceFull && performance.now() - camMovedAt < 140;
    if (moving && R.stats.last > 12 && R.drawFast()) {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { forceFull = true; baseDirty = true; schedule(); }, 150);
    } else R.drawBase();
    R.drawHeat();
    baseDirty = false; forceFull = false;
  }
  if (overDirty) { R.drawOverlay(hover, sel, nbrs, hoverStrong); overDirty = false; }
  if (!firstFrame) {
    firstFrame = performance.now();
    markReady({ page: "map", firstRenderMs: Math.round(firstFrame - T0), dataMs: Math.round(tLoaded - T0), points: M.litList.length, ghosts: M.ghostList.length, drawMs: Math.round(R.stats.last * 10) / 10 });
  }
}
const rerender = () => { forceFull = true; baseDirty = overDirty = true; schedule(); };

function hit(x, y) {
  const r = (9 + dotRadius(5, cam.zoom)) / cam.k;
  const prefer = M.q && M.nMatch > 0;
  const i = prefer ? M.qt.nearest(cam.wx(x), cam.wy(y), r, (j) => M.match[j] === 1) : -1;
  return i >= 0 ? i : M.qt.nearest(cam.wx(x), cam.wy(y), r, (j) => M.lit[j] === 1);
}
function pick(x, y, e) {
  const i = hit(x, y);
  cvOver.style.cursor = i >= 0 ? "pointer" : "";
  if (i !== hover || hoverStrong) { hover = i; hoverStrong = false; overDirty = true; schedule(); }
  results.mark(i >= 0 && M.match[i] ? papers[i].id : null);
  if (i >= 0) {
    const p = papers[i], ref = gridRef(i);
    showTip(`${paperTip(p, ctx.tax)}${ref ? `<div class="vt-ref">grid ${ref}</div>` : ""}`, e.clientX, e.clientY);
  } else hideTip();
}

let fitted = false;
function layout() {
  fitCanvas(cvBase); fitCanvas(cvOver); fitCanvas(cvHeat);
  const r = plate.getBoundingClientRect();
  cam.resize(r.width, r.height);
  const pr = panelEl.getBoundingClientRect();
  M.panelRight = panelEl.classList.contains("collapsed") || r.width < 760 ? 0 : pr.right - r.left + 6;
  M.rightPad = results && results.visible && resultsWidth() ? resultsWidth() - 64 : 0;
  if (!fitted) { fitView(false); fitted = true; restoreView(); }
  rerender();
}
function fitView(animate = true) {
  const padLeft = M.panelRight ? M.panelRight - 10 : 0;
  cam.fit(BOUNDS, 26, { animate, padLeft });
}

/* ---------- view persistence in the hash ---------- */
function restoreView() {
  const v = (H0.get("v") || "").split(",").map(Number);
  if (v.length === 3 && v.every(Number.isFinite) && v[2] > 0) { cam.set(v[0], v[1], cam.fitK * v[2]); cam.interacted = true; }
}
const saveView = debounce(() => syncHash(), 250);
function syncHash() {
  writeHash({
    q: S.q, m: S.mode === "kw" ? "kw" : "", k: S.k !== 200 ? S.k : "", c: S.color === "rating" ? "rating" : "", st: S.st !== "active" ? S.st : "",
    r: S.rmin > sc.min ? S.rmin.toFixed(2) : "", off: [...S.off].join(","),
    lab: S.labels ? "" : "0", open: drawer?.current?.id || "",
    v: Math.abs(cam.zoom - 1) > 0.01 || cam.interacted ? `${cam.cx.toFixed(3)},${cam.cy.toFixed(3)},${cam.zoom.toFixed(2)}` : "",
  });
}

/* ---------- drawer ---------- */
const drawer = makeDrawer(ctx, {
  onOpen: (id) => select(ctx.data.byId.get(id)),
  onClose: () => { sel = -1; nbrs = []; overDirty = true; schedule(); syncHash(); },
});
let selToken = 0;
async function select(p) {
  if (!p) return;
  sel = p._i; nbrs = [];
  overDirty = true; schedule(); syncHash();
  const sx = cam.sx(M.X[sel]), sy = cam.sy(M.Y[sel]);
  const drawerW = Math.min(580, innerWidth);
  if (Number.isFinite(sx) && (sx < M.panelRight + 20 || sx > cam.w - drawerW - 20 || sy < 30 || sy > cam.h - 30)) {
    const k = Math.max(cam.k, cam.fitK * 2.2);
    const targetSx = M.panelRight + (cam.w - drawerW - M.panelRight) / 2;
    cam.flyTo(M.X[sel] - (targetSx - cam.w / 2) / k, M.Y[sel], k);
  }
  const tok = ++selToken;
  const ids = await loadShardEntry("neighbors", p).catch(() => null);
  if (tok !== selToken) return;
  nbrs = (Array.isArray(ids) ? ids : []).map((id) => ctx.data.byId.get(id)).filter((q) => q && Number.isFinite(M.X[q._i])).map((q) => q._i);
  overDirty = true; schedule();
}

/* ---------- panel ---------- */
const panelEl = document.getElementById("panel");
const panel = buildPanel({
  el: panelEl, ctx, M, S, majors, majIndex, RB,
  onChange(kind) {
    if (kind === "color") { M.colorMode = S.color; R.atlasKey = ""; }
    if (kind === "labels") R.showLabels = S.labels;
    if (kind === "filters") {
      const st = lastQuery && S.q ? S.st : null;
      applyFilters();
      if (st && lastQuery.statusUsed !== st) { runSearch({ fit: false }); return; }
      if (lastQuery) results.set({ q: S.q, mode: lastQuery.mode, items: lastQuery.mode === "kw" ? lastQuery.items.slice(0, S.k) : lastQuery.items, total: lastQuery.items.length, took: lastQuery.took, note: lastQuery.note, shown: M.nMatch, label: "on the plate" });
    }
    if (kind === "search" || kind === "mode") { runSearch({ fit: true }); return; }
    if (kind === "k") { runSearch({ fit: false }); return; }
    if (kind === "open-best") { const it = results.items[0]; if (it) drawer.open(it.p.id); return; }
    panel.update();
    updateCartouche();
    rerender(); syncHash();
  },
  onFit: () => fitView(true),
  onZoom: (f) => cam.flyTo(cam.cx, cam.cy, cam.k * f, 220),
  onCollapse: () => { layout(); },
});

const cart = document.getElementById("cart-stats");
function updateCartouche() {
  const c = M.counts;
  cart.innerHTML = `<b>${fmtInt(c.lit)}</b> plotted · <b>${fmtInt(M.ghostList.length)}</b> ghosted${M.nMatch >= 0 ? ` · <b class="acc">${fmtInt(M.nMatch)}</b> ${M.searchMode === "sem" ? "semantic hits" : "matches"}` : ""}`;
}

/* ---------- results list (right) ---------- */
const results = new ResultsPanel(document.getElementById("results"), {
  tax: ctx.tax,
  onHover(id) {
    const i = id ? ctx.data.byId.get(id)?._i ?? -1 : -1;
    hover = i; hoverStrong = i >= 0; overDirty = true; schedule();
  },
  onOpen: (id) => drawer.open(id),
  onClear: () => panel.clearSearch(),
  onFit: () => fitHits(),
});

/* ---------- theme, resize, keys ---------- */
window.addEventListener("atlas:theme", () => {
  R.setPalette(readPalette());
  M.rampRGB = ratingBins(RB);
  panel.update();
  rerender();
});
new ResizeObserver(() => layout()).observe(plate);
matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener?.("change", () => layout());

document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (isTyping(e)) return;
  if (document.querySelector(".modal-back, .lmenu")) return;
  if (e.target.closest?.(".drawer, .vpanel, .vresults") && e.key !== "/") return; // let the drawer / panels scroll
  if (e.key === "/") { panel.focusSearch(); e.preventDefault(); return; }
  if (e.key === "0") { fitView(true); e.preventDefault(); return; }
  if (e.key === "c") { panel.toggleColor(); e.preventDefault(); return; }
  if (e.key === "l") { panel.toggleLabels(); e.preventDefault(); return; }
  if (e.key === "Escape" && !drawer.isOpen && S.q) { panel.clearSearch(); e.preventDefault(); return; }
  if (cam.key(e)) e.preventDefault();
});

/* ---------- go ---------- */
applyFilters();
panel.update();
updateCartouche();
searchAvailable().then((ok) => {
  panel.setSemantic(ok);
  if (!ok && S.mode === "sem") { S.mode = "kw"; panel.update(); }
  markReady({ semanticApi: ok });
});
footer(ctx, `<span>UMAP of title + abstract embeddings · ${fmtInt(M.clusters.length)} clusters</span>`);
layout();
ctx.overlay.done();
const open = H0.get("open");
if (open && ctx.data.byId.has(open)) drawer.open(open);
if (S.q) runSearch({ fit: !H0.get("v") });
