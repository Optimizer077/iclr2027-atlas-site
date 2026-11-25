# Pipeline status — 2026-11-26 03:46

| Stage | Count | Note |
|---|---|---|
| Records fetched | 42,789 | active / withdrawn / desk-rejected = 33,627 / 6,960 / 2,202 |
| Reviews (scores) | 104,202 | 4-point rating scale |
| Review text | ready | data/raw/iclr2027_reviewtext.jsonl.gz |
| Ranked papers | 33,627 | tiers: oral-range 595, below-bar 20,111, poster-range 9,081, borderline 2,745, spotlight-range 1,095 |
| Categorized | 42,789 | taxonomy v1 (24 majors / 126 fine) |
| Embedded + mapped | 42,789 | bge-base on RTX 5060 Ti → UMAP |
| Fact-sheet batches | 300/300 | 300 fact sheets (target: top 15,000) |
| PDFs | 0 | target: top 15,000 → pdfs/<Major>/ICLR2027_<n>_<Title>.pdf |
