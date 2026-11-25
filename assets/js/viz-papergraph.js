// Paper graph: top-N papers by rank as nodes, embedding-neighbour links among them as edges,
// laid out by the self-written force simulation (Web Worker) warm-started from the UMAP map.
import { Stage } from "./viz-stage.js";
import { PointQuadtree } from "./viz-quadtree.js";
import { createRunner } from "./viz-force.js";
import { LabelBoxes, haloText, hexToRgb, rgba, paperTip, esc, fmt, fmtInt } from "./viz-common.js";
import { fetchJSON, shardOf } from "./core/data.js";
import { showTip, hideTip } from "./core/shell.js";
import { debounce } from "./core/util.js";

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class PaperGraph {
  /** @param {{ctx:any, plate:HTMLElement, sec:HTMLElement, drawer:any, pal:()=>any, H:URLSearchParams, onState:Function}} app */
  constructor(app) {
    this.app = app;
    const { papers } = app.ctx.data;
    this.papers = papers;
    this.ranked = papers.filter((p) => p.rk != null).sort((a, b) => a.rk - b.rk);
    const H = app.H;
    this.N = clamp(parseInt(H.get("n") || "2000", 10) || 2000, 500, 6000);
    this.fine = H.get("fine") || "";
    this.maj = H.get("maj") || (this.fine.includes(".") ? this.fine.split(".")[0] : "");
    this.hideIso = H.get("iso") === "0";
    this.frozen = false;
    this.token = 0;
    this.query = null;      // topic seed: {mode, items:[{p, s}]} from viz-semantic runQuery
    this.expand = false;    // also add each hit's 10 nearest neighbours
    this.pendingQuery = false;
    this.shardMap = new Map();
    this.n = 0;
    this.hover = -1; this.sel = -1;
    this.qtVersion = -1; this.posVersion = 0;
    this.labels = new LabelBoxes();
    this.status = { phase: "idle" };
    this.stage = new Stage(app.plate, {
      label: "Force-directed graph of top-ranked papers linked to their embedding neighbours",
      draw: (c, s) => this.draw(c, s),
      onHover: (x, y, e) => this.pick(x, y, e),
      onLeave: () => { this.setHover(-1); hideTip(); },
      onClick: (x, y) => { const i = this.hit(x, y); if (i >= 0) { hideTip(); app.drawer.open(this.nodes[i].id); } },
      onCamera: () => app.onState(),
    });
    this.runner = createRunner((xy, info) => this.onTick(xy, info));
    this.buildPanel();
    this.rebuildSoon = debounce(() => this.rebuild(), 220);
  }

  /* ---------- panel ---------- */
  buildPanel() {
    const { sec, ctx } = this.app;
    const majors = ctx.tax.majors;
    sec.innerHTML = `
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Top-ranked papers</span><b class="mono" id="pg-n-v"></b></div>
        <div class="vp-slider"><input id="pg-n" type="range" min="500" max="6000" step="100" value="${this.N}" aria-label="Number of papers">
          <div class="vp-axis mono"><span>500</span><span>3,000</span><span>6,000</span></div></div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Restrict to</span><button class="vp-link" data-act="pg-clear">everything</button></div>
        <div class="vp-row"><select class="select" id="pg-maj" aria-label="Major category"><option value="">All major categories</option>
          ${majors.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("")}</select></div>
        <div class="vp-row" style="margin-top:6px"><select class="select" id="pg-fine" aria-label="Fine category"></select></div>
      </div>
      <div class="vp-sec">
        <div class="vp-btns">
          <button class="btn sm" id="pg-freeze" title="Stop or resume the force simulation (f)">Freeze layout</button>
          <button class="btn sm" id="pg-rerun" title="Restart from the UMAP positions">Re-run layout</button></div>
        <label class="switch" style="margin-top:10px"><input type="checkbox" id="pg-iso"${this.hideIso ? " checked" : ""}> Hide papers with no links</label>
      </div>
      <div class="vp-sec">
        <dl class="vp-stats" id="pg-stats"></dl>
        <div class="vp-progress"><i id="pg-prog"></i></div>
        <p class="small muted" id="pg-msg" style="margin:6px 0 0"></p>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Node colour · major</span></div>
        <ul class="vp-legend compact" id="pg-legend"></ul>
        <div class="vp-size small muted" id="pg-size"></div>
        <p class="vp-hint small muted">An edge joins two shown papers when one is among the other's 10 nearest embedding neighbours. Hover a paper to trace its neighbourhood; click to open it.</p>
      </div>`;
    const $ = (s) => sec.querySelector(s);
    const nIn = $("#pg-n"), nV = $("#pg-n-v"), maj = $("#pg-maj"), fine = $("#pg-fine");
    nV.textContent = fmtInt(this.N);
    maj.value = this.maj;
    const fillFine = () => {
      const m = ctx.tax.majorById.get(maj.value);
      fine.innerHTML = `<option value="">${m ? "All fine categories" : "Pick a major first"}</option>` +
        (m ? m.fine.map((f) => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("") : "");
      fine.disabled = !m;
      fine.value = m && this.fine.startsWith(`${m.id}.`) ? this.fine : "";
    };
    fillFine();
    nIn.addEventListener("input", () => { this.N = +nIn.value; nV.textContent = fmtInt(this.N); this.rebuildSoon(); });
    maj.addEventListener("change", () => { this.maj = maj.value; this.fine = ""; fillFine(); this.rebuild(); });
    fine.addEventListener("change", () => { this.fine = fine.value; this.rebuild(); });
    $("[data-act=pg-clear]").addEventListener("click", () => { this.maj = ""; this.fine = ""; maj.value = ""; fillFine(); this.rebuild(); });
    $("#pg-freeze").addEventListener("click", () => this.toggleFreeze());
    $("#pg-rerun").addEventListener("click", () => this.rebuild({ fresh: true }));
    $("#pg-iso").addEventListener("change", (e) => { this.hideIso = e.target.checked; this.stage.request(); this.app.onState(); });
    $("#pg-legend").addEventListener("click", (e) => {
      const b = e.target.closest(".lg");
      if (!b) return;
      maj.value = this.maj === b.dataset.id ? "" : b.dataset.id;
      maj.dispatchEvent(new Event("change"));
    });
    this.el = { nIn, nV, maj, fine, stats: $("#pg-stats"), prog: $("#pg-prog"), msg: $("#pg-msg"), legend: $("#pg-legend"), size: $("#pg-size"), freeze: $("#pg-freeze") };
  }

  state() {
    return { n: this.N !== 2000 ? this.N : "", maj: this.fine ? "" : this.maj, fine: this.fine, iso: this.hideIso ? "0" : "" };
  }

  show() {
    this.stage.show();
    if (!this.nodes && !this.pendingQuery) this.rebuild();
    else if (this.nodes && !this.stage.cam.interacted) this.fitTo(false);
  }

  /** Seed the graph with search hits (null = back to the top-N ranking). */
  setQuery(result, expand) {
    this.query = result && result.items.length ? result : null;
    this.expand = !!expand;
    this.pendingQuery = false;
    this.el.nIn.disabled = !!this.query;
    this.el.nIn.closest(".vp-sec").classList.toggle("is-off", !!this.query);
    this.rebuild({ fresh: true });
  }

  hoverFromList(id) {
    const i = id && this.nodeIndex ? this.nodeIndex.get(id) ?? -1 : -1;
    this.listHover = i >= 0;
    this.setHover(i);
  }
  hide() { this.stage.hide(); hideTip(); }

  /* ---------- graph construction ---------- */
  selectNodes() {
    const out = [];
    const keep = (p) => (this.fine ? p.fine.includes(this.fine) : !this.maj || p.maj === this.maj) && Number.isFinite(p.x) && Number.isFinite(p.y);
    if (this.query) {
      for (const it of this.query.items) if (keep(it.p)) out.push(it.p);
      return out;
    }
    for (const p of this.ranked) {
      if (this.fine ? !p.fine.includes(this.fine) : this.maj && p.maj !== this.maj) continue;
      if (!Number.isFinite(p.x)) continue;
      out.push(p);
      if (out.length >= this.N) break;
    }
    return out;
  }

  /** Fetch the neighbour shards a set of papers needs (memoised by data.js; failures count as empty). */
  async loadShards(list, tok) {
    const need = [...new Set(list.map((p) => shardOf(p.n)))].filter((s) => !this.shardMap.has(s)).sort();
    let done = 0;
    if (need.length) this.setMsg(`Loading neighbour lists · 0 / ${need.length} shards`, 0);
    await Promise.all(need.map((s) => fetchJSON(`neighbors/${s}.json`, { optional: true }).catch(() => null).then((j) => {
      this.shardMap.set(s, j || {});
      done++;
      if (tok === this.token) this.setMsg(`Loading neighbour lists · ${done} / ${need.length} shards`, done / need.length);
    })));
  }

  async rebuild({ fresh = false } = {}) {
    const tok = ++this.token;
    let nodes = this.selectNodes();
    await this.loadShards(nodes, tok);
    if (tok !== this.token) return;
    const nHits = nodes.length;
    if (this.query && this.expand) {
      const have = new Set(nodes.map((p) => p.id)), extra = [], byId = this.app.ctx.data.byId;
      for (const p of nodes) {
        for (const id of this.shardMap.get(shardOf(p.n))?.[p.id] || []) {
          const q = byId.get(id);
          if (!q || have.has(id) || !Number.isFinite(q.x) || !Number.isFinite(q.y)) continue;
          have.add(id); extra.push(q);
        }
      }
      await this.loadShards(extra, tok);
      if (tok !== this.token) return;
      nodes = nodes.concat(extra);
    }
    const shardMap = this.shardMap;
    const shards = new Set(nodes.map((p) => shardOf(p.n))).size;
    const n = nodes.length, index = new Map(nodes.map((p, i) => [p.id, i]));
    const isHit = new Uint8Array(n);
    for (let i = 0; i < n; i++) isHit[i] = !this.query || i < nHits ? 1 : 0;
    const seen = new Map(), src = [], dst = [], w = [];
    let missing = 0;
    nodes.forEach((p, i) => {
      const nb = (shardMap.get(shardOf(p.n)) || {})[p.id];
      if (!nb) { missing++; return; }
      nb.forEach((id, rank) => {
        const j = index.get(id);
        if (j == null || j === i) return;
        const a = Math.min(i, j), b = Math.max(i, j), key = a * n + b;
        const e = seen.get(key);
        if (e != null) { w[e] = 1; return; } // mutual neighbours: full weight
        seen.set(key, src.length);
        src.push(a); dst.push(b); w.push(0.55 + 0.25 * (1 - rank / 10));
      });
    });
    const m = src.length;
    const deg = new Uint16Array(n);
    for (let e = 0; e < m; e++) { deg[src[e]]++; deg[dst[e]]++; }
    // CSR adjacency for hover
    const start = new Uint32Array(n + 1);
    for (let i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    const fillPos = start.slice(0, n), adj = new Uint32Array(2 * m);
    for (let e = 0; e < m; e++) { adj[fillPos[src[e]]++] = dst[e]; adj[fillPos[dst[e]]++] = src[e]; }
    // components (union-find)
    const parent = Int32Array.from({ length: n }, (_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    for (let e = 0; e < m; e++) { const a = find(src[e]), b = find(dst[e]); if (a !== b) parent[a] = b; }
    const compSize = new Map();
    for (let i = 0; i < n; i++) { const r = find(i); compSize.set(r, (compSize.get(r) || 0) + 1); }
    let largest = 0, comps = 0;
    for (const [, s] of compSize) { if (s > 1) comps++; if (s > largest) largest = s; }

    // warm start from UMAP (re-using the previous layout for papers that stay)
    const prev = new Map();
    if (!fresh && this.nodes) this.nodes.forEach((p, i) => prev.set(p.id, [this.X[i], this.Y[i]]));
    // scale the shown papers' own UMAP extent so a topic subgraph spreads like the full one
    let ux0 = Infinity, ux1 = -Infinity, uy0 = Infinity, uy1 = -Infinity;
    for (const p of nodes) { if (p.x < ux0) ux0 = p.x; if (p.x > ux1) ux1 = p.x; if (p.y < uy0) uy0 = p.y; if (p.y > uy1) uy1 = p.y; }
    if (!(ux0 <= ux1)) { ux0 = uy0 = -1; ux1 = uy1 = 1; }
    const ucx = (ux0 + ux1) / 2, ucy = (uy0 + uy1) / 2;
    const S = (Math.sqrt(Math.max(n, 30)) * 25) / Math.max(ux1 - ux0, uy1 - uy0, 0.05);
    const ax = new Float32Array(n), ay = new Float32Array(n), X = new Float32Array(n), Y = new Float32Array(n);
    nodes.forEach((p, i) => {
      ax[i] = (p.x - ucx) * S; ay[i] = (p.y - ucy) * S;
      const q = prev.get(p.id);
      X[i] = q ? q[0] : ax[i]; Y[i] = q ? q[1] : ay[i];
    });
    // node size by mean rating within the shown range
    let r0 = Infinity, r1 = -Infinity;
    for (const p of nodes) { if (p.r == null) continue; if (p.r < r0) r0 = p.r; if (p.r > r1) r1 = p.r; }
    if (!(r0 <= r1)) { r0 = r1 = 0; }
    const t = new Float32Array(n);
    nodes.forEach((p, i) => { t[i] = p.r == null ? 0 : r1 > r0 ? (p.r - r0) / (r1 - r0) : 0.5; });
    // colour groups
    const tax = this.app.ctx.tax;
    const groups = new Map();
    nodes.forEach((p, i) => { if (!groups.has(p.maj)) groups.set(p.maj, []); groups.get(p.maj).push(i); });
    const majCode = new Map([...groups.keys()].map((k, c) => [k, c]));
    const majOfNode = Uint8Array.from(nodes, (p) => majCode.get(p.maj));
    // edge buckets: one per major for within-major links, one for cross-major links (drawn once per frame each)
    const bucketLists = new Map([...groups.keys()].map((k) => [k, []]));
    const crossList = [];
    for (let e = 0; e < src.length; e++) {
      if (majOfNode[src[e]] === majOfNode[dst[e]]) bucketLists.get(nodes[src[e]].maj).push(e); else crossList.push(e);
    }
    const edgeBuckets = new Map([...bucketLists].map(([k, l]) => [k, Int32Array.from(l)]));
    const crossEdges = Int32Array.from(crossList);
    // cached label text + width (measured lazily at a fixed font)
    const labelText = nodes.map(() => null), labelW = new Float32Array(n);

    Object.assign(this, { nodes, n, src: Uint32Array.from(src), dst: Uint32Array.from(dst), w: Float32Array.from(w), m, deg, start, adj,
      X, Y, ax, ay, t, r0, r1, groups, majCode, majOfNode, edgeBuckets, crossEdges, labelText, labelW, comps, largest, missing, shards, nodeIndex: index, isHit, nHits });
    this.majRGB = new Map([...groups.keys()].map((k) => [k, hexToRgb(tax.major(k).color)]));
    this.posVersion++;
    this.hover = -1;
    this.sel = this.app.drawer.current ? (index.get(this.app.drawer.current.id) ?? -1) : -1;
    this.stage.cam.interacted = false;
    this.fitTo(false);
    this.renderLegend();
    this.frozen = false;
    this.el.freeze.textContent = "Freeze layout";
    this.el.freeze.classList.remove("on");
    this.t0 = performance.now();
    this.status = { phase: "layout", ticks: 0, alpha: 1 };
    const big = n > 3000;
    this.runner.start({
      n, x: X, y: Y, ax, ay, src: this.src, dst: this.dst, w: this.w,
      params: {
        linkDistance: 7, linkStrength: 1, chargeStrength: big ? -9 : -12, theta: 0.95, distanceMax: 140,
        anchorStrength: 0.02, velocityDecay: 0.42, alpha: prev.size ? 0.5 : 0.9, alphaMin: 0.005,
        alphaDecay: 1 - Math.pow(0.005, 1 / 240),
      },
    });
    this.updateStats();
    this.stage.request();
    this.app.onState();
    if (!this.firstDrawn) this.firstDrawn = performance.now();
  }

  onTick(xy, info) {
    if (!this.nodes || xy.length !== this.n * 2) return;
    for (let i = 0; i < this.n; i++) { this.X[i] = xy[2 * i]; this.Y[i] = xy[2 * i + 1]; }
    this.posVersion++;
    this.status = { phase: info.done ? "settled" : "layout", ticks: info.ticks, alpha: info.alpha, worker: info.worker };
    if (info.done && !this.settledAt) this.settledAt = performance.now() - this.t0;
    if (!this.stage.cam.interacted) this.fitTo(false);
    this.updateStats();
    this.stage.request();
    if (info.done && !this.frozen) window.__viz = Object.assign(window.__viz || {}, { graphSettleMs: Math.round(performance.now() - this.t0), graphTicks: info.ticks, graphWorker: info.worker });
  }

  bounds() {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < this.n; i++) {
      if (this.hideIso && !this.deg[i]) continue;
      const x = this.X[i], y = this.Y[i];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return x0 <= x1 ? [x0, y0, x1, y1] : [-1, -1, 1, 1];
  }
  fitTo(animate = true) {
    const pl = this.app.panelRight();
    this.stage.cam.fit(this.bounds(), 30, { animate, padLeft: pl ? pl - 10 : 0, padRight: this.app.resultsPad() });
  }

  toggleFreeze() {
    this.frozen = !this.frozen;
    if (this.frozen) this.runner.stop(); else this.runner.resume(0.25);
    this.el.freeze.textContent = this.frozen ? "Resume layout" : "Freeze layout";
    this.el.freeze.classList.toggle("on", this.frozen);
  }

  setMsg(text, frac) {
    this.el.msg.textContent = text;
    if (frac != null) this.el.prog.style.width = `${Math.round(frac * 100)}%`;
  }

  updateStats() {
    const iso = this.deg ? this.deg.reduce((s, d) => s + (d ? 0 : 1), 0) : 0;
    const st = this.status;
    const topic = this.query ? `<div><dt>Search hits</dt><dd>${fmtInt(this.nHits)}</dd></div><div><dt>+ neighbours</dt><dd>${fmtInt(this.n - this.nHits)}</dd></div>` : "";
    this.el.stats.innerHTML = `${topic}
      <div><dt>Papers</dt><dd>${fmtInt(this.n)}</dd></div><div><dt>Links</dt><dd>${fmtInt(this.m)}</dd></div>
      <div><dt>No links</dt><dd>${fmtInt(iso)}</dd></div><div><dt>Largest group</dt><dd>${fmtInt(this.largest)}</dd></div>`;
    const prog = st.phase === "settled" ? 1 : clamp(1 - Math.log(Math.max(st.alpha || 1, 0.005)) / Math.log(0.005), 0, 1);
    const mode = st.worker === false ? "main thread" : "Web Worker";
    const pace = this.frozen ? "Frozen" : st.phase === "settled" ? `Settled after ${fmtInt(st.ticks)} ticks` : `Laying out · tick ${fmtInt(st.ticks || 0)} · α ${fmt(st.alpha || 1, 3)}`;
    this.setMsg(`${pace} · ${mode} · ${this.shards} neighbour shards`, this.frozen ? null : prog);
  }

  renderLegend() {
    const tax = this.app.ctx.tax;
    const rows = [...this.groups.entries()].sort((a, b) => b[1].length - a[1].length);
    this.el.legend.innerHTML = rows.map(([id, list]) => {
      const m = tax.major(id);
      return `<li><button class="lg" data-id="${esc(id)}" aria-pressed="true" title="Restrict the graph to ${esc(m.name)}"><i class="sw" style="--c:${esc(m.color)}"></i><span class="nm">${esc(m.name)}</span><span class="n mono">${fmtInt(list.length)}</span></button></li>`;
    }).join("");
    const d = (tt) => (2.2 + 4.2 * tt) * 2;
    this.el.size.innerHTML = `Size: mean rating <span class="mono">${fmt(this.r0)}</span><i style="--d:${d(0)}px"></i><i style="--d:${d(0.5)}px"></i><i style="--d:${d(1)}px"></i><span class="mono">${fmt(this.r1)}</span>`;
  }

  /* ---------- interaction ---------- */
  radius(i, zoom) { return (2.2 + 4.2 * this.t[i]) * clamp(Math.pow(zoom, 0.45), 0.75, 3.2); }

  hit(x, y) {
    if (!this.nodes) return -1;
    if (this.qtVersion !== this.posVersion) { this.qt = new PointQuadtree(this.X, this.Y); this.qtVersion = this.posVersion; }
    const cam = this.stage.cam;
    return this.qt.nearest(cam.wx(x), cam.wy(y), (this.radius(0, cam.zoom) + 10) / cam.k, (j) => !(this.hideIso && !this.deg[j]));
  }
  pick(x, y, e) {
    const i = this.hit(x, y);
    this.stage.cv.style.cursor = i >= 0 ? "pointer" : "";
    this.listHover = false;
    this.setHover(i);
    this.app.onNodeHover?.(i >= 0 && this.isHit[i] && this.query ? this.nodes[i].id : null);
    if (i >= 0) {
      const p = this.nodes[i];
      showTip(`${paperTip(p, this.app.ctx.tax)}<div class="vt-ref">${this.deg[i]} link${this.deg[i] === 1 ? "" : "s"} in this graph</div>`, e.clientX, e.clientY);
    } else hideTip();
  }
  setHover(i) { if (i !== this.hover) { this.hover = i; this.stage.request(); } }
  select(id) {
    const i = this.nodeIndex ? this.nodeIndex.get(id) : undefined;
    this.sel = i ?? -1;
    this.stage.request();
  }

  /* ---------- drawing ---------- */
  draw(ctx, stage) {
    if (!this.nodes) return;
    const pal = this.app.pal();
    const cam = stage.cam, zoom = cam.zoom, n = this.n;
    const { X, Y, src, dst, deg } = this;
    const focus = this.hover >= 0 ? this.hover : this.sel;
    let inFocus = null;
    if (focus >= 0) {
      inFocus = new Uint8Array(n);
      inFocus[focus] = 1;
      for (let k = this.start[focus]; k < this.start[focus + 1]; k++) inFocus[this.adj[k]] = 1;
    }
    const sx = new Float32Array(n), sy = new Float32Array(n);
    for (let i = 0; i < n; i++) { sx[i] = cam.sx(X[i]); sy[i] = cam.sy(Y[i]); }
    const W = cam.w, Hh = cam.h, off = (i) => sx[i] < -20 || sx[i] > W + 20 || sy[i] < -20 || sy[i] > Hh + 20;

    // edges: within-major links take the major's colour (threads), cross-major links stay neutral ink (bridges)
    ctx.lineCap = "round";
    const lw = clamp(0.8 * Math.sqrt(zoom), 0.7, 2.2);
    const strokeSet = (list, style, width) => {
      ctx.beginPath();
      let any = false;
      for (let k = 0; k < list.length; k++) {
        const e = list[k], a = src[e], b = dst[e];
        if (off(a) && off(b)) continue;
        ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]);
        any = true;
      }
      if (!any) return;
      ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
    };
    const ea = inFocus ? 0.06 : 1;
    strokeSet(this.crossEdges, rgba(pal.inkRGB, (pal.dark ? 0.34 : 0.3) * ea), lw);
    for (const [maj, list] of this.edgeBuckets) strokeSet(list, rgba(this.majRGB.get(maj), 0.62 * ea), lw * 1.15);
    if (inFocus) {
      ctx.strokeStyle = pal.accent2; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = this.start[focus]; k < this.start[focus + 1]; k++) { const j = this.adj[k]; ctx.moveTo(sx[focus], sy[focus]); ctx.lineTo(sx[j], sy[j]); }
      ctx.stroke();
    }

    // nodes, batched per major colour. Passes: topic neighbours (faint) → out-of-focus → in-focus
    const halo = rgba(pal.bgRGB, 0.9), isHit = this.isHit;
    ctx.lineWidth = 1;
    const passes = [
      { want: (i) => !isHit[i] && (!inFocus || !inFocus[i]), alpha: inFocus ? 0.12 : 0.42, scale: 0.78 },
      { want: (i) => isHit[i] && inFocus && !inFocus[i], alpha: 0.22, scale: 1 },
      { want: (i) => isHit[i] ? !inFocus || inFocus[i] : inFocus && inFocus[i], alpha: 1, scale: 1 },
    ];
    for (const ps of passes) {
      for (const [maj, list] of this.groups) {
        ctx.beginPath();
        let any = false;
        for (const i of list) {
          if (!deg[i] || !ps.want(i) || off(i)) continue;
          const r = this.radius(i, zoom) * ps.scale;
          ctx.moveTo(sx[i] + r, sy[i]); ctx.arc(sx[i], sy[i], r, 0, TAU);
          any = true;
        }
        if (!any) continue;
        ctx.globalAlpha = ps.alpha;
        ctx.fillStyle = rgba(this.majRGB.get(maj), 0.95); ctx.fill();
        ctx.strokeStyle = halo; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // papers with no links among the shown set: hollow rings in their major colour, drawn under nothing important
    if (!this.hideIso) {
      ctx.lineWidth = clamp(0.9 * Math.sqrt(zoom), 0.9, 1.8);
      for (const [maj, list] of this.groups) {
        ctx.beginPath();
        let any = false;
        for (const i of list) {
          if (deg[i] || off(i)) continue;
          const r = this.radius(i, zoom) * 0.8;
          ctx.moveTo(sx[i] + r, sy[i]); ctx.arc(sx[i], sy[i], r, 0, TAU);
          any = true;
        }
        if (!any) continue;
        ctx.globalAlpha = inFocus ? 0.15 : 0.7;
        ctx.strokeStyle = rgba(this.majRGB.get(maj), 0.9); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // focus rings
    if (this.sel >= 0) this.ring(ctx, sx[this.sel], sy[this.sel], this.radius(this.sel, zoom) + 4, pal, 2);
    if (this.hover >= 0 && this.hover !== this.sel) {
      this.ring(ctx, sx[this.hover], sy[this.hover], this.radius(this.hover, zoom) + 3, pal, 1.5);
      if (this.listHover) { ctx.lineWidth = 2; ctx.strokeStyle = pal.accent2; ctx.beginPath(); ctx.arc(sx[this.hover], sy[this.hover], this.radius(this.hover, zoom) + 8, 0, TAU); ctx.stroke(); }
    }

    this.drawLabels(ctx, sx, sy, zoom, pal, inFocus, focus);
    this.drawn = (this.drawn || 0) + 1;
  }

  ring(ctx, x, y, r, pal, w) {
    ctx.lineWidth = w + 2.5; ctx.strokeStyle = rgba(pal.bgRGB, 0.9);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = pal.ink; ctx.stroke();
  }

  drawLabels(ctx, sx, sy, zoom, pal, inFocus, focus) {
    const L = this.labels;
    L.reset();
    L.add(-1e4, -1e4, this.app.panelRight(), 1e4);
    const halo = rgba(pal.bgRGB, 0.9);
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const minX = this.app.panelRight(), W = this.stage.cam.w - this.app.resultsPad(), H = this.stage.cam.h;
    const put = (i, font, color, max, cache) => {
      const x = sx[i] + this.radius(i, zoom) + 4, y = sy[i];
      if (x < minX || x > W - 20 || y < 8 || y > H - 8) return false; // bounds first: no measuring off-screen titles
      const p = this.nodes[i];
      ctx.font = font;
      let t, w;
      if (cache && this.labelText[i] != null) { t = this.labelText[i]; w = this.labelW[i]; }
      else {
        t = p.t.length > max ? `${p.t.slice(0, max - 1).trimEnd()}…` : p.t;
        w = ctx.measureText(t).width;
        if (cache) { this.labelText[i] = t; this.labelW[i] = w; }
      }
      if (!L.place(x - 2, y - 7, x + w + 2, y + 7)) return false;
      haloText(ctx, t, x, y, color, halo, 3);
      return true;
    };
    if (inFocus) {
      put(focus, `600 12px ${pal.fontUi}`, pal.ink, 64);
      for (let k = this.start[focus]; k < this.start[focus + 1]; k++) put(this.adj[k], `500 11px ${pal.fontUi}`, pal.ink2, 48);
      return;
    }
    // top-ranked (or, for a topic, most relevant) papers get names once there is room
    const budget = Math.round(clamp((zoom - 0.9) * 40 + (this.query ? 14 : 0), 0, 90));
    if (!budget) return;
    let placed = 0;
    for (let i = 0; i < this.n && placed < budget; i++) {
      if (this.hideIso && !this.deg[i]) continue;
      if (!this.isHit[i] && zoom < 2.5) continue;
      if (put(i, `500 11px ${pal.fontUi}`, pal.ink2, 44, true)) placed++;
    }
  }

  key(e) {
    if (e.key === "f") { this.toggleFreeze(); return true; }
    if (e.key === "0") { this.stage.cam.interacted = true; this.fitTo(true); return true; }
    return this.stage.cam.key(e);
  }
}
