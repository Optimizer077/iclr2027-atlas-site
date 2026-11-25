// Fixed-row-height virtual list. Renders only the rows in view (+ overscan) as an HTML string,
// so 42k rows cost the same as 40.

export class VirtualList {
  /**
   * @param {HTMLElement} scroller  element with overflow:auto
   * @param {{rowHeight:number, render:(item:any, index:number, selected:boolean)=>string, overscan?:number,
   *          onClick?:(index:number, event:MouseEvent)=>void}} opts
   */
  constructor(scroller, opts) {
    this.scroller = scroller;
    this.rh = opts.rowHeight;
    this.render = opts.render;
    this.overscan = opts.overscan ?? 6;
    this.items = [];
    this.selected = -1;
    this.range = [-1, -1];
    scroller.classList.add("vlist");
    this.sizer = document.createElement("div");
    this.sizer.className = "vlist-sizer";
    this.pane = document.createElement("div");
    this.pane.className = "vlist-pane";
    this.sizer.append(this.pane);
    scroller.append(this.sizer);
    scroller.addEventListener("scroll", () => this.draw(), { passive: true });
    new ResizeObserver(() => this.draw(true)).observe(scroller);
    if (opts.onClick) {
      this.pane.addEventListener("click", (e) => {
        const row = e.target.closest("[data-i]");
        if (row) opts.onClick(Number(row.dataset.i), e);
      });
    }
  }

  setItems(items, { keepScroll = false } = {}) {
    this.items = items;
    this.sizer.style.height = `${items.length * this.rh}px`;
    if (!keepScroll) this.scroller.scrollTop = 0;
    this.draw(true);
  }

  setSelected(i, { scroll = true } = {}) {
    this.selected = i;
    if (scroll && i >= 0) this.scrollToIndex(i);
    this.draw(true);
  }

  scrollToIndex(i) {
    const top = i * this.rh, bottom = top + this.rh;
    const st = this.scroller.scrollTop, ch = this.scroller.clientHeight;
    const pad = this.rh * 1.5;
    if (top < st + pad) this.scroller.scrollTop = Math.max(0, top - pad);
    else if (bottom > st + ch - pad) this.scroller.scrollTop = bottom - ch + pad;
  }

  refresh() { this.draw(true); }

  draw(force = false) {
    const n = this.items.length;
    const st = this.scroller.scrollTop, ch = this.scroller.clientHeight || 800;
    const start = Math.max(0, Math.floor(st / this.rh) - this.overscan);
    const end = Math.min(n, Math.ceil((st + ch) / this.rh) + this.overscan);
    if (!force && start === this.range[0] && end === this.range[1]) return;
    this.range = [start, end];
    let html = "";
    for (let i = start; i < end; i++) html += this.render(this.items[i], i, i === this.selected);
    this.pane.style.transform = `translateY(${start * this.rh}px)`;
    this.pane.innerHTML = html;
  }
}
