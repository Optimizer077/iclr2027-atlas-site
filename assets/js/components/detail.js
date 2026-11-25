// Paper detail drawer: header, links, score panel, fact sheet, abstract, reviews, neighbours.
// Shards (abstracts / factsheets / reviews / neighbors) are fetched lazily per paper.
import { esc, fmt, fmtInt } from "../core/util.js";
import { icon } from "../core/icons.js";
import { forumUrl, orPdfUrl, localPdfUrl, loadShardEntry, pageHref } from "../core/data.js";
import { chipsHTML, chipHTML, statusHTML, ratingColor, getScale, STATUS_LABEL } from "../core/scale.js";
import { isStarred, toggleStar, onStoreChange, getNote, listsOf } from "../core/store.js";
import { renderMarkdown } from "../core/md.js";
import { searchAvailable, similarPapers } from "../core/search.js";
import { openListMenu } from "./listmenu.js";

const FS_FIELDS = [
  ["problem", "Problem"], ["method", "Method"], ["key_idea", "Key idea"], ["evidence", "Evidence"],
  ["claimed_gains", "Claimed gains"], ["reviewer_consensus", "Reviewer consensus"], ["main_concern", "Main concern"],
];

/** SVG rule min..max with individual ratings and mean marker. */
export function ratingRule(p) {
  const W = 440, H = 76, L = 14, R = 14, Y = 50;
  const sc = getScale();
  const x = (v) => L + ((v - sc.min) / (sc.max - sc.min)) * (W - L - R);
  let s = `<svg class="rule" viewBox="0 0 ${W} ${H}" role="img" aria-label="Individual ratings on a ${sc.min} to ${sc.max} scale">`;
  s += `<defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="var(--r1)"/><stop offset=".3" stop-color="var(--r3)"/><stop offset=".45" stop-color="var(--r5)"/><stop offset=".58" stop-color="var(--r6)"/><stop offset=".78" stop-color="var(--r8)"/><stop offset="1" stop-color="var(--r10)"/></linearGradient></defs>`;
  s += `<rect x="${L}" y="${Y - 1.5}" width="${W - L - R}" height="3" rx="1.5" fill="url(#rg)" opacity=".55"/>`;
  const ticks = sc.max - sc.min <= 12 ? Array.from({ length: sc.max - sc.min + 1 }, (_, i) => sc.min + i) : sc.values;
  for (const v of ticks) {
    s += `<line x1="${x(v)}" x2="${x(v)}" y1="${Y + 4}" y2="${Y + 8}" stroke="var(--ink-4)"/>`;
    s += `<text x="${x(v)}" y="${Y + 20}" text-anchor="middle" class="rule-t">${v}</text>`;
  }
  const stack = {};
  for (const r of p.rs || []) {
    const k = stack[r] = (stack[r] || 0) + 1;
    s += `<circle cx="${x(r)}" cy="${Y - 8 - (k - 1) * 9}" r="4" fill="${ratingColor(r)}" stroke="var(--surface-2)" stroke-width="1.5"><title>rating ${r}</title></circle>`;
  }
  if (p.r != null) {
    s += `<path d="M${x(p.r)} ${Y + 2} l-5 7 h10 z" fill="var(--ink)"/>`;
    s += `<line x1="${x(p.r)}" x2="${x(p.r)}" y1="${Y - 3}" y2="${Y + 3}" stroke="var(--ink)" stroke-width="2"/>`;
  }
  return `${s}</svg>`;
}

function subBar(label, v, max = 4) {
  const w = v == null ? 0 : (100 * (v - 1)) / (max - 1);
  return `<div class="sub"><span>${label}</span><span class="sub-track"><i style="width:${Math.max(2, w)}%"></i></span><b class="mono">${v == null ? "—" : fmt(v, 2)}</b></div>`;
}

export class PaperDrawer {
  /**
   * @param {HTMLElement} el  the <aside> element to render into
   * @param {{byId:Map, tax:any, stats:any, onClose?:Function, onOpen?:(id:string)=>void, rankedCount?:number}} ctx
   */
  constructor(el, ctx) {
    this.el = el;
    this.ctx = ctx;
    this.stack = [];
    this.token = 0;
    this.current = null;
    el.classList.add("drawer");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="dr-head"><button class="icon-btn" data-act="back" title="Back">${icon("back")}</button>
      <span class="dr-id eyebrow"></span><span class="spacer"></span>
      <button class="btn sm ghost" data-act="lists" title="Add to list (l)">${icon("list")} Add to list ▾</button>
      <button class="icon-btn" data-act="star" title="Star (s)">${icon("star")}</button>
      <button class="icon-btn" data-act="close" title="Close (Esc)">${icon("close")}</button></div>
      <div class="dr-body scroll-thin"></div>`;
    this.body = el.querySelector(".dr-body");
    el.addEventListener("click", (e) => this.onClick(e));
    onStoreChange((w) => { if (w === "stars") this.syncStar(); if (w === "lists") this.syncLists(); });
  }

  /** Open the list menu for the current paper, anchored at the header button. */
  openLists() {
    if (this.current) openListMenu(this.el.querySelector('[data-act="lists"]'), [this.current.id]);
  }

  syncLists() {
    const slot = this.body.querySelector('[data-slot="lists"]');
    if (!slot || !this.current) return;
    const ls = listsOf(this.current.id);
    slot.innerHTML = ls.map((l) => `<a class="lpill" style="--c:${l.color}" href="${pageHref("lists.html", `list=${encodeURIComponent(l.id)}`)}"><i></i>${esc(l.name)}</a>`).join("");
  }

  get isOpen() { return this.el.classList.contains("open"); }

  onClick(e) {
    const a = e.target.closest("[data-act]");
    if (a) {
      const act = a.dataset.act;
      if (act === "close") this.close();
      else if (act === "back") this.back();
      else if (act === "star" && this.current) toggleStar(this.current.id);
      else if (act === "lists") this.openLists();
      else if (act === "review") a.closest(".review").classList.toggle("open");
      return;
    }
    const nb = e.target.closest("[data-open]");
    if (nb) { e.preventDefault(); this.open(nb.dataset.open); }
  }

  syncStar() {
    const b = this.el.querySelector('[data-act="star"]');
    if (!b || !this.current) return;
    const on = isStarred(this.current.id);
    b.innerHTML = icon(on ? "starFill" : "star");
    b.classList.toggle("on", on);
  }

  back() {
    if (this.stack.length > 1) { this.stack.pop(); this.open(this.stack[this.stack.length - 1], { push: false }); }
  }

  close() {
    this.el.classList.remove("open");
    this.el.setAttribute("aria-hidden", "true");
    this.current = null;
    this.stack = [];
    this.ctx.onClose?.();
  }

  open(id, { push = true } = {}) {
    const p = this.ctx.byId.get(id);
    if (!p) return false;
    if (push && this.stack[this.stack.length - 1] !== id) this.stack.push(id);
    if (this.stack.length > 30) this.stack.shift();
    this.current = p;
    this.el.classList.add("open");
    this.el.setAttribute("aria-hidden", "false");
    this.el.querySelector('[data-act="back"]').style.visibility = this.stack.length > 1 ? "visible" : "hidden";
    this.el.querySelector(".dr-id").textContent = `#${p.n} · ${STATUS_LABEL[p.s] || p.s}`;
    this.syncStar();
    this.body.innerHTML = this.renderSync(p);
    this.body.scrollTop = 0;
    this.loadAsync(p, ++this.token);
    this.ctx.onOpen?.(id);
    return true;
  }

  renderSync(p) {
    const { tax } = this.ctx;
    const m = tax.major(p.maj);
    const fines = p.fine.map((f) => `<span class="tag fine" style="--c:${m.color}"><i></i>${esc(tax.fine(f).name)}</span>`).join("");
    const local = localPdfUrl(p.pdf);
    const ranked = this.ctx.rankedCount;
    const note = getNote(p.id);
    return `
      <section class="dr-title">
        <div class="dr-tags"><span class="tag" style="--c:${m.color}"><i></i>${esc(m.name)}</span>${fines}</div>
        <h2>${esc(p.t)}</h2>
        <p class="one-liner" data-slot="oneliner"></p>
        <div class="lpills" data-slot="lists"></div>
        <div class="dr-links">
          <a class="btn sm" href="${forumUrl(p.id)}" target="_blank" rel="noopener">${icon("ext")} OpenReview</a>
          <a class="btn sm" href="${orPdfUrl(p.id)}" target="_blank" rel="noopener">${icon("pdf")} PDF</a>
          ${local ? `<a class="btn sm" href="${local}" target="_blank" rel="noopener" title="${esc(p.pdf)}">${icon("pdf")} Local PDF</a>` : ""}
          ${statusHTML(p.s)}
        </div>
        ${note ? `<div class="dr-note"><span class="eyebrow">Your note</span><p>${esc(note)}</p></div>` : ""}
      </section>
      <section class="dr-score card">
        <div class="seal" style="--sc:${p.r != null ? ratingColor(p.r) : "var(--rule-2)"}">
          <b>${p.r != null ? fmt(p.r) : "—"}</b><span>${p.sd != null ? `± ${fmt(p.sd)}` : "mean"}</span>
        </div>
        <div class="kv">
          <div><span>Position by score</span><b class="mono">${p.rk != null ? `${fmtInt(p.rk)}${ranked ? ` <small class="muted">/ ${fmtInt(ranked)}</small>` : ""}` : "—"}</b></div>
          <div><span>Std of ratings</span><b class="mono">${fmt(p.sd)}</b></div>
          <div><span>Reviews</span><b class="mono">${p.nr ?? 0}</b></div>
          <div><span>Confidence</span><b class="mono">${fmt(p.cf)}</b></div>
          <div><span>Conf.-weighted</span><b class="mono">${fmt(p.cw)}</b></div>
        </div>
        <div class="dr-chips">${chipsHTML(p.rs, true)}</div>
        ${ratingRule(p)}
        <div class="subs">${subBar("Soundness", p.so)}${subBar("Presentation", p.pr)}${subBar("Informativeness", p.inf)}</div>
      </section>
      <section class="dr-sec" data-slot="factsheet">${p.fs ? `<div class="skeleton">Loading fact sheet…</div>` : `<div class="fs-none"><span class="eyebrow">Fact sheet</span> <span class="muted">Not generated for this paper yet.</span></div>`}</section>
      ${p.tl ? `<section class="dr-sec"><h3 class="sec-h">TL;DR</h3><p class="tldr">${esc(p.tl)}</p></section>` : ""}
      <section class="dr-sec"><h3 class="sec-h">Abstract</h3><div class="abstract" data-slot="abstract"><div class="skeleton">Loading abstract…</div></div></section>
      <section class="dr-sec meta-grid">
        <div><span class="eyebrow">Primary area</span><p>${esc(p.pa || "—")}</p></div>
        <div><span class="eyebrow">Keywords</span><p>${p.kw.length ? p.kw.map((k) => `<span class="kw">${esc(k)}</span>`).join("") : "—"}</p></div>
      </section>
      <section class="dr-sec" data-slot="reviews"></section>
      <section class="dr-sec"><h3 class="sec-h">More like this <small class="muted" data-slot="nb-src"></small></h3><div data-slot="neighbors"><div class="skeleton">Loading…</div></div></section>`;
  }

  async loadAsync(p, token) {
    const slot = (name) => this.body.querySelector(`[data-slot="${name}"]`);
    const alive = () => token === this.token;
    this.syncLists();
    this.loadSimilar(p, token);
    const [abs, fs, rev] = await Promise.all([
      loadShardEntry("abstracts", p).catch(() => null),
      p.fs ? loadShardEntry("factsheets", p).catch(() => null) : null,
      loadShardEntry("reviews", p).catch(() => null),
    ]);
    if (!alive()) return;
    slot("abstract").innerHTML = abs ? `<p>${esc(abs)}</p>` : `<p class="muted">Abstract not available in this build.</p>`;
    if (fs) {
      slot("oneliner").textContent = fs.one_liner || "";
      slot("factsheet").innerHTML = this.factsheetHTML(fs);
    } else if (p.fs) {
      slot("factsheet").innerHTML = `<div class="fs-none"><span class="eyebrow">Fact sheet</span> <span class="muted">Listed but not found in shard.</span></div>`;
    }
    if (Array.isArray(rev) && rev.length) slot("reviews").innerHTML = this.reviewsHTML(rev);
  }

  /** "More like this": semantic API (top 20) when available, else the 10 precomputed neighbours. */
  async loadSimilar(p, token) {
    const slot = (name) => this.body.querySelector(`[data-slot="${name}"]`);
    let items = null, src = "";
    if (await searchAvailable()) {
      try {
        const res = await similarPapers(p.id, { k: 20, status: "active" });
        items = res.map((r) => ({ id: r.id, sim: r.sem ?? r.s }));
        src = "semantic · top 20";
      } catch { items = null; }
    }
    if (!items || !items.length) {
      const nb = await loadShardEntry("neighbors", p).catch(() => null);
      items = (Array.isArray(nb) ? nb : []).map((id) => ({ id, sim: null }));
      src = items.length ? "precomputed neighbours" : "";
    }
    if (token !== this.token) return;
    slot("nb-src").textContent = src;
    slot("neighbors").innerHTML = items.length ? this.neighborsHTML(items) : `<p class="muted small">No similar papers available.</p>`;
  }

  factsheetHTML(fs) {
    const rows = FS_FIELDS.filter(([k]) => fs[k]).map(([k, label]) =>
      `<div class="fs-row${k === "key_idea" ? " key" : ""}"><dt>${label}</dt><dd>${esc(fs[k])}</dd></div>`).join("");
    const tags = (fs.tags || []).map((t) => `<span class="kw">${esc(t)}</span>`).join("");
    return `<div class="fs card"><div class="fs-h"><span class="eyebrow">Fact sheet</span></div><dl>${rows}</dl>${tags ? `<div class="fs-tags">${tags}</div>` : ""}</div>`;
  }

  reviewsHTML(rev) {
    const items = rev.map((r, i) => `
      <div class="review${i === 0 ? " open" : ""}">
        <button class="rv-h" data-act="review">
          ${r.rating != null ? chipHTML(r.rating) : ""}
          <b>Review ${i + 1}</b>
          <span class="muted small mono">conf ${esc(r.confidence ?? "—")} · S ${esc(r.soundness ?? "—")} · P ${esc(r.presentation ?? "—")} · I ${esc(r.informativeness ?? "—")}</span>
          <span class="spacer"></span>${icon("chev", "rv-chev")}
        </button>
        <div class="rv-b md">
          ${r.summary ? `<h4>Summary</h4>${renderMarkdown(r.summary)}` : ""}
          ${r.strengths ? `<h4>Strengths</h4>${renderMarkdown(r.strengths)}` : ""}
          ${r.weaknesses ? `<h4>Weaknesses</h4>${renderMarkdown(r.weaknesses)}` : ""}
        </div>
      </div>`).join("");
    return `<h3 class="sec-h">Reviews <small class="muted">${rev.length}</small></h3>${items}`;
  }

  neighborsHTML(items) {
    const { byId, tax } = this.ctx;
    return `<ol class="nbrs">${items.map(({ id, sim }) => {
      const q = byId.get(id);
      if (!q) return "";
      const m = tax.major(q.maj);
      return `<li><a href="#" data-open="${esc(id)}" title="${esc(q.t)}${sim != null ? ` · cosine ${fmt(sim, 3)}` : ""}"><i class="swatch" style="--c:${m.color}"></i>
        <span class="nb-t">${esc(q.t)}</span>
        ${sim != null ? `<span class="nb-sim"><i style="width:${Math.max(4, Math.min(100, sim * 100))}%"></i></span>` : ""}
        <span class="nb-s mono" style="--sc:${q.r != null ? ratingColor(q.r) : "transparent"}">${q.r != null ? fmt(q.r) : "—"}</span></a></li>`;
    }).join("")}</ol>`;
  }
}
