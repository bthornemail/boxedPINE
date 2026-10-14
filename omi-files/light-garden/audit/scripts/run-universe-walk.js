#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const auditRoot = path.resolve(__dirname, '..');
const replayDir = path.resolve(auditRoot, 'results/bench/replay/universe/latest');
const htmlPath = path.join(replayDir, 'build-replay.html');
const scenePath = path.join(replayDir, 'portal-scene.json');

function runActivate() {
  const res = spawnSync(process.execPath, [path.join(__dirname, 'run-universe-activate.js')], {
    cwd: auditRoot,
    encoding: 'utf8'
  });
  if (res.status !== 0) {
    throw new Error(`universe_activate_failed\n${res.stdout || ''}\n${res.stderr || ''}`);
  }
}

function tryOpen(targetPath) {
  const openers = [
    { cmd: 'xdg-open', args: [targetPath] },
    { cmd: 'open', args: [targetPath] }
  ];
  for (const opener of openers) {
    const r = spawnSync(opener.cmd, opener.args, { encoding: 'utf8' });
    if (r.status === 0) return true;
  }
  return false;
}

try {
  if (!fs.existsSync(htmlPath) || !fs.existsSync(scenePath)) {
    runActivate();
  }

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`missing_replay_html:${htmlPath}`);
  }
  if (!fs.existsSync(scenePath)) {
    throw new Error(`missing_portal_scene:${scenePath}`);
  }

  const opened = tryOpen(htmlPath);
  const result = {
    pass: true,
    replay_html: path.relative(auditRoot, htmlPath),
    portal_scene: path.relative(auditRoot, scenePath),
    opened
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (err) {
  process.stderr.write(`${String(err && err.message ? err.message : err)}\n`);
  process.exit(2);
}
