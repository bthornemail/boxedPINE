#!/usr/bin/env node
/**
 * Deterministic projection-only bridge:
 *   build-replay.ndjson + build-replay.svg -> portal-scene.json + portal-overlay.svg + portal-bridge.check.json
 *
 * Canon stays NDJSON. SVG is a projection. portal-scene.json is a projection.
 * Fail-closed: inputs must exist; input size bounded; NDJSON must parse.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}

function sha256Bytes(buf) {
  return `sha256:${crypto.createHash('sha256').update(buf).digest('hex')}`;
}

function sha256Text(s) {
  return sha256Bytes(Buffer.from(String(s), 'utf8'));
}

function mustStat(p) {
  try {
    return fs.statSync(p);
  } catch {
    throw new Error(`missing_required_file:${p}`);
  }
}

function readBytesBounded(p, maxBytes) {
  const st = mustStat(p);
  if (st.size > maxBytes) throw new Error(`file_too_large:${p}:${st.size}>${maxBytes}`);
  return fs.readFileSync(p);
}

function readUtf8Bounded(p, maxBytes) {
  const st = mustStat(p);
  if (st.size > maxBytes) throw new Error(`file_too_large:${p}:${st.size}>${maxBytes}`);
  return fs.readFileSync(p, 'utf8');
}

function safeJsonParse(line, lineNo) {
  try {
    return JSON.parse(line);
  } catch (err) {
    throw new Error(`ndjson_parse_error:line=${lineNo}:${String(err && err.message ? err.message : err)}`);
  }
}

function extractSvgMeta(svgText) {
  const viewBox = (svgText.match(/\bviewBox\s*=\s*"([^"]+)"/i) || [])[1] || null;
  const width = (svgText.match(/\bwidth\s*=\s*"([^"]+)"/i) || [])[1] || null;
  const height = (svgText.match(/\bheight\s*=\s*"([^"]+)"/i) || [])[1] || null;
  return { viewBox, width, height };
}

function laneRow(eventName) {
  const e = String(eventName || '');
  if (/^(horiz\.catalog\.|vm\.bench\.|universe\.|run\.)/.test(e)) return 0;
  if (/(\.start$|\.end$|\.metric$|horiz\.repo\.probe\.)/.test(e)) return 1;
  if (/(fail|hard_break|dirty_growth|replay\.patch|patch)/.test(e)) return 2;
  if (/(checkpoint|position|summary)/.test(e)) return 3;
  return 1;
}

function classify(eventName, payload) {
  const e = String(eventName || '');
  if (/(probe\.fail|hard_break|dirty_growth)/.test(e)) return { kind: 'system', severity: 'error' };
  if (/soft_fail/.test(e)) return { kind: 'system', severity: 'warn' };
  if (e.startsWith('vm.bench.')) return { kind: 'benchmark', severity: 'info' };
  if (e.startsWith('horiz.')) return { kind: 'integration', severity: 'info' };
  if (e.startsWith('replay.patch')) return { kind: 'patch', severity: 'info' };
  if (payload && typeof payload === 'object' && (payload.repo || payload.repo_path)) return { kind: 'repo', severity: 'info' };
  return { kind: 'event', severity: 'info' };
}

function main() {
  const args = parseArgs(process.argv);

  const ndjsonPath = args.ndjson || args.in || null;
  const svgPath = args.svg || null;
  const outDir = args['out-dir'] || args.out || null;
  const dx = Number.isFinite(Number(args.dx)) ? Number(args.dx) : 360;
  const dz = Number.isFinite(Number(args.dz)) ? Number(args.dz) : 240;

  if (!ndjsonPath || !svgPath || !outDir) {
    // Keep usage terse; this is run from CI/scripts.
    process.stderr.write(
      'usage: ndjson-svg-portal-bridge.js --ndjson <file> --svg <file> --out-dir <dir> [--dx N] [--dz N]\n'
    );
    process.exit(1);
  }

  const cwd = process.cwd();
  const ndAbs = path.resolve(cwd, ndjsonPath);
  const svgAbs = path.resolve(cwd, svgPath);
  const outAbs = path.resolve(cwd, outDir);
  fs.mkdirSync(outAbs, { recursive: true });

  // Guardrails: keep bounded.
  const ndBytes = readBytesBounded(ndAbs, 25 * 1024 * 1024);
  const svgText = readUtf8Bounded(svgAbs, 25 * 1024 * 1024);
  const ndSha = sha256Bytes(ndBytes);
  const svgSha = sha256Text(svgText);
  const svgMeta = extractSvgMeta(svgText);

  const lines = ndBytes
    .toString('utf8')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const entities = [];
  const edges = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const lineNo = i + 1;
    const obj = safeJsonParse(raw, lineNo);
    const eventName = obj.event || obj.k || obj.type || 'unknown.event';
    const payload = obj.payload && typeof obj.payload === 'object' ? obj.payload : obj.payload ?? obj;
    const seq = Number.isFinite(Number(obj.seq)) ? Number(obj.seq) : null;
    const id = seq !== null ? `e:${seq}` : `e:line:${lineNo}`;

    const row = laneRow(eventName);
    const { kind, severity } = classify(eventName, payload);

    entities.push({
      id,
      kind,
      severity,
      label: String(eventName),
      position: { x: (seq !== null ? seq : lineNo) * dx, y: 0, z: row * dz },
      avatar: { type: 'svg', source: 'portal-overlay.svg' },
      meta: {
        seq,
        line: lineNo,
        timestamp: obj.timestamp || obj.time || null,
        digest: sha256Text(raw),
        payload
      }
    });

    if (i > 0) {
      const prevObj = safeJsonParse(lines[i - 1], i);
      const prevSeq = Number.isFinite(Number(prevObj.seq)) ? Number(prevObj.seq) : null;
      const fromId = prevSeq !== null ? `e:${prevSeq}` : `e:line:${i}`;
      edges.push({ id: `edge:adj:${fromId}->${id}`, from: fromId, to: id, kind: 'adjacent' });
    }

    if (String(eventName) === 'replay.patch' && payload && Number.isFinite(Number(payload.target_seq))) {
      const target = Number(payload.target_seq);
      edges.push({
        id: `edge:patch:${id}->e:${target}`,
        from: id,
        to: `e:${target}`,
        kind: 'patch',
        label: `target_seq=${target}`
      });
    }
  }

  const scene = {
    schema_version: 1,
    kind: 'portal-scene',
    generator: 'ndjson-svg-portal-bridge',
    generated_at: new Date().toISOString(),
    inputs: {
      ndjson: { path: ndjsonPath, sha256: ndSha },
      svg: { path: svgPath, sha256: svgSha, meta: svgMeta }
    },
    layout: { dx, dz, axis: { x: 'horizon(seq/line)', z: 'strata(laneRow)' } },
    entities,
    edges
  };

  const scenePath = path.join(outAbs, 'portal-scene.json');
  fs.writeFileSync(scenePath, `${JSON.stringify(scene, null, 2)}\n`, 'utf8');

  // Deterministic overlay: byte-identical copy of build-replay.svg.
  const overlayPath = path.join(outAbs, 'portal-overlay.svg');
  fs.writeFileSync(overlayPath, svgText, 'utf8');

  const check = {
    schema_version: 1,
    kind: 'portal-bridge.check',
    pass: true,
    inputs: { ndjson_sha256: ndSha, svg_sha256: svgSha },
    outputs: {
      'portal-scene.json': { path: 'portal-scene.json', sha256: sha256Text(fs.readFileSync(scenePath, 'utf8')) },
      'portal-overlay.svg': { path: 'portal-overlay.svg', sha256: sha256Text(fs.readFileSync(overlayPath, 'utf8')) }
    },
    counts: { entities: entities.length, edges: edges.length }
  };

  const checkPath = path.join(outAbs, 'portal-bridge.check.json');
  fs.writeFileSync(checkPath, `${JSON.stringify(check, null, 2)}\n`, 'utf8');

  process.stdout.write(`${JSON.stringify({ ok: true, out_dir: path.relative(cwd, outAbs), entities: entities.length })}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
}

