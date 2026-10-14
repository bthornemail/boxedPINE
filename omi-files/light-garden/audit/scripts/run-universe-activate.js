#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ensureDir } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');
const lgRoot = path.resolve(auditRoot, '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function sha256Bytes(data) {
  return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function readNdjsonLines(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}

function runNodeScript(scriptPath, args, cwd) {
  const res = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: 'utf8'
  });
  if (res.status !== 0) {
    throw new Error(
      `command_failed: ${[process.execPath, scriptPath, ...args].join(' ')}\n${res.stdout || ''}\n${res.stderr || ''}`.trim()
    );
  }
  return res.stdout || '';
}

function deterministicIso(seq) {
  return `1970-01-01T00:00:${String(seq % 60).padStart(2, '0')}Z`;
}

function main() {
  const args = parseArgs(process.argv);
  const manifestPath = path.resolve(
    lgRoot,
    String(args.manifest || 'canon-universe-manifest.json')
  );
  const artifactsDir = path.resolve(
    lgRoot,
    String(args['artifacts-dir'] || 'artifacts/universe/latest')
  );
  const replayDir = path.resolve(
    auditRoot,
    String(args['replay-dir'] || 'results/bench/replay/universe/latest')
  );
  const skipPortalGate = String(args['skip-portal-gate'] || '').toLowerCase() === 'true';

  assert(fs.existsSync(manifestPath), `missing manifest: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(Array.isArray(manifest.entries) && manifest.entries.length > 0, 'manifest entries must be non-empty');

  ensureDir(artifactsDir);
  ensureDir(replayDir);

  const entries = [];
  for (const entry of manifest.entries) {
    assert(entry && entry.id && entry.file && entry.sha256, `invalid manifest entry: ${JSON.stringify(entry)}`);
    const canonPath = path.resolve(lgRoot, entry.file);
    assert(fs.existsSync(canonPath), `missing canon file: ${entry.file}`);
    const actual = sha256File(canonPath);
    assert(actual === entry.sha256, `canon digest mismatch: ${entry.file} expected=${entry.sha256} actual=${actual}`);
    entries.push({ ...entry, abs: canonPath, actual_sha256: actual });
  }

  const runEvents = [];
  let seq = 1;
  runEvents.push({
    seq: seq++,
    timestamp: deterministicIso(seq),
    event: 'universe.run.start',
    payload: {
      universe_id: manifest.universe_id || 'universe',
      manifest_path: path.relative(lgRoot, manifestPath),
      entry_count: entries.length
    }
  });

  for (const entry of entries) {
    const lines = readNdjsonLines(entry.abs);
    runEvents.push({
      seq: seq++,
      timestamp: deterministicIso(seq),
      event: 'universe.lane.start',
      payload: {
        canon_id: entry.id,
        canon_file: entry.file,
        canon_sha256: entry.actual_sha256,
        canon_events: lines.length
      }
    });

    for (let i = 0; i < lines.length; i += 1) {
      const raw = lines[i];
      const obj = JSON.parse(raw);
      runEvents.push({
        seq: seq++,
        timestamp: deterministicIso(seq),
        event: 'universe.canon.event',
        payload: {
          canon_id: entry.id,
          canon_file: entry.file,
          canon_seq: i + 1,
          canon_event: obj.event || obj.type || 'unknown.event',
          canon_line_sha256: sha256Bytes(Buffer.from(raw, 'utf8')),
          record: obj
        }
      });
    }

    runEvents.push({
      seq: seq++,
      timestamp: deterministicIso(seq),
      event: 'universe.lane.end',
      payload: {
        canon_id: entry.id,
        canon_file: entry.file,
        canon_sha256: entry.actual_sha256,
        canon_events: lines.length
      }
    });
  }

  runEvents.push({
    seq: seq++,
    timestamp: deterministicIso(seq),
    event: 'universe.run.end',
    payload: {
      universe_id: manifest.universe_id || 'universe',
      entry_count: entries.length,
      event_count: runEvents.length + 1
    }
  });

  const runPath = path.join(artifactsDir, 'universe-run.ndjson');
  fs.writeFileSync(runPath, `${runEvents.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8');

  runNodeScript(
    path.join(auditRoot, 'scripts', 'render-build-replay.js'),
    ['--mode', 'universe', '--input', path.relative(auditRoot, runPath), '--out', path.relative(auditRoot, replayDir)],
    auditRoot
  );

  const canonReplayPath = path.join(replayDir, 'build-replay.ndjson');
  const patchPath = path.join(replayDir, 'build-replay.patch.ndjson');
  const patchedPath = path.join(replayDir, 'build-replay.patched.ndjson');
  const checkPath = path.join(replayDir, 'build-replay-check.json');

  runNodeScript(
    path.join(auditRoot, 'scripts', 'apply-replay-patch.js'),
    ['--require-empty', 'true', '--canon', canonReplayPath, '--patch', patchPath, '--out', patchedPath],
    auditRoot
  );
  const checkOut = runNodeScript(
    path.join(auditRoot, 'scripts', 'apply-replay-patch.js'),
    ['--canon', canonReplayPath, '--patch', patchPath, '--out', patchedPath],
    auditRoot
  );
  fs.writeFileSync(checkPath, checkOut.trimEnd() + '\n', 'utf8');

  runNodeScript(
    path.join(auditRoot, 'scripts', 'emit-capabilities.js'),
    ['--out', path.join(replayDir, 'capabilities.json')],
    auditRoot
  );
  runNodeScript(
    path.join(auditRoot, 'scripts', 'write-visual-index.js'),
    ['--lane', 'universe', '--dir', replayDir, '--out', path.join(replayDir, 'index.json')],
    auditRoot
  );

  const replayManifestCopy = path.join(replayDir, 'universe-manifest.json');
  fs.copyFileSync(manifestPath, replayManifestCopy);
  const runCopy = path.join(replayDir, 'universe-run.ndjson');
  fs.copyFileSync(runPath, runCopy);

  // Ensure immersive entrypoint is colocated with the replay bundle dir so the UniverseLoader
  // can deep-link to `${baseUrl}/portal-immersive.html` deterministically.
  const immersiveHtmlSrc = path.join(auditRoot, 'public', 'portal-immersive.html');
  const immersiveJsSrc = path.join(auditRoot, 'public', 'portal-immersive.js');
  assert(fs.existsSync(immersiveHtmlSrc), `missing immersive entrypoint: ${path.relative(lgRoot, immersiveHtmlSrc)}`);
  assert(fs.existsSync(immersiveJsSrc), `missing immersive entrypoint: ${path.relative(lgRoot, immersiveJsSrc)}`);
  const immersiveHtmlDst = path.join(replayDir, 'portal-immersive.html');
  const immersiveJsDst = path.join(replayDir, 'portal-immersive.js');
  fs.copyFileSync(immersiveHtmlSrc, immersiveHtmlDst);
  fs.copyFileSync(immersiveJsSrc, immersiveJsDst);

  // Provide a single clickable entrypoint (portal.html) and colocate the embeddable loader.
  const loaderSrc = path.join(auditRoot, 'public', 'universe-loader.js');
  const portalHtmlSrc = path.join(auditRoot, 'public', 'portal.html');
  assert(fs.existsSync(loaderSrc), `missing loader: ${path.relative(lgRoot, loaderSrc)}`);
  assert(fs.existsSync(portalHtmlSrc), `missing portal entrypoint: ${path.relative(lgRoot, portalHtmlSrc)}`);
  fs.copyFileSync(loaderSrc, path.join(replayDir, 'universe-loader.js'));
  fs.copyFileSync(portalHtmlSrc, path.join(replayDir, 'portal.html'));

  let portalGate = { invoked: false, pass: null, path: null };
  const portalGateScriptCandidates = [
    path.resolve(lgRoot, 'portal-gate.js'),
    path.resolve(lgRoot, '../automaton/scripts/portal-gate.mjs')
  ];
  const portalGateScript = portalGateScriptCandidates.find((p) => fs.existsSync(p)) || null;
  const bridgeScriptCandidates = [
    path.resolve(auditRoot, 'scripts', 'ndjson-svg-portal-bridge.js'),
    path.resolve(lgRoot, '../mind-git-vr-ecosystem/church-metaverse/scripts/ndjson-svg-vr-bridge.mjs')
  ];
  const bridgeScript = bridgeScriptCandidates.find((p) => fs.existsSync(p)) || null;
  const portalScenePath = path.join(replayDir, 'portal-scene.json');
  const portalBridgeCheckPath = path.join(replayDir, 'portal-bridge.check.json');
  const hasBridgeScript = Boolean(bridgeScript);
  if (hasBridgeScript && bridgeScript) {
    runNodeScript(
      bridgeScript,
      ['--ndjson', canonReplayPath, '--svg', path.join(replayDir, 'build-replay.svg'), '--out-dir', replayDir],
      bridgeScript.includes(path.join('audit', 'scripts')) ? auditRoot : lgRoot
    );
  }

  if (!skipPortalGate && portalGateScript && fs.existsSync(portalGateScript)) {
    const gateArgs = ['--bundle', replayDir, '--out', replayDir];
    if (fs.existsSync(portalScenePath) && fs.existsSync(portalBridgeCheckPath)) {
      gateArgs.push('--portal-scene', 'portal-scene.json', '--portal-bridge-check', 'portal-bridge.check.json');
    }
    runNodeScript(
      portalGateScript,
      gateArgs,
      path.basename(portalGateScript) === 'portal-gate.js'
        ? lgRoot
        : path.resolve(lgRoot, '../automaton')
    );
    const gatePath = path.join(replayDir, 'portal-gate.json');
    if (fs.existsSync(gatePath)) {
      const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
      portalGate = { invoked: true, pass: gate.pass === true, path: path.relative(lgRoot, gatePath) };
      assert(gate.pass === true, 'portal gate failed for universe replay output');
    }
  }

  // Optional: copy well-known docs into the bundle for offline verification.
  const wellKnownDir = process.env.LG_WELL_KNOWN_DIR ? path.resolve(String(process.env.LG_WELL_KNOWN_DIR)) : null;
  if (wellKnownDir && fs.existsSync(wellKnownDir)) {
    const wkDst = path.join(replayDir, '.well-known');
    ensureDir(wkDst);
    for (const name of ['did.json', 'identities.json']) {
      const src = path.join(wellKnownDir, name);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(wkDst, name));
      }
    }
  }

  // Optional: waveform-core analysis (projection-only).
  // Default: non-gating. Set LG_WAVEFORM_REQUIRED=true to fail-closed on analysis failure.
  const waveformEnabled = String(process.env.LG_WAVEFORM_ENABLED || '').toLowerCase() === 'true';
  if (waveformEnabled) {
    const requireOk = String(process.env.LG_WAVEFORM_REQUIRED || '').toLowerCase() === 'true';
    const wfScript = path.join(auditRoot, 'scripts', 'run-waveform-analysis.js');
    assert(fs.existsSync(wfScript), `missing waveform runner: ${path.relative(lgRoot, wfScript)}`);
    runNodeScript(
      wfScript,
      [
        '--in',
        path.join(replayDir, 'build-replay.ndjson'),
        '--out-dir',
        replayDir,
        '--require',
        requireOk ? 'true' : 'false'
      ],
      auditRoot
    );

    const waveformRenderEnabled = String(process.env.LG_WAVEFORM_RENDER_ENABLED || '').toLowerCase() === 'true';
    const waveformRenderRequired = String(process.env.LG_WAVEFORM_RENDER_REQUIRED || '').toLowerCase() === 'true';
    if (waveformRenderEnabled) {
      const renderScript = path.join(auditRoot, 'scripts', 'render-waveform.js');
      assert(fs.existsSync(renderScript), `missing waveform renderer: ${path.relative(lgRoot, renderScript)}`);
      runNodeScript(
        renderScript,
        [
          '--out-dir',
          replayDir
        ],
        auditRoot
      );
    }

    // Re-run portal gate after waveform evidence exists so portal-gate.json reflects waveform attachment status
    // even when signing is disabled.
    if (!skipPortalGate && portalGateScript && fs.existsSync(portalGateScript)) {
      const gateArgs = ['--bundle', replayDir, '--out', replayDir];
      if (fs.existsSync(portalScenePath) && fs.existsSync(portalBridgeCheckPath)) {
        gateArgs.push('--portal-scene', 'portal-scene.json', '--portal-bridge-check', 'portal-bridge.check.json');
      }
      gateArgs.push('--waveform-check', 'waveform.check.json', '--require-waveform', requireOk ? 'true' : 'false');
      if (waveformRenderEnabled) {
        gateArgs.push('--waveform-render-check', 'waveform.render.check.json', '--require-waveform-render', waveformRenderRequired ? 'true' : 'false');
      }
      runNodeScript(
        portalGateScript,
        gateArgs,
        path.basename(portalGateScript) === 'portal-gate.js'
          ? lgRoot
          : path.resolve(lgRoot, '../automaton')
      );
      const gatePath = path.join(replayDir, 'portal-gate.json');
      if (fs.existsSync(gatePath)) {
        const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
        portalGate = { invoked: true, pass: gate.pass === true, path: path.relative(lgRoot, gatePath) };
        assert(gate.pass === true, 'portal gate failed after waveform evidence');
      }
    }
  }

  // Optional: web3 adapter signing (ECDSA over evidence digests).
  const signingEnabled = String(process.env.LG_SIGNING_ENABLED || '').toLowerCase() === 'true';
  if (signingEnabled) {
    const signScript = path.join(auditRoot, 'scripts', 'web3-adapter-sign.js');
    assert(fs.existsSync(signScript), `missing signer script: ${path.relative(lgRoot, signScript)}`);
    const signArgs = [
      '--replay-dir',
      path.relative(auditRoot, replayDir),
      '--keys-dir',
      String(process.env.LG_KEYS_DIR || '/opt/light-garden/keys-hd'),
      '--seed-file',
      String(process.env.LG_SEED_FILE || 'metatron.seed.enc.json'),
      '--signer',
      String(process.env.LG_SIGNER || 'enoch'),
      '--out',
      'signatures.json'
    ];
    if (process.env.LG_WELL_KNOWN_DIR && String(process.env.LG_WELL_KNOWN_DIR).trim()) {
      signArgs.push('--well-known-dir', String(process.env.LG_WELL_KNOWN_DIR));
    }
    runNodeScript(
      signScript,
      signArgs,
      auditRoot
    );

    // Enforce signatures for the portal gate when enabled.
    if (!skipPortalGate && portalGateScript && fs.existsSync(portalGateScript)) {
      const gateArgs = ['--bundle', replayDir, '--out', replayDir, '--signatures', 'signatures.json', '--require-signatures', 'true'];
      if (fs.existsSync(portalScenePath) && fs.existsSync(portalBridgeCheckPath)) {
        gateArgs.push('--portal-scene', 'portal-scene.json', '--portal-bridge-check', 'portal-bridge.check.json');
      }
      runNodeScript(portalGateScript, gateArgs, lgRoot);
      const gatePath = path.join(replayDir, 'portal-gate.json');
      if (fs.existsSync(gatePath)) {
        const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
        portalGate = { invoked: true, pass: gate.pass === true, path: path.relative(lgRoot, gatePath) };
        assert(gate.pass === true, 'portal gate failed after signature enforcement');
      }
    }
  }

  const universeCheck = {
    schema_version: 1,
    universe_id: manifest.universe_id || 'universe',
    pass: true,
    inputs: {
      manifest: {
        path: path.relative(lgRoot, manifestPath),
        sha256: sha256File(manifestPath)
      },
      canon_entries: entries.map((entry) => ({
        id: entry.id,
        file: entry.file,
        sha256: entry.actual_sha256
      }))
    },
    outputs: {
      universe_run_ndjson: {
        path: path.relative(lgRoot, runPath),
        sha256: sha256File(runPath)
      },
      replay_manifest: {
        path: path.relative(lgRoot, path.join(replayDir, 'build-replay-manifest.json')),
        sha256: sha256File(path.join(replayDir, 'build-replay-manifest.json'))
      },
      replay_check: {
        path: path.relative(lgRoot, checkPath),
        sha256: sha256File(checkPath)
      },
      replay_index: {
        path: path.relative(lgRoot, path.join(replayDir, 'index.json')),
        sha256: sha256File(path.join(replayDir, 'index.json'))
      },
      federation_bundle: {
        path: path.relative(lgRoot, path.join(replayDir, 'build-replay-federation.tgz')),
        exists: false
      }
    },
    portal_gate: portalGate
  };

  if (fs.existsSync(portalScenePath)) {
    universeCheck.outputs.portal_scene = {
      path: path.relative(lgRoot, portalScenePath),
      sha256: sha256File(portalScenePath)
    };
  }
  if (fs.existsSync(portalBridgeCheckPath)) {
    universeCheck.outputs.portal_bridge_check = {
      path: path.relative(lgRoot, portalBridgeCheckPath),
      sha256: sha256File(portalBridgeCheckPath)
    };
  }
  if (fs.existsSync(immersiveHtmlDst)) {
    universeCheck.outputs.portal_immersive_html = {
      path: path.relative(lgRoot, immersiveHtmlDst),
      sha256: sha256File(immersiveHtmlDst)
    };
  }
  if (fs.existsSync(immersiveJsDst)) {
    universeCheck.outputs.portal_immersive_js = {
      path: path.relative(lgRoot, immersiveJsDst),
      sha256: sha256File(immersiveJsDst)
    };
  }

  const universeCheckPath = path.join(replayDir, 'universe-check.json');
  fs.writeFileSync(universeCheckPath, `${JSON.stringify(universeCheck, null, 2)}\n`, 'utf8');

  const bundleScript = path.join(replayDir, 'export-federation-bundle.sh');
  if (fs.existsSync(bundleScript)) {
    for (let i = 0; i < 2; i += 1) {
      const res = spawnSync('bash', [bundleScript], { cwd: replayDir, encoding: 'utf8' });
      if (res.status !== 0) {
        throw new Error(`bundle_export_failed\n${res.stdout || ''}\n${res.stderr || ''}`);
      }
      if (i === 0) {
        const bundlePath = path.join(replayDir, 'build-replay-federation.tgz');
        universeCheck.outputs.federation_bundle.exists = fs.existsSync(bundlePath);
        fs.writeFileSync(universeCheckPath, `${JSON.stringify(universeCheck, null, 2)}\n`, 'utf8');
      }
    }
  }

  console.log(
    JSON.stringify({
      pass: true,
      universe_id: universeCheck.universe_id,
      replay_dir: path.relative(lgRoot, replayDir),
      run_ndjson: path.relative(lgRoot, runPath),
      check: path.relative(lgRoot, universeCheckPath)
    })
  );
}

try {
  main();
} catch (err) {
  console.error(String(err && err.message ? err.message : err));
  process.exit(2);
}
