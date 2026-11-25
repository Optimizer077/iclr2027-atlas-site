// Explorer filter state <-> URL hash, matching, facet counts and pre-sorted orders.
import { inList, STARRED } from "./store.js";

/** Sort ids → [key, direction]; nulls always sort last. */
export const SORT_DEF = {
  rel: ["r", -1], r: ["r", -1], r_asc: ["r", 1], cw: ["cw", -1], cw_asc: ["cw", 1], rk: ["rk", 1], rk_desc: ["rk", -1],
  sd_desc: ["sd", -1], sd_asc: ["sd", 1], nr: ["nr", -1], nr_asc: ["nr", 1], cf: ["cf", -1],
  n: ["n", 1], n_desc: ["n", -1], t: ["t", 1], t_desc: ["t", -1],
};
export const SORTS = [
  { id: "rel", label: "Relevance (semantic search)" },
  { id: "r", label: "Mean rating (high → low)" },
  { id: "r_asc", label: "Mean rating (low → high)" },
  { id: "cw", label: "Confidence-weighted rating" },
  { id: "rk", label: "Rank (best first)" },
  { id: "sd_desc", label: "Most controversial (std ↓)" },
  { id: "sd_asc", label: "Most agreed (std ↑)" },
  { id: "nr", label: "Number of reviews" },
  { id: "cf", label: "Reviewer confidence" },
  { id: "n", label: "Submission number" },
  { id: "n_desc", label: "Submission number (newest)" },
  { id: "t", label: "Title A → Z" },
  { id: "t_desc", label: "Title Z → A" },
  { id: "cw_asc", label: "Confidence-weighted (low → high)" },
  { id: "rk_desc", label: "Rank (worst first)" },
  { id: "nr_asc", label: "Number of reviews (fewest)" },
];
/** Column header → [primary sort, reversed sort]. */
export const COLUMN_SORTS = {
  rank: ["rk", "rk_desc"], paper: ["t", "t_desc"], ratings: ["nr", "nr_asc"], mean: ["r", "r_asc"],
  sd: ["sd_desc", "sd_asc"], cw: ["cw", "cw_asc"], num: ["n", "n_desc"],
};

let CFG = { maxSd: 5, rmin: 1, rmax: 10 };
export function configureFilters(cfg) { CFG = { ...CFG, ...cfg }; }
export const filterConfig = () => CFG;

export function defaults() {
  return { q: "", maj: "", fine: "", st: "active", pa: "", rmin: CFG.rmin, rmax: CFG.rmax, nr: 0, sdmin: 0, sdmax: CFG.maxSd,
    fs: false, pdf: false, list: "", sort: "r", open: "", mode: "" };
}

const num = (v, d) => { const x = parseFloat(v); return Number.isFinite(x) ? x : d; };

export function parseHash(hash) {
  const d = defaults();
  const sp = new URLSearchParams((hash || "").replace(/^#/, ""));
  const f = { ...d };
  if (sp.has("q")) f.q = sp.get("q");
  if (sp.has("maj")) f.maj = sp.get("maj");
  if (sp.has("fine")) { f.fine = sp.get("fine"); if (!f.maj && f.fine.includes(".")) f.maj = f.fine.split(".")[0]; }
  if (sp.has("st")) f.st = ["active", "withdrawn", "desk_rejected", "all"].includes(sp.get("st")) ? sp.get("st") : d.st;
  if (sp.has("pa")) f.pa = sp.get("pa");
  if (sp.has("r")) { const [a, b] = sp.get("r").split("~"); f.rmin = num(a, d.rmin); f.rmax = num(b, d.rmax); }
  if (sp.has("nr")) f.nr = Math.max(0, Math.round(num(sp.get("nr"), 0)));
  if (sp.has("sd")) { const [a, b] = sp.get("sd").split("~"); f.sdmin = num(a, 0); f.sdmax = num(b, d.sdmax); }
  f.fs = sp.get("fs") === "1";
  f.pdf = sp.get("pdf") === "1";
  f.list = sp.get("list") || (sp.get("star") === "1" ? STARRED : "");
  f.mode = ["sem", "kw"].includes(sp.get("mode")) ? sp.get("mode") : "";
  if (sp.has("sort") && SORT_DEF[sp.get("sort")]) f.sort = sp.get("sort");
  if (sp.has("open")) f.open = sp.get("open");
  return f;
}

export function toHash(f) {
  const d = defaults();
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.maj && !f.fine) sp.set("maj", f.maj);
  if (f.fine) sp.set("fine", f.fine);
  if (f.st !== d.st) sp.set("st", f.st);
  if (f.pa) sp.set("pa", f.pa);
  if (f.rmin > d.rmin || f.rmax < d.rmax) sp.set("r", `${f.rmin}~${f.rmax}`);
  if (f.nr) sp.set("nr", String(f.nr));
  if (f.sdmin > 0 || f.sdmax < d.sdmax) sp.set("sd", `${f.sdmin}~${f.sdmax}`);
  if (f.fs) sp.set("fs", "1");
  if (f.pdf) sp.set("pdf", "1");
  if (f.list) sp.set("list", f.list);
  if (f.q && f.mode) sp.set("mode", f.mode);
  if (f.sort !== d.sort) sp.set("sort", f.sort);
  if (f.open) sp.set("open", f.open);
  const s = sp.toString();
  return s ? `#${s}` : "";
}

export const terms = (q) => (q || "").toLowerCase().split(/\s+/).filter(Boolean);

/** Predicate for every filter except the category (for faceted counts). */
export function makeBaseMatcher(f, { skipText = false } = {}) {
  const t = skipText ? [] : terms(f.q);
  const useR = f.rmin > CFG.rmin || f.rmax < CFG.rmax;
  const useSd = f.sdmin > 0 || f.sdmax < CFG.maxSd;
  const eps = 1e-9;
  return (p) => {
    if (f.st !== "all" && p.s !== f.st) return false;
    if (f.pa && p.pa !== f.pa) return false;
    if (useR && (p.r == null || p.r < f.rmin - eps || p.r > f.rmax + eps)) return false;
    if (f.nr && (p.nr || 0) < f.nr) return false;
    if (useSd && (p.sd == null || p.sd < f.sdmin - eps || p.sd > f.sdmax + eps)) return false;
    if (f.fs && !p.fs) return false;
    if (f.pdf && !p.pdf) return false;
    if (f.list && !inList(f.list, p.id)) return false;
    for (let i = 0; i < t.length; i++) if (p._q.indexOf(t[i]) < 0) return false;
    return true;
  };
}

export const catMatch = (f, p) => (!f.maj || p.maj === f.maj) && (!f.fine || p.fine.includes(f.fine));

/* ---------- ordering ---------- */
const val = (p, k) => (k === "t" ? p._t : k === "nr" ? p.nr || 0 : p[k]);
function comparator(sort) {
  const [k, dir] = SORT_DEF[sort] || SORT_DEF.r;
  return (a, b) => {
    const va = val(a, k), vb = val(b, k);
    const na = va == null, nb = vb == null;
    if (na !== nb) return na ? 1 : -1;
    if (!na && va !== vb) return (va < vb ? -1 : 1) * dir;
    if (k !== "r" && (a.r ?? -1) !== (b.r ?? -1)) return (b.r ?? -1) - (a.r ?? -1);
    if ((a.cw ?? -1) !== (b.cw ?? -1)) return (b.cw ?? -1) - (a.cw ?? -1);
    return a.n - b.n;
  };
}
const orderCache = new Map();

/** Papers pre-sorted by a key (cached); filtering preserves the order, so no per-keystroke sort. */
export function ordered(papers, sort) {
  if (!orderCache.has(sort)) {
    if (sort.startsWith("t")) for (const p of papers) if (p._t == null) p._t = (p.t || "").toLowerCase();
    orderCache.set(sort, papers.slice().sort(comparator(sort)));
  }
  return orderCache.get(sort);
}
