#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function fileMeta(filePath) {
  const st = fs.statSync(filePath);
  return {
    device: st.dev,
    inode: st.ino,
    size: st.size,
    mtime_ms: st.mtimeMs
  };
}

function main() {
  const args = parseArgs(process.argv);
  const patchPath = path.resolve(auditRoot, args.patch || 'results/bench/replay/latest/build-replay.patch.ndjson');
  fs.mkdirSync(path.dirname(patchPath), { recursive: true });
  fs.writeFileSync(patchPath, '', 'utf8');
  console.log(
    JSON.stringify(
      {
        patch_path: path.relative(auditRoot, patchPath),
        patch_sha256: sha256File(patchPath),
        patch_meta: fileMeta(patchPath)
      },
      null,
      2
    )
  );
}

main();
