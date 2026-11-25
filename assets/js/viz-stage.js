// A canvas "stage" for the graph views: one DPR-aware canvas inside the plate, a Camera, and a
// rAF-coalesced draw loop. Each view owns its own stage so cameras never share listeners.
import { Camera } from "./viz-camera.js";
import { fitCanvas } from "./viz-common.js";

export class Stage {
  /**
   * @param {HTMLElement} plate
   * @param {{draw:(ctx:CanvasRenderingContext2D, stage:Stage)=>void, onHover?:Function, onLeave?:Function,
   *          onClick?:Function, onCamera?:Function, label?:string}} hooks
   */
  constructor(plate, hooks) {
    this.plate = plate;
    this.hooks = hooks;
    this.cv = document.createElement("canvas");
    this.cv.className = "plate-cv plate-top";
    this.cv.setAttribute("role", "img");
    this.cv.setAttribute("aria-label", hooks.label || "Graph");
    plate.insertBefore(this.cv, plate.querySelector(".neatline"));
    this.ctx = this.cv.getContext("2d");
    this.raf = 0;
    this.drawMs = 0;
    this.frames = 0;
    this.cam = new Camera(this.cv, {
      onChange: () => { hooks.onCamera?.(this); this.request(); },
      onHover: (x, y, e) => hooks.onHover?.(x, y, e),
      onLeave: (e) => hooks.onLeave?.(e),
      onClick: (x, y, e) => hooks.onClick?.(x, y, e),
      onDragStart: () => hooks.onLeave?.(),
    });
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(plate);
  }

  get visible() { return !this.cv.hidden; }
  show() { this.cv.hidden = false; this.resize(); }
  hide() { this.cv.hidden = true; }

  resize() {
    if (this.cv.hidden) return;
    fitCanvas(this.cv);
    const r = this.plate.getBoundingClientRect();
    this.cam.resize(r.width, r.height);
    this.hooks.onResize?.(this);
    this.request();
  }

  request() { if (!this.raf && !this.cv.hidden) this.raf = requestAnimationFrame(() => this.frame()); }

  frame() {
    this.raf = 0;
    const t0 = performance.now();
    const { cv, ctx } = this;
    const dpr = cv._dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.hooks.draw(ctx, this);
    this.drawMs = performance.now() - t0;
    this.frames++;
  }
}
