#!/usr/bin/env node
/**
 * render-waveform.js
 *
 * Deterministic renderer for waveform lane artifacts.
 *
 * Inputs:
 * - waveform.check.json (preferred)
 * - waveform-points.txt (required)
 *
 * Outputs (projection-only, in out-dir):
 * - waveform.canvas.svg
 * - waveform.canisa.scene.json
 * - waveform.render.check.json
 * - waveform-render.ndjson
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureDir, writeJson, writeNdjson } = require('./lib.js');

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

function sha256File(p) {
  return sha256Bytes(fs.readFileSync(p));
}

function sha256Text(text) {
  return sha256Bytes(Buffer.from(String(text), 'utf8'));
}

function stableFloat(x) {
  if (!Number.isFinite(x)) return '0.00000000';
  return Number(x).toFixed(8);
}

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function readPoints(pointsPath) {
  const rows = [];
  const lines = fs.readFileSync(pointsPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    const z = parts.length >= 3 ? Number(parts[2]) : 0;
    rows.push([clamp01(x), clamp01(y), clamp01(z)]);
  }
  return rows;
}

function rgbFromUnit(u) {
  // Deterministic pseudo-gradient (blue -> teal -> orange).
  const t = clamp01(u);
  const r = Math.round(255 * Math.min(1, Math.max(0, (t - 0.5) * 2)));
  const g = Math.round(255 * Math.min(1, Math.max(0, 1 - Math.abs(t - 0.5) * 2)));
  const b = Math.round(255 * Math.min(1, Math.max(0, (0.5 - t) * 2)));
  return `rgb(${r},${g},${b})`;
}

function buildSvg(points, cfg) {
  const width = cfg.width;
  const height = cfg.height;
  const pad = cfg.pad;
  const r = cfg.radius;
  const x0 = pad;
  const y0 = pad;
  const w = Math.max(1, width - pad * 2);
  const h = Math.max(1, height - pad * 2);

  const circles = points
    .map((p) => {
      const x = x0 + p[0] * w;
      const y = y0 + (1 - p[2]) * h; // use z as vertical for visible structure
      const fill = rgbFromUnit(p[1]);
      return `<circle cx="${stableFloat(x)}" cy="${stableFloat(y)}" r="${stableFloat(r)}" fill="${fill}" fill-opacity="0.85" />`;
    })
    .join('');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect x="0" y="0" width="${width}" height="${height}" fill="white" />`,
    `<g>${circles}</g>`,
    `</svg>`,
    ``
  ].join('\n');
}

function deterministicIso(seq) {
  return `1970-01-01T00:00:${String(seq % 60).padStart(2, '0')}Z`;
}

function main() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(String(args['out-dir'] || args.out || '.'));
  ensureDir(outDir);

  const events = [];
  let seq = 1;
  function emit(event, payload) {
    const s = seq++;
    events.push({ seq: s, timestamp: deterministicIso(s), lane: 'waveform', event, payload });
  }

 const wfCheckRel = String(args.check || 'waveform.check.json');
  const wfAnalysisRel = String(args.analysis || 'waveform-analysis.ndjson');
  const wfPointsRel = String(args.points || 'waveform-points.txt');
  const wfCheckPath = path.resolve(outDir, wfCheckRel);
  const wfAnalysisPath = path.resolve(outDir, wfAnalysisRel);
  const wfPointsPath = path.resolve(outDir, wfPointsRel);

  if (!fs.existsSync(wfPointsPath)) throw new Error(`missing_points:${wfPointsPath}`);

  const analysisExists = fs.existsSync(wfAnalysisPath);
  const analysisSha = analysisExists ? sha256File(wfAnalysisPath) : null;
  emit('waveform.render.analysis', { path: path.basename(wfAnalysisPath), exists: analysisExists, sha256: analysisSha });

  let wfCheck = null;
  if (fs.existsSync(wfCheckPath)) {
    try {
      wfCheck = JSON.parse(fs.readFileSync(wfCheckPath, 'utf8'));
    } catch {
      wfCheck = null;
    }
  }

  const points = readPoints(wfPointsPath);
  emit('waveform.render.points.read', { path: path.basename(wfPointsPath), points: points.length });

  const renderCfg = {
    width: Number(args.width || 1200),
    height: Number(args.height || 680),
    pad: Number(args.pad || 24),
    radius: Number(args.radius || 2.0)
  };

  const renderRunId = sha256Text(
    [
      'waveform.render.v1',
      `points_sha256=${sha256File(wfPointsPath)}`,
      `analysis_sha256=${analysisSha || ''}`,
      `check_sha256=${fs.existsSync(wfCheckPath) ? sha256File(wfCheckPath) : ''}`,
      `cfg=${JSON.stringify(renderCfg)}`
    ].join('\n')
  );

  const svgText = buildSvg(points, renderCfg);
  const svgPath = path.join(outDir, String(args.svg || 'waveform.canvas.svg'));
  fs.writeFileSync(svgPath, svgText, 'utf8');
  emit('waveform.render.svg', { path: path.basename(svgPath), sha256: sha256Text(svgText) });

  const scene = {
    schema_version: 1,
    kind: 'waveform.canisa.scene',
    generated_at: deterministicIso(0),
    lane_id: 'waveform',
    run_id: renderRunId,
    waveform_run_id: wfCheck && typeof wfCheck.run_id === 'string' ? wfCheck.run_id : null,
    inputs: {
      'waveform-points.txt': { path: path.basename(wfPointsPath), sha256: sha256File(wfPointsPath) },
      'waveform.check.json': wfCheckPath && fs.existsSync(wfCheckPath) ? { path: path.basename(wfCheckPath), sha256: sha256File(wfCheckPath) } : null
    },
    config: renderCfg,
    entities: points.map((p, i) => ({
      id: `wf:${i + 1}`,
      kind: 'waveform.point',
      position: { x: p[0], y: p[2], z: p[1] },
      color: rgbFromUnit(p[1])
    }))
  };

  const scenePath = path.join(outDir, String(args.scene || 'waveform.canisa.scene.json'));
  writeJson(scenePath, scene);
  emit('waveform.render.scene', { path: path.basename(scenePath), sha256: sha256File(scenePath), entities: points.length });

  const renderCheck = {
    schema_version: 1,
    kind: 'waveform.render.check',
    pass: true,
    generated_at: deterministicIso(0),
    lane_id: 'waveform',
    run_id: renderRunId,
    inputs: {
      points_sha256: sha256File(wfPointsPath),
      waveform_analysis_sha256: analysisSha,
      waveform_check_sha256: fs.existsSync(wfCheckPath) ? sha256File(wfCheckPath) : null
    },
    outputs: {
      'waveform.canvas.svg': { path: path.basename(svgPath), sha256: sha256File(svgPath) },
      'waveform.canisa.scene.json': { path: path.basename(scenePath), sha256: sha256File(scenePath) }
    },
    config: renderCfg
  };

  const renderCheckPath = path.join(outDir, String(args['render-check'] || 'waveform.render.check.json'));
  writeJson(renderCheckPath, renderCheck);
  emit('waveform.render.check', { path: path.basename(renderCheckPath), sha256: sha256File(renderCheckPath) });

  const renderNdjsonPath = path.join(outDir, String(args['ndjson-out'] || 'waveform-render.ndjson'));
  writeNdjson(renderNdjsonPath, events);

  process.stdout.write(JSON.stringify({ ok: true, out_dir: outDir, run_id: renderRunId, svg: svgPath, scene: scenePath, check: renderCheckPath }) + '\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}
