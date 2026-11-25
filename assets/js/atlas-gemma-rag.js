/* Retrieval (RAG) over the ICLR 2027 Atlas for Ask Gemma.
   - BM25 over paper title (2x weight), keywords, TL;DR and category names from data/papers.json (42,789 papers).
   - Defaults to active papers; uses window.AtlasSemantic?.search(q, k) for recall when available, falling back to BM25.
   - For top hits (or explicit paper IDs), fetches fact sheets (data/factsheets/NN.json) and abstracts (data/abstracts/NN.json)
     and builds compact grounded passages for Gemma 4 E2B and for instant no-model display.
   Exposes window.AtlasGemmaRAG. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var rawDir = params.get('data');
  var DATA_DIR = (rawDir && /^[A-Za-z0-9_\-./]+$/.test(rawDir) && rawDir.indexOf('..') < 0 && rawDir[0] !== '/')
    ? rawDir.replace(/\/+$/, '') : 'data';

  var STOP = Object.create(null);
  ('a an the of to in on at for by with and or but is are was were be been being am do does did has have had ' +
   'it its this that these those as into from before after than then so such not no can could should would will ' +
   'may might must just also very much many more most some any about paper papers work works approach approaches ' +
   'method methods model models show shows propose proposes proposed present presents study studies paper\'s ' +
   'what which who whom whose when where why how tell explain describe give list find compare summarize summary ' +
   'please hi hello hey thanks thank using use used via based towards toward over under between through across ' +
   'we our they them their i me my you your there here new novel').split(' ').forEach(function (w) { STOP[w] = 1; });

  var state = {
    papers: null,
    meta: null,
    byId: new Map(),
    byNum: new Map(),
    majors: new Map(),
    fines: new Map(),
    postings: Object.create(null),
    df: Object.create(null),
    docLen: null,
    avgLen: 1,
    activeCount: 0,
    indexed: false,
    loading: null,
    shards: Object.create(null)
  };

  function fold(s) {
    s = String(s || '').toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
  }

  function stem(w) {
    if (w.length <= 3) return w;
    w = w.replace(/^([a-z]{3,})our(s|ed|ing)?$/, '$1or$2');
    if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 4 && /ied$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 4 && /(ses|xes|zes|ches|shes)$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (w.length > 6 && /ation$/.test(w)) w = w.slice(0, -5);
    else if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 5 && /ed$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 5 && /er$/.test(w)) w = w.slice(0, -2);
    if (w.length > 4 && /e$/.test(w) && !/(ee|oe|ye)$/.test(w)) w = w.slice(0, -1);
    return w;
  }

  function tokenize(text) {
    var out = [], matches = fold(text).match(/[a-z0-9]+(?:-[a-z0-9]+)*/g);
    if (!matches) return out;
    for (var i = 0; i < matches.length; i++) {
      var tok = matches[i];
      if (tok.indexOf('-') >= 0) {
        var parts = tok.split('-');
        if (tok.length >= 4) out.push(tok);
        for (var j = 0; j < parts.length; j++) {
          var p = parts[j];
          if (p.length >= 2 && !STOP[p]) out.push(stem(p));
        }
      } else if (tok.length >= 2 && !STOP[tok]) {
        out.push(stem(tok));
      }
    }
    return out;
  }

  function shardOf(n) {
    return String(Math.floor(n / 1000)).padStart(2, '0');
  }

  function fetchJson(path, optional) {
    return fetch(DATA_DIR + '/' + path).then(function (r) {
      if (!r.ok) {
        if (optional) return null;
        throw new Error('HTTP ' + r.status + ' for ' + DATA_DIR + '/' + path);
      }
      return r.json();
    }).catch(function (err) {
      if (optional) return null;
      throw err;
    });
  }

  function loadShard(kind, n) {
    if (n == null) return Promise.resolve({});
    var sh = shardOf(n), key = kind + ':' + sh;
    if (!state.shards[key]) {
      state.shards[key] = fetchJson(kind + '/' + sh + '.json', true).then(function (d) { return d || {}; });
    }
    return state.shards[key];
  }

  function buildIndex(meta, tax) {
    var majors = (tax && tax.majors) || [];
    for (var m = 0; m < majors.length; m++) {
      var mj = majors[m];
      state.majors.set(mj.id, mj.name || mj.id);
      var fl = mj.fine || [];
      for (var f = 0; f < fl.length; f++) state.fines.set(fl[f].id, fl[f].name || fl[f].id);
    }

    var papers = Array.isArray(meta && meta.papers) ? meta.papers : [];
    var N = papers.length;
    var postings = Object.create(null);
    var df = Object.create(null);
    var docLen = new Uint16Array(N);
    var totalLen = 0, activeCount = 0;

    for (var i = 0; i < N; i++) {
      var p = papers[i];
      state.byId.set(p.id, p);
      if (p.n != null) state.byNum.set(p.n, p);
      if (p.s === 'active') activeCount++;

      var tf = Object.create(null);
      var len = 0;
      var addToks = function (arr, w) {
        for (var k = 0; k < arr.length; k++) {
          var t = arr[k];
          tf[t] = (tf[t] || 0) + w;
          len += w;
        }
      };

      addToks(tokenize(p.t), 2); // title carries double weight
      if (Array.isArray(p.kw) && p.kw.length) addToks(tokenize(p.kw.join(' ')), 1);
      if (p.tl) addToks(tokenize(p.tl), 1);

      var catNames = [];
      if (p.maj && state.majors.has(p.maj)) catNames.push(state.majors.get(p.maj));
      if (Array.isArray(p.fine)) {
        for (var c = 0; c < p.fine.length; c++) {
          var fn = state.fines.get(p.fine[c]);
          if (fn) catNames.push(fn);
        }
      }
      if (catNames.length) addToks(tokenize(catNames.join(' ')), 1);

      docLen[i] = len || 1;
      totalLen += docLen[i];

      for (var term in tf) {
        var list = postings[term];
        if (!list) { list = []; postings[term] = list; }
        list.push(i, tf[term]);
        df[term] = (df[term] || 0) + 1;
      }
    }

    state.meta = meta;
    state.papers = papers;
    state.postings = postings;
    state.df = df;
    state.docLen = docLen;
    state.avgLen = totalLen / Math.max(1, N);
    state.activeCount = activeCount;
    state.indexed = true;
    return state;
  }

  function ready() {
    if (state.indexed) return Promise.resolve(state);
    if (!state.loading) {
      state.loading = Promise.all([
        fetchJson('papers.json', false),
        fetchJson('taxonomy.json', true)
      ]).then(function (res) {
        return buildIndex(res[0], res[1]);
      }).catch(function (err) {
        state.loading = null;
        throw err;
      });
    }
    return state.loading;
  }

  function extractExplicitNumbers(query) {
    var out = [], seen = Object.create(null), m;
    var re = /#(\d{1,6})\b/g;
    while ((m = re.exec(query))) {
      var n = parseInt(m[1], 10);
      if (!seen[n] && state.byNum.has(n)) {
        seen[n] = 1;
        out.push(state.byNum.get(n));
      }
    }
    return out;
  }

  function bm25Rank(query, opts) {
    var k = opts.k || 6;
    var status = opts.status || 'active';
    var onlyActive = status !== 'all';
    var qTerms = tokenize(query);
    if (!qTerms.length) return [];

    // Deduplicate query terms: keep hyphenated parts at 0.5 each when compound is present so hyphenated words do not dominate
    var qMap = Object.create(null), uniq = [];
    var rawWords = fold(query).match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || [];
    for (var rw = 0; rw < rawWords.length; rw++) {
      var tok = rawWords[rw];
      if (tok.indexOf('-') >= 0) {
        var parts = tok.split('-').filter(function (p) { return p.length >= 2 && !STOP[p]; });
        if (tok.length >= 4 && !qMap[tok]) { uniq.push(tok); qMap[tok] = 0.7; }
        for (var j = 0; j < parts.length; j++) {
          var st = stem(parts[j]);
          if (!qMap[st]) { uniq.push(st); qMap[st] = 0.55; }
        }
      } else if (tok.length >= 2 && !STOP[tok]) {
        var st2 = stem(tok);
        if (!qMap[st2]) { uniq.push(st2); qMap[st2] = 1.0; }
      }
    }
    if (!uniq.length) return [];

    var N = state.papers.length;
    var avgLen = state.avgLen;
    var docLen = state.docLen;
    var k1 = 1.4, b = 0.65;
    var scores = new Float32Array(N);
    var hitsCount = new Uint8Array(N);
    var touched = [];

    for (var u = 0; u < uniq.length; u++) {
      var term = uniq[u];
      var list = state.postings[term];
      if (!list) continue;
      var df = state.df[term] || 0;
      var idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      var qw = qMap[term];
      for (var j = 0; j < list.length; j += 2) {
        var idx = list[j];
        if (onlyActive && state.papers[idx].s !== 'active') continue;
        var f = list[j + 1];
        var part = qw * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * docLen[idx] / avgLen));
        if (scores[idx] === 0) touched.push(idx);
        scores[idx] += part;
        if (hitsCount[idx] < 255) hitsCount[idx]++;
      }
    }

    if (!touched.length) return [];

    // Boost multi-term coverage and title phrase matches on the top pool
    var qLow = fold(query).replace(/\s+/g, ' ').trim();
    var minTerms = uniq.length;
    for (var t = 0; t < touched.length; t++) {
      var di = touched[t];
      if (minTerms > 1 && hitsCount[di] > 1) {
        scores[di] *= 1 + 0.14 * (hitsCount[di] - 1);
      }
    }

    touched.sort(function (a, b2) { return scores[b2] - scores[a]; });
    var pool = touched.slice(0, Math.max(k * 8, 60));

    // Re-score top pool slightly for exact substring / title match
    var scored = pool.map(function (idx) {
      var p = state.papers[idx];
      var sc = scores[idx];
      var tLow = fold(p.t);
      if (qLow.length >= 6 && tLow.indexOf(qLow) >= 0) sc *= 1.35;
      return { paper: p, score: sc };
    });
    scored.sort(function (a, b2) { return b2.score - a.score; });

    var topScore = scored[0].score;
    var out = [];
    for (var r = 0; r < scored.length && out.length < k; r++) {
      if (r > 0 && scored[r].score < topScore * 0.22) break;
      out.push(scored[r]);
    }
    return out;
  }

  function trySemantic(query, k, status) {
    var sem = window.AtlasSemantic;
    if (!sem || typeof sem.search !== 'function') return Promise.resolve(null);
    return Promise.resolve().then(function () {
      return sem.search(query, k);
    }).then(function (raw) {
      var list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.results) ? raw.results : null);
      if (!list || !list.length) return null;
      var onlyActive = (status || 'active') !== 'all';
      var out = [], seen = Object.create(null);
      for (var i = 0; i < list.length && out.length < k; i++) {
        var item = list[i];
        var id = typeof item === 'string' ? item : (item && (item.id || item.paper_id));
        var p = id ? state.byId.get(id) : (item && item.n != null ? state.byNum.get(item.n) : null);
        if (!p || seen[p.id]) continue;
        if (onlyActive && p.s !== 'active') continue;
        seen[p.id] = 1;
        out.push({ paper: p, score: typeof item === 'object' && item && typeof item.s === 'number' ? item.s : (1 - i * 0.01) });
      }
      return out.length ? out : null;
    }).catch(function () { return null; });
  }

  function head(text, max) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    var cut = text.slice(0, max);
    var end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    return end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
  }

  function snippet(text, max, qTerms) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    if (!qTerms || !qTerms.length) return head(text, max);
    var want = Object.create(null);
    for (var i = 0; i < qTerms.length; i++) want[qTerms[i]] = 1;
    var sentences = text.match(/[^.!?;]+[.!?;]*\s*/g) || [text];
    var hits = sentences.map(function (s) {
      var st = tokenize(s), c = 0;
      for (var j = 0; j < st.length; j++) if (want[st[j]]) c++;
      return c;
    });
    var best = 0, bestScore = 0;
    for (var a = 0; a < sentences.length; a++) {
      var len = 0, sc = 0;
      for (var b = a; b < sentences.length && len + sentences[b].length <= max; b++) {
        len += sentences[b].length;
        sc += hits[b];
      }
      if (sc > bestScore) { bestScore = sc; best = a; }
    }
    if (!best) return head(text, max);
    var out = '', idx = best;
    while (idx < sentences.length && (out + sentences[idx]).length <= max) out += sentences[idx++];
    return '… ' + (out || head(sentences[best], max)).trim();
  }

  function formatPassage(p, fs, abs, qTerms, compact) {
    var ratings = Array.isArray(p.rs) && p.rs.length ? p.rs.join(',') : 'none';
    var meanStr = p.r != null ? 'mean ' + Number(p.r).toFixed(2) + ' (' + ratings + ')' : 'unrated';
    var statusStr = p.s && p.s !== 'active' ? ' (' + p.s.replace('_', '-') + ')' : '';
    var header = '#' + p.n + ' ' + p.t + ' | ' + meanStr + statusStr;  // rule D6: scores only, no tier labels
    var parts = [header];
    var maxIdea = compact ? 180 : 240;
    var maxEv = compact ? 150 : 210;
    var maxCon = compact ? 140 : 190;

    if (fs) {
      var idea = fs.key_idea || fs.one_liner || p.tl;
      if (idea) parts.push('key idea: ' + head(idea, maxIdea));
      var ev = fs.evidence || fs.claimed_gains;
      if (ev) parts.push('evidence: ' + head(ev, maxEv));
      var concern = fs.main_concern;
      if (concern && !/^no review text$/i.test(concern.trim())) {
        parts.push('main concern: ' + head(concern, maxCon));
      } else if (fs.claimed_gains && fs.evidence) {
        parts.push('gains: ' + head(fs.claimed_gains, maxCon));
      }
    } else {
      if (p.tl) parts.push('key idea: ' + head(p.tl, maxIdea));
      if (abs) parts.push('abstract: ' + snippet(abs, compact ? 220 : 320, qTerms));
    }
    return parts.join(' | ');
  }

  function hydrate(entries, qTerms, compact) {
    return Promise.all(entries.map(function (entry) {
      var p = entry.paper;
      return Promise.all([
        loadShard('factsheets', p.n),
        loadShard('abstracts', p.n)
      ]).then(function (sh) {
        var fs = sh[0][p.id] || null;
        var abs = sh[1][p.id] || '';
        return {
          id: p.id,
          n: p.n,
          title: p.t,
          r: p.r,
          rs: p.rs || [],
          rk: p.rk,
          status: p.s,
          maj: p.maj,
          majorName: state.majors.get(p.maj) || p.maj || '',
          fineNames: (p.fine || []).map(function (f) { return state.fines.get(f) || f; }),
          tldr: p.tl || '',
          factsheet: fs,
          abstract: abs,
          score: entry.score || 0,
          url: 'https://openreview.net/forum?id=' + encodeURIComponent(p.id),
          passage: formatPassage(p, fs, abs, qTerms, compact)
        };
      });
    }));
  }

  function search(query, opts) {
    opts = opts || {};
    var k = opts.k || 6;
    var status = opts.status || 'active';
    var q = String(query || '').trim();
    var qTerms = tokenize(q);

    return ready().then(function () {
      if (!q) return { hits: [], engine: 'bm25', query: q, terms: [] };
      var explicit = extractExplicitNumbers(q);

      return trySemantic(q, k, status).then(function (semHits) {
        var engine = semHits ? 'semantic' : 'bm25';
        var ranked = semHits || bm25Rank(q, { k: k, status: status });

        // Merge explicit #number references at the front without duplicates
        var combined = [], seen = Object.create(null);
        for (var e = 0; e < explicit.length && combined.length < k; e++) {
          seen[explicit[e].id] = 1;
          combined.push({ paper: explicit[e], score: 999 });
        }
        for (var i = 0; i < ranked.length && combined.length < k; i++) {
          if (seen[ranked[i].paper.id]) continue;
          seen[ranked[i].paper.id] = 1;
          combined.push(ranked[i]);
        }

        return hydrate(combined, qTerms, !!opts.compact).then(function (hits) {
          return { hits: hits, engine: engine, query: q, terms: qTerms };
        });
      });
    });
  }

  function passagesForIds(ids, query, opts) {
    opts = opts || {};
    var limit = opts.limit || 12;
    var qTerms = tokenize(query || '');
    return ready().then(function () {
      var list = Array.isArray(ids) ? ids : String(ids || '').split(/[\s,;]+/).filter(Boolean);
      var entries = [], seen = Object.create(null);
      for (var i = 0; i < list.length && entries.length < limit; i++) {
        var raw = String(list[i]).trim();
        var p = state.byId.get(raw);
        if (!p) {
          var num = parseInt(raw.replace(/^#/, ''), 10);
          if (Number.isFinite(num)) p = state.byNum.get(num);
        }
        if (p && !seen[p.id]) {
          seen[p.id] = 1;
          entries.push({ paper: p, score: 1 });
        }
      }
      return hydrate(entries, qTerms, true).then(function (hits) {
        return { hits: hits, engine: 'ids', query: query || '', terms: qTerms };
      });
    });
  }

  window.AtlasGemmaRAG = {
    ready: ready,
    loaded: function () { return state.indexed; },
    meta: function () { return state.meta; },
    count: function () { return state.papers ? state.papers.length : 0; },
    activeCount: function () { return state.activeCount; },
    byId: function (id) { return state.byId.get(id) || null; },
    byNumber: function (n) { return state.byNum.get(Number(n)) || null; },
    search: search,
    passagesForIds: passagesForIds,
    snippet: snippet,
    forumUrl: function (id) { return 'https://openreview.net/forum?id=' + encodeURIComponent(id); }
  };
})();
