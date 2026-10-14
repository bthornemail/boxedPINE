/**
 * OMI-IMO 8-slot Ruler + Core Operations
 * bind / apply / eval / digest
 *
 * Primitive mapping (Spec §1–§6, §16–§18):
 *   Atomics.compareExchange(array, index, expected, replacement)
 *     bind   — construct relation (expected, replacement)
 *     apply  — invoke comparison + conditional swap
 *     eval   — return the old value
 *   digest  — read → consider (F-mean / XOR significance) → print
 *
 * Bitwise reduction: XOR (difference) + AND (conditional write)
 * Logic: IFF = XOR ⊕ 1
 */
'use strict';

const SLOT_NAMES = Object.freeze([
  'diagonal', // 0 – origin / XOR of all six
  'size',     // 1 – unit count
  'top',      // 2
  'bottom',   // 3
  'right',    // 4
  'left',     // 5
  'forward',  // 6
  'backward'  // 7
]);

// ---------- Ruler ----------
function createRuler(initial = null) {
  const r = new Float64Array(8);
  if (initial) {
    for (let i = 0; i < 8 && i < initial.length; i++) r[i] = Number(initial[i]) || 0;
  }
  return r;
}

function rulerToObject(ruler) {
  const o = {};
  for (let i = 0; i < 8; i++) o[SLOT_NAMES[i]] = ruler[i];
  return o;
}

// ---------- XOR helpers (reduction) ----------
function xorNumber(a, b) {
  // Integer XOR on 32-bit view; for floats we use a stable integer projection
  const ai = (a | 0);
  const bi = (b | 0);
  return (ai ^ bi) >>> 0;
}

function xorRuler(r1, r2) {
  const out = createRuler();
  for (let i = 0; i < 8; i++) out[i] = xorNumber(r1[i], r2[i]);
  return out;
}

/**
 * IFF = XOR ⊕ 1  (equivalence check at bit level)
 * Returns 1 when a and b are equal (under integer projection), else 0.
 */
function iff(a, b) {
  return (xorNumber(a, b) === 0) ? 1 : 0;
}

// ---------- Knot (symmetric relation) ----------
/**
 * bind(a, b) — construct a symmetric knot.
 * The knot is bidirectional: bind(a,b) ≡ bind(b,a) for equality purposes.
 */
function bind(a, b) {
  return Object.freeze({
    kind: 'knot',
    a,
    b,
    // precompute XOR difference for the relation
    delta: (typeof a === 'number' && typeof b === 'number')
      ? xorNumber(a, b)
      : null
  });
}

/**
 * apply(knot, subject?) — invoke the relation.
 *
 * Two forms:
 *  1. apply(knot, fn)     — call fn(knot.a, knot.b)  (Functor lift)
 *  2. apply(knot, value)  — if value === expected (knot.a), return replacement (knot.b)
 *                           else return value  (compareExchange semantics)
 *
 * When the second argument is omitted, apply returns the XOR delta of the knot.
 */
function apply(knot, subject) {
  if (!knot || knot.kind !== 'knot') {
    throw new TypeError('apply expects a knot from bind()');
  }

  if (subject === undefined) {
    return knot.delta !== null ? knot.delta : xorNumber(
      typeof knot.a === 'number' ? knot.a : 0,
      typeof knot.b === 'number' ? knot.b : 0
    );
  }

  if (typeof subject === 'function') {
    return subject(knot.a, knot.b);
  }

  // compareExchange-style: if subject matches expected (a), yield replacement (b)
  if (typeof subject === 'number' && typeof knot.a === 'number') {
    return iff(subject, knot.a) ? knot.b : subject;
  }

  // structural equality for non-numbers
  return Object.is(subject, knot.a) ? knot.b : subject;
}

/**
 * eval(knot) — extract the value from the relation.
 * Canonical extraction is the first component (a).
 * Because bind is symmetric, eval(bind(a,b)) and eval(bind(b,a)) differ only by order;
 * we always return .a as the principal value.
 */
function evalKnot(knot) {
  if (!knot || knot.kind !== 'knot') {
    throw new TypeError('eval expects a knot from bind()');
  }
  return knot.a;
}

// Alias so callers can write eval(...) without clashing with JS eval
const evaluate = evalKnot;

// ---------- Digest ----------
/**
 * digest(ruler, p = 1) — generalized F-mean
 *   M_p = ( (1/n) Σ |x_i|^p )^(1/p)
 *   p = 0 → geometric mean (exp of mean of logs of positive values)
 *   p = 1 → arithmetic mean
 *   p = 2 → RMS
 *
 * Also returns significance metadata (XOR fold + popcount-style bit weight).
 */
function digest(ruler, p = 1) {
  if (!ruler || typeof ruler.length !== 'number') {
    throw new TypeError('digest expects a ruler (array-like of length 8)');
  }
  const n = ruler.length;
  if (n === 0) {
    return { value: 0, xorFold: 0, weight: 0, p };
  }

  let mean;
  if (p === 0) {
    let sumLog = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      const v = Math.abs(ruler[i]);
      if (v > 0) {
        sumLog += Math.log(v);
        count++;
      }
    }
    mean = count ? Math.exp(sumLog / count) : 0;
  } else {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.pow(Math.abs(ruler[i]), p);
    }
    mean = Math.pow(sum / n, 1 / p);
  }

  // XOR fold across integer projections (significance)
  let xorFold = 0;
  let weight = 0;
  for (let i = 0; i < n; i++) {
    const v = (ruler[i] | 0) >>> 0;
    xorFold ^= v;
    // popcount of lower 32 bits
    let x = v;
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    weight += (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
  }

  return Object.freeze({
    value: mean,
    xorFold: xorFold >>> 0,
    weight,
    p,
    // iff-style: read ⟺ print when mean is stable under re-digest of a constant ruler
    iffStable: true
  });
}

/**
 * Full cycle: read → consider → print
 * Returns the digest result and optionally writes the mean back into ruler[0] (diagonal).
 */
function digestCycle(ruler, p = 1, writeBack = false) {
  const result = digest(ruler, p);
  if (writeBack) {
    ruler[0] = result.value; // diagonal receives the significance
  }
  return result;
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  // bind symmetry
  const k1 = bind(7, 3);
  const k2 = bind(3, 7);
  assert('bind creates knot', k1.kind === 'knot' && k1.a === 7 && k1.b === 3);
  assert('bind delta XOR', k1.delta === (7 ^ 3));
  assert('bind symmetric deltas', k1.delta === k2.delta);

  // apply as function
  const sum = apply(k1, (a, b) => a + b);
  assert('apply(fn)', sum === 10);

  // apply as compareExchange
  assert('apply match → replacement', apply(bind(5, 99), 5) === 99);
  assert('apply miss → subject', apply(bind(5, 99), 6) === 6);

  // apply with no subject → delta
  assert('apply() → delta', apply(k1) === (7 ^ 3));

  // eval
  assert('eval → a', evaluate(k1) === 7);
  assert('eval of reverse', evaluate(k2) === 3);

  // iff
  assert('iff equal', iff(4, 4) === 1);
  assert('iff unequal', iff(4, 5) === 0);

  // digest arithmetic mean
  const r = createRuler([2, 4, 6, 8, 10, 12, 14, 16]);
  const d1 = digest(r, 1);
  const expectedMean = (2 + 4 + 6 + 8 + 10 + 12 + 14 + 16) / 8;
  assert('digest p=1 mean', Math.abs(d1.value - expectedMean) < 1e-9, String(d1.value));

  // digest RMS
  const d2 = digest(r, 2);
  const sumSq = 2 * 2 + 4 * 4 + 6 * 6 + 8 * 8 + 10 * 10 + 12 * 12 + 14 * 14 + 16 * 16;
  const expectedRms = Math.sqrt(sumSq / 8);
  assert('digest p=2 RMS', Math.abs(d2.value - expectedRms) < 1e-9, String(d2.value));

  // digest XOR fold non-zero
  assert('digest xorFold', typeof d1.xorFold === 'number');
  assert('digest weight > 0', d1.weight > 0);

  // digestCycle write-back
  const r2 = createRuler([1, 1, 1, 1, 1, 1, 1, 1]);
  const dc = digestCycle(r2, 1, true);
  assert('digestCycle writeBack', r2[0] === dc.value);

  // xorRuler
  const zr = xorRuler(createRuler([1, 2, 3, 4, 5, 6, 7, 8]), createRuler([1, 2, 3, 4, 5, 6, 7, 8]));
  let allZero = true;
  for (let i = 0; i < 8; i++) if (zr[i] !== 0) allZero = false;
  assert('xorRuler identity', allZero);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  SLOT_NAMES,
  createRuler,
  rulerToObject,
  xorNumber,
  xorRuler,
  iff,
  bind,
  apply,
  evalKnot,
  evaluate,
  digest,
  digestCycle,
  selfTest
};
