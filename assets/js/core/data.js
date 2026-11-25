// Data access layer for the contract in plan/data_contract.md.
// The data folder comes from ?data=<folder> (default "data"), relative to site/.

import { setScale } from "./scale.js";

const params = new URLSearchParams(location.search);

function safeFolder(s) {
  if (!s) return null;
  if (!/^[A-Za-z0-9_\-./]+$/.test(s) || s.includes("..") || s.startsWith("/")) return null;
  return s.replace(/\/+$/, "");
}

export const DATA_DIR = safeFolder(params.get("data")) || "data";
export const IS_DEFAULT_DATA = DATA_DIR === "data";
export const dataUrl = (path) => `${DATA_DIR}/${path}`;

/** Link to another page of the site, keeping ?data= and adding an optional hash. */
export function pageHref(page, hash = "") {
  const q = IS_DEFAULT_DATA ? "" : `?data=${encodeURIComponent(DATA_DIR)}`;
  return `${page}${q}${hash ? (hash.startsWith("#") ? hash : `#${hash}`) : ""}`;
}

export const forumUrl = (id) => `https://openreview.net/forum?id=${encodeURIComponent(id)}`;
export const orPdfUrl = (id) => `https://openreview.net/pdf?id=${encodeURIComponent(id)}`;
export const localPdfUrl = (pdf) => (pdf ? `../${pdf.split("/").map(encodeURIComponent).join("/")}` : null);

const jsonCache = new Map();

export class HttpError extends Error {
  constructor(url, status) { super(`${status} for ${url}`); this.status = status; this.url = url; }
}

/** Fetch JSON (memoised). optional=true resolves to null on 404 instead of throwing. */
export function fetchJSON(path, { optional = false, fresh = false } = {}) {
  const url = dataUrl(path);
  if (!fresh && jsonCache.has(url)) return jsonCache.get(url);
  const p = fetch(url, fresh ? { cache: "no-store" } : {}).then(async (r) => {
    if (!r.ok) {
      if (optional && (r.status === 404 || r.status === 403)) return null;
      throw new HttpError(url, r.status);
    }
    return r.json();
  }).catch((e) => {
    if (optional && !(e instanceof HttpError)) return null;
    jsonCache.delete(url);
    throw e;
  });
  if (!fresh) jsonCache.set(url, p);
  return p;
}

export async function fetchText(url, { fresh = true } = {}) {
  const r = await fetch(url, fresh ? { cache: "no-store" } : {});
  if (!r.ok) throw new HttpError(url, r.status);
  return r.text();
}

/** Fetch a large JSON with byte-level progress (Content-Length when available). */
async function fetchJSONProgress(path, onProgress) {
  const url = dataUrl(path);
  const r = await fetch(url);
  if (!r.ok) throw new HttpError(url, r.status);
  const total = Number(r.headers.get("content-length")) || 0;
  if (!r.body || !r.body.getReader) return r.json();
  const reader = r.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress?.(got, total);
  }
  const buf = new Uint8Array(got);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return JSON.parse(new TextDecoder("utf-8").decode(buf));
}

let papersPromise = null;

/**
 * Load papers.json and prepare derived fields used everywhere:
 *   _q   lowercase search string (title, keywords, TL;DR, number, id)
 *   _i   index in the papers array
 */
export function loadPapers(onProgress) {
  if (papersPromise) return papersPromise;
  papersPromise = Promise.all([fetchJSONProgress("papers.json", onProgress), loadTaxonomy()]).then(([meta, tax]) => {
    const papers = Array.isArray(meta.papers) ? meta.papers : [];
    const byId = new Map();
    let maxSd = 0;
    papers.forEach((p, i) => {
      p._i = i;
      p.kw = Array.isArray(p.kw) ? p.kw : [];
      p.fine = Array.isArray(p.fine) ? p.fine : [];
      p.rs = Array.isArray(p.rs) ? p.rs : [];
      const cats = `${tax.major(p.maj).name} ${p.fine.map((f) => tax.fine(f).name).join(" ")}`;
      p._q = `${p.t || ""} \u0001${p.kw.join(" ")} \u0001${p.tl || ""} \u0001${cats} \u0001${p.pa || ""} \u0001#${p.n} ${p.id}`.toLowerCase();
      if (p.sd != null && p.sd > maxSd) maxSd = p.sd;
      byId.set(p.id, p);
    });
    setScale(meta.rating_scale);
    return { meta, papers, byId, maxSd: Math.max(0.5, Math.ceil(maxSd * 2) / 2) };
  });
  return papersPromise;
}

let taxPromise = null;

/** Taxonomy with lookup maps. Unknown ids fall back to a neutral placeholder. */
export function loadTaxonomy() {
  if (taxPromise) return taxPromise;
  taxPromise = fetchJSON("taxonomy.json", { optional: true }).then((t) => {
    const majors = (t && t.majors) || [];
    const majorById = new Map();
    const fineById = new Map();
    majors.forEach((m, i) => {
      m._i = i;
      m.fine = m.fine || [];
      majorById.set(m.id, m);
      for (const f of m.fine) { f.maj = m.id; fineById.set(f.id, f); }
    });
    const major = (id) => majorById.get(id) || { id, name: id || "Uncategorized", color: "#8a8578", fine: [], _i: 999 };
    const fine = (id) => fineById.get(id) || { id, name: prettyFine(id), maj: (id || "").split(".")[0] };
    return { version: t?.version, majors, majorById, fineById, major, fine };
  });
  return taxPromise;
}

function prettyFine(id) {
  if (!id) return "—";
  const leaf = id.includes(".") ? id.slice(id.indexOf(".") + 1) : id;
  return leaf.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const loadStats = () => fetchJSON("stats.json", { optional: true });
export const loadClusters = () => fetchJSON("clusters.json", { optional: true }).then((c) => (c && c.clusters) || []);

export const shardOf = (n) => String(Math.floor(n / 1000)).padStart(2, "0");

const shardMiss = new Map(); // kind -> number of 404s (stop probing a kind that never exists)
const shardHit = new Set();

/**
 * Load one whole shard file: kind ∈ abstracts | factsheets | reviews | neighbors, number = submission number.
 * Resolves to {} when the shard does not exist (e.g. reviews/ is local-only).
 */
export async function loadShard(kind, number) {
  if (number == null) return {};
  if (!shardHit.has(kind) && (shardMiss.get(kind) || 0) >= 3) return {};
  const obj = await fetchJSON(`${kind}/${shardOf(number)}.json`, { optional: true }).catch(() => null);
  if (obj) shardHit.add(kind); else shardMiss.set(kind, (shardMiss.get(kind) || 0) + 1);
  return obj || {};
}

/** One paper's entry from its shard, or null. */
export async function loadShardEntry(kind, paper) {
  if (!paper || paper.n == null) return null;
  const shard = await loadShard(kind, paper.n);
  return shard[paper.id] ?? null;
}
