#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureDir } = require('./lib');
const { emitCanvasFromEvents } = require('./emit-jsoncanvas');
const { emitCanvasLFromEvents } = require('./emit-canvasl');

const auditRoot = path.resolve(__dirname, '..');
const lgRoot = path.resolve(auditRoot, '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function sha256Bytes(data) {
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function readNdjson(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function normNum(v, fallback = 0) {
  return Number.isFinite(Number(v)) ? Number(v) : fallback;
}

function eventColor(event) {
  if (event.startsWith('bench.run.start')) return '#2f80ed';
  if (event.startsWith('bench.run.end')) return '#27ae60';
  if (event.startsWith('bench.metrics')) return '#f2994a';
  if (event.startsWith('bench.summary')) return '#9b51e0';
  if (event.startsWith('phase.')) return '#56ccf2';
  if (event.startsWith('restore_')) return '#f2c94c';
  if (event.startsWith('run.')) return '#6fcf97';
  return '#6c757d';
}

function normalizeEvent(src, index) {
  const payload = src && typeof src.payload === 'object' && src.payload !== null ? src.payload : {};
  const event = typeof src.event === 'string' && src.event ? src.event : 'unknown.event';
  const timestamp = src.timestamp || src.time || null;
  return {
    seq: index + 1,
    event,
    timestamp,
    payload,
    wall_ms: normNum(payload.wall_ms, normNum(src.wall_ms, 0)),
    exit: normNum(payload.exit, normNum(src.exit, 0))
  };
}

function renderSvg(events, title, subtitle) {
  const width = 1600;
  const height = 540;
  const margin = 32;
  const laneTop = 120;
  const laneHeight = 250;
  const laneBottom = laneTop + laneHeight;
  const usableWidth = width - margin * 2;
  const count = Math.max(1, events.length);
  const step = usableWidth / count;

  const circles = events
    .map((e, i) => {
      const x = margin + i * step + step / 2;
      const y = laneTop + ((i % 2) ? laneHeight * 0.35 : laneHeight * 0.65);
      return `<g>\n  <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="8" fill="${eventColor(e.event)}" opacity="0.95"/>\n  <text x="${x.toFixed(2)}" y="${(laneBottom + 30).toFixed(2)}" font-size="11" fill="#a0a0a0" text-anchor="middle">${i + 1}</text>\n</g>`;
    })
    .join('\n');

  const labels = events
    .slice(0, 14)
    .map((e, i) => {
      const x = margin + i * step + step / 2;
      const y = 430 + (i % 2) * 24;
      const tag = String(e.event).replace(/^bench\./, '').slice(0, 26);
      return `<text x="${x.toFixed(2)}" y="${y}" font-size="12" fill="#d0d0d0" text-anchor="middle">${tag}</text>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b1022"/>
      <stop offset="100%" stop-color="#141b2d"/>
    </linearGradient>
    <linearGradient id="lane" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#1f2a44"/>
      <stop offset="100%" stop-color="#0f1728"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${margin}" y="48" font-size="30" fill="#e5e7eb" font-family="system-ui, sans-serif">${title}</text>
  <text x="${margin}" y="78" font-size="15" fill="#9ca3af" font-family="system-ui, sans-serif">${subtitle}</text>
  <rect x="${margin}" y="${laneTop}" rx="14" ry="14" width="${usableWidth}" height="${laneHeight}" fill="url(#lane)" stroke="#334155" stroke-width="1.5"/>
  <line x1="${margin}" y1="${laneTop + laneHeight / 2}" x2="${margin + usableWidth}" y2="${laneTop + laneHeight / 2}" stroke="#334155" stroke-width="1"/>
  ${circles}
  ${labels}
  <text x="${margin}" y="${height - 24}" font-size="13" fill="#94a3b8" font-family="system-ui, sans-serif">events=${events.length}</text>
</svg>`;
}

function writeHtml(outPath, payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${payload.title}</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #0b1022; color: #e5e7eb; }
    .wrap { max-width: 1360px; margin: 24px auto; padding: 0 16px; }
    .row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .card { background: #111827; border: 1px solid #243041; border-radius: 12px; padding: 14px; }
    .title { margin: 0 0 8px; font-size: 20px; }
    .meta { color: #94a3b8; font-size: 13px; margin-bottom: 10px; }
    .stage { font-size: 13px; margin: 6px 0; color: #cbd5e1; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
    button, label.btn { background: #1f2937; color: #e5e7eb; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    input[type="range"] { width: 100%; }
    pre, textarea { width: 100%; box-sizing: border-box; max-height: 260px; overflow: auto; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px; color: #dbeafe; font-size: 12px; }
    textarea { min-height: 180px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .mux { margin-top: 10px; color: #93c5fd; font-size: 12px; }
    .links a { color: #93c5fd; text-decoration: none; }
    .links li { margin: 4px 0; }
    .status { margin-top: 8px; font-size: 12px; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="row">
      <div class="card">
        <h1 class="title">${payload.title}</h1>
        <div class="meta">Scrubbable NDJSON replay. Canonical transform is SVG. Canon is immutable; edits export as patch overlay.</div>
        <img src="./build-replay.svg" alt="build replay timeline" style="width:100%; border-radius:10px; border:1px solid #334155;" />
        <div class="controls">
          <button id="play">Play</button>
          <button id="pause">Pause</button>
          <button id="prev">Prev</button>
          <button id="next">Next</button>
          <button id="reset">Reset Patch</button>
          <button id="exportPatch">Export Patch NDJSON</button>
          <label class="btn" for="importFile">Import Patch NDJSON</label>
          <input id="importFile" type="file" accept=".ndjson,.txt" style="display:none" />
          <div style="flex:1"><input id="scrub" type="range" min="0" max="0" value="0" /></div>
        </div>
        <div class="stage" id="stage"></div>
        <div class="status" id="status"></div>
        <div class="mux">Mux/Demux: canonical NDJSON in, projections out. Federation shares canon + patch + manifest.</div>
      </div>
      <div class="card">
        <h2 class="title" style="font-size:17px">Event Detail + Edit</h2>
        <pre id="detail"></pre>
        <textarea id="editor" spellcheck="false"></textarea>
        <div class="controls">
          <button id="apply">Patch Replace</button>
          <button id="addAfter">Patch Insert</button>
          <button id="delete">Patch Delete</button>
        </div>
        <div class="links">
          <h3 style="font-size:14px;margin:10px 0 6px">Projection Hooks</h3>
          <ul>
            <li><a href="${payload.hooks.player_html}" target="_blank">HTML Player Hook</a></li>
            <li><a href="${payload.hooks.mp4_script}" target="_blank">MP4 Export Script</a></li>
            <li><a href="${payload.hooks.seed_kernel_svg}" target="_blank">Seed Kernel SVG</a></li>
            <li><a href="./build-replay-manifest.json" target="_blank">Replay Manifest</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <script>
    const model = ${json};
    const canonical = (model.events || []).map((e, idx) => ({ ...JSON.parse(JSON.stringify(e)), _canon_seq: idx + 1 }));
    let patches = [];
    let events = [];
    let i = 0;
    let t = null;
    const scrub = document.getElementById('scrub');
    const detail = document.getElementById('detail');
    const stage = document.getElementById('stage');
    const status = document.getElementById('status');
    const editor = document.getElementById('editor');

    function clone(v) { return JSON.parse(JSON.stringify(v)); }

    function nextPatchSeq() {
      return patches.length ? Number(patches[patches.length - 1].seq || 0) + 1 : 1;
    }

    function normalizePatchedEvent(e, idx) {
      const out = clone(e);
      out.seq = idx + 1;
      return out;
    }

    function applyPatches() {
      let out = canonical.map((e) => clone(e));
      for (const patch of patches) {
        if (!patch || patch.event !== 'replay.patch') continue;
        const target = Number(patch.target_seq || 0);
        const idx = out.findIndex((e) => Number(e._canon_seq || 0) === target);
        if (patch.op === 'replace' && idx >= 0 && patch.value) {
          out[idx] = { ...clone(patch.value), _canon_seq: target };
        } else if (patch.op === 'insert_after' && idx >= 0 && patch.value) {
          out.splice(idx + 1, 0, { ...clone(patch.value), _canon_seq: null });
        } else if (patch.op === 'delete' && idx >= 0) {
          out.splice(idx, 1);
        }
      }
      events = out.map((e, idx) => normalizePatchedEvent(e, idx));
    }

    function saveLocal() {
      try {
        localStorage.setItem(model.local_storage_key, JSON.stringify(patches));
      } catch (err) {
        status.textContent = 'local save failed: ' + String(err.message || err);
      }
    }

    function loadLocal() {
      try {
        const raw = localStorage.getItem(model.local_storage_key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          patches = parsed;
          status.textContent = 'restored local patch overlay';
        }
      } catch (_err) {
        // ignore invalid local state
      }
    }

    function pushPatch(op, targetSeq, value) {
      const patch = {
        event: 'replay.patch',
        seq: nextPatchSeq(),
        op,
        target_seq: Number(targetSeq || 0)
      };
      if (value !== undefined) patch.value = value;
      patches.push(patch);
      applyPatches();
      saveLocal();
      if (i >= events.length) i = Math.max(0, events.length - 1);
      render();
    }

    function render() {
      const n = events.length;
      if (n === 0) {
        stage.textContent = 'no events';
        detail.textContent = '{}';
        editor.value = '{}';
        scrub.max = 0;
        scrub.value = 0;
        return;
      }
      if (i >= n) i = n - 1;
      if (i < 0) i = 0;
      const e = events[i] || {};
      scrub.max = Math.max(0, n - 1);
      scrub.value = i;
      stage.textContent = 'frame ' + (i + 1) + '/' + n + ' | ' + (e.event || 'n/a') + ' | patches=' + patches.length;
      detail.textContent = JSON.stringify(e, null, 2);
      editor.value = JSON.stringify(e, null, 2);
    }

    function play() {
      if (t) return;
      t = setInterval(() => {
        if (!events.length) return;
        i = (i + 1) % events.length;
        render();
      }, 700);
    }

    function pause() {
      if (!t) return;
      clearInterval(t);
      t = null;
    }

    function currentTargetSeq() {
      const current = events[i] || {};
      return Number(current._canon_seq || 0);
    }

    function applyReplacePatch() {
      const target = currentTargetSeq();
      if (!target) {
        status.textContent = 'replace requires a canonical target event';
        return;
      }
      try {
        const next = JSON.parse(editor.value);
        pushPatch('replace', target, next);
        status.textContent = 'replace patch applied';
      } catch (err) {
        status.textContent = 'invalid JSON: ' + String(err.message || err);
      }
    }

    function applyInsertPatch() {
      const target = currentTargetSeq();
      if (!target) {
        status.textContent = 'insert requires a canonical target event';
        return;
      }
      const base = events[i] || { event: 'custom.event', payload: {} };
      const value = clone(base);
      value.event = 'custom.event';
      value.payload = value.payload || {};
      pushPatch('insert_after', target, value);
      i = Math.min(i + 1, Math.max(0, events.length - 1));
      status.textContent = 'insert patch applied';
    }

    function applyDeletePatch() {
      const target = currentTargetSeq();
      if (!target) {
        status.textContent = 'delete requires a canonical target event';
        return;
      }
      pushPatch('delete', target);
      status.textContent = 'delete patch applied';
    }

    function exportPatchNdjson() {
      const text = patches.map((e) => JSON.stringify(e)).join('\n') + (patches.length ? '\n' : '');
      const blob = new Blob([text], { type: 'application/x-ndjson' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.patch_export_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      status.textContent = 'exported patch NDJSON';
    }

    function importPatchFile(file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const lines = String(reader.result || '').split(/\n/).map((s) => s.trim()).filter(Boolean);
          const parsed = lines.map((line) => JSON.parse(line));
          if (parsed.some((p) => p.event !== 'replay.patch')) {
            throw new Error('only replay.patch NDJSON is accepted');
          }
          patches = parsed;
          applyPatches();
          i = 0;
          saveLocal();
          status.textContent = 'imported patch events: ' + patches.length;
          render();
        } catch (err) {
          status.textContent = 'import failed: ' + String(err.message || err);
        }
      };
      reader.readAsText(file);
    }

    document.getElementById('play').onclick = play;
    document.getElementById('pause').onclick = pause;
    document.getElementById('prev').onclick = () => { i = Math.max(0, i - 1); render(); };
    document.getElementById('next').onclick = () => { i = Math.min(events.length - 1, i + 1); render(); };
    document.getElementById('apply').onclick = applyReplacePatch;
    document.getElementById('addAfter').onclick = applyInsertPatch;
    document.getElementById('delete').onclick = applyDeletePatch;
    document.getElementById('reset').onclick = () => {
      patches = [];
      applyPatches();
      i = 0;
      saveLocal();
      status.textContent = 'patch reset to canonical';
      render();
    };
    document.getElementById('exportPatch').onclick = exportPatchNdjson;
    document.getElementById('importFile').addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (file) importPatchFile(file);
      ev.target.value = '';
    });
    scrub.oninput = (ev) => { i = Number(ev.target.value || 0); render(); };

    loadLocal();
    applyPatches();
    render();
  </script>
</body>
</html>`;
  fs.writeFileSync(outPath, html, 'utf8');
}

function defaultInputForMode(mode) {
  if (mode === 'spine') return '../../artifacts/spine-trace.ndjson';
  if (mode === 'horiz') return '../../../artifacts/horizontal/horiz-run.ndjson';
  if (mode === 'vmbench') return '../../artifacts/vm/latest/vm-bench.ndjson';
  return 'results/bench/latest/projection-bench.ndjson';
}

function defaultOutForMode(mode) {
  if (mode === 'horiz') return 'results/bench/replay/horiz/latest';
  if (mode === 'vmbench') return 'results/bench/replay/vmbench/latest';
  return 'results/bench/replay/latest';
}

function writeExecutable(filePath, body) {
  fs.writeFileSync(filePath, body, 'utf8');
  fs.chmodSync(filePath, 0o755);
}

function main() {
  const args = parseArgs(process.argv);
  const mode = String(args.mode || 'bench');
  const inNdjson = path.resolve(auditRoot, args.input || defaultInputForMode(mode));
  const outDir = path.resolve(auditRoot, args.out || defaultOutForMode(mode));
  const title = args.title || (
    mode === 'spine'
      ? 'Light-Garden Spine Build Replay'
      : mode === 'horiz'
        ? 'Horizontal Devops Integration Replay'
        : mode === 'vmbench'
          ? 'Light-Garden VM Benchmark Replay'
        : 'Light-Garden Build Replay'
  );
  const subtitle = mode === 'spine'
    ? 'NDJSON spine trace -> SVG canonical dashboard -> HTML scrub/edit replay -> federated NDJSON export'
    : mode === 'horiz'
      ? 'NDJSON horizontal integration trace -> SVG canonical dashboard -> HTML scrub/edit replay -> federated NDJSON export'
      : mode === 'vmbench'
        ? 'NDJSON vm benchmark trace -> SVG canonical dashboard -> HTML scrub/edit replay -> federated NDJSON export'
      : 'NDJSON benchmark trace -> SVG canonical dashboard -> HTML scrub/edit replay -> federated NDJSON export';

  ensureDir(outDir);

  if (!fs.existsSync(inNdjson)) {
    console.error(`missing input ndjson: ${inNdjson}`);
    process.exit(1);
  }

  const sourceBytes = fs.readFileSync(inNdjson);
  const sourceSha256 = sha256Bytes(sourceBytes);
  const events = readNdjson(inNdjson);
  const replayEvents = events.map((e, idx) => normalizeEvent(e, idx));

  const replayNdjsonPath = path.join(outDir, 'build-replay.ndjson');
  const replayNdjsonBytes = Buffer.from(replayEvents.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  fs.writeFileSync(replayNdjsonPath, replayNdjsonBytes);

  const patchPath = path.join(outDir, 'build-replay.patch.ndjson');
  if (!fs.existsSync(patchPath)) fs.writeFileSync(patchPath, '', 'utf8');

  const svgPath = path.join(outDir, 'build-replay.svg');
  const svgText = renderSvg(replayEvents, title, subtitle);
  fs.writeFileSync(svgPath, svgText, 'utf8');

  const kernelSrc = path.join(lgRoot, 'fano-garden-seed-kernel.svg');
  const kernelDst = path.join(outDir, 'fano-garden-seed-kernel.svg');
  if (fs.existsSync(kernelSrc)) fs.copyFileSync(kernelSrc, kernelDst);

  const mp4ScriptPath = path.join(outDir, 'export-mp4.sh');
  const mp4Script = `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
FRAMES_DIR="$ROOT/frames"
mkdir -p "$FRAMES_DIR"
echo "Generate PNG frames from build-replay.svg (requires rsvg-convert or inkscape)."
echo "Example with rsvg-convert:"
echo "  for i in $(seq -w 0 120); do rsvg-convert -w 1600 -h 540 \"$ROOT/build-replay.svg\" -o \"$FRAMES_DIR/frame_$i.png\"; done"
echo "Then render MP4:"
echo "  ffmpeg -y -r 8 -i \"$FRAMES_DIR/frame_%03d.png\" -c:v libx264 -pix_fmt yuv420p \"$ROOT/build-replay.mp4\""
`;
  writeExecutable(mp4ScriptPath, mp4Script);

  const openReplayPath = path.join(outDir, 'open-replay.sh');
  const openReplayScript = `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTML="$ROOT/build-replay.html"
if [ ! -f "$HTML" ]; then
  echo "missing replay html: $HTML" >&2
  exit 1
fi
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$HTML" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$HTML" >/dev/null 2>&1 || true
fi
echo "open: $HTML"
`;
  writeExecutable(openReplayPath, openReplayScript);

  const verifyPath = path.join(outDir, 'verify.sh');
  const verifyScript = `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$ROOT/build-replay-manifest.json"
if [ ! -f "$MANIFEST" ]; then
  echo "missing manifest: $MANIFEST" >&2
  exit 1
fi
node - "$ROOT" "$MANIFEST" <<'NODE'
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256File(p) {
  return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

const root = process.argv[2];
const manifestPath = process.argv[3];
const doc = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const outputs = doc.outputs && typeof doc.outputs === 'object' ? doc.outputs : {};

let failed = 0;
for (const [name, meta] of Object.entries(outputs)) {
  const p = path.join(root, name);
  const expected = String((meta && meta.sha256) || '');
  const scope = meta && typeof meta.sha256_scope === 'string' ? meta.sha256_scope : '';
  if (expected === 'sha256:pending') continue;
  if (name === 'build-replay-manifest.json' && scope === 'pre-self-entry') continue;
  if (!fs.existsSync(p)) {
    process.stdout.write('missing: ' + name + '\\n');
    failed += 1;
    continue;
  }
  const actual = sha256File(p);
  if (actual !== expected) {
    process.stdout.write('mismatch: ' + name + ' expected=' + expected + ' actual=' + actual + '\\n');
    failed += 1;
  }
}

// Optional: verify portal gate evidence when present.
const portalGatePath = path.join(root, 'portal-gate.json');
if (fs.existsSync(portalGatePath)) {
  try {
    const gate = JSON.parse(fs.readFileSync(portalGatePath, 'utf8'));
    if (gate.pass !== true) {
      process.stdout.write('portal-gate: pass=false\\n');
      failed += 1;
    }
    if (gate.digests && typeof gate.digests === 'object') {
      for (const [rel, expected] of Object.entries(gate.digests)) {
        if (typeof expected !== 'string' || !expected.startsWith('sha256:')) continue;
        const p = path.join(root, rel);
        if (!fs.existsSync(p)) {
          process.stdout.write('portal-gate missing: ' + rel + '\\n');
          failed += 1;
          continue;
        }
        const actual = sha256File(p);
        if (actual !== expected) {
          process.stdout.write('portal-gate mismatch: ' + rel + ' expected=' + expected + ' actual=' + actual + '\\n');
          failed += 1;
        }
      }
    }
  } catch (err) {
    process.stdout.write('portal-gate invalid json: ' + String(err && err.message ? err.message : err) + '\\n');
    failed += 1;
  }
}

if (failed) process.exit(1);
process.stdout.write('verified OK\\n');
NODE
`;
  writeExecutable(verifyPath, verifyScript);

  const restorePath = path.join(outDir, 'restore.sh');
  const restoreScript = `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
bash "$ROOT/verify.sh"
if [ -f "$ROOT/position.json" ]; then
  echo "position:"
  cat "$ROOT/position.json"
  if command -v jq >/dev/null 2>&1; then
    STEP="$(jq -r '.last_successful_step // "n/a"' "$ROOT/position.json")"
    REASON="$(jq -r '.hard_break_reason // "n/a"' "$ROOT/position.json")"
    echo "boundary: last_successful_step=$STEP hard_break_reason=$REASON"
  fi
fi
bash "$ROOT/open-replay.sh"
`;
  writeExecutable(restorePath, restoreScript);

  const consumePath = path.join(outDir, 'CONSUME.md');
  const consumeDoc = `# Consume Replay Bundle

1. Extract bundle: \`tar -xzf build-replay-federation.tgz\`
2. Verify artifacts: \`./verify.sh\`
3. Open viewer: \`./open-replay.sh\`
4. Patch overlay file: \`build-replay.patch.ndjson\`
5. Context files:
   - \`position.json\`: stop boundary and last successful step
   - \`catalog.json\`: horizontal repo inventory snapshot (when present)
   - \`probe.json\`: probe summary and per-repo evidence pointers (when present)
6. Portal attachments (when present):
   - \`portal-scene.json\`: immersive projection graph
   - \`portal-bridge.check.json\`: bridge evidence for scene linkage
   - \`portal-gate.json\`: fail-closed verification result (must have pass=true)
   - \`signatures.json\`: optional ECDSA attestations over evidence digests (when present)
   - \`portal-immersive.html\`: WebXR/A-Frame immersive portal entrypoint
   - \`portal-immersive.js\`: immersive portal runtime
7. Optional restore helper: \`./restore.sh\`
`;
  fs.writeFileSync(consumePath, consumeDoc, 'utf8');

  const federationScriptPath = path.join(outDir, 'export-federation-bundle.sh');
  const federationScript = `#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/build-replay-federation.tgz"
FILES=(
  "build-replay.ndjson"
  "build-replay.patch.ndjson"
  "build-replay.svg"
  "build-replay.html"
  "build-replay.canvas.json"
  "build-replay.canvasl"
  "build-replay.canvasl.check.json"
  "build-replay.canvasl.summary.json"
  "build-replay-manifest.json"
)
for opt in "build-replay-check.json" "capabilities.json" "index.json" "position.json" "catalog.json" "probe.json" "universe-manifest.json" "universe-check.json" "universe-run.ndjson" "portal-scene.json" "portal-bridge.check.json" "portal-gate.json" "portal-gate.ndjson" "portal-overlay.svg" "portal-immersive.html" "portal-immersive.js" "signatures.json" "waveform-points.txt" "waveform-summary.json" "waveform.check.json" "waveform-analysis.ndjson" "waveform.canvas.svg" "waveform.canisa.scene.json" "waveform.render.check.json" "waveform-render.ndjson" ".well-known/did.json" ".well-known/identities.json" "CONSUME.md" "open-replay.sh" "verify.sh" "restore.sh"; do
  if [ -f "$ROOT/$opt" ]; then
    FILES+=("$opt")
  fi
done
tar -czf "$OUT" -C "$ROOT" "\${FILES[@]}"
echo "federation bundle: $OUT"
`;
  writeExecutable(federationScriptPath, federationScript);

  const htmlPath = path.join(outDir, 'build-replay.html');
  writeHtml(htmlPath, {
    title,
    events: replayEvents,
    local_storage_key: `lg.replay.patch.${mode}.${sourceSha256}`,
    patch_export_name: `build-replay.patch.${mode}.ndjson`,
    hooks: {
      player_html: '../../../../interplanetary-demo/web/player.html',
      mp4_script: './export-mp4.sh',
      seed_kernel_svg: './fano-garden-seed-kernel.svg'
    }
  });

  const canvasPath = path.join(outDir, 'build-replay.canvas.json');
  emitCanvasFromEvents(replayEvents, canvasPath, mode, [
    { id: 'svg', path: 'build-replay.svg' },
    { id: 'html', path: 'build-replay.html' },
    { id: 'manifest', path: 'build-replay-manifest.json' },
    { id: 'consume', path: 'CONSUME.md' }
  ]);

  const canvasLPath = path.join(outDir, 'build-replay.canvasl');
  const canvasLCheckPath = path.join(outDir, 'build-replay.canvasl.check.json');
  const canvasLSummaryPath = path.join(outDir, 'build-replay.canvasl.summary.json');
  const canvasLEvents = replayEvents.map((e) => ({
    ...e,
    raw_digest: sha256Bytes(JSON.stringify(e)),
    line_number: Number(e.seq)
  }));
  const canvasLResult = emitCanvasLFromEvents(canvasLEvents, canvasLPath, mode, {
    inputSha: sourceSha256,
    sourceFile: path.relative(auditRoot, inNdjson),
    catalogPath: path.join(outDir, 'catalog.json'),
    probePath: path.join(outDir, 'probe.json'),
    positionPath: path.join(outDir, 'position.json'),
    evidenceRoot: process.env.CANVASL_EVIDENCE_ROOT || null,
    outDir
  });
  fs.writeFileSync(canvasLCheckPath, JSON.stringify({
    schema_version: 1,
    lane: mode,
    canvasl_path: path.relative(auditRoot, canvasLPath),
    ...canvasLResult.check
  }, null, 2) + '\n', 'utf8');
  fs.writeFileSync(canvasLSummaryPath, JSON.stringify(canvasLResult.summary, null, 2) + '\n', 'utf8');

  const manifest = {
    mode,
    source_ndjson: path.relative(auditRoot, inNdjson),
    source_sha256: sourceSha256,
    source_event_count: replayEvents.length,
    outputs: {
      'build-replay.ndjson': { path: path.relative(auditRoot, replayNdjsonPath), sha256: sha256File(replayNdjsonPath) },
      'build-replay.patch.ndjson': { path: path.relative(auditRoot, patchPath), sha256: sha256File(patchPath) },
      'build-replay.svg': { path: path.relative(auditRoot, svgPath), sha256: sha256File(svgPath) },
      'build-replay.html': { path: path.relative(auditRoot, htmlPath), sha256: sha256File(htmlPath) },
      'build-replay.canvas.json': { path: path.relative(auditRoot, canvasPath), sha256: sha256File(canvasPath) },
      'build-replay.canvasl': { path: path.relative(auditRoot, canvasLPath), sha256: sha256File(canvasLPath) },
      'build-replay.canvasl.check.json': { path: path.relative(auditRoot, canvasLCheckPath), sha256: sha256File(canvasLCheckPath) },
      'build-replay.canvasl.summary.json': { path: path.relative(auditRoot, canvasLSummaryPath), sha256: sha256File(canvasLSummaryPath) },
      'CONSUME.md': { path: path.relative(auditRoot, consumePath), sha256: sha256File(consumePath) },
      'open-replay.sh': { path: path.relative(auditRoot, openReplayPath), sha256: sha256File(openReplayPath) },
      'verify.sh': { path: path.relative(auditRoot, verifyPath), sha256: sha256File(verifyPath) },
      'restore.sh': { path: path.relative(auditRoot, restorePath), sha256: sha256File(restorePath) },
      'fano-garden-seed-kernel.svg': fs.existsSync(kernelDst)
        ? { path: path.relative(auditRoot, kernelDst), sha256: sha256File(kernelDst) }
        : { path: path.relative(auditRoot, kernelDst), sha256: 'sha256:missing' },
      'export-mp4.sh': { path: path.relative(auditRoot, mp4ScriptPath), sha256: sha256File(mp4ScriptPath) },
      'export-federation-bundle.sh': { path: path.relative(auditRoot, federationScriptPath), sha256: sha256File(federationScriptPath) },
      'build-replay-manifest.json': {
        path: path.relative(auditRoot, path.join(outDir, 'build-replay-manifest.json')),
        sha256: 'sha256:pending'
      }
    },
    projection_targets: {
      implemented: ['2d-svg-dashboard', 'html-scrub-replay', 'json-canvas-projection', 'canvasl-projection', 'html-patch-overlay-edit', 'ndjson-replay', 'ndjson-patch-export-import', 'mp4-export-hook'],
      adapter_ready: ['3d-replay-adapter', 'ar-replay-adapter', 'vr-replay-adapter', 'federated-sync-adapter']
    }
  };

  const manifestPath = path.join(outDir, 'build-replay-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  manifest.outputs['build-replay-manifest.json'].sha256 = sha256File(manifestPath);
  manifest.outputs['build-replay-manifest.json'].sha256_scope = 'pre-self-entry';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`build replay written: ${path.relative(lgRoot, outDir)}`);
  console.log(`open: ${path.relative(lgRoot, htmlPath)}`);
}

main();
