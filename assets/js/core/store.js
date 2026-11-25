// Per-viewer storage: named paper lists, per-paper notes, UI prefs. localStorage can be absent or
// throw; every access is guarded and the site still works (in memory) without it.
//
// Lists replace the old single shortlist: the built-in list "starred" backs the star button / `s` key,
// and the old atlas.stars.v1 key is migrated into it once.

const K_LISTS = "atlas.lists.v1";
const K_STARS_OLD = "atlas.stars.v1";
const K_NOTES = "atlas.notes.v1";
export const STARRED = "starred";
export const LIST_COLORS = ["#c58d26", "#2a78d6", "#eb6834", "#1baf7a", "#e87ba4", "#6250d6", "#e34948", "#008300", "#5b6b7f", "#eda100"];
const listeners = new Set();

function read(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
const emit = (what) => listeners.forEach((fn) => fn(what));
export function onStoreChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/* ---------- lists ---------- */
function blank() { return { version: 1, order: [], lists: {} }; }
function load() {
  let db = read(K_LISTS, null);
  if (!db || !db.lists) {
    db = blank();
    const now = Date.now();
    db.lists[STARRED] = { id: STARRED, name: "Starred", color: LIST_COLORS[0], created: now, updated: now, items: [] };
    db.order.push(STARRED);
    const old = read(K_STARS_OLD, {});
    for (const [pid, ts] of Object.entries(old || {})) db.lists[STARRED].items.push({ id: pid, added: Number(ts) || now });
    db.lists[STARRED].items.sort((a, b) => a.added - b.added);
    write(K_LISTS, db);
  }
  if (!db.lists[STARRED]) {
    db.lists[STARRED] = { id: STARRED, name: "Starred", color: LIST_COLORS[0], created: Date.now(), updated: Date.now(), items: [] };
    db.order.unshift(STARRED);
  }
  db.order = db.order.filter((id) => db.lists[id]);
  for (const id of Object.keys(db.lists)) if (!db.order.includes(id)) db.order.push(id);
  return db;
}
let db = load();
let memberIndex = null; // paper id -> Set(list ids)
function index() {
  if (!memberIndex) {
    memberIndex = new Map();
    for (const l of Object.values(db.lists)) for (const it of l.items) {
      if (!memberIndex.has(it.id)) memberIndex.set(it.id, new Set());
      memberIndex.get(it.id).add(l.id);
    }
  }
  return memberIndex;
}
function save(what = "lists") {
  memberIndex = null;
  write(K_LISTS, db);
  emit(what);
  if (what === "lists") emit("stars");
}

const newId = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const getLists = () => db.order.map((id) => db.lists[id]);
export const getList = (id) => db.lists[id] || null;
export const listsOf = (pid) => [...(index().get(pid) || [])].map((id) => db.lists[id]).filter(Boolean);
export const inList = (lid, pid) => !!index().get(pid)?.has(lid);
export const allListedIds = () => [...index().keys()];

export function createList(name, color) {
  const id = newId();
  const now = Date.now();
  const used = new Set(getLists().map((l) => l.color));
  db.lists[id] = { id, name: uniqueName(String(name || "Untitled list").trim() || "Untitled list"), color: color || LIST_COLORS.find((c) => !used.has(c)) || LIST_COLORS[db.order.length % LIST_COLORS.length], created: now, updated: now, items: [] };
  db.order.push(id);
  save();
  return id;
}
function uniqueName(name, except = null) {
  const names = new Set(getLists().filter((l) => l.id !== except).map((l) => l.name.toLowerCase()));
  if (!names.has(name.toLowerCase())) return name;
  let i = 2;
  while (names.has(`${name} (${i})`.toLowerCase())) i++;
  return `${name} (${i})`;
}
export function renameList(id, name) {
  const l = db.lists[id];
  if (!l || !String(name).trim()) return;
  l.name = uniqueName(String(name).trim(), id);
  l.updated = Date.now();
  save();
}
export function setListColor(id, color) { const l = db.lists[id]; if (l) { l.color = color; l.updated = Date.now(); save(); } }
export function deleteList(id) {
  if (id === STARRED || !db.lists[id]) return false;
  delete db.lists[id];
  db.order = db.order.filter((x) => x !== id);
  save();
  return true;
}
/** Add paper ids to a list; returns how many were new. */
export function addToList(lid, pids) {
  const l = db.lists[lid];
  if (!l) return 0;
  const have = new Set(l.items.map((it) => it.id));
  const now = Date.now();
  let n = 0;
  for (const pid of pids) if (pid && !have.has(pid)) { l.items.push({ id: pid, added: now + n }); have.add(pid); n++; }
  if (n) { l.updated = now; save(); }
  return n;
}
export function removeFromList(lid, pids) {
  const l = db.lists[lid];
  if (!l) return 0;
  const drop = new Set(pids);
  const before = l.items.length;
  l.items = l.items.filter((it) => !drop.has(it.id));
  if (l.items.length !== before) { l.updated = Date.now(); save(); }
  return before - l.items.length;
}
export function toggleInList(lid, pid) {
  if (inList(lid, pid)) { removeFromList(lid, [pid]); return false; }
  addToList(lid, [pid]);
  return true;
}
export function clearList(lid) { const l = db.lists[lid]; if (l && l.items.length) { l.items = []; l.updated = Date.now(); save(); } }

/** Import {name, color, items:[{id, added?, note?}] | ids:[...]} as a new list; returns its id. */
export function importList(obj) {
  const id = createList(obj.name || "Imported list", obj.color && /^#[0-9a-f]{6}$/i.test(obj.color) ? obj.color : null);
  const items = Array.isArray(obj.items) ? obj.items : (obj.ids || []).map((x) => ({ id: x }));
  const now = Date.now();
  const seen = new Set();
  db.lists[id].items = items.filter((it) => it && typeof it.id === "string" && !seen.has(it.id) && seen.add(it.id))
    .map((it, i) => ({ id: it.id, added: Number(it.added) || now + i }));
  for (const it of items) if (it && it.note && !getNote(it.id)) notes[it.id] = String(it.note);
  write(K_NOTES, notes);
  save();
  return id;
}

/* ---------- star = membership in the built-in "Starred" list ---------- */
export const isStarred = (pid) => inList(STARRED, pid);
export const toggleStar = (pid) => toggleInList(STARRED, pid);
export const starredIds = () => db.lists[STARRED].items.map((it) => it.id);
export const starredAt = (pid) => db.lists[STARRED].items.find((it) => it.id === pid)?.added || null;
export const starCount = () => db.lists[STARRED].items.length;

/* ---------- notes ---------- */
let notes = read(K_NOTES, {});
export const getNote = (pid) => notes[pid] || "";
export function setNote(pid, text) {
  if (text && text.trim()) notes[pid] = text; else delete notes[pid];
  write(K_NOTES, notes);
  emit("notes");
}

window.addEventListener("storage", (e) => {
  if (e.key === K_LISTS) { db = load(); memberIndex = null; emit("lists"); emit("stars"); }
  if (e.key === K_NOTES) { notes = read(K_NOTES, {}); emit("notes"); }
});

export function getPref(key, fallback) { return read(`atlas.pref.${key}`, fallback); }
export function setPref(key, value) { write(`atlas.pref.${key}`, value); }
