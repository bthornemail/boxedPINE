#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_DX = 360;
const DEFAULT_DY = 220;
const DEFAULT_W = 320;
const DEFAULT_H = 180;

function sha256Text(text) {
  return `sha256:${crypto.createHash('sha256').update(String(text)).digest('hex')}`;
}

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

function laneRow(event) {
  if (/^(run\.|horiz\.catalog\.|matrix\.)/.test(event)) return 0;
  if (/^(phase\.|bench\.run\.|horiz\.repo\.probe\.|capability\.run\.)/.test(event)) return 1;
  if (/^(replay\.patch|bench\.metrics|horiz\.capability\.|capability\.metrics|horiz\.repo\.probe\.fail)/.test(event)) return 2;
  if (/^(restore_|bench\.summary|horiz\.probe\.end|position\.|checkpoint\.|horiz\.probe\.stop)/.test(event)) return 3;
  return 1;
}

function phaseOf(event) {
  if (/horiz\.catalog\./.test(event)) return 'catalog';
  if (/horiz\.repo\.probe\.|horiz\.probe\./.test(event)) return 'probe';
  if (/checkpoint|position\./.test(event)) return 'checkpoint';
  if (/bundle|federation/.test(event)) return 'bundle';
  if (/render|replay|bench\./.test(event)) return 'render';
  return 'probe';
}

function readJsonIfExists(p) {
  if (!p) return null;
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

function readNdjsonLines(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeEvent(src, index) {
  const payload = src && typeof src.payload === 'object' && src.payload !== null ? src.payload : {};
  const event = typeof src.event === 'string' && src.event ? src.event : 'unknown.event';
  const seq = Number.isFinite(Number(src.seq)) ? Number(src.seq) : (index + 1);
  const timestamp = src.timestamp || src.time || null;
  return { seq, event, timestamp, payload };
}

function safeId(raw) {
  return String(raw).replace(/[^a-zA-Z0-9._:-]+/g, '_');
}

function resolveEvidenceAbs(relPath, opts) {
  if (!relPath) return null;
  if (path.isAbsolute(relPath)) return relPath;
  if (opts.evidenceRoot) return path.resolve(opts.evidenceRoot, relPath);
  if (opts.outDir) return path.resolve(opts.outDir, relPath);
  return path.resolve(relPath);
}

function makeFileNode(relPath, x, y, opts, title) {
  const abs = resolveEvidenceAbs(relPath, opts);
  const exists = abs ? fs.existsSync(abs) : false;
  const id = `f:${safeId(relPath)}`;
  return {
    id,
    type: 'file',
    x,
    y,
    width: DEFAULT_W,
    height: 120,
    file: relPath,
    subpath: relPath,
    title: title || relPath,
    exists
  };
}

function buildGraph(events, lane, options = {}) {
  const dx = Number(options.dx || DEFAULT_DX);
  const dy = Number(options.dy || DEFAULT_DY);
  const nodeWidth = Number(options.width || DEFAULT_W);
  const nodeHeight = Number(options.height || DEFAULT_H);
  const sourceFile = options.sourceFile || null;

  const nodes = [];
  const edges = [];
  const bySeq = new Map();

  const catalog = readJsonIfExists(options.catalogPath);
  const probe = readJsonIfExists(options.probePath);
  const position = readJsonIfExists(options.positionPath);

  const phaseSet = new Set(['catalog', 'probe', 'render', 'bundle', 'checkpoint']);
  for (const e of events) phaseSet.add(phaseOf(e.event));
  const phases = [...phaseSet].sort();

  const repos = (catalog && Array.isArray(catalog.repos))
    ? catalog.repos.map((r) => r.path).filter(Boolean).sort()
    : [];

  const phaseNodeByName = new Map();
  const repoNodeByName = new Map();
  const evidenceNodeByPath = new Map();

  let x = dx;
  for (const phase of phases) {
    const id = `g:phase:${safeId(phase)}`;
    phaseNodeByName.set(phase, id);
    nodes.push({
      id,
      type: 'group',
      x,
      y: 4 * dy,
      width: nodeWidth,
      height: 100,
      text: `phase: ${phase}`,
      lane,
      kind: 'phase-group'
    });
    x += dx;
  }

  x = dx;
  for (const repo of repos) {
    const id = `g:repo:${safeId(repo)}`;
    repoNodeByName.set(repo, id);
    nodes.push({
      id,
      type: 'group',
      x,
      y: 5 * dy,
      width: nodeWidth,
      height: 100,
      text: `repo: ${repo}`,
      lane,
      kind: 'repo-group'
    });
    x += dx;
  }

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const id = `e:${e.seq}`;
    if (bySeq.has(e.seq)) continue;
    bySeq.set(e.seq, id);

    const repoName = e.payload && typeof e.payload.repo === 'string' ? e.payload.repo : null;
    const phase = phaseOf(e.event);

    nodes.push({
      id,
      type: 'text',
      x: e.seq * dx,
      y: laneRow(e.event) * dy,
      width: nodeWidth,
      height: nodeHeight,
      text: [
        `**event:** ${e.event}`,
        `**seq:** ${e.seq}`,
        `**ts:** ${e.timestamp || 'n/a'}`,
        '',
        '```json',
        JSON.stringify(e.payload || {}, null, 2),
        '```'
      ].join('\n'),
      eventIndex: e.seq,
      eventType: e.event,
      lane,
      digest: e.raw_digest || null,
      source: sourceFile ? { file: sourceFile, line: e.line_number || null } : null,
      repo: repoName,
      phase
    });
  }

  const sorted = [...events].sort((a, b) => a.seq - b.seq);
  for (let i = 0; i < sorted.length - 1; i++) {
    const fromNode = bySeq.get(sorted[i].seq);
    const toNode = bySeq.get(sorted[i + 1].seq);
    if (!fromNode || !toNode) continue;
    edges.push({
      id: `edge:seq:${sorted[i].seq}->${sorted[i + 1].seq}`,
      fromNode,
      toNode,
      toEnd: 'arrow'
    });
  }

  for (const e of sorted) {
    if (e.event !== 'replay.patch') continue;
    const target = Number(e.payload && e.payload.target_seq);
    if (!Number.isFinite(target)) continue;
    const fromNode = bySeq.get(e.seq);
    const toNode = bySeq.get(target);
    if (!fromNode || !toNode) continue;
    edges.push({
      id: `edge:patch:${e.seq}->${target}`,
      fromNode,
      toNode,
      toEnd: 'arrow',
      label: `target_seq=${target}`
    });
  }

  const globalEvidence = [
    'probe.json',
    'catalog.json',
    'position.json',
    'build-replay-check.json',
    'index.json',
    'capabilities.json'
  ];

  let fx = dx;
  for (const rel of globalEvidence) {
    const node = makeFileNode(rel, fx, 6 * dy, {
      evidenceRoot: options.outDir,
      outDir: options.outDir
    }, rel);
    evidenceNodeByPath.set(rel, node.id);
    nodes.push(node);
    fx += dx;
  }

  if (probe && Array.isArray(probe.repos)) {
    for (const rec of probe.repos) {
      const repo = rec.repo || null;
      const stdoutRel = rec.latest_stdout_path || rec.stdout_path || null;
      const stderrRel = rec.latest_stderr_path || rec.stderr_path || null;
      for (const relPath of [stdoutRel, stderrRel]) {
        if (!relPath) continue;
        if (evidenceNodeByPath.has(relPath)) continue;
        const node = makeFileNode(relPath, fx, 7 * dy, {
          evidenceRoot: options.evidenceRoot,
          outDir: options.outDir
        }, `${repo || 'repo'}:${path.basename(relPath)}`);
        evidenceNodeByPath.set(relPath, node.id);
        nodes.push(node);
        fx += dx;
      }
    }
  }

  for (const e of sorted) {
    const eventId = bySeq.get(e.seq);
    if (!eventId) continue;

    const phase = phaseOf(e.event);
    const phaseId = phaseNodeByName.get(phase);
    if (phaseId) {
      edges.push({
        id: `edge:event_phase:${e.seq}->${safeId(phase)}`,
        fromNode: eventId,
        toNode: phaseId,
        toEnd: 'arrow'
      });
    }

    const repo = e.payload && typeof e.payload.repo === 'string' ? e.payload.repo : null;
    if (repo && repoNodeByName.has(repo)) {
      edges.push({
        id: `edge:event_repo:${e.seq}->${safeId(repo)}`,
        fromNode: eventId,
        toNode: repoNodeByName.get(repo),
        toEnd: 'arrow'
      });
    }

    if (repo && probe && Array.isArray(probe.repos)) {
      const rec = probe.repos.find((r) => r.repo === repo) || null;
      if (rec) {
        for (const relPath of [rec.latest_stdout_path || rec.stdout_path || null, rec.latest_stderr_path || rec.stderr_path || null]) {
          if (!relPath) continue;
          const targetId = evidenceNodeByPath.get(relPath);
          if (!targetId) continue;
          edges.push({
            id: `edge:event_evidence:${e.seq}->${safeId(relPath)}`,
            fromNode: eventId,
            toNode: targetId,
            toEnd: 'arrow',
            label: path.basename(relPath)
          });
        }
      }
    }
  }

  if (position && sorted.length > 0 && evidenceNodeByPath.has('position.json')) {
    const tail = bySeq.get(sorted[sorted.length - 1].seq);
    if (tail) {
      edges.push({
        id: 'edge:tail:position',
        fromNode: tail,
        toNode: evidenceNodeByPath.get('position.json'),
        toEnd: 'arrow'
      });
    }
  }

  return { nodes, edges, repos, phases, evidenceNodeByPath };
}

function validateGraph(graph) {
  const ids = new Set((graph.nodes || []).map((n) => n.id));
  const missingEdgeRefs = [];
  for (const e of (graph.edges || [])) {
    if (!ids.has(e.fromNode) || !ids.has(e.toNode)) {
      missingEdgeRefs.push({ id: e.id, fromNode: e.fromNode, toNode: e.toNode });
    }
  }

  const evidenceNodes = (graph.nodes || []).filter((n) => n.type === 'file');
  const missingEvidence = evidenceNodes.filter((n) => n.exists === false).map((n) => n.file);

  return {
    valid: missingEdgeRefs.length === 0,
    nodes: (graph.nodes || []).length,
    edges: (graph.edges || []).length,
    missing_edge_refs: missingEdgeRefs,
    missing_evidence: missingEvidence,
    missing_evidence_count: missingEvidence.length
  };
}

function summarizeGraph(graph, check, lane) {
  const nodeList = graph.nodes || [];
  const edgeList = graph.edges || [];
  const eventNodes = nodeList.filter((n) => n.id && n.id.startsWith('e:')).length;
  const repoGroupNodes = nodeList.filter((n) => n.kind === 'repo-group').length;
  const phaseGroupNodes = nodeList.filter((n) => n.kind === 'phase-group').length;
  const evidenceNodes = nodeList.filter((n) => n.type === 'file').length;
  return {
    schema_version: 1,
    lane,
    counts: {
      nodes: nodeList.length,
      edges: edgeList.length,
      event_nodes: eventNodes,
      repo_group_nodes: repoGroupNodes,
      phase_group_nodes: phaseGroupNodes,
      evidence_nodes: evidenceNodes,
      missing_evidence: check.missing_evidence_count
    },
    repos: graph.repos,
    phases: graph.phases,
    missing_evidence: check.missing_evidence
  };
}

function emitCanvasLFromEvents(events, outPath, lane, options = {}) {
  const graph = buildGraph(events, lane, options);
  const lines = [];
  lines.push('@version: "1.0"');
  lines.push('@schema: "jsoncanvas-1.0+canvasl-min"');
  lines.push(JSON.stringify({
    directive: 'generator',
    lane,
    input_sha: options.inputSha || null,
    layout_params: {
      dx: Number(options.dx || DEFAULT_DX),
      dy: Number(options.dy || DEFAULT_DY),
      width: Number(options.width || DEFAULT_W),
      height: Number(options.height || DEFAULT_H)
    }
  }));
  for (const n of graph.nodes) lines.push(JSON.stringify({ kind: 'node', ...n }));
  for (const e of graph.edges) lines.push(JSON.stringify({ kind: 'edge', ...e }));
  fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');

  const check = validateGraph(graph);
  const summary = summarizeGraph(graph, check, lane);
  return { graph, check, summary };
}

function main() {
  const args = parseArgs(process.argv);
  const inPath = args.in;
  const outPath = args.out;
  const lane = String(args.lane || 'bench');
  const checkOut = args['check-out'] || (outPath ? `${outPath}.check.json` : null);
  const summaryOut = args['summary-out'] || (outPath ? `${outPath}.summary.json` : null);
  if (!inPath || !outPath) {
    console.error('usage: emit-canvasl.js --in <ndjson> --out <canvasl> [--lane <lane>] [--check-out <json>] [--summary-out <json>]');
    process.exit(1);
  }

  const inAbs = path.resolve(inPath);
  const lines = readNdjsonLines(inAbs);
  const events = lines.map((line, idx) => {
    const parsed = JSON.parse(line);
    const e = normalizeEvent(parsed, idx);
    e.line_number = idx + 1;
    e.raw_digest = sha256Text(line);
    return e;
  });
  const inputSha = sha256Text(lines.join('\n'));
  const outAbs = path.resolve(outPath);
  const outDir = path.dirname(outAbs);

  const { check, summary } = emitCanvasLFromEvents(events, outAbs, lane, {
    inputSha,
    sourceFile: inPath,
    catalogPath: args.catalog ? path.resolve(args.catalog) : path.join(outDir, 'catalog.json'),
    probePath: args.probe ? path.resolve(args.probe) : path.join(outDir, 'probe.json'),
    positionPath: args.position ? path.resolve(args.position) : path.join(outDir, 'position.json'),
    evidenceRoot: args['evidence-root'] ? path.resolve(args['evidence-root']) : null,
    outDir
  });

  if (checkOut) {
    fs.writeFileSync(path.resolve(checkOut), JSON.stringify({
      schema_version: 1,
      lane,
      canvasl_path: outPath,
      ...check
    }, null, 2) + '\n', 'utf8');
  }
  if (summaryOut) {
    fs.writeFileSync(path.resolve(summaryOut), JSON.stringify(summary, null, 2) + '\n', 'utf8');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  emitCanvasLFromEvents,
  validateGraph
};
