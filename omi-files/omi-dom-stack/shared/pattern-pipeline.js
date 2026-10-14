/**
 * OMI-IMO Snap-to-Grid Pattern Pipeline
 *
 * Pointer event → attribution → snap → trigintaduonion triple →
 * edge n-gram → spatial GNN → contrasting orchestrator → constraint edit
 *
 * Media types: svg | canvas | webvtt | webaudio | html | binary
 */
'use strict';

const { snapToGrid, snapToCube, findPlatonic, PLATONIC } = require('./solid-toolkit');
const { JOHNSON, KEPLER_POINSOT, snapToJohnson, snapToStar } = require('./solid-toolkit-extended');
const { classifySolid, trigintaduonionIndex, buildTripleMap } = require('./solid-to-triple');
const { buildAdjacency, cycleEdges, spectralAddress, hashNgram } = require('./edge-ngram');
const { runGNN } = require('./spatial-gnn');
const { orchestrator, isFixed, converge } = require('./contrasting-orchestrator');
const { admits, G } = require('./regex-constraints');

const MEDIA_TYPES = Object.freeze([
  'svg', 'canvas', 'webvtt', 'webaudio', 'html', 'binary'
]);

// Pre-build triple map over Johnson + KP for stable indices
const SOLID_CATALOG = Object.freeze({
  ...Object.fromEntries(Object.entries(JOHNSON).map(([k, v]) => [k, v])),
  ...Object.fromEntries(Object.entries(KEPLER_POINSOT).map(([k, v]) => [k, v])),
  tetrahedron: { name: 'tetrahedron', v: 4, e: 6, f: 4 },
  cube: { name: 'cube', v: 8, e: 12, f: 6 }
});
const TRIPLE_MAP = buildTripleMap(SOLID_CATALOG);

/**
 * Normalize a pointer-like event (DOM PointerEvent or plain object).
 */
function normalizePointer(ev) {
  if (!ev || typeof ev !== 'object') {
    return { id: 0, x: 0, y: 0, pressure: 0, timestamp: Date.now(), type: 'none' };
  }
  return {
    id: ev.pointerId != null ? ev.pointerId : (ev.id != null ? ev.id : 0),
    x: Number(ev.clientX != null ? ev.clientX : (ev.x != null ? ev.x : 0)),
    y: Number(ev.clientY != null ? ev.clientY : (ev.y != null ? ev.y : 0)),
    pressure: Number(ev.pressure != null ? ev.pressure : 1),
    timestamp: ev.timeStamp != null ? ev.timeStamp : Date.now(),
    type: ev.pointerType || ev.type || 'mouse'
  };
}

/**
 * Spatial attribution: raw pointer → continuous coordinate (+ optional pressure weight).
 */
function attribute(pointer, opts = {}) {
  const scale = opts.scale != null ? opts.scale : 1;
  const originX = opts.originX != null ? opts.originX : 0;
  const originY = opts.originY != null ? opts.originY : 0;
  return {
    x: (pointer.x - originX) * scale,
    y: (pointer.y - originY) * scale,
    pressure: pointer.pressure,
    id: pointer.id
  };
}

/**
 * Snap attribution to polyform/solid grid.
 * @param {object} attr  from attribute()
 * @param {object} opts  { cell, size, mode: 'square'|'hexagon'|'triangle'|'cube'|'johnson'|'star', solidKey }
 */
function snapAttribution(attr, opts = {}) {
  const mode = opts.mode || 'square';
  const size = opts.size || 16;

  if (mode === 'cube') {
    const s = snapToCube(attr.x, attr.y, opts.z || 0, size);
    return { x: s.x, y: s.y, z: s.z, ix: s.ix, iy: s.iy, iz: s.iz, mode, solid: 'cube-lattice' };
  }
  if (mode === 'johnson') {
    const key = opts.solidKey || 'J1';
    const s = snapToJohnson(attr.x / size, attr.y / size, (opts.z || 0) / size, key);
    return { x: s.x * size, y: s.y * size, z: (s.z || 0) * size, mode, solid: s.solid, key };
  }
  if (mode === 'star') {
    const key = opts.solidKey || 'K1';
    const s = snapToStar(attr.x / size, attr.y / size, (opts.z || 0) / size, key);
    return { x: s.x * size, y: s.y * size, mode, solid: s.solid, symbol: s.symbol, key };
  }

  const cell = mode === 'hexagon' || mode === 'triangle' ? mode : 'square';
  const s = snapToGrid(attr.x, attr.y, { cell, size });
  return { x: s.x, y: s.y, ix: s.ix, iy: s.iy, mode: cell, solid: cell + '-lattice' };
}

/**
 * Resolve snapped solid → trigintaduonion triple record.
 */
function toTriple(snap) {
  const key = snap.key || (snap.solid === 'cube-lattice' ? 'cube' : 'J1');
  const mapped = TRIPLE_MAP[key];
  if (mapped) {
    return {
      index: mapped.index,
      type: mapped.type,
      name: mapped.name,
      v: mapped.v,
      e: mapped.e,
      f: mapped.f
    };
  }
  // fallback lattice: classify a synthetic solid from grid indices
  const synth = { name: snap.solid || 'lattice', v: 4, e: 6, f: 4 };
  const type = classifySolid(synth);
  return {
    index: trigintaduonionIndex(synth, Math.abs((snap.ix || 0) + (snap.iy || 0))),
    type,
    name: synth.name,
    v: 4, e: 6, f: 4
  };
}

/**
 * Build edge n-gram spectral address from triple / solid topology.
 */
function toNgram(triple, opts = {}) {
  const v = Math.min(Math.max(triple.v || 4, 3), 24);
  const edges = cycleEdges(v);
  const adj = buildAdjacency(v, edges);
  const n = opts.n || 2;
  const addr = spectralAddress(adj, n);
  return {
    pathSample: addr.sample,
    hash: addr.xorFold,
    length: n,
    gramCount: addr.gramCount,
    adj
  };
}

/**
 * Run spatial GNN with regex filter derived from constraint name or custom fn.
 */
function toGNN(ngram, opts = {}) {
  const adj = ngram.adj;
  const features = new Map();
  for (let i = 0; i < adj.length; i++) {
    features.set(i, (ngram.pathSample[i % ngram.pathSample.length] || i) & 0xff);
  }
  const constraintName = opts.constraint || 'OMI_ID';
  const re = G[constraintName];
  const regexFilter = opts.regexFilter || ((node) => {
    // entrain: admit nodes whose string form matches constraint, else parity
    if (re) return admits(constraintName, String(node));
    return (node & 1) === 0;
  });
  const epochs = opts.epochs || 3;
  return runGNN(adj, features, regexFilter, epochs);
}

/**
 * Contrasting orchestrator step (optionally converge).
 */
function toOrch(gnn, opts = {}) {
  // rebuild minimal adj from feature size
  const n = gnn.features.size;
  const edges = cycleEdges(n);
  const adj = buildAdjacency(n, edges);
  const target = opts.target != null ? opts.target : gnn.digest;
  const filter = opts.regexFilter || (() => true);
  if (opts.converge) {
    const c = converge(adj, gnn.features, filter, target, {
      maxSteps: opts.maxSteps || 8,
      epochs: opts.epochs || 2
    });
    return {
      digest: c.final.digest,
      target: c.final.target,
      diff: c.final.diff,
      fixed: c.fixed,
      steps: c.steps
    };
  }
  const one = orchestrator(adj, gnn.features, filter, target, opts.epochs || 2);
  return {
    digest: one.digest,
    target: one.target,
    diff: one.diff,
    fixed: isFixed(one),
    steps: 1
  };
}

/**
 * Constraint edit across media types.
 * Produces a structured edit that each media sink can apply.
 */
function toConstraintEdit(orch, snap, triple, opts = {}) {
  const mediaType = MEDIA_TYPES.includes(opts.mediaType) ? opts.mediaType : 'svg';
  const applied = orch.fixed === true;
  const constraint = opts.constraint || 'FRONT';

  const base = {
    constraint,
    mediaType,
    applied,
    tripleIndex: triple.index,
    snap: { x: snap.x, y: snap.y, solid: snap.solid },
    orchDiff: orch.diff
  };

  switch (mediaType) {
    case 'svg':
      return {
        ...base,
        payload: {
          kind: 'svg-transform',
          translate: [snap.x, snap.y],
          dataOmiTriple: triple.index,
          dataOmiSolid: snap.solid
        }
      };
    case 'canvas':
      return {
        ...base,
        payload: {
          kind: 'canvas-path',
          moveTo: [snap.x, snap.y],
          gridCell: snap.solid
        }
      };
    case 'webvtt':
      return {
        ...base,
        payload: {
          kind: 'vtt-cue',
          text: `${snap.solid}@${triple.index}`,
          position: Math.min(100, Math.abs(snap.x) % 100)
        }
      };
    case 'webaudio':
      return {
        ...base,
        payload: {
          kind: 'panner-position',
          x: snap.x,
          y: snap.y,
          z: snap.z || 0
        }
      };
    case 'html':
      return {
        ...base,
        payload: {
          kind: 'data-attributes',
          'data-omi-triple': String(triple.index),
          'data-omi-snap-x': String(snap.x),
          'data-omi-snap-y': String(snap.y)
        }
      };
    case 'binary':
      return {
        ...base,
        payload: {
          kind: 'byte-write',
          offset: triple.index % 256,
          value: (orch.digest ^ orch.diff) & 0xff
        }
      };
    default:
      return { ...base, payload: { kind: 'noop' } };
  }
}

/**
 * Full pipeline from pointer event to constraint edit.
 */
function runPatternPipeline(pointerEvent, opts = {}) {
  const pointer = normalizePointer(pointerEvent);
  const attr = attribute(pointer, opts.attribute);
  const snap = snapAttribution(attr, opts.snap);
  const triple = toTriple(snap);
  const ngram = toNgram(triple, opts.ngram);
  const gnn = toGNN(ngram, opts.gnn);
  const orch = toOrch(gnn, {
    ...opts.orch,
    target: opts.orch && opts.orch.target != null ? opts.orch.target : gnn.digest,
    converge: opts.converge !== false
  });
  const edit = toConstraintEdit(orch, snap, triple, {
    mediaType: opts.mediaType || 'svg',
    constraint: (opts.gnn && opts.gnn.constraint) || 'OMI_ID'
  });

  return Object.freeze({
    pointer,
    attribution: attr,
    snap,
    triple,
    ngram: {
      hash: ngram.hash,
      length: ngram.length,
      gramCount: ngram.gramCount,
      pathSample: ngram.pathSample
    },
    gnn: { digest: gnn.digest },
    orch,
    edit,
    fixed: orch.fixed
  });
}

/**
 * Learn: accumulate pointer stream → most common snap solid / triple.
 */
function learnPatterns(events, opts = {}) {
  const counts = new Map();
  const triples = new Map();
  for (const ev of events || []) {
    const r = runPatternPipeline(ev, { ...opts, converge: false });
    const sk = r.snap.solid || 'unknown';
    counts.set(sk, (counts.get(sk) || 0) + 1);
    triples.set(r.triple.index, (triples.get(r.triple.index) || 0) + 1);
  }
  const topSolid = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['none', 0];
  const topTriple = [...triples.entries()].sort((a, b) => b[1] - a[1])[0] || [0, 0];
  return {
    eventCount: (events || []).length,
    solidHistogram: Object.fromEntries(counts),
    tripleHistogram: Object.fromEntries(triples),
    dominantSolid: topSolid[0],
    dominantTriple: topTriple[0]
  };
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const ev = { clientX: 100.4, clientY: 50.6, pressure: 0.8, pointerId: 1 };
  const out = runPatternPipeline(ev, {
    snap: { mode: 'square', size: 16 },
    mediaType: 'svg',
    converge: true
  });

  assert('has pointer', out.pointer.x === 100.4);
  assert('snapped', out.snap.x % 16 === 0 && out.snap.y % 16 === 0);
  assert('triple index', out.triple.index >= 0 && out.triple.index < 155);
  assert('ngram hash', typeof out.ngram.hash === 'number');
  assert('gnn digest', typeof out.gnn.digest === 'number');
  assert('orch fixed when target=digest', out.orch.fixed === true);
  assert('edit svg', out.edit.mediaType === 'svg' && out.edit.payload.kind === 'svg-transform');
  assert('edit applied', out.edit.applied === true);

  const canvasEdit = runPatternPipeline(ev, { mediaType: 'canvas', converge: true });
  assert('edit canvas', canvasEdit.edit.payload.kind === 'canvas-path');

  const vttEdit = runPatternPipeline(ev, { mediaType: 'webvtt', converge: true });
  assert('edit webvtt', vttEdit.edit.payload.kind === 'vtt-cue');

  const audioEdit = runPatternPipeline(ev, { mediaType: 'webaudio', converge: true });
  assert('edit webaudio', audioEdit.edit.payload.kind === 'panner-position');

  const htmlEdit = runPatternPipeline(ev, { mediaType: 'html', converge: true });
  assert('edit html', htmlEdit.edit.payload.kind === 'data-attributes');

  const binEdit = runPatternPipeline(ev, { mediaType: 'binary', converge: true });
  assert('edit binary', binEdit.edit.payload.kind === 'byte-write');

  const johnson = runPatternPipeline(ev, {
    snap: { mode: 'johnson', solidKey: 'J1', size: 1 },
    converge: true
  });
  assert('johnson snap', johnson.snap.solid === 'square pyramid');

  const learned = learnPatterns([
    { x: 10, y: 10 },
    { x: 12, y: 11 },
    { x: 100, y: 50 }
  ], { snap: { mode: 'square', size: 8 } });
  assert('learn count 3', learned.eventCount === 3);
  assert('learn dominant', typeof learned.dominantSolid === 'string');

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  MEDIA_TYPES,
  normalizePointer,
  attribute,
  snapAttribution,
  toTriple,
  toNgram,
  toGNN,
  toOrch,
  toConstraintEdit,
  runPatternPipeline,
  learnPatterns,
  selfTest
};
