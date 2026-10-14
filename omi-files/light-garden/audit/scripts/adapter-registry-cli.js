#!/usr/bin/env node
const { listAdapters, getCoverageAll, filterBy } = require('./adapter-registry');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0] || 'list';
  if (cmd === 'list') {
    const nodes = args.nodes ? String(args.nodes).split(',').map((s) => s.trim()).filter(Boolean) : [];
    const result = filterBy({
      severity: args.severity ? String(args.severity) : undefined,
      capability: args.capability ? String(args.capability) : undefined,
      nodes
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === 'coverage') {
    console.log(JSON.stringify(getCoverageAll(), null, 2));
    return;
  }

  console.error(`unknown command: ${cmd}`);
  process.exit(2);
}

main();
