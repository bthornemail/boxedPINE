#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEVOPS_ROOT="/home/main/devops"
HORIZ_ARTIFACT_ROOT="${HORIZ_ARTIFACT_ROOT:-$DEVOPS_ROOT/artifacts/horizontal}"
SKIP_HORIZ_STRESS="${SKIP_HORIZ_STRESS:-0}"
HORIZ_ROOT="$ROOT/results/bench/replay/horiz/latest"
CHECK_JSON="$HORIZ_ROOT/build-replay-check.json"
CANON="$HORIZ_ROOT/build-replay.ndjson"
PATCH="$HORIZ_ROOT/build-replay.patch.ndjson"
PATCHED="$HORIZ_ROOT/build-replay.patched.ndjson"

HORIZ_RUN="$HORIZ_ARTIFACT_ROOT/horiz-run.ndjson"
HORIZ_POSITION="$HORIZ_ARTIFACT_ROOT/position.json"
HORIZ_CATALOG="$HORIZ_ARTIFACT_ROOT/catalog.json"
HORIZ_PROBE="$HORIZ_ARTIFACT_ROOT/probe.json"

cd "$ROOT"

if [ "$SKIP_HORIZ_STRESS" != "1" ]; then
  if [ -x "$DEVOPS_ROOT/scripts/horiz/stress.sh" ]; then
    echo "[visual:horiz] run horizontal stress"
    bash "$DEVOPS_ROOT/scripts/horiz/stress.sh"
  else
    echo "[visual:horiz] missing stress runner: $DEVOPS_ROOT/scripts/horiz/stress.sh" >&2
    echo "[visual:horiz] set SKIP_HORIZ_STRESS=1 when providing fixture inputs" >&2
    exit 1
  fi
else
  echo "[visual:horiz] skipping horizontal stress (SKIP_HORIZ_STRESS=1)"
fi

echo "[visual:horiz] input paths"
echo "  $HORIZ_RUN"
echo "  $HORIZ_POSITION"
echo "  $HORIZ_CATALOG"
echo "  $HORIZ_PROBE"

for f in "$HORIZ_RUN" "$HORIZ_POSITION" "$HORIZ_CATALOG" "$HORIZ_PROBE"; do
  if [ ! -f "$f" ]; then
    echo "[visual:horiz] missing required input: $f" >&2
    exit 1
  fi
done

echo "[visual:horiz] replay:horiz"
CANVASL_EVIDENCE_ROOT="$DEVOPS_ROOT" npm run -s replay:horiz -- --input "$HORIZ_RUN" --out "$HORIZ_ROOT"

echo "[visual:horiz] replay:patch:check:strict"
npm run -s replay:patch:check:strict -- --canon "$CANON" --patch "$PATCH" --out "$PATCHED"

echo "[visual:horiz] replay:patch:check (capture summary)"
npm run -s replay:patch:check -- --canon "$CANON" --patch "$PATCH" --out "$PATCHED" > "$CHECK_JSON"

echo "[visual:horiz] copy campaign context"
cp "$HORIZ_POSITION" "$HORIZ_ROOT/position.json"
cp "$HORIZ_CATALOG" "$HORIZ_ROOT/catalog.json"
cp "$HORIZ_PROBE" "$HORIZ_ROOT/probe.json"

echo "[visual:horiz] emit capabilities"
node scripts/emit-capabilities.js --lane horiz --out "$HORIZ_ROOT/capabilities.json"

echo "[visual:horiz] federation bundle (pre-index)"
bash "$HORIZ_ROOT/export-federation-bundle.sh"

echo "[visual:horiz] write index"
node scripts/write-visual-index.js --lane horiz --dir "$HORIZ_ROOT" --out "$HORIZ_ROOT/index.json"

echo "[visual:horiz] federation bundle (with index)"
bash "$HORIZ_ROOT/export-federation-bundle.sh"

echo "[visual:horiz] artifacts"
echo "  $HORIZ_ROOT/build-replay.svg"
echo "  $HORIZ_ROOT/build-replay.html"
echo "  $HORIZ_ROOT/build-replay.canvas.json"
echo "  $HORIZ_ROOT/build-replay.canvasl"
echo "  $HORIZ_ROOT/build-replay.canvasl.check.json"
echo "  $HORIZ_ROOT/build-replay.canvasl.summary.json"
echo "  $HORIZ_ROOT/build-replay-manifest.json"
echo "  $HORIZ_ROOT/build-replay.ndjson"
echo "  $HORIZ_ROOT/build-replay.patch.ndjson"
echo "  $HORIZ_ROOT/build-replay.patched.ndjson"
echo "  $CHECK_JSON"
echo "  $HORIZ_ROOT/position.json"
echo "  $HORIZ_ROOT/catalog.json"
echo "  $HORIZ_ROOT/probe.json"
echo "  $HORIZ_ROOT/capabilities.json"
echo "  $HORIZ_ROOT/index.json"
echo "  $HORIZ_ROOT/build-replay-federation.tgz"
