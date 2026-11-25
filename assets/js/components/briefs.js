// Domain-brief drawer: renders data/reports/<major-id>.md with the site's Markdown renderer.
// "#12345" paper numbers become links that open the paper drawer; relative links that do not
// exist on the site (e.g. ../inputs/*.json) are shown as plain text.
import { esc, fmtInt } from "../core/util.js";
import { icon } from "../core/icons.js";
import { dataUrl, fetchJSON, fetchText } from "../core/data.js";
import { renderMarkdown } from "../core/md.js";

export async function loadBriefIndex() {
  const idx = await fetchJSON("reports/index.json", { optional: true }).catch(() => null);
  return new Set((idx && Array.isArray(idx.briefs) ? idx.briefs : []).map(String));
}

/** Turn "#12345" in text nodes (outside links / code) into paper links when the number exists. */
function linkPaperNumbers(root, byNum) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest("a, code, pre") || !/#\d{2,6}/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    let last = 0;
    const s = node.nodeValue;
    s.replace(/#(\d{2,6})\b/g, (m, num, off) => {
      const p = byNum.get(Number(num));
      if (!p) return m;
      frag.append(s.slice(last, off));
      const a = document.createElement("a");
      a.href = "#";
      a.className = "pn";
      a.dataset.paper = p.id;
      a.title = p.t;
      a.textContent = m;
      frag.append(a);
      last = off + m.length;
      return m;
    });
    if (last) { frag.append(s.slice(last)); node.replaceWith(frag); }
  }
}

export class BriefDrawer {
  /** @param {{ids:Set<string>, tax:any, papers:any[], onPaper:(id:string)=>void, onChange?:(id:string|null)=>void}} ctx */
  constructor(el, ctx) {
    this.el = el;
    this.ctx = ctx;
    this.byNum = new Map(ctx.papers.map((p) => [p.n, p]));
    this.current = null;
    el.className = "brief";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="brief-h"><button class="icon-btn" data-act="index" title="All domain briefs">${icon("layers")}</button>
      <span class="eyebrow" data-title>Domain briefs</span><span class="spacer"></span>
      <button class="icon-btn" data-act="close" title="Close (Esc)">${icon("close")}</button></div>
      <div class="brief-b scroll-thin"></div>`;
    this.body = el.querySelector(".brief-b");
    el.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (act) { act.dataset.act === "close" ? this.close() : this.open(null); return; }
      const pn = e.target.closest("[data-paper]");
      if (pn) { e.preventDefault(); ctx.onPaper(pn.dataset.paper); return; }
      const b = e.target.closest("[data-brief]");
      if (b) { e.preventDefault(); this.open(b.dataset.brief); }
    });
  }

  get isOpen() { return this.el.classList.contains("open"); }

  close() {
    this.el.classList.remove("open");
    this.el.setAttribute("aria-hidden", "true");
    this.current = null;
    this.ctx.onChange?.(null);
  }

  async open(id) {
    const { ids, tax } = this.ctx;
    this.el.classList.add("open");
    this.el.setAttribute("aria-hidden", "false");
    this.current = id;
    this.ctx.onChange?.(id);
    const title = this.el.querySelector("[data-title]");
    if (!id) {
      title.textContent = `Domain briefs · ${ids.size}`;
      const list = [...ids].map((b) => tax.major(b)).sort((a, b) => a.name.localeCompare(b.name));
      this.body.innerHTML = `<h2 class="brief-title">Domain briefs</h2>
        <p class="muted">Per-area syntheses written by the agent team (Codex, Kimi and Claude subagents) from each category's top papers and reviews. Paper numbers link to the paper detail.</p>
        <ul class="brief-index">${list.map((m) => `<li><a href="#" data-brief="${esc(m.id)}"><i class="swatch" style="--c:${m.color}"></i>${esc(m.name)}</a></li>`).join("")}</ul>`;
      return;
    }
    const m = tax.major(id);
    title.innerHTML = `<i class="swatch" style="--c:${m.color};display:inline-block;margin-right:6px"></i>${esc(m.name)}`;
    this.body.innerHTML = `<div class="skeleton">Loading brief…</div>`;
    this.body.scrollTop = 0;
    let md;
    try { md = await fetchText(dataUrl(`reports/${encodeURIComponent(id)}.md`), { fresh: false }); }
    catch (e) { if (this.current === id) this.body.innerHTML = `<div class="empty"><p>Brief not available (${esc(e.message)}).</p></div>`; return; }
    if (this.current !== id) return;
    this.body.innerHTML = `<div class="md brief-md">${renderMarkdown(md)}</div>`;
    for (const a of this.body.querySelectorAll("a[href]")) {
      const h = a.getAttribute("href");
      if (/^https?:/i.test(h)) { a.target = "_blank"; a.rel = "noopener"; continue; }
      const span = document.createElement("span");
      span.className = "dead-link";
      span.title = h;
      span.textContent = a.textContent;
      a.replaceWith(span);
    }
    linkPaperNumbers(this.body, this.byNum);
    const n = this.body.querySelectorAll("a.pn").length;
    this.body.insertAdjacentHTML("beforeend", `<p class="fig-note">${fmtInt(n)} paper references linked · source <span class="mono">reports/${esc(id)}.md</span></p>`);
  }
}
