// 2-D view transform with wheel zoom, drag pan, pinch zoom and click/hover callbacks.
// World y points up (screen y is flipped), so the map reads like a chart.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class Camera {
  /**
   * @param {HTMLElement} el  element receiving pointer events (the top canvas)
   * @param {{onChange?:Function, onHover?:Function, onLeave?:Function, onClick?:Function, onDragStart?:Function, minK?:number, maxK?:number}} opt
   */
  constructor(el, opt = {}) {
    this.el = el;
    this.opt = opt;
    this.cx = 0; this.cy = 0; this.k = 1;
    this.w = 1; this.h = 1;
    this.fitK = 1;
    this.minK = opt.minK ?? 0.05;
    this.maxK = opt.maxK ?? 1e6;
    this.ptrs = new Map();
    this.moved = false;
    this.anim = 0;
    this.interacted = false;
    this.bind();
  }

  resize(w, h) { this.w = w; this.h = h; }

  sx(wx) { return (wx - this.cx) * this.k + this.w / 2; }
  sy(wy) { return this.h / 2 - (wy - this.cy) * this.k; }
  wx(sx) { return (sx - this.w / 2) / this.k + this.cx; }
  wy(sy) { return this.cy - (sy - this.h / 2) / this.k; }
  /** Zoom relative to the fitted view (1 = whole plate). */
  get zoom() { return this.k / this.fitK; }

  /** Fit world bounds [x0,y0,x1,y1] into the viewport with padding (px). */
  fit(b, pad = 40, { animate = false, remember = true, padLeft = 0, padRight = 0, padTop = 0, padBottom = 0, maxZoom = Infinity } = {}) {
    const bw = Math.max(1e-9, b[2] - b[0]), bh = Math.max(1e-9, b[3] - b[1]);
    const aw = Math.max(50, this.w - 2 * pad - padLeft - padRight), ah = Math.max(50, this.h - 2 * pad - padTop - padBottom);
    let k = Math.min(aw / bw, ah / bh);
    if (!remember) k = Math.min(k, this.fitK * maxZoom);
    // shift centre so the fitted box sits between padLeft and padRight
    const cx = (b[0] + b[2]) / 2 - (padLeft - padRight) / 2 / k, cy = (b[1] + b[3]) / 2 + (padTop - padBottom) / 2 / k;
    if (remember) { this.fitK = k; this.minK = k * 0.35; this.maxK = k * 220; }
    if (animate) this.flyTo(cx, cy, k); else this.set(cx, cy, k);
  }

  set(cx, cy, k) {
    this.cx = cx; this.cy = cy; this.k = clamp(k, this.minK, this.maxK);
    this.opt.onChange?.(this);
  }

  zoomAt(sx, sy, f) {
    const k = clamp(this.k * f, this.minK, this.maxK);
    const wx = this.wx(sx), wy = this.wy(sy);
    this.k = k;
    this.cx = wx - (sx - this.w / 2) / k;
    this.cy = wy + (sy - this.h / 2) / k;
    this.opt.onChange?.(this);
  }

  panBy(dx, dy) { this.cx -= dx / this.k; this.cy += dy / this.k; this.opt.onChange?.(this); }

  flyTo(cx, cy, k, ms = 520) {
    cancelAnimationFrame(this.anim);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    k = clamp(k, this.minK, this.maxK);
    if (reduce || ms <= 0) { this.set(cx, cy, k); return; }
    const a = { cx: this.cx, cy: this.cy, k: this.k }, t0 = performance.now();
    const lk0 = Math.log(a.k), lk1 = Math.log(k);
    const step = (now) => {
      const u = Math.min(1, (now - t0) / ms), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      this.cx = a.cx + (cx - a.cx) * e; this.cy = a.cy + (cy - a.cy) * e; this.k = Math.exp(lk0 + (lk1 - lk0) * e);
      this.opt.onChange?.(this);
      if (u < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  bind() {
    const el = this.el;
    el.style.touchAction = "none";
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      cancelAnimationFrame(this.anim);
      this.interacted = true;
      const r = el.getBoundingClientRect();
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-clamp(d, -240, 240) * 0.0022));
    }, { passive: false });

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      cancelAnimationFrame(this.anim);
      el.setPointerCapture?.(e.pointerId);
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
      if (this.ptrs.size === 1) this.moved = false;
      if (this.ptrs.size === 2) { this.moved = true; this.pinch = this.pinchState(); }
    });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const p = this.ptrs.get(e.pointerId);
      if (!p) { this.opt.onHover?.(e.clientX - r.left, e.clientY - r.top, e); return; }
      if (this.ptrs.size === 1) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        if (!this.moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 4) {
          this.moved = true; this.interacted = true; el.classList.add("grabbing"); this.opt.onDragStart?.();
        }
        p.x = e.clientX; p.y = e.clientY;
        if (this.moved) this.panBy(dx, dy);
      } else if (this.ptrs.size === 2) {
        p.x = e.clientX; p.y = e.clientY;
        const s = this.pinchState(), s0 = this.pinch;
        if (s0 && s0.d > 0) {
          this.interacted = true;
          this.panBy(s.mx - s0.mx, s.my - s0.my);
          this.zoomAt(s.mx - r.left, s.my - r.top, s.d / s0.d);
        }
        this.pinch = s;
      }
    });
    const end = (e) => {
      const had = this.ptrs.has(e.pointerId);
      const wasSingle = this.ptrs.size === 1;
      this.ptrs.delete(e.pointerId);
      if (this.ptrs.size < 2) this.pinch = null;
      el.classList.remove("grabbing");
      if (had && wasSingle && !this.moved && e.type === "pointerup") {
        const r = el.getBoundingClientRect();
        this.opt.onClick?.(e.clientX - r.left, e.clientY - r.top, e);
      }
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", (e) => { if (!this.ptrs.size) this.opt.onLeave?.(e); });
    el.addEventListener("dblclick", (e) => {
      const r = el.getBoundingClientRect();
      this.interacted = true;
      const sx = e.clientX - r.left, sy = e.clientY - r.top;
      const wx = this.wx(sx), wy = this.wy(sy), k = this.k * (e.shiftKey ? 0.5 : 2);
      this.flyTo(wx - (sx - this.w / 2) / k, wy + (sy - this.h / 2) / k, k, 320);
    });
  }

  pinchState() {
    const [a, b] = [...this.ptrs.values()];
    return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) };
  }

  /** Keyboard: + / - zoom around centre, arrows pan, 0 handled by the page (fit). */
  key(e) {
    const f = { "+": 1.4, "=": 1.4, "-": 1 / 1.4, _: 1 / 1.4 }[e.key];
    if (f) { this.interacted = true; this.flyTo(this.cx, this.cy, this.k * f, 220); return true; }
    const step = 80 / this.k;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (d) { this.interacted = true; this.flyTo(this.cx + d[0], this.cy + d[1], this.k, 160); return true; }
    return false;
  }
}
