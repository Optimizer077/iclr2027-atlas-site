// "Add to list ▾" popover. One paper: each list toggles membership. Many papers (bulk): a list adds
// all of them (or removes all when every one is already in it). Keys: 1–9 toggle list n, type a name
// in the box + Enter to create a list, Esc closes.
import { esc, fmtInt } from "../core/util.js";
import { toast } from "../core/shell.js";
import { getLists, inList, addToList, removeFromList, createList, onStoreChange } from "../core/store.js";

let open = null;

export function closeListMenu() {
  if (!open) return;
  open.off();
  open.el.remove();
  document.removeEventListener("pointerdown", open.outside, true);
  document.removeEventListener("keydown", open.keys, true);
  const back = open.anchor;
  open = null;
  back?.focus?.({ preventScroll: true });
}
export const listMenuOpen = () => !!open;

function stateOf(lid, pids) {
  let n = 0;
  for (const p of pids) if (inList(lid, p)) n++;
  return n === 0 ? "none" : n === pids.length ? "all" : "some";
}

/**
 * @param {HTMLElement|{x:number,y:number}} anchor  element (or point) to position against
 * @param {string[]} pids  paper ids
 */
export function openListMenu(anchor, pids, { title } = {}) {
  closeListMenu();
  if (!pids.length) { toast("No papers to add"); return; }
  const el = document.createElement("div");
  el.className = "lmenu";
  el.setAttribute("role", "menu");
  document.body.append(el);
  const bulk = pids.length > 1;

  const render = () => {
    const lists = getLists();
    el.innerHTML = `<div class="lm-h">${esc(title || (bulk ? `Add ${fmtInt(pids.length)} papers to…` : "Lists"))}</div>
      <div class="lm-items">${lists.map((l, i) => {
        const st = stateOf(l.id, pids);
        return `<button class="lm-item" data-l="${esc(l.id)}" role="menuitemcheckbox" aria-checked="${st === "all"}">
          <span class="lm-ck ${st}">${st === "all" ? "✓" : st === "some" ? "–" : ""}</span><i class="swatch" style="--c:${l.color}"></i>
          <span class="lm-n">${esc(l.name)}</span><span class="lm-c">${fmtInt(l.items.length)}</span>${i < 9 ? `<span class="kbd">${i + 1}</span>` : ""}</button>`;
      }).join("")}</div>
      <form class="lm-new"><input type="text" placeholder="New list name…" aria-label="New list name" maxlength="80"><button class="btn sm" type="submit">Create</button></form>`;
  };
  render();

  const place = () => {
    const r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y };
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = Math.min(innerWidth - w - 8, Math.max(8, r.right - w));
    let top = r.bottom + 6;
    if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  };
  place();

  const toggle = (lid) => {
    const l = getLists().find((x) => x.id === lid);
    if (!l) return;
    if (stateOf(lid, pids) === "all") { removeFromList(lid, pids); toast(bulk ? `Removed ${fmtInt(pids.length)} papers from “${l.name}”` : `Removed from “${l.name}”`); }
    else { const n = addToList(lid, pids); toast(bulk ? `Added ${fmtInt(n)} papers to “${l.name}”` : `Added to “${l.name}”`); }
  };

  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-l]");
    if (b) toggle(b.dataset.l);
  });
  el.addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = el.querySelector(".lm-new input");
    const name = inp.value.trim();
    if (!name) { inp.focus(); return; }
    const id = createList(name);
    const n = addToList(id, pids);
    toast(`Created “${getLists().find((l) => l.id === id).name}” with ${fmtInt(n)} paper${n === 1 ? "" : "s"}`);
    closeListMenu();
  });
  const outside = (e) => { if (!el.contains(e.target) && !(anchor.contains && anchor.contains(e.target))) closeListMenu(); };
  const keys = (e) => {
    const typing = e.target.closest?.(".lm-new");
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeListMenu(); return; }
    if (typing) return;
    if (/^[1-9]$/.test(e.key)) {
      const l = getLists()[Number(e.key) - 1];
      if (l) { e.preventDefault(); e.stopPropagation(); toggle(l.id); }
      return;
    }
    if (e.key === "n" || e.key === "/") { e.preventDefault(); e.stopPropagation(); el.querySelector(".lm-new input").focus(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "j" || e.key === "k") {
      e.preventDefault(); e.stopPropagation();
      const items = [...el.querySelectorAll(".lm-item")];
      const i = items.indexOf(document.activeElement);
      const d = e.key === "ArrowDown" || e.key === "j" ? 1 : -1;
      items[(i + d + items.length) % items.length]?.focus();
      return;
    }
    if (["s", "l", "o", "Enter", " "].includes(e.key) && !document.activeElement?.classList.contains("lm-item")) { e.stopPropagation(); if (e.key === "l") { e.preventDefault(); closeListMenu(); } }
  };
  document.addEventListener("pointerdown", outside, true);
  document.addEventListener("keydown", keys, true);
  const off = onStoreChange((w) => { if (w === "lists") { const f = document.activeElement?.dataset?.l; render(); if (f) el.querySelector(`[data-l="${CSS.escape(f)}"]`)?.focus(); } });
  open = { el, anchor, outside, keys, off };
  el.querySelector(".lm-item")?.focus({ preventScroll: true });
}

/** Small coloured dots for the lists a paper is in. */
export function listDotsHTML(lists) {
  if (!lists.length) return "";
  return `<span class="ldots" title="${esc(lists.map((l) => l.name).join(", "))}">${lists.slice(0, 4).map((l) => `<i style="--c:${l.color}"></i>`).join("")}</span>`;
}
