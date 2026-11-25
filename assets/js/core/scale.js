// Rating scale and colour helpers.
// The scale is data-driven (papers.json → rating_scale); colours are a red ↔ neutral ↔ blue
// diverging ramp normalised to [min, max], so a 1–4 or a 1–10 form both work.
import { esc, fmt } from "./util.js";

export const STATUS_LABEL = { active: "Active", withdrawn: "Withdrawn", desk_rejected: "Desk-rejected" };

let SC = { min: 1, max: 10, values: [1, 2, 3, 4, 5, 6, 8, 10] };

/** Configure the rating scale from papers.json → rating_scale. */
export function setScale(rs) {
  if (!rs || rs.min == null || rs.max == null || Number(rs.max) <= Number(rs.min)) return;
  const min = Number(rs.min), max = Number(rs.max);
  const values = Array.isArray(rs.values) && rs.values.length ? rs.values.map(Number)
    : Array.from({ length: max - min + 1 }, (_, i) => min + i);
  SC = { min, max, values };
  chipCache.clear();
}
export const getScale = () => SC;
/** Decimal places that suit the scale (1–4 needs 2, 1–10 needs 2 too, counts 0). */
export const ratingStep = () => ((SC.max - SC.min) <= 5 ? 0.01 : 0.05);

const TOKENS = ["--r1", "--r2", "--r3", "--r4", "--r5", "--r6", "--r8", "--r10"];
const STOPS = [0, 0.14, 0.28, 0.4, 0.5, 0.62, 0.8, 1];
let stopRGB = null;
const chipCache = new Map();

function hexToRgb(hex) {
  const m = String(hex).trim().replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  return n.some(Number.isNaN) ? [136, 136, 136] : n;
}

/** Re-read the theme's ramp colours (call after a theme change). */
export function refreshScale() {
  const cs = getComputedStyle(document.documentElement);
  stopRGB = TOKENS.map((t) => hexToRgb(cs.getPropertyValue(t) || "#888888"));
  chipCache.clear();
}

/** Continuous rating colour as [r,g,b]. */
export function ratingRGB(v) {
  if (!stopRGB) refreshScale();
  if (v == null || Number.isNaN(v)) return null;
  const t = Math.max(0, Math.min(1, (v - SC.min) / (SC.max - SC.min)));
  let i = 0;
  while (i < STOPS.length - 2 && t > STOPS[i + 1]) i++;
  const u = (t - STOPS[i]) / (STOPS[i + 1] - STOPS[i]);
  const a = stopRGB[i], b = stopRGB[i + 1];
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * u));
}
export function ratingColor(v, alpha = 1) {
  const c = ratingRGB(v);
  if (!c) return "transparent";
  return alpha >= 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
}
const lum = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

/** Inline style for a rating chip (background + readable ink), cached per value and theme. */
export function chipStyle(v) {
  let s = chipCache.get(v);
  if (!s) {
    const c = ratingRGB(v) || [136, 136, 136];
    s = `background:rgb(${c[0]},${c[1]},${c[2]});color:${lum(c) > 0.58 ? "#1d1b17" : "#ffffff"}`;
    chipCache.set(v, s);
  }
  return s;
}

export function chipHTML(v, lg = false) {
  return `<span class="chip${lg ? " lg" : ""}" style="${chipStyle(v)}">${esc(v)}</span>`;
}
export function chipsHTML(rs, lg = false) {
  if (!rs || !rs.length) return `<span class="muted small">no reviews</span>`;
  return `<span class="chips">${rs.map((r) => chipHTML(r, lg)).join("")}</span>`;
}

export function statusHTML(s) {
  if (!s || s === "active") return "";
  return `<span class="status-badge ${esc(s)}">${esc(STATUS_LABEL[s] || s)}</span>`;
}

export const fmtR = (v) => fmt(v, 2);

/** Text colour (black/white) for a hex background. */
export function inkOn(hex) { return lum(hexToRgb(hex)) > 0.6 ? "#1d1b17" : "#ffffff"; }
