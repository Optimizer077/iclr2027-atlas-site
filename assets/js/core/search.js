// Client for the same-origin semantic search API (scripts/serve_site.py):
//   GET api/health → {ok, ready, n}
//   GET api/search?q=&k=&status=active|all|withdrawn|desk_rejected → {q, mode, took_ms, results:[{id, s, sem, lex}]}
//   GET api/similar?id=&k=&status= → {id, mode, results:[...]}
// URLs are relative so the API works behind the tunnel. On static hosting (GitHub Pages) health
// fails once, the result is cached, and callers fall back to keyword search.

import { DATA_DIR, IS_DEFAULT_DATA } from "./data.js";

const state = { checked: false, available: false, ready: false, loading: false, n: 0, error: null };
const listeners = new Set();
let healthP = null;
let retries = 0;

const emit = () => listeners.forEach((fn) => fn({ ...state }));
export const searchStatus = () => ({ ...state });
export function onSearchStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }

async function probe() {
  try {
    const r = await fetch("api/health", { cache: "no-store" });
    if (!r.ok) throw new Error(`health ${r.status}`);
    const j = await r.json();
    Object.assign(state, { checked: true, available: !!j.ready, ready: !!j.ready, loading: !j.ready && !j.error, n: j.n || 0, error: j.error || null });
    if (state.loading && retries++ < 20) setTimeout(() => { healthP = probe(); }, 3000);
  } catch (e) {
    Object.assign(state, { checked: true, available: false, ready: false, loading: false, error: String(e.message || e) });
  }
  emit();
  return state.available;
}

/** Resolves to true when the semantic API is up and its engine is ready (checked once, cached).
 *  The API indexes site/data/, so it is treated as unavailable when a page uses another ?data= folder. */
export function searchAvailable({ refresh = false } = {}) {
  if (!IS_DEFAULT_DATA) {
    Object.assign(state, { checked: true, available: false, ready: false, loading: false, error: `API indexes data/, page uses ${DATA_DIR}/` });
    return Promise.resolve(false);
  }
  if (!healthP || refresh) healthP = probe();
  return healthP;
}

const cache = new Map();
function cached(key, make) {
  if (cache.has(key)) return cache.get(key);
  const p = make().catch((e) => { cache.delete(key); throw e; });
  cache.set(key, p);
  if (cache.size > 80) cache.delete(cache.keys().next().value);
  return p;
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url.split("?")[0]} → ${r.status}`);
  return r.json();
}

/** Semantic (hybrid) search. Returns {q, took_ms, results:[{id, s, sem, lex}]}. */
export function semanticSearch(q, { k = 200, status = "active" } = {}) {
  const qq = String(q || "").trim();
  if (!qq) return Promise.resolve({ q: qq, results: [], took_ms: 0 });
  const st = status || "all";
  return cached(`s|${qq}|${k}|${st}`, () => getJSON(`api/search?q=${encodeURIComponent(qq)}&k=${k}&status=${encodeURIComponent(st)}`));
}

/** Papers most similar to one paper (excluding itself). Returns [{id, s, sem, lex}]. */
export function similarPapers(id, { k = 50, status = "active" } = {}) {
  return cached(`m|${id}|${k}|${status}`, () => getJSON(`api/similar?id=${encodeURIComponent(id)}&k=${k + 1}&status=${encodeURIComponent(status || "all")}`))
    .then((j) => (j.results || []).filter((r) => r.id !== id).slice(0, k));
}
