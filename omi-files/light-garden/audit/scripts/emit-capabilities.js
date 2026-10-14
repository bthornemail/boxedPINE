#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ensureDir } = require('./lib');
const { listAdapters } = require('./adapter-registry');

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

function gitCommit(root) {
  try {
    return execSync('git rev-parse HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return 'unknown';
  }
}

function main() {
  const args = parseArgs(process.argv);
  const lane = String(args.lane || 'bench');
  const outPath = path.resolve(auditRoot, args.out || `results/bench/replay/${lane === 'spine' ? 'spine/latest' : 'latest'}/capabilities.json`);

  const adapters = listAdapters();
  const doc = {
    schema_version: 1,
    lane,
    generated_from_commit: gitCommit(path.resolve(auditRoot, '..')),
    adapter_count: adapters.length,
    adapters
  };

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(path.relative(auditRoot, outPath));
}

main();
