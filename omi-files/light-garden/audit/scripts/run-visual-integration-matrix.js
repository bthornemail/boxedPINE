#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ensureDir, now } = require('./lib');
const { listAdapters } = require('./adapter-registry');

const auditRoot = path.resolve(__dirname, '..');
const replayLatest = path.join(auditRoot, 'results', 'bench', 'replay', 'latest');

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
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath);
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function appendEvent(pathOut, event, payload) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), event, payload }) + '\n';
  fs.appendFileSync(pathOut, line, 'utf8');
}

function writePosition(positionPath, state) {
  fs.writeFileSync(positionPath, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function runCapability(capability) {
  const cmd = process.execPath;
  const tool = path.join(auditRoot, 'features', 'tools', `${capability.capability}-tool.js`);
  const start = now();
  const p = spawnSync(cmd, [tool, 'test'], {
    cwd: auditRoot,
    encoding: 'utf8',
    env: process.env
  });
  const end = now();
  return {
    wall_ms: end - start,
    exit: p.status ?? 1,
    stdout: p.stdout || '',
    stderr: p.stderr || '',
    command: `node features/tools/${capability.capability}-tool.js test`
  };
}

function checkHttp(url) {
  const p = spawnSync('curl', ['-fsS', '--max-time', '1', url], {
    cwd: auditRoot,
    encoding: 'utf8',
    env: process.env
  });
  return p.status === 0;
}

function nodeAvailabilityMap() {
  return {
    'wordnet-service': {
      available: checkHttp('http://127.0.0.1:4096/api/wordnet/lookup?word=wisdom'),
      probe: 'http://127.0.0.1:4096/api/wordnet/lookup?word=wisdom',
      source: 'http-probe'
    },
    'c-server': {
      available: checkHttp('http://127.0.0.1:8080/'),
      probe: 'http://127.0.0.1:8080/',
      source: 'http-probe'
    },
    firmware: {
      available: true,
      probe: null,
      source: 'assumed-local'
    },
    'fano-core': {
      available: true,
      probe: null,
      source: 'assumed-local'
    },
    'document-adapters': {
      available: true,
      probe: null,
      source: 'assumed-local'
    },
    'web-client': {
      available: true,
      probe: null,
      source: 'assumed-local'
    }
  };
}

function main() {
  const args = parseArgs(process.argv);
  const stopOnFail = String(args['stop-on-fail'] || 'false').toLowerCase() === 'true';
  const nodeAware = String(args['node-aware'] || 'true').toLowerCase() !== 'false';
  const eventsPath = path.resolve(auditRoot, args.events || 'results/bench/replay/latest/capability-matrix.ndjson');
  const positionPath = path.resolve(auditRoot, args.position || 'results/bench/replay/latest/position.json');

  ensureDir(path.dirname(eventsPath));
  fs.writeFileSync(eventsPath, '', 'utf8');

  const adapters = listAdapters();
  const matrix = {
    attempted: 0,
    passed: 0,
    failed: 0,
    skipped_missing_node: 0
  };
  const nodeAvailability = nodeAvailabilityMap();

  let lastSuccessful = null;
  let failedCapability = null;

  appendEvent(eventsPath, 'capability.matrix.start', {
    adapter_count: adapters.length,
    stop_on_fail: stopOnFail,
    node_aware: nodeAware,
    node_availability: nodeAvailability
  });

  for (const cap of adapters) {
    matrix.attempted += 1;
    const missingNodes = nodeAware
      ? cap.nodes.filter((n) => !nodeAvailability[n] || !nodeAvailability[n].available)
      : [];

    if (missingNodes.length > 0) {
      matrix.skipped_missing_node += 1;
      appendEvent(eventsPath, 'capability.skipped', {
        capability: cap.capability,
        severity: cap.severity,
        reason: 'missing_node',
        missing_nodes: missingNodes,
        nodes: cap.nodes
      });
      const skippedState = {
        schema_version: 1,
        lane: 'matrix',
        phase: 'capability-loop',
        status: 'skipped_missing_node',
        checkpoint_seq: matrix.attempted,
        capability: cap.capability,
        severity: cap.severity,
        nodes: cap.nodes,
        node_availability: nodeAvailability,
        missing_nodes: missingNodes,
        last_successful_step: lastSuccessful,
        failed_step: failedCapability,
        input_digests: {
          canon_sha256: sha256File(path.join(replayLatest, 'build-replay.ndjson')),
          patch_sha256: sha256File(path.join(replayLatest, 'build-replay.patch.ndjson')),
          patched_sha256: sha256File(path.join(replayLatest, 'build-replay.patched.ndjson')),
          bundle_sha256: sha256File(path.join(replayLatest, 'build-replay-federation.tgz'))
        },
        progress: matrix
      };
      writePosition(positionPath, skippedState);
      continue;
    }

    appendEvent(eventsPath, 'capability.run.start', {
      capability: cap.capability,
      severity: cap.severity,
      nodes: cap.nodes,
      total_tests: cap.total_tests
    });

    const result = runCapability(cap);

    if (result.exit === 0) {
      matrix.passed += 1;
      lastSuccessful = cap.capability;
    } else {
      matrix.failed += 1;
      failedCapability = cap.capability;
    }

    appendEvent(eventsPath, 'capability.run.end', {
      capability: cap.capability,
      severity: cap.severity,
      exit: result.exit,
      wall_ms: result.wall_ms,
      command: result.command
    });

    appendEvent(eventsPath, 'capability.metrics', {
      capability: cap.capability,
      stdout_sha256: `sha256:${crypto.createHash('sha256').update(result.stdout).digest('hex')}`,
      stderr_sha256: `sha256:${crypto.createHash('sha256').update(result.stderr).digest('hex')}`,
      wall_ms: result.wall_ms,
      exit: result.exit
    });

    const state = {
      schema_version: 1,
      lane: 'matrix',
      phase: 'capability-loop',
      status: result.exit === 0 ? 'ok' : 'failed',
      checkpoint_seq: matrix.attempted,
      capability: cap.capability,
      severity: cap.severity,
      nodes: cap.nodes,
      node_availability: nodeAvailability,
      last_successful_step: lastSuccessful,
      failed_step: failedCapability,
      input_digests: {
        canon_sha256: sha256File(path.join(replayLatest, 'build-replay.ndjson')),
        patch_sha256: sha256File(path.join(replayLatest, 'build-replay.patch.ndjson')),
        patched_sha256: sha256File(path.join(replayLatest, 'build-replay.patched.ndjson')),
        bundle_sha256: sha256File(path.join(replayLatest, 'build-replay-federation.tgz'))
      },
      progress: matrix
    };
    writePosition(positionPath, state);

    if (result.exit !== 0 && stopOnFail) {
      appendEvent(eventsPath, 'capability.matrix.break', {
        capability: cap.capability,
        reason: 'command_failed',
        exit: result.exit
      });
      break;
    }
  }

  appendEvent(eventsPath, 'capability.matrix.end', {
    ...matrix,
    node_aware: nodeAware,
    node_availability: nodeAvailability,
    last_successful_step: lastSuccessful,
    failed_step: failedCapability
  });

  if (matrix.failed > 0) process.exit(1);
}

main();
