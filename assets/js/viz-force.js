// Self-written force layout (d3-force semantics): velocity Verlet, Barnes-Hut many-body charge,
// link springs with degree bias, anchor springs to a reference position (UMAP warm start), optional collision.
// Runs in a module Worker (viz-force-worker.js) or on the main thread as a fallback (createRunner).

/**
 * @param {{n:number, x:Float32Array, y:Float32Array, ax?:Float32Array, ay?:Float32Array,
 *          src:Uint32Array, dst:Uint32Array, w?:Float32Array, r?:Float32Array, charge?:Float32Array,
 *          params?:object}} cfg
 */
export function createForce(cfg) {
  const n = cfg.n;
  const x = Float32Array.from(cfg.x), y = Float32Array.from(cfg.y);
  const vx = new Float32Array(n), vy = new Float32Array(n);
  const ax = cfg.ax ? Float32Array.from(cfg.ax) : Float32Array.from(cfg.x);
  const ay = cfg.ay ? Float32Array.from(cfg.ay) : Float32Array.from(cfg.y);
  const src = cfg.src, dst = cfg.dst, m = src.length;
  const ew = cfg.w || new Float32Array(m).fill(1);
  const rad = cfg.r || new Float32Array(n).fill(1);
  const P = Object.assign({
    linkDistance: 30, linkStrength: 1, chargeStrength: -30, theta: 0.9, distanceMax: Infinity,
    anchorStrength: 0.03, centerStrength: 0.0, collide: false, collidePad: 1, collideStrength: 0.7,
    velocityDecay: 0.4, alpha: 1, alphaMin: 0.001, alphaDecay: 1 - Math.pow(0.001, 1 / 300), alphaTarget: 0,
  }, cfg.params || {});
  const charge = cfg.charge || new Float32Array(n).fill(1);
  const fixed = new Uint8Array(n), fx = new Float32Array(n), fy = new Float32Array(n);

  // link strength / bias (d3: strength = 1 / min(deg), bias = deg(s) / (deg(s) + deg(t)))
  const deg = new Float32Array(n);
  for (let e = 0; e < m; e++) { deg[src[e]]++; deg[dst[e]]++; }
  const lstr = new Float32Array(m), bias = new Float32Array(m);
  for (let e = 0; e < m; e++) {
    const s = src[e], t = dst[e];
    lstr[e] = (P.linkStrength * ew[e]) / Math.max(1, Math.min(deg[s], deg[t]));
    bias[e] = deg[s] / (deg[s] + deg[t] || 1);
  }

  // Barnes-Hut tree storage (grown as needed)
  let cap = 0, qx0, qy0, qs, qcx, qcy, qq, qchild, qpt, nextPt;
  let nodes = 0;
  function ensure(c) {
    if (c <= cap) return;
    cap = Math.max(c, cap * 2, 64);
    const grow = (A, T) => { const B = new T(cap); if (A) B.set(A.subarray(0, Math.min(A.length, cap))); return B; };
    qx0 = grow(qx0, Float64Array); qy0 = grow(qy0, Float64Array); qs = grow(qs, Float64Array);
    qcx = grow(qcx, Float64Array); qcy = grow(qcy, Float64Array); qq = grow(qq, Float64Array);
    qchild = grow(qchild, Int32Array); qpt = grow(qpt, Int32Array);
  }
  function alloc(x0, y0, s) {
    ensure(nodes + 1);
    const k = nodes++;
    qx0[k] = x0; qy0[k] = y0; qs[k] = s; qchild[k] = -1; qpt[k] = -1; qq[k] = 0; qcx[k] = 0; qcy[k] = 0;
    return k;
  }
  function buildTree() {
    nodes = 0;
    if (!nextPt || nextPt.length < n) nextPt = new Int32Array(n);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) {
      if (x[i] < x0) x0 = x[i]; if (x[i] > x1) x1 = x[i];
      if (y[i] < y0) y0 = y[i]; if (y[i] > y1) y1 = y[i];
    }
    const s = Math.max(x1 - x0, y1 - y0, 1e-3) * 1.001;
    alloc(x0, y0, s);
    for (let i = 0; i < n; i++) {
      nextPt[i] = -1;
      let k = 0, depth = 0;
      for (;;) {
        if (qchild[k] >= 0) {
          const h = qs[k] / 2, q = (x[i] >= qx0[k] + h ? 1 : 0) + (y[i] >= qy0[k] + h ? 2 : 0);
          k = qchild[k] + q; depth++;
          continue;
        }
        if (qpt[k] < 0) { qpt[k] = i; break; }
        const j = qpt[k];
        if (depth > 24 || (x[j] === x[i] && y[j] === y[i])) { nextPt[i] = qpt[k]; qpt[k] = i; break; } // coincident: chain
        // split leaf
        const h = qs[k] / 2, bx = qx0[k], by = qy0[k];
        const c = nodes;
        alloc(bx, by, h); alloc(bx + h, by, h); alloc(bx, by + h, h); alloc(bx + h, by + h, h);
        qchild[k] = c; qpt[k] = -1;
        // move chain of j into its quadrant
        let p = j;
        const qj = (x[j] >= bx + h ? 1 : 0) + (y[j] >= by + h ? 2 : 0);
        qpt[c + qj] = p;
        depth++;
        k = k; // re-loop: descend into the right child for i
      }
    }
    // accumulate charge and centre of mass bottom-up (children have larger indices than parents)
    for (let k = nodes - 1; k >= 0; k--) {
      let q = 0, sx = 0, sy = 0;
      if (qchild[k] < 0) {
        for (let p = qpt[k]; p >= 0; p = nextPt[p]) { const c = charge[p]; q += c; sx += c * x[p]; sy += c * y[p]; }
      } else {
        for (let c = qchild[k]; c < qchild[k] + 4; c++) { if (qq[c]) { q += qq[c]; sx += qq[c] * qcx[c]; sy += qq[c] * qcy[c]; } }
      }
      qq[k] = q;
      if (q) { qcx[k] = sx / q; qcy[k] = sy / q; }
    }
  }

  const stack = new Int32Array(4096);
  function manyBody(alpha) {
    buildTree();
    const th2 = P.theta * P.theta, dmax2 = P.distanceMax * P.distanceMax, dmin2 = 1;
    const str = P.chargeStrength * alpha;
    for (let i = 0; i < n; i++) {
      let sp = 0;
      stack[sp++] = 0;
      const xi = x[i], yi = y[i];
      let fxs = 0, fys = 0;
      while (sp) {
        const k = stack[--sp];
        if (!qq[k]) continue;
        let dx = qcx[k] - xi, dy = qcy[k] - yi, l = dx * dx + dy * dy;
        const w = qs[k];
        if (qchild[k] >= 0) {
          if ((w * w) / th2 < l) {
            if (l < dmax2) { if (l < dmin2) l = Math.sqrt(dmin2 * l) || 1e-3; fxs += (dx * qq[k] * str) / l; fys += (dy * qq[k] * str) / l; }
            continue;
          }
          if (sp + 4 > stack.length) continue;
          const c = qchild[k];
          stack[sp++] = c; stack[sp++] = c + 1; stack[sp++] = c + 2; stack[sp++] = c + 3;
          continue;
        }
        for (let p = qpt[k]; p >= 0; p = nextPt[p]) {
          if (p === i) continue;
          dx = x[p] - xi; dy = y[p] - yi; l = dx * dx + dy * dy;
          if (l === 0) { dx = (Math.random() - 0.5) * 1e-3; dy = (Math.random() - 0.5) * 1e-3; l = dx * dx + dy * dy; }
          if (l >= dmax2) continue;
          if (l < dmin2) l = Math.sqrt(dmin2 * l);
          fxs += (dx * charge[p] * str) / l; fys += (dy * charge[p] * str) / l;
        }
      }
      vx[i] += fxs; vy[i] += fys;
    }
  }

  function links(alpha) {
    const L = P.linkDistance;
    for (let e = 0; e < m; e++) {
      const s = src[e], t = dst[e];
      let dx = x[t] + vx[t] - x[s] - vx[s], dy = y[t] + vy[t] - y[s] - vy[s];
      let l = Math.sqrt(dx * dx + dy * dy) || 1e-3;
      const d = typeof L === "number" ? L : L[e];
      l = ((l - d) / l) * alpha * lstr[e];
      dx *= l; dy *= l;
      const b = bias[e];
      vx[t] -= dx * b; vy[t] -= dy * b;
      vx[s] += dx * (1 - b); vy[s] += dy * (1 - b);
    }
  }

  function anchors(alpha) {
    const a = P.anchorStrength * alpha, c = P.centerStrength * alpha;
    if (a) for (let i = 0; i < n; i++) { vx[i] += (ax[i] - x[i]) * a; vy[i] += (ay[i] - y[i]) * a; }
    if (c) for (let i = 0; i < n; i++) { vx[i] -= x[i] * c; vy[i] -= y[i] * c; }
  }

  function collide() {
    const pad = P.collidePad, st = P.collideStrength;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = x[i] + vx[i] - x[j] - vx[j], dy = y[i] + vy[i] - y[j] - vy[j];
        const r = rad[i] + rad[j] + pad;
        let l = dx * dx + dy * dy;
        if (l >= r * r) continue;
        if (l === 0) { dx = (Math.random() - 0.5) * 1e-2; dy = (Math.random() - 0.5) * 1e-2; l = dx * dx + dy * dy; }
        l = Math.sqrt(l);
        const f = ((r - l) / l) * st;
        dx *= f; dy *= f;
        const ri = rad[i] * rad[i], rj = rad[j] * rad[j], u = rj / (ri + rj);
        vx[i] += dx * u; vy[i] += dy * u;
        vx[j] -= dx * (1 - u); vy[j] -= dy * (1 - u);
      }
    }
  }

  const sim = {
    n, x, y, P, ticks: 0,
    get alpha() { return P.alpha; },
    set alpha(v) { P.alpha = v; },
    tick() {
      P.alpha += (P.alphaTarget - P.alpha) * P.alphaDecay;
      const a = P.alpha;
      links(a);
      manyBody(a);
      anchors(a);
      if (P.collide) collide();
      const keep = 1 - P.velocityDecay;
      for (let i = 0; i < n; i++) {
        if (fixed[i]) { x[i] = fx[i]; y[i] = fy[i]; vx[i] = vy[i] = 0; continue; }
        vx[i] *= keep; vy[i] *= keep;
        x[i] += vx[i]; y[i] += vy[i];
      }
      sim.ticks++;
    },
    done() { return P.alpha < P.alphaMin; },
    fix(i, px, py) { fixed[i] = 1; fx[i] = px; fy[i] = py; },
    unfix(i) { fixed[i] = 0; },
    setParams(p) { Object.assign(P, p); },
  };
  return sim;
}

/**
 * Run a force simulation off the main thread when possible.
 * onTick(xy: Float32Array interleaved, info:{alpha, ticks, done, worker}) is called with fresh positions.
 */
export function createRunner(onTick) {
  let worker = null, gen = 0, sim = null, raf = 0, running = false, mode = "worker";
  try {
    worker = new Worker(new URL("./viz-force-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.gen !== gen) return;
      if (m.type === "tick") onTick(m.xy, { alpha: m.alpha, ticks: m.ticks, done: m.done, worker: true });
    };
    worker.onerror = (e) => { e.preventDefault?.(); fallback(); };
  } catch { worker = null; mode = "main"; }

  let lastCfg = null;
  function fallback() {
    if (mode === "main") return;
    mode = "main";
    try { worker?.terminate(); } catch { /* ignore */ }
    worker = null;
    if (lastCfg) api.start(lastCfg);
  }
  function loopMain() {
    if (!running || !sim) return;
    const t0 = performance.now();
    do sim.tick(); while (performance.now() - t0 < 9 && !sim.done());
    const xy = new Float32Array(sim.n * 2);
    for (let i = 0; i < sim.n; i++) { xy[2 * i] = sim.x[i]; xy[2 * i + 1] = sim.y[i]; }
    const done = sim.done();
    onTick(xy, { alpha: sim.alpha, ticks: sim.ticks, done, worker: false });
    if (done) { running = false; return; }
    raf = requestAnimationFrame(loopMain);
  }
  const api = {
    get mode() { return mode; },
    start(cfg) {
      lastCfg = cfg;
      gen++;
      if (worker) { worker.postMessage({ type: "init", gen, cfg }); return; }
      cancelAnimationFrame(raf);
      sim = createForce(cfg);
      running = true;
      raf = requestAnimationFrame(loopMain);
    },
    stop() {
      if (worker) worker.postMessage({ type: "stop", gen });
      running = false; cancelAnimationFrame(raf);
    },
    resume(alpha = 0.3) {
      if (worker) { worker.postMessage({ type: "resume", gen, alpha }); return; }
      if (!sim) return;
      sim.alpha = Math.max(sim.alpha, alpha);
      if (!running) { running = true; raf = requestAnimationFrame(loopMain); }
    },
    fix(i, x, y) { if (worker) worker.postMessage({ type: "fix", gen, i, x, y }); else sim?.fix(i, x, y); },
    unfix(i) { if (worker) worker.postMessage({ type: "unfix", gen, i }); else sim?.unfix(i); },
    terminate() { try { worker?.terminate(); } catch { /* ignore */ } cancelAnimationFrame(raf); running = false; },
  };
  return api;
}
