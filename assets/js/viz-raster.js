// CPU dot rasteriser: stamps anti-aliased discs (with a paper-coloured halo) straight into an ImageData.
// ~3–12 ms for 42k dots whether or not the browser has GPU canvas, unlike 42k drawImage calls.

export class DotRaster {
  constructor() {
    this.W = 0; this.H = 0; this.img = null; this.d = null; this.u32 = null;
    this.masks = new Map();
  }

  /** Make the buffer match the canvas backing size and clear it to transparent. */
  begin(ctx, W, H) {
    if (W !== this.W || H !== this.H || !this.img) {
      this.W = W; this.H = H;
      this.img = ctx.createImageData(W, H);
      this.d = this.img.data;
      this.u32 = new Uint32Array(this.d.buffer);
    } else this.u32.fill(0);
  }

  end(ctx) { ctx.putImageData(this.img, 0, 0); }

  /** Coverage mask for a disc of radius R (device px) plus a halo ring of width h, 4×4 supersampled. */
  mask(R, h) {
    const key = `${Math.round(R * 8)}|${Math.round(h * 8)}`;
    let m = this.masks.get(key);
    if (m) return m;
    const ext = Math.ceil(R + h + 0.75), R2 = R * R, H2 = (R + h) * (R + h);
    const dx = [], dy = [], cd = [], ch = [];
    for (let y = -ext; y <= ext; y++) {
      for (let x = -ext; x <= ext; x++) {
        let inD = 0, inH = 0;
        for (let sy = 0; sy < 4; sy++) {
          const py = y - 0.5 + (sy + 0.5) / 4;
          for (let sx = 0; sx < 4; sx++) {
            const px = x - 0.5 + (sx + 0.5) / 4, q = px * px + py * py;
            if (q <= R2) inD++; else if (q <= H2) inH++;
          }
        }
        if (inD || inH) { dx.push(x); dy.push(y); cd.push(Math.round((inD * 255) / 16)); ch.push(Math.round((inH * 255) / 16)); }
      }
    }
    m = { n: dx.length, dx: Int16Array.from(dx), dy: Int16Array.from(dy), cd: Uint8Array.from(cd), ch: Uint8Array.from(ch), ext };
    if (this.masks.size > 400) this.masks.clear();
    this.masks.set(key, m);
    return m;
  }

  /**
   * Stamp one dot. Colours are 0..255 ints; alpha / haloA are 0..255.
   * Blending is "source over" in straight (non-premultiplied) RGBA, which is what putImageData expects.
   */
  dot(x, y, m, r, g, b, alpha, hr, hg, hb, haloA) {
    const cx = x | 0, cy = y | 0, W = this.W, H = this.H, d = this.d;
    const clip = cx - m.ext < 0 || cy - m.ext < 0 || cx + m.ext >= W || cy + m.ext >= H;
    const { n, dx, dy, cd, ch } = m;
    for (let e = 0; e < n; e++) {
      const px = cx + dx[e], py = cy + dy[e];
      if (clip && (px < 0 || py < 0 || px >= W || py >= H)) continue;
      const p = (py * W + px) << 2;
      if (haloA && ch[e]) blend(d, p, hr, hg, hb, (ch[e] * haloA) / 255);
      const c = cd[e];
      if (!c) continue;
      const a = alpha === 255 ? c : (c * alpha) / 255;
      blend(d, p, r, g, b, a);
    }
  }

  /** Small square (ghost dots). */
  px(x, y, s, r, g, b, a) {
    const cx = x | 0, cy = y | 0, W = this.W, H = this.H, d = this.d;
    for (let j = 0; j < s; j++) {
      const py = cy + j;
      if (py < 0 || py >= H) continue;
      for (let i = 0; i < s; i++) {
        const px = cx + i;
        if (px < 0 || px >= W) continue;
        blend(d, (py * W + px) << 2, r, g, b, a);
      }
    }
  }
}

function blend(d, p, r, g, b, a) {
  if (a >= 254.5) { d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255; return; }
  const da = d[p + 3];
  if (da === 0) { d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = a; return; }
  const t = a / 255;
  if (da === 255) {
    d[p] += (r - d[p]) * t; d[p + 1] += (g - d[p + 1]) * t; d[p + 2] += (b - d[p + 2]) * t;
    return;
  }
  const dt = (da / 255) * (1 - t), oa = t + dt;
  d[p] = (r * t + d[p] * dt) / oa;
  d[p + 1] = (g * t + d[p + 1] * dt) / oa;
  d[p + 2] = (b * t + d[p + 2] * dt) / oa;
  d[p + 3] = oa * 255;
}
