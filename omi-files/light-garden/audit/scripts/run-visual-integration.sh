#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LATEST="$ROOT/results/bench/replay/latest"
CHECK_JSON="$LATEST/build-replay-check.json"

cd "$ROOT"

echo "[visual] bench:projection"
npm run -s bench:projection

echo "[visual] replay:build"
npm run -s replay:build

echo "[visual] replay:patch:check:strict"
npm run -s replay:patch:check:strict

echo "[visual] replay:patch:check (capture summary)"
npm run -s replay:patch:check > "$CHECK_JSON"

echo "[visual] emit capabilities"
node scripts/emit-capabilities.js --lane bench --out "$LATEST/capabilities.json"

echo "[visual] write index"
node scripts/write-visual-index.js --lane bench --dir "$LATEST" --out "$LATEST/index.json"

echo "[visual] federation bundle"
bash "$LATEST/export-federation-bundle.sh"

echo "[visual] artifacts"
echo "  $LATEST/build-replay.svg"
echo "  $LATEST/build-replay.html"
echo "  $LATEST/build-replay.canvas.json"
echo "  $LATEST/build-replay.canvasl"
echo "  $LATEST/build-replay.canvasl.check.json"
echo "  $LATEST/build-replay.canvasl.summary.json"
echo "  $LATEST/build-replay-manifest.json"
echo "  $LATEST/build-replay.ndjson"
echo "  $LATEST/build-replay.patch.ndjson"
echo "  $LATEST/build-replay.patched.ndjson"
echo "  $CHECK_JSON"
echo "  $LATEST/capabilities.json"
echo "  $LATEST/index.json"
echo "  $LATEST/build-replay-federation.tgz"
