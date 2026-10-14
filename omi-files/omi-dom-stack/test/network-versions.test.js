/**
 * Live cross-origin network test — omi-walkthrough (Grok, :8080) vs omi-imo (:8742).
 *
 * Requires the Grok repo deps to be installed (npm install in omi-walkthrough).
 * When `OMI_EXTERNAL=1` the omi-imo server is expected to already be running
 * (final-test.sh owns it); otherwise this script boots and kills its own.
 * The Grok Vite dev server is always spawned for the test on GROK_PORT.
 */
'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const OMI_PORT = Number(process.env.OMI_PORT || 8742);
const GROK_PORT = Number(process.env.GROK_PORT || 8080);
const OMI_EXTERNAL = process.env.OMI_EXTERNAL === '1';
const GROK_ROOT = (process.env.GROK_ROOT || '/home/main/Programs/omi-walkthrough')
  .replace(/\/+$/, '');

const results = [];
const assert = (name, cond) => results.push({ name, pass: !!cond });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url, options) {
  const res = await fetch(url, options);
  return { res, text: await res.text() };
}

async function poll(url, { waitMs = 90 * 1000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    try {
      const { res } = await fetchText(url);
      if (res.ok) return res;
    } catch (_) { /* not up yet */ }
    await sleep(intervalMs);
  }
  return null;
}

function spawnKilled(cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env }
  });
  child.unref();
  return child;
}

function killTree(child) {
  try { process.kill(-child.pid, 'SIGTERM'); } catch (_) { /* gone */ }
}

async function bootOmi() {
  const already = await poll(`http://127.0.0.1:${OMI_PORT}/api/wiki`, { waitMs: 1500 });
  if (already) return null;
  const child = spawnKilled('node', ['server/server.js'], process.cwd());
  const up = await poll(`http://127.0.0.1:${OMI_PORT}/api/wiki`, { waitMs: 20 * 1000 });
  return up ? child : child && (killTree(child), null);
}

async function bootGrok() {
  const already = await poll(`http://127.0.0.1:${GROK_PORT}/`, { waitMs: 1500 });
  if (already) return null;
  if (!require('node:fs').existsSync(path.join(GROK_ROOT, 'node_modules'))) {
    throw new Error(
      `omi-walkthrough deps not installed — run "npm install" inside ${GROK_ROOT} first`
    );
  }
  const child = spawnKilled('npm', ['run', 'dev'], GROK_ROOT);
  const up = await poll(`http://127.0.0.1:${GROK_PORT}/`, { waitMs: 120 * 1000 });
  return up ? child : child && (killTree(child), null);
}

function extractTransistors(src) {
  return [...src.matchAll(/transistors:\s*(\d+)/g)].map((m) => Number(m[1]));
}

function extractTruth(src) {
  return [...src.matchAll(/a:\s*(true|false),\s*b:\s*(true|false),\s*out:\s*(true|false)/g)]
    .map((m) => m.slice(1).map((v) => (v === 'true' ? 1 : 0)));
}

async function main() {
  console.log('=== NETWORK VERSIONS (omi-walkthrough ↔ omi-imo) ===');
  console.log(`omi-imo  http://127.0.0.1:${OMI_PORT}  (external=${OMI_EXTERNAL})`);
  console.log(`grok     http://127.0.0.1:${GROK_PORT}  (root=${GROK_ROOT})`);

  const omiChild = OMI_EXTERNAL ? null : await bootOmi();
  if (!OMI_EXTERNAL && !omiChild) {
    console.error('FAIL omi-imo server did not come up');
    process.exit(1);
  }
  const grokChild = await bootGrok();
  if (!grokChild) {
    console.error('FAIL grok dev server did not come up (ports free? deps installed?)');
    killTree(omiChild);
    process.exit(1);
  }

  try {
    // ---- C1: both servers answer on the pages that exist in each version ----
    const omiRoot = await fetchText(`http://127.0.0.1:${OMI_PORT}/wiki`);
    assert('omi /wiki serves 200', omiRoot.res.status === 200);

    for (const p of ['/', '/gates/xor-2', '/protocol', '/compare']) {
      const { res } = await fetchText(`http://127.0.0.1:${GROK_PORT}${p}`);
      assert(`grok ${p} → ${res.status}`, res.status === 200);
    }

    // ---- C2: cross-origin real fetch from the grok origin into omi-imo ----
    const origin = `http://localhost:${GROK_PORT}`;
    const corsGet = await fetchText(`http://127.0.0.1:${OMI_PORT}/api/wiki`, {
      headers: { Origin: origin }
    });
    assert('cross-origin GET ACAO set', (corsGet.res.headers.get('access-control-allow-origin') || '') === '*');
    let wiki;
    try { wiki = JSON.parse(corsGet.text); } catch (_) { wiki = null; }
    assert('cross-origin GET /api/wiki ok', !!wiki && wiki.ok === true);

    const corsPost = await fetchText(
      `http://127.0.0.1:${OMI_PORT}/api/pipeline?q=two+versions+agree`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}' }
    );
    assert('cross-origin POST ACAO set', (corsPost.res.headers.get('access-control-allow-origin') || '') === '*');
    let pipe;
    try { pipe = JSON.parse(corsPost.text); } catch (_) { pipe = null; }
    assert('cross-origin POST /api/pipeline ok', !!pipe && pipe.ok === true);

    // ---- C3: transistor-count parity across versions ----
    const grokGates = await fetchText(`http://127.0.0.1:${GROK_PORT}/src/lib/xor/gates.ts`);
    const grokGatesSrc = grokGates.res.ok ? grokGates.text : '';
    const grokTransistors = extractTransistors(grokGatesSrc);
    assert('grok gates.ts served over network', grokGates.res.status === 200 && /transistors/.test(grokGatesSrc));
    assert('grok transistor counts 5,6,8,10', JSON.stringify(grokTransistors) === JSON.stringify([5, 6, 8, 10]));

    if (wiki) {
      const chapters = wiki.chapters || [];
      const gateChapters = chapters.filter((c) => /bind|apply|eval|digest/.test(c.id));
      const omiTransistors = gateChapters.map((c) => c.circuit && c.circuit.transistors);
      assert('omi per-chapter transistors 5,6,8,10', JSON.stringify(omiTransistors) === JSON.stringify([5, 6, 8, 10]));
      assert('omi tally 29 total', wiki.tally && wiki.tally.transistorCount === 29);
      assert('omi centroid balanced', wiki.centroid && wiki.centroid.balanced === true);
    }

    // ---- C4: XOR truth-table parity across versions ----
    const grokLogic = await fetchText(`http://127.0.0.1:${GROK_PORT}/src/lib/xor/logic.ts`);
    const grokLogicSrc = grokLogic.res.ok ? grokLogic.text : '';
    const grokTruth = extractTruth(grokLogicSrc);
    assert('grok logic.ts TRUTH over network', grokLogic.res.status === 200 && grokTruth.length === 4);

    if (wiki) {
      const xorRows = (wiki.chapters[1] || {}).verification || [];
      const omiTruth = xorRows.map((r) => [r.A, r.B, r.out]);
      const omiKey = JSON.stringify(omiTruth);
      const grokKey = JSON.stringify(grokTruth);
      assert('omi XOR verification rows', omiKey === '[[0,0,0],[1,0,1],[0,1,1],[1,1,0]]');
      assert('grok TRUTH same truth table', grokKey === omiKey);
    }
  } finally {
    killTree(grokChild);
    if (omiChild) killTree(omiChild);
  }

  const failed = results.filter((x) => !x.pass);
  for (const x of results) console.log((x.pass ? 'PASS' : 'FAIL') + '  ' + x.name);
  console.log('===', results.length - failed.length + '/' + results.length, 'passed ===');
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});