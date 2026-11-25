# Fact-sheet quality — blind cross-family audit

Each fact sheet was audited by a model from the *other* family (Gemini-family output → Claude auditors; Claude/Codex/Kimi output → Gemini 4 Hydrogen), without knowing the author. Sample: 2 fact sheets per validated batch.

| Author engine | Audited | Mean overall (1–5) | Faithful | Key idea = mechanism | Gains correct | Reviewer fields grounded |
|---|---:|---:|---:|---:|---:|---:|
| Codex CLI | 56 | 5.00 | 100% | 100% | 100% | 100% |
| Claude Sonnet (workflow) | 150 | 4.95 | 97% | 100% | 99% | 99% |
| Kimi CLI | 20 | 4.95 | 100% | 100% | 100% | 100% |
| Gemini 4 Hydrogen | 60 | 4.75 | 92% | 100% | 98% | 100% |
| Gemini 4 Neon | 28 | 4.71 | 93% | 100% | 89% | 100% |
| Gemini 4 Carbon | 6 | 4.67 | 83% | 100% | 100% | 100% |
| Gemini 4 Argon | 18 | 4.61 | 78% | 94% | 94% | 100% |

**Overall:** 338 audited · mean 4.88 · faithful 95%.

## Unfaithful items (lowest overall first)

| Overall | Paper | Author | Auditor | Unsupported phrase(s) |
|---:|---|---|---|---|
| 3 | #20368 | Claude Sonnet (workflow) | hydrogen | Reviewers (3/3/3) |
| 3 | #20995 | Claude Sonnet (workflow) | hydrogen | Reviewers (3/4/2) |
| 3 | #33171 | Gemini 4 Hydrogen | claude | SPO+ uniquely identifies the conditional mean report iff nonzero displacements cross shifted optimal faces with positive probability (key_id |
| 3 | #45330 | Gemini 4 Argon | claude | pairwise client gradient-disagreement matrix; identifiable from pairwise client disagreement; Bayesian minimax lower and upper bound proofs |
| 4 | #4754 | Gemini 4 Hydrogen | claude | against retrieval and graph-RAG baselines |
| 4 | #7921 | Claude Sonnet (workflow) | hydrogen | binary tree |
| 4 | #8490 | Gemini 4 Neon | claude | Constructs and evaluates on the 7.2-hour TheaterAct dataset (quantitative results truncated in abstract) |
| 4 | #11511 | Gemini 4 Hydrogen | claude | introduces sequential communication latency |
| 4 | #17244 | Claude Sonnet (workflow) | hydrogen | tags: contrastive learning; tags: unsupervised |
| 4 | #27079 | Gemini 4 Argon | claude | co-evolve multiple workflow roles via reinforcement learning |
| 4 | #28558 | Gemini 4 Argon | claude | revisit abstained queries with additional frames; multi-frame conditional recovery |
| 4 | #43961 | Gemini 4 Argon | claude | covering long-term memory utilization, dynamic and static conflict handling, and multi-hop retrieval |
| 4 | #46288 | Gemini 4 Hydrogen | claude | synthetic correlated Erdos-Renyi graphs |
| 4 | #47723 | Gemini 4 Hydrogen | claude | LayerReward, a five-dimensional evaluator combining rule-based editability/alignment probes and VLM scores |
| 4 | #51738 | Gemini 4 Neon | claude | global linear clip transforms |
| 4 | #52894 | Gemini 4 Carbon | claude | compute verified two-sided full-vocabulary bounds |

Caveat: auditors saw abstracts truncated at ~1,400 chars and reviews at ~650 chars, so a few 'unsupported' flags may be details in the cut-off text.
