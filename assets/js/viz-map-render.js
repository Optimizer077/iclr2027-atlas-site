// Canvas renderer for the atlas plate: CPU-rasterised dots, reference grid, lettering
// (major regions → cluster names → paper titles as you zoom), and an overlay for hover / selection.
// While the camera moves and a full draw is slow, the last full frame is re-blitted with the new transform.
import { LabelBoxes, haloText, labelInk, rgba } from "./viz-common.js";
import { DotRaster } from "./viz-raster.js";

const RADII = [0.95, 1.15, 1.4, 1.75, 2.2, 2.8]; // css px at plate zoom 1, by rating bucket
const NULL_RGB = [140, 140, 140]; // papers without a mean rating (withdrawn / desk-rejected) in rating mode
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Radius growth with zoom (sub-linear so dense regions stay legible). */
export function zoomScale(zoom) {
  const z = Math.pow(clamp(zoom, 1, 60), 0.5);
  return Math.pow(1.05, Math.round(Math.log(z) / Math.log(1.05)));
}
export const dotRadius = (sizeIdx, zoom) => RADII[sizeIdx] * zoomScale(zoom);

export class MapRenderer {
  constructor(base, over, cam, M, heat = null) {
    this.base = base; this.over = over; this.cam = cam; this.M = M; this.heat = heat;
    this.bctx = base.getContext("2d", { alpha: true, willReadFrequently: false });
    this.octx = over.getContext("2d");
    this.raster = new DotRaster();
    this.snap = document.createElement("canvas");
    this.snapCam = null;
    this.labels = new LabelBoxes();
    this.showLabels = true;
    this.stats = { frames: 0, total: 0, last: 0, fast: 0 };
    this.textW = new Map();
  }

  setPalette(pal) { this.pal = pal; this.textW.clear(); }

  /** Full-fidelity frame. */
  drawBase() {
    const t0 = performance.now();
    const { base: cv, bctx: ctx, cam, M, pal, raster } = this;
    const dpr = cv._dpr || 1, W = cv.width, H = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    raster.begin(ctx, W, H);

    const zoom = cam.zoom, zs = zoomScale(zoom);
    const colors = M.colorMode === "rating" ? M.rampRGB : M.majorRGB;
    const k = cam.k * dpr, cx = cam.cx, cy = cam.cy, hw = W / 2, hh = H / 2;
    const X = M.X, Y = M.Y;

    // ghosts: everything filtered out keeps the coastline visible
    const gs = Math.max(1, Math.round(1.2 * dpr));
    const gc = pal.dark ? [150, 162, 178] : [110, 98, 74], ga = pal.dark ? 52 : 46;
    const gl = M.ghostList;
    for (let t = 0; t < gl.length; t++) {
      const i = gl[t];
      const x = (X[i] - cx) * k + hw; if (x < -2 || x > W + 2) continue;
      const y = hh - (Y[i] - cy) * k; if (y < -2 || y > H + 2) continue;
      raster.px(x, y, gs, gc[0], gc[1], gc[2], ga);
    }

    const halo = pal.bgRGB, haloA = pal.dark ? 150 : 165, hwid = 0.8 * dpr;
    const masks = RADII.map((r) => raster.mask(r * zs * dpr, hwid));
    const ext = masks[5].ext;
    const rowOf = M.colorMode === "rating" ? M.rbin : M.maj;
    const S = M.size, lit = M.litList, searching = !!M.q;
    let drawn = 0;
    for (let t = 0; t < lit.length; t++) {
      const i = lit[t];
      if (searching && M.match[i]) continue;
      const x = (X[i] - cx) * k + hw; if (x < -ext || x > W + ext) continue;
      const y = hh - (Y[i] - cy) * k; if (y < -ext || y > H + ext) continue;
      const row = rowOf[i];
      const c = row < 0 ? NULL_RGB : colors[row];
      if (searching) raster.dot(x, y, masks[S[i]], c[0], c[1], c[2], 60, 0, 0, 0, 0);
      else raster.dot(x, y, masks[S[i]], c[0], c[1], c[2], 242, halo[0], halo[1], halo[2], haloA);
      drawn++;
    }
    const ml = searching ? M.matchList : [];
    for (let t = 0; t < ml.length; t++) {
      const i = ml[t];
      const x = (X[i] - cx) * k + hw, y = hh - (Y[i] - cy) * k;
      if (x < -ext || x > W + ext || y < -ext || y > H + ext) continue;
      const row = rowOf[i];
      const c = row < 0 ? NULL_RGB : colors[row];
      raster.dot(x, y, masks[S[i]], c[0], c[1], c[2], 255, halo[0], halo[1], halo[2], 220);
      drawn++;
    }
    raster.end(ctx);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.drawGrid(ctx);
    if (searching && ml.length && ml.length <= 4000) {
      ctx.beginPath();
      for (let t = 0; t < ml.length; t++) {
        const i = ml[t];
        const x = cam.sx(X[i]), y = cam.sy(Y[i]);
        if (x < -10 || x > cam.w + 10 || y < -10 || y > cam.h + 10) continue;
        const R = RADII[S[i]] * zs + 2.8;
        ctx.moveTo(x + R, y); ctx.arc(x, y, R, 0, TAU);
      }
      ctx.lineWidth = 1.4; ctx.strokeStyle = pal.accent2; ctx.stroke();
    }
    if (this.showLabels) this.drawLetters(ctx, zoom);
    const dt = performance.now() - t0;
    this.stats.frames++; this.stats.total += dt; this.stats.last = dt; this.stats.drawn = drawn;
    this.keepSnapshot();
    return dt;
  }

  keepSnapshot() {
    const cv = this.base;
    if (this.snap.width !== cv.width || this.snap.height !== cv.height) { this.snap.width = cv.width; this.snap.height = cv.height; }
    const g = this.snap.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(cv, 0, 0);
    this.snapCam = { cx: this.cam.cx, cy: this.cam.cy, k: this.cam.k, w: cv.width, h: cv.height };
  }

  /** Cheap frame while the camera moves: re-blit the last full frame under the new transform. */
  drawFast() {
    const s = this.snapCam, cv = this.base, ctx = this.bctx, cam = this.cam;
    if (!s || s.w !== cv.width || s.h !== cv.height) return false;
    const dpr = cv._dpr || 1, W = cv.width, H = cv.height;
    const f = cam.k / s.k;
    const ex = W / 2 - f * (W / 2) + (s.cx - cam.cx) * cam.k * dpr;
    const ey = H / 2 - f * (H / 2) - (s.cy - cam.cy) * cam.k * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(f, 0, 0, f, ex, ey);
    ctx.drawImage(this.snap, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.stats.fast++;
    return true;
  }

  /** Atlas reference grid (letters across, numbers down) plus a finer graticule when zoomed in. */
  drawGrid(ctx) {
    const { cam, M, pal } = this;
    const G = M.grid, w = cam.w, h = cam.h;
    const inset = 16;
    ctx.save();
    // fine graticule
    const target = 64 / cam.k, p10 = Math.pow(10, Math.floor(Math.log10(target)));
    const step = [1, 2, 5, 10].map((m) => m * p10).find((s) => s >= target) || p10 * 10;
    if (step < G.cw * 0.6) {
      ctx.strokeStyle = pal.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = Math.ceil(cam.wx(0) / step) * step; x <= cam.wx(w); x += step) { const sx = Math.round(cam.sx(x)) + 0.5; ctx.moveTo(sx, 0); ctx.lineTo(sx, h); }
      for (let y = Math.ceil(cam.wy(h) / step) * step; y <= cam.wy(0); y += step) { const sy = Math.round(cam.sy(y)) + 0.5; ctx.moveTo(0, sy); ctx.lineTo(w, sy); }
      ctx.stroke();
    }
    // reference grid
    ctx.strokeStyle = pal.dark ? "rgba(190,205,230,.085)" : "rgba(90,70,30,.085)";
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    for (let c = 0; c <= G.cols; c++) { const sx = Math.round(cam.sx(G.x0 + c * G.cw)) + 0.5; if (sx > 0 && sx < w) { ctx.moveTo(sx, 0); ctx.lineTo(sx, h); } }
    for (let r = 0; r <= G.rows; r++) { const sy = Math.round(cam.sy(G.y1 - r * G.ch)) + 0.5; if (sy > 0 && sy < h) { ctx.moveTo(0, sy); ctx.lineTo(w, sy); } }
    ctx.stroke();
    ctx.setLineDash([]);
    // sticky edge labels, centred on the visible part of each column / row
    ctx.font = `600 10px ${pal.fontMono}`;
    ctx.fillStyle = pal.ink4;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let c = 0; c < G.cols; c++) {
      const a = Math.max(inset + 8, cam.sx(G.x0 + c * G.cw)), b = Math.min(w - inset - 8, cam.sx(G.x0 + (c + 1) * G.cw));
      if (b - a < 14) continue;
      const lab = String.fromCharCode(65 + c);
      ctx.fillText(lab, (a + b) / 2, inset + 9); ctx.fillText(lab, (a + b) / 2, h - inset - 9);
    }
    for (let r = 0; r < G.rows; r++) {
      const a = Math.max(inset + 8, cam.sy(G.y1 - r * G.ch)), b = Math.min(h - inset - 8, cam.sy(G.y1 - (r + 1) * G.ch));
      if (b - a < 14) continue;
      ctx.fillText(String(r + 1), inset + 10, (a + b) / 2); ctx.fillText(String(r + 1), w - inset - 10, (a + b) / 2);
    }
    ctx.restore();
  }

  measure(ctx, font, text) {
    const key = `${font}|${text}`;
    let v = this.textW.get(key);
    if (v == null) { ctx.font = font; v = ctx.measureText(text).width; this.textW.set(key, v); }
    return v;
  }

  drawLetters(ctx, zoom) {
    const { cam, M, pal } = this;
    const L = this.labels;
    L.reset();
    const halo = rgba(pal.bgRGB, 0.86);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // keep lettering off the side panel, the results list and the frame
    L.add(-1e4, -1e4, M.panelRight || 0, 1e4);
    if (M.rightPad) L.add(cam.w - M.rightPad, -1e4, 1e4, 1e4);

    // 1. major regions (fade out as you zoom in)
    const aMaj = clamp((2.5 - zoom) / 0.9, 0, 1) * (M.q ? 0.5 : 1);
    if (aMaj > 0.02) {
      // type size encodes region size, like a printed atlas (large regions get larger lettering)
      const maxC = M.majorsByCount[0]?._count || 1;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      for (const m of M.majorsByCount) {
        const fs = Math.round((10 + 4.5 * Math.sqrt(m._count / maxC)) * 2) / 2, ls = fs * 0.16;
        const font = `italic 500 ${fs}px ${pal.fontDisplay}`;
        if (m._wf !== font) { m._w = Math.max(...m.lines.map((s) => this.measure(ctx, font, s) + s.length * ls)); m._wf = font; m._fs = fs; m._ls = ls; }
      }
      for (const m of M.majorsByCount) {
        if (!m.visible || m.lx == null) continue;
        const fs = m._fs, lines = m.lines, wmax = m._w, sy = cam.sy(m.ly);
        // keep region names on the plate (inside the neatline) even when the region sits at an edge
        const sx = clamp(cam.sx(m.lx), (M.panelRight || 0) + wmax / 2 + 22, cam.w - (M.rightPad || 0) - wmax / 2 - 22);
        if (cam.w - (M.panelRight || 0) - (M.rightPad || 0) < wmax + 44) continue;
        const lh = fs + 2, hh = lines.length * lh;
        if (!L.place(sx - wmax / 2 - 4, sy - hh / 2 - 2, sx + wmax / 2 + 4, sy + hh / 2 + 2)) continue;
        ctx.font = m._wf;
        if ("letterSpacing" in ctx) ctx.letterSpacing = `${m._ls}px`;
        ctx.globalAlpha = aMaj;
        const ink = labelInk(m.color, pal);
        lines.forEach((s, li) => haloText(ctx, s, sx + m._ls / 2, sy + (li - (lines.length - 1) / 2) * lh, ink, halo, 3.2));
      }
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      ctx.globalAlpha = 1;
    }

    // 2. cluster names: larger clusters surface first
    const aClBase = clamp((zoom - 1.25) / 0.5, 0, 1);
    if (aClBase > 0.02) {
      const font = `italic 500 12.5px ${pal.fontDisplay}`;
      ctx.font = font;
      for (const c of M.clusters) {
        const a = aClBase * clamp((zoom - c.z) / 0.45, 0, 1);
        if (a < 0.04 || !c.visible) continue;
        const sx = cam.sx(c.x), sy = cam.sy(c.y);
        if (sx < -100 || sx > cam.w + 100 || sy < -20 || sy > cam.h + 20) continue;
        const tw = this.measure(ctx, font, c.text);
        if (!L.place(sx - tw / 2 - 3, sy - 8, sx + tw / 2 + 3, sy + 8)) continue;
        ctx.globalAlpha = a;
        haloText(ctx, c.text, sx, sy, pal.ink2, halo, 3.5);
      }
      ctx.globalAlpha = 1;
    }

    // 3. paper titles at street level
    if (zoom > 7 && M.qt) {
      const vis = M.qt.within(cam.wx(0), cam.wy(cam.h), cam.wx(cam.w), cam.wy(0), []);
      const cand = vis.filter((i) => M.lit[i] && (!M.q || M.match[i]));
      if (cand.length <= 900) {
        cand.sort((a, b) => (M.papers[b].r ?? 0) - (M.papers[a].r ?? 0));
        const font = `500 11px ${pal.fontUi}`;
        ctx.font = font; ctx.textAlign = "left";
        const zs = zoomScale(zoom);
        let placed = 0;
        for (const i of cand) {
          if (placed > 70) break;
          const p = M.papers[i];
          const t = p.t.length > 46 ? `${p.t.slice(0, 44).trimEnd()}…` : p.t;
          const sx = cam.sx(M.X[i]) + RADII[M.size[i]] * zs + 4, sy = cam.sy(M.Y[i]);
          const tw = this.measure(ctx, font, t);
          if (!L.place(sx - 2, sy - 7, sx + tw + 2, sy + 7)) continue;
          haloText(ctx, t, sx, sy, pal.ink, halo, 3);
          placed++;
        }
        ctx.textAlign = "center";
      }
    }
  }

  /**
   * Soft glow under the search hits (separate canvas below the dots): one radial gradient per hit,
   * weighted by relevance, so dense hit regions read as a warm "heat" field.
   */
  drawHeat() {
    const cv = this.heat;
    if (!cv) return;
    const ctx = cv.getContext("2d"), { cam, M, pal } = this, dpr = cv._dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const ml = M.matchList;
    if (!M.q || !ml.length || ml.length > 2500) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = clamp(30 * Math.pow(cam.zoom, 0.3), 26, 70);
    const c = pal.dark ? [230, 178, 87] : [197, 141, 38];
    const peak = (pal.dark ? 0.16 : 0.2) * (ml.length > 600 ? 0.6 : 1);
    ctx.globalCompositeOperation = pal.dark ? "lighter" : "source-over";
    for (let t = 0; t < ml.length; t++) {
      const i = ml[t], x = cam.sx(M.X[i]), y = cam.sy(M.Y[i]);
      if (x < -R || x > cam.w + R || y < -R || y > cam.h + R) continue;
      const w = M.hitW[i] || 0.5, r = R * (0.75 + 0.5 * w);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(c, peak * w));
      g.addColorStop(0.55, rgba(c, peak * w * 0.38));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  /** Hover ring, selection marker and lines to the selected paper's embedding neighbours. */
  drawOverlay(hover, sel, nbrs, strong = false) {
    const { over: cv, octx: ctx, cam, M, pal } = this;
    const dpr = cv._dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const zs = zoomScale(cam.zoom);
    const pos = (i) => [cam.sx(M.X[i]), cam.sy(M.Y[i])];
    if (sel >= 0) {
      const [x, y] = pos(sel);
      if (nbrs && nbrs.length) {
        ctx.strokeStyle = pal.accent2; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (const j of nbrs) { const [nx, ny] = pos(j); ctx.moveTo(x, y); ctx.lineTo(nx, ny); }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        for (const j of nbrs) {
          const [nx, ny] = pos(j), R = RADII[M.size[j]] * zs + 2.5;
          ctx.beginPath(); ctx.arc(nx, ny, R, 0, TAU);
          ctx.fillStyle = rgba(M.colorOf(j), 1); ctx.fill();
          ctx.lineWidth = 1.5; ctx.strokeStyle = pal.accent2; ctx.stroke();
        }
      }
      const R = RADII[M.size[sel]] * zs + 6;
      ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(pal.bgRGB, 0.9);
      ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.strokeStyle = pal.ink;
      ctx.beginPath(); ctx.arc(x, y, R, 0, TAU);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(x + dx * (R + 3), y + dy * (R + 3)); ctx.lineTo(x + dx * (R + 9), y + dy * (R + 9)); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, RADII[M.size[sel]] * zs + 1.5, 0, TAU);
      ctx.fillStyle = rgba(M.colorOf(sel), 1); ctx.fill();
    }
    if (hover >= 0 && strong) {
      // hovered from the results list: a beacon that is easy to find on a busy plate
      const [x, y] = pos(hover), R = RADII[M.size[hover]] * zs;
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(pal.inkRGB, 0.35);
      ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.lineTo(x - R - 6, y); ctx.moveTo(x + R + 6, y); ctx.lineTo(x + 26, y);
      ctx.moveTo(x, y - 26); ctx.lineTo(x, y - R - 6); ctx.moveTo(x, y + R + 6); ctx.lineTo(x, y + 26); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, R + 1.5, 0, TAU); ctx.fillStyle = rgba(M.colorOf(hover), 1); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = rgba(pal.bgRGB, 0.9);
      ctx.beginPath(); ctx.arc(x, y, R + 6, 0, TAU); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = pal.accent2; ctx.stroke();
    } else if (hover >= 0 && hover !== sel) {
      const [x, y] = pos(hover), R = RADII[M.size[hover]] * zs + 3.5;
      ctx.beginPath(); ctx.arc(x, y, R - 2, 0, TAU); ctx.fillStyle = rgba(M.colorOf(hover), 1); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(pal.bgRGB, 0.9);
      ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = pal.ink; ctx.stroke();
    }
  }
}
