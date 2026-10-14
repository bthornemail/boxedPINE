/**
 * OMI-IMO Polyform & Solid Toolkit
 * Snap-to-grid for user space — 2D / 2.5D / 3D / 4D tiling base.
 *
 * Levels:
 *   2D   Polyforms          planar tiling
 *   2.5D Archimedean        prismatic / uniform truncation
 *   3D   Platonic           volumetric
 *   3D   Catalan            dual tiling
 *   4D   Convex regular     hyperspace (simplex distribution)
 */
'use strict';

// ---------- Polyforms ----------
const POLYFORMS = Object.freeze([
  // polyominoes (square)
  { name: 'monomino', cell: 'square', free: 1, oneSided: 1, fixed: 1 },
  { name: 'domino', cell: 'square', free: 1, oneSided: 1, fixed: 2 },
  { name: 'tromino', cell: 'square', free: 2, oneSided: 2, fixed: 6 },
  { name: 'tetromino', cell: 'square', free: 5, oneSided: 7, fixed: 19 },
  { name: 'pentomino', cell: 'square', free: 12, oneSided: 18, fixed: 63 },
  { name: 'hexomino', cell: 'square', free: 35, oneSided: 60, fixed: 216 },
  { name: 'heptomino', cell: 'square', free: 108, oneSided: 196, fixed: 760 },
  { name: 'octomino', cell: 'square', free: 369, oneSided: 704, fixed: 2725 },
  // polyiamonds (triangle)
  { name: 'moniamond', cell: 'triangle', free: 1, oneSided: 1, fixed: 1 },
  { name: 'diamond', cell: 'triangle', free: 1, oneSided: 1, fixed: 1 },
  { name: 'triamond', cell: 'triangle', free: 1, oneSided: 1, fixed: 1 },
  { name: 'tetriamond', cell: 'triangle', free: 3, oneSided: 4, fixed: 7 },
  { name: 'pentiamond', cell: 'triangle', free: 4, oneSided: 6, fixed: 12 },
  { name: 'hexiamond', cell: 'triangle', free: 12, oneSided: 19, fixed: 24 },
  // polyhexes (hexagon)
  { name: 'monohex', cell: 'hexagon', free: 1, oneSided: 1, fixed: 1 },
  { name: 'dihex', cell: 'hexagon', free: 1, oneSided: 1, fixed: 3 },
  { name: 'trihex', cell: 'hexagon', free: 3, oneSided: 3, fixed: 7 },
  { name: 'tetrahex', cell: 'hexagon', free: 7, oneSided: 7, fixed: 22 },
  { name: 'pentahex', cell: 'hexagon', free: 22, oneSided: 24, fixed: 82 },
  // polycubes (cube)
  { name: 'monocube', cell: 'cube', free: 1, oneSided: 1, fixed: 1 },
  { name: 'dicube', cell: 'cube', free: 1, oneSided: 1, fixed: 1 },
  { name: 'tricube', cell: 'cube', free: 2, oneSided: 2, fixed: 2 },
  { name: 'tetracube', cell: 'cube', free: 8, oneSided: 8, fixed: 8 },
  { name: 'pentacube', cell: 'cube', free: 29, oneSided: 29, fixed: 29 }
].map(Object.freeze));

// ---------- Platonic solids ----------
const PLATONIC = Object.freeze([
  { name: 'tetrahedron', vertices: 4, edges: 6, faces: 4, faceType: 'triangle', schlafli: '{3,3}' },
  { name: 'cube', vertices: 8, edges: 12, faces: 6, faceType: 'square', schlafli: '{4,3}' },
  { name: 'octahedron', vertices: 6, edges: 12, faces: 8, faceType: 'triangle', schlafli: '{3,4}' },
  { name: 'dodecahedron', vertices: 20, edges: 30, faces: 12, faceType: 'pentagon', schlafli: '{5,3}' },
  { name: 'icosahedron', vertices: 12, edges: 30, faces: 20, faceType: 'triangle', schlafli: '{3,5}' }
].map(Object.freeze));

// ---------- Archimedean solids ----------
const ARCHIMEDEAN = Object.freeze([
  { name: 'truncated tetrahedron', vertices: 12, edges: 18, faces: 8 },
  { name: 'cuboctahedron', vertices: 12, edges: 24, faces: 14 },
  { name: 'truncated cube', vertices: 24, edges: 36, faces: 14 },
  { name: 'truncated octahedron', vertices: 24, edges: 36, faces: 14 },
  { name: 'rhombicuboctahedron', vertices: 24, edges: 48, faces: 26 },
  { name: 'truncated cuboctahedron', vertices: 48, edges: 72, faces: 26 },
  { name: 'snub cube', vertices: 24, edges: 60, faces: 38 },
  { name: 'icosidodecahedron', vertices: 30, edges: 60, faces: 32 },
  { name: 'truncated dodecahedron', vertices: 60, edges: 90, faces: 32 },
  { name: 'truncated icosahedron', vertices: 60, edges: 90, faces: 32 },
  { name: 'rhombicosidodecahedron', vertices: 60, edges: 120, faces: 62 },
  { name: 'truncated icosidodecahedron', vertices: 120, edges: 180, faces: 62 },
  { name: 'snub dodecahedron', vertices: 60, edges: 150, faces: 92 }
].map(Object.freeze));

// ---------- Catalan solids (duals of Archimedean) ----------
const CATALAN = Object.freeze([
  { name: 'triakis tetrahedron', vertices: 8, edges: 18, faces: 12, dualOf: 'truncated tetrahedron' },
  { name: 'rhombic dodecahedron', vertices: 14, edges: 24, faces: 12, dualOf: 'cuboctahedron' },
  { name: 'triakis octahedron', vertices: 14, edges: 36, faces: 24, dualOf: 'truncated cube' },
  { name: 'tetrakis hexahedron', vertices: 14, edges: 36, faces: 24, dualOf: 'truncated octahedron' },
  { name: 'deltoidal icositetrahedron', vertices: 26, edges: 48, faces: 24, dualOf: 'rhombicuboctahedron' },
  { name: 'disdyakis dodecahedron', vertices: 26, edges: 72, faces: 48, dualOf: 'truncated cuboctahedron' },
  { name: 'pentagonal icositetrahedron', vertices: 38, edges: 60, faces: 24, dualOf: 'snub cube' },
  { name: 'rhombic triacontahedron', vertices: 32, edges: 60, faces: 30, dualOf: 'icosidodecahedron' },
  { name: 'triakis icosahedron', vertices: 32, edges: 90, faces: 60, dualOf: 'truncated dodecahedron' },
  { name: 'pentakis dodecahedron', vertices: 32, edges: 90, faces: 60, dualOf: 'truncated icosahedron' },
  { name: 'deltoidal hexecontahedron', vertices: 62, edges: 120, faces: 60, dualOf: 'rhombicosidodecahedron' },
  { name: 'disdyakis triacontahedron', vertices: 62, edges: 180, faces: 120, dualOf: 'truncated icosidodecahedron' },
  { name: 'pentagonal hexecontahedron', vertices: 92, edges: 150, faces: 60, dualOf: 'snub dodecahedron' }
].map(Object.freeze));

// ---------- 4D convex regular polychora ----------
const SIMPLEX_4D = Object.freeze([
  { name: '5-cell', vertices: 5, edges: 10, faces: 10, cells: 5, schlafli: '{3,3,3}' },
  { name: '8-cell', vertices: 16, edges: 32, faces: 24, cells: 8, schlafli: '{4,3,3}' },
  { name: '16-cell', vertices: 8, edges: 24, faces: 32, cells: 16, schlafli: '{3,3,4}' },
  { name: '24-cell', vertices: 24, edges: 96, faces: 96, cells: 24, schlafli: '{3,4,3}' },
  { name: '120-cell', vertices: 600, edges: 1200, faces: 720, cells: 120, schlafli: '{5,3,3}' },
  { name: '600-cell', vertices: 120, edges: 720, faces: 1200, cells: 600, schlafli: '{3,3,5}' }
].map(Object.freeze));

// ---------- Snap-to-grid ----------
/**
 * Snap a continuous coordinate to a lattice defined by cell type.
 * @param {number} x
 * @param {number} y
 * @param {object} opts
 * @param {'square'|'triangle'|'hexagon'} [opts.cell='square']
 * @param {number} [opts.size=1]  cell edge length
 * @returns {{x:number,y:number,ix:number,iy:number}}
 */
function snapToGrid(x, y, opts = {}) {
  const cell = opts.cell || 'square';
  const size = opts.size || 1;

  if (cell === 'square') {
    const ix = Math.round(x / size);
    const iy = Math.round(y / size);
    return { x: ix * size, y: iy * size, ix, iy };
  }

  if (cell === 'hexagon') {
    // axial hex snap (pointy-top)
    const q = (2 / 3 * x) / size;
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(-q - r);
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - (-q - r));
    if (qDiff > rDiff && qDiff > sDiff) rq = -rr - rs;
    else if (rDiff > sDiff) rr = -rq - rs;
    const px = size * (3 / 2 * rq);
    const py = size * (Math.sqrt(3) / 2 * rq + Math.sqrt(3) * rr);
    return { x: px, y: py, ix: rq, iy: rr };
  }

  if (cell === 'triangle') {
    // triangular lattice ≈ two rectangular axes at 60°
    const ix = Math.round(x / size);
    const iy = Math.round((y - (ix % 2) * size * 0.5) / (size * Math.sqrt(3) / 2));
    const px = ix * size;
    const py = iy * size * Math.sqrt(3) / 2 + (ix % 2) * size * 0.5;
    return { x: px, y: py, ix, iy };
  }

  // default square
  const ix = Math.round(x / size);
  const iy = Math.round(y / size);
  return { x: ix * size, y: iy * size, ix, iy };
}

/**
 * Snap a 3D point to a cubic lattice (polycube grid).
 */
function snapToCube(x, y, z, size = 1) {
  const ix = Math.round(x / size);
  const iy = Math.round(y / size);
  const iz = Math.round(z / size);
  return { x: ix * size, y: iy * size, z: iz * size, ix, iy, iz };
}

/**
 * Lookup helpers
 */
function findPolyform(name) {
  return POLYFORMS.find(p => p.name === name) || null;
}

function findPlatonic(name) {
  return PLATONIC.find(p => p.name === name) || null;
}

function findArchimedean(name) {
  return ARCHIMEDEAN.find(p => p.name === name) || null;
}

function findCatalan(name) {
  return CATALAN.find(p => p.name === name) || null;
}

function findSimplex4D(name) {
  return SIMPLEX_4D.find(p => p.name === name) || null;
}

/** Dual: Archimedean name → Catalan solid */
function dualOfArchimedean(archName) {
  return CATALAN.find(c => c.dualOf === archName) || null;
}

/**
 * Euler check V - E + F = 2 (spherical topology) for Platonic / Archimedean / Catalan
 */
function eulerCharacteristic(solid) {
  if (solid.vertices == null || solid.edges == null || solid.faces == null) return null;
  return solid.vertices - solid.edges + solid.faces;
}

/**
 * 4D Euler-like: V - E + F - C
 */
function euler4D(polytope) {
  return polytope.vertices - polytope.edges + polytope.faces - polytope.cells;
}

/**
 * Toolkit summary for codex / API
 */
function toolkitSummary() {
  return Object.freeze({
    levels: [
      { level: '2D', toolkit: 'polyforms', dimension: 'planar tiling', count: POLYFORMS.length },
      { level: '2.5D', toolkit: 'archimedean', dimension: 'prismatic tiling', count: ARCHIMEDEAN.length },
      { level: '3D', toolkit: 'platonic', dimension: 'volumetric tiling', count: PLATONIC.length },
      { level: '3D dual', toolkit: 'catalan', dimension: 'dual tiling', count: CATALAN.length },
      { level: '4D', toolkit: 'simplex_4d', dimension: 'hyperspace tiling', count: SIMPLEX_4D.length }
    ],
    polyforms: POLYFORMS.length,
    platonic: PLATONIC.length,
    archimedean: ARCHIMEDEAN.length,
    catalan: CATALAN.length,
    simplex4d: SIMPLEX_4D.length
  });
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  assert('polyform count', POLYFORMS.length >= 24);
  assert('platonic 5', PLATONIC.length === 5);
  assert('archimedean 13', ARCHIMEDEAN.length === 13);
  assert('catalan 13', CATALAN.length === 13);
  assert('4d regular 6', SIMPLEX_4D.length === 6);

  assert('tetromino free 5', findPolyform('tetromino').free === 5);
  assert('pentomino free 12', findPolyform('pentomino').free === 12);

  // Euler χ=2 for all Platonic
  let platonicEuler = true;
  for (const p of PLATONIC) {
    if (eulerCharacteristic(p) !== 2) platonicEuler = false;
  }
  assert('platonic Euler=2', platonicEuler);

  // Archimedean Euler=2
  let archEuler = true;
  for (const a of ARCHIMEDEAN) {
    if (eulerCharacteristic(a) !== 2) archEuler = false;
  }
  assert('archimedean Euler=2', archEuler);

  // Catalan Euler=2
  let catEuler = true;
  for (const c of CATALAN) {
    if (eulerCharacteristic(c) !== 2) catEuler = false;
  }
  assert('catalan Euler=2', catEuler);

  // Dual pairing complete
  let duals = true;
  for (const a of ARCHIMEDEAN) {
    if (!dualOfArchimedean(a.name)) duals = false;
  }
  assert('13 duals', duals);

  // 4D Euler V-E+F-C = 0 for convex regular polychora
  let e4 = true;
  for (const s of SIMPLEX_4D) {
    if (euler4D(s) !== 0) e4 = false;
  }
  assert('4D Euler=0', e4);

  // Snap square
  const s1 = snapToGrid(3.2, 4.7, { cell: 'square', size: 1 });
  assert('snap square', s1.x === 3 && s1.y === 5);

  // Snap cube
  const c1 = snapToCube(1.4, -0.6, 2.1, 1);
  assert('snap cube', c1.ix === 1 && c1.iy === -1 && c1.iz === 2);

  // Hex snap returns finite
  const h1 = snapToGrid(2.5, 1.1, { cell: 'hexagon', size: 1 });
  assert('snap hex finite', Number.isFinite(h1.x) && Number.isFinite(h1.y));

  const sum = toolkitSummary();
  assert('summary levels 5', sum.levels.length === 5);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  POLYFORMS,
  PLATONIC,
  ARCHIMEDEAN,
  CATALAN,
  SIMPLEX_4D,
  snapToGrid,
  snapToCube,
  findPolyform,
  findPlatonic,
  findArchimedean,
  findCatalan,
  findSimplex4D,
  dualOfArchimedean,
  eulerCharacteristic,
  euler4D,
  toolkitSummary,
  selfTest
};
