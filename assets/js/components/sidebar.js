// Explorer sidebar: filters + category tree with faceted counts.
import { esc, fmt, fmtInt } from "../core/util.js";
import { icon } from "../core/icons.js";
import { getScale, ratingStep } from "../core/scale.js";
import { getPref, setPref, getLists, onStoreChange } from "../core/store.js";

/** Dual-thumb range slider. */
export function makeRange(el, { min, max, step, cls = "", format = (v) => fmt(v, 2), onInput }) {
  el.innerHTML = `<div class="range ${cls}"><div class="track"></div><div class="fill"></div>
    <input type="range" min="${min}" max="${max}" step="${step}" aria-label="minimum">
    <input type="range" min="${min}" max="${max}" step="${step}" aria-label="maximum"></div>
    <div class="range-vals"><span></span><span></span></div>`;
  const [a, b] = el.querySelectorAll("input");
  const fill = el.querySelector(".fill");
  const [va, vb] = el.querySelectorAll(".range-vals span");
  const paint = () => {
    const lo = Number(a.value), hi = Number(b.value);
    const pct = (v) => ((v - min) / (max - min)) * 100;
    fill.style.left = `${pct(lo)}%`;
    fill.style.width = `${pct(hi) - pct(lo)}%`;
    va.textContent = format(lo);
    vb.textContent = format(hi);
  };
  const onEither = (which) => {
    let lo = Number(a.value), hi = Number(b.value);
    if (lo > hi) { if (which === a) { a.value = hi; lo = hi; } else { b.value = lo; hi = lo; } }
    paint();
    onInput(lo, hi);
  };
  a.addEventListener("input", () => onEither(a));
  b.addEventListener("input", () => onEither(b));
  return { set(lo, hi) { a.value = lo; b.value = hi; paint(); } };
}

export function buildSidebar(el, { papers, tax, maxSd, onChange }) {
  const stCounts = { active: 0, withdrawn: 0, desk_rejected: 0 };
  const paCounts = new Map();
  for (const p of papers) {
    stCounts[p.s] = (stCounts[p.s] || 0) + 1;
    if (p.pa) paCounts.set(p.pa, (paCounts.get(p.pa) || 0) + 1);
  }
  const pas = [...paCounts.entries()].sort((x, y) => y[1] - x[1]);
  const expanded = new Set(getPref("tree.expanded", []));

  el.innerHTML = `
    <div class="side-sec">
      <div class="side-h"><span class="eyebrow">Filters</span><button data-reset>Reset all</button></div>
      <div class="field"><div class="seg" data-seg="st">
        <button data-v="active">Active<span class="n">${fmtInt(stCounts.active)}</span></button>
        <button data-v="withdrawn">Withdrawn</button>
        <button data-v="desk_rejected">Desk-rej.</button>
        <button data-v="all">All</button></div></div>
      <div class="field"><label for="pa-sel">Primary area</label>
        <select class="select" id="pa-sel"><option value="">All primary areas</option>${pas.map(([pa, c]) => `<option value="${esc(pa)}">${esc(pa)} (${fmtInt(c)})</option>`).join("")}</select></div>
      <div class="field"><div class="lbl">Mean rating</div><div data-range="r"></div></div>
      <div class="field"><div class="lbl">Std of ratings <span class="muted">controversy</span></div><div data-range="sd"></div></div>
      <div class="field"><div class="lbl">Min. reviews</div><div class="seg" data-seg="nr">
        <button data-v="0">Any</button><button data-v="2">≥2</button><button data-v="3">≥3</button><button data-v="4">≥4</button><button data-v="5">≥5</button></div></div>
      <div class="flags">
        <label class="switch"><input type="checkbox" data-flag="fs"> Has fact sheet</label>
        <label class="switch"><input type="checkbox" data-flag="pdf"> Has local PDF</label>
      </div>
      <div class="field" style="margin-top:12px"><label for="list-sel">In list</label>
        <select class="select" id="list-sel"></select>
      </div>
    </div>
    <div class="side-sec">
      <div class="side-h"><span class="eyebrow">Categories</span><button data-expand>Expand all</button></div>
      <ul class="tree" data-tree></ul>
    </div>`;

  const sc = getScale();
  const rRange = makeRange(el.querySelector('[data-range="r"]'), {
    min: sc.min, max: sc.max, step: ratingStep(), cls: "rating", onInput: (lo, hi) => onChange({ rmin: lo, rmax: hi }, { debounce: true }),
  });
  const sdRange = makeRange(el.querySelector('[data-range="sd"]'), {
    min: 0, max: maxSd, step: 0.1, format: (v) => fmt(v, 1), onInput: (lo, hi) => onChange({ sdmin: lo, sdmax: hi }, { debounce: true }),
  });

  el.querySelector('[data-seg="st"]').addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (b) onChange({ st: b.dataset.v });
  });
  el.querySelector('[data-seg="nr"]').addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (b) onChange({ nr: Number(b.dataset.v) });
  });
  el.querySelector("#pa-sel").addEventListener("change", (e) => onChange({ pa: e.target.value }));
  el.querySelectorAll("[data-flag]").forEach((c) => c.addEventListener("change", () => onChange({ [c.dataset.flag]: c.checked })));
  const listSel = el.querySelector("#list-sel");
  let curList = "";
  const fillLists = () => {
    listSel.innerHTML = `<option value="">Any paper</option>${getLists().map((l) => `<option value="${esc(l.id)}">${esc(l.name)} (${fmtInt(l.items.length)})</option>`).join("")}`;
    listSel.value = curList;
  };
  fillLists();
  onStoreChange((w) => { if (w === "lists") fillLists(); });
  listSel.addEventListener("change", () => onChange({ list: listSel.value }));
  el.querySelector("[data-reset]").addEventListener("click", () => onChange(null));

  /* ---------- tree ---------- */
  const treeEl = el.querySelector("[data-tree]");
  const majors = tax.majors.length ? tax.majors : [...new Set(papers.map((p) => p.maj))].map((id) => tax.major(id));
  treeEl.innerHTML = `<li><button class="tnode" data-maj="" style="--c:var(--ink-3)"><span></span><i class="sw" style="--c:var(--ink-3)"></i><span class="nm">All categories</span><span class="ct" data-ct="*"></span></button></li>` +
    majors.map((m) => `<li data-li="${esc(m.id)}">
      <button class="tnode" data-maj="${esc(m.id)}" style="--c:${m.color}" title="${esc(m.desc || m.name)}">
        <span class="caret" data-caret="${esc(m.id)}">${icon("chev")}</span><i class="sw"></i><span class="nm">${esc(m.name)}</span><span class="ct" data-ct="${esc(m.id)}"></span></button>
      <ul class="fines${expanded.has(m.id) ? "" : " hidden"}">${(m.fine || []).map((f) => `<li><button class="tnode" data-fine="${esc(f.id)}" style="--c:${m.color}" title="${esc(f.desc || f.name)}">
        <span></span><i></i><span class="nm">${esc(f.name)}</span><span class="ct" data-ct="${esc(f.id)}"></span></button></li>`).join("")}</ul></li>`).join("");
  majors.forEach((m) => { if (expanded.has(m.id)) treeEl.querySelector(`[data-maj="${CSS.escape(m.id)}"]`)?.classList.add("exp"); });

  const setExpanded = (id, on) => {
    const li = treeEl.querySelector(`[data-li="${CSS.escape(id)}"]`);
    if (!li) return;
    li.querySelector(".fines").classList.toggle("hidden", !on);
    li.querySelector(".tnode").classList.toggle("exp", on);
    if (on) expanded.add(id); else expanded.delete(id);
    setPref("tree.expanded", [...expanded]);
  };
  let cur = { maj: "", fine: "" };
  treeEl.addEventListener("click", (e) => {
    const caret = e.target.closest("[data-caret]");
    if (caret) { e.stopPropagation(); setExpanded(caret.dataset.caret, !expanded.has(caret.dataset.caret)); return; }
    const fb = e.target.closest("[data-fine]");
    if (fb) { const id = fb.dataset.fine; onChange(cur.fine === id ? { fine: "" } : { fine: id, maj: id.split(".")[0] }); return; }
    const mb = e.target.closest("[data-maj]");
    if (mb) {
      const id = mb.dataset.maj;
      if (id) setExpanded(id, true);
      onChange(cur.maj === id && !cur.fine ? { maj: "", fine: "" } : { maj: id, fine: "" });
    }
  });
  el.querySelector("[data-expand]").addEventListener("click", (e) => {
    const all = expanded.size < majors.length;
    majors.forEach((m) => setExpanded(m.id, all));
    e.target.textContent = all ? "Collapse all" : "Expand all";
  });

  return {
    /** Reflect filter state + faceted counts. */
    sync(f, majC, fineC, total) {
      cur = { maj: f.maj, fine: f.fine };
      el.querySelectorAll('[data-seg="st"] button').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === f.st)));
      el.querySelectorAll('[data-seg="nr"] button').forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.v) === f.nr)));
      el.querySelector("#pa-sel").value = f.pa;
      rRange.set(f.rmin, f.rmax);
      sdRange.set(f.sdmin, f.sdmax);
      el.querySelectorAll("[data-flag]").forEach((c) => { c.checked = !!f[c.dataset.flag]; });
      curList = f.list || "";
      listSel.value = curList;
      treeEl.querySelectorAll("[data-ct]").forEach((c) => {
        const k = c.dataset.ct;
        const n = k === "*" ? total : (k.includes(".") ? fineC.get(k) : majC.get(k)) || 0;
        c.textContent = fmtInt(n);
        c.closest(".tnode").classList.toggle("zero", n === 0);
      });
      treeEl.querySelectorAll(".tnode.on").forEach((b) => b.classList.remove("on"));
      const sel = f.fine ? treeEl.querySelector(`[data-fine="${CSS.escape(f.fine)}"]`) : treeEl.querySelector(`[data-maj="${CSS.escape(f.maj)}"]`);
      sel?.classList.add("on");
      if (f.maj && !expanded.has(f.maj)) setExpanded(f.maj, true);
    },
  };
}
