// Shared page chrome: top nav, theme, keyboard shortcuts, help modal, footer, tooltip, toasts, loading overlay.
import { $, esc, fmtDate, fmtInt, isTyping } from "./util.js";
import { BRAND_SVG, icon } from "./icons.js";
import { DATA_DIR, IS_DEFAULT_DATA, pageHref } from "./data.js";
import { refreshScale } from "./scale.js";
import { allListedIds, onStoreChange } from "./store.js";

export const PAGES = [
  { id: "explorer", href: "index.html", label: "Explorer", key: "e" },
  { id: "search", href: "search.html", label: "Search", key: "k" },
  { id: "ask", href: "ask.html", label: "Ask Gemma", key: "q" },
  { id: "how", href: "how.html", label: "How it works", key: "w" },
  { id: "categories", href: "categories.html", label: "Categories", key: "c" },
  { id: "map", href: "map.html", label: "Map", key: "m" },
  { id: "graph", href: "graph.html", label: "Graph", key: "r" },
  { id: "stats", href: "stats.html", label: "Stats", key: "s" },
  { id: "channel", href: "channel.html", label: "Channel", key: "h" },
  { id: "lists", href: "lists.html", label: "Lists", key: "l" },
];

const GLOBAL_KEYS = [
  ["?", "Show this help"],
  ["t", "Toggle light / dark theme"],
  ...PAGES.map((p) => [`g ${p.key}`, `Go to ${p.label}`]),
];

let pageKeys = [];

/* ---------- theme ---------- */
export function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("atlas.theme", t); } catch { /* storage unavailable */ }
  refreshScale();
  updateThemeButton();
  window.dispatchEvent(new CustomEvent("atlas:theme", { detail: t }));
}
function updateThemeButton() {
  const b = $("#theme-btn");
  if (b) { b.innerHTML = icon(currentTheme() === "dark" ? "sun" : "moon"); b.title = `Switch to ${currentTheme() === "dark" ? "light" : "dark"} theme (t)`; }
}
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
  if (!document.documentElement.dataset.theme) { refreshScale(); window.dispatchEvent(new CustomEvent("atlas:theme")); }
});

/* ---------- chrome ---------- */
export function initShell({ page, keys = [] }) {
  pageKeys = keys;
  const top = $("#topbar");
  top.className = "topbar";
  top.innerHTML = `
    <a class="brand" href="${pageHref("index.html")}" title="ICLR 2027 Atlas">${BRAND_SVG}<span class="b1">ICLR 2027</span><span class="b2">Atlas</span></a>
    <nav class="nav" aria-label="Pages">${PAGES.map((p) => `<a href="${pageHref(p.href)}" data-page="${p.id}"${p.id === page ? ' aria-current="page"' : ""}>${esc(p.label)}${p.id === "lists" ? ' <span class="count" id="star-count" title="papers in your lists"></span>' : ""}</a>`).join("")}</nav>
    <span class="spacer"></span>
    <div class="tools">
      ${IS_DEFAULT_DATA ? "" : `<span class="data-badge" title="Data folder (from ?data=)">${esc(DATA_DIR)}/</span>`}
      <button class="icon-btn" id="help-btn" title="Keyboard shortcuts (?)">${icon("keyboard")}</button>
      <button class="icon-btn" id="theme-btn"></button>
    </div>`;
  updateThemeButton();
  $("#theme-btn").addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark"));
  $("#help-btn").addEventListener("click", showHelp);
  const sc = () => { const n = allListedIds().length; const el = $("#star-count"); if (el) el.textContent = n ? String(n) : ""; };
  sc();
  onStoreChange((w) => w === "lists" && sc());
  initKeys();
  initTooltips();
  refreshScale();
}

export function setFooter({ generated, records, extra = "" } = {}) {
  const f = $("#foot");
  if (!f) return;
  f.className = "foot";
  f.innerHTML = `
    <span>Data generated <b>${esc(fmtDate(generated))}</b></span><span class="sep"></span>
    ${records != null ? `<span><b>${fmtInt(records)}</b> records</span><span class="sep"></span>` : ""}
    <span>folder <span class="mono">${esc(DATA_DIR)}/</span></span>
    ${extra ? `<span class="sep"></span>${extra}` : ""}
    <span class="grow"></span>
    <span>Scores from public OpenReview reviews · no author or reviewer identities</span><span class="sep"></span>
    <span>Press <span class="kbd">?</span> for shortcuts</span>`;
}

/* ---------- keyboard ---------- */
let gPending = 0;
function initKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e)) return;
    if (document.querySelector(".modal-back")) {
      if (e.key === "Escape" || e.key === "?") { closeModal(); e.preventDefault(); }
      return;
    }
    if (gPending && Date.now() - gPending < 1200) {
      const p = PAGES.find((x) => x.key === e.key.toLowerCase());
      gPending = 0;
      if (p) { location.href = pageHref(p.href); e.preventDefault(); }
      return;
    }
    if (e.key === "g") { gPending = Date.now(); return; }
    if (e.key === "?") { showHelp(); e.preventDefault(); return; }
    if (e.key === "t") { setTheme(currentTheme() === "dark" ? "light" : "dark"); e.preventDefault(); }
  });
}

function showHelp() {
  closeModal();
  const row = ([k, d]) => `<dt>${k.split(" ").map((x) => `<span class="kbd">${esc(x)}</span>`).join(" ")}</dt><dd>${esc(d)}</dd>`;
  const back = document.createElement("div");
  back.className = "modal-back";
  back.innerHTML = `<div class="modal" role="dialog" aria-label="Keyboard shortcuts">
    <div class="eyebrow">Keyboard</div><h2>Shortcuts</h2>
    <dl class="keys">${pageKeys.length ? `<h4>This page</h4>${pageKeys.map(row).join("")}` : ""}<h4>Everywhere</h4>${GLOBAL_KEYS.map(row).join("")}</dl>
  </div>`;
  back.addEventListener("click", (e) => { if (e.target === back) closeModal(); });
  document.body.append(back);
}
function closeModal() { document.querySelectorAll(".modal-back").forEach((m) => m.remove()); }

/* ---------- tooltip ---------- */
let tipEl = null;
export function showTip(html, x, y) {
  if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tip"; document.body.append(tipEl); }
  tipEl.innerHTML = html;
  tipEl.classList.add("on");
  const r = tipEl.getBoundingClientRect();
  let left = x + 14, top = y + 14;
  if (left + r.width > innerWidth - 8) left = x - r.width - 14;
  if (top + r.height > innerHeight - 8) top = y - r.height - 14;
  tipEl.style.left = `${Math.max(8, left)}px`;
  tipEl.style.top = `${Math.max(8, top)}px`;
}
export function hideTip() { tipEl?.classList.remove("on"); }
function initTooltips() {
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest?.("[data-tip]");
    if (t) showTip(t.dataset.tip, e.clientX, e.clientY);
  });
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest?.("[data-tip]");
    if (t) showTip(t.dataset.tip, e.clientX, e.clientY);
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest?.("[data-tip]") && !e.relatedTarget?.closest?.("[data-tip]")) hideTip();
  });
}

/* ---------- toasts ---------- */
export function toast(msg, ms = 1800) {
  let box = $(".toasts");
  if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.append(box); }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  box.append(t);
  setTimeout(() => t.remove(), ms);
}

/* ---------- loading overlay ---------- */
export function loadingOverlay(label = "Loading the atlas") {
  const el = document.createElement("div");
  el.className = "loading";
  el.innerHTML = `<div class="box"><div class="eyebrow">ICLR 2027 Atlas</div><div class="t">${esc(label)}…</div>
    <div class="bar"><i></i></div><div class="small muted mono" data-msg>connecting</div></div>`;
  document.body.append(el);
  const bar = el.querySelector(".bar i"), msg = el.querySelector("[data-msg]");
  return {
    progress(got, total) {
      if (total) bar.style.width = `${Math.min(100, (100 * got) / total).toFixed(1)}%`;
      msg.textContent = `${(got / 1048576).toFixed(1)} MB${total ? ` of ${(total / 1048576).toFixed(1)} MB` : ""}`;
    },
    done() { bar.style.width = "100%"; el.classList.add("done"); setTimeout(() => el.remove(), 300); },
    error(text) {
      el.classList.add("err");
      el.querySelector(".t").textContent = "Could not load data";
      msg.innerHTML = `${esc(text)}<br><br>Expected files under <span class="mono">${esc(DATA_DIR)}/</span>. For the dev fixture, open with <span class="mono">?data=data_mock</span>.`;
    },
  };
}
