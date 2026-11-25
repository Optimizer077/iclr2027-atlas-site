// Static bucketed point quadtree for hit-testing (nearest point within a radius, rectangle query).
// Built once over Float32Array coordinates; cheap enough to rebuild on demand for a few thousand moving points.

const CAP = 12;
const MAX_DEPTH = 18;

export class PointQuadtree {
  /**
   * @param {Float32Array|number[]} xs
   * @param {Float32Array|number[]} ys
   * @param {Int32Array|number[]} [ids]  subset of indices to index (default: all)
   */
  constructor(xs, ys, ids) {
    this.xs = xs; this.ys = ys;
    const n = ids ? ids.length : xs.length;
    const idx = new Int32Array(n);
    let m = 0;
    for (let i = 0; i < n; i++) {
      const j = ids ? ids[i] : i;
      if (Number.isFinite(xs[j]) && Number.isFinite(ys[j])) idx[m++] = j;
    }
    this.idx = idx.subarray(0, m);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < m; i++) {
      const j = this.idx[i], x = xs[j], y = ys[j];
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (!(x0 <= x1)) { x0 = y0 = 0; x1 = y1 = 1; }
    const s = (Math.max(x1 - x0, y1 - y0) || 1) * 1.0001;
    // per node: origin, size, [start,end) slice of idx; child = offset into kids (-1 for a leaf)
    this.nx = []; this.ny = []; this.ns = []; this.a = []; this.b = []; this.child = []; this.kids = [];
    this.build(x0, y0, s, 0, m, 0);
  }

  build(x0, y0, s, a, b, depth) {
    const k = this.nx.length;
    this.nx.push(x0); this.ny.push(y0); this.ns.push(s); this.a.push(a); this.b.push(b); this.child.push(-1);
    if (b - a <= CAP || depth >= MAX_DEPTH) return k;
    const { xs, ys, idx } = this;
    const mx = x0 + s / 2, my = y0 + s / 2;
    const quad = (j) => (xs[j] >= mx ? 1 : 0) + (ys[j] >= my ? 2 : 0);
    const cnt = [0, 0, 0, 0];
    for (let i = a; i < b; i++) cnt[quad(idx[i])]++;
    const off = [a, a + cnt[0], a + cnt[0] + cnt[1], a + cnt[0] + cnt[1] + cnt[2]];
    const tmp = idx.slice(a, b), pos = off.slice();
    for (let i = 0; i < tmp.length; i++) { const j = tmp[i]; idx[pos[quad(j)]++] = j; }
    const h = s / 2;
    const c = [
      this.build(x0, y0, h, off[0], off[0] + cnt[0], depth + 1),
      this.build(mx, y0, h, off[1], off[1] + cnt[1], depth + 1),
      this.build(x0, my, h, off[2], off[2] + cnt[2], depth + 1),
      this.build(mx, my, h, off[3], off[3] + cnt[3], depth + 1),
    ];
    this.child[k] = this.kids.length;
    this.kids.push(c[0], c[1], c[2], c[3]);
    return k;
  }

  /**
   * Nearest indexed point to (x, y) within radius r (world units).
   * @param {(i:number)=>boolean} [accept]  optional filter
   * @returns {number} point index or -1
   */
  nearest(x, y, r, accept) {
    let best = -1, bd = r * r;
    const { xs, ys, idx, nx, ny, ns, a, b, child, kids } = this;
    const stack = [0];
    while (stack.length) {
      const k = stack.pop();
      if (b[k] <= a[k]) continue;
      const x0 = nx[k], y0 = ny[k], s = ns[k];
      const dx = x < x0 ? x0 - x : x > x0 + s ? x - x0 - s : 0;
      const dy = y < y0 ? y0 - y : y > y0 + s ? y - y0 - s : 0;
      if (dx * dx + dy * dy > bd) continue;
      const o = child[k];
      if (o < 0) {
        for (let i = a[k]; i < b[k]; i++) {
          const j = idx[i], ex = xs[j] - x, ey = ys[j] - y, d = ex * ex + ey * ey;
          if (d <= bd && (!accept || accept(j))) { bd = d; best = j; }
        }
      } else {
        stack.push(kids[o], kids[o + 1], kids[o + 2], kids[o + 3]);
      }
    }
    return best;
  }

  /** All indexed points inside a world rectangle. */
  within(x0, y0, x1, y1, out = []) {
    const { xs, ys, idx, nx, ny, ns, a, b, child, kids } = this;
    const stack = [0];
    while (stack.length) {
      const k = stack.pop();
      if (b[k] <= a[k] || nx[k] > x1 || ny[k] > y1 || nx[k] + ns[k] < x0 || ny[k] + ns[k] < y0) continue;
      const o = child[k];
      if (o < 0) {
        for (let i = a[k]; i < b[k]; i++) {
          const j = idx[i];
          if (xs[j] >= x0 && xs[j] <= x1 && ys[j] >= y0 && ys[j] <= y1) out.push(j);
        }
      } else stack.push(kids[o], kids[o + 1], kids[o + 2], kids[o + 3]);
    }
    return out;
  }
}
