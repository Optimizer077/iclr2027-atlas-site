// Explorer: keyword / semantic search + filters + category tree + virtualized ranked list + docked drawer.
import { $, esc, fmt, fmtInt, debounce, isTyping } from "../core/util.js";
import { icon } from "../core/icons.js";
import { loadPapers, loadTaxonomy, loadStats, forumUrl } from "../core/data.js";
import { initShell, setFooter, loadingOverlay, toast } from "../core/shell.js";
import { getScale, STATUS_LABEL } from "../core/scale.js";
import { SORTS, COLUMN_SORTS, configureFilters, defaults, parseHash, toHash, makeBaseMatcher, catMatch, ordered, terms } from "../core/filters.js";
import { toggleStar, onStoreChange, getList, getPref, setPref } from "../core/store.js";
import { searchAvailable, searchStatus, onSearchStatus, semanticSearch } from "../core/search.js";
import { VirtualList } from "../components/vlist.js";
import { PaperDrawer } from "../components/detail.js";
import { buildSidebar } from "../components/sidebar.js";
import { makeRowRenderer } from "../components/rows.js";
import { openListMenu, listMenuOpen } from "../components/listmenu.js";

const KEYS = [
  ["/", "Focus the search box"], ["m", "Switch keyword / semantic search"], ["j / ↓", "Next paper"], ["k / ↑", "Previous paper"],
  ["Enter", "Open selected paper"], ["s", "Star / unstar selected paper"], ["l", "Add selected paper to a list"],
  ["o", "Open selected on OpenReview"], ["Esc", "Close drawer / leave search"],
];
initShell({ page: "explorer", keys: KEYS });
const I_X = icon("close");
const SEM_K = 400;

async function main() {
  const ov = loadingOverlay("Loading submissions");
  let d, tax, stats;
  try { [d, tax, stats] = await Promise.all([loadPapers(ov.progress), loadTaxonomy(), loadStats()]); }
  catch (e) { ov.error(e.message || String(e)); return; }
  const { meta, papers, byId, maxSd } = d;
  const sc = getScale();
  configureFilters({ maxSd, rmin: sc.min, rmax: sc.max });
  const rankedCount = papers.reduce((n, p) => n + (p.rk != null ? 1 : 0), 0);
  setFooter({ generated: meta.generated, records: papers.length,
    extra: `<span><b>${fmtInt(meta.counts?.active)}</b> active · <b>${fmtInt(meta.counts?.withdrawn)}</b> withdrawn · <b>${fmtInt(meta.counts?.desk_rejected)}</b> desk-rejected</span><span class="sep"></span><span>rating scale <b>${sc.min}–${sc.max}</b></span>` });

  let f = parseHash(location.hash);
  let results = [];
  let sel = -1;
  let T = terms(f.q);
  let apiOk = false;          // semantic API reachable + ready
  let sem = null;             // {key, map: Map(id→hit), order: paper[], top, took}
  let semBusy = "";           // key of the request in flight
  let sortTouched = f.sort !== "r";

  const root = $("#explorer");
  const qEl = $("#q");
  qEl.placeholder = `Search ${fmtInt(papers.length)} submissions — an idea, a method, a title, #number`;
  const sortEl = $("#sort");
  sortEl.innerHTML = SORTS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("");
  $("#bulk-add").innerHTML = `${icon("list")} Add results to list ▾`;

  const effMode = () => (f.mode === "kw" || !apiOk ? "kw" : "sem");
  const semKey = () => `${f.q}\u0001${f.st}`;
  const semLive = () => effMode() === "sem" && !!f.q && sem && sem.key === semKey();

  /* ---------- list + drawer ---------- */
  const rowHTML = makeRowRenderer({ tax, rankedCount, terms: () => T, sem: () => (semLive() ? sem : null) });
  const list = new VirtualList($("#list"), {
    rowHeight: 64, render: rowHTML, overscan: 8,
    onClick: (i, e) => {
      const sb = e.target.closest("[data-star]");
      if (sb) { toggleStar(sb.dataset.star); return; }
      const lb = e.target.closest("[data-lists]");
      if (lb) { openListMenu(lb, [lb.dataset.lists]); return; }
      select(i);
      openPaper(results[i].id);
    },
  });
  const drawer = new PaperDrawer($("#drawer"), {
    byId, tax, stats, rankedCount,
    onOpen: (id) => { root.classList.add("with-drawer"); f.open = id; writeHash(); const i = results.findIndex((p) => p.id === id); if (i >= 0 && i !== sel) select(i); },
    onClose: () => { root.classList.remove("with-drawer"); f.open = ""; writeHash(); $("#list").focus({ preventScroll: true }); },
  });
  const openPaper = (id) => { drawer.stack = []; drawer.open(id); };

  const sidebar = buildSidebar($("#sidebar"), {
    papers, tax, maxSd,
    onChange: (patch, opt = {}) => {
      if (patch === null) { f = { ...defaults(), sort: f.sort === "rel" && !f.q ? "r" : f.sort, open: f.open, mode: f.mode }; qEl.value = ""; T = []; apply(); return; }
      Object.assign(f, patch);
      (opt.debounce ? applyDebounced : apply)();
    },
  });

  /* ---------- semantic search ---------- */
  function requestSem() {
    const key = semKey();
    if (semBusy === key) return;
    semBusy = key;
    renderHint("searching");
    const q = f.q;
    semanticSearch(q, { k: SEM_K, status: f.st }).then((res) => {
      if (semKey() !== key) return;
      const map = new Map();
      const order = [];
      for (const h of res.results || []) {
        const p = byId.get(h.id);
        if (!p) continue;
        map.set(h.id, h);
        order.push(p);
      }
      sem = { key, map, order, top: res.results?.[0]?.s || 1, took: res.took_ms };
      semBusy = "";
      if (!sortTouched) f.sort = "rel";
      apply();
    }).catch((e) => {
      semBusy = "";
      if (semKey() !== key) return;
      toast("Semantic search failed — showing keyword matches");
      console.warn("semantic search failed:", e.message);
      f.mode = "kw";
      apply();
    });
  }

  function renderMode() {
    const m = effMode();
    document.querySelectorAll("#mode button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.mode === m));
      if (b.dataset.mode === "sem") { b.disabled = !apiOk; b.title = apiOk ? "Semantic search (bge-base embeddings)" : "Semantic search is offline on this host"; }
    });
  }
  function renderHint(state) {
    const s = searchStatus();
    const el = $("#search-hint");
    let html;
    if (!apiOk) html = s.loading ? `<span class="dot wait"></span>semantic engine loading — keyword mode for now` : `<span class="dot off"></span>semantic search offline — keyword mode`;
    else if (effMode() === "kw") html = `<span class="dot kw"></span>keyword mode · matches title, keywords, TL;DR, categories`;
    else if (state === "searching" && f.q) html = `<span class="dot wait"></span>searching by meaning…`;
    else if (semLive()) html = `<span class="dot on"></span>semantic · ${fmtInt(sem.map.size)} nearest papers by meaning · ${sem.took ?? "—"} ms`;
    else html = `<span class="dot on"></span>semantic search ready · describe an idea, e.g. “KV cache compression for long context”`;
    el.innerHTML = html;
  }

  /* ---------- apply ---------- */
  function apply({ keepScroll = false } = {}) {
    if (!f.q && f.sort === "rel") f.sort = "r";
    const semMode = effMode() === "sem" && !!f.q;
    if (semMode && !semLive()) { requestSem(); renderMode(); return; }  // keep current rows until results arrive
    if (!semMode && f.sort === "rel") f.sort = "r";
    const base = makeBaseMatcher(f, { skipText: semMode });
    const src = semMode ? (f.sort === "rel" ? sem.order : ordered(papers, f.sort).filter((p) => sem.map.has(p.id))) : ordered(papers, f.sort);
    const majC = new Map(), fineC = new Map();
    const out = [];
    let total = 0, rSum = 0, rN = 0, meanAtLeast3 = 0, reviewCount = 0;
    for (const p of src) {
      if (!base(p)) continue;
      total++;
      majC.set(p.maj, (majC.get(p.maj) || 0) + 1);
      for (const x of p.fine) fineC.set(x, (fineC.get(x) || 0) + 1);
      if (!catMatch(f, p)) continue;
      out.push(p);
      if (p.r != null) { rSum += p.r; rN++; }
      if (p.r != null && p.r >= 3) meanAtLeast3++;
      reviewCount += p.nr || 0;
    }
    results = out;
    sel = f.open ? results.findIndex((p) => p.id === f.open) : -1;
    list.selected = sel;
    list.setItems(results, { keepScroll });
    if (sel >= 0) list.scrollToIndex(sel);
    sidebar.sync(f, majC, fineC, total);
    sortEl.value = f.sort;
    sortEl.querySelector('option[value="rel"]').disabled = !semMode;
    document.querySelectorAll(".colhead [data-col]").forEach((h) => {
      const [a, b] = COLUMN_SORTS[h.dataset.col];
      h.classList.toggle("on", f.sort === a || f.sort === b);
      h.dataset.dir = f.sort === a ? "1" : f.sort === b ? "2" : "";
    });
    $(".colhead [data-col=rank]").textContent = semMode ? "Rank · rel." : "Rank";
    let empty = $("#list-empty");
    if (!results.length) {
      if (!empty) { empty = document.createElement("div"); empty.id = "list-empty"; empty.className = "list-empty"; $("#list").append(empty); }
      empty.innerHTML = `<h3>No papers match</h3><p>${f.q && effMode() === "kw" ? `Keyword mode needs every word to appear. ${apiOk ? `<button class="btn sm" data-mode-switch>Search by meaning instead</button>` : ""}` : "Try removing a filter."}</p>`;
      empty.querySelector("[data-mode-switch]")?.addEventListener("click", () => setMode("sem"));
    } else empty?.remove();
    renderSummary(rN ? rSum / rN : null, meanAtLeast3, reviewCount, semMode);
    renderActiveFilters();
    renderMode();
    renderHint();
    writeHash();
  }
  const applyDebounced = debounce(apply, 90);

  function renderSummary(meanR, meanAtLeast3, reviewCount, semMode) {
    $("#summary-n").innerHTML = `<span class="big"><b>${fmtInt(results.length)}</b> ${results.length === 1 ? "paper" : "papers"}${semMode ? ` <span class="muted small" style="font-style:normal">by meaning</span>` : ""}</span>
      <span class="stat">mean of means <b>${fmt(meanR)}</b></span>
      <span class="stat"><b>${fmtInt(meanAtLeast3)}</b> papers with mean ≥ 3.0</span>
      <span class="stat"><b>${fmtInt(reviewCount)}</b> reviews</span>`;
  }

  function renderActiveFilters() {
    const d0 = defaults();
    const chips = [];
    const add = (label, patch, color) => chips.push({ label, patch, color });
    if (f.q) add(`${effMode() === "sem" ? "≈" : ""}“${f.q}”`, { q: "" });
    if (f.fine) add(tax.fine(f.fine).name, { fine: "" }, tax.major(f.maj).color);
    else if (f.maj) add(tax.major(f.maj).name, { maj: "" }, tax.major(f.maj).color);
    if (f.st !== d0.st) add(f.st === "all" ? "All statuses" : STATUS_LABEL[f.st], { st: d0.st });
    if (f.pa) add(f.pa, { pa: "" });
    if (f.rmin > d0.rmin || f.rmax < d0.rmax) add(`mean ${fmt(f.rmin)}–${fmt(f.rmax)}`, { rmin: d0.rmin, rmax: d0.rmax });
    if (f.sdmin > 0 || f.sdmax < d0.sdmax) add(`std ${fmt(f.sdmin, 1)}–${fmt(f.sdmax, 1)}`, { sdmin: 0, sdmax: d0.sdmax });
    if (f.nr) add(`≥${f.nr} reviews`, { nr: 0 });
    if (f.fs) add("has fact sheet", { fs: false });
    if (f.pdf) add("has PDF", { pdf: false });
    if (f.list) { const l = getList(f.list); add(`list: ${l ? l.name : "missing"}`, { list: "" }, l?.color); }
    const el = $("#active-filters");
    el.innerHTML = chips.map((c, i) => `<span class="fchip">${c.color ? `<i style="--c:${c.color}"></i>` : ""}${esc(c.label)}<button data-rm="${i}" aria-label="Remove filter">${I_X}</button></span>`).join("") +
      (chips.length > 1 ? `<button class="btn ghost sm" data-rm="all">Clear all</button>` : "");
    el.onclick = (e) => {
      const b = e.target.closest("[data-rm]");
      if (!b) return;
      if (b.dataset.rm === "all") { f = { ...defaults(), sort: f.sort === "rel" ? "r" : f.sort, open: f.open, mode: f.mode }; qEl.value = ""; T = []; }
      else { const c = chips[Number(b.dataset.rm)]; Object.assign(f, c.patch); if ("q" in c.patch) { qEl.value = ""; T = []; } }
      apply();
    };
  }

  let hashTimer = 0;
  function writeHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const h = toHash({ ...f, mode: f.q ? effMode() : "" });
      if (h !== location.hash && !(h === "" && location.hash === "")) history.replaceState(null, "", `${location.pathname}${location.search}${h || ""}`);
    }, 200);
  }

  function select(i, { open = false } = {}) {
    if (!results.length) return;
    sel = Math.max(0, Math.min(results.length - 1, i));
    list.setSelected(sel);
    if (open || drawer.isOpen) openPaper(results[sel].id);
  }
  const setMode = (m) => {
    if (m === "sem" && !apiOk) { toast("Semantic search is offline on this host"); return; }
    f.mode = m; setPref("search.mode", m);
    if (m === "kw" && f.sort === "rel") f.sort = "r";
    apply();
    qEl.focus();
  };

  /* ---------- events ---------- */
  const onSearch = debounce(() => {
    const q = qEl.value.trim();
    if (q === f.q) return;
    if (!q) sortTouched = f.sort !== "r" && f.sort !== "rel";
    f.q = q; T = terms(q);
    apply();
  }, 120);
  const onSearchSem = debounce(() => onSearch.flush(), 350);
  qEl.addEventListener("input", () => (effMode() === "sem" ? onSearchSem() : onSearch()));
  qEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (qEl.value) { qEl.value = ""; onSearch.flush(); } else qEl.blur(); e.preventDefault(); }
    if (e.key === "Enter" || e.key === "ArrowDown") {
      onSearch.flush(); qEl.blur(); $("#list").focus({ preventScroll: true });
      if (results.length && !(effMode() === "sem" && !semLive())) select(0, { open: e.key === "Enter" });
      e.preventDefault();
    }
  });
  $("#mode").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b && !b.disabled) setMode(b.dataset.mode); });
  sortEl.addEventListener("change", () => { f.sort = sortEl.value; sortTouched = f.sort !== "rel"; apply(); });
  document.querySelector(".colhead").addEventListener("click", (e) => {
    const h = e.target.closest("[data-col]");
    if (!h) return;
    const [a, b] = COLUMN_SORTS[h.dataset.col];
    f.sort = f.sort === a ? b : a;
    sortTouched = true;
    apply();
  });
  $("#bulk-add").addEventListener("click", (e) => {
    if (results.length > 3000 && !confirm(`Add all ${fmtInt(results.length)} papers to a list?`)) return;
    openListMenu(e.currentTarget, results.map((p) => p.id));
  });
  $("#side-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  onStoreChange((w) => { if (w === "lists") { if (f.list) apply({ keepScroll: true }); else list.refresh(); } });
  window.addEventListener("hashchange", () => {
    const nf = parseHash(location.hash);
    if (toHash(nf) === toHash({ ...f, mode: f.q ? effMode() : "" })) return;
    f = nf; qEl.value = f.q; T = terms(f.q);
    apply();
    if (f.open && drawer.current?.id !== f.open) openPaper(f.open);
  });
  window.addEventListener("atlas:theme", () => list.refresh());

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".modal-back") || listMenuOpen()) return;
    if (e.key === "/" && !isTyping(e)) { qEl.focus(); qEl.select(); e.preventDefault(); return; }
    if (isTyping(e)) return;
    const k = e.key;
    const cur = () => (drawer.isOpen ? drawer.current : results[sel]);
    if (k === "j" || k === "ArrowDown") { select(sel + 1); e.preventDefault(); }
    else if (k === "k" || k === "ArrowUp") { select(sel - 1); e.preventDefault(); }
    else if (k === "Enter" && sel >= 0) { openPaper(results[sel].id); e.preventDefault(); }
    else if (k === "s") { const p = cur(); if (p) toast(toggleStar(p.id) ? "Starred — see Lists" : "Removed from Starred"); }
    else if (k === "l") {
      const p = cur();
      if (!p) return;
      e.preventDefault();
      const anchor = drawer.isOpen ? $('#drawer [data-act="lists"]') : document.querySelector(".row.sel [data-lists]") || $("#q");
      openListMenu(anchor, [p.id]);
    } else if (k === "m") setMode(effMode() === "sem" ? "kw" : "sem");
    else if (k === "o") { const p = cur(); if (p) window.open(forumUrl(p.id), "_blank", "noopener"); }
    else if (k === "Escape" && drawer.isOpen) { drawer.close(); e.preventDefault(); }
  });

  // semantic availability: auto mode prefers semantic; a remembered explicit choice wins
  if (!f.mode && f.q === "") f.mode = getPref("search.mode", "");
  onSearchStatus((s) => { const was = apiOk; apiOk = s.available; if (was !== apiOk) apply({ keepScroll: true }); else { renderMode(); renderHint(); } });
  apiOk = await searchAvailable();

  qEl.value = f.q;
  apply();
  if (f.open && byId.has(f.open)) openPaper(f.open);
  ov.done();
  if (!f.open) qEl.focus({ preventScroll: true });
}

main();
