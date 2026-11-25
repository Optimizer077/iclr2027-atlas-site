// Module worker: runs createForce() in ~14 ms slices and posts interleaved positions back.
import { createForce } from "./viz-force.js";

let sim = null, gen = 0, running = false, timer = 0;

function post(done) {
  const xy = new Float32Array(sim.n * 2);
  for (let i = 0; i < sim.n; i++) { xy[2 * i] = sim.x[i]; xy[2 * i + 1] = sim.y[i]; }
  self.postMessage({ type: "tick", gen, xy, alpha: sim.alpha, ticks: sim.ticks, done }, [xy.buffer]);
}

function loop() {
  timer = 0;
  if (!running || !sim) return;
  const t0 = performance.now();
  do sim.tick(); while (performance.now() - t0 < 14 && !sim.done());
  const done = sim.done();
  post(done);
  if (done) { running = false; return; }
  timer = setTimeout(loop, 0);
}

function kick() { if (!timer && running) timer = setTimeout(loop, 0); }

self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") {
    gen = m.gen;
    sim = createForce(m.cfg);
    running = true;
    clearTimeout(timer); timer = 0;
    kick();
    return;
  }
  if (m.gen !== gen || !sim) return;
  if (m.type === "stop") { running = false; clearTimeout(timer); timer = 0; post(true); }
  else if (m.type === "resume") { sim.alpha = Math.max(sim.alpha, m.alpha ?? 0.3); running = true; kick(); }
  else if (m.type === "fix") { sim.fix(m.i, m.x, m.y); sim.alpha = Math.max(sim.alpha, 0.15); running = true; kick(); }
  else if (m.type === "unfix") { sim.unfix(m.i); }
};
