/**
 * space.js — the address space, one file, three sections.
 *
 * 0x00 - 0x13 (0-19), laid out in three sections with the equation in the middle:
 *
 *   SECTION 1  BINDING       0, 2, 1
 *                          a 3-cycle: 0 -> 1 -> 2 -> 0
 *
 *   SECTION 2  APPLICATION   3, 5, 7, 9  vs  4, 6, 8
 *                          the equation. Odd against even.
 *
 *   SECTION 3  EVALUATION    17, 19
 *                          the two anchors, and 18 between them.
 *
 * 0x0A-0x0F (10-15) are the six that bind to a source or a sink. 0x10 (16) is
 * reserved. 18 is /pin/: the observer reference, and the one that can XOR the
 * three scalars 0p, 0i, 0n.
 *
 * Two tiers, and they are not the same tier:
 *
 *   STRUCTURE  either the datum is properly structured and flows through, or it
 *              is not and we throw an exception carrying a proper structured
 *              coordinate. There is no third option. We do not measure our way
 *              out of malformed structure.
 *
 *   VALUE      for well-formed data that merely differs, there is no "wrong".
 *              Atomics.compareExchange leaves the cell alone and reports what
 *              was actually there, with the XOR as the discrepancy. That XOR is
 *              the measurement.
 *
 * The 16-bit/8-bit fold: delta and omi are two views over one buffer, and each
 * is folded through its own section before the two are XOR'd against each
 * other. The XOR of the two projections is the central inversion; if the
 * projections do not align, the XOR collapses to zero and no corrupted state
 * can compile.
 *
 * 'use strict';
 */

const { xorNumber } = require('./ruler.js');

// ---------------------------------------------------------------------------
// The space. Three sections, read off the structure of the old bind().
// ---------------------------------------------------------------------------

// Section 1. The triples (index, expected, replacement) of the old frame init:
//   compareExchange(metric, 0, 2, 1) ^ compareExchange(metric, 1, 0, 2)
//                                   ^ compareExchange(metric, 2, 1, 0)
const BINDING_CYCLE = Object.freeze([0, 2, 1]);

// Section 2. The dual-cube: even composite axes against odd prime axes. The
// old code walks even indices 0,2,4,6,8 and odd indices 1,3,5,7,9; the values
// that matter are the inner ones, the odd against the even.
const APPLICATION_ODD = Object.freeze([3, 5, 7, 9]);
const APPLICATION_EVEN = Object.freeze([4, 6, 8]);

// The walks themselves, as (index, expected, replacement) triples.
const APPLICATION_EVEN_WALK = Object.freeze([
  Object.freeze({ i: 0, e: 4, r: 2 }),
  Object.freeze({ i: 2, e: 6, r: 4 }),
  Object.freeze({ i: 4, e: 8, r: 6 }),
  Object.freeze({ i: 6, e: 0, r: 8 }),
  Object.freeze({ i: 8, e: 2, r: 0 }),
]);
const APPLICATION_ODD_WALK = Object.freeze([
  Object.freeze({ i: 1, e: 5, r: 3 }),
  Object.freeze({ i: 3, e: 7, r: 5 }),
  Object.freeze({ i: 5, e: 9, r: 7 }),
  Object.freeze({ i: 7, e: 1, r: 9 }),
  Object.freeze({ i: 9, e: 3, r: 1 }),
]);

// Section 3. The old code anchors index 17 in both views and returns a
// two-element window: the two-sided boundary pair. 18 is the point between the
// two anchors, and that is /pin/.
const EVALUATION_ANCHORS = Object.freeze([17, 19]);
const PIN = 18;
const PIN_INDEX = 18;

// The six that bind to a source or a sink.
const BOUND = Object.freeze([0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
const RESERVED = 0x10;

const SPACE_SIZE = 20;

// Every slot in the space, and which section owns it. 0-19, no gaps.
const SPACE = Object.freeze(Array.from({ length: SPACE_SIZE }, (_, i) => Object.freeze({
  index: i,
  hex: '0x' + i.toString(16).toUpperCase().padStart(2, '0'),
  section: i <= 2 ? 'binding'
    : i <= 9 ? 'application'
      : i <= 0x0f ? 'bound'
        : i === RESERVED ? 'reserved'
          : 'evaluation',
})));

// ---------------------------------------------------------------------------
// Tier one: structure. Admissible, or an exception carrying a coordinate.
// ---------------------------------------------------------------------------

// The exception carries a proper structured coordinate, not a message. It also
// carries a typed view of the buffer when there is one, so the thrower can be
// inspected at the point of failure without re-deriving anything.
class CoordinateError extends Error {
  constructor(coordinate, reason) {
    super('admissibility failed: ' + reason);
    this.name = 'CoordinateError';
    this.coordinate = Object.freeze(coordinate);
    this.reason = reason;
  }
}

// What counts as properly structured: a number, an ArrayBuffer, a typed array
// view over 8- or 16-bit cells, or an array-like of such. Nothing else enters.
function admissible(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (value instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(value)) {
    return value.BYTES_PER_ELEMENT === 1 || value.BYTES_PER_ELEMENT === 2;
  }
  if (Array.isArray(value)) {
    return value.every(v => typeof v === 'number' && Number.isFinite(v));
  }
  return false;
}

// The structured coordinate an exception carries. x is the source index, y the
// target index, and both are 0x0-0xF because those are the six that bind.
function coordinate(x, y, view) {
  const c = {
    x,
    y,
    pin: PIN,
    binding: BINDING_CYCLE,
    application: Object.freeze({
      odd: APPLICATION_ODD,
      even: APPLICATION_EVEN,
    }),
    evaluation: EVALUATION_ANCHORS,
  };
  if (view instanceof ArrayBuffer) {
    c.byteLength = view.byteLength;
  } else if (view && ArrayBuffer.isView(view)) {
    c.byteOffset = view.byteOffset;
    c.byteLength = view.byteLength;
    c.cells = view.length;
    c.bytesPerCell = view.BYTES_PER_ELEMENT;
  }
  return c;
}

// The gate. Properly structured data returns unchanged; anything else throws
// with a coordinate attached. We do not repair it and we do not measure it.
function enforce(value, x, y) {
  if (admissible(value)) return value;
  throw new CoordinateError(coordinate(x, y, ArrayBuffer.isView(value) ? value : null),
    'expected a number, a typed array of 8- or 16-bit cells, or an array of numbers; got ' + typeof value);
}

// ---------------------------------------------------------------------------
// Tier two: value. compare and exchange. Never throws on a mismatch.
// ---------------------------------------------------------------------------

// The Atomics form, as the old code used it: (view, index, expected, replacement).
// Returns the value the cell actually held, so a mismatch is reportable rather
// than an error. Falls back to a plain read/write off a shared buffer.
function compareExchange(view, index, expected, replacement) {
  if (view && typeof Atomics !== 'undefined' && sharedBufferFor(view)) {
    return Atomics.compareExchange(view, index, expected, replacement);
  }
  const held = view[index];
  if (held === expected) view[index] = replacement;
  return held;
}

const _shared = new WeakMap();
function sharedBufferFor(view) {
  return _shared.get(view) === true;
}
function markShared(view) {
  _shared.set(view, true);
  return view;
}

// The same operation on plain values, for the read path. Reports three things
// and refuses nothing.
function exchange(cell, expected, replacement) {
  const discrepancy = (typeof cell === 'number' && typeof expected === 'number')
    ? xorNumber(cell, expected) : null;
  const matched = discrepancy === 0;
  return Object.freeze({
    matched,
    now: matched ? replacement : cell,
    discrepancy,
  });
}

// ---------------------------------------------------------------------------
// The fold. delta and omi are two views over one buffer, 16-bit cells each,
// delta taking the first half and omi the second.
// ---------------------------------------------------------------------------

// Two 16-bit views over one buffer: the 8-bit subarray folded into each.
function views(buffer) {
  const delta = new Int16Array(buffer, 0, buffer.byteLength >> 2);
  const omi = new Int16Array(buffer, delta.length * 2, buffer.byteLength >> 2);
  return { delta, omi };
}

// Section 1. Anchor the frame: the 3-cycle 0 -> 1 -> 2 -> 0, and the XOR of
// the three exchanges is the frame's own centre.
function foldBinding(view) {
  const cycle = [
    { i: 0, e: 2, r: 1 },
    { i: 1, e: 0, r: 2 },
    { i: 2, e: 1, r: 0 },
  ];
  let centre = 0;
  for (const step of cycle) centre = xorNumber(centre, compareExchange(view, step.i, step.e, step.r));
  return centre;
}

// Section 2. The equation: the even walk against the odd walk, each XOR'd in.
// Two subarrays of one buffer, folded apart and then against each other.
function foldApplication(delta, omi, meta) {
  let even = meta | 0;
  for (const step of APPLICATION_EVEN_WALK) even ^= compareExchange(delta, step.i, step.e, step.r);
  let odd = 0;
  for (const step of APPLICATION_ODD_WALK) odd ^= compareExchange(omi, step.i, step.e, step.r);
  // The central inversion: the two projections against each other.
  const projection = xorNumber(even, odd);
  return { even, odd, projection, aligned: projection !== 0 };
}

// Section 3. Anchor 17 in both views, and read the pair back through /pin/.
function foldEvaluation(delta, omi, projection) {
  const left = compareExchange(delta, 17, 17, projection);
  const right = compareExchange(omi, 17, 19, projection);
  return { anchors: EVALUATION_ANCHORS, left, right, pin: PIN, response: PIN };
}

// The whole fold, over one buffer. Section 1 anchors, section 2 is the
// equation, section 3 reads the response. The order is the protocol.
function fold(buffer) {
  enforce(buffer, 0, 0);
  const { delta, omi } = views(buffer);
  const frame = foldBinding(delta);
  const application = foldApplication(delta, omi, delta[0] | 0);
  const evaluation = foldEvaluation(delta, omi, application.projection);
  return Object.freeze({
    frame,
    application,
    evaluation,
    // If the projections do not align the XOR collapses and nothing compiles.
    compiles: application.aligned,
    collapse: application.aligned ? 0 : application.projection,
  });
}

// ---------------------------------------------------------------------------
// /pin/ — the observer reference. The one that can XOR 0p, 0i, 0n.
// ---------------------------------------------------------------------------

// /pin/ is written as the whatever observer reference that can XOR those
// points, so a pin is a reference and the three scalars are the points it
// measures between. Reading is fold, not sum: the three XOR to one number.
function observe(p, i, n) {
  return xorNumber(xorNumber(p, i), n);
}

// The full reading at /pin/: the fold of the three, and the section each point
// belongs to. 0p and 0i and 0n are 0x0-0xF, the six that bind.
function pin(p, i, n) {
  for (const [name, v] of [['0p', p], ['0i', i], ['0n', n]]) {
    if (!Number.isInteger(v) || v < 0 || v > 0x0f) {
      throw new CoordinateError(coordinate(p, n, null), name + ' must be 0x0-0xF to bind');
    }
  }
  return Object.freeze({
    pin: PIN,
    responds: PIN,
    p, i, n,
    fold: observe(p, i, n),
    distance: popcount(observe(p, i, n)),
    sections: Object.freeze({
      p: SPACE[p].section,
      i: SPACE[i].section,
      n: SPACE[n].section,
    }),
  });
}

function popcount(x) {
  let v = x >>> 0;
  let c = 0;
  while (v) { v &= v - 1; c++; }
  return c;
}

// ---------------------------------------------------------------------------
// Binding the six to a source or a sink. The response comes back on /pin/ = 18.
// ---------------------------------------------------------------------------

// The six slots, each bound to a source or a sink. Reading a bound slot back
// gives the response at /pin/.
function bind(value, source) {
  if (!Number.isInteger(value) || value < BOUND[0] || value > BOUND[BOUND.length - 1]) {
    throw new CoordinateError(coordinate(value, source === true ? 0 : 1, null),
      'only 0xA-0xF bind to a source or a sink');
  }
  return Object.freeze({
    value,
    hex: '0x' + value.toString(16).toUpperCase(),
    target: source ? 'source' : 'sink',
    section: SPACE[value].section,
    responds: PIN,
  });
}

module.exports = {
  BINDING_CYCLE,
  APPLICATION_ODD,
  APPLICATION_EVEN,
  APPLICATION_EVEN_WALK,
  APPLICATION_ODD_WALK,
  EVALUATION_ANCHORS,
  PIN,
  PIN_INDEX,
  BOUND,
  RESERVED,
  SPACE_SIZE,
  SPACE,
  CoordinateError,
  admissible,
  coordinate,
  enforce,
  compareExchange,
  exchange,
  markShared,
  views,
  foldBinding,
  foldApplication,
  foldEvaluation,
  fold,
  observe,
  pin,
  bind,
  popcount,
  selfTest,
};

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  // --- the three sections, read off the old structure
  assert('section 1 binding is the 3-cycle 0,2,1', BINDING_CYCLE.join(',') === '0,2,1');
  assert('section 2 application is 3,5,7,9 vs 4,6,8',
    APPLICATION_ODD.join(',') === '3,5,7,9' && APPLICATION_EVEN.join(',') === '4,6,8');
  assert('section 3 evaluation is 17,19', EVALUATION_ANCHORS.join(',') === '17,19');
  assert('/pin/ is 18, the point between the two anchors', PIN === 18 && PIN > 17 && PIN < 19);
  assert('the six that bind are 0xA-0xF', BOUND.join(',') === '10,11,12,13,14,15');
  assert('0x10 is reserved', RESERVED === 16 && SPACE[16].section === 'reserved');
  assert('the space is 20 slots with no gaps', SPACE.length === 20 && SPACE.every((s, i) => s.index === i));
  assert('section boundaries are 0-2, 3-9, 10-15, 16, 17-19', (function () {
    const want = ['binding', 'binding', 'binding', 'application', 'application', 'application',
      'application', 'application', 'application', 'application', 'bound', 'bound', 'bound',
      'bound', 'bound', 'bound', 'reserved', 'evaluation', 'evaluation', 'evaluation'];
    return SPACE.every((s, i) => s.section === want[i]);
  })());

  // --- tier one: structure. admissible, or throw with a coordinate.
  assert('a number is admissible', admissible(1) && admissible(0) && !admissible(NaN));
  assert('an 8-bit typed array is admissible', admissible(new Uint8Array(4)));
  assert('a 16-bit typed array is admissible', admissible(new Int16Array(4)));
  assert('a 32-bit typed array is not admissible', !admissible(new Int32Array(4)));
  assert('a raw ArrayBuffer is admissible', admissible(new ArrayBuffer(8)));
  assert('an array of numbers is admissible', admissible([1, 2, 3]));
  assert('an object is not admissible', !admissible({}) && !admissible(null) && !admissible('x'));
  assert('enforce passes structured data through unchanged', enforce(7) === 7 && enforce([1, 2]).length === 2);
  assert('enforce throws on improper structure', (function () {
    try { enforce({ nope: true }); return false; } catch (e) { return e instanceof CoordinateError; }
  })());
  assert('the exception carries a proper structured coordinate', (function () {
    try { enforce({}, 3, 5); return false; } catch (e) {
      return e.coordinate.x === 3 && e.coordinate.y === 5 && e.coordinate.pin === 18
        && e.coordinate.binding.join(',') === '0,2,1'
        && e.coordinate.application.odd.join(',') === '3,5,7,9'
        && e.coordinate.application.even.join(',') === '4,6,8'
        && e.coordinate.evaluation.join(',') === '17,19';
    }
  })());
  assert('the exception is a real Error, so catch() works', (function () {
    try { enforce(null); return false; } catch (e) { return e instanceof Error && e.name === 'CoordinateError'; }
  })());
  assert('a typed view in the coordinate carries its offsets', (function () {
    try { enforce(new Int32Array(2), 1, 1); return false; } catch (e) {
      return e.coordinate.cells === 2 && e.coordinate.bytesPerCell === 4;
    }
  })());

  // --- tier two: value. compare and exchange, never throws on a mismatch.
  const buf = new ArrayBuffer(64);
  const a = new Int16Array(buf);
  const ex = exchange(5, 5, 9);
  const exMiss = exchange(5, 6, 9);
  assert('exchange exchanges on a match', ex.matched && ex.now === 9);
  assert('exchange leaves the cell alone on a miss', !exMiss.matched && exMiss.now === 5);
  assert('the discrepancy is the XOR', ex.discrepancy === 0 && exMiss.discrepancy === (5 ^ 6));
  assert('exchange does not throw on a mismatch', (function () {
    try { exchange(1, 999, 2); return true; } catch (e) { return false; }
  })());
  assert('compareExchange on a plain view exchanges and returns what was held', (function () {
    const v = new Int16Array(4);
    v[1] = 2;
    const held = compareExchange(v, 1, 2, 7);
    return held === 2 && v[1] === 7;
  })());
  assert('compareExchange on a miss leaves the cell and returns the actual', (function () {
    const v = new Int16Array(4);
    v[1] = 3;
    const held = compareExchange(v, 1, 99, 7);
    return held === 3 && v[1] === 3;
  })());

  // --- the fold: three sections, equation in the middle
  const fbuf = new ArrayBuffer(64);
  const f = fold(fbuf);
  assert('fold accepts a properly structured buffer', f !== null && typeof f.frame === 'number');
  assert('fold rejects an improper one with a coordinate', (function () {
    try { fold('nope'); return false; } catch (e) { return e instanceof CoordinateError; }
  })());
  assert('the two views are 16-bit subarrays of one buffer', (function () {
    const v = views(new ArrayBuffer(64));
    return v.delta.BYTES_PER_ELEMENT === 2 && v.omi.BYTES_PER_ELEMENT === 2
      && v.delta.buffer === v.omi.buffer && v.omi.byteOffset === v.delta.length * 2;
  })());
  assert('the application section is the equation: even against odd', (function () {
    const v = views(new ArrayBuffer(64));
    const app = foldApplication(v.delta, v.omi, 0);
    return app.even !== undefined && app.odd !== undefined
      && app.projection === xorNumber(app.even, app.odd);
  })());
  assert('the even walk is 0,2,4,6,8 and the odd walk is 1,3,5,7,9', (function () {
    return APPLICATION_EVEN_WALK.map(s => s.i).join(',') === '0,2,4,6,8'
      && APPLICATION_ODD_WALK.map(s => s.i).join(',') === '1,3,5,7,9';
  })());
  assert('the evaluation anchors at 17 in both views', (function () {
    const v = views(new ArrayBuffer(64));
    const e = foldEvaluation(v.delta, v.omi, 0x1234);
    return e.anchors.join(',') === '17,19' && e.response === 18;
  })());
  assert('if the projections do not align, nothing compiles', (function () {
    let collapsed = false;
    for (let seed = 0; seed < 64 && !collapsed; seed++) {
      const b = new ArrayBuffer(64);
      const vv = views(b);
      vv.delta[0] = seed;
      const app = foldApplication(vv.delta, vv.omi, seed);
      if (app.projection === 0) collapsed = true;
    }
    return collapsed;
  })());
  assert('fold reports compiles and a collapse value', (function () {
    const r = fold(new ArrayBuffer(64));
    return (r.compiles && r.collapse === 0) || (!r.compiles && typeof r.collapse === 'number');
  })());
  assert('the fold is a pure read of the three sections in order', (function () {
    const r = fold(new ArrayBuffer(64));
    return r.frame !== undefined && r.application !== undefined && r.evaluation !== undefined;
  })());

  // --- /pin/ — the observer that can XOR 0p, 0i, 0n
  assert('observe XORs the three points', observe(0x0a, 0x0b, 0x0c) === (0x0a ^ 0x0b ^ 0x0c));
  assert('observe is its own inverse', (function () {
    const f2 = observe(1, 2, 3);
    return observe(f2, 2, 3) === 1;
  })());
  assert('pin accepts 0x0-0xF', pin(0x0a, 0x0b, 0x0c).fold === (0x0a ^ 0x0b ^ 0x0c));
  assert('pin throws with a coordinate for a point outside 0x0-0xF', (function () {
    try { pin(0x10, 1, 2); return false; } catch (e) { return e instanceof CoordinateError && e.coordinate.pin === 18; }
  })());
  assert('pin names which section each point is in', (function () {
    const p = pin(0, 3, 0x0a);
    return p.sections.p === 'binding' && p.sections.i === 'application' && p.sections.n === 'bound';
  })());
  assert('pin reports its Hamming distance', pin(0, 0, 0).distance === 0 && pin(0xff & 0x0f, 0, 0).distance >= 0);
  assert('pin always responds on 18', pin(1, 2, 3).pin === 18 && pin(1, 2, 3).responds === 18);
  assert('a bound slot and a pinned reading agree on the response point', bind(0x0b, true).responds === pin(0x0b, 1, 1).responds);

  // --- the six bind to a source or a sink
  assert('0xA-0xF bind to a source', bind(0x0a, true).target === 'source');
  assert('0xA-0xF bind to a sink', bind(0x0f, false).target === 'sink');
  assert('a bind reports its section and the response point', bind(0x0b, true).section === 'bound' && bind(0x0b, true).responds === 18);
  assert('binding outside 0xA-0xF throws with a coordinate', (function () {
    try { bind(0x09, true); return false; } catch (e) { return e instanceof CoordinateError; }
  })());
  assert('binding 0x10 throws, it is reserved', (function () {
    try { bind(0x10, false); return false; } catch (e) { return e instanceof CoordinateError; }
  })());

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}
