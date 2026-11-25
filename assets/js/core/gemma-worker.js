// Web Worker for in-browser EmbeddingGemma query encoding (off the main UI thread).
// Loads @huggingface/transformers lazily ONLY after user opt-in ("init" message).
// Uses dtype: "q8" (model_quantized.onnx, ~309.5 MB + 21.5 MB tokenizer) across BOTH
// WebGPU and WASM so cosine fidelity stays >= 0.992 vs Python fp32, WASM never hits
// GatherBlockQuantized errors, and GPU->WASM fallback reuses the exact same cached files.

const TRANSFORMERS_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/+esm";
const SOFTWARE_GPU_RE = /swiftshader|llvmpipe|lavapipe|software|warp|basic render/i;
const WEBGPU_SLOW_FALLBACK_MS = 1500;

let tokenizer = null;
let model = null;
let activeDevice = null;
let activeDtype = "q8";
let activeModelId = null;
let activeThreads = 1;
let isCoi = false;

async function detectHardwareWebGPU() {
  try {
    if (typeof self === "undefined" || !self.navigator?.gpu) {
      return { ok: false, reason: "no navigator.gpu" };
    }
    const adapter = await self.navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) return { ok: false, reason: "no adapter" };
    const info = adapter.info || {};
    if (adapter.isFallbackAdapter === true || info.isFallbackAdapter === true) {
      return { ok: false, reason: "fallback adapter" };
    }
    const desc = `${info.vendor || ""} ${info.architecture || ""} ${info.device || ""} ${info.description || ""}`;
    if (SOFTWARE_GPU_RE.test(desc)) {
      return { ok: false, reason: `software adapter (${desc.trim()})` };
    }
    return {
      ok: true,
      info: {
        vendor: info.vendor || "",
        arch: info.architecture || "",
        desc: info.description || "",
      },
    };
  } catch (e) {
    return { ok: false, reason: String(e?.message || e) };
  }
}

function disposeTensors(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    try { obj[k]?.dispose?.(); } catch { /* ignore */ }
  }
}

async function runSingleEmbed(text, queryPrompt, dims) {
  const t0 = performance.now();
  const inputs = await tokenizer([queryPrompt + text], { padding: true, truncation: true });
  const t1 = performance.now();
  const out = await model(inputs);
  const tensor = out?.sentence_embedding || out?.last_hidden_state;
  if (!tensor || !tensor.data || tensor.data.length < dims) {
    disposeTensors(inputs);
    disposeTensors(out);
    throw new Error("Unexpected EmbeddingGemma output tensor");
  }
  const raw = tensor.data;
  const vec = new Float32Array(dims);
  let norm2 = 0;
  for (let i = 0; i < dims; i++) {
    const v = raw[i];
    vec[i] = v;
    norm2 += v * v;
  }
  const inv = 1 / Math.sqrt(norm2 || 1e-12);
  for (let i = 0; i < dims; i++) vec[i] *= inv;
  const t2 = performance.now();

  disposeTensors(inputs);
  disposeTensors(out);

  return {
    vec,
    tokMs: +(t1 - t0).toFixed(2),
    infMs: +(t2 - t1).toFixed(2),
    embedMs: +(t2 - t0).toFixed(2),
  };
}

async function handleInit(msg) {
  const { id, modelId, queryPrompt, dims = 256, preferredDtype = "q8" } = msg;

  const progressCallback = (ev) => {
    if (!ev || typeof ev !== "object") return;
    self.postMessage({
      type: "progress",
      event: {
        status: ev.status,
        file: ev.file || ev.name || "",
        loaded: ev.loaded,
        total: ev.total,
      },
    });
  };

  self.postMessage({ type: "stage", stage: "runtime", text: "Loading Transformers.js runtime in background worker…" });
  let tf;
  try {
    tf = await import(/* @vite-ignore */ TRANSFORMERS_CDN);
  } catch (e) {
    throw new Error(`Could not load Transformers.js from CDN (${e?.message || e})`);
  }

  const { AutoModel, AutoTokenizer, env } = tf;
  if (!AutoModel || !AutoTokenizer) {
    throw new Error("Transformers.js bundle missing AutoModel/AutoTokenizer.");
  }

  env.allowLocalModels = false;
  env.useBrowserCache = true;
  // Enable multi-threaded WASM automatically only if host provides Cross-Origin Isolation.
  isCoi = Boolean(self.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined");
  activeThreads = isCoi ? Math.min(4, self.navigator?.hardwareConcurrency || 4) : 1;
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = activeThreads;
  }

  self.postMessage({ type: "stage", stage: "tokenizer", text: "Loading EmbeddingGemma tokenizer…" });
  tokenizer = await AutoTokenizer.from_pretrained(modelId, { progress_callback: progressCallback });

  const gpu = await detectHardwareWebGPU();
  const attempts = gpu.ok
    ? [
        { device: "webgpu", dtype: preferredDtype },
        { device: "wasm", dtype: "q8" },
      ]
    : [{ device: "wasm", dtype: "q8" }];

  let lastErr = null;
  let warmupMs = 0;

  for (const cfg of attempts) {
    try {
      self.postMessage({
        type: "stage",
        stage: "model",
        text: `Loading EmbeddingGemma (${cfg.dtype}, ${cfg.device.toUpperCase()})…`,
      });
      model = await AutoModel.from_pretrained(modelId, {
        dtype: cfg.dtype,
        device: cfg.device,
        progress_callback: progressCallback,
      });

      // Warm up with a dummy query immediately after enable so shader compilation / WASM JIT
      // completes before the visitor submits their first real search.
      self.postMessage({
        type: "stage",
        stage: "warmup",
        text: `Warming up ${cfg.device.toUpperCase()} backend…`,
      });
      const w1 = await runSingleEmbed("warmup query for search initialization", queryPrompt, dims);
      const w2 = await runSingleEmbed("test", queryPrompt, dims);
      warmupMs = Math.round(w1.embedMs + w2.embedMs);

      // Guard against misreported software/throttled WebGPU drivers: if warm GPU inference
      // is slower than 1.5 s, fall back to WASM q8 (~180 ms) reusing the exact same cached files.
      if (cfg.device === "webgpu" && w2.embedMs > WEBGPU_SLOW_FALLBACK_MS && attempts.length > 1) {
        try { await model.dispose?.(); } catch { /* ignore */ }
        model = null;
        lastErr = new Error(`WebGPU warm pass too slow (${Math.round(w2.embedMs)} ms)`);
        continue;
      }

      activeDevice = cfg.device;
      activeDtype = cfg.dtype;
      activeModelId = modelId;
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
      try { await model?.dispose?.(); } catch { /* ignore */ }
      model = null;
    }
  }

  if (!model) {
    throw lastErr || new Error("Failed to initialize EmbeddingGemma ONNX model.");
  }

  self.postMessage({
    type: "initResult",
    id,
    device: activeDevice,
    dtype: activeDtype,
    modelId: activeModelId,
    warmupMs,
    crossOriginIsolated: isCoi,
    wasmThreads: activeDevice === "wasm" ? activeThreads : 1,
    gpuInfo: gpu.ok ? gpu.info : null,
  });
}

async function handleEmbed(msg) {
  const { id, text, queryPrompt, dims = 256 } = msg;
  if (!model || !tokenizer) {
    throw new Error("EmbeddingGemma worker is not initialized.");
  }
  const res = await runSingleEmbed(text, queryPrompt, dims);
  self.postMessage(
    {
      type: "embedResult",
      id,
      vec: res.vec,
      tokMs: res.tokMs,
      infMs: res.infMs,
      embedMs: res.embedMs,
    },
    [res.vec.buffer]
  );
}

self.onmessage = async (ev) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  try {
    if (msg.type === "init") {
      await handleInit(msg);
    } else if (msg.type === "embed") {
      await handleEmbed(msg);
    }
  } catch (e) {
    const errMsg = String(e?.message || e || "Worker error");
    self.postMessage({
      type: msg.type === "init" ? "initError" : "embedError",
      id: msg.id,
      error: errMsg,
    });
  }
};
