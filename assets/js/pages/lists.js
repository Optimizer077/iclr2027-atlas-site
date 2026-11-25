// Lists: named paper lists (localStorage) with notes; rename / colour / delete; sortable table;
// export Markdown / CSV / JSON, import JSON, and share links (#share&name=…&ids=…) that offer import.
import { $, $$, esc, fmt, fmtInt, debounce, download, fmtDate } from "../core/util.js";
import { icon } from "../core/icons.js";
import { loadPapers, loadTaxonomy, loadStats, pageHref, forumUrl, orPdfUrl } from "../core/data.js";
import { initShell, setFooter, loadingOverlay, toast } from "../core/shell.js";
import { chipsHTML, ratingColor } from "../core/scale.js";
import { STARRED, LIST_COLORS, getLists, getList, createList, renameList, setListColor, deleteList, removeFromList,
  importList, getNote, setNote, onStoreChange, getPref, setPref } from "../core/store.js";
import { PaperDrawer } from "../components/detail.js";

initShell({ page: "lists", keys: [["n", "New list"], ["Esc", "Close drawer"]] });

const COLS = [
  ["added", "Added", (p, it) => -it.added], ["t", "Title", (p) => p.t.toLowerCase()], ["r", "Mean", (p) => -(p.r ?? -1)],
  ["sd", "Std", (p) => -(p.sd ?? -1)], ["cw", "Conf. mean", (p) => -(p.cw ?? -1)], ["rk", "Rank", (p) => p.rk ?? 1e9],
  ["maj", "Category", (p, it, tax) => tax.major(p.maj).name], ["n", "#", (p) => p.n],
];

async function main() {
  const ov = loadingOverlay("Loading your lists");
  let d, tax, stats;
  try { [d, tax, stats] = await Promise.all([loadPapers(ov.progress), loadTaxonomy(), loadStats()]); }
  catch (e) { ov.error(e.message || String(e)); return; }
  const { meta, papers, byId } = d;
  setFooter({ generated: meta.generated, records: papers.length });
  const rankedCount = papers.reduce((n, p) => n + (p.rk != null ? 1 : 0), 0);
  const drawer = new PaperDrawer($("#drawer"), { byId, tax, stats, rankedCount });

  const hp = () => new URLSearchParams(location.hash.slice(1));
  let cur = hp().get("list") || getPref("lists.current", STARRED);
  if (!getList(cur)) cur = STARRED;
  let sort = getPref("lists.sort", { k: "added", d: 1 });
  let q = "";
  let share = null;

  const setHash = () => history.replaceState(null, "", `${location.pathname}${location.search}#list=${encodeURIComponent(cur)}`);

  /* ---------- shared-link import ---------- */
  const h0 = hp();
  if (h0.has("ids")) {
    share = { name: h0.get("name") || "Shared list", color: h0.get("color") ? `#${h0.get("color").replace(/^#/, "")}` : null,
      ids: h0.get("ids").split(",").map((s) => s.trim()).filter(Boolean) };
  }

  /* ---------- rendering ---------- */
  function renderSide() {
    $("#lists-nav").innerHTML = getLists().map((l) => `<button class="lnav${l.id === cur ? " on" : ""}" data-sel="${esc(l.id)}" style="--c:${l.color}">
      <i></i><span class="nm">${esc(l.name)}</span><span class="ct">${fmtInt(l.items.length)}</span></button>`).join("");
  }

  function rowsFor(l) {
    const tq = q.toLowerCase().split(/\s+/).filter(Boolean);
    let rows = l.items.map((it) => ({ it, p: byId.get(it.id) })).filter((r) => r.p);
    if (tq.length) rows = rows.filter(({ p }) => tq.every((w) => p._q.includes(w) || getNote(p.id).toLowerCase().includes(w)));
    const col = COLS.find((c) => c[0] === sort.k) || COLS[0];
    const key = ({ p, it }) => col[2](p, it, tax);
    rows.sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.d; });
    return rows;
  }

  function renderMain() {
    const l = getList(cur);
    if (!l) return;
    const missing = l.items.filter((it) => !byId.has(it.id)).length;
    $("#list-head").innerHTML = `
      <button class="lcolor" data-act="color" style="--c:${l.color}" title="Change colour"></button>
      <div class="lh-t"><h1 data-act="rename" title="Click to rename">${esc(l.name)}</h1>
        <div class="muted small">${fmtInt(l.items.length)} papers${missing ? ` · ${missing} not in this dataset` : ""} · updated ${esc(fmtDate(new Date(l.updated).toISOString()))}</div></div>
      <div class="lh-acts">
        <a class="btn sm" href="${pageHref("index.html", `list=${encodeURIComponent(l.id)}`)}">${icon("open")} Open in Explorer</a>
        <button class="btn sm" data-act="rename">${icon("edit")} Rename</button>
        <button class="btn sm" data-act="share">${icon("link")} Share link</button>
        <button class="btn sm" data-act="md">${icon("download")} Markdown</button>
        <button class="btn sm" data-act="csv">${icon("download")} CSV</button>
        <button class="btn sm" data-act="json">${icon("download")} JSON</button>
        ${l.id === STARRED ? "" : `<button class="btn sm ghost danger" data-act="delete">${icon("trash")} Delete</button>`}
      </div>`;
    const rows = rowsFor(l);
    const DESC = new Set(["added", "r", "sd", "cw"]); // keys stored negated: d = 1 means high → low
    const arrow = (k) => ((sort.d > 0) === DESC.has(k) ? " ▼" : " ▲");
    const th = ([k, label]) => `<th data-sort="${k}" class="${sort.k === k ? "on" : ""}${["r", "sd", "cw", "rk", "n"].includes(k) ? " n" : ""}">${label}${sort.k === k ? arrow(k) : ""}</th>`;
    $("#list-body").innerHTML = l.items.length ? `<div class="tbl-scroll"><table class="tbl ltbl"><thead><tr>
        ${th(COLS[7])}${th(COLS[1])}<th>Ratings</th>${th(COLS[2])}${th(COLS[3])}${th(COLS[4])}${th(COLS[5])}${th(COLS[0])}<th>Note</th><th></th></tr></thead>
      <tbody>${rows.map(({ p, it }) => {
        const m = tax.major(p.maj);
        return `<tr data-id="${esc(p.id)}">
          <td class="n">${p.n}</td>
          <td class="lt"><a href="#" data-open="${esc(p.id)}">${esc(p.t)}</a>
            <div class="small"><span class="tag" style="--c:${m.color}"><i></i>${esc(m.name)}</span>${p.fine[0] ? ` <span class="tag fine" style="--c:${m.color}"><i></i>${esc(tax.fine(p.fine[0]).name)}</span>` : ""}</div></td>
          <td>${chipsHTML(p.rs)}</td>
          <td class="n"><span class="sc" style="--sc:${p.r != null ? ratingColor(p.r) : "transparent"}">${fmt(p.r)}</span></td>
          <td class="n muted">${fmt(p.sd)}</td>
          <td class="n">${fmt(p.cw)}</td>
          <td class="n">${p.rk != null ? fmtInt(p.rk) : "—"}</td>
          <td class="muted small nowrap">${esc(fmtDate(new Date(it.added).toISOString(), false))}</td>
          <td class="lnote"><textarea data-note="${esc(p.id)}" rows="1" placeholder="Add a note">${esc(getNote(p.id))}</textarea></td>
          <td><button class="icon-btn" data-rm="${esc(p.id)}" title="Remove from list">${icon("close")}</button></td></tr>`;
      }).join("")}</tbody></table></div>${rows.length ? "" : `<div class="empty"><p>No paper matches “${esc(q)}”.</p></div>`}`
      : `<div class="empty card"><h3>This list is empty</h3><p>In the <a href="${pageHref("index.html")}">Explorer</a> press <span class="kbd">l</span> on a paper (or <span class="kbd">s</span> to star it), or use <b>Add results to list</b> to add a whole search.</p></div>`;
    // Measure existing notes together so large lists need only one layout pass.
    const notes = $$("#list-body textarea").filter((t) => t.value);
    const heights = notes.map((t) => Math.min(160, t.scrollHeight + 2));
    notes.forEach((t, i) => { t.style.height = `${heights[i]}px`; });
  }

  function renderShare() {
    const el = $("#share-banner");
    if (!share) { el.innerHTML = ""; el.classList.add("hidden"); return; }
    const found = share.ids.filter((id) => byId.has(id));
    el.classList.remove("hidden");
    el.innerHTML = `<div><b>Shared list “${esc(share.name)}”</b> · ${fmtInt(share.ids.length)} papers${found.length < share.ids.length ? ` (${fmtInt(found.length)} found in this dataset)` : ""}
      <ol class="share-prev">${found.slice(0, 8).map((id) => `<li><a href="#" data-open="${esc(id)}">${esc(byId.get(id).t)}</a></li>`).join("")}${found.length > 8 ? `<li class="muted">… and ${fmtInt(found.length - 8)} more</li>` : ""}</ol></div>
      <div class="sb-acts"><button class="btn primary sm" data-act="import-share">Import as a new list</button><button class="btn sm ghost" data-act="dismiss-share">Dismiss</button></div>`;
  }

  const render = () => { renderSide(); renderMain(); renderShare(); };
  const autoGrow = (t) => { t.style.height = "auto"; t.style.height = `${Math.min(160, t.scrollHeight + 2)}px`; };

  /* ---------- export / import ---------- */
  const listRows = (l) => l.items.map((it) => ({ it, p: byId.get(it.id) }));
  function toMarkdown(l) {
    const out = [`# ${l.name} — ICLR 2027 Atlas list (${l.items.length} papers)`, "", `_Exported ${fmtDate(new Date().toISOString())} · data generated ${fmtDate(meta.generated)}_`, ""];
    rowsFor(l).forEach(({ p }, i) => {
      out.push(`## ${i + 1}. ${p.t}`, "", `- **#${p.n}** · mean ${fmt(p.r)} ± ${fmt(p.sd)} (${p.nr || 0} reviews: ${p.rs.join(", ") || "—"}) · rank ${p.rk ?? "—"} · confidence-weighted mean ${fmt(p.cw)}`,
        `- Category: ${tax.major(p.maj).name}${p.fine.length ? ` › ${p.fine.map((f) => tax.fine(f).name).join(", ")}` : ""}`, `- OpenReview: ${forumUrl(p.id)}`);
      if (p.tl) out.push(`- TL;DR: ${p.tl}`);
      if (getNote(p.id)) out.push(`- **Note:** ${getNote(p.id).replace(/\n+/g, " ")}`);
      out.push("");
    });
    return out.join("\n");
  }
  const csvCell = (v) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  function toCSV(l) {
    const cols = ["list", "id", "number", "title", "status", "mean", "std", "n_reviews", "ratings", "conf_weighted", "rank", "percentile", "major", "fine", "primary_area", "forum_url", "pdf_url", "added", "note"];
    const rows = rowsFor(l).map(({ p, it }) => [l.name, p.id, p.n, p.t, p.s, p.r, p.sd, p.nr, p.rs.join(" "), p.cw, p.rk, p.pct, tax.major(p.maj).name,
      p.fine.map((f) => tax.fine(f).name).join("; "), p.pa, forumUrl(p.id), orPdfUrl(p.id), new Date(it.added).toISOString(), getNote(p.id)]);
    return [cols, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  }
  const toJSONObj = (l) => ({ format: "iclr2027-atlas-list", version: 1, name: l.name, color: l.color, exported: new Date().toISOString(),
    items: listRows(l).map(({ it, p }) => ({ id: it.id, n: p?.n ?? null, t: p?.t ?? null, added: it.added, note: getNote(it.id) || undefined })) });
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "list";
  const stamp = () => new Date().toISOString().slice(0, 10);

  function doImport(text) {
    let obj;
    try { obj = JSON.parse(text); } catch { toast("Not valid JSON"); return; }
    const lists = Array.isArray(obj) ? obj : Array.isArray(obj.lists) ? obj.lists : [obj];
    const ok = lists.filter((x) => x && (Array.isArray(x.items) || Array.isArray(x.ids)));
    if (!ok.length) { toast("No list found in that file"); return; }
    let last = null;
    for (const x of ok) last = importList(x);
    cur = last; setPref("lists.current", cur); setHash();
    toast(`Imported ${ok.length} list${ok.length === 1 ? "" : "s"}`);
  }

  function shareLink(l) {
    const sp = new URLSearchParams({ name: l.name, color: l.color.replace("#", ""), ids: l.items.map((it) => it.id).join(",") });
    return `${location.origin}${location.pathname}${location.search}#share&${sp.toString()}`;
  }

  /* ---------- colour palette ---------- */
  function openPalette(anchor) {
    document.querySelector(".palette")?.remove();
    const pal = document.createElement("div");
    pal.className = "palette";
    pal.innerHTML = LIST_COLORS.map((c) => `<button style="--c:${c}" data-c="${c}" title="${c}"></button>`).join("");
    document.body.append(pal);
    const r = anchor.getBoundingClientRect();
    pal.style.left = `${r.left}px`; pal.style.top = `${r.bottom + 6}px`;
    const close = (e) => { if (!pal.contains(e.target)) { pal.remove(); document.removeEventListener("pointerdown", close, true); } };
    document.addEventListener("pointerdown", close, true);
    pal.addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (b) { setListColor(cur, b.dataset.c); pal.remove(); document.removeEventListener("pointerdown", close, true); } });
  }

  function startRename() {
    const h1 = $("#list-head h1");
    if (!h1) return;
    const l = getList(cur);
    const inp = document.createElement("input");
    inp.className = "input rename";
    inp.value = l.name;
    inp.maxLength = 80;
    h1.replaceWith(inp);
    inp.focus(); inp.select();
    const done = (commit) => { if (commit && inp.value.trim() && inp.value.trim() !== l.name) renameList(cur, inp.value); else renderMain(); };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") { e.stopPropagation(); done(false); } });
    inp.addEventListener("blur", () => done(true));
  }

  /* ---------- events ---------- */
  $("#lists-nav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sel]"); if (!b) return;
    cur = b.dataset.sel; setPref("lists.current", cur); setHash(); q = ""; $("#lq").value = ""; render();
  });
  const newList = () => {
    const name = prompt("Name of the new list:", "Reading list");
    if (name == null) return;
    cur = createList(name); setPref("lists.current", cur); setHash();
  };
  $("#new-list").addEventListener("click", newList);
  $("#import-json").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async (e) => { const file = e.target.files[0]; if (file) doImport(await file.text()); e.target.value = ""; });
  $("#export-all").addEventListener("click", () => download(`iclr2027_lists_${stamp()}.json`, JSON.stringify({ format: "iclr2027-atlas-lists", version: 1, lists: getLists().map(toJSONObj) }, null, 1), "application/json"));
  $("#lq").addEventListener("input", debounce((e) => { q = e.target.value.trim(); renderMain(); }, 120));

  document.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-act]");
    if (a && a.closest("#list-head, #share-banner")) {
      const l = getList(cur);
      const act = a.dataset.act;
      if (act === "rename") startRename();
      else if (act === "color") openPalette(a);
      else if (act === "md") download(`${slug(l.name)}_${stamp()}.md`, toMarkdown(l), "text/markdown");
      else if (act === "csv") download(`${slug(l.name)}_${stamp()}.csv`, `﻿${toCSV(l)}`, "text/csv");
      else if (act === "json") download(`${slug(l.name)}_${stamp()}.json`, JSON.stringify(toJSONObj(l), null, 1), "application/json");
      else if (act === "share") {
        const url = shareLink(l);
        try { await navigator.clipboard.writeText(url); toast(`Share link copied (${fmtInt(l.items.length)} papers)`); }
        catch { prompt("Copy this share link:", url); }
      } else if (act === "delete" && confirm(`Delete the list “${l.name}” (${l.items.length} papers)? Notes are kept.`)) {
        deleteList(cur); cur = STARRED; setPref("lists.current", cur); setHash();
      } else if (act === "import-share") {
        cur = importList({ name: share.name, color: share.color, ids: share.ids }); share = null; setPref("lists.current", cur); setHash();
        toast("Shared list imported");
      } else if (act === "dismiss-share") { share = null; setHash(); renderShare(); }
      return;
    }
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); drawer.stack = []; drawer.open(o.dataset.open); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { removeFromList(cur, [rm.dataset.rm]); toast("Removed from list"); return; }
    const th = e.target.closest("th[data-sort]");
    if (th) { const k = th.dataset.sort; sort = sort.k === k ? { k, d: -sort.d } : { k, d: 1 }; setPref("lists.sort", sort); renderMain(); }
  });
  const saveNote = debounce((id, text) => setNote(id, text), 400);
  $("#list-body").addEventListener("input", (e) => { const t = e.target.closest("[data-note]"); if (t) { autoGrow(t); saveNote(t.dataset.note, t.value); } });
  onStoreChange((w) => { if (w === "lists") { if (!getList(cur)) cur = STARRED; renderSide(); renderMain(); } });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "Escape" && drawer.isOpen) drawer.close();
    else if (e.key === "n") { e.preventDefault(); newList(); }
  });

  if (!share) setHash();
  render();
  ov.done();
}

main();
