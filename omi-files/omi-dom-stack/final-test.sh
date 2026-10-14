#!/usr/bin/env bash
# OMI-IMO final verification
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PORT="${PORT:-8742}"
FAIL=0

echo "=== OMI-IMO final-test ==="

node -c server/server.js || { echo "FAIL server syntax"; exit 1; }
echo "OK server syntax"

# Self-tests (sync modules)
for m in ruler clock-sliderule hit-zones-cues dimension-pipeline busybox ascii-table \
  solid-toolkit solid-toolkit-extended solid-to-triple edge-ngram spatial-gnn \
  contrasting-orchestrator pattern-pipeline plugin-api hardware-ref blob-substrate prolog-resolve fano-lottery algorithmic-core path-protocol space peers declare; do
  if node -e "const r=require('./shared/$m').selfTest(); if(!r.passed) process.exit(1)" 2>/dev/null; then
    echo "OK selfTest $m"
  else
    echo "FAIL selfTest $m"; FAIL=1
  fi
done

# Parallel engine (async)
if node -e '
const pe=require("./shared/parallel-engine");
pe.selfTest().then(r=>{ if(!r.passed) process.exit(1); }).catch(()=>process.exit(1));
' 2>/dev/null; then
  echo "OK selfTest parallel-engine"
else
  echo "FAIL selfTest parallel-engine"; FAIL=1
fi

# Hardware C reference
if command -v cc >/dev/null 2>&1; then
  cc -O2 -std=c99 -o /tmp/omi_hw_ref hardware/c/omi_hw_ref.c 2>/dev/null && /tmp/omi_hw_ref >/dev/null \
    && echo "OK hardware C 19 vectors" || { echo "FAIL hardware C"; FAIL=1; }
else
  echo "SKIP hardware C (no cc)"
fi

# Boot server and hit routes
node server/server.js &
SPID=$!
sleep 1
cleanup() { kill $SPID 2>/dev/null || true; }
trap cleanup EXIT

for path in / /portal /adopt /genesis /genesis-fold /api/pipeline /api/bundle /docs/README.md \
  /wiki /api/wiki /wiki/index.json /wiki/chapters/cn-02-apply-6t.json /wiki/chapters/cn-04-digest-10t.json \
  /api/substrate /universe /devtools /agent /agent/world /api/cues; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}${path}" || echo 000)
  if [ "$code" = "200" ]; then
    echo "OK HTTP $path → $code"
  else
    echo "FAIL HTTP $path → $code"; FAIL=1
  fi
done

# Wiki meta-compile (deterministic validator + bundle)
if node wiki/meta-compile.js >/dev/null 2>&1; then
  echo "OK wiki meta-compile"
else
  echo "FAIL wiki meta-compile"; FAIL=1
fi

pipe=$(curl -s "http://127.0.0.1:${PORT}/api/pipeline?q=final-test")
echo "$pipe" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{const j=JSON.parse(d); if(!j.ok) process.exit(1); console.log("OK pipeline ok tokens", (j.tokens||[]).length);})' \
  || { echo "FAIL pipeline body"; FAIL=1; }

bundle=$(curl -s "http://127.0.0.1:${PORT}/api/bundle" | head -c 200)
echo "$bundle" | grep -q omi-imo-meta-compile && echo "OK bundle header" || { echo "FAIL bundle"; FAIL=1; }

# Bundle embeds the walkthrough wiki meta-compilation
if curl -s "http://127.0.0.1:${PORT}/api/bundle" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{const j=JSON.parse(d); if(!j.wiki||!j.wiki.ok||j.wiki.tally.transistorCount!==29||!j.wiki.centroid.balanced) process.exit(1); console.log("OK bundle wiki centroid", j.wiki.centroid.xorHex);})' ; then
  :
else
  echo "FAIL bundle wiki"; FAIL=1
fi

# Live cross-version network test (Grok omi-walkthrough :8080 ↔ our :8742).
# Requires the omi-walkthrough deps; skipped when they are not installed.
GROK_OMNI="${GROK_ROOT:-/home/main/Programs/omi-walkthrough}"
if [ -d "$GROK_OMNI/node_modules" ]; then
  if OMI_PORT="${PORT}" OMI_EXTERNAL=1 GROK_PORT="${CROSS_GROK_PORT:-8080}" \
    GROK_ROOT="$GROK_OMNI" node test/network-versions.test.js; then
    echo "OK network-versions"
  else
    echo "FAIL network-versions"; FAIL=1
  fi
else
  echo "SKIP network-versions (omi-walkthrough deps not installed; run npm install in $GROK_OMNI)"
fi

if [ "$FAIL" -eq 0 ]; then
  echo "=== ALL FINAL CHECKS PASSED ==="
  exit 0
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
