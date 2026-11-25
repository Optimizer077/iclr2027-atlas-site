// Category atlas: one "plate" per major (count, mean, score histogram) with top-25 leaderboards per fine category.
import { $, $$, esc, fmt, fmtInt, fmtPct, roman, debounce } from "../core/util.js";
import { loadPapers, loadTaxonomy, loadStats, pageHref } from "../core/data.js";
import { initShell, setFooter, loadingOverlay } from "../core/shell.js";
import { ratingColor, getScale } from "../core/scale.js";
import { getPref, setPref } from "../core/store.js";
import { sparkHist } from "../components/charts.js";
import { icon } from "../core/icons.js";
import { PaperDrawer } from "../components/detail.js";
import { BriefDrawer, loadBriefIndex } from "../components/briefs.js";

initShell({ page: "categories", keys: [["/", "Filter categories"], ["b", "Open the domain-brief index"], ["Esc", "Close paper / brief"]] });

const ORDERS = { mean: "Mean rating", top: "Top-10 mean", strong: "Share with mean ≥ 3.0", count: "Papers", name: "A → Z" };
const LB = 25;

function summarize(list) {
  const ranked = list.filter((p) => p.r != null).sort((a, b) => (a.rk ?? 1e9) - (b.rk ?? 1e9));
  const rs = ranked.map((p) => p.r);
  const mean = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : null;
  const top = ranked.slice(0, 10);
  const topMean = top.length ? top.reduce((a, p) => a + p.r, 0) / top.length : null;
  const strong = ranked.reduce((a, p) => a + (p.r >= 3 ? 1 : 0), 0);
  return { n: list.length, ranked, mean, topMean, strong, strongShare: ranked.length ? strong / ranked.length : 0 };
}

function sorter(order) {
  return {
    mean: (a, b) => (b.s.mean ?? -1) - (a.s.mean ?? -1),
    top: (a, b) => (b.s.topMean ?? -1) - (a.s.topMean ?? -1),
    strong: (a, b) => b.s.strongShare - a.s.strongShare,
    count: (a, b) => b.s.n - a.s.n,
    name: (a, b) => a.name.localeCompare(b.name),
  }[order];
}

async function main() {
  const ov = loadingOverlay("Charting categories");
  let d, tax, stats;
  try { [d, tax, stats] = await Promise.all([loadPapers(ov.progress), loadTaxonomy(), loadStats()]); }
  catch (e) { ov.error(e.message || String(e)); return; }
  const { meta, papers, byId } = d;
  const briefIds = await loadBriefIndex();
  const rankedCount = papers.reduce((n, p) => n + (p.rk != null ? 1 : 0), 0);
  const paperDrawer = new PaperDrawer($("#drawer"), { byId, tax, stats, rankedCount });
  const writeBriefHash = (id) => history.replaceState(null, "", `${location.pathname}${location.search}${id ? `#brief=${encodeURIComponent(id)}` : ""}`);
  const brief = new BriefDrawer($("#brief"), {
    ids: briefIds, tax, papers,
    onPaper: (id) => { paperDrawer.stack = []; paperDrawer.open(id); },
    onChange: (id) => writeBriefHash(id),
  });
  const bb = $("#briefs-btn");
  if (briefIds.size) { bb.innerHTML = `${icon("sheet")} Domain briefs <span class="muted mono">${briefIds.size}</span>`; bb.classList.remove("hidden"); bb.addEventListener("click", () => brief.open(null)); }
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "Escape") { if (paperDrawer.isOpen) paperDrawer.close(); else if (brief.isOpen) brief.close(); }
    else if (e.key === "b" && briefIds.size) brief.open(null);
  });
  setFooter({ generated: meta.generated, records: papers.length });
  const sc = getScale();
  const active = papers.filter((p) => p.s === "active");

  // group active papers
  const byMaj = new Map(), byFine = new Map();
  for (const p of active) {
    if (!byMaj.has(p.maj)) byMaj.set(p.maj, []);
    byMaj.get(p.maj).push(p);
    for (const f of p.fine) { if (!byFine.has(f)) byFine.set(f, []); byFine.get(f).push(p); }
  }
  const majorsSrc = tax.majors.length ? tax.majors : [...byMaj.keys()].map((id) => tax.major(id));
  const majors = majorsSrc.map((m) => {
    const fines = (m.fine || []).map((f) => ({ ...f, s: summarize(byFine.get(f.id) || []) }));
    const known = new Set(fines.map((f) => f.id));
    for (const [fid, list] of byFine) if (fid.split(".")[0] === m.id && !known.has(fid)) fines.push({ ...tax.fine(fid), s: summarize(list) });
    return { ...m, s: summarize(byMaj.get(m.id) || []), fines };
  });

  // histogram bins over the rating scale
  const NB = 12, bw = (sc.max - sc.min) / NB;
  const binColors = Array.from({ length: NB }, (_, i) => ratingColor(sc.min + (i + 0.5) * bw));
  const hist = (ranked) => {
    const c = new Array(NB).fill(0);
    for (const p of ranked) c[Math.min(NB - 1, Math.max(0, Math.floor((p.r - sc.min) / bw)))]++;
    return c;
  };

  let order = getPref("cat.order", "mean");
  if (!ORDERS[order]) order = "mean";
  let rows25 = getPref("cat.rows25", false);
  let filter = "";

  $("#order").innerHTML = Object.entries(ORDERS).map(([k, v]) => `<button data-v="${k}" aria-pressed="${k === order}">${v}</button>`).join("");
  $("#rows").innerHTML = `<button data-v="10" aria-pressed="${!rows25}">Top 10</button><button data-v="25" aria-pressed="${rows25}">Top 25</button>`;
  $("#lede-n").textContent = `${majors.length} major categories · ${majors.reduce((a, m) => a + m.fines.length, 0)} fine categories · ${fmtInt(active.length)} active papers`;

  const tip = (p) => esc(`<div class='t'>${esc(p.t)}</div><span class='m'>#${p.n} · rank ${fmtInt(p.rk)} · ratings ${p.rs.join(" ")}</span>`);
  const fineCard = (m, f) => {
    const top = f.s.ranked.slice(0, LB);
    return `<article class="fcard" data-fine="${esc(f.id)}" data-name="${esc(f.name.toLowerCase())}">
      <div class="fcard-h"><h3><a href="${pageHref("index.html", `fine=${encodeURIComponent(f.id)}`)}">${esc(f.name)}</a></h3>
        <span class="meta">${fmtInt(f.s.n)} · μ ${fmt(f.s.mean)}</span>
        ${f.desc ? `<span class="desc">${esc(f.desc)}</span>` : ""}</div>
      ${top.length ? `<ol class="lb${rows25 ? " open" : ""}">${top.map((p, i) => `<li class="${i >= 10 ? "x" : ""}"><a href="${pageHref("index.html", `fine=${encodeURIComponent(f.id)}&open=${encodeURIComponent(p.id)}`)}" data-tip="${tip(p)}">
        <span class="t">${esc(p.t)}</span><span class="sc" style="--sc:${ratingColor(p.r)}">${fmt(p.r)}</span><span class="sd">±${fmt(p.sd)}</span></a></li>`).join("")}
        ${top.length > 10 ? `<li><button class="more" data-more>${rows25 ? "Show top 10" : `Show top ${top.length}`}</button></li>` : ""}</ol>`
        : `<p class="muted small" style="padding:10px 14px">No ranked papers yet.</p>`}
    </article>`;
  };

  const plateHead = (m, i) => {
    const s = m.s;
    return `<div class="plate-h">
      <div class="plno">Plate<b>${roman(i + 1)}</b></div>
      <h2><a href="${pageHref("index.html", `maj=${encodeURIComponent(m.id)}`)}">${esc(m.name)}</a></h2>
      <div class="plate-stats">
        <div class="pstat"><b>${fmtInt(s.n)}</b><span>papers</span></div>
        <div class="pstat"><b>${fmt(s.mean)}</b><span>mean</span></div>
        <div class="pstat"><b>${fmt(s.topMean)}</b><span>top-10 mean</span></div>
        <div class="pstat"><b>${fmtPct(100 * s.strongShare, 0)}</b><span>mean ≥ 3.0</span></div>
        <div class="pstat spark-w">${sparkHist(hist(s.ranked), { colors: binColors, w: 170, h: 34 })}</div>
      </div>
      <p class="desc">${esc(m.desc || `${m.fines.length} fine categories`)}${briefIds.has(m.id) ? ` <button class="btn sm brief-btn" data-brief="${esc(m.id)}">${icon("sheet")} Read domain brief</button>` : ""}</p>
    </div>`;
  };

  let io = null, tocIo = null;
  function render() {
    const sorted = majors.slice().sort(sorter(order));
    $("#toc").innerHTML = sorted.map((m, i) => `<a href="#p-${esc(m.id)}" data-id="${esc(m.id)}" style="--c:${m.color}"><span class="pl">${roman(i + 1)}</span><i></i><span>${esc(m.name)}</span></a>`).join("");
    $("#plates").innerHTML = sorted.map((m, i) => `<section class="plate reveal" id="p-${esc(m.id)}" data-id="${esc(m.id)}" data-name="${esc(m.name.toLowerCase())}" style="--c:${m.color};--i:${Math.min(i, 8)}">
      ${plateHead(m, i)}<div class="fines-grid" data-pending="1"><div class="skeleton" style="height:120px"></div></div></section>`).join("");
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const grid = e.target.querySelector(".fines-grid[data-pending]");
        if (grid) {
          const m = majors.find((x) => x.id === e.target.dataset.id);
          grid.innerHTML = m.fines.slice().sort(sorter(order)).map((f) => fineCard(m, f)).join("");
          grid.removeAttribute("data-pending");
          applyFilter();
        }
      }
    }, { rootMargin: "600px 0px 600px 0px" });
    $$(".plate").forEach((el) => io.observe(el));
    tocIo?.disconnect();
    tocIo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) $$("#toc a").forEach((a) => a.classList.toggle("on", a.dataset.id === e.target.dataset.id));
    }, { rootMargin: "-30% 0px -65% 0px" });
    $$(".plate").forEach((el) => tocIo.observe(el));
    applyFilter();
  }

  function applyFilter() {
    const q = filter.trim().toLowerCase();
    $$(".plate").forEach((pl) => {
      const majHit = !q || pl.dataset.name.includes(q);
      let any = majHit;
      pl.querySelectorAll(".fcard").forEach((c) => {
        const hit = majHit || c.dataset.name.includes(q);
        c.classList.toggle("hidden", !hit);
        any = any || hit;
      });
      const m = majors.find((x) => x.id === pl.dataset.id);
      if (!any && q && m) any = m.fines.some((f) => f.name.toLowerCase().includes(q));
      pl.classList.toggle("hidden", !any);
      $(`#toc a[data-id="${CSS.escape(pl.dataset.id)}"]`)?.classList.toggle("hidden", !any);
    });
  }

  $("#order").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    order = b.dataset.v; setPref("cat.order", order);
    $$("#order button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });
  $("#rows").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    rows25 = b.dataset.v === "25"; setPref("cat.rows25", rows25);
    $$("#rows button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $$(".lb").forEach((ol) => { ol.classList.toggle("open", rows25); const mb = ol.querySelector("[data-more]"); if (mb) mb.textContent = rows25 ? "Show top 10" : `Show top ${ol.querySelectorAll("li a").length}`; });
  });
  $("#plates").addEventListener("click", (e) => {
    const br = e.target.closest("[data-brief]");
    if (br) { brief.open(br.dataset.brief); return; }
    const mb = e.target.closest("[data-more]"); if (!mb) return;
    const ol = mb.closest(".lb");
    ol.classList.toggle("open");
    mb.textContent = ol.classList.contains("open") ? "Show top 10" : `Show top ${ol.querySelectorAll("li a").length}`;
  });
  const fEl = $("#cat-filter");
  fEl.addEventListener("input", debounce(() => {
    filter = fEl.value;
    if (filter) {  // render all pending grids so fine-level matches show
      $$(".fines-grid[data-pending]").forEach((g) => {
        const m = majors.find((x) => x.id === g.closest(".plate").dataset.id);
        g.innerHTML = m.fines.map((f) => fineCard(m, f)).join("");
        g.removeAttribute("data-pending");
      });
    }
    applyFilter();
  }, 120));
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== fEl && !e.ctrlKey && !e.metaKey) { fEl.focus(); e.preventDefault(); }
  });

  render();
  ov.done();
  if (location.hash.startsWith("#p-")) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  const bh = location.hash.match(/^#brief=([^&]*)/);
  if (bh) { const id = decodeURIComponent(bh[1]); brief.open(briefIds.has(id) ? id : null); }
}

main();
