// In-browser hybrid semantic + BM25 search powered by Google EmbeddingGemma
// (onnx-community/embeddinggemma-300m-ONNX, dtype: "q8") running in a dedicated Web Worker
// via @huggingface/transformers (loaded lazily from a pinned jsDelivr CDN URL — static edition only).
// Document embeddings are precomputed Matryoshka-256 int8 vectors sharded per major category
// under data/embed/<major>.i8.bin + data/embed/meta.json (cached via Cache API).
//
// Exports:
//   gemmaSupported()                    -> boolean
//   enableGemma(onProgress, opt)        -> Promise<stateSummary>
//   gemmaEmbed(q)                       -> Promise<Float32Array> (256-d unit-norm, LRU cached)
//   gemmaSearch(q, {k,status,maj,mode}) -> Promise<Array<PaperCard>> (default mode: "hybrid")
//   gemmaHybridSearch(q, opts)          -> Promise<Array<PaperCard>> (RRF k=60, semWeight>=kwWeight)
//   gemmaSemanticSearch(q, opts)        -> Promise<Array<PaperCard>> (pure EmbeddingGemma cosine)
//   gemmaKeywordSearch(q, opts)         -> Promise<Array<PaperCard>> (pure fielded BM25)
//   gemmaSimilar(id, {k,status,maj})    -> Promise<Array<PaperCard>>
//   gemmaState()                        -> snapshot of engine status & telemetry
//   ensureShard(maj, onProgress)        -> Promise<shard|null>
//   setSharedPapers(papers)             -> share already-fetched papers.json rows
//   getSharedPapers()                   -> papers array if loaded, else null
//   setSharedTaxonomy(tax)              -> share taxonomy.json so BM25 indexes fine-category names
//
// Coordination: exposes window.AtlasSemantic = {
//   search(q, k), searchHybrid, searchSemantic, searchKeyword, embed, enable, supported, ready, mode, state
// } so site/ask.html (Ask Gemma) and site/how.html can reuse semantic retrieval without touching their files.

const TRANSFORMERS_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/+esm";
const DEFAULT_MODEL = "onnx-community/embeddinggemma-300m-ONNX";
const DEFAULT_DTYPE = "q8";
const DEFAULT_QUERY_PROMPT = "task: search result | query: ";
const SHARD_CONCURRENCY = 6;
const QUERY_CACHE_MAX = 128;
const DEFAULT_RRF_K = 10;  // tuned on graded benchmark (scripts/search_eval)
const DEFAULT_SEM_WEIGHT = 1.0;
const DEFAULT_KW_WEIGHT = 1.0;  // graded benchmark: Gemma + BM25 at equal weight beat Gemma alone (0.785 vs 0.701 nDCG@10)
const SOFTWARE_GPU_RE = /swiftshader|llvmpipe|lavapipe|software|warp|basic render/i;

import { cachedBytes, fetchMirrored } from "./embed-loader.js";

function dataPrefix() {
  try {
    const p = new URLSearchParams(location.search).get("data");
    if (p && /^[A-Za-z0-9_\-./]+$/.test(p) && !p.includes("..") && !p.startsWith("/")) {
      return p.replace(/\/+$/, "");
    }
  } catch { /* ignore */ }
  return "data";
}

const state = {
  ready: false,
  loading: false,
  error: null,
  device: null,         // "webgpu" | "wasm"
  dtype: DEFAULT_DTYPE, // "q8" (cosine >= 0.992 vs Python fp32; works on WebGPU & WASM)
  worker: false,        // true when running off-main-thread in gemma-worker.js
  crossOriginIsolated: false,
  wasmThreads: 1,
  model: DEFAULT_MODEL,
  dims: 256,
  scale: 1 / 127,
  queryPrompt: DEFAULT_QUERY_PROMPT,
  shardsTotal: 0,
  shardsLoaded: 0,
  shardBytesLoaded: 0,
  shardBytesTotal: 0,
  downloadBytes: 0,
  initMs: 0,
  warmupMs: 0,
  lastTokMs: 0,
  lastInfMs: 0,
  lastEmbedMs: 0,
  lastDotMs: 0,
  lastKwMs: 0,
  lastFusionMs: 0,
  lastQueryMs: 0,
  lastMode: "hybrid",
  cacheHits: 0,
  cacheSize: 0,
  nPapers: 0,
};

let meta = null;              // parsed data/embed/meta.json
let papersArr = null;         // Array<paper> from data/papers.json
let paperById = null;         // Map<id, paper>
let fineNames = Object.create(null); // fine id -> display name
let enablePromise = null;

// Worker transport (or main-thread fallback if Worker construction is blocked)
let worker = null;
let workerSeq = 0;
const pendingWorker = new Map();
let activeProgressCb = null;

// Main-thread fallback handles (used only if Web Worker is unsupported/blocked)
let fallbackTokenizer = null;
let fallbackModel = null;

// Per-major loaded shards: maj -> { maj, n, ids, vecs: Int8Array, papers: Array<paper|null> }
const loadedShards = new Map();
const shardPromises = new Map();
let allShardsPromise = null;

// True LRU query vector cache: whitespace-normalized query -> Float32Array(dims) (unit-norm)
const qVecCache = new Map();
const inFlightEmbeds = new Map();

// Fielded BM25 inverted index (built lazily in non-blocking chunks from papersArr)
let bm25Index = null;
let bm25BuildPromise = null;

const KW_STOP = new Set(
  "a an the of for and in on to with via from by is are be as at or we our this that these those its it into using use based towards toward through over under without new novel model models method methods approach approaches learning".split(" ")
);

function stemWord(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function tokenizeText(s) {
  const matches = String(s || "").toLowerCase().match(/[a-z0-9]+/g);
  if (!matches) return [];
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const w = matches[i];
    if (w.length >= 2 && !KW_STOP.has(w)) {
      out.push(stemWord(w));
    }
  }
  return out;
}

/** Check whether this browser supports in-browser EmbeddingGemma (WASM + typed arrays + fetch). */
export function gemmaSupported() {
  return (
    typeof window !== "undefined" &&
    typeof WebAssembly === "object" &&
    typeof Int8Array === "function" &&
    typeof Float32Array === "function" &&
    typeof fetch === "function"
  );
}

/** Snapshot of current Gemma search engine state and timing telemetry. */
export function gemmaState() {
  return { ...state };
}

/** Share already-loaded taxonomy.json so BM25 indexes fine-category display names. */
export function setSharedTaxonomy(tax) {
  if (!tax || !Array.isArray(tax.majors)) return;
  const next = Object.create(null);
  for (const m of tax.majors) {
    if (Array.isArray(m.fine)) {
      for (const f of m.fine) next[f.id] = f.name || f.id;
    }
  }
  fineNames = next;
  // Rebuild BM25 index lazily on next query if it was built before taxonomy arrived
  if (bm25Index && !bm25Index.hasTax) {
    bm25Index = null;
    bm25BuildPromise = null;
  }
}

/** Allow callers (e.g. search.html keyword index) to share already-loaded papers.json array. */
export function setSharedPapers(papers) {
  if (!Array.isArray(papers) || !papers.length) return;
  if (papersArr !== papers) {
    papersArr = papers;
    paperById = new Map(papers.map((p) => [p.id, p]));
    state.nPapers = papers.length;
    bm25Index = null;
    bm25BuildPromise = null;
  }
  for (const sh of loadedShards.values()) {
    if (!sh.papers) sh.papers = sh.ids.map((id) => paperById.get(id) || null);
  }
}

export function getSharedPapers() {
  return papersArr;
}

function makeCard(p, score, extra = null) {
  const card = {
    id: p.id,
    s: +score.toFixed(4),
    n: p.n,
    t: p.t,
    r: p.r,
    rs: p.rs || [],
    sd: p.sd,
    rk: p.rk,
    st: p.s,
    tl: p.tl,
    pa: p.pa,
    maj: p.maj,
    fine: p.fine || [],
  };
  if (extra) Object.assign(card, extra);
  return card;
}

async function ensurePapersLoaded() {
  if (papersArr) return papersArr;
  const base = dataPrefix();
  const r = await fetch(`${base}/papers.json`);
  if (!r.ok) throw new Error(`papers.json unavailable (${r.status})`);
  const j = await r.json();
  setSharedPapers(j.papers || []);
  return papersArr;
}

async function ensureMetaAndPapers() {
  const base = dataPrefix();
  const tasks = [];
  if (!meta) {
    tasks.push(
      (base === "data"
        ? fetchMirrored("data/embed/meta.json", { timeoutMs: 15000 }).then((m) => m.response)
        : fetch(`${base}/embed/meta.json`)
      ).then(async (r) => {
        if (!r.ok) throw new Error(`Embedding metadata unavailable (${r.status})`);
        meta = await r.json();
        state.model = meta.model || DEFAULT_MODEL;
        state.dims = meta.dims || 256;
        state.scale = meta.scale || (1 / 127);
        state.queryPrompt = meta.query_prompt || DEFAULT_QUERY_PROMPT;
        const shardEntries = Object.values(meta.shards || {});
        state.shardsTotal = shardEntries.length;
        state.shardBytesTotal = shardEntries.reduce((acc, s) => acc + (s.bytes || s.n * state.dims), 0);
      })
    );
  }
  if (!papersArr) {
    tasks.push(ensurePapersLoaded());
  }
  await Promise.all(tasks);
}

/** Build a compact fielded Okapi BM25 inverted index asynchronously in small chunks so the UI never freezes. */
function ensureBM25Index() {
  if (bm25Index) return Promise.resolve(bm25Index);
  if (bm25BuildPromise) return bm25BuildPromise;
  if (!papersArr || !papersArr.length) return Promise.resolve(null);

  const srcPapers = papersArr;
  const taxSnapshot = fineNames;
  const hasTax = Object.keys(taxSnapshot).length > 0;

  bm25BuildPromise = (async () => {
    const N = srcPapers.length;
    const postings = Object.create(null);
    const df = Object.create(null);
    const docLen = new Float32Array(N);
    const titleLow = new Array(N);
    let totalLen = 0;

    const addField = (tfMap, text, w) => {
      const arr = tokenizeText(text);
      for (let i = 0; i < arr.length; i++) {
        const t = arr[i];
        tfMap[t] = (tfMap[t] || 0) + w;
      }
      return arr.length * w;
    };

    const CHUNK = 4000;
    for (let start = 0; start < N; start += CHUNK) {
      const end = Math.min(N, start + CHUNK);
      for (let i = start; i < end; i++) {
        const p = srcPapers[i];
        titleLow[i] = (p.t || "").toLowerCase();
        const tf = Object.create(null);
        let len = 0;
        len += addField(tf, p.t, 3.0);
        if (Array.isArray(p.kw) && p.kw.length) len += addField(tf, p.kw.join(" "), 2.0);
        if (p.tl) len += addField(tf, p.tl, 1.5);
        let catText = p.pa || "";
        if (Array.isArray(p.fine) && p.fine.length) {
          catText += " " + p.fine.map((f) => taxSnapshot[f] || f).join(" ");
        }
        if (catText.trim()) len += addField(tf, catText, 1.0);

        docLen[i] = len || 1;
        totalLen += docLen[i];

        for (const term in tf) {
          let list = postings[term];
          if (!list) {
            list = [];
            postings[term] = list;
          }
          list.push(i, tf[term]);
          df[term] = (df[term] || 0) + 1;
        }
      }
      if (end < N) {
        await new Promise((res) => setTimeout(res, 0));
      }
    }

    const built = {
      N,
      postings,
      df,
      docLen,
      avgLen: totalLen / Math.max(1, N),
      titleLow,
      hasTax,
    };
    if (papersArr === srcPapers) bm25Index = built;
    bm25BuildPromise = null;
    return built;
  })();

  return bm25BuildPromise;
}

/**
 * Score papers with fielded Okapi BM25 + multi-term coverage + title phrase boost.
 * Returns sorted array of { p, score } up to `limit`.
 */
async function bm25RankRaw(q, { limit = 100, status = "active", maj = "" } = {}) {
  const ix = await ensureBM25Index();
  if (!ix) return [];
  const terms = [...new Set(tokenizeText(q))];
  if (!terms.length) return [];

  const { N, postings, df, docLen, avgLen, titleLow } = ix;
  const k1 = 1.4;
  const b = 0.65;
  const filterStatus = status && status !== "all";
  const filterMaj = Boolean(maj);

  const scores = new Float32Array(N);
  const hits = new Uint16Array(N);
  const touched = [];

  for (let u = 0; u < terms.length; u++) {
    const term = terms[u];
    const list = postings[term];
    if (!list) continue;
    const d = df[term] || 0;
    const idf = Math.log(1 + (N - d + 0.5) / (d + 0.5));
    for (let j = 0; j < list.length; j += 2) {
      const idx = list[j];
      const p = papersArr[idx];
      if (filterStatus && p.s !== status) continue;
      if (filterMaj && p.maj !== maj) continue;
      const f = list[j + 1];
      const part = (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * docLen[idx]) / avgLen));
      if (scores[idx] === 0) touched.push(idx);
      scores[idx] += part;
      hits[idx]++;
    }
  }

  if (!touched.length) return [];

  const minHits = terms.length <= 4 ? Math.ceil(terms.length / 2) : Math.max(2, Math.ceil(terms.length * 0.35));
  const phrase = q.trim().toLowerCase();
  const hasPhrase = phrase.length > 6;
  const scored = [];

  for (let i = 0; i < touched.length; i++) {
    const idx = touched[i];
    const h = hits[idx];
    if (h < minHits) continue;
    let sc = scores[idx] * (0.5 + 0.5 * (h / terms.length));
    if (hasPhrase && titleLow[idx].includes(phrase)) sc *= 1.45;
    scored.push({ p: papersArr[idx], score: sc });
  }

  scored.sort((a, b2) => b2.score - a.score || (b2.p.r ?? 0) - (a.p.r ?? 0));
  return scored.slice(0, Math.max(1, limit));
}

/** Pure fielded BM25 keyword search (works even without enabling EmbeddingGemma). */
export async function gemmaKeywordSearch(q, { k = 100, status = "active", maj = "" } = {}) {
  const qq = String(q || "").trim();
  if (!qq) return [];
  await ensurePapersLoaded();
  const t0 = performance.now();
  const limit = Math.max(1, Number(k) || 100);
  const raw = await bm25RankRaw(qq, { limit, status, maj });
  const top = raw[0]?.score || 1;
  const out = raw.map((r) => makeCard(r.p, r.score / top));
  state.lastKwMs = +(performance.now() - t0).toFixed(1);
  state.lastQueryMs = Math.round(state.lastKwMs);
  state.lastMode = "keyword";
  return out;
}

/** Load one major-category int8 embedding shard on demand (cached via Cache API). */
export function ensureShard(maj, onProgress) {
  if (loadedShards.has(maj)) return Promise.resolve(loadedShards.get(maj));
  if (shardPromises.has(maj)) return shardPromises.get(maj);
  const info = meta?.shards?.[maj];
  if (!info) return Promise.resolve(null);
  const base = dataPrefix();
  const version = meta.version || meta.built || `${meta.model}|${meta.dims}|${meta.scale}|${meta.n || ""}`;
  const getBuf =
    base === "data"
      ? cachedBytes(`data/embed/${info.file}`, version).then((x) => x.buf)
      : fetch(`${base}/embed/${info.file}`).then((r) => {
          if (!r.ok) throw new Error(`Shard ${info.file} failed (${r.status})`);
          return r.arrayBuffer();
        });
  const p = getBuf
    .then(async (buf) => {
      const vecs = new Int8Array(buf);
      const expected = info.n * state.dims;
      if (vecs.length < expected) throw new Error(`Shard ${info.file} truncated (${vecs.length} < ${expected})`);
      const shard = {
        maj,
        n: info.n,
        ids: info.ids,
        vecs,
        papers: paperById ? info.ids.map((id) => paperById.get(id) || null) : null,
      };
      loadedShards.set(maj, shard);
      state.shardsLoaded = loadedShards.size;
      state.shardBytesLoaded += buf.byteLength;
      onProgress?.({
        stage: "shards",
        shard: maj,
        shardsLoaded: state.shardsLoaded,
        shardsTotal: state.shardsTotal,
        shardBytesLoaded: state.shardBytesLoaded,
        shardBytesTotal: state.shardBytesTotal,
      });
      return shard;
    })
    .catch((e) => {
      shardPromises.delete(maj);
      throw e;
    });
  shardPromises.set(maj, p);
  return p;
}

/** Load all shards in parallel with bounded concurrency (optionally prioritizing one major first). */
function loadAllShards(onProgress, priorityMaj = "") {
  if (allShardsPromise) return allShardsPromise;
  const majors = Object.keys(meta?.shards || {});
  if (priorityMaj && majors.includes(priorityMaj)) {
    majors.splice(majors.indexOf(priorityMaj), 1);
    majors.unshift(priorityMaj);
  }
  let cursor = 0;
  const workerLoop = async () => {
    while (cursor < majors.length) {
      const m = majors[cursor++];
      await ensureShard(m, onProgress);
    }
  };
  const workers = Array.from({ length: Math.min(SHARD_CONCURRENCY, majors.length) }, workerLoop);
  allShardsPromise = Promise.all(workers).catch((e) => {
    allShardsPromise = null;
    throw e;
  });
  return allShardsPromise;
}

function teardownWorker(reason) {
  if (worker) {
    try { worker.terminate(); } catch { /* ignore */ }
    worker = null;
  }
  for (const [, p] of pendingWorker.entries()) {
    p.reject(new Error(reason || "Embedding worker terminated"));
  }
  pendingWorker.clear();
}

function createWorker() {
  if (typeof Worker !== "function") return null;
  try {
    const w = new Worker(new URL("./gemma-worker.js", import.meta.url), { type: "module" });
    w.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "progress") {
        activeProgressCb?.("progress", msg.event);
        return;
      }
      if (msg.type === "stage") {
        activeProgressCb?.("stage", msg);
        return;
      }
      const pending = pendingWorker.get(msg.id);
      if (!pending) return;
      pendingWorker.delete(msg.id);
      if (msg.type === "initResult" || msg.type === "embedResult") {
        pending.resolve(msg);
      } else {
        pending.reject(new Error(msg.error || "Worker operation failed"));
      }
    };
    w.onerror = (err) => {
      err?.preventDefault?.();
      teardownWorker(err?.message || "Embedding worker crashed");
    };
    return w;
  } catch {
    return null;
  }
}

function callWorker(payload) {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error("Embedding worker not available"));
      return;
    }
    const id = ++workerSeq;
    pendingWorker.set(id, { resolve, reject });
    worker.postMessage({ ...payload, id });
  });
}

async function detectHardwareWebGPUMainThread() {
  try {
    if (typeof navigator === "undefined" || !navigator.gpu) return false;
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) return false;
    const info = adapter.info || {};
    if (adapter.isFallbackAdapter === true || info.isFallbackAdapter === true) return false;
    const desc = `${info.vendor || ""} ${info.architecture || ""} ${info.device || ""} ${info.description || ""}`;
    if (SOFTWARE_GPU_RE.test(desc)) return false;
    return true;
  } catch {
    return false;
  }
}

async function initMainThreadFallback(modelId, progressCallback, emitStage) {
  emitStage("runtime", "Loading Transformers.js runtime…");
  let tf;
  try {
    tf = await import(/* @vite-ignore */ TRANSFORMERS_CDN);
  } catch (e) {
    throw new Error(`Could not load Transformers.js from CDN (${e?.message || e})`);
  }
  const { AutoModel, AutoTokenizer, env } = tf;
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  const coi = Boolean(typeof self !== "undefined" && self.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined");
  const threads = coi ? Math.min(4, navigator.hardwareConcurrency || 4) : 1;
  if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = threads;

  emitStage("tokenizer", "Loading EmbeddingGemma tokenizer…");
  fallbackTokenizer = await AutoTokenizer.from_pretrained(modelId, { progress_callback: progressCallback });

  const hasWebGPU = await detectHardwareWebGPUMainThread();
  const attempts = hasWebGPU
    ? [
        { device: "webgpu", dtype: DEFAULT_DTYPE },
        { device: "wasm", dtype: "q8" },
      ]
    : [{ device: "wasm", dtype: "q8" }];

  let lastErr = null;
  let warmupMs = 0;
  for (const cfg of attempts) {
    try {
      emitStage("model", `Loading EmbeddingGemma (${cfg.dtype}, ${cfg.device.toUpperCase()})…`);
      fallbackModel = await AutoModel.from_pretrained(modelId, {
        dtype: cfg.dtype,
        device: cfg.device,
        progress_callback: progressCallback,
      });
      emitStage("warmup", `Warming up ${cfg.device.toUpperCase()} backend…`);
      const tw0 = performance.now();
      const inp = await fallbackTokenizer([state.queryPrompt + "warmup query"], { padding: true, truncation: true });
      const out = await fallbackModel(inp);
      const emb = out?.sentence_embedding || out?.last_hidden_state;
      if (!emb || !emb.data || emb.data.length < state.dims) throw new Error("Unexpected model output tensor");
      warmupMs = Math.round(performance.now() - tw0);
      return {
        device: cfg.device,
        dtype: cfg.dtype,
        warmupMs,
        crossOriginIsolated: coi,
        wasmThreads: cfg.device === "wasm" ? threads : 1,
      };
    } catch (e) {
      lastErr = e;
      fallbackModel = null;
    }
  }
  throw lastErr || new Error("Failed to initialize EmbeddingGemma ONNX model.");
}

/**
 * Enable on-device EmbeddingGemma semantic search.
 * Downloads sharded int8 embeddings + ONNX q8 model weights (cached by browser Cache API)
 * and warms up the model inside a dedicated Web Worker so the UI stays responsive.
 */
export function enableGemma(onProgress, { priorityMaj = "" } = {}) {
  if (state.ready) {
    onProgress?.({ stage: "ready", pct: 100, text: `EmbeddingGemma ready (${state.device})`, ...gemmaState() });
    return Promise.resolve(gemmaState());
  }
  if (enablePromise) return enablePromise;

  state.loading = true;
  state.error = null;
  const t0 = performance.now();

  const fileLoaded = new Map();
  const fileTotal = new Map();
  let lastProgressTs = 0;

  const emitProgress = (extra = {}, force = false) => {
    const now = performance.now();
    if (!force && now - lastProgressTs < 80) return;
    lastProgressTs = now;
    let dlLoaded = 0;
    let dlTotal = 0;
    for (const [k, v] of fileLoaded.entries()) {
      dlLoaded += v;
      dlTotal += Math.max(fileTotal.get(k) || 0, v);
    }
    state.downloadBytes = dlLoaded;
    const shardPct = state.shardsTotal ? state.shardsLoaded / state.shardsTotal : 0;
    const modelPct = dlTotal > 0 ? Math.min(1, dlLoaded / dlTotal) : (extra.stage === "ready" ? 1 : 0);
    const pct = extra.stage === "ready" ? 100 : Math.min(99, Math.round(shardPct * 15 + modelPct * 85));
    onProgress?.({
      pct,
      shardsLoaded: state.shardsLoaded,
      shardsTotal: state.shardsTotal,
      shardBytesLoaded: state.shardBytesLoaded,
      shardBytesTotal: state.shardBytesTotal,
      downloadLoaded: dlLoaded,
      downloadTotal: dlTotal,
      ...extra,
    });
  };

  const progressCallback = (ev) => {
    if (!ev || typeof ev !== "object") return;
    const key = ev.file || ev.name || "model";
    if (ev.status === "progress" && typeof ev.loaded === "number") {
      fileLoaded.set(key, ev.loaded);
      if (typeof ev.total === "number" && ev.total > 0) fileTotal.set(key, ev.total);
      emitProgress({
        stage: "model",
        file: key,
        text: `Downloading ${key.split("/").pop()} (${(ev.loaded / 1e6).toFixed(1)} / ${((ev.total || ev.loaded) / 1e6).toFixed(1)} MB)…`,
      });
    } else if (ev.status === "done") {
      const tot = fileTotal.get(key) || fileLoaded.get(key) || 0;
      if (tot) fileLoaded.set(key, tot);
      emitProgress({ stage: "model", file: key, text: `Loaded ${key.split("/").pop()}` }, true);
    } else if (ev.status === "initiate") {
      emitProgress({ stage: "model", file: key, text: `Fetching ${key.split("/").pop()}…` }, true);
    }
  };

  enablePromise = (async () => {
    if (!gemmaSupported()) {
      throw new Error("This browser does not support WebAssembly typed arrays.");
    }

    emitProgress({ stage: "init", text: "Loading embedding metadata & paper index…" }, true);
    await ensureMetaAndPapers();

    // Start loading all 24 sharded int8 matrices + building chunked BM25 index in parallel with worker init
    const shardTask = loadAllShards((sEv) => {
      emitProgress({
        stage: "shards",
        text: `Loading category shards (${sEv.shardsLoaded}/${sEv.shardsTotal})…`,
        shard: sEv.shard,
      });
    }, priorityMaj);
    const bm25Task = ensureBM25Index().catch(() => null);

    activeProgressCb = (kind, payload) => {
      if (kind === "progress") progressCallback(payload);
      else if (kind === "stage") emitProgress({ stage: payload.stage, text: payload.text }, true);
    };

    let initInfo;
    worker = createWorker();
    if (worker) {
      try {
        initInfo = await callWorker({
          type: "init",
          modelId: state.model,
          queryPrompt: state.queryPrompt,
          dims: state.dims,
          preferredDtype: DEFAULT_DTYPE,
        });
        state.worker = true;
      } catch (workerErr) {
        teardownWorker(workerErr?.message);
        // Only fall back to main thread if Worker itself failed (not a CDN/HF network block)
        if (/CDN|fetch|network|blocked|Failed to load|404/i.test(String(workerErr?.message || ""))) {
          throw workerErr;
        }
        state.worker = false;
        initInfo = await initMainThreadFallback(state.model, progressCallback, (stage, text) =>
          emitProgress({ stage, text }, true)
        );
      }
    } else {
      state.worker = false;
      initInfo = await initMainThreadFallback(state.model, progressCallback, (stage, text) =>
        emitProgress({ stage, text }, true)
      );
    }

    state.device = initInfo.device;
    state.dtype = initInfo.dtype || DEFAULT_DTYPE;
    state.warmupMs = initInfo.warmupMs || 0;
    state.crossOriginIsolated = Boolean(initInfo.crossOriginIsolated);
    state.wasmThreads = initInfo.wasmThreads || 1;

    await Promise.all([shardTask, bm25Task]);
    for (const sh of loadedShards.values()) {
      if (!sh.papers && paperById) sh.papers = sh.ids.map((id) => paperById.get(id) || null);
    }

    activeProgressCb = null;
    state.ready = true;
    state.loading = false;
    state.initMs = Math.round(performance.now() - t0);
    emitProgress(
      {
        stage: "ready",
        text: `EmbeddingGemma ready (${state.device.toUpperCase()} · ${state.dtype}, ${(state.initMs / 1000).toFixed(1)} s)`,
      },
      true
    );
    return gemmaState();
  })().catch((e) => {
    activeProgressCb = null;
    state.loading = false;
    state.ready = false;
    state.error = String(e?.message || e);
    enablePromise = null;
    throw e;
  });

  return enablePromise;
}

/** LRU get/set helpers for query vectors. */
function lruGet(key) {
  if (!qVecCache.has(key)) return null;
  const v = qVecCache.get(key);
  qVecCache.delete(key);
  qVecCache.set(key, v);
  state.cacheHits++;
  return v;
}

function lruSet(key, vec) {
  if (qVecCache.has(key)) qVecCache.delete(key);
  else if (qVecCache.size >= QUERY_CACHE_MAX) {
    qVecCache.delete(qVecCache.keys().next().value);
  }
  qVecCache.set(key, vec);
  state.cacheSize = qVecCache.size;
}

/** Encode a query string into a Matryoshka-truncated, L2-normalized Float32Array(dims) with LRU cache. */
export async function gemmaEmbed(q) {
  if (!state.ready) {
    throw new Error("EmbeddingGemma is not enabled yet. Call enableGemma() first.");
  }
  const key = String(q || "").trim().replace(/\s+/g, " ");
  if (!key) return new Float32Array(state.dims);

  const cached = lruGet(key);
  if (cached) {
    state.lastTokMs = 0;
    state.lastInfMs = 0;
    state.lastEmbedMs = 0;
    return cached;
  }

  if (inFlightEmbeds.has(key)) return inFlightEmbeds.get(key);

  const task = (async () => {
    let qv;
    if (worker && state.worker) {
      const res = await callWorker({
        type: "embed",
        text: key,
        queryPrompt: state.queryPrompt,
        dims: state.dims,
      });
      qv = res.vec instanceof Float32Array ? res.vec : new Float32Array(res.vec);
      state.lastTokMs = res.tokMs ?? 0;
      state.lastInfMs = res.infMs ?? 0;
      state.lastEmbedMs = +(res.embedMs ?? 0).toFixed(1);
    } else if (fallbackModel && fallbackTokenizer) {
      const t0 = performance.now();
      const inputs = await fallbackTokenizer([state.queryPrompt + key], { padding: true, truncation: true });
      const t1 = performance.now();
      const out = await fallbackModel(inputs);
      const tensor = out.sentence_embedding || out.last_hidden_state;
      const raw = tensor.data;
      const dims = state.dims;
      qv = new Float32Array(dims);
      let norm2 = 0;
      for (let i = 0; i < dims; i++) {
        const v = raw[i];
        qv[i] = v;
        norm2 += v * v;
      }
      const inv = 1 / Math.sqrt(norm2 || 1e-12);
      for (let i = 0; i < dims; i++) qv[i] *= inv;
      const t2 = performance.now();
      state.lastTokMs = +(t1 - t0).toFixed(2);
      state.lastInfMs = +(t2 - t1).toFixed(2);
      state.lastEmbedMs = +(t2 - t0).toFixed(1);
    } else {
      throw new Error("No active EmbeddingGemma runtime.");
    }
    lruSet(key, qv);
    return qv;
  })().finally(() => {
    inFlightEmbeds.delete(key);
  });

  inFlightEmbeds.set(key, task);
  return task;
}

/**
 * Score a unit-norm Float32Array(256) query vector against one or all int8 shards.
 * Uses an 8x-unrolled typed-array dot product + bounded top-k array (~20 ms for 42,789 papers).
 */
function scoreShardsRaw(qv, shards, { k = 100, status = "active", excludeId = "" } = {}) {
  const dims = state.dims;
  const scale = state.scale;
  const sq = new Float32Array(dims);
  for (let d = 0; d < dims; d++) sq[d] = qv[d] * scale;

  const limit = Math.max(1, Number(k) || 100);
  const filterStatus = status && status !== "all";
  const topScores = new Float32Array(limit);
  const topPapers = new Array(limit);
  let count = 0;
  let minScore = -Infinity;
  let minIdx = 0;

  for (let sIdx = 0; sIdx < shards.length; sIdx++) {
    const sh = shards[sIdx];
    if (!sh) continue;
    const vecs = sh.vecs;
    const papers = sh.papers;
    const ids = sh.ids;
    const n = sh.n;

    for (let i = 0; i < n; i++) {
      const p = papers ? papers[i] : paperById?.get(ids[i]);
      if (!p) continue;
      if (filterStatus && p.s !== status) continue;
      if (excludeId && p.id === excludeId) continue;

      const off = i * dims;
      let dot = 0;
      let d = 0;
      const end8 = dims & ~7;
      for (; d < end8; d += 8) {
        dot +=
          vecs[off + d] * sq[d] +
          vecs[off + d + 1] * sq[d + 1] +
          vecs[off + d + 2] * sq[d + 2] +
          vecs[off + d + 3] * sq[d + 3] +
          vecs[off + d + 4] * sq[d + 4] +
          vecs[off + d + 5] * sq[d + 5] +
          vecs[off + d + 6] * sq[d + 6] +
          vecs[off + d + 7] * sq[d + 7];
      }
      for (; d < dims; d++) dot += vecs[off + d] * sq[d];

      if (count < limit) {
        topScores[count] = dot;
        topPapers[count] = p;
        count++;
        if (count === limit) {
          minScore = topScores[0];
          minIdx = 0;
          for (let j = 1; j < limit; j++) {
            if (topScores[j] < minScore) {
              minScore = topScores[j];
              minIdx = j;
            }
          }
        }
      } else if (dot > minScore) {
        topScores[minIdx] = dot;
        topPapers[minIdx] = p;
        minScore = topScores[0];
        minIdx = 0;
        for (let j = 1; j < limit; j++) {
          if (topScores[j] < minScore) {
            minScore = topScores[j];
            minIdx = j;
          }
        }
      }
    }
  }

  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = { p: topPapers[i], score: topScores[i] };
  out.sort((a, b) => b.score - a.score || (b.p.r ?? 0) - (a.p.r ?? 0));
  return out;
}

async function resolveTargetShards(maj) {
  if (maj && meta?.shards?.[maj]) {
    const sh = await ensureShard(maj);
    return sh ? [sh] : [];
  }
  if (allShardsPromise) await allShardsPromise;
  return [...loadedShards.values()];
}

/** Pure EmbeddingGemma cosine semantic search over int8 shards. */
export async function gemmaSemanticSearch(q, { k = 100, status = "active", maj = "" } = {}) {
  const qq = String(q || "").trim();
  if (!qq) return [];
  if (!state.ready) {
    throw new Error("EmbeddingGemma is not enabled yet. Call enableGemma() first.");
  }
  const t0 = performance.now();
  const qv = await gemmaEmbed(qq);
  const t1 = performance.now();
  const targetShards = await resolveTargetShards(maj);
  const ranked = scoreShardsRaw(qv, targetShards, { k, status });
  const t2 = performance.now();

  state.lastEmbedMs = +(t1 - t0).toFixed(1);
  state.lastDotMs = +(t2 - t1).toFixed(1);
  state.lastKwMs = 0;
  state.lastFusionMs = 0;
  state.lastQueryMs = Math.round(t2 - t0);
  state.lastMode = "semantic";
  return ranked.map((r) => makeCard(r.p, r.score));
}

/**
 * Browser hybrid search: Reciprocal-Rank Fusion (k=60, semantic weight >= keyword weight)
 * combining EmbeddingGemma 256-d int8 cosine ranking with fielded Okapi BM25 ranking.
 * Default weights (semWeight=1.0, kwWeight=0.5) prevent off-topic keyword-only matches
 * from outranking strong semantic hits while promoting papers that match both.
 */
export async function gemmaHybridSearch(
  q,
  {
    k = 100,
    status = "active",
    maj = "",
    rrfK = DEFAULT_RRF_K,
    semWeight = DEFAULT_SEM_WEIGHT,
    kwWeight = DEFAULT_KW_WEIGHT,
  } = {}
) {
  const qq = String(q || "").trim();
  if (!qq) return [];
  if (!state.ready) {
    throw new Error("EmbeddingGemma is not enabled yet. Call enableGemma() first.");
  }
  const wSem = Math.max(0.01, Number(semWeight) || DEFAULT_SEM_WEIGHT);
  const wKw = Math.min(wSem, Math.max(0, Number(kwWeight ?? DEFAULT_KW_WEIGHT))); // enforce sem >= kw
  const kRrf = Math.max(1, Number(rrfK) || DEFAULT_RRF_K);
  const limit = Math.max(1, Number(k) || 100);
  const poolK = Math.max(250, limit * 3);

  const t0 = performance.now();
  // Kick off off-thread query embedding while computing fast BM25 pool on main thread in parallel!
  const embedPromise = gemmaEmbed(qq);
  const tKw0 = performance.now();
  const kwRanked = await bm25RankRaw(qq, { limit: poolK, status, maj });
  const kwMs = performance.now() - tKw0;

  const qv = await embedPromise;
  const workerEmbedMs = state.lastEmbedMs;
  const t1 = performance.now();
  const targetShards = await resolveTargetShards(maj);
  const semRanked = scoreShardsRaw(qv, targetShards, { k: poolK, status });
  const t2 = performance.now();

  // Weighted Reciprocal-Rank Fusion
  const fused = new Map(); // id -> { p, rrf, sem, kw }
  for (let i = 0; i < semRanked.length; i++) {
    const item = semRanked[i];
    fused.set(item.p.id, {
      p: item.p,
      rrf: wSem / (kRrf + i + 1),
      sem: item.score,
      kw: 0,
    });
  }
  const kwTop = kwRanked[0]?.score || 1;
  for (let i = 0; i < kwRanked.length; i++) {
    const item = kwRanked[i];
    const add = wKw / (kRrf + i + 1);
    const existing = fused.get(item.p.id);
    if (existing) {
      existing.rrf += add;
      existing.kw = item.score / kwTop;
    } else {
      fused.set(item.p.id, {
        p: item.p,
        rrf: add,
        sem: 0,
        kw: item.score / kwTop,
      });
    }
  }

  const maxPossible = (wSem + wKw) / (kRrf + 1);
  const merged = [...fused.values()];
  merged.sort((a, b) => b.rrf - a.rrf || b.sem - a.sem || (b.p.r ?? 0) - (a.p.r ?? 0));
  const out = merged.slice(0, limit).map((m) =>
    makeCard(m.p, m.rrf / maxPossible, {
      sem: +m.sem.toFixed(4),
      kw: +m.kw.toFixed(3),
    })
  );
  const t3 = performance.now();

  state.lastEmbedMs = workerEmbedMs;
  state.lastKwMs = +kwMs.toFixed(1);
  state.lastDotMs = +(t2 - t1).toFixed(1);
  state.lastFusionMs = +(t3 - t2).toFixed(1);
  state.lastQueryMs = Math.round(t3 - t0);
  state.lastMode = "hybrid";
  return out;
}

/**
 * Default in-browser search entrypoint.
 * Defaults to mode="hybrid" (RRF fusion of EmbeddingGemma + fielded BM25).
 * Pure modes remain callable via mode="semantic" or mode="keyword".
 */
export async function gemmaSearch(
  q,
  { k = 100, status = "active", maj = "", mode = "hybrid", rrfK = DEFAULT_RRF_K, semWeight = DEFAULT_SEM_WEIGHT, kwWeight = DEFAULT_KW_WEIGHT } = {}
) {
  if (mode === "keyword") {
    return gemmaKeywordSearch(q, { k, status, maj });
  }
  if (mode === "semantic") {
    return gemmaSemanticSearch(q, { k, status, maj });
  }
  return gemmaHybridSearch(q, { k, status, maj, rrfK, semWeight, kwWeight });
}

/**
 * Find papers semantically similar to an existing paper ID using its stored 256-dim int8 vector.
 */
export async function gemmaSimilar(id, { k = 50, status = "active", maj = "" } = {}) {
  if (!state.ready) throw new Error("EmbeddingGemma is not enabled yet.");
  if (allShardsPromise) await allShardsPromise;
  const dims = state.dims;
  let qv = null;
  for (const sh of loadedShards.values()) {
    const idx = sh.ids.indexOf(id);
    if (idx !== -1) {
      qv = new Float32Array(dims);
      const off = idx * dims;
      let norm2 = 0;
      for (let d = 0; d < dims; d++) {
        const v = sh.vecs[off + d] * state.scale;
        qv[d] = v;
        norm2 += v * v;
      }
      const inv = 1 / Math.sqrt(norm2 || 1e-12);
      for (let d = 0; d < dims; d++) qv[d] *= inv;
      break;
    }
  }
  if (!qv) return [];
  const targetShards = maj && loadedShards.has(maj) ? [loadedShards.get(maj)] : [...loadedShards.values()];
  return scoreShardsRaw(qv, targetShards, { k, status, excludeId: id }).map((r) => makeCard(r.p, r.score));
}

// Expose global coordination API for sibling pages (e.g. site/ask.html & site/how.html).
// If another provider (such as the local GPU server API) already registered AtlasSemantic, keep it.
if (typeof window !== "undefined" && !window.AtlasSemantic) {
  window.AtlasSemantic = {
    async search(q, kOrOpts = 20) {
      const opts = typeof kOrOpts === "number" ? { k: kOrOpts } : (kOrOpts || {});
      const mode = opts.mode || "hybrid";
      if (mode !== "keyword" && !state.ready) {
        await enableGemma(opts.onProgress, { priorityMaj: opts.maj || "" });
      }
      return gemmaSearch(q, {
        k: opts.k ?? 20,
        status: opts.status ?? "active",
        maj: opts.maj ?? "",
        mode,
        rrfK: opts.rrfK,
        semWeight: opts.semWeight,
        kwWeight: opts.kwWeight,
      });
    },
    async searchHybrid(q, opts = {}) {
      if (!state.ready) await enableGemma(opts.onProgress, { priorityMaj: opts.maj || "" });
      return gemmaHybridSearch(q, opts);
    },
    async searchSemantic(q, opts = {}) {
      if (!state.ready) await enableGemma(opts.onProgress, { priorityMaj: opts.maj || "" });
      return gemmaSemanticSearch(q, opts);
    },
    async searchKeyword(q, opts = {}) {
      return gemmaKeywordSearch(q, opts);
    },
    async embed(q) {
      if (!state.ready) await enableGemma();
      return gemmaEmbed(q);
    },
    enable: enableGemma,
    supported: gemmaSupported,
    get ready() {
      return state.ready;
    },
    get mode() {
      return state.ready ? `gemma-${state.lastMode}-${state.device}` : "gemma-idle";
    },
    get state() {
      return gemmaState();
    },
  };
}
