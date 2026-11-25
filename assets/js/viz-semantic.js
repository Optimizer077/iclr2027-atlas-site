// Topic queries for the viz pages: semantic (same-origin api/search via core/search.js) with a keyword
// fallback when the API is unreachable (static hosting such as GitHub Pages).
import { searchAvailable, semanticSearch, searchStatus, onSearchStatus } from "./core/search.js";

export { searchAvailable, searchStatus, onSearchStatus };

/**
 * @param {string} q
 * @param {{k:number, status:string, mode:"sem"|"kw", data:{papers:any[], byId:Map}}} opt
 * @returns {Promise<{mode:"sem"|"kw", q:string, items:{p:any, s:number, sem?:number, lex?:number}[], took:number, note:string}>}
 */
export async function runQuery(q, { k = 200, status = "active", mode = "sem", data }) {
  const qq = String(q || "").trim();
  if (!qq) return { mode, q: qq, items: [], took: 0, note: "" };
  let note = "";
  if (mode === "sem") {
    if (await searchAvailable()) {
      const t0 = performance.now();
      try {
        const r = await semanticSearch(qq, { k, status });
        const items = [];
        for (const h of r.results || []) {
          const p = data.byId.get(h.id);
          if (p) items.push({ p, s: h.s ?? h.sem ?? 0, sem: h.sem, lex: h.lex });
        }
        return { mode: "sem", q: qq, items, took: r.took_ms ?? Math.round(performance.now() - t0), note };
      } catch (e) {
        note = `Semantic search failed (${String(e.message || e).slice(0, 80)}); showing keyword matches.`;
      }
    } else note = "Semantic search needs the local API; showing keyword matches.";
  }
  return { ...keywordQuery(qq, { k, status, data }), note };
}

/** Substring match on title, keywords, TL;DR, number and id; ranked by global rank then mean rating. */
export function keywordQuery(q, { k = Infinity, status = "active", data }) {
  const t0 = performance.now();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];
  for (const p of data.papers) {
    if (status !== "all" && p.s !== status) continue;
    const s = p._q || "";
    let ok = true;
    for (const t of terms) if (s.indexOf(t) < 0) { ok = false; break; }
    if (ok) hits.push(p);
  }
  hits.sort((a, b) => (a.rk ?? 1e9) - (b.rk ?? 1e9) || (b.r ?? -1) - (a.r ?? -1) || a.n - b.n);
  const items = (Number.isFinite(k) ? hits.slice(0, k) : hits).map((p) => ({ p, s: 1 }));
  return { mode: "kw", q, items, total: hits.length, took: Math.round(performance.now() - t0) };
}

/** Robust bounds of a set of points: 4th–96th percentile box, padded, never smaller than minSpan. */
export function robustBounds(xs, ys, minSpan = 0.25) {
  const n = xs.length;
  if (!n) return null;
  const sx = Float64Array.from(xs).sort(), sy = Float64Array.from(ys).sort();
  const q = (a, f) => a[Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))))];
  const lo = n >= 12 ? 0.04 : 0, hi = n >= 12 ? 0.96 : 1;
  let x0 = q(sx, lo), x1 = q(sx, hi), y0 = q(sy, lo), y1 = q(sy, hi);
  const px = Math.max((x1 - x0) * 0.18, minSpan / 2 - (x1 - x0) / 2), py = Math.max((y1 - y0) * 0.18, minSpan / 2 - (y1 - y0) / 2);
  x0 -= px; x1 += px; y0 -= py; y1 += py;
  return [x0, y0, x1, y1];
}
