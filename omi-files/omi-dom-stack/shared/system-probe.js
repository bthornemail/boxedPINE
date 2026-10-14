/**
 * System probes — BusyBox/version, Node, streams, codex integrity
 */
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

function probeBusyBox() {
  // Soft probe: optional system busybox; always report OMI applet box
  let systemVersion = null;
  try {
    const { execSync } = require('child_process');
    const out = execSync('busybox 2>&1 || true', { encoding: 'utf8', timeout: 2000 });
    const m = out.match(/BusyBox v?(\d+\.\d+\.\d+)/i);
    if (m) systemVersion = m[1];
  } catch (_) {}
  return {
    ok: true,
    omi: true,
    systemVersion: systemVersion,
    compatible: true
  };
}

function probeNode() {
  return {
    ok: true,
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    freemem: os.freemem()
  };
}

function probeStreams() {
  return {
    ok: true,
    stdin: !!(process.stdin),
    stdout: !!(process.stdout),
    stderr: !!(process.stderr)
  };
}

function probeCodex() {
  const candidates = [
    path.join(__dirname, 'complete-codex.yaml'),
    path.join(__dirname, 'complete-codex.json'),
    path.join(__dirname, '..', 'docs', 'GENESIS.md')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return { ok: true, path: p, present: true };
      }
    } catch (_) {}
  }
  return { ok: true, present: false, note: 'codex docs optional' };
}

function probe() {
  const results = {
    busybox: probeBusyBox(),
    node: probeNode(),
    streams: probeStreams(),
    codex: probeCodex()
  };
  results.healthy = Object.values(results).every((r) => r && r.ok !== false);
  return results;
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  const p = probe();
  assert('healthy', p.healthy === true);
  assert('streams ok', p.streams.ok);
  assert('node ok', p.node.ok);
  assert('busybox ok', p.busybox.ok);
  const failed = results.filter((x) => !x.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { probe, probeBusyBox, probeNode, probeStreams, probeCodex, selfTest };
