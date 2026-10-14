# Waveform Lane (Projection-Only)

This lane runs **waveform-core** as a deterministic analysis step over an NDJSON
stream (usually `build-replay.ndjson`). It is a **projection lane**: it must
never mutate canon, and it must be bounded.

## Inputs

- `build-replay.ndjson` (or any NDJSON stream passed via `--in`)

## Outputs (in the replay/bundle dir)

- `waveform-analysis.ndjson` (lane event log)
- `waveform.check.json` (machine verification + digests + config)
- `waveform-summary.json` (human summary + tool output when available)
- `waveform-points.txt` (bounded point cloud; deterministic subsample)

These outputs are optional artifacts. They are safe to include in federation bundles.

## Determinism + Bounds

The runner is `scripts/run-waveform-analysis.js`.

- Point cloud projection is deterministic from the NDJSON records.
- Subsampling is deterministic and always bounded by `max_points`.
- No tool auto-builds run unless explicitly enabled.
- Timeouts are enforced for the external tool invocation.

### `run_id` derivation

`run_id` is computed deterministically from:

- `lane_id`
- `ndjson_sha256`
- `max_points`
- `timeout_ms`
- `allow_cabal`

`run_id` is written into `waveform-analysis.ndjson`, `waveform.check.json`, and
`waveform-summary.json`.

## Fail-Closed Policy

Default: **non-gating**.

- If `waveform-analyze` is missing, the lane emits artifacts with `pass=false`.
- The overall portal/universe gate must not fail unless explicitly required.

### Env flags (universe activation)

In `scripts/run-universe-activate.js`:

- `LG_WAVEFORM_ENABLED=true` runs the lane and emits artifacts.
- `LG_WAVEFORM_REQUIRED=true` fails closed if the lane fails.

### CLI flags (direct runner)

- `--allow-cabal true|false` (default: false)
- `--max-points N` (default: 150)
- `--timeout MS` (default: 30000)
- `--require true|false` (default: false)

## Tool provenance

When `waveform-analyze` is found on PATH, the runner records:

- `binary_path`
- `binary_sha256`

This supports provenance and helps explain “same inputs, different outputs” cases.

