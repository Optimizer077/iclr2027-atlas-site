// Progressive, mirrored, cached loader for the in-browser semantic-search shards (data/embed/).
// - Non-blocking: shards stream in the background; callers get each shard as soon as it lands.
// - Mirrors: this site first, then the jsDelivr CDN copy of the public GitHub repo (add more in MIRRORS).
// - Cache API: shards persist across visits (keyed by meta version), so repeat visits load instantly/offline.
// The loader returns raw bytes + shard metadata; the search module applies scales and does the dot products.

const CACHE_NAME = "atlas-embed-v1";

/** "<owner>/<repo>" derived from a GitHub Pages URL (<owner>.github.io/<repo>/); null elsewhere (localhost). */
export function publicRepo() {
  const owner = /^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
  const repo = location.pathname.split("/").filter(Boolean)[0];
  return owner && repo && !repo.includes(".") ? `${owner[1]}/${repo}` : null;
}
const PUBLIC_CDN = publicRepo() ? `https://cdn.jsdelivr.net/gh/${publicRepo()}@main/` : null;

export function mirrors() {
  const here = new URL(".", location.href).href; // works under /<repo>/ and on localhost
  return !PUBLIC_CDN || here === PUBLIC_CDN ? [here] : [here, PUBLIC_CDN];
}

async function fetchTimeout(url, ms) {
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), ms) : null;
  try {
    const r = await fetch(url, ctl ? { signal: ctl.signal, cache: "no-cache" } : {});
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r;
  } finally {
    if (t) clearTimeout(t);
  }
}

/** Fetch `path` from the first mirror that answers; returns {response, mirror}. */
export async function fetchMirrored(path, { timeoutMs = 25000 } = {}) {
  let lastErr;
  for (const base of mirrors()) {
    try {
      return { response: await fetchTimeout(base + path, timeoutMs), mirror: base };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`all mirrors failed for ${path}`);
}

let cachePromise = null;

function openCache() {
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    try {
      return typeof caches !== "undefined" ? await caches.open(CACHE_NAME) : null;
    } catch {
      return null; // e.g. private mode / insecure context — just skip persistence
    }
  })();
  return cachePromise;
}

/** ArrayBuffer for `path`, from Cache API if present (same version), else mirrored network (then cached). */
export async function cachedBytes(path, version, opts = {}) {
  const cache = await openCache();
  const key = new URL(`${path}?v=${encodeURIComponent(version || "0")}`, location.href).href;
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return { buf: await hit.arrayBuffer(), source: "cache" };
  }
  const { response, mirror } = await fetchMirrored(path, opts);
  const buf = await response.arrayBuffer();
  if (cache) {
    cache.put(key, new Response(buf.slice(0), { headers: { "Content-Type": "application/octet-stream" } })).catch(() => {});
  }
  return { buf, source: mirror === mirrors()[0] ? "site" : "cdn" };
}

/** meta.json (always revalidated so a new index invalidates old cached shards). */
export async function loadEmbedMeta() {
  const { response } = await fetchMirrored("data/embed/meta.json", { timeoutMs: 15000 });
  return response.json();
}

/**
 * Load all shards in the background.
 * @param meta    parsed meta.json ({shards: {<area>: {file, n, ids, ...}}, version|built|model})
 * @param order   optional area ids to load first (e.g. the active category filter)
 * @param onShard (area, {bytes: Int8Array, info, source, ms}) — called as each shard lands
 * @param onProgress ({done, total, bytes, failed}) — after every shard
 * @returns Promise<Map<area, {bytes, info}>> resolving when every shard has settled
 */
export async function loadShards(meta, { order = [], onShard = () => {}, onProgress = () => {}, concurrency = 4 } = {}) {
  const version = meta.version || meta.built || `${meta.model}|${meta.dims}|${meta.n || ""}`;
  const areas = Object.keys(meta.shards || {});
  const queue = [...new Set([...order.filter((a) => areas.includes(a)), ...areas])];
  const out = new Map();
  let done = 0, bytes = 0, failed = 0;
  const worker = async () => {
    while (queue.length) {
      const area = queue.shift();
      const info = meta.shards[area];
      const t0 = performance.now();
      try {
        const { buf, source } = await cachedBytes(`data/embed/${info.file}`, version);
        const shard = { bytes: new Int8Array(buf), info, source, ms: Math.round(performance.now() - t0) };
        out.set(area, shard);
        bytes += buf.byteLength;
        onShard(area, shard);
      } catch (e) {
        failed++;
        console.warn(`[embed-loader] shard ${area} unavailable:`, e.message);
      }
      done++;
      onProgress({ done, total: areas.length, bytes, failed });
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length || 1) }, worker));
  return out;
}

/** Remove cached shards (e.g. a "reset" button). */
export async function clearEmbedCache() {
  try {
    if (typeof caches !== "undefined") await caches.delete(CACHE_NAME);
  } catch { /* ignore */ }
}
