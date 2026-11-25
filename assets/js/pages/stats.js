// Stats dashboard. Renders stats.json figures immediately, then enriches with papers.json
// (withdrawal by major, fact sheet / PDF counts, footer timestamp) once it arrives.
import { $, esc, fmt, fmtInt, fmtPct } from "../core/util.js";
import { loadPapers, loadTaxonomy, loadStats, pageHref } from "../core/data.js";
import { initShell, setFooter } from "../core/shell.js";
import { ratingColor, getScale, setScale } from "../core/scale.js";
import { barChart } from "../components/charts.js";

initShell({ page: "stats", keys: [] });


function kpi(label, value, sub = "", accent = false) {
  return `<div class="kpi${accent ? " accent" : ""}"><div class="eyebrow">${esc(label)}</div><div class="v">${value}</div><div class="s">${sub}</div></div>`;
}
function fig(num, title, body, { cls = "", note = "", right = "" } = {}) {
  return `<section class="fig ${cls}"><div class="fig-h"><span class="num">FIG. ${num}</span><h2>${esc(title)}</h2><span class="spacer"></span>${right}</div>${body}${note ? `<p class="fig-note">${note}</p>` : ""}</section>`;
}

async function main() {
  const [stats, tax] = await Promise.all([loadStats(), loadTaxonomy()]);
  const root = $("#stats");
  if (!stats) { root.innerHTML = `<div class="empty"><h3>No stats.json</h3><p>Expected <span class="mono">stats.json</span> in the data folder.</p></div>`; return; }
  const papersP = loadPapers();
  // the scale lives in papers.json; infer it from the rating histogram until papers arrive
  const histKeys = Object.keys(stats.rating_hist?.active || {}).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (histKeys.length) setScale({ min: Math.min(1, histKeys[0]), max: histKeys[histKeys.length - 1], values: histKeys });

  const counts = stats.counts || {};
  const total = (counts.active || 0) + (counts.withdrawn || 0) + (counts.desk_rejected || 0);

  /* ---------- KPIs ---------- */
  const kpiHTML = () => `
    ${kpi("Submissions", fmtInt(total || null), "all records")}
    ${kpi("Active", fmtInt(counts.active), total ? `${fmtPct((100 * counts.active) / total)} of all` : "")}
    ${kpi("Withdrawn", fmtInt(counts.withdrawn), total ? `${fmtPct((100 * counts.withdrawn) / total)} of all` : "")}
    ${kpi("Desk-rejected", fmtInt(counts.desk_rejected), total ? `${fmtPct((100 * counts.desk_rejected) / total)} of all` : "")}
    ${kpi("Reviews", fmtInt(stats.n_reviews), stats.n_reviews && counts.active ? `${fmt(stats.n_reviews / counts.active, 2)} per active paper` : "")}
    ${kpi("Mean of means", fmt(stats.mean_of_means), "active, ranked papers", true)}
    <span id="kpi-late" style="display:contents"></span>`;

  /* ---------- Fig 1: individual ratings ---------- */
  const rh = stats.rating_hist?.active || {};
  const rhVals = Object.keys(rh).map(Number).sort((a, b) => a - b);
  const rhTotal = rhVals.reduce((a, v) => a + (rh[v] || 0), 0);
  const fig1 = barChart({
    categorical: true, xmin: 0, xmax: rhVals.length, h: 250, valueLabels: true,
    bars: rhVals.map((v, i) => ({ x0: i, x1: i + 1, value: rh[v] || 0, label: String(v), color: ratingColor(v),
      tip: `<div class="t">Rating ${v}</div><span class="m">${fmtInt(rh[v])} reviews · ${fmtPct((100 * (rh[v] || 0)) / rhTotal)}</span>` })),
  });

  /* ---------- Fig 2: mean-score histogram ---------- */
  const mh = (stats.mean_hist || []).slice().sort((a, b) => a.bin - b.bin);
  let bw = Infinity;
  for (let i = 1; i < mh.length; i++) bw = Math.min(bw, mh[i].bin - mh[i - 1].bin);
  if (!Number.isFinite(bw) || bw <= 0) bw = 0.25;
  const sc = getScale();
  const xmin = Math.min(sc.min, mh[0]?.bin ?? sc.min), xmax = Math.max(sc.max, (mh[mh.length - 1]?.bin ?? sc.max)) + bw;
  const xt = [];
  for (let v = Math.ceil(xmin); v <= Math.floor(xmax); v++) xt.push(v);
  const fig2 = barChart({
    xmin, xmax, h: 270, xTicks: xt,
    bars: mh.map((b) => ({ x0: b.bin, x1: b.bin + bw, value: b.count, color: ratingColor(b.bin + bw / 2),
      tip: `<div class="t">Mean ${fmt(b.bin)}–${fmt(b.bin + bw)}</div><span class="m">${fmtInt(b.count)} papers</span>` })),
  });

  /* ---------- Fig 3: reviews per paper ---------- */
  const nh = stats.n_reviews_hist || {};
  const nhKeys = Object.keys(nh).map(Number).sort((a, b) => a - b);
  const fig3 = nhKeys.length ? barChart({
    categorical: true, xmin: 0, xmax: nhKeys.length, h: 220, valueLabels: true,
    bars: nhKeys.map((k, i) => ({ x0: i, x1: i + 1, value: nh[k], label: `${k}`, color: "var(--ink-3)", tip: `<div class="t">${k} reviews</div><span class="m">${fmtInt(nh[k])} papers</span>` })),
  }) : `<p class="muted">n_reviews_hist not in stats.json.</p>`;

  /* ---------- Fig 4: majors ---------- */
  const majors = (stats.by_major || []).map((m) => ({ ...m, name: m.name || tax.major(m.maj).name, color: tax.major(m.maj).color }));
  let majSort = "count";
  const majorRows = () => {
    const rows = majors.slice().sort((a, b) => (majSort === "count" ? b.count - a.count : (b.mean_r ?? 0) - (a.mean_r ?? 0)));
    const mx = Math.max(1, ...rows.map((r) => r.count));
    const X = (v) => (100 * (v - sc.min)) / (sc.max - sc.min);
    const gl = stats.mean_of_means;
    return `<div class="hrows"><div class="hrow head"><span>Major category</span><span>Active papers</span><span class="v">n</span><span>Mean rating (${sc.min}–${sc.max})</span><span class="v">mean</span></div>${
      rows.map((m) => `<a class="hrow" href="${pageHref("index.html", `maj=${encodeURIComponent(m.maj)}`)}" data-tip="${esc(`<div class='t'>${esc(m.name)}</div><span class='m'>${fmtInt(m.count)} papers · mean ${fmt(m.mean_r)}${m.top10_mean != null ? ` · top-10 mean ${fmt(m.top10_mean)}` : ""}</span>`)}">
        <span class="nm"><i class="swatch" style="--c:${m.color}"></i><span>${esc(m.name)}</span></span>
        <span class="hbar" style="--c:${m.color}"><i style="width:${(100 * m.count) / mx}%;--c:${m.color}"></i></span>
        <span class="v">${fmtInt(m.count)}</span>
        <span class="dotaxis">${gl != null ? `<b style="left:${X(gl)}%" title="overall mean"></b>` : ""}<i style="left:${X(m.mean_r ?? sc.min)}%;--c:${m.color}"></i></span>
        <span class="v">${fmt(m.mean_r)}</span></a>`).join("")}</div>`;
  };

  /* ---------- Fig 5: primary areas ---------- */
  const pas = (stats.by_primary_area || []).slice();
  let paSort = { k: "count", d: -1 };
  const paTable = () => {
    const tot = pas.reduce((a, p) => a + p.count, 0) || 1;
    const rows = pas.slice().sort((a, b) => (paSort.k === "pa" ? a.pa.localeCompare(b.pa) * -paSort.d : ((a[paSort.k] ?? 0) - (b[paSort.k] ?? 0)) * paSort.d));
    const th = (k, label, cls = "") => `<th data-sort="${k}" class="${cls}${paSort.k === k ? " on" : ""}">${label}${paSort.k === k ? (paSort.d < 0 ? " ▼" : " ▲") : ""}</th>`;
    return `<table class="tbl"><thead><tr>${th("pa", "Primary area")}${th("count", "Papers", "n")}<th class="share">Share</th>${th("mean_r", "Mean", "n")}</tr></thead><tbody>${
      rows.map((p) => `<tr><td><a href="${pageHref("index.html", `pa=${encodeURIComponent(p.pa)}`)}">${esc(p.pa)}</a></td><td class="n">${fmtInt(p.count)}</td>
        <td><div class="hbar"><i style="width:${(100 * p.count) / Math.max(...pas.map((x) => x.count))}%;--c:var(--ink-3)"></i></div></td>
        <td class="n"><span style="display:inline-flex;gap:6px;align-items:center"><i class="swatch" style="--c:${ratingColor(p.mean_r)}"></i>${fmt(p.mean_r)}</span></td></tr>`).join("")}</tbody></table>
      <p class="fig-note">${fmtInt(tot)} active papers across ${pas.length} primary areas.</p>`;
  };

  root.innerHTML = `
    <div class="kpis reveal" id="kpis">${kpiHTML()}</div>
    <div class="figs">
      ${fig(1, "Individual review ratings", fig1, { note: `${fmtInt(rhTotal)} ratings on active papers, scale ${sc.min}–${sc.max}. Colour follows the site-wide rating ramp.` })}
      ${fig(2, "Mean rating per paper", fig2, { note: "Distribution of paper mean ratings. Each paper contributes one mean, regardless of review count." })}
      ${fig(3, "Reviews per paper", fig3, { note: "Active papers with at least one submitted review." })}
      ${fig(4, "Papers per major category", `<div id="majors">${majorRows()}</div>`, { cls: "wide",
        right: `<div class="seg" style="width:auto" data-majsort><button data-v="count" aria-pressed="true">By count</button><button data-v="mean">By mean</button></div>`,
        note: "Bars: active papers. Dots: mean rating; the grey tick is the venue-wide mean. Click a row to open it in the Explorer." })}
      ${fig(5, "Primary areas", `<div id="pas">${paTable()}</div>`, {})}
      ${fig(6, "Withdrawn & desk-rejected", `<div id="wd"><div class="skeleton">Loading per-category breakdown…</div></div>`, {})}
    </div>`;

  root.querySelector("[data-majsort]").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    majSort = b.dataset.v;
    root.querySelectorAll("[data-majsort] button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $("#majors").innerHTML = majorRows();
  });
  $("#pas").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort]"); if (!th) return;
    const k = th.dataset.sort;
    paSort = paSort.k === k ? { k, d: -paSort.d } : { k, d: k === "pa" ? 1 : -1 };
    $("#pas").innerHTML = paTable();
  });

  /* ---------- late: papers.json ---------- */
  let d;
  try { d = await papersP; } catch (e) { $("#wd").innerHTML = `<p class="muted">papers.json unavailable: ${esc(e.message)}</p>`; return; }
  const { meta, papers } = d;
  setFooter({ generated: meta.generated, records: papers.length });
  const fsN = papers.reduce((a, p) => a + (p.fs ? 1 : 0), 0);
  const pdfN = papers.reduce((a, p) => a + (p.pdf ? 1 : 0), 0);
  $("#kpi-late").innerHTML = kpi("Papers with mean ≥ 3.0", fmtInt(papers.filter((p) => p.s === "active" && p.r != null && p.r >= 3).length), "active papers") + kpi("Fact sheets", fmtInt(fsN), fsN ? `${fmtPct((100 * fsN) / papers.length)} of records` : "pipeline pending") +
    kpi("Local PDFs", fmtInt(pdfN), pdfN ? "paths in papers.json" : "pipeline pending");
  const by = new Map();
  for (const p of papers) {
    const r = by.get(p.maj) || { maj: p.maj, active: 0, withdrawn: 0, desk_rejected: 0 };
    r[p.s] = (r[p.s] || 0) + 1;
    by.set(p.maj, r);
  }
  const rows = [...by.values()].map((r) => ({ ...r, tot: r.active + r.withdrawn + r.desk_rejected }))
    .map((r) => ({ ...r, rate: r.tot ? (r.withdrawn + r.desk_rejected) / r.tot : 0 })).sort((a, b) => b.rate - a.rate);
  const mx = Math.max(...rows.map((r) => r.rate), 0.01);
  $("#wd").innerHTML = `<div class="legend" style="margin-bottom:8px"><span><i style="--c:var(--bad)"></i>withdrawn</span><span><i style="--c:color-mix(in srgb, var(--bad) 40%, transparent)"></i>desk-rejected</span></div>
    <div class="hrows">${rows.map((r) => {
      const m = tax.major(r.maj);
      return `<a class="hrow" style="grid-template-columns:minmax(140px,1.4fr) minmax(100px,2fr) 54px" href="${pageHref("index.html", `maj=${encodeURIComponent(r.maj)}&st=withdrawn`)}"
        data-tip="${esc(`<div class='t'>${esc(m.name)}</div><span class='m'>${fmtInt(r.withdrawn)} withdrawn · ${fmtInt(r.desk_rejected)} desk-rejected of ${fmtInt(r.tot)}</span>`)}">
        <span class="nm"><i class="swatch" style="--c:${m.color}"></i><span>${esc(m.name)}</span></span>
        <span class="hbar"><i style="width:${(100 * (r.withdrawn / r.tot)) / mx}%;--c:var(--bad)"></i><i style="width:${(100 * (r.desk_rejected / r.tot)) / mx}%;--c:color-mix(in srgb, var(--bad) 40%, transparent)"></i></span>
        <span class="v">${fmtPct(100 * r.rate)}</span></a>`;
    }).join("")}</div><p class="fig-note">Share of each category's submissions that were withdrawn or desk-rejected. Click to list them.</p>`;
}

main().catch((e) => { $("#stats").innerHTML = `<div class="empty"><h3>Could not load stats</h3><p>${esc(e.message)}</p></div>`; });
