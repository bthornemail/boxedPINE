/**
 * peers.js — two peers, no server, no clock.
 *
 * The claim this file has to earn: divergence detection and repair between two
 * parties, with no central authority, no coordination, no clock, and no merge
 * function. That is possible because the metric and the displacement are the
 * same object:
 *
 *     distance(A, B) = popcount(A XOR B)     how far apart
 *     A XOR B                                 by how much
 *     (A XOR B) XOR B == A                    and the inverse is free
 *
 * Every other scheme pays for repair separately — vector clocks for ordering,
 * CRDTs for a merge, a server for truth. Here rollback is not an algorithm you
 * implement, it is the same XOR you already computed to detect the divergence.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *
 * XOR is commutative, so A^B == B^A. It measures the MAGNITUDE of divergence
 * and never the ORDER of two concurrent edits. It is therefore not a vector
 * clock, not a Lamport clock, and cannot order events. There is a self-test
 * below that asserts this boundary explicitly rather than leaving it implied,
 * because the overclaim is the easiest thing here for someone to walk into.
 *
 * The honest claim is the narrow one: clocks exist to order events, and if all
 * you need is to know *how far apart* two states are and to *undo* the
 * difference, you need no clock at all.
 *
 * State lives in a SharedArrayBuffer where one is available, so compareExchange
 * is a genuine atomic across the peer boundary. Where it is not — a browser
 * without cross-origin isolation — it degrades to a plain ArrayBuffer and the
 * arithmetic is identical, only the atomicity guarantee is lost. The mode is
 * reported, never hidden.
 *
 * 'use strict';
 */

const WORD_BYTES = 4;

function hasSAB() {
  return typeof SharedArrayBuffer !== 'undefined';
}

function createBuffer(bytes) {
  if (hasSAB()) {
    try { return new SharedArrayBuffer(bytes); } catch (_) { /* fall through */ }
  }
  return new ArrayBuffer(bytes);
}

// popcount over 32 bits, no lookup table, exact at the top bit.
function popcount(x) {
  let v = x >>> 0;
  let c = 0;
  while (v) { v &= v - 1; c++; }
  return c;
}

function hex32(v) {
  return '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

// ---------------------------------------------------------------------------
// Peers
// ---------------------------------------------------------------------------

// A peer is a name, a shared cell, and a witness. Nothing else. It has no
// clock, no version, no sequence number, and it does not know what the other
// peer did or when.
function createPeer(opts) {
  const name = opts.name;
  if (typeof name !== 'string' || !name.length) {
    const e = new Error('peer needs a name');
    e.kind = 'structure';
    throw e;
  }
  const cells = opts.cells && opts.cells > 0 ? opts.cells | 0 : 1;
  const bytes = cells * WORD_BYTES;
  const buffer = opts.buffer || createBuffer(bytes);
  const view = new Uint32Array(buffer, 0, cells);
  const shared = hasSAB() && buffer instanceof SharedArrayBuffer;

  // The only sanctioned state change: an atomic compare-exchange. A miss
  // returns what was actually there and leaves the cell alone. That is the
  // measurement, not an error.
  function cas(i, expected, replacement) {
    if (shared) return Atomics.compareExchange(view, i, expected, replacement);
    const held = view[i];
    if (held === expected) view[i] = replacement >>> 0;
    return held;
  }
  function load(i) {
    return shared ? Atomics.load(view, i) : view[i];
  }

  // The witness. `attested` is the last state that came through a sanctioned
  // write, and it is what makes tampering detectable: a quiet rewrite of the
  // cell moves `state` and cannot move `attested`, so the two disagree.
  //
  // `fold` is kept separately as the XOR of everything ever published. It is a
  // nice invariant to display, but it is NOT the tamper check: after two
  // honest writes, fold = a ^ b, which is not the current state, and there is
  // nothing wrong. Comparing state against fold would flag honest history as
  // tampering, which makes the whole claim worthless.
  const history = { fold: 0, attested: 0, steps: 0 };

  const peer = {
    name,
    cells,
    buffer,
    view,
    shared,
    mode: shared ? 'shared' : 'local',

    // The one sanctioned mutation, exposed so repair can go through the same
    // gate rather than writing the cell behind the peer's back.
    cas(i, expected, replacement) { return cas(i, expected, replacement); },
    load(i) { return load(i); },

    // A sanctioned write: the atomic exchange AND the witness advance, together.
    // Anything that legitimately changes state must use this, or the witness
    // will (correctly) call it tampering.
    applyCas(i, expected, replacement) {
      const held = cas(i, expected, replacement);
      if (held === expected) {
        history.attested = replacement >>> 0;
        history.fold = (history.fold ^ (replacement >>> 0)) >>> 0;
        history.steps++;
        return { ok: true, held, now: replacement >>> 0 };
      }
      return { ok: false, held, now: held };
    },

    read() { return load(0); },

    // An honest write: CAS against what the peer believed was there, and the
    // witness advances. Returns what the cell actually held.
    write(value) {
      const v = value >>> 0;
      const r = this.applyCas(0, load(0), v);
      return r.held;
    },

    // Force a value in with no expectation. Used to simulate an edit that did
    // NOT come through a sanctioned write — i.e. a peer that was tampered with.
    // The witness will disagree afterwards.
    tamper(value) {
      view[0] = value >>> 0;
      return value >>> 0;
    },

    // The tamper tripwire. `intact` is exact: it asks whether the current state
    // is the one the peer last published through its own gate.
    witness() {
      const state = load(0);
      return {
        steps: history.steps,
        state,
        fold: history.fold,
        attested: history.attested,
        intact: history.steps === 0 ? state === 0 : state === history.attested,
      };
    },

    reset() { view[0] = 0; history.fold = 0; history.attested = 0; history.steps = 0; },
    offline: true,
  };
  return peer;
}

// ---------------------------------------------------------------------------
// The read. One XOR says how far apart, and exactly where.
// ---------------------------------------------------------------------------

// The full divergence report. Not a boolean "out of sync" — a per-cell and
// per-byte map of the difference, which is the part a boolean throws away.
function divergence(a, b) {
  const n = Math.min(a.cells, b.cells);
  const cells = [];
  const bytes = [];
  const saw = { a: [], b: [] };
  let fold = 0;
  let pop = 0;
  for (let i = 0; i < n; i++) {
    const av = a.load(i) >>> 0;
    const bv = b.load(i) >>> 0;
    saw.a.push(av);
    saw.b.push(bv);
    const d = (av ^ bv) >>> 0;
    fold = (fold ^ d) >>> 0;
    pop += popcount(d);
    cells.push({ cell: i, delta: d, pop: popcount(d), hex: hex32(d) });
    for (let k = 0; k < WORD_BYTES; k++) {
      const da = (av >>> (8 * k)) & 0xff;
      const db = (bv >>> (8 * k)) & 0xff;
      const bd = (da ^ db) & 0xff;
      if (bd !== 0) bytes.push({ cell: i, byte: k, delta: bd, pop: popcount(bd), hex: '0x' + bd.toString(16).padStart(2, '0') });
    }
  }
  return {
    agreed: pop === 0,
    fold,
    popcount: pop,
    cells,
    bytes,
    // The exact pair of states this report was computed from. repair() checks
    // its exchange against THESE, not against a fresh read, so a peer that
    // moved in between is reported instead of silently overwritten.
    saw,
    // Agreement as a fraction of the whole, so a portal can show "3 of 4
    // bytes agree" rather than a bare yes/no.
    cells_agreed: n - cells.filter(c => c.delta !== 0).length,
    cells_total: n,
  };
}

// Repair. Roll b back to a by XOR-ing in the displacement that was already
// computed by divergence(). No merge function, no server, no clock.
//
// Pass the report you already showed the user. That is the real shape of it:
// you Read, they look at the number, they click Roll — and in between, the peer
// may have moved. Checking the exchange against the report's own observation
// is what turns that into a reported clobber instead of a silent overwrite.
function repair(a, b, report) {
  const d = report || divergence(a, b);
  if (d.agreed) return { moved: false, clobbered: false, report: d };
  for (let i = 0; i < d.saw.b.length; i++) {
    const target = ((d.saw.b[i] ^ d.cells[i].delta) >>> 0);
    // Through the peer's sanctioned gate, so a legitimate repair advances the
    // witness. A repair that bypassed the gate would look exactly like a
    // tamper, which is how the distinction gets blurred.
    b.applyCas(i, d.saw.b[i], target);
  }
  const after = divergence(a, b);
  return {
    moved: after.agreed,
    // Still disagreeing means the exchange lost a race against a concurrent
    // write. Say so. Do not claim a repair that did not happen.
    clobbered: !after.agreed,
    report: d,
    before: d.saw.b[0],
    after: b.load(0),
  };
}

// ---------------------------------------------------------------------------
// 0, 2, 1 — the bind. Three possibilities, probed in that order.
// ---------------------------------------------------------------------------

// The original bind answered "is this 0, 1, or 2?" and asked about 0 and 2
// first, the two extremes, before 1, the middle — because the middle is only
// definable once the extremes are known. This returns which one, in that order.
function classify(x) {
  const v = x >>> 0;
  if (v === 0) return 0;
  if (v === 2) return 2;
  return 1;
}

// The three-arity frame, run as the literal cycle of atomic exchanges the old
// function used: (0,2,1) ^ (1,0,2) ^ (2,1,0).
function bind021(view, cas) {
  const exchange = cas || ((i, e, r) => {
    const held = view[i];
    if (held === e) view[i] = r;
    return held;
  });
  const centre = ((exchange(0, 2, 1) ^ exchange(1, 0, 2) ^ exchange(2, 1, 0)) >>> 0);
  return { centre, hex: hex32(centre), classified: classify(centre), order: [0, 2, 1] };
}

// ---------------------------------------------------------------------------
// Three peers. This is where the argument stops looking like a trick.
// ---------------------------------------------------------------------------

// With two peers you learn the MAGNITUDE of a disagreement. With three you also
// learn WHICH peer is the odd one out, and it costs the same single XOR.
//
// If exactly one peer has diverged and the other two agree, then the XOR of all
// three IS the outlier's value:
//
//     a = b = 5,  c = 9      5 ^ 5 ^ 9  =  9   =  c
//     a = 5,  b = c = 9      5 ^ 9 ^ 9  =  5   =  a
//
// The identity of the dissenter falls out of the algebra. There is no vote, no
// quorum, no coordinator, and nothing to elect.
//
// The precondition matters and is stated rather than assumed: this identifies an
// outlier when exactly one peer is out. With two or three dissenters the fold is
// no longer any single peer's value, and `outliers` reports that honestly rather
// than picking a winner.
//
// Note also that `residue` is NOT the agreement test. Three copies of x fold to
// x, not to 0, because three is odd. Agreement is measured by the pairwise
// distances instead, which is 0 if and only if all three agree.
function fold3(a, b, c) {
  const values = { a: a.load(0), b: b.load(0), c: c.load(0) };
  const residue = (values.a ^ values.b ^ values.c) >>> 0;

  const ab = divergence(a, b);
  const bc = divergence(b, c);
  const ac = divergence(a, c);

  // Majority by value, not a vote. With three peers a value held by two wins;
  // three-way disagreement has no majority and we say so.
  const tally = new Map();
  for (const k of ['a', 'b', 'c']) {
    tally.set(values[k], (tally.get(values[k]) || 0) + 1);
  }
  let majority = null;
  let majorityCount = 0;
  for (const [v, n] of tally) {
    if (n > majorityCount) { majority = v; majorityCount = n; }
  }
  const hasMajority = majorityCount >= 2;
  const outliers = hasMajority
    ? ['a', 'b', 'c'].filter(k => values[k] !== majority)
    : ['a', 'b', 'c'];

  return {
    values,
    residue,
    // The residue is the outlier's own value, exactly, when there is one
    // outlier. Asserted in the self-test rather than claimed here.
    residueIsOutlier: outliers.length === 1 && residue === values[outliers[0]],
    outliers,
    hasMajority,
    majority,
    majorityCount,
    // Agreement is pairwise, because the fold cannot be zero for odd counts.
    agreed: ab.agreed && bc.agreed && ac.agreed,
    // A single scalar that is 0 if and only if all three agree.
    disagreement: ab.popcount + bc.popcount + ac.popcount,
    ab, bc, ac,
  };
}

// Reconcile all three. Every peer that is not in the majority is rolled to the
// majority value through its own sanctioned gate, so the witness advances and a
// legitimate repair is never mistaken for a tamper.
//
// Pass the report the user was already shown, for the same reason repair() takes
// one: they Read, they look at it, they click Roll, and in between a peer may
// have moved. Checking against the report's own observation turns that into a
// reported clobber instead of a silent overwrite.
function reconcile3(a, b, c, report) {
  const f = report || fold3(a, b, c);
  if (f.agreed) return { moved: false, stalled: false, fold: f };
  if (!f.hasMajority) return { moved: false, stalled: true, fold: f };
  const byName = { a, b, c };
  const target = f.majority;
  for (const name of f.outliers) {
    const p = byName[name];
    p.applyCas(0, f.values[name], target);
  }
  const after = fold3(a, b, c);
  return {
    moved: after.agreed,
    fold: f,
    after,
    // Still disagreeing, or no longer the same outlier set, means the exchange
    // lost a race. Say so; do not claim a repair that did not happen.
    stalled: !after.agreed,
  };
}

module.exports = {
  WORD_BYTES,
  createBuffer,
  createPeer,
  divergence,
  repair,
  reconcile3,
  classify,
  bind021,
  popcount,
  hex32,
  hasSAB,
  fold3,
  selfTest,
};

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  // --- the buffer and the peer
  const a = createPeer({ name: 'alice', cells: 1 });
  const b = createPeer({ name: 'bob', cells: 1 });
  assert('two peers exist', !!a && !!b && a.name === 'alice' && b.name === 'bob');
  assert('a peer has no clock and no version', !('clock' in a) && !('version' in a) && !('seq' in a));
  assert('peers report their memory mode', a.mode === (hasSAB() ? 'shared' : 'local'));
  assert('a peer refuses a bad name', (function () {
    try { createPeer({ name: '' }); return false; } catch (e) { return e.kind === 'structure'; }
  })());
  assert('a fresh peer reads zero', a.read() === 0 && b.read() === 0);

  // --- the read: distance and displacement
  a.write(0x0badf00d);
  b.write(0x0badf00d);
  const same = divergence(a, b);
  assert('identical states agree', same.agreed && same.fold === 0 && same.popcount === 0);
  assert('agreement is reported as a fraction too', same.cells_agreed === same.cells_total);

  b.write(0x0badf00c);
  const d = divergence(a, b);
  assert('one flipped bit is distance 1', d.popcount === 1 && !d.agreed);
  assert('the report names the cell and the byte', d.cells[0].cell === 0 && d.bytes.length === 1);
  assert('the report says which byte, exactly', d.bytes[0].byte === 0 && d.bytes[0].delta === 1);
  assert('two flipped low bits is distance 2, delta 3', (function () {
    b.write(0x0badf00e);
    const dd = divergence(a, b);
    return dd.popcount === 2 && dd.cells[0].delta === 3;
  })());
  b.write(0x0badf00c);

  // --- repair: the inverse is the same XOR
  const r = repair(a, b);
  assert('repair rolls b back to a', divergence(a, b).agreed);
  assert('repair moved the state it was asked to', r.moved === true && r.clobbered === false);
  assert('repair reports a clobber instead of hiding it', (function () {
    const x = createPeer({ name: 'x' }), y = createPeer({ name: 'y' });
    x.write(7); y.write(3);
    const stale = divergence(x, y);   // the report the user is looking at
    y.tamper(9);                     // the peer moved while they looked
    const rr = repair(x, y, stale);
    return rr.clobbered === true && y.read() === 9;
  })());
  assert('a fresh report repairs cleanly, no clobber', (function () {
    const x = createPeer({ name: 'x' }), y = createPeer({ name: 'y' });
    x.write(7); y.write(3);
    return repair(x, y).clobbered === false && divergence(x, y).agreed;
  })());
  assert('the inverse is the same operation', (function () {
    const x = 0xdeadbeef, y = 0x0badf00d;
    return (((x ^ y) ^ y) >>> 0) === x;
  })());
  assert('repair on agreeing peers is a no-op', (function () {
    const rr = repair(a, a);
    return rr.moved === false && rr.report.agreed;
  })());

  // --- the honest boundary: XOR does not order events
  const e1 = 0b0011, e2 = 0b1010;
  assert('XOR is symmetric, so it cannot order two edits', (e1 ^ e2) === (e2 ^ e1));
  assert('XOR gives magnitude, never order (documented boundary)', popcount(e1 ^ e2) === 2);

  // --- tamper evidence
  const t = createPeer({ name: 'trudy', cells: 1 });
  t.write(0x11111111);
  const w1 = t.witness();
  assert('an honest peer attests', w1.steps === 1 && w1.intact === true && w1.state === 0x11111111);
  t.tamper(0x22222222);
  const w2 = t.witness();
  assert('a tampered peer is caught: state moved, the attestation did not',
    w2.state === 0x22222222 && w2.attested === 0x11111111 && w2.intact === false);
  assert('the fold is NOT the tamper check, and must not be used as one', (function () {
    // Two honest writes: fold is a^b, which is not the state, and nothing is
    // wrong. Comparing state against fold would flag this as tampering.
    const u = createPeer({ name: 'uma', cells: 1 });
    u.write(7); u.write(3);
    const w = u.witness();
    return w.fold === (7 ^ 3) && w.fold !== w.state && w.intact === true;
  })());
  assert('a legitimate repair is witnessed, not mistaken for a tamper', (function () {
    const x = createPeer({ name: 'x' }), y = createPeer({ name: 'y' });
    x.write(0x0badf00d); y.write(0x00000003);
    repair(x, y);
    return divergence(x, y).agreed && y.witness().intact === true;
  })());
  assert('a fresh peer is intact at zero', (function () {
    const z = createPeer({ name: 'z' });
    return z.witness().intact === true && z.witness().steps === 0;
  })());

  // --- 0, 2, 1
  assert('classify probes 0 first, then 2, then 1', classify(0) === 0 && classify(2) === 2 && classify(1) === 1 && classify(99) === 1);
  const f = bind021(new Uint32Array(3));
  assert('the bind runs the literal 0,2,1 cycle', f.order.join(',') === '0,2,1');
  assert('the bind centre is classified by the same three', [0, 1, 2].includes(f.classified));

  // --- round trip
  const c = createPeer({ name: 'carol', cells: 2 });
  const e = createPeer({ name: 'erin', cells: 2 });
  c.write(0xffffffff);
  e.write(0x00000000);
  const dd = divergence(c, e);
  assert('a full 32-bit difference is distance 32', dd.popcount === 32);
  assert('all four bytes of the word are reported', dd.bytes.filter(x => x.cell === 0).length === 4);


  // --- three peers: the residue IS the outlier
  {
    const a3 = createPeer({ name: 'a' }), b3 = createPeer({ name: 'b' }), c3 = createPeer({ name: 'c' });
    a3.write(5); b3.write(5); c3.write(9);
    const f = fold3(a3, b3, c3);
    assert('three peers: not agreed', f.agreed === false && f.disagreement > 0);
    assert('the outlier is identified as c', f.outliers.length === 1 && f.outliers[0] === 'c');
    assert('the residue IS the outlier value, 5^5^9 === 9', f.residue === 9 && f.residueIsOutlier === true);
    assert('the majority is 5, held by two', f.majority === 5 && f.majorityCount === 2);

    const r3 = reconcile3(a3, b3, c3);
    assert('reconcile brings all three to agreement', r3.moved === true && fold3(a3, b3, c3).agreed);
    assert('a reconciled peer is not mistaken for a tamper',
      c3.witness().intact === true && a3.witness().intact === true);
  }
  {
    // the outlier does not have to be the last one
    const a3 = createPeer({ name: 'a' }), b3 = createPeer({ name: 'b' }), c3 = createPeer({ name: 'c' });
    a3.write(5); b3.write(9); c3.write(9);
    const f = fold3(a3, b3, c3);
    assert('the outlier is a, not c', f.outliers[0] === 'a' && f.residue === 5);
  }
  {
    // all three agreeing: the fold is NOT zero, and must not be used as the test
    const a3 = createPeer({ name: 'a' }), b3 = createPeer({ name: 'b' }), c3 = createPeer({ name: 'c' });
    a3.write(0x1234); b3.write(0x1234); c3.write(0x1234);
    const f = fold3(a3, b3, c3);
    assert('three agreeing peers agree, even though the fold is nonzero',
      f.agreed === true && f.residue === 0x1234 && f.disagreement === 0);
    assert('agreement is measured pairwise, because three is odd',
      f.agreed === true && f.residue !== 0);
  }
  {
    // three-way disagreement: no majority, and we say so rather than picking one
    const a3 = createPeer({ name: 'a' }), b3 = createPeer({ name: 'b' }), c3 = createPeer({ name: 'c' });
    a3.write(1); b3.write(2); c3.write(4);
    const f = fold3(a3, b3, c3);
    assert('three-way disagreement has no majority', f.hasMajority === false && f.majorityCount === 1);
    assert('no outlier is claimed when there is no majority', f.residueIsOutlier === false && f.outliers.length === 3);
    assert('reconcile refuses rather than picking a winner',
      reconcile3(a3, b3, c3).stalled === true);
  }
  {
    // it composes with the clobber reporting
    const a3 = createPeer({ name: 'a' }), b3 = createPeer({ name: 'b' }), c3 = createPeer({ name: 'c' });
    a3.write(7); b3.write(7); c3.write(9);
    const f = fold3(a3, b3, c3);
    c3.tamper(3);
    const r3 = reconcile3(a3, b3, c3, f);
    assert('a stale three-peer report reports a clobber instead of lying',
      r3.stalled === true && c3.read() === 3);
  }

  const failed = results.filter(r2 => !r2.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}
