#!/usr/bin/env node
/**
 * test-waveform-lane.js
 *
 * Lightweight contract test for the waveform lane runner.
 *
 * This test intentionally runs with `--allow-cabal false` so it never triggers
 * Haskell builds in CI. It verifies artifact shape + exit-code behavior.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const scriptsDir = __dirname;
  const runner = path.join(scriptsDir, 'run-waveform-analysis.js');
  assert(fs.existsSync(runner), `missing runner: ${runner}`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-waveform-test-'));
  const inNdjson = path.join(tmp, 'input.ndjson');
  fs.writeFileSync(
    inNdjson,
    [
      JSON.stringify({ seq: 1, event: 'run.start', payload: { a: 1 } }),
      JSON.stringify({ seq: 2, event: 'vm.bench.start', payload: { b: 2 } }),
      JSON.stringify({ seq: 3, event: 'run.end', payload: { c: 3 } })
    ].join('\n') + '\n',
    'utf8'
  );

  function runOnce(requireFlag) {
    return spawnSync(process.execPath, [runner, '--in', inNdjson, '--out-dir', tmp, '--allow-cabal', 'false', '--require', requireFlag], {
      encoding: 'utf8'
    });
  }

  // Optional mode: should exit 0 even when waveform-analyze is missing.
  const opt = runOnce('false');
  assert(opt.status === 0, `expected optional exit 0, got ${opt.status}\n${opt.stderr || ''}`);

  const analysis = path.join(tmp, 'waveform-analysis.ndjson');
  const check = path.join(tmp, 'waveform.check.json');
  const summary = path.join(tmp, 'waveform-summary.json');
  const points = path.join(tmp, 'waveform-points.txt');
  assert(fs.existsSync(analysis), 'missing waveform-analysis.ndjson');
  assert(fs.existsSync(check), 'missing waveform.check.json');
  assert(fs.existsSync(summary), 'missing waveform-summary.json');
  assert(fs.existsSync(points), 'missing waveform-points.txt');

  const checkJson = readJson(check);
  assert(checkJson.schema_version === 1, 'waveform.check.json schema_version mismatch');
  assert(checkJson.kind === 'waveform.check', 'waveform.check.json kind mismatch');
  assert(checkJson.lane_id === 'waveform', 'waveform.check.json lane_id mismatch');
  assert(typeof checkJson.run_id === 'string' && checkJson.run_id.startsWith('sha256:'), 'waveform.check.json run_id missing');
  assert(checkJson.config && typeof checkJson.config.max_points === 'number', 'waveform.check.json config missing');
  assert(checkJson.tool && typeof checkJson.tool.kind === 'string', 'waveform.check.json tool missing');

  const firstLine = fs.readFileSync(analysis, 'utf8').split('\n').filter(Boolean)[0];
  const firstObj = JSON.parse(firstLine);
  assert(firstObj.lane === 'waveform', 'waveform-analysis.ndjson missing lane');
  assert(firstObj.run_id === checkJson.run_id, 'waveform-analysis.ndjson run_id mismatch');

  // Determinism: run optional mode twice and ensure artifacts are identical.
  const opt2 = runOnce('false');
  assert(opt2.status === 0, `expected optional exit 0 (second run), got ${opt2.status}\n${opt2.stderr || ''}`);
  const checkJson2 = readJson(check);
  assert(checkJson2.run_id === checkJson.run_id, 'waveform.check.json run_id changed across runs');
  assert(
    checkJson2.outputs['waveform-analysis.ndjson'].sha256 === checkJson.outputs['waveform-analysis.ndjson'].sha256,
    'waveform-analysis.ndjson sha changed across runs'
  );

  // Required mode: must exit non-zero when waveform-analyze is missing.
  const req = runOnce('true');
  assert(req.status !== 0, 'expected required mode to fail (non-zero exit)');

  process.stdout.write(JSON.stringify({ ok: true, tmp }) + '\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(1);
}
