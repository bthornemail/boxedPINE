#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0

cd "$ROOT"

echo "[stress] lane 2.0 matrix"
if ! npm run -s visual:integrate:matrix -- --stop-on-fail true; then
  FAIL=1
  echo "[stress] matrix reported break; continuing to generate artifacts"
fi

echo "[stress] bench visual integration"
if ! npm run -s visual:integrate; then
  FAIL=1
fi

if [ "${VISUAL_STRESS_INCLUDE_SPINE:-1}" = "1" ]; then
  echo "[stress] spine visual integration"
  if ! npm run -s visual:integrate:spine; then
    FAIL=1
  fi
fi

exit "$FAIL"
