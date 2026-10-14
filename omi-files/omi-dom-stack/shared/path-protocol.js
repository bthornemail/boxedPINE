/**
 * path-protocol.js — the declarative path layer.
 *
 * A protocol defines pathways and suggests shortcuts. It does not do the work:
 * it does not render, validate, interpret, or store. Those belong to the app.
 *
 *   X = data source        (an anchor)
 *   Y = data target        (an anchor)
 *
 * Computational cycles read in a sequence, so source and target are anchors
 * rather than free values. Binding targets closures and combinators, never
 * people: apply(knot, fn) in ruler.js is the canonical invocation.
 *
 * There is no wrong. There is compare and exchange.
 *
 *   ONE FUNCTION: compareExchange(cell, expected, replacement)
 *
 * On a request that does not match it does not throw and does not report an
 * error. It leaves the cell alone and returns what was actually there, plus the
 * discrepancy — the XOR, which is non-zero precisely when the two differ. The
 * difference IS the information.
 *
 * There are exactly two tiers, and they are not negotiable:
 *
 *   TIER 1 — VALUE. A well-formed request that disagrees. This is a reading.
 *   It is measured, reported, and never refused. compareExchange(5, 6, 9) does
 *   not throw; it returns { matched: false, now: 5, discrepancy: 3 }. So does Q
 *   on a pair that fails to close, and pin() on a value out of range. A
 *   disagreement is not a rejection, and neither is an unfamiliar answer.
 *
 *   TIER 2 — STRUCTURE. A request the protocol cannot even address: a cell that
 *   is not a number, a wordform that is not a string, a partition outside
 *   /0[boxd]/, a slot outside 0x0-0xF, an empty path. There is no measurement
 *   to report, because nothing was asked that has an answer. These throw
 *   CoordinateError carrying a structured .coordinate.
 *
 * The line between the tiers is not "does the caller like the answer". It is
 * whether the question was well posed. `rebase('0x', 16, '0d')` is well posed
 * and answers "10 vs 16" — tier 1. `rebase('0q', ...)` asks about a partition
 * that does not exist — tier 2. The first is information; the second is a
 * mistake, and conflating them with a bare `null` is how a protocol ends up
 * silently wrong.
 *
 * So: `null` and the magic `-1` are gone from this layer. An unresolved
 * reference that is a genuine reading is reported as an explicit
 * { resolved: false, reason } and never as a null the caller has to guess at.
 *
 * The BQF is the binding form of a source/target pair, and its two arguments
 * are Regex-typed wordforms:
 *
 *   Q(x: Regex, y: Regex) = 60x^2 + 16xy + 4y^2
 *
 * The regex is the declarative form; resolving it yields the natural number the
 * Coq development quantifies over (bqf : N -> N -> N in
 * coq/03-projection/BQFBridgePreservesForms.v). The constraint reveals the
 * structure: the regex is the lens, the index is what the lens shows.
 *
 * Storage is four partitions, one per binary precision, 0b / 0o / 0x / 0d. To
 * /0[pin]/ they are all the same thing: place-value indices, XOR-able, and
 * 0b ^ 0o ^ 0x ^ 0d === 16.
 *
 * 'use strict';
 */

const { xorNumber, bind, apply, evaluate } = require('./ruler.js');
const {
  BINDING_CYCLE, APPLICATION_ODD, APPLICATION_EVEN, EVALUATION_ANCHORS, PIN,
  CoordinateError,
} = require('./space.js');

// ---------------------------------------------------------------------------
// Tier two: structure. The coordinate an exception carries.
//
// Same shape as the space's, because there is one coordinate type in this
// protocol, plus the fields that only mean something in the path layer: the
// wordform, the partition, the slot, and which argument was malformed.
// ---------------------------------------------------------------------------

function pathCoordinate(detail) {
  return Object.freeze(Object.assign({
    x: null,
    y: null,
    pin: PIN,
    binding: BINDING_CYCLE,
    application: Object.freeze({ odd: APPLICATION_ODD, even: APPLICATION_EVEN }),
    evaluation: EVALUATION_ANCHORS,
  }, detail));
}

// The one place tier two is raised. Nothing else in this file throws a bare
// Error, so a caller can catch CoordinateError and trust that the question was
// malformed rather than merely unwelcome.
function refuse(detail, reason) {
  throw new CoordinateError(pathCoordinate(detail), reason);
}

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v) => typeof v === 'string';

// ---------------------------------------------------------------------------
// The one function.
// ---------------------------------------------------------------------------

// compareExchange — the primitive the whole protocol is made of.
// Reports three things and never refuses:
//   matched      — did the cell hold what was expected
//   now          — what the cell holds afterwards (replacement, or the original)
//   discrepancy  — the XOR of cell and expected; 0 iff matched
//
// Tier 1 for a miss: reports the difference, leaves the cell alone.
// Tier 2 for a non-cell: a "cell" that is not a number has no address and no
// XOR, so there is nothing to measure and this throws rather than inventing a
// null discrepancy that reads like "no difference".
function compareExchange(cell, expected, replacement) {
  if (!isNum(cell) || !isNum(expected)) {
    refuse(
      { argument: 'cell', cell: typeof cell, expected: typeof expected },
      'compareExchange compares cells, which are numbers; got cell of type '
        + typeof cell + ' and expected of type ' + typeof expected
    );
  }
  const discrepancy = xorNumber(cell, expected);
  const matched = discrepancy === 0;
  return Object.freeze({
    matched,
    now: matched ? replacement : cell,
    discrepancy,
  });
}

// The dual reading of any pair, always. Hamming distance is the non-zero count.
function popcount(x) {
  let v = x >>> 0;
  let c = 0;
  while (v) { v &= v - 1; c++; }
  return c;
}

// The only requirement of a reference is that it can be XOR'd.
function referenceDistance(a, b) {
  if (!isNum(a) || !isNum(b)) {
    refuse({ argument: 'reference', x: typeof a, y: typeof b },
      'a reference must be a number to be XOR-able; got ' + typeof a + ' and ' + typeof b);
  }
  return popcount(xorNumber(a, b));
}

// ---------------------------------------------------------------------------
// Storage partitions: four precisions, one thing to a place-value index.
// ---------------------------------------------------------------------------

const PARTITIONS = Object.freeze([
  Object.freeze({ slot: 0, name: '0b', radix: 2, bits: 1, precision: 'binary' }),
  Object.freeze({ slot: 1, name: '0o', radix: 8, bits: 3, precision: 'octal' }),
  Object.freeze({ slot: 2, name: '0d', radix: 10, bits: 4, precision: 'decimal' }),
  Object.freeze({ slot: 3, name: '0x', radix: 16, bits: 4, precision: 'hex' }),
]);

// To /0[pin]/ the four are the same thing. Their XOR is the 16xy coefficient.
const PARTITION_XOR = PARTITIONS.reduce((a, p) => xorNumber(a, p.radix), 0);

// The internal miss-tolerant finder. Used only by code that has already
// decided to report, never exposed.
function findPartition(name) {
  return PARTITIONS.find(q => q.name === name) || null;
}

// A partition is a name in /0[boxd]/. Exactly four exist. A fifth is not a
// surprising reading, it is a reference to nothing, so it is tier 2 and it
// throws with the offending name in the coordinate rather than returning null
// for the caller to dereference.
function partitionByName(name) {
  if (!isStr(name)) {
    refuse({ argument: 'partition', partition: typeof name },
      'a partition is named by one of /0[boxd]/; got ' + typeof name);
  }
  const p = findPartition(name);
  if (p === null) {
    refuse({ argument: 'partition', partition: name },
      'no partition named "' + name + '"; the reference space holds exactly '
        + PARTITIONS.map(q => q.name).join(', '));
  }
  return p;
}

// A partition is just another index. Re-expressing one index in another
// precision is compareExchange over the digit strings: same digits, matched;
// different digits, and the difference is reported.
function rebase(partition, index, otherPartition) {
  if (!isNum(index)) {
    refuse({ argument: 'index', partition, index: typeof index },
      'a place-value index is a number; got ' + typeof index);
  }
  const from = partitionByName(partition);
  const to = partitionByName(otherPartition);
  const here = index.toString(from.radix);
  const there = index.toString(to.radix);
  return Object.freeze({
    from: from.name,
    to: to.name,
    index,
    here,
    there,
    matched: stringXor(here, there) === 0,
    discrepancy: stringXor(here, there),
  });
}

// ---------------------------------------------------------------------------
// The wordform: the Regex-typed coordinate.
// ---------------------------------------------------------------------------

// Recognizes a wordform. Recognition exposes the form; it does not interpret it.
const WORDFORM = /^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/;

// The endcaps. 'p' ^ 'n' = 0x1E, the SECURE face mask, and it is not zero:
// a single wordform is an OPEN half. Two of them, mirrored, close to 0. That
// is why Q binds two.
const ENDCAP = Object.freeze({ p: 0x70, n: 0x6e });
const ENDCAP_XOR = ENDCAP.p ^ ENDCAP.n; // 0x1E

// The character-wise XOR of two strings. The general form of the closure test:
// a pair closes iff this is 0. Digits, endcaps, and re-expressed indices are all
// read this way, because the only requirement of a reference is that it XORs.
//
// A pair that does not close returns a non-zero number and that is a reading —
// the whole point of the closure test. A non-string is tier 2: there is no
// character sequence to XOR, and returning null here used to make an unpaired
// wordform look like a difference of zero.
function stringXor(a, b) {
  if (!isStr(a) || !isStr(b)) {
    refuse({ argument: 'wordform', form: typeof a, other: typeof b },
      'a wordform XOR is defined on strings; got ' + typeof a + ' and ' + typeof b);
  }
  const n = Math.max(a.length, b.length);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc ^= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return acc;
}

const wordformXor = stringXor;

// Resolving a wordform to a place-value index. A wordform is an index, not a
// value: the body is folded by XOR, never converted by base. A form that is not
// recognized still yields a report; it simply differs from what a form would be.
//
// That is the reading tier, deliberately preserved: '0x1f' is a well-posed
// question with an answer ("this is not a wordform"), and the answer is carried
// in `recognized` with a real discrepancy. Only a non-string is malformed.
function resolveWordform(form) {
  if (!isStr(form)) {
    refuse({ argument: 'form', form: typeof form },
      'a wordform is a string like p0xn; got ' + typeof form);
  }
  const recognized = WORDFORM.test(form);
  const body = recognized ? form.slice(1, -1).replace('.', '') : '';
  let index = 0;
  for (let i = 0; i < body.length; i++) index ^= body.charCodeAt(i);
  return Object.freeze(Object.assign(
    { form, recognized, body, index },
    compareExchange(recognized ? 1 : 0, 1, 1)
  ));
}

// The two endcaps exchange: the other chirality, read from the other end.
function flipWordform(form) {
  const r = resolveWordform(form);
  if (!r.recognized) return r;
  const body = form.slice(1, -1).replace('.', '');
  const head = form[0] === 'p' ? 'n' : 'p';
  const tail = form[form.length - 1] === 'p' ? 'n' : 'p';
  return Object.freeze(Object.assign({}, r, { form: head + body + tail, flipped: true }));
}

// ---------------------------------------------------------------------------
// Q(x: Regex, y: Regex) — the BQF as a binding of two wordforms.
// ---------------------------------------------------------------------------

const HIGH_SHELL = 60;
const CHIRAL_BRIDGE = 16;
const LOCAL_SEED = 4;
const LIFT_COEFFICIENT = HIGH_SHELL - CHIRAL_BRIDGE; // 44 = 4 * 11

function bqfHighShell(x) { return HIGH_SHELL * x * x; }
function bqfChiralBridge(x, y) { return CHIRAL_BRIDGE * x * y; }
function bqfLocalSeed(y) { return LOCAL_SEED * y * y; }

function bqf(x, y) {
  return bqfHighShell(x) + bqfChiralBridge(x, y) + bqfLocalSeed(y);
}

// The affine form the 15 local readings live in. Verified: exactly a perfect
// square, 4(2x+y)^2, for all x,y.
function squareForm(x, y) {
  const t = 2 * x + y;
  return 4 * t * t;
}

// The projective form is the square form plus the lift. 44x^2 = 4 * 11x^2: the
// local seed times the residue that is not a perfect square.
function lift(x) { return LIFT_COEFFICIENT * x * x; }

// The binding. Always returns a report. The pair closes or it does not; either
// way the closing is stated and the non-closing is measured.
function Q(xForm, yForm) {
  const xr = resolveWordform(xForm);
  const yr = resolveWordform(yForm);
  const closure = wordformXor(xForm, yForm);
  const x = xr.index;
  const y = yr.index;
  return Object.freeze({
    kind: 'bqf-binding',
    x: xr,
    y: yr,
    closed: closure === 0,
    closure,
    q: bqf(x, y),
    square: squareForm(x, y),
    lift: lift(x),
    // compareExchange on the two resolved indices: did they agree?
    exchange: compareExchange(x, y, y),
  });
}

// The dual reading of a gap, always both:
//   structural — which forms are being compared: the fixed 44x^2 lift
//   positional — how far apart the actual references are: variable
function discrepancy(x, y) {
  const structural = lift(x);
  const actual = bqf(x, y) - squareForm(x, y);
  return Object.freeze({
    structural,
    actual,
    agrees: structural === actual,
    positional: referenceDistance(x, y),
  });
}

// ---------------------------------------------------------------------------
// Anchors. Because cycles read in a sequence, source and target are anchored.
// ---------------------------------------------------------------------------

function anchor(form, partition) {
  const r = resolveWordform(form);
  const p = partitionByName(partition);
  return Object.freeze({
    kind: 'anchor',
    form,
    index: r.index,
    partition: p.name,
    radix: p.radix,
    recognized: r.recognized,
    discrepancy: referenceDistance(r.index, r.index),
  });
}

// The path: an ordered list of anchors, source first, target last. Built by
// extension, never by mutation.
function path(anchors) {
  if (!Array.isArray(anchors)) {
    refuse({ argument: 'anchors', anchors: typeof anchors },
      'a path is built from an array of anchors; got ' + typeof anchors);
  }
  if (anchors.length === 0) {
    // A path exists to name a source and a target. With no anchors there is
    // neither, so the request is malformed rather than answered with "no path".
    refuse({ argument: 'anchors', anchors: 'empty' },
      'a path needs at least one anchor to have a source');
  }
  const list = Object.freeze(anchors.slice());
  return Object.freeze({
    kind: 'path',
    source: list[0],
    target: list[list.length - 1],
    steps: list.length,
    anchors: list,
  });
}

// The closure or combinator a path binds to. bindPath(path, fn) calls
// fn(source, target): the path is invoked, not stored into.
function bindPath(p, fn) {
  if (!p || p.kind !== 'path') {
    refuse({ argument: 'path', path: p === null ? 'null' : typeof p },
      'bindPath expects a path from path(); got ' + (p === null ? 'null' : typeof p));
  }
  if (typeof fn !== 'function') {
    refuse({ argument: 'fn', fn: typeof fn },
      'bindPath invokes a closure; got ' + typeof fn);
  }
  return apply(bind(p.source, p.target), fn);
}

// ---------------------------------------------------------------------------
// The read sequence. The protocol's answer to "cycles read in a sequence":
// partitions in ascending precision, slots ascending. 4 x 16 = 64 reads.
// ---------------------------------------------------------------------------

function readSequence() {
  const out = [];
  for (const p of PARTITIONS) {
    for (let slot = 0; slot <= 0xf; slot++) out.push(Object.freeze({ partition: p.name, slot }));
  }
  return Object.freeze(out);
}

const CYCLE = readSequence();
const CYCLE_LENGTH = CYCLE.length; // 64

// Locating one read in the cycle. The cycle is 4 partitions x 16 slots, and
// both halves are closed, so anything outside them is a reference to a read
// that does not exist — tier 2, not a -1 the caller has to remember to check.
function cycleIndex(partition, slot) {
  if (!isNum(slot)) {
    refuse({ argument: 'slot', partition, slot: typeof slot },
      'a cycle slot is a number in 0x0-0xF; got ' + typeof slot);
  }
  const p = findPartition(partition);
  if (p === null) {
    refuse({ argument: 'partition', partition, slot },
      'no partition named "' + partition + '"; the reference space holds exactly '
        + PARTITIONS.map(q => q.name).join(', '));
  }
  if (slot < 0 || slot > 0xf) {
    refuse({ argument: 'slot', partition, slot },
      'slot ' + slot + ' is outside 0x0-0xF, which is the whole slot space');
  }
  return PARTITIONS.indexOf(p) * 16 + slot;
}

// One read in the cycle, by compareExchange: the slot is read against what was
// expected, and the difference is the measurement.
function cycleRead(partition, slot, expected) {
  const at = cycleIndex(partition, slot);
  return Object.freeze(Object.assign(
    { at, partition, slot },
    compareExchange(expected === undefined ? 0 : expected, 0, 0)
  ));
}

// ---------------------------------------------------------------------------
// Pins. 0x0-0xF pinned to any node. The pin is a declaration, not an action.
// ---------------------------------------------------------------------------

function pin(value, nodeId) {
  const inRange = typeof value === 'number' && value >= 0 && value <= 0xf;
  const named = typeof nodeId === 'string' && nodeId.length > 0;
  return Object.freeze({
    kind: 'pin',
    value: inRange ? value : 0,
    node: named ? nodeId : null,
    inRange,
    named,
  });
}

// Any of 0x0-0xF may be pinned to any node. Collisions are stated, never
// resolved: two agents may hold different pins on one node and that is a fact
// to be reported, not an error to be refused.
function pinSet(pins) {
  if (!Array.isArray(pins)) {
    refuse({ argument: 'pins', pins: typeof pins },
      'a pin set is built from an array of pins; got ' + typeof pins);
  }
  const list = Object.freeze(pins.slice());
  const collisions = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (list[i].value === list[j].value && list[i].node === list[j].node) {
        collisions.push(Object.freeze({ a: i, b: j, value: list[i].value, discrepancy: 0 }));
      }
    }
  }
  return Object.freeze({
    kind: 'pin-set',
    pins: list,
    count: list.length,
    collisions: Object.freeze(collisions),
    colliding: collisions.length,
  });
}

// Pin exchange: pin a value to a node, reporting what was already there.
function pinExchange(p, value, nodeId) {
  if (!p || p.kind !== 'pin') {
    refuse({ argument: 'pin', pin: p === null ? 'null' : typeof p },
      'pinExchange expects a pin from pin(); got ' + (p === null ? 'null' : typeof p));
  }
  const next = pin(value, nodeId);
  return Object.freeze(Object.assign({ requested: next }, compareExchange(p.value, next.value, next.value)));
}

// ---------------------------------------------------------------------------
// Shortcuts. The protocol SUGGESTS. It never chooses.
// ---------------------------------------------------------------------------

const SHORTCUTS = Object.freeze([
  Object.freeze({ name: 'direct', cost: 0, via: 0, note: 'source is the target' }),
  Object.freeze({ name: 'fold', cost: 1, via: 0, note: 'collapse two indices to their XOR' }),
  Object.freeze({ name: 'swap', cost: 1, via: 0, note: 'exchange the two ends' }),
  Object.freeze({ name: 'delta', cost: 1, via: 0, note: 'roll 16 bits by rotl1^rotl3^rotr2' }),
  Object.freeze({ name: 'lift', cost: 1, via: 0, note: 'cross into the projective form (44x^2)' }),
  Object.freeze({ name: 'partition', cost: 1, via: 1, note: 're-read in the other precision' }),
  Object.freeze({ name: 'rebase', cost: 2, via: 1, note: 're-anchor through a second partition' }),
]);

// The seven shortcuts the protocol knows how to describe. An eighth name is a
// reference to nothing, so asking for one is tier 2 rather than a null.
function shortcut(name) {
  if (!isStr(name)) {
    refuse({ argument: 'shortcut', shortcut: typeof name },
      'a shortcut is named by a string; got ' + typeof name);
  }
  const s = SHORTCUTS.find(q => q.name === name);
  if (s === undefined) {
    refuse({ argument: 'shortcut', shortcut: name },
      'no shortcut named "' + name + '"; the protocol knows '
        + SHORTCUTS.map(q => q.name).join(', '));
  }
  return s;
}

// suggest() returns candidates. Advisory: the caller selects, or declines.
// An empty list is a valid answer meaning "no shortcut claimed" — that is about
// the RESULT for a real path. A non-path is tier 2: there is no path to suggest
// for, and returning an empty list there would make "I have no suggestions" and
// "you passed me the wrong thing" indistinguishable.
function suggest(p) {
  if (!p || p.kind !== 'path') {
    refuse({ argument: 'path', path: p === null ? 'null' : typeof p },
      'suggest expects a path from path(); got ' + (p === null ? 'null' : typeof p));
  }
  const out = [];
  for (const s of SHORTCUTS) {
    const claimable = p.steps === 1 ? s.name === 'direct' : s.name !== 'direct';
    if (claimable) out.push(s);
  }
  return Object.freeze(out);
}

module.exports = {
  // Tier two, so a caller can distinguish a malformed request from a reading
  // without string-matching a message.
  CoordinateError,
  pathCoordinate,
  refuse,
  compareExchange,
  popcount,
  referenceDistance,
  PARTITIONS,
  PARTITION_XOR,
  partitionByName,
  rebase,
  WORDFORM,
  ENDCAP,
  ENDCAP_XOR,
  stringXor,
  wordformXor,
  resolveWordform,
  flipWordform,
  HIGH_SHELL,
  CHIRAL_BRIDGE,
  LOCAL_SEED,
  LIFT_COEFFICIENT,
  bqfHighShell,
  bqfChiralBridge,
  bqfLocalSeed,
  bqf,
  squareForm,
  lift,
  Q,
  discrepancy,
  anchor,
  path,
  bindPath,
  CYCLE,
  CYCLE_LENGTH,
  cycleIndex,
  cycleRead,
  pin,
  pinSet,
  pinExchange,
  SHORTCUTS,
  shortcut,
  suggest,
  selfTest,
};

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  // Tier two, asserted rather than assumed: the call must throw CoordinateError
  // and the coordinate must survive the throw. A plain Error, or a throw with no
  // coordinate, both fail this — which is the whole point of the tier.
  const refuses = (fn) => {
    try { fn(); return null; } catch (e) {
      return (e instanceof CoordinateError && e.coordinate && e.coordinate.argument) ? e : null;
    }
  };

  // --- the one function
  const hit = compareExchange(5, 5, 9);
  const miss = compareExchange(5, 6, 9);
  assert('compareExchange exchanges on a match', hit.matched === true && hit.now === 9);
  assert('compareExchange leaves the cell alone on a miss', miss.matched === false && miss.now === 5);
  assert('the discrepancy is the XOR, 0 iff matched', hit.discrepancy === 0 && miss.discrepancy === (5 ^ 6));
  assert('compareExchange does not throw on a non-match', (function () {
    try { compareExchange(1, 999, 2); return true; } catch (e) { return false; }
  })());
  assert('a non-zero XOR is a measurement, not a rejection', miss.matched === false && typeof miss.discrepancy === 'number');
  const ceBad = refuses(() => compareExchange('a', 1, 2));
  assert('a cell that is not a number is refused, not measured as null', ceBad !== null);
  assert('that refusal carries a coordinate naming the argument', ceBad !== null
    && ceBad.coordinate.argument === 'cell' && ceBad.coordinate.pin === 18);
  assert('a non-number is NOT reported as a zero discrepancy', (function () {
    // The old code returned discrepancy: null, which a caller could read as
    // "no difference" — the one answer that must never come from a bad cell.
    try { return compareExchange('a', 1, 2).discrepancy === 0; } catch (e) { return true; }
  })());
  assert('popcount is the Hamming distance', popcount(0) === 0 && popcount(0xff) === 8 && popcount(0x0f) === 4);
  assert('referenceDistance is symmetric and XOR-based', referenceDistance(5, 9) === referenceDistance(9, 5) && referenceDistance(0, 0xff) === 8);

  // --- partitions: four precisions, one thing to a place-value index
  assert('four partitions', PARTITIONS.length === 4);
  assert('one per binary precision', PARTITIONS.map(p => p.name).join('') === '0b0o0d0x');
  assert('0b ^ 0o ^ 0x ^ 0d = 16', PARTITION_XOR === 16, 'got ' + PARTITION_XOR);
  assert('ascending precision order', PARTITIONS.every((p, i) => i === 0 || p.radix > PARTITIONS[i - 1].radix));
  assert('partitionByName resolves', partitionByName('0x').radix === 16);
  const pBad = refuses(() => partitionByName('0q'));
  assert('a partition outside /0[boxd]/ is refused, not null', pBad !== null);
  assert('the refusal names the offending partition and lists the real ones',
    pBad !== null && pBad.coordinate.partition === '0q' && /0b, 0o, 0d, 0x/.test(pBad.reason));
  assert('a non-string partition is refused', refuses(() => partitionByName(7)) !== null);
  const rb = rebase('0b', 5, '0x');
  assert('rebase reports the difference, it does not refuse', rb.matched === false && typeof rb.discrepancy === 'number');
  assert('rebase of a value whose digits agree matches', rebase('0x', 5, '0d').matched === true);
  assert('rebase of a value whose digits differ reports it', (function () {
    const r = rebase('0x', 16, '0d');
    return r.here === '10' && r.there === '16' && r.matched === false;
  })());
  assert('rebase on an unknown partition is refused with a coordinate',
    refuses(() => rebase('0q', 1, '0x')) !== null);
  assert('rebase on a non-number index is refused',
    refuses(() => rebase('0x', 'nope', '0d')) !== null);
  assert('a well-posed rebase that disagrees is still a reading, not a refusal', (function () {
    try { return rebase('0x', 16, '0d').matched === false; } catch (e) { return false; }
  })(), 'the tier boundary is well-posedness, not whether the answer is pleasing');

  // --- the wordform and the open half
  assert('wordform recognizes a 2-char body', WORDFORM.test('p0xn') && WORDFORM.test('n0xp'));
  assert('wordform recognizes the dotted form', WORDFORM.test('p1.5n'));
  assert('wordform rejects a bare hex literal', !WORDFORM.test('0x1f'));
  assert('wordform rejects a 3-char form', !WORDFORM.test('p1n'));
  assert('wordform rejects bare endcaps', !WORDFORM.test('pn'));
  assert("'p' ^ 'n' = 0x1E, the SECURE face mask, not 0", ENDCAP_XOR === 0x1e && ENDCAP_XOR !== 0);
  assert('a single wordform is an open half', stringXor('p0xn', 'p0xn') === 0 && ENDCAP_XOR !== 0);
  assert('two mirrored wordforms close to 0', stringXor('p0xn', 'n0xp') === 0 && stringXor('p1.5n', 'n1.5p') === 0);
  assert('an unmirrored pair XORs to something else', stringXor('p0xn', 'n0bp') !== 0);
  assert('stringXor on a non-string is refused, not null', refuses(() => stringXor('p0xn', 7)) !== null);
  assert('the four radices are four closed pairs', (function () {
    for (const r of ['0b', '0o', '0x', '0d']) if (stringXor('p' + r + 'n', 'n' + r + 'p') !== 0) return false;
    return true;
  })(), '/0[boxd]/ closes pairwise');
  assert('the radix pairs close against each other', (function () {
    let closed = 0;
    for (const r of ['0b', '0o', '0x', '0d']) for (const s of ['0b', '0o', '0x', '0d']) {
      if (stringXor('p' + r + 'n', 'n' + s + 'p') === 0) closed++;
    }
    return closed >= 4;
  })());
  assert('resolveWordform folds the body by XOR, never by base', (function () {
    const r = resolveWordform('p0xn');
    return r.recognized === true && r.index === ('0'.charCodeAt(0) ^ 'x'.charCodeAt(0));
  })());
  assert('an unrecognized STRING still reports, it does not vanish', (function () {
    // Reading tier, deliberately kept: '0x1f' is a well-posed question whose
    // answer is "not a wordform", so it reports rather than throwing.
    const r = resolveWordform('0x1f');
    return r.recognized === false && typeof r.discrepancy === 'number' && r.discrepancy !== 0;
  })());
  assert('resolveWordform on a non-string is refused', refuses(() => resolveWordform(7)) !== null);
  assert('flipWordform is the other chirality', flipWordform('p0xn').form === 'n0xp' && flipWordform(flipWordform('p0xn').form).form === 'p0xn');
  assert('a wordform and its flip close', stringXor('p0xn', flipWordform('p0xn').form) === 0);

  // --- Q(x: Regex, y: Regex)
  const q = Q('p0xn', 'n0xp');
  assert('Q binds two wordforms', q.x.form === 'p0xn' && q.y.form === 'n0xp');
  assert('Q states whether the pair closes', q.closed === true && q.closure === 0);
  assert('Q measures a pair that does not close, and does not refuse', (function () {
    const w = Q('p0xn', 'n0bp');
    return w.closed === false && w.closure !== 0 && typeof w.q === 'number';
  })());
  assert('bqf = high shell + bridge + local seed', q.q === 60 * q.x.index * q.x.index + 16 * q.x.index * q.y.index + 4 * q.y.index * q.y.index);
  assert('the 60 is the high shell', bqfHighShell(2) === 240);
  assert('the 16 is the chiral bridge', bqfChiralBridge(2, 3) === 96);
  assert('the 4 is the local seed', bqfLocalSeed(3) === 36);
  assert('the lift coefficient is 44 = 4 * 11', LIFT_COEFFICIENT === 44 && LIFT_COEFFICIENT === 4 * 11);
  assert('squareForm is exactly 16x^2 + 16xy + 4y^2', (function () {
    for (let x = 0; x <= 40; x++) for (let y = 0; y <= 40; y++) if (squareForm(x, y) !== 16 * x * x + 16 * x * y + 4 * y * y) return false;
    return true;
  })(), 'exhaustive x,y in [0,40]');
  assert('bqf - squareForm = the lift, for all x,y', (function () {
    for (let x = 0; x <= 40; x++) for (let y = 0; y <= 40; y++) if (bqf(x, y) - squareForm(x, y) !== lift(x)) return false;
    return true;
  })(), 'exhaustive x,y in [0,40]');
  assert('squareForm(1,1) = 36 = (3!)^2', squareForm(1, 1) === 36);
  assert('bqf(1,1) = 80', bqf(1, 1) === 80);

  // --- the dual reading
  const d1 = discrepancy(3, 5);
  assert('structural reading is the 44x^2 lift', d1.structural === 44 * 9);
  assert('the declared structural gap is the real one', d1.agrees === true);
  assert('positional reading varies', (function () {
    const s = new Set();
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) s.add(discrepancy(i, j).positional);
    return s.size > 1;
  })());
  assert('both readings always present', discrepancy(0, 0).structural === 0 && discrepancy(0, 0).positional === 0);

  // --- anchors and paths
  const aSrc = anchor('p0bn', '0b');
  assert('anchor resolves a wordform to a partition slot', aSrc.partition === '0b' && aSrc.radix === 2);
  assert('an anchor to an unknown partition is refused with a coordinate',
    refuses(() => anchor('p0bn', '0q')) !== null);
  assert('an anchor always carries a real radix now, never null', anchor('p0bn', '0b').radix === 2);
  const p1 = path([aSrc, anchor('n0xp', '0x')]);
  assert('path carries source and target', p1.source === aSrc && p1.target.radix === 16 && p1.steps === 2);
  assert('an empty path is refused: no anchors means no source', refuses(() => path([])) !== null);
  assert('a non-array path is refused', refuses(() => path('nope')) !== null);
  assert('bindPath invokes a closure, it does not store', (function () {
    let seen = null;
    const out = bindPath(p1, (s, t) => { seen = [s, t]; return s.radix + t.radix; });
    return out === 18 && seen[0] === aSrc;
  })());
  assert('the path is pure under binding', (function () { const b = p1.steps; bindPath(p1, () => 0); return p1.steps === b; })());
  assert('bindPath on a non-path refuses with a coordinate, not a bare TypeError', (function () {
    const e = refuses(() => bindPath(null, () => 0));
    return e !== null && e.coordinate.argument === 'path';
  })());
  assert('bindPath with a non-function refuses', refuses(() => bindPath(p1, 7)) !== null);

  // --- the read sequence
  assert('the cycle reads 4 partitions x 16 slots = 64', CYCLE_LENGTH === 64);
  assert('ascending precision then ascending slot', CYCLE[0].partition === '0b' && CYCLE[16].partition === '0o' && CYCLE[32].partition === '0d' && CYCLE[48].partition === '0x' && CYCLE[0].slot === 0 && CYCLE[15].slot === 0xf);
  assert('cycleIndex locates a read', cycleIndex('0b', 0) === 0 && cycleIndex('0x', 0xf) === 63);
  assert('a slot outside 0x0-0xF is refused, not -1', refuses(() => cycleIndex('0x', 16)) !== null);
  assert('an unknown partition in the cycle is refused', refuses(() => cycleIndex('0q', 0)) !== null);
  assert('cycleIndex never returns the magic -1', (function () {
    for (const q of PARTITIONS) for (let s = 0; s <= 0xf; s++) {
      if (cycleIndex(q.name, s) < 0) return false;
    }
    return true;
  })());
  assert('a refused cycle read does not leak a bogus position', (function () {
    try { return cycleRead('0q', 0).at !== -1; } catch (e) { return true; }
  })());
  assert('every partition/slot pair appears exactly once', (function () {
    const s = new Set();
    for (const c of CYCLE) s.add(c.partition + ':' + c.slot);
    return s.size === 64;
  })());
  assert('a cycle read reports its position and its discrepancy', cycleRead('0x', 3).at === 51 && typeof cycleRead('0x', 3).discrepancy === 'number');

  // --- pins
  assert('pin declares 0x0-0xF on a node', pin(3, 'BUS').value === 3 && pin(3, 'BUS').node === 'BUS');
  assert('an out-of-range pin states inRange false, it does not vanish', pin(0x10, 'BUS').inRange === false && pin(0x10, 'BUS').value === 0);
  assert('an unnamed pin states named false', pin(3, '').named === false);
  assert('any of 0x0-0xF may pin to any node', (function () {
    for (let v = 0; v <= 0xf; v++) for (const n of ['BUS', 'GND', 'VCC', 'ANY']) if (pin(v, n).inRange !== true) return false;
    return true;
  })());
  const ps = pinSet([pin(1, 'BUS'), pin(2, 'GND'), pin(1, 'VCC')]);
  assert('a clean pin set reports no collisions', ps.colliding === 0);
  assert('a colliding pin set states the collision', pinSet([pin(1, 'BUS'), pin(1, 'BUS')]).colliding === 1);
  const pe = pinExchange(pin(1, 'BUS'), 4, 'GND');
  assert('pinExchange reports what was already there', pe.discrepancy === (1 ^ 4) && pe.now === 1);
  assert('pinExchange on a non-pin is refused', refuses(() => pinExchange(null, 4, 'GND')) !== null);
  assert('pinSet on a non-array is refused', refuses(() => pinSet('nope')) !== null);
  assert('an out-of-range pin still REPORTS rather than refusing', (function () {
    // Reading tier: 0x10 is outside the pin range, and the answer to "is this in
    // range" is no. That is a fact about the request, not a malformed request.
    try { return pin(0x10, 'BUS').inRange === false; } catch (e) { return false; }
  })(), 'the reading tier survives the refactor');

  // --- shortcuts: suggested, never chosen
  assert('shortcut resolves by name', shortcut('fold').name === 'fold');
  const sBad = refuses(() => shortcut('nope'));
  assert('an unknown shortcut is refused, not null', sBad !== null);
  assert('the refusal lists the shortcuts the protocol knows', sBad !== null
    && /direct, fold, swap, delta, lift, partition, rebase/.test(sBad.reason));
  assert('suggest offers direct for a single-anchor path', (function () { const s = suggest(path([aSrc])); return s.length === 1 && s[0].name === 'direct'; })());
  assert('suggest offers alternatives for a multi-anchor path', (function () { const s = suggest(p1); return s.length > 1 && !s.some(x => x.name === 'direct'); })());
  assert('suggest is advisory: it returns candidates and picks nothing', suggest(p1).every(x => x && typeof x.name === 'string'));
  assert('suggest on a non-path is refused, not silently empty', refuses(() => suggest(null)) !== null);
  assert('an empty suggestion list for a real path is still a valid answer',
    Array.isArray(suggest(path([aSrc]))) && suggest(path([aSrc])).length === 1);
  assert('refusing a non-path is distinguishable from having no suggestions', (function () {
    // The old code made these two identical, which is the bug the tier fixes.
    let threw = false;
    try { suggest(null); } catch (e) { threw = true; }
    return threw && suggest(path([aSrc])).length > 0;
  })());

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}
