#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPINE_LATEST="$ROOT/results/bench/replay/spine/latest"
CHECK_JSON="$SPINE_LATEST/build-replay-check.json"
CANON="$SPINE_LATEST/build-replay.ndjson"
PATCH="$SPINE_LATEST/build-replay.patch.ndjson"
PATCHED="$SPINE_LATEST/build-replay.patched.ndjson"

cd "$ROOT"

echo "[visual:spine] bench:projection"
npm run -s bench:projection

echo "[visual:spine] replay:spine"
npm run -s replay:spine

echo "[visual:spine] replay:patch:check:strict"
npm run -s replay:patch:check:strict -- --canon "$CANON" --patch "$PATCH" --out "$PATCHED"

echo "[visual:spine] replay:patch:check (capture summary)"
npm run -s replay:patch:check -- --canon "$CANON" --patch "$PATCH" --out "$PATCHED" > "$CHECK_JSON"

echo "[visual:spine] emit capabilities"
node scripts/emit-capabilities.js --lane spine --out "$SPINE_LATEST/capabilities.json"

echo "[visual:spine] write index"
node scripts/write-visual-index.js --lane spine --dir "$SPINE_LATEST" --out "$SPINE_LATEST/index.json"

echo "[visual:spine] federation bundle"
bash "$SPINE_LATEST/export-federation-bundle.sh"

echo "[visual:spine] artifacts"
echo "  $SPINE_LATEST/build-replay.svg"
echo "  $SPINE_LATEST/build-replay.html"
echo "  $SPINE_LATEST/build-replay.canvas.json"
echo "  $SPINE_LATEST/build-replay.canvasl"
echo "  $SPINE_LATEST/build-replay.canvasl.check.json"
echo "  $SPINE_LATEST/build-replay.canvasl.summary.json"
echo "  $SPINE_LATEST/build-replay-manifest.json"
echo "  $SPINE_LATEST/build-replay.ndjson"
echo "  $SPINE_LATEST/build-replay.patch.ndjson"
echo "  $SPINE_LATEST/build-replay.patched.ndjson"
echo "  $CHECK_JSON"
echo "  $SPINE_LATEST/capabilities.json"
echo "  $SPINE_LATEST/index.json"
echo "  $SPINE_LATEST/build-replay-federation.tgz"
