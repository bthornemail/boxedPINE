#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function tryLoadEthers() {
  // portal-gate.js is run from repo root; audit/node_modules is where deps live in CI/VPS.
  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(path.join(__dirname, 'audit', 'node_modules', 'ethers'));
  } catch (_err1) {
    try {
      // eslint-disable-next-line import/no-dynamic-require
      return require('ethers');
    } catch (_err2) {
      return null;
    }
  }
}

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

function sha256File(filePath) {
  return `sha256:${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function isUnsafeRelativePath(p) {
  if (typeof p !== 'string' || !p) return true;
  if (path.isAbsolute(p)) return true;
  const norm = path.posix.normalize(p.replace(/\\/g, '/'));
  return norm.startsWith('../') || norm.includes('/../') || norm === '..';
}

function safeJsonRead(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function digestForManifestPath(manifest, relPath) {
  if (!manifest || typeof manifest.outputs !== 'object' || manifest.outputs === null) return null;
  const direct = manifest.outputs[relPath] || null;
  if (direct && typeof direct.sha256 === 'string') return direct.sha256;
  const byPath = Object.values(manifest.outputs).find((v) => v && v.path === relPath);
  if (byPath && typeof byPath.sha256 === 'string') return byPath.sha256;
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const bundleDir = path.resolve(String(args.bundle || '.'));
  const outDir = path.resolve(String(args.out || bundleDir));
  fs.mkdirSync(outDir, { recursive: true });
  const requireSignatures = String(args['require-signatures'] || '').toLowerCase() === 'true';
  const requireWaveform = String(args['require-waveform'] || '').toLowerCase() === 'true';
  const requireWaveformRender = String(args['require-waveform-render'] || '').toLowerCase() === 'true';

  const required = [
    'index.json',
    'build-replay-manifest.json',
    'build-replay-check.json',
    'build-replay.html',
    'build-replay.svg',
    'build-replay.ndjson',
    'build-replay.canvas.json',
    'build-replay.canvasl',
    'build-replay.canvasl.summary.json'
  ];

  const events = [];
  const failures = [];
  let seq = 1;

  function emit(event, payload) {
    events.push({ seq: seq++, event, payload });
  }

  emit('portal.gate.start', { bundle_dir: bundleDir, out_dir: outDir });

  const fileChecks = required.map((rel) => {
    const abs = path.join(bundleDir, rel);
    const exists = fs.existsSync(abs) && fs.statSync(abs).isFile();
    if (!exists) failures.push(`missing required file: ${rel}`);
    emit('portal.gate.file', { path: rel, exists });
    return { rel, abs, exists };
  });

  let manifest = null;
  let indexJson = null;
  let bridgeScene = null;
  let bridgeCheck = null;
  let signatures = null;
  let signatureVerified = false;
  let signatureAttached = false;
  const signatureIssues = [];
  let waveformCheck = null;
  let waveformAttached = false;
  let waveformVerified = false;
  const waveformIssues = [];
  let waveformRenderCheck = null;
  let waveformRenderAttached = false;
  let waveformRenderVerified = false;
  const waveformRenderIssues = [];

  const manifestPath = path.join(bundleDir, 'build-replay-manifest.json');
  const indexPath = path.join(bundleDir, 'index.json');

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = safeJsonRead(manifestPath);
      emit('portal.gate.manifest.read', { ok: true });
    } catch (err) {
      failures.push(`invalid manifest json: ${String(err && err.message ? err.message : err)}`);
      emit('portal.gate.manifest.read', { ok: false });
    }
  }

  if (fs.existsSync(indexPath)) {
    try {
      indexJson = safeJsonRead(indexPath);
      emit('portal.gate.index.read', { ok: true });
    } catch (err) {
      failures.push(`invalid index json: ${String(err && err.message ? err.message : err)}`);
      emit('portal.gate.index.read', { ok: false });
    }
  }

  if (manifest && typeof manifest.outputs === 'object' && manifest.outputs !== null) {
    const entries = Object.entries(manifest.outputs);
    for (const [name, meta] of entries) {
      const relPath = meta && typeof meta.path === 'string' ? meta.path : name;
      if (isUnsafeRelativePath(relPath)) {
        failures.push(`unsafe manifest path: ${name} -> ${relPath}`);
        emit('portal.gate.path.unsafe', { source: 'manifest', key: name, path: relPath });
      } else {
        emit('portal.gate.path.safe', { source: 'manifest', key: name, path: relPath });
      }
    }
  }

  if (indexJson && typeof indexJson.artifacts === 'object' && indexJson.artifacts !== null) {
    for (const [key, meta] of Object.entries(indexJson.artifacts)) {
      const relPath = meta && typeof meta.path === 'string' ? meta.path : null;
      if (!relPath) continue;
      if (isUnsafeRelativePath(relPath)) {
        failures.push(`unsafe index path: ${key} -> ${relPath}`);
        emit('portal.gate.path.unsafe', { source: 'index', key, path: relPath });
      } else {
        emit('portal.gate.path.safe', { source: 'index', key, path: relPath });
      }
    }
  }

  const portalSceneRel = args['portal-scene'] || null;
  const portalBridgeCheckRel = args['portal-bridge-check'] || null;
  const optionalBridgeAttached = Boolean(portalSceneRel || portalBridgeCheckRel);
  if (portalSceneRel && !portalBridgeCheckRel) {
    failures.push('portal bridge attachment incomplete: missing --portal-bridge-check');
  }
  if (!portalSceneRel && portalBridgeCheckRel) {
    failures.push('portal bridge attachment incomplete: missing --portal-scene');
  }

  let portalSceneAbs = null;
  let portalBridgeCheckAbs = null;
  if (optionalBridgeAttached && portalSceneRel && portalBridgeCheckRel) {
    if (isUnsafeRelativePath(portalSceneRel)) failures.push(`unsafe portal scene path: ${portalSceneRel}`);
    if (isUnsafeRelativePath(portalBridgeCheckRel)) failures.push(`unsafe portal bridge check path: ${portalBridgeCheckRel}`);

    portalSceneAbs = path.join(bundleDir, portalSceneRel);
    portalBridgeCheckAbs = path.join(bundleDir, portalBridgeCheckRel);

    if (!fs.existsSync(portalSceneAbs)) failures.push(`missing portal scene file: ${portalSceneRel}`);
    if (!fs.existsSync(portalBridgeCheckAbs)) failures.push(`missing portal bridge check file: ${portalBridgeCheckRel}`);

    if (fs.existsSync(portalSceneAbs)) {
      try {
        bridgeScene = safeJsonRead(portalSceneAbs);
        emit('portal.gate.bridge.scene.read', { ok: true, path: portalSceneRel });
      } catch (err) {
        failures.push(`invalid portal scene json: ${String(err && err.message ? err.message : err)}`);
        emit('portal.gate.bridge.scene.read', { ok: false, path: portalSceneRel });
      }
    }
    if (fs.existsSync(portalBridgeCheckAbs)) {
      try {
        bridgeCheck = safeJsonRead(portalBridgeCheckAbs);
        emit('portal.gate.bridge.check.read', { ok: true, path: portalBridgeCheckRel });
      } catch (err) {
        failures.push(`invalid portal bridge check json: ${String(err && err.message ? err.message : err)}`);
        emit('portal.gate.bridge.check.read', { ok: false, path: portalBridgeCheckRel });
      }
    }
  }

  if (manifest && typeof manifest.outputs === 'object' && manifest.outputs !== null) {
    for (const req of fileChecks) {
      if (!req.exists) continue;
      const direct = manifest.outputs[req.rel] || null;
      const byPath = Object.values(manifest.outputs).find((v) => v && v.path === req.rel) || null;
      const entry = direct || byPath;
      if (entry && entry.sha256) {
        if (req.rel === 'build-replay-manifest.json' && entry.sha256_scope === 'pre-self-entry') {
          emit('portal.gate.digest', {
            path: req.rel,
            expected: entry.sha256,
            actual: null,
            ok: true,
            skipped: 'pre-self-entry'
          });
          continue;
        }
        const actual = sha256File(req.abs);
        const ok = String(entry.sha256) === actual;
        emit('portal.gate.digest', { path: req.rel, expected: entry.sha256, actual, ok });
        if (!ok) failures.push(`digest mismatch: ${req.rel}`);
      }
    }
  }

  if (bridgeScene && bridgeCheck) {
    const bridgePass = bridgeCheck.pass === true;
    emit('portal.gate.bridge.pass', { pass: bridgePass });
    if (!bridgePass) failures.push('portal bridge check failed (pass=false)');

    const sceneActual = sha256File(portalSceneAbs);
    const sceneDigestFromBridgeCheck =
      bridgeCheck.outputs &&
      bridgeCheck.outputs['portal-scene.json'] &&
      typeof bridgeCheck.outputs['portal-scene.json'].sha256 === 'string'
        ? bridgeCheck.outputs['portal-scene.json'].sha256
        : null;
    if (!sceneDigestFromBridgeCheck) {
      failures.push('portal bridge check missing outputs.portal-scene.json.sha256');
    } else if (sceneDigestFromBridgeCheck !== sceneActual) {
      failures.push('portal scene digest mismatch against portal bridge check');
    }
    emit('portal.gate.bridge.scene.digest', {
      expected: sceneDigestFromBridgeCheck,
      actual: sceneActual,
      ok: sceneDigestFromBridgeCheck === sceneActual
    });

    const ndjsonManifestDigest = digestForManifestPath(manifest, 'build-replay.ndjson');
    const svgManifestDigest = digestForManifestPath(manifest, 'build-replay.svg');
    const sceneNdjsonDigest =
      bridgeScene.inputs && bridgeScene.inputs.ndjson && typeof bridgeScene.inputs.ndjson.sha256 === 'string'
        ? bridgeScene.inputs.ndjson.sha256
        : null;
    const sceneSvgDigest =
      bridgeScene.inputs && bridgeScene.inputs.svg && typeof bridgeScene.inputs.svg.sha256 === 'string'
        ? bridgeScene.inputs.svg.sha256
        : null;

    if (!sceneNdjsonDigest) failures.push('portal scene missing inputs.ndjson.sha256');
    if (!sceneSvgDigest) failures.push('portal scene missing inputs.svg.sha256');
    if (ndjsonManifestDigest && sceneNdjsonDigest && ndjsonManifestDigest !== sceneNdjsonDigest) {
      failures.push('portal scene ndjson digest mismatch against build manifest');
    }
    if (svgManifestDigest && sceneSvgDigest && svgManifestDigest !== sceneSvgDigest) {
      failures.push('portal scene svg digest mismatch against build manifest');
    }
    emit('portal.gate.bridge.inputs.digest', {
      ndjson_manifest: ndjsonManifestDigest,
      ndjson_scene: sceneNdjsonDigest,
      svg_manifest: svgManifestDigest,
      svg_scene: sceneSvgDigest,
      ok:
        Boolean(sceneNdjsonDigest && sceneSvgDigest) &&
        (!ndjsonManifestDigest || ndjsonManifestDigest === sceneNdjsonDigest) &&
        (!svgManifestDigest || svgManifestDigest === sceneSvgDigest)
    });

    const bridgeCheckNdjsonDigest =
      bridgeCheck.inputs && typeof bridgeCheck.inputs.ndjson_sha256 === 'string'
        ? bridgeCheck.inputs.ndjson_sha256
        : null;
    const bridgeCheckSvgDigest =
      bridgeCheck.inputs && typeof bridgeCheck.inputs.svg_sha256 === 'string'
        ? bridgeCheck.inputs.svg_sha256
        : null;
    if (sceneNdjsonDigest && bridgeCheckNdjsonDigest && sceneNdjsonDigest !== bridgeCheckNdjsonDigest) {
      failures.push('portal bridge check ndjson digest mismatch against portal scene');
    }
    if (sceneSvgDigest && bridgeCheckSvgDigest && sceneSvgDigest !== bridgeCheckSvgDigest) {
      failures.push('portal bridge check svg digest mismatch against portal scene');
    }
    emit('portal.gate.bridge.check.inputs', {
      ndjson_scene: sceneNdjsonDigest,
      ndjson_check: bridgeCheckNdjsonDigest,
      svg_scene: sceneSvgDigest,
      svg_check: bridgeCheckSvgDigest,
      ok:
        (!sceneNdjsonDigest ||
          !bridgeCheckNdjsonDigest ||
          sceneNdjsonDigest === bridgeCheckNdjsonDigest) &&
        (!sceneSvgDigest || !bridgeCheckSvgDigest || sceneSvgDigest === bridgeCheckSvgDigest)
    });

    if (Array.isArray(bridgeScene.entities)) {
      for (let i = 0; i < bridgeScene.entities.length; i += 1) {
        const entity = bridgeScene.entities[i];
        const source =
          entity && entity.avatar && typeof entity.avatar.source === 'string' ? entity.avatar.source : null;
        if (!source) continue;
        if (isUnsafeRelativePath(source)) failures.push(`unsafe portal scene avatar source at entity[${i}]: ${source}`);
      }
    }
  }

  const signaturesRel = args.signatures || (fs.existsSync(path.join(bundleDir, 'signatures.json')) ? 'signatures.json' : null);
  if (requireSignatures && !signaturesRel) {
    failures.push('missing signatures: require-signatures=true');
  }

  if (signaturesRel) {
    if (isUnsafeRelativePath(signaturesRel)) {
      failures.push(`unsafe signatures path: ${signaturesRel}`);
    } else {
      const sigAbs = path.join(bundleDir, signaturesRel);
      if (!fs.existsSync(sigAbs)) {
        failures.push(`missing signatures file: ${signaturesRel}`);
      } else {
        signatureAttached = true;
        try {
          signatures = safeJsonRead(sigAbs);
          emit('portal.gate.signatures.read', { ok: true, path: signaturesRel });
        } catch (err) {
          failures.push(`invalid signatures json: ${String(err && err.message ? err.message : err)}`);
          emit('portal.gate.signatures.read', { ok: false, path: signaturesRel });
        }
      }
    }
  }

  if (signatures && signatures.kind === 'universe-signatures' && signatures.schema_version === 1) {
    const ethers = tryLoadEthers();
    if (!ethers) {
      signatureIssues.push('ethers not available for signature verification (install deps under audit/node_modules)');
      if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
    } else {
      const expectedInputs = {
        build_replay_manifest_sha256: sha256File(path.join(bundleDir, 'build-replay-manifest.json')),
        build_replay_check_sha256: sha256File(path.join(bundleDir, 'build-replay-check.json'))
      };

      const inputsOk =
        signatures.inputs &&
        signatures.inputs.build_replay_manifest_sha256 === expectedInputs.build_replay_manifest_sha256 &&
        signatures.inputs.build_replay_check_sha256 === expectedInputs.build_replay_check_sha256;
      if (!inputsOk) {
        signatureIssues.push('signatures inputs do not match current bundle digests');
        if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
      }
      emit('portal.gate.signatures.inputs', { ok: inputsOk, expected: expectedInputs, got: signatures.inputs || null });

      // identities.json is optional inside the bundle; if present we enforce sha match when provided.
      const identitiesPath = path.join(bundleDir, '.well-known', 'identities.json');
      if (signatures.inputs && typeof signatures.inputs.identities_sha256 === 'string' && fs.existsSync(identitiesPath)) {
        const actual = sha256File(identitiesPath);
        const ok = actual === signatures.inputs.identities_sha256;
        if (!ok) {
          signatureIssues.push('identities sha256 mismatch against signatures inputs');
          if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
        }
        emit('portal.gate.signatures.identities', { ok, expected: signatures.inputs.identities_sha256, actual });
      }

      // portal-scene is optional. If the bundle has it, enforce match when signatures provide it.
      const portalSceneAbs = path.join(bundleDir, 'portal-scene.json');
      if (signatures.inputs && typeof signatures.inputs.portal_scene_sha256 === 'string' && signatures.inputs.portal_scene_sha256) {
        if (!fs.existsSync(portalSceneAbs)) {
          signatureIssues.push('portal-scene.json missing but signatures include portal_scene_sha256');
          if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
          emit('portal.gate.signatures.portal_scene', { ok: false, expected: signatures.inputs.portal_scene_sha256, actual: null });
        } else {
          const actual = sha256File(portalSceneAbs);
          const ok = actual === signatures.inputs.portal_scene_sha256;
          if (!ok) {
            signatureIssues.push('portal-scene sha256 mismatch against signatures inputs');
            if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
          }
          emit('portal.gate.signatures.portal_scene', { ok, expected: signatures.inputs.portal_scene_sha256, actual });
        }
      }

      const sigs = signatures.signatures && typeof signatures.signatures === 'object' ? signatures.signatures : {};
      let allOk = true;
      for (const [label, s] of Object.entries(sigs)) {
        const sig = s && typeof s.sig === 'string' ? s.sig : null;
        const expectedAddr = s && typeof s.address === 'string' ? s.address : null;
        if (!sig || !expectedAddr) {
          allOk = false;
          signatureIssues.push(`signature entry missing fields: ${label}`);
          if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
          continue;
        }
        try {
          const recovered = ethers.verifyMessage(signatures.message, sig);
          const ok = recovered.toLowerCase() === expectedAddr.toLowerCase();
          emit('portal.gate.signature', { label, ok, expected: expectedAddr, recovered });
          if (!ok) {
            allOk = false;
            signatureIssues.push(`signature mismatch: ${label}`);
            if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
          }
        } catch (err) {
          allOk = false;
          signatureIssues.push(`signature verify error: ${label}`);
          if (requireSignatures) failures.push(signatureIssues[signatureIssues.length - 1]);
          emit('portal.gate.signature', { label, ok: false, error: String(err && err.message ? err.message : err) });
        }
      }
      signatureVerified = Boolean(inputsOk && allOk && Object.keys(sigs).length > 0);
      if (requireSignatures && !signatureVerified) {
        failures.push('signature verification failed (require-signatures=true)');
      }
      emit('portal.gate.signatures.verified', { ok: signatureVerified, require: requireSignatures });
    }
  } else if (requireSignatures && signatureAttached) {
    failures.push('unsupported signatures format');
  }

  const waveformCheckRel =
    args['waveform-check'] ||
    (fs.existsSync(path.join(bundleDir, 'waveform.check.json')) ? 'waveform.check.json' : null);

  if (requireWaveform && !waveformCheckRel) {
    failures.push('missing waveform check: require-waveform=true');
  }

  const waveformRenderCheckRel =
    args['waveform-render-check'] ||
    (fs.existsSync(path.join(bundleDir, 'waveform.render.check.json')) ? 'waveform.render.check.json' : null);

  if (requireWaveformRender && !waveformRenderCheckRel) {
    failures.push('missing waveform render check: require-waveform-render=true');
  }

  if (waveformCheckRel) {
    if (isUnsafeRelativePath(waveformCheckRel)) {
      waveformIssues.push(`unsafe waveform check path: ${waveformCheckRel}`);
      if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
    } else {
      const wfAbs = path.join(bundleDir, waveformCheckRel);
      if (!fs.existsSync(wfAbs)) {
        waveformIssues.push(`missing waveform check file: ${waveformCheckRel}`);
        if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
      } else {
        waveformAttached = true;
        try {
          waveformCheck = safeJsonRead(wfAbs);
          emit('portal.gate.waveform.read', { ok: true, path: waveformCheckRel });
        } catch (err) {
          waveformIssues.push(`invalid waveform check json: ${String(err && err.message ? err.message : err)}`);
          if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
          emit('portal.gate.waveform.read', { ok: false, path: waveformCheckRel });
        }
      }
    }
  }

  if (waveformCheck && waveformCheck.kind === 'waveform.check' && waveformCheck.schema_version === 1) {
    const wfPass = waveformCheck.pass === true;
    emit('portal.gate.waveform.pass', { pass: wfPass });

    const ndjsonDigest = sha256File(path.join(bundleDir, 'build-replay.ndjson'));
    const expectedNdjson = waveformCheck.inputs && waveformCheck.inputs.ndjson_sha256 ? waveformCheck.inputs.ndjson_sha256 : null;
    if (expectedNdjson && expectedNdjson !== ndjsonDigest) {
      waveformIssues.push('waveform inputs.ndjson_sha256 mismatch against build-replay.ndjson');
      if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
    }
    emit('portal.gate.waveform.inputs', { ok: !expectedNdjson || expectedNdjson === ndjsonDigest, expected: expectedNdjson, actual: ndjsonDigest });

    const outputs = waveformCheck.outputs && typeof waveformCheck.outputs === 'object' ? waveformCheck.outputs : {};
    const requiredWfOutputs = ['waveform-points.txt', 'waveform-summary.json', 'waveform-analysis.ndjson'];
    for (const name of requiredWfOutputs) {
      const meta = outputs[name] || null;
      if (!meta || typeof meta.path !== 'string' || typeof meta.sha256 !== 'string') {
        waveformIssues.push(`waveform check missing outputs entry: ${name}`);
        if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
        continue;
      }
      if (isUnsafeRelativePath(meta.path)) {
        waveformIssues.push(`unsafe waveform output path: ${name} -> ${meta.path}`);
        if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
        continue;
      }
      const abs = path.join(bundleDir, meta.path);
      if (!fs.existsSync(abs)) {
        waveformIssues.push(`missing waveform output file: ${meta.path}`);
        if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
        continue;
      }
      const actual = sha256File(abs);
      if (actual !== meta.sha256) {
        waveformIssues.push(`waveform output sha256 mismatch: ${meta.path}`);
        if (requireWaveform) failures.push(waveformIssues[waveformIssues.length - 1]);
      }
    }

    waveformVerified = wfPass && waveformIssues.length === 0;
    if (requireWaveform && !waveformVerified) {
      failures.push('waveform verification failed (require-waveform=true)');
    }
    emit('portal.gate.waveform.verified', { ok: waveformVerified, require: requireWaveform });
  } else if (requireWaveform && waveformAttached) {
    failures.push('unsupported waveform check format');
  }

  if (waveformRenderCheckRel) {
    if (isUnsafeRelativePath(waveformRenderCheckRel)) {
      waveformRenderIssues.push(`unsafe waveform render check path: ${waveformRenderCheckRel}`);
      if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
    } else {
      const wfAbs = path.join(bundleDir, waveformRenderCheckRel);
      if (!fs.existsSync(wfAbs)) {
        waveformRenderIssues.push(`missing waveform render check file: ${waveformRenderCheckRel}`);
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
      } else {
        waveformRenderAttached = true;
        try {
          waveformRenderCheck = safeJsonRead(wfAbs);
          emit('portal.gate.waveform.render.read', { ok: true, path: waveformRenderCheckRel });
        } catch (err) {
          waveformRenderIssues.push(`invalid waveform render check json: ${String(err && err.message ? err.message : err)}`);
          if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
          emit('portal.gate.waveform.render.read', { ok: false, path: waveformRenderCheckRel });
        }
      }
    }
  }

  if (waveformRenderCheck && waveformRenderCheck.kind === 'waveform.render.check' && waveformRenderCheck.schema_version === 1) {
    const wfPass = waveformRenderCheck.pass === true;
    emit('portal.gate.waveform.render.pass', { pass: wfPass });

    const pointsDigest = sha256File(path.join(bundleDir, 'waveform-points.txt'));
    const expectedPoints = waveformRenderCheck.inputs && waveformRenderCheck.inputs.points_sha256 ? waveformRenderCheck.inputs.points_sha256 : null;
    if (expectedPoints && expectedPoints !== pointsDigest) {
      waveformRenderIssues.push('waveform render inputs.points_sha256 mismatch against waveform-points.txt');
      if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
    }
    emit('portal.gate.waveform.render.inputs.points', { ok: !expectedPoints || expectedPoints === pointsDigest, expected: expectedPoints, actual: pointsDigest });

    const analysisDigest = sha256File(path.join(bundleDir, 'waveform-analysis.ndjson'));
    const expectedAnalysis =
      waveformRenderCheck.inputs && waveformRenderCheck.inputs.waveform_analysis_sha256
        ? waveformRenderCheck.inputs.waveform_analysis_sha256
        : null;
    if (expectedAnalysis && expectedAnalysis !== analysisDigest) {
      waveformRenderIssues.push('waveform render inputs.waveform_analysis_sha256 mismatch against waveform-analysis.ndjson');
      if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
    }
    emit('portal.gate.waveform.render.inputs.analysis', { ok: !expectedAnalysis || expectedAnalysis === analysisDigest, expected: expectedAnalysis, actual: analysisDigest });

    if (waveformCheckRel && fs.existsSync(path.join(bundleDir, waveformCheckRel))) {
      const wfCheckDigest = sha256File(path.join(bundleDir, waveformCheckRel));
      const expectedWfCheck =
        waveformRenderCheck.inputs && waveformRenderCheck.inputs.waveform_check_sha256
          ? waveformRenderCheck.inputs.waveform_check_sha256
          : null;
      if (expectedWfCheck && expectedWfCheck !== wfCheckDigest) {
        waveformRenderIssues.push('waveform render inputs.waveform_check_sha256 mismatch against waveform.check.json');
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
      }
      emit('portal.gate.waveform.render.inputs.check', { ok: !expectedWfCheck || expectedWfCheck === wfCheckDigest, expected: expectedWfCheck, actual: wfCheckDigest });
    }

    const outputs = waveformRenderCheck.outputs && typeof waveformRenderCheck.outputs === 'object' ? waveformRenderCheck.outputs : {};
    const requiredWfOutputs = ['waveform.canvas.svg', 'waveform.canisa.scene.json'];
    for (const name of requiredWfOutputs) {
      const meta = outputs[name] || null;
      if (!meta || typeof meta.path !== 'string' || typeof meta.sha256 !== 'string') {
        waveformRenderIssues.push(`waveform render check missing outputs entry: ${name}`);
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
        continue;
      }
      if (isUnsafeRelativePath(meta.path)) {
        waveformRenderIssues.push(`unsafe waveform render output path: ${name} -> ${meta.path}`);
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
        continue;
      }
      const abs = path.join(bundleDir, meta.path);
      if (!fs.existsSync(abs)) {
        waveformRenderIssues.push(`missing waveform render output file: ${meta.path}`);
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
        continue;
      }
      const actual = sha256File(abs);
      if (actual !== meta.sha256) {
        waveformRenderIssues.push(`waveform render output sha256 mismatch: ${meta.path}`);
        if (requireWaveformRender) failures.push(waveformRenderIssues[waveformRenderIssues.length - 1]);
      }
    }

    waveformRenderVerified = wfPass && waveformRenderIssues.length === 0;
    if (requireWaveformRender && !waveformRenderVerified) {
      failures.push('waveform render verification failed (require-waveform-render=true)');
    }
    emit('portal.gate.waveform.render.verified', { ok: waveformRenderVerified, require: requireWaveformRender });
  } else if (requireWaveformRender && waveformRenderAttached) {
    failures.push('unsupported waveform render check format');
  }

  const requiredPresent = fileChecks.every((f) => f.exists);
  const pass = requiredPresent && failures.length === 0;

  const outJson = {
    schema_version: 1,
    bundle_dir: bundleDir,
    required_files: required,
    required_present: requiredPresent,
    pass,
    failures,
    signature_attached: signatureAttached,
    signature_verified: signatureVerified,
    signature_issues: signatureIssues,
    waveform_attached: waveformAttached,
    waveform_verified: waveformVerified,
    waveform_issues: waveformIssues,
    waveform_render_attached: waveformRenderAttached,
    waveform_render_verified: waveformRenderVerified,
    waveform_render_issues: waveformRenderIssues,
    verified_badge_allowed:
      pass &&
      (!requireSignatures || signatureVerified) &&
      (!requireWaveform || waveformVerified) &&
      (!requireWaveformRender || waveformRenderVerified),
    optional_bridge_attached: optionalBridgeAttached,
    optional_bridge_validated: Boolean(bridgeScene && bridgeCheck),
    digests: Object.fromEntries(
      fileChecks.filter((f) => f.exists).map((f) => [f.rel, sha256File(f.abs)])
    )
  };

  emit('portal.gate.end', { pass, failures: failures.length, required_present: requiredPresent });

  const jsonPath = path.join(outDir, 'portal-gate.json');
  const ndjsonPath = path.join(outDir, 'portal-gate.ndjson');

  fs.writeFileSync(jsonPath, `${JSON.stringify(outJson, null, 2)}\n`);
  fs.writeFileSync(ndjsonPath, `${events.map((e) => JSON.stringify(e)).join('\n')}\n`);

  process.stdout.write(`${JSON.stringify({ pass, json: jsonPath, ndjson: ndjsonPath })}\n`);
  if (!pass) process.exit(2);
}

main();
