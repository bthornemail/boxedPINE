#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

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
  return `sha256:${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function defaultOut(mode) {
  if (mode === 'spine') return 'results/bench/replay/spine/latest';
  if (mode === 'horiz') return 'results/bench/replay/horiz/latest';
  return 'results/bench/replay/latest';
}

function runReplay(mode, input, out) {
  const scriptPath = path.join(auditRoot, 'scripts', 'render-build-replay.js');
  const args = [scriptPath, '--mode', mode, '--out', out];
  if (input) args.push('--input', input);
  const p = spawnSync('node', args, { cwd: auditRoot, encoding: 'utf8' });
  if (p.status !== 0) {
    process.stderr.write(p.stdout || '');
    process.stderr.write(p.stderr || '');
    process.exit(p.status || 1);
  }
}

function main() {
  const args = parseArgs(process.argv);
  const mode = String(args.mode || 'bench');
  const input = args.input ? String(args.input) : null;
  const out = String(args.out || defaultOut(mode));
  const outAbs = path.resolve(auditRoot, out);

  runReplay(mode, input, outAbs);
  const run1 = {
    canvas_json_sha256: sha256File(path.join(outAbs, 'build-replay.canvas.json')),
    canvasl_sha256: sha256File(path.join(outAbs, 'build-replay.canvasl')),
    canvasl_summary_sha256: sha256File(path.join(outAbs, 'build-replay.canvasl.summary.json'))
  };
  runReplay(mode, input, outAbs);
  const run2 = {
    canvas_json_sha256: sha256File(path.join(outAbs, 'build-replay.canvas.json')),
    canvasl_sha256: sha256File(path.join(outAbs, 'build-replay.canvasl')),
    canvasl_summary_sha256: sha256File(path.join(outAbs, 'build-replay.canvasl.summary.json'))
  };

  const ok = run1.canvas_json_sha256 === run2.canvas_json_sha256 &&
    run1.canvasl_sha256 === run2.canvasl_sha256 &&
    run1.canvasl_summary_sha256 === run2.canvasl_summary_sha256;
  const doc = {
    schema_version: 1,
    mode,
    out: path.relative(auditRoot, outAbs),
    deterministic: ok,
    run1,
    run2
  };
  process.stdout.write(JSON.stringify(doc, null, 2) + '\n');
  if (!ok) process.exit(1);
}

main();
