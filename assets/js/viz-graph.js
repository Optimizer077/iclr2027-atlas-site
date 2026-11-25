// graph.html — "connected" views: (a) force-directed kNN graph of top-ranked papers,
// (b) fine-category co-occurrence graph. Tabs switch between them; state lives in the hash.
import { T0, boot, footer, readPalette, makeDrawer, readHash, writeHash, markReady, esc, fmtInt } from "./viz-common.js";
import { PaperGraph } from "./viz-papergraph.js";
import { CategoryGraph } from "./viz-catgraph.js";
import { icon } from "./core/icons.js";
import { pageHref } from "./core/data.js";
import { isTyping, debounce } from "./core/util.js";
import { runQuery, searchAvailable } from "./viz-semantic.js";
import { ResultsPanel } from "./viz-results.js";

const KEYS = [["/", "Seed the graph with a topic"], ["1", "Paper graph"], ["2", "Category graph"], ["f", "Freeze / resume layout (paper graph)"], ["0", "Fit to view"],
  ["+ / −", "Zoom in / out"], ["← ↑ → ↓", "Pan"], ["Esc", "Close paper"]];
const ctx = await boot({ page: "graph", label: "Drawing the graph", keys: KEYS });
const H = readHash();
let view = H.get("view") === "cats" ? "cats" : "papers";
let pal = readPalette();

const VIEWS = {
  papers: {
    eyebrow: "Plate II · Neighbourhood graph", title: "Who sits next to whom",
    lede: "The strongest submissions, each tied to the papers it most resembles. Clusters are research threads; bridges are papers that speak to two of them.",
    cart: "Paper neighbourhood graph",
  },
  cats: {
    eyebrow: "Plate III · Category graph", title: "How the topics interlock",
    lede: "Fine categories joined by the papers that carry both tags. Thick links are well-trodden intersections; thin ones are where new combinations are being tried.",
    cart: "Fine-category co-occurrence",
  },
};

const plate = document.getElementById("plate"), panel = document.getElementById("panel");
panel.innerHTML = `
  <header class="vp-head">
    <div class="vp-title"><div class="eyebrow" id="g-eyebrow"></div><h1 id="g-title"></h1></div>
    <button class="icon-btn vp-toggle" data-act="collapse" title="Hide panel" aria-expanded="true">${icon("layers")}</button>
  </header>
  <div class="vp-body">
    <div class="seg vtabs" role="tablist" aria-label="Graph view">
      <button data-view="papers" role="tab">Paper graph</button><button data-view="cats" role="tab">Category graph</button></div>
    <p class="vp-lede" id="g-lede" style="margin-top:12px"></p>
    <div class="vp-topic">
      <div class="vp-h"><span class="eyebrow">Seed with a topic</span><span class="small muted" id="g-api"></span></div>
      <div class="vp-search">${icon("search")}
        <input id="gq" type="search" autocomplete="off" spellcheck="false" placeholder="e.g. KV cache compression for long context" aria-label="Topic to seed the graph" value="${esc(H.get("q") || "")}">
        <span class="kbd">/</span></div>
      <div class="vp-smode"><label class="vp-k" title="How many search hits seed the graph"><span>top</span>
        <input id="gk" type="range" min="50" max="500" step="10" value="${esc(H.get("k") || "150")}" aria-label="Number of hits"><b class="mono" id="gk-v"></b></label></div>
      <label class="switch" style="margin-top:8px"><input type="checkbox" id="gnb"${H.get("nb") === "1" ? " checked" : ""}> Add each hit's 10 nearest neighbours</label>
      <div class="vp-qinfo small muted" id="gqinfo"></div>
    </div>
    <section id="sec-papers"></section>
    <section id="sec-cats" hidden></section>
    <a class="vp-out" href="${pageHref("map.html")}">${icon("map")} Open the atlas map</a>
  </div>`;
const $ = (s) => document.querySelector(s);
if (innerWidth < 760) panel.classList.add("collapsed");

/** Width taken by the results list on the right (0 when hidden or on narrow screens). */
function resultsPad() {
  const el = document.getElementById("results");
  if (!el || el.hidden) return 0;
  const r = plate.getBoundingClientRect(), e = el.getBoundingClientRect();
  return r.width < 900 ? 0 : Math.max(0, r.right - e.left + 8);
}
function panelRight() {
  const r = plate.getBoundingClientRect(), pr = panel.getBoundingClientRect();
  return panel.classList.contains("collapsed") || r.width < 760 ? 0 : pr.right - r.left + 6;
}

const saveState = debounce(() => {
  const cur = views[view];
  writeHash({ view: view === "cats" ? "cats" : "", q: T.q, k: T.k !== 150 ? T.k : "", nb: T.nb ? "1" : "", ...(cur ? cur.state() : {}), open: drawer.current?.id || "" });
}, 200);

const drawer = makeDrawer(ctx, {
  onOpen: (id) => { views.papers?.select(id); saveState(); },
  onClose: () => { views.papers?.select(null); saveState(); },
});
const app = (sec) => ({ ctx, plate, sec, drawer, pal: () => pal, H, onState: saveState, panelRight, resultsPad, onNodeHover: (id) => results.mark(id) });
const views = {};
views.papers = new PaperGraph(app($("#sec-papers")));
views.cats = new CategoryGraph(app($("#sec-cats")));

const cartT = $("#cart-t"), cartS = $("#cart-stats"), cartE = $("#cart-e");
function setView(v) {
  view = v;
  const meta = VIEWS[v];
  $("#g-eyebrow").textContent = meta.eyebrow;
  $("#g-title").textContent = meta.title;
  $("#g-lede").textContent = T.result && v === "papers" ? `The ${fmtInt(Math.min(T.k, T.result.items.length))} papers closest in meaning to “${T.q}”, tied to the papers each one most resembles. Dense knots are the topic's core threads.` : meta.lede;
  cartE.textContent = `ICLR 2027 · ${meta.eyebrow.split(" · ")[0]}`;
  cartT.textContent = meta.cart;
  document.querySelectorAll(".vtabs button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.view === v)); b.setAttribute("aria-selected", String(b.dataset.view === v)); });
  $("#sec-papers").hidden = v !== "papers";
  $("#sec-cats").hidden = v !== "cats";
  for (const [k, vw] of Object.entries(views)) if (k === v) vw.show(); else vw.hide();
  saveState();
}
document.querySelector(".vtabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-view]");
  if (b && b.dataset.view !== view) setView(b.dataset.view);
});
panel.addEventListener("click", (e) => {
  const tg = e.target.closest('[data-act="collapse"]');
  if (tg) {
    const c = panel.classList.toggle("collapsed");
    tg.setAttribute("aria-expanded", String(!c));
    tg.title = c ? "Show panel" : "Hide panel";
    requestAnimationFrame(() => views[view].stage.request());
  }
});

/* ---------- topic seeding (semantic search → paper subgraph + category highlight) ---------- */
const T = { q: (H.get("q") || "").trim(), k: Math.max(50, Math.min(500, parseInt(H.get("k") || "150", 10) || 150)), nb: H.get("nb") === "1", result: null, sem: null };
const gq = $("#gq"), gk = $("#gk"), gkV = $("#gk-v"), gnb = $("#gnb"), gqinfo = $("#gqinfo"), gapi = $("#g-api");
gk.value = String(T.k); gkV.textContent = T.k;
const results = new ResultsPanel($("#results"), {
  tax: ctx.tax,
  onHover: (id) => { views.papers.hoverFromList(id); views.cats.paperFocus(id); },
  onOpen: (id) => drawer.open(id),
  onClear: () => { gq.value = ""; setTopic(""); },
  onFit: () => views[view].key({ key: "0" }),
});
let tTok = 0;
async function runTopic() {
  const tok = ++tTok;
  if (!T.q) {
    T.result = null; results.set({ q: "" }); gqinfo.textContent = "";
    views.papers.setQuery(null, false); views.cats.setHits(null); setView(view); saveState();
    return;
  }
  gq.parentElement.classList.add("busy");
  const r = await runQuery(T.q, { k: T.k, status: "active", mode: T.sem === false ? "kw" : "sem", data: ctx.data });
  if (tok !== tTok) return;
  gq.parentElement.classList.remove("busy");
  T.result = r;
  const items = r.items.slice(0, T.k);
  results.set({ q: T.q, mode: r.mode, items, total: r.mode === "kw" ? r.total : undefined, took: r.took, note: r.note, shown: items.length, label: "seed the graph" });
  gqinfo.textContent = `${r.mode === "sem" ? "Semantic" : "Keyword"} · ${fmtInt(items.length)} hits seed the paper graph and light up their categories`;
  views.papers.setQuery({ ...r, items }, T.nb);
  views.cats.setHits({ ...r, items });
  setView(view);
  saveState();
  markReady({ searchMode: r.mode, searchHits: items.length, searchMs: r.took });
}
function setTopic(q) { T.q = q.trim(); runTopic(); }
const typed = debounce(() => { if (gq.value.trim() !== T.q) setTopic(gq.value); }, 380);
gq.addEventListener("input", () => { if (!gq.value.trim() && T.q) typed.flush(); else typed(); });
gq.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { if (gq.value.trim() !== T.q) typed.flush(); else if (results.items[0]) drawer.open(results.items[0].p.id); e.preventDefault(); }
  else if (e.key === "Escape") { if (gq.value) { gq.value = ""; setTopic(""); } else gq.blur(); e.preventDefault(); e.stopPropagation(); }
});
const kTyped = debounce(() => runTopic(), 300);
gk.addEventListener("input", () => { T.k = +gk.value; gkV.textContent = T.k; if (T.q) kTyped(); else saveState(); });
gnb.addEventListener("change", () => { T.nb = gnb.checked; if (T.result) views.papers.setQuery(T.result, T.nb); saveState(); });
searchAvailable().then((ok) => {
  T.sem = ok;
  gapi.textContent = ok ? "semantic" : "keyword only (API offline)";
  gapi.title = ok ? "Meaning-based search over title + abstract embeddings" : "The semantic search API is not reachable (static hosting); topic seeding uses keyword matches.";
  markReady({ semanticApi: ok });
});

/* plate controls */
const ctl = $("#ctl");
ctl.innerHTML = `
  <button class="icon-btn" data-z="in" title="Zoom in (+)">${icon("plus")}</button>
  <button class="icon-btn" data-z="out" title="Zoom out (−)">${icon("minus")}</button>
  <button class="icon-btn" data-z="fit" title="Fit (0)">${icon("target")}</button>`;
ctl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-z]");
  if (!b) return;
  const vw = views[view], cam = vw.stage.cam;
  cam.interacted = true;
  if (b.dataset.z === "in") cam.flyTo(cam.cx, cam.cy, cam.k * 1.5, 220);
  else if (b.dataset.z === "out") cam.flyTo(cam.cx, cam.cy, cam.k / 1.5, 220);
  else vw.key({ key: "0" });
});

/* cartouche stats */
setInterval(() => {
  const vw = views[view];
  if (view === "papers" && vw.nodes) cartS.innerHTML = `<b>${fmtInt(vw.n)}</b> papers · <b>${fmtInt(vw.m)}</b> links · ${esc(vw.frozen ? "frozen" : vw.status.phase === "settled" ? "settled" : "moving")}`;
  else if (view === "cats" && vw.nodes) cartS.innerHTML = `<b>${fmtInt(vw.nodes.length)}</b> categories · <b>${fmtInt(vw.edges.length)}</b> links ≥ ${fmtInt(vw.minCo)}`;
}, 400);

/* theme + keys */
window.addEventListener("atlas:theme", () => { pal = readPalette(); views[view].stage.request(); });
document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e) || document.querySelector(".modal-back, .lmenu")) return;
  if (e.target.closest?.(".drawer, .vpanel, .vresults")) return; // let the drawer / panels scroll
  if (e.key === "/") { panel.classList.remove("collapsed"); gq.focus(); gq.select(); e.preventDefault(); return; }
  if (e.key === "1") { setView("papers"); e.preventDefault(); return; }
  if (e.key === "2") { setView("cats"); e.preventDefault(); return; }
  if (views[view].key(e)) e.preventDefault();
});

/* go */
footer(ctx, `<span>${view === "cats" ? "Fine-tag co-occurrence" : "Embedding kNN graph"} · self-written force layout</span>`);
if (T.q) { views.papers.pendingQuery = true; runTopic(); }
setView(view);
ctx.overlay.done();
const open = H.get("open");
if (open && ctx.data.byId.has(open)) drawer.open(open);

// first-render timing for smoke tests: first frame that actually has nodes
(function waitFirst() {
  const vw = views[view];
  if (vw.nodes && vw.drawn > 0) {
    markReady({ page: "graph", view, firstRenderMs: Math.round(performance.now() - T0),
      nodes: view === "cats" ? vw.nodes.length : vw.n, edges: view === "cats" ? vw.edges.length : vw.m,
      layoutMs: view === "cats" ? Math.round(vw.layoutMs) : undefined, drawMs: Math.round(vw.stage.drawMs * 10) / 10,
      worker: view === "papers" ? vw.runner.mode : undefined });
    return;
  }
  requestAnimationFrame(waitFirst);
})();
