# Task Board

Claim: put your handle in `owner`. Done: change `[ ]` to `[x]` and add the output path. `[~]` = in progress.

| # | Status | Task | Owner | Output |
|---|---|---|---|---|
| T01 | [x] | Bulk fetch submissions + scores (Chrome) | claude | `data/raw/iclr2027_meta.json` |
| T02 | [x] | GPU env: torch cu128 + sentence-transformers + umap | claude | `.venv/` |
| T03 | [x] | Normalize + score + rank | claude | `data/derived/papers.jsonl`, `ranking.csv` |
| T04 | [x] | Taxonomy v1 + rule classifier (24 majors / 126 fine) | claude | `taxonomy/taxonomy.yaml`, `data/derived/categories.jsonl` |
| T05 | [x] | GPU embeddings + UMAP map + kNN + 160 clusters | claude + gpu | `data/derived/map.jsonl`, `neighbors.jsonl`, `clusters.json` |
| T06 | [x] | Site: Explorer, categories, stats, channel, shortlist | sub:site-builder | `site/` (index, categories, stats, channel, shortlist; `site/README.md`; `scripts/mock_site_data.py`; QA `scripts/site_smoke.py`) |
| T06b | [~] | Site: map + connected graph | sub:viz-builder | `site/map.html`, `site/graph.html` |
| T06c | [x] | Site: live agents page | sub:agents-page | `site/agents.html` |
| T07 | [~] | Review text (resumable gzip job) | claude (chrome) | `data/raw/iclr2027_reviewtext.jsonl.gz` |
| T08 | [x] | Fact sheets ranks 1–7,500 (150 batches) | sub:factsheet-* (workflow) | `factsheets/out/` |
| T09 | [x] | Fact sheets ranks 7,501–11,250 (75 batches) | codex | `factsheets/out/` |
| T10 | [x] | Fact sheets ranks 11,251–15,000 (75 batches) | kimi | `factsheets/out/` |
| T11 | [x] | Domain briefs (24 majors) | codex · kimi · sub:domains-A · sub:domains-B | `reports/domains/` |
| T12 | [ ] | Taxonomy v2 from proposals + embedding kNN refinement | claude | `taxonomy/taxonomy.yaml` |
| T13 | [ ] | PDF download, top 15,000, proper names, by category (needs Chrome automatic-downloads allowed) | claude (chrome) | `pdfs/` |
| T14 | [ ] | Website QA (Playwright smoke + link checks) | codex | `temp/site_qa.md` |
| T15 | [x] | GitHub: private repo + PUBLIC static edition (Pages) | claude | the private research repo (private), the public site repo (public) |
| T16 | [~] | Fact sheets batches 225→190 (Gemini 4 Carbon via agy) | carbon | `factsheets/out/` |
| T17 | [~] | Fact sheets batches 300→264 (Gemini 4 Neon via agy) | gemini | `factsheets/out/` |
| T18 | [~] | Fact sheets batches 189→151 (Gemini 4 Argon via agy) | argon | `factsheets/out/` |
| T19 | [~] | Semantic search UI (Explorer + More like this) + custom named lists | sub:site-builder | `site/lists.html`, `atlas.js` |
| T20 | [~] | Semantic search on Map + Graph (topic subgraph) | sub:viz-builder | `site/map.html`, `site/graph.html` |
| T21b | [ ] | Embedding shard loader: background + progressive + mirrors (Pages → jsDelivr → extra repo) + Cache API | claude (integration) | `site/assets/js/core/gemma-search.js` |
| T22-ui | [x] | Remove acceptance bands from site UI; show review scores only | codex-untier-ui | `temp/untier_ui_report.md` |
