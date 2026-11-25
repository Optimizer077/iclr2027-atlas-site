// Ranked results list docked on the right of a plate (map + graph pages).
// Row: rank, title, relevance bar + score, mean rating; hover ↔ plate highlight, click → drawer,
// "+" adds one paper to a custom list, "Add all" adds every hit (components/listmenu.js when present).
import { esc, fmt, fmtInt } from "./core/util.js";
import { icon } from "./core/icons.js";
import { ratingColor } from "./core/scale.js";

let listMenu = null;
const listMenuReady = import("./components/listmenu.js")
  .then((m) => { if (typeof m.openListMenu === "function") listMenu = m.openListMenu; return !!listMenu; })
  .catch(() => false);

export class ResultsPanel {
  /**
   * @param {HTMLElement} host  absolutely positioned container inside .viz
   * @param {{tax:any, onHover:(id:string|null)=>void, onOpen:(id:string)=>void, onClear:()=>void, onFit?:()=>void}} opt
   */
  constructor(host, opt) {
    this.el = host;
    this.opt = opt;
    this.items = [];
    this.marked = null;
    host.classList.add("vresults");
    host.hidden = true;
    host.setAttribute("aria-label", "Search results");
    host.innerHTML = `
      <div class="vr-head">
        <div class="vr-ht"><div class="eyebrow" data-r="eyebrow"></div><div class="vr-q" data-r="q"></div></div>
        <button class="icon-btn" data-act="clear" title="Clear search (Esc)">${icon("close")}</button>
      </div>
      <div class="vr-tools">
        <span class="small muted" data-r="info"></span><span class="spacer"></span>
        ${opt.onFit ? `<button class="btn sm" data-act="fit" title="Zoom to the hits">${icon("target")} Fit</button>` : ""}
        <button class="btn sm" data-act="all" hidden title="Add every hit to a list">${icon("plus")} Add all</button>
      </div>
      <p class="vr-note small" data-r="note" hidden></p>
      <ol class="vr-list scroll-thin" data-r="list"></ol>`;
    this.$ = (r) => host.querySelector(`[data-r="${r}"]`);
    const list = this.$("list");
    list.addEventListener("pointerover", (e) => {
      const row = e.target.closest(".vr-row");
      if (row && row.dataset.id !== this.hoverId) { this.hoverId = row.dataset.id; opt.onHover(row.dataset.id); }
    });
    list.addEventListener("pointerleave", () => { this.hoverId = null; opt.onHover(null); });
    list.addEventListener("click", (e) => {
      const add = e.target.closest(".vr-add");
      const row = e.target.closest(".vr-row");
      if (!row) return;
      if (add) { e.stopPropagation(); listMenu?.(add, [row.dataset.id]); return; }
      opt.onOpen(row.dataset.id);
    });
    list.addEventListener("keydown", (e) => {
      const row = e.target.closest(".vr-row");
      if (!row) return;
      if (e.key === "Enter") { opt.onOpen(row.dataset.id); e.preventDefault(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const sib = e.key === "ArrowDown" ? row.nextElementSibling : row.previousElementSibling;
        if (sib) { sib.focus(); this.hoverId = sib.dataset.id; opt.onHover(sib.dataset.id); }
        e.preventDefault();
      }
    });
    list.addEventListener("focusin", (e) => {
      const row = e.target.closest(".vr-row");
      if (row) { this.hoverId = row.dataset.id; opt.onHover(row.dataset.id); }
    });
    host.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "clear") opt.onClear();
      else if (a.dataset.act === "fit") opt.onFit?.();
      else if (a.dataset.act === "all") listMenu?.(a, this.items.map((it) => it.p.id), { title: `Add ${fmtInt(this.items.length)} hits to…` });
    });
    listMenuReady.then((ok) => { if (ok) { host.classList.add("can-list"); host.querySelector('[data-act="all"]').hidden = false; } });
  }

  get visible() { return !this.el.hidden; }

  /**
   * @param {{q:string, mode:"sem"|"kw", items:{p:any, s:number}[], took:number, note?:string, total?:number, shown?:number, label?:string}} r
   */
  set(r) {
    this.items = r.items;
    this.el.hidden = !r.q;
    document.body.classList.toggle("has-results", !!r.q);
    if (!r.q) return;
    const sem = r.mode === "sem";
    this.$("eyebrow").textContent = `${sem ? "Semantic" : "Keyword"} results · ${fmtInt(r.items.length)}${r.total && r.total > r.items.length ? ` of ${fmtInt(r.total)}` : ""}`;
    this.$("q").textContent = `“${r.q}”`;
    this.$("info").textContent = [r.shown != null ? `${fmtInt(r.shown)} ${r.label || "shown"}` : "", r.took != null ? `${fmtInt(r.took)} ms` : ""].filter(Boolean).join(" · ");
    const note = this.$("note");
    note.hidden = !r.note;
    note.textContent = r.note || "";
    const max = r.items.reduce((m, it) => Math.max(m, it.s), 0), min = r.items.reduce((m, it) => Math.min(m, it.s), Infinity);
    const bar = (s) => (max > min ? 18 + (82 * (s - min)) / (max - min) : 100);
    const tax = this.opt.tax;
    this.$("list").innerHTML = r.items.length ? r.items.map((it, k) => {
      const p = it.p, m = tax.major(p.maj);
      return `<li class="vr-row${p.s !== "active" ? " off" : ""}" data-id="${esc(p.id)}" tabindex="0">
        <span class="vr-rk mono">${k + 1}</span>
        <div class="vr-main">
          <div class="vr-t">${esc(p.t)}</div>
          <div class="vr-meta"><i class="sw" style="--c:${esc(m.color)}" title="${esc(m.name)}"></i>
            ${sem ? `<span class="vr-bar" title="relevance ${fmt(it.s, 3)}"><i style="width:${bar(it.s).toFixed(0)}%"></i></span><span class="mono vr-s">${fmt(it.s, 3)}</span>` : `<span class="mono vr-s">#${p.n}</span>`}
            </div>
        </div>
        <span class="vr-r mono" style="--sc:${p.r != null ? ratingColor(p.r) : "transparent"}">${p.r != null ? fmt(p.r) : "—"}</span>
        <button class="vr-add icon-btn" title="Add to a list" aria-label="Add to a list">${icon("plus")}</button>
      </li>`;
    }).join("") : `<li class="vr-empty muted">Nothing matched. Try fewer or broader words.</li>`;
    this.$("list").scrollTop = 0;
    this.marked = null;
  }

  /** Highlight the row for a paper hovered on the plate (scrolls it into view). */
  mark(id) {
    if (id === this.marked) return;
    this.el.querySelector(".vr-row.on")?.classList.remove("on");
    this.marked = id;
    if (!id || this.el.hidden) return;
    const row = this.el.querySelector(`.vr-row[data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    row.classList.add("on");
    const list = this.$("list"), rt = row.offsetTop - list.offsetTop, rb = rt + row.offsetHeight;
    if (rt < list.scrollTop || rb > list.scrollTop + list.clientHeight) list.scrollTo({ top: rt - list.clientHeight / 2 + row.offsetHeight / 2, behavior: "smooth" });
  }
}
