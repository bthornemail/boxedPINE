/**
 * Map toolkit solids → trigintaduonion 155 triples
 * Classes: ααβ(45) · βββ₁(20) · βββ₂(15) · αβγ(60) · βγγ(15) = 155
 */
'use strict';

const TRIPLE_CLASSES = Object.freeze({
  alpha_alpha_beta: { size: 45, range: 0 },
  beta_beta_beta_1: { size: 20, offset: 45 },
  beta_beta_beta_2: { size: 15, offset: 65 },
  alpha_beta_gamma: { size: 60, offset: 80 },
  beta_gamma_gamma: { size: 15, offset: 140 }
});

function classifySolid(solid) {
  const v = solid.v != null ? solid.v : solid.vertices;
  const e = solid.e != null ? solid.e : solid.edges;
  const f = solid.f != null ? solid.f : solid.faces;
  if (solid.star || solid.pentagram) return 'beta_gamma_gamma';
  // dual-like: more faces than vertices
  if (f > v && e % 3 === 0) return 'beta_beta_beta_2';
  // bipyramid / cupola style
  if (f % 2 === 0 && e % 3 === 0 && v < 20) return 'beta_beta_beta_1';
  // high symmetry large solids
  if (v >= 12 && f >= 8) return 'alpha_beta_gamma';
  return 'alpha_alpha_beta';
}

function trigintaduonionIndex(solid, counter) {
  const cls = classifySolid(solid);
  const meta = TRIPLE_CLASSES[cls] || TRIPLE_CLASSES.alpha_alpha_beta;
  const size = meta.size | 0;
  const offset = meta.offset | 0;
  if (!size) return (counter | 0) % 155;
  return offset + ((counter | 0) % size);
}
function buildTripleMap(solids) {
  const map = {};
  let i = 0;
  for (const key of Object.keys(solids)) {
    const solid = solids[key];
    const type = classifySolid(solid);
    map[key] = Object.freeze({
      name: solid.name,
      type,
      index: trigintaduonionIndex(solid, i++),
      v: solid.v != null ? solid.v : solid.vertices,
      e: solid.e != null ? solid.e : solid.edges,
      f: solid.f != null ? solid.f : solid.faces
    });
  }
  return Object.freeze(map);
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const sizes = Object.values(TRIPLE_CLASSES).reduce((s, c) => s + c.size, 0);
  assert('155 slots', sizes === 155);

  const sample = {
    J1: { name: 'square pyramid', v: 5, e: 8, f: 5 },
    K1: { name: 'ssd', v: 12, e: 30, f: 12, star: true },
    T: { name: 'tetra', v: 4, e: 6, f: 4 }
  };
  const map = buildTripleMap(sample);
  assert('map size 3', Object.keys(map).length === 3);
  assert('K1 is βγγ', map.K1.type === 'beta_gamma_gamma');
  assert('index in 0..154', map.J1.index >= 0 && map.J1.index < 155);

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  TRIPLE_CLASSES,
  classifySolid,
  trigintaduonionIndex,
  buildTripleMap,
  selfTest
};
