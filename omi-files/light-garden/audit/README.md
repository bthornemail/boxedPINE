# Light Garden Audit Framework

NDJSON-based audit/introspection framework.

## Run

```bash
cd audit
npm run validate
```

## Commands

- `npm run generate:golden`
- `npm run generate:negative`
- `npm run validate`
- `npm run validate:node -- --node wordnet-service --trace ./traces/golden/wordnet-lookup.ndjson`
- `npm run waveform:analyze -- --in results/bench/replay/universe/latest/build-replay.ndjson --out-dir /tmp/waveform`
- `npm run harmonic:emit -- --in fixtures/harmonic-lane/inputs/sample.ndjson --waveform-check fixtures/harmonic-lane/inputs/waveform.check.json --out-dir /tmp/harmonic`
- `npm run harmonic:gate`

## Output

- `traces/golden/*.ndjson`
- `traces/negative/*.ndjson`
- `artifacts/reports/audit-summary.json`
- `results/latest/passed.json`
- `results/latest/failed.json`
- `results/latest/metrics.json`

## Gate Semantics (Frozen)

- WordNet similarity contract:
  - `wordnet-similarity` is validated as a numeric range check.
  - Current golden expectation is `0.7..0.9` for `wisdom` vs `knowledge`.
  - Runtime mode is controlled by `WORDNET_SIMILARITY_MODE=strict|fallback` (default: `strict`).
  - Similarity responses include `similarity_mode` and `similarity_fallback_used`.

- WordNet missing-word contract:
  - Current validate behavior allows `NOT_FOUND` as either non-2xx or `200` with empty result.
  - This is intentional for current traces; moving to strict `404` requires trace+validator updates.

- C-server rate-limit contract:
  - Negative suite expects at least one `429` when burst traffic exceeds `expected_limit`.
  - Validate runner fixes `CSERVER_RATE_LIMIT` to a deterministic value by default (`100`).

## Projection Lanes

- Waveform lane contract: `docs/WAVEFORM_LANE.md`
- Harmonic artifact lane contract: `docs/HARMONIC_ARTIFACT_LANE.md`
- Artifact class boundary: `docs/ARTIFACT-CLASS-BOUNDARY.md`
- Terminology guide: `docs/TRANSITION-LAW-vs-INCIDENCE-LAW-vs-PROJECTION-LAW.md`

the braille 6-dot being stuffed into the 8-dot projectable form that the hexagrams decrible the dialetc of which is why with the braille and hexargm we can recontruct the binary
