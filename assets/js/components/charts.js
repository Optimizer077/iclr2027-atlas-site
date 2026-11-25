// Hand-rolled SVG charts: vertical bar / histogram and sparkline histogram.
// Marks are thin, gridlines recessive, every bar carries a data-tip for the shared tooltip.
import { esc, fmtInt } from "../core/util.js";

export function niceStep(max, n = 5) {
  if (!(max > 0)) return 1;
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}
const kfmt = (v) => (v >= 10000 ? `${Math.round(v / 1000)}k` : v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : fmtInt(v));

/**
 * Bars over a numeric or categorical x axis.
 * bars: [{x0, x1, value, color, tip, label?}]  (categorical: x0 = index, x1 = index+1, label shown under bar)
 */
export function barChart({ bars, xmin, xmax, w = 720, h = 260, xTicks = null, yLabel = "", valueLabels = false, categorical = false }) {
  const M = { l: 48, r: 12, t: 12, b: categorical ? 40 : 28 };
  const iw = w - M.l - M.r, ih = h - M.t - M.b;
  const vmax = Math.max(1, ...bars.map((b) => b.value));
  const step = niceStep(vmax, 4);
  const ymax = Math.ceil(vmax / step) * step;
  const X = (v) => M.l + ((v - xmin) / (xmax - xmin)) * iw;
  const Y = (v) => M.t + ih - (v / ymax) * ih;
  let s = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img"${yLabel ? ` aria-label="${esc(yLabel)}"` : ""}>`;
  for (let v = 0; v <= ymax + 1e-9; v += step) {
    s += `<line class="grid" x1="${M.l}" x2="${w - M.r}" y1="${Y(v)}" y2="${Y(v)}"/>`;
    s += `<text class="ax" x="${M.l - 8}" y="${Y(v) + 3.5}" text-anchor="end">${kfmt(v)}</text>`;
  }
  for (const b of bars) {
    const x0 = X(b.x0) + 1, x1 = X(b.x1) - 1;
    const bw = Math.max(1, x1 - x0), y = Y(b.value), bh = Math.max(0, M.t + ih - y);
    const r = Math.min(3, bw / 2, bh);
    s += `<path class="bar" data-tip="${esc(b.tip || "")}" fill="${b.color || "var(--ink-2)"}" d="M${x0},${M.t + ih} V${y + r} q0,-${r} ${r},-${r} H${x0 + bw - r} q${r},0 ${r},${r} V${M.t + ih} Z"/>`;
    s += `<rect class="hit" data-tip="${esc(b.tip || "")}" x="${x0}" y="${M.t}" width="${bw}" height="${ih}"/>`;
    if (valueLabels && b.value) s += `<text class="vl" x="${x0 + bw / 2}" y="${y - 5}" text-anchor="middle">${kfmt(b.value)}</text>`;
    if (categorical) s += `<text class="ax xl" x="${x0 + bw / 2}" y="${M.t + ih + 16}" text-anchor="middle">${esc(b.label ?? "")}</text>`;
  }
  s += `<line class="base" x1="${M.l}" x2="${w - M.r}" y1="${M.t + ih}" y2="${M.t + ih}"/>`;
  if (!categorical) {
    for (const t of xTicks || []) s += `<text class="ax" x="${X(t)}" y="${M.t + ih + 16}" text-anchor="middle">${t}</text>`;
  }
  return `${s}</svg>`;
}

/** Tiny histogram sparkline (bars only). counts: number[], colors: string[] | string */
export function sparkHist(counts, { w = 160, h = 36, colors = "var(--ink-3)", tips = [] } = {}) {
  const n = counts.length || 1;
  const mx = Math.max(1, ...counts);
  const bw = w / n;
  let s = `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">`;
  counts.forEach((c, i) => {
    const bh = c ? Math.max(1, (c / mx) * (h - 2)) : 0;
    const col = Array.isArray(colors) ? colors[i] : colors;
    s += `<rect x="${i * bw + 0.5}" y="${h - bh}" width="${Math.max(0.5, bw - 1)}" height="${bh}" fill="${col}"${tips[i] ? ` data-tip="${esc(tips[i])}"` : ""}/>`;
  });
  return `${s}<line x1="0" x2="${w}" y1="${h - 0.5}" y2="${h - 0.5}" stroke="var(--rule-2)"/></svg>`;
}
