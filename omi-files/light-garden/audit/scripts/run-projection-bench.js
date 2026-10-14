#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ensureDir, readNdjson, writeJson, now } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(auditRoot, '..');
const latestDir = path.join(auditRoot, 'results', 'latest');
const benchDir = path.join(auditRoot, 'results', 'bench', 'latest');
const benchNdjsonPath = path.join(benchDir, 'projection-bench.ndjson');
const benchJsonPath = path.join(benchDir, 'projection-bench.json');
const benchAttestationPath = path.join(benchDir, 'projection-bench-attestation.json');

ensureDir(benchDir);

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function sha256String(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value)).digest('hex')}`;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(rank, sorted.length - 1))];
}

function appendEvent(event, payload) {
  fs.appendFileSync(
    benchNdjsonPath,
    `${JSON.stringify({ timestamp: new Date().toISOString(), event, payload })}\n`,
    'utf8'
  );
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) out[key] = true;
    else out[key] = next, i++;
  }
  return out;
}

function runNpmScript(name) {
  const start = now();
  const cmd = 'npm';
  const args = ['run', '-s', name];
  const p = spawnSync(cmd, args, {
    cwd: auditRoot,
    env: process.env,
    encoding: 'utf8'
  });
  const end = now();
  return {
    run_type: name,
    wall_ms: end - start,
    exit: p.status ?? 1,
    stdout: p.stdout || '',
    stderr: p.stderr || '',
    command: `${cmd} ${args.join(' ')}`,
    started_at_ms: start,
    ended_at_ms: end
  };
}

function runRegressionParsePass() {
  const runType = 'regression:ndjson-parse';
  const start = now();
  const tracesDir = path.join(auditRoot, 'traces', 'regression');
  const traceFiles = fs.existsSync(tracesDir)
    ? fs.readdirSync(tracesDir).filter((f) => f.endsWith('.ndjson')).sort()
    : [];
  let parseErrors = 0;
  const files = [];
  for (const file of traceFiles) {
    const tracePath = path.join(tracesDir, file);
    try {
      const records = readNdjson(tracePath);
      files.push({
        file: `traces/regression/${file}`,
        records: records.length,
        sha256: sha256File(tracePath)
      });
    } catch (err) {
      parseErrors++;
      files.push({
        file: `traces/regression/${file}`,
        records: 0,
        parse_error: err.message,
        sha256: sha256File(tracePath)
      });
    }
  }

  const end = now();
  return {
    run_type: runType,
    wall_ms: end - start,
    exit: parseErrors > 0 ? 1 : 0,
    command: 'internal:read-ndjson traces/regression/*.ndjson',
    started_at_ms: start,
    ended_at_ms: end,
    regression_files: files,
    parse_errors: parseErrors
  };
}

function runProjectionLightRendering() {
  const runType = 'projection:light-rendering';
  const tool = path.join(auditRoot, 'features', 'tools', 'light-rendering-tool.js');
  const commands = ['golden', 'negative', 'test', 'coverage'];
  const start = now();
  const commandRuns = [];
  let failures = 0;

  for (const cmd of commands) {
    const runStart = now();
    const p = spawnSync(process.execPath, [tool, cmd], {
      cwd: auditRoot,
      env: process.env,
      encoding: 'utf8'
    });
    const runEnd = now();
    const stdout = p.stdout || '';
    const stderr = p.stderr || '';
    const exit = p.status ?? 1;
    if (exit !== 0) failures++;

    const commandRecord = {
      command: cmd,
      argv: `node features/tools/light-rendering-tool.js ${cmd}`,
      wall_ms: runEnd - runStart,
      exit,
      stdout_sha256: sha256String(stdout),
      stderr_sha256: sha256String(stderr)
    };
    commandRuns.push(commandRecord);
  }

  const end = now();
  return {
    run_type: runType,
    wall_ms: end - start,
    exit: failures > 0 ? 1 : 0,
    command: 'node features/tools/light-rendering-tool.js <golden|negative|test|coverage>',
    started_at_ms: start,
    ended_at_ms: end,
    command_runs: commandRuns
  };
}

function copyMetricsSnapshot(runType) {
  if (!(runType === 'validate' || runType === 'validate:raw')) return null;
  const src = path.join(latestDir, 'metrics.json');
  if (!fs.existsSync(src)) return null;
  const target = path.join(benchDir, `metrics.${runType.replace(/[:]/g, '_')}.json`);
  fs.copyFileSync(src, target);
  return {
    path: path.relative(auditRoot, target),
    sha256: sha256File(target)
  };
}

function traceSetDigest(subdir) {
  const dir = path.join(auditRoot, 'traces', subdir);
  if (!fs.existsSync(dir)) return { sha256: 'sha256:missing', files: [] };
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ndjson')).sort();
  const digests = files.map((f) => {
    const fp = path.join(dir, f);
    return {
      file: `traces/${subdir}/${f}`,
      sha256: sha256File(fp)
    };
  });
  const joined = digests.map((d) => `${d.file}:${d.sha256}`).join('\n');
  return {
    sha256: sha256String(joined),
    files: digests
  };
}

function featureTraceSetDigest(capability, kind) {
  const fp = path.join(auditRoot, 'features', kind, `${capability}.${kind}.ndjson`);
  if (!fs.existsSync(fp)) {
    return {
      path: `features/${kind}/${capability}.${kind}.ndjson`,
      sha256: 'sha256:missing'
    };
  }
  return {
    path: `features/${kind}/${capability}.${kind}.ndjson`,
    sha256: sha256File(fp)
  };
}

function main() {
  const args = parseArgs(process.argv);
  const runsArg = String(args.runs || 'validate,validate:raw,projection:light-rendering,regression:ndjson-parse');
  const failOnRaw = String(args['fail-on-raw'] || process.env.BENCH_FAIL_ON_RAW || '0') === '1';
  const requestedRuns = runsArg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  fs.writeFileSync(benchNdjsonPath, '', 'utf8');

  appendEvent('bench.run.start', {
    requested_runs: requestedRuns
  });

  const records = [];
  let failedRuns = 0;
  let informationalFailedRuns = 0;

  for (const runType of requestedRuns) {
    appendEvent('bench.run.start', { run_type: runType });
    let result;
    if (runType === 'regression:ndjson-parse' || runType === 'regression') result = runRegressionParsePass();
    else if (runType === 'projection:light-rendering') result = runProjectionLightRendering();
    else if (runType === 'validate' || runType === 'validate:raw') result = runNpmScript(runType);
    else {
      result = {
        run_type: runType,
        wall_ms: 0,
        exit: 2,
        command: `unsupported run type: ${runType}`
      };
    }

    const metricsSnapshot = copyMetricsSnapshot(runType);
    const runRecord = {
      ...result,
      metrics_snapshot: metricsSnapshot
    };
    records.push(runRecord);
    const isInformational = runRecord.run_type === 'validate:raw' && !failOnRaw;
    if (runRecord.exit !== 0) {
      if (isInformational) informationalFailedRuns++;
      else failedRuns++;
    }

    appendEvent('bench.run.end', {
      run_type: runRecord.run_type,
      wall_ms: runRecord.wall_ms,
      exit: runRecord.exit,
      command: runRecord.command,
      informational: isInformational
    });
    if (Array.isArray(runRecord.command_runs)) {
      for (const c of runRecord.command_runs) {
        appendEvent('bench.metrics', {
          run_type: runType,
          command: c.command,
          wall_ms: c.wall_ms,
          exit: c.exit,
          stdout_sha256: c.stdout_sha256,
          stderr_sha256: c.stderr_sha256
        });
      }
    }
    if (metricsSnapshot) {
      appendEvent('bench.metrics', {
        run_type: runType,
        metrics_path: metricsSnapshot.path,
        metrics_sha256: metricsSnapshot.sha256
      });
    }
  }

  const wallTimes = records.map((r) => r.wall_ms);
  const summary = {
    timestamp: new Date().toISOString(),
    runs: records,
    totals: {
      total_runs: records.length,
      passed_runs: records.length - failedRuns,
      failed_runs: failedRuns,
      informational_failed_runs: informationalFailedRuns
    },
    wall_ms: {
      p50: percentile(wallTimes, 50),
      p95: percentile(wallTimes, 95),
      max: wallTimes.length ? Math.max(...wallTimes) : 0,
      min: wallTimes.length ? Math.min(...wallTimes) : 0
    }
  };

  writeJson(benchJsonPath, summary);

  appendEvent('bench.summary', {
    total_runs: summary.totals.total_runs,
    passed_runs: summary.totals.passed_runs,
    failed_runs: summary.totals.failed_runs,
    informational_failed_runs: summary.totals.informational_failed_runs,
    wall_ms: summary.wall_ms
  });

  const traceSets = {
    golden: traceSetDigest('golden'),
    negative: traceSetDigest('negative'),
    regression: traceSetDigest('regression')
  };
  const metricsDigests = records
    .filter((r) => r.metrics_snapshot)
    .map((r) => ({ run_type: r.run_type, ...r.metrics_snapshot }));

  const attestation = {
    timestamp: new Date().toISOString(),
    runner: {
      path: 'scripts/run-projection-bench.js',
      sha256: sha256File(__filename)
    },
    lockfiles: {
      'package-lock.json': fs.existsSync(path.join(auditRoot, 'package-lock.json'))
        ? sha256File(path.join(auditRoot, 'package-lock.json'))
        : 'sha256:missing'
    },
    trace_sets: traceSets,
    projection_trace_sets: {
      'light-rendering:golden': featureTraceSetDigest('light-rendering', 'golden'),
      'light-rendering:negative': featureTraceSetDigest('light-rendering', 'negative')
    },
    bench_outputs: {
      ndjson: { path: 'results/bench/latest/projection-bench.ndjson', sha256: sha256File(benchNdjsonPath) },
      summary: { path: 'results/bench/latest/projection-bench.json', sha256: sha256File(benchJsonPath) }
    },
    metrics_snapshots: metricsDigests
  };
  writeJson(benchAttestationPath, attestation);

  console.log(`projection bench written: ${path.relative(repoRoot, benchDir)}`);
  console.log(
    `runs=${summary.totals.total_runs} passed=${summary.totals.passed_runs} failed=${summary.totals.failed_runs} informational_failed=${summary.totals.informational_failed_runs}`
  );
  process.exit(failedRuns > 0 ? 1 : 0);
}

main();
