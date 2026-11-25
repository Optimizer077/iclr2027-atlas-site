/* On-device "Ask Gemma" chat & summarizer for the ICLR 2027 Atlas.
   MediaPipe LLM Inference (@mediapipe/tasks-genai@0.10.29) + Gemma 4 E2B LiteRT web (.task, ~2.00 GB, Apache-2.0).
   Downloaded from Hugging Face ONLY after explicit visitor confirmation, cached in OPFS.
   Grounded RAG via window.AtlasGemmaRAG: Q&A and structured "Summarize these results".
   Exposes window.AtlasGemma: { open(prefill), toggle(), close(), summarize(ids, query), mountInline(el) }. */
(function () {
  'use strict';

  var MODEL_URL = 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task';
  var MODEL_PAGE = 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm';
  var MODEL_BYTES = 2003697664;
  var FILE_NAME = 'gemma-4-E2B-it-web.task';
  var GENAI = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.29';
  var MAX_TOKENS = 2048;
  var PROMPT_BUDGET = 1400;

  var SYSTEM_ASK = 'You are an on-device research assistant for the ICLR 2027 Atlas, running locally in the browser. ' +
    'Use ONLY the numbered passages in the user message. Never use outside knowledge or invent papers, methods, or numbers. ' +
    'Cite every paper you mention by its exact submission number (for example #4088). ' +
    'If the passages do not answer the question, state clearly that the retrieved Atlas passages do not cover it. Be concise and factual.';

  var SYSTEM_SUM = 'You are an on-device research assistant for the ICLR 2027 Atlas, running locally in the browser. ' +
    'Use ONLY the numbered paper passages in the user message. Never use outside knowledge or invent claims, scores, or numbers. ' +
    'Write a structured briefing with exactly four short sections: 1. Overview, 2. Main approaches, 3. Strongest papers, 4. Open gaps. ' +
    'Cite papers by their exact submission number (for example #4088) throughout.';

  var EXAMPLES = [
    'time-series forecasting under distribution shift',
    'KV cache compression for long context',
    'process reward models for math reasoning',
    'sparse autoencoders for interpretability'
  ];

  var panel = null, isInline = false, els = {}, llm = null, busy = false, loading = false, initializing = false;
  var history = [], mode = 'ask', pendingIds = [], epoch = 0, abortCtl = null;
  var gpuState = { ok: false, cached: false, note: '' };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function mkBtn(cls, text, onClick, action) {
    var b = el('button', cls, text);
    b.type = 'button';
    if (action) b.dataset.agAction = action;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  function mkLink(cls, text, href, title) {
    var a = el('a', cls, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    if (title) a.title = title;
    return a;
  }
  function gb(n) { return (n / 1e9).toFixed(2) + ' GB'; }
  function clean(s) {
    return String(s || '').replace(/<\|channel>[\s\S]*?<channel\|>/g, '').replace(/<\|?turn\|?>(model|user)?/g, '')
      .replace(/<\|?[a-z_]+\|?>/g, '').replace(/^\s+/, '');
  }
  function reveal(first, last) {
    if (!els.body || !first || !last) return;
    var body = els.body, base = body.getBoundingClientRect().top - body.scrollTop;
    var top = first.getBoundingClientRect().top - base, end = last.getBoundingClientRect().bottom - base;
    body.scrollTop = Math.max(0, ((end - top <= body.clientHeight) ? top : last.getBoundingClientRect().top - base) - 8);
  }

  /* ---------- device & OPFS storage ---------- */
  function isPhone() {
    var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    return coarse || Math.min(screen.width, screen.height) < 700 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }
  function deviceWarnings(cached) {
    var out = [], conn = navigator.connection || {}, ram = navigator.deviceMemory;
    if (isPhone()) out.push('You appear to be on a phone or tablet. Running a 2 GB LiteRT model on mobile is heavy on battery and memory and may crash the tab.');
    if (!cached && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || '') || conn.type === 'cellular')) {
      out.push('Your connection looks metered or slow. The one-time download is ' + gb(MODEL_BYTES) + ' — use Wi-Fi if possible.');
    } else if (!cached && isPhone()) {
      out.push('The one-time download is ' + gb(MODEL_BYTES) + ' — use Wi-Fi rather than mobile data.');
    }
    if (ram && ram < 6) out.push('This device reports about ' + ram + ' GB of RAM; the model needs ~2 GB free and may fail to load.');
    return out;
  }
  function opfsRoot() {
    return (navigator.storage && navigator.storage.getDirectory) ? navigator.storage.getDirectory().catch(function () { return null; }) : Promise.resolve(null);
  }
  function savedModel() {
    return opfsRoot().then(function (root) {
      return root ? root.getFileHandle(FILE_NAME).then(function (h) { return h.getFile(); })
        .then(function (f) { return f.size === MODEL_BYTES ? f : null; }).catch(function () { return null; }) : null;
    });
  }
  function deleteSaved() {
    return opfsRoot().then(function (root) { return root ? root.removeEntry(FILE_NAME).catch(function () {}) : null; });
  }
  function enoughSpace() {
    if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(false);
    return navigator.storage.estimate().then(function (e) { return (e.quota - e.usage) > MODEL_BYTES * 1.1; }).catch(function () { return false; });
  }
  function progressStream(stream, total, label) {
    var loaded = 0, lastPaint = 0;
    return stream.pipeThrough(new TransformStream({
      transform: function (chunk, ctl) {
        loaded += chunk.byteLength;
        var now = performance.now();
        if (now - lastPaint > 120) {
          lastPaint = now;
          var pct = Math.min(100, loaded / total * 100);
          setStatus(label + ' ' + gb(loaded) + ' / ' + gb(total) + ' (' + pct.toFixed(0) + '%)');
          if (els.bar) els.bar.style.width = pct.toFixed(1) + '%';
        }
        ctl.enqueue(chunk);
      }
    }));
  }
  function downloadModel() {
    abortCtl = new AbortController();
    return fetch(MODEL_URL, { signal: abortCtl.signal }).then(function (res) {
      if (!res.ok) throw new Error('download failed (HTTP ' + res.status + ')');
      return res.body;
    });
  }
  function modelReader() {
    return savedModel().then(function (file) {
      if (file) return progressStream(file.stream(), MODEL_BYTES, 'Loading from disk').getReader();
      return Promise.all([opfsRoot(), enoughSpace()]).then(function (r) {
        var root = r[0], space = r[1];
        var streamDirect = function () { return downloadModel().then(function (body) { return progressStream(body, MODEL_BYTES, 'Downloading').getReader(); }); };
        if (!root || !space) return streamDirect();
        if (navigator.storage.persist) navigator.storage.persist().catch(function () {});
        return root.getFileHandle(FILE_NAME, { create: true })
          .then(function (h) {
            return h.createWritable().then(function (w) {
              return downloadModel().then(function (body) { return progressStream(body, MODEL_BYTES, 'Downloading to disk').pipeTo(w); })
                .then(function () { return h.getFile(); });
            });
          })
          .then(function (saved) {
            if (saved.size !== MODEL_BYTES) throw new Error('incomplete download');
            return progressStream(saved.stream(), MODEL_BYTES, 'Loading into GPU memory').getReader();
          })
          .catch(function (err) {
            return deleteSaved().then(function () {
              if (/HTTP/.test(err && err.message) || (err && err.name === 'AbortError')) throw err;
              setStatus('Saving to disk failed; streaming model instead…');
              return streamDirect();
            });
          });
      });
    });
  }

  /* ---------- grounded DOM rendering & prompting ---------- */
  function appendInlineRich(parent, text, hitMap) {
    var re = /(\*\*[^*]+\*\*|#\d{1,6}\b)/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var tok = m[0];
      if (tok[0] === '*') {
        var b = el('strong'); appendInlineRich(b, tok.slice(2, -2), hitMap); parent.appendChild(b);
      } else {
        var num = parseInt(tok.slice(1), 10);
        var p = (hitMap && hitMap[num]) || (window.AtlasGemmaRAG && window.AtlasGemmaRAG.byNumber(num));
        if (p) {
          var tip = (p.title || p.t || '') + (p.r != null ? ' · mean ' + Number(p.r).toFixed(2) : '');
          parent.appendChild(mkLink('ag-cite', '#' + num, 'https://openreview.net/forum?id=' + encodeURIComponent(p.id), tip));
        } else parent.appendChild(document.createTextNode(tok));
      }
      last = m.index + tok.length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function renderGrounded(container, text, hits) {
    container.textContent = '';
    var hitMap = Object.create(null), lines = String(text || '').split(/\r?\n/), ul = null;
    (hits || []).forEach(function (h) { hitMap[h.n] = h; });
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) { ul = null; continue; }
      var hm = line.match(/^#{1,4}\s+(.+)$/), bm = !hm && line.match(/^[-*•]\s+(.+)$/);
      if (hm) { ul = null; var h4 = el('h4', 'ag-h'); appendInlineRich(h4, hm[1], hitMap); container.appendChild(h4); }
      else if (bm) {
        if (!ul) { ul = el('ul', 'ag-list'); container.appendChild(ul); }
        var li = el('li'); appendInlineRich(li, bm[1], hitMap); ul.appendChild(li);
      } else { ul = null; var p = el('p', 'ag-p'); appendInlineRich(p, line, hitMap); container.appendChild(p); }
    }
  }

  function buildPrompt(userText, hits, curMode) {
    var isSum = curMode === 'summarize', sys = isSum ? SYSTEM_SUM : SYSTEM_ASK;
    var keep = (hits || []).slice(), turns = isSum ? [] : history.slice();
    var render = function () {
      var s = '<|turn>system\n' + sys + '<turn|>\n';
      turns.forEach(function (t) { s += '<|turn>' + t.role + '\n' + t.text + '<turn|>\n'; });
      var body = 'Passages:\n' + keep.map(function (h, i) { return '[' + (i + 1) + '] ' + h.passage; }).join('\n') + '\n\n' +
        (isSum ? ('Summarize these results' + (userText ? ' for query: ' + userText : '') + '.') : ('Question: ' + userText));
      return s + '<|turn>user\n' + body + '<turn|>\n<|turn>model\n';
    };
    var prompt = render();
    while (llm && typeof llm.sizeInTokens === 'function' && (llm.sizeInTokens(prompt) || 0) > PROMPT_BUDGET) {
      if (keep.length > 3) keep.pop(); else if (turns.length >= 2) turns = turns.slice(2); else if (keep.length > 1) keep.pop(); else break;
      prompt = render();
    }
    return { prompt: prompt, used: keep };
  }

  /* ---------- UI construction ---------- */
  function setStatus(t) { if (els.status) els.status.textContent = t; }
  function updateModeUI() {
    if (!els.tabAsk) return;
    els.tabAsk.setAttribute('aria-pressed', mode === 'ask' ? 'true' : 'false');
    els.tabSum.setAttribute('aria-pressed', mode === 'summarize' ? 'true' : 'false');
    els.sumBar.hidden = mode !== 'summarize';
    els.input.placeholder = mode === 'summarize'
      ? 'Optional topic/focus (or enter a query to summarize top hits)…'
      : (llm ? 'Ask Gemma about the ICLR 2027 papers…' : 'Ask a question (instant Atlas retrieval, or load Gemma above)…');
    els.send.textContent = busy ? 'Stop' : (mode === 'summarize' ? 'Summarize' : 'Ask');
    if (els.idsInput && pendingIds.length) els.idsInput.value = pendingIds.join(', ');
  }

  function buildPanel(host) {
    isInline = !!host;
    panel = el('section', 'ag-panel' + (isInline ? ' is-inline' : ' is-floating'));
    panel.id = 'atlas-gemma-panel';
    if (!isInline) {
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Ask Gemma'); panel.tabIndex = -1;
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closePanel(true); } });
    }
    var head = el('div', 'ag-head'), titleWrap = el('div', 'ag-title'), headBtns = el('div', 'ag-head-btns');
    els.sub = el('span', 'ag-sub', 'grounded in ICLR 2027 Atlas · optional on-device Gemma 4 E2B');
    titleWrap.append(el('b', null, 'Ask Gemma'), els.sub);
    els.unloadBtn = mkBtn('btn sm ghost', 'Unload model', function () { unloadModel(false); });
    els.unloadBtn.hidden = true;
    headBtns.appendChild(els.unloadBtn);
    if (!isInline) {
      els.close = mkBtn('ag-close', '×', function () { if (llm || loading || initializing) shutdown(); else closePanel(true); });
      els.close.setAttribute('aria-label', 'Close');
      headBtns.appendChild(els.close);
    }
    head.append(titleWrap, headBtns);

    var modeRow = el('div', 'ag-modes'), seg = el('div', 'seg');
    els.tabAsk = mkBtn(null, 'Ask about the papers', function () { mode = 'ask'; updateModeUI(); });
    els.tabSum = mkBtn(null, 'Summarize these results', function () { mode = 'summarize'; updateModeUI(); });
    seg.append(els.tabAsk, els.tabSum); modeRow.appendChild(seg);

    els.sumBar = el('div', 'ag-sumbar'); els.sumBar.hidden = true;
    var sumLbl = el('label', 'ag-sum-lbl', 'Paper IDs or #numbers (optional — leave blank to summarize top hits for your query):');
    els.idsInput = el('input', 'input ag-ids'); els.idsInput.type = 'text';
    els.idsInput.placeholder = 'e.g. #4088, #1234 or OpenReview IDs (comma-separated)';
    sumLbl.appendChild(els.idsInput); els.sumBar.appendChild(sumLbl);

    els.modelSlot = el('div', 'ag-model-slot');
    els.body = el('div', 'ag-body scroll-thin');
    els.body.setAttribute('role', 'log'); els.body.setAttribute('aria-label', 'Conversation'); els.body.tabIndex = 0;

    var exRow = el('div', 'ag-examples');
    exRow.appendChild(el('span', 'ag-ex-lbl', 'Try:'));
    EXAMPLES.forEach(function (q) { exRow.appendChild(mkBtn('ag-chip', q, function () { els.input.value = q; send(); })); });

    els.status = el('p', 'ag-status', 'Loading Atlas index…'); els.status.setAttribute('role', 'status');

    var form = el('form', 'ag-form');
    els.input = el('textarea', 'ag-input'); els.input.rows = 1; els.input.maxLength = 600;
    els.input.setAttribute('aria-label', 'Question about ICLR 2027 papers');
    els.input.addEventListener('input', function () { els.input.style.height = 'auto'; els.input.style.height = Math.min(els.input.scrollHeight + 2, 110) + 'px'; });
    els.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    els.send = el('button', 'btn primary ag-send', 'Ask'); els.send.type = 'submit';
    form.append(els.input, els.send);
    form.addEventListener('submit', function (e) { e.preventDefault(); send(); });

    panel.append(head, modeRow, els.sumBar, els.modelSlot, els.body, exRow, els.status, form);
    if (host) { host.textContent = ''; host.appendChild(panel); } else document.body.appendChild(panel);
    updateModeUI();
    initCorpusAndDevice();
  }

  function initCorpusAndDevice() {
    var mine = epoch;
    if (window.AtlasGemmaRAG) {
      window.AtlasGemmaRAG.ready().then(function () {
        if (mine !== epoch || !panel) return;
        setStatus('Atlas index ready (' + window.AtlasGemmaRAG.activeCount().toLocaleString() + ' active papers) · instant retrieval active');
      }).catch(function (err) {
        if (mine !== epoch || !panel) return;
        setStatus('Could not load Atlas data: ' + (err && err.message ? err.message : err));
      });
    }
    var checkGpu = navigator.gpu ? navigator.gpu.requestAdapter().then(function (a) { return !!a; }).catch(function () { return false; }) : Promise.resolve(false);
    Promise.all([checkGpu, savedModel().then(function (f) { return !!f; })]).then(function (r) {
      if (mine !== epoch || !panel) return;
      gpuState = { ok: r[0], cached: r[1], note: 'WebGPU is not available in this browser, so Gemma 4 cannot run here. Desktop Chrome or Edge is recommended. Instant Atlas retrieval still works below.' };
      renderModelIntro();
    });
  }

  function renderModelIntro() {
    if (!els.modelSlot) return;
    els.modelSlot.textContent = '';
    var box = el('div', 'ag-intro'), top = el('div', 'ag-intro-top'), info = el('div'), acts = el('div', 'ag-actions');
    info.append(
      el('strong', null, gpuState.cached ? 'Gemma 4 E2B saved on this device' : 'Optional on-device Gemma 4 E2B (~' + gb(MODEL_BYTES) + ')'),
      el('p', 'ag-intro-desc', gpuState.cached
        ? 'Cached in browser storage (OPFS). Loads locally onto your GPU in seconds; nothing leaves your device.'
        : 'Downloads once from Hugging Face (Apache-2.0) after you confirm, cached in OPFS. Until loaded, questions return matching Atlas passages directly.')
    );
    var go = mkBtn('btn primary sm', gpuState.cached ? 'Load Gemma 4' : 'Download & run Gemma 4 (' + gb(MODEL_BYTES) + ')', function () {
      if (gpuState.cached || window.__gemmaMock) loadModel(); else showConfirmDialog();
    }, 'prepare-load');
    go.disabled = !gpuState.ok && !window.__gemmaMock;
    acts.append(go, mkLink('btn sm', 'Model card ↗', MODEL_PAGE));
    if (gpuState.cached) {
      acts.appendChild(mkBtn('btn sm ghost', 'Delete cached 2 GB', function () {
        deleteSaved().then(function () { gpuState.cached = false; renderModelIntro(); setStatus('Deleted cached model — 2 GB freed.'); });
      }));
    }
    top.append(info, acts); box.appendChild(top);
    if (!gpuState.ok) box.appendChild(el('p', 'ag-warn', gpuState.note));
    deviceWarnings(gpuState.cached).forEach(function (w) { box.appendChild(el('p', 'ag-warn', w)); });
    els.modelSlot.appendChild(box);
  }

  function showConfirmDialog() {
    els.modelSlot.textContent = '';
    var dlg = el('div', 'ag-confirm'), ul = el('ul', 'ag-confirm-list'), row = el('div', 'ag-actions');
    dlg.setAttribute('role', 'alertdialog'); dlg.setAttribute('aria-label', 'Confirm Gemma 4 model download');
    dlg.appendChild(el('strong', null, 'Confirm ~' + gb(MODEL_BYTES) + ' download from Hugging Face?'));
    [
      'Model: litert-community/gemma-4-E2B-it-litert-lm (' + gb(MODEL_BYTES) + ', Apache-2.0).',
      'Saved once in this browser’s Origin Private File System (OPFS) so future visits load from disk.',
      'Runs locally on your GPU via WebGPU — no prompts or paper queries leave your device.',
      'Closing or cancelling aborts the download immediately.'
    ].forEach(function (t) { ul.appendChild(el('li', null, t)); });
    dlg.appendChild(ul);
    deviceWarnings(false).forEach(function (w) { dlg.appendChild(el('p', 'ag-warn', w)); });
    var yes = mkBtn('btn primary sm', isPhone() ? 'I understand — download ' + gb(MODEL_BYTES) : 'Confirm download (' + gb(MODEL_BYTES) + ')', loadModel, 'confirm-download');
    var no = mkBtn('btn sm', 'Cancel', function () { renderModelIntro(); setStatus('Download cancelled · instant retrieval still active'); }, 'cancel-confirm');
    row.append(yes, no); dlg.appendChild(row);
    els.modelSlot.appendChild(dlg);
    yes.focus();
  }

  /* ---------- model lifecycle ---------- */
  function onModelReady(t0) {
    loading = false; els.bar = null; gpuState.cached = true;
    els.modelSlot.textContent = ''; els.unloadBtn.hidden = false;
    els.sub.textContent = 'Gemma 4 E2B · running locally on your GPU';
    bubble('model', 'Gemma 4 E2B is ready on your GPU (' + ((performance.now() - t0) / 1000).toFixed(1) +
      ' s). Answers are grounded strictly in retrieved ICLR 2027 Atlas passages and cite #numbers. Verify important details via OpenReview.');
    els.input.disabled = false; els.send.disabled = false;
    updateModeUI(); setStatus('Ready on your GPU · nothing leaves your device');
  }

  function loadModel() {
    if (loading || llm) return;
    if (window.__gemmaMock) { llm = window.__gemmaMock; if (els.close) els.close.setAttribute('aria-label', 'Close and unload model'); onModelReady(performance.now()); return; }
    if (initializing) { setStatus('Finishing previous start — try again in a moment.'); return; }
    loading = true; initializing = true;
    var mine = epoch;
    if (els.close) els.close.setAttribute('aria-label', 'Close and abort download');
    els.input.disabled = true; els.send.disabled = true;

    els.modelSlot.textContent = '';
    var box = el('div', 'ag-loading-box'), top = el('div', 'ag-loading-top'), prog = el('div', 'ag-progress');
    top.append(el('span', null, 'Starting Gemma 4 E2B on WebGPU…'), mkBtn('btn sm', 'Abort download', function () { unloadModel(true); }, 'abort-download'));
    els.bar = el('span'); prog.appendChild(els.bar);
    box.append(top, prog, el('p', 'ag-note', 'Keep this tab open. First download can take a few minutes depending on bandwidth.'));
    els.modelSlot.appendChild(box); setStatus('Preparing download…');

    var t0 = performance.now();
    Promise.all([import(GENAI + '/genai_bundle.mjs'), modelReader()]).then(function (r) {
      setStatus('Initializing WebGPU runtime…');
      return r[0].FilesetResolver.forGenAiTasks(GENAI + '/wasm').then(function (fileset) {
        return r[0].LlmInference.createFromOptions(fileset, {
          baseOptions: { modelAssetBuffer: r[1] }, maxTokens: MAX_TOKENS, topK: 40, temperature: 0.4, randomSeed: Math.floor(Math.random() * 1e6)
        });
      });
    }).then(function (inst) {
      initializing = false;
      if (mine !== epoch) { try { inst.close(); } catch (e) {} return; }
      llm = inst; onModelReady(t0);
    }).catch(function (err) {
      initializing = false;
      if (mine !== epoch) return;
      loading = false;
      if (els.close) els.close.setAttribute('aria-label', 'Close');
      renderModelIntro();
      var aborted = err && err.name === 'AbortError';
      if (!aborted) els.modelSlot.appendChild(el('p', 'ag-warn', 'Could not start Gemma 4: ' + (err && err.message ? err.message : err) + '. Instant Atlas retrieval still works below.'));
      els.input.disabled = false; els.send.disabled = false;
      setStatus(aborted ? 'Download aborted · instant retrieval active' : 'Model failed to start · instant retrieval active');
    });
  }

  function unloadModel(aborted) {
    epoch++; busy = false; loading = false;
    if (abortCtl) { try { abortCtl.abort(); } catch (e) {} abortCtl = null; }
    if (llm) { try { llm.cancelProcessing(); } catch (e) {} try { llm.close(); } catch (e) {} llm = null; }
    history = [];
    if (panel) {
      els.unloadBtn.hidden = true;
      els.sub.textContent = 'grounded in ICLR 2027 Atlas · optional on-device Gemma 4 E2B';
      els.input.disabled = false; els.send.disabled = false;
      updateModeUI();
      savedModel().then(function (f) { gpuState.cached = !!f; renderModelIntro(); });
      setStatus(aborted ? 'Download aborted · instant retrieval active' : 'Model unloaded · GPU memory freed');
    }
  }

  /* ---------- messages, passages & generation ---------- */
  function bubble(role, text) {
    var b = el('div', 'ag-msg is-' + role, text || null);
    els.body.appendChild(b); els.body.scrollTop = els.body.scrollHeight;
    return b;
  }

  function renderPassageCards(hits, engine, curMode, asked) {
    var b = el('div', 'ag-msg is-model is-passages');
    if (!hits.length) {
      b.textContent = 'No matching papers found in the Atlas for that query. Try technical keywords, a category name, or a submission #number.';
      els.body.appendChild(b); reveal(asked, b); return b;
    }
    var engLabel = engine === 'semantic' ? 'semantic recall' : engine === 'ids' ? 'selected papers' : 'BM25 retrieval';
    b.appendChild(el('p', 'ag-lead', curMode === 'summarize'
      ? 'Retrieved ' + hits.length + ' papers (' + engLabel + ' · load Gemma 4 above to synthesize into Overview / Main approaches / Strongest papers / Open gaps):'
      : 'Top ' + hits.length + ' Atlas passages (' + engLabel + ', instant — no model loaded):'));

    hits.forEach(function (h) {
      var card = el('article', 'ag-hit'), top = el('div', 'ag-hit-top');
      var meta = (h.r != null ? 'mean ' + Number(h.r).toFixed(2) + ' (' + h.rs.join(',') + ')' : 'unrated');
      top.append(mkLink('ag-cite', '#' + h.n, h.url), mkLink('ag-hit-title', h.title, h.url), el('span', 'ag-hit-meta', meta));
      card.appendChild(top);
      var addLine = function (lbl, val) {
        if (!val) return;
        var p = el('p', 'ag-hit-line'); p.append(el('b', null, lbl + ': '), document.createTextNode(val)); card.appendChild(p);
      };
      var fs = h.factsheet;
      if (fs) {
        addLine('Key idea', fs.key_idea || fs.one_liner);
        addLine('Evidence', fs.evidence);
        if (fs.main_concern && !/^no review text$/i.test(fs.main_concern.trim())) addLine('Main concern', fs.main_concern);
      } else {
        var fb = h.tldr || (h.abstract ? window.AtlasGemmaRAG.snippet(h.abstract, 280) : '');
        if (fb) card.appendChild(el('p', 'ag-hit-line', fb));
      }
      b.appendChild(card);
    });
    els.body.appendChild(b); reveal(asked, b);
    return b;
  }

  function retrieveForCurrent(text) {
    if (!window.AtlasGemmaRAG) return Promise.resolve({ hits: [], engine: 'none' });
    if (mode === 'summarize') {
      var rawIds = (els.idsInput ? els.idsInput.value.trim() : '') || pendingIds.join(',');
      if (rawIds) return window.AtlasGemmaRAG.passagesForIds(rawIds, text, { limit: 10 });
      return window.AtlasGemmaRAG.search(text, { k: 8, compact: true });
    }
    return window.AtlasGemmaRAG.search(text, { k: 6 });
  }

  function send(overrideText) {
    if (busy || !panel || els.input.disabled) return;
    var text = (overrideText != null ? String(overrideText) : els.input.value).trim();
    var hasIds = mode === 'summarize' && ((els.idsInput && els.idsInput.value.trim()) || pendingIds.length);
    if (!text && !hasIds) return;
    if (overrideText == null) { els.input.value = ''; els.input.style.height = ''; }

    var curMode = mode, mine = epoch;
    var asked = bubble('user', curMode === 'summarize'
      ? (text ? 'Summarize: ' + text : 'Summarize selected papers (' + (els.idsInput.value.trim() || pendingIds.join(', ')) + ')')
      : text);
    setStatus('Retrieving Atlas passages…');

    retrieveForCurrent(text).then(function (res) {
      if (mine !== epoch || !panel) return;
      var hits = res.hits || [];
      if (!llm) {
        renderPassageCards(hits, res.engine, curMode, asked);
        setStatus('Showing ' + hits.length + ' passages (' + res.engine + ') · load Gemma 4 above for AI synthesis');
        return;
      }
      if (!hits.length) {
        reveal(asked, bubble('model', 'No matching passages were found in the ICLR 2027 Atlas for that query, so I cannot answer from Atlas data.'));
        setStatus('Ready on your GPU · nothing leaves your device'); return;
      }
      runGeneration(text, hits, curMode, mine, asked);
    }).catch(function (err) {
      if (mine !== epoch || !panel) return;
      reveal(asked, bubble('model', 'Retrieval error: ' + (err && err.message ? err.message : err)));
      setStatus('Retrieval error');
    });
  }

  function runGeneration(text, hits, curMode, mine, asked) {
    var out = bubble('model', '');
    out.classList.add('is-typing'); out.setAttribute('aria-busy', 'true');
    busy = true; els.send.textContent = 'Stop'; els.send.type = 'button';
    var stopped = false, stopHandler = function () { stopped = true; try { llm.cancelProcessing(); } catch (e) {} };
    els.send.addEventListener('click', stopHandler);

    var raw = '', t0 = performance.now(), firstAt = 0, built = buildPrompt(text, hits, curMode);
    setStatus('Generating on your GPU…');

    llm.generateResponse(built.prompt, function (partial, done) {
      if (mine !== epoch) return;
      if (!firstAt && partial) firstAt = performance.now();
      raw = partial.indexOf(raw) === 0 && raw ? partial : raw + partial;
      out.textContent = clean(raw); els.body.scrollTop = els.body.scrollHeight;
      if (done) out.classList.remove('is-typing');
    }).then(function (full) {
      if (mine !== epoch) return;
      var reply = clean(full || raw).trim();
      out.classList.remove('is-typing'); out.removeAttribute('aria-busy');
      if (reply) renderGrounded(out, reply, built.used); else out.textContent = '(no reply)';
      if (built.used.length) {
        var row = el('div', 'ag-sources');
        row.appendChild(el('span', 'ag-src-lbl', 'Passages used: '));
        built.used.forEach(function (h) { row.appendChild(mkLink('ag-cite', '#' + h.n, h.url, h.title)); });
        out.appendChild(row);
      }
      if (!stopped && curMode === 'ask') {
        history.push({ role: 'user', text: text }, { role: 'model', text: reply });
        if (history.length > 6) history = history.slice(-6);
      }
      reveal(asked, out);
      var secs = (performance.now() - (firstAt || t0)) / 1000;
      var toks = typeof llm.sizeInTokens === 'function' ? (llm.sizeInTokens(reply) || 0) : 0;
      setStatus(toks && secs > 0 ? (toks / secs).toFixed(1) + ' tokens/s on your GPU · verify citations via OpenReview'
        : 'Ready on your GPU · verify citations via OpenReview');
    }).catch(function (err) {
      if (mine !== epoch) return;
      out.classList.remove('is-typing'); out.removeAttribute('aria-busy');
      if (!out.textContent) out.textContent = '(stopped)';
      setStatus('Generation error: ' + (err && err.message ? err.message : err));
    }).then(function () {
      if (mine !== epoch) return;
      busy = false; els.send.removeEventListener('click', stopHandler);
      els.send.type = 'submit'; updateModeUI(); els.input.focus();
    });
  }

  /* ---------- public API & floating button ---------- */
  function setFabExpanded(open) {
    var fab = document.getElementById('atlas-gemma-fab');
    if (fab) fab.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closePanel(refocus) {
    if (!panel || isInline) return;
    panel.hidden = true; setFabExpanded(false);
    var fab = document.getElementById('atlas-gemma-fab');
    if (refocus && fab) fab.focus();
  }
  function shutdown() {
    unloadModel(true);
    if (panel && !isInline) { panel.remove(); panel = null; els = {}; }
    setFabExpanded(false);
    var fab = document.getElementById('atlas-gemma-fab');
    if (fab) fab.focus();
  }
  function open(prefill) {
    if (!panel) buildPanel(document.getElementById('atlas-gemma-host'));
    else if (!isInline) panel.hidden = false;
    setFabExpanded(true);
    if (typeof prefill === 'string' && prefill.trim()) {
      mode = 'ask'; updateModeUI(); els.input.value = prefill.trim();
    } else if (prefill && typeof prefill === 'object') {
      if (prefill.mode === 'summarize') mode = 'summarize';
      if (prefill.ids) pendingIds = Array.isArray(prefill.ids) ? prefill.ids.slice() : String(prefill.ids).split(/[\s,]+/).filter(Boolean);
      updateModeUI();
      if (prefill.query) els.input.value = prefill.query;
      if (prefill.autoSend) send(prefill.query || '');
    }
    if (els.input && !els.input.disabled) els.input.focus();
  }
  function toggle() { if (panel && !panel.hidden && !isInline) closePanel(true); else open(); }
  function summarize(ids, query) {
    pendingIds = Array.isArray(ids) ? ids.slice() : String(ids || '').split(/[\s,;]+/).filter(Boolean);
    var q = String(query || '').trim();
    mode = 'summarize'; open();
    if (els.idsInput) els.idsInput.value = pendingIds.join(', ');
    if (q) els.input.value = q;
    updateModeUI(); send(q);
  }
  function mountInline(container) { if (!container) return; if (panel) shutdown(); buildPanel(container); }

  function ensureFab() {
    if (document.getElementById('atlas-gemma-host') || document.body.dataset.page === 'ask') return;
    if (document.getElementById('atlas-gemma-fab')) return;
    var fab = mkBtn('ag-fab', 'Ask Gemma', toggle);
    fab.id = 'atlas-gemma-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'atlas-gemma-panel');
    document.body.appendChild(fab);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureFab);
  else ensureFab();

  window.AtlasGemma = {
    open: open, toggle: toggle,
    close: function () { if (llm || loading || initializing) shutdown(); else closePanel(false); },
    summarize: summarize, mountInline: mountInline
  };
})();
