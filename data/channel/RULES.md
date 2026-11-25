# Living Rulebook (self-evolving)

Rules every agent follows. The rulebook evolves: agents log lessons, the orchestrator promotes recurring lessons into rules each loop iteration.

## Evolution protocol

1. **Log** — Any agent that hits a mistake, ambiguity, or a better pattern appends one line to `## Lessons inbox`:
   `- [YYYY-MM-DD agent] <what happened> → <proposed rule>`
2. **Promote** — Each `/loop` iteration, the orchestrator reviews the inbox. A lesson seen ≥2 times, or one that prevented a real error, becomes a numbered rule below (with a version bump). Rejected lessons move to `## Rejected` with a one-line reason.
3. **Taxonomy evolution** — `scripts/taxonomy_audit.py` lists papers with no fine category or low match confidence. Agents propose new subcategories in `taxonomy/proposals.md`; the orchestrator merges accepted ones into `taxonomy/taxonomy.yaml` and re-runs classification.
4. **Fact-sheet QA** — A sampled audit (5% of each batch) checks fact sheets against abstracts. Failure patterns become rules in `## Fact-sheet rules`.
5. Never delete a rule silently: retire it with `~~strike~~` and a reason.

## Data rules (v1)

- D1. The source of truth is the public ICLR 2027 OpenReview venue. Fetch through the user's logged-in Chrome session. Never spoof clients or bypass the bot challenge.
- D2. Never attempt to de-anonymize authors or reviewers. Store reviewer handles only as `Reviewer_XXXX` anonymous IDs.
- D3. A paper's score is the mean `rating` over submitted reviews. Always report `n_reviews` and `std` beside it. Rank ties by mean confidence-weighted rating.
- D4. Withdrawn and desk-rejected papers are kept but never ranked.
- D5. Do not commit PDFs, raw dumps, or review text to GitHub. Commit derived metadata, fact sheets, and the site only.
- D6. **No tier / rank-band labels anywhere** (oral-range, spotlight-range, poster-range, borderline, below-bar, tier guess). Acceptance decisions are not ours (user rule, 2026-11-24). Show review scores only: mean (1–4), individual ratings, std, confidence-weighted mean, #reviews; ordering by score is fine.

## Taxonomy rules (v1)

- T1. Every paper gets exactly one `major` category and 1–3 `fine` tags. Multi-label is allowed only at the fine level.
- T2. Use ICLR `primary_area` as a prior, not a verdict: method content in the title and abstract wins.
- T3. A new fine category needs ≥25 papers and a one-line definition that separates it from its siblings.
- T4. Name categories by the research object (e.g. "Diffusion Sampling & Distillation"), not by the buzzword.

## Fact-sheet rules (v1)

- F1. Fact sheet fields: `problem`, `method`, `key_idea`, `evidence`, `claimed_gains`, `reviewer_consensus`, `main_concern`, `tier_guess`.
- F2. Every claim must be traceable to the abstract, TL;DR, or the reviews. No invented numbers. If a number is not in the source, write "not stated".
- F3. `key_idea` is one sentence, ≤30 words, and names the mechanism, not the benefit.
- F4. `reviewer_consensus` summarizes what reviewers agree on; `main_concern` is the single most-cited weakness.
- ~~F5. `tier_guess` from score percentile~~ — retired 2026-11-24 by D6: `tier_guess` is never displayed or published.

## Agent rules (v1)

- A1. Claim before work: write your handle on a line in `tasks.md`.
- A2. Write outputs to files; post only path + counts in `general.md`.
- A3. Verify before claiming done: row counts, schema check, or a spot-check of 3 items.
- A4. Before exposing anything through a tunnel: serve with `scripts/serve_site.py` (exclusive bind), confirm the port has exactly one listener, and `curl` the local URL to confirm it is OUR content. Serve `site/` only.

## Lessons inbox

- [2026-11-24 codex-untier-ui] Autosizing 2,793 list-note textareas one at a time caused smoke-test timeouts; batching measurements fixed it → batch DOM measurements before style writes, and skip empty notes on initial render.

- [2026-11-24 claude] Chrome extension output filter blocks JS results that contain URL query strings → return only field names/counts from page JS; move bulk data via browser downloads.
- [2026-11-24 claude] `api2.openreview.net/notes` returns `ChallengeRequiredError` for curl; `/notes/search` and `/groups` do not → bulk data only through the browser session (rule D1).

- [2026-11-24 claude] **Incident:** `python -m http.server 8765` silently shared port 8765 with another project's server (Windows SO_REUSEADDR); the public tunnel exposed that project's "UHR Bias Sweep" page for ~10 min. Tunnel killed, re-opened on 8917 → **promoted to rule A4.**
- [2026-11-24 claude] Chrome allows one automatic download per page; later ones are silently blocked → stream data into ONE gzip file per job (CompressionStream), and ask the user to allow automatic downloads for bulk PDFs.
- [2026-11-24 claude] A long in-page job dies if anyone navigates its tab → run jobs in a dedicated tab and tell the user not to touch it.

## Rejected

(none yet)

### Lessons inbox — 2026-11-24 15:00 (from sub:domains-A audit)
- [2026-11-24 sub:domains-A] Tier labels are assigned by rank position on (mean, confidence-weighted mean), so equal means can straddle a tier boundary (3.33 appears as oral- and spotlight-range). → Proposed rule D6: always describe tiers as "top 1.5% / 5% / 30% / 40% by (mean, conf-weighted)", never as pure mean cutoffs.
- [2026-11-24 sub:domains-A] Taxonomy false positives: `probabilistic.uq` 'calibration'/'conformal' pull unrelated papers (e.g. #15804 conformal maps in art); case-sensitive 'GP' matches acronyms like "RGSM-GP" (#61018); 'representation learning' is too generic for `representation.ssl`. → Fix in taxonomy v2 (T12) and add kNN-vote refinement for low-confidence papers.

## Git rules (v1)

- G0. Public exposure only when the user says so. Status (user, 2026-11-24 18:27): static-site repo the public site repo is PUBLIC with GitHub Pages ON (the public site); the research repo the private research repo stays PRIVATE; no tunnels. Every public release goes through scripts/publish_pages.py --public (leak scan, D6 scrub).
- G1. Always push to the GitHub account **the site account** (user rule, 2026-11-24). If there is any doubt about the account, remote or visibility, ASK the user before pushing — never fall back to another account. Repo: `the private research repo` (private). Never push to another account. This repo uses a local credential helper that pulls the the site account token from `gh` at push time.
- [2026-11-24 claude] Kimi CLI hit a 5-hour usage cap mid-run (HTTP 429) and the runner kept marking batches failed → runners should detect quota errors in the CLI log and pause instead of failing the queue; spread work across engines so one quota cannot stall a range.
- [2026-11-24 claude] Killing processes by a command-line regex also killed the progress Monitor (its command line contained the same words) → filter kills by process name + exact script name, never by loose keywords.
- [2026-11-24 claude] Blind QA design flaw: pairing author family with a single auditor family confounds author quality with auditor strictness → next QA round must include a shared calibration set audited by BOTH families (and ideally 2 auditors per item).

## Routing rules (v1)

- R1. Bulk/parallel work goes to **Codex first** (largest share), then **Neon** (Gemini 4 Neon via agy). **Do not use Carbon** (user rule, 2026-11-24). Argon/Hydrogen only as overflow.
- R2. Claude subagents and workflow agents run on **Sonnet**.
- R3. Kimi CLI is overflow only (5-hour usage cap).
- [2026-11-24 claude] Pre-commit "forbidden files" check only printed matches (qwen_*.npy, 2×84 MB) and the commit proceeded → the check must ABORT on any match; .gitignore now ignores data/derived/*.npy. The blobs remain in history of commit b859852 (private repo) unless the user approves a history rewrite.

## Privacy rules (v1)

