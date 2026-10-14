#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIXTURE_ROOT="$ROOT/fixtures/harmonic-lane"
ACCEPT_DIR="$FIXTURE_ROOT/accept"
REJECT_DIR="$FIXTURE_ROOT/must-reject"
GOLDEN_DIR="$ROOT/golden/harmonic-lane"
SAMPLED_GOLDEN_DIR="$GOLDEN_DIR/sampled"
SAMPLED_NOISE_GOLDEN_DIR="$GOLDEN_DIR/sampled-noise"
OUT_DIR="$ROOT/results/harmonic-lane/latest"
OUT_DIR_2="$ROOT/results/harmonic-lane/replay"
SAMPLED_OUT_DIR="$ROOT/results/harmonic-lane/sampled"
SAMPLED_NOISE_OUT_DIR="$ROOT/results/harmonic-lane/sampled-noise"

mkdir -p "$OUT_DIR" "$OUT_DIR_2" "$GOLDEN_DIR" "$SAMPLED_GOLDEN_DIR" "$SAMPLED_OUT_DIR" "$SAMPLED_NOISE_GOLDEN_DIR" "$SAMPLED_NOISE_OUT_DIR"

run_fixture() {
  local fixture="$1"
  local out_dir="$2"

  local ndjson_rel
  local waveform_rel
  local led_count
  local emit_dome
  local emit_mask
  local frame_index

  ndjson_rel="$(node -e "const f=require(process.argv[1]); process.stdout.write(f.input_ndjson);
" "$fixture")"
  waveform_rel="$(node -e "const f=require(process.argv[1]); process.stdout.write(f.waveform_check || '');
" "$fixture")"
  led_count="$(node -e "const f=require(process.argv[1]); process.stdout.write(String(f.led_count || 61));
" "$fixture")"
  emit_dome="$(node -e "const f=require(process.argv[1]); process.stdout.write(String(f.emit_dome !== false));
" "$fixture")"
  emit_mask="$(node -e "const f=require(process.argv[1]); process.stdout.write(String(Boolean(f.emit_mask)));
" "$fixture")"
  frame_index="$(node -e "const f=require(process.argv[1]); process.stdout.write(String(f.frame_index || 0));
" "$fixture")"

  local ndjson_abs="$FIXTURE_ROOT/$ndjson_rel"
  local waveform_abs=""
  if [[ -n "$waveform_rel" ]]; then
    waveform_abs="$FIXTURE_ROOT/$waveform_rel"
  fi

  local cmd=(node "$ROOT/scripts/run-harmonic-lane.js" --in "$ndjson_abs" --out-dir "$out_dir" --led-count "$led_count" --emit-dome "$emit_dome" --emit-mask "$emit_mask" --frame-index "$frame_index")
  if [[ -n "$waveform_abs" ]]; then
    cmd+=(--waveform-check "$waveform_abs")
  fi
  "${cmd[@]}" >/dev/null
}

validate_file() {
  local file="$1"
  node "$ROOT/scripts/validate-harmonic-artifact.js" --in "$file" >/dev/null
}

echo "[harmonic] generate primary lane output"
run_fixture "$ACCEPT_DIR/dome-frame-large.fixture.json" "$OUT_DIR"

for f in harmonic_id.v0.json dome_frame.v0.json harmonic_receipt.v0.json harmonic_lane.report.v0.json; do
  validate_file "$OUT_DIR/$f"
done

echo "[harmonic] accept fixtures"
accept_count=0
while IFS= read -r fixture; do
  base="$(basename "$fixture" .fixture.json)"
  fixture_out="$OUT_DIR/accept-$base"
  mkdir -p "$fixture_out"
  run_fixture "$fixture" "$fixture_out"

  validate_file "$fixture_out/harmonic_id.v0.json"
  if [[ -f "$fixture_out/dome_frame.v0.json" ]]; then validate_file "$fixture_out/dome_frame.v0.json"; fi
  if [[ -f "$fixture_out/talisman_mask.v0.json" ]]; then validate_file "$fixture_out/talisman_mask.v0.json"; fi
  validate_file "$fixture_out/harmonic_receipt.v0.json"
  validate_file "$fixture_out/harmonic_lane.report.v0.json"

  accept_count=$((accept_count + 1))
done < <(find "$ACCEPT_DIR" -maxdepth 1 -type f -name '*.fixture.json' | sort)

echo "[harmonic] must-reject fixtures"
reject_count=0
while IFS= read -r fixture; do
  if node "$ROOT/scripts/validate-harmonic-artifact.js" --in "$fixture" >/dev/null 2>&1; then
    echo "must-reject fixture unexpectedly passed: $fixture" >&2
    exit 1
  fi
  reject_count=$((reject_count + 1))
done < <(find "$REJECT_DIR" -maxdepth 1 -type f -name '*.json' | sort)

[[ "$reject_count" -ge 8 ]] || { echo "expected at least 8 must-reject fixtures" >&2; exit 1; }

echo "[harmonic] determinism rerun"
rm -rf "$OUT_DIR_2"
mkdir -p "$OUT_DIR_2"
run_fixture "$ACCEPT_DIR/dome-frame-large.fixture.json" "$OUT_DIR_2"

for f in harmonic_id.v0.json dome_frame.v0.json harmonic_receipt.v0.json harmonic_lane.report.v0.json; do
  cmp -s "$OUT_DIR/$f" "$OUT_DIR_2/$f" || { echo "determinism mismatch: $f" >&2; exit 1; }
done

echo "[harmonic] sampled fixture golden lock"
rm -rf "$SAMPLED_OUT_DIR"
mkdir -p "$SAMPLED_OUT_DIR"
run_fixture "$ACCEPT_DIR/dome-frame-sampled.fixture.json" "$SAMPLED_OUT_DIR"

for f in harmonic_id.v0.json dome_frame.v0.json talisman_mask.v0.json harmonic_receipt.v0.json harmonic_lane.report.v0.json; do
  validate_file "$SAMPLED_OUT_DIR/$f"
done

sampled_replay_hash="$(node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(p.replay_hash);" "$SAMPLED_OUT_DIR/harmonic_lane.report.v0.json")"
[[ "$sampled_replay_hash" =~ ^sha256:[0-9a-f]{64}$ ]] || { echo "invalid sampled replay hash" >&2; exit 1; }

echo "$sampled_replay_hash" > "$SAMPLED_OUT_DIR/replay-hash"

if [[ -f "$SAMPLED_GOLDEN_DIR/replay-hash" ]]; then
  sampled_golden_hash="$(cat "$SAMPLED_GOLDEN_DIR/replay-hash")"
  [[ "$sampled_golden_hash" == "$sampled_replay_hash" ]] || { echo "sampled replay hash mismatch vs golden" >&2; exit 1; }
else
  cp "$SAMPLED_OUT_DIR/replay-hash" "$SAMPLED_GOLDEN_DIR/replay-hash"
fi

for f in harmonic_id.v0.json dome_frame.v0.json talisman_mask.v0.json harmonic_receipt.v0.json; do
  if [[ -f "$SAMPLED_GOLDEN_DIR/$f" ]]; then
    cmp -s "$SAMPLED_OUT_DIR/$f" "$SAMPLED_GOLDEN_DIR/$f" || { echo "sampled golden mismatch: $f" >&2; exit 1; }
  else
    cp "$SAMPLED_OUT_DIR/$f" "$SAMPLED_GOLDEN_DIR/$f"
  fi
done

echo "[harmonic] noise-heavy fixture golden lock"
rm -rf "$SAMPLED_NOISE_OUT_DIR"
mkdir -p "$SAMPLED_NOISE_OUT_DIR"
run_fixture "$ACCEPT_DIR/dome-frame-noise-heavy.fixture.json" "$SAMPLED_NOISE_OUT_DIR"

for f in harmonic_id.v0.json dome_frame.v0.json talisman_mask.v0.json harmonic_receipt.v0.json harmonic_lane.report.v0.json; do
  validate_file "$SAMPLED_NOISE_OUT_DIR/$f"
done

sampled_noise_replay_hash="$(node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(p.replay_hash);" "$SAMPLED_NOISE_OUT_DIR/harmonic_lane.report.v0.json")"
[[ "$sampled_noise_replay_hash" =~ ^sha256:[0-9a-f]{64}$ ]] || { echo "invalid sampled-noise replay hash" >&2; exit 1; }

echo "$sampled_noise_replay_hash" > "$SAMPLED_NOISE_OUT_DIR/replay-hash"

if [[ -f "$SAMPLED_NOISE_GOLDEN_DIR/replay-hash" ]]; then
  sampled_noise_golden_hash="$(cat "$SAMPLED_NOISE_GOLDEN_DIR/replay-hash")"
  [[ "$sampled_noise_golden_hash" == "$sampled_noise_replay_hash" ]] || { echo "sampled-noise replay hash mismatch vs golden" >&2; exit 1; }
else
  cp "$SAMPLED_NOISE_OUT_DIR/replay-hash" "$SAMPLED_NOISE_GOLDEN_DIR/replay-hash"
fi

for f in harmonic_id.v0.json dome_frame.v0.json talisman_mask.v0.json harmonic_receipt.v0.json; do
  if [[ -f "$SAMPLED_NOISE_GOLDEN_DIR/$f" ]]; then
    cmp -s "$SAMPLED_NOISE_OUT_DIR/$f" "$SAMPLED_NOISE_GOLDEN_DIR/$f" || { echo "sampled-noise golden mismatch: $f" >&2; exit 1; }
  else
    cp "$SAMPLED_NOISE_OUT_DIR/$f" "$SAMPLED_NOISE_GOLDEN_DIR/$f"
  fi
done

replay_hash="$(node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(p.replay_hash);" "$OUT_DIR/harmonic_lane.report.v0.json")"
[[ "$replay_hash" =~ ^sha256:[0-9a-f]{64}$ ]] || { echo "invalid replay hash" >&2; exit 1; }

echo "$replay_hash" > "$OUT_DIR/replay-hash"

if [[ -f "$GOLDEN_DIR/replay-hash" ]]; then
  golden_hash="$(cat "$GOLDEN_DIR/replay-hash")"
  [[ "$golden_hash" == "$replay_hash" ]] || { echo "replay hash mismatch vs golden" >&2; exit 1; }
else
  cp "$OUT_DIR/replay-hash" "$GOLDEN_DIR/replay-hash"
fi

for f in harmonic_id.v0.json dome_frame.v0.json harmonic_receipt.v0.json; do
  if [[ -f "$GOLDEN_DIR/$f" ]]; then
    cmp -s "$OUT_DIR/$f" "$GOLDEN_DIR/$f" || { echo "golden mismatch: $f" >&2; exit 1; }
  else
    cp "$OUT_DIR/$f" "$GOLDEN_DIR/$f"
  fi
done

cat > "$OUT_DIR/harmonic-lane-gate.report.json" <<JSON
{
  "schema_version": 1,
  "kind": "harmonic-lane-gate.report",
  "lane_id": "harmonic-lane",
  "pass": true,
  "accept_count": $accept_count,
  "reject_count": $reject_count,
  "replay_hash": "${replay_hash}",
  "sampled_replay_hash": "${sampled_replay_hash}",
  "sampled_noise_replay_hash": "${sampled_noise_replay_hash}",
  "outputs": {
    "harmonic_id": "results/harmonic-lane/latest/harmonic_id.v0.json",
    "dome_frame": "results/harmonic-lane/latest/dome_frame.v0.json",
    "harmonic_receipt": "results/harmonic-lane/latest/harmonic_receipt.v0.json",
    "report": "results/harmonic-lane/latest/harmonic_lane.report.v0.json",
    "sampled_harmonic_id": "results/harmonic-lane/sampled/harmonic_id.v0.json",
    "sampled_dome_frame": "results/harmonic-lane/sampled/dome_frame.v0.json",
    "sampled_talisman_mask": "results/harmonic-lane/sampled/talisman_mask.v0.json",
    "sampled_harmonic_receipt": "results/harmonic-lane/sampled/harmonic_receipt.v0.json",
    "sampled_noise_harmonic_id": "results/harmonic-lane/sampled-noise/harmonic_id.v0.json",
    "sampled_noise_dome_frame": "results/harmonic-lane/sampled-noise/dome_frame.v0.json",
    "sampled_noise_talisman_mask": "results/harmonic-lane/sampled-noise/talisman_mask.v0.json",
    "sampled_noise_harmonic_receipt": "results/harmonic-lane/sampled-noise/harmonic_receipt.v0.json"
  }
}
JSON

echo "ok harmonic lane gate"
