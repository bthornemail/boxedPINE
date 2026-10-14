# Harmonic Artifact Lane (Bounded, Projection-Only)

This lane turns replayable signal/space inputs into deterministic harmonic artifacts for
light/sound projection surfaces.

It is **projection-only** and must never mutate canonical truth.

## Purpose

Connect:

- `waveform-core` extraction discipline (deterministic analysis)
- `PhaseDSL` boundary discipline (strict keysets, canonical ordering, fail-closed)
- `light-garden` physical projection surfaces (small/large domes, talisman masking)

## Inputs

- `build-replay.ndjson` (or equivalent lane trace)
- Optional point/signal input derived by waveform lane:
  - `waveform-points.txt`
  - `waveform-summary.json`
  - `waveform.check.json`
- Optional prior frame for continuity checks (non-authoritative)

## Artifact Set (v0)

### 1) `harmonic_id.v0`

Deterministic semantic/harmonic locator for a single lane run.

Required keyset:

- `v` (`harmonic_id.v0`)
- `authority` (`advisory`)
- `run_id`
- `source_ndjson_sha256`
- `waveform_check_sha256`
- `channel_basis` (fixed list: `R,O,Y,G,B,I,V,A,B,C,D,E,F,G`)
- `fano_basis` (fixed list: `1..7` + optional observer marker)
- `harmonic_id` (`sha256:*`)
- `digest` (`sha256:*`)

Rules:

- `harmonic_id` is derived from canonical preimage only.
- `digest` is derived from artifact body (without `digest`).
- Unknown/missing fields reject.

### 2) `dome_frame.v0`

Deterministic projection frame for physical/rendered dome state.

Required keyset:

- `v` (`dome_frame.v0`)
- `authority` (`advisory`)
- `harmonic_id`
- `frame_index` (decimal string)
- `led_count` (decimal string)
- `leds` (sorted array by numeric `index`)
- `audio_channels` (sorted map/list form)
- `digest` (`sha256:*`)

Each `led` required keyset:

- `index` (decimal string)
- `path`
- `h`
- `s`
- `v`
- `fano`
- `channel`

Rules:

- `index` must be unique and in-range.
- `h/s/v` must be bounded and normalized (policy-fixed).
- `leds` sorting is canonical by numeric `index`, never string sort.
- `harmonic_id` must match current `harmonic_id.v0`.

### 3) `talisman_mask.v0` (optional lane artifact)

Deterministic mask profile for controlled obfuscation/cancellation experiments.

Required keyset:

- `v` (`talisman_mask.v0`)
- `authority` (`advisory`)
- `harmonic_id`
- `mask_profile_id`
- `mask_vector`
- `target_channels`
- `constraints`
- `digest` (`sha256:*`)

Rules:

- Experimental/projection-only.
- Must not alter canonical semantic identity.
- Must declare constraints and target channel domain explicitly.

### 4) `harmonic_receipt.v0`

Portable deterministic advisory receipt artifact.

Required keyset:

- `v` (`harmonic_receipt.v0`)
- `authority` (`advisory`)
- `run_id`
- `harmonic_id_digest`
- `dome_frame_digest`
- `talisman_mask_digest` (nullable)
- `source_ndjson_sha256`
- `waveform_check_sha256`
- `replay_hash`
- `gate_status`
- `digest`

Rules:

- Receipt is portable lane evidence and remains non-authoritative.
- `replay_hash` must match canonical bytes of emitted lane artifacts.
- `gate_status` is advisory lane status only (`ok`/`fail`).

### 5) `harmonic_lane.report.v0`

Deterministic gate-local report artifact.

Required keyset:

- `v` (`harmonic_lane.report.v0`)
- `phase`
- `fixture_counts`
- `accept_pass`
- `reject_pass`
- `replay_hash`
- `status`

## Determinism Rules

- Same canonical input => same `harmonic_id.v0`.
- Same `harmonic_id.v0` + frame config => same `dome_frame.v0`.
- Same artifacts => same replay hash.
- No wall-clock/randomness in canonical artifacts.

## Fail-Closed Rules

Reject on:

- unknown keys
- missing keys
- malformed `sha256:*`
- unsorted canonical arrays
- duplicate LED index/path collisions
- out-of-range channel/fano/hsv values
- digest mismatch
- `harmonic_id`/source digest lineage mismatch

## Minimum Fixture Set

Accept:

- one small dome frame fixture
- one large dome frame fixture
- one harmonic-id-only fixture
- one optional talisman mask fixture

Must-reject:

- malformed keyset
- invalid digest
- unknown channel
- out-of-range LED index
- duplicate LED index
- unsorted LED array
- mismatched harmonic lineage
- malformed talisman mask payload

## Gate Checklist (Implementation Contract)

1. Parse/validate strict keysets for all lane artifacts.
2. Emit `harmonic_id.v0` deterministically.
3. Emit `dome_frame.v0` deterministically.
4. Emit optional `talisman_mask.v0` deterministically (if enabled).
5. Run accept corpus (all pass).
6. Run must-reject corpus (all fail).
7. Re-run emitter and byte-compare outputs.
8. Compute replay hash from canonical artifact bytes.
9. Emit `harmonic_receipt.v0` as portable advisory evidence.
10. Emit `harmonic_lane.report.v0` as gate-local report.
11. Lock sampled fixture outputs and replay hash under `golden/harmonic-lane/sampled/`.
12. Lock noise-heavy sampled fixture outputs/replay hash under `golden/harmonic-lane/sampled-noise/`.
13. Preserve projection-only boundary (no authority mutation).

## Boundary Statement

- `harmonic_id` and frame artifacts are projection lane outputs.
- They support physical interfaces and federation transport as advisory artifacts.
- They do not redefine ABI semantic truth or upstream authority.
