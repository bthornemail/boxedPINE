#!/usr/bin/env node
/**
 * run-waveform-analysis.js
 *
 * Projection-only waveform lane:
 * - consumes an NDJSON stream (typically build-replay.ndjson)
 * - deterministically projects events into a bounded point cloud
 * - runs waveform-core's `waveform-analyze json-out` (if available)
 * - emits stable artifacts next to the bundle:
 *     waveform-points.txt
 *     waveform-summary.json
 *     waveform.check.json
 *     waveform-analysis.ndjson
 *
 * This does not modify canon. It can be made non-gating (default) or fail-closed
 * via --require true.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ensureDir, writeJson, writeNdjson } = require('./lib.js');

const LANE_ID = 'waveform';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}

function sha256Bytes(buf) {
  return `sha256:${crypto.createHash('sha256').update(buf).digest('hex')}`;
}

function sha256Text(text) {
  return sha256Bytes(Buffer.from(String(text), 'utf8'));
}

function sha256File(p) {
  return sha256Bytes(fs.readFileSync(p));
}

function u32FromSha256(text) {
  const h = crypto.createHash('sha256').update(String(text), 'utf8').digest();
  return h.readUInt32BE(0) >>> 0;
}

function which(cmd) {
  const res = spawnSync('bash', ['-lc', `command -v ${cmd} >/dev/null 2>&1 && echo yes || echo no`], {
    encoding: 'utf8'
  });
  return (res.stdout || '').trim() === 'yes';
}

function whichPath(cmd) {
  const res = spawnSync('bash', ['-lc', `command -v ${cmd} 2>/dev/null || true`], { encoding: 'utf8' });
  const p = (res.stdout || '').trim();
  return p ? p : null;
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return {
    ok: res.status === 0,
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || ''
  };
}

function stableFloat(x) {
  // Fixed rounding to reduce formatting drift.
  if (!Number.isFinite(x)) return '0.00000000';
  return Number(x).toFixed(8);
}

function readNdjsonLines(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function deterministicIso(seq) {
  return `1970-01-01T00:00:${String(seq % 60).padStart(2, '0')}Z`;
}

function main() {
  const args = parseArgs(process.argv);
  const requireOk = String(args.require || '').toLowerCase() === 'true';
  const allowCabal = String(args['allow-cabal'] || '').toLowerCase() === 'true';
  const maxPointsRaw = args['max-points'] || process.env.LG_WAVEFORM_MAX_POINTS || '150';
  const maxPoints = Math.max(10, Math.min(1000, Number(maxPointsRaw) || 150));
  const timeoutMsRaw = args.timeout || process.env.LG_WAVEFORM_TIMEOUT_MS || '30000';
  const timeoutMs = Math.max(1000, Math.min(300000, Number(timeoutMsRaw) || 30000));

  const inNdjson = path.resolve(String(args.in || args.ndjson || ''));
  if (!inNdjson) throw new Error('missing --in <ndjson>');
  if (!fs.existsSync(inNdjson)) throw new Error(`missing_input:${inNdjson}`);

  const outDir = path.resolve(String(args['out-dir'] || args.out || path.dirname(inNdjson)));
  ensureDir(outDir);

  const pointsPath = path.join(outDir, String(args.points || 'waveform-points.txt'));
  const summaryPath = path.join(outDir, String(args.summary || 'waveform-summary.json'));
  const checkPath = path.join(outDir, String(args.check || 'waveform.check.json'));
  const ndjsonOutPath = path.join(outDir, String(args['ndjson-out'] || 'waveform-analysis.ndjson'));

  const events = [];
  const inputSha = sha256File(inNdjson);
  const runId = sha256Text(
    [
      'waveform.run.v1',
      `lane=${LANE_ID}`,
      `ndjson_sha256=${inputSha}`,
      `max_points=${maxPoints}`,
      `timeout_ms=${timeoutMs}`,
      `allow_cabal=${allowCabal}`
    ].join('\n')
  );
  let seq = 1;
  function emit(event, payload) {
    const s = seq++;
    events.push({ seq: s, timestamp: deterministicIso(s), lane: LANE_ID, run_id: runId, event, payload });
  }

  emit('waveform.analysis.start', { in: inNdjson, sha256: inputSha, out_dir: outDir });

  const lines = readNdjsonLines(inNdjson);
  const parsed = [];
  let maxSeq = 1;
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    let obj = null;
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      emit('waveform.ndjson.parse_error', { line: i + 1, error: String(err && err.message ? err.message : err) });
      continue;
    }
    const s = Number(obj.seq);
    if (Number.isFinite(s) && s > maxSeq) maxSeq = s;
    parsed.push({ raw, obj });
  }

  // Deterministic point cloud projection:
  // x = seq normalized to [0,1]
  // y = hash(eventName)/2^32
  // z = min(1, jsonLineBytes/16384)
  const allRows = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const { raw, obj } = parsed[i];
    const s = Number.isFinite(Number(obj.seq)) ? Number(obj.seq) : i + 1;
    const eventName = obj.event || obj.k || obj.type || 'unknown.event';
    const x = maxSeq > 0 ? Math.max(0, Math.min(1, s / maxSeq)) : 0;
    const y = u32FromSha256(eventName) / 4294967296; // 2^32
    const bytes = Buffer.byteLength(raw, 'utf8');
    const z = Math.max(0, Math.min(1, bytes / 16384));
    allRows.push([x, y, z]);
  }

  // Bound point count deterministically to avoid O(n^3) blowups in Rips persistence.
  const rows = [];
  if (allRows.length <= maxPoints) {
    rows.push(...allRows);
  } else {
    // Evenly-spaced deterministic subsample including endpoints.
    const n = allRows.length;
    const k = maxPoints;
    for (let i = 0; i < k; i += 1) {
      const idx = Math.floor((i * (n - 1)) / (k - 1));
      rows.push(allRows[idx]);
    }
  }

  const pointsText = rows.map((r) => `${stableFloat(r[0])} ${stableFloat(r[1])} ${stableFloat(r[2])}`).join('\n') + '\n';
  fs.writeFileSync(pointsPath, pointsText, 'utf8');
  const pointsSha = sha256File(pointsPath);
  emit('waveform.points.written', { path: pointsPath, sha256: pointsSha, points: rows.length, dim: 3, max_points: maxPoints });

  // Try to run waveform-analyze.
  const waveformCoreDir = args['waveform-core-dir']
    ? path.resolve(String(args['waveform-core-dir']))
    : path.resolve(__dirname, '..', '..', '..', 'waveform-core');

  const haveWaveformAnalyze = which('waveform-analyze');
  const haveCabal = which('cabal');
  let tool = null;
  let toolRes = null;

  if (haveWaveformAnalyze) {
    tool = {
      kind: 'path',
      cmd: 'waveform-analyze',
      binary_path: whichPath('waveform-analyze'),
      args: ['json-out', pointsPath]
    };
    if (tool.binary_path && fs.existsSync(tool.binary_path)) {
      tool.binary_sha256 = sha256File(tool.binary_path);
    }
    toolRes = run(tool.cmd, tool.args, { timeout: timeoutMs });
  } else if (allowCabal && haveCabal && fs.existsSync(waveformCoreDir)) {
    // Run via cabal in waveform-core repo.
    const bashCmd = `cd ${JSON.stringify(waveformCoreDir)} && cabal run -v0 waveform-analyze -- json-out ${JSON.stringify(pointsPath)}`;
    tool = { kind: 'cabal', cmd: 'bash', args: ['-lc', bashCmd], cwd: waveformCoreDir };
    toolRes = run(tool.cmd, tool.args, { cwd: waveformCoreDir, timeout: timeoutMs });
  } else {
    tool = { kind: 'missing', note: allowCabal ? 'waveform-analyze not available (install binary or cabal)' : 'waveform-analyze not available (install binary; cabal disabled)' };
    toolRes = { ok: false, status: 127, stdout: '', stderr: tool.note };
  }

  const summary = {
    schema_version: 1,
    kind: 'waveform-summary',
    lane_id: LANE_ID,
    run_id: runId,
    generated_at: deterministicIso(0),
    input: {
      ndjson: { path: inNdjson, sha256: inputSha, lines: lines.length },
      points: { path: pointsPath, sha256: pointsSha, points: rows.length, dim: 3 }
    },
    config: {
      max_points: maxPoints,
      timeout_ms: timeoutMs,
      allow_cabal: allowCabal
    },
    tool,
    result: null
  };

  let pass = false;
  let failures = [];

  if (toolRes && toolRes.ok) {
    try {
      summary.result = JSON.parse(String(toolRes.stdout || '').trim());
      pass = true;
      emit('waveform.analyze.ok', { tool: tool.kind, stdout_sha256: sha256Bytes(Buffer.from(toolRes.stdout, 'utf8')) });
    } catch (err) {
      failures.push('waveform-analyze output was not valid JSON');
      emit('waveform.analyze.json_error', { error: String(err && err.message ? err.message : err) });
    }
  } else {
    failures.push('waveform-analyze failed or unavailable');
    emit('waveform.analyze.fail', {
      tool: tool && tool.kind ? tool.kind : 'unknown',
      status: toolRes ? toolRes.status : null,
      stderr: toolRes ? String(toolRes.stderr || '').slice(0, 4000) : ''
    });
  }

  writeJson(summaryPath, summary);
  const summarySha = sha256File(summaryPath);
  writeNdjson(ndjsonOutPath, events);
  const analysisSha = sha256File(ndjsonOutPath);

  const check = {
    schema_version: 1,
    kind: 'waveform.check',
    lane_id: LANE_ID,
    run_id: runId,
    pass,
    generated_at: deterministicIso(0),
    config: {
      max_points: maxPoints,
      timeout_ms: timeoutMs,
      allow_cabal: allowCabal
    },
    inputs: {
      ndjson_sha256: inputSha,
      points_sha256: pointsSha
    },
    outputs: {
      'waveform-summary.json': { path: path.basename(summaryPath), sha256: summarySha },
      'waveform-points.txt': { path: path.basename(pointsPath), sha256: pointsSha },
      'waveform-analysis.ndjson': { path: path.basename(ndjsonOutPath), sha256: analysisSha }
    },
    tool,
    failures
  };

  writeJson(checkPath, check);

  process.stdout.write(JSON.stringify({ pass, out_dir: outDir, summary: summaryPath, check: checkPath }) + '\n');
  if (!pass && requireOk) process.exit(2);
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}
