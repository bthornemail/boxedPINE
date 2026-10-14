#!/usr/bin/env node
/**
 * agent-probe.js
 *
 * Read-only system probe that emits NDJSON (canon-safe) and writes into the served
 * universe replay directory (projection-safe).
 *
 * Personas (agent_id) are labels here; no private keys are used in this probe.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

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

function sha256Text(s) {
  return `sha256:${crypto.createHash('sha256').update(String(s), 'utf8').digest('hex')}`;
}

function nowIso() {
  // Probe is not determinism-gated; this is operational telemetry.
  return new Date().toISOString();
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  return {
    ok: res.status === 0,
    status: res.status,
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || '').trim()
  };
}

function readJsonSafe(p) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(p, 'utf8')) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function fileExists(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function main() {
  const args = parseArgs(process.argv);
  const agentId = String(args.agent || args['agent-id'] || 'solon');
  const intervalTag = String(args.interval || 'periodic');

  const auditRoot = path.resolve(__dirname, '..');
  const replayDir = path.resolve(
    auditRoot,
    String(args['replay-dir'] || 'results/bench/replay/universe/latest')
  );
  fs.mkdirSync(replayDir, { recursive: true });

  const outNdjson = path.resolve(replayDir, String(args.out || `agent-probe.${agentId}.ndjson`));
  const outJson = path.resolve(replayDir, String(args['out-json'] || `agent-probe.${agentId}.json`));

  const events = [];
  let seq = 1;
  const emit = (event, payload) => events.push({ seq: seq++, timestamp: nowIso(), agent_id: agentId, event, payload });

  emit('agent.probe.start', { interval: intervalTag, host: os.hostname(), replay_dir: replayDir });

  // Basic system snapshot
  emit('agent.probe.system', {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    uptime_s: Math.round(os.uptime()),
    loadavg: os.loadavg(),
    mem: { total: os.totalmem(), free: os.freemem() },
    cpus: os.cpus().length
  });

  // Service checks
  const nginx = run('systemctl', ['is-active', 'nginx'], '/');
  emit('agent.probe.service', { name: 'nginx', active: nginx.ok, status: nginx.stdout || nginx.stderr || String(nginx.status) });

  // Universe artifacts presence
  const required = [
    'portal.html',
    'universe-loader.js',
    'portal-immersive.html',
    'portal-immersive.js',
    'build-replay.html',
    'build-replay.svg',
    'build-replay.ndjson',
    'portal-gate.json',
    'portal-scene.json',
    '.well-known/did.json',
    '.well-known/identities.json'
  ];
  const present = {};
  for (const rel of required) {
    const abs = rel.startsWith('.well-known/')
      ? (process.env.LG_WELL_KNOWN_DIR
          ? path.resolve(String(process.env.LG_WELL_KNOWN_DIR), rel.replace('.well-known/', ''))
          : path.resolve(auditRoot, 'well-known', rel.replace('.well-known/', '')))
      : path.join(replayDir, rel);
    present[rel] = fileExists(abs);
  }
  emit('agent.probe.artifacts', { required, present });

  // Gate status (read-only)
  const gatePath = path.join(replayDir, 'portal-gate.json');
  const gate = readJsonSafe(gatePath);
  if (gate.ok) {
    emit('agent.probe.portal_gate', {
      pass: gate.value && gate.value.pass === true,
      optional_bridge_validated: Boolean(gate.value && gate.value.optional_bridge_validated),
      failures: (gate.value && gate.value.failures) || []
    });
  } else {
    emit('agent.probe.portal_gate', { ok: false, error: gate.error });
  }

  emit('agent.probe.end', { ok: true });

  fs.writeFileSync(outNdjson, `${events.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8');
  const summary = {
    schema_version: 1,
    kind: 'agent-probe',
    agent_id: agentId,
    timestamp: nowIso(),
    ndjson: { path: path.basename(outNdjson), sha256: sha256Text(fs.readFileSync(outNdjson, 'utf8')) }
  };
  fs.writeFileSync(outJson, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  process.stdout.write(JSON.stringify({ ok: true, agent_id: agentId, ndjson: outNdjson, json: outJson }) + '\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}
