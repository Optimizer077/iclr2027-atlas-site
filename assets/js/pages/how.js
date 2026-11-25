import { mountShell, loadPapers, loadTaxonomy, esc } from "../atlas.js";
import { publicRepo } from "../core/embed-loader.js";

const REPO = publicRepo(); // no account name hardcoded: derived from the Pages URL

const $ = (s) => document.querySelector(s);
const num = (n) => Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-US") : "—";
const ms = (n) => `${Number(n).toFixed(1)} ms`;
const storage = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const theme = storage("atlas.theme");
if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
mountShell("how");

let data, tax, stats, clusters, meta;
let health = { ready: false, n: 0 };
let activeEngine = "keyword";
let browserModule;
let keywordDocs;
const shardBuffers = new Map();
const shardCards = new Map();
const engineNames = { server: "Server semantic", browser: "Browser semantic", keyword: "Keyword" };

// Optional resources legitimately return 404 on static hosting or during publication.
// A small worker probes them without generating page-level resource errors. All
// failures return explicit state; required data errors remain visible in the page.
const probeSource = `onmessage = async ({data: {id, url, kind, timeout}}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, {method: kind === 'head' ? 'HEAD' : 'GET', cache: 'no-cache', signal: controller.signal});
    if (!r.ok) { postMessage({id, ok:false, status:r.status}); return; }
    const data = kind === 'head' ? null : kind === 'buffer' ? await r.arrayBuffer() : await r.json();
    postMessage({id, ok:true, data, bytes:Number(r.headers.get('Content-Length')) || null}, kind === 'buffer' ? [data] : []);
  } catch { postMessage({id, ok:false, status:0}); }
  finally { clearTimeout(timer); }
};`;
let probeWorker, probeSequence = 0;
const pendingProbes = new Map();
function resource(url, kind = "json", timeout = 8000) {
  return new Promise((resolve) => {
    try {
      if (!probeWorker) {
        const blob = URL.createObjectURL(new Blob([probeSource], { type: "text/javascript" }));
        probeWorker = new Worker(blob);
        URL.revokeObjectURL(blob);
        probeWorker.onmessage = ({ data: reply }) => {
          pendingProbes.get(reply.id)?.(reply);
          pendingProbes.delete(reply.id);
        };
        probeWorker.onerror = () => {
          for (const finish of pendingProbes.values()) finish({ ok: false });
          pendingProbes.clear();
          probeWorker.terminate();
          probeWorker = null;
        };
      }
      const id = ++probeSequence;
      pendingProbes.set(id, resolve);
      probeWorker.postMessage({ id, url: new URL(url, document.baseURI).href, kind, timeout });
    } catch { resolve({ ok: false }); }
  });
}
async function optionalJSON(url) { const r = await resource(url); return r.ok ? r.data : null; }

// Benchmark values always come from the export, independently of the paper index.
const measured = (value) => typeof value === "number" && Number.isFinite(value);
const fixed = (value, digits = 3) => measured(value) ? value.toFixed(digits) : "—";
const percent = (value) => measured(value) ? `${(value * 100).toFixed(1)}%` : "—";
const evaluated = (row) => row && (!measured(row.n) || row.n > 0);
const qualityChoice = (engine) => engine.id === "best_server_fusion" ? "server" : engine.id === "best_browser_fusion" ? "browser" : "";
const choiceTag = (engine) => qualityChoice(engine) ? `<span class="quality-choice ${qualityChoice(engine)}">Chosen ${qualityChoice(engine)}</span>` : "";
const qualityCell = (label, value) => `<td role="cell" data-label="${esc(label)}">${value}</td>`;
let qualityData;
let qualitySort = { key: "ndcg10", direction: "desc" };

function qualityMetric(engine, key) {
  if (key === "label") return engine.label || engine.id;
  if (key === "mean" || key === "p95") return engine.latency_ms?.[key];
  return key === "n" || evaluated(engine.test) ? engine.test?.[key] : null;
}
function renderQualityEngines() {
  const { key, direction } = qualitySort;
  const engines = [...qualityData.engines].sort((a, b) => {
    const av = qualityMetric(a, key), bv = qualityMetric(b, key);
    // Missing measurements always follow measured results, in either direction.
    if (key !== "label") {
      if (!measured(av)) return measured(bv) ? 1 : 0;
      if (!measured(bv)) return -1;
    }
    const order = key === "label" ? String(av).localeCompare(String(bv)) : av - bv;
    return (direction === "asc" ? order : -order) || a.id.localeCompare(b.id);
  });
  $("#quality-engine-table tbody").innerHTML = engines.map(engine => `<tr role="row" data-engine-id="${esc(engine.id)}" class="${qualityChoice(engine) ? "quality-chosen-row" : ""}"><th role="rowheader" scope="row">${esc(engine.label || engine.id)} ${choiceTag(engine)}<small>${esc(engine.where || "Location not published")}</small>${engine.config ? `<code>${esc(engine.config)}</code>` : ""}</th>${qualityCell("nDCG@10", fixed(qualityMetric(engine, "ndcg10")))}${qualityCell("MRR@10", fixed(qualityMetric(engine, "mrr10")))}${qualityCell("Judged@10", percent(qualityMetric(engine, "judged10")))}${qualityCell("Test queries", fixed(engine.test?.n, 0))}${qualityCell("Mean ms", fixed(engine.latency_ms?.mean, 1))}${qualityCell("P95 ms", fixed(engine.latency_ms?.p95, 1))}</tr>`).join("");
  const labels = { label: "Engine", ndcg10: "nDCG@10", mrr10: "MRR@10", judged10: "Judged@10", n: "Test queries", mean: "Mean ms", p95: "P95 ms" };
  for (const button of document.querySelectorAll("[data-quality-sort]")) {
    const active = button.dataset.qualitySort === key;
    button.parentElement.setAttribute("aria-sort", active ? direction === "asc" ? "ascending" : "descending" : "none");
    button.textContent = labels[button.dataset.qualitySort] + (active ? direction === "asc" ? " ↑" : " ↓" : "");
  }
  const select = $("#quality-sort"), value = `${key}:${direction}`;
  if (![...select.options].some(option => option.value === value)) select.add(new Option(`${labels[key]} · ${direction === "asc" ? "ascending" : "descending"}`, value));
  select.value = value;
}

function inspectQualityPoint(index) {
  const engine = qualityData.engines[index];
  if (!engine) return;
  $("#quality-point-detail").textContent = `${engine.label || engine.id}: nDCG@10 ${fixed(qualityMetric(engine, "ndcg10"))}; p95 ${fixed(engine.latency_ms?.p95, 1)} ms; ${fixed(engine.test?.n, 0)} held-out queries.${qualityChoice(engine) ? " Chosen " + qualityChoice(engine) + " configuration." : ""}`;
  document.querySelectorAll("[data-quality-point]").forEach(el => {
    const selected = Number(el.dataset.qualityPoint) === index;
    el.classList.toggle("is-inspected", selected);
    el.setAttribute("aria-pressed", String(selected));
  });
}
function drawQualityChart() {
  if (!qualityData) return;
  const mobile = matchMedia("(max-width: 640px)").matches;
  const width = mobile ? 354 : 720, height = mobile ? 320 : 350;
  const left = 47, right = width - 22, top = 28, bottom = height - 57;
  const points = qualityData.engines.map((engine, index) => ({ engine, index })).filter(({ engine }) => measured(qualityMetric(engine, "ndcg10")) && measured(engine.latency_ms?.p95) && engine.latency_ms.p95 > 0);
  if (!points.length) {
    $("#quality-chart").innerHTML = '<p class="how-caption">No paired accuracy and positive latency measurements are available to plot.</p>';
    return;
  }
  const latencies = points.map(({ engine }) => engine.latency_ms.p95);
  const accuracies = points.map(({ engine }) => engine.test.ndcg10);
  const yMin = Math.max(0, Math.floor((Math.min(...accuracies) - .05) * 10) / 10);
  const yMax = Math.min(1, Math.ceil((Math.max(...accuracies) + .05) * 10) / 10);
  const logMin = Math.floor(Math.log10(Math.min(...latencies))), logMax = Math.max(logMin + 1, Math.ceil(Math.log10(Math.max(...latencies))));
  const x = value => left + (Math.log10(value) - logMin) / (logMax - logMin) * (right - left);
  const y = value => bottom - (value - yMin) / (yMax - yMin) * (bottom - top);
  const ticks = [];
  for (let power = logMin; power <= logMax; power++) ticks.push(10 ** power);
  const yTicks = Array.from({ length: Math.round((yMax - yMin) * 10) + 1 }, (_, i) => yMin + i / 10);
  const grid = yTicks.map(value => `<path class="quality-grid" d="M${left},${y(value)} H${right}"/><text class="quality-axis" x="${left - 9}" y="${y(value) + 4}" text-anchor="end">${value.toFixed(2)}</text>`).join("") + ticks.map(value => `<path class="quality-grid" d="M${x(value)},${top} V${bottom}"/><text class="quality-axis" x="${x(value)}" y="${bottom + 21}" text-anchor="middle">${num(value)}</text>`).join("");
  // Keep numbered labels readable where engines have very similar scores.
  const labels = [];
  const dots = points.map(({ engine, index }) => {
    const cx = x(engine.latency_ms.p95), cy = y(engine.test.ndcg10);
    let lx = Math.min(right - 6, cx + 12), ly = cy - 12;
    for (let attempt = 0; attempt < 16; attempt++) {
      const offset = (attempt % 2 ? 1 : -1) * (12 + Math.floor(attempt / 2) * 15);
      ly = Math.max(13, Math.min(bottom - 8, cy + offset));
      if (!labels.some(([px, py]) => Math.abs(px - lx) < 19 && Math.abs(py - ly) < 15)) break;
    }
    labels.push([lx, ly]);
    const description = `${engine.label || engine.id}: nDCG@10 ${fixed(engine.test.ndcg10)}, p95 ${fixed(engine.latency_ms.p95, 1)} ms${qualityChoice(engine) ? ", chosen " + qualityChoice(engine) : ""}`;
    return `<g class="quality-dot ${qualityChoice(engine)}" data-quality-point="${index}" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(description)}"><title>${esc(description)}</title><circle class="quality-hit" cx="${cx}" cy="${cy}" r="12"/><path class="quality-leader" d="M${cx},${cy} L${lx},${ly}"/><circle class="quality-mark" cx="${cx}" cy="${cy}" r="${qualityChoice(engine) ? 6 : 4.5}"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">${index + 1}</text></g>`;
  }).join("");
  $("#quality-chart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="quality-svg-title quality-svg-desc"><title id="quality-svg-title">Held-out search accuracy against exported p95 latency</title><desc id="quality-svg-desc">Horizontal axis: latency in milliseconds on a logarithmic scale. Vertical axis: nDCG at ten, zoomed from ${fixed(yMin, 2)} to ${fixed(yMax, 2)}. Numbered dots match the engine key. Chosen server and browser configurations are outlined. Full values are in the table below.</desc>${grid}<text class="quality-axis" x="${left}" y="14">nDCG@10 · zoomed scale</text><text class="quality-axis" x="${(left + right) / 2}" y="${height - 9}" text-anchor="middle">P95 latency (ms · log scale)</text>${dots}</svg>`;
  $("#quality-key").innerHTML = qualityData.engines.map((engine, index) => `<li><button type="button" class="${qualityChoice(engine)}" data-quality-point="${index}" aria-pressed="false"><span class="quality-key-number">${index + 1}</span><span>${esc(engine.label || engine.id)}${choiceTag(engine)}${points.some(p => p.index === index) ? "" : '<small>Not plotted: missing accuracy or positive p95</small>'}</span></button></li>`).join("");
}

function renderQualityTypes() {
  const types = Object.entries(qualityData.by_type || {});
  $("#quality-types").innerHTML = types.length ? types.map(([type, engines]) => `<article><h4>${esc(type)}</h4>${Object.entries(engines || {}).map(([id, result]) => {
    const engine = qualityData.engines.find(e => e.id === id) || { id, label: id };
    const hasScore = evaluated(result) && measured(result.ndcg10);
    return `<div class="quality-type-row ${qualityChoice(engine)}"><div><span>${esc(engine.label || id)}</span><b>${hasScore ? fixed(result.ndcg10) : "—"}</b></div>${hasScore ? `<div class="quality-bar" aria-hidden="true"><i style="width:${Math.max(0, Math.min(1, result.ndcg10)) * 100}%"></i></div>` : ""}<small>${result.n === 0 ? "No evaluated queries" : `${fixed(result.n, 0)} held-out queries`}</small></div>`;
  }).join("")}</article>`).join("") : '<p class="how-caption">Query-type measurements have not been published.</p>';
}
function renderQualityExample() {
  const example = qualityData.examples[Number($("#quality-query").value)];
  if (!example) return;
  $("#quality-query-note").textContent = `${example.qid || ""} · ${example.type || "Unspecified query type"} · ${example.query || ""}. Captured bge vs. hybrid results; the hybrid list is not the tuned configuration.`;
  const gradeNames = { 2: "Directly relevant", 1: "Related", 0: "Off-topic" };
  $("#quality-comparison").innerHTML = [["bge", "Old default · bge"], ["hybrid", "Hybrid · RRF"]].map(([id, label]) => {
    const results = Array.isArray(example.engines?.[id]) ? example.engines[id].slice(0, 5) : [];
    return `<article><h4>${label}</h4>${results.length ? `<ol>${results.map(paper => {
      const grade = [0, 1, 2].includes(paper.grade) ? paper.grade : null;
      return `<li><span class="quality-example-title"><small>#${esc(paper.n ?? "?")}</small>${esc(paper.t || "Title unavailable")}</span><span class="quality-grade grade-${grade ?? "unknown"}">${grade == null ? "— · Unjudged" : `${grade} · ${gradeNames[grade]}`}</span></li>`;
    }).join("")}</ol>` : '<p class="how-caption">No captured results for this engine.</p>'}</article>`;
  }).join("");
}
function renderQuality(data) {
  qualityData = data;
  const engines = data.engines;
  const server = engines.find(e => e.id === "best_server_fusion");
  const browser = engines.find(e => e.id === "best_browser_fusion");
  const headline = data.headline || {}, method = data.method || {};
  const speeds = Array.isArray(data.browser_speed) ? data.browser_speed : [];
  const chosenSpeed = speeds.find(row => /chosen/i.test(row.variant || "") && !/fallback/i.test(row.variant || ""));
  const fallbackSpeed = speeds.find(row => /chosen.*fallback/i.test(row.variant || ""));
  const delta = headline.vs_bge_ndcg10;
  const cards = [
    ["Server nDCG@10", fixed(headline.server_ndcg10), "Graded relevance across the top 10 results.", "server-ndcg"],
    ["Server MRR@10", fixed(headline.server_mrr10), "Reciprocal rank of the first directly relevant result.", "server-mrr"],
    ["Change vs. old bge default", measured(delta) ? `${delta > 0 ? "+" : ""}${delta.toFixed(3)}` : "—", "Absolute change in held-out nDCG@10, not a relative percentage.", "delta"],
    ["In-browser nDCG@10", fixed(qualityMetric(browser || {}, "ndcg10")), `Chosen configuration, evaluated offline. Warm query embedding: ${fixed(chosenSpeed?.embed_ms, 1)} ms${fallbackSpeed ? `; fallback ${fixed(fallbackSpeed.embed_ms, 1)} ms` : ""}. Full query latency is not supplied.`, "browser"],
  ];
  $("#quality-headlines").innerHTML = cards.map(([label, value, detail, id]) => `<article><h3>${label}</h3><strong data-quality-value="${id}">${value}</strong><p>${esc(detail)}</p></article>`).join("");
  const generated = new Date(data.generated);
  $("#quality-status").textContent = `Published ${Number.isNaN(generated.getTime()) ? "at an unspecified time" : generated.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"} · ${num(engines.length)} engines · ${fixed(server?.test?.n, 0)} held-out queries for the chosen server.`;
  $("#quality-latency-note").textContent = "Latency is the exported benchmark p95, on a logarithmic scale; it excludes network and page rendering. The current exporter reuses the untuned hybrid timings for tuned fusion rows, including the browser configuration. Those points are latency proxies, not direct timings of the tuned engines or this device. Browser embedding measurements are listed separately below.";
  renderQualityEngines();
  drawQualityChart();
  renderQualityTypes();
  $("#quality-browser-table tbody").innerHTML = speeds.length ? speeds.map(row => `<tr role="row"><th role="rowheader" scope="row">${esc(row.variant || "Unnamed variant")}</th>${qualityCell("Download MB", fixed(row.download_mb, 1))}${qualityCell("Embed ms", fixed(row.embed_ms, 1))}${qualityCell("Cosine vs. reference", fixed(row.cos_vs_ref))}${qualityCell("Note", esc(row.note || "—"))}</tr>`).join("") : '<tr><td colspan="5">Browser speed measurements have not been published.</td></tr>';
  if (Array.isArray(data.idea?.engines) && data.idea.engines.length) {
    $("#quality-idea").hidden = false;
    $("#quality-idea-note").textContent = `${num(Array.isArray(data.idea.queries) ? data.idea.queries.length : data.idea.queries)} idea-paraphrase queries. Success@1 / @10 measures whether the target paper appears within the first 1 / 10 results. Higher is better.`;
    $("#quality-idea-table tbody").innerHTML = data.idea.engines.map(row => `<tr role="row"><th role="rowheader" scope="row">${esc(engines.find(e => e.id === row.id)?.label || row.id)}</th>${qualityCell("Success@1", percent(row.success1))}${qualityCell("Success@10", percent(row.success10))}${qualityCell("MRR@10", fixed(row.mrr10))}</tr>`).join("");
  }
  data.examples = Array.isArray(data.examples) ? data.examples : [];
  $("#quality-query").disabled = !data.examples.length;
  $("#quality-query").innerHTML = data.examples.map((example, index) => `<option value="${index}">${esc(example.query || example.qid || "Unnamed query")}</option>`).join("");
  if (data.examples.length) renderQualityExample();
  else $("#quality-query-note").textContent = "Side-by-side examples have not been published.";
  const types = Object.entries(method.types || {}).map(([type, count]) => `${num(count)} ${type}`).join("; ");
  const grader = typeof method.grader === "string" ? method.grader : "Codex (AI)";
  $("#quality-method").innerHTML = `<p><b>Judging.</b> ${esc(grader)} assigned relevance grades as one grader, blind to engine and retrieval rank, using paper text. ${esc(method.grades || "Grades: 0 off-topic; 1 related; 2 directly relevant.")}</p><p><b>Sample.</b> ${num(method.queries)} authored queries${types ? ` (${esc(types)})` : ""}; ${num(method.judged_queries)} judged queries and ${num(method.judged_pairs)} query–paper judgments. Pool depth: ${num(method.pool_depth)} per engine. The table gives the evaluated test count for each engine; ungraded queries can reduce this count.</p><p><b>Tuning and testing.</b> ${esc(method.split || "Split details have not been published.")} Chosen server: ${esc(headline.server_config || server?.config || "configuration not published")}. Chosen browser: ${esc(headline.browser_config || browser?.config || "configuration not published")}.</p><p><b>Metrics.</b> ${esc(method.metrics || "Metric definitions have not been published.")} nDCG rewards relevant results near the top; MRR uses the first grade-2 result. A dash means unavailable, not zero.</p><p><b>Limits.</b> One AI grader and an authored query set do not establish performance for all users. Unjudged documents count as non-relevant; pool depth and judged coverage can therefore affect comparisons. No independent human validation is claimed. Browser configuration accuracy was evaluated offline, separately from browser embedding speed.</p>`;
  $("#quality-content").hidden = false;
  $("#quality").dataset.loaded = "true";
}
$("#quality-sort").addEventListener("change", event => {
  const [key, direction] = event.target.value.split(":");
  qualitySort = { key, direction };
  if (qualityData) renderQualityEngines();
});
$("#quality-engine-table thead").addEventListener("click", event => {
  const button = event.target.closest("[data-quality-sort]");
  if (!button || !qualityData) return;
  const key = button.dataset.qualitySort;
  qualitySort = { key, direction: key === qualitySort.key ? qualitySort.direction === "asc" ? "desc" : "asc" : ["label", "mean", "p95"].includes(key) ? "asc" : "desc" };
  renderQualityEngines();
});
$("#quality-query").addEventListener("change", renderQualityExample);
$("#quality").addEventListener("click", event => {
  const point = event.target.closest("[data-quality-point]");
  if (point) inspectQualityPoint(Number(point.dataset.qualityPoint));
});
$("#quality-chart").addEventListener("keydown", event => {
  const point = event.target.closest("[data-quality-point]");
  if (point && ["Enter", " "].includes(event.key)) { event.preventDefault(); inspectQualityPoint(Number(point.dataset.qualityPoint)); }
});
matchMedia("(max-width: 640px)").addEventListener("change", drawQualityChart);
optionalJSON("data/search_eval.json").then(benchmark => {
  if (!benchmark || !Array.isArray(benchmark.engines) || !benchmark.engines.length) {
    $("#quality-status").textContent = "Search benchmark measurements are not available in this edition yet.";
    return;
  }
  renderQuality(benchmark);
}).catch(() => { $("#quality-status").textContent = "The search benchmark could not be read. Please try again after the next data export."; });

function browserRequested() {
  try {
    return Object.keys(localStorage).some((key) => /(?:gemma|semantic)/i.test(key) && /^(?:true|1|enabled|on)$/i.test(localStorage.getItem(key)));
  } catch { return false; }
}
function browserReady() { return typeof window.AtlasSemantic?.search === "function" || typeof window.AtlasSemantic?.embed === "function"; }
function setEngine(engine, note = "") {
  activeEngine = engine;
  document.body.dataset.engine = engine;
  for (const card of document.querySelectorAll(".how-engine")) {
    const kind = card.dataset.engine;
    const selected = kind === engine;
    card.classList.toggle("is-active", selected);
    card.querySelector(".how-engine-badge").textContent = selected ? "Active here" : kind === "keyword" ? "Fallback ready" : kind === "server" ? (health.ready ? "Ready" : "Not ready") : browserReady() ? "Available" : browserRequested() ? "Enabled · not loaded" : "Not enabled";
  }
  $("#engine-status").textContent = `${engineNames[engine]} is active on this page.${note ? ` ${note}` : ""}`;
}
async function checkEngine() {
  const result = await optionalJSON("api/health");
  health = result && result.ready === true ? result : { ready: false, n: 0 };
  setEngine(health.ready ? "server" : browserReady() ? "browser" : "keyword");
}

function drawPipeline() {
  if (!data) return;
  const counts = data.meta.counts || stats?.counts || {};
  const scale = data.meta.rating_scale;
  const nodes = [
    ["OpenReview", "Public ICLR 2027 venue", "Logged-in browser session"],
    ["Score", `${scale?.min ?? 1}–${scale?.max ?? 4} ratings · ordered by mean score`, `${num(stats?.n_reviews)} submitted reviews`],
    ["Research taxonomy", `${num(tax.majors.length)} areas · ${num(tax.fineById.size)} sub-topics`, "One major · up to three fine tags"],
    ["GPU embeddings", "bge-base · RTX GPU", "Title + paper text → vectors"],
    ["Map & neighbors", "UMAP map · 10-NN graph", `${num(clusters?.clusters?.length ?? new Set(data.papers.filter(p => p.cl != null).map(p => p.cl)).size)} clusters`],
    ["AI fact sheets", "Claude · Codex · Kimi · Gemini", "Validated + sampled blind QA"],
    ["Static site", `${num(Object.values(counts).reduce((a, b) => a + Number(b), 0) || data.papers.length)} searchable records`, "HTML + CSS + ES modules"],
    ["GitHub Pages", "Public metadata & fact sheets", "No redistributed review text"],
  ];
  const mobile = matchMedia("(max-width: 640px)").matches;
  const positions = nodes.map((_, i) => mobile ? [16, 16 + i * 132] : [18 + (i < 4 ? i : 7 - i) * 270, i < 4 ? 18 : 193]);
  const w = mobile ? 322 : 240, h = 108;
  const lines = positions.slice(1).map(([x, y], i) => {
    const [px, py] = positions[i];
    let path;
    if (mobile || i === 3) path = `M${px + w / 2},${py + h} V${y - 6}`;
    else if (i < 3) path = `M${px + w},${py + h / 2} H${x - 6}`;
    else path = `M${px},${py + h / 2} H${x + w + 6}`;
    return `<path class="how-pipe-line" d="${path}" marker-end="url(#how-arrow)"/>`;
  }).join("");
  $("#pipeline-svg").innerHTML = `<svg viewBox="0 0 ${mobile ? 354 : 1086} ${mobile ? 1060 : 320}" role="img" aria-labelledby="pipe-title pipe-desc"><title id="pipe-title">The Atlas data pipeline</title><desc id="pipe-desc">${esc(nodes.map((n, i) => `${i + 1}. ${n.join(": ")}`).join(". "))}</desc><defs><marker id="how-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L6 3 L0 6" fill="var(--accent)"/></marker></defs>${lines}${nodes.map(([title, a, b], i) => `<g class="how-node" transform="translate(${positions[i].join(",")})"><rect width="${w}" height="${h}" rx="4"/><text class="node-number" x="14" y="22">${String(i + 1).padStart(2, "0")}</text><text class="node-title" x="14" y="47">${esc(title)}</text><text class="node-copy" x="14" y="70">${esc(a)}</text><text class="node-copy" x="14" y="89">${esc(b)}</text></g>`).join("")}</svg>`;
}
for (const flow of document.querySelectorAll("[data-flow]")) {
  flow.innerHTML = `<svg viewBox="0 0 286 44" aria-hidden="true">${flow.dataset.flow.split("|").map((label, i) => `<rect x="${i * 99 + 1}" y="3" width="85" height="37" rx="3"/><text x="${i * 99 + 43}" y="26" text-anchor="middle">${esc(label)}</text>${i < 2 ? `<path d="M${i * 99 + 88} 22 h10 m-4 -3 l4 3 -4 3"/>` : ""}`).join("")}</svg>`;
}
matchMedia("(max-width: 640px)").addEventListener("change", drawPipeline);

function shardFile(file) {
  return typeof file === "string" && /^[a-zA-Z0-9_.-]+$/.test(file) && !file.includes("..") ? file : null;
}
function bytes(n) { return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KiB` : `${(n / 1024 / 1024).toFixed(2)} MiB`; }
function setShardState(major, state) {
  const card = shardCards.get(major);
  if (!card) return;
  card.dataset.state = state;
  card.querySelector(".how-shard-state").textContent = { github: "On GitHub", fetching: "Fetching…", memory: "In memory", failed: "Fetch unavailable" }[state];
}
function renderRepository() {
  const grid = $("#shard-grid");
  if (!meta || !meta.shards || !Number.isInteger(meta.dims) || meta.dims <= 0 || !Object.keys(meta.shards).length) {
    meta = null;
    $("#embed-summary").textContent = "Awaiting the embedding export";
    grid.innerHTML = '<div class="how-unpublished"><h3>Embeddings not published yet.</h3><p>The area shards will appear here when the exporter publishes <code>data/embed/meta.json</code>. You can still run the live demo with the GPU server or keyword search.</p></div>';
    $("#shard-note").textContent = "No browser vectors have been downloaded. Reload after publication to see the files.";
    return;
  }
  $("#embed-summary").textContent = `${meta.model || "EmbeddingGemma"} · ${num(meta.dims)} dimensions · int8`;
  grid.replaceChildren();
  for (const [major, shard] of Object.entries(meta.shards)) {
    const file = shardFile(shard.file);
    if (!file || !Number.isInteger(shard.n) || shard.n < 0) continue;
    const area = tax.major(major), size = shard.n * meta.dims;
    const card = document.createElement("article");
    card.className = "how-shard";
    card.dataset.state = "github";
    card.dataset.major = major;
    card.style.setProperty("--area-color", /^#[a-fA-F0-9]{3,8}$/.test(area.color) ? area.color : "var(--rule-2)");
    // The GitHub link is the one intentional external URL required by the brief.
    card.innerHTML = `<h3>${esc(area.name)}</h3><code>${esc(file)}</code><div class="how-shard-meta"><span>${num(shard.n)} papers</span><span>${num(meta.dims)} dims</span><span title="Derived: paper count × dimensions × one byte per int8 value">${bytes(size)} · derived</span></div><div class="how-shard-bottom"><span class="how-shard-state">On GitHub</span><span class="how-shard-links">${REPO ? `<a href="https://github.com/${REPO}/blob/main/data/embed/${encodeURIComponent(file)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ""}<a href="data/embed/${encodeURIComponent(file)}">Raw file ↗</a></span></div>`;
    grid.append(card);
    shardCards.set(major, card);
  }
  $("#shard-note").textContent = "Sizes are derived from n × dimensions bytes (int8). A browser run marks actual downloads; server and keyword runs do not fetch these shards.";
}
async function fetchShards() {
  if (!meta) throw new Error("Browser embeddings are not published yet.");
  const entries = Object.entries(meta.shards);
  let next = 0;
  // Four simultaneous downloads keep the network and UI responsive.
  const transfers = await Promise.allSettled(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (next < entries.length) {
      const [major, shard] = entries[next++];
      if (shardBuffers.has(major)) { setShardState(major, "memory"); continue; }
      const file = shardFile(shard.file);
      if (!file) throw new Error("The shard manifest contains an invalid file name.");
      setShardState(major, "fetching");
      const r = await resource(`data/embed/${encodeURIComponent(file)}`, "buffer", 60000);
      if (!r.ok || r.data.byteLength !== shard.n * meta.dims || shard.ids?.length !== shard.n) {
        setShardState(major, "failed");
        throw new Error("A browser vector shard is unavailable or incomplete.");
      }
      shardBuffers.set(major, new Int8Array(r.data));
      setShardState(major, "memory");
    }
  }));
  const failed = transfers.find(r => r.status === "rejected");
  if (failed) throw failed.reason;
}

function step(name, title, detail, timing = "—", state = "done") {
  const el = $(`[data-step="${name}"]`);
  el.dataset.state = state;
  el.querySelector("b").textContent = title;
  el.querySelector("p").textContent = detail;
  el.querySelector("output").textContent = timing;
}
function showVector(raw) {
  const values = raw?.data || raw?.vector || raw?.embedding || raw;
  const vector = Array.from(values || []).flat();
  if (!vector.length || !vector.every(Number.isFinite)) return null;
  const strip = $("#vector-strip");
  const first = vector.slice(0, 16), max = Math.max(...first.map(Math.abs), 1e-8);
  strip.innerHTML = first.map((v, i) => `<i class="${v < 0 ? "negative" : "positive"}" style="height:${Math.max(1, Math.abs(v) / max * 16)}px" title="Dimension ${i + 1}: ${v.toFixed(5)}"></i>`).join("");
  // Centre each signed bar on zero; colour also distinguishes the sign.
  [...strip.children].forEach((bar, i) => bar.style.transform = `translateY(${(first[i] < 0 ? 1 : -1) * Math.abs(first[i]) / max * 8}px)`);
  strip.hidden = false;
  strip.setAttribute("role", "img");
  strip.setAttribute("aria-label", `First ${first.length} query dimensions: ${first.map(v => v.toFixed(3)).join(", ")}`);
  return vector;
}
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const STOP = new Set("a an the of for and in on to with via from by is are be as at or we our this that these its into using use based towards toward through over under without new novel model models method methods approach learning".split(" "));
function tokens(s) {
  return (String(s || "").toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || []).flatMap(w => w.includes("-") ? [w, ...w.split("-")] : [w]).filter(w => !STOP.has(w)).map(w => w.length > 4 && w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
}
async function runKeyword(q) {
  let start = performance.now();
  const terms = [...new Set(tokens(q))];
  step("query", "Query → terms", `${terms.length} terms; this engine does not create an embedding.`, ms(performance.now() - start));
  step("shards", "Paper index", "Preparing title, keyword, TL;DR, and category fields; no vector shards.", "…", "running");
  await nextFrame();
  start = performance.now();
  const cached = !!keywordDocs;
  if (!keywordDocs) {
    keywordDocs = [];
    for (let i = 0; i < data.papers.length; i++) {
      const p = data.papers[i];
      keywordDocs.push({ p, f: [new Set(tokens(p.t)), new Set(tokens((p.kw || []).join(" "))), new Set(tokens(p.tl)), new Set(tokens(p.fine.map(f => tax.fine(f).name).join(" ") + " " + (p.pa || "")))] });
      if (i && i % 3000 === 0) await nextFrame();
    }
  }
  step("shards", "Paper index in memory", `${num(data.papers.length)} metadata records; ${cached ? "reused the term index" : "built the term index"}. No vector downloads.`, ms(performance.now() - start));
  step("score", "Weight the terms", `Searching ${num(data.meta.counts?.active)} active papers.`, "…", "running");
  await nextFrame();
  start = performance.now();
  const weights = [3, 2, 1.5, 1], N = keywordDocs.length;
  const idf = new Map(terms.map(t => [t, Math.log(1 + N / (1 + keywordDocs.reduce((n, d) => n + Number(d.f.some(f => f.has(t))), 0)))]));
  const results = [];
  for (const d of keywordDocs) {
    if (d.p.s !== "active") continue;
    let score = 0, hit = 0;
    for (const t of terms) {
      const weight = d.f.reduce((sum, f, i) => sum + (f.has(t) ? weights[i] : 0), 0);
      if (weight) { hit++; score += weight * idf.get(t); }
    }
    if (!hit || hit < Math.ceil(terms.length / 2)) continue;
    score *= hit / terms.length;
    if (q.length > 6 && d.p.t.toLowerCase().includes(q.toLowerCase())) score *= 1.5;
    results.push({ ...d.p, score });
  }
  results.sort((a, b) => b.score - a.score || (b.r ?? 0) - (a.r ?? 0));
  step("score", "Term-weight ranking", `${num(data.meta.counts?.active ?? keywordDocs.filter(d => d.p.s === "active").length)} active papers; ${num(results.length)} matches.`, ms(performance.now() - start));
  return results.slice(0, 10);
}
async function runServer(q) {
  step("query", "Query → bge vector", "The GPU embeds the query. The API does not expose the vector or a separate embedding time.", "combined");
  step("shards", "Vectors on the GPU", "0 browser shards fetched. The server already holds its bge-base vectors.", "no transfer");
  step("score", "GPU similarity", `Comparing against ${num(health.n)} indexed papers, returning active submissions.`, "…", "running");
  const r = await resource(`api/search?${new URLSearchParams({ q, k: "10", status: "active" })}`, "json", 30000);
  if (!r.ok || !Array.isArray(r.data?.results)) throw new Error("The server search is unavailable.");
  step("score", "Embed + rank on GPU", `Similarity over ${num(health.n)} indexed papers plus lexical reranking. API reports combined compute time.`, Number.isFinite(r.data.took_ms) ? ms(r.data.took_ms) : "not exposed");
  return r.data.results;
}

async function prepareBrowser() {
  if (browserReady()) return true;
  if (!browserRequested() || !meta) return false;
  const available = await resource("assets/js/core/gemma-search.js", "head");
  if (!available.ok) return false;
  browserModule = await import("../core/gemma-search.js");
  if (typeof browserModule.enableGemma === "function") {
    await browserModule.enableGemma(() => { $("#demo-status").textContent = "Loading the browser model using your saved semantic-search preference…"; });
  }
  if (!browserReady() && typeof browserModule.gemmaSearch === "function") {
    window.AtlasSemantic = { search: (q, k) => browserModule.gemmaSearch(q, { k, status: "active" }) };
  }
  return browserReady();
}
async function runBrowser(q) {
  const semantic = window.AtlasSemantic;
  if (!semantic) throw new Error("The browser runtime is unavailable.");
  if (typeof semantic.embed === "function" && meta) {
    step("query", "Query → Gemma vector", "Embedding the query on this device…", "…", "running");
    let start = performance.now();
    const vector = showVector(await semantic.embed(q));
    if (!vector || vector.length < meta.dims) throw new Error("The query vector does not match the published dimensions.");
    step("query", "Query → Gemma vector", `First 16 dimensions below. Search uses ${num(meta.dims)} dimensions.`, ms(performance.now() - start));
    const query = vector.slice(0, meta.dims), norm = Math.hypot(...query);
    if (!norm) throw new Error("The query vector is empty.");
    query.forEach((v, i) => { query[i] = v / norm; });
    step("shards", "Fetch vector shards", "Loading published area files; the repository boxes track each request.", "…", "running");
    start = performance.now();
    await fetchShards();
    const compared = Object.values(meta.shards).reduce((n, s) => n + s.n, 0);
    step("shards", "Vector shards in memory", `${num(shardBuffers.size)} area files, ${num(compared)} paper vectors. Repeated queries reuse them.`, ms(performance.now() - start));
    step("score", "Dot-product similarity", `Comparing ${num(compared)} vectors…`, "…", "running");
    await nextFrame();
    start = performance.now();
    const matches = [];
    for (const [major, shard] of Object.entries(meta.shards)) {
      const matrix = shardBuffers.get(major);
      for (let i = 0; i < shard.n; i++) {
        let score = 0;
        for (let d = 0; d < meta.dims; d++) score += query[d] * matrix[i * meta.dims + d];
        const p = data.byId.get(shard.ids[i]);
        if (p?.s === "active") matches.push({ ...p, score: score * (Number(meta.scale) || 1) });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    step("score", "Dot-product similarity", `${num(compared)} paper vectors; results include active submissions.`, ms(performance.now() - start));
    return matches.slice(0, 10);
  }
  if (typeof semantic.search !== "function") throw new Error("The browser runtime has no search interface.");
  step("query", "Query → Gemma vector", "The browser runtime keeps its vector private; no dimensions or separate embedding time are exposed.", "combined");
  step("shards", "Runtime-managed shards", "Tracking actual shard fetches made by the browser runtime.", "…", "running");
  // A search-only runtime owns retrieval. Observe just its matching fetches during
  // this call and restore fetch afterward; never invent loading transitions.
  const originalFetch = window.fetch;
  const observed = [];
  const watched = new Map(Object.entries(meta?.shards || {}).map(([major, s]) => [new URL(`data/embed/${s.file}`, document.baseURI).href, major]));
  window.fetch = async function(input, init) {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url, document.baseURI).href;
    const major = watched.get(url);
    if (!major) return originalFetch.call(this, input, init);
    setShardState(major, "fetching");
    try {
      const response = await originalFetch.call(this, input, init);
      const tracked = response.ok ? response.clone().arrayBuffer().then(buffer => {
        shardBuffers.set(major, new Int8Array(buffer)); setShardState(major, "memory");
      }).catch(() => setShardState(major, "failed")) : Promise.resolve(setShardState(major, "failed"));
      observed.push(tracked);
      return response;
    } catch (error) { setShardState(major, "failed"); throw error; }
  };
  const start = performance.now();
  let result;
  try { result = await semantic.search(q, 10); await Promise.all(observed); }
  finally { window.fetch = originalFetch; }
  const results = Array.isArray(result) ? result : result?.results;
  if (!Array.isArray(results)) throw new Error("The browser runtime returned no result list.");
  step("shards", "Runtime-managed shards", observed.length ? `${num(observed.length)} observed shard downloads completed.` : "No new shard requests observed; the runtime may reuse cached vectors or load them in a worker.", "included");
  step("score", "Browser search", `Embedding + retrieval measured together. ${result?.n != null ? `${num(result.n)} papers compared.` : "The runtime does not expose the number of vectors compared."}`, ms(performance.now() - start));
  return results;
}
function renderResults(results, q) {
  const list = results.map(r => ({ ...r, ...(data.byId.get(r.id) || {}) })).filter(p => p.s === "active" || p.st === "active").slice(0, 10);
  $("#demo-results").innerHTML = list.map(p => `<li class="how-result"><div><a href="search.html#q=${encodeURIComponent(p.t || p.id)}">${esc(p.t || p.id)}</a><div class="how-result-sub">#${esc(p.n)} · ${esc(tax.major(p.maj).name)}</div></div><div class="how-result-score"><b>${p.r != null ? Number(p.r).toFixed(2) : "—"}</b> mean<div class="how-score-stats"> · ${num(p.nr ?? p.rs?.length)} reviews · σ ${p.sd != null ? Number(p.sd).toFixed(2) : "—"}</div></div></li>`).join("");
  $("#results-empty").hidden = !!list.length;
  $("#results-empty").textContent = "No matching active papers. Try a broader query or fewer terms.";
  $("#full-search").href = `search.html#q=${encodeURIComponent(q)}`;
  $("#full-search").hidden = false;
  return list.length;
}
$("#demo-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const q = $("#demo-query").value.trim();
  if (!q || !data || $("#demo-run").disabled) return;
  $("#demo-run").disabled = true;
  $("#demo-form").setAttribute("aria-busy", "true");
  $("#demo-results").replaceChildren();
  $("#vector-strip").hidden = true;
  $("#full-search").hidden = true;
  $("#results-empty").hidden = false;
  $("#results-empty").textContent = "Tracing your query…";
  for (const li of document.querySelectorAll(".how-trace li")) { li.dataset.state = "waiting"; li.querySelector("output").textContent = "—"; }
  const total = performance.now();
  delete $("#demo-status").dataset.complete;
  let fallback = "";
  try {
    $("#demo-status").textContent = "Checking current engine availability…";
    await checkEngine();
    let results;
    if (health.ready) {
      try { results = await runServer(q); }
      catch { health.ready = false; fallback = "Server search failed. "; }
    }
    if (!results) {
      try {
        if (await prepareBrowser()) { setEngine("browser"); results = await runBrowser(q); }
        else if (browserRequested()) fallback += "Browser semantic search is enabled but is not available here. ";
      } catch { fallback += "Browser semantic search could not finish. "; }
    }
    if (!results) {
      $("#vector-strip").hidden = true;
      setEngine("keyword", fallback);
      results = await runKeyword(q);
    }
    const renderStart = performance.now();
    const count = renderResults(results, q);
    step("results", `Top ${count} results`, "Mean rating, review count and standard deviation. Open a title in Search.", ms(performance.now() - renderStart));
    $("#demo-status").textContent = `${fallback}${engineNames[activeEngine]} trace complete · ${ms(performance.now() - total)} elapsed, including availability checks, transfers, and rendering. ${count} results.`;
    $("#demo-status").dataset.complete = "true";
  } catch (error) {
    $("#demo-status").textContent = `The trace could not finish: ${error.message} Try again.`;
    $("#results-empty").textContent = "No results available for this run.";
  } finally {
    $("#demo-run").disabled = false;
    $("#demo-form").removeAttribute("aria-busy");
  }
});

async function init() {
  const loaded = await Promise.all([loadPapers(), loadTaxonomy(), optionalJSON("data/stats.json"), optionalJSON("data/clusters.json"), optionalJSON("data/embed/meta.json"), checkEngine()]);
  [data, tax, stats, clusters, meta] = loaded;
  const counts = data.meta.counts || stats?.counts || {};
  const total = Object.values(counts).reduce((a, b) => a + Number(b), 0) || data.papers.length;
  const factsheets = data.papers.filter(p => p.fs).length;
  const counters = [["Paper records", total], ["Active submissions", counts.active ?? data.papers.filter(p => p.s === "active").length], ["Research areas", tax.majors.length], ["AI fact sheets", factsheets]];
  $("#live-counts").innerHTML = counters.map(([label, value]) => `<div><dt>${label}</dt><dd>${num(value)}</dd></div>`).join("");
  $("#data-note").textContent = `Live snapshot: ${data.meta.generated ? new Date(data.meta.generated).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "timestamp unavailable"} · ${num(counts.withdrawn)} withdrawn · ${num(counts.desk_rejected)} desk-rejected. Counts include retained records.`;
  $("#rating-scale").textContent = `${data.meta.rating_scale?.min ?? 1}–${data.meta.rating_scale?.max ?? 4}`;
  drawPipeline();
  renderRepository();
  $("#demo-run").disabled = false;
  $("#demo-status").textContent = `${engineNames[activeEngine]} ready. Run a query to see its trace.`;
  document.body.dataset.ready = "true";
}
window.addEventListener("storage", () => { if (!health.ready) setEngine(browserReady() ? "browser" : "keyword"); });
init().catch(() => {
  $("#data-note").textContent = "The paper index could not load. Reload the page when the site data is available.";
  $("#demo-status").textContent = "The live demo needs data/papers.json and the taxonomy. The explanatory sections remain readable.";
});
