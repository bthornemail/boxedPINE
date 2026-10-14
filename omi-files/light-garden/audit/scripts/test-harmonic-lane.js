#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function runNode(args, cwd) {
  return spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
}

function main() {
  const auditRoot = path.resolve(__dirname, '..');
  const runner = path.join(__dirname, 'run-harmonic-lane.js');
  const validator = path.join(__dirname, 'validate-harmonic-artifact.js');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-harmonic-test-'));
  const ndjson = path.join(tmp, 'input.ndjson');
  const wf = path.join(tmp, 'waveform.check.json');

  fs.writeFileSync(
    ndjson,
    [
      JSON.stringify({ seq: 1, event: 'sensor.sample', payload: { channel: 'R', value: 12 } }),
      JSON.stringify({ seq: 2, event: 'sensor.sample', payload: { channel: 'G', value: 22 } }),
      JSON.stringify({ seq: 3, event: 'space.occupancy', payload: { occupied: true } })
    ].join('\n') + '\n',
    'utf8'
  );
  fs.writeFileSync(wf, JSON.stringify({ kind: 'waveform.check', pass: true }, null, 2) + '\n', 'utf8');

  const run1 = runNode([runner, '--in', ndjson, '--waveform-check', wf, '--out-dir', tmp, '--led-count', '7', '--emit-mask', 'true'], auditRoot);
  assert(run1.status === 0, `runner failed: ${run1.stderr || run1.stdout}`);

  for (const file of ['harmonic_id.v0.json', 'dome_frame.v0.json', 'talisman_mask.v0.json', 'harmonic_receipt.v0.json', 'harmonic_lane.report.v0.json']) {
    const p = path.join(tmp, file);
    assert(fs.existsSync(p), `missing output: ${file}`);
    const val = runNode([validator, '--in', p], auditRoot);
    assert(val.status === 0, `validator failed for ${file}: ${val.stderr || val.stdout}`);
  }

  const before = fs.readFileSync(path.join(tmp, 'harmonic_lane.report.v0.json'), 'utf8');
  const run2 = runNode([runner, '--in', ndjson, '--waveform-check', wf, '--out-dir', tmp, '--led-count', '7', '--emit-mask', 'true'], auditRoot);
  assert(run2.status === 0, `runner second pass failed: ${run2.stderr || run2.stdout}`);
  const after = fs.readFileSync(path.join(tmp, 'harmonic_lane.report.v0.json'), 'utf8');
  assert(before === after, 'determinism_failed: report bytes changed across same input');

  process.stdout.write(JSON.stringify({ ok: true, tmp }) + '\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(1);
}
