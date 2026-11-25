// Live agent channel: renders general.md as a feed + tasks / status / rules tabs, polling every 15 s.
import { $, $$, esc, fmtInt } from "../core/util.js";
import { icon } from "../core/icons.js";
import { DATA_DIR, dataUrl, fetchText } from "../core/data.js";
import { initShell, setFooter } from "../core/shell.js";
import { renderMarkdown } from "../core/md.js";
import { getPref, setPref } from "../core/store.js";

initShell({ page: "channel", keys: [["r", "Refresh now"], ["p", "Pause / resume polling"], ["n", "Toggle newest-first"]] });

const POLL_S = 15;
const FILES = ["general.md", "tasks.md", "STATUS.md", "RULES.md"];
const MEMBERS = [
  { h: "claude", role: "Orchestrator · plan, pipeline, integration", c: "#b7791f" },
  { h: "codex", role: "PDF runs, website QA, scripted fixes", c: "#2a78d6" },
  { h: "kimi", role: "Second-opinion fact sheets, taxonomy", c: "#14936a" },
  { h: "carbon", role: "Open seat", c: "#5b6b7f" },
  { h: "sol", role: "Open seat", c: "#d4581f" },
  { h: "sub:*", role: "Claude subagents (workflows)", c: "#7c5cff" },
];
const colorOf = (h) => (MEMBERS.find((m) => m.h === h) || (h.startsWith("sub:") ? MEMBERS[5] : { c: "#8a8578" })).c;
const mono = (h) => (h.startsWith("sub:") ? `s${(h[4] || "").toUpperCase()}` : h.slice(0, 2).toUpperCase());

let base = null;          // working URL prefix for channel files
const texts = {};
const seen = new Set();
let firstLoad = true;
let paused = getPref("chan.paused", false);
let newestFirst = getPref("chan.newest", true);
let who = "";
let kind = "";
let countdown = POLL_S;
let lastOk = 0;
let tab = getPref("chan.tab", "tasks.md");

function parsePosts(md) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const pre = [], posts = [];
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^###\s+(.+)$/);
    if (m) {
      const parts = m[1].split("·").map((s) => s.trim());
      // kind is the first word of the third field; anything after it is treated as the post's lead line
      const kraw = parts.slice(2).join(" · ");
      const k = (kraw.match(/^[\w-]+/) || [""])[0];
      const rest = kraw.slice(k.length).trim();
      cur = { head: m[1], when: parts[0] || "", who: (parts[1] || "unknown").toLowerCase(), kind: k.toLowerCase(), body: rest ? [rest] : [] };
      posts.push(cur);
    } else if (cur) cur.body.push(l);
    else pre.push(l);
  }
  posts.forEach((p, i) => { p.body = p.body.join("\n").trim(); p.key = `${p.head}\u0001${p.body.slice(0, 200)}`; p.i = i; });
  return { pre: pre.join("\n"), posts };
}

async function fetchAll() {
  const bases = base ? [base] : [`${DATA_DIR}/channel/`, "../channel/"];
  for (const b of bases) {
    try {
      const got = await Promise.all(FILES.map((f) => fetchText(`${b}${f}`).catch((e) => (f === "general.md" ? Promise.reject(e) : null))));
      base = b;
      FILES.forEach((f, i) => { if (got[i] != null) texts[f] = got[i]; });
      lastOk = Date.now();
      return true;
    } catch { /* try next base */ }
  }
  return false;
}

function renderRoster(posts) {
  const stats = new Map();
  for (const p of posts) {
    const k = p.who.startsWith("sub:") ? "sub:*" : p.who;
    const s = stats.get(k) || { n: 0, last: null, subs: new Set() };
    s.n++; s.last = p;
    if (p.who.startsWith("sub:")) s.subs.add(p.who);
    stats.set(k, s);
  }
  const extra = [...stats.keys()].filter((k) => !MEMBERS.some((m) => m.h === k)).map((h) => ({ h, role: "Guest", c: colorOf(h) }));
  $("#roster").innerHTML = `<div class="eyebrow" style="margin:0 8px 10px">Members</div>` + [...MEMBERS, ...extra].map((m) => {
    const s = stats.get(m.h);
    return `<div class="member${who === m.h ? " on" : ""}" data-who="${esc(m.h)}" title="Show only ${esc(m.h)}">
      <span class="avatar${s ? " live" : ""}" style="--c:${m.c}">${m.h === "sub:*" ? "S*" : esc(mono(m.h))}</span>
      <span class="h">${esc(m.h)} <span class="muted small">${s ? fmtInt(s.n) : ""}</span></span>
      <span class="r">${s ? `last: ${esc(s.last.kind || "post")} · ${esc(s.last.when)}` : esc(m.role)}</span>
      ${s && s.subs.size ? `<span class="subs-list">${[...s.subs].map(esc).join(" · ")}</span>` : ""}</div>`;
  }).join("") + `<div class="eyebrow" style="margin:18px 8px 8px">Kinds</div><div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 6px">${
    ["hello", "progress", "claim", "done", "blocker", "question", "review"].map((k) => `<button class="kind ${k}" data-kind="${k}" style="cursor:pointer;background:${kind === k ? "var(--accent-soft)" : "none"}">${k}</button>`).join("")}</div>`;
}

function renderFeed() {
  const { pre, posts } = parsePosts(texts["general.md"] || "");
  renderRoster(posts);
  const fresh = new Set();
  for (const p of posts) { if (!seen.has(p.key)) { if (!firstLoad) fresh.add(p.key); seen.add(p.key); } }
  let list = posts.filter((p) => (!who || (who === "sub:*" ? p.who.startsWith("sub:") : p.who === who)) && (!kind || p.kind === kind));
  if (newestFirst) list = list.slice().reverse();
  $("#feed-body").innerHTML = (pre.trim() && !who && !kind ? `<div class="preamble md">${renderMarkdown(pre)}</div>` : "") + (list.length ? list.map((p) => `
    <article class="post${fresh.has(p.key) ? " is-new" : ""}">
      <span class="avatar" style="--c:${colorOf(p.who)}">${esc(mono(p.who))}</span>
      <div class="ph"><b>${esc(p.who)}</b>${p.kind ? `<span class="kind ${esc(p.kind)}">${esc(p.kind)}</span>` : ""}<time>${esc(p.when)}</time></div>
      <div class="md">${renderMarkdown(p.body)}</div>
    </article>`).join("") : `<div class="empty"><h3>No posts</h3><p>Nothing matches this filter.</p></div>`);
  $("#post-count").textContent = `${fmtInt(posts.length)} posts`;
  if (fresh.size) document.title = `(${fresh.size}) Channel · ICLR 2027 Atlas`;
  firstLoad = false;
}

function renderTab() {
  $$(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  const t = texts[tab];
  let head = "";
  if (tab === "tasks.md" && t) {
    const rows = t.split("\n").filter((l) => /^\|\s*T\d+/.test(l));
    const done = rows.filter((l) => /\[x\]/i.test(l)).length;
    const wip = rows.filter((l) => /\[~\]/.test(l)).length;
    head = `<div class="small muted">${done} of ${rows.length} done${wip ? ` · ${wip} in progress` : ""}</div><div class="pbar"><i style="width:${rows.length ? (100 * done) / rows.length : 0}%"></i></div>`;
  }
  $("#tab-body").innerHTML = t != null ? `${head}<div class="md">${renderMarkdown(t)}</div>` : `<div class="empty"><p>${esc(tab)} not found.</p></div>`;
}

function setLive(state) {
  const el = $("#live");
  el.classList.toggle("paused", state === "paused");
  el.classList.toggle("err", state === "err");
  const ago = lastOk ? `${Math.round((Date.now() - lastOk) / 1000)}s ago` : "never";
  el.textContent = state === "paused" ? `paused · updated ${ago}` : state === "err" ? "files not found" : `live · next in ${countdown}s · updated ${ago}`;
  $("#pause").innerHTML = `${icon(paused ? "play" : "pause")} ${paused ? "Resume" : "Pause"}`;
}

async function refresh() {
  const prev = { ...texts };
  const ok = await fetchAll();
  if (!ok) {
    setLive("err");
    $("#feed-body").innerHTML = `<div class="empty"><h3>Channel files not found</h3><p>Looked in <span class="mono">${esc(DATA_DIR)}/channel/</span> and <span class="mono">../channel/</span>.</p></div>`;
    return;
  }
  if (prev["general.md"] !== texts["general.md"] || firstLoad) renderFeed();
  if (prev[tab] !== texts[tab]) renderTab();
  for (const f of ["tasks.md", "STATUS.md", "RULES.md"]) {
    const b = $(`.tabs [data-tab="${f}"] .badge`);
    if (b && prev[f] != null && prev[f] !== texts[f] && f !== tab) b.textContent = "•";
  }
  setLive(paused ? "paused" : "live");
}

async function main() {
  $("#tabs").innerHTML = [["tasks.md", "Tasks"], ["STATUS.md", "Status"], ["RULES.md", "Rules"]]
    .map(([f, l]) => `<button data-tab="${f}" role="tab">${l}<span class="badge"></span></button>`).join("");
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    tab = b.dataset.tab; setPref("chan.tab", tab);
    b.querySelector(".badge").textContent = "";
    renderTab();
  });
  $("#roster").addEventListener("click", (e) => {
    const k = e.target.closest("[data-kind]");
    if (k) { kind = kind === k.dataset.kind ? "" : k.dataset.kind; renderFeed(); return; }
    const m = e.target.closest("[data-who]");
    if (m) { who = who === m.dataset.who ? "" : m.dataset.who; renderFeed(); }
  });
  const togglePause = () => { paused = !paused; setPref("chan.paused", paused); countdown = POLL_S; setLive(paused ? "paused" : "live"); };
  const toggleOrder = () => { newestFirst = !newestFirst; setPref("chan.newest", newestFirst); $("#order").textContent = newestFirst ? "Newest first" : "Oldest first"; renderFeed(); };
  $("#pause").addEventListener("click", togglePause);
  $("#refresh").addEventListener("click", () => { countdown = POLL_S; refresh(); });
  $("#order").addEventListener("click", toggleOrder);
  $("#order").textContent = newestFirst ? "Newest first" : "Oldest first";
  $("#refresh").innerHTML = `${icon("refresh")} Refresh`;
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "r") { countdown = POLL_S; refresh(); }
    else if (e.key === "p") togglePause();
    else if (e.key === "n") toggleOrder();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) document.title = "Channel · ICLR 2027 Atlas"; });

  renderTab();
  await refresh();
  setInterval(() => {
    if (paused) { setLive("paused"); return; }
    countdown--;
    if (countdown <= 0) { countdown = POLL_S; if (!document.hidden) refresh(); }
    setLive(base ? "live" : "err");
  }, 1000);

  // footer: papers.json timestamp without downloading it
  try {
    const r = await fetch(dataUrl("papers.json"), { method: "HEAD" });
    setFooter({ generated: r.ok ? r.headers.get("last-modified") : null, extra: `<span>channel source <span class="mono">${esc(base || "—")}</span></span>` });
  } catch { setFooter({}); }
}

main();
