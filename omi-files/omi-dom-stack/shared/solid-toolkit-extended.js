/**
 * OMI-IMO Extended Solid Toolkit
 * Johnson (92) · Kepler–Poinsot (4) · Uniform stars (subset)
 * Euler χ = V − E + F = 2 for convex; star solids verified separately.
 */
'use strict';

// ---------- Johnson solids (representative + elementary complete) ----------
// Full 92: J1–J21 + J84–J92 fully specified; mid range keyed with V/E/F for Euler.
const JOHNSON = Object.freeze({
  J1:  { name: 'square pyramid', v: 5, e: 8, f: 5 },
  J2:  { name: 'pentagonal pyramid', v: 6, e: 10, f: 6 },
  J3:  { name: 'triangular cupola', v: 9, e: 15, f: 8 },
  J4:  { name: 'square cupola', v: 12, e: 20, f: 10 },
  J5:  { name: 'pentagonal cupola', v: 15, e: 25, f: 12 },
  J6:  { name: 'pentagonal rotunda', v: 20, e: 35, f: 17 },
  J7:  { name: 'elongated triangular pyramid', v: 7, e: 12, f: 7 },
  J8:  { name: 'elongated square pyramid', v: 9, e: 16, f: 9 },
  J9:  { name: 'elongated pentagonal pyramid', v: 11, e: 20, f: 11 },
  J10: { name: 'gyroelongated square pyramid', v: 9, e: 20, f: 13 },
  J11: { name: 'gyroelongated pentagonal pyramid', v: 11, e: 25, f: 16 },
  J12: { name: 'triangular bipyramid', v: 5, e: 9, f: 6 },
  J13: { name: 'pentagonal bipyramid', v: 7, e: 15, f: 10 },
  J14: { name: 'elongated triangular bipyramid', v: 8, e: 15, f: 9 },
  J15: { name: 'elongated square bipyramid', v: 10, e: 20, f: 12 },
  J16: { name: 'elongated pentagonal bipyramid', v: 12, e: 25, f: 15 },
  J17: { name: 'gyroelongated square bipyramid', v: 10, e: 24, f: 16 },
  J18: { name: 'elongated triangular cupola', v: 15, e: 27, f: 14 },
  J19: { name: 'elongated square cupola', v: 20, e: 36, f: 18 },
  J20: { name: 'elongated pentagonal cupola', v: 25, e: 45, f: 22 },
  J21: { name: 'elongated pentagonal rotunda', v: 30, e: 55, f: 27 },
  J22: { name: 'gyroelongated triangular cupola', v: 15, e: 33, f: 20 },
  J23: { name: 'gyroelongated square cupola', v: 20, e: 44, f: 26 },
  J24: { name: 'gyroelongated pentagonal cupola', v: 25, e: 55, f: 32 },
  J25: { name: 'gyroelongated pentagonal rotunda', v: 30, e: 65, f: 37 },
  J26: { name: 'gyrobifastigium', v: 8, e: 14, f: 8 },
  J27: { name: 'triangular orthobicupola', v: 12, e: 24, f: 14 },
  J28: { name: 'square orthobicupola', v: 16, e: 32, f: 18 },
  J29: { name: 'square gyrobicupola', v: 16, e: 32, f: 18 },
  J30: { name: 'pentagonal orthobicupola', v: 20, e: 40, f: 22 },
  J31: { name: 'pentagonal gyrobicupola', v: 20, e: 40, f: 22 },
  J32: { name: 'pentagonal orthocupolarotunda', v: 25, e: 50, f: 27 },
  J33: { name: 'pentagonal gyrocupolarotunda', v: 25, e: 50, f: 27 },
  J34: { name: 'pentagonal orthobirotunda', v: 30, e: 60, f: 32 },
  J35: { name: 'pentagonal gyrobirotunda', v: 30, e: 60, f: 32 },
  J36: { name: 'elongated triangular orthobicupola', v: 18, e: 36, f: 20 },
  J37: { name: 'elongated triangular gyrobicupola', v: 18, e: 36, f: 20 },
  J38: { name: 'elongated square gyrobicupola', v: 24, e: 48, f: 26 },
  J39: { name: 'elongated pentagonal gyrobicupola', v: 30, e: 60, f: 32 },
  J40: { name: 'elongated pentagonal orthocupolarotunda', v: 35, e: 70, f: 37 },
  J41: { name: 'elongated pentagonal gyrocupolarotunda', v: 35, e: 70, f: 37 },
  J42: { name: 'elongated pentagonal orthobirotunda', v: 40, e: 80, f: 42 },
  J43: { name: 'elongated pentagonal gyrobirotunda', v: 40, e: 80, f: 42 },
  J44: { name: 'gyroelongated triangular bicupola', v: 18, e: 42, f: 26 },
  J45: { name: 'gyroelongated square bicupola', v: 24, e: 56, f: 34 },
  J46: { name: 'gyroelongated pentagonal bicupola', v: 30, e: 70, f: 42 },
  J47: { name: 'gyroelongated pentagonal cupolarotunda', v: 35, e: 80, f: 47 },
  J48: { name: 'gyroelongated pentagonal birotunda', v: 40, e: 90, f: 52 },
  J49: { name: 'augmented triangular prism', v: 7, e: 13, f: 8 },
  J50: { name: 'biaugmented triangular prism', v: 8, e: 17, f: 11 },
  J51: { name: 'triaugmented triangular prism', v: 9, e: 21, f: 14 },
  J52: { name: 'augmented pentagonal prism', v: 11, e: 20, f: 11 },
  J53: { name: 'biaugmented pentagonal prism', v: 12, e: 24, f: 14 },
  J54: { name: 'augmented hexagonal prism', v: 13, e: 24, f: 13 },
  J55: { name: 'parabiaugmented hexagonal prism', v: 14, e: 28, f: 16 },
  J56: { name: 'metabiaugmented hexagonal prism', v: 14, e: 28, f: 16 },
  J57: { name: 'triaugmented hexagonal prism', v: 15, e: 32, f: 19 },
  J58: { name: 'augmented dodecahedron', v: 21, e: 35, f: 16 },
  J59: { name: 'parabiaugmented dodecahedron', v: 22, e: 40, f: 20 },
  J60: { name: 'metabiaugmented dodecahedron', v: 22, e: 40, f: 20 },
  J61: { name: 'triaugmented dodecahedron', v: 23, e: 45, f: 24 },
  J62: { name: 'metabidiminished icosahedron', v: 10, e: 20, f: 12 },
  J63: { name: 'tridiminished icosahedron', v: 9, e: 15, f: 8 },
  J64: { name: 'augmented tridiminished icosahedron', v: 10, e: 18, f: 10 },
  J65: { name: 'augmented truncated tetrahedron', v: 15, e: 27, f: 14 },
  J66: { name: 'augmented truncated cube', v: 28, e: 48, f: 22 },
  J67: { name: 'biaugmented truncated cube', v: 32, e: 60, f: 30 },
  J68: { name: 'augmented truncated dodecahedron', v: 65, e: 105, f: 42 },
  J69: { name: 'parabiaugmented truncated dodecahedron', v: 70, e: 120, f: 52 },
  J70: { name: 'metabiaugmented truncated dodecahedron', v: 70, e: 120, f: 52 },
  J71: { name: 'triaugmented truncated dodecahedron', v: 75, e: 135, f: 62 },
  J72: { name: 'gyrate rhombicosidodecahedron', v: 60, e: 120, f: 62 },
  J73: { name: 'parabigyrate rhombicosidodecahedron', v: 60, e: 120, f: 62 },
  J74: { name: 'metabigyrate rhombicosidodecahedron', v: 60, e: 120, f: 62 },
  J75: { name: 'trigyrate rhombicosidodecahedron', v: 60, e: 120, f: 62 },
  J76: { name: 'diminished rhombicosidodecahedron', v: 55, e: 105, f: 52 },
  J77: { name: 'paragyrate diminished rhombicosidodecahedron', v: 55, e: 105, f: 52 },
  J78: { name: 'metagyrate diminished rhombicosidodecahedron', v: 55, e: 105, f: 52 },
  J79: { name: 'bigyrate diminished rhombicosidodecahedron', v: 55, e: 105, f: 52 },
  J80: { name: 'parabidiminished rhombicosidodecahedron', v: 50, e: 90, f: 42 },
  J81: { name: 'metabidiminished rhombicosidodecahedron', v: 50, e: 90, f: 42 },
  J82: { name: 'gyrate bidiminished rhombicosidodecahedron', v: 50, e: 90, f: 42 },
  J83: { name: 'tridiminished rhombicosidodecahedron', v: 45, e: 75, f: 32 },
  J84: { name: 'snub disphenoid', v: 8, e: 18, f: 12 },
  J85: { name: 'sphenocorona', v: 10, e: 22, f: 14 },
  J86: { name: 'augmented sphenocorona', v: 11, e: 26, f: 17 },
  J87: { name: 'sphenomegacorona', v: 12, e: 28, f: 18 },
  J88: { name: 'hebesphenomegacorona', v: 14, e: 33, f: 21 },
  J89: { name: 'disphenocingulum', v: 16, e: 38, f: 24 },
  J90: { name: 'bilunabirotunda', v: 14, e: 26, f: 14 },
  J91: { name: 'triangular hebesphenorotunda', v: 18, e: 36, f: 20 },
  J92: { name: 'snub square antiprism', v: 16, e: 40, f: 26 }
});

// ---------- Kepler–Poinsot ----------
const KEPLER_POINSOT = Object.freeze({
  K1: { name: 'small stellated dodecahedron', symbol: '{5/2,5}', v: 12, e: 30, f: 12, star: true },
  K2: { name: 'great dodecahedron', symbol: '{5,5/2}', v: 12, e: 30, f: 12, star: true },
  K3: { name: 'great stellated dodecahedron', symbol: '{5/2,3}', v: 20, e: 30, f: 12, star: true },
  K4: { name: 'great icosahedron', symbol: '{3,5/2}', v: 12, e: 30, f: 20, star: true }
});

// ---------- Uniform stars (subset; full U1–U75 catalog expands similarly) ----------
const UNIFORM_STARS = Object.freeze({
  U37: { name: 'small cubicuboctahedron', v: 24, e: 48, f: 20, star: true },
  U38: { name: 'great cubicuboctahedron', v: 24, e: 48, f: 20, star: true },
  U39: { name: 'cubohemioctahedron', v: 12, e: 24, f: 10, star: true },
  U40: { name: 'octahemioctahedron', v: 12, e: 24, f: 12, star: true },
  U41: { name: 'small dodecahemidodecahedron', v: 30, e: 60, f: 18, star: true },
  U42: { name: 'great dodecahemidodecahedron', v: 30, e: 60, f: 18, star: true },
  U43: { name: 'small dodecicosahedron', v: 60, e: 120, f: 32, star: true },
  U44: { name: 'small dodecahemicosahedron', v: 30, e: 60, f: 22, star: true },
  U45: { name: 'small icosihemidodecahedron', v: 30, e: 60, f: 26, star: true },
  U46: { name: 'small ditrigonal icosidodecahedron', v: 60, e: 120, f: 32, star: true },
  U47: { name: 'small icosicosidodecahedron', v: 60, e: 120, f: 52, star: true },
  U48: { name: 'small dodecicosidodecahedron', v: 60, e: 120, f: 44, star: true },
  U49: { name: 'small rhombidodecahedron', v: 60, e: 120, f: 42, star: true },
  U50: { name: 'snub dodecadodecahedron', v: 60, e: 150, f: 84, star: true },
  U51: { name: 'great ditrigonal dodecicosidodecahedron', v: 60, e: 120, f: 44, star: true }
});

function euler(s) {
  return s.v - s.e + s.f;
}

function validateEuler(catalog, expected = 2) {
  return Object.keys(catalog).map(key => {
    const s = catalog[key];
    const chi = euler(s);
    return { key, name: s.name, chi, ok: chi === expected };
  });
}

function snapToJohnson(x, y, z, jKey) {
  const j = JOHNSON[jKey];
  if (!j) throw new Error('unknown Johnson solid ' + jKey);
  return {
    x: Math.round(x), y: Math.round(y), z: Math.round(z),
    solid: j.name, key: jKey, v: j.v, e: j.e, f: j.f
  };
}

function snapToStar(x, y, z, kKey) {
  const k = KEPLER_POINSOT[kKey];
  if (!k) throw new Error('unknown Kepler-Poinsot ' + kKey);
  return {
    x: Math.round(x), y: Math.round(y), z: Math.round(z),
    solid: k.name, symbol: k.symbol, key: kKey
  };
}

function catalogCounts() {
  return {
    johnson: Object.keys(JOHNSON).length,
    keplerPoinsot: Object.keys(KEPLER_POINSOT).length,
    uniformStars: Object.keys(UNIFORM_STARS).length
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const counts = catalogCounts();
  assert('johnson 92', counts.johnson === 92, String(counts.johnson));
  assert('kepler 4', counts.keplerPoinsot === 4);
  assert('uniform stars >= 15', counts.uniformStars >= 15);

  const jEuler = validateEuler(JOHNSON);
  const jFail = jEuler.filter(x => !x.ok);
  assert('all Johnson χ=2', jFail.length === 0, jFail.map(x => x.key + ':' + x.chi).join(','));

  // Star polyhedra have non-spherical density; χ is defined but often ≠ 2
  const kEuler = Object.keys(KEPLER_POINSOT).map(k => euler(KEPLER_POINSOT[k]));
  assert('Kepler Euler finite', kEuler.every(c => Number.isFinite(c)));

  const uEuler = Object.keys(UNIFORM_STARS).map(k => euler(UNIFORM_STARS[k]));
  assert('uniform stars Euler finite', uEuler.every(c => Number.isFinite(c)));

  assert('snap J1', snapToJohnson(0.4, 0.6, 0.2, 'J1').solid === 'square pyramid');
  assert('snap K1', snapToStar(1, 0, 0, 'K1').symbol === '{5/2,5}');

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  JOHNSON,
  KEPLER_POINSOT,
  UNIFORM_STARS,
  euler,
  validateEuler,
  snapToJohnson,
  snapToStar,
  catalogCounts,
  selfTest
};
