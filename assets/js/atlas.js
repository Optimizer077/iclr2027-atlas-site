// Public API for every page (including viz pages owned by other agents).
//
//   import { mountShell, loadPapers, loadShard, openDetail, ... } from "./assets/js/atlas.js";
//
// mountShell(page, {keys})      nav (active page id), theme, shortcuts, tooltip; returns {setFooter}
// loadPapers(onProgress?)       → {meta, papers, byId, maxSd}; papers carry _q (lowercase search string)
// loadTaxonomy()                → {majors, major(id), fine(id), majorById, fineById}
// loadStats(), loadClusters()   → stats.json object | clusters array ([] if absent)
// loadShard(kind, number)       → whole shard object ({} if missing); kind: abstracts|factsheets|reviews|neighbors
// loadShardEntry(kind, paper)   → one paper's entry or null
// openDetail(id), closeDetail() overlay paper drawer (lazy-created); onDetail(fn) → fn(id|null) on open/close
// ratingColor(v, alpha?), getScale(), chipsHTML(rs), pageHref(page, hash)
// showTip(html, x, y), hideTip(), toast(msg), loadingOverlay(label), onTheme(fn)

import { initShell, setFooter, showTip, hideTip, toast, loadingOverlay, currentTheme, setTheme } from "./core/shell.js";
import { loadPapers, loadTaxonomy, loadStats, loadClusters, loadShard, loadShardEntry, pageHref, forumUrl, orPdfUrl, localPdfUrl, DATA_DIR, fetchJSON } from "./core/data.js";
import { ratingColor, ratingRGB, getScale, chipsHTML, chipHTML, statusHTML } from "./core/scale.js";
import { PaperDrawer } from "./components/detail.js";
import { isStarred, toggleStar, starredIds, onStoreChange, getLists, getList, listsOf, inList, addToList, removeFromList, createList } from "./core/store.js";
import { esc, fmt, fmtInt, debounce, rafThrottle } from "./core/util.js";
import { searchAvailable, searchStatus, onSearchStatus, semanticSearch, similarPapers } from "./core/search.js";
import { openListMenu, closeListMenu } from "./components/listmenu.js";

// Semantic search (same-origin API; see core/search.js):
//   searchAvailable() → Promise<boolean> (cached health check; false on static hosting)
//   semanticSearch(q, {k, status}) → {q, took_ms, results:[{id, s, sem, lex, ...card}]}
//   similarPapers(id, {k, status}) → [{id, s, sem, lex, ...card}]
// Lists (localStorage): getLists(), listsOf(id), addToList(listId, ids), openListMenu(anchorEl, ids)
export {
  setFooter, showTip, hideTip, toast, loadingOverlay, currentTheme, setTheme,
  loadPapers, loadTaxonomy, loadStats, loadClusters, loadShard, loadShardEntry, pageHref, forumUrl, orPdfUrl, localPdfUrl, DATA_DIR, fetchJSON,
  ratingColor, ratingRGB, getScale, chipsHTML, chipHTML, statusHTML,
  PaperDrawer, isStarred, toggleStar, starredIds, onStoreChange, esc, fmt, fmtInt, debounce, rafThrottle,
  searchAvailable, searchStatus, onSearchStatus, semanticSearch, similarPapers,
  getLists, getList, listsOf, inList, addToList, removeFromList, createList, openListMenu, closeListMenu,
};

export function mountShell(page, { keys = [] } = {}) {
  initShell({ page, keys });
  return { setFooter };
}

/** Subscribe to theme changes (re-read colours, redraw canvases). */
export function onTheme(fn) {
  window.addEventListener("atlas:theme", () => fn(currentTheme()));
}

let drawerPromise = null;
const detailListeners = new Set();
export const onDetail = (fn) => { detailListeners.add(fn); return () => detailListeners.delete(fn); };

async function ensureDrawer() {
  if (!drawerPromise) {
    drawerPromise = Promise.all([loadPapers(), loadTaxonomy(), loadStats()]).then(([d, tax, stats]) => {
      if (!document.querySelector('link[href$="drawer.css"]')) {
        const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: new URL("../css/drawer.css", import.meta.url).href });
        document.head.append(link);
      }
      const el = document.createElement("aside");
      el.id = "atlas-drawer";
      document.body.append(el);
      const rankedCount = d.papers.reduce((n, p) => n + (p.rk != null ? 1 : 0), 0);
      return new PaperDrawer(el, {
        byId: d.byId, tax, stats, rankedCount,
        onOpen: (id) => detailListeners.forEach((fn) => fn(id)),
        onClose: () => detailListeners.forEach((fn) => fn(null)),
      });
    });
    document.addEventListener("keydown", async (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        const dr = await drawerPromise;
        if (dr.isOpen) { dr.close(); e.preventDefault(); }
      }
    });
  }
  return drawerPromise;
}

/** Open the overlay paper drawer for an OpenReview id. Resolves to true if the paper exists. */
export async function openDetail(id) { return (await ensureDrawer()).open(id); }
export async function closeDetail() { if (drawerPromise) (await drawerPromise).close(); }
