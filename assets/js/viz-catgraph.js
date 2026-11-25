// Category graph: fine categories as nodes (size = paper count, colour = major or mean rating),
// edges weighted by how many papers carry both fine tags. Computed client-side from papers.json;
// laid out with the same force engine (collision on), warm-started at each category's mean UMAP position.
import { Stage } from "./viz-stage.js";
import { createForce } from "./viz-force.js";
import { LabelBoxes, haloText, hexToRgb, rgba, labelInk, esc, fmt, fmtInt, pageHref } from "./viz-common.js";
import { ratingRGB } from "./core/scale.js";
import { showTip, hideTip } from "./core/shell.js";

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class CategoryGraph {
  constructor(app) {
    this.app = app;
    const H = app.H;
    this.scope = H.get("scope") === "all" ? "all" : "active";
    this.color = H.get("cc") === "rating" ? "rating" : "maj";
    this.minCo = clamp(parseInt(H.get("min") || "10", 10) || 10, 1, 80);
    this.cross = H.get("cross") === "1";
    this.hover = -1;
    this.hits = null;       // Map fine id → number of topic hits tagged with it
    this.focusFine = null;  // fine ids of the paper hovered in the results list
    this.labels = new LabelBoxes();
    this.stage = new Stage(app.plate, {
      label: "Network of fine categories linked by shared papers",
      draw: (c, s) => this.draw(c, s),
      onHover: (x, y, e) => this.pick(x, y, e),
      onLeave: () => { this.setHover(-1); hideTip(); },
      onClick: (x, y) => { const i = this.hit(x, y); if (i >= 0) location.href = pageHref("index.html", `fine=${encodeURIComponent(this.nodes[i].id)}`); },
      onCamera: () => app.onState(),
    });
    this.buildPanel();
  }

  state() {
    return { scope: this.scope === "all" ? "all" : "", cc: this.color === "rating" ? "rating" : "", min: this.minCo !== 10 ? this.minCo : "", cross: this.cross ? "1" : "" };
  }

  show() { this.stage.show(); if (!this.nodes) this.compute(); }

  /** Light up fine categories by how many topic hits carry them. */
  setHits(result) {
    if (!result || !result.items.length) { this.hits = null; this.hitN = 0; }
    else {
      const m = new Map();
      for (const it of result.items) for (const f of new Set(it.p.fine)) m.set(f, (m.get(f) || 0) + 1);
      this.hits = m; this.hitN = result.items.length;
      this.hitMax = Math.max(1, ...m.values());
    }
    this.renderSpread();
    if (this.nodes) this.fitTo(this.stage.visible);
    this.stage.request();
  }
  paperFocus(id) {
    const p = id ? this.app.ctx.data.byId.get(id) : null;
    this.focusFine = p ? new Set(p.fine) : null;
    if (this.stage.visible) this.stage.request();
  }
  renderSpread() {
    const el = this.el.spread;
    if (!this.hits) { el.hidden = true; return; }
    const tax = this.app.ctx.tax;
    const top = [...this.hits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    el.hidden = false;
    el.innerHTML = `<div class="vp-h"><span class="eyebrow">Where the ${fmtInt(this.hitN)} hits fall</span></div>
      <ul class="vp-hits">${top.map(([f, c]) => { const fi = tax.fine(f), m = tax.major(fi.maj);
        return `<li><i class="sw" style="--c:${esc(m.color)}"></i><span class="nm" title="${esc(fi.name)}">${esc(fi.name)}</span><b>${fmtInt(c)}</b></li>`; }).join("")}</ul>`;
  }
  hide() { this.stage.hide(); hideTip(); }

  buildPanel() {
    const sec = this.app.sec;
    sec.innerHTML = `
      <div class="vp-sec" id="cg-spread" hidden></div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Papers counted</span></div>
        <div class="seg" data-g="scope"><button data-v="active">Active submissions</button><button data-v="all">All, incl. withdrawn</button></div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Node colour</span></div>
        <div class="seg" data-g="color"><button data-v="maj">Major category</button><button data-v="rating">Mean rating</button></div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Minimum shared papers</span><b class="mono" id="cg-min-v"></b></div>
        <div class="vp-slider"><input id="cg-min" type="range" min="1" max="60" step="1" value="${this.minCo}" aria-label="Minimum shared papers per link">
          <div class="vp-axis mono"><span>1</span><span>30</span><span>60</span></div></div>
        <label class="switch" style="margin-top:10px"><input type="checkbox" id="cg-cross"${this.cross ? " checked" : ""}> Only links across major categories</label>
      </div>
      <div class="vp-sec">
        <div class="vp-btns"><button class="btn sm" id="cg-rerun">Re-run layout</button><button class="btn sm" id="cg-fit">Fit</button></div>
      </div>
      <div class="vp-sec">
        <dl class="vp-stats" id="cg-stats"></dl>
        <div class="vp-edge-key" id="cg-key"></div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Majors</span><span class="small muted">fine categories</span></div>
        <ul class="vp-legend compact" id="cg-legend"></ul>
        <p class="vp-hint small muted">Circle area grows with the number of papers tagged with that fine category. A link's width grows with the number of papers carrying both tags. Click a category to open it in the Explorer.</p>
      </div>`;
    const $ = (s) => sec.querySelector(s);
    sec.querySelectorAll(".seg").forEach((g) => g.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]");
      if (!b) return;
      if (g.dataset.g === "scope") { this.scope = b.dataset.v; this.compute(); }
      else { this.color = b.dataset.v; this.syncPanel(); this.stage.request(); }
      this.app.onState();
    }));
    const min = $("#cg-min");
    min.addEventListener("input", () => { this.minCo = +min.value; this.buildEdges(); this.stage.request(); this.app.onState(); });
    $("#cg-cross").addEventListener("change", (e) => { this.cross = e.target.checked; this.buildEdges(); this.stage.request(); this.app.onState(); });
    $("#cg-rerun").addEventListener("click", () => { this.layout(true); this.fitTo(true); });
    $("#cg-fit").addEventListener("click", () => this.fitTo(true));
    this.el = { min, minV: $("#cg-min-v"), stats: $("#cg-stats"), key: $("#cg-key"), legend: $("#cg-legend"), spread: $("#cg-spread") };
  }

  syncPanel() {
    const sec = this.app.sec;
    sec.querySelectorAll('.seg[data-g="scope"] button').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === this.scope)));
    sec.querySelectorAll('.seg[data-g="color"] button').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === this.color)));
    this.el.minV.textContent = `≥ ${this.minCo}`;
  }

  /* ---------- data ---------- */
  compute() {
    const t0 = performance.now();
    const { papers } = this.app.ctx.data, tax = this.app.ctx.tax;
    const ids = [];
    for (const m of tax.majors) for (const f of m.fine) ids.push(f.id);
    const fIndex = new Map(ids.map((id, i) => [id, i]));
    for (const p of papers) for (const f of p.fine) if (!fIndex.has(f)) { fIndex.set(f, ids.length); ids.push(f); }
    const F = ids.length;
    const count = new Int32Array(F), sumR = new Float64Array(F), nR = new Int32Array(F), sx = new Float64Array(F), sy = new Float64Array(F), nxy = new Int32Array(F);
    const pairs = new Map();
    let multi = 0;
    for (const p of papers) {
      if (this.scope === "active" && p.s !== "active") continue;
      const fs = [...new Set(p.fine)].map((f) => fIndex.get(f)).sort((a, b) => a - b);
      if (fs.length > 1) multi++;
      for (const f of fs) {
        count[f]++;
        if (p.r != null) { sumR[f] += p.r; nR[f]++; }
        if (Number.isFinite(p.x)) { sx[f] += p.x; sy[f] += p.y; nxy[f]++; }
      }
      for (let a = 0; a < fs.length; a++) for (let b = a + 1; b < fs.length; b++) {
        const k = fs[a] * F + fs[b];
        pairs.set(k, (pairs.get(k) || 0) + 1);
      }
    }
    const nodes = [];
    const map = new Map();
    for (let f = 0; f < F; f++) {
      if (!count[f]) continue;
      const fine = tax.fine(ids[f]), maj = tax.major(fine.maj);
      map.set(f, nodes.length);
      nodes.push({ id: ids[f], name: fine.name, maj: maj.id, majName: maj.name, color: maj.color, rgb: hexToRgb(maj.color),
        count: count[f], mean: nR[f] ? sumR[f] / nR[f] : null, ux: nxy[f] ? sx[f] / nxy[f] : 0, uy: nxy[f] ? sy[f] / nxy[f] : 0 });
    }
    const allEdges = [];
    for (const [k, c] of pairs) {
      const a = map.get(Math.floor(k / F)), b = map.get(k % F);
      if (a == null || b == null) continue;
      allEdges.push({ a, b, c, assoc: c / Math.sqrt(nodes[a].count * nodes[b].count), cross: nodes[a].maj !== nodes[b].maj });
    }
    allEdges.sort((x, y) => x.c - y.c);
    // partner lists for tooltips
    nodes.forEach((n) => { n.partners = []; });
    for (const e of allEdges) { nodes[e.a].partners.push([e.b, e.c]); nodes[e.b].partners.push([e.a, e.c]); }
    nodes.forEach((n) => n.partners.sort((x, y) => y[1] - x[1]));
    const maxC = Math.max(...nodes.map((n) => n.count));
    nodes.forEach((n) => { n.r = 6 + 36 * Math.sqrt(n.count / maxC); });
    Object.assign(this, { nodes, allEdges, multi, maxC, computeMs: performance.now() - t0 });
    this.buildEdges();
    this.layout(true);
    this.renderLegend();
    this.syncPanel();
    this.fitTo(false);
    this.stage.request();
  }

  buildEdges() {
    this.edges = this.allEdges.filter((e) => e.c >= this.minCo && (!this.cross || e.cross));
    this.maxE = this.edges.reduce((m, e) => Math.max(m, e.c), 1);
    this.syncPanel();
    this.updateStats();
  }

  /** Synchronous force layout (≈150 nodes): links from co-occurrence, collision, weak anchor to UMAP centroid. */
  layout(fresh) {
    const t0 = performance.now();
    const nodes = this.nodes, n = nodes.length;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const v of nodes) { x0 = Math.min(x0, v.ux); x1 = Math.max(x1, v.ux); y0 = Math.min(y0, v.uy); y1 = Math.max(y1, v.uy); }
    const S = 1150 / Math.max(x1 - x0, y1 - y0, 1e-6), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const ax = new Float32Array(n), ay = new Float32Array(n), x = new Float32Array(n), y = new Float32Array(n), r = new Float32Array(n), q = new Float32Array(n);
    nodes.forEach((v, i) => {
      ax[i] = (v.ux - cx) * S; ay[i] = (v.uy - cy) * S;
      x[i] = !fresh && v.x != null ? v.x : ax[i]; y[i] = !fresh && v.y != null ? v.y : ay[i];
      r[i] = v.r; q[i] = 0.4 + v.r / 12;
    });
    // layout uses every pair with ≥ 3 shared papers so the arrangement does not jump with the display threshold
    const E = this.allEdges.filter((e) => e.c >= 3);
    const maxA = E.reduce((m, e) => Math.max(m, e.assoc), 1e-6);
    const src = new Uint32Array(E.length), dst = new Uint32Array(E.length), w = new Float32Array(E.length), L = new Float32Array(E.length);
    E.forEach((e, k) => {
      src[k] = e.a; dst[k] = e.b;
      const a = Math.sqrt(e.assoc / maxA);
      w[k] = 0.08 + 0.9 * a;
      L[k] = nodes[e.a].r + nodes[e.b].r + 22 + 130 * (1 - a);
    });
    const sim = createForce({
      n, x, y, ax, ay, src, dst, w, r, charge: q,
      params: { linkDistance: L, linkStrength: 1, chargeStrength: -240, theta: 0.85, distanceMax: 900, anchorStrength: 0.014,
        collide: true, collidePad: 4, collideStrength: 0.8, velocityDecay: 0.4, alpha: 1, alphaMin: 0.002, alphaDecay: 1 - Math.pow(0.002, 1 / 360) },
    });
    while (!sim.done()) sim.tick();
    nodes.forEach((v, i) => { v.x = sim.x[i]; v.y = sim.y[i]; });
    this.layoutMs = performance.now() - t0;
    this.layoutTicks = sim.ticks;
    // major region anchors (count-weighted centroid of their fine nodes)
    const acc = new Map();
    for (const v of nodes) {
      const a = acc.get(v.maj) || { x: 0, y: 0, w: 0, name: v.majName, color: v.color, k: 0 };
      a.x += v.x * v.count; a.y += v.y * v.count; a.w += v.count; a.k++;
      acc.set(v.maj, a);
    }
    this.regions = [...acc.values()].map((a) => ({ x: a.x / a.w, y: a.y / a.w, w: a.w, k: a.k, name: a.name.toUpperCase(), color: a.color })).sort((a, b) => b.w - a.w);
    this.updateStats();
  }

  /** Fit all categories, or only those holding topic hits when a topic is active. */
  fitTo(animate) {
    if (!this.nodes) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const only = this.hits ? this.nodes.filter((v) => this.hits.get(v.id)) : this.nodes;
    for (const v of only.length ? only : this.nodes) { x0 = Math.min(x0, v.x - v.r); x1 = Math.max(x1, v.x + v.r); y0 = Math.min(y0, v.y - v.r); y1 = Math.max(y1, v.y + v.r); }
    const pl = this.app.panelRight();
    this.stage.cam.fit([x0, y0, x1, y1], 46, { animate, padLeft: pl ? pl - 10 : 0, padRight: this.app.resultsPad(), remember: !this.hits, maxZoom: 2.5 });
  }

  updateStats() {
    if (!this.nodes || !this.el) return;
    const top = this.edges.length ? this.edges[this.edges.length - 1] : null;
    this.el.stats.innerHTML = `
      <div><dt>Categories</dt><dd>${fmtInt(this.nodes.length)}</dd></div><div><dt>Links shown</dt><dd>${fmtInt(this.edges.length)} <small class="muted">/ ${fmtInt(this.allEdges.length)}</small></dd></div>
      <div><dt>Multi-tag papers</dt><dd>${fmtInt(this.multi)}</dd></div><div><dt>Strongest link</dt><dd>${top ? fmtInt(top.c) : "—"}</dd></div>`;
    const wpx = (c) => this.edgeWidth(c, 1);
    this.el.key.innerHTML = `<span>link width</span><i style="height:${wpx(this.minCo).toFixed(1)}px"></i><span class="mono">${fmtInt(this.minCo)}</span><i style="height:${wpx(this.maxE).toFixed(1)}px"></i><span class="mono">${fmtInt(this.maxE)} shared</span>`;
  }

  renderLegend() {
    const tax = this.app.ctx.tax;
    const by = new Map();
    for (const v of this.nodes) by.set(v.maj, (by.get(v.maj) || 0) + 1);
    this.el.legend.innerHTML = [...by.entries()].sort((a, b) => b[1] - a[1]).map(([id, k]) => {
      const m = tax.major(id);
      return `<li><button class="lg" data-id="${esc(id)}" aria-pressed="true" tabindex="-1"><i class="sw" style="--c:${esc(m.color)}"></i><span class="nm">${esc(m.name)}</span><span class="n mono">${k}</span></button></li>`;
    }).join("");
    this.el.legend.onmouseover = (e) => { const b = e.target.closest(".lg"); this.hiMaj = b ? b.dataset.id : null; this.stage.request(); };
    this.el.legend.onmouseleave = () => { this.hiMaj = null; this.stage.request(); };
  }

  /* ---------- interaction ---------- */
  hit(x, y) {
    if (!this.nodes) return -1;
    const cam = this.stage.cam, wx = cam.wx(x), wy = cam.wy(y);
    let best = -1, bd = Infinity;
    this.nodes.forEach((v, i) => {
      const d = Math.hypot(v.x - wx, v.y - wy), lim = v.r + 6 / cam.k;
      if (d < lim && d < bd) { bd = d; best = i; }
    });
    return best;
  }
  pick(x, y, e) {
    const i = this.hit(x, y);
    this.stage.cv.style.cursor = i >= 0 ? "pointer" : "";
    this.setHover(i);
    if (i < 0) { hideTip(); return; }
    const v = this.nodes[i];
    const partners = v.partners.slice(0, 4).map(([j, c]) => `<span><span>${esc(this.nodes[j].name)}</span><b class="mono">${fmtInt(c)}</b></span>`).join("");
    showTip(`<div class="t">${esc(v.name)}</div>
      <div class="vt-row"><span class="vt-sw" style="background:${esc(v.color)}"></span>${esc(v.majName)}</div>
      <div class="m" style="margin-top:4px">${fmtInt(v.count)} papers · mean ${v.mean != null ? fmt(v.mean) : "—"}</div>
      ${this.hits ? `<div class="m" style="margin-top:2px;color:var(--accent-2)">${fmtInt(this.hits.get(v.id) || 0)} of ${fmtInt(this.hitN)} topic hits</div>` : ""}
      ${partners ? `<div class="vt-bars"><span style="opacity:.7"><span>Most often tagged with</span><span>shared</span></span>${partners}</div>` : ""}
      <div class="vt-ref">click to open in Explorer</div>`, e.clientX, e.clientY);
  }
  setHover(i) { if (i !== this.hover) { this.hover = i; this.stage.request(); } }

  /** Link width is linear in the shared-paper count (thin floor so weak links stay visible). */
  edgeWidth(c, zoomF) { return Math.min(16, (0.45 + (11 * c) / this.maxE) * zoomF); }

  /* ---------- drawing ---------- */
  draw(ctx, stage) {
    if (!this.nodes) return;
    const pal = this.app.pal(), cam = stage.cam, zoom = cam.zoom, nodes = this.nodes;
    const zf = clamp(Math.sqrt(zoom), 0.7, 2.5);
    const focus = this.hover;
    const near = focus >= 0 ? new Set([focus, ...nodes[focus].partners.filter(([, c]) => c >= this.minCo).map(([j]) => j)]) : null;
    const hits = this.hits, hitOf = (v) => (hits ? hits.get(v.id) || 0 : 0), ff = this.focusFine;
    const dimMaj = this.hiMaj;
    const S = (v) => [cam.sx(v.x), cam.sy(v.y)];

    // region lettering under everything
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const maxW = this.regions[0]?.w || 1;
    const hiName = dimMaj ? (this.app.ctx.tax.major(dimMaj).name || "").toUpperCase() : null;
    for (const g of this.regions) {
      if (g.k < 2 || g.name !== hiName) continue; // region lettering only for the major hovered in the legend
      const fs = 13 + 10 * Math.sqrt(g.w / maxW);
      ctx.font = `italic 500 ${fs}px ${pal.fontDisplay}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${(fs * 0.18).toFixed(1)}px`;
      ctx.globalAlpha = pal.dark ? 0.5 : 0.42;
      ctx.fillStyle = labelInk(g.color, pal, 0.2);
      ctx.fillText(g.name, cam.sx(g.x), cam.sy(g.y));
    }
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.globalAlpha = 1;

    // edges (light to heavy), gently curved
    ctx.lineCap = "round";
    for (const e of this.edges) {
      const A = nodes[e.a], B = nodes[e.b];
      const hot = near && (e.a === focus || e.b === focus);
      let alpha = e.cross ? (pal.dark ? 0.3 : 0.24) : 0.42;
      if (near) alpha = hot ? 0.92 : 0.04;
      else if (dimMaj) alpha = A.maj === dimMaj || B.maj === dimMaj ? alpha : 0.04;
      else if (hits) alpha = hitOf(A) && hitOf(B) ? Math.min(0.85, alpha * 1.6) : 0.05;
      const [x1, y1] = S(A), [x2, y2] = S(B);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx - dy * 0.12, my + dx * 0.12, x2, y2);
      ctx.lineWidth = this.edgeWidth(e.c, zf);
      ctx.strokeStyle = e.cross ? (hot ? pal.accent2 : rgba(pal.inkRGB, alpha)) : rgba(A.rgb, alpha);
      ctx.stroke();
    }

    // nodes
    const order = nodes.map((_, i) => i).sort((a, b) => nodes[b].count - nodes[a].count);
    for (const i of order) {
      const v = nodes[i], [x, y] = S(v), r = v.r * cam.k;
      if (x < -r || x > cam.w + r || y < -r || y > cam.h + r) continue;
      const h = hitOf(v);
      const dim = (near && !near.has(i)) || (dimMaj && v.maj !== dimMaj) || (!near && !dimMaj && hits && !h) || (ff && !ff.has(v.id) && !near);
      ctx.globalAlpha = dim ? 0.18 : 1;
      if (h && !dim) {
        // topic halo: width and reach grow with the number of hits in this category
        const u = Math.sqrt(h / this.hitMax);
        ctx.beginPath(); ctx.arc(x, y, r + 3 + 9 * u, 0, TAU);
        ctx.fillStyle = rgba(pal.dark ? [230, 178, 87] : [197, 141, 38], 0.16 + 0.22 * u); ctx.fill();
        ctx.lineWidth = 1.2 + 2.5 * u; ctx.strokeStyle = pal.accent2; ctx.stroke();
      }
      const fill = this.color === "rating" ? (v.mean != null ? ratingRGB(v.mean) : [140, 140, 140]) : v.rgb;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = rgba(fill, 0.93); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(pal.bgRGB, 0.95); ctx.stroke();
      if (this.color === "rating") { ctx.lineWidth = 2; ctx.strokeStyle = rgba(v.rgb, 0.95); ctx.beginPath(); ctx.arc(x, y, r + 2, 0, TAU); ctx.stroke(); }
      if (i === focus || (ff && ff.has(v.id))) { ctx.lineWidth = 2; ctx.strokeStyle = pal.ink; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, TAU); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;

    // labels: bigger categories first, never over the panel
    const L = this.labels;
    L.reset();
    L.add(-1e4, -1e4, this.app.panelRight(), 1e4);
    const rp = this.app.resultsPad();
    if (rp) L.add(cam.w - rp, -1e4, 1e4, 1e4);
    const halo = rgba(pal.bgRGB, 0.9);
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const list = near ? [...near].sort((a, b) => (a === focus ? -1 : b === focus ? 1 : nodes[b].count - nodes[a].count))
      : hits ? order.slice().sort((a, b) => hitOf(nodes[b]) - hitOf(nodes[a]) || nodes[b].count - nodes[a].count) : order;
    for (const i of list) {
      const v = nodes[i];
      if (!near && dimMaj && v.maj !== dimMaj) continue;
      if (!near && hits && hitOf(v) < Math.max(2, 0.03 * this.hitN) && zoom < 1.6) continue;
      const [x, y] = S(v), r = v.r * cam.k;
      const share = Math.sqrt(v.count / this.maxC);
      const fs = clamp(10 + 3.2 * share * zf, 10, 15);
      const font = `${i === focus ? 650 : share > 0.45 ? 600 : 500} ${fs}px ${pal.fontUi}`;
      ctx.font = font;
      const name = i === focus || v.name.length <= 34 ? v.name : `${v.name.slice(0, 32).trimEnd()}…`;
      const w = ctx.measureText(name).width;
      const lx = x + r + 4;
      const hc = hitOf(v), tag = hc ? ` ${hc}` : "";
      ctx.font = `600 ${Math.max(10, fs - 1)}px ${pal.fontMono}`;
      const tw = tag ? ctx.measureText(tag).width : 0;
      ctx.font = font;
      if (!L.place(lx - 1, y - fs / 2 - 1, lx + w + tw + 1, y + fs / 2 + 1)) continue;
      haloText(ctx, name, lx, y, i === focus || (near && near.has(i)) || share > 0.45 || hc ? pal.ink : pal.ink3, halo, 3);
      if (tag) { ctx.font = `600 ${Math.max(10, fs - 1)}px ${pal.fontMono}`; haloText(ctx, tag, lx + w, y, pal.accent, halo, 3); }
    }
    this.drawn = (this.drawn || 0) + 1;
  }

  key(e) {
    if (e.key === "0") { this.fitTo(true); return true; }
    return this.stage.cam.key(e);
  }
}
