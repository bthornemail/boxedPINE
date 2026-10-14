/**
 * OMI-IMO Full −5D → 10D Dimension Pipeline
 *
 * Canonical map (Spec §13 / Untitled 47/50):
 *  −5D  Blob              universal substrate (bytes)
 *  −4D  color codex       spectral / palette
 *  −3D  linear            page/line delimiters
 *  −2D  hierarchical      block delimiters
 *  −1D  classifying       regex tokens (G)
 *   0D  observer          PannerNode / centroid
 *   1D  DOMPoint          canvas coordinates
 *   2D  Media Track       cues
 *   3D  DOMRect           hit-zone bounds
 *   4D  DOMMatrix         transform composition
 *   5D  DOMElement        <dl>/<dt>/<dd>
 *   6D  Canvas            rendering surface
 *   7D  Event Loop        cuechange ticks
 *   8D  Byte Basis        Blob structure
 *   9D  Network Mesh      multi-peer
 *  10D  Orchestrator      validation
 *
 * Builds on constraint-pipeline (−5D…−1D) and ruler (bind/apply/eval/digest).
 * Output at 1D–6D is SVG-ready.
 */
'use strict';

const { runPipeline: runConstraintPipeline, LAYERS: CONSTRAINT_LAYERS } = require('./constraint-pipeline');
const { createRuler, digest, bind, apply, evaluate, xorNumber } = require('./ruler');
const { G, admits, CORRELATION } = require('./regex-constraints');

// ---------- Dimension registry ----------
const DIMENSIONS = Object.freeze([
  { d: -5, name: 'blob',           role: 'universal substrate' },
  { d: -4, name: 'color-codex',    role: 'spectral / palette' },
  { d: -3, name: 'linear',         role: 'page/line delimiters' },
  { d: -2, name: 'hierarchical',   role: 'block delimiters' },
  { d: -1, name: 'classifying',    role: 'regex tokens' },
  { d:  0, name: 'observer',       role: 'PannerNode / centroid' },
  { d:  1, name: 'dom-point',      role: 'canvas coordinates' },
  { d:  2, name: 'media-track',    role: 'cues' },
  { d:  3, name: 'dom-rect',       role: 'hit-zone bounds' },
  { d:  4, name: 'dom-matrix',     role: 'transform composition' },
  { d:  5, name: 'dom-element',    role: '<dl>/<dt>/<dd>' },
  { d:  6, name: 'canvas',         role: 'rendering surface' },
  { d:  7, name: 'event-loop',     role: 'cuechange ticks' },
  { d:  8, name: 'byte-basis',     role: 'Blob structure' },
  { d:  9, name: 'network-mesh',   role: 'multi-peer' },
  { d: 10, name: 'orchestrator',   role: 'validation' }
]);

// −4D color codex (24 = 4! palette indices, simplified RGB seeds)
const COLOR_CODEX = Object.freeze([
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#e94560', '#533483', '#e94560', '#0f3460',
  '#1a1a2e', '#16213e', '#533483', '#e94560',
  '#f5f5f5', '#e8e8f0', '#c0c0d0', '#a0a0b0',
  '#5b8def', '#6dcea5', '#e0b050', '#e07a7a',
  '#7a5be0', '#5be0c0', '#e05b8d', '#8de05b'
]);

// ---------- Stage implementations ----------

function stageBlob(input, ctx) {
  // −5D: normalize to bytes
  let bytes;
  if (typeof input === 'string') {
    bytes = typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(input)
      : Buffer.from(input, 'utf8');
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else if (ArrayBuffer.isView(input)) {
    bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
    bytes = new Uint8Array(input);
  } else {
    bytes = new Uint8Array(0);
  }
  ctx.blob = bytes;
  ctx.byteLength = bytes.byteLength;
  return { dimension: -5, name: 'blob', byteLength: bytes.byteLength, ok: true };
}

function stageColorCodex(ctx) {
  // −4D: map byteLength / XOR fold into palette index
  const idx = (ctx.byteLength * 7 + (ctx.xorSeed || 0)) % COLOR_CODEX.length;
  ctx.color = COLOR_CODEX[idx];
  ctx.colorIndex = idx;
  return { dimension: -4, name: 'color-codex', color: ctx.color, index: idx, ok: true };
}

function stageLinear(ctx) {
  // −3D: already handled by constraint pipeline delimiter layer; expose segments
  const segs = (ctx.constraint && ctx.constraint.layers)
    ? (ctx.constraint.layers.find(l => l.dimension === -3) || {}).matches || []
    : [];
  ctx.linearSegments = segs;
  return { dimension: -3, name: 'linear', segmentCount: segs.length, ok: true };
}

function stageHierarchical(ctx) {
  // −2D: non-alphanumeric runs as hierarchy markers
  const runs = (ctx.constraint && ctx.constraint.layers)
    ? (ctx.constraint.layers.find(l => l.dimension === -2) || {}).matches || []
    : [];
  ctx.hierarchyMarkers = runs;
  return { dimension: -2, name: 'hierarchical', markerCount: runs.length, ok: true };
}

function stageClassifying(ctx) {
  // −1D: alphanumeric tokens + G admission
  const tokens = (ctx.constraint && ctx.constraint.tokens) || [];
  const admitted = [];
  const rejected = [];
  for (const t of tokens) {
    const s = typeof t === 'string' ? t : (typeof TextDecoder !== 'undefined'
      ? new TextDecoder().decode(t)
      : Buffer.from(t).toString('utf8'));
    // admit if any core G class matches a single-char or the practical mnemonic form
    let ok = false;
    if (s.length === 1) {
      ok = admits('FRONT', s) || admits('BACK', s) || admits('INSIDE', s) ||
           admits('UP', s) || admits('DOWN', s);
    } else {
      ok = admits('OMI_MNEMONIC', s) || /^[A-Za-z0-9]+$/.test(s);
    }
    (ok ? admitted : rejected).push(s);
  }
  ctx.tokens = admitted;
  ctx.rejectedTokens = rejected;
  return {
    dimension: -1,
    name: 'classifying',
    tokenCount: admitted.length,
    rejectedCount: rejected.length,
    ok: true
  };
}

function stageObserver(ctx) {
  // 0D: derive observer position from digest of a ruler seeded by tokens
  const ruler = createRuler();
  const toks = ctx.tokens || [];
  for (let i = 0; i < 8; i++) {
    const t = toks[i % Math.max(toks.length, 1)] || '';
    ruler[i] = t.length ? (t.charCodeAt(0) % 64) : (i + 1);
  }
  const dig = digest(ruler, 1);
  ctx.ruler = ruler;
  ctx.digest = dig;
  ctx.observer = {
    x: dig.value,
    y: dig.xorFold % 1000,
    z: dig.weight % 100
  };
  return { dimension: 0, name: 'observer', observer: ctx.observer, ok: true };
}

function stageDomPoint(ctx) {
  // 1D: project observer + token indices into points
  const points = [];
  const toks = ctx.tokens || ['origin'];
  const base = ctx.observer || { x: 0, y: 0 };
  toks.forEach((t, i) => {
    points.push({
      x: base.x + (i * 24) + (t.charCodeAt(0) % 16),
      y: base.y + ((i * 13) % 40),
      label: t
    });
  });
  ctx.points = points;
  return { dimension: 1, name: 'dom-point', pointCount: points.length, ok: true };
}

function stageMediaTrack(ctx) {
  // 2D: turn tokens into cue-like records
  const cues = (ctx.tokens || []).map((t, i) => ({
    id: `cue-${i}`,
    start: i * 0.5,
    end: (i + 1) * 0.5,
    text: t,
    layer: '-1D'
  }));
  ctx.cues = cues;
  return { dimension: 2, name: 'media-track', cueCount: cues.length, ok: true };
}

function stageDomRect(ctx) {
  // 3D: axis-aligned bounds around each point
  const rects = (ctx.points || []).map(p => ({
    x: p.x - 8,
    y: p.y - 8,
    width: 16 + (p.label ? p.label.length * 4 : 0),
    height: 16,
    label: p.label
  }));
  ctx.rects = rects;
  return { dimension: 3, name: 'dom-rect', rectCount: rects.length, ok: true };
}

function stageDomMatrix(ctx) {
  // 4D: identity + optional translate from observer
  const o = ctx.observer || { x: 0, y: 0 };
  ctx.matrix = {
    a: 1, b: 0, c: 0, d: 1,
    e: o.x * 0.01,
    f: o.y * 0.01
  };
  return { dimension: 4, name: 'dom-matrix', matrix: ctx.matrix, ok: true };
}

function stageDomElement(ctx) {
  // 5D: emit serializable <dl>/<dt>/<dd> structure
  const cells = (ctx.tokens || []).map((t, i) => ({
    id: `cell-${i}`,
    mnemonic: t.slice(0, 8),
    band: (i % 4) + 1,
    offset: i * 32,
    bpe: [1, 2, 4, 8][i % 4]
  }));
  ctx.elements = cells;
  return { dimension: 5, name: 'dom-element', cellCount: cells.length, ok: true };
}

function stageCanvas(ctx) {
  // 6D: SVG-ready scene description
  const rects = ctx.rects || [];
  const color = ctx.color || '#5b8def';
  const matrix = ctx.matrix || { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  const width = Math.max(200, ...rects.map(r => r.x + r.width), 0) + 20;
  const height = Math.max(100, ...rects.map(r => r.y + r.height), 0) + 20;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  parts.push(`  <g transform="matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})">`);
  rects.forEach((r, i) => {
    parts.push(`    <rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="1" data-label="${escapeXml(r.label || '')}"/>`);
    if (r.label) {
      parts.push(`    <text x="${r.x + 2}" y="${r.y + 12}" font-size="10" font-family="monospace" fill="#e8e8f0">${escapeXml(r.label)}</text>`);
    }
  });
  parts.push('  </g>');
  parts.push('</svg>');

  ctx.svg = parts.join('\n');
  ctx.canvas = { width, height, rectCount: rects.length };
  return { dimension: 6, name: 'canvas', width, height, svgLength: ctx.svg.length, ok: true };
}

function stageEventLoop(ctx) {
  // 7D: tick schedule from cues
  const ticks = (ctx.cues || []).map(c => ({ t: c.start, event: 'cuechange', id: c.id }));
  ctx.ticks = ticks;
  return { dimension: 7, name: 'event-loop', tickCount: ticks.length, ok: true };
}

function stageByteBasis(ctx) {
  // 8D: structural view of the blob
  const bl = ctx.byteLength || 0;
  ctx.byteBasis = {
    byteLength: bl,
    byteOffset: 0,
    bytesPerElement: 1,
    orderings: 6 // 3!
  };
  return { dimension: 8, name: 'byte-basis', ...ctx.byteBasis, ok: true };
}

function stageNetworkMesh(ctx) {
  // 9D: placeholder mesh descriptor (single node for now)
  ctx.mesh = {
    nodes: 1,
    edges: 0,
    peers: ['local']
  };
  return { dimension: 9, name: 'network-mesh', nodes: 1, ok: true };
}

function stageOrchestrator(ctx) {
  // 10D: validation summary
  const stagesOk = (ctx.stageResults || []).every(s => s.ok);
  const hasSvg = typeof ctx.svg === 'string' && ctx.svg.length > 0;
  const hasTokens = (ctx.tokens || []).length > 0;
  ctx.validation = {
    stagesOk,
    hasSvg,
    hasTokens,
    tokenCount: (ctx.tokens || []).length,
    readyForSvg: stagesOk && hasSvg
  };
  return {
    dimension: 10,
    name: 'orchestrator',
    validation: ctx.validation,
    ok: stagesOk
  };
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Full pipeline runner ----------
/**
 * Run the complete −5D → 10D pipeline.
 * @param {string|Uint8Array|Buffer|ArrayBuffer} input
 * @param {object} [opts]
 * @returns {object} full context + stage results + svg
 */
function runFullPipeline(input, opts = {}) {
  const ctx = {
    stageResults: [],
    xorSeed: opts.xorSeed || 0
  };

  // −5D
  ctx.stageResults.push(stageBlob(input, ctx));

  // Run constraint pipeline (−5 already done as blob; reuse for −4…−1 text/binary logic)
  ctx.constraint = runConstraintPipeline(input, opts);
  if (ctx.constraint.kind === 'text' || ctx.constraint.kind === 'binary') {
    // seed xor from constraint if available
    ctx.xorSeed = ctx.xorSeed || (ctx.constraint.byteLength * 3);
  }

  // −4 … −1 (constraint-derived + explicit stages)
  ctx.stageResults.push(stageColorCodex(ctx));
  ctx.stageResults.push(stageLinear(ctx));
  ctx.stageResults.push(stageHierarchical(ctx));
  ctx.stageResults.push(stageClassifying(ctx));

  // 0D … 10D
  ctx.stageResults.push(stageObserver(ctx));
  ctx.stageResults.push(stageDomPoint(ctx));
  ctx.stageResults.push(stageMediaTrack(ctx));
  ctx.stageResults.push(stageDomRect(ctx));
  ctx.stageResults.push(stageDomMatrix(ctx));
  ctx.stageResults.push(stageDomElement(ctx));
  ctx.stageResults.push(stageCanvas(ctx));
  ctx.stageResults.push(stageEventLoop(ctx));
  ctx.stageResults.push(stageByteBasis(ctx));
  ctx.stageResults.push(stageNetworkMesh(ctx));
  ctx.stageResults.push(stageOrchestrator(ctx));

  return Object.freeze({
    dimensions: DIMENSIONS,
    stages: ctx.stageResults,
    tokens: ctx.tokens || [],
    observer: ctx.observer,
    points: ctx.points || [],
    rects: ctx.rects || [],
    matrix: ctx.matrix,
    elements: ctx.elements || [],
    cues: ctx.cues || [],
    svg: ctx.svg || '',
    canvas: ctx.canvas,
    validation: ctx.validation,
    color: ctx.color,
    ok: ctx.validation && ctx.validation.readyForSvg
  });
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const sample = 'Hello OMI color\r\nBand2 tokenA1';
  const out = runFullPipeline(sample);

  assert('pipeline ok', out.ok === true);
  assert('16 stages', out.stages.length === 16, String(out.stages.length));
  assert('has tokens', out.tokens.length > 0, String(out.tokens.length));
  assert('has observer', out.observer && typeof out.observer.x === 'number');
  assert('has points', out.points.length > 0);
  assert('has rects', out.rects.length > 0);
  assert('has matrix', out.matrix && out.matrix.a === 1);
  assert('has elements', out.elements.length > 0);
  assert('has svg', typeof out.svg === 'string' && out.svg.includes('<svg'));
  assert('svg has rect', out.svg.includes('<rect'));
  assert('validation ready', out.validation && out.validation.readyForSvg);

  // binary path
  const bin = new Uint8Array([0x41, 0x42, 0x0d, 0x0a, 0x33, 0x34]);
  const outB = runFullPipeline(bin);
  assert('binary pipeline runs', outB.stages.length === 16);
  assert('binary has svg', outB.svg.includes('<svg'));

  // dimension names
  assert('dim -5 is blob', DIMENSIONS[0].name === 'blob');
  assert('dim 6 is canvas', DIMENSIONS[11].name === 'canvas');
  assert('dim 10 is orchestrator', DIMENSIONS[15].name === 'orchestrator');

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results,
    sampleSvgLength: out.svg.length
  };
}

module.exports = {
  DIMENSIONS,
  COLOR_CODEX,
  runFullPipeline,
  selfTest
};
