#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureDir } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');

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

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function fileInfo(baseDir, relPath) {
  const abs = path.join(baseDir, relPath);
  if (!fs.existsSync(abs)) {
    return { path: relPath, exists: false, sha256: 'sha256:missing', bytes: 0 };
  }
  const st = fs.statSync(abs);
  return { path: relPath, exists: true, sha256: sha256File(abs), bytes: st.size };
}

function main() {
  const args = parseArgs(process.argv);
  const lane = String(args.lane || 'bench');
  const replayDir = path.resolve(auditRoot, args.dir || `results/bench/replay/${lane === 'spine' ? 'spine/latest' : 'latest'}`);
  const outPath = path.resolve(auditRoot, args.out || path.join(path.relative(auditRoot, replayDir), 'index.json'));

  const checkPath = path.join(replayDir, 'build-replay-check.json');
  let check = null;
  if (fs.existsSync(checkPath)) {
    try {
      check = JSON.parse(fs.readFileSync(checkPath, 'utf8'));
    } catch (_) {
      check = null;
    }
  }

  const doc = {
    schema_version: 1,
    lane,
    run: {
      github_run_id: process.env.GITHUB_RUN_ID || null,
      github_run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
      github_sha: process.env.GITHUB_SHA || null,
      github_ref: process.env.GITHUB_REF || null
    },
    artifacts: {
      bundle: fileInfo(replayDir, 'build-replay-federation.tgz'),
      check: fileInfo(replayDir, 'build-replay-check.json'),
      canvas: fileInfo(replayDir, 'build-replay.canvas.json'),
      canvasl: fileInfo(replayDir, 'build-replay.canvasl'),
      canvasl_check: fileInfo(replayDir, 'build-replay.canvasl.check.json'),
      canvasl_summary: fileInfo(replayDir, 'build-replay.canvasl.summary.json'),
      manifest: fileInfo(replayDir, 'build-replay-manifest.json'),
      capabilities: fileInfo(replayDir, 'capabilities.json'),
      universe_manifest: fileInfo(replayDir, 'universe-manifest.json'),
      universe_check: fileInfo(replayDir, 'universe-check.json'),
      universe_run: fileInfo(replayDir, 'universe-run.ndjson'),
      portal_scene: fileInfo(replayDir, 'portal-scene.json'),
      portal_bridge_check: fileInfo(replayDir, 'portal-bridge.check.json'),
      portal_gate_json: fileInfo(replayDir, 'portal-gate.json'),
      portal_gate_ndjson: fileInfo(replayDir, 'portal-gate.ndjson'),
      portal_overlay_svg: fileInfo(replayDir, 'portal-overlay.svg')
    },
    digests: check
      ? {
          canon_sha256: check.canon_sha256 || null,
          patch_sha256: check.patch_sha256 || null,
          patched_sha256: check.patched_sha256 || null,
          patch_ops_applied: check.patch_ops_applied
        }
      : null,
    verified: Boolean(check && check.canon_sha256 && check.patch_sha256 && check.patched_sha256)
  };

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(path.relative(auditRoot, outPath));
}

main();
