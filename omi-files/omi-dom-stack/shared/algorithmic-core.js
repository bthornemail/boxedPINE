'use strict';

const {
  SLOT_NAMES,
  bind,
  apply,
  evaluate,
  digest,
} = require('./ruler');

const MASK16 = 0xffff;

function coordinate(hi, lo) {
  return (((hi & 0xff) << 8) | (lo & 0xff)) & MASK16;
}

function subHi(w) {
  return (w >> 8) & 0xff;
}

function subLo(w) {
  return w & 0xff;
}

function foldWord(w) {
  return (subHi(w) ^ subLo(w)) & 0xff;
}

function xorIndex(a, b) {
  return (a ^ b) >>> 0;
}

function popcount(x) {
  let n = x;
  n = n - ((n >>> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  n = (n + (n >>> 4)) & 0x0f0f0f0f;
  return (n * 0x01010101) >>> 24;
}

function distance(a, b) {
  return popcount((a ^ b) & MASK16);
}

function is(a, b) {
  return ((a ^ b) & MASK16) === 0;
}

const FRAMES = Object.freeze({
  read: Object.freeze({ 0: 'local', 1: 'local', 2: 'global', 3: 'global', 4: 'global', 5: 'global', 6: 'global', 7: 'global' }),
  write: Object.freeze({ 0: 'spectral', 1: 'spectral', 2: 'spatial', 3: 'spatial', 4: 'spatial', 5: 'spatial', 6: 'spatial', 7: 'spatial' }),
});

// One slot space, two readings. Read mode scopes like a regex (local/global);
// write mode places like a panner node (spectral/spatial). Never both at once.
function placement(w, mode) {
  const slot = foldWord(w) % 8;
  const m = mode === 'write' ? 'write' : 'read';
  return Object.freeze({
    slot,
    name: SLOT_NAMES[slot],
    frame: FRAMES[m][slot],
    mode: m,
  });
}

// The read/write duality is a pure endianness (or chirality): the same slot
// space, read in one order or the other. flipMode is the swap between readings —
// same slot, other frame name. Like swap16 but on the mode, not the bytes.
const OPPOSITE = Object.freeze({ read: 'write', write: 'read' });

function flipMode(place) {
  const mode = OPPOSITE[place.mode];
  return Object.freeze({
    slot: place.slot,
    name: place.name,
    frame: FRAMES[mode][place.slot],
    mode,
  });
}

// A hit:list is a list of positions. A hit in it is a swap: the cell comes out.
// A miss is not a swap — the position passes through unchanged (the discrepancy).
function hit(list, w) {
  const index = list.findIndex(x => is(x & MASK16, w));
  const cell = index >= 0 ? list[index] & MASK16 : w;
  const ex = exchangeExpected(w, w, cell);
  return Object.freeze({
    hit: index >= 0,
    index,
    op: index >= 0 ? 'swap' : 'pass',
    was: ex.was,
    now: ex.now,
    matched: ex.matched,
  });
}

// The intersection of two hit:lists is their shared positions; each one is a swap.
function intersect(a, b) {
  const shared = a.filter(x => b.some(y => is(x & MASK16, y & MASK16))).map(x => x & MASK16);
  return Object.freeze({
    shared: Object.freeze(shared),
    count: shared.length,
    ops: Object.freeze(shared.map(w => Object.freeze({ op: 'swap', cell: w }))),
  });
}

function resolve(a, b) {
  const pa = placement(a);
  return Object.freeze({
    a,
    b,
    subA: { hi: subHi(a), lo: subLo(a) },
    subB: { hi: subHi(b), lo: subLo(b) },
    aFold: foldWord(a),
    bFold: foldWord(b),
    A: pa,
    B: placement(b),
    discrepancyBits: distance(a, b),
    identical: is(a, b),
  });
}

function exchangeExpected(cell, expected, replacement) {
  const was = cell;
  const now = is(cell, expected) ? replacement : cell;
  return Object.freeze({ was, now, matched: is(cell, expected) });
}

function pairToCoordinate(knot) {
  return coordinate(Number(knot.a) & 0xff, Number(knot.b) & 0xff);
}

const MOVES = Object.freeze({
  16: swap16,
  32: swap32,
  64: swap64,
});

function swap16(words) {
  return words.map(w => (((w & 0xff) << 8) | ((w >>> 8) & 0xff)) & MASK16);
}

function swap32(words) {
  const out = [];
  for (let i = 0; i + 1 < words.length; i += 2) out.push(words[i + 1] & MASK16, words[i] & MASK16);
  return out;
}

function swap64(words) {
  const out = [];
  for (let i = 0; i + 3 < words.length; i += 4) {
    out.push(words[i + 2] & MASK16, words[i + 3] & MASK16, words[i] & MASK16, words[i + 1] & MASK16);
  }
  return out;
}

function movement(lane) {
  const move = MOVES[lane];
  if (!move) throw new TypeError('movement lane must be 16, 32, or 64');
  return Object.freeze({ kind: 'movement', lane, move });
}

function applyMove(mv, words) {
  if (!mv || mv.kind !== 'movement') throw new TypeError('applyMove expects a movement from movement()');
  return mv.move(words.map(w => w & MASK16));
}

// ---------------------------------------------------------------------------
// The BQF foundation: Q(x,y) = 60x^2 + 16xy + 4y^2
// Transcribed from /home/main/omi/omi-axioms/coq/03-projection/BQFBridgePreservesForms.v
// Names follow the Coq definitions; they are load-bearing.
//   60x^2 = bqf_high_shell    — self-measurement of one coordinate (the 0[pin] scalars)
//   16xy   = bqf_chiral_bridge — cross-measurement between two coordinates (the 0[boxd] radices)
//   4y^2   = bqf_local_seed    — local seed, the delta-4 step
// The 60 is derived, not chosen: the two nibble diagonal sets each XOR to 0 and
// each sum to 30, so 30 + 30 = 60. See dev-docs/10-bqf-foundation.md.
const HIGH_SHELL = 60;
const CHIRAL_BRIDGE = 16;
const LOCAL_SEED = 4;

const RADIX = Object.freeze({ '0b': 2, '0o': 8, '0x': 16, '0d': 10 });

// The four radices XOR to exactly the 16xy coefficient: 2^8^16^10 = 16.
// Observed identity, not asserted by the Coq development.
const RADIX_XOR = RADIX['0b'] ^ RADIX['0o'] ^ RADIX['0x'] ^ RADIX['0d'];

// bqf_high_shell: the self-measurement of a single coordinate.
function bqfHighShell(x) {
  return HIGH_SHELL * x * x;
}

// bqf_chiral_bridge: the cross-measurement between two coordinates.
function bqfChiralBridge(x, y) {
  return CHIRAL_BRIDGE * x * y;
}

// bqf_local_seed: the local seed of the second coordinate.
function bqfLocalSeed(y) {
  return LOCAL_SEED * y * y;
}

// bqf = high_shell + chiral_bridge + local_seed
function bqf(x, y) {
  return bqfHighShell(x) + bqfChiralBridge(x, y) + bqfLocalSeed(y);
}

// bqf_decompose: bqf x y = 4 * (15x^2 + 4xy + y^2) = 4 * [11x^2 + (2x+y)^2]
// The Coq theorem is discharged by nia; here it is the algebra, not an assumption.
function bqfDecompose(x, y) {
  const inner = 15 * x * x + 4 * x * y + y * y;
  return { total: 4 * inner, inner, occlusion: 11 * x * x, square: (2 * x + y) * (2 * x + y) };
}

// ---------------------------------------------------------------------------
// The delta law: delta16(x, c) = rotl16(x,1) ^ rotl16(x,3) ^ rotr16(x,2) ^ c
// From coq/02-closure/DiagonalGaugeCloses.v; coq/04-execution/Delta16HasExactPeriodEight.v
// proves it has exact period 8.
function mask16(x) {
  return x & MASK16;
}

function rotl16(x, k) {
  const v = mask16(x);
  return mask16((v << k) | (v >>> (16 - k)));
}

function rotr16(x, k) {
  const v = mask16(x);
  return mask16((v >>> k) | (v << (16 - k)));
}

function delta16(x, c) {
  return mask16(rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ mask16(c));
}

// The two diagonal sets. Each XORs to 0 and each sums to 30; together 60.
const DIAGONAL_SETS = Object.freeze({
  DPLUS: Object.freeze([0, 5, 10, 15]),
  DMINUS: Object.freeze([3, 6, 9, 12]),
});

function diagonalClosure(values) {
  const xor = values.reduce((a, b) => a ^ b, 0);
  const sum = values.reduce((a, b) => a + b, 0);
  return Object.freeze({ values: Object.freeze(values.slice()), xor, sum, ready: xor === 0 && sum === 30 });
}

const dPlusClosure = diagonalClosure(DIAGONAL_SETS.DPLUS);
const dMinusClosure = diagonalClosure(DIAGONAL_SETS.DMINUS);

// The ChiralPhase inductive. This is the formal home of the read/write mode flip:
// DPlus/DMinus are the two readings, phaseToSign is the read/write selector.
const CHIRAL_PHASE = Object.freeze({
  DPLUS: 'DPlusPhase',
  DMINUS: 'DMinusPhase',
  BALANCED: 'BalancedPhase',
  INCOMPLETE: 'IncompletePhase',
});

// phase_to_sign: DPlus -> +1, DMinus -> -1, otherwise 0.
function phaseToSign(phase) {
  if (phase === CHIRAL_PHASE.DPLUS) return 1;
  if (phase === CHIRAL_PHASE.DMINUS) return -1;
  return 0;
}

// diagonal_phase_schedule = [DPlusPhase; DMinusPhase]
// polybius_phase_at n = nth (n mod 2) schedule BalancedPhase
// Coq proves polybius_phase_at n = if Nat.even n then DPlus else DMinus.
const DIAGONAL_PHASE_SCHEDULE = Object.freeze([CHIRAL_PHASE.DPLUS, CHIRAL_PHASE.DMINUS]);

function polybiusPhaseAt(n) {
  const k = ((n % 2) + 2) % 2;
  return DIAGONAL_PHASE_SCHEDULE[k];
}

// diagonal_race_phase: only report a phase if that closure is ready
// (closure_xor = 0 AND closure_sum = 30), else IncompletePhase.
function diagonalRacePhase(n) {
  const phase = polybiusPhaseAt(n);
  if (phase === CHIRAL_PHASE.DPLUS) return dPlusClosure.ready ? CHIRAL_PHASE.DPLUS : CHIRAL_PHASE.INCOMPLETE;
  if (phase === CHIRAL_PHASE.DMINUS) return dMinusClosure.ready ? CHIRAL_PHASE.DMINUS : CHIRAL_PHASE.INCOMPLETE;
  return phase;
}

// The 240 clock: five_factorial_resolution 120, local240 = 2 * 120 = 240.
const FIVE_FACTORIAL_RESOLUTION = 120;
const LOCAL_240_RESOLUTION = 2 * FIVE_FACTORIAL_RESOLUTION;

// The bridge selectors, from BQFBridgePreservesForms.v.
function fanoSelector(n) {
  return ((n % 7) + 7) % 7;
}

function local240Selector(n) {
  return ((n % LOCAL_240_RESOLUTION) + LOCAL_240_RESOLUTION) % LOCAL_240_RESOLUTION;
}

// bqf_bridge_at n: x = fano+1 (1..7), y = local240+1 (1..240), cross = 16xy.
function bqfBridgeAt(n) {
  const x = fanoSelector(n) + 1;
  const y = local240Selector(n) + 1;
  return Object.freeze({
    orbit: n,
    fano7: fanoSelector(n),
    local240: local240Selector(n),
    x,
    y,
    cross: bqfChiralBridge(x, y),
    q: bqf(x, y),
  });
}

// wordform = (0n, 0p): the two integer indices a wordform shares.
// 0n is the number/value component, 0p the position/location component.
function wordform(n, p) {
  return Object.freeze({ kind: 'wordform', n: n & MASK16, p: p & MASK16 });
}

function ratio(wf) {
  if (!wf || wf.kind !== 'wordform') throw new TypeError('ratio expects a wordform from wordform()');
  return wf.p === 0 ? null : wf.n / wf.p;
}

function crossProduct(a, b) {
  if (!a || a.kind !== 'wordform' || !b || b.kind !== 'wordform') {
    throw new TypeError('crossProduct expects two wordforms');
  }
  return Object.freeze({
    '0p_a×0n_b': xorIndex(a.p, b.n),
    '0n_a×0p_b': xorIndex(a.n, b.p),
  });
}

// Pythagorean comparison of two wordforms. The two axes are orthogonal:
//   d_p² + d_n² = d²  (the hypotenuse)
function pythagorean(a, b) {
  if (!a || a.kind !== 'wordform' || !b || b.kind !== 'wordform') {
    throw new TypeError('pythagorean expects two wordforms from wordform()');
  }
  const dn = xorIndex(a.n, b.n);
  const dp = xorIndex(a.p, b.p);
  const dN = popcount(dn);
  const dP = popcount(dp);
  const d2 = dN * dN + dP * dP;
  return Object.freeze({
    a,
    b,
    dn,
    dp,
    d_n: dN,
    d_p: dP,
    d2,
    d: Math.sqrt(d2),
    slope: dP === 0 ? null : dN / dP,
    closure: wordform(dN, dP),
  });
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  assert('coordinate roundtrip', coordinate(0xab, 0xcd) === 0xabcd && subHi(0xabcd) === 0xab && subLo(0xabcd) === 0xcd);
  assert('fold collapses subarrays', foldWord(0xabcd) === (0xab ^ 0xcd));
  assert('fold of equal halves is pinch 0', foldWord(coordinate(0x5a, 0x5a)) === 0x00);
  assert('xorIndex involution', ((xorIndex(0xabcd, 0x1357) ^ 0x1357) & MASK16) === 0xabcd);
  assert('distance self 0', distance(0x1234, 0x1234) === 0);
  assert('distance symmetric', distance(0x00ff, 0xff00) === distance(0xff00, 0x00ff));
  assert('distance full byte split', distance(0x0000, 0xffff) === 16);
  assert('distance nibble swap', distance(0x0f0f, 0xf00f) === 8);

  assert('placement diagonal local', placement(0x0000).frame === 'local' && placement(0x0000).name === 'diagonal');
assert('read mode scopes local/global', placement(0x0000, 'read').frame === 'local' && placement(0x001b, 'read').frame === 'global');
assert('write mode places spectral/spatial', placement(0x0000, 'write').frame === 'spectral' && placement(0x001b, 'write').frame === 'spatial');
assert('one space two readings', placement(0x001b).slot === placement(0x001b, 'write').slot);

const hl = [0x1111, 0x2222, 0x3333];
  const hHit = hit(hl, 0x2222);
  assert('hit in hit:list is a swap', hHit.hit === true && hHit.op === 'swap' && hHit.now === 0x2222);
  const hMiss = hit(hl, 0x9999);
  assert('miss is not a swap', hMiss.hit === false && hMiss.op === 'pass' && hMiss.now === 0x9999);
  const ix = intersect([0x1111, 0x2222], [0x2222, 0x4444]);
  assert('intersection swaps shared', ix.count === 1 && ix.shared[0] === 0x2222 && ix.ops[0].op === 'swap');
  const flipped = flipMode(placement(0x001b, 'read'));
  assert('flipMode is the pure endianness', flipped.slot === placement(0x001b, 'read').slot && flipped.frame === 'spatial' && flipped.mode === 'write');
  assert('flipMode is involutive', flipMode(flipped).frame === 'global' && flipMode(flipMode(flipped)).mode === 'write' && flipMode(flipMode(flipped)).frame === 'spatial');
  assert('faces fold to zero', (0x1c ^ 0x1d ^ 0x1e ^ 0x1f) === 0x00);
  assert('world axes are 3!', SLOT_NAMES.slice(2, 8).length === 6);

  const exHit = exchangeExpected(5, 5, 99);
  assert('exchange matched', exHit.matched === true && exHit.was === 5 && exHit.now === 99);
  const exMiss = exchangeExpected(5, 9, 99);
  assert('exchange unmatched reports actual', exMiss.matched === false && exMiss.now === 5);

  const k = bind(5, 3);
  assert('bind/apply/eval pure', apply(bind(5, 99), 5) === 99 && evaluate(k) === 5);

  const res = resolve(0x1c1f, 0x1d1e);
  assert('resolve reports discrepancy', res.discrepancyBits === distance(0x1c1f, 0x1d1e) && res.identical === false);

  const frozen = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
  const d = digest(frozen, 1);
  assert('digest pure on frozen', Math.abs(d.value - 4.5) < 1e-9);

  const inv = (arr) => arr.every(v => v === 0 || v === null || arr.includes(v));
  const two16 = swap16([0x1234]);
  assert('swap16 is involution', swap16(two16)[0] === 0x1234 && two16[0] === 0x3412);
  const two32 = swap32([0x1234, 0x5678]);
  assert('swap32 pivots the pair', two32[0] === 0x5678 && two32[1] === 0x1234 && swap32(two32)[0] === 0x1234);
  const four = swap64([0x1111, 0x2222, 0x3333, 0x4444]);
  assert('swap64 pivots the 4-block', four[0] === 0x3333 && four[1] === 0x4444 && four[2] === 0x1111 && four[3] === 0x2222);
  assert('swap64 is involution', swap64(four)[0] === 0x1111);
  assert('fold survives 16-swap', foldWord(swap16([0x12ab])[0]) === foldWord(0x12ab));
  assert('movement is pure (source unchanged)', (function () {
    const src = [0x1111, 0x2222];
    const out = applyMove(movement(32), src);
    return src[0] === 0x1111 && src[1] === 0x2222 && out[0] === 0x2222;
  })());

  const wA = wordform(0x1234, 0x5678);
  const wB = wordform(0x1234, 0x9abc);
  const p = pythagorean(wA, wB);
  assert('wordform carries 0n and 0p', wA.n === 0x1234 && wA.p === 0x5678 && wB.n === 0x1234 && wB.p === 0x9abc);
  assert('pythagorean same-n axis', p.d_n === 0 && p.d_p === popcount(0x5678 ^ 0x9abc));
  assert('pythagorean pythagoras law', Math.abs(p.d2 - (p.d_n * p.d_n + p.d_p * p.d_p)) < 1e-9);
  assert('closure distance is a wordform', p.closure.kind === 'wordform' && p.closure.n === p.d_n && p.closure.p === p.d_p);
  assert('ratio of wordform components', ratio(wA) === 0x1234 / 0x5678);
  const cr = crossProduct(wA, wB);
  assert('cross product mixes axes', cr['0p_a×0n_b'] === xorIndex(0x5678, 0x1234) && cr['0n_a×0p_b'] === xorIndex(0x1234, 0x9abc));

  // --- the BQF foundation (dev-docs/10-bqf-foundation.md) ---
  const dPlus = diagonalClosure(DIAGONAL_SETS.DPLUS);
  const dMinus = diagonalClosure(DIAGONAL_SETS.DMINUS);
  assert('dplus_xor_zero (Coq)', dPlus.xor === 0);
  assert('dminus_xor_zero (Coq)', dMinus.xor === 0);
  assert('dplus_sum_1e (Coq)', dPlus.sum === 30);
  assert('dminus_sum_1e (Coq)', dMinus.sum === 30);
  assert('the 60 is derived: 30 + 30', dPlus.sum + dMinus.sum === HIGH_SHELL);
  assert('both diagonal closures ready', dPlus.ready && dMinus.ready);

  assert('bqf layer sum (Coq bqf_layer_sum)', bqf(3, 5) === 60 * 9 + 16 * 15 + 4 * 25);
  assert('bqf_chiral_bridge_is_16xy (Coq)', bqfChiralBridge(3, 5) === 16 * 3 * 5);
  const dec = bqfDecompose(1, 1);
  assert('bqf_decompose (Coq): bqf(1,1) = 4*(15+4+1) = 80', bqf(1, 1) === 80 && dec.total === 80);
  assert('bqf_decompose: occlusion 11x^2 + square (2x+y)^2 = 20', dec.occlusion === 11 && dec.square === 9 && dec.inner === 20);
  assert('bqf_decompose is an identity', (function () {
    for (let x = 0; x <= 30; x++) for (let y = 0; y <= 30; y++) {
      if (bqfDecompose(x, y).total !== bqf(x, y)) return false;
    }
    return true;
  })());
  assert('radix XOR 0b^0o^0x^0d = 16 (the chiral bridge coefficient)', RADIX_XOR === CHIRAL_BRIDGE);
  assert('local seed coefficient 4 = the four radices', Object.keys(RADIX).length === LOCAL_SEED);
  assert('60 = 2^2 * 3 * 5 (first three primes)', HIGH_SHELL === 2 * 2 * 3 * 5);

  // the delta law
  assert('delta16 is width preserving', (function () {
    for (let x = 0; x < 65536; x += 977) if (delta16(x, 0x1d1d) > MASK16) return false;
    return true;
  })());
  assert('delta16 has exact period 8 (Coq Delta16HasExactPeriodEight)', (function () {
    for (let c = 0; c <= 0xffff; c += 4093) {
      const start = 0x1234;
      let a = start;
      for (let i = 0; i < 8; i++) a = delta16(a, c);
      if (a !== start) return false;
      let b = start;
      for (let i = 0; i < 4; i++) b = delta16(b, c);
      if (b === start) return false; // period is exactly 8, not 4
    }
    return true;
  })());
  assert('rotl16/rotr16 are inverses', (function () {
    for (let x = 0; x < 65536; x += 1237) {
      for (let k = 1; k < 16; k++) if (rotr16(rotl16(x, k), k) !== x) return false;
    }
    return true;
  })());

  // the chiral phase, and its tie to the read/write flip
  assert('phase_to_sign (Coq)', phaseToSign(CHIRAL_PHASE.DPLUS) === 1 && phaseToSign(CHIRAL_PHASE.DMINUS) === -1 && phaseToSign(CHIRAL_PHASE.BALANCED) === 0);
  assert('polybius_phase_at is period 2 (Coq polybius_diagonal_race)', (function () {
    for (let n = 0; n < 64; n++) {
      const expected = n % 2 === 0 ? CHIRAL_PHASE.DPLUS : CHIRAL_PHASE.DMINUS;
      if (polybiusPhaseAt(n) !== expected) return false;
      if (polybiusPhaseAt(n + 2) !== polybiusPhaseAt(n)) return false;
    }
    return true;
  })());
  assert('diagonal_race_phase only reports a ready closure', diagonalRacePhase(0) === CHIRAL_PHASE.DPLUS && diagonalRacePhase(1) === CHIRAL_PHASE.DMINUS);
  assert('an incomplete set yields IncompletePhase', diagonalClosure([1, 2, 3]).ready === false);
  assert('the D+/D- signs are the read/write selector', phaseToSign(CHIRAL_PHASE.DPLUS) === -phaseToSign(CHIRAL_PHASE.DMINUS));
  assert('flipMode is the D+ <-> D- transition', (function () {
    const p = placement(0x001b, 'read');
    const w = flipMode(p);
    return p.mode === 'read' && w.mode === 'write' && phaseToSign(CHIRAL_PHASE.DPLUS) === -phaseToSign(CHIRAL_PHASE.DMINUS);
  })());

  // the 240 clock and the bridge selectors
  assert('five_factorial_resolution = 120', FIVE_FACTORIAL_RESOLUTION === 120);
  assert('local240_is_two_5factorial (Coq)', LOCAL_240_RESOLUTION === 2 * 120 && LOCAL_240_RESOLUTION === 240);
  assert('fano_selector_bound (Coq): < 7', (function () {
    for (let n = 0; n < 1000; n++) if (fanoSelector(n) >= 7) return false;
    return true;
  })());
  assert('local240_selector_bound (Coq): < 240', (function () {
    for (let n = 0; n < 1000; n++) if (local240Selector(n) >= LOCAL_240_RESOLUTION) return false;
    return true;
  })());
  assert('bqf_bridge_cross_is_16xy (Coq)', (function () {
    for (let n = 0; n < 500; n++) {
      const b = bqfBridgeAt(n);
      if (b.cross !== 16 * b.x * b.y) return false;
      if (b.x < 1 || b.x > 7) return false;
      if (b.y < 1 || b.y > 240) return false;
    }
    return true;
  })());
  assert('the bridge is a function of one n (geometry reduces to an orbit)', (function () {
    for (let n = 0; n < 500; n++) if (bqfBridgeAt(n).orbit !== n) return false;
    return true;
  })());

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results,
  };
}

module.exports = {
  MASK16,
  coordinate,
  subHi,
  subLo,
  foldWord,
  xorIndex,
  popcount,
  distance,
  is,
  FRAMES,
  OPPOSITE,
  placement,
  flipMode,
  hit,
  intersect,
  resolve,
  exchangeExpected,
  pairToCoordinate,
  MOVES,
  swap16,
  swap32,
  swap64,
  movement,
  applyMove,
  wordform,
  ratio,
  crossProduct,
  pythagorean,
  HIGH_SHELL,
  CHIRAL_BRIDGE,
  LOCAL_SEED,
  RADIX,
  RADIX_XOR,
  bqfHighShell,
  bqfChiralBridge,
  bqfLocalSeed,
  bqf,
  bqfDecompose,
  mask16,
  rotl16,
  rotr16,
  delta16,
  CHIRAL_PHASE,
  phaseToSign,
  DIAGONAL_PHASE_SCHEDULE,
  polybiusPhaseAt,
  diagonalRacePhase,
  DIAGONAL_SETS,
  diagonalClosure,
  dPlusClosure,
  dMinusClosure,
  FIVE_FACTORIAL_RESOLUTION,
  LOCAL_240_RESOLUTION,
  fanoSelector,
  local240Selector,
  bqfBridgeAt,
  selfTest,
};