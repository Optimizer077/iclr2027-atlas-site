// Agents page: live mission-control view of the multi-agent orchestration (owner: sub:agents-page).
// Polls data/channel/{agents.json, STATUS.md, general.md} every 10 s with ?t= cache-busting; never reloads.
// Graph layout is deterministic: orchestrator at the centre, each agent kind on a fixed ring and bearing.
import { $, esc } from "./core/util.js";
import { icon } from "./core/icons.js";
import { initShell, setFooter, showTip, hideTip, toast } from "./core/shell.js";
import { pageHref } from "./core/data.js";
import { renderMarkdown, inline } from "./core/md.js";

const BASE = "data/channel/";
const POLL_MS = 10000;
const FEED_N = 15;
const NS = "http://www.w3.org/2000/svg";
const CX = 550, CY = 320, KX = 1.6;               // ellipse centre; x-stretch of every ring
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const STATUSES = ["running", "done", "failed", "queued", "seat"];
const KINDS = ["orchestrator", "subagent", "cli", "tool", "seat"];
const KIND_LABEL = { orchestrator: "Orchestrator", subagent: "Claude subagents", cli: "CLI agents", tool: "Tools", seat: "Open seats" };
const KIND_ONE = { orchestrator: "Orchestrator", subagent: "Claude subagent", cli: "CLI agent", tool: "Tool", seat: "Open seat" };
const RADIUS = { orchestrator: 30, subagent: 17, cli: 19, tool: 15, seat: 16 };
// ring radius (y semi-axis), bearing of the group centre (deg, 0 = east, clockwise), member step, max spread
const RING = {
  subagent: { r: 150, bearing: -90, step: 30, max: 300 },
  cli: { r: 230, bearing: 14, step: 26, max: 120 },
  tool: { r: 230, bearing: 166, step: 27, max: 120 },
  seat: { r: 290, bearing: 90, step: 22, max: 70 },
  other: { r: 290, bearing: 222, step: 20, max: 60 },
};
const RINGS = [[150, "I · subagents"], [230, "II · CLIs & tools"], [290, "III · open seats"]];
const SPEED = { data: 64, assigns: 52 };

const KEYS = [["Esc", "Close the agent panel"], ["Tab, Enter", "Focus a node, open its panel"]];
initShell({ page: "agents", keys: KEYS });
ensureNavLink();

/* ---------- small helpers ---------- */
const attr = (s) => esc(s);                                   // value for an HTML attribute
const tipAttr = (html) => esc(html);                          // data-tip holds HTML; escape it once more for the attribute
const pct = (d, t) => (t ? Math.round((100 * d) / t) : 0);
const stripAnsi = (s) => String(s || "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
const rad = (deg) => (deg * Math.PI) / 180;
const pt = (r, deg) => ({ x: CX + r * KX * Math.cos(rad(deg)), y: CY + r * Math.sin(rad(deg)) });

function svg(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  if (parent) parent.append(el);
  return el;
}

function ensureNavLink() {
  const nav = $(".topbar .nav");
  if (!nav || nav.querySelector('[data-page="agents"]')) return;
  const a = document.createElement("a");
  a.href = pageHref("agents.html");
  a.dataset.page = "agents";
  a.setAttribute("aria-current", "page");
  a.textContent = "Agents";
  nav.insertBefore(a, nav.querySelector('[data-page="channel"]') || null);
}

function shortName(a) {
  if (/^sub:/.test(a.id) && !String(a.label || "").includes(" · ")) return a.id.slice(4);
  const parts = String(a.label || a.id).replace(/\s*\(open seat\)\s*/i, "").split(" · ");
  if (a.kind === "orchestrator" || parts.length < 2) return parts[0];
  if (parts[0] === "Claude") return parts[1];                       // "Claude · site-builder" -> "site-builder"
  return String(a.id).includes(":") ? `${parts[0]} ${parts[1]}` : parts[0];   // "Codex · fact sheets" stays distinct from "Codex CLI"
}
function monogram(a) {
  const base = String(a.id).replace(/^sub:/, "");
  if (base.length <= 3) return base.toUpperCase();
  const parts = base.split(/[-_:\s.]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2)).toUpperCase();
}
const statusWord = (s) => (s === "seat" ? "open seat" : s || "unknown");
function subLabel(a) {
  return a.outputs_total ? `${a.outputs_done}/${a.outputs_total} · ${statusWord(a.status)}` : statusWord(a.status);
}
function parseTime(iso) { const t = Date.parse(iso || ""); return Number.isNaN(t) ? null : t; }
function ago(ms) {
  if (ms == null) return "—";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
function hms(ms) { const d = new Date(ms); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }); }
function fmtAge(sec) {
  if (sec < 60) return `${sec}<small>s</small>`;
  if (sec < 3600) return `${Math.floor(sec / 60)}<small>m</small> ${String(sec % 60).padStart(2, "0")}<small>s</small>`;
  return `${Math.floor(sec / 3600)}<small>h</small> ${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}<small>m</small>`;
}

/* ---------- state ---------- */
const S = {
  data: null, byId: new Map(), selected: null, booted: false,
  updatedMs: null, lastOk: 0, failing: false, nextPoll: 0,
  raw: { agents: "", status: "", general: "", blocks: "" },
  seenPosts: null, events: [],
};
const nodes = new Map();   // id -> { a, g, x, y, tx, ty, R, parts }
const edges = new Map();   // key -> { e, path, hit, parts, len, live, t }
let layoutDirty = true;

/* ---------- graph: static plate + layers ---------- */
const G = $("#graph");
const L = {};
function buildPlate() {
  const defs = svg("defs", {}, G);
  for (const k of ["assigns", "data", "shares", "publishes"]) {
    const m = svg("marker", { id: `mk-${k}`, viewBox: "0 0 10 10", refX: 8.5, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto", markerUnits: "userSpaceOnUse" }, defs);
    svg("path", { class: `mk e-${k}`, d: k === "publishes" ? "M1,1.5 L9,5 L1,8.5" : "M0,1 L9.5,5 L0,9 z" }, m);
  }
  L.plate = svg("g", { class: "plate", "aria-hidden": "true" }, G);
  const outer = RINGS[RINGS.length - 1][0];
  L.tickLabels = [];
  svg("line", { class: "ax", x1: CX - outer * KX, y1: CY, x2: CX + outer * KX, y2: CY }, L.plate);
  svg("line", { class: "ax", x1: CX, y1: CY - outer, x2: CX, y2: CY + outer }, L.plate);
  RINGS.forEach(([r], i) => svg("ellipse", { class: i === RINGS.length - 1 ? "rg bz" : "rg", cx: CX, cy: CY, rx: r * KX, ry: r }, L.plate));
  for (let b = 0; b < 360; b += 5) {
    const major = b % 30 === 0;
    const p1 = pt(outer, b), p2 = pt(outer - (major ? 10 : 5), b);
    svg("line", { class: major ? "tk mj" : "tk", x1: p1.x.toFixed(1), y1: p1.y.toFixed(1), x2: p2.x.toFixed(1), y2: p2.y.toFixed(1) }, L.plate);
    if (major && (b < 50 || b > 130)) {
      const p = pt(outer - 21, b);
      const t = svg("text", { class: "tkl", x: p.x.toFixed(1), y: (p.y + 3).toFixed(1) }, L.plate);
      t.textContent = String(b).padStart(3, "0");
      L.tickLabels.push({ t, x: p.x, y: p.y });
    }
  }
  L.ringLabels = svg("g", { class: "rlabs" }, L.plate);
  L.corner = svg("g", { class: "corner", "aria-hidden": "true" }, G);
  L.edges = svg("g", { class: "edges" }, G);
  L.particles = svg("g", { class: "particles", "aria-hidden": "true" }, G);
  L.nodes = svg("g", { class: "nodes" }, G);
}

function layout(agents) {
  const pos = new Map();
  const groups = new Map();
  for (const a of agents) {
    const k = a.kind === "orchestrator" ? "orchestrator" : RING[a.kind] ? a.kind : "other";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(a);
  }
  const orch = groups.get("orchestrator") || [];
  orch.forEach((a, i) => pos.set(a.id, { x: CX + (i - (orch.length - 1) / 2) * 90, y: CY }));
  for (const [k, list] of groups) {
    if (k === "orchestrator") continue;
    const g = RING[k];
    const n = list.length;
    const step = n > 1 ? Math.min(g.step, g.max / (n - 1)) : 0;
    list.forEach((a, i) => pos.set(a.id, pt(g.r, g.bearing + (i - (n - 1) / 2) * step)));
  }
  return pos;
}

function placeRingLabels() {
  L.ringLabels.replaceChildren();
  const ps = [...nodes.values()].map((n) => ({ x: n.tx, y: n.ty + 14 }));
  for (const k of L.tickLabels) {                                  // bearing numerals give way to node labels
    const near = [...nodes.values()].some((n) => Math.abs(n.tx - k.x) < 70 && k.y - n.ty > -n.R - 8 && k.y - n.ty < n.R + 52);
    k.t.style.display = near ? "none" : "";
  }
  for (const [r, text] of RINGS) {
    let best = null;
    for (let b = -178; b < 180; b += 4) {
      const p = pt(r, b);
      let d = Infinity;
      for (const q of ps) d = Math.min(d, Math.hypot(q.x - p.x, (q.y - p.y) * 1.5));
      const score = d * (Math.sin(rad(b)) < -0.2 ? 1.25 : 1);
      if (!best || score > best.s) best = { ...p, s: score };
    }
    const t = svg("text", { class: "rlab", x: best.x.toFixed(1), y: (best.y - 6).toFixed(1) }, L.ringLabels);
    t.textContent = text.toUpperCase();
  }
}

/* ---------- graph: nodes ---------- */
function hexPath(R) {
  const p = [];
  for (let i = 0; i < 6; i++) { const t = rad(-90 + 60 * i); p.push(`${(R * Math.cos(t)).toFixed(2)},${(R * Math.sin(t)).toFixed(2)}`); }
  return `M${p.join("L")}Z`;
}
function makeNode(a) {
  const kind = KINDS.includes(a.kind) ? a.kind : "tool";
  const R = RADIUS[kind];
  const g = svg("g", { class: "node", tabindex: 0, role: "button", "data-id": a.id });
  const parts = {};
  parts.halo = svg("circle", { class: "halo", r: R + 6 }, g);
  parts.track = svg("circle", { class: "ring-track", r: R + 5.5 }, g);
  parts.prog = svg("circle", { class: "ring-prog", r: R + 5.5, pathLength: 100 }, g);
  if (kind === "orchestrator") {
    svg("circle", { class: "bezel", r: R + 13 }, g);
    svg("circle", { class: "body", r: R }, g);
    svg("path", { class: "rose", d: "M0,-21 L4.2,-4.2 L21,0 L4.2,4.2 L0,21 L-4.2,4.2 L-21,0 L-4.2,-4.2Z" }, g);
    svg("circle", { class: "rose-c", r: 3.2 }, g);
  } else {
    if (kind === "cli") svg("path", { class: "body", d: hexPath(R + 1.5) }, g);
    else if (kind === "tool") svg("rect", { class: "body", x: -R, y: -R, width: 2 * R, height: 2 * R, rx: 3.5 }, g);
    else svg("circle", { class: "body", r: R }, g);
    parts.mono = svg("text", { class: "mono-gl", y: 3.6 }, g);
  }
  parts.sel = svg("circle", { class: "sel", r: R + (kind === "orchestrator" ? 19 : 11) }, g);
  const fail = svg("g", { class: "fail-badge", transform: `translate(${(R * 0.8).toFixed(1)} ${(-R * 0.8).toFixed(1)})` }, g);
  svg("circle", { r: 6.5 }, fail);
  svg("text", { y: 3.4 }, fail).textContent = "!";
  const ly = R + (kind === "orchestrator" ? 34 : 21);
  parts.lbl = svg("text", { class: "lbl", y: ly }, g);
  parts.sub = svg("text", { class: "sub", y: ly + 14 }, g);
  return { a, g, R, kind, parts, x: 0, y: 0, tx: 0, ty: 0, dx: null, dy: null };
}

function updateNode(n, a, i) {
  n.a = a;
  const st = STATUSES.includes(a.status) ? a.status : "queued";
  const indet = st === "running" && !a.outputs_total;
  const cls = `node k-${n.kind} s-${st}${indet ? " indet" : ""}${S.selected === a.id ? " selected" : ""}`;
  if (n.g.getAttribute("class").replace(/\s*(enter|flash|hot)\b/g, "") !== cls) {
    const keep = ["enter", "flash", "hot"].filter((c) => n.g.classList.contains(c));
    n.g.setAttribute("class", [cls, ...keep].join(" "));
  }
  n.g.style.setProperty("--d", `${(i % 7) * -0.37}s`);
  const p = st === "done" ? 100 : a.outputs_total ? pct(a.outputs_done, a.outputs_total) : indet ? 22 : 0;
  n.parts.prog.style.strokeDasharray = `${p} 100`;
  if (n.parts.mono) n.parts.mono.textContent = monogram(a);
  n.parts.lbl.textContent = shortName(a);
  n.parts.sub.textContent = n.kind === "orchestrator" ? `orchestrator · ${statusWord(st)}` : subLabel(a);
  n.g.setAttribute("aria-label", `${a.label || a.id}: ${subLabel(a)}`);
}

function flash(n) {
  n.g.classList.remove("flash");
  void n.g.getBoundingClientRect();
  n.g.classList.add("flash");
  setTimeout(() => n.g.classList.remove("flash"), 1600);
}

/* ---------- graph: edges ---------- */
const edgeKey = (e) => `${e.from}>${e.to}>${e.kind}`;
function makeEdge(e) {
  const kind = ["assigns", "data", "shares", "publishes"].includes(e.kind) ? e.kind : "shares";
  const g = svg("g", { class: `link e-${kind}`, "data-key": edgeKey(e) }, L.edges);
  const path = svg("path", { class: `edge e-${kind}`, "marker-end": `url(#mk-${kind})` }, g);
  const hit = svg("path", { class: "hit" }, g);
  const parts = [];
  if (!REDUCED && (kind === "data" || kind === "assigns")) {
    for (let i = 0; i < 2; i++) parts.push(svg("circle", { class: `particle e-${kind}`, r: kind === "data" ? 2.6 : 2.2 }, L.particles));
  }
  return { e, kind, g, path, hit, parts, len: 1, live: false, t: Math.random() };
}

function edgePath(a, b, ra, rb) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(46, Math.max(14, len * 0.12));
  const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
  const trim = (p, r) => { const vx = c.x - p.x, vy = c.y - p.y, l = Math.hypot(vx, vy) || 1; return { x: p.x + (vx / l) * r, y: p.y + (vy / l) * r }; };
  const p1 = trim(a, ra + 8), p2 = trim(b, rb + 10);
  return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
}

function updateEdgePaths() {
  for (const ed of edges.values()) {
    const a = nodes.get(ed.e.from), b = nodes.get(ed.e.to);
    if (!a || !b) { ed.g.style.display = "none"; ed.parts.forEach((p) => (p.style.display = "none")); continue; }
    ed.g.style.display = "";
    const d = edgePath(a, b, a.R, b.R);
    ed.path.setAttribute("d", d);
    ed.hit.setAttribute("d", d);
    ed.len = ed.path.getTotalLength() || 1;
  }
}

function edgeLive(e) {
  const ends = [S.byId.get(e.from), S.byId.get(e.to)].filter(Boolean);
  if (ends.some((a) => a.status === "seat")) return false;
  return ends.some((a) => a.kind !== "orchestrator" && (a.status === "running" || a.status === "queued" && e.kind === "assigns"));
}

function moveParticles(dt) {
  for (const ed of edges.values()) {
    if (!ed.parts.length) continue;
    const show = ed.live && ed.g.style.display !== "none";
    if (!show) { for (const p of ed.parts) p.style.display = "none"; continue; }
    ed.t = (ed.t + (dt * SPEED[ed.kind]) / ed.len) % 1;
    ed.parts.forEach((p, k) => {
      const u = (ed.t + k / ed.parts.length) % 1;
      const q = ed.path.getPointAtLength(u * ed.len);
      p.style.display = "";
      p.setAttribute("cx", q.x.toFixed(1));
      p.setAttribute("cy", q.y.toFixed(1));
      p.setAttribute("opacity", (0.2 + 0.8 * Math.sin(Math.PI * u)).toFixed(2));
    });
  }
}

let lastTs = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000);
  lastTs = ts;
  for (const n of nodes.values()) {
    const dx = n.tx - n.x, dy = n.ty - n.y;
    if (REDUCED || Math.abs(dx) + Math.abs(dy) < 0.4) { n.x = n.tx; n.y = n.ty; }
    else { const k = 1 - Math.exp(-dt * 5); n.x += dx * k; n.y += dy * k; }
    if (n.dx !== n.x || n.dy !== n.y) {
      n.g.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      n.dx = n.x; n.dy = n.y; layoutDirty = true;
    }
  }
  if (layoutDirty) { updateEdgePaths(); layoutDirty = false; }
  if (!REDUCED) moveParticles(dt);
  requestAnimationFrame(frame);
}

function renderGraph(data) {
  const agents = data.agents || [];
  const pos = layout(agents);
  const seen = new Set();
  agents.forEach((a, i) => {
    seen.add(a.id);
    let n = nodes.get(a.id);
    const kind = KINDS.includes(a.kind) ? a.kind : "tool";
    if (n && n.kind !== kind) { n.g.remove(); nodes.delete(a.id); n = null; }
    const p = pos.get(a.id);
    if (!n) {
      n = makeNode(a);
      n.x = p.x; n.y = p.y;
      if (S.booted) n.g.classList.add("enter");
      nodes.set(a.id, n);
      L.nodes.append(n.g);
    } else if (S.booted && (n.a.status !== a.status || n.a.outputs_done !== a.outputs_done)) {
      flash(n);
      logEvent(a, n.a);
    }
    n.tx = p.x; n.ty = p.y;
    updateNode(n, a, i);
  });
  for (const [id, n] of nodes) if (!seen.has(id)) { n.g.classList.add("leave"); setTimeout(() => n.g.remove(), 600); nodes.delete(id); }
  const ekeys = new Set();
  for (const e of data.edges || []) {
    const k = edgeKey(e);
    if (ekeys.has(k)) continue;
    ekeys.add(k);
    let ed = edges.get(k);
    if (!ed) { ed = makeEdge(e); edges.set(k, ed); }
    ed.e = e;
    ed.live = edgeLive(e);
    ed.g.classList.toggle("idle", !ed.live);
  }
  for (const [k, ed] of edges) if (!ekeys.has(k)) { ed.g.remove(); ed.parts.forEach((p) => p.remove()); edges.delete(k); }
  placeRingLabels();
  layoutDirty = true;
  applyFocus();
  $("#graph-note").textContent = `${agents.length} agents · ${ekeys.size} links · fixed ring layout`;
}

/* corner caption: change events seen since this page opened */
function logEvent(a, old) {
  const what = old.status !== a.status ? `${statusWord(old.status)} → ${statusWord(a.status)}` : `${old.outputs_done}/${old.outputs_total} → ${a.outputs_done}/${a.outputs_total}`;
  S.events.unshift({ t: Date.now(), who: shortName(a), what });
  S.events.length = Math.min(S.events.length, 4);
  if (old.status !== a.status) toast(`${shortName(a)}: ${what}`, 3200);
  drawCorner();
}
function drawCorner() {
  L.corner.replaceChildren();
  const x = 1086;
  svg("text", { class: "cn-h", x, y: 24 }, L.corner).textContent = "CHANGES SINCE YOU OPENED THIS PAGE";
  if (!S.events.length) { svg("text", { class: "cn-e muted", x, y: 42 }, L.corner).textContent = "watching… none yet"; return; }
  S.events.forEach((ev, i) => {
    const t = svg("text", { class: `cn-e${i === 0 ? " latest" : ""}`, x, y: 42 + i * 16 }, L.corner);
    t.textContent = `${hms(ev.t)}  ${ev.who}  ${ev.what}`;
  });
}

/* focus: selected node lights its links, everything else recedes */
function applyFocus() {
  const id = S.selected;
  G.classList.toggle("focus", !!id && nodes.has(id));
  const hot = new Set(id ? [id] : []);
  for (const ed of edges.values()) {
    const on = !!id && (ed.e.from === id || ed.e.to === id);
    ed.g.classList.toggle("hot", on);
    if (on) { hot.add(ed.e.from); hot.add(ed.e.to); }
  }
  for (const [nid, n] of nodes) {
    n.g.classList.toggle("hot", hot.has(nid));
    n.g.classList.toggle("selected", nid === id);
  }
}

/* ---------- graph: interaction ---------- */
function nodeTip(a) {
  const prog = a.outputs_total ? ` · ${a.outputs_done}/${a.outputs_total} outputs` : "";
  return `<div class="t">${esc(a.label || a.id)}</div>${esc(a.role || "")}<div class="m">${esc(KIND_ONE[a.kind] || a.kind)} · ${esc(statusWord(a.status))}${esc(prog)}</div>`;
}
function edgeTip(e) {
  const f = S.byId.get(e.from), t = S.byId.get(e.to);
  return `<div class="t">${esc(f ? shortName(f) : e.from)} → ${esc(t ? shortName(t) : e.to)}</div>${esc(e.label || "")}<div class="m">${esc(e.kind)}</div>`;
}
function bindGraph() {
  G.addEventListener("pointermove", (ev) => {
    const nd = ev.target.closest?.(".node");
    const ln = ev.target.closest?.(".link");
    G.querySelectorAll(".link.hov").forEach((x) => x !== ln && x.classList.remove("hov"));
    if (nd) { const a = S.byId.get(nd.dataset.id); if (a) showTip(nodeTip(a), ev.clientX, ev.clientY); return; }
    if (ln) { const ed = edges.get(ln.dataset.key); ln.classList.add("hov"); if (ed) showTip(edgeTip(ed.e), ev.clientX, ev.clientY); return; }
    hideTip();
  });
  G.addEventListener("pointerleave", () => { hideTip(); G.querySelectorAll(".link.hov").forEach((x) => x.classList.remove("hov")); });
  G.addEventListener("click", (ev) => {
    const nd = ev.target.closest?.(".node");
    select(nd ? (S.selected === nd.dataset.id ? null : nd.dataset.id) : null);
  });
  G.addEventListener("keydown", (ev) => {
    const nd = ev.target.closest?.(".node");
    if (nd && (ev.key === "Enter" || ev.key === " ")) { select(nd.dataset.id); ev.preventDefault(); }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && S.selected && !document.querySelector(".modal-back")) { select(null); ev.preventDefault(); }
  });
  $("#panel").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-sel]");
    if (b) { select(b.dataset.sel || null); return; }
    if (ev.target.closest("[data-act=close]")) select(null);
  });
}

function select(id) {
  S.selected = id && S.byId.has(id) ? id : null;
  try {
    const url = `${location.pathname}${location.search}${S.selected ? `#agent=${encodeURIComponent(S.selected)}` : ""}`;
    history.replaceState(null, "", url);
  } catch { /* history unavailable (file://) */ }
  applyFocus();
  renderPanel(true);
}

/* ---------- side panel ---------- */
let panelSig = "";
function renderPanel(force = false) {
  const a = S.selected ? S.byId.get(S.selected) : null;
  const sig = a ? `a:${JSON.stringify(a)}` : `r:${S.raw.agents.replace(/"updated":\s*"[^"]*"/, "")}`;
  if (!force && sig === panelSig) return;
  panelSig = sig;
  const el = $("#panel");
  el.innerHTML = a ? agentPanel(a) : rosterPanel();
  if (force) el.scrollTop = 0;
}

function glyph(kind, st) { return `<span class="gl k-${esc(kind)} s-${esc(st)}" aria-hidden="true"></span>`; }

function rosterPanel() {
  const agents = S.data?.agents || [];
  const groups = KINDS.map((k) => [k, agents.filter((a) => a.kind === k)]).filter(([, l]) => l.length);
  const other = agents.filter((a) => !KINDS.includes(a.kind));
  if (other.length) groups.push(["other", other]);
  return `<div class="pn-head"><span class="eyebrow">Roster</span><span class="grow"></span><span class="mono small muted">${agents.length} agents</span></div>
    <p class="pn-hint">Select a node on the chart, or a row below, to read its role, outputs and log.</p>
    ${groups.map(([k, list]) => `<div class="ro-group"><div class="ro-gh"><span>${esc(KIND_LABEL[k] || k)}</span><span class="mono">${list.length}</span></div>
      ${list.map((a) => {
        const st = STATUSES.includes(a.status) ? a.status : "queued";
        const p = a.outputs_total ? pct(a.outputs_done, a.outputs_total) : st === "done" ? 100 : 0;
        return `<button class="ro-row s-${st}" data-sel="${attr(a.id)}" title="${attr(a.role || "")}">
          ${glyph(a.kind, st)}<span class="ro-name">${esc(shortName(a))}</span>
          <span class="ro-bar"><i style="width:${p}%"></i></span>
          <span class="ro-st mono">${a.outputs_total ? `${a.outputs_done}/${a.outputs_total}` : esc(statusWord(st))}</span></button>`;
      }).join("")}</div>`).join("")}`;
}

function outputsList(a) {
  const outs = Array.isArray(a.outputs) ? a.outputs : [];
  if (!outs.length) return `<p class="muted small">No file outputs registered for this agent.</p>`;
  const present = Array.isArray(a.outputs_present) ? new Set(a.outputs_present) : null;
  const all = a.outputs_done >= outs.length, none = !a.outputs_done;
  const mark = (o) => (present ? (present.has(o) ? "done" : "todo") : all ? "done" : none ? "todo" : "unk");
  const sym = { done: "✓", todo: "○", unk: "·" };
  const note = !present && !all && !none ? `<p class="muted small">${a.outputs_done} of ${outs.length} present; the feed does not say which.</p>` : "";
  return `<ul class="outs">${outs.map((o) => { const m = mark(o); return `<li class="o-${m}"><span class="ob">${sym[m]}</span><span class="mono">${esc(o)}</span></li>`; }).join("")}</ul>${note}`;
}

function agentPanel(a) {
  const st = STATUSES.includes(a.status) ? a.status : "queued";
  const p = a.outputs_total ? pct(a.outputs_done, a.outputs_total) : st === "done" ? 100 : 0;
  const last = parseTime(a.last_activity);
  const links = (S.data?.edges || []).filter((e) => e.from === a.id || e.to === a.id);
  const tail = stripAnsi(a.log_tail).trim();
  return `<div class="pn-head"><button class="btn ghost sm" data-act="close" title="Back to roster (Esc)">${icon("back")} Roster</button><span class="grow"></span><span class="eyebrow">${esc(KIND_ONE[a.kind] || a.kind)}</span></div>
    <div class="pn-title">${glyph(a.kind, st)}<h3>${esc(a.label || a.id)}</h3></div>
    <div class="pn-meta"><span class="st-badge s-${st}">${esc(statusWord(st))}</span><span class="mono small">${esc(a.id)}</span></div>
    <dl class="pn-dl"><dt>Engine</dt><dd>${esc(a.engine || "—")}</dd><dt>Role</dt><dd class="pn-role">${esc(a.role || "—")}</dd></dl>
    <div class="pn-sec"><div class="eyebrow">Outputs</div>
      <div class="pn-prog s-${st}"><b class="mono">${a.outputs_done || 0}<span>/${a.outputs_total || 0}</span></b><div class="bar"><i style="width:${p}%"></i></div><span class="mono">${p}%</span></div>
      ${outputsList(a)}</div>
    <div class="pn-sec"><div class="eyebrow">Last activity</div>
      <div>${last ? `${esc(ago(last))} <span class="mono muted small">${esc(new Date(last).toLocaleString([], { hour12: false }))}</span>` : `<span class="muted">no log or output activity recorded</span>`}</div></div>
    <div class="pn-sec"><div class="eyebrow">Log tail ${a.log ? `<span class="mono lc">${esc(a.log)}</span>` : ""}</div>
      ${tail ? `<pre class="log scroll-thin">${esc(tail)}</pre>` : `<p class="muted small">${a.log ? "log is empty" : "no log file for this agent"}</p>`}</div>
    <div class="pn-sec"><div class="eyebrow">Links · ${links.length}</div>
      <ul class="links">${links.map((e) => {
        const out = e.from === a.id, other = S.byId.get(out ? e.to : e.from);
        const oid = out ? e.to : e.from;
        return `<li><span class="lk e-${esc(e.kind)}">${out ? "→" : "←"}</span><button class="lk-to" data-sel="${attr(oid)}">${esc(other ? shortName(other) : oid)}</button><span class="lk-k mono">${esc(e.kind)}</span><span class="lk-l">${esc(e.label || "")}</span></li>`;
      }).join("") || `<li class="muted small">none</li>`}</ul></div>`;
}

/* ---------- header strip ---------- */
function renderHeader(data) {
  const agents = data.agents || [];
  const by = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const a of agents) by[STATUSES.includes(a.status) ? a.status : "queued"]++;
  $("#counts").innerHTML = `<div class="eyebrow">Agents by status</div><div class="cnts">${STATUSES.map((s) =>
    `<div class="cnt s-${s}${by[s] ? "" : " zero"}"><b class="mono">${by[s]}</b><span><i></i>${s === "seat" ? "seats" : s}</span></div>`).join("")}</div>`;
  const withOut = agents.filter((a) => a.outputs_total > 0);
  const done = withOut.reduce((s, a) => s + (a.outputs_done || 0), 0);
  const total = withOut.reduce((s, a) => s + a.outputs_total, 0);
  const p = total ? (100 * done) / total : 0;
  $("#progress").innerHTML = `<div class="pg-top"><div class="eyebrow">Outputs delivered</div><span class="grow"></span>
      <b class="pg-pct mono">${p.toFixed(p > 0 && p < 10 ? 1 : 0)}<small>%</small></b></div>
    <div class="segbar" role="img" aria-label="${done} of ${total} outputs delivered">${withOut.map((a) => {
      const st = STATUSES.includes(a.status) ? a.status : "queued";
      const tip = `<div class="t">${esc(a.label || a.id)}</div><div class="m">${a.outputs_done}/${a.outputs_total} outputs · ${esc(statusWord(st))}</div>`;
      return `<span class="seg s-${st}" style="flex-grow:${a.outputs_total}" data-tip="${tipAttr(tip)}"><i style="width:${pct(a.outputs_done, a.outputs_total)}%"></i></span>`;
    }).join("") || `<span class="seg"></span>`}</div>
    <div class="pg-foot mono"><span><b>${done}</b> / ${total} files</span><span>${withOut.length} agents with outputs</span></div>`;
}

function tick() {
  const now = Date.now();
  const age = S.updatedMs != null ? Math.max(0, Math.round((now - S.updatedMs) / 1000)) : null;
  $("#age").innerHTML = age == null ? "—" : fmtAge(age);
  const state = S.failing ? "lost" : age == null ? "wait" : age < 60 ? "live" : age < 180 ? "lag" : "stale";
  const word = { lost: "connection lost · retrying", wait: "connecting", live: "live", lag: "lagging", stale: "stale feed" }[state];
  $("#beacon").className = `beacon b-${state}`;
  $("#beacon-lbl").textContent = word;
  const next = Math.max(0, Math.ceil((S.nextPoll - now) / 1000));
  $("#clock").innerHTML = `${esc(hms(now))} local · next poll ${S.nextPoll ? `${next}s` : "…"}`;
}

/* ---------- task blocks (kanban) ---------- */
const LANES = [["queued", "Queued"], ["running", "Running"], ["done", "Done"]];
function ownerHTML(owner) {
  let s = esc(owner || "—");
  const ids = [...S.byId.keys()].sort((x, y) => y.length - x.length);
  const ph = [];
  for (const id of ids) {
    const re = new RegExp(`(^|[^\\w:-])(${esc(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w-])`, "g");
    s = s.replace(re, (m, pre, hit) => { ph.push(hit); return `${pre}\u0000${ph.length - 1}\u0000`; });
  }
  return s.replace(/\u0000(\d+)\u0000/g, (_, k) => {
    const a = S.byId.get(ph[Number(k)]);
    return `<button class="who k-${esc(a?.kind || "tool")}" data-sel="${attr(a?.id || "")}">${esc(ph[Number(k)])}</button>`;
  });
}
function renderBlocks(blocks) {
  const sig = JSON.stringify(blocks) + [...S.byId.keys()].join();
  if (sig === S.raw.blocks) return;
  S.raw.blocks = sig;
  const box = $("#lanes");
  const before = new Map();
  box.querySelectorAll(".blk[data-id]").forEach((el) => before.set(el.dataset.id, { r: el.getBoundingClientRect(), st: el.dataset.st }));
  const lanes = [...LANES];
  if (blocks.some((b) => b.status === "failed")) lanes.push(["failed", "Failed"]);
  const known = new Set(lanes.map(([k]) => k));
  const laneOf = (b) => (known.has(b.status) ? b.status : "queued");
  box.innerHTML = lanes.map(([k, label]) => {
    const list = blocks.filter((b) => laneOf(b) === k);
    return `<div class="lane l-${k}"><div class="lane-h"><i></i><span>${label}</span><b class="mono">${list.length}</b></div>
      <div class="lane-b">${list.map((b) => {
        const outs = String(b.output || "").split(/`?\s*,\s*`?/).map((x) => x.replace(/`/g, "").trim()).filter((x) => x && x !== "—");
        return `<article class="blk s-${k}" data-id="${attr(b.id)}" data-st="${k}">
          <header><span class="blk-id mono">${esc(b.id)}</span><span class="blk-owner">${ownerHTML(b.owner)}</span></header>
          <p class="blk-task">${inline(b.task || "")}</p>
          ${outs.length ? `<div class="blk-out">${outs.map((o) => `<span class="mono">${esc(o)}</span>`).join("")}</div>` : ""}</article>`;
      }).join("") || `<div class="lane-empty">none</div>`}</div></div>`;
  }).join("");
  const counts = Object.fromEntries(LANES.map(([k]) => [k, blocks.filter((b) => laneOf(b) === k).length]));
  $("#blocks-note").textContent = `${blocks.length} blocks · ${counts.done} done`;
  if (!S.booted || REDUCED) return;
  box.querySelectorAll(".blk[data-id]").forEach((el) => {             // FLIP: slide cards from their old lane
    const old = before.get(el.dataset.id);
    if (!old) { el.classList.add("blk-new"); return; }
    const r = el.getBoundingClientRect();
    const dx = old.r.left - r.left, dy = old.r.top - r.top;
    if (old.st !== el.dataset.st) el.classList.add("blk-moved");
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" });
  });
}

/* ---------- pipeline status (STATUS.md) ---------- */
function renderPipeline(md) {
  if (md === S.raw.status) return;
  S.raw.status = md;
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const title = (lines.find((l) => /^#\s/.test(l)) || "").replace(/^#\s+/, "");
  const stamp = (title.match(/[—-]\s*(.+)$/) || [])[1] || "";
  $("#pipe-note").textContent = stamp ? `as of ${stamp}` : "";
  const tl = lines.filter((l) => l.trim().startsWith("|"));
  if (tl.length < 3) { $("#pipe").innerHTML = `<div class="md">${renderMarkdown(md)}</div>`; return; }
  const split = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const head = split(tl[0]);
  const rows = tl.slice(2).map(split);
  const iC = Math.max(0, head.findIndex((h) => /count|value|n\b/i.test(h)));
  const iN = head.findIndex((h) => /note|detail/i.test(h));
  $("#pipe").innerHTML = `<ol class="stages">${rows.map((r, i) => {
    const stage = r[0] || "", count = r[iC === 0 ? 1 : iC] || "", note = iN >= 0 ? r[iN] || "" : r.slice(2).join(" · ");
    const fr = count.match(/^([\d,]+)\s*\/\s*([\d,]+)$/);
    const num = (s) => Number(String(s).replace(/,/g, ""));
    let st = "todo", bar = "";
    if (fr) {
      const d = num(fr[1]), t = num(fr[2]);
      st = t && d >= t ? "ok" : d > 0 ? "wip" : "todo";
      bar = `<span class="st-bar"><i style="width:${t ? pct(d, t) : 0}%"></i></span>`;
    } else if (num(count) > 0) st = "ok";
    if (/blocked|fail|error/i.test(note)) st = "block";
    return `<li class="stage p-${st}"><span class="st-n mono">${String(i + 1).padStart(2, "0")}</span>
      <span class="st-name">${inline(stage)}</span><span class="st-count mono">${inline(count)}${bar}</span>
      <span class="st-note">${inline(note)}</span></li>`;
  }).join("")}</ol>`;
}

/* ---------- live feed (general.md) ---------- */
function parsePosts(md) {
  const posts = [];
  let cur = null;
  for (const l of md.replace(/\r\n?/g, "\n").split("\n")) {
    const m = l.match(/^###\s+(.+?)\s*$/);
    if (m) {
      const parts = m[1].split(/\s+·\s+/);
      const tail = parts.slice(2).join(" · ").trim();                 // "done batch_0151 → …": kind is the first word
      const kind = (tail.match(/^[A-Za-z-]+/) || [""])[0].toLowerCase();
      const extra = tail.slice(kind.length).trim();
      cur = { head: m[1], time: parts[0] || "", handle: parts[1] || "", kind, body: extra ? [extra] : [] };
      posts.push(cur);
    } else if (/^#{1,2}\s/.test(l)) cur = null;
    else if (cur) cur.body.push(l);
  }
  posts.forEach((p, i) => { p.body = p.body.join("\n").trim(); p.key = `${i}|${p.head}`; });
  return posts;
}
function renderFeed(md) {
  if (md === S.raw.general) return;
  S.raw.general = md;
  const posts = parsePosts(md);
  const firstLoad = !S.seenPosts;
  if (firstLoad) S.seenPosts = new Set();
  const show = posts.slice(-FEED_N).reverse();
  const fresh = new Set(show.filter((p) => !firstLoad && !S.seenPosts.has(p.key)).map((p) => p.key));
  posts.forEach((p) => S.seenPosts.add(p.key));
  const feed = $("#feed");
  const prevFresh = new Set([...feed.querySelectorAll(".post.new")].map((el) => el.dataset.key));
  feed.innerHTML = show.map((p) => {
    const tm = p.time.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2}))?/);
    const a = S.byId.get(p.handle);
    const isNew = fresh.has(p.key) || prevFresh.has(p.key);
    return `<li class="post k-${esc(p.kind || "note")}${isNew ? " new" : ""}" data-key="${attr(p.key)}">
      <div class="post-t mono">${tm?.[2] ? `<b>${esc(tm[2])}</b>` : "<b>—</b>"}<span>${esc(tm ? tm[1].slice(5) : p.time)}</span></div>
      <div class="post-m"><div class="post-h"><button class="who k-${esc(a?.kind || (/^(sub|wf):/.test(p.handle) ? "subagent" : "tool"))}" data-sel="${attr(a ? a.id : "")}"${a ? "" : " disabled"}>${esc(p.handle || "?")}</button>
        <span class="kb">${esc(p.kind || "note")}</span>${isNew ? `<span class="new-pill">new</span>` : ""}</div>
        <div class="post-b md">${renderMarkdown(p.body)}</div></div></li>`;
  }).join("") || `<li class="empty small">No posts yet.</li>`;
  $("#feed-note").textContent = `${posts.length} posts · newest ${Math.min(FEED_N, posts.length)}`;
  if (fresh.size) setTimeout(() => feed.querySelectorAll(".post.new").forEach((el) => fresh.has(el.dataset.key) && el.classList.add("settle")), 9000);
}
$("#mc").addEventListener("click", (ev) => {
  const b = ev.target.closest(".mc-blocks [data-sel], .mc-feed [data-sel]");
  if (b && b.dataset.sel) { select(b.dataset.sel); $(".mc-graph").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" }); }
});

/* ---------- legend ---------- */
function renderLegend() {
  const shape = (k) => `<span class="gl k-${k} s-done" aria-hidden="true"></span>`;
  const line = (k) => `<svg class="lg-line" viewBox="0 0 34 8" aria-hidden="true"><path class="edge e-${k}" d="M1,4 H27" marker-end="url(#mk-${k})"/></svg>`;
  $("#legend").innerHTML = `
    <div class="lg"><span class="eyebrow">Kinds</span>${KINDS.map((k) => `<span class="lg-i">${shape(k)}${esc(KIND_ONE[k])}</span>`).join("")}</div>
    <div class="lg"><span class="eyebrow">Status ring</span>${STATUSES.map((s) => `<span class="lg-i"><span class="lg-st s-${s}"></span>${s === "seat" ? "open seat" : s}</span>`).join("")}</div>
    <div class="lg"><span class="eyebrow">Links</span>${["assigns", "data", "shares", "publishes"].map((k) => `<span class="lg-i">${line(k)}${k}</span>`).join("")}<span class="lg-i muted">dots flow while the far end is working</span></div>`;
}

/* ---------- polling ---------- */
async function getText(name) {
  const r = await fetch(`${BASE}${name}?t=${Date.now()}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${name}`);
  return r.text();
}

function applyAgents(text) {
  let data;
  try { data = JSON.parse(text); } catch { return false; }          // half-written file: keep the last good state
  if (!data || !Array.isArray(data.agents)) return false;
  S.raw.agents = text;
  S.data = data;
  S.byId = new Map(data.agents.map((a) => [a.id, a]));
  S.updatedMs = parseTime(data.updated);
  if (S.selected && !S.byId.has(S.selected)) S.selected = null;
  renderHeader(data);
  renderGraph(data);
  renderPanel();
  renderBlocks(Array.isArray(data.blocks) ? data.blocks : []);
  setFooter({ generated: data.updated, extra: `<span>channel <span class="mono">${esc(BASE)}</span> · polled every ${POLL_MS / 1000} s</span>` });
  return true;
}

let pollTimer = 0;
async function poll() {
  clearTimeout(pollTimer);
  const [ra, rs, rg] = await Promise.allSettled([getText("agents.json"), getText("STATUS.md"), getText("general.md")]);
  let ok = false;
  if (ra.status === "fulfilled") ok = applyAgents(ra.value) || !!S.data;
  if (rs.status === "fulfilled") renderPipeline(rs.value);
  if (rg.status === "fulfilled") renderFeed(rg.value);
  S.failing = ra.status === "rejected";
  if (ok) S.lastOk = Date.now();
  if (!S.booted && S.data) {
    S.booted = true;
    const m = location.hash.match(/agent=([^&]+)/);
    if (m) { try { select(decodeURIComponent(m[1])); } catch { /* malformed hash */ } }
  }
  S.nextPoll = Date.now() + POLL_MS;
  pollTimer = setTimeout(poll, POLL_MS);
  tick();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && Date.now() > S.nextPoll - 1000) poll();
});

buildPlate();
drawCorner();
renderLegend();
bindGraph();
tick();
setInterval(tick, 1000);
requestAnimationFrame(frame);
poll();
