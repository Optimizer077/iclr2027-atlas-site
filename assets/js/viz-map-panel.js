// Map side panel: plate title, search with result list, colour mode, filters, rating key, major legend.
import { esc, fmt, fmtInt, debounce } from "./core/util.js";
import { icon } from "./core/icons.js";
import { getScale } from "./core/scale.js";
import { pageHref } from "./core/data.js";
import { rgba } from "./viz-common.js";

const STATUS = [["active", "Active"], ["withdrawn", "Withdrawn"], ["desk_rejected", "Desk-rej."], ["all", "All"]];

export function buildPanel({ el, ctx, M, S, majors, majIndex, RB, onChange, onFit, onZoom, onCollapse }) {
  const sc = getScale();
  const step = sc.max - sc.min <= 5 ? 0.01 : 0.05;
  el.innerHTML = `
    <header class="vp-head">
      <div class="vp-title">
        <div class="eyebrow">Plate I · Embedding atlas</div>
        <h1>The Submission Atlas</h1>
      </div>
      <button class="icon-btn vp-toggle" data-act="collapse" title="Hide panel" aria-expanded="true">${icon("layers")}</button>
    </header>
    <div class="vp-body">
      <p class="vp-lede">Each dot is one ICLR&nbsp;2027 submission, placed by its title-and-abstract embedding. Papers that sit together are about the same thing.</p>
      <div class="vp-search">
        ${icon("search")}
        <input id="vq" type="search" autocomplete="off" spellcheck="false" placeholder="Describe a topic, e.g. KV cache compression for long context" aria-label="Search papers" value="${esc(S.q)}">
        <span class="kbd">/</span>
      </div>
      <div class="vp-smode">
        <div class="seg" data-g="mode" role="group" aria-label="Search mode"><button data-v="sem" title="Meaning-based search over title + abstract embeddings">Semantic</button><button data-v="kw" title="Exact words in title, keywords, TL;DR, #number">Keyword</button></div>
        <label class="vp-k" title="How many semantic hits to show"><span>top</span><input id="vk" type="range" min="50" max="500" step="10" value="${S.k}" aria-label="Number of semantic hits"><b class="mono" id="vk-v">${S.k}</b></label>
      </div>
      <div class="vp-qinfo small muted" id="vqinfo"></div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Colour by</span></div>
        <div class="seg" data-g="color"><button data-v="maj">Major category</button><button data-v="rating">Mean rating</button></div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Status</span></div>
        <div class="seg" data-g="st">${STATUS.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join("")}</div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Minimum mean rating</span><b class="mono" id="rmin-v"></b></div>
        <div class="range rating"><div class="track"></div>
          <input id="rmin" type="range" min="${sc.min}" max="${sc.max}" step="${step}" value="${S.rmin}" aria-label="Minimum mean rating"></div>
      </div>
      <div class="vp-sec vp-key">
        <div class="vp-h"><span class="eyebrow" id="key-h">Mean rating of plotted papers</span></div>
        <canvas class="vp-hist" id="vhist" width="270" height="56" aria-label="Histogram of mean ratings"></canvas>
        <div class="vp-axis mono">${sc.values.map((v) => `<span>${v}</span>`).join("")}</div>
        <div class="vp-size small muted">Dot size grows with mean rating
          ${[3, 4.4, 6.2, 7.6].map((d) => `<i style="--d:${d}px"></i>`).join("")}</div>
      </div>
      <div class="vp-sec">
        <div class="vp-h"><span class="eyebrow">Major categories</span>
          <span class="vp-links"><button class="vp-link" data-act="all">all</button><button class="vp-link" data-act="none">none</button></span></div>
        <ul class="vp-legend" id="vlegend">${majors.map((m) => `
          <li><button class="lg" data-id="${esc(m.id)}" title="Click to hide · Shift-click to show only this">
            <i class="sw" style="--c:${esc(m.color)}"></i><span class="nm">${esc(m.name)}</span><span class="n mono"></span></button></li>`).join("")}</ul>
        <p class="vp-hint small muted">Click hides a category · Shift-click isolates it</p>
      </div>
      <a class="vp-out" href="${pageHref("graph.html")}">${icon("open")} Open the neighbourhood graph</a>
    </div>`;

  const $ = (s) => el.querySelector(s);
  const q = $("#vq"), qinfo = $("#vqinfo"), kIn = $("#vk"), kV = $("#vk-v"), rmin = $("#rmin"), rminV = $("#rmin-v"), hist = $("#vhist");

  /* segmented groups */
  el.querySelectorAll('.seg[data-g="color"], .seg[data-g="st"]').forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b) return;
    if (g.dataset.g === "color") { S.color = b.dataset.v; onChange("color"); }
    else { S.st = b.dataset.v; onChange("filters"); }
  }));
  rmin.addEventListener("input", () => { S.rmin = parseFloat(rmin.value); rminV.textContent = fmt(S.rmin); refilter(); });
  const refilter = debounce(() => onChange("filters"), 60);

  $("#vlegend").addEventListener("click", (e) => {
    const b = e.target.closest(".lg");
    if (!b) return;
    const id = b.dataset.id;
    if (e.shiftKey || e.altKey) {
      const solo = S.off.size === majors.length - 1 && !S.off.has(id);
      S.off = new Set(solo ? [] : majors.map((m) => m.id).filter((x) => x !== id));
    } else if (S.off.has(id)) S.off.delete(id); else S.off.add(id);
    onChange("filters");
  });
  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "all") { S.off.clear(); onChange("filters"); }
    else if (act === "none") { S.off = new Set(majors.map((m) => m.id)); onChange("filters"); }
    else if (act === "collapse") {
      const c = el.classList.toggle("collapsed");
      a.setAttribute("aria-expanded", String(!c));
      a.title = c ? "Show panel" : "Hide panel";
      onCollapse();
    }
  });

  /* search: text → S.q (debounced; semantic waits a little longer), mode, top-k */
  const runSearch = debounce(() => {
    if (q.value.trim() === S.q) return;
    S.q = q.value.trim(); onChange("search");
  }, 380);
  q.addEventListener("input", () => { if (!q.value.trim() && S.q) runSearch.flush(); else runSearch(); });
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (q.value.trim() !== S.q) runSearch.flush(); else onChange("open-best");
      e.preventDefault();
    } else if (e.key === "Escape") {
      if (q.value) api.clearSearch(); else q.blur();
      e.preventDefault(); e.stopPropagation();
    }
  });
  el.querySelector('.seg[data-g="mode"]').addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b || b.disabled || b.dataset.v === S.mode) return;
    S.mode = b.dataset.v; onChange("mode");
  });
  const kChanged = debounce(() => onChange("k"), 250);
  kIn.addEventListener("input", () => { S.k = +kIn.value; kV.textContent = S.k; kChanged(); });
  let semOK = null; // null = unknown; true / false after the health probe

  /* rating histogram key */
  function drawHist() {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const W = hist.clientWidth || 270, Hh = hist.clientHeight || 56;
    hist.width = Math.round(W * dpr); hist.height = Math.round(Hh * dpr);
    const g = hist.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, Hh);
    const bins = M.counts.byBin, max = Math.max(1, ...bins);
    const bw = W / RB, base = Hh - 6;
    const xOf = (v) => ((v - sc.min) / (sc.max - sc.min)) * W;
    const cs = getComputedStyle(document.documentElement);
    for (let b = 0; b < RB; b++) {
      const h = bins[b] ? Math.max(1.5, Math.sqrt(bins[b] / max) * (base - 6)) : 0;
      const v0 = sc.min + (b / RB) * (sc.max - sc.min);
      g.fillStyle = rgba(M.rampRGB[b], v0 + 1e-9 < S.rmin - (sc.max - sc.min) / RB ? 0.25 : 1);
      g.fillRect(b * bw + 0.5, base - h, bw - 1, h);
    }
    g.fillStyle = cs.getPropertyValue("--rule-2"); g.fillRect(0, base, W, 1);
    if (S.rmin > sc.min) {
      const x = xOf(S.rmin);
      g.fillStyle = cs.getPropertyValue("--ink"); g.fillRect(Math.round(x) - 1, 4, 2, base - 4);
    }
  }

  const api = {
    update() {
      el.querySelectorAll('.seg[data-g="color"] button').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === S.color)));
      const bySt = M.counts.bySt, total = M.n;
      el.querySelectorAll('.seg[data-g="st"] button').forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.v === S.st));
        const v = b.dataset.v, c = v === "all" ? total : bySt[v] || 0;
        b.title = `${fmtInt(c)} papers`;
      });
      rmin.value = String(S.rmin);
      rminV.textContent = S.rmin > sc.min ? `≥ ${fmt(S.rmin)}` : "any";
      el.querySelectorAll(".lg").forEach((b) => {
        const id = b.dataset.id, on = !S.off.has(id);
        b.setAttribute("aria-pressed", String(on));
        b.querySelector(".n").textContent = fmtInt(M.counts.byMaj[majIndex.get(id)] || 0);
      });
      $("#key-h").textContent = S.color === "rating" ? "Colour key · mean rating" : "Mean rating of plotted papers";
      el.classList.toggle("mode-rating", S.color === "rating");
      el.querySelectorAll('.seg[data-g="mode"] button').forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.v === S.mode));
        if (b.dataset.v === "sem") {
          b.disabled = semOK === false;
          b.title = semOK === false ? "Semantic search needs the local search API (not available on static hosting)" : "Meaning-based search over title + abstract embeddings";
        }
      });
      el.querySelector(".vp-k").hidden = S.mode !== "sem";
      const apiNote = semOK === false ? "Semantic API offline · keyword search only" : semOK === null && S.mode === "sem" ? "Connecting to semantic search…" : "";
      qinfo.textContent = M.nMatch >= 0
        ? `${fmtInt(M.nMatch)} highlighted on the plate${M.searchMode === "sem" ? " · ranked by meaning" : ""} · Enter opens the best`
        : apiNote;
      drawHist();
    },
    focusSearch() { el.classList.remove("collapsed"); q.focus(); q.select(); },
    clearSearch() { q.value = ""; S.q = ""; onChange("search"); },
    setSemantic(ok) { semOK = ok; api.update(); },
    busy(on) { el.querySelector(".vp-search").classList.toggle("busy", !!on); },
    toggleColor() { S.color = S.color === "rating" ? "maj" : "rating"; onChange("color"); },
    toggleLabels() { S.labels = !S.labels; onChange("labels"); syncLab(); },
  };

  /* plate controls (zoom, fit, lettering) live outside the panel */
  const ctl = document.getElementById("ctl");
  ctl.innerHTML = `
    <button class="icon-btn" data-z="in" title="Zoom in (+)">${icon("plus")}</button>
    <button class="icon-btn" data-z="out" title="Zoom out (−)">${icon("minus")}</button>
    <button class="icon-btn" data-z="fit" title="Fit plate (0)">${icon("target")}</button>
    <span class="vctl-sep"></span>
    <button class="icon-btn" data-z="lab" title="Lettering on / off (l)">${icon("layers")}</button>`;
  ctl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-z]");
    if (!b) return;
    const z = b.dataset.z;
    if (z === "in") onZoom(1.5); else if (z === "out") onZoom(1 / 1.5); else if (z === "fit") onFit();
    else if (z === "lab") api.toggleLabels();
  });
  function syncLab() {
    const b = ctl.querySelector('[data-z="lab"]');
    b.classList.toggle("on", S.labels);
    b.setAttribute("aria-pressed", String(S.labels));
  }
  syncLab();
  if (innerWidth < 760) el.classList.add("collapsed");
  return api;
}
